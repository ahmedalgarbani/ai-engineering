// Deep-Dive Technical Explanations, Non-Literal Term Glossary & Authoritative Industry Sources
(function () {
  // 1. Comprehensive AI Engineering Glossary (auto-matched to every lesson)
  const GLOSSARY = [
    {
      rx: /\b(token|tokens|tokenization)\b/i,
      en: "Token & Tokenization",
      ar: "الـ Token وتقطيع النصوص (Tokenization)",
      def: [
        "Models don't read characters or whole words—they split text into common sub-word pieces called tokens (roughly 3–4 English characters, or ~0.5–0.7 Arabic words per token). You are billed per input + output token.",
        "النماذج لا تقرأ الحروف حرفًا بحرف ولا الكلمات كاملة، بل تقسّم النص إلى مقاطع شائعة تُسمّى Tokens (في الإنجليزية الـ Token ≈ ¾ كلمة، وفي العربية الكلمة الواحدة قد تساوي 1.5 إلى 2 Token). الفوترة وسرعة الرد تعتمدان على عدد الـ Tokens."
      ],
      ex: [
        "\"AI Engineering\" → 2 tokens; Arabic \"هندسة الذكاء الاصطناعي\" → ~8–10 tokens.",
        "كلمة «AI» قد تأخذ 1 Token، بينما جملة عربية قصيرة قد تأخذ 10 Tokens — لذلك ضغط السياق العربي يوفّر الكثير من التكلفة."
      ]
    },
    {
      rx: /\b(sampling|temperature|top-p|top_p)\b/i,
      en: "Sampling, Temperature & Top-p",
      ar: "اختيار الكلمات الاحتمالي (Sampling) ومعامل العشوائية (Temperature)",
      def: [
        "At each step, an LLM outputs a probability score for every possible next token. Sampling is the algorithm that picks one token from that distribution. Temperature (0.0–2.0) scales those probabilities: 0 picks the highest-probability token deterministically; 0.7–1.0 allows creative variety. Top-p (nucleus sampling) restricts choices to the smallest set of tokens whose probabilities sum to p (e.g., 0.9).",
        "في كل خطوة، يحسب النموذج احتمال كل كلمة تالية ممكنة. عملية Sampling هي طريقة اختيار الكلمة من هذه الاحتمالات. معامل Temperature (من 0 إلى 2) يضبط الجرأة: عند 0 يختار النموذج الكلمة الأعلى احتمالًا دائمًا (ثبات ودقة عالية)، وعند 0.7–1.0 يسمح بتنوّع وإبداع أكبر. أما Top-p فيحصر الاختيار في أفضل الكلمات التي يبلغ مجموع احتمالاتها p (مثل 0.9)."
      ],
      ex: [
        "Use temperature=0 for JSON extraction/classification; use temperature=0.7–0.9 for marketing copy or brainstorming.",
        "استخدم temperature=0 لاستخراج البيانات أو التصنيف، وtemperature=0.8 لكتابة أفكار تسويقية أو قصصية."
      ]
    },
    {
      rx: /\b(context window|max_tokens|stop_reason|stop reason|truncat)\b/i,
      en: "Context Window, max_tokens & Stop Reason",
      ar: "نافذة السياق (Context Window) وحدّ المخرجات (max_tokens)",
      def: [
        "The Context Window is the model's working memory limit per API call (e.g., 128K or 200K tokens)—it must fit the system prompt, conversation history, retrieved docs, user question, AND the model's reply. max_tokens caps only the reply length. Always check stop_reason: 'end_turn' means finished naturally; 'max_tokens' means the answer was cut off!",
        "نافذة السياق هي أقصى مساحة ذاكرة يستوعبها النموذج في الطلب الواحد (مثل 128 ألف أو 200 ألف Token)، وتشمل: تعليمات النظام + سجل المحادثة + المستندات المرفقة + السؤال + الإجابة. أما max_tokens فيحدّد طول الإجابة فقط. راقب دائمًا stop_reason: إذا كان 'max_tokens' فالإجابة مقطوعة وتحتاج متابعة."
      ],
      ex: [
        "If context is 128K and you send 127K tokens of docs, the model only has 1K left to answer.",
        "إذا كانت النافذة 128K وأرسلت 127K من المستندات، فلن يتبقى للنموذج سوى 1K فقط للإجابة!"
      ]
    },
    {
      rx: /\b(weights|parameters|inference|stateless)\b/i,
      en: "Weights, Parameters & Stateless Inference",
      ar: "الأوزان (Weights) والاستدلال عديم الحالة (Stateless Inference)",
      def: [
        "Parameters (weights) are the billions of floating-point numbers learned during training that encode the model's knowledge. Inference is running a forward pass through those frozen weights to generate a response. APIs are stateless: the model has zero memory between requests unless you resend the conversation history.",
        "الأوزان (أو المعاملات Parameters) هي مليارات الأرقام التي تعلّمها النموذج أثناء التدريب وتختزن معرفته. الاستدلال (Inference) هو تشغيل هذه الأوزان الثابتة لإنتاج إجابة على مدخل جديد. واجهات APIs لا تحفظ الذاكرة بين الطلبات (Stateless)؛ لذا يجب إرسال سجل المحادثة مع كل طلب."
      ],
      ex: [
        "Llama-3 70B has 70 billion parameters; at 16-bit precision that's ~140 GB of GPU memory just to load.",
        "نموذج بحجم 70B يعني 70 مليار رقم (وزن)، ويحتاج ~140 جيجابايت من ذاكرة كرت الشاشة لمجرد تحميله."
      ]
    },
    {
      rx: /\b(pre-training|fine-tuning|sft|rlhf|dpo|lora|cutoff)\b/i,
      en: "Pre-training, SFT, RLHF / DPO & LoRA",
      ar: "التدريب المسبق والضبط الدقيق (SFT / LoRA) والتوجيه (RLHF / DPO)",
      def: [
        "Pre-training teaches language & world knowledge by predicting the next token on trillions of words (defining the knowledge cutoff). SFT (Supervised Fine-Tuning) trains on curated Q&A pairs so the model acts like an assistant. RLHF / DPO aligns tone and safety using human/verifier preferences. LoRA fine-tunes tiny adapter matrices instead of all weights, cutting GPU cost by 10–100×.",
        "التدريب المسبق يعلّم النموذج اللغة والمعرفة العامة عبر التنبؤ بالكلمة التالية على تريليونات الكلمات (وهنا يتحدد تاريخ توقف المعرفة Knowledge Cutoff). بعدها يأتي الضبط الدقيق SFT بأمثلة سؤال/جواب لتعليم أسلوب المساعد، ثم RLHF / DPO لتهذيب السلوك والأمان حسب تفضيلات البشر. أما LoRA فهي تقنية ذكية لتدريب مصفوفات صغيرة إضافية بدل تعديل كل أوزان النموذج، فتخفض التكلفة أضعافًا."
      ],
      ex: [
        "OpenAI & Anthropic recommend: Prompt Engineering → RAG → Fine-tuning (only for style, format, or domain jargon).",
        "القاعدة الذهبية: ابدأ بهندسة الأوامر، ثم RAG للبيانات، ولا تلجأ للضبط الدقيق إلا لتغيير الأسلوب أو الصيغة الصارمة."
      ]
    },
    {
      rx: /\b(embedding|embeddings|vector|cosine|pgvector|semantic search|hybrid search|bm25)\b/i,
      en: "Embeddings, Vector Search & Hybrid Search",
      ar: "التضمين المتجهي (Embeddings) والبحث الدلالي والهجين",
      def: [
        "An Embedding model converts text into a list of numbers (a vector, e.g., 1536 dimensions) where similar meanings sit close together in space. Vector search finds semantically related passages even with different words. Hybrid search combines Vector search (meaning) + BM25 keyword search (exact codes, names, IDs) using Reciprocal Rank Fusion (RRF).",
        "نموذج التضمين (Embedding) يحوّل النص إلى قائمة أرقام (متجه Vector) بحيث تكون النصوص المتقاربة في المعنى متجاورة رياضيًا. البحث المتجهي يلتقط المعنى حتى لو اختلفت الكلمات، بينما البحث الهجين (Hybrid Search) يدمج البحث الدلالي مع البحث بالكلمات المفتاحية (BM25) لضمان عدم ضياع الأكواد والأسماء الدقيقة."
      ],
      ex: [
        "'Cancel my order' and 'How do I get a refund?' have high cosine similarity even with zero shared words.",
        "جملة «كيف أسترجع فلوسي؟» وجملة «سياسة الإلغاء والاسترداد» تتطابقان دلاليًا رغم اختلاف الألفاظ."
      ]
    },
    {
      rx: /\b(rag|retrieval|chunk|chunks|chunking|rerank|reranking|grounding|citation|graphrag)\b/i,
      en: "RAG, Chunking, Reranking & Grounding",
      ar: "الاسترجاع المعزّز (RAG) والتقطيع وإعادة الترتيب (Reranking)",
      def: [
        "RAG (Retrieval-Augmented Generation) injects verified external passages into the prompt at query time. Documents are split into overlapping chunks (typically 300–800 tokens), indexed, retrieved (top-20 to 50), and then scored by a Cross-Encoder Reranker to keep the top 3–5 most relevant chunks. Grounding forces the model to cite sources and say 'I don't know' when evidence is missing.",
        "تقنية RAG تربط النموذج ببياناتك الخاصة لحظة السؤال: تُقسّم المستندات لمقاطع (Chunks) من 300–800 Token، تُفهرس، ثم عند السؤال يُسترجع أفضل 20–50 مقطعًا ويُعاد ترتيبها بدقة عبر Reranker لاختيار أفضل 3–5 مقاطع فقط تُمرّر للنموذج مع إلزامه بذكر المصدر (Grounding)."
      ],
      ex: [
        "Adding a Reranker + Hybrid Search typically boosts RAG answer accuracy by 15–30% over naive vector-only search.",
        "إضافة البحث الهجين + Reranker يرفع دقة إجابات RAG بنسبة 15–30% مقارنة بالبحث المتجهي وحده."
      ]
    },
    {
      rx: /\b(json schema|structured output|zod|pydantic|validation|refusal)\b/i,
      en: "Structured Outputs, JSON Schema & Zod / Pydantic",
      ar: "المخرجات المهيكلة (Structured Outputs) والتحقق البرمجي",
      def: [
        "Constrained decoding / Structured Outputs force the model to emit valid JSON matching a strict schema (field names, types, enums). Libraries like Zod (TypeScript) and Pydantic (Python) validate the parsed object at runtime before your database or UI touches it.",
        "المخرجات المهيكلة تجبر النموذج على الرد بصيغة JSON مطابقة تمامًا لمخطط محدد (JSON Schema). بعدها تقوم مكتبات مثل Zod (في TypeScript) أو Pydantic (في Python) بالتحقق من صحة البيانات وأنواعها وقت التشغيل قبل تمريرها لقاعدة البيانات."
      ],
      ex: [
        "Ticket = z.object({ urgent: z.boolean(), category: z.enum(['billing','bug']) }) guarantees no unexpected strings.",
        "تعريف حقل urgent كـ boolean وcategory كخيارات محددة يمنع النموذج من إرجاع نصوص عشوائية تكسر الكود."
      ]
    },
    {
      rx: /\b(tool calling|function calling|tool_use|tool_result|mcp|model context protocol)\b/i,
      en: "Tool Calling & MCP (Model Context Protocol)",
      ar: "استدعاء الأدوات (Tool Calling) وبروتوكول MCP",
      def: [
        "Tool Calling lets the LLM emit a structured request to invoke one of your functions (e.g., query_db, send_email); your app executes it safely and feeds the output back as tool_result. MCP (Model Context Protocol, introduced by Anthropic) standardizes how any AI app connects to external tools, databases, and resources—like a USB-C port for AI.",
        "استدعاء الأدوات يسمح للنموذج بطلب تنفيذ دالة برمجية عرّفتها له، فيتحقق تطبيقك من المدخلات وينفّذها ويعيد النتيجة للنموذج. أما بروتوكول MCP (من Anthropic) فهو معيار موحّد لربط النماذج بمصادر البيانات والأدوات الخارجية — يشبه منفذ USB-C لعالم الذكاء الاصطناعي."
      ],
      ex: [
        "One MCP server for PostgreSQL or GitHub works across Claude, Cursor, and your custom Python/TS agent.",
        "خادم MCP واحد لـ GitHub أو قاعدة البيانات يعمل مباشرة مع أي عميل أو وكيل يدعم البروتوكول."
      ]
    },
    {
      rx: /\b(prompt engineering|few-shot|system prompt|context engineering|prompt caching)\b/i,
      en: "Prompt & Context Engineering + Prompt Caching",
      ar: "هندسة الأوامر والسياق والكاش (Prompt Caching)",
      def: [
        "Prompt Engineering structures instructions, roles, XML/Markdown tags, and few-shot examples. Context Engineering curates the exact minimal high-signal tokens the model needs right now. Prompt Caching stores the static prefix (system prompt + docs) on the provider's GPU memory, cutting input token costs by up to 90% and latency by 2–4×.",
        "هندسة الأوامر تنظّم التعليمات والأمثلة (Few-shot) والوسوم بوضوح. هندسة السياق تهتم بانتقاء أقل قدر من المعلومات عالية القيمة وتقليل الضوضاء. أما Prompt Caching فيحفظ الجزء الثابت من الأمر والمستندات في ذاكرة المزود، مما يخفض التكلفة حتى 90% ويسرّع الاستجابة أضعافًا."
      ],
      ex: [
        "Always place static instructions and large reference docs at the TOP of the prompt, and changing user inputs at the BOTTOM to hit the cache.",
        "ضع التعليمات والمستندات الثابتة في بداية الأمر دائمًا، وضع سؤال المستخدم والوقت المتغير في النهاية للاستفادة من الكاش."
      ]
    },
    {
      rx: /\b(agent|agentic|react|workflow|langgraph|checkpointer|human-in-the-loop|interrupt)\b/i,
      en: "Workflows vs. AI Agents, ReAct & Checkpointers",
      ar: "سير العمل مقابل الوكلاء (Agents) وحلقة ReAct ونقاط الحفظ",
      def: [
        "A Workflow runs fixed, developer-defined steps. An Agent lets the LLM dynamically decide which tools to call in a ReAct (Reason → Act → Observe) loop until done. Frameworks like LangGraph model this as a stateful graph with Checkpointers (saving state after each node) and Human-in-the-loop interrupts before risky actions.",
        "سير العمل (Workflow) يتبع خطوات ثابتة مبرمجة مسبقًا، بينما الوكيل (Agent) يقرر بنفسه أي أداة يستخدم في حلقة ReAct (تفكير ← تنفيذ ← ملاحظة). أُطر مثل LangGraph تحفظ حالة الوكيل عبر Checkpointers وتتيح إيقاف التنفيذ لطلب موافقة بشرية (Human-in-the-loop) قبل الإجراءات الحساسة."
      ],
      ex: [
        "Use a workflow for 'summarize → translate → email'; use an agent for 'investigate why server CPU spiked and open a PR'.",
        "استخدم Workflow لتلخيص ثم ترجمة ثم إرسال بريد؛ واستخدم Agent للتحقيق في عطل تقني واختيار أدوات الفحص."
      ]
    },
    {
      rx: /\b(eval|evals|llm-as-a-judge|rubric|hallucination|baseline)\b/i,
      en: "AI Evals, Baselines & LLM-as-a-Judge",
      ar: "التقييم المنهجي (Evals) وخط الأساس والتحكيم بنموذج لغة",
      def: [
        "Unlike unit tests where output is deterministic, AI Evals measure quality across a representative dataset of normal, edge, and adversarial cases. You combine 3 graders: deterministic code checks (valid JSON, regex), human review, and LLM-as-a-Judge calibrated against human labels using clear Rubrics.",
        "لأن ردود النماذج احتمالية لا ثابتة، تقيس التقييمات (Evals) الجودة على مجموعة حالات واقعية وصعبة. نجمع فيها 3 طرق: فحوص كود حتمية (مثل صحة JSON)، ومراجعة بشرية، ونموذج حكم (LLM-as-a-Judge) معاير بمعايير واضحة (Rubrics) ومقارن بدرجة الأساس (Baseline)."
      ],
      ex: [
        "Never ship a prompt edit until your eval score improves on 50–100 real test cases without regressions.",
        "لا تطلق تعديلًا على الـ Prompt قبل أن يثبت تفوقه رقميًا على 50–100 حالة اختبار حقيقية."
      ]
    },
    {
      rx: /\b(guardrail|prompt injection|owasp|sandbox|e2b|trifecta|pii)\b/i,
      en: "Guardrails, Prompt Injection & Secure Sandboxes",
      ar: "حواجز الأمان (Guardrails) وحقن الأوامر والبيئات المعزولة",
      def: [
        "Prompt Injection tricks an LLM into ignoring its system instructions via untrusted user input or retrieved docs. Simon Willison's 'Lethal Trifecta' warns against combining: (1) private data access, (2) untrusted content, and (3) external actions. Guardrails validate inputs/outputs, redact PII, and run AI-generated code inside isolated microVM Sandboxes (e.g., E2B).",
        "حقن الأوامر (Prompt Injection) هو خداع النموذج عبر نص خبيث لتجاوز تعليماته. ويحذّر الباحثون من «الثالوث القاتل»: جمع الوصول لبيانات خاصة + قراءة محتوى غير موثوق + صلاحية تنفيذ أفعال خارجية. لذلك نستخدم حواجز أمان لفحص المدخلات وحجب البيانات الشخصية (PII) وتشغيل أي كود يولده النموذج داخل بيئة معزولة (Sandbox)."
      ],
      ex: [
        "Never run LLM-generated Python with exec() on your production server; use an ephemeral sandbox container.",
        "لا تشغّل كود Python مولّدًا من النموذج مباشرة على خادمك؛ شغّله دائمًا في حاوية معزولة مؤقتة."
      ]
    },
    {
      rx: /\b(latency|ttft|gateway|litellm|vllm|kv cache|pagedattention|quantization)\b/i,
      en: "TTFT, AI Gateways, vLLM & PagedAttention",
      ar: "زمن الاستجابة (TTFT) وبوابات الذكاء الاصطناعي وخدمة vLLM",
      def: [
        "TTFT (Time To First Token) is how fast the user sees the first word (target < 1s via streaming). AI Gateways (e.g., LiteLLM) unify providers with automatic fallbacks on 429/5xx errors, caching, and spend caps. For self-hosting, vLLM uses PagedAttention and continuous batching to serve open-weight models at 10–24× higher throughput.",
        "مقياس TTFT هو الزمن حتى ظهور أول كلمة للمستخدم (ويجب أن يقل عن ثانية عبر البث Streaming). بوابات الذكاء الاصطناعي (مثل LiteLLM) توحّد المزودين وتبدّل تلقائيًا عند الأعطال وتضبط الميزانية. وعند الاستضافة الذاتية، يضاعف محرك vLLM (عبر تقنية PagedAttention) سرعة وسعة المعالجة عدة أضعاف."
      ],
      ex: [
        "If OpenAI returns 429 Rate Limit, an AI Gateway automatically routes the request to Anthropic or Vertex AI in milliseconds.",
        "إذا تعرّض مزود لعطل أو حد معدل 429، تحوّل البوابة الطلب تلقائيًا لمزود بديل دون توقف الخدمة."
      ]
    },
    {
      rx: /\b(reasoning|thinking|system 1|system 2|test-time compute)\b/i,
      en: "Reasoning Models & Test-Time Compute",
      ar: "نماذج التفكير المعمّق والحوسبة وقت الاختبار",
      def: [
        "Standard LLMs answer immediately (System 1). Reasoning models (o1/o3, Claude Extended Thinking, Gemini Thinking) spend extra compute at inference time generating internal reasoning tokens to verify logic, catch bugs, and explore branches before answering (System 2).",
        "النماذج السريعة تجيب فورًا (النظام 1)، أما نماذج التفكير المعمّق فتأخذ وقتًا إضافيًا لحظة الاستدلال لتوليد خطوات تفكير داخلية، ومراجعة منطقها، واكتشاف الأخطاء قبل صياغة الإجابة النهائية (النظام 2) — مع ضبط ميزانية التفكير (thinking budget)."
      ],
      ex: [
        "Use reasoning models for complex architecture, math, and debugging; use fast models for routing, tagging, and chat.",
        "خصّص نماذج التفكير للهندسة المعقدة وتصحيح الأكواد، والنماذج السريعة للتصنيف والدردشة."
      ]
    },
    {
      rx: /\b(rules|agents\.md|claude\.md|gemini\.md|cursorignore|context rot)\b/i,
      en: "AI Coding Rules & Context Rot",
      ar: "قواعد البرمجة بالـ AI (Rules) وتآكل السياق (Context Rot)",
      def: [
        "Rules files (GEMINI.md, CLAUDE.md, AGENTS.md, .cursor/rules) persist your build commands, architecture boundaries, and forbidden patterns across every AI coding session. Context Rot occurs when a long chat accumulates stale files and failed attempts, causing accuracy to drop—solved by keeping rules concise (<200 lines) and resetting or compacting sessions per task.",
        "ملفات القواعد (مثل GEMINI.md وCLAUDE.md وAGENTS.md) تحفظ أوامر البناء والاختبار وحدود المعمارية والأنماط الممنوعة لتُحقن تلقائيًا في كل جلسة برمجة. أما تآكل السياق (Context Rot) فيحدث حين تتراكم الملفات القديمة والمحاولات الفاشلة في محادثة طويلة فتتراجع الدقة؛ وعلاجه إيجاز القواعد وتنظيف الجلسة لكل مهمة."
      ],
      ex: [
        "Keep root AGENTS.md under ~150 lines; move specialized procedures into Skills and use `.cursorignore` to exclude `node_modules/`.",
        "اجعل ملف AGENTS.md أقل من ~150 سطرًا، وانقل الإجراءات المتخصصة إلى Skills واستبعد المجلدات الضخمة."
      ]
    },
    {
      rx: /\b(skill|skills|skill\.md|progressive disclosure|hook|hooks|slash command)\b/i,
      en: "Agent Skills (SKILL.md), Progressive Disclosure & Hooks",
      ar: "مهارات الوكيل (Skills) والكشف التدريجي والـ Hooks",
      def: [
        "Agent Skills package specialized multi-step playbooks inside a folder with `SKILL.md` plus optional `scripts/` and `references/`. Using Progressive Disclosure, the agent only sees a short 1-line description at startup and loads the full skill only when relevant—saving tokens. Hooks are deterministic shell scripts triggered automatically on tool events (e.g., auto-linting after every edit or blocking `.env` access).",
        "مهارات الوكيل (Skills) تجمّع كتيّبات خبرة متخصصة في مجلد يحتوي `SKILL.md` وسكربتات ومراجع اختيارية. وبفضل الكشف التدريجي (Progressive Disclosure) لا يرى الوكيل إلا وصفًا قصيرًا في البداية ولا يحمّل المهارة كاملة إلا عند تطابق المهمة. أما الـ Hooks فسكربتات حتمية تعمل تلقائيًا عند أحداث الأدوات (مثل التنسيق التلقائي أو منع تعديل `.env`)."
      ],
      ex: [
        "Always-on law → Rule; On-demand workflow playbook → Skill; 100% enforced check → Hook.",
        "قانون دائم ← Rule؛ كتيّب عمل عند الحاجة ← Skill؛ فحص حتمي 100% ← Hook."
      ]
    },
    {
      rx: /\b(worktree|worktrees|subagent|subagents|slop|slopsquatting|vibe coding|tdd)\b/i,
      en: "Subagents, Git Worktrees, AI-TDD & Avoiding AI Slop",
      ar: "الوكلاء الفرعيون وGit Worktrees وTDD وتجنّب AI Slop",
      def: [
        "Subagents run isolated tasks (like codebase research or fresh-eyes code review) without polluting your main context window. Git Worktrees create separate working folders for different branches so parallel coding agents never overwrite each other's files. AI-TDD gives the agent failing tests first as a concrete verification loop, preventing 'AI Slop' (unreviewed bloat, duplicated code, or hallucinated packages).",
        "الوكلاء الفرعيون (Subagents) ينفّذون مهام معزولة (كالبحث أو مراجعة الكود) دون تلويث سياقك الرئيسي. وGit Worktrees تنشئ مجلدات عمل مستقلة لفروع مختلفة ليعمل أكثر من وكيل بالتوازي بلا تعارض. أما AI-TDD فيزوّد الوكيل باختبارات فاشلة أولًا كحلقة تحقق تمنع «الكود العشوائي» (AI Slop)."
      ],
      ex: [
        "Use `git worktree add ../feat-a feat/a` to run Agent A on feature A while Agent B works on feature B.",
        "استخدم `git worktree add` لتشغيل وكيلين على ميزتين مختلفتين بالتوازي بأمان تام."
      ]
    },
    {
      rx: /\b(harness|long-running|generator|evaluator|durable execution|temporal|idempotency)\b/i,
      en: "Agent Harness, Long-Running Agents & Durable Execution",
      ar: "هندسة الـ Harness والوكلاء طويلو التشغيل والتنفيذ الدائم",
      def: [
        "An Agent Harness is all the engineering scaffolding around a foundation model (loop, tools, context compaction, durable state, hooks, and independent verifiers): Agent = Model + Harness. Long-running agents survive context resets via durable Git commits and structured progress files, while Durable Execution (Temporal, Restate, LangGraph) journals every step so crashes or hours-long waits resume cleanly without duplicate side effects.",
        "الـ Agent Harness هو كل البنية الهندسية المحيطة بالنموذج (الحلقة، الأدوات، ضغط السياق، الحالة الدائمة، الـ Hooks، والمدقّقات المستقلة): الوكيل = النموذج + الـ Harness. والوكلاء طويلو التشغيل يتجاوزون حدود السياق عبر حفظ التقدم في Git وملفات حالة مهيكلة، بينما يحفظ التنفيذ الدائم نتيجة كل خطوة للاستئناف بعد أي عطل دون تكرار."
      ],
      ex: [
        "Upgrading the harness (better tools + independent evaluator + verifier loop) often boosts accuracy more than swapping to a larger model.",
        "تحسين الـ Harness (أدوات أوضح + مُقيِّم مستقل + حلقة تحقق) يرفع الدقة غالبًا أكثر من تبديل النموذج لأكبر منه."
      ]
    },
    {
      rx: /\b(portainer|devcontainer|docker|kubernetes|kubeconfig|gitops|emergency halt|kill switch|non-human identity)\b/i,
      en: "Portainer, Devcontainers & GitOps AI Governance",
      ar: "Portainer والحاويات وحوكمة وكلاء البنية التحتية (GitOps)",
      def: [
        "Containers and Devcontainers isolate autonomous agents from your host OS and secrets. Portainer manages self-hosted AI stacks (vLLM, Ollama, pgvector, Langfuse) and, via Portainer-Command, governs AI agent access to Kubernetes through read-only MCP gateways, GitOps Pull Requests (zero direct write paths), short-lived non-human identities, and fleet-wide Emergency Halt kill switches.",
        "الحاويات وDevcontainers تعزل الوكلاء المستقلين عن نظامك وأسرارك. ويُدير Portainer حزم الذكاء الاصطناعي المستضافة ذاتيًا، كما يوفّر عبر Portainer-Command بوابة MCP محكومة لـ Kubernetes بصلاحية قراءة فقط، وتحويل أي تعديل مقترح إلى Pull Request عبر GitOps، مع زر إيقاف طارئ (Emergency Halt) للأسطول بالكامل."
      ],
      ex: [
        "Agent inspects crashing pods via Read-Only Portainer MCP → opens Git PR #412 → CI + human approve → ArgoCD deploys safely.",
        "يفحص الوكيل الحاوية المتعطلة عبر MCP للقراءة فقط ← يفتح Pull Request ← يوافق المهندس ← ينشر GitOps بأمان."
      ]
    },
    {
      rx: /\b(a2a|agent card|ag-ui|generative ui|rlvr|dspy|mipro|reward hacking)\b/i,
      en: "A2A, AG-UI, RLVR & DSPy",
      ar: "بروتوكولات A2A وAG-UI وتقنيات RLVR وDSPy",
      def: [
        "A2A (Agent-to-Agent) lets independent agents discover each other via Agent Cards and delegate tasks across frameworks. AG-UI streams typed events, shared state, and interactive Generative UI widgets between agents and frontends. RLVR trains reasoning models using objective programmatic verifiers (unit tests, math checks), and DSPy programmatically compiles optimal prompts and few-shot examples against an eval metric.",
        "بروتوكول A2A يتيح تواصل وتفويض المهام بين وكلاء مستقلين عبر بطاقات Agent Cards، وAG-UI يبث أحداثًا وواجهات تفاعلية حيّة بين الوكيل والتطبيق. أما RLVR فيدرّب نماذج التفكير بمكافآت قابلة للتحقق الموضوعي (كالاختبارات)، ويحوّل DSPy هندسة الأوامر إلى كود يُحسَّن تلقائيًا بالبيانات."
      ],
      ex: [
        "MCP = Agent ↔ Tools; A2A = Agent ↔ Agent; AG-UI = Agent ↔ User Interface.",
        "MCP لربط الوكيل بالأدوات، وA2A لربط الوكيل بوكيل آخر، وAG-UI لربط الوكيل بواجهة المستخدم."
      ]
    },
    {
      rx: /\b(codeact|plan-and-execute|reflexion|tree-of-thoughts|best-of-n|re-plan|replanner)\b/i,
      en: "Cognitive Architectures: Plan-and-Execute, Reflexion, CodeAct & ToT",
      ar: "معماريات التفكير الوكيلي: Plan-and-Execute وReflexion وCodeAct وToT",
      def: [
        "Plan-and-Execute separates high-level planning (strong model) from fast parallel step execution and dynamic re-planning. Reflexion stores concise verbal lessons from objective failures to improve the next attempt. CodeAct replaces rigid 1-per-turn JSON tool calls with sandboxed Python scripts that compose loops, filters, and multiple tools in one turn. Best-of-N and Tree-of-Thoughts explore multiple branches and pick the verifier's top-scoring path.",
        "يفصل Plan-and-Execute التخطيط الاستراتيجي (نموذج قوي) عن التنفيذ السريع والمتوازي مع إعادة تخطيط ديناميكية. ويحفظ Reflexion دروسًا لفظية من أخطاء موضوعية لتحسين المحاولة التالية. أما CodeAct فيستبدل استدعاءات JSON الجامدة بكتابة وتنفيذ كود Python معزول يركّب الحلقات والأدوات في جولة واحدة، بينما تستكشف Best-of-N وToT عدة مسارات وتختار الأعلى لدى المدقّق."
      ],
      ex: [
        "CodeAct filters 50,000 API rows in sandbox RAM and prints 5 summary lines — saving 99% of context tokens.",
        "يصفي CodeAct 50,000 سجل داخل الـ Sandbox ويطبع 5 أسطر ملخصة فقط — فيوفّر 99% من سياق النموذج."
      ]
    },
    {
      rx: /\b(working memory|episodic|semantic memory|procedural memory|coala|mem0|consolidation)\b/i,
      en: "The 4 Types of Agentic Memory (CoALA Framework)",
      ar: "أنواع الذاكرة الوكيلية الأربعة (إطار CoALA)",
      def: [
        "Working Memory is the live context window & scratchpad; Episodic Memory stores past experiences and failure/success trajectories; Semantic Memory holds structured facts about users and domains (updated via ADD/UPDATE/DELETE conflict resolution); Procedural Memory captures reusable rules, skills, and playbooks refined over time.",
        "الذاكرة العاملة هي نافذة السياق الحالية؛ والعرضية (Episodic) تحفظ تجارب وأخطاء الماضي؛ والدلالية (Semantic) تحفظ حقائق منظّمة عن المستخدمين والمشاريع مع حل التعارضات؛ والإجرائية (Procedural) تحفظ القواعد والمهارات القابلة لإعادة الاستخدام."
      ],
      ex: [
        "Extract & consolidate Semantic/Episodic memories asynchronously AFTER replying so chat latency stays zero.",
        "استخلص وادمج الذاكرة الدلالية والعرضية في الخلفية بعد الرد حتى لا تزيد زمن انتظار المستخدم."
      ]
    },
    {
      rx: /\b(topology|supervisor|swarm|handoff|handoffs|blackboard|ping-pong|aci|computer use|accessibility tree)\b/i,
      en: "Multi-Agent Topologies, Handoffs, ACI & Computer Use",
      ar: "طوبولوجيات تعدد الوكلاء والتسليم (Handoffs) وواجهة ACI واستخدام الحاسوب",
      def: [
        "Multi-agent systems organize via Supervisor, Hierarchical, Swarm/Handoffs, or Blackboard/Event-Driven patterns — relying on typed Handoff Contracts and Context Isolation to avoid the 'telephone game'. ACI (Agent-Computer Interface) designs tool schemas and self-healing errors specifically for LLMs, while Computer Use bridges legacy UIs via Accessibility Trees/DOM and screenshots inside ephemeral sandboxes.",
        "تُنظَّم الأنظمة متعددة الوكلاء عبر المشرف أو الهرمي أو السرب/التسليم أو السبورة، وتعتمد على عقود تسليم مهيكلة وعزل السياق. أما ACI فهي تصميم الأدوات ورسائل الخطأ لتناسب تفكير النماذج، بينما يتيح Computer Use التحكم في الواجهات عبر شجرة DOM ولقطات الشاشة داخل بيئة معزولة."
      ],
      ex: [
        "Priority order: API/MCP first → Browser DOM/Accessibility Tree second → OS Pixel clicking last.",
        "ترتيب الأولوية: API/MCP أولًا ← تحكم DOM/Accessibility ثانيًا ← النقر بالبكسل كخيار أخير."
      ]
    },
    {
      rx: /\b(pass\^k|pass@k|trajectory|goal drift|failure modes|tau-bench|τ-bench)\b/i,
      en: "Trajectory Evals, pass@k vs. pass^k & Goal Drift",
      ar: "تقييم المسار (Trajectory) ومقياس pass@k مقابل pass^k وانحراف الهدف",
      def: [
        "Trajectory Evaluation grades both the agent's final environment state AND the sequence of tools/steps it took. pass@k measures whether an agent succeeded at least once in k attempts (optimistic), while pass^k (from τ-bench) measures whether it succeeded on ALL k independent trials — exposing hidden inconsistency before production.",
        "تقييم المسار يفحص الحالة النهائية الفعلية للبيئة بالإضافة لسلسلة الأدوات والخطوات. ويقيس pass@k النجاح مرة واحدة على الأقل من k محاولات، بينما يقيس pass^k النجاح في كل المحاولات الـ k بلا استثناء — وهو المقياس الحقيقي للثبات الإنتاجي."
      ],
      ex: [
        "At 80% per-run accuracy, pass@5 is 99.97% (looks great), but pass^5 is only 32.8% (unreliable in production!).",
        "عند دقة 80% للمحاولة، يبلغ pass@5 نسبة 99.97% (مخادع)، بينما pass^5 لا يتجاوز 32.8% فقط!"
      ]
    }
  ];

  // 2. Module-Level Deep Technical Explanations & Authoritative Company/Research Sources
  const MOD_DEEP = {
    C1: {
      how: [
        "Under the hood, a foundation model is a neural network (usually a Transformer) whose billions of floating-point weights were compressed from internet-scale text via next-token prediction. At inference time, your prompt is converted into token IDs, passed through dozens of attention and feed-forward layers on GPUs/TPUs, and produces a probability distribution over the entire vocabulary for the next token. Because the weights are frozen after training, every API call is 100% stateless.",
        "من الناحية الهندسية العميقة، النموذج الأساسي هو شبكة عصبية (غالبًا Transformer) اختُزلت معرفتها في مليارات الأرقام العائمة (الأوزان) عبر التنبؤ بالكلمة التالية على تريليونات الكلمات. عند الاستدلال (Inference)، يتحوّل سؤالك إلى أرقام Tokens، ويمر عبر عشرات طبقات الانتباه (Attention) على معالجات GPU/TPU، لينتج توزيعًا احتماليًا لاختيار الكلمة التالية. وبما أن الأوزان ثابتة لا تتغير أثناء الاستخدام، فإن كل طلب API مستقل تمامًا ولا يتذكر ما قبله ما لم ترسل السجل."
      ],
      metrics: [
        "Rule of thumb: 90% of AI products succeed with Prompting + RAG on frontier APIs before ever needing custom fine-tuning.",
        "قاعدة هندسية: 90% من منتجات الذكاء الاصطناعي تنجح بهندسة الأوامر + RAG عبر APIs جاهزة قبل الحاجة لأي تدريب خاص."
      ],
      sources: [
        { org: "Andrej Karpathy", title: "Intro to Large Language Models (1-hour deep dive)", url: "https://www.youtube.com/watch?v=zjkBMFhNj_g", insight: ["Explains weights, pre-training vs fine-tuning, and the LLM OS analogy.", "يشرح الأوزان، التدريب المسبق مقابل الضبط الدقيق، ومفهوم النموذج كنظام تشغيل."] },
        { org: "Hugging Face", title: "LLM Course — How Transformers Work", url: "https://huggingface.co/learn/llm-course", insight: ["Interactive guide to architectures, tokenizers, and model families.", "دليل تفاعلي لمعمارية المحوّلات ومقطّعات النصوص وأنواع النماذج."] }
      ]
    },
    C2: {
      how: [
        "Every LLM generates text one token at a time (autoregressively). The tokenizer breaks your text into sub-word units—meaning non-English scripts like Arabic often consume 1.5–2× more tokens per sentence. Then, sampling parameters (Temperature, Top-p) decide whether the model strictly picks the top-scoring token (Temperature ≈ 0) or explores lower-probability creative options. Because this process optimizes plausibility rather than truth verification, hallucinations occur whenever the prompt lacks grounded facts.",
        "يولّد النموذج النص كلمةً بعد كلمة (Autoregressive). أولًا يقطّع النص إلى Tokens (والعربية تستهلك عادةً 1.5 إلى ضعف عدد الـ Tokens مقارنة بالإنجليزية). بعدها تحدد معاملات Sampling مثل Temperature وTop-p هل يلتزم النموذج بأكثر كلمة متوقعة (Temperature ≈ 0) أم يختار بدائل إبداعية. ولأن النموذج يتوقع «النص الأكثر منطقية» لا «الحقيقة المؤكدة»، تحدث الهلوسة إذا لم نزوّده بحقائق ومصادر واضحة في السياق."
      ],
      metrics: [
        "Output tokens typically cost 3–5× more than input tokens and dominate latency (40–100 tokens/sec).",
        "تكلفة الـ Tokens المولّدة (Output) أعلى بـ 3 إلى 5 أضعاف من المدخلات، وهي العامل الأكبر في زمن الانتظار."
      ],
      sources: [
        { org: "Google / Vaswani et al.", title: "Attention Is All You Need (Transformer Paper)", url: "https://arxiv.org/abs/1706.03762", insight: ["The foundational paper introducing Self-Attention behind all modern LLMs.", "الورقة البحثية المؤسِّسة لآلية الانتباه الذاتي التي تقوم عليها كل النماذج الحديثة."] },
        { org: "Anthropic", title: "Extended Thinking & Reasoning Models", url: "https://docs.claude.com/en/docs/build-with-claude/extended-thinking", insight: ["How test-time compute and thinking budgets boost complex reasoning.", "كيف ترفع الحوسبة وقت الاختبار وميزانية التفكير دقة المهام المعقدة."] }
      ]
    },
    C3: {
      how: [
        "Production RAG is a two-stage pipeline: (1) Offline Indexing cleans documents, splits them into semantic chunks with metadata (doc ID, section, tenant_id), and stores both dense vectors and BM25 keyword indexes. (2) Online Retrieval runs hybrid search (vector + keyword), merges results, applies a Cross-Encoder Reranker to pick the top 3–5 chunks, and injects them into the prompt with strict citation instructions.",
        "نظام RAG الإنتاجي يتكوّن من مسارين: (1) فهرسة مسبقة تنظّف المستندات وتقسّمها لمقاطع مترابطة مع بيانات وصفية (مثل رقم القسم وtenant_id) وتخزنها في فهرس متجهي وفهرس كلمات مفتاحية. (2) استرجاع لحظي يجمع البحث الدلالي واللفظي (Hybrid Search)، ثم يعيد ترتيب النتائج بـ Reranker لاختيار أدق 3–5 فقرات تُحقن في الأمر مع إلزام النموذج بالاستناد إليها وذكر المصدر."
      ],
      metrics: [
        "Anthropic's Contextual Retrieval reduces failed retrievals by 49% (and 67% when combined with Reranking).",
        "تقنية Contextual Retrieval من Anthropic خفضت أخطاء الاسترجاع بنسبة 49%، ووصلت إلى 67% مع إضافة Reranking."
      ],
      sources: [
        { org: "Anthropic Engineering", title: "Introducing Contextual Retrieval", url: "https://www.anthropic.com/news/contextual-retrieval", insight: ["Prepending chunk-level context before embedding dramatically cuts retrieval errors.", "إضافة سياق مختصر لكل مقطع قبل التضمين يقلل أخطاء الاسترجاع بشكل هائل."] },
        { org: "Microsoft Research", title: "GraphRAG: Knowledge Graphs + RAG", url: "https://microsoft.github.io/graphrag/", insight: ["Solves global corpus questions that standard vector similarity misses.", "يحل أسئلة الربط الشامل عبر آلاف المستندات التي يعجز عنها البحث المتجهي التقليدي."] }
      ]
    },
    C4: {
      how: [
        "An AI Agent wraps an LLM inside a `while` loop with state, tools, and stop conditions. On each turn, the model inspects the goal and past observations, decides whether to emit a `tool_use` call or a final answer, and your runtime validates the arguments, executes the tool safely, and appends `tool_result` back into context. Production agents enforce max-step budgets, token caps, and human approval gates before irreversible writes.",
        "الوكيل الذكي هو نموذج لغة داخل حلقة تكرارية (`while`) مزوّد بذاكرة وأدوات وحدود توقف. في كل دورة، يقيّم النموذج الهدف والنتائج السابقة ثم يقرر: إما طلب تنفيذ أداة (`tool_use`) أو تقديم الإجابة النهائية. تطبيقك يتحقق من المدخلات وينفّذ الأداة ويعيد النتيجة (`tool_result`). في الإنتاج، يجب فرض حد أقصى للخطوات وموافقات بشرية قبل أي إجراء خطير."
      ],
      metrics: [
        "Always cap agent loops (e.g., max_steps = 10–15) and log every tool call + latency for trace debugging.",
        "حدّد دائمًا سقفًا لعدد خطوات الوكيل (مثل 10–15 خطوة) وسجّل كل استدعاء أداة لتسهيل تتبع الأخطاء."
      ],
      sources: [
        { org: "Anthropic Engineering", title: "Building Effective Agents", url: "https://www.anthropic.com/engineering/building-effective-agents", insight: ["The industry bible on choosing simple workflows over unnecessary agent loops.", "المرجع الأهم في الصناعة للتمييز بين سير العمل البسيط والوكلاء المستقلين."] },
        { org: "Lilian Weng (OpenAI)", title: "LLM Powered Autonomous Agents", url: "https://lilianweng.github.io/posts/2023-06-23-agent/", insight: ["Breaks down agent architecture into Planning, Memory, and Tool Use.", "يحلل بنية الوكلاء إلى ثلاثة أركان: التخطيط، الذاكرة، واستخدام الأدوات."] }
      ]
    },
    M1: {
      how: [
        "Shipping AI features requires treating probabilistic outputs like unreliable network calls: HTTP 200 does not guarantee correctness. AI Engineers own the entire application loop—picking the right autonomy level (Feature → Workflow → Agent), designing structured schemas, building eval datasets, tracking token cost per user, and handling rate limits (429) and truncated responses.",
        "بناء منتجات الذكاء الاصطناعي يعني التعامل مع مخرجات النماذج كأنها استدعاءات شبكة غير مضمونة: نجاح الاتصال (HTTP 200) لا يعني صحة الإجابة. مهندس الذكاء الاصطناعي يدير دورة الحياة كاملة: اختيار مستوى الاستقلالية الأنسب، فرض المخرجات المهيكلة، بناء اختبارات التقييم (Evals)، مراقبة التكلفة، ومعالجة حدود المعدل والانقطاعات."
      ],
      metrics: [
        "Start on the lowest autonomy rung: Single Call → Workflow → Autonomous Agent.",
        "ابدأ دائمًا بأبسط مستوى: استدعاء واحد ← سير عمل محدد ← وكيل مستقل عند الضرورة فقط."
      ],
      sources: [
        { org: "Anthropic Engineering", title: "Building Effective Agents", url: "https://www.anthropic.com/engineering/building-effective-agents", insight: ["Start simple, measure, and only add agentic complexity when accuracy demands it.", "ابدأ بالحل الأبسط وقِس النتائج قبل إضافة أي تعقيد وكيلي."] }
      ]
    },
    M2: {
      how: [
        "Integrating a Model API cleanly separates untrusted model text from deterministic application code. You use Streaming (SSE) to lower perceived latency (TTFT < 1s), enforce JSON Schema / Structured Outputs at decoding time, validate at runtime with Zod or Pydantic, and handle tool calls by validating parameters before touching any database or external API.",
        "التكامل الاحترافي مع Model API يفصل بين نص النموذج الاحتمالي وكود التطبيق الحتمي. نستخدم البث المتدفق (Streaming) لتقليل زمن ظهور أول كلمة، ونفرض مخطط JSON (Structured Outputs) مع التحقق وقت التشغيل عبر Zod أو Pydantic، ونفحص معاملات أي أداة قبل تنفيذها على قاعدة البيانات."
      ],
      metrics: [
        "Target Time-To-First-Token (TTFT) < 800ms with streaming; retry schema failures at most 1–2 times with error feedback.",
        "استهدف ظهور أول كلمة خلال أقل من 800 مللي ثانية بالبث، وأعد المحاولة مع رسالة الخطأ مرة أو مرتين فقط عند فشل المخطط."
      ],
      sources: [
        { org: "OpenAI Platform Docs", title: "Structured Outputs & Function Calling Guide", url: "https://platform.openai.com/docs/guides/structured-outputs", insight: ["How constrained decoding guarantees 100% JSON Schema adherence.", "كيف يضمن فك التشفير المقيّد التزامًا كاملًا بمخطط JSON."] },
        { org: "Anthropic Docs", title: "Tool Use & Streaming Best Practices", url: "https://docs.claude.com/en/docs/build-with-claude/tool-use/overview", insight: ["Clear schemas, parallel tool calls, and explicit error returns.", "تصميم مخططات أدوات واضحة والتعامل مع الاستدعاءات المتوازية والأخطاء."] }
      ]
    },
    M3: {
      how: [
        "Prompt & Context Engineering is iterative software engineering: you define quantitative success criteria first, structure prompts with clear delimiters (like XML tags `<policy>`, `<context>`) and few-shot examples, curate only high-signal context (avoiding the 'lost in the middle' effect), and version-control every prompt change against an eval suite.",
        "هندسة الأوامر والسياق هي هندسة برمجيات دقيقة: تبدأ بتحديد معايير نجاح رقمية، ثم تنظيم الأمر بوسوم واضحة وأمثلة (Few-shot)، وتنقية السياق من الضوضاء لتجنب تشتت النموذج في منتصف النصوص الطويلة، مع حفظ إصدارات الأوامر ومقارنتها على مجموعة اختبار ثابتة."
      ],
      metrics: [
        "Place static instructions & docs first to maximize Prompt Caching (up to 90% cost reduction).",
        "رتّب التعليمات والمستندات الثابتة في أول الأمر لتفعيل Prompt Caching وتوفير حتى 90% من تكلفة المدخلات."
      ],
      sources: [
        { org: "Anthropic Engineering", title: "Effective Context Engineering for AI Agents", url: "https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents", insight: ["Goal: the smallest possible set of high-signal tokens that maximizes outcome.", "الهدف: أصغر مجموعة من الـ Tokens عالية القيمة تحقق أعلى دقة ممكنة."] },
        { org: "Anthropic Docs", title: "Prompt Engineering Overview", url: "https://docs.claude.com/en/docs/build-with-claude/prompt-engineering/overview", insight: ["Be clear & direct, use XML tags, few-shot examples, and explicit fallbacks.", "الوضوح المباشر، استخدام وسوم XML، الأمثلة المحددة، وخطط التراجع."] }
      ]
    },
    M4: {
      how: [
        "Frameworks (LangChain, LlamaIndex, Vercel AI SDK) standardize provider interfaces, message formats, and tracing. However, abstractions can hide token usage, prompt formatting, and retry logic. Senior AI engineers use frameworks where ecosystem integrations (loaders, vector stores, LangSmith/Langfuse tracing) save weeks—and drop down to raw provider SDKs when tight control over latency or caching is critical.",
        "أُطر العمل (مثل LangChain وLlamaIndex) توحّد واجهات المزودين وتوفّر أدوات التتبع والتحميل الجاهزة، لكنها قد تخفي تفاصيل دقيقة مثل صياغة الأمر أو استهلاك الـ Tokens أو منطق إعادة المحاولة. المهندس الخبير يستخدمها لتسريع التطوير والربط، ويعود للـ SDK المباشر عندما يحتاج تحكمًا دقيقًا في الكاش وزمن الاستجابة."
      ],
      metrics: [
        "Always enable tracing (LangSmith / Langfuse / OpenTelemetry) from day 1 so no prompt is a black box.",
        "فعّل التتبع (Tracing) من اليوم الأول حتى لا تبقى استدعاءات النماذج صندوقًا أسود."
      ],
      sources: [
        { org: "LangChain Docs", title: "LangChain Architecture & Tracing", url: "https://docs.langchain.com", insight: ["Standardized runnable chains, structured outputs, and observability.", "سلاسل قابلة للتركيب، مخرجات مهيكلة، ومراقبة تفصيلية للتنفيذ."] }
      ]
    },
    M5: {
      how: [
        "Semantic search encodes text into dense vectors stored in specialized indexes (HNSW / IVFFlat in pgvector, Qdrant, Pinecone). Because pure vector search struggles with exact product SKUs, error codes, or names, production systems combine it with BM25 lexical search (Hybrid Search), enforce SQL row-level `tenant_id` filters before scoring, and rerank the top candidates.",
        "البحث الدلالي يحوّل النصوص لمتجهات داخل فهارس سريعة (مثل HNSW في pgvector). ولأن البحث المتجهي وحده قد يخطئ في الأكواد والأسماء الدقيقة، تدمج أنظمة الإنتاج بينه وبين البحث اللفظي BM25 (بحث هجين)، مع فرض تصفية `tenant_id` قبل الترتيب لمنع تسرب بيانات العملاء، ثم إعادة الترتيب بـ Reranker."
      ],
      metrics: [
        "Hybrid Search + Reranking + Metadata Filtering is the production baseline for enterprise RAG.",
        "البحث الهجين + إعادة الترتيب + تصفية الصلاحيات هي المعيار الإنتاجي الأساسي لأنظمة RAG."
      ],
      sources: [
        { org: "pgvector", title: "Vector Similarity Search for PostgreSQL", url: "https://github.com/pgvector/pgvector", insight: ["Keep relational ACLs (tenant_id) and vector search in a single ACID database.", "الجمع بين صلاحيات SQL الصارمة والبحث المتجهي في قاعدة بيانات واحدة."] }
      ]
    },
    M6: {
      how: [
        "Building reliable agents requires three pillars: (1) Well-documented tools with strict schemas and safe error messages (Anthropic's Agent-Computer Interface), (2) Durable state persistence via Checkpointers (LangGraph) so crashes or multi-hour pauses resume seamlessly, and (3) Human-in-the-loop interrupts before destructive actions like payments, deletions, or external emails.",
        "بناء وكلاء موثوقين يقوم على ثلاث ركائز: (1) تصميم أدوات واضحة الوصف والمخطط تعيد أخطاء مفهومة للنموذج، (2) حفظ الحالة الدائم عبر Checkpointers (مثل LangGraph) لاستئناف العمل عند أي انقطاع، (3) نقاط توقف لموافقة الإنسان (Human-in-the-loop) قبل أي فعل لا يمكن التراجع عنه."
      ],
      metrics: [
        "Spend as much time engineering tool descriptions & error messages as you spend on the system prompt.",
        "اهتم بصياغة وصف الأدوات ورسائل أخطائها بقدر اهتمامك بصياغة الـ System Prompt نفسه."
      ],
      sources: [
        { org: "Anthropic Engineering", title: "Writing Effective Tools for Agents", url: "https://www.anthropic.com/engineering/writing-tools-for-agents", insight: ["Design tools for the agent's context budget: concise outputs, clear parameter names.", "صمّم الأدوات بما يناسب ميزانية سياق الوكيل: مخرجات مركزة وأسماء معاملات واضحة."] },
        { org: "LangGraph Docs", title: "Persistence & Human-in-the-Loop", url: "https://docs.langchain.com/oss/python/langgraph/persistence", insight: ["Thread-level checkpoints and interrupt() for safe production approvals.", "حفظ الحالة على مستوى الجلسة ونقاط التوقف الآمنة لموافقات الإنتاج."] }
      ]
    },
    M7: {
      how: [
        "Evaluation-Driven Development replaces guesswork with numbers. Start with error analysis on 50–100 real traces, write deterministic code assertions for format/schema/citations, and build an LLM-as-a-Judge calibrated against human labels (measuring Cohen's kappa / agreement). Run evals in CI before every prompt or model upgrade.",
        "التطوير المبني على التقييم (Eval-Driven Development) يستبدل التخمين بالأرقام. ابدأ بتحليل أخطاء 50–100 عينة حقيقية، ثم أضف فحوص كود حتمية للصيغة والمصادر، وابنِ نموذج حكم (LLM-as-a-Judge) معايرًا مع التقييم البشري، وشغّل التقييمات تلقائيًا قبل أي تحديث للأوامر أو النماذج."
      ],
      metrics: [
        "Every AI bug you fix should become a permanent regression test case in your eval dataset.",
        "كل خطأ تكتشفه في الإنتاج يجب أن يتحوّل إلى حالة اختبار دائمة في مجموعة التقييم."
      ],
      sources: [
        { org: "Hamel Husain", title: "Your AI Product Needs Evals (FAQ & LLM-as-a-Judge)", url: "https://hamel.dev/blog/posts/evals-faq/", insight: ["Practical guide to error analysis, binary pass/fail judges, and avoiding vanity metrics.", "دليل عملي لتحليل الأخطاء وبناء محكمين ثنائيين وتجنب المقاييس الوهمية."] },
        { org: "Anthropic Engineering", title: "Demystifying Evals for AI Agents", url: "https://www.anthropic.com/engineering/demystifying-evals-for-ai-agents", insight: ["How to grade multi-step trajectories, tool choices, and final outcomes.", "كيف تقيّم مسار خطوات الوكيل واختياره للأدوات والنتيجة النهائية."] }
      ]
    },
    M8: {
      how: [
        "AI Security treats every external text (web pages, emails, PDFs, user messages) as untrusted input capable of Prompt Injection. Defense-in-depth layers: least-privilege tool scopes, input/output Guardrails, PII redaction, human confirmation for side effects, and isolated microVM Sandboxes (e.g., E2B) for any code execution.",
        "أمان أنظمة الذكاء الاصطناعي يعامل أي نص خارجي (رسالة، ملف PDF، صفحة ويب) كمدخل غير موثوق قد يحمل حقن أوامر (Prompt Injection). الدفاع العميق يجمع: تقليص صلاحيات الأدوات للحد الأدنى، حواجز أمان للمدخلات والمخرجات، حجب البيانات الشخصية (PII)، موافقة بشرية للأفعال الحساسة، وتشغيل الأكواد في بيئات معزولة (Sandboxes)."
      ],
      metrics: [
        "Break the 'Lethal Trifecta': never give an agent private data + untrusted input + unguarded external actions together.",
        "اكسر «الثالوث القاتل»: لا تجمع للوكيل بيانات خاصة + مدخلات غير موثوقة + أفعالًا خارجية بلا رقابة."
      ],
      sources: [
        { org: "OWASP", title: "Top 10 for LLM Applications 2025", url: "https://genai.owasp.org/resource/owasp-top-10-for-llm-applications-2025/", insight: ["Standard industry taxonomy of LLM risks: Prompt Injection, Sensitive Info Disclosure, Excessive Agency.", "التصنيف العالمي المعتمد لمخاطر النماذج: حقن الأوامر، تسريب البيانات، والصلاحيات المفرطة."] },
        { org: "Simon Willison", title: "The Lethal Trifecta for AI Agents", url: "https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/", insight: ["Why combining private data, untrusted content, and external exfiltration is critical.", "لماذا يشكّل اجتماع البيانات الخاصة والمحتوى الخارجي والتنفيذ المفتوح خطرًا حرجًا."] }
      ]
    },
    M9: {
      how: [
        "Production AI Ops connects observability, routing, and cost control. Instrument every call with OpenTelemetry / Langfuse to track TTFT, total latency, token cost, and error rates per feature. Place an AI Gateway (like LiteLLM) in front of providers for automatic failovers (429/5xx), semantic caching, and per-tenant budgets—or serve open-weight models via vLLM with PagedAttention.",
        "تشغيل الذكاء الاصطناعي في الإنتاج (AI Ops) يربط المراقبة بالتوجيه وضبط التكلفة. راقب كل استدعاء (TTFT، زمن الاستجابة، التكلفة، والأخطاء) عبر أدوات مثل Langfuse. ضع بوابة AI Gateway (مثل LiteLLM) للتحويل التلقائي بين المزودين عند الأعطال وتحديد سقف الميزانية، أو استضف النماذج المفتوحة عبر vLLM."
      ],
      metrics: [
        "Always set request timeouts, exponential backoff retries, fallback models, and hard monthly spend alerts.",
        "اضبط دائمًا مهلة زمنية للطلب، وإعادة محاولة متدرجة، ونموذجًا بديلًا، وتنبيهات إنفاق صارمة."
      ],
      sources: [
        { org: "Langfuse", title: "Open-Source LLM Observability & Tracing", url: "https://langfuse.com/docs", insight: ["Trace nested agent spans, prompt versions, costs, and user feedback.", "تتبع مسارات الوكلاء، إصدارات الأوامر، التكاليف، وملاحظات المستخدمين."] },
        { org: "vLLM / LiteLLM", title: "High-Throughput Serving & AI Gateway Routing", url: "https://docs.vllm.ai/", insight: ["PagedAttention memory efficiency and multi-provider reliability.", "كفاءة الذاكرة عبر PagedAttention وموثوقية التوجيه متعدد المزودين."] }
      ]
    }
  };
  // Map added/remaining modules cleanly to their stage deep-dives
  MOD_DEEP.W1 = {
    how: [
      "AI-assisted software engineering is a disciplined workflow, not blind autocomplete. You choose the right autonomy mode (Tab → Chat → Plan → Agent), engineer clean codebase context (pinpointing files, excluding build noise, resetting sessions before Context Rot), and always separate planning from execution using concise Specs and Implementation Plans.",
      "البرمجة الاحترافية مع الذكاء الاصطناعي سير عمل منضبط وليست قبولًا أعمى للاقتراحات. تختار مستوى الاستقلالية المناسب، وتهندس سياق المشروع بدقة (تحديد الملفات واستبعاد الضوضاء وتنظيف الجلسات قبل تآكل السياق)، وتفصل دائمًا بين التخطيط والتنفيذ عبر مواصفات واضحة."
    ],
    metrics: [
      "One focused task per session; review a 10-line plan before letting an agent touch 10 files.",
      "مهمة واحدة مركّزة لكل جلسة؛ مراجعة خطة من 10 أسطر توفر عليك إصلاح 10 ملفات لاحقًا."
    ],
    sources: [
      { org: "Anthropic Engineering", title: "Claude Code: Best Practices for Agentic Coding", url: "https://www.anthropic.com/engineering/claude-code-best-practices", insight: ["Explore → Plan → Code → Commit workflow, context hygiene, and verification loops.", "منهجية استكشف ← خطّط ← برمج ← اعتمد، ونظافة السياق وحلقات التحقق."] },
      { org: "Addy Osmani", title: "Beyond Vibe Coding", url: "https://beyond.addy.ie/", insight: ["How to move from fragile vibe coding to reliable AI-assisted software engineering.", "كيف تنتقل من البرمجة العشوائية إلى هندسة برمجيات موثوقة بالذكاء الاصطناعي."] }
    ]
  };
  MOD_DEEP.W2 = {
    how: [
      "Persistent Rules files (`GEMINI.md`, `CLAUDE.md`, `AGENTS.md`, `.cursor/rules/*.mdc`) codify your team's architecture, build/test commands, and forbidden patterns so every AI session starts aligned. Keep root rules concise (<200 lines) to avoid attention dilution, use path-scoped globs for domain-specific rules, and evolve rules continuously whenever an agent makes a recurring mistake.",
      "ملفات القواعد الدائمة (`GEMINI.md` و`CLAUDE.md` و`AGENTS.md`) توثّق معماريتك وأوامر الاختبار والأنماط الممنوعة لتبدأ كل جلسة بانضباط تام. أبقِ القواعد الجذرية موجزة (<200 سطر) لتجنب تشتت الانتباه، واستخدم قواعد مخصّصة بالمسار، وطوّرها باستمرار كلما تكرر خطأ للوكيل."
    ],
    metrics: [
      "Root rules: 60–200 high-signal lines. Every recurring AI bug → 1 permanent living rule.",
      "قواعد المشروع الجذرية: 60–200 سطر عالي القيمة. كل خطأ متكرر يتحوّل إلى قاعدة دائمة من سطر واحد."
    ],
    sources: [
      { org: "AGENTS.md", title: "Open Standard for AI Coding Agent Instructions", url: "https://agents.md/", insight: ["A simple, portable README specifically tailored for AI coding agents.", "معيار مفتوح وبسيط لكتابة تعليمات المستودع لوكلاء البرمجة."] },
      { org: "Cursor Docs", title: "Project Rules & Scoped Globs", url: "https://docs.cursor.com/context/rules", insight: ["How path-scoped rules load domain standards only when editing matching files.", "كيف تحمّل القواعد المخصّصة بالمسار معايير كل طبقة عند الحاجة فقط."] }
    ]
  };
  MOD_DEEP.W3 = {
    how: [
      "Advanced AI developers combine three distinct customization primitives: Skills (`SKILL.md` with Progressive Disclosure) for specialized multi-step playbooks loaded only on demand; Hooks for 100% deterministic guardrails (auto-linting, blocking `.env` access); and Subagents + Git Worktrees for isolated research, parallel implementation, and unbiased diff review.",
      "المطورون المتقدمون يجمعون ثلاث أدوات متكاملة: المهارات (`SKILL.md` بالكشف التدريجي) لكتيّبات العمل المتخصصة عند الحاجة، والـ Hooks للضوابط الحتمية 100% (التنسيق التلقائي وحماية الأسرار)، والوكلاء الفرعيين وGit Worktrees لعزل السياق والعمل المتوازي والمراجعة المحايدة."
    ],
    metrics: [
      "Use Rules for always-on laws, Skills for on-demand playbooks, and Hooks for 100% enforced checks.",
      "استخدم Rules للقوانين الدائمة، وSkills لكتيّبات الخبرة عند الحاجة، وHooks للفحوص الحتمية 100%."
    ],
    sources: [
      { org: "Agent Skills", title: "Open Standard for Reusable Agent Skills (SKILL.md)", url: "https://agentskills.io/", insight: ["Progressive disclosure architecture: frontmatter triggers, scripts/, and references/.", "معمارية الكشف التدريجي: مقدمة التفعيل، السكربتات، والمراجع."] },
      { org: "Git Docs", title: "git-worktree — Parallel Isolated Checkouts", url: "https://git-scm.com/docs/git-worktree", insight: ["Run multiple coding agents on separate branches simultaneously without collisions.", "تشغيل عدة وكلاء برمجة على فروع منفصلة بالتوازي دون تعارض ملفات."] }
    ]
  };
  MOD_DEEP.W4 = {
    how: [
      "Developer-side MCP servers connect your coding agent directly to GitHub, read-only databases, Figma designs, live docs, and browser DevTools. Keep active MCPs lean to avoid context tax, enforce least-privilege credentials, close the feedback loop with TDD/typecheck/browser verification, route tasks to the right model tier, and review every diff rigorously to prevent AI Slop.",
      "خوادم MCP للمطورين تربط وكيل البرمجة مباشرة بـ GitHub وقواعد البيانات وFigma والتوثيق الحي والمتصفح. أبقِ الخوادم المفعّلة محدودة لتجنب ضريبة السياق، والتزم بأقل صلاحية (قراءة فقط لقواعد البيانات)، وأغلق حلقة التحقق بـ TDD وفحص الأنواع والمتصفح، وراجع كل تعديل لتجنب الكود العشوائي."
    ],
    metrics: [
      "Keep 2–5 high-value MCP servers active per project; always verify with automated tests + diff review.",
      "فعّل 2–5 خوادم MCP عالية القيمة لكل مشروع فقط، وتحقق دائمًا بالاختبارات ومراجعة التعديلات."
    ],
    sources: [
      { org: "Model Context Protocol", title: "Connect Local MCP Servers to Coding Clients", url: "https://modelcontextprotocol.io/docs/develop/connect-local-servers", insight: ["Configuring stdio and HTTP MCP servers securely inside IDEs and CLI agents.", "إعداد خوادم MCP المحلية والبعيدة بأمان داخل بيئات البرمجة."] },
      { org: "Simon Willison", title: "The Lethal Trifecta & MCP Security", url: "https://simonwillison.net/2025/Jun/16/the-lethal-trifecta/", insight: ["Why least privilege and human approval are mandatory when connecting external MCP tools.", "لماذا يُعد مبدأ أقل صلاحية والموافقة البشرية إلزاميين مع أدوات MCP."] }
    ]
  };
  MOD_DEEP.F1 = {
    how: [
      "Harness Engineering treats everything around the LLM as first-class software architecture: bounded loops, context compaction, durable state, deterministic hooks, and independent Generator–Evaluator verification. For multi-hour jobs, long-running harnesses use structured progress files + Git checkpoints to survive unlimited context resets, backed by durable execution engines (Temporal/Restate/LangGraph) with idempotency keys.",
      "هندسة الـ Harness تعامل كل ما يحيط بالنموذج كمعمارية برمجية أساسية: حلقات منضبطة، ضغط سياق، حالة دائمة، Hooks حتمية، وفصل بين المُولِّد والمُقيِّم. وفي المهام الممتدة لساعات، تعتمد على ملفات تقدم مهيكلة ونقاط Git للنجاة من تصفير السياق، مع محركات تنفيذ دائم ومفاتيح منع التكرار."
    ],
    metrics: [
      "Agent = Model + Harness. Always separate Generator and Evaluator contexts and enforce idempotency on side-effect tools.",
      "الوكيل = النموذج + الـ Harness. افصل دائمًا سياق المُولِّد عن المُقيِّم وفرض مفاتيح منع التكرار للأدوات ذات الأثر الخارجي."
    ],
    sources: [
      { org: "Anthropic Engineering", title: "Effective Harnesses for Long-Running Agents", url: "https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents", insight: ["Initializer + coding-agent sessions, structured feature lists, and clean Git handoffs.", "تقسيم الجلسات بين مُهيّئ ومنفّذ، وقوائم ميزات مهيكلة، وتسليم نظيف عبر Git."] },
      { org: "Temporal", title: "Durable Execution for AI Agents", url: "https://temporal.io/", insight: ["Surviving crashes, retries, and multi-day human approvals without re-running LLM steps.", "النجاة من الأعطال وإعادات المحاولة والانتظار الطويل دون إعادة دفع تكلفة الخطوات السابقة."] }
    ]
  };
  MOD_DEEP.F2 = {
    how: [
      "Infrastructure governance for AI agents combines container isolation (Docker, Devcontainers, non-root sandboxes, egress allowlists) with visual stack management and strict access control (Portainer & Portainer-Command). Agents receive short-lived non-human identities with read-only MCP visibility, propose all production changes via GitOps Pull Requests, and stay bounded by fleet-wide Emergency Halt kill switches.",
      "حوكمة البنية التحتية للوكلاء تجمع بين عزل الحاويات (Docker وDevcontainers ومستخدم غير جذري وقائمة بيضاء للشبكة) وبين الإدارة والحوكمة عبر Portainer وPortainer-Command: صلاحيات مؤقتة للقراءة فقط، تحويل كل تعديل إلى GitOps Pull Request، وزر إيقاف طارئ شامل."
    ],
    metrics: [
      "Zero direct write paths to production for AI agents; 100% of infra changes flow through GitOps PRs + Emergency Halt readiness.",
      "صفر مسارات كتابة مباشرة للوكلاء على الإنتاج؛ 100% من تعديلات البنية تمر عبر GitOps PR مع جاهزية زر الإيقاف الطارئ."
    ],
    sources: [
      { org: "Portainer", title: "Container & Kubernetes Management + AI Governance", url: "https://www.portainer.io/", insight: ["Visual Docker/K8s stack operations and governed read-only MCP + GitOps workflows for AI agents.", "إدارة حزم Docker/K8s وحوكمة وكلاء AI عبر MCP للقراءة فقط وGitOps."] },
      { org: "Dev Containers", title: "Development Containers Specification", url: "https://containers.dev/", insight: ["Reproducible, isolated container workspaces for both developers and autonomous coding agents.", "بيئات حاويات معزولة ومتطابقة للمطورين ووكلاء البرمجة المستقلين."] }
    ]
  };
  MOD_DEEP.F3 = {
    how: [
      "The frontier AI stack standardizes around open protocols and objective verifiers: MCP connects agents to tools, A2A connects independent agents across vendors via Agent Cards, and AG-UI streams live state and safe Generative UI widgets to users. Meanwhile, RLVR and DSPy shift engineering from subjective prompt guessing to verifier-first design and data-compiled prompt optimization.",
      "يتوحّد مكدّس الذكاء الاصطناعي الحديث حول بروتوكولات مفتوحة ومدقّقات موضوعية: MCP للأدوات، A2A بين الوكلاء، AG-UI للواجهات التفاعلية الحية؛ بينما تنقل تقنيات RLVR وDSPy الهندسة من التخمين النصي إلى التصميم المبني على المدقّقات وتحسين الأوامر بالبيانات."
    ],
    metrics: [
      "Pair MCP (tools) + A2A (agents) + AG-UI (frontend), and design deterministic verifiers before scaling autonomy or optimization.",
      "ادمج MCP (الأدوات) + A2A (الوكلاء) + AG-UI (الواجهة)، وصمّم مدقّقات حتمية قبل توسيع الاستقلالية أو التحسين."
    ],
    sources: [
      { org: "Linux Foundation / Google", title: "Agent2Agent (A2A) Open Protocol", url: "https://a2a-protocol.org/", insight: ["Agent Cards, task lifecycles, and cross-framework multi-agent interoperability.", "بطاقات تعريف الوكلاء ودورة حياة المهام والتكامل بين الأطر المختلفة."] },
      { org: "Stanford NLP", title: "DSPy — Programming Not Prompting LMs", url: "https://dspy.ai/", insight: ["Typed signatures and automated prompt/few-shot compilers driven by eval metrics.", "تواقيع مهيكلة ومُحسِّنات تلقائية للأوامر مبنية على مقاييس التقييم."] }
    ]
  };
  MOD_DEEP.A1 = MOD_DEEP.M1;
  MOD_DEEP.A2 = MOD_DEEP.M3;
  MOD_DEEP.A3 = MOD_DEEP.M5;
  MOD_DEEP.A4 = MOD_DEEP.M6;
  MOD_DEEP.A5 = MOD_DEEP.M7;
  MOD_DEEP.A6 = MOD_DEEP.M9;
  MOD_DEEP.M10 = MOD_DEEP.M9;
  MOD_DEEP.M11 = MOD_DEEP.M9;
  MOD_DEEP.C5 = MOD_DEEP.C4;

  function getLessonGlossary(l) {
    const blob = [
      l.t[0], l.t[1], l.d[0], l.d[1],
      ...(l.vl || []),
      ...l.p.flat(),
      l.ex || ""
    ].join(" ");
    const matched = GLOSSARY.filter(g => g.rx.test(blob));
    // Always return at least 3 relevant terms so every lesson explains its vocabulary
    return matched.length >= 2 ? matched.slice(0, 6) : GLOSSARY.slice(0, 3);
  }

  function getLessonDeepDive(l) {
    const modId = l.module && l.module.id;
    return MOD_DEEP[modId] || MOD_DEEP.C1;
  }

  window.LessonDeepDive = {
    getLessonGlossary,
    getLessonDeepDive
  };
})();
