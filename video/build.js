#!/usr/bin/env node
// Arabic course video builder.
//
//   node build.js script                  build narration script (out/script.json, out/narration_ar.md)
//   node build.js tts                     synthesize Arabic voice clips (edge-tts, cached)
//   node build.js plan                    measure clips and compute the exact timeline
//   node build.js stills C1.1 [...]       PNG stills per chapter for visual QA (out/stills/)
//   node build.js render [--only C1.1,S1] [--workers 5] [--fps 30]
//   node build.js assemble                join segments → full course + per-stage videos
//   node build.js all                     everything above in order
//
// Options: --voice ar-SA-HamedNeural  --rate +10%  --encoder x264|nvenc  --crf 20  --scale 2
//          render: --no-reuse (re-render instead of verifying unchanged segments)  --min-battery 30 (0 = never pause)
const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawn } = require("child_process");
const { loadCourse } = require("./lib/course");
const { buildScript, scriptMarkdown } = require("./lib/script");
const { planSegment } = require("./lib/plan");
const { probeDuration, pool, run, FFMPEG } = require("./lib/media");
const { segmentCues, toSrt } = require("./lib/subs");

const OUT = path.join(__dirname, "out");
const TTS = path.join(OUT, "tts");
const SEG = path.join(OUT, "segments");
const args = process.argv.slice(2);
const cmd = args[0];
const opt = (name, def) => { const i = args.indexOf("--" + name); return i >= 0 ? args[i + 1] : def; };
const positional = args.slice(1).filter((a, i, arr) => !a.startsWith("--") && !(i > 0 && arr[i - 1].startsWith("--")));
const O = {
  voice: opt("voice", "ar-SA-HamedNeural"),
  rate: opt("rate", "+10%"),
  fps: +opt("fps", 30),
  scale: +opt("scale", 2),
  workers: +opt("workers", Math.max(1, Math.min(6, Math.floor(os.cpus().length / 2)))),
  encoder: opt("encoder", "x264"),
  crf: +opt("crf", 20),
  quality: +opt("quality", 92)
};
fs.mkdirSync(OUT, { recursive: true });
const hash = x => require("crypto").createHash("sha1").update(JSON.stringify(x)).digest("hex").slice(0, 12);
// Timing tag: the plan without its music offset (that only affects the audio mix).
const ptagOf = p => { const { musicOffset, ...rest } = p; return hash(rest); };
const readJson = f => JSON.parse(fs.readFileSync(f, "utf8"));
const writeJson = (f, d) => fs.writeFileSync(f, JSON.stringify(d, null, 1));
const hms = s => { s = Math.round(s); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), x = s % 60; return (h ? h + ":" + String(m).padStart(2, "0") : m) + ":" + String(x).padStart(2, "0"); };

// ---------------------------------------------------------------- script
function cmdScript() {
  const script = buildScript(loadCourse(), { voice: O.voice, rate: O.rate });
  writeJson(path.join(OUT, "script.json"), script);
  fs.writeFileSync(path.join(OUT, "narration_ar.md"), scriptMarkdown(script));
  const clips = script.segments.flatMap(s => s.chapters.flatMap(c => c.clips));
  const chars = clips.reduce((a, c) => a + c.text.length, 0);
  console.log(`script: ${script.segments.length} segments, ${clips.length} voice clips, ${chars} chars (~${Math.round(chars / 10.7 / 60)} min of speech)`);
  return script;
}

// ---------------------------------------------------------------- tts
function cmdTts() {
  const script = fs.existsSync(path.join(OUT, "script.json")) ? readJson(path.join(OUT, "script.json")) : cmdScript();
  const seen = new Set(), jobs = [];
  script.segments.forEach(s => s.chapters.forEach(c => c.clips.forEach(k => { if (!seen.has(k.key)) { seen.add(k.key); jobs.push({ key: k.key, text: k.text }); } })));
  const jf = path.join(OUT, "tts_jobs.json");
  writeJson(jf, jobs);
  console.log(`tts: ${jobs.length} clips with ${script.voice}`);
  return new Promise((res, rej) => {
    const p = spawn("python", [path.join(__dirname, "tts.py"), jf, TTS, "--voice", script.voice, "--rate", script.rate, "--concurrency", "6"], { stdio: "inherit" });
    p.on("close", c => c === 0 ? res() : rej(new Error("tts failed")));
  });
}

