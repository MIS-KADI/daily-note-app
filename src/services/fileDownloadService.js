// Cross-Platform File Download, Storage, Sharing and Notification Service
// Supports: Native Android (Capacitor Filesystem & Share) and Web/Mobile Browsers
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Haptics, NotificationType } from '@capacitor/haptics';
import { notificationService } from './notificationService';

/**
 * Converts a Blob to a pure Base64 string (without the data URL prefix)
 */
export const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const parts = reader.result.split(',');
        resolve(parts.length > 1 ? parts[1] : parts[0]);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Downloads, saves, shares and notifies for a generated PDF report
 */
export async function downloadOrSharePDF({
  pdfBlob,
  filename,
  title = 'Daily Diary Report',
  lang = 'gu',
  autoShare = true,
}) {
  const isNative = Capacitor.isNativePlatform();

  // Try to ensure notification permissions are available
  try {
    if (!notificationService.hasPermission()) {
      await notificationService.requestPermission();
    }
  } catch (_) {}

  if (isNative) {
    // 1. Native Android: Convert to Base64 and write via Filesystem
    const base64Data = await blobToBase64(pdfBlob);

    // Save in Cache for instant FileProvider access and sharing
    const cacheFile = await Filesystem.writeFile({
      path: filename,
      data: base64Data,
      directory: Directory.Cache,
    });

    // Also attempt to save in Documents for persistent storage
    try {
      await Filesystem.writeFile({
        path: filename,
        data: base64Data,
        directory: Directory.Documents,
        recursive: true,
      });
    } catch (e) {
      console.warn('Could not write to Documents directory:', e);
    }

    // 2. Open Android Native Share / App Chooser (Drive PDF, Adobe, WhatsApp, etc.)
    if (autoShare) {
      try {
        await Share.share({
          title,
          text: `${title}: ${filename}`,
          files: [cacheFile.uri],
          dialogTitle:
            lang === 'gu'
              ? 'રિપોર્ટ ઓપન અથવા શેર કરો'
              : lang === 'hi'
              ? 'रिपोर्ट खोलें या शेयर करें'
              : 'Open or Share Report',
        });
      } catch (shareErr) {
        console.log('Share dismissed or cancelled by user:', shareErr);
      }
    }

    // 3. Trigger Notification
    await notificationService.send(
      lang === 'gu'
        ? '📄 રિપોર્ટ ડાઉનલોડ થઈ ગયો છે!'
        : lang === 'hi'
        ? '📄 रिपोर्ट डाउनलोड हो गई है!'
        : '📄 Report Downloaded!',
      {
        body:
          lang === 'gu'
            ? `${filename} સફળતાપૂર્વક તૈયાર થયો છે. જોવા માટે અહીં ટેપ કરો.`
            : lang === 'hi'
            ? `${filename} सफलतापूर्वक तैयार हो गई है।`
            : `${filename} is ready to view.`,
      }
    );

    // 4. Haptic Feedback
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch (_) {}

    return {
      success: true,
      filename,
      blob: pdfBlob,
      nativeUri: cacheFile.uri,
      isNative: true,
      type: 'pdf',
    };
  } else {
    // Web / Mobile Browser Platform
    const blobUrl = URL.createObjectURL(pdfBlob);

    // 1. If mobile browser supports Web Share API with files, try to share
    let webShareTriggered = false;
    if (autoShare && navigator.canShare) {
      try {
        const file = new File([pdfBlob], filename, { type: 'application/pdf' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title,
            files: [file],
          });
          webShareTriggered = true;
        }
      } catch (err) {
        console.log('Web share cancelled or unsupported:', err);
      }
    }

    // 2. Standard Browser File Download Anchor
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
    }, 250);

    // 3. Trigger Notification
    await notificationService.send(
      lang === 'gu'
        ? '📄 રિપોર્ટ ડાઉનલોડ થઈ ગયો છે!'
        : lang === 'hi'
        ? '📄 रिपोर्ट डाउनलोड हो गई है!'
        : '📄 Report Downloaded!',
      {
        body: `${filename}`,
      }
    );

    return {
      success: true,
      filename,
      blob: pdfBlob,
      blobUrl,
      isNative: false,
      type: 'pdf',
      webShareTriggered,
    };
  }
}

/**
 * Downloads, saves, shares and notifies for an Excel / CSV report
 */
