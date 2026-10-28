import { NextRequest, NextResponse } from 'next/server';
import { fetchDistrictWeather } from '@/lib/weather/open-meteo';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const district = searchParams.get('district') || 'Sehore';
  const cropsParam = searchParams.get('crops') || 'Soybean,Wheat';
  const activeCrops = cropsParam.split(',').map((c) => c.trim());

  try {
    const weatherData = await fetchDistrictWeather(district, activeCrops);
    return NextResponse.json(weatherData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve weather observations', details: String(error) },
      { status: 500 }
    );
  }
}
