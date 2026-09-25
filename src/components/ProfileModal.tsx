import React from 'react';
import { Language, VisitedPandal } from '../types';
import { PANDALS_DATA } from '../data/mockData';
import { TRANSLATIONS } from '../data/translations';
import {
  X,
  ShieldCheck,
  Award,
  Sparkles,
  Lock,
  Heart,
  Compass,
  CheckCircle2,
  Share2,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  visitedList: VisitedPandal[];
}

export const ProfileModal: React.FC<Props> = ({
  isOpen,
  onClose,
  language,
  visitedList,
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[language];
  const total = PANDALS_DATA.length;
  const count = visitedList.length;

  let badgeTitle = t.badgeNovice;
  let badgeIcon = '🥉';
  if (count >= 7) {
    badgeTitle = t.badgeMaster;
    badgeIcon = '👑';
  } else if (count >= 3) {
    badgeTitle = t.badgePujoLover;
    badgeIcon = '🥈';
  }

  return (
    <div
      id="profile-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        id="profile-modal-content"
        className="relative w-full max-w-md bg-slate-900/95 border border-slate-800 rounded-3xl p-5 text-slate-100 shadow-2xl backdrop-blur-2xl max-h-[85vh] overflow-y-auto space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="close-profile-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl">
            🪔
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              Hoppers
              <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                Offline PWA
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {t.profileTitle}
            </p>
          </div>
        </div>

        {/* Hopper Status Card */}
        <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-750 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xl">
              {badgeIcon}
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">
                Hopper Rank
              </span>
              <h3 className="text-sm font-bold text-white">
                {badgeTitle}
              </h3>
              <p className="text-xs text-slate-400">
                {count} of {total} pandals hopped
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-base font-bold text-white tabular-nums">
              {Math.round((count / total) * 100)}%
            </span>
            <p className="text-[10px] text-slate-500">Completed</p>
          </div>
        </div>

        {/* Privacy Guarantee Box */}
        <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-1.5">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Zero-Server Privacy Guarantee</span>
          </div>
          <p className="text-xs font-medium text-slate-200 leading-snug">
            100% Free, Zero Login, Complete Privacy. Your data stays on your device.
          </p>
          <p className="text-[11px] text-slate-400 leading-normal">
            Hoppers has no cloud tracking, analytics, or external cookies. Your visits and preferences are stored exclusively in your browser's private local storage.
          </p>
        </div>

        {/* App Pillars */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            About Hoppers
          </h4>

          <div className="grid grid-cols-1 gap-2 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800 flex items-start gap-2.5">
              <Compass className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Curated Kolkata Puja Trail</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Accurate geo-coordinates for top heritage & theme pandals with nearest metro gates, crowd status, and walk times.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/30 border border-slate-800 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Full Offline Autonomy</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Works reliably in dense cellular network congestion and blackout areas.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Hoppers v2.0 • Kolkata Pujo 2026</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
