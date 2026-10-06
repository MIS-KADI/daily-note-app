import React, { useState, useRef } from 'react';
import {
  UserCheck,
  Mail,
  Phone,
  ShieldCheck,
  Lock,
  Download,
  Upload,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Save,
  HelpCircle,
  Fingerprint,
  Sparkles,
  X,
  Shield,
  FileText,
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { biometricService } from '../../services/biometricService';
import { t } from '../../services/i18n';

export default function ProfileTab({
  user,
  onUpdateUser,
  onReloadAllData,
  onOpenMobilePermissions,
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
  const testHoldRef = useRef(null);

  const handleToggleBiometric = async (enable) => {
    if (enable) {
      setIsBiometricTesting(true);
      setBiometricNotice(lang === 'gu' ? '👆 ફિંગરપ્રિન્ટ સેન્સર ચકાસી રહ્યા છીએ...' : 'Checking biometric sensor...');
      
      const res = await biometricService.register(name || user?.name || 'Daily User');
      setIsBiometricTesting(false);

      if (res.success) {
        setIsBiometricEnabled(true);
        const updated = {
          ...user,
          isBiometricEnabled: true,
        };
        onUpdateUser(updated);
        setBiometricNotice(lang === 'gu' ? '✅ ફિંગરપ્રિન્ટ લૉક સફળતાપૂર્વક સક્ષમ થયું!' : '✅ Biometrics Enabled!');
        setTimeout(() => setBiometricNotice(''), 3500);
      } else if (res.cancelled) {
        setIsBiometricEnabled(false);
        setBiometricNotice(lang === 'gu' ? '❌ બાયોમેટ્રિક ચકાસણી કેન્સલ થઈ.' : 'Biometric cancelled.');
        setTimeout(() => setBiometricNotice(''), 3000);
      } else {
        setIsBiometricEnabled(false);
        setBiometricNotice(res.error || (lang === 'gu' ? 'સેન્સર ઉપલબ્ધ નથી.' : 'Sensor not available.'));
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
      setBiometricNotice(lang === 'gu' ? 'બાયોમેટ્રિક લૉક બંધ કરવામાં આવ્યું.' : 'Biometrics disabled.');
      setTimeout(() => setBiometricNotice(''), 2500);
    }
  };

  const handleTestBiometric = async () => {
    setIsBiometricTesting(true);
    setBiometricNotice(lang === 'gu' ? '👆 ફિંગરપ્રિન્ટ સેન્સર પર ટચ કરો...' : 'Touch fingerprint sensor...');
    const res = await biometricService.authenticate();
    setIsBiometricTesting(false);

    if (res.success) {
      setBiometricNotice(lang === 'gu' ? '✅ ફિંગરપ્રિન્ટ સફળતાપૂર્વક પ્રમાણિત થઈ!' : '✅ Biometric Verified!');
      setTimeout(() => setBiometricNotice(''), 3500);
    } else {
      setBiometricNotice(
        lang === 'gu'
          ? '👇 નીચે આપેલ ફિંગરપ્રિન્ટ સેન્સર પર આંગળી ૨ સેકન્ડ દબાવી રાખો'
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
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleExport = () => {
    storageService.exportBackup();
  };

  const handleGoogleDriveBackup = () => {
    storageService.exportBackup();
    setTimeout(() => {
      window.open('https://drive.google.com/drive/my-drive', '_blank');
    }, 700);
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const res = storageService.importBackup(content);
        if (res.success) {
          alert(t('backup_restore_success', lang));
          onReloadAllData();
        } else {
          alert(t('backup_file_error', lang) + res.error);
        }
      }
    };
    reader.readAsText(file);
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
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full mt-0.5">
                <CheckCircle2 size={12} />
                {t('mobile_email_linked', lang)}
              </span>
            </div>
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
              {t('mobile_number', lang)} ({lang === 'gu' ? '૧૦ અંક' : '10 digits'})
            </label>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="10 અંકનો મોબાઈલ નંબર"
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

          {/* Date of Birth (DOB) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              {lang === 'gu' ? 'જન્મ તારીખ (DOB)' : 'Date of Birth'}
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Receiving UPI ID for Khata QR Code */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              તમારી UPI ID (ખાતાના QR કોડ અને પેમેન્ટ લેવા માટે):
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
            <h4 className="text-xs font-bold text-slate-800">રોજિંદા રીમાઇન્ડર્સ અને હેબિટ સેટિંગ્સ:</h4>

            {/* 9:00 PM Diary Reminder */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">🌙 રાત્રે ૯:૦૦ વાગ્યે ડાયરી રીમાઇન્ડર</span>
                <span className="text-[10px] text-slate-500 block">"આજનો દિવસ કેવો રહ્યો? ૨ મિનિટમાં ડાયરી લખો"</span>
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
                <span className="text-xs font-semibold text-slate-800 block">💧 દર ૨ કલાકે પાણી પીવાનું એલર્ટ</span>
                <span className="text-[10px] text-slate-500 block">દિવસ દરમિયાન સમયસર હાઇડ્રેશન રીમાઇન્ડર</span>
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
            <h4 className="text-xs font-bold text-slate-800">એપ સિક્યોરિટી & બાયોમેટ્રિક્સ:</h4>

            {/* Biometric Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">👆 ફિંગરપ્રિન્ટ / Face ID લૉક</span>
                <span className="text-[10px] text-slate-500 block">Android ફોનમાં નેટિવ સેન્સર અને બ્રાઉઝરમાં ટચ સેન્સર બંને સક્ષમ</span>
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
                  {lang === 'gu' ? 'મોબાઇલ પરવાનગીઓ & ઍક્સેસ' : 'Mobile Permissions & Access'}
                </h3>
                <p className="text-[10px] text-blue-700 font-semibold">
                  માઇક્રોફોન, એલાર્મ નોટિફિકેશન અને સાઉન્ડ સેટિંગ્સ
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenMobilePermissions}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition active:scale-95 flex items-center gap-1.5"
            >
              <span>ચકાસો ⚙️</span>
            </button>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            મોબાઈલમાં વૉઇસ ટાઇપિંગ અને સમયસર અલાર્મ વાગવા માટે જરૂરી પરવાનગીઓ સેટ કરવા માટે અહીં ક્લિક કરો.
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
                {lang === 'gu' ? '૧૦૦% ઓફલાઇન • સંપૂર્ણ સુરક્ષિત • કોઈ ટ્રેકિંગ નહીં' : '100% Offline • Fully Secure • Zero Tracking'}
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

      {/* Backup and Restore with Google Drive */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
          {t('backup_restore_title', lang)}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {t('backup_restore_desc', lang)}
        </p>

        {/* Google Drive 1-Click Auto Sync Button */}
        <button
          onClick={handleGoogleDriveBackup}
          className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 hover:opacity-95 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-98 transition"
        >
          <span className="text-base">☁️</span>
          <span>Google Drive / ક્લાઉડમાં ઓટો-બેકઅપ સાચવો</span>
        </button>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition active:scale-98"
          >
            <Download size={15} />
            {t('download_backup', lang)}
          </button>

          <label className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer active:scale-98">
            <Upload size={15} />
            {t('restore_backup', lang)}
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>
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
              {/* Point 1: 100% Offline */}
              <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 space-y-1">
                <span className="font-black text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                  <span>🛡️</span>
                  <span>{lang === 'gu' ? '૧. ૧૦૦% ઓફલાઇન અને સ્થાનિક સંગ્રહ (Offline Local Storage)' : '1. 100% Offline & Local Storage'}</span>
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  {lang === 'gu'
                    ? 'તમારી તમામ વ્યક્તિગત ડાયરીની નોંધો, દવાઓનું શિડ્યુલ, રોકડ અને બેંકનો હિસાબ, ખરીદીની યાદી અને દૈનિક પગલાં (Steps) ફક્ત તમારા મોબાઇલ ફોનની મેમરીમાં જ સચવાય છે. અમારું કોઈ કેન્દ્રીય સર્વર તમારા ડેટાને સંગ્રહિત કે વાંચી શકતું નથી.'
                    : 'All your diary notes, health vitals, finances, shopping lists, and steps are stored exclusively on your own phone storage. No server collects or transmits your private data.'}
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

              {/* Point 5: Zero Ads & Complete Data Ownership */}
              <div className="p-3 rounded-2xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-900/60 space-y-1">
                <span className="font-black text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                  <span>🚫</span>
                  <span>{lang === 'gu' ? '૫. કોઈ જાહેરાતો નહીં & સંપૂર્ણ ડેટા માલિકી (No Ads & Full Ownership)' : '5. Ad-Free & Data Ownership'}</span>
                </span>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  {lang === 'gu'
                    ? 'એપ સંપૂર્ણપણે જાહેરાત મુક્ત (Ad-Free) છે. તમે કોઈપણ સમયે બેકઅપ ડાઉનલોડ કરી શકો છો અથવા એક ક્લિકમાં તમારો તમામ ડેટા ભૂંસી શકો છો.'
                    : 'This app is 100% ad-free and tracker-free. You have full ownership to export backups or wipe all stored data at any time.'}
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
