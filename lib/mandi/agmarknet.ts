import { MandiPriceRecord } from '../types';
import { BENCHMARK_MP_MANDI_PRICES, MP_MANDIS } from './mp-mandis-data';

export interface MandiFilterParams {
  state?: string;
  district?: string;
  commodity?: string;
  marketName?: string;
  search?: string;
  limit?: number;
  offset?: number;
  allowDemoFallback?: boolean;
}

export interface MandiApiResponse {
  records: MandiPriceRecord[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  isLive: boolean;
  apiKeyConfigured: boolean;
  status:
    | 'live_synced'
    | 'empty_results'
    | 'api_key_missing'
    | 'auth_error'
    | 'rate_limited'
    | 'network_error'
    | 'benchmark_demo';
  statusMessageEn: string;
  statusMessageHi: string;
  dataSource: string;
  retrievedAt: string;
  officialDatasetUrl: string;
  statutoryWarningHi: string;
  statutoryWarningEn: string;
}

export const DATA_GOV_IN_RESOURCE_URL =
  'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

// In-memory cache to respect rate limits and speed up identical requests (15-minute TTL)
interface CacheEntry {
  data: MandiApiResponse;
  expiresAt: number;
}
const responseCache = new Map<string, CacheEntry>();

/**
 * Safely parse numeric prices while preserving null for missing/unreported fields.
 * Never converts missing or empty values to 0.
 */
export function parsePrice(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  const str = String(val).trim();
  if (str === '' || str.toUpperCase() === 'NA' || str.toUpperCase() === 'N/A' || str === '-') {
    return null;
  }
  const num = parseFloat(str);
  return isNaN(num) ? null : num;
}

/**
 * Normalize reported observation date from data.gov.in
 */
export function normalizeArrivalDate(rawDate: unknown): string {
  if (!rawDate) return new Date().toISOString().split('T')[0];
  return String(rawDate).trim();
}

/**
 * Fetch Mandi Prices from data.gov.in official Agmarknet resource endpoint.
 * Full pagination, filtering, input validation, and secure server-side execution.
 */
export async function getMandiPrices(filters: MandiFilterParams = {}): Promise<MandiApiResponse> {
  const limit = Math.max(1, Math.min(100, Number(filters.limit) || 20));
  const offset = Math.max(0, Number(filters.offset) || 0);
  const state = filters.state?.trim() || 'Madhya Pradesh';
  const district = filters.district?.trim();
  const commodity = filters.commodity?.trim();
  const marketName = filters.marketName?.trim();
  const search = filters.search?.trim();

  // Read server-side key safely (support preferred DATA_GOV_IN_API_KEY with VITE_ fallback migration)
  const apiKey = (
    process.env.DATA_GOV_IN_API_KEY ||
    process.env.VITE_DATA_GOV_API_KEY ||
    ''
  ).trim();

  const hasApiKey = apiKey.length > 5;

  const cacheKey = JSON.stringify({ state, district, commodity, marketName, search, limit, offset, hasApiKey });
  const cached = responseCache.get(cacheKey);
  if (cached && Date.now() < cached.expiresAt) {
    return cached.data;
  }

  const statutoryWarningHi =
    'यह भाव भारत सरकार के दैनिक एगमार्कनेट पोर्टल पर दर्ज किए गए हैं। वास्तविक बोली फसल की नमी, चमक व मंडी नीलामी के आधार पर भिन्न हो सकती है।';
  const statutoryWarningEn =
    'Reported prices reflect official APMC market closure observations. Realized prices vary based on produce moisture, quality grades, and daily auction bids.';

  // If API key is configured, call official Government of India endpoint
  if (hasApiKey) {
    try {
      let url = `${DATA_GOV_IN_RESOURCE_URL}?api-key=${encodeURIComponent(
        apiKey
      )}&format=json&limit=${limit}&offset=${offset}`;

      if (state && state !== 'All') {
        url += `&filters[state]=${encodeURIComponent(state)}`;
      }
      if (district && district !== 'All') {
        url += `&filters[district]=${encodeURIComponent(district)}`;
      }
      if (commodity && commodity !== 'All') {
        url += `&filters[commodity]=${encodeURIComponent(commodity)}`;
      }
      if (marketName && marketName !== 'All') {
        url += `&filters[market]=${encodeURIComponent(marketName)}`;
      }

      // Execute request with strict 8-second timeout
      const res = await fetch(url, {
        signal: AbortSignal.timeout(8000),
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          return {
            records: [],
            total: 0,
            limit,
            offset,
            hasMore: false,
            isLive: false,
            apiKeyConfigured: true,
            status: 'auth_error',
            statusMessageEn: `data.gov.in authentication rejected (HTTP ${res.status}). Please check your API key validity.`,
            statusMessageHi: `data.gov.in द्वारा प्रमाणीकरण अस्वीकृत (HTTP ${res.status})। कृपया अपनी एपीआई कुंजी की जांच करें।`,
            dataSource: 'Official data.gov.in / Agmarknet Portal',
            retrievedAt: new Date().toISOString(),
            officialDatasetUrl: DATA_GOV_IN_RESOURCE_URL,
            statutoryWarningHi,
            statutoryWarningEn,
          };
        }

        if (res.status === 429) {
          return {
            records: [],
            total: 0,
            limit,
            offset,
            hasMore: false,
            isLive: false,
            apiKeyConfigured: true,
            status: 'rate_limited',
            statusMessageEn: 'data.gov.in request rate limit reached. Please wait and try again.',
            statusMessageHi: 'data.gov.in अनुरोध सीमा पूर्ण। कृपया कुछ देर प्रतीक्षा करें।',
            dataSource: 'Official data.gov.in / Agmarknet Portal',
            retrievedAt: new Date().toISOString(),
            officialDatasetUrl: DATA_GOV_IN_RESOURCE_URL,
            statutoryWarningHi,
            statutoryWarningEn,
          };
        }

        throw new Error(`Upstream returned HTTP ${res.status}`);
      }

      const json = await res.json();
      const rawRecords: Array<Record<string, unknown>> = Array.isArray(json.records)
        ? json.records
        : [];
      const totalCount = Number(json.total) || rawRecords.length;

      // Filter client search query if supplied
      let filteredRaw = rawRecords;
      if (search && search.length > 0) {
        const s = search.toLowerCase();
        filteredRaw = filteredRaw.filter(
          (r) =>
            String(r.market || '').toLowerCase().includes(s) ||
            String(r.commodity || '').toLowerCase().includes(s) ||
            String(r.district || '').toLowerCase().includes(s) ||
            String(r.variety || '').toLowerCase().includes(s)
        );
      }

      const normalizedRecords: MandiPriceRecord[] = filteredRaw.map((r, idx) => ({
        id: `gov-${offset + idx}-${String(r.market || 'mandi')}-${String(r.commodity || 'comm')}`,
        state: String(r.state || state || 'Madhya Pradesh'),
        district: String(r.district || 'District'),
        marketName: String(r.market || 'APMC Mandi'),
        commodity: String(r.commodity || commodity || 'Produce'),
        variety: String(r.variety || 'Common'),
        grade: r.grade ? String(r.grade) : undefined,
        arrivalDate: normalizeArrivalDate(r.arrival_date),
        minPrice: parsePrice(r.min_price),
        maxPrice: parsePrice(r.max_price),
        modalPrice: parsePrice(r.modal_price),
        unit: '₹/Quintal',
        dataSource: 'data.gov.in / Agmarknet Official Daily Feed',
        isLive: true,
        retrievedAt: new Date().toISOString(),
      }));

      const apiResult: MandiApiResponse = {
        records: normalizedRecords,
        total: totalCount,
        limit,
        offset,
        hasMore: offset + normalizedRecords.length < totalCount,
        isLive: true,
        apiKeyConfigured: true,
        status: normalizedRecords.length > 0 ? 'live_synced' : 'empty_results',
        statusMessageEn:
          normalizedRecords.length > 0
            ? `Successfully loaded ${normalizedRecords.length} live records from data.gov.in.`
            : 'No matching market arrivals reported for the selected filters.',
        statusMessageHi:
          normalizedRecords.length > 0
            ? `data.gov.in से ${normalizedRecords.length} आधिकारिक दैनिक मंडी भाव लोड किए गए।`
            : 'चयनित फिल्टर के लिए कोई दैनिक आवक रिकॉर्ड नहीं मिला।',
        dataSource: 'data.gov.in / Agmarknet Official Daily Dataset',
        retrievedAt: new Date().toISOString(),
        officialDatasetUrl: DATA_GOV_IN_RESOURCE_URL,
        statutoryWarningHi,
        statutoryWarningEn,
      };

      // Cache valid non-empty live results for 15 minutes; do not lock in empty results
      if (normalizedRecords.length > 0) {
        responseCache.set(cacheKey, { data: apiResult, expiresAt: Date.now() + 15 * 60 * 1000 });
      }
      return apiResult;
    } catch (err: unknown) {
      const isTimeout =
        err instanceof Error && (err.name === 'TimeoutError' || err.message.includes('timeout'));

      return {
        records: [],
        total: 0,
        limit,
        offset,
        hasMore: false,
        isLive: false,
        apiKeyConfigured: true,
        status: 'network_error',
        statusMessageEn: isTimeout
          ? 'data.gov.in server timed out after 8 seconds. Please retry.'
          : 'Failed to communicate with data.gov.in upstream server.',
        statusMessageHi: isTimeout
          ? 'data.gov.in सर्वर से 8 सेकंड में संपर्क नहीं हो सका। कृपया पुनः प्रयास करें।'
          : 'सरकारी पोर्टल से संपर्क करने में असमर्थ। कृपया इंटरनेट या सर्वर स्थिति जांचें।',
        dataSource: 'Official data.gov.in / Agmarknet Portal',
        retrievedAt: new Date().toISOString(),
        officialDatasetUrl: DATA_GOV_IN_RESOURCE_URL,
        statutoryWarningHi,
        statutoryWarningEn,
      };
    }
  }

  // Fallback behavior when API key is missing
  // Clearly labeled demonstration benchmark records for Central MP
  let filtered = [...BENCHMARK_MP_MANDI_PRICES];

  if (district && district !== 'All') {
    filtered = filtered.filter((m) => m.district.toLowerCase() === district.toLowerCase());
  }

  if (commodity && commodity !== 'All') {
    filtered = filtered.filter((m) =>
      m.commodity.toLowerCase().includes(commodity.toLowerCase())
    );
  }

  if (marketName && marketName !== 'All') {
    filtered = filtered.filter((m) =>
      m.marketName.toLowerCase().includes(marketName.toLowerCase())
    );
  }

  if (search && search.length > 0) {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (m) =>
        m.marketName.toLowerCase().includes(s) ||
        m.commodity.toLowerCase().includes(s) ||
        m.district.toLowerCase().includes(s)
    );
  }

