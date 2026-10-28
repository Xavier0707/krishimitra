'use client';

import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  FlaskConical,
  CheckCircle2,
  FileText,
  Sparkles,
} from 'lucide-react';
import { INITIAL_DEMO_SOIL } from '@/lib/demo/demo-state';
import { SoilTestResult, CropSuitabilityAssessment } from '@/lib/types';
import { evaluateCropSuitability, interpretNutrient } from '@/lib/soil/guidance';

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
    }, 200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={t.soil.title}
        subtitle={t.soil.subtitle}
        icon={<FlaskConical className="w-5 h-5 text-[#1F4A3F]" />}
        badge={
          <Badge variant="mint">
            सत्यापित KVK लैब रिपोर्ट: {soilData.sampleId}
          </Badge>
        }
      />

      {/* Lab Report Metadata Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#EAF4E8] border border-[#DCE9DD] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#52685B]">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white border border-[#DCE9DD] flex items-center justify-center text-[#1F4A3F] shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-sm text-[#10312B]">
              मृदा स्वास्थ्य कार्ड (Soil Health Card)
            </p>
            <p className="text-[#52685B]">
              प्रयोगशाला: {soilData.labName} • परीक्षण तारीख: {soilData.testDate}
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono font-medium text-[#10312B] bg-white px-3 py-1 rounded-xl border border-[#DCE9DD]">
          काली मिट्टी (Black Cotton Soil)
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Soil Values Input & Nutrient Status (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-[#10312B]">{t.soil.enterValues}</CardTitle>
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

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#DCE9DD]">
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

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#DCE9DD]">
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
                  variant="primary"
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
            <h3 className="text-base font-bold text-[#10312B] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#1F4A3F]" />
              <span>{t.soil.suitableCrops}</span>
            </h3>
            <span className="text-xs text-[#52685B]">
              ICAR एवं मध्य प्रदेश कृषि संदर्शिका आधारित
            </span>
          </div>

          <div className="space-y-4">
            {suitabilityList.map((item) => (
              <Card
                key={item.cropId}
                className={`transition-all ${
                  item.suitabilityScore >= 80
                    ? 'border-[#9EC2A9] bg-white shadow-soft'
                    : 'border-[#DCE9DD] bg-[#F3F8F2]/40'
                }`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <CardTitle className="text-lg text-[#10312B]">
                        {item.cropNameHi}
                      </CardTitle>
                      <span className="text-xs text-[#52685B] font-normal">
                        {item.cropNameEn}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-black text-[#10312B]">
                          {item.suitabilityScore}
                          <span className="text-xs text-[#718579] font-normal">/100</span>
                        </span>
                        <Badge
                          variant={item.suitabilityScore >= 80 ? 'mint' : 'warning'}
                          size="sm"
                        >
                          {item.ratingHi}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3.5">
                  {/* Favorable Reasons */}
                  <div>
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-[#52685B] mb-1.5">
                      अनुकूल कारक:
                    </h5>
                    <ul className="space-y-1">
                      {item.reasons.map((r, idx) => (
                        <li
                          key={idx}
                          className="text-xs text-[#10312B] flex items-start gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#1F4A3F] shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Limiting Factors */}
                  {item.nutrientLimitingFactors.length > 0 && (
                    <div className="p-3 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] text-xs text-[#92400E] space-y-1">
                      <span className="font-bold block">पोषक तत्व सीमाएं / सुधार की आवश्यकता:</span>
                      <ul className="space-y-0.5">
                        {item.nutrientLimitingFactors.map((l, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-[#B45309] font-bold">•</span>
                            <span>{l}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Fertilizer Adjustment Guidance */}
                  <div className="p-3.5 rounded-xl bg-[#EAF4E8] border border-[#DCE9DD] text-xs text-[#10312B]">
                    <span className="font-bold">संतुलित खाद अनुशंसा (ICAR): </span>
                    <span className="text-[#52685B]">{item.fertilizerAdjustmentAdvice}</span>
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
