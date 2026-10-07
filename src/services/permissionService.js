// Permission & Contact Access Helper Service
// Handles photo/media access, contact access, and security checks

export const permissionService = {
  /**
   * Check all permissions across Web and Android Native
   */
  async checkPermissions() {
    const result = {
      audio: false,
      notifications: false,
      steps: false,
      photos: false,
      contacts: false,
    };

    // 1. Android Native Bridge Check
    if (window.AndroidPermissionBridge && typeof window.AndroidPermissionBridge.getPermissionsStatusJson === 'function') {
      try {
        const json = window.AndroidPermissionBridge.getPermissionsStatusJson();
        const parsed = JSON.parse(json);
        return { ...result, ...parsed };
      } catch (err) {
        console.warn('Failed to parse AndroidPermissionBridge status:', err);
      }
    }

    // 2. Web fallback checks
    if ('Notification' in window) {
      result.notifications = Notification.permission === 'granted';
    }

    if (navigator.permissions && navigator.permissions.query) {
      try {
        const mic = await navigator.permissions.query({ name: 'microphone' });
        result.audio = mic.state === 'granted';
      } catch {}
    }

    // Modern browser photos/contacts detection
    result.photos = true; // Web file picker is always accessible via user interaction
    result.contacts = 'contacts' in navigator && 'ContactsManager' in window;

    return result;
  },

  /**
   * Request Photo / Media Permission
   */
  async requestPhotoPermission() {
    if (window.AndroidPermissionBridge && typeof window.AndroidPermissionBridge.requestPhotoPermission === 'function') {
      window.AndroidPermissionBridge.requestPhotoPermission();
      return true;
    }
    return true;
  },

  /**
   * Request Contacts Permission
   */
  async requestContactPermission() {
    if (window.AndroidPermissionBridge && typeof window.AndroidPermissionBridge.requestContactPermission === 'function') {
      window.AndroidPermissionBridge.requestContactPermission();
      return true;
    }
    return true;
  },

  /**
   * Request all permissions at once
   */
  async requestAllPermissions() {
    if (window.AndroidPermissionBridge && typeof window.AndroidPermissionBridge.requestAllPermissions === 'function') {
      window.AndroidPermissionBridge.requestAllPermissions();
      return true;
    }
    return true;
  },

  /**
   * Safe & Secure Native & Web Contact Picker
   * Never uploads contacts anywhere — strictly returns contact name and phone for local on-device use
   */
  async pickContact(context = 'khata') {
    // 1. Native Android Contact Picker Intent Bridge
    if (window.AndroidPermissionBridge && typeof window.AndroidPermissionBridge.pickContact === 'function') {
      return new Promise((resolve) => {
        let isResolved = false;

        const cleanup = () => {
          if (window.onNativeContactPicked === handleContact) {
            window.onNativeContactPicked = null;
          }
        };

        const handleContact = (name, mobile, ctx) => {
          if (isResolved) return;
          isResolved = true;
          cleanup();
          resolve({
            success: true,
            name: (name || '').trim(),
            mobile: (mobile || '').replace(/[^0-9+]/g, '').trim(),
            context: ctx,
          });
        };

        window.onNativeContactPicked = handleContact;

        try {
          window.AndroidPermissionBridge.pickContact(context);
        } catch (e) {
          console.warn('Native contact pick call failed:', e);
          cleanup();
          resolve({ success: false });
        }

        // Safety timeout of 60 seconds
        setTimeout(() => {
          if (!isResolved) {
            isResolved = true;
            cleanup();
            resolve({ success: false, timeout: true });
          }
        }, 60000);
      });
    }

    // 2. Modern Web Contacts API (Chrome on Android / PWA)
    if ('contacts' in navigator && 'ContactsManager' in window) {
      try {
        const props = ['name', 'tel'];
        const opts = { multiple: false };
        const contacts = await navigator.contacts.select(props, opts);
        if (contacts && contacts.length > 0) {
          const c = contacts[0];
          const name = Array.isArray(c.name) ? c.name[0] : c.name || '';
          const phone = Array.isArray(c.tel) ? c.tel[0] : c.tel || '';
          return {
            success: true,
            name: (name || '').trim(),
            mobile: (phone || '').replace(/[^0-9+]/g, '').trim(),
            context,
          };
        }
      } catch (err) {
        console.warn('Web contact pick cancelled or error:', err);
      }
    }

    return { success: false };
  },
};
