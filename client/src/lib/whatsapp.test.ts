// Unit tests for the WhatsApp collection helpers (tasks 6.5 / 7.1). These
// prove the spec Domain: whatsapp-collection scenarios — message template
// (name + amount + due date + polite request), wa.me link generation with the
// customer phone, and the phone-required guard (no link without a phone).
import { describe, expect, it } from 'vitest';
import {
  buildCollectionMessage,
  buildWaLink,
  hasPhone,
  PHONE_REQUIRED_TEXT,
} from './whatsapp';

const AR = { currencySymbol: '$', currencyLocale: 'es-AR' };

describe('buildCollectionMessage (neutral formal Spanish template)', () => {
  it('includes customer name, configured-currency total and the polite request', () => {
    const msg = buildCollectionMessage('Ana García', [{ type: 'apartado', amount: 1200, dueDate: '2026-08-15' }], AR);
    expect(msg).toContain('Hola Ana García');
    expect(msg).toContain('$1.200,00');
    expect(msg).toContain('Le pedimos por favor realizar el pago a la brevedad.');
  });

  it('formats the total with the CONFIG currency, not a hardcoded one', () => {
    const us = { currencySymbol: 'USD', currencyLocale: 'en-US' };
    const msg = buildCollectionMessage('Ana', [{ type: 'credit', amount: 1234.5, dueDate: '2026-08-15' }], us);
    expect(msg).toContain('USD1,234.50');
  });

  it('adds the due date clause with the configured locale', () => {
    const msg = buildCollectionMessage('Ana', [{ type: 'credit', amount: 500, dueDate: '2026-08-15' }], AR);
    expect(msg).toContain('vencimiento el 15/08/2026');
  });

  it('sums multiple items into the total owed', () => {
    const msg = buildCollectionMessage('Ana', [
      { type: 'apartado', amount: 100, dueDate: '2026-08-15' },
      { type: 'credit', amount: 250, dueDate: '2026-08-15' },
    ], AR);
    expect(msg).toContain('$350,00');
  });

  it('lists multiple distinct due dates joined with "y"', () => {
    const msg = buildCollectionMessage('Ana', [
      { type: 'apartado', amount: 100, dueDate: '2026-08-15' },
      { type: 'credit', amount: 250, dueDate: '2026-09-02' },
    ], AR);
    expect(msg).toContain('vencimientos el 15/08/2026 y el 02/09/2026');
  });

  it('omits the due date clause entirely when no item has a dueDate', () => {
    const msg = buildCollectionMessage('Ana', [{ type: 'credit', amount: 500, dueDate: null }], AR);
    expect(msg).not.toContain('vencimiento');
    expect(msg).toContain('$500,00');
  });

  it('deduplicates items due on the same day', () => {
    const msg = buildCollectionMessage('Ana', [
      { type: 'apartado', amount: 100, dueDate: '2026-08-15' },
      { type: 'credit', amount: 250, dueDate: '2026-08-15' },
      { type: 'credit', amount: 50, dueDate: '2026-09-01' },
    ], AR);
    expect(msg).toContain('vencimientos el 15/08/2026 y el 01/09/2026');
  });
});

describe('buildWaLink (wa.me deep link)', () => {
  it('normalizes the phone to digits (drops +, spaces, dashes)', () => {
    expect(buildWaLink('+54 9 11 5555-1234', 'hola')).toBe(
      'https://wa.me/5491155551234?text=hola'
    );
  });

  it('URL-encodes the prefilled message', () => {
    const link = buildWaLink('1155551234', 'Hola Ana, saldo $1.200,00. ¡Gracias!');
    expect(link).toBe(
      'https://wa.me/1155551234?text=Hola%20Ana%2C%20saldo%20%241.200%2C00.%20%C2%A1Gracias!'
    );
  });

  it('returns null when the phone is missing or blank (phone-required guard)', () => {
    expect(buildWaLink(null, 'hola')).toBeNull();
    expect(buildWaLink(undefined, 'hola')).toBeNull();
    expect(buildWaLink('   ', 'hola')).toBeNull();
    expect(buildWaLink('', 'hola')).toBeNull();
  });

  it('returns null for a phone with no digits at all', () => {
    expect(buildWaLink('(///)', 'hola')).toBeNull();
  });
});

describe('hasPhone (phone-present predicate)', () => {
  it('is true only for non-blank string phones', () => {
    expect(hasPhone('+54 11 5555-1234')).toBe(true);
    expect(hasPhone(' ')).toBe(false);
    expect(hasPhone('')).toBe(false);
    expect(hasPhone(null)).toBe(false);
    expect(hasPhone(undefined)).toBe(false);
  });
});

describe('PHONE_REQUIRED_TEXT (spec "phone required" indicator)', () => {
  it('is a neutral Spanish phrase', () => {
    expect(PHONE_REQUIRED_TEXT).toMatch('teléfono');
  });
});