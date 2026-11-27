// AI Engineer Studio — English vocabulary trainer: word list, spaced-repetition flashcards and a quiz.
// Data lives in vocab-data.js (window.VOCAB). Progress is kept per browser in localStorage ("aie-vocab").
(function () {
  const V = window.VOCAB;
  if (!V) return;

  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const DAY = 864e5;
  // Leitner-style review gaps: a word you know comes back after 1, 3, 7, 16, then 35 days.
  const INT = [0, DAY, 3 * DAY, 7 * DAY, 16 * DAY, 35 * DAY];
  const KNOWN_BOX = 3, SESSION = 15, QUIZ_N = 10;
  // What the speech engine should actually say for abbreviations.
  const SAY = { "e.g.": "for example", "i.e.": "that is", "API": "A P I", "LLM": "L L M" };
  const CAT = Object.fromEntries(V.cats.map(c => [c.id, c]));

  const WORDS = [];
  V.cats.forEach(c => (V.words[c.id] || []).forEach(a => WORDS.push({
    id: a[0].toLowerCase(), w: a[0], say: a[1], pos: a[2], ar: a[3], def: a[4], ex: a[5], exAr: a[6],
    forms: a[7] || "", m: a[8] || "", cat: c.id, ord: WORDS.length, freq: 0, lessons: []
  })));
  const BY_ID = Object.fromEntries(WORDS.map(w => [w.id, w]));

  // A word matches its plural / -ed / -ing forms, any listed forms, and treats "-" and " " alike.
  const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  function wordRx(x) {
    let src = x.m;
    if (!src) {
      const one = s => reEsc(s.toLowerCase()).replace(/[ -]/g, "[ -]");
      const b = x.w.toLowerCase();
      const alts = [one(b) + "(?:s|es|d|ed|ing)?"];
      if (/e$/.test(b)) alts.push(one(b.slice(0, -1)) + "(?:ing|ed)");
      if (/y$/.test(b)) alts.push(one(b.slice(0, -1)) + "(?:ies|ied)");
      x.forms.split(/\s*·\s*/).filter(Boolean).forEach(f => alts.push(one(f)));
      src = alts.join("|");
    }
    return new RegExp(`(?<![A-Za-z])(?:${src})(?![A-Za-z])`, "gi");
  }
  WORDS.forEach(w => { w.rx = wordRx(w); });

  // Count where each word appears in the lessons (once, after app.js has given lessons their slugs).
  let indexed = false;
  function ensureIndex(flat) {
    if (indexed || !flat || !flat.length) return;
    indexed = true;
    flat.forEach(l => {
      const txt = [l.t[0], l.d[0], ...l.p.map(p => p[0]), ...(l.vl || [])].join(" \n ");
      WORDS.forEach(w => {
        const n = (txt.match(w.rx) || []).length;
        if (n) { w.freq += n; w.lessons.push({ l, n }); }
      });
    });
  }
  const inLesson = (w, l) => { const x = w.lessons.find(y => y.l === l); return x ? x.n : 0; };

  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const short = ar => ar.split(/[:—]/)[0].trim();

  // ---------- progress (box b, due time d) ----------
  let store = null, prog = {};
  function load(st) {
    if (!st) return;
    store = st;
    const p = st.get("aie-vocab", {});
    prog = p && typeof p === "object" ? p : {};
  }
  const save = () => { if (store) store.set("aie-vocab", prog); };
  const status = id => { const r = prog[id]; return !r ? "new" : r.b >= KNOWN_BOX ? "known" : "learning"; };
  function setStatus(id, s) {
    if (s === "new") delete prog[id];
    else if (s === "known") { const b = Math.max(KNOWN_BOX, (prog[id] || {}).b || 0); prog[id] = { b, d: Date.now() + INT[b] }; }
    else prog[id] = { b: 0, d: Date.now() };
    save();
  }
  function grade(id, ok) {
    const r = prog[id] || { b: 0, d: 0 };
    if (ok) { r.b = Math.min(r.b + 1, INT.length - 1); r.d = Date.now() + INT[r.b]; }
    else { r.b = 0; r.d = Date.now(); }
    prog[id] = r;
    save();
  }
  function counts() {
    let known = 0, learning = 0, due = 0;
    const now = Date.now();
    WORDS.forEach(w => {
      const r = prog[w.id];
      if (!r) return;
      if (r.b >= KNOWN_BOX) known++; else learning++;
      if (r.d <= now) due++;
    });
    return { total: WORDS.length, known, learning, fresh: WORDS.length - known - learning, due };
  }

  // ---------- speech (browser English voice) ----------
  let voice = null;
  const canSpeak = () => !!window.speechSynthesis;
  function pickVoice() {
    try {
      const en = (window.speechSynthesis.getVoices() || []).filter(v => /^en[-_]/i.test(v.lang));
      const us = en.filter(v => /en[-_]US/i.test(v.lang));
      voice = us.find(v => /Google|Natural|Aria|Jenny|Samantha/i.test(v.name)) || us[0] || en.find(v => /en[-_]GB/i.test(v.lang)) || en[0] || null;
    } catch (e) { voice = null; }
  }
  if (canSpeak()) {
    pickVoice();
    try { window.speechSynthesis.addEventListener("voiceschanged", pickVoice); } catch (e) { }
  }
  function speak(text, slow) {
    if (!canSpeak()) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(SAY[text] || text);
      u.lang = voice ? voice.lang : "en-US";
      if (voice) u.voice = voice;
      u.rate = slow ? 0.55 : 0.9;
      window.speechSynthesis.speak(u);
    } catch (e) { }
  }

  // ---------- shared word card ----------
  const hl = w => esc(w.ex).replace(w.rx, "<mark>$&</mark>");
  const isVerb = w => /(^|\/)v($|\/)/.test(w.pos);
  function formsHTML(w, L) {
    if (!w.forms) return "";
    const n = w.forms.split("·").length;
    const lab = isVerb(w) && n === 3 ? L("Verb forms (now · past · past participle)", "تصريف الفعل (الحاضر · الماضي · التصريف الثالث)")
      : w.pos === "adj" ? L("Forms (normal · more · most)", "الصيغ (عادي · أكثر · الأكثر)")
        : L("Singular · plural", "المفرد · الجمع");
    return `<div class="vc-forms"><span>${lab}</span><b dir="ltr" lang="en">${esc(w.forms)}</b></div>`;
  }
  const sayBtns = (w, L) => `<button class="vc-say" data-say="${esc(w.w)}" title="${L("Listen", "استمع")}" aria-label="${L("Listen", "استمع")}: ${esc(w.w)}">🔊</button><button class="vc-say" data-say="${esc(w.w)}" data-slow="1" title="${L("Listen slowly", "استمع ببطء")}" aria-label="${L("Listen slowly", "استمع ببطء")}: ${esc(w.w)}">🐢</button>`;
  const exHTML = (w, L) => `<div class="vc-ex">
      <div class="vc-ex-en" dir="ltr" lang="en">${hl(w)} <button class="vc-say sm" data-say="${esc(w.ex)}" title="${L("Listen to the sentence", "استمع للجملة")}" aria-label="${L("Listen to the sentence", "استمع للجملة")}">🔊</button></div>
      <div class="vc-ex-ar" dir="rtl" lang="ar">${esc(w.exAr)}</div>
    </div>`;
  const defHTML = (w, L) => `<div class="vc-def" dir="ltr" lang="en"><span>${L("In simple English", "الشرح بالإنجليزي البسيط")}</span>${esc(w.def)}</div>`;
  const posTxt = w => { const P = V.pos[w.pos] || ["", ""]; return `${P[0]} · ${P[1]}`; };

  function cardHTML(w, AR) {
    const L = (e, a) => AR ? a : e;
    const s = status(w.id), c = CAT[w.cat];
    const ST = { new: L("New", "جديدة"), learning: L("Learning", "أتعلّمها"), known: L("Known", "حفظتها") };
    const ls = w.lessons.slice().sort((a, b) => b.n - a.n);
    const chips = ls.slice(0, 3).map(x => `<button class="vc-lchip" data-lesson="${x.l.slug}" title="${esc(x.l.t[AR ? 1 : 0])}">${esc(x.l.id)}</button>`).join("");
    return `<article class="vc-card is-${s}" data-id="${esc(w.id)}" style="--vc:${c.c}">
      <div class="vc-top">
        <div class="vc-word" dir="ltr"><b lang="en">${esc(w.w)}</b>${sayBtns(w, L)}</div>
        <span class="vc-st">${ST[s]}</span>
      </div>
      <div class="vc-meta">
        <span class="vc-pron">${L("Say it:", "النطق:")} <b dir="rtl" lang="ar">${esc(w.say)}</b></span>
        <span class="vc-pos">${esc(posTxt(w))}</span>
        <span class="vc-cat"><i></i>${esc(c.t[AR ? 1 : 0])}</span>
      </div>
      <div class="vc-ar" dir="rtl" lang="ar">${esc(w.ar)}</div>
      ${defHTML(w, L)}
      ${exHTML(w, L)}
      ${formsHTML(w, L)}
      <div class="vc-foot">
        <div class="vc-seen">${ls.length
        ? `${L("In the course", "في الكورس")}: <b dir="ltr">${w.freq}×</b> ${chips}${ls.length > 3 ? `<span dir="ltr">+${ls.length - 3}</span>` : ""}`
        : L("General English word", "كلمة إنجليزية عامة")}</div>
        <div class="vc-act">
          <button data-set="learning" class="${s === "learning" ? "on" : ""}" aria-pressed="${s === "learning"}">${L("Learning", "أتعلّمها")}</button>
          <button data-set="known" class="ok ${s === "known" ? "on" : ""}" aria-pressed="${s === "known"}">✓ ${L("I know it", "حفظتها")}</button>
        </div>
      </div>
    </article>`;
  }

  // Clicks shared by the vocabulary page and the lesson "Words" tab. Returns true when handled.
  function common(e, AR, after) {
    const say = e.target.closest("[data-say]");
    if (say) { speak(say.dataset.say, say.dataset.slow === "1"); return true; }
    const lc = e.target.closest("[data-lesson]");
    if (lc) { location.hash = lc.dataset.lesson; return true; }
    const nav = e.target.closest("[data-nav]");
    if (nav) { location.hash = nav.dataset.nav; return true; }
    const set = e.target.closest("[data-set]");
    if (set) {
      const card = set.closest(".vc-card"), id = card.dataset.id;
      setStatus(id, status(id) === set.dataset.set ? "new" : set.dataset.set);
      const tmp = document.createElement("div");
      tmp.innerHTML = cardHTML(BY_ID[id], AR);
      card.replaceWith(tmp.firstElementChild);
      if (after) after();
      return true;
    }
    const hid = e.target.closest(".vc-hide .vc-ar, .vc-hide .vc-ex-ar");
    if (hid) { hid.classList.toggle("show"); return true; }
    return false;
  }

  const empty = (h, p, btns) => `<div class="vc-empty"><h3>${h}</h3><p>${p}</p>${btns ? `<div class="vc-empty-btns">${btns}</div>` : ""}</div>`;

  // ---------- page state (survives route changes while the app is open) ----------
  const S = { mode: null, cat: "all", st: "all", q: "", sort: "freq", hide: false, dir: "en", auto: true, lesson: null };
  let FC = null, QZ = null;

  window.renderVocabView = function (page, ctx) {
    const AR = ctx.ui === "ar", L = (e, a) => AR ? a : e;
    load(ctx.store);
    ensureIndex(ctx.flat);
    if (S.mode == null) {
      S.mode = ctx.store.get("aie-vocab-mode", "list");
      S.dir = ctx.store.get("aie-vocab-dir", "en");
      S.auto = ctx.store.get("aie-vocab-auto", true);
    }
    if (["list", "cards", "quiz"].indexOf(S.mode) < 0) S.mode = "list";
    if (ctx.mode && ["list", "cards", "quiz"].indexOf(ctx.mode) >= 0) S.mode = ctx.mode;
    S.lesson = ctx.lessonSlug ? (ctx.flat.find(l => l.slug === ctx.lessonSlug) || null) : null;
    if (S.lesson && S.cat !== "all" && !WORDS.some(w => w.cat === S.cat && inLesson(w, S.lesson))) S.cat = "all";
    FC = null; QZ = null;

    page.innerHTML = `<div class="vc-page" id="vcPage">
      <section class="vc-hero">
        <div>
          <div class="eyebrow">🔤 ${L("English for AI engineers", "إنجليزي مهندس الذكاء الاصطناعي")}</div>
          <h2>${L("Learn the course words in English", "تعلّم كلمات الكورس بالإنجليزي")}</h2>
          <p class="vc-desc">${L("Every English word and term you meet in the lessons, most-used first. Each word has audio 🔊, its pronunciation in Arabic letters, the Arabic meaning, a simple English definition and an example sentence. Memorize them with flashcards, then test yourself.",
      "كل الكلمات والمصطلحات الإنجليزية التي تقابلها في الدروس، مرتبة من الأكثر استخدامًا. لكل كلمة: صوتها 🔊، نطقها بالحروف العربية، معناها بالعربي، شرح بإنجليزي بسيط، وجملة مثال. احفظها بالبطاقات ثم اختبر نفسك.")}</p>
          <div class="vc-keys"><span>${L("Pronunciation letters:", "حروف النطق:")}</span><span>پ = <b>P</b></span><span>ڤ = <b>V</b></span><span>گ = <b>G</b></span><span>چ = <b>CH</b></span></div>
          <p class="vc-tip">💡 ${L("One flashcard session a day (15 cards, about 5 minutes) is enough to learn all the words in a few weeks. Words you know come back after 1, 3, 7… days so they stay in memory.",
        "جلسة بطاقات واحدة يوميًا (15 بطاقة، حوالي 5 دقائق) تكفي لتحفظ كل الكلمات خلال أسابيع. الكلمة التي تعرفها ترجع لك بعد 1، 3، 7… أيام حتى تثبت في ذاكرتك.")}</p>
          ${canSpeak() ? "" : `<p class="vc-tip warn">⚠️ ${L("Your browser has no speech voice, so 🔊 will be silent. Try Chrome or Edge.", "متصفحك لا يدعم النطق الصوتي، لذلك زر 🔊 لن يعمل. جرّب Chrome أو Edge.")}</p>`}
        </div>
        <div class="vc-stats" id="vcStats"></div>
      </section>
      <div class="vc-modes" id="vcModes" role="tablist"></div>
      <div class="vc-filters">
        ${S.lesson ? `<div class="vc-lfil"><span>📘 ${L("Only words from lesson", "كلمات الدرس فقط")} <b>${esc(S.lesson.id)} · ${esc(S.lesson.t[AR ? 1 : 0])}</b></span><button class="btn" data-nav="vocab">✕ ${L("Show all words", "اعرض كل الكلمات")}</button></div>` : ""}
        <div class="vc-frow">
          <input id="vcQ" type="search" value="${esc(S.q)}" placeholder="${L("Search in English or Arabic…", "ابحث بالإنجليزي أو بالعربي…")}" aria-label="${L("Search words", "ابحث في الكلمات")}">
          <select id="vcSort" aria-label="${L("Sort", "الترتيب")}">
            <option value="freq" ${S.sort === "freq" ? "selected" : ""}>${L("Most used first", "الأكثر استخدامًا أولًا")}</option>
            <option value="cat" ${S.sort === "cat" ? "selected" : ""}>${L("By topic", "حسب الموضوع")}</option>
            <option value="az" ${S.sort === "az" ? "selected" : ""}>A → Z</option>
          </select>
          <label class="vc-toggle vc-hide-opt"><input type="checkbox" id="vcHide" ${S.hide ? "checked" : ""}> ${L("Hide Arabic (test yourself)", "إخفاء العربي (اختبر نفسك)")}</label>
        </div>
        <div class="vc-frow"><span class="vc-flab">${L("Topic", "الموضوع")}</span><div class="vc-pills" id="vcCats"></div></div>
        <div class="vc-frow"><span class="vc-flab">${L("Status", "الحالة")}</span><div class="vc-pills" id="vcSt"></div></div>
      </div>
      <div id="vcBody"></div>
    </div>`;

    const root = page.querySelector("#vcPage");
    const $ = s => root.querySelector(s);

    function pool(ignoreStatus) {
      const q = S.q.trim().toLowerCase();
      const ws = WORDS.filter(w => (S.cat === "all" || w.cat === S.cat)
        && (!S.lesson || inLesson(w, S.lesson))
        && (ignoreStatus || S.st === "all" || status(w.id) === S.st)
        && (!q || w.w.toLowerCase().includes(q) || w.ar.includes(q) || w.say.includes(q)));
      if (S.sort === "az") ws.sort((a, b) => a.w.localeCompare(b.w, "en", { sensitivity: "base" }));
      else if (S.sort === "cat") ws.sort((a, b) => a.ord - b.ord);
      else ws.sort((a, b) => (S.lesson ? inLesson(b, S.lesson) - inLesson(a, S.lesson) : 0) || (b.freq - a.freq) || (a.ord - b.ord));
      return ws;
    }

    function stats() {
      const c = counts();
      $("#vcStats").innerHTML = `
        <small>${L("Words you know", "الكلمات التي حفظتها")}</small>
        <b class="big" dir="ltr">${c.known}<span> / ${c.total}</span></b>
        <div class="vc-sbar" title="${L("Known / learning", "محفوظة / أتعلّمها")}"><i class="k" style="width:${c.known / c.total * 100}%"></i><i class="l" style="width:${c.learning / c.total * 100}%"></i></div>
        <div class="vc-facts">
          <div><b>${c.fresh}</b><span>${L("New", "جديدة")}</span></div>
          <div><b>${c.learning}</b><span>${L("Learning", "أتعلّمها")}</span></div>
          <div><b>${c.known}</b><span>${L("Known", "حفظتها")}</span></div>
        </div>
        <div class="vc-due">${c.due ? L(`🔁 ${c.due} words are due for review`, `🔁 ${c.due} كلمة مستحقة للمراجعة الآن`) : L("✓ No reviews due right now", "✓ لا توجد مراجعة مستحقة الآن")}</div>`;
      if (ctx.onChange) ctx.onChange();
      $("#vcModes").innerHTML = [
        ["list", "📋", L("Word list", "قائمة الكلمات")],
        ["cards", "🃏", L("Flashcards", "البطاقات (احفظ)"), c.due],
        ["quiz", "🎯", L("Quiz", "اختبر نفسك")]
      ].map(([id, ic, t, n]) => `<button role="tab" aria-selected="${S.mode === id}" data-mode="${id}" class="${S.mode === id ? "on" : ""}">${ic} ${t}${n ? ` <span class="badge">${n}</span>` : ""}</button>`).join("");
    }

    function pills() {
      const base = WORDS.filter(w => !S.lesson || inLesson(w, S.lesson));
      const cats = [{ id: "all", t: ["All", "الكل"], i: "" }].concat(V.cats);
      $("#vcCats").innerHTML = cats.map(c => {
        const n = c.id === "all" ? base.length : base.filter(w => w.cat === c.id).length;
        return n || c.id === "all" ? `<button data-cat="${c.id}" class="${S.cat === c.id ? "on" : ""}">${c.i ? `<i style="background:${c.c}"></i>` : ""}${esc(c.t[AR ? 1 : 0])} <em>${n}</em></button>` : "";
      }).join("");
      const inCat = base.filter(w => S.cat === "all" || w.cat === S.cat);
      $("#vcSt").innerHTML = [["all", L("All", "الكل")], ["new", L("New", "جديدة")], ["learning", L("Learning", "أتعلّمها")], ["known", L("Known", "حفظتها")]]
        .map(([id, t]) => `<button data-vst="${id}" class="${S.st === id ? "on" : ""}">${t} <em>${id === "all" ? inCat.length : inCat.filter(w => status(w.id) === id).length}</em></button>`).join("");
    }

    function body() {
      root.className = "vc-page vc-m-" + S.mode;
      const b = $("#vcBody");
      b.className = S.hide ? "vc-hide" : "";
      if (S.mode === "cards") cards({});
      else if (S.mode === "quiz") quiz();
      else list(b);
    }

    // ----- list -----
    function list(b) {
      const ws = pool();
      const note = S.sort === "az" ? "A → Z" : S.sort === "cat" ? L("by topic", "حسب الموضوع") : S.lesson ? L("most used in this lesson first", "الأكثر تكرارًا في هذا الدرس أولًا") : L("most used in the course first", "الأكثر استخدامًا في الكورس أولًا");
      b.innerHTML = ws.length
        ? `<p class="vc-count">${L(`${ws.length} words`, `${ws.length} كلمة`)} · ${note}${S.hide ? ` · ${L("tap a blurred meaning to show it", "اضغط على المعنى المخفي لإظهاره")}` : ""}</p><div class="vc-grid">${ws.map(w => cardHTML(w, AR)).join("")}</div>`
        : empty(L("No words match", "لا توجد كلمات مطابقة"), L("Try another filter or search word.", "جرّب فلترًا آخر أو كلمة بحث أخرى."));
    }

    // ----- flashcards -----
    function cards(opt) {
      const pl = opt.list || pool();
      let q;
      if (opt.list) q = shuffle(opt.list.slice());
      else if (opt.practice) q = shuffle(pl.slice()).slice(0, SESSION);
      else {
        const now = Date.now();
        const due = pl.filter(w => prog[w.id] && prog[w.id].d <= now).sort((a, b) => prog[a.id].d - prog[b.id].d).slice(0, SESSION);
        q = due.concat(pl.filter(w => !prog[w.id]).slice(0, SESSION - due.length));
      }
      FC = { q, ix: 0, rev: false, n: q.length, right: 0, seen: new Set(), missed: new Set(), poolSize: pl.length };
      drawCard();
    }

    function drawCard() {
      const b = $("#vcBody");
      if (!FC.q.length) {
        b.innerHTML = FC.poolSize
          ? empty("🎉 " + L("All caught up!", "ممتاز! لا توجد كلمات مستحقة الآن"),
            L("You reviewed everything that is due and there are no new words in this filter. Come back tomorrow, or practice any words now.",
              "راجعت كل الكلمات المستحقة ولا توجد كلمات جديدة في هذا الفلتر. ارجع غدًا للمراجعة، أو تدرّب الآن على أي كلمات."),
            `<button class="btn pri" data-fc="practice">${L("Practice anyway", "تدرّب على أي حال")}</button>`)
          : empty(L("No words match", "لا توجد كلمات مطابقة"), L("Try another filter or search word.", "جرّب فلترًا آخر أو كلمة بحث أخرى."));
        return;
      }
      if (FC.ix >= FC.q.length) {
        const missed = [...FC.missed].map(id => BY_ID[id]);
        b.innerHTML = `<div class="vc-empty">
          <div class="vc-big">🎉</div>
          <h3>${L("Session complete!", "انتهت الجلسة!")}</h3>
          <p>${L(`You knew ${FC.right} of ${FC.n} words on the first try.`, `عرفت ${FC.right} من ${FC.n} كلمة من أول مرة.`)} ${L("They will come back in a few days to lock them in.", "سترجع لك بعد أيام حتى تثبت في ذاكرتك.")}</p>
          ${missed.length ? `<p class="vc-sub">${L("Words that need more practice:", "كلمات تحتاج تدريبًا أكثر:")}</p><div class="vc-missed">${missed.map(w => `<span><button class="vc-say sm" data-say="${esc(w.w)}" aria-label="${L("Listen", "استمع")}">🔊</button><b dir="ltr" lang="en">${esc(w.w)}</b><em dir="rtl">${esc(short(w.ar))}</em></span>`).join("")}</div>` : ""}
          <div class="vc-empty-btns"><button class="btn pri" data-fc="new">${L("Next session", "جلسة جديدة")}</button><button class="btn" data-fc="practice">${L("Practice random words", "تدرّب على كلمات عشوائية")}</button></div>
        </div>`;
        return;
      }
      const w = FC.q[FC.ix], c = CAT[w.cat], s = status(w.id);
      const ST = { new: L("New word", "كلمة جديدة"), learning: L("Review", "مراجعة"), known: L("Review", "مراجعة") };
      const front = S.dir === "en"
        ? `<div class="fc-word" dir="ltr" lang="en">${esc(w.w)}</div>
           <div class="fc-sub">${sayBtns(w, L)}<span class="vc-pron">${L("Say it:", "النطق:")} <b dir="rtl" lang="ar">${esc(w.say)}</b></span><span class="vc-pos">${esc(posTxt(w))}</span></div>
           ${FC.rev ? "" : `<p class="fc-hint">${L("What does it mean? Think first, then show the answer.", "ما معناها؟ فكّر أولًا، ثم اعرض الإجابة.")}</p>`}`
        : `<div class="fc-q-ar" dir="rtl" lang="ar">${esc(w.ar)}</div>
           <div class="fc-sub"><span class="vc-pos">${esc(posTxt(w))}</span></div>
           ${FC.rev ? "" : `<p class="fc-hint">${L("Say the English word out loud, then show the answer.", "قل الكلمة بالإنجليزي بصوت عالٍ، ثم اعرض الإجابة.")}</p>`}`;
      const back = !FC.rev ? "" : `<div class="fc-back">
          ${S.dir === "en"
          ? `<div class="vc-ar" dir="rtl" lang="ar">${esc(w.ar)}</div>`
          : `<div class="fc-ans"><span class="vc-word" dir="ltr"><b lang="en">${esc(w.w)}</b>${sayBtns(w, L)}</span><span class="vc-pron">${L("Say it:", "النطق:")} <b dir="rtl" lang="ar">${esc(w.say)}</b></span></div>`}
          ${defHTML(w, L)}
          ${exHTML(w, L)}
          ${formsHTML(w, L)}
        </div>`;
      b.innerHTML = `<div class="fc">
        <div class="fc-opts">
          <div class="vc-seg" role="group" aria-label="${L("Card direction", "اتجاه البطاقة")}">
            <button data-dir="en" class="${S.dir === "en" ? "on" : ""}">${L("Show the English word", "اعرض الكلمة الإنجليزية")}</button>
            <button data-dir="ar" class="${S.dir === "ar" ? "on" : ""}">${L("Show the Arabic meaning", "اعرض المعنى العربي")}</button>
          </div>
          <label class="vc-toggle"><input type="checkbox" id="fcAuto" ${S.auto ? "checked" : ""}> 🔊 ${L("Play sound automatically", "تشغيل الصوت تلقائيًا")}</label>
        </div>
        <div class="fc-prog"><span>${L(`${FC.q.length - FC.ix} cards left`, `متبقي ${FC.q.length - FC.ix} بطاقة`)}</span><div class="bar"><i style="width:${FC.seen.size / FC.n * 100}%"></i></div><span dir="ltr">${FC.seen.size} / ${FC.n}</span></div>
        <div class="fc-card ${FC.rev ? "rev" : ""}" style="--vc:${c.c}">
          <span class="fc-cat"><i></i>${esc(c.t[AR ? 1 : 0])} · ${ST[s]}</span>
          ${front}${back}
        </div>
        <div class="fc-btns">${FC.rev
          ? `<button class="btn again" data-fc="again">✗ ${L("I didn't know it", "ما عرفتها")} <kbd>1</kbd></button><button class="btn got" data-fc="got">✓ ${L("I knew it", "عرفتها")} <kbd>2</kbd></button>`
          : `<button class="btn pri full" data-fc="show">${L("Show answer", "اعرض الإجابة")} <kbd>Space</kbd></button>`}</div>
        <p class="fc-keys">${L("Keyboard: Space = show answer · 1 = didn't know · 2 = knew it · S = sound", "لوحة المفاتيح: المسافة = اعرض الإجابة · 1 = ما عرفتها · 2 = عرفتها · S = الصوت")}</p>
      </div>`;
      if (S.auto && ((S.dir === "en" && !FC.rev) || (S.dir === "ar" && FC.rev))) speak(w.w);
    }

    function answer(ok) {
      const w = FC.q[FC.ix];
      if (!FC.seen.has(w.id)) { FC.seen.add(w.id); if (ok) FC.right++; }
      grade(w.id, ok);
      if (!ok) { FC.missed.add(w.id); FC.q.splice(Math.min(FC.ix + 4, FC.q.length), 0, w); }
      FC.ix++; FC.rev = false;
      drawCard(); stats(); pills();
    }

    // ----- quiz -----
    function makeQ(w, t) {
      if (t === 3 && !w.ex.match(w.rx)) t = 0;
      const others = shuffle(WORDS.filter(x => x !== w && x.ar !== w.ar && x.w.toLowerCase() !== w.w.toLowerCase()));
      const distract = others.filter(x => x.cat === w.cat).concat(others.filter(x => x.cat !== w.cat)).slice(0, 3);
      const opts = shuffle([w].concat(distract));
      return { w, t, opts, ans: opts.indexOf(w), pick: -1 };
    }
    function quiz(words) {
      const b = $("#vcBody");
      const pl = words || pool();
      if (pl.length < 4) {
        QZ = null;
        b.innerHTML = empty(L("Not enough words", "الكلمات غير كافية"), L("Choose a filter with at least 4 words to start the quiz.", "اختر فلترًا فيه 4 كلمات على الأقل لبدء الاختبار."));
        return;
      }
      const types = shuffle((canSpeak() ? [0, 1, 2, 3] : [0, 1, 3]).flatMap(t => [t, t, t]));
      QZ = { qs: shuffle(pl.slice()).slice(0, QUIZ_N).map((w, i) => makeQ(w, types[i % types.length])), ix: 0, score: 0, wrong: [] };
      drawQ();
    }
    function drawQ() {
      const b = $("#vcBody");
      const n = QZ.qs.length;
      if (QZ.ix >= n) {
        const pct = Math.round(QZ.score / n * 100);
        const msg = pct >= 90 ? L("Excellent! 🌟", "ممتاز! 🌟") : pct >= 70 ? L("Very good! 👏", "جيد جدًا! 👏") : pct >= 50 ? L("Good start, keep practicing.", "بداية جيدة، استمر في التدريب.") : L("Keep going! Review these words with flashcards.", "لا تستسلم! راجع هذه الكلمات بالبطاقات.");
        b.innerHTML = `<div class="vc-empty">
          <div class="qz-score" dir="ltr">${QZ.score} / ${n}</div>
          <h3>${msg}</h3>
          ${QZ.wrong.length
            ? `<p class="vc-sub">${L("Words to review (added to your Learning list):", "كلمات تحتاج مراجعة (أُضيفت لقائمة «أتعلّمها»):")}</p><div class="vc-missed">${QZ.wrong.map(w => `<span><button class="vc-say sm" data-say="${esc(w.w)}" aria-label="${L("Listen", "استمع")}">🔊</button><b dir="ltr" lang="en">${esc(w.w)}</b><em dir="rtl">${esc(short(w.ar))}</em></span>`).join("")}</div>`
            : `<p>${L("No mistakes at all!", "بدون أي خطأ!")}</p>`}
          <div class="vc-empty-btns"><button class="btn pri" data-qz="again">${L("New quiz", "اختبار جديد")}</button>${QZ.wrong.length ? `<button class="btn" data-qz="study">${L("Study my mistakes", "راجع أخطائي بالبطاقات")}</button>` : ""}</div>
        </div>`;
        return;
      }
      const q = QZ.qs[QZ.ix], w = q.w, done = q.pick >= 0;
      const LBL = [
        L("What does this word mean?", "ما معنى هذه الكلمة؟"),
        L("Which English word has this meaning?", "ما الكلمة الإنجليزية التي تحمل هذا المعنى؟"),
        L("Listen, then choose the word you hear", "استمع، ثم اختر الكلمة التي سمعتها"),
        L("Complete the sentence", "أكمل الجملة بالكلمة المناسبة")
      ];
      let stem;
      if (q.t === 0) stem = `<div class="fc-word" dir="ltr" lang="en">${esc(w.w)}</div><div class="fc-sub">${sayBtns(w, L)}</div>`;
      else if (q.t === 1) stem = `<div class="fc-q-ar" dir="rtl" lang="ar">${esc(w.ar)}</div>`;
      else if (q.t === 2) stem = `<div class="qz-listen"><button class="qz-play" data-say="${esc(w.w)}">🔊 ${L("Play", "تشغيل")}</button><button class="qz-play" data-say="${esc(w.w)}" data-slow="1">🐢 ${L("Slowly", "ببطء")}</button></div>`;
      else stem = `<p class="qz-sent" dir="ltr" lang="en">${esc(w.ex).replace(w.rx, m => `<span class="qz-blank">${done ? m : ""}</span>`)}</p><p class="qz-sent-ar" dir="rtl" lang="ar">${esc(w.exAr)}</p>`;
      const optsEn = q.t !== 0;
      const opts = q.opts.map((o, i) => {
        const cls = !done ? "" : i === q.ans ? "ok" : i === q.pick ? "bad" : "dim";
        return `<button class="qz-opt ${cls}" data-opt="${i}" ${done ? "disabled" : ""}><kbd>${i + 1}</kbd><span ${optsEn ? 'dir="ltr" lang="en" class="en-o"' : 'dir="rtl" lang="ar" class="ar-o"'}>${esc(optsEn ? o.w : o.ar)}</span></button>`;
      }).join("");
      const right = q.pick === q.ans;
      const fb = !done ? "" : `<div class="qz-fb ${right ? "good" : "bad"}">
          <b>${right ? L("✓ Correct!", "✓ إجابة صحيحة!") : L("✗ Not quite. The answer is:", "✗ ليست صحيحة. الإجابة:")}</b>
          <div class="qz-fb-w"><span class="vc-word" dir="ltr"><b lang="en">${esc(w.w)}</b>${sayBtns(w, L)}</span><span class="vc-pron">${L("Say it:", "النطق:")} <b dir="rtl" lang="ar">${esc(w.say)}</b></span></div>
          <div class="qz-fb-ar" dir="rtl" lang="ar">${esc(w.ar)}</div>
        </div>
        <button class="btn pri qz-next" data-qz="next">${QZ.ix + 1 < n ? L("Next question →", "السؤال التالي ←") : L("See my result", "اعرض نتيجتي")} <kbd>Enter</kbd></button>`;
      b.innerHTML = `<div class="qz">
        <div class="fc-prog"><span>${L(`Question ${QZ.ix + 1} of ${n}`, `السؤال ${QZ.ix + 1} من ${n}`)}</span><div class="bar"><i style="width:${(QZ.ix + (done ? 1 : 0)) / n * 100}%"></i></div><span dir="ltr">✓ ${QZ.score}</span></div>
        <div class="qz-card" style="--vc:${CAT[w.cat].c}">
          <div class="qz-label">${LBL[q.t]}</div>
          <div class="qz-stem">${stem}</div>
          <div class="qz-opts">${opts}</div>
          ${fb}
        </div>
        <p class="fc-keys">${L("Keyboard: 1–4 to answer · Enter = next", "لوحة المفاتيح: 1–4 للإجابة · Enter = التالي")}</p>
      </div>`;
      if (q.t === 2 && !done) speak(w.w);
    }
    function pickOpt(i) {
      const q = QZ.qs[QZ.ix];
      if (q.pick >= 0) return;
      q.pick = i;
      if (i === q.ans) QZ.score++;
      else { QZ.wrong.push(q.w); setStatus(q.w.id, "learning"); }
      drawQ(); stats(); pills();
      speak(q.w.w);
    }

    // ----- events -----
    root.addEventListener("click", e => {
      if (common(e, AR, () => { stats(); pills(); })) return;
      const m = e.target.closest("[data-mode]");
      if (m) {
        S.mode = m.dataset.mode; ctx.store.set("aie-vocab-mode", S.mode);
        if (location.hash.split("/").length > 2) history.replaceState(null, "", "#" + location.hash.slice(1).split("/").slice(0, 2).join("/"));
        stats(); body(); focusMode(); return;
      }
      const c = e.target.closest("[data-cat]");
      if (c) { S.cat = c.dataset.cat; pills(); body(); return; }
      const s = e.target.closest("[data-vst]");
      if (s) { S.st = s.dataset.vst; pills(); body(); return; }
      const d = e.target.closest("[data-dir]");
      if (d && FC) { S.dir = d.dataset.dir; ctx.store.set("aie-vocab-dir", S.dir); FC.rev = false; drawCard(); return; }
      const f = e.target.closest("[data-fc]");
      if (f && FC) {
        const a = f.dataset.fc;
        if (a === "show") { FC.rev = true; drawCard(); }
        else if (a === "again" || a === "got") answer(a === "got");
        else cards({ practice: a === "practice" });
        return;
      }
      if (FC && S.mode === "cards" && !FC.rev && FC.ix < FC.q.length && e.target.closest(".fc-card")) { FC.rev = true; drawCard(); return; }
      const o = e.target.closest("[data-opt]");
      if (o && QZ) { pickOpt(+o.dataset.opt); return; }
      const z = e.target.closest("[data-qz]");
      if (z && QZ) {
        const a = z.dataset.qz;
        if (a === "next") { QZ.ix++; drawQ(); }
        else if (a === "again") quiz();
        else if (a === "study") { const ws = QZ.wrong.slice(); S.mode = "cards"; root.className = "vc-page vc-m-cards"; stats(); cards({ list: ws }); focusMode(); }
      }
    });
    root.addEventListener("change", e => {
      if (e.target.id === "vcHide") { S.hide = e.target.checked; $("#vcBody").classList.toggle("vc-hide", S.hide); if (S.mode === "list") body(); }
      else if (e.target.id === "fcAuto") { S.auto = e.target.checked; ctx.store.set("aie-vocab-auto", S.auto); }
      else if (e.target.id === "vcSort") { S.sort = e.target.value; body(); }
    });
    $("#vcQ").addEventListener("input", e => { S.q = e.target.value; body(); });

    const key = e => {
      if (/INPUT|SELECT|TEXTAREA/.test(e.target.tagName) || e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (S.mode === "cards" && FC && FC.ix < FC.q.length) {
        if ((k === " " || k === "enter") && !FC.rev) { e.preventDefault(); FC.rev = true; drawCard(); }
        else if (FC.rev && k === "1") answer(false);
        else if (FC.rev && k === "2") answer(true);
        else if (k === "s" && (S.dir === "en" || FC.rev)) speak(FC.q[FC.ix].w);
      } else if (S.mode === "quiz" && QZ && QZ.ix < QZ.qs.length) {
        const q = QZ.qs[QZ.ix];
        if (q.pick < 0 && /^[1-4]$/.test(k) && +k <= q.opts.length) pickOpt(+k - 1);
        else if (q.pick >= 0 && (k === "enter" || k === " ")) { e.preventDefault(); QZ.ix++; drawQ(); }
      }
    };
    document.addEventListener("keydown", key);
    ctx.registerCleanup(() => document.removeEventListener("keydown", key));

    // Flashcards and quiz sit below the intro, so bring them into view (after the router resets the scroll).
    function focusMode() {
      if (S.mode === "list") return;
      requestAnimationFrame(() => { const m = $("#vcModes"); if (m) m.scrollIntoView({ block: "start" }); });
    }

    stats(); pills(); body(); focusMode();
  };

  // ---------- lesson tab: the words that appear in one lesson ----------
  window.renderLessonWords = function (p, l, ctx) {
    const AR = ctx.ui === "ar", L = (e, a) => AR ? a : e;
    load(ctx.store);
    ensureIndex(ctx.flat);
    // Linking words show up in almost every lesson, so the tab keeps to the words that carry the lesson's meaning.
    const ws = WORDS.filter(w => w.cat !== "link" && inLesson(w, l)).sort((a, b) => (inLesson(b, l) - inLesson(a, l)) || (b.freq - a.freq));
    const known = ws.filter(w => status(w.id) === "known").length;
    p.innerHTML = `<div class="vc-page vc-lesson">
      <div class="vc-lhead">
        <div>
          <h3>🔤 ${L("English words in this lesson", "الكلمات الإنجليزية في هذا الدرس")} <span dir="ltr">(${ws.length})</span></h3>
          <p>${L(`Learn them before or after you study the lesson. Tap 🔊 to hear each word. You know ${known} of ${ws.length}.`, `تعلّمها قبل الدرس أو بعده. اضغط 🔊 لتسمع نطق كل كلمة. حفظت ${known} من ${ws.length}.`)}</p>
        </div>
        <div class="vc-lbtns">
          ${ws.length ? `<button class="btn pri" data-nav="vocab/${l.slug}/cards">🃏 ${L("Practice these words", "تدرّب عليها بالبطاقات")}</button>` : ""}
          <button class="btn" data-nav="vocab">${L("All course words", "كل كلمات الكورس")}</button>
        </div>
      </div>
      ${ws.length ? `<div class="vc-grid">${ws.map(w => cardHTML(w, AR)).join("")}</div>` : empty(L("No listed words in this lesson yet", "لا توجد كلمات مسجّلة لهذا الدرس بعد"), L("Open the full word list to keep learning.", "افتح قائمة الكلمات الكاملة لتكمل التعلّم."))}
    </div>`;
    p.firstElementChild.addEventListener("click", e => { common(e, AR, ctx.onChange); });
  };

  window.VocabStats = st => { load(st); return counts(); };
})();
