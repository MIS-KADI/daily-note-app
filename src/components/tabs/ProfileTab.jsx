import React, { useState } from 'react';
import {
  UserCheck,
  Mail,
  Phone,
  ShieldCheck,
  Lock,
  Download,
  Upload,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  Save,
  HelpCircle,
} from 'lucide-react';
import { storageService } from '../../services/storageService';

export default function ProfileTab({ user, onUpdateUser, onReloadAllData }) {
  const [name, setName] = useState(user?.name || '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isPinRequired, setIsPinRequired] = useState(user?.isPinRequired ?? false);
  const [pin, setPin] = useState(user?.pin || '1234');
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updated = {
      ...user,
      name,
      mobile,
      email,
      isPinRequired,
      pin,
    };
    onUpdateUser(updated);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleExport = () => {
    storageService.exportBackup();
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const res = storageService.importBackup(content);
        if (res.success) {
          alert('ડેટા સફળતાપૂર્વક રીસ્ટોર થયો છે!');
          onReloadAllData();
        } else {
          alert('બેકઅપ ફાઇલમાં ભૂલ: ' + res.error);
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4 pb-24 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <UserCheck className="text-blue-600" size={22} />
            પ્રોફાઇલ & સિક્યોરિટી
          </h2>
          <p className="text-xs text-slate-500">
            તમારો મોબાઈલ, ઈમેઈલ અને પ્રાઈવસી સેટિંગ્સ
          </p>
        </div>
      </div>

      {/* Linked Account Card */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-md shadow-blue-500/20">
            {name ? name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800">{name || 'યુઝર પ્રોફાઇલ'}</h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full mt-0.5">
              <CheckCircle2 size={12} />
              મોબાઇલ & ઇમેઇલ લિંક્ડ છે
            </span>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSaveProfile} className="space-y-3 pt-2">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              તમારું પૂરું નામ
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                <Phone size={12} className="text-slate-500" />
                મોબાઇલ નંબર (Mobile Number)
              </label>
              <span className="text-[10px] text-emerald-600 font-bold">ઓટીપી વેરિફાઇડ ✅</span>
            </div>
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="+91 98765 43210"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                <Mail size={12} className="text-slate-500" />
                ઇમેઇલ આઇડી (Email ID)
              </label>
              <span className="text-[10px] text-emerald-600 font-bold">કન્ફર્મ થયેલ ✅</span>
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              placeholder="user@example.com"
              required
            />
          </div>

          {/* Security PIN Section */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Lock size={14} className="text-blue-600" />
                  ૪-અંકનો સુરક્ષા પિન લૉક (App PIN Lock)
                </h4>
                <p className="text-[11px] text-slate-500">
                  એપ ખોલતી વખતે આ પિન દાખલ કરવો પડશે
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPinRequired}
                  onChange={(e) => setIsPinRequired(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {isPinRequired && (
              <div className="pt-1">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  નવો ૪ અંકનો પિન
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-32 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center text-base tracking-widest font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  placeholder="1234"
                  required
                />
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-blue-500/20 active:scale-98 transition"
            >
              <Save size={16} />
              પ્રોફાઇલ સાચવો (Save Changes)
            </button>
            {savedNotice && (
              <p className="text-center text-xs font-bold text-emerald-600 mt-2">
                ✅ માહિતી સફળતાપૂર્વક સચવાઈ ગઈ!
              </p>
            )}
          </div>
        </form>
      </div>

      {/* Privacy & Anti-Leak Guarantee */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-3xl p-4 border border-emerald-200 shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
          <ShieldCheck size={18} className="text-emerald-700" />
          <span>100% પ્રાઇવસી અને નો-ડેટા-લીક સુરક્ષા</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed pl-1">
          તમારી ડાયરીની અંગત નોંધો, બેંકના કામો, દવાઓનું પ્રિસ્ક્રિપ્શન અને આવક-ખર્ચનો હિસાબ
          સંપૂર્ણપણે તમારા પોતાના મોબાઈલમાં સુરક્ષિત અને એન્ક્રિપ્ટ રહે છે. કોઈ ત્રીજી વ્યક્તિ
          કે કંપની આ ડેટા જોઈ શકતી નથી.
        </p>
      </div>

      {/* Backup and Restore */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          ડેટા બેકઅપ અને રીસ્ટોર (Data Backup & Restore)
        </h3>
        <p className="text-xs text-slate-500">
          મોબાઇલ બદલાય કે ડેટા સાચવવો હોય ત્યારે બેકઅપ ફાઇલ ડાઉનલોડ કરી રાખો:
        </p>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-1.5 py-3 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-bold transition active:scale-98"
          >
            <Download size={16} />
            બેકઅપ ડાઉનલોડ
          </button>

          <label className="flex items-center justify-center gap-1.5 py-3 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-xs font-bold transition cursor-pointer active:scale-98">
            <Upload size={16} />
            બેકઅપ રીસ્ટોર
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
