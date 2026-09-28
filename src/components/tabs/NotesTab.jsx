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
  Smile,
  Keyboard,
  Type,
  Copy,
  Bold,
  Italic,
  List,
  CornerDownLeft,
  Quote,
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
  const [fontFamily, setFontFamily] = useState('handwriting'); // 'handwriting', 'serif', 'sans', 'mono'
  const [fontSize, setFontSize] = useState('md'); // 'sm', 'md', 'lg', 'xl'
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showKeyboardHelper, setShowKeyboardHelper] = useState(false);
  const [selectedEmojiCat, setSelectedEmojiCat] = useState('smilies');
  const [copiedNoteId, setCopiedNoteId] = useState(null);
  const [isListening, setIsListening] = useState(false);

  const contentRef = useRef(null);
  const recognitionRef = useRef(null);

  // Categorized Emojis for Diary
  const emojiCategories = {
    smilies: {
      label: lang === 'gu' ? '😊 સ્માઈલી' : lang === 'hi' ? '😊 भाव/मुद्रा' : '😊 Smilies',
      emojis: ['😊', '🥰', '😍', '😇', '🤩', '😎', '😂', '🥺', '😴', '🥳', '😌', '🤔', '😭', '🤗', '🙌', '🙏', '💖', '✨'],
    },
    love: {
      label: lang === 'gu' ? '💖 લાગણી/પ્રેમ' : lang === 'hi' ? '💖 प्रेम/स्नेह' : '💖 Love',
      emojis: ['❤️', '💖', '💕', '🌹', '💐', '🎁', '💌', '💍', '🕊️', '🤝', '🎂', '🎉', '🌟', '💫', '👑', '💝', '🕯️', '🌸'],
    },
    nature: {
      label: lang === 'gu' ? '🌸 પ્રકૃતિ' : lang === 'hi' ? '🌸 प्रकृति' : '🌸 Nature',
      emojis: ['🌸', '🌺', '🌻', '🌿', '🍀', '🍃', '☀️', '🌙', '⭐', '🌧️', '🌈', '⛅', '🍁', '🌊', '🌴', '🍂', '🌾', '🍄'],
    },
    life: {
      label: lang === 'gu' ? '☕ જીવનશૈલી' : lang === 'hi' ? '☕ दिनचर्या' : '☕ Lifestyle',
      emojis: ['☕', '🍵', '🍎', '🍕', '🍫', '🎂', '🍦', '🧘', '🏃', '🚴', '📖', '🎶', '🎨', '🎬', '🛍️', '🍽️', '🏋️', '🎧'],
    },
    work: {
      label: lang === 'gu' ? '💡 આઈડિયા/કામ' : lang === 'hi' ? '💡 विचार/कार्य' : '💡 Ideas',
      emojis: ['💡', '📌', '📝', '📅', '🎯', '🚀', '🏆', '💰', '📈', '🔑', '🔔', '⚖️', '💻', '💼', '✅', '🔥', '📚', '🪙'],
    },
    travel: {
      label: lang === 'gu' ? '✈️ પ્રવાસ' : lang === 'hi' ? '✈️ यात्रा' : '✈️ Travel',
      emojis: ['✈️', '🚗', '🚂', '🏖️', '🏕️', '🏡', '🛕', '🚩', '🌄', '🌍', '📸', '🚢', '🗺️', '🏰', '⛺', '🛵', '🚍', '⛵'],
    },
  };

  const quickEmojiBar = ['😊', '❤️', '🙏', '🌸', '✨', '☕', '💡', '📝', '🎯', '🎉', '✈️', '🌟'];

  // Language-Adaptive Keyboard Helper Dataset
  const keyboardHelpers = {
    gu: {
      matras: [
        { label: 'ા', name: 'કાનો' },
        { label: 'િ', name: 'હ્રસ્વ ઇ' },
        { label: 'ી', name: 'દીર્ઘ ઈ' },
        { label: 'ુ', name: 'હ્રસ્વ ઉ' },
        { label: 'ૂ', name: 'દીર્ઘ ઊ' },
        { label: 'ૃ', name: 'ઋ' },
        { label: 'ે', name: 'એક માત્ર' },
        { label: 'ૈ', name: 'બે માત્ર' },
        { label: 'ો', name: 'કાનો-માત્ર' },
        { label: 'ૌ', name: 'કાનો-બે માત્ર' },
        { label: 'ં', name: 'અનુસ્વાર' },
        { label: 'ઃ', name: 'વિસર્ગ' },
        { label: '્', name: 'હલંત / જોડાક્ષર' },
        { label: 'ૐ', name: 'ઓમ' },
        { label: '₹', name: 'રૂપિયો' },
        { label: '।', name: 'પૂર્ણવિરામ' },
      ],
      vowels: ['અ', 'આ', 'ઇ', 'ઈ', 'ઉ', 'ઊ', 'એ', 'ઐ', 'ઓ', 'ઔ', 'ઋ'],
      conjuncts: ['ક્ષ', 'જ્ઞ', 'શ્ર', 'ત્ર', 'દ્વ', 'દ્ધ', 'દ્ભ', 'હ્મ'],
      consonants: [
        'ક', 'ખ', 'ગ', 'ઘ', 'ચ', 'છ', 'જ', 'ઝ',
        'ટ', 'ઠ', 'ડ', 'ઢ', 'ણ', 'ત', 'થ', 'દ',
        'ધ', 'ન', 'પ', 'ફ', 'બ', 'ભ', 'મ', 'ય',
        'ર', 'લ', 'વ', 'શ', 'ષ', 'સ', 'હ', 'ળ',
      ],
    },
    hi: {
      matras: [
        { label: 'ा', name: 'आ' },
        { label: 'ि', name: 'इ' },
        { label: 'ी', name: 'ई' },
        { label: 'ु', name: 'उ' },
        { label: 'ू', name: 'ऊ' },
        { label: 'ृ', name: 'ऋ' },
        { label: 'े', name: 'ए' },
        { label: 'ै', name: 'ऐ' },
        { label: 'ो', name: 'ओ' },
        { label: 'ौ', name: 'औ' },
        { label: 'ं', name: 'अनुस्वार' },
        { label: 'ँ', name: 'चन्द्रबिन्दु' },
        { label: 'ः', name: 'विसर्ग' },
        { label: '्', name: 'हलंत' },
        { label: 'ॐ', name: 'ओम' },
        { label: '₹', name: 'रुपया' },
        { label: '।', name: 'विराम' },
      ],
      vowels: ['अ', 'आ', 'इ', 'ई', 'उ', 'ऊ', 'ए', 'ऐ', 'ओ', 'औ', 'ऋ'],
      conjuncts: ['क्ष', 'त्र', 'ज्ञ', 'श्र', 'ड़', 'ढ़', 'द्व', 'द्ध'],
      consonants: [
        'क', 'ख', 'ग', 'घ', 'च', 'छ', 'ज', 'झ',
        'ट', 'ठ', 'ड', 'ढ', 'ण', 'त', 'थ', 'द',
        'ध', 'न', 'प', 'फ', 'ब', 'भ', 'म', 'य',
        'र', 'ल', 'व', 'श', 'ष', 'स', 'ह',
      ],
    },
    en: {
      symbols: ['“', '”', '‘', '’', '—', '…', '•', '★', '❤️', '₹', '$', '€', '£', '✓', '©', '®', '™'],
      accents: ['é', 'è', 'ê', 'ë', 'á', 'à', 'ä', 'ñ', 'í', 'ó', 'ö', 'ú', 'ü', 'ß', '¿', '¡'],
    },
    es: {
      symbols: ['¿', '¡', '“', '”', '—', '…', '•', '★', '❤️', '€', '$', '✓'],
      accents: ['á', 'é', 'í', 'ó', 'ú', 'ñ', 'Á', 'É', 'Í', 'Ó', 'Ú', 'Ñ', 'ü', 'Ü'],
    },
    fr: {
      symbols: ['«', '»', '“', '”', '—', '…', '•', '★', '❤️', '€', '$', '✓'],
      accents: ['é', 'è', 'ê', 'ë', 'à', 'â', 'ç', 'î', 'ï', 'ô', 'ù', 'û', 'ü', 'œ', 'æ'],
    },
    de: {
      symbols: ['„', '“', '«', '»', '—', '…', '•', '★', '❤️', '€', '$', '✓'],
      accents: ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'],
    },
    ar: {
      symbols: ['،', '؛', '؟', '«', '»', '•', '✨', '❤️', 'ﷺ', 'ﷻ', '٪'],
      matras: [
        { label: 'َ', name: 'فتحة' },
        { label: 'ً', name: 'تنوين فتح' },
        { label: 'ُ', name: 'ضمة' },
        { label: 'ٌ', name: 'تنوين ضم' },
        { label: 'ِ', name: 'كسرة' },
        { label: 'ٍ', name: 'تنوين كسر' },
        { label: 'ْ', name: 'سكون' },
        { label: 'ّ', name: 'شدة' },
      ],
    },
  };

  const fontOptions = [
    { id: 'handwriting', label: t('font_handwriting', lang), fontClass: 'font-handwriting', preview: '✍️' },
    { id: 'serif', label: t('font_serif', lang), fontClass: 'font-serif-diary', preview: '📖' },
    { id: 'sans', label: t('font_sans', lang), fontClass: 'font-sans-diary', preview: '📱' },
    { id: 'mono', label: t('font_mono', lang), fontClass: 'font-mono-diary', preview: '⌨️' },
  ];

  const fontSizeOptions = [
    { id: 'sm', label: 'A-', title: 'Small' },
    { id: 'md', label: 'A', title: 'Normal' },
    { id: 'lg', label: 'A+', title: 'Large' },
    { id: 'xl', label: 'A++', title: 'Extra Large' },
  ];

  // Helper to insert character / emoji at textarea cursor
  const insertAtCursor = (str) => {
    const textarea = contentRef.current;
    if (!textarea) {
      setContent((prev) => prev + str);
      return;
    }
    const start = textarea.selectionStart ?? content.length;
    const end = textarea.selectionEnd ?? content.length;
    const newContent = content.substring(0, start) + str + content.substring(end);
    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + str.length, start + str.length);
    }, 0);
  };

  // Helper to wrap selected text in markdown styling
  const wrapSelectedText = (prefix, suffix = prefix) => {
    const textarea = contentRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? 0;
    const selected = content.substring(start, end);
    const replacement = prefix + (selected || '') + suffix;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      const cursorTarget = selected ? start + replacement.length : start + prefix.length;
      textarea.setSelectionRange(cursorTarget, cursorTarget);
    }, 0);
  };

  // Copy note content
  const handleCopyNote = (note) => {
    const textToCopy = `${note.title ? note.title + '\n\n' : ''}${note.content}`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedNoteId(note.id);
      setTimeout(() => setCopiedNoteId(null), 2000);
    });
  };

  // Speech Recognition Setup
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
          if (event.results[i].isFinal) {
            currentTranscript += event.results[i][0].transcript;
          }
        }
        if (currentTranscript.trim()) {
          setContent((prev) => (prev ? prev.trim() + ' ' : '') + currentTranscript.trim() + ' ');
        }
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
          ? 'आपके ब्राउज़र में वॉयस टाइपिंग समर्थित नहीं है। क्रोम या सफारी का उपयोग करें।'
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
    setFontFamily('handwriting');
    setFontSize('md');
    setShowEmojiPicker(false);
    setShowKeyboardHelper(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category);
    setNoteDate(note.date || todayStr);
    setIsPinned(note.isPinned);
    setFontFamily(note.fontFamily || 'sans');
    setFontSize(note.fontSize || 'md');
    setShowEmojiPicker(false);
    setShowKeyboardHelper(false);
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
              fontFamily,
              fontSize,
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
        fontFamily,
        fontSize,
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
  const activeHelper = keyboardHelpers[lang] || keyboardHelpers.gu;

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

            // Compute font class
            const fontClass =
              note.fontFamily === 'handwriting'
                ? 'font-handwriting text-slate-800'
                : note.fontFamily === 'serif'
                ? 'font-serif-diary text-slate-900'
                : note.fontFamily === 'mono'
                ? 'font-mono-diary text-slate-800'
                : 'font-sans-diary text-slate-700';

            const sizeClass =
              note.fontSize === 'sm'
                ? 'text-xs'
                : note.fontSize === 'lg'
                ? 'text-base'
                : note.fontSize === 'xl'
                ? 'text-lg'
                : 'text-sm';

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

                      {/* Typography tag */}
                      {note.fontFamily && note.fontFamily !== 'sans' && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold border border-amber-200/60">
                          {note.fontFamily === 'handwriting' ? '✍️ હસ્તલિખિત' : note.fontFamily === 'serif' ? '📖 ક્લાસિક' : '⌨️ ટાઈપરાઈટર'}
                        </span>
                      )}
                    </div>

                    <h3 className={`text-sm font-bold text-slate-900 leading-snug ${note.fontFamily === 'serif' ? 'font-serif-diary' : ''}`}>
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
                      onClick={() => handleCopyNote(note)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      title={t('copy_content', lang)}
                    >
                      {copiedNoteId === note.id ? <Check size={15} className="text-emerald-600" /> : <Copy size={15} />}
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

                {/* Content with user-chosen typography */}
                <p className={`leading-relaxed whitespace-pre-wrap ${fontClass} ${sizeClass}`}>
                  {note.content}
                </p>
              </div>
            );
          })
        )}
      </div>

      {/* ======================================================= */}
      {/* NOTE ADD / EDIT MODAL WITH FONTS, EMOJIS & KEYBOARD     */}
      {/* ======================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-4 sm:p-5 max-w-lg w-full shadow-2xl space-y-3.5 animate-in fade-in zoom-in-95 my-auto max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-xl bg-blue-100 text-blue-700">
                  <BookOpen size={18} />
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  {editingNote ? t('edit_note', lang) : t('new_note_advance', lang)}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3">
              {/* Note Scheduled Date */}
              <div className="p-2.5 bg-blue-50/70 rounded-2xl border border-blue-200/80">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                    <Calendar size={13} className="text-blue-600" />
                    <span>{t('note_date', lang)}:</span>
                  </label>
                  {noteDate > todayStr && (
                    <span className="text-[10px] text-indigo-700 font-bold bg-indigo-100/80 px-2 py-0.5 rounded-md">
                      ✨ {t('advance', lang)}
                    </span>
                  )}
                </div>
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
                    className="px-2.5 py-2 rounded-xl bg-blue-100 text-blue-800 font-bold text-xs hover:bg-blue-200 transition"
                  >
                    {t('today', lang)}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const tom = new Date(Date.now() + 86400000).toISOString().split('T')[0];
                      setNoteDate(tom);
                    }}
                    className="px-2.5 py-2 rounded-xl bg-indigo-100 text-indigo-800 font-bold text-xs hover:bg-indigo-200 transition"
                  >
                    {t('tomorrow', lang)}
                  </button>
                </div>
              </div>

              {/* Title & Category Row */}
              <div className="space-y-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">{t('note_title', lang)}</label>
                  <input
                    type="text"
                    lang={lang === 'gu' ? 'gu-IN' : lang === 'hi' ? 'hi-IN' : lang}
                    inputMode="text"
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
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isPinned}
                        onChange={(e) => setIsPinned(e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                      />
                      <span>{t('pin_to_top', lang)}</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* ======================================================= */}
              {/* TYPOGRAPHY, FONT STYLE & FORMATTING TOOLBAR             */}
              {/* ======================================================= */}
              <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <Type size={14} className="text-indigo-600" />
                    <span>{t('font_style', lang)}:</span>
                  </span>

                  {/* Font Size Pills (A-, A, A+, A++) */}
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
                    {fontSizeOptions.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setFontSize(opt.id)}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                          fontSize === opt.id
                            ? 'bg-blue-600 text-white shadow-2xs'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                        title={opt.title}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Choices (Handwriting, Serif, Sans, Mono) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {fontOptions.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFontFamily(f.id)}
                      className={`p-2 rounded-xl text-left border transition text-xs flex items-center gap-1.5 ${
                        fontFamily === f.id
                          ? 'bg-blue-50 border-blue-400 text-blue-900 font-bold ring-2 ring-blue-100'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-base">{f.preview}</span>
                      <span className={`truncate ${f.fontClass}`}>{f.label}</span>
                    </button>
                  ))}
                </div>

                {/* Markdown Formatting quick buttons */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => wrapSelectedText('**')}
                      className="p-1.5 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-700 font-extrabold text-xs"
                      title="Bold (**text**)"
                    >
                      <Bold size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => wrapSelectedText('*')}
                      className="p-1.5 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-700 italic text-xs"
                      title="Italic (*text*)"
                    >
                      <Italic size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertAtCursor('\n• ')}
                      className="p-1.5 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-700 text-xs"
                      title="Bullet point"
                    >
                      <List size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertAtCursor('\n> ')}
                      className="p-1.5 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-700 text-xs"
                      title="Quote"
                    >
                      <Quote size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertAtCursor('\n')}
                      className="px-2 py-1 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-0.5"
                      title={t('new_line', lang)}
                    >
                      <CornerDownLeft size={11} />
                      <span>{t('new_line', lang)}</span>
                    </button>
                  </div>

                  {/* Clean text button */}
                  {content.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(lang === 'gu' ? 'શું લખાણ સાફ કરવું છે?' : 'Clear note content?')) {
                          setContent('');
                        }
                      }}
                      className="text-[11px] font-semibold text-rose-600 hover:underline px-1"
                    >
                      {t('clear_text', lang)}
                    </button>
                  )}
                </div>
              </div>

              {/* ======================================================= */}
              {/* EMOJI & KEYBOARD ASSISTANT TOGGLES                      */}
              {/* ======================================================= */}
              <div className="flex items-center justify-between gap-1 text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEmojiPicker(!showEmojiPicker);
                      if (!showEmojiPicker) setShowKeyboardHelper(false);
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold transition border ${
                      showEmojiPicker
                        ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Smile size={14} className="text-amber-500" />
                    <span>{t('quick_emojis', lang)}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowKeyboardHelper(!showKeyboardHelper);
                      if (!showKeyboardHelper) setShowEmojiPicker(false);
                    }}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold transition border ${
                      showKeyboardHelper
                        ? 'bg-indigo-100 border-indigo-300 text-indigo-900 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Keyboard size={14} className="text-indigo-600" />
                    <span>{t('keyboard_helper', lang)}</span>
                  </button>
                </div>

                {/* Voice Typing Button */}
                <button
                  type="button"
                  onClick={toggleVoiceRecording}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 shadow-2xs ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse ring-2 ring-red-300'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                  <span>{isListening ? t('listening', lang) : t('voice_typing', lang)}</span>
                </button>
              </div>

              {/* Quick Emojis Horizontal Strip */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none bg-slate-50/80 p-1.5 rounded-xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold px-1 shrink-0">✨ 1-Tap:</span>
                {quickEmojiBar.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => insertAtCursor(emoji)}
                    className="p-1 px-2 bg-white hover:bg-amber-50 border border-slate-200/80 rounded-lg text-sm transition shrink-0 active:scale-90"
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Expandable Full Emoji Drawer */}
              {showEmojiPicker && (
                <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-2 animate-in fade-in zoom-in-95">
                  <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                    {Object.keys(emojiCategories).map((catKey) => (
                      <button
                        key={catKey}
                        type="button"
                        onClick={() => setSelectedEmojiCat(catKey)}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                          selectedEmojiCat === catKey
                            ? 'bg-amber-600 text-white shadow-2xs'
                            : 'bg-white text-slate-600 border border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        {emojiCategories[catKey].label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-6 sm:grid-cols-9 gap-1.5 p-2 bg-white rounded-xl border border-amber-200/70 max-h-36 overflow-y-auto">
                    {emojiCategories[selectedEmojiCat]?.emojis.map((emoji, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => insertAtCursor(emoji)}
                        className="h-9 flex items-center justify-center text-lg hover:bg-amber-50 rounded-lg transition active:scale-90"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Expandable Smart Language Keyboard Bar (કાનો-માત્રા & સ્વરો) */}
              {showKeyboardHelper && (
                <div className="p-3 bg-indigo-50/70 rounded-2xl border border-indigo-200 space-y-2 animate-in fade-in zoom-in-95">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-indigo-900 flex items-center gap-1">
                      <Keyboard size={13} className="text-indigo-600" />
                      <span>{t('matra_helper', lang)} ({lang.toUpperCase()}):</span>
                    </span>
                    <span className="text-[10px] text-indigo-600 font-semibold">
                      {lang === 'gu' ? 'અક્ષર પાછળ માત્રા જોડવા ક્લિક કરો' : 'अक्षर के साथ मात्रा जोड़ें'}
                    </span>
                  </div>

                  {/* Matras row */}
                  {activeHelper.matras && (
                    <div className="flex flex-wrap gap-1 bg-white p-2 rounded-xl border border-indigo-200/70">
                      {activeHelper.matras.map((m, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => insertAtCursor(m.label)}
                          className="min-w-[34px] h-8 px-2 flex items-center justify-center text-sm font-extrabold bg-indigo-50/70 hover:bg-indigo-600 hover:text-white rounded-lg border border-indigo-100 transition active:scale-90"
                          title={m.name}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Vowels & Conjuncts */}
                  {activeHelper.vowels && (
                    <div className="flex flex-wrap gap-1 bg-white p-2 rounded-xl border border-indigo-200/70">
                      <span className="text-[10px] font-bold text-slate-400 w-full mb-0.5">
                        {lang === 'gu' ? 'મુખ્ય સ્વરો & જોડાક્ષરો:' : 'स्वर व संयुक्त वर्ण:'}
                      </span>
                      {activeHelper.vowels.map((v, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => insertAtCursor(v)}
                          className="min-w-[32px] h-7 px-1.5 flex items-center justify-center text-xs font-bold bg-slate-50 hover:bg-blue-600 hover:text-white rounded-lg border border-slate-200 transition active:scale-90"
                        >
                          {v}
                        </button>
                      ))}
                      {activeHelper.conjuncts &&
                        activeHelper.conjuncts.map((c, idx) => (
                          <button
                            key={'c-' + idx}
                            type="button"
                            onClick={() => insertAtCursor(c)}
                            className="min-w-[32px] h-7 px-1.5 flex items-center justify-center text-xs font-bold bg-amber-50 hover:bg-amber-600 hover:text-white text-amber-900 rounded-lg border border-amber-200 transition active:scale-90"
                          >
                            {c}
                          </button>
                        ))}
                    </div>
                  )}

                  {/* Consonants (Pills) */}
                  {activeHelper.consonants && (
                    <div className="flex flex-wrap gap-1 bg-white p-2 rounded-xl border border-indigo-200/70 max-h-28 overflow-y-auto">
                      <span className="text-[10px] font-bold text-slate-400 w-full mb-0.5">
                        {lang === 'gu' ? 'વ્યંજનો:' : 'व्यंजन:'}
                      </span>
                      {activeHelper.consonants.map((k, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => insertAtCursor(k)}
                          className="w-7 h-7 flex items-center justify-center text-xs font-bold bg-slate-50 hover:bg-indigo-600 hover:text-white rounded-lg border border-slate-200 transition active:scale-90"
                        >
                          {k}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Symbols & Accents for English / Other languages */}
                  {activeHelper.symbols && (
                    <div className="flex flex-wrap gap-1 bg-white p-2 rounded-xl border border-indigo-200/70">
                      {activeHelper.symbols.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => insertAtCursor(s)}
                          className="min-w-[32px] h-8 px-2 flex items-center justify-center text-sm font-bold bg-slate-50 hover:bg-indigo-600 hover:text-white rounded-lg border border-slate-200 transition active:scale-90"
                        >
                          {s}
                        </button>
                      ))}
                      {activeHelper.accents &&
                        activeHelper.accents.map((a, idx) => (
                          <button
                            key={'acc-' + idx}
                            type="button"
                            onClick={() => insertAtCursor(a)}
                            className="min-w-[32px] h-8 px-2 flex items-center justify-center text-sm font-bold bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-lg border border-indigo-200 transition active:scale-90"
                          >
                            {a}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* Voice Typing Active Indicator */}
              {isListening && (
                <div className="p-2.5 bg-red-50 rounded-2xl border border-red-200 flex items-center justify-between gap-2 animate-pulse">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                    <span className="text-xs font-bold text-red-700">{t('voice_instruction', lang)}</span>
                  </div>
                  <button
                    type="button"
                    onClick={toggleVoiceRecording}
                    className="text-xs font-bold text-red-600 hover:underline px-2 py-1 rounded bg-white border border-red-200"
                  >
                    ⏹️ {lang === 'gu' ? 'રોકો' : 'Stop'}
                  </button>
                </div>
              )}

              {/* Note Content Textarea with Dynamic Typography */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{t('note_content', lang)}</label>
                <textarea
                  ref={contentRef}
                  rows={7}
                  lang={lang === 'gu' ? 'gu-IN' : lang === 'hi' ? 'hi-IN' : lang}
                  inputMode="text"
                  autoCapitalize="sentences"
                  autoCorrect="on"
                  spellCheck="true"
                  placeholder={t('note_content_placeholder', lang)}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className={`w-full p-3.5 rounded-2xl border border-slate-200 focus:outline-blue-500 transition leading-relaxed shadow-inner ${
                    fontFamily === 'handwriting'
                      ? 'font-handwriting text-slate-800'
                      : fontFamily === 'serif'
                      ? 'font-serif-diary text-slate-900'
                      : fontFamily === 'mono'
                      ? 'font-mono-diary text-slate-800'
                      : 'font-sans-diary text-slate-700'
                  } ${
                    fontSize === 'sm'
                      ? 'text-xs'
                      : fontSize === 'lg'
                      ? 'text-base'
                      : fontSize === 'xl'
                      ? 'text-lg'
                      : 'text-sm'
                  }`}
                />
              </div>

              {/* Modal Action Buttons */}
              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50 transition"
                >
                  {t('cancel', lang)}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
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
