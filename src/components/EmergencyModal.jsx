import React from 'react';
import { PhoneCall, ShieldAlert, X, AlertTriangle, Building, Heart } from 'lucide-react';
import { t } from '../services/i18n';

const HELPLINE_DATA = [
  {
    key: '108',
    number: '108',
    color: 'bg-red-50 text-red-700 border-red-200',
    icon: Heart,
    names: {
      gu: '૧૦૮ ઇમરજન્સી એમ્બ્યુલન્સ',
      hi: '108 आपातकालीन एम्बुलेंस',
      en: '108 Emergency Ambulance',
      es: '108 Ambulancia de Emergencia',
      fr: '108 Ambulance d’Urgence',
      de: '108 Notfall-Krankenwagen',
      ar: '108 إسعاف الطوارئ',
    },
    descs: {
      gu: 'તબીબી કટોકટી અને હોસ્પિટલ સેવા',
      hi: 'चिकित्सा आपातकाल और अस्पताल सेवा',
      en: 'Medical emergency & hospital assistance',
      es: 'Emergencias médicas y auxilio hospitalario',
      fr: 'Urgences médicales et assistance hospitalière',
      de: 'Medizinischer Notfall und Rettungsdienst',
      ar: 'حالات الطوارئ الطبية والمستشفيات',
    },
  },
  {
    key: '1930',
    number: '1930',
    color: 'bg-amber-50 text-amber-800 border-amber-200',
    icon: ShieldAlert,
    names: {
      gu: '૧૯૩૦ સાયબર & બેંક ફ્રોડ હેલ્પલાઇન',
      hi: '1930 साइबर व बैंक धोखाधड़ी हेल्पलाइन',
      en: '1930 Cyber & Banking Fraud Helpline',
      es: '1930 Línea de Fraude Bancario y Cibernético',
      fr: '1930 Assistance Cyber & Fraude Bancaire',
      de: '1930 Cyber- & Bankbetrug-Hotline',
      ar: '1930 خط مساعدة الاحتيال المصرفي والإلكتروني',
    },
    descs: {
      gu: 'ઓનલાઇન નાણાકીય છેતરપિંડી કે OTP ફ્રોડ માટે તાત્કાલિક રિપોર્ટ',
      hi: 'ऑनलाइन वित्तीय धोखाधड़ी या OTP फ्रॉड की तत्काल रिपोर्ट',
      en: 'Immediate reporting for online financial fraud or OTP scams',
      es: 'Denuncia inmediata de fraude financiero u OTP',
      fr: 'Signalement immédiat de fraude financière en ligne',
      de: 'Sofortmeldung von Online-Finanzbetrug oder OTP-Scams',
      ar: 'إبلاغ فوري عن الاحتيال المالي أو سرقة الرموز',
    },
  },
  {
    key: '112',
    number: '112',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    icon: ShieldAlert,
    names: {
      gu: '૧૧૨ / ૧૦૦ પોલીસ હેલ્પલાઇન',
      hi: '112 / 100 पुलिस हेल्पलाइन',
      en: '112 / 100 National Police Helpline',
      es: '112 / 100 Línea Directa de Policía',
      fr: '112 / 100 Police Secours',
      de: '112 / 100 Polizei Notruf',
      ar: '112 / 100 شرطة النجدة',
    },
    descs: {
      gu: 'રાષ્ટ્રીય ઇમરજન્સી અને પોલીસ સહાય',
      hi: 'राष्ट्रीय आपातकालीन और पुलिस सहायता',
      en: 'Emergency police response & public safety',
      es: 'Respuesta policial de emergencia y seguridad',
      fr: 'Intervention policière d’urgence',
      de: 'Polizeinotruf und öffentliche Sicherheit',
      ar: 'طوارئ الشرطة والسلامة العامة',
    },
  },
  {
    key: '101',
    number: '101',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    icon: AlertTriangle,
    names: {
      gu: '૧૦૧ ફાયર બ્રિગેડ',
      hi: '101 अग्निशमन दल (फायर ब्रिगेड)',
      en: '101 Fire & Rescue Service',
      es: '101 Cuerpo de Bomberos',
      fr: '101 Pompiers & Secours',
      de: '101 Feuerwehr & Notdienst',
      ar: '101 الإطفاء والدفاع المدني',
    },
    descs: {
      gu: 'આગ અને આપત્તિ વ્યવસ્થાપન',
      hi: 'आग और आपदा राहत प्रबंधन',
      en: 'Fire emergencies and disaster response',
      es: 'Emergencias por incendio y rescate',
      fr: 'Incendies et opérations de sauvetage',
      de: 'Brandbekämpfung und Katastrophenschutz',
      ar: 'طوارئ الحرائق والإنقاذ والكوارث',
    },
  },
  {
    key: 'bob',
    number: '18005700',
    color: 'bg-slate-50 text-slate-700 border-slate-200',
    icon: Building,
    names: {
      gu: 'બેંક ઓફ બરોડા (BOB) હેલ્પલાઇન',
      hi: 'बैंक ऑफ बड़ौदा (BOB) हेल्पलाइन',
      en: 'Bank of Baroda (BOB) Helpline',
      es: 'Línea Bank of Baroda (BOB)',
      fr: 'Assistance Bank of Baroda (BOB)',
      de: 'Bank of Baroda (BOB) Hotline',
      ar: 'خط مساعدة بنك بارودا (BOB)',
    },
    descs: {
      gu: 'ટોલ-ફ્રી ગ્રાહક સેવા & કાર્ડ બ્લોક',
      hi: 'टोल-फ्री ग्राहक सेवा व कार्ड ब्लॉक',
      en: 'Toll-free customer care & card blocking',
      es: 'Atención al cliente y bloqueo de tarjetas',
      fr: 'Service client gratuit et blocage de carte',
      de: 'Kostenloser Kundenservice & Kartensperrung',
      ar: 'خدمة العملاء المجانية وإيقاف البطاقات',
    },
  },
  {
    key: 'sbi',
    number: '18001234',
    color: 'bg-slate-50 text-slate-700 border-slate-200',
    icon: Building,
    names: {
      gu: 'સ્ટેટ બેંક ઓફ ઇન્ડિયા (SBI) હેલ્પલાઇન',
      hi: 'भारतीय स्टेट बैंक (SBI) हेल्पलाइन',
      en: 'State Bank of India (SBI) Helpline',
      es: 'Línea State Bank of India (SBI)',
      fr: 'Assistance State Bank of India (SBI)',
      de: 'State Bank of India (SBI) Hotline',
      ar: 'خط مساعدة بنك الهند الوطني (SBI)',
    },
    descs: {
      gu: 'ટોલ-ફ્રી સપોર્ટ & ATM કાર્ડ બ્લોક',
      hi: 'टोल-फ्री सहायता व ATM कार्ड ब्लॉक',
      en: 'Toll-free customer support & ATM blocking',
      es: 'Soporte gratuito y bloqueo de tarjetas ATM',
      fr: 'Support gratuit et blocage de carte bancaire',
      de: 'Kostenloser Support & Kartensperre',
      ar: 'دعم مجاني وإيقاف بطاقات الصراف الآلي',
    },
  },
];

export default function EmergencyModal({ isOpen, onClose, lang = 'gu' }) {
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
              <h3 className="font-bold text-base leading-tight">{t('emergency_title', lang)}</h3>
              <p className="text-xs text-red-100">{t('emergency_sub', lang)}</p>
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
          {HELPLINE_DATA.map((h, i) => {
            const Icon = h.icon;
            const name = h.names[lang] || h.names.en || h.names.gu;
            const desc = h.descs[lang] || h.descs.en || h.descs.gu;

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
                    <h4 className="text-xs font-bold leading-tight">{name}</h4>
                    <p className="text-[11px] opacity-80 mt-0.5 leading-snug">{desc}</p>
                    <span className="text-[10px] font-bold mt-1 inline-block bg-white/70 px-2 py-0.5 rounded-md">
                      {t('number_prefix', lang)} {h.number}
                    </span>
                  </div>
                </div>

                <a
                  href={`tel:${h.number}`}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs active:scale-95 transition shrink-0"
                >
                  <PhoneCall size={14} />
                  {t('call_btn', lang)}
                </a>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-400">
          {t('emergency_footer', lang)}
        </div>
      </div>
    </div>
  );
}
