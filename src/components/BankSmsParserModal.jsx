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
  Tag,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { extractAmount, normalizeNumerals } from '../services/aiAssistantService';
import { getExpenseCategories, getIncomeCategories } from '../services/i18n';

const SAMPLE_SMS = [
  'BOB 150 DR',
  'Dear SBI User, A/C 1234 debited by Rs 450.00 on 28Sep26 transfer to SWIGGY. Ref No 429384.',
  'HDFC Bank: Rs 15,000.00 credited to A/C ending 5678 on 28-SEP-26 by Salary. Bal: Rs 42,500.',
  'Rs 850.00 paid to HPCL PETROL PUMP via UPI from Bank A/C XX9876 on 28-09-2026.',
  'BOB: A/C 4321 debited for INR 1,200.00 at DMart Supermarket on 28/09/2026.',
];

export default function BankSmsParserModal({
  isOpen,
  onClose,
  onAddFinance,
  onAddTransaction,
  lang = 'gu',
}) {
  const [smsText, setSmsText] = useState('');
  const [parsed, setParsed] = useState(null);

  if (!isOpen) return null;

  const expenseCategories = getExpenseCategories(lang);
  const incomeCategories = getIncomeCategories(lang);

  const extractSmsAmount = (text = '') => {
    if (!text) return 0;
    const clean = normalizeNumerals(text);

    // 1. Try standard AI extractor
    const stdAmount = extractAmount(clean);
    if (stdAmount && stdAmount > 0) return stdAmount;

    // 2. Typical short bank formats: "150 DR", "150.00 CR", "150 debit", "150 credit"
    const drCrMatch = clean.match(/\b(\d+(?:\.\d+)?)\s*(?:dr|cr|debit|credit)\b/i);
    if (drCrMatch) {
      const val = parseFloat(drCrMatch[1]);
      if (!isNaN(val) && val > 0) return val;
    }

    // 3. Prefix bank formats: "dr 150", "debited 150", "paid 150", "amt 150", "for 150"
    const prefixMatch = clean.match(/\b(?:dr|cr|debited|credited|debit|credit|paid|for|by|amt|amount|inr|rs|₹)\s*:?\s*(\d+(?:\.\d+)?)\b/i);
    if (prefixMatch) {
      const val = parseFloat(prefixMatch[1]);
      if (!isNaN(val) && val > 0) return val;
    }

    // 4. Any freestanding number (ignoring current 4-digit years)
    const allNums = clean.match(/\b\d+(?:\.\d+)?\b/g);
    if (allNums && allNums.length > 0) {
      const candidate = allNums.find((n) => {
        const num = parseFloat(n);
        return num > 0 && num !== 2025 && num !== 2026 && num !== 2027;
      });
      if (candidate) return parseFloat(candidate);
    }

    return 0;
  };

  const parseBankSms = (text) => {
    if (!text || !text.trim()) {
      setParsed(null);
      return;
    }

    const t = text.toLowerCase();
    const amount = extractSmsAmount(text);

    // Detect Type
    const isCredited =
      t.includes('credited') ||
      t.includes('deposited') ||
      t.includes('received') ||
      t.includes('જમા') ||
      t.includes('जमा') ||
      t.includes('cr') ||
      t.includes('credit');
    const type = isCredited ? 'income' : 'expense';

    // Detect Bank
    let bank = lang === 'hi' ? 'बैंक' : lang === 'en' ? 'Bank' : 'બેંક';
    if (t.includes('sbi')) bank = 'State Bank of India (SBI)';
    else if (t.includes('bob') || t.includes('baroda')) bank = 'Bank of Baroda (BOB)';
    else if (t.includes('hdfc')) bank = 'HDFC Bank';
    else if (t.includes('icici')) bank = 'ICICI Bank';
    else if (t.includes('axis')) bank = 'Axis Bank';
    else if (t.includes('paytm')) bank = 'Paytm Payments Bank';
    else if (t.includes('kotak')) bank = 'Kotak Mahindra Bank';
    else if (t.includes('pnb')) bank = 'Punjab National Bank';

    // Detect Merchant / Party
    let merchant = '';
    const transferMatch = text.match(/(?:to|at|by|for)\s+([A-Za-z0-9\s&._-]+?)(?:\s+on|\.|\s+ref|\s+via|\s+bal|$)/i);
    if (transferMatch && transferMatch[1] && transferMatch[1].trim().length > 1) {
      merchant = transferMatch[1].trim();
    } else {
      merchant = isCredited
        ? (lang === 'hi' ? 'वेतन / आय' : lang === 'en' ? 'Salary / Income' : 'પગાર / આવક')
        : (lang === 'hi' ? 'ऑनलाइन भुगतान / खर्च' : lang === 'en' ? 'Online Payment / Expense' : 'ઓનલાઇન પેમેન્ટ / ખર્ચ');
    }

    // Detect Category
    let category = isCredited ? incomeCategories[0] : expenseCategories[0];
    const mLower = merchant.toLowerCase() + ' ' + t;
    if (mLower.includes('petrol') || mLower.includes('hpcl') || mLower.includes('bpcl') || mLower.includes('fuel')) {
      category = expenseCategories.find((c) => c.includes('પેટ્રોલ') || c.includes('पेट्रोल') || c.includes('Fuel')) || expenseCategories[0];
    } else if (mLower.includes('swiggy') || mLower.includes('zomato') || mLower.includes('food') || mLower.includes('restaurant')) {
      category = expenseCategories.find((c) => c.includes('ચા-નાસ્તો') || c.includes('चाय') || c.includes('Milk')) || expenseCategories[0];
    } else if (mLower.includes('dmart') || mLower.includes('supermarket') || mLower.includes('grocery') || mLower.includes('store')) {
      category = expenseCategories.find((c) => c.includes('કરિયાણું') || c.includes('किराना') || c.includes('Grocery')) || expenseCategories[0];
    } else if (mLower.includes('medical') || mLower.includes('pharmacy') || mLower.includes('hospital')) {
      category = expenseCategories.find((c) => c.includes('દવાઓ') || c.includes('दवाइयाँ') || c.includes('Medicines')) || expenseCategories[0];
    } else if (mLower.includes('recharge') || mLower.includes('airtel') || mLower.includes('jio') || mLower.includes('electricity') || mLower.includes('bill')) {
      category = expenseCategories.find((c) => c.includes('બિલ') || c.includes('बिल') || c.includes('Bills')) || expenseCategories[0];
    }

    setParsed({
      type,
      amount: amount || 0,
      bank,
      merchant,
      category,
      paymentMode: t.includes('upi')
        ? 'UPI (GPay/PhonePe)'
        : (lang === 'hi' ? 'बैंक ट्रांसफर' : lang === 'en' ? 'Bank Transfer' : 'બેંક ટ્રાન્સફર'),
      date: new Date().toISOString().split('T')[0],
      raw: text,
    });
  };

  const handleApply = () => {
    const fn = onAddFinance || onAddTransaction;
    if (!fn) {
      console.warn('No finance handler attached to BankSmsParserModal');
      return;
    }

    const finalAmount = parseFloat(parsed?.amount);
    if (!finalAmount || isNaN(finalAmount) || finalAmount <= 0) {
      alert(
        lang === 'gu'
          ? 'કૃપા કરીને માન્ય રકમ દાખલ કરો.'
          : lang === 'hi'
          ? 'कृपया मान्य राशि दर्ज करें।'
          : 'Please enter a valid amount.'
      );
      return;
    }

    fn({
      id: 'fin-' + Date.now(),
      type: parsed.type || 'expense',
      amount: finalAmount,
      category: parsed.category || (parsed.type === 'income' ? incomeCategories[0] : expenseCategories[0]),
      description: `${parsed.merchant || (lang === 'hi' ? 'SMS एंट्री' : lang === 'en' ? 'SMS Entry' : 'SMS એન્ટ્રી')} (${parsed.bank || (lang === 'hi' ? 'बैंक' : lang === 'en' ? 'Bank' : 'બેંક')})`.trim(),
      paymentMode: parsed.paymentMode || 'UPI (GPay/PhonePe)',
      date: parsed.date || new Date().toISOString().split('T')[0],
    });

    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    onClose();
    setSmsText('');
    setParsed(null);
  };

  const currentCategories = parsed?.type === 'income' ? incomeCategories : expenseCategories;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-white/20 rounded-xl">
              <MessageSquare size={20} />
            </span>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {lang === 'hi' ? 'SMS से ऑटो-हिसाब' : lang === 'en' ? 'Auto-Expense from SMS' : 'SMS દ્વારા ઓટો-હિસાબ'}
              </h3>
              <p className="text-xs text-blue-100">
                {lang === 'hi' ? 'बैंक का मैसेज पेस्ट करें, ऐप अपने-आप एंट्री करेगा' : lang === 'en' ? 'Paste bank SMS, app will automatically log entry' : 'બેંકનો મેસેજ પેસ્ટ કરો, એપ આપમેળે એન્ટ્રી કરશે'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition active:scale-95 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1">
          {/* Sample Chips */}
          <div>
            <span className="text-[11px] text-slate-500 font-semibold block mb-1.5">
              {lang === 'hi' ? 'उदाहरण के लिए क्लिक करें (Sample SMS):' : lang === 'en' ? 'Click to try sample SMS:' : 'ઉદાહરણ માટે ક્લિક કરો (Sample SMS):'}
            </span>
            <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
              {SAMPLE_SMS.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSmsText(sample);
                    parseBankSms(sample);
                  }}
                  className="text-left text-[11px] bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-xl p-2 text-slate-700 transition leading-snug cursor-pointer"
                >
                  "{sample}"
                </button>
              ))}
            </div>
          </div>

          {/* SMS Paste Textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {lang === 'hi' ? 'अपने फोन से बैंक SMS यहाँ पेस्ट करें:' : lang === 'en' ? 'Paste your Bank SMS here:' : 'તમારા ફોનમાંથી બેંક SMS અહીં પેસ્ટ કરો:'}
            </label>
            <textarea
              rows={3}
              value={smsText}
              onChange={(e) => {
                setSmsText(e.target.value);
                parseBankSms(e.target.value);
              }}
              placeholder={lang === 'hi' ? 'उदा. BOB 150 DR या SBI A/C debited by Rs 450...' : lang === 'en' ? 'e.g. BOB 150 DR or Dear SBI user, A/C debited by Rs 450...' : 'દા.ત. BOB 150 DR અથવા Dear SBI user, A/C debited by Rs 450...'}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Parsed Result Preview & Editor */}
          {parsed && (
            <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-2xl p-4 border border-blue-200/80 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-blue-600" />
                  {lang === 'hi' ? 'ऑटो-डिटेक्ट की गई जानकारी:' : lang === 'en' ? 'Auto-detected details:' : 'ઓટો-ડિટેક્ટ થયેલ વિગત:'}
                </span>
                {/* Type Switcher: Debit vs Credit */}
                <button
                  type="button"
                  onClick={() => {
                    const nextType = parsed.type === 'income' ? 'expense' : 'income';
                    const nextCats = nextType === 'income' ? incomeCategories : expenseCategories;
                    setParsed({
                      ...parsed,
                      type: nextType,
                      category: nextCats[0] || parsed.category,
                    });
                  }}
                  className={`inline-flex items-center gap-1 text-[11px] font-bold px-3 py-1 rounded-full shadow-2xs transition active:scale-95 cursor-pointer ${
                    parsed.type === 'income'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}
                  title={lang === 'hi' ? 'क्लिक करके आय/खर्च बदलें' : lang === 'en' ? 'Click to toggle income/expense' : 'ક્લિક કરીને ખર્ચ/આવક બદલો'}
                >
                  {parsed.type === 'income' ? (
                    <>
                      <ArrowDownLeft size={12} /> {lang === 'hi' ? '+ आय (Credit)' : lang === 'en' ? '+ Income (Credit)' : '+ આવક (Credit)'}
                    </>
                  ) : (
                    <>
                      <ArrowUpRight size={12} /> {lang === 'hi' ? '- खर्च (Debit)' : lang === 'en' ? '- Expense (Debit)' : '- ખર્ચ (Debit)'}
                    </>
                  )}
                </button>
              </div>

              {/* Editable Amount and Category */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Editable Amount */}
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">
                    {lang === 'hi' ? 'राशि (Amount) *' : lang === 'en' ? 'Amount *' : 'રકમ (Amount) *'}
                  </label>
                  <div className="flex items-center gap-1">
                    <span className="text-blue-600 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      value={parsed.amount === 0 ? '' : parsed.amount}
                      onChange={(e) =>
                        setParsed({
                          ...parsed,
                          amount: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="0"
                      className="w-full text-base font-black text-slate-800 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 focus:outline-blue-500"
                    />
                  </div>
                </div>

                {/* Editable Category Dropdown */}
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs">
                  <label className="text-[10px] text-slate-500 font-bold block mb-1">
                    {lang === 'hi' ? 'श्रेणी (Category) *' : lang === 'en' ? 'Category *' : 'કેટેગરી (Category) *'}
                  </label>
                  <select
                    value={parsed.category}
                    onChange={(e) =>
                      setParsed({ ...parsed, category: e.target.value })
                    }
                    className="w-full text-xs font-bold text-blue-600 bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-200 focus:outline-blue-500"
                  >
                    {currentCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Editable Party & Bank */}
              <div className="text-xs bg-white p-2.5 rounded-xl border border-slate-200 space-y-2 shadow-2xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 text-[11px] shrink-0 font-medium">
                    {lang === 'hi' ? 'पार्टी / विवरण:' : lang === 'en' ? 'Party / Details:' : 'પાર્ટી / વિગત:'}
                  </span>
                  <input
                    type="text"
                    value={parsed.merchant}
                    onChange={(e) =>
                      setParsed({ ...parsed, merchant: e.target.value })
                    }
                    placeholder={lang === 'hi' ? 'ऑनलाइन भुगतान / खर्च' : lang === 'en' ? 'Online payment / Expense' : 'ઓનલાઇન પેમેન્ટ / ખર્ચ'}
                    className="flex-1 text-xs font-semibold text-slate-800 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 focus:outline-blue-500"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-500 text-[11px] shrink-0 font-medium">
                    {lang === 'hi' ? 'बैंक खाता:' : lang === 'en' ? 'Bank Account:' : 'બેંક એકાઉન્ટ:'}
                  </span>
                  <input
                    type="text"
                    value={parsed.bank}
                    onChange={(e) =>
                      setParsed({ ...parsed, bank: e.target.value })
                    }
                    placeholder="Bank of Baroda / SBI"
                    className="flex-1 text-xs font-semibold text-slate-700 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 focus:outline-blue-500"
                  />
                </div>
              </div>

              {/* Balance Update Notice */}
              <div className="bg-blue-50 text-blue-900 border border-blue-200 rounded-xl p-2.5 text-[11px] font-semibold flex items-center gap-1.5">
                <span className="text-base">💡</span>
                <span>
                  {lang === 'hi'
                    ? `यह एंट्री सेव करने पर बैंक बैलेंस में ₹${Number(parsed.amount || 0).toLocaleString()} ${parsed.type === 'income' ? 'जुड़ेगा (+)' : 'घटेगा (-)'}।`
                    : lang === 'en'
                    ? `Saving this entry will ${parsed.type === 'income' ? 'add (+)' : 'deduct (-)'} ₹${Number(parsed.amount || 0).toLocaleString()} to your bank balance.`
                    : `આ એન્ટ્રી સેવ કરતાં બેંક સિલકમાંથી ₹${Number(parsed.amount || 0).toLocaleString()} ${parsed.type === 'income' ? 'ઉમેરાશે (+)' : 'બાદ થશે (-)'}.`}
                </span>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleApply}
                disabled={!parsed.amount || parsed.amount <= 0}
                className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 active:scale-98 transition disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 size={16} />
                <span>
                  {lang === 'hi'
                    ? `यह एंट्री हिसाब में जोड़ें (₹${Number(parsed.amount || 0).toLocaleString()})`
                    : lang === 'en'
                    ? `Add Entry to Finance (₹${Number(parsed.amount || 0).toLocaleString()})`
                    : `આ એન્ટ્રી હિસાબમાં ઉમેરો (₹${Number(parsed.amount || 0).toLocaleString()})`}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
