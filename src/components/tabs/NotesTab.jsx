import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  Pin,
  Trash2,
  Edit3,
  X,
  Check,
  BookOpen,
  Mic,
  MicOff,
  Calendar,
  Sparkles,
  Clock,
  Tag,
  Share2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { t, getNoteCategories } from '../../services/i18n';
import { whatsappService } from '../../services/whatsappService';

export default function NotesTab({ notes = [], onSaveNotes, lang = 'gu' }) {
  const noteCategories = getNoteCategories(lang);
  const todayStr = new Date().toISOString().split('T')[0];
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState(noteCategories[0]);
  const [dateFilterMode, setDateFilterMode] = useState('all'); // 'all', 'today', 'future', 'by_date'
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(noteCategories[1] || 'Personal');
  const [noteDate, setNoteDate] = useState(todayStr);
  const [isPinned, setIsPinned] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      const voiceLangMap = {
        gu: 'gu-IN',
        hi: 'hi-IN',
        en: 'en-US',
        es: 'es-ES',
        fr: 'fr-FR',
        de: 'de-DE',
        ar: 'ar-SA',
      };
      recognition.lang = voiceLangMap[lang] || 'gu-IN';

      recognition.onresult = (event) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setContent((prev) => (prev ? prev + ' ' : '') + currentTranscript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [lang]);

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      alert(
        lang === 'gu'
          ? 'તમારા બ્રાઉઝરમાં વોઇસ ટાઇપિંગ સપોર્ટ નથી. ક્રોમ કે સફારી વાપરો.'
          : lang === 'hi'
          ? 'आपके ब्राउज़र में वॉयस टाइपिंग समर्थित नहीं है।'
          : 'Voice typing is not supported on this browser. Please use Chrome or Safari.'
      );
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch {
        setIsListening(false);
      }
    }
  };

  const handleOpenAdd = (targetDate = todayStr) => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setCategory(noteCategories[1] || 'Personal');
    setNoteDate(targetDate);
    setIsPinned(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category);
    setNoteDate(note.date || todayStr);
    setIsPinned(note.isPinned);
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    const defaultTitle = t('untitled_note', lang) || 'Note';

    if (editingNote) {
      const updated = notes.map((n) =>
        n.id === editingNote.id
          ? {
              ...n,
              title: title || defaultTitle,
              content,
              category,
              date: noteDate,
              isPinned,
              updatedAt: new Date().toISOString(),
            }
          : n
      );
      onSaveNotes(updated);
    } else {
      const newNote = {
        id: 'note-' + Date.now(),
        title: title || defaultTitle,
        content,
        category,
        date: noteDate,
        isPinned,
        color: '#eff6ff',
        createdAt: new Date().toISOString(),
      };
      onSaveNotes([newNote, ...notes]);
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm(t('delete_note_confirm', lang))) {
      onSaveNotes(notes.filter((n) => n.id !== id));
    }
  };

  const handleTogglePin = (id) => {
    const updated = notes.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n));
    onSaveNotes(updated);
  };

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    // Search
    const matchesSearch =
      n.title?.toLowerCase().includes(search.toLowerCase()) ||
      n.content?.toLowerCase().includes(search.toLowerCase());

    // Category
    const isAll = selectedCat === noteCategories[0] || selectedCat === 'All' || selectedCat === 'બધા';
    const matchesCategory = isAll || n.category === selectedCat;

    // Date Filter
    let matchesDate = true;
    if (dateFilterMode === 'today') {
      matchesDate = n.date === todayStr;
    } else if (dateFilterMode === 'future') {
      matchesDate = n.date > todayStr;
    } else if (dateFilterMode === 'by_date') {
      matchesDate = n.date === selectedDate;
    }

    return matchesSearch && matchesCategory && matchesDate;
  });

  // Sort pinned first, then by date descending
  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt);
  });

  const futureCount = notes.filter((n) => n.date > todayStr).length;

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-5 text-white shadow-md shadow-blue-500/15 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md">
              <BookOpen size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{t('notes_title', lang)}</h2>
              <p className="text-xs text-blue-100">{t('notes_sub', lang)}</p>
            </div>
          </div>
          <button
            onClick={() => handleOpenAdd(todayStr)}
            className="flex items-center gap-1 bg-white hover:bg-blue-50 text-blue-700 px-3.5 py-2 rounded-2xl text-xs font-bold shadow-md active:scale-95 transition"
          >
            <Plus size={16} />
            <span>{t('btn_new_note', lang)}</span>
          </button>
        </div>

        {/* Date Quick Stats */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/20 text-center">
          <div className="bg-white/10 rounded-xl p-2 backdrop-blur-xs">
            <span className="text-[10px] text-blue-200 block">{t('total_notes', lang)}</span>
            <span className="text-sm font-extrabold">{notes.length}</span>
          </div>
          <div className="bg-white/10 rounded-xl p-2 backdrop-blur-xs">
            <span className="text-[10px] text-blue-200 block">{t('today_notes', lang)}</span>
            <span className="text-sm font-extrabold">{notes.filter((n) => n.date === todayStr).length}</span>
          </div>
          <div className="bg-white/10 rounded-xl p-2 backdrop-blur-xs">
            <span className="text-[10px] text-cyan-200 block">{t('advance_notes', lang)}</span>
            <span className="text-sm font-extrabold text-cyan-300">{futureCount}</span>
          </div>
        </div>
      </div>

      {/* Date Filter Tabs (Today, Upcoming/Advance, All, Pick Date) */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex items-center justify-between gap-1 overflow-x-auto scrollbar-none text-xs">
          <button
            onClick={() => setDateFilterMode('all')}
            className={`py-1.5 px-3 rounded-xl font-bold whitespace-nowrap transition ${
              dateFilterMode === 'all'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t('filter_all', lang)} ({notes.length})
          </button>

          <button
            onClick={() => setDateFilterMode('today')}
            className={`py-1.5 px-3 rounded-xl font-bold whitespace-nowrap transition ${
              dateFilterMode === 'today'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t('filter_today', lang)}
          </button>

          <button
            onClick={() => setDateFilterMode('future')}
            className={`py-1.5 px-3 rounded-xl font-bold whitespace-nowrap transition ${
              dateFilterMode === 'future'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t('filter_future', lang)} ({futureCount})
          </button>

          <button
            onClick={() => setDateFilterMode('by_date')}
            className={`py-1.5 px-3 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1 ${
              dateFilterMode === 'by_date'
                ? 'bg-cyan-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Calendar size={13} />
            <span>{t('by_date', lang)}</span>
          </button>
        </div>

        {/* Date picker if 'by_date' is selected */}
        {dateFilterMode === 'by_date' && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <span className="text-xs text-slate-500 font-semibold">{t('select_date_label', lang)}</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-bold p-1.5 rounded-xl border border-slate-200 bg-slate-50"
            />
            <button
              onClick={() => handleOpenAdd(selectedDate)}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              {t('add_note_on_date', lang)}
            </button>
          </div>
        )}
      </div>

      {/* Search & Category Chips Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder={t('search_notes', lang)}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs placeholder:text-slate-400 focus:outline-blue-500 shadow-2xs"
          />
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {noteCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCat === cat
                  ? 'bg-slate-800 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      <div className="space-y-3">
        {sortedNotes.length === 0 ? (
          <div className="text-center py-14 bg-white rounded-3xl border border-dashed border-slate-300 p-6">
            <BookOpen size={40} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-600">{t('no_notes_found', lang)}</p>
            <p className="text-xs text-slate-400 mt-1">{t('no_notes_found_sub', lang)}</p>
            <button
              onClick={() => handleOpenAdd(dateFilterMode === 'by_date' ? selectedDate : todayStr)}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
            >
              {t('add_new_note', lang)}
            </button>
          </div>
        ) : (
          sortedNotes.map((note) => {
            const isFuture = note.date > todayStr;
            const isToday = note.date === todayStr;

            return (
              <div
                key={note.id}
                className={`bg-white rounded-2xl p-4 border transition-all shadow-xs space-y-2 relative overflow-hidden ${
                  note.isPinned ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Note Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                        {note.category}
                      </span>

                      {/* Advance Date Badge */}
                      {isFuture && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 flex items-center gap-1">
                          <Calendar size={11} />
                          {t('advance_badge', lang)}: {note.date}
                        </span>
                      )}

                      {isToday && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                          {t('today_notes', lang)}
                        </span>
                      )}

                      {!isToday && !isFuture && note.date && (
                        <span className="text-[10px] font-semibold text-slate-400">
                          {note.date}
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {note.title}
                    </h3>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleTogglePin(note.id)}
                      className={`p-1.5 rounded-lg transition ${
                        note.isPinned
                          ? 'bg-amber-100 text-amber-700'
                          : 'text-slate-300 hover:text-slate-600'
                      }`}
                      title={note.isPinned ? t('unpin', lang) : t('pin', lang)}
                    >
                      <Pin size={15} className={note.isPinned ? 'fill-current' : ''} />
                    </button>
                    <button
                      onClick={() => whatsappService.shareNote(note, lang)}
                      className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                      title={t('share_whatsapp', lang)}
                    >
                      <Share2 size={15} />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(note)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg transition"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {note.content}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* ======================================================= */}
      {/* NOTE ADD / EDIT MODAL WITH ADVANCE DATE PICKER          */}
      {/* ======================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="text-base font-bold text-slate-800">
                {editingNote ? t('edit_note', lang) : t('new_note_advance', lang)}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              {/* Note Scheduled Date (Allows Future / Advance Date) */}
              <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-200/80">
                <label className="text-xs font-bold text-blue-900 flex items-center gap-1.5 mb-1.5">
                  <Calendar size={14} className="text-blue-600" />
                  <span>{t('note_date', lang)}:</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    required
                    value={noteDate}
                    onChange={(e) => setNoteDate(e.target.value)}
                    className="flex-1 text-xs font-bold p-2 rounded-xl border border-blue-200 bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setNoteDate(todayStr)}
                    className="px-2.5 py-2 rounded-xl bg-blue-100 text-blue-800 font-bold text-xs"
                  >
                    {t('today', lang)}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const tom = new Date(Date.now() + 86400000).toISOString().split('T')[0];
                      setNoteDate(tom);
                    }}
                    className="px-2.5 py-2 rounded-xl bg-indigo-100 text-indigo-800 font-bold text-xs"
                  >
                    {t('tomorrow', lang)}
                  </button>
                </div>
                {noteDate > todayStr && (
                  <p className="text-[10px] text-indigo-700 font-bold mt-1.5">
                    ✨ {lang === 'gu' ? `આ એડવાન્સ નોંધ છે, જે ${noteDate} ના ભવિષ્યના આયોજન માટે રહેશે.` : (lang === 'hi' ? `यह आगामी नोट है जो ${noteDate} की भविष्य योजना के लिए रहेगा।` : `✨ Advance note scheduled for ${noteDate}.`)}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{t('note_title', lang)}</label>
                <input
                  type="text"
                  placeholder={t('note_title_placeholder', lang)}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-blue-500 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">{t('category', lang)}</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                  >
                    {noteCategories.slice(1).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end pt-5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPinned}
                      onChange={(e) => setIsPinned(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600"
                    />
                    <span>{t('pin_to_top', lang)}</span>
                  </label>
                </div>
              </div>

              {/* Content with Voice Typing */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">{t('note_content', lang)}</label>
                  <button
                    type="button"
                    onClick={toggleVoiceRecording}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition active:scale-95 ${
                      isListening
                        ? 'bg-red-500 text-white animate-pulse'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isListening ? <MicOff size={13} /> : <Mic size={13} />}
                    <span>{isListening ? t('listening', lang) : t('voice_typing', lang)}</span>
                  </button>
                </div>
                <textarea
                  rows={5}
                  placeholder={t('note_content_placeholder', lang)}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-blue-500 leading-relaxed"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
    </div>
  );
}
