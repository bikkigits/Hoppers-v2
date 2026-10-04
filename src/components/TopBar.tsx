import React, { useState } from 'react';
import { Language, VisitedPandal } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { usePowerSave } from '../context/PowerSaveContext';
import { PWAInstallButton } from './PWAInstallButton';
import { ProfileModal } from './ProfileModal';
import { Sparkles, Menu, ShieldAlert, Moon, Sun, Battery, BatteryCharging, Zap, X } from 'lucide-react';

interface Props {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  visitedCount: number;
  totalPandals: number;
  visitedList?: VisitedPandal[];
  onOpenSOS?: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  onOpenOnboarding?: () => void;
}

export const TopBar: React.FC<Props> = ({
  language,
  onLanguageChange,
  visitedCount,
  totalPandals,
  visitedList = [],
  onOpenSOS,
  theme = 'dark',
  onToggleTheme,
  onOpenOnboarding,
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showDiya, setShowDiya] = useState(false);
  const [showBatteryTip, setShowBatteryTip] = useState(false);
  const { isPowerSaveMode, togglePowerSave, batteryLevel, isCharging, isLowBattery } = usePowerSave();
  const t = TRANSLATIONS[language];

  const handleThemeToggle = () => {
    if (onToggleTheme) {
      onToggleTheme();
    }
    setShowBatteryTip(true);
  };

  // Morph between Hamburger (☰) and Diya (🪔) every 3.5 seconds
  React.useEffect(() => {
    const timer = setInterval(() => {
      setShowDiya((prev) => !prev);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <header
        id="app-topbar"
        className="sticky top-0 z-30 w-full shrink-0 bg-[#080B11]/95 backdrop-blur-xl border-b border-slate-800/80 px-4 py-2.5 pt-[calc(0.5rem+var(--safe-top))] transition-all duration-200 shadow-md shadow-black/40"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Zone 1: Left - Menu Button & Brand Identity */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              id="profile-hamburger-btn"
              onClick={() => setIsProfileOpen(true)}
              className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-400 border border-slate-750 shadow-sm active:scale-95 transition shrink-0"
              title="Open Menu & Settings"
              aria-label="Menu and settings"
            >
              <Menu className="w-4.5 h-4.5 text-slate-200" />
            </button>

            {/* Brand Wordmark & Icon */}
            <div className="flex items-center gap-2 select-none min-w-0">
              <img
                src="/favicon.png"
                alt="Hoppers Logo"
                className="w-6 h-6 rounded-lg shadow-sm border border-amber-400/30 object-cover shrink-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/icon.svg';
                }}
              />
              <h1 className="text-base font-extrabold tracking-tight text-white cursor-default truncate">
                Hoppers
              </h1>
              <span className="hidden sm:inline-flex text-[11px] font-medium text-slate-400 truncate">
                · Kolkata Pujo 2026
              </span>
            </div>
          </div>

          {/* Zone 2: Right - Battery/Power Save & Emergency SOS */}
          <div className="flex items-center gap-2 shrink-0">
            {/* 1-Tap AMOLED Power Saver Survival Toggle */}
            <button
              id="topbar-powersave-btn"
              onClick={togglePowerSave}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition active:scale-95 ${
                isPowerSaveMode
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md shadow-amber-400/20'
                  : isLowBattery
                  ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse'
                  : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:text-white hover:bg-slate-800'
              }`}
              title={
                isPowerSaveMode
                  ? `${t.powerSaveActive} · ${batteryLevel !== null ? `${batteryLevel}%` : 'AMOLED 100%'}`
                  : `${t.powerSaveTitle} · ${batteryLevel !== null ? `${batteryLevel}% ${isCharging ? '(Charging)' : ''}` : 'Conserve Battery'}`
              }
              aria-label="Toggle AMOLED Power Saver Mode"
            >
              {isPowerSaveMode ? (
                <Zap className="w-3.5 h-3.5 fill-current text-slate-950" />
              ) : isCharging ? (
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Battery className={`w-3.5 h-3.5 ${isLowBattery ? 'text-red-400' : 'text-slate-400'}`} />
              )}
              {batteryLevel !== null && (
                <span className="text-[11px] font-bold">
                  {batteryLevel}%
                </span>
              )}
            </button>

            {/* Emergency SOS Button */}
            {onOpenSOS && (
              <button
                id="topbar-sos-btn"
                onClick={onOpenSOS}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-950/60 border border-red-500/50 active:scale-95 transition"
                title="Emergency SOS & Kolkata Police/Medical Helplines"
                aria-label="Emergency SOS"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-red-100" />
                <span className="tracking-wide">SOS</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Glassmorphic Profile & Settings Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        language={language}
        onLanguageChange={onLanguageChange}
        visitedList={visitedList}
        theme={theme}
        onToggleTheme={onToggleTheme}
        onOpenOnboarding={onOpenOnboarding}
      />
    </>
  );
};
