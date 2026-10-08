import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MetroStation, Language, Pandal, MetroMapRoute, MetroLine } from '../types';
import { METRO_STATIONS, PANDALS_DATA } from '../data/mockData';
import { METRO_LINES } from '../data/metroLines';
import { TRANSLATIONS } from '../data/translations';
import { calculateMetroRoute, getLineColor } from '../utils/metroRouting';
import { getMetroLineFeeders, MetroLineFeeders, LineStationData, StationFeederEntry } from '../utils/metroFeederData';
import {
  Train,
  ArrowUpDown,
  Clock,
  Navigation,
  Sparkles,
  X,
  Compass,
  AlertCircle,
  MapPin,
  ChevronRight,
  ChevronDown,
  Layers,
  Search,
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

  // Active View Mode: 'planner' | 'stations'
  const [activeTab, setActiveTab] = useState<'planner' | 'stations'>('planner');

  // Default route: Shyambazar (North) to Kalighat (South)
  const [fromId, setFromId] = useState('shyambazar');
  const [toId, setToId] = useState('kalighat');

  // Station Feeder Explorer State
  const [selectedLineCode, setSelectedLineCode] = useState<'blue' | 'green' | 'purple' | 'orange' | 'yellow'>('blue');
  const [expandedStationName, setExpandedStationName] = useState<string | null>('Shyambazar');
  const [stationSearchQuery, setStationSearchQuery] = useState('');

  const allLineFeeders = useMemo(() => getMetroLineFeeders(), []);

  const routeResult = useMemo(() => {
    return calculateMetroRoute(fromId, toId);
  }, [fromId, toId]);

  const onRouteCalculatedRef = useRef(onRouteCalculated);
  useEffect(() => {
    onRouteCalculatedRef.current = onRouteCalculated;
  }, [onRouteCalculated]);

  const lastCalculatedRouteKey = useRef<string>('');

  // Sync calculated route with map safely without infinite render loop
  useEffect(() => {
    const routeKey =
      routeResult && routeResult.stationsList && routeResult.stationsList.length > 0
        ? `${fromId}->${toId}:${routeResult.stationsList.length}`
        : 'empty';

    if (lastCalculatedRouteKey.current === routeKey) {
      return;
    }
    lastCalculatedRouteKey.current = routeKey;

    if (onRouteCalculatedRef.current) {
      if (routeResult && routeResult.stationsList && routeResult.stationsList.length > 0) {
        onRouteCalculatedRef.current({
          stations: routeResult.stationsList,
          line: routeResult.line,
          coordinates: routeResult.stationsList.map((s) => [s.lat, s.lng]),
        });
      } else {
        onRouteCalculatedRef.current(null);
      }
    }
  }, [fromId, toId, routeResult]);

  const handleSwapStations = () => {
    const temp = fromId;
    setFromId(toId);
    setToId(temp);
  };

  const getStationLabel = (s: MetroStation) => {
    const name = s.name[language] || s.name.en;
    if (s.isInterchange) return `${name} (${t.interchangeHubBadge || 'Interchange'})`;
    return name;
  };

  const containerClasses = isOverlay
    ? 'relative w-full max-w-lg mx-auto bg-slate-900/95 backdrop-blur-2xl border border-slate-800 p-4 rounded-3xl shadow-2xl space-y-3.5 pointer-events-auto max-h-[82dvh] overflow-y-auto animate-fade-in'
    : 'w-full max-w-2xl mx-auto px-4 pt-3 pb-[calc(var(--bottom-dock-height)+var(--safe-bottom)+24px)] h-full overflow-y-auto overscroll-y-contain space-y-4';

  const lineEmoji: Record<string, string> = {
    blue: '🔵',
    green: '🟢',
    orange: '🟠',
    purple: '🟣',
    yellow: '🟡',
  };

  const activeLineGroup = useMemo(() => {
    return allLineFeeders.find((l) => l.lineCode === selectedLineCode) || allLineFeeders[0];
  }, [allLineFeeders, selectedLineCode]);

  const filteredStations = useMemo(() => {
    if (!activeLineGroup) return [];
    if (!stationSearchQuery.trim()) return activeLineGroup.stations;
    const q = stationSearchQuery.toLowerCase();
    return activeLineGroup.stations.filter(
      (st) =>
        st.station.toLowerCase().includes(q) ||
        st.pandals.some((p) => p.name.toLowerCase().includes(q))
    );
  }, [activeLineGroup, stationSearchQuery]);

  const renderStationOptions = (currentSelectedId: string, prefix: string) => {
    return (
      <>
        {METRO_LINES.map((line) => {
          const stations =
            line.code === 'blue' || line.code === 'purple'
              ? METRO_STATIONS.filter((s) => s.lines.includes(line.code))
              : METRO_STATIONS.filter((s) => s.lines.includes(line.code) && !s.isInterchange);
          const emoji = lineEmoji[line.code] || '🚇';
          const lineName = line.name[language] || line.name.en;
          const terminals = line.terminals[language] || line.terminals.en;

          return (
            <optgroup key={line.id} label={`${emoji} ${lineName} (${terminals})`}>
              {stations.map((s) => (
                <option key={`${prefix}-${s.id}`} value={s.id}>
                  {emoji} {getStationLabel(s)}
                </option>
              ))}
            </optgroup>
          );
        })}
      </>
    );
  };

  return (
    <div id="metro-router-view" className={containerClasses}>
      {/* Header Banner */}
      <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400 shrink-0">
            <Train className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold text-white tracking-tight truncate">
              {t.metroTitle || 'Kolkata Metro Router'}
            </h2>
            <p className="text-[11px] text-slate-400 truncate">
              57 Stations across 5 Corridors & Connected Pandals
            </p>
          </div>
        </div>

        {/* Header Action: Only Close "X" Button */}
        {isOverlay && onCloseOverlay && (
          <button
            id="close-metro-overlay-btn"
            onClick={onCloseOverlay}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition active:scale-95"
            title={t.closeSheet || 'Close Metro Overlay'}
            aria-label={t.closeSheet || 'Close'}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Segmented Mode Selector */}
      <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-800/80 border border-slate-700/60 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('planner')}
          className={`py-2 px-3 rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeTab === 'planner'
              ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Route Planner</span>
        </button>
        <button
          onClick={() => setActiveTab('stations')}
          className={`py-2 px-3 rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeTab === 'stations'
              ? 'bg-amber-400 text-slate-950 shadow-md font-bold'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>57 Stations & Feeders</span>
        </button>
      </div>

      {activeTab === 'planner' ? (
        <>
          {/* Station Selector Card */}
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
            {/* From Station */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                {t.fromStation}
              </label>
              <div className="relative">
                <select
                  id="from-station-select"
                  value={fromId}
                  onChange={(e) => setFromId(e.target.value)}
                  className="w-full py-2 pl-3 pr-8 rounded-xl bg-slate-800/80 border border-slate-750 text-white text-xs sm:text-sm font-medium focus:outline-hidden focus:border-amber-400/60 appearance-none"
                >
                  {renderStationOptions(fromId, 'from')}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 text-xs">
                  ▼
                </div>
              </div>
            </div>

            {/* Swap Button */}
            <div className="flex justify-center -my-1">
              <button
                id="swap-stations-btn"
                onClick={handleSwapStations}
                className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-amber-400 border border-slate-700 shadow-xs active:scale-95 transition"
                title="Swap Origin & Destination"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* To Station */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                {t.toStation}
              </label>
              <div className="relative">
                <select
                  id="to-station-select"
                  value={toId}
                  onChange={(e) => setToId(e.target.value)}
                  className="w-full py-2 pl-3 pr-8 rounded-xl bg-slate-800/80 border border-slate-750 text-white text-xs sm:text-sm font-medium focus:outline-hidden focus:border-amber-400/60 appearance-none"
                >
                  {renderStationOptions(toId, 'to')}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 text-xs">
                  ▼
                </div>
              </div>
            </div>
          </div>

          {/* Routing Output */}
          {fromId === toId ? (
            <div className="p-3.5 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-300 text-center text-xs font-medium">
              {t.sameStationAlert}
            </div>
          ) : routeResult ? (
            <div className="space-y-3">
              {/* Journey Metrics Header */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-amber-400/15 text-amber-400 shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-medium text-slate-400 truncate">
                      {t.estTime}
                    </p>
                    <p className="text-sm font-bold text-white tabular-nums">
                      ~{routeResult.estimatedMinutes} mins
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-blue-500/15 text-blue-400 shrink-0">
                    <Train className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase font-medium text-slate-400 truncate">
                      Total Stations
                    </p>
                    <p className="text-sm font-bold text-white tabular-nums">
                      {routeResult.stationsCount} {t.stationsHop}
                    </p>
                  </div>
                </div>
              </div>

              {/* Route Status Pill */}
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs font-medium text-slate-300">
                <span>{routeResult.isDirect ? t.directRoute : t.interchangeRequired}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${getLineColor(
                    routeResult.line
                  )}`}
                >
                  {routeResult.line.toUpperCase()}
                </span>
              </div>

              {/* Pujo Ground Reality Bypass Banner if Applicable */}
              {routeResult.bypassNote && (
                <div className="p-3 rounded-xl bg-amber-400/10 border border-amber-400/20 text-amber-200 text-xs flex items-start gap-2.5">
                  <span className="text-sm shrink-0">🛺</span>
                  <div>
                    <p className="font-semibold text-amber-300">Pujo Ground Reality Bypass</p>
                    <p className="text-slate-300 mt-0.5 leading-relaxed">
                      {routeResult.bypassNote[language] || routeResult.bypassNote.en}
                    </p>
                  </div>
                </div>
              )}

              {/* Step-by-Step Navigation List */}
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Step-by-Step Itinerary
                </h3>

                <div className="relative pl-5 space-y-3 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-750">
                  {routeResult.steps.map((step, idx) => (
                    <div key={idx} className="relative">
                      {/* Step Marker Dot */}
                      <div className="absolute -left-5 top-1 w-3.5 h-3.5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-800/50 border border-slate-800 space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-white">
                            {step.instruction[language] || step.instruction.en}
                          </p>
                          {step.lineBadge && (
                            <span
                              className={`text-[9px] px-1.5 py-0.5 rounded font-medium uppercase shrink-0 ${getLineColor(
                                step.lineBadge as MetroLine | 'interchange' | 'bypass'
                              )}`}
                            >
                              {step.lineBadge}
                            </span>
                          )}
                        </div>
                        {step.subtext && (
                          <p className="text-[11px] text-slate-400">
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
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Navigation className="w-3 h-3 text-amber-400" />
                    {t.suggestedExits}
                  </h3>

                  <div className="space-y-1.5">
                    {routeResult.exitGateAdvice.map((exit, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 p-2 rounded-lg bg-slate-800/40 border border-slate-800 text-xs text-slate-200"
                      >
                        <span className="px-1.5 py-0.5 rounded bg-amber-400/15 text-amber-300 font-semibold text-[10px] shrink-0">
                          {exit.gate}
                        </span>
                        <span className="text-xs text-slate-300">
                          {exit.destination[language] || exit.destination.en}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Connecting Famous Pandals for Arrival Station */}
              {routeResult.destinationPandals.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
                  <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    Iconic Pandals near {routeResult.toStation.name[language] || routeResult.toStation.name.en}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {routeResult.destinationPandals.map((pandal) => (
                      <div
                        key={pandal.id}
                        onClick={() => onSelectPandal(pandal)}
                        className="p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-750 cursor-pointer transition flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate">
                            {pandal.name[language] || pandal.name.en}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {pandal.walkingTimeToMetroMin}m walk from gate
                          </p>
                        </div>
                        <span className="text-xs text-amber-400 font-medium shrink-0">
                          View →
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </>
      ) : (
        /* Station Feeder Explorer Mode (57 Stations across 5 lines) */
        <div className="space-y-3">
          {/* Corridor Selection Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {allLineFeeders.map((lg) => {
              const isActive = lg.lineCode === selectedLineCode;
              const emoji = lineEmoji[lg.lineCode] || '🚇';
              return (
                <button
                  key={lg.lineCode}
                  onClick={() => {
                    setSelectedLineCode(lg.lineCode);
                    if (lg.stations.length > 0) {
                      setExpandedStationName(lg.stations[0].station);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-slate-800 text-amber-300 border border-amber-400/50 shadow-md'
                      : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:text-white'
                  }`}
                >
                  <span>{emoji}</span>
                  <span>{lg.line}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                    {lg.stations.length}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={stationSearchQuery}
              onChange={(e) => setStationSearchQuery(e.target.value)}
              placeholder="Search station or connected pandal..."
              className="w-full py-2 pl-9 pr-3 rounded-xl bg-slate-800/80 border border-slate-750 text-white text-xs placeholder:text-slate-500 focus:outline-hidden focus:border-amber-400/60"
            />
          </div>

          {/* Station Feeders List */}
          <div className="space-y-2">
            {filteredStations.map((st) => {
              const isExpanded = expandedStationName === st.station;
              return (
                <div
                  key={st.station}
                  className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden transition"
                >
                  {/* Station Header Bar */}
                  <div
                    onClick={() => setExpandedStationName(isExpanded ? null : st.station)}
                    className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-sm">{lineEmoji[selectedLineCode] || '🚇'}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{st.station}</p>
                        <p className="text-[10px] text-slate-400">
                          {st.pandal_count} Linked Pujo Pandals
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-400/15 text-amber-300 border border-amber-400/30">
                        {st.pandals.length} pandals
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Feeder Pandals Grid */}
                  {isExpanded && (
                    <div className="p-3 pt-0 border-t border-slate-800/60 space-y-2 mt-1">
                      {/* Action to set route */}
                      {st.stationId && (
                        <div className="flex items-center gap-2 py-2">
                          <button
                            onClick={() => {
                              setFromId(st.stationId!);
                              setActiveTab('planner');
                            }}
                            className="flex-1 py-1.5 px-2.5 rounded-lg bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-300 text-[11px] font-semibold transition"
                          >
                            Set as Start ➔
                          </button>
                          <button
                            onClick={() => {
                              setToId(st.stationId!);
                              setActiveTab('planner');
                            }}
                            className="flex-1 py-1.5 px-2.5 rounded-lg bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 text-amber-300 text-[11px] font-semibold transition"
                          >
                            Set as Destination 🏁
                          </button>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {st.pandals.map((feeder, fIdx) => (
                          <div
                            key={fIdx}
                            onClick={() => {
                              if (feeder.matchedPandal) {
                                onSelectPandal(feeder.matchedPandal);
                              } else {
                                const fallbackPandal = PANDALS_DATA.find((p) =>
                                  p.name.en.toLowerCase().includes(feeder.name.toLowerCase())
                                );
                                if (fallbackPandal) onSelectPandal(fallbackPandal);
                              }
                            }}
                            className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-750/70 cursor-pointer transition flex items-center justify-between gap-2 active:scale-98"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-white truncate">
                                {feeder.name}
                              </p>
                              <p className="text-[10px] text-slate-400 truncate">
                                {feeder.matchedPandal
                                  ? `~${feeder.matchedPandal.walkingTimeToMetroMin}m walk from ${st.station}`
                                  : `Feeder from ${st.station}`}
                              </p>
                            </div>
                            <span className="text-[11px] text-amber-400 font-semibold shrink-0">
                              View →
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Static Informational Footer Banner */}
      <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center text-xs text-slate-400 font-medium">
        <span>🚇 {t.pujoSpecialMetroNotice || 'Pujo Special: Night services till 4:00 AM | Base Fare: ₹5'}</span>
      </div>
    </div>
  );
};
