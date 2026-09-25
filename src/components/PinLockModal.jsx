import React, { useState } from 'react';
import { Lock, ShieldCheck, KeyRound, Delete } from 'lucide-react';
import { t } from '../services/i18n';

export default function PinLockModal({ correctPin, onUnlock, lang = 'gu' }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleDigit = (digit) => {
    if (pin.length < 4) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);

      if (nextPin.length === 4) {
        if (nextPin === correctPin) {
          onUnlock();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900 text-white p-4">
      <div className="w-full max-w-xs text-center space-y-6">
        <div className="inline-flex p-4 rounded-3xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
          <Lock size={36} />
        </div>

        <div>
          <h2 className="text-xl font-bold">{t('secure_app_lock', lang)}</h2>
          <p className="text-xs text-slate-400 mt-1">
            {t('pin_modal_desc', lang)}
          </p>
        </div>

        {/* PIN Dots display */}
        <div className={`flex justify-center gap-4 py-2 ${error ? 'animate-shake' : ''}`}>
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`w-4 h-4 rounded-full transition-all duration-200 border-2 ${
                index < pin.length
                  ? error
                    ? 'bg-red-500 border-red-500 scale-110'
                    : 'bg-blue-500 border-blue-500 scale-110'
                  : 'border-slate-600 bg-transparent'
              }`}
            />
          ))}
        </div>

        {error && (
          <p className="text-xs text-red-400 font-semibold animate-in fade-in">
            {t('wrong_pin_msg', lang)}
          </p>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-3 pt-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleDigit(num)}
              className="h-16 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-blue-600 text-xl font-bold border border-slate-700/50 shadow-sm active:scale-95 transition"
            >
              {num}
            </button>
          ))}
          <div className="flex items-center justify-center">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-1">
              <ShieldCheck size={14} className="text-emerald-500" />
              AES-256
            </span>
          </div>
          <button
            onClick={() => handleDigit('0')}
            className="h-16 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-blue-600 text-xl font-bold border border-slate-700/50 shadow-sm active:scale-95 transition"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-16 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 active:bg-red-600/30 flex items-center justify-center border border-slate-700/50 text-slate-400 hover:text-white active:scale-95 transition"
          >
            <Delete size={22} />
          </button>
        </div>

        <div className="pt-2">
          <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
            <KeyRound size={12} />
            {t('default_pin_hint', lang)}
          </p>
        </div>
      </div>
    </div>
  );
}
