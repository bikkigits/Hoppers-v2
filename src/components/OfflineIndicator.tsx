import React, { useState, useEffect } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, CheckCircle2, X, DownloadCloud, HardDrive, Sparkles, MapPin, RefreshCw, Layers } from 'lucide-react';
import { Language } from '../types';
import { getOfflineCacheStats, precacheKolkataPujaTiles, clearOfflineTileCache, OfflineCacheStats } from '../utils/offlineCache';

interface Props {
  language: Language;
}

export const OfflineIndicator: React.FC<Props> = ({ language }) => {
  const isOnline = useOnlineStatus();
  const [dismissed, setDismissed] = useState(false);
  const [showCacheModal, setShowCacheModal] = useState(false);
  const [cacheStats, setCacheStats] = useState<OfflineCacheStats>({
    isSupported: true,
    cachedTilesCount: 0,
    isReady: false,
    estimatedSizeMB: '0.0',
  });
  const [isCaching, setIsCaching] = useState(false);
  const [cacheProgress, setCacheProgress] = useState<{ current: number; total: number; pct: number } | null>(null);

  // Refresh cache stats
  const refreshStats = async () => {
    const stats = await getOfflineCacheStats();
    setCacheStats(stats);
  };

  useEffect(() => {
    refreshStats();
  }, []);

  // Reset dismissed state if connection transitions from online to offline
  useEffect(() => {
    if (!isOnline) {
      setDismissed(false);
      refreshStats();
    }
  }, [isOnline]);

  const handleStartPrecache = async () => {
    if (isCaching) return;
    setIsCaching(true);
    setCacheProgress({ current: 0, total: 100, pct: 0 });

    try {
      await precacheKolkataPujaTiles((curr, tot, pct) => {
        setCacheProgress({ current: curr, total: tot, pct });
      });
      await refreshStats();
    } catch (err) {
      console.warn('Pre-cache error:', err);
    } finally {
      setIsCaching(false);
      setTimeout(() => {
        setCacheProgress(null);
      }, 3000);
    }
  };

  const handleClearCache = async () => {
    await clearOfflineTileCache();
    await refreshStats();
  };

  const messages = {
    offlineTitle: {
      en: 'Offline Survival Mode Active',
      bn: 'অফলাইন মোড সক্রিয়',
      hi: 'ऑफलाइन मोड सक्रिय',
    },
    offlineSubtitle: {
      en: 'All pandals, metro routes, and emergency SOS work seamlessly without internet.',
      bn: 'ইন্টারনেট ছাড়াই সমস্ত প্যান্ডেল, মেট্রো রুট ও জরুরি সাহায্য কাজ করছে।',
      hi: 'बिना इंटरनेट सभी पंडाल, मेट्रो रूट व आपातकालीन सेवा उपलब्ध हैं।',
    },
    manageCache: {
      en: 'Offline Map Cache',
      bn: 'অফলাইন ম্যাপ ক্যাশ',
      hi: 'ऑफलाइन मैप कैश',
    },
    downloadBtn: {
      en: 'Download Kolkata Puja Map Tiles',
      bn: 'কলকাতার পূজা ম্যাপ ডাউনলোড করুন',
      hi: 'कोलकाता पूजा मैप डाउनलोड करें',
    },
    downloading: {
      en: 'Caching Map Tiles...',
      bn: 'ম্যাপ টাইলস সংরক্ষণ করা হচ্ছে...',
      hi: 'मैप टाइल्स सहेजे जा रहे हैं...',
    },
    readyBadge: {
      en: '100% Offline Ready',
      bn: '১০০% অফলাইন প্রস্তুত',
      hi: '100% ऑफलाइन तैयार',
    },
    cachedText: {
      en: 'Kolkata map tiles stored locally',
      bn: 'কলকাতার ম্যাপ টাইলস অফলাইনে সংরক্ষিত',
      hi: 'कोलकाता मैप टाइल्स ऑफलाइन सहेजे गए',
    },
    close: {
      en: 'Close',
      bn: 'বন্ধ করুন',
      hi: 'बंद करें',
    },
  };

  return (
    <>
      {/* Offline Toast Banner */}
      {!isOnline && !dismissed && (
        <aside
          id="offline-banner"
          aria-label="Offline Mode Status"
          className="fixed top-[calc(var(--top-header-height)+var(--safe-top)+6px)] left-3 right-3 z-40 max-w-md mx-auto flex items-center justify-between gap-2.5 px-3.5 py-2 rounded-2xl bg-[#0F172A]/95 text-slate-200 text-xs shadow-2xl backdrop-blur-xl border border-amber-500/40 animate-fade-in"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
              <WifiOff className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-white text-[11px] leading-tight flex items-center gap-1.5">
                {messages.offlineTitle[language]}
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </p>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                {messages.offlineSubtitle[language]}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setShowCacheModal(true)}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 font-medium text-[10px] border border-slate-700 transition"
            >
              {messages.manageCache[language]}
            </button>
            <button
              onClick={() => setDismissed(true)}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded-md transition"
              aria-label="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      )}

      {/* Offline Cache & Service Worker Storage Modal */}
      {showCacheModal && (
        <div
          id="offline-cache-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in"
        >
          <div className="relative w-full max-w-sm bg-[#0F172A] border border-slate-800 rounded-3xl p-5 shadow-2xl text-slate-100 space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-rose-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    {messages.manageCache[language]}
                  </h3>
                  <p className="text-[10px] text-slate-400">Service Worker & Map Tile Cache</p>
                </div>
              </div>
              <button
                onClick={() => setShowCacheModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Offline Status Card */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium">Offline Readiness</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  {messages.readyBadge[language]}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  Cached Map Tiles:
                </span>
                <span className="font-bold text-white">
                  {cacheStats.cachedTilesCount} tiles ({cacheStats.estimatedSizeMB} MB)
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  Pandal Locations:
                </span>
                <span className="font-bold text-emerald-400">
                  100% Cached In-App
                </span>
              </div>
            </div>

            {/* Progress Bar during tile precaching */}
            {cacheProgress && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
                <div className="flex justify-between text-xs text-amber-300 font-medium">
                  <span className="flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    {messages.downloading[language]}
                  </span>
                  <span>{cacheProgress.pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-rose-500 transition-all duration-200"
                    style={{ width: `${cacheProgress.pct}%` }}
                  />
                </div>
                <p className="text-[10px] text-slate-400">
                  {cacheProgress.current} / {cacheProgress.total} tiles processed
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleStartPrecache}
                disabled={isCaching}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition disabled:opacity-50"
              >
                <DownloadCloud className="w-4 h-4" />
                {isCaching ? messages.downloading[language] : messages.downloadBtn[language]}
              </button>

              {cacheStats.cachedTilesCount > 0 && (
                <button
                  onClick={handleClearCache}
                  disabled={isCaching}
                  className="w-full py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-300 font-medium text-[11px] border border-slate-800 transition"
                >
                  Clear Cached Tiles ({cacheStats.estimatedSizeMB} MB)
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

