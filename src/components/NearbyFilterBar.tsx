// Path: src/components/NearbyFilterBar.tsx
import React from 'react';
import { 
  Building2, 
  MapPin, 
  Sparkles, 
  Navigation, 
  Flame, 
  Compass, 
  HeartHandshake, 
  ShieldAlert, 
  Train, 
  Ship, 
  Coffee, 
  Salad 
} from 'lucide-react';
import { CivicPOICategory, FilterType, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

export interface NearbyFilterBarProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  activeUtilityFilter?: CivicPOICategory | null;
  onUtilityFilterChange?: (category: CivicPOICategory | null) => void;
  language: Language;
}

export const NearbyFilterBar: React.FC<NearbyFilterBarProps> = ({
  activeFilter,
  onFilterChange,
  activeUtilityFilter = null,
  onUtilityFilterChange,
  language
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  // Responsive Zone filter items linked to dynamic translations
  const zoneFilters: Array<{ id: FilterType; label: string; shortLabel: string; icon: React.ReactNode }> = [
    { id: 'all', label: t.filterAll || 'All Pandals', shortLabel: t.filterShortAll || 'All', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'north', label: t.filterNorth || 'North Kolkata', shortLabel: t.filterShortNorth || 'North', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'south', label: t.filterSouth || 'South Kolkata', shortLabel: t.filterShortSouth || 'South', icon: <Flame className="w-3.5 h-3.5" /> },
    { id: 'central', label: t.filterCentral || 'Central Kolkata', shortLabel: t.filterShortCentral || 'Central', icon: <Building2 className="w-3.5 h-3.5" /> },
    { id: 'saltlake', label: t.filterSaltLake || 'Salt Lake', shortLabel: t.filterShortSaltLake || 'Salt Lake', icon: <MapPin className="w-3.5 h-3.5" /> },
    { id: 'rajarhat', label: t.filterRajarhat || 'Rajarhat', shortLabel: t.filterShortRajarhat || 'Rajarhat', icon: <Navigation className="w-3.5 h-3.5" /> },
    { id: 'dumdum', label: t.filterDumDum || 'Dum Dum', shortLabel: t.filterShortDumDum || 'Dum Dum', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'west', label: t.filterWest || 'Howrah / West', shortLabel: t.filterShortWest || 'West', icon: <MapPin className="w-3.5 h-3.5" /> },
    { id: 'behala', label: t.filterBehala || 'Behala', shortLabel: t.filterShortBehala || 'Behala', icon: <Navigation className="w-3.5 h-3.5" /> },
    { id: 'jadavpur', label: t.filterJadavpur || 'Jadavpur', shortLabel: t.filterShortJadavpur || 'Jadavpur', icon: <Compass className="w-3.5 h-3.5" /> }
  ];

  // Utility Civic filter items linked to dynamic translations
  const utilityFilters: Array<{ id: CivicPOICategory; filterFallback: FilterType; label: string; shortLabel: string; icon: React.ReactNode }> = [
    { id: 'hospital', filterFallback: 'police', label: t.filterHospitals || '24x7 Hospitals', shortLabel: t.filterShortHospitals || 'Hospitals', icon: <HeartHandshake className="w-3.5 h-3.5" /> },
    { id: 'toilet', filterFallback: 'toilets', label: t.filterWashrooms || 'Washrooms', shortLabel: t.filterShortWashrooms || 'Toilets', icon: <MapPin className="w-3.5 h-3.5" /> },
    { id: 'pure_veg', filterFallback: 'food', label: t.filterPureVeg || '100% Pure Veg', shortLabel: t.filterShortPureVeg || 'Pure Veg', icon: <Salad className="w-3.5 h-3.5" /> },
    { id: 'iconic_food', filterFallback: 'food', label: t.filterFood || 'Iconic Food', shortLabel: t.filterShortFood || 'Food', icon: <Coffee className="w-3.5 h-3.5" /> },
    { id: 'police', filterFallback: 'police', label: t.filterPolice || 'Police Booths', shortLabel: t.filterShortPolice || 'Police', icon: <ShieldAlert className="w-3.5 h-3.5" /> },
    { id: 'railway', filterFallback: 'railway', label: t.filterRailway || 'Rail Stations', shortLabel: t.filterShortRail || 'Rail', icon: <Train className="w-3.5 h-3.5" /> },
    { id: 'ferry', filterFallback: 'ferry', label: t.filterFerry || 'Ferry Ghats', shortLabel: t.filterShortFerry || 'Ferry', icon: <Ship className="w-3.5 h-3.5" /> }
  ];

  const handleZoneClick = (zoneId: FilterType) => {
    if (onUtilityFilterChange) {
      onUtilityFilterChange(null);
    }
    onFilterChange(zoneId);
  };

  const handleUtilityClick = (category: CivicPOICategory, fallbackFilter: FilterType) => {
    if (onUtilityFilterChange) {
      if (activeUtilityFilter === category) {
        onUtilityFilterChange(null);
      } else {
        onUtilityFilterChange(category);
      }
    } else {
      if (activeFilter === fallbackFilter) {
        onFilterChange('all');
      } else {
        onFilterChange(fallbackFilter);
      }
    }
  };

  return (
    <div className="w-full flex flex-col gap-1.5 py-1 px-2 select-none z-10">
      {/* Tier 1: Zone Filters Capsule Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {zoneFilters.map((zf) => {
          const isSelected = activeFilter === zf.id && activeUtilityFilter === null;
          return (
            <button
              key={zf.id}
              onClick={() => handleZoneClick(zf.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 border shadow-sm ${
                isSelected
                  ? 'bg-amber-600 border-amber-500 text-white shadow-amber-900/20'
                  : 'bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              {zf.icon}
              <span className="hidden sm:inline">{zf.label}</span>
              <span className="inline sm:hidden">{zf.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Tier 2: Civic Utilities Capsule Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {utilityFilters.map((uf) => {
          const isSelected = activeUtilityFilter === uf.id || (!onUtilityFilterChange && activeFilter === uf.filterFallback);
          return (
            <button
              key={uf.id}
              onClick={() => handleUtilityClick(uf.id, uf.filterFallback)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 border shadow-xs ${
                isSelected
                  ? 'bg-rose-600 border-rose-500 text-white shadow-rose-900/20'
                  : 'bg-stone-50/90 dark:bg-stone-900/90 backdrop-blur-md border-stone-200/70 dark:border-stone-800/70 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800'
              }`}
            >
              {uf.icon}
              <span className="hidden sm:inline">{uf.label}</span>
              <span className="inline sm:hidden">{uf.shortLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};