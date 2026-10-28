'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useI18n } from '@/lib/i18n/context';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import {
  Map as MapIcon,
  Plus,
  Calendar,
  Layers,
  Sprout,
  Activity,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertCircle,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-forest-950 flex items-center gap-2">
            <MapIcon className="w-6 h-6 text-forest-700" />
            <span>{t.nav.farmTwin}</span>
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-600 mt-0.5">
            खेत के भूखंड (Plots), बुवाई तारीख, फसल विकास चक्र और लागत प्रबंधन
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="agri"
            size="sm"
            onClick={() => setIsActivityModalOpen(true)}
            className="gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{t.dashboard.addActivity}</span>
          </Button>
        </div>
      </div>

      {/* Farm Overview Card */}
      <Card className="bg-gradient-to-r from-forest-900 to-forest-800 text-white">
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <span className="text-xs uppercase tracking-wider text-forest-300 font-semibold block">
              खेत का नाम
            </span>
            <h3 className="text-xl font-extrabold text-white mt-1">{farm.farmName}</h3>
            <p className="text-xs text-forest-200 mt-0.5">
              {farm.village}, {farm.district} ({farm.state})
            </p>
          </div>

          <div>
            <span className="text-xs uppercase tracking-wider text-forest-300 font-semibold block">
              कुल रकबा (Area)
            </span>
            <h3 className="text-xl font-extrabold text-white mt-1">
              {farm.totalArea} एकड़{' '}
              <span className="text-sm font-normal text-forest-300">
                (~12.8 बीघा)
              </span>
            </h3>
            <p className="text-xs text-forest-200 mt-0.5">
              मिट्टी: {farm.soilType}
            </p>
          </div>

          <div>
            <span className="text-xs uppercase tracking-wider text-forest-300 font-semibold block">
              सिंचाई स्रोत
            </span>
            <h3 className="text-lg font-bold text-white mt-1">{farm.waterSource}</h3>
            <p className="text-xs text-forest-200 mt-0.5">
              भूखंडों की संख्या: {farm.plots.length}
            </p>
          </div>

          <div>
            <span className="text-xs uppercase tracking-wider text-forest-300 font-semibold block">
              जीपीएस निर्देशांक
            </span>
            <h3 className="text-sm font-mono text-agri-300 mt-1">
              {farm.latitude}° N, {farm.longitude}° E
            </h3>
            <span className="inline-block mt-2 text-[10px] bg-forest-950/60 px-2 py-0.5 rounded text-forest-200 border border-forest-700/60">
              सत्यापित ओपनस्ट्रीटमैप ग्रिड
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Plot Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {farm.plots.map((plot) => {
          const isSelected = selectedPlot.id === plot.id;
          return (
            <button
              key={plot.id}
              onClick={() => setSelectedPlot(plot)}
              className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2 ${
                isSelected
                  ? 'bg-forest-800 text-white border-forest-900 shadow-sm'
                  : 'bg-white text-charcoal-700 border-charcoal-200 hover:bg-cream-100'
              }`}
            >
              <Sprout
                className={`w-4 h-4 ${isSelected ? 'text-agri-400' : 'text-forest-700'}`}
              />
              <span>{plot.plotName}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  isSelected ? 'bg-forest-900 text-agri-300' : 'bg-cream-200 text-charcoal-600'
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
            <CardTitle className="text-base">
              फसल विकास चक्र (Crop Growth Stage): {selectedPlot.cropNameHi}
            </CardTitle>
            <CardDescription>
              बुवाई तारीख: {selectedPlot.sowingDate} • अपेक्षित कटाई:{' '}
              {selectedPlot.expectedHarvestDate || 'प्रगति पर'}
            </CardDescription>
          </div>
          <Badge variant="forest">{selectedPlot.currentStage}</Badge>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {stages.map((stg, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <div
                  key={stg}
                  className={`p-3 rounded-xl border text-center text-xs transition-colors ${
                    isCurrent
                      ? 'bg-agri-50 border-agri-400 font-bold text-agri-950 shadow-xs'
                      : isPast
                      ? 'bg-cream-100/70 border-charcoal-200 text-charcoal-700'
                      : 'bg-white border-dashed border-charcoal-200 text-charcoal-400'
                  }`}
                >
                  <div className="flex justify-center mb-1">
                    {isPast ? (
                      <CheckCircle2 className="w-4 h-4 text-agri-600" />
                    ) : isCurrent ? (
                      <Clock className="w-4 h-4 text-agri-600 animate-spin" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-charcoal-300 inline-block text-[10px] leading-3 text-charcoal-400">
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
                <CardTitle className="text-base">खेत का नक्शा (Field Boundary)</CardTitle>
                <CardDescription>
                  ओपनस्ट्रीटमैप (OpenStreetMap) उपग्रह परिप्रेक्ष्य
                </CardDescription>
              </div>
              <Badge variant="neutral">OpenStreetMap</Badge>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex flex-col justify-between">
              {/* Responsive SVG Simulated Field Boundary Map */}
              <div className="w-full h-64 bg-[#e8f0e4] rounded-xl border border-charcoal-200 relative overflow-hidden flex items-center justify-center">
                <svg
                  className="w-full h-full"
                  viewBox="0 0 500 300"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Grid lines */}
                  <line x1="0" y1="50" x2="500" y2="50" stroke="#d5e3ce" strokeWidth="1" />
                  <line x1="0" y1="150" x2="500" y2="150" stroke="#d5e3ce" strokeWidth="1" />
                  <line x1="0" y1="250" x2="500" y2="250" stroke="#d5e3ce" strokeWidth="1" />
                  <line x1="100" y1="0" x2="100" y2="300" stroke="#d5e3ce" strokeWidth="1" />
                  <line x1="250" y1="0" x2="250" y2="300" stroke="#d5e3ce" strokeWidth="1" />
                  <line x1="400" y1="0" x2="400" y2="300" stroke="#d5e3ce" strokeWidth="1" />

                  {/* Village road / canal */}
                  <path
                    d="M 50 280 Q 200 240 450 290"
                    stroke="#b7c9b0"
                    strokeWidth="12"
                    fill="none"
                  />

                  {/* Plot 1 Boundary Polygon */}
                  <polygon
                    points="80,60 270,70 260,210 70,200"
                    fill="#2e7d32"
                    fillOpacity="0.25"
                    stroke="#15803d"
                    strokeWidth="2.5"
                    strokeDasharray={selectedPlot.id === 'plot-01' ? 'none' : '4 4'}
                  />
                  <text
                    x="110"
                    y="140"
                    fill="#15803d"
                    fontSize="13"
                    fontWeight="bold"
                  >
                    उत्तर वाला खेत (सोयाबीन 5 एकड़)
                  </text>

                  {/* Plot 2 Boundary Polygon */}
                  <polygon
                    points="290,75 440,85 430,220 280,210"
                    fill="#8b5e3c"
                    fillOpacity="0.2"
                    stroke="#8b5e3c"
                    strokeWidth="2.5"
                    strokeDasharray={selectedPlot.id === 'plot-02' ? 'none' : '4 4'}
                  />
                  <text
                    x="300"
                    y="145"
                    fill="#643521"
                    fontSize="12"
                    fontWeight="bold"
                  >
                    नहर वाला खेत (गेहूं 3 एकड़)
                  </text>
                </svg>

                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-md text-[10px] font-mono text-charcoal-700 border border-charcoal-200">
                  सीहोर (23.2033° N, 77.0844° E)
                </div>
              </div>

              {/* Data transparency disclaimer */}
              <div className="mt-3 p-3 bg-cream-100 rounded-lg text-[11px] text-charcoal-600 border border-charcoal-200/80 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-agri-600 shrink-0 mt-0.5" />
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
                <CardTitle className="text-base">खेत कार्य इतिहास (Activity Log)</CardTitle>
                <CardDescription>
                  सिंचाई, खाद, कीटनाशक व जुताई खर्च का ब्योरा
                </CardDescription>
              </div>
              <span className="text-xs font-semibold text-agri-700">
                कुल दर्ज कार्य: {activities.length}
              </span>
            </CardHeader>
            <CardContent className="p-4 flex-1 space-y-3 overflow-y-auto max-h-[360px]">
              {activities.length === 0 ? (
                <p className="text-xs text-charcoal-500 text-center py-6">
                  अभी तक कोई गतिविधि दर्ज नहीं है। ऊपर दिए गए बटन से नया कार्य जोड़ें।
                </p>
              ) : (
                activities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3.5 rounded-xl bg-white border border-charcoal-200 shadow-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Badge variant="forest" size="sm">
                          {act.activityType}
                        </Badge>
                        <span className="font-semibold text-charcoal-900">
                          {act.plotName}
                        </span>
                      </div>
                      <span className="text-charcoal-500 font-mono text-[11px]">
                        {act.activityDate}
                      </span>
                    </div>
                    <p className="text-xs text-charcoal-700 leading-relaxed">
                      {act.details}
                    </p>
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-charcoal-500 text-[11px]">लागत खर्च:</span>
                      <span className="font-bold text-forest-900">
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
            <label className="block text-xs font-semibold text-charcoal-700 uppercase tracking-wider mb-1.5">
              कार्य विवरण (Details)
            </label>
            <textarea
              rows={3}
              value={activityDetails}
              onChange={(e) => setActivityDetails(e.target.value)}
              placeholder="उदा. पहली सिंचाई 2 घंटे नलकूप से की गई, या 25 किलो यूरिया डाला गया..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-charcoal-300 bg-white text-sm text-charcoal-900 focus:outline-none focus:ring-2 focus:ring-forest-600 focus:border-forest-600"
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
            <Button type="submit" variant="agri">
              सुरक्षित करें
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
