import React from 'react';
import { Home, BookOpen, Clock, HeartPulse, IndianRupee, FileText, UserCheck } from 'lucide-react';
import { t } from '../services/i18n';

export default function BottomNav({ activeTab, onTabChange, lang = 'gu' }) {
  const tabs = [
    { id: 'home', label: t('tab_home', lang), icon: Home },
    { id: 'notes', label: t('tab_notes', lang), icon: BookOpen },
    { id: 'reminders', label: t('tab_reminders', lang), icon: Clock },
    { id: 'health', label: t('tab_health', lang), icon: HeartPulse },
    { id: 'finance', label: t('tab_finance', lang), icon: IndianRupee },
    { id: 'reports', label: t('tab_reports', lang), icon: FileText },
    { id: 'profile', label: t('tab_profile', lang), icon: UserCheck },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-2 px-2 shadow-lg">
      <div className="max-w-md mx-auto grid grid-cols-7 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id || (tab.id === 'health' && activeTab === 'medicine');
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1 rounded-xl transition-all ${
                isActive
                  ? 'text-blue-600 font-bold scale-105'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  isActive ? 'bg-blue-100 text-blue-600 shadow-xs' : ''
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
