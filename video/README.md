# فيديو الكورس بالعربية — Arabic course video builder

Turns the 84 lessons in `../data*.js` into one long Arabic explainer video, with neural
Arabic narration, animated motion graphics for every lesson, transitions, a music bed, SFX,
chapters and Arabic subtitles.

## Requirements

- Node 18+ and Python 3.8+
- Google Chrome installed (used headless to render frames)
- Internet access (Google Fonts, plus Microsoft Edge neural TTS through `edge-tts`)

```bash
cd video
npm install
python -m pip install edge-tts
```

## Build

```bash
node build.js all                 # script → tts → plan → render → assemble
```

Or step by step:

| Step | Command | Output |
|---|---|---|
| Narration script | `node build.js script` | `out/narration_ar.md` (read and review it) |
| Voice-over | `node build.js tts` | `out/tts/*.mp3` (cached by text) |
| Timeline | `node build.js plan` | `out/plan.json` |
| Visual QA | `node build.js stills C1.1` | `out/stills/<segment>/*.png` |
| Render | `node build.js render --workers 5` | `out/segments/*.mp4` (resumable) |
| Join | `node build.js assemble` | see below |

`render --only C1.1,S2` renders selected lessons or stages. Finished segments are skipped
unless their timeline or the scene code changed.

## Final files (`out/`)

- `AI-Engineer-Course-Arabic.mp4`: the full course, with embedded chapters and an Arabic subtitle track
- `AI-Engineer-Course-Arabic.srt`: subtitles, for YouTube upload
- `AI-Engineer-Course-Arabic.chapters.txt`: YouTube chapter timestamps for the description
- `stages/*.mp4` (+ `.srt`, `.chapters.txt`): one video per stage
- `segments/*.mp4`: one video per lesson

## Structure of every lesson

Intro and lesson plan → analogy → animated diagram with an Arabic caption → key points, one
scene each → live code (when the lesson has an example) → common mistake vs. pro tip →
quick quiz with a countdown → summary and next lesson.

## Options

`--voice ar-SA-ZariyahNeural` (female) or any voice from `python -m edge_tts --list-voices | grep ^ar-`,
`--rate +10%`, `--fps 30`, `--crf 20`, `--encoder nvenc` (NVIDIA GPU).
After changing the voice or rate, run `script`, `tts`, `plan` and `render` again.

## Files

- `build.js`: CLI
- `lib/script.js`: Arabic narration templates
- `lib/plan.js`: timing
- `lib/audio.js`: music, SFX and mix
- `lib/render.js`: headless frame capture into ffmpeg
- `lib/subs.js`: SRT
- `page/arscenes.js`: Arabic-first animated SVG scenes
- `page/stage.js`: deterministic timeline (transitions, Ken Burns, overlays)
- `tts.py`: edge-tts worker
