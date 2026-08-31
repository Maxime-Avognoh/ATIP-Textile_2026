import React, { useState, useEffect } from 'react';
import { getSeptemberPromo } from '../utils/promo';
import { useLocale } from '../context/LocaleContext';

const PromoBanner: React.FC = () => {
  const { isOnSale } = getSeptemberPromo(1);
  const [timeLeft, setTimeLeft] = useState('');
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!isOnSale) return;

    const endOfSeptember = new Date('2026-10-01T00:00:00');

    const update = () => {
      const diff = endOfSeptember.getTime() - Date.now();
      if (diff <= 0) { setTimeLeft(''); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setTimeLeft(`${d}j ${h}h ${m}m`);
    };

    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [isOnSale]);

  if (!isOnSale || dismissed) return null;

  return (
    <div className="relative w-full z-50 bg-[#7D5134] text-white overflow-hidden">
      {/* Subtle shimmer line */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_3s_ease-in-out_infinite]" />

      <div className="flex items-center justify-between px-4 md:px-8 py-2.5 gap-4">
        {/* Left spacer on desktop */}
        <div className="hidden md:block w-6" />

        {/* Main message — centered */}
        <div className="flex-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 text-center">
          <span className="text-[10px] font-montserrat font-bold tracking-[0.45em] uppercase opacity-80">
            Septembre
          </span>
          <span className="text-[11px] font-aboreto tracking-[0.3em] uppercase">
            — 20% sur toute la collection —
          </span>
          {timeLeft && (
            <span className="text-[10px] font-montserrat tracking-[0.25em] opacity-80">
              Se termine dans&nbsp;<strong>{timeLeft}</strong>
            </span>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity p-1"
          aria-label="Fermer la bannière"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          60%, 100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
};

export default PromoBanner;
