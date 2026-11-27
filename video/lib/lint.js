// Layout lint for the motion explainers: builds every film in Node and, at the settled end of each
// beat, flags script errors, objects outside the canvas and boxes that overlap each other.
//   node lib/lint.js [C2.2,S1 …] [--overlap 0.18]
const { loadCourse } = require("./course");

function rectOf(o, P, X) {
  const t = o.type, s = P.scale != null ? P.scale : 1;
  if (t === "box" || t === "doc" || t === "code" || t === "bubble" || t === "matrix" || t === "badge" || t === "curve") return { x: P.x, y: P.y, hw: P.w / 2 * s, hh: P.h / 2 * s };
  if (t === "icon") return { x: P.x, y: P.y, hw: P.s / 2 * s, hh: P.s / 2 * s };
  if (t === "text") { const lines = String(P.text).split("\n"); const w = Math.max(...lines.map(l => X.textW(l, P.size, o.prm.font))); const a = o.prm.anchor; return { x: a === "l" ? P.x + w / 2 : a === "r" ? P.x - w / 2 : P.x, y: P.y, hw: w / 2 * s, hh: P.size * 0.6 * lines.length * s }; }
  if (t === "bar") return { x: P.x + P.w / 2, y: P.y, hw: P.w / 2, hh: (o.prm.h || 26) / 2 };
  if (t === "ring" || t === "gauge") return { x: P.x, y: P.y, hw: P.r * s, hh: P.r * s };
  if (t === "num") return { x: P.x, y: P.y, hw: P.size * 1.2, hh: P.size * 0.6 };
  return null;
}
const area = r => 4 * r.hw * r.hh;
function inter(a, b) {
  const w = Math.min(a.x + a.hw, b.x + b.hw) - Math.max(a.x - a.hw, b.x - b.hw), h = Math.min(a.y + a.hh, b.y + b.hh) - Math.max(a.y - a.hh, b.y - b.hh);
  return w > 0 && h > 0 ? w * h : 0;
}
const inside = (a, b) => a.x - a.hw >= b.x - b.hw - 2 && a.x + a.hw <= b.x + b.hw + 2 && a.y - a.hh >= b.y - b.hh - 2 && a.y + a.hh <= b.y + b.hh + 2;

function lint(ids, opts) {
  opts = opts || {};
  const errors = [];
  const origErr = console.error;
  console.error = (...a) => errors.push(a.map(String).join(" "));
  const { flat, X } = loadCourse();
  console.error = origErr;
  const want = ids && ids.length ? flat.filter(l => ids.some(w => l.id === w || l.stage.id === w)) : flat;
  const report = [];
  let lessons = 0, beats = 0, seconds = 0;
  for (const l of want) {
    if (!X.has(l.id)) { report.push(`${l.id}: no explainer`); continue; }
    const errs = [];
    console.error = (...a) => errs.push(a.map(String).join(" ").slice(0, 200));
    const film = X.build(X.defs[l.id]);
    console.error = origErr;
    errs.forEach(e => report.push(`${l.id}: ERROR ${e}`));
    lessons++; beats += film.beats.length; seconds += film.total;
    const issues = new Set();
    film.beats.forEach((b, bi) => {
      const t = b.start + b.dur - 0.05;
      const live = [];
      film.objs.forEach(o => {
        if (!(t >= o.born && t < o.dead)) return;
        const P = evalAt(o, t);
        if (P.opacity != null && P.opacity < 0.5) return;
        for (const k of ["x", "y", "w", "h", "x1", "y1", "x2", "y2", "v", "r"]) if (k in P && (P[k] == null || Number.isNaN(P[k]))) issues.add(`beat ${bi}: ${o.id} has invalid ${k}`);
        const r = rectOf(o, P, X);
        if (!r) return;
        if (o.type === "box" && P.label && o.prm.lp !== "top" && o.prm.lp !== "above" && o.prm.lp !== "below") {
          const font = o.prm.font || (/[؀-ۿ]/.test(P.label) ? "ar" : "math");
          const lw = Math.max(...String(P.label).split("\n").map(x => X.textW(x, P.size, font, o.prm.weight))) + (o.prm.icon && o.prm.inline ? P.size * 1.5 : 0);
          if (lw > P.w - 8) issues.add(`beat ${bi}: ${o.id} label "${String(P.label).slice(0, 30)}" wider than its box (${Math.round(lw)} > ${Math.round(P.w)})`);
        }
        if (r.x - r.hw < -4 || r.x + r.hw > 1604 || r.y - r.hh < 150 || r.y + r.hh > 904) issues.add(`beat ${bi}: ${o.id} (${o.type}) off canvas [${Math.round(r.x - r.hw)}..${Math.round(r.x + r.hw)} × ${Math.round(r.y - r.hh)}..${Math.round(r.y + r.hh)}]`);
        const zone = (o.type === "box" && (o.prm.lp === "top" || o.prm.dash || (o.prm.z || 0) < 0 || P.fop === 0)) || o.type === "icon" || o.type === "ring" || o.type === "gauge" || o.id.startsWith("_");
        live.push({ o, r, zone });
      });
      for (let i = 0; i < live.length; i++) for (let j = i + 1; j < live.length; j++) {
        const A = live[i], B = live[j];
        if (A.zone || B.zone) continue;
        if (inside(A.r, B.r) || inside(B.r, A.r)) continue; // containment is intentional (labels in panels, tokens in blocks)
        const stem = id => id.replace(/[0-9_]+$/, "");
        if (stem(A.o.id) === stem(B.o.id) && stem(A.o.id)) continue; // siblings of one helper (stacks, rows) are laid out together
        if (A.o.type === "doc" && B.o.type === "doc") continue;
        const ov = inter(A.r, B.r), small = Math.min(area(A.r), area(B.r));
        if (small > 0 && ov / small > (opts.overlap || 0.18)) issues.add(`beat ${bi}: overlap ${A.o.id} × ${B.o.id} (${Math.round(ov / small * 100)}%)`);
      }
    });
    if (film.total > 240) issues.add(`long: ${Math.round(film.total)}s`);
    if (film.beats.some(b => (b.say || "").length > 125)) issues.add(`long caption: ${film.beats.filter(b => b.say.length > 125).map(b => b.i).join(",")}`);
    issues.forEach(m => report.push(`${l.id}: ${m}`));
  }
  return { report, lessons, beats, seconds };
}
function evalAt(o, t) {
  const P = Object.assign({}, o.init);
  for (const k in o.tracks) {
    let v = o.init[k];
    for (const s of o.tracks[k]) {
      if (t < s.t0) break;
      if (t >= s.t1) { v = s.to; continue; }
      const p = s.e((t - s.t0) / (s.t1 - s.t0));
      v = typeof v === "number" && typeof s.to === "number" ? v + (s.to - v) * p : p < 0.5 ? v : s.to;
      break;
    }
    P[k] = v;
  }
  return P;
}

if (require.main === module) {
  const args = process.argv.slice(2), oi = args.indexOf("--overlap");
  const ids = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--overlap").join(",").split(",").filter(Boolean);
  const r = lint(ids, { overlap: oi >= 0 ? +args[oi + 1] : undefined });
  r.report.forEach(l => console.log(l));
  console.log(`lint: ${r.lessons} explainers, ${r.beats} beats, ~${Math.round(r.seconds / 60)} min (estimated voice), ${r.report.length} findings`);
}
module.exports = { lint };
