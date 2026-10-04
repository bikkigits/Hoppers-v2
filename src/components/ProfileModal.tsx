import React from 'react';
import { Language, VisitedPandal } from '../types';
import { PANDALS_DATA } from '../data/mockData';
import { TRANSLATIONS } from '../data/translations';
import { PWAInstallButton } from './PWAInstallButton';
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
  Moon,
  Sun,
  BatteryLow,
  Download,
  Globe,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLanguageChange?: (lang: Language) => void;
  visitedList: VisitedPandal[];
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  onOpenOnboarding?: () => void;
}

export const ProfileModal: React.FC<Props> = ({
  isOpen,
  onClose,
  language,
  onLanguageChange,
  visitedList,
  theme = 'dark',
  onToggleTheme,
  onOpenOnboarding,
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

        {/* Quick App Preferences & Install */}
        <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-750 space-y-3">
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Preferences & App Settings
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {/* Theme Switcher */}
            {onToggleTheme && (
              <button
                id="modal-theme-toggle"
                onClick={onToggleTheme}
                className="p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-900 border border-slate-700/80 flex items-center gap-2 text-left transition active:scale-95"
              >
                <div className="p-1.5 rounded-lg bg-amber-400/15 text-amber-400 shrink-0">
                  <Moon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white">
                    {theme === 'light' ? 'Light Theme' : 'Dark Theme'}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    Tap to switch
                  </p>
                </div>
              </button>
            )}

            {/* Language Switcher Card (Right slot of 2-col grid) */}
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 flex flex-col justify-between">
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="p-1 rounded-md bg-amber-400/15 text-amber-400 shrink-0">
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-semibold text-white">
                  {language === 'bn' ? 'ভাষা নির্বাচন' : language === 'hi' ? 'भाषा चुनें' : 'Language'}
                </span>
              </div>
              <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => onLanguageChange?.('en')}
                  className={`flex-1 py-1 text-[11px] rounded-md transition font-bold ${
                    language === 'en'
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => onLanguageChange?.('bn')}
                  className={`flex-1 py-1 text-[11px] rounded-md transition font-bold ${
                    language === 'bn'
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  বাং
                </button>
                <button
                  type="button"
                  onClick={() => onLanguageChange?.('hi')}
                  className={`flex-1 py-1 text-[11px] rounded-md transition font-bold ${
                    language === 'hi'
                      ? 'bg-amber-400 text-slate-950 shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  हिं
                </button>
              </div>
            </div>
          </div>

          {/* Offline PWA Install Button (if available) */}
          <PWAInstallButton language={language} />

          {/* Re-open Feature Tour */}
          {onOpenOnboarding && (
            <button
              id="reopen-onboarding-btn"
              onClick={() => {
                onClose();
                onOpenOnboarding();
              }}
              className="w-full p-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-900 border border-amber-500/30 flex items-center justify-between text-left transition active:scale-98"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-amber-400/20 text-amber-400 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">
                    {language === 'bn' ? 'অ্যাপের প্রধান বৈশিষ্ট্যসমূহ দেখুন' : language === 'hi' ? 'ऐप की मुख्य विशेषताएं देखें' : 'View App Feature Tour'}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    720+ Pandals · 5 Metro Lines · Offline Trail Planner
                  </p>
                </div>
              </div>
              <span className="text-xs text-amber-400 font-bold">→</span>
            </button>
          )}

          <p className="text-[10px] text-amber-300/80 flex items-center gap-1.5">
            <BatteryLow className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Battery saver tip: Keep in Dark Mode for longer battery life during night hopping.</span>
          </p>
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
