// ─── LIMPIEZA TAB COMPONENT ───────────────────────────────────────────────────

function LimpiezaTab({ tasks, setTasks, cleanLogs, setCleanLogs, auditLogs, setAuditLogs, showToast }) {
  const { useState } = React;
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nombre: '', frecuencia: 'diaria' });
  const [filter, setFilter] = useState('todos');
  const [pinModal, setPinModal] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  const saveAudit = (action, entity, oldVal, newVal, person) => {
    const entry = { id: window.uid(), action, entity, oldVal, newVal, person, fecha: window.now() };
    setAuditLogs(prev => { const n = [entry, ...prev]; window.save('audit_logs', n); return n; });
  };

  const handleAdd = () => {
    if (!form.nombre.trim()) return showToast('Ingresá el nombre del equipo');
    const t = { id: window.uid(), ...form };
    setTasks(prev => { const n = [...prev, t]; window.save('cleaning_tasks', n); return n; });
    setForm({ nombre: '', frecuencia: 'diaria' });
    setShowForm(false);
    showToast('Tarea creada ✓');
  };

  const handleToggle = (task) => {
    const today = new Date().toDateString();
    const todayDone = cleanLogs.some(l => l.taskId === task.id && new Date(l.fecha).toDateString() === today);
    if (!todayDone) {
      const log = { id: window.uid(), taskId: task.id, taskName: task.nombre, fecha: window.now() };
      setCleanLogs(prev => { const n = [log, ...prev]; window.save('clean_logs', n); return n; });
      showToast(`✓ ${task.nombre} completada`);
    }
  };

  const isDoneToday = (task) => {
    const today = new Date().toDateString();
    return cleanLogs.some(l => l.taskId === task.id && new Date(l.fecha).toDateString() === today);
  };

  const getRecentLogs = (taskId, n = 7) =>
    cleanLogs.filter(l => l.taskId === taskId).slice(0, n);

  const requestDelete = (task) => {
    setPendingDelete(task);
    setPinModal({ action: 'Eliminar tarea', subtitle: `Eliminás: ${task.nombre}` });
  };

  const handlePinConfirm = (person) => {
    if (pendingDelete) {
      setTasks(prev => { const n = prev.filter(t => t.id !== pendingDelete.id); window.save('cleaning_tasks', n); return n; });
      saveAudit('Eliminar tarea limpieza', pendingDelete.nombre, pendingDelete.frecuencia, 'eliminado', person);
      showToast('Tarea eliminada');
      setPendingDelete(null);
    }
    setPinModal(null);
  };

  const freqLabel = { diaria: 'Diaria', semanal: 'Semanal', mensual: 'Mensual' };
  const freqCls = { diaria: 'freq-daily', semanal: 'freq-weekly', mensual: 'freq-monthly' };

  const filtered = filter === 'todos' ? tasks
    : filter === 'pendientes' ? tasks.filter(t => !isDoneToday(t))
    : tasks.filter(t => isDoneToday(t));

  const doneToday = tasks.filter(t => isDoneToday(t)).length;

  return (
    <div className="main">
      <div className="section-header">
        <div>
          <h2 className="section-title">Limpieza</h2>
          <p className="section-subtitle">{doneToday}/{tasks.length} completadas hoy</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(v => !v)}>
          {showForm ? '✕ Cerrar' : '+ Nueva'}
        </button>
      </div>

      {tasks.length > 0 && (
        <div className="card" style={{ background: 'linear-gradient(135deg, var(--roast), var(--mocha))', border: 'none', marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 2 }}>Progreso de hoy</div>
              <div style={{ fontFamily: 'Playfair Display', fontSize: 22, color: 'white' }}>{doneToday} / {tasks.length}</div>
            </div>
            <div style={{ fontSize: 36 }}>{doneToday === tasks.length && tasks.length > 0 ? '🎉' : '🧼'}</div>
          </div>
          <div className="progress-bar" style={{ background: 'rgba(255,255,255,0.2)', marginTop: 10 }}>
            <div className="progress-fill" style={{
              width: tasks.length ? `${(doneToday / tasks.length) * 100}%` : '0%',
              background: 'var(--latte)'
            }} />
          </div>
        </div>
      )}

      {showForm && (
        <div className="inline-form">
          <div className="inline-form-title">🧼 Nueva tarea de limpieza</div>
          <div className="form-group">
            <label className="form-label">Nombre del equipo / área</label>
            <input className="form-input" placeholder="Ej: Máquina espresso" value={form.nombre}
              onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Frecuencia</label>
            <select className="form-input" value={form.frecuencia}
              onChange={e => setForm(f => ({ ...f, frecuencia: e.target.value }))}>
              <option value="diaria">Diaria</option>
              <option value="semanal">Semanal</option>
              <option value="mensual">Mensual</option>
            </select>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handleAdd}>
            ✓ Crear tarea
          </button>
        </div>
      )}

      <div className="filter-row">
        {['todos', 'pendientes', 'completadas'].map(f => (
          <button key={f} className={`filter-chip${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🧼</div>
          <div className="empty-text">
            {filter === 'completadas' ? 'Ninguna completada hoy'
              : filter === 'pendientes' ? 'Todo al día 🎉'
              : 'Sin tareas de limpieza'}
          </div>
        </div>
      ) : filtered.map(task => {
        const done = isDoneToday(task);
        const recent = getRecentLogs(task.id, 7);
        return (
          <div key={task.id} className="card" style={{ opacity: done ? 0.85 : 1 }}>
            <div className="card-row">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1 }}>
                <div className={`task-check${done ? ' done' : ''}`} onClick={() => handleToggle(task)}>
                  {done && '✓'}
                </div>
                <div style={{ flex: 1 }}>
                  <div className={`task-name${done ? ' done' : ''}`}>{task.nombre}</div>
                  <div style={{ marginTop: 4 }}>
                    <span className={`freq-tag ${freqCls[task.frecuencia]}`}>{freqLabel[task.frecuencia]}</span>
                  </div>
                  {recent.length > 0 && (
                    <div className="compliance-bar">
                      <div className="compliance-dots">
                        {recent.map((l, i) => <div key={i} className="dot dot-done" />)}
                        {Array.from({ length: Math.max(0, 7 - recent.length) }).map((_, i) => (
                          <div key={`e${i}`} className="dot dot-miss" />
                        ))}
                      </div>
                      <span style={{ fontSize: 10, color: 'var(--text-soft)' }}>últimas {Math.min(7, recent.length + 3)}</span>
                    </div>
                  )}
                  {recent.length > 0 && (
                    <div className="task-history">Última vez: {window.fmtDate(recent[0].fecha)}</div>
                  )}
                </div>
              </div>
              <button className="btn btn-danger btn-icon btn-sm" onClick={() => requestDelete(task)}>🗑</button>
            </div>
          </div>
        );
      })}

      {pinModal && (
        <PinModal title={pinModal.action} subtitle={pinModal.subtitle}
          onConfirm={handlePinConfirm}
          onCancel={() => { setPinModal(null); setPendingDelete(null); }} />
      )}
    </div>
  );
}

window.LimpiezaTab = LimpiezaTab;
