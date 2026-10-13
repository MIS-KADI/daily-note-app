import React, { useState } from 'react';
import {
  X,
  Delete,
  PlusCircle,
  MinusCircle,
  Copy,
  Check,
  Percent,
  CheckCircle2,
  ArrowLeft,
  IndianRupee,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { t } from '../services/i18n';
import { audioService } from '../services/audioService';

export default function CalculatorModal({
  isOpen,
  onClose,
  onTransferAmount,
  lang = 'gu',
}) {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [copied, setCopied] = useState(false);

  // Quick Save Drawer State
  const [isSavingEntry, setIsSavingEntry] = useState(false);
  const [saveType, setSaveType] = useState('expense'); // 'expense' | 'income'
  const [saveAmount, setSaveAmount] = useState(0);
  const [savePaymentMode, setSavePaymentMode] = useState('રોકડ (Cash)');
  const [saveCategory, setSaveCategory] = useState('કરિયાણું / ઘરખર્ચ');
  const [saveDescription, setSaveDescription] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  if (!isOpen) return null;

  // Safe arithmetic evaluator
  const evaluateMath = (expr) => {
    try {
      if (!expr || !expr.trim()) return 0;
      // Replace × and ÷
      let sanitized = expr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/[^\d\s+\-*/.%]/g, '');

      // Handle simple percentage e.g. "1000 - 10%" -> "1000 - (1000 * 0.1)"
      sanitized = sanitized.replace(/(\d+(?:\.\d+)?)\s*([+\-])\s*(\d+(?:\.\d+)?)\s*%/g, (match, base, op, pct) => {
        const pctVal = (parseFloat(base) * parseFloat(pct)) / 100;
        return `${base} ${op} ${pctVal}`;
      });

      // Standalone percentage e.g. "50%" -> "0.5"
      sanitized = sanitized.replace(/(\d+(?:\.\d+)?)\s*%/g, (match, num) => {
        return String(parseFloat(num) / 100);
      });

      // eslint-disable-next-line no-eval
      const result = Function(`'use strict'; return (${sanitized})`)();
      if (typeof result !== 'number' || isNaN(result) || !isFinite(result)) {
        return 'Error';
      }
      return Math.round((result + Number.EPSILON) * 100) / 100;
    } catch {
      return 'Error';
    }
  };

  const handleNumber = (n) => {
    if (saveSuccessMsg) setSaveSuccessMsg('');
    if (display === '0' || display === 'Error') {
      setDisplay(n);
    } else {
      setDisplay(display + n);
    }
  };

  const handleOperator = (op) => {
    if (saveSuccessMsg) setSaveSuccessMsg('');
    if (display === 'Error') return;

    // Chaining operations: If equation already has pending expression (e.g. "100 + ")
    if (equation && /[\s+\-*/]$/.test(equation.trim())) {
      const currentFull = equation + display;
      const intermediate = evaluateMath(currentFull);
      if (intermediate !== 'Error') {
        setEquation(intermediate + ' ' + op + ' ');
        setDisplay('0');
        return;
      }
    }

    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const handlePercentage = () => {
    if (saveSuccessMsg) setSaveSuccessMsg('');
    const val = parseFloat(display);
    if (!isNaN(val)) {
      if (equation && (equation.includes('+') || equation.includes('-'))) {
        // Find the base number from equation
        const baseMatch = equation.match(/(\d+(?:\.\d+)?)/);
        if (baseMatch) {
          const baseNum = parseFloat(baseMatch[1]);
          const pctVal = Math.round(((baseNum * val) / 100 + Number.EPSILON) * 100) / 100;
          setDisplay(String(pctVal));
          return;
        }
      }
      const simplePct = Math.round((val / 100 + Number.EPSILON) * 100) / 100;
      setDisplay(String(simplePct));
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
    setSaveSuccessMsg('');
  };

  const handleBackspace = () => {
    if (saveSuccessMsg) setSaveSuccessMsg('');
    if (display.length > 1 && display !== 'Error') {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleCalculate = () => {
    if (saveSuccessMsg) setSaveSuccessMsg('');
    const fullExpression = equation + display;
    const res = evaluateMath(fullExpression);
    if (res === 'Error') {
      setDisplay('Error');
    } else {
      setEquation(fullExpression + ' =');
      setDisplay(String(res));
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(display);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  // Open the Quick Save form for the calculated amount
  const handleStartSave = (type) => {
    let finalAmount = parseFloat(display);

    // If an unfinished equation is in progress (e.g. "1000 + 500"), evaluate it first!
    if (equation && !equation.includes('=')) {
      const evaluated = evaluateMath(equation + display);
      if (evaluated !== 'Error' && evaluated > 0) {
        finalAmount = evaluated;
        setEquation((equation + display) + ' =');
        setDisplay(String(evaluated));
      }
    }

    if (isNaN(finalAmount) || finalAmount <= 0) {
      alert(lang === 'gu' ? 'કૃપા કરીને માન્ય રકમ ગણો.' : 'Please calculate a valid amount.');
      return;
    }

    setSaveType(type);
    setSaveAmount(finalAmount);
    setSavePaymentMode('રોકડ (Cash)');
    setSaveCategory(type === 'expense' ? 'કરિયાણું / ઘરખર્ચ' : 'પગાર / આવક');
    setSaveDescription(type === 'expense' ? 'દૈનિક ખર્ચ' : 'આવક');
    setIsSavingEntry(true);
    setSaveSuccessMsg('');
  };

  // Confirm and save into Finance tab
  const handleConfirmSave = (e) => {
    e.preventDefault();
    if (saveAmount <= 0) return;

    if (typeof onTransferAmount === 'function') {
      onTransferAmount({
        amount: saveAmount,
        type: saveType,
        paymentMode: savePaymentMode,
        category: saveCategory,
        description: saveDescription.trim() || (saveType === 'expense' ? 'કેલ્ક્યુલેટર ખર્ચ' : 'કેલ્ક્યુલેટર આવક'),
        date: new Date().toISOString().split('T')[0],
      });
    }

    try {
      if (audioService?.playChime) audioService.playChime();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch {}

    const successText =
      lang === 'gu'
        ? `₹${saveAmount.toLocaleString()} ${saveType === 'expense' ? 'ખર્ચમાં' : 'આવકમાં'} (${savePaymentMode}) સફળતાપૂર્વક સાચવી લીધું!`
        : `₹${saveAmount.toLocaleString()} saved to ${saveType}!`;

    setSaveSuccessMsg(successText);
    setIsSavingEntry(false);
    setEquation('');
    setDisplay('0');
  };

  const expenseCategories = [
    'કરિયાણું / ઘરખર્ચ',
    'પેટ્રોલ / મુસાફરી',
    'દૂધ અને ચા-નાસ્તો',
    'શાકભાજી / ફળફળાદિ',
    'દવાઓ / હેલ્થ',
    'મોબાઈલ / રિચાર્જ',
    'અન્ય ખર્ચ',
  ];

  const incomeCategories = [
    'પગાર / આવક',
    'વેપાર / ધંધો',
    'વ્યાજ / રિટર્ન',
    'ભાડું',
    'અન્ય આવક',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 select-none">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in slide-in-from-bottom duration-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧮</span>
            <div>
              <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                <span>{t('smart_calc_title', lang)}</span>
                <span className="text-[10px] bg-blue-500/30 text-blue-300 px-1.5 py-0.2 rounded-full font-bold">
                  {lang === 'gu' ? 'ઑટો હિસાબ' : 'Smart'}
                </span>
              </h3>
              <p className="text-[10px] text-slate-400">
                {lang === 'gu'
                  ? 'ગણતરી કરો અને સીધા રોકડ/UPI હિસાબમાં સેવ કરો'
                  : t('calc_sub', lang)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        {/* Success Banner if entry was just saved */}
        {saveSuccessMsg && (
          <div className="bg-emerald-600 text-white px-4 py-2 text-xs font-bold flex items-center justify-between gap-2 shadow-inner animate-in fade-in">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-200 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
            <button
              onClick={() => setSaveSuccessMsg('')}
              className="p-0.5 hover:bg-emerald-700 rounded-md"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* MODE 1: Interactive Quick Save Entry Drawer */}
        {isSavingEntry ? (
          <div className="p-4 bg-slate-50 flex-1 overflow-y-auto space-y-3.5 animate-in fade-in">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsSavingEntry(false)}
                className="flex items-center gap-1 text-xs text-indigo-600 font-bold hover:underline active:scale-95"
              >
                <ArrowLeft size={14} />
                <span>{lang === 'gu' ? 'પાછા કેલ્ક્યુલેટરમાં જાઓ' : 'Back to Calculator'}</span>
              </button>
              <span
                className={`text-[11px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                  saveType === 'expense'
                    ? 'bg-rose-100 text-rose-700 border border-rose-300'
                    : 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                }`}
              >
                {saveType === 'expense'
                  ? (lang === 'gu' ? '💸 ખર્ચ એન્ટ્રી' : 'Expense')
                  : (lang === 'gu' ? '💰 આવક એન્ટ્રી' : 'Income')}
              </span>
            </div>

            {/* Prominent Amount Display */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 text-center shadow-xs">
              <span className="text-[11px] text-slate-500 font-bold block mb-1">
                {lang === 'gu' ? 'ગણેલ કુલ રકમ' : 'Calculated Amount'}
              </span>
              <div className="text-3xl font-black text-slate-900 tracking-tight flex items-center justify-center gap-1">
                <span className="text-2xl text-slate-400">₹</span>
                <span>{saveAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Mode Selector: Cash vs UPI vs Bank */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 flex items-center justify-between">
                <span>{lang === 'gu' ? 'ચુકવણી મોડ (Payment Mode):' : 'Payment Mode:'}</span>
                <span className="text-[11px] text-emerald-600 font-black">{savePaymentMode}</span>
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'રોકડ (Cash)', label: '💵 રોકડ (Cash)' },
                  { id: 'UPI (GPay/PhonePe)', label: '📱 UPI / ઓનલાઇન' },
                  { id: 'બેંક ટ્રાન્સફર (NEFT/IMPS)', label: '🏦 બેંક ટ્રાન્સફર' },
                ].map((pm) => (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setSavePaymentMode(pm.id)}
                    className={`py-2 px-1 rounded-xl text-xs font-bold border transition active:scale-95 text-center ${
                      savePaymentMode === pm.id
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {pm.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Quick Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-extrabold text-slate-700 block">
                {lang === 'gu' ? 'કેટેગરી પસંદ કરો:' : 'Select Category:'}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(saveType === 'expense' ? expenseCategories : incomeCategories).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSaveCategory(cat)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border font-bold transition active:scale-95 ${
                      saveCategory === cat
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Description / Note */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 block">
                {lang === 'gu' ? 'વિગત / નોંધ (Note - ઐચ્છિક):' : 'Note (Optional):'}
              </label>
              <input
                type="text"
                value={saveDescription}
                onChange={(e) => setSaveDescription(e.target.value)}
                placeholder={lang === 'gu' ? 'દા.ત. ૨૦૦૦ નું પેટ્રોલ, કરિયાણું...' : 'e.g. Petrol, groceries...'}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Action Buttons: Save vs Cancel */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={handleConfirmSave}
                className="py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/30 active:scale-95 transition flex items-center justify-center gap-1.5"
              >
                <CheckCircle2 size={16} />
                <span>{lang === 'gu' ? 'હિસાબમાં સેવ કરો' : 'Save to Finance'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSavingEntry(false)}
                className="py-3 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 active:scale-95 transition flex items-center justify-center gap-1"
              >
                <X size={15} />
                <span>{lang === 'gu' ? 'રદ કરો' : 'Cancel'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* MODE 2: Standard Clean Calculator Keypad & Display */
          <>
            {/* Display Screen */}
            <div className="bg-slate-950 p-4 text-right font-mono shrink-0">
              <div className="text-xs text-blue-400 h-5 overflow-hidden tracking-wide">
                {equation || ' '}
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-wider truncate">
                {display}
              </div>
            </div>

            {/* Quick Action Transfer Bar: Direct Save to Expense / Income */}
            <div className="grid grid-cols-2 gap-2 p-2.5 bg-slate-100 border-b border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => handleStartSave('expense')}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-300 shadow-xs transition active:scale-95"
              >
                <MinusCircle size={15} className="text-rose-600" />
                <span>{lang === 'gu' ? 'ખર્ચ ઉમેરો (-₹)' : `${t('calc_transfer_expense', lang)} (-₹)`}</span>
              </button>
              <button
                type="button"
                onClick={() => handleStartSave('income')}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-300 shadow-xs transition active:scale-95"
              >
                <PlusCircle size={15} className="text-emerald-600" />
                <span>{lang === 'gu' ? 'આવક ઉમેરો (+₹)' : `${t('calc_transfer_income', lang)} (+₹)`}</span>
              </button>
            </div>

            {/* Keypad Grid */}
            <div className="p-3 grid grid-cols-4 gap-2 bg-slate-50 select-none">
              <button
                type="button"
                onClick={handleClear}
                className="p-3.5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-extrabold text-lg active:scale-95 transition"
              >
                C
              </button>
              <button
                type="button"
                onClick={handlePercentage}
                className="p-3.5 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-extrabold text-lg flex items-center justify-center active:scale-95 transition"
                title="Percentage (%)"
              >
                <Percent size={18} />
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="p-3.5 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center active:scale-95 transition"
                title="Backspace"
              >
                <Delete size={20} />
              </button>
              <button
                type="button"
                onClick={() => handleOperator('/')}
                className="p-3.5 rounded-2xl bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold text-xl active:scale-95 transition"
              >
                ÷
              </button>

              {/* Row 2 */}
              {['7', '8', '9'].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleNumber(n)}
                  className="p-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xl shadow-xs border border-slate-200 active:scale-95 transition"
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleOperator('*')}
                className="p-3.5 rounded-2xl bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold text-xl active:scale-95 transition"
              >
                ×
              </button>

              {/* Row 3 */}
              {['4', '5', '6'].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleNumber(n)}
                  className="p-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xl shadow-xs border border-slate-200 active:scale-95 transition"
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleOperator('-')}
                className="p-3.5 rounded-2xl bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold text-xl active:scale-95 transition"
              >
                −
              </button>

              {/* Row 4 */}
              {['1', '2', '3'].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleNumber(n)}
                  className="p-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xl shadow-xs border border-slate-200 active:scale-95 transition"
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleOperator('+')}
                className="p-3.5 rounded-2xl bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold text-xl active:scale-95 transition"
              >
                +
              </button>

              {/* Row 5 */}
              <button
                type="button"
                onClick={() => handleNumber('00')}
                className="p-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-lg shadow-xs border border-slate-200 active:scale-95 transition"
              >
                00
              </button>
              <button
                type="button"
                onClick={() => handleNumber('0')}
                className="p-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xl shadow-xs border border-slate-200 active:scale-95 transition"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => handleNumber('.')}
                className="p-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xl shadow-xs border border-slate-200 active:scale-95 transition"
              >
                .
              </button>
              <button
                type="button"
                onClick={handleCalculate}
                className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-2xl shadow-md active:scale-95 transition flex items-center justify-center"
              >
                =
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
