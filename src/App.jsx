import React, { useState, useEffect, useRef, useCallback } from 'react';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import CalculatorModal from './components/CalculatorModal';
import AlarmModal from './components/AlarmModal';
import PinLockModal from './components/PinLockModal';
import ShoppingModal from './components/ShoppingModal';
import EmergencyModal from './components/EmergencyModal';
import LanguageModal from './components/LanguageModal';
import SmartAssistantModal from './components/SmartAssistantModal';
import BankSmsParserModal from './components/BankSmsParserModal';
import UpiPaymentModal from './components/UpiPaymentModal';
import MobilePermissionsModal from './components/MobilePermissionsModal';
import PhotoGalleryModal from './components/PhotoGalleryModal';
import DemoModeBanner from './components/DemoModeBanner';
import DemoModeModal from './components/DemoModeModal';
import confetti from 'canvas-confetti';

// Tabs
import HomeTab from './components/tabs/HomeTab';
import NotesTab from './components/tabs/NotesTab';
import RemindersTab from './components/tabs/RemindersTab';
import HealthHubTab from './components/tabs/HealthHubTab';
import FinanceTab from './components/tabs/FinanceTab';
import ReportsTab from './components/tabs/ReportsTab';
import ProfileTab from './components/tabs/ProfileTab';

// Services
import { Capacitor } from '@capacitor/core';
import { storageService } from './services/storageService';
import { notificationService } from './services/notificationService';
import { streakService } from './services/streakService';
import { pedometerService } from './services/pedometerService';

// Clean default mock dummy data once for fresh/updated v17 install
storageService.cleanDefaultDummyDataOnce();

