// Pedagogical enrichment, code syntax highlighter, analogies, pitfalls & mini-checks for every lesson
(function () {
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // Lightweight safe syntax highlighter (Python, TS/JS, SQL, YAML, Prompt XML)
  window.highlightCode = function (code) {
    const raw = esc(code || "");
    return raw.split("\n").map(line => {
      // Split inline comments (# or -- or //) outside quotes
      let comment = "", body = line;
      const cm = line.match(/(^|\s)(#.*|--.*|\/\/.*)$/);
      if (cm && !line.slice(0, cm.index).includes("&quot;")) {
        body = line.slice(0, cm.index + cm[1].length);
        comment = `<span class="tok-cm">${cm[2]}</span>`;
      }
      body = body
        .replace(/(&quot;[^&]*?&quot;|'[^']*?')/g, '<span class="tok-str">$1</span>')
        .replace(/(&lt;\/?[a-zA-Z0-9_-]+&gt;)/g, '<span class="tok-tag">$1</span>')
        .replace(/\b(def|class|return|if|elif|else|for|in|while|break|with|as|import|from|async|await|yield|raise|const|let|var|new|true|false|True|False|None|SELECT|FROM|WHERE|ORDER|BY|LIMIT|CREATE|TABLE|EXTENSION|NOT|EXISTS|WITH|OVER|FULL|OUTER|JOIN|USING|COALESCE|DESC|PRIMARY|KEY|AND|OR)\b/g, '<span class="tok-kw">$1</span>')
        .replace(/\b(\d+(?:[._]\d+)?)\b/g, '<span class="tok-num">$1</span>')
        .replace(/(@[a-zA-Z_][\w.]*)/g, '<span class="tok-dec">$1</span>');
      return body + comment;
    }).join("\n");
  };

  // Module-level rich fallback metaphors, hooks and pitfalls so EVERY lesson feels handcrafted
  const MOD_META = {
    C1: {
      icon: "brain",
      analogy: [
        "Think of an AI model like a master musician whose sheet music is encoded into billions of numeric weights — inference is simply pressing play on a new melody.",
        "تخيّل النموذج كعازف ماهر حُفظت خبرته في مليارات الأرقام (الأوزان) — والاستدلال هو ببساطة تشغيل لحن جديد عبر هذه الخبرة فورًا."
      ],
      mistake: [
        "Picking the largest, most expensive flagship model for every simple task without measuring quality, speed and cost.",
        "اختيار أضخم وأغلى نموذج لكل مهمة بسيطة دون قياس الجودة والسرعة والتكلفة على أمثلتك الحقيقية."
      ]
    },
    C2: {
      icon: "bolt",
      analogy: [
        "An LLM is an extraordinary word-by-word improviser: it predicts the next puzzle piece from context probabilities rather than looking up a database.",
        "نموذج اللغة يشبه مرتجلًا بارعًا يكتب قطعة تلو الأخرى بتوقع الكلمة الأرجح في السياق، لا بالبحث في قاعدة بيانات جاهزة."
      ],
      mistake: [
        "Treating fluent, confident LLM prose as guaranteed truth without grounding, verification or stop-reason checks.",
        "التعامل مع النص المتقن الواثق من النموذج كحقيقة مضمونة دون تأريض بمصادر أو تحقق أو فحص سبب التوقف."
      ]
    },
    C3: {
      icon: "library",
      analogy: [
        "RAG turns a closed-book memory test into an open-book exam where a fast librarian hands the model the exact paragraphs it needs — with page numbers.",
        "يحوّل RAG الاختبار من حفظٍ عن ظهر قلب إلى امتحان مفتوح الكتاب يُحضر فيه أمين مكتبة ذكي الفقرات المطلوبة بالضبط مع أرقام الصفحات."
      ],
      mistake: [
        "Dumping huge raw documents into naive fixed-size chunks without cleaning, metadata, hybrid search or retrieval evals.",
        "تقطيع المستندات الخام عشوائيًا بأحجام ثابتة دون تنظيف أو بيانات وصفية أو بحث هجين أو قياس جودة الاسترجاع."
      ]
    },
    C4: {
      icon: "chef",
      analogy: [
        "An AI agent is like a sous-chef in a kitchen: read the order (think), grab a tool (act), taste the result (observe), and loop until the dish is ready.",
        "الوكيل الذكي مثل طاهٍ في مطبخ: يقرأ الطلب (تفكير)، يستخدم أداة (تنفيذ)، يتذوق النتيجة (ملاحظة)، ويكرر حتى يجهز الطبق."
      ],
      mistake: [
        "Launching an unbounded agent loop with powerful write tools and zero step caps, logging or human approval gates.",
        "إطلاق حلقة وكيل بلا حد للخطوات مع أدوات كتابة خطيرة ودون تسجيل خطوات أو موافقات بشرية."
      ]
    },
    C5: {
      icon: "compass",
      analogy: [
        "Workflows are high-speed trains on reliable tracks; agents are off-road explorers. Great engineers combine both rather than forcing one everywhere.",
        "سير العمل قطار سريع على سكة موثوقة، والوكيل مستكشف يختار طريقه بنفسه. المهندس المحترف يجمع بينهما بذكاء."
      ],
      mistake: [
        "Jumping straight to a complex multi-agent swarm when a clean deterministic workflow would be faster, cheaper and 10× easier to debug.",
        "القفز مباشرة لبناء شبكة وكلاء معقدة بينما يحل سير عمل بسيط المشكلة بسرعة وتكلفة أقل وسهولة أكبر في التصحيح."
      ]
    },
    M1: {
      icon: "rocket",
      analogy: [
        "ML researchers forge the engine; AI Engineers assemble the cockpit, fuel gauges, autopilot and safety brakes that ship to real users.",
        "باحثو ML يصنعون المحرك، ومهندسو AI يبنون الطائرة وقمرة القيادة ومقاييس الأمان لتعمل بنجاح لدى المستخدمين."
      ],
      mistake: [
        "Assuming HTTP 200 means the AI feature worked — silent wrong answers and truncated outputs are the real bugs.",
        "الافتراض أن HTTP 200 يعني نجاح الميزة الذكية — الإجابات الخاطئة الصامتة والمقطوعة هي الأخطاء الحقيقية."
      ]
    },
    A1: {
      icon: "compass",
      analogy: [
        "Engineering AI systems is like climbing a ladder of autonomy: stay on the lowest rung that reliably solves the user's job.",
        "هندسة أنظمة AI تشبه صعود سلّم الاستقلالية: ابقَ على أدنى درجة تحل مشكلة المستخدم بكفاءة وموثوقية."
      ],
      mistake: [
        "Ignoring rate limits, stop reasons and model deprecations until production traffic hits a sudden wall.",
        "تجاهل حدود المعدل وأسباب التوقف وإيقاف النماذج القديمة حتى يصطدم الإنتاج بعطل مفاجئ."
      ]
    },
    M2: {
      icon: "code",
      analogy: [
        "A Model API is like a brilliant contractor who forgets everything after every email — you send the brief, expect a signed form (schema), and verify every field.",
        "واجهة النموذج مثل مستشار بارع ينسى كل شيء بعد كل رسالة — ترسل له السياق وتطلب نموذجًا مهيكلًا وتتحقق من كل حقل."
      ],
      mistake: [
        "Parsing raw LLM text with fragile regexes or passing unvalidated JSON straight into database writes.",
        "تحليل مخرجات النموذج بتعبيرات عشوائية أو تمرير JSON غير متحقّق منه مباشرة لقاعدة البيانات."
      ]
    },
    M3: {
      icon: "layers",
      analogy: [
        "Your prompt and context window are a spotlight on stage: clutter the stage with irrelevant props and the actor misses the script.",
        "الأمر ونافذة السياق مثل كشّاف مسرح: إن ملأت المسرح بأغراض غير مهمة تشتّت الممثل وأخطأ النص."
      ],
      mistake: [
        "Tweaking prompts by gut feeling without version IDs or a real evaluation set to prove v2 beats v1.",
        "تعديل الأوامر بالحدس العشوائي دون أرقام إصدارات أو مجموعة تقييم تثبت أن النسخة الجديدة أفضل."
      ]
    },
    M4: {
      icon: "layers",
      analogy: [
        "Frameworks like LangChain are universal power adapters — great for plugging into many providers quickly, as long as you still inspect the voltage underneath.",
        "أُطر العمل مثل LangChain محوّلات طاقة موحّدة — رائعة للتبديل بين المزودين بسرعة بشرط أن تفهم ما يجري تحت الغطاء."
      ],
      mistake: [
        "Hiding simple one-call prompts behind deep framework abstractions that obscure traces and slow debugging.",
        "إخفاء استدعاء بسيط خلف طبقات تجريد ثقيلة تصعّب قراءة الـ Traces وتبطئ تصحيح الأخطاء."
      ]
    },
    A2: {
      icon: "bolt",
      analogy: [
        "Prompt caching and context compaction work like keeping your desk spotless and your reference handbook bookmarked at page 1.",
        "الكاش وضغط السياق مثل إبقاء مكتبك منظمًا ومرجعك مفتوحًا على الصفحة الصحيحة بدل إعادة قراءة الكتاب كل مرة."
      ],
      mistake: [
        "Putting changing timestamps at the very start of the system prompt — destroying prompt cache hits on every call.",
        "وضع بيانات متغيرة (كالوقت الحالي) في أول تعليمات النظام — مما يدمّر إصابات الكاش في كل استدعاء."
      ]
    },
    M5: {
      icon: "library",
      analogy: [
        "Vector search is like organizing a bookstore by meaning instead of alphabet: books about refunds sit next to return policies even if they share zero words.",
        "البحث المتجهي مثل ترتيب مكتبة حسب المعنى لا الحروف: كتب الاسترداد تجاور سياسات الإرجاع حتى لو اختلفت كلماتها."
      ],
      mistake: [
        "Forgetting to filter vector search by tenant_id in SQL — risking cross-customer data leaks inside RAG answers.",
        "نسيان التصفية بـ tenant_id داخل استعلام البحث المتجهي — مما يعرّض بيانات العملاء للتسرب بين بعضهم."
      ]
    },
    M6: {
      icon: "radar",
      analogy: [
        "LangGraph is an air-traffic flowchart with a black-box recorder: every state transition is typed, checkpointed, resumable and inspectable.",
        "LangGraph مخطط تحكم جوي مع صندوق أسود: كل انتقال في الحالة موثّق ومحفوظ بنقطة استئناف وقابل للمراجعة."
      ],
      mistake: [
        "Using an in-memory checkpointer in production or letting evaluator loops run without a strict max_iterations guard.",
        "استخدام Checkpointer في الذاكرة داخل الإنتاج أو ترك حلقات التقييم بلا حد أقصى للتكرار."
      ]
    },
    M7: {
      icon: "radar",
      analogy: [
        "MCP is the USB-C standard for AI tools: instead of soldering custom wires for every app, every server speaks one clean protocol.",
        "MCP هو معيار USB-C لأدوات الذكاء الاصطناعي: بدل توصيلات مخصصة لكل تطبيق، يتحدث الجميع بروتوكولًا واحدًا نظيفًا."
      ],
      mistake: [
        "Exposing raw write APIs without idempotency keys — causing an agent retry to refund or email the same customer twice.",
        "كشف أدوات الكتابة دون مفاتيح Idempotency — مما يجعل إعادة المحاولة تنفذ الاسترداد أو الإرسال مرتين."
      ]
    },
    A3: {
      icon: "library",
      analogy: [
        "Combining hybrid search, reranking, graph memory and sandboxes turns a toy chatbot into a reliable, industrial-grade research assistant.",
        "دمج البحث الهجين وإعادة الترتيب والذاكرة الرسومية والبيئات المعزولة يحوّل الدردشة التجريبية إلى نظام صناعي موثوق."
      ],
      mistake: [
        "Relying on pure embeddings for exact order numbers or running agent-generated code without an isolated sandbox.",
        "الاعتماد على التضمين وحده لأرقام الطلبات الدقيقة أو تشغيل كود الوكيل دون بيئة معزولة Sandbox."
      ]
    },
    M8: {
      icon: "rocket",
      analogy: [
        "Great AI UX is like an open kitchen: customers see each step cooking live (SSE events) and can hit Cancel before anything hits the plate.",
        "تجربة AI الممتازة مثل مطبخ مفتوح: يرى المستخدم خطوات التنفيذ مباشرة عبر SSE ويستطيع الإلغاء في أي لحظة."
      ],
      mistake: [
        "Forcing every feature into a blank chat box and showing a 20-second frozen spinner with no cancel button.",
        "حشر كل ميزة داخل صندوق محادثة فارغ وعرض مؤشر تحميل جامد لـ 20 ثانية دون زر إلغاء."
      ]
    },
    M9: {
      icon: "gauge",
      analogy: [
        "Observability and evals are your airplane's radar and dashboard: flying an AI app without traces and graders is flying blindfolded in fog.",
        "التتبع والتقييمات هما رادار الطائرة ولوحة قيادتها: تشغيل تطبيق AI بدونهما كالطيران معصوب العينين في الضباب."
      ],
      mistake: [
        "Trusting an uncalibrated 1–10 LLM-as-a-Judge score instead of reading real traces and calibrating binary pass/fail criteria.",
        "الاعتماد على تقييم 1–10 من نموذج حَكَم غير مُعايَر بدل قراءة الـ Traces الحقيقية ومعايرة نجاح/رسوب واضح."
      ]
    },
    M10: {
      icon: "shield",
      analogy: [
        "AI security is bank-vault architecture: never expect the teller (the LLM) to spot every forged note — enforce locks, permissions and isolation at the door.",
        "أمن الذكاء الاصطناعي مثل تصميم خزنة بنك: لا تتوقع من الموظف (النموذج) كشف كل خدعة — افرض الأقفال والصلاحيات والعزل معماريًا."
      ],
      mistake: [
        "Trying to defend against prompt injection purely by writing 'Ignore evil users!' inside the system prompt.",
        "محاولة صد حقن التعليمات بمجرد كتابة «تجاهل المستخدمين السيئين!» داخل أمر النظام دون قيود معمارية."
      ]
    },
    A4: {
      icon: "shield",
      analogy: [
        "Error analysis + calibrated graders + threat checklists act like a pre-flight safety inspection before every single release.",
        "تحليل الأخطاء ومعايرة الحَكَم وقائمة التهديدات تشبه فحص ما قبل الإقلاع قبل كل إطلاق جديد."
      ],
      mistake: [
        "Shipping an agent that combines private data, untrusted external text and outbound email/HTTP access all at once.",
        "إطلاق وكيل يجمع بين البيانات الخاصة والمحتوى غير الموثوق والقدرة على الإرسال الخارجي في آن واحد."
      ]
    },
    M11: {
      icon: "rocket",
      analogy: [
        "ReplyAssist is the symphony where every instrument you mastered — FastAPI, pgvector, LangGraph, SSE and HITL — plays together in harmony.",
        "مشروع ReplyAssist هو الأوركسترا التي تعزف فيها كل أداة أتقنتها — FastAPI وpgvector وLangGraph وSSE والموافقات — بتناغم كامل."
      ],
      mistake: [
        "Testing only the happy path in notebooks instead of verifying UI → API → LangGraph → Postgres → Approval end-to-end.",
        "اختبار المسار السعيد فقط في Notebooks بدل اختبار التدفق الكامل من الواجهة حتى قاعدة البيانات والموافقة."
      ]
    },
    A5: {
      icon: "rocket",
      analogy: [
        "Production readiness is the difference between a weekend prototype and a 24/7 airline: gateways, budgets, durable checkpoints and CI evals keep it flying.",
        "جاهزية الإنتاج هي الفرق بين نموذج تجريبي وشركة طيران تعمل 24/7: البوابات والميزانيات ونقاط الحفظ الدائمة وتقييمات CI."
      ],
      mistake: [
        "Trusting tenant_id from the client request body or shipping prompt edits without automated regression evals in CI.",
        "الوثوق بـ tenant_id القادم من جسم الطلب أو نشر تعديلات أوامر دون اختبارات منع التراجع في CI."
      ]
    },
    W1: {
      icon: "code",
      analogy: [
        "Coding with AI is like leading a high-speed engineering crew: your clarity in specs, context, and plans determines whether they build a skyscraper or a maze.",
        "البرمجة مع الذكاء الاصطناعي مثل قيادة فريق هندسي فائق السرعة: وضوحك في المواصفات والسياق والتخطيط يحدد هل سيبنون ناطحة سحاب أم متاهة."
      ],
      mistake: [
        "Jumping straight into vague 'fix it' prompts inside one crowded 50-turn chat with zero plan and zero verification.",
        "القفز مباشرة بأوامر غامضة داخل محادثة طويلة مزدحمة بلا خطة واضحة ولا تحقق من النتائج."
      ]
    },
    W2: {
      icon: "layers",
      analogy: [
        "Rules files (GEMINI.md, CLAUDE.md, AGENTS.md) are your repo's permanent engineering laws — write them once so every agent session respects your architecture.",
        "ملفات القواعد (GEMINI.md / CLAUDE.md / AGENTS.md) هي قوانين الهندسة الدائمة لمشروعك — اكتبها مرة واحدة ليلتزم بها كل وكيل في كل جلسة."
      ],
      mistake: [
        "Dumping 800 lines of vague advice into a rules file so the agent suffers attention dilution and ignores the rules that matter.",
        "حشو 800 سطر من النصائح العامة في ملف القواعد فيتشتت انتباه الوكيل ويتجاهل القواعد الأهم."
      ]
    },
    W3: {
      icon: "bolt",
      analogy: [
        "Skills are specialized playbooks pulled off the shelf only when needed; Hooks are deterministic safety locks; Subagents are focused helpers that keep your main context spotless.",
        "المهارات (Skills) كتيّبات خبرة تُفتح عند الحاجة فقط، والـ Hooks أقفال أمان حتمية، والوكلاء الفرعيون مساعدون يعزلون الضوضاء عن سياقك الرئيسي."
      ],
      mistake: [
        "Stuffing multi-step playbooks into always-on Rules instead of Skills, or relying on polite prompts instead of deterministic Hooks.",
        "حشر إجراءات متخصصة طويلة داخل القواعد الدائمة بدل Skills، أو الاعتماد على الترجّي النصي بدل Hooks حتمية."
      ]
    },
    W4: {
      icon: "shield",
      analogy: [
        "MCP plugs your AI into live GitHub, databases, Figma, and browsers — while TDD loops, model routing, and strict diff reviews keep you firmly in the pilot seat.",
        "يربط MCP وكيلك بـ GitHub وقواعد البيانات وFigma والمتصفح مباشرة، بينما تُبقيك اختبارات TDD وتوجيه النماذج ومراجعة التعديلات في مقعد القيادة."
      ],
      mistake: [
        "Enabling 15 bloated MCP servers with write permissions to production or merging unreviewed 'AI Slop' you cannot explain.",
        "تفعيل 15 خادم MCP بصلاحيات كتابة على الإنتاج أو دمج «كود عشوائي» (AI Slop) دون مراجعة وفهم."
      ]
    },
    F1: {
      icon: "rocket",
      analogy: [
        "An LLM is a Formula 1 engine; the Agent Harness is the chassis, telemetry, brakes, durable state, and pit crew that make it win long races reliably.",
        "النموذج اللغوي محرك سباق؛ أما الـ Harness فهو الهيكل والفرامل والحالة الدائمة والمدقّقات التي تجعله يفوز في السباقات الطويلة بثبات."
      ],
      mistake: [
        "Expecting a single fragile in-memory chat loop to run for hours and grade its own output accurately without a harness, durable checkpoints, or an independent evaluator.",
        "توقع نجاح حلقة محادثة هشة في الذاكرة لساعات وتقييمها لنفسها بدقة دون Harness وحفظ حالة دائم ومُقيِّم مستقل."
      ]
    },
    F2: {
      icon: "shield",
      analogy: [
        "Containers isolate the blast radius and Portainer-Command acts as air-traffic control: AI agents inspect read-only radar, submit GitOps Pull Requests, and can be halted fleet-wide in one click.",
        "الحاويات تعزل نطاق التأثير، ويعمل Portainer-Command كبرج مراقبة: يفحص الوكيل بصلاحية قراءة فقط ويقترح تعديلاته عبر GitOps PR مع زر إيقاف طارئ فوري."
      ],
      mistake: [
        "Handing an AI agent your personal admin kubeconfig, host Docker socket, or direct write access to production servers.",
        "تسليم وكيل الذكاء الاصطناعي ملف kubeconfig الإداري الشخصي أو مقبس Docker الرئيسي أو صلاحية كتابة مباشرة على الإنتاج."
      ]
    },
    F3: {
      icon: "radar",
      analogy: [
        "MCP plugs tools into an agent, A2A connects agents across teams, AG-UI streams rich live interfaces to humans, and RLVR/DSPy replace guesswork with objective verifiers.",
        "يربط MCP الأدوات بالوكيل، ويربط A2A الوكلاء ببعضهم، وتبث AG-UI واجهات تفاعلية للمستخدم، بينما يستبدل RLVR وDSPy التخمين بالمدقّقات الموضوعية."
      ],
      mistake: [
        "Building brittle proprietary glue code for multi-agent handoffs or hand-tweaking giant prompt strings every time you switch models.",
        "كتابة أكواد ربط هشة ومغلقة بين الوكلاء أو تعديل نصوص أوامر ضخمة يدويًا مع كل تبديل للنموذج."
      ]
    }
  };

  function shortTitle(s) {
    return String(s).split(/[:—–]/)[0].trim();
  }

  window.enrichLesson = function (l) {
    const modId = l.module ? l.module.id : "C1";
    const m = MOD_META[modId] || MOD_META.C1;
    const analogy = l.analogy || m.analogy;
    const bestPractice = l.tip
      ? l.tip
      : [l.p[0][0], l.p[0][1]];
    const mistake = m.mistake;
    const hook = [
      `How do real AI Engineers master "${shortTitle(l.t[0])}" in production?`,
      `كيف يتقن مهندسو الذكاء الاصطناعي «${shortTitle(l.t[1])}» في بيئة الإنتاج؟`
    ];

    // Build a meaningful, accurate quick Brain-Check question from the lesson itself
    const correctEn = l.p[0][0];
    const correctAr = l.p[0][1];
    const d1 = m.mistake;
    const d2 = [
      "Skip evaluation, validation and budgets because modern LLMs always self-correct automatically.",
      "تجاوز التقييم والتحقق والميزانيات لأن النماذج الحديثة تصحّح نفسها تلقائيًا دائمًا."
    ];

    // Deterministic rotation based on lesson id so correct answer isn't always index 0
    const hash = l.id.split("").reduce((a, ch) => a + ch.charCodeAt(0), 0);
    const ans = hash % 3;
    const rawOpts = [
      [correctEn, correctAr],
      d1,
      d2
    ];
    const opts = [null, null, null];
    opts[ans] = rawOpts[0];
    opts[(ans + 1) % 3] = rawOpts[1];
    opts[(ans + 2) % 3] = rawOpts[2];

    const quiz = {
      q: [
        `Quick Check: Which engineering principle is TRUE for "${shortTitle(l.t[0])}"?`,
        `اختبار سريع: أي مبدأ هندسي صحيح بخصوص «${shortTitle(l.t[1])}»؟`
      ],
      opts,
      ans,
      why: [
        l.p.length > 1 ? `${correctEn} Remember also: ${l.p[1][0]}` : correctEn,
        l.p.length > 1 ? `${correctAr} وتذكّر أيضًا: ${l.p[1][1]}` : correctAr
      ]
    };

    return {
      icon: m.icon,
      hook,
      analogy,
      mistake,
      bestPractice,
      quiz
    };
  };
})();
