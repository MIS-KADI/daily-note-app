import React, { useState } from 'react';
import {
  FileText,
  Download,
  Calendar,
  CheckCircle2,
  FileSpreadsheet,
  ShieldCheck,
  Award,
  HeartPulse,
  Printer,
  Building2,
  Banknote,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  Check,
  Share2,
  ExternalLink,
  Eye,
  X,
  Bell,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateMonthlyReportPDF, buildReportHtml } from '../../services/pdfReportService';
import {
  downloadOrSharePDF,
  downloadOrShareCSV,
  directOpenFile,
} from '../../services/fileDownloadService';
import { t } from '../../services/i18n';

export default function ReportsTab({
  user,
  notes = [],
  reminders = [],
  events = [],
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
  const [selectedCategory, setSelectedCategory] = useState('all'); // 'all', 'finance', 'health', 'reminders', 'notes'
  const [downloading, setDownloading] = useState(false);
  const [usePdfPassword, setUsePdfPassword] = useState(false);
  const [pdfPassword, setPdfPassword] = useState('');
  const [readyFile, setReadyFile] = useState(null);

  // Month options for selector
  const monthOptions = [
    'September 2026',
    'August 2026',
    'July 2026',
    'June 2026',
  ];

  // Specific report categories
  const reportCategories = [
    { id: 'all', label: t('report_type_all', lang), icon: '📊' },
    { id: 'finance', label: t('report_type_finance', lang), icon: '💰' },
    { id: 'health', label: t('report_type_health', lang), icon: '🩺' },
    { id: 'reminders', label: t('report_type_reminders', lang), icon: '⏰' },
    { id: 'notes', label: t('report_type_notes', lang), icon: '📝' },
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

  // Handler for High-Resolution Unicode PDF download with mobile support and notification
  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const pdfResult = await generateMonthlyReportPDF({
        user,
        monthYear: selectedMonth,
        financeList: finance,
        accounts,
        khata,
        medicineList: medicines,
        reminderList: reminders,
        notesList: notes,
        events,
        fitness,
        reportCategory: selectedCategory,
        pdfPassword: usePdfPassword ? pdfPassword : '',
        lang,
      });

      const result = await downloadOrSharePDF({
        pdfBlob: pdfResult.blob,
        filename: pdfResult.filename,
        title: `${t('reports_title', lang)} - ${selectedMonth}`,
        lang,
        autoShare: true,
      });

      setReadyFile(result);

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
      events,
      fitness,
      reportCategory: selectedCategory,
      lang,
    });

    const printWin = window.open('', '_blank', 'width=840,height=900');
    if (!printWin) {
      alert(
        lang === 'gu'
          ? 'કૃપા કરીને બ્રાઉઝરમાં પોપ-અપની પરવાનગી આપો.'
          : lang === 'hi'
          ? 'कृपया ब्राउज़र में पॉप-अप की अनुमति दें।'
          : 'Please allow pop-ups in your browser.'
      );
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

  // Handler for CSV / Excel Export with Unicode UTF-8 BOM, mobile support and notification
  const handleDownloadCSV = async () => {
    setDownloading(true);
    try {
      const headers = ['Date', 'Type', 'Category', 'Description', 'PaymentMode', 'Amount'];
      const rows = finance.map((f) => [
        f.date,
        f.type,
        `"${f.category}"`,
        `"${(f.description || '').replace(/"/g, '""')}"`,
        `"${(f.paymentMode || '').replace(/"/g, '""')}"`,
        f.amount,
      ]);

      const csvString = [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
      const filename = `Finance_Report_${selectedMonth.replace(/\s+/g, '_')}.csv`;

      const result = await downloadOrShareCSV({
        filename,
        csvString,
        title: `${t('finance', lang)} - ${selectedMonth}`,
        lang,
        autoShare: true,
      });

      setReadyFile(result);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      console.error('CSV export error:', e);
      alert(lang === 'gu' ? 'એક્સેલ / CSV ડાઉનલોડ કરવામાં અડચણ આવી.' : 'Error downloading CSV.');
    } finally {
      setDownloading(false);
    }
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

      {/* Specific Report Type Selector */}
      <div className="bg-white p-3.5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Filter size={14} className="text-blue-600" />
            {t('specific_report_question', lang)}
          </span>
          <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full">
            {t('specific_pdf', lang)}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {reportCategories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`p-2.5 rounded-2xl text-left text-xs font-bold border transition flex items-center justify-between active:scale-98 ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">{cat.icon}</span>
                  <span className="line-clamp-1">{cat.label}</span>
                </div>
                {isSelected && <Check size={16} className="shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Month Selector Bar */}
      <div className="bg-white p-3.5 rounded-3xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-blue-600" />
          <span className="text-xs font-bold text-slate-700">{t('month_period', lang)}</span>
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

      {/* Optional PDF Password Protection Box */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={usePdfPassword}
            onChange={(e) => setUsePdfPassword(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 cursor-pointer"
          />
          <span>{t('password_protect', lang)}</span>
        </label>
        {usePdfPassword && (
          <div className="pt-1 animate-in fade-in">
            <input
              type="password"
              placeholder={lang === 'gu' ? 'PDF ખોલવા માટે પાસવર્ડ દાખલ કરો (દા.ત. 1234)' : 'Enter password to unlock PDF'}
              value={pdfPassword}
              onChange={(e) => setPdfPassword(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-bold focus:outline-blue-500"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              {lang === 'gu'
                ? 'ℹ️ આ PDF ઓપન કરતી વખતે પાસવર્ડ માંગવામાં આવશે.'
                : 'ℹ️ Anyone opening this PDF will be prompted for this password.'}
            </p>
          </div>
        )}
      </div>

      {/* Main Download & Print CTA Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-blue-500/20 active:scale-98 transition disabled:opacity-50"
        >
          <Download size={18} className={downloading ? 'animate-bounce' : ''} />
          <span>{downloading ? t('generating_pdf', lang) : `${t('download_pdf', lang)} (${selectedCategory === 'all' ? t('all_full', lang) : selectedCategory})`}</span>
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
          <span className="text-[10px] text-slate-500 block">{t('bank_balance', lang)}</span>
          <span className="text-xs font-black text-slate-800">₹{bankBal.toLocaleString()}</span>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <Banknote size={16} className="mx-auto text-emerald-600 mb-1" />
          <span className="text-[10px] text-slate-500 block">{t('cash_in_hand', lang)}</span>
          <span className="text-xs font-black text-slate-800">₹{cashBal.toLocaleString()}</span>
        </div>
        <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 shadow-xs">
          <ArrowDownLeft size={16} className="mx-auto text-emerald-600 mb-1" />
          <span className="text-[10px] text-emerald-700 block">{t('my_receivables', lang)}</span>
          <span className="text-xs font-black text-emerald-700">₹{toReceive.toLocaleString()}</span>
        </div>
        <div className="bg-red-50 p-3 rounded-2xl border border-red-200 shadow-xs">
          <ArrowUpRight size={16} className="mx-auto text-red-600 mb-1" />
          <span className="text-[10px] text-red-700 block">{t('my_payables', lang)}</span>
          <span className="text-xs font-black text-red-700">₹{toPay.toLocaleString()}</span>
        </div>
      </div>

      {/* Metrics Summary Grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white p-3.5 rounded-3xl border border-slate-200 shadow-xs text-center">
          <p className="text-[10px] font-semibold text-slate-400 uppercase">{t('total_income', lang)}</p>
          <p className="text-sm font-bold text-emerald-600 mt-1">
            ₹{totalIncome.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-3xl border border-slate-200 shadow-xs text-center">
          <p className="text-[10px] font-semibold text-slate-400 uppercase">{t('total_expense', lang)}</p>
          <p className="text-sm font-bold text-red-600 mt-1">
            ₹{totalExpense.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-3.5 rounded-3xl border border-slate-200 shadow-xs text-center">
          <p className="text-[10px] font-semibold text-slate-400 uppercase">{t('net_balance', lang)}</p>
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
            <span>{t('medicine_score', lang)}</span>
          </div>
          <p className="text-2xl font-bold text-teal-600">{adherenceRate}%</p>
          <p className="text-[10px] text-slate-400">
            {t('medicine_score_sub', lang)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <CheckCircle2 size={16} className="text-indigo-600" />
            <span>{t('tasks_meetings_score', lang)}</span>
          </div>
          <p className="text-2xl font-bold text-indigo-600">
            {completedReminders}/{totalReminders}
          </p>
          <p className="text-[10px] text-slate-400">{t('completed_tasks_count', lang)}</p>
        </div>
      </div>

      {/* Monthly Health & Fitness Summary Card */}
      <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-3xl p-4 border border-teal-200/80 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900">
            <HeartPulse size={16} className="text-teal-600" />
            <span>{t('monthly_fitness_summary', lang)}</span>
          </div>
          <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
            {t('health_report_badge', lang)}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 pt-1 text-center">
          <div className="bg-white/80 rounded-xl p-2 border border-teal-100">
            <span className="text-[9px] text-slate-500 block">{t('steps_today', lang)}</span>
            <span className="text-xs font-bold text-slate-800">{(fitness?.steps || 4250).toLocaleString()}</span>
          </div>
          <div className="bg-white/80 rounded-xl p-2 border border-teal-100">
            <span className="text-[9px] text-slate-500 block">{t('calories_burned', lang)}</span>
            <span className="text-xs font-bold text-orange-600">{fitness?.calories || 220} kcal</span>
          </div>
          <div className="bg-white/80 rounded-xl p-2 border border-teal-100">
            <span className="text-[9px] text-slate-500 block">{t('heart_rate', lang)}</span>
            <span className="text-xs font-bold text-red-600">{fitness?.heartRate || 74} BPM</span>
          </div>
          <div className="bg-white/80 rounded-xl p-2 border border-teal-100">
            <span className="text-[9px] text-slate-500 block">{t('blood_pressure', lang)}</span>
            <span className="text-xs font-bold text-blue-600">
              {fitness?.bloodPressure ? `${fitness.bloodPressure.systolic}/${fitness.bloodPressure.diastolic}` : '120/80'}
            </span>
          </div>
        </div>
      </div>

      {/* Expense Categories Breakdown */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          {t('expense_category_breakdown', lang)}
        </h3>

        {Object.keys(categoryTotals).length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-2">
            {t('no_expense_this_month', lang)}
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
      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
        <ShieldCheck className="text-emerald-600 dark:text-emerald-400 shrink-0" size={18} />
        <span>
          {t('report_encrypted_note', lang)}
        </span>
      </div>

      {/* Ready File Modal: Direct View, Open, and Share Sheet */}
      {readyFile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 rounded-2xl">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {lang === 'gu'
                      ? 'રિપોર્ટ તૈયાર છે!'
                      : lang === 'hi'
                      ? 'रिपोर्ट तैयार है!'
                      : 'Report Ready!'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {readyFile.type === 'pdf' ? 'PDF દસ્તાવેજ' : 'Excel / CSV સ્પ્રેડશીટ'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setReadyFile(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* File Info Card */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex items-center gap-3">
              <div className="p-2.5 bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 rounded-xl shrink-0">
                {readyFile.type === 'pdf' ? <FileText size={22} /> : <FileSpreadsheet size={22} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {readyFile.filename}
                </p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium mt-0.5">
                  <Check size={13} />
                  {lang === 'gu' ? 'ડાઉનલોડ / સેવ થયેલ' : 'Downloaded / Saved'}
                </p>
              </div>
            </div>

            {/* Notification alert status */}
            <div className="flex items-center gap-2 px-3 py-2 bg-blue-50/70 dark:bg-blue-950/40 rounded-xl text-[11px] text-blue-700 dark:text-blue-300 font-medium">
              <Bell size={14} className="shrink-0 text-blue-500" />
              <span>
                {lang === 'gu'
                  ? 'નોટિફિકેશન મોકલાઈ ગયું છે 🔔'
                  : lang === 'hi'
                  ? 'सूचना भेज दी गई है 🔔'
                  : 'Notification sent 🔔'}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              {/* Button 1: Direct Open / View */}
              <button
                type="button"
                onClick={() =>
                  directOpenFile({
                    nativeUri: readyFile.nativeUri,
                    blobUrl: readyFile.blobUrl,
                    blob: readyFile.blob,
                    filename: readyFile.filename,
                    isNative: readyFile.isNative,
                    lang,
                  })
                }
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition cursor-pointer"
              >
                <Eye size={18} />
                <span>
                  {readyFile.type === 'pdf'
                    ? lang === 'gu'
                      ? 'ડાયરેક્ટ PDF ખોલો / જુઓ'
                      : lang === 'hi'
                      ? 'सीधे PDF खोलें / देखें'
                      : 'Direct Open / View PDF'
                    : lang === 'gu'
                    ? 'ડાયરેક્ટ એક્સેલ ખોલો / જુઓ'
                    : lang === 'hi'
                    ? 'सीधे एक्सेल खोलें / देखें'
                    : 'Direct Open / View Excel'}
                </span>
                <ExternalLink size={15} className="opacity-75" />
              </button>

              {/* Button 2: Share / Open via Mobile App Chooser */}
              <button
                type="button"
                onClick={() => {
                  if (readyFile.type === 'pdf') {
                    downloadOrSharePDF({
                      pdfBlob: readyFile.blob,
                      filename: readyFile.filename,
                      title: readyFile.filename,
                      lang,
                      autoShare: true,
                    });
                  } else {
                    downloadOrShareCSV({
                      filename: readyFile.filename,
                      csvString: readyFile.csvString || '',
                      title: readyFile.filename,
                      lang,
                      autoShare: true,
                    });
                  }
                }}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition cursor-pointer"
              >
                <Share2 size={18} />
                <span>
                  {lang === 'gu'
                    ? 'મોબાઈલમાં ઓપન અથવા શેર કરો'
                    : lang === 'hi'
                    ? 'मोबाइल में खोलें या शेयर करें'
                    : 'Open or Share in Mobile'}
                </span>
              </button>

              {/* Button 3: Download Again */}
              {readyFile.blobUrl && (
                <a
                  href={readyFile.blobUrl}
                  download={readyFile.filename}
                  className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-2xl flex items-center justify-center gap-2 transition text-xs text-center"
                >
                  <Download size={15} />
                  <span>
                    {lang === 'gu'
                      ? 'ફરીથી ડાઉનલોડ કરો'
                      : lang === 'hi'
                      ? 'फिर से डाउनलोड करें'
                      : 'Download Again'}
                  </span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
