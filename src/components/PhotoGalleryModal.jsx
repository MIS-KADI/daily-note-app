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
  FileText,
  Frame,
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
  { id: 'normal', nameGu: 'ઓરિજિનલ', nameHi: 'ओरिजिनल', nameEn: 'Original', filter: 'none', icon: '🌟' },
  { id: 'vintage', nameGu: 'વિન્ટેજ', nameHi: 'विंटेज', nameEn: 'Vintage', filter: 'sepia(0.35) contrast(1.15) brightness(0.96) saturate(1.25)', icon: '🎞️' },
  { id: 'bw', nameGu: 'B & W ક્લાસિક', nameHi: 'B&W क्लासिक', nameEn: 'Classic B&W', filter: 'grayscale(1) contrast(1.25) brightness(1.05)', icon: '🖤' },
  { id: 'warm', nameGu: 'વાર્મ ગોલ્ડ', nameHi: 'वार्म गोल्ड', nameEn: 'Warm Gold', filter: 'sepia(0.22) saturate(1.4) brightness(1.06) contrast(1.05)', icon: '🌅' },
  { id: 'cool', nameGu: 'કૂલ બ્લુ', nameHi: 'कूल ब्लू', nameEn: 'Cool Blue', filter: 'hue-rotate(180deg) saturate(0.85) contrast(1.1)', icon: '❄️' },
  { id: 'sepia', nameGu: 'સેપિયા રોયલ', nameHi: 'सेपिया रॉयल', nameEn: 'Sepia Royal', filter: 'sepia(0.85) contrast(1.1) brightness(0.95)', icon: '📜' },
  { id: 'vivid', nameGu: 'વાઇબ્રન્ટ HDR', nameHi: 'वाइब्रेंट HDR', nameEn: 'Vivid HDR', filter: 'saturate(1.8) contrast(1.25) brightness(1.02)', icon: '🎨' },
  { id: 'dramatic', nameGu: 'ડ્રામેટિક', nameHi: 'ड्रामाटिक', nameEn: 'Dramatic', filter: 'contrast(1.45) brightness(0.9) saturate(1.15)', icon: '🎭' },
  { id: 'cinematic', nameGu: 'સિનેમેટિક', nameHi: 'सिनेमैटिक', nameEn: 'Cinematic', filter: 'contrast(1.3) brightness(0.92) saturate(1.2) hue-rotate(-10deg)', icon: '🎬' },
  { id: 'golden_hour', nameGu: 'ગોલ્ડન અવર', nameHi: 'गोल्डन आवर', nameEn: 'Golden Hour', filter: 'sepia(0.3) saturate(1.65) brightness(1.08) contrast(1.06)', icon: '☀️' },
  { id: 'retro_90s', nameGu: 'રેટ્રો 90s', nameHi: 'रेट्रो 90s', nameEn: '90s Retro', filter: 'contrast(1.2) brightness(1.1) saturate(1.3) sepia(0.18)', icon: '📻' },
  { id: 'noir', nameGu: 'નોઈર ડાર્ક', nameHi: 'नोइर डार्क', nameEn: 'Noir Dark', filter: 'grayscale(1) contrast(1.8) brightness(0.85)', icon: '🕵️' },
  { id: 'pastel', nameGu: 'પેસ્ટલ સોફ્ટ', nameHi: 'पेस्टल सॉफ्ट', nameEn: 'Pastel Soft', filter: 'brightness(1.15) saturate(0.82) contrast(0.95)', icon: '🌸' },
  { id: 'cyberpunk', nameGu: 'સાયબરપંક', nameHi: 'साइबरपंक', nameEn: 'Cyberpunk', filter: 'hue-rotate(90deg) contrast(1.4) saturate(1.8)', icon: '⚡' },
  { id: 'forest', nameGu: 'ફોરેસ્ટ ગ્રીન', nameHi: 'फ़ॉरेस्ट ग्रीन', nameEn: 'Forest Green', filter: 'hue-rotate(-25deg) saturate(1.3) contrast(1.1) brightness(0.95)', icon: '🌲' },
  { id: 'sunset', nameGu: 'સનસેટ ગ્લો', nameHi: 'सनसेट ग्लो', nameEn: 'Sunset Glow', filter: 'sepia(0.4) saturate(2) hue-rotate(-15deg) contrast(1.15)', icon: '🌆' },
  { id: 'high_key', nameGu: 'હાઈ કી બ્રાઇટ', nameHi: 'हाई की ब्राइट', nameEn: 'High Key', filter: 'brightness(1.28) contrast(1.1) saturate(1.1)', icon: '✨' },
  { id: 'matte', nameGu: 'મેટ મોર્ડન', nameHi: 'मैट मॉडर्न', nameEn: 'Matte Modern', filter: 'contrast(0.88) brightness(1.08) saturate(1.12)', icon: '🕶️' },
];

