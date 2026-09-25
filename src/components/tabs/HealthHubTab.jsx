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
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { t } from '../../services/i18n';

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
};

export default function HealthHubTab({
  medicines = [],
  medicineLogs = {},
  onSaveMedicines,
  onToggleMedicine,
  onTriggerAlarm,
  fitness,
  onUpdateFitness,
  lang = 'gu',
  initialSubTab = 'fitness',
}) {
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab);
  const todayStr = new Date().toISOString().split('T')[0];

  const currentMedicineSlots = MEDICINE_SLOTS[lang] || MEDICINE_SLOTS.gu;
  const currentWorkoutTypes = WORKOUT_TYPES[lang] || WORKOUT_TYPES.gu;

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
    if (window.confirm('શું તમે આ દવા હટાવવા માંગો છો?')) {
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

  const handleAddSteps = (count) => {
    const nextSteps = Math.max(0, steps + count);
    const nextKm = Number(((nextSteps * 0.76) / 1000).toFixed(2));
    const nextCal = Math.round(nextSteps * 0.045) + workoutCalories;
    onUpdateFitness({
      ...fitness,
      steps: nextSteps,
      distanceKm: nextKm,
      calories: nextCal,
    });
    if (nextSteps >= stepTarget && steps < stepTarget) {
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    }
  };

  // Workout Logger
  const [selectedWorkoutType, setSelectedWorkoutType] = useState('walk');
  const [workoutDuration, setWorkoutDuration] = useState(30);

  const handleAddWorkout = (e) => {
    e.preventDefault();
    const typeObj = currentWorkoutTypes.find((w) => w.id === selectedWorkoutType);
    const calculatedCals = Math.round((workoutDuration || 0) * (typeObj?.ratePerMin || 5));
    const nowTime = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    const newWorkout = {
      id: 'w-' + Date.now(),
      type: selectedWorkoutType,
      name: typeObj?.label || 'કસરત',
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
      // Keep only taps in the last 4 seconds
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

    // Reset tapping visual after 1.5s of inactivity
    tapTimeoutRef.current = setTimeout(() => {
      setIsTapping(false);
    }, 1500);
  };

  const handleSaveBpm = () => {
    onUpdateFitness({
      ...fitness,
      heartRate: liveBpm,
    });
    alert(`હાર્ટ રેટ ${liveBpm} BPM સફળતાપૂર્વક સાચવવામાં આવ્યો!`);
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
    alert('વાઇટલ્સ અને હેલ્થ લૉગ સફળતાપૂર્વક અપડેટ થયા!');
  };

  const getBpCategory = (sys, dia) => {
    if (sys < 120 && dia < 80) {
      return { label: 'સામાન્ય (Normal)', color: 'text-emerald-700 bg-emerald-100 border-emerald-300' };
    }
    if (sys <= 129 && dia < 80) {
      return { label: 'પ્રી-હાયપરટેન્શન (Elevated)', color: 'text-amber-700 bg-amber-100 border-amber-300' };
    }
    if (sys <= 139 || dia <= 89) {
      return { label: 'સ્ટેજ-૧ હાઇ BP (Hypertension 1)', color: 'text-orange-700 bg-orange-100 border-orange-300' };
    }
    return { label: 'સ્ટેજ-૨ હાઇ BP (Hypertension 2)', color: 'text-red-700 bg-red-100 border-red-300' };
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
        label: 'ઓછું વજન (Underweight)',
        color: 'text-amber-600 bg-amber-50 border-amber-300',
        barColor: 'bg-amber-500',
        advice: 'પૌષ્ટિક આહાર, ડ્રાયફ્રૂટ્સ, દૂધ અને પ્રોટીનયુક્ત ખોરાક વધારવો હિતાવહ છે.',
      };
    }
    if (bmi <= 24.9) {
      return {
        label: 'સામાન્ય અને તંદુરસ્ત (Normal / Healthy)',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-300',
        barColor: 'bg-emerald-500',
        advice: 'ઉત્તમ! તમારું વજન સંપૂર્ણ તંદુરસ્ત રેન્જમાં છે. આ જ રૂટિન જાળવી રાખો.',
      };
    }
    if (bmi <= 29.9) {
      return {
        label: 'વધુ વજન (Overweight)',
        color: 'text-orange-700 bg-orange-50 border-orange-300',
        barColor: 'bg-orange-500',
        advice: 'રોજિંદા ૮,૦૦૦+ સ્ટેપ્સ ચાલો, ગળપણ-ચરબી ઘટાડો અને કાર્ડિયો કસરત કરો.',
      };
    }
    return {
      label: 'મેદસ્વીતા (Obese)',
      color: 'text-red-700 bg-red-50 border-red-300',
      barColor: 'bg-red-500',
      advice: 'ડૉક્ટર/ન્યુટ્રિશનિસ્ટની સલાહ મુજબ કેલરી-નિયંત્રિત ડાયેટ અને નિયમિત કસરત શરૂ કરો.',
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
    alert('વજન અને ઊંચાઈ સફળતાપૂર્વક સાચવવામાં આવી!');
  };

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
            <span className="text-[10px] text-teal-200 block">👟 સ્ટેપ્સ</span>
            <span className="text-sm font-extrabold">{steps.toLocaleString()}</span>
          </div>
          <div className="bg-white/10 rounded-xl p-2 backdrop-blur-xs">
            <span className="text-[10px] text-teal-200 block">🔥 બર્ન કેલરી</span>
            <span className="text-sm font-extrabold">{totalCalories} kcal</span>
          </div>
          <div className="bg-white/10 rounded-xl p-2 backdrop-blur-xs">
            <span className="text-[10px] text-teal-200 block">💓 હાર્ટ રેટ</span>
            <span className="text-sm font-extrabold">{fitness?.heartRate || liveBpm} BPM</span>
          </div>
          <div className="bg-white/10 rounded-xl p-2 backdrop-blur-xs">
            <span className="text-[10px] text-teal-200 block">💊 દવાઓ</span>
            <span className="text-sm font-extrabold">{takenCount}/{activeMeds.length}</span>
          </div>
        </div>
      </div>

      {/* Segmented Controller (Sub-tabs) */}
      <div className="bg-white p-1 rounded-2xl border border-slate-200 grid grid-cols-4 gap-1 shadow-xs">
        <button
          onClick={() => setActiveSubTab('medicines')}
          className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
            activeSubTab === 'medicines'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Pill size={14} />
          <span>{t('subtab_medicines', lang)}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('fitness')}
          className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
            activeSubTab === 'fitness'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Footprints size={14} />
          <span>{t('subtab_fitness', lang)}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('cardio')}
          className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
            activeSubTab === 'cardio'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Activity size={14} />
          <span>{t('subtab_cardio', lang)}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('bmi')}
          className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
            activeSubTab === 'bmi'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Scale size={14} />
          <span>{t('subtab_bmi', lang)}</span>
        </button>
      </div>

      {/* ==================================================== */}
      {/* 1. MEDICINES SUB-TAB CONTENT                         */}
      {/* ==================================================== */}
      {activeSubTab === 'medicines' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">દવાઓનું દૈનિક આયોજન</h3>
              <p className="text-[11px] text-slate-500">
                {takenCount} માંથી {activeMeds.length} દવાઓ લેવાઈ ગઈ છે ({Math.round(activeMeds.length ? (takenCount / activeMeds.length) * 100 : 0)}%)
              </p>
            </div>
            <button
              onClick={handleOpenAddMed}
              className="flex items-center gap-1 bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs active:scale-95 transition"
            >
              <Plus size={14} />
              નવી દવા
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
                <p className="text-xs font-semibold text-slate-600">આ સ્લોટમાં કોઈ દવા શેડ્યૂલ નથી.</p>
                <button
                  onClick={handleOpenAddMed}
                  className="mt-3 text-xs text-teal-600 font-bold hover:underline"
                >
                  + નવી દવા ઉમેરો
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
                              {med.mealRelation === 'before_food' ? '🟢 ભૂખ્યા પેટે' : '🟡 જમ્યા પછી'}
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
                                title: `દવાનો સમય: ${med.name}`,
                                time: med.time,
                                type: 'medicine',
                                mealRelation: med.mealRelation,
                                dosage: med.dosage,
                              })
                            }
                            className="p-1.5 rounded-lg hover:bg-slate-100 text-teal-600 transition"
                            title="ટેસ્ટ એલાર્મ વગાડો"
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
      {/* 2. FITNESS & STEPS SUB-TAB CONTENT                   */}
      {/* ==================================================== */}
      {activeSubTab === 'fitness' && (
        <div className="space-y-4">
          {/* Main Step Ring & Metrics Card */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-100 text-teal-700">
                  <Footprints size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{t('steps_today', lang)}</h3>
                  <p className="text-[11px] text-slate-500">
                    {t('step_goal', lang)}: {stepTarget.toLocaleString()} સ્ટેપ
                  </p>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold bg-teal-50 text-teal-700 border border-teal-200">
                {stepProgress}% પૂર્ણ
              </span>
            </div>

            {/* Circular / Large Step Display */}
            <div className="bg-gradient-to-br from-slate-50 to-teal-50/40 rounded-2xl p-4 text-center border border-teal-100/60">
              <span className="text-4xl font-extrabold text-slate-800 tracking-tight block">
                {steps.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-slate-500 block mt-0.5">
                સ્ટેપ્સ ચાલ્યા / લક્ષ્ય {stepTarget.toLocaleString()}
              </span>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 h-3 rounded-full overflow-hidden mt-3">
                <div
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stepProgress}%` }}
                />
              </div>

              {/* Sub metrics: Distance & Active Walking Calories */}
              <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-200/70 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📏</span>
                  <div>
                    <span className="text-[10px] text-slate-500 block">{t('distance_walked', lang)}</span>
                    <span className="text-sm font-bold text-slate-800">{distanceKm} km</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🔥</span>
                  <div>
                    <span className="text-[10px] text-slate-500 block">ચાલવાની કેલરી</span>
                    <span className="text-sm font-bold text-orange-600">{stepCalories} kcal</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Step Buttons */}
            <div>
              <p className="text-xs font-bold text-slate-700 mb-2">ઝડપી સ્ટેપ ઉમેરો (Quick Steps):</p>
              <div className="grid grid-cols-4 gap-2">
                {[250, 500, 1000, 2000].map((inc) => (
                  <button
                    key={inc}
                    onClick={() => handleAddSteps(inc)}
                    className="py-2 px-1 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 text-xs font-bold text-slate-700 active:scale-95 transition"
                  >
                    +{inc}
                  </button>
                ))}
              </div>
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
                  (ચાલવું: {stepCalories} + વર્કઆઉટ: {workoutCalories} kcal)
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
                <p className="text-[11px] text-slate-500">કસરત પસંદ કરી સમય લખો, કેલરી આપમેળે ગણાશે</p>
              </div>
            </div>

            <form onSubmit={handleAddWorkout} className="space-y-3 pt-1">
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">કસરતનો પ્રકાર:</label>
                <select
                  value={selectedWorkoutType}
                  onChange={(e) => setSelectedWorkoutType(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                >
                  {currentWorkoutTypes.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.label} (~{Math.round(w.ratePerMin * 30)} kcal/૩૦ મિ.)
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
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">અંદાજિત કેલરી:</label>
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
                  આજની કસરત લૉગ:
                </span>
                {workouts.map((w) => (
                  <div
                    key={w.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800 block">{w.name}</span>
                      <span className="text-[10px] text-slate-500">
                        {w.durationMinutes} મિનિટ • {w.calories} kcal • {w.time}
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
                <span className="text-[11px] font-bold mt-1 tracking-tight">ટેપ કરો</span>
              </button>

              <div className="mt-4">
                <span className="text-4xl font-extrabold text-slate-800">{liveBpm}</span>
                <span className="text-sm font-bold text-red-600 ml-1.5">BPM</span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {liveBpm < 60
                    ? 'ધીમો ધબકારો (Bradycardia / Athletic)'
                    : liveBpm <= 80
                    ? 'આરામદાયક સામાન્ય દર (Normal Resting Rate)'
                    : liveBpm <= 120
                    ? 'ફેટ બર્ન / સામાન્ય કસરત દર (Fat Burn Zone)'
                    : 'કાર્ડિયો ફિટનેસ દર (Cardio Fitness Zone)'}
                </p>
              </div>

              <button
                onClick={handleSaveBpm}
                className="mt-3 px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs active:scale-95 transition"
              >
                હાર્ટ રેટ લૉગ સાચવો
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
                  <h3 className="text-sm font-bold text-slate-800">બ્લડ પ્રેશર & સુગર (BP & Sugar)</h3>
                  <p className="text-[11px] text-slate-500">દૈનિક સ્વાસ્થ્ય માપન</p>
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
                  <span className="text-[10px] text-slate-500 block mb-0.5">ઉપરનું (Systolic - mmHg):</span>
                  <input
                    type="number"
                    value={bpSystolic}
                    onChange={(e) => setBpSystolic(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block mb-0.5">નીચેનું (Diastolic - mmHg):</span>
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
                  <span className="text-[10px] text-slate-500 block mb-0.5">ભૂખ્યા પેટે (Fasting - mg/dL):</span>
                  <input
                    type="number"
                    value={sugarFasting}
                    onChange={(e) => setSugarFasting(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block mb-0.5">જમ્યા પછી (Post-meal - mg/dL):</span>
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
                <span className="text-xs font-bold text-indigo-700">{sleepHours} કલાક</span>
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
              <p className="text-[10px] text-slate-500 mt-1">આદર્શ તંદુરસ્તી માટે ૭ થી ૮ કલાકની ઊંઘ જરૂરી છે.</p>
            </div>

            <button
              onClick={handleSaveVitals}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs active:scale-95 transition"
            >
              વાઇટલ્સ સાચવો
            </button>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* 4. BMI CALCULATOR SUB-TAB CONTENT                    */}
      {/* ==================================================== */}
      {activeSubTab === 'bmi' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                  <Scale size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">{t('bmi_calculator', lang)}</h3>
                  <p className="text-[11px] text-slate-500">શરીરના વજન અને ઊંચાઈનું સંતુલન</p>
                </div>
              </div>
            </div>

            {/* BMI Display Meter */}
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-5 text-center border border-purple-200">
              <span className="text-xs font-bold text-purple-700 block uppercase tracking-wider">
                તમારો BMI સ્કોર
              </span>
              <span className="text-5xl font-black text-slate-800 tracking-tight my-1 block">
                {bmiValue}
              </span>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${bmiCat.color}`}>
                {bmiCat.label}
              </span>

              {/* Visual Category Meter */}
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mt-4">
                <div
                  className={`h-full ${bmiCat.barColor} transition-all duration-500`}
                  style={{ width: `${Math.min(100, Math.max(10, (bmiValue / 40) * 100))}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-semibold">
                <span>૧૮.૫ (ઓછું)</span>
                <span>૨૫ (સામાન્ય)</span>
                <span>૩૦ (વધુ)</span>
              </div>
            </div>

            {/* Height & Weight Inputs */}
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>{t('weight_kg', lang)}:</span>
                  <span className="text-purple-700 font-extrabold">{weightKg} kg</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="150"
                  step="0.5"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full accent-purple-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>{t('height_cm', lang)}:</span>
                  <span className="text-purple-700 font-extrabold">{heightCm} cm</span>
                </div>
                <input
                  type="range"
                  min="120"
                  max="220"
                  step="1"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className="w-full accent-purple-600"
                />
              </div>
            </div>

            {/* Ideal Weight Recommendation */}
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs">
              <span className="font-bold text-emerald-900 block mb-0.5">
                💡 {t('ideal_weight', lang)}:
              </span>
              <p className="text-emerald-800">
                તમારી ઊંચાઈ ({heightCm} cm) માટે તંદુરસ્ત વજન <strong>{minHealthyWeight} kg થી {maxHealthyWeight} kg</strong> વચ્ચે હોવું જોઈએ.
              </p>
            </div>

            {/* Advice box */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700">
              <span className="font-bold block mb-0.5">આરોગ્ય સૂચન (Health Tip):</span>
              <p className="leading-relaxed text-slate-600">{bmiCat.advice}</p>
            </div>

            <button
              onClick={handleSaveBmi}
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs active:scale-95 transition"
            >
              પ્રોફાઇલમાં BMI સાચવો
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
                {editingMed ? 'દવાની વિગત સુધારો' : 'નવી દવા ઉમેરો'}
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
                <label className="text-xs font-bold text-slate-700 block mb-1">દવાનું નામ *</label>
                <input
                  type="text"
                  required
                  placeholder="દા.ત. પેરાસીટામોલ, વિટામિન ડી..."
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">ડોઝ (માપ)</label>
                  <input
                    type="text"
                    value={medDosage}
                    onChange={(e) => setMedDosage(e.target.value)}
                    placeholder="દા.ત. ૧ ગોળી / ૫ ml"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">સમય</label>
                  <input
                    type="time"
                    value={medTime}
                    onChange={(e) => setMedTime(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">દિવસનો સ્લોટ</label>
                <select
                  value={medTimeSlot}
                  onChange={(e) => setMedTimeSlot(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold"
                >
                  <option value="morning">🌅 સવાર (Morning)</option>
                  <option value="afternoon">☀️ બપોર (Afternoon)</option>
                  <option value="evening">🌇 સાંજ (Evening)</option>
                  <option value="night">🌙 રાત (Night)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">જમવાની સ્થિતિ</label>
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
                    🟢 ભૂખ્યા પેટે
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
                    🟡 જમ્યા પછી
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">વધારાની નોંધ</label>
                <input
                  type="text"
                  value={medNotes}
                  onChange={(e) => setMedNotes(e.target.value)}
                  placeholder="દા.ત. નવશેકા પાણી સાથે લેવી"
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
                  <span>સમયસર એલાર્મ વગાડવું</span>
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMedModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-50"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs"
                >
                  સાચવો
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
