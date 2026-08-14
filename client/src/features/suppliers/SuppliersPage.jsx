// Suppliers page (task 6.5), wired at /proveedores. Combines the supplier
// debt registry surface exposed by the server routes:
//   supplier list          GET  /api/suppliers?search          (search chips)
//   debt list + filter     GET  /api/supplier-debts?status     (open/closed)
//   create supplier debt   POST /api/supplier-debts            (auto-upserts
//                             the supplier by name in the same TXN)
//   pay a debt             POST /api/supplier-debts/:id/pay    (overpayment
//                             400, closed 409 — surfaced verbatim)
//   due view with flags    GET  /api/supplier-debts/due?horizonDays
//                             (overdue "Vencida" / soon "Próxima")
//
// UI copy in neutral Spanish. No WhatsApp anywhere in this domain (spec: no
// supplier messaging).

import { useState } from 'react';
import { DEFAULT_CONFIG, useConfig } from '../../api/config.js';
import { useSuppliers } from '../../api/suppliers.js';
import {
  buildSupplierDebtBody,
  supplierPayExceedsBalance,
  useSupplierDebtMutations,
  useSupplierDebts,
  useSupplierDebtsDue,
} from '../../api/supplier-debts.js';
import { formatCurrency, formatDate } from '../../lib/format.js';
import './suppliers.css';

const STATUS_FILTERS = [
  ['', 'Todos los estados'],
  ['open', 'Abiertas'],
  ['closed', 'Cerradas'],
];

const HORIZON_OPTIONS = [7, 15, 30, 60];

