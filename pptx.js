// Real PowerPoint (.pptx) Exporter using PptxGenJS (loaded on-demand from CDN with clean PDF print fallback)
(function () {
  let loading = null;
  function loadPptxGen() {
    if (window.PptxGenJS) return Promise.resolve(window.PptxGenJS);
    if (loading) return loading;
    loading = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js";
      s.onload = () => window.PptxGenJS ? resolve(window.PptxGenJS) : reject(new Error("PptxGenJS unavailable"));
      s.onerror = () => reject(new Error("Offline / CDN blocked"));
      document.head.appendChild(s);
    });
    return loading;
  }

  const hex = c => String(c || "#f5a524").replace("#", "");

  window.exportLessonPptx = async function (l, next, src, theme) {
    try {
      const PptxGenJS = await loadPptxGen();
      const pptx = new PptxGenJS();
      pptx.layout = "LAYOUT_WIDE"; // 13.33 x 7.5 in
      pptx.author = "AI Engineer Course Studio";
      pptx.title = `${l.id} - ${l.t[0]}`;

      const dark = theme !== "light";
      const BG = dark ? "0B1524" : "F8FAFC";
      const CARD = dark ? "13243A" : "FFFFFF";
      const INK = dark ? "F1F5F9" : "0A1628";
      const MUTED = dark ? "94A9C2" : "51657C";
      const ACC = hex(l.acc);
      const enr = window.enrichLesson ? window.enrichLesson(l) : null;

      function chrome(s, title) {
        s.background = { color: BG };
        s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.33, h: 0.65, fill: { color: dark ? "07101E" : "EEF2F7" } });
        s.addText(`${l.id}  ·  ${title}`, { x: 0.5, y: 0.14, w: 8.5, h: 0.38, fontSize: 13, bold: true, color: INK, fontFace: "Calibri" });
        s.addText(l.module.t[1], { x: 9.0, y: 0.14, w: 3.8, h: 0.38, fontSize: 12, color: ACC, align: "right", rtlMode: true, fontFace: "Arial" });
        s.addShape(pptx.ShapeType.rect, { x: 0.5, y: 7.05, w: 0.55, h: 0.08, fill: { color: ACC } });
        s.addText("AI Engineer Course · مهندس الذكاء الاصطناعي", { x: 1.2, y: 6.95, w: 7, h: 0.3, fontSize: 10, color: MUTED });
      }

      // 1. Cover
      let s = pptx.addSlide();
      s.background = { color: "071120" };
      s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 4.1, h: 7.5, fill: { color: ACC } });
      s.addText(l.stage.t[0].toUpperCase(), { x: 0.45, y: 0.6, w: 3.3, h: 0.45, fontSize: 12, bold: true, color: "07101E" });
      s.addText(l.id, { x: 0.4, y: 2.3, w: 3.4, h: 2.0, fontSize: 82, bold: true, color: "07101E" });
      s.addText(`${l.min} MIN`, { x: 0.45, y: 6.4, w: 2.5, h: 0.45, fontSize: 14, bold: true, color: "07101E" });
      s.addText(l.t[0], { x: 4.6, y: 1.5, w: 8.2, h: 1.8, fontSize: 34, bold: true, color: "FFFFFF" });
      s.addText(l.t[1], { x: 4.6, y: 3.5, w: 8.2, h: 1.4, fontSize: 26, bold: true, color: "CBD5E1", align: "right", rtlMode: true, fontFace: "Arial" });
      s.addText(`${l.module.t[0]}  |  ${l.module.t[1]}`, { x: 4.6, y: 5.7, w: 8.2, h: 0.5, fontSize: 13, color: "94A9C2" });

      // 2. Mental Model / Analogy
      if (enr) {
        s = pptx.addSlide();
        chrome(s, "Mental Model · القصة والتشبيه");
        s.addShape(pptx.ShapeType.roundRect, { x: 0.6, y: 1.2, w: 12.1, h: 2.4, fill: { color: CARD }, line: { color: ACC, width: 1.5 } });
        s.addText("MENTAL MODEL", { x: 0.9, y: 1.38, w: 4, h: 0.35, fontSize: 11, bold: true, color: ACC });
        s.addText(enr.analogy[0], { x: 0.9, y: 1.8, w: 11.5, h: 1.6, fontSize: 20, color: INK });
        s.addShape(pptx.ShapeType.roundRect, { x: 0.6, y: 4.0, w: 12.1, h: 2.4, fill: { color: CARD }, line: { color: ACC, width: 1.5 } });
        s.addText("التشبيه المبسط", { x: 8.4, y: 4.18, w: 4, h: 0.35, fontSize: 12, bold: true, color: ACC, align: "right", rtlMode: true, fontFace: "Arial" });
        s.addText(enr.analogy[1], { x: 0.9, y: 4.6, w: 11.5, h: 1.6, fontSize: 20, color: INK, align: "right", rtlMode: true, fontFace: "Arial" });
      }

      // 3. Overview
      s = pptx.addSlide();
      chrome(s, "Overview · نظرة عامة");
      s.addShape(pptx.ShapeType.roundRect, { x: 0.6, y: 1.2, w: 5.85, h: 5.3, fill: { color: CARD }, line: { color: ACC, width: 1.2 } });
      s.addText("OVERVIEW", { x: 0.9, y: 1.5, w: 4, h: 0.35, fontSize: 12, bold: true, color: ACC });
      s.addText(l.d[0], { x: 0.9, y: 2.0, w: 5.25, h: 4.1, fontSize: 18, color: INK });
      s.addShape(pptx.ShapeType.roundRect, { x: 6.85, y: 1.2, w: 5.85, h: 5.3, fill: { color: CARD }, line: { color: ACC, width: 1.2 } });
      s.addText("نظرة عامة", { x: 8.4, y: 1.5, w: 4, h: 0.35, fontSize: 13, bold: true, color: ACC, align: "right", rtlMode: true, fontFace: "Arial" });
      s.addText(l.d[1], { x: 7.15, y: 2.0, w: 5.25, h: 4.1, fontSize: 19, color: INK, align: "right", rtlMode: true, fontFace: "Arial" });

      // 4. Key Points
      l.p.forEach((pt, idx) => {
        s = pptx.addSlide();
        chrome(s, `Key Point ${idx + 1} / ${l.p.length}`);
        s.addShape(pptx.ShapeType.rect, { x: 0, y: 0.65, w: 3.1, h: 6.15, fill: { color: "0E1C2F" } });
        s.addText(String(idx + 1).padStart(2, "0"), { x: 0.4, y: 2.1, w: 2.4, h: 1.8, fontSize: 84, bold: true, color: ACC });
        s.addText(`POINT ${idx + 1} OF ${l.p.length}`, { x: 0.45, y: 4.1, w: 2.4, h: 0.4, fontSize: 12, color: "94A9C2" });
        s.addShape(pptx.ShapeType.roundRect, { x: 3.55, y: 1.25, w: 9.2, h: 2.4, fill: { color: CARD } });
        s.addText(pt[0], { x: 3.9, y: 1.5, w: 8.5, h: 1.9, fontSize: 23, bold: true, color: INK });
        s.addShape(pptx.ShapeType.roundRect, { x: 3.55, y: 4.0, w: 9.2, h: 2.4, fill: { color: CARD } });
        s.addText(pt[1], { x: 3.9, y: 4.25, w: 8.5, h: 1.9, fontSize: 22, color: MUTED, align: "right", rtlMode: true, fontFace: "Arial" });
      });

      // 5. Code Example
      if (l.ex) {
        s = pptx.addSlide();
        chrome(s, "Hands-on Code · مثال عملي");
        s.addShape(pptx.ShapeType.roundRect, { x: 0.6, y: 1.15, w: 12.1, h: 5.5, fill: { color: "081220" }, line: { color: "26405E", width: 1.5 } });
        s.addText(l.ex, { x: 0.95, y: 1.45, w: 11.4, h: 4.9, fontSize: 16, fontFace: "Consolas", color: "E2E8F0" });
      }

      // 6. Pitfall vs Pro Tip
      if (enr) {
        s = pptx.addSlide();
        chrome(s, "Avoid vs. Pro Tip · خطأ شائع ونصيحة خبير");
        s.addShape(pptx.ShapeType.roundRect, { x: 0.6, y: 1.2, w: 5.85, h: 5.3, fill: { color: dark ? "24161D" : "FFF5F3" }, line: { color: "F2795B", width: 2 } });
        s.addText("❌ COMMON MISTAKE", { x: 0.9, y: 1.5, w: 5, h: 0.4, fontSize: 13, bold: true, color: "F2795B" });
        s.addText(enr.mistake[0], { x: 0.9, y: 2.1, w: 5.25, h: 1.9, fontSize: 17, bold: true, color: INK });
        s.addText(enr.mistake[1], { x: 0.9, y: 4.2, w: 5.25, h: 1.9, fontSize: 17, color: MUTED, align: "right", rtlMode: true, fontFace: "Arial" });

        s.addShape(pptx.ShapeType.roundRect, { x: 6.85, y: 1.2, w: 5.85, h: 5.3, fill: { color: dark ? "0F2526" : "F0FDF9" }, line: { color: "4FD1A5", width: 2 } });
        s.addText("✅ BEST PRACTICE", { x: 7.15, y: 1.5, w: 5, h: 0.4, fontSize: 13, bold: true, color: "4FD1A5" });
        s.addText(enr.bestPractice[0], { x: 7.15, y: 2.1, w: 5.25, h: 1.9, fontSize: 17, bold: true, color: INK });
        s.addText(enr.bestPractice[1], { x: 7.15, y: 4.2, w: 5.25, h: 1.9, fontSize: 17, color: MUTED, align: "right", rtlMode: true, fontFace: "Arial" });
      }

      // 7. Closing
      s = pptx.addSlide();
      s.background = { color: "071120" };
      s.addText("Questions? · أسئلة؟", { x: 0.7, y: 1.6, w: 6, h: 1.2, fontSize: 40, bold: true, color: "FFFFFF" });
      s.addText(`Source: ${src[0]}`, { x: 0.7, y: 3.1, w: 6, h: 0.6, fontSize: 14, color: "94A9C2" });
      s.addShape(pptx.ShapeType.roundRect, { x: 7.1, y: 1.7, w: 5.5, h: 3.6, fill: { color: "13243A" }, line: { color: ACC, width: 1.5 } });
      s.addText(next ? "NEXT LESSON · الدرس التالي" : "FINAL EXAM · الاختبار النهائي", { x: 7.4, y: 2.0, w: 4.9, h: 0.4, fontSize: 12, bold: true, color: ACC });
      s.addText(next ? `${next.id} · ${next.t[0]}` : "Take the End-of-Course Level Exam", { x: 7.4, y: 2.6, w: 4.9, h: 1.1, fontSize: 20, bold: true, color: "FFFFFF" });
      s.addText(next ? next.t[1] : "اختبر مستواك واحصل على الشهادة", { x: 7.4, y: 3.9, w: 4.9, h: 1.0, fontSize: 18, color: "CBD5E1", align: "right", rtlMode: true, fontFace: "Arial" });

      await pptx.writeFile({ fileName: `AI-Engineer-${l.id.replace(/\./g, "-")}.pptx` });
      return true;
    } catch (e) {
      alert("PowerPoint (.pptx) generator needs internet to load PptxGenJS. Opening print-to-PDF instead.");
      window.print();
      return false;
    }
  };
})();
