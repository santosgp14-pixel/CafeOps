// ─── CONSTANTS & STORAGE HELPERS ─────────────────────────────────────────────

const ADMIN_PIN = "1234";

const load = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
};

const save = (key, val) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
};

const uid = () => Math.random().toString(36).slice(2, 10);
const now = () => new Date().toISOString();

const fmtDate = (iso) => {
  const d = new Date(iso);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' }) +
    ' ' + d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
};

const fmtDateShort = (iso) =>
  new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });

// Export to global scope for use across separate script files
window.ADMIN_PIN = ADMIN_PIN;
window.load = load;
window.save = save;
window.uid = uid;
window.now = now;
window.fmtDate = fmtDate;
window.fmtDateShort = fmtDateShort;
