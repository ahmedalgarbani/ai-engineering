// Motion explainers — Stage 3: RAG in depth, LangGraph workflows, agents & tools, MCP, memory, sandboxes
(function () {
  const X = window.Explainer;
  const ringNodes = (s, pre, labels, cx, cy, r, colors, o) => labels.forEach((t, i) => { const a = (-90 + i * 360 / labels.length) * Math.PI / 180; s.box(pre + i, { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, label: t, size: 24, h: 56, color: (colors || [])[i] || "teal", fill: "bg" }, Object.assign({ at: 0.4 + i * 0.15 }, o)); });

  // ------------------------------------------------------------------ 5.1 When does an app need RAG?
  X.lesson("5.1", [
    { sec: "أي نوع من البيانات؟", say: "قبل أن تبني RAG، اسأل: ما نوع البيانات التي يحتاجها السؤال؟", do: s => {
      s.bubble("q", { text: "?", side: "u", x: 800, y: 300, w: 90, size: 34 });
      s.grid("bin", ["structured fact", "a few short docs", "large, changing library"], { cols: 3, y: 520, cw: 380, ch: 110, size: 28, colors: ["blue", "teal", "gold"] }, { at: 0.5, st: 0.2 });
    }},
    { say: "إن كانت حقيقة مهيكلة، مثل حالة طلب أو رصيد، فاستعلم قاعدة البيانات مباشرة.", eq: "@T{structured fact} @Rightarrow @B{SQL}", do: s => {
      s.pulse("bin0", { glow: 1, keep: true });
      s.box("sql", { x: s.get("bin0").x, y: 720, w: 320, h: 70, label: "SELECT status …", font: "mono", size: 22, color: "blue", icon: "db", inline: true }, { at: 0.4 });
      s.link("l0", "bin0", "sql", { color: "blue" }, { at: 0.5 });
    }},
    { say: "وإن كانت مستندات قليلة وقصيرة، فضعها مباشرة في السياق.", eq: "@T{few docs} @Rightarrow @C{context}", do: s => {
      s.to("bin0", { glow: 0 }); s.pulse("bin1", { glow: 1, keep: true });
      s.box("ctx", { x: s.get("bin1").x, y: 720, w: 300, h: 70, label: "put in prompt", size: 24, color: "teal", icon: "docs", inline: true }, { at: 0.4 });
      s.link("l1", "bin1", "ctx", { color: "teal" }, { at: 0.5 });
    }},
    { say: "أما مكتبة كبيرة ومتغيرة من السياسات والمعرفة، فهنا يأتي RAG مع ذكر المصادر.", eq: "@T{large library} @Rightarrow @Y{RAG + citations}", do: s => {
      s.to("bin1", { glow: 0 }); s.pulse("bin2", { glow: 1, keep: true });
      s.box("rag", { x: s.get("bin2").x, y: 720, w: 320, h: 70, label: "retrieve → cite", size: 24, color: "gold", icon: "search", inline: true }, { at: 0.4 });
      s.link("l2", "bin2", "rag", { color: "gold" }, { at: 0.5 });
    }},
    { sec: "سقف الجودة", say: "وتذكّر: جودة الإجابة لا تتجاوز جودة الاسترجاع.", eq: "@T{answer quality} @le @T{retrieval quality}", do: s => {
      s.clear({ dur: 0.4 });
      s.bar("rq", { x: 620, y: 470, w: 560, v: 0.9, color: "teal", label: "retrieval", size: 30, h: 34 }, { at: 0.3 });
      s.bar("aq", { x: 620, y: 580, w: 560, v: 0.85, color: "green", label: "answer", size: 30, h: 34 }, { at: 0.5 });
      s.to("rq", { v: 0.4, color: "red" }, { at: 1.4, dur: 0.9 }); s.to("aq", { v: 0.38, color: "red" }, { at: 1.6, dur: 0.9 });
    }},
    { say: "لذلك قِس الاثنين: هل جاء المقطع الصحيح؟ وهل الإجابة وفيّة له؟", do: s => {
      s.box("m1", { x: 560, y: 750, w: 320, h: 80, label: "recall@k", icon: "search", inline: true, size: 28, color: "teal" }, { at: 0.3 });
      s.box("m2", { x: 1040, y: 750, w: 320, h: 80, label: "faithfulness", icon: "check", inline: true, size: 28, color: "green" }, { at: 0.6 });
    }}
  ]);

  // ------------------------------------------------------------------ 5.2 Ingestion & chunking
  X.lesson("5.2", [
    { sec: "التنظيف", say: "نبدأ بمستند خام، فيه ترويسات وتذييلات وقوائم تنقّل مكررة.", do: s => {
      s.box("pg", { x: 800, y: 540, w: 520, h: 600, label: "", color: "soft", fill: "panel", r: 10 });
      s.box("hd", { x: 800, y: 280, w: 480, h: 44, label: "HEADER · Home · Products · Login", size: 18, color: "red", font: "ui" }, { at: 0.4 });
      s.box("ft", { x: 800, y: 800, w: 480, h: 44, label: "© 2026 · Privacy · Cookies", size: 18, color: "red", font: "ui" }, { at: 0.5 });
      ["# Refund policy", "Refunds within 14 days…", "## Exceptions", "Sale items are final…"].forEach((t, i) => s.box("ln" + i, { x: 800, y: 380 + i * 90, w: 440, h: 54, label: t, size: 22, color: i % 2 ? "dim" : "gold", font: "ui" }, { at: 0.6 + i * 0.1 }));
    }},
    { say: "فنزيل هذا الحشو أولًا.", do: s => { s.out(["hd", "ft"], { how: "shrink", dur: 0.6 }); s.to("pg", { stroke: "green" }, { at: 0.5 }); } },
    { sec: "التقسيم", say: "ثم نقسّمه حسب البنية: العناوين والفقرات.", do: s => {
      s.out("pg", { dur: 0.4 });
      s.to(["ln0", "ln1"], { x: 470 }, { dur: 0.8 }); s.to(["ln2", "ln3"], { x: 1130, y: v => v - 180 }, { dur: 0.8 });
      s.zone("c1", { x: 470, y: 425, w: 520, h: 220, label: "chunk 1", color: "gold" }, { at: 0.8 });
      s.zone("c2", { x: 1130, y: 425, w: 520, h: 220, label: "chunk 2", color: "gold" }, { at: 1 });
    }},
    { say: "مع تداخل بسيط بين المقاطع، حتى لا تنقطع فكرة في المنتصف.", eq: "@T{chunk} @approx 400 @T{ tokens}, @quad @T{overlap} @approx 60", do: s => {
      s.clear({ dur: 0.4 });
      [0, 1, 2].forEach(i => s.box("ov" + i, { x: 520 + i * 280, y: 540, w: 360, h: 120, label: "chunk " + (i + 1), size: 26, color: ["blue", "teal", "purple"][i], fop: 0.35 }, { at: 0.3 + i * 0.25 }));
      s.brace("o1", { x1: 620, x2: 700, y: 610, label: "overlap", color: "gold" }, { at: 1.2 });
    }},
    { sec: "البيانات الوصفية", say: "ونخزّن مع كل مقطع بياناته الوصفية: المصدر، والعنوان، والقسم، والتاريخ، والعميل.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("meta", { x: 800, y: 540, size: 25, title: "chunk record", lines: ["text:      \"Sale items are final…\"", "source:    refunds.md", "section:   Exceptions", "updated:   2026-05-02", "tenant_id: 42"] }, { at: 0.3, dur: 1.6 });
    }},
    { say: "فتستطيع الإجابة أن تشير إلى أصلها بدقة.", do: s => {
      s.to("meta", { x: 520, scale: 0.85 }, { dur: 0.6 });
      s.bubble("ans", { text: "Sale items can't be refunded. [refunds.md › Exceptions]", side: "a", x: 1180, y: 540, w: 460, color: "green" }, { at: 0.6 });
    }},
    { sec: "التحديث", say: "وعندما يتغير المستند، نعيد معالجته ونتتبّع الإصدارات.", do: s => {
      s.clear({ dur: 0.4 });
      s.doc("v1", { x: 500, y: 520, w: 150, h: 190, lines: 6, title: "refunds.md v1", color: "dim" }, { at: 0.3 });
      s.doc("v2", { x: 1100, y: 520, w: 150, h: 190, lines: 6, title: "refunds.md v2", color: "green" }, { at: 0.6 });
      s.arrow("up", { x1: 600, y1: 520, x2: 1000, y2: 520, color: "green", label: "re-ingest" }, { at: 0.9 });
    }},
    { say: "والكود: قسّم حسب العناوين، ثم خزّن كل مقطع مع بياناته.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("cd", { x: 800, y: 540, size: 24, title: "ingest.py", lines: ["chunks = split_by_headings(doc.text, max_tokens=400, overlap=60)", "for idx, txt in enumerate(chunks):", "    db.insert_chunk(tenant_id=doc.tenant_id, text=txt,", "                    source=doc.path, section=idx, embedding=embed(txt))"] }, { at: 0.3, dur: 2 });
    }}
  ]);

  // ------------------------------------------------------------------ 5.3 Embeddings & pgvector
  X.lesson("5.3", [
    { sec: "المعنى مسافة", say: "نحوّل كل مقطع إلى متجه، فتصبح المعاني المتشابهة متجهات متقاربة.", do: s => {
      s.plane("pl", { x: 800, y: 560, w: 900, h: 560, u: 60 });
      [["refund", -3, 2.4], ["return item", -2.3, 3], ["money back", -3.6, 1.6], ["GPU", 3.2, -1.8], ["H100", 3.9, -2.5]].forEach(([t, x, y], i) => { const p = s.P("pl", x, y); s.dot("d" + i, { x: p.x, y: p.y, r: 9, color: i < 3 ? "green" : "orange" }, { at: 0.4 + i * 0.1 }); s.note("dl" + i, { text: t, x: p.x, y: p.y - 26, size: 22, color: "soft", font: "math" }, { at: 0.5 + i * 0.1 }); });
    }},
    { say: "والزاوية بين متجهين تقيس مدى الصلة بينهما.", eq: "@cos @theta = @frac{a @cdot b}{@lVert a @rVert @, @lVert b @rVert}", do: s => {
      s.vec("a", { plane: "pl", v: [-3, 2.4], color: "green", w: 4 }, { at: 0.2 });
      s.vec("b", { plane: "pl", v: [-2.3, 3], color: "blue", w: 4 }, { at: 0.4 });
      s.vec("c", { plane: "pl", v: [3.2, -1.8], color: "orange", w: 4 }, { at: 0.6 });
      s.note("sm", { text: "close → similar", x: 470, y: 760, color: "green", font: "math" }, { at: 1 }); s.note("df", { text: "far → unrelated", x: 1150, y: 760, color: "orange", font: "math" }, { at: 1.2 });
    }},
    { sec: "العتبة", say: "لكن أقرب نتيجة ليست دائمًا ذات صلة؛ فنضع عتبة للتشابه.", eq: "@cos(q, d) @ge 0.75", do: s => {
      s.out(["a", "b", "c", "sm", "df"], { dur: 0.3 });
      const q = s.P("pl", 1.2, 1.4);
      s.dot("q", { x: q.x, y: q.y, r: 11, color: "blue", halo: true }, { at: 0.3 });
      s.ring("th", { x: q.x, y: q.y, r: 110, color: "blue", w: 2.5, arrows: 0 }, { at: 0.6 });
      s.note("nr", { text: "nothing above threshold → \"I don't know\"", x: 800, y: 830, color: "gold", font: "math", size: 26 }, { at: 1.3 });
    }},
    { sec: "داخل Postgres", say: "وكل هذا داخل PostgreSQL، بإضافة pgvector.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("ddl", { x: 800, y: 540, size: 25, title: "schema.sql", lines: ["CREATE EXTENSION IF NOT EXISTS vector;", "CREATE TABLE chunks (", "  id bigserial PRIMARY KEY, tenant_id int,", "  content text, embedding vector(384));"] }, { at: 0.3, dur: 1.6 });
    }},
    { say: "والاستعلام يرتّب المقاطع حسب المسافة من متجه السؤال.", eq: "@T{ORDER BY} @; @T{embedding} <=> q", do: s => {
      s.out("ddl", { dur: 0.3 });
      s.code("q", { x: 800, y: 540, size: 26, title: "search.sql", lines: ["SELECT content FROM chunks", "WHERE tenant_id = $2", "ORDER BY embedding <=> $1", "LIMIT 5;"] }, { at: 0.3, dur: 1.2 });
      s.to("q", { hl: 2 }, { at: 1.8, dur: 0.2 });
    }},
    { sec: "الفهرس", say: "ومع نمو البيانات، أضف فهرسًا تقريبيًا مثل HNSW، ليبقى البحث سريعًا.", do: s => {
      s.out("q", { dur: 0.3 });
      s.bars("ix", [["no index · 5M rows", 0.9, "red", "1,200 ms"], ["HNSW index", 0.03, "green", "15 ms"]], { x: 720, y: 540, w: 520, gap: 110, size: 28, h: 34 }, { at: 0.3 });
    }},
    { sec: "عزل العملاء", say: "وصفِّ دائمًا حسب العميل داخل الاستعلام نفسه، حتى لا تتسرّب بيانات عميل لآخر.", eq: "@T{WHERE} @; @T{tenant@_id} = @R{@$2}", do: s => {
      s.clear({ dur: 0.4 });
      ["tenant 41", "tenant 42", "tenant 43"].forEach((t, i) => s.zone("t" + i, { x: 380 + i * 420, y: 560, w: 380, h: 420, label: t, color: i === 1 ? "green" : "dim" }, { at: 0.3 + i * 0.1 }));
      for (let i = 0; i < 9; i++) s.dot("r" + i, { x: 300 + (i % 3) * 420 + Math.floor(i / 3) * 60, y: 520 + (i % 2) * 70, r: 10, color: i % 3 === 1 ? "green" : "dim" }, { at: 0.6 + i * 0.04 });
      s.box("ql", { x: 800, y: 820, label: "query sees tenant 42 only", size: 24, color: "green", h: 54 }, { at: 1.2 });
    }}
  ]);

  // ------------------------------------------------------------------ 6.1 LangGraph: state, nodes, edges
  X.lesson("6.1", [
    { sec: "الحالة", say: "سير العمل في LangGraph رسم بياني، يبدأ بحالة مشتركة بين كل الخطوات.", eq: "@T{State} = @{ @T{message}, @; @T{category}, @; @T{reply} @}", do: s => {
      s.code("st", { x: 800, y: 330, size: 24, title: "State", lines: ["message:  \"I was charged twice\"", "category: None", "reply:    None"] }, { dur: 1.2 });
    }},
    { sec: "العُقد", say: "والعُقد دوال صغيرة: كل عقدة تقرأ الحالة، وتعيد تحديثًا عليها.", do: s => {
      s.box("n1", { x: 560, y: 600, w: 220, h: 80, label: "classify", icon: "filter", inline: true, color: "blue", size: 26 }, { at: 0.3 });
      s.box("n2", { x: 1040, y: 600, w: 220, h: 80, label: "draft", icon: "pencil", inline: true, color: "purple", size: 26 }, { at: 0.5 });
      s.link("r1", "st", "n1", { color: "dim", dash: "6 6" }, { at: 0.7 }); s.link("w1", "n1", "st", { color: "blue", bend: 0.25 }, { at: 0.9 });
    }},
    { say: "فعقدة التصنيف تملأ حقل الفئة في الحالة.", do: s => {
      s.flow("n1", "st", { color: "blue", bend: 0.25, at: 0.2 });
      s.out("st", { at: 0.8, dur: 0.2 });
      s.code("st2", { x: 800, y: 330, size: 24, title: "State", lines: ["message:  \"I was charged twice\"", "category: \"refund\"", "reply:    None"], hl: 1 }, { at: 0.8, in: "fade", dur: 0.3 });
    }},
    { sec: "الحواف", say: "والحواف تحدد ما يُنفَّذ بعد كل عقدة: حافة ثابتة، أو حافة شرطية.", do: s => {
      s.clear({ dur: 0.4 });
      s.box("S", { x: 260, y: 540, label: "START", font: "mono", size: 24, color: "dim", h: 56 }, { at: 0.3 });
      s.box("c", { x: 560, y: 540, w: 220, h: 80, label: "classify", color: "blue", size: 26 }, { at: 0.4 });
      s.box("r", { x: 960, y: 400, w: 240, h: 76, label: "refund_reply", font: "mono", size: 22, color: "green" }, { at: 0.6 });
      s.box("g", { x: 960, y: 680, w: 240, h: 76, label: "general_reply", font: "mono", size: 22, color: "purple" }, { at: 0.7 });
      s.box("E", { x: 1340, y: 540, label: "END", font: "mono", size: 24, color: "dim", h: 56 }, { at: 0.8 });
      s.link("e0", "S", "c", { color: "soft" }, { at: 0.5 }); s.link("e1", "c", "r", { color: "gold", dash: "8 6" }, { at: 0.9 }); s.link("e2", "c", "g", { color: "gold", dash: "8 6" }, { at: 0.9 });
      s.link("e3", "r", "E", { color: "soft" }, { at: 1 }); s.link("e4", "g", "E", { color: "soft" }, { at: 1 });
    }},
    { say: "فالحافة الشرطية تقرأ الحالة، وتختار الطريق.", eq: "@T{route}(@T{state}) = @G{refund@_reply} @; @T{if category = refund}", do: s => {
      s.flow("S", "c", { color: "soft", at: 0.2 }); s.flow("c", "r", { color: "green", at: 0.9 }); s.flow("r", "E", { color: "green", at: 1.6 });
      s.to("e1", { color: "green", w: 4 }, { at: 0.9 });
    }},
    { sec: "قابل للاختبار", say: "وعندما تكون كل عقدة صغيرة وذات هدف واحد، يصبح الرسم سهل الاختبار.", do: s => {
      ["c", "r", "g"].forEach((id, i) => s.mark("ck" + i, id, "check", { at: 0.3 + i * 0.2 }));
    }}
  ]);

  // ------------------------------------------------------------------ 6.2 Workflow patterns in LangGraph
  X.lesson("6.2", [
    { sec: "التوجيه", say: "التوجيه في LangGraph حافة شرطية، تختار العقدة التالية حسب التصنيف.", eq: "@T{add@_conditional@_edges}(@T{classify}, @; @T{route})", do: s => {
      s.box("c", { x: 500, y: 540, w: 220, h: 90, label: "classify", color: "gold", size: 28 });
      ["billing", "tech", "sales"].forEach((t, i) => { s.box("p" + i, { x: 1050, y: 380 + i * 160, w: 220, h: 70, label: t, size: 26, color: "blue" }, { at: 0.3 + i * 0.1 }); s.link("l" + i, "c", "p" + i, { color: "gold", dash: "8 6" }, { at: 0.4 + i * 0.1 }); });
      s.flow("c", "p1", { color: "gold", at: 1.2 });
    }},
    { sec: "التوازي", say: "والتوازي: توزيع على عدة عُقد، ثم تجميع في عقدة دمج.", do: s => {
      s.clear({ dur: 0.4 });
      s.box("in", { x: 360, y: 540, label: "fan out", size: 26, color: "soft", h: 70 }, { at: 0.3 });
      [0, 1, 2].forEach(i => { s.box("w" + i, { x: 800, y: 380 + i * 160, w: 220, h: 70, label: "branch " + (i + 1), size: 24, color: "teal" }, { at: 0.5 }); s.link("a" + i, "in", "w" + i, { color: "dim" }, { at: 0.6 }); s.link("b" + i, "w" + i, "mg", { color: "dim" }, { at: 1.1 }); });
      s.box("mg", { x: 1240, y: 540, label: "fan in · merge", size: 26, color: "gold", h: 70 }, { at: 0.9 });
      [0, 1, 2].forEach(i => { s.flow("in", "w" + i, { color: "teal", at: 1.4 }); s.flow("w" + i, "mg", { color: "gold", at: 2.1 }); });
    }},
    { sec: "المنسّق والعامل", say: "والمنسّق ينشئ مهامًا فرعية أثناء التشغيل، بعدد لا يُعرف مسبقًا.", eq: "@T{Send}(@T{worker}, @; @T{task}_i) @; @T{for each} @; i", do: s => {
      s.clear({ dur: 0.4 });
      s.box("or", { x: 800, y: 330, w: 260, h: 90, label: "orchestrator", color: "purple", size: 28 }, { at: 0.3 });
      for (let i = 0; i < 5; i++) { s.box("k" + i, { x: 400 + i * 200, y: 580, w: 160, h: 64, label: "worker", size: 22, color: "blue" }, { at: 0.7 + i * 0.25 }); s.link("kl" + i, "or", "k" + i, { color: "dim" }, { at: 0.75 + i * 0.25 }); }
      s.note("dyn", { text: "N decided at runtime", x: 800, y: 700, color: "gold", font: "math", size: 28 }, { at: 1.8 });
    }},
    { sec: "المقيّم والمحسّن", say: "والمقيِّم والمحسِّن: حلقة بين الكاتب والمقيّم…", do: s => {
      s.clear({ dur: 0.4 });
      s.box("wr", { x: 560, y: 540, w: 220, h: 120, label: "write", icon: "pencil", color: "blue", size: 26 }, { at: 0.3 });
      s.box("jd", { x: 1040, y: 540, w: 220, h: 120, label: "evaluate", icon: "scale", color: "gold", size: 26 }, { at: 0.5 });
      s.link("d1", "wr", "jd", { color: "blue", bend: 0.25 }, { at: 0.7 }); s.link("d2", "jd", "wr", { color: "gold", bend: 0.25 }, { at: 0.9 });
      for (let k = 0; k < 2; k++) { s.flow("wr", "jd", { color: "blue", bend: 0.25, at: 1.1 + k * 1.2 }); s.flow("jd", "wr", { color: "gold", bend: 0.25, at: 1.7 + k * 1.2 }); }
    }},
    { say: "مع حدٍّ أقصى للتكرارات، حتى لا تدور الحلقة للأبد.", eq: "@T{iterations} @le 3", do: s => {
      s.num("it", { v: 1, x: 800, y: 730, size: 44, color: "gold", pre: "iteration " }, { at: 0.2 });
      s.to("it", { v: 3 }, { at: 0.4, dur: 1.2, ease: "lin" });
      s.box("stp", { x: 800, y: 820, label: "stop at max", size: 24, color: "red", h: 50 }, { at: 1.8 });
    }},
    { sec: "الخلاصة", say: "وفي LangGraph: حواف شرطية للتوجيه، وتوزيع وتجميع للتوازي، وSend للعمّال، وحلقات محدودة للتقييم.", do: s => {
      s.clear({ dur: 0.4 });
      s.grid("sum", ["conditional edges", "fan-out / fan-in", "Send(worker, task)", "bounded loop"], { cols: 4, y: 520, cw: 300, ch: 130, size: 22, font: "mono", colors: ["gold", "teal", "purple", "orange"] }, { at: 0.3, st: 0.15 });
    }}
  ]);

  // ------------------------------------------------------------------ 6.3 Persistence, checkpoints & human approval
  X.lesson("6.3", [
    { sec: "نقاط الحفظ", say: "مع Checkpointer، تُحفظ لقطة من الحالة بعد كل خطوة.", do: s => {
      s.chain("g", ["classify", "lookup", "approve", "refund"], { y: 380, gap: 80, colors: ["blue", "blue", "gold", "green"], h: 80, size: 26 }, { st: 0.2 });
      [0, 1].forEach(i => { s.icon("sv" + i, { name: "save", x: s.get("g" + i).x, y: 560, s: 50, color: "teal" }, { at: 1 + i * 0.4 }); s.flow("g" + i, "sv" + i, { color: "teal", at: 0.9 + i * 0.4 }); });
    }},
    { say: "منظّمة حسب المحادثة، أي الـ thread_id.", eq: "@T{checkpoint} = (@T{thread@_id}, @; @T{step}, @; @T{state})", do: s => {
      s.box("th", { x: 560, y: 680, w: 440, h: 60, label: "thread_id = \"order-812\"", font: "mono", size: 22, color: "teal" }, { at: 0.3 });
    }},
    { say: "مثل نقاط الحفظ في لعبة: تتوقف عند لحظة حساسة، وتكمل منها لاحقًا.", do: s => {
      s.icon("pad", { name: "flag", x: s.get("g2").x, y: 560, s: 54, color: "gold" }, { at: 0.3 });
    }},
    { sec: "الموافقة البشرية", say: "وقبل قرار حساس، مثل استرداد مبلغ، نوقف التنفيذ بـ interrupt.", eq: "@T{interrupt}(@{ @T{refund}: 250 @})", do: s => {
      s.to("g2", { glow: 1, label: "approve ⏸", w: 200 }, { dur: 0.5 });
      s.bubble("ask", { text: "Approve refund of $250 for order #812?", side: "s", x: 1050, y: 620, w: 460, size: 24 }, { at: 0.6 });
    }},
    { say: "وينتظر سير العمل، حتى لو أعيد تشغيل الخادم.", do: s => {
      s.icon("rs", { name: "power", x: 1320, y: 780, s: 64, color: "orange" }, { at: 0.2 });
      s.to(["g*"], { opacity: 0.3 }, { at: 0.4, dur: 0.3 }); s.to(["g*"], { opacity: 1 }, { at: 1.1, dur: 0.3 });
      s.pulse("th", { at: 1.3, color: "teal" });
    }},
    { say: "ثم يوافق الإنسان، فنستأنف بالـ thread_id نفسه، من اللحظة نفسها.", eq: "@T{Command}(@T{resume} = @G{True})", do: s => {
      s.out("ask", { dur: 0.3 });
      s.icon("hu", { name: "user", x: 1050, y: 640, s: 70, color: "blue" }, { at: 0.2 });
      s.icon("ok", { name: "check", x: 1120, y: 610, s: 40, color: "green" }, { at: 0.6 });
      s.to("g2", { glow: 0, label: "approve ✓", stroke: "green" }, { at: 0.8 });
      s.flow("g2", "g3", { color: "green", at: 1.1 });
    }},
    { sec: "في الإنتاج", say: "وفي الإنتاج، استخدم دائمًا Checkpointer دائمًا ومتينًا، مثل Postgres.", do: s => {
      s.clear({ dur: 0.4 });
      s.versus("vs", "InMemorySaver", "PostgresSaver", { colors: ["red", "green"] }, { at: 0.2 });
      s.note("a", { text: "lost on restart", x: 435, y: 560, color: "red", font: "math", size: 30 }, { at: 0.6 });
      s.note("b", { text: "survives restarts & deploys", x: 1165, y: 560, color: "green", font: "math", size: 30 }, { at: 0.8 });
    }}
  ]);

  // ------------------------------------------------------------------ 6.4 Failure recovery & streaming
  X.lesson("6.4", [
    { sec: "الأعطال المؤقتة", say: "الأعطال المؤقتة، مثل المهلات وحدود المعدل، تحدث دائمًا في الإنتاج.", do: s => {
      s.box("n", { x: 560, y: 540, w: 230, h: 100, label: "call_model", font: "mono", size: 26, color: "blue" });
      s.box("api", { x: 1100, y: 540, w: 200, h: 100, label: "API", icon: "cloud", inline: true, size: 26, color: "dim" }, { at: 0.2 });
      s.flow("n", "api", { color: "blue", at: 0.5 });
      s.box("to", { x: 1100, y: 700, label: "timeout", size: 24, color: "red", h: 54 }, { at: 1.2 });
    }},
    { say: "فأعد المحاولة مع تراجع تدريجي.", eq: "@T{RetryPolicy}(@T{max@_attempts}=3, @; @T{backoff}=2@times)", do: s => {
      s.out("to", { dur: 0.3 });
      ["retry · 1s", "retry · 2s", "200 OK"].forEach((t, i) => s.box("rt" + i, { x: 700 + i * 220, y: 760, w: 190, h: 56, label: t, size: 22, color: i === 2 ? "green" : "orange" }, { at: 0.3 + i * 0.4 }));
    }},
    { sec: "الاستئناف", say: "وإن تعطّل سير العمل في منتصفه، فاستأنف من آخر نقطة حفظ، لا من الصفر.", do: s => {
      s.clear({ dur: 0.4 });
      s.chain("g", ["load", "retrieve", "draft", "review", "send"], { y: 480, gap: 50, colors: ["blue", "blue", "blue", "blue", "blue"], h: 76, size: 24 }, { at: 0.2, st: 0.15 });
      [0, 1, 2].forEach(i => s.icon("s" + i, { name: "save", x: s.get("g" + i).x, y: 580, s: 40, color: "teal" }, { at: 0.9 + i * 0.1 }));
      s.to("g3", { stroke: "red", label: "crash ✗" }, { at: 1.4 });
      s.arrow("res", { x1: s.get("g2").x, y1: 660, x2: s.get("g3").x, y2: 660, color: "green", label: "resume from step 3" }, { at: 2 });
    }},
    { sec: "البث", say: "وابثّ تحديثات العُقد إلى الواجهة، ليرى المستخدم التقدم.", eq: "@T{graph.stream}(@T{stream@_mode}=@T{\"updates\"})", do: s => {
      s.clear({ dur: 0.4 });
      s.box("ui", { x: 800, y: 540, w: 560, h: 380, label: "", color: "soft", fop: 0.4 }, { at: 0.2 });
      ["✓ classified as refund", "✓ found order #812", "… drafting reply"].forEach((t, i) => s.box("ev" + i, { x: 800, y: 430 + i * 100, w: 480, h: 64, label: t, size: 24, color: i < 2 ? "green" : "gold", font: "ui" }, { at: 0.5 + i * 0.6, in: "slide", from: { dy: 20 } }));
    }},
    { sec: "الرسوم الفرعية", say: "وقسّم التدفق الكبير إلى رسوم فرعية، منظّمة وقابلة للاختبار.", do: s => {
      s.clear({ dur: 0.4 });
      for (let i = 0; i < 9; i++) s.box("b" + i, { x: 420 + (i % 3) * 150, y: 420 + Math.floor(i / 3) * 110, w: 120, h: 60, label: "node", size: 20, color: "dim" }, { at: 0.2 + i * 0.04 });
      ["retrieval", "drafting", "review"].forEach((t, i) => s.box("sg" + i, { x: 1160, y: 400 + i * 130, w: 260, h: 90, label: t + " subgraph", size: 22, color: "teal", icon: "box", inline: true }, { at: 0.9 + i * 0.2 }));
    }},
    { sec: "الخلاصة", say: "إذن: أعد المحاولة للأعطال المؤقتة، واستأنف من نقطة الحفظ، وابثّ التقدم، ونظّم برسوم فرعية.", do: s => {
      s.clear({ dur: 0.4 });
      s.chain("sum", ["retry + backoff", "resume from checkpoint", "stream updates", "subgraphs"], { y: 520, gap: 40, colors: ["orange", "green", "teal", "blue"], h: 90, size: 22 }, { at: 0.3, st: 0.2 });
    }}
  ]);

  // ------------------------------------------------------------------ 7.1 Agent loops & ReAct
  X.lesson("7.1", [
    { sec: "الحلقة", say: "حلقة الوكيل: لاحِظ، ثم قرّر، ثم نفّذ، ثم لاحِظ النتيجة.", eq: "@C{observe} @to @P{decide} @to @O{act} @to @C{observe}", do: s => {
      s.ring("lp", { x: 800, y: 540, r: 200, color: "faint", arrows: 3 });
      ringNodes(s, "n", ["observe", "decide", "act"], 800, 540, 200, ["teal", "purple", "orange"]);
      s.to("lp", { spin: 360 }, { at: 0.8, dur: 3, ease: "lin" });
    }},
    { sec: "متى تنتهي؟", say: "وتنتهي بإجابة نهائية، أو بلوغ الميزانية، أو الوصول إلى بوابة موافقة.", do: s => {
      s.to(["lp", "n*"], { x: v => v - 330 }, { dur: 0.7 });
      s.col("ex", ["final answer", "budget reached", "approval gate"], { x: 1160, y: 540, size: 28, icons: ["flag", "coin", "hand"], colors: ["green", "red", "blue"], w: 380 }, { at: 0.6, st: 0.2 });
    }},
    { sec: "منع الدوران", say: "وقد يعلق الوكيل، فيكرر الفعل نفسه مرارًا.", do: s => {
      s.clear({ dur: 0.4 });
      [0, 1, 2].forEach(i => s.box("rp" + i, { x: 800, y: 400 + i * 100, w: 520, h: 64, label: "search(\"refund policy 2019\")", font: "mono", size: 22, color: "red" }, { at: 0.3 + i * 0.35 }));
    }},
    { say: "فاكتشف الأفعال المتطابقة المتكررة، وأوقفها أو أرسل تلميحًا للوكيل.", eq: "@T{same action} @times 3 @Rightarrow @T{stop}", do: s => {
      s.box("det", { x: 800, y: 760, w: 520, h: 70, label: "loop detector: same call 3× → stop", size: 24, color: "gold", icon: "alert", inline: true }, { at: 0.3 });
    }},
    { sec: "الأخطاء", say: "وأعد أخطاء الأدوات إلى الوكيل، ليتعافى منها بنفسه.", do: s => {
      s.clear({ dur: 0.4 });
      s.box("c1", { x: 560, y: 420, w: 400, h: 64, label: "get_order(\"812A\")", font: "mono", size: 22, color: "orange" }, { at: 0.2 });
      s.box("e1", { x: 1080, y: 420, w: 420, h: 64, label: "error: order_id must be numeric", size: 22, color: "red", font: "ui" }, { at: 0.6 });
      s.box("c2", { x: 560, y: 600, w: 400, h: 64, label: "get_order(812)", font: "mono", size: 22, color: "orange" }, { at: 1.2 });
      s.box("e2", { x: 1080, y: 600, w: 420, h: 64, label: "shipped · ETA Friday", size: 22, color: "green", font: "ui" }, { at: 1.6 });
    }},
    { sec: "التتبع", say: "وتتبّع كل دورة، لتصحّح الأخطاء بسهولة.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("tr", { x: 800, y: 540, size: 22, title: "trace", lines: ["step 1  decide  → get_order(\"812A\")", "step 1  observe ← error: numeric id", "step 2  decide  → get_order(812)", "step 2  observe ← shipped", "step 3  answer  · 3.4s · 1,920 tokens"] }, { at: 0.3, dur: 1.8 });
    }}
  ]);

  // ------------------------------------------------------------------ 7.2 Reliable tool design
  X.lesson("7.2", [
    { sec: "أداة = مهمة", say: "الأداة الجيدة تقوم بمهمة واحدة واضحة، واسمها يصف عملها.", do: s => {
      s.box("bad", { x: 440, y: 520, w: 420, h: 90, label: "do_stuff(action, data)", font: "mono", size: 24, color: "red" });
      s.mark("bx", "bad", "x", { at: 0.6 });
      s.col("good", ["get_order(id)", "cancel_order(id)", "refund_order(id, amount)"], { x: 1120, y: 520, size: 24, font: "mono", w: 440, colors: ["green", "green", "green"] }, { at: 0.8, st: 0.15 });
    }},
    { sec: "القراءة والكتابة", say: "وأدوات القراءة آمنة لإعادة المحاولة، أما أدوات الكتابة فتحتاج حماية.", do: s => {
      s.clear({ dur: 0.4 });
      s.versus("vs", "read tools", "write tools", { colors: ["green", "red"] }, { at: 0.2 });
      s.col("r", ["get_order", "search_docs"], { x: 435, y: 560, font: "mono", size: 26, w: 360, colors: ["green", "green"] }, { at: 0.5 });
      s.col("w", ["refund_order", "send_email"], { x: 1165, y: 560, font: "mono", size: 26, w: 360, colors: ["red", "red"] }, { at: 0.7 });
      s.icon("sh", { name: "shield", x: 1165, y: 720, s: 60, color: "red" }, { at: 1 });
    }},
    { sec: "Idempotency", say: "تخيّل أن استدعاء الاسترداد تكرّر بسبب إعادة محاولة…", do: s => {
      s.clear({ dur: 0.4 });
      s.box("ag", { x: 400, y: 540, w: 200, h: 120, label: "agent", icon: "bot", color: "purple", size: 26 }, { at: 0.2 });
      s.box("pay", { x: 1200, y: 540, w: 240, h: 120, label: "payments", icon: "dollar", color: "orange", size: 26 }, { at: 0.3 });
      s.flow("ag", "pay", { color: "orange", at: 0.6 }); s.flow("ag", "pay", { color: "orange", at: 1.2 });
      s.box("dbl", { x: 1200, y: 730, label: "$50 refunded twice ✗", size: 24, color: "red", h: 56 }, { at: 1.8 });
    }},
    { say: "ومفتاح Idempotency يجعل الاستدعاء المكرر لا يكرر الإجراء.", eq: "@T{refund}(@T{id}, @; @T{key}=k) @times 2 = @T{one refund}", do: s => {
      s.out("dbl", { dur: 0.3 });
      s.box("key", { x: 800, y: 400, label: "Idempotency-Key: r-812-1", font: "mono", size: 22, color: "teal", h: 54 }, { at: 0.2 });
      s.flow("ag", "pay", { color: "teal", at: 0.6 }); s.flow("ag", "pay", { color: "teal", at: 1.2 });
      s.box("once", { x: 1200, y: 730, label: "2nd call → \"already done\" ✓", size: 22, color: "green", h: 56 }, { at: 1.8 });
    }},
    { sec: "نتائج مختصرة", say: "وأعد نتائج مختصرة وذات معنى، لا تفريغًا خامًا للبيانات.", do: s => {
      s.clear({ dur: 0.4 });
      s.doc("raw", { x: 450, y: 540, w: 220, h: 300, lines: 12, title: "4,000-line raw JSON", color: "red" }, { at: 0.2 });
      s.box("sum", { x: 1120, y: 540, w: 420, h: 120, label: "order 812: shipped,\nETA Fri, 2 items", size: 26, color: "green" }, { at: 0.7 });
      s.arrow("ar", { x1: 590, y1: 540, x2: 890, y2: 540, color: "green" }, { at: 0.5 });
    }}
  ]);

  // ------------------------------------------------------------------ 7.3 Controlled agency
  X.lesson("7.3", [
    { sec: "تصنيف الأفعال", say: "صنّف أفعال الوكيل إلى ثلاث فئات: آمن، ويحتاج موافقة، وممنوع.", do: s => {
      s.grid("cat", ["safe", "needs approval", "forbidden"], { cols: 3, y: 330, cw: 380, ch: 80, size: 30, colors: ["green", "gold", "red"] }, { st: 0.2 });
    }},
    { say: "القراءة آمنة. والاسترداد يحتاج موافقة. وحذف الحسابات ممنوع.", do: s => {
      ["read order", "search docs"].forEach((t, i) => s.box("a" + i, { x: s.get("cat0").x, y: 480 + i * 90, w: 300, h: 64, label: t, size: 24, color: "green" }, { at: 0.2 + i * 0.15 }));
      ["refund money", "email customer"].forEach((t, i) => s.box("b" + i, { x: s.get("cat1").x, y: 480 + i * 90, w: 300, h: 64, label: t, size: 24, color: "gold" }, { at: 0.8 + i * 0.15 }));
      ["delete account", "change prices"].forEach((t, i) => s.box("c" + i, { x: s.get("cat2").x, y: 480 + i * 90, w: 300, h: 64, label: t, size: 24, color: "red" }, { at: 1.4 + i * 0.15 }));
    }},
    { sec: "الحدود", say: "وضع حدودًا صارمة: للخطوات، والـ Tokens، والوقت، والمال.", eq: "@T{steps} @le 20, @; @T{tokens} @le 50k, @; @T{time} @le 2@T{min}, @; @T{spend} @le @$5", do: s => {
      s.clear({ dur: 0.4 });
      ["steps", "tokens", "time", "money"].forEach((t, i) => s.gauge("g" + i, { x: 350 + i * 300, y: 600, r: 100, v: 0, color: ["teal", "blue", "orange", "gold"][i], label: t }, { at: 0.3 + i * 0.15 }));
      [0.4, 0.7, 0.3, 0.55].forEach((v, i) => s.to("g" + i, { v }, { at: 0.8 + i * 0.15, dur: 1 }));
    }},
    { sec: "تعدد الوكلاء", say: "وتعدد الوكلاء يضيف التوازي، لكنه يضيف تكلفة التنسيق.", do: s => {
      s.clear({ dur: 0.4 });
      s.box("ld", { x: 800, y: 330, w: 220, h: 80, label: "lead", color: "purple", size: 28 }, { at: 0.2 });
      [0, 1, 2].forEach(i => { s.box("sb" + i, { x: 440 + i * 360, y: 560, w: 220, h: 80, label: "subagent " + (i + 1), size: 24, color: "blue" }, { at: 0.4 + i * 0.1 }); s.link("ll" + i, "ld", "sb" + i, { color: "dim", tail: true }, { at: 0.5 + i * 0.1 }); });
      s.note("co", { text: "+ coordination overhead", x: 800, y: 700, color: "orange", font: "math", size: 28 }, { at: 1.2 });
    }},
    { say: "وكل وكيل فرعي يحصل فقط على الأدوات اللازمة لمهمته.", do: s => {
      s.out("co", { dur: 0.3 });
      [["search", "read"], ["run_tests"], ["read"]].forEach((ts, i) => ts.forEach((t, k) => s.box("tl" + i + k, { x: s.get("sb" + i).x, y: 690 + k * 64, w: 180, h: 50, label: t, font: "mono", size: 20, color: "orange" }, { at: 0.3 + i * 0.15 + k * 0.1 })));
    }},
    { sec: "بالكود", say: "وكل هذا يُفرض بالكود في طبقة الأدوات، لا بالتعليمات وحدها.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("gate", { x: 800, y: 520, size: 24, title: "tool_gate.py", lines: ["POLICY = {\"read_order\": SAFE, \"refund\": APPROVAL, \"delete_account\": FORBIDDEN}", "if POLICY[tool] == FORBIDDEN: raise Denied(tool)", "if POLICY[tool] == APPROVAL: wait_for_human(tool, args)"] }, { at: 0.3, dur: 1.8 });
    }}
  ]);

  // ------------------------------------------------------------------ 7.4 Model Context Protocol (MCP)
  X.lesson("7.4", [
    { sec: "المشكلة", say: "كل تطبيق ذكي يحتاج أن يتصل بكل أداة؛ فتتكاثر الوصلات.", eq: "N @times M @; @T{integrations}", do: s => {
      ["IDE", "chat app", "agent"].forEach((t, i) => s.box("ap" + i, { x: 380, y: 380 + i * 160, w: 200, h: 80, label: t, size: 26, color: "blue" }, { at: 0.2 + i * 0.1 }));
      ["GitHub", "Postgres", "Slack", "Drive"].forEach((t, i) => s.box("tl" + i, { x: 1220, y: 340 + i * 130, w: 200, h: 76, label: t, size: 26, color: "orange" }, { at: 0.4 + i * 0.1 }));
      let k = 0; for (let a = 0; a < 3; a++) for (let b = 0; b < 4; b++) s.link("m" + (k++), "ap" + a, "tl" + b, { color: "faint", head: false, w: 2 }, { at: 0.8 + k * 0.04 });
    }},
    { say: "وMCP يوحّد ذلك، مثل منفذ USB-C لتطبيقات الذكاء الاصطناعي.", eq: "N + M", do: s => {
      s.out("m*", { dur: 0.5 });
      s.box("mcp", { x: 800, y: 540, w: 200, h: 110, label: "MCP", icon: "plug", inline: true, color: "teal", size: 34 }, { at: 0.4 });
      [0, 1, 2].forEach(i => s.link("a" + i, "ap" + i, "mcp", { color: "teal", head: false }, { at: 0.8 }));
      [0, 1, 2, 3].forEach(i => s.link("b" + i, "mcp", "tl" + i, { color: "teal", head: false }, { at: 0.9 }));
    }},
    { sec: "الأطراف", say: "التطبيق المضيف يشغّل عملاء MCP، يتصل كل منهم بخادم MCP.", eq: "@T{host} @supset @T{clients} @leftrightarrow @T{servers}", do: s => {
      s.clear({ dur: 0.4 });
      s.zone("host", { x: 480, y: 560, w: 520, h: 520, label: "host app (IDE, chat…)", color: "blue" }, { at: 0.2 });
      [0, 1].forEach(i => { s.box("cl" + i, { x: 480, y: 470 + i * 180, w: 260, h: 80, label: "MCP client " + (i + 1), size: 24, color: "blue" }, { at: 0.5 + i * 0.15 }); s.box("sv" + i, { x: 1180, y: 470 + i * 180, w: 280, h: 80, label: ["orders server", "docs server"][i], size: 24, color: "teal", icon: "server", inline: true }, { at: 0.7 + i * 0.15 }); s.link("cs" + i, "cl" + i, "sv" + i, { color: "teal", tail: true }, { at: 0.9 + i * 0.15 }); });
    }},
    { say: "والخوادم تعرض ثلاثة أشياء: أدوات، وموارد، وأوامر جاهزة.", do: s => {
      ["tools", "resources", "prompts"].forEach((t, i) => s.box("cap" + i, { x: 1180 + (i - 1) * 140, y: 800, w: 130, h: 50, label: t, size: 22, color: ["orange", "gold", "purple"][i] }, { at: 0.2 + i * 0.15 }));
    }},
    { sec: "البروتوكول", say: "والرسائل بصيغة JSON-RPC، ويبدأ العميل باكتشاف القدرات المتاحة.", eq: "@T{tools/list} @to @T{tools/call}", do: s => {
      s.clear({ dur: 0.4 });
      s.code("rq", { x: 470, y: 540, size: 23, title: "request", lines: ["{\"jsonrpc\": \"2.0\", \"id\": 1,", " \"method\": \"tools/list\"}"] }, { at: 0.3, dur: 1 });
      s.code("rs", { x: 1150, y: 540, size: 23, title: "response", lines: ["{\"tools\": [", "  {\"name\": \"get_order\", …},", "  {\"name\": \"refund\", …}]}"] }, { at: 1.1, dur: 1 });
      s.arrow("ar", { x1: 700, y1: 540, x2: 880, y2: 540, color: "teal" }, { at: 0.9 });
    }},
    { sec: "النواقل", say: "وهناك ناقلان: stdio لخادم محلي كعملية فرعية، وStreamable HTTP لخادم بعيد.", do: s => {
      s.clear({ dur: 0.4 });
      s.versus("vs", "stdio", "Streamable HTTP", { colors: ["green", "blue"] }, { at: 0.2 });
      s.icon("i1", { name: "terminal", x: 435, y: 520, s: 100, color: "green" }, { at: 0.5 }); s.note("n1", { text: "local subprocess", x: 435, y: 630, font: "math", color: "green" }, { at: 0.6 });
      s.icon("i2", { name: "globe", x: 1165, y: 520, s: 100, color: "blue" }, { at: 0.8 }); s.note("n2", { text: "remote · one HTTP endpoint", x: 1165, y: 630, font: "math", color: "blue" }, { at: 0.9 });
    }},
    { sec: "الأمان", say: "وأمّن الخوادم البعيدة: تحقّق من Origin، وطبّق المصادقة، واربط محليًا على localhost.", do: s => {
      s.clear({ dur: 0.4 });
      s.col("sec", ["validate Origin header", "require authentication", "bind to 127.0.0.1 locally"], { x: 800, y: 540, size: 28, icons: ["shieldok", "key", "lock"], colors: ["green", "gold", "blue"], w: 520 }, { at: 0.3, st: 0.25 });
    }},
    { say: "وبناء خادم صغير لا يتجاوز بضعة أسطر.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("cd", { x: 800, y: 540, size: 25, title: "server.py", lines: ["from mcp.server.fastmcp import FastMCP", "mcp = FastMCP(\"orders\")", "", "@mcp.tool()", "def get_order(order_id: int) -> dict:", "    return db.get_order(order_id)", "", "mcp.run()  # stdio by default"] }, { at: 0.3, dur: 2.2 });
      s.to("cd", { hl: 3 }, { at: 2.7, dur: 0.2 });
    }}
  ]);

  // ------------------------------------------------------------------ A3.1 Contextual retrieval in practice
  X.lesson("A3.1", [
    { sec: "سياق لكل مقطع", say: "لكل مقطع، نولّد سياقًا قصيرًا من خمسين إلى مئة كلمة بنموذج رخيص.", do: s => {
      s.doc("d", { x: 330, y: 540, w: 180, h: 240, lines: 8, title: "full document" });
      s.box("sm", { x: 760, y: 540, w: 220, h: 110, label: "cheap model", icon: "bolt", color: "teal", size: 26 }, { at: 0.4 });
      [0, 1, 2].forEach(i => s.box("cx" + i, { x: 1220, y: 400 + i * 140, w: 340, h: 90, label: "[context] + chunk " + (i + 1), size: 22, color: "gold" }, { at: 0.9 + i * 0.25 }));
      s.link("l1", "d", "sm", { color: "dim" }, { at: 0.6 });
      [0, 1, 2].forEach(i => s.link("l2" + i, "sm", "cx" + i, { color: "gold", w: 2 }, { at: 1 + i * 0.25 }));
    }},
    { sec: "التخزين المؤقت", say: "والمستند نفسه يتكرر مع كل مقطع، فنخزّنه مؤقتًا، فتصبح المعالجة رخيصة.", do: s => {
      s.to("d", { stroke: "green" }, { dur: 0.4 });
      s.box("ca", { x: 330, y: 740, label: "cached ✓", size: 24, color: "green", h: 50 }, { at: 0.3 });
      s.bar("cost", { x: 620, y: 780, w: 360, v: 0.9, color: "red", label: "cost", size: 24 }, { at: 0.5 });
      s.to("cost", { v: 0.15, color: "green" }, { at: 1, dur: 1 });
    }},
    { sec: "الدمج", say: "ثم نبحث بالمتجهات وبـ BM25، وندمج القائمتين.", eq: "@T{RRF}(d) = @sum_{r} @frac{1}{60 + @T{rank}_r(d)}", do: s => {
      s.clear({ dur: 0.4 });
      s.col("v", ["c4", "c9", "c2", "c7"], { x: 400, y: 540, size: 26, w: 150, colors: ["green", "green", "green", "green"] }, { at: 0.3 });
      s.col("b", ["c9", "c1", "c4", "c5"], { x: 760, y: 540, size: 26, w: 150, colors: ["blue", "blue", "blue", "blue"] }, { at: 0.5 });
      s.col("f", ["c9", "c4", "c1", "c2"], { x: 1180, y: 540, size: 26, w: 150, colors: ["gold", "gold", "gold", "gold"] }, { at: 1.2 });
      s.note("vt", { text: "vector", x: 400, y: 380, color: "green", font: "math" }, { at: 0.3 }); s.note("bt", { text: "BM25", x: 760, y: 380, color: "blue", font: "math" }, { at: 0.5 }); s.note("ft", { text: "fused", x: 1180, y: 380, color: "gold", font: "math" }, { at: 1.2 });
      s.arrow("ar", { x1: 860, y1: 540, x2: 1080, y2: 540, color: "gold" }, { at: 1 });
    }},
    { sec: "إعادة الترتيب", say: "ثم نعيد ترتيب أفضل عشرين مرشحًا، ونأخذ خمسة فقط.", eq: "@T{reranker}(q, @; 20) @to 5", do: s => {
      s.out(["v*", "b*", "vt", "bt", "ar"], { dur: 0.4 });
      s.to(["f*", "ft"], { x: v => v - 640 }, { dur: 0.7 });
      s.box("rr", { x: 900, y: 540, w: 220, h: 120, label: "reranker", icon: "filter", color: "purple", size: 26 }, { at: 0.7 });
      s.code("cd", { x: 900, y: 760, size: 21, title: "retrieve.py", lines: ["cands = rrf_fuse(vector_search(q, k=20), bm25_search(q, k=20))", "top = reranker.score(query=q, docs=cands)[:5]"] }, { at: 1, dur: 1.2 });
    }},
    { sec: "القياس", say: "وقِس recall@k قبل وبعد، على أسئلتك أنت.", eq: "@T{recall@@k} = @frac{@T{relevant in top-k}}{@T{all relevant}}", do: s => {
      s.clear({ dur: 0.4 });
      s.bars("rk", [["before", 0.71, "red", "recall@5 = 0.71"], ["after", 0.89, "green", "recall@5 = 0.89"]], { x: 640, y: 540, w: 560, gap: 110, size: 30, h: 36 }, { at: 0.3 });
    }},
    { sec: "الخلاصة", say: "والخلاصة: سياق لكل مقطع، وتخزين مؤقت، ودمج للبحثين، وإعادة ترتيب، ثم قياس.", do: s => {
      s.clear({ dur: 0.4 });
      s.chain("sum", ["context per chunk", "prompt cache", "RRF fusion", "rerank", "recall@k"], { y: 520, gap: 36, colors: ["gold", "green", "blue", "purple", "teal"], h: 90, size: 22 }, { at: 0.3, st: 0.18 });
    }}
  ]);

  // ------------------------------------------------------------------ A3.2 Hybrid search in Postgres
  X.lesson("A3.2", [
    { sec: "حدود التضمين", say: "ابحث عن رقم طلب مثل 8812-AX بالتضمين وحده، وقد تفشل.", do: s => {
      s.bubble("q", { text: "order 8812-AX", side: "u", x: 800, y: 320, w: 300, font: "mono" });
      s.col("vr", ["order 8821-AX", "order 8812-BX", "order 1288-AX"], { x: 800, y: 560, font: "mono", size: 26, w: 380, colors: ["red", "red", "red"] }, { at: 0.6, st: 0.15 });
      s.note("vl", { text: "vector search: \"similar-looking\" ids", x: 800, y: 720, color: "red", font: "math" }, { at: 1.2 });
    }},
    { say: "فالمعرّفات الدقيقة تحتاج بحثًا نصيًا يطابق الكلمات.", do: s => {
      s.out(["vr*", "vl"], { dur: 0.3 });
      s.box("fts", { x: 800, y: 540, w: 380, h: 70, label: "order 8812-AX ✓", font: "mono", size: 26, color: "green" }, { at: 0.3 });
      s.note("fl", { text: "full-text search: exact match", x: 800, y: 640, color: "green", font: "math" }, { at: 0.6 });
    }},
    { sec: "الدمج", say: "فنجمع البحثين: النصي يلتقط المصطلحات، وpgvector يلتقط المعنى.", do: s => {
      s.clear({ dur: 0.4 });
      s.col("kw", ["8812-AX", "refund rules", "SKU 99"], { x: 470, y: 540, font: "mono", size: 24, w: 280, colors: ["blue", "blue", "blue"] }, { at: 0.3 });
      s.col("sm", ["return window", "refund rules", "money back"], { x: 1130, y: 540, size: 24, w: 280, colors: ["green", "green", "green"] }, { at: 0.5 });
      s.note("k", { text: "full-text (GIN)", x: 470, y: 380, color: "blue", font: "math" }, { at: 0.3 }); s.note("sv", { text: "pgvector (HNSW)", x: 1130, y: 380, color: "green", font: "math" }, { at: 0.5 });
    }},
    { say: "ثم ندمج الترتيبين بطريقة RRF البسيطة.", eq: "@T{score} = @frac{1}{60 + r_{@T{sem}}} + @frac{1}{60 + r_{@T{kw}}}", do: s => {
      s.box("rrf", { x: 800, y: 760, w: 300, h: 70, label: "RRF → top 5", size: 26, color: "gold" }, { at: 0.3 });
      s.link("a", "kw2", "rrf", { color: "blue" }, { at: 0.5 }); s.link("b", "sm2", "rrf", { color: "green" }, { at: 0.5 });
      s.pulse(["kw1", "sm1"], { at: 0.9, color: "gold" });
    }},
    { sec: "قاعدة واحدة", say: "وكل هذا في قاعدة بيانات واحدة: تشغيل أبسط، ومعاملات، وتصفية للعملاء.", do: s => {
      s.clear({ dur: 0.4 });
      s.zone("pg", { x: 800, y: 540, w: 760, h: 420, label: "PostgreSQL", color: "blue" }, { at: 0.2 });
      ["GIN index · tsvector", "HNSW index · vector", "tenant_id filter", "transactions"].forEach((t, i) => s.box("f" + i, { x: 620 + (i % 2) * 360, y: 470 + Math.floor(i / 2) * 140, w: 320, h: 80, label: t, size: 22, color: ["blue", "green", "gold", "teal"][i] }, { at: 0.5 + i * 0.15 }));
    }},
    { say: "والاستعلام كله في SQL واحد.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("cd", { x: 800, y: 540, size: 19, title: "hybrid.sql", lines: ["WITH sem AS (SELECT id, ROW_NUMBER() OVER (ORDER BY emb <=> $1) r FROM chunks LIMIT 20),", "     kw  AS (SELECT id, ROW_NUMBER() OVER (ORDER BY ts_rank(tsv, q) DESC) r FROM chunks LIMIT 20)", "SELECT id, COALESCE(1.0/(60+sem.r),0) + COALESCE(1.0/(60+kw.r),0) AS score", "FROM sem FULL OUTER JOIN kw USING (id) ORDER BY score DESC LIMIT 5;"] }, { at: 0.3, dur: 2.4 });
      s.to("cd", { hl: 2 }, { at: 3, dur: 0.2 });
    }}
  ]);

  // ------------------------------------------------------------------ A3.3 Checkpointer vs Store
  X.lesson("A3.3", [
    { sec: "نظاما حفظ", say: "يوفّر LangGraph نظامين للحفظ: Checkpointer، وStore.", do: s => {
      s.versus("vs", "Checkpointer", "Store", { colors: ["teal", "purple"] });
    }},
    { sec: "Checkpointer", say: "الـ Checkpointer يحفظ حالة الرسم لكل محادثة: ذاكرة قصيرة المدى.", eq: "@T{scope} = @C{one thread}", do: s => {
      s.box("th", { x: 435, y: 400, w: 300, h: 56, label: "thread-1", font: "mono", size: 24, color: "teal" }, { at: 0.2 });
      [0, 1, 2, 3].forEach(i => s.icon("sv" + i, { name: "save", x: 330 + i * 70, y: 510, s: 44, color: "teal" }, { at: 0.5 + i * 0.15 }));
    }},
    { say: "ويمكّن الاستئناف بعد الأعطال، والموافقات البشرية.", do: s => {
      s.col("cu", ["resume after crash", "human approval", "time travel"], { x: 435, y: 680, size: 24, w: 380, icons: ["refresh", "hand", "history"], colors: ["teal", "teal", "teal"] }, { at: 0.3, st: 0.15 });
    }},
    { sec: "Store", say: "أما الـ Store فيحفظ معلومات دائمة عبر المحادثات، مثل تفضيلات المستخدم.", eq: "@T{scope} = @P{across threads}", do: s => {
      s.box("mem", { x: 1165, y: 620, w: 400, h: 80, label: "\"prefers short Arabic replies\"", size: 22, color: "purple", font: "ui" }, { at: 0.2 });
      ["thread-1", "thread-2", "thread-3"].forEach((t, i) => { s.box("t" + i, { x: 1000 + i * 165, y: 420, w: 150, h: 50, label: t, font: "mono", size: 18, color: "dim" }, { at: 0.5 + i * 0.1 }); s.link("tl" + i, "mem", "t" + i, { color: "purple", w: 2 }, { at: 0.7 + i * 0.1 }); });
    }},
    { say: "ونقسّم عناصره حسب المستخدم أو العميل.", eq: "@T{namespace} = (@T{user@_id}, @; @T{\"memories\"})", do: s => {
      s.box("ns", { x: 1165, y: 760, w: 400, h: 56, label: "(\"user-77\", \"memories\")", font: "mono", size: 20, color: "gold" }, { at: 0.3 });
    }},
    { sec: "معًا", say: "ومعظم التطبيقات تستخدم الاثنين معًا.", do: s => {
      s.clear({ dur: 0.4 });
      s.box("app", { x: 800, y: 380, w: 260, h: 100, label: "your agent", icon: "bot", inline: true, color: "blue", size: 28 }, { at: 0.2 });
      s.box("cp", { x: 500, y: 640, w: 300, h: 100, label: "Checkpointer", sub: "this conversation", color: "teal", size: 26 }, { at: 0.5 });
      s.box("st", { x: 1100, y: 640, w: 300, h: 100, label: "Store", sub: "everything we know about the user", color: "purple", size: 26 }, { at: 0.7 });
      s.link("a", "app", "cp", { color: "teal", tail: true }, { at: 0.8 }); s.link("b", "app", "st", { color: "purple", tail: true }, { at: 0.9 });
    }}
  ]);

  // ------------------------------------------------------------------ A3.4 Interrupts in practice
  X.lesson("A3.4", [
    { sec: "التوقف", say: "نضع interrupt داخل الأداة الحساسة، فيتوقف التنفيذ كلما استُدعيت.", do: s => {
      s.box("ag", { x: 420, y: 520, w: 200, h: 120, label: "agent", icon: "bot", color: "purple", size: 26 });
      s.box("tool", { x: 900, y: 520, w: 280, h: 120, label: "refund_order", sub: "interrupt()", font: "mono", color: "red", size: 24 }, { at: 0.3 });
      s.link("l", "ag", "tool", { color: "orange" }, { at: 0.5 });
      s.icon("ps", { name: "pause", x: 900, y: 380, s: 60, color: "gold" }, { at: 0.9 });
    }},
    { say: "ويعرض الإجراء المعلّق على الإنسان: استرداد مئتين وخمسين دولارًا للطلب 812.", do: s => {
      s.box("card", { x: 1240, y: 520, w: 340, h: 200, label: "refund $250\norder #812", size: 26, color: "gold", icon: "user" }, { at: 0.3 });
    }},
    { sec: "ثلاثة خيارات", say: "فيستطيع أن يوافق، فتُنفَّذ الأداة كما هي…", do: s => {
      s.box("ap", { x: 1240, y: 720, w: 200, h: 56, label: "approve", size: 24, color: "green" }, { at: 0.2 });
      s.flow("card", "tool", { color: "green", at: 0.6 });
      s.to("tool", { stroke: "green" }, { at: 1.2 });
    }},
    { say: "أو يعدّل المعاملات، مثلًا إلى مئة دولار فقط…", eq: "@T{amount}: 250 @to @G{100}", do: s => {
      s.out("ap", { dur: 0.3 }); s.to("tool", { stroke: "red" }, { dur: 0.3 });
      s.box("ed", { x: 1240, y: 720, w: 200, h: 56, label: "edit → $100", size: 24, color: "blue" }, { at: 0.3 });
      s.to("card", { label: "refund $100\norder #812" }, { at: 0.7, dur: 0.4 });
      s.flow("card", "tool", { color: "blue", at: 1.1 });
    }},
    { say: "أو يرفض، فلا يحدث شيء.", do: s => {
      s.out("ed", { dur: 0.3 });
      s.box("rj", { x: 1240, y: 720, w: 200, h: 56, label: "reject", size: 24, color: "red" }, { at: 0.3 });
      s.mark("x", "tool", "x", { at: 0.8 });
    }},
    { sec: "قواعد", say: "وحمولة المقاطعة يجب أن تقبل التحويل إلى JSON، ومدخل الإنسان يُتحقق منه.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("pl", { x: 560, y: 540, size: 24, title: "payload", lines: ["{\"action\": \"refund\",", " \"order\": 812,", " \"amount\": 250}"] }, { at: 0.3, dur: 1 });
      s.box("vd", { x: 1150, y: 540, w: 340, h: 90, label: "validate human input", icon: "shieldok", inline: true, size: 24, color: "green" }, { at: 1.1 });
    }},
    { say: "ولا تضع interrupt داخل حلقة غير حتمية، فالاستئناف يعيد تشغيل العقدة من بدايتها.", do: s => {
      s.clear({ dur: 0.4 });
      s.icon("w", { name: "alert", x: 800, y: 470, s: 120, color: "orange" }, { at: 0.2 });
      s.note("wt", { text: "on resume, the whole node runs again", x: 800, y: 620, color: "orange", font: "math", size: 30 }, { at: 0.6 });
    }}
  ]);

  // ------------------------------------------------------------------ A3.5 Writing effective tools for agents
  X.lesson("A3.5", [
    { sec: "قليلة وعالية الأثر", say: "لا تغلّف كل نقطة API بأداة. فضّل أدوات قليلة عالية الأثر.", do: s => {
      for (let i = 0; i < 16; i++) s.box("ep" + i, { x: 300 + (i % 4) * 110, y: 400 + Math.floor(i / 4) * 80, w: 96, h: 56, label: "/api", size: 18, color: "dim", font: "mono" }, { at: 0.1 + i * 0.03 });
      ["schedule_meeting", "find_customer", "refund_order"].forEach((t, i) => s.box("g" + i, { x: 1150, y: 420 + i * 120, w: 340, h: 80, label: t, font: "mono", size: 24, color: "green" }, { at: 0.9 + i * 0.2 }));
      s.arrow("ar", { x1: 760, y1: 540, x2: 960, y2: 540, color: "green" }, { at: 0.8 });
    }},
    { sec: "النطاقات", say: "ونظّم الأدوات المترابطة بأسماء موحّدة.", eq: "@T{orders@_search}, @; @T{orders@_get}, @; @T{tickets@_create}", do: s => {
      s.clear({ dur: 0.4 });
      s.col("o", ["orders_search", "orders_get", "orders_cancel"], { x: 520, y: 540, font: "mono", size: 26, w: 360, colors: ["blue", "blue", "blue"] }, { at: 0.3, st: 0.15 });
      s.col("t", ["tickets_search", "tickets_create"], { x: 1080, y: 540, font: "mono", size: 26, w: 360, colors: ["purple", "purple"] }, { at: 0.7, st: 0.15 });
    }},
    { sec: "سياق ذو معنى", say: "وأعد حقولًا مقروءة، لا معرّفات غامضة فقط.", do: s => {
      s.clear({ dur: 0.4 });
      s.box("bad", { x: 460, y: 540, w: 400, h: 90, label: "{\"user\": \"u_8f3a\"}", font: "mono", size: 24, color: "red" }, { at: 0.2 });
      s.box("good", { x: 1120, y: 540, w: 500, h: 90, label: "{\"user\": \"Sara Ahmed (Gold)\"}", font: "mono", size: 24, color: "green" }, { at: 0.7 });
      s.arrow("ar", { x1: 670, y1: 540, x2: 860, y2: 540, color: "green" }, { at: 0.5 });
    }},
    { sec: "توفير الـ Tokens", say: "وقسّم النتائج الكبيرة إلى صفحات، وصفِّها، واختصرها.", do: s => {
      s.clear({ dur: 0.4 });
      s.num("rows", { v: 10000, x: 480, y: 540, size: 50, color: "red", suf: " rows" }, { at: 0.2 });
      s.box("pg", { x: 1100, y: 540, w: 420, h: 110, label: "page 1 of 20 · 25 rows\n+ filters + summary", size: 24, color: "green" }, { at: 0.8 });
      s.arrow("ar", { x1: 640, y1: 540, x2: 880, y2: 540, color: "green" }, { at: 0.6 });
    }},
    { sec: "الوصف", say: "واكتب وصف الأداة بعناية، كأنك تشرحها لزميل جديد.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("ds", { x: 800, y: 540, size: 23, title: "description", lines: ["\"Search orders by customer email or order id.", " Returns up to 25 orders, newest first.", " Use orders_get for full details of one order.\""] }, { at: 0.3, dur: 1.6 });
    }},
    { sec: "قيّمها", say: "ثم قيّم الأدوات بتشغيل الوكيل عليها، وحسّنها من أخطائه.", eq: "@T{run agent} @to @T{read failures} @to @T{fix tool}", do: s => {
      s.clear({ dur: 0.4 });
      s.ring("lp", { x: 800, y: 540, r: 160, color: "teal", arrows: 3 }, { at: 0.3 });
      ringNodes(s, "n", ["run evals", "read transcripts", "refine tools"], 800, 540, 160, ["teal", "gold", "orange"]);
      s.to("lp", { spin: 360 }, { at: 0.8, dur: 3, ease: "lin" });
    }}
  ]);

  // ------------------------------------------------------------------ A3.6 MCP transports: stdio vs Streamable HTTP
  X.lesson("A3.6", [
    { sec: "stdio", say: "الناقل الأول stdio: العميل يشغّل الخادم كعملية فرعية على الجهاز نفسه.", do: s => {
      s.zone("mac", { x: 800, y: 540, w: 900, h: 380, label: "your machine", color: "green" });
      s.box("cl", { x: 560, y: 540, w: 240, h: 100, label: "client", icon: "code", inline: true, size: 26, color: "blue" }, { at: 0.3 });
      s.box("sv", { x: 1040, y: 540, w: 240, h: 100, label: "server", icon: "terminal", inline: true, size: 26, color: "green" }, { at: 0.5 });
      s.link("in", "cl", "sv", { color: "green", bend: -0.15, label: "stdin", lc: "green" }, { at: 0.7 }); s.link("out", "sv", "cl", { color: "green", bend: -0.15, label: "stdout", lc: "green" }, { at: 0.9 });
    }},
    { say: "ويُفضَّل أن تدعمه العملاء كلما أمكن.", do: s => { s.mark("ck", "mac", "check", { at: 0.2 }); } },
    { sec: "Streamable HTTP", say: "والثاني Streamable HTTP: خادم بعيد يعرض نقطة MCP واحدة.", eq: "@T{POST} @; /@T{mcp}", do: s => {
      s.clear({ dur: 0.4 });
      s.box("cl", { x: 420, y: 540, w: 220, h: 100, label: "client", icon: "code", inline: true, size: 26, color: "blue" }, { at: 0.2 });
      s.box("sv", { x: 1180, y: 540, w: 320, h: 100, label: "https://…/mcp", icon: "globe", inline: true, font: "mono", size: 22, color: "blue" }, { at: 0.4 });
      s.link("p", "cl", "sv", { color: "blue", label: "HTTP POST", lc: "blue" }, { at: 0.6 });
    }},
    { say: "ويرد إما بكائن JSON، أو ببث SSE خاص بهذا الطلب.", do: s => {
      s.box("j", { x: 800, y: 740, w: 240, h: 60, label: "JSON object", size: 24, color: "teal" }, { at: 0.3 });
      s.box("ss", { x: 1120, y: 740, w: 300, h: 60, label: "SSE stream (this request)", size: 22, color: "purple" }, { at: 0.5 });
      s.flow("sv", "cl", { color: "teal", at: 0.9, bend: 0.2 });
    }},
    { sec: "مراجعات المواصفة", say: "وقد تغيّر هذا الناقل عبر مراجعات المواصفة، فاعرف أي إصدار يستهدفه الـ SDK لديك.", do: s => {
      s.clear({ dur: 0.4 });
      s.arrow("tl", { x1: 260, y1: 540, x2: 1340, y2: 540, color: "soft" }, { at: 0.2 });
      [["HTTP + SSE (old)", 400, "dim"], ["2025-03-26 · Streamable HTTP", 800, "blue"], ["2026-07-28 · revised", 1200, "green"]].forEach(([t, x, c], i) => { s.dot("d" + i, { x, y: 540, r: 11, color: c }, { at: 0.4 + i * 0.3 }); s.box("l" + i, { x, y: i % 2 ? 640 : 440, label: t, size: 22, color: c, h: 54 }, { at: 0.5 + i * 0.3 }); });
    }},
    { say: "وخطّط للتوافق العكسي بين المراجعات.", eq: "@T{negotiate protocolVersion}", do: s => {
      s.box("neg", { x: 800, y: 760, w: 520, h: 60, label: "initialize → negotiate protocolVersion", size: 22, color: "gold", font: "ui" }, { at: 0.3 });
    }}
  ]);

  // ------------------------------------------------------------------ A3.7 GraphRAG & long-term agent memory
  X.lesson("A3.7", [
    { sec: "حدود البحث المتجهي", say: "اسأل: ما أبرز المخاطر عبر كل العقود؟ البحث المتجهي يجد قطعًا منفردة فقط.", do: s => {
      s.bubble("q", { text: "Top risks across ALL contracts?", side: "u", x: 800, y: 300, w: 440 });
      [[400, 520], [620, 680], [980, 500], [1200, 690]].forEach(([x, y], i) => s.box("ch" + i, { x, y, w: 160, h: 60, label: "chunk", size: 22, color: "dim" }, { at: 0.5 + i * 0.12 }));
      s.note("pt", { text: "isolated pieces → partial answer", x: 800, y: 800, color: "red", font: "math" }, { at: 1.2 });
    }},
    { sec: "GraphRAG", say: "أما GraphRAG فيستخرج الكيانات والعلاقات، ويبني رسمًا معرفيًا.", eq: "@T{graph} = (@T{entities}, @; @T{relations})", do: s => {
      s.clear({ keep: ["q"] });
      const N = [["Acme", 520, 480, "blue"], ["Contract A", 820, 420, "gold"], ["Contract B", 820, 660, "gold"], ["Supplier X", 1120, 540, "orange"], ["Clause 7: penalty", 1120, 760, "red"]];
      N.forEach(([t, x, y, c], i) => s.box("n" + i, { x, y, label: t, size: 24, color: c, h: 60 }, { at: 0.3 + i * 0.15 }));
      [[0, 1], [0, 2], [1, 3], [2, 3], [2, 4]].forEach(([a, b], i) => s.link("e" + i, "n" + a, "n" + b, { color: "faint", head: false }, { at: 1.1 + i * 0.1 }));
    }},
    { say: "مثل لوحة المحقق، تربط كل شخص ومكان وحدث بخيوط واضحة.", do: s => { s.to("e*", { color: "red", w: 3 }, { dur: 0.6, st: 0.1 }); } },
    { say: "فيجيب عن أسئلة متعددة القفزات، وعن ملخصات شاملة.", do: s => {
      s.to("e*", { color: "faint", w: 2 }, { dur: 0.3 });
      ["n0", "n2", "n4"].forEach((id, i) => s.to(id, { glow: 1 }, { at: 0.3 + i * 0.3 }));
      s.to(["e1", "e4"], { color: "gold", w: 4 }, { at: 0.5, st: 0.3 });
    }},
    { sec: "ذاكرة الوكيل", say: "وذاكرة الوكيل ثلاثة أنواع: دلالية للحقائق، وحدثية للتجارب، وإجرائية للقواعد.", do: s => {
      s.clear({ dur: 0.4 });
      s.grid("mem", ["semantic", "episodic", "procedural"], { cols: 3, y: 470, cw: 380, ch: 140, size: 30, icons: ["book", "history", "list"], colors: ["blue", "gold", "green"], subs: ["facts", "past experiences", "learned rules"] }, { at: 0.3, st: 0.2 });
    }},
    { sec: "التحديث", say: "وعند التعارض، استبدل الحقيقة القديمة، وأرفق طابعًا زمنيًا.", do: s => {
      s.box("old", { x: 560, y: 720, w: 400, h: 64, label: "lives in Riyadh (2024)", size: 24, color: "dim" }, { at: 0.2 });
      s.box("new", { x: 1080, y: 720, w: 400, h: 64, label: "lives in Jeddah (2026)", size: 24, color: "green" }, { at: 0.7 });
      s.to("old", { opacity: 0.3 }, { at: 1 }); s.mark("ox", "old", "x", { at: 1.1 });
    }},
    { say: "وامنح المستخدم دائمًا رؤية ذكرياته، والتحكم في حذفها.", do: s => {
      s.clear({ dur: 0.4 });
      s.box("ui", { x: 800, y: 540, w: 620, h: 360, label: "", color: "soft", fop: 0.3 }, { at: 0.2 });
      ["prefers Arabic replies", "uses Python", "lives in Jeddah"].forEach((t, i) => { s.box("m" + i, { x: 760, y: 440 + i * 100, w: 440, h: 64, label: t, size: 24, color: "blue" }, { at: 0.4 + i * 0.15 }); s.icon("tr" + i, { name: "trash", x: 1040, y: 440 + i * 100, s: 40, color: "red" }, { at: 0.6 + i * 0.15 }); });
    }}
  ]);

  // ------------------------------------------------------------------ A3.8 Code sandboxes & computer-use agents
  X.lesson("A3.8", [
    { sec: "قوة التنفيذ", say: "عندما يكتب الوكيل كودًا ويشغّله، يصبح حلّالًا حقيقيًا للمشكلات.", do: s => {
      s.box("ag", { x: 380, y: 540, w: 200, h: 120, label: "agent", icon: "bot", color: "purple", size: 26 });
      s.code("cd", { x: 800, y: 540, size: 22, title: "analysis.py", lines: ["df = pd.read_csv(\"sales.csv\")", "df.groupby(\"month\").sum().plot()"] }, { at: 0.4, dur: 1 });
      for (let i = 0; i < 5; i++) { const v = [0.4, 0.55, 0.5, 0.8, 0.95][i]; s.box("bar" + i, { x: 1180 + i * 50, y: 640 - v * 100, w: 36, h: v * 200, r: 4, label: "", color: "teal" }, { at: 1.4 + i * 0.08, in: "grow" }); }
    }},
    { sec: "الخطر", say: "لكن تشغيله مباشرة على خادمك خطر هائل.", do: s => {
      s.clear({ dur: 0.4 });
      s.box("srv", { x: 1050, y: 540, w: 300, h: 200, label: "your server", sub: "secrets · database · network", icon: "server", color: "red", size: 28 }, { at: 0.2 });
      s.code("ev", { x: 480, y: 540, size: 22, title: "agent code", lines: ["os.system(\"rm -rf /data\")", "print(os.environ[\"DB_PASSWORD\"])"] }, { at: 0.4, dur: 1 });
      s.flow("ev", "srv", { color: "red", n: 2, at: 1.4 });
    }},
    { sec: "العزل", say: "فشغّله دائمًا داخل بيئة معزولة: MicroVM أو حاوية مؤقتة.", do: s => {
      s.clear({ dur: 0.4 });
      s.zone("sb", { x: 800, y: 560, w: 760, h: 440, label: "sandbox (microVM · ephemeral)", color: "green" }, { at: 0.2 });
      s.code("cd", { x: 800, y: 540, size: 22, title: "agent code", lines: ["result = analyze(data)"] }, { at: 0.5, dur: 0.6 });
    }},
    { say: "بلا أسرار الخادم، ومع قائمة سماح للشبكة.", do: s => {
      s.icon("k", { name: "key", x: 560, y: 700, s: 54, color: "dim" }, { at: 0.2 }); s.icon("kx", { name: "x", x: 590, y: 670, s: 36, color: "red" }, { at: 0.4 });
      s.box("al", { x: 1000, y: 700, w: 300, h: 56, label: "allow: pypi.org only", font: "mono", size: 20, color: "green" }, { at: 0.6 });
    }},
    { say: "ومهلة صارمة، وسقف للذاكرة لكل تشغيل.", eq: "@T{timeout} = 20@T{s}, @quad @T{memory} @le 512@T{MB}", do: s => {
      s.icon("clk", { name: "clock", x: 560, y: 400, s: 60, color: "orange" }, { at: 0.2 }); s.icon("chp", { name: "chip", x: 1040, y: 400, s: 60, color: "orange" }, { at: 0.3 });
    }},
    { sec: "استخدام الحاسوب", say: "ووكلاء استخدام الحاسوب يقرؤون الشاشة، ثم ينفّذون، ثم يتحققون.", eq: "@T{screenshot} @to @T{action} @to @T{verify}", do: s => {
      s.clear({ dur: 0.4 });
      s.box("win", { x: 620, y: 540, w: 520, h: 360, label: "", icon: "browser", color: "blue", fop: 0.3 }, { at: 0.2 });
      s.icon("cur", { name: "cursor", x: 500, y: 640, s: 44, color: "gold" }, { at: 0.5 });
      s.to("cur", { x: 720, y: 600 }, { at: 0.8, dur: 0.8 });
      s.col("st", ["read the screen", "click / type", "check the result"], { x: 1180, y: 540, size: 26, icons: ["eye", "cursor", "check"], colors: ["blue", "gold", "green"], w: 360 }, { at: 0.8, st: 0.25 });
    }},
    { say: "والكود: بيئة معزولة، بمهلة، وبلا إنترنت.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("cd", { x: 800, y: 540, size: 25, title: "run_tool.py", lines: ["with Sandbox(timeout=20, allow_internet=False) as sb:", "    res = sb.run_python(agent_generated_code)", "    return {\"stdout\": res.stdout[:4000], \"error\": res.error}"] }, { at: 0.3, dur: 1.8 });
      s.to("cd", { hl: 0 }, { at: 2.3, dur: 0.2 });
    }}
  ]);
})();
