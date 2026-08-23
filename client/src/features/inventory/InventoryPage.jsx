// Inventory page — Nexo design system.
// React Query drives the product list with search + state filters.
// Create/edit via ProductForm modal, delete with confirmation.

import { useState } from 'react';
import { DEFAULT_CONFIG, useConfig } from '../../api/config.js';
import { useProductMutations, useProducts } from '../../api/products.js';
import InventoryTable from './InventoryTable.jsx';
import ProductForm from './ProductForm.jsx';

const PRODUCT_STATES = [
  ['', 'Todos los estados'],
  ['available', 'Disponible'],
  ['apartado', 'Apartado'],
  ['credit', 'Crédito'],
  ['sold', 'Vendido'],
];

export default function InventoryPage() {
  const { data: configData } = useConfig();
  const config = configData ?? DEFAULT_CONFIG;
  const { create, update, remove } = useProductMutations();

  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({ search: '', state: '' });
  const [form, setForm] = useState(null);
  const [bannerError, setBannerError] = useState(null);
  const [busy, setBusy] = useState(false);

  const { data: products = [], isPending, isError } = useProducts(filters);

  function applySearch(event) {
    event.preventDefault();
    setFilters((prev) => ({ ...prev, search: searchInput.trim() }));
  }

  function applyState(event) {
    setFilters((prev) => ({ ...prev, state: event.target.value }));
  }

  function openCreate() {
    setBannerError(null);
    setForm({ mode: 'create' });
  }

  function openEdit(product) {
    setBannerError(null);
    setForm({ mode: 'edit', product });
  }

  function closeForm() {
    setForm(null);
  }

  async function handleSubmit(payload) {
    setBannerError(null);
    if (payload.mode === 'create') {
      await create(payload.body);
    } else if (Object.keys(payload.patch).length > 0) {
      await update(payload.id, payload.patch);
    }
    closeForm();
  }

  async function handleDelete(product) {
    if (!window.confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) return;
    setBannerError(null);
    setBusy(true);
    try {
      await remove(product.id);
    } catch (err) {
      setBannerError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="inventory-page" style={{ padding: 'var(--space-4) 0' }}>
      <header className="flex items-center justify-between gap-3 mb-4 flex-wrap" style={{ alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: 'var(--text-2xl)' }}>Inventario</h2>
        <button type="button" onClick={openCreate} className="btn btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" style={{ marginRight: 'var(--space-1)' }}>
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nuevo producto
        </button>
      </header>

      <form onSubmit={applySearch} className="flex flex-wrap gap-3 mb-4" style={{ alignItems: 'flex-end' }}>
        <div className="form-row" style={{ flex: 1, minWidth: '200px', flexDirection: 'column', gap: 'var(--space-1)' }}>
          <label htmlFor="inventory-search" className="label">Buscar productos</label>
          <input
            id="inventory-search"
            type="search"
            placeholder="Buscar productos…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="input"
          />
        </div>
        <button type="submit" className="btn btn-secondary" style={{ minHeight: 'var(--touch-target)' }}>
          Buscar
        </button>
        <div className="form-row" style={{ flexDirection: 'column', gap: 'var(--space-1)', minWidth: '160px' }}>
          <label htmlFor="inventory-state" className="label">Filtrar por estado</label>
          <select
            id="inventory-state"
            value={filters.state}
            onChange={applyState}
            aria-label="Filtrar por estado"
            className="input select"
          >
            {PRODUCT_STATES.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
        {searchInput || filters.state ? (
          <button type="button" onClick={() => { setSearchInput(''); setFilters({ search: '', state: '' }); }} className="btn btn-ghost btn-sm">
            Limpiar filtros
          </button>
        ) : null}
      </form>

      {bannerError && (
        <div className="alert alert-error mb-4" role="alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{bannerError}</span>
        </div>
      )}

      {isPending ? (
        <div className="loading" aria-live="polite">
          <span className="spinner" aria-hidden="true"></span>
          <span style={{ marginLeft: 'var(--space-3)' }}>Cargando productos…</span>
        </div>
      ) : isError ? (
        <div className="alert alert-error" role="alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>No se pudieron cargar los productos.</span>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon" aria-hidden="true">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style={{ opacity: 0.3 }}>
              <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </div>
          <h3 className="empty-state-title">
            {searchInput || filters.state ? 'No hay productos que coincidan con los filtros.' : 'No hay productos registrados.'}
          </h3>
          <p style={{ margin: 0, color: 'var(--color-text-secondary)' }}>
            {searchInput || filters.state
              ? 'Probá con otros términos de búsqueda o quitá los filtros.'
              : 'Creá tu primer producto para empezar.'}
          </p>
          {!searchInput && !filters.state && (
            <button type="button" onClick={openCreate} className="btn btn-primary mt-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" style={{ marginRight: 'var(--space-1)' }}>
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Crear primer producto
            </button>
          )}
        </div>
      ) : (
        <InventoryTable
          products={products}
          config={config}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      {busy && (
        <div className="loading" aria-live="polite" style={{ marginTop: 'var(--space-3)' }}>
          <span className="spinner" aria-hidden="true"></span>
          <span style={{ marginLeft: 'var(--space-3)' }}>Procesando…</span>
        </div>
      )}

      {form && (
        <ProductForm
          product={form.product ?? null}
          onSubmit={handleSubmit}
          onCancel={closeForm}
        />
      )}
    </section>
  );
}