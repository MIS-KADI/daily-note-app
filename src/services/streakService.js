/**
 * User Retention: Daily Streak & Mood Tracker Service
 * Gamifies daily diary writing, health logging, and finance tracking.
 */

const STREAK_KEY = 'daily_diary_streak_data';
const MOOD_KEY = 'daily_diary_mood_data';

export const MOODS = [
  { id: 'awesome', emoji: '🤩', labelGu: 'ઉત્સાહિત', labelHi: 'उत्साहित', labelEn: 'Awesome', color: 'from-amber-400 to-orange-500' },
  { id: 'good', emoji: '😊', labelGu: 'સારો / ખુશ', labelHi: 'खुश / अच्छा', labelEn: 'Good', color: 'from-emerald-400 to-teal-500' },
  { id: 'neutral', emoji: '😐', labelGu: 'સામાન્ય', labelHi: 'सामान्य', labelEn: 'Neutral', color: 'from-blue-400 to-indigo-500' },
  { id: 'tired', emoji: '😔', labelGu: 'થાકેલા / ઉદાસ', labelHi: 'थका / उदास', labelEn: 'Tired', color: 'from-purple-400 to-pink-500' },
  { id: 'stressed', emoji: '😤', labelGu: 'તણાવપૂર્ણ', labelHi: 'तनावग्रस्त', labelEn: 'Stressed', color: 'from-rose-400 to-red-500' },
];

export const streakService = {
  getStreakData() {
    try {
      const data = localStorage.getItem(STREAK_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Error reading streak data:', e);
    }
    return {
      currentStreak: 1,
      longestStreak: 1,
      lastActiveDate: new Date().toISOString().split('T')[0],
      activeDates: [new Date().toISOString().split('T')[0]],
    };
  },

  recordActivityToday() {
    const todayStr = new Date().toISOString().split('T')[0];
    const data = this.getStreakData();

    if (data.lastActiveDate === todayStr) {
      return data; // Already recorded today
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newCurrentStreak = 1;
    if (data.lastActiveDate === yesterdayStr) {
      // Consecutive day!
      newCurrentStreak = (data.currentStreak || 0) + 1;
    }

    const newLongestStreak = Math.max(newCurrentStreak, data.longestStreak || 1);
    const activeDates = Array.from(new Set([...(data.activeDates || []), todayStr]));

    const updated = {
      currentStreak: newCurrentStreak,
      longestStreak: newLongestStreak,
      lastActiveDate: todayStr,
      activeDates,
    };

    try {
      localStorage.setItem(STREAK_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Error saving streak:', e);
    }
    return updated;
  },

  getBadge(streak) {
    if (streak >= 30) return { title: '👑 લાઈફસ્ટાઈલ લીજેન્ડ (30+ Days)', icon: '👑' };
    if (streak >= 15) return { title: '⭐ ડાયરી માસ્ટર (15+ Days)', icon: '⭐' };
    if (streak >= 7) return { title: '🔥 સતત સપ્તાહ ચેમ્પિયન (7+ Days)', icon: '🔥' };
    if (streak >= 3) return { title: '🌱 સતત ૩ દિવસ સ્ટ્રીક (3+ Days)', icon: '🌱' };
    return { title: '✨ દૈનિક યાત્રા શરૂ કરી', icon: '✨' };
  },

  // Mood Tracker APIs
  getAllMoods() {
    try {
      const m = localStorage.getItem(MOOD_KEY);
      if (m) return JSON.parse(m);
    } catch (e) {
      console.warn('Error reading mood data:', e);
    }
    return {};
  },

  getTodayMood() {
    const todayStr = new Date().toISOString().split('T')[0];
    const all = this.getAllMoods();
    return all[todayStr] || null;
  },

  saveTodayMood(moodId) {
    const todayStr = new Date().toISOString().split('T')[0];
    const all = this.getAllMoods();
    all[todayStr] = {
      moodId,
      timestamp: new Date().toISOString(),
    };
    try {
      localStorage.setItem(MOOD_KEY, JSON.stringify(all));
      this.recordActivityToday(); // also counts towards streak!
    } catch (e) {
      console.warn('Error saving mood:', e);
    }
    return all;
  },
};
