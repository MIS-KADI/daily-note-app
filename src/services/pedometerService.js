/**
 * Web Pedometer / Live Motion Sensor Step Tracker
 * Uses the Web DeviceMotionEvent / Accelerometer API on Android Chrome & iOS Safari
 * Detects real-time walking strides and increments step counter directly from the phone.
 */

class PedometerService {
  constructor() {
    this.isTracking = false;
    this.stepCallback = null;
    this.lastAcceleration = 0;
    this.lastStepTimestamp = 0;
    this.stepThreshold = 11.4; // Acceleration peak threshold (m/s^2)
    this.minStepIntervalMs = 280; // Minimum time between strides (prevents jitter/double counts)
    this.maxStepIntervalMs = 2500; // Maximum time between steps
    this.motionHandler = this.handleMotion.bind(this);
  }

  isSupported() {
    return typeof window !== 'undefined' && 'DeviceMotionEvent' in window;
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
    // Android and standard browsers don't require explicit prompt if already supported
    return this.isSupported();
  }

  async startTracking(onStep) {
    if (this.isTracking) return true;

    const granted = await this.requestPermission();
    if (!granted) {
      return false;
    }

    this.stepCallback = onStep;
    this.isTracking = true;
    window.addEventListener('devicemotion', this.motionHandler, { passive: true });
    return true;
  }

  stopTracking() {
    if (!this.isTracking) return;
    this.isTracking = false;
    window.removeEventListener('devicemotion', this.motionHandler);
    this.stepCallback = null;
  }

  handleMotion(event) {
    if (!this.isTracking) return;

    const acc = event.accelerationIncludingGravity || event.acceleration;
    if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

    // Calculate 3D magnitude of acceleration
    const magnitude = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
    const now = Date.now();

    // Check if peak is above threshold and adequate time has passed since last step
    if (magnitude > this.stepThreshold && this.lastAcceleration <= this.stepThreshold) {
      const elapsed = now - this.lastStepTimestamp;
      if (elapsed > this.minStepIntervalMs && elapsed < this.maxStepIntervalMs) {
        this.lastStepTimestamp = now;
        if (typeof this.stepCallback === 'function') {
          this.stepCallback(1);
        }
      } else if (this.lastStepTimestamp === 0) {
        this.lastStepTimestamp = now;
      }
    }

    this.lastAcceleration = magnitude;
  }
}

export const pedometerService = new PedometerService();
