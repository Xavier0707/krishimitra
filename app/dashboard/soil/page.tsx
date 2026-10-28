'use client';

import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  FlaskConical,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Sprout,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import { INITIAL_DEMO_SOIL } from '@/lib/demo/demo-state';
import { SoilTestResult, CropSuitabilityAssessment } from '@/lib/types';
import { evaluateCropSuitability, interpretNutrient, SOIL_STANDARDS } from '@/lib/soil/guidance';

export default function SoilIntelligencePage() {
  const { t } = useI18n();

  const [soilData, setSoilData] = useState<SoilTestResult>(INITIAL_DEMO_SOIL);
  const [evaluating, setEvaluating] = useState<boolean>(false);
  const [suitabilityList, setSuitabilityList] = useState<CropSuitabilityAssessment[]>(() =>
    evaluateCropSuitability(INITIAL_DEMO_SOIL)
  );

  const handleRecalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setEvaluating(true);
    setTimeout(() => {
      const results = evaluateCropSuitability(soilData);
      setSuitabilityList(results);
      setEvaluating(false);
    }, 250);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-forest-950 flex items-center gap-2">
            <FlaskConical className="w-6 h-6 text-forest-700" />
            <span>{t.soil.title}</span>
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-600 mt-0.5">
            {t.soil.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="demo">
            सत्यापित KVK लैब रिपोर्ट: {soilData.sampleId}
          </Badge>
        </div>
      </div>

      {/* Lab Report Metadata Banner */}
      <Card className="bg-cream-100/70 border-charcoal-200">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-charcoal-700">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-forest-800 shrink-0" />
            <div>
              <p className="font-bold text-sm text-charcoal-900">
                मृदा स्वास्थ्य कार्ड (Soil Health Card)
              </p>
              <p className="text-charcoal-500">
                परीक्षण प्रयोगशाला: {soilData.labName} • जांच तारीख: {soilData.testDate}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-charcoal-500 bg-white px-3 py-1 rounded-md border border-charcoal-200">
            काली मिट्टी (Black Cotton Soil)
          </span>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Soil Values Input & Nutrient Status (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{t.soil.enterValues}</CardTitle>
              <CardDescription>
                कार्ड के अनुसार आंकड़े बदलें और फसल अनुकूलता देखें
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRecalculate} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Input
                      label={t.soil.phLevel}
                      type="number"
                      step="0.1"
                      value={soilData.ph}
                      onChange={(e) =>
                        setSoilData({ ...soilData, ph: parseFloat(e.target.value) || 7.0 })
                      }
                      helperText="आदर्श: 6.5 - 7.5"
                    />
                    <span
                      className={`text-[11px] font-bold mt-1 block ${
                        interpretNutrient('ph', soilData.ph).color
                      }`}
                    >
                      स्थिति: {interpretNutrient('ph', soilData.ph).statusHi}
                    </span>
                  </div>

                  <div>
                    <Input
                      label={t.soil.ecLevel}
                      type="number"
                      step="0.05"
                      value={soilData.electricalConductivity}
                      onChange={(e) =>
                        setSoilData({
                          ...soilData,
                          electricalConductivity: parseFloat(e.target.value) || 0.4,
                        })
                      }
                      helperText="आदर्श: < 1.0 dS/m"
                    />
                    <span
                      className={`text-[11px] font-bold mt-1 block ${
                        interpretNutrient('electricalConductivity', soilData.electricalConductivity).color
                      }`}
                    >
                      स्थिति: {interpretNutrient('electricalConductivity', soilData.electricalConductivity).statusHi}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-charcoal-100">
                  <div>
                    <Input
                      label={t.soil.ocLevel}
                      type="number"
                      step="0.05"
                      value={soilData.organicCarbonPercent}
                      onChange={(e) =>
                        setSoilData({
                          ...soilData,
                          organicCarbonPercent: parseFloat(e.target.value) || 0.5,
                        })
                      }
                      helperText="आदर्श: > 0.60%"
                    />
                    <span
                      className={`text-[11px] font-bold mt-1 block ${
                        interpretNutrient('organicCarbonPercent', soilData.organicCarbonPercent).color
                      }`}
                    >
                      स्थिति: {interpretNutrient('organicCarbonPercent', soilData.organicCarbonPercent).statusHi}
                    </span>
                  </div>

                  <div>
                    <Input
                      label={t.soil.nitrogen}
                      type="number"
                      value={soilData.nitrogenKgHa}
                      onChange={(e) =>
                        setSoilData({
                          ...soilData,
                          nitrogenKgHa: parseFloat(e.target.value) || 280,
                        })
                      }
                      helperText="आदर्श: 280-560 kg/ha"
                    />
                    <span
                      className={`text-[11px] font-bold mt-1 block ${
                        interpretNutrient('nitrogenKgHa', soilData.nitrogenKgHa).color
                      }`}
                    >
                      स्थिति: {interpretNutrient('nitrogenKgHa', soilData.nitrogenKgHa).statusHi}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-charcoal-100">
                  <div>
                    <Input
                      label={t.soil.phosphorus}
                      type="number"
                      value={soilData.phosphorusKgHa}
                      onChange={(e) =>
                        setSoilData({
                          ...soilData,
                          phosphorusKgHa: parseFloat(e.target.value) || 15,
                        })
                      }
                      helperText="आदर्श: 10-25 kg/ha"
                    />
                    <span
                      className={`text-[11px] font-bold mt-1 block ${
                        interpretNutrient('phosphorusKgHa', soilData.phosphorusKgHa).color
                      }`}
                    >
                      स्थिति: {interpretNutrient('phosphorusKgHa', soilData.phosphorusKgHa).statusHi}
                    </span>
                  </div>

                  <div>
                    <Input
                      label={t.soil.potassium}
                      type="number"
                      value={soilData.potassiumKgHa}
                      onChange={(e) =>
                        setSoilData({
                          ...soilData,
                          potassiumKgHa: parseFloat(e.target.value) || 200,
                        })
                      }
                      helperText="आदर्श: 120-280 kg/ha"
                    />
                    <span
                      className={`text-[11px] font-bold mt-1 block ${
                        interpretNutrient('potassiumKgHa', soilData.potassiumKgHa).color
                      }`}
                    >
                      स्थिति: {interpretNutrient('potassiumKgHa', soilData.potassiumKgHa).statusHi}
                    </span>
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="agri"
                  size="md"
                  className="w-full mt-2"
                  isLoading={evaluating}
                >
                  {t.soil.evaluateBtn}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Suitability Recommendations List (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-charcoal-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-agri-600" />
              <span>{t.soil.suitableCrops}</span>
            </h3>
            <span className="text-xs text-charcoal-500">
              ICAR एवं मध्य प्रदेश कृषि संदर्शिका आधारित
            </span>
          </div>

          <div className="space-y-4">
            {suitabilityList.map((item) => (
              <Card
                key={item.cropId}
                className={`transition-all ${
                  item.suitabilityScore >= 80
                    ? 'border-agri-300 bg-white'
                    : 'border-charcoal-200 bg-cream-50/50'
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <CardTitle className="text-lg text-forest-950">
                        {item.cropNameHi}
                      </CardTitle>
                      <span className="text-xs text-charcoal-500 font-normal">
                        {item.cropNameEn}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-forest-900">
                          {item.suitabilityScore}
                          <span className="text-xs text-charcoal-400 font-normal">/100</span>
                        </span>
                        <Badge
                          variant={item.suitabilityScore >= 80 ? 'agri' : 'warning'}
                          size="sm"
                        >
                          {item.ratingHi}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Favorable Reasons */}
                  <div>
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-charcoal-700 mb-1">
                      अनुकूल कारक:
                    </h5>
                    <ul className="space-y-1">
                      {item.reasons.map((r, idx) => (
                        <li
                          key={idx}
                          className="text-xs text-charcoal-800 flex items-start gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-agri-600 shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Limiting Factors */}
                  {item.nutrientLimitingFactors.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200/80 text-xs text-amber-900 space-y-1">
                      <span className="font-bold block">पोषक तत्व सीमाएं / सुधार की आवश्यकता:</span>
                      <ul className="space-y-0.5">
                        {item.nutrientLimitingFactors.map((l, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-amber-700 font-bold">•</span>
                            <span>{l}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Fertilizer Adjustment Guidance */}
                  <div className="p-3 rounded-lg bg-forest-50 border border-forest-200 text-xs text-forest-950">
                    <span className="font-bold">संतुलित खाद अनुशंसा (ICAR): </span>
                    <span>{item.fertilizerAdjustmentAdvice}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
