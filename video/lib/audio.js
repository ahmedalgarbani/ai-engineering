// Procedural soundtrack: ambient music bed + transition SFX + narration mix with ducking.
// Everything is synthesized here, so the video has no third-party audio licensing.
const { decodeMono, writeWav } = require("./media");

const RATE = 48000;
const midi = m => 440 * Math.pow(2, (m - 69) / 12);

// ---------- music: seamless 64 s loop (Am – F – C – G, twice) ----------
let MUSIC = null;
function music() {
  if (MUSIC) return MUSIC;
  const LOOP = 64, N = LOOP * RATE, TAIL = 4 * RATE;
  const L = new Float32Array(N + TAIL), R = new Float32Array(N + TAIL);
  const chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]];
  const bass = [45, 41, 36, 43];
  const CH = 8; // seconds per chord
  for (let c = 0; c < 8; c++) {
    const chord = chords[c % 4], t0 = c * CH, len = CH + 3;
    const s0 = Math.floor(t0 * RATE), n = Math.floor(len * RATE);
    const voices = chord.map(m => [midi(m), midi(m) * 1.0035, midi(m + 12)]).concat([[midi(bass[c % 4]), midi(bass[c % 4]) * 0.998, 0]]);
    for (let i = 0; i < n; i++) {
      const t = i / RATE;
      const env = Math.min(1, t / 2.2) * Math.min(1, (len - t) / 2.6);
      let l = 0, r = 0;
      voices.forEach(([f1, f2, f3], v) => {
        const isBass = v === voices.length - 1;
        const a = Math.sin(2 * Math.PI * f1 * t), b = Math.sin(2 * Math.PI * f2 * t + 0.7), h = f3 ? Math.sin(2 * Math.PI * f3 * t) * 0.18 : 0;
        const g = isBass ? 0.30 : 0.16;
        const lfo = 1 + 0.12 * Math.sin(2 * Math.PI * (0.07 + v * 0.013) * (t0 + t));
        l += (a * 0.7 + h) * g * lfo; r += (b * 0.7 + h) * g * lfo;
      });
      L[s0 + i] += l * env; R[s0 + i] += r * env;
    }
    // soft plucked arpeggio, alternating pan
    const arp = [chord[0] + 12, chord[1] + 12, chord[2] + 12, chord[1] + 12, chord[0] + 24, chord[2] + 12, chord[1] + 12, chord[2] + 12];
    for (let k = 0; k < 16; k++) {
      const f = midi(arp[k % arp.length]), st = s0 + Math.floor(k * 0.5 * RATE), dn = Math.floor(1.6 * RATE);
      const pan = k % 2 ? 0.3 : 0.7;
      for (let i = 0; i < dn && st + i < L.length; i++) {
        const t = i / RATE, e = Math.exp(-t * 3.2) * Math.min(1, t / 0.006);
        const v = (Math.sin(2 * Math.PI * f * t) + 0.25 * Math.sin(4 * Math.PI * f * t)) * e * 0.07;
        L[st + i] += v * (1 - pan); R[st + i] += v * pan;
      }
    }
  }
  // fold the tail into the start → seamless loop; gentle one-pole low-pass
  for (let i = 0; i < TAIL; i++) { L[i] += L[N + i]; R[i] += R[N + i]; }
  const outL = new Float32Array(N), outR = new Float32Array(N);
  let yl = 0, yr = 0; const a = 0.18;
  for (let pass = 0; pass < 2; pass++) for (let i = 0; i < N; i++) { yl += a * (L[i] - yl); yr += a * (R[i] - yr); if (pass) { outL[i] = yl; outR[i] = yr; } }
  let peak = 0; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(outL[i]), Math.abs(outR[i]));
  for (let i = 0; i < N; i++) { outL[i] /= peak; outR[i] /= peak; }
  MUSIC = { L: outL, R: outR, N };
  return MUSIC;
}

