import React from 'react';
import { Sparkles, Trash2, ArrowRight } from 'lucide-react';
import { t } from '../services/i18n';

export default function DemoModeBanner({ lang = 'gu', onClearDemo }) {
  return (
    <div className="mb-4 relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-4 sm:p-5 text-white shadow-xl shadow-orange-500/25 border-2 border-amber-300 transition animate-in fade-in slide-in-from-top-3 duration-300">
      {/* Decorative background glow circles */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/15 rounded-full blur-xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-yellow-300/20 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-3.5">
        <div className="text-center md:text-left flex-1 min-w-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-100 font-extrabold text-xs uppercase tracking-wider mb-1.5 border border-white/25">
            <Sparkles size={14} className="text-yellow-200 animate-spin" />
            <span>{t('demo_mode_banner_title', lang)}</span>
          </div>

          <p className="text-xs sm:text-[13px] text-white/95 font-medium leading-relaxed max-w-xl">
            {t('demo_mode_banner_desc', lang)}
          </p>
        </div>

        {/* Highlighted Call-To-Action Button */}
        <button
          type="button"
          onClick={onClearDemo}
          className="shrink-0 w-full sm:w-auto bg-white text-orange-700 hover:bg-orange-50 active:bg-orange-100 font-black text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-xl hover:shadow-2xl transition transform active:scale-95 flex items-center justify-center gap-2 border-2 border-white ring-4 ring-orange-300/60 cursor-pointer animate-bounce sm:animate-none hover:scale-[1.02]"
          title={t('clear_demo_and_start_btn', lang)}
        >
          <Trash2 size={16} className="text-rose-600" />
          <span>{t('clear_demo_and_start_btn', lang)}</span>
          <ArrowRight size={15} className="text-orange-600 hidden sm:inline" />
        </button>
      </div>
    </div>
  );
}
