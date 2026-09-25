import React, { useEffect } from 'react';
import { BellRing, CheckCircle2, Clock, VolumeX } from 'lucide-react';
import { soundAlarm } from '../services/audioService';
import { t } from '../services/i18n';

export default function AlarmModal({ activeAlarm, onDismiss, onMarkDone, onSnooze, lang = 'gu' }) {
  useEffect(() => {
    if (activeAlarm) {
      soundAlarm.startAlarm(activeAlarm.type === 'medicine' ? 'medicine' : 'meeting');
    }
    return () => {
      soundAlarm.stopAlarm();
    };
  }, [activeAlarm]);

  if (!activeAlarm) return null;

  const isMedicine = activeAlarm.type === 'medicine';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-amber-400 animate-alarm">
        {/* Top Alarm Icon banner */}
        <div className={`p-6 text-center text-white ${isMedicine ? 'bg-gradient-to-br from-teal-500 to-emerald-600' : 'bg-gradient-to-br from-blue-600 to-indigo-700'}`}>
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center animate-bounce">
            <BellRing size={32} className="text-white" />
          </div>
          <span className="inline-block px-3 py-1 bg-white/25 rounded-full text-xs font-semibold tracking-wide uppercase">
            {isMedicine ? t('alarm_med_badge', lang) : t('alarm_reminder_badge', lang)}
          </span>
          <h2 className="mt-2 text-2xl font-bold text-white leading-tight">
            {activeAlarm.title}
          </h2>
          <p className="mt-1 text-sm text-white/90 font-medium">
            {t('time_label', lang)} {activeAlarm.time}
          </p>
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
                <span className={`font-bold px-2 py-0.5 rounded-md ${
                  activeAlarm.mealRelation === 'before_food'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {activeAlarm.mealRelation === 'before_food' ? t('hunger_empty_stomach', lang) : t('after_food_full', lang)}
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
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs text-xs text-slate-700 leading-relaxed">
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
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-semibold rounded-2xl shadow-md transition"
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
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-xl text-xs font-semibold active:scale-98 transition"
              >
                <Clock size={15} />
                {t('snooze_5m', lang)}
              </button>

              <button
                onClick={() => {
                  soundAlarm.stopAlarm();
                  onDismiss();
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold active:scale-98 transition"
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
