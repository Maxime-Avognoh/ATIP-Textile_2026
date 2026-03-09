// import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
// import { useLocale } from '../context/LocaleContext';


// // Declare the Square property on the global Window interface
// declare global {
//   interface Window {
//     Square: any;
//   }
// }


// // --- 💳 SQUARE SDK CONFIGURATION ---
// // Ces identifiants sont pour le mode Sandbox (test)
// const SQUARE_APP_ID = 'sandbox-sq0idb-AT9zsKIdnuhkLQQEF6ayDQ';
// const SQUARE_LOCATION_ID = 'LYR41AT3QZ7Z2';


// interface SquarePaymentFormProps {
//   amount: number; // Montant en centimes (ex: 11000 pour 110.00€)
//   onPaymentSuccess: (result: any) => void;
//   onPaymentFailure: (error: string) => void;
// }


// export interface SquarePaymentFormRef {
//   handlePayment: () => Promise<void>;
// }


// const SquarePaymentForm = forwardRef<SquarePaymentFormRef, SquarePaymentFormProps>(
//   ({ amount, onPaymentSuccess, onPaymentFailure }, ref) => {
//     const [card, setCard] = useState<any | null>(null);
//     const [isLoadingSDK, setIsLoadingSDK] = useState(true);
//     const [isProcessingTransaction, setIsProcessingTransaction] = useState(false);
//     const [initializationError, setInitializationError] = useState<string | null>(null);
//     const { t } = useLocale();


//     useEffect(() => {
//         let isMounted = true;


//         const initializeForm = async () => {
//           try {
//             if (!window.Square) {
//               throw new Error('Square SDK not found.');
//             }
   
//             const payments = window.Square.payments(SQUARE_APP_ID, SQUARE_LOCATION_ID);
//             const cardInstance = await payments.card();
//             await cardInstance.attach('#card-container');
           
//             if (isMounted) {
//               setCard(cardInstance);
//             }
//           } catch (error) {
//             console.error("Failed to initialize Square Payments:", error);
//             const errorMsg = 'Could not initialize the payment entry form.';
//             if (isMounted) {
//               setInitializationError(errorMsg);
//               onPaymentFailure(errorMsg);
//             }
//           } finally {
//             if (isMounted) {
//               setIsLoadingSDK(false);
//             }
//           }
//         };
   
//         if (window.Square) {
//           initializeForm();
//         } else {
//           const script = document.createElement('script');
//           script.src = 'https://sandbox.web.squarecdn.net/v0/square.js';
//           script.async = true;
//           script.onload = initializeForm;
//           script.onerror = () => {
//             if (isMounted) {
//               const errorMsg = 'Payment SDK failed to load.';
//               setInitializationError(errorMsg);
//               onPaymentFailure(errorMsg);
//               setIsLoadingSDK(false);
//             }
//           };
//           document.body.appendChild(script);
//         }
   
//         return () => {
//           isMounted = false;
//         };
//     }, [onPaymentFailure]);


//     const handlePayment = async () => {
//       if (!card || isProcessingTransaction) {
//         return;
//       }
     
//       setIsProcessingTransaction(true);
     
//       try {
//         const result = await card.tokenize();
//         if (result.status === 'OK') {
//           console.log('Payment Token generated:', result.token);
         
//           /**
//            * EXPLICATION DE L'ERREUR "Unexpected token '<'":
//            * L'appel fetch('/process-payment') échoue car il n'y a pas de serveur backend.
//            * Le serveur statique renvoie index.html (<!DOCTYPE...) au lieu de JSON.
//            *
//            * SOLUTION : Simuler un délai et un succès pour la démo.
//            */
         
//           // 1. Simuler un temps de traitement serveur
//           await new Promise(resolve => setTimeout(resolve, 2000));
         
//           // 2. Simuler les données renvoyées par un vrai backend
//           const mockData = {
//             success: true,
//             orderId: `ATIP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
//             status: 'COMPLETED'
//           };


//           // 3. Valider le paiement localement
//           onPaymentSuccess(mockData);


//           /*
//           // --- CODE POUR PRODUCTION (AVEC BACKEND) ---
//           const response = await fetch('/process-payment', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ sourceId: result.token, amount })
//           });


