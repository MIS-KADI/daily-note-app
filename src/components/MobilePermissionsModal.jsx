import React, { useState, useEffect } from 'react';
import {
  Mic,
  Bell,
  Volume2,
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { audioService } from '../services/audioService';
import { aiAssistantService } from '../services/aiAssistantService';

export default function MobilePermissionsModal({
  isOpen,
  onClose,
  lang = 'gu',
}) {
  const [micStatus, setMicStatus] = useState('checking'); // 'granted', 'prompt', 'denied', 'checking'
  const [notifStatus, setNotifStatus] = useState('default');
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [isTestingAudio, setIsTestingAudio] = useState(false);
  const [audioPlayed, setAudioPlayed] = useState(false);

  // Check initial permission states
  useEffect(() => {
    if (!isOpen) return;

    // Check Notification status
    if ('Notification' in window) {
      setNotifStatus(Notification.permission);
    } else {
      setNotifStatus('unsupported');
    }

    // Check Microphone permission state if Permissions API available
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'microphone' })
        .then((perm) => {
          setMicStatus(perm.state);
          perm.onchange = () => setMicStatus(perm.state);
        })
        .catch(() => {
          setMicStatus('prompt');
        });
    } else {
      setMicStatus('prompt');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Request & Test Microphone Access
  const handleTestMic = async () => {
    setIsTestingMic(true);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((track) => track.stop());
        setMicStatus('granted');
        aiAssistantService.speak('માઇક્રોફોન પરવાનગી સફળતાપૂર્વક સક્રિય થઈ ગઈ છે!', lang);
      } else {
        alert(lang === 'gu' ? 'તમારા બ્રાઉઝરમાં માઇક્રોફોન સપોર્ટ નથી.' : 'Microphone not supported.');
      }
    } catch (err) {
      console.warn('Mic error:', err);
      setMicStatus('denied');
    } finally {
      setIsTestingMic(false);
    }
  };

  // Request & Test Notifications
  const handleRequestNotif = async () => {
    const granted = await notificationService.requestPermission();
    setNotifStatus(granted ? 'granted' : 'denied');
    if (granted) {
      notificationService.send('🔔 દૈનિક ડાયરી: નોટિફિકેશન સક્રિય!', {
        body: 'તમારા એલાર્મ, દવા અને મીટિંગ સમયસર યોગ્ય સમયે વાગશે.',
      });
      if (audioService?.playChime) audioService.playChime();
    }
  };

  // Test Audio & Sound
  const handleTestAudio = () => {
    setIsTestingAudio(true);
    try {
      if (audioService?.playSuccess) audioService.playSuccess();
      aiAssistantService.speak('દૈનિક ડાયરીમાં આપનું સ્વાગત છે! તમારો ઓડિયો સાઉન્ડ બિલકુલ યોગ્ય રીતે કામ કરે છે.', lang);
      setAudioPlayed(true);
      setTimeout(() => setIsTestingAudio(false), 1200);
    } catch {
      setIsTestingAudio(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner">
              📱
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                {lang === 'gu' ? 'મોબાઇલ ઍક્સેસ & પરવાનગીઓ' : 'Mobile Access & Permissions'}
              </h3>
              <p className="text-[11px] text-blue-100 mt-0.5">
                {lang === 'gu'
                  ? 'એપ કોઈ પણ સમસ્યા વગર ચલાવવા માટે જરૂરી સેટિંગ્સ'
                  : 'Required permissions for flawless mobile experience'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        {/* Permissions List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 text-xs">
          
          {/* 1. Microphone Access */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
                <Mic size={16} className="text-indigo-600 dark:text-indigo-400" />
                <span>૧. માઇક્રોફોન પરવાનગી (Voice Typing)</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  micStatus === 'granted'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : micStatus === 'denied'
                    ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                }`}
              >
                {micStatus === 'granted'
                  ? '✓ સક્રિય (Allowed)'
                  : micStatus === 'denied'
                  ? '✕ બ્લોક છે (Blocked)'
                  : 'બાકી (Pending)'}
              </span>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              સ્માર્ટ AI વૉઇસ આસિસ્ટન્ટમાં બોલીને સીધી એન્ટ્રી કરવા માટે માઇક્રોફોન જરૂરી છે.
            </p>

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handleTestMic}
                disabled={isTestingMic}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] shadow-sm active:scale-95 transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {isTestingMic ? <RefreshCw size={12} className="animate-spin" /> : <Mic size={12} />}
                <span>{micStatus === 'granted' ? 'ફરી ટેસ્ટ કરો' : 'પરવાનગી આપો'}</span>
              </button>

              {micStatus === 'denied' && (
                <span className="text-[10px] text-red-600 dark:text-red-400 font-semibold">
                  URL બારમાં 🔒 લૉક આઇકન પર ક્લિક કરી Allow કરો
                </span>
              )}
            </div>
          </div>

          {/* 2. Notification & Alarms Access */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
                <Bell size={16} className="text-amber-600 dark:text-amber-400" />
                <span>૨. નોટિફિકેશન & અલાર્મ (Notifications)</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  notifStatus === 'granted'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : notifStatus === 'denied'
                    ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                }`}
              >
                {notifStatus === 'granted'
                  ? '✓ સક્રિય (Allowed)'
                  : notifStatus === 'denied'
                  ? '✕ બ્લોક છે (Blocked)'
                  : 'બાકી (Pending)'}
              </span>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              દવા લેવાનો સમય, મીટિંગ કે કામના રીમાઇન્ડરનું સાઉન્ડ સાથે એલાર્મ વાગવા માટે જરૂરી છે.
            </p>

            <button
              onClick={handleRequestNotif}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shadow-sm active:scale-95 transition flex items-center gap-1.5"
            >
              <Bell size={12} />
              <span>{notifStatus === 'granted' ? 'ટેસ્ટ એલાર્મ મોકલો' : 'પરવાનગી સક્ષમ કરો'}</span>
            </button>
          </div>

          {/* 3. Audio & Speech Sound */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100">
                <Volume2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                <span>૩. ઓડિયો અને વૉઇસ સાઉન્ડ (Audio Chime)</span>
              </div>
              {audioPlayed && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  ✓ કાર્યરત
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              મોબાઈલ સ્પીકર પર ગુજરાતી વૉઇસ બોલવા માટે ૧ વખત સાઉન્ડ અનલૉક કરવું જરૂરી છે.
            </p>

            <button
              onClick={handleTestAudio}
              disabled={isTestingAudio}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm active:scale-95 transition flex items-center gap-1.5"
            >
              <Volume2 size={12} />
              <span>સાઉન્ડ ટેસ્ટ કરો 🔊</span>
            </button>
          </div>

          {/* 4. Add to Home Screen (Mobile Installation Guide) */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-indigo-950/40 border border-blue-200 dark:border-indigo-900/50 space-y-2">
            <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-200">
              <Smartphone size={16} className="text-blue-600" />
              <span>૪. મોબાઈલ હોમ સ્ક્રીન પર એપ સેવ કરો (PWA)</span>
            </div>

            <div className="text-[11px] text-slate-700 dark:text-slate-300 space-y-1 pl-1">
              <p>• <b>Android Chrome:</b> ઉપર જમણે <b>(⋮) ત્રણ ટપકાં</b> પર ક્લિક કરો ➔ <b>'Add to Home screen'</b> પસંદ કરો.</p>
              <p>• <b>iPhone Safari:</b> નીચે શેર આઇકન <b>(⎋)</b> ➔ <b>'Add to Home Screen'</b> દબાવો.</p>
              <p className="text-[10px] text-emerald-700 dark:text-emerald-300 font-semibold pt-0.5">
                ⚡ આમ કરવાથી એપ ઇન્ટરનેટ વગર પણ ૧૦૦% ઓફલાઇન અને ફાસ્ટ ચાલશે!
              </p>
            </div>
          </div>

        </div>

        {/* Footer Done Button */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition active:scale-98"
          >
            સમજાઈ ગયું, પૂર્ણ કરો ✓
          </button>
        </div>

      </div>
    </div>
  );
}
