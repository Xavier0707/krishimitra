import { SoilTestResult, CropSuitabilityAssessment } from '../types';

export interface NutrientStandard {
  param: string;
  labelEn: string;
  labelHi: string;
  unit: string;
  lowThreshold: number;
  highThreshold: number;
  idealRange: string;
}

export const SOIL_STANDARDS: Record<string, NutrientStandard> = {
  ph: {
    param: 'ph',
    labelEn: 'Soil pH',
    labelHi: 'पीएच (pH) मान',
    unit: '',
    lowThreshold: 6.5,
    highThreshold: 7.8,
    idealRange: '6.5 - 7.5',
  },
  electricalConductivity: {
    param: 'electricalConductivity',
    labelEn: 'Electrical Conductivity (EC)',
    labelHi: 'विद्युत चालकता (लवणता)',
    unit: 'dS/m',
    lowThreshold: 0.1,
    highThreshold: 1.0,
    idealRange: '< 1.0 dS/m',
  },
  organicCarbonPercent: {
    param: 'organicCarbonPercent',
    labelEn: 'Organic Carbon (OC)',
    labelHi: 'जैविक कार्बन',
    unit: '%',
    lowThreshold: 0.5,
    highThreshold: 0.75,
    idealRange: '0.50 - 0.75%',
  },
  nitrogenKgHa: {
    param: 'nitrogenKgHa',
    labelEn: 'Available Nitrogen (N)',
    labelHi: 'उपलब्ध नाइट्रोजन',
    unit: 'kg/ha',
    lowThreshold: 280,
    highThreshold: 560,
    idealRange: '280 - 560 kg/ha',
  },
  phosphorusKgHa: {
    param: 'phosphorusKgHa',
    labelEn: 'Available Phosphorus (P)',
    labelHi: 'उपलब्ध फास्फोरस',
    unit: 'kg/ha',
    lowThreshold: 10,
    highThreshold: 25,
    idealRange: '10 - 25 kg/ha',
  },
  potassiumKgHa: {
    param: 'potassiumKgHa',
    labelEn: 'Available Potassium (K)',
    labelHi: 'उपलब्ध पोटाश',
    unit: 'kg/ha',
    lowThreshold: 120,
    highThreshold: 280,
    idealRange: '120 - 280 kg/ha',
  },
};

export function interpretNutrient(param: string, value: number): {
  status: 'Low' | 'Medium' | 'High' | 'Normal';
  statusHi: string;
  color: string;
} {
  const std = SOIL_STANDARDS[param];
  if (!std) return { status: 'Normal', statusHi: 'सामान्य', color: 'text-gray-700' };

  if (param === 'ph') {
    if (value < 6.0) return { status: 'Low', statusHi: 'अम्लीय (कम)', color: 'text-amber-600' };
    if (value > 8.0) return { status: 'High', statusHi: 'क्षारीय (अधिक)', color: 'text-rose-600' };
    return { status: 'Normal', statusHi: 'संतुलित (आदर्श)', color: 'text-emerald-700' };
  }

  if (param === 'electricalConductivity') {
    if (value > 1.2) return { status: 'High', statusHi: 'लवणीय (हानिकारक)', color: 'text-rose-600' };
    return { status: 'Normal', statusHi: 'सामान्य', color: 'text-emerald-700' };
  }

  if (value < std.lowThreshold) {
    return { status: 'Low', statusHi: 'कम (न्यून)', color: 'text-amber-600' };
  }
  if (value > std.highThreshold) {
    return { status: 'High', statusHi: 'पर्याप्त / उच्च', color: 'text-emerald-700' };
  }
  return { status: 'Medium', statusHi: 'मध्यम (संतुलित)', color: 'text-agri-600' };
}

/**
 * Scientific Crop Suitability Algorithm
 * Evaluates candidate crops against soil pH, nutrients, and MP agro-climatic conditions.
 */
