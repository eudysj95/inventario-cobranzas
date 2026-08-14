// Credit sales page (task 6.4), wired at /credit-sales. Hosts CreditSaleForm;
// after a successful create the page switches to the sale detail view, which
// reads the persisted sale via GET /api/credit-sales/:saleId (useSaleDetail —
// the "sale detail read"). A new sale resets back to the form. UI copy in
// neutral Spanish.

import { useState } from 'react';
import { DEFAULT_CONFIG, useConfig } from '../../api/config.js';
import { useCreditSaleMutations, useSaleDetail } from '../../api/credit-sales.js';
import { formatCurrency, formatDate } from '../../lib/format.js';
import CreditSaleForm from './CreditSaleForm.jsx';
import './credit.css';

export default function CreditSalesPage() {
  const { data: configData } = useConfig();
  const config = configData ?? DEFAULT_CONFIG;
  const { create } = useCreditSaleMutations();
  const [createdSaleId, setCreatedSaleId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  async function handleCreate(body) {
    const sale = await create(body);
    setCreatedSaleId(sale.id);
    setFormOpen(false);
  }

  if (createdSaleId) {
    return (
      <section className="credit-page">
        <header className="inventory-header">
          <h2>Venta a crédito</h2>
        </header>
        <SaleDetail saleId={createdSaleId} config={config} />
        <button type="button" onClick={() => setCreatedSaleId(null)}>
          Nueva venta
        </button>
      </section>
    );
  }

  return (
    <section className="credit-page">
      <header className="inventory-header">
        <h2>Venta a crédito</h2>
        <button type="button" onClick={() => setFormOpen(true)}>
          Nueva venta a crédito
        </button>
      </header>
      {formOpen && (
        <CreditSaleForm onSubmit={handleCreate} onCancel={() => setFormOpen(false)} />
      )}
      {!formOpen && <p>Seleccione «Nueva venta a crédito» para registrar una venta.</p>}
    </section>
  );
}

/** Sale detail read: fetches the persisted sale from GET /api/credit-sales/:saleId. */
function SaleDetail({ saleId, config }) {
  const { data: sale, isPending, isError } = useSaleDetail(saleId);

  if (isPending) return <p>Cargando detalle de la venta…</p>;
  if (isError) return <p role="alert">No se pudo cargar el detalle de la venta.</p>;

  const totalPaid = sale.lines.reduce((sum, line) => sum + (Number(line.amount) - Number(line.balance)), 0);

  return (
    <div className="sale-detail">
      <h3>{sale.customer_name}</h3>
      <p className="form-hint">Venta {sale.id}</p>
      <table className="apartado-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Unidades</th>
            <th>Monto</th>
            <th>Saldo</th>
            <th>Vencimiento</th>
            <th>Estado</th>
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
              <td>{line.status === 'open' ? 'Abierta' : 'Cerrada'}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2}>Total</td>
            <td>{formatCurrency(sale.total, config)}</td>
            <td colSpan={3}>Pagado: {formatCurrency(totalPaid, config)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}