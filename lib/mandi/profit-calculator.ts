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

/**
 * Standard Farm Profit & Break-Even Calculator
 * Strictly follows KrishiConnect financial guidelines:
 * 1. Harvest quantity in quintals = farm area in acres × yield in quintals per acre
 * 2. Gross revenue = harvest quantity in quintals × sale price per quintal
 * 3. Total costs = cultivation costs + transport costs + handling costs + storage costs + other entered expenses
 * 4. Estimated net return = gross revenue − total costs
 * 5. Break-even price per quintal = total costs ÷ harvest quantity in quintals (when harvest quantity > 0)
 */
export interface FarmProfitScenarioInput {
  cropName: string;
  farmAreaAcres: number;
  expectedYieldQPerAcre: number;
  salePricePerQuintal: number;
  cultivationCosts: number;
  transportCosts: number;
  handlingCosts: number;
  storageCosts: number;
  otherExpenses: number;
  scenarioTitle?: string;
}

export interface FarmProfitScenarioResult {
  isValid: boolean;
  validationError?: string;
  harvestQuantityQuintals: number;
  grossRevenue: number;
  cultivationCosts: number;
  transportCosts: number;
  handlingCosts: number;
  storageCosts: number;
  otherExpenses: number;
  totalCosts: number;
  estimatedNetReturn: number;
  breakEvenPricePerQuintal: number;
  profitMarginPercent: number;
  costPerQuintal: number;
}

export function calculateFarmProfitScenario(
  input: Partial<FarmProfitScenarioInput>
): FarmProfitScenarioResult {
  const farmAreaAcres = Number(input.farmAreaAcres);
  const expectedYieldQPerAcre = Number(input.expectedYieldQPerAcre);
  const salePricePerQuintal = Number(input.salePricePerQuintal);

  // Validate negative, NaN, or non-numeric values
  if (
    isNaN(farmAreaAcres) ||
    isNaN(expectedYieldQPerAcre) ||
    isNaN(salePricePerQuintal)
  ) {
    return {
      isValid: false,
      validationError: 'Please enter valid numeric values for area, yield, and price.',
      harvestQuantityQuintals: 0,
      grossRevenue: 0,
      cultivationCosts: 0,
      transportCosts: 0,
      handlingCosts: 0,
      storageCosts: 0,
      otherExpenses: 0,
      totalCosts: 0,
      estimatedNetReturn: 0,
      breakEvenPricePerQuintal: 0,
      profitMarginPercent: 0,
      costPerQuintal: 0,
    };
  }

  if (farmAreaAcres < 0 || expectedYieldQPerAcre < 0 || salePricePerQuintal < 0) {
    return {
      isValid: false,
      validationError: 'Area, yield, and price cannot be negative numbers.',
      harvestQuantityQuintals: 0,
      grossRevenue: 0,
      cultivationCosts: 0,
      transportCosts: 0,
      handlingCosts: 0,
      storageCosts: 0,
      otherExpenses: 0,
      totalCosts: 0,
      estimatedNetReturn: 0,
      breakEvenPricePerQuintal: 0,
      profitMarginPercent: 0,
      costPerQuintal: 0,
    };
  }

  if (farmAreaAcres === 0) {
    return {
      isValid: false,
      validationError: 'Farm area must be greater than zero acres.',
      harvestQuantityQuintals: 0,
      grossRevenue: 0,
      cultivationCosts: 0,
      transportCosts: 0,
      handlingCosts: 0,
      storageCosts: 0,
      otherExpenses: 0,
      totalCosts: 0,
      estimatedNetReturn: 0,
      breakEvenPricePerQuintal: 0,
      profitMarginPercent: 0,
      costPerQuintal: 0,
    };
  }

  const cultivationCosts = Math.max(0, Number(input.cultivationCosts) || 0);
  const transportCosts = Math.max(0, Number(input.transportCosts) || 0);
  const handlingCosts = Math.max(0, Number(input.handlingCosts) || 0);
  const storageCosts = Math.max(0, Number(input.storageCosts) || 0);
  const otherExpenses = Math.max(0, Number(input.otherExpenses) || 0);

  // 1. Harvest quantity in quintals = farm area in acres × yield in quintals per acre
  const harvestQuantityQuintals = farmAreaAcres * expectedYieldQPerAcre;

  // 2. Gross revenue = harvest quantity in quintals × sale price per quintal
  const grossRevenue = harvestQuantityQuintals * salePricePerQuintal;

  // 3. Total costs = cultivation costs + transport costs + handling costs + storage costs + other entered expenses
  const totalCosts =
    cultivationCosts +
    transportCosts +
    handlingCosts +
    storageCosts +
    otherExpenses;

  // 4. Estimated net return = gross revenue − total costs
  const estimatedNetReturn = grossRevenue - totalCosts;

  // 5. Break-even price per quintal = total costs ÷ harvest quantity in quintals (when harvest quantity > 0)
  const breakEvenPricePerQuintal =
    harvestQuantityQuintals > 0 ? totalCosts / harvestQuantityQuintals : 0;

  const profitMarginPercent =
    grossRevenue > 0 ? (estimatedNetReturn / grossRevenue) * 100 : 0;
  const costPerQuintal =
    harvestQuantityQuintals > 0 ? totalCosts / harvestQuantityQuintals : 0;

  return {
    isValid: true,
    harvestQuantityQuintals: Math.round(harvestQuantityQuintals * 100) / 100,
    grossRevenue: Math.round(grossRevenue * 100) / 100,
    cultivationCosts,
    transportCosts,
    handlingCosts,
    storageCosts,
    otherExpenses,
    totalCosts: Math.round(totalCosts * 100) / 100,
    estimatedNetReturn: Math.round(estimatedNetReturn * 100) / 100,
    breakEvenPricePerQuintal: Math.round(breakEvenPricePerQuintal * 100) / 100,
    profitMarginPercent: Math.round(profitMarginPercent * 10) / 10,
    costPerQuintal: Math.round(costPerQuintal * 100) / 100,
  };
}
