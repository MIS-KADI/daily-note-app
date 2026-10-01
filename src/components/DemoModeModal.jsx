import React from 'react';
import { Lock, Sparkles, Trash2, X } from 'lucide-react';
import { t } from '../services/i18n';

export default function DemoModeModal({ isOpen, onClose, onConfirmClear, lang = 'gu' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 border-2 border-orange-200 relative overflow-hidden">
        {/* Top Glow bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />

        <div className="flex items-start justify-between pt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 border border-orange-200">
              <Lock size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800 flex items-center gap-1.5">
                <span>{t('demo_prompt_title', lang)}</span>
                <Sparkles size={16} className="text-amber-500" />
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {t('demo_mode_banner_title', lang)}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="bg-orange-50/80 border border-orange-200/80 p-3.5 rounded-2xl text-xs text-orange-950 leading-relaxed font-medium">
          {t('demo_mode_locked_msg', lang)}
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          {t('demo_prompt_sub', lang)}
        </p>

        <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={onConfirmClear}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-orange-600 to-rose-600 hover:from-orange-700 hover:to-rose-700 text-white rounded-2xl text-xs sm:text-sm font-black shadow-lg shadow-orange-600/30 transition transform active:scale-95 flex items-center justify-center gap-2 ring-4 ring-orange-200"
          >
            <Trash2 size={16} />
            <span>{t('demo_prompt_clear_now', lang)}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition"
          >
            {t('demo_prompt_cancel', lang)}
          </button>
        </div>
      </div>
    </div>
  );
}
