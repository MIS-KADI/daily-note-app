// Email-bound Auto-Backup & Sync Service
// Provides continuous automatic synchronization, account registry, multi-account switching,
// and instant restoration of previous data upon Login and Logout.

import { storageService } from './storageService';

const DB_NAME = 'DailyDiaryBackupDB';
const DB_VERSION = 1;
const STORE_NAME = 'account_backups';
const REGISTRY_KEY = 'daily_diary_accounts_registry';
const ACTIVE_SESSION_KEY = 'daily_diary_active_session';
const LAST_SYNC_KEY = 'daily_diary_last_auto_sync';

// Helpers
function normalizeEmail(email) {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

function isIndexedDBSupported() {
  try {
    return typeof window !== 'undefined' && 'indexedDB' in window && window.indexedDB !== null;
  } catch {
    return false;
  }
}

let dbInstance = null;
function openBackupDB() {
  return new Promise((resolve) => {
    if (!isIndexedDBSupported()) return resolve(null);
    if (dbInstance) return resolve(dbInstance);

    try {
      const req = window.indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'email' });
        }
      };
      req.onsuccess = (e) => {
        dbInstance = e.target.result;
        resolve(dbInstance);
      };
      req.onerror = () => {
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });
}

// Debounce timer for auto-sync
let autoSyncTimeout = null;

