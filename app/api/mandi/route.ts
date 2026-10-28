import { NextRequest, NextResponse } from 'next/server';
import { getMandiPrices, getMandiComparison } from '@/lib/mandi/agmarknet';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const state = searchParams.get('state') || 'Madhya Pradesh';
  const district = searchParams.get('district') || undefined;
  const commodity = searchParams.get('commodity') || undefined;
  const marketName = searchParams.get('market') || undefined;
  const search = searchParams.get('search') || undefined;
  const limitParam = searchParams.get('limit');
  const offsetParam = searchParams.get('offset');
  const compare = searchParams.get('compare') === 'true';

  const limit = limitParam ? Math.max(1, Math.min(100, parseInt(limitParam, 10) || 20)) : 20;
  const offset = offsetParam ? Math.max(0, parseInt(offsetParam, 10) || 0) : 0;

  try {
    if (compare) {
      const comparison = getMandiComparison(commodity || 'Soybean', district || 'Sehore');
      return NextResponse.json({
        comparison,
        commodity: commodity || 'Soybean',
        district: district || 'Sehore',
      });
    }

    const result = await getMandiPrices({
      state,
      district,
      commodity,
      marketName,
      search,
      limit,
      offset,
    });

    const statusCode =
      result.status === 'auth_error'
        ? 401
        : result.status === 'rate_limited'
        ? 429
        : result.status === 'network_error'
        ? 504
        : 200;

    return NextResponse.json(result, {
      status: statusCode,
      headers: {
        'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to retrieve mandi records from government open data endpoint',
        details: error instanceof Error ? error.message : 'Unknown upstream error',
      },
      { status: 500 }
    );
  }
}
