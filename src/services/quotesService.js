/**
 * Daily Quotes / Slogans Service
 * Curated 31 inspiring daily thoughts across Gujarati, Hindi, and English.
 * Automatically changes every single day based on day of year,
 * supports manual refresh, and updates instantly when language changes.
 */

export const DAILY_QUOTES = {
  gu: [
    { text: "સમયનું સાચું આયોજન એ જ સફળતાની પ્રથમ સીડી છે.", author: "સમય વ્યવસ્થાપન" },
    { text: "તંદુરસ્ત શરીર અને શાંત મન એ જ જીવનની સૌથી મોટી મૂડી છે.", author: "આરોગ્ય મંત્ર" },
    { text: "નાની નાની દૈનિક બચત જ ભવિષ્યમાં મોટી આર્થિક સુરક્ષા બને છે.", author: "લક્ષ્મી સૂત્ર" },
    { text: "આજનું કામ આજે જ પૂરું કરો, 'કાલ' ક્યારેય આવતી નથી.", author: "કાર્ય શિસ્ત" },
    { text: "પરિશ્રમ એ પારસમણિ છે અને ધીરજ એ તેનું સાચું ઘરેણું છે.", author: "પ્રેરણા વાણી" },
    { text: "સફળતા એ કોઈ એક દિવસનો ચમત્કાર નથી, રોજના નાના પ્રયાસોનું પરિણામ છે.", author: "જીવન દર્શન" },
    { text: "પાણી અને વાણી હંમેશા માપસર વાપરવા, બંને જીવન માટે અમૂલ્ય છે.", author: "સંસ્કાર સુવાસ" },
    { text: "તમારા ખર્ચ પર નિયંત્રણ રાખો, જેથી તમારી આવક તમારી સાચી તાકાત બને.", author: "અર્થનીતિ" },
    { text: "સવારનું વહેલું જાગવું તન, મન અને આખા દિવસને નવી તાજગી આપે છે.", author: "દિનચર્યા સૂત્ર" },
    { text: "જે વ્યક્તિ પોતાની જાત પર વિશ્વાસ રાખે છે, તેને આખું જગત રસ્તો આપે છે.", author: "આત્મવિશ્વાસ" },
    { text: "દરેક ભૂલ એ નવું શીખવાની નવી તક છે, ક્યારેય હાર ન માનવી.", author: "પ્રગતિ પંથ" },
    { text: "સારા સ્વાસ્થ્ય માટે પૂરતી ઊંઘ અને નિયમિત કસરત સૌથી ઉત્તમ ઔષધ છે.", author: "સુખાકારી" },
    { text: "સંબંધોમાં વિશ્વાસ અને હિસાબમાં પારદર્શિતા હંમેશા શાંતિ આપે છે.", author: "જીવન મંત્ર" },
    { text: "સ્પષ્ટ લક્ષ્ય નક્કી કરો અને તે તરફ દરરોજ એક ડગલું આગળ વધો.", author: "લક્ષ્યવેધ" },
    { text: "કૃતજ્ઞતા અને આભારની લાગણી મનને શાંતિ અને સંતોષ આપે છે.", author: "સંતોષ સુધા" },
    { text: "પોતાના વચન પાળવા એ જ સજ્જન વ્યક્તિની સાચી ઓળખ છે.", author: "મૂલ્યનિષ્ઠા" },
    { text: "આહાર, વિચાર અને વ્યવહાર જેટલા શુદ્ધ, તેટલું જ જીવન સમૃદ્ધ.", author: "સાત્વિક જીવન" },
    { text: "કોઈપણ મોટું કામ શરૂઆતમાં અશક્ય જ લાગે છે, જ્યાં સુધી તે પૂર્ણ ન થાય.", author: "અડગ નિર્ધાર" },
    { text: "બિનજરૂરી ચિંતા ભૂતકાળને બદલી શકતી નથી, પણ આજના દિવસની શાંતિ છીનવી લે છે.", author: "ચિંતન" },
    { text: "શિક્ષણ અને અનુભવ એ એવી સંપત્તિ છે જે કોઈ ક્યારેય છીનવી શકતું નથી.", author: "જ્ઞાનદીપ" },
    { text: "રોજ થોડો સમય પોતાના એકાંત અને આત્મ-નિરીક્ષણ માટે અચૂક ફાળવો.", author: "આત્મમંથન" },
    { text: "જે વ્યક્તિ સમયની કદર કરે છે, સમય તેને હંમેશા ઊંચાઈ પર પહોંચાડે છે.", author: "સમય ગૌરવ" },
    { text: "મુશ્કેલ દિવસો આપણને જીવનના સારા સમયની સાચી કિંમત સમજાવે છે.", author: "આશા કિરણ" },
    { text: "નિયમિત મોર્નિંગ વૉક અને વ્યાયામ એ લાંબા આયુષ્યની ચાવી છે.", author: "આરોગ્ય રક્ષા" },
    { text: "હંમેશા સકારાત્મક લોકો સાથે રહો; સારા સંગતથી શ્રેષ્ઠ નિર્ણયો જન્મે છે.", author: "સત્સંગ" },
    { text: "શરીર માટે પૂરતું પાણી અને મન માટે શાંતિ એ જ શ્રેષ્ઠ ઔષધ છે.", author: "સ્વાસ્થ્ય સૂત્ર" },
    { text: "તમારી આવક કરતાં ઓછો ખર્ચ કરવો એ સુખી અને દેવામુક્ત રહેવાની ચાવી છે.", author: "ધન વ્યવસ્થા" },
    { text: "સવારનો સૂર્ય નવી આશા અને અસીમ ઉત્સાહ લઈને આવે છે.", author: "નવો દિવસ" },
    { text: "સપનાં તે નથી જે ઊંઘમાં આવે, સપનાં તે છે જે ઊંઘવા ન દે.", author: "ડૉ. એ.પી.જે. અબ્દુલ કલામ" },
    { text: "પોતાની જાત સાથે કરેલી સાચી સ્પર્ધા એ જ માણસને શ્રેષ્ઠ બનાવે છે.", author: "શ્રેષ્ઠતા" },
    { text: "દરેક નવા દિવસ સાથે નવી આશા, નવો ઉત્સાહ અને નવી ઉર્જા જાગે છે.", author: "નવચેતના" },
  ],
  hi: [
    { text: "समय का सही प्रबंधन ही सफलता की पहली सीढ़ी है।", author: "समय प्रबंधन" },
    { text: "स्वस्थ शरीर और शांत मन ही जीवन की सबसे बड़ी पूंजी है।", author: "आरोग्य सूत्र" },
    { text: "छोटी-छोटी दैनिक बचत ही भविष्य में बड़ी वित्तीय सुरक्षा बनती है।", author: "धन विचार" },
    { text: "आज का काम आज ही पूरा करें, 'कल' कभी नहीं आता।", author: "कर्म योग" },
    { text: "कठिन परिश्रम ही सफलता की कुंजी है और धैर्य उसका सच्चा गहना है।", author: "प्रेरणा वाणी" },
    { text: "सफलता किसी एक दिन का चमत्कार नहीं, बल्कि रोज़ाना किए गए छोटे प्रयासों का फल है।", author: "जीवन दर्शन" },
    { text: "पानी और वाणी हमेशा नाप-तोल कर उपयोग करें, दोनों अनमोल हैं।", author: "संस्कार विचार" },
    { text: "अपने खर्चों पर नियंत्रण रखें, ताकि आपकी आमदनी आपकी शक्ति बन सके।", author: "अर्थनीति" },
    { text: "सुबह जल्दी जागना शरीर, मन और दिनभर की गतिविधियों में नई ऊर्जा भरता है।", author: "दिनचर्या सूत्र" },
    { text: "जिस व्यक्ति को खुद पर विश्वास होता है, पूरी दुनिया उसके लिए रास्ता बनाती है।", author: "आत्मविश्वास" },
    { text: "हर गलती कुछ नया सीखने का अवसर है, कभी हार मत मानो।", author: "प्रगति पथ" },
    { text: "अच्छे स्वास्थ्य के लिए पर्याप्त नींद और नियमित व्यायाम सबसे उत्तम औषधि हैं।", author: "उत्तम स्वास्थ्य" },
    { text: "रिश्तों में विश्वास और हिसाब-किताब में पारदर्शिता हमेशा सुख देती है।", author: "जीवन मूल्य" },
    { text: "एक स्पष्ट लक्ष्य तय करें और रोज़ उसकी तरफ एक कदम आगे बढ़ाएँ।", author: "लक्ष्य साधक" },
    { text: "कृतज्ञता मन को गहरी शांति और जीवन को संतोष प्रदान करती है।", author: "संतोष सुधा" },
    { text: "अपने वादे निभाना ही सच्चे और मजबूत व्यक्तित्व की पहचान है।", author: "मूल्यनिष्ठा" },
    { text: "आहार, विचार और व्यवहार जितने शुद्ध होंगे, जीवन उतना ही समृद्ध होगा।", author: "सात्विक जीवन" },
    { text: "कोई भी बड़ा काम शुरुआत में असंभव ही लगता है, जब तक कि वह पूरा न हो जाए।", author: "दृढ़ संकल्प" },
    { text: "व्यर्थ चिंता बीते हुए कल को नहीं बदल सकती, लेकिन आज की खुशियाँ ज़रूर छीन लेती है।", author: "सकारात्मक सोच" },
    { text: "शिक्षा और अनुभव ऐसी दो संपत्तियां हैं जिन्हें कोई कभी चुरा नहीं सकता।", author: "ज्ञान प्रकाश" },
    { text: "रोज़ाना कुछ समय अपने एकांत और आत्म-निरीक्षण के लिए निकालें।", author: "आत्ममंथन" },
    { text: "जो व्यक्ति समय की कद्र करता है, समय उसे हमेशा ऊँचाइयों पर पहुँचाता है।", author: "समय मूल्य" },
    { text: "मुश्किल दिन हमें अच्छे समय की सही कीमत समझाने और मजबूत बनाने आते हैं।", author: "आशा किरण" },
    { text: "नियमित व्यायाम और पर्याप्त पानी का सेवन स्वास्थ्य की पहली शर्त है।", author: "आरोग्य विचार" },
    { text: "हमेशा सच्चे और सकारात्मक लोगों के साथ रहें; अच्छी संगत अच्छे विचार लाती है।", author: "सत्संग" },
    { text: "भरपूर पानी पीना और दिनभर सक्रिय रहना ही सबसे सरल व श्रेष्ठ स्वास्थ्य सूत्र है।", author: "स्वास्थ्य सूत्र" },
    { text: "अपनी आमदनी से कम खर्च करना ही जीवन भर चिंतामुक्त रहने का मूल मंत्र है।", author: "धन सूत्र" },
    { text: "सुबह का सूरज नई उम्मीद और असीम सकारात्मक ऊर्जा लेकर आता है।", author: "नया सवेरा" },
    { text: "सपने वो नहीं जो हम सोते हुए देखते हैं, सपने वो हैं जो हमें सोने नहीं देते।", author: "डॉ. ए.पी.जे. अब्दुल कलाम" },
    { text: "खुद से की गई सच्ची प्रतिस्पर्धा ही इंसान को सबसे बेहतर बनाती है।", author: "श्रेष्ठता" },
    { text: "हर नए दिन के साथ नई उम्मीद और असीम ऊर्जा का संचार होता है।", author: "नवचेतना" },
  ],
  en: [
    { text: "Proper planning and time management is the first step towards success.", author: "Time Mastery" },
    { text: "A healthy body and a calm mind are life's greatest assets.", author: "Wellness Principle" },
    { text: "Small daily savings build great financial security for tomorrow.", author: "Financial Wisdom" },
    { text: "Do today's work today, for 'tomorrow' never truly arrives.", author: "Daily Discipline" },
    { text: "Hard work is the magic touch, and patience is its true ornament.", author: "Words of Inspiration" },
    { text: "Success is not an overnight miracle; it is the sum of small daily efforts.", author: "Growth Mindset" },
    { text: "Use your words and water mindfully; both are precious gifts in life.", author: "Mindful Living" },
    { text: "Control your expenses today so your income serves you tomorrow.", author: "Smart Finance" },
    { text: "Rising early brings vitality to the body, clarity to the mind, and energy to the day.", author: "Morning Energy" },
    { text: "When you believe in yourself, the entire universe opens up a path for you.", author: "Self Belief" },
    { text: "Every mistake is an opportunity to learn something new; never lose heart.", author: "Resilience" },
    { text: "Adequate rest and regular exercise are the best medicines for good health.", author: "Healthy Living" },
    { text: "Trust in relationships and transparency in finances always bring peace.", author: "Integrity" },
    { text: "Set a clear goal and take at least one step toward it each day.", author: "Goal Pursuit" },
    { text: "Gratitude fills the heart with peace and life with deep contentment.", author: "Gratitude" },
    { text: "Keeping your promises is the true hallmark of a strong character.", author: "Trustworthiness" },
    { text: "The purer your diet, thoughts, and actions, the richer your life becomes.", author: "Pure Living" },
    { text: "Every great achievement seems impossible until it is finally done.", author: "Determination" },
    { text: "Worry cannot change the past, but it can steal today's peace and joy.", author: "Inner Peace" },
    { text: "Education and experience are the only treasures that can never be stolen.", author: "Knowledge" },
    { text: "Dedicate a few quiet moments every day to self-reflection and inner stillness.", author: "Solitude" },
    { text: "Those who respect time will always find that time elevates them to greatness.", author: "Time Value" },
    { text: "Tough days come to teach resilience and make us appreciate good times more.", author: "Hope" },
    { text: "Regular workouts and adequate hydration are the pillars of longevity.", author: "Vitality" },
    { text: "Surround yourself with genuine people; great company fosters wise choices.", author: "Positive Circle" },
    { text: "Drinking adequate water and staying physically active is the simplest path to wellness.", author: "Wellness Key" },
    { text: "Spending less than you earn is the golden rule of lifelong financial freedom.", author: "Financial Freedom" },
    { text: "The morning sun arrives with renewed hope and boundless positivity.", author: "New Day" },
    { text: "Dreams are not what you see in sleep, they are the things that don't let you sleep.", author: "Dr. A.P.J. Abdul Kalam" },
    { text: "The only true competition is with yourself to become better than yesterday.", author: "Self Growth" },
    { text: "Every new day brings fresh hope, new possibilities, and infinite energy.", author: "New Horizons" },
  ],
};

/**
 * Returns the daily quote based on the day of the year so it changes automatically every single day.
 * An optional offset allows users to shuffle or view next thoughts manually.
 */
export const getDailyQuote = (lang = 'gu', offset = 0) => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const diff = now - startOfYear;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  const langKey = DAILY_QUOTES[lang] ? lang : 'gu';
  const list = DAILY_QUOTES[langKey];
  const index = Math.abs((dayOfYear + offset) % list.length);
  return {
    ...list[index],
    index: index + 1,
    total: list.length,
    dateStr: now.toISOString().split('T')[0],
  };
};
