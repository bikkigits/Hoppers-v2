import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import {
  ShieldAlert,
  PhoneCall,
  X,
  AlertTriangle,
  HeartPulse,
  Users,
  CheckCircle,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const EmergencySOSSheet: React.FC<Props> = ({
  isOpen,
  onClose,
  language,
}) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[language];

  const emergencyContacts = [
    {
      number: '100',
      label: t.policeControl,
      subtext: 'Kolkata Police Control Room & Missing Persons',
      icon: <ShieldAlert className="w-5 h-5 text-red-400" />,
      color: 'bg-red-950/40 border-red-500/40 hover:bg-red-900/50',
    },
    {
      number: '102',
      label: t.ambulanceService,
      subtext: 'Rapid Medical First-Aid & Patient Transport',
      icon: <HeartPulse className="w-5 h-5 text-rose-400" />,
      color: 'bg-rose-950/40 border-rose-500/40 hover:bg-rose-900/50',
    },
    {
      number: '1091',
      label: t.womenHelpline,
      subtext: 'Kolkata Police Dedicated Women Support Desk',
      icon: <Users className="w-5 h-5 text-pink-400" />,
      color: 'bg-pink-950/40 border-pink-500/40 hover:bg-pink-900/50',
    },
    {
      number: '112',
      label: t.nationalEmergency,
      subtext: 'Unified Emergency Response Support System (ERSS)',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
      color: 'bg-amber-950/40 border-amber-500/40 hover:bg-amber-900/50',
    },
  ];

  const handleCall = (e: React.MouseEvent, number: string, label: string) => {
    e.preventDefault();
    const shouldCall = window.confirm(`Do you want to dial ${number} for ${label}?`);
    if (shouldCall) {
      window.location.href = `tel:${number}`;
    }
  };

  return (
    <div
      id="emergency-sos-modal"
      className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none animate-fade-in"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm pointer-events-auto transition-opacity"
        onClick={onClose}
      />

      {/* Sheet Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto pointer-events-auto bg-slate-900/95 backdrop-blur-2xl border-t border-slate-800 shadow-2xl rounded-t-3xl p-5 pb-[calc(5rem+env(safe-area-inset-bottom))] text-slate-100 animate-slide-up">
        {/* Handle Bar */}
        <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-4" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* SOS Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>{t.sosTitle}</span>
              <span className="text-[10px] font-semibold text-rose-400 uppercase tracking-wider">
                Direct Dial
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              {t.sosSubtitle}
            </p>
          </div>
        </div>

        {/* Dialers Grid with safety confirm() prompt */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {emergencyContacts.map((contact) => (
            <div
              key={contact.number}
              onClick={(e) => handleCall(e, contact.number, contact.label)}
              className="p-3 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-750 transition flex items-center justify-between gap-3 group active:scale-98 shadow-xs cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label={`Call ${contact.label} at ${contact.number}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-slate-900 text-rose-400 shrink-0">
                  {contact.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white truncate">
                    {contact.label}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate">
                    {contact.subtext}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-rose-600 text-white font-semibold text-xs shadow-xs group-hover:bg-rose-500 transition shrink-0 tabular-nums">
                <PhoneCall className="w-3 h-3" />
                <span>{contact.number}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Crucial Pujo Safety Guidelines */}
        <div className="p-3.5 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-2">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            {t.offlineSafetyTipsTitle}
          </h3>

          <ul className="space-y-1.5 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Stay Hydrated:</strong> Use nearby municipal water kiosks or beverage stalls along major streets.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Lost Companions:</strong> Fix a clear physical landmark (e.g. Metro station gate or Police booth) rather than cellular calls.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Metro Transit:</strong> Avoid peak midnight congestion at Esplanade/Kalighat by boarding at adjacent stations.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
