// Cloudflare Pages Function for /api/weather
// Zero-cost serverless endpoint on Cloudflare Pages edge

export async function onRequestGet(context: { request: Request; env: Record<string, string> }) {
  const url = new URL(context.request.url);
  const district = url.searchParams.get('district') || 'Sehore';
  const latParam = url.searchParams.get('lat');
  const lonParam = url.searchParams.get('lon');

  const MP_COORDS: Record<string, { lat: number; lon: number }> = {
    Sehore: { lat: 23.2033, lon: 77.0844 },
    Bhopal: { lat: 23.2599, lon: 77.4126 },
    Indore: { lat: 22.7196, lon: 75.8577 },
    Ujjain: { lat: 23.1765, lon: 75.7885 },
    Vidisha: { lat: 23.5251, lon: 77.8081 },
    Hoshangabad: { lat: 22.7519, lon: 77.7289 },
    Jabalpur: { lat: 23.1815, lon: 79.9864 },
    Sagar: { lat: 23.8388, lon: 78.7378 },
  };

  const coords =
    latParam && lonParam
      ? { lat: parseFloat(latParam), lon: parseFloat(lonParam) }
      : MP_COORDS[district] || MP_COORDS['Sehore'];

  try {
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=Asia%2FKolkata`;

    const res = await fetch(apiUrl, { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const json = await res.json();
      return new Response(
        JSON.stringify({
          district,
          state: 'Madhya Pradesh',
          latitude: coords.lat,
          longitude: coords.lon,
          retrievedAt: new Date().toISOString(),
          isLive: true,
          source: 'Open-Meteo Meteorological API (Open Data)',
          current: {
            temp: Math.round(json.current?.temperature_2m ?? 28),
            apparentTemp: Math.round(json.current?.apparent_temperature ?? 28),
            relativeHumidity: json.current?.relative_humidity_2m ?? 60,
            windSpeedKmh: Math.round(json.current?.wind_speed_10m ?? 10),
            weatherCode: json.current?.weather_code ?? 0,
            weatherDescription: 'Clear / Partly Cloudy',
            precipitationMm: json.current?.precipitation ?? 0,
          },
          daily: (json.daily?.time || []).map((t: string, idx: number) => ({
            date: t,
            tempMax: json.daily.temperature_2m_max[idx] ?? 30,
            tempMin: json.daily.temperature_2m_min[idx] ?? 18,
            precipitationMm: json.daily.precipitation_sum[idx] ?? 0,
            precipitationProbability: json.daily.precipitation_probability_max?.[idx] ?? 0,
            maxWindSpeedKmh: json.daily.wind_speed_10m_max[idx] ?? 12,
            relativeHumidityAvg: 60,
            weatherCode: json.daily.weather_code[idx] ?? 0,
            weatherDescription: 'Normal',
            iconName: 'Sun',
          })),
          cropRisks: [],
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch {
    // Fallback
  }

  return new Response(
    JSON.stringify({
      district,
      state: 'Madhya Pradesh',
      latitude: coords.lat,
      longitude: coords.lon,
      retrievedAt: new Date().toISOString(),
      isLive: false,
      source: 'Demonstration Cache / Offline Fallback',
      current: {
        temp: 29,
        apparentTemp: 30,
        relativeHumidity: 58,
        windSpeedKmh: 14,
        weatherCode: 1,
        weatherDescription: 'Mainly Clear',
        precipitationMm: 0,
      },
      daily: [],
      cropRisks: [],
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}
