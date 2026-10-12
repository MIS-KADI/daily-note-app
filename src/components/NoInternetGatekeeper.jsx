import React, { useEffect, useCallback } from 'react';
import { WifiOff } from 'lucide-react';
import { pedometerService } from '../services/pedometerService';

export default function NoInternetGatekeeper({ onRetry, lang = 'gu' }) {
  const performCheck = useCallback(async () => {
    try {
      // Sync steps even while on offline screen
      pedometerService.syncHardwareSteps();
      await onRetry();
    } catch (_) {}
  }, [onRetry]);

  // Continuously monitor and poll every 1.5 seconds to auto-unlock as soon as user turns on Mobile Data or Wi-Fi
  useEffect(() => {
    const handleOnlineEvent = () => performCheck();

    window.addEventListener('online', handleOnlineEvent);

    const interval = setInterval(() => {
      performCheck();
    }, 1500);

    return () => {
      window.removeEventListener('online', handleOnlineEvent);
      clearInterval(interval);
    };
  }, [performCheck]);

  return (
    <div className="fixed inset-0 z-[99999] bg-gradient-to-b from-[#0f172a] via-[#090d16] to-[#020617] text-white flex flex-col items-center justify-center p-6 select-none overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Center Alert Card (Exact Match to User Requested Screenshot) */}
      <div className="w-full max-w-sm flex flex-col items-center text-center relative z-10 space-y-6">
        {/* Red-Orange Squircle Icon with OFFLINE Badge */}
        <div className="relative">
          <div className="w-28 h-28 rounded-full bg-rose-500/20 animate-ping absolute inset-0 pointer-events-none" />
          <div className="w-28 h-28 rounded-[2rem] bg-gradient-to-tr from-[#f43f5e] via-[#e11d48] to-[#ea580c] flex items-center justify-center shadow-2xl shadow-rose-600/40 border border-white/20 relative z-10">
            <WifiOff size={52} className="text-white drop-shadow-md animate-pulse" />
          </div>
          <span className="absolute -bottom-2 -right-2 px-3 py-0.5 bg-[#090d16] border border-rose-500 text-rose-300 text-[10px] font-black rounded-full shadow-lg z-20 uppercase tracking-wider">
            OFFLINE
          </span>
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-sm">
            {lang === 'gu'
              ? 'ઇન્ટરનેટ કનેક્શન જરૂરી છે'
              : lang === 'hi'
              ? 'इंटरनेट कनेक्शन आवश्यक है'
              : 'Active Internet Required'}
          </h1>

          {/* Subtitle Paragraph */}
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed px-1 font-medium">
            {lang === 'gu'
              ? 'આ એપ ૧૦૦% ઓનલાઇન મોડમાં સુરક્ષિત રીતે ચાલે છે. એપનો ઉપયોગ કરવા માટે કૃપા કરીને તમારા ફોનમાં મોબાઇલ ડેટા (ઇન્ટરનેટ) અથવા Wi-Fi ચાલુ કરો.'
              : lang === 'hi'
              ? 'यह ऐप 100% ऑनलाइन मोड में सुरक्षित रूप से चलता है। ऐप का उपयोग करने के लिए कृपया मोबाइल डेटा (इंटरनेट) या Wi-Fi चालू करें।'
              : 'This application strictly operates 100% online for real-time cloud data security. Please turn on Mobile Data or Wi-Fi to use the app.'}
          </p>
        </div>
      </div>
    </div>
  );
}
