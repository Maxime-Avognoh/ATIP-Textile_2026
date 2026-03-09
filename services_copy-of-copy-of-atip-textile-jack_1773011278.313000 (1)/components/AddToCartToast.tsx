
import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLocale } from '../context/LocaleContext';

const AddToCartToast: React.FC = () => {
    const { lastAddedItem, setLastAddedItem } = useCart();
    const { locale, t } = useLocale();

    if (!lastAddedItem) {
        return null;
    }

    const handleClose = () => {
        setLastAddedItem(null);
    };

    return (
        <div 
            className="fixed bottom-5 right-5 z-[100] w-full max-w-sm bg-background shadow-2xl rounded-lg overflow-hidden flex items-center p-4 animate-slide-in-up border border-black-button"
            role="alert"
            aria-live="assertive"
        >
            <img src={lastAddedItem.images[0]} alt={lastAddedItem.name[locale]} className="w-16 h-20 object-cover rounded-md flex-shrink-0" />
            <div className="ml-4 flex-grow">
                <p className="text-sm font-semibold text-title/90">{t('product.added')}</p>
                <p className="text-subtitle/90 truncate">{lastAddedItem.name[locale]}</p>
                <Link 
                    to="/cart" 
                    onClick={handleClose} 
                    className="text-sm font-bold text-red-button hover:underline mt-1 inline-flex items-center gap-1.5"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {t('cart.viewCart')}
                </Link>
            </div>
            <button onClick={handleClose} className="ml-4 p-1 text-subtitle/60 hover:text-subtitle transition-colors flex-shrink-0" aria-label="Close notification">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};

export default AddToCartToast;
