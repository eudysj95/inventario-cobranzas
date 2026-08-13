// Apartados page (task 6.4), wired at /apartados. React Query drives the list
// (useApartados) with a status filter; the create form reserves stock
// server-side, cancel returns it, pay records cumulative amounts. Every
// mutation invalidates the apartado list plus products/customers so the
// inventory chips and balances refetch. Server guard messages surface in the
// banner/form. UI copy in neutral Spanish.

import { useState } from 'react';
import { DEFAULT_CONFIG, useConfig } from '../../api/config.js';
import {
  buildApartadoPayBody,
  useApartadoMutations,
  useApartados,
} from '../../api/apartados.js';
import ApartadoForm from './ApartadoForm.jsx';
import ApartadoList from './ApartadoList.jsx';
import './apartados.css';

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
      // Re-throw so the form shows the server message (e.g. insufficient stock).
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
      // 409 "Only pending apartados can be cancelled" surfaces verbatim.
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
      // Server overpay/conflict messages surface verbatim in the inline form.
      throw err;
    }
  }

  return (
    <section className="apartados-page">
      <header className="inventory-header">
        <h2>Apartados</h2>
        <button type="button" onClick={() => setFormOpen(true)}>
          Nuevo apartado
        </button>
      </header>

      <div className="apartados-filters">
        <label htmlFor="apartado-status-filter">
          Estado
          <select
            id="apartado-status-filter"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            {STATUS_FILTERS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {bannerError && (
        <p className="banner-error" role="alert">
          {bannerError}
        </p>
      )}

      {isPending ? (
        <p>Cargando apartados…</p>
      ) : isError ? (
        <p role="alert">No se pudieron cargar los apartados.</p>
      ) : apartados.length === 0 ? (
        <p>No hay apartados que coincidan con el filtro.</p>
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

      {busy && <p aria-live="polite">Procesando…</p>}

      {formOpen && (
        <ApartadoForm
          onSubmit={handleCreate}
          onCancel={() => setFormOpen(false)}
        />
      )}
    </section>
  );
}