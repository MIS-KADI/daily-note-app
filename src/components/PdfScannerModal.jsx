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
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';
import confetti from 'canvas-confetti';

const SCAN_FILTERS = [
  { id: 'magic', nameGu: 'મેજિક કલર ✨', nameHi: 'मैजिक कलर ✨', nameEn: 'Magic Color', icon: '✨' },
  { id: 'clean_bw', nameGu: 'સ્પષ્ટ દસ્તાવેજ B&W 📄', nameHi: 'स्पष्ट डॉक B&W 📄', nameEn: 'Clean Doc B&W', icon: '📄' },
  { id: 'grayscale', nameGu: 'ગ્રેસ્કેલ ઝેરોક્ષ 🖨️', nameHi: 'ग्रेस्केल ज़ेरॉक्स 🖨️', nameEn: 'Grayscale Xerox', icon: '🖨️' },
  { id: 'original', nameGu: 'ઓરિજિનલ 🌟', nameHi: 'ओरिजिनल 🌟', nameEn: 'Original', icon: '🌟' },
];

const ID_CARD_TYPES = [
  { id: 'license', nameGu: '🪪 ડ્રાઇવિંગ લાઇસન્સ', nameHi: '🪪 ड्राइविंग लाइसेंस', nameEn: 'Driving License' },
  { id: 'aadhaar', nameGu: '🆔 આધાર કાર્ડ', nameHi: '🆔 आधार कार्ड', en: 'Aadhaar Card' },
  { id: 'voter', nameGu: '🗳️ ચૂંટણી ઓળખપત્ર', nameHi: '🗳️ वोटर आईडी', nameEn: 'Voter ID' },
  { id: 'pan', nameGu: '💳 પાન કાર્ડ', nameHi: '💳 पैन कार्ड', nameEn: 'PAN Card' },
  { id: 'general_id', nameGu: '🪪 ઓફિસ / સ્ટુડન્ટ ID', nameHi: '🪪 अन्य आईडी कार्ड', nameEn: 'ID Card' },
];

// Fast edge detector that scans luminance gradients to find paper edges on canvas
function detectDocumentBounds(img, naturalW, naturalH) {
  const scanW = 300;
  const scanH = Math.max(150, Math.round((naturalH / naturalW) * scanW));
  const scanCanvas = document.createElement('canvas');
  scanCanvas.width = scanW;
  scanCanvas.height = scanH;
  const ctx = scanCanvas.getContext('2d');
  ctx.drawImage(img, 0, 0, scanW, scanH);
  const imgData = ctx.getImageData(0, 0, scanW, scanH);
  const data = imgData.data;

  const getBrightness = (x, y) => {
    const idx = (y * scanW + x) * 4;
    return 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
  };

  let cornerSum = 0;
  let count = 0;
  for (let x = 0; x < 15; x++) {
    for (let y = 0; y < 15; y++) {
      cornerSum += getBrightness(x, y);
      cornerSum += getBrightness(scanW - 1 - x, y);
      cornerSum += getBrightness(x, scanH - 1 - y);
      cornerSum += getBrightness(scanW - 1 - x, scanH - 1 - y);
      count += 4;
    }
  }
  const bgBrightness = cornerSum / count;
  const THRESHOLD = 24;

  let left = 0;
  let right = scanW - 1;
  let top = 0;
  let bottom = scanH - 1;

  for (let x = 0; x < scanW * 0.35; x++) {
    let diff = 0;
    for (let y = Math.round(scanH * 0.2); y < scanH * 0.8; y += 4) {
      if (Math.abs(getBrightness(x, y) - bgBrightness) > THRESHOLD) diff++;
    }
    if (diff > (scanH * 0.6) / 8) {
      left = x;
      break;
    }
  }

  for (let x = scanW - 1; x > scanW * 0.65; x--) {
    let diff = 0;
    for (let y = Math.round(scanH * 0.2); y < scanH * 0.8; y += 4) {
      if (Math.abs(getBrightness(x, y) - bgBrightness) > THRESHOLD) diff++;
    }
    if (diff > (scanH * 0.6) / 8) {
      right = x;
      break;
    }
  }

  for (let y = 0; y < scanH * 0.35; y++) {
    let diff = 0;
    for (let x = Math.round(scanW * 0.2); x < scanW * 0.8; x += 4) {
      if (Math.abs(getBrightness(x, y) - bgBrightness) > THRESHOLD) diff++;
    }
    if (diff > (scanW * 0.6) / 8) {
      top = y;
      break;
    }
  }

  for (let y = scanH - 1; y > scanH * 0.65; y--) {
    let diff = 0;
    for (let x = Math.round(scanW * 0.2); x < scanW * 0.8; x += 4) {
      if (Math.abs(getBrightness(x, y) - bgBrightness) > THRESHOLD) diff++;
    }
    if (diff > (scanW * 0.6) / 8) {
      bottom = y;
      break;
    }
  }

  if (right - left > scanW * 0.3 && bottom - top > scanH * 0.3) {
    return {
      x: left / scanW,
      y: top / scanH,
      width: (right - left) / scanW,
      height: (bottom - top) / scanH,
    };
  }

  return { x: 0.03, y: 0.03, width: 0.94, height: 0.94 };
}

