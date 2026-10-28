import { NextRequest, NextResponse } from 'next/server';
import { fetchDistrictWeather } from '@/lib/weather/open-meteo';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const district = searchParams.get('district') || 'Sehore';
  const latParam = searchParams.get('lat');
  const lonParam = searchParams.get('lon');
  const cropsParam = searchParams.get('crops') || 'Soybean,Wheat';
  const activeCrops = cropsParam.split(',').map((c) => c.trim());

  let customCoords: { latitude: number; longitude: number; label?: string } | undefined;
  if (latParam && lonParam) {
    const lat = parseFloat(latParam);
    const lon = parseFloat(lonParam);
    if (!isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      customCoords = {
        latitude: lat,
        longitude: lon,
        label: searchParams.get('label') || 'GPS Farm Location',
      };
    }
  }

  try {
    const weatherData = await fetchDistrictWeather(district, activeCrops, customCoords);
    return NextResponse.json(weatherData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve weather observations', details: String(error) },
      { status: 500 }
    );
  }
}
