import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  X,
  FileText,
  Upload,
  Camera,
  Download,
  Share2,
  Trash2,
  ArrowUp,
  ArrowDown,
  RotateCw,
  Sparkles,
  CheckCircle2,
  Layers,
  Crop,
  Check,
  Maximize2,
  Eye,
  RefreshCw,
  CreditCard,
  Image as ImageIcon,
  Zap,
  BookOpen,
  Briefcase,
  Sliders,
  Eraser,
  Undo2,
  ArrowLeftRight,
  Settings2,
  Grid,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { downloadOrSharePDF } from '../services/fileDownloadService';
import { storageService } from '../services/storageService';
import confetti from 'canvas-confetti';

// Available Scan Modes
const SCAN_MODES = [
  { id: 'document', nameGu: '📄 દસ્તાવેજ', nameHi: '📄 दस्तावेज़', nameEn: 'Document', icon: FileText, descGu: 'મલ્ટી-પેજ ડોક્યુમેન્ટ / ફાઇલો' },
  { id: 'book', nameGu: '📖 પુસ્તક / બુક', nameHi: '📖 पुस्तक / बुक', nameEn: 'Book', icon: BookOpen, descGu: 'ચોપડી, રજિસ્ટર કે નોટબુક' },
  { id: 'whiteboard', nameGu: '📋 વ્હાઇટબોર્ડ', nameHi: '📋 व्हाइटबोर्ड', nameEn: 'Whiteboard', icon: Layers, descGu: 'બોર્ડ નોટ્સ, માર્કર બૂસ્ટ' },
  { id: 'idcard', nameGu: '🪪 ID કાર્ડ (2-in-1)', nameHi: '🪪 आईडी કાર્ડ (2-in-1)', nameEn: 'ID Card (2-in-1)', icon: CreditCard, descGu: 'લાઈસન્સ, આધાર કાર્ડ વગેરે' },
  { id: 'bizcard', nameGu: '💼 વિઝિટિંગ કાર્ડ', nameHi: '💼 विजिटिंग કાર્ડ', nameEn: 'Business Card', icon: Briefcase, descGu: 'બિઝનેસ કાર્ડ ફ્રન્ટ & બેક' },
  { id: 'saved_scans', nameGu: '📁 સેવ કરેલા સ્કેન', nameHi: '📁 સહેજેલા સ્કેન', nameEn: 'Saved Scans', icon: Grid, descGu: 'અગાઉ સેવ કરેલા દસ્તાવેજો' },
];

// Available Filter Types
const SCAN_FILTERS = [
  { id: 'clean_bw', nameGu: 'સ્પષ્ટ દસ્તાવેજ B&W 📄', nameHi: 'स्पष्ट डॉक B&W 📄', nameEn: 'Clean Doc B&W', icon: '📄' },
  { id: 'whiteboard', nameGu: 'વ્હાઇટબોર્ડ ક્લીન 📋', nameHi: 'व्हाइटबोर्ड 📋', nameEn: 'Whiteboard Boost', icon: '📋' },
  { id: 'book_sharp', nameGu: 'બુક રીડર શાર્પ 📖', nameHi: 'बुक रीडर 📖', nameEn: 'Book Sharp', icon: '📖' },
  { id: 'magic', nameGu: 'મેજિક કલર ✨', nameHi: 'मैजिक कलर ✨', nameEn: 'Magic Color', icon: '✨' },
  { id: 'grayscale', nameGu: 'ગ્રેસ્કેલ ઝેરોક્ષ 🖨️', nameHi: 'ग्रेस्केल ज़ेरॉक्स 🖨️', nameEn: 'Grayscale', icon: '🖨️' },
  { id: 'original', nameGu: 'ઓરિજિનલ 🌟', nameHi: 'ओरिजिनल 🌟', nameEn: 'Original', icon: '🌟' },
];

// Page Sizes
const PAGE_SIZES = [
  { id: 'a4', labelGu: 'A4 પાનું', labelEn: 'A4', w: 210, h: 297 },
  { id: 'letter', labelGu: 'Letter', labelEn: 'Letter', w: 215.9, h: 279.4 },
  { id: 'legal', labelGu: 'Legal', labelEn: 'Legal', w: 215.9, h: 355.6 },
  { id: 'fit', labelGu: 'ઓટો ફિટ (Fit)', labelEn: 'Auto Fit', w: 0, h: 0 },
];

const ID_CARD_TYPES = [
  { id: 'license', nameGu: '🪪 ડ્રાઇવિંગ લાઇસન્સ', nameHi: '🪪 ड्राइविंग लाइसेंस', nameEn: 'Driving License' },
  { id: 'aadhaar', nameGu: '🆔 આધાર કાર્ડ', nameHi: '🆔 आधार कार्ड', nameEn: 'Aadhaar Card' },
  { id: 'voter', nameGu: '🗳️ ચૂંટણી ઓળખપત્ર', nameHi: '🗳️ वोटर आईडी', nameEn: 'Voter ID' },
  { id: 'pan', nameGu: '💳 પાન કાર્ડ', nameHi: '💳 पैन कार्ड', nameEn: 'PAN Card' },
  { id: 'general_id', nameGu: '🪪 ઓફિસ / સ્ટુડન્ટ ID', nameHi: '🪪 अन्य आईडी कार्ड', nameEn: 'ID Card' },
];

