import React, { useState } from 'react';
import {
  Clock,
  Plus,
  Building2,
  Users,
  CheckCircle2,
  Bell,
  Trash2,
  Calendar,
  X,
  Check,
  Volume2,
  Sparkles,
  Cake,
  Heart,
  PartyPopper,
  Phone,
  MessageCircle,
  Share2,
  Edit2,
  Gift,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { t } from '../../services/i18n';
import { whatsappService } from '../../services/whatsappService';

const getTaskTypes = (lang) => [
  { id: 'all', label: t('filter_all', lang), icon: null },
  { id: 'meeting', label: `💼 ${t('meeting', lang)}`, icon: Users },
  { id: 'bank', label: `🏦 ${t('bank_work', lang)}`, icon: Building2 },
  { id: 'task', label: `📋 ${t('task', lang)}`, icon: Clock },
];

// Calculate days remaining until next birthday or anniversary occurrence
export const getDaysUntilEvent = (dateStr) => {
  if (!dateStr) return 999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const eventDate = new Date(dateStr);
  if (isNaN(eventDate.getTime())) return 999;

  const thisYearEvent = new Date(today.getFullYear(), eventDate.getMonth(), eventDate.getDate());
  thisYearEvent.setHours(0, 0, 0, 0);

  let diffTime = thisYearEvent.getTime() - today.getTime();
  let diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const nextYearEvent = new Date(today.getFullYear() + 1, eventDate.getMonth(), eventDate.getDate());
    diffTime = nextYearEvent.getTime() - today.getTime();
    diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  }
  return diffDays;
};

