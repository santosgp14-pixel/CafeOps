// ─── CALIBRACIÓN TAB COMPONENT ───────────────────────────────────────────────

function CalibTab({ logs, setLogs, auditLogs, setAuditLogs, showToast }) {
  const { useState } = React;
  const [form, setForm] = useState({ inputG: '', outputG: '', notas: '' });
  const [showForm, setShowForm] = useState(false);
  const [editEntry, setEditEntry] = useState(null);
  const [pinModal, setPinModal] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const saveAudit = (action, entity, oldVal, newVal, person) => {
    const entry = { id: window.uid(), action, entity, oldVal, newVal, person, fecha: window.now() };
    setAuditLogs(prev => { const n = [entry, ...prev]; window.save('audit_logs', n); return n; });
  };

  const liveRatio = form.inputG && form.outputG
    ? (parseFloat(form.outputG) / parseFloat(form.inputG)).toFixed(2)
    : null;

  const getRatioStatus = (r) => {
    const n = parseFloat(r);
    if (n < 1.5) return { label: 'Bajo', cls: 'ratio-low' };
    if (n > 2.5) return { label: 'Alto', cls: 'ratio-high' };
    return { label: 'Ideal', cls: 'ratio-ok' };
  };

  const handleAdd = () => {
    if (!form.inputG || !form.outputG) return showToast('Completá los gramos');
    const r = (parseFloat(form.outputG) / parseFloat(form.inputG)).toFixed(2);
    const entry = {
      id: window.uid(),
      inputG: parseFloat(form.inputG),
      outputG: parseFloat(form.outputG),
      ratio: parseFloat(r),
      notas: form.notas,
      fecha: window.now()
    };
    setLogs(prev => { const n = [entry, ...prev]; window.save('calib_logs', n); return n; });
    setForm({ inputG: '', outputG: '', notas: '' });
    setShowForm(false);
    showToast('Registro guardado ✓');
  };

  const startEdit = (entry) => {
    setEditEntry(entry);
    setForm({ inputG: String(entry.inputG), outputG: String(entry.outputG), notas: entry.notas || '' });
    setShowForm(true);
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditEntry(null);
    setForm({ inputG: '', outputG: '', notas: '' });
  };

  const requestDelete = (entry) => {
    setPendingDelete(entry);
    setPinModal({
      type: 'delete',
      action: 'Eliminar calibración',
      subtitle: 'Ratio ' + entry.ratio + ':1 — ' + window.fmtDateShort(entry.fecha)
    });
  };

  const requestSaveEdit = () => {
    if (!form.inputG || !form.outputG) return showToast('Completá los gramos');
    setPinModal({
      type: 'edit',
      action: 'Editar calibración',
      subtitle: 'Modificando registro del ' + window.fmtDateShort(editEntry.fecha)
    });
  };

  const handlePinConfirm = (person) => {
    if (pinModal.type === 'delete' && pendingDelete) {
      setLogs(prev => { const n = prev.filter(x => x.id !== pendingDelete.id); window.save('calib_logs', n); return n; });
      saveAudit('Eliminar calibración', 'Ratio ' + pendingDelete.ratio + ':1', 'in:' + pendingDelete.inputG + 'g out:' + pendingDelete.outputG + 'g', 'eliminado', person);
      showToast('Registro eliminado');
      setPendingDelete(null);
    } else if (pinModal.type === 'edit' && editEntry) {
      const r = (parseFloat(form.outputG) / parseFloat(form.inputG)).toFixed(2);
      const updated = {
        ...editEntry,
        inputG: parseFloat(form.inputG),
        outputG: parseFloat(form.outputG),
        ratio: parseFloat(r),
        notas: form.notas
      };
      setLogs(prev => { const n = prev.map(x => x.id === editEntry.id ? updated : x); window.save('calib_logs', n); return n; });
      saveAudit('Editar calibración', 'Ratio ' + editEntry.ratio + ':1', 'in:' + editEntry.inputG + 'g out:' + editEntry.outputG + 'g', 'in:' + form.inputG + 'g out:' + form.outputG + 'g', person);
      showToast('Calibración actualizada ✓');
      setEditEntry(null);
      setForm({ inputG: '', outputG: '', notas: '' });
      setShowForm(false);
    }
    setPinModal(null);
  };

  const avgRatio = logs.length
    ? (logs.reduce((s, l) => s + l.ratio, 0) / logs.length).toFixed(2)
    : null;

  return (
    <div className="main">
      <div className="section-header">
        <div>
          <h2 className="section-title">Calibración</h2>
          <p className="section-subtitle">Control de ratio café</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { if (showForm) cancelForm(); else setShowForm(true); }}>
          {showForm ? '✕ Cerrar' : '+ Nuevo'}
        </button>
      </div>

      {avgRatio && (
        <div className="ratio-display">
          <div className="ratio-label">Ratio promedio histórico</div>
          <div className="ratio-number">1:{avgRatio}</div>
          <div className="ratio-ideal">Rango ideal: 1:1.5 — 1:2.5</div>
          <span className={'ratio-badge ' + getRatioStatus(avgRatio).cls}>
            {getRatioStatus(avgRatio).label}
          </span>
        </div>
      )}

      {showForm && (
        <div className="inline-form">
          <div className="inline-form-title">⚖️ {editEntry ? 'Editar registro' : 'Nuevo registro de calibración'}</div>
          <div className="calib-row" style={{ marginBottom: 14 }}>
            <div className="calib-chip">
              <div className="calib-chip-label">Entrada (g)</div>
              <input
                style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'center', fontSize: 20, fontFamily: 'DM Sans', fontWeight: 600, color: 'var(--roast)', outline: 'none' }}
                type="number" placeholder="18" value={form.inputG}
                onChange={e => setForm(f => ({ ...f, inputG: e.target.value }))} />
            </div>
            <span className="calib-arrow">→</span>
            <div className="calib-chip">
              <div className="calib-chip-label">Salida (g)</div>
              <input
                style={{ background: 'transparent', border: 'none', width: '100%', textAlign: 'center', fontSize: 20, fontFamily: 'DM Sans', fontWeight: 600, color: 'var(--roast)', outline: 'none' }}
                type="number" placeholder="36" value={form.outputG}
                onChange={e => setForm(f => ({ ...f, outputG: e.target.value }))} />
            </div>
            {liveRatio && (
              <>
                <span className="calib-arrow">→</span>
                <div className="calib-chip" style={{ background: 'var(--espresso)', border: 'none' }}>
                  <div className="calib-chip-label" style={{ color: 'rgba(255,255,255,0.5)' }}>Ratio</div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--latte)' }}>1:{liveRatio}</div>
                </div>
              </>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Notas (opcional)</label>
            <input className="form-input" placeholder="Ej: Molienda gruesa, blend etiopía" value={form.notas}
              onChange={e => setForm(f => ({ ...f, notas: e.target.value }))} />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}
            onClick={editEntry ? requestSaveEdit : handleAdd}>
            {editEntry ? '🔒 Actualizar registro' : '✓ Guardar registro'}
          </button>
        </div>
      )}

      {logs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">⚖️</div>
          <div className="empty-text">No hay registros de calibración</div>
        </div>
      ) : (
        <>
          <div style={{ fontFamily: 'Playfair Display', fontSize: 15, color: 'var(--text-mid)', marginBottom: 10 }}>Historial</div>
          {logs.map(entry => {
            const status = getRatioStatus(entry.ratio);
            return (
              <div key={entry.id} className="card">
                <div className="card-row">
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontFamily: 'Playfair Display', fontSize: 20, fontWeight: 700, color: 'var(--roast)' }}>
                        1:{entry.ratio}
                      </span>
                      <span className={'ratio-badge ' + status.cls} style={{
                        color: status.cls === 'ratio-ok' ? 'var(--ok)' : status.cls === 'ratio-low' ? 'var(--alert)' : 'var(--warning)'
                      }}>
                        {status.label}
                      </span>
                    </div>
                    <div className="calib-row" style={{ gap: 6 }}>
                      <span style={{ fontSize: 12, color: 'var(--text-soft)' }}>↓ {entry.inputG}g entrada</span>
                      <span style={{ color: 'var(--caramel)' }}>→</span>
                      <span style={{ fontSize: 12, color: 'var(--text-soft)' }}>↑ {entry.outputG}g salida</span>
                    </div>
                    {entry.notas && <div className="card-meta" style={{ marginTop: 4 }}>"{entry.notas}"</div>}
                    <div className="card-meta">{window.fmtDate(entry.fecha)}</div>
                  </div>
                  <div className="card-actions">
                    <button className="btn btn-ghost btn-icon btn-sm" title="Editar"
                      onClick={() => startEdit(entry)}>✏️</button>
                    <button className="btn btn-danger btn-icon btn-sm" title="Eliminar"
                      onClick={() => requestDelete(entry)}>🗑</button>
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}

      {pinModal && (
        <PinModal title={pinModal.action} subtitle={pinModal.subtitle}
          onConfirm={handlePinConfirm}
          onCancel={() => { setPinModal(null); setPendingDelete(null); }} />
      )}
    </div>
  );
}

window.CalibTab = CalibTab;
