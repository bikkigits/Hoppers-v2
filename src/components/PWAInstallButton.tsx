import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { ArrowDownToLine, Smartphone, X, Share, Download } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface Props {
  language: Language;
}

export const PWAInstallButton: React.FC<Props> = ({ language }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const t = TRANSLATIONS[language];

  if (isInstalled) {
    return null;
  }

  return (
    <>
      {isInstallable && (
        <button
          id="pwa-install-btn"
          onClick={install}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 shadow-xs active:scale-95 transition"
          title={t.installApp}
          aria-label={t.installApp}
        >
          <ArrowDownToLine className="w-4 h-4" />
        </button>
      )}

      {isIOS && !isInstallable && (
        <button
          id="pwa-ios-install-btn"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 shadow-xs active:scale-95 transition"
          title={t.installIos}
          aria-label={t.installIos}
        >
          <ArrowDownToLine className="w-4 h-4" />
        </button>
      )}

      {showIOSGuide && (
        <div
          id="pwa-ios-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in"
        >
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-lg">🪔</span>
                <h3 className="font-semibold text-white text-sm">{t.iosGuideTitle}</h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5 text-sm text-slate-300">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-750">
                <div className="p-2 rounded-lg bg-amber-400/15 text-amber-400 shrink-0">
                  <Share className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-white text-xs">{t.iosStep1}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Found in Safari navigation toolbar.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/60 border border-slate-750">
                <div className="p-2 rounded-lg bg-amber-400/15 text-amber-400 shrink-0">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-white text-xs">{t.iosStep2}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Launches instantly and works offline.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-semibold text-xs active:scale-98 transition"
            >
              {t.closeSheet}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
