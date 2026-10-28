'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import {
  Map as MapIcon,
  Plus,
  Calendar,
  Sprout,
  CheckCircle2,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { INITIAL_DEMO_FARM, INITIAL_DEMO_ACTIVITIES } from '@/lib/demo/demo-state';
import { FarmActivity, FarmPlot } from '@/lib/types';
import { offlineStorage } from '@/lib/offline/indexed-db';

export default function FarmTwinPage() {
  const { t, formatCurrency } = useI18n();

  const [farm, setFarm] = useState(INITIAL_DEMO_FARM);
  const [selectedPlot, setSelectedPlot] = useState<FarmPlot>(farm.plots[0]);
  const [activities, setActivities] = useState<FarmActivity[]>(INITIAL_DEMO_ACTIVITIES);

  // Modal for logging activity
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [activityType, setActivityType] = useState<string>('Irrigation');
  const [activityDate, setActivityDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [activityDetails, setActivityDetails] = useState<string>('');
  const [activityCost, setActivityCost] = useState<number>(0);

  useEffect(() => {
    const loadedActs = offlineStorage.getActivities();
    setActivities(loadedActs);
  }, []);

  const handleCreateActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activityDetails.trim()) {
      alert('कृपया गतिविधि का विवरण दर्ज करें।');
      return;
    }

    const created = offlineStorage.addActivity({
      plotId: selectedPlot.id,
      plotName: `${selectedPlot.plotName} (${selectedPlot.cropNameHi})`,
      activityType: activityType as FarmActivity['activityType'],
      activityDate,
      details: activityDetails,
      costIncurred: Number(activityCost) || 0,
      isDemo: true,
    });

    setActivities((prev) => [created, ...prev]);
    setIsActivityModalOpen(false);
    setActivityDetails('');
    setActivityCost(0);
  };

  const stages = [
    'Sowing',
    'Germination',
    'Vegetative',
    'Flowering',
    'Pod/Grain Development',
    'Maturity',
    'Harvested',
  ];

  const currentStageIndex = stages.indexOf(selectedPlot.currentStage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title={t.nav.farmTwin}
        subtitle="खेत के भूखंड (Plots), बुवाई तारीख, फसल विकास चक्र और लागत प्रबंधन"
        icon={<MapIcon className="w-5 h-5 text-[#1F4A3F]" />}
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsActivityModalOpen(true)}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{t.dashboard.addActivity}</span>
          </Button>
        }
      />

      {/* Farm Overview Card with Forest-Mint Gradient */}
      <div className="rounded-3xl bg-gradient-to-r from-[#10312B] via-[#163D34] to-[#1F4A3F] text-white p-6 sm:p-7 shadow-float border border-[#4E7967]/30">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <span className="text-xs uppercase tracking-wider text-[#9EC2A9] font-bold block">
              खेत का नाम
            </span>
            <h3 className="text-xl font-extrabold text-white mt-1">{farm.farmName}</h3>
            <p className="text-xs text-[#DBF2DE]/90 mt-0.5">
              {farm.village}, {farm.district} ({farm.state})
            </p>
          </div>

          <div>
            <span className="text-xs uppercase tracking-wider text-[#9EC2A9] font-bold block">
              कुल रकबा (Area)
            </span>
            <h3 className="text-xl font-extrabold text-white mt-1">
              {farm.totalArea} एकड़{' '}
              <span className="text-sm font-normal text-[#DBF2DE]/80">
                (~12.8 बीघा)
              </span>
            </h3>
            <p className="text-xs text-[#DBF2DE]/90 mt-0.5">
              मिट्टी: {farm.soilType}
            </p>
          </div>

          <div>
            <span className="text-xs uppercase tracking-wider text-[#9EC2A9] font-bold block">
              सिंचाई व्यवस्था
            </span>
            <h3 className="text-lg font-bold text-white mt-1">{farm.waterSource}</h3>
            <p className="text-xs text-[#DBF2DE]/90 mt-0.5">
              भूखंडों की संख्या: {farm.plots.length}
            </p>
          </div>

          <div>
            <span className="text-xs uppercase tracking-wider text-[#9EC2A9] font-bold block">
              जीपीएस निर्देशांक
            </span>
            <h3 className="text-sm font-mono text-[#DBF2DE] font-semibold mt-1">
              {farm.latitude}° N, {farm.longitude}° E
            </h3>
            <span className="inline-block mt-2 text-[10px] bg-[#092622]/60 px-2.5 py-0.5 rounded-lg text-[#9EC2A9] border border-[#4E7967]/50 font-mono">
              ओपनस्ट्रीटमैप ग्रिड
            </span>
          </div>
        </div>
      </div>

      {/* Plot Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {farm.plots.map((plot) => {
          const isSelected = selectedPlot.id === plot.id;
          return (
            <button
              key={plot.id}
              onClick={() => setSelectedPlot(plot)}
              className={`px-4 py-2.5 rounded-2xl border text-sm font-semibold transition-all duration-150 whitespace-nowrap flex items-center gap-2.5 ${
                isSelected
                  ? 'bg-[#1F4A3F] text-white border-[#10312B] shadow-soft'
                  : 'bg-white text-[#10312B] border-[#DCE9DD] hover:bg-[#EAF4E8]'
              }`}
            >
              <Sprout
                className={`w-4 h-4 ${isSelected ? 'text-[#DBF2DE]' : 'text-[#1F4A3F]'}`}
              />
              <span>{plot.plotName}</span>
              <span
                className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                  isSelected ? 'bg-[#10312B] text-[#DBF2DE]' : 'bg-[#EAF4E8] text-[#52685B]'
                }`}
              >
                {plot.cropNameHi} ({plot.plotArea} एकड़)
              </span>
            </button>
          );
        })}
      </div>

      {/* Crop Growth Stage Timeline */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle className="text-base text-[#10312B]">
              फसल विकास चक्र: {selectedPlot.cropNameHi}
            </CardTitle>
            <CardDescription>
              बुवाई तारीख: {selectedPlot.sowingDate} • अपेक्षित कटाई:{' '}
              {selectedPlot.expectedHarvestDate || 'प्रगति पर'}
            </CardDescription>
          </div>
          <Badge variant="mint">{selectedPlot.currentStage}</Badge>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
            {stages.map((stg, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <div
                  key={stg}
                  className={`p-3.5 rounded-2xl border text-center text-xs transition-all ${
                    isCurrent
                      ? 'bg-[#DBF2DE] border-[#9EC2A9] font-bold text-[#092622] shadow-soft'
                      : isPast
                      ? 'bg-[#EAF4E8] border-[#DCE9DD] text-[#10312B]'
                      : 'bg-white border-dashed border-[#DCE9DD] text-[#718579]'
                  }`}
                >
                  <div className="flex justify-center mb-1.5">
                    {isPast ? (
                      <CheckCircle2 className="w-4 h-4 text-[#1F4A3F]" />
                    ) : isCurrent ? (
                      <Clock className="w-4 h-4 text-[#10312B] animate-spin" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-[#DCE9DD] inline-block text-[10px] leading-4 text-[#718579]">
                        {idx + 1}
                      </span>
                    )}
                  </div>
                  <span className="block truncate">{stg}</span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Map Boundary & Field History Two Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Farm Map Boundary Visualization (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <div>
                <CardTitle className="text-base text-[#10312B]">खेत का नक्शा (Field Boundary)</CardTitle>
                <CardDescription>
                  ओपनस्ट्रीटमैप (OpenStreetMap) उपग्रह परिप्रेक्ष्य
                </CardDescription>
              </div>
              <Badge variant="neutral">OpenStreetMap</Badge>
            </CardHeader>
            <CardContent className="p-5 flex-1 flex flex-col justify-between">
              {/* Responsive SVG Simulated Field Boundary Map */}
              <div className="w-full h-64 bg-[#EAF4E8] rounded-2xl border border-[#DCE9DD] relative overflow-hidden flex items-center justify-center">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 500 300"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Grid lines in sage */}
                  <line x1="0" y1="50" x2="500" y2="50" stroke="#DCE9DD" strokeWidth="1" />
                  <line x1="0" y1="150" x2="500" y2="150" stroke="#DCE9DD" strokeWidth="1" />
                  <line x1="0" y1="250" x2="500" y2="250" stroke="#DCE9DD" strokeWidth="1" />
                  <line x1="100" y1="0" x2="100" y2="300" stroke="#DCE9DD" strokeWidth="1" />
                  <line x1="250" y1="0" x2="250" y2="300" stroke="#DCE9DD" strokeWidth="1" />
                  <line x1="400" y1="0" x2="400" y2="300" stroke="#DCE9DD" strokeWidth="1" />

                  {/* Village canal line */}
                  <path
                    d="M 50 280 Q 200 240 450 290"
                    stroke="#9EC2A9"
                    strokeWidth="10"
                    fill="none"
                  />

                  {/* Plot 1 Boundary Polygon */}
                  <polygon
                    points="80,60 270,70 260,210 70,200"
                    fill="#1F4A3F"
                    fillOpacity="0.25"
                    stroke="#1F4A3F"
                    strokeWidth="2.5"
                    strokeDasharray={selectedPlot.id === 'plot-01' ? 'none' : '4 4'}
                  />
                  <text
                    x="110"
                    y="140"
                    fill="#10312B"
                    fontSize="13"
                    fontWeight="bold"
                  >
                    उत्तर वाला खेत (सोयाबीन 5 एकड़)
                  </text>

                  {/* Plot 2 Boundary Polygon */}
                  <polygon
                    points="290,75 440,85 430,220 280,210"
                    fill="#4E7967"
                    fillOpacity="0.2"
                    stroke="#4E7967"
                    strokeWidth="2.5"
                    strokeDasharray={selectedPlot.id === 'plot-02' ? 'none' : '4 4'}
                  />
                  <text
                    x="300"
                    y="145"
                    fill="#10312B"
                    fontSize="12"
                    fontWeight="bold"
                  >
                    नहर वाला खेत (गेहूं 3 एकड़)
                  </text>
                </svg>

                <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur px-3 py-1 rounded-xl text-[10px] font-mono text-[#10312B] border border-[#DCE9DD] shadow-soft">
                  सीहोर (23.2033° N, 77.0844° E)
                </div>
              </div>

              {/* Data transparency disclaimer */}
              <div className="mt-4 p-3.5 bg-[#EAF4E8] rounded-xl text-[11px] text-[#52685B] border border-[#DCE9DD] flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#1F4A3F] shrink-0 mt-0.5" />
                <span>
                  पारदर्शिता सूचना: हम सजावटी सैटेलाइट फिल्टर को वास्तविक उपग्रह निगरानी का रूप
                  नहीं देते। केवल वास्तविक सेंसिंग डेटा उपलब्ध होने पर ही एनडीवीआई इंडेक्स दिखाया
                  जाता है।
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Field Activities Log (6 Cols) */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <div>
                <CardTitle className="text-base text-[#10312B]">खेत कार्य इतिहास (Activity Log)</CardTitle>
                <CardDescription>
                  सिंचाई, खाद, कीटनाशक व जुताई खर्च का ब्योरा
                </CardDescription>
              </div>
              <span className="text-xs font-semibold text-[#1F4A3F]">
                कुल दर्ज कार्य: {activities.length}
              </span>
            </CardHeader>
            <CardContent className="p-5 flex-1 space-y-3 overflow-y-auto max-h-[360px]">
              {activities.length === 0 ? (
                <p className="text-xs text-[#718579] text-center py-6">
                  अभी तक कोई गतिविधि दर्ज नहीं है। ऊपर दिए गए बटन से नया कार्य जोड़ें।
                </p>
              ) : (
                activities.map((act) => (
                  <div
                    key={act.id}
                    className="p-4 rounded-2xl bg-white border border-[#DCE9DD] shadow-soft space-y-1.5 hover:border-[#C4DAC7] transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Badge variant="forest" size="sm">
                          {act.activityType}
                        </Badge>
                        <span className="font-semibold text-[#10312B]">
                          {act.plotName}
                        </span>
                      </div>
                      <span className="text-[#718579] font-mono text-[11px]">
                        {act.activityDate}
                      </span>
                    </div>
                    <p className="text-xs text-[#52685B] leading-relaxed">
                      {act.details}
                    </p>
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-[#718579] text-[11px]">लागत खर्च:</span>
                      <span className="font-bold text-[#10312B]">
                        {formatCurrency(act.costIncurred)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Activity Modal */}
      <Modal
        isOpen={isActivityModalOpen}
        onClose={() => setIsActivityModalOpen(false)}
        title="नया खेत कार्य जोड़ें"
        description="खेत में की गई बुवाई, सिंचाई, खाद या कीटनाशक छिड़काव का ब्योरा दर्ज करें"
      >
        <form onSubmit={handleCreateActivity} className="space-y-4">
          <Select
            label="कार्य प्रकार (Activity Type)"
            value={activityType}
            onChange={(e) => setActivityType(e.target.value)}
          >
            <option value="Irrigation">सिंचाई (Irrigation)</option>
            <option value="Fertilizer">उर्वरक/खाद (Fertilizer)</option>
            <option value="Pesticide">कीटनाशक/दवा (Pesticide Spray)</option>
            <option value="Sowing">बुवाई (Sowing)</option>
            <option value="Weeding">निंदाई-गुड़ाई (Weeding)</option>
            <option value="Harvesting">कटाई (Harvesting)</option>
          </Select>

          <Input
            label="तारीख (Date)"
            type="date"
            value={activityDate}
            onChange={(e) => setActivityDate(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-[#52685B] uppercase tracking-wider mb-1.5">
              कार्य विवरण (Details)
            </label>
            <textarea
              rows={3}
              value={activityDetails}
              onChange={(e) => setActivityDetails(e.target.value)}
              placeholder="उदा. पहली सिंचाई 2 घंटे नलकूप से की गई, या 25 किलो यूरिया डाला गया..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#DCE9DD] bg-white text-sm text-[#10312B] focus:outline-none focus:ring-2 focus:ring-[#1F4A3F]/20 focus:border-[#1F4A3F]"
              required
            />
          </div>

          <Input
            label="खर्च / लागत (₹ Incurred Cost)"
            type="number"
            min="0"
            value={activityCost}
            onChange={(e) => setActivityCost(Number(e.target.value))}
            helperText="मजदूरी, डीजल या खाद-दवा का कुल खर्च"
          />

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsActivityModalOpen(false)}
            >
              रद्द करें
            </Button>
            <Button type="submit" variant="primary">
              सुरक्षित करें
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
