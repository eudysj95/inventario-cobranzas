// Inventory table (task 6.3). Maps the product list to rows; filtering and
// sorting live in InventoryPage, this component only renders. The empty state
// is handled by the page (a bare table with no rows is unhelpful).

import ProductRow from './ProductRow.jsx';

export default function InventoryTable({ products, config, onEdit, onDelete }) {
  return (
    <table className="inventory-table">
      <thead>
        <tr>
          <th>Producto</th>
          <th>Unidades</th>
          <th>Precio</th>
          <th>Última actualización</th>
          <th>Acciones</th>
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
  );
}