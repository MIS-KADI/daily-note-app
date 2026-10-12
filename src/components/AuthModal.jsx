import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Lock,
  Phone,
  CheckCircle2,
  AlertCircle,
  LogIn,
  UserPlus,
  Users,
  X,
  RefreshCw,
  Trash2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { backupSyncService } from '../services/backupSyncService';

export default function AuthModal({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  lang = 'gu',
}) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'signup' | 'accounts'
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [detectedBackup, setDetectedBackup] = useState(null);
  const [registeredAccounts, setRegisteredAccounts] = useState([]);

  // Load registered accounts when modal opens
  useEffect(() => {
    if (isOpen) {
      const accounts = backupSyncService.getAccountsRegistry();
      setRegisteredAccounts(accounts);
      if (currentUser?.email) {
        setEmail(currentUser.email);
      }
      setErrorMsg('');
      setSuccessMsg('');
    }
  }, [isOpen, currentUser]);

  // Check for existing backup as user types email
  useEffect(() => {
    const cleanEmail = backupSyncService.normalizeEmail(email);
    if (cleanEmail && cleanEmail.includes('@') && cleanEmail.includes('.')) {
      backupSyncService.getAccountBackup(cleanEmail).then((b) => {
        if (b && b.recordCounts) {
          setDetectedBackup(b);
        } else {
          setDetectedBackup(null);
        }
      });
    } else {
      setDetectedBackup(null);
    }
  }, [email]);

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const cleanEmail = backupSyncService.normalizeEmail(email);
      if (!cleanEmail || !cleanEmail.includes('@')) {
        setErrorMsg(
          lang === 'gu'
            ? 'કૃપા કરીને માન્ય ઈમેલ સરનામું દાખલ કરો.'
            : lang === 'hi'
            ? 'कृपया वैध ईमेल पता दर्ज करें।'
            : 'Please enter a valid email address.'
        );
        setLoading(false);
        return;
      }

      const res = await backupSyncService.loginWithEmail(cleanEmail, pin);
      if (res.success) {
        setSuccessMsg(
          res.isNew
            ? (lang === 'gu'
                ? '✅ નવું એકાઉન્ટ સફળતાપૂર્વક સેટ થયું અને ઓટો-બેકઅપ શરૂ થયું!'
                : lang === 'hi'
                ? '✅ नया अकाउंट सफलतापूर्वक सेट हुआ और ऑटो-बैकअप शुरू हुआ!'
                : '✅ New account created & auto-backup enabled!')
            : (lang === 'gu'
                ? '🎉 તમારો જૂનો ડેટા (નોંધો, હિસાબ, રિમાઇન્ડર્સ) સફળતાપૂર્વક રીસ્ટોર થયો!'
                : lang === 'hi'
                ? '🎉 आपका पुराना डेटा (डायरी, हिसाब, कार्य) सफलतापूर्वक रीस्टोर हुआ!'
                : '🎉 Your old data (notes, finances, reminders) restored successfully!')
        );
        setTimeout(() => {
          onLoginSuccess(res.restoredData);
          onClose();
        }, 1200);
      } else {
        setErrorMsg(res.error || 'Login failed');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error logging in');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const cleanEmail = backupSyncService.normalizeEmail(email);
      if (!cleanEmail || !cleanEmail.includes('@')) {
        setErrorMsg(
          lang === 'gu'
            ? 'કૃપા કરીને માન્ય ઈમેલ સરનામું દાખલ કરો.'
            : lang === 'hi'
            ? 'कृपया वैध ईमेल पता दर्ज करें।'
            : 'Please enter a valid email address.'
        );
        setLoading(false);
        return;
      }

      // Check if backup already exists
      const existing = await backupSyncService.getAccountBackup(cleanEmail);
      if (existing) {
        setErrorMsg(
          lang === 'gu'
            ? 'આ ઈમેલ ID પહેલેથી જ નોંધાયેલ છે! કૃપા કરીને "લોગિન" ટેબમાંથી લોગિન કરો.'
            : lang === 'hi'
            ? 'यह ईमेल आईडी पहले से पंजीकृत है! कृपया "लॉगिन" टैब से लॉगिन करें।'
            : 'This email is already registered! Please login from the Login tab.'
        );
        setLoading(false);
        return;
      }

      // Create new profile
      const newProfile = {
        ...(currentUser || {}),
        name: name.trim() || 'યુઝર',
        email: cleanEmail,
        mobile: mobile.trim(),
        pin: pin || '1234',
        isRegistered: true,
      };

      const initialPayload = backupSyncService.buildDataPayload({
        ...backupSyncService.buildDataPayload(),
        user: newProfile,
      });

      await backupSyncService.saveAccountBackup(cleanEmail, initialPayload);
      backupSyncService.setActiveSession({
        email: cleanEmail,
        isLoggedIn: true,
        lastLoginAt: new Date().toISOString(),
      });

      setSuccessMsg(
        lang === 'gu'
          ? '🎉 એકાઉન્ટ સફળતાપૂર્વક બન્યું! તમારો તમામ ડેટા હવે આ ઈમેલમાં સુરક્ષિત ઓટો-સિંક થશે.'
          : lang === 'hi'
          ? '🎉 अकाउंट सफलतापूर्वक बन गया! आपका सारा डेटा अब इस ईमेल में सुरक्षित ऑटो-सिंक होगा।'
          : '🎉 Account created successfully! Your data will now auto-sync securely to this email.'
      );

      setTimeout(() => {
        onLoginSuccess(initialPayload);
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Error signing up');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchAccount = async (targetEmail) => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await backupSyncService.loginWithEmail(targetEmail);
      if (res.success) {
        setSuccessMsg(
          lang === 'gu'
            ? `🎉 એકાઉન્ટ (${targetEmail}) નો જૂનો ડેટા સફળતાપૂર્વક લોડ થયો!`
            : lang === 'hi'
            ? `🎉 अकाउंट (${targetEmail}) का पुराना डेटा सफलतापूर्वक लोड हुआ!`
            : `🎉 Switched to (${targetEmail}) and restored old data!`
        );
        setTimeout(() => {
          onLoginSuccess(res.restoredData);
          onClose();
        }, 1000);
      } else {
        setErrorMsg(res.error || 'Switch failed');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error switching account');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = (targetEmail, e) => {
    e.stopPropagation();
    const conf = window.confirm(
      lang === 'gu'
        ? `શું તમે ખરેખર ${targetEmail} ને આ ઉપકરણમાંથી દૂર કરવા માંગો છો?`
        : lang === 'hi'
        ? `क्या आप वाकई ${targetEmail} को इस डिवाइस से हटाना चाहते हैं?`
        : `Remove ${targetEmail} from this device?`
    );
    if (conf) {
      backupSyncService.deleteAccountFromDevice(targetEmail);
      setRegisteredAccounts(backupSyncService.getAccountsRegistry());
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 bg-slate-900/75 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
        {/* Header with Royal Navy Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 p-5 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition active:scale-95"
          >
            <X size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg shadow-amber-500/20">
              🔐
            </div>
            <div>
              <h3 className="text-base font-black tracking-wide">
                {lang === 'gu' ? 'ઈમેલ ઓટો-બેકઅપ & લોગિન' : lang === 'hi' ? 'ईमेल ऑटो-बैकअप व लॉगिन' : 'Email Auto-Backup & Login'}
              </h3>
              <p className="text-xs text-blue-200 font-medium">
                {lang === 'gu'
                  ? 'લૉગિન અને લૉગઆઉટ પર જૂનો ડેટા સુરક્ષિત સાચવો'
                  : lang === 'hi'
                  ? 'लॉगिन और लॉगआउट पर पुराना डेटा सुरक्षित रखें'
                  : 'Preserve old data across login and logout'}
              </p>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="grid grid-cols-3 gap-1.5 mt-4 bg-white/10 p-1 rounded-2xl backdrop-blur-xs">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'login'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <LogIn size={14} />
              <span>{lang === 'gu' ? 'લોગિન' : lang === 'hi' ? 'लॉगिन' : 'Login'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('signup');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'signup'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <UserPlus size={14} />
              <span>{lang === 'gu' ? 'સાઇન અપ' : lang === 'hi' ? 'साइन अप' : 'Sign Up'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('accounts');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
                activeTab === 'accounts'
                  ? 'bg-white text-blue-900 shadow-sm'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Users size={14} />
              <span>
                {lang === 'gu' ? 'એકાઉન્ટ્સ' : lang === 'hi' ? 'अकाउंट्स' : 'Accounts'}{' '}
                {registeredAccounts.length > 0 && `(${registeredAccounts.length})`}
              </span>
            </button>
          </div>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="m-4 mb-0 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="m-4 mb-0 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* TAB 1: LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Mail size={14} className="text-blue-600" />
                  <span>{lang === 'gu' ? 'ઈમેલ ID (Email)' : lang === 'hi' ? 'ईमेल ID (Email)' : 'Email ID'}</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Detected Backup Notification */}
              {detectedBackup && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 rounded-2xl text-xs space-y-1.5 animate-in fade-in">
                  <div className="flex items-center gap-1.5 text-blue-900 dark:text-blue-200 font-bold">
                    <Sparkles size={14} className="text-amber-500 shrink-0" />
                    <span>
                      {lang === 'gu'
                        ? '✅ આ ઈમેલ માટે અગાઉનો બેકઅપ ઉપલબ્ધ છે!'
                        : lang === 'hi'
                        ? '✅ इस ईमेल के लिए पुराना बैकअप उपलब्ध है!'
                        : '✅ Previous backup found for this email!'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 font-semibold">
                      📝 {detectedBackup.recordCounts?.notes || 0} નોંધો
                    </span>
                    <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 font-semibold">
                      💰 {detectedBackup.recordCounts?.finance || 0} હિસાબ
                    </span>
                    <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 font-semibold">
                      ⏰ {detectedBackup.recordCounts?.reminders || 0} કામો
                    </span>
                    <span className="bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 font-semibold">
                      💊 {detectedBackup.recordCounts?.medicines || 0} દવાઓ
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Lock size={14} className="text-blue-600" />
                    <span>{lang === 'gu' ? 'સુરક્ષા PIN (વૈકલ્પિક)' : lang === 'hi' ? 'सुरक्षा PIN (वैकल्पिक)' : 'Security PIN (Optional)'}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">ડિફોલ્ટ: 1234</span>
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="1234"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-slate-100 tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-blue-500/25 active:scale-98 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <LogIn size={16} />
                )}
                <span>
                  {lang === 'gu'
                    ? 'લોગિન કરો અને જૂનો ડેટા મેળવો'
                    : lang === 'hi'
                    ? 'लॉगिन करें और पुराना डेटा प्राप्त करें'
                    : 'Login & Restore Old Data'}
                </span>
              </button>
            </form>
          )}

          {/* TAB 2: SIGN UP */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <User size={14} className="text-blue-600" />
                  <span>{lang === 'gu' ? 'તમારું નામ (Full Name)' : lang === 'hi' ? 'आपका नाम (Full Name)' : 'Full Name'}</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="દા.ત. રમેશ પટેલ"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Mail size={14} className="text-blue-600" />
                  <span>{lang === 'gu' ? 'ઈમેલ ID (Email - બેકઅપ માટે)' : lang === 'hi' ? 'ईमेल ID (बैकअप के लिए)' : 'Email ID (For Auto-Backup)'}</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Phone size={14} className="text-blue-600" />
                  <span>{lang === 'gu' ? 'મોબાઇલ નંબર (વૈકલ્પિક)' : lang === 'hi' ? 'मोबाइल नंबर (वैकल्पिक)' : 'Mobile Number (Optional)'}</span>
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  placeholder="9876543210"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Lock size={14} className="text-blue-600" />
                  <span>{lang === 'gu' ? '4-અંકનો સુરક્ષા PIN' : lang === 'hi' ? '4-अंकों का सुरक्षा PIN' : '4-Digit Security PIN'}</span>
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="1234"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-900 dark:text-slate-100 tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-500/25 active:scale-98 transition flex items-center justify-center gap-2 disabled:opacity-50 pt-3"
              >
                {loading ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <UserPlus size={16} />
                )}
                <span>
                  {lang === 'gu'
                    ? 'નવું એકાઉન્ટ બનાવો & ઓટો-બેકઅપ શરૂ કરો'
                    : lang === 'hi'
                    ? 'नया अकाउंट बनाएं और ऑटो-बैकअप शुरू करें'
                    : 'Create Account & Start Auto-Backup'}
                </span>
              </button>
            </form>
          )}

          {/* TAB 3: REGISTERED ACCOUNTS */}
          {activeTab === 'accounts' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lang === 'gu'
                  ? 'આ ઉપકરણ પર સાચવેલા એકાઉન્ટ્સ. ૧-ક્લિકમાં સ્વિચ કરી જૂનો ડેટા લોડ કરો:'
                  : lang === 'hi'
                  ? 'इस डिवाइस पर सहेजे गए अकाउंट्स। 1-क्लिक में स्विच कर पुराना डेटा लोड करें:'
                  : 'Saved accounts on this device. Switch with 1-click to restore:'}
              </p>

              {registeredAccounts.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
                  {lang === 'gu'
                    ? 'હજુ કોઈ અન્ય એકાઉન્ટ સેવ થયેલ નથી. નવું એકાઉન્ટ બનાવવા "સાઇન અપ" કરો.'
                    : lang === 'hi'
                    ? 'अभी कोई अन्य अकाउंट सहेजा नहीं गया है।'
                    : 'No other saved accounts found on this device.'}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {registeredAccounts.map((acc) => {
                    const isCurrent =
                      backupSyncService.normalizeEmail(currentUser?.email) ===
                      backupSyncService.normalizeEmail(acc.email);
                    return (
                      <div
                        key={acc.email}
                        onClick={() => !isCurrent && handleSwitchAccount(acc.email)}
                        className={`p-3.5 rounded-2xl border transition flex items-center justify-between ${
                          isCurrent
                            ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 cursor-default'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-400 cursor-pointer active:scale-99'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shrink-0">
                            {acc.name ? acc.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                                {acc.name || 'યુઝર'}
                              </h4>
                              {isCurrent && (
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full">
                                  {lang === 'gu' ? 'સક્રિય' : 'Active'}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {acc.email}
                            </p>
                            {acc.recordCounts && (
                              <div className="flex gap-2 text-[10px] text-slate-500 mt-0.5">
                                <span>📝 {acc.recordCounts.notes || 0}</span>
                                <span>💰 {acc.recordCounts.finance || 0}</span>
                                <span>⏰ {acc.recordCounts.reminders || 0}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {!isCurrent ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSwitchAccount(acc.email);
                              }}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition active:scale-95"
                            >
                              {lang === 'gu' ? 'સ્વિચ' : lang === 'hi' ? 'स्विच' : 'Switch'}
                            </button>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                              ✓
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={(e) => handleDeleteAccount(acc.email, e)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition"
                            title="Remove from list"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Guest / Cancel Button */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 text-center text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition"
            >
              {lang === 'gu'
                ? 'ગેસ્ટ / સ્થાનિક તરીકે ચાલુ રાખો (બંધ કરો)'
                : lang === 'hi'
                ? 'गेस्ट / स्थानीय रूप में जारी रखें (बंद करें)'
                : 'Continue as Guest (Close)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
