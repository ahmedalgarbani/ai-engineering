// Arabic subtitles (SRT) from edge-tts sentence boundaries.
const fs = require("fs");

const MAX = 70; // max characters per cue

function splitSentence(s) {
  const text = s.text.trim(), parts = [];
  if (text.length <= MAX) return [{ ...s, text }];
  // Balanced split: aim for equal-length cues instead of filling greedily (avoids 1-word orphans).
  const words = text.split(/\s+/);
  const n = Math.ceil(text.length / MAX), target = text.length / n;
  let cur = "";
  for (const w of words) {
    const next = cur ? cur + " " + w : w;
    if (cur && parts.length < n - 1 && (next.length > MAX || Math.abs(next.length - target) > Math.abs(cur.length - target))) { parts.push(cur); cur = w; }
    else cur = next;
  }
  if (cur) parts.push(cur);
  // time proportional to characters
  const total = parts.reduce((a, p) => a + p.length, 0), span = s.end - s.start;
  let t = s.start;
  return parts.map(p => { const d = span * p.length / total, c = { start: t, end: t + d, text: p }; t += d; return c; });
}

function segmentCues(plan, ttsDir) {
  const cues = [];
  for (const c of plan.chapters) {
    for (const k of c.clips) {
      const base = c.start + k.at;
      let meta;
      try { meta = JSON.parse(fs.readFileSync(`${ttsDir}/${k.key}.json`, "utf8")); } catch (e) { meta = null; }
      const sents = meta && meta.sentences && meta.sentences.length ? meta.sentences : [{ start: 0, end: k.dur, text: k.text }];
      sents.forEach(s => splitSentence(s).forEach(x => cues.push({ start: base + x.start, end: base + Math.min(x.end, k.dur + 0.2), text: x.text })));
    }
  }
  // avoid overlaps
  for (let i = 0; i < cues.length - 1; i++) if (cues[i].end > cues[i + 1].start) cues[i].end = cues[i + 1].start - 0.01;
  return cues;
}

const ts = t => {
  t = Math.max(0, t);
  const h = Math.floor(t / 3600), m = Math.floor(t % 3600 / 60), s = Math.floor(t % 60), ms = Math.round((t - Math.floor(t)) * 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")},${String(Math.min(ms, 999)).padStart(3, "0")}`;
};

function toSrt(cues) {
  return cues.map((c, i) => `${i + 1}\n${ts(c.start)} --> ${ts(c.end)}\n‫${c.text}‬\n`).join("\n");
}

module.exports = { segmentCues, toSrt };
