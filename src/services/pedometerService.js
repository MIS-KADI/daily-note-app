/**
 * Universal Pedometer & Hardware Step Tracker Service
 * Supports:
 * 1. Native Android Hardware Step Counter (Sensor.TYPE_STEP_COUNTER & TYPE_STEP_DETECTOR)
 *    - Tracks steps even when app is closed, phone is locked, or screen is off!
 * 2. Mobile Web & PWA Accelerometer Stride Sensor (DeviceMotionEvent fallback)
 */
import { storageService } from './storageService';

class PedometerService {
  constructor() {
    this.isTracking = false;
    this.listeners = new Set();
    this.exactStepsListeners = new Set();
    this.statusListeners = new Set();

    // Gravity Low-Pass Filter state
    this.gravity = { x: 0, y: 0, z: 9.8 };
    this.alpha = 0.85;

    // Linear Acceleration & Peak Detection
    this.smoothedMagnitude = 0;
    this.beta = 0.35;
    this.stepThreshold = 1.35;
    this.isPeakRising = false;
    this.currentPeak = 0;

    // Cadence timing: Human walking cadence is 1.2 to 2.8 steps/sec
    this.lastStepTimestamp = 0;
    this.minStepIntervalMs = 260;

    // Screen Wake Lock
    this.wakeLock = null;

    // Bound handlers
    this.motionHandler = this.handleMotion.bind(this);
    this.visibilityHandler = this.handleVisibilityChange.bind(this);

    if (typeof window !== 'undefined') {
      // Connect Native Android Hardware Step Callbacks
      window.onNativeStepCountUpdate = (steps) => {
        const numSteps = Number(steps);
        if (!isNaN(numSteps)) {
          this.notifyExactSteps(numSteps);
        }
      };

      window.onNativeStepDetected = (count) => {
        this.notifyStep(Number(count) || 1);
      };

      // Auto-sync hardware steps on launch if bridge is available
      setTimeout(() => {
        this.syncHardwareSteps();
      }, 500);
    }

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.visibilityHandler);
    }
  }

  isSupported() {
    if (typeof window === 'undefined') return false;
    if (window.AndroidStepBridge && window.AndroidStepBridge.isHardwareStepSupported()) {
      return true;
    }
    return 'DeviceMotionEvent' in window || 'LinearAccelerationSensor' in window;
  }

  isAutoTrackingEnabled() {
    return storageService.getPedometerAutoEnabled();
  }

  setAutoTrackingEnabled(enabled) {
    storageService.setPedometerAutoEnabled(enabled);
    if (!enabled && this.isTracking) {
      this.stopTracking();
    } else if (enabled && !this.isTracking) {
      this.startTracking();
    }
  }

  syncHardwareSteps() {
    if (typeof window !== 'undefined' && window.AndroidStepBridge) {
      try {
        if (typeof window.AndroidStepBridge.syncSteps === 'function') {
          window.AndroidStepBridge.syncSteps();
        }
        const today = window.AndroidStepBridge.getTodaySteps?.();
        if (typeof today === 'number' && today > 0) {
          this.notifyExactSteps(today);
        }
      } catch (e) {
        console.warn('Native step sync error:', e);
      }
    }
  }

  async requestPermission() {
    if (typeof window !== 'undefined' && window.AndroidStepBridge) {
      try {
        window.AndroidStepBridge.requestPermission?.();
        return true;
      } catch (e) {
        console.warn('Native step permission error:', e);
      }
    }

    if (
      typeof DeviceMotionEvent !== 'undefined' &&
      typeof DeviceMotionEvent.requestPermission === 'function'
    ) {
      try {
        const permission = await DeviceMotionEvent.requestPermission();
        return permission === 'granted';
      } catch (err) {
        console.warn('DeviceMotionEvent permission error:', err);
        return false;
      }
    }

    return this.isSupported();
  }

  async requestWakeLock() {
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator && !this.wakeLock) {
      try {
        this.wakeLock = await navigator.wakeLock.request('screen');
        this.wakeLock.addEventListener('release', () => {
          this.wakeLock = null;
        });
      } catch (e) {
        console.debug('WakeLock notice:', e);
      }
    }
  }

  releaseWakeLock() {
    if (this.wakeLock) {
      this.wakeLock.release().catch(() => {});
      this.wakeLock = null;
    }
  }

  handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
      // Whenever app becomes visible / is resumed, sync hardware steps!
      this.syncHardwareSteps();
      if (this.isTracking) {
        this.requestWakeLock();
      }
    }
  }

  addListener(callback) {
    if (typeof callback === 'function') {
      this.listeners.add(callback);
    }
    return () => {
      this.listeners.delete(callback);
    };
  }

  addExactStepsListener(callback) {
    if (typeof callback === 'function') {
      this.exactStepsListeners.add(callback);
    }
    return () => {
      this.exactStepsListeners.delete(callback);
    };
  }

  addStatusListener(callback) {
    if (typeof callback === 'function') {
      this.statusListeners.add(callback);
      callback(this.isTracking);
    }
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  notifyStep(stepCount = 1) {
    for (const cb of this.listeners) {
      try {
        cb(stepCount);
      } catch (err) {
        console.error('Error in step listener:', err);
      }
    }
  }

  notifyExactSteps(totalSteps) {
    for (const cb of this.exactStepsListeners) {
      try {
        cb(totalSteps);
      } catch (err) {
        console.error('Error in exact steps listener:', err);
      }
    }
  }

  notifyStatus(isActive) {
    for (const cb of this.statusListeners) {
      try {
        cb(isActive);
      } catch (err) {
        console.error('Error in status listener:', err);
      }
    }
  }

  async startTracking(optionalCallback) {
    if (optionalCallback) {
      this.addListener(optionalCallback);
    }

    if (this.isTracking) {
      this.syncHardwareSteps();
      this.notifyStatus(true);
      return true;
    }

    const granted = await this.requestPermission();
    if (!granted) {
      return false;
    }

    this.isTracking = true;
    this.isPeakRising = false;
    this.currentPeak = 0;
    this.smoothedMagnitude = 0;
    this.lastStepTimestamp = Date.now();

    // Sync hardware steps immediately
    this.syncHardwareSteps();

    // Also attach devicemotion listener for Web / accelerometer fallback
    if (typeof window !== 'undefined' && 'addEventListener' in window) {
      window.addEventListener('devicemotion', this.motionHandler, { passive: true });
    }
    this.requestWakeLock();
    this.notifyStatus(true);
    return true;
  }

  stopTracking() {
    if (!this.isTracking) return;
    this.isTracking = false;
    if (typeof window !== 'undefined' && 'removeEventListener' in window) {
      window.removeEventListener('devicemotion', this.motionHandler);
    }
    this.releaseWakeLock();
    this.notifyStatus(false);
  }

  handleMotion(event) {
    if (!this.isTracking) return;

    let magnitude = 0;
    const pureAcc = event.acceleration;

    if (
      pureAcc &&
      pureAcc.x !== null &&
      pureAcc.y !== null &&
      pureAcc.z !== null &&
      (Math.abs(pureAcc.x) > 0.001 || Math.abs(pureAcc.y) > 0.001 || Math.abs(pureAcc.z) > 0.001)
    ) {
      magnitude = Math.sqrt(
        pureAcc.x * pureAcc.x + pureAcc.y * pureAcc.y + pureAcc.z * pureAcc.z
      );
    } else {
      const raw = event.accelerationIncludingGravity;
      if (!raw || raw.x === null || raw.y === null || raw.z === null) return;

      this.gravity.x = this.alpha * this.gravity.x + (1 - this.alpha) * raw.x;
      this.gravity.y = this.alpha * this.gravity.y + (1 - this.alpha) * raw.y;
      this.gravity.z = this.alpha * this.gravity.z + (1 - this.alpha) * raw.z;

      const lx = raw.x - this.gravity.x;
      const ly = raw.y - this.gravity.y;
      const lz = raw.z - this.gravity.z;

      magnitude = Math.sqrt(lx * lx + ly * ly + lz * lz);
    }

    this.smoothedMagnitude =
      this.beta * magnitude + (1 - this.beta) * this.smoothedMagnitude;

    const now = Date.now();

    if (this.smoothedMagnitude > this.stepThreshold) {
      if (!this.isPeakRising) {
        this.isPeakRising = true;
        this.currentPeak = this.smoothedMagnitude;
      } else if (this.smoothedMagnitude > this.currentPeak) {
        this.currentPeak = this.smoothedMagnitude;
      }
    } else if (this.isPeakRising && this.smoothedMagnitude < this.stepThreshold * 0.85) {
      this.isPeakRising = false;
      const elapsed = now - this.lastStepTimestamp;

      if (elapsed >= this.minStepIntervalMs) {
        this.lastStepTimestamp = now;
        this.notifyStep(1);

        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate(10);
          } catch (_) {}
        }
      }
    }
  }

  simulateStep(count = 1) {
    this.notifyStep(count);
  }
}

export const pedometerService = new PedometerService();