// ---------- SFX ----------
function rng(seed) { let x = seed >>> 0 || 1; return () => ((x ^= x << 13, x ^= x >>> 17, x ^= x << 5) >>> 0) / 4294967296 * 2 - 1; }
function whoosh(seed) {
  const n = Math.floor(0.9 * RATE), L = new Float32Array(n), R = new Float32Array(n), rnd = rng(seed + 7);
  let b0 = 0, b1 = 0;
  for (let i = 0; i < n; i++) {
    const t = i / RATE, p = t / 0.9;
    const env = Math.pow(Math.sin(Math.PI * Math.min(1, p * 1.25)), 2) * (p < 0.8 ? 1 : (1 - p) / 0.2);
    const fc = 300 + 2600 * Math.sin(Math.PI * p);           // band sweeps up then down
    const q = 2 * Math.sin(Math.PI * fc / RATE);
    const x = rnd();
    b0 += q * (x - b0 - b1 * 0.5); b1 += q * b0;             // crude state-variable band-pass
    const v = b0 * env * 0.9;
    const pan = 1 - p;                                        // right → left (RTL motion)
    L[i] = v * (0.35 + 0.65 * (1 - pan)); R[i] = v * (0.35 + 0.65 * pan);
  }
  return { L, R };
}
function tone(freqs, dur, decay, gain) {
  const n = Math.floor(dur * RATE), L = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / RATE;
    let v = 0;
    freqs.forEach(([f, d]) => { if (t >= d) { const u = t - d; v += Math.sin(2 * Math.PI * f * u) * Math.exp(-u * decay) * Math.min(1, u / 0.004); } });
    L[i] = v * gain;
  }
  return { L, R: L };
}
const SFX = {
  whoosh: [whoosh(1), whoosh(2), whoosh(3)],
  tick: tone([[1180, 0]], 0.09, 60, 0.25),
  chime: tone([[1318.5, 0], [1975.5, 0.11], [2637, 0.22]], 1.4, 3.2, 0.18),
  impact: tone([[110, 0], [55, 0]], 1.6, 2.4, 0.5)
};

function addAt(dstL, dstR, src, at, gain) {
  const s0 = Math.floor(at * RATE);
  for (let i = 0; i < src.L.length; i++) {
    const k = s0 + i; if (k < 0 || k >= dstL.length) continue;
    dstL[k] += src.L[i] * gain; dstR[k] += src.R[i] * gain;
  }
}

// Mix one segment → stereo WAV of exactly `frames / fps` seconds.
async function mixSegment(plan, ttsDir, outWav, frames, fps) {
  const N = Math.round(frames / fps * RATE);
  const L = new Float32Array(N), R = new Float32Array(N);
  const voice = new Float32Array(N);
  const speaking = new Uint8Array(N);

  for (const c of plan.chapters) {
    for (const k of c.clips) {
      const pcm = await decodeMono(`${ttsDir}/${k.key}.mp3`, RATE);
      const s0 = Math.floor((c.start + k.at) * RATE);
      for (let i = 0; i < pcm.length && s0 + i < N; i++) voice[s0 + i] += pcm[i];
      const a = Math.max(0, s0 - 0.25 * RATE), b = Math.min(N, s0 + pcm.length + 0.35 * RATE);
      for (let i = a; i < b; i++) speaking[i] = 1;
    }
  }

  // music bed with ducking
  const M = music(), off = Math.floor((plan.musicOffset || 0) * RATE);
  const fadeIn = 1.2 * RATE, fadeOut = 1.6 * RATE;
  const isCard = plan.kind !== "lesson";
  const hi = isCard ? 0.24 : 0.17, lo = 0.055;
  let g = hi; const coef = 1 / (0.28 * RATE);
  for (let i = 0; i < N; i++) {
    const target = speaking[i] ? lo : hi;
    g += (target - g) * coef;
    const f = Math.min(1, i / fadeIn, (N - i) / fadeOut);
    const m = (off + i) % M.N;
    L[i] += M.L[m] * g * f; R[i] += M.R[m] * g * f;
  }

  // transitions + cues
  plan.chapters.forEach((c, i) => {
    if (i > 0 && (c.sec || c.kind !== "beat")) addAt(L, R, SFX.whoosh[i % 3], c.start - 0.12, c.kind === "beat" ? 0.13 : 0.2); // explainers: only at section starts
    if (c.kind === "quiz") {
      const n = Math.max(1, Math.round(c.extra.reveal - c.extra.countFrom));
      for (let k = 0; k < n; k++) addAt(L, R, SFX.tick, c.start + c.extra.countFrom + k * ((c.extra.reveal - c.extra.countFrom) / n), 1);
      addAt(L, R, SFX.chime, c.start + c.extra.reveal, 1);
    }
  });
  if (isCard) addAt(L, R, SFX.impact, 0.25, 0.55);
  if (plan.kind === "lesson") addAt(L, R, SFX.whoosh[0], 0.05, 0.16);

  // voice on top (centered) + simple peak limiter
  for (let i = 0; i < N; i++) { L[i] += voice[i] * 0.95; R[i] += voice[i] * 0.95; }
  let peak = 0; for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  if (peak > 0.97) { const s = 0.97 / peak; for (let i = 0; i < N; i++) { L[i] *= s; R[i] *= s; } }
  writeWav(outWav, L, R, RATE);
}

// Mastering applied when muxing: fixed gain + brickwall limiter (same for every segment, ~-16 LUFS).
const MASTER_AF = "volume=4dB,alimiter=limit=0.89:attack=4:release=60:level=false";

module.exports = { mixSegment, RATE, MASTER_AF };
