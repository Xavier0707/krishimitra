import { WeatherDayForecast, WeatherRiskAlert } from '../types';

interface RiskEvaluationParams {
  currentTemp: number;
  currentHumidity: number;
  dailyForecasts: WeatherDayForecast[];
  activeCrops: string[];
}

export function evaluateCropWeatherRisks({
  currentHumidity,
  dailyForecasts,
  activeCrops,
}: RiskEvaluationParams): WeatherRiskAlert[] {
  const alerts: WeatherRiskAlert[] = [];

  // Check 1: Significant rain event in the next 3 days
  const nearTermRainDays = dailyForecasts.slice(0, 3).filter((d) => d.precipitationMm > 5 || d.precipitationProbability > 60);
  if (nearTermRainDays.length > 0) {
    const rainTotal = nearTermRainDays.reduce((acc, curr) => acc + curr.precipitationMm, 0);
    alerts.push({
      id: 'rain-risk-advisory',
      severity: rainTotal > 20 ? 'critical' : 'warning',
      titleEn: 'Rainfall Advisory in Upcoming 48-72 Hours',
      titleHi: 'अगले 48-72 घंटों में वर्षा की संभावना',
      messageEn: `Forecast indicates approx ${Math.round(rainTotal)}mm precipitation. Avoid spraying pesticides or chemical fertilizers as surface run-off will occur.`,
      messageHi: `आगामी 2-3 दिनों में लगभग ${Math.round(rainTotal)} मिमी वर्षा का अनुमान है। कीटनाशक व यूरिया/उर्वरक छिड़काव स्थगित रखें ताकि दवा धुलकर व्यर्थ न हो।`,
      affectedCrops: activeCrops,
      preventiveActionEn: 'Postpone harvesting and chemical spraying. Ensure field drainage channels are clear.',
      preventiveActionHi: 'कटाई व रासायनिक छिड़काव टालें। खेतों में जल निकासी की नालियां साफ रखें।',
      source: 'KrishiConnect Agricultural Risk Engine based on Open-Meteo',
    });
  }

  // Check 2: High humidity + warm temperature -> Fungal Disease Alert (Soybean Rust, Powdery Mildew, Leaf Spot)
  const highHumidityDays = dailyForecasts.filter((d) => d.relativeHumidityAvg > 75 && d.tempMax >= 25);
  if (currentHumidity > 75 || highHumidityDays.length >= 2) {
    alerts.push({
      id: 'fungal-risk-alert',
      severity: 'warning',
      titleEn: 'Favorable Conditions for Fungal & Rust Infections',
      titleHi: 'फफूंद जनित रोगों व रतुआ (Rust) का अनुकूल वातावरण',
      messageEn: 'Continuous relative humidity (>75%) coupled with moderate temperatures promotes fungal spore germination in soybean, gram, and wheat.',
      messageHi: 'उच्च आर्द्रता (>75%) और मध्यम तापमान से फसलों में फंगस, पीला मोजेक व पत्ती धब्बा रोग पनपने का जोखिम रहता है।',
      affectedCrops: activeCrops.filter((c) => ['Soybean', 'Wheat', 'Gram', 'चना', 'सोयाबीन'].some((k) => c.toLowerCase().includes(k.toLowerCase()))),
      preventiveActionEn: 'Scout field edges for early yellowing or pustules. Prepare biological Trichoderma or approved fungicide if threshold exceeds.',
      preventiveActionHi: 'खेत में पत्तियों की निचली सतह का निरीक्षण करें। प्राथमिक लक्षण दिखने पर अनुशंसित फफूंदनाशक का छिड़काव करें।',
      source: 'ICAR / MP Krishi Vigyan Kendra Agronomy Guidelines',
    });
  }

  // Check 3: Cold Wave / Frost Risk (Night temp < 5°C)
  const frostDays = dailyForecasts.filter((d) => d.tempMin <= 4);
  if (frostDays.length > 0) {
    alerts.push({
      id: 'frost-risk-alert',
      severity: 'critical',
      titleEn: 'Cold Wave & Frost (पाला) Warning',
      titleHi: 'शीत लहर व पाला (Frost) का गंभीर खतरा',
      messageEn: `Night temperatures projected to drop below 4°C on ${frostDays[0].date}. Sensitive flowering crops (Gram/Mustard/Garlic) require urgent protection.`,
      messageHi: `आगामी दिनों में रात का तापमान 4°C से नीचे जाने की संभावना है। चना व सरसों के फूल-फलियों को पाले से नुकसान हो सकता है।`,
      affectedCrops: ['Gram', 'Mustard', 'Garlic', 'Wheat', 'चना', 'सरसों', 'लहसुन'],
      preventiveActionEn: 'Give light evening irrigation to raise soil temperature. Create smoky smudges (धुआं) around field borders on calm cold nights.',
      preventiveActionHi: 'खेत में शाम के समय हल्की सिंचाई करें तथा मेड़ों पर धुआं करें ताकि पाले का असर कम हो सके।',
      source: 'Krishi Risk Engine (Frost Protection Protocol)',
    });
  }

  return alerts;
}
