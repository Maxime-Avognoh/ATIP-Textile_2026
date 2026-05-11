import { getLocalized } from '../types';

import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ImageCarousel from '../components/ImageCarousel';
import Button from '../components/Button';
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
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => setIsReady(true), 50);
    return () => clearTimeout(timer);
  }, [id]);

  useEffect(() => {
    document.body.style.overflow = isFullScreen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isFullScreen]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, 'Standard');
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'add_to_cart', {
          currency: 'EUR',
          value: product.price,
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
          currency: 'EUR',
          value: product.price,
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

  const suggestedProducts = products.filter(p => (p.id === '1' || p.id === '2') && p.id !== id);

  if (!isReady) return <div className="min-h-screen bg-background" />;

  return (
    <div className="animate-page-enter">

      {/* ── HERO GRID ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] min-h-screen">

        {/* LEFT — image gallery */}
        <div className="relative bg-black-button/5">
          <div className="lg:sticky lg:top-0 h-[70vw] max-h-[80vh] lg:h-screen overflow-hidden">
            <ImageCarousel
              images={product.images}
              currentIndex={currentImageIndex}
              onIndexChange={setCurrentImageIndex}
              onFullScreenToggle={() => setIsFullScreen(true)}
              objectFit="cover"
            />

            {/* Thumbnails — bottom overlay */}
            {product.images.length > 1 && (
              <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2 px-4 z-20">
                {product.images.map((img, index) => (
                  <button
                    key={img}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-12 h-16 rounded-sm overflow-hidden flex-shrink-0 border-2 transition-all duration-300 ${
                      currentImageIndex === index
                        ? 'border-white scale-110'
                        : 'border-white/30 opacity-60 hover:opacity-90'
                    }`}
                    aria-label={t('product.thumbnailAlt', { index: (index + 1).toString() })}
                  >
                    <ProtectedImage
                      src={img}
                      alt={t('product.thumbnailAlt', { index: (index + 1).toString() })}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — product info */}
        <div className="flex flex-col justify-center px-8 lg:px-14 py-16 lg:py-24">
          <div className="max-w-md">

            <div className="mb-8">
              <BackToCollectionLink />
            </div>

            {/* Tagline */}
            <span className="text-[10px] font-montserrat font-semibold tracking-[0.5em] text-red-button uppercase mb-3 block">
              {t('product.tagline')}
            </span>

            {/* Title + share */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="text-4xl md:text-5xl font-aboreto text-title leading-tight">
                {getLocalized(product.name, locale)}
              </h1>
              <ShareButton
                productId={product.id}
                productName={getLocalized(product.name, locale)}
                className="text-subtitle/50 hover:text-title transition-colors mt-2 flex-shrink-0"
              />
            </div>

            {/* Subtitle */}
            {product.subtitle && (
              <p className="text-xs font-montserrat font-semibold tracking-[0.3em] uppercase text-red-button/70 mb-6">
                {getLocalized(product.subtitle, locale)}
              </p>
            )}

            {/* Price */}
            <p className="text-4xl font-playfair italic text-subtitle mb-8">
              € {product.price.toFixed(2)}
            </p>

            {/* CTAs */}
            <div className="flex flex-col gap-3 mb-10">
              <Button variant="red" onClick={handleAddToCart} className="w-full uppercase tracking-[0.2em] h-14 text-sm">
                {added ? t('product.added') : t('product.addToCart')}
              </Button>
              <Button variant="gray" onClick={handleBuyNow} className="w-full uppercase tracking-[0.15em] h-12 text-xs">
                {t('product.buyNow')}
              </Button>
              {added && (
                <p className="text-center text-green-600 text-sm font-medium animate-fade-in">
                  {t('product.addedSuccess')}
                </p>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-subtitle/10 mb-8" />

            {/* Story */}
            <div className="mb-8">
              <h2 className="text-[10px] font-montserrat font-semibold tracking-[0.5em] text-subtitle/50 uppercase mb-4">
                {t('product.story')}
              </h2>
              <p className={`text-base text-subtitle/80 leading-relaxed font-montserrat whitespace-pre-wrap transition-all duration-500 ${!isDescriptionExpanded ? 'line-clamp-5' : ''}`}>
                {getLocalized(product.description, locale)}
              </p>
              {getLocalized(product.description, locale).length > 150 && (
                <button
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="mt-3 text-[10px] font-bold uppercase tracking-widest text-red-button hover:text-red-button/70 transition-colors flex items-center gap-1"
                >
                  {isDescriptionExpanded ? (
                    <>{t('product.seeLess')} <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg></>
                  ) : (
                    <>{t('product.seeMore')} <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></>
                  )}
                </button>
              )}
            </div>

            {/* Technical details */}
            <div className="bg-black-button/20 rounded-md p-5">
              <h3 className="text-[10px] font-montserrat font-semibold tracking-[0.5em] text-subtitle/50 uppercase mb-3">
                {t('product.details')}
              </h3>
              <ul className="space-y-1.5 text-xs text-subtitle/70 font-montserrat">
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-red-button/50 flex-shrink-0" />
                  {t('product.detailFormat')}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-red-button/50 flex-shrink-0" />
                  {t('product.detailSupport')}
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-red-button/50 flex-shrink-0" />
                  {t('product.detailRender')}
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      {/* ── FULLSCREEN ────────────────────────────────────────────── */}
      {isFullScreen && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] overflow-y-auto animate-fade-in"
          onClick={() => setIsFullScreen(false)}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={() => setIsFullScreen(false)}
            className="fixed top-6 right-6 text-white/80 hover:text-red-button transition-colors z-[101]"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex flex-col items-center py-16 px-4 gap-6" onClick={(e) => e.stopPropagation()}>
            <img
              src={product.images[currentImageIndex]}
              alt={getLocalized(product.name, locale)}
              className="max-w-4xl w-full h-auto object-contain"
            />
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i === currentImageIndex ? 'bg-white scale-125' : 'bg-white/40 hover:bg-white/70'}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SUGGESTIONS ───────────────────────────────────────────── */}
      {suggestedProducts.length > 0 && (
        <div className="container mx-auto px-6 lg:px-16 mt-24 pb-24 border-t border-subtitle/10 pt-16">
          <h2 className="text-2xl font-aboreto text-title text-center mb-12 tracking-widest uppercase">
            {t('product.suggestions.title')}
          </h2>
          <div className="grid grid-cols-2 max-w-3xl mx-auto gap-6 md:gap-12">
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
