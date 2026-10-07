import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Plus,
  Star,
  Image as ImageIcon,
  Trash2,
  Download,
  Share2,
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle2,
  FolderHeart,
  Loader2,
  Tag,
  Eye,
  Info,
  Lock,
  Unlock,
  Fingerprint,
  ShieldCheck,
  KeyRound,
  ShieldAlert,
  Sliders,
  Sparkles,
  Layers,
  Check,
  RefreshCw,
} from 'lucide-react';
import { photoStorageService } from '../services/photoStorageService';
import { storageService } from '../services/storageService';
import { biometricService } from '../services/biometricService';
import { permissionService } from '../services/permissionService';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import confetti from 'canvas-confetti';

const CATEGORIES = [
  { id: 'all', labelGu: '🌟 બધા ફોટા', labelEn: 'All Photos', icon: '🌟' },
  { id: 'favorites', labelGu: '⭐ ફેવરિટ', labelEn: 'Favorites', icon: '⭐' },
  { id: 'personal', labelGu: '🌸 પર્સનલ', labelEn: 'Personal', icon: '🌸' },
  { id: 'family', labelGu: '👨‍👩‍👧 પરિવાર', labelEn: 'Family', icon: '👨‍👩‍👧' },
  { id: 'travel', labelGu: '✈️ પ્રવાસ', labelEn: 'Travel', icon: '✈️' },
  { id: 'events', labelGu: '🎂 પ્રસંગો', labelEn: 'Events', icon: '🎂' },
  { id: 'documents', labelGu: '📄 દસ્તાવેજ', labelEn: 'Docs', icon: '📄' },
];

const PHOTO_FILTERS = [
  { id: 'normal', nameGu: 'ઓરિજિનલ', nameEn: 'Original', filter: 'none', icon: '🌟' },
  { id: 'vintage', nameGu: 'વિન્ટેજ', nameEn: 'Vintage', filter: 'sepia(0.35) contrast(1.15) brightness(0.96) saturate(1.25)', icon: '🎞️' },
  { id: 'bw', nameGu: 'B & W', nameEn: 'B&W', filter: 'grayscale(1) contrast(1.25) brightness(1.05)', icon: '🖤' },
  { id: 'warm', nameGu: 'વાર્મ ગોલ્ડ', nameEn: 'Warm', filter: 'sepia(0.22) saturate(1.4) brightness(1.06) contrast(1.05)', icon: '🌅' },
  { id: 'cool', nameGu: 'કૂલ બ્લુ', nameEn: 'Cool', filter: 'hue-rotate(180deg) saturate(0.85) contrast(1.1)', icon: '❄️' },
  { id: 'sepia', nameGu: 'સેપિયા', nameEn: 'Sepia', filter: 'sepia(0.85) contrast(1.1) brightness(0.95)', icon: '📜' },
  { id: 'vivid', nameGu: 'વાઇબ્રન્ટ HDR', nameEn: 'Vivid', filter: 'saturate(1.75) contrast(1.2) brightness(1.02)', icon: '🎨' },
  { id: 'dramatic', nameGu: 'ડ્રામેટિક', nameEn: 'Dramatic', filter: 'contrast(1.4) brightness(0.9) saturate(1.1)', icon: '🎭' },
];

