// Frame-accurate rendering: headless Edge/Chrome poses the timeline at t = f / fps,
// captures a JPEG, and pipes it straight into ffmpeg (H.264).
const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { once } = require("events");
const { pathToFileURL } = require("url");
const puppeteer = require("puppeteer-core");
const { FFMPEG } = require("./media");

const PAGE = path.join(__dirname, "..", "page", "render.html");
const CANDIDATES = [
  process.env.BROWSER,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  path.join(process.env.LOCALAPPDATA || "", "Google/Chrome/Application/chrome.exe"),
  "/usr/bin/google-chrome", "/usr/bin/chromium", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
].filter(Boolean);

function browserPath() {
  const p = CANDIDATES.find(x => fs.existsSync(x));
  if (!p) throw new Error("Google Chrome not found. Install it or set BROWSER=/path/to/chrome");
  return p;
}

// Recent Chrome captures screenshots at CSS-pixel size unless the scale factor is forced at launch.
function launch(scale) {
  return puppeteer.launch({
    executablePath: browserPath(),
    headless: true,
    pipe: true,
    protocolTimeout: 120000,
    args: [`--force-device-scale-factor=${scale || 2}`, "--hide-scrollbars", "--force-color-profile=srgb", "--allow-file-access-from-files", "--disable-background-timer-throttling",
      "--disable-renderer-backgrounding", "--disable-backgrounding-occluded-windows", "--mute-audio", "--no-first-run", "--font-render-hinting=none"]
  });
}

async function openPage(browser, scale) {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", e => errors.push(String(e)));
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  await page.setViewport({ width: 960, height: 540, deviceScaleFactor: scale });
  await page.goto(pathToFileURL(PAGE).href, { waitUntil: "networkidle0", timeout: 90000 });
  const fonts = await page.evaluate(() => window.Renderer.ready);
  const missing = Object.entries(fonts).filter(([, ok]) => !ok).map(([k]) => k);
  if (missing.length) throw new Error("Fonts failed to load (need internet for Google Fonts): " + missing.join(", "));
  if (errors.length) throw new Error("Render page errors:\n" + errors.join("\n"));
  const cdp = await page.createCDPSession();
  return { page, cdp, errors };
}

async function prepare(ctx, plan) {
  await ctx.page.evaluate(p => window.Renderer.prepare(p), plan);
  if (ctx.errors.length) throw new Error(`[${plan.id}] page errors:\n` + ctx.errors.join("\n"));
}

async function grab(ctx, t, format, quality) {
  const r = await ctx.cdp.send("Runtime.evaluate", { expression: `Renderer.seek(${t.toFixed(5)})`, returnByValue: true });
  if (r.exceptionDetails) throw new Error("seek failed: " + JSON.stringify(r.exceptionDetails).slice(0, 500));
  const { data } = await ctx.cdp.send("Page.captureScreenshot", { format, quality: format === "jpeg" ? quality : undefined, optimizeForSpeed: true });
  return Buffer.from(data, "base64");
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Windows can hold a just-closed file briefly (indexer/antivirus): retry the rename.
async function renameRetry(from, to) {
  for (let i = 0; ; i++) {
    try { return fs.renameSync(from, to); } catch (e) {
      if (i >= 20 || !["EBUSY", "EPERM", "EACCES"].includes(e.code)) throw e;
      await sleep(500);
    }
  }
}

// Render one segment's video track (no audio) → outMp4. Returns frame count.
// hooks.beforeFrame(f, frames) is awaited every 60 frames (used to pause on low battery).
// On any failure the encoder is killed and its temp file removed, so a retry starts clean.
async function renderVideo(ctx, plan, outMp4, o, hooks = {}) {
  await prepare(ctx, plan);
  const frames = Math.round(plan.total * o.fps);
  const tmp = `${outMp4}.${process.pid}-${Date.now().toString(36)}.part.mp4`;
  const enc = o.encoder === "nvenc"
    ? ["-c:v", "h264_nvenc", "-preset", "p5", "-rc", "vbr", "-cq", "21", "-b:v", "0"]
    : ["-c:v", "libx264", "-preset", o.preset || "veryfast", "-crf", String(o.crf || 20), "-tune", "animation", "-threads", String(o.threads || 3)];
  const ff = spawn(FFMPEG, ["-y", "-v", "error", "-f", "image2pipe", "-framerate", String(o.fps), "-c:v", "mjpeg", "-i", "-",
    ...enc, "-pix_fmt", "yuv420p", "-r", String(o.fps), "-g", String(o.fps * 2), "-movflags", "+faststart", tmp], { windowsHide: true });
  let err = "";
  ff.stderr.on("data", d => { err += d; });
  ff.stdin.on("error", () => { }); // EPIPE if ffmpeg dies — reported through its exit code
  const closed = new Promise(res => ff.on("close", res));
  try {
    for (let f = 0; f < frames; f++) {
      if (hooks.beforeFrame && f % 60 === 0) await hooks.beforeFrame(f, frames);
      const buf = await grab(ctx, f / o.fps, "jpeg", o.quality || 92);
      if (!ff.stdin.write(buf)) await Promise.race([once(ff.stdin, "drain"), closed]);
      if (ff.exitCode != null) break;
    }
    ff.stdin.end();
    const code = await closed;
    if (code !== 0) throw new Error("ffmpeg failed: " + err.slice(-2000));
    await renameRetry(tmp, outMp4);
    return frames;
  } catch (e) {
    ff.kill();
    await closed;
    try { fs.unlinkSync(tmp); } catch (_) { }
    throw e;
  }
}

// Close a browser that may be wedged (e.g. after the machine slept mid-capture).
async function closeBrowser(browser) {
  const proc = browser.process && browser.process();
  await Promise.race([browser.close().catch(() => { }), sleep(10000)]);
  if (proc && proc.exitCode == null) try { proc.kill("SIGKILL"); } catch (_) { }
}

async function stills(ctx, plan, dir, times) {
  await prepare(ctx, plan);
  fs.mkdirSync(dir, { recursive: true });
  const out = [];
  for (const [name, t] of times) {
    const f = path.join(dir, name + ".png");
    fs.writeFileSync(f, await grab(ctx, t, "png"));
    out.push(f);
  }
  return out;
}

module.exports = { launch, openPage, prepare, grab, renderVideo, closeBrowser, renameRetry, stills };