export function evaluateCropSuitability(soil: SoilTestResult): CropSuitabilityAssessment[] {
  const assessments: CropSuitabilityAssessment[] = [];

  // 1. Soybean (सोयाबीन)
  let soyScore = 85;
  const soyReasons: string[] = [];
  const soyLimiting: string[] = [];

  if (soil.ph >= 6.5 && soil.ph <= 7.8) {
    soyReasons.push('मिट्टी का pH (6.5-7.8) सोयाबीन की जड़ ग्रंथियों (Rhizobium nodules) के लिए अत्यंत उपयुक्त है।');
  } else {
    soyScore -= 20;
    soyLimiting.push(`pH ${soil.ph} सोयाबीन के आदर्श दायरे (6.5 - 7.5) से थोड़ा विचलित है।`);
  }

  if (soil.phosphorusKgHa < 12) {
    soyScore -= 10;
    soyLimiting.push('फास्फोरस स्तर कम है; बुवाई के समय सिंगल सुपर फॉस्फेट (SSP) का उपयोग जरूरी है।');
  } else {
    soyReasons.push('फास्फोरस व जैविक कार्बन की मात्रा फलियों के समुचित विकास के लिए अनुकूल है।');
  }

  assessments.push({
    cropId: 'soybean',
    cropNameEn: 'Soybean',
    cropNameHi: 'सोयाबीन',
    suitabilityScore: Math.max(0, Math.min(100, soyScore)),
    rating: soyScore >= 80 ? 'Highly Suitable' : soyScore >= 60 ? 'Suitable' : 'Marginally Suitable',
    ratingHi: soyScore >= 80 ? 'अत्यधिक उपयुक्त' : soyScore >= 60 ? 'उपयुक्त' : 'मध्यम उपयुक्त',
    reasons: soyReasons,
    nutrientLimitingFactors: soyLimiting,
    fertilizerAdjustmentAdvice: 'सोयाबीन को सल्फर की आवश्यकता होती है। डीएपी के स्थान पर 50 किलो सिंगल सुपर फॉस्फेट (SSP) + 20 किलो पोटाश प्रति एकड़ दें।',
  });

  // 2. Wheat (Sharbati) (गेहूं शरबती)
  let wheatScore = 88;
  const wheatReasons: string[] = [];
  const wheatLimiting: string[] = [];

  if (soil.nitrogenKgHa < 250) {
    wheatScore -= 12;
    wheatLimiting.push('नाइट्रोजन की कमी से कल्ले (tillering) कम फूट सकते हैं।');
  } else {
    wheatReasons.push('नाइट्रोजन और पोटाश का स्तर शरबती गेहूं की सुनहरी चमक व दानों के वजन के अनुकूल है।');
  }

  if (soil.ph > 8.2) {
    wheatScore -= 15;
    wheatLimiting.push('अधिक क्षारीयता से सूक्ष्म पोषक तत्वों की उपलब्धता प्रभावित होगी।');
  }

  assessments.push({
    cropId: 'wheat_sharbati',
    cropNameEn: 'Wheat (Sharbati)',
    cropNameHi: 'गेहूं (शरबती C-306 / सुजाता)',
    suitabilityScore: Math.max(0, Math.min(100, wheatScore)),
    rating: wheatScore >= 80 ? 'Highly Suitable' : wheatScore >= 60 ? 'Suitable' : 'Marginally Suitable',
    ratingHi: wheatScore >= 80 ? 'अत्यधिक उपयुक्त' : wheatScore >= 60 ? 'उपयुक्त' : 'मध्यम उपयुक्त',
    reasons: wheatReasons,
    nutrientLimitingFactors: wheatLimiting,
    fertilizerAdjustmentAdvice: 'शरबती गेहूं में सीमित सिंचाई (2-3 पानी) में अधिक यूरिया न दें ताकि फसल गिरे नहीं। पहली सिंचाई पर 25 किलो यूरिया + जिंक सल्फेट दें।',
  });

  // 3. Bengal Gram (Chana) (चना)
  let chanaScore = 80;
  const chanaReasons: string[] = [];
  const chanaLimiting: string[] = [];

  if (soil.electricalConductivity > 1.0) {
    chanaScore -= 25;
    chanaLimiting.push('चना लवणता (salinity) के प्रति संवेदनशील है।');
  } else {
    chanaReasons.push('मध्यम मिट्टी व कम पानी में उत्कृष्ट पैदावार देने में सक्षम।');
  }

  assessments.push({
    cropId: 'chana_gram',
    cropNameEn: 'Bengal Gram (Chana)',
    cropNameHi: 'चना (देशी / जेजी 14)',
    suitabilityScore: Math.max(0, Math.min(100, chanaScore)),
    rating: chanaScore >= 80 ? 'Highly Suitable' : chanaScore >= 60 ? 'Suitable' : 'Marginally Suitable',
    ratingHi: chanaScore >= 80 ? 'अत्यधिक उपयुक्त' : chanaScore >= 60 ? 'उपयुक्त' : 'मध्यम उपयुक्त',
    reasons: chanaReasons,
    nutrientLimitingFactors: chanaLimiting,
    fertilizerAdjustmentAdvice: 'चने की जड़ों में राइजोबियम कल्चर का बीज उपचार अवश्य करें। रासायनिक नाइट्रोजन की न्यूनतम आवश्यकता होती है।',
  });

  // 4. Garlic (लहसुन)
  let garlicScore = 72;
  const garlicReasons: string[] = [];
  const garlicLimiting: string[] = [];

  if (soil.potassiumKgHa < 180) {
    garlicScore -= 18;
    garlicLimiting.push('लहसुन की गांठों (bulbs) के आकार के लिए पोटाश व सल्फर की उच्च आवश्यकता है।');
  }
  if (soil.organicCarbonPercent < 0.6) {
    garlicScore -= 10;
    garlicLimiting.push('मिट्टी में गोबर की सड़ी खाद (FYM) या कम्पोस्ट की अतिरिक्त खुराक दें।');
  }

  assessments.push({
    cropId: 'garlic',
    cropNameEn: 'Garlic',
    cropNameHi: 'लहसुन (G-282 / अमलेटा)',
    suitabilityScore: Math.max(0, Math.min(100, garlicScore)),
    rating: garlicScore >= 75 ? 'Highly Suitable' : garlicScore >= 60 ? 'Suitable' : 'Marginally Suitable',
    ratingHi: garlicScore >= 75 ? 'अत्यधिक उपयुक्त' : garlicScore >= 60 ? 'उपयुक्त' : 'मध्यम उपयुक्त',
    reasons: garlicReasons.length ? garlicReasons : ['मध्य प्रदेश की काली मिट्टी में लहसुन की व्यावसायिक खेती अत्यंत लाभकारी हो सकती है।'],
    nutrientLimitingFactors: garlicLimiting,
    fertilizerAdjustmentAdvice: 'बुवाई पूर्व 50 किलो म्यूरिएट ऑफ पोटाश (MOP) एवं 25 किलो बेंटोनाइट सल्फर का प्रयोग अनिवार्य है।',
  });

  return assessments.sort((a, b) => b.suitabilityScore - a.suitabilityScore);
}