export default function SuppliersPage() {
  const { data: configData } = useConfig();
  const config = configData ?? DEFAULT_CONFIG;
  const { create, pay } = useSupplierDebtMutations();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [horizonDays, setHorizonDays] = useState(7);
  const [formOpen, setFormOpen] = useState(false);
  const [payingId, setPayingId] = useState(null);
  const [bannerError, setBannerError] = useState(null);
  const [busy, setBusy] = useState(false);

  const { data: suppliers = [], isPending: suppliersPending, isError: suppliersError } =
    useSuppliers(search);
  const { data: debts = [], isPending: debtsPending, isError: debtsError } =
    useSupplierDebts(status);
  const { data: due = [], isPending: duePending, isError: dueError } =
    useSupplierDebtsDue(horizonDays);

  async function handleCreate(body) {
    setBannerError(null);
    await create(body); // server validates and auto-upserts the supplier
  }

  async function handlePay(debt, amount) {
    setBannerError(null);
    try {
      await pay(debt.id, amount);
      setPayingId(null);
    } catch (err) {
      // Overpayment 400 / closed 409 surface verbatim in the inline row.
      throw err;
    }
  }

  return (
    <section className="suppliers-page">
      <header className="inventory-header">
        <h2>Proveedores</h2>
        <button type="button" onClick={() => setFormOpen(true)}>
          Nueva deuda
        </button>
      </header>

      {bannerError && (
        <p className="banner-error" role="alert">
          {bannerError}
        </p>
      )}

      <div className="suppliers-filters">
        <label htmlFor="suppliers-search">
          Proveedor
          <input
            id="suppliers-search"
            type="search"
            placeholder="Buscar…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <label htmlFor="suppliers-status">
          Estado
          <select
            id="suppliers-status"
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

      {suppliersPending ? (
        <p>Cargando proveedores…</p>
      ) : suppliersError ? (
        <p role="alert">No se pudieron cargar los proveedores.</p>
      ) : suppliers.length === 0 ? (
        <p>Sin proveedores registrados.</p>
      ) : (
        <div className="supplier-chips">
          {suppliers.map((supplier) => (
            <span key={supplier.id} className="supplier-chip" title={supplier.name}>
              {supplier.name}
            </span>
          ))}
        </div>
      )}

      <h3>Deudas de proveedores</h3>

      {debtsPending ? (
        <p>Cargando deudas…</p>
      ) : debtsError ? (
        <p role="alert">No se pudieron cargar las deudas.</p>
      ) : debts.length === 0 ? (
        <p>No hay deudas que coincidan con el filtro.</p>
      ) : (
        <table className="supplier-table">
          <thead>
            <tr>
              <th>Proveedor</th>
              <th>Monto</th>
              <th>Saldo</th>
              <th>Vencimiento</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {debts.map((debt) => (
              <DebtRow
                key={debt.id}
                debt={debt}
                config={config}
                paying={payingId === debt.id}
                onPayClick={() => {
                  setBannerError(null);
                  setPayingId(debt.id);
                }}
                onCancelPay={() => setPayingId(null)}
                onSubmitPay={handlePay}
              />
            ))}
          </tbody>
        </table>
      )}

      <h3>Próximos vencimientos</h3>
      <div className="suppliers-filters">
        <label htmlFor="suppliers-horizon">
          Horizonte
          <select
            id="suppliers-horizon"
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
      </div>
      {duePending ? (
        <p>Cargando vencimientos…</p>
      ) : dueError ? (
        <p role="alert">No se pudieron cargar los vencimientos.</p>
      ) : due.length === 0 ? (
        <p>No hay vencimientos en el horizonte.</p>
      ) : (
        <table className="supplier-table">
          <thead>
            <tr>
              <th>Proveedor</th>
              <th>Monto</th>
              <th>Saldo</th>
              <th>Vencimiento</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {due.map((debt) => (
              <tr key={debt.id}>
                <td>{debt.supplier_name}</td>
                <td>{formatCurrency(debt.amount, config)}</td>
                <td>{formatCurrency(debt.balance, config)}</td>
                <td>{formatDate(debt.due_date, config)}</td>
                <td>
                  {debt.overdue ? (
                    <span className="due-flag due-flag--overdue">Vencida</span>
                  ) : (
                    <span className="due-flag due-flag--soon">Próxima</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {busy && <p aria-live="polite">Procesando…</p>}

      {formOpen && (
        <SupplierDebtForm
          suppliers={suppliers}
          onSubmit={handleCreate}
          onCancel={() => setFormOpen(false)}
        />
      )}
    </section>
  );
}

/** Debt row with an inline pay form for open debts (mirrors server 400s). */
function DebtRow({ debt, config, paying, onPayClick, onCancelPay, onSubmitPay }) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError('El monto debe ser un número mayor a cero.');
      return;
    }
    if (supplierPayExceedsBalance(value, debt.balance)) {
      setError('El pago supera el saldo restante de la deuda.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmitPay(debt, value);
      setAmount('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
    } finally {
      setSubmitting(false);
    }
  }

  if (paying) {
    return (
      <tr className="supplier-row--paying">
        <td colSpan={6}>
          <form className="supplier-pay-form" onSubmit={handleSubmit}>
            <label htmlFor={`pay-${debt.id}`}>
              Importe del pago
              <input
                id={`pay-${debt.id}`}
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
                disabled={submitting}
                autoFocus
              />
            </label>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <div className="form-actions">
              <button type="submit" disabled={submitting}>
                {submitting ? 'Guardando…' : 'Registrar pago'}
              </button>
              <button type="button" onClick={onCancelPay} disabled={submitting}>
                Cancelar
              </button>
            </div>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td>{debt.supplier_name}</td>
      <td>{formatCurrency(debt.amount, config)}</td>
      <td>{formatCurrency(debt.balance, config)}</td>
      <td>{formatDate(debt.due_date, config)}</td>
      <td>
        <span className={`debt-status debt-status--${debt.status}`}>
          {debt.status === 'open' ? 'Abierta' : 'Cerrada'}
        </span>
      </td>
      <td>
        {debt.status === 'open' && (
          <button type="button" onClick={onPayClick}>
            Pagar
          </button>
        )}
      </td>
    </tr>
  );
}

/** Create-debt overlay: supplier name auto-upserts server-side. */
function SupplierDebtForm({ suppliers, onSubmit, onCancel }) {
  const [supplierName, setSupplierName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    if (!supplierName.trim()) {
      setError('El nombre del proveedor es obligatorio.');
      return;
    }
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError('El monto debe ser un número mayor a cero.');
      return;
    }
    if (!dueDate) {
      setError('La fecha de vencimiento es obligatoria.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(buildSupplierDebtBody({ supplierName, amount, dueDate }));
      setSupplierName('');
      setAmount('');
      setDueDate('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="form-overlay">
      <form className="product-form" onSubmit={handleSubmit}>
        <h3>Nueva deuda de proveedor</h3>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <label htmlFor="supplier-name">
          Nombre del proveedor
          <input
            id="supplier-name"
            type="text"
            list="suppliers-list"
            value={supplierName}
            onChange={(event) => setSupplierName(event.target.value)}
            required
            disabled={submitting}
          />
          <datalist id="suppliers-list">
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.name} />
            ))}
          </datalist>
        </label>
        <p className="form-hint">
          Si el proveedor no existe, se crea automáticamente al registrar la deuda.
        </p>
        <label htmlFor="supplier-debt-amount">
          Monto
          <input
            id="supplier-debt-amount"
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
            disabled={submitting}
          />
        </label>
        <label htmlFor="supplier-debt-due">
          Fecha de vencimiento
          <input
            id="supplier-debt-due"
            type="date"
            value={dueDate}
            onChange={(event) => setDueDate(event.target.value)}
            required
            disabled={submitting}
          />
        </label>
        <div className="form-actions">
          <button type="submit" disabled={submitting}>
            {submitting ? 'Guardando…' : 'Registrar deuda'}
          </button>
          <button type="button" onClick={onCancel} disabled={submitting}>
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}