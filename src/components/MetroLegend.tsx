import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Train, X, Waves, RefreshCw, Sparkles } from 'lucide-react';
import { Language, MetroLine, MetroLineMeta } from '../types';
import { METRO_LINES } from '../data/metroStations';
import { TRANSLATIONS } from '../data/translations';

interface MetroLegendProps {
  language: Language;
  isolatedLine: MetroLine | null;
  onSelectLine: (lineId: MetroLine | null) => void;
  isOpen?: boolean;
  onToggleOpen?: (open: boolean) => void;
  className?: string;
}

export const MetroLegend: React.FC<MetroLegendProps> = ({
  language,
  isolatedLine,
  onSelectLine,
  isOpen: controlledIsOpen,
  onToggleOpen,
  className = '',
}) => {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isExpanded = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const toggleExpanded = () => {
    const nextState = !isExpanded;
    if (onToggleOpen) {
      onToggleOpen(nextState);
    } else {
      setInternalIsOpen(nextState);
    }
  };

  const t = TRANSLATIONS[language] || TRANSLATIONS.en;

  return (
    <div
      id="metro-legend-container"
      className={`pointer-events-auto transition-all duration-300 ${className}`}
      aria-label="Kolkata Metro Legend"
    >
      {!isExpanded ? (
        /* Collapsed Glassmorphic Pill */
        <button
          id="metro-legend-collapsed-pill"
          type="button"
          onClick={toggleExpanded}
          className="group flex items-center gap-2.5 px-3 py-2 rounded-2xl bg-slate-900/90 hover:bg-slate-900 text-white backdrop-blur-md border border-slate-700/80 shadow-2xl shadow-black/80 hover:border-blue-500/60 transition-all active:scale-95 min-h-[44px]"
          title={language === 'bn' ? 'মেট্রো রুট দেখুন' : language === 'hi' ? 'मेट्रो रूट देखें' : 'View Metro Lines'}
          aria-expanded={false}
        >
          <div className="flex items-center justify-center w-7 h-7 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-500/30 shrink-0">
            <Train className="w-3.5 h-3.5" />
          </div>

          <div className="flex flex-col items-start text-left">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-100 leading-tight tracking-wide">
                {language === 'bn' ? 'মেট্রো রুট' : language === 'hi' ? 'मेट्रो रूट' : 'Metro Lines'}
              </span>
              {isolatedLine && (
                <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/40">
                  {language === 'bn' ? 'নির্বাচিত' : language === 'hi' ? 'पृथक' : '1 Active'}
                </span>
              )}
            </div>

            {/* 5 Line Color Dots */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB] shadow-sm ring-1 ring-white/30" title="Blue Line (Line 1)" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-sm ring-1 ring-white/30" title="Green Line (Line 2)" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#9333EA] shadow-sm ring-1 ring-white/30" title="Purple Line (Line 3)" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#F97316] shadow-sm ring-1 ring-white/30" title="Orange Line (Line 6)" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#EAB308] shadow-sm ring-1 ring-white/30" title="Yellow Line (Line 4)" />
              <span className="text-[9px] font-semibold text-slate-400 ml-0.5">5</span>
            </div>
          </div>

          <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 group-hover:text-white flex items-center justify-center ml-0.5 shrink-0 transition">
            <ChevronDown className="w-3.5 h-3.5" />
          </div>
        </button>
      ) : (
        /* Expanded Detailed Card */
        <div
          id="metro-legend-expanded-card"
          className="w-72 sm:w-80 rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 shadow-2xl shadow-black/90 p-3.5 text-white animate-fade-in flex flex-col max-h-[75vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-500/20">
                <Train className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-100 leading-tight">
                  {t.metroNetworkTitle || 'Kolkata Metro Network'}
                </h4>
                <p className="text-[10px] text-slate-400 font-medium">
                  {language === 'bn'
                    ? '৫টি করিডোর ও ইন্টারচেঞ্জ সংযোগ'
                    : language === 'hi'
                    ? '5 गलियारे और इंटरचेंज कनेक्शन'
                    : '5 Corridors & Interchanges'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {isolatedLine && (
                <button
                  type="button"
                  onClick={() => onSelectLine(null)}
                  className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-semibold flex items-center gap-1 transition border border-slate-700 active:scale-95"
                  title="Show all corridors"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{language === 'bn' ? 'সব' : language === 'hi' ? 'सभी' : 'All'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={toggleExpanded}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition border border-slate-700 active:scale-95"
                title="Collapse Legend"
                aria-label="Collapse Legend"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subtitle / Hint */}
          <div className="py-1.5 text-[10px] text-slate-400 flex items-center justify-between shrink-0">
            <span className="flex items-center gap-1 text-slate-300">
              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
              <span>
                {language === 'bn'
                  ? 'করিডোর জুম করতে লাইনে ট্যাপ করুন'
                  : language === 'hi'
                  ? 'कॉरिडोर ज़ूम करने के लिए लाइन पर टैप करें'
                  : 'Tap line to isolate corridor & zoom'}
              </span>
            </span>
          </div>

          {/* Lines List */}
          <div className="space-y-1.5 overflow-y-auto pr-1 my-1 flex-1 custom-scrollbar">
            {METRO_LINES.map((line: MetroLineMeta) => {
              const isIsolated = isolatedLine === line.id;
              const isDimmed = isolatedLine !== null && !isIsolated;

              return (
                <button
                  key={line.id}
                  type="button"
                  onClick={() => onSelectLine(isIsolated ? null : line.id)}
                  className={`w-full text-left p-2 rounded-xl transition-all flex items-center justify-between gap-2 border min-h-[44px] ${
                    isIsolated
                      ? 'bg-slate-800/95 border-blue-400/80 shadow-md ring-1 ring-blue-400/40'
                      : isDimmed
                      ? 'bg-slate-900/40 opacity-40 border-transparent hover:opacity-80 hover:bg-slate-800/40'
                      : 'bg-slate-800/50 hover:bg-slate-800 border-slate-800/80 hover:border-slate-700'
                  }`}
                  aria-pressed={isIsolated}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 mt-0.5 ring-2 ring-white/40 shadow-sm"
                      style={{ backgroundColor: line.color }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[11px] font-bold text-slate-100 truncate">
                          {line.name[language] || line.name.en}
                        </span>
                        {line.id === 'green' && (
                          <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 flex items-center gap-0.5">
                            <Waves className="w-2.5 h-2.5" />
                            <span>Ganga Tunnel</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[9.5px] text-slate-400 truncate leading-snug">
                        {line.terminalStart[language] || line.terminalStart.en} ↔ {line.terminalEnd[language] || line.terminalEnd.en}
                      </p>
                      {/* Detailed Corridor Description */}
                      <p className="text-[8.5px] text-slate-500 line-clamp-1 mt-0.5">
                        {line.corridor[language] || line.corridor.en}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 ml-1">
                    <span
                      className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md text-white shadow-sm"
                      style={{
                        backgroundColor: isIsolated ? line.color : 'rgba(51, 65, 85, 0.8)',
                      }}
                    >
                      {line.stationsCount} {language === 'bn' ? 'টি' : language === 'hi' ? 'स्टेशन' : 'stns'}
                    </span>
                    {isIsolated && (
                      <span className="text-[8px] font-black text-blue-400 mt-0.5">
                        ✓ {language === 'bn' ? 'সক্রিয়' : language === 'hi' ? 'सक्रिय' : 'Active'}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Interchange & Special Indicator Footers */}
          <div className="mt-2 pt-2 border-t border-slate-800/80 space-y-1.5 text-[9.5px] shrink-0">
            {/* Ganga River Under-water Segment */}
            <div className="flex items-center gap-2 p-1.5 rounded-lg bg-cyan-950/40 border border-cyan-900/50 text-cyan-200">
              <span className="w-3 h-1.5 rounded-full bg-cyan-400 inline-block shrink-0 shadow-sm shadow-cyan-400/50" />
              <span className="leading-tight">
                <span className="text-cyan-300 font-bold">
                  {language === 'bn' ? 'গঙ্গার নদীগর্ভ টানেল:' : language === 'hi' ? 'हुगली नदी सुरंग:' : 'Underwater Tunnel:'}
                </span>{' '}
                Howrah ↔ Mahakaran (520m under river)
              </span>
            </div>

            {/* Interchange Hubs */}
            <div className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-800/40 border border-slate-800 text-slate-300">
              <span className="w-4 h-4 rounded-full border border-white bg-slate-900 text-white font-black text-[9px] flex items-center justify-center shrink-0 shadow-sm">
                ⇄
              </span>
              <span className="leading-tight">
                <span className="text-slate-100 font-bold">
                  {language === 'bn' ? 'ইন্টারচেঞ্জ হাব:' : language === 'hi' ? 'ट्रांसफर जंक्शन:' : 'Transfer Hubs:'}
                </span>{' '}
                Esplanade · Kavi Subhash · Noapara
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
