'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
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
  RefreshCw,
  Scale,
} from 'lucide-react';
import { calculateNetReturn } from '@/lib/mandi/profit-calculator';
import { MP_COMMODITIES } from '@/lib/mandi/mp-mandis-data';
import { MandiPriceRecord, NetReturnBreakdown } from '@/lib/types';

export default function MandiRadarPage() {
  const { t, formatCurrency } = useI18n();

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
      <PageHeader
        title={t.mandi.title}
        subtitle={t.mandi.subtitle}
        icon={<TrendingUp className="w-5 h-5 text-[#1F4A3F]" />}
        badge={
          <Badge variant={isLiveFeed ? 'mint' : 'demo'}>
            {isLiveFeed ? 'Agmarknet Live API' : 'सत्यापित एमपी मंडी बेंचमार्क'}
          </Badge>
        }
      />

      {/* Filter Row */}
      <Card>
        <CardContent className="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              className="w-full gap-2 text-[#52685B] hover:text-[#10312B]"
              onClick={() => {
                setSelectedDistrict('Sehore');
                setSelectedCommodity('Soybean');
              }}
            >
              <RefreshCw className="w-4 h-4 text-[#52685B]" />
              <span>डिफ़ॉल्ट रीसेट करें</span>
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
                <CardTitle className="text-base text-[#10312B]">
                  मंडी भाव उद्धरण ({selectedCommodity})
                </CardTitle>
                <CardDescription>
                  {dataSource || 'Agmarknet / MP Mandi Board Official Records'}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              {loadingPrices ? (
                <div className="p-8 text-center text-[#52685B] text-sm">
                  मंडी भाव लोड हो रहे हैं...
                </div>
              ) : mandiPrices.length === 0 ? (
                <div className="p-8 text-center text-[#52685B] text-sm">
                  चयनित फिल्टर के लिए कोई रिकॉर्ड नहीं मिला। कृपया दूसरा जिला चुनें।
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-[#EAF4E8]/60 border-b border-[#DCE9DD] text-xs font-bold text-[#52685B] uppercase tracking-wider">
                      <th className="py-3 px-4">मंडी</th>
                      <th className="py-3 px-3 text-right">न्यूनतम</th>
                      <th className="py-3 px-3 text-right">मॉडल भाव</th>
                      <th className="py-3 px-3 text-right">अधिकतम</th>
                      <th className="py-3 px-3 text-center">कार्रवाई</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DCE9DD]/70 text-[#10312B]">
                    {mandiPrices.map((record) => (
                      <tr
                        key={record.id}
                        className="hover:bg-[#EAF4E8]/40 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span className="font-bold text-[#10312B] block">
                            {record.marketName}
                          </span>
                          <span className="text-[11px] text-[#52685B]">
                            {record.district} • {record.variety}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right text-[#52685B]">
                          {formatCurrency(record.minPrice)}
                        </td>
                        <td className="py-3 px-3 text-right font-black text-[#10312B] text-base">
                          {formatCurrency(record.modalPrice)}
                        </td>
                        <td className="py-3 px-3 text-right text-[#52685B]">
                          {formatCurrency(record.maxPrice)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            onClick={() => setCalcPrice(record.modalPrice)}
                            className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-[#EAF4E8] hover:bg-[#1F4A3F] hover:text-white text-[#10312B] transition-colors border border-[#DCE9DD]"
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
              <div className="text-[11px] text-[#52685B] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1F4A3F]" />
                <span>
                  न्यूनतम, मॉडल व अधिकतम भाव में अंतर रहता है। मॉडल भाव सर्वाधिक सौदों का
                  प्रतिनिधित्व करता है।
                </span>
              </div>
            </CardFooter>
          </Card>

          {/* Mandi Distance Comparison Tip */}
          <div className="p-4 sm:p-5 bg-[#EAF4E8] rounded-2xl border border-[#DCE9DD] text-xs text-[#52685B] space-y-2">
            <h4 className="font-bold text-[#10312B] flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#1F4A3F]" />
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
          <Card className="border-[#DCE9DD] shadow-card">
            <CardHeader className="bg-gradient-to-r from-[#10312B] to-[#1F4A3F] text-white">
              <div>
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-[#DBF2DE]" />
                  <span>{t.mandi.calculatorTitle}</span>
                </CardTitle>
                <CardDescription className="text-[#DBF2DE]/80 text-xs mt-0.5">
                  सकल बिक्री से सभी मंडी खर्च घटाकर शुद्ध हाथ में आने वाली राशि
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {/* Formula note */}
              <div className="p-3 bg-[#EAF4E8] rounded-xl text-[11px] font-mono text-[#10312B] border border-[#DCE9DD]">
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

              <div className="pt-2 border-t border-[#DCE9DD] space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#52685B] block">
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
                <div className="p-4 rounded-xl bg-[#EAF4E8] border border-[#DCE9DD] space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-[#52685B]">
                    <span>सकल बिक्री (Gross Sales):</span>
                    <span className="font-semibold text-[#10312B]">
                      {formatCurrency(calcResult.grossRevenue)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#B91C1C]">
                    <span>कुल मंडी खर्च व भाड़ा (−):</span>
                    <span className="font-semibold">
                      −{formatCurrency(calcResult.totalMarketingExpenses)}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-[#DCE9DD] flex items-baseline justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#10312B] uppercase block">
                        हाथ में शुद्ध आय (In-Hand):
                      </span>
                      <span className="text-[11px] text-[#52685B]">
                        प्रभावी भाव: {formatCurrency(Math.round(calcResult.effectivePricePerQuintal))}/क्विंटल
                      </span>
                    </div>
                    <span className="text-2xl font-black text-[#10312B]">
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
