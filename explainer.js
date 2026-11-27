// AI Engineer Studio — Motion Explainer engine (شرح الموشن)
// 3Blue1Brown-style lesson explainers: one picture that keeps evolving, a short caption + formula on top,
// and an Arabic voice-over per step.
//
//   Explainer.lesson(id, beats)   register a lesson. beat = { sec?, say, eq?, do?(s), hold?, min? }
//   Explainer.build(def, durOf)   pure data (also runs in Node for the video pipeline): timeline of objects
//   Explainer.mount(film, host)   draws a film with SVG; returns { seek(t) } — fully deterministic
//   Explainer.player(host, lesson, opts)   in-app player (play/pause, seek, sections, voice)
//
// Authoring API inside beat.do(s): see explainers/README.md.
(function (root) {
  "use strict";
  const W = 1600, H = 900;
  const C = {
    bg: "#0b0f14", panel: "#111821", panel2: "#16202b", ink: "#e8edf3", soft: "#b9c3cf", dim: "#7f8a98", faint: "#3a4452", grid: "#1d2530",
    blue: "#58a6ff", orange: "#f0883e", green: "#3fb950", gold: "#e3b341", teal: "#2ec4b6", red: "#f85149",
    purple: "#bc8cff", pink: "#f778ba", cyan: "#56d4dd", white: "#ffffff", black: "#000000"
  };
  const FF = {
    math: '"KaTeX_Main","Latin Modern Roman","Cambria Math",Cambria,"Times New Roman",serif',
    ar: '"IBM Plex Sans Arabic","Readex Pro","Segoe UI",Tahoma,sans-serif',
    mono: '"IBM Plex Mono",Consolas,"Courier New",monospace',
    ui: 'Outfit,"IBM Plex Sans","IBM Plex Sans Arabic","Segoe UI",sans-serif'
  };
  // Character widths (per 100px, ASCII 32..126) measured in Chrome — keeps layout identical in Node and the browser.
  const CW = {
    math: [25, 28, 50, 83, 50, 83, 78, 28, 39, 39, 50, 78, 28, 33, 28, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 28, 28, 78, 78, 78, 47, 78, 75, 71, 72, 76, 68, 65, 79, 75, 36, 51, 78, 63, 92, 75, 78, 68, 78, 74, 56, 72, 75, 75, 103, 75, 75, 61, 28, 50, 28, 50, 50, 33, 50, 56, 44, 56, 44, 31, 50, 56, 28, 31, 53, 28, 83, 56, 50, 56, 53, 39, 39, 39, 56, 53, 72, 53, 53, 44, 50, 28, 50, 50],
    ui: [20, 27, 44, 65, 59, 67, 68, 25, 30, 30, 49, 56, 28, 46, 30, 39, 66, 37, 55, 55, 60, 55, 57, 53, 56, 57, 28, 28, 56, 56, 56, 50, 75, 72, 63, 69, 75, 60, 58, 78, 72, 28, 51, 69, 56, 85, 73, 80, 62, 82, 64, 57, 63, 70, 71, 99, 71, 68, 60, 35, 39, 35, 46, 49, 31, 59, 59, 49, 59, 54, 42, 58, 56, 25, 26, 53, 25, 87, 56, 57, 59, 59, 43, 44, 39, 53, 52, 77, 52, 53, 47, 33, 29, 33, 56],
    ar: [24, 28, 42, 71, 60, 93, 69, 24, 34, 34, 45, 60, 27, 40, 27, 38, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 29, 29, 60, 60, 60, 48, 89, 64, 65, 62, 67, 58, 56, 70, 71, 40, 51, 63, 50, 81, 71, 71, 61, 71, 64, 58, 57, 68, 61, 89, 61, 59, 58, 32, 38, 32, 60, 57, 60, 53, 58, 50, 58, 55, 32, 53, 57, 25, 25, 53, 27, 87, 57, 56, 58, 58, 37, 49, 35, 57, 49, 77, 51, 50, 46, 34, 31, 34, 60]
  };
  const AR_RE = /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/;
  const hasAr = s => AR_RE.test(String(s));
  const fontOf = (text, f) => f || (hasAr(text) ? "ar" : "math");
  function textW(str, size, font, weight) {
    str = String(str); font = font || fontOf(str);
    if (font === "mono") return str.length * 0.6 * size;
    const tab = CW[font] || CW.ui;
    let w = 0;
    for (const ch of str) {
      const c = ch.charCodeAt(0);
      if (c >= 32 && c < 127) w += tab[c - 32];
      else if (AR_RE.test(ch)) w += 42;
      else if (c >= 0x064B && c <= 0x0652) w += 0; // harakat
      else w += 62;
    }
    w = w / 100 * size;
    return (weight || 400) >= 600 ? w * 1.05 : w;
  }
  function wrapText(str, maxW, size, font, weight) {
    const out = [];
    String(str).split("\n").forEach(par => {
      const words = par.split(/\s+/).filter(Boolean);
      let cur = "";
      for (const w of words) {
        const nx = cur ? cur + " " + w : w;
        if (cur && textW(nx, size, font, weight) > maxW) { out.push(cur); cur = w; } else cur = nx;
      }
      out.push(cur);
    });
    return out;
  }

  // ---------------------------------------------------------------- math helpers
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  const E = {
    lin: x => x,
    io: x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2,
    out: x => 1 - Math.pow(1 - x, 3),
    in: x => x * x * x,
    back: x => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); },
    sine: x => -(Math.cos(Math.PI * x) - 1) / 2
  };
  const col = v => (typeof v === "string" && C[v]) || v;
  function rgb(h) {
    h = String(h).replace("#", "");
    if (h.length === 3) h = h.split("").map(c => c + c).join("");
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const hex = a => "#" + a.map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, "0")).join("");
  const mix = (a, b, p) => { const x = rgb(a), y = rgb(b); return hex(x.map((v, i) => v + (y[i] - v) * p)); };
  const isHex = v => typeof v === "string" && /^#[0-9a-f]{3,8}$/i.test(v);
  function lerp(a, b, p) {
    if (typeof a === "number" && typeof b === "number") return a + (b - a) * p;
    if (isHex(a) && isHex(b)) return mix(a, b, p);
    if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) return a.map((v, i) => lerp(v, b[i], p));
    return p < 0.5 ? a : b;
  }
  const r2 = v => Math.round(v * 100) / 100;

  // Hash (cyrb53) — identical in Node and the browser; keys the voice clips.
  function hash(str) {
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < str.length; i++) { const ch = str.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16).padStart(14, "0");
  }
  const VOICE_DEFAULT = { voice: "ar-SA-HamedNeural", rate: "+10%" };
  const voiceCfg = () => Object.assign({}, VOICE_DEFAULT, root.EXPLAINER_VOICE || {});
  const speakText = s => String(s || "").replace(/`/g, "").replace(/[→←⟶]/g, "، ").replace(/\s+/g, " ").trim();
  // Spoken-Arabic normalizer for edge-tts (ar-SA-HamedNeural): keeps on-screen captions & SRT clean
  // while converting English acronyms, snake_case identifiers, and ambiguous Arabic words into clear phonetics.
  const TTS_RULES = [
    // Compound / dotted / @ / slash technical identifiers first
    [/\bpass@k\b/gi, "باس آت كيه"], [/\brecall@k\b/gi, "ريكول آت كيه"], [/\bprecision@k\b/gi, "بريسيجن آت كيه"],
    [/\bAG-UI\b/gi, "إيه جي يو آي"], [/\bCI\/CD\b/gi, "سي آي سي دي"], [/\bQ&A\b/gi, "كيو آند إيه"],
    [/\bFine-tuning\b/gi, "فاين تيونينج"], [/\bPre-training\b/gi, "بري ترينينج"],
    [/\bTop-p\b/gi, "توب بي"], [/\bTop-k\b/gi, "توب كيه"], [/\bBest-of-N\b/gi, "بيست أوف إن"],
    [/\bPlan-and-Execute\b/gi, "بلان آند إكسكيوت"], [/\bServer-Sent Events\b/gi, "سيرفر سنت إيفنتس"],
    [/\bChain-of-Thought\b/gi, "تشين أوف ثوت"], [/\bTree-of-Thoughts\b/gi, "تري أوف ثوتس"],
    [/\bHuman-in-the-loop\b/gi, "هيومان إن ذا لوب"], [/\bPrompt Caching\b/gi, "برومبت كاشينج"],
    [/\bKV cache\b/gi, "كيه في كاش"], [/\bA\/B\b/g, "إيه بي"],
    [/\bmax_tokens\b/gi, "ماكس توكنز"], [/\bstop_reason\b/gi, "ستوب ريزون"], [/\bstop_sequence\b/gi, "ستوب سيكونس"],
    [/\btool_use_id\b/gi, "تول يوز آي دي"], [/\btool_use\b/gi, "تول يوز"], [/\btool_result\b/gi, "تول ريزالت"],
    [/\btool_search\b/gi, "تول سيرش"], [/\bthread_id\b/gi, "ثريد آي دي"], [/\btenant_id\b/gi, "تينانت آي دي"],
    [/\bis_error\b/gi, "إز إيرور"], [/\bend_turn\b/gi, "إند تيرن"], [/\bpause_turn\b/gi, "بوز تيرن"],
    [/\binput_schema\b/gi, "إنبوت سكيما"], [/\bresponse_format\b/gi, "ريسبونس فورمات"],
    [/\bstream_mode\b/gi, "ستريم مود"], [/\bmax_steps\b/gi, "ماكس ستيبس"], [/\bAGENTS\.md\b/gi, "ملف إيجنتس"],
    [/\bCLAUDE\.md\b/gi, "ملف كلود"], [/\bGEMINI\.md\b/gi, "ملف جيميناي"], [/\bSKILL\.md\b/gi, "ملف سكيل"],
    [/\bfeatures\.json\b/gi, "ملف فيتشرز جيسون"], [/\bprogress\.md\b/gi, "ملف بروجريس"],
    [/\bhandoff\.md\b/gi, "ملف هاند أوف"], [/\bdocker\.sock\b/gi, "دوكر سوك"],
    [/\bInMemorySaver\b/g, "إن ميموري سيفر"], [/\bPostgresSaver\b/g, "بوستجرس سيفر"],
    [/\bRetryPolicy\b/g, "ريتراي بوليسي"], [/\bPagedAttention\b/gi, "بيجد أتينشن"],
    [/\bGraphRAG\b/gi, "جراف راج"], [/\bReplyAssist\b/gi, "ريبلاي أسيست"],
    [/\bLangGraph\b/gi, "لانج جراف"], [/\bLangChain\b/gi, "لانج تشين"], [/\bLangfuse\b/gi, "لانج فيوز"],
    [/\bFastAPI\b/gi, "فاست إيه بي آي"], [/\bLiteLLM\b/gi, "لايت إل إل إم"], [/\bvLLM\b/g, "في إل إل إم"],
    [/\bpgvector\b/gi, "بي جي فيكتور"], [/\bPostgreSQL\b/gi, "بوستجرس كيو إل"], [/\bPostgres\b/gi, "بوستجرس"],
    [/\bPydantic\b/gi, "بايدانتك"], [/\bOpenTelemetry\b/gi, "أوبن تليميتري"], [/\bDevcontainer\b/gi, "ديف كونتينر"],
    [/\bCheckpointer\b/gi, "تشيك بوينتر"], [/\bCheckpoint\b/gi, "تشيك بوينت"],
    [/\bChatGPT\b/gi, "تشات جي بي تي"], [/\bOpenAI\b/gi, "أوبن إيه آي"], [/\bAnthropic\b/gi, "أنثروبيك"],
    [/\bClaude\b/gi, "كلود"], [/\bGemini\b/gi, "جيميناي"], [/\bOllama\b/gi, "أولاما"],
    [/\bPortainer\b/gi, "بورتينر"], [/\bTemporal\b/gi, "تيمبورال"], [/\bDocker\b/gi, "دوكر"],
    [/\bKubernetes\b/gi, "كوبرنيتيس"], [/\bReact\b/gi, "ريأكت"], [/\bGitHub\b/gi, "جيت هب"], [/\bGit\b/g, "جيت"],
    [/\bMiniLM\b/gi, "ميني إل إم"], [/\bSimon Willison\b/gi, "سايمون ويليسون"],
    [/\bTransformer\b/gi, "ترانسفورمر"], [/\bSelf-Attention\b/gi, "سيلف أتينشن"], [/\bAttention\b/gi, "أتينشن"],
    [/\bEmbeddings\b/gi, "إمبيدينجز"], [/\bEmbedding\b/gi, "إمبيدينج"], [/\bTokens\b/gi, "توكنز"], [/\bToken\b/gi, "توكن"],
    [/\bTemperature\b/gi, "تيمبريتشر"], [/\bStreaming\b/gi, "ستريمنج"], [/\bContext\b/gi, "كونتكست"],
    [/\bPrompting\b/gi, "برومبتنج"], [/\bPrompts\b/gi, "برومبتس"], [/\bPrompt\b/gi, "برومبت"],
    [/\bHarness\b/gi, "هارنيس"], [/\bSandboxes\b/gi, "ساند بوكسز"], [/\bSandbox\b/gi, "ساند بوكس"],
    [/\bHooks\b/gi, "هوكس"], [/\bHook\b/gi, "هوك"], [/\bSkills\b/gi, "سكيلز"], [/\bSkill\b/gi, "سكيل"],
    [/\bSpans\b/gi, "سبانز"], [/\bSpan\b/gi, "سبان"], [/\bTraces\b/gi, "تريسز"], [/\bTrace\b/gi, "تريس"],
    [/\bEvals\b/gi, "إيفالز"], [/\bEval\b/gi, "إيفال"], [/\bLinter\b/gi, "لينتر"], [/\bRouter\b/gi, "راوتر"],
    [/\bReranker\b/gi, "ري رانكر"], [/\bReranking\b/gi, "ري رانكينج"], [/\bChunking\b/gi, "تشانكينج"],
    [/\bChunks\b/gi, "تشانكس"], [/\bChunk\b/gi, "تشانك"], [/\bWorkflows\b/gi, "وورك فلوز"], [/\bWorkflow\b/gi, "وورك فلو"],
    [/\bAgents\b/gi, "إيجنتس"], [/\bAgent\b/gi, "إيجنت"], [/\bSubagents\b/gi, "سب إيجنتس"], [/\bSubagent\b/gi, "سب إيجنت"],
    [/\bReflexion\b/gi, "ريفليكشن"], [/\bReAct\b/g, "ري آكت"], [/\bReWOO\b/g, "ري وو"], [/\bCodeAct\b/gi, "كود آكت"],
    [/\bCaMeL\b/g, "كاميل"], [/\bCoALA\b/g, "كوالا"], [/\bDSPy\b/gi, "دي إس باي"], [/\bMem0\b/gi, "ميم زيرو"],
    [/\bGuardrails\b/gi, "جارد ريلز"], [/\bGuardrail\b/gi, "جارد ريل"], [/\bGateway\b/gi, "جيت واي"],
    [/\bFallback\b/gi, "فول باك"], [/\bCaching\b/gi, "كاشينج"], [/\bCache\b/gi, "كاش"],
    [/\bWebhook\b/gi, "ويب هوك"], [/\bIdempotency\b/gi, "أيدمبوتنسي"], [/\bSchema\b/gi, "سكيما"],
    [/\bJSON\b/gi, "جيسون"], [/\bYAML\b/gi, "يامل"], [/\bXML\b/gi, "إكس إم إل"], [/\bCSV\b/gi, "سي إس في"],
    [/\bHTML\b/gi, "إتش تي إم إل"], [/\bPDF\b/gi, "بي دي إف"], [/\bSQL\b/gi, "إس كيو إل"],
    [/\bNoSQL\b/gi, "نو إس كيو إل"], [/\bREST\b/g, "ريست"], [/\bOAuth\b/gi, "أو أوث"],
    [/\bAPIs\b/g, "واجهات إيه بي آي"], [/\bAPI\b/g, "إيه بي آي"],
    [/\bLLMs\b/g, "نماذج إل إل إم"], [/\bLLM\b/g, "إل إل إم"],
    [/\bRAG\b/g, "راج"], [/\bMCP\b/g, "إم سي بي"], [/\bA2A\b/g, "إيه تو إيه"], [/\bACI\b/g, "إيه سي آي"],
    [/\bHTTP\b/gi, "إتش تي تي بي"], [/\bHTTPS\b/gi, "إتش تي تي بي إس"], [/\bSSE\b/g, "إس إس إي"],
    [/\bWebSocket\b/gi, "ويب سوكيت"], [/\bstdio\b/gi, "إس تي دي آي أو"], [/\bStreamable\b/gi, "ستريمابل"],
    [/\bRLHF\b/g, "آر إل إتش إف"], [/\bRLVR\b/g, "آر إل في آر"], [/\bDPO\b/g, "دي بي أو"],
    [/\bSFT\b/g, "إس إف تي"], [/\bLoRA\b/gi, "لورا"], [/\bQLoRA\b/gi, "كيو لورا"],
    [/\bBM25\b/gi, "بي إم خمسة وعشرين"], [/\bHNSW\b/g, "إتش إن إس دبليو"], [/\bOWASP\b/gi, "أو واسب"],
    [/\bPII\b/g, "بي آي آي"], [/\bRBAC\b/g, "آر باك"], [/\bJWT\b/g, "جيه دبليو تي"], [/\bSSO\b/g, "إس إس أو"],
    [/\bSDK\b/g, "إس دي كيه"], [/\bCLI\b/g, "سي إل آي"], [/\bIDE\b/g, "آي دي إي"],
    [/\bUI\b/g, "يو آي"], [/\bUX\b/g, "يو إكس"], [/\bCI\b/g, "سي آي"], [/\bPR\b/g, "بي آر"],
    [/\bGPUs\b/g, "معالجات جي بي يو"], [/\bGPU\b/g, "جي بي يو"], [/\bCPU\b/g, "سي بي يو"],
    [/\bFP16\b/gi, "إف بي ستة عشر"], [/\bFP8\b/gi, "إف بي ثمانية"], [/\bINT4\b/gi, "إنت أربعة"], [/\bINT8\b/gi, "إنت ثمانية"],
    [/\bAWQ\b/g, "إيه دبليو كيو"], [/\bMLP\b/g, "إم إل بي"], [/\bAI\b/g, "إيه آي"], [/\bML\b/g, "إم إل"],
    [/\bSLA\b/g, "إس إل إيه"], [/\bSLO\b/g, "إس إل أو"], [/\bTTL\b/g, "تي تي إل"],
    [/\bTTFT\b/g, "تي تي إف تي"], [/\bP95\b/gi, "بي خمسة وتسعين"], [/\bP99\b/gi, "بي تسعة وتسعين"],
    [/\bmicroVM\b/gi, "مايكرو في إم"], [/\bPull Request\b/gi, "بول ريكويست"], [/\bdiff\b/gi, "ديف"],
    [/\binterrupt\b/gi, "إنتربت"], [/\bSend\b/g, "سِند"], [/\bsetup\b/gi, "سيت أب"],
    [/\bSystem\b/gi, "سيستم"], [/\bUser\b/gi, "يوزر"], [/\bAssistant\b/gi, "أسيستانت"],
    [/\bQuery\b/gi, "كويري"], [/\bKey\b/gi, "كي"], [/\bValue\b/gi, "فاليو"],
    [/\bSoftmax\b/gi, "سوفت ماكس"], [/\bStore\b/g, "ستور"], [/\bState\b/g, "ستيت"],
    [/\bOpenTelemetry\b/gi, "أوبن تليميتري"], [/\bZod\b/g, "زود"], [/\bTypeScript\b/gi, "تايب سكريبت"],
    [/\bPython\b/gi, "بايثون"], [/\bNode\b/g, "نود"], [/\bRegex\b/gi, "ريجيكس"],
    // Replace any remaining snake_case underscores with spaces so edge-tts never chokes on "_"
    [/([A-Za-z0-9])_([A-Za-z0-9])/g, "$1 $2"],
    // Smooth Arabic prefixes before converted terms (الـ API → ال إيه بي آي, بـ JSON → بجيسون)
    [/الـ\s+/g, "ال"], [/للـ\s+/g, "لل"], [/بالـ\s+/g, "بال"], [/والـ\s+/g, "وال"], [/كالـ\s+/g, "كال"],
    [/بـ\s+/g, "ب"], [/لـ\s+/g, "لِ"],
    // Helpful Arabic diacritics using Arabic-range boundaries (\b only works on ASCII!)
    [/(?<![؀-ۿ])انتبه(?![؀-ۿ])/g, "انتبِهْ"],
    [/(?<![؀-ۿ])كودك(?![؀-ۿ])/g, "كُودُك"], [/(?<![؀-ۿ])وكودك(?![؀-ۿ])/g, "وكُودُك"],
    [/(?<![؀-ۿ])الكود(?![؀-ۿ])/g, "الكُود"], [/(?<![؀-ۿ])بالكود(?![؀-ۿ])/g, "بالكُود"],
    [/(?<![؀-ۿ])كود(?![؀-ۿ])/g, "كُود"], [/(?<![؀-ۿ])كودًا(?![؀-ۿ])/g, "كُودًا"],
    [/(?<![؀-ۿ])ينفّذ(?![؀-ۿ])/g, "يُنفِّذ"], [/(?<![؀-ۿ])ينفذ(?![؀-ۿ])/g, "يُنفِّذ"],
    [/(?<![؀-ۿ])المقيّم(?![؀-ۿ])/g, "المُقيِّم"], [/(?<![؀-ۿ])المهيّئ(?![؀-ۿ])/g, "المُهيِّئ"]
  ];
  function ttsText(s) {
    let t = speakText(s);
    for (const [re, rep] of TTS_RULES) t = t.replace(re, rep);
    return t.replace(/\s+/g, " ").trim();
  }
  const voiceKey = (text, cfg) => { cfg = cfg || voiceCfg(); return hash(cfg.voice + "|" + cfg.rate + "|" + ttsText(text)); };
  const estimate = text => Math.max(1.2, 0.35 + ttsText(text).length / 10); // edge-tts Hamed +10% ≈ 9.6 chars/s

  // ---------------------------------------------------------------- icons (24×24, stroke)
  // parts separated by ";" — "o cx cy r" circle, "r x y w h rx" rect, anything else is path data.
  const ICONS = {
    user: "o 12 8 4;M4 21c0-4.2 3.6-6.8 8-6.8s8 2.6 8 6.8",
    users: "o 9 8 3.5;M2.5 20c0-3.6 2.9-5.8 6.5-5.8s6.5 2.2 6.5 5.8;M15.5 4.6a3.4 3.4 0 0 1 0 6.6;M18 14.5c2.2.6 3.5 2.5 3.5 5.5",
    bot: "r 3.5 8.5 17 12 3;M12 8.5V4.5;o 12 3.5 1;M9 13.5v1;M15 13.5v1;M9.5 17.5h5;M1.5 13v3;M22.5 13v3",
    brain: "M12 4.5v15;M12 4.5a3 3 0 0 0-5.2 1.6A3.2 3.2 0 0 0 4.3 11a3.3 3.3 0 0 0 .9 4.6A3.2 3.2 0 0 0 8.5 19.6 3 3 0 0 0 12 19.5;M12 4.5a3 3 0 0 1 5.2 1.6 3.2 3.2 0 0 1 2.5 4.9 3.3 3.3 0 0 1-.9 4.6 3.2 3.2 0 0 1-3.3 4 3 3 0 0 1-3.5-.1;M8 9.5c1.3 0 2 .8 2 2;M16 9.5c-1.3 0-2 .8-2 2;M8.5 15c.8-.6 1.6-.6 2.4 0;M15.5 15c-.8-.6-1.6-.6-2.4 0",
    db: "M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z;M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6;M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3",
    doc: "M6 2.5h8l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-17a1 1 0 0 1 1-1z;M14 2.5v5h5;M8.5 12h7;M8.5 15.5h7;M8.5 19h4",
    docs: "M8 2.5h7l4 4v11a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-14a1 1 0 0 1 1-1z;M15 2.5v4h4;M4.5 6.5v14a1 1 0 0 0 1 1h10",
    folder: "M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2.5h8.5A1.5 1.5 0 0 1 21 9v9.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5z",
    gear: "o 12 12 3.2;M12 2.5v3;M12 18.5v3;M2.5 12h3;M18.5 12h3;M5.3 5.3l2.1 2.1;M16.6 16.6l2.1 2.1;M5.3 18.7l2.1-2.1;M16.6 7.4l2.1-2.1;o 12 12 6.5",
    search: "o 10.5 10.5 6.5;M15.5 15.5L21 21",
    globe: "o 12 12 9;M3 12h18;M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z",
    lock: "r 5 11 14 10 1.5;M8 11V7.5a4 4 0 0 1 8 0V11;M12 15v2",
    unlock: "r 5 11 14 10 1.5;M8 11V7.5a4 4 0 0 1 7.7-1.5;M12 15v2",
    key: "o 7.5 12 4;M11.5 12H21;M17.5 12v3.5;M20.5 12v2.5",
    shield: "M12 2.5l8 3v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10v-6z",
    shieldok: "M12 2.5l8 3v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10v-6z;M8.5 12l2.5 2.5 4.5-5",
    alert: "M12 3l9.5 17h-19z;M12 9.5v5;M12 17.5v.1",
    check: "M4.5 12.5l5 5 10-11",
    x: "M6 6l12 12;M18 6L6 18",
    clock: "o 12 12 9;M12 7v5l3.5 2",
    coin: "o 12 12 9;M14.8 9.2c-.5-1-1.6-1.6-2.8-1.6-1.7 0-2.8.9-2.8 2.1 0 2.9 5.8 1.5 5.8 4.4 0 1.2-1.2 2.2-3 2.2-1.3 0-2.5-.6-3-1.7;M12 5.8v1.8;M12 16.3v1.9",
    chart: "M4 20h16;M7 20v-6;M11 20V9;M15 20v-4;M19 20V5",
    trend: "M3 17l6-6 4 4 8-8;M15 7h6v6",
    terminal: "r 2.5 4.5 19 15 1.5;M6.5 9l3 3-3 3;M12 15.5h5",
    code: "M8.5 7L3.5 12l5 5;M15.5 7l5 5-5 5;M13.5 4.5l-3 15",
    chat: "M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H10l-5 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z",
    mail: "r 2.5 5.5 19 13 1.5;M3 6.5l9 6.5 9-6.5",
    bolt: "M13 2.5L4.5 13.5H11l-1 8 8.5-11H12z",
    cloud: "M7 18.5a4.5 4.5 0 0 1-.6-9 6 6 0 0 1 11.4 1.7A3.7 3.7 0 0 1 17.5 18.5z",
    server: "r 3 3.5 18 7 1.5;r 3 13.5 18 7 1.5;M7 7h.1;M7 17h.1;M11 7h6;M11 17h6",
    cpu: "r 7 7 10 10 1;r 10 10 4 4 .5;M9.5 3v4;M14.5 3v4;M9.5 17v4;M14.5 17v4;M3 9.5h4;M3 14.5h4;M17 9.5h4;M17 14.5h4",
    eye: "M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z;o 12 12 3",
    link: "M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1;M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1",
    flag: "M5 21V4;M5 4h11l-2 4 2 4H5",
    list: "M9 6h11;M9 12h11;M9 18h11;M4.5 6h.1;M4.5 12h.1;M4.5 18h.1",
    todo: "r 3 3.5 18 17 2;M7 8.5l1.5 1.5 3-3;M13.5 9h4;M7 15h4.5;M13.5 15h4",
    tool: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z",
    play: "M7 4.5v15l12-7.5z",
    pause: "M8 5v14;M16 5v14",
    loop: "M20 12a8 8 0 0 1-14.3 4.9;M4 12a8 8 0 0 1 14.3-4.9;M18.6 3.2v4h-4;M5.4 20.8v-4h4",
    filter: "M3.5 4.5h17l-6.5 8v6l-4 2v-8z",
    layers: "M12 3l9 5-9 5-9-5z;M3 12.5l9 5 9-5;M3 16.5l9 5 9-5",
    box: "M12 2.5l8.5 4.5v10L12 21.5 3.5 17V7z;M3.5 7L12 11.5 20.5 7;M12 11.5v10",
    branch: "M6 3v12;o 6 18 3;o 18 6 3;M18 9a9 9 0 0 1-9 9",
    pr: "o 6 6 3;M6 9v12;o 18 18 3;M18 15V9a3 3 0 0 0-3-3h-4;M13.5 3.5L11 6l2.5 2.5",
    bug: "M8 9h8v6a4 4 0 0 1-8 0z;M9 9V7.5a3 3 0 0 1 6 0V9;M4 13h4;M16 13h4;M5 8.5l3 2;M19 8.5l-3 2;M5 19l3-2;M19 19l-3-2;M12 12v7",
    scale: "M12 3v18;M7.5 21h9;M5 6.5h14;M5 6.5L2.5 13h5zM19 6.5L16.5 13h5z;M2.5 13a2.5 2.5 0 0 0 5 0;M16.5 13a2.5 2.5 0 0 0 5 0",
    thumb: "M7 10.5V21;M7 10.5l4-7.5a2 2 0 0 1 3 1.8L13.5 9H19a2 2 0 0 1 2 2.3l-1.4 7.5a2 2 0 0 1-2 1.7H7;r 3 10.5 4 10.5 .5",
    star: "M12 2.8l2.8 5.8 6.4.9-4.6 4.5 1.1 6.3L12 17.3l-5.7 3 1.1-6.3-4.6-4.5 6.4-.9z",
    target: "o 12 12 9;o 12 12 5;o 12 12 1",
    image: "r 2.5 4.5 19 15 1.5;o 8.5 9.5 1.8;M21.5 15l-5-5-11 9.5",
    mic: "r 9 2 6 12 3;M5.5 11a6.5 6.5 0 0 0 13 0;M12 17.5V21;M8.5 21h7",
    speaker: "M4 9h4l5-4.5v15L8 15H4z;M16.5 9a4 4 0 0 1 0 6;M19 6.5a7.5 7.5 0 0 1 0 11",
    browser: "r 2.5 4 19 16 1.5;M2.5 8.5h19;M5.5 6.3h.1;M8 6.3h.1;M10.5 6.3h.1",
    cursor: "M5 3l5.5 17 2.4-7.1L20 10.5z",
    plug: "M9 2.5v5;M15 2.5v5;M6 7.5h12v3a6 6 0 0 1-12 0z;M12 16.5v5",
    puzzle: "M4 8h4a2 2 0 1 1 4 0h4v4a2 2 0 1 1 0 4v4H4z",
    book: "M4 4.5A1.5 1.5 0 0 1 5.5 3H20v15H5.5A1.5 1.5 0 0 0 4 19.5z;M4 19.5A1.5 1.5 0 0 0 5.5 21H20;M8 7.5h8",
    rocket: "M12 2.5c3.5 2.5 5 6.5 4.5 11.5l-2 3h-5l-2-3C7 9 8.5 5 12 2.5z;o 12 10 1.6;M7.5 14l-3 3.5 4 .5;M16.5 14l3 3.5-4 .5;M10.5 19.5l1.5 2.5 1.5-2.5",
    trash: "M4 6.5h16;M9 6.5V4h6v2.5;M6 6.5l1 14h10l1-14;M10 10.5v6;M14 10.5v6",
    chip: "r 5 7 14 10 1.5;M8 7V4;M12 7V4;M16 7V4;M8 20v-3;M12 20v-3;M16 20v-3",
    sparkle: "M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6z;M19 3v4;M17 5h4",
    ban: "o 12 12 9;M5.6 5.6l12.8 12.8",
    hourglass: "M6.5 3h11;M6.5 21h11;M7.5 3c0 5 9 5 9 9s-9 4-9 9;M16.5 3c0 5-9 5-9 9s9 4 9 9",
    dollar: "M12 2.5v19;M16.5 6.5c-.8-1.5-2.4-2.4-4.5-2.4-2.6 0-4.4 1.4-4.4 3.4 0 4.6 9 2.4 9 7 0 2-1.9 3.5-4.6 3.5-2.2 0-3.9-1-4.7-2.6",
    bell: "M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2H4.5z;M10 21h4",
    calendar: "r 4 5.5 16 15 1.5;M4 10h16;M8.5 3v5;M15.5 3v5",
    phone: "r 7 2.5 10 19 1.5;M11 18.5h2",
    table: "r 3.5 4.5 17 15 1;M3.5 9.5h17;M3.5 14.5h17;M9.5 4.5v15",
    split: "M3 12h6;M9 12l5-5h7;M9 12l5 5h7;M18 4l3 3-3 3;M18 14l3 3-3 3",
    merge: "M3 6h5l6 6h7;M3 18h5l6-6;M18 9l3 3-3 3",
    container: "M3 11h18v6a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3z;r 5.5 7.5 3 3.5 .3;r 9.5 7.5 3 3.5 .3;r 13.5 7.5 3 3.5 .3;r 9.5 4 3 3.5 .3",
    cluster: "M12 2.5l8.5 4.8v9.4L12 21.5l-8.5-4.8V7.3z;o 12 12 3.5",
    idcard: "r 3 5 18 14 1.5;o 8.5 10.5 2;M5.5 16c.5-1.6 1.6-2.4 3-2.4s2.5.8 3 2.4;M14 9.5h4.5;M14 13h4.5",
    power: "M12 3v8;M7 5.8a8 8 0 1 0 10 0",
    gauge: "M4 17a8 8 0 1 1 16 0;M12 17l4-5;o 12 17 1",
    question: "o 12 12 9;M9.3 9.2a2.8 2.8 0 0 1 5.4 1c0 1.9-2.7 2.3-2.7 3.8;M12 17.2v.1",
    inbox: "M3 13.5h5l1.5 2.5h5l1.5-2.5h5;M5.5 5h13L21 13.5V19a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-5.5z",
    headset: "M4 14v-2a8 8 0 0 1 16 0v2;M4 14h3v5H5a1 1 0 0 1-1-1z;M20 14h-3v5h2a1 1 0 0 0 1-1z;M17 19c0 1.5-2 2.5-5 2.5",
    wand: "M4 20L15 9;M17 3v3;M15.5 4.5h3;M20 8v2;M19 9h2;M12.5 4v1.6",
    history: "M3.5 12a8.5 8.5 0 1 0 2.5-6;M3 4.5V8h3.5;M12 7.5V12l3 2",
    save: "M5 3.5h11.5l4 4v12a1 1 0 0 1-1 1h-14a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1z;M8 3.5v5h7v-5;M8 20.5v-6h8v6",
    graph: "o 12 5 2.2;o 5 18.5 2.2;o 19 18.5 2.2;M11 7l-4.9 9.5;M13 7l4.9 9.5;M7.2 18.5h9.6",
    route: "o 6 19 2.5;o 18 5 2.5;M8.5 19H15a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h6.5",
    hand: "M8 13V5.5a1.5 1.5 0 0 1 3 0V12;M11 11V4a1.5 1.5 0 0 1 3 0v7;M14 11V5.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7c-2.4 0-4-1-5.3-2.8L2.6 15a1.5 1.5 0 0 1 2.4-1.8L8 16",
    memo: "M5 3.5h14v17H5z;M8.5 8h7;M8.5 12h7;M8.5 16h4",
    pin: "M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21z;o 12 9.5 2.5",
    send: "M21.5 2.5L10.5 13.5;M21.5 2.5l-7 19-4-8-8-4z",
    stream: "M3 7c3-3 6 3 9 0s6 3 9 0;M3 12c3-3 6 3 9 0s6 3 9 0;M3 17c3-3 6 3 9 0s6 3 9 0",
    eval: "M9 3h6v4.5l5 11a1.5 1.5 0 0 1-1.4 2H5.4A1.5 1.5 0 0 1 4 18.5l5-11z;M7.5 14h9",
    zap: "M13 2.5L4.5 13.5H11l-1 8 8.5-11H12z",
    flask: "M9 3h6v4.5l5 11a1.5 1.5 0 0 1-1.4 2H5.4A1.5 1.5 0 0 1 4 18.5l5-11z;M7.5 14h9",
    stack: "r 4 3.5 16 4.5 1;r 4 9.75 16 4.5 1;r 4 16 16 4.5 1",
    skull: "M12 3a8 8 0 0 0-5 14.2V20h10v-2.8A8 8 0 0 0 12 3z;o 9 11.5 1.6;o 15 11.5 1.6;M10.5 20v-2;M13.5 20v-2",
    upload: "M12 16V4;M7 9l5-5 5 5;M4 16v3a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 19v-3",
    download: "M12 4v12;M7 11l5 5 5-5;M4 16v3a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 19v-3",
    refresh: "M20 12a8 8 0 1 1-2.3-5.7;M20 4v4h-4",
    pencil: "M4 20l1-4.5L16 4.5a2.1 2.1 0 0 1 3 3L8 18.5z;M14 6.5l3 3",
    clipboard: "r 5 4 14 17 1.5;M9 4V2.5h6V4;M8.5 10h7;M8.5 14h7;M8.5 18h4",
    sitemap: "r 9 3 6 4.5 1;r 2.5 16.5 6 4.5 1;r 9 16.5 6 4.5 1;r 15.5 16.5 6 4.5 1;M12 7.5v9;M5.5 16.5v-3h13v3",
    window: "r 2.5 4 19 16 1.5;M2.5 8.5h19",
    pulse: "M2.5 12h4l2.5-6 4 12 3-9 2 3h3.5",
    mouse: "r 6.5 3 11 18 5.5;M12 7v3",
    keyboard: "r 2 6 20 12 1.5;M6 10h.1;M10 10h.1;M14 10h.1;M18 10h.1;M7 14h10",
    camera: "r 2.5 7 19 13 1.5;M8 7l1.5-3h5L16 7;o 12 13.5 3.5",
    wave: "M2 12h2;M6 8v8;M10 5v14;M14 8v8;M18 10v4;M22 12h-2"
  };
  function iconSvg(name) {
    const src = ICONS[name] || ICONS.box;
    return src.split(";").map(p => {
      p = p.trim();
      if (p.startsWith("o ")) { const [cx, cy, r] = p.slice(2).split(/\s+/).map(Number); return `<circle cx="${cx}" cy="${cy}" r="${r}"/>`; }
      if (p.startsWith("r ")) { const [x, y, w, h, rx] = p.slice(2).split(/\s+/).map(Number); return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx || 0}"/>`; }
      return `<path d="${p}"/>`;
    }).join("");
  }

  // ---------------------------------------------------------------- code highlighting
  const KW = new Set("def return if elif else for while import from class async await const let var function new True False None null true false undefined in not and or try except catch finally raise throw yield lambda with as pass break continue export default type interface SELECT FROM WHERE ORDER BY LIMIT INSERT INTO VALUES UPDATE SET CREATE TABLE INDEX USING JOIN ON AND OR NOT GROUP AS WITH".split(" "));
  function codeTokens(line) {
    const out = [], re = /(#.*$|\/\/.*$|--\s.*$)|("(?:[^"\\]|\\.)*"?|'(?:[^'\\]|\\.)*'?|`[^`]*`?)|(@[\w.]+)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][\w]*)(?=\s*\()|([A-Za-z_][\w]*)|(\s+)|(.)/g;
    let m;
    while ((m = re.exec(line))) {
      const [s, cm, st, dec, num, fn, id] = m;
      const c = cm ? "#8b949e" : st ? "#a5d6ff" : dec ? "#ffa657" : num ? "#79c0ff" : fn ? "#d2a8ff" : id ? (KW.has(id) ? "#ff7b72" : "#e6edf3") : "#e6edf3";
      out.push([s, c]);
    }
    return out;
  }

  // ---------------------------------------------------------------- primitives
  // init(prm) → initial props (the "rest" state). make(o, g) builds DOM. draw(o, P) updates DOM.
  const NS = "http://www.w3.org/2000/svg";
  const mk = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const sa = (e, k, v) => { if (e.__a === undefined) e.__a = {}; if (e.__a[k] !== v) { e.__a[k] = v; e.setAttribute(k, v); } };
  const tf = P => `translate(${r2(P.x)} ${r2(P.y)})` + (P.rot ? ` rotate(${r2(P.rot)})` : "") + (P.scale !== 1 ? ` scale(${r2(P.scale)})` : "");
  const base = p => ({ x: p.x != null ? p.x : 800, y: p.y != null ? p.y : 530, opacity: p.opacity != null ? p.opacity : 1, scale: p.scale != null ? p.scale : 1, rot: p.rot || 0 });
  const anchorOf = (a, rtl) => a === "l" ? (rtl ? "end" : "start") : a === "r" ? (rtl ? "start" : "end") : "middle";
  function setLines(t, lines, size, lh, font) {
    const key = lines.join("\n") + "|" + size;
    if (t.__k === key) return;
    t.__k = key;
    while (t.firstChild) t.removeChild(t.firstChild);
    const n = lines.length, y0 = -(n - 1) / 2 * size * lh;
    lines.forEach((ln, i) => {
      const s = mk("tspan", { x: 0, y: r2(y0 + i * size * lh) }, t);
      s.textContent = ln;
    });
    sa(t, "direction", hasAr(lines.join("")) || font === "ar" ? "rtl" : "ltr");
  }

  const PRIM = {};

  PRIM.text = {
    init: p => Object.assign(base(p), { color: col(p.color || "ink"), text: String(p.text != null ? p.text : ""), reveal: 1, size: p.size || 36 }),
    bounds: (o, P) => ({ hw: textW(P.text, P.size, o.font) / 2 * P.scale, hh: P.size * 0.6 * P.scale }),
    make(o, g) {
      o.font = fontOf(o.prm.text, o.prm.font);
      o.t = mk("text", { "font-family": FF[o.font] || o.font, "dominant-baseline": "central", "font-weight": o.prm.weight || (o.font === "ar" ? 600 : 400), "font-style": o.prm.italic ? "italic" : "normal" }, g);
    },
    draw(o, P) {
      sa(o.g, "transform", tf(P)); sa(o.g, "opacity", r2(P.opacity));
      const rtl = o.font === "ar" || hasAr(P.text);
      sa(o.t, "text-anchor", anchorOf(o.prm.anchor, rtl)); sa(o.t, "fill", P.color); sa(o.t, "font-size", r2(P.size));
      let s = P.text;
      if (P.reveal < 1) s = Array.from(s).slice(0, Math.round(Array.from(s).length * P.reveal)).join("");
      const lines = o.prm.maxW ? wrapText(s, o.prm.maxW, P.size, o.font, o.prm.weight) : s.split("\n");
      setLines(o.t, lines, r2(P.size), o.prm.lh || 1.3, o.font);
    }
  };

  // box: rounded rect + label (+ sub-label, icon). The workhorse: tokens, components, cards, zones.
  PRIM.box = {
    init(p) {
      const size = p.size || 30, font = fontOf(p.label || "", p.font), lines = String(p.label != null ? p.label : "").split("\n");
      const lw = Math.max(...lines.map(l => textW(l, size, font, p.weight)));
      const icon = p.icon, stacked = icon && !p.inline;
      const w = p.w || Math.max(stacked ? 120 : 0, lw + (p.pad != null ? p.pad : size * 0.9) * 2 + (icon && !stacked ? size * 1.3 : 0));
      const h = p.h || (stacked ? Math.max(120, size * 1.6 * lines.length + size * 2.4 + (p.sub ? size * 0.8 : 0)) : size * 1.25 * lines.length + size * 0.85 + (p.sub ? size * 0.8 : 0));
      return Object.assign(base(p), {
        w, h, stroke: col(p.color || "soft"), fill: col(p.fill || "panel"), fop: p.fop != null ? p.fop : 1, sw: p.sw || 2.5,
        label: String(p.label != null ? p.label : ""), lc: col(p.lc || "ink"), sub: p.sub || "", subc: col(p.subc || "dim"), ic: col(p.ic || p.color || "soft"),
        glow: 0, draw: 1, lo: 1, size, r: p.r != null ? p.r : 12
      });
    },
    bounds: (o, P) => ({ hw: P.w / 2 * P.scale, hh: P.h / 2 * P.scale }),
    make(o, g) {
      const p = o.prm;
      o.font = fontOf(p.label || "", p.font);
      o.gl = mk("rect", { fill: "none" }, g);
      o.r = mk("rect", {}, g);
      o.sh = mk("line", { stroke: "#ffffff", "stroke-opacity": 0.08, "stroke-width": 1.2, "stroke-linecap": "round" }, g);
      if (p.dash) o.r.setAttribute("stroke-dasharray", p.dash);
      if (p.icon) { o.ig = mk("g", { fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, g); o.ig.innerHTML = iconSvg(p.icon); }
      o.t = mk("text", { "font-family": FF[o.font] || o.font, "dominant-baseline": "central", "text-anchor": "middle", "font-weight": p.weight || (o.font === "ar" ? 600 : o.font === "ui" ? 600 : 400) }, g);
      o.st = mk("text", { "font-family": FF[fontOf(p.sub || "", p.subFont || (hasAr(p.sub || "") ? "ar" : "ui"))], "dominant-baseline": "central", "text-anchor": "middle", "font-weight": 500 }, g);
    },
    draw(o, P, getP, t) {
      const p = o.prm, w = P.w, h = P.h, rr = Math.max(0, Math.min(P.r, h / 2, w / 2));
      sa(o.g, "transform", tf(P)); sa(o.g, "opacity", r2(P.opacity));
      for (const e of [o.r, o.gl]) { sa(e, "x", r2(-w / 2)); sa(e, "y", r2(-h / 2)); sa(e, "width", r2(w)); sa(e, "height", r2(h)); sa(e, "rx", rr); }
      sa(o.r, "stroke", P.stroke); sa(o.r, "stroke-width", r2(P.sw)); sa(o.r, "fill", P.fill); sa(o.r, "fill-opacity", r2(P.fop * clamp(P.draw * 1.5)));
      if (P.fop > 0.2 && !p.dash && w > 40 && h > 28 && P.draw > 0.85) {
        sa(o.sh, "display", "inline"); sa(o.sh, "x1", r2(-w / 2 + rr + 6)); sa(o.sh, "x2", r2(w / 2 - rr - 6)); sa(o.sh, "y1", r2(-h / 2 + 1.5)); sa(o.sh, "y2", r2(-h / 2 + 1.5));
      } else sa(o.sh, "display", "none");
      if (P.draw < 1 && !p.dash) {
        const per = 2 * (w + h) - (8 - 2 * Math.PI) * rr;
        sa(o.r, "stroke-dasharray", `${r2(per)} ${r2(per)}`); sa(o.r, "stroke-dashoffset", r2(per * (1 - P.draw)));
      } else if (!p.dash) { sa(o.r, "stroke-dasharray", "none"); sa(o.r, "stroke-dashoffset", 0); }
      const pulse = 1 + 0.22 * Math.sin((t || 0) * 3.1 + o.idx * 0.7);
      sa(o.gl, "stroke", P.stroke); sa(o.gl, "stroke-width", r2(P.sw + 10 * pulse)); sa(o.gl, "stroke-opacity", r2(0.28 * P.glow * (0.85 + 0.15 * pulse))); sa(o.gl, "display", P.glow > 0.01 ? "inline" : "none");
      const size = P.size, lines = P.label.split("\n"), stacked = p.icon && !p.inline, rtl = hasAr(P.label);
      let ly = 0, lx = 0;
      if (p.lp === "top") ly = -h / 2 + size * 0.95;
      else if (p.lp === "above") ly = -h / 2 - size * 0.85;
      else if (p.lp === "below") ly = h / 2 + size * 0.85;
      else if (stacked) ly = h * 0.24 - (p.sub ? size * 0.35 : 0);
      else if (p.sub) ly = -size * 0.38;
      if (p.icon) {
        const isz = stacked ? Math.min(w * 0.42, h * 0.42, size * 2.2) : size * 1.15;
        const padX = (p.pad != null ? p.pad : size * 0.9) * 0.8;
        const ix = stacked ? 0 : (rtl ? w / 2 - padX - isz / 2 : -w / 2 + padX + isz / 2);
        const iy = stacked ? -h / 2 + h * 0.36 - (p.sub ? size * 0.25 : 0) : 0;
        if (!stacked) lx = rtl ? -isz * 0.62 : isz * 0.62;
        sa(o.ig, "transform", `translate(${r2(ix - isz / 2)} ${r2(iy - isz / 2)}) scale(${r2(isz / 24)})`);
        sa(o.ig, "stroke", P.ic); sa(o.ig, "stroke-width", r2(Math.max(1.4, 2.1 * 24 / isz * 0.9))); sa(o.ig, "opacity", r2(P.lo));
      }
      sa(o.t, "transform", `translate(${r2(lx)} ${r2(ly)})`); sa(o.t, "fill", P.lc); sa(o.t, "font-size", r2(p.lp === "top" || p.lp === "above" || p.lp === "below" ? size * 0.72 : size)); sa(o.t, "opacity", r2(P.lo));
      setLines(o.t, lines, r2(size), 1.2, o.font);
      if (P.sub) {
        sa(o.st, "display", "inline"); sa(o.st, "fill", P.subc); sa(o.st, "font-size", r2(size * 0.58)); sa(o.st, "opacity", r2(P.lo));
        sa(o.st, "transform", `translate(${r2(lx)} ${r2(ly + size * (0.5 + 0.6 * lines.length))})`);
        setLines(o.st, [P.sub], r2(size * 0.58), 1.2);
      } else sa(o.st, "display", "none");
    }
  };

  // arrow / line between points or attached to objects (follows them as they move)
  function quadAt(a, c, b, t) { const u = 1 - t; return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]]; }
  function clipTo(ob, P, toward, gap) {
    const B = PRIM[ob.type].bounds ? PRIM[ob.type].bounds(ob, P) : { hw: 0, hh: 0 };
    const dx = toward[0] - P.x, dy = toward[1] - P.y, len = Math.hypot(dx, dy) || 1;
    let t;
    if (B.round) t = B.hw;
    else { const tx = B.hw ? B.hw / Math.abs(dx || 1e-6) : Infinity, ty = B.hh ? B.hh / Math.abs(dy || 1e-6) : Infinity; t = Math.min(tx, ty) * len; if (!isFinite(t)) t = 0; }
    t += gap;
    return [P.x + dx / len * t, P.y + dy / len * t];
  }
  function arrowGeom(o, P, getP) {
    const p = o.prm, gap = p.gap != null ? p.gap : 8;
    const A = o.from ? getP(o.from) : null, B = o.to ? getP(o.to) : null;
    const ca = A ? [A.x + (p.fdx || 0), A.y + (p.fdy || 0)] : [P.x1, P.y1], cb = B ? [B.x + (p.tdx || 0), B.y + (p.tdy || 0)] : [P.x2, P.y2];
    const dx = cb[0] - ca[0], dy = cb[1] - ca[1], len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
    const ctrl0 = [(ca[0] + cb[0]) / 2 + nx * P.bend * len, (ca[1] + cb[1]) / 2 + ny * P.bend * len];
    const a = A ? clipTo(o.from, Object.assign({}, A, { x: ca[0], y: ca[1] }), P.bend ? ctrl0 : cb, gap) : ca;
    const b = B ? clipTo(o.to, Object.assign({}, B, { x: cb[0], y: cb[1] }), P.bend ? ctrl0 : ca, gap) : cb;
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const c = [(a[0] + b[0]) / 2 - (b[1] - a[1]) / L * P.bend * L, (a[1] + b[1]) / 2 + (b[0] - a[0]) / L * P.bend * L];
    return { a, b, c, L };
  }
  PRIM.arrow = {
    init: p => ({
      x1: p.x1 != null ? p.x1 : 0, y1: p.y1 != null ? p.y1 : 0, x2: p.x2 != null ? p.x2 : 0, y2: p.y2 != null ? p.y2 : 0,
      color: col(p.color || "soft"), w: p.w || 3, opacity: p.opacity != null ? p.opacity : 1, draw: 1, bend: p.bend || 0, label: p.label || "", lc: col(p.lc || "dim")
    }),
    make(o, g) {
      o.pth = mk("path", { fill: "none", "stroke-linecap": "round" }, g);
      if (o.prm.dash) o.pth.setAttribute("stroke-dasharray", o.prm.dash);
      o.hd = mk("path", {}, g);
      o.tl = mk("path", {}, g);
      o.sp = o.prm.pulse || o.prm.stream ? [mk("circle", { r: 4.5 }, g), mk("circle", { r: 10 }, g)] : null;
      o.lb = mk("text", { "font-family": FF[fontOf(o.prm.label || "", o.prm.lfont)], "text-anchor": "middle", "dominant-baseline": "central", "font-weight": 500 }, g);
    },
    draw(o, P, getP, tm) {
      const p = o.prm, G = arrowGeom(o, P, getP), head = p.head !== false, tail = !!p.tail;
      sa(o.g, "opacity", r2(P.opacity));
      const t = clamp(P.draw);
      const end = quadAt(G.a, G.c, G.b, t), q1 = [G.a[0] + (G.c[0] - G.a[0]) * t, G.a[1] + (G.c[1] - G.a[1]) * t];
      let dir = [end[0] - q1[0], end[1] - q1[1]];
      const dl = Math.hypot(dir[0], dir[1]) || 1; dir = [dir[0] / dl, dir[1] / dl];
      const hs = 8 + P.w * 2.3, show = t > 0.02;
      const e2 = head && show ? [end[0] - dir[0] * hs * 0.7, end[1] - dir[1] * hs * 0.7] : end;
      let s0 = G.a;
      if (tail && show) { const d0 = [q1[0] - G.a[0], q1[1] - G.a[1]], l0 = Math.hypot(d0[0], d0[1]) || 1; s0 = [G.a[0] + d0[0] / l0 * hs * 0.7, G.a[1] + d0[1] / l0 * hs * 0.7]; }
      sa(o.pth, "d", show ? `M${r2(s0[0])} ${r2(s0[1])}Q${r2(q1[0])} ${r2(q1[1])} ${r2(e2[0])} ${r2(e2[1])}` : "M0 0");
      sa(o.pth, "stroke", P.color); sa(o.pth, "stroke-width", r2(P.w)); sa(o.pth, "display", show ? "inline" : "none");
      const tri = (pt, d) => { const n = [-d[1], d[0]]; return `M${r2(pt[0])} ${r2(pt[1])}L${r2(pt[0] - d[0] * hs + n[0] * hs * 0.5)} ${r2(pt[1] - d[1] * hs + n[1] * hs * 0.5)}L${r2(pt[0] - d[0] * hs - n[0] * hs * 0.5)} ${r2(pt[1] - d[1] * hs - n[1] * hs * 0.5)}Z`; };
      sa(o.hd, "d", head && show ? tri(end, dir) : "M0 0"); sa(o.hd, "fill", P.color); sa(o.hd, "display", head && show ? "inline" : "none");
      if (tail && show) { const d0 = [G.c[0] - G.a[0], G.c[1] - G.a[1]], l0 = Math.hypot(d0[0], d0[1]) || 1; sa(o.tl, "d", tri(G.a, [-d0[0] / l0, -d0[1] / l0])); sa(o.tl, "fill", P.color); sa(o.tl, "display", "inline"); }
      else sa(o.tl, "display", "none");
      if (o.sp) {
        if (t > 0.92 && P.opacity > 0.35) {
          const u = ((tm || 0) * (p.speed || 0.65) + o.idx * 0.31) % 1;
          const pt = quadAt(G.a, G.c, G.b, u), env = Math.sin(Math.PI * u);
          sa(o.sp[0], "display", "inline"); sa(o.sp[0], "cx", r2(pt[0])); sa(o.sp[0], "cy", r2(pt[1])); sa(o.sp[0], "fill", P.color); sa(o.sp[0], "opacity", r2(0.95 * env));
          sa(o.sp[1], "display", "inline"); sa(o.sp[1], "cx", r2(pt[0])); sa(o.sp[1], "cy", r2(pt[1])); sa(o.sp[1], "fill", P.color); sa(o.sp[1], "opacity", r2(0.22 * env));
        } else { sa(o.sp[0], "display", "none"); sa(o.sp[1], "display", "none"); }
      }
      if (P.label) {
        const m = quadAt(G.a, G.c, G.b, 0.5), L = G.L, nx = -(G.b[1] - G.a[1]) / L, ny = (G.b[0] - G.a[0]) / L, off = p.loff != null ? p.loff : -22;
        o.lb.textContent = P.label; sa(o.lb, "x", r2(m[0] + nx * off * (ny > 0 ? 1 : -1))); sa(o.lb, "y", r2(m[1] + ny * off * (ny > 0 ? 1 : -1)));
        sa(o.lb, "fill", P.lc); sa(o.lb, "font-size", p.lsize || 22); sa(o.lb, "opacity", r2(clamp((t - 0.5) * 2)));
        sa(o.lb, "direction", hasAr(P.label) ? "rtl" : "ltr"); sa(o.lb, "display", "inline");
      } else sa(o.lb, "display", "none");
    },
    dynamic: true
  };

  PRIM.dot = {
    init: p => Object.assign(base(p), { r: p.r || 8, color: col(p.color || "ink"), halo: p.halo ? 1 : 0 }),
    bounds: (o, P) => ({ hw: P.r * P.scale, hh: P.r * P.scale, round: true }),
    make(o, g) { o.h = mk("circle", {}, g); o.c = mk("circle", {}, g); },
    draw(o, P) {
      sa(o.g, "transform", tf(P)); sa(o.g, "opacity", r2(P.opacity));
      sa(o.c, "r", r2(P.r)); sa(o.c, "fill", P.color);
      sa(o.h, "r", r2(P.r * 2.4)); sa(o.h, "fill", P.color); sa(o.h, "opacity", r2(0.18 * P.halo));
    }
  };

  // coordinate plane: grid that can be transformed by a 2×2 matrix m = [a, b, c, d]
  PRIM.plane = {
    init: p => Object.assign(base(p), { m: p.m || [1, 0, 0, 1], gc: col(p.gc || "grid"), ac: col(p.ac || "faint") }),
    make(o, g) {
      const p = o.prm, id = "xpclip" + o.film.uid + "_" + o.idx, w = p.w || 700, h = p.h || 560;
      const cp = mk("clipPath", { id }, o.film.defs);
      o.clip = mk("rect", { x: -w / 2, y: -h / 2, width: w, height: h }, cp);
      o.gw = mk("g", { "clip-path": `url(#${id})` }, g);
      o.gp = mk("path", { fill: "none", "stroke-width": 1.4 }, o.gw);
      o.ap = mk("path", { fill: "none", "stroke-width": 2 }, o.gw);
    },
    draw(o, P) {
      const p = o.prm, u = p.u || 60, w = p.w || 700, h = p.h || 560, [a, b, c, d] = P.m;
      sa(o.g, "transform", `translate(${r2(P.x)} ${r2(P.y)})`); sa(o.g, "opacity", r2(P.opacity));
      const n = Math.ceil(Math.max(w, h) / u) + 2, M = (x, y) => [r2((a * x + b * y) * u), r2(-(c * x + d * y) * u)];
      let gd = "", ad = "";
      for (let i = -n; i <= n; i++) {
        const v1 = M(i, -n), v2 = M(i, n), h1 = M(-n, i), h2 = M(n, i);
        const seg = `M${v1[0]} ${v1[1]}L${v2[0]} ${v2[1]}M${h1[0]} ${h1[1]}L${h2[0]} ${h2[1]}`;
        if (i === 0) ad += seg; else gd += seg;
      }
      sa(o.gp, "d", gd); sa(o.gp, "stroke", P.gc); sa(o.ap, "d", p.axes === false ? "" : ad); sa(o.ap, "stroke", P.ac);
    }
  };
  const planeMap = (PP, prm, vx, vy) => { const u = prm.u || 60, [a, b, c, d] = PP.m; return [PP.x + (a * vx + b * vy) * u, PP.y - (c * vx + d * vy) * u]; };

  // vector on a plane: arrow from the plane's origin to (vx, vy) in plane units
  PRIM.vec = {
    init: p => ({ vx: p.v ? p.v[0] : 1, vy: p.v ? p.v[1] : 1, color: col(p.color || "ink"), w: p.w || 3.5, opacity: 1, draw: 1, label: p.label || "", lc: col(p.lc || p.color || "soft") }),
    make(o, g) {
      o.pth = mk("path", { fill: "none", "stroke-linecap": "round" }, g);
      if (o.prm.dash) o.pth.setAttribute("stroke-dasharray", o.prm.dash);
      o.hd = mk("path", {}, g); o.dt = mk("circle", {}, g);
      o.lb = mk("text", { "font-family": FF[fontOf(o.prm.label || "", o.prm.lfont)], "text-anchor": "middle", "dominant-baseline": "central" }, g);
    },
    bounds: () => ({ hw: 0, hh: 0 }),
    draw(o, P, getP) {
      const PP = getP(o.plane), org = [PP.x, PP.y], tipF = planeMap(PP, o.plane.prm, P.vx, P.vy), t = clamp(P.draw);
      const tip = [org[0] + (tipF[0] - org[0]) * t, org[1] + (tipF[1] - org[1]) * t];
      sa(o.g, "opacity", r2(P.opacity));
      const dx = tip[0] - org[0], dy = tip[1] - org[1], L = Math.hypot(dx, dy) || 1, d = [dx / L, dy / L], hs = 9 + P.w * 2.2;
      const dotMode = o.prm.tip === "dot", e2 = dotMode ? tip : [tip[0] - d[0] * hs * 0.7, tip[1] - d[1] * hs * 0.7];
      sa(o.pth, "d", L > 2 ? `M${r2(org[0])} ${r2(org[1])}L${r2(e2[0])} ${r2(e2[1])}` : "M0 0"); sa(o.pth, "stroke", P.color); sa(o.pth, "stroke-width", r2(P.w));
      const n = [-d[1], d[0]];
      sa(o.hd, "d", !dotMode && L > 2 ? `M${r2(tip[0])} ${r2(tip[1])}L${r2(tip[0] - d[0] * hs + n[0] * hs * 0.5)} ${r2(tip[1] - d[1] * hs + n[1] * hs * 0.5)}L${r2(tip[0] - d[0] * hs - n[0] * hs * 0.5)} ${r2(tip[1] - d[1] * hs - n[1] * hs * 0.5)}Z` : "M0 0");
      sa(o.hd, "fill", P.color);
      sa(o.dt, "cx", r2(tip[0])); sa(o.dt, "cy", r2(tip[1])); sa(o.dt, "r", dotMode ? 7 : 0); sa(o.dt, "fill", P.color);
      if (P.label) {
        o.lb.textContent = P.label; sa(o.lb, "x", r2(tip[0] + d[0] * 26)); sa(o.lb, "y", r2(tip[1] + d[1] * 26));
        sa(o.lb, "fill", P.lc); sa(o.lb, "font-size", o.prm.lsize || 26); sa(o.lb, "opacity", r2(clamp((t - 0.6) * 2.5))); sa(o.lb, "display", "inline");
      } else sa(o.lb, "display", "none");
    },
    dynamic: true
  };

  // horizontal bar (probabilities, scores, budgets). x = left edge of the track, y = center.
  PRIM.bar = {
    init: p => Object.assign(base(p), { v: p.v != null ? p.v : 0.5, color: col(p.color || "teal"), label: p.label || "", val: p.val != null ? String(p.val) : null, w: p.w || 320 }),
    make(o, g) {
      const p = o.prm;
      o.tr = mk("rect", { rx: 4 }, g); o.fl = mk("rect", { rx: 4 }, g);
      o.lb = mk("text", { "font-family": FF[fontOf(p.label || "", p.font)], "dominant-baseline": "central", "font-weight": hasAr(p.label || "") ? 600 : 400 }, g);
      o.vl = mk("text", { "font-family": FF.ui, "dominant-baseline": "central", "font-weight": 600 }, g);
    },
    bounds: (o, P) => ({ hw: P.w / 2, hh: (o.prm.h || 26) / 2 }),
    draw(o, P) {
      const p = o.prm, h = p.h || 26, size = p.size || 26;
      sa(o.g, "transform", `translate(${r2(P.x)} ${r2(P.y)})`); sa(o.g, "opacity", r2(P.opacity));
      sa(o.tr, "x", 0); sa(o.tr, "y", -h / 2); sa(o.tr, "width", r2(P.w)); sa(o.tr, "height", h); sa(o.tr, "fill", p.track === false ? "none" : C.grid);
      sa(o.fl, "x", 0); sa(o.fl, "y", -h / 2); sa(o.fl, "width", r2(Math.max(0, P.w * clamp(P.v)))); sa(o.fl, "height", h); sa(o.fl, "fill", P.color);
      o.lb.textContent = P.label; sa(o.lb, "x", -16); sa(o.lb, "text-anchor", hasAr(P.label) ? "start" : "end"); sa(o.lb, "direction", hasAr(P.label) ? "rtl" : "ltr");
      sa(o.lb, "font-size", size); sa(o.lb, "fill", C.ink);
      const txt = P.val != null ? P.val : p.pct ? Math.round(P.v * 100) + "%" : "";
      o.vl.textContent = txt; sa(o.vl, "x", r2(P.w * clamp(P.v) + 12)); sa(o.vl, "font-size", r2(size * 0.8)); sa(o.vl, "fill", P.color);
    }
  };

  PRIM.icon = {
    init: p => Object.assign(base(p), { s: p.s || 64, color: col(p.color || "soft") }),
    bounds: (o, P) => ({ hw: P.s / 2 * P.scale, hh: P.s / 2 * P.scale }),
    make(o, g) { o.ig = mk("g", { fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round" }, g); o.ig.innerHTML = iconSvg(o.prm.name); },
    draw(o, P) {
      sa(o.g, "transform", tf(P)); sa(o.g, "opacity", r2(P.opacity));
      sa(o.ig, "transform", `translate(${r2(-P.s / 2)} ${r2(-P.s / 2)}) scale(${r2(P.s / 24)})`); sa(o.ig, "stroke", P.color);
      sa(o.ig, "stroke-width", r2((o.prm.sw || 1.8) * Math.max(1, 48 / P.s)));
    }
  };

  // document page with text lines; hl highlights one line (e.g. the retrieved chunk)
  PRIM.doc = {
    init: p => Object.assign(base(p), { w: p.w || 110, h: p.h || 140, color: col(p.color || "soft"), hl: p.hl != null ? p.hl : -1, hc: col(p.hc || "gold"), fill: col(p.fill || "panel") }),
    bounds: (o, P) => ({ hw: P.w / 2 * P.scale, hh: P.h / 2 * P.scale }),
    make(o, g) {
      o.pg = mk("path", { "stroke-linejoin": "round" }, g); o.fd = mk("path", { fill: "none", "stroke-linejoin": "round" }, g);
      o.ln = []; const n = o.prm.lines || 5;
      for (let i = 0; i < n; i++) o.ln.push(mk("rect", { rx: 3 }, g));
      o.tt = mk("text", { "font-family": FF[fontOf(o.prm.title || "", o.prm.font)], "text-anchor": "middle", "dominant-baseline": "central", "font-weight": 500 }, g);
    },
    draw(o, P) {
      const w = P.w, h = P.h, f = Math.min(w, h) * 0.24, x0 = -w / 2, y0 = -h / 2;
      sa(o.g, "transform", tf(P)); sa(o.g, "opacity", r2(P.opacity));
      sa(o.pg, "d", `M${r2(x0)} ${r2(y0)}H${r2(x0 + w - f)}L${r2(x0 + w)} ${r2(y0 + f)}V${r2(y0 + h)}H${r2(x0)}Z`); sa(o.pg, "fill", P.fill); sa(o.pg, "stroke", P.color); sa(o.pg, "stroke-width", 2.2);
      sa(o.fd, "d", `M${r2(x0 + w - f)} ${r2(y0)}V${r2(y0 + f)}H${r2(x0 + w)}`); sa(o.fd, "stroke", P.color); sa(o.fd, "stroke-width", 2.2);
      const n = o.ln.length, top = y0 + f + h * 0.06, step = (h - f - h * 0.16) / Math.max(1, n);
      o.ln.forEach((r, i) => {
        const lw = (w - w * 0.3) * (i === n - 1 ? 0.6 : [0.95, 0.8, 1, 0.88, 0.72, 0.92][i % 6]), hl = Math.round(P.hl) === i;
        sa(r, "x", r2(x0 + w * 0.15)); sa(r, "y", r2(top + i * step)); sa(r, "width", r2(lw)); sa(r, "height", r2(Math.max(3, step * 0.38)));
        sa(r, "fill", hl ? P.hc : P.color); sa(r, "opacity", hl ? 1 : 0.45);
      });
      if (o.prm.title) { o.tt.textContent = o.prm.title; sa(o.tt, "y", r2(h / 2 + 22)); sa(o.tt, "font-size", o.prm.tsize || 22); sa(o.tt, "fill", C.dim); }
    }
  };

  // code block with typing reveal + highlighted line
  PRIM.code = {
    init(p) {
      const size = p.size || 22, lines = p.lines || [], maxc = Math.max(10, ...lines.map(l => l.length));
      const w = p.w || maxc * size * 0.6 + size * 2.2, h = lines.length * size * 1.5 + size * 2.6;
      return Object.assign(base(p), { w, h, reveal: 1, hl: p.hl != null ? p.hl : -1, hc: col(p.hc || "gold") });
    },
    bounds: (o, P) => ({ hw: P.w / 2 * P.scale, hh: P.h / 2 * P.scale }),
    make(o, g) {
      const p = o.prm, size = p.size || 22;
      o.bg = mk("rect", { rx: 14, fill: "#0d1319", stroke: "#2a3441", "stroke-width": 2 }, g);
      o.hlr = mk("rect", { rx: 4 }, g);
      o.hlb = mk("rect", { rx: 2 }, g);
      o.caret = mk("rect", { width: Math.max(2, size * 0.12), height: size * 1.15, rx: 1, fill: C.gold }, g);
      o.dots = [C.red, C.gold, C.green].map(c => mk("circle", { r: size * 0.26, fill: c, opacity: 0.85 }, g));
      o.tt = mk("text", { "font-family": FF.mono, "font-size": size * 0.72, fill: C.dim, "dominant-baseline": "central" }, g);
      o.tx = (p.lines || []).map(() => mk("text", { "font-family": FF.mono, "font-size": size, "dominant-baseline": "central", style: "white-space:pre" }, g));
      o.tok = (p.lines || []).map(l => p.plain ? [[l, /^\s*(#|\/\/|---)/.test(l) ? "#8b949e" : "#e6edf3"]] : codeTokens(l));
    },
    draw(o, P, getP, tm) {
      const p = o.prm, size = p.size || 22, w = P.w, h = P.h, x0 = -w / 2, y0 = -h / 2, lh = size * 1.5, pad = size * 1.1;
      sa(o.g, "transform", tf(P)); sa(o.g, "opacity", r2(P.opacity));
      sa(o.bg, "x", r2(x0)); sa(o.bg, "y", r2(y0)); sa(o.bg, "width", r2(w)); sa(o.bg, "height", r2(h));
      o.dots.forEach((d, i) => { sa(d, "cx", r2(x0 + pad * 0.8 + i * size * 0.9)); sa(d, "cy", r2(y0 + size * 0.95)); });
      o.tt.textContent = p.title || ""; sa(o.tt, "x", r2(x0 + pad * 0.8 + size * 3)); sa(o.tt, "y", r2(y0 + size * 0.95));
      const total = (p.lines || []).reduce((a, l) => a + l.length + 1, 0);
      let left = Math.round(total * clamp(P.reveal));
      const hl = Math.round(P.hl);
      if (hl >= 0) {
        const hy = r2(y0 + size * 2 + hl * lh - lh / 2 + size * 0.15);
        sa(o.hlr, "display", "inline"); sa(o.hlr, "x", r2(x0 + 6)); sa(o.hlr, "y", hy); sa(o.hlr, "width", r2(w - 12)); sa(o.hlr, "height", r2(lh)); sa(o.hlr, "fill", P.hc); sa(o.hlr, "opacity", 0.17);
        sa(o.hlb, "display", "inline"); sa(o.hlb, "x", r2(x0 + 6)); sa(o.hlb, "y", hy); sa(o.hlb, "width", 4); sa(o.hlb, "height", r2(lh)); sa(o.hlb, "fill", P.hc); sa(o.hlb, "opacity", 0.95);
      } else { sa(o.hlr, "display", "none"); sa(o.hlb, "display", "none"); }
      let curLine = 0, curCol = 0;
      o.tx.forEach((t, i) => {
        const line = p.lines[i], vis = Math.max(0, Math.min(line.length, left));
        if (left >= 0) { curLine = i; curCol = vis; }
        left -= line.length + 1;
        const key = vis + "|" + hl;
        sa(t, "x", r2(x0 + pad)); sa(t, "y", r2(y0 + size * 2.15 + i * lh));
        sa(t, "opacity", hl >= 0 && hl !== i ? 0.52 : 1);
        if (t.__k === key) return; t.__k = key;
        while (t.firstChild) t.removeChild(t.firstChild);
        let n = vis;
        for (const [s, c] of o.tok[i]) { if (n <= 0) break; const part = s.slice(0, n); n -= part.length; const ts = mk("tspan", { fill: c }, t); ts.textContent = part; }
      });
      if (P.reveal > 0.01 && P.reveal < 0.995) {
        sa(o.caret, "display", "inline");
        sa(o.caret, "x", r2(x0 + pad + curCol * size * 0.6 + 2));
        sa(o.caret, "y", r2(y0 + size * 2.15 + curLine * lh - size * 0.58));
        sa(o.caret, "opacity", Math.sin((tm || 0) * 10) > -0.2 ? 0.95 : 0.2);
      } else sa(o.caret, "display", "none");
    }
  };

  // chat bubble. side "u" (user, blue) | "a" (assistant) | "t" (tool) | "s" (system)
  PRIM.bubble = {
    init(p) {
      const size = p.size || 26, font = fontOf(p.text || "", p.font), w = p.w || 460;
      const lines = wrapText(p.text || "", w - size * 1.6, size, font);
      const h = lines.length * size * 1.35 + size * 1.2 + (p.label ? size * 0.2 : 0);
      return Object.assign(base(p), { w, h, text: String(p.text || ""), reveal: 1, color: col(p.color || ({ u: "blue", a: "soft", t: "orange", s: "purple" }[p.side || "a"])), size });
    },
    bounds: (o, P) => ({ hw: P.w / 2 * P.scale, hh: P.h / 2 * P.scale }),
    make(o, g) {
      const p = o.prm;
      o.font = fontOf(p.text || "", p.font);
      o.bg = mk("path", { "stroke-width": 2.2, "stroke-linejoin": "round" }, g);
      o.t = mk("text", { "font-family": FF[o.font], "dominant-baseline": "central", "font-weight": o.font === "ar" ? 500 : 400 }, g);
      o.lb = mk("text", { "font-family": FF[fontOf(p.label || "", "ui")], "dominant-baseline": "central", "font-weight": 600 }, g);
    },
    draw(o, P) {
      const p = o.prm, w = P.w, h = P.h, size = P.size, x0 = -w / 2, y0 = -h / 2, r = Math.min(18, h / 2), right = p.side === "u";
      sa(o.g, "transform", tf(P)); sa(o.g, "opacity", r2(P.opacity));
      const tx = right ? x0 + w - 6 : x0 + 6, ty = y0 + h;
      const d = `M${r2(x0 + r)} ${r2(y0)}H${r2(x0 + w - r)}Q${r2(x0 + w)} ${r2(y0)} ${r2(x0 + w)} ${r2(y0 + r)}V${r2(y0 + h - r)}` +
        (right ? `L${r2(tx + 6)} ${r2(ty + 14)}L${r2(x0 + w - r - 10)} ${r2(ty)}` : `Q${r2(x0 + w)} ${r2(ty)} ${r2(x0 + w - r)} ${r2(ty)}`) +
        `H${r2(x0 + (right ? r : r + 10))}` + (right ? `Q${r2(x0)} ${r2(ty)} ${r2(x0)} ${r2(ty - r)}` : `L${r2(tx - 6)} ${r2(ty + 14)}L${r2(x0)} ${r2(ty - r)}`) +
        `V${r2(y0 + r)}Q${r2(x0)} ${r2(y0)} ${r2(x0 + r)} ${r2(y0)}Z`;
      sa(o.bg, "d", d); sa(o.bg, "stroke", P.color); sa(o.bg, "fill", mix(C.bg, P.color, 0.14));
      let s = P.text; if (P.reveal < 1) s = Array.from(s).slice(0, Math.round(Array.from(s).length * P.reveal)).join("");
      const rtl = o.font === "ar", lines = wrapText(s, w - size * 1.6, size, o.font);
      sa(o.t, "font-size", r2(size)); sa(o.t, "fill", C.ink); sa(o.t, "text-anchor", "start");
      sa(o.t, "transform", `translate(${r2(rtl ? x0 + w - size * 0.8 : x0 + size * 0.8)} ${r2(y0 + h / 2)})`);
      setLines(o.t, lines.length ? lines : [""], r2(size), 1.35, o.font);
      if (p.label) { o.lb.textContent = p.label; sa(o.lb, "x", r2(right ? x0 + w : x0)); sa(o.lb, "y", r2(y0 - size * 0.7)); sa(o.lb, "text-anchor", right ? "end" : "start"); sa(o.lb, "font-size", r2(size * 0.7)); sa(o.lb, "fill", P.color); sa(o.lb, "direction", hasAr(p.label) ? "rtl" : "ltr"); }
    }
  };

  // attention-style arc between two x positions above a baseline
  PRIM.arc = {
    init: p => ({ x1: p.x1, x2: p.x2, y: p.y, h: p.h || Math.abs(p.x2 - p.x1) * 0.45, color: col(p.color || "gold"), w: p.w || 2.5, opacity: 1, draw: 1 }),
    make(o, g) { o.pth = mk("path", { fill: "none", "stroke-linecap": "round" }, g); },
    draw(o, P) {
      const a = [P.x1, P.y], b = [P.x2, P.y], c = [(P.x1 + P.x2) / 2, P.y - 2 * P.h * (o.prm.down ? -1 : 1)], t = clamp(P.draw);
      const e = quadAt(a, c, b, t), q = [a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t];
      sa(o.g, "opacity", r2(P.opacity));
      sa(o.pth, "d", `M${r2(a[0])} ${r2(a[1])}Q${r2(q[0])} ${r2(q[1])} ${r2(e[0])} ${r2(e[1])}`); sa(o.pth, "stroke", P.color); sa(o.pth, "stroke-width", r2(P.w));
    }
  };

  // numeric matrix / table with optional heat colors (blue negative, red positive)
  PRIM.matrix = {
    init(p) {
      const rows = p.data || [[0]], cw = p.cw || 74, ch = p.ch || 38;
      return Object.assign(base(p), { w: rows[0].length * cw, h: rows.length * ch, heat: p.heat != null ? p.heat : 0, hi: p.hi != null ? p.hi : -1 });
    },
    bounds: (o, P) => ({ hw: P.w / 2 * P.scale, hh: P.h / 2 * P.scale }),
    make(o, g) {
      const p = o.prm, rows = p.data || [[0]];
      o.cells = rows.map(r => r.map(() => [mk("rect", { rx: 4, "stroke-width": 1.6 }, g), mk("text", { "font-family": FF[p.font || "math"], "text-anchor": "middle", "dominant-baseline": "central" }, g)]));
      o.max = Math.max(1e-6, ...rows.flat().filter(v => typeof v === "number").map(Math.abs));
    },
    draw(o, P) {
      const p = o.prm, rows = p.data, cw = p.cw || 74, ch = p.ch || 38, gap = p.gap != null ? p.gap : 6, size = p.size || 20;
      sa(o.g, "transform", tf(P)); sa(o.g, "opacity", r2(P.opacity));
      const x0 = -P.w / 2, y0 = -P.h / 2;
      rows.forEach((r, i) => r.forEach((v, j) => {
        const [re, te] = o.cells[i][j], num = typeof v === "number";
        const tint = num ? (v >= 0 ? (p.pos || C.red) : (p.neg || C.blue)) : C.soft, k = num ? Math.abs(v) / o.max : 0;
        const rowHi = Math.round(P.hi) === i;
        sa(re, "x", r2(x0 + j * cw + gap / 2)); sa(re, "y", r2(y0 + i * ch + gap / 2)); sa(re, "width", r2(cw - gap)); sa(re, "height", r2(ch - gap));
        sa(re, "fill", mix(C.panel, tint, 0.65 * k * P.heat)); sa(re, "stroke", rowHi ? C.gold : mix(C.faint, C.soft, 0.4));
        te.textContent = num ? (p.dec != null ? v.toFixed(p.dec) : String(v)).replace("-", "−") : String(v);
        sa(te, "x", r2(x0 + j * cw + cw / 2)); sa(te, "y", r2(y0 + i * ch + ch / 2)); sa(te, "font-size", size); sa(te, "fill", C.ink);
      }));
    }
  };

  // loop ring with arrowheads (agent loops, feedback cycles)
  PRIM.ring = {
    init: p => Object.assign(base(p), { r: p.r || 120, color: col(p.color || "teal"), w: p.w || 4, draw: 1, spin: 0 }),
    bounds: (o, P) => ({ hw: P.r * P.scale, hh: P.r * P.scale, round: true }),
    make(o, g) {
      o.c = mk("path", { fill: "none", "stroke-linecap": "round", pathLength: 1 }, g);
      o.hs = Array.from({ length: o.prm.arrows != null ? o.prm.arrows : 3 }, () => mk("path", {}, g));
    },
    draw(o, P, getP, tm) {
      const r = P.r, n = o.hs.length, t = clamp(P.draw);
      const ambient = o.prm.speed != null ? o.prm.speed : (o.prm.idle !== false && n > 0 ? 12 : 0);
      const rot = P.spin + (t > 0.95 ? ((tm || 0) - o.born) * ambient : 0);
      sa(o.g, "transform", `translate(${r2(P.x)} ${r2(P.y)}) rotate(${r2(rot)}) scale(${r2(P.scale)})`); sa(o.g, "opacity", r2(P.opacity));
      sa(o.c, "d", `M0 ${-r}A${r} ${r} 0 1 1 0 ${r}A${r} ${r} 0 1 1 0 ${-r}`); sa(o.c, "stroke", P.color); sa(o.c, "stroke-width", r2(P.w));
      sa(o.c, "stroke-dasharray", `${r2(t)} 1`);
      const hs = 8 + P.w * 2;
      o.hs.forEach((h, i) => {
        const fr = (i + 1) / n - 0.5 / n, ang = fr * 2 * Math.PI - Math.PI / 2, px = Math.cos(ang) * r, py = Math.sin(ang) * r, d = [-Math.sin(ang), Math.cos(ang)], nn = [-d[1], d[0]];
        sa(h, "d", `M${r2(px + d[0] * hs * 0.5)} ${r2(py + d[1] * hs * 0.5)}L${r2(px - d[0] * hs * 0.5 + nn[0] * hs * 0.5)} ${r2(py - d[1] * hs * 0.5 + nn[1] * hs * 0.5)}L${r2(px - d[0] * hs * 0.5 - nn[0] * hs * 0.5)} ${r2(py - d[1] * hs * 0.5 - nn[1] * hs * 0.5)}Z`);
        sa(h, "fill", P.color); sa(h, "opacity", t >= fr ? 1 : 0);
      });
    }
  };

  PRIM.num = {
    init: p => Object.assign(base(p), { v: p.v || 0, color: col(p.color || "ink"), size: p.size || 48 }),
    bounds: (o, P) => ({ hw: P.size * 1.2 * P.scale, hh: P.size * 0.6 * P.scale }),
    make(o, g) { o.t = mk("text", { "font-family": FF[o.prm.font || "math"], "text-anchor": anchorOf(o.prm.anchor, false), "dominant-baseline": "central", "font-weight": o.prm.weight || 400 }, g); },
    draw(o, P) {
      const p = o.prm, dec = p.dec || 0;
      let s = Math.abs(P.v) >= 1000 && p.comma !== false ? P.v.toFixed(dec).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : P.v.toFixed(dec);
      o.t.textContent = (p.pre || "") + s.replace("-", "−") + (p.suf || "");
      sa(o.g, "transform", tf(P)); sa(o.g, "opacity", r2(P.opacity)); sa(o.t, "font-size", r2(P.size)); sa(o.t, "fill", P.color);
    }
  };

  // curly brace spanning x1..x2 at y, opening down (label below) or up
  PRIM.brace = {
    init: p => ({ x1: p.x1, x2: p.x2, y: p.y, color: col(p.color || "soft"), opacity: 1, draw: 1, label: p.label || "" }),
    make(o, g) {
      o.pth = mk("path", { fill: "none", "stroke-width": 2.5, "stroke-linecap": "round", "stroke-linejoin": "round", pathLength: 1 }, g);
      o.lb = mk("text", { "font-family": FF[fontOf(o.prm.label || "", o.prm.font)], "text-anchor": "middle", "dominant-baseline": "central", "font-weight": hasAr(o.prm.label || "") ? 600 : 400 }, g);
    },
    draw(o, P) {
      const up = o.prm.dir === "up", s = up ? -1 : 1, d = 16, x1 = P.x1, x2 = P.x2, y = P.y, m = (x1 + x2) / 2;
      sa(o.g, "opacity", r2(P.opacity));
      sa(o.pth, "d", `M${r2(x1)} ${r2(y)}Q${r2(x1)} ${r2(y + d * s)} ${r2(x1 + d)} ${r2(y + d * s)}H${r2(m - d)}Q${r2(m)} ${r2(y + d * s)} ${r2(m)} ${r2(y + 2 * d * s)}Q${r2(m)} ${r2(y + d * s)} ${r2(m + d)} ${r2(y + d * s)}H${r2(x2 - d)}Q${r2(x2)} ${r2(y + d * s)} ${r2(x2)} ${r2(y)}`);
      sa(o.pth, "stroke", P.color); sa(o.pth, "stroke-dasharray", `${r2(clamp(P.draw))} 1`);
      o.lb.textContent = P.label; sa(o.lb, "x", r2(m)); sa(o.lb, "y", r2(y + (2 * d + 24) * s)); sa(o.lb, "fill", P.color); sa(o.lb, "font-size", o.prm.size || 26);
      sa(o.lb, "opacity", r2(clamp((P.draw - 0.5) * 2))); sa(o.lb, "direction", hasAr(P.label) ? "rtl" : "ltr");
    }
  };

  PRIM.gauge = {
    init: p => Object.assign(base(p), { r: p.r || 100, v: p.v != null ? p.v : 0.5, color: col(p.color || "teal"), label: p.label || "" }),
    bounds: (o, P) => ({ hw: P.r * P.scale, hh: P.r * 0.6 * P.scale }),
    make(o, g) {
      o.tr = mk("path", { fill: "none", "stroke-width": 16, "stroke-linecap": "round", stroke: C.grid }, g);
      o.fl = mk("path", { fill: "none", "stroke-width": 16, "stroke-linecap": "round", pathLength: 1 }, g);
      o.nd = mk("line", { "stroke-width": 4, "stroke-linecap": "round", stroke: C.ink }, g);
      o.lb = mk("text", { "font-family": FF[fontOf(o.prm.label || "", o.prm.font)], "text-anchor": "middle", "dominant-baseline": "central", "font-weight": 600 }, g);
    },
    draw(o, P) {
      const r = P.r, arc = `M${-r} 0A${r} ${r} 0 0 1 ${r} 0`, a = Math.PI * (1 - clamp(P.v));
      sa(o.g, "transform", tf(P)); sa(o.g, "opacity", r2(P.opacity));
      sa(o.tr, "d", arc); sa(o.fl, "d", arc); sa(o.fl, "stroke", P.color); sa(o.fl, "stroke-dasharray", `${r2(clamp(P.v))} 1`);
      sa(o.nd, "x1", 0); sa(o.nd, "y1", 0); sa(o.nd, "x2", r2(Math.cos(a) * r * 0.78)); sa(o.nd, "y2", r2(-Math.sin(a) * r * 0.78));
      o.lb.textContent = P.label; sa(o.lb, "y", r2(r * 0.4)); sa(o.lb, "font-size", o.prm.size || 26); sa(o.lb, "fill", C.soft); sa(o.lb, "direction", hasAr(P.label) ? "rtl" : "ltr");
    }
  };

  PRIM.path = {
    init: p => Object.assign(base(Object.assign({ x: 0, y: 0 }, p)), { color: col(p.color || "soft"), w: p.w || 3, draw: 1, fill: col(p.fill || "none") }),
    make(o, g) { o.pth = mk("path", { d: o.prm.d, "stroke-linecap": "round", "stroke-linejoin": "round" }, g); if (!o.prm.dash) o.pth.setAttribute("pathLength", 1); else o.pth.setAttribute("stroke-dasharray", o.prm.dash); },
    draw(o, P) {
      sa(o.g, "transform", tf(P)); sa(o.g, "opacity", r2(P.opacity));
      sa(o.pth, "stroke", P.color); sa(o.pth, "stroke-width", r2(P.w)); sa(o.pth, "fill", P.fill);
      if (!o.prm.dash) sa(o.pth, "stroke-dasharray", `${r2(clamp(P.draw))} 1`);
    }
  };

  // pill badge: compact status tag (PASS / FAIL / O(n²) / 429)
  PRIM.badge = {
    init(p) {
      const size = p.size || 22, font = fontOf(p.text || "", p.font || (hasAr(p.text || "") ? "ar" : "ui"));
      const w = p.w || Math.max(88, textW(p.text || "", size, font, 700) + size * 1.9);
      const h = p.h || size * 1.85;
      return Object.assign(base(p), { w, h, text: String(p.text || ""), color: col(p.color || "gold"), size });
    },
    bounds: (o, P) => ({ hw: P.w / 2 * P.scale, hh: P.h / 2 * P.scale }),
    make(o, g) {
      o.font = fontOf(o.prm.text || "", o.prm.font || (hasAr(o.prm.text || "") ? "ar" : "ui"));
      o.bg = mk("rect", { "stroke-width": 2 }, g);
      o.t = mk("text", { "font-family": FF[o.font] || o.font, "text-anchor": "middle", "dominant-baseline": "central", "font-weight": 700 }, g);
    },
    draw(o, P) {
      const w = P.w, h = P.h;
      sa(o.g, "transform", tf(P)); sa(o.g, "opacity", r2(P.opacity));
      sa(o.bg, "x", r2(-w / 2)); sa(o.bg, "y", r2(-h / 2)); sa(o.bg, "width", r2(w)); sa(o.bg, "height", r2(h)); sa(o.bg, "rx", r2(h / 2));
      sa(o.bg, "stroke", P.color); sa(o.bg, "fill", mix(C.bg, P.color, 0.2));
      o.t.textContent = P.text; sa(o.t, "fill", P.color); sa(o.t, "font-size", r2(P.size)); sa(o.t, "direction", hasAr(P.text) ? "rtl" : "ltr");
    }
  };

  // animated data curve chart with axes & optional shaded area (pts: [[0..1, 0..1], ...])
  PRIM.curve = {
    init: p => Object.assign(base(p), { w: p.w || 660, h: p.h || 340, color: col(p.color || "teal"), draw: 1, strokeW: p.sw || 4 }),
    bounds: (o, P) => ({ hw: P.w / 2 * P.scale, hh: P.h / 2 * P.scale }),
    make(o, g) {
      const p = o.prm;
      o.gd = mk("path", { fill: "none", stroke: C.grid, "stroke-width": 1.2 }, g);
      o.ax = mk("path", { fill: "none", stroke: C.soft, "stroke-width": 2, "stroke-linecap": "round" }, g);
      o.ar = mk("path", { stroke: "none" }, g);
      o.ln = mk("path", { fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round", pathLength: 1 }, g);
      o.tip = mk("circle", { r: 7 }, g);
      o.xl = mk("text", { "font-family": FF[fontOf(p.xlabel || "", "math")], "text-anchor": "middle", "dominant-baseline": "central", fill: C.dim }, g);
      o.yl = mk("text", { "font-family": FF[fontOf(p.ylabel || "", "math")], "text-anchor": "middle", "dominant-baseline": "central", fill: C.dim }, g);
    },
    draw(o, P) {
      const p = o.prm, w = P.w, h = P.h, x0 = -w / 2, y0 = h / 2, pts = p.pts || [[0, 0.1], [0.5, 0.6], [1, 0.9]];
      sa(o.g, "transform", tf(P)); sa(o.g, "opacity", r2(P.opacity));
      let gd = "";
      for (let i = 1; i <= 4; i++) { const y = y0 - h * i / 4; gd += `M${r2(x0)} ${r2(y)}H${r2(x0 + w)}`; }
      sa(o.gd, "d", gd);
      sa(o.ax, "d", `M${r2(x0)} ${r2(y0 - h)}V${r2(y0)}H${r2(x0 + w)}`);
      const map = ([nx, ny]) => [x0 + nx * w, y0 - ny * h];
      const sp = pts.map(map);
      const d = sp.map((q, i) => (i ? "L" : "M") + `${r2(q[0])} ${r2(q[1])}`).join("");
      const t = clamp(P.draw);
      sa(o.ln, "d", d); sa(o.ln, "stroke", P.color); sa(o.ln, "stroke-width", r2(P.strokeW)); sa(o.ln, "stroke-dasharray", `${r2(t)} 1`);
      if (p.fillArea !== false && sp.length >= 2) {
        const ad = d + `L${r2(sp[sp.length - 1][0])} ${r2(y0)}L${r2(sp[0][0])} ${r2(y0)}Z`;
        sa(o.ar, "d", ad); sa(o.ar, "fill", P.color); sa(o.ar, "opacity", r2(0.14 * t));
      } else sa(o.ar, "opacity", 0);
      const idxF = t * (sp.length - 1), i0 = Math.min(sp.length - 2, Math.floor(idxF)), fr = idxF - i0;
      const tip = sp.length >= 2 ? [sp[i0][0] + (sp[i0 + 1][0] - sp[i0][0]) * fr, sp[i0][1] + (sp[i0 + 1][1] - sp[i0][1]) * fr] : sp[0];
      sa(o.tip, "cx", r2(tip[0])); sa(o.tip, "cy", r2(tip[1])); sa(o.tip, "fill", P.color); sa(o.tip, "opacity", t > 0.03 ? 1 : 0);
      if (p.xlabel) { o.xl.textContent = p.xlabel; sa(o.xl, "x", 0); sa(o.xl, "y", r2(y0 + 34)); sa(o.xl, "font-size", 24); }
      if (p.ylabel) { o.yl.textContent = p.ylabel; sa(o.yl, "x", r2(x0)); sa(o.yl, "y", r2(y0 - h - 26)); sa(o.yl, "font-size", 24); }
    }
  };

  // ---------------------------------------------------------------- film building (pure data)
  const LEAD = 0.2, TAIL = 0.35, SEC_LEAD = 0.32, END_HOLD = 1.5;
  const DEF_IN = { text: "rise", box: "pop", arrow: "draw", dot: "pop", plane: "fade", vec: "draw", bar: "grow", icon: "pop", doc: "pop", code: "type", bubble: "pop", arc: "draw", matrix: "fade", ring: "draw", num: "fade", brace: "draw", gauge: "fade", path: "draw", badge: "pop", curve: "draw" };

  class Obj {
    constructor(film, type, id, prm, born) {
      this.film = film; this.type = type; this.id = id; this.prm = prm; this.born = born; this.dead = Infinity;
      this.idx = film.objs.length; this.z = prm.z || 0;
      film.objs.push(this); film.byId[id] = this;
      this.init = PRIM[type].init(prm);
      this.L = Object.assign({}, this.init);
      this.tracks = {};
    }
    tw(prop, t0, t1, to, ease) { (this.tracks[prop] || (this.tracks[prop] = [])).push({ t0, t1: Math.max(t1, t0), to, e: ease || E.io }); this.L[prop] = to; }
  }
  const COLOR_PROPS = new Set(["color", "stroke", "fill", "lc", "ic", "subc", "hc", "gc", "ac"]);
  const centerOf = L => [L.x != null ? L.x : ((L.x1 + L.x2) / 2), L.y != null ? L.y : ((L.y1 + L.y2) / 2)];

  class Ctx {
    constructor(film, T, vd) { this.f = film; this.T = T; this.vd = vd; this.c = 0; this.end = 0; this.W = W; this.H = H; this.C = C; }
    _rel(o) { let a = o && o.at != null ? o.at : this.c; if (typeof a === "string") a = parseFloat(a) / 100 * (LEAD + this.vd); return a; }
    _t(o) { return this.T + this._rel(o); }
    _mark(t1) { this.end = Math.max(this.end, t1 - this.T); }
    get voice() { return this.vd; }
    wait(d) { this.c += d; return this; }
    at(a) { this.c = typeof a === "string" ? parseFloat(a) / 100 * (LEAD + this.vd) : a; return this; }
    get(id) { const o = this.f.byId[id]; return o ? o.L : null; }
    sel(q) {
      const out = [];
      (Array.isArray(q) ? q : [q]).forEach(s => {
        if (s instanceof Obj) { out.push(s); return; }
        if (typeof s !== "string") return;
        if (s.endsWith("*")) { const pre = s.slice(0, -1); this.f.objs.forEach(o => { if (o.id.startsWith(pre) && o.dead === Infinity && this.f.byId[o.id] === o) out.push(o); }); }
        else { const o = this.f.byId[s]; if (o && o.dead === Infinity) out.push(o); }
      });
      return [...new Set(out)];
    }
    _make(type, id, prm, o) {
      o = o || {};
      prm = Object.assign({}, prm);
      if (o.z != null) prm.z = o.z;
      const t0 = this._t(o), ob = new Obj(this.f, type, id, prm, t0), I = ob.init;
      const how = o.in || DEF_IN[type] || "fade";
      const dur = o.dur != null ? o.dur : ({ draw: 0.9, type: 1.4, grow: 0.8, write: 1 }[how] || 0.6);
      const ease = E[o.ease] || null, set = (k, from) => { const to = ob.init[k]; I[k] = from; ob.tw(k, t0, t0 + dur, to, ease || E.out); };
      if (prm.from && ob.from == null) ob.from = this.f.byId[prm.from] || null;
      if (prm.to && ob.to == null) ob.to = this.f.byId[prm.to] || null;
      if (type === "vec") ob.plane = this.f.byId[prm.plane];
      if (how === "fade") set("opacity", 0);
      else if (how === "rise") { set("opacity", 0); if ("y" in I) set("y", I.y + 26); }
      else if (how === "drop") { set("opacity", 0); if ("y" in I) set("y", I.y - 26); }
      else if (how === "pop") { set("opacity", 0); const to = I.scale; I.scale = to * 0.6; ob.tw("scale", t0, t0 + dur, to, ease || E.back); }
      else if (how === "grow") {
        if (type === "bar") set("v", 0);
        else if (type === "matrix" || type === "gauge") set("opacity", 0);
        else { const to = I.scale; I.scale = 0.001; ob.tw("scale", t0, t0 + dur, to, ease || E.back); }
      }
      else if (how === "draw") {
        if ("draw" in I) set("draw", 0); else set("opacity", 0);
        if (type === "box") { I.lo = 0; ob.tw("lo", t0 + dur * 0.5, t0 + dur, 1, E.out); }
        if (type === "arrow" || type === "vec" || type === "arc") ob.tracks.draw[0].e = ease || E.io;
      }
      else if (how === "type") { if ("reveal" in I) { I.reveal = 0; ob.tw("reveal", t0, t0 + dur, 1, E.lin); } else set("opacity", 0); }
      else if (how === "slide") {
        const fr = o.from || { dx: -60 };
        set("opacity", 0);
        if (fr.dx) set("x", I.x + fr.dx); if (fr.dy) set("y", I.y + fr.dy);
      }
      else if (how === "none") { /* instant */ }
      if (o.glow) { ob.tw("glow", t0, t0 + dur, o.glow, E.out); }
      this._mark(t0 + dur);
      return id;
    }
    // ---- creators
    text(id, p, o) { return this._make("text", id, p, o); }
    box(id, p, o) { return this._make("box", id, p, o); }
    zone(id, p, o) { return this._make("box", id, Object.assign({ color: "faint", fill: "panel", fop: 0.35, dash: "10 9", lp: "top", size: 28, sw: 2, z: -1, r: 22 }, p), Object.assign({ in: "fade" }, o)); }
    arrow(id, p, o) { return this._make("arrow", id, p, o); }
    line(id, p, o) { return this._make("arrow", id, Object.assign({ head: false }, p), o); }
    link(id, a, b, p, o) { return this._make("arrow", id, Object.assign({ from: a, to: b }, p), o); }
    dot(id, p, o) { return this._make("dot", id, p, o); }
    plane(id, p, o) { return this._make("plane", id, Object.assign({ z: -1 }, p), o); }
    vec(id, p, o) { return this._make("vec", id, p, o); }
    bar(id, p, o) { return this._make("bar", id, p, o); }
    icon(id, p, o) { return this._make("icon", id, p, o); }
    doc(id, p, o) { return this._make("doc", id, p, o); }
    code(id, p, o) { return this._make("code", id, p, o); }
    bubble(id, p, o) { return this._make("bubble", id, p, o); }
    arc(id, p, o) { return this._make("arc", id, p, o); }
    matrix(id, p, o) { return this._make("matrix", id, p, o); }
    ring(id, p, o) { return this._make("ring", id, p, o); }
    num(id, p, o) { return this._make("num", id, p, o); }
    brace(id, p, o) { return this._make("brace", id, p, o); }
    gauge(id, p, o) { return this._make("gauge", id, p, o); }
    path(id, p, o) { return this._make("path", id, p, o); }
    badge(id, p, o) { return this._make("badge", id, p, o); }
    curve(id, p, o) { return this._make("curve", id, p, o); }
    // ---- motion
    to(sel, props, o) {
      o = o || {};
      const obs = this.sel(sel), t0b = this._t(o), dur = o.dur != null ? o.dur : 0.9, st = o.st || 0, ease = E[o.ease || "io"];
      obs.forEach((ob, k) => {
        const t0 = t0b + k * st, t1 = t0 + dur;
        for (let [p, v] of Object.entries(props)) {
          if (typeof v === "function") v = v(ob.L[p], k, ob);
          if (p === "dx") { ob.tw("x", t0, t1, ob.L.x + v, ease); continue; }
          if (p === "dy") { ob.tw("y", t0, t1, ob.L.y + v, ease); continue; }
          if (p === "v" && Array.isArray(v)) { ob.tw("vx", t0, t1, v[0], ease); ob.tw("vy", t0, t1, v[1], ease); continue; }
          if (COLOR_PROPS.has(p)) v = col(v);
          ob.tw(p, t0, t1, v, ease);
        }
        this._mark(t1);
      });
      return this;
    }
    out(sel, o) {
      o = o || {};
      const obs = this.sel(sel), t0b = this._t(o), dur = o.dur != null ? o.dur : 0.5, st = o.st || 0, how = o.how || "fade";
      obs.forEach((ob, k) => {
        const t0 = t0b + k * st, t1 = t0 + dur;
        ob.tw("opacity", t0, t1, 0, E.io);
        if (how === "shrink" && "scale" in ob.L) ob.tw("scale", t0, t1, ob.L.scale * 0.6, E.in);
        if (how === "up" && "y" in ob.L) ob.tw("y", t0, t1, ob.L.y - 40, E.in);
        if (how === "down" && "y" in ob.L) ob.tw("y", t0, t1, ob.L.y + 40, E.in);
        if (how === "undraw" && "draw" in ob.L) ob.tw("draw", t0, t1, 0, E.io);
        ob.dead = t1;
        this._mark(t1);
      });
      return this;
    }
    clear(o) {
      o = o || {};
      const keep = new Set(this.sel(o.keep || []));
      if (o.resetCam !== false && (this.f.cam.L.z !== 1 || this.f.cam.L.x !== W / 2 || this.f.cam.L.y !== H / 2)) {
        this.cam({ x: W / 2, y: H / 2, z: 1 }, { at: this._rel(o), dur: o.dur != null ? Math.max(0.45, o.dur) : 0.6 });
      }
      return this.out(this.f.objs.filter(ob => ob.dead === Infinity && !keep.has(ob) && this.f.byId[ob.id] === ob), Object.assign({ dur: 0.45 }, o));
    }
    pulse(sel, o) {
      o = o || {};
      const t0 = this._t(o), d = o.dur || 0.9, g = o.glow != null ? o.glow : 1;
      this.sel(sel).forEach(ob => {
        if ("glow" in ob.L) { const g0 = ob.L.glow; ob.tw("glow", t0, t0 + d * 0.35, g, E.out); ob.tw("glow", t0 + d * 0.35, t0 + d, o.keep ? g : g0, E.io); }
        if ("scale" in ob.L) { const s0 = ob.L.scale; ob.tw("scale", t0, t0 + d * 0.35, s0 * (o.s || 1.08), E.out); ob.tw("scale", t0 + d * 0.35, t0 + d, s0, E.io); }
        if (o.color) ob.tw(ob.type === "box" ? "stroke" : "color", t0, t0 + d * 0.3, col(o.color), E.out);
        this._mark(t0 + d);
      });
      return this;
    }
    // packet(s) travelling from a to b (object ids or [x, y])
    flow(a, b, o) {
      o = o || {};
      const n = o.n || 1, gap = o.gap != null ? o.gap : 0.22, dur = o.dur || 0.9;
      const pt = q => { if (Array.isArray(q)) return q; const ob = this.f.byId[q]; return centerOf(ob.L); };
      let A = pt(a), B = pt(b);
      if (!Array.isArray(a)) { const ob = this.f.byId[a]; if (PRIM[ob.type].bounds) A = clipTo(ob, ob.L, B, 0); }
      if (!Array.isArray(b)) { const ob = this.f.byId[b]; if (PRIM[ob.type].bounds) B = clipTo(ob, ob.L, A, 0); }
      for (let i = 0; i < n; i++) {
        const id = "_f" + (this.f.uid2++), t0 = this._t(o) + i * gap;
        const ob = new Obj(this.f, "dot", id, { x: A[0], y: A[1], r: o.r || 8, color: o.color || "gold", halo: true, z: 5 }, t0);
        ob.init.opacity = 0;
        ob.tw("opacity", t0, t0 + 0.12, 1, E.out);
        if (o.bend) {
          const steps = 12, L = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1, cpt = [(A[0] + B[0]) / 2 - (B[1] - A[1]) / L * o.bend * L, (A[1] + B[1]) / 2 + (B[0] - A[0]) / L * o.bend * L];
          for (let k = 1; k <= steps; k++) { const q = quadAt(A, cpt, B, E.io(k / steps)); ob.tw("x", t0 + dur * (k - 1) / steps, t0 + dur * k / steps, q[0], E.lin); ob.tw("y", t0 + dur * (k - 1) / steps, t0 + dur * k / steps, q[1], E.lin); }
        } else { ob.tw("x", t0, t0 + dur, B[0], E.io); ob.tw("y", t0, t0 + dur, B[1], E.io); }
        ob.tw("opacity", t0 + dur - 0.05, t0 + dur + 0.15, 0, E.io);
        ob.dead = t0 + dur + 0.15;
        this._mark(ob.dead);
      }
      return this;
    }
    cam(props, o) {
      o = o || {};
      const t0 = this._t(o), t1 = t0 + (o.dur != null ? o.dur : 1.2), cam = this.f.cam;
      for (const [k, v] of Object.entries(props)) { (cam.tracks[k] || (cam.tracks[k] = [])).push({ t0, t1, to: v, e: E[o.ease || "io"] }); cam.L[k] = v; }
      this._mark(t1);
      return this;
    }
    // Continuous multi-packet stream from a to b across a duration (keeps diagrams alive during narration)
    stream(a, b, o) {
      o = o || {};
      const span = o.span != null ? o.span : Math.max(1.4, this.vd * 0.55);
      const every = o.every || 0.48, n = Math.max(2, Math.min(10, Math.round(span / every)));
      return this.flow(a, b, Object.assign({ n, gap: every, dur: o.dur || 0.85 }, o));
    }
    // 3Blue1Brown spotlight: dim unrelated live objects, highlight target(s), optionally gently zoom camera
    focus(sel, o) {
      o = o || {};
      const targets = new Set(this.sel(sel));
      if (!targets.size) return this;
      const keep = new Set(this.sel(o.keep || []));
      const dim = o.dim != null ? o.dim : 0.24, t0 = this._rel(o), dur = o.dur != null ? o.dur : 0.55;
      const others = this.f.objs.filter(ob => ob.dead === Infinity && this.f.byId[ob.id] === ob && !targets.has(ob) && !keep.has(ob) && ob.type !== "plane" && !ob.id.startsWith("_"));
      if (others.length) this.to(others, { opacity: dim }, { at: t0, dur });
      this.to([...targets], { opacity: 1 }, { at: t0, dur });
      this.pulse([...targets], { at: t0 + 0.05, dur: Math.max(0.7, dur), glow: o.glow != null ? o.glow : 1, keep: o.keepGlow !== false, s: o.s || 1.04, color: o.color });
      if (o.zoom && o.zoom > 1) {
        let sx = 0, sy = 0, cnt = 0;
        targets.forEach(ob => { const c = centerOf(ob.L); sx += c[0]; sy += c[1]; cnt++; });
        if (cnt) {
          const z = clamp(o.zoom, 1, 1.45), cx = clamp(sx / cnt, W / 2 / z + 80, W - W / 2 / z - 80), cy = clamp(sy / cnt, 210 + (H - 210) / 2 / z - 80, H - (H - 210) / 2 / z + 40);
          this.cam({ x: cx, y: cy, z }, { at: t0, dur: Math.max(0.85, dur) });
        }
      }
      return this;
    }
    unfocus(o) {
      o = o || {};
      const t0 = this._rel(o), dur = o.dur != null ? o.dur : 0.6;
      const live = this.f.objs.filter(ob => ob.dead === Infinity && this.f.byId[ob.id] === ob && !ob.id.startsWith("_"));
      if (live.length) this.to(live, { opacity: 1 }, { at: t0, dur });
      live.forEach(ob => { if ("glow" in ob.L && ob.L.glow > 0) this.to(ob, { glow: 0 }, { at: t0, dur }); });
      this.cam({ x: W / 2, y: H / 2, z: 1 }, { at: t0, dur: Math.max(0.8, dur) });
      return this;
    }
    // Floating pill callout badge
    callout(id, p, o) {
      const c = col(p.color || "gold");
      return this.box(id, Object.assign({ h: 52, r: 26, size: 23, color: c, lc: "ink", fill: mix(C.bg, c, 0.2), sw: 2, inline: true, pad: 22 }, p), Object.assign({ in: "pop" }, o));
    }
    // Clean plotted axes + animated smooth curve(s): p = { x, y, w, h, xl, yl, curves: [[d_or_pts, color, label?], ...] }
    chart(pre, p, o) {
      p = Object.assign({ x: 800, y: 550, w: 720, h: 380 }, p); o = Object.assign({}, o);
      const t0 = this._rel(o), x0 = p.x - p.w / 2, y0 = p.y + p.h / 2, x1 = p.x + p.w / 2, y1 = p.y - p.h / 2;
      this.line(pre + "_ax", { x1: x0, y1: y0, x2: x1, y2: y0, color: "soft", w: 2.5 }, { at: t0, dur: 0.45 });
      this.line(pre + "_ay", { x1: x0, y1: y0, x2: x0, y2: y1, color: "soft", w: 2.5 }, { at: t0, dur: 0.45 });
      if (p.xl) this.note(pre + "_xl", { text: p.xl, x: p.x, y: y0 + 36, font: hasAr(p.xl) ? "ar" : "math", size: 24, color: "dim" }, { at: t0 + 0.2 });
      if (p.yl) this.note(pre + "_yl", { text: p.yl, x: x0, y: y1 - 28, font: hasAr(p.yl) ? "ar" : "math", size: 24, color: "dim" }, { at: t0 + 0.2 });
      (p.curves || []).forEach(([pts, c, lbl], ci) => {
        const d = typeof pts === "string" ? pts : pts.map(([u, v], i) => `${i ? "L" : "M"}${r2(x0 + u * p.w)} ${r2(y0 - v * p.h)}`).join(" ");
        this.path(pre + "_c" + ci, { d, color: c || "teal", w: 4 }, { at: t0 + 0.35 + ci * 0.35, dur: o.dur || 1.2 });
        if (lbl && Array.isArray(pts) && pts.length) {
          const last = pts[pts.length - 1];
          this.note(pre + "_cl" + ci, { text: lbl, x: r2(x0 + last[0] * p.w + 14), y: r2(y0 - last[1] * p.h), anchor: "l", color: c || "teal", size: 22, font: hasAr(lbl) ? "ar" : "math" }, { at: t0 + 1.1 + ci * 0.35 });
        }
      });
      return pre;
    }
    P(planeId, vx, vy) { const pl = this.f.byId[planeId]; const p = planeMap(pl.L, pl.prm, vx, vy); return { x: p[0], y: p[1] }; }
    tw(text, size, font, weight) { return textW(text, size, font, weight); }
    // ---- layout helpers (each returns the ids it created)
    row(pre, labels, p, o) {
      p = Object.assign({}, p); o = Object.assign({}, o);
      const size = p.size || 34, font = p.font, gap = p.gap != null ? p.gap : 14, pad = p.pad != null ? p.pad : size * 0.45;
      const ws = labels.map(l => p.w || Math.max(p.minW || size * 1.6, textW(l, size, fontOf(l, font), p.weight) + pad * 2));
      const total = ws.reduce((a, b) => a + b, 0) + gap * (labels.length - 1);
      let x = (p.x != null ? p.x : 800) - total / 2;
      const order = p.rtl ? labels.map((_, i) => labels.length - 1 - i) : labels.map((_, i) => i);
      const xs = []; order.forEach(i => { xs[i] = x + ws[i] / 2; x += ws[i] + gap; });
      const t0 = this._rel(o), st = o.st != null ? o.st : 0.07;
      const colors = p.colors || [];
      return labels.map((l, i) => this.box(pre + i, Object.assign({}, p, { x: xs[i], w: ws[i], h: p.h || size * 1.7, label: l, pad, color: colors[i] || p.color }), Object.assign({}, o, { at: t0 + i * st })));
    }
    col(pre, labels, p, o) {
      p = Object.assign({}, p); o = Object.assign({}, o);
      const size = p.size || 30, h = p.h || size * 1.7, gap = p.gap != null ? p.gap : 16, n = labels.length;
      const y0 = (p.y != null ? p.y : 530) - ((n - 1) * (h + gap)) / 2, t0 = this._rel(o), st = o.st != null ? o.st : 0.08;
      const w = p.w || Math.max(...labels.map(l => textW(l, size, fontOf(l, p.font), p.weight))) + size * 1.8 + (p.icon || p.icons ? size * 1.4 : 0);
      const colors = p.colors || [], icons = p.icons || [];
      return labels.map((l, i) => this.box(pre + i, Object.assign({}, p, { y: y0 + i * (h + gap), w, h, label: l, color: colors[i] || p.color, icon: icons[i] || p.icon, inline: true }), Object.assign({}, o, { at: t0 + i * st })));
    }
    // boxes connected by arrows: pre0 → pre1 → …  (arrow ids: pre + "_" + i)
    chain(pre, labels, p, o) {
      p = Object.assign({ gap: 90 }, p); o = Object.assign({}, o);
      const vertical = !!p.vertical, n = labels.length, icons = p.icons || [], subs = p.subs || [], colors = p.colors || [];
      const size = p.size || 28, t0 = this._rel(o), st = o.st != null ? o.st : 0.32;
      const ws = labels.map((l, i) => p.w || Math.max(p.minW || 0, textW(l, size, fontOf(l, p.font), p.weight) + size * 1.8, icons[i] ? 150 : 0));
      const hh = p.h || (icons.some(Boolean) ? 150 : size * 2.2);
      const total = vertical ? n * hh + (n - 1) * p.gap : ws.reduce((a, b) => a + b, 0) + p.gap * (n - 1);
      let cur = (vertical ? (p.y != null ? p.y : 530) : (p.x != null ? p.x : 800)) - total / 2;
      const bps = [], order = labels.map((_, i) => p.rtl ? n - 1 - i : i);
      order.forEach(i => {
        const len = vertical ? hh : ws[i], c = cur + len / 2; cur += len + p.gap;
        const bp = Object.assign({}, p, { label: labels[i], w: ws[i], h: hh, icon: icons[i], sub: subs[i], color: colors[i] || p.color });
        if (vertical) { bp.x = p.x != null ? p.x : 800; bp.y = c; } else { bp.x = c; bp.y = p.y != null ? p.y : 530; }
        delete bp.gap; delete bp.labels;
        bps[i] = bp;
      });
      bps.forEach((bp, i) => this.box(pre + i, bp, Object.assign({}, o, { at: t0 + i * st })));
      for (let i = 0; i < n - 1; i++) this.link(pre + "_" + i, pre + i, pre + (i + 1), { color: p.ac || "dim", w: 3, gap: 10, label: (p.labels || [])[i], pulse: p.pulse }, { at: t0 + (i + 0.7) * st, dur: 0.5 });
      return labels.map((_, i) => pre + i);
    }
    // satellites around a center object: pre0..preN + spokes pre + "_" + i
    hub(center, pre, labels, p, o) {
      p = Object.assign({}, p); o = Object.assign({}, o);
      const c = this.get(center), n = labels.length, rx = p.rx || p.r || 300, ry = p.ry || p.r * 0.72 || 220, a0 = p.a0 != null ? p.a0 : -90;
      const t0 = this._rel(o), st = o.st != null ? o.st : 0.12, icons = p.icons || [], colors = p.colors || [], subs = p.subs || [];
      labels.forEach((l, i) => {
        const ang = (a0 + i * 360 / n) * Math.PI / 180;
        this.box(pre + i, Object.assign({}, p, { x: c.x + Math.cos(ang) * rx, y: c.y + Math.sin(ang) * ry, label: l, icon: icons[i], color: colors[i] || p.color, sub: subs[i] }), Object.assign({}, o, { at: t0 + i * st }));
        if (p.spokes !== false) this.link(pre + "_" + i, center, pre + i, { color: p.ac || colors[i] || "faint", w: 2.5, head: !!p.head, tail: !!p.tail, dash: p.dash, gap: 6, pulse: p.pulse }, { at: t0 + i * st + 0.1, dur: 0.5 });
      });
      return labels.map((_, i) => pre + i);
    }
    // two dashed panels side by side: pre + "L" / pre + "R"
    versus(pre, left, right, p, o) {
      p = Object.assign({ y: 545, w: 650, h: 560, gap: 70 }, p);
      const cl = p.colors ? p.colors[0] : "blue", cr = p.colors ? p.colors[1] : "orange", dx = (p.w + p.gap) / 2, t0 = this._rel(o);
      this.zone(pre + "L", { x: 800 - dx, y: p.y, w: p.w, h: p.h, label: left, color: cl, lc: cl, size: 30 }, Object.assign({}, o, { at: t0 }));
      this.zone(pre + "R", { x: 800 + dx, y: p.y, w: p.w, h: p.h, label: right, color: cr, lc: cr, size: 30 }, Object.assign({}, o, { at: t0 + 0.15 }));
      return [800 - dx, 800 + dx];
    }
    // ✓ / ✗ badge on the top-right corner of an object
    mark(id, target, kind, o) {
      const L = this.get(target), w = L.w || (L.s || L.r * 2 || 60), h = L.h || (L.s || L.r * 2 || 60);
      const good = kind !== "x" && kind !== "bad";
      return this.icon(id, { name: good ? "check" : "x", x: L.x + w / 2 * (L.scale || 1) - 6, y: L.y - h / 2 * (L.scale || 1) + 6, s: 42, color: good ? "green" : "red", sw: 2.6, z: 3 }, Object.assign({ in: "pop" }, o));
    }
    note(id, p, o) { return this.text(id, Object.assign({ size: 26, color: "dim" }, p), o); }
    // stacked horizontal bars: items = [[label, value 0..1, color?, valueText?], …] → ids pre0..
    bars(pre, items, p, o) {
      p = Object.assign({ x: 700, y: 530, w: 380, gap: 56, size: 28 }, p);
      const n = items.length, y0 = p.y - (n - 1) * p.gap / 2, t0 = this._rel(o);
      return items.map(([label, v, color, val], i) => this.bar(pre + i, { x: p.x, y: y0 + i * p.gap, w: p.w, v, label, val, color: color || (p.colors || [])[i] || p.color || "teal", pct: p.pct, size: p.size, h: p.h }, Object.assign({}, o, { at: t0 + i * 0.08 })));
    }
    grid(pre, labels, p, o) {
      p = Object.assign({}, p); o = Object.assign({}, o);
      const cols = p.cols || 3, cw = p.cw || 300, ch = p.ch || 120, gx = p.gx != null ? p.gx : 24, gy = p.gy != null ? p.gy : 24, n = labels.length, rows = Math.ceil(n / cols);
      const x0 = (p.x != null ? p.x : 800) - (cols * cw + (cols - 1) * gx) / 2 + cw / 2, y0 = (p.y != null ? p.y : 530) - (rows * ch + (rows - 1) * gy) / 2 + ch / 2;
      const t0 = this._rel(o), st = o.st != null ? o.st : 0.08, icons = p.icons || [], colors = p.colors || [], subs = p.subs || [];
      return labels.map((l, i) => {
        const r = Math.floor(i / cols), cc = p.rtl ? cols - 1 - (i % cols) : i % cols;
        return this.box(pre + i, Object.assign({}, p, { x: x0 + cc * (cw + gx), y: y0 + r * (ch + gy), w: cw, h: ch, label: l, icon: icons[i], color: colors[i] || p.color, sub: subs[i] }), Object.assign({}, o, { at: t0 + i * st }));
      });
    }
  }

  const eqCache = {};
  // Formula mini-syntax: "@" stands for "\", multi-letter words become upright text (softmax, LLM, tools).
  function eqTex(s) {
    if (s == null) return null;
    if (eqCache[s]) return eqCache[s];
    let t = String(s).replace(/@@/g, "\u0001").replace(/@/g, "\\").replace(/\u0001/g, "@");
    const parts = [];
    // keep \text{...} and \T{...} groups untouched
    t = t.replace(/\\(?:text|T|mathrm|operatorname)\{[^}]*\}/g, m => { parts.push(m); return "\u0002" + (parts.length - 1) + "\u0003"; });
    t = t.replace(/(\\[A-Za-z]+)|((?:[A-Za-z][A-Za-z0-9'’.\-]*[A-Za-z0-9]|[A-Za-z]{2,})(?:[ ]+(?:[A-Za-z][A-Za-z0-9'’.\-]*[A-Za-z0-9]))*)/g, (m, cmd, words) => {
      if (cmd) return cmd;
      return `\\text{${words}}`;
    });
    t = t.replace(/\u0002(\d+)\u0003/g, (m, i) => parts[+i]);
    return (eqCache[s] = t);
  }

  function build(def, durOf) {
    durOf = durOf || (() => null);
    const film = { def, id: def.id, objs: [], byId: {}, beats: [], uid: 0, uid2: 0, cam: { init: { x: W / 2, y: H / 2, z: 1 }, L: { x: W / 2, y: H / 2, z: 1 }, tracks: {} } };
    let T = 0, eq = null;
    def.beats.forEach((b, i) => {
      const key = voiceKey(b.say), measured = durOf(key, b), vd = measured != null ? measured : estimate(b.say);
      const lead = LEAD + (b.sec && i > 0 ? SEC_LEAD : 0);
      const s = new Ctx(film, T + lead - LEAD, vd);
      if (b.do) {
        try { b.do(s); } catch (e) { (root.console || console).error(`[explainer ${def.id} beat ${i}]`, e); }
      }
      if (b.eq !== undefined) eq = b.eq;
      else if (b.sec && i > 0) eq = null; // a new section starts without the previous section's formula
      const dur = Math.max(lead + vd + TAIL, s.end + (lead - LEAD) + 0.3, b.min || 0) + (b.hold || 0);
      film.beats.push({ i, start: T, dur, say: b.say, eq: eq, sec: b.sec || null, key, vd, vat: lead, measured: measured != null });
      T += dur;
    });
    film.total = T + END_HOLD;
    film.objs.forEach(o => { for (const k in o.tracks) o.tracks[k].sort((a, b) => a.t0 - b.t0); });
    for (const k in film.cam.tracks) film.cam.tracks[k].sort((a, b) => a.t0 - b.t0);
    film.secs = film.beats.filter((b, i) => b.sec || i === 0).map(b => ({ title: b.sec || (root.EXPLAINER_INTRO_LABEL || "البداية"), start: b.start, i: b.i }));
    return film;
  }
  function evalTracks(init, tracks, t) {
    const P = Object.assign({}, init);
    for (const k in tracks) {
      let v = init[k];
      for (const s of tracks[k]) {
        if (t < s.t0) break;
        if (t >= s.t1) { v = s.to; continue; }
        v = lerp(v, s.to, s.e((t - s.t0) / (s.t1 - s.t0)));
        break;
      }
      P[k] = v;
    }
    return P;
  }
  // flatten a film into plain timing data (for the video pipeline)
  const timing = film => ({ id: film.id, total: +film.total.toFixed(3), beats: film.beats.map(b => ({ start: +b.start.toFixed(3), dur: +b.dur.toFixed(3), say: b.say, key: b.key, vd: b.vd, vat: b.vat, sec: b.sec })) });

  // ---------------------------------------------------------------- DOM: mount + seek
  const CSS = `
.xp-stage{position:relative;width:100%;aspect-ratio:16/9;background:${C.bg};overflow:hidden;container-type:inline-size;user-select:none;direction:ltr}
.xp-stage svg.xp-svg{position:absolute;inset:0;width:100%;height:100%;display:block}
.xp-head{position:absolute;left:0;right:0;top:0;height:21%;pointer-events:none}
.xp-sec{position:absolute;right:2.2cqw;top:1.5cqw;display:inline-flex;align-items:center;gap:.55cqw;padding:.28cqw .85cqw;border-radius:999px;background:rgba(17,24,33,.78);border:1px solid rgba(255,255,255,.1);font:600 1.05cqw "IBM Plex Sans Arabic",sans-serif;color:#cbd5e1;direction:rtl;pointer-events:none;transition:opacity .25s}
.xp-sec i{width:.55cqw;height:.55cqw;border-radius:50%;background:var(--xp-acc,#e3b341);box-shadow:0 0 8px var(--xp-acc,#e3b341)}
.xp-cap{position:absolute;left:6%;right:6%;top:3.1cqw;height:5.8cqw;display:flex;align-items:center;justify-content:center}
.xp-cap span{position:absolute;left:0;right:0;text-align:center;direction:rtl;font:700 2.15cqw/1.34 "IBM Plex Sans Arabic","Readex Pro",sans-serif;color:#f1f5f9;text-shadow:0 2px 14px rgba(0,0,0,.65)}
.xp-eq{position:absolute;left:4%;right:4%;top:9.5cqw;height:4.2cqw;display:flex;align-items:center;justify-content:center}
.xp-eq div{position:absolute;left:0;right:0;text-align:center;direction:ltr;font-size:2.15cqw;color:#e8edf3;white-space:nowrap;text-shadow:0 1px 10px rgba(0,0,0,.5)}
.xp-eq .katex{font-size:1em}
.xp-eq .xp-eqt{font-family:"KaTeX_Main","Cambria","Times New Roman",serif}
.xp-chip{position:absolute;left:2.2cqw;bottom:2.1cqw;display:flex;gap:.8cqw;align-items:center;font:600 1.05cqw "IBM Plex Sans Arabic",sans-serif;color:#9aa6b4;direction:rtl;pointer-events:none}
.xp-chip b{font:700 .95cqw "IBM Plex Mono",monospace;color:#0b0f14;background:var(--xp-acc,#e3b341);padding:.2cqw .6cqw;border-radius:.4cqw;direction:ltr}
.xp-sprog{position:absolute;left:0;right:0;bottom:0;height:3px;background:rgba(255,255,255,.06);pointer-events:none}
.xp-sprog i{display:block;height:100%;width:0;background:var(--xp-acc,#e3b341);box-shadow:0 0 8px var(--xp-acc,#e3b341)}
.xp-player{border-radius:16px;overflow:hidden;background:#0b0f14;border:1px solid rgba(255,255,255,.08);box-shadow:0 18px 50px -24px rgba(0,0,0,.6)}
.xp-player .xp-screen{position:relative}
.xp-cover{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.4cqw;background:radial-gradient(ellipse at 50% 45%,rgba(20,28,38,.55),rgba(11,15,20,.94));cursor:pointer;transition:opacity .25s;container-type:inline-size}
.xp-cover.hide{opacity:0;pointer-events:none}
.xp-cover .xp-id{font:700 1.5cqw "IBM Plex Mono",monospace;color:#0b0f14;background:var(--xp-acc,#e3b341);padding:.3cqw 1cqw;border-radius:.6cqw}
.xp-cover h4{margin:0;max-width:78%;text-align:center;direction:rtl;font:700 3cqw/1.35 "IBM Plex Sans Arabic",sans-serif;color:#f1f5f9}
.xp-cover p{margin:0;font:500 1.45cqw "IBM Plex Sans Arabic",sans-serif;color:#9aa6b4;direction:rtl}
.xp-cover .xp-pl{width:7cqw;height:7cqw;border-radius:50%;display:grid;place-items:center;background:var(--xp-acc,#e3b341);color:#0b0f14;font-size:2.8cqw;box-shadow:0 0 0 1cqw rgba(255,255,255,.06);transition:transform .2s}
.xp-cover:hover .xp-pl{transform:scale(1.07)}
.xp-ctrl{display:flex;align-items:center;gap:8px;padding:10px 14px;background:#0f151c;border-top:1px solid rgba(255,255,255,.06);direction:ltr;flex-wrap:wrap}
.xp-ctrl button{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);color:#e8edf3;border-radius:9px;height:34px;min-width:36px;padding:0 9px;font:600 13px "IBM Plex Sans Arabic",Outfit,sans-serif;cursor:pointer;transition:background .15s}
.xp-ctrl button:hover{background:rgba(255,255,255,.13)}
.xp-ctrl button.off{opacity:.48}
.xp-tl{position:relative;flex:1;min-width:140px;height:34px;cursor:pointer;display:flex;align-items:center}
.xp-tl .xp-tr{position:absolute;left:0;right:0;height:6px;border-radius:3px;background:rgba(255,255,255,.1)}
.xp-tl .xp-fl{position:absolute;left:0;height:6px;border-radius:3px;background:var(--xp-acc,#e3b341)}
.xp-tl .xp-tk{position:absolute;width:2px;height:12px;background:rgba(255,255,255,.35);border-radius:1px;transform:translateX(-1px)}
.xp-tl .xp-kn{position:absolute;width:14px;height:14px;border-radius:50%;background:#fff;transform:translateX(-7px);box-shadow:0 1px 6px rgba(0,0,0,.4)}
.xp-time{font:600 12px "IBM Plex Mono",monospace;color:#9aa6b4;min-width:86px;text-align:center}
.xp-step{font:600 11.5px "IBM Plex Mono",monospace;color:#7f8a98;padding:3px 7px;border-radius:6px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.06)}
.xp-secs{display:flex;gap:8px;padding:10px 14px 14px;overflow-x:auto;background:#0f151c;direction:rtl}
.xp-secs button{flex:0 0 auto;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);color:#c9d3de;border-radius:10px;padding:7px 12px;font:600 12.5px "IBM Plex Sans Arabic",sans-serif;cursor:pointer;text-align:right;transition:border-color .15s,background .15s}
.xp-secs button small{display:block;font:500 10.5px "IBM Plex Mono",monospace;color:#7f8a98;direction:ltr;text-align:right}
.xp-secs button.on{border-color:var(--xp-acc,#e3b341);color:#fff;background:rgba(227,179,65,.12)}
.xp-player:fullscreen{display:flex;flex-direction:column;justify-content:center;background:#000}
.xp-player:fullscreen .xp-screen{width:min(100vw,calc((100vh - 60px)*16/9));margin:0 auto}
.xp-player:fullscreen .xp-secs{display:none}
.xp-note{padding:10px 14px;font:500 12px "IBM Plex Sans Arabic",sans-serif;color:#7f8a98;background:#0f151c;direction:rtl;border-top:1px solid rgba(255,255,255,.05)}
`;
  function injectCss() {
    if (document.getElementById("xp-css")) return;
    const s = document.createElement("style"); s.id = "xp-css"; s.textContent = CSS; document.head.appendChild(s);
  }
  // "#" inside a macro body is a parameter marker, so hex colors are written "##rrggbb".
  const kc = c => `\\textcolor{#${c}}{#1}`;
  const KATEX_MACROS = {
    "\\B": kc(C.blue), "\\O": kc(C.orange), "\\G": kc(C.green), "\\Y": kc(C.gold), "\\R": kc(C.red),
    "\\C": kc(C.teal), "\\P": kc(C.purple), "\\M": kc(C.dim), "\\K": kc(C.pink), "\\T": "\\text{#1}"
  };
  function eqHtml(eq) {
    if (!eq) return "";
    const tex = eqTex(eq);
    if (root.katex) { try { return root.katex.renderToString(tex, { throwOnError: false, macros: Object.assign({}, KATEX_MACROS), strict: false }); } catch (e) { } }
    const esc = String(eq).replace(/@[A-Za-z]+\{([^}]*)\}/g, "$1").replace(/[@{}]/g, "").replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
    return `<span class="xp-eqt">${esc}</span>`;
  }

  function mount(film, host, opts) {
    opts = opts || {};
    injectCss();
    film.uid = (root.__xpUid = (root.__xpUid || 0) + 1);
    const acc = opts.acc || "#e3b341";
    const stage = document.createElement("div"); stage.className = "xp-stage";
    stage.style.setProperty("--xp-acc", acc);
    const svg = mk("svg", { class: "xp-svg", viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: "xMidYMid meet" });
    film.defs = mk("defs", {}, svg);
    // Subtle spatial dot-grid pattern + ambient focal glow + vignette
    const pat = mk("pattern", { id: "xpdot" + film.uid, width: 40, height: 40, patternUnits: "userSpaceOnUse" }, film.defs);
    mk("circle", { cx: 20, cy: 20, r: 1.15, fill: "#233042", opacity: 0.45 }, pat);
    const ag = mk("radialGradient", { id: "xpag" + film.uid, cx: "50%", cy: "54%", r: "52%" }, film.defs);
    mk("stop", { offset: "0%", "stop-color": acc, "stop-opacity": 0.08 }, ag); mk("stop", { offset: "100%", "stop-color": acc, "stop-opacity": 0 }, ag);
    const vg = mk("radialGradient", { id: "xpvg" + film.uid, cx: "50%", cy: "55%", r: "78%" }, film.defs);
    mk("stop", { offset: "62%", "stop-color": "#000", "stop-opacity": 0 }, vg); mk("stop", { offset: "100%", "stop-color": "#000", "stop-opacity": 0.5 }, vg);
    mk("rect", { width: W, height: H, fill: C.bg }, svg);
    mk("rect", { width: W, height: H, fill: `url(#xpag${film.uid})` }, svg);
    const world = mk("g", {}, svg);
    mk("rect", { x: -400, y: -200, width: W + 800, height: H + 400, fill: `url(#xpdot${film.uid})` }, world);
    mk("rect", { width: W, height: H, fill: `url(#xpvg${film.uid})`, "pointer-events": "none" }, svg);
    stage.appendChild(svg);
    const order = film.objs.slice().sort((a, b) => (a.z - b.z) || (a.idx - b.idx));
    order.forEach(o => { o.g = mk("g", { style: "display:none" }, world); o.vis = false; PRIM[o.type].make(o, o.g); });
    const head = document.createElement("div"); head.className = "xp-head";
    head.innerHTML = `<div class="xp-sec"><i></i><span></span></div><div class="xp-cap"><span></span><span></span></div><div class="xp-eq"><div></div><div></div></div>`;
    stage.appendChild(head);
    if (opts.chip) { const ch = document.createElement("div"); ch.className = "xp-chip"; ch.innerHTML = `<b></b><span></span>`; ch.querySelector("b").textContent = opts.chip[0]; ch.querySelector("span").textContent = opts.chip[1]; stage.appendChild(ch); }
    const sprog = document.createElement("div"); sprog.className = "xp-sprog"; sprog.innerHTML = `<i></i>`; stage.appendChild(sprog);
    const sprogBar = sprog.firstChild;
    host.appendChild(stage);
    const secPill = head.querySelector(".xp-sec"), secTxt = secPill.querySelector("span");
    const caps = head.querySelectorAll(".xp-cap span"), eqs = head.querySelectorAll(".xp-eq div");
    const setStyle = (e, k, v) => { if (e.__s === undefined) e.__s = {}; if (e.__s[k] !== v) { e.__s[k] = v; e.style[k] = v; } };
    const setHtml = (e, h) => { if (e.__h !== h) { e.__h = h; e.innerHTML = h; } };
    const setText = (e, s) => { if (e.__t !== s) { e.__t = s; e.textContent = s; } };
    const eqH = {};
    const eqOf = s => (eqH[s] != null ? eqH[s] : (eqH[s] = eqHtml(s)));
    const beatAt = t => { const B = film.beats; let lo = 0, hi = B.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (B[m].start <= t) lo = m; else hi = m - 1; } return lo; };
    const getP = o => o.cur || evalTracks(o.init, o.tracks, film.__t || 0);
    // precompute active section name for every beat
    const beatSec = []; let curSec = "";
    film.beats.forEach((B, i) => { if (B.sec) curSec = B.sec; beatSec[i] = curSec; });

    function seek(t) {
      film.__t = t;
      for (const o of order) o.cur = (t >= o.born && t < o.dead) ? evalTracks(o.init, o.tracks, t) : null;
      for (const o of order) {
        if (!o.cur) { if (o.vis) { o.g.style.display = "none"; o.vis = false; } continue; }
        if (!o.vis) { o.g.style.display = ""; o.vis = true; }
        PRIM[o.type].draw(o, o.cur, getP, t);
      }
      const cam = evalTracks(film.cam.init, film.cam.tracks, t);
      sa(world, "transform", `translate(${r2(W / 2)} ${r2(H / 2)}) scale(${r2(cam.z)}) translate(${r2(-cam.x)} ${r2(-cam.y)})`);
      // header: section pill + caption + formula crossfades
      const b = beatAt(t), B = film.beats[b], prev = film.beats[b - 1], dt = t - B.start;
      const sn = beatSec[b];
      if (sn) { setText(secTxt, sn); setStyle(secPill, "opacity", String(r2(B.sec ? E.out(clamp(dt / 0.35)) : 1))); }
      else setStyle(secPill, "opacity", "0");
      setStyle(sprogBar, "width", r2(clamp(t / (film.total || 1)) * 100) + "%");
      const pin = prev ? E.out(clamp((dt - 0.12) / 0.28)) : E.out(clamp(dt / 0.32)), pout = clamp(dt / 0.12);
      setText(caps[0], B.say || ""); setStyle(caps[0], "opacity", String(r2(pin))); setStyle(caps[0], "transform", `translateY(${r2((1 - pin) * 0.55)}cqw)`);
      setText(caps[1], prev ? prev.say || "" : ""); setStyle(caps[1], "opacity", String(prev ? r2(1 - pout) : 0)); setStyle(caps[1], "transform", "none");
      const same = prev && prev.eq === B.eq, qin = same ? 1 : E.io(clamp((dt - 0.14) / 0.55)), qout = same ? 1 : clamp(dt / 0.14);
      setHtml(eqs[0], eqOf(B.eq)); setStyle(eqs[0], "opacity", String(B.eq ? 1 : 0)); setStyle(eqs[0], "clipPath", qin >= 1 ? "none" : `inset(-20% ${r2((1 - qin) * 100)}% -20% 0)`);
      setHtml(eqs[1], same || !prev ? "" : eqOf(prev.eq)); setStyle(eqs[1], "opacity", String(same || !prev ? 0 : r2((1 - qout) * 0.9)));
      if (opts.onBeat) opts.onBeat(b);
    }
    seek(0);
    return { seek, film, el: stage, destroy() { stage.remove(); } };
  }

  // ---------------------------------------------------------------- registry
  const DEFS = {};
  function lesson(id, beats, meta) { DEFS[id] = Object.assign({ id, beats }, meta || {}); return DEFS[id]; }
  const voiceDur = key => { const m = root.EXPLAINER_VOICE; return m && m.d && m.d[key] != null ? m.d[key] : null; };
  function filmFor(id) { const d = DEFS[id]; return d ? build(d, voiceDur) : null; }

  // ---------------------------------------------------------------- in-app player
  const fmt = s => { s = Math.max(0, s); return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`; };
  function player(host, l, opts) {
    opts = opts || {};
    injectCss();
    const film = filmFor(l.id);
    if (!film) return null;
    const ar = opts.ar !== false, acc = opts.acc || "#e3b341";
    const vcfg = voiceCfg(), base = (root.EXPLAINER_VOICE && root.EXPLAINER_VOICE.base) || "video/out/voice/";
    host.innerHTML = `
      <div class="xp-player" style="--xp-acc:${acc}">
        <div class="xp-screen"></div>
        <div class="xp-ctrl">
          <button data-a="play" aria-label="Play">▶</button>
          <button data-a="prev" title="${ar ? "الخطوة السابقة" : "Previous step"}">⏮</button>
          <button data-a="next" title="${ar ? "الخطوة التالية" : "Next step"}">⏭</button>
          <button data-a="replay" aria-label="Replay">↺</button>
          <div class="xp-tl"><div class="xp-tr"></div><div class="xp-fl"></div><div class="xp-kn"></div></div>
          <span class="xp-time"></span>
          <span class="xp-step"></span>
          <button data-a="speed">1×</button>
          <button data-a="music" title="${ar ? "موسيقى خلفية هادئة" : "Ambient music"}">🎵</button>
          <button data-a="voice"></button>
          <button data-a="fs" aria-label="Fullscreen">⛶</button>
        </div>
        <div class="xp-secs"></div>
      </div>`;
    const wrapEl = host.querySelector(".xp-player"), screen = host.querySelector(".xp-screen"), tl = host.querySelector(".xp-tl");
    const fl = host.querySelector(".xp-fl"), kn = host.querySelector(".xp-kn"), timeEl = host.querySelector(".xp-time"), stepEl = host.querySelector(".xp-step");
    const btn = a => host.querySelector(`[data-a="${a}"]`);
    let secBtns = [], curBeatIdx = 0;
    const stage = mount(film, screen, { acc, onBeat: b => {
      curBeatIdx = b;
      const si = film.secs.reduce((a, s, k) => s.i <= b ? k : a, 0);
      secBtns.forEach((e, k) => e.classList.toggle("on", k === si));
      stepEl.textContent = `${b + 1}/${film.beats.length}`;
    } });
    film.secs.forEach(s => { const tk = document.createElement("div"); tk.className = "xp-tk"; tk.style.left = (s.start / film.total * 100) + "%"; tl.appendChild(tk); });
    const secs = host.querySelector(".xp-secs");
    secs.innerHTML = film.secs.map((s, k) => `<button data-s="${k}"><small>${fmt(s.start)}</small></button>`).join("");
    secBtns = [...secs.querySelectorAll("button")];
    secBtns.forEach((e, k) => e.insertBefore(document.createTextNode(film.secs[k].title), e.firstChild));
    const cover = document.createElement("div"); cover.className = "xp-cover";
    cover.innerHTML = `<span class="xp-id"></span><h4></h4><p></p><div class="xp-pl">▶</div>`;
    cover.querySelector(".xp-id").textContent = l.id;
    cover.querySelector("h4").textContent = (l.t && l.t[1]) || "";
    cover.querySelector("p").textContent = `شرح بالموشن · ${fmt(film.total)} · ${film.secs.length} أقسام · ${film.beats.length} خطوة`;
    stage.el.appendChild(cover);

    let t = 0, playing = false, speed = 1, raf = 0, last = 0, voiceOn = opts.voice !== false, dragging = false;
    let musicOn = true;
    try { const sv = localStorage.getItem("aie-xp-music"); if (sv != null) musicOn = JSON.parse(sv); } catch (e) { }
    let audio = null, voiceBeat = -1, speaking = false, holdSince = 0, token = 0, lastSecBeat = -1;
    // Soft procedural Web Audio ambient bed + section chime (matches the rendered video mood, auto-ducks for voice)
    let actx = null, padGain = null, padOscs = [], padTimer = 0, padChord = 0;
    const PAD_CHORDS = [[220, 261.63, 329.63], [174.61, 220, 261.63], [130.81, 196, 261.63], [196, 246.94, 293.66]];
    function ensureAudioCtx() {
      const AC = root.AudioContext || root.webkitAudioContext;
      if (!AC) return null;
      if (!actx) {
        actx = new AC();
        padGain = actx.createGain(); padGain.gain.value = 0;
        const lp = actx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 520;
        padGain.connect(lp); lp.connect(actx.destination);
        padOscs = PAD_CHORDS[0].map(f => {
          const o = actx.createOscillator(), g = actx.createGain();
          o.type = "sine"; o.frequency.value = f; g.gain.value = 0.25;
          o.connect(g); g.connect(padGain); o.start(); return o;
        });
        padTimer = setInterval(() => {
          if (!actx || !playing || !musicOn) return;
          padChord = (padChord + 1) % PAD_CHORDS.length;
          const now = actx.currentTime;
          padOscs.forEach((o, i) => o.frequency.setTargetAtTime(PAD_CHORDS[padChord][i], now, 1.1));
        }, 7500);
      }
      if (actx.state === "suspended") actx.resume().catch(() => { });
      return actx;
    }
    function updatePadGain() {
      if (!actx || !padGain) return;
      const target = playing && musicOn ? (busy() ? 0.022 : 0.055) : 0;
      padGain.gain.setTargetAtTime(target, actx.currentTime, 0.25);
    }
    function playSectionChime() {
      if (!musicOn || !playing) return;
      const c = ensureAudioCtx(); if (!c) return;
      try {
        const o = c.createOscillator(), g = c.createGain(), now = c.currentTime;
        o.type = "sine"; o.frequency.setValueAtTime(528, now); o.frequency.exponentialRampToValueAtTime(792, now + 0.18);
        g.gain.setValueAtTime(0.0001, now); g.gain.linearRampToValueAtTime(0.032, now + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);
        o.connect(g); g.connect(c.destination); o.start(now); o.stop(now + 0.4);
      } catch (e) { }
    }
    function destroyAudioCtx() {
      clearInterval(padTimer);
      if (actx) { try { actx.close(); } catch (e) { } actx = null; padGain = null; padOscs = []; }
    }
    const speeds = [1, 1.25, 1.5, 0.75];
    const missing = new Set();
    const preloadCache = new Map();
    function preloadBeat(b) {
      const B = film.beats[b];
      if (!B || !B.say || missing.has(B.key) || preloadCache.has(B.key)) return;
      if (preloadCache.size > 8) preloadCache.clear();
      const p = new Audio(base + B.key + ".mp3");
      p.preload = "auto";
      p.onerror = () => { missing.add(B.key); preloadCache.delete(B.key); };
      preloadCache.set(B.key, p);
    }
    function stopVoice() {
      token++;
      if (audio) { try { audio.pause(); audio.onended = audio.onerror = null; } catch (e) { } audio = null; }
      try { if (root.speechSynthesis && speaking) root.speechSynthesis.cancel(); } catch (e) { }
      speaking = false;
    }
    function speakFallback(text, tok) {
      if (!root.speechSynthesis) return;
      try {
        const u = new SpeechSynthesisUtterance(ttsText(text)), vs = root.speechSynthesis.getVoices() || [];
        const v = vs.filter(x => /^ar/i.test(x.lang)).sort((a, b) => /natural|neural|online|google/i.test(b.name) - /natural|neural|online|google/i.test(a.name))[0];
        if (v) u.voice = v; u.lang = "ar-SA"; u.rate = Math.min(1.6, 1.05 * speed);
        u.onend = u.onerror = () => { if (tok === token) speaking = false; };
        speaking = true; root.speechSynthesis.cancel(); root.speechSynthesis.speak(u);
      } catch (e) { speaking = false; }
    }
    function startVoice(b, offset) {
      stopVoice();
      const B = film.beats[b], tok = token;
      voiceBeat = b;
      if (!voiceOn || !B.say) return;
      if (offset > B.vd - 0.15) return;
      if (missing.has(B.key)) { if (offset < 0.35) speakFallback(B.say, tok); return; }
      const cached = preloadCache.get(B.key);
      preloadCache.delete(B.key);
      const a = (cached && !cached.error) ? cached : new Audio(base + B.key + ".mp3");
      a.playbackRate = speed;
      a.onerror = () => { if (tok !== token) return; missing.add(B.key); audio = null; if (offset < 0.35) speakFallback(B.say, tok); };
      a.onended = () => { if (tok === token) audio = null; };
      const applyOffset = () => {
        if (tok === token && offset > 0.05) { try { a.currentTime = offset; } catch (e) { } }
      };
      if (a.readyState >= 1) applyOffset();
      else a.addEventListener("loadedmetadata", applyOffset, { once: true });
      audio = a;
      a.play().catch(() => { if (tok === token) { audio = null; } });
      preloadBeat(b + 1); preloadBeat(b + 2);
    }
    const busy = () => (audio && !audio.paused && !audio.ended) || speaking;
    function draw() {
      stage.seek(t);
      const p = t / film.total * 100;
      fl.style.width = p + "%"; kn.style.left = p + "%";
      timeEl.textContent = `${fmt(t)} / ${fmt(film.total)}`;
    }
    function frame(now) {
      const dt = Math.min(0.1, (now - last) / 1000); last = now;
      if (playing && !dragging) {
        let bi = 0; for (let k = 0; k < film.beats.length; k++) if (film.beats[k].start <= t) bi = k;
        const B = film.beats[bi], end = B.start + B.dur;
        if (B.sec && bi > 0 && bi !== lastSecBeat) { lastSecBeat = bi; playSectionChime(); }
        if (voiceOn && bi !== voiceBeat && t >= B.start + B.vat - 0.02) startVoice(bi, t - B.start - B.vat);
        let nt = t + dt * speed;
        // never cut the narration mid-sentence: hold the frame until the clip ends (capped for flaky speech engines)
        if (voiceOn && busy() && nt >= end - 0.04) { if (!holdSince) holdSince = now; if (now - holdSince < (audio ? 6000 : 2500)) nt = end - 0.04; } else holdSince = 0;
        t = nt;
        if (t >= film.total) { t = film.total; setPlay(false); }
        updatePadGain();
      }
      draw();
      raf = requestAnimationFrame(frame);
    }
    function setPlay(v) {
      playing = v;
      btn("play").textContent = v ? "❚❚" : "▶";
      cover.classList.toggle("hide", v || t > 0.01);
      if (v) {
        if (musicOn) ensureAudioCtx();
        if (t >= film.total - 0.05) seek(0);
        if (audio && audio.paused) audio.play().catch(() => { });
      } else {
        if (audio) try { audio.pause(); } catch (e) { }
        if (speaking) { try { root.speechSynthesis.cancel(); } catch (e) { } speaking = false; }
      }
      updatePadGain();
    }
    function seek(nt) {
      t = clamp(nt, 0, film.total);
      stopVoice(); voiceBeat = -1;
      cover.classList.toggle("hide", playing || t > 0.01);
      draw();
    }
    const voiceLbl = () => { const b = btn("voice"); b.textContent = voiceOn ? (ar ? "🔊 الصوت" : "🔊 Voice") : (ar ? "🔇 الصوت" : "🔇 Voice"); b.classList.toggle("off", !voiceOn); };
    const musicLbl = () => { btn("music").classList.toggle("off", !musicOn); };
    voiceLbl(); musicLbl();
    btn("play").onclick = () => setPlay(!playing);
    btn("prev").onclick = () => { const nb = Math.max(0, curBeatIdx - 1); seek(film.beats[nb].start); };
    btn("next").onclick = () => { const nb = Math.min(film.beats.length - 1, curBeatIdx + 1); seek(film.beats[nb].start); };
    btn("replay").onclick = () => { seek(0); setPlay(true); };
    btn("speed").onclick = () => { speed = speeds[(speeds.indexOf(speed) + 1) % speeds.length]; btn("speed").textContent = speed + "×"; if (audio) audio.playbackRate = speed; };
    btn("music").onclick = () => { musicOn = !musicOn; musicLbl(); try { localStorage.setItem("aie-xp-music", JSON.stringify(musicOn)); } catch (e) { } if (musicOn && playing) ensureAudioCtx(); updatePadGain(); };
    btn("voice").onclick = () => { voiceOn = !voiceOn; voiceLbl(); if (!voiceOn) stopVoice(); else voiceBeat = -1; if (opts.onVoice) opts.onVoice(voiceOn); };
    btn("fs").onclick = () => { try { document.fullscreenElement ? document.exitFullscreen() : wrapEl.requestFullscreen().catch(() => { }); } catch (e) { } };
    cover.onclick = () => setPlay(true);
    screen.addEventListener("click", e => { if (!e.target.closest(".xp-cover")) setPlay(!playing); });
    secs.onclick = e => { const b = e.target.closest("button"); if (!b) return; seek(film.secs[+b.dataset.s].start); setPlay(true); };
    const posT = e => { const r = tl.getBoundingClientRect(); return clamp((e.clientX - r.left) / r.width) * film.total; };
    tl.addEventListener("pointerdown", e => { dragging = true; tl.setPointerCapture(e.pointerId); seek(posT(e)); });
    tl.addEventListener("pointermove", e => { if (dragging) seek(posT(e)); });
    tl.addEventListener("pointerup", () => { dragging = false; voiceBeat = -1; });
    const key = e => {
      if (/INPUT|TEXTAREA/.test(e.target.tagName)) return;
      if (e.key === " ") { e.preventDefault(); setPlay(!playing); }
      else if (e.key === "ArrowRight") seek(t + 5);
      else if (e.key === "ArrowLeft") seek(t - 5);
      else if (e.key === "n" || e.key === "N") { const nb = Math.min(film.beats.length - 1, curBeatIdx + 1); seek(film.beats[nb].start); }
      else if (e.key === "p" || e.key === "P") { const nb = Math.max(0, curBeatIdx - 1); seek(film.beats[nb].start); }
      else if (e.key === "m" || e.key === "M") btn("voice").click();
      else if (e.key === "f" || e.key === "F") btn("fs").click();
    };
    document.addEventListener("keydown", key);
    last = performance.now(); draw();
    raf = requestAnimationFrame(frame);
    if (opts.autoplay) setPlay(true);
    return { film, destroy() { cancelAnimationFrame(raf); stopVoice(); destroyAudioCtx(); document.removeEventListener("keydown", key); host.innerHTML = ""; } };
  }

  root.Explainer = { W, H, C, ICONS, lesson, has: id => !!DEFS[id], defs: DEFS, build, mount, player, filmFor, timing, voiceKey, speakText, ttsText, estimate, eqTex, textW, wrapText, hash, voiceCfg };
})(typeof window !== "undefined" ? window : globalThis);
