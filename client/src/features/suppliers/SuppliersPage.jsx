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
// UI copy in neutral Spanish. No WhatsApp anywhere in this domain (spec: no
// supplier messaging).
// Nexo design system: header, filters, chips, table, modals, forms via utilities.

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

const STATUS_FILTERS = [
  ['', 'Todos los estados'],
  ['open', 'Abiertas'],
  ['closed', 'Cerradas'],
];

const HORIZON_OPTIONS = [7, 15, 30, 60];

const DEBT_STATUS_CHIP_MAP = {
  open: 'warning',
  closed: 'neutral',
};

const DUE_FLAG_CHIP_MAP = {
  overdue: 'danger',
  soon: 'info',
};

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

  const filteredSuppliers = suppliers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section style={{ padding: 'var(--space-4) 0' }}>
      <header className="flex items-center justify-between gap-3 mb-4 flex-wrap" style={{ alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: 'var(--text-2xl)' }}>Proveedores</h2>
        <button type="button" onClick={() => setFormOpen(true)} className="btn btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" style={{ marginRight: 'var(--space-1)' }}>
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nueva deuda
        </button>
      </header>

      {bannerError && (
        <p className="alert alert-error" role="alert" style={{ marginBottom: 'var(--space-4)' }}>
          {bannerError}
        </p>
      )}

      <div className="flex flex-wrap gap-3 mb-4" style={{ alignItems: 'flex-end' }}>
        <div className="form-row" style={{ flex: 1, minWidth: '200px', flexDirection: 'column', gap: 'var(--space-1)' }}>
          <label htmlFor="suppliers-search" className="label">Proveedor</label>
          <input
            id="suppliers-search"
            type="search"
            placeholder="Buscar…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="input"
          />
        </div>
        <div className="form-row" style={{ flexDirection: 'column', gap: 'var(--space-1)', minWidth: '160px' }}>
          <label htmlFor="suppliers-status" className="label">Estado</label>
          <select
            id="suppliers-status"
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
      </div>

      {suppliersPending ? (
        <p className="loading">Cargando proveedores…</p>
      ) : suppliersError ? (
        <p className="alert alert-error" role="alert">No se pudieron cargar los proveedores.</p>
      ) : filteredSuppliers.length === 0 ? (
        <p className="empty-state mb-4">Sin proveedores registrados.</p>
      ) : (
        <div className="flex flex-wrap gap-2 mb-4" role="list" aria-label="Proveedores">
          {filteredSuppliers.map((supplier) => (
            <span
              key={supplier.id}
              className="chip chip-success"
              title={supplier.name}
              role="listitem"
              style={{ maxWidth: '288px' }}
            >
              {supplier.name}
            </span>
          ))}
        </div>
      )}

      <h3 className="mb-3" style={{ fontSize: 'var(--text-lg)' }}>Deudas de proveedores</h3>

      {debtsPending ? (
        <p className="loading">Cargando deudas…</p>
      ) : debtsError ? (
        <p className="alert alert-error" role="alert">No se pudieron cargar las deudas.</p>
      ) : debts.length === 0 ? (
        <p className="empty-state mb-6">No hay deudas que coincidan con el filtro.</p>
      ) : (
        <div className="card" style={{ overflow: 'hidden', marginBottom: 'var(--space-6)' }}>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Proveedor</th>
                  <th scope="col">Monto</th>
                  <th scope="col">Saldo</th>
                  <th scope="col">Vencimiento</th>
                  <th scope="col">Estado</th>
                  <th scope="col" style={{ width: '120px' }}>Acciones</th>
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
          </div>
        </div>
      )}

      <h3 className="mb-3" style={{ fontSize: 'var(--text-lg)' }}>Próximos vencimientos</h3>
      <div className="flex flex-wrap gap-3 mb-4" style={{ alignItems: 'flex-end' }}>
        <div className="form-row" style={{ flexDirection: 'column', gap: 'var(--space-1)', minWidth: '140px' }}>
          <label htmlFor="suppliers-horizon" className="label">Horizonte</label>
          <select
            id="suppliers-horizon"
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
      </div>

      {duePending ? (
        <p className="loading">Cargando vencimientos…</p>
      ) : dueError ? (
        <p className="alert alert-error" role="alert">No se pudieron cargar los vencimientos.</p>
      ) : due.length === 0 ? (
        <p className="empty-state mb-6">No hay vencimientos en el horizonte.</p>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Proveedor</th>
                  <th scope="col">Monto</th>
                  <th scope="col">Saldo</th>
                  <th scope="col">Vencimiento</th>
                  <th scope="col">Estado</th>
                </tr>
              </thead>
              <tbody>
                {due.map((debt) => (
                  <tr key={debt.id}>
                    <td style={{ fontWeight: 'var(--font-weight-medium)' }}>{debt.supplier_name}</td>
                    <td>{formatCurrency(debt.amount, config)}</td>
                    <td>{formatCurrency(debt.balance, config)}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{formatDate(debt.due_date, config)}</td>
                    <td>
                      <span className={`chip chip-${DUE_FLAG_CHIP_MAP[debt.overdue ? 'overdue' : 'soon']}`}>
                        {debt.overdue ? 'Vencida' : 'Próxima'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {busy && <p aria-live="polite" className="loading mt-3">Procesando…</p>}

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
      <tr style={{ background: 'var(--color-surface-hover)' }}>
        <td colSpan={6} style={{ padding: 0 }}>
          <form className="flex flex-wrap gap-3 p-3" style={{ alignItems: 'flex-end' }} onSubmit={handleSubmit}>
            <div className="form-row" style={{ flex: 1, minWidth: '200px', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <label htmlFor={`pay-${debt.id}`} className="label">Importe del pago</label>
              <input
                id={`pay-${debt.id}`}
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                required
                disabled={submitting}
                className="input"
                autoFocus
              />
            </div>
            {error && (
              <p className="form-error" role="alert" style={{ flexBasis: '100%' }}>
                {error}
              </p>
            )}
            <div className="form-actions" style={{ marginLeft: 'auto' }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Guardando…' : 'Registrar pago'}
              </button>
              <button type="button" onClick={onCancelPay} className="btn btn-secondary" disabled={submitting}>
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
      <td style={{ fontWeight: 'var(--font-weight-medium)' }}>{debt.supplier_name}</td>
      <td>{formatCurrency(debt.amount, config)}</td>
      <td>{formatCurrency(debt.balance, config)}</td>
      <td style={{ whiteSpace: 'nowrap' }}>{formatDate(debt.due_date, config)}</td>
      <td>
        <span className={`chip chip-${DEBT_STATUS_CHIP_MAP[debt.status] || 'neutral'}`}>
          {debt.status === 'open' ? 'Abierta' : 'Cerrada'}
        </span>
      </td>
      <td>
        {debt.status === 'open' && (
          <button type="button" onClick={onPayClick} className="btn btn-secondary btn-sm">
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
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Nueva deuda de proveedor">
      <form id="supplier-debt-form" className="modal" onSubmit={handleSubmit}>
        <div className="modal-header">
          <h3 className="modal-title">Nueva deuda de proveedor</h3>
          <button
            type="button"
            className="modal-close"
            onClick={onCancel}
            disabled={submitting}
            aria-label="Cerrar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <label htmlFor="supplier-name" className="label">
            Nombre del proveedor
            <input
              id="supplier-name"
              type="text"
              list="suppliers-list"
              value={supplierName}
              onChange={(event) => setSupplierName(event.target.value)}
              required
              disabled={submitting}
              className="input"
              autoFocus
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

          <div className="form-row" style={{ gap: 'var(--space-3)' }}>
            <label htmlFor="supplier-debt-amount" className="label" style={{ flex: 1 }}>
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
                className="input"
              />
            </label>
            <label htmlFor="supplier-debt-due" className="label" style={{ flex: 1 }}>
              Fecha de vencimiento
              <input
                id="supplier-debt-due"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                required
                disabled={submitting}
                className="input"
              />
            </label>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onCancel} className="btn btn-secondary" disabled={submitting}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? (
              <>
                <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} aria-hidden="true"></span>
                Guardando…
              </>
            ) : (
              'Registrar deuda'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}