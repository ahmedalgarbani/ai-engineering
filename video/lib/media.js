// ffmpeg / ffprobe helpers.
const { spawn, execFile } = require("child_process");
const fs = require("fs");

const FFMPEG = require("ffmpeg-static");
const FFPROBE = require("ffprobe-static").path;

function run(bin, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(bin, args, { windowsHide: true, ...opts });
    let err = "";
    p.stderr && p.stderr.on("data", d => { err += d; if (err.length > 20000) err = err.slice(-20000); });
    p.on("error", reject);
    p.on("close", code => code === 0 ? resolve() : reject(new Error(`${bin} exited ${code}\n${err.slice(-3000)}`)));
  });
}

function probeDuration(file) {
  return new Promise((resolve, reject) => {
    execFile(FFPROBE, ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], { windowsHide: true }, (e, out) => {
      if (e) return reject(e);
      resolve(parseFloat(String(out).trim()));
    });
  });
}

// Decode any audio file to mono Float32 PCM at `rate` Hz.
function decodeMono(file, rate) {
  return new Promise((resolve, reject) => {
    const p = spawn(FFMPEG, ["-v", "error", "-i", file, "-f", "f32le", "-ac", "1", "-ar", String(rate), "-"], { windowsHide: true });
    const chunks = [];
    p.stdout.on("data", d => chunks.push(d));
    p.on("error", reject);
    p.on("close", code => {
      if (code !== 0) return reject(new Error("decode failed: " + file));
      const buf = Buffer.concat(chunks);
      resolve(new Float32Array(buf.buffer, buf.byteOffset, Math.floor(buf.length / 4)).slice());
    });
  });
}

// Write interleaved stereo Float32 → 16-bit PCM WAV.
function writeWav(file, L, R, rate) {
  const n = L.length, data = Buffer.alloc(n * 4);
  for (let i = 0; i < n; i++) {
    const l = Math.max(-1, Math.min(1, L[i])), r = Math.max(-1, Math.min(1, R[i]));
    data.writeInt16LE(Math.round(l * 32767), i * 4);
    data.writeInt16LE(Math.round(r * 32767), i * 4 + 2);
  }
  const h = Buffer.alloc(44);
  h.write("RIFF", 0); h.writeUInt32LE(36 + data.length, 4); h.write("WAVE", 8);
  h.write("fmt ", 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(2, 22);
  h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(16, 34);
  h.write("data", 36); h.writeUInt32LE(data.length, 40);
  fs.writeFileSync(file, Buffer.concat([h, data]));
}

async function pool(items, n, fn) {
  let i = 0;
  const workers = Array.from({ length: Math.min(n, items.length) }, async () => {
    while (i < items.length) { const k = i++; await fn(items[k], k); }
  });
  await Promise.all(workers);
}

module.exports = { FFMPEG, FFPROBE, run, probeDuration, decodeMono, writeWav, pool };
