// Universal Notification Service: Native Android (Capacitor) & Browser (PWA)
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

class NotificationService {
  constructor() {
    this.permission = 'default';
    this.isNative = Capacitor.isNativePlatform();
    if (this.isNative) {
      this.initNativeChannel();
    } else if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  async initNativeChannel() {
    try {
      await LocalNotifications.createChannel({
        id: 'daily_diary_alerts',
        name: 'Daily Diary Reminders & Alarms',
        description: 'Important alarms for medicines, meetings, and daily diary',
        importance: 5, // High priority heads-up notification with sound
        visibility: 1,
        sound: 'beep.wav',
        vibration: true,
      });
    } catch (e) {
      console.warn('Could not create notification channel:', e);
    }
  }

  async requestPermission() {
    if (Capacitor.isNativePlatform()) {
      try {
        const res = await LocalNotifications.requestPermissions();
        this.permission = res.display === 'granted' ? 'granted' : 'denied';
        return res.display === 'granted';
      } catch (e) {
        console.warn('Native permission error:', e);
        return false;
      }
    }

    if (!('Notification' in window)) {
      console.warn('Notifications not supported in this browser/environment');
      return false;
    }

    try {
      const perm = await Notification.requestPermission();
      this.permission = perm;
      return perm === 'granted';
    } catch (e) {
      console.error('Error requesting notification permission', e);
      return false;
    }
  }

  hasPermission() {
    if (Capacitor.isNativePlatform()) {
      return true;
    }
    return 'Notification' in window && Notification.permission === 'granted';
  }

  playNotificationSound() {
    try {
      if (typeof window !== 'undefined') {
        const audio = new Audio('/beep.wav');
        audio.volume = 0.9;
        audio.play().catch(() => {});
      }
    } catch (_) {}
  }

  async send(title, options = {}) {
    // Play sound immediately on device
    this.playNotificationSound();

    if (Capacitor.isNativePlatform()) {
      try {
        const randomId = Math.floor(Math.random() * 1000000);
        await LocalNotifications.schedule({
          notifications: [
            {
              title,
              body: options.body || '',
              id: randomId,
              channelId: 'daily_diary_alerts',
              sound: 'beep.wav',
              schedule: {
                at: new Date(Date.now() + 150),
                allowWhileIdle: true,
              },
            },
          ],
        });
        return true;
      } catch (e) {
        console.warn('Native local notification send failed:', e);
      }
    }

    if (!this.hasPermission()) {
      return null;
    }

    try {
      const notification = new Notification(title, {
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">⏰</text></svg>',
        badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🔔</text></svg>',
        vibrate: [250, 120, 250, 120, 250],
        silent: false,
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    } catch (e) {
      console.warn('Could not display system notification:', e);
      return null;
    }
  }

  // Schedule native background alarm with exact Android AlarmManager
  async scheduleNativeAlarm({ id, title, body, dateStr, timeStr }) {
    if (!Capacitor.isNativePlatform()) return;
    try {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const targetDate = new Date(dateStr);
      targetDate.setHours(hours, minutes, 0, 0);

      // If time has already passed today, don't schedule
      if (targetDate.getTime() <= Date.now()) return;

      const numId = typeof id === 'number' ? id : hashCode(String(id));

      await LocalNotifications.schedule({
        notifications: [
          {
            id: numId,
            title,
            body: body || '',
            channelId: 'daily_diary_alerts',
            sound: 'beep.wav',
            schedule: {
              at: targetDate,
              allowWhileIdle: true, // Rings even when app is killed or phone in Doze mode
            },
          },
        ],
      });
      console.log(`Native alarm scheduled for ${targetDate.toISOString()}`);
    } catch (e) {
      console.warn('Error scheduling native alarm:', e);
    }
  }
}

export const notificationService = new NotificationService();
