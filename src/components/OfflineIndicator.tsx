import React, { useState } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, CheckCircle2, X } from 'lucide-react';
import { Language } from '../types';

interface Props {
  language: Language;
}

export const OfflineIndicator: React.FC<Props> = ({ language }) => {
  const isOnline = useOnlineStatus();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const messages = {
    offline: {
      en: 'Offline Mode — All maps, pandals, and metro routes work seamlessly without internet.',
      bn: 'অফলাইন মোড সক্রিয় — ইন্টারনেট ছাড়াই সমস্ত ম্যাপ, প্যান্ডেল ও মেট্রো রুট কাজ করছে।',
      hi: 'ऑफलाइन मोड सक्रिय — बिना इंटरनेट सभी मैप, पंडाल व मेट्रो रूट सुचारू हैं।',
    },
  };

  if (!isOnline) {
    return (
      <div
        id="offline-banner"
        className="fixed top-16 left-3 right-3 z-40 max-w-md mx-auto flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-amber-500/90 text-slate-950 font-medium text-xs shadow-lg backdrop-blur-md border border-amber-300/30"
      >
        <div className="flex items-center gap-2">
          <WifiOff className="w-4 h-4 shrink-0 text-slate-950 animate-pulse" />
          <span>{messages.offline[language]}</span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-black/10 rounded-full transition"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return null;
};
