import React from 'react';
import { NavigationTab, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { Map, ListFilter, Train, Award, ShieldAlert } from 'lucide-react';

interface Props {
  currentTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  language: Language;
  onOpenSOS: () => void;
  visitedCount: number;
}

export const BottomNav: React.FC<Props> = ({
  currentTab,
  onTabChange,
  language,
  onOpenSOS,
  visitedCount,
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
      className="fixed bottom-3 left-3 right-3 z-30 max-w-lg mx-auto pointer-events-auto pb-[env(safe-area-inset-bottom)]"
      role="navigation"
      aria-label="Main Navigation"
    >
      <div className="flex items-center justify-between px-4 py-1.5 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-white/15 shadow-2xl shadow-black/80 gap-1">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-150 min-h-[46px] active:scale-95 ${
                isActive
                  ? 'bg-amber-500/15 text-[#FFB300] font-bold shadow-inner'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={isActive ? 'text-[#FFB300] scale-105 transition-transform' : ''}>
                {tab.icon}
              </div>
              <span className="text-[10px] tracking-tight truncate max-w-[65px] mt-0.5">
                {tab.label}
              </span>
            </button>
          );
        })}

        {/* 1-Tap Emergency SOS Trigger Button */}
        <button
          id="dock-sos-btn"
          onClick={onOpenSOS}
          className="flex flex-col items-center justify-center px-3 py-2 rounded-xl bg-gradient-to-br from-red-600 to-red-700 text-white font-black shadow-lg shadow-red-600/30 hover:brightness-110 active:scale-95 transition-all shrink-0 min-h-[46px] ml-1 border border-red-400/40 animate-pulse"
          title={t.sosButton}
        >
          <ShieldAlert className="w-5 h-5 text-white" />
          <span className="text-[10px] tracking-tighter uppercase font-bold text-white mt-0.5">
            SOS
          </span>
        </button>
      </div>
    </nav>
  );
};
