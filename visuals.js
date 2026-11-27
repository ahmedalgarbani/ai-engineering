// Lesson Summary Image + Illustrative Images Generator + High-Res PNG Exporter
(function () {
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const wrap = (text, max) => {
    const words = String(text || "").split(/\s+/);
    const lines = [];
    let cur = "";
    for (const w of words) {
      if ((cur + " " + w).trim().length > max && cur) { lines.push(cur); cur = w; }
      else cur = (cur + " " + w).trim();
    }
    if (cur) lines.push(cur);
    return lines;
  };
  const FD = "Outfit, Readex Pro, IBM Plex Sans Arabic, sans-serif";
  const FA = "Readex Pro, IBM Plex Sans Arabic, sans-serif";
  const FM = "IBM Plex Mono, monospace";

  // Analogy art + code file names (moved here from the retired motion.js player)
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
  function langOf(ex) { return /SELECT|CREATE|WITH /.test(ex) ? "query.sql" : /const |=>|z\.object/.test(ex) ? "example.ts" : /\{\{|<policy>/.test(ex) ? "prompt.xml" : /services:\n|helm|values\.yaml/.test(ex) ? "docker-compose.yml" : /^\s*\{[\s\S]*"\w+":/.test(ex) ? "config.json" : /docker run|vllm|git worktree|run:/.test(ex) ? "deploy.sh" : "example.py"; }

  // 1. High-Res Lesson Summary Card Image (1200x840 SVG)
  function buildLessonSummarySVG(l, enr, lang) {
    const W = 1200, H = 840, acc = l.acc || "#3db4f2";
    const isAr = lang === "ar";
    const title = isAr ? l.t[1] : l.t[0];
    const subTitle = isAr ? l.t[0] : l.t[1];
    const stageName = isAr ? l.stage.t[1] : l.stage.t[0];
    const modName = isAr ? l.module.t[1] : l.module.t[0];
    const overview = isAr ? l.d[1] : l.d[0];
    const analogy = enr ? (isAr ? enr.analogy[1] : enr.analogy[0]) : "";
    const mistake = enr ? (isAr ? enr.mistake[1] : enr.mistake[0]) : "";
    const best = enr ? (isAr ? enr.bestPractice[1] : enr.bestPractice[0]) : "";
    const dir = isAr ? 'direction="rtl" text-anchor="start"' : 'text-anchor="start"';
    const xText = isAr ? 1140 : 60;

    // Header
    const titleLines = wrap(title, isAr ? 48 : 54).slice(0, 2);
    const ovLines = wrap(overview, isAr ? 72 : 84).slice(0, 3);
    const anaLines = wrap(analogy, isAr ? 42 : 48).slice(0, 4);
    const misLines = wrap(mistake, isAr ? 44 : 50).slice(0, 3);
    const bestLines = wrap(best, isAr ? 44 : 50).slice(0, 3);

    let svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="sumBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#07101e"/>
          <stop offset="60%" stop-color="#0c192c"/>
          <stop offset="100%" stop-color="#091322"/>
        </linearGradient>
        <radialGradient id="sumGlow" cx="${isAr ? "85%" : "15%"}" cy="12%" r="60%">
          <stop offset="0%" stop-color="${acc}" stop-opacity=".24"/>
          <stop offset="100%" stop-color="#07101e" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#sumBg)"/>
      <rect width="${W}" height="${H}" fill="url(#sumGlow)"/>
      <rect x="20" y="20" width="${W - 40}" height="${H - 40}" rx="24" fill="none" stroke="${acc}" stroke-opacity=".35" stroke-width="2"/>

      <!-- Top Badge Row -->
      <rect x="${isAr ? W - 150 : 60}" y="46" width="90" height="34" rx="10" fill="${acc}"/>
      <text x="${isAr ? W - 105 : 105}" y="68" text-anchor="middle" font-family="${FM}" font-size="16" font-weight="700" fill="#07101e">${esc(l.id)}</text>
      <text x="${isAr ? W - 170 : 168}" y="68" ${dir} font-family="${isAr ? FA : FD}" font-size="15" font-weight="600" fill="#9fb2c6">${esc(stageName)} · ${esc(modName)}</text>
      <rect x="${isAr ? 60 : W - 175}" y="46" width="115" height="34" rx="10" fill="#122338" stroke="${acc}" stroke-opacity=".45"/>
      <text x="${isAr ? 117 : W - 117}" y="68" text-anchor="middle" font-family="${FM}" font-size="14" font-weight="700" fill="${acc}">⏱ ${l.min} min</text>

      <!-- Lesson Title -->
      ${titleLines.map((ln, i) => `<text x="${xText}" y="${124 + i * 38}" ${dir} font-family="${isAr ? FA : FD}" font-size="30" font-weight="800" fill="#ffffff">${esc(ln)}</text>`).join("")}
      <text x="${xText}" y="${124 + titleLines.length * 38}" ${dir} font-family="${isAr ? FD : FA}" font-size="16" font-weight="600" fill="#7c96b3">${esc(subTitle)}</text>

      <!-- Overview Box -->
      <rect x="60" y="208" width="1080" height="96" rx="16" fill="#101f33" stroke="#22384f" stroke-width="1.5"/>
      <text x="${isAr ? 1114 : 84}" y="234" ${dir} font-family="${isAr ? FA : FM}" font-size="13" font-weight="700" fill="${acc}">${isAr ? "📌 ملخص الدرس العام" : "📌 LESSON OVERVIEW"}</text>
      ${ovLines.map((ln, i) => `<text x="${isAr ? 1114 : 84}" y="${258 + i * 22}" ${dir} font-family="${isAr ? FA : FD}" font-size="15.5" fill="#e2e8f0">${esc(ln)}</text>`).join("")}

      <!-- Left/Right Split: Key Points (620px) + Analogy & Architecture (436px) -->
      <rect x="${isAr ? 520 : 60}" y="322" width="620" height="316" rx="16" fill="#0d1a2c" stroke="#22384f" stroke-width="1.5"/>
      <text x="${isAr ? 1114 : 86}" y="352" ${dir} font-family="${isAr ? FA : FM}" font-size="14" font-weight="700" fill="${acc}">${isAr ? "✦ أهم النقاط الرئيسية" : "✦ KEY TAKEAWAYS"}</text>
    `;

    // Key points list
    const pts = l.p.slice(0, 5);
    pts.forEach((pt, idx) => {
      const py = 376 + idx * 50;
      const pTxt = wrap(isAr ? pt[1] : pt[0], isAr ? 54 : 60);
      const bx = isAr ? 1094 : 86;
      svg += `<rect x="${bx}" y="${py - 14}" width="26" height="26" rx="8" fill="${acc}"/>
        <text x="${bx + 13}" y="${py + 4}" text-anchor="middle" font-family="${FM}" font-size="13" font-weight="700" fill="#07101e">${idx + 1}</text>
        <text x="${isAr ? 1082 : 124}" y="${py}" ${dir} font-family="${isAr ? FA : FD}" font-size="14.5" font-weight="600" fill="#f1f5f9">${esc(pTxt[0] || "")}</text>
        ${pTxt[1] ? `<text x="${isAr ? 1082 : 124}" y="${py + 20}" ${dir} font-family="${isAr ? FA : FD}" font-size="13.5" fill="#9fb2c6">${esc(pTxt[1])}</text>` : ""}`;
    });

    // Analogy & Flow Box
    const ax = isAr ? 60 : 704;
    svg += `<rect x="${ax}" y="322" width="436" height="176" rx="16" fill="#101f33" stroke="${acc}" stroke-opacity=".4" stroke-width="1.5"/>
      <text x="${isAr ? ax + 412 : ax + 24}" y="352" ${dir} font-family="${isAr ? FA : FM}" font-size="14" font-weight="700" fill="${acc}">${isAr ? "💡 التشبيه الذهني" : "💡 MENTAL MODEL"}</text>
      ${anaLines.map((ln, i) => `<text x="${isAr ? ax + 412 : ax + 24}" y="${382 + i * 25}" ${dir} font-family="${isAr ? FA : FD}" font-size="15" fill="#e2e8f0">${esc(ln)}</text>`).join("")}

      <!-- Architecture Flow Pills -->
      <rect x="${ax}" y="514" width="436" height="124" rx="16" fill="#101f33" stroke="#22384f" stroke-width="1.5"/>
      <text x="${isAr ? ax + 412 : ax + 24}" y="544" ${dir} font-family="${isAr ? FA : FM}" font-size="13.5" font-weight="700" fill="#3db4f2">${isAr ? "⚙️ خطوات آلية العمل" : "⚙️ ARCHITECTURE FLOW"}</text>
      ${(() => {
        // Long step labels would overflow the 436px card: wrap onto two lines, ellipsize the rest.
        const all = wrap(l.vl.slice(0, 4).join(" → "), 44), flow = all.slice(0, 2);
        if (all.length > 2) flow[1] = flow[1].replace(/\s*\S*$/, "") + " …";
        return flow.map((ln, i) => `<text x="${isAr ? ax + 412 : ax + 24}" y="${574 + i * 22}" ${dir} font-family="${FD}" font-size="15" font-weight="700" fill="#ffffff">${esc(ln)}</text>`).join("");
      })()}
      <text x="${isAr ? ax + 412 : ax + 24}" y="622" ${dir} font-family="${FM}" font-size="12.5" fill="#9fb2c6">${esc(l.v.toUpperCase())} DIAGRAM</text>
    `;

    // Bottom Row: Mistake vs Pro Tip
    svg += `
      <rect x="60" y="656" width="528" height="122" rx="16" fill="#1e1522" stroke="#f2795b" stroke-width="1.6"/>
      <text x="${isAr ? 564 : 84}" y="684" ${dir} font-family="${isAr ? FA : FM}" font-size="13.5" font-weight="700" fill="#f2795b">${isAr ? "❌ خطأ شائع تجنّبه" : "❌ COMMON MISTAKE"}</text>
      ${misLines.map((ln, i) => `<text x="${isAr ? 564 : 84}" y="${710 + i * 22}" ${dir} font-family="${isAr ? FA : FD}" font-size="14" fill="#ffe4e0">${esc(ln)}</text>`).join("")}

      <rect x="612" y="656" width="528" height="122" rx="16" fill="#0f2326" stroke="#4fd1a5" stroke-width="1.6"/>
      <text x="${isAr ? 1116 : 636}" y="684" ${dir} font-family="${isAr ? FA : FM}" font-size="13.5" font-weight="700" fill="#4fd1a5">${isAr ? "✅ نصيحة خبير" : "✅ PRO TIP"}</text>
      ${bestLines.map((ln, i) => `<text x="${isAr ? 1116 : 636}" y="${710 + i * 22}" ${dir} font-family="${isAr ? FA : FD}" font-size="14" fill="#ecfdf5">${esc(ln)}</text>`).join("")}

      <!-- Footer -->
      <text x="600" y="806" text-anchor="middle" font-family="${FM}" font-size="12.5" fill="#647d9b">AI ENGINEER STUDIO · LESSON SUMMARY SHEET · ${esc(l.id)}</text>
    </svg>`;
    return svg;
  }

  // 2. Illustrative Images Gallery per Lesson (3-4 standalone SVG illustrations)
  function buildLessonIllustrations(l, enr, lang) {
    const isAr = lang === "ar";
    const acc = l.acc || "#3db4f2";
    const items = [];

    // Illustration A: Visual Architecture Diagram (from SceneKit)
    if (window.renderScene) {
      items.push({
        id: "architecture",
        title: isAr ? "مخطط آلية العمل والمعمارية" : "Visual Architecture Diagram",
        desc: isAr ? l.vl.join(" ← ") : l.vl.join(" → "),
        svg: window.renderScene(l.v, l.vl, acc),
        freeze: true
      });
    }

    // Illustration B: Mental Model / Analogy Illustration
    if (enr) {
      const anaEn = wrap(enr.analogy[0], 36).slice(0, 4);
      const anaAr = wrap(enr.analogy[1], 42).slice(0, 4);
      const art = metaphorArt(enr.icon, acc);
      const anaSvg = `<svg viewBox="0 0 960 540" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        ${window.SceneKit ? window.SceneKit.bg(acc, "ana" + l.id.replace(/\W/g, "")) : `<rect width="960" height="540" fill="#07101e"/>`}
        ${art}
        <rect x="356" y="48" width="248" height="32" rx="16" fill="${acc}" opacity=".18"/>
        <text x="376" y="69" font-family="${FM}" font-size="13" font-weight="700" fill="${acc}">MENTAL MODEL · التشبيه التوضيحي</text>
        <rect x="356" y="100" width="544" height="384" rx="18" fill="#101f33" stroke="#243c59" stroke-width="1.6"/>
        ${anaEn.map((ln, i) => `<text x="388" y="${152 + i * 32}" font-family="${FD}" font-weight="600" font-size="22" fill="#ffffff">${esc(ln)}</text>`).join("")}
        <line x1="388" y1="296" x2="868" y2="296" stroke="${acc}" stroke-opacity=".5" stroke-width="2"/>
        ${anaAr.map((ln, i) => `<text x="868" y="${342 + i * 34}" direction="rtl" text-anchor="start" font-family="${FA}" font-weight="500" font-size="21" fill="#cbd5e1">${esc(ln)}</text>`).join("")}
      </svg>`;
      items.push({
        id: "analogy",
        title: isAr ? "صورة التشبيه الذهني المبسط" : "Mental Model Illustration",
        desc: isAr ? enr.analogy[1] : enr.analogy[0],
        svg: anaSvg,
        freeze: true
      });
    }

    // Illustration C: Common Mistake vs Pro Tip Visual Card
    if (enr) {
      const mEn = wrap(enr.mistake[0], 28).slice(0, 4), mAr = wrap(enr.mistake[1], 32).slice(0, 4);
      const bEn = wrap(enr.bestPractice[0], 28).slice(0, 4), bAr = wrap(enr.bestPractice[1], 32).slice(0, 4);
      const pfSvg = `<svg viewBox="0 0 960 540" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        ${window.SceneKit ? window.SceneKit.bg(acc, "pf" + l.id.replace(/\W/g, "")) : `<rect width="960" height="540" fill="#07101e"/>`}
        <text x="480" y="58" text-anchor="middle" font-family="${FD}" font-weight="700" font-size="24" fill="#ffffff">Common Mistake vs. Pro Tip · خطأ شائع مقابل نصيحة خبير</text>
        <rect x="58" y="92" width="404" height="396" rx="18" fill="#1e1522" stroke="#f2795b" stroke-width="2.2"/>
        <rect x="82" y="116" width="196" height="30" rx="15" fill="#f2795b" opacity=".2"/>
        <text x="180" y="136" text-anchor="middle" font-family="${FM}" font-size="13" font-weight="700" fill="#f2795b">❌ AVOID · تجنّب هذا</text>
        ${mEn.map((ln, i) => `<text x="84" y="${184 + i * 26}" font-family="${FD}" font-size="18" font-weight="600" fill="#ffe4e0">${esc(ln)}</text>`).join("")}
        <line x1="84" y1="312" x2="436" y2="312" stroke="#f2795b" stroke-opacity=".3"/>
        ${mAr.map((ln, i) => `<text x="436" y="${350 + i * 28}" direction="rtl" text-anchor="start" font-family="${FA}" font-size="17" fill="#f8b4a6">${esc(ln)}</text>`).join("")}
        <rect x="498" y="92" width="404" height="396" rx="18" fill="#0f2326" stroke="#4fd1a5" stroke-width="2.2"/>
        <rect x="522" y="116" width="212" height="30" rx="15" fill="#4fd1a5" opacity=".2"/>
        <text x="628" y="136" text-anchor="middle" font-family="${FM}" font-size="13" font-weight="700" fill="#4fd1a5">✅ DO THIS · افعل هذا</text>
        ${bEn.map((ln, i) => `<text x="524" y="${184 + i * 26}" font-family="${FD}" font-size="18" font-weight="600" fill="#ecfdf5">${esc(ln)}</text>`).join("")}
        <line x1="524" y1="312" x2="876" y2="312" stroke="#4fd1a5" stroke-opacity=".3"/>
        ${bAr.map((ln, i) => `<text x="876" y="${350 + i * 28}" direction="rtl" text-anchor="start" font-family="${FA}" font-size="17" fill="#a7f3d0">${esc(ln)}</text>`).join("")}
      </svg>`;
      items.push({
        id: "pitfall",
        title: isAr ? "مقارنة: الخطأ الشائع مقابل الحل الصحيح" : "Common Mistake vs. Pro Tip",
        desc: isAr ? "بطاقة توضيحية لأبرز خطأ وأفضل ممارسة هندسية" : "Visual comparison of what to avoid vs. best practice",
        svg: pfSvg
      });
    }

    // Illustration D: Code Example Visual Card (if lesson has code)
    if (l.ex) {
      const lines = l.ex.split("\n").slice(0, 14);
      const fs = lines.length > 9 ? 15 : 17, lh = fs * 1.6;
      const h = Math.min(448, 76 + lines.length * lh + 24), y0 = (540 - h) / 2;
      const langName = langOf(l.ex);
      const codeSvg = `<svg viewBox="0 0 960 540" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
        ${window.SceneKit ? window.SceneKit.bg(acc, "cd" + l.id.replace(/\W/g, "")) : `<rect width="960" height="540" fill="#07101e"/>`}
        <rect x="64" y="${y0}" width="832" height="${h}" rx="16" fill="#0a1524" stroke="#26405e" stroke-width="1.8"/>
        <rect x="64" y="${y0}" width="832" height="44" rx="16" fill="#152740"/>
        <rect x="64" y="${y0 + 30}" width="832" height="14" fill="#152740"/>
        <circle cx="92" cy="${y0 + 22}" r="6" fill="#f2795b"/><circle cx="112" cy="${y0 + 22}" r="6" fill="#f5a524"/><circle cx="132" cy="${y0 + 22}" r="6" fill="#4fd1a5"/>
        <text x="158" y="${y0 + 27}" font-family="${FM}" font-size="13.5" fill="#9fb2c6">${esc(langName)}</text>
        <rect x="706" y="${y0 + 10}" width="170" height="24" rx="12" fill="${acc}" opacity=".2"/>
        <text x="791" y="${y0 + 26}" text-anchor="middle" font-family="${FA}" font-size="12.5" font-weight="600" fill="${acc}">LIVE CODE · مثال عملي</text>
        ${lines.map((ln, k) => {
          const yy = y0 + 74 + k * lh;
          const isComment = /^\s*(#|\/\/|--)/.test(ln);
          return `<text x="92" y="${yy}" font-family="${FM}" font-size="${fs}" fill="#4d6683">${k + 1}</text>
            <text x="128" y="${yy}" font-family="${FM}" font-size="${fs}" fill="${isComment ? "#7dd3fc" : "#f1f5f9"}" xml:space="preserve">${esc(ln)}</text>`;
        }).join("")}
      </svg>`;
      items.push({
        id: "code",
        title: isAr ? "صورة المثال التطبيقي بالكود" : "Hands-on Code Card",
        desc: isAr ? "مقتطف برمجي يوضح تطبيق فكرة الدرس عمليًا" : "Production code snippet illustrating the concept",
        svg: codeSvg
      });
    }

    return items;
  }

  // 3. Export any SVG element or string to a crisp 2x PNG download
  function downloadSvgAsPng(svgInput, filename) {
    try {
      let svgStr = typeof svgInput === "string" ? svgInput : new XMLSerializer().serializeToString(svgInput);
      if (!svgStr.includes("xmlns=")) {
        svgStr = svgStr.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
      }
      const vb = svgStr.match(/viewBox="0 0 (\d+) (\d+)"/);
      const w = vb ? +vb[1] : 1200;
      const h = vb ? +vb[2] : 840;
      const scale = 2;
      const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = w * scale;
        canvas.height = h * scale;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#07101e";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        canvas.toBlob(pngBlob => {
          if (!pngBlob) return;
          const a = document.createElement("a");
          a.href = URL.createObjectURL(pngBlob);
          a.download = filename.endsWith(".png") ? filename : filename + ".png";
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(a.href), 1500);
        }, "image/png");
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        // Fallback: download as SVG
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = filename.replace(/\.png$/, "") + ".svg";
        document.body.appendChild(a);
        a.click();
        a.remove();
      };
      img.src = url;
    } catch (e) { }
  }

  window.LessonVisuals = {
    buildLessonSummarySVG,
    buildLessonIllustrations,
    downloadSvgAsPng
  };
})();
