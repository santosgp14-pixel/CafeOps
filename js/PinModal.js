// ─── PIN MODAL COMPONENT ──────────────────────────────────────────────────────

function PinModal({ title, subtitle, onConfirm, onCancel }) {
  const { useState } = React;
  const [pin, setPin] = useState('');
  const [person, setPerson] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!person.trim()) { setError('Ingresá tu nombre'); return; }
    if (pin !== window.ADMIN_PIN) { setError('PIN incorrecto'); setPin(''); return; }
    onConfirm(person.trim());
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="modal">
        <div className="modal-handle" />
        <div className="modal-lock-icon">🔒</div>
        <h3 className="modal-title">{title}</h3>
        <p className="modal-subtitle">{subtitle}</p>
        <div className="form-group">
          <label className="form-label">Tu nombre</label>
          <input className="form-input" placeholder="Ej: Juan" value={person}
            onChange={e => { setPerson(e.target.value); setError(''); }} />
        </div>
        <div className="form-group">
          <label className="form-label">PIN de administrador</label>
          <div className="pin-input-wrap">
            <input className={`pin-input${error ? ' error' : ''}`} type="password"
              placeholder="••••" maxLength={6} value={pin}
              onChange={e => { setPin(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleConfirm()} />
          </div>
          {error && <p className="pin-error">⚠ {error}</p>}
        </div>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleConfirm}>Confirmar</button>
        </div>
      </div>
    </div>
  );
}

window.PinModal = PinModal;
