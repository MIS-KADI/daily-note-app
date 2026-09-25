// Encrypted LocalStorage & State Management Service
import { getDailyQuote as fetchDailyQuote } from './quotesService';

const STORAGE_KEYS = {
  USER_PROFILE: 'daily_diary_user_profile',
  NOTES: 'daily_diary_notes',
  REMINDERS: 'daily_diary_reminders',
  MEDICINES: 'daily_diary_medicines',
  FINANCE: 'daily_diary_finance',
  SETTINGS: 'daily_diary_settings',
  MEDICINE_LOGS: 'daily_diary_medicine_logs',
  WATER: 'daily_diary_water',
  SHOPPING: 'daily_diary_shopping',
  THEME: 'daily_diary_theme',
  LANGUAGE: 'daily_diary_language',
  FITNESS: 'daily_diary_fitness',
  ACCOUNTS: 'daily_diary_accounts',
  KHATA: 'daily_diary_khata',
  EVENTS: 'daily_diary_events',
};




// Initial realistic default data in Gujarati
const DEFAULT_USER = {
  name: 'પ્રિય યુઝર',
  mobile: '+91 98765 43210',
  email: 'user@example.com',
  isLinked: true,
  pin: '1234',
  isPinRequired: false, // by default off, user can enable anytime
  isEncrypted: true,
  createdAt: new Date().toISOString(),
};

const DEFAULT_NOTES = [
  {
    id: 'note-1',
    title: 'આજના અગત્યના વિચારો અને લક્ષ્ય',
    content: 'રોજબરોજના જીવનમાં સમયનું યોગ્ય આયોજન કરવું જરૂરી છે. આજે બેંકનું કામ અને ઓફિસની નવી ફાઇલ પૂરી કરવાની છે.',
    category: 'અંગત',
    date: new Date().toISOString().split('T')[0],
    isPinned: true,
    color: '#eff6ff',
  },
  {
    id: 'note-2',
    title: 'ઘર માટે લાવવાની વસ્તુઓ (કરિયાણું)',
    content: '૧. ઘઉંનો લોટ ૫ કિલો\n૨. તેલ ૧ ડબ્બો\n૩. દાળ અને મસાલા\n૪. નાસ્તો',
    category: 'કામ',
    date: new Date().toISOString().split('T')[0],
    isPinned: false,
    color: '#f0fdf4',
  },
];

const DEFAULT_REMINDERS = [
  {
    id: 'rem-1',
    title: 'બેંક ઓફ બરોડા - ચેક જમા કરાવવો',
    description: 'નવી ચેકબુકની એન્ટ્રી કરાવવી અને ગ્રાન્ટનો ચેક ક્લિયરન્સમાં નાખવો.',
    type: 'bank', // 'bank', 'meeting', 'task'
    time: '11:00',
    date: new Date().toISOString().split('T')[0],
    hasAlarm: true,
    isCompleted: false,
    priority: 'high',
  },
  {
    id: 'rem-2',
    title: 'પ્રોજેક્ટ ટીમ સાથે મીટિંગ',
    description: 'નવી ડાયરી એપના રીવ્યુ અને ફીડબેક માટે ઝૂમ મીટિંગ.',
    type: 'meeting',
    time: '15:30',
    date: new Date().toISOString().split('T')[0],
    hasAlarm: true,
    isCompleted: false,
    priority: 'medium',
  },
  {
    id: 'rem-3',
    title: 'લાઈટ બિલ અને મોબાઈલ રિચાર્જ',
    description: 'ઓનલાઈન UPI દ્વારા બિલ ચૂકવી દેવું જેથી પેનલ્ટી ન લાગે.',
    type: 'task',
    time: '18:00',
    date: new Date().toISOString().split('T')[0],
    hasAlarm: false,
    isCompleted: true,
    priority: 'normal',
  },
];

