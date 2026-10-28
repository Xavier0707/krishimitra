import { WeatherData, WeatherDayForecast, WeatherRiskAlert } from '../types';
import { evaluateCropWeatherRisks } from './weather-risks';

export interface DistrictLocation {
  district: string;
  state: string;
  latitude: number;
  longitude: number;
}

export const MP_DISTRICT_COORDINATES: Record<string, DistrictLocation> = {
  Sehore: { district: 'Sehore', state: 'Madhya Pradesh', latitude: 23.2033, longitude: 77.0844 },
  Bhopal: { district: 'Bhopal', state: 'Madhya Pradesh', latitude: 23.2599, longitude: 77.4126 },
  Indore: { district: 'Indore', state: 'Madhya Pradesh', latitude: 22.7196, longitude: 75.8577 },
  Ujjain: { district: 'Ujjain', state: 'Madhya Pradesh', latitude: 23.1765, longitude: 75.7885 },
  Vidisha: { district: 'Vidisha', state: 'Madhya Pradesh', latitude: 23.5251, longitude: 77.8081 },
  Hoshangabad: { district: 'Hoshangabad', state: 'Madhya Pradesh', latitude: 22.7519, longitude: 77.7289 },
  Jabalpur: { district: 'Jabalpur', state: 'Madhya Pradesh', latitude: 23.1815, longitude: 79.9864 },
  Sagar: { district: 'Sagar', state: 'Madhya Pradesh', latitude: 23.8388, longitude: 78.7378 },
  Dewas: { district: 'Dewas', state: 'Madhya Pradesh', latitude: 22.9676, longitude: 76.0534 },
  Gwalior: { district: 'Gwalior', state: 'Madhya Pradesh', latitude: 26.2183, longitude: 78.1828 },
};

// WMO Weather interpretation codes
export function decodeWmoCode(code: number): { textEn: string; textHi: string; icon: string } {
  if (code === 0) return { textEn: 'Clear Sky', textHi: 'साफ आसमान', icon: 'Sun' };
  if (code === 1 || code === 2 || code === 3) return { textEn: 'Partly Cloudy', textHi: 'आंशिक बादल', icon: 'CloudSun' };
  if (code === 45 || code === 48) return { textEn: 'Fog / Mist', textHi: 'कोहरा / धुंध', icon: 'CloudFog' };
  if (code >= 51 && code <= 55) return { textEn: 'Drizzle', textHi: 'हल्की बूंदाबांदी', icon: 'CloudDrizzle' };
  if (code >= 61 && code <= 65) return { textEn: 'Rain', textHi: 'बारिश', icon: 'CloudRain' };
  if (code >= 71 && code <= 77) return { textEn: 'Hail / Snow', textHi: 'ओलावृष्टि / बर्फबारी', icon: 'CloudSnow' };
  if (code >= 80 && code <= 82) return { textEn: 'Rain Showers', textHi: 'तेज बौछारें', icon: 'CloudRain' };
  if (code >= 95 && code <= 99) return { textEn: 'Thunderstorm', textHi: 'गरज-चमक के साथ बारिश', icon: 'CloudLightning' };
  return { textEn: 'Moderate', textHi: 'सामान्य', icon: 'Sun' };
}

/**
 * Fetch real weather data from Open-Meteo free API
 */
