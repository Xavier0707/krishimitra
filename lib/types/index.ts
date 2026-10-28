// KrishiConnect AI - Core Domain Types

export type Language = 'hi' | 'en';

export type AreaUnit = 'acre' | 'bigha' | 'hectare';

export interface FarmerProfile {
  id: string;
  fullName: string;
  phoneNumber?: string;
  preferredLanguage: Language;
  state: string;
  district: string;
  subDistrictTehsil?: string;
  village?: string;
  isDemo: boolean;
}

export interface FarmPlot {
  id: string;
  farmId: string;
  plotName: string;
  plotArea: number; // in areaUnit
  areaUnit: AreaUnit;
  cropId: string;
  cropNameEn: string;
  cropNameHi: string;
  cropVariety: string;
  sowingDate: string; // ISO date string
  expectedHarvestDate?: string;
  currentStage: 'Sowing' | 'Germination' | 'Vegetative' | 'Flowering' | 'Pod/Grain Development' | 'Maturity' | 'Harvested';
  boundaryGeoJson?: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  isDemo: boolean;
}

export interface Farm {
  id: string;
  farmerId: string;
  farmName: string;
  totalArea: number;
  areaUnit: AreaUnit;
  village: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  soilType: string;
  waterSource: string;
  plots: FarmPlot[];
  isDemo: boolean;
}

export interface CropReference {
  id: string;
  nameEn: string;
  nameHi: string;
  variety: string;
  season: 'Kharif' | 'Rabi' | 'Zaid';
  durationDays: number;
  idealPhMin: number;
  idealPhMax: number;
  waterRequirement: 'Low' | 'Medium' | 'High';
  standardMsp: number; // ₹ per Quintal
  mspYear: string;
}

export interface WeatherDayForecast {
  date: string;
  tempMax: number;
  tempMin: number;
  precipitationMm: number;
  precipitationProbability: number;
  maxWindSpeedKmh: number;
  relativeHumidityAvg: number;
  weatherCode: number;
  weatherDescription: string;
  iconName: string;
}

export interface WeatherRiskAlert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  titleEn: string;
  titleHi: string;
  messageEn: string;
  messageHi: string;
  affectedCrops: string[];
  preventiveActionEn: string;
  preventiveActionHi: string;
  source: string;
}

export interface WeatherData {
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  retrievedAt: string;
  isLive: boolean;
  source: string;
  current: {
    temp: number;
    apparentTemp: number;
    relativeHumidity: number;
    windSpeedKmh: number;
    weatherCode: number;
    weatherDescription: string;
    precipitationMm: number;
  };
  daily: WeatherDayForecast[];
  cropRisks: WeatherRiskAlert[];
}

export interface MandiPriceRecord {
  id: string;
  state: string;
  district: string;
  marketName: string;
  commodity: string;
  variety: string;
  grade?: string;
  arrivalDate: string;
  minPrice: number | null; // ₹/Quintal (null if not reported)
  maxPrice: number | null; // ₹/Quintal
  modalPrice: number | null; // ₹/Quintal
  unit?: string; // '₹/Quintal'
  dataSource: string;
  isLive: boolean;
  retrievedAt: string;
}

export interface NetReturnInput {
  quantity: number; // quantity in quantityUnit
  quantityUnit: 'quintal' | 'kg' | 'ton';
  expectedSellingPrice: number; // ₹ per Quintal
  transportCost: number; // total ₹
  handlingLaborCost: number; // total ₹
  mandiCommissionCess: number; // total ₹
  storageCost: number; // total ₹
  packagingBagsCost: number; // total ₹
  otherExpenses: number; // total ₹
  productionCostPerUnit?: number; // ₹ per Quintal
}

export interface NetReturnBreakdown {
  quantityQuintals: number;
  grossRevenue: number;
  totalMarketingExpenses: number;
  netProceeds: number;
  effectivePricePerQuintal: number;
  totalProductionCost?: number;
  netFarmProfit?: number;
  expenseBreakdown: {
    transport: number;
    handling: number;
    mandiCharges: number;
    storage: number;
    packaging: number;
    other: number;
  };
}

export interface CropSymptomDiagnosis {
  conditionNameEn: string;
  conditionNameHi: string;
  confidenceTier: 'High' | 'Moderate' | 'Preliminary Observation';
  scientificName?: string;
  symptomsObserved: string[];
  favorableWeatherConditions: string;
  organicManagementEn: string[];
  organicManagementHi: string[];
  chemicalManagementEn: string[];
  chemicalManagementHi: string[];
  precautionsEn: string[];
  precautionsHi: string[];
  disclaimer: string;
  requiresExpertVisit: boolean;
}

export interface SoilTestResult {
  id: string;
  farmId: string;
  plotId?: string;
  testDate: string;
  sampleId?: string;
  labName?: string;
  ph: number;
  electricalConductivity: number; // dS/m
  organicCarbonPercent: number; // %
  nitrogenKgHa: number; // kg/ha
  phosphorusKgHa: number; // kg/ha
  potassiumKgHa: number; // kg/ha
  sulfurPpm?: number;
  zincPpm?: number;
  ironPpm?: number;
  isDemo: boolean;
}

export interface CropSuitabilityAssessment {
  cropId: string;
  cropNameEn: string;
  cropNameHi: string;
  suitabilityScore: number; // 0 - 100
  rating: 'Highly Suitable' | 'Suitable' | 'Marginally Suitable' | 'Not Recommended';
  ratingHi: string;
  reasons: string[];
  nutrientLimitingFactors: string[];
  fertilizerAdjustmentAdvice: string;
}

export interface StorageScenarioInput {
  cropName: string;
  quantityQuintals: number;
  currentMandiPrice: number; // ₹/Quintal
  storageDurationMonths: number;
  storageCostPerMonthPerQuintal: number; // ₹/Quintal/month
  expectedFuturePrice: number; // ₹/Quintal
  storageWeightLossRatePercent: number; // e.g. 2% weight loss / moisture loss
  transportHandlingCostNow: number;
  transportHandlingCostLater: number;
}

export interface StorageScenarioResult {
  sellNowGrossRevenue: number;
  sellNowNetRevenue: number;
  storeSellLaterGrossRevenue: number;
  totalStorageCharges: number;
  weightLossDeductionQuintals: number;
  finalSalableQuantityQuintals: number;
  storeSellLaterNetRevenue: number;
  netGainOrLoss: number;
  percentageReturn: number;
  breakEvenFuturePrice: number;
  verdict: 'Store Produce' | 'Sell Now' | 'Neutral/Borderline';
  verdictReason: string;
  sensitivityTable: Array<{
    priceScenarioLabel: string;
    futurePrice: number;
    netGain: number;
    roiPercent: number;
  }>;
}

export interface FarmActivity {
  id: string;
  plotId: string;
  plotName: string;
  activityType: 'Sowing' | 'Irrigation' | 'Fertilizer' | 'Pesticide' | 'Harvesting' | 'Weeding' | 'Scouting';
  activityDate: string;
  details: string;
  costIncurred: number;
  isDemo: boolean;
}