// ---------------------------------------------------------------- plan
async function cmdPlan() {
  const script = readJson(path.join(OUT, "script.json"));
  const cacheF = path.join(TTS, "durations.json");
  const cache = fs.existsSync(cacheF) ? readJson(cacheF) : {};
  const keys = [...new Set(script.segments.flatMap(s => s.chapters.flatMap(c => c.clips.map(k => k.key))))];
  const todo = keys.filter(k => cache[k] == null);
  const missing = keys.filter(k => !fs.existsSync(path.join(TTS, k + ".mp3")));
  const partial = args.includes("--partial"); // allow planning while TTS is still running (pilot renders)
  if (missing.length && !partial) throw new Error(`${missing.length} voice clips missing — run: node build.js tts`);
  await pool(todo.filter(k => !missing.includes(k)), 8, async k => { cache[k] = await probeDuration(path.join(TTS, k + ".mp3")); });
  const est = {};
  script.segments.forEach(s => s.chapters.forEach(c => c.clips.forEach(k => { if (cache[k.key] == null) est[k.key] = k.text.length / 10.7; })));
  writeJson(cacheF, cache);
  if (missing.length) console.log(`plan: ${missing.length} clips not synthesized yet — using estimates (partial plan)`);
  let t = 0;
  const plans = script.segments.map(s => {
    const p = planSegment(s, k => cache[k.key] != null ? cache[k.key] : est[k.key]);
    p.musicOffset = +(t % 64).toFixed(3);
    t += p.total;
    return p;
  });
  writeJson(path.join(OUT, "plan.json"), plans);
  console.log(`plan: ${plans.length} segments, total ${hms(t)} (${(t / 60).toFixed(1)} min)`);
  return plans;
}

const loadPlans = () => readJson(path.join(OUT, "plan.json"));
function select(plans, only) {
  if (!only) return plans;
  const want = only.split(",").map(s => s.trim()).filter(Boolean);
  return plans.filter(p => want.some(w => p.id === w || p.lesson === w || p.stage === w || p.module === w || p.id.endsWith("-" + w)));
}

// ---------------------------------------------------------------- stills (visual QA)
async function cmdStills() {
  const { launch, openPage, stills } = require("./lib/render");
  const plans = select(loadPlans(), positional.join(",") || "C1.1");
  const browser = await launch(O.scale);
  try {
    const ctx = await openPage(browser, O.scale);
    for (const p of plans) {
      const times = [];
      p.chapters.forEach((c, i) => {
        times.push([`${String(i).padStart(2, "0")}-${c.kind}-end`, c.start + c.dur - 0.25]);
        if (i > 0) times.push([`${String(i).padStart(2, "0")}-${c.kind}-trans`, c.start + p.transition * 0.5]);
      });
      if (opt("at")) opt("at").split(",").forEach(x => times.push([`t${x}`, +x]));
      const files = await stills(ctx, p, path.join(OUT, "stills", p.id), times);
      console.log(`${p.id}: ${files.length} stills → ${path.dirname(files[0])}`);
    }
  } finally { await browser.close(); }
}

