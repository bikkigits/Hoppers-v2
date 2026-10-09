import React, { useState } from 'react';
import {
  Pandal,
  TrailStop,
  TravelMode,
  Language,
  CorridorDetourSuggestion,
  CuratedTrailPreset,
} from '../types';
import { TRANSLATIONS } from '../data/translations';
import {
  calculateTrailMetrics,
  detectPandalsOnWay,
  optimizeTrailOrder,
  batchInsertAllDetours,
  buildGoogleMapsMultiStopUrl,
  buildWhatsAppItineraryText,
  formatDurationHoursMins,
  CURATED_TRAILS,
} from '../utils/trailRouting';
import { formatDistance, calculateDistanceKm } from '../utils/geo';
import { CrowdStatusBadge } from './CrowdStatusBadge';
import {
  Route,
  X,
  Plus,
  Trash2,
  ArrowUpDown,
  Navigation,
  Share2,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Clock,
  Compass,
  Footprints,
  Train,
  Car,
  Bike,
  Check,
  MapPin,
  AlertCircle,
  Copy,
  ExternalLink,
  Map as MapIcon,
  Zap,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  trailStops?: TrailStop[];
  stops?: TrailStop[];
  onUpdateTrailStops: (stops: TrailStop[]) => void;
  allPandals?: Pandal[];
  language: Language;
  userCoords: { lat: number; lng: number } | null;
  onSelectPandalPreview: (pandal: Pandal) => void;
  onFocusMapOnTrail?: () => void;
}

