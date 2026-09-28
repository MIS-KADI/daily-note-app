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
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { aiAssistantService } from '../services/aiAssistantService';
import { t } from '../services/i18n';

export default function SmartAssistantModal({
  isOpen,
  onClose,
  lang = 'gu',
  onAddFinance,
  onAddReminder,
  onAddNote,
  onAddKhata,
  onAddWater,
}) {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [parsedResult, setParsedResult] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);

  // Suggested quick prompts in current language
  const PROMPTS = {
    gu: [
      'આજે શાકભાજી માટે ૨૫૦ રૂપિયા ખર્ચ્યા',
      'બેંક ઓફ બરોડામાં ૫૦૦૦ જમા કરાવ્યા',
      'કાલે સવારે ૧૧ વાગ્યે ડોક્ટર સાથે મીટિંગ છે',
      'રમેશભાઈ પાસેથી ૨૦૦૦ લેવાના છે',
      '૨ ગ્લાસ પાણી પીધું',
      'આજે પરિવાર સાથે ખૂબ સુંદર સમય વિતાવ્યો',
    ],
    hi: [
      'आज सब्जी के लिए 250 रुपये खर्च किए',
      'बैंक ऑफ बड़ौदा में 5000 जमा किए',
      'कल सुबह 11 बजे डॉक्टर के साथ मीटिंग है',
      'रमेश भाई से 2000 लेने हैं',
      '2 ग्लास पानी पिया',
      'आज का दिन बहुत अच्छा और सुखद रहा',
    ],
    en: [
      'Spent 250 rupees on vegetables',
      'Deposited 5000 in Bank of Baroda',
      'Meeting with doctor tomorrow at 11 am',
      'Ramesh owes me 2000 rupees',
      'Drank 2 glasses of water',
      'Had a wonderful productive day today',
    ],
  };

  const currentPrompts = PROMPTS[lang] || PROMPTS.en || PROMPTS.gu;

  // Initialize SpeechRecognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      const voiceLangMap = {
        gu: 'gu-IN',
        hi: 'hi-IN',
        en: 'en-IN',
        es: 'es-ES',
        fr: 'fr-FR',
        de: 'de-DE',
        ar: 'ar-SA',
      };
      recognition.lang = voiceLangMap[lang] || 'gu-IN';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        handleAnalyze(transcript);
        setIsListening(false);
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

  if (!isOpen) return null;

  const toggleListening = () => {
    if (!speechSupported) {
      alert(
        lang === 'gu'
          ? 'તમારા બ્રાઉઝરમાં વોઇસ ટાઇપિંગ સપોર્ટ નથી. તમે નીચે બોક્સમાં ટાઇપ કરી શકો છો.'
          : 'Speech recognition is not supported in this browser. Please type below.'
      );
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        setParsedResult(null);
        setIsSaved(false);
      } catch (err) {
        console.warn('Speech recognition error:', err);
      }
    }
  };

  const handleAnalyze = (text) => {
    if (!text || !text.trim()) return;
    const result = aiAssistantService.parseInput(text, lang);
    setParsedResult(result);
    setIsSaved(false);

    // Speak brief feedback
    if (result) {
      aiAssistantService.speak(result.confirmationMessage, lang);
    }
  };

  const handleConfirmSave = () => {
    if (!parsedResult) return;

    if (parsedResult.intent === 'finance') {
      onAddFinance?.({
        id: 'f-' + Date.now(),
        type: parsedResult.type,
        amount: parsedResult.amount,
        category: parsedResult.category,
        description: parsedResult.description,
        paymentMode: parsedResult.paymentMode,
        date: parsedResult.date,
      });
    } else if (parsedResult.intent === 'reminder') {
      onAddReminder?.({
        id: 'rem-' + Date.now(),
        title: parsedResult.title,
        description: parsedResult.description,
        type: parsedResult.type,
        time: parsedResult.time,
        date: parsedResult.date,
        hasAlarm: true,
        isCompleted: false,
        priority: 'high',
      });
    } else if (parsedResult.intent === 'khata') {
      onAddKhata?.({
        id: 'kh-' + Date.now(),
        partyName: parsedResult.partyName,
        phone: '',
        type: parsedResult.type,
        amount: parsedResult.amount,
        date: new Date().toISOString().split('T')[0],
        dueDate: parsedResult.dueDate,
        description: parsedResult.description,
        isSettled: false,
      });
    } else if (parsedResult.intent === 'water') {
      onAddWater?.(parsedResult.glasses);
    } else {
      // Note
      onAddNote?.({
        id: 'n-' + Date.now(),
        title: parsedResult.title,
        content: parsedResult.content,
        category: 'અંગત',
        date: parsedResult.date,
        isPinned: false,
        color: '#eff6ff',
      });
    }

    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    setIsSaved(true);
    setTimeout(() => {
      onClose();
      setParsedResult(null);
      setInputText('');
      setIsSaved(false);
    }, 1500);
  };

  const getIntentBadge = (intent) => {
    switch (intent) {
      case 'finance':
        return { label: '💰 હિસાબ (Finance)', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: IndianRupee };
      case 'reminder':
        return { label: '⏰ કામ / મીટિંગ (Task)', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: Clock };
      case 'khata':
        return { label: '🤝 ખાતાવહી (Khata)', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: Users };
      case 'water':
        return { label: '💧 વોટર ટ્રેકર (Water)', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30', icon: Droplet };
      default:
        return { label: '📝 ડાયરી નોંધ (Diary Note)', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', icon: BookOpen };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-700/80 flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Sparkles size={18} className="text-white animate-spin-slow" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight flex items-center gap-1.5">
                રોજિંદો AI આસિસ્ટન્ટ
                <span className="text-[9px] bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-wider font-extrabold">
                  Smart Voice
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                બોલો અને એપ જાતે હિસાબ, કામ કે ડાયરીમાં નોંધશે!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Pulsing Mic Visualizer */}
          <div className="flex flex-col items-center justify-center py-4">
            <button
              onClick={toggleListening}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 relative ${
                isListening
                  ? 'bg-gradient-to-tr from-red-500 to-pink-600 shadow-xl shadow-red-500/40 scale-110 animate-pulse'
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
            <p className="text-xs font-semibold mt-3 text-slate-300">
              {isListening
                ? '🎙️ હું સાંભળી રહ્યો છું, બોલો...'
                : 'માઇક દબાવીને બોલો (Tap to Speak)'}
            </p>
            <span className="text-[10px] text-slate-500 mt-0.5">
              ગુજરાતી / हिन्दी / English સપોર્ટ
            </span>
          </div>

          {/* Quick Voice Chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
              <HelpCircle size={12} className="text-blue-400" />
              આવી રીતે બોલી શકો છો (ઉદાહરણો):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {currentPrompts.slice(0, 4).map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputText(p);
                    handleAnalyze(p);
                  }}
                  className="text-[11px] bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-300 px-2.5 py-1.5 rounded-xl transition text-left active:scale-95"
                >
                  "{p}"
                </button>
              ))}
            </div>
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
              placeholder="અથવા અહીં લખો (e.g. આજે ૨૦૦ ખર્ચ્યા)..."
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

          {/* AI Decision / Action Preview Card */}
          {parsedResult && (
            <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-4 space-y-3 animate-in fade-in slide-in-from-bottom duration-200">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">આસિસ્ટન્ટ નિર્ણય:</span>
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

              <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-700/50 space-y-1.5">
                <p className="text-xs font-bold text-white leading-snug">
                  {parsedResult.title}
                </p>
                {parsedResult.details && (
                  <p className="text-[11px] text-slate-400">{parsedResult.details}</p>
                )}
                {parsedResult.amount && (
                  <div className="flex items-center gap-2 text-xs pt-1">
                    <span className="text-slate-400">રકમ:</span>
                    <span className="font-extrabold text-emerald-400">
                      ₹{parsedResult.amount.toLocaleString()}
                    </span>
                  </div>
                )}
                {parsedResult.time && (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400">સમય:</span>
                    <span className="font-semibold text-blue-300">
                      {parsedResult.time} ({parsedResult.date})
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm / Save Button */}
              <button
                onClick={handleConfirmSave}
                disabled={isSaved}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold shadow-md transition active:scale-98 ${
                  isSaved
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white shadow-blue-500/25'
                }`}
              >
                <CheckCircle2 size={16} />
                {isSaved ? 'સફળતાપૂર્વક સાચવી લેવાયું! ✅' : 'આ એન્ટ્રી એપમાં કન્ફર્મ કરો'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
