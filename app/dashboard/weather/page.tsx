'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  CloudSun,
  Droplets,
  Wind,
  Thermometer,
  ShieldAlert,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Sun,
  CloudRain,
  CloudLightning,
  CloudFog,
} from 'lucide-react';
import { WeatherData, WeatherDayForecast } from '@/lib/types';
import { MP_DISTRICT_COORDINATES } from '@/lib/weather/open-meteo';

export default function WeatherPage() {
  const { t } = useI18n();
  const [district, setDistrict] = useState<string>('Sehore');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDay, setSelectedDay] = useState<number>(0);

  const loadWeather = async (dist: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/weather?district=${encodeURIComponent(dist)}&crops=Soybean,Wheat,Gram`);
      if (res.ok) {
        const data = await res.json();
        setWeather(data);
        setSelectedDay(0);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeather(district);
  }, [district]);

  const activeDay: WeatherDayForecast | undefined = weather?.daily[selectedDay];

  const getWeatherIcon = (iconName: string) => {
    switch (iconName) {
      case 'CloudRain':
        return <CloudRain className="w-8 h-8 text-sky-600" />;
      case 'CloudLightning':
        return <CloudLightning className="w-8 h-8 text-amber-500" />;
      case 'CloudFog':
        return <CloudFog className="w-8 h-8 text-gray-500" />;
      default:
        return <Sun className="w-8 h-8 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-forest-950 flex items-center gap-2">
            <CloudSun className="w-6 h-6 text-forest-700" />
            <span>{t.weather.title}</span>
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-600 mt-0.5">
            {t.weather.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={weather?.isLive ? 'agri' : 'demo'}>
            {weather?.isLive ? 'Open-Meteo Live API' : 'ऑफ़लाइन कैश'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadWeather(district)}
            className="gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>रिफ्रेश</span>
          </Button>
        </div>
      </div>

      {/* District Selector & Coordinates */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="w-full sm:w-72">
            <Select
              label="खेत का जिला चुनें"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            >
              {Object.keys(MP_DISTRICT_COORDINATES).map((d) => (
                <option key={d} value={d}>
                  {d} (मध्य प्रदेश)
                </option>
              ))}
            </Select>
          </div>

          <div className="text-xs text-charcoal-600 space-y-0.5">
            <p>
              अक्षांश व देशांतर:{' '}
              <span className="font-mono font-medium text-charcoal-900">
                {weather?.latitude.toFixed(4)}° N, {weather?.longitude.toFixed(4)}° E
              </span>
            </p>
            <p>
              अंतिम अद्यतन:{' '}
              <span className="font-medium">
                {weather ? new Date(weather.retrievedAt).toLocaleTimeString('hi-IN') : '...'}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Agricultural Risk Advisories */}
      {weather && weather.cropRisks.length > 0 && (
        <div className="space-y-3">
          {weather.cropRisks.map((risk) => (
            <div
              key={risk.id}
              className={`p-4 rounded-xl border flex items-start gap-3 shadow-xs ${
                risk.severity === 'critical'
                  ? 'bg-rose-50 border-rose-300 text-rose-900'
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}
            >
              <AlertTriangle
                className={`w-5 h-5 shrink-0 mt-0.5 ${
                  risk.severity === 'critical' ? 'text-rose-600' : 'text-amber-600'
                }`}
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold">{risk.titleHi}</h4>
                  <Badge
                    variant={risk.severity === 'critical' ? 'critical' : 'warning'}
                    size="sm"
                  >
                    {risk.severity === 'critical' ? 'गंभीर चेतावनी' : 'सतर्कता'}
                  </Badge>
                </div>
                <p className="text-xs leading-relaxed opacity-90">{risk.messageHi}</p>
                <div className="pt-1 text-xs font-semibold">
                  <span>उपाय: </span>
                  <span>{risk.preventiveActionHi}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Current Conditions Card */}
      {weather && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-white to-forest-50/40 border-forest-200">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
                  वर्तमान तापमान
                </span>
                <div className="text-3xl font-black text-forest-950 mt-1">
                  {weather.current.temp}°C
                </div>
                <p className="text-xs text-charcoal-600 mt-0.5">
                  महसूस: {weather.current.apparentTemp}°C
                </p>
              </div>
              <Thermometer className="w-10 h-10 text-forest-700 opacity-80" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
                  सापेक्ष आर्द्रता (Humidity)
                </span>
                <div className="text-3xl font-black text-forest-950 mt-1">
                  {weather.current.relativeHumidity}%
                </div>
                <p className="text-xs text-charcoal-600 mt-0.5">
                  {weather.current.relativeHumidity > 75
                    ? 'फंगस जोखिम अधिक'
                    : 'सामान्य अनुकूल'}
                </p>
              </div>
              <Droplets className="w-10 h-10 text-sky-600 opacity-80" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
                  हवा की गति
                </span>
                <div className="text-3xl font-black text-forest-950 mt-1">
                  {weather.current.windSpeedKmh} <span className="text-sm font-normal">km/h</span>
                </div>
                <p className="text-xs text-charcoal-600 mt-0.5">
                  {weather.current.windSpeedKmh > 20
                    ? 'छिड़काव न करें (दवा उड़ेगी)'
                    : 'छिड़काव हेतु सुरक्षित'}
                </p>
              </div>
              <Wind className="w-10 h-10 text-teal-600 opacity-80" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-charcoal-500">
                  वर्तमान स्थिति
                </span>
                <div className="text-lg font-black text-forest-950 mt-1">
                  {weather.current.weatherDescription}
                </div>
                <p className="text-xs text-charcoal-600 mt-0.5">
                  बारिश: {weather.current.precipitationMm} mm
                </p>
              </div>
              <CloudSun className="w-10 h-10 text-amber-500 opacity-80" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* 7-Day Agricultural Forecast Grid */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-base">7-दिवसीय कृषि मौसम पूर्वानुमान</CardTitle>
            <CardDescription>
              किसी भी दिन पर क्लिक करके तापमान और बारिश का विस्तृत कृषि प्रभाव देखें
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {weather?.daily.map((day, idx) => {
              const isSelected = selectedDay === idx;
              const dateObj = new Date(day.date);
              const dayName = dateObj.toLocaleDateString('hi-IN', { weekday: 'short' });

              return (
                <button
                  key={day.date}
                  onClick={() => setSelectedDay(idx)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'bg-forest-800 text-white border-forest-900 shadow-sm'
                      : 'bg-white hover:bg-cream-100 border-charcoal-200 text-charcoal-900'
                  }`}
                >
                  <span
                    className={`text-[11px] font-bold block ${
                      isSelected ? 'text-forest-200' : 'text-charcoal-500'
                    }`}
                  >
                    {idx === 0 ? 'आज' : dayName}
                  </span>
                  <span className="text-xs font-mono font-medium block mt-0.5">
                    {day.date.slice(5)}
                  </span>
                  <div className="my-2 flex justify-center">
                    {getWeatherIcon(day.iconName)}
                  </div>
                  <div className="text-sm font-black">
                    {Math.round(day.tempMax)}°{' '}
                    <span
                      className={`text-xs font-normal ${
                        isSelected ? 'text-forest-200' : 'text-charcoal-500'
                      }`}
                    >
                      / {Math.round(day.tempMin)}°
                    </span>
                  </div>
                  {day.precipitationMm > 0 ? (
                    <span className="inline-block mt-1 text-[10px] font-bold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded">
                      {day.precipitationMm} mm
                    </span>
                  ) : (
                    <span className="inline-block mt-1 text-[10px] text-charcoal-400">
                      शुष्क (0 mm)
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Day Expanded Detail Box */}
          {activeDay && (
            <div className="mt-5 p-4 rounded-xl bg-cream-100 border border-charcoal-200 space-y-2 text-xs">
              <h4 className="font-bold text-sm text-charcoal-900">
                कृषि कार्य परामर्श ({activeDay.date}):
              </h4>
              <p className="text-charcoal-700 leading-relaxed">
                अधिकतम तापमान <strong>{activeDay.tempMax}°C</strong> और न्यूनतम तापमान{' '}
                <strong>{activeDay.tempMin}°C</strong> रहने का अनुमान है। हवा की गति लगभग{' '}
                <strong>{activeDay.maxWindSpeedKmh} किमी/घंटा</strong> रहेगी।
                {activeDay.precipitationMm > 5
                  ? ' वर्षा की संभावना को देखते हुए खेतों में कटी फसल को तिरपाल से ढकें और यूरिया छिड़काव स्थगित रखें।'
                  : ' मौसम साफ रहने के कारण खेत में जुताई, बुवाई अथवा सिंचाई के कार्य सुगमता से किए जा सकते हैं।'}
              </p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <div className="text-[11px] text-charcoal-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-agri-600" />
            <span>
              यह पूर्वानुमान ओपन-मेटियो (Open-Meteo) गणितीय मौसम मॉडल पर आधारित है। इसे
              सरकारी मौसम विभाग (IMD) की आधिकारिक आपदा चेतावनी का विकल्प न समझें।
            </span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