export const TrailBuilderSheet: React.FC<Props> = ({
  isOpen,
  onClose,
  trailStops: propTrailStops,
  stops: propStops,
  onUpdateTrailStops,
  allPandals = [],
  language,
  userCoords,
  onSelectPandalPreview,
  onFocusMapOnTrail,
}) => {
  const trailStops = propTrailStops || propStops || [];

  const [travelMode, setTravelMode] = useState<TravelMode>('walking');
  const [isAddingStop, setIsAddingStop] = useState(false);
  const [searchPandalQuery, setSearchPandalQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [modalCopied, setModalCopied] = useState(false);

  const t = TRANSLATIONS[language];

  // Calculate metrics for current mode
  const metrics = calculateTrailMetrics(trailStops, travelMode);
  const suggestions: CorridorDetourSuggestion[] = detectPandalsOnWay(trailStops, allPandals);
  const googleMapsUrl = buildGoogleMapsMultiStopUrl(trailStops, travelMode);
  const itineraryText = buildWhatsAppItineraryText(trailStops, language, metrics, travelMode);
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(itineraryText)}`;

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Handlers for stop management
  const handleRemoveStop = (index: number) => {
    const updated = [...trailStops];
    updated.splice(index, 1);
    onUpdateTrailStops(updated);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const updated = [...trailStops];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    onUpdateTrailStops(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index >= trailStops.length - 1) return;
    const updated = [...trailStops];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    onUpdateTrailStops(updated);
  };

  const handleReverseTrail = () => {
    if (trailStops.length < 2) return;
    onUpdateTrailStops([...trailStops].reverse());
    showToast('Trail order reversed');
  };

  const handleSmartOptimize = () => {
    if (trailStops.length <= 2) {
      showToast('Add 3 or more stops to optimize');
      return;
    }
    const beforeDist = metrics.totalDistanceKm;
    const optimized = optimizeTrailOrder(trailStops);
    onUpdateTrailStops(optimized);
    const afterMetrics = calculateTrailMetrics(optimized, travelMode);
    const saved = beforeDist - afterMetrics.totalDistanceKm;
    if (saved > 0.05) {
      showToast(`✨ Optimized! Saved ~${saved.toFixed(1)} km walking`);
    } else {
      showToast('✨ Trail is already optimally ordered!');
    }
  };

  const handleClearAll = () => {
    onUpdateTrailStops([]);
    showToast('Trail cleared');
  };

  const handleAddUserLocationStart = () => {
    if (!userCoords) return;
    const currentLocStop: TrailStop = {
      id: 'user_location',
      name: {
        en: 'My Current Location',
        bn: 'আমার বর্তমান অবস্থান',
        hi: 'मेरा वर्तमान स्थान',
      },
      lat: userCoords.lat,
      lng: userCoords.lng,
    };
    if (trailStops.length === 0 || trailStops[0].id !== 'user_location') {
      onUpdateTrailStops([currentLocStop, ...trailStops]);
      showToast('Current location added as start');
    }
  };

  const handleAddPandalStop = (pandal: Pandal) => {
    if (trailStops.some((s) => s.id === pandal.id)) return;
    const newStop: TrailStop = {
      id: pandal.id,
      name: pandal.name,
      lat: pandal.lat,
      lng: pandal.lng,
      pandalId: pandal.id,
      nearestMetro: pandal.nearestMetro,
      crowdLevel: pandal.crowdLevel,
      zone: pandal.zone,
    };
    onUpdateTrailStops([...trailStops, newStop]);
    setIsAddingStop(false);
    setSearchPandalQuery('');
  };

  const handleInsertDetour = (suggestion: CorridorDetourSuggestion) => {
    const updated = [...trailStops];
    const newStop: TrailStop = {
      id: suggestion.pandal.id,
      name: suggestion.pandal.name,
      lat: suggestion.pandal.lat,
      lng: suggestion.pandal.lng,
      pandalId: suggestion.pandal.id,
      nearestMetro: suggestion.pandal.nearestMetro,
      crowdLevel: suggestion.pandal.crowdLevel,
      zone: suggestion.pandal.zone,
    };
    updated.splice(suggestion.insertIndex, 0, newStop);
    onUpdateTrailStops(updated);
    showToast(`Added ${suggestion.pandal.name[language] || suggestion.pandal.name.en} to trail`);
  };

  const handleInsertAllDetours = () => {
    if (suggestions.length === 0) return;
    const updated = batchInsertAllDetours(trailStops, suggestions);
    onUpdateTrailStops(updated);
    showToast(`Added ${suggestions.length} nearby detours`);
  };

  const handleLoadCuratedTrail = (preset: CuratedTrailPreset) => {
    const newStops: TrailStop[] = [];
    for (const pid of preset.pandalIds) {
      const cleanPid = pid.toLowerCase().replace(/^dk_/, '').replace(/[^a-z0-9]/g, '');
      const found = allPandals.find((p) => {
        if (p.id === pid || p.id === `dk_${pid}`) return true;
        const cleanId = p.id.toLowerCase().replace(/^dk_/, '').replace(/[^a-z0-9]/g, '');
        return cleanId === cleanPid || cleanId.includes(cleanPid) || cleanPid.includes(cleanId);
      });

      if (found) {
        newStops.push({
          id: found.id,
          name: found.name,
          lat: found.lat,
          lng: found.lng,
          pandalId: found.id,
          nearestMetro: found.nearestMetro,
          crowdLevel: found.crowdLevel,
          zone: found.zone,
        });
      }
    }
    if (newStops.length > 0) {
      onUpdateTrailStops(newStops);
      showToast(`✨ Loaded "${preset.title[language] || preset.title.en}" (${newStops.length} stops)`);
      if (onFocusMapOnTrail) onFocusMapOnTrail();
    }
  };

  const handleCopyItinerary = async () => {
    try {
      await navigator.clipboard.writeText(itineraryText);
      showToast(t.copiedWhatsapp || 'Itinerary copied to clipboard!');
    } catch {
      showToast(t.copiedWhatsapp || 'Itinerary copied to clipboard!');
    }
  };

  const handleCopyModalLink = async () => {
    try {
      await navigator.clipboard.writeText(googleMapsUrl);
      setModalCopied(true);
      setTimeout(() => setModalCopied(false), 2500);
    } catch {
      setModalCopied(true);
      setTimeout(() => setModalCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Durga Puja Kolkata GIS Trail',
          text: itineraryText,
          url: googleMapsUrl,
        });
      } catch {
        // Dismiss
      }
    } else {
      handleCopyItinerary();
    }
  };

  // Derive route title for sharing modal
  const firstStopName =
    trailStops.length > 0
      ? trailStops[0].id === 'user_location'
        ? t.startLocation || 'My Location'
        : trailStops[0].name[language] || trailStops[0].name.en
      : '';
  const lastStopName =
    trailStops.length > 1
      ? trailStops[trailStops.length - 1].name[language] || trailStops[trailStops.length - 1].name.en
      : '';
  const shareRouteSubtitle =
    trailStops.length > 1
      ? `${firstStopName} → ${lastStopName} Durga Puja Trail`
      : trailStops.length === 1
      ? `${firstStopName} Trail`
      : 'Durga Puja Kolkata Trail';

  // Last stop coords for proximity calculation in search
  const refCoords = trailStops.length > 0 
    ? { lat: trailStops[trailStops.length - 1].lat, lng: trailStops[trailStops.length - 1].lng }
    : userCoords;

  // Search filtered pandals for stop addition
  const unselectedPandals = allPandals
    .filter(
      (p) =>
        !trailStops.some((s) => s.id === p.id) &&
        (searchPandalQuery.trim() === '' ||
          p.name.en.toLowerCase().includes(searchPandalQuery.toLowerCase()) ||
          p.name.bn.toLowerCase().includes(searchPandalQuery.toLowerCase()) ||
          p.nearestMetro.toLowerCase().includes(searchPandalQuery.toLowerCase()) ||
          p.zone.toLowerCase().includes(searchPandalQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (!refCoords) return 0;
      const distA = calculateDistanceKm(refCoords.lat, refCoords.lng, a.lat, a.lng);
      const distB = calculateDistanceKm(refCoords.lat, refCoords.lng, b.lat, b.lng);
      return distA - distB;
    });

  return (
    <>
      <div
        id="trail-builder-backdrop"
        className="fixed inset-0 z-50 flex flex-col justify-end bg-black/65 backdrop-blur-xs transition-opacity duration-200"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          id="trail-builder-sheet"
          className="relative w-full max-w-lg mx-auto bg-[#0A0E18] border-t border-slate-750 rounded-t-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden animate-slide-up"
        >
          {/* Top Drag Handle */}
          <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto my-2.5 shrink-0" />

          {/* Sheet Header */}
          <div className="px-4 py-2.5 flex items-center justify-between border-b border-slate-800/80 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 rounded-xl bg-amber-400/15 text-amber-400 shrink-0">
                <Route className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-white tracking-tight">
                    {t.trailBuilderTitle || 'Pujo Trail Planner'}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-950">
                    {trailStops.length} {trailStops.length === 1 ? 'Stop' : 'Stops'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">
                  {trailStops.length === 0
                    ? 'Pick pandals to calculate optimal hopping sequence'
                    : `${metrics.totalDistanceKm.toFixed(1)} km · ~${formatDurationHoursMins(metrics.totalDurationMin)} total`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {trailStops.length > 0 && (
                <button
                  id="clear-trail-btn"
                  onClick={handleClearAll}
                  className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 text-xs font-semibold transition"
                  title={t.clearTrail}
                >
                  {t.clearTrail || 'Clear'}
                </button>
              )}
              <button
                id="close-trail-sheet-btn"
                onClick={onClose}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition active:scale-95"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3.5 overscroll-contain">
            {/* Top Metric & Transport Mode Deck */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 shadow-md">
              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                    Distance
                  </span>
                  <span className="text-sm font-extrabold text-white tabular-nums">
                    {metrics.totalDistanceKm.toFixed(1)} km
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                    Est. Duration
                  </span>
                  <span className="text-sm font-extrabold text-amber-400 tabular-nums">
                    ~{formatDurationHoursMins(metrics.totalDurationMin)}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                    Queue Buffer
                  </span>
                  <span className="text-sm font-extrabold text-emerald-400 tabular-nums">
                    ~{metrics.queueTimeMin} mins
                  </span>
                </div>
              </div>

              {/* Mode Switcher */}
              <div className="flex items-center p-1 rounded-xl bg-slate-950/90 border border-slate-800 gap-1">
                <button
                  onClick={() => setTravelMode('walking')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                    travelMode === 'walking'
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Footprints className="w-3.5 h-3.5" />
                  <span>Walk</span>
                </button>
                <button
                  onClick={() => setTravelMode('cycling')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                    travelMode === 'cycling'
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Bike className="w-3.5 h-3.5" />
                  <span>Cycle</span>
                </button>
                <button
                  onClick={() => setTravelMode('transit')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                    travelMode === 'transit'
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Train className="w-3.5 h-3.5" />
                  <span>Metro</span>
                </button>
                <button
                  onClick={() => setTravelMode('driving')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                    travelMode === 'driving'
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>Taxi</span>
                </button>
              </div>
            </div>

            {/* Quick Action Toolbar */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
              {/* Smart TSP Optimization Button */}
              {trailStops.length >= 3 && (
                <button
                  id="smart-optimize-btn"
                  onClick={handleSmartOptimize}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs shadow-md shadow-amber-950/40 active:scale-95 transition shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{t.optimizeRoute || 'Smart Optimize Order'}</span>
                </button>
              )}

              {/* Reverse Order */}
              {trailStops.length >= 2 && (
                <button
                  onClick={handleReverseTrail}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-750 text-slate-200 hover:text-white font-semibold text-xs active:scale-95 transition shrink-0"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <span>{t.reverseRoute || 'Reverse'}</span>
                </button>
              )}

              {/* Start from GPS */}
              {userCoords && (!trailStops.length || trailStops[0].id !== 'user_location') && (
                <button
                  onClick={handleAddUserLocationStart}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-300 hover:bg-blue-600/30 font-semibold text-xs active:scale-95 transition shrink-0"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>{t.useCurrentLocationStart || '+ Start from My GPS'}</span>
                </button>
              )}

              {/* Add Stop Button */}
              <button
                id="open-add-stop-search-btn"
                onClick={() => setIsAddingStop(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-750 hover:border-amber-400 text-amber-400 font-bold text-xs active:scale-95 transition shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.addStopBtn || '+ Add Pandal'}</span>
              </button>
            </div>

            {/* Empty Trail Callout */}
            {trailStops.length === 0 && (
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center space-y-3 my-2">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-2xl mx-auto shadow-inner">
                  🚶
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Your Trail is Empty</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Select a curated Kolkata circuit below or search pandals to generate your customized walking route.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddingStop(true)}
                  className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md active:scale-95 transition"
                >
                  {t.addStopBtn || '+ Add First Pandal'}
                </button>
              </div>
            )}

            {/* Interactive Connected Visual Timeline */}
            {trailStops.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1 text-[11px] font-semibold text-slate-400">
                  <span>Itinerary Stops ({trailStops.length})</span>
                  <span>Drag or use arrows to reorder</span>
                </div>

                <div className="relative pl-3 space-y-2">
                  {/* Vertical Glowing Connector Line */}
                  <div className="absolute left-[23px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-amber-400 via-rose-500 to-blue-500 opacity-40 rounded-full" />

                  {trailStops.map((stop, index) => {
                    const isUserLoc = stop.id === 'user_location';
                    const isFirst = index === 0;
                    const isLast = index === trailStops.length - 1;
                    const legDist = index > 0 ? metrics.legDistancesKm[index - 1] : 0;
                    const legTime = index > 0 ? metrics.legTimesMin[index - 1] : 0;

                    return (
                      <React.Fragment key={`${stop.id}-${index}`}>
                        {/* Leg Transit Badge Between Consecutive Stops */}
                        {index > 0 && (
                          <div className="flex items-center gap-2 py-0.5 pl-6">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1 shadow-xs">
                              <Footprints className="w-3 h-3 text-amber-400" />
                              <span>{formatDistance(legDist)}</span>
                              <span>·</span>
                              <span>~{legTime} min walk</span>
                            </span>
                          </div>
                        )}

                        {/* Stop Card */}
                        <div
                          className={`relative flex items-center justify-between p-3 rounded-2xl border transition-all ${
                            isFirst
                              ? 'bg-slate-900/95 border-amber-500/50 shadow-md shadow-amber-950/20'
                              : isLast
                              ? 'bg-slate-900/95 border-blue-500/50 shadow-md shadow-blue-950/20'
                              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {/* Node Icon */}
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div
                              className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-md ${
                                isFirst
                                  ? 'bg-amber-400 text-slate-950 font-black ring-2 ring-amber-400/40'
                                  : isLast
                                  ? 'bg-blue-600 text-white font-black ring-2 ring-blue-500/40'
                                  : 'bg-slate-800 text-slate-200 border border-slate-700'
                              }`}
                            >
                              {isUserLoc ? <Compass className="w-4 h-4" /> : index + 1}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="text-xs font-bold text-white truncate">
                                  {stop.name[language] || stop.name.en}
                                </p>
                                {isFirst && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-400/20 text-amber-300">
                                    Start
                                  </span>
                                )}
                                {isLast && trailStops.length > 1 && (
                                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-500/20 text-blue-300">
                                    Destination
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 truncate">
                                {stop.nearestMetro && (
                                  <span className="flex items-center gap-1 text-blue-300">
                                    <Train className="w-3 h-3" />
                                    <span>{stop.nearestMetro}</span>
                                  </span>
                                )}
                                {stop.crowdLevel && (
                                  <CrowdStatusBadge crowdLevel={stop.crowdLevel} language={language} size="sm" />
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Reordering & Delete Controls */}
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <button
                              onClick={() => handleMoveUp(index)}
                              disabled={isFirst}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-20 hover:bg-slate-800 transition active:scale-95"
                              title="Move Stop Up"
                              aria-label="Move Up"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleMoveDown(index)}
                              disabled={isLast}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-20 hover:bg-slate-800 transition active:scale-95"
                              title="Move Stop Down"
                              aria-label="Move Down"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveStop(index)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition active:scale-95 ml-0.5"
                              title="Remove Stop"
                              aria-label="Remove"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>
            )}

            {/* En-Route Corridor Detour Suggestions */}
            {suggestions.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span>{t.pandalsOnWayTitle || 'Pandals on Your Way'} ({suggestions.length})</span>
                  </div>
                  <button
                    onClick={handleInsertAllDetours}
                    className="px-2 py-1 rounded-lg bg-amber-400 text-slate-950 font-bold text-[10px] active:scale-95 transition"
                  >
                    + Add All
                  </button>
                </div>

                <div className="space-y-1.5">
                  {suggestions.slice(0, 3).map((sugg) => (
                    <div
                      key={sugg.pandal.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-900/90 border border-slate-800 gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white truncate">
                          {sugg.pandal.name[language] || sugg.pandal.name.en}
                        </p>
                        <p className="text-[10px] text-amber-300/90 truncate">
                          +{formatDistance(sugg.extraDetourKm)} detour between stops {sugg.insertIndex} & {sugg.insertIndex + 1}
                        </p>
                      </div>
                      <button
                        onClick={() => handleInsertDetour(sugg)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-slate-200 font-bold text-xs transition active:scale-95 shrink-0"
                      >
                        + Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Curated Preset Trails Carousel */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.curatedTrailsTitle || 'Popular Curated Circuits'}</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {CURATED_TRAILS.map((preset) => (
                  <div
                    key={preset.id}
                    className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-bold text-amber-300 truncate">
                          {preset.title[language] || preset.title.en}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-400/20 text-amber-300 shrink-0">
                          {preset.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight mb-2.5">
                        {preset.subtitle[language] || preset.subtitle.en}
                      </p>
                    </div>
                    <button
                      onClick={() => handleLoadCuratedTrail(preset)}
                      className="w-full py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-slate-200 text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t.loadTrail || 'Load Circuit'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky Bottom Actions Bar */}
          <div className="p-3.5 pb-[calc(0.75rem+var(--safe-bottom))] bg-[#070A12] border-t border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              {/* Google Maps Turn-by-Turn Multi-Stop Export */}
              <a
                id="export-google-maps-btn"
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-2xl font-bold text-xs transition active:scale-98 shadow-lg ${
                  trailStops.length > 0
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50'
                    : 'bg-slate-800 text-slate-500 pointer-events-none'
                }`}
              >
                <Navigation className="w-4 h-4" />
                <span className="truncate">{t.openInGoogleMaps || 'Start Turn-by-Turn Navigation'}</span>
              </a>

              {/* Share Route Dialog Trigger */}
              <button
                id="open-share-modal-btn"
                onClick={() => setIsShareModalOpen(true)}
                disabled={trailStops.length === 0}
                className="py-3 px-4 rounded-2xl bg-amber-400 hover:bg-amber-300 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-extrabold text-xs transition active:scale-98 shadow-lg flex items-center gap-1.5 shrink-0"
                title={t.shareRouteTitle}
              >
                <Share2 className="w-4 h-4 text-slate-950" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Stop Search Popover / Sheet */}
      {isAddingStop && (
        <div
          id="add-stop-modal"
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAddingStop(false);
          }}
        >
          <div className="w-full max-w-md rounded-3xl bg-[#0F1422] border border-slate-750 p-4 shadow-2xl flex flex-col max-h-[80vh] overflow-hidden animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-amber-400" />
                <span>Add Pandal to Trail</span>
              </h3>
              <button
                onClick={() => setIsAddingStop(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="mt-3">
              <input
                type="text"
                value={searchPandalQuery}
                onChange={(e) => setSearchPandalQuery(e.target.value)}
                placeholder="Search pandal name, metro, zone..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-750 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:border-amber-400"
                autoFocus
              />
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto mt-3 space-y-1.5 max-h-72 pr-1">
              {unselectedPandals.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  No matching pandals found
                </div>
              ) : (
                unselectedPandals.slice(0, 20).map((pandal) => {
                  const dist = refCoords ? calculateDistanceKm(refCoords.lat, refCoords.lng, pandal.lat, pandal.lng) : null;
                  return (
                    <button
                      key={pandal.id}
                      onClick={() => handleAddPandalStop(pandal)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800/80 text-left transition active:scale-98 group"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="text-xs font-bold text-white truncate group-hover:text-amber-300">
                          {pandal.name[language] || pandal.name.en}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">
                          {pandal.zone} Kolkata · Near {pandal.nearestMetro}
                          {dist !== null && ` · ${formatDistance(dist)} away`}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs shrink-0 shadow-xs">
                        + Add
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Share Itinerary Dialog */}
      {isShareModalOpen && (
        <div
          id="share-pujo-route-modal"
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsShareModalOpen(false);
          }}
        >
          <div className="w-full max-w-sm rounded-3xl bg-[#0F1422] border border-amber-500/40 p-5 shadow-2xl flex flex-col items-center text-center animate-scale-up">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30 mb-3">
              <Share2 className="w-6 h-6 stroke-[2.5]" />
            </div>

            <h3 className="text-base font-bold text-white tracking-tight">
              {t.shareRouteTitle || 'Share Your Pujo Route'}
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-[260px] line-clamp-2">
              {shareRouteSubtitle}
            </p>

            {/* Multi-Stop Google Maps Link Bar */}
            <div className="mt-4 w-full flex items-center p-1.5 pl-3 rounded-xl bg-slate-950 border border-slate-750 text-xs">
              <input
                type="text"
                readOnly
                value={googleMapsUrl}
                className="flex-1 bg-transparent text-slate-300 text-[11px] truncate focus:outline-hidden"
              />
              <button
                onClick={handleCopyModalLink}
                className={`ml-2 px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0 ${
                  modalCopied
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                }`}
              >
                {modalCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{t.copiedRouteLink || 'Copied'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{t.copyRouteLink || 'Copy'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="mt-4 w-full space-y-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs transition shadow-md active:scale-98"
              >
                <Share2 className="w-4 h-4" />
                <span>Share via WhatsApp</span>
              </a>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition shadow-md active:scale-98"
              >
                <Navigation className="w-4 h-4" />
                <span>Open in Google Maps</span>
              </a>
              <button
                onClick={handleNativeShare}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-semibold text-xs transition active:scale-98"
              >
                {t.moreShareOptions || 'Copy Text Itinerary'}
              </button>
            </div>

            <button
              onClick={() => setIsShareModalOpen(false)}
              className="mt-4 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Floating Animated Toast */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-70 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  );
};