export async function downloadOrShareCSV({
  filename,
  csvString,
  title = 'Finance Report',
  lang = 'gu',
  autoShare = true,
}) {
  // UTF-8 BOM (\uFEFF) ensures Excel displays Gujarati / Hindi text properly
  const contentWithBom = '\uFEFF' + csvString;
  const isNative = Capacitor.isNativePlatform();

  // Try notification permission
  try {
    if (!notificationService.hasPermission()) {
      await notificationService.requestPermission();
    }
  } catch (_) {}

  if (isNative) {
    // 1. Native Android: Write CSV to Cache directory
    const cacheFile = await Filesystem.writeFile({
      path: filename,
      data: contentWithBom,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    });

    // Also attempt persistent save in Documents
    try {
      await Filesystem.writeFile({
        path: filename,
        data: contentWithBom,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
        recursive: true,
      });
    } catch (e) {
      console.warn('Could not write CSV to Documents:', e);
    }

    // 2. Open Android Native Share / Excel app chooser
    if (autoShare) {
      try {
        await Share.share({
          title,
          text: `${title}: ${filename}`,
          files: [cacheFile.uri],
          dialogTitle:
            lang === 'gu'
              ? 'એક્સેલ / CSV રિપોર્ટ ઓપન અથવા શેર કરો'
              : lang === 'hi'
              ? 'एक्सेल / CSV रिपोर्ट खोलें या शेयर करें'
              : 'Open or Share Excel / CSV Report',
        });
      } catch (shareErr) {
        console.log('Share dismissed or cancelled by user:', shareErr);
      }
    }

    // 3. Trigger Notification
    await notificationService.send(
      lang === 'gu'
        ? '📊 એક્સેલ રિપોર્ટ તૈયાર થઈ ગયો છે!'
        : lang === 'hi'
        ? '📊 एक्सेल रिपोर्ट तैयार हो गई है!'
        : '📊 Excel Report Ready!',
      {
        body:
          lang === 'gu'
            ? `${filename} સફળતાપૂર્વક તૈયાર થયો છે.`
            : `${filename} is ready to view.`,
      }
    );

    // 4. Haptic Feedback
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch (_) {}

    return {
      success: true,
      filename,
      nativeUri: cacheFile.uri,
      isNative: true,
      type: 'csv',
      csvString,
    };
  } else {
    // Web / Mobile Browser Platform
    const blob = new Blob([contentWithBom], { type: 'text/csv;charset=utf-8;' });
    const blobUrl = URL.createObjectURL(blob);

    // 1. Mobile Web Share
    if (autoShare && navigator.canShare) {
      try {
        const file = new File([blob], filename, { type: 'text/csv;charset=utf-8;' });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title,
            files: [file],
          });
        }
      } catch (err) {
        console.log('Web share cancelled or unsupported:', err);
      }
    }

    // 2. Standard Download Anchor
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
    }, 250);

    // 3. Trigger Notification
    await notificationService.send(
      lang === 'gu'
        ? '📊 એક્સેલ રિપોર્ટ ડાઉનલોડ થઈ ગયો છે!'
        : lang === 'hi'
        ? '📊 एक्सेल रिपोर्ट डाउनलोड हो गई है!'
        : '📊 Excel Report Downloaded!',
      {
        body: `${filename}`,
      }
    );

    return {
      success: true,
      filename,
      blob,
      blobUrl,
      isNative: false,
      type: 'csv',
      csvString,
    };
  }
}

/**
 * Directly opens or views a generated file based on platform
 */
export async function directOpenFile({
  nativeUri,
  blobUrl,
  blob,
  filename,
  isNative,
  lang = 'gu',
}) {
  if (isNative && nativeUri) {
    try {
      await Share.share({
        title: filename,
        files: [nativeUri],
        dialogTitle:
          lang === 'gu'
            ? 'રિપોર્ટ ઓપન કરવા એપ્લિકેશન પસંદ કરો'
            : lang === 'hi'
            ? 'रिपोर्ट खोलने के लिए ऐप चुनें'
            : 'Select app to open report',
      });
      return true;
    } catch (e) {
      console.warn('Native open error:', e);
      return false;
    }
  }

  // Web Browser: Open in new tab/window
  if (blobUrl) {
    window.open(blobUrl, '_blank');
    return true;
  } else if (blob) {
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    return true;
  }
  return false;
}
