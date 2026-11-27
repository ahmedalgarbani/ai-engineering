// Loads the course data and the motion explainers (written for the browser) into Node.
const path = require("path");
const fs = require("fs");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..", "..");
const ACC = { C: "#f5a524", S1: "#3db4f2", S2: "#22c3a6", S3: "#f2795b", S4: "#e8618c", S5: "#9ccc65", S6: "#a855f7", S7: "#06b6d4", S8: "#6366f1" };
const EXPLAINER_FILES = ["explainer.js", ...["c", "s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"].map(f => `explainers/${f}.js`)];

// voice = { voice, rate } decides the clip keys, so it must be set before any film is built.
function loadCourse(voice) {
  const ctx = { console };
  ctx.window = ctx;
  if (voice) ctx.EXPLAINER_VOICE = { voice: voice.voice, rate: voice.rate };
  vm.createContext(ctx);
  for (const f of ["data0.js", "data1.js", "data2.js", "data3.js", "data4.js", "data5.js", "agentic.js", ...EXPLAINER_FILES]) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), ctx, { filename: f });
  }
  const { COURSE, SRC, Explainer } = ctx;
  const flat = [];
  COURSE.stages.forEach((st, si) => {
    st.no = si;
    st.acc = ACC[st.id];
    st.modules.forEach((m, mi) => {
      m.no = mi;
      m.lessons.forEach(l => { l.stage = st; l.module = m; l.acc = ACC[st.id]; flat.push(l); });
    });
  });
  flat.forEach((l, i) => { l.index = i; l.next = flat[i + 1] || null; });
  return { COURSE, SRC, flat, X: Explainer, ACC };
}

module.exports = { loadCourse, ROOT, EXPLAINER_FILES };
