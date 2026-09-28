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

// Tabs
import HomeTab from './components/tabs/HomeTab';
import NotesTab from './components/tabs/NotesTab';
import RemindersTab from './components/tabs/RemindersTab';
import HealthHubTab from './components/tabs/HealthHubTab';
import FinanceTab from './components/tabs/FinanceTab';
import ReportsTab from './components/tabs/ReportsTab';
import ProfileTab from './components/tabs/ProfileTab';

// Services
import { storageService } from './services/storageService';
import { notificationService } from './services/notificationService';
import { streakService } from './services/streakService';
import { pedometerService } from './services/pedometerService';

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

  // App UI State
  const [activeTab, setActiveTab] = useState('home');
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isShoppingOpen, setIsShoppingOpen] = useState(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [activeAlarm, setActiveAlarm] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isSmsParserOpen, setIsSmsParserOpen] = useState(false);
  const [upiModalData, setUpiModalData] = useState(null);
  const [isStepSensorActive, setIsStepSensorActive] = useState(false);
  const [needsSensorPermission, setNeedsSensorPermission] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  // Track fired alarms to prevent duplicate ringing in the same minute
  const firedAlarmsRef = useRef(new Set());

  // Check PIN lock on launch
  useEffect(() => {
    if (user?.isPinRequired) {
      setIsLocked(true);
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

    const unsubStatus = pedometerService.addStatusListener((isActive) => {
      setIsStepSensorActive(isActive);
    });

    // Auto-start sensor if enabled in preferences
    if (pedometerService.isAutoTrackingEnabled() && pedometerService.isSupported()) {
      pedometerService.startTracking().then((started) => {
        if (!started) {
          setNeedsSensorPermission(true);
        } else {
          setNeedsSensorPermission(false);
        }
      });
    }

    return () => {
      unsubStep();
      unsubStatus();
    };
  }, [handleStepIncrement]);

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

  // Language selection handler
  const handleSelectLang = (newLang) => {
    setLang(newLang);
    storageService.saveLanguage(newLang);
  };


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
    };
    handleSaveReminders([newRem, ...reminders]);
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


  // Test Alarm trigger
  const handleTestAlarm = () => {
    setActiveAlarm({
      id: 'test-alarm-' + Date.now(),
      type: 'medicine',
      title: 'પેરાસિટામોલ 650mg',
      dosage: '૧ ગોળી',
      time: '૧૩:૪૫',
      mealRelation: 'after_food',
      notes: 'ટેસ્ટ એલાર્મ: સમયસર દવા લેવાનું રિમાઇન્ડર સાઉન્ડ સાથે!',
    });
    notificationService.send('દવા લેવાનું એલાર્મ!', {
      body: 'પેરાસિટામોલ 650mg - જમ્યા પછી',
    });
  };

  // Custom Alarm trigger (from medicine or reminder card)
  const handleCustomTriggerAlarm = (alarmData) => {
    setActiveAlarm(alarmData);
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
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const todayDateStr = now.toISOString().split('T')[0];

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
          setActiveAlarm({
            id: rem.id,
            type: rem.type,
            title: rem.title,
            time: rem.time,
            description: rem.description,
          });

          notificationService.send(`⏰ અગત્યનું કામ: ${rem.title}`, {
            body: rem.description || `સમય: ${rem.time}`,
          });
        }
      });

      // 3. Daily 9:00 PM Diary Writing Reminder
      const diaryReminderEnabled = localStorage.getItem('diary_reminder_enabled') !== 'false';
      const diaryAlarmKey = `diary-9pm-${todayDateStr}`;
      if (currentTimeStr === '21:00' && diaryReminderEnabled && !firedAlarmsRef.current.has(diaryAlarmKey)) {
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
                ? 'Record today\'s memories and expenses. Keep your 🔥 streak alive!'
                : 'આજના દિવસની યાદો અને હિસાબ નોંધી લો અને તમારી 🔥 સ્ટ્રીક જાળવી રાખો!',
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
    <div className={`mobile-app-wrapper ${theme === 'dark' ? 'dark-theme' : ''}`}>
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
        onOpenAssistant={() => setIsAssistantOpen(true)}
        onTestAlarm={handleTestAlarm}
        onLockApp={() => setIsLocked(true)}
        activeAlarmCount={
          reminders.filter((r) => !r.isCompleted && r.hasAlarm).length +
          medicines.filter((m) => m.active && m.hasAlarm).length
        }
      />

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
            onOpenShopping={() => setIsShoppingOpen(true)}
            onOpenEmergency={() => setIsEmergencyOpen(true)}
            dailyQuote={dailyQuote}
            onNextQuote={() => setQuoteOffset((prev) => prev + 1)}
            lang={lang}
            onNavigate={(tab) => setActiveTab(tab)}
            onToggleMedicine={handleToggleMedicine}
            onToggleReminder={handleToggleReminder}
            onOpenCalculator={() => setIsCalculatorOpen(true)}
            onOpenAssistant={() => setIsAssistantOpen(true)}
          />
        )}

        {activeTab === 'notes' && (
          <NotesTab notes={notes} onSaveNotes={handleSaveNotes} lang={lang} user={user} />
        )}

        {activeTab === 'reminders' && (
          <RemindersTab
            reminders={reminders}
            onSaveReminders={handleSaveReminders}
            events={events}
            onSaveEvents={handleSaveEvents}
            onTriggerAlarm={handleCustomTriggerAlarm}
            user={user}
            lang={lang}
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
            lang={lang}
            initialSubTab={activeTab === 'medicine' ? 'medicines' : 'fitness'}
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
            lang={lang}
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

      {/* PIN Lock Screen Modal */}
      {isLocked && (
        <PinLockModal
          correctPin={user?.pin || '1234'}
          onUnlock={() => setIsLocked(false)}
          lang={lang}
        />
      )}

      {/* Smart Voice & NLP Assistant Modal */}
      <SmartAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        lang={lang}
        onAddFinance={handleAddParsedFinance}
        onAddReminder={handleAddParsedReminder}
        onAddKhata={handleAddParsedKhata}
        onAddNote={handleAddParsedNote}
        onAddWater={handleAddParsedWater}
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
    </div>
  );
}

