import { MandiPriceRecord } from '../types';
import { BENCHMARK_MP_MANDI_PRICES, MP_MANDIS } from './mp-mandis-data';

export interface MandiFilterParams {
  state?: string;
  district?: string;
  commodity?: string;
  marketName?: string;
}

export interface MandiApiResponse {
  records: MandiPriceRecord[];
  isLive: boolean;
  apiKeyConfigured: boolean;
  status: 'live_synced' | 'api_key_missing' | 'api_error' | 'benchmark_demo';
  statusMessageEn: string;
  statusMessageHi: string;
  dataSource: string;
  retrievedAt: string;
}

/**
 * Fetch Mandi Prices: connects to data.gov.in / Agmarknet API if configured,
 * or returns validated benchmark datasets for MP Mandis.
 */
export async function getMandiPrices(filters: MandiFilterParams = {}): Promise<MandiApiResponse> {
  const apiKey = process.env.DATA_GOV_IN_API_KEY;
  const hasApiKey = Boolean(apiKey && apiKey.trim().length > 5);

  if (hasApiKey) {
    try {
      // data.gov.in Agmarknet official daily market price dataset
      let url = `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${encodeURIComponent(
        apiKey!.trim()
      )}&format=json&limit=50&filters[state]=Madhya%20Pradesh`;

      if (filters.district && filters.district !== 'All') {
        url += `&filters[district]=${encodeURIComponent(filters.district)}`;
      }
      if (filters.commodity && filters.commodity !== 'All') {
        url += `&filters[commodity]=${encodeURIComponent(filters.commodity)}`;
      }

      // Safe 8-second timeout for government open data API
      const res = await fetch(url, {
        signal: AbortSignal.timeout(8000),
        next: { revalidate: 3600 },
      });

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
            dataSource: 'Official data.gov.in / Agmarknet Daily Feed',
            isLive: true,
            retrievedAt: new Date().toISOString(),
          }));

          return {
            records: liveRecords,
            isLive: true,
            apiKeyConfigured: true,
            status: 'live_synced',
            statusMessageEn: 'Live Agmarknet market observations loaded successfully.',
            statusMessageHi: 'एगमार्कनेट दैनिक बाजार भाव सफलतापूर्वक लोड किए गए।',
            dataSource: 'data.gov.in / Agmarknet Official Daily Dataset',
            retrievedAt: new Date().toISOString(),
          };
        }
      }
    } catch {
      // Network timeout, rate limit, or invalid key fallback
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
    apiKeyConfigured: hasApiKey,
    status: hasApiKey ? 'api_error' : 'api_key_missing',
    statusMessageEn: hasApiKey
      ? 'Agmarknet API timeout; displaying verified Central MP benchmark quotes.'
      : 'Official data.gov.in API key is not configured. Displaying verified Central MP benchmark quotes for testing and calculation.',
    statusMessageHi: hasApiKey
      ? 'एगमार्कनेट एपीआई प्रतिक्रिया समय समाप्त; केंद्रीय म.प्र. बेंचमार्क भाव प्रदर्शित।'
      : 'data.gov.in एपीआई कुंजी अनुपलब्ध है। गणना एवं परीक्षण हेतु सत्यापित केंद्रीय म.प्र. बेंचमार्क भाव प्रदर्शित किए जा रहे हैं।',
    dataSource: 'MP Mandi Board & Agmarknet Benchmark Feed (Demonstration Cache)',
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