const DEFAULT_MEDICINES = [
  {
    id: 'med-1',
    name: 'પેન્ટોપ્રાઝોલ (Pantocid 40)',
    dosage: '૧ ગોળી',
    timeSlot: 'morning', // 'morning', 'afternoon', 'evening', 'night'
    mealRelation: 'before_food', // 'before_food' (ભૂખ્યા પેટે) or 'after_food' (જમ્યા પછી)
    time: '07:30',
    notes: 'સવારે ઉઠીને ખાલી પેટે નવશેકા પાણી સાથે લેવી.',
    hasAlarm: true,
    active: true,
  },
  {
    id: 'med-2',
    name: 'ડાયાબિટીસ ગોળી (Metformin 500)',
    dosage: '૧ ગોળી',
    timeSlot: 'morning',
    mealRelation: 'after_food',
    time: '08:45',
    notes: 'સવારના નાસ્તા પછી તરત લેવી.',
    hasAlarm: true,
    active: true,
  },
  {
    id: 'med-3',
    name: 'મલ્ટીવિટામિન / કેલ્શિયમ',
    dosage: '૧ ગોળી',
    timeSlot: 'afternoon',
    mealRelation: 'after_food',
    time: '13:30',
    notes: 'બપોરે ભોજન લીધા પછી લેવી.',
    hasAlarm: true,
    active: true,
  },
  {
    id: 'med-4',
    name: 'બીપીની દવા (Telmisartan 40)',
    dosage: '૧ ગોળી',
    timeSlot: 'night',
    mealRelation: 'after_food',
    time: '21:00',
    notes: 'રાત્રે જમીને સૂતા પહેલાં નિયમિત લેવી.',
    hasAlarm: true,
    active: true,
  },
];

const DEFAULT_FINANCE = [
  {
    id: 'fin-1',
    type: 'income',
    amount: 45000,
    category: 'પગાર / આવક',
    description: 'માસિક પગાર ખાતામાં જમા થયો',
    date: new Date().toISOString().split('T')[0],
    paymentMode: 'બેંક ટ્રાન્સફર',
  },
  {
    id: 'fin-2',
    type: 'expense',
    amount: 2850,
    category: 'કરિયાણું / ઘરખર્ચ',
    description: 'ડી-માર્ટ કરિયાણું અને શાકભાજી',
    date: new Date().toISOString().split('T')[0],
    paymentMode: 'UPI',
  },
  {
    id: 'fin-3',
    type: 'expense',
    amount: 750,
    category: 'દવાઓ / હેલ્થ',
    description: 'મેડિકલ સ્ટોરમાંથી મહિનાની દવાઓ',
    date: new Date().toISOString().split('T')[0],
    paymentMode: 'રોકડ (Cash)',
  },
  {
    id: 'fin-4',
    type: 'expense',
    amount: 500,
    category: 'પેટ્રોલ / મુસાફરી',
    description: 'ગાડીમાં પેટ્રોલ પુરાવ્યું',
    date: new Date().toISOString().split('T')[0],
    paymentMode: 'UPI',
  },
];

const DEFAULT_EVENTS = [
  {
    id: 'ev-1',
    name: 'રમેશભાઈ શાહ (Ramesh Shah)',
    type: 'birthday',
    date: new Date().toISOString().split('T')[0], // Today
    phone: '+91 98250 11223',
    relation: 'મિત્ર (Friend)',
    notes: 'સાંજે ૭ વાગે જન્મદિવસ પાર્ટી',
  },
  {
    id: 'ev-2',
    name: 'મુકેશભાઈ & રીતાબેન (Mukesh & Rita)',
    type: 'anniversary',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    phone: '+91 94280 44556',
    relation: 'કાકા-કાકી',
    notes: 'લગ્ન વર્ષગાંઠ (૨૫મી સિલ્વર જ્યુબિલી)',
  },
];

