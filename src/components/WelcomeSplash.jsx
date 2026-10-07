import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Sun, Sunset, Moon, Sunrise } from 'lucide-react';

export default function WelcomeSplash({ onFinish, user, dailyQuote }) {
  const [greeting, setGreeting] = useState({ text: 'નમસ્તે!', icon: Sparkles, sub: 'તમારો દિવસ મંગલમય રહે!' });
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 12) {
      setGreeting({ text: 'શુભ સવાર', icon: Sunrise, sub: 'નવા દિવસની ઉમંગભરી શરૂઆત કરો!' });
    } else if (hour >= 12 && hour < 17) {
      setGreeting({ text: 'શુભ બપોર', icon: Sun, sub: 'તમારા દૈનિક કામકાજ અને પાણીનું ધ્યાન રાખો!' });
    } else if (hour >= 17 && hour < 21) {
      setGreeting({ text: 'શુભ સાંજ', icon: Sunset, sub: 'દિવસભરના કાર્યોની સમીક્ષા કરવાનો સમય!' });
    } else {
      setGreeting({ text: 'શુભ રાત્રિ', icon: Moon, sub: 'આજના દિવસની ડાયરી નોંધ કરી સુખેથી પોઢો!' });
    }

    // Auto-dismiss after 2.2 seconds
    const timer = setTimeout(() => {
      handleClose();
    }, 2400);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setFading(true);
    setTimeout(() => {
      onFinish();
    }, 350);
  };

  const todayStr = new Intl.DateTimeFormat('gu-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  const IconComp = greeting.icon;

  return (
    <div
      onClick={handleClose}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-between p-6 bg-[#070D32] text-white transition-opacity duration-300 cursor-pointer select-none ${
        fading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}
      style={{
        backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(212, 175, 55, 0.15) 0%, rgba(7, 13, 50, 1) 75%)'
      }}
    >
      {/* Top Bar / Date */}
      <div className="w-full flex justify-between items-center text-xs text-amber-200/80 pt-4">
        <span className="flex items-center gap-1.5 font-medium tracking-wide">
          <IconComp className="w-4 h-4 text-amber-400" />
          {todayStr}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); handleClose(); }}
          className="text-xs bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-full text-amber-300 font-medium transition-colors"
        >
          સ્કીપ કરો ✕
        </button>
      </div>

      {/* Center Branding & Mascot */}
      <div className="flex flex-col items-center text-center my-auto px-4 max-w-sm">
        {/* Glowing App Icon Frame */}
        <div className="relative mb-6">
          <div className="absolute -inset-3 bg-gradient-to-r from-amber-500/30 via-yellow-400/20 to-purple-600/30 rounded-3xl blur-xl animate-pulse"></div>
          <img
            src="./icon-192.png"
            alt="Daily Diary Logo"
            className="relative w-28 h-28 object-contain rounded-2xl shadow-2xl border border-amber-400/40"
            style={{
              filter: 'drop-shadow(0 10px 25px rgba(212, 175, 55, 0.45))'
            }}
          />
        </div>

        {/* Dynamic Greeting */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
          {greeting.text}{user?.name ? `, ${user.name}` : ''}!
        </div>

        <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-300 bg-clip-text text-transparent mb-1 font-serif tracking-wide drop-shadow">
          રોજિંદી ડાયરી અને સ્માર્ટ આસિસ્ટન્ટ
        </h1>

        <p className="text-xs text-slate-300 mb-6 font-light">
          {greeting.sub}
        </p>

        {/* Daily Suvichar Box */}
        {dailyQuote && (
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-amber-400/25 rounded-2xl p-4 shadow-xl backdrop-blur-md text-left w-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl"></div>
            <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-bold uppercase tracking-wider mb-1.5">
              <span>🌟 આજનો પ્રેરણાદાયી સુવિચાર</span>
            </div>
            <p className="text-xs text-amber-100/90 leading-relaxed font-sans italic">
              "{dailyQuote.quote || dailyQuote.text || 'સફળતા એ દરરોજના નાના પ્રયત્નોનો સરવાળો છે.'}"
            </p>
            {dailyQuote.author && (
              <p className="text-[10px] text-amber-300/70 text-right mt-1 font-medium">
                — {dailyQuote.author}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Bottom Button */}
      <div className="w-full flex flex-col items-center gap-2 pb-6">
        <button
          onClick={handleClose}
          className="w-full max-w-xs py-3 px-6 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 flex items-center justify-center gap-2 transition-all transform active:scale-95"
        >
          <span>ડાયરીમાં પ્રવેશ કરો</span>
          <ArrowRight className="w-4 h-4" />
        </button>
        <span className="text-[10px] text-slate-400">
          સ્ક્રીન પર ગમે ત્યાં ટચ કરીને પણ આગળ વધી શકો છો
        </span>
      </div>
    </div>
  );
}
