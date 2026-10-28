import { describe, it, expect } from 'vitest';
import { calculateStorageScenario } from '../lib/storage/scenario-calculator';

describe('Storage vs Sell Scenario Calculator', () => {
  it('correctly calculates storage economics with weight loss and warehouse fees', () => {
    const result = calculateStorageScenario({
      cropName: 'Soybean',
      quantityQuintals: 100,
      currentMandiPrice: 4600, // ₹4,600 / Q
      storageDurationMonths: 4,
      storageCostPerMonthPerQuintal: 25, // ₹25/Q/month = ₹100/Q total
      expectedFuturePrice: 5300, // ₹5,300 / Q
      storageWeightLossRatePercent: 2, // 2% loss = 2 Quintals lost, 98 Q remaining
      transportHandlingCostNow: 3000,
      transportHandlingCostLater: 3500,
    });

    // Sell Now: 100 * 4600 = 460,000 - 3,000 = 457,000
    expect(result.sellNowGrossRevenue).toBe(460000);
    expect(result.sellNowNetRevenue).toBe(457000);

    // Storage charges: 100 * 25 * 4 = 10,000
    expect(result.totalStorageCharges).toBe(10000);
    expect(result.finalSalableQuantityQuintals).toBe(98);

    // Store & Sell Later: 98 * 5300 = 519,400 - 10,000 - 3500 = 505,900
    expect(result.storeSellLaterGrossRevenue).toBe(519400);
    expect(result.storeSellLaterNetRevenue).toBe(505900);

    // Net Gain: 505,900 - 457,000 = +48,900
    expect(result.netGainOrLoss).toBe(48900);
    expect(result.verdict).toBe('Store Produce');

    // Break Even Price: (457,000 + 10,000 + 3500) / 98 = 470,500 / 98 ≈ 4801
    expect(result.breakEvenFuturePrice).toBeGreaterThan(4795);
    expect(result.breakEvenFuturePrice).toBeLessThan(4810);
  });

  it('advises Sell Now when future price does not cover storage and loss', () => {
    const result = calculateStorageScenario({
      cropName: 'Wheat',
      quantityQuintals: 100,
      currentMandiPrice: 2500,
      storageDurationMonths: 6,
      storageCostPerMonthPerQuintal: 30, // 6 * 30 = 180 / Q
      expectedFuturePrice: 2600, // Only 100 ₹ increase
      storageWeightLossRatePercent: 3, // 3 Q lost
      transportHandlingCostNow: 2000,
      transportHandlingCostLater: 2500,
    });

    expect(result.netGainOrLoss).toBeLessThan(0);
    expect(result.verdict).toBe('Sell Now');
  });
});
