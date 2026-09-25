import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas-pro';

// Dictionary for Report in selected language (7 languages supported)
const REPORT_TEXTS = {
  gu: {
    report_title_all: 'માસિક પ્રવૃત્તિ, આરોગ્ય અને સંપૂર્ણ હિસાબ રિપોર્ટ',
    report_title_finance: 'નાણાકીય સ્થિતિ, બેંક બેલેન્સ અને ખાતાવહી રિપોર્ટ',
    report_title_health: 'આરોગ્ય, વાઇટલ્સ, કાર્ડિયો અને મેડિસિન રિપોર્ટ (તબીબી સારાંશ)',
    report_title_reminders: 'દૈનિક કામો, મીટિંગ્સ, જન્મદિવસ અને વર્ષગાંઠ લિસ્ટ',
    report_title_notes: 'અંગત ડાયરી અને મહત્વપૂર્ણ નોંધો રિપોર્ટ',
    app_subtitle: 'રોજિંદી ડાયરી અને સ્માર્ટ આસિસ્ટન્ટ',
    user_info: 'વપરાશકર્તા વિગત',
    month: 'મહિનો / સમયગાળો',
    bank_and_cash: '૧. બેંક, રોકડ અને ખાતાવહી સારાંશ',
    bank_balance: 'બેંક બેલેન્સ',
    cash_balance: 'હાથ પર રોકડ',
    to_receive: 'મારે લેવાના (ઉધાર)',
    to_pay: 'મારે આપવાના (દેવાં)',
    total_available: 'કુલ ઉપલબ્ધ રકમ',
    income_expense_title: '૨. આવક-ખર્ચ હિસાબ સારાંશ',
    total_income: 'કુલ આવક',
    total_expense: 'કુલ ખર્ચ',
    net_savings: 'ચોખ્ખી બચત / સિલક',
    transactions_table: 'આવક-ખર્ચ વ્યવહારોની વિગત',
    date: 'તારીખ',
    type: 'પ્રકાર',
    category: 'કેટેગરી',
    description: 'વિગત',
    payment_mode: 'ચુકવણી',
    amount: 'રકમ',
    income: 'આવક',
    expense: 'ખર્ચ',
    no_transactions: 'કોઈ વ્યવહારો નોંધાયેલા નથી',
    khata_title: '૩. પાર્ટી ખાતાવહી (લેતી-દેતી સ્થિતિ)',
    party_name: 'પાર્ટીનું નામ',
    phone: 'મોબાઈલ',
    status: 'સ્થિતિ',
    due_date: 'પાકતી તારીખ',
    settled: 'ચૂકવાઈ ગયું',
    pending: 'બાકી',
    to_receive_short: 'મારે લેવાના',
    to_pay_short: 'મારે આપવાના',
    health_title: '૪. આરોગ્ય, ફિટનેસ અને વાઇટલ્સ',
    steps: 'આજના સ્ટેપ',
    calories: 'બર્ન કેલરી',
    heart_rate: 'હાર્ટ રેટ',
    blood_pressure: 'બ્લડ પ્રેશર (BP)',
    bp_and_sleep: 'BP & ઊંઘ',
    sugar: 'બ્લડ સુગર',
    sleep: 'ઊંઘ (કલાક)',
    weight_height: 'વજન/ઊંચાઈ',
    medicines_list: 'દવાઓનું દૈનિક રૂટિન',
    med_name: 'દવાનું નામ',
    dosage: 'ડોઝ',
    time: 'સમય',
    food_condition: 'ખોરાકની સ્થિતિ',
    before_food: 'ભૂખ્યા પેટે',
    after_food: 'જમ્યા પછી',
    doctor_notes: 'ડૉક્ટર કન્સલ્ટેશન / તપાસ નોંધ',
    doctor_sign: 'ડૉક્ટર સહી / તબીબી મહોર',
    tasks_title: '૫. કામો અને મીટિંગ્સ લિસ્ટ',
    tasks: 'કામો / મીટિંગ્સ',
    no_tasks: 'કોઈ કામ નોંધાયેલ નથી',
    completed_badge: '✓ પૂર્ણ',
    pending_badge: '⏳ બાકી',
    events_title: '૬. જન્મદિવસ અને વર્ષગાંઠ (ઉત્સવો)',
    birthday: 'જન્મદિવસ',
    anniversary: 'લગ્ન વર્ષગાંઠ',
    special_event: 'ખાસ પ્રસંગ',
    relation: 'સંબંધ',
    notes_title: '૭. ડાયરી અને અગત્યની નોંધો',
    no_notes: 'કોઈ નોંધ ઉપલબ્ધ નથી',
    general_note: 'સામાન્ય',
    pinned: 'પિન કરેલ',
    footer_text: 'રોજિંદી ડાયરી એપ દ્વારા જનરેટ થયેલ અધિકૃત રિપોર્ટ | પ્રાઈવસી સુરક્ષિત',
  },
  hi: {
    report_title_all: 'मासिक गतिविधि, स्वास्थ्य और वित्तीय संपूर्ण रिपोर्ट',
    report_title_finance: 'वित्तीय स्थिति, बैंक बैलेंस और खाता बही रिपोर्ट',
    report_title_health: 'स्वास्थ्य, वाइटल्स, कार्डियो और दवाइयाँ रिपोर्ट (चिकित्सा सारांश)',
    report_title_reminders: 'दैनिक कार्य, मीटिंग्स, जन्मदिन और सालगिरह सूची',
    report_title_notes: 'व्यक्तिगत डायरी और महत्वपूर्ण नोट्स रिपोर्ट',
    app_subtitle: 'दैनिक डायरी और स्मार्ट सहायक',
    user_info: 'उपयोगकर्ता विवरण',
    month: 'माह / अवधि',
    bank_and_cash: '१. बैंक, नकद और खाता बही सारांश',
    bank_balance: 'बैंक बैलेंस',
    cash_balance: 'हाथ में नकद',
    to_receive: 'मुझे लेने हैं (उधार)',
    to_pay: 'मुझे देने हैं (देय)',
    total_available: 'कुल उपलब्ध राशि',
    income_expense_title: '२. आय-व्यय हिसाब सारांश',
    total_income: 'कुल आय',
    total_expense: 'कुल खर्च',
    net_savings: 'शुद्ध बचत / शेष',
    transactions_table: 'आय-व्यय लेन-देन का विवरण',
    date: 'तारीख',
    type: 'प्रकार',
    category: 'श्रेणी',
    description: 'विवरण',
    payment_mode: 'भुगतान माध्यम',
    amount: 'राशि',
    income: 'आय',
    expense: 'खर्च',
    no_transactions: 'कोई लेन-देन दर्ज नहीं है',
    khata_title: '३. पार्टी खाता बही (लेना-देना स्थिति)',
    party_name: 'पार्टी का नाम',
    phone: 'मोबाइल',
    status: 'स्थिति',
    due_date: 'देय तिथि',
    settled: 'चुकता',
    pending: 'बाकी',
    to_receive_short: 'मुझे लेने हैं',
    to_pay_short: 'मुझे देने हैं',
    health_title: '४. स्वास्थ्य, फ़िटनेस और वाइटल्स',
    steps: 'आज के स्टेप्स',
    calories: 'बर्न कैलोरी',
    heart_rate: 'हार्ट रेट',
    blood_pressure: 'ब्लड प्रेशर (BP)',
    bp_and_sleep: 'BP और नींद',
    sugar: 'ब्लड शुगर',
    sleep: 'नींद (घंटे)',
    weight_height: 'वजन/ऊंचाई',
    medicines_list: 'दवाइयों का दैनिक रूटीन',
    med_name: 'दवा का नाम',
    dosage: 'खुराक',
    time: 'समय',
    food_condition: 'भोजन की स्थिति',
    before_food: 'खाली पेट',
    after_food: 'खाने के बाद',
    doctor_notes: 'डॉक्टर परामर्श / जांच नोट',
    doctor_sign: 'चिकित्सक हस्ताक्षर / मुहर',
    tasks_title: '५. कार्य और मीटिंग्स सूची',
    tasks: 'कार्य / मीटिंग',
    no_tasks: 'कोई कार्य दर्ज नहीं है',
    completed_badge: '✓ पूर्ण',
    pending_badge: '⏳ बाकी',
    events_title: '६. जन्मदिन और सालगिरह (उत्सव)',
    birthday: 'जन्मदिन',
    anniversary: 'शादी की सालगिरह',
    special_event: 'विशेष प्रसंग',
    relation: 'संबंध',
    notes_title: '७. डायरी और महत्वपूर्ण नोट्स',
    no_notes: 'कोई नोट उपलब्ध नहीं है',
    general_note: 'सामान्य',
    pinned: 'पिन किया गया',
    footer_text: 'दैनिक डायरी ऐप द्वारा तैयार की गई अधिकृत रिपोर्ट | गोपनीयता सुरक्षित',
  },
  en: {
    report_title_all: 'Monthly Activity, Health & Finance Comprehensive Report',
    report_title_finance: 'Financial Status, Bank Balance & Ledger Report',
    report_title_health: 'Health, Vitals, Cardio & Medicines Report (Medical Summary)',
    report_title_reminders: 'Daily Tasks, Meetings, Birthdays & Anniversaries Schedule',
    report_title_notes: 'Personal Diary & Important Notes Report',
    app_subtitle: 'Daily Diary & Smart Assistant',
    user_info: 'User Information',
    month: 'Month / Period',
    bank_and_cash: '1. Bank, Cash & Ledger Overview',
    bank_balance: 'Bank Balance',
    cash_balance: 'Cash in Hand',
    to_receive: "You'll Get (Receivables)",
    to_pay: "You'll Give (Payables)",
    total_available: 'Total Available Funds',
    income_expense_title: '2. Income & Expense Statement',
    total_income: 'Total Income',
    total_expense: 'Total Expenses',
    net_savings: 'Net Savings / Balance',
    transactions_table: 'Transactions Breakdown',
    date: 'Date',
    type: 'Type',
    category: 'Category',
    description: 'Description',
    payment_mode: 'Payment Mode',
    amount: 'Amount',
    income: 'Income',
    expense: 'Expense',
    no_transactions: 'No transactions recorded',
    khata_title: '3. Party Ledger (Khata Book)',
    party_name: 'Party Name',
    phone: 'Phone',
    status: 'Status',
    due_date: 'Due Date',
    settled: 'Settled',
    pending: 'Pending',
    to_receive_short: "You'll Get",
    to_pay_short: "You'll Give",
    health_title: '4. Health, Fitness & Vitals',
    steps: 'Daily Steps',
    calories: 'Calories Burned',
    heart_rate: 'Heart Rate',
    blood_pressure: 'Blood Pressure',
    bp_and_sleep: 'BP & Sleep',
    sugar: 'Blood Sugar',
    sleep: 'Sleep (Hours)',
    weight_height: 'Weight / Height',
    medicines_list: 'Daily Medication Schedule',
    med_name: 'Medicine Name',
    dosage: 'Dosage',
    time: 'Time',
    food_condition: 'Food Condition',
    before_food: 'Before Food',
    after_food: 'After Food',
    doctor_notes: 'Doctor Consultation / Clinical Notes',
    doctor_sign: 'Doctor Signature / Medical Stamp',
    tasks_title: '5. Tasks & Meetings Schedule',
    tasks: 'Tasks / Meetings',
    no_tasks: 'No tasks scheduled',
    completed_badge: '✓ Completed',
    pending_badge: '⏳ Pending',
    events_title: '6. Birthdays & Anniversaries (Celebrations)',
    birthday: 'Birthday',
    anniversary: 'Wedding Anniversary',
    special_event: 'Special Event',
    relation: 'Relation',
    notes_title: '7. Diary & Notes Overview',
    no_notes: 'No notes available',
    general_note: 'General',
    pinned: 'Pinned',
    footer_text: 'Generated by Daily Diary App | Privacy Protected',
  },
  es: {
    report_title_all: 'Informe Integral de Actividades, Salud y Finanzas',
    report_title_finance: 'Informe de Estado Financiero, Saldo Bancario y Libro Mayor',
    report_title_health: 'Informe Médico de Salud, Signos Vitales y Medicación',
    report_title_reminders: 'Agenda de Tareas Diarias, Reuniones y Cumpleaños',
    report_title_notes: 'Informe de Notas Importantes y Diario Personal',
    app_subtitle: 'Diario Personal y Asistente Inteligente',
    user_info: 'Información del Usuario',
    month: 'Mes / Período',
    bank_and_cash: '1. Resumen Bancario, Efectivo y Cuentas',
    bank_balance: 'Saldo Bancario',
    cash_balance: 'Efectivo Disponible',
    to_receive: 'Por Cobrar (Activos)',
    to_pay: 'Por Pagar (Deudas)',
    total_available: 'Total Fondos Disponibles',
    income_expense_title: '2. Estado de Ingresos y Gastos',
    total_income: 'Total Ingresos',
    total_expense: 'Total Gastos',
    net_savings: 'Ahorro Neto / Saldo',
    transactions_table: 'Detalle de Transacciones',
    date: 'Fecha',
    type: 'Tipo',
    category: 'Categoría',
    description: 'Descripción',
    payment_mode: 'Método de Pago',
    amount: 'Importe',
    income: 'Ingreso',
    expense: 'Gasto',
    no_transactions: 'No hay transacciones registradas',
    khata_title: '3. Libro de Cuentas por Terceros',
    party_name: 'Nombre de la Parte',
    phone: 'Teléfono',
    status: 'Estado',
    due_date: 'Vencimiento',
    settled: 'Saldado',
    pending: 'Pendiente',
    to_receive_short: 'Por Cobrar',
    to_pay_short: 'Por Pagar',
    health_title: '4. Salud, Fitness y Signos Vitales',
    steps: 'Pasos Diarios',
    calories: 'Calorías Quemadas',
    heart_rate: 'Frecuencia Cardíaca',
    blood_pressure: 'Presión Arterial',
    bp_and_sleep: 'Presión y Sueño',
    sugar: 'Glucosa en Sangre',
    sleep: 'Sueño (Horas)',
    weight_height: 'Peso / Altura',
    medicines_list: 'Horario Diario de Medicación',
    med_name: 'Medicamento',
    dosage: 'Dosis',
    time: 'Hora',
    food_condition: 'Condición de Toma',
    before_food: 'En Ayunas',
    after_food: 'Después de Comer',
    doctor_notes: 'Notas de Consulta Médica / Clínica',
    doctor_sign: 'Firma / Sello del Médico',
    tasks_title: '5. Calendario de Tareas y Reuniones',
    tasks: 'Tareas / Reuniones',
    no_tasks: 'No hay tareas programadas',
    completed_badge: '✓ Completado',
    pending_badge: '⏳ Pendiente',
    events_title: '6. Cumpleaños y Aniversarios',
    birthday: 'Cumpleaños',
    anniversary: 'Aniversario de Bodas',
    special_event: 'Evento Especial',
    relation: 'Relación',
    notes_title: '7. Resumen de Notas y Diario',
    no_notes: 'No hay notas disponibles',
    general_note: 'General',
    pinned: 'Fijado',
    footer_text: 'Generado por Daily Diary App | Privacidad Protegida',
  },
  fr: {
    report_title_all: 'Rapport Complet d’Activité, Santé et Finances',
    report_title_finance: 'Rapport Financier, Solde Bancaire et Grand Livre',
    report_title_health: 'Bilan Médical, Constantes Vitales et Médicaments',
    report_title_reminders: 'Planning des Tâches, Réunions et Anniversaires',
    report_title_notes: 'Rapport des Notes Importantes et Journal Personnel',
    app_subtitle: 'Journal Quotidien et Assistant Intelligent',
    user_info: 'Informations Utilisateur',
    month: 'Mois / Période',
    bank_and_cash: '1. Aperçu Banque, Espèces et Créances',
    bank_balance: 'Solde Bancaire',
    cash_balance: 'Espèces Disponibles',
    to_receive: 'À Recevoir (Créances)',
    to_pay: 'À Payer (Dettes)',
    total_available: 'Total des Fonds Disponibles',
    income_expense_title: '2. Déclaration des Revenus et Dépenses',
    total_income: 'Revenu Total',
    total_expense: 'Dépenses Totales',
    net_savings: 'Épargne Nette / Solde',
    transactions_table: 'Détail des Transactions',
    date: 'Date',
    type: 'Type',
    category: 'Catégorie',
    description: 'Description',
    payment_mode: 'Mode de Paiement',
    amount: 'Montant',
    income: 'Revenu',
    expense: 'Dépense',
    no_transactions: 'Aucune transaction enregistrée',
    khata_title: '3. Registre des Comptes Tiers',
    party_name: 'Nom de la Partie',
    phone: 'Téléphone',
    status: 'Statut',
    due_date: 'Échéance',
    settled: 'Réglé',
    pending: 'En attente',
    to_receive_short: 'À Recevoir',
    to_pay_short: 'À Payer',
    health_title: '4. Santé, Forme et Constantes Vitales',
    steps: 'Pas Quotidiens',
    calories: 'Calories Brûlées',
    heart_rate: 'Rythme Cardiaque',
    blood_pressure: 'Tension Artérielle',
    bp_and_sleep: 'Tension & Sommeil',
    sugar: 'Glycémie',
    sleep: 'Sommeil (Heures)',
    weight_height: 'Poids / Taille',
    medicines_list: 'Plan de Prise des Médicaments',
    med_name: 'Médicament',
    dosage: 'Dosage',
    time: 'Heure',
    food_condition: 'Prise Alimentaire',
    before_food: 'À Jeun',
    after_food: 'Après le Repas',
    doctor_notes: 'Notes de Consultation Médicale',
    doctor_sign: 'Signature / Tampon du Médecin',
    tasks_title: '5. Calendrier des Tâches et Réunions',
    tasks: 'Tâches / Réunions',
    no_tasks: 'Aucune tâche programmée',
    completed_badge: '✓ Terminé',
    pending_badge: '⏳ En attente',
    events_title: '6. Anniversaires et Célébrations',
    birthday: 'Anniversaire',
    anniversary: 'Anniversaire de Mariage',
    special_event: 'Événement Spécial',
    relation: 'Lien',
    notes_title: '7. Synthèse des Notes et Journal',
    no_notes: 'Aucune note disponible',
    general_note: 'Général',
    pinned: 'Épinglé',
    footer_text: 'Généré par Daily Diary App | Confidentialité Protégée',
  },
  de: {
    report_title_all: 'Umfassender Monatsbericht über Aktivitäten, Gesundheit und Finanzen',
    report_title_finance: 'Finanzbericht, Bankguthaben und Kassenbuch',
    report_title_health: 'Medizinischer Bericht, Vitalwerte und Medikamentenplan',
    report_title_reminders: 'Aufgabenplan, Besprechungen und Geburtstage',
    report_title_notes: 'Bericht über wichtige Notizen und persönliches Tagebuch',
    app_subtitle: 'Tägliches Tagebuch & Smarter Assistent',
    user_info: 'Benutzerinformationen',
    month: 'Monat / Zeitraum',
    bank_and_cash: '1. Übersicht Bank, Bargeld und Konten',
    bank_balance: 'Bankguthaben',
    cash_balance: 'Bargeldbestand',
    to_receive: 'Forderungen (Zu Erhalten)',
    to_pay: 'Verbindlichkeiten (Zu Zahlen)',
    total_available: 'Verfügbare Gesamtfonds',
    income_expense_title: '2. Einnahmen- und Ausgabenübersicht',
    total_income: 'Gesamteinnahmen',
    total_expense: 'Gesamtausgaben',
    net_savings: 'Netto-Ersparnis / Saldo',
    transactions_table: 'Transaktionsaufstellung',
    date: 'Datum',
    type: 'Typ',
    category: 'Kategorie',
    description: 'Beschreibung',
    payment_mode: 'Zahlungsart',
    amount: 'Betrag',
    income: 'Einnahme',
    expense: 'Ausgabe',
    no_transactions: 'Keine Transaktionen erfasst',
    khata_title: '3. Kontenbuch für Kontakte',
    party_name: 'Name des Kontakts',
    phone: 'Telefon',
    status: 'Status',
    due_date: 'Fälligkeit',
    settled: 'Beglichen',
    pending: 'Offen',
    to_receive_short: 'Zu Erhalten',
    to_pay_short: 'Zu Zahlen',
    health_title: '4. Gesundheit, Fitness und Vitalwerte',
    steps: 'Tägliche Schritte',
    calories: 'Verbrannte Kalorien',
    heart_rate: 'Herzfrequenz',
    blood_pressure: 'Blutdruck',
    bp_and_sleep: 'Blutdruck & Schlaf',
    sugar: 'Blutzucker',
    sleep: 'Schlaf (Stunden)',
    weight_height: 'Gewicht / Größe',
    medicines_list: 'Täglicher Medikamentenplan',
    med_name: 'Medikament',
    dosage: 'Dosierung',
    time: 'Uhrzeit',
    food_condition: 'Einnahmehinweis',
    before_food: 'Nüchtern',
    after_food: 'Nach dem Essen',
    doctor_notes: 'Arztnotizen / Befunde',
    doctor_sign: 'Arztunterschrift / Stempel',
    tasks_title: '5. Aufgaben- und Besprechungsplan',
    tasks: 'Aufgaben / Termine',
    no_tasks: 'Keine Aufgaben geplant',
    completed_badge: '✓ Erledigt',
    pending_badge: '⏳ Offen',
    events_title: '6. Geburtstage und Jubiläen',
    birthday: 'Geburtstag',
    anniversary: 'Hochzeitstag',
    special_event: 'Besonderer Anlass',
    relation: 'Beziehung',
    notes_title: '7. Übersicht über Notizen und Tagebuch',
    no_notes: 'Keine Notizen verfügbar',
    general_note: 'Allgemein',
    pinned: 'Angeheftet',
    footer_text: 'Erstellt von Daily Diary App | Datenschutz geschützt',
  },
  ar: {
    report_title_all: 'التقرير الشامل للنشاط الشهري والصحة والمالية',
    report_title_finance: 'تقرير الوضع المالي والرصيد البنكي ودفتر الأستاذ',
    report_title_health: 'التقرير الطبي للمؤشرات الحيوية والقلب والأدوية',
    report_title_reminders: 'جدول المهام اليومية والاجتماعات وأعياد الميلاد',
    report_title_notes: 'تقرير المذكرات الشخصية والملاحظات الهامة',
    app_subtitle: 'اليوميات اليومية والمساعد الذكي',
    user_info: 'بيانات المستخدم',
    month: 'الشهر / الفترة',
    bank_and_cash: '١. ملخص البنك والنقد وحسابات الأطراف',
    bank_balance: 'الرصيد البنكي',
    cash_balance: 'النقد المتوفر',
    to_receive: 'مستحق لي (ديون خارجية)',
    to_pay: 'مستحق علي (التزامات)',
    total_available: 'إجمالي الأموال المتوفرة',
    income_expense_title: '٢. بيان الدخل والمصروفات',
    total_income: 'إجمالي الدخل',
    total_expense: 'إجمالي المصروفات',
    net_savings: 'صافي التوفير / الرصيد',
    transactions_table: 'تفاصيل المعاملات المالية',
    date: 'التاريخ',
    type: 'النوع',
    category: 'الفئة',
    description: 'الوصف',
    payment_mode: 'طريقة الدفع',
    amount: 'المبلغ',
    income: 'دخل',
    expense: 'مصروف',
    no_transactions: 'لا توجد معاملات مسجلة',
    khata_title: '٣. دفتر حسابات الأشخاص والأطراف',
    party_name: 'اسم الطرف',
    phone: 'رقم الهاتف',
    status: 'الحالة',
    due_date: 'تاريخ الاستحقاق',
    settled: 'تمت التسوية',
    pending: 'معلق',
    to_receive_short: 'مستحق لي',
    to_pay_short: 'مستحق علي',
    health_title: '٤. الصحة واللياقة والمؤشرات الحيوية',
    steps: 'الخطوات اليومية',
    calories: 'السعرات المحروقة',
    heart_rate: 'نبضات القلب',
    blood_pressure: 'ضغط الدم',
    bp_and_sleep: 'الضغط والنوم',
    sugar: 'سكر الدم',
    sleep: 'النوم (ساعات)',
    weight_height: 'الوزن / الطول',
    medicines_list: 'جدول مواعيد الأدوية اليومية',
    med_name: 'اسم الدواء',
    dosage: 'الجرعة',
    time: 'الوقت',
    food_condition: 'العلاقة بالطعام',
    before_food: 'على الريق',
    after_food: 'بعد الأكل',
    doctor_notes: 'ملاحظات استشارة الطبيب السريرية',
    doctor_sign: 'توقيع الطبيب / الختم الطبي',
    tasks_title: '٥. جدول المهام والاجتماعات',
    tasks: 'المهام / الاجتماعات',
    no_tasks: 'لا توجد مهام مجدولة',
    completed_badge: '✓ مكتمل',
    pending_badge: '⏳ معلق',
    events_title: '٦. أعياد الميلاد والمناسبات السعيدة',
    birthday: 'عيد ميلاد',
    anniversary: 'ذكرى زواج',
    special_event: 'مناسبة خاصة',
    relation: 'الصلة',
    notes_title: '٧. ملخص المذكرات والملاحظات',
    no_notes: 'لا توجد ملاحظات متاحة',
    general_note: 'عام',
    pinned: 'مثبت',
    footer_text: 'تم إنشاء هذا التقرير عبر تطبيق اليوميات اليومية | الخصوصية محمية',
  },
};

