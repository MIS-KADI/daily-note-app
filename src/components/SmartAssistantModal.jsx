import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Sparkles,
  Send,
  X,
  CheckCircle2,
  Calendar,
  Clock,
  IndianRupee,
  BookOpen,
  Droplet,
  Users,
  Volume2,
  HelpCircle,
  AlertCircle,
  RefreshCw,
  Globe,
  Pill,
  ShoppingBag,
  Zap,
  Smartphone,
  ShieldCheck,
  Check,
  Edit3,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { aiAssistantService } from '../services/aiAssistantService';
import { audioService } from '../services/audioService';
import { t } from '../services/i18n';

export default function SmartAssistantModal({
  isOpen,
  onClose,
  lang = 'gu',
  autoStart = false,
  onAddFinance,
  onAddReminder,
  onAddNote,
  onAddKhata,
  onAddWater,
  onAddMedicine,
  onAddShopping,
  onAddEvent,
  onOpenMobilePermissions,
}) {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [parsedResult, setParsedResult] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [interimText, setInterimText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('auto'); // 'auto', 'shopping', 'reminder', 'finance', 'medicine', 'khata', 'event', 'note'
  
  // Voice language selection
  const defaultVoiceLang = lang === 'hi' ? 'hi-IN' : lang === 'en' ? 'en-IN' : 'gu-IN';
  const [voiceLang, setVoiceLang] = useState(defaultVoiceLang);

  const recognitionRef = useRef(null);
  const autoStartedRef = useRef(false);

  // Suggested quick prompts in current language across all tabs
  const PROMPTS = {
    gu: [
      '૨ કિલો બટાકા અને તેલ લાવવાના છે',
      'આજે મીટિંગ છે ૧૧ વાગે',
      'સવારે ૮ વાગ્યે બીપીની દવા ૧ ગોળી લેવાની છે',
      'આજે શાકભાજી માટે ૨૫૦ રૂપિયા ખર્ચ્યા',
      'બેંકમાં ૫૦૦૦ જમા કરાવ્યા',
      'કાલે રમેશભાઈનો જન્મદિવસ છે',
      'રમેશભાઈ પાસેથી ૨૦૦૦ લેવાના છે',
      '૨ ગ્લાસ પાણી પીધું',
      'આજે પરિવાર સાથે ખૂબ સુંદર સમય વિતાવ્યો',
    ],
    hi: [
      '2 किलो आलू और तेल लाना है',
      'आज 11 बजे मीटिंग है',
      'सुबह 8 बजे बीपी की 1 गोली लेनी है',
      'आज सब्जी के लिए 250 रुपये खर्च किए',
      'बैंक में 5000 जमा किए',
      'कल राहुल का जन्मदिन है',
      'रमेश भाई से 2000 लेने हैं',
      '2 ग्लास पानी पिया',
      'आज का दिन बहुत अच्छा रहा',
    ],
    en: [
      'Need to buy 2 kg potatoes and cooking oil',
      'Meeting today at 11 am',
      'Take BP medicine 1 tablet at 8 am',
      'Spent 250 rupees on vegetables',
      'Deposited 5000 in Bank',
      'Tomorrow is Rahul birthday celebration',
      'Ramesh owes me 2000 rupees',
      'Drank 2 glasses of water',
      'Had a wonderful productive day today',
    ],
  };

  const currentPrompts = PROMPTS[lang] || PROMPTS.gu;

  const stopListening = () => {
    if (window.AndroidSpeechBridge && typeof window.AndroidSpeechBridge.stopListening === 'function') {
      try {
        window.AndroidSpeechBridge.stopListening();
      } catch (e) {
        // Ignore
      }
    }
    try {
      recognitionRef.current?.stop();
    } catch (e) {
      // Ignore
    }
    setIsListening(false);
    setInterimText('');
  };

  // Execute Save into whichever tab it belongs to (Called after user confirms!)
  const executeSaveEntry = (result) => {
    if (!result) return;

    if (result.intent === 'shopping') {
      onAddShopping?.({
        name: result.name || result.title,
        quantity: result.quantity || '૧',
        category: result.category || 'કરિયાણું / શાકભાજી',
      });
    } else if (result.intent === 'reminder') {
      onAddReminder?.({
        id: 'rem-' + Date.now(),
        title: result.title,
        description: result.description || result.title,
        type: result.type || 'task',
        time: result.time || '10:00',
        date: result.date || new Date().toISOString().split('T')[0],
        hasAlarm: true,
        isCompleted: false,
        priority: 'high',
      });
    } else if (result.intent === 'finance') {
      onAddFinance?.({
        id: 'f-' + Date.now(),
        type: result.type || 'expense',
        amount: Number(result.amount || 0),
        category: result.category || 'સામાન્ય',
        description: result.description || result.title,
        paymentMode: result.paymentMode || 'UPI (GPay/PhonePe)',
        date: result.date || new Date().toISOString().split('T')[0],
      });
    } else if (result.intent === 'medicine') {
      onAddMedicine?.({
        name: result.name || result.title,
        dosage: result.dosage || '૧ ગોળી',
        timeSlot: result.timeSlot || 'morning',
        mealRelation: result.mealRelation || 'after_food',
        time: result.time || '08:30',
        notes: result.notes || result.title,
      });
    } else if (result.intent === 'khata') {
      onAddKhata?.({
        id: 'kh-' + Date.now(),
        partyName: result.partyName || 'ગ્રાહક',
        phone: '',
        type: result.type || 'to_receive',
        amount: Number(result.amount || 0),
        date: new Date().toISOString().split('T')[0],
        dueDate: result.dueDate || result.date,
        description: result.description || '',
        isSettled: false,
      });
    } else if (result.intent === 'water') {
      onAddWater?.(result.glasses || 1);
    } else if (result.intent === 'event') {
      onAddEvent?.({
        title: result.title,
        personName: result.personName || result.title,
        date: result.date || new Date().toISOString().split('T')[0],
        type: result.type || 'birthday',
        notes: result.notes || '',
      });
    } else {
      // Note
      onAddNote?.({
        id: 'n-' + Date.now(),
        title: result.title,
        content: result.content || result.title,
        category: 'અંગત',
        date: result.date || new Date().toISOString().split('T')[0],
        isPinned: false,
        color: '#eff6ff',
      });
    }

    try {
      confetti({ particleCount: 75, spread: 70, origin: { y: 0.65 } });
    } catch {}

    try {
      if (audioService?.playSuccess) audioService.playSuccess();
    } catch {}

    // Speak voice success confirmation
    aiAssistantService.speak(
      lang === 'gu'
        ? `${result.title} સફળતાપૂર્વક સાચવી લીધું છે!`
        : `${result.title} saved successfully!`,
      lang
    );

    setIsSaved(true);
  };

  // Analyze text and present confirmation card (PREVENTS false auto-save)
  const handleAnalyze = (text, overrideIntent = undefined) => {
    if (!text || !text.trim()) return;
    const targetIntent =
      overrideIntent !== undefined
        ? (overrideIntent === 'auto' ? null : overrideIntent)
        : (selectedCategory !== 'auto' ? selectedCategory : null);
    const result = aiAssistantService.parseInput(text, lang, targetIntent);
    setParsedResult(result);
    setIsSaved(false);

    if (result) {
      // Speak confirmation question: "Are you ready to save to [tab]?"
      aiAssistantService.speak(result.confirmationMessage, lang);
    }
  };

  // Manual Intent Switcher if user wants to override
  const handleSwitchIntent = (newIntent) => {
    if (!parsedResult) return;
    let updated = { ...parsedResult, intent: newIntent };
    if (newIntent === 'shopping') {
      updated.targetTab = 'ખરીદી યાદી (Shopping List)';
      const rawTitle = updated.title || inputText || 'નવી વસ્તુ';
      const cleanName = rawTitle.replace(/^ખરીદી:\s*/, '').trim();
      updated.title = `ખરીદી: ${cleanName}`;
      updated.name = cleanName;
      updated.quantity = updated.quantity || '૧';
      updated.category = updated.category || 'કરિયાણું / શાકભાજી';
      updated.details = `જથ્થો: ${updated.quantity} | કેટેગરી: ${updated.category}`;
      updated.confirmationMessage = `ખરીદીની યાદીમાં '${cleanName}' (${updated.quantity}) ઉમેરવા માટે તૈયાર છે! 🛒`;
    } else if (newIntent === 'reminder') {
      updated.targetTab = 'કામો અને મીટિંગ ટેબ (Reminders Tab)';
      updated.title = (updated.title || inputText || 'કામ').replace(/^ખરીદી:\s*/, '').trim();
      updated.hasAlarm = true;
      updated.time = updated.time || '11:00';
      updated.date = updated.date || new Date().toISOString().split('T')[0];
      updated.details = `સમય: ${updated.time} | તારીખ: ${updated.date} | ⏰ અલાર્મ સક્રિય`;
      updated.confirmationMessage = `કામ/મીટિંગ '${updated.title}' સમય ${updated.time} વાગ્યે રીમાઇન્ડર તરીકે સેવ કરવા તૈયાર છે! ⏰`;
    } else if (newIntent === 'finance') {
      updated.targetTab = 'હિસાબ ટેબ (Finance Tab)';
      updated.type = updated.type === 'income' ? 'income' : 'expense';
      updated.amount = updated.amount || 100;
      updated.category = updated.category || 'સામાન્ય ખર્ચ';
      updated.details = `રકમ: ₹${updated.amount} | પ્રકાર: ${updated.type === 'income' ? 'આવક' : 'ખર્ચ'}`;
      updated.confirmationMessage = `હિસાબમાં ₹${updated.amount} ની એન્ટ્રી કરવા તૈયાર છે! 💰`;
    } else if (newIntent === 'medicine') {
      updated.targetTab = 'હેલ્થ હબ ટેબ (Health Hub)';
      updated.title = (updated.title || inputText || 'દવા').replace(/^ખરીદી:\s*/, '').trim();
      updated.name = updated.name || updated.title;
      updated.dosage = updated.dosage || '૧ ગોળી';
      updated.time = updated.time || '08:30';
      updated.mealRelation = updated.mealRelation || 'after_food';
      updated.details = `સમય: ${updated.time} | ડોઝ: ${updated.dosage}`;
      updated.confirmationMessage = `દવા '${updated.name}' (${updated.dosage}) શેડ્યુલ કરવા તૈયાર છે! 💊`;
    } else if (newIntent === 'khata') {
      updated.targetTab = 'ખાતાવહી ટેબ (Khata Tab)';
      updated.partyName = updated.partyName || updated.title || 'ગ્રાહક';
      updated.amount = updated.amount || 500;
      updated.type = updated.type || 'to_receive';
      updated.details = `પાર્ટી: ${updated.partyName} | રકમ: ₹${updated.amount}`;
      updated.confirmationMessage = `ખાતાવહીમાં ₹${updated.amount} ની એન્ટ્રી કરવા તૈયાર છે! 🤝`;
    } else if (newIntent === 'event') {
      updated.targetTab = 'ઉત્સવ અને દિવસો (Events Tab)';
      updated.title = updated.title || inputText || 'ઉત્સવ';
      updated.date = updated.date || new Date().toISOString().split('T')[0];
      updated.details = `તારીખ: ${updated.date}`;
      updated.confirmationMessage = `ઇવેન્ટ '${updated.title}' સાચવવા માટે તૈયાર છે! 🎉`;
    } else if (newIntent === 'note') {
      updated.targetTab = 'ડાયરી નોંધ ટેબ (Diary Notes)';
      updated.title = updated.title || inputText || 'દૈનિક અંગત નોંધ';
      updated.details = `તારીખ: ${new Date().toISOString().split('T')[0]}`;
      updated.confirmationMessage = `ડાયરી નોંધમાં સાચવવા માટે તૈયાર છે! 📝`;
    }
    setParsedResult(updated);
  };

  // Direct Category selection / Intent override (Synced across top bar and confirmation card)
  const handleSelectCategoryDirectly = (catId) => {
    setSelectedCategory(catId);
    if (parsedResult) {
      handleSwitchIntent(catId);
    } else if (inputText && inputText.trim()) {
      handleAnalyze(inputText, catId);
    }
  };

  const getInputPlaceholder = () => {
    switch (selectedCategory) {
      case 'shopping':
        return lang === 'gu'
          ? 'ખરીદીની વસ્તુઓ બોલો કે લખો (દા.ત. ૨ કિલો બટાકા અને તેલ)...'
          : 'Speak or type shopping items (e.g. 2 kg potatoes)...';
      case 'reminder':
        return lang === 'gu'
          ? 'કામ કે મીટિંગ બોલો કે લખો (દા.ત. આજે મીટિંગ છે ૧૧ વાગે)...'
          : 'Speak or type task/meeting (e.g. Meeting today at 11 am)...';
      case 'finance':
        return lang === 'gu'
          ? 'ખર્ચ કે આવક બોલો કે લખો (દા.ત. ૨૫૦ રૂપિયા શાકભાજી માટે ખર્ચ્યા)...'
          : 'Speak or type expense/income (e.g. Spent 250 rs)...';
      case 'medicine':
        return lang === 'gu'
          ? 'દવા શેડ્યૂલ બોલો કે લખો (દા.ત. સવારે ૮ વાગ્યે બીપીની દવા ૧ ગોળી)...'
          : 'Speak or type medicine (e.g. Take BP medicine 1 tablet at 8 am)...';
      case 'khata':
        return lang === 'gu'
          ? 'ખાતાવહી બોલો કે લખો (દા.ત. રમેશભાઈ પાસેથી ૨૦૦૦ લેવાના છે)...'
          : 'Speak or type khata (e.g. Ramesh owes 2000 rs)...';
      case 'event':
        return lang === 'gu'
          ? 'જન્મદિવસ કે ઉત્સવ બોલો (દા.ત. કાલે રમેશભાઈનો જન્મદિવસ છે)...'
          : 'Speak or type celebration (e.g. Tomorrow is Ramesh birthday)...';
      case 'note':
        return lang === 'gu'
          ? 'ડાયરી નોંધ બોલો કે લખો...'
          : 'Speak or type diary note...';
      default:
        return lang === 'gu'
          ? 'અથવા અહીં લખો (દા.ત. ૨ કિલો બટાકા લાવવાના છે)...'
          : 'Or type here (e.g. Buy 2 kg potatoes)...';
    }
  };

  const startListening = async () => {
    setVoiceError('');
    setInterimText('');

    // 1. Check if Android Native Speech Bridge is available (in APK)
    if (window.AndroidSpeechBridge) {
      try {
        if (typeof window.AndroidSpeechBridge.hasPermission === 'function' && !window.AndroidSpeechBridge.hasPermission()) {
          window.AndroidSpeechBridge.requestPermission();
        }
        setIsListening(true);
        setParsedResult(null);
        setIsSaved(false);
        window.AndroidSpeechBridge.startListening(voiceLang);
        return;
      } catch (nativeErr) {
        console.warn('Native speech bridge call failed, falling back to Web Speech:', nativeErr);
      }
    }

    if (!speechSupported) {
      setVoiceError(
        lang === 'gu'
          ? 'તમારા બ્રાઉઝરમાં વોઇસ સપોર્ટ ઉપલબ્ધ નથી. તમે નીચે બોક્સમાં લખીને વિશ્લેષણ કરી શકો છો.'
          : 'Voice typing not supported. Please type below.'
      );
      return;
    }

    // Pre-flight check audio permission via mediaDevices if available
    if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      } catch (micErr) {
        console.warn('Microphone permission check warning:', micErr);
      }
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.lang = voiceLang;
        recognitionRef.current.start();
        setIsListening(true);
        setParsedResult(null);
        setIsSaved(false);
      }
    } catch (err) {
      console.warn('Speech start error:', err);
      if (err.name === 'InvalidStateError') {
        recognitionRef.current?.stop();
        setTimeout(() => {
          try {
            recognitionRef.current?.start();
            setIsListening(true);
          } catch (e) {
            console.error(e);
          }
        }, 150);
      }
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Register native Android SpeechBridge callbacks and Web SpeechRecognition
  useEffect(() => {
    // 1. Setup native Android callbacks
    window.onNativeSpeechReady = () => {
      setIsListening(true);
      setVoiceError('');
      setInterimText('');
    };

    window.onNativeSpeechStart = () => {
      setIsListening(true);
      setVoiceError('');
    };

    window.onNativeSpeechPartial = (partialText) => {
      if (partialText) {
        setInterimText(partialText);
        setInputText(partialText);
      }
    };

    window.onNativeSpeechResult = (finalText) => {
      setInterimText('');
      setInputText(finalText);
      setIsListening(false);
      handleAnalyze(finalText);
    };

    window.onNativeSpeechError = (errorCode) => {
      console.warn('Native speech error code:', errorCode);
      setIsListening(false);
      setInterimText('');

      if (errorCode === 'permission_denied') {
        setVoiceError(
          lang === 'gu'
            ? 'માઇક્રોફોનની પરવાનગી નથી મળી. કૃપા કરીને સેટિંગ્સમાં માઇક્રોફોન Allow કરો.'
            : 'Microphone permission denied. Please allow microphone in settings.'
        );
      } else if (errorCode === 'no_match' || errorCode === 'timeout') {
        setVoiceError(
          lang === 'gu'
            ? 'કોઈ અવાજ ઓળખાયો નથી. ફરીથી માઇક બટન દબાવીને સ્પષ્ટ બોલો.'
            : 'No speech recognized. Tap mic and speak again.'
        );
      } else if (errorCode === 'network') {
        setVoiceError(
          lang === 'gu'
            ? 'ગૂગલ સ્પીચ માટે ઇન્ટરનેટ કનેક્શન તપાસો અથવા નીચે બોક્સમાં લખો.'
            : 'Please check internet connection or type your entry below.'
        );
      } else {
        setVoiceError(
          lang === 'gu'
            ? 'અવાજ પકડવામાં તકલીફ થઈ. ફરી માઇક દબાવો અથવા નીચે લખો.'
            : 'Speech error. Tap mic again or type below.'
        );
      }
    };

    window.onNativeSpeechEnd = () => {
      setIsListening(false);
    };

    // 2. Setup Web Speech Recognition
    const isNative = window.AndroidSpeechBridge && typeof window.AndroidSpeechBridge.isAvailable === 'function'
      ? window.AndroidSpeechBridge.isAvailable()
      : !!window.AndroidSpeechBridge;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (isNative || SpeechRecognition) {
      setSpeechSupported(true);
    } else {
      setSpeechSupported(false);
    }

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = voiceLang;

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceError('');
        setInterimText('');
      };

      recognition.onresult = (event) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const trans = event.results[i][0]?.transcript || '';
          if (event.results[i].isFinal) {
            final += trans;
          } else {
            interim += trans;
          }
        }

        if (interim) {
          setInterimText(interim);
          setInputText(interim);
        }

        if (final) {
          setInterimText('');
          setInputText(final);
          handleAnalyze(final);
          setIsListening(false);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error event:', event);
        setIsListening(false);
        setInterimText('');

        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setVoiceError(
            lang === 'gu'
              ? 'માઇક્રોફોનની પરમિશન બ્લોક છે. ઉપર લૉક આઇકન પર ક્લિક કરી Allow કરો.'
              : 'Microphone permission blocked. Please allow microphone in settings.'
          );
        } else if (event.error === 'no-speech') {
          setVoiceError(
            lang === 'gu'
              ? 'કોઈ અવાજ સંભળાયો નથી. ફરી માઇક બટન દબાવીને બોલો.'
              : 'No speech detected. Please tap mic and speak again.'
          );
        } else if (event.error === 'network') {
          setVoiceError(
            lang === 'gu'
              ? 'ઇન્ટરનેટ નબળું છે. તમે નીચે લખીને પણ ચકાસી શકો છો.'
              : 'Network issue. You can type below to analyze.'
          );
        } else {
          setVoiceError(
            lang === 'gu'
              ? `વોઇસ એરર (${event.error}). ફરી પ્રયત્ન કરો.`
              : `Voice error (${event.error}). Please try again.`
          );
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText('');
      };

      recognitionRef.current = recognition;
    }

    return () => {
      delete window.onNativeSpeechReady;
      delete window.onNativeSpeechStart;
      delete window.onNativeSpeechPartial;
      delete window.onNativeSpeechResult;
      delete window.onNativeSpeechError;
      delete window.onNativeSpeechEnd;
    };
  }, [voiceLang, lang, selectedCategory]);

  // Handle auto-start when opened via "✨ બોલો"
  useEffect(() => {
    if (isOpen && autoStart && !autoStartedRef.current) {
      autoStartedRef.current = true;
      const timer = setTimeout(() => {
        startListening();
      }, 400);
      return () => clearTimeout(timer);
    }
    if (!isOpen) {
      autoStartedRef.current = false;
      stopListening();
    }
  }, [isOpen, autoStart]);

  const getIntentBadge = (intent) => {
    switch (intent) {
      case 'shopping':
        return { label: '🛒 ખરીદી યાદી (Shopping)', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', icon: ShoppingBag };
      case 'reminder':
        return { label: '⏰ કામ / મીટિંગ (Tasks & Reminders)', color: 'bg-blue-500/20 text-blue-300 border-blue-500/40', icon: Clock };
      case 'finance':
        return { label: '💰 હિસાબ / ખર્ચ (Finance)', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40', icon: IndianRupee };
      case 'medicine':
        return { label: '💊 દવા શેડ્યૂલ (Medicine)', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40', icon: Pill };
      case 'khata':
        return { label: '🤝 ખાતાવહી ઉધાર-જમા (Khata)', color: 'bg-orange-500/20 text-orange-300 border-orange-500/40', icon: Users };
      case 'event':
        return { label: '🎉 ઉત્સવ / ઇવેન્ટ (Events)', color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40', icon: Calendar };
      case 'water':
        return { label: '💧 વોટર ટ્રેકર (Water)', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', icon: Droplet };
      default:
        return { label: '📝 ડાયરી નોંધ (Diary Note)', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40', icon: BookOpen };
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-700/80 flex flex-col max-h-[92vh]">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Sparkles size={18} className="text-white animate-spin-slow" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight flex items-center gap-1.5">
                સ્માર્ટ AI આસિસ્ટન્ટ
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full uppercase tracking-wider font-black flex items-center gap-1">
                  <ShieldCheck size={10} /> સેવ પહેલાં કન્ફર્મેશન
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                તમે બોલશો તે ચકાસીને કન્ફર્મ કર્યા પછી જ સેવ થશે!
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {onOpenMobilePermissions && (
              <button
                type="button"
                onClick={onOpenMobilePermissions}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-white border border-slate-700 transition"
                title="મોબાઇલ પરવાનગી સેટિંગ્સ"
              >
                <Smartphone size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1">
          
          {/* Controls: Voice Language Selection */}
          <div className="flex items-center justify-between bg-slate-800/80 p-2 rounded-2xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 font-bold px-1.5 flex items-center gap-1">
              <Globe size={11} className="text-blue-400" />
              બોલવાની ભાષા:
            </span>
            <div className="flex items-center gap-1">
              {[
                { code: 'gu-IN', label: 'ગુજરાતી' },
                { code: 'hi-IN', label: 'हिन्दी' },
                { code: 'en-IN', label: 'English' },
              ].map((item) => (
                <button
                  key={item.code}
                  onClick={() => {
                    setVoiceLang(item.code);
                    if (isListening) stopListening();
                  }}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition active:scale-95 ${
                    voiceLang === item.code
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Direct Category Selection Bar (Exactly as shown in user's Image 2) */}
          <div className="bg-slate-800/85 p-2.5 rounded-2xl border border-slate-700/70 space-y-2 shadow-sm">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] text-slate-300 font-black flex items-center gap-1">
                <Zap size={13} className="text-amber-400" />
                {lang === 'gu' ? 'જો કેટેગરી બદલવી હોય તો ૧-ક્લિક કરો:' : 'Select Category (1-Click):'}
              </span>
              {selectedCategory !== 'auto' && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('auto');
                    if (inputText && inputText.trim()) {
                      handleAnalyze(inputText, 'auto');
                    }
                  }}
                  className="text-[10px] text-blue-400 hover:text-blue-300 font-bold underline cursor-pointer"
                >
                  {lang === 'gu' ? 'ઑટો મોડ (Auto)' : 'Auto'}
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'shopping', label: '🛒 ખરીદી' },
                { id: 'reminder', label: '⏰ મીટિંગ/કામ' },
                { id: 'finance', label: '💰 ખર્ચ/આવક' },
                { id: 'medicine', label: '💊 દવા' },
                { id: 'khata', label: '🤝 ખાતાવહી' },
                { id: 'event', label: '🎉 ઉત્સવ' },
                { id: 'note', label: '📝 નોંધ' },
              ].map((cat) => {
                const isSelected =
                  (parsedResult && parsedResult.intent === cat.id) ||
                  (!parsedResult && selectedCategory === cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleSelectCategoryDirectly(cat.id)}
                    className={`text-xs px-3 py-1.5 rounded-xl border font-black transition active:scale-95 flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-600/35 ring-1 ring-blue-300 scale-102'
                        : 'bg-slate-800/90 text-slate-300 border-slate-700/80 hover:bg-slate-700/80 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Voice Error Notification Banner */}
          {voiceError && (
            <div className="p-3 bg-red-950/70 border border-red-500/50 rounded-2xl text-xs text-red-200 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold leading-relaxed">{voiceError}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={startListening}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-red-600 hover:bg-red-500 px-2.5 py-1 rounded-lg transition"
                  >
                    <RefreshCw size={11} />
                    ફરી બોલો
                  </button>
                  {onOpenMobilePermissions && (
                    <button
                      onClick={onOpenMobilePermissions}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-200 bg-blue-900/60 hover:bg-blue-800 px-2.5 py-1 rounded-lg transition border border-blue-500/40"
                    >
                      <Smartphone size={11} />
                      પરવાનગી સેટિંગ્સ
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Pulsing Mic Visualizer */}
          <div className="flex flex-col items-center justify-center py-2">
            <button
              onClick={toggleListening}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 relative ${
                isListening
                  ? 'bg-gradient-to-tr from-red-500 to-pink-600 shadow-xl shadow-red-500/40 scale-110'
                  : 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 hover:shadow-xl hover:shadow-blue-500/30 active:scale-95'
              }`}
            >
              {isListening ? (
                <>
                  <span className="absolute inset-0 rounded-full border-4 border-red-400 animate-ping opacity-60" />
                  <Mic size={36} className="text-white" />
                </>
              ) : (
                <Mic size={36} className="text-white" />
              )}
            </button>

            {/* Sound Wave Animation when Listening */}
            {isListening && (
              <div className="flex items-center gap-1.5 mt-3 h-5">
                <span className="w-1 bg-red-400 rounded-full animate-bounce h-3" style={{ animationDelay: '0ms' }} />
                <span className="w-1 bg-pink-400 rounded-full animate-bounce h-5" style={{ animationDelay: '150ms' }} />
                <span className="w-1 bg-red-300 rounded-full animate-bounce h-4" style={{ animationDelay: '300ms' }} />
                <span className="w-1 bg-pink-400 rounded-full animate-bounce h-6" style={{ animationDelay: '450ms' }} />
                <span className="w-1 bg-red-400 rounded-full animate-bounce h-3" style={{ animationDelay: '200ms' }} />
              </div>
            )}

            <p className="text-xs font-bold mt-2 text-slate-200">
              {isListening
                ? '🎙️ હું સાંભળી રહ્યો છું, બોલો...'
                : 'માઇક દબાવીને બોલો (Tap to Speak)'}
            </p>
            {interimText && (
              <p className="text-xs text-amber-300 font-semibold mt-1 px-4 text-center italic truncate max-w-xs">
                "{interimText}..."
              </p>
            )}
            <span className="text-[10px] text-slate-400 mt-0.5">
              સક્રિય ભાષા: {voiceLang === 'gu-IN' ? 'ગુજરાતી' : voiceLang === 'hi-IN' ? 'हिन्दी' : 'English'}
            </span>
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAnalyze(inputText);
            }}
            className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 rounded-2xl p-1.5 pl-3.5 focus-within:border-blue-500"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={getInputPlaceholder()}
              className="flex-1 bg-transparent text-xs text-white focus:outline-none placeholder:text-slate-500"
            />
            <button
              type="submit"
              className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition active:scale-95 shadow-sm"
              title="વિશ્લેષણ કરો"
            >
              <Send size={15} />
            </button>
          </form>

          {/* AI Decision / Accurate Confirmation Card (Must Confirm Before Save!) */}
          {parsedResult && !isSaved && (
            <div className="bg-slate-800/95 border border-indigo-500/50 rounded-2xl p-4 space-y-3.5 animate-in fade-in slide-in-from-bottom duration-200 shadow-xl">
              
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck size={14} className="text-amber-400" />
                  સેવ કરતાં પહેલાં ચકાસણી:
                </span>
                {(() => {
                  const badge = getIntentBadge(parsedResult.intent);
                  const Icon = badge.icon;
                  return (
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${badge.color}`}
                    >
                      <Icon size={12} />
                      {badge.label}
                    </span>
                  );
                })()}
              </div>

              {/* Target Tab Destination Info Box */}
              <div className="bg-slate-900/90 rounded-2xl p-3.5 border border-slate-700 space-y-2">
                <div className="text-[11px] font-bold text-indigo-300 flex items-center justify-between">
                  <span>🎯 લક્ષ્ય ટેબ: {parsedResult.targetTab}</span>
                  {parsedResult.hasAlarm && (
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Clock size={10} /> અલાર્મ ઓન
                    </span>
                  )}
                </div>

                <p className="text-sm font-black text-white leading-snug">
                  {parsedResult.title}
                </p>

                {parsedResult.details && (
                  <p className="text-[11px] text-slate-300 font-medium bg-slate-800/60 p-2 rounded-xl border border-slate-700/60">
                    {parsedResult.details}
                  </p>
                )}

                {parsedResult.amount && (
                  <div className="flex items-center gap-2 text-xs pt-0.5">
                    <span className="text-slate-400 font-semibold">રકમ:</span>
                    <span className="font-black text-emerald-400 text-sm">
                      ₹{parsedResult.amount.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Quick Tab Category Override (In case user wants to change tab) */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-slate-400 font-semibold block">
                  જો કેટેગરી બદલવી હોય તો ૧-ક્લિક કરો:
                </span>
                <div className="flex flex-wrap gap-1">
                  {[
                    { id: 'shopping', label: '🛒 ખરીદી' },
                    { id: 'reminder', label: '⏰ મીટિંગ/કામ' },
                    { id: 'finance', label: '💰 ખર્ચ/આવક' },
                    { id: 'medicine', label: '💊 દવા' },
                    { id: 'khata', label: '🤝 ખાતાવહી' },
                    { id: 'event', label: '🎉 ઉત્સવ' },
                    { id: 'note', label: '📝 નોંધ' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleSelectCategoryDirectly(cat.id)}
                      className={`text-[10px] px-2 py-1 rounded-lg border font-bold transition active:scale-95 ${
                        parsedResult.intent === cat.id
                          ? 'bg-blue-600 text-white border-blue-400'
                          : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Two Clear Buttons: Confirm & Save vs Cancel */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => executeSaveEntry(parsedResult)}
                  className="py-3 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 size={16} />
                  <span>✅ હા, સેવ કરો</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setParsedResult(null);
                    setInputText('');
                  }}
                  className="py-3 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-bold text-xs transition active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <X size={15} />
                  <span>❌ રદ કરો</span>
                </button>
              </div>

            </div>
          )}

          {/* Success Banner when entry is confirmed & saved */}
          {isSaved && parsedResult && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border border-emerald-500/60 space-y-2.5 text-xs text-emerald-200 animate-fade-in shadow-xl">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 size={22} className="text-emerald-400 shrink-0" />
                <div>
                  <div className="font-extrabold text-white text-sm">
                    ✓ સફળતાપૂર્વક સાચવી લીધું!
                  </div>
                  <div className="text-[11px] text-emerald-300 font-medium">
                    {parsedResult.title} ➔ {parsedResult.targetTab}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    setInputText('');
                    setParsedResult(null);
                    setIsSaved(false);
                    startListening();
                  }}
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] active:scale-95 transition flex items-center justify-center gap-1"
                >
                  <Mic size={13} />
                  <span>🎙️ બીજી એન્ટ્રી બોલો</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[11px] active:scale-95 transition"
                >
                  વિન્ડો બંધ કરો ✕
                </button>
              </div>
            </div>
          )}

          {/* Quick Voice Prompt Chips across all tabs */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
              <HelpCircle size={12} className="text-blue-400" />
              તમામ ટેબના સચોટ ઉદાહરણો (ક્લિક કરી ચકાસો):
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
              {currentPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputText(p);
                    handleAnalyze(p);
                  }}
                  className="text-[11px] bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 px-2.5 py-1.5 rounded-xl transition text-left active:scale-95 hover:border-slate-500"
                >
                  "{p}"
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
