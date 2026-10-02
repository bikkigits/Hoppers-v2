import React from 'react';
import { usePowerSave } from '../context/PowerSaveContext';
import { TRANSLATIONS } from '../data/translations';
import { Language } from '../types';
import { BatteryCharging, BatteryWarning, Zap, X } from 'lucide-react';

interface Props {
  language: Language;
}

export const PowerSaveToast: React.FC<Props> = ({ language }) => {
  const {
    isPowerSaveMode,
    setPowerSave,
    batteryLevel,
    showLowBatteryPrompt,
    dismissLowBatteryPrompt,
  } = usePowerSave();

  const t = TRANSLATIONS[language];

  if (!showLowBatteryPrompt || isPowerSaveMode) {
    return null;
  }

  return (
    <div
      id="low-battery-emergency-toast"
      className="fixed bottom-[calc(var(--bottom-dock-height)+var(--safe-bottom)+12px)] inset-x-3 max-w-md mx-auto z-40 animate-in fade-in slide-in-from-bottom-3 duration-200"
    >
      <div className="p-3.5 bg-black/95 backdrop-blur-2xl border-2 border-amber-500 rounded-2xl shadow-2xl shadow-black flex items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
            <BatteryWarning className="w-5 h-5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <span>{t.lowBatteryAlert || 'Low Battery'}</span>
              {batteryLevel !== null && (
                <span className="px-1.5 py-0.2 bg-amber-500/20 rounded text-[10px] font-black">
                  {batteryLevel}%
                </span>
              )}
            </div>
            <p className="text-xs text-slate-200 mt-0.5 truncate">
              {t.enablePowerSavePrompt || 'Activate AMOLED Power Save to extend battery life?'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => {
              setPowerSave(true);
              dismissLowBatteryPrompt();
            }}
            className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1 active:scale-95 transition shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>ON</span>
          </button>
          <button
            onClick={dismissLowBatteryPrompt}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition active:scale-95"
            aria-label="Dismiss low battery alert"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
