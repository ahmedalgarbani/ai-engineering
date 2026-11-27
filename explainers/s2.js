// Motion explainers — Stage 2: model APIs, structured outputs, tools, prompting, context, LangChain, caching, multimodal, fine-tuning
(function () {
  const X = window.Explainer;

  // ------------------------------------------------------------------ 2.1 Model APIs: your first integration
  X.lesson("2.1", [
    { sec: "الطلب والرد", say: "أول تكامل مع واجهة النموذج: نرسل قائمة رسائل، ونستقبل ردًا.", eq: "@T{response} = @T{API}(@T{messages})", do: s => {
      s.chain("c", ["your app", "model API", "response"], { y: 540, gap: 130, icons: ["code", "cloud", "chat"], colors: ["teal", "blue", "green"], w: 210, h: 160, size: 28 }, { st: 0.3 });
      s.flow("c0", "c1", { color: "teal", at: 1.2 }); s.flow("c1", "c2", { color: "blue", at: 1.9 });
    }},
    { sec: "الأدوار", say: "ولكل رسالة دور: system للتعليمات، ثم user، ثم assistant.", eq: "@P{system} @; @B{user} @; @T{assistant}", do: s => {
      s.clear({ dur: 0.4 });
      s.bubble("sy", { text: "system: You are a helpful support assistant.", side: "s", x: 800, y: 340, w: 640, size: 26 }, { at: 0.3 });
      s.bubble("us", { text: "user: Where is my order?", side: "u", x: 980, y: 500, w: 420, size: 26 }, { at: 0.7 });
      s.bubble("as", { text: "assistant: Let me check that for you.", side: "a", x: 620, y: 660, w: 480, size: 26 }, { at: 1.1 });
    }},
    { sec: "بلا حالة", say: "والـ API بلا حالة: أعد إرسال السجل كاملًا في كل استدعاء.", eq: "@T{messages}_{n} = @T{history} + @B{new}", do: s => {
      s.to(["sy", "us", "as"], { scale: 0.8, x: v => v - 260, y: v => v - 30 }, { dur: 0.6 });
      s.zone("call", { x: 540, y: 470, w: 720, h: 420, label: "call #2 sends all of this", color: "blue" }, { at: 0.5 });
      s.bubble("u2", { text: "user: And when will it arrive?", side: "u", x: 600, y: 760, w: 440, size: 24 }, { at: 0.9 });
      s.box("api", { x: 1260, y: 520, w: 200, h: 140, label: "API", icon: "cloud", color: "blue", size: 28 }, { at: 1.1 });
      s.link("la", "call", "api", { color: "blue" }, { at: 1.3 });
    }},
    { sec: "البث", say: "والبث يعرض الـ Tokens فور وصولها، فتبدو الواجهة سريعة.", do: s => {
      s.clear({ dur: 0.4 });
      s.versus("vs", "no streaming", "streaming", { colors: ["dim", "green"] }, { at: 0.2 });
      s.icon("sp", { name: "hourglass", x: 435, y: 540, s: 90, color: "dim" }, { at: 0.5 });
      s.note("wt", { text: "wait 6s… then everything", x: 435, y: 650, font: "math" }, { at: 0.6 });
      s.bubble("st", { text: "Your order shipped yesterday and arrives Friday.", side: "a", x: 1165, y: 540, w: 500, color: "green" }, { at: 0.6, in: "type", dur: 2.4 });
    }},
    { sec: "الاستهلاك", say: "والرد يخبرك بسبب التوقف، وعدد الـ Tokens المستهلكة.", eq: "@T{usage}: @; n_{@T{in}}, @; n_{@T{out}}", do: s => {
      s.clear({ dur: 0.4 });
      s.code("resp", { x: 800, y: 520, size: 26, title: "response", lines: ["stop_reason: \"end_turn\"", "usage: {", "  input_tokens: 412,", "  output_tokens: 86", "}"] }, { at: 0.3, dur: 1.4 });
      s.to("resp", { hl: 0 }, { at: 1.9, dur: 0.2 }); s.to("resp", { hl: 2 }, { at: 2.6, dur: 0.2 });
    }},
    { say: "فسجّل الاستهلاك دائمًا لتتابع التكلفة.", do: s => {
      s.to("resp", { x: 470, scale: 0.8, hl: -1 }, { dur: 0.6 });
      ["Mon", "Tue", "Wed", "Thu", "Fri"].forEach((d, i) => { const v = [0.3, 0.45, 0.4, 0.8, 0.55][i]; s.box("cb" + i, { x: 960 + i * 80, y: 700 - v * 150, w: 52, h: v * 300, r: 6, label: "", color: i === 3 ? "orange" : "teal", fill: "panel" }, { at: 0.5 + i * 0.1, in: "grow" }); s.note("cd" + i, { text: d, x: 960 + i * 80, y: 730, size: 20, font: "math" }, { at: 0.5 + i * 0.1 }); });
      s.note("ct", { text: "token cost per day", x: 1120, y: 360, font: "math", color: "gold" }, { at: 0.4 });
    }},
    { sec: "مفتاح الـ API", say: "واحفظ مفتاح الـ API في متغيرات البيئة على الخادم، لا في كود الواجهة أبدًا.", do: s => {
      s.clear({ dur: 0.4 });
      s.box("br", { x: 450, y: 520, w: 380, h: 200, label: "browser code", sub: "key = \"sk-…\"", icon: "browser", color: "red", size: 28 }, { at: 0.3 });
      s.mark("bx", "br", "x", { at: 0.8 });
      s.box("sv", { x: 1150, y: 520, w: 380, h: 200, label: "server", sub: "os.environ[\"API_KEY\"]", icon: "server", color: "green", size: 28 }, { at: 0.9 });
      s.mark("sc", "sv", "check", { at: 1.3 });
    }}
  ]);

  // ------------------------------------------------------------------ 2.2 Structured outputs & runtime validation
  X.lesson("2.2", [
    { sec: "المشكلة", say: "عندما يقرأ كودك مخرجات النموذج، يجب أن تكون مهيكلة.", do: s => {
      s.bubble("free", { text: "Sure! This looks like a refund issue, and it seems quite urgent…", side: "a", x: 560, y: 480, w: 560 });
      s.box("code", { x: 1200, y: 480, w: 240, h: 140, label: "your code", icon: "code", color: "teal", size: 28 }, { at: 0.6 });
      s.link("l", "free", "code", { color: "red" }, { at: 0.9 });
      s.box("err", { x: 1200, y: 660, label: "can't parse", size: 24, color: "red", h: 54 }, { at: 1.3 });
    }},
    { sec: "المخطط", say: "فنعرّف مخططًا: الحقول المطلوبة وأنواعها.", eq: "@T{Ticket} = @{ @T{category}, @; @T{urgent}, @; @T{summary} @}", do: s => {
      s.clear({ dur: 0.4 });
      s.code("z", { x: 800, y: 520, size: 26, title: "schema.ts", lines: ["const Ticket = z.object({", "  category: z.enum([\"refund\", \"shipping\", \"other\"]),", "  urgent: z.boolean(),", "  summary: z.string().max(200)", "});"] }, { at: 0.3, dur: 1.8 });
    }},
    { say: "ونطلب من النموذج أن يلتزم بهذا المخطط.", do: s => {
      s.to("z", { x: 470, scale: 0.75 }, { dur: 0.6 });
      s.code("js", { x: 1150, y: 520, size: 24, title: "model output", lines: ["{", "  \"category\": \"refund\",", "  \"urgent\": true,", "  \"summary\": \"Charged twice\"", "}"] }, { at: 0.6, dur: 1.2 });
    }},
    { sec: "التحقق", say: "ثم نتحقق أثناء التشغيل، قبل أن يلمس منطق العمل.", eq: "@T{parse} @to @T{validate} @to @T{use}", do: s => {
      s.clear({ dur: 0.4 });
      s.chain("v", ["model output", "validate", "business logic"], { y: 480, gap: 110, colors: ["soft", "gold", "green"], icons: ["code", "shieldok", "gear"], w: 230, h: 150, size: 26 }, { at: 0.3, st: 0.3 });
      s.flow("v0", "v1", { color: "soft", at: 1.3 }); s.flow("v1", "v2", { color: "green", at: 1.9 });
    }},
    { say: "فإن فشل التحقق، نعيد المحاولة مع رسالة الخطأ، أو نتراجع بأمان.", do: s => {
      s.bubble("bad", { text: "{ \"category\": \"refnd\" }", side: "a", x: 470, y: 720, w: 330, font: "mono", size: 22, color: "red" }, { at: 0.2 });
      s.box("msg", { x: 1020, y: 720, w: 470, h: 64, label: "category must be refund | shipping | other", size: 20, color: "red", font: "ui" }, { at: 0.7 });
      s.link("rt", "msg", "v0", { color: "orange", bend: -0.25, label: "retry with the error", lc: "orange" }, { at: 1.2 });
    }},
    { sec: "الرفض", say: "والرفض نتيجة مشروعة، لا خطأ تقني. اعرض للمستخدم رسالة واضحة.", do: s => {
      s.clear({ dur: 0.4 });
      s.box("rf", { x: 520, y: 540, w: 340, h: 120, label: "refusal", sub: "policy: can't help with that", icon: "hand", inline: true, color: "orange", size: 28 }, { at: 0.3 });
      s.box("ui", { x: 1120, y: 540, w: 480, h: 140, label: "\"We can't do that here — contact support.\"", size: 22, color: "blue", icon: "browser" }, { at: 0.8 });
      s.link("l2", "rf", "ui", { color: "orange" }, { at: 0.9 });
    }},
    { say: "والقاعدة: لا تثق أبدًا بمخرجات نموذج لم تتحقق منها.", eq: "@T{never trust unvalidated model output}", do: s => {
      s.clear({ dur: 0.4 });
      s.icon("sh", { name: "shieldok", x: 800, y: 540, s: 160, color: "green" }, { at: 0.3 });
    }}
  ]);

  // ------------------------------------------------------------------ 2.3 Tool calling from first principles
  X.lesson("2.3", [
    { sec: "وصف الأداة", say: "استدعاء الأدوات يبدأ بوصف: اسم، ووصف واضح، ومخطط مدخلات.", do: s => {
      s.code("td", { x: 800, y: 520, size: 25, title: "tools", lines: ["{\"name\": \"get_order\",", " \"description\": \"Look up an order by its numeric id\",", " \"input_schema\": {", "   \"properties\": {\"order_id\": {\"type\": \"integer\"}}}}"] }, { at: 0.2, dur: 1.8 });
    }},
    { sec: "الطلب", say: "والنموذج لا ينفّذ شيئًا؛ بل يعيد طلبًا مهيكلًا لاستدعاء الدالة.", eq: "@O{tool@_use}: @{ @T{name}, @; @T{input} @}", do: s => {
      s.to("td", { y: 330, scale: 0.7 }, { dur: 0.6 });
      s.box("llm", { x: 420, y: 620, w: 200, h: 140, label: "LLM", icon: "brain", color: "purple", size: 28 }, { at: 0.4 });
      s.bubble("tu", { text: "tool_use: get_order({\"order_id\": 812})", side: "t", x: 980, y: 620, w: 560, font: "mono", size: 22 }, { at: 0.8 });
      s.link("l1", "llm", "tu", { color: "orange" }, { at: 0.7 });
    }},
    { sec: "التحقق", say: "وتطبيقك يتحقق من المعاملات قبل التنفيذ، فقد تكون خاطئة.", do: s => {
      s.clear({ keep: ["llm"] });
      s.box("gate", { x: 800, y: 600, w: 200, h: 140, label: "validate", icon: "shieldok", color: "gold", size: 26 }, { at: 0.3 });
      s.bubble("b1", { text: "order_id: \"eight-twelve\"", side: "t", x: 800, y: 360, w: 380, font: "mono", size: 22, color: "red" }, { at: 0.5 });
      s.flow("b1", "gate", { color: "red", at: 0.9 });
      s.box("rej", { x: 1200, y: 480, label: "reject", size: 26, color: "red", h: 56 }, { at: 1.4 });
      s.bubble("b2", { text: "order_id: 812", side: "t", x: 1200, y: 780, w: 280, font: "mono", size: 22, color: "green" }, { at: 1.8 });
    }},
    { sec: "التنفيذ", say: "ثم ينفّذ الدالة، ويعيد النتيجة إلى النموذج.", eq: "@C{tool@_result} @to @T{LLM}", do: s => {
      s.clear({ keep: ["llm"] });
      s.box("fn", { x: 1150, y: 600, w: 260, h: 140, label: "get_order(812)", icon: "gear", font: "mono", size: 24, color: "teal" }, { at: 0.3 });
      s.flow("llm", "fn", { color: "orange", at: 0.5 });
      s.bubble("tr", { text: "tool_result: {\"status\": \"shipped\"}", side: "t", x: 800, y: 790, w: 500, font: "mono", size: 22, color: "teal" }, { at: 1.1 });
      s.flow("fn", "llm", { color: "teal", at: 1.4, bend: 0.2 });
    }},
    { say: "وحتى الأخطاء تعود كنتائج أداة، ليقرأها النموذج ويتصرف.", do: s => {
      s.out("tr", { dur: 0.3 });
      s.bubble("te", { text: "tool_result: {\"error\": \"order not found\"}", side: "t", x: 800, y: 790, w: 540, font: "mono", size: 22, color: "red" }, { at: 0.3 });
      s.bubble("ask", { text: "I couldn't find that order. Can you check the number?", side: "a", x: 760, y: 380, w: 560, color: "green" }, { at: 1.2 });
    }},
    { sec: "عدة أدوات", say: "وقد يطلب النموذج عدة أدوات في ردٍّ واحد؛ نفّذها جميعًا وأعد كل النتائج.", do: s => {
      s.clear({ keep: ["llm"] });
      ["get_order(812)", "get_order(813)", "get_customer(77)"].forEach((t, i) => { s.box("p" + i, { x: 1000, y: 400 + i * 130, w: 330, h: 70, label: t, font: "mono", size: 22, color: "orange" }, { at: 0.3 + i * 0.1 }); s.link("pl" + i, "llm", "p" + i, { color: "orange", w: 2 }, { at: 0.4 + i * 0.1 }); s.box("r" + i, { x: 1370, y: 400 + i * 130, w: 140, h: 60, label: "result", size: 22, color: "teal" }, { at: 1.2 + i * 0.1 }); s.link("rl" + i, "p" + i, "r" + i, { color: "teal", w: 2 }, { at: 1.1 + i * 0.1 }); });
    }},
    { say: "إذن: صِف، ثم استقبل الطلب، ثم تحقق، ثم نفّذ، ثم أعد النتيجة.", do: s => {
      s.clear({ dur: 0.4 });
      s.chain("f", ["describe", "tool_use", "validate", "execute", "tool_result"], { y: 540, gap: 44, colors: ["blue", "orange", "gold", "teal", "green"], h: 84, size: 24 }, { at: 0.3, st: 0.2 });
    }}
  ]);

  // ------------------------------------------------------------------ 3.1 Success criteria first
  X.lesson("3.1", [
    { sec: "قبل الأمر", say: "الصياغة الجيدة تبدأ قبل كتابة الأمر: بمعايير نجاح قابلة للقياس.", do: s => {
      s.icon("tg", { name: "target", x: 800, y: 470, s: 160, color: "gold" });
      s.note("tl", { text: "success criteria", x: 800, y: 600, font: "math", color: "gold", size: 32 }, { at: 0.5 });
    }},
    { say: "مثلًا: تصنيف صحيح في 95 بالمئة على الأقل، ونبرة مهذبة، وبلا سياسات مختلَقة.", eq: "@T{accuracy} @ge 95@% @; @land @; @T{polite} @; @land @; @T{no invented policy}", do: s => {
      s.to(["tg", "tl"], { x: v => v - 420 }, { dur: 0.6 });
      s.col("cr", ["classification ≥ 95%", "polite tone", "no invented policies"], { x: 1000, y: 540, size: 30, icons: ["chart", "chat", "shieldok"], colors: ["gold", "blue", "green"], w: 480 }, { at: 0.5, st: 0.25 });
    }},
    { sec: "حالات الاختبار", say: "ثم نجمع حالات اختبار من الاستخدام الحقيقي، لا من خيالنا.", do: s => {
      s.clear({ dur: 0.4 });
      s.icon("inb", { name: "inbox", x: 360, y: 520, s: 110, color: "blue" }, { at: 0.3 });
      s.note("il", { text: "real tickets", x: 360, y: 610, font: "math" }, { at: 0.4 });
      s.zone("ts", { x: 1020, y: 530, w: 620, h: 420, label: "test set", color: "gold" }, { at: 0.5 });
      for (let i = 0; i < 8; i++) s.box("c" + i, { x: 860 + (i % 4) * 106, y: 470 + Math.floor(i / 4) * 110, w: 86, h: 70, label: "", color: "soft" }, { at: 0.8 + i * 0.08 });
      s.flow("inb", "ts", { n: 4, color: "blue", gap: 0.2, at: 0.6 });
    }},
    { say: "ونضمّنها حالات صعبة وطرفية وخبيثة.", do: s => {
      [4, 5].forEach(i => s.to("c" + i, { stroke: "gold" }, { at: 0.2 })); [6, 7].forEach(i => s.to("c" + i, { stroke: "red" }, { at: 0.4 }));
      s.note("k0", { text: "normal", x: 860, y: 690, color: "soft", font: "math", size: 22 }, { at: 0.5 }); s.note("k1", { text: "edge", x: 1020, y: 690, color: "gold", font: "math", size: 22 }, { at: 0.6 }); s.note("k2", { text: "adversarial", x: 1180, y: 690, color: "red", font: "math", size: 22 }, { at: 0.7 });
    }},
    { sec: "درجة الأساس", say: "نشغّل الأمر الحالي عليها، فنحصل على درجة أساس.", do: s => {
      s.clear({ dur: 0.4 });
      s.bars("sc", [["prompt v1", 0.82, "dim", "82%  baseline"]], { x: 620, y: 420, w: 600, size: 30, h: 36 }, { at: 0.3 });
    }},
    { say: "وكل تعديل على الأمر نقارنه بهذه الدرجة.", eq: "@Delta = @T{score}(v_{2}) - @T{score}(v_{1})", do: s => {
      s.bars("v2", [["prompt v2", 0.91, "green", "91%  ✓ ship"]], { x: 620, y: 540, w: 600, size: 30, h: 36 }, { at: 0.3 });
      s.bars("v3", [["prompt v3", 0.78, "red", "78%  ✗ reject"]], { x: 620, y: 660, w: 600, size: 30, h: 36 }, { at: 0.8 });
    }},
    { say: "هكذا يصبح كل تغيير قرارًا مقيسًا، لا انطباعًا.", do: s => {
      s.pulse(["v20"], { color: "green" });
    }}
  ]);

  // ------------------------------------------------------------------ 3.2 Prompt writing
  X.lesson("3.2", [
    { sec: "الوضوح", say: "الأمر القوي واضح ومباشر: يقول ماذا تفعل، لا ماذا تتجنب فقط.", do: s => {
      s.code("bad", { x: 440, y: 520, size: 22, title: "vague", lines: ["Don't be rude.", "Don't make things up.", "Don't be too long."] }, { at: 0.2, dur: 1 });
      s.code("good", { x: 1160, y: 520, size: 22, title: "clear", lines: ["Reply in 3 short sentences.", "Use a warm, polite tone.", "Quote only the policy text."] }, { at: 0.8, dur: 1.2 });
      s.mark("m1", "bad", "x", { at: 1.2 }); s.mark("m2", "good", "check", { at: 2.1 });
    }},
    { sec: "الأمثلة", say: "والأمثلة توضّح الصيغة والنبرة بدقة أكبر من أي وصف.", eq: "@T{few-shot}: @; (x_1, y_1), @; (x_2, y_2) @; @to @; y", do: s => {
      s.clear({ dur: 0.4 });
      [0, 1].forEach(i => { s.box("ex" + i, { x: 440, y: 420 + i * 150, w: 300, h: 70, label: "ticket " + (i + 1), size: 24, color: "blue" }, { at: 0.3 + i * 0.3 }); s.box("ey" + i, { x: 1000, y: 420 + i * 150, w: 380, h: 70, label: "ideal reply " + (i + 1), size: 24, color: "green" }, { at: 0.4 + i * 0.3 }); s.link("el" + i, "ex" + i, "ey" + i, { color: "dim" }, { at: 0.5 + i * 0.3 }); });
      s.box("nx", { x: 440, y: 720, w: 300, h: 70, label: "new ticket", size: 24, color: "gold" }, { at: 1.2 });
      s.box("ny", { x: 1000, y: 720, w: 380, h: 70, label: "reply in the same style", size: 24, color: "gold", dash: "8 6" }, { at: 1.5 });
      s.link("nl", "nx", "ny", { color: "gold" }, { at: 1.4 });
    }},
    { sec: "الوسوم", say: "وافصل الأقسام بوسوم واضحة، مثل policy وticket.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("p", { x: 800, y: 520, size: 26, title: "prompt.xml", lines: ["<policy>{{refund_policy}}</policy>", "<ticket>{{customer_message}}</ticket>", "Draft a polite reply using ONLY the policy.", "If the policy does not cover the case, reply: ESCALATE."] }, { at: 0.3, dur: 2 });
    }},
    { say: "فيعرف النموذج أين التعليمات، وأين البيانات.", do: s => {
      s.to("p", { hl: 0 }, { at: 0.2, dur: 0.2 }); s.to("p", { hl: 1 }, { at: 1, dur: 0.2 }); s.to("p", { hl: 2 }, { at: 1.8, dur: 0.2 });
    }},
    { sec: "الخطة البديلة", say: "وأضف خطة بديلة: إن لم تغطِّ السياسة الحالة، حوّلها إلى موظف بشري.", do: s => {
      s.to("p", { hl: 3, y: 360, scale: 0.8 }, { dur: 0.6 });
      s.box("q", { x: 800, y: 580, w: 280, h: 70, label: "policy covers it?", size: 24, color: "gold" }, { at: 0.5 });
      s.box("yes", { x: 500, y: 760, w: 260, h: 64, label: "draft reply", size: 24, color: "green" }, { at: 0.9 });
      s.box("no", { x: 1100, y: 760, w: 300, h: 64, label: "ESCALATE → human", font: "mono", size: 22, color: "orange", icon: "user", inline: true }, { at: 1.1 });
      s.link("ly", "q", "yes", { color: "green", label: "yes" }, { at: 0.9 }); s.link("ln", "q", "no", { color: "orange", label: "no" }, { at: 1.1 });
    }},
    { say: "وهكذا يصبح الأمر قالبًا منظّمًا، لا فقرة عشوائية.", do: s => {
      s.clear({ dur: 0.4 });
      s.col("pt", ["role & goal", "clear instructions", "examples", "<policy> data </policy>", "<ticket> input </ticket>", "fallback: ESCALATE"], { x: 800, y: 540, size: 24, gap: 10, h: 54, w: 520, colors: ["purple", "blue", "green", "gold", "teal", "orange"] }, { at: 0.3, st: 0.15 });
    }}
  ]);

  // ------------------------------------------------------------------ 3.3 Context engineering
  X.lesson("3.3", [
    { sec: "طاولة العمليات", say: "نافذة السياق مثل طاولة عمليات: ضع عليها فقط ما تحتاجه هذه الخطوة.", do: s => {
      s.zone("tbl", { x: 800, y: 560, w: 640, h: 360, label: "context window", color: "teal" });
      const items = ["docs", "logs", "tools", "history", "emails", "specs", "tickets", "wiki"];
      items.forEach((t, i) => s.box("it" + i, { x: i < 4 ? 260 : 1340, y: 360 + (i % 4) * 120, w: 180, h: 70, label: t, size: 24, color: "dim" }, { at: 0.4 + i * 0.06 }));
    }},
    { say: "لكن السياق الأكثر ليس دائمًا أفضل، فالضوضاء تشتّت النموذج.", do: s => {
      [0, 1, 2, 3, 4, 5, 6, 7].forEach(i => s.to("it" + i, { x: 620 + (i % 4) * 120, y: 470 + Math.floor(i / 4) * 110, w: 110, scale: 0.9 }, { at: 0.2 + i * 0.05, dur: 0.7 }));
      s.bar("q", { x: 620, y: 800, w: 360, v: 0.8, color: "green", label: "quality", size: 26 }, { at: 0.3 });
      s.to("q", { v: 0.35, color: "red" }, { at: 1, dur: 1 });
    }},
    { sec: "الاختيار", say: "فاختر فقط ما تحتاجه الخطوة الحالية.", eq: "@min @; @T{tokens} @quad @T{s.t.} @; @T{task succeeds}", do: s => {
      [1, 4, 5, 6, 7].forEach((i, k) => s.to("it" + i, { x: i < 4 ? 260 : 1340, y: 360 + (i % 4) * 120, w: 180, scale: 1, opacity: 0.35 }, { at: 0.2 + k * 0.08, dur: 0.7 }));
      [0, 2, 3].forEach((i, k) => s.to("it" + i, { x: 680 + k * 120, y: 560, stroke: "teal" }, { at: 0.5, dur: 0.7 }));
      s.to("q", { v: 0.9, color: "green" }, { at: 1.2, dur: 1 });
    }},
    { sec: "الترتيب", say: "والترتيب مهم: التعليمات أولًا، ثم البيانات، ثم السؤال.", do: s => {
      s.clear({ dur: 0.4 });
      s.col("ord", ["1  instructions", "2  data & documents", "3  the question"], { x: 800, y: 540, size: 30, h: 76, gap: 18, w: 520, colors: ["purple", "gold", "teal"] }, { at: 0.3, st: 0.3 });
    }},
    { sec: "السجل", say: "ولخّص السجل القديم أو احذفه، بدل أن يتضخّم بلا نهاية.", do: s => {
      s.clear({ dur: 0.4 });
      for (let i = 0; i < 12; i++) s.box("h" + i, { x: 280 + i * 90, y: 520, w: 76, h: 60, r: 8, label: "", color: "blue" }, { at: 0.2 + i * 0.04 });
      s.box("sum", { x: 420, y: 700, w: 200, h: 64, label: "summary", size: 26, color: "green" }, { at: 1.2 });
      for (let i = 0; i < 9; i++) s.to("h" + i, { x: 420, y: 700, opacity: 0, scale: 0.4 }, { at: 1.3 + i * 0.04, dur: 0.6 });
    }},
    { say: "والهدف: أصغر مجموعة من الـ Tokens عالية القيمة، التي تحقق النتيجة.", eq: "@T{smallest set of high-signal tokens}", do: s => {
      s.to(["h9", "h10", "h11"], { x: (v, k) => 680 + k * 90, y: 700 }, { dur: 0.7 });
      s.zone("ctx", { x: 650, y: 700, w: 560, h: 130, label: "lean context", color: "teal" }, { at: 0.5 });
    }}
  ]);

  // ------------------------------------------------------------------ 3.4 Prompts as versioned assets
  X.lesson("3.4", [
    { sec: "الأمر كود", say: "الأمر ليس نصًا عابرًا، بل كود له إصدارات وسجل تغييرات.", do: s => {
      s.chain("v", ["v2.2", "v2.3", "v2.4"], { y: 520, gap: 120, colors: ["dim", "dim", "green"], icons: ["doc", "doc", "doc"], w: 180, h: 150, size: 28 }, { st: 0.3 });
      s.icon("git", { name: "branch", x: 800, y: 700, s: 64, color: "orange" }, { at: 1 });
    }},
    { sec: "القوالب", say: "والقالب يفصل التعليمات الثابتة عن المتغيرات.", eq: "@T{template}(@Y{policy}, @; @C{ticket}) @to @T{prompt}", do: s => {
      s.clear({ dur: 0.4 });
      s.box("tp", { x: 800, y: 460, w: 760, h: 110, label: "Reply using {{policy}} to {{ticket}}", font: "mono", size: 28, color: "blue" }, { at: 0.3 });
      s.box("p1", { x: 480, y: 680, w: 220, h: 60, label: "refund_policy", font: "mono", size: 22, color: "gold" }, { at: 0.8 }); s.box("p2", { x: 1120, y: 680, w: 220, h: 60, label: "customer msg", font: "mono", size: 22, color: "teal" }, { at: 1 });
      s.flow("p1", "tp", { color: "gold", at: 1.3 }); s.flow("p2", "tp", { color: "teal", at: 1.4 });
    }},
    { sec: "التسجيل", say: "وسجّل رقم إصدار الأمر مع كل طلب.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("lg", { x: 800, y: 520, size: 24, title: "requests.log", lines: ["{\"prompt_v\": \"support-reply-v2.4\", \"latency_ms\": 812}", "{\"prompt_v\": \"support-reply-v2.4\", \"latency_ms\": 640}", "{\"prompt_v\": \"support-reply-v2.4\", \"latency_ms\": 905}"] }, { at: 0.3, dur: 1.6 });
    }},
    { sec: "المقارنة", say: "وقبل الإطلاق، قارن الإصدارين على مجموعة التقييم نفسها.", eq: "@T{score}(v_{2.5}) @; @T{vs} @; @T{score}(v_{2.4})", do: s => {
      s.clear({ dur: 0.4 });
      s.bars("cmp", [["v2.4", 0.86, "teal", "86%"], ["v2.5", 0.79, "red", "79%"]], { x: 640, y: 520, w: 560, gap: 100, size: 30, h: 36 }, { at: 0.3 });
      s.note("same", { text: "same 120 eval cases", x: 920, y: 680, font: "math", color: "gold" }, { at: 0.8 });
    }},
    { sec: "التراجع", say: "واحتفظ بطريقة سريعة للتراجع عن أي إصدار سيئ.", do: s => {
      s.clear({ dur: 0.4 });
      s.box("reg", { x: 800, y: 380, w: 300, h: 90, label: "prompt registry", icon: "db", inline: true, size: 26, color: "blue" }, { at: 0.2 });
      s.box("bad", { x: 1100, y: 600, label: "v2.5 live", size: 26, color: "red", h: 64 }, { at: 0.4 });
      s.box("good", { x: 500, y: 600, label: "v2.4", size: 26, color: "green", h: 64 }, { at: 0.6 });
      s.link("rb", "bad", "good", { color: "green", bend: 0.25, label: "rollback in 1 click", lc: "green" }, { at: 1 });
    }},
    { sec: "الخلاصة", say: "إذن: إصدارات، وقوالب، وتسجيل، ومقارنة، وتراجع سريع. الأمر يُدار ككود تمامًا.", do: s => {
      s.clear({ dur: 0.4 });
      s.chain("sum", ["versions", "templates", "logging", "A/B on evals", "rollback"], { y: 520, gap: 40, colors: ["blue", "teal", "gold", "green", "orange"], h: 90, size: 24 }, { at: 0.3, st: 0.18 });
    }}
  ]);

  // ------------------------------------------------------------------ 4.1 LangChain fundamentals
  X.lesson("4.1", [
    { sec: "مشكلة المزوّدين", say: "كل مزوّد نماذج له SDK مختلف، وشكل رسائل مختلف.", do: s => {
      ["Provider A", "Provider B", "Provider C"].forEach((t, i) => s.box("pv" + i, { x: 440 + i * 360, y: 640, w: 260, h: 110, label: t, sub: ["messages[]", "contents[]", "prompt str"][i], color: ["purple", "blue", "orange"][i], size: 28 }, { at: 0.2 + i * 0.2 }));
    }},
    { say: "وLangChain يقدّم فوقها واجهة موحّدة للنماذج والرسائل والأدوات.", do: s => {
      s.box("lc", { x: 800, y: 420, w: 1000, h: 110, label: "one interface: chat models · messages · tools", icon: "layers", inline: true, color: "teal", size: 28 }, { at: 0.3, in: "draw" });
      [0, 1, 2].forEach(i => s.link("l" + i, "lc", "pv" + i, { color: "dim" }, { at: 0.8 + i * 0.1 }));
    }},
    { say: "فيصبح تغيير المزوّد تعديلًا في الإعدادات.", eq: "@T{model} = @T{init@_chat@_model}(@O{provider})", do: s => {
      s.dot("sel", { x: 440, y: 560, r: 12, color: "gold", halo: true }, { at: 0.2 });
      s.to("sel", { x: 800 }, { at: 0.6, dur: 0.7 }); s.to("sel", { x: 1160 }, { at: 1.5, dur: 0.7 });
    }},
    { sec: "ثمن التجريد", say: "لكن للتجريد ثمن: تتبّع الأخطاء أصعب، ودعم الميزات الجديدة قد يتأخر.", do: s => {
      s.clear({ dur: 0.4 });
      s.col("ly", ["your code", "LangChain", "provider SDK", "model API"], { x: 800, y: 520, size: 28, h: 70, gap: 12, w: 460, colors: ["teal", "blue", "purple", "dim"] }, { at: 0.3, st: 0.15 });
      s.icon("bug", { name: "bug", x: 1140, y: 560, s: 60, color: "red" }, { at: 1.2 });
    }},
    { sec: "متى؟", say: "استخدمه حين تحتاج منظومته، واستخدم الـ SDK المباشر حين لا تحتاجها.", do: s => {
      s.clear({ dur: 0.4 });
      s.versus("vs", "LangChain", "direct SDK", { colors: ["teal", "blue"] }, { at: 0.2 });
      s.col("a", ["many providers", "LangGraph, integrations", "shared tooling"], { x: 435, y: 560, size: 26, w: 420, colors: ["teal", "teal", "teal"] }, { at: 0.5, st: 0.15 });
      s.col("b", ["one provider", "newest features first", "simple stack"], { x: 1165, y: 560, size: 26, w: 420, colors: ["blue", "blue", "blue"] }, { at: 0.8, st: 0.15 });
    }},
    { sec: "مثال", say: "ومثال على ذلك: تبديل المزوّد يصبح تغيير نص واحد في الإعدادات.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("cd", { x: 800, y: 520, size: 26, title: "model.py", lines: ["from langchain.chat_models import init_chat_model", "llm = init_chat_model(\"anthropic:claude-sonnet-4-5\")", "# llm = init_chat_model(\"openai:gpt-4.1\")"] }, { at: 0.3, dur: 1.6 });
      s.to("cd", { hl: 1 }, { at: 2.1, dur: 0.2 });
    }}
  ]);

  // ------------------------------------------------------------------ 4.2 LangChain composition
  X.lesson("4.2", [
    { sec: "السلسلة", say: "في LangChain نركّب الخطوات في سلسلة: أمر، ثم نموذج، ثم محلّل.", eq: "@T{chain} = @T{prompt} @mid @T{llm} @mid @T{parser}", do: s => {
      s.chain("c", ["prompt", "llm", "parser"], { y: 520, gap: 120, colors: ["blue", "purple", "teal"], icons: ["doc", "brain", "filter"], w: 200, h: 150, size: 28 }, { st: 0.3 });
      s.flow("c0", "c1", { color: "blue", at: 1.2 }); s.flow("c1", "c2", { color: "purple", at: 1.8 });
    }},
    { sec: "مخرجات مهيكلة", say: "وwith_structured_output يعيد كائنًا متحقَّقًا منه مباشرة.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("cd", { x: 620, y: 520, size: 24, title: "chain.py", lines: ["class Ticket(BaseModel):", "    category: Literal[\"refund\", \"shipping\", \"other\"]", "    urgent: bool", "", "chain = prompt | llm.with_structured_output(Ticket)"] }, { at: 0.3, dur: 1.8 });
      s.box("obj", { x: 1300, y: 520, w: 280, h: 120, label: "Ticket(…)", sub: "typed & validated", font: "mono", size: 26, color: "green" }, { at: 2.2 });
      s.to("cd", { hl: 4 }, { at: 2.1, dur: 0.2 });
    }},
    { sec: "الأدوات", say: "وbind_tools يربط مخططات الأدوات بالنموذج.", do: s => {
      s.clear({ dur: 0.4 });
      s.box("llm", { x: 640, y: 520, w: 240, h: 150, label: "llm", icon: "brain", color: "purple", size: 28 }, { at: 0.3 });
      ["get_order", "search_docs", "refund"].forEach((t, i) => { s.box("t" + i, { x: 1120, y: 380 + i * 140, w: 260, h: 70, label: t, font: "mono", size: 24, color: "orange" }, { at: 0.5 + i * 0.15 }); s.link("tl" + i, "llm", "t" + i, { color: "orange", head: false, dash: "6 6" }, { at: 0.6 + i * 0.15 }); });
      s.note("bt", { text: "llm.bind_tools([...])", x: 640, y: 680, font: "mono", size: 24, color: "orange" }, { at: 1 });
    }},
    { sec: "التتبع", say: "والتتبع يعرض مدخلات كل خطوة ومخرجاتها وزمنها والـ Tokens.", do: s => {
      s.clear({ dur: 0.4 });
      [["prompt", 0.02, "blue", "2 ms"], ["llm", 0.82, "purple", "820 ms · 512 tokens"], ["parser", 0.01, "teal", "1 ms"]].forEach(([l, v, c, t], i) => s.bar("tr" + i, { x: 520, y: 430 + i * 90, w: 760, v: Math.max(0.02, v), color: c, label: l, val: t, size: 28, h: 34 }, { at: 0.3 + i * 0.2 }));
      s.note("tt", { text: "trace", x: 900, y: 340, font: "math", color: "gold", size: 30 }, { at: 0.2 });
    }},
    { sec: "الخلاصة", say: "إذن: سلسلة قابلة لإعادة الاستخدام، ومخرجات متحقَّق منها، وأدوات مربوطة، وتتبّع لكل خطوة.", do: s => {
      s.clear({ dur: 0.4 });
      s.grid("sum", ["prompt | llm | parser", "with_structured_output", "bind_tools", "tracing"], { cols: 4, y: 520, cw: 300, ch: 130, size: 22, font: "mono", colors: ["blue", "green", "orange", "gold"] }, { at: 0.3, st: 0.15 });
    }}
  ]);

  // ------------------------------------------------------------------ A2.1 Context as a finite attention budget
  X.lesson("A2.1", [
    { sec: "ميزانية الانتباه", say: "السياق مورد محدود، وانتباه النموذج ميزانية تتوزّع على كل Token.", eq: "@sum_i a_i = 1", do: s => {
      for (let i = 0; i < 6; i++) { s.box("t" + i, { x: 450 + i * 140, y: 640, w: 110, h: 56, label: "tok", size: 22, color: "soft" }, { at: 0.2 + i * 0.05 }); s.box("a" + i, { x: 450 + i * 140, y: 600 - 90, w: 60, h: 180, r: 6, label: "", color: "gold", fill: "#3a2f12" }, { at: 0.5 + i * 0.05, in: "grow" }); }
    }},
    { say: "وكلما زادت الـ Tokens، قلّ نصيب كل واحد منها.", do: s => {
      s.out(["t*", "a*"], { dur: 0.4 });
      for (let i = 0; i < 18; i++) { s.box("u" + i, { x: 290 + i * 60, y: 640, w: 48, h: 40, r: 6, label: "", color: "soft" }, { at: 0.3 + i * 0.02 }); s.box("b" + i, { x: 290 + i * 60, y: 600, w: 30, h: 60, r: 4, label: "", color: "gold", fill: "#3a2f12" }, { at: 0.6 + i * 0.02, in: "grow" }); }
    }},
    { say: "فكل Token إضافي ينافس على الانتباه، والعائد يتناقص.", do: s => {
      s.clear({ dur: 0.4 });
      s.line("ax", { x1: 400, y1: 760, x2: 1240, y2: 760, color: "soft" }, { at: 0.2 }); s.line("ay", { x1: 400, y1: 760, x2: 400, y2: 330, color: "soft" }, { at: 0.2 });
      s.note("xl", { text: "tokens in context", x: 820, y: 805, font: "math" }, { at: 0.3 }); s.note("yl", { text: "useful attention", x: 400, y: 300, font: "math" }, { at: 0.3 });
      s.path("cv", { d: "M400 740 C 520 420, 640 380, 820 370 S 1100 380, 1240 400", color: "gold", w: 5 }, { at: 0.5, dur: 1.5 });
    }},
    { sec: "في التطبيق", say: "اكتب التعليمات بالمستوى المناسب: لا غامضة جدًا، ولا مفصّلة بإفراط.", do: s => {
      s.clear({ dur: 0.4 });
      s.bar("sl", { x: 400, y: 540, w: 800, v: 1, color: "grid", label: "", track: false, h: 10 }, { at: 0.2 });
      s.note("l1", { text: "too vague", x: 400, y: 600, color: "red", font: "math" }, { at: 0.3 }); s.note("l2", { text: "over-specified", x: 1200, y: 600, color: "red", font: "math" }, { at: 0.3 });
      s.dot("k", { x: 400, y: 540, r: 16, color: "gold", halo: true }, { at: 0.4 });
      s.to("k", { x: 1200 }, { at: 0.6, dur: 0.9 }); s.to("k", { x: 800, color: "green" }, { at: 1.6, dur: 0.9 });
      s.note("l3", { text: "right altitude", x: 800, y: 480, color: "green", font: "math", size: 28 }, { at: 2.3 });
    }},
    { say: "واجعل مجموعة الأدوات صغيرة وغير متداخلة.", do: s => {
      s.clear({ dur: 0.4 });
      for (let i = 0; i < 12; i++) s.box("tl" + i, { x: 440 + (i % 4) * 100 + (i % 3) * 14, y: 440 + Math.floor(i / 4) * 80, w: 120, h: 50, label: "tool", size: 20, color: "dim" }, { at: 0.2 + i * 0.03 });
      ["search", "read", "write", "run"].forEach((t, i) => s.box("g" + i, { x: 1150, y: 380 + i * 90, w: 180, h: 60, label: t, size: 24, color: "orange" }, { at: 1.2 + i * 0.15 }));
      s.mark("bx", "tl1", "x", { at: 0.9 });
    }},
    { say: "واستخدم أمثلة قليلة نموذجية، بدل قوائم قواعد طويلة.", do: s => {
      s.clear({ dur: 0.4 });
      s.doc("rules", { x: 480, y: 540, w: 220, h: 300, lines: 12, title: "40 rules", color: "dim" }, { at: 0.2 });
      s.box("e1", { x: 1100, y: 470, w: 300, h: 70, label: "example 1", size: 26, color: "green" }, { at: 0.7 }); s.box("e2", { x: 1100, y: 600, w: 300, h: 70, label: "example 2", size: 26, color: "green" }, { at: 0.9 });
    }},
    { sec: "قِس", say: "ثم قِس: هل حذف قسم معيّن يغيّر الجودة؟", eq: "@Delta @T{quality}( @T{prompt} - @T{section} )", do: s => {
      s.clear({ dur: 0.4 });
      s.bars("ab", [["full prompt", 0.86, "teal", "86%"], ["− examples", 0.71, "red", "71%  keep it"], ["− rules list", 0.87, "green", "87%  drop it"]], { x: 640, y: 540, w: 560, gap: 100, size: 30, h: 34 }, { at: 0.3 });
    }}
  ]);

  // ------------------------------------------------------------------ A2.2 Just-in-time context, compaction, notes
  X.lesson("A2.2", [
    { sec: "عند الحاجة", say: "في المهام الطويلة، لا يحمّل الوكيل كل شيء مسبقًا.", do: s => {
      for (let i = 0; i < 20; i++) s.doc("f" + i, { x: 300 + (i % 10) * 100, y: 420 + Math.floor(i / 10) * 130, w: 64, h: 82, lines: 3, color: "dim" }, { at: 0.2 + i * 0.02 });
      s.zone("ctx", { x: 1050, y: 760, w: 600, h: 120, label: "context", color: "teal" }, { at: 0.6 });
    }},
    { say: "بل يحتفظ بمراجع خفيفة، مثل مسارات الملفات، ويجلب المحتوى عند الحاجة.", do: s => {
      s.box("ref", { x: 500, y: 760, w: 360, h: 90, label: "src/billing.py\nsrc/orders.py", font: "mono", size: 22, color: "gold" }, { at: 0.2 });
      s.to("f13", { x: 1050, y: 760, stroke: "teal" }, { at: 0.8, dur: 0.9 });
      s.pulse("f13", { at: 1.7 });
    }},
    { sec: "الضغط", say: "وعندما يمتلئ السياق، يلخّص المحادثة، ويبدأ من جديد بالملخص.", eq: "@T{context} @to @T{summary} @to @T{fresh context}", do: s => {
      s.clear({ dur: 0.4 });
      s.box("full", { x: 800, y: 460, w: 900, h: 90, label: "context 95% full", size: 28, color: "red", fill: "#2a1416" }, { at: 0.3 });
      s.box("sm", { x: 800, y: 640, w: 260, h: 70, label: "summary", size: 28, color: "green" }, { at: 1 });
      s.to("full", { w: 260, y: 640, opacity: 0 }, { at: 1, dur: 0.8 });
      s.box("fresh", { x: 800, y: 640, w: 900, h: 90, label: "", color: "teal", fop: 0.2 }, { at: 1.8 });
      s.to("sm", { x: 470, w: 220 }, { at: 1.8, dur: 0.6 });
    }},
    { sec: "الملاحظات", say: "ويكتب ملاحظات منظّمة خارج السياق، مثل قائمة مهام أو ملف تقدّم.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("notes", { x: 800, y: 520, size: 26, title: "progress.md", lines: ["- [x] read billing module", "- [x] fix rounding bug", "- [ ] add regression test", "- [ ] update changelog"] }, { at: 0.3, dur: 1.6 });
    }},
    { say: "فتبقى هذه الملاحظات حتى بعد إعادة التشغيل.", do: s => {
      s.icon("rs", { name: "refresh", x: 1250, y: 520, s: 80, color: "orange" }, { at: 0.2 });
      s.to("rs", { rot: 360 }, { at: 0.4, dur: 1 });
      s.pulse("notes", { at: 1.2, color: "green" });
    }},
    { sec: "الوكلاء الفرعيون", say: "ويمكن لوكيل فرعي أن يستكشف بعمق، ويعيد خلاصة قصيرة فقط.", do: s => {
      s.clear({ dur: 0.4 });
      s.box("main", { x: 420, y: 520, w: 240, h: 130, label: "main agent", icon: "bot", color: "purple", size: 26 }, { at: 0.2 });
      s.box("sub", { x: 1100, y: 520, w: 240, h: 130, label: "subagent", icon: "search", color: "blue", size: 26 }, { at: 0.4 });
      s.zone("deep", { x: 1100, y: 560, w: 520, h: 520, label: "explores 40 files", color: "blue" }, { at: 0.6 });
      s.box("res", { x: 760, y: 700, label: "3-line finding", size: 24, color: "gold", h: 56 }, { at: 1.4 });
      s.flow("sub", "main", { color: "gold", at: 1.2 });
    }}
  ]);

  // ------------------------------------------------------------------ A2.3 Prompt caching & cost control
  X.lesson("A2.3", [
    { sec: "البداية المشتركة", say: "طلبات كثيرة تشترك في بداية طويلة: تعليمات النظام والمستندات.", do: s => {
      for (let i = 0; i < 3; i++) { s.box("pf" + i, { x: 650, y: 400 + i * 120, w: 760, h: 80, label: "system + policy docs (20K tokens)", size: 24, color: "purple", fill: "#241a38" }, { at: 0.2 + i * 0.2 }); s.box("q" + i, { x: 1150, y: 400 + i * 120, w: 200, h: 80, label: "question " + (i + 1), size: 22, color: "teal" }, { at: 0.3 + i * 0.2 }); }
    }},
    { say: "والتخزين المؤقت يعيد استخدام هذه البداية، بدل معالجتها كل مرة.", do: s => {
      s.to(["pf1", "pf2"], { stroke: "green", fill: "#11261a", label: "cached prefix ✓" }, { at: 0.4, dur: 0.6, st: 0.2 });
      s.icon("bz", { name: "bolt", x: 220, y: 520, s: 70, color: "green" }, { at: 0.3 });
    }},
    { say: "فتنخفض التكلفة حتى تسعين بالمئة، ويقل زمن الرد الأول كثيرًا.", eq: "@T{cost}_{@T{cached}} @approx 0.1 @times @T{cost}_{@T{normal}}", do: s => {
      s.clear({ dur: 0.4 });
      s.bars("c", [["cost · no cache", 0.9, "red", "$0.060"], ["cost · cached", 0.1, "green", "$0.006"], ["first token · no cache", 0.7, "red", "3.1 s"], ["first token · cached", 0.2, "green", "0.9 s"]], { x: 720, y: 540, w: 520, gap: 80, size: 26, h: 30 }, { at: 0.3 });
    }},
    { sec: "الترتيب", say: "لذلك ضع المحتوى الثابت أولًا، والمتغير في النهاية.", do: s => {
      s.clear({ dur: 0.4 });
      s.box("g1", { x: 620, y: 440, w: 560, h: 76, label: "static: system + docs", size: 26, color: "green" }, { at: 0.3 }); s.box("g2", { x: 1060, y: 440, w: 260, h: 76, label: "user question", size: 24, color: "teal" }, { at: 0.4 });
      s.mark("gc", "g1", "check", { at: 0.8 });
      s.box("b1", { x: 460, y: 640, w: 260, h: 76, label: "timestamp", size: 24, color: "red" }, { at: 1 }); s.box("b2", { x: 900, y: 640, w: 560, h: 76, label: "static: system + docs", size: 26, color: "dim" }, { at: 1.1 });
      s.note("bn", { text: "a changing first token breaks the cache", x: 800, y: 740, color: "red", font: "math", size: 26 }, { at: 1.5 });
    }},
    { sec: "المتابعة", say: "وتابع الـ Tokens المخزّنة وغير المخزّنة في سجلات الاستهلاك.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("u", { x: 800, y: 520, size: 26, title: "usage", lines: ["input_tokens: 412", "cache_creation_input_tokens: 0", "cache_read_input_tokens: 20480", "output_tokens: 180"] }, { at: 0.3, dur: 1.4 });
      s.to("u", { hl: 2 }, { at: 1.9, dur: 0.2 });
    }},
    { sec: "ضوابط أخرى", say: "واجمعه مع حدٍّ لـ max_tokens لكل ميزة، وتوجيه الطلبات البسيطة إلى نماذج أرخص.", do: s => {
      s.clear({ dur: 0.4 });
      s.col("ct", ["prompt caching", "max_tokens per feature", "route simple → cheaper model"], { x: 800, y: 540, size: 30, icons: ["bolt", "gauge", "route"], colors: ["green", "gold", "blue"], w: 600 }, { at: 0.3, st: 0.25 });
    }}
  ]);

  // ------------------------------------------------------------------ A2.4 Official prompt engineering guide
  X.lesson("A2.4", [
    { sec: "ابدأ بالقياس", say: "دليل هندسة الأوامر يبدأ بمعايير النجاح والاختبارات، لا بالحيل.", do: s => {
      s.chain("st", ["success criteria", "test cases", "baseline"], { y: 520, gap: 90, colors: ["gold", "blue", "dim"], w: 280, h: 90, size: 28 }, { st: 0.3 });
    }},
    { sec: "تقنية بعد تقنية", say: "ثم تطبّق التقنيات واحدة تلو الأخرى، وتقيس أثر كل منها.", do: s => {
      s.clear({ dur: 0.4 });
      const T = ["clear & direct", "examples", "XML tags", "room to think", "prompt chaining"];
      T.forEach((t, i) => s.bar("t" + i, { x: 620, y: 360 + i * 95, w: 560, v: 0.5 + i * 0.08, color: "teal", label: t, size: 28, h: 32, val: Math.round((0.5 + i * 0.08) * 100) + "%" }, { at: 0.3 + i * 0.3 }));
      s.to("t*", { opacity: 0.3 }, { at: 2.0, dur: 0.4 });
    }},
    { say: "كن واضحًا ومباشرًا، وأعطِ سياقًا عن الهدف.", do: s => { s.to("t0", { opacity: 1, color: "gold" }, { dur: 0.4 }); s.pulse("t0", { at: 0.4 }); } },
    { say: "واستخدم أمثلة متعددة، ووسوم XML لتنظيم الأقسام.", do: s => { s.to(["t1", "t2"], { opacity: 1, color: "gold" }, { dur: 0.4, st: 0.3 }); } },
    { say: "وامنح النموذج مساحة للتفكير في المهام المعقدة.", do: s => { s.to("t3", { opacity: 1, color: "gold" }, { dur: 0.4 }); } },
    { say: "واربط أوامر متتالية للمهام متعددة الخطوات، بدل أمر عملاق واحد.", do: s => {
      s.to("t4", { opacity: 1, color: "gold" }, { dur: 0.4 });
      s.to("t*", { opacity: 0.2 }, { at: 1, dur: 0.4 });
      s.box("giant", { x: 800, y: 470, w: 700, h: 90, label: "one giant prompt", size: 28, color: "red" }, { at: 1.2 });
      s.chain("small", ["research", "outline", "draft", "review"], { y: 680, gap: 50, colors: ["blue", "blue", "blue", "green"], h: 70, size: 26 }, { at: 1.8, st: 0.15 });
    }},
    { say: "وبعد كل تقنية: قِس، ولا تفترض.", eq: "@T{technique} @to @T{measure} @to @T{keep or drop}", do: s => {
      s.clear({ dur: 0.4 });
      s.ring("lp", { x: 800, y: 540, r: 160, color: "teal", arrows: 3 }, { at: 0.3 });
      ["try", "measure", "keep / drop"].forEach((t, i) => { const a = (-90 + i * 120) * Math.PI / 180; s.box("n" + i, { x: 800 + Math.cos(a) * 160, y: 540 + Math.sin(a) * 160, label: t, size: 26, h: 56, color: "teal", fill: "bg" }, { at: 0.5 + i * 0.2 }); });
    }}
  ]);

  // ------------------------------------------------------------------ A2.5 Multimodal & voice
  X.lesson("A2.5", [
    { sec: "الرؤية", say: "النماذج الحديثة ترى المستندات مباشرة: فاتورة كصورة، أو ملف PDF.", do: s => {
      s.doc("inv", { x: 420, y: 540, w: 260, h: 340, lines: 8, title: "invoice.png" });
      s.box("vm", { x: 820, y: 540, w: 220, h: 150, label: "vision model", icon: "eye", color: "teal", size: 26 }, { at: 0.6 });
      s.link("l1", "inv", "vm", { color: "dim" }, { at: 0.9 });
    }},
    { say: "ومع مخطط JSON صارم، تستخرج منها حقولًا مهيكلة.", do: s => {
      s.code("js", { x: 1260, y: 540, size: 24, title: "extracted.json", lines: ["{", "  \"vendor\": \"Acme Ltd\",", "  \"date\": \"2026-06-30\",", "  \"total\": 1240.00", "}"] }, { at: 0.3, dur: 1.4 });
      s.link("l2", "vm", "js", { color: "teal" }, { at: 0.2 });
    }},
    { say: "صغّر الصور واضغطها قبل الرفع، فالصور الضخمة تهدر الـ Tokens.", do: s => {
      s.to("inv", { w: 160, h: 210 }, { at: 0.3, dur: 0.9 });
      s.num("tk", { v: 6400, x: 420, y: 800, size: 34, color: "orange", suf: " tokens" }, { at: 0.2 });
      s.to("tk", { v: 1600, color: "green" }, { at: 0.4, dur: 1 });
    }},
    { say: "وتحقّق برمجيًا من الأرقام والتواريخ المستخرجة.", eq: "@sum @T{line items} @overset{?}{=} @T{total}", do: s => {
      s.to("js", { hl: 3 }, { dur: 0.2 });
      s.box("chk", { x: 1260, y: 770, label: "sum(items) == total ✓", font: "mono", size: 22, color: "green", h: 54 }, { at: 0.5 });
    }},
    { sec: "الصوت", say: "وفي الصوت مساران. الأول: تحويل الكلام إلى نص، ثم نموذج، ثم نطق.", eq: "@T{STT} @to @T{LLM} @to @T{TTS}", do: s => {
      s.clear({ dur: 0.4 });
      s.chain("p", ["speech → text", "LLM", "text → speech"], { y: 430, gap: 90, icons: ["mic", "brain", "speaker"], colors: ["blue", "purple", "blue"], w: 230, h: 140, size: 24 }, { at: 0.3, st: 0.25 });
    }},
    { say: "مرن وسهل التحكم، لكنه أبطأ، كسباق تتابع.", do: s => {
      [["STT", 0.25, "blue"], ["LLM", 0.4, "purple"], ["TTS", 0.25, "blue"]].reduce((x, [l, v, c], i) => { s.box("lat" + i, { x: x + v * 400, y: 640, w: v * 800 - 6, h: 40, r: 6, label: l, size: 20, color: c }, { at: 0.3 + i * 0.3, in: "grow" }); return x + v * 800; }, 400);
      s.note("lt", { text: "≈ 1.5–3 s", x: 800, y: 700, font: "math", color: "orange", size: 28 }, { at: 1.3 });
    }},
    { say: "والثاني: نموذج صوتي فوري، يسمع ويتكلم مباشرة، بأقل زمن استجابة.", do: s => {
      s.box("rt", { x: 800, y: 790, w: 420, h: 70, label: "realtime speech model", icon: "wave", inline: true, color: "green", size: 24 }, { at: 0.3 });
      s.note("rtl", { text: "≈ 0.3–0.8 s", x: 1150, y: 790, font: "math", color: "green", size: 28 }, { at: 0.8 });
    }}
  ]);

  // ------------------------------------------------------------------ A2.6 Fine-tuning, distillation & LoRA
  X.lesson("A2.6", [
    { sec: "متى؟", say: "عندما تصل هندسة الأوامر وRAG إلى سقفهما، يأتي دور الضبط الدقيق.", do: s => {
      s.line("ax", { x1: 400, y1: 760, x2: 1240, y2: 760, color: "soft" }); s.line("ay", { x1: 400, y1: 760, x2: 400, y2: 320, color: "soft" });
      s.path("cv", { d: "M400 720 C 560 520, 700 470, 900 460 L 1080 458", color: "teal", w: 5 }, { at: 0.3, dur: 1.2 });
      s.path("ft", { d: "M1080 458 L 1240 360", color: "orange", w: 5, dash: "10 8" }, { at: 1.5, dur: 0.8 });
      s.note("pl", { text: "prompting + RAG ceiling", x: 820, y: 420, font: "math", color: "teal" }, { at: 1 }); s.note("fl", { text: "fine-tuning", x: 1200, y: 320, font: "math", color: "orange" }, { at: 1.8 });
    }},
    { sec: "التقطير", say: "التقطير: نموذج قوي يولّد ويراجع بيانات تدريب لنموذج صغير وسريع.", eq: "@P{teacher} @to @T{data} @to @C{student}", do: s => {
      s.clear({ dur: 0.4 });
      s.box("tc", { x: 380, y: 520, w: 260, h: 180, label: "teacher", sub: "large model", icon: "brain", color: "purple", size: 30 }, { at: 0.3 });
      s.doc("ds", { x: 800, y: 520, w: 150, h: 190, lines: 7, title: "train.jsonl", color: "gold" }, { at: 0.7 });
      s.box("st", { x: 1220, y: 520, w: 200, h: 140, label: "student", sub: "small model", icon: "bolt", color: "teal", size: 28 }, { at: 1.1 });
      s.flow("tc", "ds", { color: "purple", n: 3, gap: 0.15, at: 0.9 }); s.flow("ds", "st", { color: "gold", n: 3, gap: 0.15, at: 1.5 });
    }},
    { say: "فيتعلّم الصغير أن يحاكي الكبير في مهمة محددة، بتكلفة أقل بكثير.", do: s => {
      s.bars("cmp", [["teacher cost", 0.9, "purple", "$$$"], ["student cost", 0.12, "teal", "$"]], { x: 640, y: 770, w: 420, gap: 50, size: 24, h: 24 }, { at: 0.3 });
    }},
    { sec: "LoRA", say: "وLoRA لا يعدّل كل الأوزان، بل يدرّب مصفوفتين صغيرتين بجانبها.", eq: "W' = @M{W} + @O{B} @, @O{A}", do: s => {
      s.clear({ dur: 0.4 });
      s.box("W", { x: 560, y: 540, w: 360, h: 360, label: "W  (frozen)", size: 34, color: "dim", fill: "panel" }, { at: 0.3 });
      s.text("pl", { text: "+", x: 830, y: 540, size: 60, color: "soft" }, { at: 0.7 });
      s.box("B", { x: 960, y: 540, w: 50, h: 360, label: "B", size: 30, color: "orange" }, { at: 0.9 });
      s.box("A", { x: 1170, y: 400, w: 360, h: 50, label: "A", size: 30, color: "orange" }, { at: 1.1 });
      s.icon("lk", { name: "lock", x: 560, y: 760, s: 46, color: "dim" }, { at: 0.6 });
    }},
    { say: "أقل من واحد بالمئة من الأوزان، فتنخفض تكلفة الـ GPU بشدة.", do: s => {
      s.num("pc", { v: 100, x: 1170, y: 640, size: 46, color: "orange", dec: 1, suf: "% trainable" }, { at: 0.2 });
      s.to("pc", { v: 0.5 }, { at: 0.4, dur: 1.4 });
    }},
    { sec: "البيانات", say: "وجودة البيانات أهم بكثير من حجمها.", do: s => {
      s.clear({ dur: 0.4 });
      s.bars("dq", [["500 clean, reviewed examples", 0.88, "green", "88%"], ["50,000 noisy examples", 0.7, "red", "70%"]], { x: 760, y: 540, w: 480, gap: 110, size: 28, h: 34 }, { at: 0.3 });
    }},
    { say: "وقارن النموذج المضبوط دائمًا مع أساس هندسة الأوامر، على مجموعة تقييم محجوزة.", eq: "@T{fine-tuned} @; @T{vs} @; @T{prompt baseline} @; @T{on held-out evals}", do: s => {
      s.clear({ dur: 0.4 });
      s.bars("cmp2", [["prompt baseline", 0.84, "teal", "84%"], ["fine-tuned small", 0.9, "orange", "90% · 6× cheaper"]], { x: 700, y: 540, w: 520, gap: 110, size: 28, h: 34 }, { at: 0.3 });
    }}
  ]);
})();
