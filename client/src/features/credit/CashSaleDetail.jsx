// Cash-sale detail view (task S4.3). Shows sale id, customer name,
// created_at, lines (product name, units, amount each, total), total general.
// Botón "Volver a venta" que navega de vuelta a `/venta`.

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

  if (isPending) return <p>Cargando detalle de la venta…</p>;
  if (isError) return <p role="alert">No se pudo cargar el detalle de la venta.</p>;
  if (!sale) return <p role="alert">Venta no encontrada.</p>;

  const totalGeneral = sale.lines.reduce(
    (sum, line) => sum + Number(line.amount),
    0
  );

  return (
    <div className="sale-detail">
      <h3>Detalle de la venta</h3>
      <div className="sale-header">
        <p>Venta {sale.id}</p>
        <p>Cliente: {sale.customer_name}</p>
        <p>Fecha: {formatDate(sale.created_at, { currencySymbol: '$', currencyLocale: 'es-AR' })}</p>
      </div>

      {sale.lines.length === 0 ? (
        <p>No hay líneas en esta venta.</p>
      ) : (
        <table className="apartado-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Unidades</th>
              <th>Monto</th>
              <th>Total</th>
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
              <td colSpan={2}>Total general</td>
              <td>{formatCurrency(totalGeneral, { currencySymbol: '$', currencyLocale: 'es-AR' })}</td>
              <td colSpan={2}>{formatCurrency(totalGeneral, { currencySymbol: '$', currencyLocale: 'es-AR' })}</td>
            </tr>
          </tbody>
        </table>
      )}

      <button
        type="button"
        onClick={() => navigate('/venta')}
        className="back-button"
      >
        Volver a venta
      </button>
    </div>
  );
}