import { MandiPriceRecord } from '../types';
import { BENCHMARK_MP_MANDI_PRICES, MP_MANDIS } from './mp-mandis-data';

export interface MandiFilterParams {
  state?: string;
  district?: string;
  commodity?: string;
  marketName?: string;
}

/**
 * Fetch Mandi Prices: connects to data.gov.in / Agmarknet API if configured,
 * or returns validated benchmark datasets for MP Mandis.
 */
export async function getMandiPrices(filters: MandiFilterParams = {}): Promise<{
  records: MandiPriceRecord[];
  isLive: boolean;
  dataSource: string;
  retrievedAt: string;
}> {
  const apiKey = process.env.DATA_GOV_IN_API_KEY;

  if (apiKey && apiKey.trim().length > 5) {
    try {
      // data.gov.in Agmarknet endpoint
      let url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${encodeURIComponent(
        apiKey
      )}&format=json&limit=50&filters[state]=Madhya%20Pradesh`;

      if (filters.district) {
        url += `&filters[district]=${encodeURIComponent(filters.district)}`;
      }
      if (filters.commodity) {
        url += `&filters[commodity]=${encodeURIComponent(filters.commodity)}`;
      }

      const res = await fetch(url, { next: { revalidate: 3600 } });
      if (res.ok) {
        const json = await res.json();
        if (json.records && Array.isArray(json.records) && json.records.length > 0) {
          const liveRecords: MandiPriceRecord[] = json.records.map((r: Record<string, string>, idx: number) => ({
            id: `live-${idx}`,
            state: r.state || 'Madhya Pradesh',
            district: r.district || 'MP',
            marketName: r.market || 'APMC Mandi',
            commodity: r.commodity || filters.commodity || 'Produce',
            variety: r.variety || 'Common',
            arrivalDate: r.arrival_date || new Date().toISOString().split('T')[0],
            minPrice: parseFloat(r.min_price) || 0,
            maxPrice: parseFloat(r.max_price) || 0,
            modalPrice: parseFloat(r.modal_price) || 0,
            dataSource: 'Official data.gov.in / Agmarknet Live Feed',
            isLive: true,
            retrievedAt: new Date().toISOString(),
          }));

          return {
            records: liveRecords,
            isLive: true,
            dataSource: 'data.gov.in / Agmarknet Live API Feed',
            retrievedAt: new Date().toISOString(),
          };
        }
      }
    } catch {
      // Fallback gracefully on network timeout or API quota limit
    }
  }

  // Filter benchmark dataset
  let filtered = [...BENCHMARK_MP_MANDI_PRICES];

  if (filters.district && filters.district !== 'All') {
    filtered = filtered.filter(
      (m) => m.district.toLowerCase() === filters.district?.toLowerCase()
    );
  }

  if (filters.commodity && filters.commodity !== 'All') {
    filtered = filtered.filter((m) =>
      m.commodity.toLowerCase().includes((filters.commodity || '').toLowerCase())
    );
  }

  if (filters.marketName && filters.marketName !== 'All') {
    filtered = filtered.filter((m) =>
      m.marketName.toLowerCase().includes((filters.marketName || '').toLowerCase())
    );
  }

  return {
    records: filtered,
    isLive: false,
    dataSource: 'Agmarknet / MP Mandi Board Benchmark Feed (Validated Cache)',
    retrievedAt: new Date().toISOString(),
  };
}

/**
 * Compare Mandis within reasonable travel distance for the farmer
 */
export function getMandiComparison(
  commodity: string = 'Soybean',
  farmerDistrict: string = 'Sehore'
) {
  const records = BENCHMARK_MP_MANDI_PRICES.filter((m) =>
    m.commodity.toLowerCase().includes(commodity.toLowerCase())
  );

  return records.map((record) => {
    const marketInfo = MP_MANDIS.find((m) => m.name === record.marketName);
    const distanceKm = marketInfo ? marketInfo.distanceKmFromSehore : 50;
    // Estimate transport cost: approx ₹3.5 per km per quintal on tractor trolley
    const estimatedTransportPerQ = Math.round(distanceKm * 3.5);
    const netRealizedPerQ = record.modalPrice - estimatedTransportPerQ;

    return {
      ...record,
      distanceKm,
      estimatedTransportPerQ,
      netRealizedPerQ,
      isHomeDistrict: record.district.toLowerCase() === farmerDistrict.toLowerCase(),
    };
  }).sort((a, b) => b.netRealizedPerQ - a.netRealizedPerQ);
}
