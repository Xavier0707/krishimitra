'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  CloudSun,
  Droplets,
  Wind,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Sun,
  CloudRain,
  CloudLightning,
  CloudFog,
  MapPin,
  Compass,
} from 'lucide-react';
import { WeatherData, WeatherDayForecast } from '@/lib/types';
import { MP_DISTRICT_COORDINATES } from '@/lib/weather/open-meteo';

export default function WeatherPage() {
  const { t } = useI18n();
  const [district, setDistrict] = useState<string>('Sehore');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [locatingGps, setLocatingGps] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsLabel, setGpsLabel] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<number>(0);

  const loadWeather = async (dist: string, customLat?: number, customLon?: number, label?: string) => {
    setLoading(true);
    setFetchError(null);
    try {
      let url = `/api/weather?crops=Soybean,Wheat,Gram`;
      if (customLat !== undefined && customLon !== undefined) {
        url += `&lat=${customLat}&lon=${customLon}&label=${encodeURIComponent(label || 'GPS Farm')}`;
      } else {
        url += `&district=${encodeURIComponent(dist)}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setWeather(data);
        setSelectedDay(0);
      } else {
        setFetchError('मौसम आंकड़े प्राप्त करने में असमर्थ। कृपया पुनः प्रयास करें।');
      }
    } catch {
      setFetchError('नेटवर्क त्रुटि या सर्वर अनुपलब्ध। कृपया इंटरनेट कनेक्शन जांचें।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!gpsLabel) {
      loadWeather(district);
    }
  }, [district]);

  // Farmer-consented device geolocation lookup
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('आपके ब्राउज़र में जीपीएस लोकेशन सुविधा उपलब्ध नहीं है।');
      return;
    }

    setLocatingGps(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const label = `GPS (${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E)`;
        setGpsLabel(label);
        loadWeather('GPS', lat, lon, label);
        setLocatingGps(false);
      },
      (err) => {
        setLocatingGps(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError('लोकेशन अनुमति अस्वीकृत की गई। कृपया सूची से अपना जिला चुनें।');
        } else {
          setGpsError('जीपीएस सिग्नल प्राप्त नहीं हो सका। कृपया सूची से अपना जिला चुनें।');
        }
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  const handleResetToDistrict = (d: string) => {
    setGpsLabel(null);
    setGpsError(null);
    setDistrict(d);
    loadWeather(d);
  };

  const activeDay: WeatherDayForecast | undefined = weather?.daily[selectedDay];

  const getWeatherIcon = (iconName: string, isSelected: boolean) => {
    switch (iconName) {
      case 'CloudRain':
        return <CloudRain className={`w-8 h-8 ${isSelected ? 'text-[#DBF2DE]' : 'text-[#1F4A3F]'}`} />;
      case 'CloudLightning':
        return <CloudLightning className={`w-8 h-8 ${isSelected ? 'text-[#DBF2DE]' : 'text-[#B45309]'}`} />;
      case 'CloudFog':
        return <CloudFog className={`w-8 h-8 ${isSelected ? 'text-[#DBF2DE]' : 'text-[#52685B]'}`} />;
      default:
        return <Sun className={`w-8 h-8 ${isSelected ? 'text-[#DBF2DE]' : 'text-[#B45309]'}`} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={t.weather.title}
        subtitle={t.weather.subtitle}
        icon={<CloudSun className="w-5 h-5 text-[#1F4A3F]" />}
        badge={
          <Badge variant={weather?.isLive ? 'mint' : 'demo'}>
            {weather?.isLive ? 'Open-Meteo Live API' : 'ऑफ़लाइन कैश'}
          </Badge>
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadWeather(district)}
            className="gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>रिफ्रेश</span>
          </Button>
        }
      />

      {/* District Selector & Coordinates */}
      <Card>
        <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 w-full sm:w-auto">
            <div className="w-full sm:w-72">
              <Select
                label="खेत का जिला चुनें"
                value={gpsLabel ? 'GPS' : district}
                onChange={(e) => handleResetToDistrict(e.target.value)}
              >
                {gpsLabel && <option value="GPS">{gpsLabel}</option>}
                {Object.keys(MP_DISTRICT_COORDINATES).map((d) => (
                  <option key={d} value={d}>
                    {d} (मध्य प्रदेश)
                  </option>
                ))}
              </Select>
            </div>

            <Button
              variant="secondary"
              size="md"
              onClick={handleUseCurrentLocation}
              disabled={locatingGps}
              className="gap-2 shrink-0 border border-[#DCE9DD]"
            >
              <Compass className={`w-4 h-4 text-[#1F4A3F] ${locatingGps ? 'animate-spin' : ''}`} />
              <span>{locatingGps ? 'खोज रहे हैं...' : 'वर्तमान जीपीएस स्थान लें'}</span>
            </Button>
          </div>

          <div className="text-xs text-[#52685B] space-y-1">
            <p>
              अक्षांश व देशांतर:{' '}
              <span className="font-mono font-bold text-[#10312B]">
                {weather?.latitude.toFixed(4)}° N, {weather?.longitude.toFixed(4)}° E
              </span>
            </p>
            <p>
              अंतिम अद्यतन:{' '}
              <span className="font-medium text-[#10312B]">
                {weather
                  ? `${new Date(weather.retrievedAt).toLocaleTimeString('hi-IN')} (${
                      weather.isLive ? 'Open-Meteo लाइव' : 'ऑफ़लाइन कैश'
                    })`
                  : '...'}
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* GPS Error Feedback if any */}
      {gpsError && (
        <div className="p-3 bg-[#FEF3C7] rounded-xl text-xs text-[#92400E] border border-[#FDE68A] flex items-center justify-between">
          <span>{gpsError}</span>
          <button
            onClick={() => setGpsError(null)}
            className="text-xs font-bold underline ml-3"
          >
            खारिज करें
          </button>
        </div>
      )}

      {/* Fetch Error & Retry */}
      {fetchError && (
        <div className="p-4 bg-[#FEE2E2] rounded-2xl text-xs text-[#991B1B] border border-[#FECACA] flex items-center justify-between">
          <span>{fetchError}</span>
          <Button
            variant="danger"
            size="sm"
            onClick={() => (gpsLabel ? handleUseCurrentLocation() : loadWeather(district))}
          >
            पुनः प्रयास करें
          </Button>
        </div>
      )}

      {/* Agricultural Risk Advisories */}
      {weather && weather.cropRisks.length > 0 && (
        <div className="space-y-3">
          {weather.cropRisks.map((risk) => (
            <div
              key={risk.id}
              className={`p-4 sm:p-5 rounded-2xl border flex items-start gap-3.5 shadow-soft ${
                risk.severity === 'critical'
                  ? 'bg-[#FEE2E2] border-[#FECACA] text-[#991B1B]'
                  : 'bg-[#FEF3C7] border-[#FDE68A] text-[#92400E]'
              }`}
            >
              <AlertTriangle
                className={`w-5 h-5 shrink-0 mt-0.5 ${
                  risk.severity === 'critical' ? 'text-[#B91C1C]' : 'text-[#B45309]'
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
                <p className="text-xs leading-relaxed opacity-95">{risk.messageHi}</p>
                <div className="pt-1 text-xs font-semibold">
                  <span>उपाय: </span>
                  <span>{risk.preventiveActionHi}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Current Conditions 4 Cards */}
      {weather && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4.5">
          <Card className="bg-white border-[#DCE9DD]">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#52685B]">
                  वर्तमान तापमान
                </span>
                <div className="text-3xl font-black text-[#10312B] mt-1">
                  {weather.current.temp}°C
                </div>
                <p className="text-xs text-[#52685B] mt-0.5">
                  महसूस: {weather.current.apparentTemp}°C
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-[#EAF4E8] text-[#1F4A3F] flex items-center justify-center">
                <Thermometer className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-[#DCE9DD]">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#52685B]">
                  सापेक्ष आर्द्रता
                </span>
                <div className="text-3xl font-black text-[#10312B] mt-1">
                  {weather.current.relativeHumidity}%
                </div>
                <p className="text-xs text-[#52685B] mt-0.5">
                  {weather.current.relativeHumidity > 75 ? 'फंगस जोखिम अधिक' : 'सामान्य अनुकूल'}
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-[#EAF4E8] text-[#1F4A3F] flex items-center justify-center">
                <Droplets className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-[#DCE9DD]">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#52685B]">
                  हवा की गति
                </span>
                <div className="text-3xl font-black text-[#10312B] mt-1">
                  {weather.current.windSpeedKmh} <span className="text-sm font-normal text-[#52685B]">km/h</span>
                </div>
                <p className="text-xs text-[#52685B] mt-0.5">
                  {weather.current.windSpeedKmh > 20 ? 'छिड़काव न करें' : 'छिड़काव हेतु सुरक्षित'}
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-[#EAF4E8] text-[#1F4A3F] flex items-center justify-center">
                <Wind className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-[#DCE9DD]">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#52685B]">
                  वर्तमान स्थिति
                </span>
                <div className="text-lg font-black text-[#10312B] mt-1">
                  {weather.current.weatherDescription}
                </div>
                <p className="text-xs text-[#52685B] mt-0.5">
                  वर्षा: {weather.current.precipitationMm} mm
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-[#EAF4E8] text-[#1F4A3F] flex items-center justify-center">
                <CloudSun className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 7-Day Agricultural Forecast Grid */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-base text-[#10312B]">7-दिवसीय कृषि मौसम पूर्वानुमान</CardTitle>
            <CardDescription>
              किसी भी दिन पर क्लिक करके तापमान और बारिश का विस्तृत कृषि प्रभाव देखें
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
            {weather?.daily.map((day, idx) => {
              const isSelected = selectedDay === idx;
              const dateObj = new Date(day.date);
              const dayName = dateObj.toLocaleDateString('hi-IN', { weekday: 'short' });

              return (
                <button
                  key={day.date}
                  onClick={() => setSelectedDay(idx)}
                  className={`p-3.5 rounded-2xl border text-center transition-all duration-150 ${
                    isSelected
                      ? 'bg-[#1F4A3F] text-white border-[#10312B] shadow-card'
                      : 'bg-white hover:bg-[#EAF4E8]/60 border-[#DCE9DD] text-[#10312B]'
                  }`}
                >
                  <span
                    className={`text-[11px] font-bold block ${
                      isSelected ? 'text-[#DBF2DE]' : 'text-[#52685B]'
                    }`}
                  >
                    {idx === 0 ? 'आज' : dayName}
                  </span>
                  <span className="text-xs font-mono font-medium block mt-0.5">
                    {day.date.slice(5)}
                  </span>
                  <div className="my-2.5 flex justify-center">
                    {getWeatherIcon(day.iconName, isSelected)}
                  </div>
                  <div className="text-sm font-black">
                    {Math.round(day.tempMax)}°{' '}
                    <span
                      className={`text-xs font-normal ${
                        isSelected ? 'text-[#DBF2DE]' : 'text-[#718579]'
                      }`}
                    >
                      / {Math.round(day.tempMin)}°
                    </span>
                  </div>
                  {day.precipitationMm > 0 ? (
                    <span className={`inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-[#DBF2DE] text-[#092622]'
                        : 'bg-[#DBF2DE] text-[#10312B]'
                    }`}>
                      {day.precipitationMm} mm
                    </span>
                  ) : (
                    <span className={`inline-block mt-1.5 text-[10px] ${
                      isSelected ? 'text-[#DBF2DE]/80' : 'text-[#718579]'
                    }`}>
                      शुष्क (0 mm)
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Selected Day Expanded Detail Box */}
          {activeDay && (
            <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-[#EAF4E8] border border-[#DCE9DD] space-y-2 text-xs">
              <h4 className="font-bold text-sm text-[#10312B]">
                कृषि कार्य परामर्श ({activeDay.date}):
              </h4>
              <p className="text-[#52685B] leading-relaxed">
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
          <div className="text-[11px] text-[#52685B] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#1F4A3F]" />
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
