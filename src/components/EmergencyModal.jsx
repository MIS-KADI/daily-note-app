import React from 'react';
import { PhoneCall, ShieldAlert, X, AlertTriangle, Building, Heart } from 'lucide-react';

const HELPLINES = [
  {
    name: '૧૦૮ ઇમરજન્સી એમ્બ્યુલન્સ',
    desc: 'તબીબી કટોકટી અને હોસ્પિટલ સેવા',
    number: '108',
    category: 'મેડિકલ',
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: Heart,
  },
  {
    name: '૧૯૩૦ સાયબર & બેંક ફ્રોડ હેલ્પલાઇન',
    desc: 'ઓનલાઇન નાણાકીય છેતરપિંડી કે OTP ફ્રોડ માટે તાત્કાલિક રિપોર્ટ',
    number: '1930',
    category: 'બેંક સુરક્ષા',
    color: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: ShieldAlert,
  },
  {
    name: '૧૧૨ / ૧૦૦ પોલીસ હેલ્પલાઇન',
    desc: 'રાષ્ટ્રીય ઇમરજન્સી અને પોલીસ સહાય',
    number: '112',
    category: 'સુરક્ષા',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: ShieldAlert,
  },
  {
    name: '૧૦૧ ફાયર બ્રિગેડ',
    desc: 'આગ અને આપત્તિ વ્યવસ્થાપન',
    number: '101',
    category: 'ઇમરજન્સી',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: AlertTriangle,
  },
  {
    name: 'બેંક ઓફ બરોડા (BOB) હેલ્પલાઇન',
    desc: 'ટોલ-ફ્રી ગ્રાહક સેવા & કાર્ડ બ્લોક',
    number: '18005700',
    category: 'બેંક',
    color: 'bg-slate-50 text-slate-700 border-slate-200',
    icon: Building,
  },
  {
    name: 'સ્ટેટ બેંક ઓફ ઇન્ડિયા (SBI) હેલ્પલાઇન',
    desc: 'ટોલ-ફ્રી સપોર્ટ & ATM કાર્ડ બ્લોક',
    number: '18001234',
    category: 'બેંક',
    color: 'bg-slate-50 text-slate-700 border-slate-200',
    icon: Building,
  },
];

export default function EmergencyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in slide-in-from-bottom duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-red-600 text-white">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-white/20 rounded-xl">
              <ShieldAlert size={20} />
            </span>
            <div>
              <h3 className="font-bold text-base leading-tight">ઇમરજન્સી અને હેલ્પલાઇન</h3>
              <p className="text-xs text-red-100">૧-ક્લિકમાં તાત્કાલિક મદદ મેળવો</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contacts List */}
        <div className="p-4 overflow-y-auto space-y-2.5">
          {HELPLINES.map((h, i) => {
            const Icon = h.icon;
            return (
              <div
                key={i}
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${h.color}`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white rounded-xl shadow-2xs">
                    <Icon size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold leading-tight">{h.name}</h4>
                    <p className="text-[11px] opacity-80 mt-0.5 leading-snug">{h.desc}</p>
                    <span className="text-[10px] font-bold mt-1 inline-block bg-white/70 px-2 py-0.5 rounded-md">
                      નંબર: {h.number}
                    </span>
                  </div>
                </div>

                <a
                  href={`tel:${h.number}`}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition shrink-0"
                >
                  <PhoneCall size={14} />
                  કૉલ
                </a>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-400">
          આ નંબરો ૨૪ કલાક નિ:શુલ્ક (Toll-Free) સેવા આપે છે.
        </div>
      </div>
    </div>
  );
}
