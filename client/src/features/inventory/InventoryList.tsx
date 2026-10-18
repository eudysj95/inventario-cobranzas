import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useConfig } from "../../api/config";
import { useProducts, useProductMutations } from "../../api/products";
import { formatCurrency, formatDate } from "../../lib/format";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Spinner } from "../../components/ui/Spinner";
import { Card } from "../../components/ui/Card";
import { FormLayout, FormLayoutProps } from "../../components/forms";
import { Dropdown } from "../../components/ui/Dropdown/Dropdown";

const PRODUCT_STATES = [
  ["", "Todos los estados"],
  ["available", "Disponible"],
  ["apartado", "Apartado"],
  ["credit", "Crédito"],
  ["sold", "Vendido"],
];

const STATE_CHIP_MAP: Record<string, "danger" | "success" | "info" | "neutral"> = {
  apartado: "danger",
  credit: "success",
  available: "info",
  sold: "neutral",
};

interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total_units: number;
  available_units: number;
  updated_at: string;
}

interface InventoryListProps extends Omit<FormLayoutProps, "children"> {}

function ProductRow({
  product,
  onEdit,
  onDelete,
  config,
  navigate,
}: {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  config: { currencySymbol: string; currencyLocale: string };
  navigate: (path: string) => void;
}) {
  // Build state chips similar to the old ProductRow
  const stateCounts = [
    { state: "available", count: product.available_units, label: "Disponible", key: "Disp" },
    { state: "apartado", count: product.quantity - product.available_units, label: "Apartado", key: "Apar" },
    { state: "credit", count: 0, label: "Crédito", key: "Cred" },
    { state: "sold", count: 0, label: "Vendido", key: "Vend" },
  ].filter((c) => c.count > 0);

  // Venta dropdown items
  const ventaItems = [
    { label: "Venta de contado", value: "cash", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 5h20"/><path d="M2 12h20"/><path d="M2 19h20"/></svg> },
    { label: "Venta a crédito", value: "credit", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg> },
    { label: "Apartado", value: "apartado", icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12V7H5V7"/><path d="M3 5v14"/><path d="M21 12v7"/><path d="M7 12h10"/><path d="M12 7v10"/></svg> },
  ];

  function handleVentaSelect(item: { label: string; value: string }) {
    const baseUrl = item.value === "cash" ? "/venta" : item.value === "credit" ? "/credit-sales" : "/apartados";
    const url = `${baseUrl}?productId=${product.id}&new=true`;
    navigate(url);
  }

  return (
    <tr>
      <td data-label="Producto" style={{ fontWeight: "var(--font-weight-medium)" }}>{product.name}</td>
      <td data-label="Unidades">
        <div className="chips" style={{ gap: "var(--space-2)", flexWrap: "wrap" }}>
          {stateCounts.map((chip) => (
            <span
              key={chip.state}
              className={`chip chip-${STATE_CHIP_MAP[chip.state] || "neutral"}`}
              title={`${chip.label}: ${chip.count} unidades`}
              style={{ fontSize: "var(--text-xs)", padding: "var(--space-1) var(--space-2)" }}
            >
              {chip.key} {chip.count}
            </span>
          ))}
          <span className="chips-total" style={{ fontSize: "var(--text-xs)", color: "var(--color-text-secondary)" }} title={`${product.total_units} unidades en total`}>
            Total {product.total_units}
          </span>
        </div>
      </td>
      <td data-label="Precio">{formatCurrency(product.price, config)}</td>
      <td data-label="Última actualización" style={{ whiteSpace: "nowrap" }}>{formatDate(new Date(product.updated_at), config)}</td>
      <td data-label="Acciones">
        <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
          <Dropdown
            trigger={
              <Button variant="primary" size="sm" aria-label={`Vender ${product.name}`}>
                Venta
              </Button>
            }
            items={ventaItems}
            onSelect={handleVentaSelect}
            position="bottom"
          />
          <Button variant="secondary" size="sm" onClick={() => onEdit(product)} aria-label={`Editar ${product.name}`}>
            Editar
          </Button>
          <Button variant="danger" size="sm" onClick={() => onDelete(product)} aria-label={`Eliminar ${product.name}`}>
            Eliminar
          </Button>
        </div>
      </td>
    </tr>
  );
}

export default function InventoryList() {
  const { data: configData } = useConfig();
  const config = configData ?? { currencySymbol: "$", currencyLocale: "es-AR" };
  const { create, update, remove } = useProductMutations();
  const navigate = useNavigate();

  const [searchInput, setSearchInput] = useState("");
  const [filters, setFilters] = useState({ search: "" });
  const [bannerError, setBannerError] = useState<string | null>(null);

  const { data: products = [], isPending, isError } = useProducts(filters);

  function applySearch(event: React.FormEvent) {
    event.preventDefault();
    setFilters((prev) => ({ ...prev, search: searchInput.trim() }));
  }

  function openCreate() {
    setBannerError(null);
    window.location.href = "/inventory/new";
  }

  function openEdit(product: Product) {
    setBannerError(null);
    window.location.href = `/inventory/${product.id}/edit`;
  }

  async function handleDelete(product: Product) {
    if (!window.confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) return;
    setBannerError(null);
    try {
      await remove(product.id);
    } catch (err) {
      setBannerError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
    }
  }

  return (
    <section className="inventory-page" style={{ padding: "var(--space-4) 0" }}>
      <header className="flex items-center justify-between gap-3 mb-4 flex-wrap" style={{ alignItems: "center" }}>
        <h2 style={{ margin: 0, fontSize: "var(--text-2xl)" }}>Inventario</h2>
        <Button onClick={openCreate}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{ marginRight: "var(--space-1)" }}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nuevo producto
        </Button>
      </header>

      <form onSubmit={applySearch} className="flex flex-wrap gap-3 mb-4" style={{ alignItems: "flex-end" }}>
        <div className="form-row" style={{ flex: 1, minWidth: "200px", flexDirection: "column", gap: "var(--space-1)" }}>
          <label htmlFor="inventory-search" className="label">Buscar productos</label>
          <Input
            id="inventory-search"
            type="search"
            placeholder="Buscar productos…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <Button type="submit" style={{ minHeight: "var(--touch-target)" }}>
          Buscar
        </Button>
        {searchInput && (
          <Button variant="ghost" size="sm" onClick={() => { setSearchInput(""); setFilters({ search: "" }); }}>
            Limpiar filtros
          </Button>
        )}
      </form>

      {bannerError && (
        <div className="alert alert-error mb-4" role="alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{bannerError}</span>
        </div>
      )}

      {isPending ? (
        <div className="loading" aria-live="polite">
          <Spinner />
          <span style={{ marginLeft: "var(--space-3)" }}>Cargando productos…</span>
        </div>
      ) : isError ? (
        <div className="alert alert-error" role="alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>No se pudieron cargar los productos.</span>
        </div>
      ) : products.length === 0 ? (
        <Card className="empty-state">
          <div className="card-body" style={{ textAlign: "center", padding: "var(--space-8)" }}>
            <div className="empty-state-icon" aria-hidden="true" style={{ marginBottom: "var(--space-4)" }}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.3 }}>
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="empty-state-title" style={{ margin: "0 0 var(--space-2)" }}>
              No hay productos registrados.
            </h3>
            <p style={{ margin: "0 0 var(--space-4)", color: "var(--color-text-secondary)" }}>
              Creá tu primer producto para empezar.
            </p>
            <Button onClick={openCreate}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{ marginRight: "var(--space-1)" }}>
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Crear primer producto
            </Button>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="table-wrap" role="region" aria-label="Lista de productos" tabIndex={0}>
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Producto</th>
                  <th scope="col" className="hide-mobile">Unidades</th>
                  <th scope="col">Precio</th>
                  <th scope="col" className="hide-mobile">Última actualización</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <ProductRow key={product.id} product={product} onEdit={openEdit} onDelete={handleDelete} config={config} navigate={navigate} />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </section>
  );
}