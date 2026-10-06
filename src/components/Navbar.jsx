import React from 'react';
import {
  Bell,
  Calculator,
  Lock,
  Volume2,
  Sun,
  Moon,
  ShoppingBag,
  ShieldAlert,
  Globe,
  Image as ImageIcon,
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
  onOpenPhotoGallery,
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
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3 py-2 shadow-xs w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between w-full">
        {/* Brand Logo Icon */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/25 text-sm select-none">
            📔
          </div>
        </div>

        {/* Action Controls - Compact & Clean */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Language Selector Button */}
          <button
            onClick={onOpenLanguage}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition active:scale-95 flex items-center gap-0.5 text-[11px] font-bold"
            title={t('language', lang)}
          >
            <Globe size={15} className="text-blue-600" />
            <span className="uppercase text-[10px]">{lang}</span>
          </button>

          {/* Dark / Light Mode Switcher */}
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition active:scale-95"
            title={theme === 'dark' ? t('light_mode', lang) : t('dark_mode', lang)}
          >
            {theme === 'dark' ? (
              <Sun size={15} className="text-amber-400" />
            ) : (
              <Moon size={15} className="text-indigo-600" />
            )}
          </button>

          {/* Photo Gallery Quick Access */}
          <button
            onClick={onOpenPhotoGallery}
            className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 transition active:scale-95"
            title={lang === 'gu' ? '📸 ફોટો ગેલેરી' : '📸 Photo Gallery'}
          >
            <ImageIcon size={15} />
          </button>

          {/* Shopping Quick Access */}
          <button
            onClick={onOpenShopping}
            className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 transition active:scale-95"
            title={t('btn_shopping', lang)}
          >
            <ShoppingBag size={15} />
          </button>

          {/* Quick Calculator */}
          <button
            onClick={onOpenCalculator}
            className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 transition active:scale-95"
            title={t('btn_calculator', lang)}
          >
            <Calculator size={15} />
          </button>

          {/* Emergency Helpline */}
          <button
            onClick={onOpenEmergency}
            className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/60 transition active:scale-95"
            title={t('btn_emergency', lang)}
          >
            <ShieldAlert size={15} />
          </button>

          {/* Quick Alarm Ringtone Test Button */}
          <button
            onClick={onTestAlarm}
            className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 transition active:scale-95"
            title="Alarm Ringtone"
          >
            <Volume2 size={15} />
          </button>

          {/* Notification Permission Button */}
          <button
            onClick={handleRequestNotification}
            className={`p-1.5 rounded-lg border transition active:scale-95 relative ${
              notificationService.hasPermission()
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
            title="Notifications"
          >
            <Bell size={15} />
            {activeAlarmCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white rounded-full text-[8px] font-bold flex items-center justify-center animate-pulse">
                {activeAlarmCount}
              </span>
            )}
          </button>

          {/* Lock App */}
          <button
            onClick={onLockApp}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition active:scale-95"
            title="Lock App"
          >
            <Lock size={15} />
          </button>
        </div>
      </div>
    </header>
  );
}
