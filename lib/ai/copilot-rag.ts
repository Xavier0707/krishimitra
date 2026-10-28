export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  sources?: Array<{ title: string; url?: string; organization: string }>;
  suggestedFollowUps?: string[];
}

export interface CopilotContext {
  farmerName: string;
  district: string;
  activeCrop: string;
  farmSizeAcres: number;
  currentWeatherTemp?: number;
  latestMandiModalPrice?: number;
}

export function generateCopilotResponse(
  query: string,
  context: CopilotContext,
  language: 'hi' | 'en' = 'hi'
): CopilotMessage {
  const q = query.toLowerCase();

  // 1. Wheat Irrigation (गेहूं सिंचाई)
  if (q.includes('wheat') || q.includes('गेहूं') || q.includes('सिंचाई') || q.includes('irrigation') || q.includes('पानी')) {
    if (language === 'hi') {
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: `शरबती व लोकवन गेहूं में सिंचाई की सबसे महत्वपूर्ण क्रांतिक अवस्थाएं (Critical Stages) निम्नलिखित हैं:\n\n1. **पहली सिंचाई (CRI Stage / शिखर जड़ अवस्था):** बुवाई के 20 से 25 दिन बाद। यह सबसे आवश्यक है, इस समय पानी न मिलने से कल्ले कम फूटते हैं।\n2. **दूसरी सिंचाई (कल्ले फूटते समय):** 40-45 दिन बाद।\n3. **तीसरी सिंचाई (गाभा / बाली निकलते समय):** 60-65 दिन बाद।\n4. **चौथी सिंचाई (दुग्ध / दाना भरते समय):** 80-85 दिन बाद।\n\n**महत्वपूर्ण सलाह:** आपके ${context.district} क्षेत्र की भारी काली मिट्टी में यदि 2-3 पानी की ही व्यवस्था हो, तो पहली सिंचाई बुवाई के 21 दिन पर और दूसरी सिंचाई बाली निकलने से ठीक पहले अवश्य दें।`,
        timestamp: new Date().toISOString(),
        sources: [
          {
            title: 'भारतीय गेहूं एवं जौ अनुसंधान संस्थान (ICAR-IIWBR) सिंचाई प्रबंधन संदर्शिका',
            organization: 'ICAR - Indian Institute of Wheat and Barley Research',
          },
          {
            title: 'कृषि विज्ञान केंद्र (KVK) सीहोर - रबी गेहूं पैकेज ऑफ प्रैक्टिसेज',
            organization: 'राजमाता विजयाराजे सिंधिया कृषि विश्वविद्यालय, ग्वालियर',
          },
        ],
        suggestedFollowUps: [
          'गेहूं में पहली सिंचाई पर कौन सी खाद डालनी चाहिए?',
          'शरबती गेहूं में पाले से बचाव के क्या उपाय हैं?',
          'आज सीहोर मंडी में गेहूं का क्या भाव है?',
        ],
      };
    } else {
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: `For Wheat (Sharbati & Lokwan) in ${context.district}, critical irrigation scheduling is vital:\n\n1. **First Irrigation (Crown Root Initiation - CRI):** 20–25 days after sowing. Most critical stage for root anchorage and tillering.\n2. **Second Irrigation (Tillering):** 40–45 days after sowing.\n3. **Third Irrigation (Heading/Flowering):** 60–65 days after sowing.\n4. **Fourth Irrigation (Milking / Grain filling):** 80–85 days after sowing.\n\n*Note:* On black soils with limited water (2 irrigations available), apply strictly at CRI (21 days) and Flowering stage.`,
        timestamp: new Date().toISOString(),
        sources: [
          {
            title: 'ICAR-IIWBR Wheat Agronomy Manual',
            organization: 'Indian Institute of Wheat & Barley Research',
          },
        ],
        suggestedFollowUps: [
          'What fertilizer should I apply during the first irrigation?',
          'How to prevent cold wave damage in wheat?',
        ],
      };
    }
  }

  // 2. Mandi & Selling Advice (मंडी / भाव / बेचना)
  if (q.includes('mandi') || q.includes('भाव') || q.includes('price') || q.includes('rate') || q.includes('कहाँ बेचूं') || q.includes('सेल')) {
    const cropName = context.activeCrop || 'Soybean';
    const priceText = context.latestMandiModalPrice ? `लगभग ₹${context.latestMandiModalPrice} प्रति क्विंटल` : '₹4,680 प्रति क्विंटल';
    
    if (language === 'hi') {
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: `वर्तमान मंडी आंकड़ों के अनुसार ${context.district} व आसपास के मंडियों में **${cropName}** का मॉडल भाव **${priceText}** चल रहा है।\n\n**शुद्ध लाभ का गणित:**\n- यदि आप दूर की मंडी (जैसे इंदौर) जाते हैं, तो ₹150-200 प्रति क्विंटल का अतिरिक्त परिवहन और पल्लेदारी खर्च लगेगा।\n- यदि स्थानीय मंडी और बड़ी मंडी के भाव में ₹300/क्विंटल से अधिक का अंतर है, तभी दूर की मंडी में उपज ले जाना लाभकारी होगा।\n- आप हमारे 'मंडी लाभ रडार' कैलकुलेटर में अपनी मात्रा डालकर दोनों मंडियों के शुद्ध हाथ में आने वाले मुनाफे की सीधी तुलना कर सकते हैं।`,
        timestamp: new Date().toISOString(),
        sources: [
          {
            title: 'एगमार्कनेट (Agmarknet) एवं म.प्र. राज्य कृषि विपणन बोर्ड दैनिक बुलेटिन',
            organization: 'Ministry of Agriculture & Farmers Welfare, Govt of India',
          },
        ],
        suggestedFollowUps: [
          'मंडी लाभ रडार खोलें और खर्च का हिसाब लगाएं',
          'क्या अभी उपज बेचना चाहिए या वेयरहाउस में रखना बेहतर है?',
        ],
      };
    } else {
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: `According to recent market arrivals, the benchmark modal price for **${cropName}** in ${context.district} is **${priceText}**.\n\n**Decision Insight:**\n- Transporting to larger terminal markets (e.g., Indore) costs roughly ₹150–200/quintal in freight and handling.\n- Only divert to distant APMCs if price realization exceeds local bids by at least ₹300/quintal.\n- Use our 'Mandi Profit Radar' to compute your exact net proceeds.`,
        timestamp: new Date().toISOString(),
        sources: [
          {
            title: 'Agmarknet / MP Mandi Board Daily Feeds',
            organization: 'Government of India',
          },
        ],
        suggestedFollowUps: [
          'Compare nearby mandis with net return calculator',
          'Calculate storage vs immediate sale scenario',
        ],
      };
    }
  }

  // 3. Pest / Crop Disease (कीट / रोग / इल्ली / स्प्रे)
  if (q.includes('कीट') || q.includes('रोग') || q.includes('इल्ली') || q.includes('pest') || q.includes('spray') || q.includes('insect') || q.includes('दवा')) {
    if (language === 'hi') {
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: `फसलों में कीट एवं रोग नियंत्रण हेतु एकीकृत कीट प्रबंधन (IPM) का पालन करें:\n\n1. **निगरानी (Scouting):** रासायनिक छिड़काव से पहले देखें कि खेत में आर्थिक क्षति स्तर (ETL) पार हुआ है या नहीं (जैसे 1 मीटर कतार में 2 से अधिक इल्लियां)।\n2. **जैविक उपाय:** शुरुआती प्रकोप में नीम तेल (1500 ppm) 3 मिली/लीटर या फेरोमोन ट्रैप (4-5 प्रति एकड़) लगाएं।\n3. **रासायनिक दवा:** तेज प्रकोप होने पर ही अनुशंसित कीटनाशक (जैसे क्लोरएंट्रानिलीप्रोल 18.5% SC @ 60 मिली/एकड़) का उपयोग करें।\n\n**सावधानी:** अत्यधिक धूप में छिड़काव न करें और सुरक्षात्मक चश्मा व मास्क का प्रयोग करें। किसी विशिष्ट लक्षण की जांच के लिए आप 'क्रॉप डॉक्टर' में फोटो अपलोड कर सकते हैं।`,
        timestamp: new Date().toISOString(),
        sources: [
          {
            title: 'आईसीएआर-भारतीय सोयाबीन अनुसंधान संस्थान (IISR) इंदौर कीट प्रबंधन एडवाइजरी',
            organization: 'ICAR - Indian Institute of Soybean Research, Indore',
          },
        ],
        suggestedFollowUps: [
          'क्रॉप डॉक्टर खोलें और पत्ती का फोटो स्कैन करें',
          'सोयाबीन में गर्डल बीटल (रिंग कटर) का उपचार क्या है?',
        ],
      };
    } else {
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: `Adopt Integrated Pest Management (IPM) principles for sustainable crop health:\n\n1. **Field Scouting:** Verify if the Economic Threshold Level (ETL) is reached before chemical spraying.\n2. **Bio-control:** Deploy yellow sticky traps, pheromone lures, or spray Neem oil (1500 ppm @ 3ml/L) at early incidence.\n3. **Approved Chemicals:** For severe lepidopteran infestations, use label-recommended insecticides like Chlorantraniliprole 18.5% SC @ 60ml/acre in 150L water.\n\n*Safety:* Avoid midday heat and wear protective gear. Upload photos to 'Crop Doctor' for symptom verification.`,
        timestamp: new Date().toISOString(),
        sources: [
          {
            title: 'ICAR-IISR Indore IPM Advisory Guide',
            organization: 'ICAR',
          },
        ],
        suggestedFollowUps: [
          'Open Crop Doctor to scan plant photo',
          'What is the treatment for yellow mosaic virus?',
        ],
      };
    }
  }

  // General Agricultural fallback
  if (language === 'hi') {
    return {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      text: `नमस्ते! मैं आपका **कृषि सारथी (Krishi Copilot)** हूँ।\n\nआप मुझसे आपकी **${context.activeCrop || 'फसल'}**, मौसम जोखिम, मंडी में भाव व शुद्ध मुनाफा, संतुलित उर्वरक (NPK) या कीट-रोग उपचार संबंधी कोई भी प्रश्न पूछ सकते हैं।\n\n*उदाहरण के लिए नीचे दिए गए प्रश्नों में से चुनें:*`,
      timestamp: new Date().toISOString(),
      sources: [
        {
          title: 'कृषि कनेक्ट एआई सत्यापित ज्ञान भंडार',
          organization: 'KrishiConnect AI Knowledge System',
        },
      ],
      suggestedFollowUps: [
        'गेहूं में पहली सिंचाई और खाद का सही समय क्या है?',
        'आज की तारीख में सोयाबीन का मंडी भाव और शुद्ध मुनाफा क्या है?',
        'मिट्टी जांच के आधार पर कौन सी फसल सबसे उपयुक्त है?',
        'फसल को गोदाम में रखने पर कितना फायदा या नुकसान होगा?',
      ],
    };
  }

  return {
    id: `msg-${Date.now()}`,
    sender: 'assistant',
    text: `Hello! I am your **Krishi Copilot**.\n\nYou can ask me specific agronomic questions regarding your **${context.activeCrop || 'crops'}**, weather risks in ${context.district}, real mandi price trends, fertilizer calculations, or pest management.\n\n*Suggested questions to explore:*`,
    timestamp: new Date().toISOString(),
    sources: [
      {
        title: 'KrishiConnect AI Verified Knowledge Repository',
        organization: 'KrishiConnect AI Knowledge Base',
      },
    ],
    suggestedFollowUps: [
      'When should I schedule the first irrigation for Sharbati wheat?',
      'Check current mandi rates and calculate transport deductions',
      'Evaluate crop suitability based on Soil Health Card readings',
      'Should I sell my produce now or store in warehouse?',
    ],
  };
}
