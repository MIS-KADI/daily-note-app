import React, { useState } from 'react';
import {
  IndianRupee,
  Plus,
  TrendingDown,
  TrendingUp,
  Calculator,
  Trash2,
  Wallet,
  X,
  Check,
  CreditCard,
  Building2,
  Banknote,
  Users,
  Phone,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Edit2,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { t } from '../../services/i18n';

const EXPENSE_CATEGORIES = {
  gu: ['કરિયાણું / ઘરખર્ચ', 'દવાઓ / હેલ્થ', 'પેટ્રોલ / મુસાફરી', 'શાકભાજી / ફળફળાદિ', 'દૂધ અને ચા-નાસ્તો', 'લાઇટ બિલ / રિચાર્જ', 'શિક્ષણ / ફી', 'અન્ય ખર્ચ'],
  hi: ['किराना / घरेलू खर्च', 'दवाइयाँ / स्वास्थ्य', 'पेट्रोल / यात्रा', 'सब्जी / फल', 'दूध और चाय-नाश्ता', 'बिजली बिल / रिचार्ज', 'शिक्षा / फ़ीस', 'अन्य खर्च'],
  en: ['Grocery / Household', 'Medicines / Health', 'Fuel / Travel', 'Vegetables / Fruits', 'Milk & Snacks', 'Bills & Recharge', 'Education & Fees', 'Other Expenses'],
};

const INCOME_CATEGORIES = {
  gu: ['પગાર / આવક', 'વેપાર / ધંધો', 'વ્યાજ / ડિવિડન્ડ', 'ભાડું', 'અન્ય આવક'],
  hi: ['वेतन / आय', 'व्यापार / धंधा', 'ब्याज / डिविडेंड', 'किराया', 'अन्य आय'],
  en: ['Salary / Income', 'Business / Trade', 'Interest / Returns', 'Rent Received', 'Other Income'],
};

const PAYMENT_MODES = {
  gu: ['UPI (GPay/PhonePe)', 'રોકડ (Cash)', 'બેંક ટ્રાન્સફર', 'ક્રેડિટ/ડેબિટ કાર્ડ'],
  hi: ['UPI (GPay/PhonePe)', 'नकद (Cash)', 'बैंक ट्रांसफर', 'क्रेडिट/डेबिट कार्ड'],
  en: ['UPI (GPay/PhonePe)', 'Cash in Hand', 'Bank Transfer', 'Credit/Debit Card'],
};

export default function FinanceTab({
  finance = [],
  onSaveFinance,
  accounts = { bankBalance: 42500, cashBalance: 6800 },
  onSaveAccounts,
  khata = [],
  onSaveKhata,
  onOpenCalculator,
  lang = 'gu',
}) {
  const [activeSubView, setActiveSubView] = useState('transactions'); // 'transactions' | 'khata'
  const [filterType, setFilterType] = useState('all'); // 'all', 'expense', 'income'
  const [khataFilter, setKhataFilter] = useState('all'); // 'all', 'to_receive', 'to_pay'

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isKhataModalOpen, setIsKhataModalOpen] = useState(false);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);

  // Transaction form
  const [txType, setTxType] = useState('expense');
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState(EXPENSE_CATEGORIES[lang]?.[0] || EXPENSE_CATEGORIES.gu[0]);
  const [txDescription, setTxDescription] = useState('');
  const [txPaymentMode, setTxPaymentMode] = useState(PAYMENT_MODES[lang]?.[0] || PAYMENT_MODES.gu[0]);
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);

  // Khata form
  const [khPartyName, setKhPartyName] = useState('');
  const [khPhone, setKhPhone] = useState('');
  const [khType, setKhType] = useState('to_receive'); // 'to_receive' (લેવાના) | 'to_pay' (આપવાના)
  const [khAmount, setKhAmount] = useState('');
  const [khDate, setKhDate] = useState(new Date().toISOString().split('T')[0]);
  const [khDueDate, setKhDueDate] = useState(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
  const [khDescription, setKhDescription] = useState('');

  // Balance edit form
  const [tempBankBal, setTempBankBal] = useState(accounts?.bankBalance ?? 42500);
  const [tempCashBal, setTempCashBal] = useState(accounts?.cashBalance ?? 6800);

  // Calculations
  const totalIncome = finance
    .filter((f) => f.type === 'income')
    .reduce((sum, f) => sum + Number(f.amount || 0), 0);

  const totalExpense = finance
    .filter((f) => f.type === 'expense')
    .reduce((sum, f) => sum + Number(f.amount || 0), 0);

  const netSavings = totalIncome - totalExpense;

  // Khata calculations (Lena / Dena)
  const totalToReceive = khata
    .filter((k) => !k.isSettled && k.type === 'to_receive')
    .reduce((sum, k) => sum + Number(k.amount || 0), 0);

  const totalToPay = khata
    .filter((k) => !k.isSettled && k.type === 'to_pay')
    .reduce((sum, k) => sum + Number(k.amount || 0), 0);

  const bankBalance = Number(accounts?.bankBalance || 0);
  const cashBalance = Number(accounts?.cashBalance || 0);
  const totalAvailable = bankBalance + cashBalance;

  // Handlers for Transactions
  const handleOpenAddTx = (defaultType = 'expense') => {
    setTxType(defaultType);
    setTxAmount('');
    setTxCategory(defaultType === 'expense' ? EXPENSE_CATEGORIES[lang][0] : INCOME_CATEGORIES[lang][0]);
    setTxDescription('');
    setTxPaymentMode(PAYMENT_MODES[lang][0]);
    setTxDate(new Date().toISOString().split('T')[0]);
    setIsTxModalOpen(true);
  };

  const handleSaveTx = (e) => {
    e.preventDefault();
    const num = parseFloat(txAmount);
    if (isNaN(num) || num <= 0) return;

    const newEntry = {
      id: 'fin-' + Date.now(),
      type: txType,
      amount: num,
      category: txCategory,
      description: txDescription,
      paymentMode: txPaymentMode,
      date: txDate,
    };

    onSaveFinance([newEntry, ...finance]);

    // Update bank / cash balance accordingly
    const isCash = txPaymentMode.includes('રોકડ') || txPaymentMode.includes('Cash') || txPaymentMode.includes('नकद');
    if (isCash) {
      const nextCash = txType === 'income' ? cashBalance + num : cashBalance - num;
      onSaveAccounts({ ...accounts, cashBalance: nextCash });
    } else {
      const nextBank = txType === 'income' ? bankBalance + num : bankBalance - num;
      onSaveAccounts({ ...accounts, bankBalance: nextBank });
    }

    setIsTxModalOpen(false);
    confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
  };

  const handleDeleteTx = (id) => {
    if (window.confirm('શું તમે આ હિસાબ એન્ટ્રી કાઢી નાખવા માંગો છો?')) {
      onSaveFinance(finance.filter((f) => f.id !== id));
    }
  };

  // Handlers for Khata
  const handleOpenAddKhata = (defaultType = 'to_receive') => {
    setKhType(defaultType);
    setKhPartyName('');
    setKhPhone('');
    setKhAmount('');
    setKhDate(new Date().toISOString().split('T')[0]);
    setKhDueDate(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
    setKhDescription('');
    setIsKhataModalOpen(true);
  };

  const handleSaveKhata = (e) => {
    e.preventDefault();
    const num = parseFloat(khAmount);
    if (!khPartyName.trim() || isNaN(num) || num <= 0) return;

    const newEntry = {
      id: 'kh-' + Date.now(),
      partyName: khPartyName.trim(),
      phone: khPhone.trim(),
      type: khType,
      amount: num,
      date: khDate,
      dueDate: khDueDate,
      description: khDescription.trim(),
      isSettled: false,
    };

    onSaveKhata([newEntry, ...khata]);
    setIsKhataModalOpen(false);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  const handleToggleSettleKhata = (khEntry) => {
    const nextStatus = !khEntry.isSettled;
    const updated = khata.map((k) =>
      k.id === khEntry.id ? { ...k, isSettled: nextStatus } : k
    );
    onSaveKhata(updated);

    if (nextStatus) {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    }
  };

  const handleDeleteKhata = (id) => {
    if (window.confirm('શું તમે આ પાર્ટી ખાતાની એન્ટ્રી કાઢવા માંગો છો?')) {
      onSaveKhata(khata.filter((k) => k.id !== id));
    }
  };

  // Handlers for Balance Edit
  const handleSaveBalances = (e) => {
    e.preventDefault();
    onSaveAccounts({
      bankBalance: Number(tempBankBal || 0),
      cashBalance: Number(tempCashBal || 0),
    });
    setIsBalanceModalOpen(false);
  };

  // Filters
  const filteredFinance = finance.filter((f) => {
    if (filterType === 'all') return true;
    return f.type === filterType;
  });

  const filteredKhata = khata.filter((k) => {
    if (khataFilter === 'all') return true;
    return k.type === khataFilter;
  });

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      {/* 4-Box Financial Dashboard Header */}
      <div className="bg-gradient-to-br from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-5 text-white shadow-xl shadow-blue-500/15 relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-2xl bg-white/20 backdrop-blur-md">
              <Wallet size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold">{t('tab_finance', lang)}</h2>
              <p className="text-[11px] text-blue-200">
                કુલ ઉપલબ્ધ રકમ: <strong className="text-white">₹{totalAvailable.toLocaleString()}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setTempBankBal(bankBalance);
              setTempCashBal(cashBalance);
              setIsBalanceModalOpen(true);
            }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-xs transition active:scale-95"
          >
            <Edit2 size={13} />
            <span>{t('balance_editor', lang)}</span>
          </button>
        </div>

        {/* 4 Cards Grid: Bank, Cash, Lena (Receivable), Dena (Payable) */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {/* 1. Bank Balance */}
          <div className="bg-white/10 rounded-2xl p-3 border border-white/15 backdrop-blur-xs">
            <div className="flex items-center justify-between text-blue-200 text-xs">
              <span className="flex items-center gap-1 font-semibold">
                <Building2 size={14} className="text-cyan-300" />
                {t('bank_balance', lang)}
              </span>
            </div>
            <p className="text-lg font-black mt-1 text-white tracking-tight">
              ₹{bankBalance.toLocaleString()}
            </p>
            <span className="text-[10px] text-blue-200 block mt-0.5">UPI અને ખાતા બેલેન્સ</span>
          </div>

          {/* 2. Hand Cash */}
          <div className="bg-white/10 rounded-2xl p-3 border border-white/15 backdrop-blur-xs">
            <div className="flex items-center justify-between text-emerald-200 text-xs">
              <span className="flex items-center gap-1 font-semibold">
                <Banknote size={14} className="text-emerald-300" />
                {t('cash_in_hand', lang)}
              </span>
            </div>
            <p className="text-lg font-black mt-1 text-white tracking-tight">
              ₹{cashBalance.toLocaleString()}
            </p>
            <span className="text-[10px] text-emerald-200 block mt-0.5">હાથ પર રોકડ રકમ</span>
          </div>

          {/* 3. Lena (Receivables) */}
          <div className="bg-emerald-500/20 rounded-2xl p-3 border border-emerald-400/30 backdrop-blur-xs">
            <div className="flex items-center justify-between text-emerald-200 text-xs">
              <span className="flex items-center gap-1 font-semibold text-emerald-200">
                <ArrowDownLeft size={14} className="text-emerald-300" />
                {t('to_receive', lang)}
              </span>
            </div>
            <p className="text-lg font-black mt-1 text-emerald-300 tracking-tight">
              ₹{totalToReceive.toLocaleString()}
            </p>
            <span className="text-[10px] text-emerald-200 block mt-0.5">પાર્ટીઓ પાસેથી લેવાના બાકી</span>
          </div>

          {/* 4. Dena (Payables) */}
          <div className="bg-red-500/20 rounded-2xl p-3 border border-red-400/30 backdrop-blur-xs">
            <div className="flex items-center justify-between text-red-200 text-xs">
              <span className="flex items-center gap-1 font-semibold text-red-200">
                <ArrowUpRight size={14} className="text-red-300" />
                {t('to_pay', lang)}
              </span>
            </div>
            <p className="text-lg font-black mt-1 text-red-300 tracking-tight">
              ₹{totalToPay.toLocaleString()}
            </p>
            <span className="text-[10px] text-red-200 block mt-0.5">પાર્ટીઓને આપવાના બાકી</span>
          </div>
        </div>

        {/* Quick Action Bar inside Banner */}
        <div className="flex gap-2 mt-3 pt-3 border-t border-white/15">
          <button
            onClick={() => handleOpenAddTx('expense')}
            className="flex-1 py-2 px-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs active:scale-95 transition"
          >
            <Plus size={14} />
            <span>- ખર્ચ ઉમેરો</span>
          </button>
          <button
            onClick={() => handleOpenAddTx('income')}
            className="flex-1 py-2 px-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs active:scale-95 transition"
          >
            <Plus size={14} />
            <span>+ આવક ઉમેરો</span>
          </button>
          <button
            onClick={() => handleOpenAddKhata('to_receive')}
            className="py-2 px-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs active:scale-95 transition"
          >
            <Users size={14} />
            <span>ખાતાવહી</span>
          </button>
        </div>
      </div>

      {/* Segmented Controller: Transactions vs Khata */}
      <div className="bg-white p-1 rounded-2xl border border-slate-200 grid grid-cols-2 gap-1 shadow-xs">
        <button
          onClick={() => setActiveSubView('transactions')}
          className={`py-2 px-3 text-center rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeSubView === 'transactions'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CreditCard size={15} />
          <span>આવક-ખર્ચ હિસાબ ({finance.length})</span>
        </button>

        <button
          onClick={() => setActiveSubView('khata')}
          className={`py-2 px-3 text-center rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeSubView === 'khata'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users size={15} />
          <span>{t('khata_book', lang)} ({khata.filter((k) => !k.isSettled).length} બાકી)</span>
        </button>
      </div>

      {/* ======================================================= */}
      {/* 1. TRANSACTIONS VIEW                                    */}
      {/* ======================================================= */}
      {activeSubView === 'transactions' && (
        <div className="space-y-3">
          {/* Filter Pills & Calculator Launcher */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-xs">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  filterType === 'all' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600'
                }`}
              >
                બધા
              </button>
              <button
                onClick={() => setFilterType('expense')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  filterType === 'expense' ? 'bg-red-500 text-white shadow-2xs' : 'text-slate-600'
                }`}
              >
                ખર્ચ (₹{totalExpense.toLocaleString()})
              </button>
              <button
                onClick={() => setFilterType('income')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  filterType === 'income' ? 'bg-emerald-500 text-white shadow-2xs' : 'text-slate-600'
                }`}
              >
                આવક (₹{totalIncome.toLocaleString()})
              </button>
            </div>

            {onOpenCalculator && (
              <button
                onClick={onOpenCalculator}
                className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 transition shadow-2xs"
                title="કેલ્ક્યુલેટર ખોલો"
              >
                <Calculator size={16} />
              </button>
            )}
          </div>

          {/* Transactions List */}
          <div className="space-y-2">
            {filteredFinance.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-6">
                <Wallet size={36} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-600">આ ફિલ્ટરમાં કોઈ વ્યવહાર નોંધાયેલ નથી.</p>
                <button
                  onClick={() => handleOpenAddTx('expense')}
                  className="mt-3 text-xs text-blue-600 font-bold hover:underline"
                >
                  + નવો ખર્ચ ઉમેરો
                </button>
              </div>
            ) : (
              filteredFinance.map((f) => {
                const isExpense = f.type === 'expense';
                return (
                  <div
                    key={f.id}
                    className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs flex items-center justify-between hover:border-slate-300 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          isExpense ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                        }`}
                      >
                        {isExpense ? '↓' : '↑'}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{f.category}</h4>
                        {f.description && (
                          <p className="text-[11px] text-slate-600 line-clamp-1">{f.description}</p>
                        )}
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span className="font-semibold text-slate-600">{f.paymentMode}</span>
                          <span>•</span>
                          <span>{f.date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span
                          className={`text-sm font-black ${
                            isExpense ? 'text-red-600' : 'text-emerald-600'
                          }`}
                        >
                          {isExpense ? '-' : '+'}₹{Number(f.amount).toLocaleString()}
                        </span>
                        <span className="text-[9px] block text-slate-400">
                          {isExpense ? 'ખર્ચ' : 'આવક'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDeleteTx(f.id)}
                        className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* 2. KHATA BOOK (PARTY LEDGER) VIEW                       */}
      {/* ======================================================= */}
      {activeSubView === 'khata' && (
        <div className="space-y-3">
          {/* Khata Top Control Bar */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-xs">
              <button
                onClick={() => setKhataFilter('all')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  khataFilter === 'all' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-600'
                }`}
              >
                બધા ({khata.length})
              </button>
              <button
                onClick={() => setKhataFilter('to_receive')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  khataFilter === 'to_receive'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600'
                }`}
              >
                લેવાના (₹{totalToReceive.toLocaleString()})
              </button>
              <button
                onClick={() => setKhataFilter('to_pay')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  khataFilter === 'to_pay' ? 'bg-red-600 text-white shadow-2xs' : 'text-slate-600'
                }`}
              >
                આપવાના (₹{totalToPay.toLocaleString()})
              </button>
            </div>

            <button
              onClick={() => handleOpenAddKhata('to_receive')}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition"
            >
              <Plus size={14} />
              <span>પાર્ટી ઉમેરો</span>
            </button>
          </div>

          {/* Khata Cards List */}
          <div className="space-y-2.5">
            {filteredKhata.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-6">
                <Users size={36} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-600">ખાતાવહીમાં કોઈ પાર્ટી એન્ટ્રી નથી.</p>
                <button
                  onClick={() => handleOpenAddKhata('to_receive')}
                  className="mt-3 text-xs text-blue-600 font-bold hover:underline"
                >
                  + નવી લેતી-દેતી નોંધો
                </button>
              </div>
            ) : (
              filteredKhata.map((k) => {
                const isReceive = k.type === 'to_receive';
                return (
                  <div
                    key={k.id}
                    className={`bg-white rounded-2xl p-4 border transition shadow-xs ${
                      k.isSettled ? 'border-slate-200 bg-slate-50/50 opacity-65' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4
                            className={`text-sm font-bold ${
                              k.isSettled ? 'line-through text-slate-500' : 'text-slate-800'
                            }`}
                          >
                            {k.partyName}
                          </h4>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              k.isSettled
                                ? 'bg-slate-200 text-slate-600'
                                : isReceive
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {k.isSettled ? 'ચૂકવાઈ ગયું' : isReceive ? 'મારે લેવાના' : 'મારે આપવાના'}
                          </span>
                        </div>

                        {k.description && (
                          <p className="text-xs text-slate-600 mt-1">{k.description}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-2">
                          {k.phone && (
                            <a
                              href={`tel:${k.phone}`}
                              className="flex items-center gap-1 text-blue-600 font-bold hover:underline"
                            >
                              <Phone size={12} />
                              {k.phone}
                            </a>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            તારીખ: {k.date}
                          </span>
                          {k.dueDate && (
                            <span className="font-semibold text-amber-700">
                              પાકતી તારીખ: {k.dueDate}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right side Amount and Settle Toggle */}
                      <div className="text-right shrink-0">
                        <span
                          className={`text-base font-black block ${
                            isReceive ? 'text-emerald-600' : 'text-red-600'
                          }`}
                        >
                          {isReceive ? '+' : '-'}₹{Number(k.amount).toLocaleString()}
                        </span>

                        <div className="flex items-center justify-end gap-1.5 mt-2">
                          <button
                            onClick={() => handleToggleSettleKhata(k)}
                            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1 active:scale-95 ${
                              k.isSettled
                                ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs'
                            }`}
                          >
                            <Check size={12} />
                            <span>{k.isSettled ? 'ફરી બાકી કરો' : 'હિસાબ ચૂકતે'}</span>
                          </button>
                          <button
                            onClick={() => handleDeleteKhata(k.id)}
                            className="p-1 text-slate-300 hover:text-red-500 transition"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL 1: ADD TRANSACTION (INCOME / EXPENSE)             */}
      {/* ======================================================= */}
      {isTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="text-base font-bold text-slate-800">
                {txType === 'expense' ? 'નવો ખર્ચ નોંધો' : 'નવી આવક નોંધો'}
              </h3>
              <button
                onClick={() => setIsTxModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTx} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTxType('expense');
                    setTxCategory(EXPENSE_CATEGORIES[lang][0]);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    txType === 'expense'
                      ? 'bg-red-500 text-white border-red-500'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  ખર્ચ (Expense)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTxType('income');
                    setTxCategory(INCOME_CATEGORIES[lang][0]);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    txType === 'income'
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  આવક (Income)
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">રકમ (₹) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  placeholder="0.00"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="w-full text-lg font-black p-2.5 rounded-xl border border-slate-200 focus:outline-blue-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">કેટેગરી</label>
                <select
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                >
                  {(txType === 'expense' ? EXPENSE_CATEGORIES[lang] : INCOME_CATEGORIES[lang]).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">ચુકવણી મોડ</label>
                  <select
                    value={txPaymentMode}
                    onChange={(e) => setTxPaymentMode(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                  >
                    {PAYMENT_MODES[lang].map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">તારીખ</label>
                  <input
                    type="date"
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">વિગત / નોંધ</label>
                <input
                  type="text"
                  placeholder="દા.ત. કરિયાણું ખરીદ્યું, પેટ્રોલ પુરાવ્યું..."
                  value={txDescription}
                  onChange={(e) => setTxDescription(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsTxModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
                >
                  સાચવો
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL 2: ADD KHATA / PARTY ENTRY (LENA / DENA)          */}
      {/* ======================================================= */}
      {isKhataModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="text-base font-bold text-slate-800">
                {khType === 'to_receive' ? 'મારે લેવાના (ઉધાર લેણાં)' : 'મારે આપવાના (ઉધાર દેવાં)'}
              </h3>
              <button
                onClick={() => setIsKhataModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveKhata} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setKhType('to_receive')}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    khType === 'to_receive'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  મેં આપ્યા (મારે લેવાના)
                </button>
                <button
                  type="button"
                  onClick={() => setKhType('to_pay')}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    khType === 'to_pay'
                      ? 'bg-red-600 text-white border-red-600'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  મેં લીધા (મારે આપવાના)
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">પાર્ટી / વ્યક્તિનું નામ *</label>
                <input
                  type="text"
                  required
                  placeholder="દા.ત. રમેશભાઈ, સુરેશ ટ્રેડર્સ..."
                  value={khPartyName}
                  onChange={(e) => setKhPartyName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-blue-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">રકમ (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="0.00"
                    value={khAmount}
                    onChange={(e) => setKhAmount(e.target.value)}
                    className="w-full text-sm font-black p-2 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">મોબાઈલ નંબર</label>
                  <input
                    type="tel"
                    placeholder="+91..."
                    value={khPhone}
                    onChange={(e) => setKhPhone(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">આપ્યા/લીધા તારીખ</label>
                  <input
                    type="date"
                    value={khDate}
                    onChange={(e) => setKhDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">પાકતી તારીખ (Due)</label>
                  <input
                    type="date"
                    value={khDueDate}
                    onChange={(e) => setKhDueDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-semibold text-amber-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">વિગત / કારણ</label>
                <input
                  type="text"
                  placeholder="દા.ત. માલ સામાન બાકી, હાથ ઉછીના..."
                  value={khDescription}
                  onChange={(e) => setKhDescription(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsKhataModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
                >
                  ખાતામાં સેવ કરો
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL 3: EDIT BANK & CASH BALANCES                      */}
      {/* ======================================================= */}
      {isBalanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="text-base font-bold text-slate-800">{t('balance_editor', lang)}</h3>
              <button
                onClick={() => setIsBalanceModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500">{t('edit_balance_sub', lang)}</p>

            <form onSubmit={handleSaveBalances} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  🏦 {t('bank_balance', lang)} (₹):
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={tempBankBal}
                  onChange={(e) => setTempBankBal(e.target.value)}
                  className="w-full text-base font-bold p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  💵 {t('cash_in_hand', lang)} (₹):
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={tempCashBal}
                  onChange={(e) => setTempCashBal(e.target.value)}
                  className="w-full text-base font-bold p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBalanceModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
                >
                  અપડેટ કરો
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
