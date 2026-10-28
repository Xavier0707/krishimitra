import { describe, it, expect } from 'vitest';
import { evaluateCropSuitability, interpretNutrient } from '../lib/soil/guidance';
import { SoilTestResult } from '../lib/types';

describe('Soil-to-Crop Intelligence Engine', () => {
  const sampleSoil: SoilTestResult = {
    id: 'test-soil-01',
    farmId: 'farm-01',
    testDate: '2026-10-20',
    ph: 7.2,
    electricalConductivity: 0.45,
    organicCarbonPercent: 0.65,
    nitrogenKgHa: 310,
    phosphorusKgHa: 18,
    potassiumKgHa: 240,
    sulfurPpm: 12.5,
    zincPpm: 0.85,
    ironPpm: 5.2,
    isDemo: true,
  };

  it('correctly categorizes nutrient levels according to ICAR criteria', () => {
    const phStatus = interpretNutrient('ph', 7.2);
    expect(phStatus.status).toBe('Normal');

    const lowNitrogen = interpretNutrient('nitrogenKgHa', 220);
    expect(lowNitrogen.status).toBe('Low');
  });

  it('evaluates crop suitability scores and provides explainable advice', () => {
    const results = evaluateCropSuitability(sampleSoil);
    expect(results.length).toBeGreaterThan(0);

    const soybean = results.find((r) => r.cropId === 'soybean');
    expect(soybean).toBeDefined();
    expect(soybean?.suitabilityScore).toBeGreaterThanOrEqual(70);
    expect(soybean?.fertilizerAdjustmentAdvice).toBeDefined();
  });
});
