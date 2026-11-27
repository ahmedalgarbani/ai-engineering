// Motion explainers — Stage 5: ReplyAssist capstone and production hardening
(function () {
  const X = window.Explainer;

  // ------------------------------------------------------------------ 11.1 Capstone: ReplyAssist architecture & data
  X.lesson("11.1", [
    { sec: "المنتج", say: "ReplyAssist: مساعد لخدمة العملاء يجهّز ردودًا بمصادر، ويقترح الاسترداد للمراجعة البشرية.", do: s => {
      s.bubble("tk", { text: "I was charged twice for order #812.", side: "u", x: 420, y: 430, w: 440 });
      s.box("ra", { x: 800, y: 600, w: 260, h: 150, label: "ReplyAssist", icon: "bot", color: "teal", size: 30 }, { at: 0.5 });
      s.bubble("dr", { text: "Draft reply with sources + refund suggestion", side: "a", x: 1200, y: 430, w: 440, color: "green" }, { at: 1.1 });
      s.link("a", "tk", "ra", { color: "dim" }, { at: 0.7 }); s.link("b", "ra", "dr", { color: "green" }, { at: 1 });
    }},
    { sec: "التقنيات", say: "والتقنيات: React في الواجهة، وFastAPI وLangGraph في الخلفية، وPostgres مع pgvector.", do: s => {
      s.clear({ dur: 0.4 });
      s.chain("st", ["React", "FastAPI", "LangGraph", "Postgres + pgvector"], { y: 480, gap: 60, colors: ["blue", "teal", "purple", "gold"], icons: ["browser", "server", "graph", "db"], h: 150, size: 24 }, { at: 0.3, st: 0.2 });
      s.box("dk", { x: 800, y: 720, w: 1180, h: 60, label: "all in Docker", icon: "container", inline: true, size: 24, color: "dim" }, { at: 1.3 });
    }},
    { sec: "البيانات", say: "والجداول: التذاكر، والرسائل، والمستندات، والمقاطع، والطلبات، والاستردادات، ونقاط الحفظ.", do: s => {
      s.clear({ dur: 0.4 });
      s.grid("tb", ["tickets", "messages", "documents", "chunks", "orders", "refund_requests", "checkpoints"], { cols: 4, y: 520, cw: 300, ch: 100, size: 24, font: "mono", colors: ["blue", "blue", "gold", "gold", "green", "red", "purple"] }, { at: 0.3, st: 0.1 });
    }},
    { say: "والتضمين محلي بنموذج MiniLM، فلا حاجة لـ API تضمين خارجي.", do: s => {
      s.box("ml", { x: 800, y: 790, w: 440, h: 64, label: "local embeddings: MiniLM (384-d)", size: 22, color: "teal", icon: "chip", inline: true }, { at: 0.3 });
    }},
    { sec: "قاعدة الاسترداد", say: "والاستردادات تبقى اقتراحات، حتى يوافق عليها إنسان.", eq: "@T{refund} = @T{suggestion} @; @T{until} @; @G{human approves}", do: s => {
      s.clear({ dur: 0.4 });
      s.chain("rf", ["agent suggests refund", "human approves", "payment executed"], { y: 540, gap: 90, colors: ["purple", "blue", "green"], icons: ["bot", "user", "dollar"], w: 260, h: 150, size: 22 }, { at: 0.3, st: 0.3 });
    }}
  ]);

  // ------------------------------------------------------------------ 11.2 Capstone: backend, RAG & LangGraph
  X.lesson("11.2", [
    { sec: "الرسم", say: "الخلفية تبني سير عمل: تصنيف، ثم استرجاع، ثم أدوات، ثم مسودة بمصادر، ثم موافقة.", do: s => {
      s.chain("g", ["classify", "retrieve", "tools", "draft + cite", "approve"], { y: 420, gap: 46, colors: ["blue", "gold", "orange", "teal", "green"], h: 84, size: 24 }, { st: 0.2 });
    }},
    { sec: "التحقق", say: "ونماذج Pydantic تتحقق من كل طلب، ومن كل مخرج للنموذج.", do: s => {
      s.code("pd", { x: 800, y: 660, size: 22, title: "models.py", lines: ["class Draft(BaseModel):", "    reply: str", "    sources: list[str]", "    refund_suggestion: float | None"] }, { at: 0.3, dur: 1.4 });
    }},
    { sec: "الاسترجاع", say: "والاسترجاع يصفّي حسب العميل، ويعيد المقاطع مع بيانات مصدرها.", do: s => {
      s.out("pd", { dur: 0.3 });
      s.pulse("g1", { glow: 1, keep: true });
      s.box("sq", { x: 800, y: 640, w: 640, h: 70, label: "WHERE tenant_id = 42 ORDER BY embedding <=> q", font: "mono", size: 20, color: "gold" }, { at: 0.4 });
    }},
    { sec: "المقاطعة", say: "واقتراح الاسترداد يطلق interrupt، فيتوقف الرسم حتى يوافق إنسان.", do: s => {
      s.out("sq", { dur: 0.3 }); s.to("g1", { glow: 0 });
      s.to("g4", { label: "approve ⏸", glow: 1, w: 200 }, { at: 0.3 });
      s.bubble("ask", { text: "Approve refund of $49 for #812?", side: "s", x: 1200, y: 620, w: 400, size: 24 }, { at: 0.8 });
    }},
    { sec: "الحفظ والبث", say: "ونقاط الحفظ تسمح باستئناف التذكرة بعد إعادة التشغيل، والتقدم يُبث عبر SSE.", do: s => {
      s.out("ask", { dur: 0.3 });
      [0, 1, 2, 3].forEach(i => s.icon("sv" + i, { name: "save", x: s.get("g" + i).x, y: 540, s: 40, color: "purple" }, { at: 0.3 + i * 0.1 }));
      s.box("sse", { x: 800, y: 700, w: 500, h: 64, label: "SSE → browser: step events + tokens", size: 22, color: "teal" }, { at: 0.9 });
    }}
  ]);

  // ------------------------------------------------------------------ 11.3 Capstone: React integration, testing & debugging
  X.lesson("11.3", [
    { sec: "الواجهة", say: "نربط واجهة React بالخلفية، ونعرض الخطوات والـ Tokens المبثوثة تدريجيًا.", do: s => {
      s.box("ui", { x: 800, y: 540, w: 900, h: 460, label: "", color: "soft", fop: 0.3 });
      ["✓ classified: billing", "✓ found 3 sources", "… drafting"].forEach((t, i) => s.box("st" + i, { x: 560, y: 410 + i * 80, w: 360, h: 56, label: t, size: 22, color: i < 2 ? "green" : "gold", font: "ui" }, { at: 0.3 + i * 0.3 }));
      s.bubble("dr", { text: "We're sorry for the double charge…", side: "a", x: 1060, y: 500, w: 360, size: 22 }, { at: 1.2, in: "type", dur: 1.4 });
    }},
    { sec: "واجهة الموافقة", say: "وواجهة الموافقة تعرض الاسترداد المقترح، والمبلغ، والمصادر.", do: s => {
      s.box("ap", { x: 1060, y: 690, w: 360, h: 120, label: "Refund $49 · order #812\nsources: policy §2", size: 22, color: "gold" }, { at: 0.3 });
      s.row("bt", ["Approve", "Edit", "Reject"], { x: 1060, y: 790, size: 20, gap: 12, colors: ["green", "blue", "red"], h: 42, font: "ui" }, { at: 0.7 });
    }},
    { sec: "اختبار من الطرف للطرف", say: "ونختبر الرحلة كاملة: الواجهة، ثم الـ API، ثم الرسم، ثم قاعدة البيانات، ثم الواجهة.", do: s => {
      s.clear({ dur: 0.4 });
      s.chain("e2e", ["UI", "API", "graph", "database", "UI"], { y: 540, gap: 60, colors: ["blue", "teal", "purple", "gold", "blue"], icons: ["browser", "server", "graph", "db", "browser"], w: 180, h: 140, size: 24 }, { at: 0.3, st: 0.2 });
      s.flow("e2e0", "e2e4", { color: "green", at: 1.5, dur: 1.6 });
    }},
    { sec: "تصحيح الأخطاء", say: "ونصحّح الأخطاء بمقارنة الأحداث، وصفوف قاعدة البيانات، والـ Traces.", do: s => {
      s.clear({ dur: 0.4 });
      s.grid("dbg", ["SSE events", "DB rows", "traces"], { cols: 3, y: 520, cw: 360, ch: 170, size: 28, icons: ["stream", "table", "pulse"], colors: ["teal", "gold", "purple"] }, { at: 0.3, st: 0.2 });
      s.icon("bug", { name: "bug", x: 800, y: 740, s: 70, color: "red" }, { at: 1.1 });
    }},
    { sec: "الخلاصة", say: "واجهة تبث التقدم، وموافقة واضحة، واختبار شامل، وأدلة للتصحيح: هكذا يكتمل ReplyAssist.", do: s => {
      s.clear({ dur: 0.4 });
      s.chain("sum", ["streamed UI", "approval card", "end-to-end tests", "debug evidence"], { y: 520, gap: 44, colors: ["blue", "gold", "green", "purple"], h: 90, size: 22 }, { at: 0.3, st: 0.2 });
    }}
  ]);

  // ------------------------------------------------------------------ A5.1 Auth & per-tenant access
  X.lesson("A5.1", [
    { sec: "مصدر الهوية", say: "استخرج هوية العميل من الجلسة الموثّقة، لا من جسم الطلب.", do: s => {
      s.code("bad", { x: 440, y: 520, size: 22, title: "request body", lines: ["{\"tenant_id\": 43,", " \"ticket\": 812}"] }, { at: 0.2, dur: 0.8 });
      s.mark("bx", "bad", "x", { at: 0.9 });
      s.box("ses", { x: 1150, y: 520, w: 380, h: 120, label: "session → tenant_id = 42", icon: "idcard", inline: true, size: 24, color: "green" }, { at: 1.1 });
      s.mark("sc", "ses", "check", { at: 1.5 });
    }},
    { sec: "الأدوار", say: "والأدوار ثلاثة: موظف، ومشرف يوافق على الاستردادات، ومدير.", do: s => {
      s.clear({ dur: 0.4 });
      s.grid("rl", ["agent", "supervisor", "admin"], { cols: 3, y: 480, cw: 360, ch: 150, size: 30, icons: ["user", "shieldok", "key"], colors: ["blue", "gold", "purple"], subs: ["reads & drafts", "approves refunds", "manages settings"] }, { at: 0.3, st: 0.2 });
    }},
    { sec: "الأدوات", say: "والأدوات تستلم نطاق العميل من سياق الخادم، لا من النموذج.", do: s => {
      s.box("ctx", { x: 560, y: 740, w: 340, h: 70, label: "server context: tenant 42", size: 22, color: "green" }, { at: 0.2 });
      s.box("tl", { x: 1060, y: 740, w: 340, h: 70, label: "orders_get(812)", font: "mono", size: 22, color: "orange" }, { at: 0.4 });
      s.link("l", "ctx", "tl", { color: "green", label: "injected scope" }, { at: 0.6 });
    }},
    { sec: "سجل التدقيق", say: "وسجّل من وافق على ماذا، ومتى.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("au", { x: 800, y: 540, size: 24, title: "audit_log", lines: ["2026-11-27 14:02  supervisor:7  APPROVED refund $49  #812", "2026-11-27 14:09  supervisor:7  REJECTED refund $900 #815"] }, { at: 0.3, dur: 1.4 });
    }},
    { sec: "اختبر العزل", say: "واختبر العزل فعليًا: حاول كمستخدم من عميل أن تقرأ تذكرة عميل آخر، ويجب أن تفشل.", do: s => {
      s.clear({ dur: 0.4 });
      s.bubble("rq", { text: "GET /tickets/9001  (belongs to tenant 43)", side: "u", x: 600, y: 460, w: 520, font: "mono", size: 22 }, { at: 0.3 });
      s.box("res", { x: 1080, y: 640, w: 380, h: 70, label: "403 Forbidden ✓", font: "mono", size: 26, color: "green" }, { at: 1 });
    }}
  ]);

  // ------------------------------------------------------------------ A5.2 Production budgets
  X.lesson("A5.2", [
    { sec: "الاستهلاك غير المحدود", say: "بند OWASP العاشر: الاستهلاك غير المحدود. حلقة واحدة منفلتة قد تحرق ميزانيتك.", do: s => {
      s.num("bill", { v: 12, x: 800, y: 500, size: 80, color: "gold", pre: "$" }, { at: 0.2 });
      s.to("bill", { v: 4800, color: "red" }, { at: 0.5, dur: 2.2, ease: "in" });
    }},
    { sec: "حدود المعدل", say: "أولًا: حدود معدل لكل مستخدم ولكل عميل.", do: s => {
      s.clear({ dur: 0.4 });
      s.box("u", { x: 420, y: 540, w: 200, h: 110, label: "user", icon: "user", color: "blue", size: 26 }, { at: 0.2 });
      s.box("rl", { x: 820, y: 540, w: 260, h: 110, label: "60 req / min", icon: "gauge", inline: true, size: 24, color: "gold" }, { at: 0.4 });
      s.box("api", { x: 1220, y: 540, w: 200, h: 110, label: "LLM", icon: "brain", color: "purple", size: 26 }, { at: 0.5 });
      for (let i = 0; i < 6; i++) s.flow("u", i < 4 ? "api" : "rl", { color: i < 4 ? "blue" : "red", at: 0.7 + i * 0.2 });
    }},
    { sec: "سقوف", say: "ثانيًا: max_tokens وmax_steps في كل تدفق.", eq: "@T{max@_tokens} = 600, @quad @T{max@_steps} = 8", do: s => {
      s.clear({ dur: 0.4 });
      s.gauge("t", { x: 560, y: 600, r: 130, v: 0.6, color: "teal", label: "tokens / call" }, { at: 0.3 });
      s.gauge("st", { x: 1040, y: 600, r: 130, v: 0.4, color: "blue", label: "agent steps" }, { at: 0.5 });
    }},
    { sec: "ميزانية يومية", say: "ثالثًا: ميزانية يومية لكل عميل، مع إيقاف إجباري عند تجاوزها.", do: s => {
      s.clear({ dur: 0.4 });
      s.bar("sp", { x: 520, y: 480, w: 560, v: 0.4, color: "teal", label: "today's spend", size: 28, h: 34 }, { at: 0.2 });
      s.to("sp", { v: 1, color: "red" }, { at: 0.6, dur: 1.4 });
      s.box("429", { x: 800, y: 640, w: 560, h: 70, label: "429 · Daily AI budget exceeded", font: "mono", size: 24, color: "red" }, { at: 2.1 });
    }},
    { sec: "اللوحات", say: "ورابعًا: لوحات متابعة لتكلفة كل تذكرة.", do: s => {
      s.clear({ dur: 0.4 });
      ["#812", "#813", "#814", "#815", "#816"].forEach((t, i) => { const v = [0.2, 0.25, 0.9, 0.18, 0.22][i]; s.bar("c" + i, { x: 600, y: 380 + i * 80, w: 520, v, color: v > 0.5 ? "red" : "teal", label: "ticket " + t, val: "$" + (v * 0.4).toFixed(2), size: 24, h: 26 }, { at: 0.2 + i * 0.1 }); });
    }},
    { say: "والكود: افحص الميزانية قبل كل استدعاء، وضع سقفًا صارمًا للمخرجات.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("cd", { x: 800, y: 540, size: 25, title: "guard.py", lines: ["if tenant.daily_spend_usd >= tenant.budget_usd:", "    raise HTTPException(429, \"Daily AI budget exceeded\")", "resp = llm(prompt, max_tokens=600)  # hard per-call cap"] }, { at: 0.3, dur: 1.8 });
    }}
  ]);

  // ------------------------------------------------------------------ A5.3 Durable checkpoints in Postgres
  X.lesson("A5.3", [
    { sec: "المشكلة", say: "الـ Checkpointer في الذاكرة يفقد كل شيء عند النشر أو إعادة التشغيل.", do: s => {
      s.box("mem", { x: 560, y: 520, w: 320, h: 150, label: "InMemorySaver", icon: "chip", color: "red", size: 26 });
      s.icon("dp", { name: "rocket", x: 1050, y: 520, s: 90, color: "orange" }, { at: 0.5 });
      s.to("mem", { opacity: 0.25 }, { at: 1.2 });
      s.note("lost", { text: "deploy → threads lost", x: 800, y: 700, color: "red", font: "math", size: 28 }, { at: 1.3 });
    }},
    { sec: "Postgres", say: "فنستبدله بآخر مدعوم بـ Postgres، فتنجو سير العمل من النشر والتوسع.", do: s => {
      s.clear({ dur: 0.4 });
      s.box("pg", { x: 800, y: 600, w: 320, h: 150, label: "PostgresSaver", icon: "db", color: "green", size: 26 }, { at: 0.3 });
      [0, 1, 2].forEach(i => { s.box("r" + i, { x: 440 + i * 360, y: 340, w: 220, h: 70, label: "replica " + (i + 1), size: 22, color: "blue" }, { at: 0.5 + i * 0.1 }); s.link("l" + i, "r" + i, "pg", { color: "green", tail: true }, { at: 0.7 + i * 0.1 }); });
    }},
    { sec: "الإعداد", say: "نشغّل setup مرة واحدة لإنشاء الجداول، ثم نمرّره عند تجميع الرسم.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("cd", { x: 800, y: 540, size: 26, title: "app.py", lines: ["with PostgresSaver.from_conn_string(DB_URI) as cp:", "    cp.setup()", "    app = graph.compile(checkpointer=cp)"] }, { at: 0.3, dur: 1.6 });
      s.to("cd", { hl: 1 }, { at: 2, dur: 0.2 });
    }},
    { sec: "الاستئناف", say: "وبالـ thread_id نفسه نستأنف التذكرة، من أي نسخة من الخادم.", eq: "@T{config} = @{ @T{thread@_id}: @T{\"ticket-812\"} @}", do: s => {
      s.clear({ dur: 0.4 });
      s.box("t", { x: 800, y: 540, w: 460, h: 80, label: "thread_id = \"ticket-812\"", font: "mono", size: 26, color: "purple" }, { at: 0.3 });
    }},
    { sec: "قبل الإطلاق", say: "واختبر سيناريو الإيقاف المفاجئ والاستئناف، وخطّط لتنظيف نقاط الحفظ القديمة.", do: s => {
      s.clear({ dur: 0.4 });
      s.col("ck", ["kill -9 mid-run → resume ✓", "retention: delete after 30 days"], { x: 800, y: 540, size: 28, icons: ["power", "trash"], colors: ["green", "gold"], w: 600 }, { at: 0.3, st: 0.3 });
    }}
  ]);

  // ------------------------------------------------------------------ A5.4 Eval suite in CI
  X.lesson("A5.4", [
    { sec: "التقييم في CI", say: "حوّل التقييمات إلى خطوة في CI: كل تغيير يشغّل تقييمات منع التراجع.", do: s => {
      s.chain("ci", ["pull request", "run evals", "pass ≥ 95%?", "merge"], { y: 480, gap: 60, colors: ["blue", "teal", "gold", "green"], icons: ["pr", "flask", "scale", "branch"], w: 220, h: 140, size: 22 }, { st: 0.25 });
    }},
    { say: "وأي انخفاض عن الأساس يمنع الدمج.", do: s => {
      s.box("blk", { x: s.get("ci2").x, y: 700, w: 300, h: 64, label: "91% → merge blocked", size: 24, color: "red" }, { at: 0.3 });
      s.link("bl", "ci2", "blk", { color: "red" }, { at: 0.2 });
    }},
    { sec: "حزمتان", say: "واحتفظ بحزمة صغيرة سريعة لكل PR، وحزمة كاملة تعمل ليلًا.", do: s => {
      s.clear({ dur: 0.4 });
      s.versus("vs", "per PR · 3 min", "nightly · full suite", { colors: ["teal", "purple"] }, { at: 0.2 });
      s.num("a", { v: 60, x: 435, y: 560, size: 60, color: "teal", suf: " cases" }, { at: 0.5 }); s.num("b", { v: 1200, x: 1165, y: 560, size: 60, color: "purple", suf: " cases" }, { at: 0.7 });
    }},
    { sec: "ماذا تختبر؟", say: "وضمّنها اختبارات الاسترجاع، والإجابة، واختيار الأدوات، والحقن.", do: s => {
      s.clear({ dur: 0.4 });
      s.grid("k", ["retrieval", "answers", "tool choice", "injection"], { cols: 4, y: 520, cw: 270, ch: 160, size: 26, icons: ["search", "check", "tool", "shield"], colors: ["teal", "green", "orange", "red"] }, { at: 0.3, st: 0.15 });
    }},
    { sec: "التذبذب", say: "وكرّر مهام الوكيل المتذبذبة عدة محاولات قبل أن تعتبرها فاشلة.", eq: "@T{fail only if} @; @T{passes} < 2/3", do: s => {
      s.clear({ dur: 0.4 });
      ["✓", "✗", "✓"].forEach((t, i) => s.box("t" + i, { x: 640 + i * 160, y: 520, w: 120, h: 90, label: t, size: 44, color: t === "✓" ? "green" : "red" }, { at: 0.3 + i * 0.25 }));
      s.box("res", { x: 800, y: 680, label: "2 / 3 → pass", size: 28, color: "green", h: 60 }, { at: 1.2 });
    }},
    { say: "وملف الـ workflow بسيط.", do: s => {
      s.clear({ dur: 0.4 });
      s.code("cd", { x: 800, y: 540, size: 26, title: ".github/workflows/evals.yml", lines: ["- name: Run AI Regression Evals", "  run: python evals/run.py --suite=pr --min-pass-rate=0.95"] }, { at: 0.3, dur: 1.4 });
    }}
  ]);

  // ------------------------------------------------------------------ A5.5 AI gateways, fallbacks & semantic caching
  X.lesson("A5.5", [
    { sec: "البوابة", say: "في الإنتاج، ضع بوابة ذكاء اصطناعي أمام المزوّدين.", do: s => {
      s.box("app", { x: 330, y: 540, w: 200, h: 120, label: "your app", icon: "code", color: "teal", size: 24 });
      s.box("gw", { x: 780, y: 540, w: 240, h: 160, label: "AI gateway", icon: "route", color: "gold", size: 28 }, { at: 0.3 });
      ["provider A", "provider B", "self-hosted"].forEach((t, i) => { s.box("p" + i, { x: 1250, y: 380 + i * 160, w: 240, h: 80, label: t, size: 24, color: ["purple", "blue", "green"][i] }, { at: 0.5 + i * 0.1 }); s.link("pl" + i, "gw", "p" + i, { color: "dim" }, { at: 0.6 + i * 0.1 }); });
      s.link("a", "app", "gw", { color: "teal" }, { at: 0.4 });
    }},
    { sec: "البدائل التلقائية", say: "فإذا أعاد مزوّد خطأ 429 أو انقطع، تحوّل البوابة الطلب تلقائيًا إلى مزوّد آخر.", do: s => {
      s.flow("gw", "p0", { color: "gold", at: 0.2 });
      s.to("p0", { stroke: "red", label: "provider A · 503" }, { at: 0.8 });
      s.flow("gw", "p1", { color: "green", at: 1.2 });
      s.to("p1", { stroke: "green" }, { at: 1.8 });
    }},
    { sec: "الكاش الدلالي", say: "والكاش الدلالي يجيب عن الأسئلة المتشابهة المتكررة في أجزاء من الثانية.", do: s => {
      s.box("sc", { x: 780, y: 790, w: 320, h: 70, label: "semantic cache", icon: "bolt", inline: true, size: 24, color: "green" }, { at: 0.2 });
      s.bubble("q1", { text: "How do I reset my password?", side: "u", x: 330, y: 760, w: 300, size: 20 }, { at: 0.4 });
      s.flow("q1", "sc", { color: "green", at: 0.8 });
      s.note("hit", { text: "cache hit · 20 ms · ~$0", x: 1160, y: 790, color: "green", font: "math", size: 26 }, { at: 1.3 });
    }},
    { sec: "الإدارة المركزية", say: "ومفاتيح مركزية، وحدود معدل، ولوحات إنفاق لكل فريق.", do: s => {
      s.clear({ dur: 0.4 });
      s.grid("ct", ["central keys", "rate limits", "spend per team"], { cols: 3, y: 520, cw: 340, ch: 160, size: 26, icons: ["key", "gauge", "chart"], colors: ["gold", "blue", "green"] }, { at: 0.3, st: 0.15 });
    }},
    { sec: "الإطلاق التدريجي", say: "والإطلاق التدريجي: وجّه خمسة بالمئة من الزيارات للنموذج الجديد قبل التبديل الكامل.", do: s => {
      s.clear({ dur: 0.4 });
      s.bar("old", { x: 560, y: 480, w: 560, v: 0.95, color: "blue", label: "current model", val: "95%", size: 26, h: 34 }, { at: 0.3 });
      s.bar("new", { x: 560, y: 600, w: 560, v: 0.05, color: "green", label: "new model", val: "5%", size: 26, h: 34 }, { at: 0.5 });
      s.to("new", { v: 1, val: "100%" }, { at: 1.6, dur: 1.4 }); s.to("old", { v: 0, val: "0%" }, { at: 1.6, dur: 1.4 });
    }}
  ]);

  // ------------------------------------------------------------------ A5.6 Self-hosting open-weight models
  X.lesson("A5.6", [
    { sec: "متى تستضيف؟", say: "عندما تفرض الخصوصية، أو سيادة البيانات، أو الحجم الضخم، أن تملك النموذج.", do: s => {
      s.grid("why", ["strict privacy", "data sovereignty", "huge volume"], { cols: 3, y: 500, cw: 360, ch: 160, size: 28, icons: ["lock", "flag", "chart"], colors: ["red", "gold", "blue"] }, { st: 0.2 });
    }},
    { sec: "Ollama وvLLM", say: "Ollama مثالي للتطوير المحلي، أما vLLM فيشغّل الإنتاج عالي الكثافة على الـ GPU.", do: s => {
      s.clear({ dur: 0.4 });
      s.versus("vs", "Ollama · laptop", "vLLM · GPU servers", { colors: ["teal", "purple"] }, { at: 0.2 });
      s.icon("lp", { name: "terminal", x: 435, y: 540, s: 100, color: "teal" }, { at: 0.5 }); s.icon("gp", { name: "cpu", x: 1165, y: 540, s: 100, color: "purple" }, { at: 0.7 });
    }},
    { say: "وتقنيات PagedAttention والتجميع المستمر تضاعف الطلبات المتزامنة لكل GPU.", do: s => {
      s.bars("th", [["naive serving", 0.25, "dim", "1×"], ["vLLM continuous batching", 0.9, "purple", "many × throughput"]], { x: 960, y: 740, w: 300, gap: 50, size: 20, h: 22 }, { at: 0.3 });
    }},
    { sec: "التكميم", say: "والتكميم يقلّص ذاكرة الـ GPU بمرتين إلى أربع، مع فقدان طفيف في الجودة.", eq: "@T{FP16} @to @T{FP8} @to @T{INT4}", do: s => {
      s.clear({ dur: 0.4 });
      [["FP16", 0.9, "red", "28 GB"], ["FP8", 0.45, "gold", "14 GB"], ["INT4 (AWQ)", 0.25, "green", "8 GB"]].forEach(([l, v, c, t], i) => s.bar("q" + i, { x: 560, y: 440 + i * 100, w: 560, v, color: c, label: l, val: t, size: 28, h: 34 }, { at: 0.3 + i * 0.25 }));
    }},
    { sec: "واجهة متوافقة", say: "واعرض نقطة متوافقة مع OpenAI، فيصبح التبديل بين السحابة والاستضافة مجرد تغيير رابط.", eq: "@T{base@_url} = @T{http://gpu-box:8000/v1}", do: s => {
      s.clear({ dur: 0.4 });
      s.code("cd", { x: 800, y: 540, size: 23, title: "serve.sh", lines: ["vllm serve Qwen/Qwen2.5-14B-Instruct-AWQ \\", "  --quantization awq --max-model-len 16384 --port 8000", "", "# client: OpenAI(base_url=\"http://gpu-box:8000/v1\")"] }, { at: 0.3, dur: 2 });
    }}
  ]);
})();
