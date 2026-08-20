// Shared CustomerSelect component used across sales forms (S2 base,
// full overlay integration in S3/S4).
// - Select con lista de clientes desde useCustomers('')
// - Toggle "Nuevo cliente" que abre un mini-overlay con form name + phone opcional
// - On success: refetches useCustomers(''), preselecciona el nuevo cliente creado

import { useState, useEffect } from 'react';
import { useCustomers, createCustomer } from '../../api/customers.js';
import { useQueryClient } from '@tanstack/react-query';

const EMPTY_CUSTOMER = { id: '', name: '', phone: '' };

export default function CustomerSelect({
  // Controlled mode: caller sets these and handles onCancel
  initialCustomerId,
  onSelect,
  onCancel,
  // If true, shows the "New customer" toggle and overlay
  allowCreate = true,
}) {
  const { data: customers = [], isPending } = useCustomers('');
  const queryClient = useQueryClient();

  const [customerId, setCustomerId] = useState(initialCustomerId || '');
  const [isCreating, setIsCreating] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '' });
  const [overlayOpen, setOverlayOpen] = useState(false);

  // Preselect the newly created customer after refetch
  useEffect(() => {
    if (onSelect && !overlayOpen) {
      // Will be set by the createCustomer mutation callback
    }
  }, [queryClient, customers]);

  const handleCreateCustomer = async (name, phone) => {
    setIsCreating(true);
    try {
      await queryClient.fetchMutations({
        mutationKey: ['createCustomer'],
        // We'll use the mutation from useCustomerMutations, but for the
        // select component we do a direct API call for simplicity
        variables: { name, phone },
      });
      // After creating, refetch customers and select the new one
      await queryClient.invalidateQueries({ queryKey: ['customers'] });
      const updated = queryClient.getQueryData(['customers']);
      // Find the newly created customer (last one, or match by name)
      const created = updated[updated.length - 1];
      if (created) {
        onSelect(created.id);
      }
    } catch (err) {
      // Error handling - could surface a toast
      console.error('Error creating customer:', err);
    } finally {
      setIsCreating(false);
      setOverlayOpen(false);
    }
  };

  const handleSaveNewCustomer = async () => {
    if (!newCustomer.name.trim()) return;
    setIsCreating(true);
    try {
      const customer = await createCustomer(newCustomer.name, newCustomer.phone);
      onSelect(customer.id ?? '');
    } catch (err) {
      console.error('Error creating customer from select:', err);
    } finally {
      setIsCreating(false);
      setOverlayOpen(false);
      // Refetch to update the list
      await queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  };

  return (
    <div className="customer-select-wrapper" role="combobox" aria-haslist="true">
      <div className="customer-select-input">
        <select
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          disabled={isPending || isCreating}
        >
          <option value="">Seleccionar cliente…</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}{c.phone ? ` - ${c.phone}` : ''}
            </option>
          ))}
        </select>

        {allowCreate && (
          <button
            type="button"
            className="customer-select-new-btn"
            onClick={() => setOverlayOpen(true)}
            disabled={isPending || isCreating}
          >
            {isCreating ? 'Creando…' : 'Nuevo cliente'}
          </button>
        )}
      </div>

      {overlayOpen && (
        <div className="customer-select-overlay" role="dialog" aria-modal="true">
          <button
            type="button"
            className="overlay-close"
            onClick={() => setOverlayOpen(false)}
            aria-label="Cerrar"
          >
            ✕
          </button>
          <h3>{overlayOpen ? 'Nuevo cliente' : 'Seleccionar cliente'}</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveNewCustomer();
            }}
          >
            <div className="form-group">
              <label htmlFor="customer-name">Nombre</label>
              <input
                id="customer-name"
                type="text"
                value={newCustomer.name}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, name: e.target.value })
                }
                required
                disabled={isCreating}
              />
            </div>
            <div className="form-group">
              <label htmlFor="customer-phone">Teléfono (opcional)</label>
              <input
                id="customer-phone"
                type="tel"
                value={newCustomer.phone}
                onChange={(e) =>
                  setNewCustomer({ ...newCustomer, phone: e.target.value })
                }
                disabled={isCreating}
              />
            </div>
            <div className="form-actions">
              <button type="submit" disabled={isCreating}>
                {isCreating ? 'Guardando…' : 'Crear'}
              </button>
              <button
                type="button"
                onClick={() => setOverlayOpen(false)}
                disabled={isCreating}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// Auto-close overlay when a customer is selected from the list
// (handled by the caller via onSelect, but we can also auto-close on escape)