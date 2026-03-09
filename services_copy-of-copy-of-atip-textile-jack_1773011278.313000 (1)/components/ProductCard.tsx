
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product, getLocalized} from '../types';
import { useCart } from '../context/CartContext';
import { useLocale } from '../context/LocaleContext';
import ProtectedImage from './ProtectedImage';

interface ProductCardProps {
  product: Product;
  index: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index }) => {
  const { addToCart } = useCart();
  const { locale, t } = useLocale();
  const [added, setAdded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      const favorites = JSON.parse(savedFavorites);
      setIsFavorite(favorites.includes(product.id));
    }
  }, [product.id]);

  const toggleFavorite = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const newFavoriteStatus = !isFavorite;
    setIsFavorite(newFavoriteStatus);
    
    const savedFavorites = localStorage.getItem('favorites');
    let favorites = savedFavorites ? JSON.parse(savedFavorites) : [];
    
    if (newFavoriteStatus) {
      if (!favorites.includes(product.id)) {
        favorites.push(product.id);
      }
    } else {
      favorites = favorites.filter((id: string) => id !== product.id);
    }
    
    localStorage.setItem('favorites', JSON.stringify(favorites));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 'Standard');
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    setIsMenuOpen(false);
  };

  const handleShare = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const productPath = `#/product/${product.id}`;
    const base = window.location.href.split('#')[0];
    const url = new URL(productPath, base).href;
    const shareData = {
        title: t('share.shareTextTitle', { productName: getLocalized(product.name, locale) }),
        text: t('share.shareTextBody', { productName: getLocalized(product.name, locale) }),
        url: url,
    };
    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (err) {
            console.log('Share failed.', err);
        }
    } else {
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }
    setIsMenuOpen(false);
  };

  const toggleMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="group block h-full">
      <Link to={`/product/${product.id}`} className="block relative h-full">
        <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-black-button/10 shadow-md">
            {!isImageLoaded && (
                <div className="absolute inset-0 bg-title/10 animate-pulse-soft z-0" />
            )}
            <div className={`absolute inset-0 transition-all duration-1000 ease-out transform group-hover:scale-105 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}>
                <ProtectedImage
                    src={product.images[0]}
                    alt={`Toile textile ATIP : ${getLocalized(product.name, locale)} - Artisanat d'exception sur coton de satin`}
                    loading="lazy"
                    className="object-cover w-full h-full"
                    onLoad={() => setIsImageLoaded(true)}
                />
            </div>
            
            <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent transition-opacity duration-700 ${isImageLoaded ? 'opacity-90 group-hover:opacity-100' : 'opacity-0'}`} />
            
            <div className={`absolute top-3 left-3 z-30 transition-opacity duration-500 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}>
                <button
                    onClick={toggleFavorite}
                    className={`p-2 rounded-full backdrop-blur-md transition-all duration-300 shadow-sm border border-white/20 hover:bg-white/20 bg-black/10 text-white/80 opacity-0 group-hover:opacity-100 ${isFavorite ? 'text-red-500 opacity-100' : ''}`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-colors duration-300 ${isFavorite ? 'fill-current' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                </button>
            </div>

            <div className={`absolute inset-x-0 bottom-0 p-4 md:p-6 text-white z-10 flex flex-col justify-end items-center pointer-events-none transition-all duration-700 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}>
                 <h3 className="text-lg md:text-xl font-aboreto font-bold tracking-[0.1em] uppercase leading-tight text-center drop-shadow-lg w-full transition-transform duration-700 group-hover:translate-y-[-8px]">
                    {getLocalized(product.name, locale)}
                 </h3>
                 {product.subtitle && (
                    <p className="text-[10px] md:text-xs font-montserrat font-semibold tracking-[0.2em] uppercase text-white/70 mt-1 drop-shadow-md text-center transition-transform duration-700 delay-50 group-hover:translate-y-[-8px]">
                        {getLocalized(product.subtitle, locale)}
                    </p>
                 )}
                 <p className="text-sm md:text-base font-playfair italic text-white/80 mt-2 font-medium drop-shadow-md text-center transition-transform duration-700 delay-75 group-hover:translate-y-[-8px]">
                    € {product.price.toFixed(2)}
                 </p>
                 <div className="mt-4 w-12 h-px bg-white/30 group-hover:w-24 transition-all duration-700"></div>
            </div>
            
            <div className={`absolute top-3 right-3 z-30 transition-opacity duration-500 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`} ref={menuRef}>
                <button
                    onClick={toggleMenu}
                    className={`p-2 rounded-full backdrop-blur-md transition-all duration-300 shadow-sm border border-white/20 hover:bg-white/20 ${
                        isMenuOpen ? 'bg-white/20 text-white opacity-100' : 'bg-black/10 text-white/80 opacity-0 group-hover:opacity-100'
                    }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                </button>
                <div className={`absolute right-0 mt-2 w-48 bg-background/95 backdrop-blur-xl rounded-md shadow-2xl ring-1 ring-black ring-opacity-5 transition-all duration-200 overflow-hidden ${isMenuOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'}`}>
                    <div className="py-1" role="none">
                        <button onClick={handleAddToCart} className="w-full text-left px-4 py-3 text-xs font-aboreto uppercase tracking-widest text-subtitle hover:bg-black-button/20 hover:text-title flex items-center gap-3 transition-colors">
                             {added ? (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                    <span className="text-green-600 font-medium">{t('product.added')}</span>
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                                    <span>{t('product.addToCart')}</span>
                                </>
                            )}
                        </button>
                        <button onClick={handleShare} className="w-full text-left px-4 py-3 text-xs font-aboreto uppercase tracking-widest text-subtitle hover:bg-black-button/20 hover:text-title flex items-center gap-3 transition-colors">
                            {copied ? (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                    <span className="text-green-600 font-medium">{t('share.copied')}</span>
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
                                    <span>{t('share.title')}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </Link>
    </div>
  );
};

export default ProductCard;
