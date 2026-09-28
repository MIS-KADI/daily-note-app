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
} from 'lucide-react';

const SCENES = [
  {
    id: 1,
    title: "મિતુનું સ્વાગત & સુપર ડાયરી",
    shortTitle: "૧. મસ્તીભર્યું સ્વાગત",
    prop: "👋",
    bubble: "નમસ્તે દોસ્તો! 🎉",
    glasses: false,
    cape: false,
    duration: 12,
    accent: "from-amber-500/30 to-orange-500/30",
    audioText: "અરે વાહ! નમસ્તે મિત્રો, હું છું તમારો દોસ્ત મિતુ! શું તમે તમારી રોજિંદી ડાયરી, મહત્વના કામો અને હિસાબ સાચવવાની મજા માણવા માંગો છો? તો આ દૈનિક ડાયરી અને સ્માર્ટ આસિસ્ટન્ટ તમારા માટે જ બની છે!",
    subtitles: "હું છું મિતુ! આવો જાણીએ તમારી આ સુપર ડાયરીના જબરદસ્ત ફીચર્સ વિશે!",
    render: () => (
      <div className="bg-gradient-to-br from-indigo-900/90 to-purple-900/90 border-2 border-amber-400 rounded-3xl p-4 text-left shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-indigo-700/60">
          <span className="text-xs font-black text-amber-300 flex items-center gap-1">
            <span>⭐</span> ALL-IN-ONE સ્માર્ટ સાથી
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px]">
            ૧૦૦% FREE
          </span>
        </div>
        <h3 className="text-base sm:text-lg font-black text-white mb-1.5 leading-tight">
          તમારું આખું જીવન, હવે એક જ જગ્યાએ!
        </h3>
        <p className="text-[11px] sm:text-xs text-indigo-100 mb-3 leading-relaxed">
          ડાયરી લખો, દવાઓ યાદ રાખો, ડગલાં ગણો અને હિસાબ રાખો - બધું જ સરળ અને મનોરંજક!
        </p>
        <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-[11px] font-bold">
          <div className="p-2 rounded-xl bg-slate-950/60 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <span>🔒</span> ગુપ્ત & સુરક્ષિત
          </div>
          <div className="p-2 rounded-xl bg-slate-950/60 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <span>⚡</span> નેટ વગર પણ ચાલુ
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 2,
    title: "બોલીને લખો (ગુજરાતી વોઇસ ડાયરી)",
    shortTitle: "૨. વોઇસ ડાયરી",
    prop: "🎙️",
    bubble: "બસ બોલો, હું લખીશ! 🎙️",
    glasses: false,
    cape: false,
    duration: 14,
    accent: "from-purple-500/30 to-pink-500/30",
    audioText: "જો તમને હાથથી ટાઈપિંગ કરવાનો કંટાળો આવતો હોય તો ચિંતા બિલકુલ ના કરો! આસિસ્ટન્ટ માઈક બટન દબાવો અને ગુજરાતીમાં બોલો. જુઓ કેવી ફટાફટ તમારી વાત અહીં લખાઈ જાય છે!",
    subtitles: "ગુજરાતીમાં બોલો અને ઓટોમેટીક લખાઈ જશે! સાથે મજાના મૂડ ઇમોજી પણ!",
    render: () => (
      <div className="bg-gradient-to-br from-purple-900/90 to-slate-900 border-2 border-purple-400 rounded-3xl p-4 text-left shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between pb-2 border-b border-purple-700/60">
          <span className="text-xs font-black text-pink-300 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            🎙️ ગુજરાતી વોઇસ ટાઈપિંગ સક્રિય!
          </span>
          <span className="text-xs font-bold text-amber-300">મૂડ: 😃 ખુશ!</span>
        </div>
        <div className="py-2.5 text-slate-100 text-xs sm:text-sm font-semibold leading-relaxed bg-slate-950/60 p-2.5 rounded-2xl border border-purple-500/20 my-2">
          "આજે મેં પરિવાર સાથે ખૂબ જ સુંદર સમય વિતાવ્યો અને સાંજે ગાર્ડનમાં વોક કર્યું..."
        </div>
        <div className="flex items-center justify-between text-[10px] text-purple-200">
          <span>💡 AI પ્રશ્ન: આજે નવું શું શીખ્યા?</span>
          <span className="text-amber-300 font-bold">✓ સેવ થઈ ગયું</span>
        </div>
      </div>
    ),
  },
  {
    id: 3,
    title: "ટાસ્ક & મીટિંગ એલાર્મ (એપ બંધ હોય તો પણ)",
    shortTitle: "૩. જોરદાર એલાર્મ",
    prop: "⏰",
    bubble: "ટ્રિંગ ટ્રિંગ! ⏰",
    glasses: false,
    cape: false,
    duration: 15,
    accent: "from-amber-600/30 to-orange-600/30",
    audioText: "અરે વાહ! કોઈપણ મીટિંગ કે મહત્વનું કામ ભૂલી જવાનો હવે સવાલ જ નથી! તમે સમય સેટ કરશો એટલે તમારો મોબાઈલ સાઉન્ડ સાથે એલાર્મ વગાડશે. એપ બંધ કરી દીધી હોય તો પણ એલાર્મ સમયસર વાગશે!",
    subtitles: "એપ બંધ હોય કે સ્ક્રીન લોક હોય, એન્ડ્રોઇડ એક્ઝેક્ટ એલાર્મ સમયસર જગાડશે!",
    render: () => (
      <div className="bg-gradient-to-br from-amber-950/90 to-slate-900 border-2 border-amber-400 rounded-3xl p-4 text-left shadow-2xl backdrop-blur-md relative overflow-hidden">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center text-lg font-black shadow-lg animate-bounce">
              ⏰
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-white">ઓફિસ પ્રોજેક્ટ મીટિંગ</h4>
              <p className="text-[10px] text-amber-300 font-bold">આજે સાંજે ૫:૩૦ વાગ્યે</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 text-[10px] font-black border border-emerald-300 animate-pulse">
            LOUD ALARM
          </span>
        </div>
        <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-amber-500/30 text-xs text-amber-100 flex items-center gap-1.5">
          <span className="text-lg">🔔</span>
          <span>ફોન પોકેટમાં હોય કે લોક હોય, Android System સમયસર રિંગ કરશે!</span>
        </div>
      </div>
    ),
  },
  {
    id: 4,
    title: "દવાઓ & હેલ્થ કેર (દાદા-દાદી માટે શ્રેષ્ઠ)",
    shortTitle: "૪. હેલ્થ & દવા",
    prop: "💊",
    bubble: "દવા લેવાનો સમય! 💊",
    glasses: true,
    cape: false,
    duration: 13,
    accent: "from-red-600/30 to-pink-600/30",
    audioText: "ઘરના વડીલો માટે આ ફીચર વરદાન સમાન છે! સવાર, બપોર કે રાતની દવાઓ, જમ્યા પહેલા કે પછી કઈ ગોળી લેવાની છે તેનું સમયસર રીમાઇન્ડર મળશે!",
    subtitles: "સવાર-સાંજની દવાઓનું પરફેક્ટ ટાઈમ-ટેબલ અને કાળજીભર્યું રીમાઇન્ડર!",
    render: () => (
      <div className="bg-gradient-to-br from-red-950/90 to-slate-900 border-2 border-red-400 rounded-3xl p-4 text-left shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between pb-2 border-b border-red-700/60">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-pulse">💊</span>
            <div>
              <div className="text-xs sm:text-sm font-black text-white">બીપી અને વિટામિન કેપ્સ્યુલ</div>
              <div className="text-[10px] text-red-200">રોજ સવારે નાસ્તા પછી (૯:૦૦ AM)</div>
            </div>
          </div>
          <span className="text-xs font-black text-amber-300 px-2 py-0.5 rounded-xl bg-slate-900 border border-amber-400">૧ ગોળી</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-xs font-bold">
          <span className="text-slate-300">આજનું સ્ટેટસ:</span>
          <span className="px-2.5 py-1 rounded-xl bg-emerald-500 text-slate-950 font-black flex items-center gap-1 shadow">
            ✓ આજે સમયસર લઈ લીધી
          </span>
        </div>
      </div>
    ),
  },
  {
    id: 5,
    title: "ઓટોમેટિક વોકિંગ સ્ટેપ કાઉન્ટર",
    shortTitle: "૫. સ્ટેપ ટ્રેકિંગ",
    prop: "👟",
    bubble: "૬ હજાર સ્ટેપ્સ! 👟",
    glasses: false,
    cape: false,
    duration: 14,
    accent: "from-emerald-600/30 to-teal-600/30",
    audioText: "ચાલો થોડી કસરત થઈ જાય! આ એપમાં મોશન સેન્સર પેડોમીટર આપેલું છે. તમે જ્યારે ચાલશો ત્યારે તમારા ડગલાં અને કેલરી આપોઆપ ગણાશે!",
    subtitles: "મોશન સેન્સર સાથે આપોઆપ ડગલાંની ગણતરી, કેલરી મીટર અને સેલિબ્રેશન!",
    render: () => (
      <div className="bg-gradient-to-br from-emerald-950/90 to-slate-900 border-2 border-emerald-400 rounded-3xl p-4 text-center shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-center gap-4 mb-2.5">
          <div className="w-20 h-20 rounded-full border-4 border-emerald-400 flex flex-col items-center justify-center bg-emerald-500/20 shadow-xl shadow-emerald-500/30 animate-pulse">
            <span className="text-lg font-black text-white">4,850</span>
            <span className="text-[9px] text-emerald-300 font-black uppercase">ડગલાં</span>
          </div>
          <div className="text-left space-y-1 text-xs font-bold">
            <div className="text-slate-200">🔥 કેલરી: <span className="text-emerald-300 font-black">194 kcal</span></div>
            <div className="text-slate-200">📍 અંતર: <span className="text-emerald-300 font-black">3.6 km</span></div>
            <div className="text-slate-200">🎯 ટાર્ગેટ: <span className="text-amber-300 font-black">6,000 સ્ટેપ્સ</span></div>
          </div>
        </div>
        <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-emerald-500/30">
          <div className="bg-gradient-to-r from-teal-400 to-emerald-400 h-full w-[82%] rounded-full shadow-lg"></div>
        </div>
      </div>
    ),
  },
  {
    id: 6,
    title: "રૂપિયાનો હિસાબ અને સ્માર્ટ ચાર્ટ્સ",
    shortTitle: "૬. ખર્ચ હિસાબ",
    prop: "💰",
    bubble: "પૈસાની બચત! 💰",
    glasses: true,
    cape: false,
    duration: 15,
    accent: "from-cyan-600/30 to-blue-600/30",
    audioText: "તમારી આવક અને ખર્ચનો પાકો હિસાબ રાખો! સુંદર રંગબેરંગી ચાર્ટ્સ વડે ખબર પડશે કે ક્યાં કેટલો ખર્ચ થયો. સાથે એક જ ક્લિકમાં બેંક સ્ટેટમેન્ટ જેવો પીડીએફ રિપોર્ટ પણ તૈયાર થઈ જાય છે!",
    subtitles: "આવક-ખર્ચના સ્માર્ટ ગ્રાફ્સ, કેટેગરી એનાલિસિસ અને ૧-ક્લિક PDF ડાઉનલોડ!",
    render: () => (
      <div className="bg-gradient-to-br from-cyan-950/90 to-slate-900 border-2 border-cyan-400 rounded-3xl p-4 text-left shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between mb-2.5 pb-1.5 border-b border-cyan-700/60">
          <div className="text-xs sm:text-sm font-black text-white flex items-center gap-1">
            <span>📊</span> માસિક હિસાબ-કિતાબ
          </div>
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-cyan-400 text-slate-950 font-black">
            PDF READY
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-2 font-bold">
          <div className="p-2 rounded-2xl bg-emerald-500/20 border border-emerald-500/40">
            <div className="text-[9px] text-emerald-300">આવક (+)</div>
            <div className="text-sm font-black text-emerald-200">₹ 45,000</div>
          </div>
          <div className="p-2 rounded-2xl bg-rose-500/20 border border-rose-500/40">
            <div className="text-[9px] text-rose-300">ખર્ચ (-)</div>
            <div className="text-sm font-black text-rose-200">₹ 18,400</div>
          </div>
        </div>
        <div className="flex items-center justify-between text-[10px] text-slate-300 font-bold">
          <span>🛒 કરિયાણું: 40%</span>
          <span>⚡ બિલ: 25%</span>
          <span>💰 બચત: 35%</span>
        </div>
      </div>
    ),
  },
  {
    id: 7,
    title: "સુપરહીરો મોડ: APK ઇન્સ્ટોલ કરો!",
    shortTitle: "૭. ડાઉનલોડ કરો",
    prop: "📱",
    bubble: "તમારા ફોનમાં! 🚀",
    glasses: false,
    cape: true,
    duration: 14,
    accent: "from-indigo-600/30 to-purple-600/30",
    audioText: "તો કેવો લાગ્યો આપણો આ મિતુ કાર્ટૂન શો? આ એપ તમારા મોબાઈલમાં ચલાવવા માટે તૈયાર છે! નીચે આપેલી લિંક પરથી સીધી APK ફાઇલ ઇન્સ્ટોલ કરી લો!",
    subtitles: "૧૦૦% ઓફલાઇન સપોર્ટ! તમારા ફોનમાં સીધી Android APK ઇન્સ્ટોલ કરો.",
    render: () => (
      <div className="bg-gradient-to-br from-indigo-900/90 to-purple-950 border-2 border-amber-400 rounded-3xl p-4 text-center shadow-2xl backdrop-blur-md">
        <div className="text-2xl mb-1">🚀🎉</div>
        <h3 className="text-sm sm:text-base font-black text-amber-300 mb-1">આજે જ એપ્લિકેશન ઇન્સ્ટોલ કરો!</h3>
        <p className="text-[11px] text-indigo-200 mb-3 font-semibold">દરેક ગુજરાતી પરિવાર માટે શ્રેષ્ઠ ડિજિટલ સાથી.</p>
        <div className="flex items-center justify-center gap-2">
          <a
            href="https://github.com/MIS-KADI/daily-note-app/releases/download/v1.0.0/daily-diary-v1.0.0.apk"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-xl transition flex items-center justify-center gap-1.5 transform hover:scale-105"
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
  const [isTalking, setIsTalking] = useState(false);
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

  const playCartoonSfx = (type) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'boing') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(580, now + 0.15);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'pop') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(450, now);
        osc.frequency.exponentialRampToValueAtTime(1100, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      }
    } catch (e) {}
  };

  const speakScene = (scene) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(scene.audioText);
    utterance.rate = 1.0;
    utterance.pitch = 1.15; // Cheerful cartoon voice pitch

    const voices = window.speechSynthesis.getVoices();
    const guVoice = voices.find((v) => v.lang.startsWith('gu') || v.lang.includes('Gujarati'));
    const hiVoice = voices.find((v) => v.lang.startsWith('hi') || v.lang.includes('Hindi'));
    const inVoice = voices.find((v) => v.lang.endsWith('IN'));

    if (guVoice) utterance.voice = guVoice;
    else if (hiVoice) utterance.voice = hiVoice;
    else if (inVoice) utterance.voice = inVoice;

    utterance.onstart = () => {
      setIsTalking(true);
    };

    utterance.onend = () => {
      setIsTalking(false);
      if (isPlayingRef.current) {
        handleNext();
      }
    };

    utterance.onerror = () => {
      setIsTalking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      playCartoonSfx('pop');
      setIsPlaying(false);
      setIsTalking(false);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      clearInterval(timerRef.current);
    } else {
      playCartoonSfx('boing');
      setIsPlaying(true);
      speakScene(SCENES[currentIdx]);
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setElapsedInScene((prev) => prev + 1);
      }, 1000);
    }
  };

  const handleNext = () => {
    playCartoonSfx('pop');
    if (currentIdx < SCENES.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setElapsedInScene(0);
    } else {
      setIsPlaying(false);
      setIsTalking(false);
      setCurrentIdx(0);
      setElapsedInScene(0);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    }
  };

  const handlePrev = () => {
    playCartoonSfx('pop');
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
      setElapsedInScene(0);
    }
  };

  const handleJump = (idx) => {
    playCartoonSfx('pop');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-amber-400/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh]">
        
        {/* Header */}
        <div className="px-4 py-2.5 bg-slate-950 border-b border-indigo-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 via-orange-500 to-pink-500 flex items-center justify-center text-base shadow">
              🦸‍♂️
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-1.5">
                મિતુ કાર્ટૂન (Mitu AI) વિડીયો શો!
                <span className="text-[9px] px-1.5 py-0.2 bg-amber-400 text-slate-950 rounded-full font-black uppercase">
                  Cartoon
                </span>
              </h2>
              <p className="text-[10px] text-indigo-200 font-medium">ગુજરાતી અવાજ અને રમૂજી એનિમેશન સાથે</p>
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

        {/* Video Canvas Stage with Cartoon Mitu */}
        <div className="relative aspect-video sm:min-h-[350px] bg-gradient-to-b from-indigo-950 via-slate-900 to-purple-950 flex items-center justify-center p-4 overflow-hidden border-b border-indigo-900">
          
          {/* Dynamic Ambient Glow */}
          <div className={`absolute w-80 h-80 rounded-full bg-gradient-to-r ${currentScene.accent} blur-3xl pointer-events-none transition-all duration-700`} />

          {/* Stage Center: Cartoon Character + Card */}
          <div className="relative z-10 w-full flex flex-col sm:flex-row items-center justify-center gap-4">
            
            {/* Cartoon Character Mitu */}
            <div className="flex flex-col items-center select-none shrink-0">
              <div className="relative w-28 h-36 sm:w-36 sm:h-44 flex items-center justify-center">
                <svg viewBox="0 0 200 240" className="w-full h-full drop-shadow-2xl">
                  {/* Cape */}
                  {currentScene.cape && (
                    <path d="M 60 120 Q 30 180 50 220 Q 100 200 150 220 Q 170 180 140 120 Z" fill="#ef4444" />
                  )}

                  {/* Shoes */}
                  <ellipse cx="75" cy="215" rx="18" ry="12" fill="#3b82f6" />
                  <ellipse cx="125" cy="215" rx="18" ry="12" fill="#3b82f6" />

                  {/* Body / T-shirt */}
                  <rect x="62" y="110" width="76" height="85" rx="22" fill="#f59e0b" />
                  <circle cx="100" cy="145" r="16" fill="#ffffff" />
                  <text x="100" y="152" fontSize="16" textAnchor="middle" fontWeight="bold" fill="#f59e0b">★</text>

                  {/* Arms */}
                  <path d="M 64 125 Q 40 145 42 170" stroke="#f59e0b" strokeWidth="14" strokeLinecap="round" fill="none" />
                  <circle cx="42" cy="170" r="10" fill="#fed7aa" />

                  <g className="animate-bounce">
                    <path d="M 136 125 Q 165 135 168 110" stroke="#f59e0b" strokeWidth="14" strokeLinecap="round" fill="none" />
                    <circle cx="168" cy="110" r="10" fill="#fed7aa" />
                    <text x="168" y="108" fontSize="22" textAnchor="middle">{currentScene.prop}</text>
                  </g>

                  {/* Head */}
                  <rect x="90" y="95" width="20" height="20" fill="#fed7aa" rx="4" />
                  <circle cx="100" cy="65" r="48" fill="#fed7aa" />

                  {/* Hair */}
                  <path d="M 52 60 Q 100 8 148 60 Q 140 30 100 25 Q 60 30 52 60 Z" fill="#451a03" />

                  {/* Blush */}
                  <ellipse cx="68" cy="74" rx="8" ry="5" fill="#fca5a5" opacity="0.8" />
                  <ellipse cx="132" cy="74" rx="8" ry="5" fill="#fca5a5" opacity="0.8" />

                  {/* Eyes */}
                  <circle cx="78" cy="62" r="10" fill="#ffffff" />
                  <circle cx="80" cy="62" r="6" fill="#1e1b4b" />
                  <circle cx="78" cy="60" r="2.5" fill="#ffffff" />

                  <circle cx="122" cy="62" r="10" fill="#ffffff" />
                  <circle cx="120" cy="62" r="6" fill="#1e1b4b" />
                  <circle cx="118" cy="60" r="2.5" fill="#ffffff" />

                  {/* Eyebrows */}
                  <path d="M 68 48 Q 78 44 88 48" stroke="#451a03" strokeWidth="3" strokeLinecap="round" fill="none" />
                  <path d="M 112 48 Q 122 44 132 48" stroke="#451a03" strokeWidth="3" strokeLinecap="round" fill="none" />

                  {/* Mouth */}
                  <path
                    d={isTalking ? "M 88 80 Q 100 100 112 80 Q 100 88 88 80 Z" : "M 88 80 Q 100 95 112 80"}
                    stroke="#b91c1c"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    fill={isTalking ? "#ef4444" : "none"}
                    className={isTalking ? "animate-pulse" : ""}
                  />

                  {/* Glasses */}
                  {currentScene.glasses && (
                    <g>
                      <circle cx="78" cy="62" r="13" stroke="#1e293b" strokeWidth="3" fill="none" />
                      <circle cx="122" cy="62" r="13" stroke="#1e293b" strokeWidth="3" fill="none" />
                      <line x1="91" y1="62" x2="109" y2="62" stroke="#1e293b" strokeWidth="3" />
                    </g>
                  )}
                </svg>

                {/* Speech Bubble */}
                <div className="absolute -top-4 -right-6 bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-xl shadow-md border border-amber-300 transform rotate-6 animate-pulse">
                  {currentScene.bubble}
                </div>
              </div>

              <div className="mt-0.5 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] shadow">
                🦸‍♂️ મિતુ AI
              </div>
            </div>

            {/* Feature Card */}
            <div className="flex-1 w-full max-w-sm">
              {currentScene.render()}
            </div>

          </div>

          {/* Subtitles Overlay */}
          <div className="absolute bottom-2.5 left-3 right-3 z-20 pointer-events-none flex justify-center">
            <div className="text-center bg-black/85 backdrop-blur-md px-3.5 py-1 rounded-xl border border-amber-400/40 text-[11px] font-bold text-amber-200 truncate max-w-md">
              {currentScene.subtitles}
            </div>
          </div>

        </div>

        {/* Controls */}
        <div className="p-3 bg-slate-950 flex flex-col gap-2">
          {/* Progress Bar */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-amber-300 font-bold">{formatTime(totalElapsed)}</span>
            <div className="relative flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-400 via-pink-500 to-indigo-500 rounded-full transition-all duration-300"
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
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 transition font-bold"
                title="અગાઉનું દ્રશ્ય"
              >
                <SkipBack size={15} />
              </button>

              <button
                onClick={handlePlayPause}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 hover:from-amber-300 hover:to-pink-400 text-slate-950 font-black text-xs shadow-md transition active:scale-95 flex items-center gap-1.5"
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                <span>{isPlaying ? 'થોભો (Pause)' : 'કાર્ટૂન શો જુઓ (Play)'}</span>
              </button>

              <button
                onClick={handleNext}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 transition font-bold"
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
                    setIsTalking(false);
                  }
                }}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                title="અવાજ ચાલુ / બંધ"
              >
                {voiceEnabled ? <Volume2 size={15} className="text-amber-400" /> : <VolumeX size={15} className="text-slate-500" />}
              </button>
            </div>
          </div>

          {/* Scene Selector Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none border-t border-slate-800/80">
            {SCENES.map((scene, idx) => (
              <button
                key={scene.id}
                onClick={() => handleJump(idx)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black whitespace-nowrap transition ${
                  idx === currentIdx
                    ? 'bg-amber-400 text-slate-950 shadow-md'
                    : 'bg-slate-800/80 text-amber-200/80 hover:bg-slate-800 hover:text-white'
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
