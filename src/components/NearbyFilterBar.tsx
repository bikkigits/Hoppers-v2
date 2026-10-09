import React, { useState, useRef, useEffect } from 'react';
import { FilterType, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { useFilter } from '../context/FilterContext';
import { ChevronUp, X, Check } from 'lucide-react';

interface Props {
  activeFilter?: FilterType;
  onFilterChange?: (filter: FilterType) => void;
  language: Language;
}

type FilterCategory = 'zones' | 'utilities';

interface ZoneOption {
  id: FilterType;
  name: string;
  subtitle: string;
  emoji: string;
  gradient: string;
  shortLabel: string;
}

interface UtilityOption {
  id: FilterType;
  name: string;
  subtitle: string;
  emoji: string;
  gradient: string;
  shortLabel: string;
}

export const NearbyFilterBar: React.FC<Props> = ({
  activeFilter: propActiveFilter,
  onFilterChange: propOnFilterChange,
  language,
}) => {
  const { activeFilter: contextActiveFilter, setActiveFilter } = useFilter();
  const activeFilter = propActiveFilter !== undefined ? propActiveFilter : contextActiveFilter;
  const onFilterChange = propOnFilterChange || setActiveFilter;

  const t = TRANSLATIONS[language];
  const [expandedCategory, setExpandedCategory] = useState<FilterCategory | null>(null);
  const trayRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const isUtilityFilter = (filter: string): boolean =>
    filter === 'police' ||
    filter === 'toilets' ||
    filter === 'food' ||
    filter === 'railway' ||
    filter === 'ferry' ||
    filter === 'hospital' ||
    filter === 'parking' ||
    filter === 'metro';

  const isCurrentFilterUtility = isUtilityFilter(activeFilter);

  // 10 Zone Cards (2x5 Grid)
  const zoneOptions: ZoneOption[] = [
    {
      id: 'all',
      name: t.filterAll || 'All Pandals',
      subtitle: 'Entire city & heritage',
      emoji: '🏛️',
      gradient: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-300',
      shortLabel: 'All',
    },
    {
      id: 'north',
      name: t.filterNorth || 'North Kolkata',
      subtitle: 'Traditional & bonedi bari',
      emoji: '🧭',
      gradient: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300',
      shortLabel: 'North',
    },
    {
      id: 'south',
      name: t.filterSouth || 'South Kolkata',
      subtitle: 'Mega theme spectacles',
      emoji: '📍',
      gradient: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30 text-blue-300',
      shortLabel: 'South',
    },
    {
      id: 'central',
      name: t.filterCentral || 'Central Kolkata',
      subtitle: 'Historic community pujas',
      emoji: '🏛️',
      gradient: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-300',
      shortLabel: 'Central',
    },
    {
      id: 'saltlake_rajarhat',
      name: 'Salt Lake',
      subtitle: 'Township celebrations',
      emoji: '🌲',
      gradient: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-300',
      shortLabel: 'Salt Lake',
    },
    {
      id: 'rajarhat',
      name: 'Rajarhat',
      subtitle: 'Festive parks & trails',
      emoji: '🌿',
      gradient: 'from-teal-500/20 to-emerald-500/20 border-teal-500/30 text-teal-300',
      shortLabel: 'Rajarhat',
    },
    {
      id: 'newtown',
      name: t.filterNewtown || 'New Town',
      subtitle: 'Futuristic architectures',
      emoji: '🏢',
      gradient: 'from-sky-500/20 to-indigo-500/20 border-sky-500/30 text-sky-300',
      shortLabel: 'New Town',
    },
    {
      id: 'behala',
      name: t.filterBehala || 'Behala',
      subtitle: 'Artistic grand corridors',
      emoji: '⛵',
      gradient: 'from-rose-500/20 to-red-500/20 border-rose-500/30 text-rose-300',
      shortLabel: 'Behala',
    },
    {
      id: 'dumdum',
      name: t.filterDumDum || 'Dum Dum',
      subtitle: 'Airport corridor hubs',
      emoji: '✈️',
      gradient: 'from-violet-500/20 to-purple-500/20 border-violet-500/30 text-violet-300',
      shortLabel: 'Dum Dum',
    },
    {
      id: 'west',
      name: t.filterWest || 'West & Howrah',
      subtitle: 'Riverfront grand pandals',
      emoji: '🌉',
      gradient: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30 text-amber-300',
      shortLabel: 'West',
    },
  ];

  // 8 Utility / POI Cards (2x4 Grid)
  const utilityOptions: UtilityOption[] = [
    {
      id: 'police',
      name: t.filterPolice || 'Police & Aid',
      subtitle: 'Nearby assistance',
      emoji: '🛡️',
      gradient: 'from-indigo-500/20 to-blue-500/20 border-indigo-500/30 text-indigo-300',
      shortLabel: 'Police',
    },
    {
      id: 'hospital',
      name: 'Hospitals',
      subtitle: '24x7 medical & emergency',
      emoji: '🏥',
      gradient: 'from-rose-500/20 to-red-500/20 border-rose-500/30 text-rose-300',
      shortLabel: 'Hospitals',
    },
    {
      id: 'toilets',
      name: t.filterToilets || 'Public Toilets',
      subtitle: 'Clean KMC & Sulabh',
      emoji: '🚻',
      gradient: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300',
      shortLabel: 'Toilets',
    },
    {
      id: 'food',
      name: t.filterFood || 'Food & Eateries',
      subtitle: 'Bhog, stalls & dining',
      emoji: '🍲',
      gradient: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-300',
      shortLabel: 'Food',
    },
    {
      id: 'parking',
      name: 'Puja Parking',
      subtitle: 'Official parking lots',
      emoji: '🅿️',
      gradient: 'from-sky-500/20 to-blue-500/20 border-sky-500/30 text-sky-300',
      shortLabel: 'Parking',
    },
    {
      id: 'railway',
      name: 'Metro Stations',
      subtitle: 'Rapid transit corridors',
      emoji: '🚆',
      gradient: 'from-cyan-500/20 to-teal-500/20 border-cyan-500/30 text-cyan-300',
      shortLabel: 'Metro',
    },
    {
      id: 'railway',
      name: t.filterRailway || 'Railway Terminals',
      subtitle: 'Howrah & Sealdah hubs',
      emoji: '🚆',
      gradient: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30 text-purple-300',
      shortLabel: 'Rail',
    },
    {
      id: 'ferry',
      name: t.filterFerry || 'Ferry Ghats',
      subtitle: 'Hooghly riverboat routes',
      emoji: '⛴️',
      gradient: 'from-teal-500/20 to-cyan-500/20 border-teal-500/30 text-teal-300',
      shortLabel: 'Ferry',
    },
  ];

  // Active label retrieval
  const activeZoneOption = zoneOptions.find((f) => f.id === activeFilter);
  const activeUtilityOption = utilityOptions.find((f) => f.id === activeFilter);

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
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = 0;
        }
      }, 50);
    }
  };

  const handleSelectOption = (filterId: FilterType) => {
    onFilterChange(filterId);
    setExpandedCategory(null);
  };

  return (
    <div
      ref={trayRef}
      id="nearby-filter-bar"
      className="relative w-full max-w-md mx-auto pointer-events-auto px-3"
    >
      {/* 2. Rich Popover Menu with 2x2 Grid System */}
      {expandedCategory && (
        <div className="absolute bottom-full left-3 right-3 mb-2.5 p-3.5 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl shadow-black/95 z-30 animate-in fade-in slide-in-from-bottom-3 duration-200 max-h-[62vh] flex flex-col">
          {/* Header Row */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/90 mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-base">
                {expandedCategory === 'zones' ? '🏛️' : '📍'}
              </span>
              <div>
                <h4 className="text-xs font-bold text-white tracking-wide">
                  {expandedCategory === 'zones' ? 'Select Pandal Zone' : 'Nearby Utilities & POIs'}
                </h4>
                <p className="text-[10px] text-slate-400">
                  {expandedCategory === 'zones'
                    ? 'Explore pandals by city area'
                    : 'Locate essential emergency & travel hubs'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setExpandedCategory(null)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition active:scale-95"
              aria-label="Close menu"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 2x2 Scrollable Grid Container */}
          <div
            ref={scrollContainerRef}
            className="overflow-y-auto overscroll-contain pr-1 flex-1 space-y-2.5 scrollbar-thin"
            style={{ WebkitOverflowScrolling: 'touch' }}
          >
            <div className="grid grid-cols-2 gap-3 pb-1">
              {expandedCategory === 'zones'
                ? zoneOptions.map((zone) => {
                    const isActive = activeFilter === zone.id;
                    return (
                      <button
                        key={zone.id}
                        id={`filter-zone-${zone.id}`}
                        onClick={() => handleSelectOption(zone.id)}
                        className={`group relative flex items-start gap-2.5 p-2.5 rounded-xl text-left border transition-all duration-150 active:scale-95 ${
                          isActive
                            ? 'bg-amber-400/10 border-amber-400/80 ring-1 ring-amber-400/50 shadow-md shadow-amber-500/10'
                            : 'bg-slate-950/70 hover:bg-slate-800/80 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        {/* Gradient Icon Thumbnail */}
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border text-base shadow-xs bg-gradient-to-br ${zone.gradient}`}
                        >
                          {zone.emoji}
                        </div>

                        {/* Text Block */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className={`text-xs font-bold leading-tight truncate ${
                                isActive ? 'text-amber-300' : 'text-slate-100 group-hover:text-amber-200'
                              }`}
                            >
                              {zone.name}
                            </span>
                            {isActive && (
                              <Check className="w-3 h-3 text-amber-400 shrink-0" />
                            )}
                          </div>
                          <p
                            className={`text-[10px] leading-tight mt-0.5 truncate ${
                              isActive ? 'text-amber-300/80' : 'text-slate-400'
                            }`}
                          >
                            {zone.subtitle}
                          </p>
                        </div>
                      </button>
                    );
                  })
                : utilityOptions.map((poi, idx) => {
                    const isActive = activeFilter === poi.id;
                    return (
                      <button
                        key={`${poi.id}-${idx}`}
                        id={`filter-poi-${poi.id}-${idx}`}
                        onClick={() => handleSelectOption(poi.id)}
                        className={`group relative flex items-start gap-2.5 p-2.5 rounded-xl text-left border transition-all duration-150 active:scale-95 ${
                          isActive
                            ? 'bg-amber-400/10 border-amber-400/80 ring-1 ring-amber-400/50 shadow-md shadow-amber-500/10'
                            : 'bg-slate-950/70 hover:bg-slate-800/80 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        {/* Prominent Emoji Thumbnail */}
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border text-base shadow-xs bg-gradient-to-br ${poi.gradient}`}
                        >
                          {poi.emoji}
                        </div>

                        {/* Category Name & Subtitle */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className={`text-xs font-bold leading-tight truncate ${
                                isActive ? 'text-amber-300' : 'text-slate-100 group-hover:text-amber-200'
                              }`}
                            >
                              {poi.name}
                            </span>
                            {isActive && (
                              <Check className="w-3 h-3 text-amber-400 shrink-0" />
                            )}
                          </div>
                          <p
                            className={`text-[10px] leading-tight mt-0.5 truncate ${
                              isActive ? 'text-amber-300/80' : 'text-slate-400'
                            }`}
                          >
                            {poi.subtitle}
                          </p>
                        </div>
                      </button>
                    );
                  })}
            </div>
          </div>
        </div>
      )}

      {/* 1. Ultra-Compact Single-Row Capsule Bar (Trigger Dock) */}
      <div className="flex items-center p-1 bg-slate-950/90 rounded-2xl border border-slate-800/90 backdrop-blur-xl shadow-xl shadow-black/60">
        {/* Category A: Pandal Zones Button */}
        <button
          id="filter-tab-zones"
          onClick={() => handleCategoryClick('zones')}
          className={`flex-1 flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-150 active:scale-98 ${
            !isCurrentFilterUtility
              ? 'bg-slate-800/90 text-white font-semibold border border-amber-500/40 shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 font-medium'
          }`}
        >
          <div className="flex items-center gap-1.5 truncate">
            <span className="shrink-0 text-sm">🏛️</span>
            <span className="truncate">Zones</span>
            {!isCurrentFilterUtility && activeZoneOption && (
              <span className="px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-bold text-[10px] border border-amber-400/30 truncate">
                {activeZoneOption.shortLabel}
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

        {/* Category B: Nearby Utilities & Food Button */}
        <button
          id="filter-tab-utilities"
          onClick={() => handleCategoryClick('utilities')}
          className={`flex-1 flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-150 active:scale-98 ${
            isCurrentFilterUtility
              ? 'bg-slate-800/90 text-white font-semibold border border-amber-500/40 shadow-xs'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 font-medium'
          }`}
        >
          <div className="flex items-center gap-1.5 truncate">
            <span className="shrink-0 text-sm">📍</span>
            <span className="truncate">Utilities</span>
            {isCurrentFilterUtility && activeUtilityOption && (
              <span className="px-1.5 py-0.5 rounded-md bg-amber-400/20 text-amber-300 font-bold text-[10px] border border-amber-400/30 truncate">
                {activeUtilityOption.shortLabel}
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

export default NearbyFilterBar;
