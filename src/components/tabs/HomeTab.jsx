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
  Droplets,
  Plus,
  Minus,
  Sparkles,
  RefreshCw,
  ShoppingBag,
  ShieldAlert,
  Activity,
  HeartPulse,
  Footprints,
  Flame,
  Heart,
  MessageCircle,
  Smartphone,
  Play,
  Square,
  X,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { t } from '../../services/i18n';
import { whatsappService } from '../../services/whatsappService';
import { pedometerService } from '../../services/pedometerService';

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
  accounts = { bankBalance: 42500, cashBalance: 6800 },
  khata = [],
  onUpdateWater,
  onUpdateFitness,
  onOpenShopping,
  onOpenEmergency,
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

  // Water calculation
  const glasses = water?.glasses || 0;
  const targetGlasses = water?.target || 8;
  const waterPct = Math.min(100, Math.round((glasses / targetGlasses) * 100));

  const handleAddWater = () => {
    const next = glasses + 1;
    onUpdateWater({ ...water, glasses: next });
    if (next === targetGlasses) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  };

  const handleMinusWater = () => {
    if (glasses > 0) {
      onUpdateWater({ ...water, glasses: glasses - 1 });
    }
  };

  // Locale-formatted date
  const localeMap = { gu: 'gu-IN', hi: 'hi-IN', en: 'en-US' };
  const dateFormatted = new Date().toLocaleDateString(localeMap[lang] || 'gu-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Fitness & Cardio Calculations
  const fitnessSteps = fitness?.steps || 0;
  const fitnessTarget = fitness?.stepTarget || 8000;
  const stepPct = Math.min(100, Math.round((fitnessSteps / fitnessTarget) * 100));
  const fitnessCalories = fitness?.calories || Math.round(fitnessSteps * 0.045);
  const fitnessHeartRate = fitness?.heartRate || 74;
  const fitnessDistance = fitness?.distanceKm || Number(((fitnessSteps * 0.76) / 1000).toFixed(1));

  // Events & Celebrations (Birthdays & Anniversaries)
  const todayMMDD = new Date().toISOString().slice(5, 10);
  const tomorrowMMDD = new Date(Date.now() + 86400000).toISOString().slice(5, 10);

  const todayEvents = (events || []).filter((e) => (e.date || '').slice(5, 10) === todayMMDD);
  const tomorrowEvents = (events || []).filter((e) => (e.date || '').slice(5, 10) === tomorrowMMDD);

  // Live Pedometer & Motion Sensor State
  const [isSensorActive, setIsSensorActive] = React.useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = React.useState(false);
  const [customStepsInput, setCustomStepsInput] = React.useState('');

  const toggleStepSensor = async () => {
    if (isSensorActive) {
      pedometerService.stopTracking();
      setIsSensorActive(false);
    } else {
      const started = await pedometerService.startTracking((stepInc) => {
        const nextSteps = (fitness?.steps || 0) + stepInc;
        const nextKm = Number(((nextSteps * 0.76) / 1000).toFixed(2));
        const nextCal = (fitness?.calories || 0) + Math.round(stepInc * 0.045);
        onUpdateFitness?.({
          ...fitness,
          steps: nextSteps,
          distanceKm: nextKm,
          calories: nextCal,
        });
      });
      if (started) {
        setIsSensorActive(true);
      } else {
        alert(
          lang === 'gu'
            ? 'આ બ્રાઉઝરમાં મોશન સેન્સર પરમિશન નથી મળી અથવા ડિવાઇસ સેન્સર સપોર્ટ કરતું નથી. તમે ઝડપી બટન અથવા હેલ્થ એપ સિન્ક વાપરી શકો છો.'
            : 'Motion sensor permission not granted or device not supported.'
        );
      }
    }
  };

  const handleApplySyncSteps = (stepsCount) => {
    const s = Number(stepsCount);
    if (!isNaN(s) && s >= 0) {
      const nextKm = Number(((s * 0.76) / 1000).toFixed(2));
      const nextCal = Math.round(s * 0.045);
      onUpdateFitness?.({
        ...fitness,
        steps: s,
        distanceKm: nextKm,
        calories: nextCal,
      });
      setIsSyncModalOpen(false);
      setCustomStepsInput('');
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }
  };

  const handleAddQuickSteps = () => {
    const nextSteps = fitnessSteps + 500;
    const nextKm = Number(((nextSteps * 0.76) / 1000).toFixed(2));
    const nextCal = (fitness?.calories || 0) + Math.round(500 * 0.045);
    onUpdateFitness?.({
      ...fitness,
      steps: nextSteps,
      distanceKm: nextKm,
      calories: nextCal,
    });
    if (nextSteps >= fitnessTarget && fitnessSteps < fitnessTarget) {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    }
  };

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

      {/* Quick Action Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        <button
          onClick={() => onNavigate('notes')}
          className="p-3 bg-white hover:bg-blue-50/50 rounded-2xl border border-slate-200 text-center shadow-xs flex flex-col items-center gap-1 active:scale-95 transition"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
            📝
          </div>
          <span className="text-[11px] font-semibold text-slate-700">{t('btn_new_note', lang)}</span>
        </button>

        <button
          onClick={() => onNavigate('health')}
          className="p-3 bg-white hover:bg-teal-50/50 rounded-2xl border border-slate-200 text-center shadow-xs flex flex-col items-center gap-1 active:scale-95 transition"
        >
          <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-600 flex items-center justify-center font-bold text-sm">
            ❤️
          </div>
          <span className="text-[11px] font-semibold text-slate-700">{t('tab_health', lang)}</span>
        </button>

        <button
          onClick={() => onNavigate('reminders')}
          className="p-3 bg-white hover:bg-indigo-50/50 rounded-2xl border border-slate-200 text-center shadow-xs flex flex-col items-center gap-1 active:scale-95 transition"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
            ⏰
          </div>
          <span className="text-[11px] font-semibold text-slate-700">{t('btn_tasks_meetings', lang)}</span>
        </button>

        <button
          onClick={onOpenCalculator}
          className="p-3 bg-white hover:bg-amber-50/50 rounded-2xl border border-slate-200 text-center shadow-xs flex flex-col items-center gap-1 active:scale-95 transition"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-sm">
            🧮
          </div>
          <span className="text-[11px] font-semibold text-slate-700">{t('btn_calculator', lang)}</span>
        </button>

        <button
          onClick={onOpenShopping}
          className="p-3 bg-white hover:bg-emerald-50/50 rounded-2xl border border-slate-200 text-center shadow-xs flex flex-col items-center gap-1 active:scale-95 transition"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
            🛒
          </div>
          <span className="text-[11px] font-semibold text-slate-700">{t('btn_shopping', lang)}</span>
        </button>

        <button
          onClick={onOpenEmergency}
          className="p-3 bg-white hover:bg-red-50/50 rounded-2xl border border-slate-200 text-center shadow-xs flex flex-col items-center gap-1 active:scale-95 transition"
        >
          <div className="w-9 h-9 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold text-sm">
            🚨
          </div>
          <span className="text-[11px] font-semibold text-slate-700">{t('btn_emergency', lang)}</span>
        </button>
      </div>

      {/* Fitness & Cardio Live Daily Card */}
      <div className="bg-gradient-to-br from-white to-teal-50/40 rounded-3xl p-4 border border-teal-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-600 text-white shadow-xs">
              <Activity size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">{t('fitness_card_title', lang)}</h3>
              <p className="text-[11px] text-slate-500">
                {fitnessSteps.toLocaleString()} / {fitnessTarget.toLocaleString()} {t('steps', lang)} ({stepPct}%)
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('health')}
            className="flex items-center gap-0.5 text-xs text-teal-600 font-bold hover:underline"
          >
            <span>{t('view_details', lang)}</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${stepPct}%` }}
          />
        </div>

        {/* 4 Stats Chips - High Contrast in Light & Dark Mode */}
        <div className="grid grid-cols-4 gap-2 pt-1 text-center">
          <div className="bg-white rounded-2xl p-2.5 border border-slate-200 shadow-xs">
            <Footprints size={16} className="mx-auto text-teal-600 mb-0.5" />
            <span className="text-xs font-black text-teal-800 block">{fitnessSteps.toLocaleString()}</span>
            <span className="text-[10px] text-slate-500 font-bold block mt-0.5">{t('steps_today', lang)}</span>
          </div>

          <div className="bg-white rounded-2xl p-2.5 border border-slate-200 shadow-xs">
            <Flame size={16} className="mx-auto text-orange-500 mb-0.5" />
            <span className="text-xs font-black text-orange-600 block">{fitnessCalories}</span>
            <span className="text-[10px] text-slate-500 font-bold block mt-0.5">{t('kcal_burned', lang)}</span>
          </div>

          <div className="bg-white rounded-2xl p-2.5 border border-slate-200 shadow-xs">
            <Heart size={16} className="mx-auto text-red-500 mb-0.5" />
            <span className="text-xs font-black text-red-600 block">{fitnessHeartRate}</span>
            <span className="text-[10px] text-slate-500 font-bold block mt-0.5">{t('bpm_pulse', lang)}</span>
          </div>

          <div className="bg-white rounded-2xl p-2.5 border border-slate-200 shadow-xs">
            <span className="text-base block mb-0.5">📏</span>
            <span className="text-xs font-black text-slate-800 block">{fitnessDistance} km</span>
            <span className="text-[10px] text-slate-500 font-bold block mt-0.5">{t('distance_walked', lang)}</span>
          </div>
        </div>

        {/* Live Step Sensor & Direct Sync Controls */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleStepSensor}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold transition active:scale-95 text-[11px] ${
                isSensorActive
                  ? 'bg-emerald-600 text-white shadow-xs animate-pulse'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
            >
              {isSensorActive ? <Square size={11} /> : <Play size={11} />}
              <span>{isSensorActive ? t('live_sensor_active', lang) : t('live_sensor_start', lang)}</span>
            </button>

            <button
              onClick={() => setIsSyncModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl border border-blue-200 transition active:scale-95 text-[11px]"
            >
              <Smartphone size={12} />
              <span>{t('sync_health_app', lang)}</span>
            </button>
          </div>

          <button
            onClick={handleAddQuickSteps}
            className="flex items-center gap-1 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold rounded-xl border border-teal-200 transition active:scale-95 text-[11px]"
          >
            <Plus size={12} />
            <span>{t('add_500_steps', lang)}</span>
          </button>
        </div>
      </div>

      {/* Daily Water Tracker Card */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-3xl p-4 border border-cyan-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-600 text-white shadow-xs">
              <Droplets size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">{t('water_title', lang)}</h3>
              <p className="text-[11px] text-slate-500">
                {t('water_target', lang)} • {t('water_drank', lang)}: {glasses} {t('glasses', lang)} ({waterPct}%)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleMinusWater}
              disabled={glasses === 0}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 active:scale-95 transition disabled:opacity-30"
              title="-1"
            >
              <Minus size={14} />
            </button>
            <button
              onClick={handleAddWater}
              className="flex items-center gap-1 py-1.5 px-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition"
            >
              <Plus size={14} />
              {t('water_add', lang)}
            </button>
          </div>
        </div>


        {/* Progress Bar & Water Level */}
        <div className="w-full bg-cyan-100/70 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-cyan-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${waterPct}%` }}
          />
        </div>

        {/* Glasses Visual Dots */}
        <div className="flex justify-between items-center px-1">
          {Array.from({ length: targetGlasses }).map((_, i) => (
            <span
              key={i}
              className={`text-sm transition-transform ${
                i < glasses ? 'scale-110' : 'opacity-30 grayscale'
              }`}
            >
              🥛
            </span>
          ))}
        </div>
      </div>


      {/* Priority 1: Today's Medicine Routine Tracker */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-100 text-teal-700">
              <Pill size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">{t('today_medicines_routine', lang)}</h3>
              <p className="text-[11px] text-slate-500">
                {takenMedsCount}/{todayMedicines.length} {t('medicines_taken_summary', lang)}
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('medicine')}
            className="text-xs text-teal-600 font-semibold hover:underline"
          >
            {t('view_all', lang)}
          </button>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
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
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : 'bg-teal-50/40 border-teal-200/80 hover:bg-teal-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition ${
                      isTaken
                        ? 'bg-teal-600 text-white'
                        : 'border-2 border-slate-300 text-transparent'
                    }`}
                  >
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <h4
                      className={`text-xs font-bold ${
                        isTaken ? 'line-through text-slate-500' : 'text-slate-800'
                      }`}
                    >
                      {med.name}
                    </h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                      <span>{med.dosage}</span>
                      <span>•</span>
                      <span className="font-semibold text-teal-700">{med.time}</span>
                      <span>•</span>
                      <span
                        className={`font-semibold ${
                          med.mealRelation === 'before_food'
                            ? 'text-amber-700'
                            : 'text-emerald-700'
                        }`}
                      >
                        {med.mealRelation === 'before_food' ? t('before_food', lang) : t('after_food', lang)}
                      </span>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-1 rounded-lg bg-white border border-slate-200 font-semibold text-slate-600">
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
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs">
                {nextMeetingOrBank.type === 'bank' ? <Building2 size={18} /> : <Users size={18} />}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-md">
                  {nextMeetingOrBank.type === 'bank' ? t('bank_important_work', lang) : t('meeting_alert', lang)}
                </span>
                <h4 className="text-sm font-bold text-slate-800 mt-1">
                  {nextMeetingOrBank.title}
                </h4>
              </div>
            </div>
            <span className="text-xs font-extrabold text-amber-900 bg-white px-2.5 py-1 rounded-xl shadow-2xs border border-amber-200 flex items-center gap-1">
              <Clock size={12} />
              {nextMeetingOrBank.time}
            </span>
          </div>

          {nextMeetingOrBank.description && (
            <p className="text-xs text-slate-600 mt-2 pl-1 leading-relaxed">
              {nextMeetingOrBank.description}
            </p>
          )}

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

      {/* Priority 4: Recent Notes */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-slate-800">{t('recent_notes', lang)}</h3>
          <button
            onClick={() => onNavigate('notes')}
            className="text-xs text-blue-600 font-semibold hover:underline"
          >
            {t('all_notes', lang)} ({notes.length})
          </button>
        </div>
        {notes.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">{t('no_notes_yet', lang)}</p>
        ) : (
          <div className="space-y-2">
            {notes.slice(0, 2).map((note) => (
              <div
                key={note.id}
                onClick={() => onNavigate('notes')}
                className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition cursor-pointer"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-800">{note.title}</span>
                  <span className="text-[10px] text-slate-400">{note.date}</span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {note.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sync Steps Modal (Mobile Health App Sync) */}
      {isSyncModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xl">📱</span>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{t('sync_health_modal_title', lang)}</h3>
                  <p className="text-[10px] text-slate-500">Google Fit, Apple Health, Samsung Health</p>
                </div>
              </div>
              <button
                onClick={() => setIsSyncModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {t('sync_health_desc', lang)}
            </p>

            {/* Quick preset step counts */}
            <div className="grid grid-cols-4 gap-1.5">
              {[2000, 5000, 8000, 10000].map((count) => (
                <button
                  key={count}
                  onClick={() => handleApplySyncSteps(count)}
                  className="py-2 px-1 text-center bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl font-bold text-xs border border-teal-200 active:scale-95 transition"
                >
                  {count.toLocaleString()}
                </button>
              ))}
            </div>

            {/* Custom input */}
            <div className="pt-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">{t('custom_steps_label', lang)}</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="e.g. 6450"
                  value={customStepsInput}
                  onChange={(e) => setCustomStepsInput(e.target.value)}
                  className="flex-1 text-sm font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-teal-500"
                />
                <button
                  onClick={() => handleApplySyncSteps(customStepsInput)}
                  disabled={!customStepsInput}
                  className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition disabled:opacity-40"
                >
                  {t('save_steps', lang)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
