// Inventory table — Nexo design system.
// Responsive table with horizontal scroll on mobile, sticky header.

import ProductRow from './ProductRow.jsx';

export default function InventoryTable({ products, config, onEdit, onDelete }) {
  return (
    <div className="table-wrap" role="region" aria-label="Lista de productos" tabIndex={0}>
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Producto</th>
            <th scope="col">Unidades</th>
            <th scope="col">Precio</th>
            <th scope="col">Última actualización</th>
            <th scope="col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              config={config}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}