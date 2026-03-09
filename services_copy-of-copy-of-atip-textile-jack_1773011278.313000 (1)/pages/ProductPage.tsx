import { getLocalized } from '../types';

import React, { useState, useEffect, useLayoutEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
    if (isFullScreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isFullScreen]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, 'Standard');
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    }
  };
  
  const handleBuyNow = () => {
    if (product) {
      addToCart(product, 'Standard');
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

  const suggestedProducts = products
    .filter(p => (p.id === '1' || p.id === '2') && p.id !== id);

  if (!isReady) return <div className="min-h-screen bg-background" />;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12 max-w-7xl animate-fade-in">
      <div className="mb-8">
        <BackToCollectionLink />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-6">
          {product.images.length > 1 && (
            <div className="flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto hide-scrollbar md:h-[600px] py-2 px-1">
              {product.images.map((img, index) => (
                <button
                  key={img}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative w-20 h-24 md:w-24 md:h-32 rounded-sm overflow-hidden flex-shrink-0 transition-all duration-300 ${
                    currentImageIndex === index 
                      ? 'ring-2 ring-red-button ring-offset-2 ring-offset-background' 
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  aria-label={t('product.thumbnailAlt', { index: (index + 1).toString() })}
                >
                  <ProtectedImage src={img} alt={t('product.thumbnailAlt', { index: (index + 1).toString() })} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          <div className="flex-1">
            <div className="aspect-[3/4] rounded-sm overflow-hidden shadow-2xl bg-black-button/10 relative">
                <div className="absolute inset-0 bg-title/5 animate-pulse-soft z-0" />
                <ImageCarousel images={product.images} currentIndex={currentImageIndex} onIndexChange={setCurrentImageIndex} onFullScreenToggle={() => setIsFullScreen(true)} objectFit="cover" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col justify-center">
          <div className="mb-2 stagger-1">
            <span className="text-xs font-bold tracking-widest text-red-button uppercase mb-2 block">{t('product.tagline')}</span>
            <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col">
                    <h1 className="text-4xl md:text-5xl font-aboreto text-title leading-tight">{getLocalized(product.name, locale)}</h1>
                    {product.subtitle && (
                        <p className="text-sm font-montserrat font-semibold tracking-[0.2em] uppercase text-red-button/70 mt-2">
                            {getLocalized(product.subtitle, locale)}
                        </p>
                    )}
                </div>
                <ShareButton productId={product.id} productName={getLocalized(product.name, locale)} className="text-subtitle/60 hover:text-title transition-colors mt-2" />
            </div>
          </div>
          <p className="text-3xl font-playfair italic text-subtitle/90 mb-8 border-b border-subtitle/10 pb-6 stagger-2">€ {product.price.toFixed(2)}</p>
          
          <div className="space-y-8 stagger-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-red-button/70 mb-3">{t('product.story')}</h2>
              <div className="relative">
                <p className={`text-lg text-subtitle leading-loose font-montserrat whitespace-pre-wrap transition-all duration-500 ${!isDescriptionExpanded ? 'line-clamp-4' : ''}`}>
                  {getLocalized(product.description, locale)}
                </p>
                {getLocalized(product.description, locale).length > 150 && (
                  <button 
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="mt-2 text-xs font-bold uppercase tracking-widest text-red-button hover:text-red-button/80 transition-colors flex items-center gap-1"
                  >
                    {isDescriptionExpanded ? (
                      <>
                        {t('product.seeLess')}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </>
                    ) : (
                      <>
                        {t('product.seeMore')}
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            
            <div className="bg-black-button/10 p-4 rounded-sm border-l-2 border-red-button/30">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-subtitle/60 mb-2">{t('product.details')}</h3>
              <ul className="text-xs space-y-1 text-subtitle/80 font-aboreto">
                <li>• {t('product.detailFormat')}</li>
                <li>• {t('product.detailSupport')}</li>
                <li>• {t('product.detailRender')}</li>
              </ul>
            </div>
          </div>
          
          <div className="space-y-4 mt-12 stagger-5">
            <Button variant="red" onClick={handleAddToCart} className="w-full uppercase tracking-[0.2em]">{added ? t('product.added') : t('product.addToCart')}</Button>
            <Button variant="gray" onClick={handleBuyNow} className="w-full uppercase h-12 tracking-[0.1em]">{t('product.buyNow')}</Button>
          </div>
          {added && <p className="mt-4 text-center text-green-600 font-medium animate-fade-in">{t('product.addedSuccess')}</p>}
        </div>
      </div>

      {isFullScreen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsFullScreen(false)} role="dialog" aria-modal="true">
          <button onClick={() => setIsFullScreen(false)} className="absolute top-6 right-6 text-white/80 hover:text-red-button transition-colors z-[101]">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="relative w-full h-full max-w-7xl flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
             <ImageCarousel images={product.images} currentIndex={currentImageIndex} onIndexChange={setCurrentImageIndex} objectFit="contain" />
          </div>
        </div>
      )}

      {suggestedProducts.length > 0 && (
        <div className="mt-32 border-t border-subtitle/10 pt-16">
          <h2 className="text-3xl font-aboreto text-title text-center mb-16 tracking-widest uppercase">{t('product.suggestions.title')}</h2>
          <div className="grid grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto gap-x-3 gap-y-8 md:gap-x-12 md:gap-y-12">
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
