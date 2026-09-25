import React from 'react';
import { Language, VisitedPandal, Pandal } from '../types';
import { PANDALS_DATA } from '../data/mockData';
import { TRANSLATIONS } from '../data/translations';
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
} from 'lucide-react';

interface Props {
  language: Language;
  visitedList: VisitedPandal[];
  onSelectPandal: (pandal: Pandal) => void;
  onClearPassport: () => void;
  onOpenMap: () => void;
}

export const PassportView: React.FC<Props> = ({
  language,
  visitedList,
  onSelectPandal,
  onClearPassport,
  onOpenMap,
}) => {
  const t = TRANSLATIONS[language];
  const total = PANDALS_DATA.length;
  const count = visitedList.length;
  const percentage = Math.round((count / total) * 100);

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
      className="w-full max-w-2xl mx-auto px-4 pt-4 pb-28 min-h-[calc(100vh-62px)]"
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

        {/* WhatsApp Share My Achievements Button */}
        <div className="mt-4 pt-3.5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
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

      {/* Visited Stamped Stamps Section */}
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

      {/* Unstamped Remaining Pandals Preview */}
      {count < total && (
        <div className="mt-6 space-y-2.5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Pandals to Stamp ({total - count})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {PANDALS_DATA.filter((p) => !visitedList.some((v) => v.pandalId === p.id)).map((pandal) => (
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
                    {pandal.zone} · {pandal.nearestMetro}
                  </p>
                </div>
                <span className="text-xs text-amber-400 font-medium shrink-0">
                  Stamp →
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
