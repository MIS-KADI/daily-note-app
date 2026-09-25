// Web Audio API Synthesizer for high-fidelity offline alarm ringtones
class SoundAlarmService {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    this.intervalId = null;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  // Play a single pleasant beep/chime tone
  playBeep(freq = 880, duration = 0.15, type = 'sine') {
    try {
      this.init();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      console.warn("Audio play error", e);
    }
  }

  // Continuous alarm sound pattern for reminders / medicines
  startAlarm(toneType = 'medicine') {
    this.stopAlarm();
    this.init();
    this.isPlaying = true;

    const playSequence = () => {
      if (!this.isPlaying) return;

      if (toneType === 'medicine') {
        // Two-tone medical alert (E5 -> G#5 -> B5)
        this.playBeep(659.25, 0.18, 'sine');
        setTimeout(() => this.playBeep(830.61, 0.18, 'sine'), 200);
        setTimeout(() => this.playBeep(987.77, 0.35, 'triangle'), 400);
      } else if (toneType === 'meeting') {
        // Business meeting triple chime
        this.playBeep(523.25, 0.15, 'triangle');
        setTimeout(() => this.playBeep(659.25, 0.15, 'triangle'), 160);
        setTimeout(() => this.playBeep(783.99, 0.25, 'sine'), 320);
      } else {
        // Classic wake-up / task alarm
        this.playBeep(880, 0.12, 'square');
        setTimeout(() => this.playBeep(880, 0.12, 'square'), 150);
        setTimeout(() => this.playBeep(880, 0.12, 'square'), 300);
      }
    };

    playSequence();
    this.intervalId = setInterval(playSequence, 1500);
  }

  stopAlarm() {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export const soundAlarm = new SoundAlarmService();
