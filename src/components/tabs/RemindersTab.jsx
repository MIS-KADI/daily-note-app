import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Clock as ClockIcon,
  Plus as PlusIcon,
  Building2 as Building2Icon,
  Users as UsersIcon,
  CheckCircle2 as CheckCircle2Icon,
  Bell as BellIcon,
  Trash2 as Trash2Icon,
  Calendar as CalendarIcon,
  X as XIcon,
  Check as CheckIcon,
  Volume2 as Volume2Icon,
  Sparkles as SparklesIcon,
  Cake as CakeIcon,
  Heart as HeartIcon,
  Phone as PhoneIcon,
  MessageCircle as MessageCircleIcon,
  Share2 as Share2Icon,
  Edit2 as Edit2Icon,
  Gift as GiftIcon,
  ShoppingCart as ShoppingCartIcon,
  Briefcase as BriefcaseIcon,
  CheckSquare as CheckSquareIcon,
  Music as MusicIcon,
  Upload as UploadIcon,
  Play as PlayIcon,
  Square as SquareIcon,
  Sliders as SlidersIcon,
  Repeat as RepeatIcon,
  Search as SearchIcon,
  VolumeX as VolumeXIcon,
  Smartphone as SmartphoneIcon,
} from 'lucide-react';
import { t } from '../../services/i18n';
import { whatsappService } from '../../services/whatsappService';
import { storageService } from '../../services/storageService';
import { soundAlarm, RINGTONE_OPTIONS } from '../../services/audioService';

const getTaskTypes = (lang) => [
  { id: 'all', label: t('filter_all', lang), icon: null },
  { id: 'meeting', label: t('meeting', lang), icon: UsersIcon },
  { id: 'bank', label: t('bank_work', lang), icon: Building2Icon },
  { id: 'task', label: t('task', lang), icon: ClockIcon },
  { id: 'shopping', label: t('shopping_task', lang) || '🛒 ખરીદી', icon: ShoppingCartIcon },
  { id: 'work', label: t('work_task', lang) || '💼 ઓફિસ / કામ', icon: BriefcaseIcon },
];

const quickShoppingItems = [
  '🛒 કરિયાણું',
  '🥬 શાકભાજી',
  '🥛 દૂધ / ડેરી',
  '💊 દવાઓ',
  '🍞 નાસ્તો / બેકરી',
  '🧽 ઘરવપરાશ',
  '🍎 ફળો',
  '🧴 તેલ / મસાલા',
];