/**
 * Builds the HTML report string in the user's selected language and category
 */
export const buildReportHtml = ({
  user,
  monthYear,
  financeList = [],
  accounts = { bankBalance: 42500, cashBalance: 6800 },
  khata = [],
  medicineList = [],
  reminderList = [],
  notesList = [],
  events = [],
  fitness = null,
  reportCategory = 'all', // 'all', 'finance', 'health', 'reminders', 'notes'
  lang = 'gu',
}) => {
  const L = REPORT_TEXTS[lang] || REPORT_TEXTS.en || REPORT_TEXTS.gu;

  // Title selection based on category
  let reportHeading = L.report_title_all;
  if (reportCategory === 'finance') reportHeading = L.report_title_finance;
  if (reportCategory === 'health') reportHeading = L.report_title_health;
  if (reportCategory === 'reminders') reportHeading = L.report_title_reminders;
  if (reportCategory === 'notes') reportHeading = L.report_title_notes;

  const totalIncome = financeList
    .filter((f) => f.type === 'income')
    .reduce((sum, f) => sum + Number(f.amount || 0), 0);

  const totalExpense = financeList
    .filter((f) => f.type === 'expense')
    .reduce((sum, f) => sum + Number(f.amount || 0), 0);

  const netSavings = totalIncome - totalExpense;

  const bankBal = Number(accounts?.bankBalance || 0);
  const cashBal = Number(accounts?.cashBalance || 0);

  const toReceive = khata
    .filter((k) => !k.isSettled && k.type === 'to_receive')
    .reduce((s, k) => s + Number(k.amount || 0), 0);

  const toPay = khata
    .filter((k) => !k.isSettled && k.type === 'to_pay')
    .reduce((s, k) => s + Number(k.amount || 0), 0);

  // Health data
  const steps = fitness?.steps || 4250;
  const calories = fitness?.calories || 220;
  const bpm = fitness?.heartRate || 74;
  const bp = fitness?.bloodPressure
    ? `${fitness.bloodPressure.systolic}/${fitness.bloodPressure.diastolic} mmHg`
    : '120/80 mmHg';
  const sugar = fitness?.bloodSugar
    ? `Fasting: ${fitness.bloodSugar.fasting} / Post: ${fitness.bloodSugar.postMeal} mg/dL`
    : '95 / 130 mg/dL';
  const sleep = fitness?.sleepHours ? `${fitness.sleepHours} hrs` : '7.5 hrs';

  const showFinance = reportCategory === 'all' || reportCategory === 'finance';
  const showHealth = reportCategory === 'all' || reportCategory === 'health';
  const showReminders = reportCategory === 'all' || reportCategory === 'reminders';
  const showNotes = reportCategory === 'all' || reportCategory === 'notes';

  // Limit table rows in 'all' mode, show more in dedicated mode
  const txLimit = reportCategory === 'finance' ? 30 : 10;
  const khataLimit = reportCategory === 'finance' ? 25 : 6;
  const notesLimit = reportCategory === 'notes' ? 25 : 6;

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Noto Sans Gujarati', 'Noto Sans Devanagari', sans-serif; color: #1e293b; background: #ffffff; padding: 28px; width: 794px; min-height: 1123px; box-sizing: border-box; line-height: 1.45;">
      
      <!-- Top Banner Header -->
      <div style="background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%); color: #ffffff; padding: 22px 26px; border-radius: 16px; margin-bottom: 22px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <h1 style="margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.3px;">${reportHeading}</h1>
            <p style="margin: 5px 0 0 0; font-size: 13px; opacity: 0.9;">${L.app_subtitle} | ${L.month}: <strong>${monthYear}</strong></p>
          </div>
          <div style="text-align: right; font-size: 11px; opacity: 0.95; line-height: 1.5;">
            <div><strong>${user?.name || 'User'}</strong></div>
            <div>📱 ${user?.mobile || 'N/A'}</div>
            <div>✉️ ${user?.email || 'N/A'}</div>
          </div>
        </div>
      </div>

      ${showFinance ? `
        <!-- 1. Bank, Cash & Khata Overview Grid -->
        <div style="margin-bottom: 22px;">
          <h2 style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">
            ${L.bank_and_cash}
          </h2>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
            <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 12px;">
              <div style="font-size: 11px; color: #64748b; font-weight: 600;">🏦 ${L.bank_balance}</div>
              <div style="font-size: 16px; font-weight: 800; color: #0284c7; margin-top: 4px;">₹${bankBal.toLocaleString()}</div>
            </div>
            <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 12px;">
              <div style="font-size: 11px; color: #64748b; font-weight: 600;">💵 ${L.cash_balance}</div>
              <div style="font-size: 16px; font-weight: 800; color: #16a34a; margin-top: 4px;">₹${cashBal.toLocaleString()}</div>
            </div>
            <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 12px;">
              <div style="font-size: 11px; color: #047857; font-weight: 600;">📥 ${L.to_receive}</div>
              <div style="font-size: 16px; font-weight: 800; color: #059669; margin-top: 4px;">₹${toReceive.toLocaleString()}</div>
            </div>
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 12px;">
              <div style="font-size: 11px; color: #b91c1c; font-weight: 600;">📤 ${L.to_pay}</div>
              <div style="font-size: 16px; font-weight: 800; color: #dc2626; margin-top: 4px;">₹${toPay.toLocaleString()}</div>
            </div>
          </div>
        </div>

        <!-- 2. Financial Summary (Income, Expense, Net) -->
        <div style="margin-bottom: 22px;">
          <h2 style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">
            ${L.income_expense_title}
          </h2>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 12px;">
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 10px 14px;">
              <span style="font-size: 11px; color: #15803d; font-weight: 600;">${L.total_income}:</span>
              <div style="font-size: 17px; font-weight: 800; color: #16a34a; margin-top: 2px;">₹${totalIncome.toLocaleString()}</div>
            </div>
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 10px 14px;">
              <span style="font-size: 11px; color: #b91c1c; font-weight: 600;">${L.total_expense}:</span>
              <div style="font-size: 17px; font-weight: 800; color: #dc2626; margin-top: 2px;">₹${totalExpense.toLocaleString()}</div>
            </div>
            <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 10px 14px;">
              <span style="font-size: 11px; color: #1d4ed8; font-weight: 600;">${L.net_savings}:</span>
              <div style="font-size: 17px; font-weight: 800; color: #2563eb; margin-top: 2px;">₹${netSavings.toLocaleString()}</div>
            </div>
          </div>

          <!-- Transactions Table -->
          <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: left;">
            <thead>
              <tr style="background: #2563eb; color: #ffffff;">
                <th style="padding: 7px 10px; border-radius: 8px 0 0 0;">${L.date}</th>
                <th style="padding: 7px 10px;">${L.type}</th>
                <th style="padding: 7px 10px;">${L.category}</th>
                <th style="padding: 7px 10px;">${L.description}</th>
                <th style="padding: 7px 10px;">${L.payment_mode}</th>
                <th style="padding: 7px 10px; text-align: right; border-radius: 0 8px 0 0;">${L.amount}</th>
              </tr>
            </thead>
            <tbody>
              ${
                financeList.length === 0
                  ? `<tr><td colspan="6" style="padding: 10px; text-align: center; color: #94a3b8;">${L.no_transactions}</td></tr>`
                  : financeList.slice(0, txLimit).map((f, idx) => `
                      <tr style="background: ${idx % 2 === 0 ? '#f8fafc' : '#ffffff'}; border-bottom: 1px solid #e2e8f0;">
                        <td style="padding: 6px 10px;">${f.date}</td>
                        <td style="padding: 6px 10px; font-weight: bold; color: ${f.type === 'income' ? '#16a34a' : '#dc2626'};">${f.type === 'income' ? '+ ' + L.income : '- ' + L.expense}</td>
                        <td style="padding: 6px 10px; font-weight: 600;">${f.category}</td>
                        <td style="padding: 6px 10px; color: #475569;">${f.description || '-'}</td>
                        <td style="padding: 6px 10px; color: #64748b;">${f.paymentMode || 'Cash'}</td>
                        <td style="padding: 6px 10px; text-align: right; font-weight: bold; color: ${f.type === 'income' ? '#16a34a' : '#dc2626'};">₹${Number(f.amount).toLocaleString()}</td>
                      </tr>
                    `).join('')
              }
            </tbody>
          </table>
        </div>

        <!-- 3. Party Khata (Lena / Dena) -->
        ${khata.length > 0 ? `
          <div style="margin-bottom: 22px;">
            <h2 style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">
              ${L.khata_title}
            </h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: left;">
              <thead>
                <tr style="background: #475569; color: #ffffff;">
                  <th style="padding: 7px 10px; border-radius: 8px 0 0 0;">${L.party_name}</th>
                  <th style="padding: 7px 10px;">${L.phone}</th>
                  <th style="padding: 7px 10px;">${L.type}</th>
                  <th style="padding: 7px 10px;">${L.due_date}</th>
                  <th style="padding: 7px 10px;">${L.status}</th>
                  <th style="padding: 7px 10px; text-align: right; border-radius: 0 8px 0 0;">${L.amount}</th>
                </tr>
              </thead>
              <tbody>
                ${khata.slice(0, khataLimit).map((k, idx) => `
                  <tr style="background: ${idx % 2 === 0 ? '#f8fafc' : '#ffffff'}; border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 6px 10px; font-weight: bold;">${k.partyName}</td>
                    <td style="padding: 6px 10px; color: #64748b;">${k.phone || '-'}</td>
                    <td style="padding: 6px 10px; font-weight: 600; color: ${k.type === 'to_receive' ? '#059669' : '#dc2626'};">
                      ${k.type === 'to_receive' ? L.to_receive_short : L.to_pay_short}
                    </td>
                    <td style="padding: 6px 10px; color: #d97706; font-weight: 600;">${k.dueDate || '-'}</td>
                    <td style="padding: 6px 10px;">
                      <span style="display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; background: ${k.isSettled ? '#e2e8f0' : '#fef3c7'}; color: ${k.isSettled ? '#475569' : '#b45309'};">
                        ${k.isSettled ? L.settled : L.pending}
                      </span>
                    </td>
                    <td style="padding: 6px 10px; text-align: right; font-weight: bold; color: ${k.type === 'to_receive' ? '#059669' : '#dc2626'};">
                      ₹${Number(k.amount).toLocaleString()}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        ` : ''}
      ` : ''}

      ${showHealth ? `
        <!-- 4. Health, Fitness & Medications -->
        <div style="margin-bottom: 22px;">
          <h2 style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">
            ${L.health_title}
          </h2>
          <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 12px;">
            <div style="background: #f0fdfa; border: 1px solid #ccfbf1; border-radius: 12px; padding: 10px;">
              <div style="font-size: 10px; color: #0d9488; font-weight: 600;">👟 ${L.steps}</div>
              <div style="font-size: 14px; font-weight: 800; color: #0f766e; margin-top: 2px;">${steps.toLocaleString()}</div>
            </div>
            <div style="background: #fff7ed; border: 1px solid #ffedd5; border-radius: 12px; padding: 10px;">
              <div style="font-size: 10px; color: #ea580c; font-weight: 600;">🔥 ${L.calories}</div>
              <div style="font-size: 14px; font-weight: 800; color: #c2410c; margin-top: 2px;">${calories} kcal</div>
            </div>
            <div style="background: #fef2f2; border: 1px solid #fee2e2; border-radius: 12px; padding: 10px;">
              <div style="font-size: 10px; color: #e11d48; font-weight: 600;">💓 ${L.heart_rate}</div>
              <div style="font-size: 14px; font-weight: 800; color: #be123c; margin-top: 2px;">${bpm} BPM</div>
            </div>
            <div style="background: #eff6ff; border: 1px solid #dbeafe; border-radius: 12px; padding: 10px;">
              <div style="font-size: 10px; color: #2563eb; font-weight: 600;">🩺 ${L.bp_and_sleep}</div>
              <div style="font-size: 12px; font-weight: 800; color: #1e40af; margin-top: 2px;">${bp} (${sleep})</div>
            </div>
          </div>

          <!-- Extra vitals for medical report -->
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 10px 14px; margin-bottom: 12px; display: flex; justify-content: space-between; font-size: 11px;">
            <div>🩸 <strong>${L.sugar}:</strong> ${sugar}</div>
            <div>⚖️ <strong>${L.weight_height}:</strong> ${fitness?.weightKg || 68} kg / ${fitness?.heightCm || 170} cm (BMI: ${((fitness?.weightKg || 68) / Math.pow((fitness?.heightCm || 170)/100, 2)).toFixed(1)})</div>
          </div>

          <!-- Medicines Routine -->
          ${medicineList.length > 0 ? `
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 12px; margin-bottom: 12px;">
              <span style="font-size: 11px; font-weight: bold; color: #475569; display: block; margin-bottom: 6px;">💊 ${L.medicines_list}:</span>
              <table style="width: 100%; border-collapse: collapse; font-size: 10px; text-align: left;">
                <thead>
                  <tr style="background: #0284c7; color: #ffffff;">
                    <th style="padding: 6px 8px; border-radius: 6px 0 0 0;">${L.med_name}</th>
                    <th style="padding: 6px 8px;">${L.dosage}</th>
                    <th style="padding: 6px 8px;">${L.time}</th>
                    <th style="padding: 6px 8px; border-radius: 0 6px 0 0;">${L.food_condition}</th>
                  </tr>
                </thead>
                <tbody>
                  ${medicineList.map((m, idx) => `
                    <tr style="background: ${idx % 2 === 0 ? '#ffffff' : '#f0f9ff'}; border-bottom: 1px solid #e2e8f0;">
                      <td style="padding: 5px 8px; font-weight: bold;">${m.name}</td>
                      <td style="padding: 5px 8px;">${m.dosage}</td>
                      <td style="padding: 5px 8px; color: #0284c7; font-weight: 600;">${m.time}</td>
                      <td style="padding: 5px 8px; font-weight: bold; color: ${m.mealRelation === 'before_food' ? '#b45309' : '#15803d'};">
                        ${m.mealRelation === 'before_food' ? L.before_food : L.after_food}
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : ''}

          <!-- Doctor Consultation Notes Box -->
          <div style="border: 1px dashed #94a3b8; border-radius: 12px; padding: 12px; background: #fafafa;">
            <div style="font-size: 11px; font-weight: 700; color: #334155; margin-bottom: 4px;">👨‍⚕️ ${L.doctor_notes}:</div>
            <div style="min-height: 48px; border-bottom: 1px dotted #cbd5e1; margin-bottom: 6px;"></div>
            <div style="display: flex; justify-content: space-between; font-size: 9px; color: #94a3b8;">
              <span>${L.doctor_sign}</span>
              <span>${L.date}: ______________</span>
            </div>
          </div>
        </div>
      ` : ''}

      ${showReminders ? `
        <!-- 5. Tasks and Meetings -->
        <div style="margin-bottom: 22px;">
          <h2 style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">
            ${L.tasks_title}
          </h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: left;">
            <thead>
              <tr style="background: #4f46e5; color: #ffffff;">
                <th style="padding: 6px 10px; border-radius: 8px 0 0 0;">${L.date}</th>
                <th style="padding: 6px 10px;">${L.time}</th>
                <th style="padding: 6px 10px;">${L.type}</th>
                <th style="padding: 6px 10px;">${L.description}</th>
                <th style="padding: 6px 10px; text-align: right; border-radius: 0 8px 0 0;">${L.status}</th>
              </tr>
            </thead>
            <tbody>
              ${
                reminderList.length === 0
                  ? `<tr><td colspan="5" style="padding: 10px; text-align: center; color: #94a3b8;">${L.no_tasks}</td></tr>`
                  : reminderList.slice(0, 15).map((r, idx) => `
                      <tr style="background: ${idx % 2 === 0 ? '#f8fafc' : '#ffffff'}; border-bottom: 1px solid #e2e8f0;">
                        <td style="padding: 6px 10px; font-weight: 600;">${r.date}</td>
                        <td style="padding: 6px 10px; color: #4f46e5; font-weight: 600;">${r.time}</td>
                        <td style="padding: 6px 10px; font-weight: bold;">${r.type}</td>
                        <td style="padding: 6px 10px;">${r.title} ${r.description ? `(${r.description})` : ''}</td>
                        <td style="padding: 6px 10px; text-align: right; font-weight: bold; color: ${r.isCompleted ? '#16a34a' : '#d97706'};">
                          ${r.isCompleted ? L.completed_badge : L.pending_badge}
                        </td>
                      </tr>
                    `).join('')
              }
            </tbody>
          </table>
        </div>

        <!-- 6. Birthdays & Anniversaries -->
        ${events.length > 0 ? `
          <div style="margin-bottom: 22px;">
            <h2 style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">
              ${L.events_title}
            </h2>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
              ${events.map((ev) => `
                <div style="background: #fdf2f8; border: 1px solid #fbcfe8; border-radius: 12px; padding: 10px 14px;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong style="font-size: 12px; color: #9d174d;">${ev.type === 'birthday' ? '🎂 ' + L.birthday : ev.type === 'anniversary' ? '💍 ' + L.anniversary : '🎉 ' + L.special_event}</strong>
                    <span style="font-size: 10px; background: #be185d; color: #ffffff; padding: 2px 6px; border-radius: 10px; font-weight: bold;">${ev.date}</span>
                  </div>
                  <div style="font-size: 13px; font-weight: 800; color: #831843; margin-top: 4px;">${ev.name}</div>
                  <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
                    ${ev.relation ? `${L.relation}: ${ev.relation} • ` : ''} 📱 ${ev.phone || 'N/A'}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
      ` : ''}

      ${showNotes ? `
        <!-- 7. Notes and Diary -->
        <div style="margin-bottom: 22px;">
          <h2 style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 0 0 10px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 5px;">
            ${L.notes_title}
          </h2>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${
              notesList.length === 0
                ? `<div style="padding: 10px; text-align: center; color: #94a3b8; font-size: 11px;">${L.no_notes}</div>`
                : notesList.slice(0, notesLimit).map((n) => `
                    <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 10px 14px;">
                      <div style="display: flex; justify-content: space-between; font-size: 10px; color: #64748b; margin-bottom: 3px;">
                        <span>📅 ${n.date || 'Today'} • <strong style="color: #2563eb;">${n.category || L.general_note}</strong></span>
                        ${n.isPinned ? `<span style="color: #d97706; font-weight: bold;">📌 ${L.pinned}</span>` : ''}
                      </div>
                      <div style="font-size: 12px; font-weight: 800; color: #0f172a;">${n.title}</div>
                      <div style="font-size: 11px; color: #334155; margin-top: 3px; line-height: 1.4;">${n.content}</div>
                    </div>
                  `).join('')
            }
          </div>
        </div>
      ` : ''}

      <!-- Footer Note -->
      <div style="margin-top: 24px; padding-top: 12px; border-top: 1px solid #cbd5e1; text-align: center; font-size: 10px; color: #94a3b8;">
        ${L.footer_text} | ${new Date().toLocaleDateString()}
      </div>

    </div>
  `;
};

/**
 * Generates and downloads the pixel-perfect Unicode PDF using html2canvas & jsPDF
 */
export const generateMonthlyReportPDF = async ({
  user,
  monthYear,
  financeList = [],
  accounts = { bankBalance: 42500, cashBalance: 6800 },
  khata = [],
  medicineList = [],
  reminderList = [],
  notesList = [],
  events = [],
  fitness = null,
  reportCategory = 'all', // 'all', 'finance', 'health', 'reminders', 'notes'
  lang = 'gu',
}) => {
  // 1. Create a hidden rendering container in the DOM
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  container.style.width = '794px';
  container.style.zIndex = '-999';
  container.innerHTML = buildReportHtml({
    user,
    monthYear,
    financeList,
    accounts,
    khata,
    medicineList,
    reminderList,
    notesList,
    events,
    fitness,
    reportCategory,
    lang,
  });

  document.body.appendChild(container);

  try {
    // 2. Render to high-DPI canvas
    const targetElement = container.firstElementChild;
    const canvas = await html2canvas(targetElement, {
      scale: 2, // High resolution for crisp print quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);

    // 3. Create PDF with multi-page handling if content exceeds 1 page
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfPageHeight = pdf.internal.pageSize.getHeight();
    const totalPdfHeight = (canvas.height * pdfWidth) / canvas.width;

    if (totalPdfHeight <= pdfPageHeight) {
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, totalPdfHeight);
    } else {
      let heightLeft = totalPdfHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, totalPdfHeight);
      heightLeft -= pdfPageHeight;

      while (heightLeft > 0) {
        position -= pdfPageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, totalPdfHeight);
        heightLeft -= pdfPageHeight;
      }
    }

    // 4. Download file
    const langSuffix = lang.toUpperCase();
    const sanitizedMonth = monthYear.replace(/\s+/g, '_');
    const categoryTag = reportCategory === 'all' ? 'Full' : reportCategory.charAt(0).toUpperCase() + reportCategory.slice(1);
    pdf.save(`DailyDiary_${categoryTag}_${langSuffix}_${sanitizedMonth}.pdf`);
  } finally {
    // Clean up
    document.body.removeChild(container);
  }
};