const PHOTO_FRAMES = [
  { id: 'none', nameGu: 'કોઈ ફ્રેમ નહિ', nameHi: 'कोई फ्रेम नहीं', nameEn: 'No Frame', icon: '🚫' },
  { id: 'polaroid', nameGu: 'પોલરોઇડ', nameHi: 'पोलरॉइड', nameEn: 'Polaroid', icon: '📷', styleClass: 'p-3 pb-8 bg-white text-slate-900 shadow-2xl rounded-sm' },
  { id: 'royal_gold', nameGu: 'રોયલ ગોલ્ડન', nameHi: 'रॉयल गोल्डन', nameEn: 'Royal Gold', icon: '👑', styleClass: 'p-3 bg-amber-400/20 border-4 border-amber-400 shadow-amber-400/40 rounded-xl' },
  { id: 'neon_glow', nameGu: 'નિયોન ગ્લો', nameHi: 'नियॉन ग्लो', nameEn: 'Neon Glow', icon: '✨', styleClass: 'p-2.5 border-4 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.7)] rounded-xl' },
  { id: 'filmstrip', nameGu: 'ફિલ્મસ્ટ્રીપ', nameHi: 'फिल्मस्ट्रिप', nameEn: 'Filmstrip', icon: '🎞️', styleClass: 'p-3 py-6 bg-slate-950 border-y-4 border-dashed border-white/60 shadow-xl' },
  { id: 'vintage_wood', nameGu: 'વુડન ફ્રેમ', nameHi: 'वुडन फ्रेम', nameEn: 'Wooden Frame', icon: '🪵', styleClass: 'p-3.5 bg-amber-900/40 border-8 border-amber-800 shadow-2xl rounded-lg' },
  { id: 'floral', nameGu: 'રોઝ પેસ્ટલ', nameHi: 'रोज़ पेस्टल', nameEn: 'Rose Pastel', icon: '🌹', styleClass: 'p-3 bg-rose-100 dark:bg-rose-950/60 border-4 border-rose-300 dark:border-rose-600 rounded-2xl shadow-lg' },
  { id: 'minimal_black', nameGu: 'મેટ બ્લેક', nameHi: 'मैट ब्लैक', nameEn: 'Matte Black', icon: '⬛', styleClass: 'p-3 bg-black border-2 border-white/40 shadow-2xl rounded-xl' },
];

