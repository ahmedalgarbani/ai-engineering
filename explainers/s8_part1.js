// Motion explainers — Stage 8 (Part 1): Agentic AI — AG1.1 through AG5.2
// Foundations of Agency, Planning & Reflection, Tools & Protocols, Memory & Harnesses, Multi-Agent Intro
(function () {
  const X = window.Explainer;
  const ringNodes = (s, pre, labels, cx, cy, r, colors, o) => labels.forEach((t, i) => {
    const a = (-90 + i * 360 / labels.length) * Math.PI / 180;
    s.box(pre + i, { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, label: t, size: 22, h: 56, color: (colors || [])[i] || "teal", fill: "bg" }, Object.assign({ at: 0.3 + i * 0.14 }, o));
  });

  // ------------------------------------------------------------------ AG1.1 The Agency Spectrum
  X.lesson("AG1.1", [
    { sec: "من يقرر؟", say: "تخيل تذكرة دعم تطلب استرداد طلب متأخر؛ السؤال الحقيقي هنا: من يقرر الخطوة التالية؟", eq: "@T{agency} = @T{who decides the next step?}", do: s => {
      s.bubble("tk", { text: "أين طلبي #812؟ أريد استرداد المبلغ فورًا.", side: "u", x: 430, y: 450, w: 470, label: "Support Ticket" }, { at: "0%" });
      s.box("md", { x: 1090, y: 450, w: 240, h: 150, label: "LLM", icon: "brain", color: "purple", size: 30 }, { at: "24%" });
      s.link("l0", "tk", "md", { color: "blue", label: "request", pulse: true }, { at: "34%" });
      s.row("qs", ["reply?", "route?", "call tool?", "loop?", "hours?"], { x: 800, y: 700, size: 24, gap: 22, colors: ["dim", "blue", "teal", "purple", "orange"], pad: 22 }, { at: "52%", st: 0.1 });
      s.stream("tk", "md", { at: "45%", color: "blue", span: 2.8, every: 0.6 });
    }},
    { say: "الوكيلية ليست نعم أو لا، بل طيف يشبه القيادة الذاتية: لا تحتاج قيادة كاملة لركن السيارة.", do: s => {
      s.out(["tk", "md", "l0", "qs*"], { at: 0, dur: 0.35 });
      s.bar("sp", { x: 240, y: 520, w: 1120, v: 1, color: "grid", label: "", track: false, h: 14 }, { at: "10%", dur: 0.8 });
      const cols = ["dim", "blue", "teal", "purple", "orange"];
      const lbls = ["L0 · One Call", "L1 · Router", "L2 · Tool Chain", "L3 · Agent Loop", "L4 · Autonomous"];
      lbls.forEach((t, i) => {
        const x = 240 + i * 280;
        s.dot("d" + i, { x, y: 520, r: 13, color: cols[i], halo: true }, { at: 0.55 + i * 0.18 });
        s.box("l" + i, { x, y: i % 2 ? 645 : 395, w: 245, h: 66, label: t, size: 21, color: cols[i] }, { at: 0.65 + i * 0.18 });
      });
      s.callout("drv", { x: 800, y: 805, label: "Cruise Control  →  Lane-Keeping  →  Full Self-Driving", color: "gold", icon: "route", size: 21 }, { at: "68%" });
    }},
    { sec: "المستويات الدنيا", say: "في L0 وL1 يقرر كودك المسار بالكامل: استدعاء واحد يكتب الرد، أو موجّه يصنّف التذكرة.", eq: "@G{L0@text{--}L2}: @; @T{your code owns control}", do: s => {
      s.out("drv", { at: 0, dur: 0.3 });
      s.zone("lo", { x: 520, y: 520, w: 800, h: 390, label: "your code decides · predictable & cheap", color: "green", size: 24 }, { at: "8%" });
      s.focus(["lo", "l0", "l1", "d0", "d1"], { at: "26%", zoom: 1.16 });
      s.badge("b0", { x: 380, y: 775, text: "fast · deterministic", color: "green", size: 21 }, { at: "58%" });
    }},
    { say: "وفي L2 ينفّذ خط أدوات ثابتًا كاستعلام الطلب ثم المسودة؛ ومعظم ميزات الإنتاج تعيش هنا.", do: s => {
      s.out("b0", { at: 0, dur: 0.25 });
      s.focus(["lo", "l2", "d2"], { at: "10%", zoom: 1.18, color: "teal" });
      s.chain("pip", ["get_order", "check_policy", "draft_reply"], { x: 520, y: 790, gap: 45, h: 52, size: 19, font: "mono", colors: ["teal", "teal", "green"], pulse: true }, { at: "32%", st: 0.18 });
      s.badge("prod", { x: 1120, y: 790, text: "most production apps", color: "green", size: 21 }, { at: "66%" });
    }},
    { sec: "المستويات العليا", say: "أما في L3 فيمتلك النموذج الحلقة: يختار الأدوات ديناميكيًا حتى يحقق الهدف بنفسه.", eq: "@P{L3@text{--}L4}: @; @T{the model owns control}", do: s => {
      s.out(["pip*", "prod"], { at: 0, dur: 0.3 });
      s.unfocus({ at: "4%", dur: 0.4 });
      s.zone("hi", { x: 1220, y: 520, w: 540, h: 390, label: "the model decides", color: "purple", size: 24 }, { at: "18%" });
      s.focus(["hi", "l3", "d3"], { at: "34%", zoom: 1.2, color: "purple" });
      s.ring("lr", { x: 1080, y: 790, r: 52, color: "purple", arrows: 3, w: 3 }, { at: "52%" });
      s.note("lrt", { text: "think → tool → observe → repeat", x: 1080, y: 862, size: 20, color: "purple", font: "math" }, { at: "68%" });
    }},
    { say: "وفي L4 يعمل الوكيل لساعات عبر جلسات متعددة بذاكرة ونقاط حفظ ومراقبة مستمرة.", do: s => {
      s.out(["lr", "lrt"], { at: 0, dur: 0.3 });
      s.focus(["hi", "l4", "d4"], { at: "12%", zoom: 1.2, color: "orange" });
      s.row("h4", ["long memory", "checkpoints", "hours runtime"], { x: 1160, y: 800, size: 20, gap: 16, colors: ["orange", "gold", "purple"], pad: 18, h: 48 }, { at: "38%", st: 0.14 });
      s.unfocus({ at: "76%", dur: 0.6 });
    }},
    { sec: "فاتورة الاستقلالية", say: "كل درجة أعلى تضاعف التكلفة والزمن وأنماط الفشل، وتفرض تقييمات وضوابط أشد صرامة.", eq: "@T{autonomy} @uparrow @; @Rightarrow @; @O{cost} @cdot @R{failure modes} @uparrow@uparrow", do: s => {
      s.clear({ at: 0, dur: 0.35 });
      s.chart("ch", {
        x: 780, y: 545, w: 860, h: 400,
        xl: "Autonomy Level (L0 → L4)", yl: "Impact",
        curves: [
          [[0, 0.15], [0.25, 0.35], [0.5, 0.58], [0.75, 0.8], [1, 0.94], "teal", "flexibility"],
          [[0, 0.08], [0.25, 0.14], [0.5, 0.28], [0.75, 0.62], [1, 0.98], "red", "cost · latency · risk"]
        ]
      }, { at: "10%", dur: 1.4 });
      s.callout("ev", { x: 1210, y: 310, label: "Needs strict evals + guardrails", color: "orange", icon: "shield", size: 20 }, { at: "64%" });
    }},
    { say: "الخطأ الشائع بناء وكيل L4 لمهمة يحلها خط ثابت؛ القاعدة: اختر أدنى استقلالية تحل المشكلة.", eq: "@T{choose} @; @min(@T{autonomy}) @; @T{that solves the task}", do: s => {
      s.out(["ch*", "ev"], { at: 0, dur: 0.35 });
      s.versus("vs", "Over-engineered L4 Agent", "Minimal Reliable Level (L1–L2)", { colors: ["red", "green"], h: 460, y: 545 }, { at: "10%" });
      s.col("bad", ["8 LLM turns for 3 fixed steps", "$0.45 / ticket · 18s wait", "unpredictable tool loops"], { x: 440, y: 560, size: 22, w: 500, colors: ["red", "orange", "red"], icons: ["alert", "coin", "loop"] }, { at: "32%", st: 0.15 });
      s.col("ok", ["Fixed 3-step pipeline", "$0.01 / ticket · 1.2s wait", "99% deterministic behavior"], { x: 1160, y: 560, size: 22, w: 500, colors: ["green", "teal", "green"], icons: ["check", "bolt", "shieldok"] }, { at: "52%", st: 0.15 });
      s.mark("mx", "vsL", "x", { at: "74%" });
      s.mark("mc", "vsR", "check", { at: "80%" });
    }},
    { sec: "استقلالية لكل فعل", say: "يمكن ضبط الاستقلالية لكل فعل على حدة: البحث وكتابة المسودة تلقائيًا دون تعطيل.", eq: "@T{autonomy}(@T{action}) @in @{ @G{auto}, @; @Y{approve}, @; @R{forbidden} @}", do: s => {
      s.clear({ at: 0, dur: 0.35 });
      s.code("pol", {
        x: 610, y: 535, size: 21, title: "autonomy_policy.py",
        lines: [
          "AUTONOMY = {",
          "  \"search_docs\":    \"auto\",      # read-only",
          "  \"draft_reply\":    \"auto\",      # reversible",
          "  \"send_email\":     \"approve\",   # side effect",
          "  \"issue_refund\":   \"approve\",   # money leaves",
          "  \"delete_account\": \"forbidden\", # never exposed",
          "}"
        ]
      }, { at: "10%", dur: 1.2 });
      s.to("pol", { hl: 1, hc: "green" }, { at: "45%", dur: 0.25 });
      s.to("pol", { hl: 2, hc: "green" }, { at: "68%", dur: 0.25 });
      s.box("pa", { x: 1290, y: 405, w: 340, h: 96, label: "Read & Draft = auto", sub: "safe, reversible", icon: "check", inline: true, color: "green", size: 22 }, { at: "55%" });
    }},
    { say: "أما الإرسال والدفع فيتطلبان موافقة بشرية، وحذف الحساب ممنوع ولا يُعرض كأداة أصلًا.", do: s => {
      s.to("pol", { hl: 4, hc: "gold" }, { at: "12%", dur: 0.25 });
      s.box("pb", { x: 1290, y: 545, w: 340, h: 96, label: "Send & Pay = approve", sub: "human gate", icon: "hand", inline: true, color: "gold", size: 22 }, { at: "26%" });
      s.to("pol", { hl: 5, hc: "red" }, { at: "58%", dur: 0.25 });
      s.box("pc", { x: 1290, y: 685, w: 340, h: 96, label: "Delete = forbidden", sub: "not in tools[]", icon: "ban", inline: true, color: "red", size: 22 }, { at: "68%" });
      s.mark("mforb", "pc", "x", { at: "84%" });
    }},
    { sec: "الخلاصة", say: "اكتب مستوى الاستقلالية صراحةً في وثيقة التصميم: من يقرر الخطوة، ومن يوافق، وما الحد الأقصى.", do: s => {
      s.clear({ at: 0, dur: 0.35 });
      s.grid("dl", ["Who picks next step?", "Auto / Approve / Forbid", "Max steps & budget"], {
        cols: 3, y: 470, cw: 420, ch: 175, gx: 36, size: 24,
        icons: ["route", "shield", "clock"], colors: ["blue", "gold", "purple"],
        subs: ["code (L0–L2) vs model (L3–L4)", "per-action permission table", "hard horizon cap"]
      }, { at: "10%", st: 0.22 });
      s.callout("doc", { x: 800, y: 715, label: "Write all 3 dials explicitly in your Design Doc", color: "teal", icon: "memo", size: 23 }, { at: "68%" });
    }},
    { say: "ابدأ دائمًا من أدنى درجة، ولا تصعد درجة في سُلّم الوكالة إلا حين يثبت التقييم حاجتك إليها.", eq: "@G{L0@text{--}L2} @; @xrightarrow{@T{eval proves need}} @; @P{L3@text{--}L4}", do: s => {
      s.pulse(["dl0", "dl1", "dl2"], { at: "15%", color: "teal", st: 0.2 });
      s.pulse("doc", { at: "62%", color: "gold", keep: true });
    }}
  ]);

  // ------------------------------------------------------------------ AG1.2 Anatomy of an Agent Turn
  X.lesson("AG1.2", [
    { sec: "بروتوكول اللاسلكي", say: "تحت كل إطار عمل للوكلاء يوجد البروتوكول نفسه: تبادل منظم بين رسائلك والنموذج والأدوات.", eq: "@T{agent loop} = @B{messages} @leftrightarrow @P{LLM} @leftrightarrow @O{tools}", do: s => {
      s.bubble("u0", { text: "Can I get a refund for order 812?", side: "u", x: 320, y: 490, w: 380, label: "user" }, { at: "0%" });
      s.box("llm", { x: 840, y: 490, w: 230, h: 150, label: "LLM API", icon: "brain", color: "purple", size: 28 }, { at: "24%" });
      s.box("rt", { x: 1320, y: 490, w: 240, h: 150, label: "Your Code", icon: "gear", color: "teal", size: 26 }, { at: "42%" });
      s.link("lu", "u0", "llm", { color: "blue", label: "messages[]", pulse: true }, { at: "34%" });
      s.link("lr", "llm", "rt", { color: "orange", bend: -0.22, label: "tool_use", pulse: true }, { at: "58%" });
      s.link("rl", "rt", "llm", { color: "teal", bend: -0.22, label: "tool_result", pulse: true }, { at: "70%" });
    }},
    { say: "يشبه جهاز اللاسلكي: يصدر النموذج كتلة tool_use برمز نداء ويتوقف بسبب stop_reason.", eq: "@T{stop@_reason} = @O{tool@_use}", do: s => {
      s.focus(["llm", "lr"], { at: "8%", zoom: 1.12 });
      s.zone("am", { x: 800, y: 750, w: 1080, h: 165, label: "assistant message · stop_reason: \"tool_use\"", color: "orange", size: 22 }, { at: "24%" });
      s.box("btxt", { x: 520, y: 765, w: 420, h: 66, label: "text: \"Checking order 812…\"", size: 20, color: "dim", font: "ui" }, { at: "42%" });
      s.box("btu", { x: 1060, y: 765, w: 480, h: 66, label: "tool_use · id: tu_1 · get_order(812)", font: "mono", size: 19, color: "orange" }, { at: "60%" });
    }},
    { sec: "دورة الأداة الكاملة", say: "كودك ينفّذ الأداة حتميًا، ثم يعيد كتلة tool_result تحمل معرّف tool_use_id نفسه تمامًا.", eq: "@C{tool@_result}.@T{tool@_use@_id} = @O{tu@_1}", do: s => {
      s.out(["u0", "llm", "rt", "lu", "lr", "rl", "am", "btxt"], { at: 0, dur: 0.35 });
      s.unfocus({ at: "4%", dur: 0.35 });
      s.to("btu", { x: 430, y: 410, w: 470 }, { at: "12%", dur: 0.7 });
      s.box("ex", { x: 800, y: 575, w: 290, h: 86, label: "run get_order(812)", icon: "terminal", inline: true, font: "mono", size: 20, color: "gold" }, { at: "34%" });
      s.box("btr", { x: 1170, y: 410, w: 480, h: 66, label: "tool_result · tu_1 · \"delivered 3d ago\"", font: "mono", size: 19, color: "teal" }, { at: "58%" });
      s.link("l1", "btu", "ex", { color: "orange", pulse: true }, { at: "42%" });
      s.link("l2", "ex", "btr", { color: "teal", pulse: true }, { at: "64%" });
      s.link("lm", "btu", "btr", { color: "gold", dash: "7 6", label: "exact tool_use_id match", lc: "gold" }, { at: "76%" });
    }},
    { say: "وقد يطلب النموذج عدة أدوات معًا؛ نفّذها بالتوازي وأعد كل نتائجها في رسالة مستخدم واحدة.", do: s => {
      s.out(["ex", "l1", "l2"], { at: 0, dur: 0.3 });
      s.box("tu2", { x: 430, y: 530, w: 470, h: 64, label: "tool_use · id: tu_2 · check_policy()", font: "mono", size: 19, color: "orange" }, { at: "18%" });
      s.box("tu3", { x: 430, y: 640, w: 470, h: 64, label: "tool_use · id: tu_3 · get_customer()", font: "mono", size: 19, color: "orange" }, { at: "30%" });
      s.zone("one", { x: 1170, y: 535, w: 540, h: 375, label: "ONE user message (all results)", color: "teal", size: 22 }, { at: "44%" });
      s.box("tr2", { x: 1170, y: 530, w: 480, h: 64, label: "tool_result · tu_2 · \"30-day window\"", font: "mono", size: 19, color: "teal" }, { at: "56%" });
      s.box("tr3", { x: 1170, y: 640, w: 480, h: 64, label: "tool_result · tu_3 · \"VIP tier\"", font: "mono", size: 19, color: "teal" }, { at: "68%" });
      s.stream("tu2", "tr2", { at: "60%", color: "teal", span: 2.0, every: 0.55 });
      s.stream("tu3", "tr3", { at: "70%", color: "teal", span: 2.0, every: 0.55 });
    }},
    { say: "وإذا فشلت أداة فلا تنهر الحلقة: أعد is_error بقيمة true مع رسالة واضحة ليعالجها النموذج.", eq: "@R{is@_error: true} + @G{actionable message} @to @T{self-recovery}", do: s => {
      s.out(["btu", "btr", "lm", "tu2", "tu3", "tr2", "tr3", "one"], { at: 0, dur: 0.35 });
      s.code("erc", {
        x: 560, y: 535, size: 21, title: "tool_result (error is observation)",
        lines: [
          "{",
          "  \"type\": \"tool_result\",",
          "  \"tool_use_id\": \"tu_4\",",
          "  \"is_error\": true,",
          "  \"content\": \"date must be YYYY-MM-DD, got 12/03\"",
          "}"
        ]
      }, { at: "12%", dur: 1.2 });
      s.to("erc", { hl: 3, hc: "red" }, { at: "45%", dur: 0.25 });
      s.to("erc", { hl: 4, hc: "green" }, { at: "68%", dur: 0.25 });
      s.box("rec", { x: 1255, y: 535, w: 390, h: 130, label: "Next turn: 2026-03-12 ✓", sub: "model self-corrects", icon: "check", color: "green", size: 22 }, { at: "72%" });
      s.link("lrc", "erc", "rec", { color: "green", pulse: true }, { at: "76%" });
    }},
    { sec: "أسباب التوقف", say: "افحص stop_reason في كل دورة لتعرف هل انتهى الرد، أم يطلب أداة، أم انقطع، أم رُفض.", eq: "@T{branch on } @Y{stop@_reason} @; @T{every turn}", do: s => {
      s.clear({ at: 0, dur: 0.35 });
      s.box("sw", { x: 350, y: 540, w: 280, h: 130, label: "stop_reason", icon: "split", color: "gold", font: "mono", size: 24 }, { at: "8%" });
      const labels = [
        "end_turn  →  return final answer",
        "tool_use  →  execute tools & loop",
        "max_tokens  →  truncated! handle",
        "pause_turn  →  send again to continue",
        "refusal  →  safe fallback / log"
      ];
      const cols = ["green", "orange", "red", "blue", "purple"];
      s.col("sr", labels, { x: 1030, y: 540, size: 21, font: "mono", h: 66, gap: 16, w: 660, colors: cols }, { at: "24%", st: 0.14 });
      for (let i = 0; i < 5; i++) s.link("sl" + i, "sw", "sr" + i, { color: cols[i], w: 2.5, pulse: i < 2 }, { at: 0.55 + i * 0.14 });
    }},
    { say: "انتبه لخطأ صامت خطير: إضافة النص فقط وحذف كتل التفكير أو tool_use يكسر الدورة التالية.", do: s => {
      s.out(["sw", "sr*", "sl*"], { at: 0, dur: 0.35 });
      s.versus("vs", "Broken: append text only", "Correct: append full resp.content", { colors: ["red", "green"], h: 430, y: 545 }, { at: "10%" });
      s.code("cb", { x: 440, y: 555, size: 20, title: "drops blocks!", lines: ["messages.append({", "  \"role\": \"assistant\",", "  \"content\": resp.text  # BUG!", "})"] }, { at: "30%", dur: 0.9 });
      s.code("cg", { x: 1160, y: 555, size: 20, title: "preserves wire history", lines: ["messages.append({", "  \"role\": \"assistant\",", "  \"content\": resp.content  # ALL blocks", "})"] }, { at: "52%", dur: 0.9 });
      s.mark("xb", "vsL", "x", { at: "74%" });
      s.mark("cgm", "vsR", "check", { at: "80%" });
    }},
    { sec: "كود الحلقة الحقيقي", say: "إليك الحلقة الكاملة في عشرة أسطر حقيقية: نستدعي النموذج ونحفظ محتوى رده كاملًا.", do: s => {
      s.clear({ at: 0, dur: 0.35 });
      s.code("lp", {
        x: 615, y: 540, size: 20, title: "agent_loop.py",
        lines: [
          "messages = [{\"role\": \"user\", \"content\": task}]",
          "for step in range(MAX_STEPS):",
          "    resp = client.messages.create(",
          "        model=MODEL, tools=TOOLS, messages=messages)",
          "    messages.append({\"role\": \"assistant\", \"content\": resp.content})",
          "    if resp.stop_reason != \"tool_use\":",
          "        break",
          "    results = [{\"type\": \"tool_result\", \"tool_use_id\": b.id,",
          "                \"content\": run_tool(b.name, b.input)}",
          "               for b in resp.content if b.type == \"tool_use\"]",
          "    messages.append({\"role\": \"user\", \"content\": results})"
        ]
      }, { at: "8%", dur: 1.5 });
      s.to("lp", { hl: 1, hc: "gold" }, { at: "48%", dur: 0.25 });
      s.to("lp", { hl: 4, hc: "purple" }, { at: "74%", dur: 0.25 });
      s.callout("cap", { x: 1320, y: 380, label: "MAX_STEPS stops runaways", color: "gold", icon: "clock", size: 19 }, { at: "54%" });
    }},
    { say: "إن كان السبب tool_use ننفّذ كل الكتل ونُلحقها برسالة مستخدم واحدة، وإلا نخرج من الحلقة.", do: s => {
      s.to("lp", { hl: 5, hc: "orange" }, { at: "12%", dur: 0.25 });
      s.to("lp", { hl: 8, hc: "teal" }, { at: "45%", dur: 0.25 });
      s.to("lp", { hl: 10, hc: "green" }, { at: "74%", dur: 0.25 });
      s.box("one", { x: 1320, y: 560, w: 350, h: 120, label: "ONE user turn", sub: "all tool_results together", icon: "stack", color: "teal", size: 22 }, { at: "68%" });
      s.link("l10", "lp", "one", { color: "teal", pulse: true }, { at: "74%" });
    }},
    { sec: "ذاكرة العمل", say: "لاحظ أن قائمة messages نفسها هي ذاكرة العمل الكاملة للوكيل في كل دورة جديدة.", eq: "@B{messages[]} = @T{the agent's entire working memory}", do: s => {
      s.out(["lp", "cap", "one", "l10"], { at: 0, dur: 0.35 });
      s.chain("ms", ["user:\nrefund #812?", "assistant:\ntool_use(tu_1)", "user:\ntool_result(tu_1)", "assistant:\nEligible! Done ✓"], {
        y: 500, gap: 55, w: 300, h: 145, size: 21,
        colors: ["blue", "orange", "teal", "green"],
        icons: ["user", "tool", "terminal", "check"], pulse: true
      }, { at: "14%", st: 0.24 });
      s.brace("br", { x1: 120, x2: 1480, y: 610, color: "gold", label: "sent back on every turn — what you append is what it knows" }, { at: "68%" });
    }},
    { say: "لهذا أي معلومة تحذفها أو تختصرها من هذه القائمة تختفي فورًا من وعي النموذج.", do: s => {
      s.focus(["ms1", "ms2"], { at: "15%", zoom: 1.16 });
      s.stream("ms0", "ms3", { at: "30%", color: "gold", span: 2.5, every: 0.55 });
      s.unfocus({ at: "72%", dur: 0.55 });
    }},
    { say: "أتقن هذا البروتوكول البسيط من ثلاث كتل، وستتمكن من فهم وتصحيح أي إطار عمل للوكلاء.", eq: "@O{tool@_use} + @C{tool@_result} + @Y{stop@_reason} = @T{every agent framework}", do: s => {
      s.pulse(["ms0", "ms1", "ms2", "ms3"], { at: "18%", color: "green", st: 0.16 });
      s.callout("fin", { x: 800, y: 760, label: "Master the wire protocol → debug any framework", color: "green", icon: "shieldok", size: 24 }, { at: "52%" });
    }}
  ]);

  // ------------------------------------------------------------------ AG1.3 Should This Be an Agent?
  X.lesson("AG1.3", [
    { sec: "فخ بناء الوكيل", say: "أمامك ميزتان: تصنيف تذكرة دعم، وإصلاح اختبار برمجي فاشل؛ هل كلتاهما تحتاج وكيلًا؟", do: s => {
      s.box("ta", { x: 460, y: 460, w: 460, h: 155, label: "Classify support ticket", sub: "3 fixed categories · 0.3s", icon: "filter", color: "blue", size: 25 }, { at: "8%" });
      s.box("tb", { x: 1140, y: 460, w: 460, h: 155, label: "Fix failing unit test", sub: "unknown files · iterative", icon: "bug", color: "purple", size: 25 }, { at: "36%" });
      s.badge("qa", { x: 460, y: 615, text: "Workflow? or Agent?", color: "gold", size: 22 }, { at: "64%" });
      s.badge("qb", { x: 1140, y: 615, text: "Workflow? or Agent?", color: "gold", size: 22 }, { at: "72%" });
    }},
    { say: "توظيف مستشار خبير لمهمة تكفيها قائمة تحقق يهدر المال؛ لذا نختبر الفكرة بأربعة أسئلة.", eq: "@T{build agent?} = Q_1 @land Q_2 @land Q_3 @land Q_4", do: s => {
      s.out(["ta", "tb", "qa", "qb"], { at: 0, dur: 0.35 });
      s.grid("q", ["1. Complexity?", "2. Value?", "3. Viability?", "4. Cost of Error?"], {
        cols: 4, y: 455, cw: 325, ch: 165, gx: 30, size: 24,
        icons: ["route", "coin", "flask", "alert"],
        colors: ["blue", "gold", "teal", "red"],
        subs: ["unpredictable path?", "outcome > spend?", "pilot eval passes?", "catchable & undoable?"]
      }, { at: "12%", st: 0.22 });
      s.callout("an", { x: 800, y: 710, label: "Consultant (judgment) vs Checklist (fixed steps)", color: "gold", icon: "scale", size: 22 }, { at: "68%" });
    }},
    { sec: "الأسئلة الأربعة", say: "أولًا التعقيد: هل يستحيل برمجة عدد الخطوات وترتيبها مسبقًا، كما في إصلاح اختبار فاشل؟", do: s => {
      s.out("an", { at: 0, dur: 0.25 });
      s.focus("q0", { at: "10%", zoom: 1.18, color: "blue" });
      s.box("ex0", { x: 267, y: 685, w: 320, h: 110, label: "Steps unknown ahead", sub: "grep → edit → test → loop", color: "blue", size: 20 }, { at: "38%" });
      s.link("lq0", "q0", "ex0", { color: "blue", pulse: true }, { at: "46%" });
    }},
    { say: "ثانيًا القيمة: تشغيل الوكيل يكلّف أضعاف رد المحادثة؛ فهل العائد يبرر التكلفة والزمن؟", eq: "@G{value@_per@_run} > @O{estimated@_cost}", do: s => {
      s.focus(["q1"], { at: "8%", zoom: 1.18, color: "gold" });
      s.box("ex1", { x: 622, y: 685, w: 320, h: 110, label: "Agent ≫ Chat cost", sub: "save 40 min dev time ✓", color: "gold", size: 20 }, { at: "36%" });
      s.link("lq1", "q1", "ex1", { color: "gold", pulse: true }, { at: "44%" });
    }},
    { say: "ثالثًا الجدوى: شغّل تقييمًا تجريبيًا صغيرًا؛ إن فشل النموذج في المهارة الأساسية فلن ينقذه الهيكل.", do: s => {
      s.focus(["q2"], { at: "8%", zoom: 1.18, color: "teal" });
      s.box("ex2", { x: 977, y: 685, w: 320, h: 110, label: "Pilot eval ≥ 60%", sub: "test core skill first", color: "teal", size: 20 }, { at: "36%" });
      s.link("lq2", "q2", "ex2", { color: "teal", pulse: true }, { at: "44%" });
    }},
    { say: "رابعًا تكلفة الخطأ: تنجح وكلاء البرمجة لأن الاختبارات وGit تجعل الأخطاء مرئية وقابلة للتراجع.", do: s => {
      s.focus(["q3"], { at: "8%", zoom: 1.18, color: "red" });
      s.box("ex3", { x: 1332, y: 685, w: 320, h: 110, label: "Tests + Git revert", sub: "cheap to catch & undo", color: "red", size: 20 }, { at: "36%" });
      s.link("lq3", "q3", "ex3", { color: "red", pulse: true }, { at: "44%" });
      s.unfocus({ at: "76%", dur: 0.5 });
    }},
    { sec: "إجابة لا واحدة", say: "إجابة «لا» واحدة في هذا الاختبار تعني فورًا: ابقَ مع سير عمل ثابت ولا تبنِ وكيلًا.", eq: "@T{any } @R{False} @; @Rightarrow @; @B{stay with a workflow}", do: s => {
      s.clear({ at: 0, dur: 0.35 });
      s.code("fn", {
        x: 615, y: 530, size: 21, title: "should_be_agent.py",
        lines: [
          "def should_be_agent(task) -> bool:",
          "    return all([",
          "        task.steps_unpredictable,                 # complexity",
          "        task.value_per_run > task.estimated_cost, # value",
          "        pilot_eval(task).pass_rate >= 0.6,        # viability",
          "        task.errors_detectable and task.reversible# error cost",
          "    ])"
        ]
      }, { at: "10%", dur: 1.3 });
      s.to("fn", { hl: 2, hc: "blue" }, { at: "42%", dur: 0.2 });
      s.to("fn", { hl: 4, hc: "teal" }, { at: "60%", dur: 0.2 });
      s.to("fn", { hl: 5, hc: "red" }, { at: "76%", dur: 0.2 });
      s.box("no", { x: 1315, y: 530, w: 340, h: 130, label: "One False → Workflow", sub: "faster, cheaper, safer", icon: "route", color: "blue", size: 22 }, { at: "66%" });
      s.link("lno", "fn", "no", { color: "blue", pulse: true }, { at: "72%" });
    }},
    { say: "نصيحة عملية: جرّب المهمة أولًا بأمر واحد متقن مع كل السياق؛ إن نجح فلا حاجة لحلقة وكيل.", do: s => {
      s.out(["fn", "no", "lno"], { at: 0, dur: 0.35 });
      s.chain("pr", ["1. Single Prompt\n+ Full Context", "Passes Eval?", "Ship Simple ✓\n(No Loop Needed)"], {
        x: 680, y: 450, gap: 90, w: 280, h: 140, size: 22,
        colors: ["teal", "gold", "green"], icons: ["bolt", "eval", "check"], pulse: true
      }, { at: "14%", st: 0.28 });
      s.box("ag", { x: 1290, y: 695, w: 310, h: 110, label: "Only if fails → Agent", icon: "bot", inline: true, color: "purple", size: 22 }, { at: "64%" });
      s.link("lf", "pr1", "ag", { color: "purple", bend: 0.18, label: "No", lc: "purple", pulse: true }, { at: "70%" });
    }},
    { sec: "سطح التحقق", say: "والمهمة المثالية للوكيل تمتلك «سطح تحقق» موضوعيًا يفحص عمله: اختبارات أو مدققات أو حَكَم أو إنسان.", eq: "@T{good agent task} @Rightarrow @G{verification surface}", do: s => {
      s.clear({ at: 0, dur: 0.35 });
      s.box("out", { x: 330, y: 530, w: 260, h: 145, label: "Agent Work", icon: "bot", color: "purple", size: 25 }, { at: "8%" });
      s.col("vs", ["Unit & E2E Tests", "Schema & Code Validators", "Calibrated LLM Judge", "Human Approval Gate"], {
        x: 1080, y: 530, size: 23, w: 500, h: 74, gap: 22,
        icons: ["check", "code", "scale", "user"],
        colors: ["green", "teal", "purple", "blue"]
      }, { at: "26%", st: 0.16 });
      for (let i = 0; i < 4; i++) s.link("lv" + i, "out", "vs" + i, { color: ["green", "teal", "purple", "blue"][i], pulse: true }, { at: 0.45 + i * 0.14 });
    }},
    { say: "قارن: إصلاح اختبار برمجي يجتاز الأسئلة الأربعة، بينما تحويل 50 ألف دولار تلقائيًا يفشل في تكلفة الخطأ.", do: s => {
      s.out(["out", "vs*", "lv*"], { at: 0, dur: 0.35 });
      s.versus("cmp", "Fix Failing pytest ✓", "Auto-Wire $50,000 ✗", { colors: ["green", "red"], h: 450, y: 545 }, { at: "10%" });
      s.col("ga", ["Unpredictable debugging ✓", "High developer value ✓", "Strong pilot score ✓", "Tests + Git revert ✓"], { x: 440, y: 560, size: 22, w: 480, h: 58, gap: 16, colors: ["green", "green", "green", "green"] }, { at: "30%", st: 0.12 });
      s.col("gb", ["Irreversible financial loss ✗", "No safe automated rollback ✗", "High fraud / injection risk ✗", "Must stay human-gated ✗"], { x: 1160, y: 560, size: 22, w: 480, h: 58, gap: 16, colors: ["red", "red", "red", "orange"] }, { at: "50%", st: 0.12 });
      s.mark("mg", "cmpL", "check", { at: "74%" });
      s.mark("mb", "cmpR", "x", { at: "80%" });
    }},
    { sec: "خارطة القرار", say: "اختصر القرار في مسار واضح: تعقيد غير متوقع، وقيمة عالية، وجدوى مُثبتة، وخطأ قابل للتدارك.", do: s => {
      s.clear({ at: 0, dur: 0.35 });
      s.chain("fnl", ["Unpredictable?", "High Value?", "Pilot ≥ 60%?", "Reversible?", "Build Agent ✓"], {
        y: 445, gap: 45, w: 235, h: 120, size: 21,
        colors: ["blue", "gold", "teal", "red", "green"],
        icons: ["route", "coin", "flask", "shieldok", "bot"], pulse: true
      }, { at: "10%", st: 0.18 });
      s.box("wf", { x: 800, y: 720, w: 560, h: 80, label: "Any NO → Structured Workflow / 1 Prompt", icon: "bolt", inline: true, color: "blue", size: 23 }, { at: "64%" });
      s.link("lwf", "fnl1", "wf", { color: "dim", dash: "6 6", label: "No" }, { at: "74%" });
    }},
    { say: "الوكلاء يشترون المرونة بثمن الزمن والمال؛ فلا تدفع هذا الثمن إلا حين تقول الأسئلة الأربعة: نعم.", eq: "@G{Agent} @iff @B{Complex} @land @Y{Valuable} @land @C{Viable} @land @P{Verifiable}", do: s => {
      s.stream("fnl0", "fnl4", { at: "15%", color: "green", span: 2.6, every: 0.55 });
      s.pulse("fnl4", { at: "60%", color: "green", keep: true });
    }}
  ]);

  // ------------------------------------------------------------------ AG1.4 Environments & the ACI
  X.lesson("AG1.4", [
    { sec: "قمرة القيادة", say: "الوكيل جيد بقدر العالم الذي يراه ويلمسه؛ طيّار بارع في قمرة عداداتها مشوشة سيتحطم حتمًا.", eq: "@T{ACI} @; @approx @; @T{UX for agents}", do: s => {
      s.box("ag", { x: 800, y: 535, w: 220, h: 130, label: "Agent", icon: "bot", color: "purple", size: 28 }, { at: "0%" });
      s.hub("ag", "orb", ["Observations", "Actions (Tools)", "Env State", "Feedback", "Permissions"], {
        rx: 380, ry: 225, w: 245, h: 72, size: 22,
        colors: ["teal", "orange", "blue", "green", "red"],
        icons: ["eye", "tool", "globe", "check", "lock"], inline: true, head: true, pulse: true
      }, { at: "28%", st: 0.15 });
    }},
    { say: "في مشروع SWE-bench، أنفقت Anthropic وقتًا على تحسين الأدوات وواجهة ACI أكثر من الأمر العام نفسه.", do: s => {
      s.out(["ag", "orb*"], { at: 0, dur: 0.35 });
      s.bars("tm", [
        ["Optimizing tools (ACI)", 0.82, "teal", "~70% of effort"],
        ["Tuning main prompt", 0.32, "dim", "~30% of effort"]
      ], { x: 560, y: 495, w: 580, gap: 120, size: 27, h: 38 }, { at: "14%" });
      s.callout("sw", { x: 800, y: 730, label: "SWE-bench Lesson: Invest in ACI as much as human UI", color: "gold", icon: "star", size: 23 }, { at: "60%" });
    }},
    { sec: "الملاحظات والأفعال", say: "أول ركن في ACI هو الملاحظات: أعد أسماء ومعرّفات مقروءة، لا 5000 سطر من السجلات الخام.", do: s => {
      s.clear({ at: 0, dur: 0.35 });
      s.box("ag", { x: 300, y: 525, w: 210, h: 145, label: "Agent", icon: "bot", color: "purple", size: 26 }, { at: "6%" });
      s.box("env", { x: 1300, y: 525, w: 230, h: 145, label: "Environment", icon: "globe", color: "teal", size: 24 }, { at: "14%" });
      s.link("act", "ag", "env", { color: "orange", bend: -0.26, label: "actions", lc: "orange", pulse: true }, { at: "24%" });
      s.link("obs", "env", "ag", { color: "teal", bend: -0.26, label: "observations", lc: "teal", pulse: true }, { at: "32%" });
      s.doc("raw", { x: 640, y: 525, w: 140, h: 185, lines: 10, title: "5,000 raw lines", color: "red" }, { at: "46%" });
      s.mark("mr", "raw", "x", { at: "58%" });
      s.box("cln", { x: 960, y: 525, w: 320, h: 115, label: "3 failing tests:\ntest_tax · line 42", size: 21, font: "mono", color: "green" }, { at: "66%" });
      s.mark("mc", "cln", "check", { at: "78%" });
    }},
    { say: "والركن الثاني مساحة الأفعال: ثلاث أدوات واضحة وغير متداخلة تتفوق على عشرات الأدوات المتشابهة.", eq: "@G{3 crisp tools} @succ @R{30 overlapping tools}", do: s => {
      s.out(["raw", "mr", "cln", "mc"], { at: 0, dur: 0.3 });
      for (let i = 0; i < 9; i++) s.box("ms" + i, { x: 560 + (i % 3) * 95, y: 455 + Math.floor(i / 3) * 68, w: 84, h: 52, label: "tool", size: 17, color: "red" }, { at: 0.3 + i * 0.04 });
      s.col("gt", ["read_file", "edit_file", "run_tests"], { x: 975, y: 525, w: 250, h: 62, gap: 18, font: "mono", size: 22, colors: ["green", "green", "green"] }, { at: "50%", st: 0.14 });
      s.badge("bcl", { x: 975, y: 695, text: "clear, non-overlapping", color: "green", size: 20 }, { at: "76%" });
    }},
    { say: "والركن الثالث حلقات التغذية الراجعة: المترجم والمدقق والاختبارات تربط الوكيل بالواقع فورًا.", do: s => {
      s.out(["ms*", "gt*", "bcl"], { at: 0, dur: 0.3 });
      s.row("fb", ["Compiler", "Linter", "Test Suite", "Validator"], { x: 800, y: 525, size: 23, gap: 22, colors: ["orange", "gold", "green", "teal"], pad: 22, h: 66 }, { at: "18%", st: 0.14 });
      s.stream("env", "ag", { at: "35%", color: "green", bend: -0.26, span: 2.6, every: 0.5 });
      s.callout("rc", { x: 800, y: 715, label: "Reality checks turn guesses into grounded facts", color: "green", icon: "shieldok", size: 22 }, { at: "62%" });
    }},
    { sec: "منع الخطأ Poka-Yoke", say: "طبّق مبدأ Poka-Yoke في تصميم الأدوات: صمّم المعاملات بحيث يستحيل استدعاء الأداة بشكل خاطئ.", eq: "@T{Poka-yoke}: @; @T{make the wrong call impossible}", do: s => {
      s.clear({ at: 0, dur: 0.35 });
      s.box("err", { x: 460, y: 525, w: 460, h: 140, label: "path: \"../src/cart.py\"", sub: "relative path fails after cd!", icon: "alert", color: "red", font: "mono", size: 22 }, { at: "10%" });
      s.mark("xe", "err", "x", { at: "32%" });
      s.box("fix", { x: 1140, y: 525, w: 460, h: 140, label: "path: \"/app/src/cart.py\"", sub: "regex pattern ^/ enforced", icon: "shieldok", color: "green", font: "mono", size: 22 }, { at: "52%" });
      s.link("lpf", "err", "fix", { color: "green", label: "mistake-proof", pulse: true }, { at: "58%" });
      s.mark("cf", "fix", "check", { at: "76%" });
    }},
    { say: "في مخطط edit_file نشترط مسارًا مطلقًا يبدأ بشرطة مائلة، مع النص القديم والجديد بدقة.", do: s => {
      s.out(["err", "xe", "fix", "lpf", "cf"], { at: 0, dur: 0.35 });
      s.code("sc", {
        x: 615, y: 535, size: 20, title: "edit_file_schema.json",
        lines: [
          "{",
          "  \"name\": \"edit_file\",",
          "  \"description\": \"Replace exact snippet. Path MUST be absolute.\",",
          "  \"input_schema\": {",
          "    \"properties\": {",
          "      \"path\":     {\"type\": \"string\", \"pattern\": \"^/\"},",
          "      \"old_text\": {\"type\": \"string\"},",
          "      \"new_text\": {\"type\": \"string\"}",
          "    },",
          "    \"required\": [\"path\", \"old_text\", \"new_text\"]",
          "  }",
          "}"
        ]
      }, { at: "8%", dur: 1.3 });
      s.to("sc", { hl: 5, hc: "green" }, { at: "50%", dur: 0.25 });
      s.to("sc", { hl: 9, hc: "gold" }, { at: "76%", dur: 0.25 });
      s.box("pk1", { x: 1320, y: 460, w: 340, h: 100, label: "Absolute paths", sub: "eliminates cwd bugs", icon: "lock", inline: true, color: "green", size: 22 }, { at: "56%" });
    }},
    { say: "استخدم قوائم القيم المحددة enums بدل النص الحر، فتمنع الأخطاء الإملائية قبل التنفيذ أصلًا.", do: s => {
      s.box("pk2", { x: 1320, y: 615, w: 340, h: 100, label: "Strict enums", sub: "no free-text typos", icon: "list", inline: true, color: "teal", size: 22 }, { at: "24%" });
      s.pulse("pk1", { at: "56%", color: "green" });
      s.pulse("pk2", { at: "70%", color: "teal", keep: true });
    }},
    { sec: "اختبار السجلات", say: "كيف تكتشف عيوب واجهة ACI؟ اقرأ سجلات التشغيل: كل خطوة مرتبكة تشير إلى أداة أو ملاحظة ناقصة.", do: s => {
      s.out(["sc", "pk1", "pk2"], { at: 0, dur: 0.35 });
      s.code("tr", {
        x: 800, y: 475, size: 22, title: "agent_trace.log",
        lines: [
          "step 3: search(\"tax\")     → 40 snippets (no file paths)",
          "step 4: search(\"tax vat\") → 40 snippets (agent confused)",
          "step 5: search(\"calc_tax\")→ repeated 4 times!",
          "# Diagnosis: observation lacked file path + line number",
          "# ACI Fix:   return \"src/tax.py:42  def calc_tax(...)\""
        ]
      }, { at: "10%", dur: 1.4 });
      s.to("tr", { hl: 2, hc: "red" }, { at: "48%", dur: 0.25 });
      s.to("tr", { hl: 4, hc: "green" }, { at: "76%", dur: 0.25 });
    }},
    { say: "بمجرد إضافة مسار الملف ورقم السطر إلى ناتج البحث، هبطت الخطوات من تسع إلى ثلاث فقط.", do: s => {
      s.out("tr", { at: 0, dur: 0.35 });
      s.bars("imp", [
        ["Before ACI fix", 0.9, "red", "9 confused steps"],
        ["After adding path:line", 0.3, "green", "3 crisp steps ✓"]
      ], { x: 560, y: 525, w: 600, gap: 120, size: 27, h: 38 }, { at: "14%" });
      s.callout("tr2", { x: 800, y: 745, label: "Read 20 traces after every tool change", color: "teal", icon: "eye", size: 23 }, { at: "62%" });
    }},
    { sec: "ثلاثية ACI", say: "صمّم واجهة الوكيل بثلاث ركائز: ملاحظات موجزة، وأدوات مانعة للخطأ، وتغذية راجعة حقيقية.", do: s => {
      s.clear({ at: 0, dur: 0.35 });
      s.grid("ac", ["Concise Observations", "Poka-Yoke Actions", "Objective Feedback"], {
        cols: 3, y: 485, cw: 420, ch: 185, gx: 36, size: 25,
        icons: ["eye", "shieldok", "check"], colors: ["teal", "orange", "green"],
        subs: ["paths, IDs, high signal", "strict schemas, enums, ^/", "tests, linters, compilers"]
      }, { at: "10%", st: 0.2 });
    }},
    { say: "تذكّر: استثمار ساعة في تحسين أدواتك وملاحظاتك يغلب عشر ساعات في تلميع نص الأمر.", eq: "@T{Great Agent} = @P{Model} + @C{Clean Obs} + @G{Mistake-Proof Tools}", do: s => {
      s.pulse(["ac0", "ac1", "ac2"], { at: "18%", color: "gold", st: 0.18 });
      s.callout("fin", { x: 800, y: 730, label: "ACI is the cockpit — build it with human-UI craft", color: "gold", icon: "star", size: 24 }, { at: "52%" });
    }}
  ]);

  // ------------------------------------------------------------------ AG2.1 Planning Strategies
  X.lesson("AG2.1", [
    { sec: "خريطة المدينة", say: "لنفترض مهمة: قارن إيرادات الربع الثاني لشركتين واحسب الفارق؛ متى يجب أن يخطط الوكيل؟", do: s => {
      s.bubble("q", { text: "Compare Q2 revenue of ACME vs Beta and compute the gap.", side: "u", x: 800, y: 375, w: 720, label: "User Goal" }, { at: "0%" });
      s.grid("st", ["ReAct", "Plan-and-Execute", "ReWOO"], {
        cols: 3, y: 635, cw: 380, ch: 155, gx: 40, size: 26,
        icons: ["loop", "route", "bolt"], colors: ["orange", "purple", "teal"],
        subs: ["plan 1 step at a time", "plan first, replan on surprise", "plan all tool calls upfront"]
      }, { at: "34%", st: 0.2 });
    }},
    { say: "ReAct كالسؤال عند كل زاوية في مدينة جديدة، بينما Plan-and-Execute يرسم المسار على الخريطة أولًا.", do: s => {
      s.focus(["st0", "st1"], { at: "14%", zoom: 1.12 });
      s.callout("an", { x: 800, y: 805, label: "Ask at every corner (ReAct)  vs  Map route first (Plan-and-Execute)", color: "gold", icon: "pin", size: 21 }, { at: "45%" });
      s.unfocus({ at: "80%", dur: 0.45 });
    }},
    { sec: "ReAct", say: "نمط ReAct يكرر: تفكير ثم فعل ثم ملاحظة؛ مرن جدًا للمهام الاستكشافية لكنه قصير النظر.", eq: "@T{ReAct}: @; @P{think}_t @to @O{act}_t @to @C{obs}_t", do: s => {
      s.clear({ at: 0, dur: 0.35 });
      s.chain("ra", ["Think", "Act (Tool)", "Observe", "Think Again", "Act…"], {
        y: 475, gap: 55, w: 225, h: 105, size: 22,
        colors: ["purple", "orange", "teal", "purple", "orange"], pulse: true
      }, { at: "10%", st: 0.18 });
      s.callout("rp", { x: 520, y: 695, label: "✓ Adapts after every clue", color: "green", size: 22 }, { at: "52%" });
      s.callout("rc", { x: 1080, y: 695, label: "✗ Full LLM call every step", color: "red", size: 22 }, { at: "68%" });
    }},
    { sec: "خطط ثم نفّذ", say: "أما Plan-and-Execute فيكتب خطة مرقّمة بنموذج قوي أولًا، ثم ينفّذ الخطوات بنموذج أرخص.", eq: "@P{planner} @to [s_1, s_2, s_3] @to @C{cheap executors}", do: s => {
      s.out(["ra*", "rp", "rc"], { at: 0, dur: 0.35 });
      s.box("pl", { x: 320, y: 530, w: 250, h: 155, label: "Planner", sub: "strong model", icon: "brain", color: "purple", size: 26 }, { at: "10%" });
      s.col("ps", ["1. Fetch ACME Q2", "2. Fetch Beta Q2", "3. Compute gap"], { x: 800, y: 530, w: 320, h: 72, gap: 28, size: 22, colors: ["teal", "teal", "teal"] }, { at: "30%", st: 0.14 });
      s.box("ex", { x: 1290, y: 530, w: 260, h: 155, label: "Executor", sub: "fast & cheap", icon: "bolt", color: "teal", size: 26 }, { at: "52%" });
      for (let i = 0; i < 3; i++) {
        s.link("lp" + i, "pl", "ps" + i, { color: "purple", pulse: true }, { at: 0.45 + i * 0.1 });
        s.link("le" + i, "ps" + i, "ex", { color: "teal", pulse: true }, { at: 0.75 + i * 0.1 });
      }
    }},
    { say: "وعندما تفشل خطوة أو تظهر حقيقة جديدة، يعود فورًا إلى المخطط لتعديل المسار من الأدلة.", do: s => {
      s.to("ps1", { stroke: "red", label: "2. Beta Q2 → 404 ✗" }, { at: "16%", dur: 0.35 });
      s.focus(["ps1", "pl"], { at: "28%", zoom: 1.15 });
      s.link("rpl", "ps1", "pl", { color: "orange", bend: 0.32, label: "re-plan from evidence", lc: "orange", pulse: true }, { at: "46%" });
      s.stream("ps1", "pl", { at: "56%", color: "orange", bend: 0.32, span: 2.0, every: 0.55 });
      s.unfocus({ at: "80%", dur: 0.45 });
    }},
    { sec: "ReWOO", say: "ويذهب ReWOO أبعد: يخطط لكل استدعاءات الأدوات مسبقًا بمتغيرات مثل #E1 ثم ينفّذها دفعة واحدة.", eq: "@Y{#E1}=@T{search}(A), @; @Y{#E2}=@T{search}(B), @; @Y{#E3}=@T{calc}(@Y{#E1}-@Y{#E2})", do: s => {
      s.out(["pl", "ps*", "ex", "lp*", "le*", "rpl"], { at: 0, dur: 0.35 });
      s.code("rw", {
        x: 590, y: 530, size: 21, title: "rewoo_plan.txt",
        lines: [
          "#E1 = search(\"ACME Q2 revenue\")",
          "#E2 = search(\"Beta Q2 revenue\")",
          "#E3 = calculator(\"#E1 - #E2\")",
          "SOLVE: summarize gap from #E3"
        ]
      }, { at: "12%", dur: 1.2 });
      s.to("rw", { hl: 0, hc: "teal" }, { at: "46%", dur: 0.2 });
      s.to("rw", { hl: 2, hc: "gold" }, { at: "68%", dur: 0.2 });
      s.box("sv", { x: 1275, y: 530, w: 360, h: 145, label: "2 LLM calls total", sub: "1 plan + 1 solve · saves tokens", icon: "coin", color: "green", size: 23 }, { at: "58%" });
      s.link("lrw", "rw", "sv", { color: "green", pulse: true }, { at: "64%" });
    }},
    { sec: "كود التنفيذ والمقارنة", say: "في كود Plan-and-Execute ننفّذ خطوة خطوة، ونسجّل النتيجة، ولا نعيد التخطيط إلا عند المفاجآت.", do: s => {
      s.clear({ at: 0, dur: 0.35 });
      s.code("pe", {
        x: 615, y: 535, size: 21, title: "plan_and_execute.py",
        lines: [
          "plan = planner(goal)                    # strong model",
          "while plan.has_next():",
          "    step = plan.next()",
          "    result = executor(step, tools=TOOLS)# cheaper model",
          "    state.record(step, result)",
          "    if result.failed or result.new_facts:",
          "        plan = planner(goal, history=state)"
        ]
      }, { at: "10%", dur: 1.3 });
      s.to("pe", { hl: 0, hc: "purple" }, { at: "42%", dur: 0.2 });
      s.to("pe", { hl: 3, hc: "teal" }, { at: "60%", dur: 0.2 });
      s.to("pe", { hl: 6, hc: "orange" }, { at: "78%", dur: 0.2 });
      s.callout("rev", { x: 1320, y: 535, label: "Visible plan = ideal\nhuman review gate", color: "gold", icon: "eye", size: 21, h: 92 }, { at: "55%" });
    }},
    { say: "قارن استهلاك استدعاءات النموذج: ReAct الأعلى مرونة وتكلفة، وReWOO الأقل استدعاءً، وPlan-and-Execute متوازن.", do: s => {
      s.out(["pe", "rev"], { at: 0, dur: 0.35 });
      s.bars("cm", [
        ["ReAct (exploratory)", 0.88, "orange", "high calls · high adaptivity"],
        ["Plan-and-Execute", 0.52, "purple", "balanced · reviewable"],
        ["ReWOO (decoupled)", 0.26, "teal", "min tokens · low adaptivity"]
      ], { x: 540, y: 525, w: 500, gap: 110, size: 25, h: 34 }, { at: "14%" });
    }},
    { sec: "النماذج الحديثة والحالة", say: "نماذج التفكير الحديثة تمزج هذه الأنماط داخليًا: تخطط ثم تستدعي أداة وتعدل خطتها بين الأدوات.", do: s => {
      s.out("cm*", { at: 0, dur: 0.35 });
      s.chain("mx", ["Internal Plan", "Tool Call", "Revise Plan", "Tool Call", "Answer ✓"], {
        y: 445, gap: 45, w: 230, h: 95, size: 21,
        colors: ["purple", "orange", "purple", "orange", "green"], pulse: true
      }, { at: "12%", st: 0.18 });
      s.stream("mx0", "mx4", { at: "45%", color: "purple", span: 2.5, every: 0.6 });
    }},
    { say: "ومهما كانت الاستراتيجية، خزّن الخطة في الحالة لا في المحادثة فقط لتنجو من الانهيار وضغط السياق.", eq: "@T{plan in durable state} @Rightarrow @T{survives retries @& compaction}", do: s => {
      s.box("st", { x: 800, y: 685, w: 540, h: 105, label: "Plan Stored in Persistent State", sub: "survives crash, retry & context reset", icon: "save", inline: true, color: "gold", size: 23 }, { at: "18%" });
      s.link("lst", "mx2", "st", { color: "gold", tail: true, pulse: true }, { at: "42%" });
      s.pulse("st", { at: "70%", color: "gold", keep: true });
    }},
    { sec: "متى تختار؟", say: "للاستكشاف المفتوح اختر ReAct، وللمهام الطويلة Plan-and-Execute، وللتقارير الثابتة ReWOO.", do: s => {
      s.clear({ at: 0, dur: 0.35 });
      s.grid("ch", ["Exploratory → ReAct", "Long / Costly → Plan & Exec", "Fixed Graph → ReWOO"], {
        cols: 3, y: 470, cw: 420, ch: 170, gx: 36, size: 24,
        icons: ["search", "route", "bolt"], colors: ["orange", "purple", "teal"],
        subs: ["clues shift next step", "strong planner + cheap worker", "minimum token round-trips"]
      }, { at: "10%", st: 0.2 });
      s.callout("gs", { x: 800, y: 715, label: "Always persist the plan in state + show it for high-stakes review", color: "gold", icon: "save", size: 22 }, { at: "62%" });
    }},
    { say: "اختيار توقيت التخطيط يحدد تكلفة الوكيل وموثوقيته قبل أن تكتب سطر كود واحدًا.", eq: "@T{right planning cadence} = @G{lower cost} + @B{higher reliability}", do: s => {
      s.pulse(["ch0", "ch1", "ch2"], { at: "18%", color: "teal", st: 0.18 });
      s.pulse("gs", { at: "64%", color: "gold", keep: true });
    }}
  ]);

  // ------------------------------------------------------------------ AG2.2 Task Decomposition & Living To-Do Lists
  X.lesson("AG2.2", [
    { sec: "فقدان الخيط", say: "في مهمة طويلة كإضافة تصدير CSV عبر 18 خطوة، يفقد الوكيل الخيط وينسى الاختبارات عند الخطوة 14.", do: s => {
      s.row("st", ["1. Read", "2. Edit", "3. Route", "…10 calls…", "14. Forgot tests!"], {
        x: 800, y: 455, size: 22, gap: 18,
        colors: ["teal", "teal", "teal", "dim", "red"], pad: 20, h: 66
      }, { at: "10%", st: 0.14 });
      s.to(["st0", "st1"], { opacity: 0.28 }, { at: "52%", dur: 0.6 });
      s.mark("mx", "st4", "x", { at: "68%" });
      s.callout("al", { x: 800, y: 645, label: "Plan kept only in chat history scrolls out of attention", color: "red", icon: "alert", size: 22 }, { at: "60%" });
    }},
    { say: "قائمة التحقق لا تجعل الجرّاح أذكى، لكنها تمنعه من نسيان بديهية في الساعة الثالثة؛ هذه قائمة المهام الحيّة.", eq: "@T{sustained focus} = @Y{external checklist} + @G{1 active step}", do: s => {
      s.out(["st*", "mx", "al"], { at: 0, dur: 0.35 });
      s.box("ag", { x: 350, y: 525, w: 230, h: 150, label: "Agent", icon: "bot", color: "purple", size: 28 }, { at: "12%" });
      s.zone("td", { x: 1030, y: 535, w: 720, h: 480, label: "Living To-Do List (External Artifact)", color: "gold", size: 24 }, { at: "26%" });
      s.link("lat", "ag", "td", { color: "gold", tail: true, label: "write_todos()", lc: "gold", pulse: true }, { at: "48%" });
      s.callout("sr", { x: 350, y: 725, label: "Surgeon's checklist\nprevents hour-3 drift", color: "teal", icon: "todo", size: 20, h: 78 }, { at: "66%" });
    }},
    { sec: "قائمة المهام الحيّة", say: "فكّك الهدف إلى خطوات فرعية، لكل خطوة معيار «انتهى» قابل للتحقق بوضوح.", do: s => {
      s.out("sr", { at: 0, dur: 0.25 });
      const items = [
        "☐ 1. Read existing export module",
        "☐ 2. Add GET /export CSV endpoint",
        "☐ 3. Write unit + edge-case tests",
        "☐ 4. Run pytest & fix all failures",
        "☐ 5. Summarize diff for user"
      ];
      s.col("it", items, { x: 1030, y: 550, w: 620, h: 60, gap: 16, size: 21, font: "ui", colors: ["soft", "soft", "soft", "soft", "soft"] }, { at: "14%", st: 0.14 });
    }},
    { say: "واشترط قاعدة صارمة: عنصر واحد فقط يكون في حالة in_progress في كل لحظة لمنع التشتت.", do: s => {
      s.to("it0", { stroke: "gold", label: "▶ 1. Read existing export module  [in_progress]" }, { at: "16%", dur: 0.3 });
      s.focus(["td", "it0"], { at: "28%", zoom: 1.12 });
      s.badge("one", { x: 350, y: 705, text: "exactly 1 in_progress", color: "gold", size: 22 }, { at: "52%" });
      s.unfocus({ at: "80%", dur: 0.4 });
    }},
    { say: "تحديث القائمة بعد كل خطوة يعمل كنقطة تأمل خفيفة تؤكد إنجاز السابق وتنتقل للتالي.", do: s => {
      s.flow("ag", "td", { color: "green", at: "10%" });
      s.to("it0", { stroke: "green", label: "☑ 1. Read existing export module  [done]" }, { at: "20%", dur: 0.3 });
      s.to("it1", { stroke: "gold", label: "▶ 2. Add GET /export CSV endpoint [in_progress]" }, { at: "34%", dur: 0.3 });
      s.flow("ag", "td", { color: "green", at: "58%" });
      s.to("it1", { stroke: "green", label: "☑ 2. Add GET /export CSV endpoint [done]" }, { at: "68%", dur: 0.3 });
      s.to("it2", { stroke: "gold", label: "▶ 3. Write unit + edge-case tests [in_progress]" }, { at: "80%", dur: 0.3 });
    }},
    { say: "ولأنها محفوظة في ملف أو حالة خارجية، تنجو من ضغط السياق وإعادة التشغيل وتستأنف فورًا.", do: s => {
      s.out("one", { at: 0, dur: 0.2 });
      s.to("ag", { opacity: 0.3, stroke: "orange" }, { at: "12%", dur: 0.35 });
      s.icon("rs", { name: "refresh", x: 350, y: 700, s: 60, color: "orange" }, { at: "16%" });
      s.to("rs", { rot: 360 }, { at: "22%", dur: 1.0 });
      s.to("ag", { opacity: 1, stroke: "green", label: "Fresh Window" }, { at: "55%", dur: 0.4 });
      s.stream("td", "ag", { at: "60%", color: "gold", span: 2.0, every: 0.5 });
      s.pulse("it2", { at: "74%", color: "gold" });
    }},
    { sec: "أداة write_todos", say: "تُبنى هذه الآلية بأداة بسيطة تسمى write_todos بمخطط صارم لثلاث حالات فقط.", do: s => {
      s.clear({ at: 0, dur: 0.35 });
      s.code("wt", {
        x: 610, y: 535, size: 20, title: "write_todos_schema.json",
        lines: [
          "WRITE_TODOS = {",
          "  \"name\": \"write_todos\",",
          "  \"description\": \"Replace list. Only ONE item in_progress.\",",
          "  \"input_schema\": {",
          "    \"todos\": {\"type\": \"array\", \"items\": {",
          "      \"content\": {\"type\": \"string\"},",
          "      \"status\":  {\"enum\": [\"pending\", \"in_progress\", \"done\"]}",
          "    }}",
          "  }",
          "}"
        ]
      }, { at: "10%", dur: 1.3 });
      s.to("wt", { hl: 2, hc: "gold" }, { at: "48%", dur: 0.25 });
      s.to("wt", { hl: 6, hc: "teal" }, { at: "74%", dur: 0.25 });
      s.box("st", { x: 1320, y: 535, w: 340, h: 145, label: "3 Strict States", sub: "pending · in_progress · done", icon: "list", color: "teal", size: 23 }, { at: "64%" });
    }},
    { say: "واعرض هذه القائمة مباشرة في واجهة المستخدم؛ فالثقة ترتفع كثيرًا حين يرى المستخدم الخطة والتقدم.", eq: "@T{visible TODO} @Rightarrow @G{focus} + @B{resumability} + @Y{user trust}", do: s => {
      s.out(["wt", "st"], { at: 0, dur: 0.35 });
      s.box("ui", { x: 800, y: 525, w: 720, h: 375, label: "User Interface · Live Progress", lp: "top", color: "blue", fop: 0.25, size: 25 }, { at: "10%" });
      s.col("u", ["☑ Read export code (0.8s)", "☑ Add /export endpoint (3.2s)", "▶ Running pytest (12/14)…", "☐ Summarize changes"], {
        x: 800, y: 550, w: 620, h: 58, gap: 16, size: 21, font: "ui",
        colors: ["green", "green", "gold", "dim"]
      }, { at: "28%", st: 0.14 });
      s.icon("ey", { name: "eye", x: 1270, y: 365, s: 56, color: "blue" }, { at: "66%" });
    }},
    { sec: "نمطا الفشل", say: "احذر نمطي فشل شائعين: الأول خطة غامضة كـ «حسّن التطبيق» لا يمكن تنفيذها ولا قياسها.", do: s => {
      s.out(["ui", "u*", "ey"], { at: 0, dur: 0.35 });
      s.versus("f1", "Vague Plan ✗", "Actionable Sub-Goal ✓", { colors: ["red", "green"], h: 380, y: 530 }, { at: "10%" });
      s.box("v1", { x: 440, y: 540, w: 480, h: 92, label: "☐ \"improve the app\"", size: 25, color: "red", font: "ui" }, { at: "34%" });
      s.mark("mv1", "v1", "x", { at: "50%" });
      s.box("v2", { x: 1160, y: 540, w: 500, h: 92, label: "☐ \"GET /export returns UTF-8 CSV\"", size: 22, color: "green", font: "ui" }, { at: "60%" });
      s.mark("mv2", "v2", "check", { at: "78%" });
    }},
    { say: "والثاني تعليم خطوة بأنها «منتهية» دون تشغيل أي تحقق؛ اربط علامة done دائمًا بدليل فعلي.", eq: "@T{status = done} @iff @G{verification check passed}", do: s => {
      s.out(["f1*", "v1", "mv1", "v2", "mv2"], { at: 0, dur: 0.35 });
      s.box("bd", { x: 460, y: 525, w: 470, h: 115, label: "☑ Write tests (never ran!)", sub: "false confidence", color: "red", size: 23, font: "ui" }, { at: "12%" });
      s.mark("mbd", "bd", "x", { at: "34%" });
      s.box("gd", { x: 1140, y: 525, w: 470, h: 115, label: "☑ Write tests (14/14 passed)", sub: "verified by pytest", color: "green", size: 23, font: "ui" }, { at: "52%" });
      s.link("lbg", "bd", "gd", { color: "green", label: "gate with test", pulse: true }, { at: "58%" });
      s.mark("mgd", "gd", "check", { at: "76%" });
    }},
    { sec: "الخلاصة", say: "إذن دورة القائمة الحيّة أربع خطوات: فكّك لأهداف قابلة للتحقق، ونفّذ واحدًا، وتحقّق، ثم حدّث الحالة.", do: s => {
      s.clear({ at: 0, dur: 0.35 });
      s.chain("cy", ["Decompose\n(verifiable)", "1 Item\nin_progress", "Verify\nDone Check", "Check Off\n& Persist"], {
        y: 505, gap: 65, w: 265, h: 145, size: 22,
        colors: ["blue", "gold", "teal", "green"],
        icons: ["list", "play", "eval", "save"], pulse: true
      }, { at: "12%", st: 0.2 });
    }},
    { say: "أخرج الخطة من «ذهن» النموذج إلى قائمة حيّة منظمة، وسيحافظ وكيلك على المسار حتى آخر خطوة.", do: s => {
      s.stream("cy0", "cy3", { at: "15%", color: "gold", span: 2.5, every: 0.55 });
      s.callout("end", { x: 800, y: 725, label: "External · Verifiable · 1 Active Step · Visible in UI", color: "gold", icon: "todo", size: 23 }, { at: "50%" });
    }}
  ]);

  // ------------------------------------------------------------------ AG2.3 Reflection & Self-Correction
  X.lesson("AG2.3", [
    { sec: "تسجيل المباراة", say: "يكتب الوكيل دالة تحليل CSV فتنهار عند ملف فارغ؛ إعادة المحاولة عمياء تكرر الخطأ نفسه.", do: s => {
      s.code("bg", {
        x: 520, y: 515, size: 21, title: "attempt_1.py",
        lines: ["def first_row(rows):", "    return rows[0]  # IndexError on []!"]
      }, { at: "8%", dur: 0.9 });
      s.box("er", { x: 1175, y: 515, w: 420, h: 115, label: "FAIL: IndexError", sub: "empty list unhandled", icon: "bug", color: "red", size: 24 }, { at: "42%" });
      s.link("lbe", "bg", "er", { color: "red", pulse: true }, { at: "48%" });
      s.callout("rp", { x: 800, y: 720, label: "Blind retry without reflection repeats the same mistake", color: "orange", icon: "loop", size: 22 }, { at: "68%" });
    }},
    { say: "الرياضي يتحسن بمراجعة تسجيل المباراة، لا بتخيلها في ذهنه؛ والتغذية الراجعة الخارجية هي التسجيل.", eq: "@T{Reflexion}: @; @B{attempt} @to @R{external signal} @to @Y{lesson} @to @G{retry}", do: s => {
      s.out(["bg", "er", "lbe", "rp"], { at: 0, dur: 0.35 });
      s.ring("lp", { x: 800, y: 540, r: 215, color: "faint", arrows: 4, w: 4 }, { at: "10%" });
      ringNodes(s, "n", ["1. Attempt", "2. External Signal", "3. Write Lesson", "4. Retry Better"], 800, 540, 215, ["blue", "red", "gold", "green"], { at: "24%" });
    }},
    { sec: "حلقة Reflexion", say: "في نمط Reflexion يكتب الوكيل درسًا لفظيًا موجزًا مما حدث، ويخزّنه للمحاولة التالية دون إعادة تدريب.", do: s => {
      s.focus(["n1", "n2"], { at: "10%", zoom: 1.14 });
      s.box("ls", { x: 800, y: 540, w: 325, h: 94, label: "\"Guard empty input []\nbefore indexing\"", size: 20, color: "gold", font: "ui" }, { at: "34%" });
      s.flow("n1", "n2", { color: "red", at: "28%", bend: 0.25 });
      s.flow("n2", "ls", { color: "gold", at: "52%" });
      s.unfocus({ at: "76%", dur: 0.45 });
    }},
    { say: "تدخل المحاولة الثانية وهذا الدرس في سياقها، فتضيف الشرط الناقص وتجتاز الاختبارات بنجاح.", do: s => {
      s.flow("ls", "n3", { color: "gold", at: "15%" });
      s.flow("n3", "n0", { color: "green", at: "38%", bend: 0.25 });
      s.to("n3", { stroke: "green", label: "4. Tests Pass ✓" }, { at: "54%", dur: 0.35 });
      s.pulse("n3", { at: "64%", color: "green", keep: true });
      s.badge("ok", { x: 1270, y: 540, text: "learned in-context ✓", color: "green", size: 22 }, { at: "68%" });
    }},
    { sec: "أدلة لا تخمين", say: "القاعدة الأهم: اربط كل نقد بإشارة خارجية حقيقية؛ فالنقد الذاتي بلا دليل جديد قد يفسد الإجابة.", eq: "@G{grounded feedback} @succ @R{pure self-critique}", do: s => {
      s.clear({ at: 0, dur: 0.35 });
      s.versus("vs", "Grounded Reflection ✓", "Pure Self-Critique ✗", { colors: ["green", "red"], h: 455, y: 545 }, { at: "8%" });
      s.col("gd", ["Failing unit tests", "JSON / SQL validator errors", "Source citation check"], {
        x: 440, y: 560, w: 480, h: 68, gap: 22, size: 22,
        icons: ["terminal", "code", "book"], colors: ["green", "teal", "green"]
      }, { at: "28%", st: 0.14 });
      s.col("bd", ["\"Are you sure?\" (no new info)", "Confirms its own biases", "Worse or just more confident"], {
        x: 1160, y: 560, w: 480, h: 68, gap: 22, size: 22,
        icons: ["question", "alert", "ban"], colors: ["red", "orange", "red"]
      }, { at: "50%", st: 0.14 });
      s.mark("mg", "vsL", "check", { at: "74%" });
      s.mark("mb", "vsR", "x", { at: "80%" });
    }},
    { say: "وافصل المنفّذ عن الحَكَم: ناقد بسياق جديد ومعايير واضحة يكتشف أخطاء تفوت المراجعة الذاتية.", eq: "@G{fresh-context critic + rubric} @succ @R{same-thread review}", do: s => {
      s.out(["vs*", "gd*", "bd*", "mg", "mb"], { at: 0, dur: 0.35 });
      s.box("dr", { x: 350, y: 525, w: 260, h: 145, label: "Doer Agent", sub: "writes artifact", icon: "pencil", color: "blue", size: 24 }, { at: "10%" });
      s.line("wl", { x1: 640, y1: 375, x2: 640, y2: 675, color: "gold", w: 4, dash: "10 8" }, { at: "28%" });
      s.note("wlt", { text: "fresh context", x: 640, y: 345, size: 21, color: "gold", font: "math" }, { at: "34%" });
      s.box("jg", { x: 960, y: 525, w: 280, h: 145, label: "Critic / Judge", sub: "checks against rubric", icon: "scale", color: "purple", size: 24 }, { at: "42%" });
      s.box("rb", { x: 1340, y: 525, w: 250, h: 120, label: "Rubric + Tests", icon: "clipboard", color: "green", size: 22 }, { at: "58%" });
      s.link("ldj", "dr", "jg", { color: "blue", label: "artifact", pulse: true }, { at: "48%" });
      s.link("lrj", "rb", "jg", { color: "green", pulse: true }, { at: "64%" });
      s.link("lfb", "jg", "dr", { color: "orange", bend: 0.32, label: "specific fixes", lc: "orange", pulse: true }, { at: "74%" });
    }},
    { sec: "الكود وسقف الجولات", say: "في الكود نحدد سقف المحاولات بثلاث جولات، ونشغّل الاختبارات كإشارة موضوعية في كل جولة.", do: s => {
      s.clear({ at: 0, dur: 0.35 });
      s.code("rf", {
        x: 590, y: 530, size: 21, title: "reflexion_loop.py",
        lines: [
          "lessons = []",
          "for attempt in range(3):              # hard cap",
          "    code = agent.write_code(task, lessons=lessons)",
          "    report = run_tests(code)          # external truth",
          "    if report.all_passed:",
          "        break",
          "    lessons.append(agent.reflect(code, report.failures))"
        ]
      }, { at: "10%", dur: 1.3 });
      s.to("rf", { hl: 1, hc: "gold" }, { at: "44%", dur: 0.2 });
      s.to("rf", { hl: 3, hc: "green" }, { at: "64%", dur: 0.2 });
      s.to("rf", { hl: 6, hc: "purple" }, { at: "82%", dur: 0.2 });
      s.badge("cap", { x: 1320, y: 470, text: "max 2–3 rounds", color: "gold", size: 23 }, { at: "52%" });
    }},
    { say: "لماذا السقف؟ لأن العائد يتناقص بسرعة بعد الجولة الثانية، وكل جولة إضافية تحرق الـ Tokens فقط.", eq: "@T{rounds} @le 3 @quad (@Delta @T{gain} @to 0)", do: s => {
      s.out(["rf", "cap"], { at: 0, dur: 0.35 });
      s.bars("gn", [
        ["Round 1 reflection", 0.78, "green", "+18% pass rate"],
        ["Round 2 reflection", 0.34, "teal", "+6% pass rate"],
        ["Round 3 reflection", 0.1, "gold", "+1% pass rate"],
        ["Round 4+", 0.04, "red", "token burn only"]
      ], { x: 560, y: 525, w: 540, gap: 85, size: 25, h: 32 }, { at: "14%" });
    }},
    { say: "والدروس التي تثبت فائدتها عبر مهام كثيرة، رقّها من ذاكرة المهمة إلى قواعد ومهارات دائمة.", do: s => {
      s.out("gn*", { at: 0, dur: 0.35 });
      s.chain("pm", ["Task Lesson\n(episodic)", "Verified on\nEval Suite?", "Rules / SKILL.md\n(procedural)"], {
        y: 525, gap: 110, w: 300, h: 150, size: 22,
        colors: ["gold", "teal", "purple"], icons: ["memo", "eval", "book"], pulse: true
      }, { at: "14%", st: 0.25 });
      s.stream("pm0", "pm2", { at: "52%", color: "purple", span: 2.2, every: 0.55 });
    }},
    { say: "لكن لا ترقِّ درسًا عشوائيًا بلا تقييم، وإلا لوّثت تعليمات الوكيل بقواعد متناقضة.", do: s => {
      s.focus("pm1", { at: "15%", zoom: 1.18, color: "teal" });
      s.callout("vr", { x: 800, y: 740, label: "Promote lessons ONLY after eval proves net gain", color: "green", icon: "shieldok", size: 22 }, { at: "45%" });
      s.unfocus({ at: "80%", dur: 0.45 });
    }},
    { sec: "الخلاصة", say: "التأمل الفعّال يرتكز على ثلاث ركائز: دليل خارجي موضوعي، وحَكَم مستقل، وسقف ثلاث جولات.", do: s => {
      s.clear({ at: 0, dur: 0.35 });
      s.grid("sm", ["External Signal", "Fresh-Context Judge", "Cap ≤ 3 Rounds"], {
        cols: 3, y: 495, cw: 410, ch: 170, gx: 36, size: 25,
        icons: ["terminal", "scale", "clock"], colors: ["green", "purple", "gold"],
        subs: ["tests, schemas, citations", "separate rubric & window", "avoid diminishing returns"]
      }, { at: "10%", st: 0.2 });
    }},
    { say: "هكذا يحوّل الوكيل أخطاءه إلى تعلم فوري موثوق، دون أن يخدع نفسه بثقة زائفة.", eq: "@T{Effective Reflection} = @G{External Evidence} + @P{Fresh Critic} + @Y{Cap @le 3}", do: s => {
      s.pulse(["sm0", "sm1", "sm2"], { at: "18%", color: "green", st: 0.18 });
      s.callout("fin", { x: 800, y: 735, label: "Reality grades the attempt — never vibes", color: "teal", icon: "check", size: 24 }, { at: "54%" });
    }}
  ]);

  // ------------------------------------------------------------------ AG2.4 Reasoning Models Inside Agents
  X.lesson("AG2.4", [
    { sec: "المحقق لا الممثل", say: "الوكلاء القدامى كانوا كممثلين يقرؤون نص تفكير مكتوبًا مسبقًا، فينهارون أمام أول مفاجأة.", do: s => {
      s.versus("an", "Old Prompted Script", "Modern Reasoning Detective", { colors: ["dim", "purple"], h: 420, y: 535 }, { at: "8%" });
      s.col("old", ["\"Step 1: think about X\"", "\"Step 2: always call Y\"", "Brittle on unexpected clues"], { x: 440, y: 550, w: 470, h: 64, gap: 20, size: 21, colors: ["dim", "dim", "red"] }, { at: "28%", st: 0.14 });
      s.col("nw", ["Thinks natively in tokens", "Pauses after EVERY clue", "Adapts plan mid-flight"], { x: 1160, y: 550, w: 470, h: 64, gap: 20, size: 21, colors: ["purple", "teal", "green"] }, { at: "52%", st: 0.14 });
    }},
    { say: "نماذج التفكير الحديثة تتصرف كمحقق يتوقف بعد كل دليل ليعيد تقييم القضية: هذا التفكير المتداخل.", eq: "@P{think} @to @O{tool} @to @P{rethink} @to @O{tool} @to @G{answer}", do: s => {
      s.clear({ at: 0, dur: 0.35 });
      s.chain("it", ["Think:\nwhere is bug?", "grep\nparse_date", "Think:\n2 callers!", "run_tests()", "Think:\noff-by-one!", "Fix &\nSummary ✓"], {
        y: 485, gap: 36, w: 205, h: 120, size: 19,
        colors: ["purple", "orange", "purple", "orange", "purple", "green"], pulse: true
      }, { at: "12%", st: 0.18 });
      s.callout("il", { x: 800, y: 695, label: "Interleaved Thinking: reflect on every observation before next action", color: "purple", icon: "brain", size: 22 }, { at: "68%" });
    }},
    { sec: "التفكير المتداخل", say: "قاعدة بروتوكول مهمة: أعد كتل التفكير كما هي في سجل الرسائل ليحافظ النموذج على خيط استنتاجه.", do: s => {
      s.out(["it*", "il"], { at: 0, dur: 0.35 });
      s.col("ms", [
        "1. user: \"Fix parse_date timezone bug\"",
        "2. assistant · thinking block  [KEEP UNCHANGED]",
        "3. assistant · tool_use: grep(parse_date)",
        "4. user · tool_result: src/dates.py:18",
        "5. assistant · thinking block  [CONTINUES THREAD]"
      ], {
        x: 740, y: 530, w: 720, h: 64, gap: 16, size: 21, font: "mono",
        colors: ["blue", "purple", "orange", "teal", "purple"]
      }, { at: "10%", st: 0.14 });
      s.focus(["ms1", "ms4"], { at: "55%", zoom: 1.08, color: "purple" });
      s.badge("kp", { x: 1320, y: 530, text: "never strip thinking", color: "gold", size: 21 }, { at: "64%" });
    }},
    { say: "ومع هذه النماذج، أعطِها أهدافًا وقيودًا ومعايير نجاح بدل قوائم خطوات مفرطة تقيّد ذكاءها.", eq: "@G{goals + constraints + criteria} @succ @R{over-prescriptive steps}", do: s => {
      s.unfocus({ at: 0, dur: 0.25 });
      s.out(["ms*", "kp"], { at: 0, dur: 0.35 });
      s.versus("pr", "Clear Goal + Guardrails ✓", "Micromanaged 12-Step Script ✗", { colors: ["green", "red"], h: 420, y: 540 }, { at: "10%" });
      s.box("gl", { x: 440, y: 545, w: 500, h: 175, label: "Goal: fix date parser\nConstraint: keep API compat\nSuccess: all pytest green", size: 21, color: "green", font: "ui" }, { at: "32%" });
      s.box("sc", { x: 1160, y: 545, w: 500, h: 175, label: "1. Open file A  2. Search X\n3. Never check B  4. Format Y…\n(fights model's own reasoning)", size: 21, color: "red", font: "ui" }, { at: "54%" });
      s.mark("mg", "prL", "check", { at: "74%" });
      s.mark("mb", "prR", "x", { at: "80%" });
    }},
    { sec: "مستوى الجهد Effort", say: "مقبضك الأساسي يصبح مستوى الجهد Effort: جهد أقل يجمع الاستدعاءات، وجهد أعلى يتعمق في المسائل الصعبة.", eq: "@T{effort}: @; @C{low} @; (@T{fast}) @; @leftrightarrow @; @P{high} @; (@T{deep})", do: s => {
      s.clear({ at: 0, dur: 0.35 });
      s.gauge("gg", { x: 380, y: 550, r: 135, v: 0.25, color: "teal", label: "effort knob" }, { at: "8%" });
      s.bars("br", [
        ["Thinking tokens", 0.25, "gold", "low"],
        ["Tool calls", 0.3, "orange", "consolidated"],
        ["Hard-task accuracy", 0.68, "green", "good"]
      ], { x: 860, y: 530, w: 460, gap: 90, size: 24, h: 32 }, { at: "18%" });
      s.to("gg", { v: 0.88, color: "purple" }, { at: "52%", dur: 1.1 });
      s.to("br0", { v: 0.85, val: "high" }, { at: "52%", dur: 1.1 });
      s.to("br1", { v: 0.72, val: "thorough" }, { at: "52%", dur: 1.1 });
      s.to("br2", { v: 0.94, val: "peak ✓" }, { at: "52%", dur: 1.1 });
    }},
    { say: "في الكود نفعّل التفكير التكيفي adaptive ونضبط effort حسب طبيعة المسار، مع إبقاء السجل كاملًا.", do: s => {
      s.out(["gg", "br*"], { at: 0, dur: 0.35 });
      s.code("cd", {
        x: 610, y: 535, size: 21, title: "reasoning_agent.py",
        lines: [
          "resp = client.messages.create(",
          "    model=\"claude-opus-4-6\",",
          "    max_tokens=16000,",
          "    thinking={\"type\": \"adaptive\"},    # decides when to think",
          "    output_config={\"effort\": \"high\"}, # planning/debug route",
          "    tools=TOOLS,",
          "    messages=messages,                # keep thinking blocks",
          ")"
        ]
      }, { at: "10%", dur: 1.3 });
      s.to("cd", { hl: 3, hc: "purple" }, { at: "46%", dur: 0.25 });
      s.to("cd", { hl: 4, hc: "gold" }, { at: "68%", dur: 0.25 });
      s.to("cd", { hl: 6, hc: "teal" }, { at: "84%", dur: 0.25 });
    }},
    { say: "لا تستخدم جهدًا واحدًا لكل شيء: عالٍ للتخطيط وتصحيح الأعطال، ومنخفض للبحث والوكلاء الفرعيين.", do: s => {
      s.to("cd", { x: 460, scale: 0.82 }, { at: "10%", dur: 0.6 });
      s.box("rt", { x: 1180, y: 385, w: 460, h: 100, label: "Planning / Debugging", sub: "effort = high · deep reasoning", icon: "brain", inline: true, color: "purple", size: 22 }, { at: "32%" });
      s.box("rm", { x: 1180, y: 535, w: 460, h: 100, label: "Standard Coding / Analysis", sub: "effort = medium · balanced", icon: "code", inline: true, color: "blue", size: 22 }, { at: "50%" });
      s.box("rl", { x: 1180, y: 685, w: 460, h: 100, label: "Lookups / Simple Subagents", sub: "effort = low · fast & cheap", icon: "bolt", inline: true, color: "teal", size: 22 }, { at: "68%" });
    }},
    { sec: "مفارقة التكلفة", say: "قِس دائمًا التكلفة لكل مهمة مكتملة، لا سعر المليون Token وحده؛ هنا تحدث المفاجأة.", eq: "@T{real metric} = @frac{@T{total cost}}{@T{completed task}}", do: s => {
      s.clear({ at: 0, dur: 0.35 });
      s.bars("cs", [
        ["Smart model · low effort", 0.34, "green", "$0.08 / task (2 steps)"],
        ["Weak model · looping", 0.86, "red", "$0.19 / task (9 retries!)"]
      ], { x: 560, y: 495, w: 540, gap: 120, size: 26, h: 38 }, { at: "14%" });
      s.callout("mx", { x: 800, y: 730, label: "Smarter model finishes in fewer turns → often cheaper overall!", color: "green", icon: "coin", size: 23 }, { at: "62%" });
    }},
    { say: "النموذج الأضعف يخطئ ويكرر المحاولات فيضاعف الفاتورة والزمن، بينما الأذكى يحسمها سريعًا.", do: s => {
      s.out(["cs*", "mx"], { at: 0, dur: 0.35 });
      s.chart("ec", {
        x: 780, y: 540, w: 840, h: 380,
        xl: "Task Difficulty", yl: "Cost per Solved Task ($)",
        curves: [
          [[0, 0.12], [0.3, 0.25], [0.6, 0.58], [0.85, 0.85], [1, 0.98], "red", "weak model (retries)"],
          [[0, 0.16], [0.3, 0.2], [0.6, 0.28], [0.85, 0.38], [1, 0.48], "green", "smart + tuned effort"]
        ]
      }, { at: "10%", dur: 1.4 });
    }},
    { sec: "لوحة التحكم", say: "إذن أربع رافعات تتحكم بها في عصر نماذج التفكير: الأهداف، التفكير المتداخل، الجهد، وحفظ السجل.", do: s => {
      s.clear({ at: 0, dur: 0.35 });
      s.grid("lv", ["Clear Goals & Criteria", "Interleaved Thinking", "Per-Route Effort", "Keep Thinking Blocks"], {
        cols: 4, y: 495, cw: 335, ch: 175, gx: 26, size: 22,
        icons: ["target", "brain", "gauge", "save"],
        colors: ["green", "purple", "gold", "teal"],
        subs: ["no rigid step scripts", "rethink after each tool", "high / med / low routes", "preserve reasoning thread"]
      }, { at: "10%", st: 0.16 });
    }},
    { say: "اضبط هذه الرافعات الأربع وقارن الدولار لكل مهمة ناجحة على مجموعة تقييم حقيقية.", do: s => {
      s.pulse(["lv0", "lv1", "lv2", "lv3"], { at: "18%", color: "gold", st: 0.15 });
      s.callout("ev", { x: 800, y: 735, label: "Benchmark $/solved-task across effort settings", color: "teal", icon: "eval", size: 23 }, { at: "58%" });
    }},
    { say: "دع النموذج يفكّر بنفسه، ووجّهه بالأهداف والقيود، واضبط الجهد بحجم المهمة.", eq: "@G{Smart Model + Tuned Effort} @Rightarrow @T{fewer loops @& lower $/task}", do: s => {
      s.focus(["lv0", "lv2"], { at: "16%", zoom: 1.1 });
      s.unfocus({ at: "68%", dur: 0.5 });
    }}
  ]);

  // ------------------------------------------------------------------ AG2.5 Tree-of-Thoughts, Best-of-N & Test-Time Search
  X.lesson("AG2.5", [
    { sec: "الوكيل الجشع", say: "الوكيل الجشع يلتزم فورًا بأول فرضية تخطر له؛ إن أخطأت البداية أضاع عشر خطوات في طريق مسدود.", do: s => {
      for (let i = 0; i < 6; i++) {
        s.dot("g" + i, { x: 260 + i * 200, y: 495, r: 14, color: i < 5 ? "dim" : "red", halo: i === 5 }, { at: 0.2 + i * 0.16 });
        if (i) s.line("gl" + i, { x1: 260 + (i - 1) * 200, y1: 495, x2: 260 + i * 200, y2: 495, color: i === 5 ? "red" : "faint", w: 3.5 }, { at: 0.22 + i * 0.16, dur: 0.2 });
      }
      s.icon("wl", { name: "ban", x: 1320, y: 495, s: 64, color: "red" }, { at: "66%" });
      s.callout("gr", { x: 800, y: 675, label: "Greedy decoding: 1 wrong hypothesis = 10 wasted steps", color: "red", icon: "alert", size: 23 }, { at: "58%" });
    }},
    { say: "بطل الشطرنج لا يلعب أول نقلة يراها، بل يستكشف عدة مسارات للأمام ويستبعد الفخاخ قبل القرار.", eq: "@T{test-time search}: @; @T{explore branches before committing}", do: s => {
      s.out(["g*", "gl*", "wl", "gr"], { at: 0, dur: 0.35 });
      s.box("rt", { x: 300, y: 530, w: 230, h: 120, label: "Hard Problem", icon: "target", color: "soft", size: 24 }, { at: "10%" });
      s.col("br", ["Branch 1 · trap", "Branch 2 · trap", "Branch 3 · winning ✓"], { x: 820, y: 530, w: 320, h: 72, gap: 45, size: 22, colors: ["red", "red", "green"] }, { at: "28%", st: 0.15 });
      for (let i = 0; i < 3; i++) s.link("lb" + i, "rt", "br" + i, { color: i === 2 ? "green" : "dim", pulse: i === 2 }, { at: 0.55 + i * 0.12 });
      s.box("wn", { x: 1300, y: 530, w: 240, h: 120, label: "Ship Winner", icon: "star", color: "green", size: 24 }, { at: "68%" });
      s.link("lw", "br2", "wn", { color: "green", pulse: true }, { at: "74%" });
    }},
    { sec: "Best-of-N", say: "أبسط شكل هو Best-of-N: شغّل ثلاث إلى خمس محاولات مستقلة بالتوازي مع درجة حرارة مناسبة.", eq: "@T{best} = @arg@max_{i @le N} @; @G{verify}(y_i)", do: s => {
      s.clear({ at: 0, dur: 0.35 });
      s.box("pr", { x: 260, y: 530, w: 210, h: 120, label: "Task", icon: "code", color: "soft", size: 26 }, { at: "8%" });
      for (let i = 0; i < 4; i++) {
        s.box("c" + i, { x: 740, y: 350 + i * 120, w: 290, h: 72, label: "Candidate " + (i + 1) + " (T=0.7)", size: 21, color: "blue" }, { at: 0.3 + i * 0.12 });
        s.link("lc" + i, "pr", "c" + i, { color: "blue", pulse: true }, { at: 0.38 + i * 0.1 });
      }
      s.box("vf", { x: 1280, y: 530, w: 260, h: 150, label: "Verifier", sub: "unit tests / SQL check", icon: "eval", color: "green", size: 25 }, { at: "62%" });
    }},
    { say: "ثم يمر الجميع على مدقّق موضوعي فيختار الأعلى درجة؛ هذا يعطيك 80% من الفائدة بـ 20% من التعقيد.", do: s => {
      const cols = ["red", "red", "green", "orange"];
      for (let i = 0; i < 4; i++) s.link("lv" + i, "c" + i, "vf", { color: cols[i], pulse: i === 2 }, { at: 0.18 + i * 0.1 });
      s.to("c0", { stroke: "red", opacity: 0.45 }, { at: "42%", dur: 0.35 });
      s.to("c1", { stroke: "red", opacity: 0.45 }, { at: "48%", dur: 0.35 });
      s.to("c3", { stroke: "orange", opacity: 0.45 }, { at: "54%", dur: 0.35 });
      s.to("c2", { stroke: "green", label: "Candidate 3 · 100% ✓", glow: 1 }, { at: "58%", dur: 0.4 });
      s.callout("ep", { x: 1280, y: 745, label: "80% of ToT gain · 20% complexity", color: "gold", icon: "zap", size: 19 }, { at: "74%" });
    }},
    { sec: "شجرة الأفكار ToT", say: "أما شجرة الأفكار فتقيّم الخطوات الوسيطة أثناء التفكير، وتقلّم الفروع الضعيفة مبكرًا قبل إكمالها.", do: s => {
      s.clear({ at: 0, dur: 0.35 });
      const N = { r: [800, 290], a: [460, 455], b: [800, 455], c: [1140, 455], a1: [340, 625], a2: [580, 625], c1: [1000, 625], c2: [1280, 625], c3: [1140, 795] };
      const C = { r: "soft", a: "red", b: "red", c: "green", a1: "faint", a2: "faint", c1: "dim", c2: "green", c3: "green" };
      const L = { r: "root", a: "0.2", b: "0.3", c: "0.9", a1: "×", a2: "×", c1: "0.4", c2: "0.95", c3: "WIN ✓" };
      Object.entries(N).forEach(([k, [x, y]], i) => s.box("n_" + k, { x, y, w: 120, h: 56, label: L[k], size: 20, color: C[k] }, { at: 0.15 + i * 0.1 }));
      [["r", "a"], ["r", "b"], ["r", "c"], ["a", "a1"], ["a", "a2"], ["c", "c1"], ["c", "c2"], ["c2", "c3"]].forEach(([p, q], i) =>
        s.link("e" + i, "n_" + p, "n_" + q, { color: C[q] === "green" ? "green" : "faint", w: C[q] === "green" ? 4 : 2, pulse: C[q] === "green" }, { at: 0.28 + i * 0.1 })
      );
    }},
    { say: "فلا تُهدر الحوسبة على الطرق المسدودة، بل تتراجع وتوسّع الفرع الواعد حتى تصل للحل الفائز.", do: s => {
      s.mark("xa", "n_a", "x", { at: "14%" });
      s.mark("xb", "n_b", "x", { at: "26%" });
      s.focus(["n_r", "n_c", "n_c2", "n_c3", "e2", "e6", "e7"], { at: "42%", zoom: 1.16 });
      s.stream("n_r", "n_c3", { at: "52%", color: "green", span: 2.2, every: 0.55 });
      s.unfocus({ at: "82%", dur: 0.45 });
    }},
    { sec: "الكود والمقايضة", say: "تطبيق Best-of-N في بايثون لا يتجاوز خمسة أسطر: نولّد المرشحين بالتوازي ونختار الأعلى تقييمًا.", do: s => {
      s.clear({ at: 0, dur: 0.35 });
      s.code("bn", {
        x: 615, y: 525, size: 21, title: "best_of_n.py",
        lines: [
          "# Parallel Best-of-N with objective verifier",
          "candidates = await asyncio.gather(*[",
          "    agent.solve(problem, temperature=0.7)",
          "    for _ in range(3)",
          "])",
          "scored = [(verify_solution(c), c) for c in candidates]",
          "best_score, winner = max(scored, key=lambda x: x[0])"
        ]
      }, { at: "10%", dur: 1.3 });
      s.to("bn", { hl: 1, hc: "blue" }, { at: "46%", dur: 0.25 });
      s.to("bn", { hl: 5, hc: "green" }, { at: "74%", dur: 0.25 });
      s.badge("par", { x: 1320, y: 455, text: "parallel gather", color: "blue", size: 22 }, { at: "52%" });
      s.badge("det", { x: 1320, y: 585, text: "objective verifier", color: "green", size: 22 }, { at: "76%" });
    }},
    { say: "المقايضة ذكية: تدفع N أضعاف الـ Tokens، لكن زمن الانتظار الفعلي يبقى شبه ثابت لأنها تعمل بالتوازي.", eq: "@O{tokens} @approx N@times @quad @text{while} @quad @C{wall time} @approx 1@times", do: s => {
      s.out(["bn", "par", "det"], { at: 0, dur: 0.35 });
      s.bars("tr", [
        ["Token cost (N=3)", 0.82, "orange", "3× tokens"],
        ["Wall-clock latency", 0.3, "teal", "≈ 1× (parallel)"]
      ], { x: 560, y: 495, w: 540, gap: 115, size: 27, h: 38 }, { at: "14%" });
      s.row("use", ["Critical Code", "SQL Synthesis", "Architecture Plans"], { x: 800, y: 725, size: 23, gap: 26, colors: ["green", "blue", "purple"], pad: 24, h: 60 }, { at: "56%", st: 0.14 });
    }},
    { say: "لكن احذر أخطر فخ: تشغيل البحث مع مدقّق عشوائي يحرق خمسة أضعاف التكلفة للاختيار بالحظ!", do: s => {
      s.out(["tr*", "use*"], { at: 0, dur: 0.35 });
      s.versus("nv", "Noisy / Vague Judge ✗", "Deterministic Verifier ✓", { colors: ["red", "green"], h: 430, y: 540 }, { at: "10%" });
      s.col("nb", ["Burns 5× tokens", "Picks buggy candidate by luck", "False sense of rigor"], { x: 440, y: 555, w: 460, h: 64, gap: 20, size: 22, colors: ["red", "orange", "red"] }, { at: "30%", st: 0.14 });
      s.col("ng", ["Runs real unit tests / SQL", "Objective score 0..1", "Every extra token buys quality"], { x: 1160, y: 555, w: 460, h: 64, gap: 20, size: 22, colors: ["green", "teal", "green"] }, { at: "52%", st: 0.14 });
      s.mark("xnv", "nvL", "x", { at: "74%" });
      s.mark("cnv", "nvR", "check", { at: "80%" });
    }},
    { say: "إن لم تملك مدقّقًا تثق بنتيجته، فمضاعفة المحاولات لا تحسّن الجودة بل تضاعف الفاتورة فقط.", do: s => {
      s.focus("nvR", { at: "16%", zoom: 1.12 });
      s.unfocus({ at: "72%", dur: 0.5 });
    }},
    { sec: "الخلاصة", say: "معادلة البحث وقت التنفيذ: مرشحون متوازون متنوعون، ومدقّق موثوق، ومهمة عالية القيمة.", do: s => {
      s.clear({ at: 0, dur: 0.35 });
      s.chain("sm", ["Parallel\nCandidates (N=3)", "Objective\nVerifier", "Prune &\nPick Best", "Verified\nSolution ✓"], {
        y: 505, gap: 65, w: 265, h: 145, size: 22,
        colors: ["blue", "teal", "gold", "green"],
        icons: ["split", "eval", "filter", "star"], pulse: true
      }, { at: "12%", st: 0.2 });
    }},
    { say: "ابدأ بـ Best-of-N المتوازي للمهام الحساسة، ولا تستثمر حوسبة البحث أبدًا دون مدقّق حتمي موثوق.", eq: "@G{Best-of-N} @; @text{pays off} @iff @C{trusted verifier} @land @Y{high stakes}", do: s => {
      s.stream("sm0", "sm3", { at: "15%", color: "green", span: 2.5, every: 0.55 });
      s.callout("fin", { x: 800, y: 725, label: "Start with N=3 parallel + tests before building full ToT", color: "gold", icon: "check", size: 23 }, { at: "52%" });
    }}
  ]);
