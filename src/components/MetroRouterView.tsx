import React, { useState, useMemo, useEffect } from 'react';
import { MetroStation, Language, Pandal, MetroMapRoute } from '../types';
import { METRO_STATIONS, PANDALS_DATA } from '../data/mockData';
import { TRANSLATIONS } from '../data/translations';
import { calculateMetroRoute } from '../utils/metroRouting';
import {
  Train,
  ArrowRight,
  ArrowUpDown,
  Clock,
  Navigation,
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  X,
  Compass,
} from 'lucide-react';

interface Props {
  language: Language;
  onSelectPandal: (pandal: Pandal) => void;
  onRouteCalculated?: (route: MetroMapRoute | null) => void;
  isOverlay?: boolean;
  onCloseOverlay?: () => void;
  onViewOnMap?: () => void;
}

export const MetroRouterView: React.FC<Props> = ({
  language,
  onSelectPandal,
  onRouteCalculated,
  isOverlay = false,
  onCloseOverlay,
  onViewOnMap,
}) => {
  const t = TRANSLATIONS[language];

  // Default route: Shyambazar (North) to Kalighat (South)
  const [fromId, setFromId] = useState('shyambazar');
  const [toId, setToId] = useState('kalighat');

  const routeResult = useMemo(() => {
    return calculateMetroRoute(fromId, toId);
  }, [fromId, toId]);

  // Sync calculated route with map
  useEffect(() => {
    if (onRouteCalculated) {
      if (routeResult && routeResult.stationsList && routeResult.stationsList.length > 0) {
        onRouteCalculated({
          stations: routeResult.stationsList,
          line: routeResult.line,
          coordinates: routeResult.stationsList.map((s) => [s.lat, s.lng]),
        });
      } else {
        onRouteCalculated(null);
      }
    }
  }, [routeResult, onRouteCalculated]);

  const handleSwapStations = () => {
    const temp = fromId;
    setFromId(toId);
    setToId(temp);
  };

  const getLineColor = (line: 'blue' | 'green' | 'interchange') => {
    if (line === 'blue') return 'bg-blue-600 text-blue-100 border-blue-400';
    if (line === 'green') return 'bg-emerald-600 text-emerald-100 border-emerald-400';
    return 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white border-amber-400';
  };

  const containerClasses = isOverlay
    ? 'relative w-full max-w-lg mx-auto bg-slate-950/95 backdrop-blur-xl border border-white/20 p-4 rounded-3xl shadow-2xl space-y-4 pointer-events-auto max-h-[75vh] overflow-y-auto animate-fade-in'
    : 'w-full max-w-3xl mx-auto px-4 pt-4 pb-28 min-h-[calc(100vh-62px)]';

  return (
    <div id="metro-router-view" className={containerClasses}>
      {/* Header Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/60 to-slate-900 border border-blue-500/20 shadow-xl mb-4 relative">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Train className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {t.metroTitle}
              </h2>
              <p className="text-xs text-slate-300">
                {t.metroSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onViewOnMap && (
              <button
                onClick={onViewOnMap}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-600/40 hover:bg-blue-600/60 text-blue-200 border border-blue-400/40 text-xs font-semibold active:scale-95 transition"
                title="View Route on Map"
              >
                <Compass className="w-3.5 h-3.5 text-blue-300" />
                <span>Map</span>
              </button>
            )}
            {isOverlay && onCloseOverlay && (
              <button
                onClick={onCloseOverlay}
                className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10 active:scale-95 transition"
                title="Close Metro Overlay"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Station Selector Card */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 shadow-xl space-y-3 mb-5">
        {/* From Station */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            {t.fromStation}
          </label>
          <div className="relative">
            <select
              id="from-station-select"
              value={fromId}
              onChange={(e) => setFromId(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800 border border-white/10 text-white text-sm font-semibold focus:outline-hidden focus:border-amber-500/50 appearance-none"
            >
              <optgroup label="Blue Line 1 (North-South)">
                {METRO_STATIONS.filter((s) => s.lines.includes('blue')).map((s) => (
                  <option key={`from-${s.id}`} value={s.id}>
                    🔵 {s.name[language] || s.name.en} {s.isInterchange ? '(Interchange)' : ''}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Green Line 2 (Underwater / East-West)">
                {METRO_STATIONS.filter((s) => s.lines.includes('green') && !s.isInterchange).map((s) => (
                  <option key={`from-${s.id}`} value={s.id}>
                    🟢 {s.name[language] || s.name.en}
                  </option>
                ))}
              </optgroup>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
              ▼
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center -my-1">
          <button
            id="swap-stations-btn"
            onClick={handleSwapStations}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-400 border border-white/10 shadow-md active:scale-95 transition"
            title="Swap Origin & Destination"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        {/* To Station */}
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            {t.toStation}
          </label>
          <div className="relative">
            <select
              id="to-station-select"
              value={toId}
              onChange={(e) => setToId(e.target.value)}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800 border border-white/10 text-white text-sm font-semibold focus:outline-hidden focus:border-amber-500/50 appearance-none"
            >
              <optgroup label="Blue Line 1 (North-South)">
                {METRO_STATIONS.filter((s) => s.lines.includes('blue')).map((s) => (
                  <option key={`to-${s.id}`} value={s.id}>
                    🔵 {s.name[language] || s.name.en} {s.isInterchange ? '(Interchange)' : ''}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Green Line 2 (Underwater / East-West)">
                {METRO_STATIONS.filter((s) => s.lines.includes('green') && !s.isInterchange).map((s) => (
                  <option key={`to-${s.id}`} value={s.id}>
                    🟢 {s.name[language] || s.name.en}
                  </option>
                ))}
              </optgroup>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
              ▼
            </div>
          </div>
        </div>
      </div>

      {/* Routing Output */}
      {fromId === toId ? (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-center text-xs font-semibold">
          {t.sameStationAlert}
        </div>
      ) : routeResult ? (
        <div className="space-y-4">
          {/* Journey Metrics Header */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3 rounded-xl bg-slate-900 border border-white/10 flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">
                  {t.estTime}
                </p>
                <p className="text-base font-bold text-amber-300">
                  ~{routeResult.estimatedMinutes} mins
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-white/10 flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                <Train className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">
                  Total Stations
                </p>
                <p className="text-base font-bold text-white">
                  {routeResult.stationsCount} {t.stationsHop}
                </p>
              </div>
            </div>
          </div>

          {/* Route Status Pill */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between text-xs font-bold ${
              routeResult.isDirect
                ? 'bg-blue-900/30 border-blue-500/40 text-blue-300'
                : 'bg-purple-900/30 border-purple-500/40 text-purple-200'
            }`}
          >
            <span>{routeResult.isDirect ? t.directRoute : t.interchangeRequired}</span>
            <span className="px-2 py-0.5 rounded bg-black/40 uppercase tracking-wider text-[10px]">
              {routeResult.line.toUpperCase()}
            </span>
          </div>

          {/* Step-by-Step Navigation List */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 shadow-xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Step-by-Step Itinerary
            </h3>

            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-blue-500 before:via-amber-500 before:to-emerald-500">
              {routeResult.steps.map((step, idx) => (
                <div key={idx} className="relative">
                  {/* Step Marker Dot */}
                  <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-slate-900 border-2 border-amber-400 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-white/5 space-y-1">
                    <p className="text-sm font-semibold text-white">
                      {step.instruction[language] || step.instruction.en}
                    </p>
                    {step.subtext && (
                      <p className="text-xs text-slate-400">
                        {step.subtext[language] || step.subtext.en}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Exit Gate Recommendations */}
          {routeResult.exitGateAdvice && routeResult.exitGateAdvice.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2.5 flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5" />
                {t.suggestedExits}
              </h3>

              <div className="space-y-2">
                {routeResult.exitGateAdvice.map((exit, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-800/60 border border-white/5 text-xs text-slate-200"
                  >
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold shrink-0">
                      {exit.gate}
                    </span>
                    <span className="pt-0.5">
                      {exit.destination[language] || exit.destination.en}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Connecting Famous Pandals for Arrival Station */}
          {routeResult.destinationPandals.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Iconic Pandals near {routeResult.toStation.name[language] || routeResult.toStation.name.en}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {routeResult.destinationPandals.map((pandal) => (
                  <div
                    key={pandal.id}
                    onClick={() => onSelectPandal(pandal)}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-white/10 cursor-pointer transition flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        {pandal.name[language] || pandal.name.en}
                      </p>
                      <p className="text-[11px] text-amber-300 truncate">
                        {pandal.walkingTimeToMetroMin}m walk from gate
                      </p>
                    </div>
                    <span className="text-xs text-amber-400 font-bold shrink-0">
                      View →
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
