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
  Image as ImageIcon,
  Users,
  Lock,
  Shield,
  FileCheck,
} from 'lucide-react';
import { notificationService } from '../services/notificationService';
import { audioService } from '../services/audioService';
import { aiAssistantService } from '../services/aiAssistantService';
import { permissionService } from '../services/permissionService';

export default function MobilePermissionsModal({
  isOpen,
  onClose,
  lang = 'gu',
}) {
  const [micStatus, setMicStatus] = useState('checking'); // 'granted', 'prompt', 'denied'
  const [notifStatus, setNotifStatus] = useState('default');
  const [photoStatus, setPhotoStatus] = useState('granted');
  const [contactStatus, setContactStatus] = useState('prompt');
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [isTestingAudio, setIsTestingAudio] = useState(false);
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [contactPickedNotice, setContactPickedNotice] = useState('');

  // Check initial permission states
  const refreshPermissions = async () => {
    const status = await permissionService.checkPermissions();

    // Microphone
    if (window.AndroidSpeechBridge && typeof window.AndroidSpeechBridge.hasPermission === 'function') {
      setMicStatus(window.AndroidSpeechBridge.hasPermission() ? 'granted' : 'prompt');
    } else if (status.audio) {
      setMicStatus('granted');
    } else {
      setMicStatus('prompt');
    }

    // Notifications
    if ('Notification' in window) {
      setNotifStatus(Notification.permission);
    } else {
      setNotifStatus(status.notifications ? 'granted' : 'unsupported');
    }

    // Photos
    if (window.AndroidPermissionBridge && typeof window.AndroidPermissionBridge.hasPhotoPermission === 'function') {
      setPhotoStatus(window.AndroidPermissionBridge.hasPhotoPermission() ? 'granted' : 'prompt');
    } else {
      setPhotoStatus('granted');
    }

    // Contacts
    if (window.AndroidPermissionBridge && typeof window.AndroidPermissionBridge.hasContactPermission === 'function') {
      setContactStatus(window.AndroidPermissionBridge.hasContactPermission() ? 'granted' : 'prompt');
    } else if (status.contacts) {
      setContactStatus('granted');
    } else {
      setContactStatus('prompt');
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    refreshPermissions();

    // Listen to native callback when permissions dialog closes
    window.onNativePermissionsResult = () => {
      refreshPermissions();
    };

    return () => {
      window.onNativePermissionsResult = null;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Request & Test Microphone Access
  const handleTestMic = async () => {
    setIsTestingMic(true);
    try {
      if (window.AndroidSpeechBridge) {
        if (typeof window.AndroidSpeechBridge.requestPermission === 'function') {
          window.AndroidSpeechBridge.requestPermission();
        }
        setTimeout(() => {
          const granted = typeof window.AndroidSpeechBridge.hasPermission === 'function' 
            ? window.AndroidSpeechBridge.hasPermission() 
            : true;
          if (granted) {
            setMicStatus('granted');
            aiAssistantService.speak('માઇક્રોફોન પરવાનગી સફળતાપૂર્વક સક્રિય થઈ ગઈ છે!', lang);
          } else {
            setMicStatus('denied');
          }
          setIsTestingMic(false);
        }, 1000);
        return;
      }

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

  // Request Photos Access
  const handleRequestPhotos = async () => {
    await permissionService.requestPhotoPermission();
    setTimeout(refreshPermissions, 1000);
  };

  // Request Contacts Access
  const handleRequestContacts = async () => {
    await permissionService.requestContactPermission();
    setTimeout(refreshPermissions, 1000);
  };

  // Test Contact Picker
  const handleTestContactPicker = async () => {
    const res = await permissionService.pickContact();
    if (res.success) {
      setContactPickedNotice(
        lang === 'gu'
          ? `✓ સંપર્ક પસંદ થયો: ${res.name} (${res.mobile})`
          : `✓ Contact picked: ${res.name} (${res.mobile})`
      );
      setContactStatus('granted');
      setTimeout(() => setContactPickedNotice(''), 4000);
    } else {
      handleRequestContacts();
    }
  };

  // Test Audio & Sound
  const handleTestAudio = () => {
    setIsTestingAudio(true);
    try {
      if (audioService?.playSuccess) audioService.playSuccess();
      setAudioPlayed(true);
    } catch (e) {
      console.warn('Audio test failed:', e);
    } finally {
      setIsTestingAudio(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-xs border border-white/20">
              🛡️
            </div>
            <div>
              <h2 className="text-sm font-bold leading-tight">
                {lang === 'gu' ? 'પરવાનગીઓ & સુરક્ષા સેટિંગ્સ' : 'Permissions & Security'}
              </h2>
              <p className="text-[11px] text-blue-100 mt-0.5">
                {lang === 'gu' ? '૧૦૦% ઓફલાઇન • સંપૂર્ણ સુરક્ષિત • કોઈ ટ્રેકિંગ નહીં' : '100% Offline • Fully Secure • Zero Cloud'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-black/20 hover:bg-black/30 text-white transition active:scale-95"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content List */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1">
          
          {/* Privacy & Security Guarantee Banner */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800/50 flex items-start gap-2.5">
            <ShieldCheck size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <h4 className="text-xs font-black text-emerald-950 dark:text-emerald-300">
                {lang === 'gu' ? '🔒 પ્રાઇવસી અને સુરક્ષા ગેરંટી' : 'Privacy & Security Guarantee'}
              </h4>
              <p className="text-[11px] text-emerald-800 dark:text-emerald-400 mt-0.5 leading-relaxed">
                {lang === 'gu'
                  ? 'તમારા ફોટા, સંપર્કો, નોંધો કે હિસાબ કોઈ સર્વર કે ત્રીજી વ્યક્તિ સાથે શેર થતા નથી. તમામ ડેટા માત્ર તમારા જ મોબાઇલની મેમરીમાં સુરક્ષિત રહે છે.'
                  : 'Your photos, contacts, notes, and finance stay 100% on your device only. Never shared or uploaded to the cloud.'}
              </p>
            </div>
          </div>

          {/* 1. Microphone Access */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100 text-xs">
                <Mic size={16} className="text-blue-600 dark:text-blue-400" />
                <span>૧. માઇક્રોફોન & વૉઇસ ટાઇપિંગ</span>
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
              ગુજરાતીમાં બોલીને નોંધ લખવા અને AI સહાયક સાથે વાત કરવા માટે જરૂરી છે.
            </p>

            <button
              onClick={handleTestMic}
              disabled={isTestingMic}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shadow-sm active:scale-95 transition flex items-center gap-1.5"
            >
              <Mic size={12} />
              <span>{isTestingMic ? 'ચકાસી રહ્યા છીએ...' : micStatus === 'granted' ? 'ટેસ્ટ વૉઇસ બોલો' : 'પરવાનગી સક્ષમ કરો'}</span>
            </button>
          </div>

          {/* 2. Notification & Alarms Access */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100 text-xs">
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

          {/* 3. Photos & Media Access */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100 text-xs">
                <ImageIcon size={16} className="text-purple-600 dark:text-purple-400" />
                <span>૩. ફોટો & ગેલેરી ઍક્સેસ (Photos Access)</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  photoStatus === 'granted'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                }`}
              >
                {photoStatus === 'granted' ? '✓ સક્રિય (Allowed)' : 'પરવાનગી આપો'}
              </span>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              ગેલેરીમાંથી ફેવરિટ ફોટા પસંદ કરી સાચવવા માટે જરૂરી છે. ફોટા ૧૦૦% ઓફલાઇન તમારા જ ફોનમાં સચવાય છે.
            </p>

            <button
              onClick={handleRequestPhotos}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] shadow-sm active:scale-95 transition flex items-center gap-1.5"
            >
              <ImageIcon size={12} />
              <span>{photoStatus === 'granted' ? 'પરવાનગી ચકાસો ✓' : 'ફોટો પરવાનગી આપો'}</span>
            </button>
          </div>

          {/* 4. Contacts Access */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100 text-xs">
                <Users size={16} className="text-teal-600 dark:text-teal-400" />
                <span>૪. સંપર્કો ઍક્સેસ (Contacts Access)</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  contactStatus === 'granted'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                }`}
              >
                {contactStatus === 'granted' ? '✓ સક્રિય (Allowed)' : 'પરવાનગી આપો'}
              </span>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              ખાતાવહીમાં પાર્ટીનું નામ ઉમેરવા, કામોના રિમાઇન્ડર અને ઇમરજન્સી હેલ્પલાઇન માટે સીધા કોન્ટેક્ટ સિલેક્ટ કરવા માટે જરૂરી છે.
            </p>

            <div className="flex items-center gap-2">
              <button
                onClick={handleTestContactPicker}
                className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] shadow-sm active:scale-95 transition flex items-center gap-1.5"
              >
                <Users size={12} />
                <span>સંપર્ક ચકાસો / પરવાનગી આપો</span>
              </button>
            </div>

            {contactPickedNotice && (
              <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                {contactPickedNotice}
              </p>
            )}
          </div>

          {/* 5. Audio & Speech Sound */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-100 text-xs">
                <Volume2 size={16} className="text-emerald-600 dark:text-emerald-400" />
                <span>૫. ઓડિયો અને વૉઇસ સાઉન્ડ (Audio Chime)</span>
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
