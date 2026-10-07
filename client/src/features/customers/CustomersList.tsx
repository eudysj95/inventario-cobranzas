import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useConfig } from "../../api/config";
import { useCustomers, useCustomerMutations } from "../../api/customers";
import { formatCurrency } from "../../lib/format";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Spinner } from "../../components/ui/Spinner";
import { Card } from "../../components/ui/Card";

export default function CustomersList() {
  const { data: configData } = useConfig();
  const config = configData ?? { currencySymbol: "$", currencyLocale: "es-AR" };
  const { create, update, remove } = useCustomerMutations();

  const [searchInput, setSearchInput] = useState("");
  const [bannerError, setBannerError] = useState<string | null>(null);

  const { data: customers = [], isPending, isError } = useCustomers("");

  function applySearch(event: React.FormEvent) {
    event.preventDefault();
  }

  function openCreate() {
    setBannerError(null);
    window.location.href = "/clientes/new";
  }

  function openEdit(customer: { id: string; name: string; phone: string; open_balance: number }) {
    setBannerError(null);
    window.location.href = `/clientes/${customer.id}/edit`;
  }

  async function handleDelete(customer: { id: string; name: string }) {
    if (!window.confirm(`¿Eliminar "${customer.name}"? Esta acción no se puede deshacer.`)) return;
    setBannerError(null);
    try {
      await remove(customer.id);
    } catch (err) {
      setBannerError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
    }
  }

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(searchInput.toLowerCase())
  );

  return (
    <section style={{ padding: "var(--space-4) 0" }}>
      <header className="flex items-center justify-between gap-3 mb-4 flex-wrap" style={{ alignItems: "center" }}>
        <h2 style={{ margin: 0, fontSize: "var(--text-2xl)" }}>Clientes</h2>
        <Button onClick={openCreate}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{ marginRight: "var(--space-1)" }}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nuevo cliente
        </Button>
      </header>

      <form onSubmit={applySearch} className="flex flex-wrap gap-3 mb-4" style={{ alignItems: "flex-end" }}>
        <div className="form-row" style={{ flex: 1, minWidth: "200px", flexDirection: "column", gap: "var(--space-1)" }}>
          <label htmlFor="customers-search" className="label">Buscar clientes</label>
          <Input
            id="customers-search"
            type="search"
            placeholder="Buscar clientes…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value.trim())}
          />
        </div>
        <Button variant="ghost" size="sm" onClick={() => setSearchInput("")}>
          Limpiar
        </Button>
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
          <span style={{ marginLeft: "var(--space-3)" }}>Cargando clientes…</span>
        </div>
      ) : isError ? (
        <div className="alert alert-error" role="alert">
          <span>No se pudieron cargar los clientes.</span>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <Card className="empty-state">
          <div className="card-body" style={{ textAlign: "center", padding: "var(--space-8)" }}>
            <h3 style={{ margin: "0 0 var(--space-2)" }}>No hay clientes registrados.</h3>
            <Button onClick={openCreate}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{ marginRight: "var(--space-1)" }}>
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Crear primer cliente
            </Button>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Cliente</th>
                  <th scope="col">Saldo abierto</th>
                  <th scope="col" style={{ width: "180px" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td style={{ fontWeight: "var(--font-weight-medium)" }}>{customer.name}</td>
                    <td>{formatCurrency(customer.open_balance, config)}</td>
                    <td>
                      <div style={{ display: "flex", gap: "var(--space-2)", flexWrap: "wrap" }}>
                        <Button variant="secondary" size="sm" onClick={() => openEdit(customer)} aria-label={`Editar ${customer.name}`}>
                          Editar
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(customer)} aria-label={`Eliminar ${customer.name}`}>
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </section>
  );
}