import React, { useState } from 'react';
import { X, Delete, PlusCircle, MinusCircle, Copy, Check } from 'lucide-react';
import { t } from '../services/i18n';

export default function CalculatorModal({ isOpen, onClose, onTransferAmount, lang = 'gu' }) {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleNumber = (n) => {
    if (display === '0' || display === 'Error') {
      setDisplay(n);
    } else {
      setDisplay(display + n);
    }
  };

  const handleOperator = (op) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handleCalculate = () => {
    try {
      const fullExpression = equation + display;
      // Sanitize input to only numbers and standard arithmetic
      if (!/^[\d\s+\-*/.]+$/.test(fullExpression)) {
        setDisplay('Error');
        return;
      }
      // Safe math calculation
      // eslint-disable-next-line no-eval
      const result = Function(`'use strict'; return (${fullExpression})`)();
      const rounded = Math.round((result + Number.EPSILON) * 100) / 100;
      setEquation(fullExpression + ' =');
      setDisplay(String(rounded));
    } catch {
      setDisplay('Error');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(display);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleUseAmount = (type) => {
    const val = parseFloat(display);
    if (!isNaN(val) && val > 0) {
      onTransferAmount(val, type);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧮</span>
            <div>
              <h3 className="font-semibold text-base leading-tight">{t('smart_calc_title', lang)}</h3>
              <p className="text-xs text-slate-400">{t('calc_sub', lang)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Display Screen */}
        <div className="bg-slate-950 p-5 text-right font-mono">
          <div className="text-xs text-blue-400 h-5 overflow-hidden">{equation || ' '}</div>
          <div className="text-3xl sm:text-4xl font-bold text-white tracking-wider truncate">
            {display}
          </div>
        </div>

        {/* Quick Action Transfer Bar */}
        <div className="grid grid-cols-2 gap-2 p-3 bg-slate-100 border-b border-slate-200">
          <button
            onClick={() => handleUseAmount('expense')}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-xl border border-red-200 transition active:scale-95"
          >
            <MinusCircle size={15} />
            {t('calc_transfer_expense', lang)} (-₹)
          </button>
          <button
            onClick={() => handleUseAmount('income')}
            className="flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-xl border border-emerald-200 transition active:scale-95"
          >
            <PlusCircle size={15} />
            {t('calc_transfer_income', lang)} (+₹)
          </button>
        </div>

        {/* Keypad Grid */}
        <div className="p-4 grid grid-cols-4 gap-2 bg-slate-50">
          <button
            onClick={handleClear}
            className="p-3.5 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-lg active:scale-95 transition"
          >
            C
          </button>
          <button
            onClick={handleBackspace}
            className="p-3.5 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center active:scale-95 transition"
          >
            <Delete size={20} />
          </button>
          <button
            onClick={handleCopy}
            className="p-3.5 rounded-2xl bg-slate-200 hover:bg-slate-300 text-slate-700 flex items-center justify-center active:scale-95 transition"
            title={t('copy', lang)}
          >
            {copied ? <Check size={18} className="text-emerald-600" /> : <Copy size={18} />}
          </button>
          <button
            onClick={() => handleOperator('/')}
            className="p-3.5 rounded-2xl bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold text-xl active:scale-95 transition"
          >
            ÷
          </button>

          {/* Row 2 */}
          {['7', '8', '9'].map((n) => (
            <button
              key={n}
              onClick={() => handleNumber(n)}
              className="p-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xl shadow-xs border border-slate-200 active:scale-95 transition"
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => handleOperator('*')}
            className="p-3.5 rounded-2xl bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold text-xl active:scale-95 transition"
          >
            ×
          </button>

          {/* Row 3 */}
          {['4', '5', '6'].map((n) => (
            <button
              key={n}
              onClick={() => handleNumber(n)}
              className="p-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xl shadow-xs border border-slate-200 active:scale-95 transition"
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => handleOperator('-')}
            className="p-3.5 rounded-2xl bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold text-xl active:scale-95 transition"
          >
            −
          </button>

          {/* Row 4 */}
          {['1', '2', '3'].map((n) => (
            <button
              key={n}
              onClick={() => handleNumber(n)}
              className="p-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xl shadow-xs border border-slate-200 active:scale-95 transition"
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => handleOperator('+')}
            className="p-3.5 rounded-2xl bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold text-xl active:scale-95 transition"
          >
            +
          </button>

          {/* Row 5 */}
          <button
            onClick={() => handleNumber('00')}
            className="p-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-lg shadow-xs border border-slate-200 active:scale-95 transition"
          >
            00
          </button>
          <button
            onClick={() => handleNumber('0')}
            className="p-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xl shadow-xs border border-slate-200 active:scale-95 transition"
          >
            0
          </button>
          <button
            onClick={() => handleNumber('.')}
            className="p-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-xl shadow-xs border border-slate-200 active:scale-95 transition"
          >
            .
          </button>
          <button
            onClick={handleCalculate}
            className="p-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-2xl shadow-md active:scale-95 transition"
          >
            =
          </button>
        </div>
      </div>
    </div>
  );
}
