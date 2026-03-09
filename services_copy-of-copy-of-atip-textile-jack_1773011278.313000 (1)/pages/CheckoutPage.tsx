

// import React, { useState, useRef, useEffect, useCallback } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { useCart } from '../context/CartContext';
// import { useLocale } from '../context/LocaleContext';
// import { useAuth } from '../context/AuthContext';
// import Button from '../components/Button';
// import SquarePaymentForm, { SquarePaymentFormRef } from '../components/SquarePaymentForm';
import PayPalButton from '../components/PayPalButton';
// import { CartItem, Order, ContactInfo } from '../types';


// interface InputFieldProps {
//     name: keyof ContactInfo;
//     label: string;
//     value: string;
//     onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
//     required?: boolean;
//     type?: string
// }


// const InputField: React.FC<InputFieldProps> = ({ name, label, value, onChange, required = true, type = 'text' }) => {
//     const hasValue = value && value.length > 0;


//     return (
//         <div className="relative group">
//             <label
//                 htmlFor={name}
//                 className={`
//                     absolute left-3 transition-all duration-200 pointer-events-none text-subtitle/70
//                     group-focus-within:top-2 group-focus-within:text-xs group-focus-within:text-red-button
//                     ${hasValue ? 'top-2 text-xs' : 'top-1/2 -translate-y-1/2 text-base'}
//                 `}
//             >
//                 {label}
//             </label>
//             <input
//                 type={type}
//                 id={name}
//                 name={name}
//                 value={value}
//                 onChange={onChange}
//                 required={required}
//                 className="h-[52px] block w-full bg-white dark:bg-black-button border border-subtitle/20 rounded-md shadow-sm pt-5 pb-2 px-3 text-title focus:outline-none focus:ring-1 focus:ring-red-button focus:border-red-button"
//             />
//         </div>
//     );
// };


// const CheckoutPage: React.FC = () => {
//     const { cartItems, getCartTotal, clearCart } = useCart();
//     const { locale, t } = useLocale();
//     const { currentUser } = useAuth();
//     const navigate = useNavigate();
//     const paymentFormRef = useRef<SquarePaymentFormRef>(null);


//     const [shippingInfo, setShippingInfo] = useState<ContactInfo>({
//         fullName: '', email: '', address: '', city: '', postalCode: '', country: ''
//     });
   
//     const [billingInfo, setBillingInfo] = useState<ContactInfo>({
//         fullName: '', email: '', address: '', city: '', postalCode: '', country: ''
//     });


//     const [sameAsShipping, setSameAsShipping] = useState(true);
//     const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
//     const [isProcessing, setIsProcessing] = useState(false);
//     const [paymentError, setPaymentError] = useState<string | null>(null);


//     useEffect(() => {
//         if (cartItems.length === 0) {
//             navigate('/');
//         }
//         if (currentUser && currentUser.email) {
//             setShippingInfo(prev => ({ ...prev, email: currentUser.email! }));
//             setBillingInfo(prev => ({ ...prev, email: currentUser.email! }));
//         }
//     }, [cartItems, navigate, currentUser]);


//     const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const { name, value } = e.target;
//         setShippingInfo(prev => ({ ...prev, [name]: value }));
//     };


//     const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const { name, value } = e.target;
//         setBillingInfo(prev => ({ ...prev, [name]: value }));
//     };


//     const handleSameAsShippingToggle = () => {
//         setSameAsShipping(prev => !prev);
//     };


//     const processOrderAfterPayment = useCallback((paymentResult: any) => {
//         setIsProcessing(true);
//         setTimeout(() => {
//             const finalBillingInfo = sameAsShipping ? shippingInfo : billingInfo;
//             const orderDetails: Order = {
//                 orderNumber: paymentResult.orderId || `ATIP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
//                 shippingInfo,
//                 billingInfo: finalBillingInfo,
//                 items: cartItems,
//                 total: getCartTotal(),
//                 date: new Date().toISOString(),
//                 status: 'Processing'
//             };


