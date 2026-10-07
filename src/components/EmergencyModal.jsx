import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  ShieldAlert,
  X,
  AlertTriangle,
  Building,
  Heart,
  Plus,
  Trash2,
  Users,
  UserCheck,
  Check,
  Phone,
} from 'lucide-react';
import { t } from '../services/i18n';
import { permissionService } from '../services/permissionService';

const STORAGE_KEY = 'daily_diary_custom_emergency_contacts';

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
    },
    descs: {
      gu: 'તબીબી કટોકટી અને હોસ્પિટલ સેવા',
      hi: 'चिकित्सा आपातकाल और अस्पताल सेवा',
      en: 'Medical emergency & hospital assistance',
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
    },
    descs: {
      gu: 'ઓનલાઇન નાણાકીય છેતરપિંડી કે OTP ફ્રોડ માટે તાત્કાલિક રિપોર્ટ',
      hi: 'ऑनलाइन वित्तीय धोखाधड़ी या OTP फ्रॉड की तत्काल रिपोर्ट',
      en: 'Immediate reporting for online financial fraud or OTP scams',
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
    },
    descs: {
      gu: 'રાષ્ટ્રીય ઇમરજન્સી અને પોલીસ સહાય',
      hi: 'राष्ट्रीय आपातकालीन और पुलिस सहायता',
      en: 'Emergency police response & public safety',
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
    },
    descs: {
      gu: 'આગ અને આપત્તિ વ્યવસ્થાપન',
      hi: 'आग और आपदा राहत प्रबंधन',
      en: 'Fire emergencies and disaster response',
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
    },
    descs: {
      gu: 'ટોલ-ફ્રી ગ્રાહક સેવા & કાર્ડ બ્લોક',
      hi: 'टोल-फ्री ग्राहक सेवा व कार्ड ब्लॉक',
      en: 'Toll-free customer care & card blocking',
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
    },
    descs: {
      gu: 'ટોલ-ફ્રી સપોર્ટ & ATM કાર્ડ બ્લોક',
      hi: 'टोल-फ्री सहायता व ATM कार्ड ब्लॉक',
      en: 'Toll-free customer support & ATM blocking',
    },
  },
];

