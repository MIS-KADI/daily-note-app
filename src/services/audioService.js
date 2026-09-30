// High-Fidelity Web Audio API Synthesizer & Custom Mobile Ringtone Service
// Completely offline, responsive on all mobile browsers and desktop

export const RINGTONE_OPTIONS = [
  {
    id: 'classic_bell',
    nameGu: '🔔 ક્લાસિકલ બેલ (Classic Alarm Bell)',
    nameHi: '🔔 क्लासिक अलार्म बेल',
    nameEn: '🔔 Classic Alarm Bell',
    description: 'પરંપરાગત ડબલ બેલ ઘડિયાળની રણકતી ઘંટડી',
    icon: '🔔',
  },
  {
    id: 'flute_melody',
    nameGu: '🎵 વાંસળી સૂર (Morning Flute)',
    nameHi: '🎵 बांसुरी की धुन',
    nameEn: '🎵 Morning Flute Melody',
    description: 'મધુર સંગીતમય વાંસળીનો પ્રભાતી સૂર',
    icon: '🎵',
  },
  {
    id: 'morning_birds',
    nameGu: '🐦 સવારના પક્ષીઓ (Nature Birds)',
    nameHi: '🐦 सुबह के पक्षी',
    nameEn: '🐦 Morning Chirping Birds',
    description: 'કુદરતી પક્ષીઓનો કલરવ અને પ્રકૃતિની તાજગી',
    icon: '🐦',
  },
  {
    id: 'loud_digital',
    nameGu: '🚨 લાઉડ ડિજિટલ બીપ (Loud Digital)',
    nameHi: '🚨 लाउड डिजिटल बीप',
    nameEn: '🚨 Loud Digital Alarm',
    description: 'ખૂબ જ મોટો અને અવાજવાળો ડિજિટલ એલાર્મ',
    icon: '🚨',
  },
  {
    id: 'temple_bell',
    nameGu: '🛕 મંદિર ઘંટારવ (Temple Bell Chime)',
    nameHi: '🛕 मंदिर का घंटा',
    nameEn: '🛕 Temple Bell & Chime',
    description: 'પવિત્ર મંદિરની ઘંટડી અને દીર્ઘ ગૂંજ',
    icon: '🛕',
  },
  {
    id: 'modern_smartphone',
    nameGu: '📱 સ્માર્ટફોન મેરિમ્બા (Modern Marimba)',
    nameHi: '📱 स्मार्टफोन मैरिम्बा',
    nameEn: '📱 Smartphone Marimba',
    description: 'આધુનિક મોબાઈલની રિધમિક મેરિમ્બા રીંગટોન',
    icon: '📱',
  },
  {
    id: 'custom',
    nameGu: '📁 મોબાઈલ કસ્ટમ રીંગટોન (My Mobile Audio)',
    nameHi: '📁 मोबाइल कस्टम रिंगटोन',
    nameEn: '📁 Custom Mobile Audio',
    description: 'તમારા ફોનની ફાઈલોમાંથી અપલોડ કરેલ ગીત / ટોન',
    icon: '📁',
  },
];

