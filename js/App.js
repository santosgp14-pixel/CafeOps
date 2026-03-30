// ─── APP ROOT COMPONENT ───────────────────────────────────────────────────────

function App() {
  const { useState, useCallback } = React;
  const [tab, setTab] = useState('stock');
  const [products, setProducts]     = useState(() => window.load('products', []));
  const [calibLogs, setCalibLogs]   = useState(() => window.load('calib_logs', []));
  const [cleanTasks, setCleanTasks] = useState(() => window.load('cleaning_tasks', []));
  const [cleanLogs, setCleanLogs]   = useState(() => window.load('clean_logs', []));
  const [auditLogs, setAuditLogs]   = useState(() => window.load('audit_logs', []));
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);

  const lowCount          = products.filter(p => parseFloat(p.cantidad) < parseFloat(p.stockMin)).length;
  const overdueCleanCount = cleanTasks.filter(t => window.isOverdueTask(t, cleanLogs)).length;

  const TABS = [
    { id: 'stock',    icon: '📦', label: 'Stock'    },
    { id: 'calib',    icon: '⚖️', label: 'Café'     },
    { id: 'limpieza', icon: '🧼', label: 'Limpieza' },
    { id: 'historial',icon: '📋', label: 'Historial'},
    { id: 'config',   icon: '⚙️', label: 'Config'   },
  ];

  return (
    <>
      <div className="app-header">
        <div className="app-header-top">
          <div>
            <div className="app-logo">Café<span>Ops</span></div>
          </div>
        </div>
        {lowCount > 0 && (
          <div className="stock-alert-banner">
            ⚠ {lowCount} insumo{lowCount > 1 ? 's' : ''} con stock bajo
          </div>
        )}
        {overdueCleanCount > 0 && (
          <div className="stock-alert-banner" style={{ borderColor: 'rgba(183,121,31,0.4)', background: 'rgba(183,121,31,0.15)', color: '#f0b429' }}>
            🧼 {overdueCleanCount} tarea{overdueCleanCount > 1 ? 's' : ''} de limpieza vencida{overdueCleanCount > 1 ? 's' : ''}
          </div>
        )}
      </div>

      <div className="tabs">
        {TABS.map(t => (
          <button key={t.id} className={'tab-btn' + (tab === t.id ? ' active' : '')} onClick={() => setTab(t.id)}>
            <span className="tab-icon">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'stock' && (
        <StockTab products={products} setProducts={setProducts}
          auditLogs={auditLogs} setAuditLogs={setAuditLogs} showToast={showToast} />
      )}
      {tab === 'calib' && (
        <CalibTab logs={calibLogs} setLogs={setCalibLogs}
          auditLogs={auditLogs} setAuditLogs={setAuditLogs} showToast={showToast} />
      )}
      {tab === 'limpieza' && (
        <LimpiezaTab tasks={cleanTasks} setTasks={setCleanTasks}
          cleanLogs={cleanLogs} setCleanLogs={setCleanLogs}
          auditLogs={auditLogs} setAuditLogs={setAuditLogs} showToast={showToast} />
      )}
      {tab === 'historial' && (
        <HistorialTab auditLogs={auditLogs} />
      )}
      {tab === 'config' && (
        <ConfigTab showToast={showToast} />
      )}

      {toast && <Toast message={toast} />}
    </>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
