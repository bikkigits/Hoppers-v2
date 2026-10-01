import React from 'react';
import { CrowdLevel, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

/**
 * Global feature flag to switch between placeholder fallback mode ("No updates yet")
 * and dynamic live crowd status tiers ('Low Crowd', 'Moderate Crowd', 'Heavy Crowd', 'Extreme Rush').
 * 
 * When set to false (default), all pandal cards and sheets render the neutral "No updates yet" badge.
 * Set to true when live on-ground crowd tracking commences.
 */
export const ENABLE_LIVE_CROWD_TIERS = false;

export interface CrowdBadgeConfig {
  bg: string;
  dot: string;
  label: string;
  isLive?: boolean;
}

/**
 * Returns badge styling and localized label for crowd status.
 * Preserves the full underlying data model and allows easy reactivation of dynamic tiers.
 */
export function getCrowdBadge(
  crowdLevel: CrowdLevel | string | undefined,
  language: Language = 'en',
  options: {
    forceLive?: boolean;
    isCrowdsourced?: boolean;
    placeholderText?: string;
  } = {}
): CrowdBadgeConfig {
  const t = TRANSLATIONS[language] || TRANSLATIONS.en;
  const isLiveActive = options.forceLive ?? ENABLE_LIVE_CROWD_TIERS;

  // 1. Universal Fallback / Placeholder Layer (Active by default)
  if (!isLiveActive) {
    return {
      bg: 'bg-slate-800/80 text-slate-400 border-slate-700/60',
      dot: 'bg-slate-400/80 animate-pulse',
      label: options.placeholderText || t.crowdNoUpdates || 'No updates yet',
      isLive: false,
    };
  }

  // 2. Dynamic Live Crowd Tiers (Preserved & Re-activatable)
  switch (crowdLevel) {
    case 'Low':
      return {
        bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
        dot: 'bg-emerald-400',
        label: t.crowdLow || 'Low Crowd',
        isLive: !!options.isCrowdsourced,
      };
    case 'Moderate':
      return {
        bg: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
        dot: 'bg-amber-400',
        label: t.crowdModerate || 'Moderate Crowd',
        isLive: !!options.isCrowdsourced,
      };
    case 'Heavy':
      return {
        bg: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
        dot: 'bg-orange-400',
        label: t.crowdHeavy || 'Heavy Crowd',
        isLive: !!options.isCrowdsourced,
      };
    case 'Extreme':
    default:
      return {
        bg: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
        dot: 'bg-rose-400 animate-pulse',
        label: t.crowdExtreme || 'Extreme Rush',
        isLive: !!options.isCrowdsourced,
      };
  }
}

export interface CrowdStatusBadgeProps {
  crowdLevel?: CrowdLevel | string;
  language?: Language;
  className?: string;
  isCrowdsourced?: boolean;
  forceLive?: boolean;
  placeholderText?: string;
  size?: 'sm' | 'xs';
}

/**
 * Universal crowd badge renderer component with clean, neutral muted styling.
 * Maintains consistent font size, pill padding, and alignment across all cards.
 */
export const CrowdStatusBadge: React.FC<CrowdStatusBadgeProps> = ({
  crowdLevel,
  language = 'en',
  className = '',
  isCrowdsourced = false,
  forceLive = false,
  placeholderText,
  size = 'xs',
}) => {
  const badge = getCrowdBadge(crowdLevel, language, { forceLive, isCrowdsourced, placeholderText });
  const sizeClasses = size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-2 py-0.5 text-[10px]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-medium border transition-colors shadow-xs ${sizeClasses} ${badge.bg} ${className}`}
      title={badge.label}
    >
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${badge.dot}`} />
      <span className="truncate">{badge.label}</span>
      {badge.isLive && (
        <span className="text-[8px] font-bold text-amber-300 bg-amber-400/25 px-1 rounded-sm">
          Live
        </span>
      )}
    </span>
  );
};
