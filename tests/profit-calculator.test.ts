import { describe, it, expect } from 'vitest';
import {
  calculateNetReturn,
  convertToQuintals,
  calculateFarmProfitScenario,
} from '../lib/mandi/profit-calculator';
import { NetReturnInput } from '../lib/types';

describe('Mandi Profit Calculator', () => {
  it('correctly calculates net returns for standard quintal sales', () => {
    const input: NetReturnInput = {
      quantity: 50, // 50 Quintals of Soybean
      quantityUnit: 'quintal',
      expectedSellingPrice: 4700, // ₹4,700 / Quintal
      transportCost: 2500, // Trolley tractor freight
      handlingLaborCost: 1200, // Hamali / labor
      mandiCommissionCess: 0, // Direct farmer sale
      storageCost: 0,
      packagingBagsCost: 800,
      otherExpenses: 500,
    };

    const result = calculateNetReturn(input);

    expect(result.quantityQuintals).toBe(50);
    // Gross: 50 * 4700 = 235,000
    expect(result.grossRevenue).toBe(235000);
    // Expenses: 2500 + 1200 + 0 + 0 + 800 + 500 = 5,000
    expect(result.totalMarketingExpenses).toBe(5000);
    // Net: 235,000 - 5,000 = 230,000
    expect(result.netProceeds).toBe(230000);
    // Effective price: 230,000 / 50 = 4,600
    expect(result.effectivePricePerQuintal).toBe(4600);
  });

  it('correctly handles conversions from Kg to Quintal', () => {
    const quintals = convertToQuintals(2500, 'kg'); // 2,500 kg = 25 quintals
    expect(quintals).toBe(25);

    const input: NetReturnInput = {
      quantity: 2500,
      quantityUnit: 'kg',
      expectedSellingPrice: 3000,
      transportCost: 1000,
      handlingLaborCost: 500,
      mandiCommissionCess: 0,
      storageCost: 0,
      packagingBagsCost: 0,
      otherExpenses: 0,
    };

    const result = calculateNetReturn(input);
    expect(result.quantityQuintals).toBe(25);
    expect(result.grossRevenue).toBe(75000);
    expect(result.netProceeds).toBe(73500);
  });

  it('calculates net farm profit when production cost is entered', () => {
    const input: NetReturnInput = {
      quantity: 40,
      quantityUnit: 'quintal',
      expectedSellingPrice: 5000,
      transportCost: 2000,
      handlingLaborCost: 1000,
      mandiCommissionCess: 0,
      storageCost: 0,
      packagingBagsCost: 0,
      otherExpenses: 0,
      productionCostPerUnit: 2800, // ₹2,800 per Quintal cost of cultivation
    };

    const result = calculateNetReturn(input);
    expect(result.grossRevenue).toBe(200000);
    expect(result.netProceeds).toBe(197000);
    expect(result.totalProductionCost).toBe(112000); // 40 * 2800
    expect(result.netFarmProfit).toBe(85000); // 197000 - 112000
  });

  it('returns zero safely when quantity or price is zero', () => {
    const result = calculateNetReturn({
      quantity: 0,
      quantityUnit: 'quintal',
      expectedSellingPrice: 4500,
      transportCost: 1000,
      handlingLaborCost: 0,
      mandiCommissionCess: 0,
      storageCost: 0,
      packagingBagsCost: 0,
      otherExpenses: 0,
    });
    expect(result.netProceeds).toBe(0);
    expect(result.effectivePricePerQuintal).toBe(0);
  });
});

describe('Zero-Cost Verified Farm Profit & Break-Even Calculator', () => {
  it('strictly validates the 5 canonical agricultural equations', () => {
    // 8 Acres of Soybean in Sehore, yielding 7.5 Quintals/Acre
    const scenario = calculateFarmProfitScenario({
      cropName: 'Soybean',
      farmAreaAcres: 8,
      expectedYieldQPerAcre: 7.5,
      salePricePerQuintal: 4800,
      cultivationCosts: 80000, // Seed, DAP, urea, tractor labor
      transportCosts: 4500,    // Mandi freight
      handlingCosts: 1800,     // Weighing & labor
      storageCosts: 0,
      otherExpenses: 1200,
    });

    expect(scenario.isValid).toBe(true);

    // 1. Harvest quantity = 8 * 7.5 = 60 quintals
    expect(scenario.harvestQuantityQuintals).toBe(60);

    // 2. Gross revenue = 60 quintals * ₹4,800 = ₹288,000
    expect(scenario.grossRevenue).toBe(288000);

    // 3. Total costs = 80000 + 4500 + 1800 + 0 + 1200 = ₹87,500
    expect(scenario.totalCosts).toBe(87500);

    // 4. Estimated net return = 288000 - 87500 = ₹200,500
    expect(scenario.estimatedNetReturn).toBe(200500);

    // 5. Break-even price per quintal = 87500 / 60 = ₹1,458.33 / quintal
    expect(scenario.breakEvenPricePerQuintal).toBe(1458.33);
  });

  it('rejects negative numbers and returns helpful error message', () => {
    const invalidResult = calculateFarmProfitScenario({
      farmAreaAcres: -5,
      expectedYieldQPerAcre: 10,
      salePricePerQuintal: 4000,
    });

    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.validationError).toContain('cannot be negative');
    expect(invalidResult.estimatedNetReturn).toBe(0);
  });

  it('rejects zero acreage gracefully', () => {
    const zeroAreaResult = calculateFarmProfitScenario({
      farmAreaAcres: 0,
      expectedYieldQPerAcre: 8,
      salePricePerQuintal: 4500,
    });

    expect(zeroAreaResult.isValid).toBe(false);
    expect(zeroAreaResult.validationError).toContain('greater than zero');
  });

  it('prevents division by zero when expected yield is zero', () => {
    const zeroYieldResult = calculateFarmProfitScenario({
      farmAreaAcres: 10,
      expectedYieldQPerAcre: 0,
      salePricePerQuintal: 4500,
      cultivationCosts: 20000,
    });

    expect(zeroYieldResult.isValid).toBe(true);
    expect(zeroYieldResult.harvestQuantityQuintals).toBe(0);
    expect(zeroYieldResult.grossRevenue).toBe(0);
    expect(zeroYieldResult.breakEvenPricePerQuintal).toBe(0); // Safely returns 0, no NaN or Infinity
    expect(zeroYieldResult.estimatedNetReturn).toBe(-20000); // Loss of cultivation cost
  });
});
