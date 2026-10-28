'use client';

import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Stethoscope,
  X,
  AlertTriangle,
  Leaf,
  Bug,
  CheckCircle2,
  Camera,
} from 'lucide-react';
import { CropSymptomDiagnosis } from '@/lib/types';

export default function CropDoctorPage() {
  const { t } = useI18n();

  const [cropType, setCropType] = useState<string>('Soybean');
  const [symptomsDescription, setSymptomsDescription] = useState<string>(
    'पत्तियों पर पीले धब्बे दिख रहे हैं और नई पत्तियां सिकुड़ रही हैं।'
  );
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [diagnosis, setDiagnosis] = useState<CropSymptomDiagnosis | null>(null);
  const [providerName, setProviderName] = useState<string>('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('कृपया केवल जेपीजी (JPG) या पीएनजी (PNG) फोटो चुनें।');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('फोटो का साइज 5MB से कम होना चाहिए।');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  const handleAnalyze = async () => {
    if (!symptomsDescription.trim()) {
      alert('कृपया पत्तियों या तने पर दिख रहे लक्षणों का संक्षिप्त विवरण लिखें।');
      return;
    }

    setAnalyzing(true);
    setDiagnosis(null);

    try {
      const res = await fetch('/api/crop-doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cropType,
          symptomsDescription,
          imageBase64: selectedImage,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setDiagnosis(data.diagnosis);
        setProviderName(data.provider);
      } else {
        alert('विश्लेषण में समस्या आई। कृपया पुनः प्रयास करें।');
      }
    } catch {
      alert('नेटवर्क त्रुटि हुई।');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={t.cropDoctor.title}
        subtitle={t.cropDoctor.subtitle}
        icon={<Stethoscope className="w-5 h-5 text-[#1F4A3F]" />}
        badge={
          <Badge variant="mint">
            प्रारंभिक एआई सहायता (वैज्ञानिक मार्गदर्शन)
          </Badge>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form & Image Upload (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-[#10312B]">फसल व लक्षण प्रविष्टि</CardTitle>
              <CardDescription>
                खेत में पौधे की स्थिति का विवरण भरें
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                label={t.cropDoctor.selectCropPrompt}
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
              >
                <option value="Soybean">सोयाबीन (Soybean)</option>
                <option value="Wheat">गेहूं (Wheat - Sharbati / Lokwan)</option>
                <option value="Chana">चना (Bengal Gram)</option>
                <option value="Garlic">लहसुन (Garlic)</option>
                <option value="Mustard">सरसों (Mustard)</option>
                <option value="Cotton">कपास (Cotton)</option>
                <option value="Maize">मक्का (Maize)</option>
              </Select>

              {/* Photo Upload Zone */}
              <div>
                <label className="block text-xs font-semibold text-[#52685B] uppercase tracking-wider mb-1">
                  पौधे की फोटो (संदर्भ व रिकॉर्ड हेतु)
                </label>
                <p className="text-[11px] text-[#718579] mb-1.5 leading-snug">
                  तस्वीर Google Gemma 4 31B विज़न व ICAR/KVK ज्ञानकोश द्वारा विश्लेषित की जाती है। यह प्राथमिक लक्षण विश्लेषण है।
                </p>

                {selectedImage ? (
                  <div className="relative rounded-2xl border border-[#DCE9DD] overflow-hidden bg-[#F3F8F2]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedImage}
                      alt="Crop symptom preview"
                      className="w-full h-48 object-cover"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-[#092622]/80 text-white hover:bg-[#B91C1C] transition-colors"
                      aria-label="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-[#DCE9DD] hover:border-[#1F4A3F] rounded-2xl cursor-pointer bg-[#F3F8F2] hover:bg-[#EAF4E8] transition-colors p-4 text-center">
                    <Camera className="w-8 h-8 text-[#52685B] mb-2" />
                    <span className="text-xs font-semibold text-[#10312B]">
                      फोटो खींचें या गैलरी से चुनें
                    </span>
                    <span className="text-[11px] text-[#718579] mt-0.5">
                      JPG, PNG अधिकतम 5MB तक
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                  </label>
                )}
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-xs font-semibold text-[#52685B] uppercase tracking-wider mb-1.5">
                  {t.cropDoctor.describeSymptoms}
                </label>
                <textarea
                  rows={3}
                  value={symptomsDescription}
                  onChange={(e) => setSymptomsDescription(e.target.value)}
                  placeholder="उदा. पत्तियां पीली पड़ रही हैं या तना कटकर सूख रहा है..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE9DD] bg-white text-sm text-[#10312B] focus:outline-none focus:ring-2 focus:ring-[#1F4A3F]/20 focus:border-[#1F4A3F]"
                />
              </div>

              {/* Sample Symptom Quick Buttons */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-[#52685B] block">
                  सामान्य लक्षण तुरंत चुनें:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setSymptomsDescription(
                        'पत्तियों पर पीले मोजेक जैसे चकत्ते और सफेद मक्खी का प्रकोप है।'
                      )
                    }
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-[#EAF4E8] hover:bg-[#DBF2DE] text-[#10312B] border border-[#DCE9DD] transition-colors"
                  >
                    पीला मोजेक
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSymptomsDescription(
                        'तने पर गोल छल्ले कट गए हैं और शाखा ऊपर से सूख रही है।'
                      )
                    }
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-[#EAF4E8] hover:bg-[#DBF2DE] text-[#10312B] border border-[#DCE9DD] transition-colors"
                  >
                    रिंग कटर / गर्डल बीटल
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSymptomsDescription(
                        'चने का हरा पौधा अचानक सूख गया है और जड़ चीरने पर काली दिखती है।'
                      )
                    }
                    className="px-2.5 py-1 text-[11px] rounded-lg bg-[#EAF4E8] hover:bg-[#DBF2DE] text-[#10312B] border border-[#DCE9DD] transition-colors"
                  >
                    चने का उकठा (Wilt)
                  </button>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full mt-2"
                onClick={handleAnalyze}
                isLoading={analyzing}
              >
                {analyzing ? t.cropDoctor.analyzing : t.cropDoctor.analyzeBtn}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Diagnostic Results View (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!diagnosis ? (
            <Card className="border-dashed border-2 border-[#DCE9DD]">
              <CardContent className="p-12 text-center space-y-3 text-[#718579]">
                <div className="w-12 h-12 rounded-2xl bg-[#EAF4E8] text-[#1F4A3F] flex items-center justify-center mx-auto">
                  <Leaf className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-base text-[#10312B]">
                  लक्षणों का विवरण भरकर विश्लेषण शुरू करें
                </h3>
                <p className="text-xs max-w-sm mx-auto leading-relaxed text-[#52685B]">
                  क्रॉप डॉक्टर लक्षण और वातावरण का मिलान करके जैविक देसी उपाय व अनुमोदित
                  कीटनाशक सुरक्षा की निष्पक्ष जानकारी प्रदान करता है।
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-5 animate-fadeIn">
              {/* Result Summary Card */}
              <Card className="border-[#DCE9DD] shadow-card">
                <CardHeader className="bg-gradient-to-r from-[#10312B] to-[#1F4A3F] text-white">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <Badge
                        variant="mint"
                        size="sm"
                        className="bg-[#DBF2DE] text-[#092622]"
                      >
                        लक्षण मिलान स्तर: {diagnosis.confidenceTier}
                      </Badge>
                      {providerName && (
                        <Badge
                          variant="forest"
                          size="sm"
                          className="border border-[#DBF2DE]/40 text-[#DBF2DE] text-[10px]"
                        >
                          {providerName}
                        </Badge>
                      )}
                      {diagnosis.scientificName && (
                        <span className="text-[11px] font-mono italic text-[#DBF2DE]/80">
                          {diagnosis.scientificName}
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-xl text-white">
                      {diagnosis.conditionNameHi}
                    </CardTitle>
                    <CardDescription className="text-[#DBF2DE]/80">
                      {diagnosis.conditionNameEn}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {/* Observed Symptoms */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#52685B] mb-2">
                      पहचाने गए मुख्य लक्षण:
                    </h4>
                    <ul className="space-y-1.5">
                      {diagnosis.symptomsObserved.map((sym, idx) => (
                        <li
                          key={idx}
                          className="text-xs text-[#10312B] flex items-start gap-2"
                        >
                          <span className="text-[#1F4A3F] font-bold">•</span>
                          <span>{sym}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weather correlation */}
                  <div className="p-3.5 bg-[#EAF4E8] rounded-xl text-xs text-[#10312B] border border-[#DCE9DD]">
                    <span className="font-bold text-[#10312B]">
                      मौसम व वातावरण प्रभाव:{' '}
                    </span>
                    <span className="text-[#52685B]">{diagnosis.favorableWeatherConditions}</span>
                  </div>

                  {/* Organic & Biological Remedies */}
                  <div className="p-4 rounded-xl bg-[#DBF2DE]/50 border border-[#9EC2A9]/60 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#092622] flex items-center gap-1.5">
                      <Leaf className="w-4 h-4 text-[#1F4A3F]" />
                      <span>{t.cropDoctor.organicMeasures}</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-[#10312B]">
                      {diagnosis.organicManagementHi.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#1F4A3F] shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Approved Chemical Measures */}
                  <div className="p-4 rounded-xl bg-[#F3F8F2] border border-[#DCE9DD] space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#10312B] flex items-center gap-1.5">
                      <Bug className="w-4 h-4 text-[#1F4A3F]" />
                      <span>{t.cropDoctor.chemicalMeasures} (केवल आवश्यकता होने पर)</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-[#52685B]">
                      {diagnosis.chemicalManagementHi.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-[#1F4A3F] font-bold">•</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Precautions */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#52685B] mb-1.5">
                      {t.cropDoctor.precautions}
                    </h4>
                    <ul className="space-y-1 text-xs text-[#52685B]">
                      {diagnosis.precautionsHi.map((p, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-[#718579] font-bold">•</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Disclaimer & KVK visit callout */}
                  <div className="p-3.5 bg-[#FEF3C7] rounded-xl border border-[#FDE68A] text-xs text-[#92400E] space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="w-4 h-4 text-[#B45309]" />
                      <span>{t.cropDoctor.disclaimerNote}</span>
                    </div>
                    {diagnosis.requiresExpertVisit && (
                      <p className="font-semibold text-[#B91C1C] pt-1">
                        गंभीर रोग चेतावनी: इस रोग के फैलाव को रोकने हेतु कृषि वैज्ञानिक अथवा
                        ब्लॉक कृषि अधिकारी से खेत का मुआयना अवश्य करवाएं।
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <span className="text-[11px] text-[#718579] font-mono">
                    इंजन: {providerName || 'ICAR Plant Protection Knowledge Base'}
                  </span>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
