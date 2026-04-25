import React, { useState, useEffect, useRef } from 'react';
import { useAsset } from '../context/AssetContext';
import { useLocale } from '../context/LocaleContext';

interface IntroPageProps {
  onEnter: (lang: string) => void;
}

const IntroPage: React.FC<IntroPageProps> = ({ onEnter }) => {
  const { introLogo, introVideo } = useAsset();
  const { t } = useLocale();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const [showMobileIntro, setShowMobileIntro] = useState(isMobile);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = mobileVideoRef.current;
    if (!video || !showMobileIntro) return;
    video.play().catch(() => setShowMobileIntro(false));
  }, [showMobileIntro]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => setVideoError(true));
  }, [introVideo]);

  const languages = [
    { code: 'fr', name: 'Français',   flag: '🇫🇷' },
    { code: 'en', name: 'English',    flag: '🇬🇧' },
    { code: 'es', name: 'Español',    flag: '🇪🇸' },
    { code: 'it', name: 'Italiano',   flag: '🇮🇹' },
    { code: 'de', name: 'Deutsch',    flag: '🇩🇪' },
    { code: 'pt', name: 'Português',  flag: '🇵🇹' },
    { code: 'nl', name: 'Nederlands', flag: '🇧🇪' },
  ];

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  if (showMobileIntro) {
    return (
      <div className="h-screen w-screen relative overflow-hidden bg-black">
        <video
          ref={mobileVideoRef}
          autoPlay
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover z-0"
          onEnded={() => setShowMobileIntro(false)}
          onError={() => setShowMobileIntro(false)}
        >
          <source src="/intro-mobile.mp4" type="video/mp4" />
        </video>
        <button
          onClick={() => setShowMobileIntro(false)}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 font-aboreto text-xs tracking-[0.3em] uppercase text-white/70 border border-white/30 px-6 py-3 hover:text-white hover:border-white transition-all duration-300"
        >
          Passer
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen relative overflow-hidden bg-[#000]">
      {/* Background Video */}
      {!videoError ? (
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute top-1/2 left-1/2 w-auto h-auto min-w-full min-h-full object-cover transform -translate-x-1/2 -translate-y-1/2 z-0 opacity-80"
          onError={() => setVideoError(true)}
        >
          <source src={introVideo} type="video/mp4" />
        </video>
      ) : (
        <div
          className="absolute inset-0 z-0 opacity-80 bg-cover bg-center"
          style={{ backgroundImage: `url(${introLogo})`, filter: 'blur(8px) brightness(0.4)' }}
        />
      )}

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40 z-10"></div>

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center justify-center h-full text-center text-white p-6">
        <div className="animate-fade-in">
            <img
                src={introLogo}
                alt="ATIP Textile Logo"
                className="h-48 md:h-64 w-auto object-contain drop-shadow-2xl"
            />
        </div>

        <p className="mt-6 text-lg md:text-xl font-playfair italic text-white/90 max-w-xl drop-shadow-lg animate-fade-in">
          {t('intro.quote')}
        </p>

        <div className="mt-12 animate-fade-in">
            <button
                onClick={() => setIsModalOpen(true)}
                className="group relative px-10 py-4 text-sm font-aboreto tracking-[0.3em] uppercase transition-all duration-500 overflow-hidden rounded-sm"
            >
                <span className="relative z-10 text-white group-hover:text-black transition-colors duration-500">
                    {t('intro.enterShop')}
                </span>
                <div className="absolute inset-0 border border-white/50 group-hover:border-white transition-colors duration-500"></div>
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out"></div>
            </button>
        </div>

        <div className="absolute bottom-12 left-0 right-0 text-center animate-fade-in">
            <span className="font-aboreto text-xs tracking-[0.4em] text-white/60 uppercase">
                {t('intro.artAndDesign')}
            </span>
        </div>
      </div>

      {/* Language Selection Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsModalOpen(false)}
          ></div>

          {/* Modal Content */}
          <div className="relative z-10 w-full max-w-md bg-background rounded-sm shadow-2xl overflow-hidden animate-fade-in">
            <div className="p-8 md:p-12">
                <button
                    onClick={() => setIsModalOpen(false)}
                    className="absolute top-4 right-4 text-subtitle/40 hover:text-title transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <h3 className="text-2xl font-aboreto text-title text-center mb-8 tracking-widest uppercase">
                    {t('intro.selectLanguage')}
                </h3>

                <div className="space-y-3">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => onEnter(lang.code)}
                            className="w-full flex items-center justify-between p-4 border border-subtitle/10 hover:border-red-button/50 hover:bg-black-button/30 transition-all duration-300 group rounded-sm"
                        >
                            <span className="flex items-center gap-4">
                                <span className="text-2xl">{lang.flag}</span>
                                <span className="font-aboreto tracking-widest text-subtitle group-hover:text-title">
                                    {lang.name}
                                </span>
                            </span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-subtitle/30 group-hover:text-red-button transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    ))}
                </div>

                <p className="mt-8 text-center text-xs font-playfair italic text-subtitle/60">
                    {t('intro.discover')}
                </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntroPage;
