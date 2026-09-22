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
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto pointer-events-auto bg-slate-900/95 backdrop-blur-2xl border-t-2 border-x-2 border-red-500/60 shadow-2xl rounded-t-3xl p-5 pb-[calc(5rem+env(safe-area-inset-bottom))] text-slate-100 animate-slide-up">
        {/* Handle Bar */}
        <div className="w-12 h-1.5 bg-red-500/40 rounded-full mx-auto mb-4" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* SOS Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-2xl bg-red-600/30 border border-red-500/50 text-red-500 animate-pulse">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>{t.sosTitle}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white uppercase">
                Offline Direct
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              {t.sosSubtitle}
            </p>
          </div>
        </div>

        {/* Dialers Grid with safety confirm() prompt */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
          {emergencyContacts.map((contact) => (
            <div
              key={contact.number}
              onClick={(e) => handleCall(e, contact.number, contact.label)}
              className={`p-3.5 rounded-2xl border ${contact.color} transition flex items-center justify-between gap-3 group active:scale-98 shadow-md cursor-pointer`}
              role="button"
              tabIndex={0}
              aria-label={`Call ${contact.label} at ${contact.number}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="p-2 rounded-xl bg-black/40 shrink-0">
                  {contact.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    {contact.label}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    {contact.subtext}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 text-white font-bold text-xs shadow-md group-hover:bg-red-500 transition shrink-0">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{contact.number}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Crucial Pujo Safety Guidelines */}
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-white/10 space-y-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            {t.offlineSafetyTipsTitle}
          </h3>

          <ul className="space-y-2 text-xs text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Stay Hydrated:</strong> Use nearby Kolkata Municipal Corporation water kiosks or branded stalls along major thoroughfares.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Lost Companions:</strong> Agree upon a physical landmark (e.g. nearest Metro station or designated Police Assistance Booth) rather than relying on phone reception.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>Metro Smart Travel:</strong> Avoid peak midnight rush at central interchange stations (Esplanade/Kalighat) by walking 5-10 mins to adjacent stations.
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
