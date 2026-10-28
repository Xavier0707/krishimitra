'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  Calculator,
  Truck,
  ArrowRight,
  ShieldCheck,
  Scale,
  DollarSign,
  Info,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { calculateNetReturn } from '@/lib/mandi/profit-calculator';
import { MP_COMMODITIES, MP_MANDIS } from '@/lib/mandi/mp-mandis-data';
import { MandiPriceRecord, NetReturnBreakdown } from '@/lib/types';

export default function MandiRadarPage() {
  const { t, formatCurrency, formatNumber } = useI18n();

  // Filter states
  const [selectedCommodity, setSelectedCommodity] = useState<string>('Soybean');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Sehore');
  const [mandiPrices, setMandiPrices] = useState<MandiPriceRecord[]>([]);
  const [loadingPrices, setLoadingPrices] = useState<boolean>(true);
  const [isLiveFeed, setIsLiveFeed] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<string>('');

  // Net return calculator inputs
  const [calcQuantity, setCalcQuantity] = useState<number>(50);
  const [calcUnit, setCalcUnit] = useState<'quintal' | 'kg' | 'ton'>('quintal');
  const [calcPrice, setCalcPrice] = useState<number>(4680);
  const [transportCost, setTransportCost] = useState<number>(2000);
  const [handlingCost, setHandlingCost] = useState<number>(1000);
  const [storageCost, setStorageCost] = useState<number>(0);
  const [packagingCost, setPackagingCost] = useState<number>(800);
  const [otherCost, setOtherCost] = useState<number>(400);
  const [calcResult, setCalcResult] = useState<NetReturnBreakdown | null>(null);

  // Fetch prices on filter change
  useEffect(() => {
    async function loadPrices() {
      setLoadingPrices(true);
      try {
        const res = await fetch(
          `/api/mandi?district=${encodeURIComponent(selectedDistrict)}&commodity=${encodeURIComponent(
            selectedCommodity
          )}`
        );
        if (res.ok) {
          const data = await res.json();
          setMandiPrices(data.records || []);
          setIsLiveFeed(data.isLive);
          setDataSource(data.dataSource);
          if (data.records && data.records.length > 0) {
            setCalcPrice(data.records[0].modalPrice);
          }
        }
      } catch {
        // ignore
      } finally {
        setLoadingPrices(false);
      }
    }
    loadPrices();
  }, [selectedCommodity, selectedDistrict]);

  // Recalculate net return whenever inputs change
  useEffect(() => {
    const res = calculateNetReturn({
      quantity: calcQuantity,
      quantityUnit: calcUnit,
      expectedSellingPrice: calcPrice,
      transportCost,
      handlingLaborCost: handlingCost,
      mandiCommissionCess: 0,
      storageCost,
      packagingBagsCost: packagingCost,
      otherExpenses: otherCost,
    });
    setCalcResult(res);
  }, [
    calcQuantity,
    calcUnit,
    calcPrice,
    transportCost,
    handlingCost,
    storageCost,
    packagingCost,
    otherCost,
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-forest-950 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-agri-600" />
            <span>{t.mandi.title}</span>
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-600 mt-0.5">
            {t.mandi.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={isLiveFeed ? 'agri' : 'demo'}>
            {isLiveFeed ? 'Agmarknet Live API' : 'सत्यापित एमपी मंडी बेंचमार्क'}
          </Badge>
        </div>
      </div>

      {/* Filter Row */}
      <Card>
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="फसल / जिंस (Commodity)"
            value={selectedCommodity}
            onChange={(e) => setSelectedCommodity(e.target.value)}
          >
            {MP_COMMODITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>

          <Select
            label="जिला (District)"
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
          >
            <option value="All">सभी जिले (All Districts)</option>
            <option value="Sehore">सीहोर (Sehore)</option>
            <option value="Bhopal">भोपाल (Bhopal)</option>
            <option value="Indore">इंदौर (Indore)</option>
            <option value="Ujjain">उज्जैन (Ujjain)</option>
            <option value="Vidisha">विदिशा (Vidisha)</option>
            <option value="Hoshangabad">होशंगाबाद / नर्मदापुरम</option>
            <option value="Dewas">देवास (Dewas)</option>
            <option value="Sagar">सागर (Sagar)</option>
          </Select>

          <div className="flex items-end">
            <Button
              variant="outline"
              size="md"
              className="w-full gap-2 text-charcoal-700"
              onClick={() => {
                setSelectedDistrict('Sehore');
                setSelectedCommodity('Soybean');
              }}
            >
              <RefreshCw className="w-4 h-4" />
              <span>डिफ़ॉल्ट रिसेट करें</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout: Mandi Quotes Table & Net Return Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Mandi Prices List (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="text-base">
                  मंडी भाव उद्धरण ({selectedCommodity})
                </CardTitle>
                <CardDescription>
                  {dataSource || 'Agmarknet / MP Mandi Board Official Records'}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              {loadingPrices ? (
                <div className="p-8 text-center text-charcoal-500 text-sm">
                  मंडी भाव लोड हो रहे हैं...
                </div>
              ) : mandiPrices.length === 0 ? (
                <div className="p-8 text-center text-charcoal-500 text-sm">
                  चयनित फिल्टर के लिए कोई रिकॉर्ड नहीं मिला। कृपया दूसरा जिला चुनें।
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-cream-100/70 border-b border-charcoal-200 text-xs font-bold text-charcoal-700 uppercase tracking-wider">
                      <th className="py-3 px-4">मंडी</th>
                      <th className="py-3 px-3 text-right">न्यूनतम</th>
                      <th className="py-3 px-3 text-right">मॉडल भाव</th>
                      <th className="py-3 px-3 text-right">अधिकतम</th>
                      <th className="py-3 px-3 text-center">कार्रवाई</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal-100 text-charcoal-800">
                    {mandiPrices.map((record) => (
                      <tr
                        key={record.id}
                        className="hover:bg-cream-50/70 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span className="font-bold text-charcoal-900 block">
                            {record.marketName}
                          </span>
                          <span className="text-[11px] text-charcoal-500">
                            {record.district} • {record.variety}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right text-charcoal-600">
                          {formatCurrency(record.minPrice)}
                        </td>
                        <td className="py-3 px-3 text-right font-black text-agri-700 text-base">
                          {formatCurrency(record.modalPrice)}
                        </td>
                        <td className="py-3 px-3 text-right text-charcoal-600">
                          {formatCurrency(record.maxPrice)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => setCalcPrice(record.modalPrice)}
                            className="px-2 py-1 text-[11px] font-semibold rounded bg-cream-200 hover:bg-forest-800 hover:text-white text-forest-900 transition-colors"
                          >
                            कैलकुलेटर में लें
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
            <CardFooter>
              <div className="text-[11px] text-charcoal-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-agri-600" />
                <span>
                  न्यूनतम, मॉडल व अधिकतम भाव में अंतर रहता है। मॉडल भाव सर्वाधिक सौदों का
                  प्रतिनिधित्व करता है।
                </span>
              </div>
            </CardFooter>
          </Card>

          {/* Mandi Distance Comparison Tip */}
          <div className="p-4 bg-cream-100 rounded-xl border border-charcoal-200/80 text-xs text-charcoal-700 space-y-1.5">
            <h4 className="font-bold text-charcoal-900 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-forest-800" />
              <span>मंडी चयन सुझाव:</span>
            </h4>
            <p className="leading-relaxed">
              सीहोर से इंदौर मंडी (~155 किमी) जाने में प्रति ट्रॉली लगभग ₹6,000 से ₹8,000 का
              अतिरिक्त भाड़ा लगता है। यदि इंदौर में मॉडल भाव सीहोर से कम से कम ₹250/क्विंटल
              अधिक हो, तभी वहाँ उपज ले जाना आर्थिक रूप से लाभप्रद है।
            </p>
          </div>
        </div>

        {/* Net Return Calculator (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-forest-700/30 shadow-md">
            <CardHeader className="bg-forest-900 text-white">
              <div>
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-agri-400" />
                  <span>{t.mandi.calculatorTitle}</span>
                </CardTitle>
                <CardDescription className="text-forest-200 text-xs mt-0.5">
                  सकल बिक्री से सभी मंडी खर्च घटाकर शुद्ध हाथ में आने वाली राशि
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {/* Formula note */}
              <div className="p-2.5 bg-cream-100 rounded-lg text-[11px] font-mono text-charcoal-700 border border-charcoal-200">
                {t.mandi.calcExplainer}
              </div>

              {/* Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="मात्रा (Quantity)"
                  type="number"
                  min="1"
                  value={calcQuantity}
                  onChange={(e) => setCalcQuantity(Number(e.target.value))}
                />
                <Select
                  label="इकाई (Unit)"
                  value={calcUnit}
                  onChange={(e) => setCalcUnit(e.target.value as 'quintal' | 'kg' | 'ton')}
                >
                  <option value="quintal">क्विंटल (Quintal)</option>
                  <option value="kg">किलोग्राम (Kg)</option>
                  <option value="ton">टन (Ton)</option>
                </Select>
              </div>

              <Input
                label="अपेक्षित विक्रय मूल्य (₹/क्विंटल)"
                type="number"
                min="100"
                value={calcPrice}
                onChange={(e) => setCalcPrice(Number(e.target.value))}
                helperText="चयनित मंडी का मॉडल भाव या आपकी अपनी उम्मीद"
              />

              <div className="pt-2 border-t border-charcoal-100 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-charcoal-700 block">
                  परिवहन एवं मंडी विपणन खर्च (कटौतियां)
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="ट्रॉली/गाड़ी भाड़ा (₹)"
                    type="number"
                    min="0"
                    value={transportCost}
                    onChange={(e) => setTransportCost(Number(e.target.value))}
                  />
                  <Input
                    label="तुलाई व हम्माली (₹)"
                    type="number"
                    min="0"
                    value={handlingCost}
                    onChange={(e) => setHandlingCost(Number(e.target.value))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="बोरी/बारदाना खर्च (₹)"
                    type="number"
                    min="0"
                    value={packagingCost}
                    onChange={(e) => setPackagingCost(Number(e.target.value))}
                  />
                  <Input
                    label="अन्य आकस्मिक खर्च (₹)"
                    type="number"
                    min="0"
                    value={otherCost}
                    onChange={(e) => setOtherCost(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Breakdown Output Box */}
              {calcResult && (
                <div className="p-4 rounded-xl bg-forest-50 border border-forest-200/80 space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-charcoal-700">
                    <span>सकल बिक्री (Gross Sales):</span>
                    <span className="font-semibold text-charcoal-900">
                      {formatCurrency(calcResult.grossRevenue)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-rose-700">
                    <span>कुल मंडी खर्च व भाड़ा (−):</span>
                    <span className="font-semibold">
                      −{formatCurrency(calcResult.totalMarketingExpenses)}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-forest-200 flex items-baseline justify-between">
                    <div>
                      <span className="text-xs font-bold text-forest-900 uppercase block">
                        हाथ में शुद्ध आय (In-Hand):
                      </span>
                      <span className="text-[11px] text-forest-700">
                        प्रभावी भाव: {formatCurrency(Math.round(calcResult.effectivePricePerQuintal))}/क्विंटल
                      </span>
                    </div>
                    <span className="text-2xl font-black text-forest-900">
                      {formatCurrency(calcResult.netProceeds)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