//             if (currentUser) {
//                 try {
//                     const storageKey = `orders_${currentUser.uid}`;
//                     const existingOrders = JSON.parse(localStorage.getItem(storageKey) || '[]');
//                     const updatedOrders = [orderDetails, ...existingOrders];
//                     localStorage.setItem(storageKey, JSON.stringify(updatedOrders));
//                 } catch (err) {
//                     console.error("Failed to save order to history", err);
//                 }
//             }


//             clearCart();
//             setIsProcessing(false);
//             navigate('/confirmation', { state: { order: orderDetails } });
//         }, 1500);
//     }, [shippingInfo, billingInfo, sameAsShipping, cartItems, getCartTotal, clearCart, navigate, currentUser]);


//     const handlePaymentSuccess = useCallback((result: any) => {
//         processOrderAfterPayment(result);
//     }, [processOrderAfterPayment]);
   
//     const handlePaymentFailure = useCallback((error: string) => {
//         setIsProcessing(false);
//         setPaymentError(error);
//         if (error.includes('SDK failed')) {
//             navigate('/payment-failure');
//         }
//     }, [navigate]);


//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         setIsProcessing(true);
//         setPaymentError(null);


//         if (paymentMethod === 'paypal') {
//             setTimeout(() => {
//                 processOrderAfterPayment({ orderId: 'PP-' + Date.now() });
//             }, 2000);
//         } else {
//             if (paymentFormRef.current) {
//                 try {
//                     await paymentFormRef.current.handlePayment();
//                 } catch (err) {
//                     setIsProcessing(false);
//                 }
//             } else {
//                 handlePaymentFailure("Payment component not loaded.");
//             }
//         }
//     };
   
//     if (cartItems.length === 0) return null;


//     const totalInCents = Math.round(getCartTotal() * 100);


//     return (
//         <div className="max-w-7xl mx-auto pt-32 pb-12 px-4 animate-fade-in">
//             <div className="mb-8">
//                 <Link to="/cart" className="inline-flex items-center gap-2 text-subtitle/80 hover:text-subtitle transition-colors">
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                     <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
//                   </svg>
//                   {t('checkout.backToCart')}
//                 </Link>
//             </div>
//             <h1 className="text-4xl font-aboreto text-title text-center mb-12">{t('checkout.title')}</h1>
//             <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 lg:gap-16">
//                 <div className="lg:col-span-1">
//                     <section className="mb-12">
//                         <div className="flex justify-between items-center mb-6">
//                             <h2 className="text-2xl font-aboreto text-title">{t('checkout.shipping.title')}</h2>
//                             {!currentUser && (
//                                 <Link to="/login" className="text-sm text-red-button hover:underline">
//                                     {t('auth.login.submit')}
//                                 </Link>
//                             )}
//                         </div>
//                         <div className="space-y-6">
//                             <InputField name="email" label={t('checkout.contact.email')} type="email" value={shippingInfo.email} onChange={handleShippingChange} />
//                             <InputField name="fullName" label={t('checkout.shipping.name')} value={shippingInfo.fullName} onChange={handleShippingChange} />
//                             <InputField name="address" label={t('checkout.shipping.address')} value={shippingInfo.address} onChange={handleShippingChange} />
//                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                 <InputField name="city" label={t('checkout.shipping.city')} value={shippingInfo.city} onChange={handleShippingChange} />
//                                 <InputField name="postalCode" label={t('checkout.shipping.postalCode')} value={shippingInfo.postalCode} onChange={handleShippingChange} />
//                             </div>
//                             <InputField name="country" label={t('checkout.shipping.country')} value={shippingInfo.country} onChange={handleShippingChange} />
//                         </div>
//                     </section>


