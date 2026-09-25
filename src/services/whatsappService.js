/**
 * WhatsApp Integration Service
 * Generates formatted WhatsApp messages for:
 * 1. Birthday & Anniversary Wishes
 * 2. Khata Payment Reminders
 * 3. Meeting & Task Reminders
 * 4. Diary Notes Sharing
 * Fully localized for 7 languages (gu, hi, en, es, fr, de, ar)
 */

export const sanitizePhoneNumber = (phone = '') => {
  if (!phone) return '';
  // Remove spaces, dashes, brackets, plus
  let cleaned = phone.replace(/[^0-9]/g, '');
  // If 10-digit Indian number without country code, prepend 91
  if (cleaned.length === 10) {
    cleaned = '91' + cleaned;
  }
  return cleaned;
};

export const openWhatsApp = (phone, message) => {
  const cleanPhone = sanitizePhoneNumber(phone);
  const encodedText = encodeURIComponent(message || '');
  let url = '';
  if (cleanPhone) {
    url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
  } else {
    // If no phone provided, lets user choose contact in WhatsApp
    url = `https://api.whatsapp.com/send?text=${encodedText}`;
  }
  window.open(url, '_blank', 'noopener,noreferrer');
};

const DEFAULT_FRIEND_NAME = {
  gu: 'સ્નેહીજન',
  hi: 'मित्र',
  en: 'Friend',
  es: 'Amigo/a',
  fr: 'Ami(e)',
  de: 'Freund(in)',
  ar: 'صديقي العزيز',
};