//           // Vérifier que c'est bien du JSON avant de parser pour éviter l'erreur "<!DOCTYPE"
//           const contentType = response.headers.get("content-type");
//           if (contentType && contentType.indexOf("application/json") !== -1) {
//             const data = await response.json();
//             if (response.ok) {
//               onPaymentSuccess(data);
//             } else {
//               throw new Error(data.error || 'Payment failed on server');
//             }
//           } else {
//             throw new Error("Invalid response from server (Not JSON). Please check your backend.");
//           }
//           */


//         } else {
//           let errorMessage = `Tokenization failed: ${result.status}`;
//           if (result.errors) {
//             errorMessage += ` - ${result.errors[0].message}`;
//           }
//           throw new Error(errorMessage);
//         }
//       } catch (error: any) {
//         console.error("Payment error:", error);
//         onPaymentFailure(error.message || t('checkout.payment.error'));
//       } finally {
//         setIsProcessingTransaction(false);
//       }
//     };


//     useImperativeHandle(ref, () => ({
//       handlePayment,
//     }));


//     return (
//       <div className="relative">
//         <div className="relative min-h-[3.5rem] flex flex-col items-center justify-center border border-subtitle/10 rounded-md p-2 bg-white/50">
//             <div
//                 id="card-container"
//                 className={`w-full ${(isLoadingSDK || isProcessingTransaction) ? 'opacity-30 pointer-events-none' : 'opacity-100'} ${initializationError ? 'hidden' : 'block'}`}
//                 style={{ minHeight: '1.5rem' }}
//             ></div>
           
//             {(isLoadingSDK || isProcessingTransaction) && (
//               <div className="absolute inset-0 flex items-center justify-center text-sm text-subtitle/70 bg-white/20 backdrop-blur-[1px] z-10 rounded-md" aria-label="Processing">
//                 <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-red-button" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                 </svg>
//                 <span className="font-medium">{isProcessingTransaction ? t('checkout.processing') : t('checkout.payment.loading')}</span>
//               </div>
//             )}
           
//             {initializationError && !isLoadingSDK && (
//               <div className="text-sm text-red-500 text-center w-full break-words" role="alert">
//                 {initializationError}
//               </div>
//             )}
//         </div>
//         <p className="text-[10px] md:text-xs text-subtitle/60 mt-2 italic">{t('checkout.payment.info')}</p>
//       </div>
//     );
//   }
// );


// export default SquarePaymentForm;




import React, { useEffect, useState, useImperativeHandle, forwardRef, useRef } from 'react';
import { useLocale } from '../context/LocaleContext';


// Declare the Square property on the global Window interface
declare global {
  interface Window {
    Square: any;
  }
}


// --- 💳 SQUARE SDK CONFIGURATION ---
// Ces identifiants sont pour le mode Sandbox (test)
const SQUARE_APP_ID = 'sq0idp-XH9zLazYmWvpBOQmDgUT-Q';
const SQUARE_LOCATION_ID = 'LCH74A955F6NE';


interface SquarePaymentFormProps {
  amount: number; // Montant en centimes (ex: 11000 pour 110.00€)
  cartItems: { id: string; qty: number }[]; // ✅ AJOUTE CETTE LIGNE
  onPaymentSuccess: (result: any) => void;
  onPaymentFailure: (error: string) => void;
}


export interface SquarePaymentFormRef {
  handlePayment: () => Promise<void>;
}


