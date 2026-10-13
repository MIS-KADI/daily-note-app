import React, { useState, useEffect, useRef } from 'react';
import {
  Pill,
  Activity,
  Flame,
  Footprints,
  Heart,
  HeartPulse,
  Scale,
  Plus,
  Minus,
  CheckCircle2,
  Clock,
  Trash2,
  Edit3,
  Sun,
  Sunrise,
  Sunset,
  Moon,
  Volume2,
  X,
  Check,
  Dumbbell,
  Timer,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Zap,
  BarChart3,
  Droplets,
  Wind,
  Play,
  Pause,
  RotateCcw,
  ShieldCheck,
  Award,
  Eye,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { t } from '../../services/i18n';
import { storageService } from '../../services/storageService';

const MEDICINE_SLOTS = {
  gu: [
    { id: 'all', label: 'બધી દવાઓ', icon: null },
    { id: 'morning', label: '🌅 સવાર', icon: Sunrise },
    { id: 'afternoon', label: '☀️ બપોર', icon: Sun },
    { id: 'evening', label: '🌇 સાંજ', icon: Sunset },
    { id: 'night', label: '🌙 રાત', icon: Moon },
  ],
  hi: [
    { id: 'all', label: 'सभी दवाइयाँ', icon: null },
    { id: 'morning', label: '🌅 सुबह', icon: Sunrise },
    { id: 'afternoon', label: '☀️ दोपहर', icon: Sun },
    { id: 'evening', label: '🌇 शाम', icon: Sunset },
    { id: 'night', label: '🌙 रात', icon: Moon },
  ],
  en: [
    { id: 'all', label: 'All Medicines', icon: null },
    { id: 'morning', label: '🌅 Morning', icon: Sunrise },
    { id: 'afternoon', label: '☀️ Afternoon', icon: Sun },
    { id: 'evening', label: '🌇 Evening', icon: Sunset },
    { id: 'night', label: '🌙 Night', icon: Moon },
  ],
  es: [
    { id: 'all', label: 'Todas las Medicinas', icon: null },
    { id: 'morning', label: '🌅 Mañana', icon: Sunrise },
    { id: 'afternoon', label: '☀️ Tarde', icon: Sun },
    { id: 'evening', label: '🌇 Tarde-Noche', icon: Sunset },
    { id: 'night', label: '🌙 Noche', icon: Moon },
  ],
  fr: [
    { id: 'all', label: 'Tous Médicaments', icon: null },
    { id: 'morning', label: '🌅 Matin', icon: Sunrise },
    { id: 'afternoon', label: '☀️ Midi', icon: Sun },
    { id: 'evening', label: '🌇 Soir', icon: Sunset },
    { id: 'night', label: '🌙 Nuit', icon: Moon },
  ],
  de: [
    { id: 'all', label: 'Alle Medikamente', icon: null },
    { id: 'morning', label: '🌅 Morgen', icon: Sunrise },
    { id: 'afternoon', label: '☀️ Mittag', icon: Sun },
    { id: 'evening', label: '🌇 Abend', icon: Sunset },
    { id: 'night', label: '🌙 Nacht', icon: Moon },
  ],
  ar: [
    { id: 'all', label: 'جميع الأدوية', icon: null },
    { id: 'morning', label: '🌅 صباحاً', icon: Sunrise },
    { id: 'afternoon', label: '☀️ ظهراً', icon: Sun },
    { id: 'evening', label: '🌇 مساءً', icon: Sunset },
    { id: 'night', label: '🌙 ليلاً', icon: Moon },
  ],
};

const WORKOUT_TYPES = {
  gu: [
    { id: 'walk', label: '🚶 મોર્નિંગ વૉક (Morning Walk)', ratePerMin: 4.2 },
    { id: 'run', label: '🏃 દોડવું / જોગિંગ (Running)', ratePerMin: 9.5 },
    { id: 'gym', label: '🏋️ જીમ & વેઇટ લિફ્ટિંગ (Gym / Weights)', ratePerMin: 6.8 },
    { id: 'yoga', label: '🧘 યોગ & પ્રાણાયામ (Yoga & Meditation)', ratePerMin: 3.5 },
    { id: 'cycle', label: '🚴 સાયકલિંગ (Cycling)', ratePerMin: 7.5 },
    { id: 'cardio', label: '🤸 કાર્ડિયો & એરોબિક્સ (Cardio)', ratePerMin: 8.2 },
  ],
  hi: [
    { id: 'walk', label: '🚶 मॉर्निंग वॉक (Morning Walk)', ratePerMin: 4.2 },
    { id: 'run', label: '🏃 दौड़ना / जॉगिंग (Running)', ratePerMin: 9.5 },
    { id: 'gym', label: '🏋️ जिम और वेट ट्रेनिंग (Gym / Weights)', ratePerMin: 6.8 },
    { id: 'yoga', label: '🧘 योग और प्राणायाम (Yoga)', ratePerMin: 3.5 },
    { id: 'cycle', label: '🚴 साइकिलिंग (Cycling)', ratePerMin: 7.5 },
    { id: 'cardio', label: '🤸 कार्डियो और एरोबिक्स (Cardio)', ratePerMin: 8.2 },
  ],
  en: [
    { id: 'walk', label: '🚶 Morning Walk', ratePerMin: 4.2 },
    { id: 'run', label: '🏃 Running / Jogging', ratePerMin: 9.5 },
    { id: 'gym', label: '🏋️ Gym & Weight Training', ratePerMin: 6.8 },
    { id: 'yoga', label: '🧘 Yoga & Meditation', ratePerMin: 3.5 },
    { id: 'cycle', label: '🚴 Cycling', ratePerMin: 7.5 },
    { id: 'cardio', label: '🤸 Cardio & Aerobics', ratePerMin: 8.2 },
  ],
  es: [
    { id: 'walk', label: '🚶 Caminata Matutina', ratePerMin: 4.2 },
    { id: 'run', label: '🏃 Correr / Jogging', ratePerMin: 9.5 },
    { id: 'gym', label: '🏋️ Gimnasio y Pesas', ratePerMin: 6.8 },
    { id: 'yoga', label: '🧘 Yoga y Meditación', ratePerMin: 3.5 },
    { id: 'cycle', label: '🚴 Ciclismo', ratePerMin: 7.5 },
    { id: 'cardio', label: '🤸 Cardio y Aeróbicos', ratePerMin: 8.2 },
  ],
  fr: [
    { id: 'walk', label: '🚶 Marche Matinale', ratePerMin: 4.2 },
    { id: 'run', label: '🏃 Course / Jogging', ratePerMin: 9.5 },
    { id: 'gym', label: '🏋️ Salle de Sport & Musculation', ratePerMin: 6.8 },
    { id: 'yoga', label: '🧘 Yoga & Méditation', ratePerMin: 3.5 },
    { id: 'cycle', label: '🚴 Cyclisme / Vélo', ratePerMin: 7.5 },
    { id: 'cardio', label: '🤸 Cardio & Aérobic', ratePerMin: 8.2 },
  ],
  de: [
    { id: 'walk', label: '🚶 Morgenspaziergang', ratePerMin: 4.2 },
    { id: 'run', label: '🏃 Laufen / Joggen', ratePerMin: 9.5 },
    { id: 'gym', label: '🏋️ Fitnessstudio & Krafttraining', ratePerMin: 6.8 },
    { id: 'yoga', label: '🧘 Yoga & Meditation', ratePerMin: 3.5 },
    { id: 'cycle', label: '🚴 Radfahren', ratePerMin: 7.5 },
    { id: 'cardio', label: '🤸 Kardio & Aerobic', ratePerMin: 8.2 },
  ],
  ar: [
    { id: 'walk', label: '🚶 المشي الصباحي', ratePerMin: 4.2 },
    { id: 'run', label: '🏃 الجري والركض', ratePerMin: 9.5 },
    { id: 'gym', label: '🏋️ صالة الألعاب ورفع الأثقال', ratePerMin: 6.8 },
    { id: 'yoga', label: '🧘 اليوغا والتأمل', ratePerMin: 3.5 },
    { id: 'cycle', label: '🚴 ركوب الدراجة', ratePerMin: 7.5 },
    { id: 'cardio', label: '🤸 تمارين القلب والأيروبيك', ratePerMin: 8.2 },
  ],
};

export default function HealthHubTab({
  medicines = [],
  medicineLogs = {},
  onSaveMedicines,
  onToggleMedicine,
  onTriggerAlarm,
  fitness,
  isStepSensorActive = false,
  onToggleStepSensor,
  onStepIncrement,
  onUpdateFitness,
  water,
  onUpdateWater,
  lang = 'gu',
  initialSubTab = 'fitness',
  isDemoMode,
  onClearDemo,
  checkCanAdd,
}) {
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab);
  const todayStr = new Date().toISOString().split('T')[0];

  const currentMedicineSlots = MEDICINE_SLOTS[lang] || MEDICINE_SLOTS.en || MEDICINE_SLOTS.gu;
  const currentWorkoutTypes = WORKOUT_TYPES[lang] || WORKOUT_TYPES.en || WORKOUT_TYPES.gu;

  // Water Calculation & Handlers
  const glasses = water?.glasses || 0;
  const targetGlasses = water?.target || 8;
  const waterPct = Math.min(100, Math.round((glasses / targetGlasses) * 100));

  const handleAddWater = (amount = 1) => {
    const next = glasses + amount;
    onUpdateWater?.({ ...water, glasses: next });
    if (next >= targetGlasses && glasses < targetGlasses) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  };

  const handleMinusWater = () => {
    if (glasses > 0) {
      onUpdateWater?.({ ...water, glasses: glasses - 1 });
    }
  };

  const handleSetWaterTarget = (newTarget) => {
    const t = Number(newTarget);
    if (!isNaN(t) && t > 0) {
      onUpdateWater?.({ ...water, target: t });
    }
  };

  const handleResetWater = () => {
    const confirmMsg =
      lang === 'gu'
        ? 'શું તમે આજના પાણીની ગણતરી ફરીથી 0 કરવા માંગો છો?'
        : lang === 'hi'
        ? 'क्या आप आज के पानी की गिनती 0 करना चाहते हैं?'
        : 'Do you want to reset today water count to 0?';
    if (window.confirm(confirmMsg)) {
      onUpdateWater?.({ ...water, glasses: 0 });
    }
  };

  // ----------------------------------------------------
  // 1. MEDICINES SUB-TAB STATE & LOGIC
  // ----------------------------------------------------
  const [selectedSlot, setSelectedSlot] = useState('all');
  const [isMedModalOpen, setIsMedModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState(null);

  // Medicine Form
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('૧ ગોળી');
  const [medTimeSlot, setMedTimeSlot] = useState('morning');
  const [medMealRelation, setMedMealRelation] = useState('before_food');
  const [medTime, setMedTime] = useState('08:00');
  const [medNotes, setMedNotes] = useState('');
  const [medHasAlarm, setMedHasAlarm] = useState(true);

  const handleOpenAddMed = () => {
    if (typeof checkCanAdd === 'function') {
      if (!checkCanAdd(() => handleOpenAddMed())) {
        return;
      }
    }
    setEditingMed(null);
    setMedName('');
    setMedDosage('૧ ગોળી');
    setMedTimeSlot('morning');
    setMedMealRelation('before_food');
    setMedTime('08:00');
    setMedNotes('');
    setMedHasAlarm(true);
    setIsMedModalOpen(true);
  };

  const handleOpenEditMed = (med) => {
    setEditingMed(med);
    setMedName(med.name);
    setMedDosage(med.dosage);
    setMedTimeSlot(med.timeSlot);
    setMedMealRelation(med.mealRelation);
    setMedTime(med.time);
    setMedNotes(med.notes || '');
    setMedHasAlarm(med.hasAlarm ?? true);
    setIsMedModalOpen(true);
  };

  const handleSaveMed = (e) => {
    e.preventDefault();
    if (!medName.trim()) return;

    if (editingMed) {
      const updated = medicines.map((m) =>
        m.id === editingMed.id
          ? {
              ...m,
              name: medName,
              dosage: medDosage,
              timeSlot: medTimeSlot,
              mealRelation: medMealRelation,
              time: medTime,
              notes: medNotes,
              hasAlarm: medHasAlarm,
            }
          : m
      );
      onSaveMedicines(updated);
    } else {
      const newMed = {
        id: 'med-' + Date.now(),
        name: medName,
        dosage: medDosage,
        timeSlot: medTimeSlot,
        mealRelation: medMealRelation,
        time: medTime,
        notes: medNotes,
        hasAlarm: medHasAlarm,
        active: true,
      };
      onSaveMedicines([...medicines, newMed]);
    }
    setIsMedModalOpen(false);
  };

  const handleDeleteMed = (id) => {
    const confirmMsg =
      lang === 'gu'
        ? 'શું તમે આ દવા હટાવવા માંગો છો?'
        : lang === 'hi'
        ? 'क्या आप इस दवा को हटाना चाहते हैं?'
        : 'Do you want to delete this medicine?';
    if (window.confirm(confirmMsg)) {
      onSaveMedicines(medicines.filter((m) => m.id !== id));
    }
  };

  const filteredMedicines = medicines.filter((m) => {
    if (selectedSlot === 'all') return true;
    return m.timeSlot === selectedSlot;
  });

  const takenCount = medicines.filter((m) => m.active && medicineLogs[todayStr]?.[m.id]?.taken).length;
  const activeMeds = medicines.filter((m) => m.active);

  // ----------------------------------------------------
  // 2. FITNESS & STEPS LOGIC
  // ----------------------------------------------------
  const steps = fitness?.steps || 0;
  const stepTarget = fitness?.stepTarget || 8000;
  const distanceKm = fitness?.distanceKm || Number(((steps * 0.76) / 1000).toFixed(2));
  const stepCalories = Math.round(steps * 0.045);

  const workouts = fitness?.workouts || [];
  const workoutCalories = workouts.reduce((sum, w) => sum + Number(w.calories || 0), 0);
  const totalCalories = stepCalories + workoutCalories;
  const stepProgress = Math.min(100, Math.round((steps / stepTarget) * 100));

  const [weeklySteps] = useState(() => {
    const list = storageService.getWeeklyStepHistory();
    return list.map((item) => (item.isToday ? { ...item, steps: steps || item.steps } : item));
  });

  const handleAddSteps = (count) => {
    if (typeof onStepIncrement === 'function') {
      onStepIncrement(count);
    } else {
      const nextSteps = Math.max(0, steps + count);
      const nextKm = Number(((nextSteps * 0.76) / 1000).toFixed(2));
      const nextCal = Math.round(nextSteps * 0.045) + workoutCalories;
      onUpdateFitness({
        ...fitness,
        steps: nextSteps,
        distanceKm: nextKm,
        calories: nextCal,
      });
    }
    if (steps + count >= stepTarget && steps < stepTarget) {
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    }
  };

  // Workout Logger
  const [selectedWorkoutType, setSelectedWorkoutType] = useState('walk');
  const [workoutDuration, setWorkoutDuration] = useState(30);

  const handleAddWorkout = (e) => {
    e.preventDefault();
    if (typeof checkCanAdd === 'function') {
      if (!checkCanAdd(() => handleAddWorkout(e))) {
        return;
      }
    }
    const typeObj = currentWorkoutTypes.find((w) => w.id === selectedWorkoutType);
    const calculatedCals = Math.round((workoutDuration || 0) * (typeObj?.ratePerMin || 5));
    const nowTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    const newWorkout = {
      id: 'w-' + Date.now(),
      type: selectedWorkoutType,
      name: typeObj?.label || (lang === 'gu' ? 'કસરત' : 'Workout'),
      durationMinutes: Number(workoutDuration),
      calories: calculatedCals,
      time: nowTime,
    };

    const nextWorkouts = [newWorkout, ...workouts];
    const nextTotalCalories = stepCalories + nextWorkouts.reduce((s, w) => s + w.calories, 0);

    onUpdateFitness({
      ...fitness,
      workouts: nextWorkouts,
      calories: nextTotalCalories,
    });

    confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
  };

  const handleDeleteWorkout = (id) => {
    const nextWorkouts = workouts.filter((w) => w.id !== id);
    const nextTotalCalories = stepCalories + nextWorkouts.reduce((s, w) => s + w.calories, 0);
    onUpdateFitness({
      ...fitness,
      workouts: nextWorkouts,
      calories: nextTotalCalories,
    });
  };

  // ----------------------------------------------------
  // 3. CARDIO & LIVE PULSE TAP READER
  // ----------------------------------------------------
  const [tapTimes, setTapTimes] = useState([]);
  const [liveBpm, setLiveBpm] = useState(fitness?.heartRate || 74);
  const [isTapping, setIsTapping] = useState(false);
  const tapTimeoutRef = useRef(null);

  const handleTapPulse = () => {
    const now = performance.now();
    setIsTapping(true);
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }
    setTapTimes((prev) => {
      const filtered = [...prev, now].filter((t) => now - t < 4000);
      if (filtered.length >= 3) {
        const intervals = [];
        for (let i = 1; i < filtered.length; i++) {
          intervals.push(filtered[i] - filtered[i - 1]);
        }
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        if (avgInterval > 0) {
          const calculatedBpm = Math.round(60000 / avgInterval);
          if (calculatedBpm >= 40 && calculatedBpm <= 220) {
            setLiveBpm(calculatedBpm);
          }
        }
      }
      return filtered;
    });

    tapTimeoutRef.current = setTimeout(() => {
      setIsTapping(false);
    }, 1500);
  };

  const handleSaveBpm = () => {
    onUpdateFitness({
      ...fitness,
      heartRate: liveBpm,
    });
    alert(
      lang === 'gu'
        ? `હાર્ટ રેટ ${liveBpm} BPM સફળતાપૂર્વક સાચવવામાં આવ્યો!`
        : lang === 'hi'
        ? `हार्ट रेट ${liveBpm} BPM सफलतापूर्वक सहेजा गया!`
        : `Heart rate ${liveBpm} BPM saved successfully!`
    );
  };

  // Blood Pressure & Sugar & Sleep
  const [bpSystolic, setBpSystolic] = useState(fitness?.bloodPressure?.systolic || 120);
  const [bpDiastolic, setBpDiastolic] = useState(fitness?.bloodPressure?.diastolic || 80);
  const [sugarFasting, setSugarFasting] = useState(fitness?.bloodSugar?.fasting || 95);
  const [sugarPostMeal, setSugarPostMeal] = useState(fitness?.bloodSugar?.postMeal || 130);
  const [sleepHours, setSleepHours] = useState(fitness?.sleepHours || 7.5);

  const handleSaveVitals = () => {
    onUpdateFitness({
      ...fitness,
      heartRate: liveBpm,
      bloodPressure: { systolic: Number(bpSystolic), diastolic: Number(bpDiastolic) },
      bloodSugar: { fasting: Number(sugarFasting), postMeal: Number(sugarPostMeal) },
      sleepHours: Number(sleepHours),
    });
    alert(
      lang === 'gu'
        ? 'વાઇટલ્સ અને હેલ્થ લૉગ સફળતાપૂર્વક અપડેટ થયા!'
        : lang === 'hi'
        ? 'वाइटल्स और हेल्थ लॉग सफलतापूर्वक अपडेट हुए!'
        : 'Vitals and health log updated successfully!'
    );
  };

  const getBpCategory = (sys, dia) => {
    if (sys < 120 && dia < 80) {
      return {
        label: lang === 'gu' ? 'સામાન્ય (Normal)' : (lang === 'hi' ? 'सामान्य (Normal)' : 'Normal'),
        color: 'text-emerald-700 bg-emerald-100 border-emerald-300',
      };
    }
    if (sys <= 129 && dia < 80) {
      return {
        label: lang === 'gu' ? 'પ્રી-હાયપરટેન્શન (Elevated)' : (lang === 'hi' ? 'प्री-हाइपरटेंशन (Elevated)' : 'Elevated'),
        color: 'text-amber-700 bg-amber-100 border-amber-300',
      };
    }
    if (sys <= 139 || dia <= 89) {
      return {
        label: lang === 'gu' ? 'સ્ટેજ-૧ હાઇ BP (Hypertension 1)' : (lang === 'hi' ? 'स्टेज-1 हाई BP' : 'Stage 1 Hypertension'),
        color: 'text-orange-700 bg-orange-100 border-orange-300',
      };
    }
    return {
      label: lang === 'gu' ? 'સ્ટેજ-૨ હાઇ BP (Hypertension 2)' : (lang === 'hi' ? 'स्टेज-2 हाई BP' : 'Stage 2 Hypertension'),
      color: 'text-red-700 bg-red-100 border-red-300',
    };
  };

  // ----------------------------------------------------
  // 4. BMI CALCULATOR LOGIC
  // ----------------------------------------------------
  const [weightKg, setWeightKg] = useState(fitness?.weightKg || 68);
  const [heightCm, setHeightCm] = useState(fitness?.heightCm || 170);

  const heightInMeters = heightCm / 100;
  const bmiValue = heightInMeters > 0 ? Number((weightKg / (heightInMeters * heightInMeters)).toFixed(1)) : 22.0;

  const getBmiCategory = (bmi) => {
    if (bmi < 18.5) {
      return {
        label: lang === 'gu' ? 'ઓછું વજન (Underweight)' : (lang === 'hi' ? 'कम वजन (Underweight)' : 'Underweight'),
        color: 'text-amber-600 bg-amber-50 border-amber-300',
        barColor: 'bg-amber-500',
        advice: lang === 'gu' ? 'પૌષ્ટિક આહાર, ડ્રાયફ્રૂટ્સ, દૂધ અને પ્રોટીનયુક્ત ખોરાક વધારવો હિતાવહ છે.' : (lang === 'hi' ? 'पौष्टिक आहार, ड्राई फ्रूट्स और प्रोटीन युक्त भोजन बढ़ाना उचित है।' : 'Increase nutritious food, dry fruits, milk and protein intake.'),
      };
    }
    if (bmi <= 24.9) {
      return {
        label: lang === 'gu' ? 'સામાન્ય અને તંદુરસ્ત (Normal / Healthy)' : (lang === 'hi' ? 'सामान्य और स्वस्थ (Normal)' : 'Normal / Healthy'),
        color: 'text-emerald-700 bg-emerald-50 border-emerald-300',
        barColor: 'bg-emerald-500',
        advice: lang === 'gu' ? 'ઉત્તમ! તમારું વજન સંપૂર્ણ તંદુરસ્ત રેન્જમાં છે. આ જ રૂટિન જાળવી રાખો.' : (lang === 'hi' ? 'उत्तम! आपका वजन स्वस्थ सीमा में है। इसी दिनचर्या को बनाए रखें।' : 'Great! Your weight is in a healthy range. Keep maintaining this routine.'),
      };
    }
    if (bmi <= 29.9) {
      return {
        label: lang === 'gu' ? 'વધુ વજન (Overweight)' : (lang === 'hi' ? 'अधिक वजन (Overweight)' : 'Overweight'),
        color: 'text-orange-700 bg-orange-50 border-orange-300',
        barColor: 'bg-orange-500',
        advice: lang === 'gu' ? 'રોજિંદા ૮,૦૦૦+ સ્ટેપ્સ ચાલો, ગળપણ-ચરબી ઘટાડો અને કાર્ડિયો કસરત કરો.' : (lang === 'hi' ? 'रोजाना 8,000+ कदम चलें, मीठा व वसा कम करें और कार्डियो करें।' : 'Walk 8,000+ daily steps, cut down sugars/fats, and do cardio exercise.'),
      };
    }
    return {
      label: lang === 'gu' ? 'મેદસ્વીતા (Obese)' : (lang === 'hi' ? 'मोटापा (Obese)' : 'Obese'),
      color: 'text-red-700 bg-red-50 border-red-300',
      barColor: 'bg-red-500',
      advice: lang === 'gu' ? 'ડૉક્ટર/ન્યુટ્રિશનિસ્ટની સલાહ મુજબ કેલરી-નિયંત્રિત ડાયેટ અને નિયમિત કસરત શરૂ કરો.' : (lang === 'hi' ? 'डॉक्टर/आहार विशेषज्ञ की सलाह अनुसार कैलोरी-नियंत्रित आहार लें।' : 'Consult a doctor or nutritionist for a calorie-controlled diet and regular exercise.'),
    };
  };

  const bmiCat = getBmiCategory(bmiValue);
  const minHealthyWeight = Number((18.5 * heightInMeters * heightInMeters).toFixed(1));
  const maxHealthyWeight = Number((24.9 * heightInMeters * heightInMeters).toFixed(1));

  const handleSaveBmi = () => {
    onUpdateFitness({
      ...fitness,
      weightKg: Number(weightKg),
      heightCm: Number(heightCm),
    });
    alert(
      lang === 'gu'
        ? 'વજન અને ઊંચાઈ સફળતાપૂર્વક સાચવવામાં આવી!'
        : lang === 'hi'
        ? 'वजन और ऊंचाई सफलतापूर्वक सहेजी गई!'
        : 'Weight and height saved successfully!'
    );
  };

  // ----------------------------------------------------
  // 5. LUNGS & BREATHING EXERCISE STATE & LOGIC
  // ----------------------------------------------------
  const [breathMode, setBreathMode] = useState('478'); // '478' | 'box' | 'anulom' | 'deep'
  const [breathPhaseIndex, setBreathPhaseIndex] = useState(0);
  const [breathSecondsLeft, setBreathSecondsLeft] = useState(4);
  const [breathRound, setBreathRound] = useState(1);
  const [isBreathingActive, setIsBreathingActive] = useState(false);

  // Lung Capacity Breath-Hold Test
  const [isTestActive, setIsTestActive] = useState(false);
  const [testTime, setTestTime] = useState(0);
  const [testCompleted, setTestCompleted] = useState(false);
  const [bestTestTime, setBestTestTime] = useState(() => {
    try {
      return Number(localStorage.getItem('daily_note_lung_best') || 0);
    } catch {
      return 0;
    }
  });

  const getBreathModes = (l) => {
    if (l === 'hi') {
      return {
        '478': {
          title: '4-7-8 विधि (Deep Lung Expansion)',
          sub: 'ऑक्सीजन विस्तार और मानसिक शांति',
          badge: 'डॉ. वेल विधि',
          phases: [
            { name: 'inhale', duration: 4, label: 'गहरी सांस अंदर लें 🌬️', color: 'from-cyan-500 to-teal-500' },
            { name: 'hold', duration: 7, label: 'सांस रोकें ⏸️', color: 'from-amber-500 to-orange-500' },
            { name: 'exhale', duration: 8, label: 'धीरे-धीरे सांस छोड़ें 💨', color: 'from-indigo-500 to-blue-500' },
          ],
        },
        'box': {
          title: 'बॉक्स ब्रीदिंग (Box 4-4-4-4)',
          sub: 'फेफड़ों के वायुकोष सक्रिय व मजबूत',
          badge: 'समवृत्ति प्राणायाम',
          phases: [
            { name: 'inhale', duration: 4, label: 'सांस अंदर लें 🌬️', color: 'from-cyan-500 to-teal-500' },
            { name: 'hold', duration: 4, label: 'सांस रोकें ⏸️', color: 'from-amber-500 to-orange-500' },
            { name: 'exhale', duration: 4, label: 'सांस बाहर छोड़ें 💨', color: 'from-indigo-500 to-blue-500' },
            { name: 'hold_empty', duration: 4, label: 'खाली फेफड़े रोकें 🧘', color: 'from-purple-500 to-pink-500' },
          ],
        },
        'anulom': {
          title: 'अनुलोम-विलोम (नाड़ीशोधन)',
          sub: 'दोनों फेफड़ों का संतुलित शुद्धिकरण',
          badge: 'योगिक श्वास',
          phases: [
            { name: 'inhale_left', duration: 4, label: 'बाएं नथुने से सांस लें 👈', color: 'from-emerald-500 to-teal-500' },
            { name: 'hold', duration: 4, label: 'दोनों नथुने बंद कर रोकें ⏸️', color: 'from-amber-500 to-orange-500' },
            { name: 'exhale_right', duration: 4, label: 'दाएं नथुने से बाहर छोड़ें 👉', color: 'from-blue-500 to-cyan-500' },
            { name: 'inhale_right', duration: 4, label: 'दाएं नथुने से सांस लें 👉', color: 'from-emerald-500 to-teal-500' },
            { name: 'hold_2', duration: 4, label: 'दोनों नथुने बंद कर रोकें ⏸️', color: 'from-amber-500 to-orange-500' },
            { name: 'exhale_left', duration: 4, label: 'बाएं नथुने से बाहर छोड़ें 👈', color: 'from-blue-500 to-cyan-500' },
          ],
        },
        'deep': {
          title: 'डीप लंग एक्सपेंशन (5-10-5)',
          sub: 'अधिकतम फेफड़ों की क्षमता व शक्ति',
          badge: 'उन्नत प्रशिक्षण',
          phases: [
            { name: 'inhale', duration: 5, label: 'फेफड़े भरकर सांस लें 🌬️', color: 'from-teal-500 to-emerald-500' },
            { name: 'hold', duration: 10, label: 'ऑक्सीजन रोकें (१० से.) ⏸️', color: 'from-amber-500 to-rose-500' },
            { name: 'exhale', duration: 5, label: 'धीरे-धीरे सांस खाली करें 💨', color: 'from-blue-500 to-indigo-500' },
          ],
        },
      };
    }
    if (l === 'en') {
      return {
        '478': {
          title: '4-7-8 Technique (Deep Lung Expansion)',
          sub: 'Oxygen expansion & mental calmness',
          badge: 'Dr. Weil Method',
          phases: [
            { name: 'inhale', duration: 4, label: 'Inhale deeply 🌬️', color: 'from-cyan-500 to-teal-500' },
            { name: 'hold', duration: 7, label: 'Hold your breath ⏸️', color: 'from-amber-500 to-orange-500' },
            { name: 'exhale', duration: 8, label: 'Exhale slowly 💨', color: 'from-indigo-500 to-blue-500' },
          ],
        },
        'box': {
          title: 'Box Breathing (Box 4-4-4-4)',
          sub: 'Activate & strengthen lung alveoli',
          badge: 'Samavritti Pranayama',
          phases: [
            { name: 'inhale', duration: 4, label: 'Inhale 🌬️', color: 'from-cyan-500 to-teal-500' },
            { name: 'hold', duration: 4, label: 'Hold breath ⏸️', color: 'from-amber-500 to-orange-500' },
            { name: 'exhale', duration: 4, label: 'Exhale 💨', color: 'from-indigo-500 to-blue-500' },
            { name: 'hold_empty', duration: 4, label: 'Hold lungs empty 🧘', color: 'from-purple-500 to-pink-500' },
          ],
        },
        'anulom': {
          title: 'Anulom Vilom (Nadi Shodhana)',
          sub: 'Balanced purification of both lungs',
          badge: 'Yogic Breath',
          phases: [
            { name: 'inhale_left', duration: 4, label: 'Inhale left nostril 👈', color: 'from-emerald-500 to-teal-500' },
            { name: 'hold', duration: 4, label: 'Hold both closed ⏸️', color: 'from-amber-500 to-orange-500' },
            { name: 'exhale_right', duration: 4, label: 'Exhale right nostril 👉', color: 'from-blue-500 to-cyan-500' },
            { name: 'inhale_right', duration: 4, label: 'Inhale right nostril 👉', color: 'from-emerald-500 to-teal-500' },
            { name: 'hold_2', duration: 4, label: 'Hold both closed ⏸️', color: 'from-amber-500 to-orange-500' },
            { name: 'exhale_left', duration: 4, label: 'Exhale left nostril 👈', color: 'from-blue-500 to-cyan-500' },
          ],
        },
        'deep': {
          title: 'Deep Lung Expansion (5-10-5)',
          sub: 'Maximum lung stamina & power',
          badge: 'Hard Training',
          phases: [
            { name: 'inhale', duration: 5, label: 'Fill lungs completely 🌬️', color: 'from-teal-500 to-emerald-500' },
            { name: 'hold', duration: 10, label: 'Hold oxygen (10s) ⏸️', color: 'from-amber-500 to-rose-500' },
            { name: 'exhale', duration: 5, label: 'Slowly empty lungs 💨', color: 'from-blue-500 to-indigo-500' },
          ],
        },
      };
    }
    return {
      '478': {
        title: '૪-૭-૮ પદ્ધતિ (4-7-8 Deep Lung Expansion)',
        sub: 'ઓક્સિજન વિસ્તરણ & માનસિક શાંતિ',
        badge: 'ડો. વેઇલ પદ્ધતિ',
        phases: [
          { name: 'inhale', duration: 4, label: 'ઊંડો શ્વાસ અંદર લો 🌬️', color: 'from-cyan-500 to-teal-500' },
          { name: 'hold', duration: 7, label: 'શ્વાસ રોકી રાખો ⏸️', color: 'from-amber-500 to-orange-500' },
          { name: 'exhale', duration: 8, label: 'ધીમેથી શ્વાસ બહાર કાઢો 💨', color: 'from-indigo-500 to-blue-500' },
        ],
      },
      'box': {
        title: 'બોક્સ બ્રિધિંગ (Box 4-4-4-4)',
        sub: 'ફેફસાંના વાયુકોષો સક્રિય & મજબૂત',
        badge: 'સમવૃત્તિ પ્રાણાયામ',
        phases: [
          { name: 'inhale', duration: 4, label: 'શ્વાસ અંદર લો 🌬️', color: 'from-cyan-500 to-teal-500' },
          { name: 'hold', duration: 4, label: 'શ્વાસ રોકી રાખો ⏸️', color: 'from-amber-500 to-orange-500' },
          { name: 'exhale', duration: 4, label: 'શ્વાસ બહાર કાઢો 💨', color: 'from-indigo-500 to-blue-500' },
          { name: 'hold_empty', duration: 4, label: 'ખાલી ફેફસાં રોકો 🧘', color: 'from-purple-500 to-pink-500' },
        ],
      },
      'anulom': {
        title: 'અનુલોમ-વિલોમ (નાડીશોધન)',
        sub: 'બંને ફેફસાંનું સંતુલિત શુદ્ધિકરણ',
        badge: 'યોગિક શ્વાસ',
        phases: [
          { name: 'inhale_left', duration: 4, label: 'ડાબા નસકોરેથી શ્વાસ લો 👈', color: 'from-emerald-500 to-teal-500' },
          { name: 'hold', duration: 4, label: 'બંને નસકોરાં બંધ કરી રોકો ⏸️', color: 'from-amber-500 to-orange-500' },
          { name: 'exhale_right', duration: 4, label: 'જમણા નસકોરેથી બહાર કાઢો 👉', color: 'from-blue-500 to-cyan-500' },
          { name: 'inhale_right', duration: 4, label: 'જમણા નસકોરેથી શ્વાસ લો 👉', color: 'from-emerald-500 to-teal-500' },
          { name: 'hold_2', duration: 4, label: 'બંને નસકોરાં બંધ કરી રોકો ⏸️', color: 'from-amber-500 to-orange-500' },
          { name: 'exhale_left', duration: 4, label: 'ડાબા નસકોરેથી બહાર કાઢો 👈', color: 'from-blue-500 to-cyan-500' },
        ],
      },
      'deep': {
        title: 'ડીપ લંગ એક્સ્પાન્શન (5-10-5)',
        sub: 'મહત્તમ ફેફસાં ક્ષમતા & પાવર',
        badge: 'હાર્ડ ટ્રેઇનિંગ',
        phases: [
          { name: 'inhale', duration: 5, label: 'ફેફસાં પૂરા ભરીને શ્વાસ લો 🌬️', color: 'from-teal-500 to-emerald-500' },
          { name: 'hold', duration: 10, label: 'ઓક્સિજન રોકી રાખો (૧૦ સે.) ⏸️', color: 'from-amber-500 to-rose-500' },
          { name: 'exhale', duration: 5, label: 'ધીમેથી પૂર્ણ શ્વાસ ખાલી કરો 💨', color: 'from-blue-500 to-indigo-500' },
        ],
      },
    };
  };

  const BREATH_MODES = getBreathModes(lang);

  const currentPattern = BREATH_MODES[breathMode] || BREATH_MODES['478'];
  const currentPhase = currentPattern.phases[breathPhaseIndex] || currentPattern.phases[0];

  const playSoftChime = (frequency = 520) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch {}
  };

  // Breathing Interval
  useEffect(() => {
    if (!isBreathingActive) return;

    const interval = setInterval(() => {
      setBreathSecondsLeft((prev) => {
        if (prev <= 1) {
          const nextIndex = (breathPhaseIndex + 1) % currentPattern.phases.length;
          setBreathPhaseIndex(nextIndex);
          if (nextIndex === 0) {
            setBreathRound((r) => r + 1);
          }
          const nextDuration = currentPattern.phases[nextIndex].duration;
          playSoftChime(nextIndex === 0 ? 587 : 440);
          return nextDuration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isBreathingActive, breathPhaseIndex, breathMode, currentPattern]);

  // Breath Hold Test Stopwatch
  useEffect(() => {
    if (!isTestActive) return;
    const timer = setInterval(() => {
      setTestTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isTestActive]);

  const handleStartBreath = () => {
    setIsBreathingActive(true);
    setBreathPhaseIndex(0);
    setBreathSecondsLeft(currentPattern.phases[0].duration);
    playSoftChime(587);
  };

  const handlePauseBreath = () => {
    setIsBreathingActive(false);
  };

  const handleResetBreath = () => {
    setIsBreathingActive(false);
    setBreathPhaseIndex(0);
    setBreathRound(1);
    setBreathSecondsLeft(currentPattern.phases[0].duration);
  };

  const handleStartLungTest = () => {
    setIsTestActive(true);
    setTestTime(0);
    setTestCompleted(false);
  };

  const handleStopLungTest = () => {
    setIsTestActive(false);
    setTestCompleted(true);
    if (testTime > bestTestTime) {
      setBestTestTime(testTime);
      try {
        localStorage.setItem('daily_note_lung_best', String(testTime));
      } catch {}
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    }
  };

  const getLungTestScore = (sec) => {
    if (sec < 20) {
      return {
        badge: lang === 'hi' ? 'सामान्य / सुधार आवश्यक' : lang === 'en' ? 'Needs Improvement' : 'સામાન્ય / સુધારો જરૂરી',
        badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
        desc: lang === 'hi'
          ? 'आपके फेफड़ों को अभ्यास की आवश्यकता है। प्रतिदिन 5 मिनट 4-7-8 या अनुलोम-विलोम प्राणायाम करें।'
          : lang === 'en'
          ? 'Your lungs need exercise. Practice 5 minutes of 4-7-8 or deep breathing daily.'
          : 'તમારા ફેફસાંને તાલીમની જરૂર છે. દરરોજ સવારે ૫ મિનિટ ૪-૭-૮ અથવા અનુલોમ-વિલોમ પ્રાણાયામ કરો.',
        icon: '⚠️',
      };
    } else if (sec < 40) {
      return {
        badge: lang === 'hi' ? 'औसत स्वस्थ फेफड़े' : lang === 'en' ? 'Healthy & Average' : 'સરેરાશ સ્વસ્થ ફેફસાં',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        desc: lang === 'hi'
          ? 'आपके फेफड़े अच्छे और सामान्य रूप से कार्य कर रहे हैं। नियमित वॉक और प्राणायाम जारी रखें।'
          : lang === 'en'
          ? 'Your lungs are in good healthy condition. Regular brisk walks and breathwork will keep them sharp.'
          : 'તમારા ફેફસાં સારા અને સામાન્ય કાર્યક્ષમ છે. નિયમિત વૉક અને પ્રાણાયામથી ક્ષમતા ૬૦ સેકન્ડ સુધી લઈ જઈ શકો છો.',
        icon: '👍',
      };
    } else if (sec < 60) {
      return {
        badge: lang === 'hi' ? 'बहुत मजबूत फेफड़े!' : lang === 'en' ? 'Very Strong Lungs!' : 'ખૂબ મજબૂત ફેફસાં!',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
        desc: lang === 'hi'
          ? 'वाह! आपके फेफड़ों की ऑक्सीजन क्षमता उत्कृष्ट है। श्वसन तंत्र बहुत मजबूत है।'
          : lang === 'en'
          ? 'Impressive! Your lungs have great oxygen holding capacity and stamina.'
          : 'વાહ! તમારા ફેફસાંની ઓક્સિજન ક્ષમતા ઉત્કૃષ્ટ છે. તમારા શ્વસનતંત્રની શક્તિ ઘણી ઊંચી છે.',
        icon: '💪',
      };
    } else {
      return {
        badge: lang === 'hi' ? 'अल्ट्रा-स्ट्रांग एथलीट स्तर! 🏆' : lang === 'en' ? 'Ultra Strong Athlete Level! 🏆' : 'અલ્ટ્રા-સ્ટ્રોંગ એથ્લેટ લેવલ! 🏆',
        badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
        desc: lang === 'hi'
          ? 'अद्भुत! 1 मिनट से अधिक सांस रोकना खिलाड़ियों (Athletes) जैसी मजबूत फेफड़ों की क्षमता दर्शाता है!'
          : lang === 'en'
          ? 'Outstanding! Holding breath over 60 seconds indicates elite athletic respiratory strength!'
          : 'અદ્ભુત! ૧ મિનિટથી વધુ શ્વાસ રોકવો એ રમતવીરો (Athletes) અને યોગી જેવી લોખંડી ફેફસાં ક્ષમતા દર્શાવે છે!',
        icon: '🌟',
      };
    }
  };

  // ----------------------------------------------------
  // 6. EYE EXERCISES & VISION CARE (આંખોની કસરત)
  // ----------------------------------------------------
  const [eyeMode, setEyeMode] = useState('circle'); // 'circle' | 'infinity' | 'focus' | 'blink' | 'palming' | 'full'
  const [isEyeActive, setIsEyeActive] = useState(false);
  const [eyeSecondsLeft, setEyeSecondsLeft] = useState(30);
  const [eyeAngle, setEyeAngle] = useState(0);
  const [eyeFocusPhase, setEyeFocusPhase] = useState('near'); // 'near' | 'far'
  const [blinkCount, setBlinkCount] = useState(0);
  const [eyeFullStepIndex, setEyeFullStepIndex] = useState(0);

  // 20-20-20 Rule Timer
  const [is20RuleActive, setIs20RuleActive] = useState(false);
  const [rule20SecondsLeft, setRule20SecondsLeft] = useState(1200); // 20 mins
  const [is20BreakTime, setIs20BreakTime] = useState(false);
  const [breakSecondsLeft, setBreakSecondsLeft] = useState(20);

  const eyeAnimRef = useRef(null);
  const eyeAngleRef = useRef(0);

  const FULL_ROUTINE_STEPS = [
    { mode: 'blink', nameGu: '૧. પલકારાથી આંખોમાં ભેજ લાવો', nameHi: '१. पलकें झपकाएं (नमी के लिए)', nameEn: '1. Rapid Blinking', duration: 20 },
    { mode: 'circle', nameGu: '૨. ગોળ આંખો ફેરવવી', nameHi: '२. गोलाकार आँखों का घुमाव', nameEn: '2. Circular Rolling', duration: 30 },
    { mode: 'infinity', nameGu: '૩. આઠડા આકારની ગતિ (∞)', nameHi: '३. आठ के आकार में गति (∞)', nameEn: '3. Infinity ∞ Tracking', duration: 30 },
    { mode: 'focus', nameGu: '૪. નજીક અને દૂર ફોકસ', nameHi: '४. पास और दूर फोकस', nameEn: '4. Near-Far Depth Focus', duration: 30 },
    { mode: 'palming', nameGu: '૫. પામિંગ & હૂંફાળો વિશ્રામ', nameHi: '५. पामिंग व आराम', nameEn: '5. Palming Relaxation', duration: 30 },
  ];

  const playEyeSound = (type = 'tick') => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (type === 'tick') {
        osc.frequency.setValueAtTime(540, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === 'bell') {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
      } else if (type === 'finish') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.12);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.24);
        gain.gain.setValueAtTime(0.14, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      }
    } catch {}
  };

  // Smooth 60fps tracking animation
  useEffect(() => {
    if (!isEyeActive) {
      if (eyeAnimRef.current) cancelAnimationFrame(eyeAnimRef.current);
      return;
    }

    const animate = () => {
      eyeAngleRef.current = (eyeAngleRef.current + 1.6) % 360;
      setEyeAngle(eyeAngleRef.current);
      eyeAnimRef.current = requestAnimationFrame(animate);
    };

    eyeAnimRef.current = requestAnimationFrame(animate);
    return () => {
      if (eyeAnimRef.current) cancelAnimationFrame(eyeAnimRef.current);
    };
  }, [isEyeActive]);

  // Eye Exercise Timer Interval
  useEffect(() => {
    if (!isEyeActive) return;

    const interval = setInterval(() => {
      setEyeSecondsLeft((prev) => {
        if (prev <= 1) {
          if (eyeMode === 'full') {
            if (eyeFullStepIndex < FULL_ROUTINE_STEPS.length - 1) {
              const nextStep = eyeFullStepIndex + 1;
              setEyeFullStepIndex(nextStep);
              playEyeSound('bell');
              return FULL_ROUTINE_STEPS[nextStep].duration;
            } else {
              setIsEyeActive(false);
              playEyeSound('finish');
              confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
              return 0;
            }
          } else {
            setIsEyeActive(false);
            playEyeSound('finish');
            confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
            return 30;
          }
        }

        const currentActiveMode = eyeMode === 'full' ? FULL_ROUTINE_STEPS[eyeFullStepIndex].mode : eyeMode;
        if (currentActiveMode === 'focus') {
          if (prev % 5 === 0) {
            setEyeFocusPhase((p) => (p === 'near' ? 'far' : 'near'));
            playEyeSound('tick');
          }
        } else if (currentActiveMode === 'blink') {
          if (prev % 2 === 0) {
            setBlinkCount((b) => b + 1);
            playEyeSound('tick');
          }
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isEyeActive, eyeMode, eyeFullStepIndex]);

  // 20-20-20 Rule Timer
  useEffect(() => {
    if (!is20RuleActive) return;

    const interval = setInterval(() => {
      if (is20BreakTime) {
        setBreakSecondsLeft((prev) => {
          if (prev <= 1) {
            setIs20BreakTime(false);
            setRule20SecondsLeft(1200);
            playEyeSound('finish');
            return 20;
          }
          return prev - 1;
        });
      } else {
        setRule20SecondsLeft((prev) => {
          if (prev <= 1) {
            setIs20BreakTime(true);
            setBreakSecondsLeft(20);
            playEyeSound('bell');
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [is20RuleActive, is20BreakTime]);

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-200">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-700 rounded-3xl p-5 text-white shadow-lg shadow-teal-600/15 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md">
              <HeartPulse size={26} className="text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{t('fitness_title', lang)}</h2>
              <p className="text-xs text-teal-100">{t('fitness_sub', lang)}</p>
            </div>
          </div>
        </div>

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-white/20 text-center">
          <div className="bg-white/10 rounded-xl p-2 backdrop-blur-xs">
            <span className="text-[10px] text-teal-200 block">👟 {t('steps_walked', lang)}</span>
            <span className="text-sm font-extrabold">{steps.toLocaleString()}</span>
          </div>
          <div className="bg-white/10 rounded-xl p-2 backdrop-blur-xs">
            <span className="text-[10px] text-teal-200 block">🔥 {t('calories_burned', lang)}</span>
            <span className="text-sm font-extrabold">{totalCalories} kcal</span>
          </div>
          <div className="bg-white/10 rounded-xl p-2 backdrop-blur-xs">
            <span className="text-[10px] text-teal-200 block">💓 {t('heart_rate', lang)}</span>
            <span className="text-sm font-extrabold">{fitness?.heartRate || liveBpm} BPM</span>
          </div>
          <div className="bg-white/10 rounded-xl p-2 backdrop-blur-xs">
            <span className="text-[10px] text-teal-200 block">💊 {t('tab_medicine', lang)}</span>
            <span className="text-sm font-extrabold">{takenCount}/{activeMeds.length}</span>
          </div>
        </div>
      </div>

      {/* Segmented Controller (Sub-tabs) - Clean, scrollable, single-icon pill design */}
      <div className="bg-slate-100/90 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar shadow-2xs">
        {[
          {
            id: 'fitness',
            label: lang === 'gu' ? 'સ્ટેપ્સ & જીમ' : lang === 'hi' ? 'स्टेप्स & जिम' : 'Steps & Gym',
            icon: Footprints,
            color: 'text-emerald-500',
          },
          {
            id: 'lungs',
            label: t('subtab_lungs', lang) || (lang === 'gu' ? 'ફેફસાં & કસરત' : lang === 'hi' ? 'फेफड़े और कसरत' : 'Lungs & Breath'),
            icon: Wind,
            color: 'text-cyan-500',
          },
          {
            id: 'eyes',
            label: t('subtab_eyes', lang) || (lang === 'gu' ? '👀 આંખોની કસરત' : '👀 Eye Workout'),
            icon: Eye,
            color: 'text-amber-500',
          },
          {
            id: 'water',
            label: lang === 'gu' ? 'પાણી ટ્રેકર' : lang === 'hi' ? 'पानी ट्रैकर' : 'Water Tracker',
            icon: Droplets,
            color: 'text-blue-500',
          },
          {
            id: 'medicines',
            label: lang === 'gu' ? 'દવાઓ' : lang === 'hi' ? 'दवाइयाँ' : 'Medicines',
            icon: Pill,
            color: 'text-rose-500',
          },
          {
            id: 'cardio',
            label: lang === 'gu' ? 'કાર્ડિયો & પલ્સ' : lang === 'hi' ? 'कार्डियो & पल्स' : 'Cardio & Pulse',
            icon: Activity,
            color: 'text-pink-500',
          },
          {
            id: 'bmi',
            label: lang === 'gu' ? 'BMI કેલ્ક્યુલેટર' : lang === 'hi' ? 'BMI कैलकुलेटर' : 'BMI Calc',
            icon: Scale,
            color: 'text-purple-500',
          },
        ].map((tab) => {
          const isActive = activeSubTab === tab.id;
          const IconComp = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 active:scale-95 cursor-pointer ${
                isActive
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30 ring-1 ring-teal-500'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200/70 dark:border-slate-700/70'
              }`}
            >
              <IconComp size={15} className={isActive ? 'text-white' : tab.color} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ==================================================== */}
      {/* 1. MEDICINES SUB-TAB CONTENT                         */}
      {/* ==================================================== */}
      {activeSubTab === 'medicines' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">{t('daily_medicine_plan', lang)}</h3>
              <p className="text-[11px] text-slate-500">
                {takenCount} / {activeMeds.length} {t('medicines_taken_summary', lang)} ({Math.round(activeMeds.length ? (takenCount / activeMeds.length) * 100 : 0)}%)
              </p>
            </div>
            <button
              onClick={handleOpenAddMed}
              className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs active:scale-95 transition"
            >
              <Plus size={14} />
              {t('new_medicine', lang)}
            </button>
          </div>

          {/* Time slot filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {currentMedicineSlots.map((slot) => {
              const Icon = slot.icon;
              const isSelected = selectedSlot === slot.id;
              return (
                <button
                  key={slot.id}
                  onClick={() => setSelectedSlot(slot.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    isSelected
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {Icon && <Icon size={13} />}
                  <span>{slot.label}</span>
                </button>
              );
            })}
          </div>

          {/* Medicine List */}
          <div className="space-y-2">
            {filteredMedicines.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-300 p-6">
                <Pill size={36} className="mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-semibold text-slate-600">{t('no_meds_in_slot', lang)}</p>
                <button
                  onClick={handleOpenAddMed}
                  className="mt-3 text-xs text-teal-600 font-bold hover:underline"
                >
                  {t('add_new_med', lang)}
                </button>
              </div>
            ) : (
              filteredMedicines.map((med) => {
                const isTaken = !!medicineLogs[todayStr]?.[med.id]?.taken;
                return (
                  <div
                    key={med.id}
                    className={`bg-white rounded-2xl p-3.5 border transition shadow-xs ${
                      isTaken ? 'border-teal-200 bg-teal-50/20' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div
                        onClick={() => onToggleMedicine(med.id)}
                        className="flex items-start gap-3 flex-1 cursor-pointer"
                      >
                        <div
                          className={`w-6 h-6 mt-0.5 rounded-lg flex items-center justify-center transition shrink-0 ${
                            isTaken
                              ? 'bg-teal-600 text-white'
                              : 'border-2 border-slate-300 text-transparent hover:border-teal-500'
                          }`}
                        >
                          <CheckCircle2 size={16} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4
                              className={`text-sm font-bold ${
                                isTaken ? 'line-through text-slate-400' : 'text-slate-800'
                              }`}
                            >
                              {med.name}
                            </h4>
                            <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-600">
                              {med.dosage}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-1">
                            <span className="flex items-center gap-1 font-semibold text-teal-700">
                              <Clock size={12} />
                              {med.time}
                            </span>
                            <span>•</span>
                            <span
                              className={`font-semibold px-2 py-0.5 rounded-md ${
                                med.mealRelation === 'before_food'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {med.mealRelation === 'before_food' ? t('before_food', lang) : t('after_food', lang)}
                            </span>
                          </div>

                          {med.notes && (
                            <p className="text-[11px] text-slate-500 mt-1 italic">
                              "{med.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        {onTriggerAlarm && (
                          <button
                            onClick={() =>
                              onTriggerAlarm({
                                title: `${t('tab_medicine', lang)}: ${med.name}`,
                                time: med.time,
                                type: 'medicine',
                                mealRelation: med.mealRelation,
                                dosage: med.dosage,
                              })
                            }
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-teal-600 transition"
                            title={t('test_alarm_ring', lang)}
                          >
                            <Volume2 size={15} />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenEditMed(med)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteMed(med.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 2. WATER TRACKER SUB-TAB CONTENT                     */}
      {/* ==================================================== */}
      {activeSubTab === 'water' && (
        <div className="space-y-4">
          {/* Main Hydration Progress Card */}
          <div className="bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50 dark:from-slate-900 dark:to-slate-900/95 rounded-3xl p-5 border border-cyan-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-cyan-600 text-white shadow-xs">
                  <Droplets size={22} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                    {lang === 'gu' ? 'પાણીનું ટ્રેકર (Water Tracker)' : lang === 'hi' ? 'पानी ट्रैकर' : 'Daily Water Tracker'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {lang === 'gu' ? 'દરરોજ પૂરતું પાણી પીઓ અને સ્વસ્થ રહો' : 'Stay fresh, hydrated and energetic everyday'}
                  </p>
                </div>
              </div>
              <span className="text-xs px-3 py-1 rounded-full font-bold bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                {waterPct}%
              </span>
            </div>

            {/* Big Water Stats Display */}
            <div className="bg-white dark:bg-slate-800/80 rounded-2xl p-4 text-center border border-cyan-100 dark:border-slate-700 shadow-xs space-y-1">
              <div className="flex items-baseline justify-center gap-1.5">
                <span className="text-4xl font-black text-cyan-700 dark:text-cyan-400">{glasses}</span>
                <span className="text-lg font-bold text-slate-400 dark:text-slate-500">/ {targetGlasses} {lang === 'gu' ? 'ગ્લાસ' : lang === 'hi' ? 'ग्लास' : 'Glasses'}</span>
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                💧 {(glasses * 250).toLocaleString()} ml / {(targetGlasses * 250).toLocaleString()} ml {lang === 'gu' ? 'લક્ષ્ય' : 'Target'}
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${waterPct}%` }}
                />
              </div>

              {/* Visual Glasses Display */}
              <div className="flex flex-wrap justify-center gap-2 pt-3 px-1">
                {Array.from({ length: targetGlasses }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => onUpdateWater?.({ ...water, glasses: i + 1 })}
                    className={`text-xl transition-all p-1 rounded-xl active:scale-90 ${
                      i < glasses
                        ? 'scale-110 drop-shadow bg-cyan-100/70 dark:bg-cyan-950/60'
                        : 'opacity-35 grayscale contrast-125 dark:opacity-45 hover:opacity-75'
                    }`}
                    title={`${i + 1} glass`}
                  >
                    🥛
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              <button
                onClick={handleMinusWater}
                disabled={glasses === 0}
                className="py-2.5 px-2 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-2xl font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition disabled:opacity-40"
              >
                <Minus size={14} />
                <span>-1 {lang === 'gu' ? 'ગ્લાસ' : 'Glass'}</span>
              </button>

              <button
                onClick={() => handleAddWater(1)}
                className="py-2.5 px-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition shadow-xs"
              >
                <Plus size={14} />
                <span>+1 {lang === 'gu' ? 'ગ્લાસ' : 'Glass'}</span>
              </button>

              <button
                onClick={() => handleAddWater(2)}
                className="py-2.5 px-2 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition shadow-xs"
              >
                <Plus size={14} />
                <span>+2 {lang === 'gu' ? 'ગ્લાસ' : 'Glasses'}</span>
              </button>

              <button
                onClick={() => handleAddWater(2)}
                className="py-2.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-1 active:scale-95 transition shadow-xs"
              >
                <span>🧴 500ml</span>
              </button>
            </div>
          </div>

          {/* Target Adjustment Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  🎯 {lang === 'gu' ? 'દૈનિક લક્ષ્ય સેટ કરો (Daily Goal)' : 'Set Daily Goal'}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {lang === 'gu' ? 'તમારા શરીર મુજબ યોગ્ય પાણીનું લક્ષ્ય પસંદ કરો' : 'Choose target according to your lifestyle'}
                </p>
              </div>
              <button
                onClick={handleResetWater}
                className="text-[11px] text-red-600 dark:text-rose-400 font-bold hover:underline"
              >
                {lang === 'gu' ? 'રીસેટ કરો' : 'Reset'}
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[6, 8, 10, 12].map((g) => (
                <button
                  key={g}
                  onClick={() => handleSetWaterTarget(g)}
                  className={`py-2 px-1 text-center rounded-xl font-bold text-xs border transition active:scale-95 ${
                    targetGlasses === g
                      ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs'
                      : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {g} {lang === 'gu' ? 'ગ્લાસ' : 'gl'} ({g * 250}ml)
                </button>
              ))}
            </div>
          </div>

          {/* Hydration Schedule Tips */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <span>⏰</span>
              <span>{lang === 'gu' ? 'પાણી પીવાનો શ્રેષ્ઠ સમય (Hydration Schedule)' : 'Best Times to Drink Water'}</span>
            </h4>
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 flex items-center gap-2">
                <span className="text-base">🌅</span>
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    {lang === 'gu' ? 'સવારે જાગીને: ૧-૨ ગ્લાસ' : 'Morning waking up: 1-2 glasses'}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {lang === 'gu' ? 'શરીરના અંગોને સક્રિય કરે છે અને પાચન સુધારે છે' : 'Activates internal organs & cleanses system'}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center gap-2">
                <span className="text-base">🥪</span>
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    {lang === 'gu' ? 'જમવાના ૩૦ મિનિટ પહેલા: ૧ ગ્લાસ' : '30 mins before meals: 1 glass'}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {lang === 'gu' ? 'પાચન ક્રિયા સરળ બને છે (જમતી વખતે વધુ પાણી ન પીવું)' : 'Aids digestion smoothly'}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-900 flex items-center gap-2">
                <span className="text-base">🚶</span>
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    {lang === 'gu' ? 'કસરત / ચાલ્યા પછી: ૧ ગ્લાસ' : 'After walk or exercise: 1 glass'}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {lang === 'gu' ? 'શરીરનું તાપમાન નિયંત્રિત કરે છે' : 'Replaces lost fluids'}
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 flex items-center gap-2">
                <span className="text-base">🌙</span>
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    {lang === 'gu' ? 'રાત્રે સૂતા પહેલા: ૧ ગ્લાસ' : 'Before bed: 1 glass'}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {lang === 'gu' ? 'હૃદય અને બ્લડ પ્રેશર માટે ગુણકારી' : 'Prevents dehydration overnight'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 3. FITNESS & STEPS SUB-TAB CONTENT                   */}
      {/* ==================================================== */}
      {activeSubTab === 'fitness' && (
        <div className="space-y-4">
          {/* Main Step Ring & Metrics Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300">
                  <Footprints size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{t('steps_today', lang)}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t('step_goal', lang)}: {stepTarget.toLocaleString()}
                  </p>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60">
                {stepProgress}% {t('completed', lang)}
              </span>
            </div>

            {/* Circular / Large Step Display */}
            <div className="bg-gradient-to-br from-slate-50 to-teal-50/40 dark:from-slate-800/80 dark:to-slate-800 rounded-2xl p-4 text-center border border-teal-100/60 dark:border-slate-700">
              <span className="text-4xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight block">
                {steps.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mt-0.5">
                {steps.toLocaleString()} / {stepTarget.toLocaleString()}
              </span>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-3 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stepProgress}%` }}
                />
              </div>

              {/* Sub metrics: Distance & Active Walking Calories */}
              <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-200/70 dark:border-slate-700/80 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📏</span>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{t('distance_walked', lang)}</span>
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{distanceKm} km</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔥</span>
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{t('walking_calories', lang)}</span>
                    <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{stepCalories} kcal</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Step Buttons */}
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">{t('quick_steps', lang)}</p>
              <div className="grid grid-cols-4 gap-2">
                {[250, 500, 1000, 2000].map((inc) => (
                  <button
                    key={inc}
                    onClick={() => handleAddSteps(inc)}
                    className="py-2 px-1 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-teal-300 text-xs font-bold text-slate-700 dark:text-slate-200 active:scale-95 transition"
                  >
                    +{inc}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Motion Sensor Control */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-teal-50/70 dark:bg-slate-800/90 border border-teal-200/80 dark:border-teal-800/60 shadow-xs">
              <div className="flex items-center gap-2.5">
                {isStepSensorActive ? (
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                ) : (
                  <span className="h-3 w-3 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                )}
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    {isStepSensorActive ? t('live_sensor_active', lang) : t('live_sensor_start', lang)}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    {isStepSensorActive
                      ? (lang === 'gu' ? 'ચાલતી વખતે સ્ટેપ્સ આપોઆપ ગણાય છે' : 'Steps are auto-counted as you walk')
                      : (lang === 'gu' ? 'સેન્સર શરૂ કરવા ક્લિક કરો' : 'Click to activate motion sensor')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onToggleStepSensor?.()}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition active:scale-95 ${
                  isStepSensorActive
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                    : 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs'
                }`}
              >
                {isStepSensorActive ? t('live_sensor_stop', lang) : t('live_sensor_start', lang)}
              </button>
            </div>
          </div>

          {/* 7-Day Walking Step History Bar Chart */}
          <div className="bg-white rounded-3xl p-4.5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-100 text-teal-700">
                  <BarChart3 size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    {lang === 'hi' ? 'साप्ताहिक वॉकिंग स्टेप ग्राफ (7 दिन)' : lang === 'en' ? 'Weekly Step Trend (7 Days)' : '૭-દિવસનો વોકિંગ સ્ટેપ ગ્રાફ'}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {lang === 'hi' ? 'दैनिक लक्ष्य' : lang === 'en' ? 'Daily Goal' : 'દૈનિક લક્ષ્ય'}: {stepTarget.toLocaleString()} {t('steps', lang)}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                {Math.round(steps).toLocaleString()} {t('steps_today', lang)}
              </span>
            </div>

            {/* 7 Vertical Step Columns */}
            <div className="grid grid-cols-7 gap-1.5 pt-4 pb-2 items-end h-36 border-b border-slate-100">
              {weeklySteps.map((d, idx) => {
                const heightPct = Math.min(100, Math.max(12, Math.round((d.steps / Math.max(stepTarget, 10000)) * 100)));
                const isTargetAchieved = d.steps >= stepTarget;
                return (
                  <div key={idx} className="flex flex-col items-center justify-end h-full gap-1">
                    <span className="text-[8px] font-bold text-slate-500 truncate">
                      {d.steps > 999 ? `${(d.steps / 1000).toFixed(1)}k` : d.steps}
                    </span>
                    <div
                      className={`w-full max-w-[24px] rounded-t-lg transition-all duration-500 ${
                        d.isToday
                          ? 'bg-gradient-to-t from-teal-600 to-emerald-400 shadow-xs ring-2 ring-teal-400/40'
                          : isTargetAchieved
                          ? 'bg-emerald-400'
                          : 'bg-teal-200'
                      }`}
                      style={{ height: `${heightPct}%` }}
                      title={`${d.day}: ${d.steps} steps`}
                    />
                    <span
                      className={`text-[10px] font-bold ${
                        d.isToday ? 'text-teal-800 font-extrabold' : 'text-slate-500'
                      }`}
                    >
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-teal-600" />
                <span>{lang === 'hi' ? 'आज' : lang === 'en' ? 'Today' : 'આજે'}</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
                <span>{lang === 'hi' ? 'लक्ष्य पूर्ण (8,000+)' : lang === 'en' ? 'Goal Met (8,000+)' : 'લક્ષ્ય પૂર્ણ (૮,૦૦૦+)'}</span>
              </span>
            </div>
          </div>

          {/* Total Burned Calories Banner */}
          <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-red-500 rounded-3xl p-4 text-white shadow-md flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Flame size={28} className="text-white animate-bounce" />
              </div>
              <div>
                <span className="text-xs text-orange-100 font-semibold">{t('calories_burned', lang)}</span>
                <h3 className="text-2xl font-black">{totalCalories} kcal</h3>
                <span className="text-[10px] text-orange-100">
                  ({t('steps_walked', lang)}: {stepCalories} + {t('gym_workouts', lang)}: {workoutCalories} kcal)
                </span>
              </div>
            </div>
            <span className="text-3xl">🏃‍♂️</span>
          </div>

          {/* Add Gym / Workout Logging Card */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                <Dumbbell size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">{t('gym_workouts', lang)}</h3>
                <p className="text-[11px] text-slate-500">{t('gym_workout_sub', lang)}</p>
              </div>
            </div>

            <form onSubmit={handleAddWorkout} className="space-y-3 pt-1">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">{t('exercise_type', lang)}</label>
                <select
                  value={selectedWorkoutType}
                  onChange={(e) => setSelectedWorkoutType(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                >
                  {currentWorkoutTypes.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.label} (~{Math.round(w.ratePerMin * 30)} kcal / 30m)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    {t('duration_mins', lang)}:
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    step="5"
                    value={workoutDuration}
                    onChange={(e) => setWorkoutDuration(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">{t('est_calories', lang)}</label>
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-extrabold text-amber-900 text-center">
                    ~{Math.round((workoutDuration || 0) * (currentWorkoutTypes.find((w) => w.id === selectedWorkoutType)?.ratePerMin || 5))} kcal
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs active:scale-95 transition flex items-center justify-center gap-1.5"
              >
                <Plus size={15} />
                {t('add_workout', lang)}
              </button>
            </form>

            {/* List of today's workouts */}
            {workouts.length > 0 && (
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  {t('todays_workout_log', lang)}
                </span>
                {workouts.map((w) => (
                  <div
                    key={w.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800 block">{w.name}</span>
                      <span className="text-[10px] text-slate-500">
                        {w.durationMinutes} {t('minutes', lang)} • {w.calories} kcal • {w.time}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteWorkout(w.id)}
                      className="p-1 text-slate-400 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 3. CARDIO & VITALS SUB-TAB CONTENT                   */}
      {/* ==================================================== */}
      {activeSubTab === 'cardio' && (
        <div className="space-y-4">
          {/* Interactive Tap-Tempo Pulse Reader */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-3 text-center">
            <div className="flex items-center justify-between text-left">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-red-100 text-red-600">
                  <Heart size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{t('pulse_tap_reader', lang)}</h3>
                  <p className="text-[11px] text-slate-500">{t('tap_pulse_hint', lang)}</p>
                </div>
              </div>
              <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg border border-red-200">
                Live
              </span>
            </div>

            {/* Pulse Tap Button & BPM Display */}
            <div className="py-4">
              <button
                type="button"
                onClick={handleTapPulse}
                className={`w-28 h-28 mx-auto rounded-full flex flex-col items-center justify-center transition-all transform active:scale-90 shadow-lg ${
                  isTapping
                    ? 'bg-red-600 text-white ring-8 ring-red-200 scale-105'
                    : 'bg-gradient-to-tr from-red-500 to-rose-400 text-white hover:scale-102'
                }`}
              >
                <Heart
                  size={38}
                  className={`fill-current ${isTapping ? 'animate-ping' : 'animate-pulse'}`}
                />
                <span className="text-[11px] font-bold mt-1 tracking-tight">{t('tap_tempo', lang)}</span>
              </button>

              <div className="mt-4">
                <span className="text-4xl font-extrabold text-slate-800">{liveBpm}</span>
                <span className="text-sm font-bold text-red-600 ml-1.5">BPM</span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {liveBpm < 60
                    ? (lang === 'gu' ? 'ધીમો ધબકારો (Bradycardia / Athletic)' : (lang === 'hi' ? 'धीमी धड़कन (Bradycardia)' : 'Resting / Athletic Rate'))
                    : liveBpm <= 80
                    ? (lang === 'gu' ? 'આરામદાયક સામાન્ય દર (Normal Resting Rate)' : (lang === 'hi' ? 'सामान्य आराम दर (Normal)' : 'Normal Resting Rate'))
                    : liveBpm <= 120
                    ? (lang === 'gu' ? 'ફેટ બર્ન / સામાન્ય કસરત દર (Fat Burn Zone)' : (lang === 'hi' ? 'फैट बर्न दर' : 'Fat Burn Zone'))
                    : (lang === 'gu' ? 'કાર્ડિયો ફિટનેસ દર (Cardio Fitness Zone)' : (lang === 'hi' ? 'कार्डियो दर' : 'Cardio Fitness Zone'))}
                </p>
              </div>

              <button
                onClick={handleSaveBpm}
                className="mt-3 px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs active:scale-95 transition"
              >
                {t('save_bpm_log', lang)}
              </button>
            </div>
          </div>

          {/* Blood Pressure (BP) & Blood Sugar Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                  <Activity size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{t('bp_sugar_card', lang)}</h3>
                  <p className="text-[11px] text-slate-500">{t('daily_vitals_sub', lang)}</p>
                </div>
              </div>
            </div>

            {/* BP Inputs */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">{t('blood_pressure', lang)}:</label>
                {(() => {
                  const cat = getBpCategory(Number(bpSystolic), Number(bpDiastolic));
                  return (
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold border ${cat.color}`}>
                      {cat.label}
                    </span>
                  );
                })()}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 block mb-0.5">{t('systolic', lang)}</span>
                  <input
                    type="number"
                    value={bpSystolic}
                    onChange={(e) => setBpSystolic(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block mb-0.5">{t('diastolic', lang)}</span>
                  <input
                    type="number"
                    value={bpDiastolic}
                    onChange={(e) => setBpDiastolic(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Blood Sugar Inputs */}
            <div className="pt-2 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-700 block mb-1.5">{t('blood_sugar', lang)}:</label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 block mb-0.5">{t('fasting_sugar', lang)}</span>
                  <input
                    type="number"
                    value={sugarFasting}
                    onChange={(e) => setSugarFasting(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block mb-0.5">{t('post_meal_sugar', lang)}</span>
                  <input
                    type="number"
                    value={sugarPostMeal}
                    onChange={(e) => setSugarPostMeal(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Sleep Hours */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">{t('sleep_hours', lang)}:</label>
                <span className="text-xs font-bold text-indigo-700">{sleepHours} {t('hours', lang)}</span>
              </div>
              <input
                type="range"
                min="4"
                max="12"
                step="0.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
                className="w-full accent-indigo-600"
              />
              <p className="text-[10px] text-slate-500 mt-1">{t('sleep_health_tip', lang)}</p>
            </div>

            <button
              onClick={handleSaveVitals}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs active:scale-95 transition"
            >
              {t('save_vitals', lang)}
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 5. LUNGS & BREATHING SUB-TAB CONTENT                 */}
      {/* ==================================================== */}
      {activeSubTab === 'lungs' && (
        <div className="space-y-4">
          {/* Main Breathing Trainer Card */}
          <div className="bg-gradient-to-br from-cyan-900 via-teal-900 to-slate-900 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden border border-teal-500/20">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-cyan-500/20 backdrop-blur-md text-cyan-300">
                  <Wind size={22} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold flex items-center gap-1.5">
                    <span>ફેફસાં વિસ્તરણ & પ્રાણાયામ</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 font-semibold border border-cyan-400/30">
                      {currentPattern.badge}
                    </span>
                  </h3>
                  <p className="text-xs text-cyan-200/80">{currentPattern.sub}</p>
                </div>
              </div>
              {isBreathingActive && (
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-teal-500/30 text-teal-200 border border-teal-400/30 animate-pulse">
                  રાઉન્ડ {breathRound}
                </span>
              )}
            </div>

            {/* Pattern Mode Selector Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-5">
              {[
                { id: '478', label: '૪-૭-૮ પદ્ધતિ', icon: '🌬️' },
                { id: 'box', label: 'બોક્સ ૪-૪-૪-૪', icon: '📦' },
                { id: 'anulom', label: 'અનુલોમ-વિલોમ', icon: '🧘' },
                { id: 'deep', label: 'ડીપ લંગ (૫-૧૦-૫)', icon: '💪' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setBreathMode(m.id);
                    setIsBreathingActive(false);
                    setBreathPhaseIndex(0);
                    setBreathRound(1);
                    setBreathSecondsLeft(BREATH_MODES[m.id].phases[0].duration);
                  }}
                  className={`py-2 px-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border active:scale-95 cursor-pointer ${
                    breathMode === m.id
                      ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white border-cyan-400 shadow-md shadow-cyan-500/25'
                      : 'bg-white/10 text-cyan-100 hover:bg-white/15 border-white/10'
                  }`}
                >
                  <span>{m.icon}</span>
                  <span>{m.label}</span>
                </button>
              ))}
            </div>

            {/* Visual Breathing Circle & Live Countdown */}
            <div className="py-6 flex flex-col items-center justify-center relative">
              {/* Outer Pulsing Glow */}
              <div
                className={`w-52 h-52 rounded-full flex flex-col items-center justify-center transition-all duration-700 relative shadow-2xl ${
                  isBreathingActive
                    ? currentPhase.name === 'inhale' || currentPhase.name.startsWith('inhale')
                      ? 'scale-115 ring-8 ring-cyan-400/40 bg-gradient-to-tr from-cyan-600/90 to-teal-500/90 shadow-cyan-500/50'
                      : currentPhase.name === 'hold' || currentPhase.name.startsWith('hold')
                      ? 'scale-115 ring-10 ring-amber-400/50 bg-gradient-to-tr from-amber-600/90 to-orange-500/90 shadow-orange-500/50 animate-pulse'
                      : 'scale-90 ring-4 ring-blue-400/30 bg-gradient-to-tr from-blue-700/80 to-indigo-600/80 shadow-blue-500/40'
                    : 'bg-gradient-to-tr from-slate-800 to-slate-700 ring-4 ring-white/10'
                }`}
              >
                {/* Countdown & Phase Indicator */}
                <div className="text-center z-10 space-y-1">
                  <span className="text-5xl font-black tracking-tight text-white drop-shadow-md">
                    {isBreathingActive ? breathSecondsLeft : '૪'}
                  </span>
                  <span className="text-xs font-extrabold uppercase tracking-widest block text-white/90">
                    {lang === 'hi' ? 'सेकंड' : lang === 'en' ? 'seconds' : 'સેકન્ડ'}
                  </span>
                  <div className="mt-1 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md text-[11px] font-bold text-white shadow-xs">
                    {isBreathingActive ? currentPhase.label : (lang === 'hi' ? 'तैयार हो जाएं' : lang === 'en' ? 'Get Ready' : 'તૈયાર થાઓ')}
                  </div>
                </div>
              </div>

              <p className="text-xs text-cyan-200 mt-5 font-medium text-center max-w-xs">
                {isBreathingActive
                  ? currentPhase.name === 'inhale' || currentPhase.name.startsWith('inhale')
                    ? (lang === 'hi' ? 'नाक से धीरे-धीरे पूरे फेफड़े भरकर गहरी सांस अंदर लें...' : lang === 'en' ? 'Inhale deeply through your nose, filling lungs completely...' : 'નાક વાટે ધીમે-ધીમે પૂરા ફેફસાં ભરીને ઊંડો શ્વાસ અંદર ખેંચો...')
                    : currentPhase.name === 'hold' || currentPhase.name.startsWith('hold')
                    ? (lang === 'hi' ? 'फेफड़ों में भरी ऑक्सीजन को शांत भाव से रोक कर रखें...' : lang === 'en' ? 'Hold the oxygen gently inside your lungs...' : 'ફેફસાંમાં ભરેલો ઓક્સિજન સ્થિર રોકી રાખો...')
                    : (lang === 'hi' ? 'मुंह या नाक से धीरे-धीरे पूरी सांस बाहर छोड़ें...' : lang === 'en' ? 'Exhale slowly and completely through mouth or nose...' : 'મોં અથવા નાક વાટે ધીમેથી સંપૂર્ણ શ્વાસ બહાર કાઢો...')
                  : (lang === 'hi' ? 'रीढ़ सीधी रखकर बैठें और अभ्यास शुरू करने के लिए नीचे बटन दबाएं।' : lang === 'en' ? 'Sit upright with relaxed shoulders and tap the button below.' : 'બેસો, કરોડરજ્જુ સીધી રાખો અને કસરત શરૂ કરવા નીચે બટન દબાવો.')}
              </p>
            </div>

            {/* Breathing Control Buttons */}
            <div className="flex gap-2.5 pt-2">
              {!isBreathingActive ? (
                <button
                  type="button"
                  onClick={handleStartBreath}
                  className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white font-extrabold text-xs shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 active:scale-98 transition cursor-pointer"
                >
                  <Play size={16} fill="white" />
                  <span>{lang === 'hi' ? 'प्राणायाम शुरू करें (Start Breathing)' : lang === 'en' ? 'Start Breathing Exercise' : 'પ્રાણાયામ શરૂ કરો (Start Breathing)'}</span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handlePauseBreath}
                    className="flex-1 py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 active:scale-98 transition cursor-pointer"
                  >
                    <Pause size={16} fill="white" />
                    <span>{lang === 'hi' ? 'रोकें (Pause)' : lang === 'en' ? 'Pause' : 'થોભો (Pause)'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleResetBreath}
                    className="py-3 px-4 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-98 transition cursor-pointer"
                  >
                    <RotateCcw size={16} />
                    <span>{lang === 'hi' ? 'रीसेट' : lang === 'en' ? 'Reset' : 'રીસેટ'}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Lung Capacity Breath-Hold Test Stopwatch Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    {lang === 'hi' ? 'फेफड़ों की क्षमता टेस्ट (Lung Breath-Hold Test)' : lang === 'en' ? 'Lung Capacity Breath-Hold Test' : 'ફેફસાંની ક્ષમતા ટેસ્ટ (Lung Breath-Hold Test)'}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {lang === 'hi' ? 'मापें कि आप कितनी सेकंड सांस रोक सकते हैं' : lang === 'en' ? 'Measure how many seconds you can hold your breath' : 'તમે કેટલી સેકન્ડ શ્વાસ રોકી શકો છો તે માપો'}
                  </p>
                </div>
              </div>

              {bestTestTime > 0 && (
                <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded-xl text-amber-700 dark:text-amber-300 text-xs font-bold">
                  <Award size={14} />
                  <span>{lang === 'hi' ? 'सर्वश्रेष्ठ: ' : lang === 'en' ? 'Best: ' : 'શ્રેષ્ઠ: '}{bestTestTime}s</span>
                </div>
              )}
            </div>

            {/* Live Stopwatch Display */}
            <div className="text-center py-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <span className="text-4xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
                {String(Math.floor(testTime / 60)).padStart(2, '0')}:{String(testTime % 60).padStart(2, '0')}
              </span>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {isTestActive
                  ? (lang === 'hi' ? '🌬️ सांस रोक कर रखें... समय गिना जा रहा है' : lang === 'en' ? '🌬️ Hold breath... timer is running' : '🌬️ શ્વાસ રોકી રાખો... તમારો સમય ગણાઈ રહ્યો છે')
                  : (lang === 'hi' ? 'गहरी सांस भरकर शुरू करें' : lang === 'en' ? 'Take a deep breath and start' : 'ઊંડો શ્વાસ ભરીને શરૂ કરો')}
              </p>
            </div>

            {/* Test Action Buttons */}
            <div>
              {!isTestActive ? (
                <button
                  type="button"
                  onClick={handleStartLungTest}
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md shadow-indigo-600/25 flex items-center justify-center gap-2 active:scale-98 transition cursor-pointer"
                >
                  <Play size={16} fill="white" />
                  <span>{lang === 'hi' ? 'गहरी सांस लेकर टेस्ट शुरू करें' : lang === 'en' ? 'Inhale Deeply & Start Test' : 'ઊંડો શ્વાસ લઈ ટેસ્ટ શરૂ કરો'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStopLungTest}
                  className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-600/30 flex items-center justify-center gap-2 animate-pulse active:scale-98 transition cursor-pointer"
                >
                  <Pause size={16} fill="white" />
                  <span>{lang === 'hi' ? 'अब सांस बाहर छोड़ें (टेस्ट पूरा करें)' : lang === 'en' ? 'Exhale Now (Finish Test)' : 'હવે શ્વાસ બહાર કાઢો (ટેસ્ટ પૂર્ણ કરો)'}</span>
                </button>
              )}
            </div>

            {/* Test Evaluation Result Card */}
            {testCompleted && (
              <div className="animate-in fade-in space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                {(() => {
                  const score = getLungTestScore(testTime);
                  return (
                    <div className="bg-gradient-to-br from-slate-50 to-indigo-50/50 dark:from-slate-800 dark:to-slate-800/80 p-4 rounded-2xl border border-indigo-200/60 dark:border-slate-700 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          {lang === 'hi' ? 'आपका स्कोर: ' : lang === 'en' ? 'Your Score: ' : 'તમારો સ્કોર: '}
                          <strong>{testTime} {lang === 'hi' ? 'सेकंड' : lang === 'en' ? 'seconds' : 'સેકન્ડ'}</strong>
                        </span>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${score.badgeColor}`}>
                          {score.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                        {score.desc}
                      </p>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* 4 Golden Lung Health Ayurvedic Tips */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🌿</span>
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                  {lang === 'hi' ? 'फेफड़े मजबूत रखने के 4 उत्तम आयुर्वेदिक उपाय' : lang === 'en' ? '4 Golden Ayurvedic Tips for Stronger Lungs' : 'ફેફસાં મજબૂત રાખવાના ૪ ઉત્તમ આયુર્વેદિક ઉપાયો'}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {lang === 'hi' ? 'दैनिक जीवन में इन नियमों का पालन करने से फेફસાં स्वस्थ रहते हैं' : lang === 'en' ? 'Simple daily habits to keep your respiratory health optimal' : 'રોજિંદા જીવનમાં આ નિયમો પાળવાથી ફેફસાં સ્વસ્થ રહે છે'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {[
                {
                  icon: '☕',
                  title: lang === 'hi' ? 'तुलसी और अदरक का काढ़ा' : lang === 'en' ? 'Tulsi & Ginger Decoction' : 'તુલસી & આદુનો ઉકાળો',
                  desc: lang === 'hi'
                    ? 'तुलसी, अदरक और काली मिर्च का काढ़ा पीने से कफ दूर होता है और श्वासनलियां साफ रहती हैं।'
                    : lang === 'en'
                    ? 'Drinking tulsi, ginger and pepper brew expels mucus and clears the respiratory airways.'
                    : 'તુલસી, આદુ અને કાળા મરીનો ઉકાળો પીવાથી ફેફસાંમાંથી કફ નીકળી જાય છે અને શ્વાસનળીઓ સાફ રહે છે.',
                  bg: 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-800/60',
                },
                {
                  icon: '💨',
                  title: lang === 'hi' ? 'गर्म पानी की भाप (Steam)' : lang === 'en' ? 'Warm Steam Inhalation' : 'ગરમ પાણીની વરાળ (Steam)',
                  desc: lang === 'hi'
                    ? 'सप्ताह में 2-3 बार अजवाइन या पुदीना डालकर भाप लेने से फेफड़ों के वायुकोष तुरंत खुल जाते हैं।'
                    : lang === 'en'
                    ? 'Taking steam with carom seeds or mint 2-3 times a week opens congested lung air sacs.'
                    : 'અઠવાડિયામાં ૨-૩ વાર અજમો કે ફુદીનો નાખીને વરાળ લેવાથી ફેફસાંના વાયુકોષો તરત ખૂલી જાય છે.',
                  bg: 'bg-cyan-50/80 dark:bg-cyan-950/30 border-cyan-200/80 dark:border-cyan-800/60',
                },
                {
                  icon: '🌅',
                  title: lang === 'hi' ? 'सुबह ताजी हवा में वॉक' : lang === 'en' ? 'Morning Fresh Air Walk' : 'વહેલી સવારે તાજી હવામાં વૉક',
                  desc: lang === 'hi'
                    ? 'सूर्योदय के समय पेड़ों के बीच 15 मिनट गहरी सांस के साथ टहलने से फेफड़ों को शुद्ध ऑक्सीजन मिलती है।'
                    : lang === 'en'
                    ? 'Walking 15 minutes during sunrise amidst greenery supplies abundant pure oxygen to lungs.'
                    : 'સૂર્યોદય સમયે ઝાડ-પાન વચ્ચે ૧૫ મિનિટ ઊંડા શ્વાસ સાથે ચાલવાથી ફેફસાંને શુદ્ધ ઓક્સિજન મળે છે.',
                  bg: 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-800/60',
                },
                {
                  icon: '🥛',
                  title: lang === 'hi' ? 'हल्दी वाला गुनगुना दूध' : lang === 'en' ? 'Warm Turmeric Milk' : 'હળદરવાળું નવશેકું દૂધ',
                  desc: lang === 'hi'
                    ? 'रात को हल्दी और सोंठ वाला दूध पीने से फेफड़ों का संक्रमण रुकता है और रोग प्रतिरोधक क्षमता बढ़ती है।'
                    : lang === 'en'
                    ? 'Warm milk with turmeric and dry ginger at bedtime prevents infections and strengthens immunity.'
                    : 'રાત્રે હળદર અને સહેજ સૂંઠ વાળું દૂધ પીવાથી ફેફસાંનું ઇન્ફેક્શન અટકે છે અને રોગપ્રતિકારક શક્તિ વધે છે.',
                  bg: 'bg-purple-50/80 dark:bg-purple-950/30 border-purple-200/80 dark:border-purple-800/60',
                },
              ].map((tip, idx) => (
                <div key={idx} className={`p-3 rounded-2xl border ${tip.bg} space-y-1`}>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-slate-800 dark:text-slate-100">
                    <span className="text-base">{tip.icon}</span>
                    <span>{tip.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                    {tip.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 6. EYE EXERCISES & VISION CARE SUB-TAB CONTENT       */}
      {/* ==================================================== */}
      {activeSubTab === 'eyes' && (
        <div className="space-y-4">
          {/* Main Eye Workout Trainer Card */}
          <div className="bg-gradient-to-br from-amber-950 via-slate-900 to-indigo-950 rounded-3xl p-5 text-white shadow-xl relative overflow-hidden border border-amber-500/25">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-amber-500/20 backdrop-blur-md text-amber-300">
                  <Eye size={22} className="animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-bold flex items-center gap-1.5">
                    <span>{lang === 'hi' ? 'नेत्र योग व दृष्टि सुधार' : lang === 'en' ? 'Eye Yoga & Vision Care' : 'નેત્ર યોગ & દ્રષ્ટિ સુધાર કસરત'}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-semibold border border-amber-400/30">
                      PRO VISION
                    </span>
                  </h3>
                  <p className="text-xs text-amber-200/80">
                    {lang === 'hi' ? 'स्क्रीन की थकान दूर करें और आँखों की रोशनी बढ़ाएं' : lang === 'en' ? 'Relieve eye strain & strengthen optic muscles' : 'મોબાઈલ સ્ક્રીનનો થાક દૂર કરો અને આંખોનું તેજ વધારો'}
                  </p>
                </div>
              </div>
              {isEyeActive && (
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/30 animate-pulse">
                  {eyeMode === 'full' ? `${lang === 'hi' ? 'स्टेप' : lang === 'en' ? 'Step' : 'સ્ટેપ'} ${eyeFullStepIndex + 1}/5` : (lang === 'hi' ? 'लाइव कसरत' : lang === 'en' ? 'Live Exercise' : 'લાઇવ કસરત')}
                </span>
              )}
            </div>

            {/* Exercise Mode Selector Tabs */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mb-5">
              {[
                { id: 'full', label: lang === 'gu' ? '૨-મિનિટ ફુલ' : lang === 'hi' ? '२-मिनट फुल' : '2-Min Routine', icon: '⭐' },
                { id: 'circle', label: lang === 'gu' ? 'ગોળ આંખો' : lang === 'hi' ? 'गोलाकार' : 'Circles', icon: '🔄' },
                { id: 'infinity', label: lang === 'gu' ? 'આઠડો (∞)' : lang === 'hi' ? 'आठ (∞)' : 'Figure 8', icon: '♾️' },
                { id: 'focus', label: lang === 'gu' ? 'ફોકસ ટ્રેનિંગ' : lang === 'hi' ? 'फोकस' : 'Focus', icon: '🎯' },
                { id: 'blink', label: lang === 'gu' ? 'પલકારો' : lang === 'hi' ? 'पलकें' : 'Blink', icon: '👁️' },
                { id: 'palming', label: lang === 'gu' ? 'પામિંગ આરામ' : lang === 'hi' ? 'पामिंग' : 'Palming', icon: '🤲' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setEyeMode(m.id);
                    setIsEyeActive(false);
                    setEyeSecondsLeft(m.id === 'full' ? FULL_ROUTINE_STEPS[0].duration : 30);
                    setEyeFullStepIndex(0);
                    setBlinkCount(0);
                  }}
                  className={`py-2 px-1.5 rounded-xl text-xs font-bold transition flex flex-col items-center justify-center gap-0.5 border active:scale-95 cursor-pointer ${
                    eyeMode === m.id
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black border-amber-400 shadow-md shadow-amber-500/25'
                      : 'bg-white/10 text-amber-100 hover:bg-white/15 border-white/10'
                  }`}
                >
                  <span className="text-sm">{m.icon}</span>
                  <span className="text-[10px] truncate max-w-full">{m.label}</span>
                </button>
              ))}
            </div>

            {/* Interactive Visual Eye Arena */}
            <div className="py-4 flex flex-col items-center justify-center relative min-h-[260px] bg-black/40 rounded-2xl border border-white/10 overflow-hidden">
              {/* Full Routine Step Indicator Banner */}
              {eyeMode === 'full' && (
                <div className="absolute top-2.5 inset-x-4 flex items-center justify-between text-xs z-20">
                  <span className="bg-amber-400 text-slate-950 font-black px-2.5 py-0.5 rounded-full text-[10px]">
                    {lang === 'hi' ? FULL_ROUTINE_STEPS[eyeFullStepIndex].nameHi : lang === 'en' ? FULL_ROUTINE_STEPS[eyeFullStepIndex].nameEn : FULL_ROUTINE_STEPS[eyeFullStepIndex].nameGu}
                  </span>
                  <span className="text-amber-300 font-mono font-bold text-[11px]">
                    {eyeSecondsLeft}s {lang === 'hi' ? 'शेष' : lang === 'en' ? 'left' : 'બાકી'}
                  </span>
                </div>
              )}

              {/* VISUAL 1: Circular Eye Rolling */}
              {(eyeMode === 'circle' || (eyeMode === 'full' && FULL_ROUTINE_STEPS[eyeFullStepIndex].mode === 'circle')) && (
                <div className="relative flex flex-col items-center justify-center">
                  <svg className="w-56 h-56" viewBox="0 0 200 200">
                    <circle cx="100" cy="100" r="75" fill="none" stroke="rgba(245, 158, 11, 0.25)" strokeWidth="3" strokeDasharray="6 6" />
                    {/* Orbiting glowing target */}
                    <circle
                      cx={100 + 75 * Math.cos((eyeAngle * Math.PI) / 180)}
                      cy={100 + 75 * Math.sin((eyeAngle * Math.PI) / 180)}
                      r="13"
                      fill="#f59e0b"
                      className="drop-shadow-[0_0_12px_rgba(245,158,11,0.9)]"
                    />
                    <circle
                      cx={100 + 75 * Math.cos((eyeAngle * Math.PI) / 180)}
                      cy={100 + 75 * Math.sin((eyeAngle * Math.PI) / 180)}
                      r="5"
                      fill="#ffffff"
                    />
                    {/* Center focal dot */}
                    <circle cx="100" cy="100" r="4" fill="rgba(255,255,255,0.4)" />
                  </svg>
                  <p className="text-xs text-amber-200 mt-2 font-bold text-center">
                    {lang === 'hi' ? '👀 सिर हिलाए बिना पीले गोले को घुमाते हुए देखें' : lang === 'en' ? 'Keep head still, trace the orb with eyes' : '👀 માથું હલાવ્યા વિના પીળા ગોળાને ગોળ-ગોળ અનુસરો'}
                  </p>
                </div>
              )}

              {/* VISUAL 2: Figure 8 / Infinity ∞ Tracking */}
              {(eyeMode === 'infinity' || (eyeMode === 'full' && FULL_ROUTINE_STEPS[eyeFullStepIndex].mode === 'infinity')) && (
                <div className="relative flex flex-col items-center justify-center">
                  <svg className="w-64 h-48" viewBox="0 0 200 200">
                    <path
                      d="M 100,100 C 60,60 25,75 25,100 C 25,125 60,140 100,100 C 140,60 175,75 175,100 C 175,125 140,140 100,100 Z"
                      fill="none"
                      stroke="rgba(245, 158, 11, 0.25)"
                      strokeWidth="3"
                      strokeDasharray="6 6"
                    />
                    {/* Moving Lissajous Infinity Target */}
                    <circle
                      cx={100 + 70 * Math.sin((eyeAngle * Math.PI) / 180)}
                      cy={100 + 38 * Math.sin((2 * eyeAngle * Math.PI) / 180)}
                      r="13"
                      fill="#f59e0b"
                      className="drop-shadow-[0_0_14px_rgba(245,158,11,0.95)]"
                    />
                    <circle
                      cx={100 + 70 * Math.sin((eyeAngle * Math.PI) / 180)}
                      cy={100 + 38 * Math.sin((2 * eyeAngle * Math.PI) / 180)}
                      r="5"
                      fill="#ffffff"
                    />
                  </svg>
                  <p className="text-xs text-amber-200 mt-2 font-bold text-center">
                    {lang === 'hi' ? '♾️ आठ (∞) के आकार में घूमते गोले को ध्यान से देखें' : lang === 'en' ? 'Trace the figure-8 infinity loop with your eyes' : '♾️ આઠડા (∞) આકારમાં ફરતા ગોળાને એકાગ્રતાથી જુઓ'}
                  </p>
                </div>
              )}

              {/* VISUAL 3: Near & Far Focus */}
              {(eyeMode === 'focus' || (eyeMode === 'full' && FULL_ROUTINE_STEPS[eyeFullStepIndex].mode === 'focus')) && (
                <div className="relative flex flex-col items-center justify-center h-48">
                  <div
                    className={`rounded-full flex items-center justify-center transition-all duration-700 shadow-2xl ${
                      eyeFocusPhase === 'near'
                        ? 'w-40 h-40 bg-gradient-to-tr from-amber-500 to-yellow-300 ring-8 ring-amber-400/40 scale-105'
                        : 'w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-600 ring-4 ring-blue-400/30 scale-80'
                    }`}
                  >
                    <span className="text-3xl">{eyeFocusPhase === 'near' ? '🔍' : '🏔️'}</span>
                  </div>
                  <div className="mt-4 text-center">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-white/20 text-amber-300 shadow-xs">
                      {eyeFocusPhase === 'near'
                        ? (lang === 'hi' ? '👇 १. स्क्रीन पर पास फोकस करें' : lang === 'en' ? 'Focus Near on Screen' : '👇 ૧. સ્ક્રીન પર નજીક ફોકસ કરો')
                        : (lang === 'hi' ? '🌲 २. स्क्रीन से दूर अनन्त में देखें' : lang === 'en' ? 'Look into Far Distance' : '🌲 ૨. સ્ક્રીનથી દૂર અનંત અંતરે જુઓ')}
                    </span>
                  </div>
                </div>
              )}

              {/* VISUAL 4: Rapid Blinking (Blink Pacer) */}
              {(eyeMode === 'blink' || (eyeMode === 'full' && FULL_ROUTINE_STEPS[eyeFullStepIndex].mode === 'blink')) && (
                <div className="flex flex-col items-center justify-center h-48 space-y-3">
                  <div className="w-28 h-28 rounded-full bg-amber-400/20 border-2 border-amber-400/50 flex items-center justify-center text-5xl shadow-lg animate-pulse">
                    {eyeSecondsLeft % 2 === 0 ? '👁️' : '😌'}
                  </div>
                  <div className="text-center">
                    <p className="text-xs font-bold text-amber-200">
                      {lang === 'hi' ? '💧 बीप की ताल पर तेजी से पलकें झपकाएं' : lang === 'en' ? 'Blink rhythmically to moisturize dry eyes' : '💧 બીપના તાલે ઝડપથી આંખો પલકાવો (કુદરતી ભેજ)'}
                    </p>
                    <span className="text-[11px] font-mono text-amber-400 mt-0.5 block font-bold">
                      {lang === 'hi' ? 'पलकें गिनती' : lang === 'en' ? 'Blink Count' : 'પલકારા ગણતરી'}: {blinkCount} {lang === 'hi' ? 'बार' : lang === 'en' ? 'times' : 'વખત'}
                    </span>
                  </div>
                </div>
              )}

              {/* VISUAL 5: Palming Relaxation */}
              {(eyeMode === 'palming' || (eyeMode === 'full' && FULL_ROUTINE_STEPS[eyeFullStepIndex].mode === 'palming')) && (
                <div className="flex flex-col items-center justify-center h-48 space-y-3 text-center px-4">
                  <span className="text-5xl animate-bounce">🤲</span>
                  <div className="max-w-xs space-y-1">
                    <h4 className="text-sm font-bold text-amber-300">
                      {lang === 'hi' ? 'हथेलियों को आँखों पर रखकर विश्राम' : lang === 'en' ? 'Warm Palming Rest' : 'હથેળીઓ આંખો પર મૂકી આરામ કરો'}
                    </h4>
                    <p className="text-xs text-amber-100/90 leading-relaxed">
                      {lang === 'hi'
                        ? 'दोनों हथेलियों को रगड़कर गर्म करें और आँखों पर हल्के से रखें। पूर्ण अंधकार में आँखों को शांति का अनुभव कराएं।'
                        : lang === 'en'
                        ? 'Gently cup warm palms over closed eyes and rest in soothing darkness.'
                        : 'બંને હથેળીઓ ઘસીને ગરમ કરો અને આંખો પર હળવેથી મૂકો. સંપૂર્ણ અંધકારમાં આંખોને શાંતિ અનુભવો.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Countdown Live Badge */}
              <div className="mt-3 px-3.5 py-1 rounded-full bg-black/50 border border-white/15 text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                <Timer size={13} className="text-amber-400" />
                <span>{eyeSecondsLeft} {lang === 'hi' ? 'सेकंड शेष' : lang === 'en' ? 'seconds left' : 'સેકન્ડ બાકી'}</span>
              </div>
            </div>

            {/* Eye Workout Start/Stop Controls */}
            <div className="flex gap-2.5 pt-4">
              {!isEyeActive ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsEyeActive(true);
                    setEyeSecondsLeft(eyeMode === 'full' ? FULL_ROUTINE_STEPS[0].duration : 30);
                    setEyeFullStepIndex(0);
                    setBlinkCount(0);
                    playEyeSound('bell');
                  }}
                  className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 active:scale-98 transition cursor-pointer"
                >
                  <Play size={16} fill="black" />
                  <span>
                    {eyeMode === 'full'
                      ? (lang === 'hi' ? 'पूर्ण २-मिनट कसरत शुरू करें 🚀' : lang === 'en' ? 'Start Full 2-Min Routine 🚀' : 'સંપૂર્ણ ૨-મિનિટ કસરત શરૂ કરો 🚀')
                      : (lang === 'hi' ? 'कसरत शुरू करें' : lang === 'en' ? 'Start Eye Exercise' : 'કસરત શરૂ કરો (Start Exercise)')}
                  </span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEyeActive(false);
                    }}
                    className="flex-1 py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md flex items-center justify-center gap-2 active:scale-98 transition cursor-pointer"
                  >
                    <Pause size={16} />
                    <span>{lang === 'hi' ? 'रोकें (Pause)' : lang === 'en' ? 'Pause' : 'રોકો (Pause)'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEyeActive(false);
                      setEyeSecondsLeft(30);
                      setEyeFullStepIndex(0);
                    }}
                    className="py-3 px-4 rounded-2xl bg-white/15 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-98 transition cursor-pointer"
                  >
                    <RotateCcw size={16} />
                    <span>{lang === 'hi' ? 'रीसेट' : lang === 'en' ? 'Reset' : 'રીસેટ'}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* 20-20-20 Rule Screen Break Timer Card */}
          <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-5 text-white shadow-md border border-blue-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-2.5 bg-blue-500/20 text-blue-300 rounded-2xl text-lg">
                  ⏱️
                </span>
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-1.5">
                    <span>{lang === 'hi' ? '२०-२०-२० स्क्रीन ब्रेक टाइमर' : lang === 'en' ? '20-20-20 Screen Break Timer' : '૨૦-૨૦-૨૦ સ્ક્રીન બ્રેક ટાઇમર'}</span>
                    <span className="text-[10px] bg-blue-400/20 text-blue-300 font-bold px-2 py-0.5 rounded-full">
                      RULE
                    </span>
                  </h3>
                  <p className="text-[11px] text-blue-200">
                    {lang === 'hi' ? 'हर २० मिनट में २० सेकंड के लिए २० फीट दूर देखें' : lang === 'en' ? 'Every 20 mins, look at something 20 ft away for 20 secs' : 'દર ૨૦ મિનિટે ૨૦ સેકન્ડ સુધી ૨૦ ફૂટ દૂર જુઓ'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIs20RuleActive(!is20RuleActive);
                  if (!is20RuleActive) playEyeSound('bell');
                }}
                className={`px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-xs transition active:scale-95 ${
                  is20RuleActive
                    ? 'bg-rose-500 hover:bg-rose-600 text-white'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                {is20RuleActive
                  ? (lang === 'hi' ? '⏸️ रोकें' : lang === 'en' ? '⏸️ Pause' : '⏸️ રોકો')
                  : (lang === 'hi' ? '▶️ शुरू करें' : lang === 'en' ? '▶️ Start' : '▶️ શરૂ કરો')}
              </button>
            </div>

            {/* Timer Display */}
            <div className="bg-white/10 rounded-2xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-blue-200 block">
                  {is20BreakTime
                    ? (lang === 'hi' ? '🚨 २० सेकंड का विजन ब्रेक!' : lang === 'en' ? '🚨 20-Second Vision Break!' : '🚨 ૨૦ સેકન્ડનો વિઝન બ્રેક!')
                    : (lang === 'hi' ? 'काम का समय (Work Timer):' : lang === 'en' ? 'Work Timer:' : 'કામ કરવાનો સમય (Work Timer):')}
                </span>
                <span className="text-xl font-black font-mono text-amber-300">
                  {is20BreakTime
                    ? `${breakSecondsLeft} ${lang === 'hi' ? 'सेकंड' : lang === 'en' ? 'sec' : 'સેકન્ડ'}`
                    : `${Math.floor(rule20SecondsLeft / 60)}:${(rule20SecondsLeft % 60).toString().padStart(2, '0')} ${lang === 'hi' ? 'मिनट' : lang === 'en' ? 'min' : 'મિનિટ'}`}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 max-w-xs text-right">
                {is20BreakTime
                  ? (lang === 'hi' ? '👀 खिड़की से २० फीट दूर देखें और आँखों को आराम दें!' : lang === 'en' ? '👀 Look 20 feet away to relax your eye muscles!' : '👀 બારી બહાર ૨૦ ફૂટ દૂર જુઓ અને આંખોને આરામ આપો!')
                  : (lang === 'hi' ? 'टाइमर चालू रखें। समय समाप्त होने पर अलार्म बजेगा।' : lang === 'en' ? 'Keep timer running. Alarm rings when time is up.' : 'ટાઇમર ચાલુ રાખો. સમય પૂરો થતાં એલાર્મ વાગશે.')}
              </p>
            </div>
          </div>

          {/* Doctor & Ayurveda Vision Care Tips */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <span>🌿</span>
              <span>{lang === 'hi' ? 'आँखों की सुरक्षा व स्वास्थ्य नियम' : lang === 'en' ? 'Doctor & Ayurveda Vision Care Guidelines' : 'આંખોની કાળજી & નેત્ર સ્વાસ્થ્ય નિયમો'}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                {
                  icon: '🥕',
                  title: lang === 'hi' ? 'विटामिन-ए व आहार' : lang === 'en' ? 'Vitamin-A Diet' : 'વિટામિન-A & નેત્ર આહાર',
                  desc: lang === 'hi' ? 'गाजर, पपीता, पालक और बादाम आँखों की रोशनी बनाए रखने में मदद करते हैं।' : lang === 'en' ? 'Carrots, papaya, spinach & almonds boost optic sharpness.' : 'ગાજર, પપૈયું, પાલક અને બદામ આંખોની રોશની જાળવવામાં અદ્ભુત મદદ કરે છે.',
                  bg: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-200',
                },
                {
                  icon: '💧',
                  title: lang === 'hi' ? 'ठंडे पानी के छींटे' : lang === 'en' ? 'Cold Water Splash' : 'ઠંડા પાણીની છાલક',
                  desc: lang === 'hi' ? 'सुबह मुँह में पानी भरकर आँखों पर ठंडे पानी के छींटे मारने से आँखों को ताजगी मिलती है।' : lang === 'en' ? 'Splashing cold water on eyes in morning relieves strain.' : 'સવારે ઉઠીને મોંમાં પાણી ભરીને આંખો પર ઠંડા પાણીની છાલક મારવાથી નેત્રતંતુઓ તાજા થાય છે.',
                  bg: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/40 text-blue-900 dark:text-blue-200',
                },
                {
                  icon: '📱',
                  title: lang === 'hi' ? 'सुरक्षित स्क्रीन दूरी' : lang === 'en' ? 'Safe Screen Distance' : 'મોબાઇલ સ્ક્રીન અંતર',
                  desc: lang === 'hi' ? 'मोबाइल हमेशा आँखों से १.५ फीट (४० सेमी) दूर रखें और अंधेरे में स्क्रीन न देखें।' : lang === 'en' ? 'Keep phone 40 cm away and avoid dark room glare.' : 'મોબાઇલ હંમેશા આંખોથી ૧.૫ ફૂટ (૪૦ સે.મી.) દૂર રાખો અને રાત્રે રૂમની લાઈટ બંધ રાખી સ્ક્રીન ન જુઓ.',
                  bg: 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/40 text-indigo-900 dark:text-indigo-200',
                },
                {
                  icon: '😴',
                  title: lang === 'hi' ? '७-८ घंटे की पर्याप्त नींद' : lang === 'en' ? '7-8 Hours Sleep' : '૭-૮ કલાક પૂરતી ઊંઘ',
                  desc: lang === 'hi' ? 'नींद के दौरान आँखों की कोशिकाएं पुनर्जीवित होती हैं और सूखापन दूर होता है।' : lang === 'en' ? 'Sleep rejuvenates optical cells and restores moisture.' : 'ઊંઘ દરમિયાન આંખોના કોષો પુનર્જીવિત થાય છે અને સુકાપણાની સમસ્યા મટે છે.',
                  bg: 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-900/40 text-purple-900 dark:text-purple-200',
                },
              ].map((tip, idx) => (
                <div key={idx} className={`p-3 rounded-2xl border ${tip.bg} space-y-1`}>
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <span>{tip.icon}</span>
                    <span>{tip.title}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed opacity-90">
                    {tip.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 4. BMI CALCULATOR SUB-TAB CONTENT                    */}
      {/* ==================================================== */}
      {activeSubTab === 'bmi' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                  <Scale size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">{t('bmi_calculator', lang)}</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{t('bmi_sub', lang)}</p>
                </div>
              </div>
            </div>

            {/* BMI Display Meter */}
            <div className="bmi-meter-card bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-slate-800/90 dark:to-indigo-950/70 rounded-2xl p-5 text-center border border-purple-200 dark:border-indigo-800/50">
              <span className="text-xs font-bold text-purple-700 dark:text-purple-300 block uppercase tracking-wider">
                {t('your_bmi_score', lang)}
              </span>
              <span className="text-5xl font-black text-slate-800 dark:text-white tracking-tight my-1 block">
                {bmiValue}
              </span>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${bmiCat.color} dark:bg-slate-900/90 dark:border-current`}>
                {bmiCat.label}
              </span>

              {/* Visual Category Meter */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden mt-4">
                <div
                  className={`h-full ${bmiCat.barColor} transition-all duration-500`}
                  style={{ width: `${Math.min(100, Math.max(10, (bmiValue / 40) * 100))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-semibold">
                <span>18.5 ({lang === 'gu' ? 'ઓછું' : (lang === 'hi' ? 'कम' : 'Under')})</span>
                <span>25 ({lang === 'gu' ? 'સામાન્ય' : (lang === 'hi' ? 'सामान्य' : 'Normal')})</span>
                <span>30 ({lang === 'gu' ? 'વધુ' : (lang === 'hi' ? 'अधिक' : 'Over')})</span>
              </div>
            </div>

            {/* Height & Weight Inputs */}
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  <span>{t('weight_kg', lang)}:</span>
                  <span className="text-purple-700 dark:text-purple-300 font-extrabold">{weightKg} kg</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="150"
                  step="0.5"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full accent-purple-600 dark:accent-purple-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  <span>{t('height_cm', lang)}:</span>
                  <span className="text-purple-700 dark:text-purple-300 font-extrabold">{heightCm} cm</span>
                </div>
                <input
                  type="range"
                  min="120"
                  max="220"
                  step="1"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className="w-full accent-purple-600 dark:accent-purple-400 cursor-pointer"
                />
              </div>
            </div>

            {/* Ideal Weight Recommendation */}
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 text-xs">
              <span className="font-bold text-emerald-900 dark:text-emerald-300 block mb-0.5">
                💡 {t('ideal_weight', lang)}:
              </span>
              <p className="text-emerald-800 dark:text-emerald-200">
                {lang === 'gu'
                  ? `તમારી ઊંચાઈ (${heightCm} cm) માટે તંદુરસ્ત વજન ${minHealthyWeight} kg થી ${maxHealthyWeight} kg વચ્ચે હોવું જોઈએ.`
                  : lang === 'hi'
                  ? `आपकी ऊंचाई (${heightCm} cm) के लिए स्वस्थ वजन ${minHealthyWeight} kg से ${maxHealthyWeight} kg के बीच होना चाहिए।`
                  : `Healthy weight for your height (${heightCm} cm) is between ${minHealthyWeight} kg and ${maxHealthyWeight} kg.`}
              </p>
            </div>

            {/* Advice box */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-200">
              <span className="font-bold block mb-0.5">{t('health_tip_label', lang)}</span>
              <p className="leading-relaxed text-slate-600 dark:text-slate-300">{bmiCat.advice}</p>
            </div>

            <button
              onClick={handleSaveBmi}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs active:scale-95 transition"
            >
              {t('save_bmi_profile', lang)}
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MEDICINE MODAL (Add / Edit)                          */}
      {/* ==================================================== */}
      {isMedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <h3 className="text-base font-bold text-slate-800">
                {editingMed ? t('edit_medicine', lang) : t('add_new_med', lang)}
              </h3>
              <button
                onClick={() => setIsMedModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveMed} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{t('med_name_label', lang)}</label>
                <input
                  type="text"
                  required
                  placeholder={t('med_name_placeholder', lang)}
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">{t('dosage_label', lang)}</label>
                  <input
                    type="text"
                    value={medDosage}
                    onChange={(e) => setMedDosage(e.target.value)}
                    placeholder={t('dosage_placeholder', lang)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">{t('time_label', lang)}</label>
                  <input
                    type="time"
                    value={medTime}
                    onChange={(e) => setMedTime(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{t('slot_label', lang)}</label>
                <select
                  value={medTimeSlot}
                  onChange={(e) => setMedTimeSlot(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                >
                  {currentMedicineSlots.filter((s) => s.id !== 'all').map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{t('meal_relation_label', lang)}</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMedMealRelation('before_food')}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition ${
                      medMealRelation === 'before_food'
                        ? 'bg-amber-100 border-amber-400 text-amber-900'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    {t('before_food', lang)}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMedMealRelation('after_food')}
                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold border transition ${
                      medMealRelation === 'after_food'
                        ? 'bg-emerald-100 border-emerald-400 text-emerald-900'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    {t('after_food', lang)}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">{t('extra_notes', lang)}</label>
                <input
                  type="text"
                  value={medNotes}
                  onChange={(e) => setMedNotes(e.target.value)}
                  placeholder={t('extra_notes_placeholder', lang)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={medHasAlarm}
                    onChange={(e) => setMedHasAlarm(e.target.checked)}
                    className="w-4 h-4 rounded text-teal-600"
                  />
                  <span>{t('sound_alarm_timely', lang)}</span>
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMedModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50"
                >
                  {t('cancel', lang)}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs"
                >
                  {t('save', lang)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
