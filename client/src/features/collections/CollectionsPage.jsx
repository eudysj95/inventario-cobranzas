// Collections page (task 6.5), wired at /cobros. Consumes GET
// /api/collections/due (useCollectionsDue): customers with apartado/credit
// items due now, overdue, or inside the horizon (server groups items per
// customer and flags overdue). The page renders a "Vencidos" group and a
// "Próximos vencimientos" group (pure groupDueCustomers helper), and for each
// customer a WhatsApp button pre-filled with the neutral formal Spanish
// reminder message built by lib/whatsapp.ts. Per spec, the link is rendered
// ONLY when the customer has a phone; otherwise a "phone required" indicator
// is shown instead. The horizon is a user control (default 7 days). UI copy
// in neutral Spanish; server guard messages surface verbatim.
// Nexo design system: header, filters, cards, chips, button via utilities.

import { useState } from 'react';
import { DEFAULT_CONFIG, useConfig } from '../../api/config.js';
import {
  collectionTypeLabel,
  groupDueCustomers,
  useCollectionsDue,
} from '../../api/collections.js';
import {
  buildCollectionMessage,
  buildWaLink,
  PHONE_REQUIRED_TEXT,
} from '../../lib/whatsapp.js';
import { formatCurrency, formatDate } from '../../lib/format.js';

const HORIZON_OPTIONS = [7, 15, 30, 60];

const TYPE_CHIP_MAP = {
  apartado: 'danger',
  credit: 'success',
};

export default function CollectionsPage() {
  const { data: configData } = useConfig();
  const config = configData ?? DEFAULT_CONFIG;

  const [horizonDays, setHorizonDays] = useState(7);
  const { data: customers = [], isPending, isError } = useCollectionsDue(horizonDays);

  const { overdue, upcoming } = groupDueCustomers(customers);

  return (
    <section style={{ padding: 'var(--space-4) 0' }}>
      <header className="flex items-center justify-between gap-3 mb-4 flex-wrap" style={{ alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: 'var(--text-2xl)' }}>Cobranzas</h2>
      </header>

      <form onSubmit={(e) => e.preventDefault()} className="flex flex-wrap gap-3 mb-4" style={{ alignItems: 'flex-end' }}>
        <div className="form-row" style={{ flexDirection: 'column', gap: 'var(--space-1)', minWidth: '140px' }}>
          <label htmlFor="collections-horizon" className="label">Horizonte</label>
          <select
            id="collections-horizon"
            value={horizonDays}
            onChange={(event) => setHorizonDays(Number(event.target.value))}
            className="input select"
          >
            {HORIZON_OPTIONS.map((days) => (
              <option key={days} value={days}>
                {days} días
              </option>
            ))}
          </select>
        </div>
        <p className="form-hint" style={{ margin: 0, alignSelf: 'flex-end' }}>
          Vencimientos dentro del horizonte, incluidos los vencidos.
        </p>
      </form>

      {isPending ? (
        <p className="loading">Cargando cobranzas…</p>
      ) : isError ? (
        <p className="alert alert-error" role="alert">No se pudieron cargar las cobranzas.</p>
      ) : customers.length === 0 ? (
        <p className="empty-state">No hay vencimientos en el horizonte seleccionado.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          {overdue.length > 0 && (
            <DueGroup title="Vencidos" customers={overdue} config={config} />
          )}
          {upcoming.length > 0 && (
            <DueGroup title="Próximos vencimientos" customers={upcoming} config={config} />
          )}
        </div>
      )}
    </section>
  );
}

/** One visually distinct group of due customers (overdue / upcoming). */
function DueGroup({ title, customers, config }) {
  return (
    <div>
      <h3 className="mb-3" style={{ fontSize: 'var(--text-xl)', color: 'var(--color-text)' }}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {customers.map((customer) => (
          <CustomerCard key={customer.customerId} customer={customer} config={config} />
        ))}
      </div>
    </div>
  );
}

/** Customer card: contact info, total owed, item rows, WhatsApp reminder. */
function CustomerCard({ customer, config }) {
  const message = buildCollectionMessage(customer.name, customer.items, config);
  const link = buildWaLink(customer.phone, message);

  return (
    <article className="card">
      <div className="card-body">
        <div className="flex items-center justify-between gap-3 mb-2 flex-wrap" style={{ alignItems: 'center' }}>
          <h4 style={{ margin: 0 }}>{customer.name}</h4>
          {customer.overdue && (
            <span className="chip chip-danger">Vencido</span>
          )}
        </div>
        <p className="form-hint mb-2">
          Teléfono: {customer.phone || 'Sin teléfono registrado'}
        </p>
        <p className="mb-3">
          Total pendiente: <strong>{formatCurrency(customer.totalOpen, config)}</strong>
        </p>

        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {customer.items.map((item, index) => (
            <li key={`${item.type}-${item.dueDate}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <span className={`chip chip-${TYPE_CHIP_MAP[item.type] || 'neutral'}`} style={{ minWidth: '88px', textAlign: 'center' }}>
                {collectionTypeLabel(item.type)}
              </span>
              <span>{formatCurrency(item.amount, config)}</span>
              <span className="form-hint" style={{ whiteSpace: 'nowrap' }}>
                {item.dueDate ? formatDate(item.dueDate, config) : '—'}
              </span>
            </li>
          ))}
        </ul>

        {link ? (
          <a
            className="btn btn-success mt-3"
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            title="Enviar recordatorio por WhatsApp"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" style={{ marginRight: 'var(--space-1)' }}>
              <path d="M17 9.21V20a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-2.79A6 6 0 0 1 4 12a6 6 0 0 1 4-5.65V4.21A1 1 0 0 1 4.79 3H8a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2.15A6 6 0 0 1 20 12a6 6 0 0 1-3 5.65z"/>
              <path d="M12 7v8"/>
              <path d="M9 10h6"/>
            </svg>
            Recordar por WhatsApp
          </a>
        ) : (
          <p className="form-hint mt-3" role="status" style={{ fontStyle: 'italic', color: 'var(--color-text-muted)' }}>
            {PHONE_REQUIRED_TEXT}
          </p>
        )}
      </div>
    </article>
  );
}