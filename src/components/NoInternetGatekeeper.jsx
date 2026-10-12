import React, { useState, useEffect, useCallback } from 'react';
import { WifiOff, RefreshCw, ShieldAlert, Wifi, Globe, Smartphone, CheckCircle2 } from 'lucide-react';

export default function NoInternetGatekeeper({ onRetry, lang = 'gu' }) {
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheckMessage, setLastCheckMessage] = useState('');

  const performCheck = useCallback(async () => {
    setIsChecking(true);
    setLastCheckMessage(
      lang === 'gu'
        ? 'કનેક્શન ચકાસી રહ્યું છે...'
        : lang === 'hi'
        ? 'कनेक्शन की जांच की जा रही है...'
        : 'Verifying connection...'
    );

    try {
      const isConnected = await onRetry();
      if (!isConnected) {
        setLastCheckMessage(
          lang === 'gu'
            ? '❌ હજુ ઇન્ટરનેટ ચાલુ નથી થયું. કૃપા કરીને મોબાઇલ ડેટા અથવા Wi-Fi ચાલુ કરો.'
            : lang === 'hi'
            ? '❌ अभी इंटरनेट चालू नहीं हुआ है। कृपया मोबाइल डेटा या Wi-Fi ऑन करें।'
            : '❌ No internet detected yet. Please switch on Mobile Data or Wi-Fi.'
        );
      }
    } catch {
      setLastCheckMessage(
        lang === 'gu'
          ? '❌ ઇન્ટરનેટ મળતું નથી.'
          : '❌ No internet connection.'
      );
    } finally {
      setTimeout(() => setIsChecking(false), 500);
    }
  }, [onRetry, lang]);

  // Automatically monitor and poll every 2.5 seconds to auto-unlock as soon as user turns on Mobile Data / Wi-Fi
  useEffect(() => {
    const handleOnlineEvent = () => {
      performCheck();
    };

    window.addEventListener('online', handleOnlineEvent);

    const interval = setInterval(() => {
      if (navigator.onLine) {
        performCheck();
      }
    }, 2500);

    return () => {
      window.removeEventListener('online', handleOnlineEvent);
      clearInterval(interval);
    };
  }, [performCheck]);

  return (
    <div className="fixed inset-0 z-[99999] bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white flex flex-col items-center justify-between p-6 select-none overflow-y-auto">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header / App Branding */}
      <div className="w-full flex items-center justify-center gap-2 pt-4 relative z-10">
        <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 text-lg">
          📔
        </div>
        <div className="text-left">
          <h3 className="text-sm font-black tracking-wide text-white">
            {lang === 'gu'
              ? 'દૈનિક ડાયરી & હિસાબ'
              : lang === 'hi'
              ? 'दैनिक डायरी व हिसाब'
              : 'Daily Diary & Accounts'}
          </h3>
          <p className="text-[10px] text-blue-200/80 font-bold uppercase tracking-wider">
            100% Online Cloud App
          </p>
        </div>
      </div>

      {/* Main Center Alert Hero */}
      <div className="w-full max-w-sm flex flex-col items-center text-center my-auto py-6 relative z-10 space-y-5">
        {/* Radar Disconnected Pulse Icon */}
        <div className="relative">
          <div className="w-28 h-28 rounded-full bg-rose-500/20 animate-ping absolute inset-0" />
          <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-600 flex items-center justify-center shadow-2xl shadow-rose-600/40 border border-white/20 relative z-10">
            <WifiOff size={52} className="text-white drop-shadow-md animate-pulse" />
          </div>
          <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 bg-rose-950 border border-rose-500 text-rose-300 text-[10px] font-black rounded-full shadow-lg z-20">
            OFFLINE
          </span>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-2xl font-black tracking-tight text-white drop-shadow-sm">
            {lang === 'gu'
              ? 'ઇન્ટરનેટ કનેક્શન જરૂરી છે'
              : lang === 'hi'
              ? 'इंटरनेट कनेक्शन आवश्यक है'
              : 'Active Internet Required'}
          </h1>
          <p className="text-xs text-slate-300 leading-relaxed px-2 font-medium">
            {lang === 'gu'
              ? 'આ એપ ૧૦૦% ઓનલાઇન મોડમાં સુરક્ષિત રીતે ચાલે છે. એપનો ઉપયોગ કરવા માટે કૃપા કરીને તમારા ફોનમાં મોબાઇલ ડેટા (ઇન્ટરનેટ) અથવા Wi-Fi ચાલુ કરો.'
              : lang === 'hi'
              ? 'यह ऐप 100% ऑनलाइन मोड में सुरक्षित रूप से चलता है। ऐप का उपयोग करने के लिए कृपया मोबाइल डेटा (इंटरनेट) या Wi-Fi चालू करें।'
              : 'This application strictly operates 100% online for real-time cloud data security. Please turn on Mobile Data or Wi-Fi to use the app.'}
          </p>
        </div>

        {/* Requirements / Notice Card */}
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-3.5 text-left space-y-2.5 backdrop-blur-md">
          <div className="flex items-center gap-2.5 text-xs text-rose-200 font-bold">
            <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse shrink-0" />
            <span>
              {lang === 'gu'
                ? 'ઇન્ટરનેટ વગર એપ ઓપન થશે નહીં'
                : lang === 'hi'
                ? 'इंटरनेट के बिना ऐप नहीं खुलेगा'
                : 'App will not open without internet'}
            </span>
          </div>

          <div className="space-y-1.5 text-[11px] text-slate-300 pl-4 border-l border-white/10">
            <div className="flex items-center gap-2">
              <Smartphone size={13} className="text-blue-400 shrink-0" />
              <span>
                {lang === 'gu'
                  ? 'મોબાઇલ ડેટા (ઇન્ટરનેટ) ચાલુ કરો'
                  : lang === 'hi'
                  ? 'मोबाइल डेटा (इंटरनेट) ऑन करें'
                  : 'Turn on Mobile Data (4G/5G)'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Wifi size={13} className="text-emerald-400 shrink-0" />
              <span>
                {lang === 'gu'
                  ? 'અથવા Wi-Fi નેટવર્ક સાથે કનેક્ટ કરો'
                  : lang === 'hi'
                  ? 'या Wi-Fi से कनेक्ट करें'
                  : 'Or connect to a Wi-Fi network'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Globe size={13} className="text-cyan-400 shrink-0" />
              <span>
                {lang === 'gu'
                  ? 'નેટ ચાલુ થતાં જ એપ આપમેળે ખૂલી જશે'
                  : lang === 'hi'
                  ? 'नेट ऑन होते ही ऐप अपने-आप खुल जाएगा'
                  : 'App auto-opens once internet connects'}
              </span>
            </div>
          </div>
        </div>

        {/* Last check status message */}
        {lastCheckMessage && (
          <div className="text-xs font-bold text-amber-300 bg-amber-950/40 border border-amber-500/30 px-3 py-1.5 rounded-xl animate-in fade-in">
            {lastCheckMessage}
          </div>
        )}

        {/* Retry Button */}
        <button
          type="button"
          onClick={performCheck}
          disabled={isChecking}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white font-black text-sm rounded-2xl shadow-xl shadow-blue-600/30 transition flex items-center justify-center gap-2 border border-blue-400/30 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw size={18} className={isChecking ? 'animate-spin' : ''} />
          <span>
            {isChecking
              ? (lang === 'gu' ? 'ચકાસી રહ્યું છે...' : lang === 'hi' ? 'जांच जारी...' : 'Checking...')
              : (lang === 'gu' ? '🔄 ફરી પ્રયાસ કરો (Retry Connection)' : lang === 'hi' ? '🔄 पुनः प्रयास करें' : '🔄 Retry Connection')}
          </span>
        </button>
      </div>

      {/* Footer Info */}
      <div className="w-full text-center relative z-10 pb-2">
        <p className="text-[11px] text-slate-400 font-medium">
          🔒 {lang === 'gu' ? '૧૦૦% ઓનલાઇન & ક્લાઉડ સુરક્ષિત સિસ્ટમ' : lang === 'hi' ? '100% ऑनलाइन व क्लाउड सुरक्षित सिस्टम' : '100% Online & Cloud Secured System'}
        </p>
      </div>
    </div>
  );
}