export const backupSyncService = {
  /**
   * Normalize an email address
   */
  normalizeEmail(email) {
    return normalizeEmail(email);
  },

  /**
   * Get Active Session Info
   */
  getActiveSession() {
    try {
      const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Error reading active session:', e);
    }
    // Fallback: check profile email
    const profile = storageService.getUserProfile();
    const email = normalizeEmail(profile?.email);
    return {
      email,
      isLoggedIn: Boolean(email),
      lastLoginAt: new Date().toISOString(),
    };
  },

  /**
   * Set Active Session
   */
  setActiveSession(session) {
    try {
      localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(session));
    } catch (e) {
      console.warn('Error saving active session:', e);
    }
  },

  /**
   * Get Last Sync Timestamp
   */
  getLastSyncTime() {
    return localStorage.getItem(LAST_SYNC_KEY) || null;
  },

  /**
   * Update Last Sync Timestamp
   */
  setLastSyncTime(isoString) {
    const time = isoString || new Date().toISOString();
    localStorage.setItem(LAST_SYNC_KEY, time);
    try {
      window.dispatchEvent(new CustomEvent('daily_diary_sync_completed', { detail: { timestamp: time } }));
    } catch {}
    return time;
  },

  /**
   * Get Accounts Registry on this device
   */
  getAccountsRegistry() {
    try {
      const raw = localStorage.getItem(REGISTRY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Error reading accounts registry:', e);
    }

    // Auto-seed registry from current profile if user has an email
    const profile = storageService.getUserProfile();
    if (profile?.email && profile.email.includes('@')) {
      const cleanEmail = normalizeEmail(profile.email);
      const initial = [
        {
          email: cleanEmail,
          name: profile.name || 'મુખ્ય યુઝર',
          mobile: profile.mobile || '',
          lastBackupAt: new Date().toISOString(),
          recordCounts: {
            notes: (storageService.getNotes() || []).length,
            reminders: (storageService.getReminders() || []).length,
            finance: (storageService.getFinance() || []).length,
            khata: (storageService.getKhata() || []).length,
            medicines: (storageService.getMedicines() || []).length,
            events: (storageService.getEvents() || []).length,
          },
        },
      ];
      this.saveAccountsRegistry(initial);
      return initial;
    }

    return [];
  },

  /**
   * Save Accounts Registry
   */
  saveAccountsRegistry(accounts) {
    try {
      localStorage.setItem(REGISTRY_KEY, JSON.stringify(accounts));
    } catch (e) {
      console.warn('Error saving accounts registry:', e);
    }
  },

  /**
   * Register or update an account in registry
   */
  registerOrUpdateAccount(email, meta = {}) {
    const cleanEmail = normalizeEmail(email);
    if (!cleanEmail) return;

    const registry = this.getAccountsRegistry();
    const existingIdx = registry.findIndex((a) => normalizeEmail(a.email) === cleanEmail);

    const updatedAccount = {
      email: cleanEmail,
      name: meta.name || (existingIdx >= 0 ? registry[existingIdx].name : 'યુઝર'),
      mobile: meta.mobile || (existingIdx >= 0 ? registry[existingIdx].mobile : ''),
      lastBackupAt: meta.lastBackupAt || new Date().toISOString(),
      recordCounts: meta.recordCounts || (existingIdx >= 0 ? registry[existingIdx].recordCounts : {}),
    };

    if (existingIdx >= 0) {
      registry[existingIdx] = { ...registry[existingIdx], ...updatedAccount };
    } else {
      registry.unshift(updatedAccount);
    }

    this.saveAccountsRegistry(registry);
  },

  /**
   * Build Full Data Payload from current state
   */
  buildDataPayload(customData = null) {
    if (customData) return customData;
    return {
      version: '1.0.32',
      exportedAt: new Date().toISOString(),
      user: storageService.getUserProfile(),
      notes: storageService.getNotes(),
      reminders: storageService.getReminders(),
      events: storageService.getEvents(),
      medicines: storageService.getMedicines(),
      medicineLogs: storageService.getMedicineLogs(),
      finance: storageService.getFinance(),
      accounts: storageService.getAccounts(),
      khata: storageService.getKhata(),
      water: storageService.getWater(),
      shopping: storageService.getShopping(),
      fitness: storageService.getFitness(),
      alarmSettings: storageService.getAlarmSettings(),
      weeklyStepHistory: storageService.getWeeklyStepHistory(),
      diaryReminderConfig: storageService.getDiaryReminderConfig(),
    };
  },

  /**
   * Save complete backup for a specific email
   */
  async saveAccountBackup(email, customPayload = null) {
    const cleanEmail = normalizeEmail(email);
    if (!cleanEmail) return { success: false, error: 'Invalid email address' };

    const payload = this.buildDataPayload(customPayload);
    const nowIso = new Date().toISOString();

    const recordCounts = {
      notes: (payload.notes || []).length,
      reminders: (payload.reminders || []).length,
      finance: (payload.finance || []).length,
      khata: (payload.khata || []).length,
      medicines: (payload.medicines || []).length,
      events: (payload.events || []).length,
    };

    const backupSnapshot = {
      email: cleanEmail,
      lastBackupAt: nowIso,
      recordCounts,
      payload,
    };

    // 1. Save to LocalStorage under specific account key
    try {
      const storageKey = `daily_diary_backup_account_${cleanEmail}`;
      localStorage.setItem(storageKey, JSON.stringify(backupSnapshot));
    } catch (e) {
      console.warn('LocalStorage backup quota reached, attempting IndexedDB:', e);
    }

    // 2. Save up to 5 snapshots in history for rollback & versioning
    try {
      const historyKey = `daily_diary_backup_history_${cleanEmail}`;
      const existingHistoryRaw = localStorage.getItem(historyKey);
      let historyList = existingHistoryRaw ? JSON.parse(existingHistoryRaw) : [];
      if (!Array.isArray(historyList)) historyList = [];

      // Add new snapshot at top, keep max 5
      historyList.unshift({
        id: `snap_${Date.now()}`,
        timestamp: nowIso,
        recordCounts,
      });
      historyList = historyList.slice(0, 5);
      localStorage.setItem(historyKey, JSON.stringify(historyList));
    } catch (e) {
      console.warn('History save warning:', e);
    }

    // 3. Save to IndexedDB for large resilient offline storage
    try {
      const db = await openBackupDB();
      if (db) {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put(backupSnapshot);
      }
    } catch (e) {
      console.warn('IndexedDB backup save warning:', e);
    }

    // 4. Update Accounts Registry
    this.registerOrUpdateAccount(cleanEmail, {
      name: payload.user?.name || 'યુઝર',
      mobile: payload.user?.mobile || '',
      lastBackupAt: nowIso,
      recordCounts,
    });

    // 5. Update last auto-sync indicator
    this.setLastSyncTime(nowIso);

    return {
      success: true,
      email: cleanEmail,
      timestamp: nowIso,
      recordCounts,
    };
  },

  /**
   * Get complete backup for a specific email
   */
  async getAccountBackup(email) {
    const cleanEmail = normalizeEmail(email);
    if (!cleanEmail) return null;

    // 1. Try LocalStorage
    try {
      const storageKey = `daily_diary_backup_account_${cleanEmail}`;
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.payload) return parsed;
      }
    } catch (e) {
      console.warn('Error reading from localStorage:', e);
    }

    // 2. Try IndexedDB
    try {
      const db = await openBackupDB();
      if (db) {
        return new Promise((resolve) => {
          const tx = db.transaction(STORE_NAME, 'readonly');
          const store = tx.objectStore(STORE_NAME);
          const req = store.get(cleanEmail);
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => resolve(null);
        });
      }
    } catch (e) {
      console.warn('Error reading from IndexedDB:', e);
    }

    return null;
  },

  /**
   * Get Snapshot History for an email
   */
  getBackupHistory(email) {
    const cleanEmail = normalizeEmail(email);
    if (!cleanEmail) return [];
    try {
      const historyKey = `daily_diary_backup_history_${cleanEmail}`;
      const raw = localStorage.getItem(historyKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Error reading backup history:', e);
    }
    return [];
  },

  /**
   * Debounced Auto-Sync Trigger
   * Called on state changes when user has an active email
   */
  triggerAutoSync(dataPayload, email, debounceMs = 2500) {
    const cleanEmail = normalizeEmail(email);
    if (!cleanEmail) return;

    if (autoSyncTimeout) {
      clearTimeout(autoSyncTimeout);
    }

    autoSyncTimeout = setTimeout(() => {
      this.saveAccountBackup(cleanEmail, dataPayload)
        .then((res) => {
          if (res?.success) {
            console.log(`[Auto-Backup] Synced for ${cleanEmail} at ${res.timestamp}`);
          }
        })
        .catch((err) => console.warn('[Auto-Backup] Sync failed:', err));
    }, debounceMs);
  },

  /**
   * Login with Email & Instant Data Restoration
   */
  async loginWithEmail(email, pin = null) {
    const cleanEmail = normalizeEmail(email);
    if (!cleanEmail) {
      return { success: false, error: 'કૃપા કરીને માન્ય ઈમેલ દાખલ કરો.' };
    }

    // Look for existing backup
    const backup = await this.getAccountBackup(cleanEmail);

    if (backup && backup.payload) {
      const payload = backup.payload;

      // Verify PIN if profile has PIN required and PIN was provided
      if (payload.user?.isPinRequired && payload.user?.pin && pin && payload.user.pin !== pin) {
        return { success: false, error: 'ખોટો 4-અંકનો સુરક્ષા PIN છે.' };
      }

      // Restore all keys to active storage
      storageService.saveUserProfile({ ...payload.user, email: cleanEmail, isRegistered: true });
      if (payload.notes) storageService.saveNotes(payload.notes);
      if (payload.reminders) storageService.saveReminders(payload.reminders);
      if (payload.events) storageService.saveEvents(payload.events);
      if (payload.medicines) storageService.saveMedicines(payload.medicines);
      if (payload.medicineLogs) storageService.saveMedicineLogs(payload.medicineLogs);
      if (payload.finance) storageService.saveFinance(payload.finance);
      if (payload.accounts) storageService.saveAccounts(payload.accounts);
      if (payload.khata) storageService.saveKhata(payload.khata);
      if (payload.water) storageService.saveWater(payload.water);
      if (payload.shopping) storageService.saveShopping(payload.shopping);
      if (payload.fitness) storageService.saveFitness(payload.fitness);
      if (payload.alarmSettings) storageService.saveAlarmSettings(payload.alarmSettings);
      if (payload.weeklyStepHistory) storageService.saveWeeklyStepHistory(payload.weeklyStepHistory);

      this.setActiveSession({
        email: cleanEmail,
        isLoggedIn: true,
        lastLoginAt: new Date().toISOString(),
      });
      this.setLastSyncTime(backup.lastBackupAt);

      return {
        success: true,
        isNew: false,
        email: cleanEmail,
        restoredData: payload,
        recordCounts: backup.recordCounts,
        message: 'તમારો અગાઉનો તમામ ડેટા (નોંધો, હિસાબ, રિમાઇન્ડર્સ, ખાતાવહી) સફળતાપૂર્વક રિસ્ટોર કરવામાં આવ્યો છે! 🎉',
      };
    }

    // New user signing in with this email
    const currentUser = storageService.getUserProfile();
    const updatedUser = {
      ...currentUser,
      email: cleanEmail,
      isRegistered: true,
    };
    storageService.saveUserProfile(updatedUser);

    this.setActiveSession({
      email: cleanEmail,
      isLoggedIn: true,
      lastLoginAt: new Date().toISOString(),
    });

    // Create initial backup for this brand new account
    const initialPayload = this.buildDataPayload();
    await this.saveAccountBackup(cleanEmail, initialPayload);

    return {
      success: true,
      isNew: true,
      email: cleanEmail,
      restoredData: initialPayload,
      message: 'નવું એકાઉન્ટ સફળતાપૂર્વક સેટ થયું અને ઓટો-બેકઅપ સક્રિય કરવામાં આવ્યું છે! 🚀',
    };
  },

  /**
   * Log Out User:
   * 1. Auto-saves current user data snapshot to their email backup first.
   * 2. Marks session as logged out.
   * 3. Clears active working data to maintain privacy for other users.
   */
  async logoutUser(currentDataPayload = null) {
    const session = this.getActiveSession();
    const cleanEmail = normalizeEmail(session?.email) || normalizeEmail(storageService.getUserProfile()?.email);

    if (cleanEmail) {
      // Save snapshot before logout!
      try {
        await this.saveAccountBackup(cleanEmail, currentDataPayload);
      } catch (e) {
        console.warn('Backup before logout error:', e);
      }
    }

    // Update session
    this.setActiveSession({
      email: '',
      isLoggedIn: false,
      lastLogoutAt: new Date().toISOString(),
    });

    // Reset current active keys to empty clean state
    storageService.saveUserProfile({
      name: '',
      mobile: '',
      email: '',
      dob: '',
      isRegistered: false,
      isPinRequired: false,
      isBiometricEnabled: false,
      pin: '1234',
    });
    storageService.saveNotes([]);
    storageService.saveReminders([]);
    storageService.saveMedicines([]);
    storageService.saveFinance([]);
    storageService.saveAccounts({ bankBalance: 0, cashBalance: 0 });
    storageService.saveKhata([]);
    storageService.saveEvents([]);
    storageService.saveShopping([]);
    storageService.saveWater({ date: new Date().toISOString().split('T')[0], glasses: 0, target: 8 });
    storageService.saveFitness({
      date: new Date().toISOString().split('T')[0],
      steps: 0,
      stepTarget: 8000,
      calories: 0,
      distanceKm: 0,
      heartRate: 72,
      bloodPressure: { systolic: 120, diastolic: 80 },
      bloodSugar: { fasting: 90, postMeal: 130 },
      sleepHours: 7,
      weightKg: 65,
      heightCm: 170,
      workouts: [],
    });

    return {
      success: true,
      savedEmail: cleanEmail,
      message: 'તમારો ડેટા સુરક્ષિત સાચવીને સફળતાપૂર્વક લૉગઆઉટ કરવામાં આવ્યું છે.',
    };
  },

  /**
   * Delete an account from the local device registry
   */
  deleteAccountFromDevice(email) {
    const cleanEmail = normalizeEmail(email);
    if (!cleanEmail) return;

    try {
      localStorage.removeItem(`daily_diary_backup_account_${cleanEmail}`);
      localStorage.removeItem(`daily_diary_backup_history_${cleanEmail}`);
    } catch {}

    const registry = this.getAccountsRegistry().filter((a) => normalizeEmail(a.email) !== cleanEmail);
    this.saveAccountsRegistry(registry);
  },
};
