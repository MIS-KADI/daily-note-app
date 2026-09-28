import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Download,
  Bot,
  Flame,
  CheckCircle2,
  Clock,
  Pill,
  PieChart,
  Mic,
  ShieldCheck,
} from 'lucide-react';

const SCENES = [
  {
    id: 1,
    title: "એપ પરિચય & સ્માર્ટ આસિસ્ટન્ટ",
    shortTitle: "૧. પરિચય",
    duration: 12,
    accent: "from-blue-600/30 to-indigo-600/30",
    audioText: "નમસ્કાર મિત્રો! દૈનિક ડાયરી અને સ્માર્ટ આસિસ્ટન્ટ એપ્લિકેશનમાં આપનું સ્વાગત છે. આ એપ તમારા રોજિંદા કામો, ડાયરી, સ્વાસ્થ્ય અને હિસાબ-કિતાબને એક જ જગ્યાએ સરળ બનાવે છે.",
    subtitles: "નમસ્કાર! દૈનિક ડાયરી અને સ્માર્ટ આસિસ્ટન્ટ એપ તમારા રોજિંદા દિવસને સુવ્યવસ્થિત અને સરળ બનાવે છે.",
    icon: "📔✨",
    render: () => (
      <div className="flex flex-col items-center text-center p-4">
        <div className="text-5xl mb-3 animate-bounce">📔✨</div>
        <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold tracking-wide border border-indigo-400/30 mb-2">
          ALL-IN-ONE DAILY COMPANION
        </span>
        <h3 className="text-xl sm:text-2xl font-black text-white mb-2">
          દૈનિક ડાયરી & સ્માર્ટ આસિસ્ટન્ટ
        </h3>
        <p className="text-slate-300 text-xs sm:text-sm max-w-md mb-4">
          તમારું ડિજિટલ જીવન: ડાયરી, ટાસ્ક, દવાઓ, વોકિંગ સ્ટેપ્સ અને ખર્ચ હિસાબ - હવે તમારા હાથમાં!
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-[11px] font-semibold text-emerald-300 border border-emerald-500/20">
            🔒 ૧૦૦% સુરક્ષિત
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-[11px] font-semibold text-blue-300 border border-blue-500/20">
            ⚡ ઇન્ટરનેટ વગર ઓફલાઇન
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-[11px] font-semibold text-purple-300 border border-purple-500/20">
            🎙️ ગુજરાતી વોઇસ આસિસ્ટન્ટ
          </span>
        </div>
      </div>
    ),
  },
  {
    id: 2,
    title: "ડાયરી & ગુજરાતી વોઇસ ટાઈપિંગ",
    shortTitle: "૨. વોઇસ ડાયરી",
    duration: 14,
    accent: "from-purple-600/30 to-pink-600/30",
    audioText: "જો તમને ટાઈપ કરવાનો કંટાળો આવતો હોય તો ચિંતા ના કરો! આસિસ્ટન્ટ બટન દબાવીને તમે ગુજરાતીમાં બોલશો એટલે એપ આપોઆપ સચોટ ગુજરાતીમાં લખી લેશે.",
    subtitles: "ગુજરાતીમાં બોલો અને આપોઆપ ટાઇપ થવા દો! સાથે AI મૂડ ટ્રેકિંગ અને દૈનિક પ્રશ્નો ઉપલબ્ધ છે.",
    icon: "🎙️",
    render: () => (
      <div className="w-full max-w-md bg-slate-800/90 border border-slate-700 rounded-2xl p-4 text-left shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700">
          <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            🎙️ ગુજરાતી વોઇસ ટાઈપિંગ ચાલુ છે...
          </span>
          <span className="text-xs text-slate-400">મૂડ: 😊 ખુશ</span>
        </div>
        <div className="py-3 text-slate-200 text-sm font-medium leading-relaxed">
          "આજે સવારે બગીચામાં વોકિંગ કર્યું અને મિત્ર રમેશભાઈ સાથે મીટિંગ પૂર્ણ કરી..."
        </div>
        <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-400">
          <span className="px-2 py-0.5 rounded-md bg-slate-700">AI Prompt: આજે દિવસનો શ્રેષ્ઠ અનુભવ કયો હતો?</span>
        </div>
      </div>
    ),
  },
  {
    id: 3,
    title: "ટાસ્ક & મીટિંગ એલાર્મ (એપ બંધ હોય તો પણ)",
    shortTitle: "૩. ટાસ્ક એલાર્મ",
    duration: 15,
    accent: "from-amber-600/30 to-orange-600/30",
    audioText: "તમારા મહત્વના કામો કે મીટિંગ ક્યારેય ચૂકશો નહીં! ખાસ વાત એ છે કે જો તમે એપ બંધ કરી દીધી હશે તો પણ એન્ડ્રોઇડ એક્ઝેક્ટ એલાર્મ સમયસર સાઉન્ડ સાથે વાગશે.",
    subtitles: "એપ બંધ હોય કે ફોન લોક હોય, Android Exact Alarm સમયસર સાઉન્ડ સાથે નોટિફિકેશન આપશે!",
    icon: "⏰",
    render: () => (
      <div className="w-full max-w-md bg-slate-800/90 border border-amber-500/40 rounded-2xl p-4 text-left shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-lg">⏰</div>
            <div>
              <h4 className="text-xs font-bold text-white">ઓફિસ પ્રોજેક્ટ રિવ્યુ મીટિંગ</h4>
              <p className="text-[10px] text-amber-400">આજે સાંજે ૫:૩૦ વાગ્યે</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
            LOUD ALARM ON
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-xs text-slate-300 flex items-center gap-2">
          <span className="text-base">🔔</span>
          <span>ફોન સ્લીપ મોડમાં હોય તો પણ સ્ક્રીન પર નોટિફિકેશન એલાર્મ રિંગ થશે.</span>
        </div>
      </div>
    ),
  },
  {
    id: 4,
    title: "દવાઓ અને હેલ્થ કેર રીમાઇન્ડર",
    shortTitle: "૪. દવા રીમાઇન્ડર",
    duration: 13,
    accent: "from-red-600/30 to-pink-600/30",
    audioText: "ઘરના વડીલો કે તમારી નિયમિત દવાઓ લેવાનું ભૂલી ન જવાય તે માટે સવાર, બપોર અને સાંજનું જમ્યા પહેલા કે પછીનું દવા રીમાઇન્ડર સેટ કરો.",
    subtitles: "સવાર, બપોર અને રાતની દવાઓ જમ્યા પહેલાં કે પછીનું પરફેક્ટ સમયપત્રક અને એલાર્મ!",
    icon: "💊",
    render: () => (
      <div className="w-full max-w-md bg-slate-800/90 border border-red-500/30 rounded-2xl p-4 text-left shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-700">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💊</span>
            <div>
              <div className="text-xs font-bold text-white">બીપી અને મલ્ટીવિટામિન ટેબ્લેટ</div>
              <div className="text-[10px] text-slate-400">રોજ સવારે નાસ્તા પછી (૯:૦૦ AM)</div>
            </div>
          </div>
          <span className="text-xs font-bold text-red-400">૧ ગોળી</span>
        </div>
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-slate-400">આજનું સ્ટેટસ:</span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle2 size={13} /> આજે લઈ લીધી
          </span>
        </div>
      </div>
    ),
  },
  {
    id: 5,
    title: "ઓટોમેટિક વોકિંગ સ્ટેપ કાઉન્ટર",
    shortTitle: "૫. સ્ટેપ ટ્રેકર",
    duration: 13,
    accent: "from-emerald-600/30 to-teal-600/30",
    audioText: "તમારી ફિટનેસ માટે આ એપમાં ઇન-બિલ્ટ મોશન સેન્સર સ્ટેપ કાઉન્ટર આપેલું છે. તમે જ્યારે ચાલશો ત્યારે તમારા ડગલાં અને કેલરી આપોઆપ ગણાઈ જશે.",
    subtitles: "મોશન સેન્સર સાથે આપોઆપ સ્ટેપ ગણતરી, કેલરી મીટર અને ડેઇલી ફિટનેસ ગોલ!",
    icon: "👟",
    render: () => (
      <div className="w-full max-w-md bg-slate-800/90 border border-emerald-500/40 rounded-2xl p-4 text-center shadow-2xl">
        <div className="flex items-center justify-center gap-4 mb-3">
          <div className="w-20 h-20 rounded-full border-4 border-emerald-400 flex flex-col items-center justify-center bg-emerald-500/10 shadow-lg shadow-emerald-500/20">
            <span className="text-lg font-black text-white">4,850</span>
            <span className="text-[9px] text-emerald-300 font-bold">ડગલાં</span>
          </div>
          <div className="text-left space-y-1">
            <div className="text-xs text-slate-300">🔥 કેલરી: <strong className="text-emerald-300">194 kcal</strong></div>
            <div className="text-xs text-slate-300">📍 અંતર: <strong className="text-emerald-300">3.6 km</strong></div>
            <div className="text-xs text-slate-300">🎯 ટાર્ગેટ: <strong className="text-emerald-300">6,000 સ્ટેપ્સ</strong></div>
          </div>
        </div>
        <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-teal-400 to-emerald-400 h-full w-[80%] rounded-full"></div>
        </div>
      </div>
    ),
  },
  {
    id: 6,
    title: "ફાઇનાન્સ ટ્રેકર અને સ્માર્ટ ચાર્ટ્સ",
    shortTitle: "૬. ચાર્ટ્સ & ખર્ચ",
    duration: 15,
    accent: "from-cyan-600/30 to-blue-600/30",
    audioText: "તમારી આવક અને ખર્ચનો સંપૂર્ણ હિસાબ રાખો! આકર્ષક પાય-ચાર્ટ અને ગ્રાફ દ્વારા તમને ખબર પડશે કે ક્યાં સૌથી વધુ ખર્ચ થયો. સાથે એક જ ક્લિકમાં પીડીએફ રિપોર્ટ પણ ડાઉનલોડ કરી શકો છો.",
    subtitles: "આવક-ખર્ચ વિશ્લેષણ, વિઝ્યુઅલ ગ્રાફ્સ અને ૧-ક્લિક PDF સ્ટેટમેન્ટ ડાઉનલોડ!",
    icon: "📊",
    render: () => (
      <div className="w-full max-w-md bg-slate-800/90 border border-cyan-500/40 rounded-2xl p-4 text-left shadow-2xl">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-700">
          <div className="text-xs font-bold text-white flex items-center gap-1.5">
            <PieChart size={15} className="text-cyan-400" /> માસિક નાણાકીય વિશ્લેષણ
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">PDF READY</span>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="text-[10px] text-emerald-400">કુલ આવક</div>
            <div className="text-sm font-black text-emerald-300">₹ 45,000</div>
          </div>
          <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20">
            <div className="text-[10px] text-red-400">કુલ ખર્ચ</div>
            <div className="text-sm font-black text-red-300">₹ 18,400</div>
          </div>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-300">
          <span>કરિયાણું: 40%</span>
          <span>બિલ: 25%</span>
          <span>બચત: 35%</span>
        </div>
      </div>
    ),
  },
  {
    id: 7,
    title: "ઓફલાઇન મોડ & APK ઇન્સ્ટોલેશન",
    shortTitle: "૭. APK & ઓફલાઇન",
    duration: 14,
    accent: "from-indigo-600/30 to-emerald-600/30",
    audioText: "આ એપ સંપૂર્ણપણે ઇન્ટરનેટ વગર પણ ચાલે છે! તમે તમારા મોબાઈલમાં સીધી APK ફાઇલ ઇન્સ્ટોલ કરી શકો છો અને iPhone યુઝર્સ હોમ સ્ક્રીન પર એડ કરી શકે છે.",
    subtitles: "ઇન્ટરનેટ વગર ૧૦૦% ઓફલાઇન સપોર્ટ! Android APK ડાઉનલોડ કરો અથવા iPhone પર વાપરો.",
    icon: "🚀",
    render: () => (
      <div className="w-full max-w-md bg-gradient-to-b from-indigo-900/60 to-slate-900 border border-indigo-500/50 rounded-2xl p-5 text-center shadow-2xl">
        <div className="text-3xl mb-2">🚀📱</div>
        <h3 className="text-base font-black text-white mb-1">આજે જ એપ્લિકેશન ઇન્સ્ટોલ કરો!</h3>
        <p className="text-xs text-indigo-200 mb-4">દરેક ગુજરાતી માટે શ્રેષ્ઠ અને સૌથી સરળ દૈનિક સાથી.</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
          <a
            href="https://github.com/MIS-KADI/daily-note-app/releases/download/v1.0.0/daily-diary-v1.0.0.apk"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg transition flex items-center justify-center gap-1.5"
          >
            <Download size={14} /> Android APK ડાઉનલોડ
          </a>
        </div>
      </div>
    ),
  },
];

