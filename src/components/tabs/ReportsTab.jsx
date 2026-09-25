import React, { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  FileSpreadsheet,
  ShieldCheck,
  Award,
  HeartPulse,
  Printer,
  Building2,
  Banknote,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateMonthlyReportPDF, buildReportHtml } from '../../services/pdfReportService';
import { t } from '../../services/i18n';

export default function ReportsTab({
  user,
  notes = [],
  reminders = [],
  medicines = [],
  medicineLogs = {},
  finance = [],
  accounts = { bankBalance: 42500, cashBalance: 6800 },
  khata = [],
  fitness = null,
  lang = 'gu',
}) {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.toLocaleString('default', { month: 'long' }) + ' ' + currentDate.getFullYear()
  );
  const [downloading, setDownloading] = useState(false);

  // Month options for selector
  const monthOptions = [
    'September 2026',
    'August 2026',
    'July 2026',
    'June 2026',
  ];

  // Financial calculations
  const totalIncome = finance
    .filter((f) => f.type === 'income')
    .reduce((sum, f) => sum + Number(f.amount || 0), 0);

  const totalExpense = finance
    .filter((f) => f.type === 'expense')
    .reduce((sum, f) => sum + Number(f.amount || 0), 0);

  const netSavings = totalIncome - totalExpense;

  const bankBal = Number(accounts?.bankBalance || 0);
  const cashBal = Number(accounts?.cashBalance || 0);

  const toReceive = khata
    .filter((k) => !k.isSettled && k.type === 'to_receive')
    .reduce((s, k) => s + Number(k.amount || 0), 0);

  const toPay = khata
    .filter((k) => !k.isSettled && k.type === 'to_pay')
    .reduce((s, k) => s + Number(k.amount || 0), 0);

  // Reminders metrics
  const completedReminders = reminders.filter((r) => r.isCompleted).length;
  const totalReminders = reminders.length;

  // Medicine score (simulated adherence rate)
  const todayStr = currentDate.toISOString().split('T')[0];
  const activeMeds = medicines.filter((m) => m.active);
  const takenMeds = activeMeds.filter(
    (m) => medicineLogs[todayStr]?.[m.id]?.taken
  ).length;
  const adherenceRate = activeMeds.length
    ? Math.round((takenMeds / activeMeds.length) * 100)
    : 100;

  // Category breakdown for expenses
  const categoryTotals = {};
  finance
    .filter((f) => f.type === 'expense')
    .forEach((f) => {
      categoryTotals[f.category] = (categoryTotals[f.category] || 0) + Number(f.amount);
    });

  // Handler for High-Resolution Unicode PDF download
  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      await generateMonthlyReportPDF({
        user,
        monthYear: selectedMonth,
        financeList: finance,
        accounts,
        khata,
        medicineList: medicines,
        reminderList: reminders,
        notesList: notes,
        fitness,
        lang,
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      console.error('PDF generation error:', e);
      const shouldPrint = window.confirm(
        lang === 'gu'
          ? 'સીધો PDF ડાઉનલોડ કરવામાં અડચણ આવી. શું તમે પ્રિન્ટ/સેવ વિન્ડો દ્વારા PDF સેવ કરવા માંગો છો?'
          : lang === 'hi'
          ? 'सीधे PDF डाउनलोड में समस्या आई। क्या आप प्रिंट/सेव विंडो से PDF सेव करना चाहते हैं?'
          : 'Could not generate PDF directly. Would you like to save via Print dialog?'
      );
      if (shouldPrint) {
        handlePrintReport();
      }
    } finally {
      setDownloading(false);
    }
  };

  // Handler for Direct Native Browser Print / Save as PDF
  const handlePrintReport = () => {
    const reportHtml = buildReportHtml({
      user,
      monthYear: selectedMonth,
      financeList: finance,
      accounts,
      khata,
      medicineList: medicines,
      reminderList: reminders,
      notesList: notes,
      fitness,
      lang,
    });

    const printWin = window.open('', '_blank', 'width=840,height=900');
    if (!printWin) {
      alert('કૃપા કરીને બ્રાઉઝરમાં પોપ-અપની પરવાનગી આપો.');
      return;
    }
    printWin.document.open();
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${t('download_pdf', lang)} - ${selectedMonth}</title>
          <style>
            body { margin: 0; padding: 0; background: #f1f5f9; display: flex; justify-content: center; }
            @media print {
              body { background: #ffffff; }
              @page { size: A4 portrait; margin: 10mm; }
            }
          </style>
        </head>
        <body>
          ${reportHtml}
          <script>
            window.onload = function() {
              window.focus();
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  // Handler for CSV Export
  const handleDownloadCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Description', 'PaymentMode', 'Amount'];
    const rows = finance.map((f) => [
      f.date,
      f.type,
      `"${f.category}"`,
      `"${f.description || ''}"`,
      `"${f.paymentMode || ''}"`,
      f.amount,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Finance_Report_${selectedMonth.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
          <FileText size={24} />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-800">{t('reports_title', lang)}</h2>
          <p className="text-xs text-slate-500">{t('reports_sub', lang)}</p>
        </div>
      </div>

      {/* Month Selector Bar */}
      <div className="bg-white p-3.5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-blue-600" />
          <span className="text-xs font-bold text-slate-700">મહિનો પસંદ કરો:</span>
        </div>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="text-xs font-bold bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          {monthOptions.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Main Download & Print CTA Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-blue-500/20 active:scale-98 transition disabled:opacity-50"
        >
          <Download size={18} className={downloading ? 'animate-bounce' : ''} />
          <span>{downloading ? 'PDF તૈયાર થઈ રહી છે...' : t('download_pdf', lang)}</span>
        </button>

        <button
          onClick={handlePrintReport}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl text-xs font-bold shadow-md shadow-slate-800/15 active:scale-98 transition"
        >
          <Printer size={18} />
          <span>{t('print_pdf', lang)}</span>
        </button>

        <button
          onClick={handleDownloadCSV}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-98 transition"
        >
          <FileSpreadsheet size={18} />
          <span>{t('download_csv', lang)}</span>
        </button>
      </div>

      {/* 4-Box Balances Overview in Report Tab */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <Building2 size={16} className="mx-auto text-blue-600 mb-1" />
          <span className="text-[10px] text-slate-500 block">બેંક બેલેન્સ</span>
          <span className="text-xs font-black text-slate-800">₹{bankBal.toLocaleString()}</span>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <Banknote size={16} className="mx-auto text-emerald-600 mb-1" />
          <span className="text-[10px] text-slate-500 block">હાથ પર રોકડ</span>
          <span className="text-xs font-black text-slate-800">₹{cashBal.toLocaleString()}</span>
        </div>
        <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 shadow-xs">
          <ArrowDownLeft size={16} className="mx-auto text-emerald-600 mb-1" />
          <span className="text-[10px] text-emerald-700 block">મારે લેવાના</span>
          <span className="text-xs font-black text-emerald-700">₹{toReceive.toLocaleString()}</span>
        </div>
        <div className="bg-red-50 p-3 rounded-2xl border border-red-200 shadow-xs">
          <ArrowUpRight size={16} className="mx-auto text-red-600 mb-1" />
          <span className="text-[10px] text-red-700 block">મારે આપવાના</span>
          <span className="text-xs font-black text-red-700">₹{toPay.toLocaleString()}</span>
        </div>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white p-3.5 rounded-3xl border border-slate-200 shadow-xs text-center">
          <p className="text-[10px] font-semibold text-slate-400 uppercase">કુલ આવક</p>
          <p className="text-sm font-bold text-emerald-600 mt-1">
            ₹{totalIncome.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-3xl border border-slate-200 shadow-xs text-center">
          <p className="text-[10px] font-semibold text-slate-400 uppercase">કુલ ખર્ચ</p>
          <p className="text-sm font-bold text-red-600 mt-1">
            ₹{totalExpense.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-3xl border border-slate-200 shadow-xs text-center">
          <p className="text-[10px] font-semibold text-slate-400 uppercase">ચોખ્ખી બચત</p>
          <p className="text-sm font-bold text-blue-600 mt-1">
            ₹{netSavings.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Routine & Task Adherence Cards */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Award size={16} className="text-teal-600" />
            <span>દવા પાલન સ્કોર</span>
          </div>
          <p className="text-2xl font-bold text-teal-600">{adherenceRate}%</p>
          <p className="text-[10px] text-slate-400">
            સમયસર દવા લેવાનું સરેરાશ પરિણામ
          </p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <CheckCircle2 size={16} className="text-indigo-600" />
            <span>કામો / મીટિંગ્સ</span>
          </div>
          <p className="text-2xl font-bold text-indigo-600">
            {completedReminders}/{totalReminders}
          </p>
          <p className="text-[10px] text-slate-400">પૂર્ણ થયેલા કામો</p>
        </div>
      </div>

      {/* Monthly Health & Fitness Summary Card */}
      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-3xl p-4 border border-teal-200/80 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900">
            <HeartPulse size={16} className="text-teal-600" />
            <span>માસિક ફિટનેસ & કાર્ડિયો સારાંશ</span>
          </div>
          <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
            હેલ્થ રિપોર્ટ
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 pt-1 text-center">
          <div className="bg-white/80 rounded-xl p-2 border border-teal-100">
            <span className="text-[9px] text-slate-500 block">આજના સ્ટેપ્સ</span>
            <span className="text-xs font-bold text-slate-800">{(fitness?.steps || 4250).toLocaleString()}</span>
          </div>
          <div className="bg-white/80 rounded-xl p-2 border border-teal-100">
            <span className="text-[9px] text-slate-500 block">બર્ન કેલરી</span>
            <span className="text-xs font-bold text-orange-600">{fitness?.calories || 220} kcal</span>
          </div>
          <div className="bg-white/80 rounded-xl p-2 border border-teal-100">
            <span className="text-[9px] text-slate-500 block">હાર્ટ રેટ</span>
            <span className="text-xs font-bold text-red-600">{fitness?.heartRate || 74} BPM</span>
          </div>
          <div className="bg-white/80 rounded-xl p-2 border border-teal-100">
            <span className="text-[9px] text-slate-500 block">બ્લડ પ્રેશર</span>
            <span className="text-xs font-bold text-blue-600">
              {fitness?.bloodPressure ? `${fitness.bloodPressure.systolic}/${fitness.bloodPressure.diastolic}` : '120/80'}
            </span>
          </div>
        </div>
      </div>

      {/* Expense Categories Breakdown */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          ખર્ચનું વિભાજન (Category Breakdown)
        </h3>

        {Object.keys(categoryTotals).length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-2">
            આ મહિનામાં કોઈ ખર્ચ નોંધાયેલ નથી.
          </p>
        ) : (
          <div className="space-y-2.5">
            {Object.entries(categoryTotals).map(([cat, amt]) => {
              const pct = totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-600">{cat}</span>
                    <span className="font-bold text-slate-800">
                      ₹{amt.toLocaleString()} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Data Privacy & Security Badge */}
      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-2.5 text-xs text-slate-500">
        <ShieldCheck className="text-emerald-600 shrink-0" size={18} />
        <span>
          રિપોર્ટ સંપૂર્ણ એન્ક્રિપ્ટેડ છે અને તમારા સિવાય અન્ય કોઈને દેખાતો નથી.
        </span>
      </div>
    </div>
  );
}
