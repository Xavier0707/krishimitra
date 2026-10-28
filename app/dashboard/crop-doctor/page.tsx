'use client';

import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Stethoscope,
  Upload,
  X,
  AlertTriangle,
  ShieldCheck,
  Leaf,
  Bug,
  CheckCircle2,
  HelpCircle,
  Camera,
  Info,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-forest-950 flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-agri-600" />
            <span>{t.cropDoctor.title}</span>
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-600 mt-0.5">
            {t.cropDoctor.subtitle}
          </p>
        </div>

        <Badge variant="demo">
          प्रारंभिक एआई सहायता (वैज्ञानिक मार्गदर्शन)
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form & Image Upload (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">फसल व लक्षण प्रविष्टि</CardTitle>
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
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                  पौधे की फोटो (वैकल्पिक परंतु अनुशंसित)
                </label>

                {selectedImage ? (
                  <div className="relative rounded-xl border border-charcoal-300 overflow-hidden bg-cream-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedImage}
                      alt="Crop symptom preview"
                      className="w-full h-48 object-cover"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-charcoal-900/80 text-white hover:bg-rose-700 transition-colors"
                      aria-label="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-charcoal-300 hover:border-forest-600 rounded-xl cursor-pointer bg-cream-50 hover:bg-cream-100 transition-colors p-4 text-center">
                    <Camera className="w-8 h-8 text-charcoal-400 mb-2" />
                    <span className="text-xs font-semibold text-forest-800">
                      फोटो खींचें या गैलरी से चुनें
                    </span>
                    <span className="text-[11px] text-charcoal-500 mt-0.5">
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
                <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
                  {t.cropDoctor.describeSymptoms}
                </label>
                <textarea
                  rows={3}
                  value={symptomsDescription}
                  onChange={(e) => setSymptomsDescription(e.target.value)}
                  placeholder="उदा. पत्तियां पीली पड़ रही हैं या तना कटकर सूख रहा है..."
                  className="w-full px-3.5 py-2.5 rounded-lg border border-charcoal-300 bg-white text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-forest-600"
                />
              </div>

              {/* Sample Symptom Quick Buttons */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-charcoal-500 block">
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
                    className="px-2 py-1 text-[11px] rounded bg-cream-200 hover:bg-cream-300 text-charcoal-800"
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
                    className="px-2 py-1 text-[11px] rounded bg-cream-200 hover:bg-cream-300 text-charcoal-800"
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
                    className="px-2 py-1 text-[11px] rounded bg-cream-200 hover:bg-cream-300 text-charcoal-800"
                  >
                    चने का उकठा (Wilt)
                  </button>
                </div>
              </div>

              <Button
                variant="agri"
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
            <Card className="border-dashed border-2 border-charcoal-200">
              <CardContent className="p-12 text-center space-y-3 text-charcoal-500">
                <Leaf className="w-12 h-12 text-charcoal-300 mx-auto" />
                <h3 className="font-bold text-base text-charcoal-700">
                  लक्षणों का विवरण भरकर विश्लेषण शुरू करें
                </h3>
                <p className="text-xs max-w-sm mx-auto leading-relaxed">
                  क्रॉप डॉक्टर लक्षण और वातावरण का मिलान करके जैविक देसी उपाय व अनुमोदित
                  कीटनाशक सुरक्षा की निष्पक्ष जानकारी प्रदान करता है।
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-5 animate-fadeIn">
              {/* Result Summary Card */}
              <Card className="border-agri-300 bg-gradient-to-br from-white to-agri-50/20 shadow-md">
                <CardHeader>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={
                          diagnosis.confidenceTier === 'High'
                            ? 'agri'
                            : diagnosis.confidenceTier === 'Moderate'
                            ? 'forest'
                            : 'warning'
                        }
                        size="sm"
                      >
                        विश्वास स्तर: {diagnosis.confidenceTier}
                      </Badge>
                      {diagnosis.scientificName && (
                        <span className="text-[11px] font-mono italic text-charcoal-500">
                          {diagnosis.scientificName}
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-xl text-forest-950">
                      {diagnosis.conditionNameHi}
                    </CardTitle>
                    <CardDescription className="text-charcoal-600">
                      {diagnosis.conditionNameEn}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Observed Symptoms */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                      पहचाने गए मुख्य लक्षण:
                    </h4>
                    <ul className="space-y-1">
                      {diagnosis.symptomsObserved.map((sym, idx) => (
                        <li
                          key={idx}
                          className="text-xs text-charcoal-800 flex items-start gap-2"
                        >
                          <span className="text-agri-600 font-bold">•</span>
                          <span>{sym}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Weather correlation */}
                  <div className="p-3 bg-cream-100 rounded-lg text-xs text-charcoal-700 border border-charcoal-200">
                    <span className="font-bold text-charcoal-900">
                      मौसम व वातावरण प्रभाव:{' '}
                    </span>
                    <span>{diagnosis.favorableWeatherConditions}</span>
                  </div>

                  {/* Organic & Biological Remedies */}
                  <div className="p-4 rounded-xl bg-agri-50 border border-agri-200 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-agri-900 flex items-center gap-1.5">
                      <Leaf className="w-4 h-4 text-agri-700" />
                      <span>{t.cropDoctor.organicMeasures}</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-agri-950">
                      {diagnosis.organicManagementHi.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-agri-600 shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Approved Chemical Measures */}
                  <div className="p-4 rounded-xl bg-cream-100 border border-charcoal-200 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-900 flex items-center gap-1.5">
                      <Bug className="w-4 h-4 text-forest-800" />
                      <span>{t.cropDoctor.chemicalMeasures} (केवल आवश्यकता होने पर)</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-charcoal-800">
                      {diagnosis.chemicalManagementHi.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-forest-700 font-bold">•</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Precautions */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-700 mb-1.5">
                      {t.cropDoctor.precautions}
                    </h4>
                    <ul className="space-y-1 text-xs text-charcoal-700">
                      {diagnosis.precautionsHi.map((p, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-charcoal-400 font-bold">•</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Disclaimer & KVK visit callout */}
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-300 text-xs text-amber-900 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertTriangle className="w-4 h-4 text-amber-700" />
                      <span>{t.cropDoctor.disclaimerNote}</span>
                    </div>
                    {diagnosis.requiresExpertVisit && (
                      <p className="font-semibold text-rose-800 pt-1">
                        गंभीर रोग चेतावनी: इस रोग के फैलाव को रोकने हेतु कृषि वैज्ञानिक अथवा
                        ब्लॉक कृषि अधिकारी से खेत का मुआयना अवश्य करवाएं।
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <span className="text-[11px] text-charcoal-500 font-mono">
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
