// Browser & Mobile Push Notification Service
class NotificationService {
  constructor() {
    this.permission = 'default';
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  async requestPermission() {
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
    return 'Notification' in window && Notification.permission === 'granted';
  }

  send(title, options = {}) {
    if (!this.hasPermission()) {
      return null;
    }

    try {
      const notification = new Notification(title, {
        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">⏰</text></svg>',
        badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🔔</text></svg>',
        vibrate: [200, 100, 200, 100, 200],
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
}

export const notificationService = new NotificationService();