  const pagedRecords = filtered.slice(offset, offset + limit);

  return {
    records: pagedRecords,
    total: filtered.length,
    limit,
    offset,
    hasMore: offset + pagedRecords.length < filtered.length,
    isLive: false,
    apiKeyConfigured: false,
    status: 'api_key_missing',
    statusMessageEn:
      'Official DATA_GOV_IN_API_KEY is not configured. Displaying verified Central MP benchmark quotes for offline calculator workflows.',
    statusMessageHi:
      'data.gov.in एपीआई कुंजी अनुपलब्ध है। कैलकुलेटर परीक्षण हेतु केंद्रीय म.प्र. के सत्यापित बेंचमार्क भाव प्रदर्शित किए जा रहे हैं।',
    dataSource: 'Central MP Mandi Board Benchmark Feed (Demonstration Cache)',
    retrievedAt: new Date().toISOString(),
    officialDatasetUrl: DATA_GOV_IN_RESOURCE_URL,
    statutoryWarningHi,
    statutoryWarningEn,
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

  return records
    .map((record) => {
      const marketInfo = MP_MANDIS.find((m) => m.name === record.marketName);
      const distanceKm = marketInfo ? marketInfo.distanceKmFromSehore : 50;
      // Estimate transport cost: approx ₹3.5 per km per quintal on tractor trolley
      const estimatedTransportPerQ = Math.round(distanceKm * 3.5);
      const modal = record.modalPrice ?? 0;
      const netRealizedPerQ = modal - estimatedTransportPerQ;

      return {
        ...record,
        distanceKm,
        estimatedTransportPerQ,
        netRealizedPerQ,
        isHomeDistrict: record.district.toLowerCase() === farmerDistrict.toLowerCase(),
      };
    })
    .sort((a, b) => b.netRealizedPerQ - a.netRealizedPerQ);
}
