import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Wallet,
  Building2,
  Users,
  CreditCard,
  IndianRupee,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { t } from '../services/i18n';

// Distinct modern color palette for categories
const CATEGORY_COLORS = [
  { name: 'blue', hex: '#3b82f6', bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-50' },
  { name: 'amber', hex: '#f59e0b', bg: 'bg-amber-500', text: 'text-amber-600', light: 'bg-amber-50' },
  { name: 'emerald', hex: '#10b981', bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50' },
  { name: 'purple', hex: '#8b5cf6', bg: 'bg-purple-500', text: 'text-purple-600', light: 'bg-purple-50' },
  { name: 'rose', hex: '#f43f5e', bg: 'bg-rose-500', text: 'text-rose-600', light: 'bg-rose-50' },
  { name: 'cyan', hex: '#06b6d4', bg: 'bg-cyan-500', text: 'text-cyan-600', light: 'bg-cyan-50' },
  { name: 'orange', hex: '#f97316', bg: 'bg-orange-500', text: 'text-orange-600', light: 'bg-orange-50' },
  { name: 'indigo', hex: '#6366f1', bg: 'bg-indigo-500', text: 'text-indigo-600', light: 'bg-indigo-50' },
  { name: 'slate', hex: '#64748b', bg: 'bg-slate-500', text: 'text-slate-600', light: 'bg-slate-50' },
];

export default function FinanceCharts({
  finance = [],
  accounts = { bankBalance: 42500, cashBalance: 6800 },
  khata = [],
  lang = 'gu',
}) {
  const [timeframe, setTimeframe] = useState('all'); // 'month' | 'week' | 'all'
  const [selectedCategory, setSelectedCategory] = useState(null);

  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

  // Filter finance by timeframe
  const filteredFinance = finance.filter((item) => {
    if (!item.date) return true;
    if (timeframe === 'month') return item.date.startsWith(currentMonth);
    if (timeframe === 'week') return item.date >= sevenDaysAgo;
    return true;
  });

  // Calculate Income, Expense, and Savings
  const totalIncome = filteredFinance
    .filter((f) => f.type === 'income')
    .reduce((sum, f) => sum + Number(f.amount || 0), 0);

  const totalExpense = filteredFinance
    .filter((f) => f.type === 'expense')
    .reduce((sum, f) => sum + Number(f.amount || 0), 0);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  // Category breakdown for expenses
  const categoryMap = {};
  filteredFinance
    .filter((f) => f.type === 'expense')
    .forEach((f) => {
      const cat = f.category || (lang === 'gu' ? 'અન્ય ખર્ચ' : 'Other Expense');
      categoryMap[cat] = (categoryMap[cat] || 0) + Number(f.amount || 0);
    });

  const categoryList = Object.entries(categoryMap)
    .map(([cat, amount], index) => {
      const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
      const percentage = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
      return { category: cat, amount, percentage, color };
    })
    .sort((a, b) => b.amount - a.amount);

  // SVG Donut calculation
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  const donutSlices = categoryList.map((item) => {
    const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -accumulatedOffset;
    accumulatedOffset += (item.percentage / 100) * circumference;
    return {
      ...item,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  // Bank vs Cash liquid wealth
  const bankBalance = Number(accounts?.bankBalance || 0);
  const cashBalance = Number(accounts?.cashBalance || 0);
  const totalLiquid = bankBalance + cashBalance;
  const bankPct = totalLiquid > 0 ? Math.round((bankBalance / totalLiquid) * 100) : 50;
  const cashPct = 100 - bankPct;

  // Khata Lena vs Dena
  const totalToReceive = khata
    .filter((k) => !k.isSettled && k.type === 'to_receive')
    .reduce((sum, k) => sum + Number(k.amount || 0), 0);

  const totalToPay = khata
    .filter((k) => !k.isSettled && k.type === 'to_pay')
    .reduce((sum, k) => sum + Number(k.amount || 0), 0);

  const totalKhataVolume = totalToReceive + totalToPay;
  const receivePct = totalKhataVolume > 0 ? Math.round((totalToReceive / totalKhataVolume) * 100) : 50;
  const payPct = 100 - receivePct;

  // Day-of-week expense distribution (Sun - Sat)
  const dayNamesGu = ['રવિ', 'સોમ', 'મંગળ', 'બુધ', 'ગુરુ', 'શુક્ર', 'શનિ'];
  const dayNamesHi = ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'];
  const dayNamesEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const activeDayNames = lang === 'hi' ? dayNamesHi : lang === 'en' ? dayNamesEn : dayNamesGu;

  const weekdayTotals = [0, 0, 0, 0, 0, 0, 0];
  filteredFinance
    .filter((f) => f.type === 'expense' && f.date)
    .forEach((f) => {
      const d = new Date(f.date).getDay();
      if (!isNaN(d)) {
        weekdayTotals[d] += Number(f.amount || 0);
      }
    });

  const maxWeekdayAmount = Math.max(...weekdayTotals, 1);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Timeframe Controller */}
      <div className="bg-white p-1 rounded-2xl border border-slate-200 flex items-center justify-between shadow-xs">
        <div className="flex gap-1 w-full text-xs font-bold">
          <button
            onClick={() => setTimeframe('all')}
            className={`flex-1 py-1.5 rounded-xl transition ${
              timeframe === 'all'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {lang === 'hi' ? 'सभी समय' : lang === 'en' ? 'All Time' : 'બધો સમય'}
          </button>
          <button
            onClick={() => setTimeframe('month')}
            className={`flex-1 py-1.5 rounded-xl transition ${
              timeframe === 'month'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {lang === 'hi' ? 'इस महीने' : lang === 'en' ? 'This Month' : 'આ મહિનો'}
          </button>
          <button
            onClick={() => setTimeframe('week')}
            className={`flex-1 py-1.5 rounded-xl transition ${
              timeframe === 'week'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {lang === 'hi' ? 'इस सप्ताह' : lang === 'en' ? 'This Week' : 'આ અઠવાડિયું'}
          </button>
        </div>
      </div>

      {/* 1. Primary Income vs Expense Comparison Card */}
      <div className="bg-gradient-to-br from-white to-slate-50/80 rounded-3xl p-4.5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
              <BarChart3 size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                {lang === 'hi' ? 'आय बनाम खर्च चार्ट' : lang === 'en' ? 'Income vs Expense' : 'આવક vs ખર્ચ વિશ્લેષણ'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {lang === 'hi' ? 'बचत दर' : lang === 'en' ? 'Savings Rate' : 'ચોખ્ખો બચત દર'}:{' '}
                <span className={savingsRate >= 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                  {savingsRate}%
                </span>
              </p>
            </div>
          </div>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-extrabold ${
              netSavings >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}
          >
            {netSavings >= 0 ? '+' : ''}₹{netSavings.toLocaleString()}
          </span>
        </div>

        {/* Visual Dual Bars */}
        <div className="space-y-2 pt-1">
          {/* Income Bar */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="flex items-center gap-1 text-emerald-700">
                <TrendingUp size={13} />
                {lang === 'hi' ? 'कुल आय' : lang === 'en' ? 'Total Income' : 'કુલ આવક'}
              </span>
              <span className="font-bold text-slate-800">₹{totalIncome.toLocaleString()}</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(100, totalIncome > 0 ? (totalIncome / (totalIncome + totalExpense || 1)) * 100 : 0)}%`,
                }}
              />
            </div>
          </div>

          {/* Expense Bar */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="flex items-center gap-1 text-rose-700">
                <TrendingDown size={13} />
                {lang === 'hi' ? 'कुल खर्च' : lang === 'en' ? 'Total Expense' : 'કુલ ખર્ચ'}
              </span>
              <span className="font-bold text-slate-800">₹{totalExpense.toLocaleString()}</span>
            </div>
            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
              <div
                className="bg-rose-500 h-full rounded-full transition-all duration-700"
                style={{
                  width: `${Math.min(100, totalExpense > 0 ? (totalExpense / (totalIncome + totalExpense || 1)) * 100 : 0)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Expense Category SVG Donut Chart */}
      <div className="bg-white rounded-3xl p-4.5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <PieChart size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                {lang === 'hi' ? 'खर्च श्रेणी चार्ट' : lang === 'en' ? 'Expense Category Donut' : 'ખર્ચ કેટેગરી ચાર્ટ (Donut)'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {lang === 'hi' ? 'कहाँ कितना खर्च हुआ' : lang === 'en' ? 'Where money was spent' : 'ક્યાં કેટલો ખર્ચ થયો'}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-700">
            {categoryList.length} {lang === 'hi' ? 'श्रेणियां' : lang === 'en' ? 'Categories' : 'કેટેગરી'}
          </span>
        </div>

        {totalExpense === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs font-medium">
            {lang === 'hi' ? 'इस अवधि में कोई खर्च नहीं' : lang === 'en' ? 'No expenses in this period' : 'આ સમયગાળામાં કોઈ ખર્ચ નોંધાયેલ નથી'}
          </div>
        ) : (
          <div className="space-y-4">
            {/* SVG Donut Graphic */}
            <div className="flex items-center justify-center relative py-2">
              <svg width="180" height="180" viewBox="0 0 180 180" className="rotate-[-90deg]">
                {/* Background Ring */}
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  fill="transparent"
                  stroke="#f1f5f9"
                  strokeWidth="20"
                />
                {/* Donut Slices */}
                {donutSlices.map((slice, index) => (
                  <circle
                    key={index}
                    cx="90"
                    cy="90"
                    r={radius}
                    fill="transparent"
                    stroke={slice.color.hex}
                    strokeWidth={selectedCategory === slice.category ? '24' : '20'}
                    strokeDasharray={slice.strokeDasharray}
                    strokeDashoffset={slice.strokeDashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-500 cursor-pointer hover:opacity-90"
                    onClick={() =>
                      setSelectedCategory(selectedCategory === slice.category ? null : slice.category)
                    }
                  />
                ))}
              </svg>

              {/* Center Total Card */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">
                  {lang === 'hi' ? 'कुल खर्च' : lang === 'en' ? 'Total' : 'કુલ ખર્ચ'}
                </span>
                <span className="text-base font-black text-slate-800 leading-tight">
                  ₹{totalExpense.toLocaleString()}
                </span>
                <span className="text-[9px] text-slate-500 font-semibold mt-0.5">
                  100%
                </span>
              </div>
            </div>

            {/* Category Breakdown Progress Bars & Legend */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              {categoryList.map((item, index) => (
                <div
                  key={index}
                  onClick={() =>
                    setSelectedCategory(selectedCategory === item.category ? null : item.category)
                  }
                  className={`p-2.5 rounded-2xl border transition cursor-pointer ${
                    selectedCategory === item.category
                      ? 'border-blue-400 bg-blue-50/40 shadow-xs'
                      : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: item.color.hex }}
                      />
                      <span className="font-bold text-slate-700 truncate max-w-[160px]">
                        {item.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-800">
                        ₹{item.amount.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                  {/* Mini Progress */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.color.hex,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. Liquid Wealth Split (Bank Balance vs Cash in Hand) */}
      <div className="bg-white rounded-3xl p-4.5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-100 text-cyan-700">
              <Wallet size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                {lang === 'hi' ? 'बैंक बनाम कैश वितरण' : lang === 'en' ? 'Bank vs Cash Split' : 'બેંક vs રોકડ ભંડોળ વિભાજન'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {lang === 'hi' ? 'कुल उपलब्ध धनराशि' : lang === 'en' ? 'Total Liquid Wealth' : 'કુલ ઉપલબ્ધ ભંડોળ'}:{' '}
                <span className="font-bold text-slate-800">₹{totalLiquid.toLocaleString()}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Dual Split Visual Bar */}
        <div className="w-full bg-slate-100 h-4 rounded-xl overflow-hidden flex shadow-inner">
          <div
            className="bg-blue-600 h-full transition-all duration-700 flex items-center justify-center text-[9px] text-white font-bold"
            style={{ width: `${bankPct}%` }}
            title={`Bank: ${bankPct}%`}
          >
            {bankPct > 15 ? `${bankPct}%` : ''}
          </div>
          <div
            className="bg-emerald-500 h-full transition-all duration-700 flex items-center justify-center text-[9px] text-white font-bold"
            style={{ width: `${cashPct}%` }}
            title={`Cash: ${cashPct}%`}
          >
            {cashPct > 15 ? `${cashPct}%` : ''}
          </div>
        </div>

        {/* Legend Cards */}
        <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
          <div className="p-2.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/50 border border-blue-200/80 dark:border-blue-800/60 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Building2 size={15} className="text-blue-600 dark:text-blue-400" />
              <span className="font-bold text-blue-900 dark:text-blue-200">{t('bank_balance', lang)}</span>
            </div>
            <span className="font-black text-blue-800 dark:text-blue-300">₹{bankBalance.toLocaleString()}</span>
          </div>

          <div className="p-2.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">💵</span>
              <span className="font-bold text-emerald-900 dark:text-emerald-200">{t('cash_balance', lang)}</span>
            </div>
            <span className="font-black text-emerald-800 dark:text-emerald-300">₹{cashBalance.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* 4. Khata Book Lena vs Dena Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4.5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
              <Users size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {lang === 'hi' ? 'खाताबही अनुपात (लेना बनाम देना)' : lang === 'en' ? 'Khata Receivables vs Payables' : 'ખાતાવહી લેતી-દેતી ચાર્ટ'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {lang === 'hi' ? 'उधारी और बाकी रकम' : lang === 'en' ? 'Receivable vs Payable volume' : 'લેવાના vs આપવાના પ્રમાણ'}
              </p>
            </div>
          </div>
        </div>

        {totalKhataVolume === 0 ? (
          <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs font-medium">
            {lang === 'hi' ? 'खाताबही में कोई बाकी रकम नहीं' : lang === 'en' ? 'No pending khata records' : 'કોઈ બાકી લેતી-દેતી નોંધાયેલ નથી'}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-3.5 rounded-xl overflow-hidden flex shadow-inner">
              <div
                className="bg-emerald-500 h-full transition-all duration-700"
                style={{ width: `${receivePct}%` }}
                title={`To Receive: ${receivePct}%`}
              />
              <div
                className="bg-rose-500 h-full transition-all duration-700"
                style={{ width: `${payPct}%` }}
                title={`To Pay: ${payPct}%`}
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-300 font-bold block">{t('my_receivables', lang)}</span>
                  <span className="text-xs font-black text-emerald-800 dark:text-emerald-200">₹{totalToReceive.toLocaleString()}</span>
                </div>
                <span className="text-[10px] font-bold bg-white dark:bg-emerald-900/90 text-emerald-800 dark:text-emerald-200 px-1.5 py-0.5 rounded-md shadow-2xs border border-emerald-200 dark:border-emerald-700">
                  {receivePct}%
                </span>
              </div>

              <div className="p-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-rose-700 dark:text-rose-300 font-bold block">{t('my_payables', lang)}</span>
                  <span className="text-xs font-black text-rose-800 dark:text-rose-200">₹{totalToPay.toLocaleString()}</span>
                </div>
                <span className="text-[10px] font-bold bg-white dark:bg-rose-900/90 text-rose-800 dark:text-rose-200 px-1.5 py-0.5 rounded-md shadow-2xs border border-rose-200 dark:border-rose-700">
                  {payPct}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. 7-Day Day-of-Week Expense Bar Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4.5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300">
              <Calendar size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                {lang === 'hi' ? 'साप्ताहिक खर्च ट्रेंड (दिन अनुसार)' : lang === 'en' ? 'Day of Week Expense Trend' : 'વાર મુજબ ખર્ચ વિશ્લેષણ ગ્રાફ'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {lang === 'hi' ? 'सप्ताह के किस दिन सबसे ज्यादा खर्च हुआ' : lang === 'en' ? 'Peak expense days of the week' : 'કયા વારે સૌથી વધુ ખર્ચ થયો'}
              </p>
            </div>
          </div>
        </div>

        {/* 7 Vertical Bar Columns */}
        <div className="grid grid-cols-7 gap-1.5 pt-4 pb-2 items-end h-36 border-b border-slate-100 dark:border-slate-800">
          {weekdayTotals.map((amount, idx) => {
            const heightPct = Math.max(10, Math.round((amount / maxWeekdayAmount) * 100));
            const isHighest = amount === maxWeekdayAmount && amount > 0;
            return (
              <div key={idx} className="flex flex-col items-center justify-end h-full gap-1">
                <span className={`text-[9px] font-bold truncate ${
                  amount > 0
                    ? isHighest
                      ? 'text-amber-600 dark:text-amber-300 font-black'
                      : 'text-slate-600 dark:text-slate-300'
                    : 'text-transparent'
                }`}>
                  {amount > 0 ? `₹${amount > 999 ? `${Math.round(amount / 1000)}k` : amount}` : '0'}
                </span>
                <div
                  className={`w-full max-w-[24px] rounded-t-lg transition-all duration-500 ${
                    isHighest
                      ? 'bg-gradient-to-t from-rose-500 via-amber-500 to-yellow-400 shadow-md shadow-amber-500/20 ring-1 ring-amber-300/50'
                      : amount > 0
                      ? 'bg-gradient-to-t from-blue-600 to-cyan-400 dark:from-blue-500 dark:to-cyan-300 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50'
                  }`}
                  style={{ height: `${heightPct}%` }}
                  title={`${activeDayNames[idx]}: ₹${amount}`}
                />
                <span
                  className={`text-[10px] font-bold ${
                    isHighest
                      ? 'text-rose-600 dark:text-amber-300 font-extrabold'
                      : amount > 0
                      ? 'text-blue-600 dark:text-blue-300 font-bold'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {activeDayNames[idx]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
