import React from 'react';
import CartoonVideoPlayerCard from './CartoonVideoPlayerCard';

export default function AppVideoGuideModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl max-h-[96vh] overflow-y-auto rounded-3xl">
        <CartoonVideoPlayerCard isFullscreenModal={true} onCloseModal={onClose} />
      </div>
    </div>
  );
}
