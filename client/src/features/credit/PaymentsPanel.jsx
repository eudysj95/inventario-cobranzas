// Payments panel (task 6.4), wired at /payments. Pick a customer → the panel
// loads the customer detail (open_debts with balances + payment history) and
// shows the open debts with a FIFO payment form (amount + optional note).
// FIFO allocation is SERVER-SIDE: the client sends {customerId, amount, note?}
// and receives { payment, allocations }. Client-side guards mirror the server's
// overpay and no-open-debts rejections; server messages still surface verbatim
// via ApiError (authoritative). UI copy in neutral Spanish.
// Nexo design system: header, select, table, form, card via utilities.

import { useState } from 'react';
import { DEFAULT_CONFIG, useConfig } from '../../api/config.js';
import { useCustomers, useCustomer } from '../../api/customers.js';
import { buildPaymentBody, usePaymentMutations } from '../../api/payments.js';
import { formatCurrency, formatDate } from '../../lib/format.js';

export default function PaymentsPanel() {
  const { data: configData } = useConfig();
  const config = configData ?? DEFAULT_CONFIG;
  const { data: customers = [], isPending: customersPending } = useCustomers('');
  const { create } = usePaymentMutations();

  const [customerId, setCustomerId] = useState('');
  const {
    data: detail,
    isPending: detailPending,
    isError: detailError,
  } = useCustomer(customerId || null);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const openDebts = detail?.open_debts ?? [];
  const totalOpen = openDebts.reduce((sum, debt) => sum + Number(debt.balance), 0);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setResult(null);
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError('El monto debe ser un número mayor a cero.');
      return;
    }
    // Client-side guards mirroring the server's 400s (fail fast on obvious
    // cases; the server cents check remains authoritative).
    if (openDebts.length === 0) {
      setError('El cliente no tiene deudas abiertas.');
      return;
    }
    if (Math.round(value * 100) > Math.round(totalOpen * 100)) {
      setError('El pago supera el saldo total del cliente.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await create(buildPaymentBody(customerId, value, note));
      setResult(res);
      setAmount('');
      setNote('');
    } catch (err) {
      // Server "Payment exceeds the customer's remaining balance" / "Customer
      // has no open debts" surface verbatim.
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section style={{ padding: 'var(--space-4) 0' }}>
      <header className="flex items-center justify-between gap-3 mb-4 flex-wrap" style={{ alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: 'var(--text-2xl)' }}>Cobros</h2>
      </header>

      <form onSubmit={(event) => event.preventDefault()} className="mb-4">
        <div className="form-row" style={{ flex: 1, minWidth: '280px', flexDirection: 'column', gap: 'var(--space-1)', maxWidth: '384px' }}>
          <label htmlFor="payments-customer" className="label">Cliente</label>
          <select
            id="payments-customer"
            value={customerId}
            onChange={(event) => {
              setCustomerId(event.target.value);
              setError(null);
              setResult(null);
            }}
            disabled={customersPending}
            className="input select"
          >
            <option value="">Seleccionar…</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name} — saldo {formatCurrency(customer.open_balance, config)}
              </option>
            ))}
          </select>
        </div>
      </form>

      {customerId && detailPending && <p className="loading">Cargando deudas del cliente…</p>}
      {customerId && detailError && (
        <p className="alert alert-error" role="alert">No se pudieron cargar las deudas del cliente.</p>
      )}

      {customerId && !detailPending && !detailError && (
        <div className="card" style={{ maxWidth: '48rem' }}>
          <div className="card-body">
            {openDebts.length === 0 ? (
              <p className="empty-state">El cliente no tiene deudas abiertas.</p>
            ) : (
              <>
                <div className="table-wrap mb-4">
                  <table className="table">
                    <thead>
                      <tr>
                        <th scope="col">Producto</th>
                        <th scope="col">Unidades</th>
                        <th scope="col">Monto</th>
                        <th scope="col">Saldo</th>
                        <th scope="col">Vencimiento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {openDebts.map((debt) => (
                        <tr key={debt.id}>
                          <td>{debt.product_name}</td>
                          <td>{debt.units}</td>
                          <td>{formatCurrency(debt.amount, config)}</td>
                          <td>{formatCurrency(debt.balance, config)}</td>
                          <td style={{ whiteSpace: 'nowrap' }}>{debt.due_date ? formatDate(debt.due_date, config) : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} style={{ fontWeight: 'var(--font-weight-semibold)' }}>Saldo total pendiente</td>
                        <td style={{ fontWeight: 'var(--font-weight-semibold)' }}>{formatCurrency(totalOpen, config)}</td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {openDebts.length > 0 && (
                  <form className="card p-4" style={{ background: 'var(--color-surface-hover)', borderRadius: 'var(--radius-md)', maxWidth: '384px' }} onSubmit={handleSubmit}>
                    <h3 className="mb-3" style={{ fontSize: 'var(--text-lg)' }}>Registrar pago (abono)</h3>
                    {error && (
                      <p className="form-error mb-3" role="alert">
                        {error}
                      </p>
                    )}
                    <div className="form-row" style={{ gap: 'var(--space-3)', flexDirection: 'column' }}>
                      <div className="form-row" style={{ flexDirection: 'column', gap: 'var(--space-1)' }}>
                        <label htmlFor="payments-amount" className="label">Monto</label>
                        <input
                          id="payments-amount"
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={amount}
                          onChange={(event) => setAmount(event.target.value)}
                          required
                          disabled={submitting}
                          className="input"
                        />
                      </div>
                      <div className="form-row" style={{ flexDirection: 'column', gap: 'var(--space-1)' }}>
                        <label htmlFor="payments-note" className="label">Nota (opcional)</label>
                        <input
                          id="payments-note"
                          type="text"
                          value={note}
                          onChange={(event) => setNote(event.target.value)}
                          disabled={submitting}
                          className="input"
                        />
                      </div>
                    </div>
                    <div className="form-actions mt-3" style={{ marginLeft: 'auto' }}>
                      <button type="submit" className="btn btn-primary" disabled={submitting}>
                        {submitting ? (
                          <>
                            <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} aria-hidden="true"></span>
                            Guardando…
                          </>
                        ) : (
                          'Registrar pago'
                        )}
                      </button>
                    </div>
                  </form>
                )}

                {result && <AllocationsResult result={result} debts={openDebts} config={config} />}
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

/** FIFO allocations result: which debts the payment was applied to (oldest first). */
function AllocationsResult({ result, debts, config }) {
  const byId = new Map(debts.map((debt) => [debt.id, debt]));
  return (
    <div className="card mt-4 alert alert-success" style={{ maxWidth: '32rem' }} role="status">
      <div className="card-body">
        <h3 className="mb-2">Pago registrado</h3>
        <p className="mb-2">
          {formatCurrency(result.payment.amount, config)} aplicado a{' '}
          {result.allocations.length}{' '}
          {result.allocations.length === 1 ? 'deuda' : 'deudas'} (FIFO).
        </p>
        <ul style={{ margin: 0, paddingLeft: 'var(--space-5)' }}>
          {result.allocations.map((allocation) => {
            const debt = byId.get(allocation.debt_id);
            return (
              <li key={allocation.debt_id}>
                {debt ? debt.product_name : 'Deuda'} — {formatCurrency(allocation.amount, config)}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}