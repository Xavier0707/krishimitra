import { describe, it, expect } from 'vitest';
import { calculateNetReturn, convertToQuintals } from '../lib/mandi/profit-calculator';
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
