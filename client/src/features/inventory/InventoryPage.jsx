// Inventory page (task 6.3). React Query drives the product list (useProducts)
// with search + state filters; every mutation invalidates the cache so the
// table refetches. Create/edit go through ProductForm, delete asks for
// confirmation and surfaces the server's 409 guard messages. UI copy in
// English (batch language contract).

import { useState } from 'react';
import { DEFAULT_CONFIG, useConfig } from '../../api/config.js';
import { useProductMutations, useProducts } from '../../api/products.js';
import InventoryTable from './InventoryTable.jsx';
import ProductForm from './ProductForm.jsx';
import './inventory.css';

const PRODUCT_STATES = [
  ['', 'All states'],
  ['available', 'Available'],
  ['apartado', 'Apartado'],
  ['credit', 'Credit'],
  ['sold', 'Sold'],
];

export default function InventoryPage() {
  const { data: configData } = useConfig();
  const config = configData ?? DEFAULT_CONFIG;
  const { create, update, remove } = useProductMutations();

  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState({ search: '', state: '' });
  const [form, setForm] = useState(null); // {mode:'create'} | {mode:'edit', product}
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
      // Unchanged quantities/fields are deliberately omitted; an empty patch
      // means "nothing to save" — no API call, just close.
      await update(payload.id, payload.patch);
    }
    closeForm();
  }

  async function handleDelete(product) {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setBannerError(null);
    setBusy(true);
    try {
      await remove(product.id);
    } catch (err) {
      setBannerError(err instanceof Error ? err.message : 'Unexpected error.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="inventory-page">
      <header className="inventory-header">
        <h2>Inventory</h2>
        <button type="button" onClick={openCreate}>
          New product
        </button>
      </header>

      <form className="inventory-filters" onSubmit={applySearch}>
        <input
          type="search"
          placeholder="Search products…"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
        />
        <button type="submit">Search</button>
        <select value={filters.state} onChange={applyState} aria-label="Filter by state">
          {PRODUCT_STATES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </form>

      {bannerError && (
        <p className="banner-error" role="alert">
          {bannerError}
        </p>
      )}

      {isPending ? (
        <p>Loading products…</p>
      ) : isError ? (
        <p role="alert">Could not load products.</p>
      ) : products.length === 0 ? (
        <p>No products match the current filters.</p>
      ) : (
        <InventoryTable
          products={products}
          config={config}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      {busy && <p aria-live="polite">Working…</p>}

      {form && (
        <ProductForm product={form.product ?? null} onSubmit={handleSubmit} onCancel={closeForm} />
      )}
    </section>
  );
}