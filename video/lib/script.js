// Builds the Arabic narration script + visual plan (segments → chapters → voice clips)
// for the whole course video. Pure data: no timing yet (timing comes after TTS).
const crypto = require("crypto");

const ORD_F = ["الأولى", "الثانية", "الثالثة", "الرابعة", "الخامسة", "السادسة", "السابعة", "الثامنة", "التاسعة", "العاشرة"];
const LETTERS = ["أ", "ب", "ج"];

const pick = (arr, i) => arr[i % arr.length];
const firstSentence = s => { const m = String(s).match(/^.*?[.!؟?](\s|$)/); return (m ? m[0] : s).trim(); };
const clean = s => String(s).replace(/^➕\s*/, "").replace(/\s+/g, " ").trim();
const endDot = s => /[.!؟?…:]$/.test(s.trim()) ? s.trim() : s.trim() + ".";
// Short title: the part before ":" / "—" (used on screen and in narration).
const shortAr = s => clean(s).split(/[:—–]/)[0].trim();
// Topic for «…»: short title, cut after a leading question ("ما هو النموذج؟ …" → "ما هو النموذج").
const topicAr = s => { const t = shortAr(s); const q = t.indexOf("؟"); return (q > 0 ? t.slice(0, q) : t).trim(); };
const NUM_F = { 2: "نقطتين أساسيتين", 3: "ثلاث نقاط أساسية", 4: "أربع نقاط أساسية", 5: "خمس نقاط أساسية", 6: "ست نقاط أساسية", 7: "سبع نقاط أساسية", 8: "ثماني نقاط أساسية" };
// "N مراحل" spoken with the correct feminine number word.
const STAGES_F = { 3: "ثلاث", 4: "أربع", 5: "خمس", 6: "ست", 7: "سبع", 8: "ثماني", 9: "تسع", 10: "عشر" };

// "المرحلة 1:" → "المرحلة الأولى:" (spoken form only)
function spokenOrdinals(s) {
  return s
    .replace(/المرحلة\s+(\d+)/g, (_, n) => "المرحلة " + (ORD_F[n - 1] || n))
    .replace(/الوحدة\s+(\d+)/g, (_, n) => "الوحدة " + (ORD_F[n - 1] || n));
}

function lessonCount(n) {
  if (n === 1) return "درسًا واحدًا";
  if (n === 2) return "درسين";
  if (n <= 10) return `${n} دروس`;
  return `${n} درسًا`;
}

function stageTitleAr(st) { return st.id === "C" ? "المرحلة التمهيدية: " + st.t[1] : st.t[1]; }
function moduleTitleAr(m, st) {
  const t = clean(m.t[1]);
  if (/دروس إضافية/.test(t)) return `دروس إضافية مطوّرة (${st.id === "C" ? "المفاهيم الأساسية" : st.t[1].split(":")[0]})`;
  return t;
}

const key = (voice, rate, text) => crypto.createHash("sha1").update(voice + "|" + rate + "|" + text).digest("hex").slice(0, 16);

