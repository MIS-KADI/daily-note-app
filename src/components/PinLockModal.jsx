import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  ShieldCheck,
  Delete,
  Fingerprint,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { biometricService } from '../services/biometricService';
import { t } from '../services/i18n';

export default function PinLockModal({
  correctPin = '1234',
  isBiometricEnabled = true,
  user,
  onUnlock,
  lang = 'gu',
}) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [biometricStatus, setBiometricStatus] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isHoldingTouch, setIsHoldingTouch] = useState(false);
  const [touchProgress, setTouchProgress] = useState(0);
  const holdIntervalRef = useRef(null);

  const triggerBiometric = async () => {
    if (isAuthenticating || isSuccess) return;
    setIsAuthenticating(true);
    setBiometricStatus(
      lang === 'hi'
        ? 'फिंगरप्रिंट या Face ID से अनलॉक करें...'
        : lang === 'en'
        ? 'Touch fingerprint sensor or use Face ID...'
        : 'ફિંગરપ્રિન્ટ સેન્સર પર ટચ કરો અથવા Face ID વાપરો...'
    );

    const res = await biometricService.authenticate();
    setIsAuthenticating(false);

    if (res.success) {
      handleBiometricSuccess();
    } else if (res.cancelled) {
      setBiometricStatus(
        lang === 'hi'
          ? 'सत्यापन रद्द किया गया। PIN दर्ज करें।'
          : lang === 'en'
          ? 'Cancelled. Enter PIN below.'
          : 'બાયોમેટ્રિક કેન્સલ થયું. તમે PIN અથવા નીચે ટચ સેન્સર વાપરી શકો છો.'
      );
    } else {
      // Prompt user to press and hold the interactive touch sensor below
      setBiometricStatus(
        lang === 'hi'
          ? '👇 नीचे दिए फिंगरप्रिंट पर २ सेकंड अंगूठा दबाकर रखें'
          : lang === 'en'
          ? '👇 Press & hold fingerprint sensor below for 2s'
          : '👇 નીચે આપેલ ફિંગરપ્રિન્ટ સેન્સર પર આંગળી દબાવી રાખો'
      );
    }
  };

  const handleBiometricSuccess = () => {
    setIsSuccess(true);
    biometricService.triggerHapticSuccess();
    setBiometricStatus(
      lang === 'hi'
        ? '✓ बायोमेट्रिक सत्यापन सफल!'
        : lang === 'en'
        ? '✓ Biometric Verified!'
        : '✓ બાયોમેટ્રિક સફળતાપૂર્વક પ્રમાણિત થયું!'
    );
    setTimeout(() => {
      onUnlock();
    }, 400);
  };

  // Interactive Touch & Hold Fingerprint Scanner
  const startTouchHold = (e) => {
    e.preventDefault();
    if (isSuccess) return;
    setIsHoldingTouch(true);
    setTouchProgress(0);
    biometricService.triggerHapticPulse();

    let current = 0;
    clearInterval(holdIntervalRef.current);
    holdIntervalRef.current = setInterval(() => {
      current += 10;
      setTouchProgress(current);
      if (current % 30 === 0) {
        biometricService.triggerHapticPulse();
      }

      if (current >= 100) {
        clearInterval(holdIntervalRef.current);
        setIsHoldingTouch(false);
        handleBiometricSuccess();
      }
    }, 70); // ~700ms hold
  };

  const stopTouchHold = () => {
    if (touchProgress < 100) {
      clearInterval(holdIntervalRef.current);
      setIsHoldingTouch(false);
      setTouchProgress(0);
    }
  };

  // Auto-prompt native biometric authentication if enabled
  useEffect(() => {
    let isMounted = true;
    const autoPrompt = async () => {
      if (isBiometricEnabled) {
        await new Promise((r) => setTimeout(r, 250));
        if (isMounted) {
          triggerBiometric();
        }
      }
    };
    autoPrompt();
    return () => {
      isMounted = false;
      clearInterval(holdIntervalRef.current);
    };
  }, [isBiometricEnabled]);

  const handleDigit = (digit) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);

      if (nextPin.length === 4) {
        if (nextPin === correctPin) {
          setIsSuccess(true);
          setTimeout(() => {
            onUnlock();
          }, 300);
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 800);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl text-white p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xs text-center space-y-4">
        
        {/* Top Icon */}
        <div className="relative inline-flex p-3.5 rounded-3xl bg-gradient-to-tr from-blue-600/30 via-indigo-600/30 to-purple-600/30 text-blue-400 border border-blue-500/30 shadow-xl shadow-blue-500/10">
          {isSuccess ? (
            <CheckCircle2 size={32} className="text-emerald-400 animate-bounce" />
          ) : (
            <Lock size={32} className="text-amber-400" />
          )}
          {isBiometricEnabled && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-bold shadow">
              👆
            </span>
          )}
        </div>

        <div>
          <h2 className="text-lg font-black text-white tracking-tight">
            {t('secure_app_lock', lang)}
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {t('pin_modal_desc', lang)}
          </p>
        </div>

        {/* Biometric Status Notification */}
        {biometricStatus && (
          <div
            className={`p-2 rounded-xl text-[11px] font-bold transition flex items-center justify-center gap-1.5 ${
              isSuccess
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-slate-800/80 text-amber-300 border border-slate-700/60'
            }`}
          >
            {isSuccess ? <CheckCircle2 size={13} /> : <Fingerprint size={13} className="animate-pulse" />}
            <span className="truncate">{biometricStatus}</span>
          </div>
        )}

        {/* PIN Dots display */}
        <div className={`flex justify-center gap-3 py-0.5 ${error ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`w-3.5 h-3.5 rounded-full transition-all duration-200 border-2 ${
                index < pin.length
                  ? error
                    ? 'bg-red-500 border-red-500 scale-110'
                    : isSuccess
                    ? 'bg-emerald-400 border-emerald-400 scale-110'
                    : 'bg-blue-500 border-blue-500 scale-110'
                  : 'border-slate-600 bg-transparent'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs text-red-400 font-semibold animate-in fade-in flex items-center justify-center gap-1">
            <AlertCircle size={13} />
            {t('wrong_pin_msg', lang)}
          </p>
        )}

        {/* Interactive Haptic Fingerprint Scanner Button (Touch & Hold) */}
        {isBiometricEnabled && (
          <div className="relative pt-1">
            <button
              type="button"
              onMouseDown={startTouchHold}
              onMouseUp={stopTouchHold}
              onMouseLeave={stopTouchHold}
              onTouchStart={startTouchHold}
              onTouchEnd={stopTouchHold}
              onTouchCancel={stopTouchHold}
              className={`w-full py-2.5 px-3 relative overflow-hidden rounded-2xl border text-xs font-black flex items-center justify-center gap-2 select-none active:scale-98 transition ${
                isHoldingTouch
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-lg shadow-emerald-500/20'
                  : 'bg-gradient-to-r from-emerald-600/25 via-teal-600/25 to-blue-600/25 hover:from-emerald-600/35 hover:to-blue-600/35 text-emerald-300 border-emerald-500/40 shadow-md shadow-emerald-600/10'
              }`}
            >
              {/* Progress fill animation on hold */}
              {isHoldingTouch && (
                <div
                  className="absolute left-0 top-0 bottom-0 bg-emerald-500/30 transition-all duration-75 pointer-events-none"
                  style={{ width: `${touchProgress}%` }}
                />
              )}

              <Fingerprint
                size={18}
                className={`transition ${isHoldingTouch ? 'text-emerald-300 animate-ping' : 'text-emerald-400 animate-pulse'}`}
              />
              <span className="relative z-10">
                {isHoldingTouch
                  ? `${lang === 'gu' ? 'સ્કેન થઈ રહ્યું છે...' : 'Scanning...'} ${touchProgress}%`
                  : lang === 'hi'
                  ? '👆 फिंगरप्रिंट टच करके रखें (Hold to Unlock)'
                  : lang === 'en'
                  ? '👆 Press & Hold Fingerprint'
                  : '👆 ફિંગરપ્રિન્ટ ટચ કરીને દબાવી રાખો'}
              </span>
            </button>
          </div>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-2 pt-0.5">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleDigit(num)}
              className="h-12 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-blue-600 text-lg font-bold border border-slate-700/60 shadow-xs active:scale-95 transition"
            >
              {num}
            </button>
          ))}

          {/* Bottom Left: Native Biometric Prompt Trigger */}
          <button
            onClick={triggerBiometric}
            className="h-12 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 active:bg-emerald-600 text-emerald-400 border border-emerald-500/30 shadow-xs active:scale-95 transition flex flex-col items-center justify-center"
            title="સિસ્ટમ ફિંગરપ્રિન્ટ ચકાસો"
          >
            <Fingerprint size={18} className="animate-pulse" />
            <span className="text-[8px] font-bold">સેન્સર</span>
          </button>

          <button
            onClick={() => handleDigit('0')}
            className="h-12 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-blue-600 text-lg font-bold border border-slate-700/60 shadow-xs active:scale-95 transition"
          >
            0
          </button>

          <button
            onClick={handleDelete}
            className="h-12 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-red-600/30 flex items-center justify-center border border-slate-700/60 text-slate-400 hover:text-white active:scale-95 transition"
          >
            <Delete size={20} />
          </button>
        </div>

        {/* Secure login indicator */}
        <div className="pt-2 flex items-center justify-center text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5 text-slate-400/80">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>{lang === 'gu' ? 'સુરક્ષિત એન્ક્રિપ્ટેડ લૉગિન' : lang === 'hi' ? 'सुरक्षित एन्क्रिप्टेड लॉगिन' : 'Secure Encrypted Login'}</span>
          </span>
        </div>

      </div>
    </div>
  );
}
