"""Generate Arabic narration clips with Microsoft Edge neural voices (edge-tts).

usage: python tts.py <jobs.json> <out_dir> [--voice V] [--rate +0%] [--concurrency 6]
jobs.json = [{"key": "...", "text": "..."}]. Writes <key>.mp3 and <key>.json
(sentence boundaries, seconds). Existing outputs are skipped, so reruns are cheap.
"""
import argparse
import asyncio
import json
import os
import sys

import edge_tts


async def synth(job, out_dir, voice, rate, sem, stats):
    mp3 = os.path.join(out_dir, job["key"] + ".mp3")
    meta = os.path.join(out_dir, job["key"] + ".json")
    if os.path.exists(mp3) and os.path.exists(meta):
        stats["cached"] += 1
        return
    async with sem:
        for attempt in range(4):
            try:
                comm = edge_tts.Communicate(job["text"], voice, rate=rate, boundary="SentenceBoundary")
                audio = bytearray()
                bounds = []
                async for chunk in comm.stream():
                    if chunk["type"] == "audio":
                        audio.extend(chunk["data"])
                    elif chunk["type"] in ("SentenceBoundary", "WordBoundary"):
                        bounds.append({
                            "start": chunk["offset"] / 1e7,
                            "end": (chunk["offset"] + chunk["duration"]) / 1e7,
                            "text": chunk["text"],
                        })
                if not audio:
                    raise RuntimeError("no audio returned")
                tmp = mp3 + ".part"
                with open(tmp, "wb") as f:
                    f.write(audio)
                os.replace(tmp, mp3)
                with open(meta, "w", encoding="utf-8") as f:
                    json.dump({"text": job["text"], "voice": voice, "rate": rate, "sentences": bounds}, f, ensure_ascii=False)
                stats["done"] += 1
                total = stats["done"] + stats["cached"]
                if stats["done"] % 20 == 0:
                    print(f"  tts {total}/{stats['total']}", flush=True)
                return
            except Exception as e:  # network hiccups / throttling
                wait = 2 ** attempt
                print(f"  retry {job['key']} in {wait}s: {e}", file=sys.stderr, flush=True)
                await asyncio.sleep(wait)
        stats["failed"].append(job["key"])


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("jobs")
    ap.add_argument("out_dir")
    ap.add_argument("--voice", default="ar-SA-HamedNeural")
    ap.add_argument("--rate", default="+0%")
    ap.add_argument("--concurrency", type=int, default=6)
    a = ap.parse_args()
    os.makedirs(a.out_dir, exist_ok=True)
    with open(a.jobs, encoding="utf-8") as f:
        jobs = json.load(f)
    stats = {"done": 0, "cached": 0, "failed": [], "total": len(jobs)}
    sem = asyncio.Semaphore(a.concurrency)
    await asyncio.gather(*(synth(j, a.out_dir, a.voice, a.rate, sem, stats) for j in jobs))
    print(f"tts: {stats['done']} new, {stats['cached']} cached, {len(stats['failed'])} failed", flush=True)
    if stats["failed"]:
        print("failed keys: " + ", ".join(stats["failed"]), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(main())
