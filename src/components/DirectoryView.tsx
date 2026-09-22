import React, { useState, useMemo } from 'react';
import { Pandal, Language, VisitedPandal } from '../types';
import { PANDALS_DATA } from '../data/mockData';
import { TRANSLATIONS } from '../data/translations';
import { calculateDistanceKm, formatDistance, estimateWalkingMinutes } from '../utils/geo';
import {
  Search,
  Train,
  Clock,
  Sparkles,
  CheckCircle2,
  Navigation,
  SlidersHorizontal,
  MapPin,
} from 'lucide-react';

interface Props {
  language: Language;
  onSelectPandal: (pandal: Pandal) => void;
  userCoords: { lat: number; lng: number } | null;
  visitedList: VisitedPandal[];
  onToggleVisited: (pandalId: string) => void;
}

export const DirectoryView: React.FC<Props> = ({
  language,
  onSelectPandal,
  userCoords,
  visitedList,
  onToggleVisited,
}) => {
  const t = TRANSLATIONS[language];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState<'all' | 'North' | 'Central' | 'South'>('all');
  const [sortBy, setSortBy] = useState<'distance' | 'crowd' | 'name'>(userCoords ? 'distance' : 'name');

  const visitedSet = useMemo(() => new Set(visitedList.map((v) => v.pandalId)), [visitedList]);

  const filteredPandals = useMemo(() => {
    return PANDALS_DATA.filter((pandal) => {
      // Zone filter
      if (selectedZone !== 'all' && pandal.zone !== selectedZone) {
        return false;
      }

      // Search filter
      if (!searchTerm.trim()) return true;
      const query = searchTerm.toLowerCase();
      const nameMatch =
        pandal.name.en.toLowerCase().includes(query) ||
        pandal.name.bn.toLowerCase().includes(query) ||
        pandal.name.hi.toLowerCase().includes(query);
      const themeMatch =
        pandal.theme.en.toLowerCase().includes(query) ||
        pandal.theme.bn.toLowerCase().includes(query) ||
        pandal.theme.hi.toLowerCase().includes(query);
      const metroMatch = pandal.nearestMetro.toLowerCase().includes(query);
      const zoneMatch = pandal.zone.toLowerCase().includes(query);

      return nameMatch || themeMatch || metroMatch || zoneMatch;
    }).sort((a, b) => {
      if (sortBy === 'distance' && userCoords) {
        const distA = calculateDistanceKm(userCoords.lat, userCoords.lng, a.lat, a.lng);
        const distB = calculateDistanceKm(userCoords.lat, userCoords.lng, b.lat, b.lng);
        return distA - distB;
      }
      if (sortBy === 'crowd') {
        const order: Record<string, number> = { Low: 1, Moderate: 2, Heavy: 3, Extreme: 4 };
        return (order[a.crowdLevel] || 3) - (order[b.crowdLevel] || 3);
      }
      // Name alphabetical
      const nameA = a.name[language] || a.name.en;
      const nameB = b.name[language] || b.name.en;
      return nameA.localeCompare(nameB);
    });
  }, [selectedZone, searchTerm, sortBy, userCoords, language]);

  const getCrowdBadge = (crowd: string) => {
    switch (crowd) {
      case 'Low':
        return {
          bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
          dot: 'bg-emerald-400',
          label: t.crowdLow,
        };
      case 'Moderate':
        return {
          bg: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
          dot: 'bg-amber-400',
          label: t.crowdModerate,
        };
      case 'Heavy':
        return {
          bg: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
          dot: 'bg-orange-400',
          label: t.crowdHeavy,
        };
      case 'Extreme':
      default:
        return {
          bg: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
          dot: 'bg-rose-400 animate-pulse',
          label: t.crowdExtreme,
        };
    }
  };

  return (
    <div
      id="directory-view"
      className="w-full max-w-3xl mx-auto px-4 pt-4 pb-28 min-h-[calc(100vh-62px)]"
    >
      {/* Search Input */}
      <div className="relative mb-3">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          id="pandal-search-input"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-white placeholder-slate-400 text-sm focus:outline-hidden focus:border-amber-500/50 shadow-inner"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800"
          >
            Clear
          </button>
        )}
      </div>

      {/* Zone & Sort Filter Chips */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
        <div className="flex items-center gap-1.5">
          {(['all', 'North', 'Central', 'South'] as const).map((zone) => (
            <button
              key={zone}
              onClick={() => setSelectedZone(zone)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                selectedZone === zone
                  ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md font-bold'
                  : 'bg-slate-900 text-slate-400 border-white/10 hover:border-white/20'
              }`}
            >
              {zone === 'all'
                ? t.allZones
                : zone === 'North'
                ? t.zoneNorth
                : zone === 'South'
                ? t.zoneSouth
                : t.zoneCentral}
            </button>
          ))}
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-1 shrink-0">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-900 text-slate-300 text-xs py-1 px-2 rounded-lg border border-white/10 focus:outline-hidden"
          >
            {userCoords && <option value="distance">{t.sortByDistance}</option>}
            <option value="name">{t.sortByName}</option>
            <option value="crowd">{t.sortByCrowd}</option>
          </select>
        </div>
      </div>

      {/* Pandals Count Heading */}
      <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
        <span>Showing {filteredPandals.length} iconic pujas</span>
        {userCoords && (
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            GPS sorted
          </span>
        )}
      </div>

      {/* Pandals Grid / Cards List */}
      <div className="space-y-3">
        {filteredPandals.map((pandal) => {
          const isVisited = visitedSet.has(pandal.id);
          const badge = getCrowdBadge(pandal.crowdLevel);

          let distanceStr: string | null = null;
          let walkMin: number | null = null;
          if (userCoords) {
            const d = calculateDistanceKm(userCoords.lat, userCoords.lng, pandal.lat, pandal.lng);
            distanceStr = formatDistance(d);
            walkMin = estimateWalkingMinutes(d);
          }

          return (
            <div
              key={pandal.id}
              id={`pandal-card-${pandal.id}`}
              onClick={() => onSelectPandal(pandal)}
              className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer shadow-lg active:scale-[0.99] ${
                isVisited
                  ? 'bg-slate-900/90 border-emerald-500/40 hover:border-emerald-500/60'
                  : 'bg-slate-900/80 border-white/10 hover:border-amber-500/40 hover:bg-slate-800/90'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-white/5 text-slate-300 border border-white/10">
                      {pandal.zone}
                    </span>
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${badge.bg}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      {badge.label}
                    </span>
                    {isVisited && (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Hopped
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                    {pandal.name[language] || pandal.name.en}
                  </h3>

                  <p className="text-xs text-amber-300/90 font-medium mt-1 line-clamp-1">
                    ✨ {pandal.theme[language] || pandal.theme.en}
                  </p>
                </div>

                {/* Distance Badge */}
                {distanceStr && (
                  <div className="shrink-0 text-right">
                    <span className="inline-block px-2 py-1 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-bold">
                      {distanceStr}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">~{walkMin}m</p>
                  </div>
                )}
              </div>

              {/* Nearest Metro & Facilities preview */}
              <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between gap-2 text-xs text-slate-400">
                <div className="flex items-center gap-1.5 truncate">
                  <Train className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="truncate">{pandal.nearestMetro}</span>
                </div>

                <span className="text-[11px] text-amber-400 font-semibold hover:underline shrink-0">
                  View Details →
                </span>
              </div>
            </div>
          );
        })}

        {filteredPandals.length === 0 && (
          <div className="py-12 text-center text-slate-400">
            <p className="text-sm font-medium">No pandals found matching "{searchTerm}"</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedZone('all');
              }}
              className="mt-2 text-xs text-amber-400 underline font-semibold"
            >
              Reset search & filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
