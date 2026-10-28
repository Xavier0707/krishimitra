import { describe, it, expect, beforeEach } from 'vitest';
import { offlineStorage } from '../lib/offline/indexed-db';

describe('Offline Storage & Vault Synchronization', () => {
  beforeEach(() => {
    // Clear storage keys if running in simulated DOM
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.clear();
    }
  });

  it('retrieves default demo scenarios when local storage is empty', () => {
    const scenarios = offlineStorage.getSavedScenarios();
    expect(scenarios).toBeDefined();
    expect(Array.isArray(scenarios)).toBe(true);
    expect(scenarios.length).toBeGreaterThan(0);
    expect(scenarios[0]).toHaveProperty('scenarioTitle');
    expect(scenarios[0]).toHaveProperty('breakEvenPricePerQuintal');
  });

  it('persists a new scenario and calculates proper financial fields', () => {
    const newScen = offlineStorage.saveScenario({
      scenarioTitle: 'विदिशा चना रबी परिदृश्य (5 एकड़)',
      cropName: 'Gram (Chana)',
      farmAreaAcres: 5,
      expectedYieldQPerAcre: 6,
      harvestQuantityQuintals: 30,
      salePricePerQuintal: 5800,
      grossRevenue: 174000,
      cultivationCosts: 45000,
      transportCosts: 2500,
      handlingCosts: 1000,
      storageCosts: 0,
      otherExpenses: 800,
      totalCosts: 49300,
      estimatedNetReturn: 124700,
      breakEvenPricePerQuintal: 1643.33,
    });

    expect(newScen.id).toBeDefined();
    expect(newScen.scenarioTitle).toBe('विदिशा चना रबी परिदृश्य (5 एकड़)');
    expect(newScen.estimatedNetReturn).toBe(124700);

    const allScenarios = offlineStorage.getSavedScenarios();
    expect(allScenarios.some((s) => s.id === newScen.id)).toBe(true);
  });

  it('deletes an existing scenario from the local vault', () => {
    const newScen = offlineStorage.saveScenario({
      scenarioTitle: 'अस्थायी परिदृश्य',
      cropName: 'Mustard',
      farmAreaAcres: 3,
      expectedYieldQPerAcre: 5,
      harvestQuantityQuintals: 15,
      salePricePerQuintal: 5200,
      grossRevenue: 78000,
      cultivationCosts: 20000,
      transportCosts: 1000,
      handlingCosts: 500,
      storageCosts: 0,
      otherExpenses: 0,
      totalCosts: 21500,
      estimatedNetReturn: 56500,
      breakEvenPricePerQuintal: 1433.33,
    });

    expect(offlineStorage.getSavedScenarios().some((s) => s.id === newScen.id)).toBe(true);

    offlineStorage.deleteScenario(newScen.id);
    expect(offlineStorage.getSavedScenarios().some((s) => s.id === newScen.id)).toBe(false);
  });
});
