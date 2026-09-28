import React, { useState } from 'react';
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
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { t } from '../../services/i18n';

export default function ProfileTab({ user, onUpdateUser, onReloadAllData, lang = 'gu' }) {
  const [name, setName] = useState(user?.name || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [email, setEmail] = useState(user?.email || '');
  const [upiId, setUpiId] = useState(user?.upiId || '9876543210@paytm');
  const [isPinRequired, setIsPinRequired] = useState(user?.isPinRequired ?? false);
  const [pin, setPin] = useState(user?.pin || '1234');
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(user?.isBiometricEnabled ?? true);
  const [isNightDiaryReminder, setIsNightDiaryReminder] = useState(user?.isNightDiaryReminder ?? true);
  const [isWaterReminder, setIsWaterReminder] = useState(user?.isWaterReminder ?? true);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updated = {
      ...user,
      name,
      mobile,
      email,
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

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                <Phone size={12} className="text-slate-500" />
                {t('mobile_number', lang)}
              </label>
              <span className="text-[10px] text-emerald-600 font-bold">{t('otp_verified', lang)}</span>
            </div>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="+91 98765 43210"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                <Mail size={12} className="text-slate-500" />
                {t('email_id', lang)}
              </label>
              <span className="text-[10px] text-emerald-600 font-bold">{t('confirmed', lang)}</span>
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="user@example.com"
              required
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
                <span className="text-[10px] text-slate-500 block">બાયોમેટ્રિક વડે ૧ સેકન્ડમાં સુરક્ષિત અનલૉક</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBiometricEnabled}
                  onChange={(e) => setIsBiometricEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

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

      {/* Privacy & Anti-Leak Guarantee */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl p-4 border border-emerald-200 shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
          <ShieldCheck size={18} className="text-emerald-700" />
          <span>{t('privacy_guarantee', lang)}</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed pl-1">
          {t('privacy_guarantee_desc', lang)}
        </p>
      </div>

      {/* Backup and Restore with Google Drive */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          {t('backup_restore_title', lang)}
        </h3>
        <p className="text-xs text-slate-500">
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
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition active:scale-98"
          >
            <Download size={15} />
            {t('download_backup', lang)}
          </button>

          <label className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer active:scale-98">
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
    </div>
  );
}
