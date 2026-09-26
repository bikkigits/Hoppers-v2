import React, { useState, useRef, useEffect } from 'react';
import { NavigationTab, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import {
  Map,
  ListFilter,
  Train,
  Award,
  ShieldAlert,
  Route,
  Sparkles,
  MapPinPlus,
  Crosshair,
  X,
  Compass,
} from 'lucide-react';

interface Props {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  language: Language;
  onOpenSOS: () => void;
  visitedCount: number;
  trailStopsCount?: number;
  onOpenTrailBuilder?: () => void;
  onOpenSuggestPandal?: () => void;
  onLocateUser?: () => void;
}

export const BottomNav: React.FC<Props> = ({
  currentTab,
  onTabChange,
  language,
  onOpenSOS,
  visitedCount,
  trailStopsCount = 0,
  onOpenTrailBuilder,
  onOpenSuggestPandal,
  onLocateUser,
}) => {
  const t = TRANSLATIONS[language];
  const [isMasterMenuOpen, setIsMasterMenuOpen] = useState(false);
  const masterMenuRef = useRef<HTMLDivElement | null>(null);

  // Close master menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        masterMenuRef.current &&
        !masterMenuRef.current.contains(e.target as Node)
      ) {
        setIsMasterMenuOpen(false);
      }
    };
    if (isMasterMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMasterMenuOpen]);

  const handleAction = (callback?: () => void) => {
    setIsMasterMenuOpen(false);
    if (callback) callback();
  };

  return (
    <nav
      id="bottom-floating-dock"
      className="fixed bottom-2.5 left-2.5 right-2.5 z-40 max-w-md mx-auto pointer-events-auto pb-[var(--safe-bottom)]"
      role="navigation"
      aria-label="Main Navigation"
    >
      {/* Master Action Popover Menu */}
      {isMasterMenuOpen && (
        <div
          ref={masterMenuRef}
          id="master-action-menu"
          className="absolute bottom-16 inset-x-2 bg-slate-900/95 backdrop-blur-2xl border border-amber-500/30 rounded-3xl p-3 shadow-2xl shadow-black/80 animate-scale-up space-y-2 text-slate-100 z-50"
        >
          <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {t.masterMenuTitle || 'Puja Actions'}
              </span>
            </div>
            <button
              onClick={() => setIsMasterMenuOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {/* 1. Suggest a Pandal */}
            {onOpenSuggestPandal && (
              <button
                onClick={() => handleAction(onOpenSuggestPandal)}
                className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-gradient-to-br from-red-600/25 to-rose-700/15 border border-red-500/40 hover:border-red-400 text-left transition active:scale-95 group"
              >
                <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-red-600/30 group-hover:scale-105 transition">
                  <MapPinPlus className="w-4 h-4 text-amber-200" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white leading-tight">
                    {t.addPandalBtn}
                  </p>
                  <p className="text-[9px] text-red-200/80 leading-tight truncate mt-0.5">
                    Suggest missing
                  </p>
                </div>
              </button>
            )}

            {/* 2. Pujo Trail Planner */}
            {onOpenTrailBuilder && (
              <button
                onClick={() => handleAction(onOpenTrailBuilder)}
                className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-gradient-to-br from-amber-500/25 to-orange-600/15 border border-amber-500/40 hover:border-amber-400 text-left transition active:scale-95 group"
              >
                <div className="relative w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/30 group-hover:scale-105 transition font-bold">
                  <Route className="w-4 h-4" />
                  {trailStopsCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-slate-950 text-amber-400 text-[8px] font-black border border-amber-400 flex items-center justify-center">
                      {trailStopsCount}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white leading-tight">
                    {t.tabTrail || 'Pujo Trail'}
                  </p>
                  <p className="text-[9px] text-amber-200/80 leading-tight truncate mt-0.5">
                    {trailStopsCount > 0 ? `${trailStopsCount} stops active` : 'Multi-stop route'}
                  </p>
                </div>
              </button>
            )}

            {/* 3. Emergency SOS */}
            <button
              onClick={() => handleAction(onOpenSOS)}
              className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-gradient-to-br from-rose-950/50 to-slate-900 border border-rose-600/40 hover:border-rose-400 text-left transition active:scale-95 group"
            >
              <div className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/30 group-hover:scale-105 transition">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white leading-tight">
                  {t.sosButton || 'Emergency SOS'}
                </p>
                <p className="text-[9px] text-rose-300 leading-tight truncate mt-0.5">
                  Police & Medical
                </p>
              </div>
            </button>

            {/* 4. Locate on Map */}
            {onLocateUser && (
              <button
                onClick={() => {
                  onTabChange('map');
                  handleAction(onLocateUser);
                }}
                className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-gradient-to-br from-blue-950/50 to-slate-900 border border-blue-500/40 hover:border-blue-400 text-left transition active:scale-95 group"
              >
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-600/30 group-hover:scale-105 transition">
                  <Crosshair className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white leading-tight">
                    {t.locateMe || 'Find My GPS'}
                  </p>
                  <p className="text-[9px] text-blue-200 leading-tight truncate mt-0.5">
                    Live Kolkata Map
                  </p>
                </div>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 5-Button Bottom Dock */}
      <div className="relative flex items-center justify-between px-2 py-1 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-slate-800 shadow-2xl shadow-black/70">
        {/* Button 1: Map */}
        <button
          id="nav-tab-map"
          onClick={() => onTabChange('map')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-colors duration-150 min-h-[44px] active:scale-95 ${
            currentTab === 'map'
              ? 'text-amber-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200 font-normal'
          }`}
        >
          <div className="relative">
            <Map className="w-5 h-5" />
            {currentTab === 'map' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400" />
            )}
          </div>
          <span className="text-[10px] tracking-tight truncate max-w-[65px] mt-1">
            {t.tabMap}
          </span>
        </button>

        {/* Button 2: Pandals (Directory) */}
        <button
          id="nav-tab-directory"
          onClick={() => onTabChange('directory')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-colors duration-150 min-h-[44px] active:scale-95 ${
            currentTab === 'directory'
              ? 'text-amber-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200 font-normal'
          }`}
        >
          <div className="relative">
            <ListFilter className="w-5 h-5" />
            {currentTab === 'directory' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400" />
            )}
          </div>
          <span className="text-[10px] tracking-tight truncate max-w-[65px] mt-1">
            {t.tabPandals || t.tabDirectory}
          </span>
        </button>

        {/* Button 3: CENTER MASTER ACTION BUTTON (Elevated Circle) */}
        <div className="relative -top-3 px-1">
          <button
            id="nav-master-action-btn"
            onClick={() => setIsMasterMenuOpen((prev) => !prev)}
            className={`relative w-13 h-13 rounded-full flex flex-col items-center justify-center shadow-xl transition-all duration-200 active:scale-90 ${
              isMasterMenuOpen
                ? 'bg-gradient-to-tr from-amber-400 to-rose-600 ring-4 ring-amber-400/40 text-slate-950 scale-105'
                : 'bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 ring-4 ring-slate-950 text-white hover:brightness-110'
            }`}
            title="Puja Quick Actions"
            aria-label="Puja Quick Actions"
          >
            {/* Trishul / Lotus / Sparkle Festive Center Icon */}
            <div className="relative flex items-center justify-center">
              {isMasterMenuOpen ? (
                <X className="w-6 h-6 text-slate-950 stroke-[2.5]" />
              ) : (
                <Compass className="w-6 h-6 text-amber-200 animate-spin-slow stroke-[2.2]" />
              )}

              {/* Trail badge counter */}
              {!isMasterMenuOpen && trailStopsCount > 0 && (
                <span className="absolute -top-2 -right-2.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-amber-400 text-slate-950 text-[9px] font-black border-2 border-slate-950 shadow-xs">
                  {trailStopsCount}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Button 4: Metro Router */}
        <button
          id="nav-tab-metro"
          onClick={() => onTabChange('metro')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-colors duration-150 min-h-[44px] active:scale-95 ${
            currentTab === 'metro'
              ? 'text-amber-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200 font-normal'
          }`}
        >
          <div className="relative">
            <Train className="w-5 h-5" />
            {currentTab === 'metro' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400" />
            )}
          </div>
          <span className="text-[10px] tracking-tight truncate max-w-[65px] mt-1">
            {t.tabMetro}
          </span>
        </button>

        {/* Button 5: Passport */}
        <button
          id="nav-tab-passport"
          onClick={() => onTabChange('passport')}
          className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-colors duration-150 min-h-[44px] active:scale-95 ${
            currentTab === 'passport'
              ? 'text-amber-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200 font-normal'
          }`}
        >
          <div className="relative">
            <Award className="w-5 h-5" />
            {visitedCount > 0 && (
              <span className="absolute -top-1 -right-2.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-amber-500 text-slate-950 text-[9px] font-black border border-slate-950">
                {visitedCount}
              </span>
            )}
            {currentTab === 'passport' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400" />
            )}
          </div>
          <span className="text-[10px] tracking-tight truncate max-w-[65px] mt-1">
            {t.tabPassport}
          </span>
        </button>
      </div>
    </nav>
  );
};
