// Motion explainers — Stage 5: ReplyAssist capstone and production hardening
(function () {
  const X = window.Explainer;

  // ------------------------------------------------------------------ 11.1 Capstone: ReplyAssist architecture & data
  X.lesson("11.1", [
    { sec: "المنتج", say: "تخيل تذكرة عميل حقيقية: دُفع مبلغ الطلب مرتين عن طريق الخطأ.", eq: "@T{ReplyAssist} = @B{RAG} + @O{Tools} + @G{Human Approval}", do: s => {
      s.bubble("tk", { text: "I was charged twice for order #812. Please refund $49.", side: "u", x: 430, y: 420, w: 460, size: 22 });
      s.box("ra", { x: 800, y: 610, w: 260, h: 140, label: "ReplyAssist", icon: "bot", color: "teal", size: 28 }, { at: "35%" });
      s.link("l_tr", "tk", "ra", { color: "dim", pulse: true }, { at: "50%" });
      s.stream("tk", "ra", { span: 3.5, every: 0.9, color: "blue" });
    }},
    { say: "بدلًا من إرسال رد عشوائي، يجهّز ReplyAssist مسودة بمصادر واقتراح استرداد.", do: s => {
      s.bubble("dr", { text: "Draft: Sorry for the double charge (Policy §2). Suggest $49 refund.", side: "a", x: 1180, y: 420, w: 470, color: "green", size: 21 }, { at: "10%" });
      s.link("l_rd", "ra", "dr", { color: "green", pulse: true }, { at: "25%" });
      s.badge("bg_ok", { x: 1180, y: 560, text: "Cited + Pending Approval", color: "gold", size: 22 }, { at: "60%" });
    }},
    { sec: "لماذا يفشل الساذج؟", say: "لكن ماذا لو تركنا نموذجًا ساذجًا يرد وينفّذ الاسترداد مباشرة دون تحقق؟", eq: "@R{Naive Bot} @implies @R{Hallucinated Policy} + @R{Unchecked Refund}", do: s => {
      s.clear({ dur: 0.35 });
      s.versus("nv", "Naive Single Prompt", "ReplyAssist Architecture", { colors: ["red", "teal"], h: 520, y: 540 }, { at: "0%" });
      s.box("nv_b", { x: 440, y: 460, w: 460, h: 90, label: "Auto-refund $490 (wrong!)", icon: "alert", inline: true, color: "red", size: 22 }, { at: "30%" });
      s.mark("nv_x", "nv_b", "x", { at: "60%" });
    }},
    { say: "سيهلوس سياسة غير موجودة أو ينفّذ استردادًا خاطئًا؛ لذا نفصل التجهيز عن التنفيذ.", do: s => {
      s.box("ra_b1", { x: 1160, y: 440, w: 460, h: 76, label: "1. Search Policy + Order Tools", icon: "search", inline: true, color: "blue", size: 21 }, { at: "10%" });
      s.box("ra_b2", { x: 1160, y: 550, w: 460, h: 76, label: "2. Draft + Suggest Refund", icon: "doc", inline: true, color: "teal", size: 21 }, { at: "40%" });
      s.box("ra_b3", { x: 1160, y: 660, w: 460, h: 76, label: "3. Human Approves Execution", icon: "shieldok", inline: true, color: "green", size: 21 }, { at: "70%" });
      s.link("l_12", "ra_b1", "ra_b2", { color: "teal" }, { at: "45%" });
      s.link("l_23", "ra_b2", "ra_b3", { color: "green" }, { at: "75%" });
    }},
    { sec: "المعمارية", say: "تتكون المعمارية من أربع طبقات: React للواجهة، وFastAPI وLangGraph في الخلفية.", eq: "@T{Stack}: @B{React} @to @C{FastAPI} @to @P{LangGraph} @to @Y{Postgres + pgvector}", do: s => {
      s.clear({ dur: 0.35 });
      s.zone("dk", { x: 800, y: 555, w: 1380, h: 480, label: "Docker Compose Network", color: "dim", size: 24 }, { at: "0%" });
      s.chain("st", ["React UI", "FastAPI + Pydantic", "LangGraph", "Postgres + pgvector"], { y: 510, gap: 65, colors: ["blue", "teal", "purple", "gold"], icons: ["browser", "server", "graph", "db"], h: 150, size: 22, pulse: true }, { at: "20%", st: 0.22 });
      s.stream("st0", "st3", { span: 4, every: 0.85, color: "teal" });
    }},
    { say: "تتحقق FastAPI من الطلبات عبر Pydantic، ويدير LangGraph تدفق الوكيل والحالة.", do: s => {
      s.focus(["st1", "st2"], { zoom: 1.18, dim: 0.25 }, { at: "10%" });
      s.note("st_n", { x: 800, y: 710, text: "Strict schema validation + stateful agent graph", color: "teal", size: 24 }, { at: "45%" });
    }},
    { say: "وكل هذه الخدمات تعمل معًا داخل حاويات Docker لضمان بيئة متطابقة للإنتاج.", do: s => {
      s.unfocus({ at: "10%" });
      s.pulse("dk", { color: "teal", at: "35%" });
      s.to("st_n", { text: "One command: docker compose up", color: "gold" }, { at: "55%" });
    }},
    { sec: "نموذج البيانات", say: "في قاعدة البيانات ننشئ سبعة جداول: التذاكر، والرسائل، والمستندات، والمقاطع.", eq: "@T{Schema}: @B{tickets} + @B{messages} + @Y{documents} + @Y{chunks}", do: s => {
      s.clear({ dur: 0.35 });
      s.grid("tb", ["tickets", "messages", "documents", "chunks", "orders", "refund_requests", "checkpoints"], { cols: 4, y: 470, cw: 300, ch: 96, size: 22, font: "mono", colors: ["blue", "blue", "gold", "gold", "green", "red", "purple"] }, { at: "10%", st: 0.12 });
    }},
    { say: "إضافة إلى جداول الطلبات، وطلبات الاسترداد، ونقاط الحفظ لاستئناف سير العمل.", do: s => {
      s.focus(["tb4", "tb5", "tb6"], { zoom: 1.15, dim: 0.3 }, { at: "10%" });
      s.note("tb_n", { x: 800, y: 720, text: "orders + refund_requests + checkpoints = safe state", color: "green", size: 24 }, { at: "50%" });
    }},
    { say: "ونولّد التضمين محليًا بنموذج MiniLM بـ 384 بُعدًا، فلا نحتاج API خارجيًا للبحث.", eq: "@T{embed}(@T{chunk}) @in @C{R}^{384} @quad (@T{local MiniLM})", do: s => {
      s.unfocus({ at: "10%" });
      s.box("ml", { x: 800, y: 790, w: 540, h: 66, label: "Local MiniLM (384-d) → pgvector", size: 22, color: "teal", icon: "chip", inline: true }, { at: "25%" });
      s.link("l_ml", "tb3", "ml", { color: "teal", pulse: true }, { at: "55%" });
    }},
    { sec: "قاعدة الاسترداد", say: "القاعدة الذهبية: الاسترداد يبقى مجرد اقتراح في الجدول حتى يوافق عليه مشرف بشري.", eq: "@T{refund} = @P{suggestion} @; @T{until} @; @G{human approves}", do: s => {
      s.clear({ dur: 0.35 });
      s.chain("rf", ["Agent suggests refund", "Human approves", "Payment executed"], { y: 500, gap: 90, colors: ["purple", "blue", "green"], icons: ["bot", "user", "coin"], w: 280, h: 145, size: 21, pulse: true }, { at: "10%", st: 0.28 });
      s.stream("rf0", "rf2", { span: 3.5, every: 1.0, color: "green" });
    }},
    { say: "بهذه المعمارية نجمع دقة RAG، وقوة الأدوات، وأمان المراجعة البشرية في منتج واحد.", do: s => {
      s.box("sum1", { x: 800, y: 740, w: 940, h: 80, label: "ReplyAssist: Grounded RAG + Typed Tools + Human Gate", icon: "shieldok", inline: true, color: "teal", size: 24 }, { at: "20%" });
      s.pulse("sum1", { color: "green", at: "60%" });
    }}
  ]);

  // ------------------------------------------------------------------ 11.2 Capstone: backend, RAG & LangGraph
  X.lesson("11.2", [
    { sec: "تذكرة حقيقية", say: "عندما تصل التذكرة #812 إلى الخلفية، يمر الطلب عبر بوابة FastAPI أولًا.", eq: "@T{POST /tickets/812/run} @to @C{FastAPI} @to @P{LangGraph}", do: s => {
      s.bubble("tk", { text: "Ticket #812: Double charge on order #812", side: "u", x: 420, y: 480, w: 430, size: 21 });
      s.box("api", { x: 850, y: 480, w: 260, h: 110, label: "FastAPI", icon: "server", color: "teal", size: 26 }, { at: "30%" });
      s.link("l_ta", "tk", "api", { color: "teal", pulse: true }, { at: "50%" });
    }},
    { say: "استخدام دالة خطية ساذجة يفشل هنا؛ لأننا نحتاج تفرعًا، وأدوات، وتوقفًا للموافقة.", do: s => {
      s.box("nv", { x: 1260, y: 480, w: 320, h: 110, label: "Linear script fails!", icon: "alert", inline: true, color: "red", size: 21 }, { at: "20%" });
      s.mark("nv_x", "nv", "x", { at: "60%" });
    }},
    { sec: "سير العمل", say: "لذلك نبني رسم LangGraph من خمس عقد: تصنيف، فاسترجاع، فأدوات، فمسودة، فموافقة.", eq: "@T{graph}: @B{classify} @to @Y{retrieve} @to @O{tools} @to @C{draft} @to @G{approve}", do: s => {
      s.clear({ dur: 0.35 });
      s.chain("g", ["classify", "retrieve", "order tools", "draft + cite", "approve ⏸"], { y: 390, gap: 45, colors: ["blue", "gold", "orange", "teal", "green"], h: 86, size: 22, pulse: true }, { at: "10%", st: 0.2 });
      s.stream("g0", "g4", { span: 4, every: 0.9, color: "teal" });
    }},
    { say: "تبدأ العقدة الأولى بتصنيف التذكرة كشكوى فواتير، فتوجّه المسار نحو سياسة الاسترداد.", do: s => {
      s.focus("g0", { zoom: 1.2, dim: 0.3 }, { at: "10%" });
      s.badge("b_cls", { x: 300, y: 540, text: "intent = billing_refund", color: "blue", size: 22 }, { at: "45%" });
    }},
    { say: "ثم تسترجع عقدة الاسترجاع مقاطع السياسة المناسبة مع تصفية صارمة برقم العميل.", eq: "@T{score} = 1 - @T{cosine}(@Y{q}, @C{chunk}) @quad (@T{WHERE tenant@_id = 42})", do: s => {
      s.unfocus({ at: "0%" });
      s.focus("g1", { zoom: 1.18, dim: 0.3 }, { at: "15%" });
      s.box("sq", { x: 800, y: 620, w: 720, h: 72, label: "WHERE tenant_id = 42 ORDER BY embedding <=> q LIMIT 4", font: "mono", size: 20, color: "gold" }, { at: "40%" });
    }},
    { say: "بعدها تستدعي عقدة الأدوات بيانات الطلب #812 لتتأكد من وجود عمليتي خصم فعليًا.", do: s => {
      s.out(["b_cls", "sq"], { dur: 0.25 });
      s.unfocus({ at: "10%" });
      s.focus("g2", { zoom: 1.18, dim: 0.3 }, { at: "20%" });
      s.box("ord", { x: 800, y: 620, w: 600, h: 72, label: "orders_get(812) → 2 charges of $49 found", font: "mono", size: 20, color: "orange" }, { at: "45%" });
    }},
    { sec: "التحقق والصياغة", say: "تخرج المسودة عبر نموذج Pydantic يفرض وجود النص، والمصادر، ومبلغ الاسترداد المقترح.", do: s => {
      s.out("ord", { dur: 0.25 });
      s.unfocus({ at: "0%" });
      s.focus("g3", { zoom: 1.15, dim: 0.35 }, { at: "10%" });
      s.code("pd", { x: 800, y: 660, size: 21, title: "models.py", lines: ["class Draft(BaseModel):", "    reply: str", "    sources: list[str]", "    refund_suggestion: float | None"] }, { at: "25%", dur: 1.2 });
      s.to("pd", { hl: 2 }, { at: "65%" });
    }},
    { sec: "المقاطعة والبث", say: "وإذا وُجد اقتراح استرداد، يطلق الرسم interrupt() ليتوقف بانتظار موافقة المشرف.", eq: "@P{interrupt}() @to @T{checkpoint saved} @to @G{resume on approval}", do: s => {
      s.out("pd", { dur: 0.25 });
      s.unfocus({ at: "0%" });
      s.focus("g4", { zoom: 1.18, dim: 0.3 }, { at: "10%" });
      s.bubble("ask", { text: "Approve refund of $49 for #812?", side: "s", x: 1180, y: 630, w: 420, size: 22, color: "green" }, { at: "40%" });
    }},
    { say: "تُحفظ حالة التذكرة في نقطة حفظ دائمة، بينما يُبث كل حدث وToken للواجهة عبر SSE.", do: s => {
      s.out("ask", { dur: 0.25 });
      s.unfocus({ at: "10%" });
      [0, 1, 2, 3].forEach(i => s.icon("sv" + i, { name: "save", x: s.get("g" + i).x, y: 520, s: 38, color: "purple" }, { at: 0.25 + i * 0.12 }));
      s.box("sse", { x: 800, y: 680, w: 580, h: 68, label: "SSE Stream → UI: step events + tokens", icon: "bolt", inline: true, size: 22, color: "teal" }, { at: "55%" });
    }},
    { sec: "أخطاء شائعة", say: "احذر خطأين شائعين: نسيان تصفية tenant_id في الاسترجاع، أو قبول نص حر بلا Pydantic.", do: s => {
      s.clear({ dur: 0.35 });
      s.versus("err", "Common Mistakes", "Production Rules", { colors: ["red", "green"], h: 480, y: 530 }, { at: "0%" });
      s.col("err_l", ["Missing tenant_id filter", "Unvalidated dict output"], { x: 440, y: 540, w: 460, size: 22, color: "red", icons: ["x", "x"] }, { at: "25%", st: 0.25 });
      s.col("err_r", ["WHERE tenant_id = ctx.id", "Draft.model_validate(out)"], { x: 1160, y: 540, w: 460, size: 22, color: "green", icons: ["check", "check"] }, { at: "50%", st: 0.25 });
    }},
    { say: "هكذا تصبح الخلفية موثوقة: تدفق مصنّف، واسترجاع معزول، ومخرجات محققة، وتوقف آمن.", do: s => {
      s.box("sum2", { x: 800, y: 810, w: 880, h: 66, label: "LangGraph + pgvector + Pydantic + interrupt() + SSE", color: "teal", size: 22 }, { at: "25%" });
    }}
  ]);

  // ------------------------------------------------------------------ 11.3 Capstone: React integration, testing & debugging
  X.lesson("11.3", [
    { sec: "مشكلة الواجهة", say: "إذا انتظرت واجهة React استجابة REST كاملة، يتجمد المتصفح ثماني ثوانٍ بلا إشارة!", eq: "@T{Latency}_{@T{perceived}} @ll @T{Latency}_{@T{total}} @quad (@T{via SSE})", do: s => {
      s.box("br", { x: 430, y: 490, w: 320, h: 140, label: "React UI", icon: "browser", color: "blue", size: 26 });
      s.box("srv", { x: 1150, y: 490, w: 320, h: 140, label: "Backend (8s)", icon: "server", color: "dim", size: 26 }, { at: "20%" });
      s.link("l_wt", "br", "srv", { color: "red", label: "waiting..." }, { at: "35%" });
      s.badge("frz", { x: 430, y: 630, text: "Frozen Spinner 8.0s", color: "red", size: 22 }, { at: "60%" });
    }},
    { say: "الحل هو استقبال أحداث SSE لتظهر الخطوات والـ Tokens تدريجيًا فور توليدها.", do: s => {
      s.to("l_wt", { color: "teal", label: "SSE stream" }, { at: "15%" });
      s.to("frz", { text: "First token in 350 ms!", color: "green" }, { at: "45%" });
      s.stream("srv", "br", { span: 3.5, every: 0.65, color: "teal" });
    }},
    { sec: "الواجهة الحية", say: "في الواجهة نقسم الشاشة: قائمة الخطوات الحية يسارًا، ومسودة الرد المتدفقة يمينًا.", do: s => {
      s.clear({ dur: 0.35 });
      s.zone("ui", { x: 800, y: 545, w: 1080, h: 520, label: "ReplyAssist Workspace · Ticket #812", color: "soft", size: 24 }, { at: "0%" });
      ["✓ classified: billing", "✓ found 3 policy sources", "✓ order #812 verified", "… streaming draft"].forEach((t, i) => {
        s.box("st" + i, { x: 540, y: 380 + i * 74, w: 400, h: 54, label: t, size: 20, color: i < 3 ? "green" : "gold", font: "ui" }, { at: 0.25 + i * 0.25 });
      });
      s.bubble("dr", { text: "We're sorry for the double charge on order #812…", side: "a", x: 1050, y: 440, w: 430, size: 20, color: "teal" }, { at: "65%", in: "type", dur: 1.3 });
    }},
    { say: "وعندما يقترح الوكيل استردادًا، تظهر بطاقة الموافقة بالمبلغ والمصدر مع أزرار القرار.", do: s => {
      s.box("ap", { x: 1050, y: 620, w: 430, h: 105, label: "Refund $49 · order #812\nsources: policy §2", size: 21, color: "gold" }, { at: "15%" });
      s.row("bt", ["Approve", "Edit", "Reject"], { x: 1050, y: 730, size: 19, gap: 16, colors: ["green", "blue", "red"], h: 42, font: "ui" }, { at: "50%" });
    }},
    { sec: "استهلاك SSE", say: "في React نستمع لأحداث البث عبر EventSource أو fetch لنحدّث الحالة لحظيًا.", do: s => {
      s.clear({ dur: 0.35 });
      s.code("cd_fe", { x: 800, y: 520, size: 21, title: "useTicketStream.ts", lines: ["const es = new EventSource(`/api/tickets/${id}/stream`);", "es.addEventListener('step', (e) => addStep(JSON.parse(e.data)));", "es.addEventListener('token', (e) => appendDraft(e.data));", "es.addEventListener('interrupt', (e) => showApprovalCard(e.data));"] }, { at: "10%", dur: 1.4 });
      s.to("cd_fe", { hl: 1 }, { at: "45%" });
      s.to("cd_fe", { hl: 3 }, { at: "75%" });
    }},
    { sec: "الاختبار الشامل", say: "وللاختبار، نشغّل رحلة من الطرف للطرف: من الواجهة إلى الـ API فالرسم فقاعدة البيانات.", eq: "@T{E2E}: @B{UI} @to @C{API} @to @P{Graph} @to @Y{DB} @to @B{UI}", do: s => {
      s.clear({ dur: 0.35 });
      s.chain("e2e", ["UI", "API", "LangGraph", "Postgres", "UI"], { y: 500, gap: 65, colors: ["blue", "teal", "purple", "gold", "blue"], icons: ["browser", "server", "graph", "db", "browser"], w: 185, h: 140, size: 22, pulse: true }, { at: "10%", st: 0.2 });
      s.stream("e2e0", "e2e4", { span: 4, every: 0.85, color: "green" });
    }},
    { say: "نتحقق من أن الضغط على Approve يستأنف الرسم ويسجل القرار في قاعدة البيانات.", do: s => {
      s.focus(["e2e2", "e2e3"], { zoom: 1.15, dim: 0.3 }, { at: "10%" });
      s.badge("ok_e2e", { x: 800, y: 690, text: "assert refund_requests.status == 'approved'", color: "green", size: 22 }, { at: "45%" });
    }},
    { sec: "تصحيح الأخطاء", say: "وعند ظهور عطل في التكامل، نضع ثلاثة أدلة جنبًا إلى جنب لتحديد موضع الخلل فورًا.", eq: "@T{Debug} = @C{SSE events} + @Y{DB rows} + @P{Traces}", do: s => {
      s.clear({ dur: 0.35 });
      s.grid("dbg", ["SSE events", "DB rows", "Traces"], { cols: 3, y: 480, cw: 360, ch: 170, size: 26, icons: ["bolt", "db", "eye"], colors: ["teal", "gold", "purple"] }, { at: "10%", st: 0.2 });
    }},
    { say: "فإذا توقفت الواجهة عند Loading، نفحص آخر حدث SSE، وصف checkpoint، وTrace العقدة.", do: s => {
      s.focus("dbg0", { zoom: 1.15, dim: 0.3 }, { at: "15%" });
      s.note("dbg_n", { x: 800, y: 690, text: "Missing 'done' event? Check SSE stream vs DB status", color: "red", size: 24 }, { at: "50%" });
    }},
    { sec: "الخلاصة", say: "لا تعتمد على اختبار الواجهة ببيانات وهمية وحدها؛ اربطها بخلفية اختبارية حقيقية.", do: s => {
      s.clear({ dur: 0.35 });
      s.versus("vs_ts", "Mock-Only UI Test", "Real E2E + 3-Pane Debug", { colors: ["red", "green"], h: 440, y: 520 }, { at: "0%" });
      s.box("vl", { x: 440, y: 520, w: 440, h: 90, label: "Misses SSE & DB bugs", icon: "x", inline: true, color: "red", size: 22 }, { at: "30%" });
      s.box("vr", { x: 1160, y: 520, w: 460, h: 90, label: "Catches schema & stream bugs", icon: "check", inline: true, color: "green", size: 22 }, { at: "55%" });
    }},
    { say: "بث حي بالـ SSE، وموافقة واضحة، واختبار شامل، وأدلة للتصحيح: هكذا يكتمل ReplyAssist.", do: s => {
      s.box("sum3", { x: 800, y: 800, w: 880, h: 66, label: "Streamed UI + Approval Card + E2E Tests + Debug Traces", color: "teal", size: 22 }, { at: "20%" });
    }}
  ]);

  // ------------------------------------------------------------------ A5.1 Auth & per-tenant access
  X.lesson("A5.1", [
    { sec: "خطر التسريب", say: "ماذا يحدث لو أرسل مستخدم من شركة ٤٢ طلبًا يزعم فيه أنه ينتمي للشركة ٤٣؟", eq: "@T{tenant@_id} = @G{session.tenant@_id} @neq @R{body.tenant@_id}", do: s => {
      s.bubble("att", { text: "POST /draft  {\"tenant_id\": 43, \"ticket\": 9001}", side: "u", x: 450, y: 450, w: 500, font: "mono", size: 20, color: "red" });
      s.box("srv", { x: 1050, y: 450, w: 280, h: 110, label: "Naive Server", icon: "server", color: "dim", size: 24 }, { at: "35%" });
      s.link("l_at", "att", "srv", { color: "red", pulse: true }, { at: "50%" });
    }},
    { say: "إذا وثق الخادم بجسم الطلب، فسيكشف تذاكر ومستندات عميل آخر في ثانية واحدة!", do: s => {
      s.box("leak", { x: 1050, y: 650, w: 460, h: 80, label: "LEAK: Tenant 43 data exposed!", icon: "alert", inline: true, color: "red", size: 22 }, { at: "20%" });
      s.link("l_lk", "srv", "leak", { color: "red" }, { at: "35%" });
      s.mark("lk_x", "leak", "x", { at: "65%" });
    }},
    { sec: "مصدر الهوية", say: "القاعدة الصارمة: استخرج tenant_id من الجلسة أو التوكن الموثّق في الخادم فقط.", do: s => {
      s.clear({ dur: 0.35 });
      s.code("bad", { x: 430, y: 510, size: 21, title: "request body (untrusted)", lines: ["{\"tenant_id\": 43,", " \"ticket\": 9001}"] }, { at: "10%" });
      s.mark("bx", "bad", "x", { at: "35%" });
      s.box("ses", { x: 1150, y: 510, w: 440, h: 120, label: "Verified Session → tenant_id = 42", icon: "lock", inline: true, size: 22, color: "green" }, { at: "45%" });
      s.mark("sc", "ses", "check", { at: "75%" });
    }},
    { sec: "الأدوار", say: "بعد التحقق من الجهة، نطبّق ثلاثة أدوار: موظف، ومشرف للموافقة، ومدير للنظام.", eq: "@T{RBAC}: @B{agent} @subset @Y{supervisor} @subset @P{admin}", do: s => {
      s.clear({ dur: 0.35 });
      s.grid("rl", ["agent", "supervisor", "admin"], { cols: 3, y: 450, cw: 360, ch: 150, size: 28, icons: ["user", "shieldok", "key"], colors: ["blue", "gold", "purple"], subs: ["reads & drafts", "approves refunds", "manages settings"] }, { at: "10%", st: 0.2 });
    }},
    { say: "فالموظف يقرأ ويجهز المسودات، لكن المشرف وحده يملك صلاحية اعتماد الاسترداد.", do: s => {
      s.focus("rl1", { zoom: 1.18, dim: 0.3 }, { at: "10%" });
      s.badge("sup_b", { x: 800, y: 660, text: "Only supervisor can trigger refund execution", color: "gold", size: 22 }, { at: "45%" });
    }},
    { sec: "حماية الأدوات", say: "والأدوات التي يستدعيها الوكيل تستلم نطاق العميل من سياق الخادم، لا من النموذج.", do: s => {
      s.unfocus({ at: "0%" });
      s.out("sup_b", { dur: 0.2 });
      s.box("ctx", { x: 520, y: 720, w: 380, h: 76, label: "server context: tenant = 42", icon: "lock", inline: true, size: 21, color: "green" }, { at: "15%" });
      s.box("tl", { x: 1080, y: 720, w: 380, h: 76, label: "orders_get(order_id=812)", font: "mono", size: 20, color: "orange" }, { at: "35%" });
      s.link("l_ct", "ctx", "tl", { color: "green", label: "injected scope", pulse: true }, { at: "55%" });
    }},
    { sec: "التطبيق والتدقيق", say: "في FastAPI نفرض التبعية get_current_user، ونحقن tenant_id في كل استعلام SQL.", do: s => {
      s.clear({ dur: 0.35 });
      s.code("cd_auth", { x: 800, y: 520, size: 21, title: "routes.py", lines: ["@app.get(\"/tickets/{tid}\")", "def get_ticket(tid: int, user=Depends(get_current_user)):", "    row = db.query(Ticket).filter_by(id=tid, tenant_id=user.tenant_id).first()", "    if not row: raise HTTPException(403, \"Forbidden\")"] }, { at: "10%", dur: 1.3 });
      s.to("cd_auth", { hl: 2 }, { at: "55%" });
    }},
    { say: "ونسجّل كل قرار استرداد في سجل تدقيق غير قابل للتعديل: من وافق، على ماذا، ومتى.", do: s => {
      s.clear({ dur: 0.35 });
      s.code("au", { x: 800, y: 520, size: 22, title: "audit_log (append-only)", lines: ["2026-11-27 14:02  tenant:42  supervisor:7  APPROVED refund $49  #812", "2026-11-27 14:09  tenant:42  supervisor:7  REJECTED refund $900 #815"] }, { at: "15%", dur: 1.3 });
      s.to("au", { hl: 0 }, { at: "60%" });
    }},
    { sec: "اختبار العزل", say: "أخيرًا، اختبر العزل فعليًا: اطلب تذكرة شركة ٤٣ كمستخدم من ٤٢، وتوقع 403.", eq: "@T{Cross-Tenant Test}: @T{tenant}_{42} @to @T{ticket}_{43} @implies @R{403 Forbidden}", do: s => {
      s.clear({ dur: 0.35 });
      s.bubble("rq", { text: "GET /tickets/9001  (session: tenant 42, ticket owner: tenant 43)", side: "u", x: 540, y: 480, w: 580, font: "mono", size: 20 }, { at: "10%" });
      s.box("res", { x: 1120, y: 480, w: 340, h: 80, label: "403 Forbidden ✓", font: "mono", size: 24, color: "green" }, { at: "55%" });
      s.link("l_rq", "rq", "res", { color: "green", pulse: true }, { at: "45%" });
    }},
    { say: "تذكر: لا تمرر tenant_id كمعامل للأداة يملؤه النموذج؛ لأن حقن الأوامر قد يغيّره.", do: s => {
      s.box("wrn", { x: 800, y: 670, w: 760, h: 74, label: "Never let the LLM choose tenant_id in tool arguments!", icon: "alert", inline: true, color: "red", size: 22 }, { at: "20%" });
    }},
    { say: "هوية من الجلسة، وصلاحيات بالأدوار، ونطاق محقون في الأدوات، واختبار عزل: هذا أمان ReplyAssist.", do: s => {
      s.to("wrn", { color: "teal", icon: "shieldok", label: "Session Tenant + RBAC + Server Scope + Audit + 403 Test" }, { at: "25%" });
    }}
  ]);

  // ------------------------------------------------------------------ A5.2 Production budgets
  X.lesson("A5.2", [
    { sec: "الاستهلاك غير المحدود", say: "بند OWASP العاشر يحذّر من الاستهلاك غير المحدود: حلقة وكيل منفلتة قد تحرق ميزانيتك!", eq: "@R{OWASP LLM10}: @T{Unbounded Loop} @implies @R{Runaway Cost}", do: s => {
      s.num("bill", { v: 12, x: 800, y: 470, size: 84, color: "gold", pre: "$" }, { at: "10%" });
      s.to("bill", { v: 4800, color: "red" }, { at: "30%", dur: 2.0, ease: "in" });
      s.badge("alrt", { x: 800, y: 630, text: "1 runaway loop = $4,800 overnight", color: "red", size: 24 }, { at: "65%" });
    }},
    { say: "بدون قيود، يكرر الوكيل استدعاء الأداة أو يطلب مستخدم واحد آلاف التوليدات.", do: s => {
      s.box("lp", { x: 800, y: 740, w: 620, h: 70, label: "while True: llm(huge_context)  # no cap!", font: "mono", size: 21, color: "red" }, { at: "20%" });
      s.mark("lp_x", "lp", "x", { at: "60%" });
    }},
    { sec: "حدود المعدل", say: "الحاجز الأول: حدود معدل الطلبات لكل مستخدم ولكل عميل، مثل ستين طلبًا في الدقيقة.", do: s => {
      s.clear({ dur: 0.35 });
      s.box("u", { x: 380, y: 500, w: 210, h: 110, label: "User", icon: "user", color: "blue", size: 24 }, { at: "10%" });
      s.box("rl", { x: 800, y: 500, w: 300, h: 110, label: "60 req / min", icon: "gauge", inline: true, size: 23, color: "gold" }, { at: "25%" });
      s.box("api", { x: 1220, y: 500, w: 220, h: 110, label: "LLM", icon: "brain", color: "purple", size: 24 }, { at: "35%" });
      s.link("l_ur", "u", "rl", { color: "blue", pulse: true }, { at: "40%" });
      s.link("l_ra", "rl", "api", { color: "teal", pulse: true }, { at: "50%" });
      s.stream("u", "rl", { span: 3.5, every: 0.6, color: "blue" });
    }},
    { say: "وعند تجاوز هذا المعدل، ترفض البوابة الطلبات الزائدة فورًا قبل وصولها للنموذج.", do: s => {
      s.badge("rl_b", { x: 800, y: 660, text: "Excess traffic blocked at gateway (429)", color: "red", size: 22 }, { at: "25%" });
      s.pulse("rl", { color: "red", at: "55%" });
    }},
    { sec: "سقوف الاستدعاء", say: "الحاجز الثاني: تحديد max_tokens لكل استدعاء وmax_steps لكل رحلة وكيل.", eq: "@T{Call Cost} @le @T{max@_tokens} @times @T{price} @quad (@T{max@_steps} = 8)", do: s => {
      s.clear({ dur: 0.35 });
      s.gauge("t", { x: 540, y: 530, r: 130, v: 0.6, color: "teal", label: "max_tokens = 600" }, { at: "15%" });
      s.gauge("st", { x: 1060, y: 530, r: 130, v: 0.4, color: "blue", label: "max_steps = 8" }, { at: "40%" });
    }},
    { say: "فإن علق الوكيل في استدعاء أداة متكررة، يوقفه سقف الخطوات عند الخطوة الثامنة فورًا.", do: s => {
      s.focus("st", { zoom: 1.18, dim: 0.3 }, { at: "10%" });
      s.to("st", { v: 1.0, color: "orange" }, { at: "35%", dur: 0.9 });
      s.badge("st_stop", { x: 1060, y: 710, text: "Step 8 reached → graceful stop ✓", color: "orange", size: 21 }, { at: "65%" });
    }},
    { sec: "الميزانية اليومية", say: "الحاجز الثالث: ميزانية يومية لكل عميل، مع إيقاف إجباري ورمز 429 عند بلوغها.", eq: "@T{if } @Y{daily@_spend} @ge @G{budget} @implies @R{HTTP 429}", do: s => {
      s.clear({ dur: 0.35 });
      s.bar("sp", { x: 520, y: 450, w: 560, v: 0.45, color: "teal", label: "today's spend", size: 26, h: 34 }, { at: "10%" });
      s.to("sp", { v: 1.0, color: "red" }, { at: "35%", dur: 1.3 });
      s.box("b429", { x: 800, y: 620, w: 580, h: 74, label: "429 · Daily AI budget exceeded", font: "mono", size: 23, color: "red" }, { at: "70%" });
    }},
    { sec: "المتابعة والكود", say: "الحاجز الرابع: لوحات متابعة لتكلفة كل تذكرة لاكتشاف التذاكر الشاذة مبكرًا.", do: s => {
      s.clear({ dur: 0.35 });
      ["#812", "#813", "#814", "#815", "#816"].forEach((t, i) => {
        const v = [0.2, 0.25, 0.92, 0.18, 0.22][i];
        s.bar("c" + i, { x: 560, y: 360 + i * 82, w: 520, v, color: v > 0.5 ? "red" : "teal", label: "ticket " + t, val: "$" + (v * 0.4).toFixed(2), size: 23, h: 28 }, { at: 0.15 + i * 0.12 });
      });
      s.badge("out_t", { x: 1260, y: 525, text: "#814 outlier!", color: "red", size: 22 }, { at: "75%" });
    }},
    { say: "وفي الكود: نفحص الميزانية قبل استدعاء النموذج، ونمرر max_tokens كسقف صارم.", do: s => {
      s.clear({ dur: 0.35 });
      s.code("cd", { x: 800, y: 520, size: 23, title: "guard.py", lines: ["if tenant.daily_spend_usd >= tenant.budget_usd:", "    raise HTTPException(429, \"Daily AI budget exceeded\")", "resp = llm(prompt, max_tokens=600)  # hard per-call cap"] }, { at: "15%", dur: 1.4 });
      s.to("cd", { hl: 0 }, { at: "45%" });
      s.to("cd", { hl: 2 }, { at: "75%" });
    }},
    { sec: "الخطأ الشائع", say: "لا تكتفِ بتنبيه بريد إلكتروني فقط؛ لأن الفاتورة قد تتضاعف قبل أن تقرأ البريد!", do: s => {
      s.clear({ dur: 0.35 });
      s.versus("v_bg", "Email Alert Only", "Hard Stop + Cap", { colors: ["red", "green"], h: 430, y: 520 }, { at: "0%" });
      s.box("v_l", { x: 440, y: 520, w: 450, h: 86, label: "Alert arrives after $3,000 spent", icon: "x", inline: true, color: "red", size: 21 }, { at: "30%" });
      s.box("v_r", { x: 1160, y: 520, w: 450, h: 86, label: "429 stops loop at exact budget", icon: "check", inline: true, color: "green", size: 21 }, { at: "55%" });
    }},
    { say: "حدود معدل، وسقف tokens وخطوات، وميزانية يومية، ولوحة تكلفة: درعك ضد الاستهلاك غير المحدود.", do: s => {
      s.box("sum_b", { x: 800, y: 795, w: 920, h: 66, label: "Rate Limit + max_tokens + max_steps + Daily 429 + Cost Dashboard", color: "teal", size: 21 }, { at: "20%" });
    }}
  ]);

  // ------------------------------------------------------------------ A5.3 Durable checkpoints in Postgres
  X.lesson("A5.3", [
    { sec: "المشكلة", say: "التذكرة #812 متوقفة الآن عند approve ⏸ بانتظار المشرف، وحالتها محفوظة في الذاكرة.", eq: "@R{InMemorySaver} + @O{Deploy} @implies @R{Lost State}", do: s => {
      s.box("mem", { x: 560, y: 490, w: 340, h: 150, label: "InMemorySaver (RAM)", icon: "chip", color: "gold", size: 24 });
      s.badge("p812", { x: 560, y: 620, text: "ticket-812 paused ⏸", color: "purple", size: 22 }, { at: "40%" });
    }},
    { say: "عندما تنشر تحديثًا أو يُعاد تشغيل الخادم، تُمحى الذاكرة وتضيع كل التذاكر المعلقة!", do: s => {
      s.icon("dp", { name: "rocket", x: 1060, y: 490, s: 90, color: "orange" }, { at: "15%" });
      s.to("mem", { opacity: 0.25, color: "red" }, { at: "45%" });
      s.to("p812", { text: "thread lost!", color: "red" }, { at: "60%" });
      s.mark("m_x", "mem", "x", { at: "75%" });
    }},
    { sec: "PostgresSaver", say: "الحل هو استبدال الـ Checkpointer في الذاكرة بـ PostgresSaver الدائم.", eq: "@G{PostgresSaver}(@T{thread@_id}) @implies @G{Survives Restart}", do: s => {
      s.clear({ dur: 0.35 });
      s.box("pg", { x: 800, y: 630, w: 360, h: 145, label: "PostgresSaver", icon: "db", color: "green", size: 26 }, { at: "15%" });
      [0, 1, 2].forEach(i => {
        s.box("r" + i, { x: 420 + i * 380, y: 360, w: 230, h: 74, label: "replica " + (i + 1), icon: "server", inline: true, size: 21, color: "blue" }, { at: 0.35 + i * 0.15 });
        s.link("l" + i, "r" + i, "pg", { color: "green", pulse: true }, { at: 0.5 + i * 0.15 });
      });
    }},
    { say: "وبذلك تشترك عدة نسخ من الخادم في الحالة نفسها؛ أي نسخة تكمل من حيث توقفت السابقة.", do: s => {
      s.stream("r0", "pg", { span: 3.5, every: 0.85, color: "teal" });
      s.stream("pg", "r2", { span: 3.5, every: 0.95, color: "green" });
      s.badge("ha", { x: 800, y: 765, text: "Stateless replicas + stateful Postgres", color: "teal", size: 22 }, { at: "50%" });
    }},
    { sec: "الإعداد والكود", say: "نشغّل cp.setup() مرة واحدة لإنشاء الجداول، ثم نمرّر cp عند تجميع الرسم.", do: s => {
      s.clear({ dur: 0.35 });
      s.code("cd", { x: 800, y: 520, size: 22, title: "app.py", lines: ["with PostgresSaver.from_conn_string(DB_URI) as cp:", "    cp.setup()  # creates checkpoints tables once", "    app = graph.compile(checkpointer=cp)", "    app.invoke(inp, {\"configurable\": {\"thread_id\": \"ticket-812\"}})"] }, { at: "10%", dur: 1.4 });
      s.to("cd", { hl: 1 }, { at: "45%" });
      s.to("cd", { hl: 2 }, { at: "75%" });
    }},
    { say: "وباستخدام thread_id نفسه نستأنف التذكرة بدقة بعد موافقة المشرف أو إعادة التشغيل.", eq: "@T{config} = @{ @T{thread@_id}: @P{\"ticket-812\"} @}", do: s => {
      s.to("cd", { hl: 3 }, { at: "20%" });
      s.badge("tid", { x: 800, y: 720, text: "Same thread_id → exact step resumed ✓", color: "purple", size: 24 }, { at: "55%" });
    }},
    { say: "يخزّن PostgresSaver كل خطوة في جدول checkpoints مع حالتها الكاملة وسجل الموافقات.", do: s => {
      s.out(["cd", "tid"], { dur: 0.25 });
      s.grid("pgt", ["thread_id: ticket-812", "step: 4 (approve)", "state: JSONB", "parent_cp: cp_03"], { cols: 2, y: 510, cw: 380, ch: 96, size: 21, font: "mono", colors: ["purple", "gold", "teal", "blue"] }, { at: "15%", st: 0.15 });
    }},
    { sec: "قبل الإطلاق", say: "اختبر سيناريو الإيقاف المفاجئ قبل الإطلاق: أوقف الخادم بـ kill -9 ثم استأنف التذكرة.", do: s => {
      s.clear({ dur: 0.35 });
      s.chain("kr", ["Step 2 running", "kill -9 crash", "Server restarts", "Resume Step 3 ✓"], { y: 490, gap: 60, colors: ["blue", "red", "gold", "green"], icons: ["play", "alert", "rocket", "check"], w: 220, h: 135, size: 20, pulse: true }, { at: "10%", st: 0.22 });
    }},
    { say: "وخطّط لتنظيف نقاط الحفظ القديمة دوريًا حتى لا تمتلئ قاعدة البيانات مع الزمن.", do: s => {
      s.box("ret", { x: 800, y: 710, w: 660, h: 72, label: "Retention policy: prune checkpoints older than 30 days", icon: "trash", inline: true, color: "gold", size: 22 }, { at: "25%" });
    }},
    { sec: "الخطأ الشائع", say: "إياك أن تترك InMemorySaver في الإنتاج خلف أكثر من عامل؛ لأن كل طلب سيذهب لذاكرة مختلفة.", do: s => {
      s.clear({ dur: 0.35 });
      s.versus("v_cp", "InMemorySaver in Prod", "PostgresSaver + Retention", { colors: ["red", "green"], h: 430, y: 520 }, { at: "0%" });
      s.box("vcl", { x: 440, y: 520, w: 450, h: 86, label: "Worker 2 cannot see Worker 1 state", icon: "x", inline: true, color: "red", size: 21 }, { at: "30%" });
      s.box("vcr", { x: 1160, y: 520, w: 450, h: 86, label: "Durable across deploys & replicas", icon: "check", inline: true, color: "green", size: 21 }, { at: "55%" });
    }},
    { say: "PostgresSaver، وthread_id ثابت، واختبار kill -9، وخطة تنظيف: استمرارية مضمونة في الإنتاج.", do: s => {
      s.box("sum_cp", { x: 800, y: 795, w: 880, h: 66, label: "PostgresSaver + setup() + thread_id + kill-9 test + 30d cleanup", color: "green", size: 21 }, { at: "20%" });
    }}
  ]);

  // ------------------------------------------------------------------ A5.4 Eval suite in CI
  X.lesson("A5.4", [
    { sec: "تراجع صامت", say: "تعديل بسيط في الـ Prompt قد يحسّن حالة واحدة، لكنه يُسقط دقة الاسترداد من ٩٦٪ إلى ٨٤٪!", eq: "@T{Prompt tweak} @implies @G{96@%} @to @R{84@% (silent regression)}", do: s => {
      s.bar("b_old", { x: 520, y: 440, w: 560, v: 0.96, color: "green", label: "before tweak", val: "96%", size: 26, h: 34 }, { at: "10%" });
      s.bar("b_new", { x: 520, y: 560, w: 560, v: 0.96, color: "teal", label: "after tweak", val: "96%", size: 26, h: 34 }, { at: "30%" });
      s.to("b_new", { v: 0.84, color: "red", val: "84%" }, { at: "50%", dur: 1.2 });
    }},
    { say: "ولن تكتشف هذا التراجع إلا بعد شكاوى العملاء، ما لم تضع التقييمات كبوابة في CI.", do: s => {
      s.badge("no_ci", { x: 800, y: 700, text: "Without CI evals, regressions ship silently!", color: "red", size: 24 }, { at: "25%" });
    }},
    { sec: "بوابة CI", say: "نحوّل التقييمات إلى خطوة آلية في CI: كل Pull Request يشغّل حزمة منع التراجع.", eq: "@T{Merge} @iff @G{Pass Rate} @ge 95@%", do: s => {
      s.clear({ dur: 0.35 });
      s.chain("ci", ["git push / PR", "run evals", "pass >= 95%?", "merge ✓"], { y: 460, gap: 60, colors: ["blue", "teal", "gold", "green"], icons: ["pr", "gear", "scale", "branch"], w: 225, h: 140, size: 21, pulse: true }, { at: "10%", st: 0.22 });
    }},
    { say: "وأي انخفاض عن الحد الأساسي يمنع الدمج تلقائيًا قبل وصول الخلل للإنتاج.", do: s => {
      s.box("blk", { x: s.get("ci2").x, y: 690, w: 320, h: 70, label: "91% → merge blocked ✗", size: 22, color: "red" }, { at: "25%" });
      s.link("bl", "ci2", "blk", { color: "red", pulse: true }, { at: "40%" });
      s.mark("blk_x", "blk", "x", { at: "70%" });
    }},
    { sec: "حزمتا التقييم", say: "للسرعة، نحتفظ بحزمة سريعة لكل PR، وحزمة شاملة تعمل ليلًا على جميع الحالات.", eq: "@T{CI Suite} = @C{PR (60 cases)} + @P{Nightly (1200 cases)}", do: s => {
      s.clear({ dur: 0.35 });
      s.versus("vs", "Per-PR · 3 min", "Nightly · Full Suite", { colors: ["teal", "purple"], h: 480, y: 530 }, { at: "0%" });
      s.num("a", { v: 60, x: 440, y: 520, size: 64, color: "teal", suf: " cases" }, { at: "30%" });
      s.num("b", { v: 1200, x: 1160, y: 520, size: 64, color: "purple", suf: " cases" }, { at: "55%" });
    }},
    { say: "وتغطي الحزمة أربعة محاور: الاسترجاع، وجودة الإجابة، واختيار الأدوات، ومقاومة الحقن.", do: s => {
      s.clear({ dur: 0.35 });
      s.grid("k", ["retrieval", "answers", "tool choice", "injection"], { cols: 4, y: 500, cw: 270, ch: 165, size: 24, icons: ["search", "check", "tool", "shield"], colors: ["teal", "green", "orange", "red"] }, { at: "10%", st: 0.18 });
    }},
    { sec: "التذبذب والكود", say: "بما أن الوكلاء متذبذبون قليلًا، نكرر المهام الحساسة ثلاث مرات ونقبل نجاح اثنتين.", eq: "@T{Flaky Agent}: @T{fail only if } @G{passes} < 2/3", do: s => {
      s.clear({ dur: 0.35 });
      ["✓", "✗", "✓"].forEach((t, i) => s.box("t" + i, { x: 640 + i * 160, y: 470, w: 120, h: 90, label: t, size: 42, color: t === "✓" ? "green" : "red" }, { at: 0.2 + i * 0.25 }));
      s.box("res", { x: 800, y: 650, w: 320, h: 68, label: "2 / 3 → pass ✓", size: 26, color: "green" }, { at: "70%" });
    }},
    { say: "ونربط ذلك بملف GitHub Actions بسيط يشغّل التقييمات ويخزن النتائج لمتابعة الاتجاه.", do: s => {
      s.clear({ dur: 0.35 });
      s.code("cd", { x: 800, y: 520, size: 22, title: ".github/workflows/evals.yml", lines: ["- name: Run AI Regression Evals", "  run: python evals/run.py --suite=pr --min-pass-rate=0.95", "- name: Upload Eval Trend", "  run: python evals/log_metrics.py"] }, { at: "10%", dur: 1.3 });
      s.to("cd", { hl: 1 }, { at: "55%" });
    }},
    { say: "وبتسجيل النتائج عبر الزمن نرى تحسّن الجودة أو تراجعها قبل أن يلاحظها المستخدم.", do: s => {
      s.clear({ dur: 0.35 });
      s.bars("tr", [["v1.0 (baseline)", 0.94, "blue", "94%"], ["v1.1 (new RAG)", 0.96, "teal", "96%"], ["v1.2 (reranker)", 0.98, "green", "98%"]], { x: 540, y: 510, w: 540, gap: 80, size: 24, h: 32 }, { at: "15%" });
    }},
    { sec: "الخلاصة", say: "الاعتماد على الفحص اليدوي السريع قبل الدمج يخدعك؛ الأتمتة في CI تحمي الجودة دائمًا.", do: s => {
      s.clear({ dur: 0.35 });
      s.versus("v_ev", "Manual Vibe-Check", "Automated CI Gate", { colors: ["red", "green"], h: 430, y: 520 }, { at: "0%" });
      s.box("vel", { x: 440, y: 520, w: 450, h: 86, label: "Tests 3 prompts, misses 50 cases", icon: "x", inline: true, color: "red", size: 21 }, { at: "30%" });
      s.box("ver", { x: 1160, y: 520, w: 450, h: 86, label: "Blocks < 95% & tracks trends", icon: "check", inline: true, color: "green", size: 21 }, { at: "55%" });
    }},
    { say: "حزمة PR سريعة، وحزمة ليلية شاملة، ومحاور أربعة، وتمرير بالأغلبية: هذا انضباط الإنتاج.", do: s => {
      s.box("sum_ev", { x: 800, y: 795, w: 880, h: 66, label: "PR Suite + Nightly Suite + 4 Pillars + 2/3 Retry + Trend Log", color: "teal", size: 21 }, { at: "20%" });
    }}
  ]);

  // ------------------------------------------------------------------ A5.5 AI gateways, fallbacks & semantic caching
  X.lesson("A5.5", [
    { sec: "نقطة فشل واحدة", say: "إذا اتصل تطبيقك بمزوّد نموذج واحد مباشرة، فإن أي عطل أو حد معدل 429 يوقف خدمتك فورًا.", eq: "@T{Single Provider} + @R{429 / 503} @implies @R{App Outage}", do: s => {
      s.box("app", { x: 420, y: 500, w: 230, h: 120, label: "ReplyAssist", icon: "code", color: "teal", size: 23 });
      s.box("p0", { x: 1120, y: 500, w: 280, h: 120, label: "Provider A", icon: "cloud", color: "purple", size: 23 }, { at: "25%" });
      s.link("l_ap", "app", "p0", { color: "teal", pulse: true }, { at: "40%" });
      s.to("p0", { color: "red", label: "Provider A · 503!" }, { at: "65%" });
      s.mark("p0_x", "p0", "x", { at: "80%" });
    }},
    { sec: "برج المراقبة", say: "الحل: ضع بوابة ذكاء اصطناعي مثل LiteLLM أمام المزوّدين، كبرج مراقبة يوجّه الرحلات.", eq: "@T{Gateway} = @Y{Fallback} + @G{Semantic Cache} + @B{Canary}", do: s => {
      s.clear({ dur: 0.35 });
      s.box("app", { x: 320, y: 530, w: 210, h: 120, label: "your app", icon: "code", color: "teal", size: 22 }, { at: "5%" });
      s.box("gw", { x: 780, y: 530, w: 260, h: 150, label: "AI Gateway", icon: "layers", color: "gold", size: 26 }, { at: "20%" });
      ["provider A", "provider B", "self-hosted"].forEach((t, i) => {
        s.box("p" + i, { x: 1260, y: 370 + i * 160, w: 250, h: 82, label: t, size: 22, color: ["purple", "blue", "green"][i] }, { at: 0.35 + i * 0.12 });
        s.link("pl" + i, "gw", "p" + i, { color: "dim" }, { at: 0.45 + i * 0.12 });
      });
      s.link("a", "app", "gw", { color: "teal", pulse: true }, { at: "30%" });
    }},
    { say: "فإذا أعاد المزوّد الأول 429 أو 503، تحوّل البوابة الطلب تلقائيًا إلى المزوّد البديل.", do: s => {
      s.flow("gw", "p0", { color: "gold", at: "10%" });
      s.to("p0", { color: "red", label: "provider A · 503" }, { at: "35%" });
      s.to("pl1", { color: "green", pulse: true }, { at: "55%" });
      s.stream("gw", "p1", { span: 3.0, every: 0.7, color: "green" });
    }},
    { say: "وبذلك لا يرى المستخدم أي خطأ، بينما تعيد البوابة المحاولة ثم تبدّل المسار بصمت.", do: s => {
      s.focus(["gw", "p1"], { zoom: 1.12, dim: 0.3 }, { at: "10%" });
      s.badge("ok_fb", { x: 780, y: 690, text: "200 OK via Provider B (0 user errors)", color: "green", size: 22 }, { at: "45%" });
    }},
    { sec: "الكاش الدلالي", say: "والكاش الدلالي يلتقط الأسئلة المتكررة المتشابهة في المعنى ويجيب عنها في ٢٠ ملي ثانية!", eq: "@T{sim}(@B{q}, @G{q}_{@T{cached}}) @ge 0.95 @implies @G{20 ms, @~@$0}", do: s => {
      s.unfocus({ at: "0%" });
      s.out("ok_fb", { dur: 0.2 });
      s.box("sc", { x: 780, y: 780, w: 340, h: 72, label: "semantic cache", icon: "bolt", inline: true, size: 22, color: "green" }, { at: "15%" });
      s.bubble("q1", { text: "How do I reset my password?", side: "u", x: 320, y: 760, w: 310, size: 19 }, { at: "35%" });
      s.link("l_qs", "q1", "sc", { color: "green", pulse: true }, { at: "50%" });
      s.badge("hit", { x: 1260, y: 780, text: "cache hit · 20 ms · ~$0", color: "green", size: 22 }, { at: "70%" });
    }},
    { say: "حتى لو اختلف الصياغ قليلًا، يقيس الكاش تشابه المتجهات ويعيد الإجابة المحفوظة فورًا.", do: s => {
      s.to("q1", { text: "Reset my password please?" }, { at: "20%" });
      s.to("hit", { text: "cosine sim = 0.97 → HIT!" }, { at: "55%" });
    }},
    { sec: "الإدارة المركزية", say: "وتجمع البوابة المفاتيح في مكان واحد، مع حدود معدل ولوحات إنفاق لكل فريق.", do: s => {
      s.clear({ dur: 0.35 });
      s.grid("ct", ["central keys", "rate limits", "spend per team"], { cols: 3, y: 490, cw: 340, ch: 165, size: 24, icons: ["key", "gauge", "chart"], colors: ["gold", "blue", "green"] }, { at: "10%", st: 0.18 });
    }},
    { sec: "الكود والإطلاق", say: "في LiteLLM نعرّف قائمة النماذج والبدائل بأسطر قليلة مع إعادة المحاولة تلقائيًا.", do: s => {
      s.clear({ dur: 0.35 });
      s.code("cd_gw", { x: 800, y: 520, size: 21, title: "gateway.py", lines: ["router = Router(model_list=[", "  {\"model_name\": \"prod-chat\", \"litellm_params\": {\"model\": \"claude-sonnet-4-5\"}},", "  {\"model_name\": \"prod-chat\", \"litellm_params\": {\"model\": \"gpt-4.1\"}}", "], num_retries=2, fallbacks=[{\"prod-chat\": [\"backup-fast\"]}])"] }, { at: "10%", dur: 1.4 });
      s.to("cd_gw", { hl: 3 }, { at: "60%" });
    }},
    { say: "وللإطلاق التدريجي، نوجّه ٥٪ فقط من الزيارات للنموذج الجديد قبل التبديل الكامل.", eq: "@T{Canary}: 5@% @G{new} + 95@% @B{stable} @to 100@% @G{new}", do: s => {
      s.clear({ dur: 0.35 });
      s.bar("old", { x: 520, y: 450, w: 560, v: 0.95, color: "blue", label: "current model", val: "95%", size: 25, h: 34 }, { at: "10%" });
      s.bar("new", { x: 520, y: 570, w: 560, v: 0.05, color: "green", label: "new model", val: "5%", size: 25, h: 34 }, { at: "25%" });
      s.to("new", { v: 1.0, val: "100%" }, { at: "55%", dur: 1.3 });
      s.to("old", { v: 0.0, val: "0%" }, { at: "55%", dur: 1.3 });
    }},
    { sec: "الخلاصة", say: "لا تكتب عميل مزوّد واحدًا مدمجًا في الكود؛ البوابة تمنحك المرونة، والسرعة، والتحكم.", do: s => {
      s.clear({ dur: 0.35 });
      s.versus("v_gw", "Hardcoded Single SDK", "AI Gateway Layer", { colors: ["red", "green"], h: 430, y: 520 }, { at: "0%" });
      s.box("vgl", { x: 440, y: 520, w: 450, h: 86, label: "Outage stops app; keys scattered", icon: "x", inline: true, color: "red", size: 21 }, { at: "30%" });
      s.box("vgr", { x: 1160, y: 520, w: 450, h: 86, label: "Fallbacks + cache + canary + spend", icon: "check", inline: true, color: "green", size: 21 }, { at: "55%" });
    }},
    { say: "بدائل تلقائية، وكاش دلالي، ومفاتيح مركزية، وإطلاق تدريجي: بنية تحتية جاهزة للإنتاج.", do: s => {
      s.box("sum_gw", { x: 800, y: 795, w: 880, h: 66, label: "AI Gateway = Auto-Fallbacks + Semantic Cache + Spend + Canary", color: "gold", size: 21 }, { at: "20%" });
    }}
  ]);

  // ------------------------------------------------------------------ A5.6 Self-hosting open-weight models
  X.lesson("A5.6", [
    { sec: "متى تستضيف؟", say: "تستضيف نموذجًا مفتوح الأوزان عندما تفرض الخصوصية، أو سيادة البيانات، أو الحجم الضخم ذلك.", eq: "@T{Self-Host} @iff @R{Privacy} @lor @Y{Sovereignty} @lor @B{High Volume}", do: s => {
      s.grid("why", ["strict privacy", "data sovereignty", "huge volume"], { cols: 3, y: 490, cw: 360, ch: 165, size: 26, icons: ["lock", "flag", "chart"], colors: ["red", "gold", "blue"] }, { at: "10%", st: 0.18 });
    }},
    { say: "فبعض القطاعات كالصحة والمصارف تمنع خروج بيانات العملاء إلى واجهات سحابية خارجية.", do: s => {
      s.focus("why0", { zoom: 1.16, dim: 0.3 }, { at: "10%" });
      s.badge("priv_b", { x: 800, y: 690, text: "Zero data leaves your VPC", color: "red", size: 23 }, { at: "45%" });
    }},
    { say: "كما أن الحجم الهائل للطلبات يجعل استئجار GPU ثابتًا أوفر اقتصاديًا من الدفع لكل Token.", do: s => {
      s.unfocus({ at: "0%" });
      s.focus("why2", { zoom: 1.16, dim: 0.3 }, { at: "15%" });
      s.to("priv_b", { text: "At 100M+ tokens/day, fixed GPU beats per-token API", color: "blue" }, { at: "45%" });
    }},
    { sec: "Ollama وvLLM", say: "للتطوير المحلي نستخدم Ollama على الحاسوب، أما في الإنتاج فنعتمد vLLM على بطاقات GPU.", do: s => {
      s.clear({ dur: 0.35 });
      s.versus("vs", "Ollama · Laptop Dev", "vLLM · GPU Production", { colors: ["teal", "purple"], h: 480, y: 530 }, { at: "0%" });
      s.icon("lp", { name: "terminal", x: 440, y: 500, s: 100, color: "teal" }, { at: "25%" });
      s.icon("gp", { name: "cpu", x: 1160, y: 500, s: 100, color: "purple" }, { at: "45%" });
    }},
    { say: "فـ vLLM يستخدم PagedAttention والتجميع المستمر لمضاعفة الطلبات المتزامنة لكل GPU.", do: s => {
      s.bars("th", [["naive serving", 0.2, "dim", "1x"], ["vLLM continuous batching", 0.92, "purple", "8x throughput"]], { x: 960, y: 710, w: 320, gap: 52, size: 20, h: 24 }, { at: "20%" });
    }},
    { sec: "التكميم", say: "والتكميم يقلّص أوزان النموذج من FP16 إلى FP8 أو INT4 لتنخفض ذاكرة GPU حتى ٤ أضعاف.", eq: "@T{VRAM}: @R{FP16 (28 GB)} @to @Y{FP8 (14 GB)} @to @G{INT4 (8 GB)}", do: s => {
      s.clear({ dur: 0.35 });
      [["FP16", 0.9, "red", "28 GB"], ["FP8", 0.45, "gold", "14 GB"], ["INT4 (AWQ)", 0.25, "green", "8 GB"]].forEach(([l, v, c, t], i) => {
        s.bar("q" + i, { x: 520, y: 420 + i * 105, w: 560, v, color: c, label: l, val: t, size: 26, h: 34 }, { at: 0.2 + i * 0.22 });
      });
    }},
    { say: "ومع ذلك تحافظ تقنيات مثل AWQ على الجودة شبه كاملة مع توفير هائل في التكلفة.", do: s => {
      s.badge("awq_b", { x: 800, y: 760, text: "Fits 14B model on a single 24 GB GPU ✓", color: "green", size: 23 }, { at: "30%" });
    }},
    { sec: "واجهة متوافقة", say: "نشغّل الخادم بواجهة متوافقة مع OpenAI، ليصبح التبديل من السحابة مجرد تغيير رابط!", eq: "@T{base@_url} = @C{http://gpu-box:8000/v1}", do: s => {
      s.clear({ dur: 0.35 });
      s.code("cd", { x: 800, y: 520, size: 21, title: "serve.sh + client.py", lines: ["vllm serve Qwen/Qwen2.5-14B-Instruct-AWQ \\", "  --quantization awq --max-model-len 16384 --port 8000", "", "client = OpenAI(base_url=\"http://gpu-box:8000/v1\", api_key=\"local\")"] }, { at: "10%", dur: 1.4 });
      s.to("cd", { hl: 1 }, { at: "45%" });
      s.to("cd", { hl: 3 }, { at: "75%" });
    }},
    { say: "بل يمكنك ربطه كأحد المسارات داخل بوابة الذكاء الاصطناعي ليكون بديلًا محليًا فوريًا.", do: s => {
      s.out("cd", { dur: 0.25 });
      s.chain("rt", ["ReplyAssist", "AI Gateway", "vLLM (gpu-box:8000)"], { y: 510, gap: 80, colors: ["teal", "gold", "purple"], icons: ["code", "layers", "cpu"], h: 130, size: 22, pulse: true }, { at: "15%", st: 0.25 });
      s.stream("rt0", "rt2", { span: 3.0, every: 0.8, color: "purple" });
    }},
    { sec: "الخطأ الشائع", say: "لا تشغّل Ollama كخادم إنتاج لمئات المستخدمين؛ استخدم vLLM للتعامل مع التزامن العالي.", do: s => {
      s.clear({ dur: 0.35 });
      s.versus("v_sh", "Ollama in High-Load Prod", "Ollama Dev + vLLM Prod", { colors: ["red", "green"], h: 430, y: 520 }, { at: "0%" });
      s.box("vsl", { x: 440, y: 520, w: 450, h: 86, label: "Queues stall under concurrent users", icon: "x", inline: true, color: "red", size: 21 }, { at: "30%" });
      s.box("vsr", { x: 1160, y: 520, w: 450, h: 86, label: "PagedAttention + AWQ + OpenAI API", icon: "check", inline: true, color: "green", size: 21 }, { at: "55%" });
    }},
    { say: "الخصوصية أو الحجم، ثم vLLM والتكميم، وواجهة OpenAI موحدة: هكذا تستضيف نموذجك باحتراف.", do: s => {
      s.box("sum_sh", { x: 800, y: 795, w: 880, h: 66, label: "When Needed → vLLM + AWQ Quantization + OpenAI-Compatible URL", color: "purple", size: 21 }, { at: "20%" });
    }}
  ]);
})();
