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
      className="w-full max-w-3xl mx-auto px-4 pt-4 pb-28 min-h-[calc(100vh-62px)]"
    >
      {/* Passport Identity Booklet Header */}
      <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-slate-900 via-slate-900 to-[#1A1F2C] border-2 border-amber-500/30 shadow-2xl mb-6">
        {/* Decorative Golden Corner Accents */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-500/60" />
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-500/60" />
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-500/60" />
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-500/60" />

        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">📜</span>
              <span className="text-[11px] font-bold tracking-widest uppercase text-amber-400">
                Official Durga Puja 2026 Trail
              </span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight font-serif">
              {t.passportTitle}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-md">
              {t.passportSubtitle}
            </p>
          </div>

          <div
            onClick={triggerCelebration}
            className={`cursor-pointer p-3 rounded-2xl bg-gradient-to-b ${badgeColor} border text-center shadow-lg transition transform hover:scale-105 shrink-0`}
          >
            <div className="text-2xl">{badgeIcon}</div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-300 mt-1">
              {badgeTitle}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400" />
              {t.pandalsStamped}: {count} / {total}
            </span>
            <span className="text-amber-400">{percentage}%</span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-800/90 overflow-hidden p-0.5 border border-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 transition-all duration-500 shadow-sm"
              style={{ width: `${Math.max(4, percentage)}%` }}
            />
          </div>
        </div>

        {/* WhatsApp Share My Achievements Button */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-300 font-medium">
            Celebrate your festive pandal hopping journey with friends!
          </div>
          <button
            id="share-achievements-whatsapp-btn"
            onClick={() => {
              triggerCelebration();
              const text = `🏆 I've hopped ${count} of ${total} iconic Durga Puja pandals in Kolkata with Hoppers! My rank: "${badgeTitle}". Can you beat my score? Check out the offline Hoppers guide: ${window.location.href}`;
              window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 border border-emerald-400/40 transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{t.shareAchievements}</span>
          </button>
        </div>
      </div>

      {/* Visited Stamped Stamps Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Stamped Pandals ({count})
          </h3>

          {count > 0 && (
            <button
              onClick={() => {
                if (window.confirm(t.confirmReset)) {
                  onClearPassport();
                }
              }}
              className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 py-1 px-2 rounded-lg hover:bg-rose-500/10 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.clearPassport}</span>
            </button>
          )}
        </div>

        {count === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/60 border border-white/10 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-3xl mx-auto">
              🪔
            </div>
            <p className="text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
              {t.noVisitsYet}
            </p>
            <button
              onClick={onOpenMap}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition shadow-lg active:scale-95"
            >
              <Compass className="w-4 h-4" />
              <span>Start Hopping on Map</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {visitedList.map((visit) => {
              const pandal = PANDALS_DATA.find((p) => p.id === visit.pandalId);
              if (!pandal) return null;

              return (
                <div
                  key={visit.pandalId}
                  onClick={() => onSelectPandal(pandal)}
                  className="relative p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 hover:border-amber-400 transition cursor-pointer shadow-xl overflow-hidden group"
                >
                  {/* Decorative Stamp Watermark */}
                  <div className="absolute -right-3 -bottom-3 select-none pointer-events-none opacity-20 group-hover:opacity-35 transition">
                    <div className="w-20 h-20 rounded-full border-4 border-dashed border-amber-400 flex items-center justify-center text-xs font-black text-amber-400 transform rotate-[-20deg]">
                      HOPPED
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-block mb-1">
                        Verified Stamp
                      </span>
                      <h4 className="text-base font-bold text-white leading-snug truncate">
                        {pandal.name[language] || pandal.name.en}
                      </h4>
                      <p className="text-xs text-amber-300 font-medium truncate mt-0.5">
                        {pandal.theme[language] || pandal.theme.en}
                      </p>
                    </div>

                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-1 truncate">
                      <Calendar className="w-3 h-3 text-slate-400" />
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

                    <span className="text-amber-400 font-semibold group-hover:underline">
                      View Details →
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
        <div className="mt-8 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Pandals Waiting to be Stamped ({total - count})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {PANDALS_DATA.filter((p) => !visitedList.some((v) => v.pandalId === p.id)).map((pandal) => (
              <div
                key={pandal.id}
                onClick={() => onSelectPandal(pandal)}
                className="p-3 rounded-xl bg-slate-900/50 hover:bg-slate-800/80 border border-white/5 hover:border-white/15 cursor-pointer transition flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-200 truncate">
                    {pandal.name[language] || pandal.name.en}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {pandal.zone} • {pandal.nearestMetro}
                  </p>
                </div>
                <span className="text-xs text-amber-400 font-bold shrink-0">
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