// ---------------------------------------------------------------- render
async function cmdRender() {
  const R = require("./lib/render");
  const { mixSegment, MASTER_AF } = require("./lib/audio");
  const { compareSegment } = require("./lib/verify");
  const power = require("./lib/power");
  fs.mkdirSync(SEG, { recursive: true });
  const plans = select(loadPlans(), opt("only"));
  const reuse = !args.includes("--no-reuse"), minBattery = +opt("min-battery", 30);

  // Three signatures per segment, from inputs read once now (the workers load the page now too):
  //   ptag = timing (plan minus music offset) · vsig = everything the pixels depend on · asig = the sound.
  // vsig includes the lesson's own data + enrichment, so editing one lesson re-renders only that lesson.
  const read = files => files.map(f => fs.readFileSync(path.join(__dirname, f), "utf8"));
  const VFILES = read(["page/arscenes.js", "page/stage.js", "page/render.html", "../scenes.js", "../motion.js", "lib/render.js"]);
  const AFILES = read(["lib/audio.js"]);
  const course = loadCourse(), byId = Object.fromEntries(course.flat.map(l => [l.id, l]));
  const content = p => {
    const l = p.kind === "lesson" && byId[p.lesson];
    if (!l) return null; // cards draw only from their plan data
    const { stage, module, next, index, ...own } = l;
    let enr; try { enr = course.enrich(l); } catch (e) { enr = String(e); }
    return [own, enr, stage.id, stage.t, module.id, module.t];
  };
  const sigs = new Map(plans.map(p => {
    const ptag = ptagOf(p);
    return [p.id, { ptag, vsig: hash([ptag, content(p), O.fps, O.scale, O.crf, O.encoder, O.quality, VFILES]), asig: hash([ptag, p.musicOffset, AFILES]) }];
  }));
  const mp4Of = p => path.join(SEG, p.id + ".mp4");
  const metaOf = p => { try { return readJson(path.join(SEG, p.id + ".json")); } catch (_) { return null; } };

  // Leftovers of an interrupted run (encoder temp files, unmixed tracks).
  for (const f of fs.readdirSync(SEG)) if (/\.part\.mp4$|\.video\.mp4$|\.wav$/.test(f)) try { fs.unlinkSync(path.join(SEG, f)); } catch (_) { }

  const audioQ = [], checkQ = [], renderQ = [];
  let upToDate = 0;
  for (const p of plans) {
    const m = metaOf(p), s = sigs.get(p.id);
    if (!m || !fs.existsSync(mp4Of(p))) renderQ.push(p);
    else if (m.vsig === s.vsig) m.asig === s.asig ? upToDate++ : audioQ.push(p);
    else if (reuse && m.ptag === s.ptag) checkQ.push(p);
    else renderQ.push(p);
  }
  const byLen = (a, b) => b.total - a.total; // longest first
  renderQ.sort(byLen);
  let totalSec = renderQ.reduce((a, p) => a + p.total, 0);
  console.log(`render: ${plans.length} segments: ${upToDate} up to date, ${audioQ.length} audio-only, ${checkQ.length} to verify against the current page, ` +
    `${renderQ.length} to render (${hms(totalSec)} of video) with ${O.workers} workers`);
  if (!audioQ.length && !checkQ.length && !renderQ.length) return;

  if (minBattery > 0) power.watchPower();
  const gate = power.powerGate(minBattery, console.log);
  const sleep = ms => new Promise(r => setTimeout(r, ms));

  // Mix the audio, mux it with `videoSrc` (a fresh video track or the existing mp4), write subtitles + sidecar.
  const finish = async (p, videoSrc, frames) => {
    const wav = path.join(SEG, p.id + ".wav"), tmp = path.join(SEG, p.id + ".mux.part.mp4");
    await mixSegment(p, TTS, wav, frames, O.fps);
    await run(FFMPEG, ["-y", "-v", "error", "-i", videoSrc, "-i", wav, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-af", MASTER_AF, "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-movflags", "+faststart", tmp]);
    await R.renameRetry(tmp, mp4Of(p));
    fs.unlinkSync(wav);
    fs.writeFileSync(path.join(SEG, p.id + ".srt"), toSrt(segmentCues(p, TTS)));
    writeJson(path.join(SEG, p.id + ".json"), { id: p.id, frames, fps: O.fps, duration: frames / O.fps, ...sigs.get(p.id) });
  };

  const t0 = Date.now(), failed = [], stats = { rendered: 0, kept: 0, remixed: 0 };
  let doneSec = 0;
  const next = () => audioQ.length ? ["audio", audioQ.shift()] : checkQ.length ? ["check", checkQ.shift()] : renderQ.length ? ["render", renderQ.shift()] : null;
  const worker = async w => {
    let browser = null, ctx = null;
    const restart = async () => {
      if (browser) await R.closeBrowser(browser);
      browser = ctx = null;
      browser = await R.launch(O.scale);
      ctx = await R.openPage(browser, O.scale);
    };
    try {
      for (let job; (job = next());) {
        const [kind, p] = job, s0 = Date.now();
        for (let attempt = 1; ; attempt++) {
          try {
            if (kind !== "audio" && !ctx) await restart();
            if (kind === "audio") {
              await finish(p, mp4Of(p), metaOf(p).frames);
              stats.remixed++;
              console.log(`  [w${w}] ${p.id}  audio remixed`);
            } else if (kind === "check") {
              const r = await compareSegment(ctx, p, mp4Of(p), O);
              if (r.ok) {
                await finish(p, mp4Of(p), metaOf(p).frames);
                stats.kept++;
                console.log(`  [w${w}] ${p.id}  unchanged (max block diff ${r.worst} over ${r.samples} frames) - kept`);
              } else {
                renderQ.push(p); renderQ.sort(byLen); totalSec += p.total;
                console.log(`  [w${w}] ${p.id}  changed (block diff ${r.worst} at ${r.at}s${r.why ? ", " + r.why : ""}) - queued for render`);
              }
            } else {
              const vid = path.join(SEG, p.id + ".video.mp4");
              const frames = await R.renderVideo(ctx, p, vid, O, { beforeFrame: gate });
              await finish(p, vid, frames);
              fs.unlinkSync(vid);
              stats.rendered++;
              doneSec += p.total;
              const el = (Date.now() - t0) / 1000, eta = el / doneSec * (totalSec - doneSec);
              console.log(`  [w${w}] ${p.id}  ${hms(p.total)} video in ${hms((Date.now() - s0) / 1000)}  |  ${(doneSec / totalSec * 100).toFixed(1)}%  elapsed ${hms(el)}  eta ${hms(eta)}`);
            }
            break;
          } catch (e) {
            const msg = e.message.split("\n")[0];
            if (attempt >= 5) { failed.push(p.id); console.error(`  [w${w}] ${p.id} FAILED after ${attempt} attempts: ${msg}`); break; }
            console.error(`  [w${w}] ${p.id} attempt ${attempt} failed (${msg}) - restarting the browser and retrying`);
            await gate(); // a sleep on battery shows up as a timeout: wait for power before retrying
            await sleep([5, 20, 60, 120][attempt - 1] * 1000); // also rides out a brief network loss (web fonts)
            if (kind !== "audio") { try { await restart(); } catch (e2) { console.error(`  [w${w}] browser restart failed: ${e2.message.split("\n")[0]}`); } }
          }
        }
      }
    } finally { if (browser) await R.closeBrowser(browser); }
  };
  try {
    await Promise.all(Array.from({ length: Math.max(1, Math.min(O.workers, audioQ.length + checkQ.length + renderQ.length)) }, (_, i) => worker(i + 1)));
  } finally { power.stopPower(); }
  console.log(`render: done in ${hms((Date.now() - t0) / 1000)} - ${stats.rendered} rendered, ${stats.kept} kept after verification, ${stats.remixed} audio remixed`);
  if (failed.length) throw new Error(`${failed.length} segments failed: ${failed.join(", ")} - run the same command again to retry them`);
}

// ---------------------------------------------------------------- assemble
async function concatTo(list, outFile, title) {
  const tmp = path.join(OUT, "tmp-" + path.basename(outFile, ".mp4"));
  fs.mkdirSync(tmp, { recursive: true });
  let t = 0, srt = [], chapters = [], pendingStart = null;
  for (const p of list) {
    const meta = readJson(path.join(SEG, p.id + ".json"));
    segmentCues(p, TTS).forEach(c => srt.push({ ...c, start: c.start + t, end: c.end + t }));
    if (p.kind === "module") pendingStart = pendingStart == null ? t : pendingStart;
    else {
      const start = pendingStart != null ? pendingStart : t;
      pendingStart = null;
      const name = p.kind === "lesson" ? `${p.lesson} · ${p.title[1]}` : p.title[1];
      chapters.push({ start, name });
    }
    t += meta.duration;
  }
  chapters.forEach((c, i) => { c.end = i + 1 < chapters.length ? chapters[i + 1].start : t; });
  const listF = path.join(tmp, "list.txt"), srtF = outFile.replace(/\.mp4$/, ".srt"), metaF = path.join(tmp, "meta.txt");
  fs.writeFileSync(listF, list.map(p => `file '${path.join(SEG, p.id + ".mp4").replace(/\\/g, "/").replace(/'/g, "'\\''")}'`).join("\n"));
  fs.writeFileSync(srtF, "\uFEFF" + toSrt(srt));
  const esc = s => s.replace(/([=;#\\\n])/g, "\\$1");
  fs.writeFileSync(metaF, ";FFMETADATA1\ntitle=" + esc(title) + "\n" + chapters.map(c =>
    `[CHAPTER]\nTIMEBASE=1/1000\nSTART=${Math.round(c.start * 1000)}\nEND=${Math.round(c.end * 1000)}\ntitle=${esc(c.name)}\n`).join(""));
  await run(FFMPEG, ["-y", "-v", "error", "-f", "concat", "-safe", "0", "-i", listF, "-i", srtF, "-i", metaF,
    "-map", "0:v", "-map", "0:a", "-map", "1:0", "-map_metadata", "2", "-map_chapters", "2",
    "-c", "copy", "-c:s", "mov_text", "-metadata:s:s:0", "language=ara", "-metadata:s:a:0", "language=ara", "-movflags", "+faststart", outFile]);
  const chapterTxt = chapters.map(c => `${hms(c.start)} ${c.name}`).join("\n") + "\n";
  fs.writeFileSync(outFile.replace(/\.mp4$/, ".chapters.txt"), chapterTxt);
  const lessons = list.filter(p => p.kind === "lesson").length;
  fs.writeFileSync(outFile.replace(/\.mp4$/, ".youtube.txt"),
    `${title}\n\nشرح عربي كامل بالرسوم المتحركة: ${lessons} درسًا، ولكل درس تشبيه ومخطط مرئي ونقاط أساسية وأمثلة بالكود وخطأ شائع واختبار سريع.\n\nالفصول:\n${chapterTxt}`);
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log(`  ${path.basename(outFile)}  ${hms(t)}  (${chapters.length} chapters)`);
}

// A segment is finished once its .json sidecar exists (written after the mp4 is complete) and was
// rendered with the current timing — otherwise subtitles and chapters would drift.
const isDone = p => {
  const f = path.join(SEG, p.id + ".json");
  return fs.existsSync(f) && fs.existsSync(path.join(SEG, p.id + ".mp4")) && readJson(f).ptag === ptagOf(p);
};

async function cmdAssemble() {
  const all = loadPlans();
  if (args.includes("--partial")) {
    const done = all.filter(isDone);
    if (!done.length) throw new Error("no segments rendered yet");
    console.log(`assemble --partial: ${done.length}/${all.length} segments`);
    return concatTo(done, path.join(OUT, "preview.mp4"), "معاينة — كورس مهندس الذكاء الاصطناعي");
  }
  const plans = all;
  const missing = plans.filter(p => !isDone(p));
  if (missing.length) throw new Error(`${missing.length} segments not rendered yet (e.g. ${missing.slice(0, 3).map(p => p.id).join(", ")})`);
  console.log("assemble:");
  const stages = [...new Set(plans.map(p => p.stage).filter(Boolean))];
  fs.mkdirSync(path.join(OUT, "stages"), { recursive: true });
  for (const [i, st] of stages.entries()) {
    const list = plans.filter(p => p.stage === st);
    await concatTo(list, path.join(OUT, "stages", `${String(i).padStart(2, "0")}-${st}.mp4`), list[0].title[1]);
  }
  await concatTo(plans, path.join(OUT, "AI-Engineer-Course-Arabic.mp4"), "كورس مهندس الذكاء الاصطناعي — الشرح الكامل بالعربية");
}

// ---------------------------------------------------------------- main
(async () => {
  try {
    if (cmd === "script") cmdScript();
    else if (cmd === "tts") await cmdTts();
    else if (cmd === "plan") await cmdPlan();
    else if (cmd === "stills") await cmdStills();
    else if (cmd === "render") await cmdRender();
    else if (cmd === "assemble") await cmdAssemble();
    else if (cmd === "all") { cmdScript(); await cmdTts(); await cmdPlan(); await cmdRender(); await cmdAssemble(); }
    else console.log(fs.readFileSync(__filename, "utf8").split("\n").slice(1, 14).map(l => l.replace(/^\/\/ ?/, "")).join("\n"));
  } catch (e) { console.error(e.stack || e.message); process.exit(1); }
})();
