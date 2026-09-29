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
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { aiAssistantService } from '../services/aiAssistantService';
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
}) {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [parsedResult, setParsedResult] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const [interimText, setInterimText] = useState('');
  
  // Voice language selection
  const defaultVoiceLang = lang === 'hi' ? 'hi-IN' : lang === 'en' ? 'en-IN' : 'gu-IN';
  const [voiceLang, setVoiceLang] = useState(defaultVoiceLang);

  const recognitionRef = useRef(null);
  const autoStartedRef = useRef(false);

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

  const currentPrompts = PROMPTS[lang] || PROMPTS.gu;

  // Initialize SpeechRecognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true; // Enables live real-time voice feedback!
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
              ? 'માઇક્રોફોનની પરમિશન બ્લોક કરેલ છે. કૃપા કરીને બ્રાઉઝર/એપ સેટિંગ્સમાં માઇક્રોફોન Allow કરો.'
              : lang === 'hi'
              ? 'माइक्रोफ़ोन अनुमति बंद है। कृपया सेटिंग्स में माइक्रोफ़ोन चालू करें।'
              : 'Microphone permission blocked. Please allow microphone in settings.'
          );
        } else if (event.error === 'no-speech') {
          setVoiceError(
            lang === 'gu'
              ? 'કોઈ અવાજ સંભળાયો નથી. ફરી માઇક બટન દબાવીને બોલો.'
              : lang === 'hi'
              ? 'कोई आवाज़ सुनाई नहीं दी। कृपया फिर से बोलें।'
              : 'No speech detected. Please tap mic and speak again.'
          );
        } else if (event.error === 'network') {
          setVoiceError(
            lang === 'gu'
              ? 'ઇન્ટરનેટ નબળું છે જેથી વોઇસ પ્રોસેસ થઈ શક્યો નહીં. તમે નીચે લખીને પણ વિશ્લેષણ કરી શકો છો.'
              : lang === 'hi'
              ? 'नेटवर्क समस्या के कारण आवाज़ नहीं पहचानी गई। आप नीचे लिख सकते हैं।'
              : 'Network issue. You can type below to analyze.'
          );
        } else {
          setVoiceError(
            lang === 'gu'
              ? `વોઇસ એરર (${event.error}). કૃપા કરીને ફરી પ્રયત્ન કરો.`
              : `Voice error (${event.error}). Please try again.`
          );
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText('');
      };

      recognitionRef.current = recognition;
    } else {
      setSpeechSupported(false);
    }
  }, [voiceLang, lang]);

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

  if (!isOpen) return null;

  const startListening = async () => {
    if (!speechSupported) {
      setVoiceError(
        lang === 'gu'
          ? 'તમારા બ્રાઉઝરમાં વોઇસ સપોર્ટ ઉપલબ્ધ નથી. તમે નીચે બોક્સમાં લખીને વિશ્લેષણ કરી શકો છો.'
          : 'Voice typing not supported. Please type below.'
      );
      return;
    }

    setVoiceError('');
    setInterimText('');

    // Pre-flight check audio permission via mediaDevices to trigger Android system permission popup
    if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
      } catch (micErr) {
        console.warn('Microphone permission check warning:', micErr);
        if (micErr.name === 'NotAllowedError' || micErr.name === 'PermissionDeniedError') {
          setVoiceError(
            lang === 'gu'
              ? 'માઇક્રોફોનની પરવાનગી નથી મળી. કૃપા કરીને સેટિંગ્સમાં માઇક્રોફોન Allow કરો.'
              : 'Microphone permission denied. Please allow microphone access.'
          );
          setIsListening(false);
          return;
        }
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
      // Already running or busy
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

  const stopListening = () => {
    try {
      recognitionRef.current?.stop();
    } catch (e) {
      // Ignore
    }
    setIsListening(false);
    setInterimText('');
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
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
          {/* Voice Language Selection Bar */}
          <div className="flex items-center justify-between bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 font-bold px-2 flex items-center gap-1">
              <Globe size={11} className="text-blue-400" />
              ભાષા:
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
                    if (isListening) {
                      stopListening();
                    }
                  }}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition active:scale-95 ${
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

          {/* Voice Error Notification Banner */}
          {voiceError && (
            <div className="p-3 bg-red-950/70 border border-red-500/50 rounded-2xl text-xs text-red-200 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold leading-relaxed">{voiceError}</p>
                <button
                  onClick={startListening}
                  className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-white bg-red-600/80 hover:bg-red-600 px-2.5 py-1 rounded-lg transition"
                >
                  <RefreshCw size={11} />
                  ફરી પ્રયત્ન કરો
                </button>
              </div>
            </div>
          )}

          {/* Pulsing Mic Visualizer */}
          <div className="flex flex-col items-center justify-center py-3">
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

          {/* Quick Voice Chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
              <HelpCircle size={12} className="text-blue-400" />
              આવી રીતે બોલી શકો છો (ઉદાહરણો પર ક્લિક કરો):
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
