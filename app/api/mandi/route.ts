import { NextRequest, NextResponse } from 'next/server';
import { getMandiPrices, getMandiComparison } from '@/lib/mandi/agmarknet';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const district = searchParams.get('district') || undefined;
  const commodity = searchParams.get('commodity') || undefined;
  const compare = searchParams.get('compare') === 'true';

  try {
    if (compare) {
      const comparison = getMandiComparison(commodity || 'Soybean', district || 'Sehore');
      return NextResponse.json({
        comparison,
        commodity: commodity || 'Soybean',
        district: district || 'Sehore',
      });
    }

    const result = await getMandiPrices({ district, commodity });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve mandi records', details: String(error) },
      { status: 500 }
    );
  }
}
