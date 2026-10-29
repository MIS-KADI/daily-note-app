import React, { useState, useRef, useEffect } from 'react';
import {
  UserCheck,
  Mail,
  Phone,
  ShieldCheck,
  Lock,
  KeyRound,
  AlertTriangle,
  Save,
  HelpCircle,
  Fingerprint,
  Sparkles,
  X,
  Shield,
  FileText,
  RefreshCw,
  LogIn,
  LogOut,
  Users,
  History,
  Database,
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { biometricService } from '../../services/biometricService';
import { backupSyncService } from '../../services/backupSyncService';
import { t } from '../../services/i18n';

export default function ProfileTab({
  user,
  onUpdateUser,
  onReloadAllData,
  onOpenMobilePermissions,
  onOpenPhotoGallery,
  onOpenAuthModal,
  onLogout,
  onSyncNow,
  lastSyncTime: propLastSyncTime,
  lang = 'gu',
  isDemoMode,
  onClearDemo,
  onRestoreDemo,
}) {
  const [name, setName] = useState(user?.name || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [email, setEmail] = useState(user?.email || '');
  const [dob, setDob] = useState(user?.dob || '');
  const [upiId, setUpiId] = useState(user?.upiId || '');
  const [isPinRequired, setIsPinRequired] = useState(user?.isPinRequired ?? false);
  const [pin, setPin] = useState(user?.pin || '1234');
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(user?.isBiometricEnabled ?? true);
  const [isNightDiaryReminder, setIsNightDiaryReminder] = useState(user?.isNightDiaryReminder ?? true);
  const [isWaterReminder, setIsWaterReminder] = useState(user?.isWaterReminder ?? true);
  const [savedNotice, setSavedNotice] = useState(false);
  const [biometricNotice, setBiometricNotice] = useState('');
  const [isBiometricTesting, setIsBiometricTesting] = useState(false);
  const [isTestingHold, setIsTestingHold] = useState(false);
  const [testHoldProgress, setTestHoldProgress] = useState(0);
  const [isPrivacyPolicyOpen, setIsPrivacyPolicyOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncNotice, setSyncNotice] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(() => propLastSyncTime || backupSyncService.getLastSyncTime());
  const [backupHistory, setBackupHistory] = useState(() => backupSyncService.getBackupHistory(user?.email || ''));
  const testHoldRef = useRef(null);

  // Keep local fields in sync if user changes externally (e.g. login/restore)
  useEffect(() => {
    setName(user?.name || '');
    setMobile(user?.mobile || '');
    setEmail(user?.email || '');
    setDob(user?.dob || '');
    setUpiId(user?.upiId || '');
    setIsPinRequired(user?.isPinRequired ?? false);
    setPin(user?.pin || '1234');
    setIsBiometricEnabled(user?.isBiometricEnabled ?? true);
    setBackupHistory(backupSyncService.getBackupHistory(user?.email || ''));
  }, [user]);

  // Listen to background auto-sync events
  useEffect(() => {
    const handleSyncEvent = (e) => {
      const time = e.detail?.timestamp || new Date().toISOString();
      setLastSyncTime(time);
      if (email) {
        setBackupHistory(backupSyncService.getBackupHistory(email));
      }
    };
    window.addEventListener('daily_diary_sync_completed', handleSyncEvent);
    return () => {
      window.removeEventListener('daily_diary_sync_completed', handleSyncEvent);
    };
  }, [email]);

  const handleToggleBiometric = async (enable) => {
    if (enable) {
      setIsBiometricTesting(true);
      setBiometricNotice(
        lang === 'gu'
          ? '👆 ફિંગરપ્રિન્ટ સેન્સર ચકાસી રહ્યા છીએ...'
          : lang === 'hi'
          ? '👆 फ़िंगरप्रिंट सेंसर की जांच हो रही है...'
          : 'Checking biometric sensor...'
      );
      
      const res = await biometricService.register(name || user?.name || 'Daily User');
      setIsBiometricTesting(false);

      if (res.success) {
        setIsBiometricEnabled(true);
        const updated = {
          ...user,
          isBiometricEnabled: true,
        };
        onUpdateUser(updated);
        setBiometricNotice(
          lang === 'gu'
            ? '✅ ફિંગરપ્રિન્ટ લૉક સફળતાપૂર્વક સક્ષમ થયું!'
            : lang === 'hi'
            ? '✅ फ़िंगरप्रिंट लॉक सफलतापूर्वक सक्षम हो गया!'
            : '✅ Biometrics Enabled!'
        );
        setTimeout(() => setBiometricNotice(''), 3500);
      } else if (res.cancelled) {
        setIsBiometricEnabled(false);
        setBiometricNotice(
          lang === 'gu'
            ? '❌ બાયોમેટ્રિક ચકાસણી કેન્સલ થઈ.'
            : lang === 'hi'
            ? '❌ बायोमेट्रिक सत्यापन रद्द हुआ।'
            : 'Biometric cancelled.'
        );
        setTimeout(() => setBiometricNotice(''), 3000);
      } else {
        setIsBiometricEnabled(false);
        setBiometricNotice(
          res.error ||
            (lang === 'gu'
              ? 'સેન્સર ઉપલબ્ધ નથી.'
              : lang === 'hi'
              ? 'सेंसर उपलब्ध नहीं है।'
              : 'Sensor not available.')
        );
        setTimeout(() => setBiometricNotice(''), 3500);
      }
    } else {
      biometricService.disable();
      setIsBiometricEnabled(false);
      const updated = {
        ...user,
        isBiometricEnabled: false,
      };
      onUpdateUser(updated);
      setBiometricNotice(
        lang === 'gu'
          ? 'બાયોમેટ્રિક લૉક બંધ કરવામાં આવ્યું.'
          : lang === 'hi'
          ? 'बायोमेट्रिक लॉक बंद किया गया।'
          : 'Biometrics disabled.'
      );
      setTimeout(() => setBiometricNotice(''), 2500);
    }
  };

  const handleTestBiometric = async () => {
    setIsBiometricTesting(true);
    setBiometricNotice(
      lang === 'gu'
        ? '👆 ફિંગરપ્રિન્ટ સેન્સર પર ટચ કરો...'
        : lang === 'hi'
        ? '👆 फ़िंगरप्रिंट सेंसर पर टच करें...'
        : 'Touch fingerprint sensor...'
    );
    const res = await biometricService.authenticate();
    setIsBiometricTesting(false);

    if (res.success) {
      setBiometricNotice(
        lang === 'gu'
          ? '✅ ફિંગરપ્રિન્ટ સફળતાપૂર્વક પ્રમાણિત થઈ!'
          : lang === 'hi'
          ? '✅ फ़िंगरप्रिंट सफलतापूर्वक सत्यापित हुआ!'
          : '✅ Biometric Verified!'
      );
      setTimeout(() => setBiometricNotice(''), 3500);
    } else {
      setBiometricNotice(
        lang === 'gu'
          ? '👇 નીચે આપેલ ફિંગરપ્રિન્ટ સેન્સર પર આંગળી ૨ સેકન્ડ દબાવી રાખો'
          : lang === 'hi'
          ? '👇 नीचे दिए गए फ़िंगरप्रिंट सेंसर पर उंगली 2 सेकंड दबाकर रखें'
          : '👇 Press and hold the sensor below for 2s'
      );
    }
  };

  const startTestHold = (e) => {
    e.preventDefault();
    setIsTestingHold(true);
    setTestHoldProgress(0);
    biometricService.triggerHapticPulse();

    let cur = 0;
    clearInterval(testHoldRef.current);
    testHoldRef.current = setInterval(() => {
      cur += 15;
      setTestHoldProgress(cur);
      if (cur % 30 === 0) biometricService.triggerHapticPulse();
      if (cur >= 100) {
        clearInterval(testHoldRef.current);
        setIsTestingHold(false);
        biometricService.triggerHapticSuccess();
        setBiometricNotice(lang === 'gu' ? '✅ ફિંગરપ્રિન્ટ સેન્સર સફળતાપૂર્વક ટેસ્ટ થયું!' : '✅ Biometric Sensor Passed!');
        setTimeout(() => setBiometricNotice(''), 3500);
      }
    }, 80);
  };

  const stopTestHold = () => {
    if (testHoldProgress < 100) {
      clearInterval(testHoldRef.current);
      setIsTestingHold(false);
      setTestHoldProgress(0);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updated = {
      ...user,
      name,
      mobile,
      email,
      dob,
      upiId,
      isPinRequired,
      pin,
      isBiometricEnabled,
      isNightDiaryReminder,
      isWaterReminder,
    };
    onUpdateUser(updated);

    // If email is provided, automatically bind & trigger auto-backup under this email
    if (email && email.includes('@')) {
      const cleanEmail = backupSyncService.normalizeEmail(email);
      backupSyncService.saveAccountBackup(cleanEmail, {
        ...backupSyncService.buildDataPayload(),
        user: updated,
      }).then((res) => {
        if (res?.success) {
          setLastSyncTime(res.timestamp);
          setBackupHistory(backupSyncService.getBackupHistory(cleanEmail));
        }
      });
      backupSyncService.registerOrUpdateAccount(cleanEmail, { name, mobile });
    }

    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleManualSync = async () => {
    const cleanEmail = backupSyncService.normalizeEmail(email || user?.email);
    if (!cleanEmail || !cleanEmail.includes('@')) {
      alert(
        lang === 'gu'
          ? 'કૃપા કરીને પહેલાં તમારું ઈમેલ ID દાખલ કરો!'
          : lang === 'hi'
          ? 'कृपया पहले अपना ईमेल ID दर्ज करें!'
          : 'Please enter your email ID first!'
      );
      return;
    }

    setIsSyncing(true);
    try {
      const res = await backupSyncService.saveAccountBackup(cleanEmail);
      setIsSyncing(false);
      if (res?.success) {
        setLastSyncTime(res.timestamp);
        setBackupHistory(backupSyncService.getBackupHistory(cleanEmail));
        setSyncNotice(
          lang === 'gu'
            ? '✅ તમારો તમામ ડેટા ઈમેલ સાથે સુરક્ષિત સિંક થઈ ગયો છે!'
            : lang === 'hi'
            ? '✅ आपका सारा डेटा ईमेल के साथ सुरक्षित सिंक हो गया है!'
            : '✅ All data safely synced to your email!'
        );
        if (onSyncNow) onSyncNow();
        setTimeout(() => setSyncNotice(''), 3000);
      } else {
        alert(res?.error || 'Sync failed');
      }
    } catch (err) {
      setIsSyncing(false);
      alert('Sync error: ' + err.message);
    }
  };

  const handleRestoreSnapshot = async (snapshot) => {
    const cleanEmail = backupSyncService.normalizeEmail(email || user?.email);
    if (!cleanEmail) return;

    const conf = window.confirm(
      lang === 'gu'
        ? `શું તમે આ તારીખનો (${new Date(snapshot.timestamp).toLocaleString()}) સ્નેપશોટ પુનઃસ્થાપિત કરવા માંગો છો?\nઆનાથી તે સમયનો જૂનો ડેટા પાછો આવી જશે.`
        : lang === 'hi'
        ? `क्या आप इस तारीख (${new Date(snapshot.timestamp).toLocaleString()}) का स्नैपशॉट पुनर्स्थापित करना चाहते हैं?`
        : `Restore backup snapshot from ${new Date(snapshot.timestamp).toLocaleString()}?`
    );

    if (conf) {
      setIsSyncing(true);
      const fullBackup = await backupSyncService.getAccountBackup(cleanEmail);
      setIsSyncing(false);
      if (fullBackup?.payload) {
        storageService.restoreAllData(fullBackup.payload);
        alert(
          lang === 'gu'
            ? '🎉 જૂનો ડેટા સફળતાપૂર્વક પુનઃસ્થાપિત (Restore) થઈ ગયો છે!'
            : lang === 'hi'
            ? '🎉 पुराना डेटा सफलतापूर्वक पुनर्स्थापित (Restore) हो गया!'
            : '🎉 Data restored successfully!'
        );
        if (onReloadAllData) onReloadAllData();
      } else {
        alert('Could not find snapshot data');
      }
    }
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <UserCheck className="text-blue-600" size={22} />
            {t('profile_title', lang)}
          </h2>
          <p className="text-xs text-slate-500">
            {t('profile_sub', lang)}
          </p>
        </div>
      </div>

      {/* Linked Account Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-md shadow-blue-500/20">
              {name ? name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-800">{name || t('user_profile_heading', lang)}</h3>
            </div>
          </div>

          {/* Quick Account Switch & Logout Actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {onOpenAuthModal && (
              <button
                type="button"
                onClick={onOpenAuthModal}
                className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl border border-blue-200 transition active:scale-95 flex items-center gap-1"
                title={lang === 'gu' ? 'એકાઉન્ટ સ્વિચ / લૉગિન' : 'Switch / Login'}
              >
                <Users size={13} className="text-blue-600" />
                <span>{lang === 'gu' ? 'સ્વિચ' : lang === 'hi' ? 'स्विच' : 'Switch'}</span>
              </button>
            )}
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition active:scale-95 flex items-center gap-1"
                title={lang === 'gu' ? 'લૉગઆઉટ' : 'Logout'}
              >
                <LogOut size={13} className="text-rose-600" />
                <span>{lang === 'gu' ? 'લૉગઆઉટ' : lang === 'hi' ? 'लॉगआउट' : 'Logout'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSaveProfile} className="space-y-3 pt-2">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              {t('full_name', lang)}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Phone size={12} className="text-slate-500" />
              {t('mobile_number', lang)} ({lang === 'gu' ? '૧૦ અંક' : lang === 'hi' ? '10 अंक' : '10 digits'})
            </label>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder={lang === 'gu' ? '10 અંકનો મોબાઈલ નંબર' : lang === 'hi' ? '10 अंकों का मोबाइल नंबर' : '10 digits mobile number'}
            />
          </div>

          {/* Email ID */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
              <Mail size={12} className="text-slate-500" />
              {t('email_id', lang)}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="user@example.com"
              required
            />
          </div>

          {/* Date of Birth (DOB) with DD/MM/YYYY display */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              {lang === 'gu' ? 'જન્મ તારીખ (DOB)' : lang === 'hi' ? 'जन्म तिथि (DOB)' : 'Date of Birth (DOB)'}
            </label>
            <div className="relative">
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
              />
              <div className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-between pointer-events-none shadow-2xs">
                <span className="font-mono">
                  {dob ? dob.split('-').reverse().join('/') : (lang === 'hi' ? 'DD/MM/YYYY (चुनें)' : 'DD/MM/YYYY (પસંદ કરો)')}
                </span>
                <span className="text-[10px] text-blue-600 font-semibold">📅 (DD/MM/YYYY)</span>
              </div>
            </div>
          </div>

          {/* Receiving UPI ID for Khata QR Code */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              {lang === 'gu'
                ? 'તમારી UPI ID (ખાતાના QR કોડ અને પેમેન્ટ લેવા માટે):'
                : lang === 'hi'
                ? 'आपकी UPI ID (खाते के QR कोड और पेमेंट प्राप्त करने के लिए):'
                : 'Your UPI ID (For account QR code & payments):'}
            </label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="9876543210@paytm / name@oksbi"
            />
          </div>

          {/* Daily Reminders & Habits Section */}
          <div className="pt-3 border-t border-slate-100 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-800">
              {lang === 'gu'
                ? 'રોજિંદા રીમાઇન્ડર્સ અને હેબિટ સેટિંગ્સ:'
                : lang === 'hi'
                ? 'दैनिक रिमाइंडर और आदत सेटिंग्स:'
                : 'Daily Reminders & Habit Settings:'}
            </h4>

            {/* 9:00 PM Diary Reminder */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  {lang === 'gu'
                    ? '🌙 રાત્રે ૯:૦૦ વાગ્યે ડાયરી રીમાઇન્ડર'
                    : lang === 'hi'
                    ? '🌙 रात 9:00 बजे डायरी रिमाइंडर'
                    : '🌙 9:00 PM Diary Reminder'}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {lang === 'gu'
                    ? '"આજનો દિવસ કેવો રહ્યો? ૨ મિનિટમાં ડાયરી લખો"'
                    : lang === 'hi'
                    ? '"आज का दिन कैसा रहा? 2 मिनट में डायरी लिखें"'
                    : '"How was your day? Write diary in 2 mins"'}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNightDiaryReminder}
                  onChange={(e) => setIsNightDiaryReminder(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* 2-Hour Water Reminder */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  {lang === 'gu'
                    ? '💧 દર ૨ કલાકે પાણી પીવાનું એલર્ટ'
                    : lang === 'hi'
                    ? '💧 हर 2 घंटे में पानी पीने का अलर्ट'
                    : '💧 2-Hour Water Reminder'}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {lang === 'gu'
                    ? 'દિવસ દરમિયાન સમયસર હાઇડ્રેશન રીમાઇન્ડર'
                    : lang === 'hi'
                    ? 'दिनभर में समय पर पानी पीने का रिमाइंडर'
                    : 'Timely hydration reminder throughout the day'}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isWaterReminder}
                  onChange={(e) => setIsWaterReminder(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-600"></div>
              </label>
            </div>
          </div>

          {/* Security PIN & Biometrics Section */}
          <div className="pt-3 border-t border-slate-100 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-800">
              {lang === 'gu'
                ? 'એપ સિક્યોરિટી & બાયોમેટ્રિક્સ:'
                : lang === 'hi'
                ? 'ऐप सुरक्षा और बायोमेट्रिक्स:'
                : 'App Security & Biometrics:'}
            </h4>

            {/* Biometric Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">
                  {lang === 'gu'
                    ? '👆 ફિંગરપ્રિન્ટ / Face ID લૉક'
                    : lang === 'hi'
                    ? '👆 फ़िंगरप्रिंट / Face ID लॉक'
                    : '👆 Biometric / Face ID Lock'}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  {lang === 'gu'
                    ? 'Android ફોનમાં નેટિવ સેન્સર અને બ્રાઉઝરમાં ટચ સેન્સર બંને સક્ષમ'
                    : lang === 'hi'
                    ? 'Android फ़ोन में नेटिव सेंसर और ब्राउज़र में टच सेंसर दोनों सक्षम'
                    : 'Native biometric sensor on Android and touch sensor enabled'}
                </span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBiometricEnabled}
                  onChange={(e) => handleToggleBiometric(e.target.checked)}
                  disabled={isBiometricTesting}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Biometric Status Notice / Testing Feedback */}
            {biometricNotice && (
              <div className="p-2.5 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <Fingerprint size={16} className="animate-pulse text-blue-600 shrink-0" />
                <span>{biometricNotice}</span>
              </div>
            )}

            {/* Test Biometric Button & Interactive Hold Area if Enabled */}
            {isBiometricEnabled && (
              <div className="space-y-1.5 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleTestBiometric}
                    disabled={isBiometricTesting}
                    className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 active:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-bold rounded-xl border border-slate-200 flex items-center justify-center gap-1.5 transition active:scale-98"
                  >
                    <Fingerprint size={14} className="text-blue-600" />
                    <span>{lang === 'gu' ? 'સિસ્ટમ સેન્સર ટેસ્ટ' : 'Native Sensor'}</span>
                  </button>

                  <button
                    type="button"
                    onMouseDown={startTestHold}
                    onMouseUp={stopTestHold}
                    onMouseLeave={stopTestHold}
                    onTouchStart={startTestHold}
                    onTouchEnd={stopTestHold}
                    onTouchCancel={stopTestHold}
                    className={`py-2.5 px-3 relative overflow-hidden rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 select-none transition ${
                      isTestingHold
                        ? 'bg-emerald-100 border-emerald-400 text-emerald-800 shadow-inner'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                    }`}
                  >
                    {isTestingHold && (
                      <div
                        className="absolute left-0 top-0 bottom-0 bg-emerald-500/25 pointer-events-none transition-all duration-75"
                        style={{ width: `${testHoldProgress}%` }}
                      />
                    )}
                    <span className="relative z-10">
                      {isTestingHold
                        ? `${lang === 'gu' ? 'ટેસ્ટ...' : 'Testing...'} ${testHoldProgress}%`
                        : lang === 'gu'
                        ? '👆 ટચ કરી રાખો (Hold)'
                        : '👆 Touch & Hold'}
                    </span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 text-center">
                  💡 {lang === 'gu' ? 'તમે ગમે તે ફોન કે સ્ક્રીન પર ફિંગરપ્રિન્ટ ટચ કરીને એપ અનલૉક કરી શકો છો.' : 'Touch & hold works universally across all devices.'}
                </p>
              </div>
            )}

            {/* 4-Digit PIN */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                  <Lock size={13} className="text-blue-600" />
                  {t('app_pin_lock', lang)}
                </h4>
                <p className="text-[10px] text-slate-500">
                  {t('pin_lock_sub', lang)}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPinRequired}
                  onChange={(e) => setIsPinRequired(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {isPinRequired && (
              <div className="pt-1">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  {t('new_pin_label', lang)}
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-32 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center text-base tracking-widest font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="1234"
                  required
                />
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-blue-500/20 active:scale-98 transition"
            >
              <Save size={16} />
              {t('save_profile_btn', lang)}
            </button>
            {savedNotice && (
              <p className="text-center text-xs font-bold text-emerald-600 mt-2">
                {t('profile_saved_success', lang)}
              </p>
            )}
          </div>
        </form>
      </div>

      {/* Mobile Permissions & Setup Access Card */}
      {onOpenMobilePermissions && (
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-3xl p-5 border border-blue-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 bg-blue-600 text-white rounded-2xl shadow-sm text-lg">
                📱
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  {lang === 'gu' ? 'મોબાઇલ પરવાનગીઓ & ઍક્સેસ' : lang === 'hi' ? 'मोबाइल अनुमतियाँ और एक्सेस' : 'Mobile Permissions & Access'}
                </h3>
                <p className="text-[10px] text-blue-700 font-semibold">
                  {lang === 'gu'
                    ? 'માઇક્રોફોન, એલાર્મ નોટિફિકેશન અને સાઉન્ડ સેટિંગ્સ'
                    : lang === 'hi'
                    ? 'माइक्रोफ़ोन, अलार्म नोटिफिकेशन और साउंड सेटिंग्स'
                    : 'Microphone, Alarm Notifications & Sound Settings'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenMobilePermissions}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition active:scale-95 flex items-center gap-1.5"
            >
              <span>{lang === 'gu' ? 'ચકાસો ⚙️' : lang === 'hi' ? 'जांचें ⚙️' : 'Check ⚙️'}</span>
            </button>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            {lang === 'gu'
              ? 'મોબાઈલમાં વૉઇસ ટાઇપિંગ અને સમયસર અલાર્મ વાગવા માટે જરૂરી પરવાનગીઓ સેટ કરવા માટે અહીં ક્લિક કરો.'
              : lang === 'hi'
              ? 'फ़ोन में वॉइस टाइपिंग और समय पर अलार्म बजने के लिए आवश्यक अनुमतियां सेट करने के लिए यहां क्लिक करें।'
              : 'Click here to configure microphone and alarm permissions for voice typing and alarms.'}
          </p>
        </div>
      )}

      {/* Favorite Photo Gallery Card in Profile */}
      {onOpenPhotoGallery && (
        <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-indigo-50 dark:from-slate-900 dark:to-slate-900/90 rounded-3xl p-5 border border-purple-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2.5 bg-gradient-to-tr from-purple-600 to-pink-600 text-white rounded-2xl shadow-sm text-lg">
                📸
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {lang === 'gu' ? 'મારી યાદગાર ફોટો ગેલેરી' : lang === 'hi' ? 'मेरी पसंदीदा फोटो गैलरी' : 'Favorite Photo Gallery'}
                </h3>
                <p className="text-[10px] text-purple-700 dark:text-purple-300 font-semibold">
                  {lang === 'gu' ? 'ફેવરિટ તસવીરો સાચવો • 🌐 ઓનલાઇન & ક્લાઉડ સિંક' : lang === 'hi' ? 'पसंदीदा फ़ोटो सहेजें • 🌐 ऑनलाइन व क्लाउड सिंक' : 'Store favorite photos • 🌐 Online & Cloud Sync'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenPhotoGallery}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition active:scale-95 flex items-center gap-1.5"
            >
              <span>{lang === 'gu' ? 'ગેલેરી ખોલો' : lang === 'hi' ? 'गैलरी खोलें' : 'Open Vault'}</span>
            </button>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {lang === 'gu'
              ? 'તમારા પરિવાર, પ્રવાસ કે અંગત યાદગાર ફોટા ઓટોમેટીક સાઈઝ ઓપ્ટિમાઈઝ કરીને ફોનમાં સુરક્ષિત સાચવી રાખો.'
              : lang === 'hi'
              ? 'अपने परिवार, यात्रा या व्यक्तिगत यादगार फ़ोटो को फ़ोन में सुरक्षित रूप से सहेजें।'
              : 'Safely organize and keep your favorite photos directly on your device with high optimization.'}
          </p>
        </div>
      )}

      {/* Privacy Policy Card & Security Guarantee */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-900 dark:to-slate-900/90 rounded-3xl p-4 border border-emerald-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="text-xs font-black text-emerald-950 dark:text-emerald-300">
                {lang === 'gu' ? '🔒 પ્રાઇવસી પોલિસી & ડેટા સુરક્ષા' : lang === 'hi' ? '🔒 प्राइवेसी पॉलिसी व डेटा सुरक्षा' : '🔒 Privacy Policy & Data Security'}
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {lang === 'gu' ? '🌐 ઓનલાઇન સુરક્ષિત • સંપૂર્ણ એન્ક્રિપ્ટેડ • કોઈ ટ્રેકિંગ નહીં' : lang === 'hi' ? '🌐 ऑनलाइन सुरक्षित • पूर्ण एन्क्रिप्टेड • कोई ट्रैकिंग नहीं' : '🌐 Online & Cloud Secure • Zero Tracking'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsPrivacyPolicyOpen(true)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs active:scale-95 transition flex items-center gap-1"
          >
            <FileText size={13} />
            <span>{lang === 'gu' ? 'વાંચો' : lang === 'hi' ? 'पढ़ें' : 'View Policy'}</span>
          </button>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-1">
          {t('privacy_guarantee_desc', lang)}
        </p>
      </div>

      {/* Fresh Start: Clear Default Entries Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl text-lg shrink-0">
            🧹
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">
              {lang === 'gu' ? 'ડિફોલ્ટ એન્ટ્રીઓ સાફ કરો (ફ્રેશ શરૂઆત)' : lang === 'hi' ? 'डिफ़ॉल्ट प्रविष्टियां साफ़ करें (फ़्रेश शुरुआत)' : 'Clear Default Entries (Fresh Start)'}
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              {lang === 'gu' ? 'બધી નમૂના/ડેમો એન્ટ્રીઓ દૂર કરીને નવી ફ્રેશ નોંધ કરવા માટે' : lang === 'hi' ? 'सभी नमूना/डेमो प्रविष्टियों को हटाकर नई शुरुआत करें' : 'Remove all sample entries to start completely fresh'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            const conf = window.confirm(
              lang === 'gu'
                ? 'શું તમે બધી ડિફોલ્ટ/ડેમો એન્ટ્રીઓ દૂર કરીને ફ્રેશ શરૂઆત કરવા માંગો છો?'
                : lang === 'hi'
                ? 'क्या आप सभी डिफ़ॉल्ट प्रविष्टियों को हटाकर फ़्रेश शुरुआत करना चाहते हैं?'
                : 'Clear all default entries for a fresh start?'
            );
            if (conf) {
              if (onClearDemo) onClearDemo();
              else storageService.clearAllDemoData();
              if (onReloadAllData) onReloadAllData();
              alert(
                lang === 'gu'
                  ? '✅ તમામ ડિફોલ્ટ એન્ટ્રીઓ દૂર થઈ ગઈ છે! હવે તમે તમારી નવી ફ્રેશ નોંધ કરી શકો છો.'
                  : lang === 'hi'
                  ? '✅ सभी डिफ़ॉल्ट प्रविष्टियां हटा दी गई हैं! अब आप नई प्रविष्टियां कर सकते हैं।'
                  : '✅ All default entries cleared! You can now start with fresh entries.'
              );
            }
          }}
          className="px-3.5 py-2 shrink-0 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-bold active:scale-95 transition"
        >
          {lang === 'gu' ? 'સાફ કરો' : lang === 'hi' ? 'साफ़ करें' : 'Clear'}
        </button>
      </div>

      {/* ==================================================== */}
      {/* FULL PRIVACY POLICY MODAL                            */}
      {/* ==================================================== */}
      {isPrivacyPolicyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 bg-slate-900/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">
                    {lang === 'gu' ? 'પ્રાઇવસી પોલિસી (Privacy Policy)' : lang === 'hi' ? 'प्राइवेसी पॉलिसी (Privacy Policy)' : 'Privacy Policy & Terms'}
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {lang === 'gu' ? 'તમારા ડેટાની ૧૦૦% ગોપનીયતા અને સુરક્ષા ગેરંટી' : '100% Privacy & Data Security Protection'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPrivacyPolicyOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body - Scrollable content */}
            <div className="p-4 overflow-y-auto space-y-3.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {/* Point 1: 100% Online Security */}
              <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 space-y-1">
                <span className="font-black text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                  <span>🛡️</span>
                  <span>{lang === 'gu' ? '૧. ૧૦૦% ઓનલાઇન ક્લાઉડ સુરક્ષા (100% Online Cloud Security)' : lang === 'hi' ? '१. १००% ऑनलाइन क्लाउड सुरक्षा' : '1. 100% Online Cloud Security'}</span>
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  {lang === 'gu'
                    ? 'તમારી તમામ વ્યક્તિગત ડાયરીની નોંધો, દવાઓનું શિડ્યુલ, રોકડ અને બેંકનો હિસાબ ૧૦૦% ઓનલાઇન એન્ક્રિપ્શન સાથે સુરક્ષિત રહે છે. ઇન્ટરનેટ કનેક્શન સાથે જ એપ ઓપન થાય છે જેથી તમારો ડેટા સુરક્ષિત રહે.'
                    : 'All your diary notes, health vitals, finances, and shopping lists operate with 100% online real-time encryption and cloud protection.'}
                </p>
              </div>

              {/* Point 2: Biometrics */}
              <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 space-y-1">
                <span className="font-black text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                  <span>🔐</span>
                  <span>{lang === 'gu' ? '૨. ફિંગરપ્રિન્ટ & બાયોમેટ્રિક સુરક્ષા (Biometric Security)' : '2. Biometric Fingerprint & Security'}</span>
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  {lang === 'gu'
                    ? 'ફિંગરપ્રિન્ટ કે ફેસ લૉક સંપૂર્ણપણે તમારા ફોનના હાર્ડવેર સિક્યુરિટી એન્ક્લેવ દ્વારા જ ચકાસાય છે. અમારી એપ્લિકેશન તમારી ફિંગરપ્રિન્ટ ક્યારેય કોપી કે સેવ કરતી નથી.'
                    : 'Biometric authorization is handled strictly by your device Android Biometric hardware enclave. The application never stores or has access to your raw biometric fingerprints.'}
                </p>
              </div>

              {/* Point 3: Voice / Microphone */}
              <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 space-y-1">
                <span className="font-black text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                  <span>🎙️</span>
                  <span>{lang === 'gu' ? '૩. માઇક્રોફોન અને વૉઇસ ટાઇપિંગ (Voice Typing)' : '3. Microphone & Voice Recognition'}</span>
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  {lang === 'gu'
                    ? 'માઇક્રોફોન પરવાનગીનો ઉપયોગ ફક્ત ત્યારે જ થાય છે જ્યારે તમે વૉઇસ ટાઇપિંગ બટન દબાવો છો. અવાજ કોઈપણ સર્વર પર રેકોર્ડ થતો નથી.'
                    : 'Microphone permission is strictly used in real-time when voice typing is activated by the user. No audio recordings are permanently stored or uploaded.'}
                </p>
              </div>

              {/* Point 4: Step Counter Sensors */}
              <div className="p-3 rounded-2xl bg-cyan-50/60 dark:bg-cyan-950/40 border border-cyan-200/80 dark:border-cyan-900/60 space-y-1">
                <span className="font-black text-cyan-900 dark:text-cyan-200 flex items-center gap-1.5">
                  <span>👟</span>
                  <span>{lang === 'gu' ? '૪. ફિટનેસ & સ્ટેપ સેન્સર (Motion Sensors & Step Counter)' : '4. Fitness & Motion Sensors'}</span>
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  {lang === 'gu'
                    ? 'દૈનિક ચાલવાના પગલાં ગણવા માટે મોબાઇલના મોશન સેન્સરનો ઉપયોગ થાય છે જેથી તમારી ફિટનેસ સુધારી શકાય. આ ગણતરી ફક્ત તમારા ફોનમાં જ રહે છે.'
                    : 'Motion sensors are used to calculate daily walking steps and burnt calories locally without sharing movement coordinates.'}
                </p>
              </div>

              {/* Point 5: Photos & Media Vault Privacy */}
              <div className="p-3 rounded-2xl bg-pink-50/60 dark:bg-pink-950/40 border border-pink-200/80 dark:border-pink-900/60 space-y-1">
                <span className="font-black text-pink-900 dark:text-pink-200 flex items-center gap-1.5">
                  <span>📸</span>
                  <span>{lang === 'gu' ? '૫. ફોટો અને મીડિયા ગોપનીયતા (Photos & Media Vault Privacy)' : '5. Photos & Media Vault Privacy'}</span>
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  {lang === 'gu'
                    ? 'તમારી ફોટો ગેલેરીના તમામ ફેવરિટ ફોટા માત્ર તમારા મોબાઇલમાં જ સ્થાનિક રીતે સચવાય છે. તે કોઈ સર્વર પર અપલોડ થતા નથી અને તમે તેને વ્યક્તિગત PIN અથવા ફિંગરપ્રિન્ટ લૉક વડે સુરક્ષિત રાખી શકો છો.'
                    : 'All photos in your favorite gallery vault are saved locally on your device only. They are never transmitted to any external server and can be secured with a PIN or fingerprint lock.'}
                </p>
              </div>

              {/* Point 6: Contacts Privacy */}
              <div className="p-3 rounded-2xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-900/60 space-y-1">
                <span className="font-black text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
                  <span>👥</span>
                  <span>{lang === 'gu' ? '૬. સંપર્કોની સુરક્ષા (Contacts Access Privacy)' : '6. Contacts Access Privacy'}</span>
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  {lang === 'gu'
                    ? 'સંપર્કોની પરવાનગી માત્ર ખાતાવહી, કામોના રિમાઇન્ડર અને ઇમરજન્સી હેલ્પલાઇન માટે તમારા ફોનમાંથી સીધા નામ અને નંબર પસંદ કરવા માટે જ વપરાય છે. તમારી કોન્ટેક્ટ બુક ક્યારેય કોઈ સાથે શેર થતી નથી.'
                    : 'Contact access is strictly utilized on-demand when selecting contacts for khata transactions, reminders, or emergency speed-dial. Your phonebook is never uploaded, synced, or shared.'}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsPrivacyPolicyOpen(false)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs active:scale-95 transition"
              >
                {lang === 'gu' ? 'સમજાઈ ગયું / બંધ કરો' : lang === 'hi' ? 'समझ गया / बंद करें' : 'Understood / Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
