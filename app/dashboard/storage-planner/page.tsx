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
  Warehouse,
  ShieldCheck,
} from 'lucide-react';
import { calculateStorageScenario } from '@/lib/storage/scenario-calculator';
import { StorageScenarioResult } from '@/lib/types';
import { MP_COMMODITIES } from '@/lib/mandi/mp-mandis-data';

export default function StoragePlannerPage() {
  const { t, formatCurrency } = useI18n();

  const [cropName, setCropName] = useState<string>('Soybean');
  const [quantity, setQuantity] = useState<number>(100);
  const [currentPrice, setCurrentPrice] = useState<number>(4680);
  const [storageMonths, setStorageMonths] = useState<number>(4);
  const [storageFeePerMonth, setStorageFeePerMonth] = useState<number>(25);
  const [expectedFuturePrice, setExpectedFuturePrice] = useState<number>(5300);
  const [weightLossRate, setWeightLossRate] = useState<number>(2.0);
  const [transportCostNow, setTransportCostNow] = useState<number>(3000);
  const [transportCostLater, setTransportCostLater] = useState<number>(3500);

  const [result, setResult] = useState<StorageScenarioResult>(() =>
    calculateStorageScenario({
      cropName: 'Soybean',
      quantityQuintals: 100,
      currentMandiPrice: 4680,
      storageDurationMonths: 4,
      storageCostPerMonthPerQuintal: 25,
      expectedFuturePrice: 5300,
      storageWeightLossRatePercent: 2.0,
      transportHandlingCostNow: 3000,
      transportHandlingCostLater: 3500,
    })
  );

  useEffect(() => {
    const res = calculateStorageScenario({
      cropName,
      quantityQuintals: quantity,
      currentMandiPrice: currentPrice,
      storageDurationMonths: storageMonths,
      storageCostPerMonthPerQuintal: storageFeePerMonth,
      expectedFuturePrice,
      storageWeightLossRatePercent: weightLossRate,
      transportHandlingCostNow: transportCostNow,
      transportHandlingCostLater: transportCostLater,
    });
    setResult(res);
  }, [
    cropName,
    quantity,
    currentPrice,
    storageMonths,
    storageFeePerMonth,
    expectedFuturePrice,
    weightLossRate,
    transportCostNow,
    transportCostLater,
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={t.storage.title}
        subtitle={t.storage.subtitle}
        icon={<Warehouse className="w-5 h-5 text-[#1F4A3F]" />}
        badge={
          <Badge variant="mint">
            वित्तीय सिमुलेटर (खर्च व वजन घटौती सहित)
          </Badge>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scenario Input Parameters (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-[#10312B]">भंडारण व वित्तीय मापदंड</CardTitle>
              <CardDescription>
                वेयरहाउस शुल्क, समय और भविष्य के भाव की प्रविष्टि
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                label="फसल / उपज (Crop)"
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
              >
                {MP_COMMODITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="कुल मात्रा (क्विंटल)"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
                <Input
                  label="आज का भाव (₹/Q)"
                  type="number"
                  min="100"
                  value={currentPrice}
                  onChange={(e) => setCurrentPrice(Number(e.target.value))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#DCE9DD]">
                <Input
                  label="अवधि (महीने)"
                  type="number"
                  min="1"
                  max="12"
                  value={storageMonths}
                  onChange={(e) => setStorageMonths(Number(e.target.value))}
                  helperText="उदा. 3 से 6 महीने"
                />
                <Input
                  label="किराया (₹/Q/माह)"
                  type="number"
                  min="0"
                  value={storageFeePerMonth}
                  onChange={(e) => setStorageFeePerMonth(Number(e.target.value))}
                  helperText="म.प्र. मानक: ₹20-30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#DCE9DD]">
                <Input
                  label="अपेक्षित भविष्य का भाव (₹/Q)"
                  type="number"
                  min="100"
                  value={expectedFuturePrice}
                  onChange={(e) => setExpectedFuturePrice(Number(e.target.value))}
                  helperText="ऑफ-सीजन में अपेक्षित दर"
                />
                <Input
                  label="वजन घटौती (%)"
                  type="number"
                  step="0.5"
                  min="0"
                  max="10"
                  value={weightLossRate}
                  onChange={(e) => setWeightLossRate(Number(e.target.value))}
                  helperText="मानक: 1.5% - 3%"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#DCE9DD]">
                <Input
                  label="आज बेचने पर भाड़ा (₹)"
                  type="number"
                  min="0"
                  value={transportCostNow}
                  onChange={(e) => setTransportCostNow(Number(e.target.value))}
                />
                <Input
                  label="भविष्य में भाड़ा (₹)"
                  type="number"
                  min="0"
                  value={transportCostLater}
                  onChange={(e) => setTransportCostLater(Number(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Output & Sensitivity Analysis (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Verdict Card */}
          <Card
            className={`border-2 ${
              result.verdict === 'Store Produce'
                ? 'border-[#9EC2A9] bg-[#EAF4E8]/50 shadow-soft'
                : result.verdict === 'Sell Now'
                ? 'border-[#FECACA] bg-[#FEE2E2]/30 shadow-soft'
                : 'border-[#FDE68A] bg-[#FEF3C7]/30 shadow-soft'
            }`}
          >
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#52685B] block">
                    आर्थिक निर्णय विश्लेषण (Financial Recommendation)
                  </span>
                  <CardTitle className="text-xl mt-1 text-[#10312B]">
                    {result.verdict === 'Store Produce'
                      ? 'उपज का भंडारण करना लाभकारी है'
                      : result.verdict === 'Sell Now'
                      ? 'वर्तमान भाव पर बेचना अधिक सुरक्षित है'
                      : 'लाभ और खर्च लगभग बराबर हैं'}
                  </CardTitle>
                </div>
                <Badge
                  variant={
                    result.verdict === 'Store Produce'
                      ? 'mint'
                      : result.verdict === 'Sell Now'
                      ? 'critical'
                      : 'warning'
                  }
                  size="md"
                >
                  {result.verdict === 'Store Produce'
                    ? 'भंडारण अनुशंसित'
                    : result.verdict === 'Sell Now'
                    ? 'तुरंत बेचें'
                    : 'तटस्थ / जोखिमपूर्ण'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-xs sm:text-sm text-[#10312B] leading-relaxed font-medium">
                {result.verdictReason}
              </p>

              {/* Side by side comparison */}
              <div className="grid grid-cols-2 gap-4 pt-1">
                {/* Scenario A: Sell Now */}
                <div className="p-4 rounded-2xl bg-white border border-[#DCE9DD] space-y-1 shadow-soft">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#52685B] block">
                    विकल्प 1: आज तुरंत बेचना
                  </span>
                  <div className="text-xl font-black text-[#10312B]">
                    {formatCurrency(result.sellNowNetRevenue)}
                  </div>
                  <p className="text-[11px] text-[#718579]">
                    सकल: {formatCurrency(result.sellNowGrossRevenue)} (− भाड़ा)
                  </p>
                </div>

                {/* Scenario B: Store and Sell Later */}
                <div className="p-4 rounded-2xl bg-white border border-[#DCE9DD] space-y-1 shadow-soft">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#1F4A3F] block">
                    विकल्प 2: {storageMonths} माह बाद बेचना
                  </span>
                  <div className="text-xl font-black text-[#10312B]">
                    {formatCurrency(result.storeSellLaterNetRevenue)}
                  </div>
                  <p className="text-[11px] text-[#52685B]">
                    शुद्ध लाभ: {result.netGainOrLoss >= 0 ? '+' : ''}
                    {formatCurrency(result.netGainOrLoss)} ({result.percentageReturn}%)
                  </p>
                </div>
              </div>

              {/* Expense & Loss Deductions Breakdown */}
              <div className="p-4 bg-white rounded-2xl border border-[#DCE9DD] text-xs text-[#52685B] space-y-2 shadow-soft">
                <div className="flex items-center justify-between">
                  <span>कुल वेयरहाउस किराया ({storageMonths} माह):</span>
                  <span className="font-semibold text-[#10312B]">
                    {formatCurrency(result.totalStorageCharges)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>वजन घटौती (नमी ह्रास {weightLossRate}%):</span>
                  <span className="font-semibold text-[#10312B]">
                    −{result.weightLossDeductionQuintals} क्विंटल (बची उपज:{' '}
                    {result.finalSalableQuantityQuintals} Q)
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-[#DCE9DD] text-[#10312B] font-bold">
                  <span>न्यूनतम आवश्यक ब्रेक-इवन भाव:</span>
                  <span className="text-base font-black text-[#10312B]">
                    {formatCurrency(result.breakEvenFuturePrice)} / क्विंटल
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="text-[11px] text-[#52685B] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#1F4A3F]" />
                <span>
                  ब्रेक-इवन भाव से कम मिलने पर भंडारण से शुद्ध घाटा होगा। बाजार उतार-चढ़ाव को
                  ध्यान में रखकर ही अनाज रोकें।
                </span>
              </div>
            </CardFooter>
          </Card>

          {/* Sensitivity Analysis Table */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-[#10312B]">संवेदनशीलता विश्लेषण (Sensitivity Table)</CardTitle>
              <CardDescription>
                विभिन्न भविष्य के भावों पर आपका अनुमानित शुद्ध लाभ अथवा हानि
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#EAF4E8]/60 border-b border-[#DCE9DD] font-bold text-[#52685B] uppercase tracking-wider">
                    <th className="py-2.5 px-4">परिदृश्य</th>
                    <th className="py-2.5 px-4 text-right">भविष्य का भाव</th>
                    <th className="py-2.5 px-4 text-right">शुद्ध अतिरिक्त लाभ / हानि</th>
                    <th className="py-2.5 px-4 text-right">रिटर्न (ROI %)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DCE9DD]/70">
                  {result.sensitivityTable.map((row, idx) => (
                    <tr
                      key={idx}
                      className={
                        row.priceScenarioLabel.includes('Baseline')
                          ? 'bg-[#DBF2DE]/30 font-semibold'
                          : 'hover:bg-[#EAF4E8]/40'
                      }
                    >
                      <td className="py-2.5 px-4 text-[#10312B]">{row.priceScenarioLabel}</td>
                      <td className="py-2.5 px-4 text-right font-medium text-[#10312B]">
                        {formatCurrency(row.futurePrice)}
                      </td>
                      <td
                        className={`py-2.5 px-4 text-right font-bold ${
                          row.netGain >= 0 ? 'text-[#236B38]' : 'text-[#B91C1C]'
                        }`}
                      >
                        {row.netGain >= 0 ? '+' : ''}
                        {formatCurrency(row.netGain)}
                      </td>
                      <td
                        className={`py-2.5 px-4 text-right font-medium ${
                          row.roiPercent >= 0 ? 'text-[#236B38]' : 'text-[#B91C1C]'
                        }`}
                      >
                        {row.roiPercent >= 0 ? '+' : ''}
                        {row.roiPercent}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