class SoundAlarmService {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    this.intervalId = null;
    this.previewTimeoutId = null;
    this.customAudio = null;
    this.volume = 1.0;
    this.vibrateEnabled = true;
    this.vibrateInterval = null;
  }

  init() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        this.audioCtx = new AudioCtxClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0.1, Math.min(1.0, vol));
    if (this.customAudio) {
      this.customAudio.volume = this.volume;
    }
  }

  setVibrate(enabled) {
    this.vibrateEnabled = Boolean(enabled);
  }

  // -------------------------------------------------------------
  // Web Audio Synthesizer Tones
  // -------------------------------------------------------------
  playTone(freq, duration = 0.2, type = 'sine', gainPeak = 0.3) {
    try {
      this.init();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      const now = this.audioCtx.currentTime;

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);

      const effectiveGain = gainPeak * this.volume;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(effectiveGain, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + duration + 0.05);
    } catch (e) {
      console.warn('Audio play error', e);
    }
  }

  // 1. Classic Alarm Bell (Rapid mechanical ringing)
  playClassicBell() {
    const burst = () => {
      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          if (!this.isPlaying) return;
          this.playTone(820 + (i % 2 === 0 ? 40 : -40), 0.08, 'triangle', 0.4);
        }, i * 65);
      }
    };
    burst();
    setTimeout(() => {
      if (this.isPlaying) burst();
    }, 600);
  }

  // 2. Morning Flute Melody (Pleasant pentatonic scale with vibrato)
  playFluteMelody() {
    const notes = [
      { f: 587.33, d: 0.35, t: 0 },    // D5
      { f: 659.25, d: 0.35, t: 320 },  // E5
      { f: 783.99, d: 0.45, t: 640 },  // G5
      { f: 880.00, d: 0.55, t: 1050 }, // A5
      { f: 1046.5, d: 0.70, t: 1550 }, // C6
      { f: 880.00, d: 0.40, t: 2200 }, // A5
    ];
    notes.forEach((n) => {
      setTimeout(() => {
        if (!this.isPlaying) return;
        this.playTone(n.f, n.d, 'sine', 0.45);
      }, n.t);
    });
  }

  // 3. Morning Chirping Birds (FM chirps with varying frequency)
  playMorningBirds() {
    try {
      this.init();
      if (!this.audioCtx) return;

      const chirp = (startTimeOffset, baseFreq) => {
        setTimeout(() => {
          if (!this.isPlaying || !this.audioCtx) return;
          const now = this.audioCtx.currentTime;
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(baseFreq, now);
          osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.6, now + 0.08);
          osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.1, now + 0.16);

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.35 * this.volume, now + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

          osc.connect(gain);
          gain.connect(this.audioCtx.destination);
          osc.start(now);
          osc.stop(now + 0.25);
        }, startTimeOffset);
      };

      chirp(0, 2200);
      chirp(140, 2500);
      chirp(280, 2800);
      chirp(700, 2400);
      chirp(860, 2900);
    } catch (e) {
      console.warn('Bird chirp error', e);
    }
  }

  // 4. Loud Digital Alarm (Piercing repeating square beeps)
  playLoudDigital() {
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        if (!this.isPlaying) return;
        this.playTone(2400, 0.09, 'square', 0.55);
      }, i * 140);
    }
  }

  // 5. Temple Bell & Chime (Deep harmonic brass chime)
  playTempleBell() {
    try {
      this.init();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;

      // Harmonics for a resonant temple bell
      const harmonics = [
        { f: 432, g: 0.45 },
        { f: 864, g: 0.25 },
        { f: 1296, g: 0.12 },
        { f: 2160, g: 0.05 },
      ];

      harmonics.forEach(({ f, g }) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(g * this.volume, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 2.3);
      });
    } catch (e) {
      console.warn('Temple bell error', e);
    }
  }

  // 6. Modern Smartphone Marimba (Android / iOS style rhythmic chime)
  playModernSmartphone() {
    const notes = [
      { f: 523.25, d: 0.2, t: 0 },    // C5
      { f: 659.25, d: 0.2, t: 150 },  // E5
      { f: 783.99, d: 0.2, t: 300 },  // G5
      { f: 987.77, d: 0.25, t: 450 }, // B5
      { f: 1046.5, d: 0.4, t: 600 },  // C6
    ];
    notes.forEach((n) => {
      setTimeout(() => {
        if (!this.isPlaying) return;
        this.playTone(n.f, n.d, 'triangle', 0.45);
      }, n.t);
    });
  }

  // -------------------------------------------------------------
  // Mobile Vibration Support
  // -------------------------------------------------------------
  startVibration() {
    if (!this.vibrateEnabled || typeof window === 'undefined' || !navigator.vibrate) return;
    try {
      navigator.vibrate([400, 200, 400, 200, 800]);
      this.vibrateInterval = setInterval(() => {
        if (this.isPlaying && navigator.vibrate) {
          navigator.vibrate([400, 200, 400, 200, 800]);
        } else {
          this.stopVibration();
        }
      }, 2500);
    } catch (e) {
      console.warn('Vibration error', e);
    }
  }

  stopVibration() {
    if (this.vibrateInterval) {
      clearInterval(this.vibrateInterval);
      this.vibrateInterval = null;
    }
    if (typeof window !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(0);
      } catch (e) {}
    }
  }

  // -------------------------------------------------------------
  // Master Ringtone Player
  // -------------------------------------------------------------
  playRingtone(ringtoneId = 'classic_bell', customAudioUrl = null, isLooping = true) {
    this.stopAlarm();
    this.isPlaying = true;
    this.init();

    // Start mobile vibration
    this.startVibration();

    // 1. If custom uploaded mobile audio is selected and available
    if ((ringtoneId === 'custom' || !ringtoneId) && customAudioUrl) {
      try {
        this.customAudio = new Audio(customAudioUrl);
        this.customAudio.loop = isLooping;
        this.customAudio.volume = this.volume;
        this.customAudio.play().catch((err) => {
          console.warn('HTML5 custom audio play failed, falling back to classic bell', err);
          this.playRingtone('classic_bell', null, isLooping);
        });
        return;
      } catch (e) {
        console.warn('Error loading custom audio, fallback to bell', e);
      }
    }

    // 2. Synthesized Built-in Ringtones
    const executeToneCycle = () => {
      if (!this.isPlaying) return;

      switch (ringtoneId) {
        case 'flute_melody':
          this.playFluteMelody();
          break;
        case 'morning_birds':
          this.playMorningBirds();
          break;
        case 'loud_digital':
          this.playLoudDigital();
          break;
        case 'temple_bell':
          this.playTempleBell();
          break;
        case 'modern_smartphone':
          this.playModernSmartphone();
          break;
        case 'medicine':
          this.playTone(659.25, 0.18, 'sine', 0.4);
          setTimeout(() => this.isPlaying && this.playTone(830.61, 0.18, 'sine', 0.4), 200);
          setTimeout(() => this.isPlaying && this.playTone(987.77, 0.35, 'triangle', 0.45), 400);
          break;
        case 'classic_bell':
        default:
          this.playClassicBell();
          break;
      }
    };

    executeToneCycle();

    if (isLooping) {
      // Loop interval tailored per tone type
      let intervalMs = 1800;
      if (ringtoneId === 'flute_melody') intervalMs = 3200;
      else if (ringtoneId === 'morning_birds') intervalMs = 2400;
      else if (ringtoneId === 'temple_bell') intervalMs = 2800;
      else if (ringtoneId === 'loud_digital') intervalMs = 1500;
      else if (ringtoneId === 'modern_smartphone') intervalMs = 1900;

      this.intervalId = setInterval(executeToneCycle, intervalMs);
    }
  }

  // Quick 6-second preview for user testing in settings or modals
  previewRingtone(ringtoneId, customAudioUrl, onStop) {
    this.stopAlarm();
    this.playRingtone(ringtoneId, customAudioUrl, false);

    const previewDuration = ringtoneId === 'flute_melody' ? 6500 : 5000;
    this.previewTimeoutId = setTimeout(() => {
      this.stopAlarm();
      if (onStop) onStop();
    }, previewDuration);
  }

  // Backwards compatibility for existing code calls
  startAlarm(toneType = 'medicine', customAudioUrl = null) {
    if (toneType === 'medicine') {
      this.playRingtone('medicine', customAudioUrl, true);
    } else if (toneType === 'meeting') {
      this.playRingtone('modern_smartphone', customAudioUrl, true);
    } else {
      this.playRingtone(toneType, customAudioUrl, true);
    }
  }

  stopAlarm() {
    this.isPlaying = false;
    this.stopVibration();

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.previewTimeoutId) {
      clearTimeout(this.previewTimeoutId);
      this.previewTimeoutId = null;
    }

    if (this.customAudio) {
      try {
        this.customAudio.pause();
        this.customAudio.currentTime = 0;
      } catch (e) {}
      this.customAudio = null;
    }
  }

  playChime() {
    this.playTone(587.33, 0.12, 'sine', 0.3);
    setTimeout(() => this.playTone(880, 0.25, 'sine', 0.3), 130);
  }
}

export const soundAlarm = new SoundAlarmService();
export const audioService = soundAlarm;