export const whatsappService = {
  /**
   * Send heartfelt Birthday or Anniversary wish
   */
  sendWish({ name, type = 'birthday', phone = '', relation = '', senderName = 'Daily Diary', lang = 'gu' }) {
    let message = '';
    const displayName = name || DEFAULT_FRIEND_NAME[lang] || DEFAULT_FRIEND_NAME.en || DEFAULT_FRIEND_NAME.gu;

    if (type === 'birthday') {
      if (lang === 'hi') {
        message = `🎂 प्रिय ${displayName},\n\nजन्मदिन की बहुत-बहुत हार्दिक शुभकामनाएँ! 💐✨\n\nईश्वर से प्रार्थना है कि आपका यह नया वर्ष उत्तम स्वास्थ्य, सुख, शांति और असीम समृद्धि लेकर आए। आप सदा मुस्कुराते रहें! 🎉🙏\n\n— ${senderName}`;
      } else if (lang === 'en') {
        message = `🎂 Dear ${displayName},\n\nWishing you a very Happy Birthday! 💐✨\n\nMay this year bring immense happiness, great health, peace, and continued success to your life! Have a wonderful day ahead! 🎉🙏\n\n— ${senderName}`;
      } else if (lang === 'es') {
        message = `🎂 Estimado/a ${displayName},\n\n¡Le deseamos un muy Feliz Cumpleaños! 💐✨\n\n¡Que este nuevo año le traiga inmensa felicidad, salud, paz y mucho éxito! ¡Que pase un día maravilloso! 🎉🙏\n\n— ${senderName}`;
      } else if (lang === 'fr') {
        message = `🎂 Cher/Chère ${displayName},\n\nJoyeux Anniversaire ! 💐✨\n\nQue cette nouvelle année vous apporte bonheur, santé, sérénité et plein succès ! Passez une excellente journée ! 🎉🙏\n\n— ${senderName}`;
      } else if (lang === 'de') {
        message = `🎂 Liebe(r) ${displayName},\n\nHerzlichen Glückwunsch zum Geburtstag! 💐✨\n\nMöge dieses neue Lebensjahr Ihnen viel Freude, beste Gesundheit, Frieden und großen Erfolg bringen! Feiern Sie schön! 🎉🙏\n\n— ${senderName}`;
      } else if (lang === 'ar') {
        message = `🎂 عزيزي/عزيزتي ${displayName}،\n\nعيد ميلاد سعيد وكل عام وأنتم بألف خير! 💐✨\n\nنتمنى لكم عاماً مليئاً بالصحة والسعادة وراحة البال والنجاح المستمر! 🎉🙏\n\n— ${senderName}`;
      } else {
        // Gujarati
        message = `🎂 પ્રિય ${displayName},\n\nજન્મદિવસની ખૂબ ખૂબ હાર્દિક શુભકામનાઓ! 💐✨\n\nપ્રભુ ચરણોમાં પ્રાર્થના કે આપનું આ નવું વર્ષ ઉત્તમ આરોગ્ય, શાંતિ, સુખ અને અસીમ સમૃદ્ધિ લઈને આવે. આપ સદાય હસતા અને પ્રગતિના પંથે આગળ વધતા રહો! 🎉🙏\n\n— ${senderName}`;
      }
    } else if (type === 'anniversary') {
      if (lang === 'hi') {
        message = `💍 प्रिय ${displayName},\n\nशादी की सालगिरह की बहुत-बहुत बधाई और शुभकामनाएँ! 💐🥂\n\nआप दोनों का वैवाहिक जीवन सदा प्रेम, विश्वास और खुशियों से भरा रहे। आपकी जोड़ी हमेशा सलामत रहे! ✨🙏\n\n— ${senderName}`;
      } else if (lang === 'en') {
        message = `💍 Dear ${displayName},\n\nHappy Wedding Anniversary! 💐🥂\n\nWishing both of you a wonderful journey of love, trust, and lasting happiness together! May God bless your bond always! ✨🙏\n\n— ${senderName}`;
      } else if (lang === 'es') {
        message = `💍 Estimados ${displayName},\n\n¡Feliz Aniversario de Bodas! 💐🥂\n\n¡Les deseamos un hermoso camino de amor, confianza y felicidad eterna juntos! ¡Que su unión sea bendecida siempre! ✨🙏\n\n— ${senderName}`;
      } else if (lang === 'fr') {
        message = `💍 Chers ${displayName},\n\nJoyeux Anniversaire de Mariage ! 💐🥂\n\nNous vous souhaitons une belle vie remplie d'amour, de confiance et de bonheur durable à deux ! Que votre union soit toujours protégée ! ✨🙏\n\n— ${senderName}`;
      } else if (lang === 'de') {
        message = `💍 Liebe(r) ${displayName},\n\nAlles Gute zum Hochzeitstag! 💐🥂\n\nWir wünschen Ihnen weiterhin eine wunderbare Zeit voller Liebe, Vertrauen und gemeinsamen Glücks! Möge Ihre Ehe immer gesegnet sein! ✨🙏\n\n— ${senderName}`;
      } else if (lang === 'ar') {
        message = `💍 الأعزاء ${displayName}،\n\nذكرى زواج سعيدة ومباركة! 💐🥂\n\nنتمنى لكما حياة زوجية مفعمة بالمحبة والثقة والسعادة الدائمة معاً! بارك الله فيكما! ✨🙏\n\n— ${senderName}`;
      } else {
        // Gujarati
        message = `💍 પ્રિય ${displayName},\n\nલગ્ન વર્ષગાંઠની ખૂબ ખૂબ હાર્દિક શુભકામનાઓ! 💐🥂\n\nઆપ બંનેનું દાંપત્યજીવન પ્રેમ, વિશ્વાસ અને સુખ-શાંતિથી સદા મહેકતું રહે. ઈશ્વર આપની જોડીને સદાય ખુશહાલ અને દીર્ઘાયુ રાખે એવી અંતરપૂર્વક પ્રાર્થના! ✨🙏\n\n— ${senderName}`;
      }
    } else {
      // Special event
      message = `🌟 ${displayName},\n\n💐🙏\n\n— ${senderName}`;
    }

    openWhatsApp(phone, message);
  },

  /**
   * Send Khata Payment Reminder
   */
  sendPaymentReminder({ partyName, phone = '', amount, type = 'to_receive', dueDate = '', senderName = 'Daily Diary', lang = 'gu' }) {
    let message = '';
    const formattedAmt = Number(amount || 0).toLocaleString();

    if (lang === 'hi') {
      if (type === 'to_receive') {
        message = `🙏 नमस्ते ${partyName}जी,\n\nयह आपके खाते के बकाया भुगतान के संबंध में एक विनम्र स्मरण पत्र है:\n\n💰 बकाया राशि: ₹${formattedAmt}\n📅 नियत तिथि: ${dueDate || 'यथाशीघ्र'}\n\nकृपया समय पर भुगतान की व्यवस्था करने की कृपा करें। किसी भी प्रश्न के लिए संपर्क करें।\nधन्यवाद! 🙏\n— ${senderName}`;
      } else {
        message = `🙏 नमस्ते ${partyName}जी,\n\nआपके खाते की देय राशि ₹${formattedAmt} का विवरण हमारे पास दर्ज है। शीघ्र ही भुगतान की प्रक्रिया कर दी जाएगी।\nधन्यवाद! 🙏\n— ${senderName}`;
      }
    } else if (lang === 'en') {
      if (type === 'to_receive') {
        message = `🙏 Hello ${partyName},\n\nThis is a gentle reminder regarding the pending payment on your ledger:\n\n💰 Outstanding Amount: ₹${formattedAmt}\n📅 Due Date: ${dueDate || 'As early as possible'}\n\nKindly arrange for the settlement at your earliest convenience.\nThank you! 🙏\n— ${senderName}`;
      } else {
        message = `🙏 Hello ${partyName},\n\nWe have recorded the payable amount of ₹${formattedAmt} in our ledger. It will be settled shortly.\nThank you! 🙏\n— ${senderName}`;
      }
    } else if (lang === 'es') {
      if (type === 'to_receive') {
        message = `🙏 Estimado/a ${partyName},\n\nLe enviamos este recordatorio cordial sobre el saldo pendiente en su cuenta:\n\n💰 Importe pendiente: ₹${formattedAmt}\n📅 Fecha de vencimiento: ${dueDate || 'Lo antes posible'}\n\nLe agradecemos gestionar el pago a la brevedad.\n¡Gracias! 🙏\n— ${senderName}`;
      } else {
        message = `🙏 Estimado/a ${partyName},\n\nHemos registrado el importe a pagar de ₹${formattedAmt} en nuestro libro. Será liquidado en breve.\n¡Gracias! 🙏\n— ${senderName}`;
      }
    } else if (lang === 'fr') {
      if (type === 'to_receive') {
        message = `🙏 Bonjour ${partyName},\n\nCeci est un rappel amical concernant le solde impayé de votre compte :\n\n💰 Montant impayé : ₹${formattedAmt}\n📅 Date d’échéance : ${dueDate || 'Dès que possible'}\n\nMerci de bien vouloir procéder au règlement dès que possible.\nMerci ! 🙏\n— ${senderName}`;
      } else {
        message = `🙏 Bonjour ${partyName},\n\nNous avons bien noté le montant payable de ₹${formattedAmt} dans nos comptes. Le règlement interviendra très bientôt.\nMerci ! 🙏\n— ${senderName}`;
      }
    } else if (lang === 'de') {
      if (type === 'to_receive') {
        message = `🙏 Hallo ${partyName},\n\nDies ist eine freundliche Erinnerung an den offenen Betrag in Ihrem Konto:\n\n💰 Ausstehender Betrag: ₹${formattedAmt}\n📅 Fälligkeitsdatum: ${dueDate || 'So bald wie möglich'}\n\nBitte veranlassen Sie die Begleichung baldmöglichst.\nVielen Dank! 🙏\n— ${senderName}`;
      } else {
        message = `🙏 Hallo ${partyName},\n\nDer fällige Betrag von ₹${formattedAmt} ist in unseren Unterlagen vermerkt und wird in Kürze beglichen.\nVielen Dank! 🙏\n— ${senderName}`;
      }
    } else if (lang === 'ar') {
      if (type === 'to_receive') {
        message = `🙏 مرحباً ${partyName}،\n\nهذا تذكير لطيف بشأن المبلغ المستحق في حسابك:\n\n💰 المبلغ المستحق: ₹${formattedAmt}\n📅 تاريخ الاستحقاق: ${dueDate || 'في أقرب وقت ممكن'}\n\nيرجى التكرم بترتيب سداد المبلغ في أقرب وقت.\nشكراً لك! 🙏\n— ${senderName}`;
      } else {
        message = `🙏 مرحباً ${partyName}،\n\nتم تسجيل المبلغ المستحق للدفع بقيمة ₹${formattedAmt} في سجلنا، وسيتم السداد قريباً.\nشكراً لك! 🙏\n— ${senderName}`;
      }
    } else {
      // Gujarati
      if (type === 'to_receive') {
        message = `🙏 નમસ્તે ${partyName}જી,\n\nઆપના ખાતાના બાકી નાણાંની ચુકવણી બાબતે નમ્ર સ્મૃતિપત્ર:\n\n💰 બાકી રકમ: ₹${formattedAmt}\n📅 પાકતી તારીખ: ${dueDate || 'વહેલી તકે'}\n\nકૃપા કરીને સમયસર નાણાંની પતાવટ કરી આપવા વિનંતી છે. કોઈ વિગત હોય તો જણાવશો.\nઆભાર! 🙏\n— ${senderName}`;
      } else {
        message = `🙏 નમસ્તે ${partyName}જી,\n\nઆપના ખાતાની આપવાની રકમ ₹${formattedAmt} અમારા ચોપડે નોંધાયેલ છે. અમે ટૂંક સમયમાં પતાવટ કરીશું.\nઆભાર! 🙏\n— ${senderName}`;
      }
    }

    openWhatsApp(phone, message);
  },

  /**
   * Share a Note via WhatsApp
   */
  shareNote(noteOrObj, maybeLang) {
    const title = noteOrObj?.title || '';
    const content = noteOrObj?.content || '';
    const senderName = noteOrObj?.senderName || 'Daily Diary';
    const lang = (typeof maybeLang === 'string' ? maybeLang : noteOrObj?.lang) || 'gu';

    const notePrefix = {
      gu: 'નોંધ',
      hi: 'नोट',
      en: 'Note',
      es: 'Nota',
      fr: 'Note',
      de: 'Notiz',
      ar: 'ملاحظة',
    };
    const prefix = notePrefix[lang] || notePrefix.en || notePrefix.gu;

    const message = `📝 *${prefix}: ${title}*\n\n${content}\n\n— ${senderName}`;
    openWhatsApp('', message);
  },

  /**
   * Share a Meeting or Task via WhatsApp
   */
  shareReminder(remOrObj, maybeLang) {
    const title = remOrObj?.title || '';
    const date = remOrObj?.date || '';
    const time = remOrObj?.time || '';
    const description = remOrObj?.description || '';
    const senderName = remOrObj?.senderName || 'Daily Diary';
    const lang = (typeof maybeLang === 'string' ? maybeLang : remOrObj?.lang) || 'gu';

    const labels = {
      gu: { header: 'યાદી / મીટિંગ', date: 'તારીખ', today: 'આજે', time: 'સમય', details: 'વિગત' },
      hi: { header: 'कार्य / मीटिंग', date: 'तारीख', today: 'आज', time: 'समय', details: 'विवरण' },
      en: { header: 'Task / Meeting', date: 'Date', today: 'Today', time: 'Time', details: 'Details' },
      es: { header: 'Tarea / Reunión', date: 'Fecha', today: 'Hoy', time: 'Hora', details: 'Detalles' },
      fr: { header: 'Tâche / Réunion', date: 'Date', today: 'Aujourd’hui', time: 'Heure', details: 'Détails' },
      de: { header: 'Aufgabe / Termin', date: 'Datum', today: 'Heute', time: 'Uhrzeit', details: 'Details' },
      ar: { header: 'مهمة / اجتماع', date: 'التاريخ', today: 'اليوم', time: 'الوقت', details: 'التفاصيل' },
    };

    const L = labels[lang] || labels.en || labels.gu;

    const message = `⏰ *${L.header}:* ${title}\n📅 *${L.date}:* ${date || L.today}\n⏱️ *${L.time}:* ${time || '-'}\n${description ? `ℹ️ *${L.details}:* ${description}\n` : ''}\n— ${senderName}`;
    openWhatsApp('', message);
  },
};
