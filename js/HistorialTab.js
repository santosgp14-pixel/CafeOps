// ─── HISTORIAL TAB COMPONENT ─────────────────────────────────────────────────

function HistorialTab({ auditLogs }) {
  const { useState } = React;
  const [filter, setFilter] = useState('todos');

  const actionTypes = [...new Set(auditLogs.map(l => l.action))];
  const filtered = filter === 'todos' ? auditLogs : auditLogs.filter(l => l.action === filter);

  const actionIcon = (a) => {
    if (a.includes('Eliminar')) return '🗑';
    if (a.includes('Consumo')) return '📦';
    if (a.includes('Editar') || a.includes('calibr')) return '✏️';
    if (a.includes('limpieza') || a.includes('tarea') || a.includes('retroactivo')) return '🧼';
    return '📋';
  };

  const exportCSV = () => {
    const headers = ['Acción', 'Elemento', 'Valor anterior', 'Valor nuevo', 'Responsable', 'Fecha'];
    const rows = auditLogs.map(e => [
      e.action,
      e.entity,
      e.oldVal != null ? e.oldVal : '',
      e.newVal != null ? e.newVal : '',
      e.person,
      window.fmtDate(e.fecha)
    ]);
    const csv = [headers, ...rows]
      .map(r => r.map(v => '"' + String(v).replace(/"/g, '""') + '"').join(','))
      .join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cafeops-historial-' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="main">
      <div className="section-header">
        <div>
          <h2 className="section-title">Historial</h2>
          <p className="section-subtitle">{auditLogs.length} acciones registradas</p>
        </div>
        {auditLogs.length > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={exportCSV}>📥 CSV</button>
        )}
      </div>

      {auditLogs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <div className="empty-text">No hay acciones registradas aún</div>
        </div>
      ) : (
        <>
          <div className="filter-row">
            <button className={'filter-chip' + (filter === 'todos' ? ' active' : '')} onClick={() => setFilter('todos')}>
              Todos
            </button>
            {actionTypes.map(t => (
              <button key={t} className={'filter-chip' + (filter === t ? ' active' : '')} onClick={() => setFilter(t)}>
                {actionIcon(t)} {t}
              </button>
            ))}
          </div>
          {filtered.map(entry => (
            <div key={entry.id} className="audit-entry">
              <div className="audit-action">{actionIcon(entry.action)} {entry.action}</div>
              <div className="audit-entity">{entry.entity}</div>
              {entry.oldVal !== undefined && entry.newVal !== undefined && (
                <div className="audit-diff">
                  <span className="audit-old">{entry.oldVal}</span>
                  <span>→</span>
                  <span className="audit-new">{entry.newVal}</span>
                </div>
              )}
              <div className="audit-meta">
                <span>👤 <span className="audit-person">{entry.person}</span></span>
                <span>🕐 {window.fmtDate(entry.fecha)}</span>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

window.HistorialTab = HistorialTab;
