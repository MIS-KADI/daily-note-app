import React, { useState } from 'react';
import {
  QrCode,
  Copy,
  Check,
  X,
  MessageCircle,
  ExternalLink,
  IndianRupee,
  Share2,
  ShieldCheck,
} from 'lucide-react';
import { openWhatsApp } from '../services/whatsappService';

export default function UpiPaymentModal({
  isOpen,
  onClose,
  party,
  user,
  onUpdateUserUpi,
  lang = 'gu',
}) {
  const [copied, setCopied] = useState(false);
  const [upiId, setUpiId] = useState(user?.upiId || '9876543210@paytm');
  const [amount, setAmount] = useState(party?.amount || 0);

  if (!isOpen || !party) return null;

  const partyName = party.partyName || 'મિત્ર';
  const userName = user?.name || 'Daily Diary User';

  // Standard UPI URI format
  const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(userName)}&am=${encodeURIComponent(amount)}&cu=INR&tn=${encodeURIComponent('Khata_Payment_' + partyName)}`;

  // Public QR Code Image generator URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUri)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(upiUri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendOnWhatsApp = () => {
    const formattedAmt = Number(amount).toLocaleString();
    let message = '';

    if (lang === 'hi') {
      message = `🙏 नमस्ते ${partyName}जी,\n\nखाता बही बकाया राशि: ₹${formattedAmt}\n\nआप नीचे दी गई UPI लिंक पर क्लिक करके सीधे Google Pay / PhonePe / Paytm से भुगतान कर सकते हैं:\n👉 ${upiUri}\n\nभुगतान के बाद कृपया सूचित करें।\nधन्यवाद! 🙏\n— ${userName}`;
    } else if (lang === 'en') {
      message = `🙏 Hello ${partyName},\n\nLedger Outstanding Balance: ₹${formattedAmt}\n\nYou can pay directly via Google Pay / PhonePe / Paytm by tapping the UPI link below:\n👉 ${upiUri}\n\nPlease confirm once paid.\nThank you! 🙏\n— ${userName}`;
    } else {
      // Gujarati
      message = `🙏 નમસ્તે ${partyName}જી,\n\nઆપના ખાતાની બાકી રકમ: ₹${formattedAmt}\n\nતમે નીચે આપેલી UPI લિંક પર ક્લિક કરીને સીધું Google Pay / PhonePe / Paytm થી ચુકવણી કરી શકો છો:\n👉 ${upiUri}\n\nનાણાં ચૂકવાઈ જાય એટલે મેસેજ કરવા વિનંતી છે.\nઆભાર! 🙏\n— ${userName}`;
    }

    openWhatsApp(party.phone || '', message);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-white/20 rounded-xl">
              <QrCode size={20} />
            </span>
            <div>
              <h3 className="font-bold text-base leading-tight">UPI પેમેન્ટ QR & લિંક</h3>
              <p className="text-xs text-emerald-100">{partyName} માટે સ્કેનર</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-center">
          {/* Party & Amount Tag */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex justify-between items-center text-left">
            <div>
              <span className="text-[10px] text-slate-400 font-semibold block">પાર્ટીનું નામ</span>
              <span className="text-sm font-bold text-slate-800">{partyName}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-semibold block">બાકી રકમ</span>
              <span className="text-base font-black text-emerald-600">₹{Number(amount).toLocaleString()}</span>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50 border-2 border-dashed border-emerald-300 rounded-3xl relative">
            <img
              src={qrCodeUrl}
              alt="UPI QR Code"
              className="w-48 h-48 rounded-2xl shadow-sm bg-white p-2 border border-slate-200"
            />
            <span className="mt-2.5 text-[11px] font-semibold text-slate-600 flex items-center gap-1">
              <ShieldCheck size={14} className="text-emerald-600" />
              GPay, PhonePe, Paytm કે BHIM થી સ્કેન કરો
            </span>
          </div>

          {/* User's Receiving UPI ID config */}
          <div className="text-left space-y-1">
            <label className="block text-[11px] font-semibold text-slate-600">
              તમારી UPI ID (રકમ જમા કરવા માટે):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={upiId}
                onChange={(e) => {
                  setUpiId(e.target.value);
                  onUpdateUserUpi?.(e.target.value);
                }}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                placeholder="yourname@okhdfcbank"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleSendOnWhatsApp}
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-98 transition"
            >
              <MessageCircle size={17} />
              WhatsApp પર QR પેમેન્ટ લિંક મોકલો
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCopyLink}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold active:scale-98 transition"
              >
                {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                {copied ? 'લિંક કોપી થઈ ગઈ!' : 'UPI લિંક કોપી'}
              </button>

              <a
                href={upiUri}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold active:scale-98 transition"
              >
                <ExternalLink size={14} />
                UPI એપમાં ખોલો
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
