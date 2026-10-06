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
  { id: 'family', labelGu: '👨‍👩‍👧 પરિવાર', labelEn: 'Family', icon: '👨‍👩‍👧' },
  { id: 'travel', labelGu: '✈️ પ્રવાસ', labelEn: 'Travel', icon: '✈️' },
  { id: 'events', labelGu: '🎂 પ્રસંગો', labelEn: 'Events', icon: '🎂' },
  { id: 'personal', labelGu: '🌸 પર્સનલ', labelEn: 'Personal', icon: '🌸' },
  { id: 'documents', labelGu: '📄 દસ્તાવેજ', labelEn: 'Docs', icon: '📄' },
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
  const [editCategory, setEditCategory] = useState('family');
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState({ totalCount: 0, favoriteCount: 0, mbUsed: '0 MB' });
  const [notice, setNotice] = useState('');

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

  // Open safe photo picker after requesting permissions
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
        const defaultCategory =
          activeCategory === 'all' || activeCategory === 'favorites' ? 'family' : activeCategory;

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
    setEditCategory(photo.category || 'family');
    setIsEditing(false);
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
    setEditCategory(nextPhoto.category || 'family');
    setIsEditing(false);
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

  // Filtered photos
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl h-[92vh] max-h-[820px] rounded-3xl shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800 overflow-hidden relative">
        
        {/* Top Header */}
        <div className="p-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shrink-0 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-xs border border-white/20">
                📸
              </div>
              <div>
                <h2 className="text-base font-bold flex items-center gap-1.5 leading-tight">
                  {lang === 'gu' ? 'મારી યાદગાર ફોટો ગેલેરી' : 'Favorite Photo Gallery'}
                </h2>
                <p className="text-[11px] text-blue-100 flex items-center gap-1.5 mt-0.5">
                  <span>
                    {stats.totalCount} {lang === 'gu' ? 'તસવીરો' : 'photos'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5 text-amber-300 font-bold">
                    <Star size={11} className="fill-amber-300" />
                    {stats.favoriteCount} {lang === 'gu' ? 'ફેવરિટ' : 'favorites'}
                  </span>
                  <span>•</span>
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-md font-semibold flex items-center gap-1">
                    <ShieldCheck size={10} />
                    ૧૦૦% ઓફલાઇન સુરક્ષિત
                  </span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Vault PIN/Fingerprint Lock Toggle */}
              <button
                onClick={handleToggleVaultLock}
                title={isVaultLocked ? 'વોલ્ટ લૉક સક્રિય છે' : 'વોલ્ટ લૉક બંધ છે'}
                className={`p-2 rounded-xl border transition active:scale-95 flex items-center gap-1 text-xs font-bold ${
                  isVaultLocked
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-xs'
                    : 'bg-white/20 hover:bg-white/30 text-white border-white/20'
                }`}
              >
                {isVaultLocked ? <Lock size={15} /> : <Unlock size={15} />}
                <span className="text-[10px] hidden sm:inline">
                  {isVaultLocked ? 'લૉક' : 'અનલૉક'}
                </span>
              </button>

              {/* Add Photo Button in Header */}
              <button
                onClick={handleOpenPhotoPicker}
                disabled={uploading}
                className="px-3 py-1.5 rounded-xl bg-white text-indigo-700 hover:bg-blue-50 font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-1.5"
              >
                {uploading ? (
                  <Loader2 size={14} className="animate-spin text-indigo-600" />
                ) : (
                  <Plus size={15} className="stroke-[2.5]" />
                )}
                <span>{lang === 'gu' ? 'ફોટો ઉમેરો' : 'Add Photo'}</span>
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl bg-black/20 hover:bg-black/30 text-white transition active:scale-95"
              >
                <X size={18} />
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

        {/* VAULT SECURITY LOCK SCREEN (When Vault is Locked) */}
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
                <p className="text-xs font-bold text-red-600 dark:text-red-400 animate-in fade-in">
                  {pinError}
                </p>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md active:scale-95 transition"
                >
                  {lang === 'gu' ? 'PIN થી અનલૉક કરો' : 'Unlock with PIN'}
                </button>

                {user?.isBiometricEnabled && (
                  <button
                    type="button"
                    onClick={handleVerifyBiometric}
                    disabled={isBiometricTesting}
                    className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 active:scale-95 transition"
                    title="Fingerprint Unlock"
                  >
                    <Fingerprint size={20} className="text-blue-600 dark:text-blue-400" />
                  </button>
                )}
              </div>
            </form>

            <div className="pt-2">
              <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <ShieldCheck size={12} className="text-emerald-500" />
                ૧૦૦% સુરક્ષિત લોકલ એન્ક્રિપ્શન
              </span>
            </div>
          </div>
        ) : (
          <>
            {/* Search & Category Filter Toolbar */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 space-y-2.5 shrink-0">
              {/* Search Box */}
              <div className="relative">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    lang === 'gu'
                      ? 'તસવીરનું નામ કે તારીખ શોધો...'
                      : 'Search by photo title or date...'
                  }
                  className="w-full pl-9 pr-8 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Category Chips - Scrollable */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
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
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition active:scale-95 flex items-center gap-1 border shrink-0 ${
                        isActive
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      <span>{lang === 'gu' ? cat.labelGu : cat.labelEn}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                          isActive
                            ? 'bg-white/25 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Photos Grid Area */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-400">
                  <Loader2 size={28} className="animate-spin text-blue-600" />
                  <p className="text-xs">
                    {lang === 'gu' ? 'તસવીરો લોડ થઈ રહી છે...' : 'Loading photos...'}
                  </p>
                </div>
              ) : filteredPhotos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 flex items-center justify-center text-3xl shadow-xs mb-3">
                    {activeCategory === 'favorites' ? '⭐' : '🖼️'}
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {activeCategory === 'favorites'
                      ? lang === 'gu'
                        ? 'હજુ કોઈ ફેવરિટ ફોટો પસંદ કરેલ નથી'
                        : 'No favorite photos yet'
                      : lang === 'gu'
                      ? 'કોઈ ફોટો મળ્યો નથી'
                      : 'No photos found'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mt-1 leading-relaxed">
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
                            {photo.category}
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

        {/* Full-Screen High-Res Lightbox Modal */}
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
                  {selectedPhoto.category}
                </span>
              </div>

              <div className="flex items-center gap-2">
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
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Lightbox Center Image View with Nav Arrows */}
            <div className="flex-1 relative flex items-center justify-center p-2 overflow-hidden select-none">
              <img
                src={selectedPhoto.dataUrl}
                alt={selectedPhoto.title}
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
                    {lang === 'gu' ? 'નામ બદલો' : 'Edit Title'}
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
      </div>
    </div>
  );
}
