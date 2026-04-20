
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';

const isNative = Capacitor.isNativePlatform();

export const storage = {
  async set(key: string, value: any): Promise<void> {
    if (isNative) {
      try {
        await Preferences.set({
          key,
          value: JSON.stringify(value),
        });
        return;
      } catch (e) {
        console.warn('Capacitor Preferences failed:', e);
      }
    }
    localStorage.setItem(key, JSON.stringify(value));
  },

  async get<T>(key: string): Promise<T | null> {
    if (isNative) {
      try {
        const { value } = await Preferences.get({ key });
        if (value) {
          return JSON.parse(value) as T;
        }
      } catch (e) {
        console.warn('Capacitor Preferences failed:', e);
      }
    }
    
    const localValue = localStorage.getItem(key);
    if (!localValue) return null;
    try {
      return JSON.parse(localValue) as T;
    } catch {
      return localValue as unknown as T;
    }
  },

  async remove(key: string): Promise<void> {
    if (isNative) {
      try {
        await Preferences.remove({ key });
        return;
      } catch (e) {
        console.warn('Capacitor Preferences failed:', e);
      }
    }
    localStorage.removeItem(key);
  },

  async clear(): Promise<void> {
    if (isNative) {
      try {
        await Preferences.clear();
        return;
      } catch (e) {
        console.warn('Capacitor Preferences failed:', e);
      }
    }
    localStorage.clear();
  },
};