export default function PdfScannerModal({ isOpen, onClose, lang = 'gu' }) {
  // Mode: 'document' (Multi-page PDF) | 'idcard' (ID Card 2-in-1 Front & Back on Single Page)
  const [scanMode, setScanMode] = useState('document');

  // Document Mode State
  const [pages, setPages] = useState([]); // [{ id, dataUrl, processedUrl, filter: 'magic', rotation: 0, cropBox: null }]
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [docTitle, setDocTitle] = useState(() => `Document_${new Date().toISOString().split('T')[0]}`);
  const [globalFilter, setGlobalFilter] = useState('clean_bw');
  const [pageSize, setPageSize] = useState('a4');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // ID Card 2-in-1 State
  const [idType, setIdType] = useState('license');
  const [idFront, setIdFront] = useState(null); // { dataUrl, processedUrl, filter: 'clean_bw', rotation: 0, cropBox: null }
  const [idBack, setIdBack] = useState(null); // { dataUrl, processedUrl, filter: 'clean_bw', rotation: 0, cropBox: null }
  const [idFilter, setIdFilter] = useState('clean_bw');
  const [idDocTitle, setIdDocTitle] = useState(() => `ID_Card_${new Date().toISOString().split('T')[0]}`);
  const [idCompositePreview, setIdCompositePreview] = useState(null);

  // Interactive Crop Editor State
  // { isOpen, target: 'page'|'idFront'|'idBack', pageIndex?: number, imageSrc, rotation, cropBox: { x, y, width, height } }
  const [cropState, setCropState] = useState(null);

  // File Inputs Refs
  const docFileInputRef = useRef(null);
  const docCameraInputRef = useRef(null);
  const frontFileInputRef = useRef(null);
  const frontCameraInputRef = useRef(null);
  const backFileInputRef = useRef(null);
  const backCameraInputRef = useRef(null);

  // Crop Canvas Ref
  const cropCanvasRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragHandleRef = useRef(null); // 'move' | 'tl' | 'tr' | 'bl' | 'br'
  const dragStartRef = useRef({ x: 0, y: 0, boxX: 0, boxY: 0, boxW: 0, boxH: 0 });

  // Process image with filter, rotation, and crop
  const processImage = useCallback((dataUrl, filterType = 'clean_bw', rotation = 0, cropBox = null) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Step 1: Crop
        let sourceX = 0;
        let sourceY = 0;
        let sourceW = img.naturalWidth;
        let sourceH = img.naturalHeight;

        if (cropBox) {
          sourceX = Math.max(0, Math.round(cropBox.x * img.naturalWidth));
          sourceY = Math.max(0, Math.round(cropBox.y * img.naturalHeight));
          sourceW = Math.min(img.naturalWidth - sourceX, Math.round(cropBox.width * img.naturalWidth));
          sourceH = Math.min(img.naturalHeight - sourceY, Math.round(cropBox.height * img.naturalHeight));
        }

        const isRotated = rotation % 180 !== 0;
        const outW = isRotated ? sourceH : sourceW;
        const outH = isRotated ? sourceW : sourceH;

        const canvas = document.createElement('canvas');
        canvas.width = outW;
        canvas.height = outH;
        const ctx = canvas.getContext('2d');

        // Rotate & Draw cropped portion
        ctx.save();
        ctx.translate(outW / 2, outH / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(img, sourceX, sourceY, sourceW, sourceH, -sourceW / 2, -sourceH / 2, sourceW, sourceH);
        ctx.restore();

        if (filterType === 'original') {
          resolve(canvas.toDataURL('image/jpeg', 0.92));
          return;
        }

        const imgData = ctx.getImageData(0, 0, outW, outH);
        const d = imgData.data;

        if (filterType === 'grayscale') {
          for (let i = 0; i < d.length; i += 4) {
            const gray = Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]);
            d[i] = gray;
            d[i + 1] = gray;
            d[i + 2] = gray;
          }
        } else if (filterType === 'magic') {
          for (let i = 0; i < d.length; i += 4) {
            let r = d[i];
            let g = d[i + 1];
            let b = d[i + 2];
            r = Math.min(255, Math.max(0, (r - 128) * 1.35 + 128));
            g = Math.min(255, Math.max(0, (g - 128) * 1.35 + 128));
            b = Math.min(255, Math.max(0, (b - 128) * 1.35 + 128));
            const brightness = (r + g + b) / 3;
            if (brightness > 195) {
              r = Math.min(255, r * 1.15);
              g = Math.min(255, g * 1.15);
              b = Math.min(255, b * 1.15);
            }
            d[i] = r;
            d[i + 1] = g;
            d[i + 2] = b;
          }
        } else if (filterType === 'clean_bw') {
          for (let i = 0; i < d.length; i += 4) {
            const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
            if (gray > 138) {
              d[i] = 255;
              d[i + 1] = 255;
              d[i + 2] = 255;
            } else {
              const dark = Math.max(0, gray * 0.45);
              d[i] = dark;
              d[i + 1] = dark;
              d[i + 2] = dark;
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  }, []);

  // Generate combined single-page A4 composite for ID Card
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

    // 1. Crisp clean document paper background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, A4_W, A4_H);

    // 2. Document Header
    const matchedType = ID_CARD_TYPES.find((t) => t.id === idType) || ID_CARD_TYPES[0];
    const headerTitle = lang === 'hi' ? matchedType.nameHi : lang === 'en' ? matchedType.nameEn : matchedType.nameGu;

    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'bold 34px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(headerTitle, A4_W / 2, 85);

    ctx.fillStyle = '#64748b';
    ctx.font = '18px sans-serif';
    const dateStr = new Date().toLocaleDateString('en-GB'); // DD/MM/YYYY
    ctx.fillText(`દૈનિક ડાયરી સ્કેનર • ઓળખપત્ર પ્રમાણિત નકલ (2-in-1 Scan) • તારીખ: ${dateStr}`, A4_W / 2, 120);

    // Subtle divider
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, 145);
    ctx.lineTo(A4_W - 100, 145);
    ctx.stroke();

    // Standard ID Card dimension ratio 1.586 (85.6mm x 54mm)
    const CARD_W = 820;
    const CARD_H = 516;
    const CARD_X = (A4_W - CARD_W) / 2;
    const FRONT_Y = 195;
    const BACK_Y = 820;

    // Draw helper for rounded card container
    const drawCardSlot = (imgUrl, title, yPos) => {
      return new Promise((resolve) => {
        // Label badge
        ctx.fillStyle = '#2563eb';
        ctx.font = 'bold 20px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(title, CARD_X + 5, yPos - 12);

        // Card Container Outline
        ctx.save();
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
          // Placeholder outline
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(CARD_X + 2, yPos + 2, CARD_W - 4, CARD_H - 4);
          ctx.fillStyle = '#94a3b8';
          ctx.font = '22px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('➕ (પાછળની બાજુ સ્કેન કરવાની બાકી છે)', A4_W / 2, yPos + CARD_H / 2);
          ctx.restore();
          resolve();
        }
      });
    };

    await drawCardSlot(idFront?.processedUrl || idFront?.dataUrl, '૧. આગળની બાજુ (FRONT SIDE)', FRONT_Y);
    await drawCardSlot(idBack?.processedUrl || idBack?.dataUrl, '૨. પાછળની બાજુ (BACK SIDE)', BACK_Y);

    // Footer note
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

    const compositeUrl = canvas.toDataURL('image/jpeg', 0.92);
    setIdCompositePreview(compositeUrl);
  }, [idFront, idBack, idType, lang]);

  // Update ID Card composite when front/back changes
  useEffect(() => {
    if (scanMode === 'idcard') {
      generateIdCardComposite();
    }
  }, [scanMode, idFront, idBack, idType, generateIdCardComposite]);

  if (!isOpen) return null;

  // Add photos to Document Mode
  const handleAddDocPhotos = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const rawUrl = event.target.result;
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
            name: file.name,
          },
        ]);
      };
      reader.readAsDataURL(file);
    }
  };

  // Set ID Card Side
  const handleSetIdCardSide = async (side, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawUrl = event.target.result;
      const processed = await processImage(rawUrl, idFilter, 0, null);
      const cardObj = {
        dataUrl: rawUrl,
        processedUrl: processed,
        filter: idFilter,
        rotation: 0,
        cropBox: null,
      };
      if (side === 'front') {
        setIdFront(cardObj);
      } else {
        setIdBack(cardObj);
      }
    };
    reader.readAsDataURL(file);
  };

  // Rotate Page
  const handleRotatePage = async (index) => {
    const target = pages[index];
    if (!target) return;
    const nextRot = (target.rotation + 90) % 360;
    const proc = await processImage(target.dataUrl, target.filter, nextRot, target.cropBox);
    setPages((prev) =>
      prev.map((p, idx) => (idx === index ? { ...p, rotation: nextRot, processedUrl: proc } : p))
    );
  };

  // Rotate ID Side
  const handleRotateIdSide = async (side) => {
    const target = side === 'front' ? idFront : idBack;
    if (!target) return;
    const nextRot = (target.rotation + 90) % 360;
    const proc = await processImage(target.dataUrl, target.filter, nextRot, target.cropBox);
    const updated = { ...target, rotation: nextRot, processedUrl: proc };
    if (side === 'front') setIdFront(updated);
    else setIdBack(updated);
  };

  // Open Interactive Crop Modal
  const handleOpenCropModal = (targetType, pageIdx = 0) => {
    let sourceObj = null;
    if (targetType === 'page') {
      sourceObj = pages[pageIdx];
    } else if (targetType === 'idFront') {
      sourceObj = idFront;
    } else if (targetType === 'idBack') {
      sourceObj = idBack;
    }

    if (!sourceObj) return;

    // Detect initial edges or use existing box
    const img = new Image();
    img.src = sourceObj.dataUrl;
    img.onload = () => {
      const detectedBox = sourceObj.cropBox || detectDocumentBounds(img, img.naturalWidth, img.naturalHeight);
      setCropState({
        isOpen: true,
        target: targetType,
        pageIndex: pageIdx,
        imageSrc: sourceObj.dataUrl,
        rotation: sourceObj.rotation,
        cropBox: detectedBox,
      });
    };
  };

  // Apply Crop
  const handleApplyCrop = async () => {
    if (!cropState) return;
    const { target, pageIndex, imageSrc, rotation, cropBox } = cropState;

    if (target === 'page') {
      const targetPage = pages[pageIndex];
      const proc = await processImage(imageSrc, targetPage?.filter || globalFilter, rotation, cropBox);
      setPages((prev) =>
        prev.map((p, idx) =>
          idx === pageIndex ? { ...p, cropBox, processedUrl: proc } : p
        )
      );
    } else if (target === 'idFront') {
      const proc = await processImage(imageSrc, idFront?.filter || idFilter, rotation, cropBox);
      setIdFront((prev) => ({ ...prev, cropBox, processedUrl: proc }));
    } else if (target === 'idBack') {
      const proc = await processImage(imageSrc, idBack?.filter || idFilter, rotation, cropBox);
      setIdBack((prev) => ({ ...prev, cropBox, processedUrl: proc }));
    }

    setCropState(null);
  };

  // Reorder / Delete in Document Mode
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

  const handleDeletePage = (index) => {
    const newPages = pages.filter((_, idx) => idx !== index);
    setPages(newPages);
    if (activePageIndex >= newPages.length) {
      setActivePageIndex(Math.max(0, newPages.length - 1));
    }
  };

  // Apply Filter to document
  const handleApplyDocFilter = async (filterId, applyToAll = false) => {
    if (pages.length === 0) return;
    if (applyToAll) {
      setGlobalFilter(filterId);
      const updated = await Promise.all(
        pages.map(async (p) => {
          const proc = await processImage(p.dataUrl, filterId, p.rotation, p.cropBox);
          return { ...p, filter: filterId, processedUrl: proc };
        })
      );
      setPages(updated);
    } else {
      const target = pages[activePageIndex];
      if (!target) return;
      const proc = await processImage(target.dataUrl, filterId, target.rotation, target.cropBox);
      setPages((prev) =>
        prev.map((p, idx) => (idx === activePageIndex ? { ...p, filter: filterId, processedUrl: proc } : p))
      );
    }
  };

  // Apply Filter to ID Cards
  const handleApplyIdFilter = async (filterId) => {
    setIdFilter(filterId);
    if (idFront) {
      const procFront = await processImage(idFront.dataUrl, filterId, idFront.rotation, idFront.cropBox);
      setIdFront((prev) => ({ ...prev, filter: filterId, processedUrl: procFront }));
    }
    if (idBack) {
      const procBack = await processImage(idBack.dataUrl, filterId, idBack.rotation, idBack.cropBox);
      setIdBack((prev) => ({ ...prev, filter: filterId, processedUrl: procBack }));
    }
  };

  // Export Multi-page PDF (Document Mode)
  const handleExportDocPdf = async (action = 'download') => {
    if (pages.length === 0) {
      alert(lang === 'gu' ? 'કૃપા કરીને ઓછામાં ઓછું ૧ પાનું સ્કેન કરો.' : 'Please add at least 1 page.');
      return;
    }

    setIsGeneratingPdf(true);
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: pageSize === 'a4' ? 'a4' : 'letter',
      });

      const pdfPageW = pdf.internal.pageSize.getWidth();
      const pdfPageH = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < pages.length; i++) {
        if (i > 0) pdf.addPage();

        const p = pages[i];
        const img = new Image();
        img.src = p.processedUrl || p.dataUrl;
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });

        const imgRatio = img.naturalWidth / img.naturalHeight;
        const pageRatio = pdfPageW / pdfPageH;

        let renderW = pdfPageW;
        let renderH = pdfPageH;
        let posX = 0;
        let posY = 0;

        if (imgRatio > pageRatio) {
          renderW = pdfPageW - 10;
          renderH = renderW / imgRatio;
          posX = 5;
          posY = (pdfPageH - renderH) / 2;
        } else {
          renderH = pdfPageH - 10;
          renderW = renderH * imgRatio;
          posX = (pdfPageW - renderW) / 2;
          posY = 5;
        }

        pdf.addImage(p.processedUrl || p.dataUrl, 'JPEG', posX, posY, renderW, renderH, undefined, 'FAST');
      }

      const fileName = `${docTitle.trim() || 'Scanned_Document'}.pdf`;

      if (action === 'share' && Capacitor.isNativePlatform()) {
        const pdfBase64 = pdf.output('datauristring');
        await Share.share({
          title: fileName,
          text: `દૈનિક ડાયરી સ્કેનર દસ્તાવેજ: ${fileName}`,
          url: pdfBase64,
        });
      } else {
        pdf.save(fileName);
      }

      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch (err) {
      console.error('PDF generation error:', err);
      alert(lang === 'gu' ? 'PDF બનાવવામાં ક્ષતિ આવી.' : 'Error generating PDF.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Export ID Card 2-in-1 (Single Page PDF or Image)
  const handleExportIdCard = async (format = 'pdf', action = 'download') => {
    if (!idFront && !idBack) {
      alert(lang === 'gu' ? 'કૃપા કરીને આઈડી કાર્ડની આગળ અથવા પાછળની બાજુ સ્કેન કરો.' : 'Please scan ID card.');
      return;
    }

    setIsGeneratingPdf(true);
    try {
      if (format === 'image') {
        const a = document.createElement('a');
        a.href = idCompositePreview;
        a.download = `${idDocTitle.trim() || 'ID_Card_Scan'}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        setIsGeneratingPdf(false);
        return;
      }

      // Single A4 Page PDF with Front & Back together!
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfPageW = pdf.internal.pageSize.getWidth();
      const pdfPageH = pdf.internal.pageSize.getHeight();

      pdf.addImage(idCompositePreview, 'JPEG', 0, 0, pdfPageW, pdfPageH, undefined, 'FAST');

      const fileName = `${idDocTitle.trim() || 'ID_Card_Scan'}.pdf`;

      if (action === 'share' && Capacitor.isNativePlatform()) {
        const pdfBase64 = pdf.output('datauristring');
        await Share.share({
          title: fileName,
          text: `આઈડી કાર્ડ સ્કેન (૨-ઇન-૧): ${fileName}`,
          url: pdfBase64,
        });
      } else {
        pdf.save(fileName);
      }

      confetti({ particleCount: 55, spread: 65, origin: { y: 0.6 } });
    } catch (err) {
      console.error('ID Card export error:', err);
      alert(lang === 'gu' ? 'આઈડી કાર્ડ નિકાસમાં ક્ષતિ આવી.' : 'Error exporting ID card.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const activePage = pages[activePageIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-none sm:rounded-3xl w-full max-w-xl h-full sm:h-auto sm:max-h-[95vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-white/20 rounded-xl text-lg">
              📄
            </span>
            <div>
              <h3 className="font-bold text-sm leading-tight flex items-center gap-2">
                <span>
                  {lang === 'hi' ? 'दस्तावेज़ व आईडी कार्ड PDF स्कैनर' : lang === 'en' ? 'Document & ID Card Scanner' : 'દસ્તાવેજ & આઈડી કાર્ડ PDF સ્કેનર'}
                </span>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.2 rounded-full font-black">
                  PRO
                </span>
              </h3>
              <p className="text-[11px] text-blue-200">
                {scanMode === 'document'
                  ? `${pages.length} ${lang === 'hi' ? 'पृष्ठ जोड़े गए' : lang === 'en' ? 'Pages Scanned' : 'પાના સ્કેન કર્યા'}`
                  : (lang === 'gu' ? '🪪 આગળ-પાછળનું કાર્ડ ૧ જ પેજ પર' : '🪪 Front & Back on Single Page')}
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

        {/* Mode Switcher Tabs */}
        <div className="p-2 bg-slate-100 border-b border-slate-200 grid grid-cols-2 gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setScanMode('document')}
            className={`py-2 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
              scanMode === 'document'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <FileText size={15} />
            <span>{lang === 'gu' ? '📄 દસ્તાવેજ સ્કેન' : lang === 'hi' ? '📄 दस्तावेज़ स्कैन' : 'Document Scan'}</span>
          </button>

          <button
            type="button"
            onClick={() => setScanMode('idcard')}
            className={`py-2 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
              scanMode === 'idcard'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <CreditCard size={15} />
            <span className="flex items-center gap-1.5">
              <span>{lang === 'gu' ? '🪪 આઈડી કાર્ડ / લાઇસન્સ' : lang === 'hi' ? '🪪 आईडी / लाइसेंस' : 'ID Card 2-in-1'}</span>
              <span className="text-[9px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full">
                1 PAGE
              </span>
            </span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* ==================================================== */}
          {/* MODE 1: MULTI-PAGE DOCUMENT SCAN                     */}
          {/* ==================================================== */}
          {scanMode === 'document' && (
            <>
              {/* Document Title and Actions Bar */}
              <div className="flex flex-col sm:flex-row gap-2 items-center justify-between bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                <div className="w-full sm:flex-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                    {lang === 'hi' ? 'दस्तावेज़ का नाम (PDF Title):' : lang === 'en' ? 'Document Name:' : 'દસ્તાવેજનું નામ (PDF Title):'}
                  </label>
                  <input
                    type="text"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="w-full text-xs font-bold text-slate-800 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 focus:outline-blue-500"
                    placeholder="Document_Name"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <input
                    ref={docFileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleAddDocPhotos}
                  />
                  <input
                    ref={docCameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleAddDocPhotos}
                  />

                  <button
                    type="button"
                    onClick={() => docCameraInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition"
                  >
                    <Camera size={14} />
                    <span>{lang === 'hi' ? 'कैमरा' : lang === 'en' ? 'Camera' : 'કેમેરા'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => docFileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition"
                  >
                    <Upload size={14} />
                    <span>{lang === 'hi' ? '+ फ़ोटो जोड़ें' : lang === 'en' ? '+ Add Photos' : '+ ફોટા ઉમેરો'}</span>
                  </button>
                </div>
              </div>

              {/* Filter Bar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Sparkles size={14} className="text-amber-500" />
                    <span>{lang === 'hi' ? 'दस्तावेज़ फ़िल्टर:' : lang === 'en' ? 'Scanner Filters:' : 'દસ્તાવેજ ફિલ્ટર:'}</span>
                  </span>
                  {pages.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleApplyDocFilter(globalFilter, true)}
                      className="text-[11px] font-bold text-blue-600 hover:underline"
                    >
                      {lang === 'hi' ? 'सभी पृष्ठों पर लागू करें' : lang === 'en' ? 'Apply to All' : 'બધા પાના પર લાગુ કરો'}
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                  {SCAN_FILTERS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => handleApplyDocFilter(f.id, false)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition truncate flex items-center justify-center gap-1.5 ${
                        activePage?.filter === f.id || (!activePage && globalFilter === f.id)
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span>{f.icon}</span>
                      <span className="truncate">{lang === 'hi' ? f.nameHi : lang === 'en' ? f.nameEn : f.nameGu}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Page Preview Area */}
              {pages.length > 0 && activePage ? (
                <div className="space-y-3">
                  <div className="relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 flex items-center justify-center min-h-[260px] max-h-[380px] p-2">
                    <img
                      src={activePage.processedUrl || activePage.dataUrl}
                      alt="Scanned Page Preview"
                      className="max-h-[360px] max-w-full object-contain rounded-lg shadow-lg"
                    />

                    {/* Page Number Badge */}
                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-xs text-white px-2.5 py-1 rounded-full text-xs font-bold border border-white/20">
                      {lang === 'hi' ? 'पृष्ठ' : lang === 'en' ? 'Page' : 'પાનું'} {activePageIndex + 1} / {pages.length}
                    </div>

                    {/* Quick Page Actions with Crop & Rotate */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/75 backdrop-blur-xs p-1 rounded-xl border border-white/20">
                      <button
                        type="button"
                        onClick={() => handleOpenCropModal('page', activePageIndex)}
                        title="Crop & Auto-Fit"
                        className="p-1.5 rounded-lg text-amber-300 hover:bg-white/20 transition flex items-center gap-1 text-xs font-bold"
                      >
                        <Crop size={15} />
                        <span className="hidden xs:inline">{lang === 'gu' ? 'ક્રોપ' : 'Crop'}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRotatePage(activePageIndex)}
                        title="Rotate 90°"
                        className="p-1.5 rounded-lg text-white hover:bg-white/20 transition"
                      >
                        <RotateCw size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMovePage(activePageIndex, -1)}
                        disabled={activePageIndex === 0}
                        title="Move Up"
                        className="p-1.5 rounded-lg text-white hover:bg-white/20 transition disabled:opacity-30"
                      >
                        <ArrowUp size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMovePage(activePageIndex, 1)}
                        disabled={activePageIndex === pages.length - 1}
                        title="Move Down"
                        className="p-1.5 rounded-lg text-white hover:bg-white/20 transition disabled:opacity-30"
                      >
                        <ArrowDown size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePage(activePageIndex)}
                        title="Delete Page"
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Page Thumbnails Carousel */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 block">
                      {lang === 'hi' ? 'पृष्ठ क्रम (Page Order):' : lang === 'en' ? 'Page Order:' : 'પાનાનો ક્રમ (Page Order):'}
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin">
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
                            className="w-16 h-20 object-cover"
                          />
                          <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[10px] text-center font-bold py-0.5">
                            #{idx + 1}
                          </span>
                        </div>
                      ))}

                      <button
                        type="button"
                        onClick={() => docFileInputRef.current?.click()}
                        className="w-16 h-20 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-blue-600 shrink-0 transition"
                      >
                        <Upload size={16} />
                        <span className="text-[9px] font-bold">+ {lang === 'hi' ? 'जोड़ें' : 'Add'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Empty Document State */
                <div className="text-center py-10 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <FileText size={28} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-800">
                      {lang === 'hi' ? 'कोई दस्तावेज़ नहीं चुना गया' : lang === 'en' ? 'No Document Picked' : 'હજુ કોઈ ફોટો કે દસ્તાવેજ પસંદ કરેલ નથી'}
                    </h4>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                      {lang === 'gu'
                        ? 'તમારા બિલ, રસીદ કે કોઈપણ ફોટો કેમેરા કે ગેલેરીમાંથી ઉમેરો અને ૧-ક્લિકમાં સ્વચ્છ PDF બનાવો.'
                        : 'Capture bills, notes or receipts and convert to clean PDF.'}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => docCameraInputRef.current?.click()}
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

          {/* ==================================================== */}
          {/* MODE 2: ID CARD 2-IN-1 (FRONT + BACK ON SINGLE PAGE) */}
          {/* ==================================================== */}
          {scanMode === 'idcard' && (
            <div className="space-y-4">
              {/* ID Type Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  {lang === 'gu' ? 'ઓળખપત્રનો પ્રકાર (ID Card Type):' : lang === 'hi' ? 'आईडी कार्ड का प्रकार:' : 'ID Card Type:'}
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
                      {lang === 'hi' ? t.nameHi : lang === 'en' ? t.nameEn : t.nameGu}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title & Filter */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                    {lang === 'gu' ? 'ફાઇલનું નામ (Title):' : 'File Name:'}
                  </label>
                  <input
                    type="text"
                    value={idDocTitle}
                    onChange={(e) => setIdDocTitle(e.target.value)}
                    className="w-full text-xs font-bold text-slate-800 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 focus:outline-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-0.5">
                    {lang === 'gu' ? 'ઝેરોક્ષ / કલર ફિલ્ટર:' : 'Print Filter:'}
                  </label>
                  <select
                    value={idFilter}
                    onChange={(e) => handleApplyIdFilter(e.target.value)}
                    className="w-full text-xs font-bold text-slate-800 bg-white px-2 py-1.5 rounded-xl border border-slate-200 focus:outline-indigo-500"
                  >
                    {SCAN_FILTERS.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.icon} {lang === 'hi' ? f.nameHi : lang === 'en' ? f.nameEn : f.nameGu}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Front and Back Upload Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. FRONT SIDE CARD */}
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-blue-900 flex items-center gap-1">
                      <span>૧. આગળની બાજુ (FRONT)</span>
                    </span>
                    {idFront && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenCropModal('idFront')}
                          className="p-1 rounded-lg text-amber-600 hover:bg-amber-100 transition"
                          title="Crop"
                        >
                          <Crop size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRotateIdSide('front')}
                          className="p-1 rounded-lg text-slate-600 hover:bg-slate-200 transition"
                          title="Rotate"
                        >
                          <RotateCw size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setIdFront(null)}
                          className="p-1 rounded-lg text-red-500 hover:bg-red-100 transition"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  <input
                    ref={frontFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleSetIdCardSide('front', e.target.files?.[0])}
                  />
                  <input
                    ref={frontCameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => handleSetIdCardSide('front', e.target.files?.[0])}
                  />

                  {idFront ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-300 aspect-[1.58/1] bg-slate-900 flex items-center justify-center">
                      <img
                        src={idFront.processedUrl || idFront.dataUrl}
                        alt="Front Side"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/50 aspect-[1.58/1] flex flex-col items-center justify-center p-3 text-center gap-2">
                      <span className="text-2xl">🪪</span>
                      <span className="text-[11px] font-bold text-blue-800">
                        {lang === 'gu' ? 'કાર્ડની આગળની બાજુ સ્કેન કરો' : 'Scan Front Side'}
                      </span>
                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => frontCameraInputRef.current?.click()}
                          className="px-2.5 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-2xs active:scale-95"
                        >
                          <Camera size={12} />
                          <span>{lang === 'gu' ? 'કેમેરા' : 'Camera'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => frontFileInputRef.current?.click()}
                          className="px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-2xs active:scale-95"
                        >
                          <Upload size={12} />
                          <span>{lang === 'gu' ? 'ફોટો' : 'Photo'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. BACK SIDE CARD */}
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-indigo-900 flex items-center gap-1">
                      <span>૨. પાછળની બાજુ (BACK)</span>
                    </span>
                    {idBack && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenCropModal('idBack')}
                          className="p-1 rounded-lg text-amber-600 hover:bg-amber-100 transition"
                          title="Crop"
                        >
                          <Crop size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRotateIdSide('back')}
                          className="p-1 rounded-lg text-slate-600 hover:bg-slate-200 transition"
                          title="Rotate"
                        >
                          <RotateCw size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setIdBack(null)}
                          className="p-1 rounded-lg text-red-500 hover:bg-red-100 transition"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  <input
                    ref={backFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleSetIdCardSide('back', e.target.files?.[0])}
                  />
                  <input
                    ref={backCameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => handleSetIdCardSide('back', e.target.files?.[0])}
                  />

                  {idBack ? (
                    <div className="relative rounded-xl overflow-hidden border border-slate-300 aspect-[1.58/1] bg-slate-900 flex items-center justify-center">
                      <img
                        src={idBack.processedUrl || idBack.dataUrl}
                        alt="Back Side"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50/50 aspect-[1.58/1] flex flex-col items-center justify-center p-3 text-center gap-2">
                      <span className="text-2xl">🔄</span>
                      <span className="text-[11px] font-bold text-indigo-800">
                        {lang === 'gu' ? 'કાર્ડની પાછળની બાજુ સ્કેન કરો' : 'Scan Back Side'}
                      </span>
                      <div className="flex items-center gap-1.5 pt-1">
                        <button
                          type="button"
                          onClick={() => backCameraInputRef.current?.click()}
                          className="px-2.5 py-1.5 bg-indigo-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-2xs active:scale-95"
                        >
                          <Camera size={12} />
                          <span>{lang === 'gu' ? 'કેમેરા' : 'Camera'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => backFileInputRef.current?.click()}
                          className="px-2.5 py-1.5 bg-blue-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-2xs active:scale-95"
                        >
                          <Upload size={12} />
                          <span>{lang === 'gu' ? 'ફોટો' : 'Photo'}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* A4 Single Page Live Preview */}
              {idCompositePreview && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Eye size={14} className="text-indigo-600" />
                      <span>{lang === 'gu' ? '📄 ૧-પેજ A4 પ્રિન્ટ પ્રિવ્યૂ (આગળ + પાછળ બંને સાથે):' : 'A4 Single-Page Combined Preview:'}</span>
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                      ✓ ૧ જ પેજ પર ફિટ
                    </span>
                  </div>
                  <div className="bg-slate-800 p-3 rounded-2xl border border-slate-700 flex items-center justify-center shadow-inner">
                    <img
                      src={idCompositePreview}
                      alt="A4 ID Card Composite"
                      className="max-h-[380px] w-auto object-contain rounded-lg shadow-2xl bg-white border border-slate-300"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="py-3 px-4 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-xs transition"
          >
            {lang === 'hi' ? 'रद्द करें' : lang === 'en' ? 'Cancel' : 'રદ કરો'}
          </button>

          {scanMode === 'document' ? (
            <>
              <button
                type="button"
                onClick={() => handleExportDocPdf('download')}
                disabled={pages.length === 0 || isGeneratingPdf}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 active:scale-98 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Download size={16} />
                <span>
                  {isGeneratingPdf
                    ? (lang === 'hi' ? 'PDF बन रहा है...' : 'PDF બની રહ્યું છે...')
                    : (lang === 'hi' ? `PDF डाउनलोड (${pages.length} पेज)` : `PDF ડાઉનલોડ કરો (${pages.length} પાના)`)}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleExportDocPdf('share')}
                disabled={pages.length === 0 || isGeneratingPdf}
                className="py-3 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-98 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                title="Share PDF"
              >
                <Share2 size={16} />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => handleExportIdCard('pdf', 'download')}
                disabled={(!idFront && !idBack) || isGeneratingPdf}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/25 active:scale-98 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Download size={16} />
                <span>
                  {isGeneratingPdf
                    ? 'બની રહ્યું છે...'
                    : (lang === 'gu' ? '૧-પેજ PDF ડાઉનલોડ' : 'Download 1-Page PDF')}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleExportIdCard('image', 'download')}
                disabled={(!idFront && !idBack) || isGeneratingPdf}
                className="py-3 px-3 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                title="Download as JPG Image"
              >
                <ImageIcon size={15} />
                <span className="hidden sm:inline">JPG</span>
              </button>

              <button
                type="button"
                onClick={() => handleExportIdCard('pdf', 'share')}
                disabled={(!idFront && !idBack) || isGeneratingPdf}
                className="py-3 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-98 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                title="Share"
              >
                <Share2 size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* ==================================================== */}
      {/* INTERACTIVE CROP & AUTO-FIT MODAL OVERLAY            */}
      {/* ==================================================== */}
      {cropState?.isOpen && (
        <CropModalOverlay
          cropState={cropState}
          setCropState={setCropState}
          onApply={handleApplyCrop}
          lang={lang}
        />
      )}
    </div>
  );
}

// Subcomponent: High Performance Interactive Touch/Mouse Crop Editor
function CropModalOverlay({ cropState, setCropState, onApply, lang }) {
  const [box, setBox] = useState(cropState.cropBox || { x: 0.05, y: 0.05, width: 0.9, height: 0.9 });
  const containerRef = useRef(null);
  const dragModeRef = useRef(null); // 'move' | 'nw' | 'ne' | 'se' | 'sw'
  const startPosRef = useRef({ x: 0, y: 0, box: { ...box } });

  // Update box state safely within 0..1 bounds
  const updateBox = (newBox) => {
    const clamped = {
      x: Math.max(0, Math.min(0.9, newBox.x)),
      y: Math.max(0, Math.min(0.9, newBox.y)),
      width: Math.max(0.1, Math.min(1 - newBox.x, newBox.width)),
      height: Math.max(0.1, Math.min(1 - newBox.y, newBox.height)),
    };
    setBox(clamped);
    setCropState((prev) => ({ ...prev, cropBox: clamped }));
  };

  // Quick Preset Handlers
  const handlePreset = (type) => {
    if (type === 'full') {
      updateBox({ x: 0, y: 0, width: 1, height: 1 });
    } else if (type === 'a4') {
      // A4 ratio 1 : 1.414
      updateBox({ x: 0.1, y: 0.05, width: 0.8, height: Math.min(0.9, 0.8 * 1.414) });
    } else if (type === 'card') {
      // ID Card 1.58 : 1
      updateBox({ x: 0.05, y: 0.2, width: 0.9, height: 0.9 / 1.58 });
    } else if (type === 'square') {
      updateBox({ x: 0.15, y: 0.15, width: 0.7, height: 0.7 });
    } else if (type === 'auto') {
      // Auto edge detect
      const img = new Image();
      img.src = cropState.imageSrc;
      img.onload = () => {
        const detected = detectDocumentBounds(img, img.naturalWidth, img.naturalHeight);
        updateBox(detected);
      };
    }
  };

  // Touch / Mouse Drag handlers
  const onStart = (e, mode) => {
    e.preventDefault();
    e.stopPropagation();
    dragModeRef.current = mode;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    startPosRef.current = {
      x: clientX,
      y: clientY,
      box: { ...box },
    };
  };

  const onMove = (e) => {
    if (!dragModeRef.current || !containerRef.current) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const rect = containerRef.current.getBoundingClientRect();
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
      const nw = Math.max(0.1, Math.min(1 - orig.x, orig.width + dx));
      const nh = Math.max(0.1, Math.min(1 - orig.y, orig.height + dy));
      updateBox({ ...orig, width: nw, height: nh });
    } else if (dragModeRef.current === 'nw') {
      const nx = Math.max(0, Math.min(orig.x + orig.width - 0.1, orig.x + dx));
      const ny = Math.max(0, Math.min(orig.y + orig.height - 0.1, orig.y + dy));
      const nw = orig.width - (nx - orig.x);
      const nh = orig.height - (ny - orig.y);
      updateBox({ x: nx, y: ny, width: nw, height: nh });
    } else if (dragModeRef.current === 'ne') {
      const ny = Math.max(0, Math.min(orig.y + orig.height - 0.1, orig.y + dy));
      const nw = Math.max(0.1, Math.min(1 - orig.x, orig.width + dx));
      const nh = orig.height - (ny - orig.y);
      updateBox({ x: orig.x, y: ny, width: nw, height: nh });
    } else if (dragModeRef.current === 'sw') {
      const nx = Math.max(0, Math.min(orig.x + orig.width - 0.1, orig.x + dx));
      const nw = orig.width - (nx - orig.x);
      const nh = Math.max(0.1, Math.min(1 - orig.y, orig.height + dy));
      updateBox({ x: nx, y: orig.y, width: nw, height: nh });
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
      className="fixed inset-0 z-60 bg-black/90 flex flex-col items-center justify-between p-3 select-none animate-in fade-in"
    >
      {/* Top Header */}
      <div className="w-full max-w-lg flex items-center justify-between text-white py-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-amber-400 text-slate-950 rounded-lg">
            <Crop size={16} />
          </span>
          <span className="font-bold text-sm">
            {lang === 'gu' ? 'દસ્તાવેજ ક્રોપ & ઓટો-ફીટ' : lang === 'hi' ? 'दस्तावेज़ क्रॉप व ऑटो-फ़िट' : 'Crop & Auto-Fit Document'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setCropState(null)}
          className="p-1.5 rounded-full hover:bg-white/20 text-white"
        >
          <X size={20} />
        </button>
      </div>

      {/* Main Interactive Visual Crop Box Area */}
      <div
        ref={containerRef}
        className="relative w-full max-w-lg flex-1 max-h-[65vh] flex items-center justify-center overflow-hidden my-auto"
      >
        <img
          src={cropState.imageSrc}
          alt="To Crop"
          style={{ transform: `rotate(${cropState.rotation}deg)` }}
          className="max-h-full max-w-full object-contain pointer-events-none rounded-lg"
        />

        {/* Darkened Mask Overlay outside crop box */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top dark */}
          <div
            className="absolute top-0 inset-x-0 bg-black/65"
            style={{ height: `${box.y * 100}%` }}
          />
          {/* Bottom dark */}
          <div
            className="absolute bottom-0 inset-x-0 bg-black/65"
            style={{ height: `${(1 - (box.y + box.height)) * 100}%` }}
          />
          {/* Left dark */}
          <div
            className="absolute bg-black/65"
            style={{
              top: `${box.y * 100}%`,
              height: `${box.height * 100}%`,
              left: 0,
              width: `${box.x * 100}%`,
            }}
          />
          {/* Right dark */}
          <div
            className="absolute bg-black/65"
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
        </div>
      </div>

      {/* Preset Buttons & Controls */}
      <div className="w-full max-w-lg space-y-2.5 shrink-0 pt-2">
        <div className="grid grid-cols-5 gap-1.5 bg-white/10 p-1.5 rounded-2xl backdrop-blur-xs">
          <button
            type="button"
            onClick={() => handlePreset('auto')}
            className="py-1.5 text-[11px] font-bold text-amber-300 hover:bg-white/10 rounded-xl transition flex flex-col items-center gap-0.5"
          >
            <Sparkles size={14} />
            <span>{lang === 'gu' ? 'ઓટો ફીટ' : 'Auto'}</span>
          </button>
          <button
            type="button"
            onClick={() => handlePreset('card')}
            className="py-1.5 text-[11px] font-bold text-white hover:bg-white/10 rounded-xl transition flex flex-col items-center gap-0.5"
          >
            <CreditCard size={14} />
            <span>ID કાર્ડ</span>
          </button>
          <button
            type="button"
            onClick={() => handlePreset('a4')}
            className="py-1.5 text-[11px] font-bold text-white hover:bg-white/10 rounded-xl transition flex flex-col items-center gap-0.5"
          >
            <FileText size={14} />
            <span>A4 પાનું</span>
          </button>
          <button
            type="button"
            onClick={() => handlePreset('square')}
            className="py-1.5 text-[11px] font-bold text-white hover:bg-white/10 rounded-xl transition flex flex-col items-center gap-0.5"
          >
            <Crop size={14} />
            <span>૧:૧</span>
          </button>
          <button
            type="button"
            onClick={() => handlePreset('full')}
            className="py-1.5 text-[11px] font-bold text-white hover:bg-white/10 rounded-xl transition flex flex-col items-center gap-0.5"
          >
            <Maximize2 size={14} />
            <span>સંપૂર્ણ</span>
          </button>
        </div>

        {/* Apply & Cancel Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCropState(null)}
            className="flex-1 py-3 bg-white/15 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition"
          >
            {lang === 'gu' ? 'રદ કરો' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={onApply}
            className="flex-1 py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 active:scale-98 transition flex items-center justify-center gap-1.5"
          >
            <Check size={16} />
            <span>{lang === 'gu' ? 'ક્રોપ લાગુ કરો' : 'Apply Crop'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
