/**
 * Web Pedometer / Live Motion Sensor Step Tracker Service
 * Multi-device, high-precision accelerometer stride detector
 * Works seamlessly on Android Chrome, iOS Safari & PWA
 */
import { storageService } from './storageService';

class PedometerService {
  constructor() {
    this.isTracking = false;
    this.listeners = new Set();
    this.statusListeners = new Set();

    // Gravity Low-Pass Filter state
    this.gravity = { x: 0, y: 0, z: 9.8 };
    this.alpha = 0.85; // Low-pass filter factor for gravity isolation

    // Linear Acceleration & Peak Detection
    this.smoothedMagnitude = 0;
    this.beta = 0.35; // Smoothing factor for noise cancellation
    this.stepThreshold = 1.35; // Linear acceleration magnitude threshold (m/s^2)
    this.isPeakRising = false;
    this.currentPeak = 0;

    // Cadence timing: Human walking cadence is 1.2 to 2.8 steps/sec (350ms - 800ms)
    this.lastStepTimestamp = 0;
    this.minStepIntervalMs = 260; // Max ~230 steps/min sprint cadence

    // Wake Lock instance to prevent mobile screen sleep while walking
    this.wakeLock = null;

    // Bound handlers
    this.motionHandler = this.handleMotion.bind(this);
    this.visibilityHandler = this.handleVisibilityChange.bind(this);

    // Bind page visibility listener once
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.visibilityHandler);
    }
  }

  isSupported() {
    return (
      typeof window !== 'undefined' &&
      ('DeviceMotionEvent' in window || 'LinearAccelerationSensor' in window)
    );
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

  async requestPermission() {
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
    // Android Chrome and standard browsers grant sensor access directly on secure origins
    return this.isSupported();
  }

  /**
   * Acquire Screen Wake Lock so phone doesn't sleep while walking
   */
  async requestWakeLock() {
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator && !this.wakeLock) {
      try {
        this.wakeLock = await navigator.wakeLock.request('screen');
        this.wakeLock.addEventListener('release', () => {
          this.wakeLock = null;
        });
      } catch (e) {
        // WakeLock request might fail if tab is not active or battery saver is on
        console.debug('WakeLock request notice:', e);
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
    if (document.visibilityState === 'visible' && this.isTracking) {
      this.requestWakeLock();
    }
  }

  /**
   * Register a step callback. Returns unsubscribe function.
   */
  addListener(callback) {
    if (typeof callback === 'function') {
      this.listeners.add(callback);
    }
    return () => {
      this.listeners.delete(callback);
    };
  }

  removeListener(callback) {
    this.listeners.delete(callback);
  }

  /**
   * Register a tracking status change listener (active: boolean).
   */
  addStatusListener(callback) {
    if (typeof callback === 'function') {
      this.statusListeners.add(callback);
      // Immediately notify current status
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
        console.error('Error in pedometer step listener:', err);
      }
    }
  }

  notifyStatus(isActive) {
    for (const cb of this.statusListeners) {
      try {
        cb(isActive);
      } catch (err) {
        console.error('Error in pedometer status listener:', err);
      }
    }
  }

  /**
   * Start tracking motion & steps
   */
  async startTracking(optionalCallback) {
    if (optionalCallback) {
      this.addListener(optionalCallback);
    }

    if (this.isTracking) {
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

    window.addEventListener('devicemotion', this.motionHandler, { passive: true });
    this.requestWakeLock();
    this.notifyStatus(true);
    return true;
  }

  /**
   * Stop tracking motion
   */
  stopTracking() {
    if (!this.isTracking) return;
    this.isTracking = false;
    window.removeEventListener('devicemotion', this.motionHandler);
    this.releaseWakeLock();
    this.notifyStatus(false);
  }

  /**
   * Core Motion & Step Detection Engine
   */
  handleMotion(event) {
    if (!this.isTracking) return;

    let magnitude = 0;
    const pureAcc = event.acceleration;

    // Check if device provides pure linear acceleration (without gravity)
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
      // Isolate gravity from raw acceleration with low-pass filter
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

    // Apply noise smoothing filter
    this.smoothedMagnitude =
      this.beta * magnitude + (1 - this.beta) * this.smoothedMagnitude;

    const now = Date.now();

    // Peak-valley stride detection algorithm
    if (this.smoothedMagnitude > this.stepThreshold) {
      if (!this.isPeakRising) {
        this.isPeakRising = true;
        this.currentPeak = this.smoothedMagnitude;
      } else if (this.smoothedMagnitude > this.currentPeak) {
        this.currentPeak = this.smoothedMagnitude;
      }
    } else if (this.isPeakRising && this.smoothedMagnitude < this.stepThreshold * 0.85) {
      // Wave has completed its crest and dipped below threshold
      this.isPeakRising = false;
      const elapsed = now - this.lastStepTimestamp;

      // Verify cadence timing (must not be jitter faster than human sprint)
      if (elapsed >= this.minStepIntervalMs) {
        this.lastStepTimestamp = now;
        this.notifyStep(1);

        // Subtle haptic feedback if supported
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate(10);
          } catch (_) {}
        }
      }
    }
  }

  /**
   * Helper to manually simulate or test step increments
   */
  simulateStep(count = 1) {
    this.notifyStep(count);
  }
}

export const pedometerService = new PedometerService();
