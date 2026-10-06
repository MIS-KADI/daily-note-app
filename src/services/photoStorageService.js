// IndexedDB Persistent Photo Storage Service
// Safely stores and manages high-quality compressed photographs locally on the device

const DB_NAME = 'DailyDiaryPhotoDB';
const DB_VERSION = 1;
const STORE_NAME = 'photos';
const FALLBACK_KEY = 'daily_diary_photos_fallback';

let dbInstance = null;

function isIndexedDBSupported() {
  try {
    return typeof window !== 'undefined' && 'indexedDB' in window && window.indexedDB !== null;
  } catch {
    return false;
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    if (!isIndexedDBSupported()) {
      return reject(new Error('IndexedDB not supported'));
    }

    if (dbInstance) {
      return resolve(dbInstance);
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('isFavorite', 'isFavorite', { unique: false });
        store.createIndex('category', 'category', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('date', 'date', { unique: false });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = event.target.result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.warn('IndexedDB open error:', event.target.error);
      reject(event.target.error);
    };
  });
}

// Fallback helpers using localStorage
function getFallbackPhotos() {
  try {
    const raw = localStorage.getItem(FALLBACK_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error reading fallback photos:', err);
    return [];
  }
}

function saveFallbackPhotos(photos) {
  try {
    localStorage.setItem(FALLBACK_KEY, JSON.stringify(photos));
  } catch (err) {
    console.warn('Fallback storage quota exceeded:', err);
  }
}

export const photoStorageService = {
  /**
   * Fetch all saved photos sorted by newest first
   */
  async getAllPhotos() {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
          const list = request.result || [];
          list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
          resolve(list);
        };

        request.onerror = () => reject(request.error);
      });
    } catch {
      const list = getFallbackPhotos();
      list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      return list;
    }
  },

  /**
   * Fetch only favorite photos
   */
  async getFavoritePhotos() {
    const all = await this.getAllPhotos();
    return all.filter((p) => p.isFavorite);
  },

  /**
   * Save a new photo record
   */
  async addPhoto(photoData) {
    const id = photoData.id || `photo_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const record = {
      id,
      title: (photoData.title || '').trim(),
      category: photoData.category || 'family',
      dataUrl: photoData.dataUrl, // Compressed full picture
      thumbnailUrl: photoData.thumbnailUrl || photoData.dataUrl,
      isFavorite: Boolean(photoData.isFavorite),
      date: photoData.date || new Date().toISOString().split('T')[0],
      createdAt: photoData.createdAt || Date.now(),
      fileSize: photoData.fileSize || 'Unknown',
      originalName: photoData.originalName || 'photo.jpg',
    };

    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(record);

        request.onsuccess = () => resolve(record);
        request.onerror = () => reject(request.error);
      });
    } catch {
      const list = getFallbackPhotos();
      list.unshift(record);
      saveFallbackPhotos(list);
      return record;
    }
  },

  /**
   * Update photo properties (title, category, isFavorite)
   */
  async updatePhoto(id, updates) {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const getReq = store.get(id);

        getReq.onsuccess = () => {
          if (!getReq.result) {
            return reject(new Error('Photo not found'));
          }
          const updated = { ...getReq.result, ...updates };
          const putReq = store.put(updated);
          putReq.onsuccess = () => resolve(updated);
          putReq.onerror = () => reject(putReq.error);
        };

        getReq.onerror = () => reject(getReq.error);
      });
    } catch {
      const list = getFallbackPhotos();
      const idx = list.findIndex((p) => p.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updates };
        saveFallbackPhotos(list);
        return list[idx];
      }
      throw new Error('Photo not found in fallback');
    }
  },

  /**
   * Toggle favorite status
   */
  async toggleFavorite(id) {
    const all = await this.getAllPhotos();
    const target = all.find((p) => p.id === id);
    if (!target) return null;
    const newStatus = !target.isFavorite;
    return await this.updatePhoto(id, { isFavorite: newStatus });
  },

  /**
   * Delete photo by id
   */
  async deletePhoto(id) {
    try {
      const db = await openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve(true);
        request.onerror = () => reject(request.error);
      });
    } catch {
      const list = getFallbackPhotos().filter((p) => p.id !== id);
      saveFallbackPhotos(list);
      return true;
    }
  },

  /**
   * Get stats (total count, favorite count, approximate storage used)
   */
  async getStats() {
    const all = await this.getAllPhotos();
    const favoriteCount = all.filter((p) => p.isFavorite).length;
    let totalBytes = 0;
    all.forEach((p) => {
      if (p.dataUrl) {
        totalBytes += p.dataUrl.length;
      }
    });

    const mbUsed = (totalBytes / (1024 * 1024)).toFixed(1);
    return {
      totalCount: all.length,
      favoriteCount,
      mbUsed: `${mbUsed} MB`,
    };
  },

  /**
   * Client-side compression & thumbnail generator
   * Resizes large images (up to 15MB) into a clean ~100-200KB crisp JPEG
   */
  compressFile(file, maxWidth = 1280, maxHeight = 1280, quality = 0.8) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) {
        return reject(new Error('Invalid image file'));
      }

      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = () => reject(new Error('Failed to parse image'));
        img.onload = () => {
          try {
            // 1. Calculate Full Image Dimensions
            let width = img.width;
            let height = img.height;

            if (width > maxWidth || height > maxHeight) {
              const ratio = Math.min(maxWidth / width, maxHeight / height);
              width = Math.round(width * ratio);
              height = Math.round(height * ratio);
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', quality);

            // 2. Calculate Thumbnail Dimensions (max 300x300)
            const thumbMax = 300;
            let tWidth = img.width;
            let tHeight = img.height;
            if (tWidth > thumbMax || tHeight > thumbMax) {
              const tRatio = Math.min(thumbMax / tWidth, thumbMax / tHeight);
              tWidth = Math.round(tWidth * tRatio);
              tHeight = Math.round(tHeight * tRatio);
            }

            const thumbCanvas = document.createElement('canvas');
            thumbCanvas.width = tWidth;
            thumbCanvas.height = tHeight;
            const thumbCtx = thumbCanvas.getContext('2d');
            thumbCtx.drawImage(img, 0, 0, tWidth, tHeight);
            const thumbnailUrl = thumbCanvas.toDataURL('image/jpeg', 0.65);

            // Estimate compressed file size
            const head = 'data:image/jpeg;base64,';
            const sizeInBytes = Math.round(((dataUrl.length - head.length) * 3) / 4);
            const sizeKb = Math.round(sizeInBytes / 1024);
            const fileSizeStr = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

            resolve({
              dataUrl,
              thumbnailUrl,
              fileSize: fileSizeStr,
              originalName: file.name,
              width,
              height,
            });
          } catch (err) {
            reject(err);
          }
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  },
};
