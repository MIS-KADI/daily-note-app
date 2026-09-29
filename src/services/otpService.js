// Universal Mobile & Email OTP Verification Service
import { notificationService } from './notificationService';
import { audioService } from './audioService';

const OTP_STORAGE_KEY = 'daily_diary_active_otp';

class OtpService {
  constructor() {
    this.activeOtps = new Map();
  }

  /**
   * Generate a random 6-digit numeric OTP
   */
  generateCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Send Mobile OTP
   * Triggers system notification, simulated SMS banner, and sound
   */
  async sendMobileOtp(mobileNumber, userName = 'યુઝર') {
    const code = this.generateCode();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

    const otpData = {
      type: 'mobile',
      target: mobileNumber,
      code,
      expiresAt,
      createdAt: Date.now(),
    };

    this.activeOtps.set(`mobile_${mobileNumber}`, otpData);
    try {
      localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(otpData));
    } catch {}

    // Audio chime for incoming SMS
    try {
      if (audioService?.playChime) {
        audioService.playChime();
      }
    } catch {}

    // Send high-priority system / local notification
    try {
      await notificationService.send('📲 દૈનિક ડાયરી: વેરિફિકેશન OTP', {
        body: `તમારો મોબાઈલ વેરિફિકેશન કોડ છે: ${code} (૫ મિનિટ માટે માન્ય)`,
      });
    } catch (e) {
      console.warn('Could not send native notification for OTP:', e);
    }

    return {
      success: true,
      otp: code,
      target: mobileNumber,
      expiresAt,
      message: `મોબાઈલ નંબર ${mobileNumber} પર OTP સફળતાપૂર્વક મોકલવામાં આવ્યો છે.`,
    };
  }

  /**
   * Send Email OTP
   * Triggers system notification, email banner, and sound
   */
  async sendEmailOtp(emailAddress, userName = 'યુઝર') {
    const code = this.generateCode();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

    const otpData = {
      type: 'email',
      target: emailAddress,
      code,
      expiresAt,
      createdAt: Date.now(),
    };

    this.activeOtps.set(`email_${emailAddress}`, otpData);
    try {
      localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(otpData));
    } catch {}

    // Audio chime
    try {
      if (audioService?.playChime) {
        audioService.playChime();
      }
    } catch {}

    // Send high-priority system / local notification
    try {
      await notificationService.send('📧 દૈનિક ડાયરી: ઈમેલ વેરિફિકેશન OTP', {
        body: `તમારો ઈમેલ વેરિફિકેશન કોડ છે: ${code} (૫ મિનિટ માટે માન્ય)`,
      });
    } catch (e) {
      console.warn('Could not send native notification for email OTP:', e);
    }

    return {
      success: true,
      otp: code,
      target: emailAddress,
      expiresAt,
      message: `ઈમેલ ID ${emailAddress} પર વેરિફિકેશન OTP મોકલાયો છે.`,
    };
  }

  /**
   * Send App Unlock Recovery OTP
   */
  async sendUnlockOtp(user) {
    const code = this.generateCode();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    const target = user?.mobile || user?.email || 'Registered User';
    const otpData = {
      type: 'unlock',
      target,
      code,
      expiresAt,
      createdAt: Date.now(),
    };

    this.activeOtps.set('app_unlock', otpData);
    try {
      localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(otpData));
    } catch {}

    try {
      if (audioService?.playChime) {
        audioService.playChime();
      }
    } catch {}

    try {
      await notificationService.send('🔐 દૈનિક ડાયરી: અનલૉક OTP', {
        body: `એપ અનલૉક કરવા માટેનો સુરક્ષા OTP કોડ: ${code}`,
      });
    } catch (e) {
      console.warn('Notification error:', e);
    }

    return {
      success: true,
      otp: code,
      target,
      expiresAt,
    };
  }

  /**
   * Verify an entered OTP
   */
  verifyOtp(targetOrType, enteredCode) {
    if (!enteredCode || enteredCode.trim().length !== 6) {
      return { success: false, error: 'કૃપા કરીને પૂરો ૬ અંકનો OTP દાખલ કરો.' };
    }

    const cleanCode = enteredCode.trim();

    // Check in memory first
    let record =
      this.activeOtps.get(`mobile_${targetOrType}`) ||
      this.activeOtps.get(`email_${targetOrType}`) ||
      this.activeOtps.get(targetOrType) ||
      this.activeOtps.get('app_unlock');

    // Fallback to localStorage
    if (!record) {
      try {
        const stored = localStorage.getItem(OTP_STORAGE_KEY);
        if (stored) {
          record = JSON.parse(stored);
        }
      } catch {}
    }

    if (!record || !record.code) {
      // If code matches a fresh test code or stored code
      return { success: false, error: 'OTP એક્સપાયર થઈ ગયો છે. ફરીથી OTP મોકલો.' };
    }

    if (Date.now() > record.expiresAt) {
      return { success: false, error: 'OTP ની સમયમર્યાદા (૫ મિનિટ) પૂરી થઈ ગઈ છે.' };
    }

    if (record.code === cleanCode) {
      // Verified successfully
      this.activeOtps.delete(`mobile_${targetOrType}`);
      this.activeOtps.delete(`email_${targetOrType}`);
      this.activeOtps.delete('app_unlock');
      try {
        localStorage.removeItem(OTP_STORAGE_KEY);
      } catch {}

      return { success: true };
    }

    return { success: false, error: 'દાખલ કરેલ OTP ખોટો છે. કૃપા કરીને ફરી ચકાસો.' };
  }

  /**
   * Helper to format WhatsApp share link for OTP
   */
  getWhatsAppOtpLink(mobileNumber, code) {
    const cleanMobile = (mobileNumber || '').replace(/[^0-9]/g, '');
    const msg = encodeURIComponent(
      `🔐 *દૈનિક ડાયરી & સ્માર્ટ આસિસ્ટન્ટ*\n\nતમારો સિક્યોરિટી વેરિફિકેશન OTP કોડ છે:\n👉 *${code}*\n\n(આ કોડ ૫ મિનિટ માટે માન્ય છે. કોઈ સાથે શેર કરવો નહીં.)`
    );
    if (cleanMobile.length >= 10) {
      return `https://wa.me/${cleanMobile}?text=${msg}`;
    }
    return `https://wa.me/?text=${msg}`;
  }
}

export const otpService = new OtpService();
