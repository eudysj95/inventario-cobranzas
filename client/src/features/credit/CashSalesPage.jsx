// Cash-sales page (task S4.2), wired at /venta. Hosts CashSaleForm;
// after a successful create the page switches to the sale detail view, which
// reads the persisted sale via GET /api/cash-sales/:saleId (useCashSaleDetail —
// the "sale detail read"). A new sale resets back to the form. UI copy in
// neutral Spanish.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_CONFIG, useConfig } from '../../api/config.js';
import { useCashSaleMutations, useCashSaleDetail } from '../../api/cash-sales.js';
import { formatCurrency, formatDate } from '../../lib/format.js';
import CashSaleForm from './CashSaleForm.jsx';
import './credit.css';

export default function CashSalesPage() {
  const { data: configData } = useConfig();
  const config = configData ?? DEFAULT_CONFIG;
  const { create } = useCashSaleMutations();
  const { data: sale, isPending: isDetailPending, isError: isDetailError } = useCashSaleDetail(null);
  const [createdSaleId, setCreatedSaleId] = useState(null);
  const navigate = useNavigate();

  async function handleCreate({ customerId, lines }) {
    const sale = await create(customerId, lines);
    setCreatedSaleId(sale.id);
  }

  if (createdSaleId) {
    return (
      <section className="credit-page">
        <header className="inventory-header">
          <h2>Venta de contado</h2>
        </header>
        <CashSaleDetail saleId={createdSaleId} config={config} />
        <button type="button" onClick={() => setCreatedSaleId(null)}>
          Volver a venta
        </button>
      </section>
    );
  }

  return (
    <section className="credit-page">
      <header className="inventory-header">
        <h2>Venta de contado</h2>
        <button type="button" onClick={() => setFormOpen(true)}>
          Nueva venta de contado
        </button>
      </header>
      {formOpen && (
        <CashSaleForm onSubmit={handleCreate} onCancel={() => setFormOpen(false)} />
      )}
      {!formOpen && <p>Seleccione «Nueva venta de contado» para registrar una venta.</p>}
    </section>
  );
}