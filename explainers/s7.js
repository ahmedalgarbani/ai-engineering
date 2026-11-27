// Motion explainers — Stage 7: harness engineering, agent infrastructure & governance, agent protocols, RLVR, DSPy
(function () {
  const X = window.Explainer;
  const ringNodes = (s, pre, labels, cx, cy, r, colors, o) => labels.forEach((t, i) => { const a = (-90 + i * 360 / labels.length) * Math.PI / 180; s.box(pre + i, { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, label: t, size: 24, h: 56, color: (colors || [])[i] || "teal", fill: "bg" }, Object.assign({ at: 0.4 + i * 0.15 }, o)); });

  // ------------------------------------------------------------------ F1.1 Harness engineering
  X.lesson("F1.1", [
    { sec: "المعادلة", say: "النموذج الخام محرك نصي بلا حالة. والوكيل الحقيقي يحتاج شيئًا حوله: الـ Harness.", eq: "@T{agent} = @P{model} + @C{harness}", do: s => {
      s.box("m", { x: 800, y: 540, w: 220, h: 150, label: "model", icon: "brain", color: "purple", size: 30 });
      s.zone("h", { x: 800, y: 560, w: 1180, h: 600, label: "harness", color: "teal" }, { at: 0.8 });
    }},
    { sec: "الأركان الستة", say: "وللـ Harness ستة أركان: حلقة التنفيذ، وموجّه الأدوات، ومدير السياق،", do: s => {
      const P = [["execution loop", "loop", 440, 330], ["tool / MCP router", "tool", 800, 300], ["context manager", "layers", 1160, 330]];
      P.forEach(([t, ic, x, y], i) => s.box("p" + i, { x, y, w: 300, h: 76, label: t, icon: ic, inline: true, size: 22, color: "teal" }, { at: 0.2 + i * 0.3 }));
    }},
    { say: "وحفظ الحالة، والـ Hooks ووسطاء الأمان، وحلقة التحقق.", do: s => {
      const P = [["state persistence", "save", 440, 760], ["hooks & guards", "shield", 800, 790], ["verification loop", "check", 1160, 760]];
      P.forEach(([t, ic, x, y], i) => s.box("q" + i, { x, y, w: 300, h: 76, label: t, icon: ic, inline: true, size: 22, color: "teal" }, { at: 0.2 + i * 0.3 }));
      [0, 1, 2].forEach(i => { s.link("lp" + i, "m", "p" + i, { color: "faint", head: false }, { at: 1.2 }); s.link("lq" + i, "m", "q" + i, { color: "faint", head: false }, { at: 1.2 }); });
    }},
    { sec: "مستقل عن النموذج", say: "وصمّمه مستقلًا عن نموذج بعينه، فتبدّل النموذج عند صدور جيل أحدث دون إعادة كتابة تطبيقك.", do: s => {
      s.to("m", { label: "model v1", opacity: 0 }, { at: 0.3, dur: 0.5 });
      s.box("m2", { x: 800, y: 540, w: 220, h: 150, label: "model v2", icon: "brain", color: "green", size: 30 }, { at: 0.9 });
    }},
    { sec: "قِس كل شيء", say: "وسجّل كل حدث داخله: زمن الأدوات، واستهلاك السياق، والضغط، وإعادات المحاولة.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("ev", { x: 800, y: 540, size: 22, title: "harness events", lines: ["tool=get_order  latency=38ms", "context=71%  compaction=true", "retry=1  provider=429", "verify=pass  steps=6"] }, { at: 0.3, dur: 1.6 });
    }}
  ]);

  // ------------------------------------------------------------------ F1.2 Long-running agents across sessions
  X.lesson("F1.2", [
    { sec: "المشكلة", say: "بناء تطبيق كامل لا يتسع في نافذة سياق واحدة.", do: s => {
      s.box("big", { x: 800, y: 540, w: 1100, h: 120, label: "build the whole app in one session…", size: 28, color: "red", fill: "#2a1416" }, { in: "grow" });
      s.box("win", { x: 520, y: 540, w: 500, h: 160, label: "", color: "soft", fop: 0, dash: "8 6" }, { at: 0.6 });
    }},
    { sec: "المُهيّئ", say: "فيبدأ وكيل مُهيّئ ببناء قائمة مهام مهيكلة، وبيئة الاختبار.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("fj", { x: 800, y: 520, size: 24, title: "features.json", lines: ["[{\"id\": 1, \"name\": \"login\",  \"passes\": true},", " {\"id\": 2, \"name\": \"cart\",   \"passes\": false},", " {\"id\": 3, \"name\": \"checkout\", \"passes\": false}]"] }, { at: 0.3, dur: 1.4 });
    }},
    { sec: "جلسة لكل شريحة", say: "ثم تعمل كل جلسة بسياق نظيف على شريحة واحدة، وتنجزها وتختبرها.", do: s => {
      s.to("fj", { y: 340, scale: 0.75 }, { dur: 0.6 });
      ["session 1", "session 2", "session 3"].forEach((t, i) => s.box("s" + i, { x: 440 + i * 360, y: 600, w: 280, h: 110, label: t, sub: ["login ✓", "cart ✓", "checkout …"][i], icon: "sparkle", inline: true, size: 24, color: i < 2 ? "green" : "gold" }, { at: 0.5 + i * 0.4 }));
    }},
    { say: "وتحفظ عملها في Git، فيسهل التراجع عن أي خطأ.", do: s => {
      [0, 1].forEach(i => s.icon("g" + i, { name: "branch", x: s.get("s" + i).x, y: 730, s: 44, color: "orange" }, { at: 0.2 + i * 0.2 }));
      s.note("gl", { text: "one verified, committed increment per session", x: 800, y: 810, color: "orange", font: "math" }, { at: 0.7 });
    }},
    { sec: "مذكرة التسليم", say: "وفي نهاية كل جلسة، مذكرة تسليم: ما نجح، وما فشل، والخطوة التالية بدقة.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("ho", { x: 800, y: 540, size: 24, title: "progress.md", lines: ["Done: cart totals + tests (commit 9f2c)", "Failed: tax rounding for SAR", "Next: fix rounding in src/tax.ts:42", "Blocker: need VAT rate table"] }, { at: 0.3, dur: 1.6 });
    }},
    { sec: "لماذا ملف مهيكل؟", say: "والملف المهيكل يمنع الوكيل من إعلان اكتمال العمل قبل وقته.", eq: "@T{done} @iff @T{all passes} = @G{true}", do: s => {
      s.clear({ dur: 0.4 });
      s.bubble("cl", { text: "\"All features are complete!\"", side: "a", x: 520, y: 520, w: 400, color: "red" }, { at: 0.2 });
      s.code("tr", { x: 1120, y: 520, size: 24, title: "features.json", lines: ["passes: true", "passes: true", "passes: false ← not done"] }, { at: 0.7, dur: 1 });
    }}
  ]);

  // ------------------------------------------------------------------ F1.3 Generator–evaluator harnesses
  X.lesson("F1.3", [
    { sec: "فخ التقييم الذاتي", say: "اسأل الوكيل الذي كتب الكود: هل عملك ممتاز؟ وسيصفّق لنفسه.", do: s => {
      s.box("g", { x: 600, y: 520, w: 260, h: 150, label: "generator", icon: "code", color: "blue", size: 28 });
      s.bubble("self", { text: "\"Looks great to me!\"", side: "a", x: 1060, y: 430, w: 340 }, { at: 0.6 });
      s.icon("x", { name: "x", x: 1240, y: 400, s: 40, color: "red" }, { at: 1.2 });
    }},
    { sec: "فصل الدورين", say: "فنفصل الدورين: مولِّد يبني الحل، ومقيِّم مستقل بسياق جديد.", do: s => {
      s.out(["self", "x"], { dur: 0.3 });
      s.to("g", { x: 450 }, { dur: 0.6 });
      s.box("e", { x: 1150, y: 520, w: 260, h: 150, label: "evaluator", sub: "fresh context", icon: "scale", color: "gold", size: 28 }, { at: 0.6 });
      s.box("out", { x: 800, y: 520, w: 200, h: 80, label: "diff + test output", size: 20, color: "soft" }, { at: 0.9 });
      s.link("a", "g", "out", { color: "blue" }, { at: 1 }); s.link("b", "out", "e", { color: "gold" }, { at: 1.1 });
    }},
    { say: "والمقيِّم لا يقرأ تبريرات المولِّد، بل النتيجة والتعديلات والاختبارات فقط.", do: s => {
      s.box("rs", { x: 450, y: 720, w: 300, h: 60, label: "generator's reasoning", size: 20, color: "dim" }, { at: 0.2 });
      s.mark("rx", "rs", "x", { at: 0.6 });
    }},
    { sec: "الحتمي أولًا", say: "نشغّل المدقّقات الحتمية أولًا، ثم المقيِّم الذكي للمعمارية والأمان.", do: s => {
      s.clear({ dur: 0.4 });
      s.chain("v", ["tests · schema · lint", "LLM evaluator", "accept / reject"], { y: 520, gap: 90, colors: ["teal", "gold", "green"], h: 90, size: 24 }, { at: 0.3, st: 0.3 });
    }},
    { sec: "حدود الحلقة", say: "ونضع سقفًا لدورات التحسين، ثلاث مثلًا، ثم نصعّد للإنسان.", eq: "@T{rounds} @le 3 @; @Rightarrow @; @T{escalate}", do: s => {
      s.clear({ dur: 0.4 });
      s.ring("lp", { x: 700, y: 540, r: 150, color: "faint", arrows: 2 }, { at: 0.2 });
      s.num("r", { v: 1, x: 700, y: 540, size: 50, color: "gold", pre: "round " }, { at: 0.3 }); s.to("r", { v: 3 }, { at: 0.5, dur: 1.2, ease: "lin" });
      s.box("hu", { x: 1150, y: 540, w: 260, h: 110, label: "human", icon: "user", inline: true, size: 28, color: "blue" }, { at: 1.8 });
    }},
    { say: "ونعطي المقيِّم شروط رفض واضحة: مثل غياب فحص الصلاحيات، أو تخطّي اختبار.", do: s => {
      s.clear({ dur: 0.4 });
      s.col("rj", ["reject: missing auth check", "reject: skipped or deleted test", "reject: new dependency"], { x: 800, y: 540, size: 26, w: 560, colors: ["red", "red", "red"] }, { at: 0.3, st: 0.2 });
    }}
  ]);

  // ------------------------------------------------------------------ F1.4 Durable agent execution
  X.lesson("F1.4", [
    { sec: "حلقة في الذاكرة", say: "حلقة عادية في الذاكرة تنهار عند إعادة تشغيل الخادم، أو انتظار موافقة لست ساعات.", do: s => {
      s.chain("w", ["step 1", "step 2", "wait approval (6h)", "step 4"], { y: 470, gap: 50, colors: ["blue", "blue", "gold", "dim"], h: 80, size: 24 }, { st: 0.2 });
      s.icon("cr", { name: "power", x: 800, y: 650, s: 70, color: "red" }, { at: 1.2 });
      s.to(["w*"], { opacity: 0.2 }, { at: 1.5, dur: 0.4 });
    }},
    { sec: "التنفيذ الدائم", say: "محركات التنفيذ الدائم تسجّل نتيجة كل خطوة في تخزين دائم.", do: s => {
      s.to(["w*"], { opacity: 1 }, { dur: 0.3 }); s.out("cr", { dur: 0.2 });
      [0, 1].forEach(i => s.icon("s" + i, { name: "save", x: s.get("w" + i).x, y: 580, s: 44, color: "green" }, { at: 0.3 + i * 0.2 }));
      s.box("db", { x: 800, y: 740, w: 360, h: 70, label: "durable event history", icon: "db", inline: true, size: 22, color: "green" }, { at: 0.8 });
    }},
    { say: "فعند أي عطل، يُستأنف سير العمل من النقطة نفسها، دون إعادة ما اكتمل.", do: s => {
      s.flow("db", "w2", { color: "green", at: 0.3 });
      s.to("w2", { stroke: "green", label: "approved ✓" }, { at: 1 }); s.to("w3", { stroke: "green" }, { at: 1.4 });
    }},
    { sec: "حتمي وغير حتمي", say: "وافصل منطق سير العمل الحتمي، عن الأنشطة غير الحتمية مثل استدعاءات النموذج.", eq: "@T{workflow (deterministic)} @; + @; @O{activities (LLM, APIs)}", do: s => {
      s.clear({ dur: 0.4 });
      s.box("wf", { x: 500, y: 540, w: 360, h: 200, label: "workflow code", sub: "deterministic · replayable", icon: "graph", color: "blue", size: 28 }, { at: 0.3 });
      s.box("ac", { x: 1100, y: 540, w: 360, h: 200, label: "activities", sub: "LLM calls · APIs · tools", icon: "bolt", color: "orange", size: 28 }, { at: 0.6 });
      s.link("l", "wf", "ac", { color: "dim", tail: true }, { at: 0.9 });
    }},
    { sec: "نوم بلا تكلفة", say: "ويستطيع الوكيل أن ينتظر أيامًا، دون أن يستهلك ذاكرة أو معالجًا.", do: s => {
      s.clear({ dur: 0.4 });
      s.icon("hg", { name: "hourglass", x: 800, y: 480, s: 120, color: "gold" }, { at: 0.2 });
      s.note("nl", { text: "sleep until webhook / approval · $0 while waiting", x: 800, y: 630, color: "gold", font: "math", size: 28 }, { at: 0.6 });
    }},
    { sec: "الأثر الخارجي", say: "ومرّر مفاتيح منع التكرار للأدوات ذات الأثر الخارجي، وأعد المحاولة بتأخير متدرّج.", do: s => {
      s.clear({ dur: 0.4 });
      s.box("k", { x: 560, y: 540, w: 380, h: 80, label: "Idempotency-Key per payment", size: 22, color: "teal" }, { at: 0.3 });
      s.box("b", { x: 1080, y: 540, w: 380, h: 80, label: "retry 429/503: 1s → 2s → 4s", size: 22, color: "orange" }, { at: 0.6 });
    }}
  ]);

  // ------------------------------------------------------------------ F2.1 Docker & sandboxes for agents
  X.lesson("F2.1", [
    { sec: "الخطر", say: "طرفية مفتوحة لوكيل مستقل على جهازك مخاطرة: أمر خاطئ واحد قد يمسح ملفاتك.", do: s => {
      s.box("host", { x: 800, y: 540, w: 700, h: 380, label: "your laptop", lp: "top", color: "red", fop: 0.25, size: 28 });
      s.row("sec", ["~/.ssh", "~/.aws", ".env"], { x: 800, y: 600, size: 26, font: "mono", gap: 24, colors: ["red", "red", "red"], pad: 20 }, { at: 0.5 });
      s.box("ag", { x: 800, y: 470, w: 200, h: 70, label: "agent", icon: "bot", inline: true, size: 24, color: "purple" }, { at: 0.3 });
    }},
    { sec: "العزل", say: "فشغّله داخل حاوية أو Devcontainer أو microVM معزولة.", do: s => {
      s.clear({ dur: 0.4 });
      s.zone("ct", { x: 800, y: 560, w: 620, h: 400, label: "container", color: "green" }, { at: 0.2 });
      s.box("ag", { x: 800, y: 540, w: 220, h: 120, label: "agent", icon: "bot", color: "purple", size: 26 }, { at: 0.4 });
    }},
    { sec: "قواعد الحاوية", say: "ولا تربط أبدًا مجلدات المفاتيح، أو مقبس Docker الرئيسي، داخل حاوية الوكيل.", do: s => {
      s.row("nm", ["~/.ssh", "~/.aws", "docker.sock"], { x: 800, y: 300, size: 24, font: "mono", gap: 24, colors: ["red", "red", "red"], pad: 20 }, { at: 0.2 });
      [0, 1, 2].forEach(i => s.mark("m" + i, "nm" + i, "x", { at: 0.6 + i * 0.15 }));
    }},
    { say: "وافرض حدودًا للموارد، واسحب الصلاحيات الزائدة، وشغّله بمستخدم غير جذري.", do: s => {
      s.code("run", { x: 800, y: 760, size: 20, title: "docker run", lines: ["--memory 2g --cpus 1 --cap-drop=ALL --user 1000 --read-only"] }, { at: 0.3, dur: 1.4 });
    }},
    { sec: "الشبكة", say: "وقائمة سماح للشبكة الخارجة، تمنع تسريب البيانات.", eq: "@T{egress} @in @{ @T{pypi.org}, @T{api.github.com} @}", do: s => {
      s.clear({ dur: 0.4 });
      s.box("c", { x: 500, y: 540, w: 240, h: 120, label: "container", icon: "container", color: "green", size: 26 }, { at: 0.2 });
      s.box("ok", { x: 1100, y: 440, w: 300, h: 64, label: "pypi.org ✓", font: "mono", size: 22, color: "green" }, { at: 0.4 });
      s.box("no", { x: 1100, y: 640, w: 300, h: 64, label: "evil.example ✗", font: "mono", size: 22, color: "red" }, { at: 0.6 });
      s.flow("c", "ok", { color: "green", at: 0.9 }); s.link("bl", "c", "no", { color: "red", dash: "6 6" }, { at: 1.2 });
    }}
  ]);

  // ------------------------------------------------------------------ F2.2 Portainer & agent governance
  X.lesson("F2.2", [
    { sec: "إدارة الحزم", say: "Portainer منصة بصرية لتشغيل حزم الذكاء الاصطناعي المستضافة ذاتيًا.", do: s => {
      s.box("pt", { x: 800, y: 330, w: 300, h: 90, label: "Portainer", icon: "cluster", inline: true, color: "blue", size: 30 });
      ["vLLM", "LiteLLM", "Langfuse", "pgvector", "MCP servers"].forEach((t, i) => { s.box("st" + i, { x: 320 + i * 240, y: 580, w: 200, h: 80, label: t, size: 24, color: "teal", icon: "container", inline: true }, { at: 0.4 + i * 0.12 }); s.link("l" + i, "pt", "st" + i, { color: "dim" }, { at: 0.5 + i * 0.12 }); });
    }},
    { sec: "صلاحيات الوكيل", say: "والدور الثاني: Portainer-Command، بوابة حوكمة تمنع إعطاء الوكيل مفاتيح المدير.", do: s => {
      s.clear({ dur: 0.4 });
      s.box("ag", { x: 380, y: 540, w: 220, h: 120, label: "agent", icon: "bot", color: "purple", size: 26 }, { at: 0.2 });
      s.box("gw", { x: 800, y: 540, w: 300, h: 140, label: "Portainer-Command", sub: "read-only · scoped · temporary", icon: "shield", color: "gold", size: 24 }, { at: 0.4 });
      s.box("k8", { x: 1230, y: 540, w: 220, h: 120, label: "clusters", icon: "cluster", color: "blue", size: 26 }, { at: 0.6 });
      s.link("a", "ag", "gw", { color: "purple" }, { at: 0.7 }); s.link("b", "gw", "k8", { color: "gold" }, { at: 0.8 });
      s.box("kc", { x: 800, y: 760, w: 300, h: 60, label: "admin kubeconfig ✗", font: "mono", size: 22, color: "red" }, { at: 1.1 });
    }},
    { sec: "بلا كتابة مباشرة", say: "فيشخّص الوكيل العطل، ثم يفتح Pull Request ليراجعه المهندس قبل التطبيق.", do: s => {
      s.clear({ dur: 0.4 });
      s.chain("f", ["diagnose (read-only)", "open PR", "engineer reviews", "GitOps applies"], { y: 540, gap: 46, colors: ["teal", "orange", "blue", "green"], icons: ["search", "pr", "user", "check"], w: 260, h: 140, size: 22 }, { at: 0.3, st: 0.25 });
    }},
    { sec: "الإيقاف الطارئ", say: "وزر إيقاف طارئ يلغي صلاحيات كل الوكلاء، عبر كل العناقيد، بضغطة واحدة.", do: s => {
      s.clear({ dur: 0.4 });
      s.box("kill", { x: 800, y: 480, w: 320, h: 140, label: "EMERGENCY HALT", icon: "power", color: "red", size: 26 }, { at: 0.2 });
      for (let i = 0; i < 6; i++) s.box("a" + i, { x: 330 + i * 188, y: 720, w: 160, h: 60, label: "agent " + (i + 1), size: 20, color: "purple" }, { at: 0.4 + i * 0.05 });
      s.to("a*", { stroke: "red", opacity: 0.35 }, { at: 1.2, st: 0.05 });
    }},
    { sec: "الخلاصة", say: "Portainer يدير الحزم، وPortainer-Command يحكم الوكلاء: قراءة مؤقتة، وتعديل عبر PR، وزر إيقاف.", do: s => {
      s.clear({ dur: 0.4 });
      s.grid("sum", ["run AI stacks", "read-only, scoped sessions", "changes via PR", "fleet kill switch"], { cols: 4, y: 520, cw: 300, ch: 150, size: 22, icons: ["container", "eye", "pr", "power"], colors: ["blue", "teal", "orange", "red"] }, { at: 0.3, st: 0.15 });
    }}
  ]);

  // ------------------------------------------------------------------ F2.3 GitOps & PR-first infrastructure
  X.lesson("F2.3", [
    { sec: "الكارثة المحتملة", say: "وكيل يعدّل خوادم الإنتاج مباشرة، بسرعة الآلة، وبلا سجل تدقيق، وصفة لكارثة.", do: s => {
      s.box("ag", { x: 450, y: 540, w: 220, h: 120, label: "agent", icon: "bot", color: "purple", size: 26 });
      s.box("prod", { x: 1150, y: 540, w: 260, h: 140, label: "production", icon: "server", color: "red", size: 28 }, { at: 0.3 });
      for (let i = 0; i < 4; i++) s.flow("ag", "prod", { color: "red", at: 0.6 + i * 0.2, dur: 0.4 });
    }},
    { sec: "كل تغيير PR", say: "في GitOps، يقرأ الوكيل السجلات بصلاحية قراءة، ويجهّز التعديل، ثم يفتح Pull Request.", do: s => {
      s.clear({ dur: 0.4 });
      s.chain("g", ["read logs & metrics", "draft Terraform / Helm", "pull request", "CI policy gates", "human approves", "apply"], { y: 500, gap: 30, colors: ["teal", "blue", "orange", "gold", "blue", "green"], h: 100, size: 20 }, { at: 0.3, st: 0.2 });
    }},
    { sec: "سجل التدقيق", say: "وGit يحفظ من اقترح التعديل، ولماذا، ومن وافق عليه.", do: s => {
      s.code("lg", { x: 800, y: 720, size: 20, title: "git log", lines: ["a3f9  agent:infra-bot  scale api to 6 (p95 > 2s)  approved-by: sara"] }, { at: 0.3, dur: 1 });
    }},
    { sec: "التراجع والسياسات", say: "والتراجع بأمر واحد، وبوابات السياسات ترفض أي تعديل يفتح صلاحيات عامة.", eq: "@T{git revert} @quad + @quad @T{policy-as-code}", do: s => {
      s.clear({ dur: 0.4 });
      s.box("rv", { x: 520, y: 540, w: 340, h: 110, label: "git revert a3f9", font: "mono", size: 26, color: "green", icon: "history", inline: true }, { at: 0.3 });
      s.box("pc", { x: 1100, y: 540, w: 400, h: 110, label: "CI: deny public S3 buckets", size: 24, color: "gold", icon: "shield", inline: true }, { at: 0.6 });
    }},
    { say: "فنجمع سرعة التشخيص بالذكاء الاصطناعي، مع أمان الموافقة البشرية.", eq: "@T{AI speed} + @T{human control}", do: s => {
      s.clear({ dur: 0.4 });
      s.bars("b", [["diagnosis time", 0.1, "teal", "seconds"], ["blast radius", 0.12, "green", "reviewed & reversible"]], { x: 700, y: 540, w: 520, gap: 110, size: 28, h: 34 }, { at: 0.3 });
    }}
  ]);

  // ------------------------------------------------------------------ F2.4 Agent identity, short-lived credentials & kill switches
  X.lesson("F2.4", [
    { sec: "هوية مستقلة", say: "لا تعطِ الوكيل مفتاحك الشخصي؛ امنحه هوية مستقلة غير بشرية.", do: s => {
      s.box("bad", { x: 480, y: 520, w: 380, h: 120, label: "agent uses sara's key", icon: "key", inline: true, size: 24, color: "red" }); s.mark("bx", "bad", "x", { at: 0.6 });
      s.box("good", { x: 1120, y: 520, w: 400, h: 120, label: "agent:support-bot-7", icon: "idcard", inline: true, font: "mono", size: 24, color: "green" }, { at: 0.8 });
      s.code("au", { x: 800, y: 730, size: 20, title: "audit", lines: ["actor_type=agent  agent_id=support-bot-7  on_behalf_of=sara"] }, { at: 1.2, dur: 1 });
    }},
    { sec: "رموز قصيرة العمر", say: "ورموز وصول قصيرة العمر، من خمس إلى خمس عشرة دقيقة، تنتهي تلقائيًا لو تسرّبت.", eq: "@T{TTL} @approx 5@text{–}15 @T{ min}", do: s => {
      s.clear({ dur: 0.4 });
      s.bar("ttl", { x: 520, y: 540, w: 560, v: 1, color: "gold", label: "token lifetime", size: 28, h: 34 }, { at: 0.2 });
      s.to("ttl", { v: 0, color: "red" }, { at: 0.6, dur: 2.4, ease: "lin" });
      s.box("exp", { x: 800, y: 680, label: "expired → useless if leaked", size: 24, color: "green", h: 56 }, { at: 3 });
    }},
    { sec: "قواطع الدوائر", say: "وقواطع دوائر توقف الوكيل تلقائيًا، عند تجاوز الأخطاء أو الميزانية، أو طلب أداة محظورة.", do: s => {
      s.clear({ dur: 0.4 });
      s.grid("cb", ["error rate > 20%", "token budget hit", "forbidden tool call"], { cols: 3, y: 480, cw: 360, ch: 110, size: 24, colors: ["red", "gold", "orange"] }, { at: 0.3, st: 0.2 });
      s.box("stop", { x: 800, y: 700, w: 300, h: 80, label: "agent paused", icon: "pause", inline: true, size: 26, color: "red" }, { at: 1.2 });
    }},
    { sec: "اختبر زر الطوارئ", say: "واختبر زر الإيقاف الطارئ قبل الإطلاق؛ فآلية طوارئ غير مختبرة ليست حماية.", do: s => {
      s.clear({ dur: 0.4 });
      s.box("k", { x: 800, y: 520, w: 280, h: 160, label: "kill switch", icon: "power", color: "red", size: 30 }, { at: 0.3 });
      s.box("drill", { x: 800, y: 720, label: "fire drill: tested ✓", size: 24, color: "green", h: 56 }, { at: 0.9 });
    }},
    { sec: "الخلاصة", say: "هوية مستقلة، ورموز قصيرة العمر، وقواطع دوائر، وزر إيقاف مختبَر: أربع ضمانات لكل وكيل.", do: s => {
      s.clear({ dur: 0.4 });
      s.grid("sum", ["own identity", "short-lived tokens", "circuit breakers", "tested kill switch"], { cols: 4, y: 520, cw: 300, ch: 150, size: 22, icons: ["idcard", "clock", "bolt", "power"], colors: ["green", "gold", "orange", "red"] }, { at: 0.3, st: 0.15 });
    }}
  ]);

  // ------------------------------------------------------------------ F3.1 The agent protocol stack: MCP vs A2A vs AG-UI
  X.lesson("F3.1", [
    { sec: "ثلاثة بروتوكولات", say: "تتوحّد معماريات الوكلاء حول ثلاثة بروتوكولات مفتوحة متكاملة.", do: s => {
      s.box("ag", { x: 800, y: 540, w: 220, h: 140, label: "agent", icon: "bot", color: "purple", size: 28 });
    }},
    { sec: "MCP", say: "MCP عمودي: يربط الوكيل بالأدوات والبيانات.", eq: "@C{MCP}: @T{agent} @leftrightarrow @T{tools}", do: s => {
      s.box("tl", { x: 800, y: 820, w: 360, h: 70, label: "tools & data", icon: "tool", inline: true, size: 24, color: "teal" }, { at: 0.2 });
      s.link("m", "ag", "tl", { color: "teal", tail: true, label: "MCP", lc: "teal" }, { at: 0.4 });
    }},
    { sec: "A2A", say: "وA2A أفقي: وكيل يفوّض مهمة لوكيل آخر، حتى لو بُني بإطار مختلف.", eq: "@B{A2A}: @T{agent} @leftrightarrow @T{agent}", do: s => {
      s.box("ag2", { x: 1320, y: 540, w: 220, h: 140, label: "other agent", sub: "different framework", icon: "bot", color: "blue", size: 24 }, { at: 0.2 });
      s.link("a", "ag", "ag2", { color: "blue", tail: true, label: "A2A", lc: "blue" }, { at: 0.4 });
      s.box("card", { x: 1320, y: 760, w: 260, h: 60, label: "Agent Card", icon: "idcard", inline: true, size: 22, color: "blue" }, { at: 0.8 });
    }},
    { say: "وكل وكيل ينشر بطاقة تعرّف قدراته وطريقة المصادقة، دون كشف تفاصيله الداخلية.", do: s => { s.pulse("card", { color: "blue" }); } },
    { sec: "AG-UI", say: "وAG-UI يربط الوكيل بواجهة المستخدم: يبث النص، وتقدم الأدوات، وتحديثات الحالة.", eq: "@Y{AG-UI}: @T{agent} @leftrightarrow @T{user}", do: s => {
      s.box("ui", { x: 280, y: 540, w: 220, h: 140, label: "user's app", icon: "browser", color: "gold", size: 26 }, { at: 0.2 });
      s.link("u", "ag", "ui", { color: "gold", tail: true, label: "AG-UI", lc: "gold" }, { at: 0.4 });
      for (let i = 0; i < 3; i++) s.flow("ag", "ui", { color: "gold", at: 0.8 + i * 0.3 });
    }},
    { sec: "التوافقية", say: "والبروتوكولات المفتوحة تتفوق على الحلول المغلقة: كل جزء يتحدث مع الآخر.", do: s => { s.pulse(["tl", "ag2", "ui"], { st: 0.2 }); } }
  ]);

  // ------------------------------------------------------------------ F3.2 AG-UI & Generative UI
  X.lesson("F3.2", [
    { sec: "جدار من النص", say: "جدار من النص في صندوق محادثة لا يصلح للوكلاء متعددي الخطوات.", do: s => {
      s.box("wall", { x: 800, y: 540, w: 700, h: 400, label: "", color: "dim", fop: 0.3 });
      for (let i = 0; i < 8; i++) s.box("l" + i, { x: 800, y: 390 + i * 42, w: 620 - (i % 3) * 60, h: 24, r: 4, label: "", color: "faint", fill: "faint" }, { at: 0.2 + i * 0.05 });
    }},
    { sec: "أحداث مهيكلة", say: "بدل النص الخام، يبث الخادم أحداثًا معرّفة: بدء خطوة، واستدعاء أداة، وتحديث حالة، ومكوّن واجهة.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("ev", { x: 800, y: 540, size: 22, title: "event stream", lines: ["STEP_STARTED      {step: \"search flights\"}", "TOOL_CALL_START   {tool: \"flights.search\"}", "STATE_DELTA       {results: 12}", "UI_COMPONENT      {type: \"FlightTable\", data: …}"] }, { at: 0.3, dur: 1.8 });
    }},
    { sec: "مكوّنات حيّة", say: "فتظهر للمستخدم مكوّنات تفاعلية: جدول حي، ونموذج قابل للتعديل، وبطاقة موافقة.", do: s => {
      s.clear({ dur: 0.4 });
      s.box("tb", { x: 520, y: 470, w: 440, h: 220, label: "FlightTable", lp: "top", icon: "table", color: "blue", size: 26 }, { at: 0.3 });
      s.box("fm", { x: 1100, y: 420, w: 380, h: 120, label: "Edit: date · seat", icon: "pencil", color: "teal", size: 24 }, { at: 0.6 });
      s.box("ap", { x: 1100, y: 620, w: 380, h: 120, label: "Approve booking $420", icon: "check", color: "green", size: 24 }, { at: 0.9 });
    }},
    { sec: "حالة مشتركة", say: "والحالة مشتركة في الاتجاهين: إذا عدّل المستخدم خيارًا، يراه الوكيل في خطوته التالية.", do: s => {
      s.box("ag", { x: 520, y: 770, w: 220, h: 70, label: "agent", icon: "bot", inline: true, size: 24, color: "purple" }, { at: 0.2 });
      s.link("sync", "fm", "ag", { color: "teal", tail: true, label: "shared state" }, { at: 0.4 });
      s.flow("fm", "ag", { color: "teal", at: 0.9 });
    }},
    { sec: "سجل مكوّنات آمن", say: "واسمح للوكيل باختيار مكوّنات من مكتبتك المعتمدة فقط، ولا تنفّذ HTML عشوائيًا منه.", do: s => {
      s.clear({ dur: 0.4 });
      s.box("ok", { x: 520, y: 540, w: 380, h: 140, label: "{type: \"Chart\", data}", sub: "from approved registry", font: "mono", color: "green", size: 22 }, { at: 0.3 }); s.mark("c", "ok", "check", { at: 0.7 });
      s.box("no", { x: 1100, y: 540, w: 380, h: 140, label: "<script>…</script>", sub: "raw model HTML", font: "mono", color: "red", size: 22 }, { at: 0.8 }); s.mark("x", "no", "x", { at: 1.2 });
    }}
  ]);

  // ------------------------------------------------------------------ F3.3 RLVR & verifier-first design
  X.lesson("F3.3", [
    { sec: "RLHF مقابل RLVR", say: "في RLHF يكافئ البشر النموذج حسب أذواقهم. أما RLVR فيكافئه مدقّق موضوعي حتمي.", eq: "@T{reward} = @T{verifier}(@T{output}) @in @{0, 1@}", do: s => {
      s.versus("vs", "RLHF · human preference", "RLVR · verifiable reward", { colors: ["blue", "green"] });
      s.icon("h", { name: "users", x: 435, y: 540, s: 100, color: "blue" }, { at: 0.4 });
      s.icon("v", { name: "check", x: 1165, y: 540, s: 100, color: "green" }, { at: 0.7 });
    }},
    { sec: "المدقّق", say: "هل نجحت الاختبارات؟ هل تطابق الناتج الرياضي؟ هل صحّ المخطط؟ هذه هي المكافأة.", do: s => {
      s.clear({ dur: 0.4 });
      s.box("m", { x: 400, y: 540, w: 220, h: 140, label: "model", icon: "brain", color: "purple", size: 26 }, { at: 0.2 });
      s.box("o", { x: 800, y: 540, w: 220, h: 100, label: "solution", icon: "code", inline: true, size: 24, color: "soft" }, { at: 0.4 });
      s.box("vf", { x: 1200, y: 540, w: 260, h: 140, label: "verifier", sub: "tests · math · schema", icon: "check", color: "green", size: 26 }, { at: 0.6 });
      s.link("a", "m", "o", { color: "dim" }, { at: 0.5 }); s.link("b", "o", "vf", { color: "dim" }, { at: 0.7 });
      s.link("r", "vf", "m", { color: "gold", bend: 0.3, label: "reward 0/1", lc: "gold" }, { at: 1.1 });
    }},
    { say: "وهذا ما أطلق قدرات التفكير والتراجع وتصحيح الذات في البرمجة والرياضيات.", do: s => { s.flow("vf", "m", { color: "gold", bend: 0.3, n: 3, gap: 0.3, at: 0.3 }); } },
    { sec: "المدقّق أولًا", say: "والدرس الهندسي: قبل أي ميزة وكيلية، اسأل: ما الفحص الحتمي الذي يتحقق من صحة الناتج؟", eq: "@T{verifier first}", do: s => {
      s.clear({ dur: 0.4 });
      s.icon("q", { name: "question", x: 800, y: 470, s: 120, color: "gold" }, { at: 0.2 });
      s.row("vf", ["unit tests", "JSON schema", "compiler", "SQL dry-run"], { x: 800, y: 660, size: 24, gap: 20, colors: ["green", "green", "green", "green"], pad: 20 }, { at: 0.6 });
    }},
    { sec: "التحايل على المكافأة", say: "واحذر التحايل: قد يحذف الوكيل اختبارًا فاشلًا لينجح. فاعزل ملفات المدقّق واحمها.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("rh", { x: 800, y: 500, size: 24, title: "agent's diff", lines: ["- def test_refund_limit():", "-     assert refund(1000) is None"] }, { at: 0.3, dur: 1 });
      s.box("lk", { x: 800, y: 690, w: 420, h: 64, label: "tests/ is read-only for the agent", icon: "lock", inline: true, size: 22, color: "green" }, { at: 1.3 });
    }}
  ]);

  // ------------------------------------------------------------------ F3.4 Programmatic prompt optimization (DSPy)
  X.lesson("F3.4", [
    { sec: "الأوامر اليدوية", say: "تعديل الأوامر الطويلة يدويًا بالتجربة والخطأ ينهار عند تبديل النموذج.", do: s => {
      for (let i = 0; i < 6; i++) s.doc("p" + i, { x: 420 + i * 30, y: 520 + i * 14, w: 120, h: 160, lines: 6, color: "dim" }, { at: 0.1 + i * 0.05 });
      s.box("sw", { x: 1100, y: 520, w: 300, h: 100, label: "new model →", size: 26, color: "red" }, { at: 0.7 });
      s.note("br", { text: "30 hand-tuned prompts break", x: 1100, y: 640, color: "red", font: "math" }, { at: 1 });
    }},
    { sec: "التواقيع", say: "في DSPy تعرّف تواقيع: مدخلات ومخرجات مهيكلة، بدل صياغة الكلمات.", eq: "@T{question, context} @to @T{answer}", do: s => {
      s.clear({ dur: 0.4 });
      s.code("sig", { x: 800, y: 520, size: 26, title: "program.py", lines: ["class Answer(dspy.Signature):", "    question: str = dspy.InputField()", "    context: str = dspy.InputField()", "    answer: str = dspy.OutputField()"] }, { at: 0.3, dur: 1.6 });
    }},
    { sec: "المقياس والبيانات", say: "ثم تحدد مقياس تقييم موضوعيًا، على خمسين إلى مئتي مثال حقيقي.", do: s => {
      s.clear({ dur: 0.4 });
      s.box("ds", { x: 480, y: 520, w: 280, h: 150, label: "150 examples", icon: "table", color: "gold", size: 26 }, { at: 0.2 });
      s.box("mt", { x: 1120, y: 520, w: 280, h: 150, label: "metric()", icon: "target", font: "mono", color: "green", size: 26 }, { at: 0.4 });
    }},
    { sec: "المُحسِّن", say: "فيجرّب المُحسِّن صياغات وأمثلة مختلفة تلقائيًا، ويختار ما يرفع درجة المقياس.", do: s => {
      s.box("op", { x: 800, y: 520, w: 260, h: 150, label: "optimizer", icon: "wand", color: "purple", size: 26 }, { at: 0.2 });
      s.link("a", "ds", "op", { color: "gold" }, { at: 0.3 }); s.link("b", "op", "mt", { color: "green", tail: true }, { at: 0.4 });
      s.bars("sc", [["trial 1", 0.62, "dim"], ["trial 7", 0.78, "teal"], ["best", 0.88, "green"]], { x: 640, y: 760, w: 360, gap: 40, size: 20, h: 20, pct: true }, { at: 0.8 });
    }},
    { sec: "عند تبديل النموذج", say: "وعند صدور نموذج أسرع وأرخص، تعيد التصريف في دقائق، بدل إعادة كتابة كل الأوامر.", eq: "@T{compile}(@T{program}, @; @T{new model}) @to @T{optimized prompts}", do: s => {
      s.clear({ dur: 0.4 });
      s.chain("re", ["DSPy program", "compile for new model", "optimized prompts"], { y: 540, gap: 90, colors: ["blue", "purple", "green"], h: 90, size: 24 }, { at: 0.3, st: 0.3 });
    }},
    { sec: "متى؟", say: "والقاعدة: ابدأ بأوامر يدوية وتقييمات، وانتقل إلى DSPy حين تملك مقياسًا متينًا وبيانات كافية.", do: s => {
      s.clear({ dur: 0.4 });
      s.chain("w", ["hand-written prompts + evals", "solid metric + 50+ examples", "DSPy"], { y: 540, gap: 80, colors: ["teal", "gold", "purple"], h: 90, size: 22 }, { at: 0.3, st: 0.3 });
    }}
  ]);
})();
