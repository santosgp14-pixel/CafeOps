// ─── CONFIG TAB COMPONENT ────────────────────────────────────────────────────

function ConfigTab({ showToast }) {
  const { useState } = React;
  const [form, setForm] = useState({ pinActual: '', pinNuevo: '', pinConfirm: '' });
  const [error, setError] = useState('');

  const handleChangePin = () => {
    setError('');
    if (!form.pinActual || !form.pinNuevo || !form.pinConfirm)
      return setError('Completá todos los campos');
    if (form.pinActual !== window.getPin())
      return setError('PIN actual incorrecto');
    if (form.pinNuevo.length < 4)
      return setError('El nuevo PIN debe tener al menos 4 dígitos');
    if (form.pinNuevo !== form.pinConfirm)
      return setError('Los PINs nuevos no coinciden');
    window.setPin(form.pinNuevo);
    setForm({ pinActual: '', pinNuevo: '', pinConfirm: '' });
    showToast('PIN actualizado ✓');
  };

  return (
    <div className="main">
      <div className="section-header">
        <div>
          <h2 className="section-title">Configuración</h2>
          <p className="section-subtitle">Ajustes del sistema</p>
        </div>
      </div>

      <div className="card">
        <div className="config-section-title">🔒 Cambiar PIN de administrador</div>
        <div className="form-group">
          <label className="form-label">PIN actual</label>
          <input className="form-input" type="password" placeholder="••••" maxLength={8}
            value={form.pinActual}
            onChange={e => { setForm(f => ({ ...f, pinActual: e.target.value })); setError(''); }} />
        </div>
        <div className="form-group">
          <label className="form-label">Nuevo PIN</label>
          <input className="form-input" type="password" placeholder="••••" maxLength={8}
            value={form.pinNuevo}
            onChange={e => { setForm(f => ({ ...f, pinNuevo: e.target.value })); setError(''); }} />
        </div>
        <div className="form-group">
          <label className="form-label">Confirmar nuevo PIN</label>
          <input className="form-input" type="password" placeholder="••••" maxLength={8}
            value={form.pinConfirm}
            onChange={e => { setForm(f => ({ ...f, pinConfirm: e.target.value })); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleChangePin()} />
        </div>
        {error && <p className="pin-error" style={{ marginBottom: 12 }}>⚠ {error}</p>}
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}
          onClick={handleChangePin}>
          Guardar nuevo PIN
        </button>
      </div>

      <div className="card" style={{ marginTop: 10, textAlign: 'center' }}>
        <div style={{ fontFamily: 'Playfair Display', fontSize: 17, color: 'var(--mocha)', marginBottom: 6 }}>
          CaféOps
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-soft)', lineHeight: 1.6 }}>
          Versión 1.1 · Gestión operativa de cafetería<br />
          Los datos se guardan localmente en este dispositivo
        </div>
      </div>
    </div>
  );
}

window.ConfigTab = ConfigTab;
