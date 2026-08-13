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
import './collections.css';

const HORIZON_OPTIONS = [7, 15, 30, 60];

export default function CollectionsPage() {
  const { data: configData } = useConfig();
  const config = configData ?? DEFAULT_CONFIG;

  const [horizonDays, setHorizonDays] = useState(7);
  const { data: customers = [], isPending, isError } = useCollectionsDue(horizonDays);

  const { overdue, upcoming } = groupDueCustomers(customers);

  return (
    <section className="collections-page">
      <header className="inventory-header">
        <h2>Cobranzas</h2>
      </header>

      <div className="collections-filters">
        <label htmlFor="collections-horizon">
          Horizonte
          <select
            id="collections-horizon"
            value={horizonDays}
            onChange={(event) => setHorizonDays(Number(event.target.value))}
          >
            {HORIZON_OPTIONS.map((days) => (
              <option key={days} value={days}>
                {days} días
              </option>
            ))}
          </select>
        </label>
        <span className="form-hint">
          Vencimientos dentro del horizonte, incluidos los vencidos.
        </span>
      </div>

      {isPending ? (
        <p>Cargando cobranzas…</p>
      ) : isError ? (
        <p role="alert">No se pudieron cargar las cobranzas.</p>
      ) : customers.length === 0 ? (
        <p>No hay vencimientos en el horizonte seleccionado.</p>
      ) : (
        <div className="due-groups">
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
    <div className="due-group">
      <h3>{title}</h3>
      {customers.map((customer) => (
        <CustomerCard key={customer.customerId} customer={customer} config={config} />
      ))}
    </div>
  );
}

/** Customer card: contact info, total owed, item rows, WhatsApp reminder. */
function CustomerCard({ customer, config }) {
  const message = buildCollectionMessage(customer.name, customer.items, config);
  const link = buildWaLink(customer.phone, message);

  return (
    <article className="customer-card">
      <div className="customer-card-head">
        <h4>{customer.name}</h4>
        {customer.overdue && <span className="overdue-flag">Vencido</span>}
      </div>
      <p className="form-hint">
        Teléfono: {customer.phone || 'Sin teléfono registrado'}
      </p>
      <p className="customer-total">
        Total pendiente: <strong>{formatCurrency(customer.totalOpen, config)}</strong>
      </p>

      <ul className="due-items">
        {customer.items.map((item, index) => (
          <li key={`${item.type}-${item.dueDate}-${index}`}>
            <span className={`type-badge type-badge--${item.type}`}>
              {collectionTypeLabel(item.type)}
            </span>
            <span>{formatCurrency(item.amount, config)}</span>
            <span className="form-hint">
              {item.dueDate ? formatDate(item.dueDate, config) : '—'}
            </span>
          </li>
        ))}
      </ul>

      {link ? (
        <a
          className="wa-button"
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          title="Enviar recordatorio por WhatsApp"
        >
          Recordar por WhatsApp
        </a>
      ) : (
        // Spec "Phone dependency": no link without a customer phone.
        <p className="phone-required" role="status">
          {PHONE_REQUIRED_TEXT}
        </p>
      )}
    </article>
  );
}