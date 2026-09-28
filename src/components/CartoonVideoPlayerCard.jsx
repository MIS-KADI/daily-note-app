import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Download,
  Maximize2,
  Minimize2,
  CheckCircle2,
  PieChart,
  Bell,
  Smartphone,
  Flame,
  Award,
} from 'lucide-react';

export const CARTOON_SCENES = [
  {
    id: 1,
    title: "મિતુનું સ્વાગત & સુપર ડાયરી",
    shortTitle: "૧. પરિચય",
    prop: "👋",
    bubble: "નમસ્તે દોસ્તો! 🎉",
    glasses: false,
    cape: false,
    duration: 12,
    accentGlow: "from-amber-500/25 to-orange-500/25",
    themeColor: "amber",
    audioText: "અરે વાહ! નમસ્તે મિત્રો, હું છું તમારો દોસ્ત મિતુ! શું તમે તમારી રોજિંદી ડાયરી, મહત્વના કામો અને હિસાબ સાચવવાની મજા માણવા માંગો છો? તો આ દૈનિક ડાયરી અને સ્માર્ટ આસિસ્ટન્ટ તમારા માટે જ બની છે!",
    subtitles: "હું છું મિતુ! આવો જાણીએ તમારી આ સુપર ડાયરીના જબરદસ્ત ફીચર્સ વિશે!",
    renderPhoneUI: () => (
      <div className="flex flex-col h-full justify-between p-3 text-slate-100 select-none">
        <div className="flex items-center justify-between pb-2 border-b border-slate-700/60 text-[10px]">
          <span className="font-black text-amber-400">📔 દૈનિક ડાયરી</span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[9px]">૧૦૦% સલામત</span>
        </div>
        <div className="my-auto text-center space-y-2">
          <div className="text-3xl animate-bounce">✨📱✨</div>
          <div className="text-xs font-black text-white">ઓલ-ઇન-વન સ્માર્ટ સાથી</div>
          <div className="text-[10px] text-amber-200/80">ડાયરી • ટાસ્ક • દવાઓ • સ્ટેપ્સ • હિસાબ</div>
          <div className="flex justify-center gap-1 pt-1">
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[9px] text-emerald-300 border border-emerald-500/30">🔒 સુરક્ષિત</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[9px] text-blue-300 border border-blue-500/30">⚡ ઓફલાઇન</span>
          </div>
        </div>
        <div className="text-center text-[9px] text-slate-400 py-1 bg-slate-900/80 rounded-xl border border-slate-700/40">
          સંપૂર્ણ ગુજરાતી ભાષા સપોર્ટ
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
    accentGlow: "from-purple-500/25 to-pink-500/25",
    themeColor: "purple",
    audioText: "જો તમને હાથથી ટાઈપિંગ કરવાનો કંટાળો આવતો હોય તો ચિંતા બિલકુલ ના કરો! આસિસ્ટન્ટ માઈક બટન દબાવો અને ગુજરાતીમાં બોલો. જુઓ કેવી ફટાફટ તમારી વાત અહીં લખાઈ જાય છે!",
    subtitles: "ગુજરાતીમાં બોલો અને ઓટોમેટીક લખાઈ જશે! સાથે મજાના મૂડ ઇમોજી પણ!",
    renderPhoneUI: () => (
      <div className="flex flex-col h-full justify-between p-3 text-slate-100 select-none">
        <div className="flex items-center justify-between pb-1.5 border-b border-purple-700/50 text-[10px]">
          <span className="text-pink-300 font-bold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
            વોઇસ ટાઈપિંગ...
          </span>
          <span className="text-amber-300 text-[9px] font-bold">મૂડ: 😃 ખુશ!</span>
        </div>
        <div className="my-auto space-y-2">
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-purple-500/30 text-[11px] leading-relaxed text-slate-200">
            "આજે સવારે બગીચામાં મોર્નિંગ વોક કર્યું અને મિત્ર સાથે મીટિંગ કરી..."
            <span className="inline-block w-1.5 h-3.5 bg-amber-400 ml-1 animate-pulse" />
          </div>
          <div className="flex items-center justify-center gap-1 py-1">
            <span className="w-1 h-3 bg-pink-500 rounded-full animate-pulse" />
            <span className="w-1 h-5 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
            <span className="w-1 h-7 bg-amber-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
            <span className="w-1 h-4 bg-pink-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
            <span className="w-1 h-2 bg-indigo-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>
        </div>
        <div className="text-[9px] text-purple-200 bg-purple-950/60 p-1.5 rounded-lg border border-purple-500/20 text-center">
          💡 AI પ્રશ્ન: આજે નવું શું શીખ્યા?
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
    accentGlow: "from-amber-600/30 to-orange-600/30",
    themeColor: "amber",
    audioText: "અરે વાહ! કોઈપણ મીટિંગ કે મહત્વનું કામ ભૂલી જવાનો હવે સવાલ જ નથી! તમે સમય સેટ કરશો એટલે તમારો મોબાઈલ સાઉન્ડ સાથે એલાર્મ વગાડશે. એપ બંધ કરી દીધી હોય તો પણ એલાર્મ સમયસર વાગશે!",
    subtitles: "એપ બંધ હોય કે સ્ક્રીન લોક હોય, એન્ડ્રોઇડ એક્ઝેક્ટ એલાર્મ સમયસર જગાડશે!",
    renderPhoneUI: () => (
      <div className="flex flex-col h-full justify-between p-3 text-slate-100 select-none">
        <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 flex items-center justify-between text-[10px]">
          <span className="flex items-center gap-1 font-bold">
            <Bell size={11} className="text-amber-400 animate-bounce" /> એલાર્મ એલર્ટ
          </span>
          <span className="px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-black text-[8px]">ACTIVE</span>
        </div>
        <div className="my-auto space-y-2 text-center">
          <div className="text-3xl animate-bounce">⏰🔔</div>
          <div className="text-xs font-black text-white">ઓફિસ પ્રોજેક્ટ રિવ્યુ</div>
          <div className="text-[11px] font-bold text-amber-300">આજે સાંજે ૫:૩૦ વાગ્યે</div>
          <div className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[9px] font-bold">
            ✓ એપ બંધ હોય તો પણ રિંગ થશે!
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1 text-[9px] font-bold">
          <div className="py-1 bg-slate-800 rounded-lg text-center text-slate-300">સ્નૂઝ (૫ મિ.)</div>
          <div className="py-1 bg-amber-400 text-slate-950 rounded-lg text-center">પૂર્ણ થયું ✓</div>
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
    accentGlow: "from-red-600/25 to-pink-600/25",
    themeColor: "red",
    audioText: "ઘરના વડીલો માટે આ ફીચર વરદાન સમાન છે! સવાર, બપોર કે રાતની દવાઓ, જમ્યા પહેલા કે પછી કઈ ગોળી લેવાની છે તેનું સમયસર રીમાઇન્ડર મળશે, જેથી સ્વાસ્થ્ય હંમેશા તંદુરસ્ત રહે!",
    subtitles: "સવાર-સાંજની દવાઓનું પરફેક્ટ ટાઈમ-ટેબલ અને કાળજીભર્યું રીમાઇન્ડર!",
    renderPhoneUI: () => (
      <div className="flex flex-col h-full justify-between p-3 text-slate-100 select-none">
        <div className="flex items-center justify-between pb-1.5 border-b border-red-700/50 text-[10px]">
          <span className="font-bold text-red-300 flex items-center gap-1">💊 દવા રીમાઇન્ડર</span>
          <span className="text-slate-400 text-[9px]">૯:૦૦ AM</span>
        </div>
        <div className="my-auto space-y-2">
          <div className="p-2 rounded-xl bg-slate-900/90 border border-red-500/30 text-left space-y-1">
            <div className="text-xs font-black text-white">બીપી & વિટામિન ટેબ્લેટ</div>
            <div className="text-[10px] text-red-200">નાસ્તા પછી (૧ ગોળી)</div>
          </div>
          <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-center font-bold text-[10px] flex items-center justify-center gap-1">
            <CheckCircle2 size={12} /> આજે સમયસર લઈ લીધી!
          </div>
        </div>
        <div className="text-center text-[9px] text-slate-400 py-1 bg-slate-900/60 rounded-lg">
          રોજિંદો દવા ઈતિહાસ સેવ થાય છે
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
    accentGlow: "from-emerald-600/25 to-teal-600/25",
    themeColor: "emerald",
    audioText: "ચાલો થોડી કસરત થઈ જાય! આ એપમાં મોશન સેન્સર પેડોમીટર આપેલું છે. તમે જ્યારે ચાલશો ત્યારે તમારા ડગલાં અને બળેલી કેલરી આપોઆપ ગણાશે. ૬ હજાર ડગલાં પૂરા થતાં જ જબરદસ્ત ફટાકડા ફૂટશે!",
    subtitles: "મોશન સેન્સર સાથે આપોઆપ ડગલાંની ગણતરી, કેલરી મીટર અને સેલિબ્રેશન!",
    renderPhoneUI: () => (
      <div className="flex flex-col h-full justify-between p-3 text-slate-100 select-none">
        <div className="flex items-center justify-between pb-1.5 border-b border-emerald-700/50 text-[10px]">
          <span className="font-bold text-emerald-300">👟 ઓટો સ્ટેપ કાઉન્ટર</span>
          <span className="text-amber-300 text-[9px] font-bold">ગોલ: ૬,૦૦૦</span>
        </div>
        <div className="my-auto flex flex-col items-center space-y-2">
          <div className="w-20 h-20 rounded-full border-4 border-emerald-400 bg-emerald-500/20 flex flex-col items-center justify-center shadow-lg shadow-emerald-500/30 animate-pulse">
            <span className="text-base font-black text-white">4,850</span>
            <span className="text-[8px] text-emerald-300 font-bold uppercase">ડગલાં</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 w-full text-center text-[9px]">
            <div className="p-1 rounded bg-slate-800 text-slate-200">🔥 194 kcal</div>
            <div className="p-1 rounded bg-slate-800 text-slate-200">📍 3.6 km</div>
          </div>
        </div>
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
          <div className="bg-gradient-to-r from-teal-400 to-emerald-400 h-full w-[80%] rounded-full"></div>
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
    accentGlow: "from-cyan-600/25 to-blue-600/25",
    themeColor: "cyan",
    audioText: "તમારી આવક અને ખર્ચનો પાકો હિસાબ રાખો! સુંદર રંગબેરંગી ચાર્ટ્સ વડે ખબર પડશે કે ક્યાં કેટલો ખર્ચ થયો. સાથે એક જ ક્લિકમાં બેંક સ્ટેટમેન્ટ જેવો આકર્ષક પીડીએફ રિપોર્ટ પણ તૈયાર થઈ જાય છે!",
    subtitles: "આવક-ખર્ચના સ્માર્ટ ગ્રાફ્સ, કેટેગરી એનાલિસિસ અને ૧-ક્લિક PDF ડાઉનલોડ!",
    renderPhoneUI: () => (
      <div className="flex flex-col h-full justify-between p-3 text-slate-100 select-none">
        <div className="flex items-center justify-between pb-1.5 border-b border-cyan-700/50 text-[10px]">
          <span className="font-bold text-cyan-300 flex items-center gap-1">📊 નાણાકીય વિશ્લેષણ</span>
          <span className="px-1.5 py-0.2 rounded bg-cyan-400 text-slate-950 font-black text-[8px]">PDF READY</span>
        </div>
        <div className="my-auto space-y-2">
          <div className="grid grid-cols-2 gap-1.5 text-center">
            <div className="p-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
              <div className="text-[8px] text-emerald-300">આવક (+)</div>
              <div className="text-xs font-black text-emerald-200">₹45,000</div>
            </div>
            <div className="p-1.5 rounded-xl bg-rose-500/20 border border-rose-500/30">
              <div className="text-[8px] text-rose-300">ખર્ચ (-)</div>
              <div className="text-xs font-black text-rose-200">₹18,400</div>
            </div>
          </div>
          <div className="p-1.5 rounded-lg bg-slate-800 text-[9px] text-slate-300 flex justify-between">
            <span>🛒 કરિયાણું: 40%</span>
            <span>⚡ બિલ: 25%</span>
            <span>💰 બચત: 35%</span>
          </div>
        </div>
        <div className="py-1 bg-cyan-500 text-slate-950 font-bold text-[9px] text-center rounded-lg shadow">
          📄 ૧-ક્લિક PDF ડાઉનલોડ
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
    accentGlow: "from-indigo-600/25 to-purple-600/25",
    themeColor: "indigo",
    audioText: "તો કેવો લાગ્યો આપણો આ મિતુ કાર્ટૂન શો? આ એપ તમારા મોબાઈલમાં ચલાવવા માટે તૈયાર છે! નીચે આપેલી લિંક પરથી સીધી APK ફાઇલ ઇન્સ્ટોલ કરી લો અને તમારા રોજિંદા જીવનને સુપર સ્માર્ટ બનાવો!",
    subtitles: "૧૦૦% ઓફલાઇન સપોર્ટ! તમારા ફોનમાં સીધી Android APK ઇન્સ્ટોલ કરો.",
    renderPhoneUI: () => (
      <div className="flex flex-col h-full justify-between p-3 text-slate-100 select-none text-center">
        <div className="text-2xl animate-bounce">🚀🎉</div>
        <div className="space-y-1">
          <div className="text-xs font-black text-amber-300">એપ તૈયાર છે!</div>
          <div className="text-[9px] text-indigo-200">Android & iPhone સપોર્ટ</div>
        </div>
        <div className="space-y-1.5 pt-1">
          <a
            href="https://github.com/MIS-KADI/daily-note-app/releases/download/v1.0.0/daily-diary-v1.0.0.apk"
            target="_blank"
            rel="noreferrer"
            className="block py-1.5 px-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-[10px] shadow-lg transition"
          >
            📲 Android APK
          </a>
          <a
            href="https://mis-kadi.github.io/daily-note-app/"
            target="_blank"
            rel="noreferrer"
            className="block py-1 px-2 rounded-xl bg-slate-800 text-white font-bold text-[9px] border border-slate-700"
          >
            🌐 Web / iPhone
          </a>
        </div>
      </div>
    ),
  },
];

export default function CartoonVideoPlayerCard({ isFullscreenModal = false, onCloseModal }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isTalking, setIsTalking] = useState(false);
  const [elapsedInScene, setElapsedInScene] = useState(0);

  const timerRef = useRef(null);
  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const totalAppDuration = CARTOON_SCENES.reduce((acc, s) => acc + s.duration, 0);

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
    utterance.pitch = 1.15;

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
      speakScene(CARTOON_SCENES[currentIdx]);
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setElapsedInScene((prev) => prev + 1);
      }, 1000);
    }
  };

  const handleNext = () => {
    playCartoonSfx('pop');
    if (currentIdx < CARTOON_SCENES.length - 1) {
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
      speakScene(CARTOON_SCENES[idx]);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      speakScene(CARTOON_SCENES[currentIdx]);
    }
  }, [currentIdx]);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  const currentScene = CARTOON_SCENES[currentIdx];
  let previousDuration = 0;
  for (let i = 0; i < currentIdx; i++) {
    previousDuration += CARTOON_SCENES[i].duration;
  }
  const totalElapsed = previousDuration + elapsedInScene;
  const progressPercent = Math.min(100, (totalElapsed / totalAppDuration) * 100);

  return (
    <div className="w-full bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 border-2 border-amber-400/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col backdrop-blur-xl">
      
      {/* Top Bar */}
      <div className="px-4 py-3 bg-slate-950/90 border-b border-indigo-500/30 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-pink-500 flex items-center justify-center text-xl shadow-lg shadow-orange-500/30 animate-pulse">
            🦸‍♂️
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs sm:text-sm font-black text-amber-300">
                મિતુ કાર્ટૂન (Mitu AI) વિડીયો શો!
              </h3>
              <span className="px-2 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[9px] font-black uppercase">
                HD Cartoon
              </span>
            </div>
            <p className="text-[10px] text-amber-100/80 font-medium">સંપૂર્ણ એપ ગાઇડ (ગુજરાતી અવાજ અને જીવંત ડેમો સાથે)</p>
          </div>
        </div>

        {isFullscreenModal && onCloseModal && (
          <button
            onClick={() => {
              if (window.speechSynthesis) window.speechSynthesis.cancel();
              onCloseModal();
            }}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          >
            ✕
          </button>
        )}
      </div>

      {/* Video Stage Area: Cartoon Character (Left) + Realistic Smartphone Mockup (Right) */}
      <div className="relative aspect-video sm:min-h-[380px] bg-gradient-to-b from-indigo-950/90 via-slate-900 to-purple-950/95 flex items-center justify-center p-4 sm:p-6 overflow-hidden border-b border-indigo-950">
        
        {/* Dynamic Glow */}
        <div className={`absolute w-96 h-96 rounded-full bg-gradient-to-r ${currentScene.accentGlow} blur-3xl pointer-events-none transition-all duration-700`} />

        {/* Stage Content */}
        <div className="relative z-10 w-full max-w-lg flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          
          {/* Cartoon Character: MITU */}
          <div className="flex flex-col items-center select-none shrink-0">
            <div className="relative w-28 h-36 sm:w-36 sm:h-48 flex items-center justify-center">
              
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

                {/* Left Arm */}
                <path d="M 64 125 Q 40 145 42 170" stroke="#f59e0b" strokeWidth="14" strokeLinecap="round" fill="none" />
                <circle cx="42" cy="170" r="10" fill="#fed7aa" />

                {/* Right Arm (Waving / Prop) */}
                <g className="animate-bounce">
                  <path d="M 136 125 Q 165 135 168 110" stroke="#f59e0b" strokeWidth="14" strokeLinecap="round" fill="none" />
                  <circle cx="168" cy="110" r="10" fill="#fed7aa" />
                  <text x="168" y="108" fontSize="22" textAnchor="middle">{currentScene.prop}</text>
                </g>

                {/* Neck & Head */}
                <rect x="90" y="95" width="20" height="20" fill="#fed7aa" rx="4" />
                <circle cx="100" cy="65" r="48" fill="#fed7aa" />

                {/* Hair */}
                <path d="M 52 60 Q 100 8 148 60 Q 140 30 100 25 Q 60 30 52 60 Z" fill="#451a03" />

                {/* Blush Cheeks */}
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

                {/* Mouth (Lip-sync) */}
                <path
                  d={isTalking ? "M 88 80 Q 100 102 112 80 Q 100 88 88 80 Z" : "M 88 80 Q 100 95 112 80"}
                  stroke="#b91c1c"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill={isTalking ? "#ef4444" : "none"}
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

              {/* Cartoon Speech Bubble */}
              <div className="absolute -top-3.5 -right-5 bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-xl shadow-lg border border-amber-300 transform rotate-6 animate-pulse">
                {currentScene.bubble}
              </div>
            </div>

            <div className="mt-1 px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] shadow">
              🦸‍♂️ મિતુ AI
            </div>
          </div>

          {/* Realistic Smartphone Mockup Display */}
          <div className="relative w-44 h-72 sm:w-52 sm:h-80 bg-slate-950 rounded-[2.2rem] p-2 border-4 border-slate-700 shadow-2xl shadow-indigo-500/20 shrink-0">
            {/* Phone Notch & Speaker */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-14 h-3 bg-slate-800 rounded-full z-20 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
            </div>

            {/* Inner Phone Screen */}
            <div className="w-full h-full bg-slate-900 rounded-[1.8rem] overflow-hidden pt-4 pb-2 relative border border-slate-800 flex flex-col">
              {currentScene.renderPhoneUI()}
            </div>
          </div>

        </div>

        {/* Live Subtitle Overlay */}
        <div className="absolute bottom-2.5 left-3 right-3 z-20 pointer-events-none flex justify-center">
          <div className="text-center bg-black/90 backdrop-blur-md px-4 py-1.5 rounded-2xl border border-amber-400/50 text-[11px] font-bold text-amber-200 truncate max-w-md shadow-lg">
            {currentScene.subtitles}
          </div>
        </div>

      </div>

      {/* Control Deck */}
      <div className="p-3.5 bg-slate-950 flex flex-col gap-2.5">
        
        {/* Progress Slider */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-amber-300 font-bold">{formatTime(totalElapsed)}</span>
          <div className="relative flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-pink-500 to-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-slate-400 font-bold">{formatTime(totalAppDuration)}</span>
        </div>

        {/* Buttons Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 transition font-bold"
              title="અગાઉનું દ્રશ્ય"
            >
              <SkipBack size={15} />
            </button>

            <button
              onClick={handlePlayPause}
              className="px-5 py-2 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 hover:from-amber-300 hover:to-pink-400 text-slate-950 font-black text-xs shadow-lg transition active:scale-95 flex items-center gap-1.5"
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span>{isPlaying ? 'થોભો (Pause)' : 'કાર્ટૂન શો જુઓ (Play)'}</span>
            </button>

            <button
              onClick={handleNext}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 transition font-bold"
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
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="અવાજ ચાલુ / બંધ"
            >
              {voiceEnabled ? <Volume2 size={16} className="text-amber-400" /> : <VolumeX size={16} className="text-slate-500" />}
            </button>
          </div>
        </div>

        {/* Scene Selector Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none border-t border-slate-800/80">
          {CARTOON_SCENES.map((scene, idx) => (
            <button
              key={scene.id}
              onClick={() => handleJump(idx)}
              className={`px-3 py-1 rounded-xl text-[10px] font-black whitespace-nowrap transition ${
                idx === currentIdx
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 transform scale-105'
                  : 'bg-slate-800/80 text-amber-200/80 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {scene.shortTitle}
            </button>
          ))}
        </div>

      </div>

    </div>
  );
}