export default function RemindersTab({
  reminders = [],
  onSaveReminders,
  events = [],
  onSaveEvents,
  onTriggerAlarm,
  user,
  lang = 'gu',
}) {
  const todayStr = new Date().toISOString().split('T')[0];

  // Primary subview: 'tasks' vs 'events'
  const [activeSubView, setActiveSubView] = useState('tasks');

  // Task filters
  const [selectedTaskType, setSelectedTaskType] = useState('all');
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'future'
  const [showCompleted, setShowCompleted] = useState(true);

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);

  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  // Task form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('meeting');
  const [time, setTime] = useState('11:00');
  const [date, setDate] = useState(todayStr);
  const [hasAlarm, setHasAlarm] = useState(true);
  const [priority, setPriority] = useState('high');

  // Event form state (Birthday & Anniversary)
  const [evName, setEvName] = useState('');
  const [evType, setEvType] = useState('birthday'); // 'birthday', 'anniversary', 'special_event'
  const [evDate, setEvDate] = useState(todayStr);
  const [evPhone, setEvPhone] = useState('');
  const [evRelation, setEvRelation] = useState('મિત્ર (Friend)');
  const [evNotes, setEvNotes] = useState('');

  // -------------------------------------------------------------
  // Task Handlers
  // -------------------------------------------------------------
  const handleOpenAddTask = (defaultDate = todayStr) => {
    setEditingReminder(null);
    setTitle('');
    setDescription('');
    setType('meeting');
    setTime('11:00');
    setDate(defaultDate);
    setHasAlarm(true);
    setPriority('high');
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (rem) => {
    setEditingReminder(rem);
    setTitle(rem.title);
    setDescription(rem.description || '');
    setType(rem.type);
    setTime(rem.time);
    setDate(rem.date);
    setHasAlarm(rem.hasAlarm ?? true);
    setPriority(rem.priority || 'high');
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = (e) => {
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
    setIsTaskModalOpen(false);
  };

  const handleToggleComplete = (id) => {
    onSaveReminders(
      reminders.map((r) =>
        r.id === id ? { ...r, isCompleted: !r.isCompleted } : r
      )
    );
  };

  const handleDeleteTask = (id) => {
    if (window.confirm(t('delete_task_confirm', lang))) {
      onSaveReminders(reminders.filter((r) => r.id !== id));
    }
  };

  // -------------------------------------------------------------
  // Event Handlers (Birthday & Anniversary)
  // -------------------------------------------------------------
  const handleOpenAddEvent = () => {
    setEditingEvent(null);
    setEvName('');
    setEvType('birthday');
    setEvDate(todayStr);
    setEvPhone('');
    setEvRelation(t('default_user_name', lang));
    setEvNotes('');
    setIsEventModalOpen(true);
  };

  const handleOpenEditEvent = (ev) => {
    setEditingEvent(ev);
    setEvName(ev.name);
    setEvType(ev.type || 'birthday');
    setEvDate(ev.date);
    setEvPhone(ev.phone || '');
    setEvRelation(ev.relation || '');
    setEvNotes(ev.notes || '');
    setIsEventModalOpen(true);
  };

  const handleSaveEvent = (e) => {
    e.preventDefault();
    if (!evName.trim()) return;

    if (editingEvent) {
      const updated = events.map((item) =>
        item.id === editingEvent.id
          ? {
              ...item,
              name: evName,
              type: evType,
              date: evDate,
              phone: evPhone,
              relation: evRelation,
              notes: evNotes,
            }
          : item
      );
      onSaveEvents(updated);
    } else {
      const newEvent = {
        id: 'ev-' + Date.now(),
        name: evName,
        type: evType,
        date: evDate,
        phone: evPhone,
        relation: evRelation,
        notes: evNotes,
      };
      onSaveEvents([newEvent, ...events]);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    }
    setIsEventModalOpen(false);
  };

  const handleDeleteEvent = (id) => {
    if (window.confirm(t('delete_event_confirm', lang))) {
      onSaveEvents(events.filter((item) => item.id !== id));
    }
  };

  // Filter tasks
  const filteredTasks = reminders.filter((r) => {
    const matchesType = selectedTaskType === 'all' || r.type === selectedTaskType;
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
  const typesList = getTaskTypes(lang);

  // Process & Sort Events by days remaining
  const sortedEvents = [...events].map((ev) => ({
    ...ev,
    daysLeft: getDaysUntilEvent(ev.date),
  })).sort((a, b) => a.daysLeft - b.daysLeft);

  const todayCelebrations = sortedEvents.filter((ev) => ev.daysLeft === 0);

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Top Header & Sub-tab Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            {activeSubView === 'tasks' ? (
              <Clock className="text-indigo-600" size={22} />
            ) : (
              <Cake className="text-pink-600" size={22} />
            )}
            {activeSubView === 'tasks' ? t('reminders_title', lang) : t('events_title', lang)}
          </h2>
          <p className="text-xs text-slate-500">
            {activeSubView === 'tasks' ? t('reminders_sub', lang) : t('events_sub', lang)}
          </p>
        </div>

        {activeSubView === 'tasks' ? (
          <button
            onClick={() => handleOpenAddTask(todayStr)}
            className="flex items-center gap-1 py-2 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-semibold shadow-md shadow-indigo-500/20 active:scale-95 transition"
          >
            <Plus size={16} />
            {t('new_task', lang)}
          </button>
        ) : (
          <button
            onClick={handleOpenAddEvent}
            className="flex items-center gap-1 py-2 px-3.5 bg-pink-600 hover:bg-pink-700 text-white rounded-2xl text-xs font-semibold shadow-md shadow-pink-500/20 active:scale-95 transition"
          >
            <Plus size={16} />
            {t('add_event', lang)}
          </button>
        )}
      </div>

      {/* Main Mode Toggle: Tasks vs Celebrations */}
      <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
        <button
          onClick={() => setActiveSubView('tasks')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeSubView === 'tasks'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Clock size={15} />
          <span>{t('subtab_tasks', lang)} ({reminders.length})</span>
        </button>

        <button
          onClick={() => setActiveSubView('events')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeSubView === 'events'
              ? 'bg-white text-pink-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Gift size={15} />
          <span>{t('subtab_events', lang)} ({events.length})</span>
          {todayCelebrations.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
          )}
        </button>
      </div>

      {/* ======================================================= */}
      {/* 1. TASKS & MEETINGS VIEW                                */}
      {/* ======================================================= */}
      {activeSubView === 'tasks' && (
        <div className="space-y-4">
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
                onClick={() => setSelectedTaskType(tItem.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedTaskType === tItem.id
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
            <span>કુલ: {filteredTasks.length} કામો</span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
                className="w-3.5 h-3.5 text-indigo-600 rounded-sm"
              />
              {t('show_completed', lang)}
            </label>
          </div>

          {/* Reminders List */}
          {filteredTasks.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 space-y-2">
              <span className="text-4xl block">🎉</span>
              <h3 className="text-sm font-bold text-slate-700">{t('no_tasks', lang)}</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                {t('no_tasks_sub', lang)}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((r) => {
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
                                {t('advance', lang)}: {r.date}
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
                        {/* 1-Tap WhatsApp Share */}
                        <button
                          onClick={() => whatsappService.shareReminder(r, lang)}
                          className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl transition"
                          title={t('whatsapp_share', lang)}
                        >
                          <Share2 size={16} />
                        </button>

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
                            title={t('test', lang)}
                          >
                            <Volume2 size={16} />
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenEditTask(r)}
                          className="p-2 text-slate-400 hover:text-indigo-600 rounded-xl transition"
                          title={t('edit', lang)}
                        >
                          <Edit2 size={15} />
                        </button>

                        <button
                          onClick={() => handleDeleteTask(r.id)}
                          className="p-2 text-slate-300 hover:text-red-500 rounded-xl transition"
                          title={t('delete', lang)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================= */}
      {/* 2. BIRTHDAYS & ANNIVERSARIES CELEBRATION VIEW           */}
      {/* ======================================================= */}
      {activeSubView === 'events' && (
        <div className="space-y-4">
          {/* Today's Celebrations Highlight Banner */}
          {todayCelebrations.length > 0 && (
            <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 rounded-3xl p-4 text-white shadow-lg shadow-pink-500/20 space-y-3 animate-in zoom-in-95">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl animate-bounce">🎉</span>
                  <div>
                    <h3 className="text-sm font-black tracking-wide">
                      {t('today_celebrations_banner', lang)}
                    </h3>
                    <p className="text-[11px] opacity-90">
                      {todayCelebrations.length} {t('registered_celebrations', lang)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => confetti({ particleCount: 70, spread: 80, origin: { y: 0.4 } })}
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition active:scale-95"
                >
                  <Sparkles size={16} />
                </button>
              </div>

              <div className="space-y-2.5">
                {todayCelebrations.map((ev) => (
                  <div
                    key={ev.id}
                    className="bg-white/15 backdrop-blur-md rounded-2xl p-3.5 border border-white/20 space-y-2.5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shrink-0">
                        {ev.type === 'birthday' ? '🎂' : ev.type === 'anniversary' ? '💍' : '🌟'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="text-sm font-black text-white">{ev.name}</h4>
                          <span className="text-[10px] bg-white/25 px-2 py-0.5 rounded-full font-bold">
                            {ev.type === 'birthday' ? t('birthday', lang) : ev.type === 'anniversary' ? t('anniversary', lang) : t('special_event', lang)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-pink-100 mt-0.5">
                          {ev.relation && <span>{ev.relation}</span>}
                          {ev.phone && <span>• 📱 {ev.phone}</span>}
                        </div>
                        {ev.notes && <p className="text-[11px] text-pink-100/90 mt-0.5 italic">"{ev.notes}"</p>}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/15 flex justify-end">
                      <button
                        onClick={() =>
                          whatsappService.sendWish({
                            name: ev.name,
                            type: ev.type,
                            phone: ev.phone,
                            relation: ev.relation,
                            senderName: user?.name,
                            lang,
                          })
                        }
                        className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-700/30 active:scale-95 transition"
                      >
                        <MessageCircle size={15} />
                        <span>{t('wish_whatsapp', lang)}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Events Count Info */}
          <div className="flex items-center justify-between px-1 text-xs text-slate-500">
            <span>{t('registered_celebrations', lang)}: {sortedEvents.length}</span>
            <span className="font-semibold text-pink-600">
              {t('sorted_by_date', lang)}
            </span>
          </div>

          {/* Events Cards List */}
          {sortedEvents.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 space-y-2">
              <span className="text-4xl block">🎂</span>
              <h3 className="text-sm font-bold text-slate-700">{t('no_events_registered', lang)}</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                {t('add_event_desc', lang)}
              </p>
              <button
                onClick={handleOpenAddEvent}
                className="mt-3 inline-flex items-center gap-1 px-4 py-2 bg-pink-600 text-white rounded-xl text-xs font-bold hover:bg-pink-700 transition"
              >
                <Plus size={14} />
                <span>{t('add_event', lang)}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {sortedEvents.map((ev) => {
                const isBirthday = ev.type === 'birthday';
                const isAnniversary = ev.type === 'anniversary';
                const isToday = ev.daysLeft === 0;
                const isTomorrow = ev.daysLeft === 1;

                return (
                  <div
                    key={ev.id}
                    className={`bg-white rounded-3xl p-4 border transition shadow-xs ${
                      isToday
                        ? 'border-pink-300 ring-2 ring-pink-500/20 bg-pink-50/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                            isBirthday
                              ? 'bg-pink-100 text-pink-600'
                              : isAnniversary
                              ? 'bg-rose-100 text-rose-600'
                              : 'bg-purple-100 text-purple-600'
                          }`}
                        >
                          {isBirthday ? '🎂' : isAnniversary ? '💍' : '🎉'}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-sm font-black text-slate-800">{ev.name}</h4>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isBirthday
                                  ? 'bg-pink-100 text-pink-700'
                                  : isAnniversary
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-purple-100 text-purple-700'
                              }`}
                            >
                              {isBirthday ? t('birthday', lang) : isAnniversary ? t('anniversary', lang) : t('special_event', lang)}
                            </span>

                            {ev.relation && (
                              <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full font-semibold">
                                {ev.relation}
                              </span>
                            )}
                          </div>

                          {ev.notes && (
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                              {ev.notes}
                            </p>
                          )}

                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-2">
                            <span className="flex items-center gap-1 font-semibold text-slate-700">
                              <Calendar size={12} className="text-pink-600" />
                              {t('date', lang)}: {ev.date}
                            </span>

                            {isToday ? (
                              <span className="font-black text-pink-600 animate-pulse">
                                🎉 {t('today_only', lang)}
                              </span>
                            ) : isTomorrow ? (
                              <span className="font-bold text-amber-600">
                                ⏳ {t('tomorrow_is', lang)}
                              </span>
                            ) : (
                              <span className="font-semibold text-slate-500">
                                ⏳ {ev.daysLeft} {t('days_left_suffix', lang)}
                              </span>
                            )}

                            {ev.phone && (
                              <a
                                href={`tel:${ev.phone}`}
                                className="flex items-center gap-1 text-blue-600 font-bold hover:underline"
                              >
                                <Phone size={12} />
                                {ev.phone}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right side Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* 1-Tap WhatsApp Wish */}
                        <button
                          onClick={() =>
                            whatsappService.sendWish({
                              name: ev.name,
                              type: ev.type,
                              phone: ev.phone,
                              relation: ev.relation,
                              senderName: user?.name,
                              lang,
                            })
                          }
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs active:scale-95 transition"
                          title={t('wish_whatsapp', lang)}
                        >
                          <MessageCircle size={14} />
                          <span className="hidden sm:inline">{t('wish_whatsapp', lang)}</span>
                        </button>

                        <button
                          onClick={() => handleOpenEditEvent(ev)}
                          className="p-1.5 text-slate-400 hover:text-pink-600 rounded-lg transition"
                          title="સુધારો"
                        >
                          <Edit2 size={15} />
                        </button>

                        <button
                          onClick={() => handleDeleteEvent(ev.id)}
                          className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg transition"
                          title="કાઢી નાખો"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL 1: ADD / EDIT TASK WITH ADVANCE DATE PRESETS      */}
      {/* ======================================================= */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="text-base font-bold text-slate-800">
                {editingReminder ? 'કામ સુધારો' : 'નવું કામ / મીટિંગ ઉમેરો'}
              </h3>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{t('task_name_req', lang)}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bank visit, Client meeting..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-indigo-500 font-bold"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{t('type', lang)}</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'meeting', label: `💼 ${t('meeting', lang)}` },
                    { id: 'bank', label: `🏦 ${t('bank_work', lang)}` },
                    { id: 'task', label: `📋 ${t('task', lang)}` },
                  ].map((tItem) => (
                    <button
                      type="button"
                      key={tItem.id}
                      onClick={() => setType(tItem.id)}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        type === tItem.id
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {tItem.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advance Date Selection Buttons */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {t('date', lang)} ({t('today', lang)} / {t('advance', lang)})
                </label>
                <div className="flex gap-1.5 mb-2 overflow-x-auto pb-1 text-xs">
                  <button
                    type="button"
                    onClick={() => setDate(todayStr)}
                    className={`px-2.5 py-1 rounded-lg font-bold border transition ${
                      date === todayStr ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    {t('today', lang)}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 1);
                      setDate(d.toISOString().split('T')[0]);
                    }}
                    className={`px-2.5 py-1 rounded-lg font-bold border transition ${
                      date === new Date(Date.now() + 86400000).toISOString().split('T')[0]
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    {t('tomorrow', lang)}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const d = new Date();
                      d.setDate(d.getDate() + 7);
                      setDate(d.toISOString().split('T')[0]);
                    }}
                    className="px-2.5 py-1 rounded-lg font-bold border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  >
                    +7 {t('days_left_suffix', lang)}
                  </button>
                </div>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">{t('time', lang)}</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">{t('priority', lang)}</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 font-bold"
                  >
                    <option value="high">🔴 {t('priority_high', lang)}</option>
                    <option value="medium">🟡 {t('priority_medium', lang)}</option>
                    <option value="low">🟢 {t('priority_low', lang)}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{t('task_desc_label', lang)}</label>
                <textarea
                  rows={2}
                  placeholder=""
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 focus:outline-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="alarm-check"
                  checked={hasAlarm}
                  onChange={(e) => setHasAlarm(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded-sm"
                />
                <label htmlFor="alarm-check" className="text-xs font-bold text-slate-700 cursor-pointer">
                  {t('sound_alarm_label', lang)}
                </label>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  {t('cancel', lang)}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition"
                >
                  {editingReminder ? t('save', lang) : t('add', lang)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL 2: ADD / EDIT BIRTHDAY & ANNIVERSARY              */}
      {/* ======================================================= */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="text-base font-bold text-slate-800">
                {editingEvent ? t('edit', lang) : t('add_event', lang)}
              </h3>
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {t('person_couple_name', lang)}
                </label>
                <input
                  type="text"
                  required
                  placeholder=""
                  value={evName}
                  onChange={(e) => setEvName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-pink-500 font-bold"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{t('type', lang)}</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'birthday', label: `🎂 ${t('birthday', lang)}` },
                    { id: 'anniversary', label: `💍 ${t('anniversary', lang)}` },
                    { id: 'special_event', label: `🎉 ${t('special_day', lang)}` },
                  ].map((tItem) => (
                    <button
                      type="button"
                      key={tItem.id}
                      onClick={() => setEvType(tItem.id)}
                      className={`py-2 rounded-xl text-xs font-bold border transition ${
                        evType === tItem.id
                          ? 'bg-pink-600 text-white border-pink-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {tItem.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">{t('date', lang)} *</label>
                  <input
                    type="date"
                    required
                    value={evDate}
                    onChange={(e) => setEvDate(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">{t('relation', lang)}</label>
                  <input
                    type="text"
                    placeholder=""
                    value={evRelation}
                    onChange={(e) => setEvRelation(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {t('phone_number', lang)}
                </label>
                <input
                  type="tel"
                  placeholder="+91..."
                  value={evPhone}
                  onChange={(e) => setEvPhone(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{t('notes', lang)}</label>
                <textarea
                  rows={2}
                  placeholder=""
                  value={evNotes}
                  onChange={(e) => setEvNotes(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 focus:outline-pink-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEventModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                >
                  {t('cancel', lang)}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-bold shadow-md shadow-pink-600/30 transition"
                >
                  {editingEvent ? t('save', lang) : t('add', lang)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
