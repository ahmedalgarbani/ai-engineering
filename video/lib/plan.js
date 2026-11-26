// Turns the narration script + measured clip durations into an exact timeline.
const T = {
  transition: 0.7, // chapter-to-chapter transition length (s)
  lead: 0.85,      // silence before the first voice clip of a chapter
  tail: 1.0,       // breathing room after the last clip
  gap: 0.45        // pause between clips inside a chapter
};

function planSegment(seg, dur) {
  let t = 0;
  const chapters = seg.chapters.map((c, ci) => {
    const clips = [];
    const extra = {};
    let cur = T.lead + (ci === 0 ? 0.3 : 0);
    if (c.kind === "quiz") {
      const d0 = dur(c.clips[0]);
      clips.push({ ...c.clips[0], at: cur, dur: d0 });
      extra.countFrom = cur + d0;
      extra.reveal = extra.countFrom + (c.data.countdown || 3.5);
      const d1 = dur(c.clips[1]);
      clips.push({ ...c.clips[1], at: extra.reveal + 0.55, dur: d1 });
      cur = extra.reveal + 0.55 + d1;
    } else {
      c.clips.forEach((k, i) => {
        const d = dur(k);
        if (i > 0) cur += T.gap;
        clips.push({ ...k, at: cur, dur: d });
        if (c.kind === "pitfall" && i === 1) extra.second = Math.max(1.2, cur - 0.25);
        cur += d;
      });
    }
    const d = Math.max(c.minDur || 6, cur + T.tail);
    const out = { kind: c.kind, name: c.name, data: c.data || {}, start: t, dur: +d.toFixed(3), clips, extra };
    t += d;
    return out;
  });
  return { id: seg.id, kind: seg.kind, title: seg.title, acc: seg.acc, lesson: seg.lesson, no: seg.no, stage: seg.stage, module: seg.module, total: +t.toFixed(3), chapters, transition: T.transition };
}

module.exports = { planSegment, T };
