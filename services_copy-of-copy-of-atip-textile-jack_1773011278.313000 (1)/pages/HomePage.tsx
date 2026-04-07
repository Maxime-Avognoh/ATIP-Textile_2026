import { getLocalized } from '../types';

import React, { useRef, useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { useLocale } from '../context/LocaleContext';
import { useProducts } from '../context/ProductContext';
import { useAsset } from '../context/AssetContext';

const HomePage: React.FC = () => {
  const { t, locale } = useLocale();
  const { products } = useProducts();
  const { introLogo, introVideo } = useAsset();
  const mainContentRef = useRef<HTMLDivElement>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const scrollToContent = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    mainContentRef.current?.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      setIsTransitioning(false);
    }, 1000);
  };

  useEffect(() => {
    const html = document.documentElement;
    html.style.scrollSnapType = 'y mandatory';
    html.style.scrollBehavior = 'smooth';
    
    let isScrollingLocked = false;

    const handleWheel = (e: WheelEvent) => {
      if (!isScrollingLocked && window.scrollY < 100 && e.deltaY > 0) {
        isScrollingLocked = true;
        scrollToContent();
        setTimeout(() => { isScrollingLocked = false; }, 1200);
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      const touchStartY = e.touches[0].clientY;
      const handleTouchMove = (moveEvent: TouchEvent) => {
        const touchEndY = moveEvent.touches[0].clientY;
        const deltaY = touchStartY - touchEndY;
        if (!isScrollingLocked && window.scrollY < 100 && deltaY > 20) {
          isScrollingLocked = true;
          scrollToContent();
          window.removeEventListener('touchmove', handleTouchMove);
          setTimeout(() => { isScrollingLocked = false; }, 1200);
        }
      };
      window.addEventListener('touchmove', handleTouchMove, { passive: true });
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });

    return () => {
      html.style.scrollSnapType = 'none';
      html.style.scrollBehavior = 'auto';
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouchStart);
    };
  }, []);

  // ❤️ MODIFIER ICI POUR CHANGER LE NOMBRE DE PRODUITS AFFICHÉS
  const featuredProducts = products;

  return (
    <div className="pb-12">
      {/* SECTION HERO */}
      <section className="h-screen w-full relative overflow-hidden bg-[#000] snap-start snap-always">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute top-1/2 left-1/2 w-auto h-auto min-w-full min-h-full object-cover transform -translate-x-1/2 -translate-y-1/2 z-0 opacity-70"
          src={introVideo}
        >
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <div className="relative z-20 flex flex-col items-center justify-center h-full text-center text-white p-6">
          <div className="mb-2">
            <img src={introLogo} alt="Logo ATIP Textile" className="h-48 md:h-64 w-auto object-contain drop-shadow-2xl" />
          </div>
          <p className="mt-8 text-xl md:text-2xl font-playfair italic text-white/95 max-w-2xl drop-shadow-lg px-4 animate-fade-in tracking-wide leading-relaxed">
            {t('home.introText')}
          </p>
          <div className="mt-12">
            <button
                onClick={scrollToContent}
                className="group relative px-12 py-5 text-xs font-montserrat font-medium tracking-[0.4em] uppercase transition-all duration-500 overflow-hidden rounded-sm"
            >
                <span className="relative z-10 text-white group-hover:text-black transition-colors duration-500">
                    {t('nav.home')}
                </span>
                <div className="absolute inset-0 border border-white/40 group-hover:border-white transition-colors duration-500"></div>
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-700 ease-in-out"></div>
            </button>
          </div>
        </div>
      </section>

      {/* SECTION CONTENU PRINCIPAL */}
      <div ref={mainContentRef} className="container mx-auto px-6 lg:px-16 mt-12 snap-start snap-always min-h-screen">
        <div className="w-full pt-32 pb-24 flex flex-col gap-16 md:gap-32">
          
          {/* 1. TEXTES (Titre et Introduction) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-16 items-start animate-fade-in stagger-1">
              <div className="lg:col-span-5 flex flex-col items-start text-left">
                  <span className="text-[10px] font-montserrat font-semibold tracking-[0.5em] text-red-button uppercase mb-4 block">
                      {t('home.tagline')}
                  </span>
                  <h2 className="text-2xl md:text-4xl lg:text-5xl font-aboreto text-title tracking-[0.1em] uppercase leading-tight">
                      {t('home.title')}
                  </h2>
              </div>
              
              <div className="lg:col-span-7 flex flex-col items-start text-left">
                  <div className="w-20 h-px bg-red-button/30 mb-6 mt-2 hidden lg:block"></div>
                  <p className="text-lg md:text-2xl text-red-button font-playfair italic leading-relaxed max-w-2xl">
                      {t('home.subtitle')}
                  </p>
              </div>
          </div>

          {/* ❤️ MODIFIER ICI POUR CHANGER LA GRILLE (ex: lg:grid-cols-2 pour 2 colonnes) */}
          <div className="w-full animate-fade-in stagger-2">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 md:gap-12 lg:gap-16">
              {featuredProducts.map((product, index) => (
                <div key={product.id} className="flex flex-col gap-4">
                  <div className="transition-transform duration-700 hover:-translate-y-4">
                      <ProductCard product={product} index={index} />
                  </div>
                  {product.subtitle && (
                    <div className="text-center animate-fade-in stagger-3">
                      <p className="text-[10px] md:text-xs font-montserrat font-bold tracking-[0.3em] uppercase text-red-button/80">
                        {getLocalized(product.subtitle, locale)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 3. VALEURS (Authenticité, Artisanat, Design) */}
          <section className="w-full animate-fade-in stagger-3 border-t border-subtitle/10 pt-24 pb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-24">
              
              {/* Valeur 1: Authenticité */}
              <div className="flex flex-col items-center text-center">
                <div className="mb-8 p-6 rounded-full bg-red-button/5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-button" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className="text-[10px] font-montserrat font-semibold tracking-[0.5em] text-red-button uppercase mb-4">
                  {t('home.values.v1.tagline')}
                </span>
                <h3 className="text-xl font-aboreto text-title tracking-wider uppercase mb-6">
                  {t('home.values.v1.title')}
                </h3>
                <p className="text-sm text-subtitle/80 font-playfair italic leading-relaxed max-w-xs">
                  {t('home.values.v1.text')}
                </p>
              </div>

              {/* Valeur 2: Artisanat */}
              <div className="flex flex-col items-center text-center">
                <div className="mb-8 p-6 rounded-full bg-red-button/5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-button" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                  </svg>
                </div>
                <span className="text-[10px] font-montserrat font-semibold tracking-[0.5em] text-red-button uppercase mb-4">
                  {t('home.values.v2.tagline')}
                </span>
                <h3 className="text-xl font-aboreto text-title tracking-wider uppercase mb-6">
                  {t('home.values.v2.title')}
                </h3>
                <p className="text-sm text-subtitle/80 font-playfair italic leading-relaxed max-w-xs">
                  {t('home.values.v2.text')}
                </p>
              </div>

              {/* Valeur 3: Design */}
              <div className="flex flex-col items-center text-center">
                <div className="mb-8 p-6 rounded-full bg-red-button/5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-button" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z M4 7h16 M7 4v16" />
                  </svg>
                </div>
                <span className="text-[10px] font-montserrat font-semibold tracking-[0.5em] text-red-button uppercase mb-4">
                  {t('home.values.v3.tagline')}
                </span>
                <h3 className="text-xl font-aboreto text-title tracking-wider uppercase mb-6">
                  {t('home.values.v3.title')}
                </h3>
                <p className="text-sm text-subtitle/80 font-playfair italic leading-relaxed max-w-xs">
                  {t('home.values.v3.text')}
                </p>
              </div>

            </div>
          </section>

        </div>
      </div>
    </div>
  );
};

export default HomePage;