export async function fetchDistrictWeather(
  districtName: string = 'Sehore',
  activeCrops: string[] = ['Soybean', 'Wheat']
): Promise<WeatherData> {
  const coords = MP_DISTRICT_COORDINATES[districtName] || MP_DISTRICT_COORDINATES['Sehore'];
  const baseUrl = process.env.OPEN_METEO_BASE_URL || 'https://api.open-meteo.com/v1';

  try {
    const url = `${baseUrl}/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=Asia%2FKolkata`;

    const res = await fetch(url, {
      next: { revalidate: 1800 }, // Cache for 30 minutes
    });

    if (!res.ok) {
      throw new Error(`Open-Meteo HTTP error: ${res.status}`);
    }

    const json = await res.json();
    const currentCode = json.current?.weather_code ?? 0;
    const currentDecoded = decodeWmoCode(currentCode);

    const dailyForecasts: WeatherDayForecast[] = (json.daily?.time || []).map((dateStr: string, idx: number) => {
      const code = json.daily.weather_code[idx] ?? 0;
      const decoded = decodeWmoCode(code);
      return {
        date: dateStr,
        tempMax: json.daily.temperature_2m_max[idx] ?? 30,
        tempMin: json.daily.temperature_2m_min[idx] ?? 18,
        precipitationMm: json.daily.precipitation_sum[idx] ?? 0,
        precipitationProbability: json.daily.precipitation_probability_max ? json.daily.precipitation_probability_max[idx] ?? 0 : 0,
        maxWindSpeedKmh: json.daily.wind_speed_10m_max[idx] ?? 12,
        relativeHumidityAvg: json.current?.relative_humidity_2m ?? 65,
        weatherCode: code,
        weatherDescription: decoded.textEn,
        iconName: decoded.icon,
      };
    });

    const cropRisks: WeatherRiskAlert[] = evaluateCropWeatherRisks({
      currentTemp: json.current?.temperature_2m ?? 28,
      currentHumidity: json.current?.relative_humidity_2m ?? 60,
      dailyForecasts,
      activeCrops,
    });

    return {
      district: coords.district,
      state: coords.state,
      latitude: coords.latitude,
      longitude: coords.longitude,
      retrievedAt: new Date().toISOString(),
      isLive: true,
      source: 'Open-Meteo Meteorological API (Open Data)',
      current: {
        temp: Math.round(json.current?.temperature_2m ?? 28),
        apparentTemp: Math.round(json.current?.apparent_temperature ?? 28),
        relativeHumidity: json.current?.relative_humidity_2m ?? 60,
        windSpeedKmh: Math.round(json.current?.wind_speed_10m ?? 10),
        weatherCode: currentCode,
        weatherDescription: currentDecoded.textEn,
        precipitationMm: json.current?.precipitation ?? 0,
      },
      daily: dailyForecasts,
      cropRisks,
    };
  } catch (err) {
    // Graceful offline/fallback mock for network resilience
    return getFallbackWeatherData(coords, activeCrops);
  }
}

export function getFallbackWeatherData(coords: DistrictLocation, activeCrops: string[]): WeatherData {
  const today = new Date();
  const dailyForecasts: WeatherDayForecast[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const isRainDay = i === 2;
    return {
      date: dateStr,
      tempMax: isRainDay ? 27 : 31,
      tempMin: 18,
      precipitationMm: isRainDay ? 8.5 : 0,
      precipitationProbability: isRainDay ? 70 : 10,
      maxWindSpeedKmh: isRainDay ? 22 : 12,
      relativeHumidityAvg: isRainDay ? 82 : 55,
      weatherCode: isRainDay ? 61 : 1,
      weatherDescription: isRainDay ? 'Rain' : 'Mainly Clear',
      iconName: isRainDay ? 'CloudRain' : 'Sun',
    };
  });

  const cropRisks = evaluateCropWeatherRisks({
    currentTemp: 29,
    currentHumidity: 58,
    dailyForecasts,
    activeCrops,
  });

  return {
    district: coords.district,
    state: coords.state,
    latitude: coords.latitude,
    longitude: coords.longitude,
    retrievedAt: new Date().toISOString(),
    isLive: false,
    source: 'Demonstration Cache / Offline Fallback (Network Unavailable)',
    current: {
      temp: 29,
      apparentTemp: 30,
      relativeHumidity: 58,
      windSpeedKmh: 14,
      weatherCode: 1,
      weatherDescription: 'Mainly Clear',
      precipitationMm: 0,
    },
    daily: dailyForecasts,
    cropRisks,
  };
}