export default function EmergencyModal({ isOpen, onClose, lang = 'gu' }) {
  const [customContacts, setCustomContacts] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [contactRelation, setContactRelation] = useState('family');
  const [errorMsg, setErrorMsg] = useState('');

  // Load custom contacts from localStorage
  useEffect(() => {
    if (isOpen) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          setCustomContacts(JSON.parse(saved));
        } else {
          setCustomContacts([]);
        }
      } catch (e) {
        console.warn('Failed to load custom contacts:', e);
      }
      setIsAdding(false);
      setErrorMsg('');
    }
  }, [isOpen]);

  const saveToStorage = (list) => {
    setCustomContacts(list);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Failed to save emergency contacts:', e);
    }
  };

  // Pick from native phone contacts
  const handlePickFromContacts = async () => {
    try {
      const res = await permissionService.pickContact('emergency');
      if (res && res.success) {
        if (res.name) setContactName(res.name);
        if (res.mobile) setContactNumber(res.mobile.slice(-10));
        setErrorMsg('');
      }
    } catch (e) {
      console.warn('Pick contact error:', e);
    }
  };

  // Add custom contact
  const handleAddContact = (e) => {
    e.preventDefault();
    const cleanName = contactName.trim();
    const cleanNum = contactNumber.replace(/\D/g, '').slice(-10);

    if (!cleanName) {
      setErrorMsg(lang === 'gu' ? 'કૃપા કરીને નામ દાખલ કરો.' : 'Please enter contact name.');
      return;
    }
    if (!cleanNum || cleanNum.length < 5) {
      setErrorMsg(lang === 'gu' ? 'કૃપા કરીને સાચો મોબાઈલ નંબર દાખલ કરો.' : 'Please enter a valid phone number.');
      return;
    }

    const newContact = {
      id: 'emg_' + Date.now(),
      name: cleanName,
      number: cleanNum,
      relation: contactRelation,
      createdAt: new Date().toISOString(),
    };

    const updated = [newContact, ...customContacts];
    saveToStorage(updated);

    // Reset form
    setContactName('');
    setContactNumber('');
    setContactRelation('family');
    setIsAdding(false);
    setErrorMsg('');
  };

  // Remove custom contact
  const handleDeleteContact = (id, e) => {
    if (e) e.stopPropagation();
    const updated = customContacts.filter((c) => c.id !== id);
    saveToStorage(updated);
  };

  if (!isOpen) return null;

  const relationLabels = {
    family: { gu: '👨‍👩‍👧 પરિવાર', hi: '👨‍👩‍👧 परिवार', en: 'Family' },
    doctor: { gu: '🩺 ડૉક્ટર', hi: '🩺 डॉक्टर', en: 'Doctor' },
    friend: { gu: '🤝 મિત્ર', hi: '🤝 मित्र', en: 'Friend' },
    work: { gu: '🏢 ઓફિસ', hi: '🏢 ऑफिस', en: 'Office' },
    other: { gu: '⭐ અન્ય', hi: '⭐ अन्य', en: 'Other' },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-bottom duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-red-600 text-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-white/20 rounded-xl">
              <ShieldAlert size={20} />
            </span>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {lang === 'gu' ? 'કટોકટી અને ઇમરજન્સી નંબરો' : lang === 'hi' ? 'आपातकालीन नंबर' : 'Emergency Helplines'}
              </h3>
              <p className="text-xs text-red-100">
                {lang === 'gu'
                  ? 'અંગત સંપર્કો અને સરકારી સહાય નંબરો'
                  : lang === 'hi'
                  ? 'व्यक्तिगत संपर्क और सरकारी सहायता'
                  : 'Personal & National Emergency Contacts'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* SECTION 1: Personal Emergency Contacts */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">⭐</span>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  {lang === 'gu' ? 'મારા અંગત ઇમરજન્સી નંબરો' : lang === 'hi' ? 'मेरे व्यक्तिगत आपातकालीन नंबर' : 'My Emergency Contacts'}
                </h4>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300">
                  {customContacts.length}
                </span>
              </div>

              {!isAdding && (
                <button
                  type="button"
                  onClick={() => setIsAdding(true)}
                  className="px-2.5 py-1 rounded-xl bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-700 dark:text-red-300 text-xs font-bold flex items-center gap-1 transition active:scale-95 border border-red-200 dark:border-red-800"
                >
                  <Plus size={14} />
                  <span>{lang === 'gu' ? 'નંબર ઉમેરો' : lang === 'hi' ? 'नंबर जोड़ें' : 'Add Number'}</span>
                </button>
              )}
            </div>

            {/* Add Custom Contact Form */}
            {isAdding && (
              <form
                onSubmit={handleAddContact}
                className="p-3 bg-red-50/60 dark:bg-slate-800/80 rounded-2xl border border-red-200 dark:border-red-900/50 space-y-2.5 animate-in fade-in"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-800 dark:text-red-300 flex items-center gap-1">
                    <Plus size={14} />
                    {lang === 'gu' ? 'નવો ઇમરજન્સી નંબર ઉમેરો' : lang === 'hi' ? 'नया आपातकालीन नंबर जोड़ें' : 'Add New Contact'}
                  </span>

                  <button
                    type="button"
                    onClick={handlePickFromContacts}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 bg-white dark:bg-slate-700 px-2 py-0.8 rounded-lg shadow-2xs border border-blue-200 dark:border-blue-800 active:scale-95 transition"
                  >
                    <Users size={12} />
                    <span>{lang === 'gu' ? 'સંપર્કમાંથી પસંદ કરો' : lang === 'hi' ? 'कॉन्टैक्ट से चुनें' : 'Pick from Contacts'}</span>
                  </button>
                </div>

                {errorMsg && (
                  <p className="text-[11px] text-red-600 dark:text-red-400 font-semibold">{errorMsg}</p>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block mb-0.5">
                      {lang === 'gu' ? 'સંપર્કનું નામ *' : lang === 'hi' ? 'नाम *' : 'Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={lang === 'gu' ? 'દા.ત. પપ્પા / ડૉક્ટર' : 'e.g. Papa / Doctor'}
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-bold focus:outline-red-500"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block mb-0.5">
                      {lang === 'gu' ? 'મોબાઈલ નંબર *' : lang === 'hi' ? 'मोबाइल नंबर *' : 'Phone *'}
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={14}
                      placeholder="9876543210"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-bold focus:outline-red-500"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-slate-600 dark:text-slate-300 block mb-0.5">
                      {lang === 'gu' ? 'સંબંધ / પ્રકાર' : 'Relation / Type'}
                    </label>
                    <select
                      value={contactRelation}
                      onChange={(e) => setContactRelation(e.target.value)}
                      className="w-full text-xs p-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-semibold focus:outline-red-500"
                    >
                      <option value="family">{relationLabels.family[lang] || relationLabels.family.gu}</option>
                      <option value="doctor">{relationLabels.doctor[lang] || relationLabels.doctor.gu}</option>
                      <option value="friend">{relationLabels.friend[lang] || relationLabels.friend.gu}</option>
                      <option value="work">{relationLabels.work[lang] || relationLabels.work.gu}</option>
                      <option value="other">{relationLabels.other[lang] || relationLabels.other.gu}</option>
                    </select>
                  </div>

                  <div className="flex items-end gap-1.5 pt-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsAdding(false);
                        setErrorMsg('');
                      }}
                      className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                    >
                      {lang === 'gu' ? 'રદ કરો' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition active:scale-95 flex items-center gap-1"
                    >
                      <Check size={14} />
                      <span>{lang === 'gu' ? 'સેવ કરો' : 'Save'}</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Custom contacts list */}
            {customContacts.length === 0 && !isAdding ? (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-1">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {lang === 'gu'
                    ? 'હજી સુધી કોઈ અંગત ઇમરજન્સી નંબર ઉમેર્યો નથી.'
                    : 'No personal emergency numbers added yet.'}
                </p>
                <p className="text-[11px] text-slate-400">
                  {lang === 'gu'
                    ? 'તમારા પરિવાર, મિત્ર કે ડૉક્ટરનો નંબર સાચવો જેથી કટોકટીમાં ૧-ક્લિકમાં કૉલ કરી શકાય.'
                    : 'Save family, friend, or doctor contact for 1-tap calling in emergencies.'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {customContacts.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 shadow-2xs hover:border-red-300 dark:hover:border-red-800 transition"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-300 flex items-center justify-center font-bold text-sm shrink-0">
                        {c.relation === 'doctor' ? '🩺' : c.relation === 'friend' ? '🤝' : '👤'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                            {c.name}
                          </h4>
                          <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold shrink-0">
                            {relationLabels[c.relation]?.[lang] || relationLabels[c.relation]?.gu || c.relation}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                          {c.number}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <a
                        href={`tel:${c.number}`}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs transition"
                      >
                        <PhoneCall size={13} />
                        <span>{lang === 'gu' ? 'કૉલ' : lang === 'hi' ? 'कॉल' : 'Call'}</span>
                      </a>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteContact(c.id, e)}
                        title={lang === 'gu' ? 'નંબર કાઢી નાખો' : 'Remove contact'}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/60 rounded-xl transition active:scale-95"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr className="border-slate-200 dark:border-slate-800" />

          {/* SECTION 2: National & Bank Helplines */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
              <span>🏛️</span>
              <span>{lang === 'gu' ? 'સરકારી & બેંક હેલ્પલાઇન (Toll Free)' : 'National & Bank Helplines'}</span>
            </h4>

            <div className="space-y-2">
              {HELPLINE_DATA.map((h, i) => {
                const Icon = h.icon;
                const name = h.names[lang] || h.names.en || h.names.gu;
                const desc = h.descs[lang] || h.descs.en || h.descs.gu;

                return (
                  <div
                    key={i}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${h.color}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 bg-white rounded-xl shadow-2xs shrink-0">
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold leading-tight truncate">{name}</h4>
                        <p className="text-[10px] opacity-80 mt-0.5 leading-snug line-clamp-1">{desc}</p>
                        <span className="text-[10px] font-bold mt-0.5 inline-block bg-white/70 px-1.5 py-0.2 rounded-md font-mono">
                          {h.number}
                        </span>
                      </div>
                    </div>

                    <a
                      href={`tel:${h.number}`}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs active:scale-95 transition shrink-0"
                    >
                      <PhoneCall size={13} />
                      <span>{t('call_btn', lang)}</span>
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 text-center text-[11px] text-slate-400 shrink-0">
          {t('emergency_footer', lang)}
        </div>
      </div>
    </div>
  );
}
