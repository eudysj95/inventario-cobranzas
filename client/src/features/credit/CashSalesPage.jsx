// Cash-sales page (task S4.2), wired at /venta. Hosts CashSaleForm;
// after a successful create the page switches to the sale detail view, which
// reads the persisted sale via GET /api/cash-sales/:saleId (useCashSaleDetail —
// the "sale detail read"). A new sale resets back to the form. UI copy in
// neutral Spanish.
// Nexo design system: header, modal via utilities.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_CONFIG, useConfig } from '../../api/config.js';
import { useCashSaleMutations, useCashSaleDetail } from '../../api/cash-sales.js';
import { formatCurrency, formatDate } from '../../lib/format.js';
import CashSaleForm from './CashSaleForm.jsx';
import CashSaleDetail from './CashSaleDetail.jsx';

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
      <section style={{ padding: 'var(--space-4) 0' }}>
        <header className="flex items-center justify-between gap-3 mb-4 flex-wrap" style={{ alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 'var(--text-2xl)' }}>Venta de contado</h2>
        </header>
        <CashSaleDetail saleId={createdSaleId} config={config} />
        <button type="button" onClick={() => setCreatedSaleId(null)} className="btn btn-secondary btn-sm mt-3">
          Volver a venta
        </button>
      </section>
    );
  }

  const [formOpen, setFormOpen] = useState(false);

  return (
    <section style={{ padding: 'var(--space-4) 0' }}>
      <header className="flex items-center justify-between gap-3 mb-4 flex-wrap" style={{ alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: 'var(--text-2xl)' }}>Venta de contado</h2>
        <button type="button" onClick={() => setFormOpen(true)} className="btn btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" style={{ marginRight: 'var(--space-1)' }}>
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Nueva venta de contado
        </button>
      </header>

      {formOpen && (
        <CashSaleForm onSubmit={handleCreate} onCancel={() => setFormOpen(false)} />
      )}

      {!formOpen && (
        <p className="empty-state">Seleccione «Nueva venta de contado» para registrar una venta.</p>
      )}
    </section>
  );
}