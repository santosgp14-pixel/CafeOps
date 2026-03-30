// ─── STOCK TAB COMPONENT ─────────────────────────────────────────────────────

// ConsumoModal – bottom sheet for logging stock usage (no PIN required)
function ConsumoModal({ product, onConfirm, onCancel }) {
  const { useState } = React;
  const [qty, setQty] = useState('');
  const [person, setPerson] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    const q = parseFloat(qty);
    if (!person.trim()) { setError('Ingresá tu nombre'); return; }
    if (!qty || isNaN(q) || q <= 0) { setError('Ingresá una cantidad válida'); return; }
    if (q > product.cantidad) { setError('Solo hay ' + product.cantidad + ' ' + product.unidad + ' disponibles'); return; }
    onConfirm(q, person.trim());
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onCancel()}>
      <div className="modal">
        <div className="modal-handle" />
        <div style={{ fontSize: 28, textAlign: 'center', marginBottom: 12 }}>📦</div>
        <h3 className="modal-title">Registrar consumo</h3>
        <p className="modal-subtitle">{product.nombre} — disponible: <strong>{product.cantidad} {product.unidad}</strong></p>
        <div className="form-group">
          <label className="form-label">Tu nombre</label>
          <input className="form-input" placeholder="Ej: Juan" value={person}
            onChange={e => { setPerson(e.target.value); setError(''); }} />
        </div>
        <div className="form-group">
          <label className="form-label">Cantidad a usar ({product.unidad})</label>
          <input className="form-input" type="number" step="0.1" min="0.1"
            placeholder="0" value={qty}
            onChange={e => { setQty(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleConfirm()} />
        </div>
        {error && <p className="pin-error">⚠ {error}</p>}
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleConfirm}>✓ Registrar</button>
        </div>
      </div>
    </div>
  );
}

function StockTab({ products, setProducts, auditLogs, setAuditLogs, showToast }) {
  const { useState } = React;
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nombre: '', cantidad: '', unidad: 'kg', stockMin: '' });
  const [editId, setEditId] = useState(null);
  const [pinModal, setPinModal] = useState(null);
  const [filter, setFilter] = useState('todos');
  const [consumeProduct, setConsumeProduct] = useState(null);

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
      subtitle: 'Editando: ' + product.nombre,
      type: 'edit',
      product
    });
  };

  const requestDelete = (product) => {
    setPinModal({
      action: 'Eliminar insumo',
      subtitle: 'Eliminás: ' + product.nombre,
      type: 'delete',
      product
    });
  };

  const handleConsume = (qty, person) => {
    const p = consumeProduct;
    const newCantidad = Math.round((p.cantidad - qty) * 1000) / 1000;
    const updated = { ...p, cantidad: newCantidad };
    setProducts(prev => { const n = prev.map(x => x.id === p.id ? updated : x); window.save('products', n); return n; });
    saveAudit('Consumo de stock', p.nombre, p.cantidad + ' ' + p.unidad, newCantidad + ' ' + p.unidad, person);
    setConsumeProduct(null);
    if (newCantidad < p.stockMin) {
      showToast('⚠ ' + p.nombre + ' quedó con stock bajo');
    } else {
      showToast('✓ Consumo registrado (-' + qty + ' ' + p.unidad + ')');
    }
  };

  const handlePinConfirm = (person) => {
    if (pinModal.type === 'delete') {
      const p = pinModal.product;
      setProducts(prev => { const n = prev.filter(x => x.id !== p.id); window.save('products', n); return n; });
      saveAudit('Eliminar insumo', p.nombre, p.cantidad + ' ' + p.unidad, 'eliminado', person);
      showToast('Insumo eliminado');
    } else if (pinModal.type === 'edit') {
      const p = pinModal.product;
      const updated = { ...p, ...form, cantidad: parseFloat(form.cantidad), stockMin: parseFloat(form.stockMin) };
      setProducts(prev => { const n = prev.map(x => x.id === p.id ? updated : x); window.save('products', n); return n; });
      saveAudit('Editar insumo', p.nombre, 'cant: ' + p.cantidad + ', min: ' + p.stockMin, 'cant: ' + form.cantidad + ', min: ' + form.stockMin, person);
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
          <button key={f} className={'filter-chip' + (filter === f ? ' active' : '')} onClick={() => setFilter(f)}>
            {f === 'todos' ? 'Todos' : '🔴 Stock bajo (' + lowStock.length + ')'}
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
          <div key={p.id} className="card" style={{ borderLeft: '3px solid ' + (low ? 'var(--alert)' : 'var(--ok)') }}>
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
                  <div className="progress-fill" style={{ width: pct + '%', background: low ? 'var(--alert)' : 'var(--ok)' }} />
                </div>
                <span className={'stock-badge ' + (low ? 'badge-low' : 'badge-ok')}>
                  {low ? '⚠ Stock bajo' : '✓ OK'}
                </span>
              </div>
              <div className="card-actions">
                <button className="btn btn-ghost btn-icon btn-sm" title="Registrar uso"
                  style={{ color: 'var(--ok)', fontSize: 16 }}
                  onClick={() => setConsumeProduct(p)}>➖</button>
                <button className="btn btn-ghost btn-icon btn-sm" title="Editar"
                  onClick={() => { setShowForm(true); requestEdit(p); }}>✏️</button>
                <button className="btn btn-danger btn-icon btn-sm" title="Eliminar"
                  onClick={() => requestDelete(p)}>🗑</button>
              </div>
            </div>
          </div>
        );
      })}

      {consumeProduct && (
        <ConsumoModal product={consumeProduct}
          onConfirm={handleConsume}
          onCancel={() => setConsumeProduct(null)} />
      )}

      {pinModal && (
        <PinModal title={pinModal.action} subtitle={pinModal.subtitle}
          onConfirm={handlePinConfirm}
          onCancel={() => { setPinModal(null); setEditId(null); setShowForm(false); }} />
      )}
    </div>
  );
}

window.StockTab = StockTab;
