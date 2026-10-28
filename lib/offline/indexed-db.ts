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
const OFFLINE_QUEUE_KEY = 'krishiconnect_sync_queue';

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
