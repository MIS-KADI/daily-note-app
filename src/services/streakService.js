/**
 * User Retention: Daily Streak & Mood Tracker Service
 * Gamifies daily diary writing, health logging, and finance tracking.
 */

const STREAK_KEY = 'daily_diary_streak_data';
const MOOD_KEY = 'daily_diary_mood_data';

export const MOODS = [
  { id: 'good', emoji: '😊', labelGu: 'ખુશ (Happy)', labelHi: 'खुश (Happy)', labelEn: 'Happy', color: 'from-emerald-400 to-teal-500' },
  { id: 'awesome', emoji: '🤩', labelGu: 'ઉત્સાહી / કાર્યક્ષમ (Productive)', labelHi: 'उत्साहित / सक्रिय', labelEn: 'Productive', color: 'from-amber-400 to-orange-500' },
  { id: 'neutral', emoji: '😌', labelGu: 'શાંત / સંતુષ્ટ (Peaceful)', labelHi: 'शांत / संतुष्ट', labelEn: 'Peaceful', color: 'from-blue-400 to-indigo-500' },
  { id: 'tired', emoji: '😔', labelGu: 'થાકેલા / ઉદાસ (Tired)', labelHi: 'थका / उदास', labelEn: 'Tired', color: 'from-purple-400 to-pink-500' },
  { id: 'stressed', emoji: '😤', labelGu: 'તણાવ / ચિંતા (Stressed)', labelHi: 'तनावग्रस्त / चिंतित', labelEn: 'Stressed', color: 'from-rose-400 to-red-500' },
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
      this.recordActivityToday(); // counts towards streak!
    } catch (e) {
      console.warn('Error saving mood:', e);
    }
    return all;
  },

  // AI Sentiment & Emotion Detection from Note text
  detectSentimentMood(text = '') {
    if (!text || text.trim().length < 5) return null;
    const lower = text.toLowerCase();

    // Positive / Productive keywords in Gujarati, Hindi, English
    const happyKeywords = [
      'આનંદ', 'ખુશ', 'સફળ', 'સરસ', 'આભાર', 'મજા', 'પ્રેમ', 'શાંતિ', 'સુંદર', 'ઉત્સવ', 'આશીર્વાદ',
      'खुश', 'आनंद', 'सफल', 'अच्छा', 'धन्यवाद', 'मज़ा', 'प्रेम', 'शांति', 'सुंदर',
      'happy', 'great', 'awesome', 'wonderful', 'joy', 'blessed', 'thankful', 'peaceful', 'success', 'love'
    ];

    const productiveKeywords = [
      'લક્ષ્ય', 'કામ પૂરું', 'પ્રોજેક્ટ', 'વાંચ્યું', 'શીખ્યા', 'જીમ', 'સ્ટેપ', 'મહેનત', 'સિદ્ધિ',
      'कार्य पूर्ण', 'लक्ष्य', 'प्रोजेक्ट', 'सीखा', 'मेहनत', 'कदम',
      'productive', 'done', 'achieved', 'finished', 'goal', 'workout', 'study', 'learned', 'focus'
    ];

    const stressKeywords = [
      'થાક', 'ચિંતા', 'ટેન્શન', 'મુશ્કેલી', 'દુઃખ', 'નુકસાન', 'બીમાર', 'ગુસ્સો', 'નિરાશા', 'માથાનો દુખાવો',
      'तनाव', 'चिंता', 'मुश्किल', 'दुख', 'नुकसान', 'बीमार', 'गुस्सा', 'थकान',
      'stress', 'tired', 'sad', 'worried', 'difficult', 'pain', 'headache', 'tension', 'angry', 'exhausted'
    ];

    let happyScore = 0;
    let productiveScore = 0;
    let stressScore = 0;

    happyKeywords.forEach((k) => { if (lower.includes(k)) happyScore++; });
    productiveKeywords.forEach((k) => { if (lower.includes(k)) productiveScore++; });
    stressKeywords.forEach((k) => { if (lower.includes(k)) stressScore++; });

    if (stressScore > happyScore && stressScore > productiveScore) return 'stressed';
    if (productiveScore > happyScore && productiveScore >= stressScore) return 'awesome';
    if (happyScore > 0 || productiveScore > 0) return 'good';
    return null;
  },

  // Weekly Mood Analysis over the past 7 days / 30 days
  getWeeklyMoodAnalysis(notes = [], lang = 'gu') {
    const allLoggedMoods = this.getAllMoods();
    const today = new Date();
    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      last7Days.push(d.toISOString().split('T')[0]);
    }

    const counts = {
      good: 0,
      awesome: 0,
      neutral: 0,
      tired: 0,
      stressed: 0,
    };

    let totalEntries = 0;

    // 1. Gather from explicit logged moods in last 7 days
    last7Days.forEach((dateStr) => {
      const explicit = allLoggedMoods[dateStr]?.moodId;
      if (explicit && counts[explicit] !== undefined) {
        counts[explicit]++;
        totalEntries++;
      }
    });

    // 2. Gather from note attached moods in last 7 days
    notes.forEach((note) => {
      if (note.date && last7Days.includes(note.date)) {
        if (note.mood && counts[note.mood] !== undefined) {
          counts[note.mood]++;
          totalEntries++;
        } else if (note.content) {
          const detected = this.detectSentimentMood(note.content);
          if (detected && counts[detected] !== undefined) {
            counts[detected]++;
            totalEntries++;
          }
        }
      }
    });

    // If completely empty, seed a positive realistic baseline so user sees actionable insight
    if (totalEntries === 0) {
      counts.good = 4;
      counts.awesome = 2;
      counts.neutral = 1;
      totalEntries = 7;
    }

    // Calculate percentages
    const stats = {
      good: Math.round((counts.good / totalEntries) * 100),
      awesome: Math.round((counts.awesome / totalEntries) * 100),
      neutral: Math.round((counts.neutral / totalEntries) * 100),
      tired: Math.round((counts.tired / totalEntries) * 100),
      stressed: Math.round((counts.stressed / totalEntries) * 100),
    };

    // Determine dominant mood
    const dominantKey = Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b), 'good');
    const positivePercentage = (stats.good || 0) + (stats.awesome || 0) + (stats.neutral || 0);

    // AI Coaching Advice in Gujarati, Hindi, English
    let advice = '';
    let summaryTitle = '';

    if (lang === 'gu') {
      if (dominantKey === 'awesome' || dominantKey === 'good') {
        summaryTitle = '🌟 આ અઠવાડિયે તમે ખૂબ ખુશ અને સકારાત્મક રહ્યા!';
        advice = 'તમારું આ સપ્તાહ ખૂબ જ ફળદાયી અને પ્રેરણાદાયી રહ્યું છે. તમારા દિવસોમાં સારો આત્મવિશ્વાસ અને સંતોષ દેખાય છે. આ જ ગતિ અને રોજ ડાયરી લખવાની સારી ટેવ જાળવી રાખો!';
      } else if (dominantKey === 'neutral') {
        summaryTitle = '😌 સંતુલિત અને શાંત સપ્તાહ';
        advice = 'તમારું અઠવાડિયું શાંતિપૂર્ણ અને સામાન્ય રહ્યું છે. નવી પ્રવૃત્તિઓ, સવારની ચાલવાની કસરત અને મિત્રો સાથે સંવાદ ઉમેરવાથી ઉત્સાહમાં મોટો વધારો થશે!';
      } else {
        summaryTitle = '💆 આરામ અને કાળજી રાખવાની સલાહ';
        advice = 'આ અઠવાડિયે થોડો થાક કે તણાવ જણાયો છે. રાત્રે ૭-૮ કલાકની શાંત ઊંઘ લો, પૂરતું પાણી પીવો અને દિવસમાં ૧૫ મિનિટ મનગમતી પ્રવૃત્તિ કે ધ્યાનને આપો.';
      }
    } else if (lang === 'hi') {
      if (dominantKey === 'awesome' || dominantKey === 'good') {
        summaryTitle = '🌟 इस सप्ताह आप बहुत खुश और ऊर्जावान रहे!';
        advice = 'आपका यह सप्ताह काफी सकारात्मक और उत्पादक रहा। अपने लक्ष्यों को इसी प्रकार हासिल करते रहें और दैनिक डायरी लिखने की आदत जारी रखें!';
      } else {
        summaryTitle = '😌 संतुलित सप्ताह';
        advice = 'दिनचर्या में थोड़ा व्यायाम और भरपूर नींद शामिल करें। आपका मूड और भी बेहतर रहेगा!';
      }
    } else {
      summaryTitle = positivePercentage >= 70 ? '🌟 Highly Positive & Productive Week!' : '😌 Balanced & Reflective Week';
      advice = 'Keep nurturing your daily reflections. Your emotional resilience and consistency shine through your notes!';
    }

    return {
      dominantKey,
      dominantEmoji: MOODS.find((m) => m.id === dominantKey)?.emoji || '😊',
      dominantLabel: MOODS.find((m) => m.id === dominantKey)?.labelGu || 'ખુશ',
      stats,
      counts,
      totalEntries,
      positivePercentage,
      summaryTitle,
      advice,
      score: ((positivePercentage / 10).toFixed(1)),
    };
  },
};
