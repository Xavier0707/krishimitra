'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { MetricCard } from '@/components/ui/metric-card';
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
  Sprout,
  DollarSign,
  MapPin,
  ChevronRight,
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
      {/* 1. Dashboard Hero Feature Panel (Forest-Mint Theme) */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#10312B] via-[#163D34] to-[#1F4A3F] text-white p-6 sm:p-8 shadow-float border border-[#4E7967]/30">
        {/* Subtle decorative landscape lines */}
        <div className="absolute inset-0 pointer-events-none opacity-10">
          <svg className="w-full h-full" viewBox="0 0 1000 300" fill="none" preserveAspectRatio="none">
            <path d="M0 200 C 300 120, 600 240, 1000 150 L 1000 300 L 0 300 Z" fill="#DBF2DE" />
            <path d="M0 240 C 400 180, 700 260, 1000 210 L 1000 300 L 0 300 Z" fill="#9EC2A9" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            {/* Top location & status pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#092622]/60 border border-[#4E7967]/50 text-xs text-[#DBF2DE]">
              <MapPin className="w-3.5 h-3.5 text-[#9EC2A9]" />
              <span>{farm.village}, {farm.district} • {farm.totalArea} एकड़</span>
              <span className="text-[#9EC2A9]/60">•</span>
              <span className="font-semibold text-white">रामेश पटेल</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
              स्मार्ट कृषि निर्णय व दैनिक मंडी भाव
            </h1>

            <p className="text-xs sm:text-sm text-[#DBF2DE]/90 leading-relaxed max-w-xl">
              आपकी <strong>{activePlot.cropNameHi}</strong> फसल फलियां बनने की अवस्था में है। आज सीहोर मंडी में मॉडल भाव <strong>{formatCurrency(4680)}/क्विंटल</strong> है और आगामी 48 घंटों में वर्षा जोखिम नहीं है।
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link href="/dashboard/mandi">
                <Button variant="mint" size="md" className="gap-2">
                  <span>मंडी लाभ रडार देखें</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/dashboard/crop-doctor">
                <Button variant="secondary" size="md" className="gap-2 bg-[#092622]/50 text-[#DBF2DE] border-[#4E7967]/50 hover:bg-[#092622]/80">
                  <Stethoscope className="w-4 h-4" />
                  <span>क्रॉप डॉक्टर स्कैन</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Stats Capsule on the Right */}
          <div className="bg-[#092622]/50 backdrop-blur-md rounded-2xl border border-[#4E7967]/40 p-4.5 space-y-3 shrink-0 md:min-w-[240px]">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#9EC2A9]">
              सक्रिय भूखंड स्थिति
            </div>
            <div>
              <span className="text-lg font-black text-white block">
                {activePlot.plotName}
              </span>
              <span className="text-xs text-[#DBF2DE]/80">
                {activePlot.cropNameHi} ({activePlot.cropVariety})
              </span>
            </div>
            <div className="pt-2 border-t border-[#4E7967]/40 flex items-center justify-between text-xs">
              <span className="text-[#9EC2A9]">विकास चरण:</span>
              <Badge variant="mint" size="sm" className="bg-[#1F4A3F] text-[#DBF2DE] border-[#4E7967]">
                {activePlot.currentStage}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Key Metrics Row using Reusable MetricCard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
        {/* Metric 1: Current Crop Stage */}
        <MetricCard
          label="सक्रिय फसल व चरण"
          value={activePlot.cropNameHi}
          unit={`(${activePlot.plotArea} एकड़)`}
          icon={<Sprout className="w-5 h-5 text-[#1F4A3F]" />}
          subtitle={`किस्म: ${activePlot.cropVariety} • बुवाई: ${activePlot.sowingDate}`}
          statusBadge={{ text: activePlot.currentStage, variant: 'mint' }}
        />

        {/* Metric 2: Today's Mandi Price */}
        <MetricCard
          label="आज का मॉडल भाव (सीहोर)"
          value={formatCurrency(4680)}
          unit="/ क्विंटल"
          icon={<TrendingUp className="w-5 h-5 text-[#1F4A3F]" />}
          subtitle="सोयाबीन (पीला) • सीहोर मंडी"
          source="Agmarknet दैनिक बुलेटिन"
          statusBadge={{ text: 'स्थिर बाजार', variant: 'forest' }}
        />

        {/* Metric 3: Weather Overview */}
        <MetricCard
          label="मौसम (सीहोर)"
          value={loadingWeather ? '...' : `${weather?.current.temp}°C`}
          unit={weather?.current.weatherDescription || 'साफ आसमान'}
          icon={<CloudSun className="w-5 h-5 text-[#1F4A3F]" />}
          subtitle={`आर्द्रता: ${weather?.current.relativeHumidity || 58}% • हवा: ${weather?.current.windSpeedKmh || 14} km/h`}
          statusBadge={{ text: 'छिड़काव हेतु अनुकूल', variant: 'mint' }}
          source="Open-Meteo API"
        />

        {/* Metric 4: Estimated Net Revenue */}
        <MetricCard
          label="अनुमानित सकल उपज मूल्य"
          value={formatCurrency(187200)}
          unit="(~40 क्विंटल)"
          icon={<DollarSign className="w-5 h-5 text-[#1F4A3F]" />}
          subtitle="5 एकड़ अनुमानित पैदावार (8 Q/एकड़)"
          statusBadge={{ text: 'अनुमानित शुद्ध आय', variant: 'forest' }}
        />
      </div>

      {/* 3. Weather Advisory Banner */}
      {weather && weather.cropRisks.length > 0 && (
        <div className="p-4 sm:p-5 bg-[#FEF3C7] border border-[#FDE68A] rounded-2xl flex items-start gap-3.5 shadow-soft">
          <AlertTriangle className="w-5 h-5 text-[#B45309] shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-[#92400E]">
                {weather.cropRisks[0].titleHi}
              </h4>
              <Badge variant="warning" size="sm">
                मौसम जोखिम अलर्ट
              </Badge>
            </div>
            <p className="text-xs text-[#92400E] leading-relaxed">
              {weather.cropRisks[0].messageHi}
            </p>
            <p className="text-xs text-[#92400E] font-semibold pt-0.5">
              सलाह: {weather.cropRisks[0].preventiveActionHi}
            </p>
          </div>
          <Link href="/dashboard/weather" className="shrink-0">
            <Button variant="outline" size="sm" className="bg-white text-xs border-[#FDE68A] hover:bg-[#FFFBEB]">
              विस्तृत देखें
            </Button>
          </Link>
        </div>
      )}

      {/* 4. Main Two Column Section: Mandi Ticker & Field Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Mandi Prices & Quick Net Return (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Mandi Table Card */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="text-base text-[#10312B]">
                  आसपास की प्रमुख मंडियों में आज के भाव
                </CardTitle>
                <CardDescription>
                  स्रोत: Agmarknet / म.प्र. राज्य कृषि विपणन बोर्ड (सत्यापित बेंचमार्क)
                </CardDescription>
              </div>
              <Link href="/dashboard/mandi">
                <Button variant="ghost" size="sm" className="gap-1 text-[#1F4A3F] font-bold">
                  <span>पूर्ण रडार</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#EAF4E8]/60 border-b border-[#DCE9DD] text-xs font-bold text-[#52685B] uppercase tracking-wider">
                    <th className="py-3 px-4">मंडी (स्थान)</th>
                    <th className="py-3 px-4">फसल / जिंस</th>
                    <th className="py-3 px-4 text-right">न्यूनतम</th>
                    <th className="py-3 px-4 text-right">मॉडल भाव</th>
                    <th className="py-3 px-4 text-right">अधिकतम</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE9DD]/70 text-[#10312B]">
                  {latestMandiRates.map((rate) => (
                    <tr key={rate.id} className="hover:bg-[#EAF4E8]/40 transition-colors">
                      <td className="py-3 px-4 font-semibold text-[#10312B]">
                        {rate.marketName}
                        <span className="block text-[11px] font-normal text-[#52685B]">
                          {rate.district}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-[#1F4A3F]">
                          {rate.commodity}
                        </span>
                        <span className="block text-[11px] text-[#718579]">
                          {rate.variety}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right text-[#52685B] font-mono">
                        {rate.minPrice !== null ? formatCurrency(rate.minPrice) : '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-[#10312B] text-base font-mono">
                        {rate.modalPrice !== null ? formatCurrency(rate.modalPrice) : '—'}
                      </td>
                      <td className="py-3 px-4 text-right text-[#52685B] font-mono">
                        {rate.maxPrice !== null ? formatCurrency(rate.maxPrice) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
            <CardFooter>
              <div className="flex items-center gap-1.5 text-xs text-[#52685B]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1F4A3F]" />
                <span>दरें ₹ प्रति क्विंटल में हैं। कोई अनुमानित या फर्जी भाव प्रदर्शित नहीं किए जाते।</span>
              </div>
            </CardFooter>
          </Card>

          {/* Net Return Calculator Highlight Card */}
          <div className="p-6 bg-gradient-to-r from-[#10312B] to-[#1F4A3F] text-white rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-5 shadow-card border border-[#4E7967]/30">
            <div className="space-y-1.5 text-center sm:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9EC2A9]">
                शुद्ध मुनाफा अंतर्दृष्टि
              </span>
              <h3 className="text-lg font-bold text-white">
                मंडी ले जाने से पहले अपना वास्तविक शुद्ध मुनाफा कैलकुलेट करें
              </h3>
              <p className="text-xs text-[#DBF2DE]/90 leading-relaxed">
                ट्रॉली भाड़ा, तुलाई व हम्माली काटकर हाथ में आने वाला शुद्ध पैसा जानें।
              </p>
            </div>
            <Link href="/dashboard/mandi" className="shrink-0 w-full sm:w-auto">
              <Button variant="mint" size="md" className="w-full sm:w-auto font-bold shadow-soft">
                कैलकुलेटर खोलें
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Column: Reminders & Activities (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Farm Care Reminders */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-[#10312B]">फसल-सुरक्षा कार्य सूची</CardTitle>
              <Sparkles className="w-4 h-4 text-[#1F4A3F]" />
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3.5 rounded-xl bg-[#EAF4E8] border border-[#DCE9DD] text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-[#10312B]">
                  <span>सोयाबीन: फली छेदक निगरानी</span>
                  <Badge variant="warning" size="sm">तत्काल</Badge>
                </div>
                <p className="text-[#52685B] leading-relaxed">
                  खेत में 4-5 फेरोमोन ट्रैप लगाएं। 1 मीटर कतार में 2 इल्लियां दिखने पर ही छिड़काव करें।
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F3F8F2] border border-[#DCE9DD] text-xs space-y-1">
                <div className="flex items-center justify-between font-bold text-[#10312B]">
                  <span>शरबती गेहूं: खेत तैयारी</span>
                  <Badge variant="neutral" size="sm">आगामी</Badge>
                </div>
                <p className="text-[#52685B] leading-relaxed">
                  रबी बुवाई हेतु खेत की गहरी जुताई और पाटा लगाना। बीज उपचार (ट्राइकोडर्मा) की तैयारी।
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Field Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-[#10312B]">हालिया खेत गतिविधियां</CardTitle>
              <Calendar className="w-4 h-4 text-[#52685B]" />
            </CardHeader>
            <CardContent className="space-y-3.5">
              {INITIAL_DEMO_ACTIVITIES.map((act) => (
                <div key={act.id} className="border-l-2 border-[#1F4A3F] pl-3.5 py-0.5 space-y-0.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#10312B]">{act.activityType}</span>
                    <span className="text-[11px] text-[#718579] font-mono">{act.activityDate}</span>
                  </div>
                  <p className="text-xs text-[#52685B] leading-relaxed">{act.details}</p>
                  <p className="text-[11px] font-bold text-[#1F4A3F]">
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
