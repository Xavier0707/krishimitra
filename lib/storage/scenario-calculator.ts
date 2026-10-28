import { StorageScenarioInput, StorageScenarioResult } from '../types';

/**
 * Smart Storage vs Sell Now Scenario Simulator
 * Empowers farmers to make rational financial decisions about storing grains in warehouses/cold storage.
 */
export function calculateStorageScenario(input: StorageScenarioInput): StorageScenarioResult {
  const qty = Math.max(0, input.quantityQuintals);
  const currentPrice = Math.max(0, input.currentMandiPrice);
  const months = Math.max(0, input.storageDurationMonths);
  const costPerMonth = Math.max(0, input.storageCostPerMonthPerQuintal);
  const futurePrice = Math.max(0, input.expectedFuturePrice);
  const weightLossRate = Math.min(100, Math.max(0, input.storageWeightLossRatePercent));

  // Scenario 1: Sell Immediately
  const sellNowGross = qty * currentPrice;
  const sellNowTransport = Math.max(0, input.transportHandlingCostNow || 0);
  const sellNowNet = Math.max(0, sellNowGross - sellNowTransport);

  // Scenario 2: Store and Sell Later
  const totalStorageCharges = qty * costPerMonth * months;
  const weightLossQty = qty * (weightLossRate / 100);
  const salableQty = Math.max(0, qty - weightLossQty);
  
  const storeGross = salableQty * futurePrice;
  const futureTransport = Math.max(0, input.transportHandlingCostLater || 0);
  const storeNet = Math.max(0, storeGross - totalStorageCharges - futureTransport);

  const netGainOrLoss = storeNet - sellNowNet;
  const percentageReturn = sellNowNet > 0 ? (netGainOrLoss / sellNowNet) * 100 : 0;

  // Break-even future selling price:
  // (salableQty * breakEvenPrice) - totalStorageCharges - futureTransport = sellNowNet
  // breakEvenPrice = (sellNowNet + totalStorageCharges + futureTransport) / salableQty
  const breakEvenFuturePrice = salableQty > 0
    ? (sellNowNet + totalStorageCharges + futureTransport) / salableQty
    : 0;

  let verdict: 'Store Produce' | 'Sell Now' | 'Neutral/Borderline';
  let verdictReason: string;

  if (netGainOrLoss > 500 && percentageReturn >= 4.0) {
    verdict = 'Store Produce';
    verdictReason = `भंडारण से ₹${Math.round(netGainOrLoss).toLocaleString('en-IN')} का शुद्ध अतिरिक्त लाभ होने का अनुमान है (खर्च व वजन घटौती काटने के बाद)।`;
  } else if (netGainOrLoss < -200) {
    verdict = 'Sell Now';
    verdictReason = `भंडारण शुल्क और वजन ह्रास के कारण ₹${Math.abs(Math.round(netGainOrLoss)).toLocaleString('en-IN')} का नुकसान संभावित है। वर्तमान भाव पर बेचना अधिक सुरक्षित है।`;
  } else {
    verdict = 'Neutral/Borderline';
    verdictReason = `लाभ और भंडारण खर्च लगभग बराबर हैं। बाजार जोखिम को देखते हुए सावधानी से निर्णय लें।`;
  }

  // Generate sensitivity analysis:
  const variancePercentages = [-15, -10, -5, 0, 5, 10, 15, 20];
  const sensitivityTable = variancePercentages.map((pct) => {
    const scenarioPrice = Math.round(futurePrice * (1 + pct / 100));
    const scenarioGross = salableQty * scenarioPrice;
    const scenarioNet = Math.max(0, scenarioGross - totalStorageCharges - futureTransport);
    const scenarioGain = scenarioNet - sellNowNet;
    const roi = sellNowNet > 0 ? (scenarioGain / sellNowNet) * 100 : 0;

    let label = `${pct > 0 ? '+' : ''}${pct}%`;
    if (pct === 0) label = 'अपेक्षित (Baseline)';

    return {
      priceScenarioLabel: label,
      futurePrice: scenarioPrice,
      netGain: Math.round(scenarioGain),
      roiPercent: Number(roi.toFixed(1)),
    };
  });

  return {
    sellNowGrossRevenue: Math.round(sellNowGross),
    sellNowNetRevenue: Math.round(sellNowNet),
    storeSellLaterGrossRevenue: Math.round(storeGross),
    totalStorageCharges: Math.round(totalStorageCharges),
    weightLossDeductionQuintals: Number(weightLossQty.toFixed(2)),
    finalSalableQuantityQuintals: Number(salableQty.toFixed(2)),
    storeSellLaterNetRevenue: Math.round(storeNet),
    netGainOrLoss: Math.round(netGainOrLoss),
    percentageReturn: Number(percentageReturn.toFixed(1)),
    breakEvenFuturePrice: Math.round(breakEvenFuturePrice),
    verdict,
    verdictReason,
    sensitivityTable,
  };
}
