// Upgraded Studio-Grade Animated SVG Scenes (SMIL), 960x540.
// Includes 10 redesigned scenes + 6 brand-new motion scenes (versus, orbit, stream, funnel, gauge, blueprint).
(function () {
  const W = 960, H = 540;
  let uid = 0;
  const nextId = () => "sk" + (++uid);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const isAr = s => /[\u0600-\u06FF]/.test(s);
  const ff = s => isAr(s) ? "Readex Pro, IBM Plex Sans Arabic, sans-serif" : "Outfit, Readex Pro, sans-serif";

  function wrap(text, max) {
    const words = String(text || "").split(" ");
    const lines = [];
    let cur = "";
    for (const w of words) {
      if ((cur + " " + w).trim().length > max && cur) { lines.push(cur); cur = w; }
      else cur = (cur + " " + w).trim();
    }
    if (cur) lines.push(cur);
    return lines;
  }

  function label(x, y, text, size, color, max, weight) {
    const lines = wrap(text, max || 18);
    const lh = size * 1.28;
    const y0 = y - (lines.length - 1) * lh / 2;
    return lines.map((l, i) =>
      `<text x="${x}" y="${y0 + i * lh}" text-anchor="middle" dominant-baseline="middle" ${isAr(l) ? 'direction="rtl" ' : ""}font-family="${ff(l)}" font-size="${size}" font-weight="${weight || 600}" fill="${color}">${esc(l)}</text>`
    ).join("");
  }

  function appear(delay, dy, dur) {
    const d = dur || 0.55;
    return `<animate attributeName="opacity" from="0" to="1" begin="${delay}s" dur="${d}s" fill="freeze"/>` +
      (dy === 0 ? "" : `<animateTransform attributeName="transform" type="translate" from="0 ${dy == null ? 22 : dy}" to="0 0" begin="${delay}s" dur="${d + 0.08}s" fill="freeze"/>`);
  }

  function bg(acc, pfx) {
    const u = pfx || nextId();
    return `<defs>
      <linearGradient id="${u}bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#07101e"/>
        <stop offset="55%" stop-color="#0b1728"/>
        <stop offset="100%" stop-color="#091322"/>
      </linearGradient>
      <radialGradient id="${u}g1" cx="18%" cy="14%" r="72%">
        <stop offset="0%" stop-color="${acc}" stop-opacity=".28"/>
        <stop offset="65%" stop-color="${acc}" stop-opacity=".04"/>
        <stop offset="100%" stop-color="#07101e" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="${u}g2" cx="85%" cy="88%" r="60%">
        <stop offset="0%" stop-color="${acc}" stop-opacity=".18"/>
        <stop offset="100%" stop-color="#07101e" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="${u}card" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#182c46"/>
        <stop offset="100%" stop-color="#101f33"/>
      </linearGradient>
      <linearGradient id="${u}bar" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${acc}"/>
        <stop offset="100%" stop-color="${acc}" stop-opacity=".45"/>
      </linearGradient>
      <pattern id="${u}dots" width="36" height="36" patternUnits="userSpaceOnUse">
        <circle cx="18" cy="18" r="1.1" fill="#ffffff" opacity=".07"/>
      </pattern>
      <marker id="${u}ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 1L10 5L0 9L2.5 5z" fill="${acc}"/>
      </marker>
      <filter id="${u}glow" x="-35%" y="-35%" width="170%" height="170%">
        <feGaussianBlur stdDeviation="4.5" result="b"/>
        <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
      <filter id="${u}sh" x="-15%" y="-15%" width="130%" height="140%">
        <feDropShadow dx="0" dy="10" stdDeviation="10" flood-color="#000" flood-opacity=".42"/>
      </filter>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#${u}bg)"/>
    <rect width="${W}" height="${H}" fill="url(#${u}g1)"/>
    <rect width="${W}" height="${H}" fill="url(#${u}g2)"/>
    <rect width="${W}" height="${H}" fill="url(#${u}dots)"/>
    <circle cx="150" cy="90" r="170" fill="${acc}" opacity=".055">
      <animate attributeName="cx" values="150;220;150" dur="12s" repeatCount="indefinite"/>
    </circle>
    <circle cx="820" cy="450" r="200" fill="${acc}" opacity=".05">
      <animate attributeName="cy" values="450;390;450" dur="14s" repeatCount="indefinite"/>
    </circle>
    <g opacity=".22" stroke="${acc}" stroke-width="1.5" fill="none">
      <path d="M22,42 L22,22 L42,22"/>
      <path d="M918,22 L938,22 L938,42"/>
      <path d="M22,498 L22,518 L42,518"/>
      <path d="M918,518 L938,518 L938,498"/>
    </g>`;
  }

  function node(x, y, w, h, text, acc, delay, opt, u) {
    opt = opt || {};
    const fill = opt.fill || `url(#${u}card)`;
    const rx = opt.rx || 16;
    const badge = opt.badge != null
      ? `<rect x="${x - w / 2 + 10}" y="${y - h / 2 - 12}" width="26" height="22" rx="7" fill="${acc}"/>
         <text x="${x - w / 2 + 23}" y="${y - h / 2 - 1}" text-anchor="middle" dominant-baseline="middle" font-family="IBM Plex Mono, monospace" font-size="11" font-weight="700" fill="#07101e">${opt.badge}</text>`
      : "";
    return `<g opacity="0" filter="url(#${u}sh)">${appear(delay, opt.dy)}
      <rect x="${x - w / 2}" y="${y - h / 2}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${opt.stroke || acc}" stroke-width="${opt.sw || 2}"/>
      <line x1="${x - w / 2 + 16}" y1="${y - h / 2 + 1}" x2="${x + w / 2 - 16}" y2="${y - h / 2 + 1}" stroke="#ffffff" stroke-opacity=".22" stroke-width="1.2"/>
      ${badge}
      ${label(x, y + (opt.badge != null ? 3 : 0), text, opt.size || 18, opt.color || "#f1f5f9", opt.max || Math.max(8, Math.floor(w / 10.5)), opt.weight || 600)}
    </g>`;
  }

  const pulse = (path, acc, begin, dur, u, r) =>
    `<circle r="${r || 7}" fill="${acc}" filter="url(#${u}glow)" opacity="0">
      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.08;.92;1" begin="${begin}s" dur="${dur}s" repeatCount="indefinite"/>
      <animateMotion path="${path}" begin="${begin}s" dur="${dur}s" repeatCount="indefinite"/>
    </circle>`;

  const S = {};

  // 1. PIPELINE
  S.pipeline = (L, acc, u) => {
    const n = L.length, gap = 28, bw = Math.min(168, (860 - (n - 1) * gap) / n), y = 248;
    const x0 = (W - (n * bw + (n - 1) * gap)) / 2 + bw / 2;
    let out = "";
    const xs = x0, xe = x0 + (n - 1) * (bw + gap);
    // Studio rail below
    out += `<rect x="${xs}" y="${y + 84}" width="${xe - xs}" height="6" rx="3" fill="#16283f"/>
      <rect x="${xs}" y="${y + 84}" width="0" height="6" rx="3" fill="${acc}">
        <animate attributeName="width" to="${xe - xs}" begin=".25s" dur="${Math.max(1.8, n * 0.55)}s" fill="freeze"/>
      </rect>`;
    L.forEach((t, i) => {
      const x = x0 + i * (bw + gap);
      if (i < n - 1) {
        const x1 = x + bw / 2 + 3, x2 = x + bw / 2 + gap - 4;
        out += `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" stroke="${acc}" stroke-width="2.5" marker-end="url(#${u}ah)" opacity="0">${appear(i * 0.5 + 0.35, 0)}</line>`;
      }
      out += node(x, y, bw, 102, t, acc, i * 0.5, { size: bw < 126 ? 14 : 17, badge: String(i + 1).padStart(2, "0") }, u);
    });
    out += pulse(`M${xs},${y + 87} L${xe},${y + 87}`, acc, 0.8, 2.8, u, 8);
    out += pulse(`M${xs},${y + 87} L${xe},${y + 87}`, "#ffffff", 2.2, 2.8, u, 4);
    return out;
  };

  // 2. LOOP
  S.loop = (L, acc, u) => {
    const n = L.length, cx = 480, cy = 266, r = 166;
    let out = `
      <circle cx="${cx}" cy="${cy}" r="${r + 22}" fill="none" stroke="${acc}" stroke-width="1" opacity=".16"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${acc}" stroke-width="2.5" stroke-dasharray="10 10" opacity=".5">
        <animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="26s" repeatCount="indefinite"/>
      </circle>
      <circle cx="${cx}" cy="${cy}" r="66" fill="${acc}" opacity=".12">
        <animate attributeName="r" values="62;72;62" dur="3.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="${cx}" cy="${cy}" r="48" fill="#101f33" stroke="${acc}" stroke-width="2"/>
      ${label(cx, cy, "↻", 42, acc, 4)}`;
    L.forEach((t, i) => {
      const a = -Math.PI / 2 + i * 2 * Math.PI / n;
      out += node(cx + r * Math.cos(a), cy + r * Math.sin(a), 192, 66, t, acc, 0.35 + i * 0.45, { size: 16, badge: i + 1 }, u);
    });
    const path = `M${cx},${cy - r} A${r},${r} 0 1,1 ${cx - 0.1},${cy - r}`;
    out += pulse(path, acc, 0.8, 3.8, u, 8);
    out += pulse(path, "#ffffff", 2.7, 3.8, u, 4.5);
    return out;
  };

  // 3. LAYERS
  S.layers = (L, acc, u) => {
    const n = L.length, h = Math.min(68, 345 / n), gap = 13;
    const total = n * h + (n - 1) * gap, yTop = 268 - total / 2;
    let out = "";
    L.slice().reverse().forEach((t, j) => {
      const i = n - 1 - j;
      const y = yTop + i * (h + gap) + h / 2, w = 520 + i * 38;
      out += node(465, y, w, h, t, acc, j * 0.45, { size: 18, max: 42, badge: `L${n - i}`, fill: i === 0 ? "#1a3554" : `url(#${u}card)` }, u);
    });
    const busX = 835;
    out += `<line x1="${busX}" y1="${yTop + 8}" x2="${busX}" y2="${yTop + total - 8}" stroke="${acc}" stroke-width="2" stroke-dasharray="5 7" opacity=".45"/>`;
    out += pulse(`M${busX},${yTop + total - 8} L${busX},${yTop + 8}`, acc, 0.8, 2.4, u, 7);
    out += pulse(`M${busX},${yTop + 8} L${busX},${yTop + total - 8}`, "#4fd1a5", 2.0, 2.4, u, 5.5);
    return out;
  };

  // 4. CARDS
  S.cards = (L, acc, u) => {
    const n = L.length, per = n <= 3 ? n : Math.ceil(n / 2), rows = Math.ceil(n / per);
    const cw = Math.min(256, (850 - (per - 1) * 26) / per), ch = rows > 1 ? 138 : 186;
    let out = "";
    L.forEach((t, i) => {
      const r = Math.floor(i / per), c = i % per, inRow = Math.min(per, n - r * per);
      const x0 = (W - (inRow * cw + (inRow - 1) * 26)) / 2 + cw / 2;
      const x = x0 + c * (cw + 26), y = (rows > 1 ? 175 : 265) + r * (ch + 28);
      out += `<g>
        ${node(x, y, cw, ch, t, acc, i * 0.42, { size: 19, max: Math.floor(cw / 11.5), badge: String(i + 1).padStart(2, "0") }, u)}
        <rect x="${x - cw / 2 + 20}" y="${y + ch / 2 - 14}" width="0" height="4" rx="2" fill="${acc}" opacity=".85">
          <animate attributeName="width" to="${cw - 40}" begin="${i * 0.42 + 0.35}s" dur=".7s" fill="freeze"/>
        </rect>
        <animateTransform attributeName="transform" type="translate" values="0 0;0 -6;0 0" dur="${3.4 + i * 0.35}s" begin="${n * 0.45}s" repeatCount="indefinite"/>
      </g>`;
    });
    return out;
  };

  // 5. CHART
  S.chart = (L, acc, u) => {
    const n = L.length, base = 412, maxH = 260, bw = Math.min(112, 580 / n), gap = (700 - n * bw) / (n + 1);
    const hs = [0.64, 0.88, 0.54, 0.95, 0.74, 0.62];
    let out = `<line x1="120" y1="${base}" x2="840" y2="${base}" stroke="#3a5470" stroke-width="2"/>`;
    for (let k = 1; k <= 4; k++) {
      out += `<line x1="120" y1="${base - k * 65}" x2="840" y2="${base - k * 65}" stroke="#ffffff" opacity=".07" stroke-dasharray="4 6"/>`;
    }
    const pts = [];
    L.forEach((t, i) => {
      const x = 130 + gap + i * (bw + gap), h = maxH * hs[i % hs.length], d = 0.25 + i * 0.38;
      pts.push([x + bw / 2, base - h - 18]);
      out += `<rect x="${x}" y="${base}" width="${bw}" height="0" rx="10" fill="url(#${u}bar)" stroke="${acc}" stroke-width="1.5">
        <animate attributeName="height" from="0" to="${h}" begin="${d}s" dur=".85s" fill="freeze"/>
        <animate attributeName="y" from="${base}" to="${base - h}" begin="${d}s" dur=".85s" fill="freeze"/>
      </rect>`;
      out += `<g opacity="0">${appear(d + 0.55, 8)}
        <text x="${x + bw / 2}" y="${base - h - 12}" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="14" font-weight="700" fill="${acc}">${Math.round(hs[i % hs.length] * 100)}%</text>
        ${label(x + bw / 2, base + 34, t, 15, "#cbd5e1", 15)}
      </g>`;
    });
    if (pts.length >= 2) {
      const pd = "M" + pts.map(p => `${p[0]},${p[1] - 18}`).join(" L");
      out += `<path d="${pd}" fill="none" stroke="#ffffff" stroke-opacity=".35" stroke-width="2" stroke-dasharray="900" stroke-dashoffset="900">
        <animate attributeName="stroke-dashoffset" to="0" begin="${0.6 + n * 0.3}s" dur="1.1s" fill="freeze"/>
      </path>`;
    }
    return out;
  };

  // 6. GRAPH
  S.graph = (L, acc, u) => {
    const n = L.length;
    if (n < 3) return S.pipeline(L, acc, u);
    let out = "";
    const first = { x: 152, y: 266 }, last = { x: 808, y: 266 }, mids = L.slice(1, -1);
    const stepY = Math.min(118, 340 / Math.max(1, mids.length - 1 || 1));
    const pts = mids.map((t, i) => ({ x: 480, y: 266 + (i - (mids.length - 1) / 2) * stepY }));
    const edges = [];
    pts.forEach(p => { edges.push([first, p]); edges.push([p, last]); });
    edges.forEach(([a, b], k) => {
      const d = `M${a.x + 88},${a.y} C${(a.x + b.x) / 2},${a.y} ${(a.x + b.x) / 2},${b.y} ${b.x - 88},${b.y}`;
      out += `<path d="${d}" fill="none" stroke="${acc}" stroke-width="2.5" opacity=".75" stroke-dasharray="600" stroke-dashoffset="600" marker-end="url(#${u}ah)">
        <animate attributeName="stroke-dashoffset" from="600" to="0" begin="${0.4 + k * 0.2}s" dur="0.8s" fill="freeze"/>
      </path>`;
      out += pulse(d, acc, 0.9 + edges.length * 0.2 + k * 0.18, 2.3, u, 6.5);
    });
    out += node(first.x, first.y, 174, 78, L[0], acc, 0, { fill: "#1b3654", badge: "IN" }, u);
    pts.forEach((p, i) => out += node(p.x, p.y, 176, 66, mids[i], acc, 0.3 + i * 0.28, { size: 16 }, u));
    out += node(last.x, last.y, 174, 78, L[n - 1], "#4fd1a5", 0.65 + mids.length * 0.25, { fill: "#12343b", stroke: "#4fd1a5", badge: "OUT" }, u);
    return out;
  };

  // 7. SHIELD
  S.shield = (L, acc, u) => {
    const n = L.length, sx = 690, sy = 266;
    let out = `
      <circle cx="${sx}" cy="${sy}" r="165" fill="none" stroke="${acc}" stroke-width="1.5" stroke-dasharray="8 12" opacity=".32">
        <animateTransform attributeName="transform" type="rotate" from="0 ${sx} ${sy}" to="360 ${sx} ${sy}" dur="22s" repeatCount="indefinite"/>
      </circle>
      <circle cx="${sx}" cy="${sy}" r="138" fill="${acc}" opacity=".07">
        <animate attributeName="r" values="132;148;132" dur="3.5s" repeatCount="indefinite"/>
      </circle>
      <g opacity="0" filter="url(#${u}sh)">${appear(0.2, 0)}
        <path d="M${sx},${sy - 134} L${sx + 108},${sy - 92} L${sx + 108},${sy + 12} C${sx + 108},${sy + 86} ${sx + 52},${sy + 128} ${sx},${sy + 148} C${sx - 52},${sy + 128} ${sx - 108},${sy + 86} ${sx - 108},${sy + 12} L${sx - 108},${sy - 92} Z" fill="url(#${u}card)" stroke="${acc}" stroke-width="3.5"/>
        <path d="M${sx - 38},${sy + 4} l28,30 l54,-66" fill="none" stroke="#4fd1a5" stroke-width="11" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="170" stroke-dashoffset="170" filter="url(#${u}glow)">
          <animate attributeName="stroke-dashoffset" to="0" begin="${0.9 + n * 0.45}s" dur=".75s" fill="freeze"/>
        </path>
      </g>`;
    L.forEach((t, i) => {
      const y = sy + (i - (n - 1) / 2) * 102, x = 205;
      out += node(x, y, 240, 68, t, "#f2795b", 0.3 + i * 0.45, { size: 16, stroke: "#f2795b" }, u);
      const d = `M${x + 124},${y} L${sx - 118},${sy + (y - sy) * 0.28}`;
      out += `<path d="${d}" stroke="#f2795b" stroke-width="2" stroke-dasharray="5 7" opacity=".45" fill="none"/>`;
      out += `<circle r="7" fill="#ff7676" filter="url(#${u}glow)" opacity="0">
        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.1;.85;1" begin="${0.9 + i * 0.45}s" dur="1.5s" repeatCount="indefinite"/>
        <animateMotion path="${d}" begin="${0.9 + i * 0.45}s" dur="1.5s" repeatCount="indefinite"/>
      </circle>`;
    });
    return out;
  };

  // 8. CHAT
  S.chat = (L, acc, u) => {
    let out = `<rect x="76" y="42" width="808" height="456" rx="18" fill="#0d1a2c" stroke="#22384f" stroke-width="1.5" filter="url(#${u}sh)"/>
      <rect x="76" y="42" width="808" height="38" rx="18" fill="#152740"/>
      <rect x="76" y="66" width="808" height="14" fill="#152740"/>
      <circle cx="102" cy="61" r="5.5" fill="#f2795b"/><circle cx="120" cy="61" r="5.5" fill="#f5a524"/><circle cx="138" cy="61" r="5.5" fill="#4fd1a5"/>
      <text x="480" y="65" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="12" fill="#8ea2b8">LIVE INTERACTION · تفاعل مباشر</text>`;
    const n = L.length;
    L.forEach((t, i) => {
      const left = i % 2 === 0, lines = wrap(t, 36), h = 28 + lines.length * 24;
      const w = Math.min(470, 64 + Math.max(...lines.map(l => l.length)) * 10.5);
      const y = 104 + i * (375 / n), x = left ? 162 : 798 - w;
      const d = 0.35 + i * 0.95;
      out += `<g opacity="0">${appear(d, 14)}
        <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${left ? "#192d47" : acc}" stroke="${left ? acc : "none"}" stroke-width="1.8"/>
        ${lines.map((l, k) => `<text x="${isAr(l) ? x + w - 20 : x + 20}" y="${y + 31 + k * 24}" text-anchor="${isAr(l) ? "end" : "start"}" font-family="${ff(l)}" font-size="17" font-weight="${left ? 500 : 700}" fill="${left ? "#f1f5f9" : "#07101e"}">${esc(l)}</text>`).join("")}
        <circle cx="${left ? x - 34 : x + w + 34}" cy="${y + h / 2}" r="19" fill="${left ? "#1e3a5f" : "#12343b"}" stroke="${left ? acc : "#4fd1a5"}" stroke-width="1.5"/>
        <text x="${left ? x - 34 : x + w + 34}" y="${y + h / 2 + 1}" text-anchor="middle" dominant-baseline="middle" font-size="17">${left ? "👤" : "🤖"}</text>
      </g>`;
    });
    return out;
  };

  // 9. TOKENS
  S.tokens = (L, acc, u) => {
    const y = 195, widths = L.map(t => Math.max(76, t.length * 14 + 34));
    const total = widths.reduce((a, b) => a + b, 0) + (L.length - 1) * 12;
    let x = Math.max(40, (W - total) / 2), out = "";
    const palette = [acc, "#3db4f2", "#22c3a6", "#f2795b", "#a855f7", "#e8618c"];
    L.forEach((t, i) => {
      const w = widths[i], d = 0.25 + i * 0.38, col = palette[i % palette.length];
      out += `<g opacity="0" filter="url(#${u}sh)">${appear(d, -16)}
        <rect x="${x}" y="${y - 34}" width="${w}" height="68" rx="14" fill="url(#${u}card)" stroke="${col}" stroke-width="2.2"/>
        ${label(x + w / 2, y, t, 19, "#ffffff", 28)}
        <text x="${x + w / 2}" y="${y + 56}" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="12" fill="#8ea2b8">id:${1024 + i * 219}</text>
      </g>`;
      x += w + 12;
    });
    out += `<rect x="${Math.min(x, 900)}" y="${y - 34}" width="6" height="68" rx="3" fill="#4fd1a5" opacity="0">
      <animate attributeName="opacity" values="0;1;0" dur=".9s" begin="${0.3 + L.length * 0.38}s" repeatCount="indefinite"/>
    </rect>`;
    const bx = 210, by = 325, probs = [[0.68, "top-1 ✓"], [0.21, "alt-2"], [0.08, "alt-3"]];
    out += `<g opacity="0">${appear(0.5 + L.length * 0.38, 12)}
      <rect x="${bx - 24}" y="${by - 36}" width="588" height="162" rx="16" fill="#0d1a2c" stroke="#22384f"/>
      <text x="${bx}" y="${by - 12}" font-family="IBM Plex Mono, monospace" font-size="12.5" fill="#8ea2b8">NEXT-TOKEN DISTRIBUTION · احتمالات الـ Token التالي</text>` +
      probs.map(([p, tag], k) => `
        <rect x="${bx}" y="${by + 10 + k * 36}" width="440" height="24" rx="7" fill="#152740"/>
        <rect x="${bx}" y="${by + 10 + k * 36}" width="0" height="24" rx="7" fill="${k === 0 ? acc : "#3db4f2"}" opacity="${1 - k * 0.26}">
          <animate attributeName="width" to="${p * 440}" begin="${0.75 + L.length * 0.38 + k * 0.18}s" dur=".75s" fill="freeze"/>
        </rect>
        <text x="${bx + 456}" y="${by + 27 + k * 36}" font-family="IBM Plex Mono, monospace" font-size="13" font-weight="600" fill="#e2e8f0">${Math.round(p * 100)}% ${tag}</text>
      `).join("") + `</g>`;
    return out;
  };

  // 10. VECTOR
  S.vector = (L, acc, u) => {
    let out = `<line x1="110" y1="452" x2="850" y2="452" stroke="#2c4560" stroke-width="2"/>
      <line x1="110" y1="452" x2="110" y2="62" stroke="#2c4560" stroke-width="2"/>`;
    const clusters = L.slice(0, -1), centers = [[305, 185], [655, 175], [490, 355], [715, 360]];
    const cols = [acc, "#3db4f2", "#a855f7", "#22c3a6"];
    let seed = 11;
    const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
    const pts = [];
    clusters.forEach((t, c) => {
      const [cx, cy] = centers[c % 4], col = cols[c % 4];
      out += `<circle cx="${cx}" cy="${cy}" r="88" fill="${col}" opacity="0"><animate attributeName="opacity" to=".09" begin="${0.2 + c * 0.45}s" dur=".6s" fill="freeze"/></circle>`;
      for (let k = 0; k < 10; k++) {
        const px = cx + (rnd() - 0.5) * 124, py = cy + (rnd() - 0.5) * 92, d = 0.2 + c * 0.45 + k * 0.04;
        pts.push([px, py, c]);
        out += `<circle cx="${px}" cy="${py}" r="6.5" fill="${col}" opacity="0"><animate attributeName="opacity" to=".92" begin="${d}s" dur=".35s" fill="freeze"/></circle>`;
      }
      out += `<g opacity="0">${appear(0.4 + c * 0.45, 0)}${label(cx, cy - 78, t, 17, "#f8fafc", 22)}</g>`;
    });
    const q = [centers[0][0] + 44, centers[0][1] + 58], dq = 0.5 + clusters.length * 0.45;
    pts.filter(p => p[2] === 0).slice(0, 4).forEach((p, k) =>
      out += `<line x1="${q[0]}" y1="${q[1]}" x2="${p[0]}" y2="${p[1]}" stroke="#4fd1a5" stroke-width="2.2" stroke-dasharray="220" stroke-dashoffset="220">
        <animate attributeName="stroke-dashoffset" to="0" begin="${dq + 0.35 + k * 0.16}s" dur=".55s" fill="freeze"/>
      </line>`
    );
    out += `<g opacity="0">${appear(dq, 0)}
      <circle cx="${q[0]}" cy="${q[1]}" r="26" fill="#4fd1a5" opacity=".16"><animate attributeName="r" values="20;32;20" dur="2.2s" repeatCount="indefinite"/></circle>
      <path d="M${q[0]},${q[1] - 16} l5,11 12,1 -9,8 3,12 -11,-6 -11,6 3,-12 -9,-8 12,-1z" fill="#4fd1a5" filter="url(#${u}glow)"/>
      ${label(q[0], q[1] + 34, L[L.length - 1], 16, "#4fd1a5", 20)}
    </g>`;
    return out;
  };

  // 11. NEW: VERSUS (Dramatic Split-Screen Comparison)
  S.versus = (L, acc, u) => {
    const leftTxt = L[0] || "Option A", rightTxt = L[1] || "Option B";
    let out = `
      <line x1="480" y1="68" x2="480" y2="472" stroke="#263d58" stroke-width="2" stroke-dasharray="6 8"/>
      ${node(252, 260, 344, 240, leftTxt, "#3db4f2", 0.2, { size: 24, max: 20, stroke: "#3db4f2", badge: "A" }, u)}
      ${node(708, 260, 344, 240, rightTxt, acc, 0.55, { size: 24, max: 20, stroke: acc, badge: "B" }, u)}
      <g opacity="0">${appear(0.9, 0)}
        <circle cx="480" cy="260" r="44" fill="#07101e" stroke="${acc}" stroke-width="3" filter="url(#${u}glow)"/>
        <circle cx="480" cy="260" r="54" fill="none" stroke="${acc}" stroke-width="1.5" stroke-dasharray="5 7" opacity=".5">
          <animateTransform attributeName="transform" type="rotate" from="0 480 260" to="360 480 260" dur="14s" repeatCount="indefinite"/>
        </circle>
        <text x="480" y="263" text-anchor="middle" dominant-baseline="middle" font-family="Outfit, Readex Pro, sans-serif" font-size="24" font-weight="800" fill="${acc}">VS</text>
      </g>
      <g opacity="0">${appear(1.2, 10)}
        <rect x="210" y="424" width="540" height="36" rx="18" fill="#101f33" stroke="#22384f"/>
        <text x="480" y="446" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="13" fill="#9fb2c6">ENGINEERING TRADE-OFF · مقارنة هندسية</text>
      </g>`;
    return out;
  };

  // 12. NEW: ORBIT (Hub-and-Spoke Ecosystem)
  S.orbit = (L, acc, u) => {
    const cx = 480, cy = 270, r = 178;
    const hub = L[0] || "Core", sats = L.slice(1);
    let out = `
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${acc}" stroke-width="1.5" stroke-dasharray="6 10" opacity=".4">
        <animateTransform attributeName="transform" type="rotate" from="0 ${cx} ${cy}" to="360 ${cx} ${cy}" dur="35s" repeatCount="indefinite"/>
      </circle>
      <circle cx="${cx}" cy="${cy}" r="${r * 0.58}" fill="none" stroke="#3db4f2" stroke-width="1" opacity=".2"/>`;
    sats.forEach((t, i) => {
      const a = -Math.PI / 2 + i * (2 * Math.PI / Math.max(1, sats.length));
      const sx = cx + r * Math.cos(a), sy = cy + r * Math.sin(a);
      const path = `M${cx},${cy} L${sx},${sy}`;
      out += `<line x1="${cx}" y1="${cy}" x2="${sx}" y2="${sy}" stroke="${acc}" stroke-width="2" opacity=".45" stroke-dasharray="4 6"/>`;
      out += pulse(path, acc, 0.7 + i * 0.25, 2.2, u, 6);
      out += node(sx, sy, 174, 62, t, "#3db4f2", 0.4 + i * 0.3, { size: 15, stroke: "#3db4f2" }, u);
    });
    out += `<circle cx="${cx}" cy="${cy}" r="76" fill="${acc}" opacity=".12"><animate attributeName="r" values="70;84;70" dur="3s" repeatCount="indefinite"/></circle>`;
    out += node(cx, cy, 166, 86, hub, acc, 0.1, { size: 19, fill: "#1a3350", sw: 3 }, u);
    return out;
  };

  // 13. NEW: STREAM (Live SSE / Streaming Event Waterfall)
  S.stream = (L, acc, u) => {
    let out = `<rect x="86" y="48" width="788" height="444" rx="18" fill="#0b1626" stroke="#22384f" stroke-width="1.8" filter="url(#${u}sh)"/>
      <rect x="86" y="48" width="788" height="42" rx="18" fill="#152740"/>
      <rect x="86" y="74" width="788" height="16" fill="#152740"/>
      <circle cx="114" cy="69" r="6" fill="#f2795b"/><circle cx="134" cy="69" r="6" fill="#f5a524"/><circle cx="154" cy="69" r="6" fill="#4fd1a5"/>
      <text x="180" y="73" font-family="IBM Plex Mono, monospace" font-size="13" fill="#9fb2c6">SSE STREAM · text/event-stream</text>
      <circle cx="834" cy="69" r="6" fill="#4fd1a5"><animate attributeName="opacity" values="1;.25;1" dur="1.1s" repeatCount="indefinite"/></circle>`;
    const n = L.length, rowH = Math.min(78, 330 / Math.max(1, n));
    L.forEach((t, i) => {
      const y = 114 + i * (rowH + 10), d = 0.35 + i * 0.7;
      out += `<g opacity="0">${appear(d, 10)}
        <rect x="116" y="${y}" width="728" height="${rowH}" rx="12" fill="#122338" stroke="${i === n - 1 ? "#4fd1a5" : acc}" stroke-opacity=".55" stroke-width="1.5"/>
        <rect x="130" y="${y + rowH / 2 - 12}" width="72" height="24" rx="6" fill="${i === n - 1 ? "#4fd1a5" : acc}"/>
        <text x="166" y="${y + rowH / 2 + 4}" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="11.5" font-weight="700" fill="#07101e">EVT 0${i + 1}</text>
        <text x="220" y="${y + rowH / 2 + 5}" font-family="${ff(t)}" font-size="18" font-weight="600" fill="#f1f5f9">${esc(t)}</text>
        <rect x="734" y="${y + rowH / 2 - 4}" width="0" height="8" rx="4" fill="${i === n - 1 ? "#4fd1a5" : acc}">
          <animate attributeName="width" to="90" begin="${d + 0.15}s" dur=".65s" fill="freeze"/>
        </rect>
      </g>`;
    });
    return out;
  };

  // 14. NEW: FUNNEL (RAG Hybrid Retrieval & Rerank Funnel)
  S.funnel = (L, acc, u) => {
    const n = L.length, yTop = 76, stepH = 388 / n;
    let out = "";
    L.forEach((t, i) => {
      const wTop = 720 - i * (360 / n);
      const wBot = 720 - (i + 1) * (360 / n);
      const y1 = yTop + i * stepH, y2 = y1 + stepH - 10;
      const d = 0.25 + i * 0.48;
      const fill = i === n - 1 ? "#12343b" : `url(#${u}card)`;
      const strk = i === n - 1 ? "#4fd1a5" : acc;
      out += `<g opacity="0" filter="url(#${u}sh)">${appear(d, -12)}
        <polygon points="${480 - wTop / 2},${y1} ${480 + wTop / 2},${y1} ${480 + wBot / 2},${y2} ${480 - wBot / 2},${y2}" fill="${fill}" stroke="${strk}" stroke-width="2.2"/>
        ${label(480, (y1 + y2) / 2, `${i + 1}. ${t}`, 18, i === n - 1 ? "#4fd1a5" : "#f8fafc", 34)}
      </g>`;
    });
    // Flowing candidate particles down the center
    out += pulse(`M480,58 L480,478`, acc, 0.5, 2.5, u, 7);
    out += pulse(`M410,58 L480,478`, "#3db4f2", 1.1, 2.5, u, 5);
    out += pulse(`M550,58 L480,478`, "#4fd1a5", 1.7, 2.5, u, 5);
    return out;
  };

  // 15. NEW: GAUGE (Live Eval & Production Telemetry Dashboard)
  S.gauge = (L, acc, u) => {
    const items = L.slice(0, 4), n = items.length;
    const vals = [94, 86, 98, 91], cols = [acc, "#4fd1a5", "#3db4f2", "#a855f7"];
    const r = 64, circ = 2 * Math.PI * r;
    const gap = Math.min(220, 780 / n), x0 = 480 - (n - 1) * gap / 2;
    let out = `<rect x="54" y="64" width="852" height="412" rx="20" fill="#0c1829" stroke="#22384f" stroke-width="1.5" filter="url(#${u}sh)"/>
      <text x="86" y="102" font-family="IBM Plex Mono, monospace" font-size="13" fill="#8ea2b8">EVAL & TELEMETRY DASHBOARD · لوحة المقاييس والأداء</text>`;
    items.forEach((t, i) => {
      const cx = x0 + i * gap, cy = 248, pct = vals[i % vals.length], col = cols[i % cols.length];
      const off = circ * (1 - pct / 100), d = 0.25 + i * 0.35;
      out += `<g opacity="0">${appear(d, 14)}
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#182c46" stroke-width="11"/>
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${col}" stroke-width="11" stroke-linecap="round"
          stroke-dasharray="${circ}" stroke-dashoffset="${circ}" transform="rotate(-90 ${cx} ${cy})" filter="url(#${u}glow)">
          <animate attributeName="stroke-dashoffset" from="${circ}" to="${off}" begin="${d + 0.15}s" dur="1.1s" fill="freeze"/>
        </circle>
        <text x="${cx}" y="${cy + 5}" text-anchor="middle" font-family="Outfit, sans-serif" font-size="26" font-weight="800" fill="#ffffff">${pct}%</text>
        ${label(cx, cy + 104, t, 16, "#cbd5e1", 16)}
      </g>`;
    });
    // Live sparkline at bottom
    out += `<path d="M90,432 Q180,398 270,426 T450,414 T630,428 T870,402" fill="none" stroke="${acc}" stroke-width="2.5" opacity=".7" stroke-dasharray="900" stroke-dashoffset="900">
      <animate attributeName="stroke-dashoffset" to="0" begin="1.1s" dur="1.3s" fill="freeze"/>
    </path>`;
    return out;
  };

  // 16. NEW: BLUEPRINT (Full-Stack System Architecture)
  S.blueprint = (L, acc, u) => {
    const n = L.length, gap = 16, h = Math.min(68, (370 - (n - 1) * gap) / n);
    const total = n * h + (n - 1) * gap, y0 = 270 - total / 2;
    let out = `<rect x="78" y="48" width="804" height="444" rx="18" fill="#0b1627" stroke="${acc}" stroke-opacity=".35" stroke-width="1.5" stroke-dasharray="8 6"/>
      <text x="104" y="76" font-family="IBM Plex Mono, monospace" font-size="12" fill="${acc}">SYSTEM BLUEPRINT · المعمارية الكاملة</text>`;
    L.forEach((t, i) => {
      const y = y0 + i * (h + gap) + h / 2;
      out += node(480, y, 640, h, t, i === 0 ? "#3db4f2" : i === n - 1 ? "#4fd1a5" : acc, 0.25 + i * 0.35, { size: 18, max: 44, badge: `T${i + 1}` }, u);
      if (i < n - 1) {
        out += `<line x1="480" y1="${y + h / 2}" x2="480" y2="${y + h / 2 + gap}" stroke="${acc}" stroke-width="2.5"/>`;
      }
    });
    out += pulse(`M200,${y0} L200,${y0 + total}`, "#3db4f2", 0.8, 2.6, u, 6.5);
    out += pulse(`M760,${y0 + total} L760,${y0}`, "#4fd1a5", 1.3, 2.6, u, 6.5);
    return out;
  };

  window.renderScene = function (type, labels, acc) {
    const u = nextId();
    const f = S[type] || S.pipeline;
    return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">${bg(acc, u)}${f(labels || [], acc, u)}</svg>`;
  };
  window.SCENE_DUR = 8;
  window.SceneKit = { W, H, esc, wrap, label, appear, bg, isAr, ff, pulse, nextId };
})();
