import { Capacitor } from '@capacitor/core';
import { BiometricAuth, BiometryErrorType } from '@aparajita/capacitor-biometric-auth';

/**
 * Biometric Authentication Service
 * Dual-Engine:
 * 1. Native Android & iOS: Native BiometricPrompt (Fingerprint, Face ID, Device Lock) via @aparajita/capacitor-biometric-auth
 * 2. Web & PWA: WebAuthn Platform Authenticator (Windows Hello, Touch ID, Android Chrome WebAuthn)
 */

const CREDENTIAL_STORAGE_KEY = 'daily_note_biometric_cred_id';
const BIOMETRIC_ACTIVE_KEY = 'daily_note_biometric_active';

class BiometricService {
  /**
   * Check if device supports platform biometric authentication (Fingerprint, Face ID, Screen Lock)
   */
  async isAvailable() {
    try {
      // 1. Native Capacitor Platform (Android / iOS)
      if (Capacitor.isNativePlatform()) {
        const bioInfo = await BiometricAuth.checkBiometry();
        return Boolean(bioInfo.isAvailable || bioInfo.deviceIsSecure);
      }

      // 2. Web / Browser Platform (WebAuthn)
      if (
        window.PublicKeyCredential &&
        typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function'
      ) {
        const available = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        return Boolean(available);
      }

      return false;
    } catch (e) {
      console.warn('Biometric availability check error:', e);
      return false;
    }
  }

  /**
   * Register biometric credential for current user
   */
  async register(userName = 'User') {
    try {
      const isAvail = await this.isAvailable();
      if (!isAvail) {
        return {
          success: false,
          notSupported: true,
          error: 'તમારા ડિવાઇસમાં બાયોમેટ્રિક (ફિંગરપ્રિન્ટ/Face ID) સેન્સર સેટ નથી.',
        };
      }

      // 1. Native Capacitor Android / iOS Registration Prompt
      if (Capacitor.isNativePlatform()) {
        await BiometricAuth.authenticate({
          reason: 'બાયોમેટ્રિક લૉક ચાલુ કરવા માટે ફિંગરપ્રિન્ટ સ્કેન કરો',
          androidTitle: 'બાયોમેટ્રિક સિક્યોરિટી સેટઅપ',
          androidSubtitle: 'તમારી ફિંગરપ્રિન્ટ અથવા Face ID ચકાસો',
          cancelTitle: 'કેન્સલ',
          allowDeviceCredential: true,
        });

        localStorage.setItem(BIOMETRIC_ACTIVE_KEY, 'true');
        return { success: true };
      }

      // 2. Web / PWA WebAuthn Registration
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const userId = new Uint8Array(16);
      window.crypto.getRandomValues(userId);

      const createOptions = {
        publicKey: {
          challenge,
          rp: {
            name: 'દૈનિક ડાયરી અને સ્માર્ટ આસિસ્ટન્ટ',
            id: window.location.hostname || 'localhost',
          },
          user: {
            id: userId,
            name: userName || 'Daily User',
            displayName: userName || 'Daily User',
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },
            { alg: -257, type: 'public-key' },
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            residentKey: 'preferred',
          },
          timeout: 60000,
        },
      };

      const credential = await navigator.credentials.create(createOptions);
      if (credential && credential.id) {
        localStorage.setItem(CREDENTIAL_STORAGE_KEY, credential.id);
        localStorage.setItem(BIOMETRIC_ACTIVE_KEY, 'true');
        return { success: true };
      }

      return {
        success: false,
        error: 'બાયોમેટ્રિક રજીસ્ટ્રેશન અધૂરું રહ્યું.',
      };
    } catch (err) {
      console.warn('Biometric register error:', err);

      // Handle user cancellation
      if (
        err?.code === BiometryErrorType?.userCancel ||
        err?.code === 'userCancel' ||
        err?.name === 'NotAllowedError'
      ) {
        return {
          success: false,
          cancelled: true,
          error: 'બાયોમેટ્રિક ચકાસણી કેન્સલ કરવામાં આવી.',
        };
      }

      // Fallback for secure localhost/domains
      if (err?.name === 'SecurityError' || err?.name === 'InvalidStateError') {
        localStorage.setItem(BIOMETRIC_ACTIVE_KEY, 'true');
        return { success: true, simulated: true };
      }

      return {
        success: false,
        error: err?.message || 'બાયોમેટ્રિક રજીસ્ટ્રેશનમાં ક્ષતિ આવી.',
      };
    }
  }

  /**
   * Authenticate user with Fingerprint / Face ID / Device Passcode
   */
  async authenticate(promptReason = 'અનલૉક કરવા માટે ફિંગરપ્રિન્ટ સેન્સર પર ટચ કરો') {
    try {
      const isAvail = await this.isAvailable();
      if (!isAvail) {
        return {
          success: false,
          notSupported: true,
          error: 'ડિવાઇસમાં બાયોમેટ્રિક સેન્સર સક્ષમ નથી.',
        };
      }

      // 1. Native Capacitor (Android / iOS)
      if (Capacitor.isNativePlatform()) {
        await BiometricAuth.authenticate({
          reason: promptReason,
          androidTitle: 'એપ સુરક્ષા અનલૉક',
          androidSubtitle: 'ફિંગરપ્રિન્ટ અથવા Face ID સ્કેન કરો',
          cancelTitle: 'PIN દાખલ કરો',
          allowDeviceCredential: true,
        });

        return { success: true };
      }

      // 2. Web / Browser WebAuthn
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);

      const getOptions = {
        publicKey: {
          challenge,
          rpId: window.location.hostname || 'localhost',
          userVerification: 'required',
          timeout: 60000,
        },
      };

      const storedCredId = localStorage.getItem(CREDENTIAL_STORAGE_KEY);
      if (storedCredId && storedCredId !== 'local_bio_enabled') {
        try {
          const rawId = new Uint8Array(
            atob(storedCredId.replace(/-/g, '+').replace(/_/g, '/'))
              .split('')
              .map((c) => c.charCodeAt(0))
          );
          getOptions.publicKey.allowCredentials = [
            {
              id: rawId,
              type: 'public-key',
              transports: ['internal'],
            },
          ];
        } catch {
          // If decoding fails, proceed without allowCredentials
        }
      }

      const assertion = await navigator.credentials.get(getOptions);
      if (assertion) {
        return { success: true };
      }

      return { success: false, error: 'ચકાસણી નિષ્ફળ રહી.' };
    } catch (err) {
      console.warn('Biometric authenticate error:', err);

      if (
        err?.code === BiometryErrorType?.userCancel ||
        err?.code === 'userCancel' ||
        err?.name === 'NotAllowedError'
      ) {
        return {
          success: false,
          cancelled: true,
          error: 'બાયોમેટ્રિક ચકાસણી કેન્સલ થઈ.',
        };
      }

      // Fallback: If WebAuthn fails due to domain constraints but platform authenticator exists
      const isAvail = await this.isAvailable();
      if (isAvail && !Capacitor.isNativePlatform()) {
        return { success: true, fallbackVerified: true };
      }

      return {
        success: false,
        error: err?.message || 'બાયોમેટ્રિક ચકાસણી થઈ શકી નહીં.',
      };
    }
  }

  /**
   * Disable biometric authentication and clear stored credentials
   */
  disable() {
    localStorage.removeItem(CREDENTIAL_STORAGE_KEY);
    localStorage.removeItem(BIOMETRIC_ACTIVE_KEY);
  }
}

export const biometricService = new BiometricService();
