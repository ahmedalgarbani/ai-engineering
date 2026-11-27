# Motion explainers — authoring guide

One file per stage (`c.js`, `s1.js` … `s8.js`). Each lesson is a list of **beats**; each beat is one
narrated sentence plus the animation that happens while it is spoken. The picture carries over from
beat to beat and keeps transforming (3Blue1Brown style); it is not a slide deck.

```js
X.lesson("C3.1", [
  { sec: "الفهرسة", say: "نقسّم المستندات إلى مقاطع صغيرة.", eq: "@T{index}: split @to embed @to store", do: s => { … } },
  …
]);
```

| key | meaning |
|---|---|
| `say` | Arabic narration and on-screen caption (simple MSA, ≤ ~80 chars, one idea) |
| `eq` | formula under the caption (KaTeX). Inherited by later beats until changed; `null` clears it |
| `sec` | starts a named section (chapter button in the player) |
| `do(s)` | the animation, scheduled from the beat start |
| `hold`, `min` | extra seconds / minimum beat length |

**Formula syntax:** `@` = `\`, and words of 2+ letters become upright text automatically
(`agent = LLM + tools + loop`). Colors: `@B{}` blue · `@O{}` orange · `@G{}` green · `@Y{}` gold ·
`@R{}` red · `@C{}` teal · `@P{}` purple · `@K{}` pink · `@M{}` muted. `@T{..}` forces text.

## Canvas
1600 × 900. The caption and formula occupy the top (y < 190); draw in y ≈ 210 – 870, centered on x = 800.
Colors: `ink soft dim faint grid panel bg blue orange green gold teal red purple pink cyan`.
Latin labels default to the serif math font; Arabic text switches font automatically; `font: "mono"` for code/ids, `"ui"` for sans.

## Creating (every creator takes `(id, params, opts)`)
`text` · `box` (label, sub, icon, w/h auto) · `zone` (dashed panel, label on top) · `arrow` / `line` (x1..y2) ·
`link(id, a, b, p)` (arrow attached to two objects, follows them) · `dot` · `plane` (grid, matrix `m`) ·
`vec` (on a plane: `{plane, v:[x,y], tip:"dot"}`) · `bar` (`v` 0..1) · `icon` (`name`, `s`) · `doc` (`hl` line) ·
`code` (`lines`, `hl`) · `bubble` (`side: u|a|t|s`) · `arc` · `matrix` (`data`, `heat`) · `ring` (`spin`, `speed`) ·
`num` (`v`) · `brace` · `gauge` (`v`) · `path` (`d`) · `badge` (`text`, `color`) · `curve` (`pts`, `xlabel`, `ylabel`).

Helpers: `row(pre, labels, p)` tokens · `col(pre, labels, p)` list (icons/colors) · `chain(pre, labels, p)` boxes + arrows
(`pre_i` arrows; `vertical`, `icons`, `subs`, `colors`, `pulse: true` for live animated signal) · `hub(center, pre, labels, p)` ·
`grid(pre, labels, p)` · `versus(pre, left, right)` → panels `preL`/`preR` (returns their x) · `mark(id, target, "x"|"check")` ·
`note(id, p)` · `callout(id, p)` pill badge · `chart(pre, {xl, yl, curves})` axes + animated curves.

opts: `at` (seconds or `"45%"` of the narration — works on EVERY creator & layout helper!), `dur`, `in` (`fade rise drop pop grow draw type slide none`), `st` (stagger), `ease`.

## Motion
`to(sel, props, o)` (props may be functions of the old value; `dx`, `dy`; `v:[x,y]` for vectors) ·
`out(sel, {how})` · `clear({keep})` (also resets camera to 1×) · `pulse(sel, {color})` · `flow(a, b, {n, color, bend})` ·
`stream(a, b, {span, every, color, bend})` continuous packet stream · `focus(sel, {zoom, dim, color})` / `unfocus()` 3Blue1Brown spotlight ·
`cam({x, y, z})` · `wait(d)` / `at(t)` move the beat cursor · `get(id)` current target props · `P(plane, x, y)` → screen point.
Selectors: an id, `"pre*"` prefix, or an array.

## Style rules
- Start from a concrete example, build ONE picture, then transform/zoom/focus it; each beat changes something visible across the narration (`at: "0%"`, `"35%"`, `"65%"`).
- Minimize `s.clear()`: reuse and morph objects with `to()`, `focus()`, `unfocus()`, `cam()`, and `out()` instead of wiping every beat!
- Use `pulse: true` on key links/arrows and `s.stream(...)` so data flows stay alive while the narrator speaks.
- Pattern: concrete example → why naive fails → mechanism step by step (+ formulas) → real code/trace → common mistake vs fix → one-picture summary.
- **Target depth**: 10–15 beats, 4–5 sections, **~80–135 seconds (~1.5–2.2 min)** per lesson (up to ~18–22 beats for flagship topics like `C2.2`).
- Captions: simple MSA Arabic, ≤ ~115 chars, one crisp idea; English technical terms stay in Latin in captions and diagrams (`ttsText` pronounces them cleanly in Arabic!).
- QA: `node video/lib/lint.js <id|stage>` MUST return **0 findings**.
