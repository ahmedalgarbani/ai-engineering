// Laptop on battery: pause rendering at a low charge and resume when the charger is back, so a
// critical-battery sleep doesn't kill the segments in flight. Windows only; a no-op elsewhere.
const { spawn } = require("child_process");

const DISCHARGING = new Set([1, 4, 5]); // Win32_Battery.BatteryStatus: discharging / low / critical
let state = { ac: true, pct: 100 }, proc = null, paused = null;

function watchPower() {
  if (process.platform !== "win32" || proc) return;
  const ps = "while ($true) { $b = Get-CimInstance Win32_Battery | Select-Object -First 1; " +
    "if ($b) { [Console]::WriteLine(\"$($b.BatteryStatus) $($b.EstimatedChargeRemaining)\") } else { [Console]::WriteLine('2 100') }; Start-Sleep -Seconds 20 }";
  proc = spawn("powershell.exe", ["-NoProfile", "-NonInteractive", "-EncodedCommand", Buffer.from(ps, "utf16le").toString("base64")],
    { windowsHide: true, stdio: ["ignore", "pipe", "ignore"] });
  let buf = "";
  proc.stdout.on("data", d => {
    buf += d;
    const lines = buf.split(/\r?\n/);
    buf = lines.pop();
    const last = lines.filter(Boolean).pop();
    if (!last) return;
    const [st, pct] = last.trim().split(/\s+/).map(Number);
    if (Number.isFinite(st)) state = { ac: !DISCHARGING.has(st), pct: Number.isFinite(pct) ? pct : 100 };
  });
  proc.on("error", () => { proc = null; });
  process.on("exit", stopPower);
}

function stopPower() { try { if (proc) proc.kill(); } catch (_) { } proc = null; }

// Returns an async gate to await between frame batches: resolves at once unless the machine is on
// battery at or below `low` percent, in which case all workers wait together for the charger.
function powerGate(low, log) {
  return async () => {
    if (!low || state.ac || state.pct > low) return;
    if (!paused) {
      log(`  || on battery at ${state.pct}% - rendering paused until the charger is connected`);
      paused = (async () => {
        while (!state.ac && state.pct <= low + 5) await new Promise(r => setTimeout(r, 15000));
        log(`  >> ${state.ac ? "charger connected" : `battery at ${state.pct}%`} - resuming`);
        paused = null;
      })();
    }
    await paused;
  };
}

module.exports = { watchPower, stopPower, powerGate, powerState: () => state };
