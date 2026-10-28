import { describe, it, expect } from 'vitest';
import { evaluateCropWeatherRisks } from '../lib/weather/weather-risks';
import { WeatherDayForecast } from '../lib/types';

describe('Weather Crop Risk Engine', () => {
  it('triggers rainfall advisory when heavy rain is forecasted in near term', () => {
    const mockDaily: WeatherDayForecast[] = [
      {
        date: '2026-10-28',
        tempMax: 30,
        tempMin: 18,
        precipitationMm: 14.5,
        precipitationProbability: 80,
        maxWindSpeedKmh: 20,
        relativeHumidityAvg: 75,
        weatherCode: 61,
        weatherDescription: 'Rain',
        iconName: 'CloudRain',
      },
    ];

    const alerts = evaluateCropWeatherRisks({
      currentTemp: 28,
      currentHumidity: 60,
      dailyForecasts: mockDaily,
      activeCrops: ['Soybean'],
    });

    expect(alerts.length).toBeGreaterThan(0);
    const rainAlert = alerts.find((a) => a.id === 'rain-risk-advisory');
    expect(rainAlert).toBeDefined();
    expect(rainAlert?.titleHi).toContain('वर्षा');
  });

  it('triggers frost advisory when night temperature falls to 3°C', () => {
    const mockDaily: WeatherDayForecast[] = [
      {
        date: '2026-12-15',
        tempMax: 20,
        tempMin: 3.2,
        precipitationMm: 0,
        precipitationProbability: 0,
        maxWindSpeedKmh: 8,
        relativeHumidityAvg: 50,
        weatherCode: 0,
        weatherDescription: 'Clear Sky',
        iconName: 'Sun',
      },
    ];

    const alerts = evaluateCropWeatherRisks({
      currentTemp: 18,
      currentHumidity: 50,
      dailyForecasts: mockDaily,
      activeCrops: ['Gram', 'Mustard'],
    });

    const frostAlert = alerts.find((a) => a.id === 'frost-risk-alert');
    expect(frostAlert).toBeDefined();
    expect(frostAlert?.severity).toBe('critical');
    expect(frostAlert?.titleHi).toContain('पाला');
  });
});
