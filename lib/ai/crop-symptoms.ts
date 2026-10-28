import { CropSymptomDiagnosis } from '../types';

export interface SymptomRule {
  cropId: string;
  keywords: string[];
  diagnosis: CropSymptomDiagnosis;
}

export const CROP_SYMPTOM_DATABASE: SymptomRule[] = [
  // Soybean: Yellow Mosaic Virus
  {
    cropId: 'soybean',
    keywords: ['yellow', 'mosaic', 'yellowing', 'पीली', 'पीला', 'मोजेक', 'सफेद मक्खी'],
    diagnosis: {
      conditionNameEn: 'Yellow Mosaic Virus (YMV)',
      conditionNameHi: 'सोयाबीन का पीला मोजेक वायरस रोग',
      confidenceTier: 'Moderate',
      scientificName: 'Soybean Mungbean Yellow Mosaic India Virus',
      symptomsObserved: [
        'पत्तियों पर अनियमित पीले और हरे चकत्ते (Mosaic pattern)',
        'नई पत्तियां सिकुड़ना और पौधों का विकास रुकना',
        'सफेद मक्खी (Whitefly) द्वारा वायरस का तेजी से प्रसार',
      ],
      favorableWeatherConditions: 'उच्च तापमान (30-35°C) और मध्यम आर्द्रता सफेद मक्खी के गुणन को बढ़ाती है।',
      organicManagementEn: [
        'Install yellow sticky traps (15-20 per acre) at crop canopy level to catch whiteflies.',
        'Spray Neem Oil (Azadirachtin 1500 ppm) @ 3-4 ml per liter water in early infestation.',
        'Rogue out and bury severely infected plants away from the field.',
      ],
      organicManagementHi: [
        'खेत में 15-20 पीले चिपचिपे प्रपंच (Yellow Sticky Traps) प्रति एकड़ लगाएं।',
        'शुरुआती अवस्था में नीम का तेल (1500 ppm) 3-4 मिली प्रति लीटर पानी की दर से छिड़कें।',
        'रोगग्रस्त पौधों को तुरंत उखाड़कर खेत से दूर गड्ढे में दबा दें।',
      ],
      chemicalManagementEn: [
        'For vector control: Thiamethoxam 25% WG @ 40g/acre OR Beta-cyfluthrin + Imidacloprid @ 140 ml/acre in 150L water.',
        'Caution: Follow manufacturer label. Do not apply during extreme midday heat.',
      ],
      chemicalManagementHi: [
        'सफेद मक्खी नियंत्रण हेतु: थायमेथोक्सम 25% WG (40 ग्राम प्रति एकड़) अथवा बीटा-साइफ्लूथ्रिन + इमिडाक्लोप्रिड (140 मिली/एकड़) 150 लीटर पानी में मिलाकर छिड़कें।',
        'सावधानी: अधिक धूप में छिड़काव न करें। सुरक्षात्मक चश्मा व मास्क पहनें।',
      ],
      precautionsEn: [
        'Use YMV tolerant varieties like JS 20-34 or NRC 37 in next sowing.',
        'Maintain field sanitation and remove weeds from bunds.',
      ],
      precautionsHi: [
        'अगली बुवाई में रोगरोधी किस्में (जैसे JS 20-34, JS 20-29) का ही चयन करें।',
        'मेड़ों से गाजरघास व खरपतवार साफ रखें जहां सफेद मक्खी शरण लेती है।',
      ],
      disclaimer: 'यह एआई आधारित प्रारंभिक पहचान है। किसी भी रासायनिक छिड़काव से पूर्व क्षेत्रीय कृषि विस्तार अधिकारी अथवा नजदीकी कृषि विज्ञान केंद्र से पुष्टि करें।',
      requiresExpertVisit: false,
    },
  },

  // Soybean: Girdle Beetle / Ring Cutter
  {
    cropId: 'soybean',
    keywords: ['ring', 'girdle', 'cutter', 'stem', 'चक्र भृंग', 'रिंग कटर', 'तना कट', 'सूख रहा'],
    diagnosis: {
      conditionNameEn: 'Girdle Beetle (Ring Cutter)',
      conditionNameHi: 'चक्र भृंग (गर्डल बीटल / रिंग कटर कीट)',
      confidenceTier: 'High',
      scientificName: 'Oberia brevis Gahan',
      symptomsObserved: [
        'तने या शाखा पर दो समानांतर गोल छल्ले (rings) कटना',
        'छल्लों के बीच मादा कीट द्वारा अंडे देना और ऊपर का हिस्सा मुरझाकर सूख जाना',
        'फसल में 30 से 45 दिन की अवस्था में सर्वाधिक प्रकोप',
      ],
      favorableWeatherConditions: 'बादल छाए रहना और लगातार उमस भरा मौसम इस कीट के लिए अनुकूल है।',
      organicManagementEn: [
        'Handpick and destroy ring-cut dry petioles and branches during early stage.',
        'Spray Beauveria bassiana (entomopathogenic fungus) @ 5g per liter in humid conditions.',
      ],
      organicManagementHi: [
        'शुरुआती प्रकोप में कटे हुए मुरझाए डंठलों को हाथों से तोड़कर नष्ट करें।',
        'जैविक फफूंद ब्युवेरिया बासियाना 5 ग्राम प्रति लीटर पानी का छिड़काव करें।',
      ],
      chemicalManagementEn: [
        'Chlorantraniliprole 18.5% SC @ 60 ml/acre OR Thiamethoxam + Lambda-cyhalothrin @ 50 ml/acre in 150-200L water.',
      ],
      chemicalManagementHi: [
        'कीट की रोकथाम हेतु: क्लोरएंट्रानिलीप्रोल 18.5% SC (कोराजन) 60 मिली प्रति एकड़ अथवा थायमेथोक्सम + लैम्ब्डा-साइहेलोथ्रिन 50 मिली प्रति एकड़ 150 लीटर पानी में मिलाकर छिड़कें।',
      ],
      precautionsEn: [
        'Avoid excessive urea fertilizer as lush green succulent stems attract beetles.',
      ],
      precautionsHi: [
        'खेत में अत्यधिक यूरिया का उपयोग न करें, कोमल तनों पर यह कीट अधिक आकर्षित होता है।',
      ],
      disclaimer: 'रासायनिक कीटनाशकों का प्रयोग केवल आर्थिक क्षति स्तर (ETL) पार होने पर ही करें।',
      requiresExpertVisit: false,
    },
  },

  // Wheat: Rust (रतुआ रोग)
  {
    cropId: 'wheat',
    keywords: ['rust', 'orange', 'yellow rust', 'pustules', 'रतुआ', 'गेरुआ', 'पीला पाउडर', 'हल्दी'],
    diagnosis: {
      conditionNameEn: 'Wheat Stripe / Yellow Rust',
      conditionNameHi: 'गेहूं का पीला रतुआ (हल्दी रोग / Yellow Rust)',
      confidenceTier: 'High',
      scientificName: 'Puccinia striiformis',
      symptomsObserved: [
        'पत्तियों की ऊपरी सतह पर हल्दी जैसे पीले पाउडर की धारियां (Pustules)',
        'उंगलियों से छूने पर पीला चूर्ण लग जाना',
        'पौधों की प्रकाश संश्लेषण क्षमता कम होना और दाना सिकुड़ना',
      ],
      favorableWeatherConditions: 'ठंडा व नम मौसम (तापमान 10-20°C) और सुबह के समय भारी ओस।',
      organicManagementEn: [
        'Avoid excess nitrogenous fertilizers.',
        'Foliar spray of Sour Buttermilk (खट्टी छाछ) with hing (asafetida) at very early stage.',
      ],
      organicManagementHi: [
        'नाइट्रोजन (यूरिया) की अतिरिक्त मात्रा तत्काल रोकें।',
        'खेत में जलजमाव न होने दें और सूर्य की सीधी धूप लगने दें।',
      ],
      chemicalManagementEn: [
        'Propiconazole 25% EC (Tilt) @ 200 ml in 200 liters of water per acre.',
        'Repeat after 15 days if new yellow stripes appear.',
      ],
      chemicalManagementHi: [
        'प्रोपिकोनाजोल 25% EC (टिल्ट) 200 मिली प्रति 200 लीटर पानी प्रति एकड़ का घोल बनाकर छिड़काव करें।',
        'यदि 15 दिन बाद दोबारा लक्षण दिखें तो दूसरा छिड़काव करें।',
      ],
      precautionsEn: [
        'Plant certified rust-resistant varieties like MP-3288, GW-322, or Sharbati C-306.',
      ],
      precautionsHi: [
        'प्रमाणित रतुआ-रोधी किस्मों (जैसे GW-322, MP-3288, पूसा तेजस) की बुवाई करें।',
      ],
      disclaimer: 'पीला रतुआ एक गंभीर संक्रामक रोग है। पुष्टि हेतु तुरंत कृषि विभाग को सूचित करें।',
      requiresExpertVisit: true,
    },
  },

  // Gram / Chana: Fusarium Wilt (उकठा रोग)
  {
    cropId: 'chana',
    keywords: ['wilt', 'drying', 'roots black', 'उकठा', 'सूखा', 'जड़ काली', 'मुरझाना'],
    diagnosis: {
      conditionNameEn: 'Fusarium Wilt of Chickpea',
      conditionNameHi: 'चने का उकठा रोग (विल्ट / Fusarium Wilt)',
      confidenceTier: 'Moderate',
      scientificName: 'Fusarium oxysporum f. sp. ciceris',
      symptomsObserved: [
        'हरे पौधे अचानक नीचे से ऊपर की ओर मुरझाकर सूख जाना',
        'पौधे को उखाड़कर तने को बीच से चीरने पर अंदर की नलिकाएं भूरी या काली दिखाई देना',
        'खेत में टुकड़ों-टुकड़ों (patches) में पौधों का सूखना',
      ],
      favorableWeatherConditions: 'तापमान 25°C से अधिक होना और मिट्टी में नमी की कमी।',
      organicManagementEn: [
        'Apply Trichoderma viride enriched FYM (2 kg Trichoderma mixed in 100 kg compost per acre) at land preparation.',
        'Practice 3-year crop rotation with non-host crops like wheat or mustard.',
      ],
      organicManagementHi: [
        'खेत की तैयारी के समय 2 किलो ट्राइकोडर्मा विरिडी को 100 किलो सड़ी गोबर खाद में मिलाकर खेत में फैलाएं।',
        'फसल चक्र अपनाएं (चने के बाद सरसों या गेहूं लगाएं)।',
      ],
      chemicalManagementEn: [
        'Seed treatment is crucial before sowing: Carbendazim + Mancozeb (2g/kg seed).',
        'Post-emergence chemical drenches have limited effectiveness against soil-borne vascular wilt.',
      ],
      chemicalManagementHi: [
        'बुवाई से पूर्व बीज उपचार सबसे प्रभावी है: कार्बेन्डाजिम + मैंकोजेब (2 ग्राम प्रति किलो बीज)।',
        'खड़े खेत में उकठा रोग आने पर रासायनिक उपचार की सफलता दर सीमित रहती है।',
      ],
      precautionsEn: [
        'Sow wilt-resistant varieties such as JG 14, JAKI 9218, or RVG 202.',
        'Avoid deep sowing in hot soil conditions.',
      ],
      precautionsHi: [
        'उकठा-रोधी उन्नत किस्में जैसे JG-14, JAKI-9218, या RVG-202 की ही बुवाई करें।',
      ],
      disclaimer: 'यह मृदा जनित कवक रोग है। अत्यधिक सूखे पौधों को उखाड़कर तुरंत नष्ट करें।',
      requiresExpertVisit: true,
    },
  },
];