function buildScript(course, opts) {
  const voice = opts.voice, rate = opts.rate;
  const { COURSE, flat, enrich } = course;
  const clip = text => ({ text: text.replace(/\s+/g, " ").trim(), key: key(voice, rate, text.replace(/\s+/g, " ").trim()) });
  const segments = [];

  // ---------- Course opening ----------
  segments.push({
    id: "00-intro", kind: "course", acc: "#f5a524",
    title: ["AI Engineer Course", "كورس مهندس الذكاء الاصطناعي"],
    chapters: [{
      kind: "courseIntro", name: ["Welcome", "مرحبًا بك"], minDur: 12,
      clips: [clip(`أهلًا وسهلًا بكم في كورس مهندس الذكاء الاصطناعي، الشرح الكامل باللغة العربية.
        في هذا الكورس سنبني معًا المهارات التي يحتاجها مهندس الذكاء الاصطناعي اليوم:
        من فهم النماذج ونماذج اللغة الكبيرة، إلى بناء تطبيقات RAG والوكلاء،
        وصولًا إلى التقييم والأمان والنشر في بيئة الإنتاج${COURSE.stages.length > 6 ? "، ثم البرمجة بمساعدة الذكاء الاصطناعي وهندسة الوكلاء الحديثة" : ""}.
        يضم الكورس ${flat.length} درسًا موزّعة على ${STAGES_F[COURSE.stages.length] || COURSE.stages.length} مراحل، ولكل درس شرح مرئي وتشبيه وأمثلة عملية واختبار سريع. لنبدأ!`)],
      data: {
        stages: COURSE.stages.map(s => ({ id: s.id, t: s.t, acc: s.acc, n: s.modules.reduce((a, m) => a + m.lessons.length, 0) })),
        lessons: flat.length
      }
    }]
  });

  let lessonNo = 0;
  COURSE.stages.forEach((st, si) => {
    const nStage = st.modules.reduce((a, m) => a + m.lessons.length, 0);
    segments.push({
      id: `${String(si + 1).padStart(2, "0")}-stage-${st.id}`, kind: "stage", stage: st.id, acc: st.acc,
      title: [st.t[0], stageTitleAr(st)],
      chapters: [{
        kind: "stageCard", name: ["Stage", "مرحلة جديدة"], minDur: 9,
        clips: [clip(`${spokenOrdinals(stageTitleAr(st))}. ${endDot(st.d[1])} تضم هذه المرحلة ${lessonCount(nStage)}.`)],
        data: {
          id: st.id, no: si, t: [st.t[0], stageTitleAr(st)], d: st.d, n: nStage, total: COURSE.stages.filter(s => s.id !== "C").length,
          modules: st.modules.map(m => ({ id: m.id, t: [clean(m.t[0]), moduleTitleAr(m, st)], n: m.lessons.length }))
        }
      }]
    });

    st.modules.forEach((m, mi) => {
      const mt = moduleTitleAr(m, st);
      segments.push({
        id: `${String(si + 1).padStart(2, "0")}-${String(mi + 1).padStart(2, "0")}-module-${m.id}`, kind: "module", stage: st.id, acc: st.acc,
        title: [clean(m.t[0]), mt],
        chapters: [{
          kind: "moduleCard", name: ["Module", "وحدة جديدة"], minDur: 6,
          clips: [clip(`${/^(الوحدة|دروس)/.test(mt) ? spokenOrdinals(mt) : "وحدة " + mt}. في هذه الوحدة ${lessonCount(m.lessons.length)}: ${m.lessons.map(l => topicAr(l.t[1])).join("، ")}.`)],
          data: { id: m.id, t: [clean(m.t[0]), mt], stageT: stageTitleAr(st), lessons: m.lessons.map(l => ({ id: l.id, t: l.t })) }
        }]
      });

      m.lessons.forEach(l => {
        const n = lessonNo++;
        const enr = enrich(l);
        const ch = [];
        const title = clean(l.t[1]);

        const np = NUM_F[l.p.length] || `${l.p.length} نقاط أساسية`;
        const roadmap = pick([
          `سنبدأ بتشبيه بسيط، ثم نرى الفكرة في مخطط مرئي، ونمرّ على ${np}${l.ex ? "، ثم مثال عملي بالكود" : ""}، ونختم باختبار سريع.`,
          `خطتنا: تشبيه يقرّب الفكرة، ثم مخطط يوضّح آلية العمل، ثم ${np}${l.ex ? " ومثال بالكود" : ""}، وأخيرًا اختبار سريع لفهمك.`
        ], Math.floor(n / 2));
        ch.push({
          kind: "lessonIntro", name: ["Intro", "المقدمة"], minDur: 7,
          clips: [clip(`${pick(["مرحبًا بك في درس جديد بعنوان: ", "أهلًا بك من جديد. درسنا الآن عن: ", "لننتقل إلى درس جديد: ", "في هذا الدرس سنتحدث عن: "], n)}${endDot(title)} ${roadmap}`)],
          data: { roadmap: ["تشبيه", "مخطط مرئي", `${l.p.length} نقاط`, ...(l.ex ? ["كود عملي"] : []), "خطأ شائع", "اختبار سريع"] }
        });

        const an = enr.analogy[1].trim();
        ch.push({
          kind: "analogy", name: ["Analogy", "التشبيه"], minDur: 9,
          clips: [clip(`${/^تخيّل|^تخيل/.test(an) ? pick(["لنبدأ بتشبيه بسيط. ", "قبل التفاصيل، إليك هذا التشبيه. "], n) : pick(["لنبدأ بتشبيه بسيط يقرّب الفكرة. ", "تخيّل معي هذا التشبيه. ", "قبل التفاصيل، إليك تشبيهًا من الحياة اليومية. "], n)}${endDot(an)}`)]
        });

        ch.push({
          kind: "diagram", name: ["How it works", "كيف يعمل؟"], minDur: 10,
          clips: [clip(`${pick(["لنرَ الآن كيف يعمل ذلك بصريًا. ", "إليك الصورة الكاملة. ", "ما الفكرة بالضبط؟ ", "لننظر إلى المخطط. "], n)}${endDot(l.d[1])}`)]
        });

        l.p.forEach((p, i) => {
          const last = i === l.p.length - 1 && l.p.length > 2;
          ch.push({
            kind: "point", name: [`Key point ${i + 1}`, `النقطة ${i + 1}`], minDur: 6, data: { i },
            clips: [clip(`${last ? "وأخيرًا، النقطة " + ORD_F[i] : "النقطة " + (ORD_F[i] || i + 1)}: ${endDot(p[1])}`)]
          });
        });

        if (l.ex) {
          ch.push({
            kind: "code", name: ["Hands-on code", "تطبيق بالكود"], minDur: 10,
            clips: [clip(pick([
              "والآن إلى التطبيق العملي. هذا مثال حقيقي بالكود يطبّق فكرة الدرس؛ تابعه سطرًا بسطر، وحاول أن تربط كل سطر بما شرحناه قبل قليل.",
              "لنحوّل الفكرة إلى كود. في هذا المثال العملي ستلاحظ كيف تظهر المفاهيم التي شرحناها في سطور قليلة؛ تمهّل عند كل سطر وفكّر في دوره.",
              "حان وقت التطبيق. هذا المقطع البرمجي مأخوذ من نمط يُستخدم فعلًا في المشاريع الحقيقية؛ اقرأه بهدوء ولاحظ التعليقات بين الأسطر."
            ], n))]
          });
        }

        ch.push({
          kind: "pitfall", name: ["Mistake vs. tip", "خطأ شائع ونصيحة"], minDur: 9,
          clips: [
            clip(`${pick(["انتبه لهذا الخطأ الشائع: ", "من الأخطاء التي يقع فيها كثيرون: ", "احذر من هذا الفخ: "], n)}${endDot(enr.mistake[1])}`),
            clip(`${pick(["والصواب: ", "أما النصيحة الذهبية فهي: ", "وبدلًا من ذلك: "], n)}${endDot(enr.bestPractice[1])}`)
          ]
        });

        const q = enr.quiz;
        const question = `أي مبدأ هندسي صحيح بخصوص «${topicAr(l.t[1])}»؟`;
        ch.push({
          kind: "quiz", name: ["Quick check", "اختبار سريع"], minDur: 10,
          clips: [
            clip(`${pick(["والآن اختبار سريع لفهمك. ", "لنختبر فهمك سريعًا. ", "سؤال سريع قبل أن نختم. "], n)}${question} ${pick(["اقرأ الخيارات الثلاثة على الشاشة، وفكّر قليلًا.", "أمامك ثلاثة خيارات؛ اختر إجابتك قبل انتهاء العدّ.", "تأمّل الخيارات واختر إجابتك."], n)}`),
            clip(`الإجابة الصحيحة هي الخيار ${LETTERS[q.ans]}: ${endDot(q.opts[q.ans][1])}`)
          ],
          data: { question, countdown: 6 }
        });

        const nx = l.next;
        ch.push({
          kind: "outro", name: ["Summary", "الخلاصة"], minDur: 8,
          clips: [clip(`لنلخّص الدرس في جملة واحدة: ${firstSentence(l.d[1])} ${nx ? pick(["وفي الدرس القادم: ", "ونلتقي في الدرس التالي مع: ", "وفي الدرس القادم سنتعرّف على: "], n) + endDot(clean(nx.t[1])) : "وبهذا نصل إلى آخر درس في الكورس."}`)],
          data: { next: nx ? { id: nx.id, t: nx.t } : null }
        });

        segments.push({
          id: `${String(si + 1).padStart(2, "0")}-${String(mi + 1).padStart(2, "0")}-${String(n + 1).padStart(3, "0")}-${l.id}`,
          kind: "lesson", lesson: l.id, no: n + 1, stage: st.id, module: m.id, acc: l.acc,
          title: [l.t[0], title],
          chapters: ch
        });
      });
    });
  });

  segments.push({
    id: "99-outro", kind: "course", acc: "#4fd1a5",
    title: ["Course complete", "نهاية الكورس"],
    chapters: [{
      kind: "courseOutro", name: ["Congratulations", "مبروك"], minDur: 10,
      clips: [clip(`مبروك! أنهيت كورس مهندس الذكاء الاصطناعي بالكامل: ${flat.length} درسًا من المفاهيم الأساسية حتى بناء الوكلاء ونشرها في بيئة الإنتاج.
        راجع الدروس التي تحتاجها، وطبّق المشروع الختامي بنفسك، ثم اختبر مستواك في الاختبار النهائي على المنصة. بالتوفيق، وإلى اللقاء!`)],
      data: { lessons: flat.length }
    }]
  });

  return { voice, rate, created: new Date().toISOString(), segments };
}

// Human-readable Arabic script for review.
function scriptMarkdown(script) {
  let md = `# نص التعليق الصوتي — كورس مهندس الذكاء الاصطناعي\n\nالصوت: ${script.voice} (${script.rate})\n\n`;
  for (const s of script.segments) {
    md += `\n## ${s.id} — ${s.title[1]}\n\n`;
    for (const c of s.chapters) {
      md += `**${c.name[1]}**\n\n` + c.clips.map(k => "> " + k.text).join("\n>\n") + "\n\n";
    }
  }
  return md;
}

module.exports = { buildScript, scriptMarkdown, LETTERS, shortAr, clean };
