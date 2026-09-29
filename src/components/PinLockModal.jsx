import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, KeyRound, Delete, Fingerprint, CheckCircle2, AlertCircle } from 'lucide-react';
import { biometricService } from '../services/biometricService';
import { t } from '../services/i18n';

export default function PinLockModal({
  correctPin = '1234',
  isBiometricEnabled = true,
  onUnlock,
  lang = 'gu',
}) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [biometricStatus, setBiometricStatus] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Auto-prompt biometric authentication if enabled
  useEffect(() => {
    let isMounted = true;

    const autoPrompt = async () => {
      if (isBiometricEnabled) {
        // Small delay to ensure smooth transition
        await new Promise((r) => setTimeout(r, 200));
        if (isMounted) {
          triggerBiometric();
        }
      }
    };

    autoPrompt();

    return () => {
      isMounted = false;
    };
  }, [isBiometricEnabled]);

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
      setIsSuccess(true);
      setBiometricStatus(
        lang === 'hi'
          ? '✓ बायोमेट्रिक सत्यापन सफल!'
          : lang === 'en'
          ? '✓ Biometric Verified!'
          : '✓ બાયોમેટ્રિક સફળતાપૂર્વક ચકાસાયું!'
      );
      setTimeout(() => {
        onUnlock();
      }, 400);
    } else if (res.cancelled) {
      setBiometricStatus(
        lang === 'hi'
          ? 'सत्यापन रद्द किया गया। PIN दर्ज करें।'
          : lang === 'en'
          ? 'Cancelled. Enter PIN below.'
          : 'બાયોમેટ્રિક કેન્સલ થયું. તમે ૪ અંકનો PIN નાખી શકો છો.'
      );
    } else {
      setBiometricStatus(
        lang === 'hi'
          ? 'बायोमेट्रिक उपलब्ध नहीं है। PIN उपयोग करें।'
          : lang === 'en'
          ? 'Biometric not available. Use PIN.'
          : 'બાયોમેટ્રિક ચકાસણી થઈ શકી નથી. PIN નો ઉપયોગ કરો.'
      );
    }
  };

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
      <div className="w-full max-w-xs text-center space-y-5">
        
        {/* Top Icon */}
        <div className="relative inline-flex p-4 rounded-3xl bg-gradient-to-tr from-blue-600/30 via-indigo-600/30 to-purple-600/30 text-blue-400 border border-blue-500/30 shadow-xl shadow-blue-500/10">
          {isSuccess ? (
            <CheckCircle2 size={36} className="text-emerald-400 animate-bounce" />
          ) : (
            <Lock size={36} className="text-amber-400" />
          )}
          {isBiometricEnabled && (
            <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-bold shadow">
              👆
            </span>
          )}
        </div>

        <div>
          <h2 className="text-xl font-black text-white tracking-tight">
            {t('secure_app_lock', lang)}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {t('pin_modal_desc', lang)}
          </p>
        </div>

        {/* Biometric Status Notification */}
        {biometricStatus && (
          <div
            className={`p-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              isSuccess
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-slate-800/80 text-amber-300 border border-slate-700/60'
            }`}
          >
            {isSuccess ? <CheckCircle2 size={14} /> : <Fingerprint size={14} className="animate-pulse" />}
            <span className="truncate">{biometricStatus}</span>
          </div>
        )}

        {/* PIN Dots display */}
        <div className={`flex justify-center gap-4 py-1 ${error ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full transition-all duration-200 border-2 ${
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

        {/* 1-Tap Biometric Main Button */}
        {isBiometricEnabled && (
          <button
            onClick={triggerBiometric}
            disabled={isAuthenticating || isSuccess}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600/30 via-teal-600/30 to-blue-600/30 hover:from-emerald-600/40 hover:to-blue-600/40 text-emerald-300 border border-emerald-500/40 rounded-2xl text-xs font-black flex items-center justify-center gap-2 active:scale-95 transition shadow-lg shadow-emerald-600/10"
          >
            <Fingerprint size={18} className="text-emerald-400 animate-pulse" />
            <span>
              {lang === 'hi'
                ? '👆 फिंगरप्रिंट / Face ID से तुरंत अनलॉक करें'
                : lang === 'en'
                ? '👆 Unlock with Fingerprint / Face ID'
                : '👆 ફિંગરપ્રિન્ટ / Face ID વડે અનલૉક કરો'}
            </span>
          </button>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleDigit(num)}
              className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-blue-600 text-xl font-bold border border-slate-700/60 shadow-sm active:scale-95 transition"
            >
              {num}
            </button>
          ))}

          {/* Bottom Left: Fingerprint Icon Button */}
          <button
            onClick={triggerBiometric}
            className="h-14 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 active:bg-emerald-600 text-emerald-400 border border-emerald-500/30 shadow-sm active:scale-95 transition flex flex-col items-center justify-center"
            title="ફિંગરપ્રિન્ટ સેન્સર વાપરો"
          >
            <Fingerprint size={20} className="animate-pulse" />
            <span className="text-[9px] font-bold mt-0.5">સેન્સર</span>
          </button>

          <button
            onClick={() => handleDigit('0')}
            className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-blue-600 text-xl font-bold border border-slate-700/60 shadow-sm active:scale-95 transition"
          >
            0
          </button>

          <button
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-red-600/30 flex items-center justify-center border border-slate-700/60 text-slate-400 hover:text-white active:scale-95 transition"
          >
            <Delete size={22} />
          </button>
        </div>

        <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1 pt-1">
          <KeyRound size={12} />
          {t('default_pin_hint', lang)}
        </p>

      </div>
    </div>
  );
}