//                     <section className="mb-12">
//                         <h2 className="text-2xl font-aboreto text-title mb-6">{t('checkout.billing.title')}</h2>
//                         <div className="space-y-6">
//                             <div className="flex items-center">
//                                 <input id="same-as-shipping" type="checkbox" checked={sameAsShipping} onChange={handleSameAsShippingToggle} className="h-5 w-5 text-red-button focus:ring-red-button border-subtitle/20 rounded" />
//                                 <label htmlFor="same-as-shipping" className="ml-2 block text-subtitle/90 text-sm cursor-pointer">
//                                     {t('checkout.billing.sameAsShipping')}
//                                 </label>
//                             </div>
//                             {!sameAsShipping && (
//                                 <div className="space-y-6 animate-fade-in">
//                                     <InputField name="fullName" label={t('checkout.shipping.name')} value={billingInfo.fullName} onChange={handleBillingChange} />
//                                     <InputField name="address" label={t('checkout.shipping.address')} value={billingInfo.address} onChange={handleShippingChange} />
//                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                                         <InputField name="city" label={t('checkout.shipping.city')} value={billingInfo.city} onChange={handleBillingChange} />
//                                         <InputField name="postalCode" label={t('checkout.shipping.postalCode')} value={billingInfo.postalCode} onChange={handleBillingChange} />
//                                     </div>
//                                     <InputField name="country" label={t('checkout.shipping.country')} value={billingInfo.country} onChange={handleBillingChange} />
//                                 </div>
//                             )}
//                         </div>
//                     </section>


//                     <section>
//                          <h2 className="text-2xl font-aboreto text-title mb-6">{t('checkout.payment.title')}</h2>
//                          <div className="space-y-4 mb-6">
//                             <div className={`flex items-center p-4 border rounded-md cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-red-button bg-red-button/5' : 'border-subtitle/20 hover:border-subtitle/40'}`} onClick={() => setPaymentMethod('card')}>
//                                 <input type="radio" name="paymentMethod" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="h-5 w-5 text-red-button focus:ring-red-button border-subtitle/20" />
//                                 <div className="ml-3 flex items-center justify-between w-full">
//                                     <span className="font-medium text-title">{t('checkout.payment.method.card')}</span>
//                                     <svg className="h-6 w-6 text-subtitle/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3-3v8a3 3 0 003 3z" /></svg>
//                                 </div>
//                             </div>
//                             <div className={`flex items-center p-4 border rounded-md cursor-pointer transition-colors ${paymentMethod === 'paypal' ? 'border-red-button bg-red-button/5' : 'border-subtitle/20 hover:border-subtitle/40'}`} onClick={() => setPaymentMethod('paypal')}>
//                                 <input type="radio" name="paymentMethod" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} className="h-5 w-5 text-red-button focus:ring-red-button border-subtitle/20" />
//                                 <div className="ml-3 flex items-center justify-between w-full">
//                                     <span className="font-medium text-title">{t('checkout.payment.method.paypal')}</span>
//                                     <svg className="h-6 w-6 text-subtitle/70" fill="currentColor" viewBox="0 0 24 24"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.946 5.05-4.336 6.794-9.116 6.794H9.468a.5.5 0 0 0-.5.544l1.049 6.72a.5.5 0 0 1-.497.578h-.001a.5.5 0 0 1-.444-.334l.001.005z"/></svg>
//                                 </div>
//                             </div>
//                          </div>
//                          <div className="mt-6">
//                              {paymentMethod === 'card' ? (
//                                  <SquarePaymentForm ref={paymentFormRef} amount={totalInCents} onPaymentSuccess={handlePaymentSuccess} onPaymentFailure={handlePaymentFailure} />
//                              ) : (
//                                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-md text-center border border-blue-100 dark:border-blue-900/30">
//                                      <p className="text-subtitle/80">{t('checkout.payment.paypalInfo')}</p>
//                                  </div>
//                              )}
//                          </div>
//                     </section>
//                 </div>
//                 <div className="lg:col-span-1 mt-12 lg:mt-0">
//                      <div className="bg-black-button/20 shadow-xl rounded-lg p-6 sticky top-28">
//                         <h2 className="text-2xl font-aboreto text-title mb-6">{t('checkout.orderSummary.title')}</h2>
//                         <div className="space-y-4 divide-y divide-subtitle/10">
//                             {cartItems.map((item: CartItem) => (
//                                 <div key={item.cartItemId} className="flex items-center gap-4 pt-4 first:pt-0">
//                                     <img src={item.images[0]} alt={item.name[locale]} className="w-16 h-20 object-cover rounded-md"/>
//                                     <div className="flex-grow">
//                                         <p className="text-title font-semibold">{item.name[locale]}</p>
//                                         <p className="text-sm text-subtitle/80">{item.format}</p>
//                                         <p className="text-sm text-subtitle/80">{t('cart.quantity')} {item.quantity}</p>
//                                     </div>
//                                     <p className="font-semibold text-subtitle/90">€{(item.price * item.quantity).toFixed(2)}</p>
//                                 </div>
//                             ))}
//                         </div>
//                         <div className="mt-6 pt-6 border-t border-subtitle/20 space-y-2">
//                             <div className="flex justify-between text-subtitle/90"><span>{t('checkout.orderSummary.subtotal')}</span><span>€{getCartTotal().toFixed(2)}</span></div>
//                             <div className="flex justify-between text-subtitle/90"><span>{t('checkout.orderSummary.shipping')}</span><span>{t('checkout.orderSummary.shippingFree')}</span></div>
//                             <div className="flex justify-between text-2xl font-bold text-title pt-2"><span>{t('checkout.orderSummary.total')}</span><span>€{getCartTotal().toFixed(2)}</span></div>
//                         </div>
//                     </div>
//                 </div>
//                 <div className="lg:col-start-1 mt-8">
//                      {paymentError && <p className="text-red-500 mb-4 text-center lg:text-left">{paymentError}</p>}
//                     <Button variant="red" type="submit" className="w-full" disabled={isProcessing}>
//                         {isProcessing ? t('checkout.processing') : (paymentMethod === 'paypal' ? t('checkout.proceedToPaypal') : t('checkout.payButton'))}
//                     </Button>
//                 </div>
//             </form>
//         </div>
//     );
// };


