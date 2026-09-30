import React, { useEffect } from 'react';
import { BellRing, CheckCircle2, Clock, VolumeX, Music, Sparkles } from 'lucide-react';
import { soundAlarm, RINGTONE_OPTIONS } from '../services/audioService';
import { t } from '../services/i18n';

export default function AlarmModal({ activeAlarm, onDismiss, onMarkDone, onSnooze, lang = 'gu' }) {
  useEffect(() => {
    if (activeAlarm) {
      const selectedTone =
        activeAlarm.ringtone ||
        (activeAlarm.type === 'medicine' ? 'medicine' : 'classic_bell');
      soundAlarm.playRingtone(selectedTone, activeAlarm.customAudioUrl, true);
    }
    return () => {
      soundAlarm.stopAlarm();
    };
  }, [activeAlarm]);

  if (!activeAlarm) return null;

  const isMedicine = activeAlarm.type === 'medicine';
  const toneOption = RINGTONE_OPTIONS.find((r) => r.id === activeAlarm.ringtone);
  const ringtoneName =
    activeAlarm.ringtone === 'custom'
      ? activeAlarm.customRingtoneName || (lang === 'gu' ? 'મોબાઈલ ઓડિયો' : 'Mobile Audio')
      : toneOption
      ? lang === 'gu'
        ? toneOption.nameGu
        : toneOption.nameEn
      : lang === 'gu'
      ? '🔔 ક્લાસિકલ બેલ'
      : '🔔 Classic Bell';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-amber-400 animate-alarm">
        {/* Top Alarm Icon banner */}
        <div
          className={`p-6 text-center text-white relative overflow-hidden ${
            isMedicine
              ? 'bg-gradient-to-br from-teal-500 via-emerald-600 to-teal-700'
              : 'bg-gradient-to-br from-indigo-600 via-blue-600 to-purple-700'
          }`}
        >
          {/* Animated sound pulses in background */}
          <div className="absolute inset-0 opacity-15 pointer-events-none flex items-center justify-center">
            <div className="w-48 h-48 rounded-full border-4 border-white animate-ping" />
          </div>

          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center animate-bounce shadow-lg">
            <BellRing size={32} className="text-white" />
          </div>

          <span className="inline-block px-3 py-1 bg-white/25 backdrop-blur-xs rounded-full text-xs font-bold tracking-wide uppercase shadow-xs">
            {isMedicine ? t('alarm_med_badge', lang) : t('alarm_reminder_badge', lang)}
          </span>

          <h2 className="mt-2 text-2xl font-black text-white leading-tight drop-shadow-sm">
            {activeAlarm.title}
          </h2>

          <p className="mt-1 text-sm text-white/90 font-bold flex items-center justify-center gap-1.5">
            <Clock size={14} />
            {t('time_label', lang)} {activeAlarm.time}
          </p>

          {/* Active Ringtone Indicator */}
          <div className="inline-flex items-center gap-1.5 text-xs text-white/95 bg-black/25 px-3 py-1 rounded-full mt-2.5 backdrop-blur-xs border border-white/20">
            <Music size={12} className="animate-pulse text-amber-300" />
            <span className="font-semibold truncate max-w-[200px]">{ringtoneName}</span>
          </div>
        </div>

        {/* Alarm Details Body */}
        <div className="p-5 space-y-3 bg-slate-50">
          {isMedicine && (
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">{t('dosage_label', lang)}</span>
                <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                  {activeAlarm.dosage || t('default_dosage_tablet', lang)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">{t('food_relation', lang)}</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded-md ${
                    activeAlarm.mealRelation === 'before_food'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {activeAlarm.mealRelation === 'before_food'
                    ? t('hunger_empty_stomach', lang)
                    : t('after_food_full', lang)}
                </span>
              </div>
              {activeAlarm.notes && (
                <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 italic">
                  "{activeAlarm.notes}"
                </div>
              )}
            </div>
          )}

          {!isMedicine && activeAlarm.description && (
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs text-xs text-slate-700 leading-relaxed max-h-36 overflow-y-auto">
              {activeAlarm.description}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 space-y-2">
            <button
              onClick={() => {
                soundAlarm.stopAlarm();
                onMarkDone(activeAlarm);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold rounded-2xl shadow-md shadow-emerald-600/30 transition text-sm"
            >
              <CheckCircle2 size={18} />
              {isMedicine ? t('med_taken_btn', lang) : t('task_done_btn', lang)}
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  soundAlarm.stopAlarm();
                  onSnooze(activeAlarm);
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-bold active:scale-98 transition"
              >
                <Clock size={15} />
                {t('snooze_5m', lang)}
              </button>

              <button
                onClick={() => {
                  soundAlarm.stopAlarm();
                  onDismiss();
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold active:scale-98 transition"
              >
                <VolumeX size={15} />
                {t('turn_off_alarm', lang)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
