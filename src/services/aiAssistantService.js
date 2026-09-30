/**
 * Smart AI Voice & Text Natural Language Assistant Service
 * Supports Gujarati (gu), Hindi (hi), and English (en)
 * Parses natural language commands into actionable diary, finance, task, khata, or health entries.
 */

// Convert Gujarati & Devanagari numerals to standard digits
export const normalizeNumerals = (str = '') => {
  const gujaratiDigits = { '૦': '0', '૧': '1', '૨': '2', '૩': '3', '૪': '4', '૫': '5', '૬': '6', '૭': '7', '૮': '8', '૯': '9' };
  const devanagariDigits = { '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9' };

  let result = '';
  for (const ch of str) {
    if (gujaratiDigits[ch] !== undefined) {
      result += gujaratiDigits[ch];
    } else if (devanagariDigits[ch] !== undefined) {
      result += devanagariDigits[ch];
    } else {
      result += ch;
    }
  }
  return result;
};

// Extract numerical amount from text (e.g. "૨૫૦ રૂપિયા", "5000 rs", "₹1200")
export const extractAmount = (text = '') => {
  const clean = normalizeNumerals(text);
  // Match patterns like ₹500, 500 rs, 500 રૂપિયા, 500.00
  const match = clean.match(/(?:₹|rs\.?|રૂપિયા|रुपये)?\s*(\d+(?:[.,]\d+)?)\s*(?:₹|rs\.?|રૂપિયા|रुपये|\/-)?/i);
  if (match && match[1]) {
    const num = parseFloat(match[1].replace(/,/g, ''));
    if (!isNaN(num) && num > 0) return num;
  }
  // Generic number fallback
  const fallbackMatch = clean.match(/\b\d+(\.\d+)?\b/);
  if (fallbackMatch) {
    const num = parseFloat(fallbackMatch[0]);
    if (!isNaN(num) && num > 0) return num;
  }
  return null;
};

