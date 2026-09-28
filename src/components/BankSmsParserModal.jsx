import React, { useState } from 'react';
import {
  MessageSquare,
  Sparkles,
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  X,
  CreditCard,
  Building2,
  Copy,
  Plus,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { extractAmount } from '../services/aiAssistantService';

const SAMPLE_SMS = [
  'Dear SBI User, A/C 1234 debited by Rs 450.00 on 28Sep26 transfer to SWIGGY. Ref No 429384.',
  'HDFC Bank: Rs 15,000.00 credited to A/C ending 5678 on 28-SEP-26 by Salary. Bal: Rs 42,500.',
  'Rs 850.00 paid to HPCL PETROL PUMP via UPI from Bank A/C XX9876 on 28-09-2026.',
  'BOB: A/C 4321 debited for INR 1,200.00 at DMart Supermarket on 28/09/2026.',
];

export default function BankSmsParserModal({ isOpen, onClose, onAddFinance, lang = 'gu' }) {
  const [smsText, setSmsText] = useState('');
  const [parsed, setParsed] = useState(null);

  if (!isOpen) return null;

  const parseBankSms = (text) => {
    if (!text || !text.trim()) {
      setParsed(null);
      return;
    }

    const t = text.toLowerCase();
    const amount = extractAmount(text);

    // Detect Type
    const isCredited =
      t.includes('credited') ||
      t.includes('deposited') ||
      t.includes('received') ||
      t.includes('જમા') ||
      t.includes('credit');
    const type = isCredited ? 'income' : 'expense';

    // Detect Bank
    let bank = 'બેંક';
    if (t.includes('sbi')) bank = 'State Bank of India (SBI)';
    else if (t.includes('bob') || t.includes('baroda')) bank = 'Bank of Baroda (BOB)';
    else if (t.includes('hdfc')) bank = 'HDFC Bank';
    else if (t.includes('icici')) bank = 'ICICI Bank';
    else if (t.includes('axis')) bank = 'Axis Bank';
    else if (t.includes('paytm')) bank = 'Paytm Payments Bank';

    // Detect Merchant / Party
    let merchant = '';
    const transferMatch = text.match(/(?:to|at|by|for)\s+([A-Za-z0-9\s&._-]+?)(?:\s+on|\.|\s+ref|\s+via|\s+bal|$)/i);
    if (transferMatch && transferMatch[1] && transferMatch[1].trim().length > 1) {
      merchant = transferMatch[1].trim();
    } else {
      merchant = isCredited ? 'પગાર / આવક' : 'ઓનલાઇન પેમેન્ટ / ખર્ચ';
    }

    // Detect Category
    let category = isCredited ? 'પગાર / આવક' : 'કરિયાણું / ઘરખર્ચ';
    const mLower = merchant.toLowerCase() + ' ' + t;
    if (mLower.includes('petrol') || mLower.includes('hpcl') || mLower.includes('bpcl') || mLower.includes('fuel')) {
      category = 'પેટ્રોલ / મુસાફરી';
    } else if (mLower.includes('swiggy') || mLower.includes('zomato') || mLower.includes('food') || mLower.includes('restaurant')) {
      category = 'દૂધ અને ચા-નાસ્તો';
    } else if (mLower.includes('dmart') || mLower.includes('supermarket') || mLower.includes('grocery') || mLower.includes('store')) {
      category = 'કરિયાણું / ઘરખર્ચ';
    } else if (mLower.includes('medical') || mLower.includes('pharmacy') || mLower.includes('hospital')) {
      category = 'દવાઓ / હેલ્થ';
    } else if (mLower.includes('recharge') || mLower.includes('airtel') || mLower.includes('jio') || mLower.includes('electricity')) {
      category = 'લાઇટ બિલ / રિચાર્જ';
    }

    setParsed({
      type,
      amount: amount || 0,
      bank,
      merchant,
      category,
      paymentMode: t.includes('upi') ? 'UPI (GPay/PhonePe)' : 'બેંક ટ્રાન્સફર',
      date: new Date().toISOString().split('T')[0],
      raw: text,
    });
  };

  const handleApply = () => {
    if (!parsed || !parsed.amount) return;

    onAddFinance?.({
      id: 'f-' + Date.now(),
      type: parsed.type,
      amount: parsed.amount,
      category: parsed.category,
      description: `${parsed.merchant} (${parsed.bank})`,
      paymentMode: parsed.paymentMode,
      date: parsed.date,
    });

    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    onClose();
    setSmsText('');
    setParsed(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-white/20 rounded-xl">
              <MessageSquare size={20} />
            </span>
            <div>
              <h3 className="font-bold text-base leading-tight">SMS દ્વારા ઓટો-હિસાબ</h3>
              <p className="text-xs text-blue-100">બેંકનો મેસેજ પેસ્ટ કરો, એપ આપમેળે એન્ટ્રી કરશે</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1">
          {/* Sample Chips */}
          <div>
            <span className="text-[11px] text-slate-500 font-semibold block mb-1.5">
              ઉદાહરણ માટે ક્લિક કરો (Sample SMS):
            </span>
            <div className="flex flex-col gap-1.5">
              {SAMPLE_SMS.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSmsText(sample);
                    parseBankSms(sample);
                  }}
                  className="text-left text-[11px] bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-xl p-2 text-slate-700 transition leading-snug"
                >
                  "{sample}"
                </button>
              ))}
            </div>
          </div>

          {/* SMS Paste Textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              તમારા ફોનમાંથી બેંક SMS અહીં પેસ્ટ કરો:
            </label>
            <textarea
              rows={3}
              value={smsText}
              onChange={(e) => {
                setSmsText(e.target.value);
                parseBankSms(e.target.value);
              }}
              placeholder="દા.ત. Dear SBI user, A/C debited by Rs 450..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Parsed Result Preview */}
          {parsed && (
            <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-2xl p-4 border border-blue-200/80 space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-blue-600" />
                  ઓટો-ડિટેક્ટ થયેલ વિગત:
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    parsed.type === 'income'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {parsed.type === 'income' ? (
                    <>
                      <ArrowDownLeft size={12} /> + આવક (Credit)
                    </>
                  ) : (
                    <>
                      <ArrowUpRight size={12} /> - ખર્ચ (Debit)
                    </>
                  )}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">રકમ (Amount)</span>
                  <span className="text-base font-black text-slate-800">
                    ₹{parsed.amount.toLocaleString()}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">કેટેગરી (Category)</span>
                  <span className="font-bold text-blue-600 truncate block">
                    {parsed.category}
                  </span>
                </div>
              </div>

              <div className="text-xs bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">પાર્ટી / મર્ચન્ટ:</span>
                  <span className="font-semibold text-slate-800">{parsed.merchant}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">બેંક એકાઉન્ટ:</span>
                  <span className="font-semibold text-slate-700">{parsed.bank}</span>
                </div>
              </div>

              <button
                onClick={handleApply}
                disabled={!parsed.amount}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 active:scale-98 transition disabled:opacity-50"
              >
                <CheckCircle2 size={16} />
                આ એન્ટ્રી હિસાબમાં ઉમેરો
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
