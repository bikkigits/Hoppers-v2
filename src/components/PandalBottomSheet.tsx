import React, { useState, useEffect } from 'react';
import {
  Pandal,
  FacilityPoint,
  MetroStation,
  Language,
  VisitedPandal,
  TrailStop,
  SelectedMapItem,
} from '../types';
import { PANDALS_DATA } from '../data/mockData';
import { TRANSLATIONS } from '../data/translations';
import { formatDistance, estimateWalkingMinutes } from '../utils/geo';
import confetti from 'canvas-confetti';
import {
  X,
  Navigation,
  CheckCircle2,
  MapPin,
  Train,
  Sparkles,
  Award,
  PhoneCall,
  Info,
  Share2,
  Route,
  ArrowRight,
  Footprints,
  Compass,
} from 'lucide-react';
import {
  getPandalCrowdSummary,
  submitCrowdReport,
  CrowdIntensity,
  PandalCrowdSummary,
} from '../utils/crowdReports';

interface Props {
  selectedItem: SelectedMapItem | null;
  onClose: () => void;
  userCoords: { lat: number; lng: number } | null;
  language: Language;
  visitedList: VisitedPandal[];
  onToggleVisited: (pandalId: string) => void;
  onPlanRoute?: (pandal: Pandal) => void;
  onSelectPandal?: (pandal: Pandal) => void;
  trailStops?: TrailStop[];
  onToggleTrailStop?: (pandal: Pandal) => void;
}

