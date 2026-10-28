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
  BookmarkCheck,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import {
  calculateNetReturn,
  calculateFarmProfitScenario,
  FarmProfitScenarioResult,
} from '@/lib/mandi/profit-calculator';
import { MP_COMMODITIES } from '@/lib/mandi/mp-mandis-data';
import { MandiPriceRecord, NetReturnBreakdown } from '@/lib/types';
import { offlineStorage, SavedProfitScenarioLocal } from '@/lib/offline/indexed-db';

export default function MandiRadarPage() {
  const { t, formatCurrency } = useI18n();

  // Filter states
  const [selectedCommodity, setSelectedCommodity] = useState<string>('Soybean');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Sehore');
  const [mandiPrices, setMandiPrices] = useState<MandiPriceRecord[]>([]);
  const [loadingPrices, setLoadingPrices] = useState<boolean>(true);
  const [isLiveFeed, setIsLiveFeed] = useState<boolean>(false);
  const [apiKeyConfigured, setApiKeyConfigured] = useState<boolean>(false);
  const [statusMessageHi, setStatusMessageHi] = useState<string>('');
  const [dataSource, setDataSource] = useState<string>('');

  // Active calculator mode
  const [calculatorMode, setCalculatorMode] = useState<'mandi_net' | 'farm_profit'>('mandi_net');

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

  // Full Farm Profit Scenario inputs
  const [scenarioTitle, setScenarioTitle] = useState<string>('सीहोर सोयाबीन खरीफ परिदृश्य');
  const [farmAreaAcres, setFarmAreaAcres] = useState<number>(8);
  const [expectedYieldQPerAcre, setExpectedYieldQPerAcre] = useState<number>(7.5);
  const [scenarioSalePrice, setScenarioSalePrice] = useState<number>(4680);
  const [cultivationCosts, setCultivationCosts] = useState<number>(80000);
  const [scenTransport, setScenTransport] = useState<number>(4500);
  const [scenHandling, setScenHandling] = useState<number>(1800);
  const [scenStorage, setScenStorage] = useState<number>(0);
  const [scenOther, setScenOther] = useState<number>(1200);
  const [scenarioResult, setScenarioResult] = useState<FarmProfitScenarioResult | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [savedScenariosList, setSavedScenariosList] = useState<SavedProfitScenarioLocal[]>([]);

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
          setIsLiveFeed(Boolean(data.isLive));
          setApiKeyConfigured(Boolean(data.apiKeyConfigured));
          setStatusMessageHi(data.statusMessageHi || '');
          setDataSource(data.dataSource || '');
          if (data.records && data.records.length > 0) {
            setCalcPrice(data.records[0].modalPrice);
            setScenarioSalePrice(data.records[0].modalPrice);
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

  // Load saved scenarios on mount
  useEffect(() => {
    setSavedScenariosList(offlineStorage.getSavedScenarios());
  }, []);

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

  // Recalculate full farm profit scenario
  useEffect(() => {
    const res = calculateFarmProfitScenario({
      cropName: selectedCommodity,
      farmAreaAcres,
      expectedYieldQPerAcre,
      salePricePerQuintal: scenarioSalePrice,
      cultivationCosts,
      transportCosts: scenTransport,
      handlingCosts: scenHandling,
      storageCosts: scenStorage,
      otherExpenses: scenOther,
    });
    setScenarioResult(res);
  }, [
    selectedCommodity,
    farmAreaAcres,
    expectedYieldQPerAcre,
    scenarioSalePrice,
    cultivationCosts,
    scenTransport,
    scenHandling,
    scenStorage,
    scenOther,
  ]);

  const handleSaveScenario = () => {
    if (!scenarioResult || !scenarioResult.isValid) return;

    const saved = offlineStorage.saveScenario({
      scenarioTitle: scenarioTitle || `${selectedCommodity} परिदृश्य`,
      cropName: selectedCommodity,
      farmAreaAcres,
      expectedYieldQPerAcre,
      harvestQuantityQuintals: scenarioResult.harvestQuantityQuintals,
      salePricePerQuintal: scenarioSalePrice,
      grossRevenue: scenarioResult.grossRevenue,
      cultivationCosts,
      transportCosts: scenTransport,
      handlingCosts: scenHandling,
      storageCosts: scenStorage,
      otherExpenses: scenOther,
      totalCosts: scenarioResult.totalCosts,
      estimatedNetReturn: scenarioResult.estimatedNetReturn,
      breakEvenPricePerQuintal: scenarioResult.breakEvenPricePerQuintal,
    });

    setSavedScenariosList(offlineStorage.getSavedScenarios());
    setSaveSuccessMsg(`परिदृश्य "${saved.scenarioTitle}" ऑफ़लाइन तिजोरी में सफलतापूर्वक सुरक्षित कर लिया गया।`);
    setTimeout(() => setSaveSuccessMsg(null), 4000);
  };

  const handleLoadSavedScenario = (sc: SavedProfitScenarioLocal) => {
    setScenarioTitle(sc.scenarioTitle);
    setSelectedCommodity(sc.cropName);
    setFarmAreaAcres(sc.farmAreaAcres);
    setExpectedYieldQPerAcre(sc.expectedYieldQPerAcre);
    setScenarioSalePrice(sc.salePricePerQuintal);
    setCultivationCosts(sc.cultivationCosts);
    setScenTransport(sc.transportCosts);
    setScenHandling(sc.handlingCosts);
    setScenStorage(sc.storageCosts);
    setScenOther(sc.otherExpenses);
    setCalculatorMode('farm_profit');
  };

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

      {/* Transparent Service Status & API Setup Instructions Banner */}
      {!apiKeyConfigured ? (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] shadow-soft space-y-2">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-[#B45309] shrink-0" />
            <h4 className="text-sm font-bold">
              आधिकारिक data.gov.in एपीआई कुंजी अनुपलब्ध (शून्य-लागत स्थानीय मोड)
            </h4>
          </div>
          <p className="text-xs leading-relaxed opacity-95">
            दैनिक एगमार्कनेट लाइव सिंक सक्रिय नहीं है। ऐप में प्रदर्शित सभी मंडी भाव केंद्रीय मध्य प्रदेश
            (सीहोर, विदिशा, इंदौर, भोपाल, उज्जैन) के **सत्यापित बेंचमार्क आंकड़े** हैं जिनका उपयोग
            कैलकुलेटर एवं परीक्षण हेतु किया जा सकता है।
          </p>
          <div className="text-[11px] pt-1 border-t border-[#FDE68A]/60 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono">
            <span>⚙️ लाइव दैनिक आवक हेतु:</span>
            <span>1. data.gov.in पर निःशुल्क रजिस्टर करें</span>
            <span>2. DATA_GOV_IN_API_KEY को .env.local में जोड़ें</span>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-[#DBF2DE]/40 border border-[#9EC2A9] text-[#10312B] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#1F4A3F]" />
            <span className="font-medium">
              आधिकारिक data.gov.in / एगमार्कनेट दैनिक विपणन बुलेटिन से लाइव सिंक सक्रिय है।
            </span>
          </div>
          <span className="text-[11px] text-[#52685B] font-mono">
            स्रोत: Ministry of Agriculture, GoI
          </span>
        </div>
      )}

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

      {/* Two Column Layout: Mandi Quotes Table & Dynamic Calculator */}
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
                      <th className="py-3 px-4">मंडी एवं प्रकार</th>
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
                            {record.district} • {record.variety} •{' '}
                            <span className="font-mono">
                              {isLiveFeed ? `आवक: ${record.arrivalDate}` : 'बेंचमार्क'}
                            </span>
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
                            onClick={() => {
                              setCalcPrice(record.modalPrice);
                              setScenarioSalePrice(record.modalPrice);
                            }}
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
                  मॉडल भाव सर्वाधिक प्रचलित सौदों को दर्शाता है। वास्तविक बोली उपज की नमी एवं गुणवत्ता पर निर्भर करती है।
                </span>
              </div>
            </CardFooter>
          </Card>

          {/* Mandi Distance Comparison Tip */}
          <div className="p-4 sm:p-5 bg-[#EAF4E8] rounded-2xl border border-[#DCE9DD] text-xs text-[#52685B] space-y-2">
            <h4 className="font-bold text-[#10312B] flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#1F4A3F]" />
              <span>मंडी दूरी व परिवहन का अर्थशास्त्र:</span>
            </h4>
            <p className="leading-relaxed">
              सीहोर से इंदौर मंडी (~155 किमी) जाने में प्रति ट्रॉली लगभग ₹6,000 से ₹8,000 का अतिरिक्त भाड़ा लगता है।
              यदि इंदौर में मॉडल भाव सीहोर से कम से कम **₹250/क्विंटल अधिक** हो, तभी वहाँ उपज ले जाना लाभकारी है।
            </p>
          </div>

          {/* Saved Scenarios Vault */}
          {savedScenariosList.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-bold text-[#10312B] flex items-center gap-2">
                  <BookmarkCheck className="w-4 h-4 text-[#1F4A3F]" />
                  <span>सहेजे गए परिदृश्य (ऑफ़लाइन तिजोरी)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-[#DCE9DD] text-xs">
                  {savedScenariosList.map((sc) => (
                    <div
                      key={sc.id}
                      className="p-4 flex items-center justify-between hover:bg-[#EAF4E8]/40 transition-colors"
                    >
                      <div>
                        <div className="font-bold text-[#10312B]">{sc.scenarioTitle}</div>
                        <div className="text-[11px] text-[#52685B] mt-0.5">
                          {sc.farmAreaAcres} एकड़ • {sc.harvestQuantityQuintals} क्विंटल @ {formatCurrency(sc.salePricePerQuintal)} • ब्रेक-ईवन: {formatCurrency(sc.breakEvenPricePerQuintal)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#10312B] mr-2">
                          {formatCurrency(sc.estimatedNetReturn)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLoadSavedScenario(sc)}
                        >
                          लोड करें
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Dynamic Calculator (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border-[#DCE9DD] shadow-card">
            <CardHeader className="bg-gradient-to-r from-[#10312B] to-[#1F4A3F] text-white">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white text-base flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-[#DBF2DE]" />
                    <span>कैलकुलेटर उपकरण</span>
                  </CardTitle>
                  <CardDescription className="text-[#DBF2DE]/80 text-xs mt-0.5">
                    {calculatorMode === 'mandi_net'
                      ? 'सकल बिक्री से मंडी खर्च घटाकर शुद्ध आय'
                      : 'लागत, उपज, ब्रेक-ईवन एवं शुद्ध कृषि मुनाफा'}
                  </CardDescription>
                </div>
              </div>

              {/* Mode Toggle Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/10">
                <button
                  onClick={() => setCalculatorMode('mandi_net')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-colors ${
                    calculatorMode === 'mandi_net'
                      ? 'bg-[#DBF2DE] text-[#092622]'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  मंडी शुद्ध आय
                </button>
                <button
                  onClick={() => setCalculatorMode('farm_profit')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-colors ${
                    calculatorMode === 'farm_profit'
                      ? 'bg-[#DBF2DE] text-[#092622]'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  कृषि लाभ व ब्रेक-ईवन
                </button>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              {calculatorMode === 'mandi_net' ? (
                <>
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
                </>
              ) : (
                <>
                  {/* Full Farm Profit & Break-Even Mode */}
                  <div className="p-3 bg-[#EAF4E8] rounded-xl text-[11px] text-[#10312B] border border-[#DCE9DD] space-y-1">
                    <p className="font-bold">प्रमाणित कृषि अर्थशास्त्र सूत्र:</p>
                    <p className="font-mono text-[10px]">
                      • कुल उपज (क्विंटल) = रकबा (एकड़) × उत्पादकता (क्विंटल/एकड़)
                    </p>
                    <p className="font-mono text-[10px]">
                      • सकल आय = कुल उपज × विक्रय मूल्य
                    </p>
                    <p className="font-mono text-[10px]">
                      • ब्रेक-ईवन भाव = कुल लागत ÷ कुल उपज
                    </p>
                  </div>

                  <Input
                    label="परिदृश्य का नाम"
                    value={scenarioTitle}
                    onChange={(e) => setScenarioTitle(e.target.value)}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="खेत का रकबा (एकड़)"
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={farmAreaAcres}
                      onChange={(e) => setFarmAreaAcres(Number(e.target.value))}
                    />
                    <Input
                      label="अपेक्षित उपज (क्विंटल/एकड़)"
                      type="number"
                      min="0"
                      step="0.5"
                      value={expectedYieldQPerAcre}
                      onChange={(e) => setExpectedYieldQPerAcre(Number(e.target.value))}
                    />
                  </div>

                  <Input
                    label="अपेक्षित विक्रय मूल्य (₹/क्विंटल)"
                    type="number"
                    min="100"
                    value={scenarioSalePrice}
                    onChange={(e) => setScenarioSalePrice(Number(e.target.value))}
                  />

                  <div className="pt-2 border-t border-[#DCE9DD] space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#52685B] block">
                      खेती व विपणन लागत (₹)
                    </span>

                    <Input
                      label="खेती की लागत (बीज, खाद, जुताई, मजदूरी) (₹)"
                      type="number"
                      min="0"
                      value={cultivationCosts}
                      onChange={(e) => setCultivationCosts(Number(e.target.value))}
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="परिवहन भाड़ा (₹)"
                        type="number"
                        min="0"
                        value={scenTransport}
                        onChange={(e) => setScenTransport(Number(e.target.value))}
                      />
                      <Input
                        label="तुलाई व हम्माली (₹)"
                        type="number"
                        min="0"
                        value={scenHandling}
                        onChange={(e) => setScenHandling(Number(e.target.value))}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        label="वेयरहाउस/भंडारण (₹)"
                        type="number"
                        min="0"
                        value={scenStorage}
                        onChange={(e) => setScenStorage(Number(e.target.value))}
                      />
                      <Input
                        label="अन्य आकस्मिक खर्च (₹)"
                        type="number"
                        min="0"
                        value={scenOther}
                        onChange={(e) => setScenOther(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  {/* Calculations Output */}
                  {scenarioResult && scenarioResult.isValid && (
                    <div className="p-4 rounded-xl bg-[#EAF4E8] border border-[#DCE9DD] space-y-2.5">
                      <div className="flex items-center justify-between text-xs text-[#52685B]">
                        <span>अनुमानित कुल उपज:</span>
                        <span className="font-bold text-[#10312B]">
                          {scenarioResult.harvestQuantityQuintals} क्विंटल
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-[#52685B]">
                        <span>सकल अनुमानित आय:</span>
                        <span className="font-bold text-[#10312B]">
                          {formatCurrency(scenarioResult.grossRevenue)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-[#B91C1C]">
                        <span>कुल लागत (खेती + मंडी):</span>
                        <span className="font-bold">
                          −{formatCurrency(scenarioResult.totalCosts)}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-lg bg-white border border-[#DCE9DD] flex items-center justify-between text-xs">
                        <span className="font-bold text-[#52685B]">
                          लागत वसूली भाव (Break-Even):
                        </span>
                        <span className="font-black text-[#1F4A3F] text-sm">
                          {formatCurrency(scenarioResult.breakEvenPricePerQuintal)}/क्विंटल
                        </span>
                      </div>

                      <div className="pt-2 border-t border-[#DCE9DD] flex items-baseline justify-between">
                        <div>
                          <span className="text-xs font-bold text-[#10312B] uppercase block">
                            अनुमानित शुद्ध लाभ:
                          </span>
                          <span className="text-[11px] text-[#52685B]">
                            लाभ मार्जिन: {scenarioResult.profitMarginPercent}%
                          </span>
                        </div>
                        <span
                          className={`text-2xl font-black ${
                            scenarioResult.estimatedNetReturn >= 0
                              ? 'text-[#1F4A3F]'
                              : 'text-[#B91C1C]'
                          }`}
                        >
                          {formatCurrency(scenarioResult.estimatedNetReturn)}
                        </span>
                      </div>

                      <Button
                        variant="primary"
                        size="md"
                        onClick={handleSaveScenario}
                        className="w-full mt-2 gap-2"
                      >
                        <BookmarkCheck className="w-4 h-4" />
                        <span>यह परिदृश्य तिजोरी में सहेजें</span>
                      </Button>

                      {saveSuccessMsg && (
                        <div className="p-2 bg-[#DBF2DE] text-[#092622] rounded-lg text-xs font-semibold text-center border border-[#9EC2A9]">
                          {saveSuccessMsg}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Statutory Disclaimers */}
      <div className="p-4 bg-white rounded-2xl border border-[#DCE9DD] text-xs text-[#52685B] space-y-1.5 shadow-soft">
        <h5 className="font-bold text-[#10312B] flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#1F4A3F]" />
          <span>पारदर्शिता एवं कानूनी अस्वीकरण:</span>
        </h5>
        <p className="leading-relaxed">
          1. **कोई गारंटीकृत आय नहीं:** यह कैलकुलेटर किसान द्वारा दर्ज अनुमानित उपज और लागत पर आधारित गणितीय निर्णय-सहायता उपकरण है। मौसम, कीट-रोग व दैनिक बाजार उतार-चढ़ाव के कारण वास्तविक आय में अंतर हो सकता है।
        </p>
        <p className="leading-relaxed">
          2. **दैनिक आंकड़ों की प्रकृति:** data.gov.in / एगमार्कनेट द्वारा जारी आंकड़े दैनिक व्यापार समापन के पश्चात संकलित रिपोर्ट होते हैं, यह कोई सेकंड-दर-सेकंड शेयर-मार्केट जैसी लाइव ट्रेडिंग टिकर नहीं है।
        </p>
      </div>
    </div>
  );
}
