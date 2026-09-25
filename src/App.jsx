import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import CalculatorModal from './components/CalculatorModal';
import AlarmModal from './components/AlarmModal';
import PinLockModal from './components/PinLockModal';
import ShoppingModal from './components/ShoppingModal';
import EmergencyModal from './components/EmergencyModal';
import LanguageModal from './components/LanguageModal';

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

  // Track fired alarms to prevent duplicate ringing in the same minute
  const firedAlarmsRef = useRef(new Set());

  // Check PIN lock on launch
  useEffect(() => {
    if (user?.isPinRequired) {
      setIsLocked(true);
    }
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

  const handleUpdateFitness = (updated) => {
    setFitness(updated);
    storageService.saveFitness(updated);
  };

  // Reload all data (e.g. after backup restore)
  const handleReloadAllData = () => {
    setUser(storageService.getUserProfile());
    setNotes(storageService.getNotes());
    setReminders(storageService.getReminders());
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
    }, 10000); // Check every 10 seconds

    return () => clearInterval(timer);
  }, [medicines, reminders, medicineLogs]);

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
        onTestAlarm={handleTestAlarm}
        onLockApp={() => setIsLocked(true)}
        activeAlarmCount={
          reminders.filter((r) => !r.isCompleted && r.hasAlarm).length +
          medicines.filter((m) => m.active && m.hasAlarm).length
        }
      />

      {/* Main Tab View Container */}
      <main className="flex-1 p-3.5 overflow-y-auto">
        {activeTab === 'home' && (
          <HomeTab
            user={user}
            notes={notes}
            reminders={reminders}
            medicines={medicines}
            medicineLogs={medicineLogs}
            finance={finance}
            accounts={accounts}
            khata={khata}
            water={water}
            fitness={fitness}
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
          />
        )}

        {activeTab === 'notes' && (
          <NotesTab notes={notes} onSaveNotes={handleSaveNotes} lang={lang} />
        )}

        {activeTab === 'reminders' && (
          <RemindersTab
            reminders={reminders}
            onSaveReminders={handleSaveReminders}
            onTriggerAlarm={handleCustomTriggerAlarm}
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
            lang={lang}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsTab
            user={user}
            notes={notes}
            reminders={reminders}
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
      />

      {/* Emergency & Bank Helpline Modal */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />

      {/* Calculator Modal */}
      <CalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        onTransferAmount={handleTransferAmount}
      />

      {/* Alarm Ringing Modal */}
      <AlarmModal
        activeAlarm={activeAlarm}
        onDismiss={handleDismissAlarm}
        onSnooze={handleSnoozeAlarm}
        onMarkDone={handleMarkAlarmDone}
      />

      {/* PIN Lock Screen Modal */}
      {isLocked && (
        <PinLockModal
          correctPin={user?.pin || '1234'}
          onUnlock={() => setIsLocked(false)}
        />
      )}
    </div>
  );
}