export const PandalBottomSheet: React.FC<Props> = ({
  selectedItem,
  onClose,
  userCoords,
  language,
  visitedList,
  onToggleVisited,
  onPlanRoute,
  onSelectPandal,
  trailStops,
  onToggleTrailStop,
}) => {
  const t = TRANSLATIONS[language];
  const isPandal = selectedItem ? 'theme' in selectedItem : false;
  const isStation = selectedItem ? 'exitGates' in selectedItem && 'lines' in selectedItem : false;
  const isFacility = selectedItem ? !isPandal && !isStation : false;

  const pandal = isPandal && selectedItem ? (selectedItem as Pandal) : null;
  const station = isStation && selectedItem ? (selectedItem as MetroStation) : null;
  const facility = isFacility && selectedItem ? (selectedItem as FacilityPoint) : null;

  const isVisited = pandal
    ? visitedList.some((v) => v.pandalId === pandal.id)
    : false;
  const visitInfo = pandal
    ? visitedList.find((v) => v.pandalId === pandal.id)
    : null;

  // Live Crowdsourced Crowd Summary State for Pandals
  const [crowdSummary, setCrowdSummary] = useState<PandalCrowdSummary | null>(() =>
    pandal ? getPandalCrowdSummary(pandal.id, pandal.crowdLevel) : null
  );
  const [, setReportingStatus] = useState<string | null>(null);
  const [, setIsSubmittingCrowd] = useState(false);

  useEffect(() => {
    if (!pandal) return;
    setCrowdSummary(getPandalCrowdSummary(pandal.id, pandal.crowdLevel));

    const onCrowdUpdated = (e: Event) => {
      const customEv = e as CustomEvent<{ pandalId: string }>;
      if (!customEv.detail || customEv.detail.pandalId === pandal.id) {
        setCrowdSummary(getPandalCrowdSummary(pandal.id, pandal.crowdLevel));
      }
    };

    window.addEventListener('hoppers_crowd_updated', onCrowdUpdated);
    return () => {
      window.removeEventListener('hoppers_crowd_updated', onCrowdUpdated);
    };
  }, [pandal?.id, pandal?.crowdLevel]);

  // Find Feeder Pandals for Metro Station
  const feederPandals = React.useMemo(() => {
    if (!station) return [];
    const stationNameEn = station.name.en.toLowerCase();
    return PANDALS_DATA.filter((p) => {
      if (station.connectingPandals && station.connectingPandals.includes(p.id)) {
        return true;
      }
      const pMetroEn = p.nearestMetroEn.toLowerCase();
      const pMetro = p.nearestMetro.toLowerCase();
      return (
        pMetroEn.includes(stationNameEn) ||
        stationNameEn.includes(pMetroEn) ||
        pMetro.includes(stationNameEn)
      );
    });
  }, [station]);

  // Early return only after all hooks are unconditionally initialized
  if (!selectedItem) return null;

  const handleVoteCrowd = (intensity: CrowdIntensity) => {
    if (!pandal) return;
    setIsSubmittingCrowd(true);
    const result = submitCrowdReport(
      pandal.id,
      intensity,
      userCoords,
      { lat: pandal.lat, lng: pandal.lng }
    );
    setReportingStatus(result.message);
    setCrowdSummary(getPandalCrowdSummary(pandal.id, pandal.crowdLevel));
    setIsSubmittingCrowd(false);
    setTimeout(() => {
      setReportingStatus(null);
    }, 6000);
  };

  // Distance calculation if user coords available
  let distanceStr: string | null = null;
  let walkMin: number | null = null;
  if (userCoords) {
    const dKm =
      Math.hypot(
        (selectedItem.lat - userCoords.lat) * 111,
        (selectedItem.lng - userCoords.lng) * 111 * Math.cos((selectedItem.lat * Math.PI) / 180)
      );
    distanceStr = formatDistance(dKm);
    walkMin = estimateWalkingMinutes(dKm);
  }

  const handleMarkVisited = () => {
    if (!pandal) return;

    if (!isVisited) {
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.7 },
          colors: ['#FFB300', '#E53935', '#FFD54F', '#4CAF50', '#FFFFFF'],
          disableForReducedMotion: true,
        });
      } catch (e) {
        console.log('Confetti triggered', e);
      }
    }
    onToggleVisited(pandal.id);
  };

  const handleShareWhatsapp = () => {
    if (pandal) {
      const nameStr = pandal.name[language] || pandal.name.en;
      const themeStr = pandal.theme[language] || pandal.theme.en;
      const metroStr = pandal.nearestMetro;
      const text = `🪔 Let's meet at *${nameStr}*!\n✨ Theme: ${themeStr}\n🚇 Nearest Metro: ${metroStr}\n📍 Map Location: https://www.google.com/maps?q=${pandal.lat},${pandal.lng}\n\nShared via Hoppers — Offline Durga Puja Guide`;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    } else if (station) {
      const nameStr = station.name[language] || station.name.en;
      const linesStr = station.lines.map((l) => l.toUpperCase()).join(', ');
      const text = `🚇 *${nameStr} Metro Station* (Lines: ${linesStr})\n📍 Location: https://www.google.com/maps?q=${station.lat},${station.lng}\n\nShared via Hoppers Kolkata Guide`;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    } else if (facility) {
      const nameStr = facility.name[language] || facility.name.en;
      const text = `📍 *${nameStr}* (${facility.category.toUpperCase()})\n📍 Location: https://www.google.com/maps?q=${facility.lat},${facility.lng}\n\nShared via Hoppers Offline Guide`;
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const handlePlanRoute = () => {
    if (pandal && onPlanRoute) {
      onPlanRoute(pandal);
      onClose();
    } else {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedItem.lat},${selectedItem.lng}&travelmode=walking`;
      window.open(url, '_blank', 'noopener,noreferrer');
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
          dot: 'bg-rose-400 animate-ping',
          label: t.crowdExtreme,
        };
    }
  };

  const openGoogleMaps = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedItem.lat},${selectedItem.lng}&travelmode=walking`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      id="pandal-bottom-sheet-overlay"
      className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs pointer-events-auto transition-opacity"
        onClick={onClose}
      />

      {/* Sheet Content */}
      <div
        id="pandal-bottom-sheet"
        className="relative w-full max-w-lg max-h-[85dvh] overflow-y-auto overscroll-y-contain pointer-events-auto bg-slate-900/95 backdrop-blur-2xl border-t border-slate-800 shadow-2xl rounded-t-3xl p-5 pb-[calc(var(--bottom-dock-height)+var(--safe-bottom)+24px)] text-slate-100 animate-slide-up"
      >
        {/* Drag Handle Bar */}
        <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-4" />

        {/* Close Button */}
        <button
          id="close-sheet-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 1. PANDAL DETAIL VIEW */}
        {isPandal && pandal && (
          <div>
            {/* Header: Name & Zone */}
            <div className="pr-8">
              <div className="flex items-center gap-2 flex-wrap mb-1.5 text-xs text-slate-400">
                <span className="font-semibold text-amber-400">
                  {pandal.zone === 'North'
                    ? t.zoneNorth
                    : pandal.zone === 'South'
                    ? t.zoneSouth
                    : t.zoneCentral}
                </span>
                <span>·</span>
                {(() => {
                  const effective = crowdSummary?.effectiveLevel || pandal.crowdLevel;
                  const badge = getCrowdBadge(effective);
                  return (
                    <span className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      <span>{badge.label}</span>
                      {crowdSummary?.isCrowdsourced && (
                        <span className="text-[9px] font-bold text-amber-300 bg-amber-400/20 px-1.5 py-0.5 rounded-full border border-amber-400/30">
                          ⚡ Live
                        </span>
                      )}
                    </span>
                  );
                })()}
              </div>

              <h2 className="text-xl font-bold text-white tracking-tight leading-snug">
                {pandal.name[language] || pandal.name.en}
              </h2>

              {language !== 'en' && (
                <p className="text-xs text-slate-400 mt-0.5">{pandal.name.en}</p>
              )}
            </div>

            {/* Quick Stats: Distance & Metro */}
            <div className="mt-3.5 grid grid-cols-2 gap-2">
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800 flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 shrink-0">
                  <Train className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                    {t.nearestMetroLabel}
                  </p>
                  <p className="text-xs font-semibold text-white truncate">
                    {pandal.nearestMetro}
                  </p>
                  <p className="text-[10px] text-blue-400">
                    ~{pandal.walkingTimeToMetroMin} min {t.walkTime}
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-800 flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                    Distance
                  </p>
                  <p className="text-xs font-semibold text-white truncate">
                    {distanceStr || 'Kolkata'}
                  </p>
                  <p className="text-[10px] text-amber-400">
                    {walkMin ? `~${walkMin}m walk` : 'Zone ' + pandal.zone}
                  </p>
                </div>
              </div>
            </div>

            {/* Live Crowd Voting Section */}
            <div className="mt-3 p-3 rounded-xl bg-slate-800/40 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">Live Crowd Condition</span>
                <span className="text-[11px] text-slate-400">Vote condition:</span>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => handleVoteCrowd('low')}
                  className="py-1.5 px-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition text-center"
                >
                  🟢 Low
                </button>
                <button
                  onClick={() => handleVoteCrowd('medium')}
                  className="py-1.5 px-2 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold transition text-center"
                >
                  🟡 Moderate
                </button>
                <button
                  onClick={() => handleVoteCrowd('heavy')}
                  className="py-1.5 px-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold transition text-center"
                >
                  🔴 Heavy
                </button>
              </div>
            </div>

            {/* Theme Description */}
            <div className="mt-3.5 space-y-1.5">
              <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3" />
                  {t.themeLabel}
                </p>
                <p className="text-sm font-medium text-white">
                  {pandal.theme[language] || pandal.theme.en}
                </p>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed px-0.5 pt-1">
                {pandal.description[language] || pandal.description.en}
              </p>
            </div>

            {/* Exit Gate Advice */}
            {pandal.exitGateSuggestion && (
              <div className="mt-3 p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-300">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-blue-400" />
                  {t.exitGateTip}
                </p>
                <p className="text-slate-200">{pandal.exitGateSuggestion}</p>
              </div>
            )}

            {/* Facilities Tags */}
            <div className="mt-3.5">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                {t.facilitiesTitle}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {pandal.facilities.map((fac, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md bg-slate-800/70 border border-slate-750 text-[11px] text-slate-300 font-medium"
                  >
                    {fac}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 space-y-2">
              <button
                id="plan-route-btn"
                onClick={handlePlanRoute}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-sm active:scale-98 transition"
              >
                <Route className="w-4 h-4 text-slate-950" />
                <span>{t.planRoute}</span>
              </button>

              {onToggleTrailStop && (() => {
                const isInTrail = trailStops?.some((s) => s.pandalId === pandal.id);
                const stopIdx = trailStops?.findIndex((s) => s.pandalId === pandal.id);
                return (
                  <button
                    id="toggle-trail-btn"
                    onClick={() => onToggleTrailStop(pandal)}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs border active:scale-98 transition ${
                      isInTrail
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400/40 hover:bg-amber-500/30'
                        : 'bg-slate-800 text-slate-200 border-slate-700 hover:border-amber-400/50 hover:text-amber-300'
                    }`}
                  >
                    <Route className="w-4 h-4 text-amber-400" />
                    <span>
                      {isInTrail
                        ? `${t.inTrail} (Stop #${(stopIdx ?? 0) + 1}) • ${t.removeFromTrail}`
                        : `+ ${t.addToTrail}`}
                    </span>
                  </button>
                );
              })()}

              <div className="grid grid-cols-2 gap-2">
                <button
                  id="stamp-passport-btn"
                  onClick={handleMarkVisited}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-semibold text-xs transition-all duration-200 active:scale-98 border ${
                    isVisited
                      ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
                      : 'bg-slate-800/80 text-slate-200 border-slate-700 hover:bg-slate-800'
                  }`}
                >
                  {isVisited ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="truncate">{t.alreadyVisited}</span>
                    </>
                  ) : (
                    <>
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      <span className="truncate">{t.markVisited}</span>
                    </>
                  )}
                </button>

                <button
                  id="share-whatsapp-btn"
                  onClick={handleShareWhatsapp}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-semibold text-xs border border-slate-700 active:scale-98 transition"
                >
                  <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="truncate">{t.shareWhatsapp}</span>
                </button>
              </div>
            </div>

            {isVisited && visitInfo && (
              <p className="text-center text-[11px] text-emerald-400/80 mt-2">
                {t.visitedOn} {new Date(visitInfo.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, {new Date(visitInfo.timestamp).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {/* 2. METRO STATION DETAIL VIEW */}
        {isStation && station && (
          <div id="metro-station-sheet-content">
            {/* Header: Station Name & Line Badges */}
            <div className="pr-8">
              <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                {station.lines.map((l) => {
                  const lineBg =
                    l === 'blue'
                      ? 'bg-blue-600 text-white'
                      : l === 'green'
                      ? 'bg-emerald-600 text-white'
                      : l === 'orange'
                      ? 'bg-orange-600 text-white'
                      : l === 'purple'
                      ? 'bg-purple-600 text-white'
                      : 'bg-yellow-500 text-slate-950 font-bold';

                  const lineCode =
                    l === 'blue'
                      ? 'Line 1 Blue'
                      : l === 'green'
                      ? 'Line 2 Green'
                      : l === 'orange'
                      ? 'Line 6 Orange'
                      : l === 'purple'
                      ? 'Line 3 Purple'
                      : 'Line 4 Yellow';

                  return (
                    <span
                      key={l}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${lineBg}`}
                    >
                      {lineCode}
                    </span>
                  );
                })}

                {station.isInterchange && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center gap-1">
                    <span>⇄</span>
                    <span>{t.interchangeHubBadge || 'Transfer Hub'}</span>
                  </span>
                )}
              </div>

              <h2 className="text-xl font-bold text-white tracking-tight leading-snug">
                {station.name[language] || station.name.en}
              </h2>

              {language !== 'en' && (
                <p className="text-xs text-slate-400 mt-0.5">{station.name.en}</p>
              )}
            </div>

            {/* Quick Stat Pill: Location / Distance */}
            {distanceStr && (
              <div className="mt-3 p-2.5 rounded-xl bg-slate-800/60 border border-slate-800 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span>{distanceStr} from your location</span>
                </div>
                {walkMin && (
                  <span className="text-[11px] font-semibold text-blue-400">
                    ~{walkMin} min walk
                  </span>
                )}
              </div>
            )}

            {/* Exit Gates & Destinations */}
            <div className="mt-4 space-y-2">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Footprints className="w-3.5 h-3.5 text-amber-400" />
                <span>{t.exitGatesLabel || 'Exit Gates & Destinations'}</span>
              </p>

              <div className="space-y-1.5">
                {station.exitGates && station.exitGates.length > 0 ? (
                  station.exitGates.map((gate, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 flex items-start gap-2.5 text-xs"
                    >
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-bold text-[10px] shrink-0 border border-blue-500/30">
                        {gate.gate}
                      </span>
                      <p className="text-slate-200 font-medium">
                        {gate.destination[language] || gate.destination.en}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-400">
                    Standard street exits available. Follow station signage.
                  </div>
                )}
              </div>
            </div>

            {/* Feeder Pandals Near Station */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                  <span>{t.feederPandalsLabel || 'Feeder Pandals near Station'}</span>
                </p>
                <span className="text-[10px] text-amber-400 font-bold">
                  {feederPandals.length} {feederPandals.length === 1 ? 'pandal' : 'pandals'}
                </span>
              </div>

              {feederPandals.length === 0 ? (
                <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800/80 text-xs text-slate-400 text-center">
                  {t.noConnectingPujo || 'No major registered puja directly at station gate. Use transit routes to reach nearby hubs.'}
                </div>
              ) : (
                <div className="space-y-2">
                  {feederPandals.map((p) => {
                    const crowdBadge = getCrowdBadge(p.crowdLevel);
                    return (
                      <div
                        key={p.id}
                        className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-750 transition flex items-center justify-between gap-2.5"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-bold text-white truncate">
                              {p.name[language] || p.name.en}
                            </span>
                            <span className={`text-[9px] px-1.5 py-0.2 rounded-full border font-semibold shrink-0 ${crowdBadge.bg}`}>
                              {crowdBadge.label}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 truncate">
                            {p.theme[language] || p.theme.en}
                          </p>
                          <p className="text-[10px] text-blue-400 font-medium mt-0.5">
                            ~{p.walkingTimeToMetroMin}m walk from {p.nearestMetro}
                          </p>
                        </div>

                        <button
                          onClick={() => {
                            if (onSelectPandal) {
                              onSelectPandal(p);
                            }
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[10px] shrink-0 flex items-center gap-1 active:scale-95 transition"
                        >
                          <span>{t.viewPandalDetails || 'View'}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                id="station-navigate-btn"
                onClick={openGoogleMaps}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs active:scale-98 transition shadow-xs"
              >
                <Navigation className="w-4 h-4" />
                <span>{t.takeMeToStation || 'Directions to Station'}</span>
              </button>

              <button
                id="station-share-whatsapp-btn"
                onClick={handleShareWhatsapp}
                className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-semibold text-xs active:scale-98 transition"
              >
                <Share2 className="w-4 h-4 text-emerald-400" />
                <span>{t.shareWhatsapp}</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. FACILITY DETAIL VIEW */}
        {isFacility && facility && (
          <div>
            <div className="pr-8">
              <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider mb-1 inline-block">
                {facility.category.toUpperCase()}
              </span>
              <h2 className="text-lg font-bold text-white leading-snug">
                {facility.name[language] || facility.name.en}
              </h2>
            </div>

            <div className="mt-3 p-3 rounded-xl bg-slate-800/60 border border-slate-800 space-y-2">
              <p className="text-xs text-slate-300 leading-relaxed">
                {facility.details[language] || facility.details.en}
              </p>

              {facility.contact && (
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 pt-2 border-t border-slate-800">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <a href={`tel:${facility.contact.split('/')[0].trim()}`} className="underline">
                    {facility.contact}
                  </a>
                </div>
              )}

              {distanceStr && (
                <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>{distanceStr} away (~{walkMin}m walk)</span>
                </div>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                id="facility-navigate-btn"
                onClick={openGoogleMaps}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs active:scale-98 transition shadow-xs"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>{t.takeMeThere}</span>
              </button>

              <button
                id="facility-share-whatsapp-btn"
                onClick={handleShareWhatsapp}
                className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 font-semibold text-xs active:scale-98 transition"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t.shareWhatsapp}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
