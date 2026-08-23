// Cash-sale detail view (task S4.3). Shows sale id, customer name,
// created_at, lines (product name, units, amount each, total), total general.
// Botón "Volver a venta" que navega de vuelta a `/venta`.
// Nexo design system: card, table, button via utilities.

import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { formatCurrency, formatDate } from '../../lib/format.js';
import { getCashSale } from '../../api/cash-sales.js';

export default function CashSaleDetail({ saleId }) {
  const { data: sale, isPending, isError } = useQuery({
    queryKey: ['cash-sales', 'detail', saleId],
    queryFn: ({ signal }) => getCashSale(saleId, { signal }),
    enabled: Boolean(saleId),
  });

  const navigate = useNavigate();

  if (isPending) return <p className="loading">Cargando detalle de la venta…</p>;
  if (isError) return <p className="alert alert-error" role="alert">No se pudo cargar el detalle de la venta.</p>;
  if (!sale) return <p className="alert alert-error" role="alert">Venta no encontrada.</p>;

  const totalGeneral = sale.lines.reduce(
    (sum, line) => sum + Number(line.amount),
    0
  );

  return (
    <div className="card mt-4">
      <div className="card-body">
        <h3 className="mb-4">Detalle de la venta</h3>
        <div className="mb-4" style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <p><strong>Venta:</strong> {sale.id}</p>
          <p><strong>Cliente:</strong> {sale.customer_name}</p>
          <p><strong>Fecha:</strong> {formatDate(sale.created_at, { currencySymbol: '$', currencyLocale: 'es-AR' })}</p>
        </div>

        {sale.lines.length === 0 ? (
          <p className="empty-state">No hay líneas en esta venta.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Producto</th>
                  <th scope="col">Unidades</th>
                  <th scope="col">Monto</th>
                  <th scope="col">Total</th>
                </tr>
              </thead>
              <tbody>
                {sale.lines.map((line) => (
                  <tr key={line.id}>
                    <td>{line.product_name}</td>
                    <td>{line.units}</td>
                    <td>{formatCurrency(line.amount, { currencySymbol: '$', currencyLocale: 'es-AR' })}</td>
                    <td>{formatCurrency(line.amount, { currencySymbol: '$', currencyLocale: 'es-AR' })}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={2} style={{ fontWeight: 'var(--font-weight-semibold)' }}>Total general</td>
                  <td style={{ fontWeight: 'var(--font-weight-semibold)' }}>{formatCurrency(totalGeneral, { currencySymbol: '$', currencyLocale: 'es-AR' })}</td>
                  <td colSpan={2} style={{ fontWeight: 'var(--font-weight-semibold)' }}>{formatCurrency(totalGeneral, { currencySymbol: '$', currencyLocale: 'es-AR' })}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

      </div>
      <div className="card-footer">
        <button
          type="button"
          onClick={() => navigate('/venta')}
          className="btn btn-secondary"
        >
          Volver a venta
        </button>
      </div>
    </div>
  );
}