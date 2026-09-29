import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  X,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Sparkles,
  MessageCircle,
  Copy,
  Check,
  Send,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { otpService } from '../services/otpService';
import { audioService } from '../services/audioService';
import { t } from '../services/i18n';

export default function OtpVerificationModal({
  isOpen,
  onClose,
  type = 'mobile', // 'mobile', 'email', 'unlock'
  target = '', // Mobile number or email address
  user,
  onVerified,
  lang = 'gu',
}) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [timer, setTimer] = useState(60);
  const [incomingOtp, setIncomingOtp] = useState('');
  const [hasCopied, setHasCopied] = useState(false);
  const inputRefs = useRef([]);

  // Send OTP on initial modal open
  useEffect(() => {
    if (isOpen) {
      setDigits(['', '', '', '', '', '']);
      setErrorMsg('');
      setIsSuccess(false);
      setTimer(60);
      handleSendOtp();
    }
  }, [isOpen, type, target]);

  // 60-second countdown timer
  useEffect(() => {
    if (!isOpen || timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  const handleSendOtp = async () => {
    setIsSending(true);
    setErrorMsg('');
    try {
      let res;
      if (type === 'mobile') {
        res = await otpService.sendMobileOtp(target || user?.mobile || '+91 98765 43210');
      } else if (type === 'email') {
        res = await otpService.sendEmailOtp(target || user?.email || 'user@example.com');
      } else {
        res = await otpService.sendUnlockOtp(user);
      }

      if (res && res.otp) {
        setIncomingOtp(res.otp);
        setTimer(60);
      }
    } catch (e) {
      setErrorMsg('OTP મોકલવામાં સમસ્યા આવી. ફરી પ્રયત્ન કરો.');
    } finally {
      setIsSending(false);
    }
  };

  const handleDigitChange = (index, value) => {
    // Handle paste of 6 digits
    if (value.length > 1) {
      const clean = value.replace(/[^0-9]/g, '').slice(0, 6);
      if (clean.length > 0) {
        const nextDigits = [...digits];
        for (let i = 0; i < 6; i++) {
          nextDigits[i] = clean[i] || '';
        }
        setDigits(nextDigits);
        if (clean.length === 6) {
          triggerVerification(clean);
        } else {
          inputRefs.current[Math.min(clean.length, 5)]?.focus();
        }
        return;
      }
    }

    const cleanChar = value.replace(/[^0-9]/g, '');
    const nextDigits = [...digits];
    nextDigits[index] = cleanChar;
    setDigits(nextDigits);
    setErrorMsg('');

    if (cleanChar && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullCode = nextDigits.join('');
    if (fullCode.length === 6) {
      triggerVerification(fullCode);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const triggerVerification = (codeToVerify) => {
    const res = otpService.verifyOtp(target || type, codeToVerify);
    if (res.success) {
      setIsSuccess(true);
      setErrorMsg('');
      try {
        if (audioService?.playChime) audioService.playChime();
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
      } catch {}

      setTimeout(() => {
        onVerified(target || type);
        onClose();
      }, 900);
    } else {
      setErrorMsg(res.error || 'ખોટો OTP. ફરીથી ચકાસો.');
      try {
        if (navigator.vibrate) navigator.vibrate([80, 50, 80]);
      } catch {}
    }
  };

  const handleAutoFill = () => {
    if (!incomingOtp) return;
    const nextDigits = incomingOtp.split('');
    setDigits(nextDigits);
    triggerVerification(incomingOtp);
  };

  const handleCopyCode = () => {
    if (!incomingOtp) return;
    navigator.clipboard?.writeText(incomingOtp);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4 animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-indigo-50 text-indigo-600">
              {type === 'email' ? <Mail size={18} /> : <Phone size={18} />}
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                {type === 'mobile'
                  ? (lang === 'gu' ? 'મોબાઇલ નંબર વેરિફિકેશન' : 'Mobile Verification')
                  : type === 'email'
                  ? (lang === 'gu' ? 'ઈમેલ ID વેરિફિકેશન' : 'Email Verification')
                  : (lang === 'gu' ? 'સુરક્ષા OTP અનલૉક' : 'Security OTP Unlock')}
              </h3>
              <p className="text-[10px] text-slate-500 truncate max-w-[200px]">
                {target || (type === 'email' ? user?.email : user?.mobile) || 'User'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Realistic Incoming SMS / Email Alert Card */}
        {incomingOtp && (
          <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-emerald-50 border border-indigo-200/80 rounded-2xl p-3 shadow-xs space-y-2 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-950 flex items-center gap-1.5">
                <Sparkles size={13} className="text-indigo-600" />
                {type === 'email' ? '📧 નવો ઈમેલ આવ્યો' : '📲 નવો SMS OTP આવ્યો'}
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                હમણાં જ
              </span>
            </div>

            <div className="flex items-center justify-between bg-white/90 backdrop-blur-xs rounded-xl p-2 border border-indigo-100">
              <div>
                <span className="text-[10px] text-slate-500 block">વેરિફિકેશન કોડ:</span>
                <span className="text-base font-black text-indigo-700 tracking-widest font-mono">
                  {incomingOtp}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold transition flex items-center gap-1"
                  title="કોપી કરો"
                >
                  {hasCopied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                </button>
                <button
                  type="button"
                  onClick={handleAutoFill}
                  className="px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition flex items-center gap-1"
                >
                  ✨ {lang === 'gu' ? 'ઓટો-ફિલ' : 'Auto-fill'}
                </button>
              </div>
            </div>

            {/* Optional WhatsApp Link for Mobile OTP */}
            {type === 'mobile' && target && (
              <a
                href={otpService.getWhatsAppOtpLink(target, incomingOtp)}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-bold text-emerald-700 hover:text-emerald-800 flex items-center justify-center gap-1 pt-0.5"
              >
                <MessageCircle size={12} />
                <span>{lang === 'gu' ? 'WhatsApp પર OTP મેસેજ મોકલો/જોવો' : 'View on WhatsApp'}</span>
              </a>
            )}
          </div>
        )}

        {/* 6 Digits Inputs */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 block text-center">
            {lang === 'gu' ? '૬ અંકનો વેરિફિકેશન OTP દાખલ કરો' : 'Enter 6-digit OTP code'}
          </label>
          <div className="flex justify-center gap-2">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="tel"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                disabled={isSuccess}
                autoFocus={idx === 0}
                className={`w-10 h-12 text-center text-lg font-black rounded-xl border-2 transition ${
                  isSuccess
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : errorMsg
                    ? 'border-red-400 bg-red-50 text-red-700'
                    : digit
                    ? 'border-indigo-600 bg-indigo-50/50 text-slate-800'
                    : 'border-slate-200 bg-slate-50 text-slate-800 focus:border-indigo-500 focus:bg-white'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Error or Success Notice */}
        {errorMsg && (
          <p className="text-xs text-red-500 font-bold flex items-center justify-center gap-1 animate-in fade-in">
            <AlertCircle size={14} />
            <span>{errorMsg}</span>
          </p>
        )}

        {isSuccess && (
          <p className="text-xs text-emerald-600 font-black flex items-center justify-center gap-1 animate-in fade-in">
            <CheckCircle2 size={16} />
            <span>{lang === 'gu' ? '✅ સફળતાપૂર્વક વેરિફાય થઈ ગયું!' : '✅ Verified successfully!'}</span>
          </p>
        )}

        {/* Timer & Resend Button */}
        <div className="flex items-center justify-between text-xs pt-1 px-1">
          <span className="text-slate-400">
            {timer > 0 ? (
              `${lang === 'gu' ? 'OTP માન્યતા' : 'Expires in'}: ${timer}s`
            ) : (
              <span className="text-red-500 font-bold">{lang === 'gu' ? 'એક્સપાયર થઈ ગયો' : 'Expired'}</span>
            )}
          </span>

          <button
            type="button"
            onClick={handleSendOtp}
            disabled={timer > 0 || isSending}
            className={`font-bold flex items-center gap-1 transition ${
              timer > 0 || isSending
                ? 'text-slate-300 cursor-not-allowed'
                : 'text-indigo-600 hover:text-indigo-800 active:scale-95'
            }`}
          >
            <RotateCw size={12} className={isSending ? 'animate-spin' : ''} />
            <span>{lang === 'gu' ? 'ફરીથી OTP મોકલો' : 'Resend OTP'}</span>
          </button>
        </div>

        {/* Manual Confirm Button */}
        <div className="pt-2 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            {t('cancel', lang)}
          </button>
          <button
            type="button"
            onClick={() => triggerVerification(digits.join(''))}
            disabled={digits.join('').length !== 6 || isSuccess}
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 active:scale-95 transition"
          >
            {lang === 'gu' ? 'વેરિફાય કરો' : 'Verify'}
          </button>
        </div>

      </div>
    </div>
  );
}
