'use client';

import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  User,
  MapPin,
  Sprout,
  ShieldCheck,
  Download,
  Database,
  Languages,
  CheckCircle2,
} from 'lucide-react';
import { INITIAL_DEMO_FARMER, INITIAL_DEMO_FARM } from '@/lib/demo/demo-state';
import { AreaUnit } from '@/lib/types';
import { convertAcresToUnit } from '@/lib/mandi/profit-calculator';
import { isSupabaseConfigured } from '@/lib/supabase/client';

export default function ProfilePage() {
  const { language, setLanguage, t } = useI18n();

  const [profile, setProfile] = useState(INITIAL_DEMO_FARMER);
  const [farm, setFarm] = useState(INITIAL_DEMO_FARM);
  const [selectedUnit, setSelectedUnit] = useState<AreaUnit>('acre');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportData = () => {
    const backup = {
      profile,
      farm,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `krishiconnect-backup-${profile.district}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const convertedBigha = convertAcresToUnit(farm.totalArea, 'bigha').toFixed(1);
  const convertedHectare = convertAcresToUnit(farm.totalArea, 'hectare').toFixed(2);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-forest-950 flex items-center gap-2">
            <User className="w-6 h-6 text-forest-700" />
            <span>{t.nav.profile}</span>
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-600 mt-0.5">
            किसान विवरण, भूमि रकबा इकाइयां, पसंदीदा भाषा एवं डेटा बैकअप
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportData}
            className="gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>डेटा बैकअप डाउनलोड करें</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile Edit Form (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">किसान व्यक्तिगत व संपर्क विवरण</CardTitle>
              <CardDescription>
                यह जानकारी आपकी स्थानीय मौसम और मंडी सलाह को अनुकूलित करती है
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                {savedSuccess && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>प्रोफ़ाइल विवरण सफलतापूर्वक सुरक्षित कर लिया गया है।</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="पूरा नाम (Full Name)"
                    value={profile.fullName}
                    onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                    required
                  />
                  <Input
                    label="मोबाइल नंबर (Mobile Number)"
                    value={profile.phoneNumber || ''}
                    onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-charcoal-100">
                  <Input
                    label="राज्य (State)"
                    value={profile.state}
                    disabled
                    helperText="वर्तमान में मध्य प्रदेश हेतु सक्रिय"
                  />
                  <Select
                    label="जिला (District)"
                    value={profile.district}
                    onChange={(e) => {
                      setProfile({ ...profile, district: e.target.value });
                      setFarm({ ...farm, district: e.target.value });
                    }}
                  >
                    <option value="Sehore">सीहोर (Sehore)</option>
                    <option value="Bhopal">भोपाल (Bhopal)</option>
                    <option value="Indore">इंदौर (Indore)</option>
                    <option value="Ujjain">उज्जैन (Ujjain)</option>
                    <option value="Vidisha">विदिशा (Vidisha)</option>
                    <option value="Hoshangabad">होशंगाबाद (Hoshangabad)</option>
                    <option value="Dewas">देवास (Dewas)</option>
                    <option value="Sagar">सागर (Sagar)</option>
                  </Select>
                  <Input
                    label="तहसील / ब्लॉक (Tehsil)"
                    value={profile.subDistrictTehsil || ''}
                    onChange={(e) =>
                      setProfile({ ...profile, subDistrictTehsil: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="गाँव का नाम (Village)"
                    value={profile.village || ''}
                    onChange={(e) => {
                      setProfile({ ...profile, village: e.target.value });
                      setFarm({ ...farm, village: e.target.value });
                    }}
                  />
                  <Select
                    label="प्राथमिक भाषा (Language)"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as 'hi' | 'en')}
                  >
                    <option value="hi">हिंदी (हिन्दी)</option>
                    <option value="en">English</option>
                  </Select>
                </div>

                <div className="pt-2 border-t border-charcoal-100 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-700">
                    खेत व भूमि रकबा विवरण
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      label="खेत का कुल रकबा (Total Area in Acres)"
                      type="number"
                      step="0.5"
                      value={farm.totalArea}
                      onChange={(e) =>
                        setFarm({ ...farm, totalArea: parseFloat(e.target.value) || 1 })
                      }
                      helperText="मध्य प्रदेश मानक: 1 एकड़ ≈ 1.6 बीघा"
                    />

                    <Select
                      label="मिट्टी का प्रकार (Soil Type)"
                      value={farm.soilType}
                      onChange={(e) => setFarm({ ...farm, soilType: e.target.value })}
                    >
                      <option value="Deep Black Cotton Soil (गहरी काली मिट्टी)">
                        गहरी काली मिट्टी (Deep Black Cotton Soil)
                      </option>
                      <option value="Medium Black Soil (मध्यम काली मिट्टी)">
                        मध्यम काली मिट्टी (Medium Black)
                      </option>
                      <option value="Alluvial Soil (जलोढ़ दोमट मिट्टी)">
                        जलोढ़ दोमट मिट्टी (Alluvial Loam)
                      </option>
                      <option value="Mixed Red and Black Soil (मिश्रित लाल-काली)">
                        मिश्रित लाल-काली मिट्टी
                      </option>
                    </Select>

                    <Select
                      label="सिंचाई व्यवस्था (Water Source)"
                      value={farm.waterSource}
                      onChange={(e) => setFarm({ ...farm, waterSource: e.target.value })}
                    >
                      <option value="Tubewell & Farm Pond (नलकूप व खेत तालाब)">
                        नलकूप व खेत तालाब (Tubewell & Pond)
                      </option>
                      <option value="Canal Irrigation (नहरी सिंचाई)">
                        नहरी सिंचाई (Canal Irrigation)
                      </option>
                      <option value="Rainfed (केवल वर्षा आधारित)">
                        केवल वर्षा आधारित (Rainfed)
                      </option>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end pt-3">
                  <Button type="submit" variant="agri" size="md">
                    विवरण सुरक्षित करें
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Database Status & Unit Conversion Reference (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Supabase Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="w-4 h-4 text-forest-700" />
                <span>डेटाबेस व खाता स्थिति</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-charcoal-600">खाता प्रकार:</span>
                <Badge variant="demo" size="sm">
                  स्थानीय डेमो मोड
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-charcoal-600">Supabase क्लाउड कनेक्शन:</span>
                <span
                  className={`font-semibold ${
                    isSupabaseConfigured ? 'text-agri-600' : 'text-amber-700'
                  }`}
                >
                  {isSupabaseConfigured ? 'कनेक्टेड (Live)' : 'लोकल स्टोरेज (ऑफ़लाइन)'}
                </span>
              </div>

              <div className="p-3 bg-cream-100 rounded-lg text-charcoal-600 border border-charcoal-200 leading-relaxed text-[11px]">
                क्लाउड सिंक के बिना भी आपके सभी खेत कार्य, मिट्टी परीक्षण और गणनाएं इस डिवाइस
                पर स्थानीय रूप से सुरक्षित रहती हैं।
              </div>
            </CardContent>
          </Card>

          {/* Unit Conversion Quick Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">मध्य प्रदेश भूमि रकबा रूपांतरण</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5 text-xs">
              <div className="p-3 bg-forest-50 border border-forest-200/80 rounded-lg space-y-1.5">
                <span className="font-bold text-forest-950 block">
                  आपके खेत का कुल रकबा ({farm.totalArea} एकड़):
                </span>
                <div className="grid grid-cols-2 gap-2 text-forest-900 font-mono pt-1">
                  <div>
                    • <strong>{convertedBigha}</strong> बीघा (पक्का बीघा)
                  </div>
                  <div>
                    • <strong>{convertedHectare}</strong> हेक्टेयर
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-charcoal-500 pt-1 space-y-1">
                <p>• 1 एकड़ = 1.6 बीघा (मध्य म.प्र. मानक)</p>
                <p>• 1 हेक्टेयर = 2.471 एकड़</p>
                <p>• 1 क्विंटल = 100 किलोग्राम</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