export default function PhotoGalleryModal({ isOpen, onClose, lang = 'gu' }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null); // Lightbox target
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState({ totalCount: 0, favoriteCount: 0, mbUsed: '0 MB' });
  const [notice, setNotice] = useState('');

  // Filters State
  const [activeFilterId, setActiveFilterId] = useState('normal');
  const [isFilterBarOpen, setIsFilterBarOpen] = useState(false);
  const [isSavingFilter, setIsSavingFilter] = useState(false);

  // Collage Maker States
  const [isCollageOpen, setIsCollageOpen] = useState(false);
  const [collageSelectedIds, setCollageSelectedIds] = useState([]);
  const [collageLayout, setCollageLayout] = useState('grid');
  const [collageBorder, setCollageBorder] = useState('white');
  const [isGeneratingCollage, setIsGeneratingCollage] = useState(false);

  // Privacy & Vault Security Lock States
  const [isVaultLocked, setIsVaultLocked] = useState(() => {
    return localStorage.getItem('photo_vault_locked') === 'true';
  });
  const [isUnlockedForSession, setIsUnlockedForSession] = useState(() => {
    return localStorage.getItem('photo_vault_locked') !== 'true';
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isBiometricTesting, setIsBiometricTesting] = useState(false);

  const fileInputRef = useRef(null);
  const collageCanvasRef = useRef(null);
  const user = storageService.getUserProfile();

  // Load photos from IndexedDB
  const loadPhotos = async () => {
    try {
      setLoading(true);
      const data = await photoStorageService.getAllPhotos();
      setPhotos(data);
      const s = await photoStorageService.getStats();
      setStats(s);
    } catch (err) {
      console.error('Failed to load photos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      const lockEnabled = localStorage.getItem('photo_vault_locked') === 'true';
      setIsVaultLocked(lockEnabled);
      setIsUnlockedForSession(!lockEnabled);
      setPinInput('');
      setPinError('');
      loadPhotos();
      setSelectedPhoto(null);
      setIsEditing(false);
      setActiveFilterId('normal');
      setIsFilterBarOpen(false);
      setIsCollageOpen(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Toggle Vault Lock setting
  const handleToggleVaultLock = () => {
    const nextState = !isVaultLocked;
    setIsVaultLocked(nextState);
    localStorage.setItem('photo_vault_locked', nextState ? 'true' : 'false');
    if (nextState) {
      showNotice(
        lang === 'gu'
          ? '🔒 ફોટો ગેલેરી લૉક સક્ષમ થયું! હવે પિન કે ફિંગરપ્રિન્ટ જરૂરી રહેશે.'
          : '🔒 Photo Vault locked! PIN or Biometrics required.'
      );
    } else {
      setIsUnlockedForSession(true);
      showNotice(
        lang === 'gu'
          ? '🔓 ફોટો ગેલેરી લૉક બંધ કરવામાં આવ્યું.'
          : '🔓 Photo Vault lock disabled.'
      );
    }
  };

  // Verify PIN Unlock
  const handleVerifyPin = (e) => {
    if (e) e.preventDefault();
    const correctPin = user?.pin || '1234';
    if (pinInput === correctPin) {
      setIsUnlockedForSession(true);
      setPinError('');
      setPinInput('');
      confetti({ particleCount: 25, spread: 50, origin: { y: 0.6 } });
    } else {
      setPinError(lang === 'gu' ? 'ખોટો PIN! ફરી પ્રયાસ કરો.' : 'Incorrect PIN! Try again.');
      setPinInput('');
    }
  };

  // Verify Biometric Unlock
  const handleVerifyBiometric = async () => {
    setIsBiometricTesting(true);
    setPinError('');
    try {
      const res = await biometricService.authenticate();
      if (res.success) {
        setIsUnlockedForSession(true);
        confetti({ particleCount: 30, spread: 60, origin: { y: 0.6 } });
      } else if (!res.cancelled) {
        setPinError(res.error || (lang === 'gu' ? 'ફિંગરપ્રિન્ટ મેળ ખાતી નથી.' : 'Biometrics failed.'));
      }
    } catch (err) {
      console.warn('Biometric unlock error:', err);
    } finally {
      setIsBiometricTesting(false);
    }
  };

  // Open photo picker
  const handleOpenPhotoPicker = async () => {
    await permissionService.requestPhotoPermission();
    fileInputRef.current?.click();
  };

  // Handle file uploads from device gallery
  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(
      lang === 'gu'
        ? `૧/${files.length} ફોટો સુરક્ષિત સેવ થઈ રહ્યો છે...`
        : `Saving 1/${files.length} photo...`
    );

    let savedCount = 0;
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(
          lang === 'gu'
            ? `${i + 1}/${files.length} ફોટો ઓપ્ટિમાઈઝ અને સેવ કરી રહ્યા છીએ...`
            : `Optimizing ${i + 1}/${files.length}...`
        );

        // Compress image using Canvas
        const compressed = await photoStorageService.compressFile(file, 1280, 1280, 0.82);

        // Derive neat title from filename (removing extension)
        const rawName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        const cleanTitle = rawName.length > 28 ? rawName.slice(0, 28) + '...' : rawName;

        // Auto mark as favorite if uploaded while in favorites tab
        const isFav = activeCategory === 'favorites';
        // Clean default: If uploaded in all or favorites, set to 'personal' (NOT forced to 'family')
        const defaultCategory =
          activeCategory === 'all' || activeCategory === 'favorites' ? 'personal' : activeCategory;

        await photoStorageService.addPhoto({
          title: cleanTitle,
          category: defaultCategory,
          dataUrl: compressed.dataUrl,
          thumbnailUrl: compressed.thumbnailUrl,
          fileSize: compressed.fileSize,
          originalName: file.name,
          isFavorite: isFav,
          date: new Date().toISOString().split('T')[0],
        });

        savedCount++;
      }

      // Refresh list
      await loadPhotos();
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
      showNotice(
        lang === 'gu'
          ? `✅ ${savedCount} ફોટા ગેલેરીમાં સફળતાપૂર્વક સાચવવામાં આવ્યા!`
          : `✅ ${savedCount} photos saved to gallery!`
      );
    } catch (err) {
      console.error('Photo save error:', err);
      showNotice(
        lang === 'gu'
          ? '❌ ફોટો સેવ કરવામાં ક્ષતિ આવી. ફરી પ્રયાસ કરો.'
          : '❌ Failed to save photos. Please retry.'
      );
    } finally {
      setUploading(false);
      setUploadProgress('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const showNotice = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3500);
  };

  // Toggle Favorite
  const handleToggleFavorite = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      const updated = await photoStorageService.toggleFavorite(id);
      if (updated) {
        setPhotos((prev) => prev.map((p) => (p.id === id ? updated : p)));
        if (selectedPhoto && selectedPhoto.id === id) {
          setSelectedPhoto(updated);
        }
        const s = await photoStorageService.getStats();
        setStats(s);

        if (updated.isFavorite) {
          confetti({ particleCount: 20, spread: 45, origin: { y: 0.7 } });
        }
      }
    } catch (err) {
      console.error('Favorite toggle failed:', err);
    }
  };

  // Delete photo
  const handleDeletePhoto = async (id) => {
    const confirmMsg =
      lang === 'gu'
        ? 'શું તમે ખરેખર આ ફોટો ગેલેરીમાંથી કાઢી નાખવા માંગો છો?'
        : 'Are you sure you want to delete this photo?';
    if (!window.confirm(confirmMsg)) return;

    try {
      await photoStorageService.deletePhoto(id);
      setPhotos((prev) => prev.filter((p) => p.id !== id));
      if (selectedPhoto && selectedPhoto.id === id) {
        setSelectedPhoto(null);
      }
      const s = await photoStorageService.getStats();
      setStats(s);
      showNotice(lang === 'gu' ? '🗑️ ફોટો દૂર કરવામાં આવ્યો.' : '🗑️ Photo deleted.');
    } catch (err) {
      console.error('Delete photo failed:', err);
    }
  };

  // Save edits (title & category)
  const handleSaveEdits = async () => {
    if (!selectedPhoto) return;
    try {
      const updated = await photoStorageService.updatePhoto(selectedPhoto.id, {
        title: editTitle.trim(),
        category: editCategory,
      });
      setPhotos((prev) => prev.map((p) => (p.id === selectedPhoto.id ? updated : p)));
      setSelectedPhoto(updated);
      setIsEditing(false);
      showNotice(lang === 'gu' ? '✅ વિગતો સાચવી લેવાઈ.' : '✅ Details updated.');
    } catch (err) {
      console.error('Update photo failed:', err);
    }
  };

  // Open Lightbox
  const handleOpenLightbox = (photo) => {
    setSelectedPhoto(photo);
    setEditTitle(photo.title || '');
    setEditCategory(photo.category || 'personal');
    setIsEditing(false);
    setActiveFilterId('normal');
    setIsFilterBarOpen(false);
  };

  // Lightbox Navigation
  const handleNavigateLightbox = (direction) => {
    if (!selectedPhoto) return;
    const currentIndex = filteredPhotos.findIndex((p) => p.id === selectedPhoto.id);
    if (currentIndex === -1) return;

    let nextIndex = currentIndex + direction;
    if (nextIndex < 0) nextIndex = filteredPhotos.length - 1;
    if (nextIndex >= filteredPhotos.length) nextIndex = 0;

    const nextPhoto = filteredPhotos[nextIndex];
    setSelectedPhoto(nextPhoto);
    setEditTitle(nextPhoto.title || '');
    setEditCategory(nextPhoto.category || 'personal');
    setIsEditing(false);
    setActiveFilterId('normal');
  };

  // Download photo back to device
  const handleDownloadPhoto = (photo) => {
    try {
      const link = document.createElement('a');
      link.href = photo.dataUrl;
      link.download = photo.originalName || `favorite_photo_${photo.date || 'diary'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotice(
        lang === 'gu' ? '📥 ફોટો ડાઉનલોડ થઈ રહ્યો છે...' : '📥 Photo downloading...'
      );
    } catch (err) {
      console.error('Download photo failed:', err);
    }
  };

  // Share photo
  const handleSharePhoto = async (photo) => {
    try {
      if (Capacitor.isNativePlatform()) {
        await Share.share({
          title: photo.title || 'મારી ફેવરિટ તસવીર',
          text: `${photo.title || 'યાદગાર તસવીર'} (${photo.date || ''})`,
          dialogTitle: 'ફોટો શેર કરો',
        });
      } else if (navigator.share) {
        await navigator.share({
          title: photo.title || 'મારી ફેવરિટ તસવીર',
          text: `${photo.title || 'યાદગાર તસવીર'} - દૈનિક ડાયરી`,
        });
      } else {
        handleDownloadPhoto(photo);
      }
    } catch (err) {
      console.log('Share canceled or not supported:', err);
    }
  };

  // Save Filtered Photo Copy
  const handleSaveFilteredCopy = async () => {
    if (!selectedPhoto || activeFilterId === 'normal') return;
    setIsSavingFilter(true);
    try {
      const filterObj = PHOTO_FILTERS.find((f) => f.id === activeFilterId);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = selectedPhoto.dataUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth || img.width;
      canvas.height = img.naturalHeight || img.height;
      const ctx = canvas.getContext('2d');
      if (filterObj && filterObj.filter !== 'none') {
        ctx.filter = filterObj.filter;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const filteredDataUrl = canvas.toDataURL('image/jpeg', 0.85);

      // Create thumbnail
      const thumbCanvas = document.createElement('canvas');
      const thumbW = 240;
      const thumbH = Math.round((canvas.height * thumbW) / canvas.width);
      thumbCanvas.width = thumbW;
      thumbCanvas.height = thumbH;
      const tCtx = thumbCanvas.getContext('2d');
      if (filterObj && filterObj.filter !== 'none') {
        tCtx.filter = filterObj.filter;
      }
      tCtx.drawImage(img, 0, 0, thumbW, thumbH);
      const filteredThumbUrl = thumbCanvas.toDataURL('image/jpeg', 0.7);

      const newPhoto = await photoStorageService.addPhoto({
        title: `${selectedPhoto.title || 'તસવીર'} (${filterObj.nameGu})`,
        category: selectedPhoto.category || 'personal',
        dataUrl: filteredDataUrl,
        thumbnailUrl: filteredThumbUrl,
        fileSize: `${Math.round((filteredDataUrl.length * 0.75) / 1024)} KB`,
        originalName: `filter_${Date.now()}.jpg`,
        isFavorite: selectedPhoto.isFavorite,
        date: new Date().toISOString().split('T')[0],
      });

      await loadPhotos();
      setSelectedPhoto(newPhoto);
      setActiveFilterId('normal');
      setIsFilterBarOpen(false);
      confetti({ particleCount: 30, spread: 55, origin: { y: 0.6 } });
      showNotice(
        lang === 'gu'
          ? '✅ ફિલ્ટર કરેલો નવો ફોટો ગેલેરીમાં સાચવવામાં આવ્યો!'
          : '✅ Filtered copy saved to gallery!'
      );
    } catch (err) {
      console.error('Save filtered photo error:', err);
      showNotice(
        lang === 'gu' ? '❌ ફિલ્ટર સેવ કરવામાં ક્ષતિ આવી.' : '❌ Failed to save filtered photo.'
      );
    } finally {
      setIsSavingFilter(false);
    }
  };

  // Toggle selection for collage
  const handleToggleCollagePhoto = (id) => {
    if (collageSelectedIds.includes(id)) {
      setCollageSelectedIds((prev) => prev.filter((x) => x !== id));
    } else {
      if (collageSelectedIds.length >= 4) {
        showNotice(
          lang === 'gu'
            ? 'કોલાઝ માટે વધુમાં વધુ ૪ ફોટા પસંદ કરી શકાય છે.'
            : 'Maximum 4 photos can be selected for collage.'
        );
        return;
      }
      setCollageSelectedIds((prev) => [...prev, id]);
    }
  };

  // Generate & Save Photo Collage
  const handleGenerateAndSaveCollage = async () => {
    if (collageSelectedIds.length < 2) {
      showNotice(
        lang === 'gu'
          ? 'કોલાઝ બનાવવા માટે ઓછામાં ઓછા ૨ ફોટા પસંદ કરો.'
          : 'Please select at least 2 photos for collage.'
      );
      return;
    }

    setIsGeneratingCollage(true);
    try {
      const selectedItems = photos.filter((p) => collageSelectedIds.includes(p.id));
      const size = 1200;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');

      const bgColor = collageBorder === 'dark' ? '#0f172a' : collageBorder === 'white' ? '#ffffff' : '#000000';
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, size, size);

      const pad = collageBorder === 'none' ? 0 : 20;
      const gap = collageBorder === 'none' ? 0 : 16;

      const loadedImgs = await Promise.all(
        selectedItems.map((p) => {
          return new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => resolve(null);
            img.src = p.dataUrl || p.thumbnailUrl;
          });
        })
      );

      const drawCover = (img, x, y, w, h) => {
        if (!img) return;
        const imgRatio = img.naturalWidth / img.naturalHeight;
        const destRatio = w / h;
        let sW = img.naturalWidth;
        let sH = img.naturalHeight;
        let sX = 0;
        let sY = 0;

        if (imgRatio > destRatio) {
          sW = img.naturalHeight * destRatio;
          sX = (img.naturalWidth - sW) / 2;
        } else {
          sH = img.naturalWidth / destRatio;
          sY = (img.naturalHeight - sH) / 2;
        }

        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, w, h);
        ctx.clip();
        ctx.drawImage(img, sX, sY, sW, sH, x, y, w, h);
        ctx.restore();
      };

      const count = selectedItems.length;

      if (count === 2) {
        if (collageLayout === 'split-h') {
          const halfH = (size - 2 * pad - gap) / 2;
          drawCover(loadedImgs[0], pad, pad, size - 2 * pad, halfH);
          drawCover(loadedImgs[1], pad, pad + halfH + gap, size - 2 * pad, halfH);
        } else {
          const halfW = (size - 2 * pad - gap) / 2;
          drawCover(loadedImgs[0], pad, pad, halfW, size - 2 * pad);
          drawCover(loadedImgs[1], pad + halfW + gap, pad, halfW, size - 2 * pad);
        }
      } else if (count === 3) {
        if (collageLayout === '1-left-2-right') {
          const halfW = (size - 2 * pad - gap) / 2;
          const halfH = (size - 2 * pad - gap) / 2;
          drawCover(loadedImgs[0], pad, pad, halfW, size - 2 * pad);
          drawCover(loadedImgs[1], pad + halfW + gap, pad, halfW, halfH);
          drawCover(loadedImgs[2], pad + halfW + gap, pad + halfH + gap, halfW, halfH);
        } else {
          const halfH = (size - 2 * pad - gap) / 2;
          const halfW = (size - 2 * pad - gap) / 2;
          drawCover(loadedImgs[0], pad, pad, size - 2 * pad, halfH);
          drawCover(loadedImgs[1], pad, pad + halfH + gap, halfW, halfH);
          drawCover(loadedImgs[2], pad + halfW + gap, pad + halfH + gap, halfW, halfH);
        }
      } else if (count >= 4) {
        const cell = (size - 2 * pad - gap) / 2;
        drawCover(loadedImgs[0], pad, pad, cell, cell);
        drawCover(loadedImgs[1], pad + cell + gap, pad, cell, cell);
        drawCover(loadedImgs[2], pad, pad + cell + gap, cell, cell);
        drawCover(loadedImgs[3], pad + cell + gap, pad + cell + gap, cell, cell);
      }

      const collageDataUrl = canvas.toDataURL('image/jpeg', 0.86);

      // Thumbnail
      const thumbCanvas = document.createElement('canvas');
      thumbCanvas.width = 240;
      thumbCanvas.height = 240;
      const tCtx = thumbCanvas.getContext('2d');
      tCtx.drawImage(canvas, 0, 0, 240, 240);
      const collageThumbUrl = thumbCanvas.toDataURL('image/jpeg', 0.7);

      const newCollagePhoto = await photoStorageService.addPhoto({
        title: `ફોટો કોલાઝ (${count} ફોટા)`,
        category: 'events',
        dataUrl: collageDataUrl,
        thumbnailUrl: collageThumbUrl,
        fileSize: `${Math.round((collageDataUrl.length * 0.75) / 1024)} KB`,
        originalName: `collage_${Date.now()}.jpg`,
        isFavorite: true,
        date: new Date().toISOString().split('T')[0],
      });

      await loadPhotos();
      setIsCollageOpen(false);
      setCollageSelectedIds([]);
      setSelectedPhoto(newCollagePhoto);
      confetti({ particleCount: 45, spread: 70, origin: { y: 0.6 } });
      showNotice(
        lang === 'gu'
          ? '🎉 નવો કોલાઝ સફળતાપૂર્વક બન્યો અને ગેલેરીમાં સાચવવામાં આવ્યો!'
          : '🎉 New collage created and saved to gallery!'
      );
    } catch (err) {
      console.error('Collage creation error:', err);
      showNotice(
        lang === 'gu' ? '❌ કોલાઝ બનાવવામાં ક્ષતિ આવી.' : '❌ Failed to create collage.'
      );
    } finally {
      setIsGeneratingCollage(false);
    }
  };

  // Filtered photos based on tab and search
  const filteredPhotos = photos.filter((p) => {
    if (activeCategory === 'favorites' && !p.isFavorite) return false;
    if (activeCategory !== 'all' && activeCategory !== 'favorites' && p.category !== activeCategory) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = (p.title || '').toLowerCase().includes(q);
      const matchDate = (p.date || '').includes(q);
      const matchCat = (p.category || '').toLowerCase().includes(q);
      return matchTitle || matchDate || matchCat;
    }
    return true;
  });

  const activeFilterObj = PHOTO_FILTERS.find((f) => f.id === activeFilterId) || PHOTO_FILTERS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full sm:max-w-2xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-bottom duration-200 flex flex-col h-full sm:h-[92vh] max-h-[100dvh]">
        {/* RESPONSIVE HEADER (Two tiers for mobile, never clips!) */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-3.5 sm:p-4 shrink-0 shadow-sm space-y-2.5">
          {/* Top Row: Title + Vault Lock + Close */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-lg shrink-0">
                📸
              </div>
              <h2 className="text-sm sm:text-base font-extrabold truncate">
                {lang === 'gu' ? 'મારી યાદગાર ફોટો ગેલેરી' : 'My Photo Gallery'}
              </h2>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Vault PIN/Fingerprint Lock Toggle */}
              <button
                onClick={handleToggleVaultLock}
                title={isVaultLocked ? 'વોલ્ટ લૉક સક્રિય છે' : 'વોલ્ટ લૉક બંધ છે'}
                className={`p-1.5 px-2 rounded-xl border transition active:scale-95 flex items-center gap-1 text-[11px] font-bold ${
                  isVaultLocked
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-xs'
                    : 'bg-white/20 hover:bg-white/30 text-white border-white/20'
                }`}
              >
                {isVaultLocked ? <Lock size={13} /> : <Unlock size={13} />}
                <span className="text-[10px] hidden xs:inline">{isVaultLocked ? 'લૉક' : 'અનલૉક'}</span>
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-black/25 hover:bg-black/40 text-white transition active:scale-95"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Bottom Row: Stats Summary Badge + Action Buttons */}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-blue-100 min-w-0">
              <span className="bg-white/20 px-2 py-0.5 rounded-md font-semibold truncate">
                {stats.totalCount} {lang === 'gu' ? 'તસવીરો' : 'photos'}
              </span>
              <span className="bg-amber-400/30 text-amber-200 px-2 py-0.5 rounded-md font-bold flex items-center gap-0.5 shrink-0">
                <Star size={10} className="fill-amber-300" />
                {stats.favoriteCount}
              </span>
              <span className="text-[9px] bg-white/15 px-1.5 py-0.5 rounded-md hidden sm:inline-flex items-center gap-1">
                <ShieldCheck size={9} />
                ૧૦૦% ઓફલાઇન
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Collage Maker Button */}
              <button
                onClick={() => {
                  setCollageSelectedIds([]);
                  setIsCollageOpen(true);
                }}
                className="px-2.5 py-1 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold text-[11px] shadow-sm transition active:scale-95 flex items-center gap-1 border border-white/20"
              >
                <Layers size={12} />
                <span>{lang === 'gu' ? 'કોલાઝ' : 'Collage'}</span>
              </button>

              {/* Add Photo Button */}
              <button
                onClick={handleOpenPhotoPicker}
                disabled={uploading}
                className="px-3 py-1 rounded-xl bg-white text-indigo-700 hover:bg-blue-50 font-extrabold text-[11px] shadow-md transition active:scale-95 flex items-center gap-1"
              >
                {uploading ? (
                  <Loader2 size={13} className="animate-spin text-indigo-600" />
                ) : (
                  <Plus size={14} className="stroke-[2.5]" />
                )}
                <span>{lang === 'gu' ? 'ફોટો ઉમેરો' : 'Add Photo'}</span>
              </button>
            </div>
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            multiple
            className="hidden"
          />
        </div>

        {/* Uploading Status Banner */}
        {uploading && (
          <div className="bg-amber-500 text-white px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 shadow-inner shrink-0">
            <Loader2 size={15} className="animate-spin" />
            <span>{uploadProgress}</span>
          </div>
        )}

        {/* Alert Notice Toast */}
        {notice && (
          <div className="bg-emerald-600 text-white px-4 py-1.5 text-xs font-bold text-center shrink-0 shadow-sm animate-in slide-in-from-top-1">
            {notice}
          </div>
        )}

        {/* VAULT SECURITY LOCK SCREEN */}
        {isVaultLocked && !isUnlockedForSession ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-slate-900/90 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-md">
              <Lock size={32} />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                {lang === 'gu' ? '🔒 સુરક્ષિત પ્રાઇવેટ ફોટો વોલ્ટ' : '🔒 Secure Private Photo Vault'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1 leading-relaxed">
                {lang === 'gu'
                  ? 'આ ફોટો ગેલેરી સુરક્ષિત લૉક થયેલી છે. જોવા માટે તમારો ૪ અંકનો PIN દાખલ કરો અથવા ફિંગરપ્રિન્ટ ચકાસો.'
                  : 'This photo vault is locked. Enter your 4-digit PIN or verify biometrics to unlock.'}
              </p>
            </div>

            {/* PIN Input Form */}
            <form onSubmit={handleVerifyPin} className="w-full max-w-xs space-y-3">
              <div className="relative">
                <input
                  type="password"
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, '');
                    setPinInput(val);
                    if (val.length === 4 && val === (user?.pin || '1234')) {
                      setIsUnlockedForSession(true);
                      confetti({ particleCount: 25, spread: 50, origin: { y: 0.6 } });
                    }
                  }}
                  placeholder="••••"
                  className="w-full text-center tracking-[0.5em] text-2xl font-bold py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
                  autoFocus
                />
              </div>

              {pinError && (
                <p className="text-xs font-bold text-red-500 animate-in fade-in">{pinError}</p>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleVerifyBiometric}
                  disabled={isBiometricTesting}
                  className="flex-1 py-2.5 px-3 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                >
                  <Fingerprint size={16} className="text-blue-600 dark:text-blue-400" />
                  <span>{lang === 'gu' ? 'ફિંગરપ્રિન્ટ' : 'Biometrics'}</span>
                </button>

                <button
                  type="submit"
                  className="flex-1 py-2.5 px-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 transition active:scale-95"
                >
                  <KeyRound size={15} />
                  <span>{lang === 'gu' ? 'અનલૉક કરો' : 'Unlock'}</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* UNLOCKED GALLERY MAIN CONTENT */
          <>
            {/* Search Bar & Category Filter Chips */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 space-y-2.5 shrink-0">
              {/* Search Bar */}
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    lang === 'gu'
                      ? 'તસવીરનું નામ કે તારીખ શોધો...'
                      : 'Search photo title or date...'
                  }
                  className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Category Pills Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                {CATEGORIES.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  const count =
                    cat.id === 'all'
                      ? photos.length
                      : cat.id === 'favorites'
                      ? photos.filter((p) => p.isFavorite).length
                      : photos.filter((p) => p.category === cat.id).length;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition active:scale-95 flex items-center gap-1.5 text-xs ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <span>{cat.id === 'all' ? '🌟' : cat.id === 'favorites' ? '⭐' : cat.icon}</span>
                      <span>{lang === 'gu' ? cat.labelGu : cat.labelEn}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                          isActive
                            ? 'bg-white/30 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Photos Grid Container */}
            <div className="flex-1 overflow-y-auto p-3.5">
              {loading ? (
                <div className="h-64 flex flex-col items-center justify-center gap-2 text-slate-400 text-xs">
                  <Loader2 size={24} className="animate-spin text-blue-600" />
                  <span>{lang === 'gu' ? 'તસવીરો લોડ થઈ રહી છે...' : 'Loading photos...'}</span>
                </div>
              ) : filteredPhotos.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
                  <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-3xl mb-3 shadow-inner">
                    🖼️
                  </div>
                  <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                    {lang === 'gu' ? 'કોઈ ફોટો મળ્યો નથી' : 'No photos found'}
                  </h4>
                  <p className="text-xs text-slate-400 max-w-xs mt-1">
                    {activeCategory === 'favorites'
                      ? lang === 'gu'
                        ? 'કોઈપણ ફોટાના ખૂણા પર આપેલ ⭐ સ્ટાર બટન દબાવીને તેને ફેવરિટ બનાવો.'
                        : 'Tap the ⭐ star on any photo to add it to your favorites.'
                      : lang === 'gu'
                      ? 'તમારા પરિવાર, પ્રવાસ કે ખાસ ક્ષણોના ફોટા સાચવવા નીચેના બટન પર ક્લિક કરો.'
                      : 'Tap below to select photos from your device gallery.'}
                  </p>
                  <button
                    onClick={handleOpenPhotoPicker}
                    className="mt-4 px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-blue-500/25 active:scale-95 transition flex items-center gap-2"
                  >
                    <Plus size={16} />
                    <span>{lang === 'gu' ? 'ગેલેરીમાંથી ફોટો પસંદ કરો' : 'Pick from Gallery'}</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {filteredPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      onClick={() => handleOpenLightbox(photo)}
                      className="group relative bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs cursor-pointer hover:shadow-md transition active:scale-98 flex flex-col"
                    >
                      {/* Photo Thumbnail Container */}
                      <div className="aspect-square w-full relative overflow-hidden bg-slate-200 dark:bg-slate-800">
                        <img
                          src={photo.thumbnailUrl || photo.dataUrl}
                          alt={photo.title}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />

                        {/* Gradient Overlay on bottom */}
                        <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />

                        {/* Favorite Star Button (Top Right) */}
                        <button
                          onClick={(e) => handleToggleFavorite(photo.id, e)}
                          title={photo.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                          className={`absolute top-2 right-2 p-1.5 rounded-full backdrop-blur-md transition shadow-md active:scale-125 z-10 ${
                            photo.isFavorite
                              ? 'bg-amber-400 text-slate-900 shadow-amber-400/50 scale-105'
                              : 'bg-black/40 text-white hover:bg-black/60'
                          }`}
                        >
                          <Star
                            size={14}
                            className={photo.isFavorite ? 'fill-slate-900 stroke-slate-900' : 'stroke-white'}
                          />
                        </button>

                        {/* Category Tag (Bottom Left) */}
                        <div className="absolute bottom-1.5 left-2 pointer-events-none">
                          <span className="text-[9px] font-bold text-white/90 bg-black/40 backdrop-blur-xs px-1.5 py-0.5 rounded-md">
                            {CATEGORIES.find((c) => c.id === photo.category)?.icon || '📸'}{' '}
                            {CATEGORIES.find((c) => c.id === photo.category)?.labelGu?.split(' ')[1] || photo.category}
                          </span>
                        </div>
                      </div>

                      {/* Caption & Date details */}
                      <div className="p-2 bg-white dark:bg-slate-900 flex-1 flex flex-col justify-between">
                        <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-100 truncate">
                          {photo.title || (lang === 'gu' ? 'યાદગાર તસવીર' : 'Memory Photo')}
                        </h4>
                        <div className="flex items-center justify-between text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">
                          <span className="flex items-center gap-0.5">
                            <Calendar size={9} />
                            {photo.date}
                          </span>
                          <span>{photo.fileSize}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer Info & Storage Counter */}
            <div className="p-2.5 px-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={12} className="text-emerald-500" />
                <span>
                  {lang === 'gu'
                    ? `સ્ટોરેજ: ${stats.mbUsed} • તમામ ફોટો ડિવાઇસમાં ૧૦૦% ઓફલાઇન સચવાય છે`
                    : `Storage: ${stats.mbUsed} • Photos stored 100% locally on device`}
                </span>
              </div>

              <button
                onClick={handleOpenPhotoPicker}
                className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1"
              >
                <Plus size={12} />
                <span>{lang === 'gu' ? 'નવા ફોટા' : 'Add More'}</span>
              </button>
            </div>
          </>
        )}

        {/* FULLSCREEN LIGHTBOX WITH PHOTO FILTERS & DETAILS */}
        {selectedPhoto && (
          <div className="fixed inset-0 z-60 bg-black/95 flex flex-col justify-between animate-in fade-in duration-200">
            {/* Lightbox Top Bar */}
            <div className="p-3 px-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between text-white shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-300">
                  {filteredPhotos.findIndex((p) => p.id === selectedPhoto.id) + 1} /{' '}
                  {filteredPhotos.length}
                </span>
                <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full">
                  {CATEGORIES.find((c) => c.id === selectedPhoto.category)?.labelGu || selectedPhoto.category}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Filter Toggle Button */}
                <button
                  onClick={() => setIsFilterBarOpen(!isFilterBarOpen)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                    isFilterBarOpen
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                  title="Photo Filters"
                >
                  <Sliders size={14} />
                  <span>{lang === 'gu' ? 'ફિલ્ટર્સ' : 'Filters'}</span>
                </button>

                {/* Favorite Toggle in Lightbox */}
                <button
                  onClick={() => handleToggleFavorite(selectedPhoto.id)}
                  className={`p-2 rounded-full transition ${
                    selectedPhoto.isFavorite
                      ? 'bg-amber-400 text-slate-950 font-bold'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                  title="Toggle Favorite"
                >
                  <Star
                    size={16}
                    className={
                      selectedPhoto.isFavorite ? 'fill-slate-950 stroke-slate-950' : 'stroke-white'
                    }
                  />
                </button>

                {/* Close Lightbox */}
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition active:scale-95"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Filter Selector Bar (Expandable) */}
            {isFilterBarOpen && (
              <div className="bg-slate-900/90 border-b border-white/20 p-2.5 px-3 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none shrink-0 animate-in slide-in-from-top-1">
                <div className="flex items-center gap-1.5">
                  {PHOTO_FILTERS.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setActiveFilterId(f.id)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition active:scale-95 flex items-center gap-1 ${
                        activeFilterId === f.id
                          ? 'bg-purple-500 text-white shadow-md'
                          : 'bg-white/10 hover:bg-white/20 text-slate-200'
                      }`}
                    >
                      <span>{f.icon}</span>
                      <span>{lang === 'gu' ? f.nameGu : f.nameEn}</span>
                    </button>
                  ))}
                </div>

                {activeFilterId !== 'normal' && (
                  <button
                    onClick={handleSaveFilteredCopy}
                    disabled={isSavingFilter}
                    className="px-3 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold shrink-0 shadow-md flex items-center gap-1 active:scale-95"
                  >
                    {isSavingFilter ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    <span>{lang === 'gu' ? 'ફિલ્ટર સેવ કરો' : 'Save Filtered'}</span>
                  </button>
                )}
              </div>
            )}

            {/* Lightbox Center Image View with Nav Arrows */}
            <div className="flex-1 relative flex items-center justify-center p-2 overflow-hidden select-none">
              <img
                src={selectedPhoto.dataUrl}
                alt={selectedPhoto.title}
                style={{
                  filter: activeFilterObj.filter !== 'none' ? activeFilterObj.filter : undefined,
                }}
                className="max-h-full max-w-full object-contain rounded-lg shadow-2xl transition duration-200"
              />

              {/* Prev Button */}
              {filteredPhotos.length > 1 && (
                <button
                  onClick={() => handleNavigateLightbox(-1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 backdrop-blur-md active:scale-95 transition"
                >
                  <ChevronLeft size={22} />
                </button>
              )}

              {/* Next Button */}
              {filteredPhotos.length > 1 && (
                <button
                  onClick={() => handleNavigateLightbox(1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white border border-white/20 backdrop-blur-md active:scale-95 transition"
                >
                  <ChevronRight size={22} />
                </button>
              )}
            </div>

            {/* Lightbox Bottom Controls & Details Bar */}
            <div className="p-4 bg-gradient-to-t from-black via-black/90 to-transparent text-white space-y-3 shrink-0">
              {isEditing ? (
                /* Inline Edit Mode */
                <div className="bg-slate-900/90 p-3 rounded-2xl border border-white/20 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder={lang === 'gu' ? 'તસવીરનું નામ / વિષય...' : 'Photo title...'}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="bg-slate-800 border border-slate-700 rounded-xl px-2 py-1.5 text-xs text-white focus:outline-none"
                    >
                      {CATEGORIES.filter((c) => c.id !== 'all' && c.id !== 'favorites').map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.labelGu}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1 rounded-xl bg-slate-800 text-xs text-slate-300"
                    >
                      {lang === 'gu' ? 'રદ કરો' : 'Cancel'}
                    </button>
                    <button
                      onClick={handleSaveEdits}
                      className="px-3 py-1 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-xs"
                    >
                      {lang === 'gu' ? 'સાચવો' : 'Save'}
                    </button>
                  </div>
                </div>
              ) : (
                /* Normal Details Display */
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1 pr-3">
                    <h3 className="text-sm font-bold text-white truncate">
                      {selectedPhoto.title || (lang === 'gu' ? 'યાદગાર તસવીર' : 'Memory Photo')}
                    </h3>
                    <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>📅 {selectedPhoto.date}</span>
                      <span>•</span>
                      <span>📦 {selectedPhoto.fileSize}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-xs text-blue-400 hover:text-blue-300 font-semibold underline shrink-0"
                  >
                    {lang === 'gu' ? 'નામ/કેટેગરી બદલો' : 'Edit Details'}
                  </button>
                </div>
              )}

              {/* Action Buttons Toolbar */}
              <div className="grid grid-cols-4 gap-2 pt-1">
                {/* 1. Toggle Favorite */}
                <button
                  onClick={() => handleToggleFavorite(selectedPhoto.id)}
                  className={`py-2 px-1 rounded-xl text-xs font-bold transition flex flex-col items-center gap-1 active:scale-95 ${
                    selectedPhoto.isFavorite
                      ? 'bg-amber-400 text-slate-950 font-black'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                >
                  <Star
                    size={16}
                    className={selectedPhoto.isFavorite ? 'fill-slate-950' : 'stroke-white'}
                  />
                  <span className="text-[10px]">
                    {selectedPhoto.isFavorite
                      ? lang === 'gu'
                        ? 'ફેવરિટ ⭐'
                        : 'Favorited'
                      : lang === 'gu'
                      ? 'ફેવરિટ કરો'
                      : 'Favorite'}
                  </span>
                </button>

                {/* 2. Download */}
                <button
                  onClick={() => handleDownloadPhoto(selectedPhoto)}
                  className="py-2 px-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition flex flex-col items-center gap-1 active:scale-95"
                >
                  <Download size={16} />
                  <span className="text-[10px]">{lang === 'gu' ? 'ડાઉનલોડ' : 'Download'}</span>
                </button>

                {/* 3. Share */}
                <button
                  onClick={() => handleSharePhoto(selectedPhoto)}
                  className="py-2 px-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition flex flex-col items-center gap-1 active:scale-95"
                >
                  <Share2 size={16} />
                  <span className="text-[10px]">{lang === 'gu' ? 'શેર કરો' : 'Share'}</span>
                </button>

                {/* 4. Delete */}
                <button
                  onClick={() => handleDeletePhoto(selectedPhoto.id)}
                  className="py-2 px-1 rounded-xl bg-red-600/30 hover:bg-red-600/50 text-red-300 text-xs font-semibold transition flex flex-col items-center gap-1 active:scale-95 border border-red-500/30"
                >
                  <Trash2 size={16} />
                  <span className="text-[10px]">{lang === 'gu' ? 'ડિલીટ' : 'Delete'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PHOTO COLLAGE MAKER MODAL */}
        {isCollageOpen && (
          <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
            <div className="w-full sm:max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-2 bg-white/20 rounded-xl">
                    <Layers size={18} />
                  </span>
                  <div>
                    <h3 className="text-sm font-bold leading-tight">
                      {lang === 'gu' ? '🎨 ફોટો કોલાઝ મેકર' : '🎨 Photo Collage Maker'}
                    </h3>
                    <p className="text-[11px] text-purple-100">
                      {lang === 'gu'
                        ? '૨ થી ૪ ફોટા પસંદ કરી સુંદર કોલાઝ બનાવો'
                        : 'Select 2 to 4 photos to create a collage'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCollageOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/20 text-white transition"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-4 overflow-y-auto space-y-4">
                {/* Step 1: Photo Selector */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {lang === 'gu' ? '૧. ફોટા પસંદ કરો (૨ થી ૪):' : '1. Select photos (2 to 4):'}
                    </span>
                    <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                      {collageSelectedIds.length} / 4 પસંદ
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                    {photos.map((p) => {
                      const isSel = collageSelectedIds.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => handleToggleCollagePhoto(p.id)}
                          className={`aspect-square rounded-xl overflow-hidden relative cursor-pointer border-2 transition ${
                            isSel
                              ? 'border-purple-600 ring-2 ring-purple-400 scale-95'
                              : 'border-transparent opacity-80 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={p.thumbnailUrl || p.dataUrl}
                            alt={p.title}
                            className="w-full h-full object-cover"
                          />
                          {isSel && (
                            <div className="absolute inset-0 bg-purple-600/40 flex items-center justify-center text-white">
                              <CheckCircle2 size={20} className="fill-purple-600 text-white" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2: Choose Layout */}
                {collageSelectedIds.length >= 2 && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                      {lang === 'gu' ? '૨. લેઆઉટ પસંદ કરો:' : '2. Choose layout:'}
                    </span>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {collageSelectedIds.length === 2 && (
                        <>
                          <button
                            type="button"
                            onClick={() => setCollageLayout('split-v')}
                            className={`p-2.5 rounded-xl border font-bold text-center transition ${
                              collageLayout === 'split-v'
                                ? 'bg-purple-100 dark:bg-purple-950 border-purple-500 text-purple-700 dark:text-purple-300'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            Vertical (ડાબે / જમણે)
                          </button>
                          <button
                            type="button"
                            onClick={() => setCollageLayout('split-h')}
                            className={`p-2.5 rounded-xl border font-bold text-center transition ${
                              collageLayout === 'split-h'
                                ? 'bg-purple-100 dark:bg-purple-950 border-purple-500 text-purple-700 dark:text-purple-300'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            Horizontal (ઉપર / નીચે)
                          </button>
                        </>
                      )}

                      {collageSelectedIds.length === 3 && (
                        <>
                          <button
                            type="button"
                            onClick={() => setCollageLayout('1-top-2-bottom')}
                            className={`p-2.5 rounded-xl border font-bold text-center transition ${
                              collageLayout === '1-top-2-bottom'
                                ? 'bg-purple-100 dark:bg-purple-950 border-purple-500 text-purple-700 dark:text-purple-300'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            ૧ ઉપર + ૨ નીચે
                          </button>
                          <button
                            type="button"
                            onClick={() => setCollageLayout('1-left-2-right')}
                            className={`p-2.5 rounded-xl border font-bold text-center transition ${
                              collageLayout === '1-left-2-right'
                                ? 'bg-purple-100 dark:bg-purple-950 border-purple-500 text-purple-700 dark:text-purple-300'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            ૧ ડાબે + ૨ જમણે
                          </button>
                        </>
                      )}

                      {collageSelectedIds.length >= 4 && (
                        <div className="col-span-2 p-2.5 bg-purple-50 dark:bg-purple-950/50 rounded-xl border border-purple-300 dark:border-purple-800 text-center text-xs font-bold text-purple-700 dark:text-purple-300">
                          ૪ ફોટા: ૨ x ૨ ક્લાસિક ગ્રીડ (Classic 4-Grid)
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 3: Frame Border */}
                {collageSelectedIds.length >= 2 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                      {lang === 'gu' ? '૩. ફ્રેમ / બોર્ડર સ્ટાઇલ:' : '3. Frame border style:'}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCollageBorder('white')}
                        className={`flex-1 py-1.5 rounded-xl border text-xs font-bold transition ${
                          collageBorder === 'white'
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        સફેદ બોર્ડર
                      </button>
                      <button
                        type="button"
                        onClick={() => setCollageBorder('dark')}
                        className={`flex-1 py-1.5 rounded-xl border text-xs font-bold transition ${
                          collageBorder === 'dark'
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        ડાર્ક બોર્ડર
                      </button>
                      <button
                        type="button"
                        onClick={() => setCollageBorder('none')}
                        className={`flex-1 py-1.5 rounded-xl border text-xs font-bold transition ${
                          collageBorder === 'none'
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        બોર્ડરલેસ
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="p-3 px-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsCollageOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  {lang === 'gu' ? 'રદ કરો' : 'Cancel'}
                </button>

                <button
                  type="button"
                  onClick={handleGenerateAndSaveCollage}
                  disabled={collageSelectedIds.length < 2 || isGeneratingCollage}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 active:scale-95 transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isGeneratingCollage ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Sparkles size={14} />
                  )}
                  <span>{lang === 'gu' ? 'કોલાઝ સેવ કરો' : 'Save Collage'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
