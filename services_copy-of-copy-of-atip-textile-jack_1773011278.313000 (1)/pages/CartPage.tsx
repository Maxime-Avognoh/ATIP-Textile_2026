
import React from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import BackToCollectionLink from '../components/BackToCollectionLink';
import { useLocale } from '../context/LocaleContext';
import ProtectedImage from '../components/ProtectedImage';

const CartPage: React.FC = () => {
  const { cartItems, removeFromCart, getCartTotal, updateQuantity } = useCart();
  const { locale, t } = useLocale();

  const handleInputChange = (id: string, value: string) => {
    const newQuantity = parseInt(value, 10);
    if (!isNaN(newQuantity) && newQuantity > 0) {
      updateQuantity(id, newQuantity);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="text-center pt-32 pb-20 px-4 animate-fade-in">
        <h1 className="text-4xl font-aboreto text-title mb-4">{t('cart.empty.title')}</h1>
        <p className="text-subtitle/80 mb-8">{t('cart.empty.message')}</p>
        <Link to="/" className="inline-flex items-center gap-2 text-subtitle/80 hover:text-subtitle text-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          {t('backToCollection')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pt-32 pb-12 px-4 animate-fade-in">
      <BackToCollectionLink />
      <h1 className="text-4xl font-aboreto text-title text-center mb-12">{t('cart.title')}</h1>
      <div className="bg-black-button/20 shadow-xl rounded-lg overflow-hidden">
        <div className="divide-y divide-subtitle/10">
          {cartItems.map(item => (
            <div key={item.cartItemId} className="flex flex-col sm:flex-row items-start sm:items-center p-4 sm:p-6 gap-4">
              <div className="w-24 h-32 flex-shrink-0 self-center sm:self-auto rounded-md overflow-hidden">
                <ProtectedImage 
                    src={item.images[0]} 
                    alt={item.name[locale]} 
                    loading="lazy" 
                    className="w-full h-full object-cover" 
                />
              </div>
              <div className="flex-grow">
                <h2 className="text-xl font-aboreto text-title">{item.name[locale]}</h2>
                <p className="text-sm text-subtitle/70">{item.format}</p>
                <div className="flex items-center gap-2 mt-2">
                    <span className="text-subtitle/80 mr-2">{t('cart.quantity')}</span>
                    <button 
                        onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)} 
                        className="w-8 h-8 flex items-center justify-center bg-background/50 hover:bg-background/80 text-subtitle rounded-md transition-colors"
                        aria-label="Decrease quantity"
                    >
                        -
                    </button>
                    <input 
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleInputChange(item.cartItemId, e.target.value)}
                        className="w-16 bg-white dark:bg-black-button text-subtitle border border-subtitle/20 rounded-md text-center py-1 focus:outline-none focus:ring-1 focus:ring-red-button"
                        aria-label="Item quantity"
                    />
                    <button 
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)} 
                        className="w-8 h-8 flex items-center justify-center bg-background/50 hover:bg-background/80 text-subtitle rounded-md transition-colors"
                        aria-label="Increase quantity"
                    >
                        +
                    </button>
                </div>
              </div>
              <div className="text-right self-end sm:self-center w-full sm:w-auto">
                 <p className="flex items-baseline justify-end text-lg font-semibold text-subtitle/90">
                    <span>€</span>
                    <span>{(item.price * item.quantity).toFixed(2)}</span>
                  </p>
                 <button onClick={() => removeFromCart(item.cartItemId)} className="text-sm text-red-button/80 hover:text-red-button hover:underline transition-colors mt-1">
                   {t('cart.remove')}
                 </button>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-black-button/30 p-6">
          <div className="flex justify-end items-baseline gap-4">
             <span className="text-2xl font-playfair text-subtitle">{t('cart.total')}</span>
             <span className="flex items-baseline text-3xl font-semibold text-title">
                <span>€</span>
                <span>{getCartTotal().toFixed(2)}</span>
             </span>
          </div>
          <div className="flex justify-end mt-6">
            <Link to="/checkout">
              <Button variant="red">
                {t('cart.checkout')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
