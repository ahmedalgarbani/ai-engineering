// Arabic-first animated SVG scenes for the offline course video (960x540 user units,
// rendered at 2x). Every template receives the planned chapter `c` (dur, clips, extra)
// so reveals are synced to the narration.
(function () {
  const K = window.SceneKit, W = K.W, H = K.H, esc = K.esc, ap = K.appear;
  const FA = "Readex Pro, IBM Plex Sans Arabic, sans-serif";
  const FD = "Outfit, Readex Pro, sans-serif";
  const FM = "IBM Plex Mono, monospace";
  const GREEN = "#4fd1a5", RED = "#f2795b", INK = "#07101e";
  const AR_LETTERS = ["أ", "ب", "ج"];

  // ---------- measurement-based wrapping ----------
  const cv = document.createElement("canvas").getContext("2d");
  const fam = f => f.split(",").map(x => x.trim()).map(x => /\s/.test(x) && !/^(sans-serif|monospace)$/.test(x) ? `"${x}"` : x).join(", ");
  function mw(text, size, weight, family) { cv.font = `${weight || 500} ${size}px ${fam(family || FA)}`; return cv.measureText(text).width; }
  function wrapW(text, maxW, size, weight, family) {
    const words = String(text || "").split(/\s+/).filter(Boolean), lines = [];
    let cur = "";
    for (const w of words) {
      const t = cur ? cur + " " + w : w;
      if (cur && mw(t, size, weight, family) > maxW) { lines.push(cur); cur = w; } else cur = t;
    }
    if (cur) lines.push(cur);
    return lines;
  }
  // Shrink until it fits in maxLines; if still too long, ellipsize the last line.
  function fitW(text, maxW, maxLines, size, minSize, weight, family) {
    let sz = size, lines = wrapW(text, maxW, sz, weight, family);
    while (lines.length > maxLines && sz > minSize) { sz -= 1; lines = wrapW(text, maxW, sz, weight, family); }
    if (lines.length > maxLines) {
      lines = lines.slice(0, maxLines);
      let last = lines[maxLines - 1];
      while (last.length > 4 && mw(last + "…", sz, weight, family) > maxW) last = last.replace(/\s*\S+$/, "");
      lines[maxLines - 1] = last + "…";
    }
    return { lines, sz };
  }

  // ---------- text primitives ----------
  // Arabic text. anchor (RTL semantics): "start" = right edge at x, "middle" = centered, "end" = left edge at x.
  const arT = (x, y, s, size, weight, fill, extra, anchor) =>
    `<text x="${x}" y="${y}" direction="rtl" text-anchor="${anchor || "start"}" font-family="${FA}" font-size="${size}" font-weight="${weight}" fill="${fill}" ${extra || ""}>${esc(s)}</text>`;
  const arC = (x, y, s, size, weight, fill, extra) => arT(x, y, s, size, weight, fill, extra, "middle");
  const enT = (x, y, s, size, weight, fill, anchor, family, extra) =>
    `<text x="${x}" y="${y}" text-anchor="${anchor || "start"}" font-family="${family || FD}" font-size="${size}" font-weight="${weight}" fill="${fill}" ${extra || ""}>${esc(s)}</text>`;
  const svgw = (acc, inner) => { const u = K.nextId(); return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">${K.bg(acc, u)}${inner}</svg>`; };
  const grow = (attr, to, begin, dur) => `<animate attributeName="${attr}" to="${to}" begin="${begin}s" dur="${dur || 0.6}s" fill="freeze"/>`;
  const checkIcon = (cx, cy, r, color, begin) =>
    `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="3" stroke-dasharray="${2 * Math.PI * r}" stroke-dashoffset="${2 * Math.PI * r}">${grow("stroke-dashoffset", 0, begin, 0.5)}</circle>
     <path d="M${cx - r * 0.45},${cy} l${r * 0.33},${r * 0.38} l${r * 0.62},${-r * 0.72}" fill="none" stroke="${color}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="40" stroke-dashoffset="40">${grow("stroke-dashoffset", 0, begin + 0.4, 0.35)}</path>`;
  const pill = (xRight, y, text, color, opts = {}) => {
    const size = opts.size || 13, w = mw(text, size, 700) + 34;
    return `<g opacity="0">${ap(opts.at || 0.15, -8)}<rect x="${xRight - w}" y="${y}" width="${w}" height="${size + 17}" rx="${(size + 17) / 2}" fill="${color}" opacity="${opts.solid ? 1 : 0.18}"/>
      ${arT(xRight - 17, y + size + 3.5, text, size, 700, opts.solid ? INK : color)}</g>`;
  };
  // Times at which line k of a narrated block should appear (synced to the voice clip).
  const syncTimes = (n, clip, frac) => Array.from({ length: n }, (_, k) => Math.max(0.15, clip.at - 0.2 + k * (clip.dur * (frac || 0.78)) / Math.max(1, n)));
  const stripStage = s => String(s).replace(/^المرحلة\s*\d+\s*:\s*/, "").replace(/^المرحلة التمهيدية:\s*/, "");

  // =====================================================================
  // COURSE INTRO
  function courseIntro(c) {
    const acc = "#f5a524", d = c.data;
    let s = `<g transform="translate(480,138)">
      <circle r="78" fill="none" stroke="${acc}" stroke-width="1.5" stroke-dasharray="6 9" opacity=".5"><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="24s" repeatCount="indefinite"/></circle>
      <circle r="64" fill="none" stroke="#3db4f2" stroke-width="2" stroke-dasharray="40 14" opacity=".55"><animateTransform attributeName="transform" type="rotate" from="360" to="0" dur="16s" repeatCount="indefinite"/></circle>
      <g opacity="0">${ap(0.2, 0, 0.8)}<circle r="48" fill="${acc}"/><text y="14" text-anchor="middle" font-family="${FD}" font-size="40" font-weight="800" fill="${INK}">AI</text></g>
    </g>`;
    s += `<g opacity="0">${ap(0.7, 14)}${arC(480, 268, "كورس مهندس الذكاء الاصطناعي", 46, 700, "#fff")}</g>`;
    s += `<g opacity="0">${ap(1.2, 10)}${enT(480, 304, "AI ENGINEER COURSE  ·  الشرح الكامل باللغة العربية", 18, 600, "#9fb2c6", "middle", FA, 'letter-spacing="1"')}</g>`;
    s += `<rect x="480" y="320" width="0" height="4" rx="2" fill="${acc}"><animate attributeName="x" to="380" begin="1.4s" dur=".7s" fill="freeze"/>${grow("width", 200, 1.4, 0.7)}</rect>`;
    const n = d.stages.length, cw = 128, gap = 12, x0 = 480 + (n * cw + (n - 1) * gap) / 2;
    d.stages.forEach((st, i) => {
      const x = x0 - (i + 1) * cw - i * gap, y = 352, at = 2.0 + i * 0.32;
      const label = st.id === "C" ? "تمهيدي" : "المرحلة " + st.id.replace("S", "");
      const t = fitW(stripStage(st.t[1]), cw - 20, 2, 14, 11, 600);
      s += `<g opacity="0">${ap(at, 18)}
        <rect x="${x}" y="${y}" width="${cw}" height="106" rx="14" fill="#101f33" stroke="${st.acc}" stroke-opacity=".7" stroke-width="1.6"/>
        <rect x="${x + 14}" y="${y}" width="${cw - 28}" height="4" rx="2" fill="${st.acc}"/>
        ${arT(x + cw - 12, y + 28, label, 13, 700, st.acc)}
        ${t.lines.map((ln, k) => arT(x + cw - 12, y + 52 + k * (t.sz + 5), ln, t.sz, 600, "#e2e8f0")).join("")}
        ${arT(x + cw - 12, y + 94, st.n + " درسًا", 12, 500, "#9fb2c6")}
      </g>`;
    });
    s += `<g opacity="0">${ap(4.4, 10)}${arC(480, 500, `${d.lessons} درسًا  ·  ${n} مراحل  ·  شرح مرئي وتشبيهات وأمثلة عملية واختبارات`, 16, 600, "#cbd5e1")}</g>`;
    return svgw(acc, s);
  }

  // =====================================================================
  // STAGE CARD
  function stageCard(c, acc) {
    const d = c.data;
    const mark = d.id === "C" ? "C" : d.id.replace("S", "");
    let s = `<text x="44" y="520" font-family="${FD}" font-weight="800" font-size="300" fill="none" stroke="${acc}" stroke-width="2" opacity="0">${esc(mark)}${grow("opacity", 0.16, 0.2, 1)}</text>`;
    s += pill(900, 64, d.id === "C" ? "المرحلة التمهيدية" : `المرحلة ${mark} من 5`, acc);
    const t = fitW(stripStage(d.t[1]), 420, 3, 38, 26, 700);
    let y = 150;
    t.lines.forEach((ln, k) => { s += `<g opacity="0">${ap(0.45 + k * 0.2, 14)}${arT(900, y, ln, t.sz, 700, "#fff")}</g>`; y += t.sz * 1.3; });
    s += `<rect x="900" y="${y - t.sz * 0.55}" width="0" height="4" rx="2" fill="${acc}"><animate attributeName="x" to="740" begin="1s" dur=".6s" fill="freeze"/>${grow("width", 160, 1, 0.6)}</rect>`;
    y += 14;
    const en = fitW(d.t[0], 420, 2, 16, 13, 600, FD);
    en.lines.forEach((ln, k) => { s += `<g opacity="0">${ap(1.1, 8)}${enT(900, y + k * 22, ln, en.sz, 600, "#9fb2c6", "end")}</g>`; });
    y += en.lines.length * 22 + 22;
    const ds = fitW(d.d[1], 420, Math.max(2, Math.floor((500 - y) / 30)), 18, 14, 500);
    const tt = syncTimes(ds.lines.length, c.clips[0], 0.7);
    ds.lines.forEach((ln, k) => { s += `<g opacity="0">${ap(tt[k], 10)}${arT(900, y + k * ds.sz * 1.6, ln, ds.sz, 500, "#cbd5e1")}</g>`; });
    // modules column (left)
    const m = d.modules, rh = Math.min(70, 400 / m.length), y0 = 270 - (m.length * rh) / 2;
    m.forEach((mod, i) => {
      const yy = y0 + i * rh, at = 1.6 + i * 0.35, mt = fitW(mod.t[1], 270, 1, 16, 12, 600);
      s += `<g opacity="0">${ap(at, 0)}<animateTransform attributeName="transform" type="translate" from="-30 0" to="0 0" begin="${at}s" dur=".6s" fill="freeze"/>
        <rect x="70" y="${yy}" width="390" height="${rh - 12}" rx="12" fill="#101f33" stroke="#243c59"/>
        <rect x="448" y="${yy + 10}" width="4" height="${rh - 32}" rx="2" fill="${acc}"/>
        ${arT(436, yy + (rh - 12) / 2 + 2, mt.lines[0], mt.sz, 600, "#f1f5f9", 'dominant-baseline="middle"')}
        ${arT(86, yy + (rh - 12) / 2 + 2, (mod.n > 2 && mod.n < 11 ? mod.n + " دروس" : mod.n === 2 ? "درسان" : mod.n + " درسًا"), 12.5, 600, acc, 'dominant-baseline="middle"', "end")}
      </g>`;
    });
    return svgw(acc, s);
  }

  // =====================================================================
  // MODULE CARD
  function moduleCard(c, acc) {
    const d = c.data;
    let s = pill(900, 64, stripStage(d.stageT).length > 34 ? d.stageT.split(":")[0] : d.stageT, acc);
    s += `<g opacity="0">${ap(0.3, 8)}${arT(900, 140, "وحدة جديدة", 17, 600, acc)}</g>`;
    const t = fitW(d.t[1].replace(/^الوحدة\s*\d+\s*:\s*/, ""), 400, 4, 36, 24, 700);
    const num = (d.t[1].match(/^الوحدة\s*(\d+)/) || [])[1];
    let y = 190;
    if (num) { s += `<g opacity="0">${ap(0.35, 8)}${arT(900, 172, "الوحدة " + num, 15, 600, "#9fb2c6")}</g>`; y = 214; }
    t.lines.forEach((ln, k) => { s += `<g opacity="0">${ap(0.5 + k * 0.18, 14)}${arT(900, y, ln, t.sz, 700, "#fff")}</g>`; y += t.sz * 1.32; });
    const en = fitW(d.t[0].replace(/^Module \d+:\s*/, ""), 400, 2, 16, 13, 600, FD);
    en.lines.forEach((ln, k) => { s += `<g opacity="0">${ap(1.1, 8)}${enT(900, y + 8 + k * 22, ln, en.sz, 600, "#9fb2c6", "end")}</g>`; });
    const L = d.lessons, rh = Math.min(56, 410 / L.length), y0 = 285 - (L.length * rh) / 2;
    L.forEach((l, i) => {
      const yy = y0 + i * rh, at = 1.3 + i * 0.3, lt = fitW(String(l.t[1]).split(/[:—–]/)[0].trim(), 300, 1, 16, 11.5, 600);
      s += `<g opacity="0">${ap(at, 0)}<animateTransform attributeName="transform" type="translate" from="-26 0" to="0 0" begin="${at}s" dur=".55s" fill="freeze"/>
        <rect x="60" y="${yy}" width="420" height="${rh - 10}" rx="11" fill="#101f33" stroke="#243c59"/>
        ${arT(462, yy + (rh - 10) / 2 + 2, lt.lines[0], lt.sz, 600, "#f1f5f9", 'dominant-baseline="middle"')}
        <rect x="72" y="${yy + (rh - 10) / 2 - 11}" width="${l.id.length * 8.5 + 16}" height="22" rx="7" fill="${acc}" opacity=".2"/>
        ${enT(80, yy + (rh - 10) / 2 + 1, l.id, 12.5, 700, acc, "start", FM, 'dominant-baseline="middle"')}
      </g>`;
    });
    return svgw(acc, s);
  }

  // =====================================================================
  // LESSON INTRO
  function lessonIntro(l, enr, c) {
    const acc = l.acc, u = K.nextId();
    let s = `<text x="40" y="520" font-family="${FD}" font-weight="800" font-size="190" fill="none" stroke="${acc}" stroke-width="2" opacity="0">${esc(l.id)}${grow("opacity", 0.14, 0.2, 1)}</text>`;
    const idw = l.id.length * 12 + 30;
    const modT = fitW(String(l.module.t[1]).replace(/^➕\s*/, ""), 600, 1, 14, 11, 500);
    s += `<g opacity="0">${ap(0.12, -10)}
      <rect x="${900 - idw}" y="60" width="${idw}" height="32" rx="9" fill="${acc}"/>
      ${enT(900 - idw / 2, 81, l.id, 16, 700, INK, "middle", FM)}
      ${arT(900 - idw - 14, 81, modT.lines[0], modT.sz, 500, "#9fb2c6")}
    </g>`;
    const ar = fitW(l.t[1], 820, 3, 46, 28, 700), en = fitW(l.t[0], 820, 2, 21, 15, 600, FD);
    const blockH = ar.lines.length * ar.sz * 1.28 + 30 + en.lines.length * en.sz * 1.35;
    let y = Math.max(160, 120 + (300 - blockH) / 2 + ar.sz);
    ar.lines.forEach((ln, i) => {
      const b = 0.35 + i * 0.3;
      s += `<clipPath id="${u}c${i}"><rect x="900" y="${y - ar.sz * 1.05}" width="0" height="${ar.sz * 1.5}"><animate attributeName="x" to="40" begin="${b}s" dur=".75s" fill="freeze"/>${grow("width", 860, b, 0.75)}</rect></clipPath>
        <g clip-path="url(#${u}c${i})">${arT(900, y, ln, ar.sz, 700, "#fff")}</g>`;
      y += ar.sz * 1.28;
    });
    s += `<rect x="900" y="${y - ar.sz * 0.5}" width="0" height="5" rx="2.5" fill="${acc}"><animate attributeName="x" to="720" begin="${0.6 + ar.lines.length * 0.3}s" dur=".6s" fill="freeze"/>${grow("width", 180, 0.6 + ar.lines.length * 0.3, 0.6)}</rect>`;
    y += 26;
    en.lines.forEach((ln, i) => { s += `<g opacity="0">${ap(1.3 + i * 0.15, 10)}${enT(900, y + i * en.sz * 1.35, ln, en.sz, 600, "#9fb2c6", "end")}</g>`; });
    // Lesson roadmap chips, revealed while the narrator reads the plan (second half of the clip).
    const rm = (c.data && c.data.roadmap) || [];
    const k0 = c.clips[0], rAt = k0.at + k0.dur * 0.5, rStep = (k0.dur * 0.42) / Math.max(1, rm.length);
    s += `<g opacity="0">${ap(rAt - 0.4, 10)}${arT(900, 438, "خطة الدرس", 13, 600, "#8ea3ba")}</g>`;
    let cx = 900;
    rm.forEach((t, i) => {
      const w = mw(t, 14, 600) + 40, at = rAt + i * rStep;
      s += `<g opacity="0">${ap(at, 12)}
        <rect x="${cx - w}" y="452" width="${w}" height="36" rx="18" fill="#122338" stroke="${acc}" stroke-opacity=".55" stroke-width="1.4"/>
        <circle cx="${cx - 16}" cy="470" r="4" fill="${acc}"/>
        ${arT(cx - 27, 475, t, 14, 600, "#e2e8f0")}
      </g>`;
      if (i < rm.length - 1) s += `<path d="M${cx - w - 4},470 h-10" stroke="#3a5576" stroke-width="1.5" opacity="0">${grow("opacity", 1, at + 0.2, 0.3)}</path>`;
      cx -= w + 18;
    });
    return svgw(acc, s);
  }

  // =====================================================================
  // ANALOGY
  function analogy(l, enr, c) {
    const acc = l.acc;
    let s = window.MotionKit.metaphorArt(enr.icon, acc);
    s += pill(900, 58, "التشبيه  ·  Mental model", acc);
    s += `<rect x="360" y="104" width="540" height="390" rx="18" fill="#101f33" stroke="#243c59" stroke-width="1.6" opacity="0">${ap(0.25, 16)}</rect>`;
    const ar = fitW(enr.analogy[1], 484, 7, 25, 17, 600), en = fitW(enr.analogy[0], 484, 4, 15, 12, 500, FD);
    const blockH = ar.lines.length * ar.sz * 1.62 + 34 + en.lines.length * en.sz * 1.5;
    let y = 104 + Math.max(40, (390 - blockH) / 2 + ar.sz * 0.9);
    const tt = syncTimes(ar.lines.length, c.clips[0]);
    ar.lines.forEach((ln, k) => { s += `<g opacity="0">${ap(tt[k], 12)}${arT(874, y, ln, ar.sz, 600, "#fff")}</g>`; y += ar.sz * 1.62; });
    const lineAt = tt[tt.length - 1] + 0.5;
    s += `<rect x="874" y="${y - ar.sz * 0.7}" width="0" height="2" fill="${acc}" opacity=".6"><animate attributeName="x" to="386" begin="${lineAt}s" dur=".7s" fill="freeze"/>${grow("width", 488, lineAt, 0.7)}</rect>`;
    y += 18;
    en.lines.forEach((ln, k) => { s += `<g opacity="0">${ap(lineAt + 0.3 + k * 0.12, 8)}${enT(386, y + k * en.sz * 1.5, ln, en.sz, 500, "#8ea3ba")}</g>`; });
    return svgw(acc, s);
  }

  // =====================================================================
  // DIAGRAM (reuses the course's animated scene library) + Arabic title chip
  // The scene is scaled to 84% to leave room for an Arabic caption synced to the narration.
  function diagram(l, c) {
    const acc = l.acc, u = K.nextId(), S = K.S, f = S[l.v] || S.pipeline;
    const sc = 0.8, dx = (W - W * sc) / 2;
    let s = `${K.bg(acc, u)}<g transform="translate(${dx},28) scale(${sc})">${f(l.vl || [], acc, u)}</g>`;
    const sent = String(l.d[1]).match(/[^.!؟?]+[.!؟?]?/g) || [l.d[1]];
    const cap = fitW(sent[0].trim(), 790, 2, 19, 14, 600);
    const k0 = c.clips[0], bh = cap.lines.length * cap.sz * 1.55 + 26, by = 522 - bh;
    s += `<g opacity="0">${ap(Math.max(0.6, k0.at - 0.1), 12)}
      <rect x="60" y="${by}" width="840" height="${bh}" rx="14" fill="#0b1626" fill-opacity=".92" stroke="${acc}" stroke-opacity=".45" stroke-width="1.4"/>
      <rect x="886" y="${by + 12}" width="4" height="${bh - 24}" rx="2" fill="${acc}"/>
      ${cap.lines.map((ln, i) => arT(868, by + 13 + cap.sz * 1.1 + i * cap.sz * 1.55, ln, cap.sz, 600, "#e2e8f0")).join("")}
    </g>`;
    return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">${s}</svg>`;
  }

  // =====================================================================
  // KEY POINT
  function point(l, i, c) {
    const acc = l.acc, p = l.p[i], n = l.p.length;
    let s = `<rect x="684" y="0" width="276" height="${H}" fill="#0c1829"/>
      <line x1="684" y1="0" x2="684" y2="${H}" stroke="${acc}" stroke-opacity=".35" stroke-width="2"/>`;
    s += `<g opacity="0"><animate attributeName="opacity" to="1" begin=".05s" dur=".45s" fill="freeze"/>
      <animateTransform attributeName="transform" type="translate" from="50 0" to="0 0" begin=".05s" dur=".55s" fill="freeze"/>
      ${enT(912, 228, String(i + 1).padStart(2, "0"), 140, 800, acc, "end")}
      ${arT(910, 282, `النقطة ${i + 1} من ${n}`, 19, 600, "#e2e8f0")}
      ${enT(910, 308, `KEY POINT ${i + 1} / ${n}`, 12.5, 500, "#8ea3ba", "end", FM)}
    </g>`;
    for (let k = 0; k < n; k++) s += `<rect x="${886 - k * 30}" y="342" width="22" height="6" rx="3" fill="${k <= i ? acc : "#1e334d"}"/>`;
    const pct = (i + 1) / n, r = 28, cc = 2 * Math.PI * r;
    s += `<g transform="translate(870,440)" opacity="0">${ap(0.3, 0)}
      <circle r="${r}" fill="none" stroke="#1e334d" stroke-width="5"/>
      <circle r="${r}" fill="none" stroke="${acc}" stroke-width="5" stroke-linecap="round" stroke-dasharray="${cc}" stroke-dashoffset="${cc}" transform="rotate(-90)">${grow("stroke-dashoffset", cc * (1 - pct), 0.4, 0.9)}</circle>
      ${enT(0, 5, Math.round(pct * 100) + "%", 13, 700, "#fff", "middle", FM)}
    </g>`;
    const ar = fitW(p[1], 580, 6, 33, 20, 600), en = fitW(p[0], 580, 4, 18, 13, 500, FD);
    const totalH = ar.lines.length * ar.sz * 1.55 + 40 + en.lines.length * en.sz * 1.45;
    let y = Math.max(96, (H - totalH) / 2 + ar.sz * 0.9);
    const tt = syncTimes(ar.lines.length, c.clips[0]);
    ar.lines.forEach((ln, k) => { s += `<g opacity="0">${ap(tt[k], 16)}${arT(640, y, ln, ar.sz, 600, "#fff")}</g>`; y += ar.sz * 1.55; });
    const lineAt = tt[tt.length - 1] + 0.45;
    s += `<rect x="640" y="${y - ar.sz * 0.75}" width="0" height="3" rx="1.5" fill="${acc}"><animate attributeName="x" to="60" begin="${lineAt}s" dur=".65s" fill="freeze"/>${grow("width", 580, lineAt, 0.65)}</rect>`;
    y += 12;
    en.lines.forEach((ln, k) => { s += `<g opacity="0">${ap(lineAt + 0.35 + k * 0.12, 10)}${enT(60, y + k * en.sz * 1.45, ln, en.sz, 500, "#8ea3ba")}</g>`; });
    const end = c.clips[0].at + c.clips[0].dur;
    s += `<g>${checkIcon(80, 488, 17, GREEN, end - 0.2)}</g>`;
    return svgw(acc, s);
  }

  // =====================================================================
  // CODE
  const KW = /^(def|class|return|if|elif|else|for|in|while|with|as|import|from|async|await|yield|raise|try|except|const|let|var|new|function|lambda|export|type|interface|true|false|True|False|None|null|SELECT|FROM|WHERE|ORDER|BY|LIMIT|CREATE|TABLE|INSERT|INTO|VALUES|EXTENSION|NOT|EXISTS|WITH|JOIN|ON|AND|OR|DESC|USING|COALESCE|PRIMARY|KEY|run)$/;
  function colorize(line) {
    const re = /(#.*$|\/\/.*$|--\s.*$)|("(?:[^"\\]|\\.)*"?|'(?:[^'\\]|\\.)*'?|`[^`]*`?)|([A-Za-z_][\w]*)|(\d+(?:\.\d+)?)|(@[\w.]+)/g;
    let out = "", last = 0, m;
    while ((m = re.exec(line))) {
      out += esc(line.slice(last, m.index));
      const [tok, cm, str, word, num, dec] = m;
      const col = cm ? "#7dd3fc" : str ? "#fbbf77" : word ? (KW.test(word) ? "#c4a7ff" : (line[m.index + tok.length] === "(" ? "#6ee7b7" : null)) : num ? "#f9a8d4" : dec ? "#fde68a" : null;
      out += col ? `<tspan fill="${col}">${esc(tok)}</tspan>` : esc(tok);
      last = m.index + tok.length;
    }
    return out + esc(line.slice(last));
  }
  function code(l, c) {
    const acc = l.acc, raw = l.ex.replace(/\t/g, "  ").split("\n");
    const textW = 742, maxLen = Math.max(...raw.map(x => x.length));
    const fs = Math.max(13, Math.min(17, textW / (maxLen * 0.6)));
    const perLine = Math.floor(textW / (fs * 0.6));
    const rows = [];
    raw.forEach((ln, k) => {
      if (ln.length <= perLine) { rows.push({ n: k + 1, t: ln }); return; }
      const indent = (ln.match(/^\s*/) || [""])[0] + "    ";
      let rest = ln, first = true;
      while (rest.length) {
        const lim = first ? perLine : perLine - indent.length;
        let cut = rest.length <= lim ? rest.length : rest.lastIndexOf(" ", lim);
        if (cut <= 0) cut = lim;
        rows.push({ n: first ? k + 1 : "", t: (first ? "" : indent) + rest.slice(0, cut), src: k });
        rest = rest.slice(cut).replace(/^\s+/, "");
        first = false;
      }
    });
    const lh = fs * 1.62, h = Math.min(470, 70 + rows.length * lh + 22), y0 = Math.max(52, (H - h) / 2 + 12);
    const nLines = raw.length, step = Math.min(0.75, (c.dur * 0.72) / nLines);
    let s = `<g opacity="0">${ap(0.1, 14)}
      <rect x="64" y="${y0}" width="832" height="${h}" rx="16" fill="#0a1524" stroke="#26405e" stroke-width="1.8"/>
      <path d="M64,${y0 + 44} v-28 a16,16 0 0 1 16,-16 h800 a16,16 0 0 1 16,16 v28 z" fill="#152740"/>
      <circle cx="92" cy="${y0 + 22}" r="6" fill="${RED}"/><circle cx="112" cy="${y0 + 22}" r="6" fill="#f5a524"/><circle cx="132" cy="${y0 + 22}" r="6" fill="${GREEN}"/>
      ${enT(158, y0 + 27, window.MotionKit.langOf(l.ex), 13.5, 500, "#9fb2c6", "start", FM)}
      <rect x="${876 - 170}" y="${y0 + 10}" width="170" height="24" rx="12" fill="${acc}" opacity=".2"/>
      ${arT(862, y0 + 27, "مثال عملي  ·  LIVE CODE", 12.5, 700, acc)}
    </g>`;
    let srcLine = -1, b = 0.6;
    rows.forEach((r, k) => {
      const yy = y0 + 72 + k * lh;
      if (r.n !== "") { srcLine++; b = 0.6 + srcLine * step; }
      s += `<g opacity="0"><animate attributeName="opacity" to="1" begin="${b}s" dur=".25s" fill="freeze"/>
        <rect x="74" y="${yy - fs - 1}" width="812" height="${lh - 1}" rx="6" fill="${acc}" opacity="0"><animate attributeName="opacity" values="0;.16;0" begin="${b}s" dur="${Math.max(0.9, step * 1.2)}s" fill="freeze"/></rect>
        ${enT(102, yy, String(r.n), fs * 0.85, 500, "#4d6683", "end", FM)}
        <text x="122" y="${yy}" font-family="${FM}" font-size="${fs}" fill="#e2e8f0" xml:space="preserve" style="white-space:pre">${colorize(r.t)}</text>
      </g>`;
    });
    const last = y0 + 72 + (rows.length - 1) * lh;
    s += `<rect x="122" y="${last + 8}" width="${fs * 0.6}" height="3" fill="${acc}" opacity="0"><animate attributeName="opacity" values="0;1;0" dur=".9s" begin="${b + 0.4}s" repeatCount="indefinite"/></rect>`;
    return svgw(acc, s);
  }

  // =====================================================================
  // MISTAKE vs PRO TIP  (RTL: mistake on the right, read first)
  function pitfall(l, enr, c) {
    const acc = l.acc, t2 = c.extra.second || 2;
    let s = `<g opacity="0">${ap(0.1, -10)}
      ${arC(480, 66, "خطأ شائع ونصيحة خبير", 27, 700, "#fff")}
      ${enT(480, 90, "COMMON MISTAKE  vs.  PRO TIP", 12.5, 600, "#8ea3ba", "middle", FM, 'letter-spacing="1.5"')}
    </g>`;
    const card = (x, color, bg, badge, isX, arTxt, enTxt, at, arFill, enFill) => {
      const a = fitW(arTxt, 350, 6, 21, 15, 600), e = fitW(enTxt, 350, 4, 13.5, 11, 500, FD);
      const icon = isX
        ? `<path d="M-5,-5 L5,5 M5,-5 L-5,5" stroke="${color}" stroke-width="2.6" stroke-linecap="round"/>`
        : `<path d="M-6,0 l4,4 l8,-9" fill="none" stroke="${color}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`;
      let g = `<g opacity="0">${ap(at, 20)}
        <rect x="${x}" y="114" width="404" height="380" rx="18" fill="${bg}" stroke="${color}" stroke-width="2.2"/>
        <rect x="${x + 404 - 26 - 150}" y="136" width="150" height="32" rx="16" fill="${color}" opacity=".2"/>
        <g transform="translate(${x + 404 - 46},152)"><circle r="11" fill="${color}" opacity=".25"/>${icon}</g>
        ${arT(x + 404 - 64, 157, badge, 14, 700, color)}`;
      let y = 210;
      a.lines.forEach(ln => { g += arT(x + 378, y, ln, a.sz, 600, arFill); y += a.sz * 1.6; });
      y += 4;
      g += `<line x1="${x + 26}" y1="${y - 12}" x2="${x + 378}" y2="${y - 12}" stroke="${color}" stroke-opacity=".3"/>`;
      y += 14;
      e.lines.forEach(ln => { g += enT(x + 26, y, ln, e.sz, 500, enFill); y += e.sz * 1.5; });
      return g + "</g>";
    };
    s += card(498, RED, "#1e1522", "تجنّب هذا", true, enr.mistake[1], enr.mistake[0], 0.35, "#ffe4e0", "#d9a49a");
    s += card(58, GREEN, "#0f2326", "افعل هذا", false, enr.bestPractice[1], enr.bestPractice[0], t2, "#ecfdf5", "#93cbb5");
    s += `<g opacity="0">${ap(t2 + 0.2, 0)}<circle cx="480" cy="304" r="20" fill="#0b1728" stroke="#3a5576" stroke-width="1.5"/>
      <path d="M487,304 h-14 m5,-5 l-5,5 l5,5" fill="none" stroke="#cbd5e1" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></g>`;
    return svgw(acc, s);
  }

  // =====================================================================
  // QUIZ with countdown + reveal synced to narration
  function quiz(l, enr, c) {
    const acc = l.acc, q = enr.quiz, R = c.extra.reveal, C0 = c.extra.countFrom, cd = R - C0;
    let s = ""; // chapter name ("اختبار سريع") is already shown in the top bar
    const qa = fitW(c.data.question || q.q[1].replace(/^اختبار سريع:\s*/, ""), 832, 2, 24, 17, 700);
    qa.lines.forEach((ln, k) => { s += `<g opacity="0">${ap(0.35 + k * 0.15, -8)}${arT(896, 116 + k * qa.sz * 1.4, ln, qa.sz, 700, "#fff")}</g>`; });
    const top = 116 + qa.lines.length * qa.sz * 1.4 - 4, rowH = 84, gap = 12;
    const qClip = c.clips[0];
    q.opts.forEach((opt, i) => {
      const y = top + i * (rowH + gap), win = i === q.ans;
      const at = Math.max(0.7 + i * 0.3, qClip.at + qClip.dur * 0.45 + i * 0.35);
      const a = fitW(opt[1], 720, 1, 18, 12.5, 600), e = fitW(opt[0], 720, 1, 12.5, 10.5, 500, FD);
      s += `<g opacity="0">${ap(at, 14)}
        <rect x="64" y="${y}" width="832" height="${rowH}" rx="14" fill="#101f33" stroke="#263f5d" stroke-width="1.8">
          ${win ? `<animate attributeName="stroke" to="${GREEN}" begin="${R}s" dur=".3s" fill="freeze"/><animate attributeName="fill" to="#0f2c2b" begin="${R}s" dur=".3s" fill="freeze"/>` : ""}
        </rect>
        ${win ? "" : `<rect x="64" y="${y}" width="832" height="${rowH}" rx="14" fill="#07101e" opacity="0"><animate attributeName="opacity" to=".55" begin="${R}s" dur=".35s" fill="freeze"/></rect>`}
        <rect x="836" y="${y + 22}" width="40" height="40" rx="10" fill="#1b3350">${win ? `<animate attributeName="fill" to="${GREEN}" begin="${R}s" dur=".3s" fill="freeze"/>` : ""}</rect>
        ${arC(856, y + 48, AR_LETTERS[i], 19, 700, "#fff")}
        ${arT(816, y + 37, a.lines[0], a.sz, 600, "#f1f5f9")}
        ${enT(816, y + 63, e.lines[0], e.sz, 500, "#8ea3ba", "end")}
        ${win ? `<g opacity="0"><animate attributeName="opacity" to="1" begin="${R + 0.15}s" dur=".2s" fill="freeze"/>${checkIcon(96, y + rowH / 2, 16, GREEN, R + 0.1)}</g>` : ""}
      </g>`;
    });
    // countdown bar + digits
    const by = top + 3 * (rowH + gap) + 6;
    s += `<rect x="64" y="${by}" width="832" height="8" rx="4" fill="#16283f"/>
      <rect x="64" y="${by}" width="832" height="8" rx="4" fill="${acc}" opacity="0">
        <set attributeName="opacity" to="1" begin="${C0 - 0.6}s"/>
        <animate attributeName="width" from="832" to="0" begin="${C0}s" dur="${cd}s" fill="freeze"/>
        <set attributeName="opacity" to="0" begin="${R}s"/>
      </rect>`;
    const nums = Math.max(1, Math.round(cd));
    for (let k = 0; k < nums; k++) {
      const b = C0 + k * (cd / nums);
      s += `<text x="480" y="${by + 40}" text-anchor="middle" font-family="${FD}" font-size="26" font-weight="800" fill="${acc}" opacity="0">${nums - k}
        <set attributeName="opacity" to="1" begin="${b}s"/><set attributeName="opacity" to="0" begin="${b + cd / nums - 0.05}s"/></text>`;
    }
    s += `<g opacity="0"><animate attributeName="opacity" to="1" begin="${R + 0.1}s" dur=".35s" fill="freeze"/>
      ${arC(480, by + 40, `الإجابة الصحيحة: (${AR_LETTERS[q.ans]})`, 19, 700, GREEN)}</g>`;
    return svgw(acc, s);
  }

  // =====================================================================
  // LESSON SUMMARY
  function outro(l, c) {
    const acc = l.acc, next = c.data.next;
    let s = `<g opacity="0">${ap(0.1, 10)}
      ${arT(896, 84, "الخلاصة", 34, 700, "#fff")}
      ${enT(64, 84, "KEY TAKEAWAYS", 14, 600, "#8ea3ba", "start", FM, 'letter-spacing="1.5"')}
      <rect x="64" y="100" width="832" height="1.5" fill="#243c59"/>
    </g>`;
    const pts = l.p.slice(0, 5), rowH = Math.min(66, 300 / pts.length);
    pts.forEach((p, k) => {
      const y = 118 + k * rowH, b = 0.45 + k * 0.4, mid = y + (rowH - 10) / 2;
      const a = fitW(p[1], 740, 1, 17, 12.5, 600), e = fitW(p[0], 740, 1, 12.5, 10.5, 500, FD);
      s += `<g opacity="0">${ap(b, 12)}
        <rect x="64" y="${y}" width="832" height="${rowH - 10}" rx="12" fill="#101f33" stroke="#243c59"/>
        <circle cx="868" cy="${mid}" r="12" fill="${acc}"/>
        <path d="M863,${mid} l4,4 l7,-8" stroke="${INK}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        ${arT(844, mid - 3, a.lines[0], a.sz, 600, "#f1f5f9")}
        ${enT(844, mid + 16, e.lines[0], e.sz, 500, "#8ea3ba", "end")}
      </g>`;
    });
    const by = 118 + pts.length * rowH + 10, at = 0.8 + pts.length * 0.4;
    if (next) {
      const nt = fitW(next.t[1], 560, 1, 17, 12, 700);
      s += `<g opacity="0">${ap(at, 10)}
        <rect x="64" y="${by}" width="832" height="58" rx="14" fill="${acc}"/>
        ${arT(872, by + 35, "الدرس القادم", 14, 700, INK)}
        <path d="M778,${by + 29} h-16 m6,-6 l-6,6 l6,6" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
        ${arT(748, by + 36, nt.lines[0], nt.sz, 700, INK)}
        ${enT(88, by + 35, next.id, 15, 700, INK, "start", FM)}
      </g>`;
    } else {
      s += `<g opacity="0">${ap(at, 10)}<rect x="64" y="${by}" width="832" height="58" rx="14" fill="${GREEN}"/>
        ${arC(480, by + 36, "أنهيت آخر درس — جاهز للاختبار النهائي!", 19, 700, INK)}</g>`;
    }
    return svgw(acc, s);
  }

  // =====================================================================
  // COURSE OUTRO
  function courseOutro(c) {
    const acc = GREEN;
    let s = "";
    const conf = ["#f5a524", "#3db4f2", "#22c3a6", "#f2795b", "#e8618c", "#9ccc65"];
    for (let i = 0; i < 46; i++) {
      const x = (i * 211) % 960, d = 3 + (i % 5) * 0.7, b = (i % 9) * 0.35, w = 5 + (i % 3) * 3;
      s += `<rect x="${x}" y="-20" width="${w}" height="${w * 1.6}" rx="1.5" fill="${conf[i % 6]}" opacity=".8">
        <animateTransform attributeName="transform" type="translate" from="0 0" to="${(i % 2 ? 40 : -40)} 590" begin="${b}s" dur="${d}s" repeatCount="indefinite"/></rect>`;
    }
    s += `<g transform="translate(480,150)" opacity="0">${ap(0.2, 0, 0.8)}
      <circle r="66" fill="${acc}" opacity=".15"><animate attributeName="r" values="60;74;60" dur="3s" repeatCount="indefinite"/></circle>
      <circle r="50" fill="#13253d" stroke="${acc}" stroke-width="3"/>
      <polygon points="0,-30 8.8,-12 28.5,-9.3 14.3,4.6 17.6,24.3 0,15 -17.6,24.3 -14.3,4.6 -28.5,-9.3 -8.8,-12" fill="#f5a524"/>
    </g>`;
    s += `<g opacity="0">${ap(0.8, 14)}${arC(480, 278, "مبروك! أتممت الكورس", 48, 700, "#fff")}</g>`;
    s += `<g opacity="0">${ap(1.3, 10)}${arC(480, 318, `${c.data.lessons} درسًا من المفاهيم الأساسية حتى النشر في بيئة الإنتاج`, 19, 500, "#cbd5e1")}</g>`;
    const cta = ["راجع الدروس التي تحتاجها", "طبّق المشروع الختامي", "خذ الاختبار النهائي"];
    cta.forEach((t, i) => {
      const w = 250, x = 480 + 1.5 * w + 15 - (i + 1) * w - i * 15, at = 2.2 + i * 0.4;
      s += `<g opacity="0">${ap(at, 14)}<rect x="${x}" y="370" width="${w}" height="56" rx="14" fill="#101f33" stroke="${i === 2 ? acc : "#2a4566"}" stroke-width="1.8"/>
        ${enT(x + w - 22, 404, String(i + 1), 16, 800, acc, "end", FM)}
        ${arT(x + w - 44, 404, t, 16, 600, "#f1f5f9")}</g>`;
    });
    s += `<g opacity="0">${ap(3.8, 8)}${enT(480, 478, "AI ENGINEER STUDIO  ·  مهندس الذكاء الاصطناعي", 14, 600, "#8ea3ba", "middle", FA, 'letter-spacing="1"')}</g>`;
    return svgw(acc, s);
  }

  window.ArScenes = { courseIntro, stageCard, moduleCard, lessonIntro, analogy, diagram, point, code, pitfall, quiz, outro, courseOutro, fitW, mw };
})();
