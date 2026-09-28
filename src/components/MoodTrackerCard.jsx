import React, { useState, useEffect } from 'react';
import { Flame, Sparkles, Heart, Smile, Trophy, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';
import { streakService, MOODS } from '../services/streakService';

export default function MoodTrackerCard({ lang = 'gu' }) {
  const [streakData, setStreakData] = useState(() => streakService.getStreakData());
  const [todayMood, setTodayMood] = useState(() => streakService.getTodayMood());
  const [allMoods, setAllMoods] = useState(() => streakService.getAllMoods());

  useEffect(() => {
    // Record activity on mount
    const updated = streakService.recordActivityToday();
    setStreakData(updated);
  }, []);

  const handleSelectMood = (moodId) => {
    const updatedAll = streakService.saveTodayMood(moodId);
    setAllMoods(updatedAll);
    setTodayMood(streakService.getTodayMood());
    const updatedStreak = streakService.getStreakData();
    setStreakData(updatedStreak);

    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
  };

  const badge = streakService.getBadge(streakData.currentStreak);

  // Get last 7 days keys for mini mood history
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString(lang === 'gu' ? 'gu-IN' : 'en-US', { weekday: 'narrow' });
    return { dateStr, dayName, mood: allMoods[dateStr] };
  });

  return (
    <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-rose-500/10 rounded-3xl p-4 border border-amber-300/40 shadow-xs space-y-3.5">
      {/* Top Streak Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-500/30 animate-bounce-slow text-base">
            🔥
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-sm text-slate-800 leading-tight">
                {streakData.currentStreak} {lang === 'hi' ? 'दिनों की स्ट्रीक!' : lang === 'en' ? 'Days Streak!' : 'દિવસની સ્ટ્રીક!'}
              </h3>
              <span className="text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300/50 px-2 py-0.2 rounded-full">
                {badge.title}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {streakData.currentStreak > 1
                ? (lang === 'hi' ? 'लगातार डायरी लिखने के लिए बधाई! आगे बढ़ते रहें।' : lang === 'en' ? 'Great job writing diary consistently! Keep it up.' : 'સતત ડાયરી લખવા બદલ અભિનંદન! આગળ વધતા રહો.')
                : (lang === 'hi' ? 'रोज़ ऐप खोलें और अपनी डायरी स्ट्रीक बनाएं!' : lang === 'en' ? 'Open daily to build your diary streak!' : 'રોજ એપ ખોલો અને તમારી ડાયરી સ્ટ્રીક બનાવો!')}
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 block font-semibold">
            {lang === 'hi' ? 'सर्वश्रेष्ठ' : lang === 'en' ? 'Best' : 'શ્રેષ્ઠ સ્કોર'}
          </span>
          <span className="text-xs font-bold text-amber-700 flex items-center gap-0.5 justify-end">
            <Trophy size={12} /> {streakData.longestStreak} {lang === 'hi' ? 'दिन' : lang === 'en' ? 'days' : 'દિવસ'}
          </span>
        </div>
      </div>

      {/* Mood Selector Section */}
      <div className="bg-white/80 backdrop-blur-xs rounded-2xl p-3 border border-amber-200/50 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <Smile size={14} className="text-orange-500" />
            {lang === 'hi' ? 'आज आपका दिन कैसा रहा? (Daily Mood)' : lang === 'en' ? 'How was your day? (Daily Mood)' : 'આજે તમારો દિવસ કેવો રહ્યો? (Daily Mood)'}
          </span>
          {todayMood && (
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              {lang === 'hi' ? 'दर्ज ✅' : lang === 'en' ? 'Recorded ✅' : 'નોંધાયેલ ✅'}
            </span>
          )}
        </div>

        {/* 5 Emojis */}
        <div className="grid grid-cols-5 gap-1.5 pt-1">
          {MOODS.map((m) => {
            const isSelected = todayMood?.moodId === m.id;
            return (
              <button
                key={m.id}
                onClick={() => handleSelectMood(m.id)}
                className={`py-2 px-1 rounded-2xl flex flex-col items-center justify-center gap-1 transition active:scale-90 ${
                  isSelected
                    ? 'bg-amber-100 border-2 border-amber-400 shadow-sm scale-105'
                    : 'bg-slate-50/70 hover:bg-amber-50 border border-slate-200/80 hover:border-amber-200'
                }`}
              >
                <span className="text-xl leading-none">{m.emoji}</span>
                <span className="text-[9px] font-bold text-slate-600 truncate max-w-full">
                  {lang === 'hi' ? m.labelHi : lang === 'en' ? m.labelEn : m.labelGu}
                </span>
              </button>
            );
          })}
        </div>

        {/* 7-Day Mini Calendar Dots */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between px-1">
          <span className="text-[10px] text-slate-400 font-medium">
            {lang === 'hi' ? 'पिछले 7 दिन:' : lang === 'en' ? 'Last 7 days:' : 'છેલ્લા ૭ દિવસ:'}
          </span>
          <div className="flex gap-2">
            {last7Days.map((d, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    d.mood
                      ? 'bg-amber-100 border border-amber-300'
                      : 'bg-slate-100 border border-slate-200 text-slate-300'
                  }`}
                  title={`${d.dateStr}: ${d.mood?.moodId || 'No entry'}`}
                >
                  {d.mood ? (
                    MOODS.find((m) => m.id === d.mood.moodId)?.emoji || '•'
                  ) : (
                    '·'
                  )}
                </div>
                <span className="text-[8px] text-slate-400 uppercase">{d.dayName}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
