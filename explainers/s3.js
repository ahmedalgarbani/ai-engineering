// Motion explainers — Stage 3: RAG in depth, LangGraph workflows, agents & tools, MCP, memory, sandboxes
(function () {
  const X = window.Explainer;
  const ringNodes = (s, pre, labels, cx, cy, r, colors, o) => labels.forEach((t, i) => {
    const a = (-90 + i * 360 / labels.length) * Math.PI / 180;
    s.box(pre + i, { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, label: t, size: 24, h: 56, color: (colors || [])[i] || "teal", fill: "bg" }, Object.assign({ at: 0.3 + i * 0.14 }, o));
  });

  // ------------------------------------------------------------------ 5.1 When does an app need RAG?
  X.lesson("5.1", [
    { sec: "ثلاثة أسئلة", say: "قبل أن تبني RAG، انظر إلى ثلاثة أسئلة حقيقية تصل لتطبيق دعم عملاء.", do: s => {
      s.callout("inb", { x: 800, y: 265, label: "Incoming Support Queries", icon: "inbox", color: "soft" }, { at: "0%" });
      s.box("q0", { x: 340, y: 440, w: 360, h: 112, label: "Order #812 status?", sub: "live structured fact", icon: "db", inline: true, size: 24, color: "blue" }, { at: "18%" });
      s.box("q1", { x: 800, y: 440, w: 360, h: 112, label: "2-page pricing FAQ", sub: "small static doc", icon: "doc", inline: true, size: 24, color: "teal" }, { at: "42%" });
      s.box("q2", { x: 1260, y: 440, w: 360, h: 112, label: "500 policy PDFs", sub: "large, changing library", icon: "docs", inline: true, size: 24, color: "gold" }, { at: "66%" });
      s.link("iq0", "inb", "q0", { color: "blue", pulse: true }, { at: "26%" });
      s.link("iq1", "inb", "q1", { color: "teal", pulse: true }, { at: "50%" });
      s.link("iq2", "inb", "q2", { color: "gold", pulse: true }, { at: "74%" });
    }},
    { sec: "فشل الحل الساذج", say: "الخطأ الأول هو افتراض أن كل سؤال يحتاج إلى RAG واحد شامل.", eq: "@T{one tool for all} @Rightarrow @R{failure}", do: s => {
      s.out(["inb", "iq*"], { at: "0%", dur: 0.35 });
      s.box("naive", { x: 800, y: 690, w: 420, h: 96, label: "Naive RAG for everything", icon: "alert", inline: true, size: 25, color: "red" }, { at: "15%" });
      s.link("nq0", "q0", "naive", { color: "red", dash: "6 6" }, { at: "32%" });
      s.link("nq1", "q1", "naive", { color: "red", dash: "6 6" }, { at: "45%" });
      s.link("nq2", "q2", "naive", { color: "gold", dash: "6 6" }, { at: "58%" });
      s.stream("q0", "naive", { at: "45%", span: 2.2, every: 0.7, color: "red" });
    }},
    { say: "فـ RAG قد يُرجع حالة طلب قديمة، ووضع 500 ملف في السياق يملأ النافذة ويرفع التكلفة.", do: s => {
      s.focus(["q0", "naive"], { at: "0%", zoom: 1.12, keep: ["q2"] });
      s.badge("b0", { x: 340, y: 580, text: "stale / wrong DB row ✗", color: "red", size: 21 }, { at: "20%" });
      s.mark("mx0", "q0", "x", { at: "30%" });
      s.badge("b2", { x: 1260, y: 580, text: "500 PDFs = context overflow ✗", color: "orange", size: 21 }, { at: "55%" });
      s.to("naive", { stroke: "orange", label: "wrong fit = bugs + cost" }, { at: "70%", dur: 0.5 });
    }},
    { sec: "قرار الهندسة", say: "لذلك نختار الآلية حسب نوع البيانات: SQL أم سياق مباشر أم RAG.", eq: "@T{data type} @Rightarrow @T{architecture}", do: s => {
      s.unfocus({ at: "0%", dur: 0.45 });
      s.out(["naive", "nq*", "b0", "b2", "mx0"], { at: "0%", dur: 0.35 });
      s.to(["q0", "q1", "q2"], { y: 315 }, { at: "15%", dur: 0.65 });
      s.box("bin0", { x: 340, y: 525, w: 340, h: 88, label: "Structured fact", sub: "orders · balances · rows", size: 25, color: "blue" }, { at: "38%" });
      s.box("bin1", { x: 800, y: 525, w: 340, h: 88, label: "Few short docs", sub: "fits cheaply in prompt", size: 25, color: "teal" }, { at: "54%" });
      s.box("bin2", { x: 1260, y: 525, w: 340, h: 88, label: "Large library", sub: "unstructured · updated", size: 25, color: "gold" }, { at: "70%" });
      s.link("ql0", "q0", "bin0", { color: "blue", pulse: true }, { at: "45%" });
      s.link("ql1", "q1", "bin1", { color: "teal", pulse: true }, { at: "60%" });
      s.link("ql2", "q2", "bin2", { color: "gold", pulse: true }, { at: "76%" });
    }},
    { say: "إن كانت حقيقة مهيكلة، مثل حالة طلب أو رصيد، فاستعلم قاعدة البيانات عبر SQL مباشرة.", eq: "@T{structured fact} @Rightarrow @B{SQL}", do: s => {
      s.focus(["q0", "bin0", "ql0"], { at: "0%", zoom: 1.18 });
      s.box("sql", { x: 340, y: 735, w: 350, h: 84, label: "SELECT status …", sub: "exact · real-time", font: "mono", size: 22, color: "blue", icon: "db", inline: true }, { at: "25%" });
      s.link("l0", "bin0", "sql", { color: "blue", pulse: true }, { at: "38%" });
      s.stream("q0", "sql", { at: "48%", span: 2.5, every: 0.65, color: "blue" });
      s.mark("ok0", "sql", "check", { at: "75%" });
    }},
    { say: "وإن كانت مستندات قليلة وقصيرة، فضعها مباشرة في الـ Prompt مع التخزين المؤقت.", eq: "@T{few docs} @Rightarrow @C{direct context}", do: s => {
      s.unfocus({ at: "0%", dur: 0.35 });
      s.focus(["q1", "bin1", "ql1"], { at: "15%", zoom: 1.18, keep: ["sql", "l0", "ok0"] });
      s.box("ctx", { x: 800, y: 735, w: 350, h: 84, label: "Put in prompt", sub: "simple · zero index ops", size: 24, color: "teal", icon: "docs", inline: true }, { at: "32%" });
      s.link("l1", "bin1", "ctx", { color: "teal", pulse: true }, { at: "44%" });
      s.stream("q1", "ctx", { at: "52%", span: 2.4, every: 0.65, color: "teal" });
      s.mark("ok1", "ctx", "check", { at: "78%" });
    }},
    { say: "أما مكتبة كبيرة ومتغيرة من السياسات، فهنا يأتي RAG لاسترجاع المقاطع مع ذكر المصادر.", eq: "@T{large library} @Rightarrow @Y{RAG + citations}", do: s => {
      s.unfocus({ at: "0%", dur: 0.35 });
      s.focus(["q2", "bin2", "ql2"], { at: "15%", zoom: 1.18, keep: ["sql", "l0", "ok0", "ctx", "l1", "ok1"] });
      s.box("rag", { x: 1260, y: 735, w: 350, h: 84, label: "Retrieve → Cite", sub: "fresh · grounded sources", size: 24, color: "gold", icon: "search", inline: true }, { at: "32%" });
      s.link("l2", "bin2", "rag", { color: "gold", pulse: true }, { at: "44%" });
      s.stream("q2", "rag", { at: "52%", span: 2.4, every: 0.65, color: "gold" });
      s.mark("ok2", "rag", "check", { at: "78%" });
    }},
    { sec: "سقف الجودة", say: "وتذكّر القاعدة الذهبية: جودة الإجابة لا يمكن أن تتجاوز جودة الاسترجاع أبدًا.", eq: "@T{answer quality} @le @T{retrieval quality}", do: s => {
      s.clear({ dur: 0.4 });
      s.bar("rq", { x: 540, y: 360, w: 620, v: 0.92, color: "teal", label: "retrieval", val: "92%", size: 30, h: 38 }, { at: "12%" });
      s.bar("aq", { x: 540, y: 470, w: 620, v: 0.88, color: "green", label: "answer", val: "88%", size: 30, h: 38 }, { at: "24%" });
      s.to("rq", { v: 0.38, color: "red", val: "38%" }, { at: "48%", dur: 1.1 });
      s.to("aq", { v: 0.34, color: "red", val: "34%" }, { at: "58%", dur: 1.1 });
      s.callout("ceil", { x: 800, y: 610, label: "Missing chunks → LLM can only guess", icon: "alert", color: "red" }, { at: "74%" });
    }},
    { say: "لذلك قِس المرحلتين منفصلتين: هل وصل المقطع الصحيح؟ وهل بقيت الإجابة وفيّة له؟", eq: "@C{recall@@k} @; + @; @G{faithfulness}", do: s => {
      s.out("ceil", { at: "0%", dur: 0.3 });
      s.to("rq", { v: 0.9, color: "teal", val: "90%" }, { at: "15%", dur: 0.8 });
      s.to("aq", { v: 0.87, color: "green", val: "87%" }, { at: "25%", dur: 0.8 });
      s.box("m1", { x: 520, y: 660, w: 400, h: 120, label: "recall@k", sub: "did top-k contain the right chunk?", icon: "search", inline: true, size: 28, color: "teal" }, { at: "35%" });
      s.box("m2", { x: 1080, y: 660, w: 400, h: 120, label: "faithfulness", sub: "is every claim backed by sources?", icon: "shieldok", inline: true, size: 28, color: "green" }, { at: "58%" });
      s.link("ml", "m1", "m2", { color: "gold", label: "measure both", pulse: true }, { at: "72%" });
    }},
    { sec: "الخطأ مقابل القاعدة", say: "خطأ شائع: تعديل الـ Prompt عشر مرات بينما المشكلة أن الاسترجاع لم يُحضر المقطع أصلًا.", do: s => {
      s.clear({ dur: 0.4 });
      s.versus("vs", "الخطأ الشائع", "قاعدة الإنتاج", { colors: ["red", "green"] }, { at: "0%" });
      s.col("bad", ["Tweak prompt v1 → v9", "Ignore retrieved chunks", "Still hallucinates ✗"], { x: 440, y: 545, size: 24, w: 480, icons: ["pencil", "eye", "x"], colors: ["orange", "red", "red"] }, { at: "25%", st: 0.25 });
      s.code("gd", { x: 1160, y: 545, size: 20, title: "debug_rag.py", lines: ["docs = retrieve(query, k=5)", "assert gold_id in docs  # 1. check recall", "ans = generate(query, docs)", "assert is_grounded(ans, docs)  # 2. faith"] }, { at: "45%", dur: 1.5 });
      s.to("gd", { hl: 1 }, { at: "72%", dur: 0.25 });
    }},
    { say: "افحص المخرجات المسترجعة أولًا؛ فإن غابت المعلومة عنها فأصلِح الاسترجاع قبل الـ Prompt.", do: s => {
      s.to("gd", { hl: 3 }, { at: "20%", dur: 0.25 });
      s.pulse("vsR", { at: "40%", color: "green" });
      s.badge("okg", { x: 1160, y: 745, text: "Inspect chunks before tuning prompts ✓", color: "green", size: 21 }, { at: "55%" });
    }},
    { sec: "الخلاصة", say: "الخلاصة: SQL للحقائق، والسياق للملفات القصيرة، وRAG للمكتبات الكبيرة مع قياس الاسترجاع.", eq: "@B{SQL} @; | @; @C{Context} @; | @; @Y{RAG} @quad (@T{answer} @le @T{retrieval})", do: s => {
      s.clear({ dur: 0.4 });
      s.chain("sum", ["SQL Query", "Direct Context", "RAG + Citations"], { y: 450, gap: 80, icons: ["db", "docs", "search"], subs: ["structured facts", "few short docs", "large changing library"], colors: ["blue", "teal", "gold"], w: 320, h: 165, size: 27 }, { at: "15%", st: 0.22 });
      s.callout("fin", { x: 800, y: 720, label: "Measure recall@k + faithfulness on real user questions", icon: "check", color: "green" }, { at: "62%" });
    }}
  ]);

  // ------------------------------------------------------------------ 5.2 Document Ingestion & Chunking
  X.lesson("5.2", [
    { sec: "مستند خام", say: "لنبدأ بمستند حقيقي من موقعك: صفحة سياسة الاسترداد مليئة بالحشو والتكرار.", do: s => {
      s.box("pg", { x: 800, y: 545, w: 620, h: 590, label: "", color: "soft", fill: "panel", r: 14 }, { at: "0%" });
      s.box("hd", { x: 800, y: 295, w: 560, h: 48, label: "NAV · Home · Pricing · Login · Cart", size: 19, color: "red", font: "ui" }, { at: "20%" });
      ["# Refund Policy", "Standard orders: full refund within 14 days.", "## Sale Exceptions", "Discounted sale items are non-refundable."].forEach((t, i) =>
        s.box("ln" + i, { x: 800, y: 385 + i * 86, w: 540, h: 60, label: t, size: 21, color: i % 2 ? "soft" : "gold", font: "ui" }, { at: 0.6 + i * 0.14 })
      );
      s.box("ft", { x: 800, y: 785, w: 560, h: 48, label: "© 2026 Store · Privacy · Cookie Banner", size: 19, color: "red", font: "ui" }, { at: "68%" });
    }},
    { sec: "فشل التقطيع الساذج", say: "لو قطّعت المستند عشوائيًا كل 200 حرف، ستتلوث المقاطع بالحشو وتنقطع الجملة المهمة.", eq: "@R{naive fixed split} @Rightarrow @R{broken meaning}", do: s => {
      s.focus(["hd", "ln3", "ft"], { at: "0%", zoom: 1.12, keep: ["pg"] });
      s.line("cut", { x1: 520, y1: 643, x2: 1080, y2: 643, color: "red", dash: "10 6", w: 4 }, { at: "28%" });
      s.badge("b1", { x: 1310, y: 295, text: "noise embedded ✗", color: "red", size: 21 }, { at: "45%" });
      s.badge("b2", { x: 1310, y: 643, text: "rule split in half ✗", color: "red", size: 21 }, { at: "68%" });
    }},
    { sec: "التنظيف والبنية", say: "الخطوة الأولى: نظّف المستند وأزِل الترويسات والتذييلات وقوائم التنقل تمامًا.", do: s => {
      s.unfocus({ at: "0%", dur: 0.35 });
      s.out(["cut", "b1", "b2"], { at: "0%", dur: 0.3 });
      s.out(["hd", "ft"], { at: "25%", how: "shrink", dur: 0.65 });
      s.to("pg", { stroke: "green", h: 440, y: 515 }, { at: "48%", dur: 0.7 });
      s.badge("cln", { x: 800, y: 785, text: "Clean signal only ✓", color: "green", size: 23 }, { at: "70%" });
    }},
    { say: "الخطوة الثانية: قسّم حسب البنية المنطقية، بحيث يبقى كل عنوان مع فقرته.", eq: "@T{split by} @; @Y{headings + paragraphs}", do: s => {
      s.out(["pg", "cln"], { at: "0%", dur: 0.35 });
      s.to(["ln0", "ln1"], { x: 440, w: 500 }, { at: "15%", dur: 0.75 });
      s.to(["ln2", "ln3"], { x: 1160, w: 500, y: v => v - 172 }, { at: "15%", dur: 0.75 });
      s.zone("c1", { x: 440, y: 428, w: 560, h: 245, label: "Chunk 1 · Refund Policy", color: "teal" }, { at: "48%" });
      s.zone("c2", { x: 1160, y: 428, w: 560, h: 245, label: "Chunk 2 · Sale Exceptions", color: "gold" }, { at: "62%" });
      s.callout("okst", { x: 800, y: 660, label: "Each chunk preserves one complete idea", icon: "check", color: "green" }, { at: "78%" });
    }},
    { sec: "التداخل الذكي", say: "وأضِف تداخلًا بسيطًا بين المقاطع، بنحو 60 Token لكل 400، حتى لا تضيع فكرة على الحدود.", eq: "@T{chunk} @approx @B{400}@T{ tokens}, @quad @T{overlap} @approx @Y{60}", do: s => {
      s.clear({ dur: 0.4 });
      s.box("ov0", { x: 460, y: 490, w: 400, h: 130, label: "Chunk 1\n(tokens 0–400)", size: 24, color: "blue", fop: 0.35 }, { at: "12%" });
      s.box("ov1", { x: 800, y: 490, w: 400, h: 130, label: "Chunk 2\n(tokens 340–740)", size: 24, color: "teal", fop: 0.35 }, { at: "34%" });
      s.box("ov2", { x: 1140, y: 490, w: 400, h: 130, label: "Chunk 3\n(tokens 680–1080)", size: 24, color: "purple", fop: 0.35 }, { at: "56%" });
      s.brace("br1", { x1: 600, x2: 660, y: 575, label: "60", color: "gold" }, { at: "68%" });
      s.brace("br2", { x1: 940, x2: 1000, y: 575, label: "60", color: "gold" }, { at: "76%" });
      s.callout("ovnote", { x: 800, y: 740, label: "Too tiny = lost context · Too huge = noisy retrieval", icon: "scale", color: "gold" }, { at: "80%" });
    }},
    { sec: "البيانات الوصفية", say: "ومع كل مقطع، خزّن بياناته الوصفية: المصدر والعنوان والقسم والتاريخ ومعرّف العميل.", eq: "@T{record} = (@T{text}, @; @Y{meta}, @; @G{tenant@_id})", do: s => {
      s.clear({ dur: 0.4 });
      s.code("meta", { x: 800, y: 530, size: 24, title: "chunk_record.json", lines: [
        "{",
        "  \"text\":      \"Discounted sale items are non-refundable.\",",
        "  \"source\":    \"refunds_2026.md\",",
        "  \"section\":   \"Sale Exceptions\",",
        "  \"updated\":   \"2026-05-02\",",
        "  \"tenant_id\": 42",
        "}"
      ] }, { at: "10%", dur: 1.8 });
      s.to("meta", { hl: 2 }, { at: "65%", dur: 0.25 });
      s.to("meta", { hl: 5 }, { at: "82%", dur: 0.25 });
    }},
    { say: "وبفضل هذه البيانات، تشير الإجابة إلى مصدرها الدقيق، ويمكن للمستخدم التحقق فورًا.", do: s => {
      s.to("meta", { x: 480, scale: 0.82, hl: 3 }, { at: "0%", dur: 0.65 });
      s.box("llm", { x: 930, y: 530, w: 170, h: 120, label: "LLM", icon: "brain", color: "purple", size: 26 }, { at: "25%" });
      s.bubble("ans", { text: "Sale items are non-refundable. [refunds_2026.md › Sale Exceptions]", side: "a", x: 1320, y: 530, w: 420, color: "green", size: 23 }, { at: "52%" });
      s.link("ma", "meta", "llm", { color: "gold", pulse: true }, { at: "32%" });
      s.link("la", "llm", "ans", { color: "green", pulse: true }, { at: "58%" });
      s.stream("meta", "llm", { at: "45%", span: 2.2, every: 0.7, color: "gold" });
    }},
    { sec: "التحديث والإصدارات", say: "وعندما تتغير السياسة، أعد معالجة المستند وتتبّع الإصدارات واحذف المقاطع القديمة.", eq: "@T{v1 (delete)} @to @G{v2 (upsert)}", do: s => {
      s.clear({ dur: 0.4 });
      s.doc("v1", { x: 420, y: 490, w: 155, h: 195, lines: 6, title: "refunds.md v1 (14d)", color: "dim" }, { at: "10%" });
      s.doc("v2", { x: 1180, y: 490, w: 155, h: 195, lines: 6, title: "refunds.md v2 (30d)", color: "green" }, { at: "35%" });
      s.arrow("up", { x1: 540, y1: 490, x2: 1060, y2: 490, color: "green", label: "hash changed → re-ingest", pulse: true }, { at: "45%" });
      s.to("v1", { opacity: 0.35, color: "red" }, { at: "68%", dur: 0.5 });
      s.mark("xv1", "v1", "x", { at: "74%" });
      s.mark("okv2", "v2", "check", { at: "78%" });
      s.callout("ver", { x: 800, y: 760, label: "Replace old doc_id chunks atomically — no ghost policies", icon: "refresh", color: "teal" }, { at: "75%" });
    }},
    { sec: "الكود العملي", say: "وفي Python: نظّف النص، ثم قسّمه حسب العناوين بحد 400 Token وتداخل 60.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("cd", { x: 800, y: 530, size: 22, title: "ingest.py", lines: [
        "clean = strip_boilerplate(doc.raw_html)",
        "chunks = split_by_headings(clean, max_tokens=400, overlap=60)",
        "db.delete_by_doc(doc.tenant_id, doc.id)",
        "for idx, txt in enumerate(chunks):",
        "    db.insert_chunk(tenant_id=doc.tenant_id, text=txt,",
        "        meta={\"source\": doc.url, \"section\": idx, \"v\": doc.ver})"
      ] }, { at: "8%", dur: 1.7 });
      s.to("cd", { hl: 0 }, { at: "52%", dur: 0.25 });
      s.to("cd", { hl: 1 }, { at: "76%", dur: 0.25 });
    }},
    { say: "ثم احذف النسخة السابقة وخزّن كل مقطع جديد مع معرّف العميل والبيانات الوصفية.", do: s => {
      s.to("cd", { hl: 2 }, { at: "15%", dur: 0.25 });
      s.to("cd", { hl: 4 }, { at: "48%", dur: 0.25 });
      s.to("cd", { hl: 5 }, { at: "76%", dur: 0.25 });
    }},
    { sec: "الخطأ مقابل القاعدة", say: "احذر من إضافة v2 دون حذف v1؛ فسيجد النموذج سياستين متناقضتين ويهلوس.", do: s => {
      s.clear({ dur: 0.4 });
      s.versus("vs", "إضافة دون حذف ✗", "استبدال بالإصدار ✓", { colors: ["red", "green"] }, { at: "0%" });
      s.col("d1", ["v1: 14-day refund", "v2: 30-day refund", "Conflict in Top-5!"], { x: 440, y: 545, size: 24, w: 460, icons: ["doc", "doc", "alert"], colors: ["dim", "gold", "red"] }, { at: "25%", st: 0.22 });
      s.col("d2", ["Delete old doc_id", "Insert v2 + metadata", "Single source of truth"], { x: 1160, y: 545, size: 24, w: 460, icons: ["trash", "save", "check"], colors: ["teal", "blue", "green"] }, { at: "45%", st: 0.22 });
    }},
    { sec: "الخلاصة", say: "الخلاصة: نظّف المستند، وقسّمه بالبنية مع تداخل بسيط، وأرفِق المصادر، وحدّث الإصدارات.", eq: "@T{Raw} @to @C{Clean} @to @Y{Chunk+Overlap} @to @G{Meta+Version}", do: s => {
      s.clear({ dur: 0.4 });
      s.chain("sum", ["Raw Docs", "Clean", "Structure Split", "Metadata", "Versioned DB"], { y: 530, gap: 42, icons: ["docs", "filter", "split", "memo", "db"], colors: ["dim", "teal", "gold", "blue", "green"], w: 235, h: 155, size: 22, pulse: true }, { at: "12%", st: 0.16 });
    }}
  ]);

  // ------------------------------------------------------------------ 5.3 Vector Embeddings & Search with pgvector
  X.lesson("5.3", [
    { sec: "فشل البحث بالكلمة", say: "المستخدم يسأل: كيف أستعيد نقودي؟ بينما المستند يذكر: سياسة الإرجاع خلال 14 يومًا.", do: s => {
      s.bubble("q", { text: "How do I get my money back?", side: "u", x: 430, y: 390, w: 430, size: 25 }, { at: "8%" });
      s.box("doc", { x: 1150, y: 390, w: 470, h: 108, label: "Return policy: 14-day window", sub: "refunds.md", icon: "doc", inline: true, size: 23, color: "gold" }, { at: "34%" });
      s.arrow("kw", { x1: 660, y1: 390, x2: 900, y2: 390, color: "red", label: "exact words? 0" }, { at: "58%" });
      s.callout("miss", { x: 800, y: 620, label: "Same meaning — zero shared words!", icon: "alert", color: "orange" }, { at: "74%" });
    }},
    { sec: "فضاء المعاني", say: "لذلك نحوّل كل مقطع إلى متجه رقمي، فتتجاور المعاني المتشابهة في الفضاء.", eq: "@T{embed}(@T{text}) @in @mathbb{R}^{384}", do: s => {
      s.clear({ dur: 0.4 });
      s.plane("pl", { x: 800, y: 555, w: 1020, h: 560, u: 62 }, { at: "0%" });
      const pts = [
        ["refund policy", -3.4, 2.3, "green"], ["return window", -2.4, 3.0, "green"], ["money back", -4.1, 1.4, "green"],
        ["GPU cluster", 3.3, -1.6, "orange"], ["H100 price", 4.1, -2.5, "orange"], ["shipping time", 0.9, -2.6, "blue"]
      ];
      pts.forEach(([t, vx, vy, c], i) => {
        const p = s.P("pl", vx, vy);
        s.dot("d" + i, { x: p.x, y: p.y, r: 10, color: c, halo: i < 3 }, { at: 0.35 + i * 0.14 });
        s.note("dl" + i, { text: t, x: p.x, y: p.y - 26, size: 21, color: c, font: "math" }, { at: 0.45 + i * 0.14 });
      });
    }},
    { say: "والزاوية بين متجهين تقيس مدى التشابه: زاوية صغيرة تعني صلة عالية جدًا.", eq: "@cos @theta = @frac{a @cdot b}{@lVert a @rVert @, @lVert b @rVert}", do: s => {
      s.vec("va", { plane: "pl", v: [-3.4, 2.3], color: "green", w: 4 }, { at: "10%" });
      s.vec("vb", { plane: "pl", v: [-2.4, 3.0], color: "teal", w: 4 }, { at: "28%" });
      s.vec("vc", { plane: "pl", v: [3.3, -1.6], color: "orange", w: 4 }, { at: "48%" });
      s.badge("bs", { x: 430, y: 790, text: "cos = 0.94 · similar ✓", color: "green", size: 22 }, { at: "62%" });
      s.badge("bd", { x: 1170, y: 790, text: "cos = 0.12 · unrelated", color: "orange", size: 22 }, { at: "76%" });
    }},
    { sec: "عتبة التشابه", say: "انتبه: البحث يعيد أقرب 5 نتائج دائمًا، حتى لو كان السؤال خارج نطاق مستنداتك تمامًا!", do: s => {
      s.out(["va", "vb", "vc", "bs", "bd"], { at: "0%", dur: 0.35 });
      const q = s.P("pl", 1.8, 2.2);
      s.dot("qpt", { x: q.x, y: q.y, r: 12, color: "blue", halo: true }, { at: "15%" });
      s.note("qlb", { text: "query: \"weather today?\"", x: q.x, y: q.y - 30, size: 22, color: "blue", font: "math" }, { at: "22%" });
      s.link("badl", "qpt", "d1", { color: "red", dash: "6 6", label: "cos = 0.28!" }, { at: "52%" });
      s.badge("warn", { x: 800, y: 815, text: "No threshold → forces irrelevant chunks into LLM ✗", color: "red", size: 22 }, { at: "70%" });
    }},
    { say: "لذلك نضع عتبة تشابه دنيا؛ فإن لم يتجاوزها أي مقطع نقول ببساطة: لا أعرف.", eq: "@cos(q, d) @ge @C{0.75} @quad @text{else \"I don't know\"}", do: s => {
      s.out(["badl", "warn"], { at: "0%", dur: 0.3 });
      const q = s.P("pl", 1.8, 2.2);
      s.ring("th", { x: q.x, y: q.y, r: 125, color: "teal", w: 3, arrows: 0 }, { at: "20%" });
      s.focus(["qpt", "qlb", "th"], { at: "35%", zoom: 1.15 });
      s.callout("idk", { x: 800, y: 815, label: "Empty radius → safe fallback: \"Not in our docs\"", icon: "shieldok", color: "gold" }, { at: "62%" });
    }},
    { sec: "داخل PostgreSQL", say: "الميزة الرائعة أنك لا تحتاج قاعدة منفصلة؛ إضافة pgvector تجلب المتجهات داخل Postgres.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("ddl", { x: 800, y: 525, size: 24, title: "schema.sql", lines: [
        "CREATE EXTENSION IF NOT EXISTS vector;",
        "CREATE TABLE chunks (",
        "  id        bigserial PRIMARY KEY,",
        "  tenant_id int NOT NULL,",
        "  content   text NOT NULL,",
        "  embedding vector(384)",
        ");"
      ] }, { at: "8%", dur: 1.7 });
      s.to("ddl", { hl: 0 }, { at: "55%", dur: 0.25 });
      s.to("ddl", { hl: 5 }, { at: "78%", dur: 0.25 });
    }},
    { say: "والاستعلام يصفّي حسب العميل ثم يرتّب حسب مسافة جيب التمام بالمعامل <=>.", eq: "@T{ORDER BY} @; @T{embedding} @G{<=>} q @; @T{LIMIT 5}", do: s => {
      s.out("ddl", { at: "0%", dur: 0.3 });
      s.code("sql", { x: 800, y: 525, size: 25, title: "search.sql", lines: [
        "SELECT id, content, 1 - (embedding <=> $1) AS sim",
        "FROM chunks",
        "WHERE tenant_id = $2",
        "  AND 1 - (embedding <=> $1) >= 0.75",
        "ORDER BY embedding <=> $1",
        "LIMIT 5;"
      ] }, { at: "12%", dur: 1.6 });
      s.to("sql", { hl: 2 }, { at: "55%", dur: 0.25 });
      s.to("sql", { hl: 4 }, { at: "78%", dur: 0.25 });
    }},
    { sec: "فهرس HNSW", say: "مع نمو الجدول لملايين المقاطع، البحث الكامل يبطؤ خطيًا ويخنق الخادم.", eq: "@T{exact scan}: O(N) @quad @T{vs} @quad @G{HNSW}: O(@log N)", do: s => {
      s.clear({ dur: 0.4 });
      s.chart("sc", { x: 540, y: 545, w: 540, h: 340, xl: "chunks (millions)", yl: "latency", curves: [
        [[[0, 0.05], [0.25, 0.28], [0.5, 0.52], [0.75, 0.76], [1, 0.96]], "red", "no index"],
        [[[0, 0.04], [0.25, 0.08], [0.5, 0.11], [0.75, 0.13], [1, 0.15]], "green", "HNSW"]
      ] }, { at: "12%", dur: 1.4 });
      s.bars("ix", [["Exact scan · 5M", 0.92, "red", "1,200 ms"], ["HNSW index", 0.05, "green", "15 ms"]], { x: 1120, y: 545, w: 300, gap: 110, size: 24, h: 34 }, { at: "50%" });
    }},
    { say: "فأضِف فهرسًا تقريبيًا مثل HNSW ليبقى زمن البحث بضع ملّي ثوانٍ فقط.", do: s => {
      s.code("ixc", { x: 1140, y: 765, size: 17, title: "index.sql", lines: [
        "CREATE INDEX ON chunks USING hnsw (embedding vector_cosine_ops);"
      ] }, { at: "15%", dur: 1.2 });
      s.pulse("ix1", { at: "60%", color: "green" });
    }},
    { sec: "عزل العملاء", say: "أخطر ثغرة في RAG متعدد العملاء: البحث أولًا ثم التصفية، أو نسيان tenant_id.", eq: "@T{WHERE} @; @T{tenant@_id} = @G{@$2}", do: s => {
      s.clear({ dur: 0.4 });
      ["tenant 41", "tenant 42", "tenant 43"].forEach((t, i) =>
        s.zone("t" + i, { x: 380 + i * 420, y: 510, w: 370, h: 390, label: t, color: i === 1 ? "green" : "dim" }, { at: 0.15 + i * 0.12 })
      );
      for (let i = 0; i < 9; i++) {
        const colIdx = i % 3;
        s.dot("r" + i, { x: 280 + colIdx * 420 + Math.floor(i / 3) * 95, y: 465 + (i % 2) * 95, r: 12, color: colIdx === 1 ? "green" : "red" }, { at: 0.55 + i * 0.05 });
      }
      s.box("usr", { x: 800, y: 790, w: 460, h: 66, label: "Query from Tenant 42", icon: "user", inline: true, size: 24, color: "green" }, { at: "60%" });
      s.link("lk", "usr", "r0", { color: "red", dash: "6 6", label: "data leak!" }, { at: "74%" });
    }},
    { say: "صفِّ دائمًا بـ tenant_id داخل استعلام SQL نفسه ليرى كل عميل بياناته فقط.", do: s => {
      s.out("lk", { at: "0%", dur: 0.3 });
      s.focus(["t1", "r1", "r4", "r7", "usr"], { at: "15%", zoom: 1.12 });
      s.link("okl", "usr", "r4", { color: "green", pulse: true, label: "WHERE tenant_id = 42" }, { at: "35%" });
      s.stream("r4", "usr", { at: "48%", span: 2.2, every: 0.7, color: "green" });
      s.mark("okt", "t1", "check", { at: "75%" });
    }},
    { sec: "الخلاصة", say: "الخلاصة: التضمين يقيس المعنى، والعتبة تمنع الهلوسة، وHNSW يسرّع، وSQL يعزل العملاء.", eq: "@T{Embed} @to @C{Cosine @ge @tau} @to @G{HNSW} @to @Y{tenant@_id}", do: s => {
      s.clear({ dur: 0.4 });
      s.chain("sum", ["Embeddings", "Threshold", "HNSW Index", "Tenant Filter"], { y: 525, gap: 60, icons: ["sparkle", "target", "bolt", "lock"], subs: ["vector(384)", "cos ≥ 0.75", "15 ms at 5M", "WHERE tenant_id"], colors: ["blue", "teal", "gold", "green"], w: 280, h: 165, size: 24, pulse: true }, { at: "12%", st: 0.18 });
    }}
  ]);

  // ------------------------------------------------------------------ 6.1 LangGraph: State, Nodes, and Edges
  X.lesson("6.1", [
    { sec: "لماذا رسم بياني؟", say: "تصل تذكرة عميل: تم خصم المبلغ مرتين من طلبي؛ كيف ننظم خطوات المعالجة بثبات؟", do: s => {
      s.bubble("tk", { text: "I was charged twice for order #812!", side: "u", x: 420, y: 420, w: 450, size: 24 }, { at: "8%" });
      s.code("spag", { x: 1120, y: 520, size: 20, title: "messy_script.py", lines: [
        "if 'charge' in msg:",
        "    if try_lookup():",
        "        reply = draft()  # global state!",
        "    else: retry_loop()   # hard to test"
      ] }, { at: "36%", dur: 1.4 });
      s.link("sl", "tk", "spag", { color: "red", dash: "6 6" }, { at: "46%" });
      s.badge("sb", { x: 420, y: 600, text: "Nested if/else = brittle & untestable ✗", color: "red", size: 21 }, { at: "72%" });
    }},
    { sec: "الحالة المشتركة", say: "في LangGraph نبدأ بحالة واحدة محددة الأنواع، تشاركها كل خطوات سير العمل.", eq: "@T{State} = @{ @T{message}, @; @T{category}, @; @T{reply} @}", do: s => {
      s.clear({ dur: 0.4 });
      s.code("st", { x: 800, y: 340, size: 23, title: "State (TypedDict)", lines: [
        "message:  \"I was charged twice\"",
        "category: None",
        "reply:    None"
      ] }, { at: "12%", dur: 1.4 });
      s.callout("stn", { x: 800, y: 560, label: "Single typed contract shared across all nodes", icon: "clipboard", color: "teal" }, { at: "62%" });
    }},
    { sec: "العُقد", say: "والعُقد دوال صغيرة: كل عقدة تقرأ الحالة، وتعيد تحديثًا جزئيًا على الحقول التي تخصّها.", eq: "@T{node}(@T{state}) @to @B{partial update}", do: s => {
      s.out("stn", { at: "0%", dur: 0.3 });
      s.box("n1", { x: 520, y: 660, w: 260, h: 92, label: "classify", sub: "reads message", icon: "filter", inline: true, color: "blue", size: 25 }, { at: "18%" });
      s.box("n2", { x: 1080, y: 660, w: 260, h: 92, label: "draft", sub: "writes reply", icon: "pencil", inline: true, color: "purple", size: 25 }, { at: "42%" });
      s.link("r1", "st", "n1", { color: "dim", dash: "6 6", label: "read" }, { at: "52%" });
      s.link("w1", "n1", "st", { color: "blue", bend: 0.25, label: "update", pulse: true }, { at: "68%" });
    }},
    { say: "فعقدة التصنيف تقرأ الرسالة، ثم تكتب فقط حقل الفئة refund داخل الحالة.", do: s => {
      s.focus(["st", "n1", "w1"], { at: "0%", zoom: 1.12, keep: ["r1"] });
      s.stream("n1", "st", { at: "15%", span: 1.6, every: 0.55, color: "blue", bend: 0.25 });
      s.out("st", { at: "52%", dur: 0.25 });
      s.code("st2", { x: 800, y: 340, size: 23, title: "State (updated)", lines: [
        "message:  \"I was charged twice\"",
        "category: \"refund\"   # updated by classify",
        "reply:    None"
      ], hl: 1, hc: "blue" }, { at: "55%", in: "fade", dur: 0.4 });
    }},
    { say: "وعقدة الصياغة تقرأ الفئة المحدّثة، فتملأ حقل الرد بدقة دون تعديل الباقي.", do: s => {
      s.unfocus({ at: "0%", dur: 0.3 });
      s.link("r2", "st2", "n2", { color: "dim", dash: "6 6" }, { at: "12%" });
      s.link("w2", "n2", "st2", { color: "purple", bend: -0.25, pulse: true }, { at: "24%" });
      s.flow("n2", "st2", { color: "purple", bend: -0.25, at: "34%" });
      s.out("st2", { at: "62%", dur: 0.25 });
      s.code("st3", { x: 800, y: 340, size: 23, title: "State (complete)", lines: [
        "message:  \"I was charged twice\"",
        "category: \"refund\"",
        "reply:    \"Refund #812 initiated ✓\""
      ], hl: 2, hc: "green" }, { at: "65%", in: "fade", dur: 0.4 });
    }},
    { sec: "الحواف والتوجيه", say: "والآن نربط العُقد بحواف تحدد المسار: حافة ثابتة دائمًا، أو حافة شرطية حسب الحالة.", eq: "@T{Graph} = (@T{State}, @; @B{Nodes}, @; @Y{Edges})", do: s => {
      s.clear({ dur: 0.4 });
      s.box("S", { x: 220, y: 540, w: 150, h: 64, label: "START", font: "mono", size: 23, color: "dim" }, { at: "10%" });
      s.box("c", { x: 520, y: 540, w: 230, h: 88, label: "classify", icon: "filter", inline: true, color: "blue", size: 25 }, { at: "22%" });
      s.box("r", { x: 960, y: 390, w: 270, h: 84, label: "refund_reply", font: "mono", size: 22, color: "green" }, { at: "38%" });
      s.box("g", { x: 960, y: 690, w: 270, h: 84, label: "general_reply", font: "mono", size: 22, color: "purple" }, { at: "48%" });
      s.box("E", { x: 1380, y: 540, w: 140, h: 64, label: "END", font: "mono", size: 23, color: "dim" }, { at: "60%" });
      s.link("e0", "S", "c", { color: "soft", label: "fixed" }, { at: "30%" });
      s.link("e1", "c", "r", { color: "gold", dash: "8 6", label: "refund?" }, { at: "55%" });
      s.link("e2", "c", "g", { color: "gold", dash: "8 6", label: "other?" }, { at: "62%" });
      s.link("e3", "r", "E", { color: "soft" }, { at: "70%" });
      s.link("e4", "g", "E", { color: "soft" }, { at: "74%" });
    }},
    { say: "الحافة الشرطية دالة صغيرة تقرأ category من الحالة، وتوجّه التنفيذ إلى refund_reply.", eq: "@T{route}(@T{state}) = @G{refund@_reply} @; @T{if category = refund}", do: s => {
      s.focus(["c", "r", "e1"], { at: "10%", zoom: 1.15, keep: ["S", "E", "e0", "e3"] });
      s.flow("S", "c", { color: "soft", at: "12%" });
      s.to("e1", { color: "green", w: 4.5 }, { at: "38%", dur: 0.4 });
      s.stream("c", "r", { at: "42%", span: 1.8, every: 0.6, color: "green" });
      s.flow("r", "E", { color: "green", at: "72%" });
    }},
    { sec: "الكود العملي", say: "وفي كود LangGraph: نعرّف الحالة أولًا، ثم نسجّل كل عقدة باسم واضح.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("cd", { x: 800, y: 530, size: 22, title: "workflow.py", lines: [
        "class State(TypedDict):",
        "    message: str; category: str; reply: str",
        "g = StateGraph(State)",
        "g.add_node(\"classify\", classify)",
        "g.add_node(\"refund_reply\", refund_reply)",
        "g.add_edge(START, \"classify\")",
        "g.add_conditional_edges(\"classify\", route)",
        "app = g.compile()"
      ] }, { at: "8%", dur: 1.8 });
      s.to("cd", { hl: 0 }, { at: "52%", dur: 0.25 });
      s.to("cd", { hl: 3 }, { at: "76%", dur: 0.25 });
    }},
    { say: "ثم نضيف الحواف الثابتة والشرطية، ونجمع الرسم بـ compile ليصبح جاهزًا للتشغيل.", do: s => {
      s.to("cd", { hl: 5 }, { at: "15%", dur: 0.25 });
      s.to("cd", { hl: 6 }, { at: "46%", dur: 0.25 });
      s.to("cd", { hl: 7 }, { at: "76%", dur: 0.25 });
    }},
    { sec: "الخطأ مقابل القاعدة", say: "خطأ شائع: وضع كل المنطق داخل عقدة عملاقة واحدة يصعب اختبارها أو تتبّعها.", do: s => {
      s.clear({ dur: 0.4 });
      s.versus("vs", "عقدة عملاقة ✗", "عُقد صغيرة مختبرة ✓", { colors: ["red", "green"] }, { at: "0%" });
      s.box("god", { x: 440, y: 530, w: 420, h: 220, label: "do_everything_node()\nclassify + DB + draft + email", icon: "alert", size: 22, color: "red" }, { at: "22%" });
      s.mark("gx", "god", "x", { at: "42%" });
      s.col("sm", ["classify(state) → category", "lookup(state) → order", "draft(state) → reply"], { x: 1160, y: 530, w: 480, size: 22, font: "mono", icons: ["check", "check", "check"], colors: ["blue", "teal", "green"] }, { at: "45%", st: 0.22 });
    }},
    { say: "فكل عقدة صغيرة يمكن اختبارها بدالة Unit Test سريعة بمدخل ومخرج واضحين.", do: s => {
      s.focus(["vsR", "sm*"], { at: "15%", zoom: 1.1 });
      s.badge("ut", { x: 1160, y: 745, text: "assert classify({'message':'charged twice'}) == {'category':'refund'}", color: "green", size: 17, font: "mono" }, { at: "45%" });
    }},
    { sec: "الخلاصة", say: "إذن LangGraph يجمع ثلاثة عناصر: حالة محددة الأنواع، وعُقدًا صغيرة، وحواف صريحة.", eq: "@T{LangGraph} = @C{Typed State} + @B{Small Nodes} + @Y{Explicit Edges}", do: s => {
      s.clear({ dur: 0.4 });
      s.chain("sum", ["Typed State", "Small Nodes", "Explicit Edges", "Testable App"], { y: 525, gap: 60, icons: ["clipboard", "box", "route", "check"], colors: ["teal", "blue", "gold", "green"], w: 270, h: 160, size: 24, pulse: true }, { at: "12%", st: 0.18 });
    }}
  ]);

  // ------------------------------------------------------------------ 6.2 Workflow Patterns in LangGraph
  X.lesson("6.2", [
    { sec: "حدود السلسلة", say: "السلسلة الخطية الواحدة لا تكفي كل المهام: فبعضها يتفرّع، وبعضها يتوازى، وبعضها يراجع نفسه.", do: s => {
      s.chain("lin", ["Step 1", "Step 2", "Step 3", "Step 4"], { y: 430, gap: 70, colors: ["dim", "dim", "dim", "dim"], w: 200, h: 86, size: 24 }, { at: "8%", st: 0.14 });
      s.grid("prb", ["Different intents?", "Slow sequential I/O?", "Unknown N subtasks?", "Draft needs QA?"], { cols: 4, y: 660, cw: 330, ch: 92, size: 22, colors: ["gold", "teal", "purple", "orange"] }, { at: "48%", st: 0.12 });
    }},
    { sec: "نمط التوجيه", say: "النمط الأول: التوجيه. حافة شرطية تختار المسار الأنسب والنموذج الأنسب حسب التصنيف.", eq: "@T{add@_conditional@_edges}(@T{classify}, @; @Y{route})", do: s => {
      s.clear({ dur: 0.4 });
      s.box("rt", { x: 430, y: 530, w: 240, h: 100, label: "classify", icon: "route", inline: true, color: "gold", size: 27 }, { at: "10%" });
      ["billing · fast", "tech · reasoning", "sales · RAG"].forEach((t, i) => {
        s.box("p" + i, { x: 1080, y: 360 + i * 170, w: 330, h: 82, label: t, size: 24, color: ["blue", "purple", "teal"][i] }, { at: 0.35 + i * 0.15 });
        s.link("l" + i, "rt", "p" + i, { color: "gold", dash: "8 6" }, { at: 0.5 + i * 0.15 });
      });
      s.to("l1", { color: "purple", w: 4.5, dash: "none" }, { at: "68%", dur: 0.35 });
      s.stream("rt", "p1", { at: "70%", span: 1.8, every: 0.6, color: "purple" });
    }},
    { say: "هكذا تذهب الأسئلة السهلة لمسار سريع ورخيص، والمعقّدة إلى مسار متخصص.", do: s => {
      s.focus(["rt", "p0", "l0"], { at: "10%", zoom: 1.12, keep: ["p1", "p2", "l1", "l2"] });
      s.to("l0", { color: "blue", w: 4.5 }, { at: "25%", dur: 0.35 });
      s.stream("rt", "p0", { at: "32%", span: 2.2, every: 0.6, color: "blue" });
      s.badge("sav", { x: 430, y: 720, text: "80% traffic → fast cheap route ✓", color: "green", size: 21 }, { at: "62%" });
    }},
    { sec: "التنفيذ المتوازي", say: "النمط الثاني: التوازي. نوزّع العمل على عدة فروع معًا، ثم نجمع نتائجها في عقدة دمج.", eq: "@T{latency} = @max(t_1, t_2, t_3) @ll t_1 + t_2 + t_3", do: s => {
      s.clear({ dur: 0.4 });
      s.box("fo", { x: 300, y: 530, w: 210, h: 88, label: "fan-out", icon: "split", inline: true, size: 25, color: "soft" }, { at: "8%" });
      s.box("fi", { x: 1300, y: 530, w: 230, h: 88, label: "fan-in merge", icon: "merge", inline: true, size: 24, color: "gold" }, { at: "22%" });
      ["search docs · 1.2s", "fetch order · 0.8s", "check fraud · 1.0s"].forEach((t, i) => {
        s.box("w" + i, { x: 800, y: 360 + i * 170, w: 330, h: 80, label: t, size: 23, color: "teal" }, { at: 0.35 + i * 0.12 });
        s.link("a" + i, "fo", "w" + i, { color: "teal", pulse: true }, { at: "45%" });
        s.link("b" + i, "w" + i, "fi", { color: "gold", pulse: true }, { at: "60%" });
      });
    }},
    { say: "فتنخفض مدة الانتظار من مجموع الفروع إلى زمن أبطأ فرع واحد فقط.", do: s => {
      [0, 1, 2].forEach(i => {
        s.stream("fo", "w" + i, { at: "10%", span: 1.5, every: 0.55, color: "teal" });
        s.stream("w" + i, "fi", { at: "45%", span: 1.5, every: 0.55, color: "gold" });
      });
      s.badge("tcmp", { x: 800, y: 815, text: "Sequential: 3.0s  →  Parallel: 1.2s (2.5× faster)", color: "green", size: 23 }, { at: "62%" });
    }},
    { sec: "المنسّق والعامل", say: "أما إذا لم نعرف عدد المهام الفرعية مسبقًا، فنستخدم نمط المنسّق والعمّال بـ Send.", eq: "[@P{Send}(@T{\"worker\"}, @; @T{task}_i) @; @T{for} @; i @in 1..N]", do: s => {
      s.clear({ dur: 0.4 });
      s.box("or", { x: 800, y: 315, w: 320, h: 86, label: "Orchestrator", sub: "plans N subtasks dynamically", icon: "sitemap", inline: true, color: "purple", size: 25 }, { at: "8%" });
      s.box("syn", { x: 800, y: 760, w: 320, h: 80, label: "Synthesizer", sub: "reduces all worker outputs", icon: "merge", inline: true, color: "gold", size: 24 }, { at: "28%" });
      for (let i = 0; i < 4; i++) {
        s.box("k" + i, { x: 335 + i * 310, y: 540, w: 230, h: 78, label: "worker " + (i + 1), sub: "Send()", size: 22, color: "blue" }, { at: 0.65 + i * 0.16 });
        s.link("kl" + i, "or", "k" + i, { color: "purple", pulse: true }, { at: 0.8 + i * 0.16 });
        s.link("ks" + i, "k" + i, "syn", { color: "gold", pulse: true }, { at: 1.1 + i * 0.16 });
      }
    }},
    { say: "فيقرأ المنسّق التقرير ويولّد عاملًا لكل قسم أثناء التشغيل، ثم يدمج النتائج عبر Reducer.", do: s => {
      for (let i = 0; i < 4; i++) {
        s.flow("or", "k" + i, { color: "purple", at: 0.2 + i * 0.12 });
        s.flow("k" + i, "syn", { color: "gold", at: 1.3 + i * 0.12 });
      }
      s.focus(["or", "k1", "k2"], { at: "52%", zoom: 1.1, keep: ["syn"] });
    }},
    { sec: "المقيّم والمحسّن", say: "النمط الرابع: المقيِّم والمحسِّن، حيث ينقّح الكاتب مسودته بناءً على ملاحظات المقيّم.", eq: "@B{draft} @rightleftharpoons @Y{evaluate}", do: s => {
      s.clear({ dur: 0.4 });
      s.box("wr", { x: 520, y: 480, w: 260, h: 130, label: "Generator", sub: "write / revise", icon: "pencil", color: "blue", size: 26 }, { at: "10%" });
      s.box("jd", { x: 1080, y: 480, w: 260, h: 130, label: "Evaluator", sub: "grade vs rubric", icon: "scale", color: "gold", size: 26 }, { at: "25%" });
      s.link("d1", "wr", "jd", { color: "blue", bend: 0.25, label: "draft", pulse: true }, { at: "38%" });
      s.link("d2", "jd", "wr", { color: "gold", bend: 0.25, label: "feedback", pulse: true }, { at: "48%" });
      s.flow("wr", "jd", { color: "blue", bend: 0.25, at: "55%" });
      s.flow("jd", "wr", { color: "gold", bend: 0.25, at: "74%" });
    }},
    { say: "ونضع دائمًا سقفًا صارمًا للتكرارات، حتى لا تدور الحلقة للأبد وتحرق الميزانية.", eq: "@T{iterations} @le @R{3} @Rightarrow @T{END}", do: s => {
      s.num("it", { v: 1, x: 800, y: 690, size: 46, color: "gold", pre: "iteration " }, { at: "10%" });
      s.to("it", { v: 3 }, { at: "25%", dur: 1.5, ease: "lin" });
      s.box("end", { x: 1390, y: 480, w: 145, h: 68, label: "END", font: "mono", size: 23, color: "green" }, { at: "58%" });
      s.link("de", "jd", "end", { color: "green", label: "pass / max", pulse: true }, { at: "64%" });
      s.callout("cap", { x: 800, y: 805, label: "Always enforce max_iterations guard!", icon: "shield", color: "red" }, { at: "70%" });
    }},
    { sec: "الكود والخطأ", say: "وفي كود LangGraph: نعيد قائمة Send للعمّال، ونفحص عدد التكرارات في حافة التقييم.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("cd", { x: 800, y: 525, size: 22, title: "patterns.py", lines: [
        "def dispatch(state):  # Orchestrator → dynamic N workers",
        "    return [Send(\"worker\", {\"sec\": s}) for s in state[\"sections\"]]",
        "",
        "def check_eval(state):  # Bounded evaluator loop",
        "    if state[\"ok\"] or state[\"iters\"] >= 3:",
        "        return END",
        "    return \"generator\""
      ] }, { at: "8%", dur: 1.7 });
      s.to("cd", { hl: 1 }, { at: "50%", dur: 0.25 });
      s.to("cd", { hl: 4 }, { at: "76%", dur: 0.25 });
    }},
    { say: "وتجنّب نسيان دالة الدمج (Reducer) في الفروع المتوازية؛ وإلا سيكتب فرع فوق نتيجة الآخر.", do: s => {
      s.to("cd", { y: 425, scale: 0.88 }, { at: "0%", dur: 0.5 });
      s.callout("red", { x: 800, y: 725, label: "Parallel writes need Annotated[list, operator.add] reducer!", icon: "alert", color: "orange" }, { at: "35%" });
    }},
    { sec: "الخلاصة", say: "في LangGraph: حواف شرطية للتوجيه، وتوازي بـ fan-in، وSend للعمّال، وحلقات محدودة للتقييم.", eq: "@Y{Route} @; · @; @C{Parallel} @; · @; @P{Send} @; · @; @O{Bounded Loop}", do: s => {
      s.clear({ dur: 0.4 });
      s.grid("sum", ["Conditional Edges", "Fan-out / Fan-in", "Send(worker, task)", "Bounded Loop ≤ 3"], { cols: 4, y: 525, cw: 335, ch: 150, size: 22, icons: ["route", "merge", "sitemap", "loop"], subs: ["routing", "parallel speedup", "dynamic N", "eval + cap"], colors: ["gold", "teal", "purple", "orange"] }, { at: "12%", st: 0.16 });
    }}
  ]);

  // ------------------------------------------------------------------ 6.3 Persistence, Checkpoints & Human Approval
  X.lesson("6.3", [
    { sec: "مشكلة التوقف", say: "تخيّل سير عمل استرداد مبلغ 250 دولارًا؛ يحتاج موافقة موظف قد يتأخر ساعتين!", do: s => {
      s.chain("g", ["classify", "lookup", "approve", "refund"], { y: 390, gap: 90, icons: ["filter", "search", "hand", "dollar"], colors: ["blue", "blue", "gold", "green"], w: 230, h: 140, size: 24, pulse: true }, { at: "8%", st: 0.16 });
      s.badge("wait", { x: 960, y: 610, text: "Human may reply 2 hours later…", color: "orange", size: 23 }, { at: "62%" });
    }},
    { say: "بدون حفظ دائم، أي إعادة تشغيل للخادم ستضيع كل خطوات التحقيق وتبدأ من الصفر.", do: s => {
      s.out("wait", { at: "0%", dur: 0.3 });
      s.icon("pw", { name: "power", x: 800, y: 635, s: 76, color: "red" }, { at: "18%" });
      s.to(["g0", "g1", "g2", "g3"], { opacity: 0.25 }, { at: "40%", dur: 0.45 });
      s.callout("lost", { x: 800, y: 765, label: "RAM wiped → lost context & repeated API calls ✗", icon: "alert", color: "red" }, { at: "55%" });
      s.to(["g0", "g1", "g2", "g3"], { opacity: 1 }, { at: "82%", dur: 0.4 });
    }},
    { sec: "نقاط الحفظ", say: "الحل هو Checkpointer: يحفظ لقطة كاملة من الحالة بعد كل عقدة تلقائيًا.", eq: "@T{checkpoint} = (@C{thread@_id}, @; @T{step}, @; @T{state})", do: s => {
      s.out(["pw", "lost"], { at: "0%", dur: 0.3 });
      s.box("db", { x: 800, y: 745, w: 680, h: 86, label: "Postgres Checkpointer", sub: "durable snapshots per step", icon: "db", inline: true, size: 26, color: "teal" }, { at: "15%" });
      [0, 1].forEach(i => {
        s.icon("sv" + i, { name: "save", x: s.get("g" + i).x, y: 585, s: 46, color: "teal" }, { at: 0.55 + i * 0.35 });
        s.flow("g" + i, "db", { color: "teal", at: 0.5 + i * 0.35 });
      });
    }},
    { say: "كل محادثة تُنظَّم تحت thread_id فريد، مثل ملفات الحفظ (Save Points) في لعبة فيديو.", do: s => {
      s.box("th", { x: 420, y: 635, w: 390, h: 58, label: "thread_id = \"order-812\"", font: "mono", size: 21, color: "gold" }, { at: "18%" });
      s.icon("flg", { name: "flag", x: s.get("g2").x, y: 560, s: 52, color: "gold" }, { at: "48%" });
      s.pulse("db", { at: "68%", color: "teal" });
    }},
    { sec: "الموافقة بـ interrupt", say: "وقبل استرداد المال، نستدعي interrupt() فيتوقف الرسم ويحفظ حالته وينتظر الإنسان.", eq: "@T{ok} = @Y{interrupt}(@{ @T{refund}: 250 @})", do: s => {
      s.focus(["g2", "db"], { at: "0%", zoom: 1.12, keep: ["th", "flg"] });
      s.to("g2", { glow: 1, stroke: "gold", label: "approve ⏸" }, { at: "18%", dur: 0.45 });
      s.bubble("ask", { text: "Approve $250 refund for order #812?", side: "s", x: 1230, y: 615, w: 410, size: 22 }, { at: "45%" });
      s.flow("g2", "db", { color: "gold", at: "62%" });
    }},
    { say: "وحتى لو أعيد تشغيل الخادم أو نُشِر تحديث جديد، تبقى الحالة محفوظة بأمان تام.", do: s => {
      s.unfocus({ at: "0%", dur: 0.35 });
      s.icon("rst", { name: "refresh", x: 1410, y: 745, s: 64, color: "orange" }, { at: "15%" });
      s.to(["g*"], { opacity: 0.25 }, { at: "28%", dur: 0.35 });
      s.to(["g*"], { opacity: 1 }, { at: "60%", dur: 0.4 });
      s.pulse(["db", "th"], { at: "70%", color: "teal" });
    }},
    { say: "وعندما يوافق الإنسان، نستأنف بـ Command(resume=True) مع الـ thread_id نفسه فتكمل الخطوة التالية.", eq: "@T{app.invoke}(@G{Command(resume=True)}, @; @C{thread@_id})", do: s => {
      s.out(["ask", "rst"], { at: "0%", dur: 0.3 });
      s.box("hum", { x: 1250, y: 615, w: 320, h: 72, label: "Human: Approved ✓", icon: "user", inline: true, size: 22, color: "green" }, { at: "18%" });
      s.flow("hum", "g2", { color: "green", at: "38%" });
      s.to("g2", { glow: 0, stroke: "green", label: "approve ✓" }, { at: "52%", dur: 0.4 });
      s.stream("g2", "g3", { at: "62%", span: 1.8, every: 0.6, color: "green" });
      s.mark("ok3", "g3", "check", { at: "82%" });
    }},
    { sec: "الكود العملي", say: "وفي كود LangGraph: نضع interrupt داخل عقدة الموافقة، ونربط PostgresSaver عند الجمع.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("cd", { x: 800, y: 525, size: 22, title: "approval.py", lines: [
        "def approve(state):",
        "    ok = interrupt({\"refund\": state[\"amount\"]})",
        "    return {\"approved\": ok}",
        "",
        "app = g.compile(checkpointer=PostgresSaver(conn))",
        "cfg = {\"configurable\": {\"thread_id\": \"order-812\"}}",
        "app.invoke(inp, cfg)                    # pauses cleanly",
        "app.invoke(Command(resume=True), cfg)   # resumes!"
      ] }, { at: "8%", dur: 1.8 });
      s.to("cd", { hl: 1 }, { at: "52%", dur: 0.25 });
      s.to("cd", { hl: 4 }, { at: "76%", dur: 0.25 });
    }},
    { say: "الاستدعاء الأول يتوقف عند interrupt، والثاني يستأنف بالـ thread_id نفسه من النقطة نفسها.", do: s => {
      s.to("cd", { hl: 5 }, { at: "15%", dur: 0.25 });
      s.to("cd", { hl: 6 }, { at: "46%", dur: 0.25 });
      s.to("cd", { hl: 7 }, { at: "76%", dur: 0.25 });
    }},
    { sec: "في الإنتاج", say: "احذر من استخدام InMemorySaver في الإنتاج؛ لأنه يمسح كل المحادثات عند أول إعادة تشغيل!", do: s => {
      s.clear({ dur: 0.4 });
      s.versus("vs", "InMemorySaver (Dev Only)", "PostgresSaver (Production)", { colors: ["red", "green"] }, { at: "0%" });
      s.col("im", ["Lost on server restart", "Breaks with 2+ replicas", "Dev & unit tests only"], { x: 440, y: 545, w: 460, size: 24, icons: ["x", "alert", "flask"], colors: ["red", "red", "dim"] }, { at: "25%", st: 0.22 });
      s.col("pg", ["Survives restarts & deploys", "Shared across all workers", "Audit trail + time travel"], { x: 1160, y: 545, w: 460, size: 24, icons: ["check", "server", "history"], colors: ["green", "teal", "blue"] }, { at: "48%", st: 0.22 });
    }},
    { say: "ومع PostgresSaver يمكنك أيضًا استرجاع أي لقطة سابقة لتصحيح الأخطاء (Time Travel).", do: s => {
      s.focus(["vsR", "pg*"], { at: "15%", zoom: 1.1 });
      s.badge("tt", { x: 1160, y: 760, text: "Durable + Multi-replica + Time Travel ✓", color: "green", size: 21 }, { at: "48%" });
    }},
    { sec: "الخلاصة", say: "الخلاصة: احفظ كل خطوة بـ PostgresSaver، ونظّم بـ thread_id، وأوقف القرارات الحساسة بـ interrupt.", eq: "@C{PostgresSaver} + @Y{thread@_id} + @G{interrupt / resume}", do: s => {
      s.clear({ dur: 0.4 });
      s.chain("sum", ["Step Snapshot", "thread_id", "interrupt()", "Command(resume)"], { y: 525, gap: 55, icons: ["save", "idcard", "pause", "play"], colors: ["teal", "blue", "gold", "green"], w: 280, h: 155, size: 23, pulse: true }, { at: "12%", st: 0.18 });
    }}
  ]);

  // ------------------------------------------------------------------ 6.4 Failure Recovery & Workflow Streaming
  X.lesson("6.4", [
    { sec: "أعطال الإنتاج", say: "في الإنتاج، تتعرض العقدة لمهلة شبكة أو 429 Rate Limit، بينما ينتظر المستخدم أمام شاشة جامدة.", do: s => {
      s.box("n", { x: 450, y: 470, w: 260, h: 108, label: "call_model", font: "mono", icon: "cpu", inline: true, size: 24, color: "blue" }, { at: "8%" });
      s.box("api", { x: 1150, y: 470, w: 250, h: 108, label: "LLM API", icon: "cloud", inline: true, size: 25, color: "dim" }, { at: "20%" });
      s.link("na", "n", "api", { color: "blue", pulse: true }, { at: "28%" });
      s.flow("n", "api", { color: "blue", at: "34%" });
      s.badge("err", { x: 1150, y: 620, text: "429 Rate Limit / Timeout ✗", color: "red", size: 23 }, { at: "58%" });
      s.callout("spin", { x: 450, y: 690, label: "User sees 20s frozen spinner…", icon: "hourglass", color: "orange" }, { at: "74%" });
    }},
    { sec: "إعادة المحاولة", say: "للأعطال المؤقتة نُفعّل RetryPolicy مع تراجع أُسّي تدريجي (Backoff) قبل الاستسلام.", eq: "@T{RetryPolicy}(@T{max@_attempts}=3, @; @O{backoff}=2@times)", do: s => {
      s.out(["err", "spin"], { at: "0%", dur: 0.3 });
      ["retry #1 · 1s", "retry #2 · 2s", "200 OK ✓"].forEach((t, i) => {
        s.box("rt" + i, { x: 520 + i * 280, y: 710, w: 230, h: 68, label: t, size: 22, color: i === 2 ? "green" : "orange" }, { at: 0.25 + i * 0.42 });
      });
      s.link("r01", "rt0", "rt1", { color: "orange" }, { at: "45%" });
      s.link("r12", "rt1", "rt2", { color: "green", pulse: true }, { at: "68%" });
      s.to("api", { stroke: "green" }, { at: "78%", dur: 0.35 });
    }},
    { say: "هكذا تمتص العقدة التقلبات العابرة بهدوء دون إسقاط سير العمل كله.", do: s => {
      s.focus(["n", "api", "rt2"], { at: "10%", zoom: 1.12 });
      s.stream("n", "api", { at: "30%", span: 2.2, every: 0.6, color: "green" });
      s.mark("okapi", "api", "check", { at: "70%" });
    }},
    { sec: "الاستئناف من الحفظ", say: "أما إن تعطّل الخادم نفسه في الخطوة الرابعة، فلا نعيد الخطوات الثلاث الأولى المكلفة!", eq: "@T{crash at step 4} @Rightarrow @G{resume from step 3}", do: s => {
      s.clear({ dur: 0.4 });
      s.chain("g", ["load", "retrieve", "draft", "review", "send"], { y: 440, gap: 55, colors: ["blue", "blue", "blue", "blue", "blue"], w: 205, h: 82, size: 24, pulse: true }, { at: "8%", st: 0.14 });
      [0, 1, 2].forEach(i => s.icon("s" + i, { name: "save", x: s.get("g" + i).x, y: 550, s: 44, color: "teal" }, { at: 0.7 + i * 0.14 }));
      s.to("g3", { stroke: "red", label: "crash ✗" }, { at: "62%", dur: 0.35 });
      s.badge("skip", { x: 520, y: 690, text: "Steps 1–3 already saved — zero re-spend ✓", color: "teal", size: 22 }, { at: "76%" });
    }},
    { say: "بل نستأنف فورًا من آخر Checkpoint سليم فتكمل العقدة الرابعة والخامسة بنجاح.", do: s => {
      s.focus(["g2", "g3", "g4"], { at: "0%", zoom: 1.15, keep: ["s2"] });
      s.arrow("res", { x1: s.get("g2").x, y1: 635, x2: s.get("g3").x, y2: 635, color: "green", label: "resume", pulse: true }, { at: "20%" });
      s.to("g3", { stroke: "green", label: "review ✓" }, { at: "48%", dur: 0.4 });
      s.stream("g3", "g4", { at: "58%", span: 1.6, every: 0.55, color: "green" });
      s.mark("ok4", "g4", "check", { at: "80%" });
    }},
    { sec: "بث التقدم للمستخدم", say: "ولتحسين تجربة المستخدم، ابثّ أحداث العُقد مباشرة للواجهة بدل الانتظار الصامت.", eq: "@T{graph.stream}(@T{inp}, @; @C{stream@_mode=\"updates\"})", do: s => {
      s.clear({ dur: 0.4 });
      s.box("gr", { x: 370, y: 530, w: 280, h: 140, label: "LangGraph", sub: "stream updates", icon: "stream", color: "teal", size: 27 }, { at: "8%" });
      s.zone("ui", { x: 1090, y: 530, w: 600, h: 430, label: "Live UI Progress (SSE)", color: "blue" }, { at: "18%" });
      s.link("st", "gr", "ui", { color: "teal", label: "SSE events", pulse: true }, { at: "26%" });
      ["✓ 1. Classified as refund", "✓ 2. Loaded order #812", "… 3. Drafting grounded reply"].forEach((t, i) => {
        s.box("ev" + i, { x: 1090, y: 420 + i * 115, w: 510, h: 72, label: t, size: 23, color: i < 2 ? "green" : "gold", font: "ui" }, { at: 0.8 + i * 0.65, in: "slide", from: { dy: 20 } });
        s.flow("gr", "ev" + i, { color: i < 2 ? "green" : "gold", at: 0.65 + i * 0.65 });
      });
    }},
    { say: "يرى المستخدم كل خطوة تنجز أمامه، ويشعر بسرعة النظام وثقته.", do: s => {
      s.to("ev2", { stroke: "green", label: "✓ 3. Reply ready to send" }, { at: "30%", dur: 0.45 });
      s.stream("gr", "ui", { at: "20%", span: 2.2, every: 0.65, color: "green" });
      s.badge("ux", { x: 370, y: 715, text: "Perceived speed ↑↑ · Users can cancel", color: "green", size: 21 }, { at: "60%" });
    }},
    { sec: "الرسوم الفرعية", say: "وعندما يكبر التدفق، قسّمه إلى رسوم فرعية (Subgraphs) منظّمة وقابلة لإعادة الاستخدام.", eq: "@T{Parent Graph} = @C{Retrieval} + @B{Drafting} + @Y{Review}", do: s => {
      s.clear({ dur: 0.4 });
      for (let i = 0; i < 9; i++) {
        s.box("b" + i, { x: 320 + (i % 3) * 145, y: 400 + Math.floor(i / 3) * 120, w: 118, h: 64, label: "node", size: 19, color: "dim" }, { at: 0.12 + i * 0.04 });
      }
      s.arrow("tr", { x1: 710, y1: 520, x2: 890, y2: 520, color: "teal", label: "modularize", pulse: true }, { at: "40%" });
      ["Retrieval Subgraph", "Drafting Subgraph", "Review Subgraph"].forEach((t, i) => {
        s.box("sg" + i, { x: 1160, y: 390 + i * 135, w: 360, h: 86, label: t, icon: "box", inline: true, size: 23, color: ["teal", "blue", "gold"][i] }, { at: 1.0 + i * 0.22 });
      });
      s.link("sg01", "sg0", "sg1", { color: "soft" }, { at: "74%" });
      s.link("sg12", "sg1", "sg2", { color: "soft" }, { at: "80%" });
    }},
    { sec: "الكود العملي", say: "وفي الكود: اربط RetryPolicy بعقدة النموذج، ثم بثّ الأحداث بـ stream_mode='updates'.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("cd", { x: 800, y: 525, size: 22, title: "resilient_graph.py", lines: [
        "g.add_node(\"call_model\", call_model,",
        "    retry=RetryPolicy(max_attempts=3, backoff_factor=2.0))",
        "app = g.compile(checkpointer=PostgresSaver(conn))",
        "",
        "for event in app.stream(inp, cfg, stream_mode=\"updates\"):",
        "    send_sse_to_ui(event)"
      ] }, { at: "8%", dur: 1.7 });
      s.to("cd", { hl: 1 }, { at: "52%", dur: 0.25 });
      s.to("cd", { hl: 4 }, { at: "76%", dur: 0.25 });
    }},
    { say: "انتبه: لا تعِد محاولة عقدة تُرسل بريدًا أو تسترد مالًا إلا مع مفتاح Idempotency!", do: s => {
      s.to("cd", { y: 410, scale: 0.88 }, { at: "0%", dur: 0.5 });
      s.callout("pit", { x: 800, y: 710, label: "Retry transient API reads freely — guard side-effect writes!", icon: "shield", color: "orange" }, { at: "35%" });
    }},
    { sec: "الخلاصة", say: "الخلاصة: Retry للأعطال العابرة، وCheckpoint للاستئناف، وبث updates للواجهة، وSubgraphs للتنظيم.", eq: "@O{Retry} + @G{Resume} + @C{Stream} + @B{Subgraphs}", do: s => {
      s.clear({ dur: 0.4 });
      s.chain("sum", ["Retry Backoff", "Checkpoint Resume", "Stream Updates", "Subgraphs"], { y: 525, gap: 55, icons: ["refresh", "save", "stream", "box"], colors: ["orange", "green", "teal", "blue"], w: 280, h: 155, size: 22, pulse: true }, { at: "12%", st: 0.18 });
    }}
  ]);

  // ------------------------------------------------------------------ 7.1 Agent Loops & ReAct
  X.lesson("7.1", [
    { sec: "مهمة مفتوحة", say: "عميل يسأل: لماذا تأخر طلبي 812 وهل أستحق تعويضًا؟ عدد الخطوات هنا غير معروف مسبقًا.", do: s => {
      s.bubble("q", { text: "Why is order #812 late, and do I qualify for a voucher?", side: "u", x: 800, y: 315, w: 680, size: 25 }, { at: "8%" });
      s.grid("uk", ["Check order?", "Check carrier?", "Read delay policy?", "Calculate voucher?"], { cols: 4, y: 540, cw: 330, ch: 92, size: 22, colors: ["blue", "teal", "gold", "purple"] }, { at: "38%", st: 0.14 });
      s.callout("why", { x: 800, y: 725, label: "Dynamic steps → we need an Agent Loop, not a fixed script", icon: "loop", color: "gold" }, { at: "70%" });
    }},
    { sec: "حلقة ReAct", say: "حلقة الوكيل بأسلوب ReAct بسيطة: لاحِظ الحالة، ثم قرّر الفعل، ثم نفّذ الأداة، ثم لاحِظ النتيجة.", eq: "@C{observe} @to @P{decide} @to @O{act} @to @C{observe}", do: s => {
      s.clear({ dur: 0.4 });
      s.ring("lp", { x: 470, y: 535, r: 190, color: "faint", arrows: 3 }, { at: "8%" });
      ringNodes(s, "n", ["observe", "decide", "act"], 470, 535, 190, ["teal", "purple", "orange"], { at: "16%" });
      s.zone("mem", { x: 1170, y: 535, w: 560, h: 490, label: "Working Trace", color: "blue" }, { at: "36%" });
      s.to("lp", { spin: 180 }, { at: "45%", dur: 2.2, ease: "lin" });
    }},
    { say: "في الدورة الأولى، يقرر الوكيل فحص الطلب 812، فيتلقى ملاحظة أنه متأخر خمسة أيام.", do: s => {
      s.pulse("n1", { at: "8%", color: "purple" });
      s.box("m0", { x: 1170, y: 390, w: 480, h: 68, label: "1. act → get_order(812)", font: "mono", size: 21, color: "orange" }, { at: "20%" });
      s.flow("n2", "m0", { color: "orange", at: "26%" });
      s.pulse("n0", { at: "52%", color: "teal" });
      s.box("m1", { x: 1170, y: 485, w: 480, h: 68, label: "1. obs ← delayed 5 days", font: "mono", size: 21, color: "teal" }, { at: "58%" });
      s.to("lp", { spin: 360 }, { at: "20%", dur: 2.4, ease: "lin" });
    }},
    { say: "وفي الدورة الثانية يقرأ سياسة التأخير، فيجد قسيمة 20 دولارًا ويصوغ الإجابة النهائية.", do: s => {
      s.box("m2", { x: 1170, y: 580, w: 480, h: 68, label: "2. act → delay_policy(days=5)", font: "mono", size: 20, color: "orange" }, { at: "15%" });
      s.box("m3", { x: 1170, y: 675, w: 480, h: 68, label: "2. obs ← $20 voucher eligible ✓", font: "mono", size: 20, color: "green" }, { at: "52%" });
      s.flow("n2", "m2", { color: "orange", at: "22%" });
      s.flow("m3", "n0", { color: "green", at: "62%" });
      s.to("lp", { spin: 540 }, { at: "15%", dur: 2.4, ease: "lin" });
    }},
    { sec: "شروط التوقف", say: "ومتى تنتهي الحلقة؟ بإجابة نهائية، أو بلوغ الميزانية، أو الوصول إلى بوابة موافقة بشرية.", eq: "@T{stop} @in @{ @G{answer}, @; @R{budget}, @; @Y{approval} @}", do: s => {
      s.out(["mem", "m*"], { at: "0%", dur: 0.35 });
      s.col("ex", ["Final answer ready", "Budget limit reached", "Human approval gate"], { x: 1160, y: 500, size: 26, icons: ["flag", "coin", "hand"], colors: ["green", "red", "gold"], w: 430 }, { at: "22%", st: 0.22 });
      [0, 1, 2].forEach(i => s.link("el" + i, "lp", "ex" + i, { color: ["green", "red", "gold"][i], pulse: true }, { at: 0.55 + i * 0.2 }));
    }},
    { say: "والميزانية تحمي تطبيقك من الكلفة غير المتوقعة: حد للخطوات والـ Tokens والوقت.", do: s => {
      s.focus(["ex1", "el1"], { at: "10%", zoom: 1.12, keep: ["lp", "n*"] });
      s.callout("bdg", { x: 800, y: 785, label: "Hard caps: max_steps ≤ 12 · max_tokens ≤ 40k · timeout ≤ 60s", icon: "shield", color: "red" }, { at: "42%" });
    }},
    { sec: "منع الدوران", say: "أشهر عطل للوكلاء: أن يعلق في حلقة مفرغة يكرر فيها الاستدعاء نفسه بلا جدوى.", do: s => {
      s.clear({ dur: 0.4 });
      [0, 1, 2].forEach(i =>
        s.box("rp" + i, { x: 800, y: 345 + i * 105, w: 600, h: 72, label: `call #${i + 1}: search("refund policy 2019")`, font: "mono", size: 22, color: "red" }, { at: 0.2 + i * 0.42 })
      );
      s.badge("cnt", { x: 1280, y: 450, text: "3× identical!", color: "red", size: 24 }, { at: "68%" });
    }},
    { say: "فاكتشف الأفعال المتطابقة المتكررة برمجيًا، وأوقفها أو أرسل تلميحًا يغيّر مسار الوكيل.", eq: "@T{same action} @times 3 @Rightarrow @Y{hint or stop}", do: s => {
      s.box("det", { x: 800, y: 730, w: 660, h: 86, label: "Loop Detector: repeated hash 3× → halt / inject hint", icon: "alert", inline: true, size: 22, color: "gold" }, { at: "20%" });
      s.link("dl", "rp2", "det", { color: "gold", pulse: true }, { at: "34%" });
      s.mark("mk", "det", "check", { at: "70%" });
    }},
    { sec: "التعافي من الأخطاء", say: "وعندما تفشل أداة بسبب معامل خاطئ، لا تُنهِر التطبيق — أعد رسالة الخطأ للوكيل كملاحظة!", eq: "@R{tool error} @to @C{observation} @to @G{self-correct}", do: s => {
      s.clear({ dur: 0.4 });
      s.box("c1", { x: 450, y: 395, w: 410, h: 74, label: "get_order(\"812A\")", font: "mono", size: 23, color: "orange" }, { at: "10%" });
      s.box("e1", { x: 1130, y: 395, w: 480, h: 74, label: "error: order_id must be numeric", size: 22, color: "red", font: "ui" }, { at: "34%" });
      s.link("l1", "c1", "e1", { color: "red", pulse: true }, { at: "26%" });
      s.box("c2", { x: 450, y: 605, w: 410, h: 74, label: "get_order(812)", font: "mono", size: 23, color: "teal" }, { at: "58%" });
      s.box("e2", { x: 1130, y: 605, w: 480, h: 74, label: "shipped · delayed 5 days ✓", size: 22, color: "green", font: "ui" }, { at: "76%" });
      s.link("l2", "e1", "c2", { color: "gold", label: "agent fixes input", pulse: true }, { at: "50%" });
      s.link("l3", "c2", "e2", { color: "green", pulse: true }, { at: "70%" });
    }},
    { say: "هكذا يقرأ الوكيل الخطأ الواضح ويصحح المدخل من تلقاء نفسه في الدورة التالية.", do: s => {
      s.focus(["c2", "e2", "l3"], { at: "10%", zoom: 1.12, keep: ["e1", "l2"] });
      s.callout("errn", { x: 800, y: 780, label: "Actionable tool errors turn crashes into smooth recovery ✓", icon: "check", color: "green" }, { at: "45%" });
    }},
    { sec: "التتبع", say: "وسجّل كل دورة في Trace منظم: القرار والأداة والنتيجة والزمن والـ Tokens لتصحيح أي خطأ بسرعة.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("tr", { x: 800, y: 530, size: 21, title: "agent_trace.log", lines: [
        "step 1  decide  → get_order(\"812A\")",
        "step 1  observe ← is_error: order_id must be numeric",
        "step 2  decide  → get_order(812)",
        "step 2  observe ← delayed 5 days · $20 voucher",
        "step 3  answer  · stop=end_turn · 3.4s · 1,920 tokens"
      ] }, { at: "8%", dur: 1.7 });
      s.to("tr", { hl: 1 }, { at: "52%", dur: 0.25 });
      s.to("tr", { hl: 4 }, { at: "78%", dur: 0.25 });
    }},
    { sec: "الخلاصة", say: "الخلاصة: حلقة ReAct فعّالة تحتاج ميزانيات صارمة، وكاشف دوران، وتعافيًا من الأخطاء، وتتبعًا كاملًا.", eq: "@C{ReAct} + @R{Budgets} + @Y{Loop Guard} + @G{Trace}", do: s => {
      s.clear({ dur: 0.4 });
      s.chain("sum", ["ReAct Loop", "Hard Budgets", "Loop & Error Guard", "Full Trace"], { y: 525, gap: 55, icons: ["loop", "coin", "shieldok", "list"], colors: ["teal", "red", "gold", "green"], w: 280, h: 155, size: 22, pulse: true }, { at: "12%", st: 0.18 });
    }}
  ]);

  // ------------------------------------------------------------------ 7.2 Reliable Tool Design
  X.lesson("7.2", [
    { sec: "أداة = مهمة واحدة", say: "عندما تعطي الوكيل أداة غامضة مثل do_stuff، يرتبك في المعاملات ويفشل باستمرار.", do: s => {
      s.box("bad", { x: 420, y: 520, w: 430, h: 118, label: "do_stuff(action, data)", sub: "vague · 15 hidden modes", font: "mono", size: 22, color: "red" }, { at: "8%" });
      s.mark("bx", "bad", "x", { at: "34%" });
      s.arrow("tr", { x1: 660, y1: 520, x2: 860, y2: 520, color: "green", label: "split cleanly", pulse: true }, { at: "46%" });
      s.col("good", ["get_order(id)", "cancel_order(id)", "refund_order(id, amount)"], { x: 1140, y: 520, size: 23, font: "mono", w: 460, icons: ["search", "x", "dollar"], colors: ["green", "teal", "gold"] }, { at: "54%", st: 0.16 });
    }},
    { say: "أما الأداة الصغيرة ذات المهمة الواحدة والاسم الواضح والمخطط الصارم، فيختارها الوكيل بدقة عالية.", eq: "@T{1 tool} = @G{1 clear job + strict schema}", do: s => {
      s.focus(["good*"], { at: "10%", zoom: 1.12 });
      s.callout("ok", { x: 1140, y: 765, label: "Clear name + typed schema = reliable tool calls ✓", icon: "check", color: "green" }, { at: "45%" });
    }},
    { sec: "القراءة والكتابة", say: "افصل دائمًا بين أدوات القراءة وأدوات الكتابة: القراءة لا تغيّر شيئًا وآمنة لإعادة المحاولة.", do: s => {
      s.clear({ dur: 0.4 });
      s.versus("vs", "Read Tools (Safe)", "Write Tools (Guarded)", { colors: ["green", "red"] }, { at: "0%" });
      s.col("rd", ["get_order(id)", "search_docs(q)", "check_balance(uid)"], { x: 440, y: 520, font: "mono", size: 23, w: 440, icons: ["eye", "search", "db"], colors: ["green", "green", "green"] }, { at: "25%", st: 0.18 });
      s.badge("rb", { x: 440, y: 740, text: "Safe to auto-run & retry ✓", color: "green", size: 22 }, { at: "68%" });
    }},
    { say: "أما أدوات الكتابة مثل الاسترداد وإرسال البريد، فتغيّر العالم الخارجي وتحتاج صلاحيات وحماية.", eq: "@G{read} @to @T{auto} @qquad @R{write} @to @Y{guard + idempotency}", do: s => {
      s.col("wr", ["refund_order(id, amt)", "send_email(to, body)", "cancel_subscription(id)"], { x: 1160, y: 520, font: "mono", size: 22, w: 460, icons: ["dollar", "mail", "alert"], colors: ["red", "red", "red"] }, { at: "15%", st: 0.18 });
      s.badge("wb", { x: 1160, y: 740, text: "Side effects → permissions + guards", color: "red", size: 22 }, { at: "62%" });
    }},
    { sec: "خطر التكرار", say: "تخيّل أن الوكيل استدعى refund_order لمبلغ 50 دولارًا، لكن الشبكة انقطعت قبل وصول الرد.", do: s => {
      s.clear({ dur: 0.4 });
      s.box("ag", { x: 350, y: 495, w: 230, h: 130, label: "Agent", icon: "bot", color: "purple", size: 27 }, { at: "8%" });
      s.box("pay", { x: 1230, y: 495, w: 270, h: 130, label: "Payments API", icon: "dollar", color: "orange", size: 26 }, { at: "18%" });
      s.link("ap", "ag", "pay", { color: "orange", label: "refund($50)", pulse: true }, { at: "28%" });
      s.flow("ag", "pay", { color: "orange", at: "38%" });
      s.badge("to", { x: 790, y: 610, text: "Response timed out…", color: "orange", size: 22 }, { at: "68%" });
    }},
    { say: "فيظن الوكيل أن الطلب فشل ويعيد المحاولة، فيُخصم 50 دولارًا مرتين من حسابك!", do: s => {
      s.out("to", { at: "0%", dur: 0.25 });
      s.stream("ag", "pay", { at: "15%", span: 1.6, every: 0.55, color: "red" });
      s.box("dbl", { x: 1230, y: 725, w: 390, h: 72, label: "$50 refunded TWICE ($100) ✗", size: 23, color: "red" }, { at: "52%" });
      s.mark("dx", "pay", "x", { at: "68%" });
    }},
    { sec: "مفتاح Idempotency", say: "الحل: أرفِق مفتاح Idempotency فريدًا مع كل طلب كتابة، فيتعرّف الخادم على التكرار.", eq: "@T{refund}(@T{id}, @; @C{key}=k) @times 2 = @G{1 refund}", do: s => {
      s.out(["dbl", "dx"], { at: "0%", dur: 0.3 });
      s.box("key", { x: 790, y: 345, w: 420, h: 64, label: "Idempotency-Key: r-812-1", font: "mono", size: 22, color: "teal" }, { at: "12%" });
      s.to("ap", { color: "teal" }, { at: "20%", dur: 0.3 });
      s.stream("ag", "pay", { at: "32%", span: 2.0, every: 0.65, color: "teal" });
      s.box("once", { x: 1230, y: 725, w: 420, h: 72, label: "2nd call → \"already done\" ✓", size: 22, color: "green" }, { at: "65%" });
      s.mark("dok", "pay", "check", { at: "78%" });
    }},
    { say: "هكذا يعيد الخادم النتيجة المحفوظة للاستدعاء الثاني دون تنفيذ أي خصم أو بريد إضافي.", do: s => {
      s.focus(["key", "pay", "once"], { at: "10%", zoom: 1.12 });
      s.callout("idn", { x: 520, y: 725, label: "Safe retries even on flaky networks ✓", icon: "shieldok", color: "teal" }, { at: "45%" });
    }},
    { sec: "نتائج مختصرة", say: "ولا تُرجع تفريغًا خامًا من 4000 سطر JSON؛ فهذا يبتلع الـ Tokens ويشتّت النموذج.", do: s => {
      s.clear({ dur: 0.4 });
      s.doc("raw", { x: 400, y: 495, w: 220, h: 290, lines: 12, title: "4,000-line raw JSON", color: "red" }, { at: "8%" });
      s.arrow("ar", { x1: 560, y1: 495, x2: 860, y2: 495, color: "green", label: "filter + summarize", pulse: true }, { at: "32%" });
      s.box("sum", { x: 1150, y: 495, w: 480, h: 145, label: "order #812: shipped\nETA Friday · 2 items · $140", size: 24, color: "green" }, { at: "52%" });
      s.bars("tok", [["Raw dump", 0.94, "red", "14,200 tokens"], ["Concise DTO", 0.06, "green", "42 tokens"]], { x: 640, y: 775, w: 440, gap: 58, size: 23, h: 26 }, { at: "68%" });
    }},
    { sec: "الكود العملي", say: "انظر كود أداة الاسترداد: تتحقق من مفتاح Idempotency أولًا، وتعيد ملخصًا مختصرًا فقط.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("cd", { x: 800, y: 530, size: 22, title: "refund_tool.py", lines: [
        "def refund_order(order_id: int, amount: float, key: str):",
        "    if prev := db.find_by_idempotency_key(key):",
        "        return prev.summary          # already done!",
        "    tx = payments.refund(order_id, amount, key=key)",
        "    return {\"status\": \"refunded\", \"order\": order_id,",
        "            \"amount\": tx.amount, \"tx_id\": tx.id}"
      ] }, { at: "8%", dur: 1.7 });
      s.to("cd", { hl: 1 }, { at: "52%", dur: 0.25 });
      s.to("cd", { hl: 4 }, { at: "78%", dur: 0.25 });
    }},
    { say: "دالة قصيرة، محمية من التكرار، ومخرجاتها نظيفة جاهزة لاستهلاك الوكيل فورًا.", do: s => {
      s.to("cd", { hl: 2 }, { at: "20%", dur: 0.25 });
      s.badge("okc", { x: 800, y: 785, text: "Atomic + Idempotent + Concise JSON ✓", color: "green", size: 23 }, { at: "55%" });
    }},
    { sec: "الخلاصة", say: "الخلاصة: أداة واحدة لكل مهمة، وفصل القراءة عن الكتابة، ومفتاح Idempotency، ونتائج مختصرة.", eq: "@T{1 Job} + @G{Read}/@R{Write} + @C{Idempotency} + @Y{Concise}", do: s => {
      s.clear({ dur: 0.4 });
      s.chain("sum", ["One Clear Job", "Read vs Write", "Idempotency Key", "Concise Output"], { y: 525, gap: 55, icons: ["tool", "shield", "key", "filter"], colors: ["blue", "orange", "teal", "green"], w: 280, h: 155, size: 23, pulse: true }, { at: "12%", st: 0.18 });
    }}
  ]);

  // ------------------------------------------------------------------ 7.3 Controlled Agency, Approvals & Multi-Agent
  X.lesson("7.3", [
    { sec: "استقلالية بلا حدود", say: "وكيل بصلاحيات مفتوحة على قاعدة البيانات والبريد قد يحذف حسابًا بسبب رسالة مخادعة!", do: s => {
      s.box("ag", { x: 400, y: 525, w: 230, h: 130, label: "Unchecked\nAgent", icon: "bot", color: "red", size: 25 }, { at: "8%" });
      s.col("tls", ["read_order()", "refund_order()", "delete_account()"], { x: 1120, y: 525, w: 380, font: "mono", size: 24, icons: ["eye", "dollar", "trash"], colors: ["green", "gold", "red"] }, { at: "24%", st: 0.15 });
      [0, 1, 2].forEach(i => s.link("al" + i, "ag", "tls" + i, { color: i === 2 ? "red" : "dim", pulse: i === 2 }, { at: 0.45 + i * 0.12 }));
      s.stream("ag", "tls2", { at: "55%", span: 2.0, every: 0.6, color: "red" });
      s.badge("inc", { x: 800, y: 785, text: "Unbounded agency = production incident ✗", color: "red", size: 23 }, { at: "70%" });
    }},
    { sec: "تصنيف الأفعال", say: "لذلك نبدأ بتصنيف كل فعل إلى ثلاث فئات: آمن تلقائيًا، ويحتاج موافقة، وممنوع نهائيًا.", eq: "@T{actions} = @G{safe} @; @cup @; @Y{approval} @; @cup @; @R{forbidden}", do: s => {
      s.clear({ dur: 0.4 });
      s.grid("cat", ["Safe (Auto)", "Needs Approval", "Forbidden"], { cols: 3, y: 315, cw: 390, ch: 82, size: 28, icons: ["check", "hand", "ban"], inline: true, colors: ["green", "gold", "red"] }, { at: "10%", st: 0.18 });
    }},
    { say: "القراءة والبحث آمنان، والاسترداد والبريد يحتاجان موافقة بشرية، وحذف الحسابات ممنوع تمامًا.", do: s => {
      ["read_order", "search_docs"].forEach((t, i) => s.box("a" + i, { x: s.get("cat0").x, y: 475 + i * 105, w: 340, h: 72, label: t, font: "mono", size: 23, color: "green" }, { at: 0.15 + i * 0.16 }));
      ["refund_money", "email_customer"].forEach((t, i) => s.box("b" + i, { x: s.get("cat1").x, y: 475 + i * 105, w: 340, h: 72, label: t, font: "mono", size: 23, color: "gold" }, { at: 0.55 + i * 0.16 }));
      ["delete_account", "change_prices"].forEach((t, i) => s.box("c" + i, { x: s.get("cat2").x, y: 475 + i * 105, w: 340, h: 72, label: t, font: "mono", size: 23, color: "red" }, { at: 0.95 + i * 0.16 }));
      s.callout("pol", { x: 800, y: 760, label: "Never even register FORBIDDEN tools in the agent schema!", icon: "lock", color: "red" }, { at: "74%" });
    }},
    { sec: "الحدود الصارمة", say: "ونفرض حدودًا صارمة على أربعة أبعاد: الخطوات والـ Tokens والوقت والمال لكل تشغيل.", eq: "@T{steps} @le 20, @; @T{tokens} @le 50k, @; @T{time} @le 2@T{m}, @; @T{spend} @le @$5", do: s => {
      s.clear({ dur: 0.4 });
      const items = [["steps", 0.45, "teal", "≤ 20"], ["tokens", 0.65, "blue", "≤ 50k"], ["time", 0.35, "orange", "≤ 2 min"], ["money", 0.5, "gold", "≤ $5"]];
      items.forEach(([t, v, c, cap], i) => {
        const x = 310 + i * 326;
        s.gauge("g" + i, { x, y: 500, r: 105, v: 0, color: c, label: t }, { at: 0.12 + i * 0.14 });
        s.to("g" + i, { v }, { at: 0.45 + i * 0.14, dur: 0.9 });
        s.badge("gb" + i, { x, y: 660, text: cap, color: c, size: 22 }, { at: 0.7 + i * 0.12 });
      });
    }},
    { say: "وفور اقتراب أي عدّاد من سقفه، يوقف النظام الحلقة تلقائيًا ويعيد تقريرًا بما أنجزه.", do: s => {
      s.to("g1", { v: 0.98, color: "red" }, { at: "15%", dur: 0.9 });
      s.to("gb1", { color: "red", text: "50k HIT!" }, { at: "52%", dur: 0.2 });
      s.callout("halt", { x: 800, y: 790, label: "Circuit breaker triggers → graceful stop + partial summary ✓", icon: "shieldok", color: "green" }, { at: "62%" });
    }},
    { sec: "تعدد الوكلاء", say: "ومتى نستخدم عدة وكلاء؟ حين يفيد التوازي وعزل السياق، عبر قائد ووكلاء فرعيين.", eq: "@T{Multi-Agent} = @C{Parallelism} - @O{Coordination Cost}", do: s => {
      s.clear({ dur: 0.4 });
      s.box("ld", { x: 800, y: 310, w: 260, h: 82, label: "Lead Agent", icon: "sitemap", inline: true, color: "purple", size: 26 }, { at: "8%" });
      ["Researcher", "Coder", "Reviewer"].forEach((t, i) => {
        s.box("sb" + i, { x: 380 + i * 420, y: 525, w: 260, h: 82, label: t, icon: "bot", inline: true, size: 24, color: "blue" }, { at: 0.3 + i * 0.15 });
        s.link("ll" + i, "ld", "sb" + i, { color: "teal", tail: true, pulse: true }, { at: 0.45 + i * 0.15 });
      });
      s.bars("tr", [["Parallel speedup", 0.8, "green", "faster"], ["Coordination tokens", 0.62, "orange", "+overhead"]], { x: 640, y: 745, w: 460, gap: 58, size: 23, h: 26 }, { at: "62%" });
    }},
    { say: "والقاعدة الذهبية: كل وكيل فرعي يحصل فقط على أقل عدد من الأدوات اللازمة لمهمته.", do: s => {
      s.out("tr*", { at: "0%", dur: 0.3 });
      [["search_docs", "read_order"], ["edit_code", "run_tests"], ["read_diff only"]].forEach((ts, i) => {
        ts.forEach((t, k) => s.box("tl" + i + k, { x: s.get("sb" + i).x, y: 670 + k * 74, w: 240, h: 56, label: t, font: "mono", size: 20, color: i === 2 ? "green" : "orange" }, { at: 0.25 + i * 0.15 + k * 0.12 }));
      });
      s.focus(["sb2", "tl20"], { at: "62%", zoom: 1.12, keep: ["ld", "ll2"] });
    }},
    { sec: "الفرض بالكود", say: "أخطر خطأ: الاكتفاء بكتابة «لا تحذف الحسابات» في الـ Prompt؛ فالحقن النصي قد يتجاوزها.", do: s => {
      s.clear({ dur: 0.4 });
      s.versus("vs", "حماية بالكلام ✗", "حماية بالكود ✓", { colors: ["red", "green"] }, { at: "0%" });
      s.bubble("pr", { text: "\"Please never delete accounts!\"", side: "s", x: 440, y: 455, w: 450, size: 23, color: "orange" }, { at: "22%" });
      s.badge("byp", { x: 440, y: 640, text: "Prompt injection bypasses prose ✗", color: "red", size: 22 }, { at: "52%" });
      s.box("cg", { x: 1160, y: 495, w: 430, h: 120, label: "Deterministic Tool Gate", sub: "checks POLICY + budgets + HITL", icon: "shieldok", inline: true, size: 23, color: "green" }, { at: "60%" });
      s.mark("cgok", "cg", "check", { at: "78%" });
    }},
    { say: "بل افرض كل الصلاحيات والميزانيات والموافقات في كود طبقة الأدوات خارج سيطرة النموذج.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("gate", { x: 800, y: 530, size: 21, title: "tool_gate.py", lines: [
        "POLICY = {\"read_order\": SAFE, \"refund\": APPROVAL,",
        "          \"delete_account\": FORBIDDEN}",
        "def execute_tool(tool, args, budget):",
        "    if budget.exceeded(): raise BudgetStop()",
        "    if POLICY.get(tool) == FORBIDDEN: raise Denied(tool)",
        "    if POLICY.get(tool) == APPROVAL: interrupt(tool, args)",
        "    return REGISTRY[tool](**args)"
      ] }, { at: "8%", dur: 1.8 });
      s.to("gate", { hl: 3 }, { at: "52%", dur: 0.25 });
      s.to("gate", { hl: 4 }, { at: "76%", dur: 0.25 });
    }},
    { say: "لاحظ: إن كانت الأداة ممنوعة يُرفض الطلب فورًا، وإن احتاجت موافقة تتوقف عند interrupt.", do: s => {
      s.to("gate", { hl: 5 }, { at: "22%", dur: 0.25 });
      s.badge("det", { x: 800, y: 805, text: "100% deterministic enforcement — model cannot bypass ✓", color: "green", size: 22 }, { at: "55%" });
    }},
    { sec: "الخلاصة", say: "الخلاصة: صنّف الأفعال، وحدّد الميزانيات، وقلّص صلاحيات الوكلاء الفرعيين، وافرض كل شيء بالكود.", eq: "@G{3-Tier Policy} + @R{Caps} + @B{Least-Privilege} + @Y{Code Gate}", do: s => {
      s.clear({ dur: 0.4 });
      s.chain("sum", ["3-Tier Policy", "Hard Budgets", "Scoped Subagents", "Code Tool Gate"], { y: 525, gap: 55, icons: ["list", "gauge", "users", "shieldok"], colors: ["gold", "red", "blue", "green"], w: 280, h: 155, size: 22, pulse: true }, { at: "12%", st: 0.18 });
    }}
  ]);

  // ------------------------------------------------------------------ 7.4 Model Context Protocol (MCP)
  X.lesson("7.4", [
    { sec: "مشكلة N × M", say: "بدون معيار موحّد، كل تطبيق ذكي يحتاج وصلة مخصصة لكل أداة؛ فتتضاعف الصيانة بسرعة.", eq: "N @times M @; @R{@T{custom integrations}}", do: s => {
      ["IDE", "Chat App", "Agent"].forEach((t, i) => s.box("ap" + i, { x: 320, y: 375 + i * 165, w: 230, h: 82, label: t, icon: ["code", "chat", "bot"][i], inline: true, size: 24, color: "blue" }, { at: 0.1 + i * 0.12 }));
      ["GitHub", "Postgres", "Slack", "Drive"].forEach((t, i) => s.box("tl" + i, { x: 1280, y: 330 + i * 135, w: 230, h: 76, label: t, icon: ["branch", "db", "mail", "folder"][i], inline: true, size: 23, color: "orange" }, { at: 0.28 + i * 0.1 }));
      let k = 0;
      for (let a = 0; a < 3; a++) for (let b = 0; b < 4; b++) s.link("m" + (k++), "ap" + a, "tl" + b, { color: "red", head: false, w: 1.8 }, { at: 0.7 + k * 0.04 });
    }},
    { say: "ويأتي بروتوكول MCP مثل منفذ USB-C: تبني الخادم مرة واحدة، فيتصل به أي تطبيق فورًا.", eq: "N @times M @; @to @; @C{N + M}", do: s => {
      s.out("m*", { at: "0%", dur: 0.45 });
      s.box("mcp", { x: 800, y: 535, w: 240, h: 120, label: "MCP", sub: "USB-C for AI", icon: "plug", inline: true, color: "teal", size: 32 }, { at: "25%" });
      [0, 1, 2].forEach(i => s.link("a" + i, "ap" + i, "mcp", { color: "teal", head: false, pulse: true }, { at: "48%" }));
      [0, 1, 2, 3].forEach(i => s.link("b" + i, "mcp", "tl" + i, { color: "teal", head: false, pulse: true }, { at: "58%" }));
      s.stream("ap1", "mcp", { at: "68%", span: 1.8, every: 0.6, color: "teal" });
    }},
    { sec: "المعمارية", say: "التطبيق المضيف (Host) يشغّل عملاء MCP، يتصل كل عميل بخادم MCP مستقل.", eq: "@B{Host} @supset @T{Clients} @leftrightarrow @C{Servers}", do: s => {
      s.clear({ dur: 0.4 });
      s.zone("host", { x: 460, y: 515, w: 520, h: 430, label: "Host App (IDE, Chat, Agent)", color: "blue" }, { at: "8%" });
      [0, 1].forEach(i => {
        s.box("cl" + i, { x: 460, y: 440 + i * 165, w: 290, h: 82, label: "MCP Client " + (i + 1), size: 24, color: "blue" }, { at: 0.35 + i * 0.16 });
        s.box("sv" + i, { x: 1180, y: 440 + i * 165, w: 320, h: 82, label: ["Orders Server", "Docs Server"][i], icon: "server", inline: true, size: 23, color: "teal" }, { at: 0.55 + i * 0.16 });
        s.link("cs" + i, "cl" + i, "sv" + i, { color: "teal", tail: true, pulse: true }, { at: 0.75 + i * 0.16 });
      });
    }},
    { say: "وكل خادم يعرض ثلاثة أشياء قياسية: أدوات للتنفيذ، وموارد للقراءة، وأوامر جاهزة (Prompts).", do: s => {
      const caps = [["Tools", "actions", "orange"], ["Resources", "read data", "gold"], ["Prompts", "templates", "purple"]];
      caps.forEach(([t, sub, c], i) => {
        s.box("cap" + i, { x: 920 + i * 260, y: 790, w: 225, h: 84, label: t, sub, size: 22, color: c }, { at: 0.2 + i * 0.22 });
      });
      s.focus(["sv0", "sv1", "cap*"], { at: "62%", zoom: 1.1 });
    }},
    { sec: "بروتوكول JSON-RPC", say: "التخاطب يتم برسائل JSON-RPC؛ ويبدأ العميل باكتشاف الأدوات عبر tools/list.", eq: "@C{initialize} @to @Y{tools/list} @to @G{tools/call}", do: s => {
      s.clear({ dur: 0.4 });
      s.code("rq", { x: 450, y: 525, size: 22, title: "client → server", lines: [
        "{",
        "  \"jsonrpc\": \"2.0\",",
        "  \"id\": 1,",
        "  \"method\": \"tools/list\"",
        "}"
      ] }, { at: "10%", dur: 1.2 });
      s.arrow("ar", { x1: 680, y1: 525, x2: 860, y2: 525, color: "teal", label: "discover", pulse: true }, { at: "42%" });
      s.code("rs", { x: 1160, y: 525, size: 21, title: "server → client", lines: [
        "{\"result\": {\"tools\": [",
        "  {\"name\": \"get_order\",",
        "   \"inputSchema\": {\"id\": \"int\"}},",
        "  {\"name\": \"refund_order\", …}",
        "]}}"
      ] }, { at: "52%", dur: 1.3 });
    }},
    { say: "وبعد الاكتشاف، يطلب النموذج تنفيذ الأداة عبر tools/call فيرد الخادم بالنتيجة المهيكلة.", do: s => {
      s.out(["rq", "rs", "ar"], { at: "0%", dur: 0.3 });
      s.code("rq2", { x: 450, y: 525, size: 21, title: "tools/call", lines: [
        "{\"jsonrpc\": \"2.0\", \"id\": 2,",
        " \"method\": \"tools/call\",",
        " \"params\": {",
        "   \"name\": \"get_order\",",
        "   \"arguments\": {\"id\": 812}}}"
      ] }, { at: "14%", dur: 1.2 });
      s.arrow("ar2", { x1: 710, y1: 525, x2: 880, y2: 525, color: "green", label: "execute", pulse: true }, { at: "46%" });
      s.code("rs2", { x: 1170, y: 525, size: 21, title: "tool result", lines: [
        "{\"result\": {",
        "  \"content\": [{",
        "    \"type\": \"text\",",
        "    \"text\": \"shipped · ETA Fri\"",
        "  }]}}"
      ] }, { at: "56%", dur: 1.2 });
    }},
    { sec: "النواقل القياسية", say: "وتعتمد المواصفة ناقلين قياسيين: stdio للخادم المحلي، وStreamable HTTP للخادم البعيد.", do: s => {
      s.clear({ dur: 0.4 });
      s.versus("vs", "stdio (Local)", "Streamable HTTP (Remote)", { colors: ["green", "blue"] }, { at: "0%" });
      s.icon("i1", { name: "terminal", x: 440, y: 470, s: 96, color: "green" }, { at: "20%" });
      s.col("st1", ["Launched as child process", "stdin / stdout pipes", "Zero open ports ✓"], { x: 440, y: 660, w: 460, size: 22, colors: ["green", "teal", "green"] }, { at: "35%", st: 0.16 });
      s.icon("i2", { name: "globe", x: 1160, y: 470, s: 96, color: "blue" }, { at: "52%" });
      s.col("st2", ["Single endpoint: POST /mcp", "JSON or SSE stream reply", "Multi-user cloud servers"], { x: 1160, y: 660, w: 460, size: 22, colors: ["blue", "purple", "blue"] }, { at: "64%", st: 0.16 });
    }},
    { sec: "الأمان", say: "وعند تشغيل خادم MCP بعيد، لا تتركه مفتوحًا: تحقّق من Origin، وطبّق المصادقة، واربطه بـ localhost.", do: s => {
      s.clear({ dur: 0.4 });
      s.col("sec", ["Validate Origin header (stop DNS rebinding)", "Require OAuth / token authentication", "Bind to 127.0.0.1 for local HTTP servers"], { x: 800, y: 495, size: 25, icons: ["shieldok", "key", "lock"], colors: ["green", "gold", "blue"], w: 720 }, { at: "12%", st: 0.24 });
      [0, 1, 2].forEach(i => s.mark("sk" + i, "sec" + i, "check", { at: 0.8 + i * 0.22 }));
      s.callout("sn", { x: 800, y: 765, label: "Least privilege per MCP server — expose only needed tools", icon: "shield", color: "teal" }, { at: "74%" });
    }},
    { sec: "بناء خادم MCP", say: "وبناء خادم MCP كامل في Python لا يتجاوز بضعة أسطر باستخدام FastMCP.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("cd", { x: 800, y: 530, size: 23, title: "server.py", lines: [
        "from mcp.server.fastmcp import FastMCP",
        "mcp = FastMCP(\"orders\")",
        "",
        "@mcp.tool()",
        "def get_order(order_id: int) -> dict:",
        "    \"\"\"Look up an order status by numeric id.\"\"\"",
        "    return db.orders.get(order_id)",
        "",
        "mcp.run()  # stdio transport by default"
      ] }, { at: "8%", dur: 1.8 });
      s.to("cd", { hl: 1 }, { at: "52%", dur: 0.25 });
      s.to("cd", { hl: 3 }, { at: "76%", dur: 0.25 });
    }},
    { say: "أنواع المعاملات ووثيقة الدالة تتحول تلقائيًا إلى JSON Schema يقرؤه أي عميل MCP.", do: s => {
      s.to("cd", { hl: 5 }, { at: "20%", dur: 0.25 });
      s.to("cd", { hl: 8 }, { at: "62%", dur: 0.25 });
    }},
    { sec: "الخلاصة", say: "الخلاصة: MCP يختصر N×M إلى N+M، عبر JSON-RPC وناقلي stdio وStreamable HTTP وبأمان صريح.", eq: "@C{MCP}: @; N+M @; · @; @T{JSON-RPC} @; · @; @G{stdio} / @B{HTTP}", do: s => {
      s.clear({ dur: 0.4 });
      s.chain("sum", ["Host & Clients", "JSON-RPC", "stdio / HTTP", "Tools · Res · Prompts"], { y: 525, gap: 55, icons: ["plug", "code", "globe", "server"], colors: ["blue", "teal", "gold", "green"], w: 280, h: 155, size: 22, pulse: true }, { at: "12%", st: 0.18 });
    }}
  ]);

  // ------------------------------------------------------------------ A3.1 Contextual Retrieval
  X.lesson("A3.1", [
    { sec: "المقطع المعزول", say: "انظر هذا المقطع المعزول: «ارتفعت الإيرادات 3% عن الربع السابق» — أي شركة وأي ربع؟!", do: s => {
      s.bubble("q", { text: "What was ACME's Q2 2023 revenue growth?", side: "u", x: 800, y: 295, w: 620, size: 25 }, { at: "8%" });
      s.box("ch", { x: 800, y: 495, w: 720, h: 112, label: "\"The company's revenue grew by 3% over the previous quarter.\"", sub: "chunk #47 (missing company & date!)", size: 22, color: "red" }, { at: "34%" });
      s.badge("ms", { x: 800, y: 675, text: "Both Vector & BM25 miss this chunk ✗", color: "red", size: 23 }, { at: "68%" });
    }},
    { sec: "إضافة السياق", say: "الحل في الاسترجاع السياقي: نمرّر المستند والمقطع لنموذج رخيص يولّد 50–100 كلمة سياق.", eq: "@Y{contextual chunk} = @C{context(doc, c)} + c", do: s => {
      s.clear({ dur: 0.4 });
      s.doc("d", { x: 260, y: 500, w: 185, h: 245, lines: 8, title: "ACME Q2 2023 Filing", color: "blue" }, { at: "8%" });
      s.box("sm", { x: 700, y: 500, w: 240, h: 120, label: "Fast Cheap LLM", icon: "bolt", color: "teal", size: 24 }, { at: "24%" });
      s.link("l1", "d", "sm", { color: "blue", pulse: true }, { at: "32%" });
      [0, 1, 2].forEach(i => {
        s.box("cx" + i, { x: 1220, y: 360 + i * 140, w: 430, h: 96, label: `[ACME Q2 2023] + chunk ${i + 1}`, sub: "embedded + indexed in BM25", size: 21, color: "gold" }, { at: 0.75 + i * 0.2 });
        s.link("l2" + i, "sm", "cx" + i, { color: "gold", w: 2.5, pulse: true }, { at: 0.9 + i * 0.2 });
      });
    }},
    { say: "الآن أصبح المقطع يحمل اسم الشركة والتاريخ، فيلتقطه البحث المتجهي وBM25 معًا.", do: s => {
      s.focus(["cx0", "l20"], { at: "10%", zoom: 1.15, keep: ["sm"] });
      s.mark("ok0", "cx0", "check", { at: "55%" });
    }},
    { sec: "التخزين المؤقت", say: "وبما أن المستند نفسه يتكرر لكل مقطع، نفعّل Prompt Caching فتنخفض التكلفة نحو 90%!", eq: "@T{cost} @xrightarrow{@G{Prompt Cache}} @G{-90@%}", do: s => {
      s.unfocus({ at: "0%", dur: 0.35 });
      s.to("d", { color: "green" }, { at: "15%", dur: 0.4 });
      s.badge("ca", { x: 260, y: 705, text: "Document Prefix Cached ✓", color: "green", size: 21 }, { at: "28%" });
      s.bar("cost", { x: 650, y: 780, w: 480, v: 0.92, color: "red", label: "ingest cost", val: "100%", size: 25, h: 32 }, { at: "35%" });
      s.to("cost", { v: 0.14, color: "green", val: "~12%" }, { at: "60%", dur: 1.1 });
    }},
    { sec: "الدمج الهجين RRF", say: "وعند البحث، نسترجع أفضل 20 مقطعًا بالمتجهات و20 بـ BM25، وندمج الترتيبين بـ RRF.", eq: "@T{RRF}(d) = @sum_{r} @frac{1}{60 + @T{rank}_r(d)}", do: s => {
      s.clear({ dur: 0.4 });
      s.note("vt", { text: "Vector Top-20", x: 320, y: 315, color: "green", font: "math", size: 26 }, { at: "8%" });
      s.note("bt", { text: "BM25 Top-20", x: 670, y: 315, color: "blue", font: "math", size: 26 }, { at: "18%" });
      s.note("ft", { text: "RRF Fused", x: 1180, y: 315, color: "gold", font: "math", size: 26 }, { at: "48%" });
      s.col("v", ["c4", "c9", "c2", "c7"], { x: 320, y: 530, size: 25, w: 180, colors: ["green", "green", "green", "green"] }, { at: "14%", st: 0.1 });
      s.col("b", ["c9", "c1", "c4", "c5"], { x: 670, y: 530, size: 25, w: 180, colors: ["blue", "blue", "blue", "blue"] }, { at: "26%", st: 0.1 });
      s.arrow("ar", { x1: 800, y1: 530, x2: 1050, y2: 530, color: "gold", label: "RRF", pulse: true }, { at: "45%" });
      s.col("f", ["c9 ★", "c4 ★", "c1", "c2"], { x: 1180, y: 530, size: 25, w: 200, colors: ["gold", "gold", "soft", "soft"] }, { at: "58%", st: 0.12 });
    }},
    { say: "المقاطع التي تظهر عالية في القائمتين مثل c9 وc4 تصعد فورًا إلى الصدارة.", do: s => {
      s.pulse(["v1", "b0", "f0"], { at: "15%", color: "gold" });
      s.pulse(["v0", "b2", "f1"], { at: "52%", color: "gold" });
      s.badge("okf", { x: 1180, y: 785, text: "Meaning + exact terms unified ✓", color: "gold", size: 21 }, { at: "68%" });
    }},
    { sec: "إعادة الترتيب", say: "ثم نمرّر أفضل 20 مرشحًا على Reranker يقرأ السؤال والمقطع معًا ويختار أدق 5 فقط.", eq: "@P{Reranker}(q, @; 20) @to @G{Top-5}", do: s => {
      s.out(["v*", "b*", "vt", "bt", "ar", "okf"], { at: "0%", dur: 0.35 });
      s.to(["f*", "ft"], { x: 340 }, { at: "15%", dur: 0.7 });
      s.box("rr", { x: 790, y: 530, w: 270, h: 140, label: "Cross-Encoder\nReranker", icon: "filter", color: "purple", size: 24 }, { at: "38%" });
      s.link("fr", "f1", "rr", { color: "gold", pulse: true }, { at: "48%" });
      s.col("tp", ["c9 · 0.96", "c4 · 0.91", "c1 · 0.84"], { x: 1260, y: 530, w: 260, size: 23, colors: ["green", "green", "teal"] }, { at: "64%", st: 0.14 });
      s.link("rt", "rr", "tp1", { color: "green", pulse: true }, { at: "70%" });
    }},
    { sec: "الأرقام والكود", say: "في تجارب Anthropic، خفّض السياق فشل الاسترجاع 49%، ومع إعادة الترتيب وصل إلى 67%!", eq: "@T{failed retrievals}: @; @C{-49@%} @; @to @; @G{-67@%}", do: s => {
      s.clear({ dur: 0.4 });
      s.bars("bn", [
        ["Baseline RAG", 0.9, "red", "5.7% fail"],
        ["+ Contextual + BM25", 0.46, "teal", "-49% fails"],
        ["+ Reranker (Top-5)", 0.30, "green", "-67% fails ✓"]
      ], { x: 640, y: 420, w: 540, gap: 82, size: 26, h: 34 }, { at: "12%" });
      s.bars("rk", [["recall@5 before", 0.71, "orange", "0.71"], ["recall@5 after", 0.89, "green", "0.89 ✓"]], { x: 640, y: 745, w: 540, gap: 66, size: 25, h: 30 }, { at: "58%" });
    }},
    { say: "والكود بسيط ومباشر: دمج RRF لأفضل 20، ثم reranker لاختيار 5، ثم قياس recall@k.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("cd", { x: 800, y: 530, size: 21, title: "retrieve.py", lines: [
        "vec = vector_search(query, k=20)",
        "lex = bm25_search(query, k=20)",
        "candidates = rrf_fuse(vec, lex, k=60)[:20]",
        "top_chunks = reranker.score(query=query, docs=candidates)[:5]",
        "assert recall_at_k(top_chunks, expected_ids) >= 0.85"
      ] }, { at: "8%", dur: 1.7 });
      s.to("cd", { hl: 2 }, { at: "50%", dur: 0.25 });
      s.to("cd", { hl: 3 }, { at: "76%", dur: 0.25 });
    }},
    { sec: "الخطأ مقابل القاعدة", say: "لا تُشغّل الـ Reranker على كل قاعدة البيانات؛ بل استعمله كمرحلة ثانية فوق أفضل 20–50 مرشحًا.", do: s => {
      s.clear({ dur: 0.4 });
      s.versus("vs", "Rerank على الكل ✗", "مرحلتان: استرجاع ثم Rerank ✓", { colors: ["red", "green"] }, { at: "0%" });
      s.col("b1", ["Score 100,000 chunks", "15+ seconds latency", "Massive GPU bill ✗"], { x: 440, y: 545, w: 460, size: 24, icons: ["hourglass", "coin", "x"], colors: ["red", "red", "red"] }, { at: "24%", st: 0.2 });
      s.col("b2", ["Fast hybrid → Top 20", "Rerank 20 pairs (~80 ms)", "High precision Top 5 ✓"], { x: 1160, y: 545, w: 460, size: 24, icons: ["bolt", "filter", "check"], colors: ["teal", "purple", "green"] }, { at: "48%", st: 0.2 });
    }},
    { sec: "الخلاصة", say: "الخلاصة: أضِف سياقًا لكل مقطع مع Cache، وادمج المتجهات وBM25، ثم أعد الترتيب وقِس recall@k.", eq: "@Y{Context+Cache} @to @B{RRF} @to @P{Rerank} @to @G{recall@@k}", do: s => {
      s.clear({ dur: 0.4 });
      s.chain("sum", ["Context Prefix", "Prompt Cache", "RRF Fusion", "Rerank Top-5", "Eval recall@k"], { y: 525, gap: 38, icons: ["memo", "bolt", "merge", "filter", "chart"], colors: ["gold", "green", "blue", "purple", "teal"], w: 238, h: 155, size: 21, pulse: true }, { at: "12%", st: 0.16 });
    }}
  ]);

  // ------------------------------------------------------------------ A3.2 Hybrid Search in Postgres
  X.lesson("A3.2", [
    { sec: "فشل كل بحث وحده", say: "ابحث عن رقم طلب دقيق مثل 8812-AX بالتضمين وحده، فسيعيد أرقامًا متشابهة الشكل ويخطئ الهدف!", do: s => {
      s.bubble("q", { text: "order 8812-AX", side: "u", x: 800, y: 295, w: 340, font: "mono", size: 26 }, { at: "8%" });
      s.col("vr", ["order 8821-AX (0.91)", "order 8812-BX (0.89)", "order 1288-AX (0.86)"], { x: 800, y: 530, font: "mono", size: 24, w: 460, colors: ["red", "red", "red"] }, { at: "34%", st: 0.16 });
      s.badge("vl", { x: 800, y: 745, text: "Vector search blurs exact IDs & SKUs ✗", color: "red", size: 23 }, { at: "72%" });
    }},
    { say: "والعكس صحيح: البحث النصي يجد 8812-AX فورًا، لكنه يفشل حين تختلف ألفاظ السؤال عن المستند.", do: s => {
      s.out(["vr*", "vl"], { at: "0%", dur: 0.3 });
      s.box("fts", { x: 460, y: 530, w: 430, h: 96, label: "order 8812-AX ✓", sub: "Full-Text exact match", font: "mono", size: 23, color: "green" }, { at: "18%" });
      s.box("sem", { x: 1140, y: 530, w: 460, h: 96, label: "\"money back\" ≠ \"return\"", sub: "Full-Text misses synonyms ✗", size: 22, color: "orange" }, { at: "52%" });
      s.mark("okf", "fts", "check", { at: "36%" });
      s.mark("xsm", "sem", "x", { at: "74%" });
    }},
    { sec: "البحث الهجين", say: "لذلك نجمع القوتين معًا داخل PostgreSQL: البحث النصي للمصطلحات الدقيقة، وpgvector للمعنى.", eq: "@B{Full-Text (GIN)} + @G{pgvector (HNSW)} @to @Y{Hybrid}", do: s => {
      s.clear({ dur: 0.4 });
      s.zone("pg", { x: 800, y: 535, w: 1260, h: 555, label: "PostgreSQL (Single Database)", color: "blue" }, { at: "6%" });
      s.note("kt", { text: "Full-Text · GIN", x: 460, y: 345, color: "blue", font: "math", size: 25 }, { at: "16%" });
      s.note("st", { text: "pgvector · HNSW", x: 1140, y: 345, color: "green", font: "math", size: 25 }, { at: "24%" });
      s.col("kw", ["#1  8812-AX", "#2  refund rules", "#3  SKU-99"], { x: 460, y: 505, font: "mono", size: 22, w: 320, colors: ["blue", "blue", "blue"] }, { at: "28%", st: 0.12 });
      s.col("sm", ["#1  return window", "#2  refund rules", "#3  money back"], { x: 1140, y: 505, size: 22, w: 320, colors: ["green", "green", "green"] }, { at: "42%", st: 0.12 });
    }},
    { say: "ثم ندمج القائمتين بطريقة RRF البسيطة، فتجمع بين الرتبة الدلالية والرتبة النصية بلا أوزان معقدة.", eq: "@T{score} = @frac{1}{60 + r_{@G{sem}}} + @frac{1}{60 + r_{@B{kw}}}", do: s => {
      s.box("rrf", { x: 800, y: 725, w: 390, h: 78, label: "RRF Fusion → Top 5", icon: "merge", inline: true, size: 25, color: "gold" }, { at: "15%" });
      s.link("la", "kw2", "rrf", { color: "blue", pulse: true }, { at: "30%" });
      s.link("lb", "sm2", "rrf", { color: "green", pulse: true }, { at: "38%" });
      s.pulse(["kw1", "sm1"], { at: "58%", color: "gold", keep: true });
      s.stream("kw1", "rrf", { at: "60%", span: 1.8, every: 0.6, color: "gold" });
      s.stream("sm1", "rrf", { at: "60%", span: 1.8, every: 0.6, color: "gold" });
    }},
    { say: "لاحظ أن RRF تعتمد على الترتيب فقط، لذا لا تحتاج موازنة صعبة بين مقياسين مختلفين.", do: s => {
      s.focus(["kw1", "sm1", "rrf"], { at: "10%", zoom: 1.12 });
      s.badge("sc", { x: 800, y: 505, text: "refund rules → 1/62 + 1/62 = #1 ★", color: "gold", size: 21 }, { at: "45%" });
    }},
    { sec: "الفهارس في Postgres", say: "ونضيف فهرسين على الجدول نفسه: GIN لعمود النص tsvector، وHNSW لعمود المتجهات.", eq: "@B{GIN(tsv)} @; + @; @G{HNSW(emb)} @; + @; @Y{tenant@_id}", do: s => {
      s.clear({ dur: 0.4 });
      s.box("tb", { x: 800, y: 330, w: 720, h: 92, label: "chunks (id, tenant_id, content, tsv, emb)", font: "mono", icon: "table", inline: true, size: 21, color: "soft" }, { at: "8%" });
      s.box("gin", { x: 460, y: 565, w: 380, h: 112, label: "GIN Index", sub: "fast exact words & IDs", icon: "search", inline: true, size: 25, color: "blue" }, { at: "30%" });
      s.box("hnsw", { x: 1140, y: 565, w: 380, h: 112, label: "HNSW Index", sub: "fast cosine meaning", icon: "sparkle", inline: true, size: 25, color: "green" }, { at: "46%" });
      s.link("tg", "tb", "gin", { color: "blue", pulse: true }, { at: "38%" });
      s.link("th", "tb", "hnsw", { color: "green", pulse: true }, { at: "54%" });
      s.callout("tn", { x: 800, y: 770, label: "Both indexes share the same ACID rows & tenant_id filter ✓", icon: "lock", color: "gold" }, { at: "70%" });
    }},
    { sec: "SQL واحد متكامل", say: "والأجمل أن البحث الهجين ودمج RRF يعملان في استعلام SQL واحد سريع!", do: s => {
      s.clear({ dur: 0.4 });
      s.code("cd", { x: 800, y: 525, size: 20, title: "hybrid.sql", lines: [
        "WITH sem AS (SELECT id, ROW_NUMBER() OVER (ORDER BY emb <=> $1) r",
        "             FROM chunks WHERE tenant_id = $3 LIMIT 20),",
        "     kw  AS (SELECT id, ROW_NUMBER() OVER (ORDER BY ts_rank(tsv, q) DESC) r",
        "             FROM chunks WHERE tenant_id = $3 LIMIT 20)",
        "SELECT id, COALESCE(1.0/(60+sem.r),0) + COALESCE(1.0/(60+kw.r),0) AS score",
        "FROM sem FULL OUTER JOIN kw USING (id)",
        "ORDER BY score DESC LIMIT 5;"
      ] }, { at: "8%", dur: 1.9 });
      s.to("cd", { hl: 0 }, { at: "54%", dur: 0.25 });
      s.to("cd", { hl: 2 }, { at: "78%", dur: 0.25 });
    }},
    { say: "الاستعلام الأول يجلب أفضل 20 دلاليًا، والثاني أفضل 20 نصيًا، وكلاهما مصفّى بـ tenant_id.", do: s => {
      s.to("cd", { hl: 1 }, { at: "15%", dur: 0.25 });
      s.to("cd", { hl: 3 }, { at: "55%", dur: 0.25 });
    }},
    { say: "ثم يدمج FULL OUTER JOIN القائمتين بمعادلة RRF ويعيد أدق خمسة مقاطع في جولة واحدة.", do: s => {
      s.to("cd", { hl: 4 }, { at: "18%", dur: 0.25 });
      s.to("cd", { hl: 6 }, { at: "62%", dur: 0.25 });
    }},
    { sec: "قاعدة واحدة ضد اثنتين", say: "بدل إدارة محرك بحث وقاعدة متجهات منفصلين، قاعدة Postgres واحدة تغنيك عن مشاكل المزامنة.", do: s => {
      s.clear({ dur: 0.4 });
      s.versus("vs", "قاعدتان منفصلتان ✗", "PostgreSQL واحد ✓", { colors: ["red", "green"] }, { at: "0%" });
      s.col("two", ["Sync bugs & stale deletes", "Two services to monitor", "Harder tenant permissions"], { x: 440, y: 545, w: 460, size: 24, icons: ["alert", "server", "unlock"], colors: ["red", "orange", "red"] }, { at: "24%", st: 0.2 });
      s.col("one", ["ACID transactions on update", "GIN + HNSW in one table", "One SQL query + tenant filter"], { x: 1160, y: 545, w: 460, size: 24, icons: ["check", "db", "lock"], colors: ["green", "teal", "blue"] }, { at: "48%", st: 0.2 });
    }},
    { sec: "الخلاصة", say: "الخلاصة: Postgres بـ GIN وHNSW وRRF يمنحك دقة الكلمات وفهم المعاني في استعلام واحد.", eq: "@T{Query} @to @B{GIN} + @G{HNSW} @to @Y{RRF SQL} @to @T{Top 5}", do: s => {
      s.clear({ dur: 0.4 });
      s.chain("sum", ["User Query", "GIN (Text)", "HNSW (Vector)", "RRF SQL", "Top-5 Exact+Sem"], { y: 525, gap: 38, icons: ["search", "memo", "sparkle", "merge", "check"], colors: ["soft", "blue", "green", "gold", "teal"], w: 238, h: 155, size: 20, pulse: true }, { at: "12%", st: 0.16 });
    }}
  ]);

  // ================================================================== 7.1 Agent loops & ReAct
  X.lesson("7.1", [
    { sec: "الوكيل في حلقة", say: "يسأل عميل: «طلبي 812A تأخّر، تحقّق من حالته واسترد الشحن إن تأخر».", do: s => {
      s.bubble("q", { text: "Order 812A is late — check status & refund shipping if delayed.", side: "u", x: 800, y: 310, w: 660, color: "blue", label: "user goal" }, { at: "0%" });
      s.box("llm", { x: 470, y: 585, w: 260, h: 110, label: "Single LLM Call", icon: "brain", color: "purple", size: 24 }, { at: "30%" });
      s.box("db", { x: 1130, y: 585, w: 260, h: 110, label: "Live Orders API", icon: "db", color: "teal", size: 24 }, { at: "45%" });
      s.callout("gap", { x: 800, y: 765, label: "LLM cannot see live order status without calling tools!", color: "orange", icon: "alert" }, { at: "68%" });
    }},
    { say: "استدعاء واحد للنموذج سيهلوس أو يعتذر؛ أما الوكيل فيعمل بحلقة ReAct للتفكير والتنفيذ.", do: s => {
      s.out("gap", { at: "0%", dur: 0.3 });
      s.bubble("bad", { text: "Your order arrives tomorrow! (hallucinated)", side: "a", x: 800, y: 760, w: 500, color: "red", size: 22 }, { at: "20%" });
      s.mark("bx", "bad", "x", { at: "42%" });
      s.link("br", "llm", "db", { color: "green", label: "needs ReAct loop", lc: "green", pulse: true }, { at: "62%" });
    }},
    { sec: "دورة ReAct", say: "حلقة ReAct بسيطة وقوية: لاحِظ، ثم قرّر، ثم نفّذ أداة، ثم لاحِظ نتيجتها.", eq: "@C{Observe} @to @P{Decide} @to @O{Act} @to @C{Observe}", do: s => {
      s.clear({ dur: 0.45 });
      s.ring("lp", { x: 800, y: 540, r: 210, color: "faint", arrows: 3 }, { at: "5%" });
      ringNodes(s, "n", ["observe", "decide", "act"], 800, 540, 210, ["teal", "purple", "orange"], { at: "18%", stPct: 14 });
      s.to("lp", { spin: 360 }, { at: "45%", dur: 3.2, ease: "lin" });
    }},
    { say: "في الدورة الأولى، يطلب الوكيل get_order(\"812A\") فيرجع خطأ؛ نعيد الخطأ له كملاحظة لا انهيار.", do: s => {
      s.to(["lp", "n*"], { dx: -360 }, { at: "0%", dur: 0.7 });
      s.box("c1", { x: 1120, y: 400, w: 460, h: 74, label: "Act: get_order(\"812A\")", font: "mono", size: 21, color: "orange" }, { at: "26%" });
      s.box("e1", { x: 1120, y: 520, w: 460, h: 74, label: "Obs: error — id must be numeric", size: 21, color: "red", font: "ui" }, { at: "54%" });
      s.link("ce1", "c1", "e1", { color: "red", pulse: true }, { at: "48%" });
      s.callout("rec", { x: 1120, y: 660, label: "Feed tool errors back so the agent recovers!", color: "gold", icon: "refresh" }, { at: "74%" });
    }},
    { say: "في الدورة الثانية، يصحّح نفسه إلى 812، يقرأ التأخير، ويقدّم الإجابة الصحيحة.", do: s => {
      s.out("rec", { at: "0%", dur: 0.3 });
      s.to(["c1", "e1", "ce1"], { opacity: 0.35 }, { at: "12%", dur: 0.4 });
      s.box("c2", { x: 1120, y: 650, w: 460, h: 74, label: "Act: get_order(812)", font: "mono", size: 21, color: "orange" }, { at: "24%" });
      s.box("e2", { x: 1120, y: 775, w: 460, h: 74, label: "Obs: delayed 4 days → Done ✓", size: 21, color: "green", font: "ui" }, { at: "52%" });
      s.link("ce2", "c2", "e2", { color: "green", pulse: true }, { at: "46%" });
      s.to("lp", { spin: 720 }, { at: "30%", dur: 2.4, ease: "lin" });
    }},
    { sec: "شروط التوقف", say: "ولكي لا تدور الحلقة للأبد، تنتهي بثلاثة مخارج: إجابة نهائية، بلوغ الميزانية، أو موافقة بشرية.", eq: "@T{stop} @iff @G{answer} @lor @R{budget} @lor @Y{approval}", do: s => {
      s.out(["c1", "e1", "ce1", "c2", "e2", "ce2"], { at: "0%", dur: 0.35 });
      s.col("ex", ["Final answer (end_turn)", "Budget limit (steps / tokens / time)", "Human approval gate"], { x: 1120, y: 540, w: 540, size: 24, icons: ["flag", "coin", "hand"], colors: ["green", "red", "gold"] }, { at: "22%", st: 0.18 });
      s.pulse(["ex0", "ex1", "ex2"], { at: "72%", color: "gold" });
    }},
    { sec: "فخّ الدوران اللانهائي", say: "لكن قد يعلق الوكيل فيكرّر استدعاء الأداة نفسها بالمدخلات نفسها مرارًا ويحرق الـ Tokens!", do: s => {
      s.clear({ dur: 0.45 });
      [0, 1, 2].forEach(i =>
        s.box("rp" + i, { x: 640, y: 360 + i * 110, w: 540, h: 70, label: "search(\"refund policy 2019\")", font: "mono", size: 22, color: "red" }, { at: `${12 + i * 18}%` })
      );
      s.num("tok", { v: 1200, x: 1230, y: 470, size: 44, color: "red", suf: " tok" }, { at: "20%" });
      s.to("tok", { v: 48500 }, { at: "32%", dur: 1.8, ease: "in" });
      s.badge("stk", { x: 1230, y: 590, text: "STUCK IN LOOP!", color: "red" }, { at: "70%" });
    }},
    { say: "الحل: كاشف الدوران يراقب الأفعال المتكررة، فيوقف الحلقة أو يرسل تلميحًا لتغيير الخطة.", eq: "@T{same call} @times 3 @; @lor @; @T{steps} > 10 @Rightarrow @R{@T{stop}}", do: s => {
      s.out("stk", { at: "0%", dur: 0.3 });
      s.box("det", { x: 800, y: 745, w: 700, h: 80, label: "Loop detector: same (tool, args) 3× → inject hint or halt", icon: "shieldok", inline: true, size: 22, color: "gold" }, { at: "22%" });
      s.to("tok", { color: "green" }, { at: "55%", dur: 0.4 });
      s.pulse("det", { at: "68%", color: "gold" });
    }},
    { sec: "التتبع والكود", say: "تتبّع كل دورة بسجل واضح؛ فبدون سجل الخطوات يصبح تصحيح أخطاء الوكيل تخمينًا أعمى.", do: s => {
      s.clear({ dur: 0.45 });
      s.code("tr", { x: 800, y: 525, size: 22, title: "agent_trace.log", lines: [
        "step 1  decide   → get_order(\"812A\")",
        "step 1  observe  ← is_error: order_id must be numeric",
        "step 2  decide   → get_order(812)",
        "step 2  observe  ← {status: \"delayed\", days: 4}",
        "step 3  answer   → stop_reason: end_turn",
        "summary · 3 steps · 3.4s · 1,920 tokens · $0.004"
      ] }, { at: "0%", dur: 1.5 });
      s.to("tr", { hl: 1, hc: "red" }, { at: "34%", dur: 0.2 });
      s.to("tr", { hl: 3, hc: "green" }, { at: "58%", dur: 0.2 });
      s.to("tr", { hl: 5, hc: "gold" }, { at: "80%", dur: 0.2 });
    }},
    { say: "وفي الكود: حلقة while محدودة بسقف خطوات وميزانية وكاشف تكرار، لا حلقة مفتوحة أبدًا.", eq: "@T{while } @T{step} < N @land @T{tokens} < B", do: s => {
      s.out("tr", { at: "0%", dur: 0.35 });
      s.code("lp", { x: 800, y: 525, size: 22, title: "agent_loop.py", lines: [
        "for step in range(MAX_STEPS):                 # hard cap",
        "    res = llm.call(messages, tools=TOOLS)",
        "    if res.stop_reason == \"end_turn\": return res.text",
        "    if is_repeated_3x(res.tool_call): break   # loop guard",
        "    obs = run_tool_safe(res.tool_call)        # error -> obs",
        "    messages.append(obs)"
      ] }, { at: "12%", dur: 1.4 });
      s.to("lp", { hl: 0, hc: "gold" }, { at: "42%", dur: 0.2 });
      s.to("lp", { hl: 3, hc: "red" }, { at: "62%", dur: 0.2 });
      s.to("lp", { hl: 4, hc: "teal" }, { at: "80%", dur: 0.2 });
    }},
    { say: "وقاعدة الإنتاج: لا تُخفِ أخطاء الأدوات؛ أعدها للوكيل بوضوح وسجّل كل خطوة للمراجعة.", do: s => {
      s.clear({ dur: 0.45 });
      s.versus("vs", "Blind Unbounded Agent", "Production ReAct Loop", { colors: ["red", "green"] }, { at: "0%" });
      s.col("bd", ["while True with no budget", "crashes on tool error", "zero step tracing"], { x: 435, y: 560, w: 460, size: 24, icons: ["x", "x", "x"], colors: ["red", "red", "red"] }, { at: "24%", st: 0.16 });
      s.col("gd", ["step, token & time caps", "tool errors fed back to recover", "full trace per iteration"], { x: 1165, y: 560, w: 480, size: 24, icons: ["check", "check", "check"], colors: ["green", "green", "green"] }, { at: "52%", st: 0.16 });
    }},
    { sec: "الخلاصة", say: "الخلاصة: ReAct يدور بين الملاحظة والقرار والتنفيذ، محاطًا بالميزانيات وكاشف الدوران والتتبع.", eq: "@T{Safe ReAct} = (@C{Observe} @to @P{Decide} @to @O{Act}) + @Y{Guards} + @G{Trace}", do: s => {
      s.clear({ dur: 0.45 });
      s.ring("rl", { x: 800, y: 525, r: 155, color: "teal", arrows: 3 }, { at: "5%" });
      ringNodes(s, "rn", ["observe", "decide", "act"], 800, 525, 155, ["teal", "purple", "orange"], { at: "15%", stPct: 10 });
      s.box("g0", { x: 320, y: 400, w: 260, h: 66, label: "Hard Budgets", icon: "coin", inline: true, color: "gold", size: 22 }, { at: "42%" });
      s.box("g1", { x: 1280, y: 400, w: 260, h: 66, label: "Loop Detector", icon: "shieldok", inline: true, color: "red", size: 22 }, { at: "54%" });
      s.box("g2", { x: 320, y: 660, w: 260, h: 66, label: "Error Recovery", icon: "refresh", inline: true, color: "green", size: 22 }, { at: "66%" });
      s.box("g3", { x: 1280, y: 660, w: 260, h: 66, label: "Full Tracing", icon: "list", inline: true, color: "blue", size: 22 }, { at: "76%" });
      s.to("rl", { spin: 360 }, { at: "25%", dur: 3.0, ease: "lin" });
    }}
  ]);

  // ================================================================== 7.2 Reliable tool design
  X.lesson("7.2", [
    { sec: "أداة واحدة = مهمة واحدة", say: "تخيّل أداة غامضة باسم do_stuff(action, data)؛ سيرتبك النموذج ويخلط الإلغاء بالاسترداد!", do: s => {
      s.box("bad", { x: 470, y: 520, w: 460, h: 110, label: "do_stuff(action, data, flag)", sub: "vague name · loose dict", font: "mono", size: 22, color: "red" }, { at: "5%" });
      s.mark("bx", "bad", "x", { at: "34%" });
      s.bubble("err", { text: "Called do_stuff(\"cancel\", {amt: 50}) instead of refund!", side: "t", x: 1140, y: 520, w: 470, color: "orange", size: 22 }, { at: "52%" });
      s.callout("tip", { x: 800, y: 745, label: "Ambiguous tool contracts cause model mistakes", color: "red", icon: "alert" }, { at: "74%" });
    }},
    { say: "الحل: أداة واحدة لمهمة واحدة واضحة، واسمها يصف عملها، بمخطط أنواع صارم.", eq: "@T{1 tool} = @G{1 clear job} + @B{strict schema}", do: s => {
      s.out(["err", "tip"], { at: "0%", dur: 0.35 });
      s.to("bad", { opacity: 0.3 }, { at: "15%", dur: 0.4 });
      s.col("good", ["get_order(order_id: int)", "cancel_order(order_id: int)", "refund_order(id: int, amt: float)"], { x: 1120, y: 520, w: 540, size: 22, font: "mono", icons: ["check", "check", "check"], colors: ["green", "green", "green"] }, { at: "25%", st: 0.18 });
      s.badge("sc", { x: 1120, y: 745, text: "TYPED · UNAMBIGUOUS · TESTABLE", color: "green" }, { at: "72%" });
    }},
    { sec: "فصل القراءة والكتابة", say: "افصل دائمًا أدوات القراءة عن أدوات الكتابة؛ فالقراءة آمنة لإعادة المحاولة أما الكتابة فتغيّر الواقع.", eq: "@G{@T{Read}} @to @T{safe retry}, @qquad @R{@T{Write}} @to @T{guards + permissions}", do: s => {
      s.clear({ dur: 0.45 });
      s.versus("vs", "Read Tools (Safe)", "Write Tools (Guarded)", { colors: ["green", "red"] }, { at: "0%" });
      s.col("r", ["get_order(id)", "search_docs(q)", "list_invoices(uid)"], { x: 435, y: 530, font: "mono", size: 23, w: 410, icons: ["search", "search", "search"], colors: ["green", "green", "green"] }, { at: "24%", st: 0.14 });
      s.col("w", ["refund_order(id, amt)", "send_email(to, body)", "cancel_order(id)"], { x: 1165, y: 530, font: "mono", size: 23, w: 410, icons: ["dollar", "mail", "ban"], colors: ["red", "red", "red"] }, { at: "48%", st: 0.14 });
    }},
    { say: "إعادة استدعاء get_order ثلاث مرات لا تضرّ شيئًا، أما إعادة refund_order فكارثة مالية!", do: s => {
      s.badge("rb", { x: 435, y: 745, text: "RETRY ×3 → HARMLESS ✓", color: "green" }, { at: "22%" });
      s.badge("wb", { x: 1165, y: 745, text: "RETRY ×2 → SIDE EFFECT RISK!", color: "red" }, { at: "52%" });
      s.pulse(["r0", "w0"], { at: "72%", color: "gold" });
    }},
    { sec: "مفتاح Idempotency", say: "تخيّل أن الوكيل استدعى الاسترداد، وانقطع الرد بالشبكة، فأعاد المحاولة فخُصم المبلغ مرتين!", do: s => {
      s.clear({ dur: 0.45 });
      s.box("ag", { x: 350, y: 500, w: 220, h: 120, label: "agent", icon: "bot", color: "purple", size: 26 }, { at: "5%" });
      s.box("pay", { x: 1250, y: 500, w: 260, h: 120, label: "payments API", icon: "dollar", color: "orange", size: 25 }, { at: "15%" });
      s.link("l1", "ag", "pay", { color: "orange", bend: -0.18, label: "call 1 · $50 (timeout)", lc: "orange" }, { at: "30%" });
      s.link("l2", "ag", "pay", { color: "red", bend: 0.18, label: "retry · $50", lc: "red" }, { at: "50%" });
      s.flow("ag", "pay", { color: "orange", bend: -0.18, at: "35%" });
      s.flow("ag", "pay", { color: "red", bend: 0.18, at: "55%" });
      s.box("dbl", { x: 800, y: 745, w: 500, h: 72, label: "$50 refunded TWICE ($100 lost) ✗", icon: "alert", inline: true, size: 23, color: "red" }, { at: "74%" });
    }},
    { say: "الحل هو مفتاح Idempotency: كل محاولة تحمل المفتاح نفسه، فلا يتكرر الإجراء أبدًا.", eq: "@T{refund}(812, @; @C{key}=k) @times 2 = @G{@T{one refund}}", do: s => {
      s.out(["dbl", "l1", "l2"], { at: "0%", dur: 0.3 });
      s.box("key", { x: 800, y: 315, w: 460, h: 64, label: "Idempotency-Key: refund-812-1", font: "mono", size: 21, color: "teal", icon: "key", inline: true }, { at: "14%" });
      s.link("lk", "ag", "pay", { color: "teal", label: "same key k (×2)", lc: "teal", pulse: true }, { at: "32%" });
      s.stream("ag", "pay", { color: "teal", at: "40%", span: 1.8, every: 0.5 });
      s.box("once", { x: 800, y: 745, w: 560, h: 72, label: "2nd call matches key k → returns cached receipt ✓", icon: "shieldok", inline: true, size: 22, color: "green" }, { at: "68%" });
    }},
    { say: "ويُفحص المفتاح داخل جدول في خادمك، لأن الحماية يجب أن تكون في طبقة الأداة لا في تمنّي النموذج.", do: s => {
      s.focus(["pay", "key", "once"], { zoom: 1.08, at: "15%" });
      s.badge("tbl", { x: 1250, y: 650, text: "idempotency_keys(key, result)", font: "mono", color: "teal" }, { at: "45%" });
      s.unfocus({ at: "80%" });
    }},
    { sec: "نتائج مختصرة والكود", say: "ولا تُرجع تفريغًا خامًا من آلاف الأسطر يملأ نافذة السياق؛ أعد ملخصًا مختصرًا وذا معنى.", do: s => {
      s.clear({ dur: 0.45 });
      s.doc("raw", { x: 400, y: 500, w: 200, h: 260, lines: 12, title: "4,000-line raw JSON", color: "red" }, { at: "5%" });
      s.bar("b1", { x: 320, y: 740, w: 240, v: 0.92, color: "red", label: "ctx", val: "92%", size: 22, h: 24 }, { at: "28%" });
      s.arrow("ar", { x1: 560, y1: 500, x2: 860, y2: 500, color: "green", label: "trim & format", lc: "green", pulse: true }, { at: "42%" });
      s.box("sum", { x: 1160, y: 500, w: 460, h: 130, label: "order #812: shipped\nETA: Friday · 2 items · $140", size: 23, color: "green", font: "mono" }, { at: "54%" });
      s.bar("b2", { x: 1080, y: 740, w: 240, v: 0.06, color: "green", label: "ctx", val: "6%", size: 22, h: 24 }, { at: "70%" });
    }},
    { say: "وهذا عقد أداة موثوقة بالكود: أنواع دقيقة، مفتاح Idempotency، ونتيجة مختصرة.", eq: "@T{tool} = @B{schema} + @C{idempotency} + @G{concise output}", do: s => {
      s.clear({ dur: 0.45 });
      s.code("cd", { x: 800, y: 525, size: 22, title: "refund_tool.py", lines: [
        "@tool",
        "def refund_order(order_id: int, amount: float, key: str):",
        "    if seen := db.get_idempotent(key): return seen",
        "    if amount > 500: return {\"error\": \"exceeds $500 limit\"}",
        "    res = payments.refund(order_id, amount, idempotency=key)",
        "    db.save_idempotent(key, res)",
        "    return {\"status\": \"refunded\", \"receipt\": res.id}"
      ] }, { at: "0%", dur: 1.5 });
      s.to("cd", { hl: 1, hc: "blue" }, { at: "28%", dur: 0.2 });
      s.to("cd", { hl: 2, hc: "teal" }, { at: "52%", dur: 0.2 });
      s.to("cd", { hl: 6, hc: "green" }, { at: "78%", dur: 0.2 });
    }},
    { sec: "فخّ الأخطاء الغامضة", say: "وعند الفشل، أعد رسالة خطأ يفهمها الوكيل ويتصرف على أساسها، لا أثر مكدس غامض!", do: s => {
      s.clear({ dur: 0.45 });
      s.versus("vs", "Opaque Stack Trace (Pitfall)", "Actionable Error (Fix)", { colors: ["red", "green"] }, { at: "0%" });
      s.box("er1", { x: 435, y: 550, w: 460, h: 120, label: "KeyError: 'uid' at line 214\nTraceback (most recent…)", font: "mono", size: 19, color: "red" }, { at: "24%" });
      s.mark("ex1", "er1", "x", { at: "45%" });
      s.box("er2", { x: 1165, y: 550, w: 480, h: 120, label: "Order 812 not found.\nTry search_orders(email).", font: "ui", size: 22, color: "green" }, { at: "54%" });
      s.mark("ck1", "er2", "check", { at: "74%" });
    }},
    { say: "أربع عادات تصنع أدوات يعتمد عليها أي وكيل: مهمة واحدة، فصل القراءة، Idempotency، ونتيجة مختصرة.", do: s => {
      s.clear({ dur: 0.45 });
      s.grid("ck", ["1 Tool = 1 Job", "Read vs Write", "Idempotency Key", "Concise Output"], { cols: 4, y: 495, cw: 320, ch: 150, size: 24, icons: ["tool", "shield", "key", "filter"], colors: ["blue", "orange", "teal", "green"], subs: ["strict schema", "guard writes", "no double action", "save tokens"] }, { at: "5%", st: 0.16 });
      [0, 1, 2, 3].forEach(i => s.mark("m" + i, "ck" + i, "check", { at: `${58 + i * 7}%` }));
    }},
    { sec: "الخلاصة", say: "تذكّر: الأداة الموثوقة تحمي قاعدة بياناتك وميزانيتك حتى حين يخطئ النموذج أو يعيد المحاولة.", eq: "@T{Reliable Tool} = @B{Clear Contract} + @C{Idempotency} + @G{Compact Return}", do: s => {
      s.pulse(["ck0", "ck1", "ck2", "ck3"], { at: "20%", color: "green" });
      s.callout("fin", { x: 800, y: 740, label: "Design tools so retries and edge cases are always safe", color: "teal", icon: "shieldok" }, { at: "55%" });
    }}
  ]);

  // ================================================================== 7.3 Controlled agency, approvals & multi-agent
  X.lesson("7.3", [
    { sec: "الاستقلالية بحدود", say: "لدى وكيل الدعم ست أدوات: من قراءة طلب حتى الاسترداد وحذف الحساب؛ هل نمنحه حرية مطلقة؟", do: s => {
      s.box("ag", { x: 800, y: 300, w: 240, h: 86, label: "Support Agent", icon: "bot", inline: true, color: "purple", size: 24 }, { at: "0%" });
      s.grid("tl", ["read_order", "search_docs", "refund_money", "email_user", "delete_account", "change_prices"], { cols: 3, y: 600, cw: 330, ch: 90, gx: 36, gy: 36, font: "mono", size: 22, colors: ["green", "green", "gold", "gold", "red", "red"] }, { at: "24%", st: 0.1 });
      s.callout("q", { x: 800, y: 800, label: "Equal autonomy for all 6 tools is a production disaster!", color: "red", icon: "alert" }, { at: "74%" });
    }},
    { say: "الاعتماد على التعليمات النصية وحدها مثل «رجاءً لا تحذف الحساب» يفشل عند الحقن أو الحالات الحدية.", do: s => {
      s.out("q", { at: "0%", dur: 0.3 });
      s.bubble("pr", { text: "System prompt: Please never delete accounts!", side: "s", x: 520, y: 785, w: 500, color: "orange", size: 21 }, { at: "20%" });
      s.mark("px", "pr", "x", { at: "48%" });
      s.callout("cd", { x: 1150, y: 785, label: "Enforce permissions in CODE!", color: "green", icon: "shieldok" }, { at: "62%" });
    }},
    { sec: "مصفوفة الصلاحيات", say: "صنّف كل فعل إلى ثلاث فئات: آمن يُنفّذ تلقائيًا، وحساس يحتاج موافقة، وممنوع نهائيًا.", eq: "@T{policy}(@T{tool}) @in @{ @G{SAFE}, @; @Y{APPROVAL}, @; @R{FORBIDDEN} @}", do: s => {
      s.clear({ dur: 0.45 });
      s.grid("cat", ["SAFE · auto-run", "NEEDS APPROVAL", "FORBIDDEN · deny"], { cols: 3, y: 310, cw: 400, ch: 82, size: 26, colors: ["green", "gold", "red"] }, { at: "5%", st: 0.16 });
      ["read_order", "search_docs"].forEach((t, i) => s.box("a" + i, { x: s.get("cat0").x, y: 475 + i * 100, w: 320, h: 68, label: t, font: "mono", size: 22, color: "green" }, { at: `${36 + i * 8}%` }));
      ["refund_money", "email_customer"].forEach((t, i) => s.box("b" + i, { x: s.get("cat1").x, y: 475 + i * 100, w: 320, h: 68, label: t, font: "mono", size: 22, color: "gold" }, { at: `${52 + i * 8}%` }));
      ["delete_account", "change_prices"].forEach((t, i) => s.box("c" + i, { x: s.get("cat2").x, y: 475 + i * 100, w: 320, h: 68, label: t, font: "mono", size: 22, color: "red" }, { at: `${68 + i * 8}%` }));
    }},
    { say: "فتمرّ القراءة بسلاسة، وتتوقف الكتابة الحساسة عند موافقة إنسان، ويُرفض الحذف فورًا.", do: s => {
      s.badge("ba", { x: s.get("cat0").x, y: 730, text: "AUTO EXECUTE ✓", color: "green" }, { at: "18%" });
      s.badge("bb", { x: s.get("cat1").x, y: 730, text: "HUMAN GATE ⏸", color: "gold" }, { at: "44%" });
      s.badge("bc", { x: s.get("cat2").x, y: 730, text: "HARD BLOCK ✗", color: "red" }, { at: "70%" });
    }},
    { sec: "الحدود الصارمة", say: "وأحِط كل تشغيل بأربعة سقوف صارمة: للخطوات، والـ Tokens، والوقت، والإنفاق المالي.", eq: "@T{steps}@le 20, @; @T{tokens}@le 50k, @; @T{time}@le 2@T{m}, @; @T{spend}@le @$5", do: s => {
      s.clear({ dur: 0.45 });
      ["steps ≤ 20", "tokens ≤ 50k", "time ≤ 2 min", "spend ≤ $5"].forEach((t, i) =>
        s.gauge("g" + i, { x: 320 + i * 320, y: 550, r: 98, v: 0, color: ["teal", "blue", "orange", "gold"][i], label: t, size: 23 }, { at: `${8 + i * 10}%` })
      );
      [0.45, 0.72, 0.35, 0.96].forEach((v, i) => s.to("g" + i, { v, color: i === 3 ? "red" : ["teal", "blue", "orange", "gold"][i] }, { at: `${42 + i * 8}%`, dur: 0.95 }));
      s.callout("brk", { x: 800, y: 775, label: "Hit any cap → circuit breaker halts the run safely", color: "red", icon: "shieldok" }, { at: "76%" });
    }},
    { say: "وكل ذلك يُفرض في طبقة بوابة الأدوات بالكود قبل وصول أي طلب إلى أنظمتك.", do: s => {
      s.clear({ dur: 0.45 });
      s.code("gate", { x: 800, y: 525, size: 22, title: "tool_gate.py", lines: [
        "POLICY = {",
        "  \"read_order\": SAFE, \"refund\": APPROVAL, \"delete_account\": FORBIDDEN",
        "}",
        "def execute_tool(tool, args, budget):",
        "    if budget.exceeded(): raise BudgetExceeded()",
        "    if POLICY[tool] == FORBIDDEN: raise Denied(tool)",
        "    if POLICY[tool] == APPROVAL:  wait_for_human(tool, args)",
        "    return TOOLS[tool](**args)"
      ] }, { at: "0%", dur: 1.5 });
      s.to("gate", { hl: 4, hc: "orange" }, { at: "34%", dur: 0.2 });
      s.to("gate", { hl: 5, hc: "red" }, { at: "56%", dur: 0.2 });
      s.to("gate", { hl: 6, hc: "gold" }, { at: "78%", dur: 0.2 });
    }},
    { sec: "تعدد الوكلاء", say: "ومتى نستخدم عدة وكلاء؟ التعدد يضيف التوازي وعزل السياق، لكنه يضيف تكلفة التنسيق.", eq: "@T{net gain} = @G{parallelism} - @O{coordination cost}", do: s => {
      s.clear({ dur: 0.45 });
      s.box("ld", { x: 800, y: 310, w: 260, h: 84, label: "lead agent", icon: "sitemap", inline: true, color: "purple", size: 26 }, { at: "5%" });
      ["researcher", "tester", "reviewer"].forEach((t, i) => {
        s.box("sb" + i, { x: 400 + i * 400, y: 540, w: 260, h: 80, label: t, icon: "bot", inline: true, size: 23, color: "blue" }, { at: `${24 + i * 10}%` });
        s.link("ll" + i, "ld", "sb" + i, { color: "purple", tail: true, pulse: true }, { at: `${32 + i * 10}%` });
      });
      s.callout("co", { x: 800, y: 745, label: "More agents = parallel work + extra handoff tokens & latency", color: "orange", icon: "scale" }, { at: "70%" });
    }},
    { say: "والقاعدة الأمنية الأهم: كل وكيل فرعي يحصل فقط على الأدوات اللازمة لمهمته، بأقل صلاحية.", eq: "@T{tools}(@T{subagent}_i) @subset @T{least privilege}", do: s => {
      s.out("co", { at: "0%", dur: 0.3 });
      [["search", "read"], ["run_tests"], ["read_diff"]].forEach((ts, i) =>
        ts.forEach((t, k) => s.box("tl" + i + k, { x: s.get("sb" + i).x, y: 670 + k * 66, w: 200, h: 52, label: t, font: "mono", size: 20, color: "teal" }, { at: `${20 + i * 16 + k * 8}%` }))
      );
      s.badge("lp", { x: 800, y: 825, text: "ZERO subagents hold delete_account or refund ✓", color: "green" }, { at: "74%" });
    }},
    { say: "ولا تبنِ سرب وكلاء لمهمة بسيطة؛ وكيل واحد بأدوات واضحة يتفوّق بسرعة وتكلفة أقل.", do: s => {
      s.clear({ dur: 0.45 });
      s.bars("cmp", [
        ["1 focused agent (simple task)", 0.28, "green", "2.1s · $0.01"],
        ["5-agent swarm (same task)", 0.88, "orange", "9.4s · $0.07"]
      ], { x: 640, y: 470, w: 560, gap: 115, size: 26, h: 36 }, { at: "10%" });
      s.callout("when", { x: 800, y: 735, label: "Split into subagents only when contexts or permissions truly diverge", color: "teal", icon: "branch" }, { at: "62%" });
    }},
    { sec: "فخّ الإنتاج", say: "قارن بين وكيل محمي ببوابة كود وآخر يعتمد على رجاء نصّي بلا ميزانيات ولا عزل صلاحيات.", do: s => {
      s.clear({ dur: 0.45 });
      s.versus("vs", "Uncontrolled Swarm (Pitfall)", "Controlled Agency (Fix)", { colors: ["red", "green"] }, { at: "0%" });
      s.col("bd", ["rules only in system prompt", "no spend or step cap", "all agents share admin tools"], { x: 435, y: 560, w: 470, size: 24, icons: ["x", "x", "x"], colors: ["red", "red", "red"] }, { at: "24%", st: 0.16 });
      s.col("gd", ["3-tier policy enforced in code", "4 hard resource caps", "least-privilege subagents"], { x: 1165, y: 560, w: 470, size: 24, icons: ["check", "check", "check"], colors: ["green", "green", "green"] }, { at: "52%", st: 0.16 });
    }},
    { say: "عند التشغيل، يصدّ درع الكود الأفعال الممنوعة تلقائيًا ويحوّل الحساسة إلى موافقة بشرية.", do: s => {
      s.clear({ dur: 0.45 });
      s.box("ag", { x: 300, y: 520, w: 200, h: 110, label: "Agent", icon: "bot", color: "purple", size: 25 }, { at: "5%" });
      s.box("sh", { x: 760, y: 520, w: 240, h: 130, label: "tool_gate.py", icon: "shieldok", color: "teal", size: 24 }, { at: "18%" });
      s.box("ok", { x: 1260, y: 365, w: 280, h: 74, label: "Human Approval ⏸", color: "gold", size: 22 }, { at: "36%" });
      s.box("no", { x: 1260, y: 675, w: 280, h: 74, label: "delete → Denied ✗", color: "red", size: 22 }, { at: "48%" });
      s.link("l0", "ag", "sh", { color: "purple", pulse: true }, { at: "28%" });
      s.link("l1", "sh", "ok", { color: "gold", label: "refund", lc: "gold", pulse: true }, { at: "55%" });
      s.link("l2", "sh", "no", { color: "red", label: "delete", lc: "red" }, { at: "65%" });
      s.flow("ag", "sh", { color: "gold", at: "58%" });
      s.flow("sh", "ok", { color: "gold", at: "74%" });
    }},
    { sec: "الخلاصة", say: "الخلاصة: الاستقلالية المنضبطة = صلاحيات بالكود، وميزانيات صارمة، وموافقات، ووكلاء فرعيون بأقل صلاحية.", eq: "@T{Controlled Agency} = @C{Code Gate} + @Y{Approvals} + @O{Caps} + @G{Least Privilege}", do: s => {
      s.focus(["sh", "ok", "no"], { zoom: 1.08, at: "12%" });
      s.pulse("sh", { at: "42%", color: "green" });
      s.unfocus({ at: "76%" });
    }}
  ]);

  // ================================================================== 7.4 Model Context Protocol (MCP)
  X.lesson("7.4", [
    { sec: "مشكلة N × M", say: "عندما يتصل كل تطبيق ذكي بكل أداة بطريقة مخصصة، تنفجر الوصلات إلى N ضرب M.", eq: "N @times M @; @T{custom integrations}", do: s => {
      ["IDE", "Chat App", "Agent"].forEach((t, i) => s.box("ap" + i, { x: 340, y: 370 + i * 165, w: 220, h: 82, label: t, size: 25, color: "blue" }, { at: `${5 + i * 10}%` }));
      ["GitHub", "Postgres", "Slack", "Drive"].forEach((t, i) => s.box("tl" + i, { x: 1260, y: 330 + i * 135, w: 220, h: 78, label: t, size: 25, color: "orange" }, { at: `${22 + i * 8}%` }));
      let k = 0;
      for (let a = 0; a < 3; a++) for (let b = 0; b < 4; b++)
        s.link("m" + (k++), "ap" + a, "tl" + b, { color: "faint", head: false, w: 2 }, { at: `${48 + k * 2.5}%`, dur: 0.4 });
    }},
    { say: "يأتي MCP مثل منفذ USB-C لتطبيقات الذكاء الاصطناعي: تبني الخادم مرة فتتصل به كل التطبيقات.", eq: "N @times M @; @Rightarrow @; @C{N + M}", do: s => {
      s.out("m*", { at: "0%", dur: 0.4 });
      s.box("mcp", { x: 800, y: 535, w: 240, h: 120, label: "MCP", icon: "plug", inline: true, color: "teal", size: 34 }, { at: "20%" });
      [0, 1, 2].forEach(i => s.link("a" + i, "ap" + i, "mcp", { color: "teal", head: false, pulse: true }, { at: `${42 + i * 6}%` }));
      [0, 1, 2, 3].forEach(i => s.link("b" + i, "mcp", "tl" + i, { color: "teal", head: false, pulse: true }, { at: `${58 + i * 5}%` }));
      s.badge("usb", { x: 800, y: 790, text: "USB-C FOR AI TOOLS ✓", color: "teal" }, { at: "76%" });
    }},
    { sec: "المعمارية والأطراف", say: "التطبيق المضيف Host يشغّل عملاء MCP، يتصل كل عميل بخادم MCP مستقل.", eq: "@B{Host} @supset @B{Clients} @leftrightarrow @C{MCP Servers}", do: s => {
      s.clear({ dur: 0.45 });
      s.zone("host", { x: 470, y: 540, w: 540, h: 490, label: "Host App (IDE · Chat · Agent)", color: "blue" }, { at: "5%" });
      [0, 1].forEach(i => {
        s.box("cl" + i, { x: 470, y: 455 + i * 175, w: 280, h: 82, label: "MCP Client " + (i + 1), size: 24, color: "blue" }, { at: `${24 + i * 14}%` });
        s.box("sv" + i, { x: 1180, y: 455 + i * 175, w: 300, h: 82, label: ["orders server", "docs server"][i], size: 24, color: "teal", icon: "server", inline: true }, { at: `${42 + i * 14}%` });
        s.link("cs" + i, "cl" + i, "sv" + i, { color: "teal", tail: true, pulse: true }, { at: `${58 + i * 12}%` });
      });
    }},
    { say: "وكل خادم MCP يعرض ثلاث قدرات قياسية: أدوات للتنفيذ، وموارد للقراءة، وأوامر جاهزة.", eq: "@C{Server} @to @{ @O{Tools}, @; @Y{Resources}, @; @P{Prompts} @}", do: s => {
      s.focus(["sv0", "sv1"], { zoom: 1.08, at: "8%" });
      [
        ["Tools", "actions", "orange"],
        ["Resources", "read data", "gold"],
        ["Prompts", "templates", "purple"]
      ].forEach(([t, sub, c], i) =>
        s.box("cap" + i, { x: 960 + i * 220, y: 780, w: 195, h: 86, label: t, sub, size: 22, color: c }, { at: `${26 + i * 16}%` })
      );
      s.unfocus({ at: "80%" });
    }},
    { say: "وبين العميل والخادم تتدفق الرسائل في الاتجاهين لاكتشاف الأدوات ثم استدعائها بأمان.", do: s => {
      s.stream("cl0", "sv0", { color: "blue", at: "15%", span: 2.2, every: 0.55 });
      s.stream("sv0", "cl0", { color: "teal", at: "45%", span: 2.2, every: 0.55 });
      s.pulse(["cl0", "sv0"], { at: "70%", color: "teal" });
    }},
    { sec: "بروتوكول JSON-RPC", say: "كل رسائل MCP بصيغة JSON-RPC 2.0؛ يبدأ العميل باكتشاف القدرات بطلب tools/list.", eq: "@T{initialize} @to @B{tools/list} @to @O{tools/call}", do: s => {
      s.clear({ dur: 0.45 });
      s.code("rq", { x: 430, y: 525, size: 22, title: "client → server", lines: [
        "{ \"jsonrpc\": \"2.0\",",
        "  \"id\": 1,",
        "  \"method\": \"tools/list\" }"
      ] }, { at: "5%", dur: 1.0 });
      s.arrow("ar", { x1: 695, y1: 525, x2: 865, y2: 525, color: "teal", pulse: true }, { at: "38%" });
      s.code("rs", { x: 1170, y: 525, size: 21, title: "server → client", lines: [
        "{ \"tools\": [",
        "  {\"name\": \"get_order\",",
        "   \"inputSchema\": {\"order_id\": \"int\"}},",
        "  {\"name\": \"refund\", …} ] }"
      ] }, { at: "48%", dur: 1.2 });
    }},
    { say: "ثم حين يقرر النموذج استخدام أداة، يرسل العميل tools/call بالمعاملات ويستلم النتيجة المهيكلة.", do: s => {
      s.out(["rq", "rs", "ar"], { at: "0%", dur: 0.3 });
      s.code("cl", { x: 450, y: 525, size: 21, title: "tools/call", lines: [
        "{ \"method\": \"tools/call\",",
        "  \"params\": {",
        "    \"name\": \"get_order\",",
        "    \"arguments\": {\"order_id\": 812} } }"
      ], hl: 2, hc: "orange" }, { at: "15%", dur: 1.1 });
      s.arrow("a2", { x1: 755, y1: 525, x2: 910, y2: 525, color: "green", pulse: true }, { at: "46%" });
      s.code("re", { x: 1210, y: 525, size: 21, title: "tool result", lines: [
        "{ \"content\": [{",
        "  \"type\": \"text\",",
        "  \"text\": \"shipped · ETA Fri\" }] }"
      ], hl: 2, hc: "green" }, { at: "56%", dur: 1.0 });
    }},
    { sec: "النواقل والكود", say: "وللربط ناقلان قياسيان: stdio لخادم محلي كعملية فرعية، وStreamable HTTP لخادم بعيد.", do: s => {
      s.clear({ dur: 0.45 });
      s.versus("vs", "stdio (Local)", "Streamable HTTP (Remote)", { colors: ["green", "blue"] }, { at: "0%" });
      s.icon("i1", { name: "terminal", x: 435, y: 490, s: 96, color: "green" }, { at: "24%" });
      s.note("n1", { text: "local subprocess · stdin/stdout", x: 435, y: 625, font: "math", color: "green", size: 25 }, { at: "36%" });
      s.icon("i2", { name: "globe", x: 1165, y: 490, s: 96, color: "blue" }, { at: "54%" });
      s.note("n2", { text: "single remote HTTP endpoint /mcp", x: 1165, y: 625, font: "math", color: "blue", size: 25 }, { at: "66%" });
    }},
    { say: "وبناء خادم MCP نظيف ببايثون لا يتجاوز بضعة أسطر باستخدام FastMCP.", do: s => {
      s.clear({ dur: 0.45 });
      s.code("cd", { x: 800, y: 525, size: 23, title: "orders_mcp.py", lines: [
        "from mcp.server.fastmcp import FastMCP",
        "mcp = FastMCP(\"orders\")",
        "",
        "@mcp.tool()",
        "def get_order(order_id: int) -> dict:",
        "    \"\"\"Look up an order by id.\"\"\"",
        "    return db.orders.get(order_id)",
        "",
        "mcp.run()  # stdio by default"
      ] }, { at: "0%", dur: 1.6 });
      s.to("cd", { hl: 3, hc: "orange" }, { at: "38%", dur: 0.2 });
      s.to("cd", { hl: 4, hc: "blue" }, { at: "60%", dur: 0.2 });
      s.to("cd", { hl: 8, hc: "green" }, { at: "80%", dur: 0.2 });
    }},
    { sec: "أمان الخوادم", say: "احذر في الإنتاج: خادم MCP بعيد بلا مصادقة أو فحص Origin يمكن اختراقه من أي متصفح!", do: s => {
      s.clear({ dur: 0.45 });
      s.box("tab", { x: 370, y: 510, w: 320, h: 110, label: "Malicious Web Tab", icon: "browser", color: "red", size: 24 }, { at: "5%" });
      s.box("srv", { x: 1180, y: 510, w: 340, h: 110, label: "Unprotected MCP :8000", icon: "server", color: "orange", size: 23 }, { at: "20%" });
      s.link("att", "tab", "srv", { color: "red", label: "DNS rebinding / CSRF", lc: "red", pulse: true }, { at: "38%" });
      s.flow("tab", "srv", { color: "red", n: 2, at: "48%" });
      s.callout("al", { x: 800, y: 735, label: "0.0.0.0 + no Auth + no Origin check = remote tool hijack!", color: "red", icon: "alert" }, { at: "70%" });
    }},
    { say: "الحل: تحقّق من ترويسة Origin، وافرض مصادقة قوية، واربط الخوادم المحلية على 127.0.0.1 فقط.", eq: "@G{@T{Secure MCP}} = @T{Origin check} + @T{Auth} + @T{127.0.0.1}", do: s => {
      s.out(["tab", "srv", "att", "al"], { at: "0%", dur: 0.35 });
      s.col("sec", [
        "Validate HTTP Origin header strictly",
        "Require OAuth / Bearer token authentication",
        "Bind local HTTP servers to 127.0.0.1 only",
        "Grant least-privilege scopes per tool"
      ], { x: 800, y: 530, size: 25, icons: ["shieldok", "key", "lock", "tool"], colors: ["green", "gold", "blue", "teal"], w: 720 }, { at: "18%", st: 0.16 });
    }},
    { sec: "الخلاصة", say: "هكذا تكتمل الصورة: Host يشغّل عملاء، يتحدثون JSON-RPC عبر stdio أو HTTP إلى خادم آمن.", do: s => {
      s.clear({ dur: 0.45 });
      s.chain("sum", ["Host App", "MCP Client", "JSON-RPC", "stdio / HTTP", "MCP Server"], { y: 495, gap: 42, colors: ["blue", "blue", "gold", "teal", "green"], h: 96, size: 21, icons: ["window", "plug", "code", "globe", "server"], pulse: true }, { at: "5%", st: 0.14 });
      s.stream("sum0", "sum4", { color: "teal", at: "54%", span: 2.5, every: 0.5 });
    }},
    { say: "ابنِ خادم أدواتك مرة واحدة بمعيار MCP، وأمّنه جيدًا، فيتصل بأي تطبيق ذكاء اصطناعي فورًا.", eq: "@T{Build once in } @C{MCP} @; @Rightarrow @; @G{@T{plug into any AI host}}", do: s => {
      s.callout("fin", { x: 800, y: 725, label: "Tools + Resources + Prompts · Standardized & Secured", color: "teal", icon: "shieldok" }, { at: "20%" });
      s.pulse(["sum0", "sum1", "sum2", "sum3", "sum4"], { at: "56%", color: "teal" });
    }}
  ]);

  // ================================================================== A3.1 Contextual retrieval in practice
  X.lesson("A3.1", [
    { sec: "مشكلة المقطع المعزول", say: "اقرأ هذا المقطع وحده: «نمت الإيرادات 3% مقارنة بالربع السابق». عن أي شركة أو عام يتحدث؟", do: s => {
      s.box("ch", { x: 800, y: 390, w: 760, h: 100, label: "\"Revenue grew by 3% over the previous quarter.\"", size: 25, color: "orange", font: "ui" }, { at: "5%" });
      s.grid("qs", ["Which company?", "Which year?", "Which quarter?"], { cols: 3, y: 600, cw: 300, ch: 82, size: 24, icons: ["question", "question", "question"], colors: ["red", "red", "red"] }, { at: "34%", st: 0.16 });
      s.callout("ms", { x: 800, y: 765, label: "Splitting destroyed the document context!", color: "red", icon: "alert" }, { at: "74%" });
    }},
    { say: "لذلك عند سؤال «نمو إيرادات ACME في الربع الثاني 2025»، يفشل المتجه وBM25 في إيجاده!", do: s => {
      s.out(["qs*", "ms"], { at: "0%", dur: 0.3 });
      s.bubble("q", { text: "What was ACME's Q2 2025 revenue growth?", side: "u", x: 460, y: 640, w: 460, color: "blue", size: 22 }, { at: "18%" });
      s.box("fail", { x: 1120, y: 640, w: 430, h: 86, label: "Vector & BM25 miss chunk ✗", sub: "neither 'ACME' nor 'Q2 2025' present", color: "red", size: 22 }, { at: "48%" });
      s.link("fl", "q", "fail", { color: "red" }, { at: "40%" });
      s.mark("fx", "fail", "x", { at: "70%" });
    }},
    { sec: "التضمين السياقي", say: "في الاسترجاع السياقي، نولّد بنموذج رخيص سياقًا قصيرًا نُلحقه بأول كل مقطع قبل فهرسته.", eq: "@T{chunk}' = @Y{@T{context}(@T{doc}, c)} + c", do: s => {
      s.clear({ dur: 0.45 });
      s.doc("d", { x: 270, y: 520, w: 170, h: 220, lines: 8, title: "ACME Q2 2025 Filing", color: "blue" }, { at: "5%" });
      s.box("sm", { x: 700, y: 520, w: 240, h: 110, label: "cheap fast LLM", icon: "bolt", color: "teal", size: 24 }, { at: "22%" });
      [0, 1, 2].forEach(i =>
        s.box("cx" + i, { x: 1210, y: 380 + i * 140, w: 440, h: 88, label: "[ACME Q2 2025] + chunk " + (i + 1), size: 21, color: "gold" }, { at: `${44 + i * 12}%` })
      );
      s.link("l1", "d", "sm", { color: "blue", pulse: true }, { at: "30%" });
      [0, 1, 2].forEach(i => s.link("l2" + i, "sm", "cx" + i, { color: "gold", w: 2.5, pulse: true }, { at: `${48 + i * 12}%` }));
    }},
    { say: "ولأن المستند الكامل يتكرر مع كل مقطع، نخزّنه بـ Prompt Caching فتهبط التكلفة نحو 90%!", eq: "@T{cost} @xrightarrow{@G{@T{prompt cache}}} @G{-85@% @text{ to } -90@%}", do: s => {
      s.to("d", { stroke: "green" }, { at: "12%", dur: 0.4 });
      s.badge("ca", { x: 270, y: 720, text: "PROMPT CACHED ✓", color: "green" }, { at: "24%" });
      s.bar("cost", { x: 580, y: 790, w: 480, v: 0.92, color: "red", label: "cost", val: "$1.00", size: 26, h: 30 }, { at: "35%" });
      s.to("cost", { v: 0.12, color: "green", val: "$0.11" }, { at: "58%", dur: 1.0 });
    }},
    { say: "ثم نفهرس هذا المقطع السياقي في البحث المتجهي وفي BM25 معًا، فتستفيد الطريقتان من السياق.", do: s => {
      s.focus(["cx0", "cx1", "cx2"], { zoom: 1.06, at: "12%" });
      s.pulse(["cx0", "cx1", "cx2"], { at: "45%", color: "green" });
      s.unfocus({ at: "76%" });
    }},
    { sec: "الدمج وإعادة الترتيب", say: "عند البحث، نجمع أفضل عشرين نتيجة من المتجهات ومن BM25 عبر دمج الرتب المتبادل RRF.", eq: "@T{RRF}(d) = @sum_{r} @frac{1}{60 + @T{rank}_r(d)}", do: s => {
      s.clear({ dur: 0.45 });
      s.note("vt", { text: "Contextual Vector", x: 380, y: 330, color: "green", font: "math", size: 25 }, { at: "5%" });
      s.col("v", ["c4", "c9", "c2", "c7"], { x: 380, y: 540, size: 25, w: 160, colors: ["green", "gold", "green", "green"] }, { at: "12%", st: 0.08 });
      s.note("bt", { text: "Contextual BM25", x: 740, y: 330, color: "blue", font: "math", size: 25 }, { at: "24%" });
      s.col("b", ["c9", "c1", "c4", "c5"], { x: 740, y: 540, size: 25, w: 160, colors: ["gold", "blue", "blue", "blue"] }, { at: "30%", st: 0.08 });
      s.arrow("ar", { x1: 860, y1: 540, x2: 1060, y2: 540, color: "gold", label: "RRF", lc: "gold", pulse: true }, { at: "52%" });
      s.note("ft", { text: "Fused Top-20", x: 1200, y: 330, color: "gold", font: "math", size: 25 }, { at: "60%" });
      s.col("f", ["c9 (#1)", "c4 (#2)", "c1 (#3)", "c2 (#4)"], { x: 1200, y: 540, size: 24, w: 200, colors: ["gold", "gold", "soft", "soft"] }, { at: "65%", st: 0.08 });
    }},
    { say: "ثم يمرّر أفضل عشرين مرشحًا إلى Reranker يقرأ السؤال مع كل مقطع ويختار أدق خمسة.", eq: "@T{reranker}(q, @; @T{top } 20) @to @G{@T{top } 5}", do: s => {
      s.out(["v*", "b*", "vt", "bt", "ar"], { at: "0%", dur: 0.35 });
      s.to(["f*", "ft"], { dx: -760 }, { at: "15%", dur: 0.7 });
      s.box("rr", { x: 830, y: 540, w: 260, h: 120, label: "Cross-Encoder\nReranker", icon: "filter", color: "purple", size: 23 }, { at: "38%" });
      s.box("t5", { x: 1240, y: 540, w: 260, h: 120, label: "Top-5 Exact\nChunks ✓", icon: "check", color: "green", size: 23 }, { at: "60%" });
      s.link("l1", "f1", "rr", { color: "gold", pulse: true }, { at: "48%" });
      s.link("l2", "rr", "t5", { color: "green", pulse: true }, { at: "66%" });
      s.stream("rr", "t5", { color: "green", at: "70%", span: 1.6, every: 0.45 });
    }},
    { say: "وفي الكود لا تتجاوز مرحلة الاسترجاع وإعادة الترتيب سطرين واضحين بعد الفهرسة السياقية.", do: s => {
      s.clear({ dur: 0.45 });
      s.code("cd", { x: 800, y: 520, size: 22, title: "contextual_retrieve.py", lines: [
        "vec_hits  = vector_search(q, k=20)            # semantic",
        "bm25_hits = bm25_search(q, k=20)              # lexical",
        "cands = rrf_fuse(vec_hits, bm25_hits)[:20]    # rank fusion",
        "top_5 = reranker.score(query=q, docs=cands)[:5]"
      ] }, { at: "0%", dur: 1.4 });
      s.to("cd", { hl: 2, hc: "gold" }, { at: "45%", dur: 0.25 });
      s.to("cd", { hl: 3, hc: "purple" }, { at: "72%", dur: 0.25 });
    }},
    { sec: "الأرقام والقياس", say: "أفادت Anthropic أن الاسترجاع السياقي خفّض فشل الاسترجاع 49%، و67% مع إعادة الترتيب!", eq: "@T{failed retrievals}: @; @G{-49@%} @; @xrightarrow{+ @T{rerank}} @; @C{-67@%}", do: s => {
      s.clear({ dur: 0.45 });
      s.bars("bn", [
        ["Baseline RAG (failures)", 0.90, "red", "100%"],
        ["+ Contextual Vec & BM25", 0.46, "gold", "−49% failures"],
        ["+ Reranker (top-20 → 5)", 0.30, "green", "−67% failures"]
      ], { x: 640, y: 510, w: 560, gap: 110, size: 26, h: 36 }, { at: "10%" });
      s.badge("ant", { x: 800, y: 790, text: "Anthropic Contextual Retrieval Benchmark", color: "teal" }, { at: "72%" });
    }},
    { sec: "فخّ القياس", say: "لكن لا تعتمد على أرقام المقالات وحدها؛ قِس recall@k قبل وبعد على أسئلة مستنداتك أنت!", eq: "@T{recall@@k} = @frac{@T{relevant in top-}k}{@T{all relevant}}", do: s => {
      s.out(["bn*", "ant"], { at: "0%", dur: 0.35 });
      s.bars("rk", [
        ["your eval set · before", 0.71, "red", "recall@5 = 0.71"],
        ["your eval set · after", 0.89, "green", "recall@5 = 0.89"]
      ], { x: 640, y: 470, w: 540, gap: 115, size: 28, h: 38 }, { at: "16%" });
      s.callout("lat", { x: 800, y: 745, label: "Rerank top-20 (not top-500) to keep latency crisp (~120 ms)", color: "gold", icon: "clock" }, { at: "64%" });
    }},
    { say: "وبهذا تتحقّق أن كل ملّي ثانية إضافية وتكلفة فهرسة تُترجم إلى قفزة فعلية في الجودة.", do: s => {
      s.pulse("rk1", { at: "25%", color: "green" });
      s.pulse("lat", { at: "60%", color: "gold" });
    }},
    { sec: "الخلاصة", say: "الخلاصة: أضف سياقًا لكل مقطع مع التخزين المؤقت، ادمج المتجه وBM25، أعد الترتيب، ثم قِس.", eq: "@Y{Context + Cache} @to @B{Vec + BM25} @to @P{Rerank} @to @G{recall@@k}", do: s => {
      s.clear({ dur: 0.45 });
      s.chain("sum", ["Context + Cache", "Vec + BM25", "RRF Fusion", "Rerank 20→5", "Eval recall@k"], { y: 500, gap: 38, colors: ["gold", "blue", "teal", "purple", "green"], h: 96, size: 21, icons: ["sparkle", "search", "merge", "filter", "gauge"], pulse: true }, { at: "5%", st: 0.14 });
      s.stream("sum0", "sum4", { color: "gold", at: "56%", span: 2.4, every: 0.5 });
    }}
  ]);

  // ================================================================== A3.2 Hybrid search in Postgres
  X.lesson("A3.2", [
    { sec: "حدود كل بحث وحده", say: "ابحث عن رقم طلب مثل 8812-AX بالتضمين وحده؛ سيعيد أرقامًا «تشبهه شكليًا» لكنها خاطئة!", do: s => {
      s.bubble("q", { text: "status of order 8812-AX", side: "u", x: 800, y: 300, w: 380, font: "mono", color: "blue" }, { at: "0%" });
      s.col("vr", ["order 8821-AX (wrong!)", "order 8812-BX (wrong!)", "order 1288-AX (wrong!)"], { x: 800, y: 550, font: "mono", size: 24, w: 460, colors: ["red", "red", "red"] }, { at: "30%", st: 0.16 });
      s.callout("vl", { x: 800, y: 775, label: "Embeddings blur exact IDs, SKUs and error codes!", color: "red", icon: "alert" }, { at: "70%" });
    }},
    { say: "وعلى العكس، البحث النصي يطابق 8812-AX بدقة، لكنه يفوت «مهلة الإرجاع» عند السؤال بـ «استرداد».", do: s => {
      s.clear({ dur: 0.45 });
      s.versus("vs", "Full-Text Search Only", "Vector Search Only", { colors: ["blue", "green"] }, { at: "0%" });
      s.col("ft", ["8812-AX → exact hit ✓", "SKU-99 → exact hit ✓", "'money back' vs 'return' ✗"], { x: 435, y: 560, w: 460, size: 23, icons: ["check", "check", "x"], colors: ["green", "green", "red"] }, { at: "22%", st: 0.16 });
      s.col("vt", ["'money back' → 'return' ✓", "Arabic ↔ English meaning ✓", "order 8812-AX → wrong ID ✗"], { x: 1165, y: 560, w: 460, size: 23, icons: ["check", "check", "x"], colors: ["green", "green", "red"] }, { at: "50%", st: 0.16 });
    }},
    { sec: "البحث الهجين وRRF", say: "الحل هو البحث الهجين داخل PostgreSQL: مسار نصي بـ GIN ومسار متجهي بـ HNSW معًا.", do: s => {
      s.clear({ dur: 0.45 });
      s.box("qq", { x: 800, y: 270, w: 380, h: 66, label: "Query: \"8812-AX refund rule\"", color: "soft", size: 22 }, { at: "5%" });
      s.note("kt", { text: "Full-Text · tsvector (GIN)", x: 430, y: 385, color: "blue", font: "math", size: 24 }, { at: "24%" });
      s.col("kw", ["#1 · order 8812-AX", "#2 · refund policy", "#3 · SKU-99"], { x: 430, y: 550, font: "mono", size: 21, w: 340, colors: ["blue", "gold", "blue"] }, { at: "30%", st: 0.1 });
      s.note("st", { text: "Semantic · pgvector (HNSW)", x: 1170, y: 385, color: "green", font: "math", size: 24 }, { at: "46%" });
      s.col("sm", ["#1 · return window", "#2 · refund policy", "#3 · money back"], { x: 1170, y: 550, size: 21, w: 340, colors: ["green", "gold", "green"] }, { at: "52%", st: 0.1 });
      s.link("lk", "qq", "kw0", { color: "blue", pulse: true }, { at: "34%" });
      s.link("ls", "qq", "sm0", { color: "green", pulse: true }, { at: "56%" });
    }},
    { say: "المسار النصي يرتّب الكلمات الدقيقة بـ ts_rank، فيلتقط رقم الطلب 8812-AX في المرتبة الأولى.", eq: "@B{ts@_rank}(@T{tsv}, @; @T{plainto@_tsquery}(q))", do: s => {
      s.focus(["qq", "kt", "kw0", "kw1", "kw2", "lk"], { zoom: 1.12, at: "10%" });
      s.pulse("kw0", { at: "48%", color: "blue" });
    }},
    { say: "والمسار المتجهي يرتّب المعاني بـ pgvector، فيلتقط سياسة الإرجاع مهما اختلفت صياغة السؤال.", eq: "@G{@T{embedding}} <=> q", do: s => {
      s.unfocus({ at: "0%", dur: 0.3 });
      s.focus(["qq", "st", "sm0", "sm1", "sm2", "ls"], { zoom: 1.12, at: "14%" });
      s.pulse("sm0", { at: "50%", color: "green" });
    }},
    { say: "ثم ندمج الترتيبين بـ RRF؛ لأنه يجمع الرتب لا الدرجات، فما يظهر في القائمتين يصعد للأعلى!", eq: "@T{RRF}(d) = @frac{1}{60 + r_{@G{sem}}} + @frac{1}{60 + r_{@B{kw}}}", do: s => {
      s.unfocus({ at: "0%", dur: 0.3 });
      s.box("rrf", { x: 800, y: 785, w: 460, h: 78, label: "RRF Fusion → Top-5 Winners ✓", icon: "merge", inline: true, size: 24, color: "gold" }, { at: "24%" });
      s.link("a1", "kw2", "rrf", { color: "blue", pulse: true }, { at: "40%" });
      s.link("b1", "sm2", "rrf", { color: "green", pulse: true }, { at: "44%" });
      s.pulse(["kw1", "sm1", "rrf"], { at: "66%", color: "gold" });
    }},
    { sec: "استعلام SQL واحد", say: "وكل ذلك يتم داخل استعلام SQL واحد بـ CTEs، ثم FULL OUTER JOIN لجمع درجات RRF.", do: s => {
      s.clear({ dur: 0.45 });
      s.code("cd", { x: 800, y: 525, size: 19, title: "hybrid_search.sql", lines: [
        "WITH sem AS (SELECT id, ROW_NUMBER() OVER (ORDER BY emb <=> $1) r",
        "             FROM chunks WHERE tenant_id = $3 LIMIT 20),",
        "     kw  AS (SELECT id, ROW_NUMBER() OVER (ORDER BY ts_rank(tsv, q) DESC) r",
        "             FROM chunks WHERE tenant_id = $3 LIMIT 20)",
        "SELECT id, COALESCE(1.0/(60+sem.r),0) + COALESCE(1.0/(60+kw.r),0) AS score",
        "FROM sem FULL OUTER JOIN kw USING (id)",
        "ORDER BY score DESC LIMIT 5;"
      ] }, { at: "0%", dur: 1.6 });
      s.to("cd", { hl: 0, hc: "green" }, { at: "30%", dur: 0.2 });
      s.to("cd", { hl: 2, hc: "blue" }, { at: "52%", dur: 0.2 });
      s.to("cd", { hl: 4, hc: "gold" }, { at: "74%", dur: 0.2 });
    }},
    { sec: "قوة قاعدة البيانات الواحدة", say: "قاعدة PostgreSQL واحدة تعني تشغيلًا أبسط، معاملات ذرية، وتصفية عملاء بلا مزامنة مؤلمة.", do: s => {
      s.clear({ dur: 0.45 });
      s.zone("pg", { x: 800, y: 530, w: 900, h: 430, label: "Single PostgreSQL Database", color: "blue" }, { at: "5%" });
      [
        ["GIN index · tsvector", "exact terms", "blue"],
        ["HNSW index · vector", "semantic meaning", "green"],
        ["WHERE tenant_id = $3", "strict isolation", "gold"],
        ["ACID transactions", "0 sync lag", "teal"]
      ].forEach(([t, sub, c], i) =>
        s.box("f" + i, { x: 590 + (i % 2) * 420, y: 450 + Math.floor(i / 2) * 165, w: 360, h: 100, label: t, sub, size: 22, color: c }, { at: `${22 + i * 14}%` })
      );
    }},
    { sec: "فخّ الإنتاج والأداء", say: "انتبه: ضَع شرط tenant_id داخل كلتا جملتي sem وkw، وإلا ستُهدر الـ LIMIT 20 على عملاء آخرين!", do: s => {
      s.clear({ dur: 0.45 });
      s.versus("vs", "Filter After JOIN (Bug)", "Filter Inside Both CTEs (Fix)", { colors: ["red", "green"] }, { at: "0%" });
      s.col("bd", ["LIMIT 20 filled by other tenants", "returns empty for small tenant", "separate vector DB sync drift"], { x: 435, y: 560, w: 480, size: 23, icons: ["x", "x", "x"], colors: ["red", "red", "red"] }, { at: "24%", st: 0.16 });
      s.col("gd", ["WHERE tenant_id in sem & kw", "full 20+20 hits for this tenant", "1 Postgres DB · atomic updates"], { x: 1165, y: 560, w: 480, size: 23, icons: ["check", "check", "check"], colors: ["green", "green", "green"] }, { at: "52%", st: 0.16 });
    }},
    { say: "وفهرس العمودين معًا: فهرس GIN للنص، وفهرس HNSW للمتجهات، ليبقى الاستعلام الهجين سريعًا.", do: s => {
      s.clear({ dur: 0.45 });
      s.code("ix", { x: 800, y: 390, size: 21, title: "indexes.sql", lines: [
        "CREATE INDEX chunks_tsv_gin  ON chunks USING gin (tsv);",
        "CREATE INDEX chunks_emb_hnsw ON chunks USING hnsw (emb vector_cosine_ops);"
      ] }, { at: "5%", dur: 1.1 });
      s.bars("sp", [
        ["Unindexed hybrid scan", 0.90, "red", "1,400 ms"],
        ["GIN + HNSW hybrid SQL", 0.06, "green", "18 ms"]
      ], { x: 640, y: 690, w: 540, gap: 96, size: 25, h: 32 }, { at: "48%" });
    }},
    { say: "وإن كان تطبيقك يعتمد أكثر على الأكواد أو النصوص، يمكنك ترجيح المعامل ألفا في RRF بسهولة.", eq: "@T{score} = @alpha @cdot @frac{1}{60+r_{@G{sem}}} + (1-@alpha) @cdot @frac{1}{60+r_{@B{kw}}}", do: s => {
      s.out(["ix", "sp*"], { at: "0%", dur: 0.35 });
      s.box("w1", { x: 470, y: 520, w: 400, h: 110, label: "SKU / Code-heavy app", sub: "higher keyword weight", color: "blue", size: 24 }, { at: "20%" });
      s.box("w2", { x: 1130, y: 520, w: 400, h: 110, label: "Policy / Prose Q&A", sub: "higher semantic weight", color: "green", size: 24 }, { at: "50%" });
      s.callout("ev", { x: 800, y: 740, label: "Tune α on your real eval set using recall@5", color: "gold", icon: "gauge" }, { at: "74%" });
    }},
    { sec: "الخلاصة", say: "الخلاصة: نصي بـ GIN + متجهي بـ HNSW + دمج RRF داخل PostgreSQL واحدة ومعزولة بالعميل.", eq: "@T{Postgres Hybrid} = @B{GIN} + @G{HNSW} + @Y{RRF} + @C{tenant@_id}", do: s => {
      s.clear({ dur: 0.45 });
      s.chain("sum", ["Query", "GIN + HNSW", "tenant_id", "RRF Fusion", "Top-5"], { y: 500, gap: 45, colors: ["soft", "blue", "teal", "gold", "green"], h: 96, size: 22, icons: ["search", "db", "shieldok", "merge", "check"], pulse: true }, { at: "5%", st: 0.14 });
      s.stream("sum0", "sum4", { color: "gold", at: "56%", span: 2.4, every: 0.5 });
    }}
  ]);

  // ================================================================== A3.3 Checkpointer vs. Store
  X.lesson("A3.3", [
    { sec: "مشكلة الذاكرة", say: "تخيّل مستخدمًا يطلب «ردودًا مختصرة» في المحادثة الأولى، ثم يفتح محادثة جديدة غدًا.", do: s => {
      s.bubble("b1", { text: "أفضّل الردود المختصرة", side: "u", x: 430, y: 310, w: 340, color: "blue" }, { at: "0%" });
      s.box("t1", { x: 430, y: 510, w: 300, h: 95, label: "Thread #1", sub: "today · active", color: "blue", icon: "chat", size: 22 }, { at: "25%" });
      s.box("t2", { x: 1170, y: 510, w: 300, h: 95, label: "Thread #2", sub: "tomorrow · blank?", color: "red", icon: "chat", size: 22 }, { at: "55%" });
      s.callout("c1", { x: 1170, y: 710, label: "Why did it forget my preference?", color: "red", icon: "alert" }, { at: "78%" });
    }},
    { say: "إن حفظنا كل شيء في محادثة واحدة فستنمو بلا نهاية، وإن خلطنا المحادثات فستتصادم الحالات!", do: s => {
      s.clear({ dur: 0.4 });
      s.versus("vs", "Single Thread Only", "Global State Only", { colors: ["orange", "red"] }, { at: "0%" });
      s.col("l1", ["Thread #2 starts from zero", "No cross-session preferences", "Context grows endlessly"], { x: 435, y: 560, w: 460, size: 23, icons: ["x", "x", "x"], colors: ["red", "red", "red"] }, { at: "25%", st: 0.15 });
      s.col("r1", ["Threads overwrite each other", "No step-level crash recovery", "Broken HITL pause/resume"], { x: 1165, y: 560, w: 460, size: 23, icons: ["x", "x", "x"], colors: ["red", "red", "red"] }, { at: "55%", st: 0.15 });
    }},
    { sec: "Checkpointer: ذاكرة الجلسة", say: "يقدّم LangGraph نظامين: أولهما Checkpointer لحفظ حالة الرسم خطوة بخطوة لكل thread_id.", eq: "@T{Checkpointer}: (thread@_id, step) @to @B{State}_t", do: s => {
      s.clear({ dur: 0.45 });
      s.zone("z1", { x: 510, y: 455, w: 760, h: 320, label: "Thread #1 · thread_id = T1", color: "blue" }, { at: "0%" });
      s.chain("g1", ["Input", "Agent", "Tool"], { x: 510, y: 435, gap: 60, h: 86, size: 21, colors: ["soft", "blue", "teal"], icons: ["chat", "brain", "wrench"], pulse: true }, { at: "18%", st: 0.12 });
      s.box("cp", { x: 510, y: 740, w: 420, h: 92, label: "Checkpointer (Postgres)", sub: "saves every super-step", color: "blue", icon: "db", size: 22 }, { at: "45%" });
      s.link("lcp", "g11", "cp", { color: "blue", pulse: true }, { at: "62%" });
      s.stream("g11", "cp", { color: "blue", at: "70%", span: 2.0, every: 0.6 });
    }},
    { say: "بفضل Checkpointer، إذا تعطّلت أداة في المنتصف، يستأنف الرسم من آخر نقطة محفوظة فورًا.", do: s => {
      s.focus(["g11", "g12", "cp", "lcp"], { zoom: 1.12, at: "8%" });
      s.callout("rec", { x: 880, y: 740, label: "Fault tolerance & time-travel replay ✓", color: "green", icon: "check" }, { at: "45%" });
      s.pulse("cp", { at: "68%", color: "green" });
    }},
    { say: "كما يمكّن Checkpointer إيقاف التنفيذ لموافقة بشرية (HITL)، ثم استئنافه من نفس اللحظة.", do: s => {
      s.unfocus({ at: "0%", dur: 0.3 });
      s.out("rec", { at: "5%", dur: 0.25 });
      s.box("hitl", { x: 960, y: 435, w: 230, h: 86, label: "HITL Pause", sub: "resume later", color: "gold", icon: "shield", size: 20 }, { at: "25%" });
      s.link("lht", "g12", "hitl", { color: "gold", pulse: true }, { at: "45%" });
      s.pulse("cp", { at: "70%", color: "gold" });
    }},
    { sec: "Store: الذاكرة طويلة المدى", say: "أما Store فيحفظ الحقائق والتفضيلات الدائمة عبر كل المحادثات، مقسّمة بـ namespace.", eq: "@T{Store}: (namespace, key) @to @G{Durable Fact}", do: s => {
      s.out(["hitl", "lht"], { at: "0%", dur: 0.3 });
      s.box("st", { x: 1180, y: 740, w: 460, h: 92, label: "Store (Cross-Thread Memory)", sub: "namespace: (tenant, user_42)", color: "green", icon: "layers", size: 21 }, { at: "20%" });
      s.box("t2b", { x: 1230, y: 435, w: 320, h: 92, label: "Thread #2 · thread_id = T2", sub: "reads user preferences ✓", color: "green", icon: "chat", size: 21 }, { at: "45%" });
      s.link("lst1", "g11", "st", { color: "green", pulse: true }, { at: "60%" });
      s.link("lst2", "st", "t2b", { color: "green", pulse: true }, { at: "72%" });
    }},
    { say: "عندما يتعلّم الوكيل تفضيلًا في المحادثة الأولى يكتبه في Store، فتقرأه المحادثة الثانية تلقائيًا.", do: s => {
      s.focus(["st", "t2b", "lst1", "lst2"], { zoom: 1.12, at: "8%" });
      s.stream("g11", "st", { color: "green", at: "25%", span: 1.8, every: 0.55 });
      s.stream("st", "t2b", { color: "green", at: "52%", span: 1.8, every: 0.55 });
    }},
    { say: "وفي الإنتاج نجمع النظامين معًا: Checkpointer للجلسة الحالية، وStore للذاكرة الدائمة.", eq: "@T{Memory} = @B{Checkpointer}(thread) + @G{Store}(user)", do: s => {
      s.unfocus({ at: "0%", dur: 0.3 });
      s.pulse(["cp", "st"], { at: "35%", color: "gold" });
      s.callout("both", { x: 800, y: 255, label: "Most production apps compile with BOTH Checkpointer & Store", color: "gold", icon: "sparkle" }, { at: "58%" });
    }},
    { sec: "الكود وفخّ الإنتاج", say: "في الكود نمرّر الاثنين عند بناء الرسم، ونخزّن التفضيل داخل namespace خاص بالعميل والمستخدم.", do: s => {
      s.clear({ dur: 0.45 });
      s.code("cd", { x: 800, y: 520, size: 19, title: "memory_setup.py", lines: [
        "store.put((\"acme\", user_id), \"prefs\", {\"style\": \"concise\"})",
        "",
        "graph = builder.compile(",
        "    checkpointer=PostgresSaver(pool),",
        "    store=PostgresStore(pool)",
        ")",
        "graph.invoke(msg, config={\"configurable\": {\"thread_id\": \"T2\"}})"
      ] }, { at: "0%", dur: 1.4 });
      s.to("cd", { hl: 0, hc: "green" }, { at: "26%", dur: 0.2 });
      s.to("cd", { hl: 3, hc: "blue" }, { at: "52%", dur: 0.2 });
      s.to("cd", { hl: 4, hc: "green" }, { at: "74%", dur: 0.2 });
    }},
    { say: "احذر خلط namespaces بين العملاء، ولا تضع سجل المحادثة الكامل داخل Store فتتضخم الـ Tokens.", do: s => {
      s.clear({ dur: 0.45 });
      s.versus("vs2", "Common Mistakes", "Production Rule", { colors: ["red", "green"] }, { at: "0%" });
      s.col("bd", ["Shared namespace without tenant_id", "Dumping raw chat logs into Store", "Using Store for step-level state"], { x: 435, y: 560, w: 480, size: 22, icons: ["x", "x", "x"], colors: ["red", "red", "red"] }, { at: "24%", st: 0.15 });
      s.col("gd", ["Namespace by (tenant_id, user_id)", "Store concise facts & preferences", "Use Checkpointer for thread state"], { x: 1165, y: 560, w: 480, size: 22, icons: ["check", "check", "check"], colors: ["green", "green", "green"] }, { at: "52%", st: 0.15 });
    }},
    { say: "فصل الحقائق الدائمة عن سجل الجلسة يبقي الـ Prompt خفيفًا وسريعًا حتى بعد مئات الجلسات.", do: s => {
      s.clear({ dur: 0.4 });
      s.bars("mem", [
        ["Replaying 50 old threads in prompt", 0.90, "red", "28,000 tokens"],
        ["Checkpointer + targeted Store keys", 0.14, "green", "1,400 tokens"]
      ], { x: 650, y: 520, w: 540, gap: 110, size: 24, h: 34 }, { at: "12%" });
    }},
    { sec: "الخلاصة", say: "الخلاصة: Checkpointer يحفظ مسار الجلسة، وStore يحفظ ذاكرة المستخدم عبر كل الجلسات.", eq: "@B{Checkpointer} = @T{Session} @quad | @quad @G{Store} = @T{Cross-Thread}", do: s => {
      s.clear({ dur: 0.45 });
      s.chain("sum", ["Thread State", "Checkpointer", "User Facts", "Store (NS)", "Persistent Agent"], { y: 500, gap: 40, colors: ["soft", "blue", "soft", "green", "gold"], h: 96, size: 20, icons: ["chat", "db", "sparkle", "layers", "check"], pulse: true }, { at: "5%", st: 0.14 });
      s.stream("sum0", "sum4", { color: "gold", at: "56%", span: 2.4, every: 0.5 });
    }}
  ]);

  // ================================================================== A3.4 Interrupts in Practice
  X.lesson("A3.4", [
    { sec: "خطر التنفيذ المباشر", say: "تخيّل وكيلًا يستعد لتنفيذ أداة refund_order للطلب 812 بمبلغ 400 دولار تلقائيًا!", do: s => {
      s.bubble("q", { text: "Refund order #812 ($400)", side: "u", x: 800, y: 290, w: 380, color: "blue" }, { at: "0%" });
      s.box("ag", { x: 460, y: 510, w: 280, h: 96, label: "Agent", sub: "calls refund_order(812, 400)", color: "blue", icon: "brain", size: 21 }, { at: "28%" });
      s.box("pay", { x: 1120, y: 510, w: 310, h: 96, label: "Payment API", sub: "-$400 sent immediately!", color: "red", icon: "alert", size: 21 }, { at: "55%" });
      s.link("l1", "ag", "pay", { color: "red", pulse: true }, { at: "68%" });
    }},
    { say: "خطأ واحد في المعاملات أو هلوسة رقم إضافي قد يسبّب خسارة مالية فورية قبل تدخل أي إنسان.", do: s => {
      s.mark("mk", "pay", "x", { at: "15%" });
      s.callout("al", { x: 800, y: 730, label: "Never execute irreversible tools without a human gate!", color: "red", icon: "shield" }, { at: "45%" });
    }},
    { sec: "آلية interrupt() خطوة بخطوة", say: "الحل هو وضع interrupt() داخل الأداة الحساسة؛ فيتوقف التنفيذ فورًا وتحفظ الحالة في Checkpointer.", eq: "@T{interrupt}(payload) @to @Y{Pause} @to @B{Checkpointer}", do: s => {
      s.clear({ dur: 0.45 });
      s.chain("fl", ["Agent", "refund_tool", "interrupt()", "Checkpointer"], { y: 420, gap: 65, h: 90, size: 21, colors: ["blue", "orange", "gold", "teal"], icons: ["brain", "wrench", "shield", "db"], pulse: true }, { at: "5%", st: 0.14 });
      s.stream("fl0", "fl3", { color: "gold", at: "58%", span: 2.0, every: 0.5 });
    }},
    { say: "انتبه: حمولة interrupt() يجب أن تكون قابلة للتحويل إلى JSON ليتمكن Checkpointer من تخزينها.", do: s => {
      s.focus(["fl2", "fl3"], { zoom: 1.14, at: "8%" });
      s.box("pl", { x: 960, y: 650, w: 560, h: 110, label: "{\"action\": \"refund\", \"id\": 812, \"usd\": 400}", sub: "JSON-serializable payload ✓", color: "gold", font: "mono", size: 18 }, { at: "32%" });
      s.link("lpl", "fl2", "pl", { color: "gold", pulse: true }, { at: "50%" });
    }},
    { say: "تُعرض العملية المعلّقة بوضوح في الواجهة، ويختار الإنسان: موافقة، أو تعديل المبلغ، أو رفض.", do: s => {
      s.unfocus({ at: "0%", dur: 0.3 });
      s.out(["pl", "lpl"], { at: "0%", dur: 0.25 });
      s.box("ui", { x: 460, y: 690, w: 310, h: 92, label: "Pending Action UI", sub: "Approve / Edit / Reject", color: "purple", icon: "chat", size: 21 }, { at: "20%" });
      s.link("lui", "fl2", "ui", { color: "purple", pulse: true }, { at: "35%" });
      s.col("opt", ["Approve → $400", "Edit → $25", "Reject → Cancel"], { x: 1120, y: 690, w: 340, size: 22, colors: ["green", "gold", "red"], icons: ["check", "wrench", "x"] }, { at: "48%", st: 0.15 });
    }},
    { say: "عندما يعدّل الإنسان المبلغ إلى 25 دولارًا ويرسل Command(resume)، يستأنف الرسم وينفّذ بأمان.", eq: "@T{Command}(resume=edit) @to @G{Execute Safe}", do: s => {
      s.pulse("opt1", { at: "20%", color: "gold" });
      s.box("res", { x: 800, y: 265, w: 420, h: 74, label: "Command(resume={usd: 25}) ▶", color: "green", font: "mono", size: 20 }, { at: "38%" });
      s.stream("res", "fl1", { color: "green", at: "58%", span: 2.0, every: 0.5 });
    }},
    { sec: "الكود والتحقق من المدخلات", say: "في الكود نستدعي interrupt()، ثم نفحص قرار الإنسان قبل تنفيذ أي تعديل في قاعدة البيانات.", do: s => {
      s.clear({ dur: 0.45 });
      s.code("cd", { x: 800, y: 520, size: 19, title: "hitl_tool.py", lines: [
        "@tool",
        "def refund_order(order_id: int, amount: float):",
        "    decision = interrupt({\"order\": order_id, \"usd\": amount})",
        "    if decision[\"type\"] == \"reject\":",
        "        return \"Cancelled by human reviewer\"",
        "    final_amt = decision.get(\"usd\", amount)",
        "    return process_refund(order_id, final_amt)"
      ] }, { at: "0%", dur: 1.4 });
      s.to("cd", { hl: 2, hc: "gold" }, { at: "26%", dur: 0.2 });
      s.to("cd", { hl: 3, hc: "red" }, { at: "52%", dur: 0.2 });
      s.to("cd", { hl: 5, hc: "green" }, { at: "74%", dur: 0.2 });
    }},
    { say: "وإذا أدخل الإنسان قيمة غير صالحة مثل مبلغ سالب، نتحقق منها ونعود بحافة شرطية إلى interrupt().", eq: "@T{valid}(input) ? @; @G{Proceed} : @R{Loop Back}", do: s => {
      s.clear({ dur: 0.45 });
      s.chain("val", ["interrupt()", "Validate Input", "Execute Refund"], { y: 430, gap: 90, h: 92, size: 22, colors: ["gold", "blue", "green"], icons: ["shield", "filter", "check"], pulse: true }, { at: "5%", st: 0.14 });
      s.box("inv", { x: 800, y: 690, w: 360, h: 86, label: "Invalid (-$50) → Retry", color: "red", icon: "alert", size: 21 }, { at: "42%" });
      s.link("li1", "val1", "inv", { color: "red", pulse: true }, { at: "56%" });
      s.link("li2", "inv", "val0", { color: "orange", pulse: true }, { at: "72%" });
    }},
    { say: "عرض تفاصيل الأداة بوضوح في الواجهة يختصر وقت المراجعة البشرية إلى ثوانٍ معدودة.", do: s => {
      s.clear({ dur: 0.4 });
      s.zone("uiz", { x: 800, y: 525, w: 720, h: 360, label: "Reviewer Card", color: "purple" }, { at: "5%" });
      s.col("uic", ["Action: refund_order", "Target: Order #812 (Customer: Nora)", "Requested: $400  |  Policy Limit: $100"], { x: 800, y: 485, w: 600, size: 23, colors: ["blue", "teal", "gold"] }, { at: "25%", st: 0.15 });
      s.callout("uib", { x: 800, y: 655, label: "Clear context prevents rubber-stamping!", color: "green", icon: "check" }, { at: "68%" });
    }},
    { sec: "فخّ الإنتاج", say: "انتبه: لا تضع interrupt() داخل حلقة غير حتمية؛ لأن الاستئناف يعيد تشغيل العقدة من بدايتها.", do: s => {
      s.clear({ dur: 0.45 });
      s.versus("vs", "Non-Deterministic Loop (Bug)", "Deterministic Order (Fix)", { colors: ["red", "green"] }, { at: "0%" });
      s.col("bd", ["random() before interrupt()", "interrupt() inside dynamic loop", "Different call order on resume"], { x: 435, y: 560, w: 480, size: 22, icons: ["x", "x", "x"], colors: ["red", "red", "red"] }, { at: "24%", st: 0.15 });
      s.col("gd", ["Keep interrupt() deterministic", "Place at start of node / tool", "Idempotent side-effects after"], { x: 1165, y: 560, w: 480, size: 22, icons: ["check", "check", "check"], colors: ["green", "green", "green"] }, { at: "52%", st: 0.15 });
    }},
    { say: "ولا تضع أبدًا اتصالات قواعد بيانات أو كائنات غير قابلة للتسلسل داخل حمولة المقاطعة.", do: s => {
      s.out(["vs*", "bd*", "gd*"], { at: "0%", dur: 0.3 });
      s.box("badp", { x: 470, y: 520, w: 410, h: 110, label: "DB Connection / Lock Object", sub: "TypeError: not JSON serializable", color: "red", icon: "x", size: 21 }, { at: "18%" });
      s.box("gdp", { x: 1130, y: 520, w: 410, h: 110, label: "Plain Dict / Primitives", sub: "IDs, amounts, strings only ✓", color: "green", icon: "check", size: 21 }, { at: "48%" });
    }},
    { sec: "الخلاصة", say: "الخلاصة: interrupt(JSON) + Checkpointer + التحقق من المدخل يمنحك أتمتة آمنة بتحكم بشري.", eq: "@T{Safe HITL} = @Y{interrupt(JSON)} + @B{Checkpoint} + @G{Validate}", do: s => {
      s.clear({ dur: 0.45 });
      s.chain("sum", ["Sensitive Tool", "interrupt(JSON)", "Human Review", "Validate", "Safe Resume"], { y: 500, gap: 40, colors: ["orange", "gold", "purple", "blue", "green"], h: 96, size: 20, icons: ["wrench", "shield", "chat", "filter", "check"], pulse: true }, { at: "5%", st: 0.14 });
      s.stream("sum0", "sum4", { color: "green", at: "56%", span: 2.4, every: 0.5 });
    }}
  ]);

  // ================================================================== A3.5 Writing Effective Tools for Agents
  X.lesson("A3.5", [
    { sec: "الأداة كعقد مع الوكيل", say: "تخيّل مطوّرًا يغلّف 40 نقطة REST API كـ 40 أداة بأسماء غامضة مثل get_u وfetch_x2!", do: s => {
      s.box("ag", { x: 380, y: 510, w: 260, h: 100, label: "Agent", sub: "which tool to pick?", color: "blue", icon: "brain", size: 23 }, { at: "0%" });
      s.col("tlist", ["get_u(id)", "fetch_o_v2(q)", "list_x_all()", "upd_rec_9(d)"], { x: 1080, y: 510, w: 360, font: "mono", size: 21, colors: ["red", "red", "red", "red"] }, { at: "28%", st: 0.12 });
      s.link("l1", "ag", "tlist1", { color: "red", pulse: true }, { at: "62%" });
    }},
    { say: "كثرة الأدوات المتشابهة والمعرّفات الغامضة تستنزف الـ Tokens وتُربك الوكيل وتخفض دقة الاختيار.", do: s => {
      s.clear({ dur: 0.4 });
      s.bars("br", [
        ["40 raw API wrappers", 0.90, "red", "6,200 schema tokens · 54% acc"],
        ["5 focused agent tools", 0.18, "green", "900 schema tokens · 94% acc"]
      ], { x: 650, y: 520, w: 540, gap: 110, size: 24, h: 34 }, { at: "10%" });
    }},
    { sec: "مبادئ Anthropic الخمسة", say: "الأدوات عقد بين نظام حتمي ووكيل غير حتمي؛ وتلخّص Anthropic تصميمها في خمسة مبادئ عملية.", eq: "@T{Tool Quality} = @B{Scope} + @G{Context} + @Y{Budget}", do: s => {
      s.clear({ dur: 0.45 });
      s.chain("p5", ["High-Impact", "Namespace", "Meaningful", "Token-Light", "Clear Spec"], { y: 480, gap: 38, h: 96, size: 20, colors: ["blue", "teal", "green", "gold", "purple"], icons: ["sparkle", "layers", "doc", "gauge", "wrench"], pulse: true }, { at: "5%", st: 0.12 });
    }},
    { say: "أولًا: نظّم الأدوات المترابطة في نطاقات موحّدة مثل orders_search وorders_get.", do: s => {
      s.focus("p51", { zoom: 1.15, at: "8%" });
      s.callout("ns", { x: 800, y: 710, label: "orders_search · orders_get · orders_refund", color: "teal", icon: "layers" }, { at: "38%" });
    }},
    { say: "ثانيًا: أعد حقولًا مقروءة للإنسان والوكيل، مثل اسم العميل وحالة الطلب، لا مجرد UUIDs غامضة.", do: s => {
      s.unfocus({ at: "0%", dur: 0.25 });
      s.out("ns", { at: "0%", dur: 0.2 });
      s.focus("p52", { zoom: 1.15, at: "12%" });
      s.callout("mc", { x: 800, y: 710, label: "Return status: 'shipped', customer: 'Nora' — not 'st_04'", color: "green", icon: "check" }, { at: "42%" });
    }},
    { say: "ثالثًا: قسّم النتائج الكبيرة بـ pagination وصفِّها واختصرها حتى لا تنفجر نافذة السياق.", eq: "@T{Response} @le @Y{max@_tokens} @; (@T{paginate + filter})", do: s => {
      s.unfocus({ at: "0%", dur: 0.25 });
      s.out("mc", { at: "0%", dur: 0.2 });
      s.focus("p53", { zoom: 1.15, at: "12%" });
      s.callout("tl", { x: 800, y: 710, label: "Default limit=10 + next_cursor + truncated=True", color: "gold", icon: "gauge" }, { at: "42%" });
    }},
    { say: "رابعًا: اكتب وصف الأداة ومعاملاتها كـ Prompt دقيق يوضح متى تُستخدم وما القيود المتوقعة.", do: s => {
      s.unfocus({ at: "0%", dur: 0.25 });
      s.out("tl", { at: "0%", dur: 0.2 });
      s.focus("p54", { zoom: 1.15, at: "12%" });
      s.callout("sp", { x: 800, y: 710, label: "Prompt-engineer docstrings, param enums & examples", color: "purple", icon: "wrench" }, { at: "42%" });
    }},
    { sec: "مقارنة الكود والتقييم", say: "لاحظ الفرق في الكود: أداة واضحة باسم منظّم، ومعامل limit، ووصف صريح للحدود.", do: s => {
      s.clear({ dur: 0.45 });
      s.code("cd", { x: 800, y: 520, size: 19, title: "orders_tools.py", lines: [
        "@tool",
        "def orders_search(email: str, status: str = \"open\", limit: int = 10):",
        "    \"\"\"Search customer orders. Returns up to 10 concise records.",
        "    Use orders_get(order_id) only when full line items are needed.\"\"\"",
        "    rows = db.search_orders(email, status, limit=min(limit, 25))",
        "    return [{\"id\": r.id, \"status\": r.status, \"total\": r.total} for r in rows]"
      ] }, { at: "0%", dur: 1.4 });
      s.to("cd", { hl: 1, hc: "teal" }, { at: "26%", dur: 0.2 });
      s.to("cd", { hl: 2, hc: "purple" }, { at: "52%", dur: 0.2 });
      s.to("cd", { hl: 5, hc: "green" }, { at: "74%", dur: 0.2 });
    }},
    { say: "ثم اختبر الأدوات مع الوكيل نفسه على مهام حقيقية، وراقب أخطاءه لتحسّن أوصاف الأدوات.", eq: "@T{Eval Loop}: @B{Run Agent} @to @O{Inspect Errors} @to @G{Refine Spec}", do: s => {
      s.clear({ dur: 0.45 });
      s.chain("ev", ["Agent Task", "Tool Call Trace", "Find Confusion", "Refine Description"], { y: 500, gap: 55, h: 96, size: 21, colors: ["blue", "teal", "orange", "green"], icons: ["brain", "search", "alert", "wrench"], pulse: true }, { at: "5%", st: 0.14 });
      s.stream("ev0", "ev3", { color: "gold", at: "56%", span: 2.2, every: 0.5 });
    }},
    { sec: "فخّ الإنتاج", say: "لا تُرجع رسائل خطأ مبهمة مثل 500 Error؛ بل أعد إرشادًا عمليًا يخبر الوكيل بالخطوة التالية.", do: s => {
      s.clear({ dur: 0.45 });
      s.versus("vs", "Opaque Error (Stuck)", "Actionable Error (Self-Heal)", { colors: ["red", "green"] }, { at: "0%" });
      s.col("bd", ["\"500 Internal Error\"", "\"Invalid ID\"", "50 KB raw stacktrace"], { x: 435, y: 560, w: 460, size: 22, icons: ["x", "x", "x"], colors: ["red", "red", "red"] }, { at: "24%", st: 0.15 });
      s.col("gd", ["\"Order #881 not found\"", "\"Try orders_search(email=...)\"", "Concise hint in < 40 tokens"], { x: 1165, y: 560, w: 480, size: 22, icons: ["check", "check", "check"], colors: ["green", "green", "green"] }, { at: "52%", st: 0.15 });
    }},
    { say: "وتجنّب تداخل الأدوات؛ إن كانت أداة واحدة تجمع البحث والفلترة بمرونة، فهي أفضل من خمس أدوات متكررة.", do: s => {
      s.out(["vs*", "bd*", "gd*"], { at: "0%", dur: 0.3 });
      s.box("mrg", { x: 800, y: 515, w: 620, h: 115, label: "Consolidate overlapping endpoints", sub: "1 flexible search_orders() > 5 narrow wrappers", color: "blue", icon: "merge", size: 23 }, { at: "22%" });
    }},
    { sec: "الخلاصة", say: "الخلاصة: أدوات قليلة عالية الأثر، منظّمة بـ namespace، مقروءة، موفّرة للـ Tokens، ومُختبرة بالوكيل.", eq: "@T{Great Tools} = @B{Few} + @G{Clear} + @Y{Compact} + @P{Evaluated}", do: s => {
      s.clear({ dur: 0.45 });
      s.chain("sum", ["High-Impact", "Namespace", "Readable", "Paginated", "Agent Eval"], { y: 500, gap: 40, colors: ["blue", "teal", "green", "gold", "purple"], h: 96, size: 20, icons: ["sparkle", "layers", "doc", "gauge", "check"], pulse: true }, { at: "5%", st: 0.14 });
      s.stream("sum0", "sum4", { color: "gold", at: "56%", span: 2.4, every: 0.5 });
    }}
  ]);

  // ================================================================== A3.6 MCP Transports Today
  X.lesson("A3.6", [
    { sec: "لماذا نحتاج نواقل MCP؟", say: "عندما يتصل مضيف الذكاء الاصطناعي بخادم MCP، كيف تنتقل رسائل JSON-RPC بينهما؟", do: s => {
      s.box("h", { x: 420, y: 500, w: 300, h: 105, label: "AI Host / IDE", sub: "Claude, Cursor, Agent", color: "blue", icon: "brain", size: 22 }, { at: "0%" });
      s.box("srv", { x: 1180, y: 500, w: 300, h: 105, label: "MCP Server", sub: "tools, resources, prompts", color: "green", icon: "wrench", size: 22 }, { at: "28%" });
      s.link("l1", "h", "srv", { color: "gold", pulse: true, label: "Transport?" }, { at: "52%" });
      s.stream("h", "srv", { color: "gold", at: "62%", span: 2.0, every: 0.55 });
    }},
    { say: "التشغيل المحلي على جهازك يختلف تمامًا عن استدعاء خادم سحابي بعيد؛ لذا يوجد ناقلان أساسيان.", do: s => {
      s.clear({ dur: 0.4 });
      s.versus("vs", "Local Machine", "Remote Cloud", { colors: ["blue", "green"] }, { at: "0%" });
      s.col("lc", ["Same laptop / container", "Zero network latency", "Transport: stdio"], { x: 435, y: 560, w: 450, size: 23, colors: ["blue", "blue", "teal"] }, { at: "25%", st: 0.14 });
      s.col("rm", ["SaaS / microservice URL", "Auth, TLS & load balancers", "Transport: Streamable HTTP"], { x: 1165, y: 560, w: 450, size: 23, colors: ["green", "green", "gold"] }, { at: "52%", st: 0.14 });
    }},
    { sec: "ناقل stdio المحلي", say: "في ناقل stdio يشغّل المضيفُ الخادمَ كعملية فرعية، ويتبادلان رسائل JSON عبر stdin وstdout.", eq: "@T{stdio}: @B{stdin} / @G{stdout} @; (@T{JSON-RPC lines})", do: s => {
      s.clear({ dur: 0.45 });
      s.box("hp", { x: 420, y: 480, w: 300, h: 105, label: "Host Process", sub: "spawns child process", color: "blue", icon: "cpu", size: 22 }, { at: "5%" });
      s.box("sp", { x: 1180, y: 480, w: 310, h: 105, label: "MCP Subprocess", sub: "reads stdin · writes stdout", color: "green", icon: "code", size: 22 }, { at: "26%" });
      s.link("lsi", "hp", "sp", { color: "blue", pulse: true, label: "stdin (JSON)" }, { at: "48%" });
      s.link("lso", "sp", "hp", { color: "green", pulse: true, label: "stdout (JSON)" }, { at: "62%" });
    }},
    { say: "قاعدة ذهبية في stdio: لا تطبع أي سجلات إلى stdout أبدًا! استخدم stderr فقط كي لا يفسد البروتوكول.", do: s => {
      s.focus(["sp", "lso"], { zoom: 1.12, at: "8%" });
      s.callout("err", { x: 800, y: 720, label: "print() to stdout corrupts JSON-RPC! Always log to stderr.", color: "red", icon: "alert" }, { at: "40%" });
    }},
    { say: "ويُفضَّل أن يدعم أي عميل MCP ناقل stdio كلما أمكن لبساطته وأمانه المحلي.", do: s => {
      s.unfocus({ at: "0%", dur: 0.3 });
      s.out("err", { at: "0%", dur: 0.25 });
      s.callout("ok", { x: 800, y: 720, label: "Local files, Git, CLI tools → stdio is the default choice ✓", color: "green", icon: "check" }, { at: "32%" });
    }},
    { sec: "ناقل Streamable HTTP وتطوره", say: "أما للخوادم البعيدة، فيستقبل الخادم طلبات HTTP POST على نقطة واحدة مثل /mcp.", eq: "@T{POST /mcp} @to @B{JSON} @; @text{or} @; @G{SSE Stream}", do: s => {
      s.clear({ dur: 0.45 });
      s.box("cl", { x: 350, y: 495, w: 270, h: 100, label: "Remote Client", sub: "POST /mcp", color: "blue", icon: "globe", size: 22 }, { at: "5%" });
      s.box("ep", { x: 790, y: 495, w: 270, h: 100, label: "/mcp Endpoint", sub: "single HTTP route", color: "gold", icon: "cloud", size: 22 }, { at: "25%" });
      s.box("js", { x: 1250, y: 375, w: 300, h: 88, label: "JSON Object", sub: "fast single reply", color: "teal", icon: "doc", size: 21 }, { at: "48%" });
      s.box("ss", { x: 1250, y: 615, w: 300, h: 88, label: "SSE Stream", sub: "request-scoped progress", color: "green", icon: "sparkle", size: 21 }, { at: "62%" });
      s.link("l1", "cl", "ep", { color: "gold", pulse: true }, { at: "34%" });
      s.link("l2", "ep", "js", { color: "teal", pulse: true }, { at: "54%" });
      s.link("l3", "ep", "ss", { color: "green", pulse: true }, { at: "68%" });
    }},
    { say: "تطوّر هذا الناقل بسرعة: بدأ في 2025-03-26 بديلًا لـ HTTP+SSE، ثم بُسِّط في مراجعة 2026-07-28.", do: s => {
      s.clear({ dur: 0.45 });
      s.chain("tl", ["2024: HTTP+SSE", "2025-03: Streamable", "2026-07: Stateless"], { y: 495, gap: 65, h: 105, size: 21, colors: ["red", "gold", "green"], icons: ["x", "cloud", "check"], pulse: true }, { at: "5%", st: 0.16 });
      s.callout("nt", { x: 800, y: 720, label: "2026-07-28 removed GET stream & protocol-level sessions", color: "teal", icon: "sparkle" }, { at: "55%" });
    }},
    { say: "إزالة جلسات البروتوكول ونقطة GET جعلت الخوادم البعيدة أسهل في التوسّع وتوزيع الحمل (Load Balancing).", do: s => {
      s.focus("tl2", { zoom: 1.15, at: "10%" });
      s.pulse("tl2", { at: "45%", color: "green" });
    }},
    { sec: "مثال الطلب والرد", say: "عمليًا، يرسل العميل ترويسة Accept تقبل JSON وSSE معًا على نفس مسار POST /mcp.", do: s => {
      s.clear({ dur: 0.45 });
      s.code("cd", { x: 800, y: 520, size: 19, title: "mcp_request.http", lines: [
        "POST /mcp HTTP/1.1",
        "Host: api.example.com",
        "Accept: application/json, text/event-stream",
        "Authorization: Bearer <token>",
        "",
        "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/call\",\"params\":{\"name\":\"orders_get\"}}"
      ] }, { at: "0%", dur: 1.4 });
      s.to("cd", { hl: 0, hc: "gold" }, { at: "25%", dur: 0.2 });
      s.to("cd", { hl: 2, hc: "green" }, { at: "50%", dur: 0.2 });
      s.to("cd", { hl: 5, hc: "blue" }, { at: "74%", dur: 0.2 });
    }},
    { sec: "فخّ الإنتاج والتوافق", say: "تحقّق دائمًا من إصدار المواصفة الذي يدعمه الـ SDK لديك، وخطّط للتوافق العكسي مع العملاء الأقدم.", do: s => {
      s.clear({ dur: 0.45 });
      s.versus("vs2", "Version Mismatch (Break)", "Version-Aware (Safe)", { colors: ["red", "green"] }, { at: "0%" });
      s.col("bd", ["Assume old /sse endpoint exists", "Expect sticky session IDs blindly", "No fallback on older clients"], { x: 435, y: 560, w: 470, size: 22, icons: ["x", "x", "x"], colors: ["red", "red", "red"] }, { at: "24%", st: 0.15 });
      s.col("gd", ["Check SDK target spec version", "Support POST /mcp JSON + SSE", "Plan backward compatibility"], { x: 1165, y: 560, w: 470, size: 22, icons: ["check", "check", "check"], colors: ["green", "green", "green"] }, { at: "52%", st: 0.15 });
    }},
    { say: "ولا تنسَ تأمين نقطة /mcp البعيدة بمصادقة Bearer/OAuth والتحقق من ترويسة Origin.", do: s => {
      s.out(["vs2*", "bd*", "gd*"], { at: "0%", dur: 0.3 });
      s.box("sec", { x: 800, y: 515, w: 620, h: 115, label: "Remote HTTP Security Checklist", sub: "TLS + OAuth/Bearer + Origin validation on /mcp", color: "gold", icon: "shieldok", size: 22 }, { at: "20%" });
    }},
    { sec: "الخلاصة", say: "الخلاصة: استخدم stdio للأدوات المحلية، وStreamable HTTP عبر POST /mcp للخوادم البعيدة.", eq: "@T{MCP}: @B{stdio (Local)} @quad | @quad @G{Streamable HTTP (Remote)}", do: s => {
      s.clear({ dur: 0.45 });
      s.chain("sum", ["Local Host", "stdio (stdin/out)", "Remote Client", "POST /mcp", "JSON or SSE"], { y: 500, gap: 38, colors: ["blue", "teal", "soft", "gold", "green"], h: 96, size: 20, icons: ["cpu", "code", "globe", "cloud", "check"], pulse: true }, { at: "5%", st: 0.14 });
      s.stream("sum2", "sum4", { color: "green", at: "56%", span: 2.2, every: 0.5 });
    }}
  ]);

  // ================================================================== A3.7 GraphRAG & Long-Term Agent Memory
  X.lesson("A3.7", [
    { sec: "حدود البحث المتجهي العادي", say: "اسأل نظام RAG تقليديًا: «ما أبرز المخاطر المشتركة عبر كل العقود الـ 500 في شركتنا؟»", do: s => {
      s.bubble("q", { text: "Main risks across all 500 contracts?", side: "u", x: 800, y: 295, w: 460, color: "blue" }, { at: "0%" });
      s.col("ch", ["Chunk #12 (Contract A)", "Chunk #89 (Contract B)", "Chunk #401 (Contract C)"], { x: 800, y: 540, w: 420, size: 22, colors: ["orange", "orange", "orange"] }, { at: "35%", st: 0.15 });
      s.callout("al", { x: 800, y: 745, label: "Top-K chunks miss corpus-wide & multi-hop links!", color: "red", icon: "alert" }, { at: "70%" });
    }},
    { say: "البحث المتجهي يلتقط قطعًا متشابهة منفردة، لكنه يعجز عن رؤية الشبكة الكاملة التي تربط المستندات.", do: s => {
      s.clear({ dur: 0.4 });
      s.versus("vs", "Vector RAG (Isolated Pieces)", "GraphRAG (Evidence Board)", { colors: ["red", "green"] }, { at: "0%" });
      s.col("vl", ["Finds local text similarity", "Misses 2-hop / 3-hop links", "Weak on global summaries"], { x: 435, y: 560, w: 450, size: 22, icons: ["check", "x", "x"], colors: ["teal", "red", "red"] }, { at: "24%", st: 0.15 });
      s.col("gl", ["Extracts Entities & Relations", "Traverses multi-hop paths", "Summarizes whole communities"], { x: 1165, y: 560, w: 450, size: 22, icons: ["check", "check", "check"], colors: ["green", "green", "green"] }, { at: "52%", st: 0.15 });
    }},
    { sec: "كيف يعمل GraphRAG؟", say: "يستخرج GraphRAG الكيانات والعلاقات في رسم معرفي، تمامًا مثل لوحة المحقق التي تربط كل خيط.", eq: "@T{GraphRAG} = (@B{Entities}, @; @G{Relations}) + @Y{Communities}", do: s => {
      s.clear({ dur: 0.45 });
      s.box("c1", { x: 380, y: 400, w: 250, h: 86, label: "Contract A", color: "blue", icon: "doc", size: 21 }, { at: "5%" });
      s.box("c2", { x: 380, y: 630, w: 250, h: 86, label: "Contract B", color: "blue", icon: "doc", size: 21 }, { at: "18%" });
      s.box("vn", { x: 800, y: 515, w: 270, h: 92, label: "Vendor X", sub: "Shared Entity", color: "gold", icon: "sparkle", size: 22 }, { at: "32%" });
      s.box("rk", { x: 1220, y: 515, w: 280, h: 92, label: "Single-Source Risk", sub: "Community Summary", color: "red", icon: "alert", size: 21 }, { at: "48%" });
      s.link("l1", "c1", "vn", { color: "green", pulse: true, label: "DEPENDS_ON" }, { at: "56%" });
      s.link("l2", "c2", "vn", { color: "green", pulse: true, label: "DEPENDS_ON" }, { at: "64%" });
      s.link("l3", "vn", "rk", { color: "red", pulse: true, label: "EXPOSES" }, { at: "72%" });
    }},
    { say: "بمجرد تتبع الحواف في الرسم، يكتشف الوكيل فورًا أن 40 عقدًا تعتمد على مورّد واحد خطر!", do: s => {
      s.stream("c1", "rk", { color: "gold", at: "15%", span: 2.2, every: 0.5 });
      s.stream("c2", "rk", { color: "gold", at: "25%", span: 2.2, every: 0.5 });
      s.pulse("rk", { at: "68%", color: "red" });
    }},
    { say: "كما تُلخَّص كل مجموعة كيانات مترابطة مسبقًا للإجابة عن الأسئلة الشاملة بسرعة ودقة.", do: s => {
      s.focus("rk", { zoom: 1.15, at: "10%" });
      s.callout("cm", { x: 800, y: 740, label: "Pre-computed community summaries answer global queries in 1 hop ✓", color: "green", icon: "check" }, { at: "45%" });
    }},
    { sec: "أنواع ذاكرة الوكيل الثلاثة", say: "وبالتوازي مع GraphRAG، تنقسم ذاكرة الوكيل طويلة المدى إلى ثلاثة أنواع متكاملة.", eq: "@T{Memory} = @B{Semantic} + @G{Episodic} + @P{Procedural}", do: s => {
      s.clear({ dur: 0.45 });
      s.box("m1", { x: 350, y: 510, w: 360, h: 135, label: "Semantic Memory", sub: "Facts & user preferences", color: "blue", icon: "doc", size: 22 }, { at: "10%" });
      s.box("m2", { x: 800, y: 510, w: 360, h: 135, label: "Episodic Memory", sub: "Past runs & interactions", color: "green", icon: "chat", size: 22 }, { at: "34%" });
      s.box("m3", { x: 1250, y: 510, w: 360, h: 135, label: "Procedural Memory", sub: "Learned rules & skills", color: "purple", icon: "wrench", size: 22 }, { at: "58%" });
    }},
    { say: "الدلالية تحفظ الحقائق مثل «يفضّل Python»، والحدثية تحفظ تجارب سابقة نجحت أو فشلت.", do: s => {
      s.focus(["m1", "m2"], { zoom: 1.12, at: "10%" });
      s.pulse("m1", { at: "35%", color: "blue" });
      s.pulse("m2", { at: "68%", color: "green" });
    }},
    { say: "أما الإجرائية فتحفظ القواعد المتعلّمة مثل: «تحقّق دائمًا من الاختبارات قبل تسليم الكود».", do: s => {
      s.unfocus({ at: "0%", dur: 0.25 });
      s.focus("m3", { zoom: 1.15, at: "15%" });
      s.pulse("m3", { at: "55%", color: "purple" });
    }},
    { sec: "تحديث الذاكرة والخصوصية", say: "عمليًا نخزّن كل حقيقة مع نوعها وطابعها الزمني وفترة صلاحيتها (TTL) لتبقى الذاكرة نظيفة.", do: s => {
      s.clear({ dur: 0.45 });
      s.code("cd", { x: 800, y: 520, size: 19, title: "agent_memory.py", lines: [
        "memory.upsert(",
        "    user_id=uid,",
        "    kind=\"semantic\",",
        "    fact=\"Prefers concise Arabic replies with Python code\",",
        "    updated_at=now(),",
        "    ttl_days=180",
        ")"
      ] }, { at: "0%", dur: 1.4 });
      s.to("cd", { hl: 2, hc: "blue" }, { at: "26%", dur: 0.2 });
      s.to("cd", { hl: 3, hc: "green" }, { at: "52%", dur: 0.2 });
      s.to("cd", { hl: 4, hc: "gold" }, { at: "74%", dur: 0.2 });
    }},
    { say: "وعند تعارض حقيقة جديدة مع قديمة، نستبدل القديمة فورًا ولا نترك الحقيقتين تتصارعان في الـ Prompt.", eq: "@T{Upsert}: @R{Old Fact} @to @G{New Fact} + @Y{Timestamp}", do: s => {
      s.clear({ dur: 0.45 });
      s.box("old", { x: 430, y: 510, w: 360, h: 105, label: "Old: Prefers Java", sub: "2025-01 · overwritten", color: "red", icon: "x", size: 22 }, { at: "10%" });
      s.box("new", { x: 1170, y: 510, w: 360, h: 105, label: "New: Prefers Python", sub: "2026-11 · active ✓", color: "green", icon: "check", size: 22 }, { at: "42%" });
      s.link("lup", "old", "new", { color: "gold", pulse: true, label: "upsert + timestamp" }, { at: "62%" });
    }},
    { say: "والأهم أخلاقيًا وتقنيًا: امنح المستخدم واجهة واضحة لعرض ذكرياته المخزنة وحذف أيّ منها فورًا.", do: s => {
      s.clear({ dur: 0.4 });
      s.callout("priv", { x: 800, y: 470, label: "User Privacy Control: View · Edit · Delete Stored Memories", color: "teal", icon: "shieldok" }, { at: "15%" });
      s.box("ttl", { x: 800, y: 630, w: 500, h: 95, label: "Enforce ttl_days & tenant isolation", sub: "expire stale facts automatically", color: "gold", icon: "gauge", size: 21 }, { at: "52%" });
    }},
    { say: "بدمج Vector RAG السريع مع GraphRAG والذاكرة الثلاثية، يحصل الوكيل على استرجاع دقيق وشامل.", do: s => {
      s.clear({ dur: 0.45 });
      s.box("ag", { x: 800, y: 315, w: 300, h: 92, label: "Complete Agent", sub: "unified recall", color: "gold", icon: "brain", size: 22 }, { at: "5%" });
      s.box("r1", { x: 360, y: 590, w: 340, h: 105, label: "Vector RAG", sub: "fast local chunks", color: "blue", icon: "search", size: 21 }, { at: "25%" });
      s.box("r2", { x: 800, y: 590, w: 340, h: 105, label: "GraphRAG", sub: "multi-hop & global", color: "teal", icon: "layers", size: 21 }, { at: "40%" });
      s.box("r3", { x: 1240, y: 590, w: 340, h: 105, label: "3-Tier Memory", sub: "facts, runs & rules", color: "green", icon: "sparkle", size: 21 }, { at: "55%" });
      s.link("lr1", "r1", "ag", { color: "blue", pulse: true }, { at: "62%" });
      s.link("lr2", "r2", "ag", { color: "teal", pulse: true }, { at: "68%" });
      s.link("lr3", "r3", "ag", { color: "green", pulse: true }, { at: "74%" });
    }},
    { sec: "الخلاصة", say: "الخلاصة: GraphRAG يربط الكيانات عبر المستندات، والذاكرة الثلاثية تحفظ الحقائق والتجارب بأمان.", eq: "@T{Recall} = @B{GraphRAG} + @G{3-Tier Memory} + @Y{TTL & Control}", do: s => {
      s.clear({ dur: 0.45 });
      s.chain("sum", ["Entities + Graph", "Semantic", "Episodic", "Procedural", "Upsert + Delete"], { y: 500, gap: 38, colors: ["teal", "blue", "green", "purple", "gold"], h: 96, size: 20, icons: ["layers", "doc", "chat", "wrench", "shieldok"], pulse: true }, { at: "5%", st: 0.14 });
      s.stream("sum0", "sum4", { color: "gold", at: "56%", span: 2.4, every: 0.5 });
    }}
  ]);

  // ================================================================== A3.8 Code Execution Sandboxes & Computer-Use Agents
  X.lesson("A3.8", [
    { sec: "لماذا ينفّذ الوكيل الكود؟", say: "اطلب من نموذج لغوي حساب إحصاءات ملف CSV ضخم نصيًا؛ سيخترع أرقامًا تبدو مقنعة لكنها خاطئة!", do: s => {
      s.bubble("q", { text: "Compute revenue growth from sales.csv", side: "u", x: 800, y: 295, w: 450, color: "blue" }, { at: "0%" });
      s.box("llm", { x: 800, y: 515, w: 420, h: 100, label: "Text-Only LLM Guess", sub: "+14.2% (hallucinated math!)", color: "red", icon: "alert", size: 22 }, { at: "35%" });
      s.mark("mk", "llm", "x", { at: "68%" });
    }},
    { say: "كتابة كود Python وتشغيله يمنحان الوكيل دقة رياضية تامة؛ لكن تشغيله على خادمك كارثة أمنية!", do: s => {
      s.clear({ dur: 0.4 });
      s.versus("vs", "Host exec() (Catastrophic)", "Isolated Sandbox (Safe)", { colors: ["red", "green"] }, { at: "0%" });
      s.col("bd", ["Reads /etc/passwd & .env keys", "Deletes files or mines crypto", "Infinite loop freezes API"], { x: 435, y: 560, w: 460, size: 22, icons: ["x", "x", "x"], colors: ["red", "red", "red"] }, { at: "24%", st: 0.15 });
      s.col("gd", ["Ephemeral MicroVM per run", "Zero host secrets or disk", "Hard CPU, RAM & time caps"], { x: 1165, y: 560, w: 460, size: 22, icons: ["check", "check", "check"], colors: ["green", "green", "green"] }, { at: "52%", st: 0.15 });
    }},
    { sec: "معمارية الـ Sandbox المعزولة", say: "لذلك نعزل كل كود غير موثوق داخل MicroVM مؤقتة مثل E2B أو Firecracker، ونُعيد المخرجات فقط.", eq: "@T{Safe Run} = @B{MicroVM} + @R{No Secrets} + @Y{Timeout}", do: s => {
      s.clear({ dur: 0.45 });
      s.box("ag", { x: 260, y: 500, w: 230, h: 96, label: "Agent Code", sub: "untrusted Python", color: "orange", icon: "code", size: 21 }, { at: "5%" });
      s.zone("vm", { x: 810, y: 500, w: 540, h: 310, label: "Ephemeral MicroVM (E2B / Firecracker)", color: "blue" }, { at: "22%" });
      s.col("iso", ["Read-only root FS", "No host .env secrets", "allow_internet = False"], { x: 810, y: 510, w: 380, size: 21, colors: ["blue", "red", "gold"], icons: ["shield", "shieldok", "filter"] }, { at: "35%", st: 0.12 });
      s.box("out", { x: 1350, y: 500, w: 230, h: 96, label: "Output Only", sub: "stdout / PNG chart", color: "green", icon: "check", size: 21 }, { at: "58%" });
      s.link("l1", "ag", "iso1", { color: "orange", pulse: true }, { at: "45%" });
      s.link("l2", "iso1", "out", { color: "green", pulse: true }, { at: "68%" });
    }},
    { say: "البيئة المعزولة تمنع الوصول إلى أسرار الخادم وتغلق الشبكة إلا لقائمة سماح محددة (allowlist).", do: s => {
      s.focus(["vm", "iso0", "iso1", "iso2"], { zoom: 1.12, at: "10%" });
      s.pulse("iso1", { at: "45%", color: "red" });
      s.pulse("iso2", { at: "70%", color: "gold" });
    }},
    { say: "ونفرض سقفًا صارمًا للمهلة مثل 20 ثانية وسقفًا للذاكرة والمخرجات كي لا يعلّق أي تنفيذ.", do: s => {
      s.unfocus({ at: "0%", dur: 0.3 });
      s.callout("cap", { x: 810, y: 745, label: "timeout=20s  |  RAM cap  |  stdout[:4000] truncation", color: "gold", icon: "gauge" }, { at: "28%" });
    }},
    { say: "في الكود نستدعي الـ Sandbox ضمن كتلة with لتُدمَّر البيئة المؤقتة فور انتهاء التنفيذ.", do: s => {
      s.clear({ dur: 0.45 });
      s.code("cd", { x: 800, y: 520, size: 19, title: "sandbox_runner.py", lines: [
        "with Sandbox(timeout=20, allow_internet=False) as sb:",
        "    res = sb.run_python(agent_generated_code)",
        "    return {",
        "        \"stdout\": res.stdout[:4000],",
        "        \"error\": res.error",
        "    }"
      ] }, { at: "0%", dur: 1.3 });
      s.to("cd", { hl: 0, hc: "blue" }, { at: "26%", dur: 0.2 });
      s.to("cd", { hl: 1, hc: "orange" }, { at: "52%", dur: 0.2 });
      s.to("cd", { hl: 3, hc: "green" }, { at: "74%", dur: 0.2 });
    }},
    { sec: "وكلاء استخدام الحاسوب والمتصفح", say: "نفس مبدأ العزل ينطبق على وكلاء المتصفح والحاسوب: يقرؤون الشاشة أو DOM، ينفّذون، ثم يتحققون.", eq: "@T{Computer-Use}: @B{Observe} @to @P{Act} @to @G{Verify}", do: s => {
      s.clear({ dur: 0.45 });
      s.chain("cu", ["Observe (DOM/Screen)", "Decide Action", "Act (Click/Type)", "Verify New State"], { y: 495, gap: 55, h: 100, size: 20, colors: ["blue", "teal", "purple", "green"], icons: ["search", "brain", "wrench", "check"], pulse: true }, { at: "5%", st: 0.14 });
      s.stream("cu0", "cu3", { color: "gold", at: "56%", span: 2.2, every: 0.5 });
    }},
    { say: "خطوة التحقق حاسمة؛ بعد النقر على زر، يجب أن يتأكد الوكيل من تغيّر الصفحة قبل المتابعة.", do: s => {
      s.focus(["cu2", "cu3"], { zoom: 1.15, at: "10%" });
      s.pulse("cu3", { at: "52%", color: "green" });
    }},
    { say: "وللإجراءات الحساسة في المتصفح كالدفع أو الحذف، نربط الوكيل بمقاطعة بشرية interrupt() كما تعلمنا.", do: s => {
      s.unfocus({ at: "0%", dur: 0.25 });
      s.callout("hi", { x: 800, y: 720, label: "Pair Computer-Use with interrupt() before irreversible clicks!", color: "gold", icon: "shield" }, { at: "30%" });
    }},
    { sec: "فخّ الإنتاج", say: "تذكّر القاعدة الذهبية: لا تستدعِ exec() أو eval() في عملية خادم الإنتاج أبدًا مهما بدت آمنة!", do: s => {
      s.clear({ dur: 0.45 });
      s.box("nev", { x: 800, y: 515, w: 680, h: 120, label: "NEVER call Python exec() / eval() on host!", sub: "Prompt injection + exec() = full server takeover", color: "red", icon: "alert", size: 23 }, { at: "12%" });
      s.mark("mk2", "nev", "x", { at: "55%" });
    }},
    { say: "إقلاع MicroVM يستغرق أجزاءً من الثانية فقط، لكنه يفصل النواة ويحميك من اختراق الخادم بالكامل.", do: s => {
      s.clear({ dur: 0.4 });
      s.bars("sp", [
        ["Host exec() — 0 ms boot, catastrophic risk", 0.90, "red", "Full Host Breach"],
        ["MicroVM Sandbox — ~150 ms boot, kernel isolated", 0.15, "green", "Isolated & Safe ✓"]
      ], { x: 650, y: 520, w: 540, gap: 110, size: 23, h: 34 }, { at: "12%" });
    }},
    { sec: "الخلاصة", say: "الخلاصة: نفّذ كود الوكيل داخل MicroVM مؤقتة بلا أسرار، وبقيود وقت وشبكة صارمة.", eq: "@T{Sandbox} = @B{MicroVM} + @G{Least Privilege} + @Y{Hard Caps}", do: s => {
      s.clear({ dur: 0.45 });
      s.chain("sum", ["Untrusted Code", "MicroVM Sandbox", "No Secrets / Net", "20s Timeout", "Safe Output"], { y: 500, gap: 38, colors: ["orange", "blue", "red", "gold", "green"], h: 96, size: 20, icons: ["code", "shield", "shieldok", "gauge", "check"], pulse: true }, { at: "5%", st: 0.14 });
      s.stream("sum0", "sum4", { color: "green", at: "56%", span: 2.4, every: 0.5 });
    }}
  ]);
})(window.Explainer);
