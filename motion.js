// Upgraded Multi-Mode Motion Video Engine (Full Fun Explainer ~90-150s + Quick Recap ~35s)
// Includes Web Audio API studio SFX synthesizer and rich animated story chapters.
(function () {
  const K = window.SceneKit, W = K.W, H = K.H;
  const esc = K.esc, wrap = K.wrap, ap = K.appear;
  const FD = "Outfit, Readex Pro, IBM Plex Sans Arabic, sans-serif";
  const FA = "Readex Pro, IBM Plex Sans Arabic, sans-serif";
  const FM = "IBM Plex Mono, monospace";

  const svgw = (acc, inner) => {
    const u = K.nextId();
    return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">${K.bg(acc, u)}${inner}</svg>`;
  };
  const firstSentence = s => { const m = String(s).match(/^.*?[.!؟?](\s|$)/); return m ? m[0].trim() : s; };

  function fit(text, max, maxLines, size) {
    let m = max, lines = wrap(text, m), sz = size;
    while (lines.length > maxLines && sz > 17) { sz -= 3; m = Math.round(max * size / sz); lines = wrap(text, m); }
    return { lines, sz };
  }

  // Stylized animated geometric icon illustrations for the Fun Story / Analogy Act
  function metaphorArt(kind, acc) {
    const cx = 196, cy = 265;
    const ring = `<circle cx="${cx}" cy="${cy}" r="118" fill="${acc}" opacity=".09"><animate attributeName="r" values="110;126;110" dur="4s" repeatCount="indefinite"/></circle>
      <circle cx="${cx}" cy="${cy}" r="94" fill="none" stroke="${acc}" stroke-width="2" stroke-dasharray="8 10" opacity=".45">
        <animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="20s" repeatCount="indefinite"/>
      </circle>`;
    const glyphs = {
      brain: `<g transform="translate(${cx},${cy})">
        <circle r="54" fill="#13253d" stroke="${acc}" stroke-width="3"/>
        <circle cx="-18" cy="-12" r="14" fill="none" stroke="#3db4f2" stroke-width="3"/>
        <circle cx="18" cy="-12" r="14" fill="none" stroke="${acc}" stroke-width="3"/>
        <circle cx="0" cy="18" r="14" fill="none" stroke="#4fd1a5" stroke-width="3"/>
        <line x1="-8" y1="-8" x2="8" y2="-8" stroke="#fff" stroke-width="2"/>
        <line x1="-12" y1="0" x2="-4" y2="12" stroke="#fff" stroke-width="2"/>
        <line x1="12" y1="0" x2="4" y2="12" stroke="#fff" stroke-width="2"/>
      </g>`,
      library: `<g transform="translate(${cx},${cy})">
        <rect x="-56" y="-44" width="112" height="88" rx="12" fill="#13253d" stroke="${acc}" stroke-width="3"/>
        <line x1="0" y1="-44" x2="0" y2="44" stroke="${acc}" stroke-width="2.5"/>
        <rect x="-42" y="-26" width="30" height="6" rx="3" fill="#3db4f2"/>
        <rect x="-42" y="-10" width="24" height="6" rx="3" fill="#cbd5e1" opacity=".7"/>
        <rect x="-42" y="6" width="28" height="6" rx="3" fill="#cbd5e1" opacity=".5"/>
        <rect x="12" y="-26" width="30" height="6" rx="3" fill="${acc}"/>
        <rect x="12" y="-10" width="26" height="6" rx="3" fill="#4fd1a5"/>
        <rect x="12" y="6" width="20" height="6" rx="3" fill="#cbd5e1" opacity=".5"/>
      </g>`,
      chef: `<g transform="translate(${cx},${cy})">
        <circle r="56" fill="#13253d" stroke="${acc}" stroke-width="3"/>
        <path d="M-26,8 A26,26 0 1,1 26,8" fill="none" stroke="${acc}" stroke-width="5" stroke-linecap="round"/>
        <path d="M26,-8 A26,26 0 1,1 -26,-8" fill="none" stroke="#4fd1a5" stroke-width="5" stroke-linecap="round"/>
        <circle r="10" fill="#ffffff"/>
      </g>`,
      shield: `<g transform="translate(${cx},${cy})">
        <path d="M0,-62 L52,-40 L52,10 C52,42 26,60 0,70 C-26,60 -52,42 -52,10 L-52,-40 Z" fill="#13253d" stroke="${acc}" stroke-width="3.5"/>
        <path d="M-18,4 L-4,18 L24,-16" fill="none" stroke="#4fd1a5" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
      </g>`,
      rocket: `<g transform="translate(${cx},${cy})">
        <path d="M0,-64 C28,-38 30,8 22,34 L-22,34 C-30,8 -28,-38 0,-64 Z" fill="#13253d" stroke="${acc}" stroke-width="3"/>
        <circle cx="0" cy="-12" r="13" fill="#3db4f2"/>
        <path d="M-22,22 L-42,42 L-18,38 Z M22,22 L42,42 L18,38 Z" fill="${acc}"/>
        <path d="M-10,36 L0,64 L10,36 Z" fill="#f5a524"><animate attributeName="opacity" values="1;.45;1" dur=".45s" repeatCount="indefinite"/></path>
      </g>`,
      bolt: `<g transform="translate(${cx},${cy})">
        <circle r="56" fill="#13253d" stroke="${acc}" stroke-width="2.5"/>
        <polygon points="8,-44 -28,6 -2,6 -12,46 30,-6 4,-6" fill="${acc}"/>
      </g>`,
      compass: `<g transform="translate(${cx},${cy})">
        <circle r="56" fill="#13253d" stroke="${acc}" stroke-width="3"/>
        <polygon points="0,-42 12,0 0,10 -12,0" fill="${acc}"/>
        <polygon points="0,42 12,0 0,-10 -12,0" fill="#3db4f2" opacity=".7"/>
        <circle r="6" fill="#fff"/>
      </g>`,
      radar: `<g transform="translate(${cx},${cy})">
        <circle r="56" fill="#13253d" stroke="${acc}" stroke-width="2.5"/>
        <circle r="36" fill="none" stroke="${acc}" stroke-opacity=".45" stroke-width="1.5"/>
        <circle r="16" fill="none" stroke="${acc}" stroke-opacity=".45" stroke-width="1.5"/>
        <line x1="0" y1="0" x2="40" y2="-32" stroke="#4fd1a5" stroke-width="3">
          <animateTransform attributeName="transform" type="rotate" from="0 0 0" to="360 0 0" dur="3.5s" repeatCount="indefinite"/>
        </line>
        <circle cx="24" cy="-18" r="5" fill="#4fd1a5"/>
      </g>`,
      code: `<g transform="translate(${cx},${cy})">
        <rect x="-58" y="-44" width="116" height="88" rx="14" fill="#13253d" stroke="${acc}" stroke-width="3"/>
        <text x="0" y="10" text-anchor="middle" font-family="${FM}" font-size="34" font-weight="700" fill="${acc}">&lt;/&gt;</text>
      </g>`
    };
    return ring + (glyphs[kind] || glyphs.rocket);
  }

  // ACT 1: Cinematic Intro + Curiosity Hook
  function intro(l, enr, full) {
    const acc = l.acc, en = fit(l.t[0], 30, 3, 44), ar = fit(l.t[1], 38, 2, 30);
    const u = K.nextId();
    let s = `<text x="${W - 36}" y="${H - 34}" text-anchor="end" font-family="${FD}" font-weight="800" font-size="220" fill="none" stroke="${acc}" stroke-width="2" opacity="0">${esc(l.id)}
      <animate attributeName="opacity" to=".16" begin=".2s" dur="1s" fill="freeze"/></text>`;
    s += `<g opacity="0">${ap(0.12, -10)}
      <rect x="64" y="62" width="${34 + l.id.length * 13}" height="34" rx="9" fill="${acc}"/>
      <text x="81" y="84" font-family="${FM}" font-size="16" font-weight="700" fill="#07101e">${esc(l.id)}</text>
      <text x="${112 + l.id.length * 13}" y="84" font-family="${FM}" font-size="13.5" fill="#9fb2c6" letter-spacing="1.2">${esc(l.module.t[0].toUpperCase().slice(0, 56))}</text>
    </g>`;
    let y = 166;
    en.lines.forEach((ln, i) => {
      s += `<clipPath id="${u}c${i}"><rect x="54" y="${y - en.sz}" width="0" height="${en.sz * 1.4}"><animate attributeName="width" to="860" begin="${0.35 + i * 0.28}s" dur=".7s" fill="freeze"/></rect></clipPath>
        <text clip-path="url(#${u}c${i})" x="64" y="${y}" font-family="${FD}" font-weight="700" font-size="${en.sz}" fill="#ffffff">${esc(ln)}</text>`;
      y += en.sz * 1.2;
    });
    s += `<rect x="64" y="${y - en.sz * 0.42}" width="0" height="5" rx="2.5" fill="${acc}"><animate attributeName="width" to="180" begin="${0.55 + en.lines.length * 0.25}s" dur=".6s" fill="freeze"/></rect>`;
    y += 34;
    ar.lines.forEach((ln, i) => {
      s += `<g opacity="0">${ap(1.15 + i * 0.22, 12)}<text x="896" y="${y + i * ar.sz * 1.48}" direction="rtl" text-anchor="start" font-family="${FA}" font-weight="600" font-size="${ar.sz}" fill="#cbd5e1">${esc(ln)}</text></g>`;
    });
    if (full && enr) {
      const hookAr = fit(enr.hook[1], 56, 2, 18);
      s += `<g opacity="0">${ap(2.1, 14)}
        <rect x="64" y="424" width="832" height="78" rx="14" fill="#122338" stroke="${acc}" stroke-opacity=".55" stroke-width="1.5"/>
        <text x="86" y="454" font-family="${FD}" font-size="15" font-weight="600" fill="${acc}">💡 ${esc(wrap(enr.hook[0], 72)[0])}</text>
        <text x="874" y="482" direction="rtl" text-anchor="start" font-family="${FA}" font-size="16" fill="#e2e8f0">${esc(hookAr.lines[0])}</text>
      </g>`;
    }
    return svgw(acc, s);
  }

  // ACT 2 (Full Mode): Fun Story & Real-World Analogy
  function story(l, enr) {
    const acc = l.acc;
    const en = fit(enr.analogy[0], 36, 4, 24);
    const ar = fit(enr.analogy[1], 42, 4, 23);
    let s = metaphorArt(enr.icon, acc);
    s += `<g opacity="0">${ap(0.15, -10)}
      <rect x="360" y="54" width="236" height="32" rx="16" fill="${acc}" opacity=".18"/>
      <text x="380" y="75" font-family="${FM}" font-size="13" font-weight="700" fill="${acc}">MENTAL MODEL · القصة والتشبيه</text>
    </g>`;
    s += `<rect x="360" y="106" width="540" height="378" rx="18" fill="#101f33" stroke="#243c59" stroke-width="1.6" opacity="0">${ap(0.25, 16)}</rect>`;
    let y = 160;
    en.lines.forEach((ln, i) => {
      s += `<g opacity="0">${ap(0.55 + i * 0.22, 12)}<text x="392" y="${y}" font-family="${FD}" font-weight="600" font-size="${en.sz}" fill="#ffffff">${esc(ln)}</text></g>`;
      y += en.sz * 1.38;
    });
    s += `<rect x="392" y="${y - 4}" width="0" height="2" fill="${acc}" opacity=".6"><animate attributeName="width" to="476" begin="1.4s" dur=".7s" fill="freeze"/></rect>`;
    y += 38;
    ar.lines.forEach((ln, i) => {
      s += `<g opacity="0">${ap(1.8 + i * 0.25, 12)}<text x="868" y="${y}" direction="rtl" text-anchor="start" font-family="${FA}" font-weight="500" font-size="${ar.sz}" fill="#cbd5e1">${esc(ln)}</text></g>`;
      y += ar.sz * 1.55;
    });
    return svgw(acc, s);
  }

  // ACT 4..N: Deep-Dive Animated Key Point Storyboard
  function point(l, i, full) {
    const acc = l.acc, p = l.p[i], n = l.p.length;
    const en = fit(p[0], 34, 4, 30), ar = fit(p[1], 40, 4, 27);
    let s = `<rect x="0" y="0" width="276" height="${H}" fill="#0c1829"/>
      <line x1="276" y1="0" x2="276" y2="${H}" stroke="${acc}" stroke-opacity=".35" stroke-width="2"/>`;
    s += `<g opacity="0">
      <animate attributeName="opacity" to="1" begin=".05s" dur=".45s" fill="freeze"/>
      <animateTransform attributeName="transform" type="translate" from="-50 0" to="0 0" begin=".05s" dur=".55s" fill="freeze"/>
      <text x="50" y="230" font-family="${FD}" font-weight="800" font-size="146" fill="${acc}">${String(i + 1).padStart(2, "0")}</text>
      <text x="56" y="280" font-family="${FM}" font-size="14" fill="#9fb2c6">KEY INSIGHT ${i + 1} / ${n}</text>
      <text x="56" y="308" font-family="${FA}" font-size="17" font-weight="600" fill="#cbd5e1">نقطة أساسية ${i + 1}</text>
    </g>`;
    for (let k = 0; k < n; k++) {
      s += `<rect x="${56 + k * 32}" y="352" width="24" height="6" rx="3" fill="${k <= i ? acc : "#1e334d"}"/>`;
    }
    // Live progress ring in sidebar
    const pct = (i + 1) / n, r = 28, c = 2 * Math.PI * r;
    s += `<g transform="translate(86, 444)" opacity="0">${ap(0.3, 0)}
      <circle r="${r}" fill="none" stroke="#1e334d" stroke-width="5"/>
      <circle r="${r}" fill="none" stroke="${acc}" stroke-width="5" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${c}" transform="rotate(-90)">
        <animate attributeName="stroke-dashoffset" from="${c}" to="${c * (1 - pct)}" begin=".4s" dur=".9s" fill="freeze"/>
      </circle>
      <text y="5" text-anchor="middle" font-family="${FM}" font-size="13" font-weight="700" fill="#fff">${Math.round(pct * 100)}%</text>
    </g>`;

    const totalH = en.lines.length * en.sz * 1.32 + 54 + ar.lines.length * ar.sz * 1.56;
    let y = Math.max(112, (H - totalH) / 2 + en.sz);
    en.lines.forEach((ln, k) => {
      s += `<g opacity="0">${ap(0.3 + k * 0.2, 16)}<text x="326" y="${y}" font-family="${FD}" font-weight="600" font-size="${en.sz}" fill="#ffffff">${esc(ln)}</text></g>`;
      y += en.sz * 1.32;
    });
    s += `<rect x="326" y="${y - en.sz * 0.25}" width="0" height="3" rx="1.5" fill="${acc}"><animate attributeName="width" to="580" begin="${0.55 + en.lines.length * 0.2}s" dur=".65s" fill="freeze"/></rect>`;
    y += 42;
    ar.lines.forEach((ln, k) => {
      s += `<g opacity="0">${ap(1.1 + k * 0.22, 16)}<text x="906" y="${y}" direction="rtl" text-anchor="start" font-family="${FA}" font-weight="500" font-size="${ar.sz}" fill="#cbd5e1">${esc(ln)}</text></g>`;
      y += ar.sz * 1.56;
    });
    s += `<circle cx="892" cy="64" r="18" fill="none" stroke="#4fd1a5" stroke-width="3" stroke-dasharray="115" stroke-dashoffset="115"><animate attributeName="stroke-dashoffset" to="0" begin="1.7s" dur=".6s" fill="freeze"/></circle>
      <path d="M883,64 l6,7 l12,-14" fill="none" stroke="#4fd1a5" stroke-width="3.2" stroke-linecap="round" stroke-dasharray="36" stroke-dashoffset="36"><animate attributeName="stroke-dashoffset" to="0" begin="2.2s" dur=".4s" fill="freeze"/></path>`;
    if (full) {
      s += `<g opacity="0">${ap(2.6, 10)}
        <rect x="326" y="458" width="580" height="38" rx="10" fill="#122338" stroke="#22384f"/>
        <text x="346" y="482" font-family="${FM}" font-size="12.5" fill="${acc}">⚡ APPLY THIS · طبّق هذه النقطة في مشروعك القادم</text>
      </g>`;
    }
    return svgw(acc, s);
  }

  // CODE WALKTHROUGH ACT
  function langOf(ex) { return /SELECT|CREATE|WITH /.test(ex) ? "query.sql" : /const |=>|z\.object/.test(ex) ? "example.ts" : /\{\{|<policy>/.test(ex) ? "prompt.xml" : /vllm|run:/.test(ex) ? "deploy.sh" : "example.py"; }
  function code(l) {
    const acc = l.acc, lines = l.ex.split("\n");
    const fs = lines.length > 9 ? 15 : 17, lh = fs * 1.65;
    const h = Math.min(448, 76 + lines.length * lh + 24), y0 = (H - h) / 2;
    let s = `<g opacity="0">${ap(0.1, 14)}
      <rect x="64" y="${y0}" width="832" height="${h}" rx="16" fill="#0a1524" stroke="#26405e" stroke-width="1.8"/>
      <rect x="64" y="${y0}" width="832" height="44" rx="16" fill="#152740"/>
      <rect x="64" y="${y0 + 30}" width="832" height="14" fill="#152740"/>
      <circle cx="92" cy="${y0 + 22}" r="6" fill="#f2795b"/><circle cx="112" cy="${y0 + 22}" r="6" fill="#f5a524"/><circle cx="132" cy="${y0 + 22}" r="6" fill="#4fd1a5"/>
      <text x="158" y="${y0 + 27}" font-family="${FM}" font-size="13.5" fill="#9fb2c6">${langOf(l.ex)}</text>
      <rect x="706" y="${y0 + 10}" width="170" height="24" rx="12" fill="${acc}" opacity=".2"/>
      <text x="791" y="${y0 + 26}" text-anchor="middle" font-family="${FA}" font-size="12.5" font-weight="600" fill="${acc}">LIVE CODE · مثال عملي</text>
    </g>`;
    lines.forEach((ln, k) => {
      const yy = y0 + 74 + k * lh, b = 0.45 + k * 0.42;
      const isComment = /^\s*(#|\/\/|--)/.test(ln);
      s += `<g opacity="0"><animate attributeName="opacity" to="1" begin="${b}s" dur=".22s" fill="freeze"/>
        <rect x="74" y="${yy - fs}" width="812" height="${lh - 2}" rx="6" fill="${acc}" opacity="0">
          <animate attributeName="opacity" values="0;.14;0" begin="${b}s" dur=".9s" fill="freeze"/>
        </rect>
        <text x="92" y="${yy}" font-family="${FM}" font-size="${fs}" fill="#4d6683">${k + 1}</text>
        <text x="128" y="${yy}" font-family="${FM}" font-size="${fs}" fill="${isComment ? "#7dd3fc" : "#f1f5f9"}" xml:space="preserve">${esc(ln)}</text>
      </g>`;
    });
    const last = y0 + 74 + (lines.length - 1) * lh;
    s += `<rect x="128" y="${last + 8}" width="10" height="3" fill="${acc}" opacity="0"><animate attributeName="opacity" values="0;1;0" dur=".9s" begin="${0.5 + lines.length * 0.42}s" repeatCount="indefinite"/></rect>`;
    return svgw(acc, s);
  }

  // PITFALL vs BEST PRACTICE ACT (Full Mode)
  function pitfall(l, enr) {
    const acc = l.acc;
    const mEn = fit(enr.mistake[0], 28, 4, 19), mAr = fit(enr.mistake[1], 32, 4, 18);
    const bEn = fit(enr.bestPractice[0], 28, 4, 19), bAr = fit(enr.bestPractice[1], 32, 4, 18);
    let s = `<g opacity="0">${ap(0.1, -10)}
      <text x="480" y="62" text-anchor="middle" font-family="${FD}" font-weight="700" font-size="26" fill="#ffffff">Common Mistake vs. Pro Tip · خطأ شائع مقابل نصيحة خبير</text>
    </g>`;
    // Left Red Card (Mistake)
    s += `<g opacity="0">${ap(0.4, 20)}
      <rect x="58" y="96" width="404" height="392" rx="18" fill="#1e1522" stroke="#f2795b" stroke-width="2.2"/>
      <rect x="82" y="118" width="196" height="30" rx="15" fill="#f2795b" opacity=".2"/>
      <text x="180" y="138" text-anchor="middle" font-family="${FM}" font-size="13" font-weight="700" fill="#f2795b">❌ AVOID · تجنّب هذا</text>
      ${mEn.lines.map((ln, i) => `<text x="84" y="${188 + i * (mEn.sz * 1.4)}" font-family="${FD}" font-size="${mEn.sz}" font-weight="600" fill="#ffe4e0">${esc(ln)}</text>`).join("")}
      <line x1="84" y1="316" x2="436" y2="316" stroke="#f2795b" stroke-opacity=".3"/>
      ${mAr.lines.map((ln, i) => `<text x="436" y="${354 + i * (mAr.sz * 1.55)}" direction="rtl" text-anchor="start" font-family="${FA}" font-size="${mAr.sz}" fill="#f8b4a6">${esc(ln)}</text>`).join("")}
    </g>`;
    // Right Emerald Card (Best Practice)
    s += `<g opacity="0">${ap(1.6, 20)}
      <rect x="498" y="96" width="404" height="392" rx="18" fill="#0f2326" stroke="#4fd1a5" stroke-width="2.2"/>
      <rect x="522" y="118" width="212" height="30" rx="15" fill="#4fd1a5" opacity=".2"/>
      <text x="628" y="138" text-anchor="middle" font-family="${FM}" font-size="13" font-weight="700" fill="#4fd1a5">✅ DO THIS · افعل هذا</text>
      ${bEn.lines.map((ln, i) => `<text x="524" y="${188 + i * (bEn.sz * 1.4)}" font-family="${FD}" font-size="${bEn.sz}" font-weight="600" fill="#ecfdf5">${esc(ln)}</text>`).join("")}
      <line x1="524" y1="316" x2="876" y2="316" stroke="#4fd1a5" stroke-opacity=".3"/>
      ${bAr.lines.map((ln, i) => `<text x="876" y="${354 + i * (bAr.sz * 1.55)}" direction="rtl" text-anchor="start" font-family="${FA}" font-size="${bAr.sz}" fill="#a7f3d0">${esc(ln)}</text>`).join("")}
    </g>`;
    return svgw(acc, s);
  }

  // QUICK BRAIN CHECK ACT (Full Mode — Animated Countdown + Answer Reveal!)
  function quizScene(l, enr, revealAt) {
    const acc = l.acc, q = enr.quiz;
    const rev = revealAt || 5.8;
    const cdStart = Math.max(1.2, rev - 4.6);
    const cdDur = Math.max(1.5, rev - cdStart);
    const qEn = wrap(q.q[0], 66)[0], qAr = wrap(q.q[1], 68)[0];
    let s = `<g opacity="0">${ap(0.1, -10)}
      <rect x="64" y="42" width="268" height="32" rx="16" fill="${acc}" opacity=".2"/>
      <text x="198" y="63" text-anchor="middle" font-family="${FM}" font-size="13" font-weight="700" fill="${acc}">🧠 BRAIN CHECK · تحدي الفهم السريع</text>
      <text x="64" y="110" font-family="${FD}" font-weight="700" font-size="22" fill="#ffffff">${esc(qEn)}</text>
      <text x="896" y="144" direction="rtl" text-anchor="start" font-family="${FA}" font-weight="600" font-size="20" fill="#cbd5e1">${esc(qAr)}</text>
    </g>`;

    const letters = ["A", "B", "C"];
    q.opts.forEach((opt, idx) => {
      const y = 178 + idx * 92, isWin = idx === q.ans;
      const tEn = wrap(opt[0], 72)[0], tAr = wrap(opt[1], 74)[0];
      s += `<g opacity="0">${ap(0.55 + idx * 0.25, 14)}
        <rect x="64" y="${y}" width="832" height="78" rx="14" fill="#101f33" stroke="#263f5d" stroke-width="1.8">
          ${isWin ? `<animate attributeName="stroke" to="#4fd1a5" begin="${rev}s" dur=".3s" fill="freeze"/><animate attributeName="fill" to="#0f2c2b" begin="${rev}s" dur=".3s" fill="freeze"/>` : `<animate attributeName="opacity" to=".4" begin="${rev}s" dur=".35s" fill="freeze"/>`}
        </rect>
        <rect x="82" y="${y + 20}" width="36" height="36" rx="9" fill="#1b3350">
          ${isWin ? `<animate attributeName="fill" to="#4fd1a5" begin="${rev}s" dur=".3s" fill="freeze"/>` : ""}
        </rect>
        <text x="100" y="${y + 44}" text-anchor="middle" font-family="${FM}" font-size="16" font-weight="700" fill="#fff">${letters[idx]}</text>
        <text x="136" y="${y + 34}" font-family="${FD}" font-size="15.5" font-weight="600" fill="#f1f5f9">${esc(tEn)}</text>
        <text x="876" y="${y + 62}" direction="rtl" text-anchor="start" font-family="${FA}" font-size="15" fill="#9fb2c6">${esc(tAr)}</text>
      </g>`;
    });

    // Countdown timer bar -> switches to "Correct Answer!"
    s += `<rect x="64" y="472" width="832" height="10" rx="5" fill="#16283f"/>
      <rect x="64" y="472" width="832" height="10" rx="5" fill="${acc}">
        <animate attributeName="width" from="832" to="0" begin="${cdStart}s" dur="${cdDur}s" fill="freeze"/>
      </rect>
      <text x="480" y="508" text-anchor="middle" font-family="${FA}" font-size="15" font-weight="700" fill="#4fd1a5" opacity="0">
        ✓ Answer ${letters[q.ans]} · الإجابة الصحيحة هي (${letters[q.ans]})!
        <animate attributeName="opacity" to="1" begin="${rev}s" dur=".35s" fill="freeze"/>
      </text>`;
    return svgw(acc, s);
  }

  // OUTRO / GRAND RECAP ACT
  function outro(l, next) {
    const acc = l.acc;
    let s = `<g opacity="0">${ap(0.1, 10)}
      <text x="64" y="78" font-family="${FD}" font-weight="800" font-size="34" fill="#ffffff">🏆 Key Takeaways</text>
      <text x="896" y="78" direction="rtl" text-anchor="start" font-family="${FA}" font-weight="700" font-size="30" fill="#cbd5e1">ملخص الدرس</text>
    </g>`;
    const pts = l.p.slice(0, 5), rowH = Math.min(68, 305 / pts.length);
    pts.forEach((p, k) => {
      const y = 114 + k * rowH, b = 0.45 + k * 0.45;
      const e = wrap(p[0], 50)[0] + (wrap(p[0], 50).length > 1 ? "…" : "");
      const a = wrap(p[1], 52)[0] + (wrap(p[1], 52).length > 1 ? "…" : "");
      s += `<g opacity="0">${ap(b, 12)}
        <rect x="64" y="${y}" width="832" height="${rowH - 10}" rx="12" fill="#101f33" stroke="#243c59"/>
        <circle cx="94" cy="${y + (rowH - 10) / 2}" r="12" fill="${acc}"/>
        <path d="M89,${y + (rowH - 10) / 2} l4,4 l7,-8" stroke="#07101e" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <text x="118" y="${y + (rowH - 10) / 2 - 4}" font-family="${FD}" font-size="14.5" font-weight="600" fill="#f1f5f9">${esc(e)}</text>
        <text x="878" y="${y + (rowH - 10) / 2 + 15}" direction="rtl" text-anchor="start" font-family="${FA}" font-size="14" fill="#9fb2c6">${esc(a)}</text>
      </g>`;
    });
    const by = 114 + pts.length * rowH + 14;
    if (next) {
      s += `<g opacity="0">${ap(0.75 + pts.length * 0.45, 10)}
        <rect x="64" y="${by}" width="832" height="60" rx="14" fill="${acc}"/>
        <text x="88" y="${by + 36}" font-family="${FM}" font-size="13" font-weight="700" fill="#07101e">UP NEXT · التالي →</text>
        <text x="236" y="${by + 37}" font-family="${FD}" font-weight="700" font-size="17" fill="#07101e">${esc(next.id + " · " + wrap(next.t[0], 50)[0])}</text>
      </g>`;
    } else {
      s += `<g opacity="0">${ap(0.75 + pts.length * 0.45, 10)}
        <rect x="64" y="${by}" width="832" height="60" rx="14" fill="#4fd1a5"/>
        <text x="480" y="${by + 37}" text-anchor="middle" font-family="${FD}" font-weight="800" font-size="19" fill="#07101e">🎓 Ready for the Final Level Assessment Exam! · جاهز للاختبار النهائي!</text>
      </g>`;
    }
    return svgw(acc, s);
  }

  // Gentle zero-asset Web Audio API SFX synthesizer for transitions
  window.MotionAudio = (function () {
    let ctx = null;
    function ensure() {
      if (!ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) ctx = new AC();
      }
      if (ctx && ctx.state === "suspended") ctx.resume().catch(() => {});
      return ctx;
    }
    return {
      chime(freq) {
        try {
          const ac = ensure(); if (!ac) return;
          const o = ac.createOscillator(), g = ac.createGain();
          o.type = "sine";
          o.frequency.setValueAtTime(freq || 528, ac.currentTime);
          o.frequency.exponentialRampToValueAtTime((freq || 528) * 1.25, ac.currentTime + 0.14);
          g.gain.setValueAtTime(0.001, ac.currentTime);
          g.gain.exponentialRampToValueAtTime(0.045, ac.currentTime + 0.03);
          g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.28);
          o.connect(g); g.connect(ac.destination);
          o.start(); o.stop(ac.currentTime + 0.3);
        } catch (e) {}
      }
    };
  })();

  // Shared with the offline video renderer (video/page/arscenes.js)
  window.MotionKit = { metaphorArt, langOf };

  window.buildChapters = function (l, next, src, mode) {
    const full = mode !== "quick";
    const enr = window.enrichLesson ? window.enrichLesson(l) : null;
    const ttsList = window.TTS_MANIFEST && window.TTS_MANIFEST[l.id] ? window.TTS_MANIFEST[l.id] : null;
    const ch = [];

    if (full && enr) {
      // FULL FUN EXPLAINER VIDEO (~90–150 seconds!)
      ch.push({
        kind: "lessonIntro",
        name: ["1. Intro & Hook", "١. المقدمة والتشويق"],
        dur: 8,
        cap: [`${l.t[0]} — ${enr.hook[0]}`, `${l.t[1]} — ${enr.hook[1]}`],
        svg: () => intro(l, enr, true)
      });
      ch.push({
        kind: "analogy",
        name: ["2. Fun Analogy", "٢. القصة والتشبيه"],
        dur: 12,
        cap: [enr.analogy[0], enr.analogy[1]],
        svg: () => story(l, enr)
      });
      ch.push({
        kind: "diagram",
        name: ["3. Visual System", "٣. كيف يعمل بصريًا"],
        dur: 14,
        cap: [l.d[0], l.d[1]],
        svg: () => renderScene(l.v, l.vl, l.acc)
      });
      l.p.forEach((p, i) => ch.push({
        kind: "point",
        ptIndex: i,
        name: [`Insight ${i + 1}`, `فكرة ${i + 1}`],
        dur: 10,
        cap: p,
        svg: () => point(l, i, true)
      }));
      if (l.ex) {
        ch.push({
          kind: "code",
          name: ["Live Code", "تطبيق بالكود"],
          dur: Math.max(12, 5 + l.ex.split("\n").length * 1.1),
          cap: ["Walk through this real production snippet line by line.", "تابع هذا المثال العملي سطرًا بسطر واربطه بما تعلمناه."],
          svg: () => code(l)
        });
      }
      ch.push({
        kind: "pitfall",
        name: ["Mistake vs Pro Tip", "فخ ونصيحة خبير"],
        dur: 11,
        cap: [`Avoid: ${enr.mistake[0]} Instead: ${enr.bestPractice[0]}`, `تجنّب: ${enr.mistake[1]} والأفضل: ${enr.bestPractice[1]}`],
        svg: () => pitfall(l, enr)
      });
      ch.push({
        kind: "quiz",
        name: ["Brain Check", "تحدي سريع"],
        dur: 10,
        cap: [enr.quiz.q[0], enr.quiz.q[1]],
        svg: null // built below once quiz timing is known
      });
      ch.push({
        kind: "outro",
        name: ["Grand Recap", "الخلاصة الكبرى"],
        dur: 10,
        cap: [`Great job completing ${l.id}! Source: ${src[0]}`, `أحسنت بإتمام الدرس ${l.id}! المصدر: ${src[0]}`],
        svg: () => outro(l, next)
      });
    } else {
      // QUICK RECAP MODE (~35–45s)
      ch.push({ kind: "lessonIntro", name: ["Intro", "مقدمة"], dur: 6, cap: [l.t[0], l.t[1]], svg: () => intro(l, enr, false) });
      ch.push({ kind: "diagram", name: ["How it works", "كيف يعمل"], dur: 9, cap: [firstSentence(l.d[0]), firstSentence(l.d[1])], svg: () => renderScene(l.v, l.vl, l.acc) });
      l.p.forEach((p, i) => ch.push({ kind: "point", ptIndex: i, name: ["Point " + (i + 1), "نقطة " + (i + 1)], dur: 6, cap: p, svg: () => point(l, i, false) }));
      if (l.ex) ch.push({ kind: "code", name: ["Example", "مثال"], dur: Math.max(7, 2.5 + l.ex.split("\n").length * 0.45), cap: ["Hands-on example", "مثال عملي"], svg: () => code(l) });
      ch.push({ kind: "outro", name: ["Takeaways", "الخلاصة"], dur: 7, cap: ["Key takeaways · Source: " + src[0], "الخلاصة · المصدر: " + src[0]], svg: () => outro(l, next) });
    }

    // Attach neural TTS clips & extend chapter durations so narration never cuts off
    let ptSeen = 0;
    ch.forEach(c => {
      let tc = null;
      if (ttsList) {
        if (c.kind === "point") {
          const pts = ttsList.filter(x => x.kind === "point");
          tc = pts[c.ptIndex != null ? c.ptIndex : ptSeen++];
        } else {
          tc = ttsList.find(x => x.kind === c.kind);
        }
      }
      if (tc && tc.clips && tc.clips.length) {
        c.clips = tc.clips;
        const speechDur = tc.clips.reduce((a, x) => a + x.d, 0);
        if (c.kind === "quiz" && tc.clips.length >= 2) {
          c.quizPause = 3.5;
          const rev = 0.6 + tc.clips[0].d + c.quizPause;
          c.dur = Math.max(c.dur, rev + 0.4 + tc.clips[1].d + 1.2);
          c.svg = () => quizScene(l, enr, rev);
        } else {
          const gaps = (tc.clips.length - 1) * 0.45;
          c.dur = Math.max(c.dur, speechDur + gaps + 1.4);
        }
        if (full) {
          c.cap = [c.cap[0], tc.clips.map(x => x.t).join(" ")];
        }
      } else if (c.kind === "quiz" && !c.svg) {
        c.svg = () => quizScene(l, enr, 5.8);
      }
    });

    let t = 0;
    ch.forEach(c => { c.start = t; t += c.dur; });
    return { chapters: ch, total: t };
  };
})();