// Extract time (e.g. "૧૧:૩૦", "૫ વાગ્યે", "5:00 pm", "10 am")
export const extractTime = (text = '') => {
  const clean = normalizeNumerals(text).toLowerCase();
  
  // E.g. "11:30", "05:00"
  const colonMatch = clean.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
  if (colonMatch) {
    let hours = parseInt(colonMatch[1], 10);
    const mins = colonMatch[2];
    const meridian = colonMatch[3]?.toLowerCase();
    if (meridian === 'pm' && hours < 12) hours += 12;
    if (meridian === 'am' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${mins}`;
  }

  // E.g. "૫ વાગ્યે", "5 baje", "5 pm", "5 o'clock"
  const hourMatch = clean.match(/(\d{1,2})\s*(?:વાગ્યે|બપોરે|સવારે|સાંજે|રાત્રે|baje|pm|am|o'clock)/i);
  if (hourMatch) {
    let hour = parseInt(hourMatch[1], 10);
    if ((clean.includes('સાંજે') || clean.includes('રાત્રે') || clean.includes('pm') || clean.includes('બપોરે')) && hour < 12) {
      hour += 12;
    }
    return `${String(hour).padStart(2, '0')}:00`;
  }

  return '10:00';
};

// Extract date (e.g. "કાલે", "આવતીકાલે", "આજે", "પરમદિવસે", "tomorrow", "today")
export const extractDate = (text = '') => {
  const t = text.toLowerCase();
  const today = new Date();
  
  if (t.includes('કાલે') || t.includes('આવતીકાલે') || t.includes('कल') || t.includes('tomorrow')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }
  
  if (t.includes('પરમદિવસે') || t.includes('परसों') || t.includes('day after tomorrow')) {
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);
    return dayAfter.toISOString().split('T')[0];
  }

  return today.toISOString().split('T')[0];
};

export const aiAssistantService = {
  /**
   * Main NLP parser to categorize user's voice command into:
   * 1. expense (આવક/ખર્ચ)
   * 2. income (આવક/જમા)
   * 3. reminder (કામો/મીટિંગ)
   * 4. khata (ખાતાવહી લેતી-દેતી)
   * 5. water (પાણી પીવાનું લોગ)
   * 6. note (ડાયરી નોંધ)
   */
  parseInput(rawText = '', lang = 'gu') {
    const text = rawText.trim();
    if (!text) return null;

    const lower = text.toLowerCase();
    const amount = extractAmount(text);
    const date = extractDate(text);
    const time = extractTime(text);

    // 1. Water Intake Check
    if (
      lower.includes('પાણી') ||
      lower.includes('ગ્લાસ') ||
      lower.includes('पानी') ||
      lower.includes('ग्लास') ||
      lower.includes('water') ||
      lower.includes('glass')
    ) {
      const glasses = amount && amount <= 10 ? Math.round(amount) : 1;
      return {
        intent: 'water',
        type: 'water',
        glasses,
        title: lang === 'hi' ? `${glasses} ग्लास पानी पिया` : lang === 'en' ? `Drank ${glasses} glasses of water` : `${glasses} ગ્લાસ પાણી પીધું`,
        details: `${glasses * 250} ml`,
        confirmationMessage: lang === 'hi' ? `${glasses} ग्लास पानी का सेवन दर्ज किया गया!` : lang === 'en' ? `Logged ${glasses} glasses of water!` : `${glasses} ગ્લાસ પાણીની એન્ટ્રી ઉમેરી દીધી! 💧`,
      };
    }

    // 2. Medicine / Tablet Schedule Check
    if (
      lower.includes('દવા') ||
      lower.includes('ગોળી') ||
      lower.includes('ટેબ્લેટ') ||
      lower.includes('કેપ્સ્યુલ') ||
      lower.includes('સિરપ') ||
      lower.includes('medicine') ||
      lower.includes('tablet') ||
      lower.includes('pill') ||
      lower.includes('capsule') ||
      lower.includes('दवा') ||
      lower.includes('गोली')
    ) {
      let timeSlot = 'morning';
      if (lower.includes('બપોરે') || lower.includes('afternoon') || lower.includes('दोपहर')) timeSlot = 'afternoon';
      else if (lower.includes('સાંજે') || lower.includes('evening') || lower.includes('शाम')) timeSlot = 'evening';
      else if (lower.includes('રાત્રે') || lower.includes('night') || lower.includes('रात')) timeSlot = 'night';

      const mealRelation = lower.includes('ભૂખ્યા') || lower.includes('ખાલી પેટે') || lower.includes('before') || lower.includes('भूखे') ? 'before_food' : 'after_food';
      const dosage = amount ? `${Math.round(amount)} ગોળી` : '૧ ગોળી';

      // Clean medicine name
      let medName = text
        .replace(/(સવારે|બપોરે|સાંજે|રાત્રે|દરરોજ|ગોળી|ટેબ્લેટ|દવા|લેવાની|છે|પીવાની|ખાવાની|૧|૨|૩|\d+|tablet|pill|medicine)/gi, '')
        .trim();
      if (!medName || medName.length < 2) medName = 'નવી દવા';

      const medTime = time !== '10:00' ? time : timeSlot === 'morning' ? '08:30' : timeSlot === 'afternoon' ? '13:30' : timeSlot === 'evening' ? '18:00' : '21:00';

      return {
        intent: 'medicine',
        name: medName,
        dosage,
        timeSlot,
        mealRelation,
        time: medTime,
        notes: text,
        title: `દવા: ${medName} (${dosage})`,
        confirmationMessage: `દવા '${medName}' (${dosage}) સમય ${medTime} વાગ્યે સફળતાપૂર્વક હેલ્થ હબમાં શેડ્યુલ થઈ ગઈ! 💊`,
      };
    }

    // 3. Shopping List Check (buying items, not yet paid)
    if (
      !lower.includes('આપ્યા') &&
      !lower.includes('ખર્ચ્યા') &&
      !lower.includes('ચૂકવ્યા') &&
      !lower.includes('paid') &&
      !lower.includes('spent') &&
      (
        lower.includes('લાવવાનું') ||
        lower.includes('લાવવાની') ||
        lower.includes('લાવવાનો') ||
        lower.includes('ખરીદી યાદી') ||
        lower.includes('ખરીદવાનું') ||
        lower.includes('કરિયાણું લાવ') ||
        lower.includes('shopping') ||
        lower.includes('groceries')
      )
    ) {
      let itemName = text
        .replace(/(લાવવાનું|લાવવાની|લાવવાનો|છે|ખરીદવાનું|ખરીદી|યાદી|કરિયાણું|બજારમાંથી|shopping)/gi, '')
        .trim();
      if (!itemName || itemName.length < 2) itemName = text;

      let quantity = '૧';
      if (lower.includes('કિલો') || lower.includes('kg')) {
        const qMatch = text.match(/\d+\s*(?:કિલો|kg)/i);
        if (qMatch) quantity = qMatch[0];
      } else if (lower.includes('લિટર') || lower.includes('લીટર') || lower.includes('liter')) {
        const lMatch = text.match(/\d+\s*(?:લિટર|લીટર|liter)/i);
        if (lMatch) quantity = lMatch[0];
      } else if (amount) {
        quantity = `${amount}`;
      }

      return {
        intent: 'shopping',
        name: itemName,
        quantity,
        category: lower.includes('શાકભાજી') ? 'શાકભાજી' : lower.includes('દૂધ') ? 'ડેરી' : 'કરિયાણું',
        title: `ખરીદી: ${itemName} (${quantity})`,
        confirmationMessage: `'${itemName}' (${quantity}) ખરીદીની યાદીમાં સફળતાપૂર્વક ઉમેરી દીધું! 🛒`,
      };
    }

    // 4. Events / Celebrations Check (Birthday, Anniversary, Festival)
    if (
      lower.includes('જન્મદિવસ') ||
      lower.includes('બરથડે') ||
      lower.includes('birthday') ||
      lower.includes('વર્ષગાંઠ') ||
      lower.includes('એનિવર્સરી') ||
      lower.includes('anniversary') ||
      lower.includes('તહેવાર') ||
      lower.includes('ઉત્સવ') ||
      lower.includes('લગ્ન') ||
      lower.includes('સગાઈ')
    ) {
      let eventType = 'birthday';
      if (lower.includes('વર્ષગાંઠ') || lower.includes('એનિવર્સરી') || lower.includes('લગ્ન')) eventType = 'anniversary';
      else if (lower.includes('તહેવાર') || lower.includes('ઉત્સવ')) eventType = 'festival';

      let title = text.replace(/(છે|તારીખે|રોજ|નો|ની|ના)/gi, '').trim();
      return {
        intent: 'event',
        title: title || text,
        personName: title,
        date,
        type: eventType,
        notes: text,
        confirmationMessage: `ઉત્સવ/ઇવેન્ટ '${title}' તારીખ ${date} માટે સફળતાપૂર્વક ડાયરીમાં સાચવાઈ ગયો! 🎉`,
      };
    }

    // 2. Khata (To Receive or To Pay)
    if (
      lower.includes('લેવાના') ||
      lower.includes('આપવાના') ||
      lower.includes('લેવાના છે') ||
      lower.includes('આપવાના છે') ||
      lower.includes('લેના હે') ||
      lower.includes('देना है') ||
      lower.includes('उधार') ||
      lower.includes('to receive') ||
      lower.includes('to pay')
    ) {
      const isToReceive = lower.includes('લેવાના') || lower.includes('લેના') || lower.includes('receive');
      // Clean party name: remove common words
      let partyName = text
        .replace(/(પાસેથી|ને|ભાઈ|બેન|પાસે|થી|લેવાના|આપવાના|છે|રૂપિયા|rs|₹|\d+)/gi, '')
        .trim();
      if (!partyName || partyName.length < 2) partyName = isToReceive ? 'પાર્ટી / ગ્રાહક' : 'વેપારી / મિત્ર';

      return {
        intent: 'khata',
        type: isToReceive ? 'to_receive' : 'to_pay',
        partyName,
        amount: amount || 500,
        dueDate: date,
        description: text,
        title: isToReceive
          ? `${partyName} પાસેથી લેવાના: ₹${amount || 500}`
          : `${partyName}ને આપવાના: ₹${amount || 500}`,
        confirmationMessage: isToReceive
          ? `ખાતાવહીમાં ${partyName} પાસેથી ₹${amount || 500} લેવાના તરીકે નોંધ્યા!`
          : `ખાતાવહીમાં ${partyName}ને ₹${amount || 500} આપવાના તરીકે નોંધ્યા!`,
      };
    }

    // 3. Income / Deposit Check
    if (
      lower.includes('જમા') ||
      lower.includes('આવક') ||
      lower.includes('પગાર') ||
      lower.includes('મળ્યા') ||
      lower.includes('કમાણી') ||
      lower.includes('salary') ||
      lower.includes('credited') ||
      lower.includes('income') ||
      lower.includes('वेतन') ||
      lower.includes('जमा')
    ) {
      let category = 'પગાર / આવક';
      if (lower.includes('બેંક') || lower.includes('bank')) category = 'બેંક ડિપોઝિટ';
      if (lower.includes('ધંધો') || lower.includes('વેપાર') || lower.includes('business')) category = 'વેપાર / ધંધો';

      return {
        intent: 'finance',
        type: 'income',
        amount: amount || 1000,
        category,
        description: text,
        date,
        paymentMode: 'બેંક ટ્રાન્સફર',
        title: `આવક: ₹${(amount || 1000).toLocaleString()} (${category})`,
        confirmationMessage: `આવકમાં ₹${(amount || 1000).toLocaleString()} સફળતાપૂર્વક ઉમેરાયા! 💰`,
      };
    }

    // 4. Expense Check
    if (
      amount !== null ||
      lower.includes('ખર્ચ') ||
      lower.includes('આપ્યા') ||
      lower.includes('ચૂકવ્યા') ||
      lower.includes('ખરીદ્યા') ||
      lower.includes('ભર્યા') ||
      lower.includes('spent') ||
      lower.includes('paid') ||
      lower.includes('expense') ||
      lower.includes('दिए') ||
      lower.includes('खर्च')
    ) {
      let category = 'કરિયાણું / ઘરખર્ચ';
      if (lower.includes('દૂધ') || lower.includes('ચા') || lower.includes('નાસ્તો')) category = 'દૂધ અને ચા-નાસ્તો';
      else if (lower.includes('શાકભાજી') || lower.includes('ફળ')) category = 'શાકભાજી / ફળફળાદિ';
      else if (lower.includes('પેટ્રોલ') || lower.includes('ડીઝલ') || lower.includes('મુસાફરી') || lower.includes('રિક્ષા')) category = 'પેટ્રોલ / મુસાફરી';
      else if (lower.includes('દવા') || lower.includes('ડોક્ટર') || lower.includes('હોસ્પિટલ')) category = 'દવાઓ / હેલ્થ';
      else if (lower.includes('લાઇટ') || lower.includes('રિચાર્જ') || lower.includes('બિલ')) category = 'લાઇટ બિલ / રિચાર્જ';
      else if (lower.includes('સ્કૂલ') || lower.includes('કોલેજ') || lower.includes('ફી')) category = 'શિક્ષણ / ફી';

      return {
        intent: 'finance',
        type: 'expense',
        amount: amount || 100,
        category,
        description: text,
        date,
        paymentMode: 'UPI (GPay/PhonePe)',
        title: `ખર્ચ: ₹${(amount || 100).toLocaleString()} (${category})`,
        confirmationMessage: `ખર્ચમાં ₹${(amount || 100).toLocaleString()} સફળતાપૂર્વક ઉમેરાયા! 💸`,
      };
    }

    // 5. Tasks, Meetings & Reminders
    if (
      lower.includes('મીટિંગ') ||
      lower.includes('કામ') ||
      lower.includes('જવાનું') ||
      lower.includes('રીમાઇન્ડર') ||
      lower.includes('યાદ') ||
      lower.includes('ડોક્ટર') ||
      lower.includes('ચેક') ||
      lower.includes('meeting') ||
      lower.includes('task') ||
      lower.includes('reminder') ||
      lower.includes('कार्य')
    ) {
      let remType = 'task';
      if (lower.includes('મીટિંગ') || lower.includes('meeting')) remType = 'meeting';
      if (lower.includes('બેંક') || lower.includes('ચેક') || lower.includes('bank')) remType = 'bank';

      return {
        intent: 'reminder',
        type: remType,
        title: text.length > 50 ? text.substring(0, 47) + '...' : text,
        description: text,
        date,
        time,
        hasAlarm: true,
        priority: 'high',
        confirmationMessage: `કામ/મીટિંગ '${text}' તારીખ ${date} ના રોજ ${time} વાગ્યા માટે શેડ્યુલ થઈ ગઈ! ⏰`,
      };
    }

    // 6. Default to Diary Note
    return {
      intent: 'note',
      type: 'note',
      title: text.split(/[.\n]/)[0].substring(0, 40) || 'દૈનિક અંગત નોંધ',
      content: text,
      category: 'અંગત',
      date,
      isPinned: false,
      confirmationMessage: `તમારી ડાયરીમાં આ નોંધ સુરક્ષિત રીતે સાચવી લેવામાં આવી છે! 📝`,
    };
  },

  /**
   * Speak back feedback using Web Speech Synthesis
   */
  speak(message = '', lang = 'gu') {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    try {
      window.speechSynthesis.cancel(); // Stop any pending speech
      const utterance = new SpeechSynthesisUtterance(message);
      
      const langVoiceMap = {
        gu: 'gu-IN',
        hi: 'hi-IN',
        en: 'en-IN',
        es: 'es-ES',
        fr: 'fr-FR',
        de: 'de-DE',
        ar: 'ar-SA',
      };

      utterance.lang = langVoiceMap[lang] || 'gu-IN';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      // Select matching voice if available
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find((v) => v.lang.startsWith(utterance.lang) || v.lang.startsWith(lang));
      if (voice) utterance.voice = voice;

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  },
};
