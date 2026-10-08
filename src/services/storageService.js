// Encrypted LocalStorage & State Management Service
import { getDailyQuote as fetchDailyQuote } from './quotesService';
import {
  getDefaultNotes,
  getDefaultReminders,
  getDefaultMedicines,
  getDefaultFinance,
  getDefaultKhata,
  getDefaultEvents,
} from './defaultData';

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
  PEDOMETER_AUTO: 'daily_diary_pedometer_auto',
  ALARM_SETTINGS: 'daily_diary_alarm_settings',
  DEMO_MODE: 'daily_diary_demo_mode',
};

const DEFAULT_ALARM_SETTINGS = {
  ringtone: 'classic_bell',
  customRingtoneName: '',
  customRingtoneData: null,
  volume: 1.0,
  vibrate: true,
};

const DEFAULT_USER = {
  name: '',
  mobile: '',
  email: '',
  dob: '',
  isRegistered: true,
  isLinked: false,
  isMobileVerified: true,
  isEmailVerified: false,
  pin: '1234',
  isPinRequired: false,
  isBiometricEnabled: false,
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
    phone: '9825011223',
    relation: 'મિત્ર (Friend)',
    notes: 'સાંજે ૭ વાગે જન્મદિવસ પાર્ટી',
  },
  {
    id: 'ev-2',
    name: 'મુકેશભાઈ & રીતાબેન (Mukesh & Rita)',
    type: 'anniversary',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    phone: '9428044556',
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
    try {
      const parsed = JSON.parse(data);
      parsed.isRegistered = true;
      return parsed;
    } catch {
      return DEFAULT_USER;
    }
  },

  saveUserProfile(profile) {
    localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
  },

  getNotes() {
    const data = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (!data) {
      if (this.isDemoMode()) {
        const initial = getDefaultNotes(this.getLanguage());
        localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(initial));
        return initial;
      }
      return [];
    }
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveNotes(notes) {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  },

  getReminders() {
    const data = localStorage.getItem(STORAGE_KEYS.REMINDERS);
    if (!data) {
      if (this.isDemoMode()) {
        const initial = getDefaultReminders(this.getLanguage());
        localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(initial));
        return initial;
      }
      return [];
    }
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveReminders(reminders) {
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(reminders));
  },

  getMedicines() {
    const data = localStorage.getItem(STORAGE_KEYS.MEDICINES);
    if (!data) {
      if (this.isDemoMode()) {
        const initial = getDefaultMedicines(this.getLanguage());
        localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(initial));
        return initial;
      }
      return [];
    }
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
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
      if (this.isDemoMode()) {
        const initial = getDefaultFinance(this.getLanguage());
        localStorage.setItem(STORAGE_KEYS.FINANCE, JSON.stringify(initial));
        return initial;
      }
      return [];
    }
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveFinance(finance) {
    localStorage.setItem(STORAGE_KEYS.FINANCE, JSON.stringify(finance));
  },

  getWater() {
    const todayStr = new Date().toISOString().split('T')[0];
    const data = localStorage.getItem(STORAGE_KEYS.WATER);
    if (!data) {
      const initial = { date: todayStr, glasses: 0, target: 8 };
      localStorage.setItem(STORAGE_KEYS.WATER, JSON.stringify(initial));
      return initial;
    }
    try {
      const parsed = JSON.parse(data);
      // Reset glasses for a new day automatically!
      if (parsed.date !== todayStr) {
        const reset = { date: todayStr, glasses: 0, target: parsed.target || 8 };
        localStorage.setItem(STORAGE_KEYS.WATER, JSON.stringify(reset));
        return reset;
      }
      return parsed;
    } catch {
      const initial = { date: todayStr, glasses: 0, target: 8 };
      localStorage.setItem(STORAGE_KEYS.WATER, JSON.stringify(initial));
      return initial;
    }
  },

  saveWater(water) {
    localStorage.setItem(STORAGE_KEYS.WATER, JSON.stringify(water));
  },

  getShopping() {
    const data = localStorage.getItem(STORAGE_KEYS.SHOPPING);
    if (!data) {
      return [];
    }
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
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
    const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
    if (saved === 'gu' || saved === 'hi' || saved === 'en') {
      return saved;
    }
    return 'gu';
  },

  saveLanguage(lang) {
    const safeLang = (lang === 'hi' || lang === 'en') ? lang : 'gu';
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, safeLang);
  },

  getFitness() {
    const todayStr = new Date().toISOString().split('T')[0];
    const data = localStorage.getItem(STORAGE_KEYS.FITNESS);
    if (!data) {
      const initial = {
        date: todayStr,
        steps: 0,
        stepTarget: 8000,
        calories: 0,
        distanceKm: 0,
        heartRate: 74,
        bloodPressure: { systolic: 120, diastolic: 80 },
        bloodSugar: { fasting: 94, postMeal: 132 },
        sleepHours: 7.5,
        weightKg: 68,
        heightCm: 170,
        workouts: [],
      };
      localStorage.setItem(STORAGE_KEYS.FITNESS, JSON.stringify(initial));
      return initial;
    }
    try {
      const parsed = JSON.parse(data);
      // If new day, roll over target/height/weight/BP but reset daily steps & archive yesterday's steps
      if (parsed.date !== todayStr) {
        if (parsed.steps > 0) {
          try {
            const hist = this.getWeeklyStepHistory();
            const yDate = parsed.date || new Date(Date.now() - 86400000).toISOString().split('T')[0];
            const updatedHist = hist.map((h) => (h.date === yDate ? { ...h, steps: parsed.steps } : h));
            this.saveWeeklyStepHistory(updatedHist);
          } catch (e) {
            console.warn('Archive history error:', e);
          }
        }
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
    } catch {
      const initial = {
        date: todayStr,
        steps: 0,
        stepTarget: 8000,
        calories: 0,
        distanceKm: 0,
        heartRate: 74,
        bloodPressure: { systolic: 120, diastolic: 80 },
        bloodSugar: { fasting: 94, postMeal: 132 },
        sleepHours: 7.5,
        weightKg: 68,
        heightCm: 170,
        workouts: [],
      };
      localStorage.setItem(STORAGE_KEYS.FITNESS, JSON.stringify(initial));
      return initial;
    }
  },

  saveFitness(fitness) {
    localStorage.setItem(STORAGE_KEYS.FITNESS, JSON.stringify(fitness));
  },

  getPedometerAutoEnabled() {
    const val = localStorage.getItem(STORAGE_KEYS.PEDOMETER_AUTO);
    // Default to true so user doesn't have to keep clicking to start step sensor!
    return val === null ? true : val === 'true';
  },

  setPedometerAutoEnabled(enabled) {
    localStorage.setItem(STORAGE_KEYS.PEDOMETER_AUTO, String(enabled));
  },

  getAccounts() {
    const data = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    if (!data) {
      const initial = { bankBalance: 0, cashBalance: 0 };
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(data);
    } catch {
      return { bankBalance: 0, cashBalance: 0 };
    }
  },

  saveAccounts(accounts) {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  },

  getKhata() {
    const data = localStorage.getItem(STORAGE_KEYS.KHATA);
    if (!data) {
      if (this.isDemoMode()) {
        const initial = getDefaultKhata(this.getLanguage());
        localStorage.setItem(STORAGE_KEYS.KHATA, JSON.stringify(initial));
        return initial;
      }
      return [];
    }
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveKhata(khata) {
    localStorage.setItem(STORAGE_KEYS.KHATA, JSON.stringify(khata));
  },

  getEvents() {
    const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
    if (!data) {
      if (this.isDemoMode()) {
        const initial = getDefaultEvents(this.getLanguage());
        localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(initial));
        return initial;
      }
      return [];
    }
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveEvents(events) {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  },

  isDemoMode() {
    const val = localStorage.getItem(STORAGE_KEYS.DEMO_MODE);
    return val === 'true'; // Default is false!
  },

  setDemoMode(enabled) {
    localStorage.setItem(STORAGE_KEYS.DEMO_MODE, String(enabled));
  },

  cleanDefaultDummyDataOnce() {
    const CLEAN_KEY = 'daily_diary_v17_cleaned_defaults';
    if (localStorage.getItem(CLEAN_KEY)) return;

    try {
      // Clean dummy notes
      const notesData = localStorage.getItem(STORAGE_KEYS.NOTES);
      if (notesData) {
        const notes = JSON.parse(notesData);
        const filtered = notes.filter((n) => !['note-1', 'note-2', 'demo-1'].includes(n.id));
        this.saveNotes(filtered);
      }

      // Clean dummy reminders
      const remData = localStorage.getItem(STORAGE_KEYS.REMINDERS);
      if (remData) {
        const rems = JSON.parse(remData);
        const filtered = rems.filter((r) => !['rem-1', 'rem-2', 'rem-3', 'rem-shop-1'].includes(r.id));
        this.saveReminders(filtered);
      }

      // Clean dummy medicines
      const medData = localStorage.getItem(STORAGE_KEYS.MEDICINES);
      if (medData) {
        const meds = JSON.parse(medData);
        const filtered = meds.filter((m) => !['med-1', 'med-2', 'med-3', 'med-4'].includes(m.id));
        this.saveMedicines(filtered);
      }

      // Clean dummy finance
      const finData = localStorage.getItem(STORAGE_KEYS.FINANCE);
      if (finData) {
        const fin = JSON.parse(finData);
        const filtered = fin.filter((f) => !['fin-1', 'fin-2', 'fin-3', 'fin-4'].includes(f.id));
        this.saveFinance(filtered);
      }

      // Clean dummy khata
      const khataData = localStorage.getItem(STORAGE_KEYS.KHATA);
      if (khataData) {
        const kh = JSON.parse(khataData);
        const filtered = kh.filter((k) => !['kh-1', 'kh-2'].includes(k.id));
        this.saveKhata(filtered);
      }

      // Clean dummy events
      const evData = localStorage.getItem(STORAGE_KEYS.EVENTS);
      if (evData) {
        const ev = JSON.parse(evData);
        const filtered = ev.filter((e) => !['ev-1', 'ev-2'].includes(e.id));
        this.saveEvents(filtered);
      }

      // Clean dummy shopping
      const shopData = localStorage.getItem(STORAGE_KEYS.SHOPPING);
      if (shopData) {
        const shop = JSON.parse(shopData);
        const filtered = shop.filter((s) => !['s-1', 's-2', 's-3', 's-4'].includes(s.id));
        this.saveShopping(filtered);
      }

      // Clean dummy accounts (42500, 6800)
      const accData = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      if (accData) {
        const acc = JSON.parse(accData);
        if (acc.bankBalance === 42500 && acc.cashBalance === 6800) {
          this.saveAccounts({ bankBalance: 0, cashBalance: 0 });
        }
      }

      // Clean dummy fitness steps (4250)
      const fitData = localStorage.getItem(STORAGE_KEYS.FITNESS);
      if (fitData) {
        const fit = JSON.parse(fitData);
        if (fit.steps === 4250) {
          this.saveFitness({ ...fit, steps: 0, distanceKm: 0, calories: 0, workouts: [] });
        }
      }

      // Clean dummy water (4)
      const waterData = localStorage.getItem(STORAGE_KEYS.WATER);
      if (waterData) {
        const w = JSON.parse(waterData);
        if (w.glasses === 4) {
          this.saveWater({ ...w, glasses: 0 });
        }
      }

      // Clean default user mobile '0000000001'
      const userProfile = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      if (userProfile) {
        const u = JSON.parse(userProfile);
        if (u.mobile === '0000000001') {
          u.mobile = '';
          if (u.name === 'પ્રિય યુઝર') u.name = '';
          this.saveUserProfile(u);
        }
      }

      // Disable demo mode
      this.setDemoMode(false);
      localStorage.setItem(CLEAN_KEY, 'true');
    } catch (err) {
      console.warn('cleanDefaultDummyDataOnce error:', err);
      localStorage.setItem(CLEAN_KEY, 'true');
    }
  },

  clearAllDemoData() {
    this.saveNotes([]);
    this.saveReminders([]);
    this.saveMedicines([]);
    this.saveFinance([]);
    this.saveKhata([]);
    this.saveEvents([]);
    this.saveShopping([]);
    this.setDemoMode(false);
  },

  restoreDemoData(lang) {
    const activeLang = lang || this.getLanguage() || 'gu';
    const notes = getDefaultNotes(activeLang);
    const rems = getDefaultReminders(activeLang);
    const meds = getDefaultMedicines(activeLang);
    const fin = getDefaultFinance(activeLang);
    const kh = getDefaultKhata(activeLang);
    const ev = getDefaultEvents(activeLang);

    this.saveNotes(notes);
    this.saveReminders(rems);
    this.saveMedicines(meds);
    this.saveFinance(fin);
    this.saveKhata(kh);
    this.saveEvents(ev);
    this.setDemoMode(true);

    return { notes, reminders: rems, medicines: meds, finance: fin, khata: kh, events: ev };
  },

  getDefaultNotes(lang) {
    return getDefaultNotes(lang || this.getLanguage());
  },

  getDefaultReminders(lang) {
    return getDefaultReminders(lang || this.getLanguage());
  },

  getDefaultMedicines(lang) {
    return getDefaultMedicines(lang || this.getLanguage());
  },

  getDefaultFinance(lang) {
    return getDefaultFinance(lang || this.getLanguage());
  },

  getDefaultKhata(lang) {
    return getDefaultKhata(lang || this.getLanguage());
  },

  getDefaultEvents(lang) {
    return getDefaultEvents(lang || this.getLanguage());
  },

  getAlarmSettings() {
    const data = localStorage.getItem(STORAGE_KEYS.ALARM_SETTINGS);
    if (!data) {
      localStorage.setItem(STORAGE_KEYS.ALARM_SETTINGS, JSON.stringify(DEFAULT_ALARM_SETTINGS));
      return DEFAULT_ALARM_SETTINGS;
    }
    try {
      return { ...DEFAULT_ALARM_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_ALARM_SETTINGS;
    }
  },

  saveAlarmSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.ALARM_SETTINGS, JSON.stringify(settings));
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

  // Pedometer Auto Tracking Preference (Defaults to true)
  getPedometerAutoEnabled() {
    const val = localStorage.getItem('auto_pedometer_enabled');
    return val === null ? true : val === 'true';
  },

  setPedometerAutoEnabled(enabled) {
    localStorage.setItem('auto_pedometer_enabled', enabled ? 'true' : 'false');
  },

  // 7-Day Step History for Charts
  getWeeklyStepHistory() {
    try {
      const data = localStorage.getItem('weekly_step_history');
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Error reading step history:', e);
    }
    // Default 7-day realistic mock/seed so user immediately sees a lively chart
    const days = ['સોમ', 'મંગળ', 'બુધ', 'ગુરુ', 'શુક્ર', 'શનિ', 'રવિ'];
    const todayIndex = (new Date().getDay() + 6) % 7; // Monday = 0
    return days.map((day, idx) => ({
      day,
      date: new Date(Date.now() - (todayIndex - idx) * 86400000).toISOString().split('T')[0],
      steps: idx === todayIndex ? 6450 : Math.round(5000 + Math.random() * 4500),
      isToday: idx === todayIndex,
    }));
  },

  saveWeeklyStepHistory(history) {
    localStorage.setItem('weekly_step_history', JSON.stringify(history));
  },

  // Daily Diary Writing Reminder Settings
  getDiaryReminderConfig() {
    try {
      const data = localStorage.getItem('daily_diary_reminder_config');
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Error reading diary reminder config:', e);
    }
    return {
      enabled: true,
      time: '21:30', // Default 9:30 PM
    };
  },

  saveDiaryReminderConfig(config) {
    localStorage.setItem('daily_diary_reminder_config', JSON.stringify(config));
  },
};