/**
 * Match visible symptoms or image description with agricultural disease database
 */
export function diagnoseCropSymptoms(
  cropType: string,
  userDescription: string
): CropSymptomDiagnosis {
  const normalizedDesc = userDescription.toLowerCase();
  const normalizedCrop = cropType.toLowerCase();

  // Find best match in database
  const matchingRule = CROP_SYMPTOM_DATABASE.find((rule) => {
    const cropMatch =
      rule.cropId.includes(normalizedCrop) ||
      normalizedCrop.includes(rule.cropId) ||
      (normalizedCrop.includes('soy') && rule.cropId === 'soybean') ||
      (normalizedCrop.includes('wheat') && rule.cropId === 'wheat') ||
      (normalizedCrop.includes('chana') && rule.cropId === 'chana');

    if (!cropMatch) return false;

    return rule.keywords.some((kw) => normalizedDesc.includes(kw.toLowerCase()));
  });

  if (matchingRule) {
    return matchingRule.diagnosis;
  }

  // Fallback for general symptoms
  return {
    conditionNameEn: 'Nutrient Stress or Early Stage Foliar Infection',
    conditionNameHi: 'पोषक तत्व असंतुलन अथवा प्रारंभिक पत्ती संक्रमण',
    confidenceTier: 'Preliminary Observation',
    symptomsObserved: [
      userDescription || 'वर्णित लक्षणों में विशिष्ट रोग के स्पष्ट संकेत नहीं मिले।',
      'पत्तियों पर हल्का पीलापन अथवा क्लोरोसिस हो सकता है।',
    ],
    favorableWeatherConditions: 'मौसम परिवर्तन अथवा खेत में पानी के उतार-चढ़ाव से पौधों में अस्थाई तनाव संभव है।',
    organicManagementEn: [
      'Ensure proper soil aeration and avoid over-irrigation or water stagnation.',
      'Apply spray of vermiwash or bio-stimulant to boost natural plant immunity.',
    ],
    organicManagementHi: [
      'खेत में जलभराव न होने दें तथा उचित वायु संचार बनाए रखें।',
      'पौधों की प्रतिरोधक क्षमता बढ़ाने हेतु वर्मीवाश (केंचुआ पानी) अथवा जैविक टॉनिक का छिड़काव करें।',
    ],
    chemicalManagementEn: [
      'Spray 19:19:19 (NPK) water-soluble fertilizer @ 1 kg in 150 liters water for quick revitalization.',
    ],
    chemicalManagementHi: [
      'तत्काल पोषण सुधार हेतु 19:19:19 (NPK) घुलनशील उर्वरक (1 किलो प्रति 150 लीटर पानी) का छिड़काव करें।',
    ],
    precautionsEn: [
      'Monitor the crop over the next 3 days and take higher resolution photographs of leaf undersides.',
    ],
    precautionsHi: [
      'आगामी 3 दिनों तक निगरानी रखें और पत्ती की निचली सतह का स्पष्ट फोटो लेकर जांचें।',
    ],
    disclaimer: 'यह एक प्रारंभिक अवलोकन है। सटीक जांच के लिए नजदीकी कृषि विज्ञान केंद्र (KVK) के वैज्ञानिक से संपर्क करें।',
    requiresExpertVisit: false,
  };
}
