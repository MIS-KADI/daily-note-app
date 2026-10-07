/**
 * Smart AI Voice & Text Natural Language Assistant Service
 * High-accuracy intent parsing for Gujarati (gu), Hindi (hi), and English (en).
 * Accurately parses Shopping, Meetings/Tasks, Medicines, Water, Khata, Finance, and Diary Notes.
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

/**
 * Extract numerical currency amount from text (e.g. "૨૫૦ રૂપિયા", "₹1200", "5000 rs")
 * STRICT: Will NEVER confuse non-currency numbers like "૨ કિલો", "૧૧ વાગે", "૧ ગોળી", "૨ ગ્લાસ" as money!
 */
export const extractAmount = (text = '') => {
  const clean = normalizeNumerals(text);

  // 1. Explicit currency pattern: ₹500, 500 rs, 500 રૂપિયા, 500/-, રૂ. 500, etc.
  const explicitCurrencyMatch = clean.match(/(?:₹|rs\.?|રૂપિયા|रुपये|રૂ\.?|inr)\s*(\d+(?:[.,]\d+)?)|(\d+(?:[.,]\d+)?)\s*(?:₹|rs\.?|રૂપિયા|रुपये|રૂ\.?|\/-)/i);
  if (explicitCurrencyMatch) {
    const rawNum = explicitCurrencyMatch[1] || explicitCurrencyMatch[2];
    const num = parseFloat(rawNum.replace(/,/g, ''));
    if (!isNaN(num) && num > 0) return num;
  }

  // 2. If it contains financial transaction words, check for number that is NOT attached to weight, time, or tablet units
  const lower = clean.toLowerCase();
  const hasFinancialVerbs =
    lower.includes('ખર્ચ') ||
    lower.includes('આપ્યા') ||
    lower.includes('ચૂકવ્યા') ||
    lower.includes('ભર્યા') ||
    lower.includes('ભરાવ્યા') ||
    lower.includes('જમા') ||
    lower.includes('મળ્યા') ||
    lower.includes('પગાર') ||
    lower.includes('કમાણી') ||
    lower.includes('spent') ||
    lower.includes('paid') ||
    lower.includes('cost') ||
    lower.includes('fee') ||
    lower.includes('ફી') ||
    lower.includes('બિલ');

  if (hasFinancialVerbs) {
    // Strip non-currency numbers first:
    // e.g. times ("11 વાગે", "5:00", "11 vage"), weights ("2 કિલો", "500 gram"), tablets ("1 ગોળી"), dates ("15 તારીખ")
    const stripped = clean
      .replace(/\d{1,2}:\d{2}/g, ' ')
      .replace(/\d+\s*(?:વાગે|વાગ્યે|vage|vagye|baje|pm|am|o'clock)/gi, ' ')
      .replace(/\d+\s*(?:કિલો|કિ\.ગ્રા|kg|ગ્રામ|gram|gm|લિટર|લીટર|ltr|મિ\.લિ|ml|ગોળી|ટેબ્લેટ|tablet|ગ્લાસ|glass|તારીખ|તારીખે)/gi, ' ');

    const fallbackMatch = stripped.match(/\b\d+(\.\d+)?\b/);
    if (fallbackMatch) {
      const num = parseFloat(fallbackMatch[0]);
      if (!isNaN(num) && num > 0) return num;
    }
  }

  return null;
};

/**
 * Extract time (e.g. "૧૧ વાગે", "11 vage", "૧૧:૩૦", "૫ વાગ્યે", "5:00 pm", "10 am")
 */
export const extractTime = (text = '') => {
  const clean = normalizeNumerals(text).toLowerCase();

  // 1. Colon match: "11:30", "05:00"
  const colonMatch = clean.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
  if (colonMatch) {
    let hours = parseInt(colonMatch[1], 10);
    const mins = colonMatch[2];
    const meridian = colonMatch[3]?.toLowerCase();
    if (meridian === 'pm' && hours < 12) hours += 12;
    if (meridian === 'am' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${mins}`;
  }

  // 2. Hour words match: "૧૧ વાગે", "11 vage", "૧૧ વાગ્યે", "11 baje", "5 pm", "5 o'clock"
  const hourMatch = clean.match(/(\d{1,2})\s*(?:વાગે|વાગ્યે|vage|vagye|baje|બજે|pm|am|o'clock)/i);
  if (hourMatch) {
    let hour = parseInt(hourMatch[1], 10);
    if ((clean.includes('સાંજે') || clean.includes('રાત્રે') || clean.includes('pm') || clean.includes('બપોરે')) && hour < 12 && hour !== 12) {
      hour += 12;
    }
    return `${String(hour).padStart(2, '0')}:00`;
  }

  // 3. Match relative phrases like "સવારે ૮", "બપોરે ૧", "સાંજે ૫"
  const morningMatch = clean.match(/(?:સવારે|morning)\s*(\d{1,2})/i);
  if (morningMatch) {
    const h = parseInt(morningMatch[1], 10);
    return `${String(h).padStart(2, '0')}:00`;
  }

  const eveningMatch = clean.match(/(?:સાંજે|રાત્રે|evening|night)\s*(\d{1,2})/i);
  if (eveningMatch) {
    let h = parseInt(eveningMatch[1], 10);
    if (h < 12) h += 12;
    return `${String(h).padStart(2, '0')}:00`;
  }

  return '10:00'; // Default fallback
};

/**
 * Extract date (e.g. "કાલે", "આવતીકાલે", "આજે", "પરમદિવસે", "tomorrow", "today")
 */
export const extractDate = (text = '') => {
  const t = text.toLowerCase();
  const today = new Date();

  if (t.includes('કાલે') || t.includes('આવતીકાલે') || t.includes('कल') || t.includes('tomorrow') || t.includes('aavtikale')) {
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  if (t.includes('પરમદિવસે') || t.includes('પરમ દિવસે') || t.includes('परसों') || t.includes('day after tomorrow') || t.includes('paramdivse')) {
    const dayAfter = new Date(today);
    dayAfter.setDate(dayAfter.getDate() + 2);
    return dayAfter.toISOString().split('T')[0];
  }

  return today.toISOString().split('T')[0];
};

export const aiAssistantService = {
  /**
   * Main NLP parser to accurately categorize user's voice command into:
   * 1. water (વોટર ટ્રેકર)
   * 2. medicine (દવા અને ગોળી શેડ્યૂલ)
   * 3. shopping (ખરીદી યાદી / લાવવાની વસ્તુઓ)
   * 4. reminder (કામો / મીટિંગ / બેંક / રીમાઇન્ડર)
   * 5. event (જન્મદિવસ / ઉત્સવ / વર્ષગાંઠ)
   * 6. khata (ખાતાવહી લેતી-દેતી)
   * 7. finance (આવક અથવા ખર્ચ)
   * 8. note (ડાયરી નોંધ)
   */
  parseInput(rawText = '', lang = 'gu', forcedIntent = null) {
    const text = rawText.trim();
    if (!text) return null;

    const lower = text.toLowerCase();
    const amount = extractAmount(text);
    const date = extractDate(text);
    const time = extractTime(text);

    // Direct Forced Category Overrides (When user clicks a category beforehand)
    if (forcedIntent && forcedIntent !== 'auto') {
      if (forcedIntent === 'shopping') {
        let quantity = '૧';
        const weightMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:કિલો|કિ\.ગ્રા|kg|kilo|ગ્રામ|gram|gm|લિટર|લીટર|ltr|liter|નંગ|પેકેટ|ડબ્બો)/i);
        if (weightMatch) {
          quantity = weightMatch[0];
        }
        let itemName = text
          .replace(/(લાવવાના|લાવવાનું|લાવવાની|લાવવાનો|લાવવા|લાવવું|છે|ખરીદવાના|ખરીદવાનું|ખરીદી|યાદી|કરિયાણું|બજારમાંથી|ઘરે|લઈ|જવાની|shopping|bring|buy)/gi, '')
          .trim();
        if (!itemName || itemName.length < 2) itemName = text;

        let category = 'કરિયાણું / ઘરવખરી';
        if (lower.includes('બટાકા') || lower.includes('ડુંગળી') || lower.includes('શાકભાજી') || lower.includes('ફળ')) {
          category = 'શાકભાજી / ફળો';
        } else if (lower.includes('દૂધ') || lower.includes('દહીં') || lower.includes('પનીર')) {
          category = 'ડેરી / દૂધ';
        } else if (lower.includes('તેલ') || lower.includes('ઘી')) {
          category = 'તેલ / કરિયાણું';
        }

        return {
          intent: 'shopping',
          name: itemName,
          quantity,
          category,
          title: `ખરીદી: ${itemName}`,
          details: `જથ્થો: ${quantity} | કેટેગરી: ${category}`,
          targetTab: 'ખરીદી યાદી (Shopping List)',
          confirmationMessage: `ખરીદીની યાદીમાં '${itemName}' (${quantity}) ઉમેરવા માટે તૈયાર છે! 🛒`,
        };
      }

      if (forcedIntent === 'reminder') {
        let remType = 'task';
        if (lower.includes('મીટિંગ') || lower.includes('meeting') || lower.includes('miting')) remType = 'meeting';
        else if (lower.includes('બેંક') || lower.includes('bank')) remType = 'bank';
        return {
          intent: 'reminder',
          type: remType,
          title: text,
          description: text,
          date,
          time,
          hasAlarm: true,
          targetTab: 'કામો અને મીટિંગ ટેબ (Reminders Tab)',
          details: `સમય: ${time} વાગ્યે | તારીખ: ${date} | ⏰ અલાર્મ સક્રિય`,
          confirmationMessage: `કામ/મીટિંગ '${text}' સમય ${time} વાગ્યે રીમાઇન્ડર તરીકે સેવ કરવા તૈયાર છે! ⏰`,
        };
      }

      if (forcedIntent === 'finance') {
        const isInc = lower.includes('જમા') || lower.includes('આવક') || lower.includes('પગાર') || lower.includes('મળ્યા') || lower.includes('salary');
        const finAmount = amount || 100;
        return {
          intent: 'finance',
          type: isInc ? 'income' : 'expense',
          amount: finAmount,
          category: isInc ? 'પગાર / આવક' : 'સામાન્ય ખર્ચ',
          description: text,
          date,
          paymentMode: 'UPI (GPay/PhonePe)',
          title: `${isInc ? 'આવક' : 'ખર્ચ'}: ₹${finAmount.toLocaleString()}`,
          details: `રકમ: ₹${finAmount.toLocaleString()} | તારીખ: ${date}`,
          targetTab: 'હિસાબ ટેબ (Finance Tab)',
          confirmationMessage: `હિસાબમાં ₹${finAmount.toLocaleString()} નોંધવા માટે તૈયાર છે! 💰`,
        };
      }

      if (forcedIntent === 'medicine') {
        const dosageMatch = text.match(/(\d+)\s*(?:ગોળી|ટેબ્લેટ|tablet|pill|चम्मच)/i);
        const dosage = dosageMatch ? `${dosageMatch[1]} ગોળી` : '૧ ગોળી';
        let medName = text.replace(/(સવારે|બપોરે|સાંજે|રાત્રે|દરરોજ|ગોળી|ટેબ્લેટ|દવા|લેવાની|છે|પીવાની|ખાવાની|\d+)/gi, '').trim() || text;
        return {
          intent: 'medicine',
          name: medName,
          dosage,
          timeSlot: 'morning',
          mealRelation: 'after_food',
          time: time !== '10:00' ? time : '08:30',
          notes: text,
          title: `દવા: ${medName} (${dosage})`,
          details: `સમય: ${time !== '10:00' ? time : '08:30'} | જમ્યા પછી`,
          targetTab: 'હેલ્થ હબ ટેબ (Health Hub)',
          confirmationMessage: `દવા '${medName}' (${dosage}) શેડ્યુલ કરવા તૈયાર છે! 💊`,
        };
      }

      if (forcedIntent === 'khata') {
        const isToReceive = !lower.includes('આપવાના');
        let partyName = text.replace(/(પાસેથી|ને|ભાઈ|બેન|પાસે|થી|લેવાના|આપવાના|છે|રૂપિયા|rs|₹|\d+)/gi, '').trim() || 'પાર્ટી';
        const phoneMatch = text.match(/\b[6-9]\d{9}\b/);
        const khataPhone = phoneMatch ? phoneMatch[0] : '';
        const khataAmount = amount || 500;
        return {
          intent: 'khata',
          type: isToReceive ? 'to_receive' : 'to_pay',
          partyName,
          phone: khataPhone,
          amount: khataAmount,
          dueDate: date,
          description: text,
          title: `${isToReceive ? 'લેવાના' : 'આપવાના'}: ₹${khataAmount.toLocaleString()} (${partyName})`,
          details: `પાર્ટી: ${partyName} | રકમ: ₹${khataAmount.toLocaleString()}`,
          targetTab: 'ખાતાવહી ટેબ (Khata Tab)',
          confirmationMessage: `ખાતાવહીમાં ₹${khataAmount.toLocaleString()} નોંધવા તૈયાર છે! 🤝`,
        };
      }

      if (forcedIntent === 'event') {
        return {
          intent: 'event',
          title: text,
          personName: text,
          date,
          type: lower.includes('એનિવર્સરી') || lower.includes('લગ્ન') ? 'anniversary' : 'birthday',
          notes: text,
          targetTab: 'ઇવેન્ટ્સ અને ઉત્સવ યાદી (Events Tab)',
          details: `તારીખ: ${date}`,
          confirmationMessage: `ઇવેન્ટ '${text}' સાચવવા માટે તૈયાર છે! 🎉`,
        };
      }

      if (forcedIntent === 'note') {
        return {
          intent: 'note',
          type: 'note',
          title: text.substring(0, 40) || 'દૈનિક અંગત નોંધ',
          content: text,
          category: 'અંગત',
          date,
          isPinned: false,
          targetTab: 'ડાયરી નોંધ ટેબ (Diary Notes)',
          details: `તારીખ: ${date}`,
          confirmationMessage: `ડાયરી નોંધ સાચવવા માટે તૈયાર છે! 📝`,
        };
      }
    }

    // 1. Water Intake Check (Strict: Only true drinking water, never tempered glass, eyeglasses, or currency amounts)
    const isWaterQuery =
      !lower.includes('ટફન') &&
      !lower.includes('મોબાઈલ') &&
      !lower.includes('ચશ્મા') &&
      !lower.includes('રૂપિયા') &&
      !lower.includes('₹') &&
      !lower.includes('rs') &&
      (amount === null || (amount <= 12 && (lower.includes('પાણી') || lower.includes('water') || lower.includes('पानी')))) &&
      (
        lower.includes('પાણી') ||
        lower.includes('water') ||
        lower.includes('पानी') ||
        (
          (lower.includes('ગ્લાસ') || lower.includes('glass') || lower.includes('ग्लास')) &&
          (lower.includes('પીધું') || lower.includes('પીવું') || lower.includes('પીધા') || lower.includes('drink') || lower.includes('drank') || lower.includes('पिया') || lower.includes('पीना'))
        )
      );

    if (isWaterQuery) {
      const glassesMatch = lower.match(/(\d+)\s*(?:ગ્લાસ|glass|ग्लास)/i);
      const glasses = glassesMatch ? parseInt(glassesMatch[1], 10) : amount && amount <= 10 ? Math.round(amount) : 1;
      return {
        intent: 'water',
        type: 'water',
        glasses,
        title: lang === 'hi' ? `${glasses} ग्लास पानी पिया` : lang === 'en' ? `Drank ${glasses} glasses of water` : `${glasses} ગ્લાસ પાણી પીધું`,
        details: `${glasses * 250} ml સ્વસ્થ હાઇડ્રેશન`,
        targetTab: 'હેલ્થ હબ ટેબ (Health Hub)',
        confirmationMessage: `${glasses} ગ્લાસ પાણીની એન્ટ્રી હેલ્થ હબમાં ઉમેરવા માટે તૈયાર છે! 💧`,
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
      const dosageMatch = text.match(/(\d+)\s*(?:ગોળી|ટેબ્લેટ|tablet|pill|चम्मच)/i);
      const dosage = dosageMatch ? `${dosageMatch[1]} ગોળી` : '૧ ગોળી';

      // Clean medicine name
      let medName = text
        .replace(/(સવારે|બપોરે|સાંજે|રાત્રે|દરરોજ|ગોળી|ટેબ્લેટ|દવા|લેવાની|છે|પીવાની|ખાવાની|૧|૨|૩|\d+|tablet|pill|medicine|લઈ|લેવી)/gi, '')
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
        details: `સમય: ${medTime} | ${mealRelation === 'before_food' ? 'ભૂખ્યા પેટે' : 'જમ્યા પછી'}`,
        targetTab: 'હેલ્થ હબ ટેબ (Health Hub)',
        confirmationMessage: `દવા '${medName}' (${dosage}) સમય ${medTime} વાગ્યે શેડ્યુલ કરવા તૈયાર છે! 💊`,
      };
    }

    // 3. Shopping List Check (CRITICAL: Any item to buy, bring home, market, vegetables, groceries)
    // Matches: લાવવાના, લાવવાનું, લાવવાની, લાવવાનો, લાવવા, ખરીદવાના, ખરીદી, શાકભાજી, બટાકા, કરિયાણું, shopping, etc.
    const isShoppingQuery =
      !lower.includes('ખર્ચ્યા') &&
      !lower.includes('ચૂકવ્યા') &&
      !lower.includes('આપ્યા') &&
      !lower.includes('paid') &&
      (
        lower.includes('લાવવા') || // covers લાવવાના, લાવવાનું, લાવવાની, લાવવાનો, લાવવા
        lower.includes('લાવવ') ||
        lower.includes('લાવ') ||
        lower.includes('ખરીદ') || // covers ખરીદવાના, ખરીદવાનું, ખરીદી, ખરીદવું
        lower.includes('કરિયાણું') ||
        lower.includes('ઘરે લઈ') ||
        lower.includes('ઘરે લાવ') ||
        lower.includes('ઘર માટે') ||
        lower.includes('શાકભાજી') ||
        lower.includes('બટાકા') ||
        lower.includes('ડુંગળી') ||
        lower.includes('તેલ') ||
        lower.includes('shopping') ||
        lower.includes('grocery') ||
        lower.includes('groceries')
      );

    if (isShoppingQuery) {
      // Extract quantity (e.g. ૨ કિલો, 500 ગ્રામ, 1 લીટર)
      let quantity = '૧';
      const weightMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:કિલો|કિ\.ગ્રા|kg|kilo|ગ્રામ|gram|gm|લિટર|લીટર|ltr|liter|નંગ|પેકેટ|ડબ્બો)/i);
      if (weightMatch) {
        quantity = weightMatch[0];
      }

      // Clean item name
      let itemName = text
        .replace(/(લાવવાના|લાવવાનું|લાવવાની|લાવવાનો|લાવવા|લાવવું|છે|ખરીદવાના|ખરીદવાનું|ખરીદી|યાદી|કરિયાણું|બજારમાંથી|ઘરે|લઈ|જવાની|shopping|bring|buy)/gi, '')
        .trim();
      if (!itemName || itemName.length < 2) itemName = text;

      // Determine category
      let category = 'કરિયાણું / ઘરવખરી';
      if (lower.includes('બટાકા') || lower.includes('ડુંગળી') || lower.includes('શાકભાજી') || lower.includes('ફળ')) {
        category = 'શાકભાજી / ફળો';
      } else if (lower.includes('દૂધ') || lower.includes('દહીં') || lower.includes('પનીર')) {
        category = 'ડેરી / દૂધ';
      } else if (lower.includes('તેલ') || lower.includes('ઘી')) {
        category = 'તેલ / કરિયાણું';
      }

      return {
        intent: 'shopping',
        name: itemName,
        quantity,
        category,
        title: `ખરીદી: ${itemName}`,
        details: `જથ્થો: ${quantity} | કેટેગરી: ${category}`,
        targetTab: 'ખરીદી યાદી (Shopping List)',
        confirmationMessage: `ખરીદીની યાદીમાં '${itemName}' (${quantity}) ઉમેરવા માટે તૈયાર છે! 🛒`,
      };
    }

    // 4. Tasks, Meetings & Reminders Check (CRITICAL: "આજે મીટિંગ છે ૧૧ વાગે" or "૧૧ વાગે મીટિંગ છે")
    const isReminderQuery =
      lower.includes('મીટિંગ') ||
      lower.includes('મીટીંગ') ||
      lower.includes('meeting') ||
      lower.includes('miting') ||
      lower.includes('કામ') ||
      lower.includes('જવાનું') ||
      lower.includes('રીમાઇન્ડર') ||
      lower.includes('યાદ') ||
      lower.includes('ડોક્ટર') ||
      lower.includes('ચેક') ||
      lower.includes('બેંક') ||
      lower.includes('task') ||
      lower.includes('reminder');

    if (isReminderQuery) {
      let remType = 'task';
      if (lower.includes('મીટિંગ') || lower.includes('મીટીંગ') || lower.includes('meeting') || lower.includes('miting')) remType = 'meeting';
      else if (lower.includes('બેંક') || lower.includes('ચેક') || lower.includes('bank')) remType = 'bank';

      const taskTitle =
        remType === 'meeting'
          ? (text.length > 50 ? text.substring(0, 47) + '...' : text)
          : remType === 'bank'
          ? `બેંક કામ: ${text}`
          : text;

      return {
        intent: 'reminder',
        type: remType,
        title: taskTitle,
        description: text,
        date,
        time,
        hasAlarm: true,
        priority: 'high',
        targetTab: 'કામો અને મીટિંગ ટેબ (Reminders Tab)',
        details: `સમય: ${time} વાગ્યે | તારીખ: ${date} | ⏰ અલાર્મ સક્રિય`,
        confirmationMessage: `આજે ${time} વાગ્યા માટે મીટિંગનું રીમાઇન્ડર અને અલાર્મ સેટ કરવા તૈયાર છે! ⏰`,
      };
    }

    // 5. Events / Celebrations Check (Birthday, Anniversary, Festival)
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
        targetTab: 'ઇવેન્ટ્સ અને ઉત્સવ યાદી (Events Tab)',
        details: `તારીખ: ${date} | પ્રકાર: ${eventType === 'birthday' ? 'જન્મદિવસ' : eventType === 'anniversary' ? 'વર્ષગાંઠ' : 'ઉત્સવ'}`,
        confirmationMessage: `ઇવેન્ટ '${title}' તારીખ ${date} માટે ડાયરીમાં સાચવવા માટે તૈયાર છે! 🎉`,
      };
    }

    // 6. Khata (To Receive or To Pay)
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
      let partyName = text
        .replace(/(પાસેથી|ને|ભાઈ|બેન|પાસે|થી|લેવાના|આપવાના|છે|રૂપિયા|rs|₹|\d+)/gi, '')
        .trim();
      if (!partyName || partyName.length < 2) partyName = isToReceive ? 'ગ્રાહક / પાર્ટી' : 'વેપારી / મિત્ર';

      const khataAmount = amount || 500;
      const phoneMatch = text.match(/\b[6-9]\d{9}\b/);
      const khataPhone = phoneMatch ? phoneMatch[0] : '';
      return {
        intent: 'khata',
        type: isToReceive ? 'to_receive' : 'to_pay',
        partyName,
        phone: khataPhone,
        amount: khataAmount,
        dueDate: date,
        description: text,
        title: isToReceive
          ? `${partyName} પાસેથી લેવાના: ₹${khataAmount.toLocaleString()}`
          : `${partyName}ને આપવાના: ₹${khataAmount.toLocaleString()}`,
        details: `પાર્ટી: ${partyName} | રકમ: ₹${khataAmount.toLocaleString()} | પરત તારીખ: ${date}`,
        targetTab: 'ખાતાવહી ટેબ (Khata Tab)',
        confirmationMessage: isToReceive
          ? `ખાતાવહીમાં ${partyName} પાસેથી ₹${khataAmount} લેવાના તરીકે નોંધવા તૈયાર છે!`
          : `ખાતાવહીમાં ${partyName}ને ₹${khataAmount} આપવાના તરીકે નોંધવા તૈયાર છે!`,
      };
    }

    // 7. Income / Deposit Check
    if (
      lower.includes('જમા') ||
      lower.includes('આવક') ||
      lower.includes('પગાર') ||
      lower.includes('મળ્યા') ||
      lower.includes('કમાણી') ||
      lower.includes('salary') ||
      lower.includes('credited') ||
      lower.includes('income') ||
      lower.includes('વેતન')
    ) {
      let category = 'પગાર / આવક';
      if (lower.includes('બેંક') || lower.includes('bank')) category = 'બેંક ડિપોઝિટ';
      if (lower.includes('ધંધો') || lower.includes('વેપાર') || lower.includes('business')) category = 'વેપાર / ધંધો';

      const incAmount = amount || 1000;
      return {
        intent: 'finance',
        type: 'income',
        amount: incAmount,
        category,
        description: text,
        date,
        paymentMode: 'બેંક ટ્રાન્સફર',
        title: `આવક: ₹${incAmount.toLocaleString()} (${category})`,
        details: `કેટેગરી: ${category} | તારીખ: ${date}`,
        targetTab: 'હિસાબ ટેબ (Finance Tab)',
        confirmationMessage: `આવકમાં ₹${incAmount.toLocaleString()} નોંધવા માટે તૈયાર છે! 💰`,
      };
    }

    // 8. Expense Check (MUST have monetary amount or clear payment verbs)
    if (
      amount !== null ||
      lower.includes('ખર્ચ') ||
      lower.includes('આપ્યા') ||
      lower.includes('ચૂકવ્યા') ||
      lower.includes('ભર્યા') ||
      lower.includes('ભરાવ્યા') ||
      lower.includes('spent') ||
      lower.includes('paid') ||
      lower.includes('expense')
    ) {
      let category = 'કરિયાણું / ઘરખર્ચ';
      if (lower.includes('દૂધ') || lower.includes('ચા') || lower.includes('નાસ્તો')) category = 'દૂધ અને ચા-નાસ્તો';
      else if (lower.includes('શાકભાજી') || lower.includes('ફળ')) category = 'શાકભાજી / ફળફળાદિ';
      else if (lower.includes('પેટ્રોલ') || lower.includes('ડીઝલ') || lower.includes('મુસાફરી') || lower.includes('રિક્ષા')) category = 'પેટ્રોલ / મુસાફરી';
      else if (lower.includes('દવા') || lower.includes('ડોક્ટર') || lower.includes('હોસ્પિટલ')) category = 'દવાઓ / હેલ્થ';
      else if (lower.includes('મોબાઈલ') || lower.includes('કવર') || lower.includes('ગ્લાસ') || lower.includes('રિચાર્જ') || lower.includes('ફોન') || lower.includes('બિલ')) category = 'મોબાઈલ / ગેજેટ્સ / રિચાર્જ';
      else if (lower.includes('સ્કૂલ') || lower.includes('કોલેજ') || lower.includes('ફી')) category = 'શિક્ષણ / ફી';
      else if (lower.includes('કપડાં') || lower.includes('શર્ટ') || lower.includes('પેન્ટ') || lower.includes('સાડી')) category = 'કપડાં / ખરીદી';

      const expAmount = amount || 100;
      return {
        intent: 'finance',
        type: 'expense',
        amount: expAmount,
        category,
        description: text,
        date,
        paymentMode: 'UPI (GPay/PhonePe)',
        title: `ખર્ચ: ₹${expAmount.toLocaleString()} (${category})`,
        details: `કેટેગરી: ${category} | તારીખ: ${date}`,
        targetTab: 'હિસાબ ટેબ (Finance Tab)',
        confirmationMessage: `ખર્ચમાં ₹${expAmount.toLocaleString()} નોંધવા માટે તૈયાર છે! 💸`,
      };
    }

    // 9. Default to Diary Note
    return {
      intent: 'note',
      type: 'note',
      title: text.split(/[.\n]/)[0].substring(0, 40) || 'દૈનિક અંગત નોંધ',
      content: text,
      category: 'અંગત',
      date,
      isPinned: false,
      targetTab: 'ડાયરી નોંધ ટેબ (Diary Notes)',
      details: `તારીખ: ${date} | કેટેગરી: અંગત`,
      confirmationMessage: `તમારી ડાયરીમાં આ નોંધ સાચવવા માટે તૈયાર છે! 📝`,
    };
  },

  /**
   * Speak back feedback using Web Speech Synthesis
   */
  speak(message = '', lang = 'gu') {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(message);

      const langVoiceMap = {
        gu: 'gu-IN',
        hi: 'hi-IN',
        en: 'en-IN',
      };

      utterance.lang = langVoiceMap[lang] || 'gu-IN';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find((v) => v.lang.startsWith(utterance.lang) || v.lang.startsWith(lang));
      if (voice) utterance.voice = voice;

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  },
};
