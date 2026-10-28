import { Farm, FarmActivity, SoilTestResult } from '../types';
import {
  INITIAL_DEMO_FARM,
  INITIAL_DEMO_FARMER,
  INITIAL_DEMO_SOIL,
  INITIAL_DEMO_ACTIVITIES,
} from '../demo/demo-state';

const FARM_STORAGE_KEY = 'krishiconnect_farm_data';
const ACTIVITIES_STORAGE_KEY = 'krishiconnect_activities';
const SOIL_STORAGE_KEY = 'krishiconnect_soil_data';
const SCENARIOS_STORAGE_KEY = 'krishiconnect_saved_scenarios';
const OFFLINE_QUEUE_KEY = 'krishiconnect_sync_queue';

// Resilient storage helper (works in browser LocalStorage & in-memory Node/SSR/Vitest)
const inMemoryStore: Record<string, string> = {};

function storageGet(key: string): string | null {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      return localStorage.getItem(key);
    } catch {
      // ignore
    }
  }
  return inMemoryStore[key] || null;
}

function storageSet(key: string, value: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // ignore
    }
  }
  inMemoryStore[key] = value;
}

function storageRemove(key: string): void {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
  delete inMemoryStore[key];
}

export interface SavedProfitScenarioLocal {
  id: string;
  scenarioTitle: string;
  cropName: string;
  farmAreaAcres: number;
  expectedYieldQPerAcre: number;
  harvestQuantityQuintals: number;
  salePricePerQuintal: number;
  grossRevenue: number;
  cultivationCosts: number;
  transportCosts: number;
  handlingCosts: number;
  storageCosts: number;
  otherExpenses: number;
  totalCosts: number;
  estimatedNetReturn: number;
  breakEvenPricePerQuintal: number;
  createdAt: string;
  isSynced: boolean;
}

export interface SyncQueueItem {
  id: string;
  type: 'activity' | 'soil_test' | 'plot_update';
  payload: unknown;
  timestamp: string;
}

/**
 * Local offline repository: works across browsers with localStorage & IndexedDB fallback
 */
export const offlineStorage = {
  getFarmData(): Farm {
    if (typeof window === 'undefined') return INITIAL_DEMO_FARM;
    try {
      const saved = localStorage.getItem(FARM_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_DEMO_FARM;
  },

  saveFarmData(farm: Farm): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(FARM_STORAGE_KEY, JSON.stringify(farm));
    } catch {
      // ignore
    }
  },

  getActivities(): FarmActivity[] {
    if (typeof window === 'undefined') return INITIAL_DEMO_ACTIVITIES;
    try {
      const saved = localStorage.getItem(ACTIVITIES_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_DEMO_ACTIVITIES;
  },

  addActivity(activity: Omit<FarmActivity, 'id'>): FarmActivity {
    const current = this.getActivities();
    const newAct: FarmActivity = {
      ...activity,
      id: `act-local-${Date.now()}`,
    };
    const updated = [newAct, ...current];
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(updated));
        // Add to offline sync queue if offline
        if (!navigator.onLine) {
          this.addToSyncQueue({
            id: newAct.id,
            type: 'activity',
            payload: newAct,
            timestamp: new Date().toISOString(),
          });
        }
      } catch {
        // ignore
      }
    }
    return newAct;
  },

  getSoilData(): SoilTestResult {
    if (typeof window === 'undefined') return INITIAL_DEMO_SOIL;
    try {
      const saved = localStorage.getItem(SOIL_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_DEMO_SOIL;
  },

  saveSoilData(soil: SoilTestResult): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(SOIL_STORAGE_KEY, JSON.stringify(soil));
    } catch {
      // ignore
    }
  },

  getSavedScenarios(): SavedProfitScenarioLocal[] {
    try {
      const saved = storageGet(SCENARIOS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [
      {
        id: 'scenario-demo-1',
        scenarioTitle: 'सीहोर सोयाबीन खरीफ परिदृश्य (8 एकड़)',
        cropName: 'Soybean',
        farmAreaAcres: 8,
        expectedYieldQPerAcre: 7.5,
        harvestQuantityQuintals: 60,
        salePricePerQuintal: 4800,
        grossRevenue: 288000,
        cultivationCosts: 80000,
        transportCosts: 4500,
        handlingCosts: 1800,
        storageCosts: 0,
        otherExpenses: 1200,
        totalCosts: 87500,
        estimatedNetReturn: 200500,
        breakEvenPricePerQuintal: 1458.33,
        createdAt: new Date().toISOString(),
        isSynced: true,
      },
    ];
  },

  saveScenario(scenario: Omit<SavedProfitScenarioLocal, 'id' | 'createdAt' | 'isSynced'>): SavedProfitScenarioLocal {
    const current = this.getSavedScenarios();
    const newScenario: SavedProfitScenarioLocal = {
      ...scenario,
      id: `scen-${Date.now()}`,
      createdAt: new Date().toISOString(),
      isSynced: false,
    };
    const updated = [newScenario, ...current];
    try {
      storageSet(SCENARIOS_STORAGE_KEY, JSON.stringify(updated));
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        this.addToSyncQueue({
          id: newScenario.id,
          type: 'activity',
          payload: newScenario,
          timestamp: new Date().toISOString(),
        });
      }
    } catch {
      // ignore
    }
    return newScenario;
  },

  deleteScenario(id: string): void {
    const current = this.getSavedScenarios();
    const updated = current.filter((s) => s.id !== id);
    try {
      storageSet(SCENARIOS_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  },

  getSyncQueue(): SyncQueueItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(OFFLINE_QUEUE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  },

  addToSyncQueue(item: SyncQueueItem): void {
    if (typeof window === 'undefined') return;
    try {
      const queue = this.getSyncQueue();
      queue.push(item);
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    } catch {
      // ignore
    }
  },

  clearSyncQueue(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(OFFLINE_QUEUE_KEY);
    } catch {
      // ignore
    }
  },
};
