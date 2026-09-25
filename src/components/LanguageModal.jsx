import React from 'react';
import { Globe, Check, X } from 'lucide-react';
import { t } from '../services/i18n';

const LANGUAGES = [
  { id: 'gu', label: 'ગુજરાતી (Gujarati)', flag: '🇮🇳', nativeName: 'ગુજરાતી' },
  { id: 'hi', label: 'हिन्दी (Hindi)', flag: '🇮🇳', nativeName: 'हिन्दी' },
  { id: 'en', label: 'English', flag: '🇬🇧', nativeName: 'English' },
  { id: 'es', label: 'Español (Spanish)', flag: '🇪🇸', nativeName: 'Español' },
  { id: 'fr', label: 'Français (French)', flag: '🇫🇷', nativeName: 'Français' },
  { id: 'de', label: 'Deutsch (German)', flag: '🇩🇪', nativeName: 'Deutsch' },
  { id: 'ar', label: 'العربية (Arabic)', flag: '🇸🇦', nativeName: 'العربية' },
];

export default function LanguageModal({ isOpen, onClose, currentLang, onSelectLang }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xs bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-100 text-blue-600 rounded-xl">
              <Globe size={18} />
            </span>
            <h3 className="font-bold text-sm text-slate-800">
              {t('select_language', currentLang)}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-200 text-slate-500 transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-2 max-h-[70vh] overflow-y-auto">
          {LANGUAGES.map((lang) => {
            const isSelected = currentLang === lang.id;
            return (
              <button
                key={lang.id}
                onClick={() => {
                  onSelectLang(lang.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl border transition active:scale-98 ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/80 text-blue-900 font-bold shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{lang.flag}</span>
                  <div className="text-left">
                    <p className="text-sm font-semibold">{lang.label}</p>
                  </div>
                </div>

                {isSelected && (
                  <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                    <Check size={14} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
