// Deterministic timeline driver: Renderer.prepare(plan) builds all chapter scenes,
// Renderer.seek(t) poses every layer for time t (seconds) — no wall-clock animation.
(function () {
  const ACC = { C: "#f5a524", S1: "#3db4f2", S2: "#22c3a6", S3: "#f2795b", S4: "#e8618c", S5: "#9ccc65", S6: "#a855f7", S7: "#06b6d4", S8: "#6366f1" };
  const byId = {};
  COURSE.stages.forEach(st => st.modules.forEach(m => m.lessons.forEach(l => { l.stage = st; l.module = m; l.acc = ACC[st.id]; byId[l.id] = l; })));
  const $ = s => document.querySelector(s);
  const A = window.ArScenes;

  const TRANS = { lessonIntro: "fade", analogy: "wipe", diagram: "zoom", point: "push", code: "zoom", pitfall: "push", quiz: "wipe", outro: "zoom" };
  const ORIGINS = ["50% 50%", "32% 42%", "68% 46%", "46% 64%", "60% 36%", "40% 55%"];
  const ease = x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

  let plan = null, chs = [], els = [], svgs = [], shown = new Set();

  async function fontsReady() {
    const specs = [];
    for (const w of ["400", "500", "600", "700"]) specs.push(`${w} 20px "Readex Pro"`, `${w} 20px "IBM Plex Sans Arabic"`, `${w} 20px "IBM Plex Mono"`);
    for (const w of ["500", "600", "700", "800"]) specs.push(`${w} 20px "Outfit"`);
    await Promise.all(specs.map(s => document.fonts.load(s, "مرحبًا بك Hello 0123")));
    await document.fonts.ready;
    // Warm the shaping caches with a mixed Arabic/Latin sample.
    $("#warm").innerHTML = `<svg width="10" height="10"><text font-family="Readex Pro">النموذج Model ✓</text></svg>`;
    return Object.fromEntries(specs.map(s => [s, document.fonts.check(s, "مرحبًا Hello")]));
  }

  function buildSvg(c) {
    if (plan.kind === "lesson") {
      const l = byId[plan.lesson], enr = window.enrichLesson(l);
      switch (c.kind) {
        case "lessonIntro": return A.lessonIntro(l, enr, c);
        case "analogy": return A.analogy(l, enr, c);
        case "diagram": return A.diagram(l, c);
        case "point": return A.point(l, c.data.i, c);
        case "code": return A.code(l, c);
        case "pitfall": return A.pitfall(l, enr, c);
        case "quiz": return A.quiz(l, enr, c);
        case "outro": return A.outro(l, c);
      }
    }
    switch (c.kind) {
      case "courseIntro": return A.courseIntro(c);
      case "courseOutro": return A.courseOutro(c);
      case "stageCard": return A.stageCard(c, plan.acc);
      case "moduleCard": return A.moduleCard(c, plan.acc);
    }
    throw new Error("unknown chapter kind " + c.kind);
  }

  function prepare(p) {
    plan = p; chs = p.chapters; shown = new Set();
    const layers = $("#layers");
    layers.innerHTML = "";
    els = chs.map((c, i) => {
      const el = document.createElement("div");
      el.className = "ch";
      el.innerHTML = `<div class="kb" style="transform-origin:${ORIGINS[i % ORIGINS.length]}">${buildSvg(c)}</div>`;
      layers.appendChild(el);
      return el;
    });
    svgs = els.map(el => { const s = el.querySelector("svg"); s.pauseAnimations(); s.setCurrentTime(0); return s; });
    document.documentElement.style.setProperty("--acc", p.acc);
    $("#top .id").textContent = p.lesson || "";
    $("#top .tt").textContent = p.title[1];
    // chapter ticks on the progress bar
    $("#prog").querySelectorAll("b").forEach(b => b.remove());
    chs.slice(1).forEach(c => { const b = document.createElement("b"); b.style.right = (c.start / p.total * 100) + "%"; $("#prog").appendChild(b); });
    return { chapters: chs.length, total: p.total };
  }

  function pose(i, local, style, z) {
    const el = els[i];
    el.style.display = "block";
    el.style.zIndex = z;
    el.style.transform = style.transform || "none";
    el.style.opacity = style.opacity == null ? 1 : style.opacity;
    el.style.clipPath = style.clip || "none";
    el.style.filter = style.filter || "none";
    const c = chs[i], k = clamp(local / c.dur, 0, 1.15);
    el.firstChild.style.transform = `scale(${1 + 0.035 * k})`;
    svgs[i].setCurrentTime(Math.max(0, local));
    shown.add(i);
  }

  function transition(kind, p) {
    const s = Math.sin(Math.PI * p);
    switch (kind) {
      case "push": // RTL forward: the new scene enters from the left
        return { out: { transform: `translateX(${p * 100}%) scale(${1 - 0.06 * s})` }, in: { transform: `translateX(${-(1 - p) * 100}%) scale(${1 - 0.06 * s})` }, inTop: true };
      case "zoom":
        return { out: { transform: `scale(${1 + 0.16 * p})`, opacity: 1 - p, filter: `blur(${(p * 3).toFixed(2)}px)` }, in: { transform: `scale(${0.92 + 0.08 * p})` }, inTop: false };
      case "wipe":
        return { out: { transform: `scale(${1 - 0.04 * p})` }, in: { clip: `circle(${(p * 78).toFixed(2)}% at 50% 50%)` }, inTop: true };
      default:
        return { out: {}, in: { opacity: p }, inTop: true };
    }
  }

  function seek(t) {
    const TT = plan.transition;
    let i = chs.findIndex(c => t < c.start + c.dur);
    if (i < 0) i = chs.length - 1;
    const c = chs[i], local = t - c.start;
    const active = new Set([i]);
    let sweep = 0, sweepX = 0;
    if (i > 0 && local < TT) {
      const p = ease(local / TT), tr = transition(TRANS[c.kind] || "fade", p), prev = chs[i - 1];
      pose(i - 1, prev.dur + local, tr.out, tr.inTop ? 1 : 2);
      pose(i, local, tr.in, tr.inTop ? 2 : 1);
      active.add(i - 1);
      sweep = Math.sin(Math.PI * p) * 0.9;
      sweepX = 70 - 140 * p;
    } else {
      pose(i, local, {}, 1);
    }
    shown.forEach(k => { if (!active.has(k)) { els[k].style.display = "none"; shown.delete(k); } });

    const sw = $("#sweep");
    sw.style.opacity = sweep.toFixed(3);
    sw.style.transform = `translateX(${sweepX}%)`;

    const showTop = plan.kind === "lesson" && i > 0;
    const topOp = !showTop ? 0 : (i === 1 ? clamp((local - TT * 0.6) / 0.4, 0, 1) : 1);
    const top = $("#top");
    top.style.opacity = topOp;
    $("#top .chn").textContent = c.name[1];

    $("#prog").style.opacity = plan.kind === "lesson" ? 1 : 0;
    $("#prog i").style.width = clamp(t / plan.total * 100, 0, 100) + "%";

    const F = 0.35;
    $("#fade").style.opacity = clamp(Math.max(1 - t / F, (t - (plan.total - F)) / F), 0, 1).toFixed(3);
    return i;
  }

  window.Renderer = { ready: fontsReady(), prepare, seek };
})();
