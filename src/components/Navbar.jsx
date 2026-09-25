import React from 'react';
import {
  Bell,
  Calculator,
  ShieldCheck,
  Lock,
  Volume2,
  Sun,
  Moon,
  ShoppingBag,
  ShieldAlert,
  Globe,
} from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { t } from '../services/i18n';

export default function Navbar({
  user,
  lang = 'gu',
  theme = 'light',
  onToggleTheme,
  onOpenLanguage,
  onOpenCalculator,
  onOpenShopping,
  onOpenEmergency,
  onTestAlarm,
  onLockApp,
  activeAlarmCount = 0,
}) {
  const handleRequestNotification = async () => {
    const granted = await notificationService.requestPermission();
    if (granted) {
      notificationService.send(
        lang === 'hi' ? 'सूचनाएं सक्रिय हो गईं!' : lang === 'en' ? 'Notifications Enabled!' : 'નોટિફિકેશન સક્રિય થઈ ગઈ!',
        {
          body:
            lang === 'hi'
              ? 'समय पर अलार्म और रिमाइंडर मिलेंगे।'
              : lang === 'en'
              ? 'You will receive timely alarms and reminders.'
              : 'તમારા રીમાઇન્ડર્સ અને દવાઓનું એલાર્મ સમયસર મળશે.',
        }
      );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 py-2.5 shadow-xs">
      <div className="flex items-center justify-between">
        {/* Brand & Profile */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 text-base">
            📔
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold text-slate-800 leading-tight">
                {t('app_name', lang)}
              </h1>
              <span
                className="flex items-center gap-0.5 text-[9px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full"
                title={t('secure', lang)}
              >
                <ShieldCheck size={10} />
                {t('secure', lang)}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 leading-tight truncate max-w-[100px]">
              {user?.name || (lang === 'hi' ? 'मेरा खाता' : lang === 'en' ? 'My Account' : 'મારું એકાઉન્ટ')}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          {/* Language Selector Button */}
          <button
            onClick={onOpenLanguage}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition active:scale-95 flex items-center gap-1 text-[11px] font-bold"
            title={t('language', lang)}
          >
            <Globe size={15} className="text-blue-600" />
            <span className="uppercase text-[10px]">{lang}</span>
          </button>

          {/* Dark / Light Mode Switcher */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition active:scale-95"
            title={theme === 'dark' ? t('light_mode', lang) : t('dark_mode', lang)}
          >
            {theme === 'dark' ? (
              <Sun size={16} className="text-amber-400" />
            ) : (
              <Moon size={16} className="text-indigo-600" />
            )}
          </button>

          {/* Shopping Quick Access */}
          <button
            onClick={onOpenShopping}
            className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition active:scale-95"
            title={t('btn_shopping', lang)}
          >
            <ShoppingBag size={16} />
          </button>

          {/* Quick Calculator */}
          <button
            onClick={onOpenCalculator}
            className="p-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition active:scale-95"
            title={t('btn_calculator', lang)}
          >
            <Calculator size={16} />
          </button>

          {/* Emergency Helpline */}
          <button
            onClick={onOpenEmergency}
            className="p-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition active:scale-95"
            title={t('btn_emergency', lang)}
          >
            <ShieldAlert size={16} />
          </button>

          {/* Quick Alarm Test Button */}
          <button
            onClick={onTestAlarm}
            className="p-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition active:scale-95 flex items-center gap-1 text-[11px] font-semibold"
            title="Alarm Test"
          >
            <Volume2 size={16} />
          </button>

          {/* Notification Permission Button */}
          <button
            onClick={handleRequestNotification}
            className={`p-1.5 rounded-xl border transition active:scale-95 relative ${
              notificationService.hasPermission()
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
            }`}
          >
            <Bell size={16} />
            {activeAlarmCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white rounded-full text-[8px] font-bold flex items-center justify-center animate-pulse">
                {activeAlarmCount}
              </span>
            )}
          </button>

          {/* Lock App */}
          <button
            onClick={onLockApp}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition active:scale-95"
            title="Lock App"
          >
            <Lock size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
