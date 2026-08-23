// Credit sales page (task 6.4), wired at /credit-sales. Hosts CreditSaleForm;
// after a successful create the page switches to the sale detail view, which
// reads the persisted sale via GET /api/credit-sales/:saleId (useSaleDetail —
// the "sale detail read"). A new sale resets back to the form. UI copy in
// neutral Spanish.
// Nexo design system: header, modal, card, table via utilities.

import { useState } from 'react';
import { DEFAULT_CONFIG, useConfig } from '../../api/config.js';
import { useCreditSaleMutations, useSaleDetail } from '../../api/credit-sales.js';
import { formatCurrency, formatDate } from '../../lib/format.js';
import CreditSaleForm from './CreditSaleForm.jsx';

export default function CreditSalesPage() {
  const { data: configData } = useConfig();
  const config = configData ?? DEFAULT_CONFIG;
  const { create } = useCreditSaleMutations();
  const [createdSaleId, setCreatedSaleId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  async function handleCreate(body) {
    setSubmitError(null);
    try {
      const sale = await create(body);
      console.log('Credit sale created:', sale);
      if (!sale?.id) {
        throw new Error('Server returned sale without id');
      }
      setCreatedSaleId(sale.id);
      setFormOpen(false);
    } catch (err) {
      console.error('Credit sale creation failed:', err);
      setSubmitError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
      throw err;
    }
  }

  if (createdSaleId) {
    return (
      <section style={{ padding: 'var(--space-4) 0' }}>
        <header className="flex items-center justify-between gap-3 mb-4 flex-wrap" style={{ alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 'var(--text-2xl)' }}>Venta a crédito</h2>
        </header>
        <SaleDetail saleId={createdSaleId} config={config} />
        <button type="button" onClick={() => setCreatedSaleId(null)} className="btn btn-secondary btn-sm mt-3">
          Nueva venta
        </button>
      </section>
    );
  }

  return (
    <section style={{ padding: 'var(--space-4) 0' }}>
      <header className="flex items-center justify-between gap-3 mb-4 flex-wrap" style={{ alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: 'var(--text-2xl)' }}>Venta a crédito</h2>
        <button type="button" onClick={() => setFormOpen(true)} className="btn btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" style={{ marginRight: 'var(--space-1)' }}>
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nueva venta a crédito
        </button>
      </header>

      {submitError && (
        <p className="alert alert-error" role="alert" style={{ marginBottom: 'var(--space-4)' }}>
          {submitError}
        </p>
      )}

      {formOpen && (
        <CreditSaleForm onSubmit={handleCreate} onCancel={() => setFormOpen(false)} />
      )}

      {!formOpen && <p className="empty-state">Seleccione «Nueva venta a crédito» para registrar una venta.</p>}
    </section>
  );
}

/** Sale detail read: fetches the persisted sale from GET /api/credit-sales/:saleId. */
function SaleDetail({ saleId, config }) {
  const { data: sale, isPending, isError } = useSaleDetail(saleId);

  if (isPending) return <p className="loading">Cargando detalle de la venta…</p>;
  if (isError) return <p className="alert alert-error" role="alert">No se pudo cargar el detalle de la venta.</p>;

  const totalPaid = sale.lines.reduce((sum, line) => sum + (Number(line.amount) - Number(line.balance)), 0);

  return (
    <div className="card mt-4">
      <div className="card-body">
        <h3 className="mb-2">{sale.customer_name}</h3>
        <p className="form-hint">Venta {sale.id}</p>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Producto</th>
                <th scope="col">Unidades</th>
                <th scope="col">Monto</th>
                <th scope="col">Saldo</th>
                <th scope="col">Vencimiento</th>
                <th scope="col">Estado</th>
              </tr>
            </thead>
            <tbody>
              {sale.lines.map((line) => (
                <tr key={line.id}>
                  <td>{line.product_name}</td>
                  <td>{line.units}</td>
                  <td>{formatCurrency(line.amount, config)}</td>
                  <td>{formatCurrency(line.balance, config)}</td>
                  <td>{line.due_date ? formatDate(line.due_date, config) : '—'}</td>
                  <td>
                    <span className={`chip chip-${line.status === 'open' ? 'warning' : 'neutral'}`}>
                      {line.status === 'open' ? 'Abierta' : 'Cerrada'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2} style={{ fontWeight: 'var(--font-weight-semibold)' }}>Total</td>
                <td style={{ fontWeight: 'var(--font-weight-semibold)' }}>{formatCurrency(sale.total, config)}</td>
                <td colSpan={3} style={{ fontWeight: 'var(--font-weight-semibold)' }}>Pagado: {formatCurrency(totalPaid, config)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}