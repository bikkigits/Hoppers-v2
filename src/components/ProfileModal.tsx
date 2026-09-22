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
        className="relative w-full max-w-md bg-[#0F172A]/95 border border-amber-500/30 rounded-3xl p-6 text-slate-100 shadow-2xl backdrop-blur-xl max-h-[90vh] overflow-y-auto space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="close-profile-modal-btn"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-red-600/20 border border-amber-500/40 flex items-center justify-center text-2xl shadow-inner">
            🪔
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight font-serif flex items-center gap-1.5">
              Hoppers
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PWA
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {t.profileTitle}
            </p>
          </div>
        </div>

        {/* Hopper Status Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800/80 border border-white/10 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-2xl">
              {badgeIcon}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
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
            <span className="text-lg font-black text-amber-400">
              {Math.round((count / total) * 100)}%
            </span>
            <p className="text-[10px] text-slate-400">Completed</p>
          </div>
        </div>

        {/* CRITICAL BIBLE DISCLAIMER BOX */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/60 to-slate-900 border border-emerald-500/40 shadow-xl space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Zero-Server Privacy Guarantee</span>
          </div>
          <p className="text-xs font-semibold text-emerald-100 leading-relaxed">
            100% Free, Zero Login, Complete Privacy. Your data stays on your device.
          </p>
          <p className="text-[11px] text-slate-300 leading-normal">
            Hoppers has no cloud databases, no user tracking, and no external cookies. Your visits and preferences are saved exclusively in your browser's private local storage.
          </p>
        </div>

        {/* App Pillars */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            About Hoppers
          </h4>

          <div className="grid grid-cols-1 gap-2 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-start gap-2.5">
              <Compass className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Curated Kolkata Puja Trail</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Hand-crafted geo-coordinates for top heritage & theme pandals with nearest metro gates, crowd status, and walk times.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-white">Full Offline Autonomy</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Designed to survive dense cellular network blackout zones near puja crowds.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
          <span>Hoppers v2.0 • Kolkata Pujo 2026</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