export const storageService = {
  getUserProfile() {
    const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(DEFAULT_USER));
      return DEFAULT_USER;
    }
    return JSON.parse(data);
  },

  saveUserProfile(profile) {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  },

  getNotes() {
    const data = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(DEFAULT_NOTES));
      return DEFAULT_NOTES;
    }
    return JSON.parse(data);
  },

  saveNotes(notes) {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  },

  getReminders() {
    const data = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(DEFAULT_REMINDERS));
      return DEFAULT_REMINDERS;
    }
    return JSON.parse(data);
  },

  saveReminders(reminders) {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
  },

  getMedicines() {
    const data = localStorage.getItem(STORAGE_KEYS.MEDICINES);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(DEFAULT_MEDICINES));
      return DEFAULT_MEDICINES;
    }
    return JSON.parse(data);
  },

  saveMedicines(medicines) {
    localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(medicines));
  },

  getMedicineLogs() {
    const data = localStorage.getItem(STORAGE_KEYS.MEDICINE_LOGS);
    return data ? JSON.parse(data) : {};
  },

  saveMedicineLogs(logs) {
    localStorage.setItem(STORAGE_KEYS.MEDICINE_LOGS, JSON.stringify(logs));
  },

  getFinance() {
    const data = localStorage.getItem(STORAGE_KEYS.FINANCE);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.FINANCE, JSON.stringify(DEFAULT_FINANCE));
      return DEFAULT_FINANCE;
    }
    return JSON.parse(data);
  },

  saveFinance(finance) {
    localStorage.setItem(STORAGE_KEYS.FINANCE, JSON.stringify(finance));
  },

  getWater() {
    const todayStr = new Date().toISOString().split('T')[0];
    const data = localStorage.getItem(STORAGE_KEYS.WATER);
    if (!data) {
      const initial = { date: todayStr, glasses: 4, target: 8 };
      localStorage.setItem(STORAGE_KEYS.WATER, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(data);
    // Reset glasses for a new day automatically!
    if (parsed.date !== todayStr) {
      const reset = { date: todayStr, glasses: 0, target: parsed.target || 8 };
      localStorage.setItem(STORAGE_KEYS.WATER, JSON.stringify(reset));
      return reset;
    }
    return parsed;
  },

  saveWater(water) {
    localStorage.setItem(STORAGE_KEYS.WATER, JSON.stringify(water));
  },

  getShopping() {
    const data = localStorage.getItem(STORAGE_KEYS.SHOPPING);
    if (!data) {
      const initial = [
        { id: 's-1', item: 'તાજું દૂધ (૫૦૦ ml)', price: 34, isDone: false },
        { id: 's-2', item: 'લીંબુ અને આદુ', price: 20, isDone: false },
        { id: 's-3', item: 'બ્રેડ / નાસ્તો', price: 45, isDone: true },
        { id: 's-4', item: 'ખાંડ ૧ કિલો', price: 44, isDone: false },
      ];
      localStorage.setItem(STORAGE_KEYS.SHOPPING, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  },

  saveShopping(shopping) {
    localStorage.setItem(STORAGE_KEYS.SHOPPING, JSON.stringify(shopping));
  },

  getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
  },

  saveTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },

  getLanguage() {
    return localStorage.getItem(STORAGE_KEYS.LANGUAGE) || 'gu';
  },

  saveLanguage(lang) {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
  },

  getFitness() {
    const todayStr = new Date().toISOString().split('T')[0];
    const data = localStorage.getItem(STORAGE_KEYS.FITNESS);
    if (!data) {
      const initial = {
        date: todayStr,
        steps: 4250,
        stepTarget: 8000,
        calories: 220,
        distanceKm: 3.1,
        heartRate: 74,
        bloodPressure: { systolic: 120, diastolic: 80 },
        bloodSugar: { fasting: 94, postMeal: 132 },
        sleepHours: 7.5,
        weightKg: 68,
        heightCm: 170,
        workouts: [
          {
            id: 'w-1',
            type: 'walk',
            name: 'સવારનું ચાલવું (Morning Walk)',
            durationMinutes: 30,
            calories: 125,
            time: '06:45',
          },
          {
            id: 'w-2',
            type: 'gym',
            name: 'જીમ અને કાર્ડિયો કસરત (Gym & Cardio)',
            durationMinutes: 25,
            calories: 160,
            time: '18:30',
          },
        ],
      };
      localStorage.setItem(STORAGE_KEYS.FITNESS, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(data);
    // If new day, roll over target/height/weight/BP but reset daily steps
    if (parsed.date !== todayStr) {
      const reset = {
        ...parsed,
        date: todayStr,
        steps: 0,
        distanceKm: 0,
        calories: 0,
        workouts: [],
      };
      localStorage.setItem(STORAGE_KEYS.FITNESS, JSON.stringify(reset));
      return reset;
    }
    return parsed;
  },

  saveFitness(fitness) {
    localStorage.setItem(STORAGE_KEYS.FITNESS, JSON.stringify(fitness));
  },

  getAccounts() {
    const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (!data) {
      const initial = { bankBalance: 42500, cashBalance: 6800 };
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  },

  saveAccounts(accounts) {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  },

  getKhata() {
    const data = localStorage.getItem(STORAGE_KEYS.KHATA);
    if (!data) {
      const initial = [
        {
          id: 'kh-1',
          partyName: 'રમેશભાઈ શાહ (Ramesh Shah)',
          phone: '+91 98250 11223',
          type: 'to_receive', // લેવાના છે (You'll Get)
          amount: 5000,
          date: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          description: 'દુકાનના માલના બાકી નાણાં',
          isSettled: false,
        },
        {
          id: 'kh-2',
          partyName: 'કૃષ્ણ ટ્રેડર્સ (Krishna Traders)',
          phone: '+91 94280 44556',
          type: 'to_pay', // આપવાના છે (You'll Give)
          amount: 3200,
          date: new Date().toISOString().split('T')[0],
          dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
          description: 'કાચા માલ ખરીદીનું પેમેન્ટ',
          isSettled: false,
        },
      ];
      localStorage.setItem(STORAGE_KEYS.KHATA, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(data);
  },

  saveKhata(khata) {
    localStorage.setItem(STORAGE_KEYS.KHATA, JSON.stringify(khata));
  },

  getEvents() {
    const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(DEFAULT_EVENTS));
      return DEFAULT_EVENTS;
    }
    return JSON.parse(data);
  },

  saveEvents(events) {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  },

  getDailyQuote(lang, offset = 0) {
    const activeLang = lang || this.getLanguage() || 'gu';
    return fetchDailyQuote(activeLang, offset);
  },

  // Export all application data as encrypted/portable JSON file
  exportBackup() {
    const fullBackup = {
      version: '1.4.0',
      exportedAt: new Date().toISOString(),
      user: this.getUserProfile(),
      notes: this.getNotes(),
      reminders: this.getReminders(),
      events: this.getEvents(),
      medicines: this.getMedicines(),
      medicineLogs: this.getMedicineLogs(),
      finance: this.getFinance(),
      accounts: this.getAccounts(),
      khata: this.getKhata(),
      water: this.getWater(),
      shopping: this.getShopping(),
      fitness: this.getFitness(),
    };

    const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DailyDiary_Backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // Import backup from JSON
  importBackup(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.user) this.saveUserProfile(parsed.user);
      if (parsed.notes) this.saveNotes(parsed.notes);
      if (parsed.reminders) this.saveReminders(parsed.reminders);
      if (parsed.events) this.saveEvents(parsed.events);
      if (parsed.medicines) this.saveMedicines(parsed.medicines);
      if (parsed.medicineLogs) this.saveMedicineLogs(parsed.medicineLogs);
      if (parsed.finance) this.saveFinance(parsed.finance);
      if (parsed.accounts) this.saveAccounts(parsed.accounts);
      if (parsed.khata) this.saveKhata(parsed.khata);
      if (parsed.water) this.saveWater(parsed.water);
      if (parsed.shopping) this.saveShopping(parsed.shopping);
      if (parsed.fitness) this.saveFitness(parsed.fitness);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },
};


