// Shared CustomerSelect component used across sales forms (S2 base,
// full overlay integration in S3/S4).
// - Select con lista de clientes desde useCustomers('')
// - Toggle "Nuevo cliente" que abre un mini-overlay con form name + phone opcional
// - On success: refetches useCustomers(''), preselecciona el nuevo cliente creado
// Nexo design system: select, overlay, buttons via utilities.

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

  // Sync with initialCustomerId prop changes
  useEffect(() => {
    if (initialCustomerId && initialCustomerId !== customerId) {
      setCustomerId(initialCustomerId);
    }
  }, [initialCustomerId]);

  const handleSaveNewCustomer = async () => {
    if (!newCustomer.name.trim()) return;
    setIsCreating(true);
    try {
      const customer = await createCustomer(newCustomer.name, newCustomer.phone);
      onSelect(customer.id ?? '');
      setNewCustomer({ name: '', phone: '' });
    } catch (err) {
      console.error('Error creating customer from select:', err);
    } finally {
      setIsCreating(false);
      setOverlayOpen(false);
      await queryClient.invalidateQueries({ queryKey: ['customers'] });
    }
  };

  return (
    <div className="flex flex-wrap gap-2" style={{ alignItems: 'flex-end' }}>
      <div className="form-row" style={{ flex: 1, minWidth: '200px', flexDirection: 'column', gap: 'var(--space-1)' }}>
        <label htmlFor="customer-select" className="label">Cliente</label>
        <select
          id="customer-select"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          disabled={isPending || isCreating}
          className="input select"
          aria-label="Seleccionar cliente"
        >
          <option value="">Seleccionar cliente…</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}{c.phone ? ` - ${c.phone}` : ''}
            </option>
          ))}
        </select>
      </div>

      {allowCreate && (
        <button
          type="button"
          onClick={() => setOverlayOpen(true)}
          disabled={isPending || isCreating}
          className="btn btn-secondary"
          style={{ minHeight: 'var(--touch-target)' }}
        >
          {isCreating ? 'Creando…' : 'Nuevo cliente'}
        </button>
      )}

      {overlayOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Nuevo cliente">
          <form className="modal" onSubmit={(e) => { e.preventDefault(); handleSaveNewCustomer(); }}>
            <div className="modal-header">
              <h3 className="modal-title">Nuevo cliente</h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setOverlayOpen(false)}
                disabled={isCreating}
                aria-label="Cerrar"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="modal-body">
              <label htmlFor="customer-select-name" className="label">
                Nombre
                <input
                  id="customer-select-name"
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  required
                  disabled={isCreating}
                  className="input"
                  autoFocus
                />
              </label>

              <label htmlFor="customer-select-phone" className="label">
                Teléfono (opcional)
                <input
                  id="customer-select-phone"
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                  disabled={isCreating}
                  className="input"
                  placeholder="Ej: +54 9 11 1234-5678"
                />
              </label>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setOverlayOpen(false)}
                className="btn btn-secondary"
                disabled={isCreating}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" disabled={isCreating}>
                {isCreating ? (
                  <>
                    <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} aria-hidden="true"></span>
                    Guardando…
                  </>
                ) : (
                  'Crear'
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}