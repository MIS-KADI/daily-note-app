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
  MessageCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { t, getExpenseCategories, getIncomeCategories, getPaymentModes } from '../../services/i18n';
import { whatsappService } from '../../services/whatsappService';

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

  const expenseCategories = getExpenseCategories(lang);
  const incomeCategories = getIncomeCategories(lang);
  const paymentModes = getPaymentModes(lang);

  // Modals state
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isKhataModalOpen, setIsKhataModalOpen] = useState(false);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);

  // Transaction form
  const [txType, setTxType] = useState('expense');
  const [txAmount, setTxAmount] = useState('');
  const [txCategory, setTxCategory] = useState(expenseCategories[0]);
  const [txDescription, setTxDescription] = useState('');
  const [txPaymentMode, setTxPaymentMode] = useState(paymentModes[0]);
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
    setTxCategory(defaultType === 'expense' ? expenseCategories[0] : incomeCategories[0]);
    setTxDescription('');
    setTxPaymentMode(paymentModes[0]);
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
    const isCash =
      txPaymentMode.includes('રોકડ') ||
      txPaymentMode.includes('Cash') ||
      txPaymentMode.includes('नकद') ||
      txPaymentMode.includes('Efectivo') ||
      txPaymentMode.includes('Espèces') ||
      txPaymentMode.includes('Bargeld') ||
      txPaymentMode.includes('نقداً');
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
    if (window.confirm(t('delete_tx_confirm', lang))) {
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
    if (window.confirm(t('delete_khata_confirm', lang))) {
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
                {t('total_available', lang)}: <strong className="text-white">₹{totalAvailable.toLocaleString()}</strong>
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
            <span className="text-[10px] text-blue-200 block mt-0.5">{t('upi_and_account', lang)}</span>
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
            <span className="text-[10px] text-emerald-200 block mt-0.5">{t('cash_in_hand_sub', lang)}</span>
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
            <span className="text-[10px] text-emerald-200 block mt-0.5">{t('receivable_from_parties', lang)}</span>
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
            <span className="text-[10px] text-red-200 block mt-0.5">{t('payable_to_parties', lang)}</span>
          </div>
        </div>

        {/* Quick Action Bar inside Banner */}
        <div className="flex gap-2 mt-3 pt-3 border-t border-white/15">
          <button
            onClick={() => handleOpenAddTx('expense')}
            className="flex-1 py-2 px-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs active:scale-95 transition"
          >
            <Plus size={14} />
            <span>{t('add_expense_btn', lang)}</span>
          </button>
          <button
            onClick={() => handleOpenAddTx('income')}
            className="flex-1 py-2 px-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs active:scale-95 transition"
          >
            <Plus size={14} />
            <span>{t('add_income_btn', lang)}</span>
          </button>
          <button
            onClick={() => handleOpenAddKhata('to_receive')}
            className="py-2 px-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs active:scale-95 transition"
          >
            <Users size={14} />
            <span>{t('khata_book', lang)}</span>
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
          <span>{t('income_expense_tab', lang)} ({finance.length})</span>
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
          <span>{t('khata_book', lang)} ({khata.filter((k) => !k.isSettled).length} {t('pending', lang)})</span>
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
                {t('all', lang)}
              </button>
              <button
                onClick={() => setFilterType('expense')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  filterType === 'expense' ? 'bg-red-500 text-white shadow-2xs' : 'text-slate-600'
                }`}
              >
                {t('expense', lang)} (₹{totalExpense.toLocaleString()})
              </button>
              <button
                onClick={() => setFilterType('income')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  filterType === 'income' ? 'bg-emerald-500 text-white shadow-2xs' : 'text-slate-600'
                }`}
              >
                {t('income', lang)} (₹{totalIncome.toLocaleString()})
              </button>
            </div>

            {onOpenCalculator && (
              <button
                onClick={onOpenCalculator}
                className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 transition shadow-2xs"
                title={t('smart_calc_title', lang)}
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
                <p className="text-xs font-semibold text-slate-600">{t('no_tx_found', lang)}</p>
                <button
                  onClick={() => handleOpenAddTx('expense')}
                  className="mt-3 text-xs text-blue-600 font-bold hover:underline"
                >
                  {t('add_new_expense', lang)}
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
                          {isExpense ? t('expense', lang) : t('income', lang)}
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
                {t('all', lang)} ({khata.length})
              </button>
              <button
                onClick={() => setKhataFilter('to_receive')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  khataFilter === 'to_receive'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600'
                }`}
              >
                {t('to_receive', lang)} (₹{totalToReceive.toLocaleString()})
              </button>
              <button
                onClick={() => setKhataFilter('to_pay')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  khataFilter === 'to_pay' ? 'bg-red-600 text-white shadow-2xs' : 'text-slate-600'
                }`}
              >
                {t('to_pay', lang)} (₹{totalToPay.toLocaleString()})
              </button>
            </div>

            <button
              onClick={() => handleOpenAddKhata('to_receive')}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition"
            >
              <Plus size={14} />
              <span>{t('add_party', lang)}</span>
            </button>
          </div>

          {/* Khata Cards List */}
          <div className="space-y-2.5">
            {filteredKhata.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300 p-6">
                <Users size={36} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-600">{t('no_khata_entry', lang)}</p>
                <button
                  onClick={() => handleOpenAddKhata('to_receive')}
                  className="mt-3 text-xs text-blue-600 font-bold hover:underline"
                >
                  {t('add_khata_entry', lang)}
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
                            {k.isSettled ? t('settled', lang) : isReceive ? t('my_receivables', lang) : t('my_payables', lang)}
                          </span>
                        </div>

                        {k.description && (
                          <p className="text-xs text-slate-600 mt-1">{k.description}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-500 mt-2">
                          {k.phone && (
                            <a
                              href={`tel:${k.phone}`}
                              className="flex items-center gap-1 text-blue-600 font-bold hover:underline"
                            >
                              <Phone size={12} />
                              {k.phone}
                            </a>
                          )}
                          <button
                            onClick={() =>
                              whatsappService.sendPaymentReminder({
                                partyName: k.partyName,
                                phone: k.phone,
                                amount: k.amount,
                                type: k.type,
                                dueDate: k.dueDate,
                                senderName: user?.name,
                                lang,
                              })
                            }
                            className="flex items-center gap-1 text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-2 py-0.5 rounded-lg font-bold transition active:scale-95"
                            title="WhatsApp"
                          >
                            <MessageCircle size={12} />
                            <span>WhatsApp</span>
                          </button>
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {t('date', lang)}: {k.date}
                          </span>
                          {k.dueDate && (
                            <span className="font-semibold text-amber-700">
                              {t('due_date', lang)}: {k.dueDate}
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
                            <span>{k.isSettled ? t('reopen', lang) : t('mark_settled', lang)}</span>
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
                {txType === 'expense' ? t('add_new_expense', lang) : t('add_new_income', lang)}
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
                    setTxCategory(expenseCategories[0]);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    txType === 'expense'
                      ? 'bg-red-500 text-white border-red-500'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {t('expense', lang)}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTxType('income');
                    setTxCategory(incomeCategories[0]);
                  }}
                  className={`py-2 rounded-xl text-xs font-bold border transition ${
                    txType === 'income'
                      ? 'bg-emerald-500 text-white border-emerald-500'
                      : 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {t('income', lang)}
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {t('amount', lang)} (₹) *
                </label>
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
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {t('category', lang)}
                </label>
                <select
                  value={txCategory}
                  onChange={(e) => setTxCategory(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                >
                  {(txType === 'expense' ? expenseCategories : incomeCategories).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {t('payment_mode', lang)}
                  </label>
                  <select
                    value={txPaymentMode}
                    onChange={(e) => setTxPaymentMode(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                  >
                    {paymentModes.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {t('date', lang)}
                  </label>
                  <input
                    type="date"
                    value={txDate}
                    onChange={(e) => setTxDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {t('desc_note', lang)}
                </label>
                <input
                  type="text"
                  placeholder={t('tx_desc_placeholder', lang)}
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
                  {t('cancel', lang)}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
                >
                  {t('save', lang)}
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
                {khType === 'to_receive' ? t('to_receive', lang) : t('to_pay', lang)}
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
                  {t('khata_gave_to_receive', lang)}
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
                  {t('khata_took_to_pay', lang)}
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {t('party_name', lang)} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={t('party_name', lang)}
                  value={khPartyName}
                  onChange={(e) => setKhPartyName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-blue-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {t('amount', lang)} (₹) *
                  </label>
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
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {t('mobile_number', lang)}
                  </label>
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
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {t('tx_date', lang)}
                  </label>
                  <input
                    type="date"
                    value={khDate}
                    onChange={(e) => setKhDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {t('due_date', lang)}
                  </label>
                  <input
                    type="date"
                    value={khDueDate}
                    onChange={(e) => setKhDueDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-semibold text-amber-700"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {t('desc_reason', lang)}
                </label>
                <input
                  type="text"
                  placeholder={t('khata_desc_placeholder', lang)}
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
                  {t('cancel', lang)}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
                >
                  {t('save_to_khata', lang)}
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
                  {t('cancel', lang)}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs"
                >
                  {t('update', lang)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
