import React from 'react';
import { Pandal, FacilityPoint, Language, VisitedPandal, TrailStop } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { formatDistance, estimateWalkingMinutes } from '../utils/geo';
import confetti from 'canvas-confetti';
import {
  X,
  Navigation,
  CheckCircle2,
  MapPin,
  Clock,
  Train,
  ShieldAlert,
  Sparkles,
  Award,
  PhoneCall,
  Info,
  Share2,
  Route,
} from 'lucide-react';

interface Props {
  selectedItem: Pandal | FacilityPoint | null;
  onClose: () => void;
  userCoords: { lat: number; lng: number } | null;
  language: Language;
  visitedList: VisitedPandal[];
  onToggleVisited: (pandalId: string) => void;
  onPlanRoute?: (pandal: Pandal) => void;
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
  trailStops,
  onToggleTrailStop,
}) => {
  if (!selectedItem) return null;

  const t = TRANSLATIONS[language];
  const isPandal = 'theme' in selectedItem;
  const pandal = isPandal ? (selectedItem as Pandal) : null;
  const facility = !isPandal ? (selectedItem as FacilityPoint) : null;

  const isVisited = pandal
    ? visitedList.some((v) => v.pandalId === pandal.id)
    : false;
  const visitInfo = pandal
    ? visitedList.find((v) => v.pandalId === pandal.id)
    : null;

  // Calculate distance if user coords available
  let distanceStr: string | null = null;
  let walkMin: number | null = null;
  let distKm: number | null = null;
  if (userCoords) {
    const dKm =
      Math.hypot(
        (selectedItem.lat - userCoords.lat) * 111,
        (selectedItem.lng - userCoords.lng) * 111 * Math.cos((selectedItem.lat * Math.PI) / 180)
      );
    distanceStr = formatDistance(dKm);
    walkMin = estimateWalkingMinutes(dKm);
    distKm = dKm;
  }

  const handleMarkVisited = () => {
    if (!pandal) return;

    if (!isVisited) {
      // Trigger festive celebratory confetti
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
      className="fixed inset-0 z-40 flex items-end justify-center pointer-events-none"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs pointer-events-auto transition-opacity"
        onClick={onClose}
      />

      {/* Sheet Content */}
      <div
        id="pandal-bottom-sheet"
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto pointer-events-auto bg-slate-900/95 backdrop-blur-2xl border-t border-slate-800 shadow-2xl rounded-t-3xl p-5 pb-[calc(5rem+env(safe-area-inset-bottom))] text-slate-100 animate-slide-up"
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

        {isPandal && pandal ? (
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
                  const badge = getCrowdBadge(pandal.crowdLevel);
                  return (
                    <span className="flex items-center gap-1.5">
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      <span>{badge.label}</span>
                    </span>
                  );
                })()}
              </div>

              <h2 className="text-xl font-bold text-white tracking-tight leading-snug">
                {pandal.name[language] || pandal.name.en}
              </h2>
            </div>

            {/* Distance & Nearest Metro summary row */}
            <div className="mt-3.5 grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-800/60 border border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-blue-500/15 text-blue-400 shrink-0">
                  <Train className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-medium text-slate-400">
                    {t.nearestMetroLabel}
                  </p>
                  <p className="text-xs font-semibold text-slate-200 truncate">
                    {pandal.nearestMetro}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-400/15 text-amber-400 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-medium text-slate-400">
                    {distanceStr ? t.distanceAway : t.walkTime}
                  </p>
                  <p className="text-xs font-semibold text-slate-200">
                    {distanceStr ? `${distanceStr} (~${walkMin}m)` : `${pandal.walkingTimeToMetroMin}m from Metro`}
                  </p>
                </div>
              </div>
            </div>

            {/* Commute Advice Tag */}
            {distKm !== null && (
              <div className="mt-2.5 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-800 text-xs font-medium flex items-center gap-2">
                {distKm < 1.5 ? (
                  <span className="text-emerald-300">🚶 Walking Distance (~15 mins)</span>
                ) : distKm <= 5.0 ? (
                  <span className="text-amber-300">🛺 Auto/Taxi recommended</span>
                ) : (
                  <span className="text-blue-300">🚇 Metro/Cab recommended</span>
                )}
              </div>
            )}

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

            {/* Actions: Stamp Passport, Plan Route & WhatsApp Share */}
            <div className="mt-5 space-y-2">
              {/* Primary: Plan Route from Current Location */}
              <button
                id="plan-route-btn"
                onClick={handlePlanRoute}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm shadow-sm active:scale-98 transition"
              >
                <Route className="w-4 h-4 text-slate-950" />
                <span>{t.planRoute}</span>
              </button>

              {/* Add / Remove from Multi-Stop Trail */}
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
                {/* Stamp in Passport */}
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

                {/* WhatsApp Share Location */}
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
        ) : facility ? (
          <div>
            {/* Facility Details View */}
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
        ) : null}
      </div>
    </div>
  );
};
