import React, { useRef } from 'react';
import { FilterType, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import {
  Layers,
  Compass,
  MapPin,
  ShieldAlert,
  Bath,
  Train,
  Utensils,
  Ship,
  Landmark,
} from 'lucide-react';

interface Props {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  language: Language;
}

export const NearbyFilterBar: React.FC<Props> = ({
  activeFilter,
  onFilterChange,
  language,
}) => {
  const t = TRANSLATIONS[language];
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const filters: { id: FilterType; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'all', label: t.filterAll, icon: <Layers className="w-3.5 h-3.5" />, color: '#FFB300' },
    { id: 'north', label: t.filterNorth, icon: <Compass className="w-3.5 h-3.5" />, color: '#FFB300' },
    { id: 'south', label: t.filterSouth, icon: <MapPin className="w-3.5 h-3.5" />, color: '#FFB300' },
    { id: 'police', label: t.filterPolice, icon: <ShieldAlert className="w-3.5 h-3.5" />, color: '#E53935' },
    { id: 'toilets', label: t.filterToilets, icon: <Bath className="w-3.5 h-3.5" />, color: '#10B981' },
    { id: 'metro', label: t.filterMetro, icon: <Train className="w-3.5 h-3.5" />, color: '#3B82F6' },
    { id: 'railway', label: t.filterRailway, icon: <Landmark className="w-3.5 h-3.5" />, color: '#8B5CF6' },
    { id: 'food', label: t.filterFood, icon: <Utensils className="w-3.5 h-3.5" />, color: '#F97316' },
    { id: 'ferry', label: t.filterFerry, icon: <Ship className="w-3.5 h-3.5" />, color: '#06B6D4' },
  ];

  return (
    <div
      id="nearby-filter-bar"
      className="w-full overflow-hidden pointer-events-auto py-1"
    >
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar no-scrollbar px-3 py-1 scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {filters.map((filter) => {
          const isActive = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              id={`filter-${filter.id}`}
              onClick={() => onFilterChange(filter.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-150 active:scale-95 shadow-xs backdrop-blur-md shrink-0 border ${
                isActive
                  ? 'bg-amber-400 text-slate-950 border-amber-400 font-semibold shadow-amber-500/10'
                  : 'bg-slate-900/80 text-slate-300 border-slate-800/80 hover:border-slate-700 hover:text-white'
              }`}
            >
              <span className={isActive ? 'text-slate-950' : 'text-slate-400'}>
                {filter.icon}
              </span>
              <span>{filter.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