export default function PhotoGalleryModal({ isOpen, onClose, lang = 'gu', onOpenPdfScanner }) {
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

  // Filters & Frames State
  const [activeFilterId, setActiveFilterId] = useState('normal');
  const [activeFrameId, setActiveFrameId] = useState('none');
  const [isFilterBarOpen, setIsFilterBarOpen] = useState(false);
  const [isFrameBarOpen, setIsFrameBarOpen] = useState(false);
  const [isSavingFilter, setIsSavingFilter] = useState(false);

  // Collage Maker States (Up to 6 photos)
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

  // Save Filtered and Framed Photo Copy
  const handleSaveFilteredCopy = async () => {
    if (!selectedPhoto || (activeFilterId === 'normal' && activeFrameId === 'none')) return;
    setIsSavingFilter(true);
    try {
      const filterObj = PHOTO_FILTERS.find((f) => f.id === activeFilterId);
      const frameObj = PHOTO_FRAMES.find((f) => f.id === activeFrameId);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = selectedPhoto.dataUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const origW = img.naturalWidth || img.width;
      const origH = img.naturalHeight || img.height;

      // 1. Render filtered image onto an offscreen canvas
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = origW;
      tempCanvas.height = origH;
      const tempCtx = tempCanvas.getContext('2d');
      if (filterObj && filterObj.filter !== 'none') {
        tempCtx.filter = filterObj.filter;
      }
      tempCtx.drawImage(img, 0, 0, origW, origH);

      // 2. Render final canvas with decorative frame
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!frameObj || frameObj.id === 'none') {
        canvas.width = origW;
        canvas.height = origH;
        ctx.drawImage(tempCanvas, 0, 0);
      } else if (frameObj.id === 'polaroid') {
        const padX = Math.round(origW * 0.06);
        const padTop = Math.round(origH * 0.06);
        const padBottom = Math.round(origH * 0.18);
        canvas.width = origW + (padX * 2);
        canvas.height = origH + padTop + padBottom;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, padX, padTop, origW, origH);
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.strokeRect(padX, padTop, origW, origH);
        ctx.fillStyle = '#334155';
        ctx.font = `bold ${Math.max(16, Math.round(canvas.width * 0.035))}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(selectedPhoto.title || 'યાદગાર પળ', canvas.width / 2, origH + padTop + (padBottom * 0.65));
      } else if (frameObj.id === 'royal_gold') {
        const borderW = Math.round(origW * 0.045);
        canvas.width = origW + (borderW * 2);
        canvas.height = origH + (borderW * 2);
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, '#f59e0b');
        grad.addColorStop(0.3, '#fef08a');
        grad.addColorStop(0.6, '#b45309');
        grad.addColorStop(1, '#d97706');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const inset = Math.round(borderW * 0.28);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(inset, inset, canvas.width - (inset * 2), canvas.height - (inset * 2));
        ctx.drawImage(tempCanvas, borderW, borderW, origW, origH);
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = Math.max(2, Math.round(borderW * 0.12));
        ctx.strokeRect(borderW - 2, borderW - 2, origW + 4, origH + 4);
      } else if (frameObj.id === 'neon_glow') {
        const borderW = Math.round(origW * 0.04);
        canvas.width = origW + (borderW * 2);
        canvas.height = origH + (borderW * 2);
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, borderW, borderW, origW, origH);
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = Math.round(borderW * 1.5);
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = Math.max(3, Math.round(borderW * 0.3));
        ctx.strokeRect(borderW / 2, borderW / 2, canvas.width - borderW, canvas.height - borderW);
        ctx.shadowBlur = 0;
      } else if (frameObj.id === 'filmstrip') {
        const padX = Math.round(origW * 0.035);
        const padY = Math.round(origH * 0.1);
        canvas.width = origW + (padX * 2);
        canvas.height = origH + (padY * 2);
        ctx.fillStyle = '#020617';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, padX, padY, origW, origH);
        const numHoles = 14;
        const holeW = (canvas.width / numHoles) * 0.45;
        const holeH = padY * 0.4;
        ctx.fillStyle = '#f8fafc';
        for (let i = 0; i < numHoles; i++) {
          const hX = (i * (canvas.width / numHoles)) + (canvas.width / numHoles * 0.25);
          ctx.fillRect(hX, padY * 0.25, holeW, holeH);
          ctx.fillRect(hX, canvas.height - padY * 0.65, holeW, holeH);
        }
      } else if (frameObj.id === 'vintage_wood') {
        const borderW = Math.round(origW * 0.055);
        canvas.width = origW + (borderW * 2);
        canvas.height = origH + (borderW * 2);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const innerPad = Math.round(borderW * 0.35);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(innerPad, innerPad, canvas.width - (innerPad * 2), canvas.height - (innerPad * 2));
        ctx.drawImage(tempCanvas, borderW, borderW, origW, origH);
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = Math.max(2, Math.round(borderW * 0.1));
        ctx.strokeRect(innerPad, innerPad, canvas.width - (innerPad * 2), canvas.height - (innerPad * 2));
      } else if (frameObj.id === 'floral') {
        const borderW = Math.round(origW * 0.045);
        canvas.width = origW + (borderW * 2);
        canvas.height = origH + (borderW * 2);
        ctx.fillStyle = '#ffe4e6';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, borderW, borderW, origW, origH);
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = Math.max(2, Math.round(borderW * 0.15));
        ctx.strokeRect(borderW / 2, borderW / 2, canvas.width - borderW, canvas.height - borderW);
      } else if (frameObj.id === 'minimal_black') {
        const borderW = Math.round(origW * 0.035);
        canvas.width = origW + (borderW * 2);
        canvas.height = origH + (borderW * 2);
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempCanvas, borderW, borderW, origW, origH);
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1;
        ctx.strokeRect(borderW - 1, borderW - 1, origW + 2, origH + 2);
      }

      const filteredDataUrl = canvas.toDataURL('image/jpeg', 0.88);

      // Create thumbnail
      const thumbCanvas = document.createElement('canvas');
      const thumbW = 240;
      const thumbH = Math.round((canvas.height * thumbW) / canvas.width);
      thumbCanvas.width = thumbW;
      thumbCanvas.height = thumbH;
      const tCtx = thumbCanvas.getContext('2d');
      tCtx.drawImage(canvas, 0, 0, thumbW, thumbH);
      const filteredThumbUrl = thumbCanvas.toDataURL('image/jpeg', 0.72);

      const titleSuffix = [
        filterObj?.id !== 'normal' ? filterObj?.nameGu : '',
        frameObj?.id !== 'none' ? frameObj?.nameGu : '',
      ].filter(Boolean).join(' + ');

      const newPhoto = await photoStorageService.addPhoto({
        title: `${selectedPhoto.title || 'તસવીર'} ${titleSuffix ? `(${titleSuffix})` : ''}`,
        category: selectedPhoto.category || 'personal',
        dataUrl: filteredDataUrl,
        thumbnailUrl: filteredThumbUrl,
        fileSize: `${Math.round((filteredDataUrl.length * 0.75) / 1024)} KB`,
        originalName: `edit_${Date.now()}.jpg`,
        isFavorite: selectedPhoto.isFavorite,
        date: new Date().toISOString().split('T')[0],
      });

      await loadPhotos();
      setSelectedPhoto(newPhoto);
      setActiveFilterId('normal');
      setActiveFrameId('none');
      setIsFilterBarOpen(false);
      setIsFrameBarOpen(false);
      confetti({ particleCount: 30, spread: 55, origin: { y: 0.6 } });
      showNotice(
        lang === 'gu'
          ? '✅ ફિલ્ટર & ફ્રેમ સાથે નવો ફોટો ગેલેરીમાં સાચવવામાં આવ્યો!'
          : lang === 'hi'
          ? '✅ फ़िल्टर और फ़्रेम के साथ नया फ़ोटो गैलरी में सहेजा गया!'
          : '✅ Styled photo saved to gallery!'
      );
    } catch (err) {
      console.error('Save filtered photo error:', err);
      showNotice(
        lang === 'gu' ? '❌ ફોટો સેવ કરવામાં ક્ષતિ આવી.' : '❌ Failed to save styled photo.'
      );
    } finally {
      setIsSavingFilter(false);
    }
  };

  // Toggle selection for collage (Up to 6 photos)
  const handleToggleCollagePhoto = (id) => {
    if (collageSelectedIds.includes(id)) {
      setCollageSelectedIds((prev) => prev.filter((x) => x !== id));
    } else {
      if (collageSelectedIds.length >= 6) {
        showNotice(
          lang === 'gu'
            ? 'કોલાઝ માટે વધુમાં વધુ ૬ ફોટા પસંદ કરી શકાય છે.'
            : lang === 'hi'
            ? 'कोलाज के लिए अधिकतम ६ फ़ोटो चुने जा सकते हैं।'
            : 'Maximum 6 photos can be selected for collage.'
        );
        return;
      }
      setCollageSelectedIds((prev) => [...prev, id]);
    }
  };

  // Generate & Save Photo Collage (2 to 6 photos)
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

      const bgColor = collageBorder === 'dark' ? '#0f172a' : collageBorder === 'gold' ? '#d4af37' : collageBorder === 'white' ? '#ffffff' : '#000000';
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
        } else if (collageLayout === '3-cols') {
          const thirdW = (size - 2 * pad - 2 * gap) / 3;
          drawCover(loadedImgs[0], pad, pad, thirdW, size - 2 * pad);
          drawCover(loadedImgs[1], pad + thirdW + gap, pad, thirdW, size - 2 * pad);
          drawCover(loadedImgs[2], pad + 2 * (thirdW + gap), pad, thirdW, size - 2 * pad);
        } else {
          const halfH = (size - 2 * pad - gap) / 2;
          const halfW = (size - 2 * pad - gap) / 2;
          drawCover(loadedImgs[0], pad, pad, size - 2 * pad, halfH);
          drawCover(loadedImgs[1], pad, pad + halfH + gap, halfW, halfH);
          drawCover(loadedImgs[2], pad + halfW + gap, pad + halfH + gap, halfW, halfH);
        }
      } else if (count === 4) {
        if (collageLayout === '1-left-3-right') {
          const leftW = Math.round((size - 2 * pad - gap) * 0.6);
          const rightW = size - 2 * pad - gap - leftW;
          const rightH = (size - 2 * pad - 2 * gap) / 3;
          drawCover(loadedImgs[0], pad, pad, leftW, size - 2 * pad);
          drawCover(loadedImgs[1], pad + leftW + gap, pad, rightW, rightH);
          drawCover(loadedImgs[2], pad + leftW + gap, pad + rightH + gap, rightW, rightH);
          drawCover(loadedImgs[3], pad + leftW + gap, pad + 2 * (rightH + gap), rightW, rightH);
        } else {
          const cell = (size - 2 * pad - gap) / 2;
          drawCover(loadedImgs[0], pad, pad, cell, cell);
          drawCover(loadedImgs[1], pad + cell + gap, pad, cell, cell);
          drawCover(loadedImgs[2], pad, pad + cell + gap, cell, cell);
          drawCover(loadedImgs[3], pad + cell + gap, pad + cell + gap, cell, cell);
        }
      } else if (count === 5) {
        if (collageLayout === '1-top-4-grid') {
          const topH = Math.round((size - 2 * pad - gap) * 0.45);
          const botH = size - 2 * pad - gap - topH;
          const cellW = (size - 2 * pad - gap) / 2;
          const cellH = (botH - gap) / 2;
          drawCover(loadedImgs[0], pad, pad, size - 2 * pad, topH);
          drawCover(loadedImgs[1], pad, pad + topH + gap, cellW, cellH);
          drawCover(loadedImgs[2], pad + cellW + gap, pad + topH + gap, cellW, cellH);
          drawCover(loadedImgs[3], pad, pad + topH + gap + cellH + gap, cellW, cellH);
          drawCover(loadedImgs[4], pad + cellW + gap, pad + topH + gap + cellH + gap, cellW, cellH);
        } else {
          // 2 Top + 3 Bottom
          const halfH = (size - 2 * pad - gap) / 2;
          const topW = (size - 2 * pad - gap) / 2;
          const botW = (size - 2 * pad - 2 * gap) / 3;
          drawCover(loadedImgs[0], pad, pad, topW, halfH);
          drawCover(loadedImgs[1], pad + topW + gap, pad, topW, halfH);
          drawCover(loadedImgs[2], pad, pad + halfH + gap, botW, halfH);
          drawCover(loadedImgs[3], pad + botW + gap, pad + halfH + gap, botW, halfH);
          drawCover(loadedImgs[4], pad + 2 * (botW + gap), pad + halfH + gap, botW, halfH);
        }
      } else if (count >= 6) {
        if (collageLayout === 'grid-3x2') {
          // 3 rows x 2 cols
          const cellW = (size - 2 * pad - gap) / 2;
          const cellH = (size - 2 * pad - 2 * gap) / 3;
          drawCover(loadedImgs[0], pad, pad, cellW, cellH);
          drawCover(loadedImgs[1], pad + cellW + gap, pad, cellW, cellH);
          drawCover(loadedImgs[2], pad, pad + cellH + gap, cellW, cellH);
          drawCover(loadedImgs[3], pad + cellW + gap, pad + cellH + gap, cellW, cellH);
          drawCover(loadedImgs[4], pad, pad + 2 * (cellH + gap), cellW, cellH);
          drawCover(loadedImgs[5], pad + cellW + gap, pad + 2 * (cellH + gap), cellW, cellH);
        } else {
          // 2 rows x 3 cols (grid-2x3 default)
          const cellW = (size - 2 * pad - 2 * gap) / 3;
          const cellH = (size - 2 * pad - gap) / 2;
          drawCover(loadedImgs[0], pad, pad, cellW, cellH);
          drawCover(loadedImgs[1], pad + cellW + gap, pad, cellW, cellH);
          drawCover(loadedImgs[2], pad + 2 * (cellW + gap), pad, cellW, cellH);
          drawCover(loadedImgs[3], pad, pad + cellH + gap, cellW, cellH);
          drawCover(loadedImgs[4], pad + cellW + gap, pad + cellH + gap, cellW, cellH);
          drawCover(loadedImgs[5], pad + 2 * (cellW + gap), pad + cellH + gap, cellW, cellH);
        }
      }

      const collageDataUrl = canvas.toDataURL('image/jpeg', 0.88);

      // Thumbnail
      const thumbCanvas = document.createElement('canvas');
      thumbCanvas.width = 240;
      thumbCanvas.height = 240;
      const tCtx = thumbCanvas.getContext('2d');
      tCtx.drawImage(canvas, 0, 0, 240, 240);
      const collageThumbUrl = thumbCanvas.toDataURL('image/jpeg', 0.72);

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
          : lang === 'hi'
          ? '🎉 नया कोलाज सफलतापूर्वक बना और गैलरी में सहेजा गया!'
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
  const activeFrameObj = PHOTO_FRAMES.find((f) => f.id === activeFrameId) || PHOTO_FRAMES[0];

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
                🌐 ક્લાઉડ સિંક
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* PDF Document Scanner Button */}
              {onOpenPdfScanner && (
                <button
                  onClick={onOpenPdfScanner}
                  className="px-2.5 py-1 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-[11px] shadow-sm transition active:scale-95 flex items-center gap-1 border border-white/20"
                  title="PDF Scanner & Photo to PDF"
                >
                  <FileText size={12} />
                  <span>{lang === 'gu' ? 'PDF સ્કેનર' : lang === 'hi' ? 'PDF स्कैनर' : 'PDF Scan'}</span>
                </button>
              )}

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
                    ? `સ્ટોરેજ: ${stats.mbUsed} • ફોટો સુરક્ષિત અને ક્લાઉડ બેકઅપ માટે સિંક`
                    : lang === 'hi'
                    ? `स्टोरेज: ${stats.mbUsed} • फ़ोटो सुरक्षित और क्लाउड बैकअप के लिए सिंक`
                    : `Storage: ${stats.mbUsed} • Photos secure & synced for cloud backup`}
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

        {/* FULLSCREEN LIGHTBOX WITH PHOTO FILTERS, FRAMES & DETAILS */}
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
                  onClick={() => {
                    setIsFilterBarOpen(!isFilterBarOpen);
                    setIsFrameBarOpen(false);
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                    isFilterBarOpen
                      ? 'bg-purple-600 text-white shadow-sm'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                  title="Photo Filters"
                >
                  <Sliders size={14} />
                  <span>{lang === 'gu' ? 'ફિલ્ટર્સ' : lang === 'hi' ? 'फ़िल्टर्स' : 'Filters'}</span>
                </button>

                {/* Frame Toggle Button */}
                <button
                  onClick={() => {
                    setIsFrameBarOpen(!isFrameBarOpen);
                    setIsFilterBarOpen(false);
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                    isFrameBarOpen
                      ? 'bg-amber-500 text-slate-950 font-black shadow-sm'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                  title="Photo Frames"
                >
                  <Frame size={14} />
                  <span>{lang === 'gu' ? 'ફ્રેમ્સ' : lang === 'hi' ? 'फ़्रेम्स' : 'Frames'}</span>
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
                      <span>{lang === 'hi' ? f.nameHi : lang === 'en' ? f.nameEn : f.nameGu}</span>
                    </button>
                  ))}
                </div>

                {(activeFilterId !== 'normal' || activeFrameId !== 'none') && (
                  <button
                    onClick={handleSaveFilteredCopy}
                    disabled={isSavingFilter}
                    className="px-3 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold shrink-0 shadow-md flex items-center gap-1 active:scale-95"
                  >
                    {isSavingFilter ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    <span>{lang === 'gu' ? 'સેવ કરો' : 'Save'}</span>
                  </button>
                )}
              </div>
            )}

            {/* Frame Selector Bar (Expandable) */}
            {isFrameBarOpen && (
              <div className="bg-slate-900/90 border-b border-white/20 p-2.5 px-3 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none shrink-0 animate-in slide-in-from-top-1">
                <div className="flex items-center gap-1.5">
                  {PHOTO_FRAMES.map((frm) => (
                    <button
                      key={frm.id}
                      onClick={() => setActiveFrameId(frm.id)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition active:scale-95 flex items-center gap-1 ${
                        activeFrameId === frm.id
                          ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                          : 'bg-white/10 hover:bg-white/20 text-slate-200'
                      }`}
                    >
                      <span>{frm.icon}</span>
                      <span>{lang === 'hi' ? frm.nameHi : lang === 'en' ? frm.nameEn : frm.nameGu}</span>
                    </button>
                  ))}
                </div>

                {(activeFrameId !== 'none' || activeFilterId !== 'normal') && (
                  <button
                    onClick={handleSaveFilteredCopy}
                    disabled={isSavingFilter}
                    className="px-3 py-1 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold shrink-0 shadow-md flex items-center gap-1 active:scale-95"
                  >
                    {isSavingFilter ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    <span>{lang === 'gu' ? 'સેવ કરો' : 'Save'}</span>
                  </button>
                )}
              </div>
            )}

            {/* Lightbox Center Image View with Nav Arrows */}
            <div className="flex-1 relative flex items-center justify-center p-3 sm:p-5 overflow-hidden select-none">
              <div
                className={`transition-all duration-200 max-h-full max-w-full flex flex-col items-center justify-center ${
                  activeFrameObj && activeFrameObj.id !== 'none' ? activeFrameObj.styleClass : ''
                }`}
              >
                <img
                  src={selectedPhoto.dataUrl}
                  alt={selectedPhoto.title}
                  style={{
                    filter: activeFilterObj.filter !== 'none' ? activeFilterObj.filter : undefined,
                  }}
                  className="max-h-[62vh] max-w-full object-contain rounded-sm shadow-2xl transition duration-200"
                />
                {activeFrameId === 'polaroid' && (
                  <p className="text-center font-bold text-slate-800 text-xs mt-2 tracking-wide font-serif truncate max-w-xs">
                    {selectedPhoto.title || (lang === 'gu' ? 'યાદગાર પળ' : 'Sweet Memory')}
                  </p>
                )}
              </div>

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

              {/* Action Buttons Toolbar (5 Action Buttons) */}
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2 pt-1">
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
                  <span className="text-[10px] truncate max-w-full">
                    {selectedPhoto.isFavorite
                      ? lang === 'gu'
                        ? 'ફેવરિટ ⭐'
                        : 'Favorited'
                      : lang === 'gu'
                      ? 'ફેવરિટ'
                      : 'Favorite'}
                  </span>
                </button>

                {/* 2. Download */}
                <button
                  onClick={() => handleDownloadPhoto(selectedPhoto)}
                  className="py-2 px-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition flex flex-col items-center gap-1 active:scale-95"
                >
                  <Download size={16} />
                  <span className="text-[10px] truncate">{lang === 'gu' ? 'ડાઉનલોડ' : 'Download'}</span>
                </button>

                {/* 3. Share */}
                <button
                  onClick={() => handleSharePhoto(selectedPhoto)}
                  className="py-2 px-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition flex flex-col items-center gap-1 active:scale-95"
                >
                  <Share2 size={16} />
                  <span className="text-[10px] truncate">{lang === 'gu' ? 'શેર કરો' : 'Share'}</span>
                </button>

                {/* 4. PDF Document Scanner / Photo to PDF */}
                <button
                  onClick={() => {
                    if (onOpenPdfScanner) onOpenPdfScanner();
                  }}
                  className="py-2 px-1 rounded-xl bg-rose-500/30 hover:bg-rose-500/50 text-rose-200 text-xs font-semibold transition flex flex-col items-center gap-1 active:scale-95 border border-rose-500/30"
                  title="Photo to PDF"
                >
                  <FileText size={16} />
                  <span className="text-[10px] truncate">{lang === 'gu' ? 'PDF બનાવો' : lang === 'hi' ? 'PDF बनाएं' : 'To PDF'}</span>
                </button>

                {/* 5. Delete */}
                <button
                  onClick={() => handleDeletePhoto(selectedPhoto.id)}
                  className="py-2 px-1 rounded-xl bg-red-600/30 hover:bg-red-600/50 text-red-300 text-xs font-semibold transition flex flex-col items-center gap-1 active:scale-95 border border-red-500/30"
                >
                  <Trash2 size={16} />
                  <span className="text-[10px] truncate">{lang === 'gu' ? 'ડિલીટ' : 'Delete'}</span>
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
                        ? '૨ થી ૬ ફોટા પસંદ કરી સુંદર કોલાઝ બનાવો'
                        : lang === 'hi'
                        ? '२ से ६ फ़ोटो चुनकर आकर्षक कोलाज बनाएं'
                        : 'Select 2 to 6 photos to create a collage'}
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
                      {lang === 'gu' ? '૧. ફોટા પસંદ કરો (૨ થી ૬):' : lang === 'hi' ? '१. फ़ोटो चुनें (२ से ६):' : '1. Select photos (2 to 6):'}
                    </span>
                    <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400">
                      {collageSelectedIds.length} / 6 {lang === 'gu' ? 'પસંદ' : lang === 'hi' ? 'चयनित' : 'selected'}
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
                      {lang === 'gu' ? '૨. લેઆઉટ પસંદ કરો:' : lang === 'hi' ? '२. लेआउट चुनें:' : '2. Choose layout:'}
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
                          <button
                            type="button"
                            onClick={() => setCollageLayout('3-cols')}
                            className={`col-span-2 p-2.5 rounded-xl border font-bold text-center transition ${
                              collageLayout === '3-cols'
                                ? 'bg-purple-100 dark:bg-purple-950 border-purple-500 text-purple-700 dark:text-purple-300'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            ૩ સ્તંભ (3 Columns)
                          </button>
                        </>
                      )}

                      {collageSelectedIds.length === 4 && (
                        <>
                          <button
                            type="button"
                            onClick={() => setCollageLayout('grid-4')}
                            className={`p-2.5 rounded-xl border font-bold text-center transition ${
                              collageLayout === 'grid-4' || collageLayout === 'grid'
                                ? 'bg-purple-100 dark:bg-purple-950 border-purple-500 text-purple-700 dark:text-purple-300'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            ૨ x ૨ ક્લાસિક ગ્રીડ
                          </button>
                          <button
                            type="button"
                            onClick={() => setCollageLayout('1-left-3-right')}
                            className={`p-2.5 rounded-xl border font-bold text-center transition ${
                              collageLayout === '1-left-3-right'
                                ? 'bg-purple-100 dark:bg-purple-950 border-purple-500 text-purple-700 dark:text-purple-300'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            ૧ મોટો + ૩ સ્ટેક
                          </button>
                        </>
                      )}

                      {collageSelectedIds.length === 5 && (
                        <>
                          <button
                            type="button"
                            onClick={() => setCollageLayout('2-top-3-bottom')}
                            className={`p-2.5 rounded-xl border font-bold text-center transition ${
                              collageLayout === '2-top-3-bottom'
                                ? 'bg-purple-100 dark:bg-purple-950 border-purple-500 text-purple-700 dark:text-purple-300'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            ૨ ઉપર + ૩ નીચે
                          </button>
                          <button
                            type="button"
                            onClick={() => setCollageLayout('1-top-4-grid')}
                            className={`p-2.5 rounded-xl border font-bold text-center transition ${
                              collageLayout === '1-top-4-grid'
                                ? 'bg-purple-100 dark:bg-purple-950 border-purple-500 text-purple-700 dark:text-purple-300'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            ૧ હીરો + ૪ ગ્રીડ
                          </button>
                        </>
                      )}

                      {collageSelectedIds.length >= 6 && (
                        <>
                          <button
                            type="button"
                            onClick={() => setCollageLayout('grid-2x3')}
                            className={`p-2.5 rounded-xl border font-bold text-center transition ${
                              collageLayout === 'grid-2x3'
                                ? 'bg-purple-100 dark:bg-purple-950 border-purple-500 text-purple-700 dark:text-purple-300'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            ૨ હરોળ x ૩ સ્તંભ (2x3)
                          </button>
                          <button
                            type="button"
                            onClick={() => setCollageLayout('grid-3x2')}
                            className={`p-2.5 rounded-xl border font-bold text-center transition ${
                              collageLayout === 'grid-3x2'
                                ? 'bg-purple-100 dark:bg-purple-950 border-purple-500 text-purple-700 dark:text-purple-300'
                                : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            ૩ હરોળ x ૨ સ્તંભ (3x2)
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 3: Frame Border */}
                {collageSelectedIds.length >= 2 && (
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
                      {lang === 'gu' ? '૩. ફ્રેમ / બોર્ડર સ્ટાઇલ:' : lang === 'hi' ? '३. फ़्रेम / बॉर्डर स्टाइल:' : '3. Frame border style:'}
                    </span>

                    <div className="grid grid-cols-4 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setCollageBorder('white')}
                        className={`py-1.5 rounded-xl border text-[11px] font-bold transition ${
                          collageBorder === 'white'
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {lang === 'gu' ? 'સફેદ' : lang === 'hi' ? 'सफ़ेद' : 'White'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCollageBorder('dark')}
                        className={`py-1.5 rounded-xl border text-[11px] font-bold transition ${
                          collageBorder === 'dark'
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {lang === 'gu' ? 'ડાર્ક' : lang === 'hi' ? 'डार्क' : 'Dark'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCollageBorder('gold')}
                        className={`py-1.5 rounded-xl border text-[11px] font-bold transition ${
                          collageBorder === 'gold'
                            ? 'bg-amber-500 text-slate-950 font-black border-amber-400'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {lang === 'gu' ? 'ગોલ્ડ' : lang === 'hi' ? 'गोल्ड' : 'Gold'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setCollageBorder('none')}
                        className={`py-1.5 rounded-xl border text-[11px] font-bold transition ${
                          collageBorder === 'none'
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {lang === 'gu' ? 'બોર્ડરલેસ' : lang === 'hi' ? 'नो बॉर्डर' : 'None'}
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
