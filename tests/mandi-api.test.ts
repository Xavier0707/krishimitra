import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getMandiPrices,
  getMandiComparison,
  parsePrice,
  normalizeArrivalDate,
} from '../lib/mandi/agmarknet';

describe('Price Parsing & Unit Normalization', () => {
  it('correctly distinguishes between missing prices and real price of zero', () => {
    // Missing / NA values must return null, never 0
    expect(parsePrice(null)).toBeNull();
    expect(parsePrice(undefined)).toBeNull();
    expect(parsePrice('')).toBeNull();
    expect(parsePrice('NA')).toBeNull();
    expect(parsePrice('N/A')).toBeNull();
    expect(parsePrice('-')).toBeNull();

    // Valid positive prices
    expect(parsePrice('4680')).toBe(4680);
    expect(parsePrice('4680.50')).toBe(4680.5);
    expect(parsePrice(5200)).toBe(5200);

    // Real price of 0 must be preserved as 0, not converted to null
    expect(parsePrice('0')).toBe(0);
    expect(parsePrice(0)).toBe(0);
  });

  it('preserves reported observation date format', () => {
    expect(normalizeArrivalDate('28/10/2026')).toBe('28/10/2026');
    expect(normalizeArrivalDate('2026-10-28')).toBe('2026-10-28');
  });
});

describe('Mandi API & Integration Resilience', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('safely handles missing DATA_GOV_IN_API_KEY with benchmark fallback and clear status', async () => {
    delete process.env.DATA_GOV_IN_API_KEY;
    delete process.env.VITE_DATA_GOV_API_KEY;

    const result = await getMandiPrices({ district: 'Sehore', commodity: 'Soybean' });

    expect(result.apiKeyConfigured).toBe(false);
    expect(result.isLive).toBe(false);
    expect(result.status).toBe('api_key_missing');
    expect(result.statusMessageHi).toContain('data.gov.in एपीआई कुंजी अनुपलब्ध');
    expect(result.records.length).toBeGreaterThan(0);
    expect(result.records[0].state).toBe('Madhya Pradesh');
    expect(result.records[0].commodity).toContain('Soybean');
  });

  it('filters benchmark records correctly by district and commodity', async () => {
    delete process.env.DATA_GOV_IN_API_KEY;
    delete process.env.VITE_DATA_GOV_API_KEY;

    const sehoreSoybean = await getMandiPrices({ district: 'Sehore', commodity: 'Soybean' });
    expect(sehoreSoybean.records.every((r) => r.district.toLowerCase() === 'sehore')).toBe(true);

    const indoreGarlic = await getMandiPrices({ district: 'Indore', commodity: 'Garlic' });
    expect(indoreGarlic.records.some((r) => r.commodity.toLowerCase().includes('garlic'))).toBe(true);
  });

  it('normalizes live government API response fields accurately when API responds with 200', async () => {
    process.env.DATA_GOV_IN_API_KEY = 'mock-valid-key-for-test-suite';

    const mockGovResponse = {
      index_name: 'agmarknet',
      title: 'Current Daily Price of Various Commodities',
      total: 1,
      count: 1,
      limit: '20',
      offset: '0',
      records: [
        {
          state: 'Madhya Pradesh',
          district: 'Sehore',
          market: 'Sehore',
          commodity: 'Soyabean',
          variety: 'Yellow',
          grade: 'FAQ',
          arrival_date: '28/10/2026',
          min_price: '4350',
          max_price: '4850',
          modal_price: '4680',
        },
      ],
    };

    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockGovResponse,
    } as unknown as Response);

    try {
      const result = await getMandiPrices({ district: 'Sehore', commodity: 'Soyabean' });

      expect(result.isLive).toBe(true);
      expect(result.apiKeyConfigured).toBe(true);
      expect(result.status).toBe('live_synced');
      expect(result.records.length).toBe(1);

      const record = result.records[0];
      expect(record.state).toBe('Madhya Pradesh');
      expect(record.district).toBe('Sehore');
      expect(record.marketName).toBe('Sehore');
      expect(record.commodity).toBe('Soyabean');
      expect(record.variety).toBe('Yellow');
      expect(record.grade).toBe('FAQ');
      expect(record.arrivalDate).toBe('28/10/2026');
      expect(record.minPrice).toBe(4350);
      expect(record.maxPrice).toBe(4850);
      expect(record.modalPrice).toBe(4680);
      expect(record.unit).toBe('₹/Quintal');
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('returns genuine empty state when official API returns 0 records without fabricating fake data', async () => {
    process.env.DATA_GOV_IN_API_KEY = 'mock-valid-key-for-test-suite';

    const mockEmptyResponse = {
      total: 0,
      count: 0,
      records: [],
    };

    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockEmptyResponse,
    } as unknown as Response);

    try {
      const result = await getMandiPrices({ district: 'NonExistentDistrict', commodity: 'DragonFruit' });

      expect(result.isLive).toBe(true);
      expect(result.apiKeyConfigured).toBe(true);
      expect(result.status).toBe('empty_results');
      expect(result.records.length).toBe(0);
      expect(result.total).toBe(0);
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('correctly handles authentication rejection (HTTP 401/403) from data.gov.in', async () => {
    process.env.DATA_GOV_IN_API_KEY = 'invalid-rejected-key';

    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      json: async () => ({ error: 'Invalid API Key' }),
    } as unknown as Response);

    try {
      const result = await getMandiPrices({ district: 'Sehore', commodity: 'Soybean' });

      expect(result.apiKeyConfigured).toBe(true);
      expect(result.isLive).toBe(false);
      expect(result.status).toBe('auth_error');
      expect(result.statusMessageEn).toContain('authentication rejected (HTTP 401)');
      expect(result.records.length).toBe(0);
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('gracefully handles timeout after 8000ms by returning network_error state', async () => {
    process.env.DATA_GOV_IN_API_KEY = 'mock-key-for-test';

    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockRejectedValue(new Error('Network timeout after 8000ms'));

    try {
      const result = await getMandiPrices({ district: 'Sehore', commodity: 'Soybean' });
      expect(result.apiKeyConfigured).toBe(true);
      expect(result.status).toBe('network_error');
      expect(result.isLive).toBe(false);
      expect(result.records.length).toBe(0);
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('calculates mandi distance and transport cost deduction in getMandiComparison', () => {
    const comparison = getMandiComparison('Soybean', 'Sehore');

    expect(comparison.length).toBeGreaterThan(0);
    const topOption = comparison[0];

    expect(topOption).toHaveProperty('modalPrice');
    expect(topOption).toHaveProperty('distanceKm');
    expect(topOption).toHaveProperty('estimatedTransportPerQ');
    expect(topOption).toHaveProperty('netRealizedPerQ');

    const expectedModal = topOption.modalPrice ?? 0;
    expect(topOption.netRealizedPerQ).toBe(
      expectedModal - topOption.estimatedTransportPerQ
    );
  });
});
