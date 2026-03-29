// ─── STOCK TAB COMPONENT ─────────────────────────────────────────────────────

function StockTab({ products, setProducts, auditLogs, setAuditLogs, showToast }) {
  const { useState } = React;
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nombre: '', cantidad: '', unidad: 'kg', stockMin: '' });
  const [editId, setEditId] = useState(null);
  const [pinModal, setPinModal] = useState(null);
  const [filter, setFilter] = useState('todos');

  const lowStock = products.filter(p => parseFloat(p.cantidad) < parseFloat(p.stockMin));

  const saveAudit = (action, entity, oldVal, newVal, person) => {
    const entry = { id: window.uid(), action, entity, oldVal, newVal, person, fecha: window.now() };
    setAuditLogs(prev => { const n = [entry, ...prev]; window.save('audit_logs', n); return n; });
  };

  const handleAdd = () => {
    if (!form.nombre.trim() || !form.cantidad || !form.stockMin)
      return showToast('Completá todos los campos');
    const p = {
      id: window.uid(), ...form,
      cantidad: parseFloat(form.cantidad),
      stockMin: parseFloat(form.stockMin)
    };
    setProducts(prev => { const n = [...prev, p]; window.save('products', n); return n; });
    setForm({ nombre: '', cantidad: '', unidad: 'kg', stockMin: '' });
    setShowForm(false);
    showToast('Insumo agregado ✓');
  };

  const requestEdit = (product) => {
    setEditId(product.id);
    setForm({
      nombre: product.nombre,
      cantidad: String(product.cantidad),
      unidad: product.unidad,
      stockMin: String(product.stockMin)
    });
    setPinModal({
      action: 'Editar insumo',
      subtitle: `Editando: ${product.nombre}`,
      type: 'edit',
      product
    });
  };

  const requestDelete = (product) => {
    setPinModal({
      action: 'Eliminar insumo',
      subtitle: `Eliminás: ${product.nombre}`,
      type: 'delete',
      product
    });
  };

  const handlePinConfirm = (person) => {
    if (pinModal.type === 'delete') {
      const p = pinModal.product;
      setProducts(prev => { const n = prev.filter(x => x.id !== p.id); window.save('products', n); return n; });
      saveAudit('Eliminar insumo', p.nombre, `${p.cantidad} ${p.unidad}`, 'eliminado', person);
      showToast('Insumo eliminado');
    } else if (pinModal.type === 'edit') {
      const p = pinModal.product;
      const updated = { ...p, ...form, cantidad: parseFloat(form.cantidad), stockMin: parseFloat(form.stockMin) };
      setProducts(prev => { const n = prev.map(x => x.id === p.id ? updated : x); window.save('products', n); return n; });
      saveAudit('Editar insumo', p.nombre, `cant: ${p.cantidad}, min: ${p.stockMin}`, `cant: ${form.cantidad}, min: ${form.stockMin}`, person);
      showToast('Insumo actualizado ✓');
      setEditId(null);
      setForm({ nombre: '', cantidad: '', unidad: 'kg', stockMin: '' });
      setShowForm(false);
    }
    setPinModal(null);
  };

  const filtered = filter === 'bajo'
    ? products.filter(p => parseFloat(p.cantidad) < parseFloat(p.stockMin))
    : products;

  const stockPct = (p) => Math.min(100, Math.round((parseFloat(p.cantidad) / parseFloat(p.stockMin)) * 100));
  const isLow = (p) => parseFloat(p.cantidad) < parseFloat(p.stockMin);

  return (
    <div className="main">
      <div className="section-header">
        <div>
          <h2 className="section-title">Stock</h2>
          <p className="section-subtitle">{products.length} insumos registrados</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => {
          setShowForm(v => !v);
          setEditId(null);
          setForm({ nombre: '', cantidad: '', unidad: 'kg', stockMin: '' });
        }}>
          {showForm ? '✕ Cerrar' : '+ Agregar'}
        </button>
      </div>

      <div className="stock-grid">
        <div className="stock-stat">
          <div className="stock-stat-value">{products.length}</div>
          <div className="stock-stat-label">Total insumos</div>
        </div>
        <div className="stock-stat">
          <div className="stock-stat-value" style={{ color: lowStock.length > 0 ? 'var(--alert)' : 'var(--ok)' }}>
            {lowStock.length}
          </div>
          <div className="stock-stat-label">Stock bajo</div>
        </div>
      </div>

      {showForm && (
        <div className="inline-form">
          <div className="inline-form-title">📦 {editId ? 'Editar insumo' : 'Nuevo insumo'}</div>
          <div className="form-group">
            <label className="form-label">Nombre del insumo</label>
            <input className="form-input" placeholder="Ej: Café en grano" value={form.nombre}
              onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Cantidad actual</label>
              <input className="form-input" type="number" step="0.1" placeholder="0" value={form.cantidad}
                onChange={e => setForm(f => ({ ...f, cantidad: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Unidad</label>
              <select className="form-input" value={form.unidad}
                onChange={e => setForm(f => ({ ...f, unidad: e.target.value }))}>
                <option value="kg">kg</option>
                <option value="litros">litros</option>
                <option value="unidades">unidades</option>
                <option value="g">gramos</option>
                <option value="ml">ml</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Stock mínimo</label>
            <input className="form-input" type="number" step="0.1" placeholder="Stock de alerta" value={form.stockMin}
              onChange={e => setForm(f => ({ ...f, stockMin: e.target.value }))} />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}
            onClick={editId ? () => requestEdit(products.find(p => p.id === editId)) : handleAdd}>
            {editId ? '🔒 Guardar cambios' : '✓ Agregar insumo'}
          </button>
        </div>
      )}

      <div className="filter-row">
        {['todos', 'bajo'].map(f => (
          <button key={f} className={`filter-chip${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
            {f === 'todos' ? 'Todos' : `🔴 Stock bajo (${lowStock.length})`}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <div className="empty-text">
            {filter === 'bajo' ? 'No hay insumos con stock bajo' : 'No hay insumos cargados'}
          </div>
        </div>
      ) : filtered.map(p => {
        const low = isLow(p);
        const pct = stockPct(p);
        return (
          <div key={p.id} className="card" style={{ borderLeft: `3px solid ${low ? 'var(--alert)' : 'var(--ok)'}` }}>
            <div className="card-row">
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span className="card-value">{p.nombre}</span>
                  <span className="unit-tag">{p.unidad}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: 22, fontFamily: 'Playfair Display', fontWeight: 700, color: low ? 'var(--alert)' : 'var(--roast)' }}>
                    {p.cantidad}
                  </span>
                  <span className="card-meta">/ mín {p.stockMin} {p.unidad}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: low ? 'var(--alert)' : 'var(--ok)' }} />
                </div>
                <span className={`stock-badge ${low ? 'badge-low' : 'badge-ok'}`}>
                  {low ? '⚠ Stock bajo' : '✓ OK'}
                </span>
              </div>
              <div className="card-actions">
                <button className="btn btn-ghost btn-icon btn-sm" title="Editar"
                  onClick={() => { setShowForm(true); requestEdit(p); }}>✏️</button>
                <button className="btn btn-danger btn-icon btn-sm" title="Eliminar"
                  onClick={() => requestDelete(p)}>🗑</button>
              </div>
            </div>
          </div>
        );
      })}

      {pinModal && (
        <PinModal title={pinModal.action} subtitle={pinModal.subtitle}
          onConfirm={handlePinConfirm}
          onCancel={() => { setPinModal(null); setEditId(null); setShowForm(false); }} />
      )}
    </div>
  );
}

window.StockTab = StockTab;
