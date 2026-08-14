// Unit tests for the collections due-view API client (task 6.5). Covers the
// request contract with fetch stubbed and the pure grouping helpers used by
// CollectionsPage (overdue split + type badge labels).
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  collectionTypeLabel,
  getCollectionsDue,
  groupDueCustomers,
} from './collections';

const ok = (body) => ({ ok: true, status: 200, json: async () => body });
const fail = (status, body) => ({ ok: false, status, json: async () => body });

afterEach(() => vi.unstubAllGlobals());

describe('getCollectionsDue', () => {
  it('requests /api/collections/due with the horizonDays parameter', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ customers: [] }));
    vi.stubGlobal('fetch', fetchMock);
    await getCollectionsDue(30);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/collections/due?horizonDays=30',
      expect.anything()
    );
  });

  it('defaults to a horizon of 7 days', async () => {
    const fetchMock = vi.fn().mockResolvedValue(ok({ customers: [] }));
    vi.stubGlobal('fetch', fetchMock);
    await getCollectionsDue();
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/collections/due?horizonDays=7',
      expect.anything()
    );
  });

  it('returns the customers array from the payload', async () => {
    const customers = [
      { customerId: 'c1', name: 'Ana', phone: '11', totalOpen: 100, items: [], overdue: false },
    ];
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(ok({ customers })));
    await expect(getCollectionsDue(7)).resolves.toEqual(customers);
  });

  it('surfaces the server validation error for a bad horizon verbatim', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        fail(400, { error: 'horizonDays must be a non-negative integer' })
      )
    );
    await expect(getCollectionsDue(-1)).rejects.toThrow(
      'horizonDays must be a non-negative integer'
    );
  });
});

describe('collectionTypeLabel (badge labels)', () => {
  it('maps apartado and credit to neutral Spanish labels', () => {
    expect(collectionTypeLabel('apartado')).toBe('Apartado');
    expect(collectionTypeLabel('credit')).toBe('Crédito');
  });

  it('falls back to the raw type for unknown values', () => {
    expect(collectionTypeLabel('other')).toBe('other');
    expect(collectionTypeLabel(undefined)).toBe(undefined);
  });
});

describe('groupDueCustomers (overdue split)', () => {
  const customer = (id, overdue) => ({ customerId: id, name: id, overdue });

  it('splits customers into overdue and upcoming groups', () => {
    const { overdue, upcoming } = groupDueCustomers([
      customer('a', true),
      customer('b', false),
      customer('c', true),
    ]);
    expect(overdue.map((c) => c.customerId)).toEqual(['a', 'c']);
    expect(upcoming.map((c) => c.customerId)).toEqual(['b']);
  });

  it('keeps relative order inside each group', () => {
    const { overdue, upcoming } = groupDueCustomers([
      customer('x', false),
      customer('y', true),
      customer('z', false),
    ]);
    expect(upcoming.map((c) => c.customerId)).toEqual(['x', 'z']);
    expect(overdue.map((c) => c.customerId)).toEqual(['y']);
  });

  it('is defensive against a missing customers array', () => {
    expect(groupDueCustomers(undefined)).toEqual({ overdue: [], upcoming: [] });
    expect(groupDueCustomers(null)).toEqual({ overdue: [], upcoming: [] });
  });
});