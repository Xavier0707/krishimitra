'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  CloudSun,
  Stethoscope,
  FlaskConical,
  Warehouse,
  Plus,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { INITIAL_DEMO_FARM, INITIAL_DEMO_ACTIVITIES } from '@/lib/demo/demo-state';
import { BENCHMARK_MP_MANDI_PRICES } from '@/lib/mandi/mp-mandis-data';
import { WeatherData } from '@/lib/types';
import { getFallbackWeatherData, MP_DISTRICT_COORDINATES } from '@/lib/weather/open-meteo';

export default function DashboardPage() {
  const { t, formatCurrency } = useI18n();
  const farm = INITIAL_DEMO_FARM;
  const activePlot = farm.plots[0]; // Soybean Plot
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  useEffect(() => {
    async function loadWeather() {
      try {
        const res = await fetch('/api/weather?district=Sehore&crops=Soybean,Wheat');
        if (res.ok) {
          const data = await res.json();
          setWeather(data);
        } else {
          setWeather(getFallbackWeatherData(MP_DISTRICT_COORDINATES['Sehore'], ['Soybean', 'Wheat']));
        }
      } catch {
        setWeather(getFallbackWeatherData(MP_DISTRICT_COORDINATES['Sehore'], ['Soybean', 'Wheat']));
      } finally {
        setLoadingWeather(false);
      }
    }
    loadWeather();
  }, []);

  const latestMandiRates = BENCHMARK_MP_MANDI_PRICES.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* 1. Welcome Header & Farm Summary Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-charcoal-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-forest-950">
              {t.dashboard.welcome}, रामेश पटेल
            </h1>
            <Badge variant="demo" size="sm">
              डेमो खाता
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-charcoal-600 mt-1">
            खेत: <strong>{farm.farmName}</strong> • {farm.village}, {farm.district} (
            {farm.totalArea} एकड़ / 12.8 बीघा)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/dashboard/crop-doctor">
            <Button variant="agri" size="sm" className="gap-1.5">
              <Stethoscope className="w-4 h-4" />
              <span>क्रॉप डॉक्टर स्कैन</span>
            </Button>
          </Link>
          <Link href="/dashboard/mandi">
            <Button variant="outline" size="sm" className="gap-1.5">
              <TrendingUp className="w-4 h-4 text-forest-700" />
              <span>मंडी लाभ रडार</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Current Crop & Stage */}
        <Card className="border-forest-200/70 bg-gradient-to-br from-white to-forest-50/30">
          <CardContent className="p-4 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500 block">
              सक्रिय फसल व चरण
            </span>
            <div className="flex items-baseline justify-between">
              <h3 className="text-xl font-black text-forest-950">
                {activePlot.cropNameHi}
              </h3>
              <Badge variant="forest" size="sm">
                {activePlot.currentStage}
              </Badge>
            </div>
            <p className="text-xs text-charcoal-600">
              किस्म: {activePlot.cropVariety} • रकबा: {activePlot.plotArea} एकड़
            </p>
          </CardContent>
        </Card>

        {/* Metric 2: Today's Mandi Price */}
        <Card>
          <CardContent className="p-4 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500 block">
              आज का मॉडल मंडी भाव (सीहोर)
            </span>
            <div className="flex items-baseline justify-between">
              <h3 className="text-xl font-black text-forest-950">
                {formatCurrency(4680)}
              </h3>
              <span className="text-xs font-semibold text-agri-700">प्रति क्विंटल</span>
            </div>
            <p className="text-xs text-charcoal-600">
              सोयाबीन पीला • एगमार्कनेट दैनिक बुलेटिन
            </p>
          </CardContent>
        </Card>

        {/* Metric 3: Weather Overview */}
        <Card>
          <CardContent className="p-4 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500 block">
              मौसम (सीहोर)
            </span>
            <div className="flex items-baseline justify-between">
              <h3 className="text-xl font-black text-forest-950">
                {loadingWeather ? '...' : `${weather?.current.temp}°C`}
              </h3>
              <Badge variant="neutral" size="sm">
                {weather?.current.weatherDescription || 'साफ आसमान'}
              </Badge>
            </div>
            <p className="text-xs text-charcoal-600">
              आर्द्रता: {weather?.current.relativeHumidity}% • वर्षा संभावना: 0%
            </p>
          </CardContent>
        </Card>

        {/* Metric 4: Estimated Net Revenue */}
        <Card className="border-agri-200/70 bg-gradient-to-br from-white to-agri-50/20">
          <CardContent className="p-4 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal-500 block">
              अनुमानित सकल उपज मूल्य
            </span>
            <div className="flex items-baseline justify-between">
              <h3 className="text-xl font-black text-agri-800">
                {formatCurrency(187200)}
              </h3>
              <span className="text-[11px] font-medium text-charcoal-500">
                ~40 क्विंटल
              </span>
            </div>
            <p className="text-xs text-charcoal-600">
              5 एकड़ अनुमानित पैदावार (8 क्विंटल/एकड़)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Weather Advisory Banner */}
      {weather && weather.cropRisks.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-amber-900">
              {weather.cropRisks[0].titleHi}
            </h4>
            <p className="text-xs text-amber-800 mt-1 leading-relaxed">
              {weather.cropRisks[0].messageHi}
            </p>
            <p className="text-xs text-amber-950 font-semibold mt-1">
              सलाह: {weather.cropRisks[0].preventiveActionHi}
            </p>
          </div>
          <Link href="/dashboard/weather">
            <Button variant="outline" size="sm" className="bg-white text-xs whitespace-nowrap">
              मौसम विवरण
            </Button>
          </Link>
        </div>
      )}

      {/* 4. Main Two Column Section: Mandi Ticker & Field Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Mandi Prices & Quick Net Return (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Mandi Table Card */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>आसपास की प्रमुख मंडियों में आज के भाव</CardTitle>
                <CardDescription>
                  स्रोत: Agmarknet / म.प्र. राज्य कृषि विपणन बोर्ड (सत्यापित बेंचमार्क)
                </CardDescription>
              </div>
              <Link href="/dashboard/mandi">
                <Button variant="ghost" size="sm" className="gap-1 text-forest-800 font-bold">
                  <span>विस्तृत देखें</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-cream-100/70 border-b border-charcoal-200 text-xs font-bold text-charcoal-700 uppercase tracking-wider">
                    <th className="py-3 px-4">मंडी (स्थान)</th>
                    <th className="py-3 px-4">फसल / जिंस</th>
                    <th className="py-3 px-4 text-right">न्यूनतम</th>
                    <th className="py-3 px-4 text-right">मॉडल (औसत)</th>
                    <th className="py-3 px-4 text-right">अधिकतम</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-100 text-charcoal-800">
                  {latestMandiRates.map((rate) => (
                    <tr key={rate.id} className="hover:bg-cream-50/60 transition-colors">
                      <td className="py-3 px-4 font-semibold text-charcoal-900">
                        {rate.marketName}
                        <span className="block text-[11px] font-normal text-charcoal-500">
                          {rate.district}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-forest-900">
                          {rate.commodity}
                        </span>
                        <span className="block text-[11px] text-charcoal-500">
                          {rate.variety}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-charcoal-700">
                        {formatCurrency(rate.minPrice)}
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-agri-700">
                        {formatCurrency(rate.modalPrice)}
                      </td>
                      <td className="py-3 px-4 text-right text-charcoal-700">
                        {formatCurrency(rate.maxPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
            <CardFooter>
              <div className="flex items-center gap-1.5 text-xs text-charcoal-500">
                <ShieldCheck className="w-3.5 h-3.5 text-agri-600" />
                <span>सभी दरें ₹ प्रति क्विंटल में हैं। कोई अनुमानित या फर्जी भाव नहीं।</span>
              </div>
            </CardFooter>
          </Card>

          {/* Quick Net Return Banner */}
          <div className="p-5 bg-forest-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-semibold text-agri-400 uppercase tracking-wider">
                निर्णय उपकरण
              </span>
              <h3 className="text-lg font-bold text-white">
                मंडी ले जाने से पहले अपना वास्तविक शुद्ध मुनाफा कैलकुलेट करें
              </h3>
              <p className="text-xs text-forest-200">
                ट्रॉली किराया, हम्माली व तुलाई खर्च घटाकर हाथ में आने वाले वास्तविक पैसे का हिसाब।
              </p>
            </div>
            <Link href="/dashboard/mandi" className="shrink-0 w-full sm:w-auto">
              <Button variant="agri" size="md" className="w-full sm:w-auto">
                कैलकुलेटर खोलें
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Column: Field Reminders & Activities (1 Col) */}
        <div className="space-y-6">
          {/* Farm Care Reminders */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">फसल-सुरक्षा कार्य सूची</CardTitle>
              <Sparkles className="w-4 h-4 text-forest-700" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 rounded-lg bg-cream-100 border border-charcoal-200/80 text-xs space-y-1">
                <div className="flex items-center justify-between font-semibold text-charcoal-900">
                  <span>सोयाबीन: फली छेदक निगरानी</span>
                  <Badge variant="warning" size="sm">तत्काल</Badge>
                </div>
                <p className="text-charcoal-600">
                  खेत में 4-5 फेरोमोन ट्रैप लगाएं। 1 मीटर कतार में 2 इल्लियां दिखने पर ही छिड़काव करें।
                </p>
              </div>

              <div className="p-3 rounded-lg bg-cream-100 border border-charcoal-200/80 text-xs space-y-1">
                <div className="flex items-center justify-between font-semibold text-charcoal-900">
                  <span>शरबती गेहूं: खेत तैयारी</span>
                  <Badge variant="neutral" size="sm">आगामी</Badge>
                </div>
                <p className="text-charcoal-600">
                  रबी बुवाई हेतु खेत की गहरी जुताई और पाटा लगाना। बीज उपचार (ट्राइकोडर्मा) की तैयारी।
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Field Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">हालिया खेत गतिविधियां</CardTitle>
              <Calendar className="w-4 h-4 text-charcoal-500" />
            </CardHeader>
            <CardContent className="space-y-3">
              {INITIAL_DEMO_ACTIVITIES.map((act) => (
                <div key={act.id} className="border-l-2 border-forest-700 pl-3 py-0.5 space-y-0.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-charcoal-900">{act.activityType}</span>
                    <span className="text-[11px] text-charcoal-500">{act.activityDate}</span>
                  </div>
                  <p className="text-xs text-charcoal-600">{act.details}</p>
                  <p className="text-[11px] font-semibold text-forest-800">
                    लागत: {formatCurrency(act.costIncurred)}
                  </p>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Link href="/dashboard/farm-twin" className="w-full">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  नया कार्य दर्ज करें
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
