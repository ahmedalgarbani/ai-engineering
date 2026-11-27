// Reuse check for a segment whose render inputs changed but whose timing did not (e.g. a shared
// page file was edited for other lessons): render sample frames with the current page and compare
// them with the existing video. If they match within encoder noise, the segment is kept.
const { spawn } = require("child_process");
const { FFMPEG } = require("./media");
const { prepare, grab } = require("./render");

// Frames are compared as 8×8-pixel block means of the 1080p frame: x264 noise averages out,
// while any real change (a word, a colour, a moved shape) still moves a block by tens of levels.
const W = 240, H = 135, FRAME = W * H * 3;
const SCALE = `scale=${W}:${H}:flags=area`;

// Every 1.5 s, plus the settled end of each chapter and the middle of each transition.
function sampleFrames(plan, fps) {
  const last = Math.round(plan.total * fps) - 1, set = new Set();
  const add = t => set.add(Math.min(last, Math.max(0, Math.round(t * fps))));
  for (let t = 0.5; t < plan.total; t += 1.5) add(t);
  plan.chapters.forEach((c, i) => { add(c.start + c.dur - 0.3); if (i) add(c.start + plan.transition * 0.5); });
  return [...set].sort((a, b) => a - b);
}

// Run ffmpeg → W×H rgb24 frames on stdout; `inputs` (JPEG buffers) are fed on stdin.
function rawFrames(args, inputs) {
  return new Promise((resolve, reject) => {
    const ff = spawn(FFMPEG, ["-v", "error", ...args, "-an", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], { windowsHide: true });
    const out = [];
    let err = "";
    ff.stdout.on("data", d => out.push(d));
    ff.stderr.on("data", d => { err += d; });
    ff.stdin.on("error", () => { });
    ff.on("error", reject);
    ff.on("close", code => {
      if (code !== 0) return reject(new Error("ffmpeg: " + err.slice(-500)));
      const buf = Buffer.concat(out), n = Math.floor(buf.length / FRAME);
      resolve(Array.from({ length: n }, (_, i) => buf.subarray(i * FRAME, (i + 1) * FRAME)));
    });
    for (const b of inputs || []) ff.stdin.write(b);
    ff.stdin.end();
  });
}

function maxBlockDiff(a, b) {
  let m = 0;
  for (let p = 0; p < FRAME; p += 3) {
    const d = (Math.abs(a[p] - b[p]) + Math.abs(a[p + 1] - b[p + 1]) + Math.abs(a[p + 2] - b[p + 2])) / 3;
    if (d > m) m = d;
  }
  return m;
}

// → { ok, worst, at, samples }   (worst = largest block difference, in 0–255 levels)
async function compareSegment(ctx, plan, mp4, o) {
  const fps = o.fps, frames = sampleFrames(plan, fps), tol = o.reuseTol || 12;
  await prepare(ctx, plan);
  const fresh = [];
  for (const f of frames) fresh.push(await grab(ctx, f / fps, "jpeg", o.quality || 92));
  const sel = `select='${frames.map(f => `eq(n,${f})`).join("+")}',${SCALE}`;
  const [old, now] = await Promise.all([
    rawFrames(["-i", mp4, "-vf", sel, "-fps_mode", "passthrough"]),
    rawFrames(["-f", "image2pipe", "-c:v", "mjpeg", "-i", "-", "-vf", SCALE], fresh)
  ]);
  if (old.length !== frames.length || now.length !== frames.length)
    return { ok: false, worst: Infinity, at: 0, samples: frames.length, why: `decoded ${old.length}/${now.length} of ${frames.length} frames` };
  let worst = 0, at = 0;
  frames.forEach((f, i) => { const d = maxBlockDiff(old[i], now[i]); if (d > worst) { worst = d; at = f / fps; } });
  return { ok: worst <= tol, worst: +worst.toFixed(1), at: +at.toFixed(2), samples: frames.length };
}

module.exports = { compareSegment, sampleFrames };
