// ─── STORAGE HELPERS ─────────────────────────────────────────────────────────

const load = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
};

const save = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
};

// PIN is stored in localStorage so it can be changed at runtime
const getPin = () => load('admin_pin', '1234');
const setPin = (newPin) => save('admin_pin', newPin);

const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

const fmtDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' }) +
    ' ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
};

const fmtDateShort = (iso) =>
  new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });

// Returns true when a cleaning task is past its expected period
const isOverdueTask = (task, cleanLogs) => {
  const logs = cleanLogs.filter(l => l.taskId === task.id);
  const lastLog = logs[0]; // assumed sorted newest-first
  if (!lastLog) return true; // never completed
  const daysSince = (Date.now() - new Date(lastLog.fecha)) / (1000 * 60 * 60 * 24);
  if (task.frecuencia === 'diaria')   return new Date(lastLog.fecha).toDateString() !== new Date().toDateString();
  if (task.frecuencia === 'semanal')  return daysSince > 7;
  if (task.frecuencia === 'mensual')  return daysSince > 30;
  return false;
};

window.load         = load;
window.save         = save;
window.getPin       = getPin;
window.setPin       = setPin;
window.uid          = uid;
window.now          = now;
window.fmtDate      = fmtDate;
window.fmtDateShort = fmtDateShort;
window.isOverdueTask = isOverdueTask;