export default function AppVideoGuideModal({ isOpen, onClose }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [elapsedInScene, setElapsedInScene] = useState(0);

  const timerRef = useRef(null);
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const totalAppDuration = SCENES.reduce((acc, s) => acc + s.duration, 0);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const speakScene = (scene) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(scene.audioText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const guVoice = voices.find((v) => v.lang.startsWith('gu') || v.lang.includes('Gujarati'));
    const hiVoice = voices.find((v) => v.lang.startsWith('hi') || v.lang.includes('Hindi'));
    const inVoice = voices.find((v) => v.lang.endsWith('IN'));

    if (guVoice) utterance.voice = guVoice;
    else if (hiVoice) utterance.voice = hiVoice;
    else if (inVoice) utterance.voice = inVoice;

    utterance.onend = () => {
      if (isPlayingRef.current) {
        handleNext();
      }
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      clearInterval(timerRef.current);
    } else {
      setIsPlaying(true);
      speakScene(SCENES[currentIdx]);
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setElapsedInScene((prev) => prev + 1);
      }, 1000);
    }
  };

  const handleNext = () => {
    if (currentIdx < SCENES.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setElapsedInScene(0);
    } else {
      setIsPlaying(false);
      setCurrentIdx(0);
      setElapsedInScene(0);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
      setElapsedInScene(0);
    }
  };

  const handleJump = (idx) => {
    setCurrentIdx(idx);
    setElapsedInScene(0);
    if (isPlaying) {
      speakScene(SCENES[idx]);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      speakScene(SCENES[currentIdx]);
    }
  }, [currentIdx]);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  if (!isOpen) return null;

  const currentScene = SCENES[currentIdx];
  let previousDuration = 0;
  for (let i = 0; i < currentIdx; i++) {
    previousDuration += SCENES[i].duration;
  }
  const totalElapsed = previousDuration + elapsedInScene;
  const progressPercent = Math.min(100, (totalElapsed / totalAppDuration) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-sm shadow">
              🎬
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                AI વિડીયો માર્ગદર્શિકા <span className="text-[10px] px-1.5 py-0.2 bg-indigo-500/20 text-indigo-300 rounded-full font-mono">HD</span>
              </h2>
              <p className="text-[10px] text-slate-400 font-medium">સંપૂર્ણ એપ્લિકેશન પરિચય (ગુજરાતી અવાજ સાથે)</p>
            </div>
          </div>
          
          <button
            onClick={() => {
              if (window.speechSynthesis) window.speechSynthesis.cancel();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Video Canvas Stage */}
        <div className="relative aspect-video sm:min-h-[320px] bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4 overflow-hidden border-b border-slate-800">
          
          {/* Dynamic Ambient Glow */}
          <div className={`absolute w-72 h-72 rounded-full bg-gradient-to-r ${currentScene.accent} blur-3xl pointer-events-none transition-all duration-700`} />

          {/* Render Scene */}
          <div className="relative z-10 w-full flex flex-col items-center">
            {currentScene.render()}
          </div>

          {/* AI Presenter Badge */}
          <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-700/60 backdrop-blur-md shadow-lg">
            <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-xs">
              🤖
            </div>
            <div className="text-[9px] font-bold text-slate-300 flex items-center gap-1">
              <span>AI Narrator</span>
              {isPlaying && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
            </div>
          </div>

          {/* Live Subtitle */}
          <div className="absolute bottom-3 left-3 right-28 z-20 pointer-events-none">
            <div className="text-left bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-[11px] font-medium text-amber-200 truncate">
              {currentScene.subtitles}
            </div>
          </div>

        </div>

        {/* Controls & Progress */}
        <div className="p-3 bg-slate-950 flex flex-col gap-2.5">
          {/* Progress Bar */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400">{formatTime(totalElapsed)}</span>
            <div className="relative flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-slate-400">{formatTime(totalAppDuration)}</span>
          </div>

          {/* Buttons Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                title="અગાઉનું દ્રશ્ય"
              >
                <SkipBack size={15} />
              </button>

              <button
                onClick={handlePlayPause}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-1.5"
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                <span>{isPlaying ? 'થોભો (Pause)' : 'પ્લે વિડીયો (Play)'}</span>
              </button>

              <button
                onClick={handleNext}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                title="આગળનું દ્રશ્ય"
              >
                <SkipForward size={15} />
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  setVoiceEnabled(!voiceEnabled);
                  if (voiceEnabled && window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                  }
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                title="અવાજ ચાલુ / બંધ"
              >
                {voiceEnabled ? <Volume2 size={15} className="text-emerald-400" /> : <VolumeX size={15} className="text-slate-500" />}
              </button>
            </div>
          </div>

          {/* Quick Scene Selector Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none border-t border-slate-800/80">
            {SCENES.map((scene, idx) => (
              <button
                key={scene.id}
                onClick={() => handleJump(idx)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition ${
                  idx === currentIdx
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800/80 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {scene.shortTitle}
              </button>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
