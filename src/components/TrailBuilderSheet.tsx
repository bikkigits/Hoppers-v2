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
  batchInsertAllDetours,
  buildGoogleMapsMultiStopUrl,
  buildWhatsAppItineraryText,
  formatDurationHoursMins,
  CURATED_TRAILS,
} from '../utils/trailRouting';
import { formatDistance } from '../utils/geo';
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
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  trailStops: TrailStop[];
  onUpdateTrailStops: (stops: TrailStop[]) => void;
  allPandals: Pandal[];
  language: Language;
  userCoords: { lat: number; lng: number } | null;
  onSelectPandalPreview: (pandal: Pandal) => void;
  onFocusMapOnTrail?: () => void;
}

export const TrailBuilderSheet: React.FC<Props> = ({
  isOpen,
  onClose,
  trailStops,
  onUpdateTrailStops,
  allPandals,
  language,
  userCoords,
  onSelectPandalPreview,
  onFocusMapOnTrail,
}) => {
  const [travelMode, setTravelMode] = useState<TravelMode>('walking');
  const [isAddingStop, setIsAddingStop] = useState(false);
  const [searchPandalQuery, setSearchPandalQuery] = useState('');
  const [copiedToast, setCopiedToast] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [modalCopied, setModalCopied] = useState(false);

  const t = TRANSLATIONS[language];

  // Calculate metrics for current mode and comparison across all modes
  const metrics = calculateTrailMetrics(trailStops, travelMode);
  const walkMetrics = calculateTrailMetrics(trailStops, 'walking');
  const driveMetrics = calculateTrailMetrics(trailStops, 'driving');
  const cycleMetrics = calculateTrailMetrics(trailStops, 'cycling');
  const transitMetrics = calculateTrailMetrics(trailStops, 'transit');

  const suggestions: CorridorDetourSuggestion[] = detectPandalsOnWay(trailStops, allPandals);
  const googleMapsUrl = buildGoogleMapsMultiStopUrl(trailStops, travelMode);
  const itineraryText = buildWhatsAppItineraryText(trailStops, language, metrics, travelMode);
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(itineraryText)}`;

  if (!isOpen) return null;

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
    onUpdateTrailStops([...trailStops].reverse());
  };

  const handleClearAll = () => {
    onUpdateTrailStops([]);
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
  };

  const handleInsertAllDetours = () => {
    if (suggestions.length === 0) return;
    const updated = batchInsertAllDetours(trailStops, suggestions);
    onUpdateTrailStops(updated);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 2000);
  };

  const handleLoadCuratedTrail = (preset: CuratedTrailPreset) => {
    const newStops: TrailStop[] = [];
    for (const pid of preset.pandalIds) {
      const found = allPandals.find((p) => p.id === pid);
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
      if (onFocusMapOnTrail) onFocusMapOnTrail();
    }
  };

  const handleCopyItinerary = async () => {
    try {
      await navigator.clipboard.writeText(itineraryText);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    } catch {
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
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
        // User cancelled or unsupported
      }
    } else {
      handleCopyItinerary();
    }
  };

  // Derive route title for sharing modal
  const firstStopName =
    trailStops.length > 0
      ? trailStops[0].id === 'user_location'
        ? t.startLocation
        : trailStops[0].name[language] || trailStops[0].name.en
      : '';
  const lastStopName =
    trailStops.length > 1
      ? trailStops[trailStops.length - 1].name[language] || trailStops[trailStops.length - 1].name.en
      : '';
  const shareRouteSubtitle =
    trailStops.length > 1
      ? `${firstStopName} to ${lastStopName} Durga Puja Trail`
      : trailStops.length === 1
      ? `${firstStopName} Trail`
      : 'Durga Puja Kolkata Trail';

  // Search filtered pandals for stop addition
  const unselectedPandals = allPandals.filter(
    (p) =>
      !trailStops.some((s) => s.id === p.id) &&
      (searchPandalQuery.trim() === '' ||
        p.name.en.toLowerCase().includes(searchPandalQuery.toLowerCase()) ||
        p.name.bn.toLowerCase().includes(searchPandalQuery.toLowerCase()) ||
        p.nearestMetro.toLowerCase().includes(searchPandalQuery.toLowerCase()) ||
        p.zone.toLowerCase().includes(searchPandalQuery.toLowerCase()))
  );

  return (
    <>
      <div
        id="trail-builder-backdrop"
        className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs transition-opacity duration-200"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          id="trail-builder-sheet"
          className="w-full max-w-xl mx-auto bg-[#090D16] border-t border-amber-500/30 rounded-t-3xl shadow-2xl flex flex-col max-h-[88vh] overflow-hidden animate-slide-up"
        >
          {/* Sheet Handle */}
          <div className="pt-2.5 pb-1 flex justify-center shrink-0">
            <div className="w-12 h-1.5 rounded-full bg-slate-700/80" />
          </div>

          {/* Header */}
          <div className="px-4 py-2 border-b border-slate-800/80 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20">
                  <Route className="w-4 h-4 text-slate-950" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-white tracking-tight">
                      {t.trailBuilderTitle}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold border border-amber-400/30">
                      {trailStops.length} {t.stopsCount}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    {t.trailBuilderSubtitle}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {trailStops.length > 0 && (
                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="p-1.5 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-slate-800/80 border border-amber-400/30 transition flex items-center gap-1"
                    title={t.shareRouteTitle}
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="text-xs font-semibold hidden sm:inline">Share</span>
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                  title={t.closeSheet}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Travel Mode Comparison Matrix (Matching Reference Video) */}
            <div className="mt-3">
              <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-900/90 rounded-2xl border border-slate-800">
                {/* Walk */}
                <button
                  type="button"
                  onClick={() => setTravelMode('walking')}
                  className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition ${
                    travelMode === 'walking'
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Footprints className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-semibold">{t.travelModeWalk}</span>
                  </div>
                  <span
                    className={`text-[10px] mt-0.5 ${
                      travelMode === 'walking' ? 'text-slate-900 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {trailStops.length > 1
                      ? formatDurationHoursMins(walkMetrics.travelTimeMin)
                      : '—'}
                  </span>
                </button>

                {/* Drive */}
                <button
                  type="button"
                  onClick={() => setTravelMode('driving')}
                  className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition ${
                    travelMode === 'driving'
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Car className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-semibold">{t.travelModeDrive}</span>
                  </div>
                  <span
                    className={`text-[10px] mt-0.5 ${
                      travelMode === 'driving' ? 'text-slate-900 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {trailStops.length > 1
                      ? formatDurationHoursMins(driveMetrics.travelTimeMin)
                      : '—'}
                  </span>
                </button>

                {/* Cycle */}
                <button
                  type="button"
                  onClick={() => setTravelMode('cycling')}
                  className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition ${
                    travelMode === 'cycling'
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Bike className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-semibold">{t.travelModeCycle}</span>
                  </div>
                  <span
                    className={`text-[10px] mt-0.5 ${
                      travelMode === 'cycling' ? 'text-slate-900 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {trailStops.length > 1
                      ? formatDurationHoursMins(cycleMetrics.travelTimeMin)
                      : '—'}
                  </span>
                </button>

                {/* Transit */}
                <button
                  type="button"
                  onClick={() => setTravelMode('transit')}
                  className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition ${
                    travelMode === 'transit'
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <Train className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-semibold">{t.travelModeTransit}</span>
                  </div>
                  <span
                    className={`text-[10px] mt-0.5 ${
                      travelMode === 'transit' ? 'text-slate-900 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {trailStops.length > 1
                      ? formatDurationHoursMins(transitMetrics.travelTimeMin)
                      : '—'}
                  </span>
                </button>
              </div>

              {/* Trail Controls Row */}
              {trailStops.length > 0 && (
                <div className="mt-2 flex items-center justify-between text-xs px-1">
                  <span className="text-[11px] text-slate-400">
                    {trailStops.length} stops sequenced
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleReverseTrail}
                      className="px-2 py-1 rounded-lg bg-slate-800/90 text-slate-300 hover:text-white border border-slate-700/80 transition flex items-center gap-1 text-[11px]"
                      title={t.reverseTrail}
                    >
                      <ArrowUpDown className="w-3 h-3 text-amber-400" />
                      <span>{t.reverseTrail}</span>
                    </button>
                    <button
                      onClick={handleClearAll}
                      className="px-2 py-1 rounded-lg bg-slate-800/90 text-slate-400 hover:text-rose-400 border border-slate-700/80 transition flex items-center gap-1 text-[11px]"
                      title={t.clearTrail}
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>{t.clearTrail}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
            {/* Live Metrics Summary Bar */}
            {trailStops.length > 1 && (
              <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-800/80 to-slate-900/90 border border-amber-500/30">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {t.totalTrailDistance}
                    </p>
                    <p className="text-base font-extrabold text-amber-400">
                      {metrics.totalDistanceKm > 0
                        ? `${metrics.totalDistanceKm.toFixed(1)} km`
                        : '0 km'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {t.estHoppingDuration}
                    </p>
                    <p className="text-base font-extrabold text-white">
                      ~{formatDurationHoursMins(metrics.totalDurationMin)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {t.inclQueuing}
                    </p>
                    <p className="text-xs font-semibold text-emerald-400 mt-0.5">
                      +{metrics.queueTimeMin}m queues
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* "Pandals on the Way" Corridor Detour Banner with "+ Add All (N)" */}
            {suggestions.length > 0 && (
              <div className="p-3 rounded-2xl bg-gradient-to-b from-amber-950/40 to-slate-900 border border-amber-500/40 space-y-2.5 shadow-lg">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                    <div>
                      <h3 className="text-xs font-bold text-amber-300">
                        {t.pandalsOnWayTitle} ({suggestions.length})
                      </h3>
                      <p className="text-[10px] text-amber-200/80">
                        Along your corridor (≤800m detour)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleInsertAllDetours}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-extrabold shadow-md active:scale-95 transition shrink-0 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[3]" />
                    <span>
                      {t.addAllDetours} ({suggestions.length})
                    </span>
                  </button>
                </div>

                <div className="space-y-1.5">
                  {suggestions.slice(0, 4).map((sug) => {
                    const p = sug.pandal;
                    return (
                      <div
                        key={p.id}
                        className="p-2.5 rounded-xl bg-slate-900/90 border border-amber-500/25 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white truncate">
                              {p.name[language] || p.name.en}
                            </span>
                            {p.isFeatured && (
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                                Featured
                              </span>
                            )}
                            <span
                              className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                p.crowdLevel === 'Extreme'
                                  ? 'bg-rose-500/20 text-rose-300'
                                  : p.crowdLevel === 'Heavy'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-emerald-500/20 text-emerald-300'
                              }`}
                            >
                              {p.crowdLevel}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 truncate">
                            Near <span className="text-slate-300 font-medium">{sug.betweenStopA}</span> • +
                            {formatDistance(sug.extraDetourKm)} detour
                          </p>
                        </div>

                        <button
                          onClick={() => handleInsertDetour(sug)}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400 hover:text-slate-950 text-amber-300 border border-amber-400/40 font-bold text-xs flex items-center gap-1 shrink-0 active:scale-95 transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{t.insertInTrail}</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Stops List */}
            {trailStops.length === 0 ? (
              <div className="text-center py-10 px-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 shadow-inner space-y-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-400 flex items-center justify-center mx-auto shadow-md shadow-amber-500/10">
                  <Compass className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white tracking-tight">
                    No stops added yet
                  </h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                    {t.emptyTrailPrompt}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <button
                    onClick={() => setIsAddingStop(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 active:scale-95 transition"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Add First Stop</span>
                  </button>
                  {userCoords && (
                    <button
                      onClick={handleAddUserLocationStart}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/30 text-xs font-semibold shadow-xs active:scale-95 transition"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{t.startLocation}</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                {trailStops.map((stop, idx) => {
                  const isUserLoc = stop.id === 'user_location';
                  const legDist = idx > 0 ? metrics.legDistancesKm[idx - 1] : null;
                  const legTime = idx > 0 ? metrics.legTimesMin[idx - 1] : null;

                  return (
                    <React.Fragment key={`${stop.id}-${idx}`}>
                      {/* Inter-stop leg connector */}
                      {idx > 0 && (
                        <div className="flex items-center gap-2 pl-4 py-0.5 text-[10px] text-slate-400 font-medium">
                          <div className="w-0.5 h-4 bg-amber-400/40 ml-1.5 rounded-full" />
                          <span className="text-amber-400/90">
                            {travelMode === 'walking'
                              ? '🚶'
                              : travelMode === 'cycling'
                              ? '🚲'
                              : travelMode === 'transit'
                              ? '🚇'
                              : '🚗'}{' '}
                            {formatDistance(legDist || 0)} (~{legTime}m)
                          </span>
                        </div>
                      )}

                      {/* Stop Card */}
                      <div className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800 flex items-center justify-between gap-2 transition shadow-xs">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Number Badge */}
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                              isUserLoc
                                ? 'bg-blue-500 text-white'
                                : idx === 0
                                ? 'bg-emerald-500 text-slate-950'
                                : idx === trailStops.length - 1
                                ? 'bg-rose-500 text-white'
                                : 'bg-amber-400 text-slate-950'
                            }`}
                          >
                            {isUserLoc ? <MapPin className="w-3.5 h-3.5" /> : idx + 1}
                          </div>

                          <div className="min-w-0">
                            <p className="text-xs font-bold text-white truncate">
                              {stop.name[language] || stop.name.en}
                            </p>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 truncate">
                              {stop.nearestMetro && (
                                <span className="text-blue-300">🚇 {stop.nearestMetro}</span>
                              )}
                              {stop.crowdLevel && (
                                <span className="text-amber-300 font-medium">
                                  • {stop.crowdLevel} (
                                  ~{stop.crowdLevel === 'Extreme' ? '60' : stop.crowdLevel === 'Heavy' ? '35' : '15'}
                                  m queue)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Reorder and Delete actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleMoveUp(idx)}
                            disabled={idx === 0}
                            className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
                            title={t.reorderUp}
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleMoveDown(idx)}
                            disabled={idx === trailStops.length - 1}
                            className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30 disabled:hover:text-slate-400"
                            title={t.reorderDown}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveStop(idx)}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 transition"
                            title={t.removeFromTrail}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            )}

            {/* Add Stop Drawer Toggle & Selector */}
            {!isAddingStop ? (
              <div className="flex items-center gap-2">
                <button
                  id="add-stop-btn"
                  onClick={() => setIsAddingStop(true)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-dashed border-amber-400/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-98"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add a stop...</span>
                </button>
                {userCoords && !trailStops.some((s) => s.id === 'user_location') && (
                  <button
                    onClick={handleAddUserLocationStart}
                    className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-blue-400 border border-slate-800 text-xs font-semibold flex items-center gap-1.5 shrink-0"
                    title={t.startLocation}
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">GPS Start</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-slate-900 border border-amber-500/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Select Pandal to Add</span>
                  <button
                    onClick={() => setIsAddingStop(false)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                <input
                  type="text"
                  value={searchPandalQuery}
                  onChange={(e) => setSearchPandalQuery(e.target.value)}
                  placeholder="Filter pandals by name, zone, or metro..."
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-amber-400"
                  autoFocus
                />

                <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                  {unselectedPandals.length === 0 ? (
                    <p className="text-xs text-slate-500 py-3 text-center">
                      No matching pandals available
                    </p>
                  ) : (
                    unselectedPandals.map((pandal) => (
                      <div
                        key={pandal.id}
                        className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 flex items-center justify-between gap-2 border border-slate-850"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate">
                            {pandal.name[language] || pandal.name.en}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {pandal.zone} • 🚇 {pandal.nearestMetro}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => onSelectPandalPreview(pandal)}
                            className="px-2 py-1 rounded bg-slate-800 text-[10px] text-slate-300 hover:text-white"
                          >
                            Preview
                          </button>
                          <button
                            onClick={() => handleAddPandalStop(pandal)}
                            className="px-2.5 py-1 rounded bg-amber-400 text-[10px] text-slate-950 font-bold hover:bg-amber-300"
                          >
                            + Add
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Curated Pre-made Trails Carousel */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.curatedTrailsTitle}</span>
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {CURATED_TRAILS.map((preset) => (
                  <div
                    key={preset.id}
                    className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-bold text-amber-300 truncate">
                          {preset.title[language] || preset.title.en}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[8px] font-bold bg-amber-400/20 text-amber-300 shrink-0">
                          {preset.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight mb-2">
                        {preset.subtitle[language] || preset.subtitle.en}
                      </p>
                    </div>
                    <button
                      onClick={() => handleLoadCuratedTrail(preset)}
                      className="w-full py-1.5 px-2 rounded-lg bg-slate-800 hover:bg-amber-400 hover:text-slate-950 text-slate-200 text-[11px] font-bold transition flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>{t.loadTrail}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky Bottom Actions Bar */}
          <div className="p-3 bg-[#080C14] border-t border-slate-800/90 shrink-0">
            <div className="flex items-center gap-2">
              {/* Google Maps Turn-by-Turn Export Button */}
              <a
                id="export-google-maps-btn"
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 rounded-2xl font-bold text-xs transition active:scale-98 shadow-md ${
                  trailStops.length > 0
                    ? 'bg-rose-700 hover:bg-rose-600 text-white shadow-rose-900/30'
                    : 'bg-slate-800 text-slate-500 pointer-events-none'
                }`}
              >
                <Navigation className="w-4 h-4" />
                <span className="truncate">Open in Google Maps Turn-by-Turn</span>
              </a>

              {/* Share Route Dialog Trigger */}
              <button
                id="open-share-modal-btn"
                onClick={() => setIsShareModalOpen(true)}
                disabled={trailStops.length === 0}
                className="py-3 px-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold text-xs transition active:scale-98 shadow-md flex items-center gap-1.5 shrink-0"
                title={t.shareRouteTitle}
              >
                <Share2 className="w-4 h-4 text-slate-950" />
                <span className="hidden sm:inline">Share</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* "Share Your Pujo Route" Modal (Replicating 00:00 in Reference Video) */}
      {isShareModalOpen && (
        <div
          id="share-pujo-route-modal"
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsShareModalOpen(false);
          }}
        >
          <div className="w-full max-w-sm rounded-3xl bg-[#0F1420] border border-amber-500/40 p-5 shadow-2xl flex flex-col items-center text-center animate-scale-up">
            {/* Glowing circular icon */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30 mb-3">
              <Share2 className="w-6 h-6 stroke-[2.5]" />
            </div>

            {/* Title & Subtitle */}
            <h3 className="text-lg font-bold text-white tracking-tight">
              {t.shareRouteTitle}
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-[260px] line-clamp-2">
              {shareRouteSubtitle}
            </p>

            {/* Copyable Route Link Bar */}
            <div className="mt-4 w-full flex items-center p-1.5 pl-3 rounded-xl bg-slate-950 border border-slate-700/80 text-xs">
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
                    <span>{t.copiedRouteLink}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{t.copyRouteLink}</span>
                  </>
                )}
              </button>
            </div>

            {/* Actions Grid */}
            <div className="mt-4 w-full space-y-2">
              {/* WhatsApp Share Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs transition shadow-md active:scale-98"
              >
                <Share2 className="w-4 h-4" />
                <span>WhatsApp Share</span>
              </a>

              {/* Open in Google Maps Button */}
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-700 hover:bg-rose-600 text-white font-bold text-xs transition shadow-md active:scale-98"
              >
                <Navigation className="w-4 h-4" />
                <span>Open in Google Maps</span>
              </a>

              {/* Native Device Share / Copy Itinerary */}
              <button
                onClick={handleNativeShare}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-semibold text-xs transition active:scale-98"
              >
                {t.moreShareOptions}
              </button>
            </div>

            {/* Done Dismiss */}
            <button
              onClick={() => setIsShareModalOpen(false)}
              className="mt-4 text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Floating Copied Toast */}
      {copiedToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-60 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{t.copiedWhatsapp}</span>
        </div>
      )}
    </>
  );
};