const quickWorkItems = [
  '⭐ અગત્યનું કામ',
  '📞 કોલ કરવો',
  '📁 ફાઇલ સબમિશન',
  '🤝 મીટિંગ',
  '⏳ ફોલોઅપ',
  '✉️ ઈમેલ / મેસેજ',
  '💰 પેમેન્ટ હિસાબ',
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

// Calculate subtask progress from description checklist
export const getSubtaskStats = (desc) => {
  if (!desc) return null;
  const lines = desc.split('\n');
  let total = 0;
  let completed = 0;
  lines.forEach((l) => {
    const trimmed = l.trim();
    if (
      trimmed.startsWith('☐') ||
      trimmed.startsWith('☑️') ||
      trimmed.startsWith('[ ]') ||
      trimmed.startsWith('[x]')
    ) {
      total++;
      if (trimmed.startsWith('☑️') || trimmed.startsWith('[x]')) {
        completed++;
      }
    }
  });
  if (total === 0) return null;
  return { total, completed, percent: Math.round((completed / total) * 100) };
};

export default function RemindersTab({
  reminders = [],
  onSaveReminders,
  events = [],
  onSaveEvents,
  onTriggerAlarm,
  onOpenShopping,
  shoppingList = [],
  onSaveShopping,
  user,
  lang = 'gu',
}) {
  const todayStr = new Date().toISOString().split('T')[0];

  // Primary subview: 'tasks' vs 'events'
  const [activeSubView, setActiveSubView] = useState('tasks');

  // Task filters & Search
  const [selectedTaskType, setSelectedTaskType] = useState('all');
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'future'
  const [priorityFilter, setPriorityFilter] = useState('all'); // 'all', 'high', 'medium', 'low'
  const [searchQuery, setSearchQuery] = useState('');
  const [showCompleted, setShowCompleted] = useState(true);

  // Alarm & Ringtone Global Settings
  const [alarmSettings, setAlarmSettings] = useState(() => storageService.getAlarmSettings());
  const [isRingtoneModalOpen, setIsRingtoneModalOpen] = useState(false);
  const [previewingRingtone, setPreviewingRingtone] = useState(null);

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
  const [taskRingtone, setTaskRingtone] = useState('default'); // 'default' uses alarmSettings
  const [taskRepeat, setTaskRepeat] = useState('none'); // 'none', 'daily', 'weekly', 'monthly'

  // Event form state (Birthday & Anniversary)
  const [evName, setEvName] = useState('');
  const [evType, setEvType] = useState('birthday'); // 'birthday', 'anniversary', 'special_event'
  const [evDate, setEvDate] = useState(todayStr);
  const [evPhone, setEvPhone] = useState('');
  const [evRelation, setEvRelation] = useState('મિત્ર (Friend)');
  const [evNotes, setEvNotes] = useState('');

  // Stop any audio preview when component unmounts
  useEffect(() => {
    return () => {
      soundAlarm.stopAlarm();
    };
  }, []);

  // -------------------------------------------------------------
  // Ringtone Settings Handlers
  // -------------------------------------------------------------
  const handleSelectDefaultRingtone = (toneId) => {
    const updated = { ...alarmSettings, ringtone: toneId };
    setAlarmSettings(updated);
    storageService.saveAlarmSettings(updated);
  };

  const handleTogglePreview = (toneId, customAudioData = null) => {
    if (previewingRingtone === toneId) {
      soundAlarm.stopAlarm();
      setPreviewingRingtone(null);
    } else {
      setPreviewingRingtone(toneId);
      soundAlarm.previewRingtone(toneId, customAudioData, () => {
        setPreviewingRingtone(null);
      });
    }
  };

  const handleUploadCustomRingtone = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert(
        lang === 'gu'
          ? 'ઓડિયો ફાઇલ 5MB કરતાં નાની હોવી જોઈએ.'
          : 'Audio file must be under 5MB.'
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target.result;
      const updated = {
        ...alarmSettings,
        ringtone: 'custom',
        customRingtoneName: file.name,
        customRingtoneData: base64Data,
      };
      setAlarmSettings(updated);
      storageService.saveAlarmSettings(updated);
      handleTogglePreview('custom', base64Data);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomAudio = () => {
    const updated = {
      ...alarmSettings,
      ringtone: 'classic_bell',
      customRingtoneName: '',
      customRingtoneData: null,
    };
    setAlarmSettings(updated);
    storageService.saveAlarmSettings(updated);
    if (previewingRingtone === 'custom') {
      soundAlarm.stopAlarm();
      setPreviewingRingtone(null);
    }
  };

  const handleVolumeChange = (vol) => {
    const updated = { ...alarmSettings, volume: vol };
    setAlarmSettings(updated);
    storageService.saveAlarmSettings(updated);
    soundAlarm.setVolume(vol);
  };

  const handleToggleVibrate = () => {
    const updated = { ...alarmSettings, vibrate: !alarmSettings.vibrate };
    setAlarmSettings(updated);
    storageService.saveAlarmSettings(updated);
    soundAlarm.setVibrate(updated.vibrate);
  };

  // Helper to format ringtone badge name
  const getRingtoneDisplayName = (toneId) => {
    if (!toneId || toneId === 'default') {
      const defaultTone = RINGTONE_OPTIONS.find((r) => r.id === alarmSettings.ringtone);
      return defaultTone
        ? (lang === 'gu' ? defaultTone.nameGu.split(' ')[0] + ' ' + defaultTone.nameGu.split(' ')[1] : defaultTone.nameEn)
        : '🔔 ડિફોલ્ટ';
    }
    if (toneId === 'custom') {
      return lang === 'gu' ? '📁 મોબાઈલ ટોન' : '📁 Mobile Tone';
    }
    const found = RINGTONE_OPTIONS.find((r) => r.id === toneId);
    return found ? (lang === 'gu' ? found.nameGu.split(' ')[0] + ' ' + found.nameGu.split(' ')[1] : found.nameEn) : toneId;
  };

  // -------------------------------------------------------------
  // Task Handlers
  // -------------------------------------------------------------
  const handleOpenAddTask = (defaultDate = todayStr, defaultType = null) => {
    setEditingReminder(null);
    setTitle('');
    setDescription('');
    const chosenType =
      defaultType || (selectedTaskType !== 'all' ? selectedTaskType : 'task');
    setType(chosenType);
    setTime('11:00');
    setDate(defaultDate);
    setHasAlarm(true);
    setPriority('high');
    setTaskRingtone('default');
    setTaskRepeat('none');
    setIsTaskModalOpen(true);
  };

  const handleOpenEditTask = (rem) => {
    setEditingReminder(rem);
    setTitle(rem.title);
    setDescription(rem.description || '');
    setType(rem.type || 'task');
    setTime(rem.time);
    setDate(rem.date);
    setHasAlarm(rem.hasAlarm ?? true);
    setPriority(rem.priority || 'high');
    setTaskRingtone(rem.ringtone || 'default');
    setTaskRepeat(rem.repeat || 'none');
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
              ringtone: taskRingtone,
              repeat: taskRepeat,
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
        ringtone: taskRingtone,
        repeat: taskRepeat,
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

  // Toggle individual checklist items inside task description
  const handleToggleTaskSubItem = (taskId, lineIndex) => {
    const task = reminders.find((r) => r.id === taskId);
    if (!task || !task.description) return;
    const lines = task.description.split('\n');
    if (lineIndex < 0 || lineIndex >= lines.length) return;
    let line = lines[lineIndex];
    if (line.includes('☐')) {
      lines[lineIndex] = line.replace('☐', '☑️');
    } else if (line.includes('☑️')) {
      lines[lineIndex] = line.replace('☑️', '☐');
    } else if (line.includes('[ ]')) {
      lines[lineIndex] = line.replace('[ ]', '[x]');
    } else if (line.includes('[x]')) {
      lines[lineIndex] = line.replace('[x]', '[ ]');
    }
    const updated = reminders.map((r) =>
      r.id === taskId ? { ...r, description: lines.join('\n') } : r
    );
    onSaveReminders(updated);
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

  // -------------------------------------------------------------
  // Filter Tasks
  // -------------------------------------------------------------
  const filteredTasks = reminders.filter((r) => {
    const matchesType = selectedTaskType === 'all' || r.type === selectedTaskType;
    const matchesStatus = showCompleted || !r.isCompleted;

    let matchesDate = true;
    if (dateFilter === 'today') {
      matchesDate = r.date === todayStr;
    } else if (dateFilter === 'future') {
      matchesDate = r.date > todayStr;
    }

    let matchesPriority = true;
    if (priorityFilter !== 'all') {
      matchesPriority = (r.priority || 'high') === priorityFilter;
    }

    let matchesSearch = true;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      matchesSearch =
        r.title.toLowerCase().includes(q) ||
        (r.description && r.description.toLowerCase().includes(q));
    }

    return matchesType && matchesStatus && matchesDate && matchesPriority && matchesSearch;
  });

  const futureTasksCount = reminders.filter((r) => r.date > todayStr && !r.isCompleted).length;
  const todayTasksCount = reminders.filter((r) => r.date === todayStr && !r.isCompleted).length;
  const highPriorityCount = reminders.filter((r) => (r.priority || 'high') === 'high' && !r.isCompleted).length;
  const completedTasksCount = reminders.filter((r) => r.isCompleted).length;

  const typesList = getTaskTypes(lang);

  // Process & Sort Events by days remaining
  const sortedEvents = [...events]
    .map((ev) => ({
      ...ev,
      daysLeft: getDaysUntilEvent(ev.date),
    }))
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const todayCelebrations = sortedEvents.filter((ev) => ev.daysLeft === 0);

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* ======================================================= */}
      {/* 1. TOP HEADER & ACTION BUTTONS                          */}
      {/* ======================================================= */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            {activeSubView === 'tasks' ? (
              <ClockIcon className="text-indigo-600" size={22} />
            ) : (
              <CakeIcon className="text-pink-600" size={22} />
            )}
            {activeSubView === 'tasks' ? t('reminders_title', lang) : t('events_title', lang)}
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            {activeSubView === 'tasks' ? t('reminders_sub', lang) : t('events_sub', lang)}
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {activeSubView === 'tasks' && (
            <button
              onClick={() => setIsRingtoneModalOpen(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 py-2 px-3 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-2xl text-xs font-bold shadow-2xs active:scale-95 transition"
              title="રીંગટોન અને સાઉન્ડ સેટિંગ્સ"
            >
              <MusicIcon size={15} className="text-purple-600" />
              <span>{lang === 'gu' ? '🔔 રીંગટોન' : '🔔 Ringtone'}</span>
            </button>
          )}

          {activeSubView === 'tasks' ? (
            <button
              onClick={() => handleOpenAddTask(todayStr)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 py-2 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-indigo-500/25 active:scale-95 transition"
            >
              <PlusIcon size={16} />
              <span>{t('new_task', lang)}</span>
            </button>
          ) : (
            <button
              onClick={handleOpenAddEvent}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 py-2 px-3.5 bg-pink-600 hover:bg-pink-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-pink-500/25 active:scale-95 transition"
            >
              <PlusIcon size={16} />
              <span>{t('add_event', lang)}</span>
            </button>
          )}
        </div>
      </div>

      {/* ======================================================= */}
      {/* 2. SUB-VIEW SWITCHER: TASKS vs CELEBRATIONS             */}
      {/* ======================================================= */}
      <div className="flex bg-slate-100 p-1 rounded-2xl gap-1">
        <button
          onClick={() => setActiveSubView('tasks')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeSubView === 'tasks'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <ClockIcon size={15} />
          <span>{t('subtab_tasks', lang)} ({reminders.length})</span>
        </button>

        <button
          onClick={() => setActiveSubView('events')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
            activeSubView === 'events'
              ? 'bg-white text-pink-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <GiftIcon size={15} />
          <span>{t('subtab_events', lang)} ({events.length})</span>
          {todayCelebrations.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
          )}
        </button>
      </div>

      {/* ======================================================= */}
      {/* 3. TASKS & MEETINGS VIEW                                */}
      {/* ======================================================= */}
      {activeSubView === 'tasks' && (
        <div className="space-y-3.5">
          {/* Smart Stats Summary Cards */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[10px] text-slate-500 font-bold block">{lang === 'gu' ? 'કુલ કામો' : 'Total'}</span>
              <span className="text-base font-black text-slate-800">{reminders.length}</span>
            </div>
            <div className="bg-white p-2.5 rounded-2xl border border-indigo-100 bg-indigo-50/20 shadow-2xs">
              <span className="text-[10px] text-indigo-700 font-bold block">{lang === 'gu' ? 'આજના' : 'Today'}</span>
              <span className="text-base font-black text-indigo-600">{todayTasksCount}</span>
            </div>
            <div className="bg-white p-2.5 rounded-2xl border border-rose-100 bg-rose-50/20 shadow-2xs">
              <span className="text-[10px] text-rose-700 font-bold block">{lang === 'gu' ? 'અગત્યનું' : 'Priority'}</span>
              <span className="text-base font-black text-rose-600">{highPriorityCount}</span>
            </div>
            <div className="bg-white p-2.5 rounded-2xl border border-emerald-100 bg-emerald-50/20 shadow-2xs">
              <span className="text-[10px] text-emerald-700 font-bold block">{lang === 'gu' ? 'પૂર્ણ' : 'Done'}</span>
              <span className="text-base font-black text-emerald-600">{completedTasksCount}</span>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <SearchIcon size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={lang === 'gu' ? 'કામ કે વિગત શોધો...' : 'Search tasks & checklists...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-8 py-2 rounded-2xl bg-white border border-slate-200 focus:outline-indigo-500 font-medium placeholder:text-slate-400 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <XIcon size={14} />
              </button>
            )}
          </div>

          {/* Date Filter Tabs (All, Today, Upcoming) */}
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
              {t('today', lang)} ({todayTasksCount})
            </button>

            <button
              onClick={() => setDateFilter('future')}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                dateFilter === 'future'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              🚀 {lang === 'gu' ? 'આગામી (Upcoming)' : t('upcoming', lang)} ({futureTasksCount})
            </button>
          </div>

          {/* Type Filter Buttons */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {typesList.map((tItem) => (
              <button
                key={tItem.id}
                onClick={() => setSelectedTaskType(tItem.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedTaskType === tItem.id
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tItem.label}
              </button>
            ))}
          </div>

          {/* Priority Quick Filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <span className="text-[11px] font-bold text-slate-400 shrink-0">{lang === 'gu' ? 'પ્રાથમિકતા:' : 'Priority:'}</span>
            {[
              { id: 'all', label: lang === 'gu' ? 'બધી' : 'All' },
              { id: 'high', label: '🔴 ' + t('priority_high', lang) },
              { id: 'medium', label: '🟡 ' + t('priority_medium', lang) },
              { id: 'low', label: '🟢 ' + t('priority_low', lang) },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPriorityFilter(p.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap ${
                  priorityFilter === p.id
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Shopping Shortcut Banner */}
          {selectedTaskType === 'shopping' && onOpenShopping && (
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-3 flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
                  <ShoppingCartIcon size={18} />
                </span>
                <div>
                  <h4 className="text-xs font-bold text-emerald-950">
                    {lang === 'gu' ? '🛒 ઝડપી ખરીદી લિસ્ટ & બજેટ' : '🛒 Shopping Checklist & Budget'}
                  </h4>
                  <p className="text-[10px] text-emerald-700">
                    {shoppingList?.length || 0} {lang === 'gu' ? 'આઇટમ્સ ઉપલબ્ધ છે' : 'items saved'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onOpenShopping}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition"
              >
                {lang === 'gu' ? 'લિસ્ટ ખોલો' : 'Open List'}
              </button>
            </div>
          )}

          {/* Completed toggle checkbox & count */}
          <div className="flex items-center justify-between px-1 text-xs text-slate-500">
            <span>
              {lang === 'gu' ? `દર્શાવેલ: ${filteredTasks.length} કામો` : `Showing: ${filteredTasks.length} tasks`}
            </span>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={showCompleted}
                onChange={(e) => setShowCompleted(e.target.checked)}
                className="w-3.5 h-3.5 text-indigo-600 rounded-sm cursor-pointer"
              />
              {t('show_completed', lang)}
            </label>
          </div>

          {/* Reminders List */}
          {filteredTasks.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 space-y-2.5">
              <span className="text-4xl block">🎉</span>
              <h3 className="text-sm font-bold text-slate-700">{t('no_tasks', lang)}</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                {t('no_tasks_sub', lang)}
              </p>
              <button
                onClick={() => handleOpenAddTask(todayStr)}
                className="mt-2 inline-flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 active:scale-95 transition shadow-sm"
              >
                <PlusIcon size={14} />
                <span>{t('new_task', lang)}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((r) => {
                const isBank = r.type === 'bank';
                const isMeeting = r.type === 'meeting';
                const isShopping = r.type === 'shopping';
                const isWork = r.type === 'work';
                const isFuture = r.date > todayStr;
                const subStats = getSubtaskStats(r.description);

                return (
                  <div
                    key={r.id}
                    className={`p-4 rounded-3xl border transition shadow-xs bg-white relative overflow-hidden ${
                      r.isCompleted
                        ? 'opacity-65 border-slate-200 bg-slate-50'
                        : r.priority === 'high'
                        ? 'border-l-4 border-l-rose-500 border-slate-200 hover:border-slate-300'
                        : r.priority === 'medium'
                        ? 'border-l-4 border-l-amber-500 border-slate-200 hover:border-slate-300'
                        : 'border-l-4 border-l-emerald-500 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Top Row: Checkmark & Tags on Left, Action buttons on Right */}
                    <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2 flex-wrap min-w-0 flex-1">
                        {/* Completion Checkmark Button */}
                        <button
                          onClick={() => handleToggleComplete(r.id)}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition active:scale-95 shrink-0 ${
                            r.isCompleted
                              ? 'bg-emerald-600 text-white'
                              : 'border-2 border-slate-300 hover:border-indigo-500 text-transparent'
                          }`}
                        >
                          <CheckCircle2Icon size={16} />
                        </button>

                        {/* Type badge */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isShopping
                              ? 'bg-emerald-100 text-emerald-800'
                              : isWork
                              ? 'bg-blue-100 text-blue-800'
                              : isBank
                              ? 'bg-amber-100 text-amber-800'
                              : isMeeting
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {isShopping
                            ? (t('shopping_task', lang) || '🛒 ખરીદી')
                            : isWork
                            ? (t('work_task', lang) || '💼 કામ')
                            : isBank
                            ? t('bank_work', lang)
                            : isMeeting
                            ? t('meeting', lang)
                            : t('task', lang)}
                        </span>

                        {/* Advance Date indicator */}
                        {isFuture && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-800 flex items-center gap-1">
                            <CalendarIcon size={11} />
                            {t('advance', lang)}: {r.date}
                          </span>
                        )}

                        {/* Time badge */}
                        <span className="text-xs font-bold text-slate-600 flex items-center gap-1">
                          <ClockIcon size={12} className="text-slate-400" />
                          {r.time}
                        </span>

                        {/* Repeat badge */}
                        {r.repeat && r.repeat !== 'none' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 flex items-center gap-1">
                            <RepeatIcon size={10} />
                            {r.repeat === 'daily'
                              ? (lang === 'gu' ? 'દરરોજ' : 'Daily')
                              : r.repeat === 'weekly'
                              ? (lang === 'gu' ? 'દર અઠવાડિયે' : 'Weekly')
                              : (lang === 'gu' ? 'દર મહિને' : 'Monthly')}
                          </span>
                        )}
                      </div>

                      {/* Right-side Card Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        {/* 1-Tap WhatsApp Share */}
                        <button
                          onClick={() => whatsappService.shareReminder(r, lang)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                          title={t('whatsapp_share', lang)}
                        >
                          <Share2Icon size={15} />
                        </button>

                        {/* Test Alarm Sound */}
                        {onTriggerAlarm && (
                          <button
                            onClick={() => {
                              const ringtoneToPlay =
                                r.ringtone && r.ringtone !== 'default'
                                  ? r.ringtone
                                  : alarmSettings.ringtone;
                              const customAudioToPlay =
                                ringtoneToPlay === 'custom'
                                  ? r.customAudioUrl || alarmSettings.customRingtoneData
                                  : null;
                              onTriggerAlarm({
                                id: r.id,
                                title: r.title,
                                time: r.time,
                                type: r.type,
                                description: r.description,
                                ringtone: ringtoneToPlay,
                                customAudioUrl: customAudioToPlay,
                              });
                            }}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                            title={lang === 'gu' ? 'એલાર્મ સાઉન્ડ ચેક કરો' : 'Test Alarm Sound'}
                          >
                            <Volume2Icon size={15} />
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenEditTask(r)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg transition"
                          title={t('edit', lang)}
                        >
                          <Edit2Icon size={15} />
                        </button>

                        <button
                          onClick={() => handleDeleteTask(r.id)}
                          className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg transition"
                          title={t('delete', lang)}
                        >
                          <Trash2Icon size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Task Title & Description - Full Width Continuous (સળંગ) */}
                    <div className="pt-2">
                      <h4
                        className={`text-sm font-bold leading-normal break-words ${
                          r.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        {(r.title || '').replace(/\r?\n+/g, ' ').trim()}
                      </h4>

                      {/* Clean Description only if not duplicate of title and not raw checklist markup */}
                      {(() => {
                        if (!r.description) return null;
                        const lines = r.description
                          .split('\n')
                          .map((l) => l.trim())
                          .filter((l) => l && !l.startsWith('☐') && !l.startsWith('☑️') && !l.startsWith('[ ]') && !l.startsWith('[x]') && !l.startsWith('કેટેગરી:'));
                        const cleanText = lines.join(' ').trim();
                        if (!cleanText) return null;
                        const normClean = cleanText.replace(/^(ખરીદી|કામ|મીટિંગ):\s*/, '').trim().toLowerCase();
                        const normTitle = (r.title || '').replace(/^(ખરીદી|કામ|મીટિંગ):\s*/, '').trim().toLowerCase();
                        if (normClean === normTitle) return null;
                        return (
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed break-words">
                            {cleanText}
                          </p>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================= */}
      {/* 4. BIRTHDAYS & ANNIVERSARIES CELEBRATION VIEW           */}
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
                  <SparklesIcon size={16} />
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
                        <MessageCircleIcon size={15} />
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
                <PlusIcon size={14} />
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
                              <CalendarIcon size={12} className="text-pink-600" />
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

                            {ev.phone && ev.phone !== '0' && ev.phone.trim() !== '' ? (
                              <a
                                href={`tel:${ev.phone}`}
                                className="flex items-center gap-1 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/80 px-2 py-0.5 rounded-lg font-bold text-[11px] hover:underline shrink-0"
                              >
                                <PhoneIcon size={11} className="text-blue-600" />
                                <span>{ev.phone}</span>
                              </a>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenEditEvent(ev)}
                                className="flex items-center gap-1 text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-lg font-bold text-[11px] transition active:scale-95 shrink-0"
                                title={lang === 'gu' ? 'મોબાઇલ નંબર ઉમેરો' : 'Add phone number'}
                              >
                                <PhoneIcon size={11} />
                                <span>{lang === 'gu' ? '+ ફોન નંબર' : '+ Add Mobile'}</span>
                              </button>
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
                          <MessageCircleIcon size={14} />
                          <span className="hidden sm:inline">{t('wish_whatsapp', lang)}</span>
                        </button>

                        <button
                          onClick={() => handleOpenEditEvent(ev)}
                          className="p-1.5 text-slate-400 hover:text-pink-600 rounded-lg transition"
                          title="સુધારો"
                        >
                          <Edit2Icon size={15} />
                        </button>

                        <button
                          onClick={() => handleDeleteEvent(ev.id)}
                          className="p-1.5 text-slate-300 hover:text-red-500 rounded-lg transition"
                          title="કાઢી નાખો"
                        >
                          <Trash2Icon size={15} />
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
      {/* MODAL 1: RINGTONE & ALARM SOUND SETTINGS MODAL          */}
      {/* ======================================================= */}
      {isRingtoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                  <MusicIcon size={20} />
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-800">
                    {lang === 'gu' ? '🔔 એલાર્મ & રીંગટોન સેટિંગ્સ' : '🔔 Alarm & Ringtone Settings'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {lang === 'gu' ? 'કામો અને દવાઓ માટે મનપસંદ રિંગટોન પસંદ કરો' : 'Choose mobile ringtone for reminders'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  soundAlarm.stopAlarm();
                  setPreviewingRingtone(null);
                  setIsRingtoneModalOpen(false);
                }}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <XIcon size={18} />
              </button>
            </div>

            {/* Currently Selected Ringtone Banner */}
            <div className="bg-gradient-to-r from-purple-50 via-indigo-50 to-purple-50 border border-purple-200 rounded-2xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wide">
                  {lang === 'gu' ? 'હાલની સેટ કરેલી રિંગટોન' : 'Active Ringtone'}
                </span>
                <h4 className="text-sm font-black text-slate-800 mt-0.5">
                  {alarmSettings.ringtone === 'custom'
                    ? `📁 ${alarmSettings.customRingtoneName || 'મોબાઈલ ઓડિયો'}`
                    : getRingtoneDisplayName(alarmSettings.ringtone)}
                </h4>
              </div>
              <button
                onClick={() =>
                  handleTogglePreview(
                    alarmSettings.ringtone,
                    alarmSettings.customRingtoneData
                  )
                }
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
              >
                {previewingRingtone === alarmSettings.ringtone ? (
                  <>
                    <SquareIcon size={13} />
                    <span>{lang === 'gu' ? 'બંધ કરો' : 'Stop'}</span>
                  </>
                ) : (
                  <>
                    <PlayIcon size={13} />
                    <span>{lang === 'gu' ? 'સાંભળો' : 'Test'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Section 1: Built-in Melodic Ringtones */}
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 block">
                {lang === 'gu' ? '🎵 બિલ્ટ-ઇન રીંગટોન્સ (ઑફલાઇન)' : '🎵 Built-in Ringtones (Offline)'}
              </label>
              <div className="space-y-1.5">
                {RINGTONE_OPTIONS.filter((r) => r.id !== 'custom').map((opt) => {
                  const isSelected = alarmSettings.ringtone === opt.id;
                  const isPreviewing = previewingRingtone === opt.id;

                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectDefaultRingtone(opt.id)}
                      className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50/40 ring-1 ring-purple-400'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                        <span className="text-xl shrink-0">{opt.icon}</span>
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-slate-800 truncate">
                            {lang === 'gu' ? opt.nameGu : opt.nameEn}
                          </h5>
                          <p className="text-[10px] text-slate-500 truncate">
                            {opt.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {/* Preview play button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTogglePreview(opt.id);
                          }}
                          className={`p-2 rounded-xl transition ${
                            isPreviewing
                              ? 'bg-purple-600 text-white animate-pulse'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                          title="સાંભળો"
                        >
                          {isPreviewing ? <SquareIcon size={14} /> : <PlayIcon size={14} />}
                        </button>

                        {/* Selection check */}
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'bg-purple-600 border-purple-600 text-white'
                              : 'border-slate-300 text-transparent'
                          }`}
                        >
                          <CheckIcon size={12} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Custom Mobile Ringtone Upload */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs font-black text-slate-700 block">
                {lang === 'gu' ? '📁 તમારા મોબાઈલમાંથી રિંગટોન પસંદ કરો' : '📁 Custom Mobile Audio File'}
              </label>

              {alarmSettings.customRingtoneData ? (
                <div
                  onClick={() => handleSelectDefaultRingtone('custom')}
                  className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                    alarmSettings.ringtone === 'custom'
                      ? 'border-purple-500 bg-purple-50/40 ring-1 ring-purple-400'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0 pr-2">
                    <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                      <SmartphoneIcon size={18} />
                    </span>
                    <div className="min-w-0">
                      <h5 className="text-xs font-bold text-slate-800 truncate">
                        {alarmSettings.customRingtoneName || 'મોબાઈલ ઓડિયો ફાઈલ'}
                      </h5>
                      <span className="text-[10px] text-emerald-600 font-semibold">
                        {lang === 'gu' ? 'સફળતાપૂર્વક અપલોડ થયેલ' : 'Ready to play'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTogglePreview('custom', alarmSettings.customRingtoneData);
                      }}
                      className={`p-2 rounded-xl transition ${
                        previewingRingtone === 'custom'
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {previewingRingtone === 'custom' ? (
                        <SquareIcon size={14} />
                      ) : (
                        <PlayIcon size={14} />
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveCustomAudio();
                      }}
                      className="p-2 text-slate-400 hover:text-red-500 rounded-xl transition"
                      title="હટાવો"
                    >
                      <Trash2Icon size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-purple-200 hover:border-purple-400 rounded-2xl bg-purple-50/30 cursor-pointer transition text-center group">
                  <UploadIcon size={24} className="text-purple-600 mb-1 group-hover:scale-110 transition" />
                  <span className="text-xs font-bold text-purple-900">
                    {lang === 'gu' ? 'મોબાઈલ માંથી .mp3 / .wav / .m4a લાવો' : 'Upload MP3 / WAV from Phone'}
                  </span>
                  <span className="text-[10px] text-purple-600/80 mt-0.5">
                    {lang === 'gu' ? 'તમારું મનપસંદ ગીત કે રિંગટોન સેટ કરો (Max 5MB)' : 'Select your favorite tune (Max 5MB)'}
                  </span>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleUploadCustomRingtone}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Section 3: Volume & Vibration Controls */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <SlidersIcon size={14} className="text-purple-600" />
                  <span>{lang === 'gu' ? 'એલાર્મ અવાજ (Volume)' : 'Alarm Volume'}</span>
                </label>
                <span className="text-xs font-bold text-slate-600">
                  {Math.round((alarmSettings.volume ?? 1) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.2"
                max="1.0"
                step="0.1"
                value={alarmSettings.volume ?? 1}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">
                    {lang === 'gu' ? '📳 મોબાઈલ વાઇબ્રેશન (Vibration)' : '📳 Mobile Vibration'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={alarmSettings.vibrate ?? true}
                  onChange={handleToggleVibrate}
                  className="w-4 h-4 text-purple-600 rounded-sm cursor-pointer"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex gap-2">
              {onTriggerAlarm && (
                <button
                  type="button"
                  onClick={() => {
                    soundAlarm.stopAlarm();
                    setPreviewingRingtone(null);
                    onTriggerAlarm({
                      id: 'test-ringtone-' + Date.now(),
                      title: lang === 'gu' ? 'રીંગટોન ટેસ્ટ એલાર્મ' : 'Ringtone Test Alarm',
                      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                      type: 'task',
                      description: lang === 'gu' ? 'આ અવાજ અને રીંગટોન સાથે તમારું એલાર્મ વાગશે.' : 'This ringtone will play for your reminders.',
                      ringtone: alarmSettings.ringtone,
                      customAudioUrl: alarmSettings.customRingtoneData,
                      customRingtoneName: alarmSettings.customRingtoneName,
                    });
                    setIsRingtoneModalOpen(false);
                  }}
                  className="flex-1 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-purple-200"
                >
                  <Volume2Icon size={15} />
                  <span>{lang === 'gu' ? 'ફૂલ એલાર્મ ટેસ્ટ' : 'Test Full Alarm'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  soundAlarm.stopAlarm();
                  setPreviewingRingtone(null);
                  setIsRingtoneModalOpen(false);
                }}
                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/30 transition text-center"
              >
                {lang === 'gu' ? 'સાચવો અને બહાર નીકળો' : 'Done & Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL 2: ADD / EDIT TASK WITH ADVANCE DATE & RINGTONE   */}
      {/* ======================================================= */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-3.5 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="text-base font-bold text-slate-800">
                {editingReminder
                  ? (lang === 'gu' ? 'કામ સુધારો' : t('edit', lang))
                  : type === 'shopping'
                  ? (lang === 'gu' ? '🛒 નવી ખરીદી યાદી / ટાસ્ક' : '🛒 New Shopping Checklist')
                  : type === 'work'
                  ? (lang === 'gu' ? '💼 નવું કામ / ઓફિસ ટાસ્ક' : '💼 New Work / Office Task')
                  : (lang === 'gu' ? 'નવું કામ / મીટિંગ ઉમેરો' : t('new_task', lang))}
              </h3>
              <button
                onClick={() => {
                  soundAlarm.stopAlarm();
                  setPreviewingRingtone(null);
                  setIsTaskModalOpen(false);
                }}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <XIcon size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-3">
              {/* Task Title */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {type === 'shopping'
                    ? (lang === 'gu' ? 'ખરીદીનું નામ / વિષય *' : 'Shopping Title *')
                    : type === 'work'
                    ? (lang === 'gu' ? 'ઓફિસ / કામનું નામ *' : 'Work Task Name *')
                    : t('task_name_req', lang)}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    type === 'shopping'
                      ? (lang === 'gu' ? 'દા.ત. કરિયાણું, સુપરમાર્કેટ, શાકભાજી...' : 'e.g. Weekly Groceries, Market...')
                      : type === 'work'
                      ? (lang === 'gu' ? 'દા.ત. પ્રોજેક્ટ રિપોર્ટ, ફાઇલ સબમિશન...' : 'e.g. Project Report, Client Followup...')
                      : (lang === 'gu' ? 'દા.ત. બેંક વિઝિટ, ક્લાયન્ટ મીટિંગ...' : 'e.g. Bank visit, Client meeting...')
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-indigo-500 font-bold"
                  autoFocus
                />
              </div>

              {/* Type selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{t('type', lang)}</label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {[
                    { id: 'task', label: t('task', lang) },
                    { id: 'work', label: t('work_task', lang) || '💼 કામ' },
                    { id: 'shopping', label: t('shopping_task', lang) || '🛒 ખરીદી' },
                    { id: 'meeting', label: t('meeting', lang) },
                    { id: 'bank', label: t('bank_work', lang) },
                  ].map((tItem) => (
                    <button
                      type="button"
                      key={tItem.id}
                      onClick={() => setType(tItem.id)}
                      className={`py-2 px-1 rounded-xl text-[11px] font-bold border transition text-center truncate ${
                        type === tItem.id
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                      title={tItem.label}
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
                    +7 {lang === 'gu' ? 'દિવસ' : 'Days'}
                  </button>
                </div>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 font-bold"
                />
              </div>

              {/* Time & Priority Grid */}
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

              {/* Ringtone Selector for this Task */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <MusicIcon size={13} className="text-purple-600" />
                    <span>{lang === 'gu' ? 'આ કામની રીંગટોન' : 'Task Ringtone'}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const toneToPlay =
                        taskRingtone === 'default'
                          ? alarmSettings.ringtone
                          : taskRingtone;
                      const audioData =
                        toneToPlay === 'custom'
                          ? alarmSettings.customRingtoneData
                          : null;
                      handleTogglePreview(toneToPlay, audioData);
                    }}
                    className="text-[10px] font-bold text-purple-700 hover:text-purple-900 bg-purple-50 px-2 py-0.5 rounded-md flex items-center gap-1 transition"
                  >
                    {previewingRingtone ? (
                      <>
                        <SquareIcon size={10} />
                        <span>{lang === 'gu' ? 'બંધ કરો' : 'Stop'}</span>
                      </>
                    ) : (
                      <>
                        <PlayIcon size={10} />
                        <span>{lang === 'gu' ? 'સાંભળો' : 'Preview'}</span>
                      </>
                    )}
                  </button>
                </div>
                <select
                  value={taskRingtone}
                  onChange={(e) => setTaskRingtone(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 font-bold bg-white"
                >
                  <option value="default">
                    {lang === 'gu'
                      ? `🔔 ડિફોલ્ટ (${getRingtoneDisplayName(alarmSettings.ringtone)})`
                      : `🔔 Default (${getRingtoneDisplayName(alarmSettings.ringtone)})`}
                  </option>
                  {RINGTONE_OPTIONS.filter((r) => r.id !== 'custom').map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {lang === 'gu' ? opt.nameGu : opt.nameEn}
                    </option>
                  ))}
                  {alarmSettings.customRingtoneData && (
                    <option value="custom">
                      📁 {alarmSettings.customRingtoneName || 'મોબાઈલ ઓડિયો'}
                    </option>
                  )}
                </select>
              </div>

              {/* Repeat Frequency Option */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  <RepeatIcon size={12} className="inline mr-1 text-slate-500" />
                  {lang === 'gu' ? 'રીપીટ (વારંવારતા)' : 'Repeat Frequency'}
                </label>
                <select
                  value={taskRepeat}
                  onChange={(e) => setTaskRepeat(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-200 font-bold bg-white"
                >
                  <option value="none">{lang === 'gu' ? 'એક જ વાર (No repeat)' : 'Once'}</option>
                  <option value="daily">{lang === 'gu' ? 'દરરોજ (Daily)' : 'Daily'}</option>
                  <option value="weekly">{lang === 'gu' ? 'દર અઠવાડિયે (Weekly)' : 'Weekly'}</option>
                  <option value="monthly">{lang === 'gu' ? 'દર મહિને (Monthly)' : 'Monthly'}</option>
                </select>
              </div>

              {/* Checklist / Description */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    {type === 'shopping'
                      ? (lang === 'gu' ? 'ખરીદી યાદી / વિગત (ચેકલિસ્ટ)' : 'Shopping Items / Checklist')
                      : t('task_desc_label', lang)}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setDescription((prev) => (prev ? `${prev}\n☐ ` : '☐ '));
                    }}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded-md flex items-center gap-1 transition"
                  >
                    <CheckSquareIcon size={11} />
                    {lang === 'gu' ? '+ નવી આઇટમ (☐)' : '+ New Item (☐)'}
                  </button>
                </div>

                {/* Quick Suggestion Chips */}
                {type === 'shopping' && (
                  <div className="flex gap-1 overflow-x-auto pb-1.5 mb-1.5 no-scrollbar">
                    {quickShoppingItems.map((item, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => {
                          setDescription((prev) => (prev ? `${prev}\n☐ ${item}` : `☐ ${item}`));
                        }}
                        className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[10px] font-semibold whitespace-nowrap transition active:scale-95"
                      >
                        + {item}
                      </button>
                    ))}
                  </div>
                )}

                {type === 'work' && (
                  <div className="flex gap-1 overflow-x-auto pb-1.5 mb-1.5 no-scrollbar">
                    {quickWorkItems.map((item, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => {
                          setDescription((prev) => (prev ? `${prev}\n☐ ${item}` : `☐ ${item}`));
                        }}
                        className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-[10px] font-semibold whitespace-nowrap transition active:scale-95"
                      >
                        + {item}
                      </button>
                    ))}
                  </div>
                )}

                <textarea
                  rows={type === 'shopping' ? 4 : 3}
                  placeholder={
                    type === 'shopping'
                      ? '☐ દૂધ 1 લીટર\n☐ શાકભાજી (બટાટા, ડુંગળી)\n☐ કરિયાણું'
                      : type === 'work'
                      ? '☐ ક્લાયન્ટને કોલ કરવો\n☐ પ્રોજેક્ટ ફાઇલ સબમિટ કરવી'
                      : ''
                  }
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-indigo-500 font-mono leading-relaxed"
                />
              </div>

              {/* Sound Alarm Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="alarm-check"
                  checked={hasAlarm}
                  onChange={(e) => setHasAlarm(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded-sm cursor-pointer"
                />
                <label htmlFor="alarm-check" className="text-xs font-bold text-slate-700 cursor-pointer">
                  {t('sound_alarm_label', lang)}
                </label>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundAlarm.stopAlarm();
                    setPreviewingRingtone(null);
                    setIsTaskModalOpen(false);
                  }}
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
      {/* MODAL 3: ADD / EDIT BIRTHDAY & ANNIVERSARY              */}
      {/* ======================================================= */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="text-base font-bold text-slate-800">
                {editingEvent ? t('edit', lang) : t('add_event', lang)}
              </h3>
              <button
                onClick={() => setIsEventModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <XIcon size={18} />
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
