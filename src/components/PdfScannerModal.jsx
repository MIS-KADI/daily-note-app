import React, { useState, useRef } from 'react';
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
  ZoomIn,
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

export default function PdfScannerModal({ isOpen, onClose, lang = 'gu' }) {
  const [pages, setPages] = useState([]); // [{ id, dataUrl, processedUrl, filter: 'magic', rotation: 0 }]
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [docTitle, setDocTitle] = useState(() => `Document_${new Date().toISOString().split('T')[0]}`);
  const [globalFilter, setGlobalFilter] = useState('clean_bw');
  const [pageSize, setPageSize] = useState('a4'); // 'a4', 'letter'
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  if (!isOpen) return null;

  // Process image with selected filter on canvas
  const processImage = (dataUrl, filterType, rotation = 0) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const isRotated = rotation % 180 !== 0;
        const w = isRotated ? img.naturalHeight : img.naturalWidth;
        const h = isRotated ? img.naturalWidth : img.naturalHeight;

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');

        // Apply rotation
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
        ctx.restore();

        if (filterType === 'original') {
          resolve(canvas.toDataURL('image/jpeg', 0.92));
          return;
        }

        const imgData = ctx.getImageData(0, 0, w, h);
        const d = imgData.data;

        if (filterType === 'grayscale') {
          for (let i = 0; i < d.length; i += 4) {
            const gray = Math.round(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]);
            d[i] = gray;
            d[i + 1] = gray;
            d[i + 2] = gray;
          }
        } else if (filterType === 'magic') {
          // Magic color: boost contrast & saturation, slightly whiten light areas
          for (let i = 0; i < d.length; i += 4) {
            let r = d[i];
            let g = d[i + 1];
            let b = d[i + 2];
            // Contrast stretch
            r = Math.min(255, Math.max(0, ((r - 128) * 1.35) + 128));
            g = Math.min(255, Math.max(0, ((g - 128) * 1.35) + 128));
            b = Math.min(255, Math.max(0, ((b - 128) * 1.35) + 128));
            // Whiten bright page background
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
          // Document Clean B&W: high-contrast text enhancement
          for (let i = 0; i < d.length; i += 4) {
            const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
            // Adaptive threshold
            if (gray > 140) {
              d[i] = 255;
              d[i + 1] = 255;
              d[i + 2] = 255;
            } else {
              // Darken text
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
  };

  // Handle uploading photos/documents
  const handleAddPhotos = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const rawUrl = event.target.result;
        const processed = await processImage(rawUrl, globalFilter, 0);
        setPages((prev) => [
          ...prev,
          {
            id: 'page-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
            dataUrl: rawUrl,
            processedUrl: processed,
            filter: globalFilter,
            rotation: 0,
            name: file.name,
          },
        ]);
      };
      reader.readAsDataURL(file);
    }
  };

  // Change filter for a page or all pages
  const handleApplyFilter = async (filterId, applyToAll = false) => {
    if (pages.length === 0) return;
    if (applyToAll) {
      setGlobalFilter(filterId);
      const updated = await Promise.all(
        pages.map(async (p) => {
          const proc = await processImage(p.dataUrl, filterId, p.rotation);
          return { ...p, filter: filterId, processedUrl: proc };
        })
      );
      setPages(updated);
    } else {
      const target = pages[activePageIndex];
      if (!target) return;
      const proc = await processImage(target.dataUrl, filterId, target.rotation);
      setPages((prev) =>
        prev.map((p, idx) => (idx === activePageIndex ? { ...p, filter: filterId, processedUrl: proc } : p))
      );
    }
  };

  // Rotate current page
  const handleRotatePage = async (index) => {
    const target = pages[index];
    if (!target) return;
    const nextRot = (target.rotation + 90) % 360;
    const proc = await processImage(target.dataUrl, target.filter, nextRot);
    setPages((prev) =>
      prev.map((p, idx) => (idx === index ? { ...p, rotation: nextRot, processedUrl: proc } : p))
    );
  };

  // Reorder pages
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

  // Delete page
  const handleDeletePage = (index) => {
    const newPages = pages.filter((_, idx) => idx !== index);
    setPages(newPages);
    if (activePageIndex >= newPages.length) {
      setActivePageIndex(Math.max(0, newPages.length - 1));
    }
  };

  // Export as multi-page PDF using jsPDF
  const handleExportPdf = async (action = 'download') => {
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

  const activePage = pages[activePageIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-none sm:rounded-3xl w-full max-w-xl h-full sm:h-auto sm:max-h-[94vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-white/20 rounded-xl">
              <FileText size={20} />
            </span>
            <div>
              <h3 className="font-bold text-sm leading-tight">
                {lang === 'hi' ? '📄 दस्तावेज़ व फ़ोटो से PDF स्कैनर' : lang === 'en' ? '📄 Document & Photo to PDF Scanner' : '📄 દસ્તાવેજ & ફોટો માંથી PDF સ્કેનર'}
              </h3>
              <p className="text-[11px] text-blue-100">
                {pages.length} {lang === 'hi' ? 'पृष्ठ जोड़े गए' : lang === 'en' ? 'Pages Scanned' : 'પાના સ્કેન કર્યા'}
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

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
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
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleAddPhotos}
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleAddPhotos}
              />

              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition"
              >
                <Camera size={14} />
                <span>{lang === 'hi' ? 'कैमरा' : lang === 'en' ? 'Camera' : 'કેમેરા'}</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
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
                  onClick={() => handleApplyFilter(globalFilter, true)}
                  className="text-[11px] font-bold text-blue-600 hover:underline"
                >
                  {lang === 'hi' ? 'सभी पृष्ठों पर लागू करें' : lang === 'en' ? 'Apply to All Pages' : 'બધા પાના પર લાગુ કરો'}
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {SCAN_FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => handleApplyFilter(f.id, false)}
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

                {/* Quick Page Actions */}
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-xs p-1 rounded-xl border border-white/20">
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
                    onClick={() => fileInputRef.current?.click()}
                    className="w-16 h-20 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-blue-600 shrink-0 transition"
                  >
                    <Upload size={16} />
                    <span className="text-[9px] font-bold">+ {lang === 'hi' ? 'जोड़ें' : 'Add'}</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-10 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <FileText size={28} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-800">
                  {lang === 'hi' ? 'कोई फ़ोटो या दस्तावेज़ नहीं चुना गया' : lang === 'en' ? 'No Document or Photo Selected' : 'હજુ કોઈ ફોટો કે દસ્તાવેજ પસંદ કરેલ નથી'}
                </h4>
                <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                  {lang === 'hi'
                    ? 'अपने बिल, रसीदें या किसी भी फ़ोटो को कैमरे से स्कैन करें और एक क्लिक में PDF बनाएं।'
                    : lang === 'en'
                    ? 'Capture receipts, notes or bills from camera or gallery and convert into clean PDF.'
                    : 'તમારા બિલ, રસીદ કે કોઈપણ ફોટો કેમેરા કે ગેલેરીમાંથી ઉમેરો અને ૧-ક્લિકમાં સ્વચ્છ PDF બનાવો.'}
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition flex items-center gap-1.5"
                >
                  <Camera size={15} />
                  <span>{lang === 'hi' ? 'कैमरा से स्कैन करें' : lang === 'en' ? 'Scan with Camera' : 'કેમેરાથી સ્કેન કરો'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition flex items-center gap-1.5"
                >
                  <Upload size={15} />
                  <span>{lang === 'hi' ? 'फ़ोटो चुनें' : lang === 'en' ? 'Pick Photos' : 'ફોટા પસંદ કરો'}</span>
                </button>
              </div>
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

          <button
            type="button"
            onClick={() => handleExportPdf('download')}
            disabled={pages.length === 0 || isGeneratingPdf}
            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 active:scale-98 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Download size={16} />
            <span>
              {isGeneratingPdf
                ? (lang === 'hi' ? 'PDF बन रहा है...' : lang === 'en' ? 'Creating PDF...' : 'PDF બની રહ્યું છે...')
                : (lang === 'hi' ? `PDF डाउनलोड करें (${pages.length} पेज)` : lang === 'en' ? `Save & Download PDF (${pages.length} Pages)` : `PDF ડાઉનલોડ કરો (${pages.length} પાના)`)}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleExportPdf('share')}
            disabled={pages.length === 0 || isGeneratingPdf}
            className="py-3 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-98 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            title="Share PDF"
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
