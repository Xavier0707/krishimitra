import { NetReturnInput, NetReturnBreakdown, AreaUnit } from '../types';

/**
 * Unit conversions for agricultural produce in India
 */
export function convertToQuintals(quantity: number, unit: 'quintal' | 'kg' | 'ton'): number {
  if (quantity <= 0) return 0;
  switch (unit) {
    case 'quintal':
      return quantity;
    case 'kg':
      return quantity / 100;
    case 'ton':
      return quantity * 10;
    default:
      return quantity;
  }
}

/**
 * Convert area units to Acres (Standard baseline for Madhya Pradesh)
 * 1 Hectare = 2.47105 Acres
 * 1 Standard Central MP Bigha (Pakka Bigha) ≈ 0.625 Acre (5/8 acre), meaning 1 Acre ≈ 1.6 Bigha
 */
export function convertAreaToAcres(area: number, unit: AreaUnit): number {
  if (area <= 0) return 0;
  switch (unit) {
    case 'acre':
      return area;
    case 'bigha':
      return area * 0.625;
    case 'hectare':
      return area * 2.47105;
    default:
      return area;
  }
}

export function convertAcresToUnit(acres: number, targetUnit: AreaUnit): number {
  if (acres <= 0) return 0;
  switch (targetUnit) {
    case 'acre':
      return acres;
    case 'bigha':
      return acres / 0.625; // acres * 1.6
    case 'hectare':
      return acres / 2.47105;
    default:
      return acres;
  }
}

/**
 * Net Return Calculator
 * Net Proceeds = (Sale Quantity in Quintals × Selling Price) − All Transport & Marketing Expenses
 */
export function calculateNetReturn(input: NetReturnInput): NetReturnBreakdown {
  const quantityQuintals = convertToQuintals(input.quantity, input.quantityUnit);
  
  if (quantityQuintals <= 0 || input.expectedSellingPrice <= 0) {
    return {
      quantityQuintals: 0,
      grossRevenue: 0,
      totalMarketingExpenses: 0,
      netProceeds: 0,
      effectivePricePerQuintal: 0,
      expenseBreakdown: {
        transport: 0,
        handling: 0,
        mandiCharges: 0,
        storage: 0,
        packaging: 0,
        other: 0,
      },
    };
  }

  const grossRevenue = quantityQuintals * input.expectedSellingPrice;
  
  const transport = Math.max(0, input.transportCost || 0);
  const handling = Math.max(0, input.handlingLaborCost || 0);
  const mandiCharges = Math.max(0, input.mandiCommissionCess || 0);
  const storage = Math.max(0, input.storageCost || 0);
  const packaging = Math.max(0, input.packagingBagsCost || 0);
  const other = Math.max(0, input.otherExpenses || 0);

  const totalMarketingExpenses = transport + handling + mandiCharges + storage + packaging + other;
  const netProceeds = Math.max(0, grossRevenue - totalMarketingExpenses);
  const effectivePricePerQuintal = quantityQuintals > 0 ? netProceeds / quantityQuintals : 0;

  let totalProductionCost: number | undefined;
  let netFarmProfit: number | undefined;

  if (input.productionCostPerUnit !== undefined && input.productionCostPerUnit > 0) {
    totalProductionCost = input.productionCostPerUnit * quantityQuintals;
    netFarmProfit = netProceeds - totalProductionCost;
  }

  return {
    quantityQuintals,
    grossRevenue,
    totalMarketingExpenses,
    netProceeds,
    effectivePricePerQuintal,
    totalProductionCost,
    netFarmProfit,
    expenseBreakdown: {
      transport,
      handling,
      mandiCharges,
      storage,
      packaging,
      other,
    },
  };
}
