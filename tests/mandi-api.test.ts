import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getMandiPrices, getMandiComparison } from '../lib/mandi/agmarknet';

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

    const sehoreSoybean = await getMandiPrices({ district: 'Sehore', commodity: 'Soybean' });
    expect(sehoreSoybean.records.every((r) => r.district.toLowerCase() === 'sehore')).toBe(true);

    const indoreGarlic = await getMandiPrices({ district: 'Indore', commodity: 'Garlic' });
    expect(indoreGarlic.records.some((r) => r.commodity.toLowerCase().includes('garlic'))).toBe(true);
  });

  it('calculates mandi distance and transport cost deduction in getMandiComparison', () => {
    const comparison = getMandiComparison('Soybean', 'Sehore');

    expect(comparison.length).toBeGreaterThan(0);
    const topOption = comparison[0];

    expect(topOption).toHaveProperty('modalPrice');
    expect(topOption).toHaveProperty('distanceKm');
    expect(topOption).toHaveProperty('estimatedTransportPerQ');
    expect(topOption).toHaveProperty('netRealizedPerQ');

    // Net realized price must equal modal price minus transport cost
    expect(topOption.netRealizedPerQ).toBe(
      topOption.modalPrice - topOption.estimatedTransportPerQ
    );
  });

  it('gracefully handles timeout or fetch exceptions by returning benchmark data', async () => {
    process.env.DATA_GOV_IN_API_KEY = 'mock-key-for-test';

    // Mock global fetch to simulate a timeout or network rejection
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockRejectedValue(new Error('Network timeout after 8000ms'));

    try {
      const result = await getMandiPrices({ district: 'Sehore', commodity: 'Soybean' });
      expect(result.apiKeyConfigured).toBe(true);
      expect(result.status).toBe('api_error');
      expect(result.isLive).toBe(false);
      expect(result.records.length).toBeGreaterThan(0);
    } finally {
      global.fetch = originalFetch;
    }
  });
});
