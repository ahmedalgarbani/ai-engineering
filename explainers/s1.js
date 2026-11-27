// Motion explainers — Stage 1: the AI engineer, tokens & context, start simple, augmented LLM, model docs
(function () {
  const X = window.Explainer;

  // ------------------------------------------------------------------ 1.1 What the AI engineer builds
  X.lesson("1.1", [
    { sec: "الطبقة حول النموذج", say: "النموذج وحده محرّك قوي، لكنه ليس منتجًا بعد.", do: s => {
      s.box("m", { x: 800, y: 540, w: 220, h: 150, label: "model", icon: "brain", color: "purple", size: 30 });
    }},
    { say: "ومهندس الذكاء الاصطناعي يبني الطبقة حوله: الواجهة، والبيانات، والأدوات، والتقييم.", eq: "@T{product} = @P{model} + @T{UI} + @Y{data} + @O{tools} + @G{evals}", do: s => {
      s.hub("m", "h", ["UI", "data", "tools", "evals"], { r: 330, ry: 230, a0: -90, icons: ["browser", "db", "tool", "chart"], colors: ["blue", "gold", "orange", "green"], w: 200, h: 80, inline: true, size: 26, ac: "faint" }, { at: 0.3, st: 0.2 });
      s.zone("prod", { x: 800, y: 540, w: 1060, h: 640, label: "the product you build", color: "teal" }, { at: 1.4 });
    }},
    { sec: "ثلاثة أشكال", say: "وأهم قرار عنده: أي شكل يناسب المشكلة؟", do: s => {
      s.clear({ dur: 0.4 });
      const [l, r] = [330, 1270];
      s.zone("f", { x: 330, y: 560, w: 420, h: 520, label: "feature", color: "green" }, { at: 0.3 });
      s.zone("w", { x: 800, y: 560, w: 420, h: 520, label: "workflow", color: "blue" }, { at: 0.45 });
      s.zone("a", { x: 1270, y: 560, w: 420, h: 520, label: "agent", color: "purple" }, { at: 0.6 });
    }},
    { say: "الميزة: استدعاء نموذج واحد داخل المنتج، مثل تلخيص أو تصنيف.", eq: "y = @T{LLM}(x)", do: s => {
      s.box("f1", { x: 330, y: 560, w: 220, h: 80, label: "summarize", color: "green", size: 28 }, { at: 0.2 });
      s.arrow("fi", { x1: 330, y1: 400, x2: 330, y2: 512, color: "dim" }, { at: 0.4 }); s.arrow("fo", { x1: 330, y1: 606, x2: 330, y2: 720, color: "green" }, { at: 0.6 });
    }},
    { say: "سير العمل: عدة خطوات على مسار محدد مسبقًا.", eq: "y = f_3(f_2(f_1(x)))", do: s => {
      s.chain("w", ["extract", "check", "draft"], { x: 800, y: 570, vertical: true, gap: 40, h: 76, w: 220, size: 26, colors: ["blue", "gold", "blue"] }, { at: 0.2, st: 0.2 });
    }},
    { say: "والوكيل: النموذج يختار خطواته وأدواته بنفسه.", eq: "@T{loop}: @; @T{LLM} @to @T{tool} @to @T{LLM}", do: s => {
      s.ring("ar", { x: 1270, y: 580, r: 140, color: "purple", arrows: 3 }, { at: 0.2 });
      s.box("ac", { x: 1270, y: 580, w: 140, h: 70, label: "LLM", color: "purple", size: 28 }, { at: 0.4 });
      s.to("ar", { spin: 360 }, { at: 0.5, dur: 2.5, ease: "lin" });
    }},
    { sec: "الأدوار", say: "مهندس ML يدرّب النماذج ويشغّلها، مثل من يبني محرّك الطائرة.", do: s => {
      s.clear({ dur: 0.4 });
      s.versus("vs", "ML engineer", "AI engineer", { colors: ["orange", "teal"] }, { at: 0.2 });
      s.col("ml", ["training data", "GPUs & training", "model weights"], { x: 435, y: 570, size: 28, icons: ["db", "cpu", "save"], colors: ["orange", "orange", "orange"], w: 420 }, { at: 0.6, st: 0.2 });
    }},
    { say: "ومهندس AI يبني المنتج فوقها، مثل من يصمّم الطائرة كاملة.", do: s => {
      s.col("ai", ["APIs & prompts", "RAG, tools, agents", "evals & guardrails"], { x: 1165, y: 570, size: 28, icons: ["code", "tool", "shieldok"], colors: ["teal", "teal", "teal"], w: 420 }, { at: 0.3, st: 0.2 });
    }},
    { sec: "المسؤولية", say: "وهو مسؤول عن جودة الجزء الذكي، وتكلفته، وسرعته، وأمانه.", do: s => {
      s.clear({ dur: 0.4 });
      s.grid("rs", ["quality", "cost", "latency", "safety"], { cols: 4, y: 520, cw: 250, ch: 170, size: 28, icons: ["star", "coin", "clock", "shield"], colors: ["gold", "green", "blue", "red"] }, { at: 0.3, st: 0.15 });
    }},
    { say: "فقد تكون الإجابة خاطئة دون أي خطأ في السجلات، ولهذا يحتاج إلى التقييمات.", eq: "@T{no errors} @neq @T{correct}", do: s => {
      s.to("rs*", { y: 380, scale: 0.75 }, { dur: 0.6 });
      s.code("log", { x: 520, y: 700, size: 22, title: "server.log", lines: ["POST /reply  200 OK  (812 ms)", "errors: 0"] }, { at: 0.5, dur: 0.8 });
      s.bubble("bad", { text: "Refunds within 90 days.", side: "a", x: 1080, y: 700, w: 380, color: "red" }, { at: 1.2 });
      s.mark("bx", "bad", "x", { at: 1.7 });
    }}
  ]);

  // ------------------------------------------------------------------ 1.2 Tokens and context windows
  X.lesson("1.2", [
    { sec: "نافذة السياق", say: "كل ما يراه النموذج ويكتبه يُقاس بالـ Tokens.", do: s => {
      s.text("t", { text: "Where is my order?", x: 800, y: 380, size: 60 }, { in: "type", dur: 0.9 });
      s.row("tk", ["Where", " is", " my", " order", "?"], { y: 540, size: 40, colors: ["blue", "teal", "gold", "purple", "green"] }, { at: 1.1, st: 0.1 });
      s.note("n", { text: "5 tokens", x: 800, y: 640, font: "math", size: 30 }, { at: 1.7 });
    }},
    { say: "ونافذة السياق هي أقصى عدد من الـ Tokens في طلب واحد.", eq: "@T{context window} = 128@,000 @; @T{tokens}", do: s => {
      s.clear({ dur: 0.4 });
      s.box("win", { x: 800, y: 520, w: 1240, h: 110, label: "", color: "soft", fill: "panel", fop: 0.5, r: 10 }, { at: 0.3, in: "draw" });
      s.brace("br", { x1: 180, x2: 1420, y: 590, label: "max tokens per request", color: "dim" }, { at: 0.9 });
    }},
    { say: "وهي تتسع لكل شيء: التعليمات، والسجل، والمستندات، والسؤال، والإجابة.", eq: "@P{system} + @B{history} + @Y{docs} + @C{question} + @G{answer} @le @T{window}", do: s => {
      const seg = [["system", 160, "purple"], ["history", 320, "blue"], ["docs", 380, "gold"], ["question", 120, "teal"], ["answer", 200, "green"]];
      let x = 186;
      seg.forEach(([l, w, c], i) => { s.box("sg" + i, { x: x + w / 2, y: 520, w: w - 6, h: 92, label: l, size: 24, color: c, fill: "panel" }, { at: 0.3 + i * 0.25, in: "grow" }); x += w; });
    }},
    { sec: "عندما يمتلئ", say: "ومع طول المحادثة، يكبر السجل حتى يزاحم كل شيء.", do: s => {
      s.to("sg1", { w: 554, x: 626 }, { dur: 1.2 });
      s.to("sg2", { x: 1096 }, { dur: 1.2 }); s.to("sg3", { x: 1346 }, { dur: 1.2 }); s.to("sg4", { x: 1496, w: 168, stroke: "red" }, { dur: 1.2 });
      s.to("win", { stroke: "red" }, { at: 1 });
      s.note("ov", { text: "overflow", x: 1496, y: 430, color: "red", font: "math", size: 28 }, { at: 1.3 });
    }},
    { say: "فلخّص الأدوار القديمة، أو استرجع منها ما تحتاجه فقط.", do: s => {
      s.out("ov", { dur: 0.3 });
      s.to("sg1", { w: 194, x: 186 + 160 + 100, label: "summary" }, { at: 0.3, dur: 1.1 });
      s.to("sg2", { x: 186 + 160 + 200 + 190 }, { at: 0.3, dur: 1.1 }); s.to("sg3", { x: 186 + 160 + 200 + 380 + 60 }, { at: 0.3, dur: 1.1 }); s.to("sg4", { x: 186 + 160 + 200 + 380 + 120 + 100, w: 194, stroke: "green" }, { at: 0.3, dur: 1.1 });
      s.to("win", { stroke: "soft" }, { at: 1 });
    }},
    { sec: "سبب التوقف", say: "وراقب سبب التوقف: max_tokens يعني أن الإجابة مقطوعة.", eq: "@T{stop@_reason} = @R{max@_tokens}", do: s => {
      s.box("cut", { x: 1080, y: 700, label: "answer cut off at max_tokens…", size: 24, color: "red", h: 60 }, { at: 0.3 });
      s.link("cl", "sg4", "cut", { color: "red" }, { at: 0.2 });
    }},
    { sec: "الحرارة", say: "ومعامل Temperature يتحكم في التنوّع: منخفض للدقة، ومرتفع للإبداع.", eq: "p_i = softmax(z_i / @O{T})", do: s => {
      s.clear({ dur: 0.4 });
      s.bars("t", [["refund", 0.45], ["return", 0.3], ["exchange", 0.15], ["gift", 0.1]], { x: 720, y: 540, w: 480, gap: 66, size: 30, color: "teal", pct: true }, { at: 0.3 });
      [0.95, 0.05, 0, 0].forEach((v, i) => s.to("t" + i, { v }, { at: 1.2, dur: 0.8 }));
      [0.3, 0.27, 0.23, 0.2].forEach((v, i) => s.to("t" + i, { v }, { at: 2.6, dur: 0.8 }));
      s.num("T", { v: 0.7, x: 1350, y: 540, size: 44, color: "orange", dec: 1, pre: "T = " }, { at: 0.4 });
      s.to("T", { v: 0 }, { at: 1.2, dur: 0.8 }); s.to("T", { v: 1.2 }, { at: 2.6, dur: 0.8 });
    }},
    { sec: "حدود المعرفة", say: "وتذكّر: النموذج لا يعرف الأحداث الحديثة، إلا إذا وضعتها في السياق.", do: s => {
      s.clear({ dur: 0.4 });
      s.arrow("tl", { x1: 260, y1: 460, x2: 1340, y2: 460, color: "soft" }, { at: 0.2 });
      s.line("cut", { x1: 900, y1: 380, x2: 900, y2: 540, color: "red", dash: "8 8", w: 3 }, { at: 0.5 });
      s.note("cl", { text: "knowledge cutoff", x: 900, y: 360, color: "red", font: "math" }, { at: 0.6 });
      s.doc("news", { x: 1150, y: 460, w: 80, h: 100, color: "gold", title: "today's news" }, { at: 0.9 });
      s.box("ctx", { x: 800, y: 720, w: 600, h: 90, label: "context", color: "gold", fop: 0.3, size: 28 }, { at: 1.3 });
      s.to("news", { x: 1000, y: 720, scale: 0.7 }, { at: 1.6, dur: 0.9 });
    }},
    { say: "وهذا فحص بسيط قبل كل طلب: هل يتسع؟ وإن لم يتسع، لخّص.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("cd", { x: 800, y: 540, size: 26, title: "context_budget.py", lines: ["MAX_CTX = 128_000", "used = count_tokens(system + history + docs + question)", "if used + 1024 > MAX_CTX:", "    history = summarize_old_turns(history)"] }, { at: 0.3, dur: 1.8 });
      s.to("cd", { hl: 2 }, { at: 2.4, dur: 0.2 }); s.to("cd", { hl: 3 }, { at: 3.2, dur: 0.2 });
    }}
  ]);

  // ------------------------------------------------------------------ A1.1 Start with the simplest thing
  X.lesson("A1.1", [
    { sec: "سلّم التعقيد", say: "عندك مشكلة تريد حلّها بالذكاء الاصطناعي. من أين تبدأ؟", do: s => {
      s.chain("st", ["agent", "workflow", "single call + retrieval"], { x: 620, y: 540, vertical: true, gap: 40, w: 420, h: 100, size: 30, colors: ["purple", "blue", "green"] }, { at: 0.3, st: 0.2 });
      s.to(["st0", "st1", "st_0", "st_1"], { opacity: 0.25 }, { at: 0.9, dur: 0.4 });
    }},
    { say: "ابدأ باستدعاء واحد، بأمر جيد ومع استرجاع.", eq: "y = @T{LLM}(@T{prompt} + @Y{retrieved docs})", do: s => {
      s.pulse("st2", { glow: 1, keep: true, color: "green" });
      s.mark("ok2", "st2", "check", { at: 0.7 });
    }},
    { say: "فإن لم يكفِ، وكانت الخطوات معروفة مسبقًا، فانتقل إلى سير عمل.", eq: "@T{known steps} @Rightarrow @B{workflow}", do: s => {
      s.to(["st1", "st_1"], { opacity: 1 }, { dur: 0.4 }); s.pulse("st1", { at: 0.3, color: "blue" });
    }},
    { say: "واستخدم وكيلًا فقط عندما يستحيل توقّع المسار فعلًا.", eq: "@T{unpredictable path} @Rightarrow @P{agent}", do: s => {
      s.to(["st0", "st_0"], { opacity: 1 }, { dur: 0.4 }); s.pulse("st0", { at: 0.3, color: "purple" });
    }},
    { sec: "ثمن كل درجة", say: "وكل درجة للأعلى تضيف زمنًا، وتكلفة، وجهدًا في الاختبار.", eq: "@T{latency}, @; @T{cost}, @; @T{testing effort} @nearrow", do: s => {
      [[0.85, "purple"], [0.5, "blue"], [0.18, "green"]].forEach(([v, c], i) => s.bar("cb" + i, { x: 900, y: s.get("st" + i).y, w: 420, v, color: c, label: "", val: ["$$$ · slow", "$$", "$"][i], size: 26, h: 26 }, { at: 0.3 + i * 0.15 }));
    }},
    { say: "وأحيانًا يعني ذلك ألا تبني نظامًا وكيليًا أصلًا.", do: s => {
      s.to(["st0", "st1", "st_0", "st_1", "cb0", "cb1"], { opacity: 0.3 }, { dur: 0.5 });
      s.pulse("st2", { at: 0.4, color: "green" });
      s.note("en", { text: "often good enough", x: 620, y: 750, color: "green", font: "math", size: 30 }, { at: 0.7 });
    }},
    { sec: "متى تصعد؟", say: "اصعد درجة فقط إذا تحسّنت النتيجة بشكل قابل للقياس.", eq: "@T{climb only if} @; @Delta @T{eval score} > 0", do: s => {
      s.clear({ dur: 0.4 });
      s.bars("ev", [["single call", 0.78, "green", "78%"], ["workflow", 0.9, "blue", "90%  ↑ worth it"], ["agent", 0.91, "purple", "91%  · not worth the cost"]], { x: 640, y: 540, w: 560, gap: 100, size: 30, h: 34 }, { at: 0.3 });
    }}
  ]);

  // ------------------------------------------------------------------ A1.2 The augmented LLM
  X.lesson("A1.2", [
    { sec: "اللبنة الأساسية", say: "اللبنة الأساسية لكل نظام وكيلي: نموذج لغة معزَّز.", eq: "@T{augmented LLM} = @P{LLM} + @Y{retrieval} + @O{tools} + @B{memory}", do: s => {
      s.box("m", { x: 800, y: 540, w: 230, h: 160, label: "LLM", icon: "brain", color: "purple", size: 32 });
    }},
    { sec: "الاسترجاع", say: "الاسترجاع يجلب معرفة لا يملكها النموذج.", do: s => {
      s.box("ret", { x: 380, y: 340, w: 260, h: 90, label: "retrieval", icon: "search", inline: true, color: "gold", size: 28 }, { at: 0.2 });
      s.link("lr", "ret", "m", { color: "gold", label: "query(q) → docs", lc: "gold" }, { at: 0.4 });
      s.flow("ret", "m", { color: "gold", n: 2, at: 1 });
    }},
    { sec: "الأدوات", say: "والأدوات تسمح له أن ينفّذ ويتحقق.", do: s => {
      s.box("tl", { x: 1220, y: 340, w: 240, h: 90, label: "tools", icon: "tool", inline: true, color: "orange", size: 28 }, { at: 0.2 });
      s.link("lt", "m", "tl", { color: "orange", tail: true, label: "call(name, args)", lc: "orange" }, { at: 0.4 });
      s.flow("m", "tl", { color: "orange", at: 1 }); s.flow("tl", "m", { color: "teal", at: 1.6 });
    }},
    { sec: "الذاكرة", say: "والذاكرة تنقل المعلومات عبر الأدوار والجلسات.", do: s => {
      s.box("mem", { x: 800, y: 790, w: 260, h: 90, label: "memory", icon: "chip", inline: true, color: "blue", size: 28 }, { at: 0.2 });
      s.link("lm", "m", "mem", { color: "blue", tail: true, label: "read / write", lc: "blue" }, { at: 0.4 });
      s.box("s1", { x: 380, y: 790, label: "session 1", size: 22, h: 50, color: "dim" }, { at: 0.8 }); s.box("s2", { x: 1220, y: 790, label: "session 2", size: 22, h: 50, color: "dim" }, { at: 1 });
      s.link("ls1", "s1", "mem", { color: "dim" }, { at: 0.9 }); s.link("ls2", "mem", "s2", { color: "dim" }, { at: 1.1 });
    }},
    { say: "ولكل إضافة واجهة واضحة وموثّقة، يفهمها النموذج.", do: s => {
      s.pulse(["ret", "tl", "mem"], { st: 0.2 });
      s.zone("unit", { x: 800, y: 560, w: 1240, h: 640, label: "one augmented LLM call", color: "teal" }, { at: 0.6 });
    }},
    { sec: "التركيب", say: "وكل أنماط سير العمل والوكلاء تُبنى بتركيب هذه الوحدة.", do: s => {
      s.clear({ dur: 0.4 });
      for (let i = 0; i < 3; i++) s.box("u" + i, { x: 470 + i * 330, y: 420, w: 200, h: 100, label: "augmented LLM", size: 22, color: "teal", icon: "brain", inline: true }, { at: 0.3 + i * 0.15 });
      s.link("c0", "u0", "u1", { color: "dim" }, { at: 0.8 }); s.link("c1", "u1", "u2", { color: "dim" }, { at: 0.9 });
      s.note("wl", { text: "chain them → workflow", x: 800, y: 520, color: "blue", font: "math", size: 28 }, { at: 1 });
    }},
    { say: "سلسلة منها تصنع سير عمل، وحلقة حولها تصنع وكيلًا.", do: s => {
      s.box("ua", { x: 800, y: 720, w: 200, h: 90, label: "augmented LLM", size: 22, color: "purple", icon: "brain", inline: true }, { at: 0.3 });
      s.ring("lp", { x: 800, y: 720, r: 130, color: "purple", arrows: 3, w: 3 }, { at: 0.5 });
      s.to("lp", { spin: 360 }, { at: 0.7, dur: 2.5, ease: "lin" });
      s.note("al", { text: "loop it → agent", x: 1110, y: 720, color: "purple", font: "math", size: 28 }, { at: 0.8 });
    }}
  ]);

  // ------------------------------------------------------------------ A1.3 Reading model docs
  X.lesson("A1.3", [
    { sec: "الوثائق أولًا", say: "قبل الإنتاج، افتح وثائق النموذج: فيها إجابات معظم أسئلتك.", do: s => {
      s.doc("dc", { x: 800, y: 540, w: 260, h: 340, lines: 9, title: "model docs" });
      ["context limits", "pricing", "rate limits", "stop reasons", "deprecations"].forEach((t, i) => s.box("sec" + i, { x: 1220, y: 360 + i * 90, w: 280, h: 62, label: t, size: 24, color: "soft" }, { at: 0.6 + i * 0.12 }));
    }},
    { sec: "الحدود", say: "دوّن نافذة السياق، وأقصى Tokens للمخرجات لكل نموذج.", do: s => {
      s.clear({ dur: 0.4 });
      s.matrix("tb", { data: [["model", "context", "max output"], ["large", "200K", "64K"], ["small", "200K", "8K"]], x: 800, y: 540, cw: 240, ch: 70, size: 28, font: "ui" }, { at: 0.3 });
    }},
    { sec: "التسعير", say: "واحسب التكلفة من سعر المدخلات وسعر المخرجات.", eq: "@T{cost} = n_{@T{in}} @cdot p_{@T{in}} + n_{@T{out}} @cdot p_{@T{out}}", do: s => {
      s.to("tb", { y: 400, scale: 0.75 }, { dur: 0.6 });
      s.text("calc", { text: "2,000 × $3/M + 500 × $15/M", x: 700, y: 640, size: 38 }, { at: 0.5 });
      s.num("tot", { v: 0, x: 1220, y: 640, size: 46, color: "gold", dec: 4, pre: "= $" }, { at: 1 });
      s.to("tot", { v: 0.0135 }, { at: 1.1, dur: 1 });
    }},
    { sec: "حدود المعدل", say: "وافهم حدود المعدل؛ فعند تجاوزها يعيد الخادم الخطأ 429.", do: s => {
      s.clear({ dur: 0.4 });
      s.box("app", { x: 380, y: 540, w: 200, h: 120, label: "your app", icon: "code", color: "teal", size: 26 }, { at: 0.2 });
      s.box("api", { x: 1220, y: 540, w: 200, h: 120, label: "API", icon: "cloud", color: "blue", size: 26 }, { at: 0.3 });
      for (let i = 0; i < 5; i++) s.flow("app", "api", { color: "teal", at: 0.5 + i * 0.15, dur: 0.6 });
      s.box("e429", { x: 800, y: 700, label: "429 Too Many Requests", font: "mono", size: 26, color: "red", h: 60 }, { at: 1.5 });
    }},
    { say: "فأعد المحاولة مع تراجع تدريجي: ثانية، ثم ثانيتان، ثم أربع.", eq: "@T{wait} = 2^{n} @T{ s} + @T{jitter}", do: s => {
      s.out("e429", { dur: 0.3 });
      [["try 1", "429", "red"], ["wait 1s → try 2", "429", "red"], ["wait 2s → try 3", "429", "red"], ["wait 4s → try 4", "200 OK", "green"]].forEach(([a, b, c], i) => s.box("rt" + i, { x: 800, y: 330 + i * 100, w: 520, h: 64, label: `${a}  ·  ${b}`, size: 24, color: c, font: "ui" }, { at: 0.3 + i * 0.4 }));
      s.out(["app", "api"], { dur: 0.3 });
    }},
    { sec: "أسباب التوقف", say: "وتعامل مع كل سبب توقف بشكل صريح في الكود.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("sw", { x: 800, y: 540, size: 24, title: "handle_stop.py", lines: ["match resp.stop_reason:", "    case \"end_turn\":   return resp.text", "    case \"tool_use\":   run_tools(resp)", "    case \"max_tokens\": continue_or_raise_limit()", "    case \"refusal\":    show_policy_message()"] }, { at: 0.3, dur: 1.8 });
      [1, 2, 3, 4].forEach((h, i) => s.to("sw", { hl: h }, { at: 2.3 + i * 0.5, dur: 0.15 }));
    }},
    { sec: "إيقاف النماذج", say: "وتابع مواعيد إيقاف النماذج القديمة، وخطّط للترقية مبكرًا.", do: s => {
      s.clear({ dur: 0.4 });
      s.arrow("tl", { x1: 260, y1: 520, x2: 1340, y2: 520, color: "soft" }, { at: 0.2 });
      s.box("v1", { x: 460, y: 520, label: "model v1", size: 24, h: 56, color: "blue" }, { at: 0.4 });
      s.box("dp", { x: 980, y: 420, label: "deprecation date", size: 22, h: 50, color: "red" }, { at: 0.7 });
      s.line("dl", { x1: 980, y1: 450, x2: 980, y2: 600, color: "red", dash: "6 6" }, { at: 0.8 });
      s.box("v2", { x: 760, y: 650, label: "migrate to v2 + re-run evals", size: 22, h: 56, color: "green" }, { at: 1.1 });
    }}
  ]);
})();