export default function PdfScannerModal({ isOpen, onClose, lang = 'gu' }) {
  // Mode: 'document' | 'book' | 'whiteboard' | 'idcard' | 'bizcard'
  const [scanMode, setScanMode] = useState('document');

  // Multi-page Document / Book / Whiteboard State
  // [{ id, dataUrl, processedUrl, filter, rotation, cropBox, adjustments: { brightness, contrast }, cleanupUrl, name }]
  const [pages, setPages] = useState([]);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [docTitle, setDocTitle] = useState(() => `Scan_${new Date().toISOString().split('T')[0]}`);
  const [globalFilter, setGlobalFilter] = useState('clean_bw');
  const [pageSize, setPageSize] = useState('a4');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [savedScansList, setSavedScansList] = useState(() => storageService.getScannedDocs());

  // ID Card 2-in-1 State
  const [idType, setIdType] = useState('license');
  const [idFront, setIdFront] = useState(null);
  const [idBack, setIdBack] = useState(null);
  const [idFilter, setIdFilter] = useState('clean_bw');
  const [idDocTitle, setIdDocTitle] = useState(() => `ID_Card_${new Date().toISOString().split('T')[0]}`);
  const [idCompositePreview, setIdCompositePreview] = useState(null);

  // Business Card State (Front & Back)
  const [bizFront, setBizFront] = useState(null);
  const [bizBack, setBizBack] = useState(null);
  const [bizFilter, setBizFilter] = useState('magic');
  const [bizDocTitle, setBizDocTitle] = useState(() => `BusinessCard_${new Date().toISOString().split('T')[0]}`);
  const [bizCompositePreview, setBizCompositePreview] = useState(null);

  // Modal Dialog Overlays
  const [cropState, setCropState] = useState(null); // { isOpen, target, pageIndex, imageSrc, rotation, cropBox }
  const [adjustState, setAdjustState] = useState(null); // { isOpen, target, pageIndex, imageSrc, brightness, contrast }
  const [cleanupState, setCleanupState] = useState(null); // { isOpen, target, pageIndex, imageSrc, cleanupUrl }
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState(null);
  const [retakeTarget, setRetakeTarget] = useState(null); // { target: 'page'|'idFront'|'idBack'|'bizFront'|'bizBack', pageIndex?: number }

  // Live Camera State
  const [isLiveCameraOpen, setIsLiveCameraOpen] = useState(false);
  const [cameraTarget, setCameraTarget] = useState('doc'); // 'doc'|'retake'|'idFront'|'idBack'|'bizFront'|'bizBack'
  const [facingMode, setFacingMode] = useState('environment');
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [isShutterFlashing, setIsShutterFlashing] = useState(false);
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // File Inputs Refs
  const docFileInputRef = useRef(null);
  const docCameraInputRef = useRef(null);
  const frontFileInputRef = useRef(null);
  const frontCameraInputRef = useRef(null);
  const backFileInputRef = useRef(null);
  const backCameraInputRef = useRef(null);
  const retakeFileInputRef = useRef(null);
  const retakeCameraInputRef = useRef(null);

  // Core High-Performance Image Processor
  const processImage = useCallback((
    dataUrl,
    filterType = 'clean_bw',
    rotation = 0,
    cropBox = null,
    adjustments = { brightness: 0, contrast: 0 },
    cleanupUrl = null
  ) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Step 1: Crop Calculation (relative to image natural dimensions)
        let sourceX = 0;
        let sourceY = 0;
        let sourceW = img.naturalWidth;
        let sourceH = img.naturalHeight;

        if (cropBox) {
          sourceX = Math.max(0, Math.round(cropBox.x * img.naturalWidth));
          sourceY = Math.max(0, Math.round(cropBox.y * img.naturalHeight));
          sourceW = Math.max(20, Math.min(img.naturalWidth - sourceX, Math.round(cropBox.width * img.naturalWidth)));
          sourceH = Math.max(20, Math.min(img.naturalHeight - sourceY, Math.round(cropBox.height * img.naturalHeight)));
        }

        const isRotated = rotation % 180 !== 0;
        const outW = isRotated ? sourceH : sourceW;
        const outH = isRotated ? sourceW : sourceH;

        const canvas = document.createElement('canvas');
        canvas.width = outW;
        canvas.height = outH;
        const ctx = canvas.getContext('2d');

        // Step 2: Draw Cropped & Rotated
        ctx.save();
        ctx.translate(outW / 2, outH / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(img, sourceX, sourceY, sourceW, sourceH, -sourceW / 2, -sourceH / 2, sourceW, sourceH);
        ctx.restore();

        // Step 3: Draw Cleanup layer if present
        const finishProcessing = () => {
          const imgData = ctx.getImageData(0, 0, outW, outH);
          const d = imgData.data;

          const bOffset = adjustments?.brightness || 0;
          const cVal = adjustments?.contrast || 0;
          const contrastFactor = cVal !== 0 ? (259 * (cVal + 255)) / (255 * (259 - cVal)) : 1;

          if (filterType === 'grayscale') {
            for (let i = 0; i < d.length; i += 4) {
              let gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
              if (cVal !== 0) gray = contrastFactor * (gray - 128) + 128;
              gray = Math.min(255, Math.max(0, gray + bOffset));
              d[i] = gray;
              d[i + 1] = gray;
              d[i + 2] = gray;
            }
          } else if (filterType === 'clean_bw') {
            for (let i = 0; i < d.length; i += 4) {
              let gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
              if (cVal !== 0) gray = contrastFactor * (gray - 128) + 128;
              gray += bOffset;
              if (gray > 140) {
                d[i] = 255;
                d[i + 1] = 255;
                d[i + 2] = 255;
              } else {
                const dark = Math.max(0, gray * 0.42);
                d[i] = dark;
                d[i + 1] = dark;
                d[i + 2] = dark;
              }
            }
          } else if (filterType === 'whiteboard') {
            // Whiteboard Boost: Push light gray board background to crisp white, boost vibrant marker colors
            for (let i = 0; i < d.length; i += 4) {
              let r = d[i];
              let g = d[i + 1];
              let b = d[i + 2];
              const lum = 0.299 * r + 0.587 * g + 0.114 * b;
              if (lum > 142) {
                d[i] = 255;
                d[i + 1] = 255;
                d[i + 2] = 255;
              } else {
                r = Math.max(0, Math.min(255, (r - 128) * (1.45 * contrastFactor) + 128 + bOffset));
                g = Math.max(0, Math.min(255, (g - 128) * (1.45 * contrastFactor) + 128 + bOffset));
                b = Math.max(0, Math.min(255, (b - 128) * (1.45 * contrastFactor) + 128 + bOffset));
                d[i] = r;
                d[i + 1] = g;
                d[i + 2] = b;
              }
            }
          } else if (filterType === 'book_sharp') {
            // Book reader: Whiten yellow book paper, sharpen print text ink
            for (let i = 0; i < d.length; i += 4) {
              let gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
              if (gray > 155) {
                d[i] = 255;
                d[i + 1] = 255;
                d[i + 2] = 255;
              } else {
                const dark = Math.max(0, (gray - 20) * 0.65 + bOffset);
                d[i] = dark;
                d[i + 1] = dark;
                d[i + 2] = dark;
              }
            }
          } else if (filterType === 'magic') {
            for (let i = 0; i < d.length; i += 4) {
              let r = d[i];
              let g = d[i + 1];
              let b = d[i + 2];
              r = (r - 128) * (1.35 * contrastFactor) + 128 + bOffset;
              g = (g - 128) * (1.35 * contrastFactor) + 128 + bOffset;
              b = (b - 128) * (1.35 * contrastFactor) + 128 + bOffset;
              const avg = (r + g + b) / 3;
              if (avg > 190) {
                r = Math.min(255, r * 1.15);
                g = Math.min(255, g * 1.15);
                b = Math.min(255, b * 1.15);
              }
              d[i] = Math.min(255, Math.max(0, r));
              d[i + 1] = Math.min(255, Math.max(0, g));
              d[i + 2] = Math.min(255, Math.max(0, b));
            }
          } else {
            // Original with adjustments
            if (bOffset !== 0 || cVal !== 0) {
              for (let i = 0; i < d.length; i += 4) {
                d[i] = Math.min(255, Math.max(0, contrastFactor * (d[i] - 128) + 128 + bOffset));
                d[i + 1] = Math.min(255, Math.max(0, contrastFactor * (d[i + 1] - 128) + 128 + bOffset));
                d[i + 2] = Math.min(255, Math.max(0, contrastFactor * (d[i + 2] - 128) + 128 + bOffset));
              }
            }
          }

          ctx.putImageData(imgData, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.92));
        };

        if (cleanupUrl) {
          const cleanImg = new Image();
          cleanImg.crossOrigin = 'anonymous';
          cleanImg.onload = () => {
            ctx.drawImage(cleanImg, 0, 0, outW, outH);
            finishProcessing();
          };
          cleanImg.onerror = () => finishProcessing();
          cleanImg.src = cleanupUrl;
        } else {
          finishProcessing();
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  }, []);

  // Mode Auto-Defaults
  useEffect(() => {
    if (scanMode === 'whiteboard') setGlobalFilter('whiteboard');
    else if (scanMode === 'book') setGlobalFilter('book_sharp');
    else if (scanMode === 'bizcard') setGlobalFilter('magic');
    else if (scanMode === 'document') setGlobalFilter('clean_bw');
  }, [scanMode]);

  // ID Card Single-Page Composite Generator
  const generateIdCardComposite = useCallback(async () => {
    if (!idFront && !idBack) {
      setIdCompositePreview(null);
      return;
    }

    const A4_W = 1240;
    const A4_H = 1754;
    const canvas = document.createElement('canvas');
    canvas.width = A4_W;
    canvas.height = A4_H;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, A4_W, A4_H);

    const matchedType = ID_CARD_TYPES.find((t) => t.id === idType) || ID_CARD_TYPES[0];
    const headerTitle = lang === 'hi' ? matchedType.nameHi : lang === 'en' ? matchedType.nameEn : matchedType.nameGu;

    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 34px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(headerTitle, A4_W / 2, 85);

    ctx.fillStyle = '#64748b';
    ctx.font = '18px sans-serif';
    const dateStr = new Date().toLocaleDateString('en-GB');
    ctx.fillText(`દૈનિક ડાયરી સ્કેનર • ઓળખપત્ર પ્રમાણિત નકલ (2-in-1 Scan) • તારીખ: ${dateStr}`, A4_W / 2, 120);

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, 145);
    ctx.lineTo(A4_W - 100, 145);
    ctx.stroke();

    const CARD_W = 820;
    const CARD_H = 516;
    const CARD_X = (A4_W - CARD_W) / 2;
    const FRONT_Y = 195;
    const BACK_Y = 820;

    const drawCardSlot = (imgUrl, title, yPos) => {
      return new Promise((resolve) => {
        ctx.fillStyle = '#2563eb';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(title, CARD_X + 5, yPos - 12);

        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 3;
        if (ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(CARD_X, yPos, CARD_W, CARD_H, 20);
          ctx.stroke();
        } else {
          ctx.strokeRect(CARD_X, yPos, CARD_W, CARD_H);
        }

        if (imgUrl) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            ctx.save();
            if (ctx.roundRect) {
              ctx.beginPath();
              ctx.roundRect(CARD_X, yPos, CARD_W, CARD_H, 20);
              ctx.clip();
            }
            ctx.drawImage(img, CARD_X, yPos, CARD_W, CARD_H);
            ctx.restore();
            resolve();
          };
          img.onerror = resolve;
          img.src = imgUrl;
        } else {
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(CARD_X + 2, yPos + 2, CARD_W - 4, CARD_H - 4);
          ctx.fillStyle = '#94a3b8';
          ctx.font = '22px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('➕ (પાછળની બાજુ સ્કેન કરવાની બાકી છે)', A4_W / 2, yPos + CARD_H / 2);
          resolve();
        }
      });
    };

    await drawCardSlot(idFront?.processedUrl || idFront?.dataUrl, '૧. આગળની બાજુ (FRONT SIDE)', FRONT_Y);
    await drawCardSlot(idBack?.processedUrl || idBack?.dataUrl, '૨. પાછળની બાજુ (BACK SIDE)', BACK_Y);

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(100, 1430);
    ctx.lineTo(A4_W - 100, 1430);
    ctx.stroke();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🔒 સુરક્ષિત સ્કેન • ૧૦૦% ઓફલાઈન અને એન્ક્રિપ્ટેડ ડિવાઇસ સંગ્રહ', A4_W / 2, 1465);

    setIdCompositePreview(canvas.toDataURL('image/jpeg', 0.92));
  }, [idFront, idBack, idType, lang]);

  useEffect(() => {
    if (scanMode === 'idcard') generateIdCardComposite();
  }, [scanMode, idFront, idBack, idType, generateIdCardComposite]);

  // Business Card Composite Generator
  const generateBizCardComposite = useCallback(async () => {
    if (!bizFront && !bizBack) {
      setBizCompositePreview(null);
      return;
    }

    const A4_W = 1240;
    const A4_H = 1754;
    const canvas = document.createElement('canvas');
    canvas.width = A4_W;
    canvas.height = A4_H;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, A4_W, A4_H);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('💼 BUSINESS CARD (વિઝિટિંગ કાર્ડ)', A4_W / 2, 90);

    const CARD_W = 840;
    const CARD_H = 480; // Standard 3.5:2 ratio
    const CARD_X = (A4_W - CARD_W) / 2;
    const FRONT_Y = 180;
    const BACK_Y = 780;

    const drawBizSlot = (imgUrl, title, yPos) => {
      return new Promise((resolve) => {
        ctx.fillStyle = '#0284c7';
        ctx.font = 'bold 22px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(title, CARD_X + 5, yPos - 12);

        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2.5;
        if (ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(CARD_X, yPos, CARD_W, CARD_H, 16);
          ctx.stroke();
        } else {
          ctx.strokeRect(CARD_X, yPos, CARD_W, CARD_H);
        }

        if (imgUrl) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            ctx.save();
            if (ctx.roundRect) {
              ctx.beginPath();
              ctx.roundRect(CARD_X, yPos, CARD_W, CARD_H, 16);
              ctx.clip();
            }
            ctx.drawImage(img, CARD_X, yPos, CARD_W, CARD_H);
            ctx.restore();
            resolve();
          };
          img.onerror = resolve;
          img.src = imgUrl;
        } else {
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(CARD_X + 2, yPos + 2, CARD_W - 4, CARD_H - 4);
          ctx.fillStyle = '#94a3b8';
          ctx.font = '20px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('➕ પાછળની બાજુ (BACK SIDE)', A4_W / 2, yPos + CARD_H / 2);
          resolve();
        }
      });
    };

    await drawBizSlot(bizFront?.processedUrl || bizFront?.dataUrl, '૧. આગળની બાજુ (FRONT)', FRONT_Y);
    await drawBizSlot(bizBack?.processedUrl || bizBack?.dataUrl, '૨. પાછળની બાજુ (BACK)', BACK_Y);

    setBizCompositePreview(canvas.toDataURL('image/jpeg', 0.92));
  }, [bizFront, bizBack]);

  useEffect(() => {
    if (scanMode === 'bizcard') generateBizCardComposite();
  }, [scanMode, bizFront, bizBack, generateBizCardComposite]);

  // Live Camera Stream Lifecycle
  useEffect(() => {
    if (!isLiveCameraOpen) {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setIsTorchOn(false);
      return;
    }

    let isCancelled = false;
    let localStream = null;

    async function initCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera API not available');
        }
        const constraints = {
          video: { facingMode: { ideal: facingMode }, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (isCancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        localStream = stream;
        mediaStreamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
          } catch (_) {}
        }
      } catch (err) {
        setIsLiveCameraOpen(false);
        // Fallback to direct input
        if (cameraTarget === 'doc') docCameraInputRef.current?.click();
        else if (cameraTarget === 'retake') retakeCameraInputRef.current?.click();
        else if (cameraTarget === 'idFront') frontCameraInputRef.current?.click();
        else if (cameraTarget === 'idBack') backCameraInputRef.current?.click();
      }
    }

    initCamera();

    return () => {
      isCancelled = true;
      if (localStream) localStream.getTracks().forEach((t) => t.stop());
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((t) => t.stop());
        mediaStreamRef.current = null;
      }
    };
  }, [isLiveCameraOpen, facingMode, cameraTarget]);

  // Clean up if modal closes
  useEffect(() => {
    if (!isOpen && isLiveCameraOpen) setIsLiveCameraOpen(false);
  }, [isOpen, isLiveCameraOpen]);

  // Flip Camera
  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Toggle Torch
  const handleToggleTorch = async () => {
    if (!mediaStreamRef.current) return;
    const track = mediaStreamRef.current.getVideoTracks()[0];
    if (track) {
      try {
        const capabilities = track.getCapabilities ? track.getCapabilities() : {};
        if (capabilities.torch) {
          const nextVal = !isTorchOn;
          await track.applyConstraints({ advanced: [{ torch: nextVal }] });
          setIsTorchOn(nextVal);
        } else {
          alert(lang === 'gu' ? 'આ કેમેરામાં ટોર્ચ સપોર્ટ નથી.' : 'Torch not supported.');
        }
      } catch (_) {}
    }
  };

  // Capture Frame from Live Camera
  const handleCaptureLiveFrame = async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    try {
      if (navigator.vibrate) navigator.vibrate(50);
    } catch (_) {}

    setIsShutterFlashing(true);
    setTimeout(() => setIsShutterFlashing(false), 200);

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const rawDataUrl = canvas.toDataURL('image/jpeg', 0.94);

    if (cameraTarget === 'doc') {
      const processed = await processImage(rawDataUrl, globalFilter, 0, null);
      setPages((prev) => [
        ...prev,
        {
          id: 'page-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          dataUrl: rawDataUrl,
          processedUrl: processed,
          filter: globalFilter,
          rotation: 0,
          cropBox: null,
          adjustments: { brightness: 0, contrast: 0 },
          cleanupUrl: null,
          name: `Scan_Page_${pages.length + 1}`,
        },
      ]);
      confetti({ particleCount: 25, spread: 45, origin: { y: 0.8 } });
    } else if (cameraTarget === 'retake') {
      if (retakeTarget?.target === 'page') {
        const pageIdx = retakeTarget.pageIndex;
        const current = pages[pageIdx];
        const proc = await processImage(rawDataUrl, current?.filter || globalFilter, 0, null, current?.adjustments, null);
        setPages((prev) =>
          prev.map((p, idx) => (idx === pageIdx ? { ...p, dataUrl: rawDataUrl, processedUrl: proc, rotation: 0, cropBox: null, cleanupUrl: null } : p))
        );
      } else if (retakeTarget?.target === 'idFront') {
        const proc = await processImage(rawDataUrl, idFilter, 0, null);
        setIdFront({ dataUrl: rawDataUrl, processedUrl: proc, filter: idFilter, rotation: 0, cropBox: null, adjustments: { brightness: 0, contrast: 0 }, cleanupUrl: null });
      } else if (retakeTarget?.target === 'idBack') {
        const proc = await processImage(rawDataUrl, idFilter, 0, null);
        setIdBack({ dataUrl: rawDataUrl, processedUrl: proc, filter: idFilter, rotation: 0, cropBox: null, adjustments: { brightness: 0, contrast: 0 }, cleanupUrl: null });
      } else if (retakeTarget?.target === 'bizFront') {
        const proc = await processImage(rawDataUrl, bizFilter, 0, null);
        setBizFront({ dataUrl: rawDataUrl, processedUrl: proc, filter: bizFilter, rotation: 0, cropBox: null, adjustments: { brightness: 0, contrast: 0 }, cleanupUrl: null });
      } else if (retakeTarget?.target === 'bizBack') {
        const proc = await processImage(rawDataUrl, bizFilter, 0, null);
        setBizBack({ dataUrl: rawDataUrl, processedUrl: proc, filter: bizFilter, rotation: 0, cropBox: null, adjustments: { brightness: 0, contrast: 0 }, cleanupUrl: null });
      }
      setIsLiveCameraOpen(false);
      setRetakeTarget(null);
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    } else if (cameraTarget === 'idFront') {
      const proc = await processImage(rawDataUrl, idFilter, 0, null);
      setIdFront({ dataUrl: rawDataUrl, processedUrl: proc, filter: idFilter, rotation: 0, cropBox: null, adjustments: { brightness: 0, contrast: 0 }, cleanupUrl: null });
      setIsLiveCameraOpen(false);
    } else if (cameraTarget === 'idBack') {
      const proc = await processImage(rawDataUrl, idFilter, 0, null);
      setIdBack({ dataUrl: rawDataUrl, processedUrl: proc, filter: idFilter, rotation: 0, cropBox: null, adjustments: { brightness: 0, contrast: 0 }, cleanupUrl: null });
      setIsLiveCameraOpen(false);
    } else if (cameraTarget === 'bizFront') {
      const proc = await processImage(rawDataUrl, bizFilter, 0, null);
      setBizFront({ dataUrl: rawDataUrl, processedUrl: proc, filter: bizFilter, rotation: 0, cropBox: null, adjustments: { brightness: 0, contrast: 0 }, cleanupUrl: null });
      setIsLiveCameraOpen(false);
    } else if (cameraTarget === 'bizBack') {
      const proc = await processImage(rawDataUrl, bizFilter, 0, null);
      setBizBack({ dataUrl: rawDataUrl, processedUrl: proc, filter: bizFilter, rotation: 0, cropBox: null, adjustments: { brightness: 0, contrast: 0 }, cleanupUrl: null });
      setIsLiveCameraOpen(false);
    }
  };

  if (!isOpen) return null;

  // Add Multi-page Photos from File Input
  const handleAddDocPhotos = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const rawUrl = ev.target.result;
        const processed = await processImage(rawUrl, globalFilter, 0, null);
        setPages((prev) => [
          ...prev,
          {
            id: 'page-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
            dataUrl: rawUrl,
            processedUrl: processed,
            filter: globalFilter,
            rotation: 0,
            cropBox: null,
            adjustments: { brightness: 0, contrast: 0 },
            cleanupUrl: null,
            name: file.name,
          },
        ]);
      };
      reader.readAsDataURL(file);
    }
  };

  // Retake photo handler from file input
  const handleRetakeFileInput = (e) => {
    const file = e.target.files?.[0];
    if (!file || !retakeTarget) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const rawUrl = ev.target.result;
      if (retakeTarget.target === 'page') {
        const pageIdx = retakeTarget.pageIndex;
        const current = pages[pageIdx];
        const proc = await processImage(rawUrl, current?.filter || globalFilter, 0, null, current?.adjustments, null);
        setPages((prev) =>
          prev.map((p, idx) => (idx === pageIdx ? { ...p, dataUrl: rawUrl, processedUrl: proc, rotation: 0, cropBox: null, cleanupUrl: null } : p))
        );
      } else if (retakeTarget.target === 'idFront') {
        const proc = await processImage(rawUrl, idFilter, 0, null);
        setIdFront({ dataUrl: rawUrl, processedUrl: proc, filter: idFilter, rotation: 0, cropBox: null, adjustments: { brightness: 0, contrast: 0 }, cleanupUrl: null });
      } else if (retakeTarget.target === 'idBack') {
        const proc = await processImage(rawUrl, idFilter, 0, null);
        setIdBack({ dataUrl: rawUrl, processedUrl: proc, filter: idFilter, rotation: 0, cropBox: null, adjustments: { brightness: 0, contrast: 0 }, cleanupUrl: null });
      } else if (retakeTarget.target === 'bizFront') {
        const proc = await processImage(rawUrl, bizFilter, 0, null);
        setBizFront({ dataUrl: rawUrl, processedUrl: proc, filter: bizFilter, rotation: 0, cropBox: null, adjustments: { brightness: 0, contrast: 0 }, cleanupUrl: null });
      } else if (retakeTarget.target === 'bizBack') {
        const proc = await processImage(rawUrl, bizFilter, 0, null);
        setBizBack({ dataUrl: rawUrl, processedUrl: proc, filter: bizFilter, rotation: 0, cropBox: null, adjustments: { brightness: 0, contrast: 0 }, cleanupUrl: null });
      }
      setRetakeTarget(null);
    };
    reader.readAsDataURL(file);
  };

  // Open Retake Menu
  const handleOpenRetake = (target, pageIndex = 0) => {
    setRetakeTarget({ target, pageIndex });
  };

  // Rotate Page
  const handleRotatePage = async (index) => {
    const target = pages[index];
    if (!target) return;
    const nextRot = (target.rotation + 90) % 360;
    const proc = await processImage(target.dataUrl, target.filter, nextRot, target.cropBox, target.adjustments, target.cleanupUrl);
    setPages((prev) =>
      prev.map((p, idx) => (idx === index ? { ...p, rotation: nextRot, processedUrl: proc } : p))
    );
  };

  // Open Interactive Crop Modal (With PROPER coordinate calibration)
  const handleOpenCropModal = (targetType, pageIdx = 0) => {
    let sourceObj = null;
    if (targetType === 'page') sourceObj = pages[pageIdx];
    else if (targetType === 'idFront') sourceObj = idFront;
    else if (targetType === 'idBack') sourceObj = idBack;
    else if (targetType === 'bizFront') sourceObj = bizFront;
    else if (targetType === 'bizBack') sourceObj = bizBack;

    if (!sourceObj) return;

    setCropState({
      isOpen: true,
      target: targetType,
      pageIndex: pageIdx,
      imageSrc: sourceObj.dataUrl,
      rotation: sourceObj.rotation,
      cropBox: sourceObj.cropBox || { x: 0, y: 0, width: 1, height: 1 },
    });
  };

  // Apply Crop
  const handleApplyCrop = async (newCropBox) => {
    if (!cropState) return;
    const { target, pageIndex, imageSrc, rotation } = cropState;

    if (target === 'page') {
      const targetPage = pages[pageIndex];
      const proc = await processImage(imageSrc, targetPage?.filter || globalFilter, rotation, newCropBox, targetPage?.adjustments, targetPage?.cleanupUrl);
      setPages((prev) =>
        prev.map((p, idx) => (idx === pageIndex ? { ...p, cropBox: newCropBox, processedUrl: proc } : p))
      );
    } else if (target === 'idFront') {
      const proc = await processImage(imageSrc, idFront?.filter || idFilter, rotation, newCropBox, idFront?.adjustments, idFront?.cleanupUrl);
      setIdFront((prev) => ({ ...prev, cropBox: newCropBox, processedUrl: proc }));
    } else if (target === 'idBack') {
      const proc = await processImage(imageSrc, idBack?.filter || idFilter, rotation, newCropBox, idBack?.adjustments, idBack?.cleanupUrl);
      setIdBack((prev) => ({ ...prev, cropBox: newCropBox, processedUrl: proc }));
    } else if (target === 'bizFront') {
      const proc = await processImage(imageSrc, bizFront?.filter || bizFilter, rotation, newCropBox, bizFront?.adjustments, bizFront?.cleanupUrl);
      setBizFront((prev) => ({ ...prev, cropBox: newCropBox, processedUrl: proc }));
    } else if (target === 'bizBack') {
      const proc = await processImage(imageSrc, bizBack?.filter || bizFilter, rotation, newCropBox, bizBack?.adjustments, bizBack?.cleanupUrl);
      setBizBack((prev) => ({ ...prev, cropBox: newCropBox, processedUrl: proc }));
    }

    setCropState(null);
  };

  // Open Adjust Modal
  const handleOpenAdjustModal = (targetType, pageIdx = 0) => {
    let sourceObj = null;
    if (targetType === 'page') sourceObj = pages[pageIdx];
    else if (targetType === 'idFront') sourceObj = idFront;
    else if (targetType === 'idBack') sourceObj = idBack;
    else if (targetType === 'bizFront') sourceObj = bizFront;
    else if (targetType === 'bizBack') sourceObj = bizBack;

    if (!sourceObj) return;

    setAdjustState({
      isOpen: true,
      target: targetType,
      pageIndex: pageIdx,
      imageSrc: sourceObj.dataUrl,
      brightness: sourceObj.adjustments?.brightness || 0,
      contrast: sourceObj.adjustments?.contrast || 0,
    });
  };

  // Apply Adjustments
  const handleApplyAdjustments = async (brightness, contrast) => {
    if (!adjustState) return;
    const { target, pageIndex } = adjustState;
    const adjustments = { brightness, contrast };

    if (target === 'page') {
      const p = pages[pageIndex];
      const proc = await processImage(p.dataUrl, p.filter, p.rotation, p.cropBox, adjustments, p.cleanupUrl);
      setPages((prev) => prev.map((item, idx) => (idx === pageIndex ? { ...item, adjustments, processedUrl: proc } : item)));
    } else if (target === 'idFront') {
      const proc = await processImage(idFront.dataUrl, idFront.filter, idFront.rotation, idFront.cropBox, adjustments, idFront.cleanupUrl);
      setIdFront((prev) => ({ ...prev, adjustments, processedUrl: proc }));
    } else if (target === 'idBack') {
      const proc = await processImage(idBack.dataUrl, idBack.filter, idBack.rotation, idBack.cropBox, adjustments, idBack.cleanupUrl);
      setIdBack((prev) => ({ ...prev, adjustments, processedUrl: proc }));
    }

    setAdjustState(null);
  };

  // Open Cleanup Modal
  const handleOpenCleanupModal = (targetType, pageIdx = 0) => {
    let sourceObj = null;
    if (targetType === 'page') sourceObj = pages[pageIdx];
    else if (targetType === 'idFront') sourceObj = idFront;
    else if (targetType === 'idBack') sourceObj = idBack;
    else if (targetType === 'bizFront') sourceObj = bizFront;
    else if (targetType === 'bizBack') sourceObj = bizBack;

    if (!sourceObj) return;

    setCleanupState({
      isOpen: true,
      target: targetType,
      pageIndex: pageIdx,
      imageSrc: sourceObj.processedUrl || sourceObj.dataUrl,
      cleanupUrl: sourceObj.cleanupUrl,
    });
  };

  // Apply Cleanup
  const handleApplyCleanup = async (newCleanupUrl) => {
    if (!cleanupState) return;
    const { target, pageIndex } = cleanupState;

    if (target === 'page') {
      const p = pages[pageIndex];
      const proc = await processImage(p.dataUrl, p.filter, p.rotation, p.cropBox, p.adjustments, newCleanupUrl);
      setPages((prev) => prev.map((item, idx) => (idx === pageIndex ? { ...item, cleanupUrl: newCleanupUrl, processedUrl: proc } : item)));
    } else if (target === 'idFront') {
      const proc = await processImage(idFront.dataUrl, idFront.filter, idFront.rotation, idFront.cropBox, idFront.adjustments, newCleanupUrl);
      setIdFront((prev) => ({ ...prev, cleanupUrl: newCleanupUrl, processedUrl: proc }));
    } else if (target === 'idBack') {
      const proc = await processImage(idBack.dataUrl, idBack.filter, idBack.rotation, idBack.cropBox, idBack.adjustments, newCleanupUrl);
      setIdBack((prev) => ({ ...prev, cleanupUrl: newCleanupUrl, processedUrl: proc }));
    }

    setCleanupState(null);
  };

  // Reorder / Move Page
  const handleMovePage = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= pages.length) return;
    const newPages = [...pages];
    const temp = newPages[index];
    newPages[index] = newPages[targetIndex];
    newPages[targetIndex] = temp;
    setPages(newPages);
    setActivePageIndex(targetIndex);
  };

  // Delete Page with Confirmation
  const handleDeletePage = (index) => {
    const newPages = pages.filter((_, idx) => idx !== index);
    setPages(newPages);
    if (activePageIndex >= newPages.length) {
      setActivePageIndex(Math.max(0, newPages.length - 1));
    }
    setDeleteConfirmIndex(null);
  };

  // Apply Filter to document
  const handleApplyDocFilter = async (filterId, applyToAll = false) => {
    if (pages.length === 0) return;
    if (applyToAll) {
      setGlobalFilter(filterId);
      const updated = await Promise.all(
        pages.map(async (p) => {
          const proc = await processImage(p.dataUrl, filterId, p.rotation, p.cropBox, p.adjustments, p.cleanupUrl);
          return { ...p, filter: filterId, processedUrl: proc };
        })
      );
      setPages(updated);
    } else {
      const target = pages[activePageIndex];
      if (!target) return;
      const proc = await processImage(target.dataUrl, filterId, target.rotation, target.cropBox, target.adjustments, target.cleanupUrl);
      setPages((prev) =>
        prev.map((p, idx) => (idx === activePageIndex ? { ...p, filter: filterId, processedUrl: proc } : p))
      );
    }
  };

  // Export Multi-page PDF
  const handleExportDocPdf = async (action = 'download') => {
    if (pages.length === 0) {
      alert(lang === 'gu' ? 'કૃપા કરીને ઓછામાં ઓછું ૧ પાનું સ્કેન કરો.' : 'Please add at least 1 page.');
      return;
    }

    setIsGeneratingPdf(true);
    try {
      const matchedPage = PAGE_SIZES.find((p) => p.id === pageSize) || PAGE_SIZES[0];
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: pageSize === 'fit' ? 'a4' : [matchedPage.w, matchedPage.h],
      });

      const pdfPageW = pdf.internal.pageSize.getWidth();
      const pdfPageH = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < pages.length; i++) {
        if (i > 0) pdf.addPage();

        const p = pages[i];
        const srcUrl = p.processedUrl || p.dataUrl;

        const img = await new Promise((resolve) => {
          const el = new Image();
          el.onload = () => resolve(el);
          el.onerror = () => resolve(null);
          el.src = srcUrl;
          if (el.complete) resolve(el);
        });

        const naturalW = img && img.naturalWidth > 0 ? img.naturalWidth : 1200;
        const naturalH = img && img.naturalHeight > 0 ? img.naturalHeight : 1600;

        if (pageSize === 'fit') {
          // Zero margins auto fit
          pdf.addImage(srcUrl, 'JPEG', 0, 0, pdfPageW, pdfPageH, undefined, 'FAST');
        } else {
          const imgRatio = naturalW / naturalH;
          const pageRatio = pdfPageW / pdfPageH;

          let renderW = pdfPageW - 8;
          let renderH = pdfPageH - 8;
          let posX = 4;
          let posY = 4;

          if (imgRatio > pageRatio) {
            renderW = pdfPageW - 8;
            renderH = renderW / imgRatio;
            posX = 4;
            posY = (pdfPageH - renderH) / 2;
          } else {
            renderH = pdfPageH - 8;
            renderW = renderH * imgRatio;
            posX = (pdfPageW - renderW) / 2;
            posY = 4;
          }

          pdf.addImage(srcUrl, 'JPEG', posX, posY, renderW, renderH, undefined, 'FAST');
        }
      }

      const fileName = `${docTitle.trim() || 'Scanned_Document'}.pdf`;
      const pdfBlob = pdf.output('blob');

      await downloadOrSharePDF({
        pdfBlob,
        filename: fileName,
        title: docTitle.trim() || 'Scanned Document',
        lang,
        autoShare: action === 'share',
      });

      // Also permanently save record in App's Internal Scanned Documents
      try {
        const firstPageThumb = pages[0]?.processedUrl || pages[0]?.dataUrl || '';
        storageService.saveScannedDoc({
          id: 'scan-' + Date.now(),
          title: docTitle.trim() || 'Scanned Document',
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          pageCount: pages.length,
          thumbnail: firstPageThumb,
          scanMode,
          fileName,
        });
        setSavedScansList(storageService.getScannedDocs());
      } catch (errSave) {
        console.warn('Failed saving scanned doc to app list:', errSave);
      }

      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch (err) {
      console.error('PDF generation error:', err);
      alert(lang === 'gu' ? `PDF બનાવવામાં ક્ષતિ આવી: ${err?.message || ''}` : `Error: ${err?.message || ''}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Export 2-in-1 ID Card or Business Card
  const handleExportCardComposite = async (type = 'idcard', format = 'pdf', action = 'download') => {
    const composite = type === 'idcard' ? idCompositePreview : bizCompositePreview;
    const title = type === 'idcard' ? idDocTitle : bizDocTitle;

    if (!composite) {
      alert(lang === 'gu' ? 'કૃપા કરીને કાર્ડની આગળ અથવા પાછળની બાજુ સ્કેન કરો.' : 'Please scan card sides.');
      return;
    }

    setIsGeneratingPdf(true);
    try {
      if (format === 'image') {
        const fileName = `${title.trim() || 'Card_Scan'}.jpg`;
        if (Capacitor.isNativePlatform()) {
          const base64Data = composite.includes(',') ? composite.split(',')[1] : composite;
          const cacheFile = await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Cache,
          });
          try {
            await Filesystem.writeFile({
              path: fileName,
              data: base64Data,
              directory: Directory.Documents,
              recursive: true,
            });
          } catch (_) {}
          if (action === 'share') {
            await Share.share({ title: fileName, text: fileName, files: [cacheFile.uri] });
          }
        } else {
          const a = document.createElement('a');
          a.href = composite;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        setIsGeneratingPdf(false);
        return;
      }

      // Single Page PDF
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      pdf.addImage(composite, 'JPEG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight(), undefined, 'FAST');
      const fileName = `${title.trim() || 'Card_Scan'}.pdf`;
      const pdfBlob = pdf.output('blob');

      await downloadOrSharePDF({
        pdfBlob,
        filename: fileName,
        title: title.trim() || 'Card Scan',
        lang,
        autoShare: action === 'share',
      });

      // Save card scan record in app storage
      try {
        storageService.saveScannedDoc({
          id: 'scan-' + Date.now(),
          title: title.trim() || (type === 'idcard' ? 'ID Card Scan' : 'Business Card Scan'),
          date: new Date().toISOString().split('T')[0],
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          pageCount: (type === 'idcard' ? (idFront && idBack ? 2 : 1) : (bizFront && bizBack ? 2 : 1)),
          thumbnail: composite,
          scanMode: type,
          fileName,
        });
        setSavedScansList(storageService.getScannedDocs());
      } catch (errCardSave) {
        console.warn('Failed saving card scan to app list:', errCardSave);
      }

      confetti({ particleCount: 55, spread: 65, origin: { y: 0.6 } });
    } catch (err) {
      alert(lang === 'gu' ? `નિકાસમાં ક્ષતિ આવી: ${err?.message || ''}` : `Error: ${err?.message || ''}`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const activePage = pages[activePageIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-3 bg-slate-950/85 backdrop-blur-xs animate-in fade-in select-none">
      <div className="bg-white rounded-none sm:rounded-3xl w-full max-w-2xl h-full sm:h-auto sm:max-h-[96vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-white/20 rounded-xl text-base">📄</span>
            <div>
              <h3 className="font-extrabold text-sm leading-tight flex items-center gap-1.5">
                <span>{lang === 'gu' ? 'સ્માર્ટ પ્રો PDF સ્કેનર' : 'Smart Pro PDF Scanner'}</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full font-black">PRO</span>
              </h3>
              <p className="text-[10px] text-blue-200">
                {scanMode === 'document' || scanMode === 'book' || scanMode === 'whiteboard'
                  ? `${pages.length} ${lang === 'gu' ? 'પાના સ્કેન કર્યા' : 'Pages Scanned'}`
                  : (lang === 'gu' ? '૨-ઇન-૧ કાર્ડ સ્કેનિંગ' : '2-in-1 Card Scanning')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition active:scale-95"
          >
            <X size={20} />
          </button>
        </div>

        {/* 5-Mode Switcher Tabs */}
        <div className="p-1.5 bg-slate-100 border-b border-slate-200 flex items-center gap-1 overflow-x-auto scrollbar-none shrink-0">
          {SCAN_MODES.map((m) => {
            const Icon = m.icon;
            const isSel = scanMode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setScanMode(m.id)}
                className={`py-1.5 px-3 rounded-xl font-bold text-xs whitespace-nowrap transition flex items-center gap-1.5 ${
                  isSel
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Icon size={14} />
                <span>{m.nameGu}</span>
              </button>
            );
          })}
        </div>

        {/* Hidden File Inputs */}
        <input ref={docFileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleAddDocPhotos} />
        <input ref={docCameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleAddDocPhotos} />
        <input ref={retakeFileInputRef} type="file" accept="image/*" className="hidden" onChange={handleRetakeFileInput} />
        <input ref={retakeCameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleRetakeFileInput} />
        <input ref={frontFileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          const r = new FileReader();
          r.onload = async (ev) => {
            const raw = ev.target.result;
            if (scanMode === 'idcard') {
              const p = await processImage(raw, idFilter, 0, null);
              setIdFront({ dataUrl: raw, processedUrl: p, filter: idFilter, rotation: 0, cropBox: null, adjustments: { brightness: 0, contrast: 0 }, cleanupUrl: null });
            } else {
              const p = await processImage(raw, bizFilter, 0, null);
              setBizFront({ dataUrl: raw, processedUrl: p, filter: bizFilter, rotation: 0, cropBox: null, adjustments: { brightness: 0, contrast: 0 }, cleanupUrl: null });
            }
          };
          r.readAsDataURL(f);
        }} />
        <input ref={backFileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          const r = new FileReader();
          r.onload = async (ev) => {
            const raw = ev.target.result;
            if (scanMode === 'idcard') {
              const p = await processImage(raw, idFilter, 0, null);
              setIdBack({ dataUrl: raw, processedUrl: p, filter: idFilter, rotation: 0, cropBox: null, adjustments: { brightness: 0, contrast: 0 }, cleanupUrl: null });
            } else {
              const p = await processImage(raw, bizFilter, 0, null);
              setBizBack({ dataUrl: raw, processedUrl: p, filter: bizFilter, rotation: 0, cropBox: null, adjustments: { brightness: 0, contrast: 0 }, cleanupUrl: null });
            }
          };
          r.readAsDataURL(f);
        }} />

        {/* Modal Main Content */}
        <div className="p-3.5 overflow-y-auto space-y-3.5 flex-1">
          {/* ======================================================= */}
          {/* MODES: DOCUMENT, BOOK, WHITEBOARD (Multi-page Scans)    */}
          {/* ======================================================= */}
          {(scanMode === 'document' || scanMode === 'book' || scanMode === 'whiteboard') && (
            <>
              {/* Title & Add Capture Bar */}
              <div className="flex flex-col sm:flex-row gap-2 items-center justify-between bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                <div className="w-full sm:flex-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                    {lang === 'gu' ? 'દસ્તાવેજનું નામ (PDF Title):' : 'PDF Document Title:'}
                  </label>
                  <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="w-full text-xs font-bold text-slate-800 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 focus:outline-blue-500"
                    placeholder="Document_Name"
                  />
                </div>
                <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setCameraTarget('doc');
                      setIsLiveCameraOpen(true);
                    }}
                    className="flex items-center gap-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition"
                  >
                    <Camera size={14} />
                    <span>{lang === 'gu' ? 'કેમેરા' : 'Camera'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => docFileInputRef.current?.click()}
                    className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition"
                  >
                    <Upload size={14} />
                    <span>{lang === 'gu' ? '+ ફોટા' : '+ Photos'}</span>
                  </button>
                </div>
              </div>

              {/* Filter Strip */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Sparkles size={13} className="text-amber-500" />
                    <span>{lang === 'gu' ? 'સ્કેન ફિલ્ટર:' : 'Scan Filters:'}</span>
                  </span>
                  {pages.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleApplyDocFilter(globalFilter, true)}
                      className="text-[11px] font-bold text-blue-600 hover:underline"
                    >
                      {lang === 'gu' ? 'બધા પાના પર લાગુ કરો' : 'Apply to All'}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {SCAN_FILTERS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => handleApplyDocFilter(f.id, false)}
                      className={`py-1.5 px-1.5 rounded-xl text-xs font-bold border transition truncate flex items-center justify-center gap-1 ${
                        activePage?.filter === f.id || (!activePage && globalFilter === f.id)
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-[11px] truncate">{f.nameGu}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Page Preview with ALL Requested Edit Buttons */}
              {pages.length > 0 && activePage ? (
                <div className="space-y-2.5">
                  <div className="relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center min-h-[250px] max-h-[360px] p-2">
                    <img
                      src={activePage.processedUrl || activePage.dataUrl}
                      alt="Scanned Page Preview"
                      className="max-h-[340px] max-w-full object-contain rounded-lg shadow-lg"
                    />

                    {/* Page Number Badge */}
                    <div className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-xs text-white px-2 py-0.5 rounded-full text-xs font-bold border border-white/20">
                      #{activePageIndex + 1} / {pages.length}
                    </div>

                    {/* Retake Badge Button on Top */}
                    <button
                      type="button"
                      onClick={() => handleOpenRetake('page', activePageIndex)}
                      className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-amber-400 hover:bg-amber-300 text-slate-950 px-2.5 py-1 rounded-xl text-xs font-black shadow-md transition active:scale-95"
                    >
                      <RefreshCw size={13} />
                      <span>{lang === 'gu' ? 'રીટેક (Retake)' : 'Retake'}</span>
                    </button>
                  </div>

                  {/* FULL SUITE OF PAGE EDIT ACTIONS (Requested Tools) */}
                  <div className="bg-slate-50 p-2 rounded-2xl border border-slate-200 grid grid-cols-4 sm:grid-cols-7 gap-1.5 text-center">
                    {/* 1. Crop (Proper Coordinate Calibrated) */}
                    <button
                      type="button"
                      onClick={() => handleOpenCropModal('page', activePageIndex)}
                      className="p-1.5 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 text-slate-800 flex flex-col items-center gap-0.5 transition active:scale-95"
                    >
                      <Crop size={15} className="text-blue-600" />
                      <span className="text-[10px] font-bold">{lang === 'gu' ? 'ક્રોપ' : 'Crop'}</span>
                    </button>

                    {/* 2. Auto Page Adjust */}
                    <button
                      type="button"
                      onClick={() => {
                        handleApplyCrop({ x: 0, y: 0, width: 1, height: 1 });
                      }}
                      className="p-1.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 text-slate-800 flex flex-col items-center gap-0.5 transition active:scale-95"
                    >
                      <Sparkles size={15} className="text-emerald-600" />
                      <span className="text-[10px] font-bold">{lang === 'gu' ? 'ઓટો ફીટ' : 'Auto Fit'}</span>
                    </button>

                    {/* 3. Rotate 90° */}
                    <button
                      type="button"
                      onClick={() => handleRotatePage(activePageIndex)}
                      className="p-1.5 rounded-xl bg-white hover:bg-indigo-50 border border-slate-200 text-slate-800 flex flex-col items-center gap-0.5 transition active:scale-95"
                    >
                      <RotateCw size={15} className="text-indigo-600" />
                      <span className="text-[10px] font-bold">{lang === 'gu' ? 'રોટેટ' : 'Rotate'}</span>
                    </button>

                    {/* 4. Adjust (Brightness & Contrast) */}
                    <button
                      type="button"
                      onClick={() => handleOpenAdjustModal('page', activePageIndex)}
                      className="p-1.5 rounded-xl bg-white hover:bg-amber-50 border border-slate-200 text-slate-800 flex flex-col items-center gap-0.5 transition active:scale-95"
                    >
                      <Sliders size={15} className="text-amber-600" />
                      <span className="text-[10px] font-bold">{lang === 'gu' ? 'એડજસ્ટ' : 'Adjust'}</span>
                    </button>

                    {/* 5. Cleanup (Erase dark shadows/smudges) */}
                    <button
                      type="button"
                      onClick={() => handleOpenCleanupModal('page', activePageIndex)}
                      className="p-1.5 rounded-xl bg-white hover:bg-cyan-50 border border-slate-200 text-slate-800 flex flex-col items-center gap-0.5 transition active:scale-95"
                    >
                      <Eraser size={15} className="text-cyan-600" />
                      <span className="text-[10px] font-bold">{lang === 'gu' ? 'ક્લીનઅપ' : 'Cleanup'}</span>
                    </button>

                    {/* 6. Reorder Pages */}
                    <button
                      type="button"
                      onClick={() => setIsReorderModalOpen(true)}
                      className="p-1.5 rounded-xl bg-white hover:bg-purple-50 border border-slate-200 text-slate-800 flex flex-col items-center gap-0.5 transition active:scale-95"
                    >
                      <ArrowLeftRight size={15} className="text-purple-600" />
                      <span className="text-[10px] font-bold">{lang === 'gu' ? 'રિ-ઓર્ડર' : 'Reorder'}</span>
                    </button>

                    {/* 7. Delete Page */}
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmIndex(activePageIndex)}
                      className="p-1.5 rounded-xl bg-white hover:bg-red-50 border border-slate-200 text-red-600 flex flex-col items-center gap-0.5 transition active:scale-95"
                    >
                      <Trash2 size={15} />
                      <span className="text-[10px] font-bold">{lang === 'gu' ? 'ડિલીટ' : 'Delete'}</span>
                    </button>
                  </div>

                  {/* Thumbnail Carousel Strip */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-600">
                        {lang === 'gu' ? 'પાનાનો ક્રમ (Click to select):' : 'Page Order:'}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMovePage(activePageIndex, -1)}
                          disabled={activePageIndex === 0}
                          className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30"
                          title="Move Left"
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMovePage(activePageIndex, 1)}
                          disabled={activePageIndex === pages.length - 1}
                          className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-30"
                          title="Move Right"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin">
                      {pages.map((p, idx) => (
                        <div
                          key={p.id}
                          onClick={() => setActivePageIndex(idx)}
                          className={`relative cursor-pointer rounded-xl overflow-hidden shrink-0 border-2 transition ${
                            activePageIndex === idx
                              ? 'border-blue-600 scale-105 shadow-md'
                              : 'border-slate-200 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={p.processedUrl || p.dataUrl}
                            alt={`Thumb ${idx + 1}`}
                            className="w-14 h-18 object-cover"
                          />
                          <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[9px] text-center font-bold py-0.2">
                            #{idx + 1}
                          </span>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => docFileInputRef.current?.click()}
                        className="w-14 h-18 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 flex flex-col items-center justify-center gap-0.5 text-slate-500 hover:text-blue-600 shrink-0 transition"
                      >
                        <Upload size={14} />
                        <span className="text-[9px] font-bold">+ {lang === 'gu' ? 'ઉમેરો' : 'Add'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Empty Multi-page State */
                <div className="text-center py-10 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <FileText size={28} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">
                      {scanMode === 'whiteboard'
                        ? 'વ્હાઇટબોર્ડ સ્કેનર'
                        : scanMode === 'book'
                        ? 'બુક & રજિસ્ટર સ્કેનર'
                        : 'દસ્તાવેજ સ્કેનર'}
                    </h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                      {scanMode === 'whiteboard'
                        ? 'વ્હાઇટબોર્ડના ફોટા પાડો - માર્કર કલર આપમેળે બૂસ્ટ થશે અને બેકગ્રાઉન્ડ શુદ્ધ સફેદ બનશે.'
                        : scanMode === 'book'
                        ? 'પુસ્તક કે નોટબુકના પાના સ્કેન કરો - ટેક્સ્ટ ક્લિયર અને શાર્પ બનશે.'
                        : 'તમારા દસ્તાવેજો કે બિલ કેમેરા કે ગેલેરીમાંથી ઉમેરો.'}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setCameraTarget('doc');
                        setIsLiveCameraOpen(true);
                      }}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition flex items-center gap-1.5"
                    >
                      <Camera size={15} />
                      <span>{lang === 'gu' ? 'કેમેરાથી સ્કેન કરો' : 'Scan with Camera'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => docFileInputRef.current?.click()}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition flex items-center gap-1.5"
                    >
                      <Upload size={15} />
                      <span>{lang === 'gu' ? 'ફોટા પસંદ કરો' : 'Pick Photos'}</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ======================================================= */}
          {/* MODE: ID CARD 2-IN-1 (Licence, Aadhaar, PAN)             */}
          {/* ======================================================= */}
          {scanMode === 'idcard' && (
            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  {lang === 'gu' ? 'ઓળખપત્રનો પ્રકાર (ID Card Type):' : 'ID Card Type:'}
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                  {ID_CARD_TYPES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setIdType(t.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                        idType === t.id
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t.nameGu}
                    </button>
                  ))}
                </div>
              </div>

              {/* ID Card Front & Back Slots */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Front Card */}
                <div className="bg-slate-50 rounded-2xl p-2.5 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-blue-900">૧. આગળની બાજુ (FRONT)</span>
                    {idFront && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenRetake('idFront')}
                          className="p-1 rounded-lg text-amber-600 hover:bg-amber-100"
                          title="Retake"
                        >
                          <RefreshCw size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenCropModal('idFront')}
                          className="p-1 rounded-lg text-blue-600 hover:bg-blue-100"
                          title="Crop"
                        >
                          <Crop size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setIdFront(null)}
                          className="p-1 rounded-lg text-red-500 hover:bg-red-100"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>

                  {idFront ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-300 aspect-[1.58/1] bg-slate-900 flex items-center justify-center">
                      <img src={idFront.processedUrl || idFront.dataUrl} alt="Front" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/50 aspect-[1.58/1] flex flex-col items-center justify-center p-3 text-center gap-2">
                      <span className="text-xl">🪪</span>
                      <span className="text-[11px] font-bold text-blue-800">{lang === 'gu' ? 'કાર્ડની આગળની બાજુ' : 'Front Side'}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setCameraTarget('idFront');
                            setIsLiveCameraOpen(true);
                          }}
                          className="px-2.5 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
                        >
                          <Camera size={12} />
                          <span>{lang === 'gu' ? 'કેમેરા' : 'Camera'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => frontFileInputRef.current?.click()}
                          className="px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
                        >
                          <Upload size={12} />
                          <span>{lang === 'gu' ? 'ફોટો' : 'Photo'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Back Card */}
                <div className="bg-slate-50 rounded-2xl p-2.5 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-indigo-900">૨. પાછળની બાજુ (BACK)</span>
                    {idBack && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenRetake('idBack')}
                          className="p-1 rounded-lg text-amber-600 hover:bg-amber-100"
                          title="Retake"
                        >
                          <RefreshCw size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenCropModal('idBack')}
                          className="p-1 rounded-lg text-blue-600 hover:bg-blue-100"
                          title="Crop"
                        >
                          <Crop size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setIdBack(null)}
                          className="p-1 rounded-lg text-red-500 hover:bg-red-100"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>

                  {idBack ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-300 aspect-[1.58/1] bg-slate-900 flex items-center justify-center">
                      <img src={idBack.processedUrl || idBack.dataUrl} alt="Back" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50/50 aspect-[1.58/1] flex flex-col items-center justify-center p-3 text-center gap-2">
                      <span className="text-xl">🔄</span>
                      <span className="text-[11px] font-bold text-indigo-800">{lang === 'gu' ? 'કાર્ડની પાછળની બાજુ' : 'Back Side'}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setCameraTarget('idBack');
                            setIsLiveCameraOpen(true);
                          }}
                          className="px-2.5 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
                        >
                          <Camera size={12} />
                          <span>{lang === 'gu' ? 'કેમેરા' : 'Camera'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => backFileInputRef.current?.click()}
                          className="px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
                        >
                          <Upload size={12} />
                          <span>{lang === 'gu' ? 'ફોટો' : 'Photo'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ID Card 1-Page Composite Preview */}
              {idCompositePreview && (
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Eye size={13} className="text-indigo-600" />
                    <span>{lang === 'gu' ? '📄 ૧-પેજ A4 પ્રમાણિત પ્રિવ્યૂ (આગળ + પાછળ સાથે):' : 'A4 Combined Preview:'}</span>
                  </span>
                  <div className="bg-slate-800 p-2.5 rounded-2xl flex items-center justify-center">
                    <img src={idCompositePreview} alt="A4 Composite" className="max-h-[300px] w-auto object-contain rounded-lg shadow-lg bg-white" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================= */}
          {/* MODE: BUSINESS CARD (3.5" x 2" Visiting Cards)          */}
          {/* ======================================================= */}
          {scanMode === 'bizcard' && (
            <div className="space-y-3.5">
              <div className="bg-blue-50 p-2 rounded-xl text-blue-900 text-xs font-bold flex items-center gap-2">
                <span>💼</span>
                <span>{lang === 'gu' ? 'વિઝિટિંગ કાર્ડ સ્કેનર: આગળ અને પાછળ બંને બાજુ ક્રિસ્પ હાઇ-ક્વોલિટીમાં સેવ થશે.' : 'Visiting Card Scanner: Front & Back.'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Front Side */}
                <div className="bg-slate-50 rounded-2xl p-2.5 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-sky-900">૧. આગળની બાજુ (FRONT)</span>
                    {bizFront && (
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => handleOpenRetake('bizFront')} className="p-1 rounded-lg text-amber-600 hover:bg-amber-100" title="Retake">
                          <RefreshCw size={13} />
                        </button>
                        <button type="button" onClick={() => handleOpenCropModal('bizFront')} className="p-1 rounded-lg text-blue-600 hover:bg-blue-100" title="Crop">
                          <Crop size={13} />
                        </button>
                        <button type="button" onClick={() => setBizFront(null)} className="p-1 rounded-lg text-red-500 hover:bg-red-100" title="Delete">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>

                  {bizFront ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-300 aspect-[1.75/1] bg-slate-900 flex items-center justify-center">
                      <img src={bizFront.processedUrl || bizFront.dataUrl} alt="Front" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="rounded-xl border-2 border-dashed border-sky-300 bg-sky-50/50 aspect-[1.75/1] flex flex-col items-center justify-center p-3 text-center gap-2">
                      <span className="text-xl">💼</span>
                      <span className="text-[11px] font-bold text-sky-800">{lang === 'gu' ? 'વિઝિટિંગ કાર્ડ આગળની બાજુ' : 'Business Card Front'}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setCameraTarget('bizFront');
                            setIsLiveCameraOpen(true);
                          }}
                          className="px-2.5 py-1.5 bg-sky-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
                        >
                          <Camera size={12} />
                          <span>{lang === 'gu' ? 'કેમેરા' : 'Camera'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => frontFileInputRef.current?.click()}
                          className="px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
                        >
                          <Upload size={12} />
                          <span>{lang === 'gu' ? 'ફોટો' : 'Photo'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Back Side */}
                <div className="bg-slate-50 rounded-2xl p-2.5 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-sky-900">૨. પાછળની બાજુ (BACK)</span>
                    {bizBack && (
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => handleOpenRetake('bizBack')} className="p-1 rounded-lg text-amber-600 hover:bg-amber-100" title="Retake">
                          <RefreshCw size={13} />
                        </button>
                        <button type="button" onClick={() => handleOpenCropModal('bizBack')} className="p-1 rounded-lg text-blue-600 hover:bg-blue-100" title="Crop">
                          <Crop size={13} />
                        </button>
                        <button type="button" onClick={() => setBizBack(null)} className="p-1 rounded-lg text-red-500 hover:bg-red-100" title="Delete">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )}
                  </div>

                  {bizBack ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-300 aspect-[1.75/1] bg-slate-900 flex items-center justify-center">
                      <img src={bizBack.processedUrl || bizBack.dataUrl} alt="Back" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="rounded-xl border-2 border-dashed border-sky-300 bg-sky-50/50 aspect-[1.75/1] flex flex-col items-center justify-center p-3 text-center gap-2">
                      <span className="text-xl">🔄</span>
                      <span className="text-[11px] font-bold text-sky-800">{lang === 'gu' ? 'વિઝિટિંગ કાર્ડ પાછળની બાજુ' : 'Business Card Back'}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setCameraTarget('bizBack');
                            setIsLiveCameraOpen(true);
                          }}
                          className="px-2.5 py-1.5 bg-sky-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
                        >
                          <Camera size={12} />
                          <span>{lang === 'gu' ? 'કેમેરા' : 'Camera'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => backFileInputRef.current?.click()}
                          className="px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1"
                        >
                          <Upload size={12} />
                          <span>{lang === 'gu' ? 'ફોટો' : 'Photo'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Biz Composite Preview */}
              {bizCompositePreview && (
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                    <Eye size={13} className="text-sky-600" />
                    <span>{lang === 'gu' ? '📄 ૧-પેજ A4 વિઝિટિંગ કાર્ડ કમ્બાઈન પ્રિવ્યૂ:' : 'Business Card Preview:'}</span>
                  </span>
                  <div className="bg-slate-800 p-2.5 rounded-2xl flex items-center justify-center">
                    <img src={bizCompositePreview} alt="Composite" className="max-h-[300px] w-auto object-contain rounded-lg shadow-lg bg-white" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================= */}
          {/* MODE: SAVED SCANS GALLERY                               */}
          {/* ======================================================= */}
          {scanMode === 'saved_scans' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-800">
                    {lang === 'gu' ? '📁 સેવ કરેલા સ્કેન દસ્તાવેજો' : '📁 Saved Scanned Documents'}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    {savedScansList.length > 0
                      ? `${savedScansList.length} ${lang === 'gu' ? 'દસ્તાવેજો ફોનમાં સાચવેલા છે' : 'documents saved locally'}`
                      : (lang === 'gu' ? 'હજુ સુધી કોઈ સ્કેન સેવ કરેલ નથી' : 'No scans saved yet')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setScanMode('document')}
                  className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl active:scale-95 transition"
                >
                  {lang === 'gu' ? '+ નવું સ્કેન કરો' : '+ New Scan'}
                </button>
              </div>

              {savedScansList.length === 0 ? (
                <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <span className="text-4xl block mb-2">📑</span>
                  <p className="text-xs font-bold text-slate-600 mb-1">
                    {lang === 'gu' ? 'તમારો કોઈપણ સ્કેન કરેલ PDF અહીં દેખાશે' : 'Your saved PDF scans will appear here'}
                  </p>
                  <p className="text-[10px] text-slate-400 mb-3">
                    {lang === 'gu' ? 'દસ્તાવેજ કે કાર્ડ સ્કેન કરી "PDF ડાઉનલોડ" પર ટેપ કરો' : 'Scan a document or card and tap Download PDF'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setScanMode('document')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold active:scale-95 transition"
                  >
                    {lang === 'gu' ? 'હવે સ્કેન કરો' : 'Scan Now'}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {savedScansList.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-3 hover:border-blue-400 transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {doc.thumbnail ? (
                          <img
                            src={doc.thumbnail}
                            alt={doc.title}
                            className="w-12 h-14 object-cover rounded-lg border border-slate-200 shrink-0 bg-slate-100"
                          />
                        ) : (
                          <div className="w-12 h-14 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-xl shrink-0">
                            📄
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-extrabold text-slate-800 truncate">
                            {doc.title}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            📅 {doc.date} {doc.time ? `• ${doc.time}` : ''}
                          </p>
                          <span className="text-[9px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded-md inline-block mt-0.5">
                            {doc.pageCount || 1} {lang === 'gu' ? 'પાના' : 'pages'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(lang === 'gu' ? 'આ સ્કેન કાઢી નાખવું છે?' : 'Delete this scan?')) {
                              storageService.deleteScannedDoc(doc.id);
                              setSavedScansList(storageService.getScannedDocs());
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Page Size & Export Actions */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 space-y-2 shrink-0">
          {/* Resize / Page Size Selector (Document Mode) */}
          {(scanMode === 'document' || scanMode === 'book' || scanMode === 'whiteboard') && pages.length > 0 && (
            <div className="flex items-center justify-between text-xs font-bold text-slate-600">
              <span className="text-[11px] flex items-center gap-1">
                <Settings2 size={13} />
                <span>{lang === 'gu' ? 'પેજ સાઇઝ (Resize):' : 'Page Size:'}</span>
              </span>
              <div className="flex items-center gap-1">
                {PAGE_SIZES.map((sz) => (
                  <button
                    key={sz.id}
                    type="button"
                    onClick={() => setPageSize(sz.id)}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold border transition ${
                      pageSize === sz.id
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {sz.labelGu}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-3.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition"
            >
              {lang === 'gu' ? 'રદ કરો' : 'Cancel'}
            </button>

            {scanMode === 'document' || scanMode === 'book' || scanMode === 'whiteboard' ? (
              <>
                <button
                  type="button"
                  onClick={() => handleExportDocPdf('download')}
                  disabled={pages.length === 0 || isGeneratingPdf}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 active:scale-98 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Download size={15} />
                  <span>
                    {isGeneratingPdf
                      ? (lang === 'gu' ? 'PDF બની રહ્યું છે...' : 'Generating...')
                      : (lang === 'gu' ? `PDF ડાઉનલોડ (${pages.length} પાના)` : `Download PDF (${pages.length})`)}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExportDocPdf('share')}
                  disabled={pages.length === 0 || isGeneratingPdf}
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-98 transition flex items-center justify-center disabled:opacity-50"
                  title="Share PDF"
                >
                  <Share2 size={15} />
                </button>
              </>
            ) : scanMode === 'idcard' ? (
              <>
                <button
                  type="button"
                  onClick={() => handleExportCardComposite('idcard', 'pdf', 'download')}
                  disabled={(!idFront && !idBack) || isGeneratingPdf}
                  className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/25 active:scale-98 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Download size={15} />
                  <span>{lang === 'gu' ? '૧-પેજ PDF ડાઉનલોડ' : 'Download 1-Page PDF'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExportCardComposite('idcard', 'image', 'download')}
                  disabled={(!idFront && !idBack) || isGeneratingPdf}
                  className="py-2.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                  title="JPG Image"
                >
                  <ImageIcon size={14} />
                  <span className="hidden sm:inline">JPG</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExportCardComposite('idcard', 'pdf', 'share')}
                  disabled={(!idFront && !idBack) || isGeneratingPdf}
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-98 transition flex items-center justify-center disabled:opacity-50"
                  title="Share"
                >
                  <Share2 size={15} />
                </button>
              </>
            ) : scanMode === 'bizcard' ? (
              <>
                <button
                  type="button"
                  onClick={() => handleExportCardComposite('bizcard', 'pdf', 'download')}
                  disabled={(!bizFront && !bizBack) || isGeneratingPdf}
                  className="flex-1 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white rounded-xl text-xs font-bold shadow-md active:scale-98 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <Download size={15} />
                  <span>{lang === 'gu' ? 'કાર્ડ PDF ડાઉનલોડ' : 'Download PDF'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleExportCardComposite('bizcard', 'image', 'download')}
                  disabled={(!bizFront && !bizBack) || isGeneratingPdf}
                  className="py-2.5 px-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center"
                  title="JPG Image"
                >
                  <ImageIcon size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleExportCardComposite('bizcard', 'pdf', 'share')}
                  disabled={(!bizFront && !bizBack) || isGeneratingPdf}
                  className="py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md active:scale-98 transition flex items-center justify-center disabled:opacity-50"
                  title="Share"
                >
                  <Share2 size={15} />
                </button>
              </>
            ) : scanMode === 'saved_scans' ? (
              <button
                type="button"
                onClick={() => setScanMode('document')}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 active:scale-98"
              >
                <FileText size={15} />
                <span>{lang === 'gu' ? 'નવા દસ્તાવેજ સ્કેનરમાં જાઓ' : 'Back to Document Scanner'}</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {/* ======================================================= */}
      {/* 1. PROPER CROP & AUTO-FIT MODAL OVERLAY                 */}
      {/* ======================================================= */}
      {cropState?.isOpen && (
        <CropModalOverlay
          cropState={cropState}
          onClose={() => setCropState(null)}
          onApply={handleApplyCrop}
          lang={lang}
        />
      )}

      {/* ======================================================= */}
      {/* 2. BRIGHTNESS & CONTRAST ADJUST MODAL OVERLAY            */}
      {/* ======================================================= */}
      {adjustState?.isOpen && (
        <AdjustModalOverlay
          adjustState={adjustState}
          onClose={() => setAdjustState(null)}
          onApply={handleApplyAdjustments}
          lang={lang}
        />
      )}

      {/* ======================================================= */}
      {/* 3. CLEANUP & SPOT ERASER MODAL OVERLAY                  */}
      {/* ======================================================= */}
      {cleanupState?.isOpen && (
        <CleanupModalOverlay
          cleanupState={cleanupState}
          onClose={() => setCleanupState(null)}
          onApply={handleApplyCleanup}
          lang={lang}
        />
      )}

      {/* ======================================================= */}
      {/* 4. REORDER PAGES MODAL OVERLAY                          */}
      {/* ======================================================= */}
      {isReorderModalOpen && (
        <ReorderPagesModalOverlay
          pages={pages}
          setPages={setPages}
          activePageIndex={activePageIndex}
          setActivePageIndex={setActivePageIndex}
          onClose={() => setIsReorderModalOpen(false)}
          lang={lang}
        />
      )}

      {/* ======================================================= */}
      {/* 5. RETAKE ACTION DIALOG OVERLAY                         */}
      {/* ======================================================= */}
      {retakeTarget && (
        <div className="fixed inset-0 z-70 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                  <RefreshCw size={18} />
                </span>
                <h4 className="font-bold text-sm text-slate-800">
                  {lang === 'gu' ? 'ફોટો ફરી પાડો (Retake)' : 'Retake Photo'}
                </h4>
              </div>
              <button onClick={() => setRetakeTarget(null)} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-slate-500">
              {lang === 'gu' ? 'આ પાનાનો ફોટો બદલવા માટે વિકલ્પ પસંદ કરો:' : 'Choose how to retake this page:'}
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setCameraTarget('retake');
                  setIsLiveCameraOpen(true);
                }}
                className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl flex flex-col items-center gap-1.5 font-bold text-xs shadow-md active:scale-95 transition"
              >
                <Camera size={20} />
                <span>{lang === 'gu' ? 'કેમેરાથી પાડો' : 'Camera'}</span>
              </button>
              <button
                type="button"
                onClick={() => retakeFileInputRef.current?.click()}
                className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex flex-col items-center gap-1.5 font-bold text-xs shadow-md active:scale-95 transition"
              >
                <Upload size={20} />
                <span>{lang === 'gu' ? 'ગેલેરીમાંથી લો' : 'Gallery'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* 6. DELETE CONFIRMATION DIALOG                           */}
      {/* ======================================================= */}
      {deleteConfirmIndex !== null && (
        <div className="fixed inset-0 z-70 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-100 text-red-600 flex items-center justify-center">
              <Trash2 size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-800">
                {lang === 'gu' ? 'પાનું કાઢી નાખવું છે?' : 'Delete Page?'}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {lang === 'gu'
                  ? `શું તમે ખરેખર પાનું #${deleteConfirmIndex + 1} કાઢી નાખવા માંગો છો?`
                  : `Are you sure you want to delete Page #${deleteConfirmIndex + 1}?`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmIndex(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                {lang === 'gu' ? 'રદ કરો' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => handleDeletePage(deleteConfirmIndex)}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md"
              >
                {lang === 'gu' ? 'હા, કાઢી નાખો' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* 7. DIRECT LIVE CAMERA SCANNER VIEWFINDER OVERLAY        */}
      {/* ======================================================= */}
      {isLiveCameraOpen && (
        <div className="fixed inset-0 z-80 bg-black flex flex-col justify-between select-none animate-in fade-in">
          {/* Top Camera Action Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent z-10 text-white">
            <button
              type="button"
              onClick={() => setIsLiveCameraOpen(false)}
              className="p-2 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 transition"
              title="Close Camera"
            >
              <X size={22} />
            </button>

            {/* Mode Guide Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full border border-white/20">
              <Camera size={14} className="text-amber-400 animate-pulse" />
              <span className="text-xs font-bold">
                {cameraTarget === 'doc'
                  ? (scanMode === 'whiteboard' ? '📋 વ્હાઇટબોર્ડ સ્કેન' : scanMode === 'book' ? '📖 પુસ્તક સ્કેન' : '📄 દસ્તાવેજ સ્કેન')
                  : cameraTarget === 'retake'
                  ? '🔄 રીટેક ફોટો'
                  : cameraTarget === 'idFront'
                  ? '🪪 ID આગળની બાજુ'
                  : cameraTarget === 'idBack'
                  ? '🪪 ID પાછળની બાજુ'
                  : cameraTarget === 'bizFront'
                  ? '💼 વિઝિટિંગ આગળની બાજુ'
                  : '💼 વિઝિટિંગ પાછળની બાજુ'}
              </span>
            </div>

            {/* Controls: Torch & Switch */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleTorch}
                className={`p-2 rounded-full transition active:scale-95 ${
                  isTorchOn ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-white/15 hover:bg-white/25 text-white'
                }`}
                title="Flashlight"
              >
                <Zap size={18} />
              </button>
              <button
                type="button"
                onClick={handleFlipCamera}
                className="p-2 rounded-full bg-white/15 hover:bg-white/25 text-white active:scale-95 transition"
                title="Flip Camera"
              >
                <RotateCw size={18} />
              </button>
            </div>
          </div>

          {/* Center: Live Video Viewfinder with Alignment Frame */}
          <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-slate-950">
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />

            {isShutterFlashing && (
              <div className="absolute inset-0 bg-white/90 z-20 pointer-events-none animate-out fade-out duration-200" />
            )}

            {/* Overlay Guide Frame based on Mode */}
            <div className="relative z-10 w-full px-6 flex flex-col items-center justify-center pointer-events-none">
              {cameraTarget === 'doc' || cameraTarget === 'retake' ? (
                scanMode === 'whiteboard' ? (
                  <div className="w-full max-w-sm aspect-[16/9] border-2 border-dashed border-cyan-400/90 rounded-2xl relative shadow-2xl bg-black/10">
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-cyan-400 rounded-tl-lg" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-cyan-400 rounded-tr-lg" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-cyan-400 rounded-bl-lg" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-cyan-400 rounded-br-lg" />
                    <div className="absolute bottom-2 inset-x-0 text-center">
                      <span className="bg-black/70 text-cyan-200 text-[11px] font-bold px-3 py-1 rounded-full">
                        📋 વ્હાઇટબોર્ડ ફ્રેમમાં ગોઠવો
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full max-w-xs aspect-[3/4] border-2 border-dashed border-cyan-400/80 rounded-2xl relative shadow-2xl bg-black/10">
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-cyan-400 rounded-tl-lg" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-cyan-400 rounded-tr-lg" />
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-cyan-400 rounded-bl-lg" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-cyan-400 rounded-br-lg" />
                    <div className="absolute bottom-2 inset-x-0 text-center">
                      <span className="bg-black/70 text-white text-[11px] font-bold px-3 py-1 rounded-full">
                        📄 દસ્તાવેજ કે બુક આ ફ્રેમમાં ગોઠવો
                      </span>
                    </div>
                  </div>
                )
              ) : (
                <div className="w-full max-w-sm aspect-[1.58/1] border-2 border-dashed border-amber-400/90 rounded-2xl relative shadow-2xl bg-black/10">
                  <div className="absolute -top-1 -left-1 w-7 h-7 border-t-4 border-l-4 border-amber-400 rounded-tl-xl" />
                  <div className="absolute -top-1 -right-1 w-7 h-7 border-t-4 border-r-4 border-amber-400 rounded-tr-xl" />
                  <div className="absolute -bottom-1 -left-1 w-7 h-7 border-b-4 border-l-4 border-amber-400 rounded-bl-xl" />
                  <div className="absolute -bottom-1 -right-1 w-7 h-7 border-b-4 border-r-4 border-amber-400 rounded-br-xl" />
                  <div className="absolute bottom-2 inset-x-0 text-center">
                    <span className="bg-black/75 text-amber-300 text-[11px] font-bold px-3 py-1 rounded-full">
                      🪪 કાર્ડ આ ફ્રેમમાં સીધું ગોઠવો
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Shutter Action Bar */}
          <div className="px-6 py-5 bg-gradient-to-t from-black via-black/90 to-transparent flex items-center justify-between z-10">
            <div className="w-20">
              {cameraTarget === 'doc' && pages.length > 0 && (
                <div className="flex flex-col items-center">
                  <span className="w-8 h-8 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center text-xs font-black text-white shadow-md">
                    {pages.length}
                  </span>
                  <span className="text-[10px] text-slate-300 font-bold mt-0.5">પાના</span>
                </div>
              )}
            </div>

            {/* BIG SHUTTER BUTTON */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={handleCaptureLiveFrame}
                className="w-19 h-19 rounded-full bg-white p-1.5 shadow-2xl active:scale-90 transition-transform flex items-center justify-center cursor-pointer border-4 border-slate-900 group"
                title="Capture Photo"
              >
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-inner group-hover:scale-95 transition-transform">
                  <Camera size={26} />
                </div>
              </button>
              <span className="text-[11px] font-bold text-white mt-1 drop-shadow-md">
                📸 ફોટો પાડો
              </span>
            </div>

            <div className="w-20 flex justify-end">
              <button
                type="button"
                onClick={() => setIsLiveCameraOpen(false)}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md active:scale-95 transition flex items-center gap-1"
              >
                <Check size={14} />
                <span>પૂર્ણ</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================================
// SUBCOMPONENT 1: PROPER CROP & AUTO-FIT (ZERO OVER-CROPPING CALIBRATED)
// =====================================================================
function CropModalOverlay({ cropState, onClose, onApply, lang }) {
  const [box, setBox] = useState(cropState.cropBox || { x: 0, y: 0, width: 1, height: 1 });
  const imgWrapperRef = useRef(null);
  const dragModeRef = useRef(null); // 'move' | 'nw'|'ne'|'se'|'sw' | 'n'|'s'|'w'|'e'
  const startPosRef = useRef({ x: 0, y: 0, box: { ...box } });

  const updateBox = (newBox) => {
    const clamped = {
      x: Math.max(0, Math.min(0.9, newBox.x)),
      y: Math.max(0, Math.min(0.9, newBox.y)),
      width: Math.max(0.08, Math.min(1 - newBox.x, newBox.width)),
      height: Math.max(0.08, Math.min(1 - newBox.y, newBox.height)),
    };
    setBox(clamped);
  };

  // Preset Handlers
  const handlePreset = (type) => {
    if (type === 'full') {
      updateBox({ x: 0, y: 0, width: 1, height: 1 });
    } else if (type === 'auto') {
      // Auto Page Adjust: Perfectly frames document with a safe 2% margin to avoid over-cropping!
      updateBox({ x: 0.02, y: 0.02, width: 0.96, height: 0.96 });
    } else if (type === 'a4') {
      updateBox({ x: 0.05, y: 0.02, width: 0.9, height: Math.min(0.96, 0.9 * 1.414) });
    } else if (type === 'card') {
      updateBox({ x: 0.05, y: 0.15, width: 0.9, height: 0.9 / 1.58 });
    } else if (type === 'bizcard') {
      updateBox({ x: 0.05, y: 0.18, width: 0.9, height: 0.9 / 1.75 });
    }
  };

  const onStart = (e, mode) => {
    e.preventDefault();
    e.stopPropagation();
    dragModeRef.current = mode;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    startPosRef.current = { x: clientX, y: clientY, box: { ...box } };
  };

  const onMove = (e) => {
    if (!dragModeRef.current || !imgWrapperRef.current) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    // MEASURE EXACT IMAGE WRAPPER RECT (ZERO LETTERBOXING)
    const rect = imgWrapperRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const dx = (clientX - startPosRef.current.x) / rect.width;
    const dy = (clientY - startPosRef.current.y) / rect.height;
    const orig = startPosRef.current.box;

    if (dragModeRef.current === 'move') {
      let nx = orig.x + dx;
      let ny = orig.y + dy;
      nx = Math.max(0, Math.min(1 - orig.width, nx));
      ny = Math.max(0, Math.min(1 - orig.height, ny));
      updateBox({ ...orig, x: nx, y: ny });
    } else if (dragModeRef.current === 'se') {
      updateBox({ ...orig, width: Math.max(0.08, orig.width + dx), height: Math.max(0.08, orig.height + dy) });
    } else if (dragModeRef.current === 'nw') {
      const nx = Math.max(0, Math.min(orig.x + orig.width - 0.08, orig.x + dx));
      const ny = Math.max(0, Math.min(orig.y + orig.height - 0.08, orig.y + dy));
      updateBox({ x: nx, y: ny, width: orig.width - (nx - orig.x), height: orig.height - (ny - orig.y) });
    } else if (dragModeRef.current === 'ne') {
      const ny = Math.max(0, Math.min(orig.y + orig.height - 0.08, orig.y + dy));
      updateBox({ x: orig.x, y: ny, width: Math.max(0.08, orig.width + dx), height: orig.height - (ny - orig.y) });
    } else if (dragModeRef.current === 'sw') {
      const nx = Math.max(0, Math.min(orig.x + orig.width - 0.08, orig.x + dx));
      updateBox({ x: nx, y: orig.y, width: orig.width - (nx - orig.x), height: Math.max(0.08, orig.height + dy) });
    } else if (dragModeRef.current === 'n') {
      const ny = Math.max(0, Math.min(orig.y + orig.height - 0.08, orig.y + dy));
      updateBox({ ...orig, y: ny, height: orig.height - (ny - orig.y) });
    } else if (dragModeRef.current === 's') {
      updateBox({ ...orig, height: Math.max(0.08, orig.height + dy) });
    } else if (dragModeRef.current === 'w') {
      const nx = Math.max(0, Math.min(orig.x + orig.width - 0.08, orig.x + dx));
      updateBox({ ...orig, x: nx, width: orig.width - (nx - orig.x) });
    } else if (dragModeRef.current === 'e') {
      updateBox({ ...orig, width: Math.max(0.08, orig.width + dx) });
    }
  };

  const onEnd = () => {
    dragModeRef.current = null;
  };

  return (
    <div
      onMouseMove={onMove}
      onMouseUp={onEnd}
      onTouchMove={onMove}
      onTouchEnd={onEnd}
      className="fixed inset-0 z-70 bg-black/92 flex flex-col items-center justify-between p-3 select-none animate-in fade-in"
    >
      {/* Top Header */}
      <div className="w-full max-w-lg flex items-center justify-between text-white py-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-amber-400 text-slate-950 rounded-lg">
            <Crop size={16} />
          </span>
          <span className="font-bold text-sm">
            {lang === 'gu' ? 'દસ્તાવેજ ક્રોપ & ઓટો પેજ એડજસ્ટ' : 'Crop & Auto Page Adjust'}
          </span>
        </div>
        <button type="button" onClick={onClose} className="p-1.5 rounded-full hover:bg-white/20 text-white">
          <X size={20} />
        </button>
      </div>

      {/* Main Interactive Visual Crop Box Area (ZERO LETTERBOXING INLINE-BLOCK WRAPPER) */}
      <div className="flex-1 max-h-[64vh] flex items-center justify-center overflow-hidden my-auto w-full">
        <div
          ref={imgWrapperRef}
          className="relative inline-block max-h-[62vh] max-w-[88vw] overflow-hidden rounded-lg shadow-2xl border border-white/20"
        >
          <img
            src={cropState.imageSrc}
            alt="To Crop"
            style={{ transform: `rotate(${cropState.rotation}deg)` }}
            className="max-h-[62vh] max-w-[88vw] w-auto h-auto block select-none pointer-events-none"
          />

          {/* Darkened Mask Overlay outside crop box */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 inset-x-0 bg-black/70" style={{ height: `${box.y * 100}%` }} />
            <div className="absolute bottom-0 inset-x-0 bg-black/70" style={{ height: `${(1 - (box.y + box.height)) * 100}%` }} />
            <div
              className="absolute bg-black/70"
              style={{
                top: `${box.y * 100}%`,
                height: `${box.height * 100}%`,
                left: 0,
                width: `${box.x * 100}%`,
              }}
            />
            <div
              className="absolute bg-black/70"
              style={{
                top: `${box.y * 100}%`,
                height: `${box.height * 100}%`,
                right: 0,
                width: `${(1 - (box.x + box.width)) * 100}%`,
              }}
            />
          </div>

          {/* Interactive Resizable Crop Rectangle */}
          <div
            onMouseDown={(e) => onStart(e, 'move')}
            onTouchStart={(e) => onStart(e, 'move')}
            style={{
              position: 'absolute',
              left: `${box.x * 100}%`,
              top: `${box.y * 100}%`,
              width: `${box.width * 100}%`,
              height: `${box.height * 100}%`,
            }}
            className="border-2 border-amber-400 cursor-move shadow-2xl touch-none"
          >
            {/* Rule of Thirds Grid Lines */}
            <div className="w-full h-full pointer-events-none grid grid-cols-3 grid-rows-3 opacity-30">
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-white" />
              <div className="border-r border-white" />
              <div />
            </div>

            {/* 4 Corner Handles */}
            <div
              onMouseDown={(e) => onStart(e, 'nw')}
              onTouchStart={(e) => onStart(e, 'nw')}
              className="absolute -top-3 -left-3 w-6 h-6 bg-amber-400 rounded-full border-2 border-white shadow-md cursor-nwse-resize"
            />
            <div
              onMouseDown={(e) => onStart(e, 'ne')}
              onTouchStart={(e) => onStart(e, 'ne')}
              className="absolute -top-3 -right-3 w-6 h-6 bg-amber-400 rounded-full border-2 border-white shadow-md cursor-nesw-resize"
            />
            <div
              onMouseDown={(e) => onStart(e, 'sw')}
              onTouchStart={(e) => onStart(e, 'sw')}
              className="absolute -bottom-3 -left-3 w-6 h-6 bg-amber-400 rounded-full border-2 border-white shadow-md cursor-nesw-resize"
            />
            <div
              onMouseDown={(e) => onStart(e, 'se')}
              onTouchStart={(e) => onStart(e, 'se')}
              className="absolute -bottom-3 -right-3 w-6 h-6 bg-amber-400 rounded-full border-2 border-white shadow-md cursor-nwse-resize"
            />

            {/* 4 Edge Handles */}
            <div
              onMouseDown={(e) => onStart(e, 'n')}
              onTouchStart={(e) => onStart(e, 'n')}
              className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-4 bg-amber-400/90 rounded-full border border-white cursor-ns-resize"
            />
            <div
              onMouseDown={(e) => onStart(e, 's')}
              onTouchStart={(e) => onStart(e, 's')}
              className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-4 bg-amber-400/90 rounded-full border border-white cursor-ns-resize"
            />
            <div
              onMouseDown={(e) => onStart(e, 'w')}
              onTouchStart={(e) => onStart(e, 'w')}
              className="absolute top-1/2 -translate-y-1/2 -left-2 w-4 h-8 bg-amber-400/90 rounded-full border border-white cursor-ew-resize"
            />
            <div
              onMouseDown={(e) => onStart(e, 'e')}
              onTouchStart={(e) => onStart(e, 'e')}
              className="absolute top-1/2 -translate-y-1/2 -right-2 w-4 h-8 bg-amber-400/90 rounded-full border border-white cursor-ew-resize"
            />
          </div>
        </div>
      </div>

      {/* Preset & Action Bar */}
      <div className="w-full max-w-lg space-y-2 shrink-0 pt-2">
        <div className="grid grid-cols-5 gap-1.5 bg-white/10 p-1.5 rounded-2xl backdrop-blur-xs">
          <button
            type="button"
            onClick={() => handlePreset('auto')}
            className="py-1 text-[11px] font-bold text-amber-300 hover:bg-white/10 rounded-xl transition flex flex-col items-center gap-0.5"
          >
            <Sparkles size={14} />
            <span>{lang === 'gu' ? 'ઓટો ફીટ' : 'Auto'}</span>
          </button>
          <button
            type="button"
            onClick={() => handlePreset('full')}
            className="py-1 text-[11px] font-bold text-white hover:bg-white/10 rounded-xl transition flex flex-col items-center gap-0.5"
          >
            <Maximize2 size={14} />
            <span>{lang === 'gu' ? 'સંપૂર્ણ' : '100%'}</span>
          </button>
          <button
            type="button"
            onClick={() => handlePreset('a4')}
            className="py-1 text-[11px] font-bold text-white hover:bg-white/10 rounded-xl transition flex flex-col items-center gap-0.5"
          >
            <FileText size={14} />
            <span>A4</span>
          </button>
          <button
            type="button"
            onClick={() => handlePreset('card')}
            className="py-1 text-[11px] font-bold text-white hover:bg-white/10 rounded-xl transition flex flex-col items-center gap-0.5"
          >
            <CreditCard size={14} />
            <span>ID કાર્ડ</span>
          </button>
          <button
            type="button"
            onClick={() => handlePreset('bizcard')}
            className="py-1 text-[11px] font-bold text-white hover:bg-white/10 rounded-xl transition flex flex-col items-center gap-0.5"
          >
            <Briefcase size={14} />
            <span>વિઝિટિંગ</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-white/15 hover:bg-white/20 text-white font-bold text-xs rounded-xl"
          >
            {lang === 'gu' ? 'રદ કરો' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={() => onApply(box)}
            className="flex-1 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5"
          >
            <Check size={16} />
            <span>{lang === 'gu' ? 'ક્રોપ લાગુ કરો' : 'Apply Crop'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// SUBCOMPONENT 2: BRIGHTNESS & CONTRAST ADJUST MODAL
// =====================================================================
function AdjustModalOverlay({ adjustState, onClose, onApply, lang }) {
  const [brightness, setBrightness] = useState(adjustState.brightness || 0);
  const [contrast, setContrast] = useState(adjustState.contrast || 0);

  return (
    <div className="fixed inset-0 z-70 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in select-none">
      <div className="bg-white rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-amber-100 text-amber-700 rounded-xl">
              <Sliders size={18} />
            </span>
            <h4 className="font-bold text-sm text-slate-800">
              {lang === 'gu' ? 'બ્રાઇટનેસ & કોન્ટ્રાસ્ટ એડજસ્ટ' : 'Adjust Brightness & Contrast'}
            </h4>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        {/* Live Filter Preview */}
        <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 h-48 flex items-center justify-center">
          <img
            src={adjustState.imageSrc}
            alt="Preview"
            style={{
              filter: `brightness(${1 + brightness / 100}) contrast(${1 + contrast / 100})`,
            }}
            className="max-h-full max-w-full object-contain"
          />
        </div>

        {/* Sliders */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
              <span>{lang === 'gu' ? 'બ્રાઇટનેસ (Brightness)' : 'Brightness'}</span>
              <span>{brightness > 0 ? `+${brightness}` : brightness}</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
              <span>{lang === 'gu' ? 'કોન્ટ્રાસ્ટ (Contrast)' : 'Contrast'}</span>
              <span>{contrast > 0 ? `+${contrast}` : contrast}</span>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              value={contrast}
              onChange={(e) => setContrast(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              setBrightness(0);
              setContrast(0);
            }}
            className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
          >
            {lang === 'gu' ? 'રીસેટ' : 'Reset'}
          </button>
          <button
            type="button"
            onClick={() => onApply(brightness, contrast)}
            className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md"
          >
            {lang === 'gu' ? 'લાગુ કરો' : 'Apply'}
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// SUBCOMPONENT 3: CLEANUP & SPOT ERASER / WHITENER TOOL
// =====================================================================
function CleanupModalOverlay({ cleanupState, onClose, onApply, lang }) {
  const canvasRef = useRef(null);
  const [brushSize, setBrushSize] = useState(24);
  const [history, setHistory] = useState([]);
  const isDrawingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      canvas.width = img.naturalWidth || 800;
      canvas.height = img.naturalHeight || 1100;
      ctx.drawImage(img, 0, 0);
      setHistory([canvas.toDataURL()]);
    };
    img.src = cleanupState.imageSrc;
  }, [cleanupState.imageSrc]);

  const startDraw = (e) => {
    isDrawingRef.current = true;
    draw(e);
  };

  const draw = (e) => {
    if (!isDrawingRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, brushSize * (scaleX / 2), 0, Math.PI * 2);
    ctx.fill();
  };

  const endDraw = () => {
    if (!isDrawingRef.current || !canvasRef.current) return;
    isDrawingRef.current = false;
    setHistory((prev) => [...prev, canvasRef.current.toDataURL()]);
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const newHist = history.slice(0, -1);
    const last = newHist[newHist.length - 1];
    setHistory(newHist);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = last;
  };

  return (
    <div className="fixed inset-0 z-70 bg-black/90 flex flex-col items-center justify-between p-3 select-none animate-in fade-in">
      <div className="w-full max-w-lg flex items-center justify-between text-white py-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-cyan-500 text-slate-950 rounded-lg">
            <Eraser size={16} />
          </span>
          <span className="font-bold text-sm">
            {lang === 'gu' ? 'ક્લીનઅપ & ડાઘા / શેડો રીમુવર' : 'Cleanup & Spot Eraser'}
          </span>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-full hover:bg-white/20 text-white">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 max-h-[64vh] flex items-center justify-center overflow-hidden my-auto w-full">
        <canvas
          ref={canvasRef}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
          className="max-h-[62vh] max-w-[88vw] w-auto h-auto rounded-lg shadow-2xl border border-white/20 cursor-crosshair touch-none"
        />
      </div>

      <div className="w-full max-w-lg space-y-2 shrink-0 pt-2">
        <div className="flex items-center justify-between bg-white/10 p-2 rounded-2xl backdrop-blur-xs text-white text-xs font-bold">
          <div className="flex items-center gap-2">
            <span>{lang === 'gu' ? 'પીંછી સાઇઝ:' : 'Brush Size:'}</span>
            {[16, 28, 44].map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setBrushSize(sz)}
                className={`w-7 h-7 rounded-full flex items-center justify-center border ${
                  brushSize === sz ? 'bg-cyan-400 text-slate-950 border-white' : 'bg-white/20 border-transparent'
                }`}
              >
                <div style={{ width: sz / 3.5, height: sz / 3.5 }} className="rounded-full bg-current" />
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleUndo}
            disabled={history.length <= 1}
            className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-xs disabled:opacity-30"
          >
            <Undo2 size={14} />
            <span>{lang === 'gu' ? 'અનડુ' : 'Undo'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-white/15 text-white font-bold text-xs rounded-xl">
            {lang === 'gu' ? 'રદ કરો' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={() => onApply(canvasRef.current?.toDataURL())}
            className="flex-1 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5"
          >
            <Check size={16} />
            <span>{lang === 'gu' ? 'ક્લીનઅપ સેવ કરો' : 'Save Cleanup'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// =====================================================================
// SUBCOMPONENT 4: REORDER ALL PAGES MODAL OVERLAY
// =====================================================================
function ReorderPagesModalOverlay({ pages, setPages, activePageIndex, setActivePageIndex, onClose, lang }) {
  const movePage = (fromIdx, toIdx) => {
    if (toIdx < 0 || toIdx >= pages.length) return;
    const copy = [...pages];
    const [moved] = copy.splice(fromIdx, 1);
    copy.splice(toIdx, 0, moved);
    setPages(copy);
    setActivePageIndex(toIdx);
  };

  return (
    <div className="fixed inset-0 z-70 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in select-none">
      <div className="bg-white rounded-3xl p-4 w-full max-w-md max-h-[85vh] flex flex-col shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-purple-100 text-purple-700 rounded-xl">
              <ArrowLeftRight size={18} />
            </span>
            <h4 className="font-bold text-sm text-slate-800">
              {lang === 'gu' ? 'પાનાનો ક્રમ ગોઠવો (Reorder Pages)' : 'Reorder Pages'}
            </h4>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-3 space-y-2 pr-1">
          {pages.map((p, idx) => (
            <div
              key={p.id}
              className={`flex items-center justify-between p-2 rounded-2xl border transition ${
                activePageIndex === idx ? 'border-purple-600 bg-purple-50/50' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <img
                  src={p.processedUrl || p.dataUrl}
                  alt={`Page ${idx + 1}`}
                  className="w-12 h-16 object-cover rounded-xl border border-slate-300"
                />
                <div>
                  <span className="font-extrabold text-xs text-slate-800 block">
                    {lang === 'gu' ? 'પાનું #' : 'Page #'}{idx + 1}
                  </span>
                  <span className="text-[10px] text-slate-500 font-semibold">{p.filter}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => movePage(idx, idx - 1)}
                  disabled={idx === 0}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-30"
                  title="Move Up"
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => movePage(idx, idx + 1)}
                  disabled={idx === pages.length - 1}
                  className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-30"
                  title="Move Down"
                >
                  <ArrowDown size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md"
          >
            {lang === 'gu' ? 'પૂર્ણ (Done)' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
}
