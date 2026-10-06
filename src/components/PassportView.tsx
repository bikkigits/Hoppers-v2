import React, { useState } from 'react';
import { Language, VisitedPandal, Pandal } from '../types';
import { PANDALS_DATA } from '../data/mockData';
import { TRANSLATIONS } from '../data/translations';
import { calculateDistanceKm } from '../utils/geo';
import confetti from 'canvas-confetti';
import {
  Award,
  Sparkles,
  CheckCircle2,
  Trash2,
  Share2,
  MapPin,
  Calendar,
  Compass,
  Lock,
  WifiOff,
} from 'lucide-react';

interface Props {
  language: Language;
  visitedList: VisitedPandal[];
  onSelectPandal: (pandal: Pandal) => void;
  onClearPassport: () => void;
  onOpenMap: () => void;
  userCoords?: { lat: number; lng: number } | null;
  onToggleVisited?: (pandalId: string) => void;
}

export const PassportView: React.FC<Props> = ({
  language,
  visitedList,
  onSelectPandal,
  onClearPassport,
  onOpenMap,
  userCoords,
  onToggleVisited,
}) => {
  const t = TRANSLATIONS[language];
  const total = PANDALS_DATA.length;
  const count = visitedList.length;
  const percentage = Math.round((count / total) * 100);

  // Offline Manual Override State for Dead Zones or GPS-denied environments
  const [offlineOverride, setOfflineOverride] = useState(false);
  const [activeTab, setActiveTab] = useState<'stamped' | 'nearby'>('stamped');

  // Gamification Tier Badge
  let badgeTitle = t.badgeNovice;
  let badgeIcon = '🥉';
  let badgeColor = 'from-amber-700 to-amber-900 border-amber-600/40';

  if (count >= 7) {
    badgeTitle = t.badgeMaster;
    badgeIcon = '👑';
    badgeColor = 'from-amber-400/30 to-yellow-600/30 border-amber-400 shadow-amber-500/20';
  } else if (count >= 3) {
    badgeTitle = t.badgePujoLover;
    badgeIcon = '🥈';
    badgeColor = 'from-slate-700 to-slate-800 border-slate-400/40';
  }

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFB300', '#E53935', '#FFF', '#10B981'],
      });
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <div
      id="passport-view"
      className="w-full max-w-2xl mx-auto px-4 pt-3 pb-[calc(var(--bottom-dock-height)+var(--safe-bottom)+24px)] h-full overflow-y-auto overscroll-y-contain"
    >
      {/* Passport Identity Header */}
      <div className="relative overflow-hidden rounded-2xl p-5 bg-slate-900/80 border border-slate-800 shadow-sm mb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-[10px] font-semibold tracking-wider uppercase text-amber-400 block mb-1">
              Kolkata Durga Puja 2026 Trail
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {t.passportTitle}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 max-w-md">
              {t.passportSubtitle}
            </p>
          </div>

          <div
            onClick={triggerCelebration}
            className="cursor-pointer p-2.5 rounded-xl bg-slate-800/80 border border-slate-750 text-center shadow-xs transition hover:bg-slate-800 shrink-0"
          >
            <div className="text-xl">{badgeIcon}</div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-300 mt-0.5">
              {badgeTitle}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5 font-medium">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              {t.pandalsStamped}: <span className="text-white font-semibold tabular-nums">{count}</span> / {total}
            </span>
            <span className="text-amber-400 font-semibold tabular-nums">{percentage}%</span>
          </div>

          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-amber-400 transition-all duration-500"
              style={{ width: `${Math.max(3, percentage)}%` }}
            />
          </div>
        </div>

        {/* Offline Manual Override Toggle (@Agent-Engagement Invariant) */}
        <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 bg-slate-800/40 p-2.5 rounded-xl border border-slate-750">
          <div className="flex items-center gap-2 min-w-0">
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-200">
                Offline Manual Override (Dead Zone / GPS Denied)
              </p>
              <p className="text-[10px] text-slate-400">
                Self-report stamps if GPS signal is blocked by crowds or underground
              </p>
            </div>
          </div>
          <button
            onClick={() => setOfflineOverride(!offlineOverride)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition shrink-0 ${
              offlineOverride
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
            }`}
          >
            {offlineOverride ? 'Override ON' : 'Override OFF'}
          </button>
        </div>

        {/* WhatsApp Share My Achievements Button */}
        <div className="mt-3.5 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-slate-400 font-normal">
            Share your festival trail progress with friends
          </div>
          <button
            id="share-achievements-whatsapp-btn"
            onClick={() => {
              triggerCelebration();
              const text = `🏆 I've hopped ${count} of ${total} iconic Durga Puja pandals in Kolkata with Hoppers! My rank: "${badgeTitle}". Can you beat my score? Check out the offline Hoppers guide: ${window.location.href}`;
              window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 active:scale-95 text-slate-200 hover:text-white font-medium text-xs border border-slate-700 transition"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.shareAchievements}</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs: Stamped Collection vs Proximity Stamp Hub */}
      <div className="flex items-center gap-2 p-1 bg-slate-900/90 border border-slate-800 rounded-xl mb-4">
        <button
          onClick={() => setActiveTab('stamped')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition ${
            activeTab === 'stamped'
              ? 'bg-amber-400 text-slate-950 shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🏆 Stamped ({count})
        </button>
        <button
          onClick={() => setActiveTab('nearby')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'nearby'
              ? 'bg-emerald-500 text-slate-950 shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>✨</span>
          <span>Proximity Stamp Hub (100m)</span>
        </button>
      </div>

      {/* Visited Stamped Stamps Section */}
      {activeTab === 'stamped' ? (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Stamped Pandals ({count})
          </h3>

          {count > 0 && (
            <button
              onClick={() => {
                if (window.confirm(t.confirmReset)) {
                  onClearPassport();
                }
              }}
              className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 py-1 px-2 rounded-md hover:bg-rose-500/10 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.clearPassport}</span>
            </button>
          )}
        </div>

        {count === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-2xl mx-auto">
              🪔
            </div>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              {t.noVisitsYet}
            </p>
            <button
              onClick={onOpenMap}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs transition active:scale-95 shadow-xs"
            >
              <Compass className="w-4 h-4" />
              <span>Start Hopping on Map</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {visitedList.map((visit) => {
              const pandal = PANDALS_DATA.find((p) => p.id === visit.pandalId);
              if (!pandal) return null;

              return (
                <div
                  key={visit.pandalId}
                  onClick={() => onSelectPandal(pandal)}
                  className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition cursor-pointer shadow-xs group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block mb-0.5">
                        Verified Visit
                      </span>
                      <h4 className="text-sm font-bold text-white leading-snug truncate">
                        {pandal.name[language] || pandal.name.en}
                      </h4>
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {pandal.theme[language] || pandal.theme.en}
                      </p>
                    </div>

                    <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                    <div className="flex items-center gap-1 truncate">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      <span>
                        {new Date(visit.timestamp).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        •{' '}
                        {new Date(visit.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <span className="text-amber-400 font-medium group-hover:underline">
                      Details →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      ) : (
        /* PROXIMITY STAMP HUB VIEW (100m Proximity Engine) */
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <span>🧭</span>
              Nearby Pandals to Stamp (Sorted by Distance)
            </h3>
            {offlineOverride && (
              <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                Manual Override Active
              </span>
            )}
          </div>

          <div className="space-y-2">
            {PANDALS_DATA.map((pandal) => {
              const isStamped = visitedList.some((v) => v.pandalId === pandal.id);
              const refCoords = userCoords || { lat: 22.5645, lng: 88.3516 };
              const distM = calculateDistanceKm(refCoords.lat, refCoords.lng, pandal.lat, pandal.lng) * 1000;
              const isWithin100m = distM <= 100;
              const canStamp = !isStamped && (isWithin100m || offlineOverride);

              return { pandal, isStamped, distM, canStamp };
            })
              .sort((a, b) => {
                if (a.canStamp && !b.canStamp) return -1;
                if (!a.canStamp && b.canStamp) return 1;
                return a.distM - b.distM;
              })
              .slice(0, 30)
              .map(({ pandal, isStamped, distM, canStamp }) => (
                <div
                  key={pandal.id}
                  onClick={() => onSelectPandal(pandal)}
                  className={`p-3 rounded-2xl border transition flex items-center justify-between gap-3 cursor-pointer ${
                    canStamp
                      ? 'bg-slate-900/90 border-emerald-500/40 shadow-sm shadow-emerald-500/10'
                      : isStamped
                      ? 'bg-slate-900/60 border-slate-800 opacity-75'
                      : 'bg-slate-900/80 border-slate-800'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-white truncate">
                        {pandal.name[language] || pandal.name.en}
                      </h4>
                      <span className="text-[10px] text-slate-500">• {pandal.zone}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {distM >= 1000 ? `${(distM / 1000).toFixed(1)} km away` : `${Math.round(distM)}m away`} · Metro: {pandal.nearestMetro}
                    </p>
                  </div>

                  <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                    {isStamped ? (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Stamped</span>
                      </span>
                    ) : canStamp ? (
                      <button
                        onClick={() => {
                          triggerCelebration();
                          onToggleVisited?.(pandal.id);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/25 animate-pulse flex items-center gap-1.5 transition active:scale-95"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Collect Stamp</span>
                      </button>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-500 border border-slate-750 text-[11px] font-medium flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-500" />
                        <span>Within 100m to Stamp</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Unstamped Remaining Pandals Summary */}
      {count < total && activeTab === 'stamped' && (
        <div className="mt-6 space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Unstamped Pandals ({total - count})
            </h3>
            <button
              onClick={() => setActiveTab('nearby')}
              className="text-xs text-amber-400 hover:underline font-medium"
            >
              Open Proximity Hub →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PANDALS_DATA.filter((p) => !visitedList.some((v) => v.pandalId === p.id))
              .slice(0, 10)
              .map((pandal) => {
                const refCoords = userCoords || { lat: 22.5645, lng: 88.3516 };
                const distM = calculateDistanceKm(refCoords.lat, refCoords.lng, pandal.lat, pandal.lng) * 1000;
                const isWithin100m = distM <= 100;
                const canStamp = isWithin100m || offlineOverride;

                return (
                  <div
                    key={pandal.id}
                    onClick={() => onSelectPandal(pandal)}
                    className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-850 border border-slate-800/80 hover:border-slate-750 cursor-pointer transition flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-200 truncate">
                        {pandal.name[language] || pandal.name.en}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {pandal.zone} · {distM >= 1000 ? `${(distM / 1000).toFixed(1)}km` : `${Math.round(distM)}m`}
                      </p>
                    </div>
                    {canStamp ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerCelebration();
                          onToggleVisited?.(pandal.id);
                        }}
                        className="px-2 py-1 rounded-lg bg-emerald-400 text-slate-950 font-bold text-[11px] shrink-0"
                      >
                        ✨ Stamp
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-medium shrink-0 flex items-center gap-1">
                        <Lock className="w-3 h-3 text-slate-600" />
                        <span>100m</span>
                      </span>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};
