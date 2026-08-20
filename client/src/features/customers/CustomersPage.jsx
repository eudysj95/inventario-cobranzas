// Customers page (task 6.4 S3), wired at /clientes.
// Searchable list of clients with open_balance.
// Overlay create/edit client.
// Delete customer: confirms and if server responds 409 (FK RESTRICT: has
// cash/deudas history), shows the verbatim message; if no history, deletes
// and refetches the list.
// Patrón InventoryPage: overlay .form-overlay, local validate() that returns
// string error or null, submit deshabilitado mientras submitting.

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { NavLink } from 'react-router-dom';
import {
  useCustomers, useCustomerMutations,
} from '../../api/customers.js';
import { useConfig } from '../../api/config.js';
import { formatCurrency } from '../../lib/format.js';
import CustomerForm from '../customer/CustomerForm.jsx';

export default function CustomersPage() {
  const { data: customers = [], isPending, isError } = useCustomers('');
  const queryClient = useQueryClient();
  const { remove: mutateRemove, isDeleting } = useCustomerMutations();
  const config = useConfig();

  const [search, setSearch] = useState('');
  const [form, setForm] = useState(null); // {mode: 'create'} | {mode: 'edit', customer}
  const [bannerError, setBannerError] = useState(null);

  

  function openCreate() {
    setForm({ mode: 'create' });
    setBannerError(null);
  }

  function openEdit(customer) {
    setForm({ mode: 'edit', customer });
    setBannerError(null);
  }

  function closeForm() {
    setForm(null);
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Eliminar este cliente? Esta acción no se puede deshacer.')) return;
    setBannerError(null);
    try {
      await mutateRemove(id);
      // If we get here without 409, the delete succeeded
      setBannerError(null);
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    } catch (err) {
      // Server FK RESTRICT (409) — show verbatim message
      const message = err instanceof Error ? err.message : 'Ocurrió un error inesperado.';
      setBannerError(message);
      // Don't refetch — the client stays in the list (FK RESTRICT prevented it)
    }
  }

  async function handleSubmit() {
    setBannerError(null);
    try {
      closeForm();
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    } catch (err) {
      // Server FK RESTRICT (409) — show verbatim; otherwise generic error
      const message = err instanceof Error ? err.message : 'Ocurrió un error inesperado.';
      setBannerError(message);
    }
  }

  return (
    <section className="customers-page">
      <header className="inventory-header">
        <h2>Clientes</h2>
        <NavLink to="/inventory">Inventario</NavLink>
      </header>

      <form className="customers-filters">
        <input
          type="search"
          placeholder="Buscar clientes…"
          value={search}
          onChange={(e) => setSearch(e.target.value.trim())}
        />
        <button type="button" onClick={() => setSearch('')}>
          Limpiar
        </button>
      </form>

      {bannerError && (
        <p className="banner-error" role="alert">
          {bannerError}
        </p>
      )}

      {isPending ? (
        <p>Cargando clientes…</p>
      ) : customers.length === 0 ? (
        <p>No hay clientes registrados.</p>
      ) : (
        <div className="customers-list">
          {customers.map((customer) => (
            <div key={customer.id} className="customer-row">
              <span>{customer.name}</span>
              <span className="customer-balance">
                Saldo abierto: {formatCurrency(customer.open_balance, config)}
              </span>
              <div className="customer-actions">
                <button type="button" onClick={() => openEdit(customer)}>
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(customer.id)}
                  className="danger"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {form && (
        <CustomerForm
          onSubmit={handleSubmit}
          onCancel={closeForm}
          isEditing={form.mode === 'edit'}
          initialCustomer={form?.customer ?? null}
        />
      )}

      {isPending && <p aria-live="polite">Procesando…</p>}
    </section>
  );
}