import React, { useState, useMemo } from 'react';
import {
  Pandal,
  FacilityPoint,
  FacilityCategory,
  Language,
  VisitedPandal,
  TrailStop,
} from '../types';
import { PANDALS_DATA, CRITICAL_FACILITIES, METRO_STATIONS } from '../data/mockData';
import { TRANSLATIONS } from '../data/translations';
import { calculateDistanceKm, formatDistance } from '../utils/geo';
import {
  Search,
  Train,
  Clock,
  Sparkles,
  CheckCircle2,
  Navigation,
  MapPin,
  Route,
  PhoneCall,
  Shield,
  Ambulance,
  Flame,
  ShieldAlert,
  Compass,
  ExternalLink,
  Plus,
  Check,
  RotateCcw,
} from 'lucide-react';

interface Props {
  language: Language;
  onSelectPandal: (pandal: Pandal) => void;
  onSelectFacility?: (facility: FacilityPoint) => void;
  userCoords: { lat: number; lng: number } | null;
  visitedList: VisitedPandal[];
  onToggleVisited: (pandalId: string) => void;
  trailStops?: TrailStop[];
  onToggleTrailStop?: (pandal: Pandal) => void;
  onAddFacilityToTrail?: (facility: FacilityPoint) => void;
  onOpenTrailBuilder?: () => void;
  onViewFacilityOnMap?: (facility: FacilityPoint) => void;
}

type DirectorySection = 'pandals' | 'poi';

