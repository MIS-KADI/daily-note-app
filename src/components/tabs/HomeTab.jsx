import React from 'react';
import {
  Calendar,
  Clock,
  Pill,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  PlusCircle,
  TrendingDown,
  Building2,
  Users,
  ChevronRight,
  Plus,
  Minus,
  Sparkles,
  RefreshCw,
  ShoppingBag,
  ShieldAlert,
  Activity,
  HeartPulse,
  Heart,
  MessageCircle,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { t } from '../../services/i18n';
import { whatsappService } from '../../services/whatsappService';
import MoodTrackerCard from '../MoodTrackerCard';

export default function HomeTab({
  user,
  notes,
  reminders,
  events = [],
  medicines,
  medicineLogs,
  finance,
  water,
  fitness,
  isStepSensorActive = false,
  onToggleStepSensor,
  onStepIncrement,
  accounts = { bankBalance: 0, cashBalance: 0 },
  khata = [],
  onUpdateWater,
  onUpdateFitness,
  onOpenShopping,
  onOpenEmergency,
  onOpenAssistant,
  onOpenPhotoGallery,
  dailyQuote,
  onNextQuote,
  lang = 'gu',
  onNavigate,
  onToggleMedicine,
  onToggleReminder,
  onOpenCalculator,
}) {
  const todayStr = new Date().toISOString().split('T')[0];

  // Calculations
  const todayMedicines = medicines.filter((m) => m.active);
  const takenMedsCount = todayMedicines.filter(
    (m) => medicineLogs[todayStr]?.[m.id]?.taken
  ).length;

  const pendingReminders = reminders.filter((r) => !r.isCompleted);
  const nextMeetingOrBank = pendingReminders.find(
    (r) => r.type === 'meeting' || r.type === 'bank'
  );

  const totalExpense = finance
    .filter((f) => f.type === 'expense')
    .reduce((sum, f) => sum + Number(f.amount || 0), 0);

  const totalIncome = finance
    .filter((f) => f.type === 'income')
    .reduce((sum, f) => sum + Number(f.amount || 0), 0);

  const balance = totalIncome - totalExpense;

  // Locale-formatted date
  const localeMap = { gu: 'gu-IN', hi: 'hi-IN', en: 'en-US' };
  const dateFormatted = new Date().toLocaleDateString(localeMap[lang] || 'gu-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Events & Celebrations (Birthdays & Anniversaries)
  const todayMMDD = new Date().toISOString().slice(5, 10);
  const tomorrowMMDD = new Date(Date.now() + 86400000).toISOString().slice(5, 10);

  const todayEvents = (events || []).filter((e) => (e.date || '').slice(5, 10) === todayMMDD);
  const tomorrowEvents = (events || []).filter((e) => (e.date || '').slice(5, 10) === tomorrowMMDD);

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-5 text-white shadow-lg shadow-blue-500/15 relative overflow-hidden">
        <div className="absolute right-[-15px] top-[-15px] w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="flex items-center justify-between text-xs text-blue-100 mb-1">
          <span className="flex items-center gap-1">
            <Calendar size={13} />
            {dateFormatted}
          </span>
          <span className="bg-blue-500/40 px-2.5 py-0.5 rounded-full font-medium text-[11px]">
            {t('assistant_tag', lang)}
          </span>
        </div>
        <h2 className="text-xl font-bold mt-1">
          {t('greeting', lang)}, {user?.name || t('default_user_name', lang)}! 🙏
        </h2>
        <p className="text-xs text-blue-100 mt-0.5 leading-relaxed">
          {t('greeting_sub', lang)}
        </p>

        {/* Quick Bank, Cash, and Khata Preview in Banner */}
        <div className="mt-4 pt-3 border-t border-white/20">
          <div className="grid grid-cols-4 gap-1.5 text-center mb-2.5">
            <div className="bg-white/10 rounded-xl p-1.5 backdrop-blur-xs">
              <span className="text-[9px] text-cyan-200 block">🏦 {t('bank', lang)}</span>
              <span className="text-xs font-black text-white">₹{Number(accounts?.bankBalance || 0).toLocaleString()}</span>
            </div>
            <div className="bg-white/10 rounded-xl p-1.5 backdrop-blur-xs">
              <span className="text-[9px] text-emerald-200 block">💵 {t('cash', lang)}</span>
              <span className="text-xs font-black text-white">₹{Number(accounts?.cashBalance || 0).toLocaleString()}</span>
            </div>
            <div className="bg-emerald-500/20 rounded-xl p-1.5 border border-emerald-400/20 backdrop-blur-xs">
              <span className="text-[9px] text-emerald-200 block">📥 {t('to_receive_short', lang)}</span>
              <span className="text-xs font-black text-emerald-300">
                ₹{khata.filter((k) => !k.isSettled && k.type === 'to_receive').reduce((s, k) => s + Number(k.amount || 0), 0).toLocaleString()}
              </span>
            </div>
            <div className="bg-red-500/20 rounded-xl p-1.5 border border-red-400/20 backdrop-blur-xs">
              <span className="text-[9px] text-red-200 block">📤 {t('to_pay_short', lang)}</span>
              <span className="text-xs font-black text-red-300">
                ₹{khata.filter((k) => !k.isSettled && k.type === 'to_pay').reduce((s, k) => s + Number(k.amount || 0), 0).toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] text-blue-200">{t('total_available', lang)}</p>
              <p className="text-base font-extrabold text-white">
                ₹{(Number(accounts?.bankBalance || 0) + Number(accounts?.cashBalance || 0)).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => onNavigate('finance')}
              className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-semibold backdrop-blur-xs transition"
            >
              <span>{t('view_finance', lang)}</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Birthday & Anniversary Special Celebration Banner (Compact & Sleek) */}
      {todayEvents.map((ev) => {
        const isBday = ev.type === 'birthday';
        const isAnniv = ev.type === 'anniversary';
        const badgeText = isBday ? t('birthday_today', lang) : isAnniv ? t('anniversary_today', lang) : t('special_day', lang);

        return (
          <div
            key={ev.id}
            className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 rounded-2xl p-3 sm:p-3.5 text-white shadow-md shadow-pink-500/15 relative overflow-hidden border border-white/20 animate-in fade-in"
          >
            <div className="flex items-center justify-between gap-3">
              {/* Left: Avatar + Details */}
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-xl shrink-0 shadow-xs">
                  {isBday ? '🎂' : isAnniv ? '💍' : '🎉'}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                      <span>🎉</span>
                      <span>{badgeText}</span>
                    </span>
                    {ev.relation && (
                      <span className="text-[10px] text-pink-100 bg-white/15 px-1.5 py-0.5 rounded-md font-semibold">
                        {ev.relation}
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-white truncate mt-0.5 leading-snug">
                    {ev.name}
                  </h3>

                  {ev.notes && (
                    <p className="text-[10px] text-pink-100/90 truncate italic">
                      "{ev.notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Compact WhatsApp Wish Button */}
              <button
                onClick={() =>
                  whatsappService.sendWish({
                    name: ev.name,
                    type: ev.type,
                    phone: ev.phone,
                    relation: ev.relation,
                    senderName: user?.name,
                    lang,
                  })
                }
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/25 transition shrink-0 whitespace-nowrap"
              >
                <MessageCircle size={15} />
                <span>{t('wish_whatsapp', lang)}</span>
              </button>
            </div>
          </div>
        );
      })}

      {/* Upcoming tomorrow celebration notices */}
      {tomorrowEvents.map((ev) => (
        <div key={ev.id} className="bg-purple-50 border border-purple-200 rounded-2xl p-2.5 flex items-center justify-between text-xs text-purple-900 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-base">🔔</span>
            <span className="text-[11px]">
              <strong>{t('tomorrow', lang)}:</strong> {ev.name} ({ev.type === 'birthday' ? `${t('birthday', lang)} 🎂` : `${t('anniversary', lang)} 💍`})
            </span>
          </div>
          <button
            onClick={() => onNavigate('reminders')}
            className="text-[11px] font-bold text-purple-700 hover:underline"
          >
            {t('view_details', lang)}
          </button>
        </div>
      ))}

      {/* Daily Thought / Suvichar Card */}
      {dailyQuote && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-3 flex items-start justify-between gap-2.5 shadow-2xs">
          <div className="flex items-start gap-2.5 flex-1">
            <Sparkles className="text-amber-600 shrink-0 mt-0.5 animate-pulse" size={16} />
            <div className="text-xs">
              <p className="font-semibold text-amber-950 italic">"{dailyQuote.text}"</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-amber-700 font-bold">
                  — {dailyQuote.author}
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-200/60 text-amber-800 font-semibold">
                  {t('daily_thought', lang)}
                </span>
              </div>
            </div>
          </div>
          {onNextQuote && (
            <button
              onClick={onNextQuote}
              title={t('next_quote', lang)}
              className="p-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 active:rotate-180 transition shrink-0"
            >
              <RefreshCw size={13} />
            </button>
          )}
        </div>
      )}

      {/* AI Smart Voice Assistant Quick Launch Banner */}
      {onOpenAssistant && (
        <div
          onClick={() => onOpenAssistant(true)}
          className="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 rounded-3xl p-3.5 text-white shadow-md shadow-indigo-600/20 flex items-center justify-between gap-3 border border-white/20 cursor-pointer active:scale-98 transition group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shrink-0 shadow-xs border border-white/30 group-hover:scale-105 transition">
              🎙️
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-wide text-amber-300">
                  {lang === 'hi' ? 'स्मार्ट AI वॉइस सहायक' : lang === 'en' ? 'Smart AI Voice Assistant' : 'સ્માર્ટ AI વોઈસ આસિસ્ટન્ટ'}
                </span>
                <span className="text-[9px] bg-white/25 px-1.5 py-0.2 rounded-full uppercase font-bold text-white">
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-indigo-100 truncate mt-0.5">
                {lang === 'hi'
                  ? 'बोलें: "₹500 का पेट्रोल भराया" या "कल 10 बजे मीटिंग"'
                  : lang === 'en'
                  ? 'Say: "Spent 500 on fuel" or "Meeting tomorrow at 10 AM"'
                  : 'બોલો: "૫૦૦ રૂપિયા પેટ્રોલ પુરાવ્યું" કે "કાલે ૧૦ વાગ્યે મિટિંગ"'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenAssistant(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-extrabold text-xs shadow-md shadow-black/10 transition active:scale-95 shrink-0 flex items-center gap-1.5"
          >
            <Sparkles size={13} className="text-amber-500 animate-spin-slow" />
            <span>{lang === 'hi' ? 'बोलें' : lang === 'en' ? 'Speak' : 'બોલો'}</span>
          </button>
        </div>
      )}

      {/* Daily Streak & Mood Tracker Card */}
      <MoodTrackerCard lang={lang} />

      {/* Favorite Photo Gallery Showcase Card */}
      {onOpenPhotoGallery && (
        <div
          onClick={onOpenPhotoGallery}
          className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 rounded-3xl p-3.5 text-white shadow-md shadow-purple-600/20 flex items-center justify-between gap-3 border border-white/20 cursor-pointer active:scale-98 transition group"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shrink-0 shadow-xs border border-white/30 group-hover:scale-105 transition">
              📸
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-wide text-amber-300">
                  {lang === 'gu' ? 'મારી યાદગાર ફોટો ગેલેરી' : lang === 'hi' ? 'मेरी पसंदीदा फोटो गैलरी' : 'Favorite Photo Gallery'}
                </span>
                <span className="text-[9px] bg-white/25 px-1.5 py-0.2 rounded-full uppercase font-bold text-white">
                  ⭐ ફેવરિટ
                </span>
              </div>
              <p className="text-[11px] text-pink-100 truncate mt-0.5">
                {lang === 'gu'
                  ? 'પરિવાર, પ્રવાસ અને ખાસ ક્ષણોના ફોટા સાચવી રાખો'
                  : lang === 'hi'
                  ? 'परिवार, यात्रा और खास पलों की तस्वीरें सहेजें'
                  : 'Save family, travel and memory photos securely'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenPhotoGallery();
            }}
            className="px-3 py-1.5 rounded-xl bg-white text-purple-700 hover:bg-pink-50 font-extrabold text-xs shadow-md shadow-black/10 transition active:scale-95 shrink-0 flex items-center gap-1"
          >
            <span>{lang === 'gu' ? 'જુઓ' : lang === 'hi' ? 'देखें' : 'View'}</span>
            <ChevronRight size={13} />
          </button>
        </div>
      )}

      {/* Quick Action Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        <button
          onClick={() => onNavigate('notes')}
          className="p-2.5 sm:p-3 bg-white dark:bg-slate-900 hover:bg-blue-50/50 dark:hover:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-xs flex flex-col items-center gap-1 active:scale-95 transition"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
            📝
          </div>
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 dark:text-slate-200 truncate max-w-full">{t('btn_new_note', lang)}</span>
        </button>

        <button
          onClick={() => onNavigate('health')}
          className="p-2.5 sm:p-3 bg-white dark:bg-slate-900 hover:bg-teal-50/50 dark:hover:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-xs flex flex-col items-center gap-1 active:scale-95 transition"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-sm">
            ❤️
          </div>
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 dark:text-slate-200 truncate max-w-full">{t('tab_health', lang)}</span>
        </button>

        <button
          onClick={() => onNavigate('reminders')}
          className="p-2.5 sm:p-3 bg-white dark:bg-slate-900 hover:bg-indigo-50/50 dark:hover:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-xs flex flex-col items-center gap-1 active:scale-95 transition"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
            ⏰
          </div>
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 dark:text-slate-200 truncate max-w-full">{t('btn_tasks_meetings', lang)}</span>
        </button>

        {onOpenPhotoGallery && (
          <button
            onClick={onOpenPhotoGallery}
            className="p-2.5 sm:p-3 bg-white dark:bg-slate-900 hover:bg-purple-50/50 dark:hover:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-xs flex flex-col items-center gap-1 active:scale-95 transition"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm">
              📸
            </div>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 dark:text-slate-200 truncate max-w-full">{t('btn_photo_gallery', lang)}</span>
          </button>
        )}

        <button
          onClick={onOpenCalculator}
          className="p-2.5 sm:p-3 bg-white dark:bg-slate-900 hover:bg-amber-50/50 dark:hover:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-xs flex flex-col items-center gap-1 active:scale-95 transition"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
            🧮
          </div>
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 dark:text-slate-200 truncate max-w-full">{t('btn_calculator', lang)}</span>
        </button>

        <button
          onClick={onOpenShopping}
          className="p-2.5 sm:p-3 bg-white dark:bg-slate-900 hover:bg-emerald-50/50 dark:hover:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-xs flex flex-col items-center gap-1 active:scale-95 transition"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
            🛒
          </div>
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 dark:text-slate-200 truncate max-w-full">{t('btn_shopping', lang)}</span>
        </button>

        <button
          onClick={onOpenEmergency}
          className="p-2.5 sm:p-3 bg-white dark:bg-slate-900 hover:bg-red-50/50 dark:hover:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-800 text-center shadow-xs flex flex-col items-center gap-1 active:scale-95 transition"
        >
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-sm">
            🚨
          </div>
          <span className="text-[10px] sm:text-[11px] font-semibold text-slate-700 dark:text-slate-200 truncate max-w-full">{t('btn_emergency', lang)}</span>
        </button>
      </div>

      {/* Priority 1: Today's Medicine Routine Tracker */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300">
              <Pill size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{t('today_medicines_routine', lang)}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {takenMedsCount}/{todayMedicines.length} {t('medicines_taken_summary', lang)}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('medicine')}
            className="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 font-bold hover:underline"
          >
            {t('view_all', lang)}
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
          <div
            className="bg-teal-500 h-full rounded-full transition-all duration-500"
            style={{
              width: `${todayMedicines.length ? (takenMedsCount / todayMedicines.length) * 100 : 0}%`,
            }}
          />
        </div>

        {/* Medicine List preview */}
        <div className="space-y-2 pt-1">
          {todayMedicines.slice(0, 3).map((med) => {
            const isTaken = !!medicineLogs[todayStr]?.[med.id]?.taken;
            return (
              <div
                key={med.id}
                onClick={() => onToggleMedicine(med.id)}
                className={`flex items-center justify-between p-3 rounded-2xl border transition cursor-pointer ${
                  isTaken
                    ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                    : 'bg-teal-50/40 dark:bg-slate-800/80 border-teal-200/80 dark:border-teal-800/60 hover:bg-teal-50 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition ${
                      isTaken
                        ? 'bg-teal-600 text-white'
                        : 'border-2 border-slate-300 dark:border-slate-600 text-transparent'
                    }`}
                  >
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4
                      className={`text-xs font-bold ${
                        isTaken ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-100'
                      }`}
                    >
                      {med.name}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>{med.dosage}</span>
                      <span>•</span>
                      <span className="font-semibold text-teal-700 dark:text-teal-300">{med.time}</span>
                      <span>•</span>
                      <span
                        className={`font-semibold ${
                          med.mealRelation === 'before_food'
                            ? 'text-amber-700 dark:text-amber-400'
                            : 'text-emerald-700 dark:text-emerald-400'
                        }`}
                      >
                        {med.mealRelation === 'before_food' ? t('before_food', lang) : t('after_food', lang)}
                      </span>
                    </div>
                  </div>
                </div>
                <span
                  className={`text-[10px] px-2 py-1 rounded-lg border font-bold ${
                    isTaken
                      ? 'bg-slate-100 dark:bg-slate-700/60 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300'
                      : 'bg-white dark:bg-teal-950/60 border-teal-200 dark:border-teal-700/60 text-teal-800 dark:text-teal-200 shadow-2xs'
                  }`}
                >
                  {isTaken ? t('taken', lang) : t('not_taken', lang)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Priority 2: Next Meeting or Bank Work */}
      {nextMeetingOrBank && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl p-4 border border-amber-200/80 shadow-xs">
          {/* Top Row: Icon & Tag on Left, Time badge on Right */}
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-amber-200/60">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-xl bg-amber-500 text-white shadow-xs shrink-0">
                {nextMeetingOrBank.type === 'bank' ? <Building2 size={16} /> : <Users size={16} />}
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 bg-amber-200/70 px-2.5 py-0.5 rounded-md">
                {nextMeetingOrBank.type === 'bank' ? t('bank_important_work', lang) : t('meeting_alert', lang)}
              </span>
            </div>
            <span className="text-xs font-extrabold text-amber-900 bg-white px-2.5 py-1 rounded-xl shadow-2xs border border-amber-200 flex items-center gap-1 shrink-0">
              <Clock size={12} className="text-amber-600" />
              {nextMeetingOrBank.time}
            </span>
          </div>

          {/* Full Width Continuous (સળંગ) Title */}
          <div className="pt-2">
            <h4 className="text-sm font-bold text-slate-800 leading-normal break-normal">
              {nextMeetingOrBank.title}
            </h4>

            {/* Full Width Continuous (સળંગ) Note Description */}
            {nextMeetingOrBank.description && (
              <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-white/70 p-2.5 rounded-xl border border-amber-100/90 break-normal">
                <span className="font-bold text-amber-950">📝 {lang === 'gu' ? 'નોંધ:' : 'Note:'} </span>
                <span>{nextMeetingOrBank.description}</span>
              </p>
            )}
          </div>

          <div className="mt-3 pt-2 border-t border-amber-200/60 flex items-center justify-between">
            <button
              onClick={() => onToggleReminder(nextMeetingOrBank.id)}
              className="text-xs font-semibold text-emerald-700 flex items-center gap-1 hover:underline"
            >
              <CheckCircle2 size={14} />
              {t('mark_as_done', lang)}
            </button>
            <button
              onClick={() => onNavigate('reminders')}
              className="text-xs text-amber-800 font-semibold flex items-center gap-0.5"
            >
              {t('view_all_tasks', lang)}
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Priority 3: Today's Financial Quick Glance */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <IndianRupee size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">{t('monthly_finance_summary', lang)}</h3>
              <p className="text-[11px] text-slate-500">{t('income_expense_savings', lang)}</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('reports')}
            className="text-xs text-blue-600 font-semibold hover:underline"
          >
            {t('pdf_report', lang)}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-3">
            <p className="text-[10px] font-semibold text-emerald-700 uppercase">{t('total_income', lang)}</p>
            <p className="text-base font-bold text-emerald-900 mt-0.5">
              ₹{totalIncome.toLocaleString()}
            </p>
          </div>
          <div className="bg-red-50/60 border border-red-100 rounded-2xl p-3">
            <p className="text-[10px] font-semibold text-red-700 uppercase">{t('total_expense', lang)}</p>
            <p className="text-base font-bold text-red-900 mt-0.5">
              ₹{totalExpense.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
