import React, { useState } from 'react';
import { Language, VisitedPandal } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { PWAInstallButton } from './PWAInstallButton';
import { ProfileModal } from './ProfileModal';
import { Sparkles, Menu } from 'lucide-react';

interface Props {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  visitedCount: number;
  totalPandals: number;
  visitedList?: VisitedPandal[];
}

export const TopBar: React.FC<Props> = ({
  language,
  onLanguageChange,
  visitedCount,
  totalPandals,
  visitedList = [],
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showDiya, setShowDiya] = useState(false);
  const t = TRANSLATIONS[language];

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
        className="sticky top-0 z-30 w-full bg-[#0B0F19]/90 backdrop-blur-md border-b border-white/10 px-3.5 py-2.5 pt-[calc(0.625rem+env(safe-area-inset-top))] transition-all duration-200"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Brand with Morphing Animated Hamburger/Diya Button & Completely Static Hoppers Logo */}
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Single Morphing Menu Button */}
            <button
              id="profile-hamburger-btn"
              onClick={() => setIsProfileOpen(true)}
              className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-amber-400 border border-amber-500/30 shadow-md active:scale-95 transition overflow-hidden shrink-0 group"
              title="Open My Profile & About Hoppers"
              aria-label="Profile and menu"
            >
              {/* Hamburger Icon */}
              <div
                className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out ${
                  showDiya
                    ? 'opacity-0 scale-75 rotate-45 pointer-events-none'
                    : 'opacity-100 scale-100 rotate-0'
                }`}
              >
                <Menu className="w-4 h-4 text-amber-400" />
              </div>

              {/* Hoppers Diya Icon */}
              <div
                className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out ${
                  showDiya
                    ? 'opacity-100 scale-100 rotate-0'
                    : 'opacity-0 scale-75 -rotate-45 pointer-events-none'
                }`}
              >
                <span className="text-base leading-none select-none" role="img" aria-label="Diya">
                  🪔
                </span>
              </div>

              {/* Pulsing indicator dot */}
              <span className="absolute top-1 right-1 flex h-1.5 w-1.5 pointer-events-none">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </span>
            </button>

            {/* Completely static, non-clickable Hoppers text logo */}
            <div className="flex items-center gap-1.5 select-none pointer-events-none">
              <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1 font-serif cursor-default">
                Hoppers
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 cursor-default">
                Offline
              </span>
            </div>
          </div>

          {/* Right Section: Trilingual Pill (EN | বাং | হিঁ) & Subtle Download Arrow */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Passport Progress Mini-Badge */}
            {visitedCount > 0 && (
              <div
                id="mini-passport-counter"
                onClick={() => setIsProfileOpen(true)}
                className="hidden xs:flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold cursor-pointer hover:bg-amber-500/20 transition"
                title={`${visitedCount} of ${totalPandals} pandals hopped`}
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>
                  {visitedCount}/{totalPandals}
                </span>
              </div>
            )}

            {/* Trilingual Toggle Pill: exactly EN | বাং | হিঁ */}
            <div
              id="language-selector"
              className="flex items-center p-0.5 rounded-lg bg-slate-900/90 border border-white/10 shadow-inner"
            >
              <button
                id="lang-btn-en"
                onClick={() => onLanguageChange('en')}
                className={`px-2 py-1 text-xs font-bold rounded-md transition-all ${
                  language === 'en'
                    ? 'bg-[#FFB300] text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
              <span className="text-white/20 text-[10px] select-none">|</span>
              <button
                id="lang-btn-bn"
                onClick={() => onLanguageChange('bn')}
                className={`px-2 py-1 text-xs font-bold rounded-md transition-all ${
                  language === 'bn'
                    ? 'bg-[#FFB300] text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                বাং
              </button>
              <span className="text-white/20 text-[10px] select-none">|</span>
              <button
                id="lang-btn-hi"
                onClick={() => onLanguageChange('hi')}
                className={`px-2 py-1 text-xs font-bold rounded-md transition-all ${
                  language === 'hi'
                    ? 'bg-[#FFB300] text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                हिं
              </button>
            </div>

            {/* Subtle Download Arrow Icon directly next to language toggle */}
            <PWAInstallButton language={language} />
          </div>
        </div>
      </header>

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
