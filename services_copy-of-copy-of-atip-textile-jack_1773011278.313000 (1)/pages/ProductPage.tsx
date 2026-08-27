import { getLocalized } from '../types';

import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ImageCarousel from '../components/ImageCarousel';
import { useCart } from '../context/CartContext';
import ShareButton from '../components/ShareButton';
import BackToCollectionLink from '../components/BackToCollectionLink';
import { useLocale } from '../context/LocaleContext';
import { useProducts } from '../context/ProductContext';
import ProductCard from '../components/ProductCard';
import ProtectedImage from '../components/ProtectedImage';

const ProductPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart } = useCart();
  const { locale, t } = useLocale();
  const { getProductById, products } = useProducts();
  const navigate = useNavigate();

  const product = id ? getProductById(id) : undefined;

  const [added, setAdded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showThumbs, setShowThumbs] = useState(false);
  const [showArrows, setShowArrows] = useState(false);
  const thumbsTimer = React.useRef<number | null>(null);

  const handleImageMouseMove = () => {
    setShowArrows(true);
    setShowThumbs(true);
    if (thumbsTimer.current) clearTimeout(thumbsTimer.current);
    thumbsTimer.current = window.setTimeout(() => setShowThumbs(false), 1000);
  };

  const handleImageMouseLeave = () => {
    setShowArrows(false);
    setShowThumbs(false);
    if (thumbsTimer.current) clearTimeout(thumbsTimer.current);
  };

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => setIsReady(true), 50);
    return () => clearTimeout(timer);
  }, [id]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, 'Standard');
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'add_to_cart', {
          currency: 'EUR', value: product.price,
          items: [{ item_id: product.id, item_name: product.name['en'] ?? product.name[Object.keys(product.name)[0]], price: product.price, quantity: 1 }],
        });
      }
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart(product, 'Standard');
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'add_to_cart', {
          currency: 'EUR', value: product.price,
          items: [{ item_id: product.id, item_name: product.name['en'] ?? product.name[Object.keys(product.name)[0]], price: product.price, quantity: 1 }],
        });
      }
      navigate('/checkout');
    }
  };

  if (!product) {
    return (
      <div className="container mx-auto px-4 pt-32 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-3xl text-title font-aboreto mb-4">{t('product.notFound.title')}</h2>
        <p className="text-subtitle mb-8">{t('product.notFound.message')}</p>
        <BackToCollectionLink />
      </div>
    );
  }

  const suggestedProducts = products.filter(p => p.id !== id);

  if (!isReady) return <div className="min-h-screen bg-background" />;

  return (
    <div className="animate-page-enter">

      {/* ── SPLIT GRID ────────────────────────────────────────────────────
          items-start = columns only as tall as content → no empty gap
          Left sticky offset = 4rem (header height)
      ──────────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[56%_44%] items-start">

        {/* ── LEFT: sticky image ───────────────────────────────────────── */}
        <div
          className="lg:sticky lg:top-0 h-[80vw] max-h-[90vh] lg:h-screen overflow-hidden relative bg-[#f0ebe2] lg:pt-5"
          onMouseMove={handleImageMouseMove}
          onMouseLeave={handleImageMouseLeave}
        >

          <ImageCarousel
            images={product.images}
            currentIndex={currentImageIndex}
            onIndexChange={setCurrentImageIndex}
            objectFit="cover"
            showDots={false}
            showArrows={showArrows}
          />

          {/* Image counter — top right */}
          <div className="absolute top-5 right-5 z-20 bg-black/30 backdrop-blur-sm text-white/80 text-[10px] font-montserrat tracking-[0.2em] px-2.5 py-1 rounded-full">
            {currentImageIndex + 1} / {product.images.length}
          </div>

          {/* Thumbnails — bottom strip (desktop only, auto-hide after 1s inactivity) */}
          {product.images.length > 1 && (
            <div className={`absolute bottom-5 left-0 right-0 hidden lg:flex justify-center gap-2 px-4 z-20 transition-opacity duration-500 ${showThumbs ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              {product.images.map((img, index) => (
                <button
                  key={img}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`w-10 h-14 rounded-sm overflow-hidden flex-shrink-0 border transition-all duration-300 ${
                    currentImageIndex === index
                      ? 'border-white opacity-100 scale-105'
                      : 'border-white/20 opacity-50 hover:opacity-80'
                  }`}
                  aria-label={t('product.thumbnailAlt', { index: (index + 1).toString() })}
                >
                  <ProtectedImage src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: product info ──────────────────────────────────────── */}
        <div className="flex flex-col px-8 lg:px-14 pt-8 lg:pt-5 pb-20">
          <div className="max-w-sm mx-auto lg:mx-0 w-full">

            {/* Back link — desktop only */}
            <div className="hidden lg:block mb-8">
              <BackToCollectionLink />
            </div>

            {/* Tagline */}
            <p className="text-[9px] font-montserrat font-semibold tracking-[0.55em] text-red-button uppercase mb-3">
              {t('product.tagline')}
            </p>

            {/* Name + share */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <h1 className="text-3xl md:text-4xl font-aboreto text-title leading-tight">
                {getLocalized(product.name, locale)}
              </h1>
              <ShareButton
                productId={product.id}
                productName={getLocalized(product.name, locale)}
                className="text-subtitle/40 hover:text-red-button transition-colors mt-1 flex-shrink-0"
              />
            </div>

            {/* Subtitle */}
            {product.subtitle && (
              <p className="text-[10px] font-montserrat font-medium tracking-[0.35em] uppercase text-red-button/60 mb-5">
                {getLocalized(product.subtitle, locale)}
              </p>
            )}

            {/* Price */}
            <p className="text-3xl font-playfair italic text-title mb-7">
              € {product.price.toFixed(2)}
            </p>

            {/* ── CTAs ── */}
            <div className="flex flex-col gap-3 mb-7">
              {/* Primary */}
              <button
                onClick={handleAddToCart}
                className={`w-full h-12 text-[11px] font-montserrat font-semibold tracking-[0.35em] uppercase rounded-sm transition-all duration-300 ${
                  added
                    ? 'bg-green-600/80 text-white'
                    : 'bg-red-button text-white hover:bg-red-button/85 active:scale-[0.98]'
                }`}
              >
                {added ? t('product.added') : t('product.addToCart')}
              </button>

              {/* Secondary */}
              <button
                onClick={handleBuyNow}
                className="w-full h-11 text-[10px] font-montserrat font-medium tracking-[0.3em] uppercase rounded-sm border border-subtitle/25 text-subtitle/70 hover:border-title hover:text-title transition-all duration-300 active:scale-[0.98]"
              >
                {t('product.buyNow')}
              </button>
            </div>

            {/* Divider */}
            <div className="border-t border-subtitle/10 mb-6" />

            {/* Story */}
            <div className="mb-6">
              <p className="text-[9px] font-montserrat font-semibold tracking-[0.55em] text-subtitle/40 uppercase mb-4">
                {t('product.story')}
              </p>
              <p className={`text-sm text-subtitle/80 leading-[1.9] font-montserrat whitespace-pre-wrap transition-all duration-500 ${!isDescriptionExpanded ? 'line-clamp-5' : ''}`}>
                {getLocalized(product.description, locale)}
              </p>
              {getLocalized(product.description, locale).length > 150 && (
                <button
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="mt-3 text-[9px] font-bold uppercase tracking-[0.4em] text-red-button/70 hover:text-red-button transition-colors flex items-center gap-1.5"
                >
                  {isDescriptionExpanded
                    ? <>{t('product.seeLess')} <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg></>
                    : <>{t('product.seeMore')} <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></>
                  }
                </button>
              )}
            </div>

            {/* Technical details */}
            <div className="rounded-sm border border-subtitle/10 p-5">
              <p className="text-[9px] font-montserrat font-semibold tracking-[0.55em] text-subtitle/40 uppercase mb-4">
                {t('product.details')}
              </p>
              <ul className="space-y-2 text-[11px] text-subtitle/70 font-montserrat leading-relaxed">
                {[t('product.detailFormat'), t('product.detailSupport'), t('product.detailRender')].map((detail, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="w-1 h-1 rounded-full bg-red-button/40 mt-1.5 flex-shrink-0" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* ── SUGGESTIONS ───────────────────────────────────────────────── */}
      {suggestedProducts.length > 0 && (
        <div className="py-14 border-t border-subtitle/10">
          <p className="text-[9px] font-montserrat font-semibold tracking-[0.55em] text-subtitle/40 uppercase text-center mb-8 px-6">
            {t('product.suggestions.title')}
          </p>
          {/* Mobile: horizontal scroll */}
          <div className="flex lg:hidden gap-4 overflow-x-auto pb-4 px-6 snap-x snap-mandatory scrollbar-hide">
            {suggestedProducts.map((p, index) => (
              <div key={p.id} className="flex-shrink-0 w-[58vw] snap-start">
                <ProductCard product={p} index={index} />
              </div>
            ))}
          </div>
          {/* Desktop: grid */}
          <div className="hidden lg:grid container mx-auto px-16 grid-cols-4 gap-6">
            {suggestedProducts.map((p, index) => (
              <ProductCard key={p.id} product={p} index={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;
