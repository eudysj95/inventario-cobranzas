// Shared CustomerSelect component used across sales forms (S2 base,
// full overlay integration in S3/S4).
// - Combobox con lista de clientes desde useCustomers('')
// - Filtro por texto (nombre o teléfono)
// - Toggle "Nuevo cliente" que abre un mini-overlay con form name + phone opcional
// - On success: refetches useCustomers(''), preselecciona el nuevo cliente creado
// Nexo design system: combobox, overlay, buttons via utilities.

import { useState, useEffect, useRef } from 'react';
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
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '' });
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const comboboxRef = useRef(null);

  // Sync with initialCustomerId prop changes
  useEffect(() => {
    if (initialCustomerId && initialCustomerId !== customerId) {
      setCustomerId(initialCustomerId);
      setSearch('');
    }
  }, [initialCustomerId]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (comboboxRef.current && !comboboxRef.current.contains(event.target)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset highlighted index when filtered list changes
  const filteredCustomers = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone && c.phone.includes(search))
  );

  useEffect(() => {
    setHighlightedIndex(-1);
  }, [filteredCustomers, search]);

  function handleSelectCustomer(id) {
    setCustomerId(id);
    setSearch('');
    setIsOpen(false);
    if (onSelect) onSelect(id);
  }

  function handleKeyDown(event) {
    const maxIndex = filteredCustomers.length - 1;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (highlightedIndex >= 0 && filteredCustomers[highlightedIndex]) {
        handleSelectCustomer(filteredCustomers[highlightedIndex].id);
      }
    } else if (event.key === 'Escape') {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  }

  function handleInputChange(event) {
    const value = event.target.value;
    setSearch(value);
    setIsOpen(true);
    // Clear selection if user types (they're searching for a different customer)
    if (value && customerId) {
      setCustomerId('');
      if (onSelect) onSelect('');
    }
  }

  function handleBlur() {
    // Delay to allow click on option to register
    setTimeout(() => setIsOpen(false), 150);
  }

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

  const selectedCustomer = customers.find((c) => c.id === customerId);
  const displayValue = selectedCustomer
    ? `${selectedCustomer.name}${selectedCustomer.phone ? ` - ${selectedCustomer.phone}` : ''}`
    : '';

  return (
    <div className="flex flex-wrap gap-2" style={{ alignItems: 'flex-end' }}>
      <div className="form-row" style={{ flex: 1, minWidth: '200px', flexDirection: 'column', gap: 'var(--space-1)' }}>
        <label htmlFor="customer-combobox" className="label">Cliente</label>
        <div className="relative" ref={comboboxRef}>
          <input
            id="customer-combobox"
            type="text"
            value={displayValue || search}
            onChange={handleInputChange}
            onFocus={() => !isPending && setIsOpen(true)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            disabled={isPending || isCreating}
            className="input"
            placeholder="Buscar o seleccionar cliente…"
            autoComplete="off"
            aria-autocomplete="list"
            aria-controls="customer-listbox"
            aria-expanded={isOpen && filteredCustomers.length > 0}
            role="combobox"
          />
          {isOpen && filteredCustomers.length > 0 && (
            <ul
              id="customer-listbox"
              role="listbox"
              className="absolute z-dropdown w-full mt-1 max-h-60 overflow-auto"
              style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)' }}
            >
              {filteredCustomers.map((customer, index) => (
                <li
                  key={customer.id}
                  role="option"
                  aria-selected={index === highlightedIndex}
                  onClick={() => handleSelectCustomer(customer.id)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`px-3 py-2 cursor-pointer ${index === highlightedIndex ? 'bg-primary-light text-primary' : ''} ${customerId === customer.id ? 'font-semibold' : ''}`}
                  style={{ fontSize: 'var(--text-sm)' }}
                >
                  {customer.name}
                  {customer.phone && <span className="ml-2 text-text-muted" style={{ fontSize: 'var(--text-xs)' }}>{customer.phone}</span>}
                </li>
              ))}
            </ul>
          )}
          {isOpen && filteredCustomers.length === 0 && search && !isPending && (
            <div className="absolute z-dropdown w-full mt-1 p-3 text-text-secondary text-sm" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)' }}>
              No se encontraron clientes para "{search}"
            </div>
          )}
        </div>
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