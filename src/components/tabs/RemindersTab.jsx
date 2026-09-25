import React, { useState } from 'react';
import {
  Clock,
  Plus,
  Building2,
  Users,
  CheckCircle2,
  Bell,
  BellOff,
  Trash2,
  Calendar,
  X,
  Check,
  Volume2,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { t } from '../../services/i18n';

const TYPES = {
  gu: [
    { id: 'all', label: 'બધા કામો', icon: null },
    { id: 'meeting', label: '💼 મીટિંગ', icon: Users },
    { id: 'bank', label: '🏦 બેંક કામ', icon: Building2 },
    { id: 'task', label: '📋 અન્ય કામ', icon: Clock },
  ],
  hi: [
    { id: 'all', label: 'सभी कार्य', icon: null },
    { id: 'meeting', label: '💼 मीटिंग', icon: Users },
    { id: 'bank', label: '🏦 बैंक कार्य', icon: Building2 },
    { id: 'task', label: '📋 अन्य कार्य', icon: Clock },
  ],
  en: [
    { id: 'all', label: 'All Tasks', icon: null },
    { id: 'meeting', label: '💼 Meeting', icon: Users },
    { id: 'bank', label: '🏦 Bank Work', icon: Building2 },
    { id: 'task', label: '📋 General Task', icon: Clock },
  ],
};

export default function RemindersTab({
  reminders = [],
  onSaveReminders,
  onTriggerAlarm,
  lang = 'gu',
}) {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedType, setSelectedType] = useState('all');
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'future'
  const [showCompleted, setShowCompleted] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('meeting');
  const [time, setTime] = useState('11:00');
  const [date, setDate] = useState(todayStr);
  const [hasAlarm, setHasAlarm] = useState(true);
  const [priority, setPriority] = useState('high');

  const handleOpenAdd = (defaultDate = todayStr) => {
    setEditingReminder(null);
    setTitle('');
    setDescription('');
    setType('meeting');
    setTime('11:00');
    setDate(defaultDate);
    setHasAlarm(true);
    setPriority('high');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (rem) => {
    setEditingReminder(rem);
    setTitle(rem.title);
    setDescription(rem.description || '');
    setType(rem.type);
    setTime(rem.time);
    setDate(rem.date);
    setHasAlarm(rem.hasAlarm ?? true);
    setPriority(rem.priority || 'high');
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingReminder) {
      const updated = reminders.map((r) =>
        r.id === editingReminder.id
          ? {
              ...r,
              title,
              description,
              type,
              time,
              date,
              hasAlarm,
              priority,
            }
          : r
      );
      onSaveReminders(updated);
    } else {
      const newReminder = {
        id: 'rem-' + Date.now(),
        title,
        description,
        type,
        time,
        date,
        hasAlarm,
        priority,
        isCompleted: false,
      };
      onSaveReminders([newReminder, ...reminders]);
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    }
    setIsModalOpen(false);
  };

  const handleToggleComplete = (id) => {
    onSaveReminders(
      reminders.map((r) =>
        r.id === id ? { ...r, isCompleted: !r.isCompleted } : r
      )
    );
  };

  const handleDelete = (id) => {
    if (window.confirm(lang === 'en' ? 'Delete this task?' : 'શું તમે આ કામ કાઢી નાખવા માંગો છો?')) {
      onSaveReminders(reminders.filter((r) => r.id !== id));
    }
  };

  // Filter
  const filtered = reminders.filter((r) => {
    const matchesType = selectedType === 'all' || r.type === selectedType;
    const matchesStatus = showCompleted || !r.isCompleted;

    let matchesDate = true;
    if (dateFilter === 'today') {
      matchesDate = r.date === todayStr;
    } else if (dateFilter === 'future') {
      matchesDate = r.date > todayStr;
    }

    return matchesType && matchesStatus && matchesDate;
  });

  const futureTasksCount = reminders.filter((r) => r.date > todayStr && !r.isCompleted).length;
  const typesList = TYPES[lang] || TYPES.gu;

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Clock className="text-indigo-600" size={22} />
            {t('reminders_title', lang)}
          </h2>
          <p className="text-xs text-slate-500">
            {t('reminders_sub', lang)}
          </p>
        </div>
        <button
          onClick={() => handleOpenAdd(todayStr)}
          className="flex items-center gap-1 py-2 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-semibold shadow-md shadow-indigo-500/20 active:scale-95 transition"
        >
          <Plus size={16} />
          {t('new_task', lang)}
        </button>
      </div>

      {/* Date Filter Tabs (Today, Upcoming/Advance, All) */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        <button
          onClick={() => setDateFilter('all')}
          className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
            dateFilter === 'all'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {t('filter_all', lang)} ({reminders.length})
        </button>

        <button
          onClick={() => setDateFilter('today')}
          className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
            dateFilter === 'today'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          {t('today', lang)}
        </button>

        <button
          onClick={() => setDateFilter('future')}
          className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
            dateFilter === 'future'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          🚀 {t('upcoming', lang)} ({futureTasksCount})
        </button>
      </div>

      {/* Type Filter Buttons */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {typesList.map((tItem) => (
          <button
            key={tItem.id}
            onClick={() => setSelectedType(tItem.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedType === tItem.id
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tItem.label}
          </button>
        ))}
      </div>

      {/* Completed toggle checkbox */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-500">
        <span>કુલ: {filtered.length} કામો</span>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
            className="w-3.5 h-3.5 text-indigo-600 rounded-sm"
          />
          પૂર્ણ થયેલા કામો બતાવો
        </label>
      </div>

      {/* Reminders List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 space-y-2">
          <span className="text-4xl block">🎉</span>
          <h3 className="text-sm font-bold text-slate-700">કોઈ કામ બાકી નથી!</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            નવું મીટિંગ અથવા બેંકનું કામ ઉમેરવા માટે "નવું કામ" બટન દબાવો.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const isBank = r.type === 'bank';
            const isMeeting = r.type === 'meeting';
            const isFuture = r.date > todayStr;

            return (
              <div
                key={r.id}
                className={`p-4 rounded-3xl border transition shadow-xs bg-white ${
                  r.isCompleted
                    ? 'opacity-60 border-slate-200 bg-slate-50'
                    : isBank
                    ? 'border-amber-200/90 hover:border-amber-300'
                    : isMeeting
                    ? 'border-indigo-200/90 hover:border-indigo-300'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleToggleComplete(r.id)}
                      className={`w-7 h-7 rounded-xl flex items-center justify-center transition active:scale-95 ${
                        r.isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'border-2 border-slate-300 hover:border-indigo-500 text-transparent'
                      }`}
                    >
                      <CheckCircle2 size={18} />
                    </button>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isBank
                              ? 'bg-amber-100 text-amber-800'
                              : isMeeting
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {isBank ? t('bank_work', lang) : isMeeting ? t('meeting', lang) : t('task', lang)}
                        </span>

                        {isFuture && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-800 flex items-center gap-1">
                            <Calendar size={11} />
                            એડવાન્સ: {r.date}
                          </span>
                        )}

                        <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                          <Clock size={12} />
                          {r.time}
                        </span>
                      </div>

                      <h4
                        className={`text-sm font-bold mt-1 ${
                          r.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        {r.title}
                      </h4>

                      {r.description && (
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                          {r.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {onTriggerAlarm && (
                      <button
                        onClick={() =>
                          onTriggerAlarm({
                            title: r.title,
                            time: r.time,
                            type: r.type,
                            description: r.description,
                          })
                        }
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition"
                        title="ટેસ્ટ એલાર્મ"
                      >
                        <Volume2 size={16} />
                      </button>
                    )}
                    <button
                      onClick={() => handleOpenEdit(r)}
                      className="p-2 text-slate-400 hover:text-slate-600 rounded-xl transition"
                    >
                      <Trash2 size={16} className="hidden" />
                      <span className="text-xs text-indigo-600 font-bold hover:underline">સુધારો</span>
                    </button>
                    <button
                      onClick={() => handleDelete(r.id)}
                      className="p-2 text-slate-300 hover:text-red-500 rounded-xl transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL: ADD / EDIT REMINDER WITH ADVANCE DATE BUTTONS    */}
      {/* ======================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="text-base font-bold text-slate-800">
                {editingReminder ? 'કામ સુધારો' : 'નવું કામ / મીટિંગ ઉમેરો'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">કામ / મીટિંગનું નામ *</label>
                <input
                  type="text"
                  required
                  placeholder="દા.ત. બેંકમાં ચેક જમા કરવો, પાર્ટી મીટિંગ..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-indigo-500 font-bold"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">કામનો પ્રકાર</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'meeting', label: '💼 મીટિંગ' },
                    { id: 'bank', label: '🏦 બેંક કામ' },
                    { id: 'task', label: '📋 સામાન્ય' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setType(item.id)}
                      className={`py-2 text-center rounded-xl text-xs font-bold border transition ${
                        type === item.id
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date with Advance Shortcut Buttons */}
              <div className="p-3 bg-indigo-50/50 rounded-2xl border border-indigo-200/80">
                <label className="text-xs font-bold text-indigo-900 block mb-1.5">
                  📅 તારીખ (એડવાન્સ / ભવિષ્યનું કામ):
                </label>
                <div className="flex items-center gap-1.5 mb-2">
                  <button
                    type="button"
                    onClick={() => setDate(todayStr)}
                    className="flex-1 py-1.5 rounded-xl bg-white border border-indigo-200 text-indigo-800 font-bold text-xs"
                  >
                    આજે
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const tom = new Date(Date.now() + 86400000).toISOString().split('T')[0];
                      setDate(tom);
                    }}
                    className="flex-1 py-1.5 rounded-xl bg-white border border-indigo-200 text-indigo-800 font-bold text-xs"
                  >
                    આવતીકાલે
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const nextW = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
                      setDate(nextW);
                    }}
                    className="flex-1 py-1.5 rounded-xl bg-white border border-indigo-200 text-indigo-800 font-bold text-xs"
                  >
                    આવતા અઠવાડિયે
                  </button>
                </div>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs font-bold p-2 rounded-xl border border-indigo-200 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">સમય</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">અગ્રતા (Priority)</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                  >
                    <option value="high">🔴 ઉચ્ચ (High)</option>
                    <option value="medium">🟡 સામાન્ય (Medium)</option>
                    <option value="low">🟢 ઓછી (Low)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">વિગત / નોંધ</label>
                <textarea
                  rows={2}
                  placeholder="વધારાની વિગતો લખો..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasAlarm}
                    onChange={(e) => setHasAlarm(e.target.checked)}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                  <span>સમયસર એલાર્મ વગાડવું</span>
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs"
                >
                  સાચવો
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
