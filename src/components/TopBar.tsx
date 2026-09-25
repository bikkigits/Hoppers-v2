import React, { useState } from 'react';
import { Language, VisitedPandal } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { PWAInstallButton } from './PWAInstallButton';
import { ProfileModal } from './ProfileModal';
import { Sparkles, Menu, ShieldAlert, Moon, Sun, BatteryLow, X } from 'lucide-react';

interface Props {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  visitedCount: number;
  totalPandals: number;
  visitedList?: VisitedPandal[];
  onOpenSOS?: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
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
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showDiya, setShowDiya] = useState(false);
  const [showBatteryTip, setShowBatteryTip] = useState(false);
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
        className="sticky top-0 z-30 w-full bg-[#080B11]/90 backdrop-blur-md border-b border-slate-800/60 px-3.5 py-2 pt-[calc(0.5rem+env(safe-area-inset-top))] transition-all duration-200"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Brand with Morphing Animated Hamburger/Diya Button & Static Hoppers Logo */}
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Single Morphing Menu Button */}
            <button
              id="profile-hamburger-btn"
              onClick={() => setIsProfileOpen(true)}
              className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-amber-400 border border-slate-800/90 shadow-sm active:scale-95 transition overflow-hidden shrink-0"
              title="Open My Profile & About Hoppers"
              aria-label="Profile and menu"
            >
              {/* Hamburger Icon */}
              <div
                className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-in-out ${
                  showDiya
                    ? 'opacity-0 scale-75 rotate-45 pointer-events-none'
                    : 'opacity-100 scale-100 rotate-0'
                }`}
              >
                <Menu className="w-4 h-4 text-slate-200" />
              </div>

              {/* Hoppers Diya Icon */}
              <div
                className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-in-out ${
                  showDiya
                    ? 'opacity-100 scale-100 rotate-0'
                    : 'opacity-0 scale-75 -rotate-45 pointer-events-none'
                }`}
              >
                <span className="text-sm leading-none select-none" role="img" aria-label="Diya">
                  🪔
                </span>
              </div>
            </button>

            {/* Clean static, non-clickable Hoppers text logo */}
            <div className="flex items-center gap-2 select-none pointer-events-none">
              <h1 className="text-base font-bold tracking-tight text-white cursor-default">
                Hoppers
              </h1>
              <span className="text-[11px] font-medium text-slate-400 tracking-normal cursor-default flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80"></span>
                Offline
              </span>
            </div>
          </div>

          {/* Right Section: Clean Trilingual Switcher & PWA Download Button */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Passport Progress Mini-Indicator */}
            {visitedCount > 0 && (
              <button
                id="mini-passport-counter"
                onClick={() => setIsProfileOpen(true)}
                className="hidden xs:flex items-center gap-1 px-2 py-1 rounded-md text-slate-400 hover:text-amber-300 text-xs font-medium transition"
                title={`${visitedCount} of ${totalPandals} pandals hopped`}
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span className="tabular-nums">
                  {visitedCount}/{totalPandals}
                </span>
              </button>
            )}

            {/* Small Theme Button: Round Icon showing a Half Moon */}
            {onToggleTheme && (
              <button
                id="theme-toggle-btn"
                onClick={handleThemeToggle}
                className={`relative flex items-center justify-center w-8 h-8 rounded-full border shadow-xs active:scale-90 transition-all duration-200 shrink-0 ${
                  theme === 'light'
                    ? 'bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200'
                    : 'bg-slate-900/90 text-amber-400 border-slate-750 hover:bg-slate-800'
                }`}
                title="Tap to switch between Dark and Light theme (Keep in dark mode to save battery)"
                aria-label="Toggle Dark and Light theme"
              >
                <Moon className="w-4 h-4 fill-amber-400/25 text-amber-400" />
              </button>
            )}

            {/* Trilingual Toggle Segmented Control: EN | বাং | হিঁ */}
            <div
              id="language-selector"
              className="flex items-center p-0.5 rounded-lg bg-slate-900/90 border border-slate-800 shadow-xs"
            >
              <button
                id="lang-btn-en"
                onClick={() => onLanguageChange('en')}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  language === 'en'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white font-medium'
                }`}
              >
                EN
              </button>
              <button
                id="lang-btn-bn"
                onClick={() => onLanguageChange('bn')}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  language === 'bn'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white font-medium'
                }`}
              >
                বাং
              </button>
              <button
                id="lang-btn-hi"
                onClick={() => onLanguageChange('hi')}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${
                  language === 'hi'
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white font-medium'
                }`}
              >
                हिं
              </button>
            </div>

            {/* Emergency SOS Button Outside */}
            {onOpenSOS && (
              <button
                id="topbar-sos-btn"
                onClick={onOpenSOS}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-600/90 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-950/50 border border-red-500/50 active:scale-95 transition"
                title="Emergency SOS & Kolkata Police/Medical Helplines"
                aria-label="Emergency SOS"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-red-200 animate-pulse" />
                <span className="tracking-wide">SOS</span>
              </button>
            )}

            {/* Subtle Download Arrow Icon directly next to language toggle */}
            <PWAInstallButton language={language} />
          </div>
        </div>
      </header>

      {/* Battery Saver Advisory Banner */}
      {showBatteryTip && (
        <div
          id="battery-saver-advisory"
          className="sticky top-[52px] z-25 w-full bg-slate-900/95 border-b border-amber-500/30 px-3.5 py-1.5 text-xs text-amber-300 backdrop-blur-md shadow-md"
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <BatteryLow className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-semibold text-xs text-amber-300">
                To save battery, keep it in dark mode
              </span>
            </div>
            <button
              onClick={() => setShowBatteryTip(false)}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
              aria-label="Dismiss message"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Glassmorphic Profile & About Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        language={language}
        visitedList={visitedList}
      />
    </>
  );
};
