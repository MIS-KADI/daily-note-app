import React, { useState } from 'react';
import {
  Pill,
  Plus,
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
  HeartPulse,
} from 'lucide-react';

const SLOTS = [
  { id: 'all', label: 'બધી દવાઓ', icon: null },
  { id: 'morning', label: '🌅 સવાર', icon: Sunrise },
  { id: 'afternoon', label: '☀️ બપોર', icon: Sun },
  { id: 'evening', label: '🌇 સાંજ', icon: Sunset },
  { id: 'night', label: '🌙 રાત', icon: Moon },
];

export default function MedicineTab({
  medicines,
  medicineLogs,
  onSaveMedicines,
  onToggleMedicine,
  onTriggerAlarm,
}) {
  const [selectedSlot, setSelectedSlot] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState(null);

  // Form state
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('૧ ગોળી');
  const [timeSlot, setTimeSlot] = useState('morning');
  const [mealRelation, setMealRelation] = useState('before_food');
  const [time, setTime] = useState('08:00');
  const [notes, setNotes] = useState('');
  const [hasAlarm, setHasAlarm] = useState(true);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleOpenAdd = () => {
    setEditingMed(null);
    setName('');
    setDosage('૧ ગોળી');
    setTimeSlot('morning');
    setMealRelation('before_food');
    setTime('08:00');
    setNotes('');
    setHasAlarm(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (med) => {
    setEditingMed(med);
    setName(med.name);
    setDosage(med.dosage);
    setTimeSlot(med.timeSlot);
    setMealRelation(med.mealRelation);
    setTime(med.time);
    setNotes(med.notes || '');
    setHasAlarm(med.hasAlarm ?? true);
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingMed) {
      const updated = medicines.map((m) =>
        m.id === editingMed.id
          ? {
              ...m,
              name,
              dosage,
              timeSlot,
              mealRelation,
              time,
              notes,
              hasAlarm,
            }
          : m
      );
      onSaveMedicines(updated);
    } else {
      const newMed = {
        id: 'med-' + Date.now(),
        name,
        dosage,
        timeSlot,
        mealRelation,
        time,
        notes,
        hasAlarm,
        active: true,
      };
      onSaveMedicines([...medicines, newMed]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('શું તમે આ દવા શિડ્યુલમાંથી કાઢી નાખવા માંગો છો?')) {
      onSaveMedicines(medicines.filter((m) => m.id !== id));
    }
  };

  const filtered = medicines.filter((m) => {
    if (selectedSlot === 'all') return true;
    return m.timeSlot === selectedSlot;
  });

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <HeartPulse className="text-teal-600" size={22} />
            હેલ્થ & દવા શિડ્યુલ
          </h2>
          <p className="text-xs text-slate-500">
            ભૂખ્યા પેટે કે જમ્યા પછી, સમયસર દવા લેવાનું રિમાઇન્ડર
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1 py-2 px-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-xs font-semibold shadow-md shadow-teal-500/20 active:scale-95 transition"
        >
          <Plus size={16} />
          નવી દવા
        </button>
      </div>

      {/* Time Slot Filter Pills */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {SLOTS.map((slot) => (
          <button
            key={slot.id}
            onClick={() => setSelectedSlot(slot.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              selectedSlot === slot.id
                ? 'bg-teal-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {slot.label}
          </button>
        ))}
      </div>

      {/* Medicine Items List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200 space-y-2">
          <span className="text-4xl block">💊</span>
          <h3 className="text-sm font-bold text-slate-700">કોઈ દવા ઉમેરેલી નથી</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            તમારું રોજિંદુ દવાઓનું પ્રિસ્ક્રિપ્શન ઉમેરવા માટે "નવી દવા" બટન દબાવો.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((med) => {
            const isTaken = !!medicineLogs[todayStr]?.[med.id]?.taken;
            const isBeforeFood = med.mealRelation === 'before_food';

            return (
              <div
                key={med.id}
                className={`p-4 rounded-3xl border transition shadow-xs bg-white ${
                  isTaken
                    ? 'border-slate-200 bg-slate-50/70 opacity-70'
                    : isBeforeFood
                    ? 'border-amber-200/90 hover:border-amber-300'
                    : 'border-teal-200/90 hover:border-teal-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onToggleMedicine(med.id)}
                      className={`w-7 h-7 rounded-xl flex items-center justify-center transition active:scale-95 ${
                        isTaken
                          ? 'bg-teal-600 text-white'
                          : 'border-2 border-slate-300 hover:border-teal-500 text-transparent'
                      }`}
                      title={isTaken ? 'દવા લેવાઈ ગઈ છે (ક્લિક કરી રદ કરો)' : 'દવા લીધી તરીકે માર્ક કરો'}
                    >
                      <CheckCircle2 size={18} />
                    </button>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Meal condition badge */}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isBeforeFood
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          }`}
                        >
                          {isBeforeFood ? '🟢 ભૂખ્યા પેટે (ખાલી પેટે)' : '🟡 જમ્યા પછી'}
                        </span>

                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {med.timeSlot === 'morning'
                            ? 'સવારે'
                            : med.timeSlot === 'afternoon'
                            ? 'બપોરે'
                            : med.timeSlot === 'evening'
                            ? 'સાંજે'
                            : 'રાત્રે'}
                        </span>
                      </div>

                      <h4
                        className={`text-sm font-bold mt-1.5 ${
                          isTaken ? 'line-through text-slate-500' : 'text-slate-800'
                        }`}
                      >
                        {med.name}
                      </h4>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-xs font-bold bg-teal-50 text-teal-800 px-2 py-1 rounded-lg border border-teal-100">
                      <Clock size={12} className="text-teal-600" />
                      {med.time}
                    </span>
                    <p className="text-[11px] font-semibold text-slate-600 mt-1">
                      {med.dosage}
                    </p>
                  </div>
                </div>

                {med.notes && (
                  <p className="text-xs text-slate-600 mt-2 pl-10 italic">
                    "{med.notes}"
                  </p>
                )}

                {/* Bottom action row */}
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs pl-10">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500">
                      {isTaken ? '✅ આજે લેવાઈ ગઈ' : '⏳ આજે લેવાની બાકી'}
                    </span>

                    {/* Test Alarm Sound for this specific medicine */}
                    <button
                      onClick={() =>
                        onTriggerAlarm({
                          title: med.name,
                          dosage: med.dosage,
                          mealRelation: med.mealRelation,
                          time: med.time,
                          notes: med.notes,
                          type: 'medicine',
                        })
                      }
                      className="p-1 rounded-lg text-slate-400 hover:text-teal-600 hover:bg-teal-50 transition"
                      title="દવાનું એલાર્મ ચેક કરો"
                    >
                      <Volume2 size={15} />
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(med)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-teal-600 transition"
                      title="સુધારો કરો"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(med.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 transition"
                      title="કાઢી નાખો"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Medicine Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
              <h3 className="font-bold text-sm text-slate-800">
                {editingMed ? 'દવામાં ફેરફાર કરો' : 'નવી દવા ઉમેરો'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  દવાનું નામ (Medicine Name)
                </label>
                <input
                  type="text"
                  placeholder="e.g. પેન્ટોપ્રાઝોલ, પેરાસિટામોલ, બીપીની દવા..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    ડોઝ (Dosage)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ૧ ગોળી, ૫ ml, ૧ ચમચી"
                    value={dosage}
                    onChange={(e) => setDosage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    સમયગાળો (Time Slot)
                  </label>
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                  >
                    <option value="morning">🌅 સવારે (Morning)</option>
                    <option value="afternoon">☀️ બપોરે (Afternoon)</option>
                    <option value="evening">🌇 સાંજે (Evening)</option>
                    <option value="night">🌙 રાત્રે (Night)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    ખોરાકનો સંબંધ (Food Relation)
                  </label>
                  <select
                    value={mealRelation}
                    onChange={(e) => setMealRelation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-bold"
                  >
                    <option value="before_food">🟢 ભૂખ્યા પેટે (ખાલી પેટે)</option>
                    <option value="after_food">🟡 જમ્યા પછી (After Food)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    ચોક્કસ સમય (Time)
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  ડોક્ટરની સલાહ / ખાસ નોંધ (Notes)
                </label>
                <input
                  type="text"
                  placeholder="e.g. નવશેકા પાણી સાથે લેવી, દૂધ સાથે..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="p-3 bg-teal-50/70 border border-teal-100 rounded-2xl">
                <label className="flex items-center gap-2 text-xs font-semibold text-teal-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasAlarm}
                    onChange={(e) => setHasAlarm(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded-md focus:ring-teal-500"
                  />
                  <span>🔔 સમય થાય ત્યારે મેડિસિન એલાર્મ વાગવું જોઈએ</span>
                </label>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  રદ કરો
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-teal-500/20 transition flex items-center justify-center gap-1"
                >
                  <Check size={16} />
                  સાચવો (Save)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
