// Customers page (task 6.4 S3), wired at /clientes.
// Searchable list of clients with open_balance.
// Overlay create/edit client.
// Delete customer: confirms and if server responds 409 (FK RESTRICT: has
// cash/deudas history), shows the verbatim message; if no history, deletes
// and refetches the list.
// Nexo design system: header, filters, list, buttons via utilities.

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
  const [form, setForm] = useState(null);
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
      setBannerError(null);
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ocurrió un error inesperado.';
      setBannerError(message);
    }
  }

  async function handleSubmit() {
    setBannerError(null);
    try {
      closeForm();
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ocurrió un error inesperado.';
      setBannerError(message);
    }
  }

  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section style={{ padding: 'var(--space-4) 0' }}>
      <header className="flex items-center justify-between gap-3 mb-4 flex-wrap" style={{ alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: 'var(--text-2xl)' }}>Clientes</h2>
        <NavLink to="/inventory" className="btn btn-secondary btn-sm">
          Inventario
        </NavLink>
      </header>

      <form onSubmit={(e) => e.preventDefault()} className="flex flex-wrap gap-3 mb-4" style={{ alignItems: 'flex-end' }}>
        <div className="form-row" style={{ flex: 1, minWidth: '200px', flexDirection: 'column', gap: 'var(--space-1)' }}>
          <label htmlFor="customers-search" className="label">Buscar clientes</label>
          <input
            id="customers-search"
            type="search"
            placeholder="Buscar clientes…"
            value={search}
            onChange={(e) => setSearch(e.target.value.trim())}
            className="input"
          />
        </div>
        <button
          type="button"
          onClick={() => setSearch('')}
          className="btn btn-secondary"
          style={{ minHeight: 'var(--touch-target)' }}
        >
          Limpiar
        </button>
      </form>

      {bannerError && (
        <p className="alert alert-error" role="alert" style={{ marginBottom: 'var(--space-4)' }}>
          {bannerError}
        </p>
      )}

      {isPending ? (
        <p className="loading">Cargando clientes…</p>
      ) : filteredCustomers.length === 0 ? (
        <p className="empty-state">No hay clientes registrados.</p>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Cliente</th>
                  <th scope="col">Saldo abierto</th>
                  <th scope="col" style={{ width: '180px' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td style={{ fontWeight: 'var(--font-weight-medium)' }}>{customer.name}</td>
                    <td>{formatCurrency(customer.open_balance, config)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => openEdit(customer)}
                          className="btn btn-secondary btn-sm"
                          aria-label={`Editar ${customer.name}`}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(customer.id)}
                          className="btn btn-danger btn-sm"
                          aria-label={`Eliminar ${customer.name}`}
                          disabled={isDeleting}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

      {isPending && <p aria-live="polite" className="loading">Procesando…</p>}
    </section>
  );
}