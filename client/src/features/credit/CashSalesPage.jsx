// Cash-sales page (task S4.2), wired at /venta. Hosts CashSaleForm;
// after a successful create the page switches to the sale detail view, which
// reads the persisted sale via GET /api/cash-sales/:saleId (useCashSaleDetail —
// the "sale detail read"). Also shows a history list of all cash sales.
// Nexo design system: header, modal, table via utilities.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEFAULT_CONFIG, useConfig } from '../../api/config.js';
import { useCashSaleMutations, useCashSaleDetail, useCashSalesList } from '../../api/cash-sales.js';
import { formatCurrency, formatDate } from '../../lib/format.js';
import CashSaleForm from './CashSaleForm.jsx';
import CashSaleDetail from './CashSaleDetail.jsx';

export default function CashSalesPage() {
  const { data: configData } = useConfig();
  const config = configData ?? DEFAULT_CONFIG;
  const { create } = useCashSaleMutations();
  const { data: sale, isPending: isDetailPending, isError: isDetailError } = useCashSaleDetail(null);
  const { data: listData, isPending: isListPending, isError: isListError } = useCashSalesList({ limit: 50 });
  const [createdSaleId, setCreatedSaleId] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [view, setView] = useState('list'); // 'list' | 'new' | 'detail'
  const navigate = useNavigate();

  async function handleCreate({ customerId, lines }) {
    setSubmitError(null);
    try {
      console.log('handleCreate called with:', { customerId, lines });
      const sale = await create(customerId, lines);
      console.log('Cash sale created:', sale);
      if (!sale?.id) {
        throw new Error('Server returned sale without id');
      }
      setCreatedSaleId(sale.id);
      setView('detail');
    } catch (err) {
      console.error('Cash sale creation failed:', err);
      setSubmitError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
    }
  }

  function handleBack() {
    setCreatedSaleId(null);
    setFormOpen(false);
    setSubmitError(null);
    setView('list');
  }

  function handleNewSale() {
    setFormOpen(true);
    setView('new');
  }

  const showDetail = view === 'detail';
  const showForm = view === 'new';
  const showList = view === 'list';

  const sales = listData?.sales ?? [];
  const total = listData?.total ?? 0;

  return (
    <section style={{ padding: 'var(--space-4) 0' }}>
      <header className="flex items-center justify-between gap-3 mb-4 flex-wrap" style={{ alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: 'var(--text-2xl)' }}>Venta de contado</h2>
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setView('list')}
            className={`btn ${showList ? 'btn-primary' : 'btn-secondary'}`}
          >
            Historial
          </button>
          <button
            type="button"
            onClick={handleNewSale}
            className={`btn ${showForm ? 'btn-primary' : 'btn-secondary'}`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{ marginRight: 'var(--space-1)' }}>
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Nueva venta
          </button>
          {showDetail && (
            <button type="button" onClick={handleBack} className="btn btn-secondary btn-sm">
              Volver
            </button>
          )}
        </div>
      </header>

      {showDetail ? (
        <CashSaleDetail saleId={createdSaleId} config={config} />
      ) : showForm ? (
        <>
          {submitError && (
            <p className="alert alert-error" role="alert" style={{ marginBottom: 'var(--space-4)' }}>
              {submitError}
            </p>
          )}
          <CashSaleForm onSubmit={handleCreate} onCancel={() => { setFormOpen(false); setView('list'); }} />
        </>
      ) : (
        <>
          {submitError && (
            <p className="alert alert-error" role="alert" style={{ marginBottom: 'var(--space-4)' }}>
              {submitError}
            </p>
          )}
          {isListPending ? (
            <p className="loading">Cargando historial…</p>
          ) : isListError ? (
            <p className="alert alert-error" role="alert">No se pudo cargar el historial.</p>
          ) : sales.length === 0 ? (
            <div className="card">
              <div className="card-body empty-state">
                <p>No hay ventas registradas.</p>
                <button type="button" onClick={handleNewSale} className="btn btn-primary mt-3">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{ marginRight: 'var(--space-1)' }}>
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  Registrar primera venta
                </button>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">Venta</th>
                      <th scope="col">Cliente</th>
                      <th scope="col">Fecha</th>
                      <th scope="col">Líneas</th>
                      <th scope="col">Total</th>
                      <th scope="col" style={{ width: '100px' }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((saleItem) => (
                      <tr key={saleItem.id}>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)' }}>
                          {saleItem.id.slice(0, 8)}…
                        </td>
                        <td>{saleItem.customer_name}</td>
                        <td style={{ whiteSpace: 'nowrap' }}>{formatDate(saleItem.created_at, config)}</td>
                        <td style={{ textAlign: 'center' }}>{saleItem.line_count}</td>
                        <td style={{ fontWeight: 'var(--font-weight-semibold)' }}>{formatCurrency(saleItem.total, config)}</td>
                        <td>
                          <button
                            type="button"
                            onClick={() => setCreatedSaleId(saleItem.id) || setView('detail')}
                            className="btn btn-secondary btn-sm"
                          >
                            Ver
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {total > 50 && (
                <div className="card-footer" style={{ borderTop: '1px solid var(--color-border)' }}>
                  <p className="form-hint" style={{ margin: 0 }}>
                    Mostrando 50 de {total} ventas. Scroll para cargar más (pendiente).
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}