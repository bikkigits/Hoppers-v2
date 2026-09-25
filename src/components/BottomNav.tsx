import React from 'react';
import { NavigationTab, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { Map, ListFilter, Train, Award, ShieldAlert, Route } from 'lucide-react';

interface Props {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  language: Language;
  onOpenSOS: () => void;
  visitedCount: number;
  trailStopsCount?: number;
  onOpenTrailBuilder?: () => void;
}

export const BottomNav: React.FC<Props> = ({
  currentTab,
  onTabChange,
  language,
  onOpenSOS,
  visitedCount,
  trailStopsCount = 0,
  onOpenTrailBuilder,
}) => {
  const t = TRANSLATIONS[language];

  const tabs: { id: NavigationTab; label: string; icon: React.ReactNode }[] = [
    { id: 'map', label: t.tabMap, icon: <Map className="w-5 h-5" /> },
    { id: 'directory', label: t.tabDirectory, icon: <ListFilter className="w-5 h-5" /> },
    { id: 'metro', label: t.tabMetro, icon: <Train className="w-5 h-5" /> },
    {
      id: 'passport',
      label: t.tabPassport,
      icon: (
        <div className="relative">
          <Award className="w-5 h-5" />
          {visitedCount > 0 && (
            <span className="absolute -top-1 -right-2.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-amber-500 text-slate-950 text-[9px] font-black border border-slate-950">
              {visitedCount}
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <nav
      id="bottom-floating-dock"
      className="fixed bottom-3 left-3 right-3 z-30 max-w-md mx-auto pointer-events-auto pb-[env(safe-area-inset-bottom)]"
      role="navigation"
      aria-label="Main Navigation"
    >
      <div className="flex items-center justify-between px-3 py-1 rounded-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-800/80 shadow-2xl shadow-black/60 gap-1">
        {tabs.slice(0, 2).map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-colors duration-150 min-h-[44px] active:scale-95 ${
                isActive
                  ? 'text-amber-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 font-normal'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400" />
                )}
              </div>
              <span className="text-[10px] tracking-tight truncate max-w-[65px] mt-1">
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* Trail Builder Trigger Tab */}
        {onOpenTrailBuilder && (
          <button
            id="nav-tab-trail"
            onClick={onOpenTrailBuilder}
            className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-colors duration-150 min-h-[44px] active:scale-95 ${
              trailStopsCount > 0
                ? 'text-amber-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200 font-normal'
            }`}
            title={t.trailBuilderTitle}
          >
            <div className="relative">
              <Route className="w-5 h-5" />
              {trailStopsCount > 0 && (
                <span className="absolute -top-1 -right-2.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-amber-400 text-slate-950 text-[9px] font-black border border-slate-950 shadow-xs">
                  {trailStopsCount}
                </span>
              )}
            </div>
            <span className="text-[10px] tracking-tight truncate max-w-[65px] mt-1">
              {t.tabTrail || 'Trail'}
            </span>
          </button>
        )}

        {tabs.slice(2).map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-colors duration-150 min-h-[44px] active:scale-95 ${
                isActive
                  ? 'text-amber-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 font-normal'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400" />
                )}
              </div>
              <span className="text-[10px] tracking-tight truncate max-w-[65px] mt-1">
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* 1-Tap Emergency SOS Trigger Button (Minimal, distinct red without frantic pulse) */}
        <button
          id="dock-sos-btn"
          onClick={onOpenSOS}
          className="flex flex-col items-center justify-center px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-md active:scale-95 transition-all shrink-0 min-h-[44px] ml-1 border border-rose-500/40"
          title={t.sosButton}
        >
          <ShieldAlert className="w-4 h-4 text-white" />
          <span className="text-[10px] tracking-tight uppercase font-bold text-white mt-0.5">
            SOS
          </span>
        </button>
      </div>
    </nav>
  );
};