export const DirectoryView: React.FC<Props> = ({
  language,
  onSelectPandal,
  onSelectFacility,
  userCoords,
  visitedList,
  onToggleVisited,
  trailStops = [],
  onToggleTrailStop,
  onAddFacilityToTrail,
  onOpenTrailBuilder,
  onViewFacilityOnMap,
}) => {
  const t = TRANSLATIONS[language];

  // Directory section switcher: Pandals vs POI & Transit
  const [section, setSection] = useState<DirectorySection>('pandals');

  // Pandal section states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState<'all' | 'North' | 'Central' | 'South' | 'East'>('all');
  const [sortBy, setSortBy] = useState<'distance' | 'crowd' | 'name'>(userCoords ? 'distance' : 'name');

  // POI section states
  const [poiSearch, setPoiSearch] = useState('');
  const [selectedPoiCategory, setSelectedPoiCategory] = useState<string>('all');

  const visitedSet = useMemo(() => new Set(visitedList.map((v) => v.pandalId)), [visitedList]);
  const trailStopIds = useMemo(() => new Set(trailStops.map((s) => s.id)), [trailStops]);

  // Combined POI dataset including Metro stations mapped as POIs
  const allPoiFacilities = useMemo<FacilityPoint[]>(() => {
    const metroPois: FacilityPoint[] = METRO_STATIONS.map((station) => ({
      id: `metro-${station.id}`,
      name: station.name,
      category: 'metro',
      lat: station.lat,
      lng: station.lng,
      address: {
        en: `${station.lines.map((l) => l.toUpperCase()).join(' & ')} Line, Kolkata Metro`,
        bn: `${station.lines.join(' ও ')} লাইন, কলকাতা মেট্রো`,
        hi: `${station.lines.join(' व ')} लाइन, कोलकाता मेट्रो`,
      },
      details: {
        en: `Kolkata Metro station with exits to ${station.connectingPandals.length} nearby major pandals.`,
        bn: `নিকটবর্তী ${station.connectingPandals.length}টি মণ্ডপের সংযোগকারী মেট্রো স্টেশন।`,
        hi: `समीपवर्ती ${station.connectingPandals.length} प्रमुख पंडालों हेतु मेट्रो स्टेशन।`,
      },
      hours: {
        en: '6:45 AM – 10:45 PM (Extended during Puja)',
        bn: 'সকাল ৬:৪৫ – রাত ১০:৪৫ (পুজোয় রাতভর)',
        hi: 'सुबह 6:45 – रात 10:45 (पूजा में विशेष सेवा)',
      },
      pujaHoursBadge: 'Extended during Puja',
    }));

    return [...CRITICAL_FACILITIES, ...metroPois];
  }, []);

  // Filtered pandals
  const filteredPandals = useMemo(() => {
    return PANDALS_DATA.filter((pandal) => {
      if (selectedZone !== 'all' && pandal.zone !== selectedZone) {
        return false;
      }
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
      const nameA = a.name[language] || a.name.en;
      const nameB = b.name[language] || b.name.en;
      return nameA.localeCompare(nameB);
    });
  }, [selectedZone, searchTerm, sortBy, userCoords, language]);

  // Filtered POIs
  const filteredPois = useMemo(() => {
    return allPoiFacilities
      .filter((poi) => {
        // Category filter
        if (selectedPoiCategory !== 'all') {
          if (selectedPoiCategory === 'police' && poi.category !== 'police') return false;
          if (selectedPoiCategory === 'helpdesk' && poi.category !== 'helpdesk') return false;
          if (selectedPoiCategory === 'metro' && poi.category !== 'metro') return false;
          if (selectedPoiCategory === 'railway' && poi.category !== 'railway') return false;
          if (selectedPoiCategory === 'ferry' && poi.category !== 'ferry') return false;
          if (selectedPoiCategory === 'medical' && poi.category !== 'medical') return false;
          if (selectedPoiCategory === 'pharmacy' && poi.category !== 'pharmacy') return false;
          if (selectedPoiCategory === 'atm' && poi.category !== 'atm') return false;
          if (selectedPoiCategory === 'parking' && poi.category !== 'parking') return false;
          if (
            selectedPoiCategory === 'restaurant' &&
            poi.category !== 'restaurant' &&
            poi.category !== 'food'
          )
            return false;
          if (selectedPoiCategory === 'hotel' && poi.category !== 'hotel') return false;
          if (selectedPoiCategory === 'landmark' && poi.category !== 'landmark') return false;
          if (selectedPoiCategory === 'petrol' && poi.category !== 'petrol') return false;
          if (selectedPoiCategory === 'toilets' && poi.category !== 'toilets') return false;
        }

        // Search term
        if (!poiSearch.trim()) return true;
        const query = poiSearch.toLowerCase();
        const nameMatch =
          poi.name.en.toLowerCase().includes(query) ||
          poi.name.bn.toLowerCase().includes(query) ||
          poi.name.hi.toLowerCase().includes(query);
        const detailsMatch =
          poi.details.en.toLowerCase().includes(query) ||
          poi.details.bn.toLowerCase().includes(query) ||
          poi.details.hi.toLowerCase().includes(query);
        const addressMatch =
          poi.address?.en.toLowerCase().includes(query) ||
          poi.address?.bn.toLowerCase().includes(query) ||
          poi.address?.hi.toLowerCase().includes(query);
        const categoryMatch = poi.category.toLowerCase().includes(query);

        return nameMatch || detailsMatch || addressMatch || categoryMatch;
      })
      .sort((a, b) => {
        if (userCoords) {
          const distA = calculateDistanceKm(userCoords.lat, userCoords.lng, a.lat, a.lng);
          const distB = calculateDistanceKm(userCoords.lat, userCoords.lng, b.lat, b.lng);
          return distA - distB;
        }
        return (a.name[language] || a.name.en).localeCompare(b.name[language] || b.name.en);
      });
  }, [allPoiFacilities, selectedPoiCategory, poiSearch, userCoords, language]);

  // POI Category pills definition with counts
  const poiCategories = useMemo(() => {
    const counts: Record<string, number> = {
      all: allPoiFacilities.length,
      metro: allPoiFacilities.filter((p) => p.category === 'metro').length,
      railway: allPoiFacilities.filter((p) => p.category === 'railway').length,
      ferry: allPoiFacilities.filter((p) => p.category === 'ferry').length,
      helpdesk: allPoiFacilities.filter((p) => p.category === 'helpdesk').length,
      police: allPoiFacilities.filter((p) => p.category === 'police').length,
      medical: allPoiFacilities.filter((p) => p.category === 'medical').length,
      pharmacy: allPoiFacilities.filter((p) => p.category === 'pharmacy').length,
      atm: allPoiFacilities.filter((p) => p.category === 'atm').length,
      parking: allPoiFacilities.filter((p) => p.category === 'parking').length,
      restaurant: allPoiFacilities.filter((p) => p.category === 'restaurant' || p.category === 'food')
        .length,
      hotel: allPoiFacilities.filter((p) => p.category === 'hotel').length,
      landmark: allPoiFacilities.filter((p) => p.category === 'landmark').length,
      petrol: allPoiFacilities.filter((p) => p.category === 'petrol').length,
      toilets: allPoiFacilities.filter((p) => p.category === 'toilets').length,
    };

    return [
      { id: 'all', label: `All (${counts.all})`, icon: '🧭' },
      { id: 'metro', label: `Metro Station (${counts.metro})`, icon: '🚇' },
      { id: 'railway', label: `Railway Station (${counts.railway})`, icon: '🚆' },
      { id: 'ferry', label: `Ferry Ghat (${counts.ferry})`, icon: '⛴️' },
      { id: 'helpdesk', label: `Puja Help Desk (${counts.helpdesk})`, icon: '🚨' },
      { id: 'police', label: `Police Station (${counts.police})`, icon: '👮' },
      { id: 'medical', label: `Hospital (${counts.medical})`, icon: '🏥' },
      { id: 'pharmacy', label: `Pharmacy (${counts.pharmacy})`, icon: '💊' },
      { id: 'atm', label: `ATM / Bank (${counts.atm})`, icon: '🏧' },
      { id: 'parking', label: `Parking (${counts.parking})`, icon: '🅿️' },
      { id: 'restaurant', label: `Restaurant (${counts.restaurant})`, icon: '🍽️' },
      { id: 'hotel', label: `Hotel (${counts.hotel})`, icon: '🏨' },
      { id: 'landmark', label: `Landmark (${counts.landmark})`, icon: '🏛️' },
      { id: 'petrol', label: `Petrol Pump (${counts.petrol})`, icon: '⛽' },
      { id: 'toilets', label: `Public Toilet (${counts.toilets})`, icon: '🚻' },
    ];
  }, [allPoiFacilities]);

  const getPoiBadgeStyle = (category: FacilityCategory) => {
    switch (category) {
      case 'metro':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'railway':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'ferry':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'helpdesk':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold';
      case 'police':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      case 'medical':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'pharmacy':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'atm':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/40';
      case 'parking':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      case 'restaurant':
      case 'food':
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
      case 'hotel':
        return 'bg-amber-600/20 text-amber-400 border-amber-600/40';
      case 'landmark':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      case 'petrol':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'toilets':
      default:
        return 'bg-emerald-600/20 text-emerald-400 border-emerald-600/40';
    }
  };

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

  const handleViewFacility = (facility: FacilityPoint) => {
    if (onViewFacilityOnMap) {
      onViewFacilityOnMap(facility);
    } else if (onSelectFacility) {
      onSelectFacility(facility);
    }
  };

  return (
    <div
      id="directory-view"
      className="w-full max-w-2xl mx-auto px-4 pt-4 pb-28 min-h-[calc(100vh-62px)]"
    >
      {/* Active Trail Floating Banner */}
      {trailStops.length > 0 && onOpenTrailBuilder && (
        <div className="mb-3.5 p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 border border-amber-500/35 flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
              {trailStops.length}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{t.trailBuilderTitle}</p>
              <p className="text-[11px] text-amber-300/90 truncate">
                {trailStops.length} {t.stopsCount} selected in your hopping route
              </p>
            </div>
          </div>
          <button
            onClick={onOpenTrailBuilder}
            className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shrink-0 active:scale-95 transition shadow-xs flex items-center gap-1"
          >
            <Route className="w-3.5 h-3.5" />
            <span>Open Trail</span>
          </button>
        </div>
      )}

      {/* Primary Section Switcher: Pandals vs POI & Transit Directory */}
      <div className="flex items-center p-1 bg-slate-900/90 rounded-2xl border border-slate-800 mb-4 shadow-sm">
        <button
          id="tab-pandals-btn"
          onClick={() => setSection('pandals')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition ${
            section === 'pandals'
              ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>🛕</span>
          <span>
            {t.tabPandals} ({PANDALS_DATA.length})
          </span>
        </button>
        <button
          id="tab-poi-btn"
          onClick={() => setSection('poi')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition ${
            section === 'poi'
              ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>🚨</span>
          <span>
            {t.tabPoi} ({allPoiFacilities.length})
          </span>
        </button>
      </div>

      {/* ================= SECTION 1: DURGA PANDALS DIRECTORY ================= */}
      {section === 'pandals' && (
        <div className="space-y-3 animate-fade-in">
          {/* Pandal Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="pandal-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-14 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-hidden focus:border-amber-400/50 shadow-xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded-md bg-slate-800"
              >
                Clear
              </button>
            )}
          </div>

          {/* Zone Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {(['all', 'North', 'Central', 'South', 'East'] as const).map((zone) => (
              <button
                key={zone}
                onClick={() => setSelectedZone(zone)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition active:scale-95 ${
                  selectedZone === zone
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                    : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                {zone === 'all'
                  ? t.allZones
                  : zone === 'North'
                  ? t.zoneNorth
                  : zone === 'Central'
                  ? t.zoneCentral
                  : zone === 'South'
                  ? t.zoneSouth
                  : 'East'}
              </button>
            ))}
          </div>

          {/* Sort By Row */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1 px-1">
            <span>
              {filteredPandals.length} {t.pandalsFound}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-900 border border-slate-800 rounded-lg text-slate-300 text-xs py-1 px-2 focus:outline-hidden focus:border-amber-400"
              >
                {userCoords && <option value="distance">{t.sortByDistance}</option>}
                <option value="crowd">{t.sortByCrowd}</option>
                <option value="name">{t.sortByName}</option>
              </select>
            </div>
          </div>

          {/* Pandals List */}
          <div className="space-y-2.5">
            {filteredPandals.map((pandal) => {
              const isVisited = visitedSet.has(pandal.id);
              const isInTrail = trailStopIds.has(pandal.id);
              const crowd = getCrowdBadge(pandal.crowdLevel);
              const distKm = userCoords
                ? calculateDistanceKm(userCoords.lat, userCoords.lng, pandal.lat, pandal.lng)
                : null;

              return (
                <div
                  key={pandal.id}
                  className={`p-3.5 rounded-2xl border transition-all duration-200 shadow-sm ${
                    isInTrail
                      ? 'bg-slate-900/95 border-amber-500/50 shadow-amber-500/10'
                      : isVisited
                      ? 'bg-slate-900/70 border-emerald-500/30'
                      : 'bg-slate-900/85 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                          {pandal.zone}
                        </span>
                        {pandal.isFeatured && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                            <span>Featured</span>
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border flex items-center gap-1 ${crowd.bg}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${crowd.dot}`} />
                          <span>{crowd.label}</span>
                        </span>
                      </div>

                      <h3
                        onClick={() => onSelectPandal(pandal)}
                        className="text-sm font-bold text-white hover:text-amber-300 transition cursor-pointer"
                      >
                        {pandal.name[language] || pandal.name.en}
                      </h3>

                      <p className="text-xs text-amber-400/90 italic mt-0.5 line-clamp-1">
                        "{pandal.theme[language] || pandal.theme.en}"
                      </p>

                      <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Train className="w-3 h-3 text-blue-400" />
                          <span>{pandal.nearestMetro}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>~{pandal.walkingTimeToMetroMin} min walk</span>
                        </span>
                        {distKm !== null && (
                          <span className="flex items-center gap-1 text-slate-300 font-medium">
                            <MapPin className="w-3 h-3 text-amber-400" />
                            <span>{formatDistance(distKm)}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons: Add to Trail + Visited */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {onToggleTrailStop && (
                        <button
                          onClick={() => onToggleTrailStop(pandal)}
                          className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition active:scale-95 shadow-xs ${
                            isInTrail
                              ? 'bg-amber-400 text-slate-950 font-black border border-amber-300 shadow-amber-500/20'
                              : 'bg-slate-800 hover:bg-slate-750 text-amber-400 border border-amber-400/30'
                          }`}
                          title={isInTrail ? t.removeFromTrail : t.addToTrail}
                        >
                          {isInTrail ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>{t.inTrail}</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>{t.addToTrail}</span>
                            </>
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => onToggleVisited(pandal.id)}
                        className={`p-1.5 rounded-xl border transition ${
                          isVisited
                            ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40'
                            : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300'
                        }`}
                        title={isVisited ? t.alreadyVisited : t.markVisited}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= SECTION 2: POINTS OF INTEREST & EMERGENCY DIRECTORY ================= */}
      {section === 'poi' && (
        <div className="space-y-4 animate-fade-in">
          {/* Header Banner */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border border-red-500/30">
            <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>{t.poiDirectoryTitle}</span>
            </h2>
            <p className="text-[11px] text-slate-300/90 mt-0.5 leading-relaxed">
              {t.poiDirectorySubtitle}
            </p>
          </div>

          {/* Kolkata Emergency Helplines Quick-Dial Matrix (Matching Reference Video) */}
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2 px-1">
              {t.emergencyHelplines}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {/* Police */}
              <a
                href="tel:100"
                className="p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 flex items-center justify-between gap-2 transition active:scale-98 group"
              >
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-slate-400 group-hover:text-slate-300">
                    {t.policeControl}
                  </p>
                  <p className="text-xs font-black text-white tracking-wide mt-0.5">100 / 1090</p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <PhoneCall className="w-4 h-4" />
                </div>
              </a>

              {/* Ambulance / Medical */}
              <a
                href="tel:102"
                className="p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 flex items-center justify-between gap-2 transition active:scale-98 group"
              >
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-slate-400 group-hover:text-slate-300">
                    {t.ambulanceMedical}
                  </p>
                  <p className="text-xs font-black text-white tracking-wide mt-0.5">102 / 108</p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                  <PhoneCall className="w-4 h-4" />
                </div>
              </a>

              {/* Fire Brigade */}
              <a
                href="tel:101"
                className="p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 flex items-center justify-between gap-2 transition active:scale-98 group"
              >
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-slate-400 group-hover:text-slate-300">
                    {t.fireBrigade}
                  </p>
                  <p className="text-xs font-black text-white tracking-wide mt-0.5">101</p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                  <PhoneCall className="w-4 h-4" />
                </div>
              </a>

              {/* Women Safety Helpline */}
              <a
                href="tel:1091"
                className="p-3 rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 flex items-center justify-between gap-2 transition active:scale-98 group"
              >
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-slate-400 group-hover:text-slate-300">
                    {t.womenSafety}
                  </p>
                  <p className="text-xs font-black text-white tracking-wide mt-0.5">1091</p>
                </div>
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <PhoneCall className="w-4 h-4" />
                </div>
              </a>
            </div>
          </div>

          {/* Search POI Input */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="poi-search-input"
              type="text"
              value={poiSearch}
              onChange={(e) => setPoiSearch(e.target.value)}
              placeholder={t.searchPoiPlaceholder}
              className="w-full pl-10 pr-14 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-hidden focus:border-amber-400/50 shadow-xs"
            />
            {poiSearch && (
              <button
                onClick={() => setPoiSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded-md bg-slate-800"
              >
                Clear
              </button>
            )}
          </div>

          {/* Horizontal Scrolling POI Category Pills (Matching Reference Video) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {poiCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedPoiCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition flex items-center gap-1.5 active:scale-95 ${
                  selectedPoiCategory === cat.id
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* POI Cards List */}
          {filteredPois.length === 0 ? (
            <div className="text-center py-10 px-4 rounded-2xl bg-slate-900/50 border border-slate-800">
              <Search className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-sm font-bold text-white">No Facilities Found</p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Try adjusting your search query or category filter.
              </p>
              <button
                onClick={() => {
                  setPoiSearch('');
                  setSelectedPoiCategory('all');
                }}
                className="mt-3 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-amber-400 text-xs font-bold border border-amber-400/30 flex items-center gap-1 mx-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>RESET FILTERS</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPois.map((poi) => {
                const isInTrail = trailStopIds.has(poi.id);
                const badgeStyle = getPoiBadgeStyle(poi.category);
                const distKm = userCoords
                  ? calculateDistanceKm(userCoords.lat, userCoords.lng, poi.lat, poi.lng)
                  : null;

                return (
                  <div
                    key={poi.id}
                    className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all shadow-sm space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        {/* Category Badge & Puja Timing Badge */}
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${badgeStyle}`}
                          >
                            {poi.category.toUpperCase()}
                          </span>
                          {poi.pujaHoursBadge && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                              {poi.pujaHoursBadge}
                            </span>
                          )}
                        </div>

                        {/* POI Name */}
                        <h3 className="text-sm font-bold text-white leading-snug">
                          {poi.name[language] || poi.name.en}
                        </h3>

                        {/* Address */}
                        {poi.address && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="truncate">{poi.address[language] || poi.address.en}</span>
                          </div>
                        )}

                        {/* Operating Hours */}
                        {poi.hours && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                            <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <span>{poi.hours[language] || poi.hours.en}</span>
                          </div>
                        )}

                        {/* Details */}
                        <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                          {poi.details[language] || poi.details.en}
                        </p>

                        {/* Distance from user & Contact */}
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-2 flex-wrap">
                          {distKm !== null && (
                            <span className="text-amber-400 font-semibold flex items-center gap-1">
                              <Compass className="w-3 h-3" />
                              <span>{formatDistance(distKm)} away</span>
                            </span>
                          )}
                          {poi.contact && (
                            <a
                              href={`tel:${poi.contact.split('/')[0].trim()}`}
                              className="text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold underline"
                            >
                              <PhoneCall className="w-3 h-3" />
                              <span>{poi.contact}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons: View Map & Add to Trail (Matching Video) */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end gap-2">
                      {onAddFacilityToTrail && (
                        <button
                          onClick={() => onAddFacilityToTrail(poi)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-xs ${
                            isInTrail
                              ? 'bg-amber-400 text-slate-950 font-black border border-amber-300 shadow-amber-500/20'
                              : 'bg-slate-800 hover:bg-slate-750 text-amber-400 border border-amber-400/30'
                          }`}
                        >
                          {isInTrail ? (
                            <>
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>{t.inTrail}</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3.5 h-3.5" />
                              <span>{t.addToTrail}</span>
                            </>
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => handleViewFacility(poi)}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-rose-950/40"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>{t.viewMap}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
