import React, { useState } from 'react';
import { ShoppingBag, Plus, CheckCircle2, Trash2, X, ArrowRight, IndianRupee } from 'lucide-react';
import { t } from '../services/i18n';

export default function ShoppingModal({
  isOpen,
  onClose,
  shoppingList,
  onSaveShopping,
  onAddExpense,
  lang = 'gu',
}) {
  const [newItem, setNewItem] = useState('');
  const [newPrice, setNewPrice] = useState('');

  if (!isOpen) return null;

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    const entry = {
      id: 's-' + Date.now(),
      item: newItem.trim(),
      price: parseFloat(newPrice) || 0,
      isDone: false,
    };

    onSaveShopping([...shoppingList, entry]);
    setNewItem('');
    setNewPrice('');
  };

  const handleToggleDone = (id) => {
    onSaveShopping(
      shoppingList.map((item) =>
        item.id === id ? { ...item, isDone: !item.isDone } : item
      )
    );
  };

  const handleDeleteItem = (id) => {
    onSaveShopping(shoppingList.filter((item) => item.id !== id));
  };

  // Calculate totals
  const totalAmount = shoppingList.reduce((sum, item) => sum + (item.price || 0), 0);
  const purchasedAmount = shoppingList
    .filter((item) => item.isDone)
    .reduce((sum, item) => sum + (item.price || 0), 0);

  const handleTransferToFinance = () => {
    const defaultCat = t('shopping_default_category', lang);
    if (purchasedAmount > 0) {
      onAddExpense(purchasedAmount, defaultCat);
      onClose();
    } else if (totalAmount > 0) {
      onAddExpense(totalAmount, defaultCat);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in slide-in-from-bottom duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-emerald-600 text-white">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-white/20 rounded-xl">
              <ShoppingBag size={20} />
            </span>
            <div>
              <h3 className="font-bold text-base leading-tight">{t('shopping_modal_title', lang)}</h3>
              <p className="text-xs text-emerald-100">{t('shopping_modal_sub', lang)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Add Item Input Form */}
        <form onSubmit={handleAddItem} className="p-3 bg-slate-50 border-b border-slate-200 flex gap-2">
          <input
            type="text"
            placeholder={t('item_name_placeholder', lang)}
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            required
          />
          <input
            type="number"
            placeholder={t('est_price', lang)}
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
            className="w-20 px-2 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
          <button
            type="submit"
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold active:scale-95 transition flex items-center gap-1 shadow-xs"
          >
            <Plus size={16} />
            {t('add', lang)}
          </button>
        </form>

        {/* Shopping Items List */}
        <div className="p-4 overflow-y-auto flex-1 space-y-2">
          {shoppingList.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              <p className="text-2xl mb-1">🛒</p>
              {t('shopping_empty', lang)}
            </div>
          ) : (
            shoppingList.map((item) => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-2xl border transition ${
                  item.isDone
                    ? 'bg-slate-50 border-slate-200 opacity-60'
                    : 'bg-white border-slate-200 hover:border-emerald-300'
                }`}
              >
                <div
                  onClick={() => handleToggleDone(item.id)}
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                >
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition ${
                      item.isDone
                        ? 'bg-emerald-600 text-white'
                        : 'border-2 border-slate-300 text-transparent'
                    }`}
                  >
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <p
                      className={`text-xs font-bold ${
                        item.isDone ? 'line-through text-slate-400' : 'text-slate-800'
                      }`}
                    >
                      {item.item}
                    </p>
                    {item.price > 0 && (
                      <span className="text-[11px] text-slate-500 font-semibold">
                        ₹{item.price}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-1.5 text-slate-300 hover:text-red-600 rounded-lg transition"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Bottom Total & Transfer Action */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500 font-semibold">
              {t('purchased_items', lang)}: ₹{purchasedAmount} / {t('total_label', lang) || 'Total'}: ₹{totalAmount}
            </span>
            <span className="text-xs font-bold text-slate-800">
              {shoppingList.filter((i) => i.isDone).length}/{shoppingList.length} {t('completed_label', lang)}
            </span>
          </div>

          <button
            onClick={handleTransferToFinance}
            disabled={shoppingList.length === 0}
            className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-500/20 transition disabled:opacity-50"
          >
            <IndianRupee size={15} />
            <span>{t('add_purchase_expense', lang)} (₹{purchasedAmount || totalAmount})</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
