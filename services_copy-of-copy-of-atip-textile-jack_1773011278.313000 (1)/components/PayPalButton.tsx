import React, { useEffect, useRef, useState } from 'react';


declare global {
  interface Window {
    paypal?: any;
  }
}


interface PayPalButtonProps {
  amount: number;
  cartItems: { id: string; qty: number }[];
  customerEmail: string;
  customer?: any;
  disabled?: boolean;
  onPaymentSuccess: (result: any) => void;
  onPaymentFailure: (error: string) => void;
}


let paypalSdkPromise: Promise<void> | null = null;


function loadPayPalSdk(clientId: string, currency = 'EUR') {
  if (window.paypal) return Promise.resolve();
  if (paypalSdkPromise) return paypalSdkPromise;


  paypalSdkPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-paypal-sdk="true"]') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('PayPal SDK failed to load.')), { once: true });
      return;
    }


    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=${encodeURIComponent(currency)}&intent=capture`;
    script.async = true;
    script.dataset.paypalSdk = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('PayPal SDK failed to load.'));
    document.body.appendChild(script);
  });


  return paypalSdkPromise;
}


const PayPalButton: React.FC<PayPalButtonProps> = ({
  amount,
  cartItems,
  customerEmail,
  customer,
  disabled = false,
  onPaymentSuccess,
  onPaymentFailure,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const renderedRef = useRef(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [clientId, setClientId] = useState('');


  useEffect(() => {
    let cancelled = false;


    const bootstrap = async () => {
      try {
        const configResponse = await fetch('/paypal/config');
        const config = await configResponse.json();


        if (!configResponse.ok || !config.clientId) {
          throw new Error(config.error || 'Missing PayPal client ID on server.');
        }


        if (cancelled) return;
        setClientId(config.clientId);


        await loadPayPalSdk(config.clientId, 'EUR');
        if (!cancelled) setSdkReady(true);
      } catch (error: any) {
        if (!cancelled) {
          onPaymentFailure(error?.message || 'Unable to load PayPal.');
        }
      }
    };


    bootstrap();


    return () => {
      cancelled = true;
    };
  }, [onPaymentFailure]);


  useEffect(() => {
    if (!sdkReady || !window.paypal || !containerRef.current || renderedRef.current || !clientId) {
      return;
    }


    renderedRef.current = true;
    containerRef.current.innerHTML = '';


    window.paypal.Buttons({
      style: {
        layout: 'vertical',
        shape: 'rect',
        label: 'paypal',
      },
      onClick: () => {
        if (disabled) {
          onPaymentFailure('Please complete your contact and shipping information before using PayPal.');
          return false;
        }
        return true;
      },
      createOrder: async () => {
        const response = await fetch('/paypal/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount, cartItems, email: customerEmail, customer }),
        });


        const data = await response.json();
        if (!response.ok || !data.orderID) {
          throw new Error(data.error || 'Failed to create PayPal order.');
        }


        return data.orderID;
      },
      onApprove: async (data: any) => {
        const response = await fetch('/paypal/capture-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderID: data.orderID, cartItems, email: customerEmail, customer }),
        });


        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to capture PayPal order.');
        }


        onPaymentSuccess({
          orderId: result.captureId || result.orderID || data.orderID,
          status: 'COMPLETED',
          payment: result,
        });
      },
      onError: (err: any) => {
        onPaymentFailure(err?.message || 'PayPal checkout failed.');
      },
      onCancel: () => {
        onPaymentFailure('PayPal payment was cancelled.');
      },
    }).render(containerRef.current);
  }, [sdkReady, clientId, amount, cartItems, customerEmail, customer, disabled, onPaymentFailure, onPaymentSuccess]);


  return (
    <div className="space-y-3">
      <div
        className={`rounded-md border border-subtitle/10 bg-white/50 p-3 ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
      >
        <div ref={containerRef} />
      </div>
      {disabled && (
        <p className="text-xs text-subtitle/70 italic">
          Complete your email and shipping details to activate PayPal.
        </p>
      )}
    </div>
  );
};


export default PayPalButton;





