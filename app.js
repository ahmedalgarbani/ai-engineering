// AI Engineer Studio — Main Application Controller
(function () {
  const ACC = { C: "#f5a524", S1: "#3db4f2", S2: "#22c3a6", S3: "#f2795b", S4: "#e8618c", S5: "#9ccc65", S6: "#a855f7", S7: "#06b6d4", S8: "#6366f1" };
  const KIND = {
    orig: ["Course lesson", "درس من الكورس", "#94b8db"],
    add: ["Added lesson", "درس إضافي مطوّر", "#4fd1a5"],
    core: ["Core concept", "مفهوم أساسي", "#f5a524"]
  };
  const ICONS = {
    brain: "🧠", library: "📚", chef: "👨‍🍳", shield: "🛡️", rocket: "🚀",
    bolt: "⚡", compass: "🧭", radar: "📡", code: "💻", layers: "🧱", gauge: "📊"
  };

  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const $ = s => document.querySelector(s);
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
  };

  let done = new Set(store.get("aie-done", []));
  let ui = store.get("aie-ui", "ar");
  // v2 key: the redesign starts everyone on the bright theme once; the toggle still persists.
  let theme = store.get("aie-theme-v2", "light");
  let slideTheme = store.get("aie-stheme", "light");
  let motionMode = store.get("aie-mmode", "full");
  let sfxOn = store.get("aie-sfx", true);
  let ttsOn = store.get("aie-tts-v2", true);
  let subMode = store.get("aie-sub", "both"); // both | ar | en
  let filter = "all";
  let tab = store.get("aie-tab", "slides");
  const cleanups = [];
  const cleanup = () => {
    while (cleanups.length) { try { cleanups.pop()(); } catch (e) { } }
    try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) { }
  };

  // Flatten course
  const flat = [];
  COURSE.stages.forEach((st, si) => {
    st.no = si;
    st.modules.forEach(m => m.lessons.forEach(l => {
      l.stage = st; l.module = m; l.acc = ACC[st.id];
      l.slug = "l-" + l.id.replace(/\./g, "-").replace(/^(\d)/, "L$1");
      flat.push(l);
    }));
  });
  const bySlug = Object.fromEntries(flat.map(l => [l.slug, l]));
  const byId = Object.fromEntries(flat.map(l => [l.id, l]));
  const src = l => (typeof l.s === "string" ? SRC[l.s] : l.s) || SRC.course;
  const AR = () => ui === "ar";
  const T = p => AR() ? p[1] : p[0];
  const T2 = p => AR() ? p[0] : p[1];
  const cls1 = () => AR() ? "ar" : "en";
  const cls2 = () => AR() ? "en" : "ar";
  const stLabel = st => st.id === "C" ? "C" : st.id.replace("S", "");

  function applyTheme() {
    document.documentElement.dataset.theme = theme;
    $("#themeBtn").textContent = theme === "dark" ? "☀️" : "🌙";
  }
  applyTheme();

  function refreshHeaderBadges() {
    const best = store.get("aie-exam-best", null);
    const chip = $("#hdrLv");
    if (best && window.EXAM_LEVELS) {
      const lv = window.EXAM_LEVELS.find(x => x.id === best.levelId);
      if (lv) {
        chip.style.display = "inline-block";
        chip.textContent = `${lv.badge} · ${best.pct}%`;
        chip.style.color = lv.color;
      }
    } else {
      chip.style.display = "none";
    }
    const nQs = window.EXAM_BANK ? window.EXAM_BANK.length : 42;
    $("#examHdrLbl").textContent = AR() ? "اختبار المستوى" : "Level Exam";
    $("#asideExamT").textContent = AR() ? "اختبار تحديد المستوى" : "Level Exam";
    $("#asideExamS").textContent = AR() ? `${nQs} سؤالًا · مع شهادة` : `${nQs} questions · with certificate`;
    $("#q").placeholder = AR() ? "ابحث في الدروس…" : "Search lessons…";
    const FL = { all: ["All", "الكل"], orig: ["Course", "الكورس"], add: ["Added", "إضافي"], core: ["Core", "أساسي"], todo: ["To do", "متبقي"] };
    document.querySelectorAll("#filters button").forEach(b => { b.textContent = T(FL[b.dataset.f]); });
    $("#examHdrBtn").classList.toggle("on", location.hash === "#exam");
  }

  // ---------- sidebar ----------
  function buildTree() {
    const q = ($("#q").value || "").trim().toLowerCase();
    const cur = location.hash.slice(1);
    let html = "";
    COURSE.stages.forEach(st => {
      const all = st.modules.flatMap(m => m.lessons), dn = all.filter(l => done.has(l.id)).length;
      const open = q || filter !== "all" || (bySlug[cur] && bySlug[cur].stage === st) || store.get("aie-open-" + st.id, st.id === "C");
      let mods = "";
      st.modules.forEach(m => {
        const ls = m.lessons.filter(l => {
          const matchQ = !q || (l.id + " " + l.t[0] + " " + l.t[1]).toLowerCase().includes(q);
          const matchF = filter === "all" ? true : filter === "todo" ? !done.has(l.id) : l.k === filter;
          return matchQ && matchF;
        });
        if (!ls.length) return;
        mods += `<div class="mh ${cls1()}">${esc(T(m.t))}<span class="cnt">${m.lessons.reduce((a, b) => a + b.min, 0)} ${AR() ? "د" : "min"}</span></div>` +
          ls.map(l => `<div class="les ${done.has(l.id) ? "done" : ""} ${cur === l.slug ? "active" : ""}" data-slug="${l.slug}" tabindex="0" style="--sc:${l.acc}">
            <span class="num">${esc(l.id)}</span><span class="kdot" style="background:${KIND[l.k][2]}" title="${KIND[l.k][0]}"></span>
            <span class="lt ${cls1()}">${esc(T(l.t))}<small class="${cls2()}">${esc(T2(l.t))}</small></span>
            <span class="ck">${done.has(l.id) ? "✓" : ""}</span></div>`).join("");
      });
      if (!mods) return;
      html += `<div class="stage ${open ? "open" : ""}" data-st="${st.id}">
        <div class="sh"><span class="sno" style="background:${ACC[st.id]}">${stLabel(st)}</span>
          <span class="stitle ${cls1()}">${esc(T(st.t))}<small class="${cls2()}">${esc(T2(st.t))}</small></span>
          <span class="sbar" title="${dn}/${all.length}"><i style="width:${(dn / all.length) * 100}%;background:${ACC[st.id]}"></i></span><span class="chev">▶</span></div>
        <div class="sbody">${mods}</div></div>`;
    });
    $("#tree").innerHTML = html || `<p style="padding:14px;color:var(--muted)">${AR() ? "لا توجد دروس مطابقة للبحث أو الفلتر." : "No lessons match. Try another word or filter."}</p>`;
    $("#progTxt").textContent = `${done.size} / ${flat.length}`;
    $("#progBar").style.width = (done.size / flat.length * 100) + "%";
  }

  $("#tree").addEventListener("click", e => {
    const les = e.target.closest(".les");
    if (les) { location.hash = les.dataset.slug; document.body.classList.remove("nav"); return; }
    const sh = e.target.closest(".sh");
    if (sh) {
      const st = sh.parentElement;
      st.classList.toggle("open");
      store.set("aie-open-" + st.dataset.st, st.classList.contains("open"));
    }
  });
  $("#tree").addEventListener("keydown", e => { if (e.key === "Enter" && e.target.classList.contains("les")) location.hash = e.target.dataset.slug; });
  $("#q").addEventListener("input", buildTree);
  $("#filters").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    filter = b.dataset.f;
    document.querySelectorAll("#filters button").forEach(x => x.classList.toggle("on", x === b));
    buildTree();
  });
  document.querySelectorAll(".seg button").forEach(b => b.addEventListener("click", () => { ui = b.dataset.l; store.set("aie-ui", ui); render(); }));
  $("#themeBtn").addEventListener("click", () => { theme = theme === "dark" ? "light" : "dark"; store.set("aie-theme-v2", theme); applyTheme(); });
  $("#menuBtn").addEventListener("click", () => document.body.classList.toggle("nav"));
  $("#scrim").addEventListener("click", () => document.body.classList.remove("nav"));
  $("#homeLink").addEventListener("click", () => { history.replaceState(null, "", location.pathname); render(); });
  $("#examHdrBtn").addEventListener("click", () => { location.hash = "exam"; document.body.classList.remove("nav"); });
  $("#asideExamBtn").addEventListener("click", () => { location.hash = "exam"; document.body.classList.remove("nav"); });

  // ---------- home ----------
  function home() {
    document.documentElement.style.setProperty("--accent", "#f5a524");
    const mins = flat.reduce((a, b) => a + b.min, 0), c = k => flat.filter(l => l.k === k).length;
    const nextTodo = flat.find(l => !done.has(l.id)) || flat[0];
    const best = store.get("aie-exam-best", null);
    const bestLv = best && window.EXAM_LEVELS ? window.EXAM_LEVELS.find(x => x.id === best.levelId) : null;
    const pctDone = Math.round((done.size / flat.length) * 100);

    const dur = AR() ? `${Math.floor(mins / 60)} ساعة و${mins % 60} دقيقة` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
    const nMods = COURSE.stages.reduce((a, s) => a + s.modules.length, 0);
    const strip = t => t.replace(/^(Stage \d:|المرحلة \d:)\s*/, "");

    const nSt = COURSE.stages.length;
    const nQs = window.EXAM_BANK ? window.EXAM_BANK.length : 42;
    $("#page").innerHTML = `
      <section class="hero">
        <div>
          <div class="eyebrow" style="--sc:var(--accent)">${AR() ? `كورس تطبيقي · ${nSt} مراحل` : `Hands-on course · ${nSt} stages`}</div>
          <h2>${AR() ? "كورس مهندس الذكاء الاصطناعي" : "The AI Engineer Course"}</h2>
          <p>${AR()
            ? "من أساسيات النماذج حتى بناء منتجات ذكاء اصطناعي حقيقية. كل درس فيه شرائح، وفيديو قصير، وملخص بالصور، وشرح مكتوب."
            : "From model basics to shipping real AI products. Every lesson has slides, a short video, a visual summary and a written guide."}</p>
          <div class="hero-ctas">
            <button class="btn pri" id="goContinue" style="--sc:var(--accent)">${done.size ? (AR() ? `أكمل من ${nextTodo.id} ←` : `Continue ${nextTodo.id} →`) : (AR() ? "ابدأ أول درس ←" : "Start the first lesson →")}</button>
            <button class="btn" id="goExamHome">🎓 ${bestLv ? `${T(bestLv.t)} · ${best.pct}%` : (AR() ? "اختبار المستوى" : "Level exam")}</button>
          </div>
        </div>
        <div class="prog-card">
          <small>${AR() ? "تقدّمك" : "Your progress"}</small>
          <b class="big">${pctDone}%</b>
          <div class="bar"><i style="width:${pctDone}%"></i></div>
          <div class="facts">
            <span><b>${done.size}</b> ${AR() ? "من" : "of"} <b>${flat.length}</b> ${AR() ? "درس مكتمل" : "lessons done"}</span>
            <span><b>${nMods}</b> ${AR() ? "وحدة" : "modules"} · <b>${dur}</b></span>
          </div>
        </div>
      </section>

      <div class="sec-h">
        <h3>${AR() ? "مراحل الكورس" : "Course stages"}</h3>
        <div class="legend">
          <span class="pill"><i style="background:${KIND.orig[2]}"></i>${AR() ? "من الكورس" : "Course"} ${c("orig")}</span>
          <span class="pill"><i style="background:${KIND.add[2]}"></i>${AR() ? "إضافي" : "Added"} ${c("add")}</span>
          <span class="pill"><i style="background:${KIND.core[2]}"></i>${AR() ? "أساسي" : "Core"} ${c("core")}</span>
        </div>
      </div>

      <div class="track">${COURSE.stages.map(st => {
        const all = st.modules.flatMap(m => m.lessons);
        const m = all.reduce((a, b) => a + b.min, 0);
        const dn = all.filter(l => done.has(l.id)).length;
        return `<div class="scard" style="--sc:${ACC[st.id]}" data-first="${all[0].slug}" tabindex="0" role="link">
          <div class="scard-h">
            <span class="sno" style="background:${ACC[st.id]}">${stLabel(st)}</span>
            <span class="eyebrow">${st.id === "C" ? (AR() ? "الأساسيات" : "Core") : (AR() ? "المرحلة " + stLabel(st) : "Stage " + stLabel(st))}</span>
            <span class="cnt">${all.length} ${AR() ? "درس" : "lessons"} · ${m} ${AR() ? "د" : "min"}</span>
          </div>
          <h3>${esc(strip(T(st.t)))}</h3>
          <p class="mods">${st.modules.map(md => esc(T(md.t).replace(/^(Module|الوحدة) \d+: /, ""))).join(" · ")}</p>
          <div class="scard-f"><div class="bar"><i style="width:${(dn / all.length) * 100}%"></i></div><span>${dn}/${all.length}</span></div>
        </div>`;
      }).join("")}</div>

      <div class="exam-cta-row">
        <div>
          <h3>🎓 ${AR() ? "اختبر مستواك في نهاية الكورس" : "Check your level at the end"}</h3>
          <p>${AR() ? `${nQs} سؤالًا عمليًا، تقرير بنقاط قوتك وضعفك، وخطة مراجعة وشهادة.` : `${nQs} practical questions, a strengths report, a study plan and a certificate.`}</p>
        </div>
        <button class="btn pri" id="goExamBot" style="--sc:var(--accent)">${AR() ? "ابدأ الاختبار ←" : "Start the exam →"}</button>
      </div>`;

    $("#goContinue").onclick = () => location.hash = nextTodo.slug;
    $("#goExamHome").onclick = () => location.hash = "exam";
    $("#goExamBot").onclick = () => location.hash = "exam";
    document.querySelectorAll(".scard").forEach(r => {
      const go = () => location.hash = r.dataset.first;
      r.addEventListener("click", go);
      r.addEventListener("keydown", e => e.key === "Enter" && go());
    });
  }

  // ---------- lesson ----------
  function lesson(l) {
    const i = flat.indexOf(l), prev = flat[i - 1], next = flat[i + 1], k = KIND[l.k];
    document.documentElement.style.setProperty("--accent", l.acc);
    const page = $("#page"); page.style.setProperty("--sc", l.acc);
    const mi = l.module.lessons.indexOf(l) + 1;
    const tabsList = [
      ["slides", AR() ? "الشرائح" : "Slides"],
      ["motion", AR() ? "الفيديو" : "Video"],
      ["image", AR() ? "الملخص والصور" : "Summary & visuals"],
      ["ar", AR() ? "الشرح بالعربي" : "Arabic guide"],
      ["en", AR() ? "الشرح بالإنجليزي" : "English guide"]
    ];
    page.innerHTML = `
      <div class="eyebrow">${l.stage.id === "C" ? (AR() ? "المفاهيم الأساسية" : "Core concepts") : (AR() ? "المرحلة " + stLabel(l.stage) : "Stage " + stLabel(l.stage))} · ${esc(T(l.module.t).replace(/:.*/, ""))} · ${AR() ? `الدرس ${mi} من ${l.module.lessons.length}` : `lesson ${mi} of ${l.module.lessons.length}`}</div>
      <div class="lhead">
        <div class="t">
          <h2>${esc(l.id)} · ${esc(T(l.t))}</h2>
          <h3>${esc(T2(l.t))}</h3>
          <div class="chips">
            <span class="chip"><i style="background:${k[2]}"></i>${T(k)}</span>
            <span class="chip">⏱ ${l.min} ${AR() ? "دقيقة" : "min"}</span>
            <span class="chip">${l.p.length} ${AR() ? "نقاط رئيسية" : "key points"}</span>
            ${l.ex ? `<span class="chip">${AR() ? "فيه مثال كود" : "Includes code"}</span>` : ""}
          </div>
        </div>
        <button class="btn ${done.has(l.id) ? "done" : ""}" id="doneBtn">${done.has(l.id) ? (AR() ? "✓ مكتمل" : "✓ Completed") : (AR() ? "تحديد كمكتمل" : "Mark complete")}</button>
      </div>
      <div class="tabs" id="tabs" role="tablist">
        ${tabsList.map(([id, t]) => `<button role="tab" data-t="${id}" class="${tab === id ? "on" : ""}">${t}</button>`).join("")}
      </div>
      <div id="pane"></div>
      <div class="pager">
        ${prev ? `<button class="btn" data-go="${prev.slug}"><small>${AR() ? "→ الدرس السابق" : "← Previous"}</small><span>${esc(prev.id)} ${esc(T(prev.t))}</span></button>` : "<span></span>"}
        ${next ? `<button class="btn pri" data-go="${next.slug}"><small>${AR() ? "الدرس التالي ←" : "Next →"}</small><span>${esc(next.id)} ${esc(T(next.t))}</span></button>` : `<button class="btn pri" data-go="exam"><small>${AR() ? "الخطوة النهائية ←" : "Final Step →"}</small><span>🎓 ${AR() ? "اختبار نهاية الدورة لتحديد المستوى" : "Take End-of-Course Level Exam"}</span></button>`}
      </div>`;

    $("#tabs").addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      tab = b.dataset.t; store.set("aie-tab", tab);
      document.querySelectorAll("#tabs button").forEach(x => x.classList.toggle("on", x === b));
      pane(l, next);
    });
    document.querySelectorAll("[data-go]").forEach(b => b.addEventListener("click", () => { location.hash = b.dataset.go; }));
    $("#doneBtn").addEventListener("click", () => {
      done.has(l.id) ? done.delete(l.id) : done.add(l.id);
      store.set("aie-done", [...done]);
      buildTree();
      const b = $("#doneBtn");
      b.classList.toggle("done", done.has(l.id));
      b.textContent = done.has(l.id) ? (AR() ? "✓ مكتمل" : "✓ Completed") : (AR() ? "تحديد كمكتمل" : "Mark complete");
    });
    pane(l, next);
  }

  function makeSceneSVG(l) {
    const d = document.createElement("div");
    d.innerHTML = renderScene(l.v, l.vl, l.acc);
    return d.firstChild;
  }
  function freezeIn(el) {
    el.querySelectorAll("svg").forEach(s => { try { s.pauseAnimations(); s.setCurrentTime(18); } catch (e) { } });
  }

  function pane(l, next) {
    cleanup();
    const p = $("#pane");
    if (tab === "slides") slides(l, next, p);
    else if (tab === "motion") motion(l, next, p);
    else if (tab === "image") poster(l, p);
    else article(l, p, tab);
  }

  // ---------- PowerPoint Slide Deck (Redesigned + 3 Themes + .PPTX Export) ----------
  function deckOf(l, next) {
    const s = src(l), k = KIND[l.k], enr = window.enrichLesson(l), S = [];
    const add = (th, cls, inner, notes, opt) => S.push({ th, cls, inner, notes, opt: opt || {} });

    add("Cover", "cover", `
      <div class="blk">
        <div class="k">${l.stage.id === "C" ? "CORE CONCEPTS" : "STAGE " + stLabel(l.stage)} · ${esc(l.module.t[0].replace(/:.*/, ""))}</div>
        <div class="id">${esc(l.id)}</div>
        <div class="badge-dur">⏱ ${l.min} MIN · دقيقة</div>
      </div>
      <div class="txt">
        <div class="e">${esc(l.t[0])}</div>
        <div class="a">${esc(l.t[1])}</div>
        <div class="m"><span>${k[0]}</span><span class="ar">${k[1]}</span><span>${esc(l.module.t[0].replace(/^Module \d+: /, ""))}</span></div>
      </div>`,
      [l.d[0], l.d[1]], { bare: true });

    add("Agenda", "", `
      <div class="agenda">
        <div class="en"><h4>In this lesson</h4><ol>${l.p.map((p, i) => `<li><b>${i + 1}</b><span>${esc(p[0].split(/[:—;]/)[0].replace(/\.$/, ""))}</span></li>`).join("")}</ol></div>
        <div class="ar"><h4>في هذا الدرس</h4><ol>${l.p.map((p, i) => `<li><b>${i + 1}</b><span>${esc(p[1].split(/[:—؛]/)[0].replace(/\.$/, ""))}</span></li>`).join("")}</ol></div>
      </div>`,
      ["Introduce the " + l.p.length + " ideas this lesson covers, in order.", "عرّف بالأفكار الـ " + l.p.length + " التي يغطيها الدرس بالترتيب."]);

    add("Analogy", "", `
      <div class="ana-sld">
        <div class="ana-badge"><div class="ico">${ICONS[enr.icon] || "💡"}</div><b>Mental Model</b><span>التشبيه المبسط</span></div>
        <div class="ana-cards">
          <div class="ana-box"><p>${esc(enr.analogy[0])}</p></div>
          <div class="ana-box ar"><p>${esc(enr.analogy[1])}</p></div>
        </div>
      </div>`,
      [enr.analogy[0], enr.analogy[1]]);

    add("Overview", "", `
      <div class="ov">
        <div class="ov-c en"><div class="q">“</div><h4>Overview</h4><p>${esc(l.d[0])}</p></div>
        <div class="ov-c ar"><div class="q">”</div><h4>نظرة عامة</h4><p>${esc(l.d[1])}</p></div>
      </div>`,
      [l.d[0], l.d[1]]);

    add("Diagram", "dia", "",
      ["Walk through the visual architecture: " + l.vl.join(" → ") + ". Click 'Animate' to play it live!", "اشرح المعمارية البصرية: " + l.vl.join(" ← ") + ". اضغط «تشغيل الحركة» لعرضها حيّة!"],
      { diag: true });

    l.p.forEach((p, i) => add("Point " + (i + 1), "pt", `
      <div class="col">
        <div class="n">${String(i + 1).padStart(2, "0")}</div>
        <div class="of">KEY POINT · ${i + 1} / ${l.p.length}</div>
        <div class="dots">${l.p.map((_, j) => `<i class="${j <= i ? "on" : ""}"></i>`).join("")}</div>
      </div>
      <div class="txt">
        <div class="pcard"><div class="e">${esc(p[0])}</div></div>
        <div class="pcard"><div class="a">${esc(p[1])}</div></div>
      </div>`, p, { bare: true, hd: true }));

    if (l.ex) {
      const hi = window.highlightCode(l.ex).split("\n").map((ln, i) => `<span class="ln">${i + 1}</span>${ln}`).join("\n");
      add("Code", "code", `
        <div class="win">
          <div class="bar"><i style="background:#f2795b"></i><i style="background:#f5a524"></i><i style="background:#4fd1a5"></i><span>Hands-on Production Example · مثال عملي</span></div>
          <pre>${hi}</pre>
        </div>`,
        ["Walk through the syntax-highlighted code line by line and connect it to production practice.", "اشرح الكود الملوّن سطرًا بسطر واربطه بالتطبيق الإنتاجي."]);
    }

    add("Pro Tip", "", `
      <div class="pf-sld">
        <div class="pf-card bad"><div class="pf-tag">❌ Common Mistake · خطأ شائع</div><div class="pf-en">${esc(enr.mistake[0])}</div><div class="pf-ar">${esc(enr.mistake[1])}</div></div>
        <div class="pf-card good"><div class="pf-tag">✅ Best Practice · نصيحة خبير</div><div class="pf-en">${esc(enr.bestPractice[0])}</div><div class="pf-ar">${esc(enr.bestPractice[1])}</div></div>
      </div>`,
      [`Contrast the pitfall with the recommended engineering practice.`, `قارن الخطأ الشائع بالممارسة الهندسية السليمة.`]);

    add("Takeaways", "", `
      <div class="tk">${l.p.slice(0, 6).map(p => `<div class="c"><div class="e">✓ ${esc(p[0])}</div><div class="a">${esc(p[1])}</div></div>`).join("")}</div>`,
      ["Recap every key point before moving on.", "راجع كل النقاط الرئيسية قبل الانتقال."]);

    add("Next", "end", `
      <div><h4>Questions?</h4><div class="ar"><h4>أسئلة ومناقشة؟</h4></div><p class="src">Source · المصدر: ${esc(s[0])}</p></div>
      <div class="box">${next
        ? `<small>Next lesson · الدرس التالي</small><b>${esc(next.id)} · ${esc(next.t[0])}</b><div class="ar">${esc(next.t[1])}</div>`
        : `<small>Course complete · نهاية الكورس</small><b>Take the Final Level Exam!</b><div class="ar">أنت جاهز لاختبار نهاية الدورة وتحديد مستواك!</div>`}</div>`,
      ["Open questions, then point students to the source or next lesson.", "افتح باب الأسئلة، ثم وجّه الطلاب للمصدر أو الدرس التالي."]);

    return S;
  }

  function slideHTML(l, d, i, n) {
    const head = d.opt.bare && !d.opt.hd ? "" : `<div class="hd"><span><b>${esc(l.id)}</b> · ${esc(l.t[0].length > 56 ? l.t[0].slice(0, 54) + "…" : l.t[0])}</span><span class="tag-pill ar">${esc(d.th === "Diagram" ? "المعمارية البصرية" : l.module.t[1].replace(/^الوحدة \d+: /, ""))}</span></div>`;
    const foot = d.cls === "cover" ? "" : `<div class="ft"><i></i><span>AI Engineer Studio · مهندس الذكاء الاصطناعي</span><span class="pg">${i + 1} / ${n}</span></div>`;
    const body = d.opt.bare ? d.inner : `<div class="body">${d.inner}</div>`;
    return `<div class="sld ${d.cls}" data-i="${i}" style="--sc:${l.acc}">${head}${body}${foot}</div>`;
  }

  function slides(l, next, p) {
    const D = deckOf(l, next), n = D.length;
    let ix = 0, auto = null;
    const all = D.map((d, i) => slideHTML(l, d, i, n)).join("");

    p.innerHTML = `<div class="deck" id="deck" data-stheme="${slideTheme}">
      <div class="deck-top">
        <div class="theme-pills" id="sthemePills">
          <button data-st="light" class="${slideTheme === "light" ? "on" : ""}">☀️ ${AR() ? "أبيض احترافي" : "Editorial Light"}</button>
          <button data-st="dark" class="${slideTheme === "dark" ? "on" : ""}">🌑 ${AR() ? "داكن تنفيذي" : "Executive Dark"}</button>
          <button data-st="gradient" class="${slideTheme === "gradient" ? "on" : ""}">✨ ${AR() ? "تدرّج استوديو" : "Studio Gradient"}</button>
        </div>
        <div class="deck-exports">
          <button id="replayDiag" style="display:none">▶ ${AR() ? "تشغيل حركة الرسم" : "Animate Diagram"}</button>
          <button id="expPptx">⬇ ${AR() ? "تصدير PowerPoint (.pptx)" : "Export .PPTX"}</button>
          <button id="printDeck">🖨️ PDF</button>
        </div>
      </div>
      <div class="viewport" id="vp"><div class="canvas" id="cv">${all}</div></div>
      <div class="dprog"><i id="dp"></i></div>
      <div class="dbar">
        <button id="pv" aria-label="Previous slide">‹ ${AR() ? "السابق" : "Prev"}</button>
        <button id="nx" aria-label="Next slide">${AR() ? "التالي" : "Next"} ›</button>
        <span class="cnt" id="cnt"></span>
        <span class="sp">← → keys</span>
        <button id="auto">▶ ${AR() ? "عرض تلقائي" : "Auto-play"}</button>
        <button id="fs">⛶ ${AR() ? "ملء الشاشة" : "Present"}</button>
      </div>
      <div class="thumbs" id="thumbs">${D.map((d, i) => `<button class="th" data-i="${i}"><div class="tv"><div class="canvas">${slideHTML(l, d, i, n).replace('class="sld ', 'class="sld on ')}</div></div><span>${i + 1} · ${d.th}</span></button>`).join("")}</div>
      <div class="notes"><div class="en"><h5>Speaker notes</h5><div id="ne"></div></div><div class="ar"><h5>ملاحظات المقدّم</h5><div id="na"></div></div></div>
    </div>`;

    p.querySelectorAll('.sld.dia .body').forEach(b => b.appendChild(makeSceneSVG(l)));
    freezeIn(p);

    const vp = $("#vp"), cv = $("#cv"), sl = cv.querySelectorAll(".sld");
    const scale = () => { cv.style.transform = `scale(${vp.clientWidth / 1280})`; };
    const ro = new ResizeObserver(scale); ro.observe(vp); scale(); cleanups.push(() => ro.disconnect());

    const show = (j) => {
      ix = Math.max(0, Math.min(n - 1, j));
      sl.forEach((s, k) => { s.classList.toggle("on", k === ix); s.classList.toggle("left", k < ix); });
      p.querySelectorAll(".th").forEach((b, k) => b.classList.toggle("on", k === ix));
      const th = p.querySelector(".th.on"); if (th) th.scrollIntoView({ block: "nearest", inline: "nearest" });
      $("#cnt").textContent = `${ix + 1} / ${n}`;
      $("#dp").style.width = ((ix + 1) / n * 100) + "%";
      $("#ne").textContent = D[ix].notes[0];
      $("#na").textContent = D[ix].notes[1];
      $("#replayDiag").style.display = D[ix].opt.diag ? "inline-flex" : "none";
    };

    $("#sthemePills").onclick = e => {
      const b = e.target.closest("button"); if (!b) return;
      slideTheme = b.dataset.st; store.set("aie-stheme", slideTheme);
      $("#deck").dataset.stheme = slideTheme;
      p.querySelectorAll("#sthemePills button").forEach(x => x.classList.toggle("on", x === b));
    };
    $("#replayDiag").onclick = () => {
      const box = cv.querySelector(".sld.dia .body");
      if (box) { box.innerHTML = ""; box.appendChild(makeSceneSVG(l)); }
    };
    $("#expPptx").onclick = async () => {
      const btn = $("#expPptx"); const old = btn.textContent;
      btn.textContent = AR() ? "⏳ جاري تجهيز PPTX..." : "⏳ Building .pptx...";
      btn.disabled = true;
      await window.exportLessonPptx(l, next, src(l), slideTheme);
      btn.textContent = old; btn.disabled = false;
    };
    $("#printDeck").onclick = () => window.print();
    $("#pv").onclick = () => show(ix - 1);
    $("#nx").onclick = () => show(ix + 1);
    $("#thumbs").onclick = e => { const b = e.target.closest(".th"); if (b) show(+b.dataset.i); };
    vp.onclick = e => { const r = vp.getBoundingClientRect(); show(e.clientX - r.left > r.width / 3 ? ix + 1 : ix - 1); };
    const stopAuto = () => { clearInterval(auto); auto = null; $("#auto").textContent = "▶ " + (AR() ? "عرض تلقائي" : "Auto-play"); $("#auto").classList.remove("on"); };
    $("#auto").onclick = () => {
      if (auto) return stopAuto();
      $("#auto").textContent = "⏸ " + (AR() ? "إيقاف" : "Pause");
      $("#auto").classList.add("on");
      auto = setInterval(() => ix < n - 1 ? show(ix + 1) : stopAuto(), 6500);
    };
    cleanups.push(stopAuto);
    $("#fs").onclick = () => { const d = $("#deck"); try { document.fullscreenElement ? document.exitFullscreen() : d.requestFullscreen().catch(() => { }); } catch (e) { } };
    const key = e => {
      if (e.target.tagName === "INPUT") return;
      if (e.key === "ArrowRight" || e.key === "PageDown") show(ix + 1);
      if (e.key === "ArrowLeft" || e.key === "PageUp") show(ix - 1);
    };
    document.addEventListener("keydown", key);
    cleanups.push(() => document.removeEventListener("keydown", key));
    show(0);
  }

  // ---------- Motion Video Studio (Full Fun Explainer + Quick Recap + SFX + Neural Voiceover) ----------
  function motion(l, next, p) {
    const { chapters: C, total } = buildChapters(l, next, src(l), motionMode);
    p.innerHTML = `
      <div class="motion-head">
        <div class="mode-switch" id="mMode">
          <button data-m="full" class="${motionMode === "full" ? "on" : ""}">🎬 ${AR() ? "فيديو الشرح الممتع الطويل" : "Full Fun Explainer"} (${motionMode === "full" ? fmt(total) : "~1:45"})</button>
          <button data-m="quick" class="${motionMode === "quick" ? "on" : ""}">⚡ ${AR() ? "ملخص سريع" : "Quick Recap"} (~0:45)</button>
        </div>
        <div class="motion-toggles">
          <button id="sfxBtn" class="${sfxOn ? "on" : ""}">${sfxOn ? "🔊" : "🔇"} ${AR() ? "مؤثرات" : "SFX"}</button>
          <button id="ttsBtn" class="${ttsOn ? "on" : ""}">${ttsOn ? "🎙️" : "🔇"} ${AR() ? "تعليق صوتي طبيعي" : "Neural Voice"}</button>
          <button id="subBtn">CC: ${subMode === "both" ? (AR() ? "ثنائي" : "EN+AR") : subMode.toUpperCase()}</button>
        </div>
      </div>
      <div class="player" id="player">
        <div class="screen" id="screen">
          <div class="chap" id="chap"></div>
          <div class="dur-badge">${motionMode === "full" ? (AR() ? "شرح كامل ممتع" : "FULL EXPLAINER") : (AR() ? "ملخص سريع" : "QUICK RECAP")} · ${fmt(total)}</div>
          <div class="big" id="big"><span>▶</span></div>
        </div>
        <div class="caps" id="caps"></div>
        <div class="ctrl">
          <button id="play" aria-label="Play or pause">⏸</button>
          <button id="rep" aria-label="Replay">↺</button>
          <div class="tl" id="tl">${C.map(c => `<div class="s" style="flex:${c.dur}" title="${esc(T(c.name))}"><i></i></div>`).join("")}</div>
          <span class="time" id="time"></span>
          <button id="spd">1×</button>
          <button id="fsv" aria-label="Fullscreen">⛶</button>
        </div>
        <div class="chapters" id="chs">${C.map((c, i) => `<button data-i="${i}"><small>${fmt(c.start)} · ${Math.round(c.dur)}s</small>${esc(T(c.name))}</button>`).join("")}</div>
      </div>
      <p style="font-size:12.5px;color:var(--muted);margin-top:10px">${AR()
        ? `فيديو موشن تفاعلي مدته ${fmt(total)} مقسم إلى ${C.length} مشاهد مع تعليق صوتي عصبي متزامن لا ينقطع: مقدمة وتشويق، قصة وتشبيه، معمارية متحركة، شرح النقاط، ${l.ex ? "كود عملي، " : ""}خطأ شائع ونصيحة خبير، تحدي فهم سريع، وخلاصة.`
        : `A ${fmt(total)} multi-act animated motion explainer across ${C.length} scenes with synced voiceover: hook, analogy story, live visual architecture, deep-dive points, ${l.ex ? "animated code walkthrough, " : ""}mistake vs pro tip, interactive brain check, and grand recap.`}</p>`;

    const screen = $("#screen"), segs = [...p.querySelectorAll(".tl .s i")], chs = [...p.querySelectorAll("#chs button")];
    let t = 0, playing = true, speed = 1, cur = -1, svg = null, last = performance.now(), raf;
    const speeds = [1, 1.25, 1.5, 2, 0.75];

    // Synced Neural Audio + Natural SpeechSynthesis Fallback (never cuts off mid-sentence)
    let activeAudio = null, audioBusy = false, audioToken = 0, quizTimer = null;
    const preloaded = {};
    function preloadChapter(ci) {
      const ch = C[ci];
      if (!ch || !ch.clips) return;
      ch.clips.forEach(cl => {
        if (!preloaded[cl.k]) {
          const a = new Audio("video/out/tts/" + cl.k + ".mp3");
          a.preload = "auto";
          preloaded[cl.k] = a;
        }
      });
    }
    function stopAudio() {
      audioToken++;
      audioBusy = false;
      if (quizTimer) { clearTimeout(quizTimer); quizTimer = null; }
      if (activeAudio) {
        try { activeAudio.pause(); activeAudio.onended = null; activeAudio.onerror = null; } catch (e) { }
        activeAudio = null;
      }
      try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch (e) { }
    }
    function pickBestVoice(langPrefix) {
      if (!window.speechSynthesis) return null;
      const voices = window.speechSynthesis.getVoices() || [];
      const matching = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith(langPrefix));
      return matching.find(v => /natural|neural|online|google|premium|enhanced/i.test(v.name)) || matching[0] || null;
    }
    function speakFallback(text, langPrefix, token) {
      if (!window.speechSynthesis || !text) { audioBusy = false; return; }
      try {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        const v = pickBestVoice(langPrefix);
        if (v) u.voice = v;
        u.lang = langPrefix === "ar" ? "ar-SA" : "en-US";
        u.rate = Math.min(1.6, speed);
        u.pitch = 1.0;
        const safety = setTimeout(() => { if (token === audioToken) audioBusy = false; }, Math.max(4000, text.length * 140 / speed));
        u.onend = u.onerror = () => { clearTimeout(safety); if (token === audioToken) audioBusy = false; };
        audioBusy = true;
        window.speechSynthesis.speak(u);
      } catch (e) { audioBusy = false; }
    }
    function playChapterAudio(ch) {
      stopAudio();
      if (!ttsOn || !playing) return;
      const token = audioToken;
      const useNeuralAr = (AR() || subMode !== "en") && ch.clips && ch.clips.length > 0;
      if (!useNeuralAr) {
        speakFallback(AR() ? ch.cap[1] : ch.cap[0], AR() ? "ar" : "en", token);
        return;
      }
      audioBusy = true;
      let idx = 0;
      const playNext = () => {
        if (token !== audioToken) return;
        if (idx >= ch.clips.length) { audioBusy = false; return; }
        const cl = ch.clips[idx++];
        const a = new Audio("video/out/tts/" + cl.k + ".mp3");
        a.playbackRate = speed;
        activeAudio = a;
        a.onended = () => {
          if (token !== audioToken) return;
          if (ch.kind === "quiz" && idx === 1 && ch.clips.length > 1) {
            const pauseMs = Math.max(800, ((ch.quizPause || 3.5) * 1000) / speed);
            quizTimer = setTimeout(playNext, pauseMs);
          } else {
            playNext();
          }
        };
        a.onerror = () => {
          if (token !== audioToken) return;
          activeAudio = null;
          speakFallback(AR() ? ch.cap[1] : ch.cap[0], AR() ? "ar" : "en", token);
        };
        a.play().catch(() => {
          if (token !== audioToken) return;
          // Autoplay blocked or file missing: fall back gracefully
          speakFallback(AR() ? ch.cap[1] : ch.cap[0], AR() ? "ar" : "en", token);
        });
      };
      playNext();
    }

    function renderCaps(cap) {
      const box = $("#caps");
      if (subMode === "en") box.innerHTML = `<div class="en f">${esc(cap[0])}</div>`;
      else if (subMode === "ar") box.innerHTML = `<div class="ar f">${esc(cap[1])}</div>`;
      else box.innerHTML = `<div class="en f">${esc(cap[0])}</div><div class="ar f">${esc(cap[1])}</div>`;
    }

    function mount(ci) {
      if (svg) svg.remove();
      const d = document.createElement("div"); d.innerHTML = C[ci].svg(); svg = d.firstChild;
      screen.insertBefore(svg, screen.firstChild);
      try { svg.pauseAnimations(); } catch (e) { }
      const isTransition = cur !== -1;
      cur = ci;
      $("#chap").textContent = `${C[ci].name[0]} · ${C[ci].name[1]}`;
      renderCaps(C[ci].cap);
      chs.forEach((b, k) => b.classList.toggle("on", k === ci));
      const activeCh = chs[ci];
      if (activeCh) activeCh.scrollIntoView({ block: "nearest", inline: "nearest" });
      if (isTransition && sfxOn && playing && window.MotionAudio) {
        window.MotionAudio.chime(440 + (ci % 5) * 60);
      }
      preloadChapter(ci + 1);
      if (playing) playChapterAudio(C[ci]);
    }

    function draw() {
      let ci = C.findIndex(c => t < c.start + c.dur);
      if (ci < 0) ci = C.length - 1;
      if (ci !== cur) mount(ci);
      try { svg.setCurrentTime(Math.min(t - C[ci].start, C[ci].dur)); } catch (e) { }
      segs.forEach((s, k) => s.style.width = (t >= C[k].start + C[k].dur ? 100 : t <= C[k].start ? 0 : (t - C[k].start) / C[k].dur * 100) + "%");
      $("#time").textContent = `${fmt(t)} / ${fmt(total)}`;
    }

    function loop(now) {
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      if (playing) {
        const curCh = C[cur];
        const chEnd = curCh ? curCh.start + curCh.dur : total;
        if (audioBusy && t + dt * speed >= chEnd - 0.05) {
          // Hold at end of current chapter until voiceover finishes — never cut off mid-sentence
          t = chEnd - 0.05;
        } else {
          t += dt * speed;
        }
        if (t >= total) { t = total; setPlay(false); $("#big").classList.add("show"); }
      }
      draw();
      raf = requestAnimationFrame(loop);
    }
    function setPlay(v) {
      playing = v;
      $("#play").textContent = v ? "⏸" : "▶";
      if (v) {
        $("#big").classList.remove("show");
        if (activeAudio && activeAudio.paused && activeAudio.currentTime > 0 && !activeAudio.ended) {
          activeAudio.play().catch(() => { });
        } else if (ttsOn && cur >= 0 && !audioBusy) {
          playChapterAudio(C[cur]);
        }
      } else {
        if (activeAudio) try { activeAudio.pause(); } catch (e) { }
        if (window.speechSynthesis) try { window.speechSynthesis.cancel(); } catch (e) { }
      }
    }
    function seek(nt) {
      t = Math.max(0, Math.min(total - 0.01, nt));
      $("#big").classList.remove("show");
      let ci = C.findIndex(c => t < c.start + c.dur);
      if (ci < 0) ci = C.length - 1;
      if (ci === cur && playing) playChapterAudio(C[ci]);
      draw();
    }

    $("#mMode").onclick = e => {
      const b = e.target.closest("button"); if (!b || b.dataset.m === motionMode) return;
      motionMode = b.dataset.m; store.set("aie-mmode", motionMode);
      pane(l, next);
    };
    $("#sfxBtn").onclick = () => {
      sfxOn = !sfxOn; store.set("aie-sfx", sfxOn);
      $("#sfxBtn").classList.toggle("on", sfxOn);
      $("#sfxBtn").textContent = `${sfxOn ? "🔊" : "🔇"} ${AR() ? "مؤثرات" : "SFX"}`;
      if (sfxOn && window.MotionAudio) window.MotionAudio.chime(587);
    };
    $("#ttsBtn").onclick = () => {
      ttsOn = !ttsOn; store.set("aie-tts-v2", ttsOn);
      $("#ttsBtn").classList.toggle("on", ttsOn);
      $("#ttsBtn").textContent = `${ttsOn ? "🎙️" : "🔇"} ${AR() ? "تعليق صوتي طبيعي" : "Neural Voice"}`;
      if (ttsOn && cur >= 0 && playing) playChapterAudio(C[cur]);
      else stopAudio();
    };
    $("#subBtn").onclick = () => {
      const order = ["both", "ar", "en"];
      subMode = order[(order.indexOf(subMode) + 1) % order.length];
      store.set("aie-sub", subMode);
      $("#subBtn").textContent = `CC: ${subMode === "both" ? (AR() ? "ثنائي" : "EN+AR") : subMode.toUpperCase()}`;
      if (cur >= 0) renderCaps(C[cur].cap);
    };

    $("#play").onclick = () => { if (!playing && t >= total) seek(0); setPlay(!playing); };
    $("#big").onclick = () => { seek(0); setPlay(true); };
    $("#rep").onclick = () => { seek(0); setPlay(true); };
    $("#spd").onclick = () => {
      speed = speeds[(speeds.indexOf(speed) + 1) % speeds.length];
      $("#spd").textContent = speed + "×";
      if (activeAudio) activeAudio.playbackRate = speed;
    };
    $("#tl").onclick = e => { const r = e.currentTarget.getBoundingClientRect(); seek((e.clientX - r.left) / r.width * total); };
    $("#chs").onclick = e => { const b = e.target.closest("button"); if (b) { seek(C[+b.dataset.i].start); setPlay(true); } };
    $("#fsv").onclick = () => { const d = $("#player"); try { document.fullscreenElement ? document.exitFullscreen() : d.requestFullscreen().catch(() => { }); } catch (e) { } };
    const key = e => {
      if (e.target.tagName === "INPUT") return;
      if (e.key === " ") { e.preventDefault(); $("#play").click(); }
      if (e.key === "ArrowRight") seek(t + 5);
      if (e.key === "ArrowLeft") seek(t - 5);
    };
    document.addEventListener("keydown", key);
    raf = requestAnimationFrame(loop);
    cleanups.push(() => { stopAudio(); cancelAnimationFrame(raf); document.removeEventListener("keydown", key); });
  }
  const fmt = s => { s = Math.max(0, s); return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`; };

  // ---------- Lesson Summary Image & Illustrative Images Gallery ----------
  function poster(l, p) {
    const enr = window.enrichLesson(l);
    const LV = window.LessonVisuals;
    const summarySvg = LV ? LV.buildLessonSummarySVG(l, enr, ui) : "";
    const illList = LV ? LV.buildLessonIllustrations(l, enr, ui) : [];

    p.innerHTML = `<div class="vis-wrap">
      <section class="vis-section">
        <div class="vis-bar">
          <div>
            <h3>🖼️ ${AR() ? "صورة ملخص الدرس الشاملة" : "Lesson Summary Image (Cheat Sheet)"}</h3>
            <p>${AR() ? "بطاقة بصرية تلخص فكرة الدرس، التشبيه، النقاط الأساسية، والخطأ الشائع في صورة واحدة." : "A complete visual cheat-sheet summarizing the overview, mental model, key points, and pro tips."}</p>
          </div>
          <button class="btn pri" id="dlSummaryPng">⬇ ${AR() ? "تحميل صورة الملخص (PNG)" : "Download Summary PNG"}</button>
        </div>
        <div class="vis-summary-frame" id="sumFrame">${summarySvg}</div>
      </section>

      <section class="vis-section">
        <div class="vis-bar">
          <div>
            <h3>🎨 ${AR() ? "صور توضيحية للدرس" : "Illustrative Lesson Visuals"} (${illList.length})</h3>
            <p>${AR() ? "رسوم توضيحية مخصّصة لشرح آلية العمل والتشبيه الذهني والمقارنة الهندسية." : "Custom visual diagrams illustrating the architecture, mental model, and engineering trade-offs."}</p>
          </div>
        </div>
        <div class="vis-gallery" id="visGallery">
          ${illList.map((item, idx) => `
            <div class="vis-card" data-idx="${idx}">
              <div class="vis-card-head">
                <div>
                  <b>${esc(item.title)}</b>
                  <small>${esc(item.desc)}</small>
                </div>
                <button class="vis-dl-btn" data-dl="${idx}">⬇ PNG</button>
              </div>
              <div class="vis-card-fig" id="visFig${idx}">${item.svg}</div>
            </div>
          `).join("")}
        </div>
      </section>

      <div class="poster">
        <div class="ph"><div class="en">${esc(l.t[0])}</div><div class="ar">${esc(l.t[1])}</div></div>
        <div class="pgrid">
          <div class="pcol en"><h4>Key points</h4>${l.p.map((x, i) => `<div class="pitem"><b>${i + 1}</b><span>${esc(x[0])}</span></div>`).join("")}</div>
          <div class="pcol ar"><h4>النقاط الرئيسية</h4>${l.p.map((x, i) => `<div class="pitem"><b>${i + 1}</b><span>${esc(x[1])}</span></div>`).join("")}</div>
        </div>
        <div class="poster-extra">
          <div class="en"><strong style="color:var(--sc)">${ICONS[enr.icon] || "💡"} Mental Model:</strong> <span style="color:var(--muted)">${esc(enr.analogy[0])}</span></div>
          <div class="ar"><strong style="color:var(--sc)">${ICONS[enr.icon] || "💡"} التشبيه المبسط:</strong> <span style="color:var(--muted)">${esc(enr.analogy[1])}</span></div>
        </div>
      </div>
    </div>`;

    freezeIn($("#visGallery"));
    const dlSum = $("#dlSummaryPng");
    if (dlSum && LV) {
      dlSum.onclick = () => {
        const svgEl = $("#sumFrame svg");
        if (svgEl) LV.downloadSvgAsPng(svgEl, `${l.id}-summary-${ui}.png`);
      };
    }
    p.querySelectorAll("[data-dl]").forEach(btn => {
      btn.onclick = () => {
        const idx = +btn.dataset.dl;
        const item = illList[idx];
        const svgEl = $(`#visFig${idx} svg`);
        if (svgEl && LV) LV.downloadSvgAsPng(svgEl, `${l.id}-${item.id}.png`);
      };
    });
  }

  // ---------- Enriched Article (with Syntax Highlighting + Copy + Interactive Mini-Check) ----------
  function article(l, p, lang) {
    const s = src(l), k = KIND[l.k], A = lang === "ar", i = A ? 1 : 0;
    const enr = window.enrichLesson(l), q = enr.quiz;
    const L = A
      ? { ov: "نظرة عامة", kp: "النقاط الرئيسية", ex: "مثال عملي بالكود", src: "المصدر للتعمق", st: "المرحلة", md: "المحاضرة / الوحدة", mn: "المدة", ty: "النوع", min: "دقيقة", ana: "التشبيه الذهني المبسط", bad: "❌ خطأ شائع تجنّبه", good: "✅ نصيحة خبير", dg: "مكوّنات المعمارية البصرية", st2: "ملخص المرحلة", cp: "نسخ الكود", cpd: "✓ تم النسخ" }
      : { ov: "Overview", kp: "Key points", ex: "Hands-on Code Example", src: "Source & Further Reading", st: "Stage", md: "Lecture / module", mn: "Duration", ty: "Type", min: "min", ana: "Fun Mental Model", bad: "❌ Common Mistake to Avoid", good: "✅ Production Pro Tip", dg: "Visual Architecture Flow", st2: "Stage summary", cp: "Copy", cpd: "✓ Copied" };

    p.innerHTML = `<article class="article ${A ? "ar" : "en"}">
      <h2>${esc(l.id)} · ${esc(l.t[i])}</h2>
      <dl class="kv"><dt>${L.st}</dt><dd>${esc(l.stage.t[i])}</dd><dt>${L.md}</dt><dd>${esc(l.module.t[i])}</dd><dt>${L.mn}</dt><dd>${l.min} ${L.min}</dd><dt>${L.ty}</dt><dd>${k[i]}</dd></dl>

      <div class="callout" style="margin-top:18px">
        <b>${ICONS[enr.icon] || "💡"} ${L.ana}</b>
        <p>${esc(enr.analogy[i])}</p>
      </div>

      <h4>${L.ov}</h4><p>${esc(l.d[i])}</p>
      ${window.LessonDeepDive ? (() => {
        const dd = window.LessonDeepDive.getLessonDeepDive(l);
        const terms = window.LessonDeepDive.getLessonGlossary(l);
        return `
          <div class="deep-box">
            <h4>🔬 ${A ? "الشرح الهندسي المعمّق: كيف يعمل تقنيًا؟" : "Technical Deep Dive: Under the Hood"}</h4>
            <p>${esc(dd.how[i])}</p>
            <div class="deep-metric">📏 ${esc(dd.metrics[i])}</div>
          </div>

          <div class="gloss-box">
            <h4>📖 ${A ? "شرح المصطلحات المذكورة في هذا الدرس (بدون ترجمة حرفية)" : "Technical Terms Explained"}</h4>
            <div class="gloss-grid">
              ${terms.map(t => `
                <div class="gloss-card">
                  <div class="gloss-title">
                    <b>${esc(A ? t.ar : t.en)}</b>
                    <small>${esc(A ? t.en : t.ar)}</small>
                  </div>
                  <p>${esc(t.def[i])}</p>
                  <div class="gloss-ex"><span>${A ? "مثال:" : "Example:"}</span> ${esc(t.ex[i])}</div>
                </div>
              `).join("")}
            </div>
          </div>

          <div class="industry-box">
            <h4>🌐 ${A ? "محتوى وممارسات من أقوى المصادر والشركات العالمية" : "Authoritative Industry & Research Sources"}</h4>
            <div class="ind-grid">
              ${dd.sources.map(srcItem => `
                <a class="ind-card" href="${esc(srcItem.url)}" target="_blank" rel="noopener">
                  <span class="ind-org">${esc(srcItem.org)}</span>
                  <b>${esc(srcItem.title)} ↗</b>
                  <p>${esc(srcItem.insight[i])}</p>
                </a>
              `).join("")}
            </div>
          </div>
        `;
      })() : ""}
      ${window.LessonVisuals ? `
        <div class="article-vis">
          <div class="vis-bar">
            <b>🖼️ ${A ? "صورة ملخص الدرس" : "Lesson Summary Image"}</b>
            <button class="vis-dl-btn" id="artDlSum">⬇ ${A ? "تحميل PNG" : "Download PNG"}</button>
          </div>
          <div class="vis-summary-frame" id="artSumFrame">${window.LessonVisuals.buildLessonSummarySVG(l, enr, lang)}</div>
        </div>
      ` : ""}
      <h4>${L.kp}</h4><ol>${l.p.map(x => `<li>${esc(x[i])}</li>`).join("")}</ol>
      <h4>${L.dg}</h4><p>${esc(l.vl.join(A ? " ← " : " → "))}</p>

      <div class="callout-grid">
        <div class="callout bad"><b>${L.bad}</b><p>${esc(enr.mistake[i])}</p></div>
        <div class="callout good"><b>${L.good}</b><p>${esc(enr.bestPractice[i])}</p></div>
      </div>

      ${l.ex ? `<h4>${L.ex}</h4><div class="code-wrap"><button class="copy-btn" id="copyCode">${L.cp}</button><pre>${window.highlightCode(l.ex)}</pre></div>` : ""}

      <div class="mini-q" id="miniQ">
        <h5>🧠 ${esc(q.q[i])}</h5>
        <div class="mq-opts">
          ${q.opts.map((opt, idx) => `<button class="mq-opt" data-idx="${idx}">${esc(opt[i])}</button>`).join("")}
        </div>
        <div class="mq-fb" id="mqFb" style="display:none"></div>
      </div>

      <h4>${L.st2}</h4><p>${esc(l.stage.d[i])}</p>
      <h4>${L.src}</h4><div class="srcbox"><a href="${esc(s[1])}" target="_blank" rel="noopener">${esc(s[0])} ↗</a></div>
    </article>`;

    const cpBtn = $("#copyCode");
    if (cpBtn) {
      cpBtn.onclick = () => {
        navigator.clipboard && navigator.clipboard.writeText(l.ex).catch(() => {});
        cpBtn.textContent = L.cpd;
        setTimeout(() => cpBtn.textContent = L.cp, 1600);
      };
    }
    const artDlSum = $("#artDlSum");
    if (artDlSum && window.LessonVisuals) {
      artDlSum.onclick = () => {
        const svgEl = $("#artSumFrame svg");
        if (svgEl) window.LessonVisuals.downloadSvgAsPng(svgEl, `${l.id}-summary-${lang}.png`);
      };
    }

    p.querySelectorAll(".mq-opt").forEach(btn => btn.onclick = () => {
      const idx = +btn.dataset.idx, ok = idx === q.ans;
      p.querySelectorAll(".mq-opt").forEach((b, k) => {
        b.classList.remove("ok", "bad");
        if (k === q.ans) b.classList.add("ok");
        else if (k === idx && !ok) b.classList.add("bad");
      });
      const fb = $("#mqFb");
      fb.style.display = "block";
      fb.innerHTML = `<strong style="color:${ok ? "var(--ok-ink)" : "var(--bad-ink)"}">${ok ? (A ? "✓ إجابة ممتازة!" : "✓ Spot on!") : (A ? "✗ ليست تمامًا — إليك الصحيح:" : "✗ Not quite — here's why:")}</strong> ${esc(q.why[i])}`;
    });
  }

  // ---------- router ----------
  function render() {
    cleanup();
    document.documentElement.lang = ui;
    document.documentElement.dir = AR() ? "rtl" : "ltr";
    document.querySelectorAll(".seg button").forEach(b => b.classList.toggle("on", b.dataset.l === ui));
    refreshHeaderBadges();
    buildTree();

    const hash = location.hash.slice(1);
    if (hash === "exam") {
      document.documentElement.style.setProperty("--accent", "#f5a524");
      window.renderExamView($("#page"), {
        ui, stages: COURSE.stages, flat, byId, store,
        registerCleanup: fn => cleanups.push(fn),
        onGoLesson: slug => { location.hash = slug; },
        onExamSaved: () => refreshHeaderBadges()
      });
    } else if (bySlug[hash]) {
      lesson(bySlug[hash]);
    } else {
      home();
    }

    $("#main").scrollTop = 0;
    const a = document.querySelector(".les.active");
    if (a) a.scrollIntoView({ block: "nearest" });
  }

  window.addEventListener("hashchange", render);
  render();
})();
