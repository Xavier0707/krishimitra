'use client';

import React, { useState } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Download,
  Database,
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
      <PageHeader
        title={t.nav.profile}
        subtitle="किसान विवरण, भूमि रकबा इकाइयां, पसंदीदा भाषा एवं डेटा बैकअप"
        icon={<User className="w-5 h-5 text-[#1F4A3F]" />}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportData}
            className="gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>डेटा बैकअप डाउनलोड</span>
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile Edit Form (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-[#10312B]">किसान व्यक्तिगत व संपर्क विवरण</CardTitle>
              <CardDescription>
                यह जानकारी आपकी स्थानीय मौसम और मंडी सलाह को अनुकूलित करती है
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                {savedSuccess && (
                  <div className="p-3.5 rounded-xl bg-[#E8F5E9] border border-[#A5D6A7] text-xs text-[#1B5E20] flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-[#2E7D32]" />
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

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#DCE9DD]">
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

                <div className="pt-2 border-t border-[#DCE9DD] space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#52685B]">
                    खेत व भूमि रकबा विवरण
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      label="खेत का कुल रकबा (एकड़)"
                      type="number"
                      step="0.5"
                      value={farm.totalArea}
                      onChange={(e) =>
                        setFarm({ ...farm, totalArea: parseFloat(e.target.value) || 1 })
                      }
                      helperText="म.प्र. मानक: 1 एकड़ ≈ 1.6 बीघा"
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
                  <Button type="submit" variant="primary" size="md">
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
              <CardTitle className="text-base text-[#10312B] flex items-center gap-2">
                <Database className="w-4 h-4 text-[#1F4A3F]" />
                <span>डेटाबेस व खाता स्थिति</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#52685B]">खाता प्रकार:</span>
                <Badge variant="demo" size="sm">
                  स्थानीय डेमो मोड
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#52685B]">Supabase क्लाउड कनेक्शन:</span>
                <span
                  className={`font-semibold ${
                    isSupabaseConfigured ? 'text-[#236B38]' : 'text-[#B45309]'
                  }`}
                >
                  {isSupabaseConfigured ? 'कनेक्टेड (Live)' : 'लोकल स्टोरेज (ऑफ़लाइन)'}
                </span>
              </div>

              <div className="p-3.5 bg-[#EAF4E8] rounded-xl text-[#52685B] border border-[#DCE9DD] leading-relaxed text-[11px]">
                क्लाउड सिंक के बिना भी आपके सभी खेत कार्य, मिट्टी परीक्षण और गणनाएं इस डिवाइस
                पर स्थानीय रूप से सुरक्षित रहती हैं।
              </div>
            </CardContent>
          </Card>

          {/* Unit Conversion Quick Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-[#10312B]">मध्य प्रदेश भूमि रकबा रूपांतरण</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="p-4 bg-[#EAF4E8] border border-[#DCE9DD] rounded-xl space-y-2">
                <span className="font-bold text-[#10312B] block">
                  आपके खेत का कुल रकबा ({farm.totalArea} एकड़):
                </span>
                <div className="grid grid-cols-2 gap-2 text-[#10312B] font-mono pt-1">
                  <div>
                    • <strong>{convertedBigha}</strong> बीघा (पक्का)
                  </div>
                  <div>
                    • <strong>{convertedHectare}</strong> हेक्टेयर
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-[#718579] pt-1 space-y-1">
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
