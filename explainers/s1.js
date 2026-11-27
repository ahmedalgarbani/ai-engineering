// Motion explainers — Stage 1: the AI engineer, tokens & context, start simple, augmented LLM, model docs
(function () {
  const X = window.Explainer;

  // ------------------------------------------------------------------ 1.1 What the AI engineer builds
  X.lesson("1.1", [
    { sec: "المنتج حول النموذج", say: "تخيّل عميلًا يسأل عن استرداد طلبه، فتُرسِل سؤاله إلى نموذج لغة وحده.", do: s => {
      s.bubble("q", { text: "Where is my refund for order #812?", side: "u", x: 380, y: 500, w: 410, size: 24 }, { at: "0%" });
      s.box("m", { x: 840, y: 500, w: 220, h: 155, label: "Model", sub: "raw LLM", icon: "brain", color: "purple", size: 28 }, { at: "25%" });
      s.link("lq", "q", "m", { color: "blue", pulse: true }, { at: "35%" });
      s.bubble("bad", { text: "Sure! Refunds are allowed within 90 days.", side: "a", x: 1270, y: 500, w: 380, size: 23, color: "red" }, { at: "62%" });
      s.link("lb", "m", "bad", { color: "red" }, { at: "58%" });
      s.mark("bx", "bad", "x", { at: "82%" });
    }},
    { say: "النموذج وحده محرّك قوي، لكنه بلا بياناتك ولا أدواتك ولا تقييم يضبطه.", eq: "@P{model alone} @neq @C{product}", do: s => {
      s.focus("m", { zoom: 1.14, at: "0%", dur: 0.7 });
      s.badge("n1", { text: "لا يرى الطلبات", x: 560, y: 710, color: "red", size: 22 }, { at: "28%" });
      s.badge("n2", { text: "لا ينفّذ إجراءات", x: 840, y: 710, color: "orange", size: 22 }, { at: "52%" });
      s.badge("n3", { text: "لا يقيس الدقة", x: 1120, y: 710, color: "gold", size: 22 }, { at: "74%" });
    }},
    { say: "لذلك يبني مهندس AI الطبقة حوله: الواجهة، والبيانات، والأدوات، والتقييم.", eq: "@T{product} = @P{model} + @B{UI} + @Y{data} + @O{tools} + @G{evals}", do: s => {
      s.out(["q", "lq", "bad", "lb", "bx", "n1", "n2", "n3"], { at: "0%", dur: 0.4 });
      s.unfocus({ at: "0%", dur: 0.6 });
      s.to("m", { x: 800, y: 535, sub: "core engine" }, { at: "10%", dur: 0.6 });
      s.hub("m", "h", ["UI", "data", "tools", "evals"], { r: 340, ry: 220, a0: -90, icons: ["browser", "db", "tool", "chart"], colors: ["blue", "gold", "orange", "green"], w: 220, h: 78, inline: true, size: 26, ac: "teal", pulse: true }, { at: "24%", st: 0.16 });
      s.zone("prod", { x: 800, y: 535, w: 1080, h: 610, label: "the product you build", color: "teal" }, { at: "62%" });
      s.stream("h1", "m", { at: "68%", span: 1.8, every: 0.55, color: "gold" });
      s.stream("m", "h2", { at: "74%", span: 1.8, every: 0.55, color: "orange" });
    }},
    { sec: "ثلاثة أشكال", say: "وأهم قرار معماري عندك: أي شكل من ثلاثة أشكال يناسب المشكلة؟", do: s => {
      s.clear({ dur: 0.4 });
      s.zone("f", { x: 320, y: 555, w: 420, h: 520, label: "1 · Feature", color: "green", lc: "green" }, { at: "12%" });
      s.zone("w", { x: 800, y: 555, w: 420, h: 520, label: "2 · Workflow", color: "blue", lc: "blue" }, { at: "34%" });
      s.zone("a", { x: 1280, y: 555, w: 420, h: 520, label: "3 · Agent", color: "purple", lc: "purple" }, { at: "56%" });
      s.callout("ch", { text: "اختر أبسط شكل يحل المهمة", x: 800, y: 245, color: "gold" }, { at: "76%" });
    }},
    { say: "الميزة Feature: استدعاء نموذج واحد داخل المنتج، مثل تلخيص أو تصنيف تذكرة.", eq: "@G{feature}: @; y = @T{LLM}(x)", do: s => {
      s.out("ch", { at: "0%", dur: 0.3 });
      s.focus("f", { zoom: 1.16, at: "4%", dur: 0.65 });
      s.box("fin", { x: 320, y: 405, w: 230, h: 64, label: "ticket text", color: "soft", size: 23 }, { at: "20%" });
      s.box("f1", { x: 320, y: 555, w: 250, h: 82, label: "summarize", icon: "sparkle", inline: true, color: "green", size: 25 }, { at: "38%" });
      s.box("fout", { x: 320, y: 705, w: 230, h: 64, label: "2-line summary", color: "green", size: 22 }, { at: "56%" });
      s.link("fl1", "fin", "f1", { color: "dim", pulse: true }, { at: "42%" });
      s.link("fl2", "f1", "fout", { color: "green", pulse: true }, { at: "60%" });
      s.stream("fin", "fout", { at: "68%", span: 1.6, every: 0.5, color: "green" });
    }},
    { say: "سير العمل Workflow: عدة خطوات مرتبة على مسار معروف ومحدد مسبقًا.", eq: "@B{workflow}: @; y = f_3(f_2(f_1(x)))", do: s => {
      s.focus("w", { zoom: 1.16, at: "0%", dur: 0.65 });
      s.chain("w", ["extract order", "check policy", "draft reply"], { x: 800, y: 560, vertical: true, gap: 46, h: 74, w: 270, size: 24, colors: ["blue", "gold", "teal"], pulse: true }, { at: "22%", st: 0.24 });
      s.stream("w0", "w2", { at: "66%", span: 1.8, every: 0.55, color: "blue" });
    }},
    { say: "والوكيل Agent: حلقة يختار فيها النموذج خطواته وأدواته بنفسه حسب النتيجة.", eq: "@P{agent}: @; @T{LLM} @leftrightarrow @O{tools} @; (@T{loop})", do: s => {
      s.focus("a", { zoom: 1.16, at: "0%", dur: 0.65 });
      s.ring("ar", { x: 1280, y: 570, r: 138, color: "purple", arrows: 3, speed: 24 }, { at: "18%" });
      s.box("ac", { x: 1280, y: 570, w: 148, h: 72, label: "LLM", icon: "brain", inline: true, color: "purple", size: 26 }, { at: "30%" });
      s.badge("at1", { text: "orders", x: 1280, y: 405, color: "orange", size: 20 }, { at: "46%" });
      s.badge("at2", { text: "policy", x: 1175, y: 730, color: "gold", size: 20 }, { at: "56%" });
      s.badge("at3", { text: "refund", x: 1385, y: 730, color: "teal", size: 20 }, { at: "64%" });
      s.unfocus({ at: "80%", dur: 0.7 });
    }},
    { sec: "الفرق بين الأدوار", say: "قارن الدورين: مهندس ML يبني محرّك الطائرة عبر البيانات والـ GPUs والأوزان.", do: s => {
      s.clear({ dur: 0.4 });
      s.versus("vs", "ML Engineer", "AI Engineer", { colors: ["orange", "teal"], y: 545, h: 520 }, { at: "8%" });
      s.badge("mb", { text: "يبني المحرّك", x: 440, y: 365, color: "orange", size: 23 }, { at: "26%" });
      s.col("ml", ["training datasets", "GPU clusters & training", "model weights & serving"], { x: 440, y: 575, size: 25, icons: ["db", "cpu", "save"], colors: ["orange", "orange", "orange"], w: 460 }, { at: "38%", st: 0.22 });
    }},
    { say: "ومهندس AI يصمّم الطائرة كاملة: واجهات وأوامر وRAG وأدوات وتقييم وأمان.", do: s => {
      s.badge("ab", { text: "يصمّم الطائرة للركّاب", x: 1160, y: 365, color: "teal", size: 23 }, { at: "14%" });
      s.col("ai", ["Model APIs & prompts", "RAG, tools & workflows", "evals, UX & guardrails"], { x: 1160, y: 575, size: 25, icons: ["code", "tool", "shieldok"], colors: ["teal", "teal", "teal"], w: 460 }, { at: "28%", st: 0.22 });
      s.link("hand", "ml2", "ai0", { color: "gold", label: "API", lc: "gold", pulse: true }, { at: "68%" });
      s.stream("ml2", "ai0", { at: "74%", span: 1.5, every: 0.45, color: "gold" });
    }},
    { sec: "الخطأ الصامت", say: "وفي الإنتاج، قد يعيد الخادم HTTP 200 بلا أي خطأ، بينما الإجابة خاطئة تمامًا.", eq: "@T{HTTP 200} @; @neq @; @G{correct answer}", do: s => {
      s.clear({ dur: 0.4 });
      s.code("log", { x: 500, y: 530, size: 22, title: "server.log", lines: ["POST /api/reply  200 OK", "latency: 812 ms", "tokens: 412 in / 86 out", "exceptions: 0"] }, { at: "12%", dur: 1.4 });
      s.to("log", { hl: 0 }, { at: "42%", dur: 0.2 });
      s.to("log", { hl: 3 }, { at: "58%", dur: 0.2 });
      s.bubble("wr", { text: "Refunds are open for 90 days on all items!", side: "a", x: 1150, y: 480, w: 430, color: "red", size: 24 }, { at: "46%" });
      s.mark("wx", "wr", "x", { at: "66%" });
      s.callout("pol", { text: "السياسة الفعلية: 14 يومًا فقط!", x: 1150, y: 655, color: "orange" }, { at: "75%" });
    }},
    { say: "الخطأ الشائع هو الاكتفاء بسجلات الخادم؛ والقاعدة الإنتاجية هي قياس الجودة بالتقييمات.", do: s => {
      s.to(["log", "wr", "wx", "pol"], { opacity: 0.22 }, { at: "0%", dur: 0.45 });
      s.box("badp", { x: 460, y: 540, w: 480, h: 170, label: "الخطأ: مراقبة 200 OK فقط", sub: "silent wrong answers reach users", icon: "alert", color: "red", size: 24 }, { at: "16%" });
      s.box("okp", { x: 1140, y: 540, w: 500, h: 170, label: "الإنتاج: Evals آلية قبل النشر", sub: "96% grounded · 0 invented policies", icon: "shieldok", color: "green", size: 24 }, { at: "48%" });
      s.link("fix", "badp", "okp", { color: "green", label: "upgrade", lc: "green", pulse: true }, { at: "68%" });
    }},
    { sec: "الخلاصة", say: "إذن مهندس AI يملك أربع مسؤوليات: الجودة، والتكلفة، والسرعة، والأمان، ويقيسها باستمرار.", eq: "@T{AI Engineer} = @Y{quality} + @G{cost} + @B{latency} + @R{safety}", do: s => {
      s.clear({ dur: 0.4 });
      s.grid("rs", ["Quality\nEvals ≥ 95%", "Cost\nToken budget", "Latency\nStreaming & TTFT", "Safety\nGuardrails"], { cols: 4, y: 515, cw: 300, ch: 210, size: 24, icons: ["star", "coin", "clock", "shieldok"], colors: ["gold", "green", "blue", "red"] }, { at: "14%", st: 0.16 });
      s.callout("gold", { text: "ابدأ بأبسط شكل، وقِس دائمًا بالتقييمات", x: 800, y: 745, color: "teal", icon: "target" }, { at: "68%" });
    }}
  ]);

  // ------------------------------------------------------------------ 1.2 Tokens and context windows
  X.lesson("1.2", [
    { sec: "الـ Tokens", say: "كل حرف يقرؤه النموذج أو يكتبه يُقطّع أولًا إلى وحدات تسمّى Tokens.", do: s => {
      s.text("sent", { text: "Where is my order #812?", x: 800, y: 365, size: 54 }, { at: "0%", in: "type", dur: 1.0 });
      s.row("tk", ["Where", " is", " my", " order", " #", "812", "?"], { y: 525, size: 34, colors: ["blue", "teal", "gold", "purple", "orange", "cyan", "green"] }, { at: "34%", st: 0.08 });
      s.badge("cnt", { text: "7 tokens", x: 580, y: 665, color: "gold", size: 24 }, { at: "68%" });
      s.callout("ar", { text: "العربية تستهلك غالبًا 1.5–2× Tokens", x: 1000, y: 665, color: "orange" }, { at: "78%" });
    }},
    { say: "ونافذة السياق Context Window هي أقصى سعة من الـ Tokens في طلب واحد.", eq: "@T{context window} = 128@,000 @; @T{tokens}", do: s => {
      s.out(["sent", "tk*", "cnt", "ar"], { at: "0%", dur: 0.4 });
      s.box("win", { x: 800, y: 520, w: 1260, h: 124, label: "", color: "soft", fill: "panel", fop: 0.55, r: 12 }, { at: "20%", in: "draw", dur: 0.9 });
      s.brace("br", { x1: 170, x2: 1430, y: 602, label: "max tokens per single API request", color: "teal" }, { at: "52%" });
      s.num("cap", { v: 0, x: 800, y: 390, size: 46, color: "gold", suf: " tokens" }, { at: "40%" });
      s.to("cap", { v: 128000 }, { at: "45%", dur: 1.4 });
    }},
    { sec: "تقسيم النافذة", say: "هذه النافذة تتسع لكل شيء معًا: التعليمات، والسجل، والمستندات، والسؤال، والإجابة.", eq: "@P{system} + @B{history} + @Y{docs} + @C{question} + @G{answer} @le @T{window}", do: s => {
      s.out("cap", { at: "0%", dur: 0.3 });
      const seg = [["system", 160, "purple"], ["history", 320, "blue"], ["docs", 380, "gold"], ["question", 140, "teal"], ["answer", 240, "green"]];
      let x = 180;
      seg.forEach(([l, w, c], i) => {
        s.box("sg" + i, { x: x + w / 2, y: 520, w: w - 8, h: 98, label: l, size: 23, color: c, fill: "panel" }, { at: (12 + i * 14) + "%", in: "grow" });
        x += w;
      });
    }},
    { say: "المشكلة؟ مع طول المحادثة يتضخّم السجل فيزاحم المستندات ويطرد الإجابة خارج الحد.", do: s => {
      s.to("sg1", { w: 560, x: 620 }, { at: "10%", dur: 1.3 });
      s.to("sg2", { x: 1094 }, { at: "10%", dur: 1.3 });
      s.to("sg3", { x: 1356 }, { at: "10%", dur: 1.3 });
      s.to("sg4", { x: 1510, w: 150, stroke: "red" }, { at: "10%", dur: 1.3 });
      s.to("win", { stroke: "red" }, { at: "55%", dur: 0.4 });
      s.badge("ov", { text: "OVERFLOW!", x: 1465, y: 405, color: "red", size: 23 }, { at: "62%" });
      s.callout("ovm", { text: "الطلب يفشل أو تضيع التعليمات!", x: 800, y: 745, color: "red", icon: "alert" }, { at: "74%" });
    }},
    { say: "الحل الهندسي: لخّص الأدوار القديمة أو قلّصها، أو استرجع منها المهم فقط.", do: s => {
      s.out(["ov", "ovm"], { at: "0%", dur: 0.3 });
      s.focus("sg1", { zoom: 1.12, at: "8%", dur: 0.5 });
      s.to("sg1", { w: 190, x: 435, label: "summary", stroke: "green" }, { at: "28%", dur: 1.0 });
      s.to("sg2", { x: 724 }, { at: "30%", dur: 1.0 });
      s.to("sg3", { x: 988 }, { at: "30%", dur: 1.0 });
      s.to("sg4", { x: 1182, w: 240, stroke: "green" }, { at: "30%", dur: 1.0 });
      s.to("win", { stroke: "teal" }, { at: "58%", dur: 0.4 });
      s.unfocus({ at: "65%", dur: 0.6 });
      s.callout("okw", { text: "مساحة مريحة للإجابة بأقل تكلفة", x: 800, y: 745, color: "green", icon: "check" }, { at: "76%" });
    }},
    { sec: "التوقف والحرارة", say: "وراقب دائمًا سبب التوقف؛ فالتوقف عند max_tokens يعني أن الإجابة انقطعت قبل اكتمالها.", eq: "@T{stop@_reason} = @R{max@_tokens}", do: s => {
      s.clear({ dur: 0.4 });
      s.bubble("cut", { text: "To process your refund for order #812, please open the billing page and click", side: "a", x: 800, y: 430, w: 780, size: 27, color: "red" }, { at: "10%", in: "type", dur: 1.5 });
      s.badge("bmax", { text: "stop_reason: max_tokens  ✗", x: 560, y: 615, color: "red", size: 24 }, { at: "54%" });
      s.badge("bend", { text: "stop_reason: end_turn  ✓", x: 1060, y: 615, color: "green", size: 24 }, { at: "74%" });
      s.callout("cn", { text: "قد يقطع JSON في المنتصف ويكسر تطبيقك!", x: 800, y: 740, color: "orange" }, { at: "80%" });
    }},
    { say: "أما معامل Temperature فيضبط التوزيع الاحتمالي: عند الصفر يختار النموذج الأرجح بثبات.", eq: "p_i = softmax(z_i / @O{T})", do: s => {
      s.clear({ dur: 0.4 });
      s.bars("t", [["refund", 0.46], ["return", 0.28], ["exchange", 0.16], ["gift", 0.10]], { x: 560, y: 530, w: 470, gap: 68, size: 28, color: "teal", pct: true }, { at: "8%" });
      s.num("T", { v: 0.7, x: 1280, y: 420, size: 46, color: "orange", dec: 1, pre: "T = " }, { at: "14%" });
      s.to("T", { v: 0.0, color: "green" }, { at: "42%", dur: 1.0 });
      [0.96, 0.04, 0.0, 0.0].forEach((v, i) => s.to("t" + i, { v, color: i === 0 ? "green" : "dim" }, { at: "44%", dur: 1.0 }));
      s.callout("low", { text: "T ≈ 0  للاستخراج والتصنيف والدقة", x: 1250, y: 580, color: "green" }, { at: "70%" });
    }},
    { say: "ومع رفع Temperature يتسطّح التوزيع وتزيد الخيارات الإبداعية المتنوّعة.", do: s => {
      s.out("low", { at: "0%", dur: 0.3 });
      s.to("T", { v: 1.2, color: "purple" }, { at: "15%", dur: 1.0 });
      [0.31, 0.27, 0.23, 0.19].forEach((v, i) => s.to("t" + i, { v, color: "purple" }, { at: "18%", dur: 1.0 }));
      s.callout("hi", { text: "T ≈ 0.8–1.2  للكتابة والعصف الذهني", x: 1250, y: 580, color: "purple" }, { at: "58%" });
      s.badge("rng", { text: "اختر T حسب طبيعة المهمة", x: 1250, y: 690, color: "gold", size: 22 }, { at: "76%" });
    }},
    { sec: "حدود المعرفة", say: "وتذكّر أن معرفة النموذج تتوقف عند تاريخ تدريبه، ولا يعلم ما استجد بعده إلا داخل السياق.", eq: "@T{fresh facts} @in @Y{context}", do: s => {
      s.clear({ dur: 0.4 });
      s.arrow("tl", { x1: 240, y1: 440, x2: 1360, y2: 440, color: "soft", w: 3 }, { at: "8%" });
      s.zone("kn", { x: 560, y: 440, w: 600, h: 120, label: "training data", color: "blue" }, { at: "16%" });
      s.line("cut", { x1: 900, y1: 335, x2: 900, y2: 545, color: "red", dash: "8 8", w: 3.5 }, { at: "28%" });
      s.badge("cl", { text: "Knowledge Cutoff", x: 900, y: 300, color: "red", size: 21 }, { at: "32%" });
      s.doc("news", { x: 1180, y: 440, w: 92, h: 115, color: "gold", title: "today's policy" }, { at: "46%" });
      s.box("ctx", { x: 800, y: 715, w: 680, h: 108, label: "prompt context", color: "teal", fop: 0.35, size: 26 }, { at: "58%" });
      s.to("news", { x: 1030, y: 715, scale: 0.65 }, { at: "68%", dur: 0.9 });
      s.callout("okc", { text: "الآن يستطيع الإجابة بدقة ✓", x: 580, y: 715, color: "green" }, { at: "82%" });
    }},
    { sec: "في الكود", say: "في الكود، نتحقق من ميزانية الـ Tokens قبل الإرسال، ونلخّص السجل تلقائيًا عند الاقتراب من الحد.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("cd", { x: 800, y: 500, size: 25, title: "context_budget.py", lines: ["MAX_CTX = 128_000", "used = count_tokens(system + history + docs + question)", "if used + 1024 > MAX_CTX:", "    history = summarize_old_turns(history)", "resp = call_llm(system, history, docs, question)"] }, { at: "8%", dur: 1.5 });
      s.to("cd", { hl: 1 }, { at: "44%", dur: 0.2 });
      s.to("cd", { hl: 2 }, { at: "62%", dur: 0.2 });
      s.to("cd", { hl: 3 }, { at: "78%", dur: 0.2 });
    }},
    { say: "لا تُرسل السجل كاملًا للأبد ولا تتجاهل stop_reason؛ بل اضبط الميزانية وراقب كل رد.", do: s => {
      s.to("cd", { y: 360, scale: 0.72, hl: -1 }, { at: "0%", dur: 0.55 });
      s.box("mist", { x: 460, y: 690, w: 500, h: 145, label: "الخطأ: سجل غير محدود + تجاهل القطع", sub: "unbounded history · blind parsing", icon: "alert", color: "red", size: 22 }, { at: "26%" });
      s.box("best", { x: 1140, y: 690, w: 500, h: 145, label: "الإنتاج: فحص الميزانية + stop_reason", sub: "reserve output headroom · summarize", icon: "shieldok", color: "green", size: 22 }, { at: "56%" });
      s.link("mb", "mist", "best", { color: "green", pulse: true }, { at: "74%" });
    }},
    { sec: "الخلاصة", say: "خلاصة الدرس: احسب الـ Tokens، واضبط Temperature، وزوّد النموذج بالحديث، وافحص سبب التوقف.", eq: "@T{reliable call} = @B{budget} + @O{T} + @Y{fresh context} + @G{stop@_reason}", do: s => {
      s.clear({ dur: 0.4 });
      s.grid("sm", ["Context Budget\nSummarize old turns", "Stop Reason\nCheck max_tokens", "Temperature\n0 accurate · 1 creative", "Cutoff\nInject fresh docs"], { cols: 4, y: 530, cw: 305, ch: 210, size: 23, icons: ["layers", "flag", "gauge", "docs"], colors: ["blue", "red", "orange", "gold"] }, { at: "14%", st: 0.16 });
    }}
  ]);

  // ------------------------------------------------------------------ A1.1 Start with the simplest thing
  X.lesson("A1.1", [
    { sec: "فخ التعقيد", say: "لديك مهمة واضحة: تصنيف تذكرة عميل وصياغة رد من سياسة الاسترداد. فيقفز البعض فورًا لبناء وكيل معقد!", do: s => {
      s.box("tk", { x: 310, y: 520, w: 280, h: 150, label: "Support Ticket", sub: "classify + draft reply", icon: "inbox", color: "blue", size: 24 }, { at: "0%" });
      s.zone("sw", { x: 1030, y: 520, w: 720, h: 430, label: "5-Agent Swarm (Overkill)", color: "red", lc: "red" }, { at: "28%" });
      ["Planner", "Researcher", "Writer", "Critic", "Manager"].forEach((t, i) => {
        const x = 800 + (i % 3) * 230 + (i >= 3 ? 115 : 0), y = i < 3 ? 445 : 610;
        s.box("ag" + i, { x, y, w: 185, h: 76, label: t, icon: "bot", inline: true, color: "purple", size: 21 }, { at: (36 + i * 6) + "%" });
      });
      s.link("lt", "tk", "ag0", { color: "red", pulse: true }, { at: "60%" });
      s.badge("ov", { text: "تعقيد بلا داعٍ!", x: 1030, y: 790, color: "red", size: 23 }, { at: "78%" });
    }},
    { say: "النتيجة؟ زمن انتظار يتجاوز 14 ثانية، وتكلفة مضاعفة، وأخطاء عشوائية يصعب اختبارها.", do: s => {
      s.focus("sw", { zoom: 1.08, at: "0%", dur: 0.55 });
      s.to("ag*", { stroke: "red" }, { at: "15%", dur: 0.5, st: 0.06 });
      s.stream("ag0", "ag4", { at: "18%", span: 1.8, every: 0.4, color: "red" });
      s.stream("ag4", "ag1", { at: "26%", span: 1.8, every: 0.4, color: "orange" });
      s.badge("m1", { text: "Latency: 14.2 s", x: 310, y: 330, color: "red", size: 22 }, { at: "34%" });
      s.badge("m2", { text: "Cost: 8× higher", x: 310, y: 690, color: "orange", size: 22 }, { at: "54%" });
      s.badge("m3", { text: "Flaky tests ✗", x: 310, y: 760, color: "red", size: 22 }, { at: "74%" });
    }},
    { sec: "سلّم التعقيد", say: "توصي Anthropic بسلّم واضح: ابدأ من أدنى درجة، ولا تصعد إلا بدليل.", do: s => {
      s.clear({ dur: 0.4 });
      s.chain("st", ["3 · Agent (open loop)", "2 · Workflow (fixed steps)", "1 · Single Call + RAG"], { x: 460, y: 535, vertical: true, gap: 48, w: 430, h: 106, size: 25, colors: ["purple", "blue", "green"] }, { at: "12%", st: 0.22 });
      s.to(["st0", "st1", "st_0", "st_1"], { opacity: 0.25 }, { at: "65%", dur: 0.45 });
      s.pulse("st2", { at: "72%", glow: 1, keep: true, color: "green" });
    }},
    { say: "الدرجة الأولى: استدعاء واحد بأمر متقن مع استرجاع المستندات؛ سريع ورخيص وسهل الاختبار.", eq: "@G{level 1}: @; y = @T{LLM}(@T{prompt} + @Y{retrieved docs})", do: s => {
      s.mark("ok2", "st2", "check", { at: "14%" });
      s.box("d1", { x: 1120, y: 535, w: 540, h: 170, label: "ticket + policy → 1 LLM call", sub: "0.9 s  ·  $0.002  ·  easy to eval", icon: "bolt", color: "green", size: 24 }, { at: "26%" });
      s.link("ld1", "st2", "d1", { color: "green", pulse: true }, { at: "40%" });
      s.stream("st2", "d1", { at: "52%", span: 1.6, every: 0.5, color: "green" });
    }},
    { say: "فإن احتجت عدة خطوات معروفة مسبقًا، اصعد إلى سير عمل Workflow بمسار محدد.", eq: "@T{known steps} @Rightarrow @B{workflow}", do: s => {
      s.out(["d1", "ld1"], { at: "0%", dur: 0.35 });
      s.to("st2", { glow: 0 }, { at: "5%", dur: 0.3 });
      s.to(["st1", "st_1"], { opacity: 1 }, { at: "12%", dur: 0.4 });
      s.pulse("st1", { at: "22%", glow: 1, keep: true, color: "blue" });
      s.chain("wf", ["classify", "retrieve", "draft"], { x: 1140, y: 535, gap: 46, w: 165, h: 92, size: 22, colors: ["blue", "gold", "teal"], pulse: true }, { at: "34%", st: 0.18 });
      s.note("wfn", { text: "2.1 s  ·  $0.006  ·  deterministic path", x: 1140, y: 650, color: "blue", font: "math", size: 23 }, { at: "74%" });
    }},
    { say: "واستخدم وكيلًا Agent فقط عندما يستحيل توقّع عدد الخطوات أو ترتيبها مسبقًا.", eq: "@T{unpredictable path} @Rightarrow @P{agent}", do: s => {
      s.out(["wf*", "wfn"], { at: "0%", dur: 0.35 });
      s.to("st1", { glow: 0 }, { at: "5%", dur: 0.3 });
      s.to(["st0", "st_0"], { opacity: 1 }, { at: "12%", dur: 0.4 });
      s.pulse("st0", { at: "22%", glow: 1, keep: true, color: "purple" });
      s.ring("ag", { x: 1140, y: 525, r: 125, color: "purple", arrows: 3, speed: 26 }, { at: "34%" });
      s.box("agc", { x: 1140, y: 525, w: 170, h: 74, label: "fix bug", icon: "terminal", inline: true, color: "purple", size: 23 }, { at: "42%" });
      s.note("agn", { text: "read → edit → run tests → repeat", x: 1140, y: 710, color: "purple", font: "math", size: 23 }, { at: "68%" });
    }},
    { sec: "ثمن كل درجة", say: "تذكّر أن كل درجة للأعلى تضيف زمن استجابة وتكلفة وتعقيدًا في الاختبار والتتبّع.", eq: "@T{latency}, @; @T{cost}, @; @T{testing effort} @nearrow", do: s => {
      s.out(["ag", "agc", "agn"], { at: "0%", dur: 0.35 });
      s.to("st0", { glow: 0 }, { at: "5%", dur: 0.3 });
      [[0.88, "purple", "$$$ · slow · hard evals"], [0.48, "blue", "$$ · steady"], [0.18, "green", "$ · fast"]].forEach(([v, c, val], i) => {
        s.bar("cb" + i, { x: 760, y: s.get("st" + i).y, w: 470, v, color: c, label: "", val, size: 24, h: 30 }, { at: (18 + i * 20) + "%" });
      });
    }},
    { say: "وأحيانًا أفضل قرار هندسي هو ألا تبني نظامًا وكيليًا أصلًا لأن الأبسط يكفي.", do: s => {
      s.to(["st0", "st_0", "cb0"], { opacity: 0.25 }, { at: "12%", dur: 0.5 });
      s.pulse(["st2", "st1"], { at: "35%", color: "green", glow: 1, keep: true });
      s.callout("en", { text: "معظم الميزات الإنتاجية تنجح في الدرجة 1 أو 2 ✓", x: 800, y: 790, color: "green", icon: "check" }, { at: "60%" });
    }},
    { sec: "القياس أولًا", say: "اصعد درجة فقط إذا أثبتت التقييمات تحسنًا ملموسًا يستحق التكلفة الإضافية.", eq: "@T{climb only if} @; @Delta @T{eval} @; @T{justifies cost}", do: s => {
      s.clear({ dur: 0.4 });
      s.bars("ev", [
        ["Single call + RAG", 0.78, "green", "78%  ($0.002)"],
        ["Workflow (3 steps)", 0.90, "blue", "90%  ↑ +12% worth it!"],
        ["Full Agent loop", 0.91, "purple", "91%  (+1% at 5× cost ✗)"]
      ], { x: 560, y: 525, w: 540, gap: 112, size: 27, h: 38 }, { at: "14%" });
      s.pulse("ev1", { at: "74%", color: "blue" });
    }},
    { say: "هذا هو قرار التصميم كخطوات واضحة في الكود: قِس البسيط، ثم قرر بالأرقام.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("dec", { x: 800, y: 515, size: 24, title: "architecture_choice.py", lines: [
        "score_1 = eval_single_call_with_rag(test_set)",
        "if score_1 >= TARGET: return 'single_call'",
        "score_2 = eval_fixed_workflow(test_set)",
        "if steps_are_predictable: return 'workflow'",
        "return 'agent'  # only if open-ended + delta > cost"
      ] }, { at: "8%", dur: 1.5 });
      [0, 1, 3, 4].forEach((h, i) => s.to("dec", { hl: h }, { at: (42 + i * 13) + "%", dur: 0.2 }));
    }},
    { say: "تجنّب بناء وكيل لأنها الموضة؛ القاعدة الإنتاجية هي: ابدأ بالأبسط، وتدرّج بالقياس.", do: s => {
      s.to("dec", { y: 345, scale: 0.72, hl: -1 }, { at: "0%", dur: 0.55 });
      s.box("ms", { x: 460, y: 690, w: 500, h: 140, label: "الخطأ: بدء المشروع بوكيل معقد", sub: "high cost · unpredictable loops", icon: "alert", color: "red", size: 23 }, { at: "24%" });
      s.box("pr", { x: 1140, y: 690, w: 500, h: 140, label: "الإنتاج: أبسط حل + تقييم للترقية", sub: "single call → workflow → agent", icon: "shieldok", color: "green", size: 23 }, { at: "54%" });
      s.link("mp", "ms", "pr", { color: "green", pulse: true }, { at: "74%" });
    }},
    { sec: "الخلاصة", say: "إذن تدرّج بذكاء: استدعاء واحد، ثم سير عمل، ثم وكيل عند الحاجة المثبتة فقط.", eq: "@G{Single Call} @to @B{Workflow} @to @P{Agent}", do: s => {
      s.clear({ dur: 0.4 });
      s.chain("sum", ["Single Call + RAG", "Fixed Workflow", "Autonomous Agent"], { y: 495, gap: 85, w: 320, h: 145, size: 25, icons: ["bolt", "route", "bot"], colors: ["green", "blue", "purple"], pulse: true }, { at: "12%", st: 0.22 });
      s.callout("pin", { text: "ابدأ من هنا دائمًا، واصعد فقط عندما تثبت الأرقام الحاجة", x: 800, y: 715, color: "gold", icon: "target" }, { at: "68%" });
    }}
  ]);

  // ------------------------------------------------------------------ A1.2 The augmented LLM
  X.lesson("A1.2", [
    { sec: "النموذج وحده", say: "عميل يطلب: أجّل شحن طلبي 812 للخميس، وتذكّر أنني أفضل الإشعارات بالبريد.", do: s => {
      s.bubble("q", { text: "Move order #812 to Thursday, and remember I prefer email.", side: "u", x: 410, y: 520, w: 440, size: 24 }, { at: "0%" });
      s.box("m", { x: 960, y: 520, w: 230, h: 165, label: "LLM", sub: "bare model", icon: "brain", color: "purple", size: 30 }, { at: "26%" });
      s.link("lq", "q", "m", { color: "blue", pulse: true }, { at: "40%" });
      s.stream("q", "m", { at: "48%", span: 1.6, every: 0.5, color: "blue" });
    }},
    { say: "النموذج المجرد يعجز عن الثلاثة: لا يعرف الطلب، ولا يعدّل الشحن، وينسى تفضيلك غدًا.", do: s => {
      s.out(["q", "lq"], { at: "0%", dur: 0.35 });
      s.to("m", { x: 800, y: 530 }, { at: "10%", dur: 0.6 });
      s.badge("e1", { text: "لا يعرف بيانات الطلب ✗", x: 370, y: 365, color: "red", size: 22 }, { at: "26%" });
      s.badge("e2", { text: "لا يستطيع تعديل الشحن ✗", x: 1230, y: 365, color: "red", size: 22 }, { at: "48%" });
      s.badge("e3", { text: "ينسى التفضيل في الجلسة التالية ✗", x: 800, y: 755, color: "red", size: 22 }, { at: "70%" });
    }},
    { sec: "اللبنة المعزّزة", say: "لذا نبني اللبنة الأساسية لكل نظام وكيلي: نموذج لغة معزَّز بثلاث قدرات.", eq: "@T{augmented LLM} = @P{LLM} + @Y{retrieval} + @O{tools} + @B{memory}", do: s => {
      s.out(["e1", "e2", "e3"], { at: "0%", dur: 0.35 });
      s.to("m", { sub: "reasoning core" }, { at: "14%", dur: 0.4 });
      s.pulse("m", { at: "24%", glow: 1, keep: true, color: "purple" });
      s.zone("unit", { x: 800, y: 540, w: 1280, h: 610, label: "Augmented LLM", color: "teal" }, { at: "45%" });
    }},
    { say: "أولًا: الاسترجاع Retrieval يجلب سياسات الشحن وبيانات الطلب التي لا يملكها النموذج.", do: s => {
      s.box("ret", { x: 360, y: 365, w: 280, h: 92, label: "Retrieval", sub: "query(q) → docs", icon: "search", inline: true, color: "gold", size: 26 }, { at: "12%" });
      s.link("lr", "ret", "m", { color: "gold", label: "order #812", lc: "gold", pulse: true }, { at: "28%" });
      s.focus(["ret", "m", "lr"], { zoom: 1.12, at: "34%", dur: 0.6 });
      s.stream("ret", "m", { at: "48%", span: 1.8, every: 0.5, color: "gold" });
    }},
    { say: "ثانيًا: الأدوات Tools تُمكّنه من تنفيذ التعديل والتحقق من نجاحه فعليًا.", do: s => {
      s.unfocus({ at: "0%", dur: 0.45 });
      s.box("tl", { x: 1240, y: 365, w: 280, h: 92, label: "Tools", sub: "call(name, args)", icon: "tool", inline: true, color: "orange", size: 26 }, { at: "16%" });
      s.link("lt", "m", "tl", { color: "orange", tail: true, label: "reschedule()", lc: "orange", pulse: true }, { at: "30%" });
      s.focus(["tl", "m", "lt"], { zoom: 1.12, at: "36%", dur: 0.6 });
      s.flow("m", "tl", { color: "orange", at: "52%" });
      s.flow("tl", "m", { color: "green", at: "74%" });
    }},
    { say: "ثالثًا: الذاكرة Memory تحفظ تفضيل البريد وتنقله عبر الأدوار والجلسات اللاحقة.", do: s => {
      s.unfocus({ at: "0%", dur: 0.45 });
      s.box("mem", { x: 800, y: 745, w: 280, h: 90, label: "Memory", sub: "read / write", icon: "chip", inline: true, color: "blue", size: 26 }, { at: "14%" });
      s.link("lm", "m", "mem", { color: "blue", tail: true, pulse: true }, { at: "26%" });
      s.box("s1", { x: 360, y: 745, w: 210, h: 66, label: "session 1", color: "dim", size: 22 }, { at: "44%" });
      s.box("s2", { x: 1240, y: 745, w: 210, h: 66, label: "session 2", color: "teal", size: 22 }, { at: "56%" });
      s.link("ls1", "s1", "mem", { color: "dim", pulse: true }, { at: "50%" });
      s.link("ls2", "mem", "s2", { color: "teal", pulse: true }, { at: "62%" });
      s.focus(["mem", "m", "s1", "s2", "lm", "ls1", "ls2"], { zoom: 1.08, at: "60%", dur: 0.5 });
    }},
    { say: "وسرّ نجاح هذه الإضافات: أن يكون لكل منها واجهة واضحة وموثّقة يفهمها النموذج بدقة.", do: s => {
      s.unfocus({ at: "0%", dur: 0.55 });
      s.badge("c1", { text: "clean chunks + IDs", x: 360, y: 470, color: "gold", size: 19 }, { at: "24%" });
      s.badge("c2", { text: "strict input_schema", x: 1240, y: 470, color: "orange", size: 19 }, { at: "46%" });
      s.badge("c3", { text: "scoped user_id", x: 800, y: 650, color: "blue", size: 19 }, { at: "66%" });
      s.pulse(["ret", "tl", "mem"], { at: "74%", st: 0.12 });
    }},
    { sec: "التركيب", say: "بتركيب هذه اللبنة وحدها، نبني كل الأنظمة: سلسلة مترابطة تصنع سير عمل Workflow.", eq: "@B{workflow} = @C{AugLLM}_1 @to @C{AugLLM}_2 @to @C{AugLLM}_3", do: s => {
      s.clear({ dur: 0.4 });
      s.chain("u", ["AugLLM · Classify", "AugLLM · Lookup", "AugLLM · Reply"], { y: 390, gap: 75, w: 280, h: 108, size: 23, colors: ["teal", "blue", "green"], icons: ["brain", "brain", "brain"], inline: true, pulse: true }, { at: "12%", st: 0.22 });
      s.stream("u0", "u2", { at: "60%", span: 1.8, every: 0.5, color: "teal" });
    }},
    { say: "ووضع حلقة حول اللبنة نفسها يصنع وكيلًا Agent يقرر متى يتوقف أو يستدعي أداة أخرى.", eq: "@P{agent} = @T{loop}(@C{AugLLM})", do: s => {
      s.to(["u0", "u1", "u2"], { y: 330, scale: 0.85 }, { at: "0%", dur: 0.5 });
      s.ring("lp", { x: 800, y: 655, r: 145, color: "purple", arrows: 3, speed: 24 }, { at: "20%" });
      s.box("ua", { x: 800, y: 655, w: 250, h: 90, label: "Augmented LLM", icon: "brain", inline: true, color: "purple", size: 23 }, { at: "34%" });
      s.callout("al", { text: "سلسلة ← Workflow   |   حلقة ← Agent", x: 1230, y: 655, color: "gold" }, { at: "66%" });
    }},
    { sec: "في الكود", say: "وهكذا تبدو في الكود: سياق مسترجَع، وأدوات بمخطط صارم، وذاكرة مرتبطة بالمستخدم.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("cd", { x: 800, y: 515, size: 24, title: "augmented_call.py", lines: [
        "docs = retriever.search(query, k=3)           # Retrieval",
        "prefs = memory.load(user_id=user.id)          # Memory",
        "resp = client.messages.create(",
        "    system=build_system(docs, prefs),",
        "    tools=[reschedule_order], messages=msgs)  # Tools"
      ] }, { at: "8%", dur: 1.5 });
      [0, 1, 4].forEach((h, i) => s.to("cd", { hl: h }, { at: (46 + i * 16) + "%", dur: 0.2 }));
    }},
    { say: "تجنّب رمي أدوات متشابهة أو مستندات مشوّشة؛ كل إضافة غير موثّقة تُربك النموذج.", do: s => {
      s.to("cd", { y: 340, scale: 0.72, hl: -1 }, { at: "0%", dur: 0.55 });
      s.box("bd", { x: 460, y: 690, w: 500, h: 145, label: "الخطأ: واجهات غامضة وأدوات مكررة", sub: "vague tool docs · noisy dumps", icon: "alert", color: "red", size: 22 }, { at: "24%" });
      s.box("gd", { x: 1140, y: 690, w: 500, h: 145, label: "الإنتاج: عقد واضح ومختبر لكل إضافة", sub: "typed schemas · scoped memory", icon: "shieldok", color: "green", size: 22 }, { at: "54%" });
      s.link("bg", "bd", "gd", { color: "green", pulse: true }, { at: "74%" });
    }},
    { sec: "الخلاصة", say: "تذكّر هذه الصورة: نموذج واحد معزَّز بالاسترجاع والأدوات والذاكرة، هو أساس كل ما ستبنيه.", eq: "@P{LLM} + (@Y{Retrieval} + @O{Tools} + @B{Memory}) @Rightarrow @T{Agentic Systems}", do: s => {
      s.clear({ dur: 0.4 });
      s.box("c", { x: 560, y: 530, w: 230, h: 145, label: "Augmented\nLLM", icon: "brain", color: "teal", size: 26 }, { at: "10%" });
      s.col("ad", ["Retrieval · معرفة", "Tools · تنفيذ", "Memory · استمرارية"], { x: 250, y: 530, w: 255, h: 66, size: 22, colors: ["gold", "orange", "blue"] }, { at: "26%", st: 0.14 });
      s.box("w", { x: 1120, y: 415, w: 320, h: 96, label: "Workflows (fixed)", icon: "route", inline: true, color: "blue", size: 24 }, { at: "52%" });
      s.box("a", { x: 1120, y: 645, w: 320, h: 96, label: "Agents (loop)", icon: "bot", inline: true, color: "purple", size: 24 }, { at: "64%" });
      s.link("cw", "c", "w", { color: "blue", pulse: true }, { at: "58%" });
      s.link("ca", "c", "a", { color: "purple", pulse: true }, { at: "70%" });
    }}
  ]);

  // ------------------------------------------------------------------ A1.3 Reading model docs
  X.lesson("A1.3", [
    { sec: "مفاجآت الإنتاج", say: "تُطلِق ميزتك يوم الجمعة، وفجأة تظهر ثلاث مفاجآت: خطأ 429، ورد مقطوع، وفاتورة ضخمة!", do: s => {
      s.box("app", { x: 340, y: 525, w: 240, h: 145, label: "Your App", sub: "prod launch", icon: "rocket", color: "teal", size: 26 }, { at: "0%" });
      s.box("a1", { x: 860, y: 345, w: 390, h: 74, label: "429 Too Many Requests", font: "mono", color: "red", icon: "alert", inline: true, size: 21 }, { at: "28%" });
      s.box("a2", { x: 860, y: 525, w: 390, h: 74, label: "JSON cut off mid-stream", font: "mono", color: "orange", icon: "x", inline: true, size: 21 }, { at: "48%" });
      s.box("a3", { x: 860, y: 705, w: 390, h: 74, label: "Daily bill: $420 (!)", font: "mono", color: "gold", icon: "coin", inline: true, size: 22 }, { at: "68%" });
      ["a1", "a2", "a3"].forEach((id, i) => s.link("la" + i, "app", id, { color: ["red", "orange", "gold"][i], pulse: true }, { at: (24 + i * 20) + "%" }));
    }},
    { say: "كل هذه المفاجآت إجابتها مكتوبة بوضوح في الصفحة الأولى من وثائق النموذج الرسمية.", do: s => {
      s.out(["app", "a1", "a2", "a3", "la0", "la1", "la2"], { at: "0%", dur: 0.4 });
      s.doc("dc", { x: 520, y: 530, w: 250, h: 330, lines: 9, title: "Official Model Docs", color: "teal" }, { at: "18%" });
      ["1 · Context & Max Output", "2 · Input / Output Pricing", "3 · Rate Limits (RPM / TPM)", "4 · Stop Reasons", "5 · Deprecation Dates"].forEach((t, i) => {
        s.box("sec" + i, { x: 1080, y: 345 + i * 92, w: 420, h: 66, label: t, size: 23, color: ["blue", "gold", "orange", "purple", "red"][i] }, { at: (30 + i * 11) + "%" });
        s.link("dl" + i, "dc", "sec" + i, { color: "faint" }, { at: (34 + i * 11) + "%" });
      });
    }},
    { sec: "الحدود والتسعير", say: "أولًا: دوّن نافذة السياق وأقصى Tokens للمخرجات؛ فكلاهما حد مختلف تمامًا.", do: s => {
      s.clear({ dur: 0.4 });
      s.matrix("tb", { data: [["Model", "Context Window", "Max Output"], ["Large (Frontier)", "200K", "64K"], ["Small (Fast)", "200K", "8K"]], x: 800, y: 500, cw: 300, ch: 78, size: 26, font: "ui" }, { at: "12%" });
      s.to("tb", { hi: 1 }, { at: "42%", dur: 0.25 });
      s.to("tb", { hi: 2 }, { at: "64%", dur: 0.25 });
      s.callout("cn", { text: "السياق 200K لا يعني أن الرد يكتب 200K!", x: 800, y: 710, color: "gold" }, { at: "76%" });
    }},
    { say: "ثانيًا: احسب التكلفة من سعر المدخلات وسعر المخرجات، ثم اضربها في حجم استخدامك المتوقع.", eq: "@T{cost} = n_{@T{in}} @cdot p_{@T{in}} + n_{@T{out}} @cdot p_{@T{out}}", do: s => {
      s.out("cn", { at: "0%", dur: 0.3 });
      s.to("tb", { y: 345, scale: 0.74, hi: -1 }, { at: "6%", dur: 0.6 });
      s.text("calc", { text: "2,000 × $3/M  +  500 × $15/M", x: 640, y: 575, size: 34, color: "ink" }, { at: "28%" });
      s.num("tot", { v: 0, x: 1180, y: 575, size: 46, color: "gold", dec: 4, pre: "= $" }, { at: "44%" });
      s.to("tot", { v: 0.0135 }, { at: "48%", dur: 1.1 });
      s.callout("sc", { text: "100,000 طلب شهريًا ≈ $1,350", x: 800, y: 715, color: "orange" }, { at: "76%" });
    }},
    { say: "لاحظ أن الـ Token في المخرجات عادةً أغلى من المدخلات بثلاثة إلى خمسة أضعاف.", do: s => {
      s.out(["calc", "tot", "sc"], { at: "0%", dur: 0.35 });
      s.bars("pr", [["Input tokens", 0.20, "blue", "$3 / 1M"], ["Output tokens", 0.85, "orange", "$15 / 1M  (5×)"]], { x: 560, y: 640, w: 540, gap: 95, size: 28, h: 36 }, { at: "20%" });
      s.pulse("pr1", { at: "68%", color: "orange" });
    }},
    { sec: "حدود المعدل", say: "ثالثًا: لكل حساب حدود معدل في الدقيقة RPM وTPM، وعند تجاوزها يرجع الخادم 429.", do: s => {
      s.clear({ dur: 0.4 });
      s.box("app", { x: 330, y: 500, w: 220, h: 135, label: "Your App", icon: "code", color: "teal", size: 26 }, { at: "8%" });
      s.box("api", { x: 1270, y: 500, w: 220, h: 135, label: "Model API", icon: "cloud", color: "blue", size: 26 }, { at: "16%" });
      s.link("la", "app", "api", { color: "teal", label: "burst traffic", lc: "teal", pulse: true }, { at: "24%" });
      s.stream("app", "api", { at: "30%", span: 1.8, every: 0.28, color: "teal" });
      s.box("e429", { x: 800, y: 695, w: 460, h: 72, label: "HTTP 429 · Too Many Requests", font: "mono", size: 24, color: "red" }, { at: "64%" });
      s.mark("ex", "e429", "x", { at: "78%" });
    }},
    { say: "الحل: أعد المحاولة مع تراجع أُسّي وعشوائية Jitter، لتفادي تصادم الطلبات من جديد.", eq: "@T{wait} = 2^{n} @T{ s} + @Y{jitter}", do: s => {
      s.out(["app", "api", "la", "e429", "ex"], { at: "0%", dur: 0.35 });
      [
        ["try 1  ·  0 s", "429", "red"],
        ["try 2  ·  wait 1s + jitter", "429", "red"],
        ["try 3  ·  wait 2s + jitter", "429", "orange"],
        ["try 4  ·  wait 4s + jitter", "200 OK ✓", "green"]
      ].forEach(([a, b, c], i) => {
        s.box("rt" + i, { x: 800, y: 330 + i * 118, w: 660, h: 74, label: `${a}   →   ${b}`, size: 24, color: c, font: "ui" }, { at: (16 + i * 18) + "%" });
      });
      s.pulse("rt3", { at: "82%", color: "green" });
    }},
    { sec: "أسباب التوقف", say: "رابعًا: تعامل مع كل stop_reason في الكود صراحةً، بدل افتراض أن الرد دائمًا نص مكتمل.", eq: "@T{handle every} @; @T{stop@_reason}", do: s => {
      s.clear({ dur: 0.4 });
      s.code("sw", { x: 800, y: 520, size: 24, title: "handle_stop.py", lines: [
        "match resp.stop_reason:",
        "    case \"end_turn\":   return resp.text",
        "    case \"tool_use\":   return run_tools(resp)",
        "    case \"max_tokens\": return continue_or_raise()",
        "    case \"refusal\":    return show_policy_msg()"
      ] }, { at: "8%", dur: 1.5 });
      [1, 2, 3, 4].forEach((h, i) => s.to("sw", { hl: h }, { at: (44 + i * 13) + "%", dur: 0.2 }));
    }},
    { say: "الخطأ الشائع هو قراءة resp.text مباشرة؛ فتنهار الواجهة عند الرفض أو القطع أو طلب أداة.", do: s => {
      s.to("sw", { x: 515, scale: 0.76, hl: -1 }, { at: "0%", dur: 0.6 });
      s.box("bad", { x: 1210, y: 400, w: 470, h: 125, label: "الخطأ: return resp.text مباشرة", sub: "crashes on refusal or max_tokens", icon: "alert", color: "red", size: 22 }, { at: "24%" });
      s.box("ok", { x: 1210, y: 615, w: 470, h: 125, label: "الإنتاج: تفريع صريح لكل حالة", sub: "safe retries · clear UX", icon: "shieldok", color: "green", size: 22 }, { at: "54%" });
      s.link("bo", "bad", "ok", { color: "green", pulse: true }, { at: "74%" });
    }},
    { sec: "إيقاف النماذج", say: "خامسًا: النماذج القديمة تتوقف بعد فترة، فتابع جدول الإيقاف وخطّط للترقية مبكرًا.", do: s => {
      s.clear({ dur: 0.4 });
      s.arrow("tl", { x1: 220, y1: 520, x2: 1380, y2: 520, color: "soft", w: 3 }, { at: "8%" });
      s.box("v1", { x: 430, y: 520, w: 220, h: 68, label: "model v1 (prod)", size: 23, color: "blue" }, { at: "20%" });
      s.line("dl", { x1: 1080, y1: 390, x2: 1080, y2: 650, color: "red", dash: "8 6", w: 3.5 }, { at: "36%" });
      s.badge("dp", { text: "Sunset Date ✗", x: 1080, y: 350, color: "red", size: 22 }, { at: "40%" });
      s.box("v2", { x: 790, y: 695, w: 440, h: 74, label: "migrate to v2 + re-run evals", icon: "check", inline: true, size: 23, color: "green" }, { at: "60%" });
      s.link("mg", "v1", "v2", { color: "green", bend: 0.2, pulse: true }, { at: "68%" });
    }},
    { say: "وقبل كل ترقية لنموذج جديد، أعد تشغيل مجموعة التقييم لتضمن عدم تراجع الجودة أو السعر.", do: s => {
      s.focus("v2", { zoom: 1.12, at: "8%", dur: 0.6 });
      s.badge("e1", { text: "eval accuracy ≥ v1 ✓", x: 520, y: 350, color: "green", size: 22 }, { at: "32%" });
      s.badge("e2", { text: "latency & cost checked ✓", x: 800, y: 350, color: "teal", size: 22 }, { at: "58%" });
      s.unfocus({ at: "80%", dur: 0.6 });
    }},
    { sec: "الخلاصة", say: "قراءة الوثائق 15 دقيقة مبكرًا تمنع أعطال الإنتاج: الحدود، والسعر، و429، والتوقف، والإيقاف.", eq: "@T{read docs early} @Rightarrow @G{zero production surprises}", do: s => {
      s.clear({ dur: 0.4 });
      s.grid("chk", ["Limits\nContext & max_out", "Pricing\nIn vs Out tokens", "Rate Limits\nBackoff + jitter", "Stop & Sunset\nBranch + migrate"], { cols: 4, y: 530, cw: 305, ch: 210, size: 23, icons: ["gauge", "coin", "refresh", "calendar"], colors: ["blue", "gold", "orange", "green"] }, { at: "12%", st: 0.16 });
      [0, 1, 2, 3].forEach(i => s.mark("cm" + i, "chk" + i, "check", { at: (64 + i * 7) + "%" }));
    }}
  ]);
})();
