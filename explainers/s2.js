// Motion explainers — Stage 2: model APIs, structured outputs, tools, prompting, context, LangChain, caching, multimodal, fine-tuning
(function () {
  const X = window.Explainer;

  // ------------------------------------------------------------------ 2.1 Model APIs: your first integration
  X.lesson("2.1", [
    { sec: "أول تكامل", say: "أول تكامل مع Model API بسيط في جوهره: تطبيقك يرسل قائمة رسائل، ويستقبل ردًا.", eq: "@T{response} = @T{API}(@T{messages})", do: s => {
      s.chain("c", ["Your App", "Model API", "Response"], { y: 515, gap: 145, icons: ["code", "cloud", "chat"], colors: ["teal", "blue", "green"], w: 230, h: 165, size: 26, pulse: true }, { at: "0%", st: 0.24 });
      s.stream("c0", "c1", { at: "48%", span: 1.8, every: 0.5, color: "teal" });
      s.stream("c1", "c2", { at: "62%", span: 1.8, every: 0.5, color: "green" });
    }},
    { say: "المفاجأة الأولى للمبتدئ: إذا أرسلت سؤالًا ثانيًا وحده، ينسى النموذج كل ما قيل قبل لحظة!", do: s => {
      s.clear({ dur: 0.4 });
      s.bubble("u1", { text: "Call 1 · user: Where is order #812?", side: "u", x: 470, y: 345, w: 460, size: 23 }, { at: "8%" });
      s.bubble("a1", { text: "assistant: Order #812 shipped yesterday.", side: "a", x: 1100, y: 415, w: 470, size: 23, color: "green" }, { at: "28%" });
      s.line("sep", { x1: 240, y1: 520, x2: 1360, y2: 520, color: "faint", dash: "8 8", w: 2.5 }, { at: "46%" });
      s.bubble("u2", { text: "Call 2 · user: When will it arrive?", side: "u", x: 470, y: 635, w: 460, size: 23 }, { at: "54%" });
      s.bubble("a2", { text: "assistant: Which order do you mean?", side: "a", x: 1100, y: 710, w: 470, size: 23, color: "red" }, { at: "74%" });
      s.mark("ax", "a2", "x", { at: "84%" });
    }},
    { sec: "الأدوار والحالة", say: "داخل الطلب، تحمل كل رسالة دورًا محددًا: system للتعليمات، ثم user، ثم assistant.", eq: "@P{system} @; @to @; @B{user} @; @to @; @G{assistant}", do: s => {
      s.clear({ dur: 0.4 });
      s.bubble("sy", { text: "system: You are a polite support assistant.", side: "s", x: 800, y: 340, w: 660, size: 25 }, { at: "10%" });
      s.bubble("us", { text: "user: Where is my refund for order #812?", side: "u", x: 960, y: 505, w: 500, size: 25 }, { at: "38%" });
      s.bubble("as", { text: "assistant: Checking refund #812 right now.", side: "a", x: 640, y: 675, w: 510, size: 25, color: "teal" }, { at: "64%" });
      s.pulse(["sy", "us", "as"], { at: "78%", st: 0.12 });
    }},
    { say: "ولأن الـ API بلا حالة Stateless، يجب أن تُعيد إرسال سجل المحادثة كاملًا في كل استدعاء جديد.", eq: "@T{messages}_{n} = @T{history} + @B{new}", do: s => {
      s.to(["sy", "us", "as"], { scale: 0.78, x: v => v - 260, y: v => v - 35 }, { at: "0%", dur: 0.65 });
      s.zone("call", { x: 540, y: 475, w: 720, h: 430, label: "Call #2 payload (stateless)", color: "blue" }, { at: "26%" });
      s.bubble("u2", { text: "user: And when will it arrive?", side: "u", x: 540, y: 775, w: 460, size: 23 }, { at: "44%" });
      s.box("api", { x: 1270, y: 530, w: 220, h: 150, label: "Model API", icon: "cloud", color: "blue", size: 26 }, { at: "52%" });
      s.link("la", "call", "api", { color: "blue", label: "full history", lc: "blue", pulse: true }, { at: "60%" });
      s.stream("call", "api", { at: "66%", span: 1.8, every: 0.5, color: "blue" });
    }},
    { sec: "البث والاستجابة", say: "مع البث Streaming تظهر الـ Tokens فور توليدها، فينخفض زمن أول حرف من 6 ثوانٍ إلى لحظات.", eq: "@T{TTFT}: @; @R{6.0 s} @to @G{0.4 s}", do: s => {
      s.clear({ dur: 0.4 });
      s.versus("vs", "No Streaming", "Streaming (SSE)", { colors: ["dim", "green"], y: 545, h: 520 }, { at: "8%" });
      s.icon("sp", { name: "hourglass", x: 440, y: 515, s: 92, color: "dim" }, { at: "24%" });
      s.badge("wt", { text: "frozen 6.0 s… then dump", x: 440, y: 650, color: "red", size: 22 }, { at: "40%" });
      s.bubble("st", { text: "Your refund for order #812 was approved and arrives in 3 business days.", side: "a", x: 1160, y: 515, w: 500, size: 24, color: "green" }, { at: "30%", in: "type", dur: 2.2 });
      s.badge("ft", { text: "first token in 0.4 s ✓", x: 1160, y: 660, color: "green", size: 22 }, { at: "74%" });
    }},
    { say: "ويمكن للطلب أن يحمل وسائط أيضًا: نصًا وصورة أو ملف PDF داخل الرسالة نفسها.", do: s => {
      s.clear({ dur: 0.4 });
      s.zone("msg", { x: 540, y: 525, w: 540, h: 420, label: "user message content[]", color: "teal" }, { at: "8%" });
      s.box("p1", { x: 540, y: 445, w: 400, h: 86, label: "text: \"Check this receipt\"", icon: "chat", inline: true, color: "blue", size: 22 }, { at: "24%" });
      s.box("p2", { x: 540, y: 605, w: 400, h: 86, label: "image: receipt_812.jpg", icon: "image", inline: true, color: "gold", size: 22 }, { at: "42%" });
      s.box("api", { x: 1190, y: 525, w: 250, h: 155, label: "Multimodal\nAPI", icon: "eye", color: "purple", size: 25 }, { at: "56%" });
      s.link("lm", "msg", "api", { color: "teal", pulse: true }, { at: "64%" });
      s.stream("msg", "api", { at: "70%", span: 1.6, every: 0.5, color: "gold" });
    }},
    { sec: "في الكود", say: "هكذا نكتب أول استدعاء في Python: نحدد النموذج، وmax_tokens، وsystem، وقائمة الرسائل.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("py", { x: 800, y: 515, size: 23, title: "first_call.py", lines: [
        "resp = client.messages.create(",
        "    model=MODEL, max_tokens=500,",
        "    system=\"You are a helpful support assistant.\",",
        "    messages=history + [{\"role\": \"user\", \"content\": q}]",
        ")",
        "print(resp.stop_reason, resp.usage)"
      ] }, { at: "8%", dur: 1.6 });
      [1, 2, 3, 5].forEach((h, i) => s.to("py", { hl: h }, { at: (44 + i * 13) + "%", dur: 0.2 }));
    }},
    { say: "كل رد يعود ببيانات تشغيل حاسمة: سبب التوقف stop_reason وعدد Tokens المدخلات والمخرجات.", eq: "@T{usage} = @{ n_{@T{in}}, @; n_{@T{out}} @}", do: s => {
      s.to("py", { x: 470, scale: 0.72, hl: 5 }, { at: "0%", dur: 0.6 });
      s.code("resp", { x: 1170, y: 515, size: 23, title: "response metadata", lines: [
        "stop_reason: \"end_turn\"",
        "usage: {",
        "  input_tokens: 412,",
        "  output_tokens: 96",
        "}"
      ] }, { at: "24%", dur: 1.2 });
      s.to("resp", { hl: 0 }, { at: "58%", dur: 0.2 });
      s.to("resp", { hl: 2 }, { at: "74%", dur: 0.2 });
    }},
    { say: "فسجّل الاستهلاك دائمًا في لوحة مراقبة يومية، لتكتشف أي ارتفاع مفاجئ في التكلفة مبكرًا.", do: s => {
      s.out("py", { at: "0%", dur: 0.35 });
      s.to("resp", { x: 440, scale: 0.85, hl: -1 }, { at: "6%", dur: 0.6 });
      s.note("ct", { text: "Daily token spend ($)", x: 1120, y: 330, font: "math", color: "gold", size: 28 }, { at: "20%" });
      ["Mon", "Tue", "Wed", "Thu", "Fri"].forEach((d, i) => {
        const v = [0.28, 0.42, 0.38, 0.86, 0.50][i];
        s.box("cb" + i, { x: 920 + i * 100, y: 710 - v * 155, w: 62, h: v * 310, r: 8, label: "", color: i === 3 ? "orange" : "teal", fill: "panel" }, { at: (30 + i * 8) + "%", in: "grow" });
        s.note("cd" + i, { text: d, x: 920 + i * 100, y: 745, size: 22, font: "math" }, { at: (32 + i * 8) + "%" });
      });
      s.badge("spk", { text: "spike caught!", x: 1220, y: 395, color: "orange", size: 21 }, { at: "76%" });
    }},
    { sec: "الأمان والأخطاء", say: "إياك أن تضع مفتاح الـ API في كود المتصفح؛ أي زائر سيسرقه في ثانية من أدوات المطوّر!", do: s => {
      s.clear({ dur: 0.4 });
      s.box("br", { x: 440, y: 525, w: 420, h: 210, label: "Frontend / Browser", sub: "const KEY = \"sk-ant-…\"", icon: "browser", color: "red", size: 26 }, { at: "10%" });
      s.mark("bx", "br", "x", { at: "34%" });
      s.badge("lk", { text: "مكشوف في DevTools!", x: 440, y: 695, color: "red", size: 22 }, { at: "48%" });
      s.box("sv", { x: 1160, y: 525, w: 430, h: 210, label: "Backend Server", sub: "os.environ[\"API_KEY\"]", icon: "server", color: "green", size: 26 }, { at: "58%" });
      s.mark("sc", "sv", "check", { at: "76%" });
      s.badge("ok", { text: "محفوظ في متغيرات البيئة ✓", x: 1160, y: 695, color: "green", size: 22 }, { at: "80%" });
    }},
    { say: "وقبل الشحن، تأكد من ثلاث قواعد: حدّد max_tokens، وافحص stop_reason، وسجّل usage لكل طلب.", do: s => {
      s.to(["br", "bx", "lk", "sv", "sc", "ok"], { opacity: 0.2 }, { at: "0%", dur: 0.4 });
      s.col("rul", ["1 · Cap max_tokens per endpoint", "2 · Branch on stop_reason explicitly", "3 · Log input + output tokens per user"], { x: 800, y: 530, w: 640, h: 78, gap: 26, size: 26, icons: ["gauge", "flag", "chart"], colors: ["gold", "teal", "green"] }, { at: "18%", st: 0.22 });
    }},
    { sec: "الخلاصة", say: "إذن التكامل السليم يجمع: أدوارًا واضحة، وإرسال السجل، والبث، وتسجيل الاستهلاك، وحفظ المفتاح بالخادم.", eq: "@T{clean API} = @P{roles} + @B{history} + @G{stream} + @Y{usage} + @C{env key}", do: s => {
      s.clear({ dur: 0.4 });
      s.chain("sum", ["Roles", "History", "Stream", "Usage", "Env Key"], { y: 525, gap: 42, w: 220, h: 150, size: 24, icons: ["chat", "history", "bolt", "chart", "lock"], colors: ["purple", "blue", "green", "gold", "teal"], pulse: true }, { at: "10%", st: 0.14 });
    }}
  ]);

  // ------------------------------------------------------------------ 2.2 Structured outputs & runtime validation
  X.lesson("2.2", [
    { sec: "فخ النص الحر", say: "تصل تذكرة عاجلة: تم خصم المبلغ مرتين. فتسأل النموذج ليصنّفها، فيرد بفقرة كلامية لطيفة!", do: s => {
      s.bubble("q", { text: "user: Charged twice for order #402!", side: "u", x: 350, y: 515, w: 380, size: 23 }, { at: "0%" });
      s.bubble("free", { text: "Sure! This looks like a refund issue, and it seems quite urgent so please help soon…", side: "a", x: 960, y: 480, w: 500, size: 23 }, { at: "34%" });
      s.link("l0", "q", "free", { color: "dim", pulse: true }, { at: "28%" });
      s.badge("pr", { text: "نص بشري حر… لا JSON!", x: 960, y: 665, color: "orange", size: 22 }, { at: "74%" });
    }},
    { say: "عندما يحاول كودك قراءة هذا النص بـ Regex أو JSON.parse، ينهار النظام فورًا!", do: s => {
      s.out(["q", "l0", "pr"], { at: "0%", dur: 0.35 });
      s.to("free", { x: 470, y: 490 }, { at: "6%", dur: 0.55 });
      s.box("cd", { x: 1170, y: 490, w: 280, h: 150, label: "Your Code", sub: "JSON.parse()", icon: "code", color: "teal", size: 26 }, { at: "22%" });
      s.link("l1", "free", "cd", { color: "red", pulse: true }, { at: "34%" });
      s.box("err", { x: 1170, y: 695, w: 430, h: 72, label: "SyntaxError: Unexpected token 'S'", font: "mono", size: 20, color: "red" }, { at: "58%" });
      s.mark("ex", "err", "x", { at: "78%" });
    }},
    { sec: "المخطط الصارم", say: "الحل يبدأ بتعريف مخطط Schema صارم: أسماء الحقول المطلوبة وأنواعها الدقيقة.", eq: "@T{Ticket} = @{ @T{category}, @; @T{urgent}, @; @T{summary} @}", do: s => {
      s.clear({ dur: 0.4 });
      s.code("z", { x: 800, y: 515, size: 25, title: "schema.ts (Zod)", lines: [
        "const Ticket = z.object({",
        "  category: z.enum([\"refund\", \"shipping\", \"other\"]),",
        "  urgent:   z.boolean(),",
        "  summary:  z.string().max(200)",
        "});"
      ] }, { at: "10%", dur: 1.5 });
      [1, 2, 3].forEach((h, i) => s.to("z", { hl: h }, { at: (48 + i * 14) + "%", dur: 0.2 }));
    }},
    { say: "ثم نطلب من النموذج الالتزام بهذا المخطط عبر Structured Outputs، فيعيد JSON نظيفًا مطابقًا.", do: s => {
      s.to("z", { x: 465, scale: 0.74, hl: -1 }, { at: "0%", dur: 0.6 });
      s.code("js", { x: 1185, y: 515, size: 24, title: "model output (JSON)", lines: [
        "{",
        "  \"category\": \"refund\",",
        "  \"urgent\": true,",
        "  \"summary\": \"Charged twice\"",
        "}"
      ] }, { at: "28%", dur: 1.3 });
      s.link("zj", "z", "js", { color: "green", label: "enforced", lc: "green", pulse: true }, { at: "62%" });
      s.mark("okj", "js", "check", { at: "80%" });
    }},
    { sec: "التحقق وقت التشغيل", say: "لكننا لا نمرّر الرد إلى منطق العمل مباشرة؛ بل نتحقق منه أثناء التشغيل عبر Zod أو Pydantic.", eq: "@T{parse} @to @Y{validate} @to @G{business logic}", do: s => {
      s.clear({ dur: 0.4 });
      s.chain("v", ["Model Output", "Runtime Validate", "Business Logic"], { y: 455, gap: 115, colors: ["soft", "gold", "green"], icons: ["code", "shieldok", "gear"], w: 255, h: 155, size: 24, pulse: true }, { at: "10%", st: 0.24 });
      s.focus("v1", { zoom: 1.15, at: "54%", dur: 0.6 });
      s.stream("v0", "v1", { at: "62%", span: 1.4, every: 0.45, color: "gold" });
      s.stream("v1", "v2", { at: "74%", span: 1.4, every: 0.45, color: "green" });
    }},
    { say: "فإن أخطأ النموذج مثلًا وكتب refnd بحرف ناقص، يلتقطه المدقق ويعيد المحاولة مع رسالة الخطأ.", do: s => {
      s.unfocus({ at: "0%", dur: 0.5 });
      s.bubble("bad", { text: "{ \"category\": \"refnd\" }", side: "a", x: 435, y: 725, w: 360, font: "mono", size: 22, color: "red" }, { at: "18%" });
      s.box("msg", { x: 1035, y: 725, w: 540, h: 72, label: "Invalid enum: expected refund | shipping | other", size: 20, color: "orange", font: "ui" }, { at: "44%" });
      s.link("bm", "bad", "msg", { color: "red" }, { at: "40%" });
      s.link("rt", "msg", "v0", { color: "orange", bend: -0.22, label: "retry with error", lc: "orange", pulse: true }, { at: "66%" });
      s.flow("msg", "v0", { color: "orange", bend: -0.22, at: "74%" });
    }},
    { sec: "في الكود", say: "هكذا نكتب التحقق الآمن بـ safeParse: إن نجح نستخدم الكائن الموثّق، وإلا نعيد المحاولة أو نتراجع.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("cd", { x: 800, y: 515, size: 23, title: "validate_ticket.ts", lines: [
        "const raw = JSON.parse(output);",
        "const parsed = Ticket.safeParse(raw);",
        "if (!parsed.success) {",
        "  return retryWith(parsed.error.message);",
        "}",
        "routeTicket(parsed.data); // typed & safe ✓"
      ] }, { at: "8%", dur: 1.6 });
      [1, 3, 5].forEach((h, i) => s.to("cd", { hl: h }, { at: (46 + i * 16) + "%", dur: 0.2 }));
    }},
    { say: "ومع Pydantic في Python نحصل على الميزة نفسها: أنواع مضمونة وإكمال تلقائي في المحرر.", do: s => {
      s.to("cd", { x: 470, scale: 0.72, hl: 5 }, { at: "0%", dur: 0.6 });
      s.box("obj", { x: 1180, y: 455, w: 430, h: 150, label: "Ticket(category='refund',\nurgent=True)", font: "mono", size: 22, color: "green" }, { at: "28%" });
      s.badge("tp1", { text: "TypeScript → Zod ✓", x: 1055, y: 655, color: "blue", size: 22 }, { at: "58%" });
      s.badge("tp2", { text: "Python → Pydantic ✓", x: 1320, y: 655, color: "teal", size: 22 }, { at: "74%" });
    }},
    { sec: "الرفض والأخطاء", say: "انتبه للفرق: رفض النموذج للسياسة Refusal نتيجة مشروعة، وليس خطأ JSON تعيد محاولته بلا نهاية.", eq: "@O{refusal} @neq @R{parse error}", do: s => {
      s.clear({ dur: 0.4 });
      s.box("rf", { x: 470, y: 440, w: 380, h: 120, label: "Model Refusal", sub: "policy: cannot fulfill request", icon: "hand", inline: true, color: "orange", size: 25 }, { at: "12%" });
      s.box("ui", { x: 1130, y: 440, w: 480, h: 120, label: "\"We can't do that here — contact support.\"", icon: "browser", inline: true, size: 21, color: "blue" }, { at: "42%" });
      s.link("l2", "rf", "ui", { color: "orange", label: "clear UX", lc: "orange", pulse: true }, { at: "38%" });
      s.box("pe", { x: 470, y: 685, w: 380, h: 115, label: "Schema Failure", sub: "bad field / malformed JSON", icon: "bug", inline: true, color: "red", size: 25 }, { at: "60%" });
      s.box("rt", { x: 1130, y: 685, w: 480, h: 115, label: "Retry (max 2) → safe fallback", icon: "refresh", inline: true, color: "gold", size: 23 }, { at: "74%" });
      s.link("l3", "pe", "rt", { color: "gold", pulse: true }, { at: "72%" });
    }},
    { say: "ومع ذلك، ضع حدًا أقصى لمحاولات الإعادة؛ وإن استمر الفشل فانتقل لمسار بديل آمن أو لموظف بشري.", do: s => {
      s.focus(["pe", "rt", "l3"], { zoom: 1.1, at: "8%", dur: 0.6 });
      s.callout("fb", { text: "max_retries = 2  →  fallback: ESCALATE", x: 800, y: 825, color: "gold", icon: "shieldok" }, { at: "48%" });
      s.unfocus({ at: "80%", dur: 0.55 });
    }},
    { say: "إياك أن تمرّر JSON غير متحقق منه إلى قاعدة البيانات أو تستخرج الحقول بـ Regex هشّ.", do: s => {
      s.clear({ dur: 0.4 });
      s.versus("vs", "الخطأ الشائع ✗", "قاعدة الإنتاج ✓", { colors: ["red", "green"], y: 535, h: 490 }, { at: "8%" });
      s.col("ms", ["Regex on prose output", "Trust JSON.parse blindly", "Retry infinitely on refusal"], { x: 440, y: 560, w: 450, size: 24, icons: ["x", "alert", "bug"], colors: ["red", "red", "red"] }, { at: "26%", st: 0.16 });
      s.col("pr", ["Strict JSON Schema output", "Validate with Zod / Pydantic", "Retry with error + refusal UX"], { x: 1160, y: 560, w: 460, size: 24, icons: ["code", "shieldok", "check"], colors: ["green", "green", "green"] }, { at: "52%", st: 0.16 });
    }},
    { sec: "الخلاصة", say: "القاعدة الذهبية: لا تثق أبدًا بمخرجات نموذج لم تتحقق منها قبل دخول منطق العمل.", eq: "@T{never trust unvalidated model output}", do: s => {
      s.clear({ dur: 0.4 });
      s.chain("sum", ["JSON Schema", "Parse", "Zod / Pydantic", "Safe Logic"], { y: 500, gap: 62, w: 255, h: 150, size: 24, icons: ["doc", "code", "shieldok", "check"], colors: ["blue", "teal", "gold", "green"], pulse: true }, { at: "10%", st: 0.18 });
      s.callout("gd", { text: "وتعامل مع الرفض Refusal كمسار UX طبيعي", x: 800, y: 720, color: "orange" }, { at: "70%" });
    }}
  ]);

  // ------------------------------------------------------------------ 2.3 Tool calling from first principles
  X.lesson("2.3", [
    { sec: "لماذا الأدوات؟", say: "عميل يسأل: أين طلبي رقم 812؟ النموذج لا يستطيع فتح قاعدة بياناتك بنفسه.", do: s => {
      s.bubble("q", { text: "Where is my order #812?", side: "u", x: 340, y: 520, w: 340, size: 24 }, { at: "0%" });
      s.box("llm", { x: 800, y: 520, w: 230, h: 155, label: "LLM", icon: "brain", color: "purple", size: 28 }, { at: "20%" });
      s.box("db", { x: 1260, y: 520, w: 240, h: 155, label: "Orders DB", icon: "db", color: "blue", size: 26 }, { at: "34%" });
      s.link("l1", "q", "llm", { color: "blue", pulse: true }, { at: "26%" });
      s.line("wall", { x1: 1030, y1: 390, x2: 1030, y2: 650, color: "red", dash: "8 6", w: 3.5 }, { at: "52%" });
      s.badge("no", { text: "النموذج لا ينفّذ كودك مباشرة!", x: 1030, y: 715, color: "red", size: 22 }, { at: "68%" });
    }},
    { say: "الحقيقة الأساسية: النموذج لا يُشغّل أي دالة؛ بل يُرسل طلبًا مهيكلًا، وتطبيقك هو من ينفّذ!", eq: "@P{LLM} @T{ requests} @quad @mid @quad @C{Your App} @T{ executes}", do: s => {
      s.out(["wall", "no", "q", "l1"], { at: "0%", dur: 0.35 });
      s.to("llm", { x: 340 }, { at: "10%", dur: 0.6 });
      s.box("app", { x: 800, y: 520, w: 260, h: 155, label: "Your App", sub: "validates & runs", icon: "code", color: "teal", size: 26 }, { at: "26%" });
      s.link("la", "llm", "app", { color: "orange", label: "tool_use", lc: "orange", pulse: true }, { at: "46%" });
      s.link("ad", "app", "db", { color: "teal", label: "SQL query", lc: "teal", pulse: true }, { at: "64%" });
      s.stream("llm", "app", { at: "56%", span: 1.5, every: 0.45, color: "orange" });
      s.stream("app", "db", { at: "70%", span: 1.5, every: 0.45, color: "teal" });
    }},
    { sec: "الخطوات الخمس", say: "أولًا: نصف الأداة للنموذج بثلاثة أشياء: اسم واضح، ووصف، ومخطط مدخلات input_schema.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("td", { x: 800, y: 515, size: 23, title: "tools.json", lines: [
        "{ \"name\": \"get_order\",",
        "  \"description\": \"Look up an order by its numeric id\",",
        "  \"input_schema\": {",
        "    \"type\": \"object\",",
        "    \"properties\": {\"order_id\": {\"type\": \"integer\"}},",
        "    \"required\": [\"order_id\"] } }"
      ] }, { at: "8%", dur: 1.5 });
      [0, 1, 4].forEach((h, i) => s.to("td", { hl: h }, { at: (46 + i * 16) + "%", dur: 0.2 }));
    }},
    { say: "ثانيًا: يرد النموذج بكتلة tool_use تحمل الاسم والمعاملات، ويتوقف بسبب tool_use.", eq: "@O{tool@_use}: @{ @T{name}: get@_order, @; @T{input}: @{order@_id: 812@} @}", do: s => {
      s.to("td", { y: 325, scale: 0.65, hl: -1 }, { at: "0%", dur: 0.6 });
      s.box("llm", { x: 390, y: 655, w: 210, h: 145, label: "LLM", icon: "brain", color: "purple", size: 28 }, { at: "20%" });
      s.bubble("tu", { text: "tool_use: get_order({\"order_id\": 812})", side: "t", x: 1015, y: 635, w: 580, font: "mono", size: 22 }, { at: "42%" });
      s.link("l1", "llm", "tu", { color: "orange", pulse: true }, { at: "38%" });
      s.badge("sr", { text: "stop_reason: tool_use", x: 1015, y: 760, color: "orange", size: 22 }, { at: "72%" });
    }},
    { say: "ثالثًا: تطبيقك يتحقق من المعاملات قبل التنفيذ؛ فقد يولّد النموذج نصًا بدل رقم!", do: s => {
      s.clear({ keep: ["llm"] });
      s.to("llm", { x: 300, y: 540 }, { at: "0%", dur: 0.5 });
      s.box("gate", { x: 760, y: 540, w: 240, h: 150, label: "Validate Args", icon: "shieldok", color: "gold", size: 24 }, { at: "14%" });
      s.bubble("b1", { text: "order_id: \"eight-twelve\"", side: "t", x: 760, y: 315, w: 390, font: "mono", size: 21, color: "red" }, { at: "32%" });
      s.link("lb1", "b1", "gate", { color: "red" }, { at: "38%" });
      s.box("rej", { x: 1230, y: 400, w: 280, h: 74, label: "Reject + fix ✗", size: 23, color: "red" }, { at: "52%" });
      s.link("gr", "gate", "rej", { color: "red" }, { at: "50%" });
      s.box("ok", { x: 1230, y: 655, w: 300, h: 78, label: "order_id: 812  ✓", font: "mono", size: 22, color: "green" }, { at: "70%" });
      s.link("go", "gate", "ok", { color: "green", pulse: true }, { at: "68%" });
    }},
    { say: "رابعًا: ننفّذ الدالة الفعلية، ثم نعيد tool_result إلى النموذج ليصيغ الإجابة النهائية.", eq: "@C{tool@_result} @to @P{LLM} @to @G{final answer}", do: s => {
      s.clear({ keep: ["llm"] });
      s.box("fn", { x: 820, y: 465, w: 290, h: 145, label: "get_order(812)", icon: "gear", font: "mono", size: 23, color: "teal" }, { at: "10%" });
      s.link("lf", "llm", "fn", { color: "orange", label: "call", lc: "orange", pulse: true }, { at: "20%" });
      s.bubble("tr", { text: "tool_result: {\"status\": \"shipped\", \"eta\": \"Fri\"}", side: "t", x: 820, y: 715, w: 590, font: "mono", size: 21, color: "teal" }, { at: "46%" });
      s.link("rt", "fn", "tr", { color: "teal" }, { at: "42%" });
      s.link("tl", "tr", "llm", { color: "teal", bend: 0.2, pulse: true }, { at: "56%" });
      s.bubble("ans", { text: "Your order #812 shipped and arrives Friday!", side: "a", x: 1320, y: 465, w: 380, size: 22, color: "green" }, { at: "74%" });
      s.link("la", "fn", "ans", { color: "green" }, { at: "72%" });
    }},
    { sec: "الأخطاء والتوازي", say: "وحتى لو فشلت الأداة، أعد الخطأ كـ tool_result منظّم، فيقرؤه النموذج ويتعامل بذكاء بدل الانهيار.", do: s => {
      s.out(["tr", "rt", "tl", "ans", "la"], { at: "0%", dur: 0.35 });
      s.bubble("te", { text: "tool_result: {\"is_error\": true, \"msg\": \"order #812 not found\"}", side: "t", x: 820, y: 715, w: 660, font: "mono", size: 20, color: "red" }, { at: "20%" });
      s.link("e1", "fn", "te", { color: "red" }, { at: "18%" });
      s.link("e2", "te", "llm", { color: "orange", bend: 0.2, pulse: true }, { at: "34%" });
      s.bubble("ask", { text: "I couldn't find order #812 — could you double-check the number?", side: "a", x: 1300, y: 465, w: 420, size: 22, color: "green" }, { at: "64%" });
      s.mark("mk", "ask", "check", { at: "80%" });
    }},
    { say: "وقد يطلب النموذج عدة أدوات بالتوازي في رد واحد؛ نفّذها جميعًا وأعد كل نتائجها بترتيب معرّفاتها.", eq: "@O{tool@_use}_{1..k} @; @Longrightarrow @; @C{tool@_result}_{1..k}", do: s => {
      s.clear({ keep: ["llm"] });
      ["get_order(812)", "get_order(813)", "get_customer(77)"].forEach((t, i) => {
        s.box("p" + i, { x: 850, y: 365 + i * 165, w: 340, h: 78, label: t, font: "mono", size: 22, color: "orange" }, { at: (12 + i * 10) + "%" });
        s.link("pl" + i, "llm", "p" + i, { color: "orange", w: 2.5, pulse: true }, { at: (16 + i * 10) + "%" });
        s.box("r" + i, { x: 1310, y: 365 + i * 165, w: 240, h: 72, label: "result #" + (i + 1) + " ✓", size: 22, color: "teal" }, { at: (52 + i * 10) + "%" });
        s.link("rl" + i, "p" + i, "r" + i, { color: "teal", w: 2.5, pulse: true }, { at: (48 + i * 10) + "%" });
      });
    }},
    { sec: "في الكود", say: "وفي الكود تبدو حلقة الأداة واضحة: استدعِ النموذج، تحقق من المعاملات، نفّذ، وألحق النتيجة بالرسائل.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("lp", { x: 800, y: 515, size: 22, title: "tool_loop.py", lines: [
        "if resp.stop_reason == \"tool_use\":",
        "    for call in resp.tool_calls:",
        "        args = OrderInput.model_validate(call.input)",
        "        res  = safe_run(call.name, args)",
        "        msgs.append({\"role\": \"user\", \"tool_result\": res})"
      ] }, { at: "8%", dur: 1.5 });
      [0, 2, 3, 4].forEach((h, i) => s.to("lp", { hl: h }, { at: (44 + i * 13) + "%", dur: 0.2 }));
    }},
    { say: "وكل خطوة لها بصمة واضحة في التتبّع: زمن النموذج، وزمن التحقق، وزمن تنفيذ قاعدة البيانات.", do: s => {
      s.to("lp", { y: 345, scale: 0.72, hl: -1 }, { at: "0%", dur: 0.55 });
      s.bars("tr", [
        ["LLM → tool_use", 0.46, "purple", "480 ms"],
        ["Validate + SQL", 0.14, "teal", "65 ms"],
        ["LLM → final reply", 0.55, "green", "540 ms"]
      ], { x: 560, y: 690, w: 560, gap: 66, size: 24, h: 28 }, { at: "26%" });
    }},
    { say: "أخطر خطأ هو تمرير معاملات النموذج مباشرة إلى SQL أو API دون تحقق؛ فالنموذج ليس مصدرًا موثوقًا.", do: s => {
      s.clear({ dur: 0.4 });
      s.versus("vs", "الخطأ الخطير ✗", "قاعدة الإنتاج ✓", { colors: ["red", "green"], y: 535, h: 480 }, { at: "8%" });
      s.col("ms", ["Execute raw args without validation", "Crash app when tool throws error", "Ignore parallel tool calls"], { x: 440, y: 560, w: 480, size: 23, icons: ["alert", "x", "bug"], colors: ["red", "red", "red"] }, { at: "26%", st: 0.16 });
      s.col("pr", ["Validate schema + permissions first", "Return structured is_error results", "Run all requested calls + match IDs"], { x: 1160, y: 560, w: 480, size: 23, icons: ["shieldok", "check", "bolt"], colors: ["green", "green", "green"] }, { at: "52%", st: 0.16 });
    }},
    { sec: "الخلاصة", say: "إذن دورة استدعاء الأدوات خمس خطوات ثابتة: صِف، استقبل، تحقّق، نفّذ، وأعد النتيجة.", eq: "@B{describe} @to @O{tool@_use} @to @Y{validate} @to @C{execute} @to @G{tool@_result}", do: s => {
      s.clear({ dur: 0.4 });
      s.chain("f", ["Describe", "tool_use", "Validate", "Execute", "tool_result"], { y: 525, gap: 40, w: 225, h: 145, size: 23, icons: ["doc", "brain", "shieldok", "gear", "send"], colors: ["blue", "orange", "gold", "teal", "green"], pulse: true }, { at: "10%", st: 0.16 });
    }}
  ]);

  // ------------------------------------------------------------------ 3.1 Success criteria first
  X.lesson("3.1", [
    { sec: "فخ الانطباعات", say: "كثير من الفرق تعدّل الأمر بالحدس: غيّرنا جملة، وبدا الرد أجمل في مثالين، فهيا نطلقه!", do: s => {
      s.box("p1", { x: 420, y: 495, w: 320, h: 120, label: "Prompt tweak", sub: "\"be super friendly!\"", icon: "pencil", color: "blue", size: 24 }, { at: "0%" });
      s.bubble("ex1", { text: "Test #1: looks nice! ✓", side: "a", x: 960, y: 410, w: 340, size: 23, color: "green" }, { at: "34%" });
      s.bubble("ex2", { text: "Test #2: seems fine! ✓", side: "a", x: 960, y: 580, w: 340, size: 23, color: "green" }, { at: "50%" });
      s.link("l1", "p1", "ex1", { color: "dim" }, { at: "30%" });
      s.link("l2", "p1", "ex2", { color: "dim" }, { at: "46%" });
      s.badge("sh", { text: "Ship to prod!", x: 1340, y: 495, color: "orange", size: 24 }, { at: "74%" });
    }},
    { say: "وفي الإنتاج ينكسر الأمر على 15 تذكرة حقيقية؛ لأن الانطباع الشخصي ليس قياسًا هندسيًا!", do: s => {
      s.focus("sh", { zoom: 1.1, at: "0%", dur: 0.45 });
      s.out(["ex1", "ex2", "l1", "l2"], { at: "14%", dur: 0.35 });
      s.unfocus({ at: "18%", dur: 0.5 });
      s.grid("brk", ["refund typo ✗", "invented 90d ✗", "rude tone ✗", "prompt inject ✗", "missed order ✗", "wrong lang ✗"], { cols: 3, x: 960, y: 515, cw: 235, ch: 92, size: 21, colors: ["red", "red", "orange", "red", "orange", "red"] }, { at: "30%", st: 0.08 });
      s.callout("vb", { text: "Vibe-checking ≠ Engineering", x: 800, y: 740, color: "red", icon: "alert" }, { at: "76%" });
    }},
    { sec: "معايير النجاح", say: "لذا تبدأ الصياغة الجيدة قبل كتابة أول كلمة في الأمر: بتعريف معايير نجاح قابلة للقياس.", eq: "@T{accuracy} @ge 95@% @; @land @; @T{polite} @; @land @; @T{0 invented policies}", do: s => {
      s.clear({ dur: 0.4 });
      s.icon("tg", { name: "target", x: 370, y: 500, s: 150, color: "gold" }, { at: "10%" });
      s.note("tl", { text: "Success Criteria", x: 370, y: 625, font: "math", color: "gold", size: 30 }, { at: "18%" });
      s.col("cr", ["Category accuracy ≥ 95%", "Warm & polite tone ≥ 98%", "Zero invented refund policies"], { x: 1020, y: 525, size: 26, icons: ["chart", "chat", "shieldok"], colors: ["gold", "blue", "green"], w: 540, h: 80 }, { at: "34%", st: 0.2 });
    }},
    { sec: "مجموعة الاختبار", say: "الخطوة الثانية: نجمع مجموعة اختبار من تذاكر الاستخدام الحقيقي، لا من خيال المطوّر فقط.", do: s => {
      s.clear({ dur: 0.4 });
      s.icon("inb", { name: "inbox", x: 320, y: 515, s: 115, color: "blue" }, { at: "8%" });
      s.note("il", { text: "Real user tickets", x: 320, y: 615, font: "math", size: 26 }, { at: "16%" });
      s.zone("ts", { x: 1020, y: 525, w: 680, h: 420, label: "Evaluation Test Set (120 cases)", color: "gold" }, { at: "26%" });
      for (let i = 0; i < 8; i++) {
        s.box("c" + i, { x: 830 + (i % 4) * 126, y: 470 + Math.floor(i / 4) * 118, w: 102, h: 78, label: "#" + (i + 1), size: 22, color: "soft" }, { at: (40 + i * 5) + "%" });
      }
      s.stream("inb", "ts", { at: "34%", span: 1.8, every: 0.45, color: "blue" });
    }},
    { say: "ونوزّعها على ثلاثة أنواع: حالات عادية، وحالات طرفية صعبة، وهجمات خبيثة لحقن التعليمات.", do: s => {
      [0, 1, 2, 3].forEach(i => s.to("c" + i, { stroke: "teal" }, { at: "14%", dur: 0.4 }));
      [4, 5].forEach(i => s.to("c" + i, { stroke: "gold" }, { at: "40%", dur: 0.4 }));
      [6, 7].forEach(i => s.to("c" + i, { stroke: "red" }, { at: "64%", dur: 0.4 }));
      s.badge("k0", { text: "Normal (50%)", x: 780, y: 775, color: "teal", size: 22 }, { at: "24%" });
      s.badge("k1", { text: "Edge Cases (30%)", x: 1030, y: 775, color: "gold", size: 22 }, { at: "48%" });
      s.badge("k2", { text: "Adversarial (20%)", x: 1290, y: 775, color: "red", size: 22 }, { at: "72%" });
    }},
    { sec: "درجة الأساس", say: "الخطوة الثالثة: نشغّل الأمر الأول v1 على كل الحالات لنسجّل درجة الأساس Baseline.", eq: "@T{baseline} = @T{score}(v_{1}) = 82@%", do: s => {
      s.clear({ dur: 0.4 });
      s.bars("sc", [["prompt v1 (baseline)", 0.82, "dim", "82%  ·  98 / 120"]], { x: 580, y: 405, w: 580, size: 28, h: 40 }, { at: "14%" });
      s.callout("bn", { text: "هذه النقطة المرجعية التي نحكم بها على كل تعديل لاحق", x: 800, y: 560, color: "gold" }, { at: "58%" });
    }},
    { say: "ثم نقارن كل نسخة جديدة بالأساس نفسه: v2 ارتفعت إلى 91% فنعتمدها، بينما v3 تراجعت فنرفضها!", eq: "@Delta = @T{score}(v_{\\text{new}}) - @T{score}(v_{1})", do: s => {
      s.out("bn", { at: "0%", dur: 0.3 });
      s.bars("v2", [["prompt v2 (+examples)", 0.91, "green", "91%  (+9%) ✓ ship"]], { x: 580, y: 530, w: 580, size: 28, h: 40 }, { at: "18%" });
      s.bars("v3", [["prompt v3 (verbose)", 0.78, "red", "78%  (-4%) ✗ reject"]], { x: 580, y: 655, w: 580, size: 28, h: 40 }, { at: "54%" });
      s.pulse("v20", { at: "76%", color: "green" });
    }},
    { sec: "التفصيل والكود", say: "لا تنظر للمتوسط وحده؛ افحص النتائج حسب الشريحة، فربما تتحسن العادية وتنهار الهجومية!", do: s => {
      s.clear({ dur: 0.4 });
      s.matrix("tb", { data: [
        ["Version", "Normal", "Edge", "Adversarial", "Decision"],
        ["v1 baseline", "92%", "75%", "64%", "baseline"],
        ["v2 structured", "97%", "89%", "86%", "SHIP ✓"],
        ["v3 chatty", "94%", "70%", "48%", "REJECT ✗"]
      ], x: 800, y: 515, cw: 235, ch: 78, size: 24, font: "ui" }, { at: "10%" });
      s.to("tb", { hi: 2 }, { at: "48%", dur: 0.25 });
      s.to("tb", { hi: 3 }, { at: "74%", dur: 0.25 });
    }},
    { say: "وبسكربت تقييم بسيط من 5 أسطر، تقيس كل تعديل على الأمر تلقائيًا في ثوانٍ.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("ev", { x: 800, y: 515, size: 23, title: "run_eval.py", lines: [
        "def eval_prompt(prompt_fn, dataset):",
        "    passed = 0",
        "    for case in dataset:",
        "        out = prompt_fn(case.ticket)",
        "        passed += check_criteria(out, case.expected)",
        "    return passed / len(dataset)  # compare vs baseline"
      ] }, { at: "8%", dur: 1.5 });
      [0, 3, 4, 5].forEach((h, i) => s.to("ev", { hl: h }, { at: (44 + i * 13) + "%", dur: 0.2 }));
    }},
    { say: "تجنّب كتابة 3 أمثلة خيالية سهلة؛ الاختبار الحقيقي يكشف الحالات القاسية التي يرسلها العملاء فعلًا.", do: s => {
      s.to("ev", { y: 340, scale: 0.72, hl: -1 }, { at: "0%", dur: 0.55 });
      s.box("ms", { x: 460, y: 690, w: 510, h: 145, label: "الخطأ: 3 أمثلة سهلة من خيالك", sub: "misses typos, slang & attacks", icon: "alert", color: "red", size: 22 }, { at: "24%" });
      s.box("pr", { x: 1140, y: 690, w: 510, h: 145, label: "الإنتاج: تذاكر حقيقية + طرفية + خبيثة", sub: "real logs · baseline · delta gate", icon: "shieldok", color: "green", size: 22 }, { at: "54%" });
      s.link("mp", "ms", "pr", { color: "green", pulse: true }, { at: "74%" });
    }},
    { say: "وعندما تصبح التعديلات محكومة بدرجة الأساس، يتوقف الجدل وتتكلم البيانات.", do: s => {
      s.out(["ev", "ms", "pr", "mp"], { at: "0%", dur: 0.35 });
      s.ring("lp", { x: 800, y: 525, r: 165, color: "teal", arrows: 3, speed: 24 }, { at: "14%" });
      ["Edit prompt", "Run 120 cases", "Ship if Δ > 0"].forEach((t, i) => {
        const a = (-90 + i * 120) * Math.PI / 180;
        s.box("n" + i, { x: 800 + Math.cos(a) * 185, y: 525 + Math.sin(a) * 165, w: 235, h: 66, label: t, size: 23, color: ["blue", "gold", "green"][i], fill: "bg" }, { at: (28 + i * 16) + "%" });
      });
    }},
    { sec: "الخلاصة", say: "إذن الصياغة الاحترافية أربع خطوات: معايير واضحة، وحالات حقيقية، وأساس، وتحسين مقيس.", eq: "@Y{Criteria} @to @B{Real Tests} @to @M{Baseline} @to @G{Measured Iteration}", do: s => {
      s.clear({ dur: 0.4 });
      s.chain("sum", ["Criteria", "Real Tests", "Baseline", "Iterate + Δ"], { y: 525, gap: 65, w: 255, h: 150, size: 24, icons: ["target", "inbox", "chart", "trend"], colors: ["gold", "blue", "teal", "green"], pulse: true }, { at: "10%", st: 0.18 });
    }}
  ]);

  // ------------------------------------------------------------------ 3.2 Prompt writing
  X.lesson("3.2", [
    { sec: "لماذا يفشل الغموض؟", say: "عميل يشتكي: طلبي وصل مكسورًا بعد 20 يومًا. فتُعطى المهمة لأمر غامض مليء بالنواهي فقط.", do: s => {
      s.bubble("tk", { text: "user: My item arrived broken after 20 days!", side: "u", x: 370, y: 495, w: 400, size: 23 }, { at: "0%" });
      s.code("bad", { x: 1050, y: 495, size: 23, title: "vague_prompt.txt", lines: [
        "Be helpful to customers.",
        "Don't be rude.",
        "Don't make things up.",
        "Don't write too much."
      ] }, { at: "30%", dur: 1.3 });
      s.link("l0", "tk", "bad", { color: "orange", pulse: true }, { at: "26%" });
      s.mark("bx", "bad", "x", { at: "78%" });
    }},
    { say: "النتيجة: رد طويل متذبذب يختلق ضمان 90 يومًا غير موجود أصلًا، لأنك لم تحدد ماذا يفعل بدقة!", do: s => {
      s.out(["tk", "l0"], { at: "0%", dur: 0.35 });
      s.to(["bad", "bx"], { x: v => v - 560, scale: 0.8 }, { at: "8%", dur: 0.6 });
      s.bubble("wr", { text: "So sorry!! Our 90-day full replacement warranty covers broken items, just send it back anytime and we will...", side: "a", x: 1120, y: 495, w: 500, size: 23, color: "red" }, { at: "30%" });
      s.badge("h1", { text: "اختلق سياسة 90 يومًا ✗", x: 960, y: 690, color: "red", size: 22 }, { at: "62%" });
      s.badge("h2", { text: "نبرة وطول غير منضبطين ✗", x: 1270, y: 690, color: "orange", size: 22 }, { at: "78%" });
    }},
    { sec: "الوضوح والأمثلة", say: "القاعدة الأولى: كن واضحًا ومباشرًا؛ قل للنموذج ماذا يفعل بالضبط، لا ماذا يتجنب فقط.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("v1", { x: 430, y: 520, size: 22, title: "negative & vague ✗", lines: ["Don't be rude.", "Don't make things up.", "Don't be too long."] }, { at: "10%", dur: 1.0 });
      s.code("v2", { x: 1140, y: 520, size: 22, title: "positive & clear ✓", lines: ["Reply in 3 short sentences.", "Use a warm, polite tone.", "Quote ONLY the policy text."] }, { at: "42%", dur: 1.2 });
      s.mark("m1", "v1", "x", { at: "36%" });
      s.mark("m2", "v2", "check", { at: "78%" });
      s.link("ar", "v1", "v2", { color: "green", pulse: true }, { at: "46%" });
    }},
    { say: "القاعدة الثانية: الأمثلة القليلة Few-Shot تضبط الصيغة والنبرة أدق من صفحة كاملة من الشرح.", eq: "@T{few-shot}: @; (x_1, y_1), @; (x_2, y_2) @; @to @; y", do: s => {
      s.clear({ dur: 0.4 });
      [0, 1].forEach(i => {
        s.box("ex" + i, { x: 440, y: 385 + i * 145, w: 320, h: 74, label: "Ticket example " + (i + 1), size: 23, color: "blue" }, { at: (10 + i * 20) + "%" });
        s.box("ey" + i, { x: 1050, y: 385 + i * 145, w: 430, h: 74, label: "Ideal 3-sentence reply " + (i + 1), size: 23, color: "green" }, { at: (18 + i * 20) + "%" });
        s.link("el" + i, "ex" + i, "ey" + i, { color: "dim", pulse: true }, { at: (22 + i * 20) + "%" });
      });
      s.box("nx", { x: 440, y: 695, w: 320, h: 76, label: "New customer ticket", size: 23, color: "gold" }, { at: "58%" });
      s.box("ny", { x: 1050, y: 695, w: 430, h: 76, label: "Matches exact style & tone ✓", size: 23, color: "gold", dash: "8 6" }, { at: "74%" });
      s.link("nl", "nx", "ny", { color: "gold", pulse: true }, { at: "68%" });
    }},
    { sec: "الوسوم والبديل", say: "القاعدة الثالثة: افصل التعليمات عن البيانات بوسوم XML واضحة مثل policy وticket.", eq: "@Y{<policy>} @dots @Y{</policy>} @quad @C{<ticket>} @dots @C{</ticket>}", do: s => {
      s.clear({ dur: 0.4 });
      s.code("p", { x: 800, y: 500, size: 24, title: "support_prompt.xml", lines: [
        "<policy>{{refund_policy}}</policy>",
        "<ticket>{{customer_message}}</ticket>",
        "Draft a polite 3-sentence reply using ONLY <policy>.",
        "If <policy> does not cover the case, reply: ESCALATE."
      ] }, { at: "8%", dur: 1.6 });
      s.to("p", { hl: 0 }, { at: "48%", dur: 0.2 });
      s.to("p", { hl: 1 }, { at: "66%", dur: 0.2 });
      s.to("p", { hl: 2 }, { at: "80%", dur: 0.2 });
    }},
    { say: "هكذا يميّز النموذج بوضوح: أين حقائق السياسة الموثوقة، وأين كلام العميل، وأين أوامرك.", do: s => {
      s.to("p", { y: 355, scale: 0.78, hl: -1 }, { at: "0%", dur: 0.55 });
      s.grid("tg", ["<policy>\ntrusted facts", "<ticket>\nuntrusted input", "Instructions\nexact rules"], { cols: 3, y: 660, cw: 330, ch: 135, size: 24, colors: ["gold", "teal", "blue"] }, { at: "26%", st: 0.18 });
      s.pulse("tg0", { at: "74%", color: "gold" });
    }},
    { say: "القاعدة الرابعة: أضف خطة بديلة Fallback؛ إن لم تغطِّ السياسة الحالة، يحوّلها فورًا لموظف بشري.", eq: "@T{uncovered case} @Rightarrow @O{ESCALATE}", do: s => {
      s.out("tg*", { at: "0%", dur: 0.35 });
      s.to("p", { hl: 3 }, { at: "10%", dur: 0.2 });
      s.box("q", { x: 800, y: 565, w: 320, h: 74, label: "Policy covers 20-day claim?", size: 23, color: "gold" }, { at: "24%" });
      s.box("yes", { x: 470, y: 745, w: 280, h: 72, label: "Draft polite reply ✓", size: 23, color: "green" }, { at: "50%" });
      s.box("no", { x: 1130, y: 745, w: 340, h: 72, label: "ESCALATE → Human", font: "mono", size: 22, color: "orange", icon: "user", inline: true }, { at: "64%" });
      s.link("ly", "q", "yes", { color: "green", label: "yes", lc: "green" }, { at: "48%" });
      s.link("ln", "q", "no", { color: "orange", label: "no", lc: "orange", pulse: true }, { at: "62%" });
      s.pulse("no", { at: "80%", color: "orange" });
    }},
    { sec: "اختبار حي", say: "جرّب الأمر المنظّم على تذكرة اليوم العشرين نفسها: لم يهلوس، بل أصدر ESCALATE بأمان!", do: s => {
      s.clear({ dur: 0.4 });
      s.bubble("in", { text: "<ticket>Broken after 20 days</ticket>", side: "u", x: 350, y: 465, w: 380, font: "mono", size: 20 }, { at: "10%" });
      s.box("pl", { x: 350, y: 635, w: 380, h: 86, label: "<policy>14-day window</policy>", font: "mono", size: 20, color: "gold" }, { at: "24%" });
      s.box("llm", { x: 820, y: 545, w: 210, h: 145, label: "LLM", icon: "brain", color: "purple", size: 28 }, { at: "36%" });
      s.link("a1", "in", "llm", { color: "teal", pulse: true }, { at: "42%" });
      s.link("a2", "pl", "llm", { color: "gold", pulse: true }, { at: "48%" });
      s.box("out", { x: 1270, y: 545, w: 320, h: 98, label: "ESCALATE", sub: "routed to human agent ✓", font: "mono", size: 26, color: "green" }, { at: "68%" });
      s.link("a3", "llm", "out", { color: "green", pulse: true }, { at: "64%" });
    }},
    { say: "وقِس الأثر على التقييمات: الانتقال من فقرة غامضة إلى قالب منظّم يرفع الدقة ويخفض الهلوسة.", do: s => {
      s.clear({ dur: 0.4 });
      s.bars("sc", [
        ["Vague prompt", 0.64, "red", "64%  ·  11% hallucinations"],
        ["+ Clear & Few-shot", 0.85, "blue", "85%  ·  3% hallucinations"],
        ["+ XML + ESCALATE", 0.96, "green", "96%  ·  0% hallucinations ✓"]
      ], { x: 560, y: 530, w: 560, gap: 110, size: 26, h: 38 }, { at: "14%" });
      s.pulse("sc2", { at: "76%", color: "green" });
    }},
    { say: "تجنّب حشر التعليمات والنصوص الخام في فقرة واحدة بلا فواصل ولا مخرج طوارئ عند الجهل.", do: s => {
      s.clear({ dur: 0.4 });
      s.versus("vs", "الخطأ الشائع ✗", "قاعدة الإنتاج ✓", { colors: ["red", "green"], y: 535, h: 480 }, { at: "8%" });
      s.col("ms", ["Only 'Don't do X' rules", "Raw text mixed with instructions", "Forces an answer when unsure"], { x: 440, y: 560, w: 470, size: 23, icons: ["x", "alert", "bug"], colors: ["red", "red", "red"] }, { at: "26%", st: 0.16 });
      s.col("pr", ["Positive step-by-step rules", "XML tags around untrusted data", "Explicit ESCALATE fallback"], { x: 1160, y: 560, w: 470, size: 23, icons: ["check", "code", "shieldok"], colors: ["green", "green", "green"] }, { at: "52%", st: 0.16 });
    }},
    { say: "وميزة هذه البنية أنها قابلة للتعديل والتطوير قسمًا بقسم دون كسر بقية الأمر.", do: s => {
      s.clear({ dur: 0.4 });
      s.col("pt", ["1 · Role & Goal", "2 · Positive Instructions", "3 · Few-Shot Examples", "4 · <policy> Trusted Facts </policy>", "5 · <ticket> User Input </ticket>", "6 · Fallback: ESCALATE"], { x: 800, y: 535, size: 24, gap: 14, h: 64, w: 580, colors: ["purple", "blue", "green", "gold", "teal", "orange"] }, { at: "10%", st: 0.12 });
      s.pulse(["pt0", "pt2", "pt5"], { at: "74%", st: 0.12 });
    }},
    { sec: "الخلاصة", say: "الأمر الاحترافي قالب هندسي منظّم: تعليمات إيجابية، وأمثلة، ووسوم، وخطة بديلة.", eq: "@T{Prompt} = @B{Clear} + @G{Examples} + @Y{XML Tags} + @O{Fallback}", do: s => {
      s.callout("gd", { text: "لا تترك النموذج يخمن حين تغيب المعلومة!", x: 800, y: 825, color: "gold", icon: "shieldok" }, { at: "24%" });
      s.pulse("pt*", { at: "52%", st: 0.08 });
    }}
  ]);

  // ------------------------------------------------------------------ 3.3 Context engineering
  X.lesson("3.3", [
    { sec: "طاولة العمليات", say: "تخيّل نافذة السياق كطاولة عمليات جراحية: ضع عليها فقط الأدوات اللازمة لهذه الخطوة.", do: s => {
      s.zone("tbl", { x: 800, y: 530, w: 660, h: 380, label: "Context Window (Operating Table)", color: "teal" }, { at: "8%" });
      const items = ["policy", "logs", "order tool", "recent chat", "old emails", "specs", "2023 tickets", "wiki dump"];
      items.forEach((t, i) => {
        s.box("it" + i, { x: i < 4 ? 225 : 1375, y: 345 + (i % 4) * 124, w: 210, h: 68, label: t, size: 22, color: "dim" }, { at: (24 + i * 6) + "%" });
      });
    }},
    { say: "الخطأ الكارثي: رمي مستودع المستشفى كله فوق الطاولة! الضوضاء تُشتّت النموذج فتنهار الجودة.", do: s => {
      [0, 1, 2, 3, 4, 5, 6, 7].forEach(i => {
        s.to("it" + i, { x: 575 + (i % 4) * 150, y: 465 + Math.floor(i / 4) * 115, w: 136, stroke: i === 0 || i === 2 || i === 3 ? "soft" : "red" }, { at: (8 + i * 4) + "%", dur: 0.7 });
      });
      s.bar("q", { x: 590, y: 805, w: 420, v: 0.86, color: "green", label: "Quality", size: 26, pct: true }, { at: "20%" });
      s.to("q", { v: 0.36, color: "red" }, { at: "52%", dur: 1.0 });
      s.badge("ns", { text: "Context Noise!", x: 1165, y: 805, color: "red", size: 22 }, { at: "74%" });
    }},
    { sec: "الاختيار والانتقاء", say: "هندسة السياق تعني: أزِل الضوضاء، وأبقِ أصغر مجموعة من الـ Tokens عالية القيمة فقط.", eq: "@min @; @T{tokens} @quad @T{s.t.} @; @G{task succeeds}", do: s => {
      s.out("ns", { at: "0%", dur: 0.3 });
      [1, 4, 5, 6, 7].forEach((i, k) => {
        s.to("it" + i, { x: i < 4 ? 225 : 1375, y: 345 + (i % 4) * 124, w: 210, opacity: 0.25, stroke: "dim" }, { at: (10 + k * 7) + "%", dur: 0.7 });
      });
      [0, 2, 3].forEach((i, k) => {
        s.to("it" + i, { x: 620 + k * 180, y: 535, w: 160, stroke: "teal" }, { at: "34%", dur: 0.7 });
      });
      s.to("q", { v: 0.93, color: "green" }, { at: "58%", dur: 0.9 });
      s.badge("ok", { text: "93% High Signal ✓", x: 1175, y: 805, color: "green", size: 22 }, { at: "76%" });
    }},
    { sec: "الترتيب والانتباه", say: "حتى مع سياق نظيف، الترتيب مهم: انتباه النماذج يكون أقوى في البداية والنهاية، ويضعف بالوسط.", eq: "@T{attention}: @; @G{start} @; > @; @R{middle} @; < @; @G{end}", do: s => {
      s.clear({ dur: 0.4 });
      s.curve("uc", { x: 800, y: 530, w: 780, h: 330, color: "gold", xlabel: "position in context (start → end)", ylabel: "recall", pts: [[0, 0.92], [0.15, 0.78], [0.35, 0.54], [0.5, 0.45], [0.65, 0.54], [0.85, 0.80], [1, 0.95]] }, { at: "10%", dur: 1.5 });
      s.badge("mid", { text: "Lost in the Middle!", x: 800, y: 590, color: "red", size: 22 }, { at: "68%" });
    }},
    { say: "لذلك رتّب السياق بذكاء: التعليمات أولًا، ثم البيانات والمستندات المنتقاة، ثم السؤال في النهاية.", do: s => {
      s.clear({ dur: 0.4 });
      s.col("ord", ["1 · Instructions & rules (high focus)", "2 · Selected facts & documents", "3 · Current user question (high focus)"], { x: 800, y: 525, size: 27, h: 88, gap: 24, w: 660, icons: ["flag", "docs", "chat"], colors: ["purple", "gold", "teal"] }, { at: "10%", st: 0.24 });
      s.pulse(["ord0", "ord2"], { at: "74%", color: "green" });
    }},
    { sec: "ضغط السجل", say: "ومع طول المحادثة، لا تترك السجل يتضخّم للأبد؛ لخّص الأدوار القديمة واحتفظ بآخر الأدوار فقط.", eq: "@T{history} @to @G{summary} + @B{last 3 turns}", do: s => {
      s.clear({ dur: 0.4 });
      for (let i = 0; i < 12; i++) {
        s.box("h" + i, { x: 250 + i * 100, y: 455, w: 80, h: 64, r: 8, label: "t" + (i + 1), size: 21, color: i < 9 ? "dim" : "blue" }, { at: (8 + i * 3) + "%" });
      }
      s.box("sum", { x: 470, y: 690, w: 260, h: 74, label: "Compact Summary", size: 23, color: "green" }, { at: "46%" });
      for (let i = 0; i < 9; i++) {
        s.to("h" + i, { x: 470, y: 690, opacity: 0, scale: 0.35 }, { at: (52 + i * 3) + "%", dur: 0.55 });
      }
    }},
    { say: "فيتحول السجل الضخم إلى سياق رشيق يحفظ كل الحقائق المهمة بنصف التكلفة.", do: s => {
      s.to(["h9", "h10", "h11"], { x: (v, k) => 755 + k * 108, y: 690, stroke: "teal" }, { at: "10%", dur: 0.7 });
      s.zone("ctx", { x: 700, y: 690, w: 770, h: 155, label: "Lean High-Signal Context", color: "teal" }, { at: "42%" });
      s.badge("sv", { text: "−75% tokens · higher focus ✓", x: 1265, y: 690, color: "green", size: 22 }, { at: "70%" });
    }},
    { sec: "الأرقام والكود", say: "قارن بالأرقام: حشو 18 ألف Token يعطي 68% دقة وبطءًا، بينما 2400 Token منتقاة تعطي 93%!", do: s => {
      s.clear({ dur: 0.4 });
      s.bars("cmp", [
        ["18K dumped tokens", 0.68, "red", "68% acc · 3.8 s · $0.054"],
        ["2.4K curated tokens", 0.93, "green", "93% acc · 1.1 s · $0.007 ✓"]
      ], { x: 540, y: 525, w: 540, gap: 125, size: 27, h: 40 }, { at: "14%" });
      s.pulse("cmp1", { at: "74%", color: "green" });
    }},
    { say: "وفي الكود نبني دالة تجميع سياق صريحة: تنتقي أفضل المقاطع، وتضغط القديم، وترتّب الأجزاء.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("bc", { x: 800, y: 515, size: 23, title: "build_context.py", lines: [
        "def build_context(ticket, history):",
        "    docs   = retriever.top_k(ticket, k=3)       # select",
        "    recent = summarize_old(history, keep=3)     # compact",
        "    return [SYSTEM, format_docs(docs), recent, ticket]"
      ] }, { at: "8%", dur: 1.5 });
      [1, 2, 3].forEach((h, i) => s.to("bc", { hl: h }, { at: (46 + i * 16) + "%", dur: 0.2 }));
    }},
    { say: "أكبر خرافة شائعة: «النافذة تتسع 200 ألف، فلنرمِ كل شيء!» السعة الكبيرة لا تعني انتباهًا مجانيًا.", do: s => {
      s.to("bc", { y: 340, scale: 0.72, hl: -1 }, { at: "0%", dur: 0.55 });
      s.box("ms", { x: 460, y: 690, w: 510, h: 145, label: "الخطأ: حشو النافذة لأنها كبيرة", sub: "200K dump → distraction & cost", icon: "alert", color: "red", size: 22 }, { at: "24%" });
      s.box("pr", { x: 1140, y: 690, w: 510, h: 145, label: "الإنتاج: انتقاء + ترتيب + ضغط مستمر", sub: "smallest high-signal token set", icon: "shieldok", color: "green", size: 22 }, { at: "54%" });
      s.link("mp", "ms", "pr", { color: "green", pulse: true }, { at: "74%" });
    }},
    { say: "كل Token يدخل السياق يجب أن يدفع ثمنه بإضافة قيمة مباشرة للخطوة الحالية.", do: s => {
      s.clear({ dur: 0.4 });
      s.box("f", { x: 800, y: 500, w: 720, h: 155, label: "Filter: Does THIS step need this token?", sub: "YES → keep in order   |   NO → drop or summarize", icon: "filter", color: "teal", size: 26 }, { at: "12%" });
      s.badge("b1", { text: "Higher accuracy", x: 470, y: 710, color: "green", size: 22 }, { at: "46%" });
      s.badge("b2", { text: "Lower latency", x: 800, y: 710, color: "blue", size: 22 }, { at: "60%" });
      s.badge("b3", { text: "Lower cost", x: 1130, y: 710, color: "gold", size: 22 }, { at: "74%" });
    }},
    { sec: "الخلاصة", say: "خلاصة هندسة السياق: انتقِ بدقة، ورتّب بذكاء، واضغط السجل القديم باستمرار.", eq: "@T{Context Engineering} = @C{Select} + @Y{Order} + @G{Compact}", do: s => {
      s.clear({ dur: 0.4 });
      s.chain("sum", ["Select High-Signal", "Order Strategically", "Compact History"], { y: 525, gap: 80, w: 325, h: 155, size: 25, icons: ["filter", "layers", "bolt"], colors: ["teal", "gold", "green"], pulse: true }, { at: "10%", st: 0.2 });
    }}
  ]);

  // ------------------------------------------------------------------ 3.4 Prompts as versioned assets
  X.lesson("3.4", [
    { sec: "حادثة الثلاثاء", say: "صباح الثلاثاء تهبط جودة ردود الدعم فجأة من 88% إلى 71%، ولا أحد يعلم ماذا تغيّر!", do: s => {
      s.curve("drop", { x: 640, y: 530, w: 680, h: 330, color: "red", xlabel: "days (Sun → Wed)", ylabel: "accuracy", pts: [[0, 0.88], [0.35, 0.89], [0.65, 0.87], [0.75, 0.71], [1, 0.70]] }, { at: "8%", dur: 1.4 });
      s.badge("al", { text: "−17% drop on Tue!", x: 1210, y: 430, color: "red", size: 24 }, { at: "52%" });
      s.box("unk", { x: 1210, y: 590, w: 410, h: 120, label: "Which prompt caused this?", sub: "inline strings · zero version logs", icon: "question", color: "orange", size: 22 }, { at: "70%" });
    }},
    { say: "لأن الفريق عامل الأوامر كنصوص عابرة داخل الكود، بلا أرقام إصدارات ولا سجل تغييرات!", do: s => {
      s.focus("unk", { zoom: 1.12, at: "0%", dur: 0.6 });
      s.callout("nt", { text: "تعديل نص واحد قد يغيّر سلوك التطبيق كاملًا كأي كود!", x: 800, y: 790, color: "gold", icon: "alert" }, { at: "45%" });
      s.unfocus({ at: "80%", dur: 0.55 });
    }},
    { sec: "إصدارات وقوالب", say: "القاعدة الأولى: الأمر كود برمجي؛ احفظه في Git أو Prompt Registry برقم إصدار واضح.", eq: "@T{prompt} @in @{ v_{2.2}, @; v_{2.3}, @; @G{v_{2.4}} @}", do: s => {
      s.clear({ dur: 0.4 });
      s.chain("v", ["support-v2.2", "support-v2.3", "support-v2.4"], { y: 475, gap: 105, colors: ["dim", "blue", "green"], icons: ["doc", "doc", "doc"], w: 250, h: 150, size: 24, pulse: true }, { at: "10%", st: 0.22 });
      s.box("git", { x: 800, y: 705, w: 460, h: 74, label: "Git / Prompt Registry + Diff", icon: "branch", inline: true, color: "orange", size: 24 }, { at: "62%" });
    }},
    { say: "القاعدة الثانية: القوالب تفصل التعليمات الثابتة عن المتغيرات الديناميكية مثل السياسة والتذكرة.", eq: "@T{template}(@Y{policy}, @; @C{ticket}) @to @T{prompt}", do: s => {
      s.clear({ dur: 0.4 });
      s.box("tp", { x: 800, y: 425, w: 820, h: 112, label: "Reply politely using {{policy}} to {{ticket}}", font: "mono", size: 25, color: "blue" }, { at: "10%" });
      s.box("p1", { x: 470, y: 685, w: 280, h: 74, label: "refund_policy", font: "mono", size: 23, color: "gold" }, { at: "34%" });
      s.box("p2", { x: 1130, y: 685, w: 280, h: 74, label: "customer_msg", font: "mono", size: 23, color: "teal" }, { at: "48%" });
      s.link("l1", "p1", "tp", { color: "gold", pulse: true }, { at: "44%" });
      s.link("l2", "p2", "tp", { color: "teal", pulse: true }, { at: "58%" });
      s.stream("p1", "tp", { at: "66%", span: 1.5, every: 0.45, color: "gold" });
      s.stream("p2", "tp", { at: "70%", span: 1.5, every: 0.45, color: "teal" });
    }},
    { sec: "التسجيل والمقارنة", say: "القاعدة الثالثة: سجّل رقم إصدار الأمر مع كل طلب في السجلات لتربط كل رد بإصداره.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("lg", { x: 800, y: 515, size: 22, title: "requests.log", lines: [
        "{\"req\": \"r_901\", \"prompt_v\": \"support-reply-v2.4\", \"ms\": 812}",
        "{\"req\": \"r_902\", \"prompt_v\": \"support-reply-v2.4\", \"ms\": 640}",
        "{\"req\": \"r_903\", \"prompt_v\": \"support-reply-v2.5\", \"ms\": 910}"
      ] }, { at: "10%", dur: 1.4 });
      s.to("lg", { hl: 0 }, { at: "48%", dur: 0.2 });
      s.to("lg", { hl: 2 }, { at: "72%", dur: 0.2 });
    }},
    { say: "القاعدة الرابعة: قبل إطلاق أي نسخة جديدة، قارنها بالإصدار الحالي على مجموعة التقييم نفسها.", eq: "@T{score}(v_{2.5}) @; @T{vs} @; @T{score}(v_{2.4}) @; (@T{same 120 cases})", do: s => {
      s.clear({ dur: 0.4 });
      s.bars("cmp", [
        ["support-v2.4 (prod)", 0.86, "teal", "86%  ✓"],
        ["support-v2.5 (candidate)", 0.79, "red", "79%  (−7% blocked ✗)"]
      ], { x: 580, y: 495, w: 540, gap: 115, size: 27, h: 40 }, { at: "14%" });
      s.callout("sm", { text: "نفس الـ 120 حالة اختبار جنبًا إلى جنب", x: 800, y: 710, color: "gold", icon: "scale" }, { at: "64%" });
    }},
    { sec: "الكود والتراجع", say: "وهكذا تبدو إدارة الإصدارات في الكود: نجلب القالب من السجل، نملأ المتغيرات، ونسجّل الرقم.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("py", { x: 800, y: 515, size: 22, title: "reply_service.py", lines: [
        "PROMPT_VERSION = \"support-reply-v2.4\"",
        "template = registry.get(PROMPT_VERSION)",
        "prompt   = template.render(policy=pol, ticket=msg)",
        "reply    = llm(prompt)",
        "logger.info({\"prompt_v\": PROMPT_VERSION, \"ms\": ms})"
      ] }, { at: "8%", dur: 1.6 });
      [0, 1, 2, 4].forEach((h, i) => s.to("py", { hl: h }, { at: (44 + i * 13) + "%", dur: 0.2 }));
    }},
    { say: "وإذا تسرّب إصدار سيئ إلى الإنتاج، يمنحك السجل تراجعًا فوريًا Rollback بضغطة زر دون إعادة نشر.", do: s => {
      s.clear({ dur: 0.4 });
      s.box("reg", { x: 800, y: 345, w: 360, h: 88, label: "Prompt Registry", icon: "db", inline: true, size: 26, color: "blue" }, { at: "8%" });
      s.box("bad", { x: 1160, y: 605, w: 260, h: 90, label: "v2.5 (live)", sub: "79% ✗", size: 24, color: "red" }, { at: "26%" });
      s.box("good", { x: 440, y: 605, w: 260, h: 90, label: "v2.4 (stable)", sub: "86% ✓", size: 24, color: "green" }, { at: "40%" });
      s.link("l1", "reg", "bad", { color: "red" }, { at: "32%" });
      s.link("rb", "bad", "good", { color: "green", bend: 0.24, label: "1-click rollback", lc: "green", pulse: true }, { at: "58%" });
      s.flow("bad", "good", { color: "green", bend: 0.24, at: "68%" });
      s.pulse("good", { at: "80%", color: "green" });
    }},
    { say: "وبدمج ذلك في CI، يصبح للأوامر مسار إطلاق هندسي كامل: مراجعة، ثم تقييم، ثم إطلاق تدريجي.", do: s => {
      s.clear({ dur: 0.4 });
      s.chain("ci", ["PR Diff", "Eval Suite", "Registry", "Canary 10%", "Prod 100%"], { y: 525, gap: 40, w: 225, h: 140, size: 22, icons: ["pr", "flask", "db", "gauge", "rocket"], colors: ["blue", "gold", "teal", "orange", "green"], pulse: true }, { at: "10%", st: 0.16 });
      s.stream("ci0", "ci4", { at: "66%", span: 1.6, every: 0.5, color: "green" });
    }},
    { say: "تجنّب تعديل نصوص الأوامر عشوائيًا داخل الإنتاج دون رقم إصدار أو خط رجعة جاهز.", do: s => {
      s.clear({ dur: 0.4 });
      s.versus("vs", "الخطأ الشائع ✗", "قاعدة الإنتاج ✓", { colors: ["red", "green"], y: 535, h: 480 }, { at: "8%" });
      s.col("ms", ["Hardcoded unversioned strings", "Editing prod without eval diff", "No instant rollback path"], { x: 440, y: 560, w: 470, size: 23, icons: ["x", "alert", "bug"], colors: ["red", "red", "red"] }, { at: "26%", st: 0.16 });
      s.col("pr", ["Versioned templates in Registry", "A/B compare on same eval set", "Log prompt_v + 1-click rollback"], { x: 1160, y: 560, w: 470, size: 23, icons: ["branch", "scale", "refresh"], colors: ["green", "green", "green"] }, { at: "52%", st: 0.16 });
    }},
    { say: "بهذا الانضباط، يتحول تعديل الأوامر من مخاطرة غامضة إلى هندسة برمجية موثوقة.", do: s => {
      s.focus("vsR", { zoom: 1.08, at: "10%", dur: 0.6 });
      s.callout("ok", { text: "الأمر أصل برمجي يُدار كالكود تمامًا ✓", x: 1160, y: 810, color: "green", icon: "shieldok" }, { at: "45%" });
      s.unfocus({ at: "80%", dur: 0.55 });
    }},
    { sec: "الخلاصة", say: "خمس ركائز لإدارة الأوامر: إصدارات، وقوالب، وتسجيل، ومقارنة بالتقييم، وتراجع سريع.", eq: "@T{Prompt Ops} = @B{Versions} + @C{Templates} + @Y{Logs} + @G{Evals} + @O{Rollback}", do: s => {
      s.clear({ dur: 0.4 });
      s.chain("sum", ["Versions", "Templates", "Logging", "Eval A/B", "Rollback"], { y: 525, gap: 40, w: 225, h: 145, size: 23, icons: ["branch", "code", "list", "scale", "refresh"], colors: ["blue", "teal", "gold", "green", "orange"], pulse: true }, { at: "10%", st: 0.16 });
    }}
  ]);

  // ------------------------------------------------------------------ 4.1 LangChain fundamentals
  X.lesson("4.1", [
    { sec: "مشكلة المزوّدين", say: "تبني تطبيقك على مزوّد واحد، ثم يطلب الفريق تجربة مزوّد أرخص للتصنيف وثالث للتلخيص.", do: s => {
      s.box("app", { x: 800, y: 345, w: 280, h: 96, label: "Your App", icon: "code", inline: true, color: "teal", size: 27 }, { at: "0%" });
      ["Provider A", "Provider B", "Provider C"].forEach((t, i) => {
        s.box("pv" + i, { x: 400 + i * 400, y: 655, w: 290, h: 120, label: t, sub: ["messages[]", "contents[]", "input[]"][i], color: ["purple", "blue", "orange"][i], size: 26 }, { at: (24 + i * 16) + "%" });
        s.link("lp" + i, "app", "pv" + i, { color: "red", dash: "6 6" }, { at: (30 + i * 16) + "%" });
      });
    }},
    { say: "كل مزوّد له SDK مختلف وأسماء حقول مختلفة؛ فتضطر لإعادة كتابة كود الاستدعاء في كل مكان!", do: s => {
      s.badge("e1", { text: "3× SDKs", x: 400, y: 770, color: "red", size: 21 }, { at: "18%" });
      s.badge("e2", { text: "3× message formats", x: 800, y: 770, color: "orange", size: 21 }, { at: "42%" });
      s.badge("e3", { text: "3× tool schemas", x: 1200, y: 770, color: "red", size: 21 }, { at: "66%" });
    }},
    { sec: "الواجهة الموحّدة", say: "هنا يقدّم LangChain محوّل طاقة موحّدًا فوق المزوّدين: نفس النماذج والرسائل والأدوات.", eq: "@T{App} @to @C{LangChain Interface} @to @{ @P{A}, @; @B{B}, @; @O{C} @}", do: s => {
      s.out(["lp0", "lp1", "lp2", "e1", "e2", "e3"], { at: "0%", dur: 0.35 });
      s.to("app", { y: 275, scale: 0.85 }, { at: "8%", dur: 0.5 });
      s.box("lc", { x: 800, y: 455, w: 1060, h: 102, label: "LangChain: unified chat models · messages · tools", icon: "layers", inline: true, color: "teal", size: 25 }, { at: "20%", in: "draw" });
      s.link("al", "app", "lc", { color: "teal", pulse: true }, { at: "42%" });
      [0, 1, 2].forEach(i => s.link("l" + i, "lc", "pv" + i, { color: "soft", pulse: true }, { at: (50 + i * 10) + "%" }));
    }},
    { say: "فيصبح تبديل المزوّد مجرد سطر إعدادات واحد، دون لمس منطق التطبيق أو القوالب.", eq: "@T{model} = @T{init@_chat@_model}(@O{provider})", do: s => {
      s.dot("sel", { x: 400, y: 565, r: 14, color: "gold", halo: true }, { at: "12%" });
      s.to("sel", { x: 800 }, { at: "34%", dur: 0.8 });
      s.to("sel", { x: 1200 }, { at: "62%", dur: 0.8 });
      s.pulse(["pv0", "pv1", "pv2"], { at: "24%", st: 0.45 });
    }},
    { say: "وحتى أنواع الرسائل تتوحّد عبر الجميع: SystemMessage وHumanMessage وAIMessage وToolMessage.", do: s => {
      s.clear({ dur: 0.4 });
      s.grid("mg", ["SystemMessage\ninstructions", "HumanMessage\nuser input", "AIMessage\nmodel reply", "ToolMessage\ntool result"], { cols: 4, y: 525, cw: 300, ch: 180, size: 23, colors: ["purple", "blue", "green", "orange"] }, { at: "10%", st: 0.16 });
      s.callout("un", { text: "نفس الكود يعمل على Anthropic وOpenAI وGemini ✓", x: 800, y: 725, color: "teal" }, { at: "70%" });
    }},
    { sec: "ثمن التجريد", say: "لكن لكل طبقة تجريد ثمن حقيقي: تتبع الأخطاء يصبح أعمق، والميزات الجديدة تتأخر في الدعم.", eq: "@T{abstraction} = @G{portability} - @R{visibility}", do: s => {
      s.clear({ dur: 0.4 });
      s.col("ly", ["1 · Your Application Code", "2 · LangChain Abstraction Layer", "3 · Provider Official SDK", "4 · Raw Model HTTP API"], { x: 640, y: 525, size: 25, h: 76, gap: 18, w: 540, colors: ["teal", "blue", "purple", "dim"] }, { at: "10%", st: 0.15 });
      s.box("bg", { x: 1210, y: 470, w: 380, h: 108, label: "Harder stack traces", sub: "extra wrapper layers", icon: "bug", inline: true, color: "red", size: 22 }, { at: "52%" });
      s.box("lg", { x: 1210, y: 615, w: 380, h: 108, label: "Lagging new features", sub: "SDK ships weeks earlier", icon: "clock", inline: true, color: "orange", size: 22 }, { at: "68%" });
      s.link("lb1", "ly1", "bg", { color: "red" }, { at: "50%" });
      s.link("lb2", "ly1", "lg", { color: "orange" }, { at: "66%" });
    }},
    { sec: "في الكود", say: "انظر بساطة تبديل النموذج في الكود: تغيير نص واحد يبدّل المزوّد خلف الواجهة نفسها.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("cd", { x: 800, y: 515, size: 23, title: "switch_model.py", lines: [
        "from langchain.chat_models import init_chat_model",
        "",
        "llm = init_chat_model(\"anthropic:claude-sonnet-4-5\")",
        "# Swap provider in one config line:",
        "# llm = init_chat_model(\"openai:gpt-4.1\")",
        "resp = llm.invoke(messages)"
      ] }, { at: "8%", dur: 1.5 });
      s.to("cd", { hl: 2 }, { at: "46%", dur: 0.2 });
      s.to("cd", { hl: 4 }, { at: "66%", dur: 0.2 });
      s.to("cd", { hl: 5 }, { at: "80%", dur: 0.2 });
    }},
    { sec: "متى تستخدمه؟", say: "لذا القرار عملي لا عقائدي: استخدم LangChain حين تحتاج منظومته وتعدد المزوّدين.", do: s => {
      s.clear({ dur: 0.4 });
      s.versus("vs", "Use LangChain", "Use Direct SDK", { colors: ["teal", "blue"], y: 540, h: 510 }, { at: "8%" });
      s.col("a", ["Multiple model providers", "Using LangGraph & ecosystem", "Shared tools & retrievers"], { x: 440, y: 565, size: 24, w: 460, icons: ["layers", "graph", "plug"], colors: ["teal", "teal", "teal"] }, { at: "26%", st: 0.18 });
      s.focus("vsL", { zoom: 1.08, at: "58%", dur: 0.55 });
    }},
    { say: "واستخدم الـ SDK المباشر حين تعتمد مزوّدًا واحدًا وتريد أبسط كود وأسرع وصول لميزاته الجديدة.", do: s => {
      s.unfocus({ at: "0%", dur: 0.45 });
      s.col("b", ["Single provider focus", "Day-1 access to new API features", "Lean stack & direct debugging"], { x: 1160, y: 565, size: 24, w: 460, icons: ["bolt", "sparkle", "code"], colors: ["blue", "blue", "blue"] }, { at: "18%", st: 0.18 });
      s.focus("vsR", { zoom: 1.08, at: "58%", dur: 0.55 });
      s.unfocus({ at: "82%", dur: 0.5 });
    }},
    { say: "قارن الجهد: الـ SDK المباشر أخف لمكالمة واحدة، بينما يلمع التجريد حين يكبر التطبيق وتكثر التكاملات.", do: s => {
      s.clear({ dur: 0.4 });
      s.bars("tr", [
        ["1 simple call → Direct SDK", 0.22, "blue", "minimal overhead ✓"],
        ["1 simple call → Heavy framework", 0.72, "orange", "unneeded layers ✗"],
        ["Multi-provider + Graph → LangChain", 0.35, "teal", "saves weeks ✓"]
      ], { x: 600, y: 525, w: 500, gap: 112, size: 25, h: 36 }, { at: "14%" });
    }},
    { say: "تجنّب إخفاء استدعاء واحد خلف 5 طبقات لا تفهمها؛ افهم دائمًا الـ HTTP payload الفعلي تحت الغطاء.", do: s => {
      s.clear({ dur: 0.4 });
      s.box("ms", { x: 460, y: 525, w: 500, h: 165, label: "الخطأ: تجريد أعمى بلا فهم للتحت", sub: "cannot inspect raw prompt or error", icon: "alert", color: "red", size: 22 }, { at: "14%" });
      s.box("pr", { x: 1140, y: 525, w: 500, h: 165, label: "الإنتاج: استخدمه بوعي وراقب الـ Traces", sub: "inspect exact prompts & tool payloads", icon: "eye", color: "green", size: 22 }, { at: "48%" });
      s.link("mp", "ms", "pr", { color: "green", pulse: true }, { at: "70%" });
    }},
    { sec: "الخلاصة", say: "LangChain محوّل طاقة موحّد: رائع لتعدد المزوّدين ومنظومة LangGraph، وبسيط الاستغناء عنه لمكالمة منفردة.", eq: "@T{LangChain} @; @Leftrightarrow @; @C{Ecosystem Needed} @quad @mid @quad @B{Direct SDK} @; @Leftrightarrow @; @T{Stay Lean}", do: s => {
      s.clear({ dur: 0.4 });
      s.chain("sum", ["Your App", "Right Layer\n(LangChain or SDK)", "Inspect Traces", "Model API"], { y: 525, gap: 56, w: 265, h: 150, size: 23, icons: ["code", "layers", "eye", "cloud"], colors: ["teal", "gold", "green", "purple"], pulse: true }, { at: "10%", st: 0.18 });
    }}
  ]);

  /* __PART2__ */
})();
