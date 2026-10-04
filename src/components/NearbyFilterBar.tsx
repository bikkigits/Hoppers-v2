import React, { useState, useRef, useEffect } from 'react';
import { FilterType, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import {
  Layers,
  Compass,
  MapPin,
  Building2,
  TreePine,
  Sparkles,
  Plane,
  Anchor,
  Navigation,
  ShieldAlert,
  Bath,
  Utensils,
  Ship,
  Landmark,
  ChevronUp,
  X,
} from 'lucide-react';

interface Props {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  language: Language;
}

type FilterCategory = 'zones' | 'utilities';

export const NearbyFilterBar: React.FC<Props> = ({
  activeFilter,
  onFilterChange,
  language,
}) => {
  const t = TRANSLATIONS[language];
  const [expandedCategory, setExpandedCategory] = useState<FilterCategory | null>(null);
  const trayRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const isUtilityFilter = (filter: FilterType): boolean =>
    filter === 'police' ||
    filter === 'toilets' ||
    filter === 'food' ||
    filter === 'railway' ||
    filter === 'ferry';

  const isCurrentFilterUtility = isUtilityFilter(activeFilter);

  // Sub-filters definitions
  const zoneFilters: { id: FilterType; label: string; icon: React.ReactNode; shortLabel: string }[] = [
    { id: 'all', label: t.filterAll || 'All Pandals', shortLabel: 'All', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'featured', label: t.filterFeatured || 'Featured', shortLabel: 'Featured', icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'heritage', label: t.filterHeritage || 'Heritage', shortLabel: 'Heritage', icon: <span className="text-xs">👑</span> },
    { id: 'saved', label: t.filterSaved || 'Saved', shortLabel: 'Saved', icon: <span className="text-xs">🔖</span> },
    { id: 'north', label: t.filterNorth, shortLabel: 'North', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'south', label: t.filterSouth, shortLabel: 'South', icon: <MapPin className="w-3.5 h-3.5" /> },
    { id: 'central', label: t.filterCentral, shortLabel: 'Central', icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: 'saltlake_rajarhat', label: t.filterSaltLakeRajarhat || 'Salt Lake & Rajarhat', shortLabel: 'Salt Lake & Rajarhat', icon: <TreePine className="w-3.5 h-3.5" /> },
    { id: 'newtown', label: t.filterNewtown || 'Newtown', shortLabel: 'Newtown', icon: <Building2 className="w-3.5 h-3.5 text-cyan-400" /> },
    { id: 'dumdum', label: t.filterDumDum, shortLabel: 'Dum Dum', icon: <Plane className="w-3.5 h-3.5" /> },
    { id: 'west', label: t.filterWest, shortLabel: 'West', icon: <Anchor className="w-3.5 h-3.5" /> },
    { id: 'behala', label: t.filterBehala, shortLabel: 'Behala', icon: <Navigation className="w-3.5 h-3.5" /> },
  ];

  const utilityFilters: { id: FilterType; label: string; icon: React.ReactNode; shortLabel: string }[] = [
    { id: 'food', label: t.filterFood || 'Food & Eateries', shortLabel: 'Food', icon: <Utensils className="w-3.5 h-3.5" /> },
    { id: 'toilets', label: t.filterToilets || 'Public Toilets', shortLabel: 'Toilets', icon: <Bath className="w-3.5 h-3.5" /> },
    { id: 'police', label: t.filterPolice || 'Police & First Aid', shortLabel: 'Police', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
    { id: 'railway', label: t.filterRailway || 'Railway Terminals', shortLabel: 'Rail', icon: <Landmark className="w-3.5 h-3.5" /> },
    { id: 'ferry', label: t.filterFerry || 'Ferry Ghats', shortLabel: 'Ferry', icon: <Ship className="w-3.5 h-3.5" /> },
  ];

  // Active label retrieval
  const activeZonePill = zoneFilters.find((f) => f.id === activeFilter);
  const activeUtilityPill = utilityFilters.find((f) => f.id === activeFilter);

  // Close tray when tapping outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (trayRef.current && !trayRef.current.contains(e.target as Node)) {
        setExpandedCategory(null);
      }
    };
    if (expandedCategory) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [expandedCategory]);

  const handleCategoryClick = (category: FilterCategory) => {
    if (expandedCategory === category) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(category);
      // Auto scroll sub-tray to beginning
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        }
      }, 50);
    }
  };

  const handleSelectSubFilter = (filterId: FilterType) => {
    onFilterChange(filterId);
    setExpandedCategory(null); // Auto-dismiss & collapse back to ultra-slim single row
  };

  const currentPills = expandedCategory === 'zones' ? zoneFilters : utilityFilters;

  return (
    <div
      ref={trayRef}
      id="nearby-filter-bar"
      className="relative w-full max-w-md mx-auto pointer-events-auto px-3"
    >
      {/* 2. On-Demand Expandable Sub-Filter Popover Tray */}
      {expandedCategory && (
        <div className="absolute bottom-full left-3 right-3 mb-2 p-2 bg-slate-950/95 backdrop-blur-2xl border border-slate-700/90 rounded-2xl shadow-2xl shadow-black/90 z-30 animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Header Row with Tray Title & Dismiss Close Button */}
          <div className="flex items-center justify-between px-1.5 pb-1.5 border-b border-slate-800/80 mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <span>{expandedCategory === 'zones' ? '🏛️' : '📍'}</span>
              <span>
                {expandedCategory === 'zones' ? 'Select Pandal Zone' : 'Select Nearby Utility'}
              </span>
            </div>
            <button
              onClick={() => setExpandedCategory(null)}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800/80 transition active:scale-95"
              aria-label="Close filters"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Horizontally Scrollable Sub-Pills */}
          <div
            ref={scrollContainerRef}
            className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar no-scrollbar py-0.5 scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {currentPills.map((pill) => {
              const isActive = activeFilter === pill.id;
              return (
                <button
                  key={pill.id}
                  id={`filter-${pill.id}`}
                  onClick={() => handleSelectSubFilter(pill.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all duration-150 active:scale-95 shadow-xs shrink-0 border ${
                    isActive
                      ? 'bg-amber-400 text-slate-950 border-amber-400 font-bold shadow-amber-500/20 scale-105'
                      : 'bg-slate-900/90 text-slate-200 border-slate-800 hover:border-slate-600 hover:text-white font-medium'
                  }`}
                >
                  <span className={isActive ? 'text-slate-950' : 'text-slate-400'}>
                    {pill.icon}
                  </span>
                  <span>{pill.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 1. Ultra-Compact Single-Row Capsule Bar (Default State) */}
      <div className="flex items-center p-1 bg-slate-950/90 rounded-2xl border border-slate-800/90 backdrop-blur-xl shadow-xl shadow-black/60">
        {/* Category A: Pandal Zones */}
        <button
          id="filter-tab-zones"
          onClick={() => handleCategoryClick('zones')}
          className={`flex-1 flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-all duration-150 active:scale-98 ${
            !isCurrentFilterUtility
              ? 'bg-slate-800/90 text-white font-semibold border border-amber-500/40 shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 font-medium'
          }`}
        >
          <div className="flex items-center gap-1.5 truncate">
            <span className="shrink-0 text-sm">🏛️</span>
            <span className="truncate">Zones</span>
            {!isCurrentFilterUtility && activeZonePill && (
              <span className="px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-bold text-[10px] border border-amber-400/30 truncate">
                {activeZonePill.shortLabel}
              </span>
            )}
          </div>
          <ChevronUp
            className={`w-3.5 h-3.5 text-slate-400 shrink-0 ml-1 transition-transform duration-200 ${
              expandedCategory === 'zones' ? 'rotate-180 text-amber-400' : ''
            }`}
          />
        </button>

        <div className="w-[1px] h-5 bg-slate-800 mx-1 shrink-0" />

        {/* Category B: Nearby Utilities & Food */}
        <button
          id="filter-tab-utilities"
          onClick={() => handleCategoryClick('utilities')}
          className={`flex-1 flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-all duration-150 active:scale-98 ${
            isCurrentFilterUtility
              ? 'bg-slate-800/90 text-white font-semibold border border-amber-500/40 shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 font-medium'
          }`}
        >
          <div className="flex items-center gap-1.5 truncate">
            <span className="shrink-0 text-sm">📍</span>
            <span className="truncate">Utilities</span>
            {isCurrentFilterUtility && activeUtilityPill && (
              <span className="px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-bold text-[10px] border border-amber-400/30 truncate">
                {activeUtilityPill.shortLabel}
              </span>
            )}
          </div>
          <ChevronUp
            className={`w-3.5 h-3.5 text-slate-400 shrink-0 ml-1 transition-transform duration-200 ${
              expandedCategory === 'utilities' ? 'rotate-180 text-amber-400' : ''
            }`}
          />
        </button>
      </div>
    </div>
  );
};