const SquarePaymentForm = forwardRef<SquarePaymentFormRef, SquarePaymentFormProps>(
  ({ amount, cartItems, onPaymentSuccess, onPaymentFailure }, ref) => {
    const [card, setCard] = useState<any | null>(null);
    const [isLoadingSDK, setIsLoadingSDK] = useState(true);
    const [isProcessingTransaction, setIsProcessingTransaction] = useState(false);
    const [initializationError, setInitializationError] = useState<string | null>(null);
    const [customerEmail, setCustomerEmail] = useState<string>('');
    const { t } = useLocale();
    const cardRef = useRef<any>(null);
    const isInitializing = useRef(false);


    useEffect(() => {
        // Prevent double initialization in StrictMode
        if (isInitializing.current || cardRef.current) {
          setIsLoadingSDK(false);
          return;
        }


        isInitializing.current = true;


        const initializeForm = async () => {
          try {
            if (!window.Square) {
              throw new Error('Square SDK not found.');
            }


            const payments = window.Square.payments(SQUARE_APP_ID, SQUARE_LOCATION_ID);
            const cardInstance = await payments.card();
            await cardInstance.attach('#card-container');


            cardRef.current = cardInstance;
            setCard(cardInstance);
          } catch (error) {
            console.error("Failed to initialize Square Payments:", error);
            const errorMsg = 'Could not initialize the payment entry form.';
            setInitializationError(errorMsg);
            onPaymentFailure(errorMsg);
          } finally {
            setIsLoadingSDK(false);
            isInitializing.current = false;
          }
        };


        if (window.Square) {
          initializeForm();
        } else {
          const script = document.createElement('script');
          script.src = 'https://web.squarecdn.com/v1/square.js';
          script.async = true;
          script.onload = initializeForm;
          script.onerror = () => {
            const errorMsg = 'Payment SDK failed to load.';
            setInitializationError(errorMsg);
            onPaymentFailure(errorMsg);
            setIsLoadingSDK(false);
            isInitializing.current = false;
          };
          document.body.appendChild(script);
        }


        return () => {
          // Only destroy on actual unmount, not StrictMode remount
          // The card will be cleaned up when the component is truly unmounted
        };
    }, []);


    const handlePayment = async () => {
      if (!card || isProcessingTransaction) {
        return;
      }
     
      setIsProcessingTransaction(true);
     
      try {
        const result = await card.tokenize();
        if (result.status === 'OK') {
          console.log('Payment Token generated:', result.token);


          // Generate unique idempotency key to prevent duplicate charges
          const idempotencyKey = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;


          const response = await fetch('/process-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sourceId: result.token,
              amount,
              idempotencyKey,
              email: customerEmail,
              cartItems, // ✅ AJOUT ICI


            })
          });


          const contentType = response.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
            const data = await response.json();
            if (response.ok && data.success) {
              onPaymentSuccess({
                orderId: data.payment?.id || `ATIP-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                status: 'COMPLETED',
                payment: data.payment
              });
            } else {
              throw new Error(data.error || 'Payment failed on server');
            }
          } else {
            throw new Error("Backend not available. Make sure the server is running.");
          }


        } else {
          let errorMessage = `Tokenization failed: ${result.status}`;
          if (result.errors) {
            errorMessage += ` - ${result.errors[0].message}`;
          }
          throw new Error(errorMessage);
        }
      } catch (error: any) {
        console.error("Payment error:", error);
        onPaymentFailure(error.message || t('checkout.payment.error'));
      } finally {
        setIsProcessingTransaction(false);
      }
    };


    useImperativeHandle(ref, () => ({
      handlePayment,
    }));


    return (
      <div className="relative">
        <div className="relative min-h-[3.5rem] flex flex-col items-center justify-center border border-subtitle/10 rounded-md p-2 bg-white/50">
         
           
<div className="w-full mb-2">
  <input
    type="email"
    value={customerEmail}
    onChange={(e) => setCustomerEmail(e.target.value)}
    placeholder={t('checkout.emailPlaceholder') || 'Email'}
    className="w-full px-3 py-2 rounded-md border border-subtitle/10 bg-white/70 text-sm outline-none focus:ring-1 focus:ring-red-button"
    required
  />
</div>


            <div
                id="card-container"
                className={`w-full ${(isLoadingSDK || isProcessingTransaction) ? 'opacity-30 pointer-events-none' : 'opacity-100'} ${initializationError ? 'hidden' : 'block'}`}
                style={{ minHeight: '1.5rem' }}
            ></div>
           
            {(isLoadingSDK || isProcessingTransaction) && (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-subtitle/70 bg-white/20 backdrop-blur-[1px] z-10 rounded-md" aria-label="Processing">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-red-button" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span className="font-medium">{isProcessingTransaction ? t('checkout.processing') : t('checkout.payment.loading')}</span>
              </div>
            )}
           
            {initializationError && !isLoadingSDK && (
              <div className="text-sm text-red-500 text-center w-full break-words" role="alert">
                {initializationError}
              </div>
            )}
        </div>
        <p className="text-[10px] md:text-xs text-subtitle/60 mt-2 italic">{t('checkout.payment.info')}</p>
      </div>
    );
  }
);


export default SquarePaymentForm;