export default function App() {
  // State from LocalStorage
  const [user, setUser] = useState(() => storageService.getUserProfile());
  const [notes, setNotes] = useState(() => storageService.getNotes());
  const [reminders, setReminders] = useState(() => storageService.getReminders());
  const [medicines, setMedicines] = useState(() => storageService.getMedicines());
  const [medicineLogs, setMedicineLogs] = useState(() => storageService.getMedicineLogs());
  const [fitness, setFitness] = useState(() => storageService.getFitness());
  const [finance, setFinance] = useState(() => storageService.getFinance());
  const [accounts, setAccounts] = useState(() => storageService.getAccounts());
  const [khata, setKhata] = useState(() => storageService.getKhata());
  const [events, setEvents] = useState(() => storageService.getEvents());
  const [water, setWater] = useState(() => storageService.getWater());
  const [shoppingList, setShoppingList] = useState(() => storageService.getShopping());
  const [theme, setTheme] = useState(() => storageService.getTheme());
  const [lang, setLang] = useState(() => storageService.getLanguage());
  const [quoteOffset, setQuoteOffset] = useState(0);
  const dailyQuote = storageService.getDailyQuote(lang, quoteOffset);

  // Demo Mode State
  const [isDemoMode, setIsDemoMode] = useState(() => storageService.isDemoMode());
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [pendingDemoAction, setPendingDemoAction] = useState(null);

  // App UI State
  const [activeTab, setActiveTab] = useState('home');
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isShoppingOpen, setIsShoppingOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isPhotoGalleryOpen, setIsPhotoGalleryOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [activeAlarm, setActiveAlarm] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isMobilePermissionsOpen, setIsMobilePermissionsOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantAutoStart, setAssistantAutoStart] = useState(false);
  const [isSmsParserOpen, setIsSmsParserOpen] = useState(false);
  const [upiModalData, setUpiModalData] = useState(null);
  const [isStepSensorActive, setIsStepSensorActive] = useState(false);
  const [needsSensorPermission, setNeedsSensorPermission] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Active Date tracker for Midnight / Daily Health Auto-Reset
  const currentDateRef = useRef(new Date().toISOString().split('T')[0]);

  // Monitor network online/offline state
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Track fired alarms to prevent duplicate ringing in the same minute
  const firedAlarmsRef = useRef(new Set());

  // Check PIN or Biometric lock on launch (for registered users)
  useEffect(() => {
    if (user?.isRegistered) {
      if (user?.isPinRequired || user?.isBiometricEnabled) {
        setIsLocked(true);
      }
    } else {
      setIsSignupOpen(true);
    }
  }, []);

  // Detect standalone PWA mode (Add to Home Screen)
  useEffect(() => {
    const isStandaloneMode =
      window.matchMedia?.('(display-mode: standalone)')?.matches ||
      window.navigator?.standalone ||
      document.referrer.includes('android-app://');
    setIsStandalone(Boolean(isStandaloneMode));
  }, []);

  // Sync dark theme class to html/body/documentElement for Tailwind dark: variants and full mobile screen coverage
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.add('dark-theme');
      if (document.body) {
        document.body.classList.add('dark');
        document.body.classList.add('dark-theme');
      }
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.remove('dark-theme');
      if (document.body) {
        document.body.classList.remove('dark');
        document.body.classList.remove('dark-theme');
      }
    }
  }, [theme]);

  // Sync background alarms with Android native AlarmManager (via Capacitor)
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      notificationService.requestPermission();

      // Schedule reminder alarms in Android AlarmManager
      reminders.forEach((rem) => {
        if (rem.hasAlarm && !rem.isCompleted && rem.time && rem.date) {
          notificationService.scheduleNativeAlarm({
            id: rem.id,
            title: `⏰ કામનું એલાર્મ: ${rem.title}`,
            body: rem.description || `સમય: ${rem.time}`,
            dateStr: rem.date,
            timeStr: rem.time,
          });
        }
      });

      // Schedule active medicines in Android AlarmManager
      const today = new Date().toISOString().split('T')[0];
      medicines.forEach((med) => {
        if (med.active && med.hasAlarm && med.time) {
          notificationService.scheduleNativeAlarm({
            id: med.id,
            title: `💊 દવા લેવાનો સમય: ${med.name}`,
            body: `${med.dosage} - ${med.mealRelation === 'before_food' ? 'ભૂખ્યા પેટે' : 'જમ્યા પછી'} (${med.time})`,
            dateStr: today,
            timeStr: med.time,
          });
        }
      });

      // Schedule daily diary habit notification in Android AlarmManager
      const diaryConfig = storageService.getDiaryReminderConfig();
      if (diaryConfig?.enabled && diaryConfig?.time) {
        notificationService.scheduleNativeAlarm({
          id: 'diary-nightly-reminder',
          title: '📔 ડાયરી લખવાનો સમય થયો!',
          body: 'આજના દિવસની યાદો, વિચારો અને મૂડ નોંધી લો. તમારી 🔥 સ્ટ્રીક જાળવી રાખો!',
          dateStr: today,
          timeStr: diaryConfig.time,
        });
      }
    }
  }, [reminders, medicines]);

  // Save changes to storage whenever states change
  const handleUpdateUser = (updated) => {
    setUser(updated);
    storageService.saveUserProfile(updated);
  };

  const handleSaveNotes = (updated) => {
    setNotes(updated);
    storageService.saveNotes(updated);
  };

  const handleSaveReminders = (updated) => {
    setReminders(updated);
    storageService.saveReminders(updated);
  };

  const handleSaveMedicines = (updated) => {
    setMedicines(updated);
    storageService.saveMedicines(updated);
  };

  const handleSaveFinance = (updated) => {
    setFinance(updated);
    storageService.saveFinance(updated);
  };

  const handleSaveAccounts = (updated) => {
    setAccounts(updated);
    storageService.saveAccounts(updated);
  };

  const handleSaveKhata = (updated) => {
    setKhata(updated);
    storageService.saveKhata(updated);
  };

  const handleSaveEvents = (updated) => {
    setEvents(updated);
    storageService.saveEvents(updated);
  };

  const handleUpdateFitness = (updated) => {
    setFitness(updated);
    storageService.saveFitness(updated);
  };

  // Live Pedometer & Motion Sensor increment handler (functional update prevents stale closures)
  const handleStepIncrement = useCallback((stepCount = 1) => {
    setFitness((prevFitness) => {
      const currentSteps = prevFitness?.steps || 0;
      const nextSteps = currentSteps + stepCount;
      const nextKm = Number(((nextSteps * 0.76) / 1000).toFixed(2));
      const workoutCalories = (prevFitness?.workouts || []).reduce(
        (sum, w) => sum + Number(w.calories || 0),
        0
      );
      const nextCalories = Math.round(nextSteps * 0.045) + workoutCalories;

      const updated = {
        ...prevFitness,
        steps: nextSteps,
        distanceKm: nextKm,
        calories: nextCalories,
      };

      storageService.saveFitness(updated);
      return updated;
    });
  }, []);

  // Hardware Step Counter Sync (Synchronizes steps walked while app was closed or in background)
  const handleSetExactSteps = useCallback((totalSteps) => {
    if (typeof totalSteps !== 'number' || isNaN(totalSteps) || totalSteps <= 0) return;
    setFitness((prevFitness) => {
      if (totalSteps <= (prevFitness?.steps || 0)) {
        return prevFitness;
      }
      const nextSteps = totalSteps;
      const nextKm = Number(((nextSteps * 0.76) / 1000).toFixed(2));
      const workoutCalories = (prevFitness?.workouts || []).reduce(
        (sum, w) => sum + Number(w.calories || 0),
        0
      );
      const nextCalories = Math.round(nextSteps * 0.045) + workoutCalories;

      const updated = {
        ...prevFitness,
        steps: nextSteps,
        distanceKm: nextKm,
        calories: nextCalories,
      };

      storageService.saveFitness(updated);
      return updated;
    });
  }, []);

  const handleToggleStepSensor = async () => {
    if (isStepSensorActive) {
      pedometerService.setAutoTrackingEnabled(false);
      pedometerService.stopTracking();
    } else {
      pedometerService.setAutoTrackingEnabled(true);
      const started = await pedometerService.startTracking();
      if (!started) {
        alert(
          lang === 'gu'
            ? 'આ બ્રાઉઝરમાં મોશન સેન્સર પરમિશન નથી મળી અથવા ડિવાઇસ સેન્સર સપોર્ટ કરતું નથી. તમે ઝડપી બટન અથવા હેલ્થ એપ સિન્ક વાપરી શકો છો.'
            : 'Motion sensor permission not granted or device not supported.'
        );
      }
    }
  };

  const handleGrantSensorPermission = async () => {
    pedometerService.setAutoTrackingEnabled(true);
    const started = await pedometerService.startTracking();
    if (started) {
      setNeedsSensorPermission(false);
    }
  };

  // Live Pedometer & Motion Sensor background listener
  useEffect(() => {
    const unsubStep = pedometerService.addListener((stepCount) => {
      handleStepIncrement(stepCount);
    });

    const unsubExact = pedometerService.addExactStepsListener((exactSteps) => {
      handleSetExactSteps(exactSteps);
    });

    const unsubStatus = pedometerService.addStatusListener((isActive) => {
      setIsStepSensorActive(isActive);
    });

    // Auto-start sensor automatically on app launch / install
    const autoStartSensors = async () => {
      if (pedometerService.isAutoTrackingEnabled()) {
        try {
          const started = await pedometerService.startTracking();
          setIsStepSensorActive(Boolean(started));
          setNeedsSensorPermission(!started);
        } catch (e) {
          console.warn('Pedometer auto start error:', e);
        }
      }
    };

    autoStartSensors();
    const timer1 = setTimeout(autoStartSensors, 800);
    const timer2 = setTimeout(autoStartSensors, 2500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      unsubStep();
      unsubExact();
      unsubStatus();
    };
  }, [handleStepIncrement, handleSetExactSteps]);

  // Reload all data (e.g. after backup restore)
  const handleReloadAllData = () => {
    setUser(storageService.getUserProfile());
    setNotes(storageService.getNotes());
    setReminders(storageService.getReminders());
    setEvents(storageService.getEvents());
    setMedicines(storageService.getMedicines());
    setMedicineLogs(storageService.getMedicineLogs());
    setFitness(storageService.getFitness());
    setFinance(storageService.getFinance());
    setAccounts(storageService.getAccounts());
    setKhata(storageService.getKhata());
  };

  // Toggle medicine taken status for today
  const handleToggleMedicine = (medId) => {
    const todayStr = new Date().toISOString().split('T')[0];
    const currentStatus = !!medicineLogs[todayStr]?.[medId]?.taken;
    const updatedLogs = {
      ...medicineLogs,
      [todayStr]: {
        ...(medicineLogs[todayStr] || {}),
        [medId]: {
          taken: !currentStatus,
          timestamp: new Date().toISOString(),
        },
      },
    };
    setMedicineLogs(updatedLogs);
    storageService.saveMedicineLogs(updatedLogs);
  };

  // Toggle reminder completed
  const handleToggleReminder = (remId) => {
    const updated = reminders.map((r) =>
      r.id === remId ? { ...r, isCompleted: !r.isCompleted } : r
    );
    handleSaveReminders(updated);
  };

  // Water intake handler
  const handleUpdateWater = (updated) => {
    setWater(updated);
    storageService.saveWater(updated);
  };

  // Shopping list handler
  const handleSaveShopping = (updated) => {
    setShoppingList(updated);
    storageService.saveShopping(updated);
  };

  // Direct transfer shopping to expenses
  const handleAddShoppingExpense = (amount, description) => {
    setActiveTab('finance');
    const newEntry = {
      id: 'fin-' + Date.now(),
      type: 'expense',
      amount,
      category: 'કરિયાણું / ઘરખર્ચ',
      description,
      paymentMode: 'UPI (GPay/PhonePe)',
      date: new Date().toISOString().split('T')[0],
    };
    handleSaveFinance([newEntry, ...finance]);
  };

  // Theme toggle handler
  const handleToggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    storageService.saveTheme(next);
  };

  // Language selection handler - dynamically translates all demo content if in demo mode
  const handleSelectLang = (newLang) => {
    setLang(newLang);
    storageService.saveLanguage(newLang);

    // If still in demo mode, update all demo entries to match the newly selected language!
    if (isDemoMode) {
      const newNotes = storageService.getDefaultNotes(newLang);
      const newReminders = storageService.getDefaultReminders(newLang);
      const newMeds = storageService.getDefaultMedicines(newLang);
      const newFin = storageService.getDefaultFinance(newLang);
      const newKhata = storageService.getDefaultKhata(newLang);
      const newEv = storageService.getDefaultEvents(newLang);

      setNotes(newNotes);
      storageService.saveNotes(newNotes);

      setReminders(newReminders);
      storageService.saveReminders(newReminders);

      setMedicines(newMeds);
      storageService.saveMedicines(newMeds);

      setFinance(newFin);
      storageService.saveFinance(newFin);

      setKhata(newKhata);
      storageService.saveKhata(newKhata);

      setEvents(newEv);
      storageService.saveEvents(newEv);
    }
  };

  // Demo Mode Action Handlers
  const handleClearDemoData = (postAction) => {
    storageService.clearAllDemoData();
    setNotes([]);
    setReminders([]);
    setMedicines([]);
    setFinance([]);
    setKhata([]);
    setEvents([]);
    setShoppingList([]);
    setIsDemoMode(false);
    setIsDemoModalOpen(false);

    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
    });

    if (typeof postAction === 'function') {
      postAction();
    } else if (typeof pendingDemoAction === 'function') {
      const act = pendingDemoAction;
      setPendingDemoAction(null);
      act();
    }
  };

  const handleRestoreDemoData = () => {
    const data = storageService.restoreDemoData(lang);
    setNotes(data.notes);
    setReminders(data.reminders);
    setMedicines(data.medicines);
    setFinance(data.finance);
    setKhata(data.khata);
    setEvents(data.events);
    setIsDemoMode(true);
    confetti({
      particleCount: 50,
      spread: 60,
    });
  };

  const checkCanAdd = () => true;

  // Transfer calculated amount directly to finance
  const handleTransferAmount = (amount, type) => {
    setActiveTab('finance');
    const newEntry = {
      id: 'fin-' + Date.now(),
      type,
      amount,
      category: type === 'expense' ? 'કરિયાણું / ઘરખર્ચ' : 'પગાર / આવક',
      description: 'કેલ્ક્યુલેટરમાંથી ગણેલ રકમ',
      paymentMode: 'UPI (GPay/PhonePe)',
      date: new Date().toISOString().split('T')[0],
    };
    handleSaveFinance([newEntry, ...finance]);
  };

  // Smart Voice Assistant & Bank SMS Handlers
  const handleAddParsedFinance = (tx) => {
    setActiveTab('finance');
    const newEntry = {
      id: 'fin-' + Date.now(),
      type: tx.type || 'expense',
      amount: Number(tx.amount || 0),
      category: tx.category || (tx.type === 'income' ? 'પગાર / આવક' : 'અન્ય ખર્ચ'),
      description: tx.description || '',
      paymentMode: tx.paymentMode || 'UPI (GPay/PhonePe)',
      date: tx.date || new Date().toISOString().split('T')[0],
    };
    handleSaveFinance([newEntry, ...finance]);
    streakService.recordActivityToday();
  };

  const handleAddParsedReminder = (rem) => {
    setActiveTab('reminders');
    const newRem = {
      id: 'rem-' + Date.now(),
      title: rem.title || 'નવું રીમાઇન્ડર',
      description: rem.description || '',
      date: rem.date || new Date().toISOString().split('T')[0],
      time: rem.time || '10:00',
      type: rem.type || 'task',
      hasAlarm: true,
      isCompleted: false,
      priority: 'high',
    };
    handleSaveReminders([newRem, ...reminders]);

    if (rem.type === 'shopping') {
      const cleanName = (rem.title || 'ખરીદી').replace(/^ખરીદી:\s*/, '').trim();
      const newShop = {
        id: 'shop-' + Date.now(),
        name: cleanName,
        quantity: '૧',
        category: 'કરિયાણું / શાકભાજી',
        completed: false,
        date: new Date().toISOString().split('T')[0],
      };
      handleSaveShopping([newShop, ...shoppingList]);
    }

    streakService.recordActivityToday();
  };

  const handleAddParsedKhata = (k) => {
    setActiveTab('finance');
    const newKhata = {
      id: 'kh-' + Date.now(),
      partyName: k.partyName || 'ગ્રાહક',
      phone: k.phone || '',
      type: k.type || 'to_receive',
      amount: Number(k.amount || 0),
      date: k.date || new Date().toISOString().split('T')[0],
      dueDate: k.dueDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      description: k.description || '',
      isSettled: false,
    };
    handleSaveKhata([newKhata, ...khata]);
    streakService.recordActivityToday();
  };

  const handleAddParsedNote = (n) => {
    setActiveTab('notes');
    const newNote = {
      id: 'note-' + Date.now(),
      title: n.title || 'નવી નોંધ',
      content: n.content || n.title || '',
      category: n.category || 'સામાન્ય',
      date: n.date || new Date().toISOString().split('T')[0],
      isPinned: false,
      tags: ['AI Voice'],
    };
    handleSaveNotes([newNote, ...notes]);
    streakService.recordActivityToday();
  };

  const handleAddParsedWater = (glassesCount = 1) => {
    const current = water?.glasses || 0;
    const updated = {
      ...water,
      glasses: current + glassesCount,
    };
    handleUpdateWater(updated);
    streakService.recordActivityToday();
  };

  const handleAddParsedMedicine = (med) => {
    setActiveTab('health');
    const newMed = {
      id: 'med-' + Date.now(),
      name: med.name || 'નવી દવા',
      dosage: med.dosage || '૧ ગોળી',
      timeSlot: med.timeSlot || 'morning',
      mealRelation: med.mealRelation || 'after_food',
      time: med.time || '08:30',
      notes: med.notes || 'AI Voice દ્વારા ઉમેરાયેલ',
      hasAlarm: true,
      active: true,
    };
    handleSaveMedicines([newMed, ...medicines]);
    streakService.recordActivityToday();
  };

  const handleAddParsedShopping = (item) => {
    setActiveTab('reminders');
    const rawName = item.name || item.title || 'નવી વસ્તુ';
    const cleanName = rawName.replace(/^ખરીદી:\s*/, '').trim();
    const quantity = item.quantity || '૧';
    const category = item.category || 'કરિયાણું / શાકભાજી';
    const today = new Date().toISOString().split('T')[0];

    // 1. Save to shoppingList
    const newItem = {
      id: 'shop-' + Date.now(),
      name: cleanName,
      quantity,
      category,
      completed: false,
      date: today,
    };
    handleSaveShopping([newItem, ...shoppingList]);

    // 2. Also save to reminders so it appears immediately under 'ખરીદી' filter in RemindersTab!
    const newRem = {
      id: 'rem-' + Date.now(),
      title: `ખરીદી: ${cleanName}`,
      description: `☐ ${cleanName} (${quantity})\nકેટેગરી: ${category}`,
      date: today,
      time: '11:00',
      type: 'shopping',
      hasAlarm: false,
      isCompleted: false,
      priority: 'high',
    };
    handleSaveReminders([newRem, ...reminders]);

    streakService.recordActivityToday();
  };

  const handleAddParsedEvent = (evt) => {
    setActiveTab('reminders');
    const newEvt = {
      id: 'evt-' + Date.now(),
      title: evt.title || 'નવો ઉત્સવ',
      personName: evt.personName || '',
      date: evt.date || new Date().toISOString().split('T')[0],
      type: evt.type || 'birthday',
      notes: evt.notes || '',
    };
    handleSaveEvents([newEvt, ...events]);
    streakService.recordActivityToday();
  };



  // Test Alarm trigger
  const handleTestAlarm = () => {
    const globalAlarmSettings = storageService.getAlarmSettings();
    setActiveAlarm({
      id: 'test-alarm-' + Date.now(),
      type: 'task',
      title: 'અગત્યનું કામ / મીટિંગ ટેસ્ટ',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      description: 'ટેસ્ટ એલાર્મ: મોબાઈલ રીંગટોન અને સાઉન્ડ સાથે!',
      ringtone: globalAlarmSettings?.ringtone || 'classic_bell',
      customAudioUrl: globalAlarmSettings?.customRingtoneData,
      customRingtoneName: globalAlarmSettings?.customRingtoneName,
    });
    notificationService.send('⏰ એલાર્મ ટેસ્ટ!', {
      body: 'મોબાઈલ રીંગટોન સાથે એલાર્મ કાર્યરત છે.',
    });
  };

  // Custom Alarm trigger (from medicine or reminder card)
  const handleCustomTriggerAlarm = (alarmData) => {
    const globalAlarmSettings = storageService.getAlarmSettings();
    const resolvedAlarm = {
      ...alarmData,
      ringtone: alarmData.ringtone || globalAlarmSettings?.ringtone || 'classic_bell',
      customAudioUrl: alarmData.customAudioUrl || globalAlarmSettings?.customRingtoneData,
      customRingtoneName: alarmData.customRingtoneName || globalAlarmSettings?.customRingtoneName,
    };
    setActiveAlarm(resolvedAlarm);
    notificationService.send(alarmData.title, {
      body: alarmData.description || `સમય: ${alarmData.time}`,
    });
  };

  // Dismiss Alarm
  const handleDismissAlarm = () => {
    setActiveAlarm(null);
  };

  // Snooze Alarm for 5 minutes
  const handleSnoozeAlarm = (alarm) => {
    setActiveAlarm(null);
    setTimeout(() => {
      setActiveAlarm(alarm);
    }, 5 * 60 * 1000);
  };

  // Mark done from alarm popup
  const handleMarkAlarmDone = (alarm) => {
    if (alarm.type === 'medicine') {
      const matchMed = medicines.find((m) => m.name === alarm.title);
      if (matchMed) {
        handleToggleMedicine(matchMed.id);
      }
    } else {
      const matchRem = reminders.find((r) => r.title === alarm.title);
      if (matchRem) {
        handleToggleReminder(matchRem.id);
      }
    }
    setActiveAlarm(null);
  };

  // Background Clock & Real-time Alarm Scheduler
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      // 0. Daily Health Metrics Auto-Reset on Date Rollover (Midnight / New Day)
      if (currentDateRef.current !== todayDateStr) {
        currentDateRef.current = todayDateStr;

        // Auto-reset water for the new day
        setWater((prevWater) => {
          const updated = { date: todayDateStr, glasses: 0, target: prevWater?.target || 8 };
          storageService.saveWater(updated);
          return updated;
        });

        // Auto-reset fitness (steps, distance, calories, workouts) & archive yesterday's steps
        setFitness((prevFitness) => {
          if (prevFitness?.steps > 0) {
            try {
              const hist = storageService.getWeeklyStepHistory();
              const yDate = prevFitness.date || new Date(Date.now() - 86400000).toISOString().split('T')[0];
              const updatedHist = hist.map((h) => (h.date === yDate ? { ...h, steps: prevFitness.steps } : h));
              storageService.saveWeeklyStepHistory(updatedHist);
            } catch (e) {
              console.warn('Daily step archive error:', e);
            }
          }
          const updated = {
            ...prevFitness,
            date: todayDateStr,
            steps: 0,
            distanceKm: 0,
            calories: 0,
            workouts: [],
          };
          storageService.saveFitness(updated);
          return updated;
        });
      }

      // 1. Check Medicine Alarms
      medicines.forEach((med) => {
        if (!med.active || !med.hasAlarm) return;
        const alarmKey = `med-${med.id}-${todayDateStr}-${currentTimeStr}`;
        const isAlreadyTaken = !!medicineLogs[todayDateStr]?.[med.id]?.taken;

        if (med.time === currentTimeStr && !isAlreadyTaken && !firedAlarmsRef.current.has(alarmKey)) {
          firedAlarmsRef.current.add(alarmKey);
          setActiveAlarm({
            id: med.id,
            type: 'medicine',
            title: med.name,
            dosage: med.dosage,
            time: med.time,
            mealRelation: med.mealRelation,
            notes: med.notes,
            ringtone: 'medicine',
          });

          notificationService.send(`💊 દવા લેવાનો સમય: ${med.name}`, {
            body: `${med.dosage} - ${med.mealRelation === 'before_food' ? 'ભૂખ્યા પેટે' : 'જમ્યા પછી'} (${med.time})`,
          });
        }
      });

      // 2. Check Reminder Alarms
      reminders.forEach((rem) => {
        if (rem.isCompleted || !rem.hasAlarm) return;
        const alarmKey = `rem-${rem.id}-${todayDateStr}-${currentTimeStr}`;

        if (
          rem.date === todayDateStr &&
          rem.time === currentTimeStr &&
          !firedAlarmsRef.current.has(alarmKey)
        ) {
          firedAlarmsRef.current.add(alarmKey);
          const globalAlarmSettings = storageService.getAlarmSettings();
          setActiveAlarm({
            id: rem.id,
            type: rem.type,
            title: rem.title,
            time: rem.time,
            description: rem.description,
            ringtone: rem.ringtone || globalAlarmSettings?.ringtone || 'classic_bell',
            customAudioUrl: rem.customAudioUrl || globalAlarmSettings?.customRingtoneData,
            customRingtoneName: rem.customRingtoneName || globalAlarmSettings?.customRingtoneName,
          });

          notificationService.send(`⏰ અગત્યનું કામ: ${rem.title}`, {
            body: rem.description || `સમય: ${rem.time}`,
          });
        }
      });

      // 3. Daily Diary Writing Reminder (Configurable time e.g., 21:00, 21:30, 22:00)
      const diaryConfig = storageService.getDiaryReminderConfig();
      const targetDiaryTime = diaryConfig?.time || '21:30';
      const diaryAlarmKey = `diary-${targetDiaryTime}-${todayDateStr}`;
      if (currentTimeStr === targetDiaryTime && diaryConfig?.enabled && !firedAlarmsRef.current.has(diaryAlarmKey)) {
        firedAlarmsRef.current.add(diaryAlarmKey);
        notificationService.send(
          lang === 'hi'
            ? '📔 डायरी लिखने का समय हो गया!'
            : lang === 'en'
            ? '📔 Time for your Daily Diary!'
            : '📔 ડાયરી લખવાનો સમય થયો!',
          {
            body:
              lang === 'hi'
                ? 'आज के दिन की यादें और खर्च दर्ज करें। अपनी 🔥 स्ट्रीक बनाए रखें!'
                : lang === 'en'
                ? 'Record today\'s memories and thoughts. Keep your 🔥 streak alive!'
                : 'આજના દિવસની યાદો અને વિચારો નોંધી લો અને તમારી 🔥 સ્ટ્રીક જાળવી રાખો!',
          }
        );
      }

      // 4. Periodic 2-Hour Water Reminder (10:00, 12:00, 14:00, 16:00, 18:00, 20:00)
      const waterReminderEnabled = localStorage.getItem('water_reminder_enabled') === 'true';
      const waterTimes = ['10:00', '12:00', '14:00', '16:00', '18:00', '20:00'];
      if (waterReminderEnabled && waterTimes.includes(currentTimeStr)) {
        const waterAlarmKey = `water-${todayDateStr}-${currentTimeStr}`;
        if (!firedAlarmsRef.current.has(waterAlarmKey)) {
          firedAlarmsRef.current.add(waterAlarmKey);
          notificationService.send(
            lang === 'hi'
              ? '💧 पानी पीने का समय!'
              : lang === 'en'
              ? '💧 Hydration Time!'
              : '💧 પાણી પીવાનો સમય થયો છે!',
            {
              body:
                lang === 'hi'
                  ? 'स्वस्थ रहने के लिए 1 गिलास पानी पी लें 🥛'
                  : lang === 'en'
                  ? 'Drink 1 glass of water to stay fresh and healthy 🥛'
                  : 'સ્વસ્થ અને હાઇડ્રેટેડ રહેવા માટે ૧ ગ્લાસ પાણી પી લો 🥛',
            }
          );
        }
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(timer);
  }, [medicines, reminders, medicineLogs, lang]);

  return (
    <div className={`mobile-app-wrapper ${theme === 'dark' ? 'dark-theme dark' : ''}`}>
      {/* Top Navbar */}
      <Navbar
        user={user}
        lang={lang}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenLanguage={() => setIsLanguageOpen(true)}
        onOpenCalculator={() => setIsCalculatorOpen(true)}
        onOpenShopping={() => setIsShoppingOpen(true)}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        onOpenPhotoGallery={() => setIsPhotoGalleryOpen(true)}
        onOpenAssistant={(autoStart = false) => {
          setAssistantAutoStart(Boolean(autoStart));
          setIsAssistantOpen(true);
        }}
        onTestAlarm={handleTestAlarm}
        onLockApp={() => setIsLocked(true)}
        onOpenMobilePermissions={() => setIsMobilePermissionsOpen(true)}
        activeAlarmCount={
          reminders.filter((r) => !r.isCompleted && r.hasAlarm).length +
          medicines.filter((m) => m.active && m.hasAlarm).length
        }
      />

      {/* Offline Mode Banner */}
      {isOffline && (
        <div className="bg-slate-900 text-white px-3.5 py-1.5 flex items-center justify-between text-xs border-b border-slate-800 animate-in slide-in-from-top">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-[11px]">
              {lang === 'gu'
                ? '🟢 ઓફલાઈન મોડ સક્ષમ - ઇન્ટરનેટ વગર પણ તમામ ડેટા સેવ થાય છે.'
                : lang === 'hi'
                ? '🟢 ऑफ़लाइन मोड सक्रिय - इंटरनेट के बिना भी सारा डेटा सुरक्षित रहेगा।'
                : '🟢 Offline Mode Active - Everything is saved locally.'}
            </span>
          </div>
        </div>
      )}

      {/* 1-Tap Sensor Permission Banner for iOS / Browsers */}
      {needsSensorPermission && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white px-3.5 py-2 flex items-center justify-between text-xs shadow-md border-b border-emerald-500 animate-in slide-in-from-top">
          <div className="flex items-center gap-2">
            <span className="text-base">👟</span>
            <div>
              <p className="font-bold leading-tight">
                {lang === 'hi' ? 'ऑटोमैटिक वॉकिंग स्टेप एक्टिव करें' : lang === 'en' ? 'Enable Auto Step Counter' : 'આપોઆપ વોકિંગ સ્ટેપ શરૂ કરો'}
              </p>
              <p className="text-[10px] text-emerald-100 leading-tight">
                {lang === 'hi' ? 'चलने पर अपने-आप कदम गिनने के लिए टैप करें' : lang === 'en' ? 'Tap to count steps automatically as you walk' : 'ચાલતી વખતે જાતે સ્ટેપ્સ ગણવા માટે ૧-ટેપ કરો'}
              </p>
            </div>
          </div>
          <button
            onClick={handleGrantSensorPermission}
            className="px-2.5 py-1 bg-white text-emerald-800 rounded-xl font-extrabold text-xs active:scale-95 transition shadow-xs shrink-0"
          >
            {lang === 'hi' ? 'एक्टિવ કરો' : lang === 'en' ? 'Enable' : 'શરૂ કરો'}
          </button>
        </div>
      )}

      {/* Main Tab View Container */}
      <main className="flex-1 p-3.5 overflow-y-auto">
        {activeTab === 'home' && (
          <HomeTab
            user={user}
            notes={notes}
            reminders={reminders}
            events={events}
            medicines={medicines}
            medicineLogs={medicineLogs}
            finance={finance}
            accounts={accounts}
            khata={khata}
            water={water}
            fitness={fitness}
            isStepSensorActive={isStepSensorActive}
            onToggleStepSensor={handleToggleStepSensor}
            onStepIncrement={handleStepIncrement}
            onUpdateWater={handleUpdateWater}
            onUpdateFitness={handleUpdateFitness}
            onOpenShopping={() => checkCanAdd(() => setIsShoppingOpen(true))}
            onOpenEmergency={() => setIsEmergencyOpen(true)}
            onOpenPhotoGallery={() => setIsPhotoGalleryOpen(true)}
            dailyQuote={dailyQuote}
            onNextQuote={() => setQuoteOffset((prev) => prev + 1)}
            lang={lang}
            onNavigate={(tab) => setActiveTab(tab)}
            onToggleMedicine={handleToggleMedicine}
            onToggleReminder={handleToggleReminder}
            onOpenCalculator={() => setIsCalculatorOpen(true)}
            onOpenAssistant={(autoStart = false) => {
              setAssistantAutoStart(Boolean(autoStart));
              setIsAssistantOpen(true);
            }}
            isDemoMode={isDemoMode}
            onClearDemo={() => handleClearDemoData()}
            checkCanAdd={checkCanAdd}
          />
        )}

        {activeTab === 'notes' && (
          <NotesTab
            notes={notes}
            onSaveNotes={handleSaveNotes}
            lang={lang}
            user={user}
            isDemoMode={isDemoMode}
            onClearDemo={() => handleClearDemoData()}
            checkCanAdd={checkCanAdd}
          />
        )}

        {activeTab === 'reminders' && (
          <RemindersTab
            reminders={reminders}
            onSaveReminders={handleSaveReminders}
            events={events}
            onSaveEvents={handleSaveEvents}
            onTriggerAlarm={handleCustomTriggerAlarm}
            onOpenShopping={() => checkCanAdd(() => setIsShoppingOpen(true))}
            shoppingList={shoppingList}
            onSaveShopping={handleSaveShopping}
            user={user}
            lang={lang}
            isDemoMode={isDemoMode}
            onClearDemo={() => handleClearDemoData()}
            checkCanAdd={checkCanAdd}
          />
        )}

        {(activeTab === 'health' || activeTab === 'medicine') && (
          <HealthHubTab
            medicines={medicines}
            medicineLogs={medicineLogs}
            onSaveMedicines={handleSaveMedicines}
            onToggleMedicine={handleToggleMedicine}
            onTriggerAlarm={handleCustomTriggerAlarm}
            fitness={fitness}
            isStepSensorActive={isStepSensorActive}
            onToggleStepSensor={handleToggleStepSensor}
            onStepIncrement={handleStepIncrement}
            onUpdateFitness={handleUpdateFitness}
            water={water}
            onUpdateWater={handleUpdateWater}
            lang={lang}
            initialSubTab={activeTab === 'medicine' ? 'medicines' : 'fitness'}
            isDemoMode={isDemoMode}
            onClearDemo={() => handleClearDemoData()}
            checkCanAdd={checkCanAdd}
          />
        )}

        {activeTab === 'finance' && (
          <FinanceTab
            finance={finance}
            onSaveFinance={handleSaveFinance}
            accounts={accounts}
            onSaveAccounts={handleSaveAccounts}
            khata={khata}
            onSaveKhata={handleSaveKhata}
            onOpenCalculator={() => setIsCalculatorOpen(true)}
            onOpenSmsParser={() => setIsSmsParserOpen(true)}
            onOpenUpiModal={(party) => setUpiModalData({ isOpen: true, party })}
            user={user}
            lang={lang}
            isDemoMode={isDemoMode}
            onClearDemo={() => handleClearDemoData()}
            checkCanAdd={checkCanAdd}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsTab
            user={user}
            notes={notes}
            reminders={reminders}
            events={events}
            medicines={medicines}
            medicineLogs={medicineLogs}
            finance={finance}
            accounts={accounts}
            khata={khata}
            fitness={fitness}
            lang={lang}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileTab
            user={user}
            onUpdateUser={handleUpdateUser}
            onReloadAllData={handleReloadAllData}
            onOpenMobilePermissions={() => setIsMobilePermissionsOpen(true)}
            onOpenPhotoGallery={() => setIsPhotoGalleryOpen(true)}
            lang={lang}
            isDemoMode={isDemoMode}
            onClearDemo={() => handleClearDemoData()}
            onRestoreDemo={handleRestoreDemoData}
          />
        )}
      </main>

      {/* Bottom Mobile Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} lang={lang} />

      {/* Language Selection Modal */}
      <LanguageModal
        isOpen={isLanguageOpen}
        onClose={() => setIsLanguageOpen(false)}
        currentLang={lang}
        onSelectLang={handleSelectLang}
      />

      {/* Shopping & Grocery Checklist Modal */}
      <ShoppingModal
        isOpen={isShoppingOpen}
        onClose={() => setIsShoppingOpen(false)}
        shoppingList={shoppingList}
        onSaveShopping={handleSaveShopping}
        onAddExpense={handleAddShoppingExpense}
        lang={lang}
      />

      {/* Emergency & Bank Helpline Modal */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        lang={lang}
      />

      {/* Calculator Modal */}
      <CalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        onTransferAmount={handleTransferAmount}
        lang={lang}
      />

      {/* Alarm Ringing Modal */}
      <AlarmModal
        activeAlarm={activeAlarm}
        onDismiss={handleDismissAlarm}
        onSnooze={handleSnoozeAlarm}
        onMarkDone={handleMarkAlarmDone}
        lang={lang}
      />

      {/* PIN Lock Screen Modal (Only when locked) */}
      {isLocked && (
        <PinLockModal
          correctPin={user?.pin || '1234'}
          isBiometricEnabled={user?.isBiometricEnabled ?? true}
          user={user}
          onUnlock={() => setIsLocked(false)}
          lang={lang}
        />
      )}

      {/* Smart Voice & NLP Assistant Modal */}
      <SmartAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => {
          setIsAssistantOpen(false);
          setAssistantAutoStart(false);
        }}
        autoStart={assistantAutoStart}
        lang={lang}
        onLanguageChange={setLang}
        onAddFinance={handleAddParsedFinance}
        onAddReminder={handleAddParsedReminder}
        onAddKhata={handleAddParsedKhata}
        onAddNote={handleAddParsedNote}
        onAddWater={handleAddParsedWater}
        onAddMedicine={handleAddParsedMedicine}
        onAddShopping={handleAddParsedShopping}
        onAddEvent={handleAddParsedEvent}
        onOpenMobilePermissions={() => setIsMobilePermissionsOpen(true)}
      />

      {/* Bank SMS Auto-Expense Parser Modal */}
      <BankSmsParserModal
        isOpen={isSmsParserOpen}
        onClose={() => setIsSmsParserOpen(false)}
        lang={lang}
        onAddTransaction={handleAddParsedFinance}
      />

      {/* UPI QR Code & WhatsApp Payment Link Modal */}
      <UpiPaymentModal
        isOpen={!!upiModalData?.isOpen}
        onClose={() => setUpiModalData(null)}
        party={upiModalData?.party}
        userUpiId={user?.upiId || ''}
        user={user}
        lang={lang}
      />

      {/* Mobile Permissions & Access Setup Modal */}
      <MobilePermissionsModal
        isOpen={isMobilePermissionsOpen}
        onClose={() => setIsMobilePermissionsOpen(false)}
        lang={lang}
      />

      {/* Favorite Photo Gallery & Memories Modal */}
      <PhotoGalleryModal
        isOpen={isPhotoGalleryOpen}
        onClose={() => setIsPhotoGalleryOpen(false)}
        lang={lang}
      />
    </div>
  );
}

