import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  Mail,
  Calendar,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Send,
  Eye,
  EyeOff,
  Fingerprint,
  Smartphone,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { otpService } from '../services/otpService';
import { audioService } from '../services/audioService';
import { storageService } from '../services/storageService';

export default function SignupModal({
  isOpen = true,
  onComplete,
  lang = 'gu',
  initialData = {},
}) {
  // Form State
  const [name, setName] = useState(initialData.name || '');
  const [mobile, setMobile] = useState(initialData.mobile || '');
  const [email, setEmail] = useState(initialData.email || '');
  const [dob, setDob] = useState(initialData.dob || '');
  const [pin, setPin] = useState(initialData.pin || '');
  const [confirmPin, setConfirmPin] = useState(initialData.pin || '');
  const [showPin, setShowPin] = useState(false);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(true);

  // Mobile OTP State
  const [mobileOtp, setMobileOtp] = useState('');
  const [isMobileOtpSent, setIsMobileOtpSent] = useState(false);
  const [isMobileVerified, setIsMobileVerified] = useState(Boolean(initialData.isMobileVerified));
  const [mobileOtpNotice, setMobileOtpNotice] = useState('');
  const [mobileTimer, setMobileTimer] = useState(0);

  // Email OTP State
  const [emailOtp, setEmailOtp] = useState('');
  const [isEmailOtpSent, setIsEmailOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(Boolean(initialData.isEmailVerified));
  const [emailOtpNotice, setEmailOtpNotice] = useState('');
  const [emailTimer, setEmailTimer] = useState(0);

  // Global Error & Loading
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Timer countdown effects
  useEffect(() => {
    let interval;
    if (mobileTimer > 0) {
      interval = setInterval(() => setMobileTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [mobileTimer]);

  useEffect(() => {
    let interval;
    if (emailTimer > 0) {
      interval = setInterval(() => setEmailTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [emailTimer]);

  if (!isOpen) return null;

  // Send Mobile OTP
  const handleSendMobileOtp = async () => {
    const cleanNum = mobile.replace(/[^0-9]/g, '');
    if (cleanNum.length < 10) {
      setErrorMsg(lang === 'gu' ? 'કૃપા કરીને માન્ય ૧૦ અંકનો મોબાઈલ નંબર દાખલ કરો.' : 'Please enter valid 10-digit mobile number.');
      return;
    }

    setErrorMsg('');
    try {
      const res = await otpService.sendMobileOtp(cleanNum, name || 'User');
      if (res.success) {
        setIsMobileOtpSent(true);
        setMobileTimer(60);
        setMobileOtpNotice(
          lang === 'gu'
            ? `📲 વેરિફિકેશન કોડ: ${res.otp} (સ્ક્રીન પર દર્શાવેલ છે)`
            : `📲 Verification Code: ${res.otp}`
        );
      }
    } catch (err) {
      setErrorMsg(lang === 'gu' ? 'OTP મોકલવામાં નિષ્ફળતા. ફરી પ્રયત્ન કરો.' : 'Failed to send OTP.');
    }
  };

  // Verify Mobile OTP
  const handleVerifyMobileOtp = () => {
    const cleanNum = mobile.replace(/[^0-9]/g, '');
    const res = otpService.verifyOtp(cleanNum, mobileOtp);
    if (res.success) {
      setIsMobileVerified(true);
      setErrorMsg('');
      setMobileOtpNotice(lang === 'gu' ? '✓ મોબાઈલ નંબર સફળતાપૂર્વક વેરિફાય થયો!' : '✓ Mobile number verified successfully!');
      try {
        if (audioService?.playChime) audioService.playChime();
      } catch {}
    } else {
      setErrorMsg(res.error || (lang === 'gu' ? 'ખોટો OTP છે. ફરી તપાસો.' : 'Invalid OTP.'));
    }
  };

  // Send Email OTP
  const handleSendEmailOtp = async () => {
    const cleanEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setErrorMsg(lang === 'gu' ? 'કૃપા કરીને સાચું ઇમેઇલ એડ્રેસ દાખલ કરો.' : 'Please enter valid email address.');
      return;
    }

    setErrorMsg('');
    try {
      const res = await otpService.sendEmailOtp(cleanEmail, name || 'User');
      if (res.success) {
        setIsEmailOtpSent(true);
        setEmailTimer(60);
        setEmailOtpNotice(
          lang === 'gu'
            ? `📧 વેરિફિકેશન કોડ: ${res.otp} (સ્ક્રીન પર દર્શાવેલ છે)`
            : `📧 Verification Code: ${res.otp}`
        );
      }
    } catch (err) {
      setErrorMsg(lang === 'gu' ? 'ઇમેઇલ OTP મોકલવામાં નિષ્ફળતા.' : 'Failed to send email OTP.');
    }
  };

  // Verify Email OTP
  const handleVerifyEmailOtp = () => {
    const cleanEmail = email.trim();
    const res = otpService.verifyOtp(cleanEmail, emailOtp);
    if (res.success) {
      setIsEmailVerified(true);
      setErrorMsg('');
      setEmailOtpNotice(lang === 'gu' ? '✓ ઇમેઇલ સફળતાપૂર્વક વેરિફાય થયો!' : '✓ Email verified successfully!');
      try {
        if (audioService?.playChime) audioService.playChime();
      } catch {}
    } else {
      setErrorMsg(res.error || (lang === 'gu' ? 'ખોટો OTP છે. ફરી તપાસો.' : 'Invalid OTP.'));
    }
  };

  // Final Registration Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg(lang === 'gu' ? 'કૃપા કરીને તમારું પૂરું નામ દાખલ કરો.' : 'Please enter your full name.');
      return;
    }

    if (!isMobileVerified) {
      setErrorMsg(lang === 'gu' ? 'કૃપા કરીને પહેલાં મોબાઈલ નંબર પર OTP મંગાવી વેરિફાય કરો.' : 'Please verify mobile number with OTP.');
      return;
    }

    if (!isEmailVerified) {
      setErrorMsg(lang === 'gu' ? 'કૃપા કરીને ઇમેઇલ ID પર OTP મંગાવી વેરિફાય કરો.' : 'Please verify email address with OTP.');
      return;
    }

    if (!dob) {
      setErrorMsg(lang === 'gu' ? 'કૃપા કરીને તમારી જન્મ તારીખ પસંદ કરો.' : 'Please select your Date of Birth.');
      return;
    }

    if (!pin || pin.length !== 4) {
      setErrorMsg(lang === 'gu' ? 'સુરક્ષા PIN બરાબર ૪ અંકનો હોવો જોઈએ.' : 'Security PIN must be 4 digits.');
      return;
    }

    if (pin !== confirmPin) {
      setErrorMsg(lang === 'gu' ? 'બંને PIN મેચ થતા નથી. કૃપા કરીને સરખો PIN દાખલ કરો.' : 'PIN and Confirm PIN do not match.');
      return;
    }

    setIsSubmitting(true);

    const newUserProfile = {
      name: name.trim(),
      mobile: mobile.trim(),
      email: email.trim().toLowerCase(),
      dob,
      pin,
      isRegistered: true,
      isLinked: true,
      isMobileVerified: true,
      isEmailVerified: true,
      isPinRequired: true,
      isBiometricEnabled,
      isEncrypted: true,
      updatedAt: new Date().toISOString(),
    };

    // Save profile to storage
    storageService.saveUserProfile(newUserProfile);

    // Confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {}

    // Audio chime
    try {
      if (audioService?.playSuccess) audioService.playSuccess();
    } catch {}

    setTimeout(() => {
      setIsSubmitting(false);
      onComplete?.(newUserProfile);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[95vh] flex flex-col">
        
        {/* Header Banner */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white p-5 sm:p-6 text-center select-none shrink-0">
          <div className="inline-flex p-3 rounded-2xl bg-white/15 backdrop-blur-md text-amber-300 shadow-inner mb-2">
            <Sparkles size={28} />
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            {lang === 'gu' ? 'નવું ખાતું રજીસ્ટ્રેશન' : lang === 'hi' ? 'नया खाता पंजीकरण' : 'Create Your Account'}
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-1">
            {lang === 'gu'
              ? 'દૈનિક ડાયરી અને સ્માર્ટ આસિસ્ટન્ટમાં આપનું હાર્દિક સ્વાગત છે!'
              : 'Welcome to Daily Diary & Smart Assistant!'}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-slate-800 dark:text-slate-100">
          {errorMsg && (
            <div className="p-3 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center gap-2 text-xs font-semibold text-red-600 dark:text-red-400 animate-shake">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* 1. Full Name */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'gu' ? '૧. તમારું પૂરું નામ' : '1. Full Name'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={lang === 'gu' ? 'દા.ત. સુરેશભાઈ પટેલ' : 'e.g. Suresh Patel'}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                />
              </div>
            </div>

            {/* 2. Mobile Number & OTP Verification */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Phone size={14} className="text-indigo-500" />
                  <span>{lang === 'gu' ? '૨. મોબાઈલ નંબર' : '2. Mobile Number'}</span>
                  <span className="text-red-500">*</span>
                </label>
                {isMobileVerified ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    <CheckCircle2 size={12} />
                    {lang === 'gu' ? 'વેરિફાઈડ' : 'Verified'}
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                    {lang === 'gu' ? 'વેરિફિકેશન જરૂરી' : 'Verification Required'}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="tel"
                  disabled={isMobileVerified}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="9876543210"
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium text-xs disabled:opacity-75"
                />
                {!isMobileVerified && (
                  <button
                    type="button"
                    disabled={mobileTimer > 0}
                    onClick={handleSendMobileOtp}
                    className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-[11px] shadow-sm transition disabled:opacity-50 shrink-0"
                  >
                    {mobileTimer > 0 ? `${mobileTimer}s` : isMobileOtpSent ? (lang === 'gu' ? 'ફરી મોકલો' : 'Resend') : (lang === 'gu' ? 'OTP મોકલો' : 'Send OTP')}
                  </button>
                )}
              </div>

              {mobileOtpNotice && (
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] flex items-center justify-between border border-indigo-200 dark:border-indigo-900/50">
                  <span>{mobileOtpNotice}</span>
                  {!isMobileVerified && (
                    <button
                      type="button"
                      onClick={() => setMobileOtp(mobileOtpNotice.replace(/[^0-9]/g, '').slice(0, 6))}
                      className="text-[10px] underline hover:text-indigo-900 dark:hover:text-white"
                    >
                      {lang === 'gu' ? 'ઓટો-ભરો' : 'Auto Fill'}
                    </button>
                  )}
                </div>
              )}

              {/* Mobile OTP Input Box */}
              {!isMobileVerified && isMobileOtpSent && (
                <div className="flex gap-2 pt-1 animate-fade-in">
                  <input
                    type="text"
                    maxLength={6}
                    value={mobileOtp}
                    onChange={(e) => setMobileOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder={lang === 'gu' ? '૬ અંકનો OTP દાખલ કરો' : 'Enter 6-digit OTP'}
                    className="flex-1 px-3 py-2 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-800 text-center tracking-widest font-black text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyMobileOtp}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-[11px] shadow-sm transition shrink-0"
                  >
                    {lang === 'gu' ? 'વેરિફાય કરો' : 'Verify'}
                  </button>
                </div>
              )}
            </div>

            {/* 3. Email ID & OTP Verification */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Mail size={14} className="text-blue-500" />
                  <span>{lang === 'gu' ? '૩. ઇમેઇલ ID' : '3. Email Address'}</span>
                  <span className="text-red-500">*</span>
                </label>
                {isEmailVerified ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                    <CheckCircle2 size={12} />
                    {lang === 'gu' ? 'વેરિફાઈડ' : 'Verified'}
                  </span>
                ) : (
                  <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                    {lang === 'gu' ? 'વેરિફિકેશન જરૂરી' : 'Verification Required'}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="email"
                  disabled={isEmailVerified}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium text-xs disabled:opacity-75"
                />
                {!isEmailVerified && (
                  <button
                    type="button"
                    disabled={emailTimer > 0}
                    onClick={handleSendEmailOtp}
                    className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-[11px] shadow-sm transition disabled:opacity-50 shrink-0"
                  >
                    {emailTimer > 0 ? `${emailTimer}s` : isEmailOtpSent ? (lang === 'gu' ? 'ફરી મોકલો' : 'Resend') : (lang === 'gu' ? 'OTP મોકલો' : 'Send OTP')}
                  </button>
                )}
              </div>

              {emailOtpNotice && (
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold text-[11px] flex items-center justify-between border border-blue-200 dark:border-blue-900/50">
                  <span>{emailOtpNotice}</span>
                  {!isEmailVerified && (
                    <button
                      type="button"
                      onClick={() => setEmailOtp(emailOtpNotice.replace(/[^0-9]/g, '').slice(0, 6))}
                      className="text-[10px] underline hover:text-blue-900 dark:hover:text-white"
                    >
                      {lang === 'gu' ? 'ઓટો-ભરો' : 'Auto Fill'}
                    </button>
                  )}
                </div>
              )}

              {/* Email OTP Input Box */}
              {!isEmailVerified && isEmailOtpSent && (
                <div className="flex gap-2 pt-1 animate-fade-in">
                  <input
                    type="text"
                    maxLength={6}
                    value={emailOtp}
                    onChange={(e) => setEmailOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder={lang === 'gu' ? '૬ અંકનો OTP દાખલ કરો' : 'Enter 6-digit OTP'}
                    className="flex-1 px-3 py-2 rounded-xl border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-800 text-center tracking-widest font-black text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyEmailOtp}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-[11px] shadow-sm transition shrink-0"
                  >
                    {lang === 'gu' ? 'વેરિફાય કરો' : 'Verify'}
                  </button>
                </div>
              )}
            </div>

            {/* 4. Date of Birth */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'gu' ? '૪. જન્મ તારીખ (DOB)' : '4. Date of Birth'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="date"
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                />
              </div>
            </div>

            {/* 5. 4-Digit Security PIN */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-3">
              <div className="flex items-center justify-between">
                <label className="font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                  <KeyRound size={15} className="text-amber-600" />
                  <span>{lang === 'gu' ? '૫. નવો સુરક્ષા PIN (૪-અંક)' : '5. New Security PIN (4-digit)'}</span>
                  <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="text-amber-700 dark:text-amber-400 hover:text-amber-900"
                >
                  {showPin ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block mb-1">
                    {lang === 'gu' ? 'PIN દાખલ કરો' : 'Enter PIN'}
                  </span>
                  <input
                    type={showPin ? 'text' : 'password'}
                    maxLength={4}
                    inputMode="numeric"
                    required
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="••••"
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-center tracking-widest font-black text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-semibold block mb-1">
                    {lang === 'gu' ? 'PIN કન્ફર્મ કરો' : 'Confirm PIN'}
                  </span>
                  <input
                    type={showPin ? 'text' : 'password'}
                    maxLength={4}
                    inputMode="numeric"
                    required
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="••••"
                    className="w-full px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-800 text-center tracking-widest font-black text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>
              <p className="text-[10px] text-amber-800 dark:text-amber-300/80">
                {lang === 'gu'
                  ? '🔒 આ ૪-અંકનો સિક્રેટ PIN હવેથી એપ ખોલતી વખતે લૉગિન માટે વપરાશે.'
                  : '🔒 This 4-digit PIN will be used to unlock your app.'}
              </p>
            </div>

            {/* 6. Biometric Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center gap-2">
                <Fingerprint size={18} className="text-emerald-600 dark:text-emerald-400" />
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    {lang === 'gu' ? 'ફિંગરપ્રિન્ટ લૉગિન સક્ષમ કરો' : 'Enable Fingerprint Login'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {lang === 'gu' ? 'ઝડપી અને સુરક્ષિત બાયોમેટ્રિક અનલૉક' : 'Fast & secure biometric unlock'}
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isBiometricEnabled}
                onChange={(e) => setIsBiometricEnabled(e.target.checked)}
                className="w-5 h-5 accent-emerald-600 cursor-pointer rounded"
              />
            </div>

            {/* 7. Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-black text-sm shadow-lg shadow-indigo-600/30 active:scale-98 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>{lang === 'gu' ? 'ખાતું બની રહ્યું છે...' : 'Creating Account...'}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>{lang === 'gu' ? 'ખાતું બનાવો અને શરૂ કરો 🚀' : 'Create Account & Get Started 🚀'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
