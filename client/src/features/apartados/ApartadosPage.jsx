// Apartados page (task 6.4), wired at /apartados. React Query drives the list
// (useApartados) with a status filter; the create form reserves stock
// server-side, cancel returns it, pay records cumulative amounts. Every
// mutation invalidates the apartado list plus products/customers so the
// inventory chips and balances refetch. Server guard messages surface in the
// banner/form. UI copy in neutral Spanish.
// Nexo design system: header, filters, table, modal via utilities.

import { useState } from 'react';
import { DEFAULT_CONFIG, useConfig } from '../../api/config.js';
import {
  buildApartadoPayBody,
  useApartadoMutations,
  useApartados,
} from '../../api/apartados.js';
import ApartadoForm from './ApartadoForm.jsx';
import ApartadoList from './ApartadoList.jsx';

const STATUS_FILTERS = [
  ['', 'Todos los estados'],
  ['pending', 'Pendientes'],
  ['paid', 'Pagados'],
  ['cancelled', 'Cancelados'],
];

export default function ApartadosPage() {
  const { data: configData } = useConfig();
  const config = configData ?? DEFAULT_CONFIG;
  const { create, cancel, pay } = useApartadoMutations();

  const [status, setStatus] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [payingId, setPayingId] = useState(null);
  const [bannerError, setBannerError] = useState(null);
  const [busy, setBusy] = useState(false);

  const { data: apartados = [], isPending, isError } = useApartados({ status });

  async function handleCreate(body) {
    setBannerError(null);
    try {
      await create(body);
      setFormOpen(false);
    } catch (err) {
      throw err;
    }
  }

  async function handleCancel(apartado) {
    if (!window.confirm(`¿Cancelar el apartado de "${apartado.customer_name}"? Las unidades vuelven al stock.`)) {
      return;
    }
    setBannerError(null);
    setBusy(true);
    try {
      await cancel(apartado.id);
    } catch (err) {
      setBannerError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
    } finally {
      setBusy(false);
    }
  }

  async function handlePay(apartado, amount, note) {
    setBannerError(null);
    try {
      await pay(apartado.id, buildApartadoPayBody(amount, note));
      setPayingId(null);
    } catch (err) {
      throw err;
    }
  }

  return (
    <section style={{ padding: 'var(--space-4) 0' }}>
      <header className="flex items-center justify-between gap-3 mb-4 flex-wrap" style={{ alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: 'var(--text-2xl)' }}>Apartados</h2>
        <button type="button" onClick={() => setFormOpen(true)} className="btn btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" style={{ marginRight: 'var(--space-1)' }}>
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nuevo apartado
        </button>
      </header>

      <form onSubmit={(e) => e.preventDefault()} className="flex flex-wrap gap-3 mb-4" style={{ alignItems: 'flex-end' }}>
        <div className="form-row" style={{ flexDirection: 'column', gap: 'var(--space-1)', minWidth: '160px' }}>
          <label htmlFor="apartado-status-filter" className="label">Estado</label>
          <select
            id="apartado-status-filter"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="input select"
          >
            {STATUS_FILTERS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </form>

      {bannerError && (
        <p className="alert alert-error" role="alert" style={{ marginBottom: 'var(--space-4)' }}>
          {bannerError}
        </p>
      )}

      {isPending ? (
        <p className="loading">Cargando apartados…</p>
      ) : isError ? (
        <p className="alert alert-error" role="alert">No se pudieron cargar los apartados.</p>
      ) : apartados.length === 0 ? (
        <p className="empty-state">No hay apartados que coincidan con el filtro.</p>
      ) : (
        <ApartadoList
          apartados={apartados}
          config={config}
          payingId={payingId}
          onPay={(apartado) => {
            setBannerError(null);
            setPayingId(apartado.id);
          }}
          onCancelPay={() => setPayingId(null)}
          submitPay={handlePay}
          onCancel={handleCancel}
        />
      )}

      {busy && <p aria-live="polite" className="loading">Procesando…</p>}

      {formOpen && (
        <ApartadoForm
          onSubmit={handleCreate}
          onCancel={() => setFormOpen(false)}
        />
      )}
    </section>
  );
}