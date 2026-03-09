
import React, { useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useLocale } from '../context/LocaleContext';
import { CartItem } from '../types';
import Button from '../components/Button';

const OrderConfirmationPage: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { t, locale } = useLocale();
    const { order } = location.state || {};
    
    useEffect(() => {
        if (!order) {
            navigate('/');
        }
    }, [order, navigate]);

    if (!order) return null;

    const { orderNumber, shippingInfo, billingInfo, items, total } = order;
    const isBillingSameAsShipping = billingInfo && shippingInfo && 
        billingInfo.fullName === shippingInfo.fullName &&
        billingInfo.address === shippingInfo.address &&
        billingInfo.city === shippingInfo.city &&
        billingInfo.postalCode === shippingInfo.postalCode &&
        billingInfo.country === shippingInfo.country;

    return (
        <div className="max-w-4xl mx-auto pt-32 pb-12 px-4 text-center animate-fade-in">
            <div>
                <svg className="w-16 h-16 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <h1 className="text-4xl font-aboreto text-title mt-4">{t('confirmation.title')}</h1>
                <p className="text-lg text-subtitle/80 mt-2">{t('confirmation.subtitle')}</p>
                <p className="text-lg text-subtitle font-semibold mt-4">
                    {t('confirmation.orderNumber')}: <span className="font-mono text-title/90">{orderNumber}</span>
                </p>
            </div>

            <div className="mt-12 text-left bg-black-button/20 shadow-xl rounded-lg p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h2 className="text-xl font-aboreto text-title mb-4">{t('confirmation.shippingTo')}</h2>
                        <div className="text-subtitle/90 leading-relaxed mb-6">
                            <p className="font-semibold">{shippingInfo.fullName}</p>
                            <p>{shippingInfo.address}</p>
                            <p>{shippingInfo.city}, {shippingInfo.postalCode}</p>
                            <p>{shippingInfo.country}</p>
                            <p>{shippingInfo.email}</p>
                        </div>
                        {billingInfo && !isBillingSameAsShipping && (
                            <>
                                <h2 className="text-xl font-aboreto text-title mb-4">{t('confirmation.billingTo')}</h2>
                                <div className="text-subtitle/90 leading-relaxed">
                                    <p className="font-semibold">{billingInfo.fullName}</p>
                                    <p>{billingInfo.address}</p>
                                    <p>{billingInfo.city}, {billingInfo.postalCode}</p>
                                    <p>{billingInfo.country}</p>
                                </div>
                            </>
                        )}
                        {isBillingSameAsShipping && (
                             <p className="text-subtitle/70 text-sm italic mt-2">{t('checkout.billing.sameAsShipping')}</p>
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-aboreto text-title mb-4">{t('confirmation.orderSummary')}</h2>
                         <div className="text-subtitle/90">
                            {items.map((item: CartItem) => (
                                <div key={item.cartItemId} className="flex justify-between items-baseline mb-1">
                                    <span>{item.name[locale]} ({item.format}) x {item.quantity}</span>
                                    <span className="font-semibold">€{(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                            <div className="flex justify-between items-baseline mt-4 pt-4 border-t border-subtitle/20 font-bold text-title text-lg">
                                 <span>{t('cart.total')}</span>
                                 <span>€{total.toFixed(2)}</span>
                            </div>
                         </div>
                    </div>
                </div>
            </div>

            <div className="mt-12">
                <Link to="/">
                    <Button variant="red">{t('confirmation.backToShop')}</Button>
                </Link>
            </div>
        </div>
    );
};

export default OrderConfirmationPage;