// export default CheckoutPage;






import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLocale } from '../context/LocaleContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import SquarePaymentForm, { SquarePaymentFormRef } from '../components/SquarePaymentForm';
import { CartItem, Order, ContactInfo } from '../types';


interface InputFieldProps {
    name: keyof ContactInfo;
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    type?: string
}


const InputField: React.FC<InputFieldProps> = ({ name, label, value, onChange, required = true, type = 'text' }) => {
    const hasValue = value && value.length > 0;


    return (
        <div className="relative group">
            <label
                htmlFor={name}
                className={`
                    absolute left-3 transition-all duration-200 pointer-events-none text-subtitle/70
                    group-focus-within:top-2 group-focus-within:text-xs group-focus-within:text-red-button
                    ${hasValue ? 'top-2 text-xs' : 'top-1/2 -translate-y-1/2 text-base'}
                `}
            >
                {label}
            </label>
            <input
                type={type}
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                required={required}
                className="h-[52px] block w-full bg-white dark:bg-black-button border border-subtitle/20 rounded-md shadow-sm pt-5 pb-2 px-3 text-title focus:outline-none focus:ring-1 focus:ring-red-button focus:border-red-button"
            />
        </div>
    );
};


const CheckoutPage: React.FC = () => {
    const { cartItems, getCartTotal, clearCart } = useCart();
    const { locale, t } = useLocale();
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const paymentFormRef = useRef<SquarePaymentFormRef>(null);


    const cartPayload = cartItems.map((item) => ({
  id: item.id,
  qty: item.quantity ?? 1,
}));




    const [shippingInfo, setShippingInfo] = useState<ContactInfo>({
        fullName: '', email: '', phone: '', address: '', city: '', postalCode: '', country: ''
    });

    const [billingInfo, setBillingInfo] = useState<ContactInfo>({
        fullName: '', email: '', phone: '', address: '', city: '', postalCode: '', country: ''
    });


    const [sameAsShipping, setSameAsShipping] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [orderCompleting, setOrderCompleting] = useState(false);


    const orderCustomerContext = {
        shippingInfo,
        billingInfo: sameAsShipping ? shippingInfo : billingInfo,
        sameAsShipping,
        paymentMethod,
    };


    useEffect(() => {
        if (cartItems.length === 0 && !orderCompleting) {
            navigate('/');
        }
        if (currentUser && currentUser.email) {
            setShippingInfo(prev => ({ ...prev, email: currentUser.email! }));
            setBillingInfo(prev => ({ ...prev, email: currentUser.email! }));
        }
    }, [cartItems, navigate, currentUser]);


    const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setShippingInfo(prev => ({ ...prev, [name]: value }));
    };


    const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setBillingInfo(prev => ({ ...prev, [name]: value }));
    };


    const handleSameAsShippingToggle = () => {
        setSameAsShipping(prev => !prev);
    };


    const processOrderAfterPayment = useCallback((paymentResult: any) => {
        setIsProcessing(true);
        setTimeout(() => {
            const finalBillingInfo = sameAsShipping ? shippingInfo : billingInfo;
            const orderDetails: Order = {
                orderNumber: paymentResult.orderId || `ATIP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                shippingInfo,
                billingInfo: finalBillingInfo,
                items: cartItems,
                total: getCartTotal(),
                date: new Date().toISOString(),
                status: 'Processing'
            };


            if (currentUser) {
                try {
                    const storageKey = `orders_${currentUser.uid}`;
                    const existingOrders = JSON.parse(localStorage.getItem(storageKey) || '[]');
                    const updatedOrders = [orderDetails, ...existingOrders];
                    localStorage.setItem(storageKey, JSON.stringify(updatedOrders));
                } catch (err) {
                    console.error("Failed to save order to history", err);
                }
            }


            setOrderCompleting(true);
            clearCart();
            setIsProcessing(false);
            navigate('/confirmation', { state: { order: orderDetails } });
        }, 1500);
    }, [shippingInfo, billingInfo, sameAsShipping, cartItems, getCartTotal, clearCart, navigate, currentUser]);


    const handlePaymentSuccess = useCallback((result: any) => {
        processOrderAfterPayment(result);
    }, [processOrderAfterPayment]);
   
    const handlePaymentFailure = useCallback((error: string) => {
        setIsProcessing(false);
        setPaymentError(error);
        if (error.includes('SDK failed')) {
            navigate('/payment-failure');
        }
    }, [navigate]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (paymentMethod === 'paypal') {
            return;
        }


        setIsProcessing(true);
        setPaymentError(null);


        if (paymentFormRef.current) {
            try {
                await paymentFormRef.current.handlePayment();
            } catch (err) {
                setIsProcessing(false);
            }
        } else {
            handlePaymentFailure("Payment component not loaded.");
        }
    };
   
    if (cartItems.length === 0) return null;


    const totalInCents = Math.round(getCartTotal() * 100);


    return (
        <div className="max-w-7xl mx-auto pt-32 pb-12 px-4 animate-fade-in">
            <div className="mb-8">
                <Link to="/cart" className="inline-flex items-center gap-2 text-subtitle/80 hover:text-subtitle transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {t('checkout.backToCart')}
                </Link>
            </div>
            <h1 className="text-4xl font-aboreto text-title text-center mb-12">{t('checkout.title')}</h1>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 lg:gap-16">
                <div className="lg:col-span-1">
                    <section className="mb-12">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-aboreto text-title">{t('checkout.shipping.title')}</h2>
                           
                           {/*} {!currentUser && (
                                <Link to="/login" className="text-sm text-red-button hover:underline">
                                    {t('auth.login.submit')}
                                </Link>
                            )}


                            */}


                        </div>
                        <div className="space-y-6">
                            <InputField name="email" label={t('checkout.contact.email')} type="email" value={shippingInfo.email} onChange={handleShippingChange} />
                            <InputField name="phone" label={t('checkout.contact.phone')} type="tel" value={shippingInfo.phone || ''} onChange={handleShippingChange} />
                            <InputField name="fullName" label={t('checkout.shipping.name')} value={shippingInfo.fullName} onChange={handleShippingChange} />
                            <InputField name="address" label={t('checkout.shipping.address')} value={shippingInfo.address} onChange={handleShippingChange} />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputField name="city" label={t('checkout.shipping.city')} value={shippingInfo.city} onChange={handleShippingChange} />
                                <InputField name="postalCode" label={t('checkout.shipping.postalCode')} value={shippingInfo.postalCode} onChange={handleShippingChange} />
                            </div>
                            <InputField name="country" label={t('checkout.shipping.country')} value={shippingInfo.country} onChange={handleShippingChange} />
                        </div>
                    </section>


                    <section className="mb-12">
                        <h2 className="text-2xl font-aboreto text-title mb-6">{t('checkout.billing.title')}</h2>
                        <div className="space-y-6">
                            <div className="flex items-center">
                                <input id="same-as-shipping" type="checkbox" checked={sameAsShipping} onChange={handleSameAsShippingToggle} className="h-5 w-5 text-red-button focus:ring-red-button border-subtitle/20 rounded" />
                                <label htmlFor="same-as-shipping" className="ml-2 block text-subtitle/90 text-sm cursor-pointer">
                                    {t('checkout.billing.sameAsShipping')}
                                </label>
                            </div>
                            {!sameAsShipping && (
                                <div className="space-y-6 animate-fade-in">
                                    <InputField name="fullName" label={t('checkout.shipping.name')} value={billingInfo.fullName} onChange={handleBillingChange} />
                                    <InputField name="address" label={t('checkout.shipping.address')} value={billingInfo.address} onChange={handleShippingChange} />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <InputField name="city" label={t('checkout.shipping.city')} value={billingInfo.city} onChange={handleBillingChange} />
                                        <InputField name="postalCode" label={t('checkout.shipping.postalCode')} value={billingInfo.postalCode} onChange={handleBillingChange} />
                                    </div>
                                    <InputField name="country" label={t('checkout.shipping.country')} value={billingInfo.country} onChange={handleBillingChange} />
                                </div>
                            )}
                        </div>
                    </section>


                    <section>
                         <h2 className="text-2xl font-aboreto text-title mb-6">{t('checkout.payment.title')}</h2>
                         <div className="space-y-4 mb-6">
                            <div className={`flex items-center p-4 border rounded-md cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-red-button bg-red-button/5' : 'border-subtitle/20 hover:border-subtitle/40'}`} onClick={() => setPaymentMethod('card')}>
                                <input type="radio" name="paymentMethod" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="h-5 w-5 text-red-button focus:ring-red-button border-subtitle/20" />
                                <div className="ml-3 flex items-center justify-between w-full">
                                    <span className="font-medium text-title">{t('checkout.payment.method.card')}</span>
                                    <svg className="h-6 w-6 text-subtitle/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3-3v8a3 3 0 003 3z" /></svg>
                                </div>
                            </div>
                            <div className={`flex items-center p-4 border rounded-md cursor-pointer transition-colors ${paymentMethod === 'paypal' ? 'border-red-button bg-red-button/5' : 'border-subtitle/20 hover:border-subtitle/40'}`} onClick={() => setPaymentMethod('paypal')}>
                                <input type="radio" name="paymentMethod" checked={paymentMethod === 'paypal'} onChange={() => setPaymentMethod('paypal')} className="h-5 w-5 text-red-button focus:ring-red-button border-subtitle/20" />
                                <div className="ml-3 flex items-center justify-between w-full">
                                    <span className="font-medium text-title">{t('checkout.payment.method.paypal')}</span>
                                    <svg className="h-6 w-6 text-subtitle/70" fill="currentColor" viewBox="0 0 24 24"><path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.946 5.05-4.336 6.794-9.116 6.794H9.468a.5.5 0 0 0-.5.544l1.049 6.72a.5.5 0 0 1-.497.578h-.001a.5.5 0 0 1-.444-.334l.001.005z"/></svg>
                                </div>
                            </div>
                         </div>
                         <div className="mt-6">
                             {paymentMethod === 'card' ? (
                                 <SquarePaymentForm ref={paymentFormRef} amount={totalInCents} cartItems={cartPayload} orderContext={orderCustomerContext} onPaymentSuccess={handlePaymentSuccess} onPaymentFailure={handlePaymentFailure} />
                             ) : (
                                 <PayPalButton
                                     amount={totalInCents}
                                     cartItems={cartPayload}
                                     customerEmail={shippingInfo.email}
                                     customer={orderCustomerContext}
                                     disabled={!shippingInfo.email || !shippingInfo.fullName || !shippingInfo.address || !shippingInfo.city || !shippingInfo.postalCode || !shippingInfo.country || isProcessing}
                                     onPaymentSuccess={handlePaymentSuccess}
                                     onPaymentFailure={handlePaymentFailure}
                                 />
                             )}
                         </div>
                    </section>
                </div>
                <div className="lg:col-span-1 mt-12 lg:mt-0">
                     <div className="bg-black-button/20 shadow-xl rounded-lg p-6 sticky top-28">
                        <h2 className="text-2xl font-aboreto text-title mb-6">{t('checkout.orderSummary.title')}</h2>
                        <div className="space-y-4 divide-y divide-subtitle/10">
                            {cartItems.map((item: CartItem) => (
                                <div key={item.cartItemId} className="flex items-center gap-4 pt-4 first:pt-0">
                                    <img src={item.images[0]} alt={item.name[locale]} className="w-16 h-20 object-cover rounded-md"/>
                                    <div className="flex-grow">
                                        <p className="text-title font-semibold">{item.name[locale]}</p>
                                        <p className="text-sm text-subtitle/80">{item.format}</p>
                                        <p className="text-sm text-subtitle/80">{t('cart.quantity')} {item.quantity}</p>
                                    </div>
                                    <p className="font-semibold text-subtitle/90">€{(item.price * item.quantity).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 pt-6 border-t border-subtitle/20 space-y-2">
                            <div className="flex justify-between text-subtitle/90"><span>{t('checkout.orderSummary.subtotal')}</span><span>€{getCartTotal().toFixed(2)}</span></div>
                            <div className="flex justify-between text-subtitle/90"><span>{t('checkout.orderSummary.shipping')}</span><span>{t('checkout.orderSummary.shippingFree')}</span></div>
                            <div className="flex justify-between text-2xl font-bold text-title pt-2"><span>{t('checkout.orderSummary.total')}</span><span>€{getCartTotal().toFixed(2)}</span></div>
                        </div>
                    </div>
                </div>
                <div className="lg:col-start-1 mt-8">
                     {paymentError && <p className="text-red-500 mb-4 text-center lg:text-left">{paymentError}</p>}
                    {paymentMethod === 'card' && (
                    <Button variant="red" type="submit" className="w-full" disabled={isProcessing}>
                        {isProcessing ? t('checkout.processing') : t('checkout.payButton')}
                    </Button>
                    )}
                </div>
            </form>
        </div>
    );
};


export default CheckoutPage;







