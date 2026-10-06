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
  Type,
  Copy,
  Bold,
  Italic,
  List,
  CornerDownLeft,
  Quote,
  Image as ImageIcon,
  MapPin,
  Volume2,
  Download,
  Flame,
  Bell,
  ChevronLeft,
  ChevronRight,
  Eye,
  Lock,
  ShoppingCart,
  Briefcase,
  CheckSquare,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { t, getNoteCategories } from '../../services/i18n';
import { whatsappService } from '../../services/whatsappService';
import { streakService, MOODS } from '../../services/streakService';
import { storageService } from '../../services/storageService';
import { generateMonthlyReportPDF } from '../../services/pdfReportService';
import { notificationService } from '../../services/notificationService';
import { downloadOrSharePDF } from '../../services/fileDownloadService';

export default function NotesTab({
  notes = [],
  onSaveNotes,
  lang = 'gu',
  user,
  isDemoMode,
  onClearDemo,
  checkCanAdd,
}) {
  const noteCategories = getNoteCategories(lang);
  const todayStr = new Date().toISOString().split('T')[0];

  // View state: 'list', 'calendar', 'timeline'
  const [viewMode, setViewMode] = useState('list');
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState(noteCategories[0]);
  const [dateFilterMode, setDateFilterMode] = useState('all'); // 'all', 'today', 'future', 'by_date'
  const [selectedDate, setSelectedDate] = useState(todayStr);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [isMoodModalOpen, setIsMoodModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isPdfExportOpen, setIsPdfExportOpen] = useState(false);
  const [activePhotoPreview, setActivePhotoPreview] = useState(null);

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(noteCategories[1] || 'Personal');
  const [noteDate, setNoteDate] = useState(todayStr);
  const [isPinned, setIsPinned] = useState(false);
  const [fontFamily, setFontFamily] = useState('handwriting');
  const [fontSize, setFontSize] = useState('md');
  const [mood, setMood] = useState('good');
  const [photo, setPhoto] = useState('');
  const [location, setLocation] = useState('');
  const [audio, setAudio] = useState('');

  // Toggles inside Form
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showPromptsDrawer, setShowPromptsDrawer] = useState(false);
  const [selectedEmojiCat, setSelectedEmojiCat] = useState('smilies');
  const [copiedNoteId, setCopiedNoteId] = useState(null);
  const [isListening, setIsListening] = useState(false);

  // Dedicated Category Helpers for Shopping and Work/Tasks
  const isShopping = ['ખરીદી', 'Shopping', 'खरीदारी', 'Compras', 'Achats', 'Einkaufen', 'تسوق'].includes(category);
  const isWork = ['કામ', 'Work', 'काम', 'Trabajo', 'Travail', 'Arbeit', 'العمل'].includes(category);
  const isShoppingOrWork = isShopping || isWork;

  // Audio Recording State
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Diary Reminder Settings
  const [reminderConfig, setReminderConfig] = useState(() => storageService.getDiaryReminderConfig());

  // PDF Export Modal State
  const [exportMonth, setExportMonth] = useState('all');
  const [pdfPassword, setPdfPassword] = useState('');
  const [usePdfPassword, setUsePdfPassword] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  // Calendar State
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calYear, setCalYear] = useState(new Date().getFullYear());

  const contentRef = useRef(null);
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);

  // Streak Information
  const streakData = streakService.getStreakData();
  const streakBadge = streakService.getBadge(streakData.currentStreak);

  // Weekly Mood Analysis
  const weeklyMood = streakService.getWeeklyMoodAnalysis(notes, lang);

  // AI Prompts / Questions
  const aiPromptsList = [
    {
      q: lang === 'gu' ? '🌟 આજે દિવસનો શ્રેષ્ઠ અને ખુશીભર્યો અનુભવ કયો હતો?' : lang === 'hi' ? '🌟 आज दिन का सबसे अच्छा और खुशी भरा अनुभव कौन सा था?' : '🌟 What was the best moment of your day today?',
      category: 'આનંદ',
    },
    {
      q: lang === 'gu' ? '🙏 આજે તમે કોનો અને કઈ બાબત માટે આભાર માનવા માંગો છો?' : lang === 'hi' ? '🙏 आज आप किसका और किस बात के लिए आभार व्यक्त करना चाहते हैं?' : '🙏 Who and what are you most grateful for today?',
      category: 'કૃતજ્ઞતા',
    },
    {
      q: lang === 'gu' ? '🧠 આજે તમે નવું શું શીખ્યા, વાંચ્યું કે વિચાર્યું?' : lang === 'hi' ? '🧠 आज आपने नया क्या सीखा, पढ़ा या सोचा?' : '🧠 What new thing did you learn or discover today?',
      category: 'જ્ઞાન',
    },
    {
      q: lang === 'gu' ? '🎯 આજના કયા કામ કે સફળતા પર તમને સૌથી વધુ ગર્વ છે?' : lang === 'hi' ? '🎯 आज के किस कार्य या उपलब्धि पर आपको सबसे ज्यादा गर्व है?' : '🎯 Which accomplishment made you proud today?',
      category: 'સિદ્ધિ',
    },
    {
      q: lang === 'gu' ? '☕ આજે શાંતિ અને આંતરિક સુખ આપે તેવી કઈ નાની ક્ષણ બની?' : lang === 'hi' ? '☕ आज मन को शांति देने वाला कौन सा छोटा पल था?' : '☕ What small peaceful moment brought you inner calm?',
      category: 'શાંતિ',
    },
    {
      q: lang === 'gu' ? '💪 આજે કયો મોટો પડકાર આવ્યો અને તમે કેવી રીતે લડ્યા?' : lang === 'hi' ? '💪 आज कौन सी चुनौती आई और आपने कैसे उसका सामना किया?' : '💪 What challenge did you face and overcome today?',
      category: 'સાહસ',
    },
    {
      q: lang === 'gu' ? '💖 આજે પરિવાર કે મિત્ર સાથે કઈ સુંદર વાતચીત થઈ?' : lang === 'hi' ? '💖 आज परिवार या मित्र के साथ कौन सी अच्छी बातचीत हुई?' : '💖 What meaningful conversation did you have today?',
      category: 'સંબંધ',
    },
    {
      q: lang === 'gu' ? '🌱 આવતીકાલે તમે જીવનમાં કયો નાનો સારો ફેરફાર કરવા માંગો છો?' : lang === 'hi' ? '🌱 कल आप अपने जीवन में कौन सा छोटा सकारात्मक बदलाव करना चाहते हैं?' : '🌱 What positive habit do you want to nurture tomorrow?',
      category: 'આયોજન',
    },
    {
      q: lang === 'gu' ? '🧘 આજે તમે તમારા સ્વાસ્થ્ય, મન અને શરીર માટે શું સારું કર્યું?' : lang === 'hi' ? '🧘 आज आपने अपने स्वास्थ्य और मन के लिए क्या अच्छा किया?' : '🧘 How did you take care of your body and mind today?',
      category: 'આરોગ્ય',
    },
  ];

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

  // Quick Chips & Emojis for Shopping and Work Notes
  const quickShoppingChips = [
    { label: '+ નવી આઇટમ (☐)', insert: '\n☐ ', isAction: true },
    { label: '🛒 કરિયાણું', insert: '\n• કરિયાણું: ' },
    { label: '🥬 શાકભાજી', insert: '\n• શાકભાજી: ' },
    { label: '🥛 દૂધ / ડેરી', insert: '\n• દૂધ: ' },
    { label: '💊 દવાઓ', insert: '\n• દવાઓ: ' },
    { label: '🍞 નાસ્તો', insert: '\n• નાસ્તો: ' },
    { label: '🧽 ઘરવપરાશ', insert: '\n• ઘરવપરાશ: ' },
    { label: '🍎 ફળો', insert: '\n• ફળો: ' },
    { label: '🧴 તેલ / મસાલા', insert: '\n• મસાલા/તેલ: ' },
  ];

  const quickWorkChips = [
    { label: '+ નવું કામ (☐)', insert: '\n☐ ', isAction: true },
    { label: '⭐ અગત્યનું કામ', insert: '\n⭐ અગત્યનું: ' },
    { label: '📞 કોલ કરવો', insert: '\n📞 કોલ: ' },
    { label: '🏦 બેંકનું કામ', insert: '\n🏦 બેંક: ' },
    { label: '📁 ફાઇલ સબમિશન', insert: '\n📁 સબમિશન: ' },
    { label: '🤝 મીટિંગ', insert: '\n🤝 મીટિંગ: ' },
    { label: '⏳ ફોલોઅપ', insert: '\n⏳ ફોલોઅપ: ' },
    { label: '✉️ ઈમેલ / મેસેજ', insert: '\n✉️ ઈમેલ: ' },
    { label: '💰 પેમેન્ટ હિસાબ', insert: '\n💰 પેમેન્ટ: ' },
  ];

  const quickShoppingEmojis = ['🛒', '🛍️', '🥬', '🍎', '🥛', '🧀', '🍞', '💊', '🧼', '🧹', '💰', '🧾', '📦', '✅', '❌'];
  const quickWorkEmojis = ['✅', '❌', '⏳', '⏰', '📞', '✉️', '💻', '📁', '📊', '🏦', '🤝', '📌', '🎯', '⚠️', '💼'];

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

  // Helper to insert character/emoji at cursor
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

  // Helper to wrap selected text in markdown
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

  // Interactive Checkbox Toggle on Note Cards
  const handleToggleTodoItem = (note, lineIndex) => {
    const lines = note.content.split('\n');
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
    } else if (line.includes('✅')) {
      lines[lineIndex] = line.replace('✅', '☐');
    }
    const updatedNotes = notes.map((n) =>
      n.id === note.id ? { ...n, content: lines.join('\n'), updatedAt: new Date().toISOString() } : n
    );
    onSaveNotes(updatedNotes);
  };

  // Compress & upload image
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 800;

        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.75);
        setPhoto(compressedBase64);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Audio Memo Recording Handlers
  const handleStartAudioRecord = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setAudio(reader.result);
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecordingAudio(true);
    } catch {
      alert(lang === 'gu' ? 'માઇક્રોફોનની પરવાનગી આપો.' : 'Please allow microphone access.');
    }
  };

  const handleStopAudioRecord = () => {
    if (mediaRecorderRef.current && isRecordingAudio) {
      mediaRecorderRef.current.stop();
      setIsRecordingAudio(false);
    }
  };

  // Location Fetcher
  const handleGetLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          const place = prompt(
            lang === 'gu' ? 'શહેર / સ્થળનું નામ દાખલ કરો:' : 'Enter city / place name:',
            lang === 'gu' ? 'કડી, ગુજરાત' : 'Kadi, Gujarat'
          );
          if (place) setLocation(place.trim());
        },
        () => {
          const place = prompt(lang === 'gu' ? 'શહેર / સ્થળનું નામ લખો:' : 'Enter city / location:');
          if (place) setLocation(place.trim());
        }
      );
    } else {
      const place = prompt(lang === 'gu' ? 'શહેર / સ્થળનું નામ લખો:' : 'Enter city / location:');
      if (place) setLocation(place.trim());
    }
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

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, [lang]);

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      alert(lang === 'gu' ? 'તમારા બ્રાઉઝરમાં વોઇસ ટાઇપિંગ સપોર્ટ નથી.' : 'Voice typing is not supported.');
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

  // Open Add Note Modal
  const handleOpenAdd = (targetDate = todayStr, defaultCat = null) => {
    if (typeof checkCanAdd === 'function') {
      if (!checkCanAdd(() => handleOpenAdd(targetDate, defaultCat))) {
        return;
      }
    }
    setEditingNote(null);
    setTitle('');
    setContent('');
    const chosenCat =
      defaultCat ||
      (selectedCat && selectedCat !== noteCategories[0] && selectedCat !== 'All' && selectedCat !== 'બધા'
        ? selectedCat
        : noteCategories[1] || 'Personal');
    setCategory(chosenCat);
    setNoteDate(targetDate);
    setIsPinned(false);

    const isSpecial = ['ખરીદી', 'Shopping', 'खरीदारी', 'કામ', 'Work', 'काम'].includes(chosenCat);
    setFontFamily(isSpecial ? 'sans' : 'handwriting');
    setFontSize('md');
    setMood('good');
    setPhoto('');
    setLocation('');
    setAudio('');
    setShowEmojiPicker(false);
    setShowPromptsDrawer(false);
    setIsModalOpen(true);
  };

  // Open Edit Note Modal
  const handleOpenEdit = (note) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category);
    setNoteDate(note.date || todayStr);
    setIsPinned(note.isPinned);
    setFontFamily(note.fontFamily || 'sans');
    setFontSize(note.fontSize || 'md');
    setMood(note.mood || 'good');
    setPhoto(note.photo || '');
    setLocation(note.location || '');
    setAudio(note.audio || '');
    setShowEmojiPicker(false);
    setShowPromptsDrawer(false);
    setIsModalOpen(true);
  };

  // Save Note
  const handleSave = (e) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    const defaultTitle = t('untitled_note', lang) || 'Note';

    // Auto-detect mood if none set or neutral (do not force mood for shopping/work)
    const isSpecialCat = ['ખરીદી', 'Shopping', 'खरीदारी', 'કામ', 'Work', 'काम'].includes(category);
    const finalMood = isSpecialCat ? null : (mood || streakService.detectSentimentMood(content) || 'good');
    const finalFont = isSpecialCat ? 'sans' : fontFamily;

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
              fontFamily: finalFont,
              fontSize,
              mood: finalMood,
              photo,
              location: isSpecialCat ? '' : location,
              audio: isSpecialCat ? '' : audio,
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
        fontFamily: finalFont,
        fontSize,
        mood: finalMood,
        photo,
        location: isSpecialCat ? '' : location,
        audio: isSpecialCat ? '' : audio,
        color: '#eff6ff',
        createdAt: new Date().toISOString(),
      };
      onSaveNotes([newNote, ...notes]);
      streakService.recordActivityToday();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
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

  // Apply Prompt to Note
  const handleSelectPrompt = (promptText) => {
    if (!isModalOpen && typeof checkCanAdd === 'function') {
      if (!checkCanAdd(() => handleSelectPrompt(promptText))) {
        return;
      }
    }
    setTitle(promptText);
    setContent((prev) => (prev ? prev + '\n\n' : '') + `✨ ${promptText}\n\n📝 `);
    setShowPromptsDrawer(false);
    if (!isModalOpen) {
      setIsModalOpen(true);
    }
  };

  // Save Reminder Config
  const handleSaveReminderSettings = (e) => {
    e.preventDefault();
    storageService.saveDiaryReminderConfig(reminderConfig);
    setIsReminderModalOpen(false);
    alert(lang === 'gu' ? 'ડાયરી રીમાઇન્ડર સેટ થઈ ગયું!' : 'Diary reminder saved!');
  };

  // Test Diary Reminder Notification
  const handleTestDiaryNotification = async () => {
    const hasPerm = await notificationService.requestPermission();
    if (hasPerm) {
      notificationService.send('📔 ડાયરી લખવાનો સમય થયો!', {
        body: 'આજના દિવસની યાદો, વિચારો અને મૂડ નોંધી લો. તમારી 🔥 સ્ટ્રીક જાળવી રાખો!',
      });
    } else {
      alert(lang === 'gu' ? 'કૃપા કરીને નોટિફિકેશનની પરવાનગી આપો.' : 'Please allow notifications.');
    }
  };

  // Download PDF with optional Password
  const handleExportDiaryPdf = async () => {
    setIsExportingPdf(true);
    try {
      const notesToExport = exportMonth === 'all'
        ? notes
        : notes.filter((n) => n.date && n.date.startsWith(exportMonth));

      const pdfResult = await generateMonthlyReportPDF({
        user,
        monthYear: exportMonth === 'all' ? 'All Diary Notes' : exportMonth,
        notesList: notesToExport,
        reportCategory: 'notes',
        pdfPassword: usePdfPassword ? pdfPassword : '',
        lang,
      });

      if (pdfResult && pdfResult.blob) {
        await downloadOrSharePDF({
          pdfBlob: pdfResult.blob,
          filename: pdfResult.filename,
          title: lang === 'gu' ? 'ડાયરી નોંધો રિપોર્ટ' : 'Diary Notes Report',
          lang,
        });
      }

      confetti({ particleCount: 70, spread: 60 });
      setIsPdfExportOpen(false);
    } catch (e) {
      console.error(e);
      alert('PDF export failed. Try again.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Filter notes
  const filteredNotes = notes.filter((n) => {
    const matchesSearch =
      n.title?.toLowerCase().includes(search.toLowerCase()) ||
      n.content?.toLowerCase().includes(search.toLowerCase()) ||
      n.location?.toLowerCase().includes(search.toLowerCase());

    const isAll = selectedCat === noteCategories[0] || selectedCat === 'All' || selectedCat === 'બધા';
    const matchesCategory = isAll || n.category === selectedCat;

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

  const sortedNotes = [...filteredNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt);
  });

  // Calendar calculations
  const daysInCalMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfCalMonth = new Date(calYear, calMonth, 1).getDay();
  const calMonthName = new Date(calYear, calMonth).toLocaleString(lang === 'gu' ? 'gu-IN' : 'default', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      {/* ======================================================= */}
      {/* TOP HEADER: TITLE, STREAK, MOOD ANALYTICS & CTA         */}
      {/* ======================================================= */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-5 text-white shadow-md shadow-blue-500/15 relative overflow-hidden space-y-3">
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
            onClick={() => handleOpenAdd(viewMode === 'calendar' || dateFilterMode === 'by_date' ? selectedDate : todayStr)}
            className="flex items-center gap-1 bg-white hover:bg-blue-50 text-blue-700 px-3.5 py-2 rounded-2xl text-xs font-bold shadow-md active:scale-95 transition"
          >
            <Plus size={16} />
            <span>{t('btn_new_note', lang)}</span>
          </button>
        </div>

        {/* Action Pills Row: AI Prompts, Mood Analysis, Streak, PDF Export, Reminder */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
          {/* Habit Streak Pill */}
          <div className="px-3 py-1.5 rounded-xl bg-white/20 backdrop-blur-md text-amber-300 font-extrabold text-xs flex items-center gap-1.5 shrink-0 border border-white/10">
            <Flame size={14} className="text-orange-400 fill-orange-400 animate-pulse" />
            <span>{streakData.currentStreak} {lang === 'gu' ? 'દિવસની સ્ટ્રીક' : 'Day Streak'}</span>
          </div>

          {/* AI Prompts Button */}
          <button
            onClick={() => setShowPromptsDrawer(true)}
            className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition active:scale-95 border border-white/10"
          >
            <Sparkles size={14} className="text-yellow-300" />
            <span>{t('ai_prompts', lang)}</span>
          </button>

          {/* Mood Analysis Button */}
          <button
            onClick={() => setIsMoodModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition active:scale-95 border border-white/10"
          >
            <span>{weeklyMood.dominantEmoji}</span>
            <span>{t('mood_analysis', lang)}</span>
          </button>

          {/* Diary Reminder Button */}
          <button
            onClick={() => setIsReminderModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition active:scale-95 border border-white/10"
          >
            <Bell size={14} className="text-cyan-300" />
            <span>{t('diary_reminder', lang)}</span>
          </button>

          {/* PDF Export Button */}
          <button
            onClick={() => setIsPdfExportOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition active:scale-95 border border-white/10"
          >
            <Download size={14} className="text-emerald-300" />
            <span>PDF {lang === 'gu' ? 'એક્સપોર્ટ' : 'Export'}</span>
          </button>
        </div>

        {/* Date Quick Stats */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/20 text-center">
          <div className="bg-white/10 rounded-xl p-2 backdrop-blur-xs">
            <span className="text-[10px] text-blue-200 block">{t('total_notes', lang)}</span>
            <span className="text-sm font-extrabold">{notes.length}</span>
          </div>
          <div className="bg-white/10 rounded-xl p-2 backdrop-blur-xs">
            <span className="text-[10px] text-blue-200 block">{t('today_notes', lang)}</span>
            <span className="text-sm font-extrabold">{notes.filter((n) => n.date === todayStr).length}</span>
          </div>
          <div className="bg-white/10 rounded-xl p-2 backdrop-blur-xs">
            <span className="text-[10px] text-blue-200 block">📌 {t('pinned_notes', lang)}</span>
            <span className="text-sm font-extrabold">{notes.filter((n) => n.isPinned).length}</span>
          </div>
        </div>
      </div>

      {/* ======================================================= */}
      {/* VIEW MODE SWITCHER: LIST, CALENDAR, TIMELINE            */}
      {/* ======================================================= */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-1 text-xs">
        <button
          onClick={() => setViewMode('list')}
          className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
            viewMode === 'list'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <List size={14} />
          <span>{t('view_list', lang)}</span>
        </button>

        <button
          onClick={() => setViewMode('calendar')}
          className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
            viewMode === 'calendar'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar size={14} />
          <span>{t('view_calendar', lang)}</span>
        </button>

        <button
          onClick={() => setViewMode('timeline')}
          className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center gap-1.5 ${
            viewMode === 'timeline'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock size={14} />
          <span>{t('view_timeline', lang)}</span>
        </button>
      </div>

      {/* ======================================================= */}
      {/* CALENDAR VIEW MODE                                      */}
      {/* ======================================================= */}
      {viewMode === 'calendar' && (
        <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-3 animate-in fade-in">
          {/* Calendar Month Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-800">{calMonthName}</h3>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  if (calMonth === 0) {
                    setCalMonth(11);
                    setCalYear((y) => y - 1);
                  } else {
                    setCalMonth((m) => m - 1);
                  }
                }}
                className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => {
                  setCalMonth(new Date().getMonth());
                  setCalYear(new Date().getFullYear());
                }}
                className="px-2 py-1 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-50"
              >
                {t('today', lang)}
              </button>
              <button
                onClick={() => {
                  if (calMonth === 11) {
                    setCalMonth(0);
                    setCalYear((y) => y + 1);
                  } else {
                    setCalMonth((m) => m + 1);
                  }
                }}
                className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-extrabold text-slate-400">
            {['રવિ', 'સોમ', 'મંગળ', 'બુધ', 'ગુરુ', 'શુક્ર', 'શનિ'].map((d) => (
              <span key={d} className="py-1">
                {d}
              </span>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: firstDayOfCalMonth }).map((_, i) => (
              <div key={'empty-' + i} className="h-10 rounded-xl bg-slate-50/50" />
            ))}

            {Array.from({ length: daysInCalMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const dayNotes = notes.filter((n) => n.date === dateStr);
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDate;
              const dominantDayMood = dayNotes[0]?.mood;

              return (
                <button
                  key={dayNum}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`h-11 rounded-2xl flex flex-col items-center justify-between p-1 text-xs transition border relative ${
                    isSelected
                      ? 'bg-blue-600 text-white font-black border-blue-600 shadow-xs'
                      : isToday
                      ? 'bg-blue-50 text-blue-700 font-extrabold border-blue-300 ring-2 ring-blue-100'
                      : dayNotes.length > 0
                      ? 'bg-slate-50 text-slate-900 font-bold border-slate-200 hover:bg-slate-100'
                      : 'text-slate-600 border-transparent hover:bg-slate-50'
                  }`}
                >
                  <span className="text-[11px]">{dayNum}</span>
                  <div className="flex items-center gap-0.5">
                    {dayNotes.length > 0 && (
                      <span className="text-[10px]">
                        {dominantDayMood === 'awesome' ? '🤩' : dominantDayMood === 'neutral' ? '😌' : dominantDayMood === 'tired' ? '😔' : dominantDayMood === 'stressed' ? '😤' : '😊'}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Selected Date Summary & Add Note Action Card */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800/80 dark:to-slate-800 p-3.5 rounded-2xl border border-blue-100 dark:border-slate-700">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-blue-600 text-white rounded-xl text-base shadow-xs">📅</span>
              <div>
                <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">
                  {selectedDate} {selectedDate === todayStr ? `(${t('filter_today', lang)})` : ''}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                  {notes.filter((n) => n.date === selectedDate).length} {lang === 'gu' ? 'નોંધ લખાયેલી છે' : 'notes written'}
                </span>
              </div>
            </div>
            <button
              onClick={() => handleOpenAdd(selectedDate)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition flex items-center justify-center gap-1.5"
            >
              <Plus size={16} />
              <span>{t('add_note_on_date', lang)}</span>
            </button>
          </div>
        </div>
      )}

      {/* Date Filter Tabs for List & Timeline View */}
      {viewMode !== 'calendar' && (
        <div className="bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between gap-1 overflow-x-auto scrollbar-none text-xs">
            <button
              onClick={() => setDateFilterMode('all')}
              className={`py-1.5 px-3 rounded-xl font-bold whitespace-nowrap transition ${
                dateFilterMode === 'all'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {t('filter_all', lang)} ({notes.length})
            </button>

            <button
              onClick={() => setDateFilterMode('today')}
              className={`py-1.5 px-3 rounded-xl font-bold whitespace-nowrap transition ${
                dateFilterMode === 'today'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {t('filter_today', lang)}
            </button>

            <button
              onClick={() => setDateFilterMode('by_date')}
              className={`py-1.5 px-3 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1 ${
                dateFilterMode === 'by_date'
                  ? 'bg-cyan-600 text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Calendar size={13} />
              <span>{t('by_date', lang)}</span>
            </button>
          </div>

          {dateFilterMode === 'by_date' && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-slate-800/80 dark:to-slate-800 p-2.5 rounded-2xl border border-cyan-100 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-700 dark:text-slate-200 font-bold">{t('select_date_label', lang)}:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-xs font-bold p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-2xs"
                />
              </div>
              <button
                onClick={() => handleOpenAdd(selectedDate)}
                className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>{t('add_note_on_date', lang)}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Search & Category Chips */}
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

      {/* ======================================================= */}
      {/* TIMELINE VIEW MODE                                      */}
      {/* ======================================================= */}
      {viewMode === 'timeline' && (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-blue-200">
          {sortedNotes.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-3xl border border-dashed border-slate-300 p-6">
              <p className="text-xs text-slate-500">{t('no_notes_found', lang)}</p>
            </div>
          ) : (
            sortedNotes.map((note) => (
              <div key={note.id} className="relative group">
                <span className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] ring-4 ring-white shadow-xs">
                  {['ખરીદી', 'Shopping', 'खरीदारी'].includes(note.category)
                    ? '🛒'
                    : ['કામ', 'Work', 'काम'].includes(note.category)
                    ? '💼'
                    : note.mood === 'awesome'
                    ? '🤩'
                    : note.mood === 'neutral'
                    ? '😌'
                    : note.mood === 'tired'
                    ? '😔'
                    : note.mood === 'stressed'
                    ? '😤'
                    : '😊'}
                </span>

                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2 hover:border-blue-300 transition">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-blue-600">📅 {note.date || 'Today'}</span>
                    <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-md font-semibold text-slate-600">{note.category}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">{note.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed whitespace-pre-wrap">{note.content}</p>
                  {note.photo && (
                    <img
                      src={note.photo}
                      alt="Thumbnail"
                      onClick={() => setActivePhotoPreview(note.photo)}
                      className="h-20 w-32 object-cover rounded-xl border border-slate-200 cursor-pointer"
                    />
                  )}
                  {note.location && (
                    <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                      <MapPin size={11} className="text-rose-500" />
                      {note.location}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ======================================================= */}
      {/* STANDARD LIST VIEW MODE (CARDS)                         */}
      {/* ======================================================= */}
      {viewMode !== 'timeline' && (
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
                  className={`bg-white rounded-3xl p-4 sm:p-5 border transition-all shadow-xs space-y-2.5 relative overflow-hidden ${
                    note.isPinned ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Note Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                        {/* Mood Badge - only show for personal/diary notes */}
                        {note.mood && !['ખરીદી', 'Shopping', 'खरीदारी', 'કામ', 'Work', 'काम'].includes(note.category) && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200/80 font-bold">
                            {note.mood === 'awesome' ? '🤩 ઉત્સાહી' : note.mood === 'neutral' ? '😌 શાંત' : note.mood === 'tired' ? '😔 થાકેલા' : note.mood === 'stressed' ? '😤 તણાવ' : '😊 ખુશ'}
                          </span>
                        )}

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {note.category}
                        </span>

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

                        {note.location && (
                          <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md flex items-center gap-1 border border-rose-200/60">
                            <MapPin size={10} />
                            {note.location}
                          </span>
                        )}
                      </div>

                      <h3 className={`text-sm sm:text-base font-bold text-slate-900 leading-snug ${note.fontFamily === 'serif' ? 'font-serif-diary' : ''}`}>
                        {note.title}
                      </h3>
                    </div>

                    {/* Actions Toolbar */}
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

                  {/* Photo Attachment if present */}
                  {note.photo && (
                    <div className="relative group">
                      <img
                        src={note.photo}
                        alt="Note memory"
                        onClick={() => setActivePhotoPreview(note.photo)}
                        className="w-full max-h-56 object-cover rounded-2xl border border-slate-200 cursor-pointer shadow-2xs hover:opacity-95 transition"
                      />
                    </div>
                  )}

                  {/* Audio Voice Memo Player if present */}
                  {note.audio && (
                    <div className="p-2.5 bg-blue-50/80 rounded-2xl border border-blue-200 flex items-center gap-2">
                      <Volume2 size={18} className="text-blue-600 shrink-0" />
                      <audio controls src={note.audio} className="w-full h-8" />
                    </div>
                  )}

                  {/* Note Content (with interactive checklist toggle support) */}
                  <div className={`leading-relaxed ${fontClass} ${sizeClass} space-y-1`}>
                    {note.content.split('\n').map((line, lIdx) => {
                      const trimmed = line.trim();
                      const isTodoUnchecked = trimmed.startsWith('☐') || trimmed.startsWith('[ ]');
                      const isTodoChecked = trimmed.startsWith('☑️') || trimmed.startsWith('[x]') || trimmed.startsWith('✅');
                      if (isTodoUnchecked || isTodoChecked) {
                        return (
                          <div
                            key={lIdx}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleTodoItem(note, lIdx);
                            }}
                            className={`flex items-start gap-2 p-1 -mx-1 rounded-lg cursor-pointer transition hover:bg-slate-50 select-none ${
                              isTodoChecked ? 'line-through text-slate-400' : 'text-slate-800'
                            }`}
                          >
                            <span className="text-base leading-none shrink-0 mt-0.5">
                              {isTodoChecked ? '☑️' : '☐'}
                            </span>
                            <span className="flex-1 break-words">
                              {line.replace(/^([☐☑️✅]|\[ \]|\[x\])\s*/, '')}
                            </span>
                          </div>
                        );
                      }
                      return (
                        <div key={lIdx} className="whitespace-pre-wrap break-words">
                          {line || '\u00A0'}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ======================================================= */}
      {/* NOTE ADD / EDIT MODAL                                   */}
      {/* ======================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl p-4 sm:p-5 max-w-lg w-full shadow-2xl space-y-3.5 animate-in fade-in zoom-in-95 my-auto max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-xl ${isShopping ? 'bg-emerald-100 text-emerald-700' : isWork ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'}`}>
                  {isShopping ? <ShoppingCart size={18} /> : isWork ? <Briefcase size={18} /> : <BookOpen size={18} />}
                </div>
                <h3 className="text-base font-bold text-slate-800">
                  {editingNote
                    ? t('edit_note', lang)
                    : isShopping
                    ? (lang === 'gu' ? '🛒 નવી ખરીદી યાદી' : lang === 'hi' ? '🛒 नई खरीदारी सूची' : '🛒 New Shopping List')
                    : isWork
                    ? (lang === 'gu' ? '💼 નવું કામ / ટાસ્ક નોંધ' : lang === 'hi' ? '💼 नया कार्य / टास्क' : '💼 New Work Task')
                    : t('new_note_advance', lang)}
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
              {/* Note Date & Quick buttons */}
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

              {/* Note Title */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isShopping
                      ? (lang === 'hi' ? '🛒 खरीदारी सूची का नाम:' : lang === 'en' ? '🛒 Shopping List Title:' : '🛒 ખરીદીની યાદીનું શીર્ષક:')
                      : isWork
                      ? (lang === 'hi' ? '💼 कार्य / प्रोजेक्ट का नाम:' : lang === 'en' ? '💼 Task / Work Title:' : '💼 કામ / પ્રોજેક્ટનું શીર્ષક:')
                      : t('note_title', lang)}
                  </label>
                  {!isShoppingOrWork && (
                    <button
                      type="button"
                      onClick={() => setShowPromptsDrawer(!showPromptsDrawer)}
                      className="text-[11px] font-extrabold text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      <Sparkles size={12} className="text-amber-500" />
                      <span>💡 {t('ai_prompts', lang)}</span>
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  lang={lang === 'gu' ? 'gu-IN' : lang === 'hi' ? 'hi-IN' : lang}
                  inputMode="text"
                  placeholder={
                    isShopping
                      ? (lang === 'hi' ? 'उदा. सुपरमार्केट, किराना, डी-मार्ट...' : lang === 'en' ? 'e.g. Grocery list, Supermarket...' : 'દા.ત. કરિયાણાનું લિસ્ટ, શાકભાજી, ડીમાર્ટ...')
                      : isWork
                      ? (lang === 'hi' ? 'उदा. ऑफिस रिपोर्ट, बैंक का काम...' : lang === 'en' ? 'e.g. Office work, Bank deposit...' : 'દા.ત. ઓફિસ ફાઇલ સબમિટ કરવી, બેંકનું કામ...')
                      : t('note_title_placeholder', lang)
                  }
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-blue-500 font-bold"
                />
              </div>

              {/* Inline AI Prompts Accordion - ONLY when !isShoppingOrWork */}
              {!isShoppingOrWork && showPromptsDrawer && (
                <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-2 animate-in fade-in">
                  <span className="text-[11px] font-bold text-amber-900 block">
                    ✨ કોઈ એક પ્રશ્ન પસંદ કરો, એપ આપમેળે ડાયરી શરૂ કરી આપશે:
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {aiPromptsList.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPrompt(item.q)}
                        className="w-full text-left p-2 rounded-xl bg-white hover:bg-amber-100 border border-amber-200/80 text-xs font-semibold text-slate-800 transition leading-snug"
                      >
                        {item.q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Category & Pin */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">{t('category', lang)}</label>
                  <select
                    value={category}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      setCategory(newCat);
                      if (['ખરીદી', 'Shopping', 'खरीदारी', 'કામ', 'Work', 'काम'].includes(newCat)) {
                        setFontFamily('sans');
                      }
                    }}
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

              {/* ======================================================= */}
              {/* ======================================================= */}
              {/* MULTIMEDIA ATTACHMENTS BAR                              */}
              {/* ======================================================= */}
              {isShoppingOrWork ? (
                /* Streamlined Bar for Shopping & Work: Photo/Bill Attachment + Voice Button */
                <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                        photo
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-2xs'
                      }`}
                    >
                      <ImageIcon size={14} className="text-emerald-600" />
                      <span>
                        {photo
                          ? '✓ ફોટો ઉમેરાયો'
                          : isShopping
                          ? (lang === 'hi' ? '🧾 बिल / फोटो जोड़ें' : lang === 'en' ? '🧾 Bill / Photo' : '🧾 બિલ / ફોટો ઉમેરો')
                          : (lang === 'hi' ? '📎 दस्तावेज / फोटो जोड़ें' : lang === 'en' ? '📎 Doc / Photo' : '📎 દસ્તાવેજ / ફોટો ઉમેરો')}
                      </span>
                    </button>

                    {photo && (
                      <div className="relative inline-block">
                        <img src={photo} alt="Preview" className="h-8 w-12 object-cover rounded-lg border border-slate-200 shadow-2xs" />
                        <button
                          type="button"
                          onClick={() => setPhoto('')}
                          className="absolute -top-1.5 -right-1.5 p-0.5 bg-red-600 text-white rounded-full shadow-md"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Voice Button embedded in shopping/work row */}
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
                    <span>
                      {isListening
                        ? (lang === 'gu' ? 'સાંભળી રહ્યા છીએ...' : 'Listening...')
                        : isShopping
                        ? (lang === 'gu' ? '🎙️ બોલીને ઉમેરો' : '🎙️ Voice Add')
                        : (lang === 'gu' ? '🎙️ બોલીને લખો' : '🎙️ Voice Write')}
                    </span>
                  </button>
                </div>
              ) : (
                /* Full Multimedia Bar for Personal Diary Notes */
                <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-xs font-bold text-slate-700 block">
                    મલ્ટીમીડિયા અટેચમેન્ટ (Photos, Audio, Location):
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Photo Upload */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                        photo ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <ImageIcon size={14} className="text-emerald-600" />
                      <span>{photo ? '✓ ફોટો ઉમેરાયો' : t('add_photo', lang)}</span>
                    </button>

                    {/* Audio Recording */}
                    <button
                      type="button"
                      onClick={isRecordingAudio ? handleStopAudioRecord : handleStartAudioRecord}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                        isRecordingAudio
                          ? 'bg-red-500 text-white animate-pulse'
                          : audio
                          ? 'bg-blue-50 border-blue-300 text-blue-800'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Mic size={14} className={isRecordingAudio ? 'text-white' : 'text-blue-600'} />
                      <span>{isRecordingAudio ? '⏹️ રેકોર્ડિંગ બંધ કરો' : audio ? '✓ ઓડિયો મેમો' : t('record_audio', lang)}</span>
                    </button>

                    {/* Location Tag */}
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                        location ? 'bg-rose-50 border-rose-300 text-rose-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <MapPin size={14} className="text-rose-600" />
                      <span>{location ? `✓ ${location}` : t('add_location', lang)}</span>
                    </button>
                  </div>

                  {/* Previews if any attachment */}
                  {photo && (
                    <div className="relative inline-block mt-1">
                      <img src={photo} alt="Preview" className="h-20 w-32 object-cover rounded-xl border border-slate-200 shadow-2xs" />
                      <button
                        type="button"
                        onClick={() => setPhoto('')}
                        className="absolute -top-1.5 -right-1.5 p-1 bg-red-600 text-white rounded-full shadow-md"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}

                  {audio && (
                    <div className="flex items-center gap-2 pt-1">
                      <audio controls src={audio} className="h-7 w-48" />
                      <button
                        type="button"
                        onClick={() => setAudio('')}
                        className="text-xs font-bold text-red-600 hover:underline"
                      >
                        {t('clear_text', lang)}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* ======================================================= */}
              {/* TYPOGRAPHY / CHECKLIST TOOLBAR                          */}
              {/* ======================================================= */}
              {isShoppingOrWork ? (
                /* Specialized Quick Checklist Toolbar for Shopping / Work */
                <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5">
                      {isShopping ? (
                        <>
                          <ShoppingCart size={14} className="text-emerald-600" />
                          <span>{lang === 'gu' ? '🛒 ખરીદી આઇટમ્સ (ઝડપી ઉમેરો):' : lang === 'hi' ? '🛒 खरीदारी सामग्री (त्वरित जोड़ें):' : '🛒 Shopping Items (Quick Add):'}</span>
                        </>
                      ) : (
                        <>
                          <Briefcase size={14} className="text-blue-600" />
                          <span>{lang === 'gu' ? '💼 કામ / ટાસ્ક લિસ્ટ (ઝડપી ઉમેરો):' : lang === 'hi' ? '💼 कार्य / टास्क (त्वरित जोड़ें):' : '💼 Tasks / Work List (Quick Add):'}</span>
                        </>
                      )}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {lang === 'gu' ? 'ક્લિક કરી લિસ્ટમાં ઉમેરો' : 'Click to insert'}
                    </span>
                  </div>

                  {/* 1-Tap Category Item Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pb-0.5">
                    {(isShopping ? quickShoppingChips : quickWorkChips).map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => insertAtCursor(content ? chip.insert : chip.insert.trimStart())}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition border shadow-2xs active:scale-95 ${
                          chip.isAction
                            ? 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>

                  {/* Quick Checklist Formatting Actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => insertAtCursor(content ? '\n☐ ' : '☐ ')}
                        className="px-2 py-1 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1"
                        title="Add Checkbox"
                      >
                        <CheckSquare size={12} className="text-blue-600" />
                        <span>{lang === 'gu' ? 'ચેકબોક્સ (☐)' : 'Checkbox'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => insertAtCursor(content ? '\n• ' : '• ')}
                        className="p-1.5 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-700 text-xs"
                        title="Bullet point"
                      >
                        <List size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertAtCursor('\n')}
                        className="px-2 py-1 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-0.5"
                        title="New line"
                      >
                        <CornerDownLeft size={11} />
                        <span>{t('new_line', lang)}</span>
                      </button>
                    </div>

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
              ) : (
                /* Standard Typography & Font Style Toolbar for Diary Notes */
                <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <Type size={14} className="text-indigo-600" />
                      <span>{t('font_style', lang)}:</span>
                    </span>

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

                  {/* Markdown Formatting Quick Buttons */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/80">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => wrapSelectedText('**')}
                        className="p-1.5 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-700 font-extrabold text-xs"
                        title="Bold"
                      >
                        <Bold size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => wrapSelectedText('*')}
                        className="p-1.5 bg-white hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-700 italic text-xs"
                        title="Italic"
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
                      >
                        <CornerDownLeft size={11} />
                        <span>{t('new_line', lang)}</span>
                      </button>
                    </div>

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
              )}

              {/* ======================================================= */}
              {/* EMOJI & KEYBOARD ASSISTANT TOGGLES                      */}
              {/* ======================================================= */}
              {isShoppingOrWork ? (
                /* Compact 1-Tap Emojis Strip for Shopping & Work */
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none bg-slate-50/80 p-1.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold px-1 shrink-0">
                    {isShopping ? '🛒 1-Tap:' : '💼 1-Tap:'}
                  </span>
                  {(isShopping ? quickShoppingEmojis : quickWorkEmojis).map((emoji) => (
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
              ) : (
                /* Standard Emoji & Smart Keyboard Helper for Personal Diary Notes */
                <>
                  <div className="flex items-center justify-between gap-1 text-xs">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-bold transition border ${
                          showEmojiPicker
                            ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Smile size={14} className="text-amber-500" />
                        <span>{t('quick_emojis', lang)}</span>
                      </button>
                    </div>

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

                  {/* 1-Tap Quick Emojis Strip */}
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
                </>
              )}

              {/* Textarea */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {isShopping
                    ? (lang === 'gu' ? '🛒 ખરીદીનું લિસ્ટ (Shopping Checklist)' : lang === 'hi' ? '🛒 खरीदारी सूची' : '🛒 Shopping Checklist')
                    : isWork
                    ? (lang === 'gu' ? '💼 કામ / ટાસ્ક લિસ્ટ (Task Checklist)' : lang === 'hi' ? '💼 कार्य / टास्क सूची' : '💼 Task Checklist')
                    : t('note_content', lang)}
                </label>
                <textarea
                  ref={contentRef}
                  rows={7}
                  lang={lang === 'gu' ? 'gu-IN' : lang === 'hi' ? 'hi-IN' : lang}
                  inputMode="text"
                  autoCapitalize="sentences"
                  autoCorrect="on"
                  spellCheck="true"
                  placeholder={
                    isShopping
                      ? (lang === 'hi'
                          ? 'लिखें या 🎙️ बोलें...\nउदा:\n☐ १. आटा - ५ किलो\n☐ २. सब्जियां (आलू, टमाटर)\n☐ ३. दूध और तेल'
                          : lang === 'en'
                          ? 'Type or 🎙️ speak your items...\nExample:\n☐ 1. Wheat flour - 5 kg\n☐ 2. Fresh vegetables\n☐ 3. Milk and oil'
                          : 'લખો અથવા 🎙️ બોલો...\nઉદાહરણ:\n☐ ૧. ઘઉંનો લોટ - ૫ કિલો\n☐ ૨. શાકભાજી (બટાકા, ટામેટા)\n☐ ૩. દૂધ અને તેલ')
                      : isWork
                      ? (lang === 'hi'
                          ? 'लिखें या 🎙️ बोलें...\nउदा:\n☐ १. ११:०० बजे क्लाइंट को कॉल करना\n☐ २. बैंक में चेक जमा करना\n☐ ३. रिपोर्ट सबमिट करना'
                          : lang === 'en'
                          ? 'Type or 🎙️ speak your tasks...\nExample:\n☐ 1. Call client at 11:00 AM\n☐ 2. Deposit check in bank\n☐ 3. Submit monthly report'
                          : 'લખો અથવા 🎙️ બોલો...\nઉદાહરણ:\n☐ ૧. ૧૧:૦૦ વાગ્યે ક્લાયન્ટને કોલ કરવો\n☐ ૨. બેંકમાં ચેક જમા કરાવવો\n☐ ૩. ફાઇલ સબમિટ કરવી')
                      : t('note_content_placeholder', lang)
                  }
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className={`w-full p-3.5 rounded-2xl border border-slate-200 focus:outline-blue-500 transition leading-relaxed shadow-inner ${
                    isShoppingOrWork
                      ? 'font-sans-diary text-slate-800 text-sm'
                      : (fontFamily === 'handwriting'
                          ? 'font-handwriting text-slate-800'
                          : fontFamily === 'serif'
                          ? 'font-serif-diary text-slate-900'
                          : fontFamily === 'mono'
                          ? 'font-mono-diary text-slate-800'
                          : 'font-sans-diary text-slate-700') +
                        ' ' +
                        (fontSize === 'sm'
                          ? 'text-xs'
                          : fontSize === 'lg'
                          ? 'text-base'
                          : fontSize === 'xl'
                          ? 'text-lg'
                          : 'text-sm')
                  }`}
                />
              </div>

              {/* Form Actions */}
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

      {/* ======================================================= */}
      {/* WEEKLY MOOD ANALYSIS MODAL                              */}
      {/* ======================================================= */}
      {isMoodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{weeklyMood.dominantEmoji}</span>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800">
                    {lang === 'gu' ? 'સાપ્તાહિક મૂડ એનાલિસિસ' : 'Weekly Mood Analysis'}
                  </h3>
                  <span className="text-xs font-semibold text-slate-500">
                    {lang === 'gu' ? 'છેલ્લા ૭ દિવસની ભાવનાત્મક સ્થિતિ' : 'Last 7 days emotional trend'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsMoodModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Dominant Highlight Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3.5 rounded-2xl border border-blue-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900">{weeklyMood.summaryTitle}</span>
                <span className="text-xs font-black text-indigo-700 bg-white px-2.5 py-0.5 rounded-full border border-blue-200">
                  {weeklyMood.score}/10
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {weeklyMood.advice}
              </p>
            </div>

            {/* Breakdown Percentage Bars */}
            <div className="space-y-2 pt-1">
              <span className="text-xs font-bold text-slate-700 block">
                {lang === 'gu' ? 'મૂડ વિતરણ ટકાવારી:' : 'Mood Breakdown (%):'}
              </span>

              {MOODS.map((m) => {
                const pct = weeklyMood.stats[m.id] || 0;
                return (
                  <div key={m.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <span>{m.emoji}</span>
                        <span>{m.labelGu}</span>
                      </span>
                      <span className="font-extrabold text-slate-900">{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${m.color} transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setIsMoodModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs"
            >
              {lang === 'gu' ? 'બંધ કરો' : 'Close'}
            </button>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* DIARY REMINDER SETTINGS MODAL                           */}
      {/* ======================================================= */}
      {isReminderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-100 text-cyan-700">
                  <Bell size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    {lang === 'gu' ? 'દૈનિક ડાયરી રીમાઇન્ડર & હેબિટ' : 'Daily Diary Reminder'}
                  </h3>
                  <span className="text-xs text-slate-500">
                    {lang === 'gu' ? 'રોજ રાત્રે ડાયરી લખવાની યાદ અપાવો' : 'Nightly habit reminder'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsReminderModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveReminderSettings} className="space-y-3.5">
              <div className="p-3 bg-cyan-50/70 rounded-2xl border border-cyan-200/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-cyan-950 block">
                    {lang === 'gu' ? 'રોજિંદી ડાયરી નોટિફિકેશન' : 'Daily Diary Notification'}
                  </span>
                  <span className="text-[10px] text-cyan-800">
                    {lang === 'gu' ? 'નિયમિત ડાયરી લખવાની હેબિટ જાળવી રાખો' : 'Keep your writing streak alive'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={reminderConfig.enabled}
                  onChange={(e) => setReminderConfig({ ...reminderConfig, enabled: e.target.checked })}
                  className="w-5 h-5 rounded text-cyan-600 cursor-pointer"
                />
              </div>

              {reminderConfig.enabled && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">
                    {lang === 'gu' ? 'રીમાઇન્ડરનો સમય (Reminder Time):' : 'Preferred Notification Time:'}
                  </label>
                  <input
                    type="time"
                    value={reminderConfig.time}
                    onChange={(e) => setReminderConfig({ ...reminderConfig, time: e.target.value })}
                    className="w-full text-sm font-bold p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                  />
                  <div className="flex gap-1.5 pt-1">
                    {['21:00', '21:30', '22:00'].map((tVal) => (
                      <button
                        key={tVal}
                        type="button"
                        onClick={() => setReminderConfig({ ...reminderConfig, time: tVal })}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition border ${
                          reminderConfig.time === tVal
                            ? 'bg-cyan-600 text-white border-cyan-600'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        {tVal === '21:00' ? '9:00 PM' : tVal === '21:30' ? '9:30 PM' : '10:00 PM'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  onClick={handleTestDiaryNotification}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50"
                >
                  🔔 {lang === 'gu' ? 'ટેસ્ટ એલાર્મ' : 'Test Alert'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs shadow-xs"
                >
                  {t('save', lang)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* PDF EXPORT MODAL WITH PASSWORD PROTECTION               */}
      {/* ======================================================= */}
      {isPdfExportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <Download size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">
                    {lang === 'gu' ? 'ડાયરી PDF એક્સપોર્ટ & પ્રિન્ટ' : 'Export Diary to PDF'}
                  </h3>
                  <span className="text-xs text-slate-500">
                    {lang === 'gu' ? 'પાસવર્ડ સુરક્ષા સાથે પુસ્તક શૈલીમાં ડાઉનલોડ' : 'Download with password security'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsPdfExportOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {lang === 'gu' ? 'સમયગાળો (Timeframe):' : 'Select Timeframe:'}
                </label>
                <select
                  value={exportMonth}
                  onChange={(e) => setExportMonth(e.target.value)}
                  className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 bg-slate-50"
                >
                  <option value="all">{lang === 'gu' ? 'તમામ નોંધો (All Notes)' : 'All Notes'}</option>
                  <option value={todayStr.substring(0, 7)}>{lang === 'gu' ? 'ચાલુ મહિનો' : 'This Month'}</option>
                </select>
              </div>

              {/* Password Protection */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={usePdfPassword}
                    onChange={(e) => setUsePdfPassword(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 cursor-pointer"
                  />
                  <Lock size={14} className="text-slate-600" />
                  <span>{t('password_protect', lang)}</span>
                </label>

                {usePdfPassword && (
                  <div className="pt-1 animate-in fade-in space-y-1">
                    <input
                      type="password"
                      placeholder={lang === 'gu' ? 'PDF ખોલવા માટે પાસવર્ડ સેટ કરો (દા.ત. 1234)' : 'Enter PDF password'}
                      value={pdfPassword}
                      onChange={(e) => setPdfPassword(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-bold"
                    />
                    <span className="text-[10px] text-slate-400 block">
                      {lang === 'gu' ? 'ℹ️ જ્યારે કોઈ આ PDF ઓપન કરશે ત્યારે પાસવર્ડ માંગવામાં આવશે.' : 'Password will be required to open this PDF.'}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsPdfExportOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50"
                >
                  {t('cancel', lang)}
                </button>
                <button
                  type="button"
                  disabled={isExportingPdf}
                  onClick={handleExportDiaryPdf}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs disabled:opacity-50"
                >
                  {isExportingPdf ? 'જનરેટ થઈ રહ્યું છે...' : 'PDF ડાઉનલોડ'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* PHOTO PREVIEW FULL MODAL                                */}
      {/* ======================================================= */}
      {activePhotoPreview && (
        <div
          onClick={() => setActivePhotoPreview(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs cursor-pointer animate-in fade-in"
        >
          <div className="relative max-w-xl w-full max-h-[85vh] p-2">
            <img
              src={activePhotoPreview}
              alt="Full Preview"
              className="w-full h-auto max-h-[80vh] object-contain rounded-2xl shadow-2xl"
            />
            <button
              onClick={() => setActivePhotoPreview(null)}
              className="absolute top-4 right-4 p-2 bg-black/60 text-white rounded-full hover:bg-black/90"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
