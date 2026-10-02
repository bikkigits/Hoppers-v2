import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface BatteryManager {
  level: number;
  charging: boolean;
  addEventListener: (type: string, listener: EventListenerOrEventListenerObject) => void;
  removeEventListener: (type: string, listener: EventListenerOrEventListenerObject) => void;
}

interface PowerSaveContextType {
  isPowerSaveMode: boolean;
  togglePowerSave: () => void;
  setPowerSave: (active: boolean) => void;
  batteryLevel: number | null; // 0 - 100
  isCharging: boolean | null;
  isLowBattery: boolean;
  showLowBatteryPrompt: boolean;
  dismissLowBatteryPrompt: () => void;
}

const POWER_SAVE_STORAGE_KEY = 'hoppers_power_save_mode_v1';
const PROMPT_DISMISSED_SESSION_KEY = 'hoppers_low_battery_prompt_dismissed';

const PowerSaveContext = createContext<PowerSaveContextType | null>(null);

export const PowerSaveProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPowerSaveMode, setIsPowerSaveModeState] = useState<boolean>(() => {
    try {
      if (typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem(POWER_SAVE_STORAGE_KEY);
        if (saved !== null) {
          return saved === 'true';
        }
      }
    } catch {
      // Fallback
    }
    return false;
  });

  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState<boolean | null>(null);
  const [showLowBatteryPrompt, setShowLowBatteryPrompt] = useState<boolean>(false);

  // Sync class on document root for high-performance zero-lag CSS styling
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isPowerSaveMode) {
        document.documentElement.classList.add('power-save-mode');
      } else {
        document.documentElement.classList.remove('power-save-mode');
      }
    }
  }, [isPowerSaveMode]);

  const setPowerSave = useCallback((active: boolean) => {
    setIsPowerSaveModeState(active);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(POWER_SAVE_STORAGE_KEY, String(active));
      }
    } catch (e) {
      console.warn('Failed to save power save mode preference:', e);
    }
  }, []);

  const togglePowerSave = useCallback(() => {
    setPowerSave(!isPowerSaveMode);
  }, [isPowerSaveMode, setPowerSave]);

  const dismissLowBatteryPrompt = useCallback(() => {
    setShowLowBatteryPrompt(false);
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(PROMPT_DISMISSED_SESSION_KEY, 'true');
      }
    } catch {
      // Fallback
    }
  }, []);

  // Web Battery API Integration
  useEffect(() => {
    let batteryInstance: BatteryManager | null = null;

    const handleBatteryUpdate = () => {
      if (!batteryInstance) return;
      const levelPct = Math.round(batteryInstance.level * 100);
      const charging = batteryInstance.charging;

      setBatteryLevel(levelPct);
      setIsCharging(charging);

      // Auto trigger prompt when battery drops <= 15% and device is not charging
      if (levelPct <= 15 && !charging && !isPowerSaveMode) {
        try {
          const isDismissed = sessionStorage.getItem(PROMPT_DISMISSED_SESSION_KEY) === 'true';
          if (!isDismissed) {
            setShowLowBatteryPrompt(true);
          }
        } catch {
          setShowLowBatteryPrompt(true);
        }
      }
    };

    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as unknown as { getBattery: () => Promise<BatteryManager> })
        .getBattery()
        .then((batt) => {
          batteryInstance = batt;
          handleBatteryUpdate();

          batt.addEventListener('levelchange', handleBatteryUpdate);
          batt.addEventListener('chargingchange', handleBatteryUpdate);
        })
        .catch(() => {
          // Battery API not supported or permissions denied
        });
    }

    return () => {
      if (batteryInstance) {
        batteryInstance.removeEventListener('levelchange', handleBatteryUpdate);
        batteryInstance.removeEventListener('chargingchange', handleBatteryUpdate);
      }
    };
  }, [isPowerSaveMode]);

  const isLowBattery = batteryLevel !== null && batteryLevel <= 20 && isCharging === false;

  return (
    <PowerSaveContext.Provider
      value={{
        isPowerSaveMode,
        togglePowerSave,
        setPowerSave,
        batteryLevel,
        isCharging,
        isLowBattery,
        showLowBatteryPrompt,
        dismissLowBatteryPrompt,
      }}
    >
      {children}
    </PowerSaveContext.Provider>
  );
};

export function usePowerSave() {
  const context = useContext(PowerSaveContext);
  if (!context) {
    throw new Error('usePowerSave must be used within a PowerSaveProvider');
  }
  return context;
}
