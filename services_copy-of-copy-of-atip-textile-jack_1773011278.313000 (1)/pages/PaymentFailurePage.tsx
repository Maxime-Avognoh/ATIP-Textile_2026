
import React from 'react';
import { Link } from 'react-router-dom';
import { useLocale } from '../context/LocaleContext';
import Button from '../components/Button';

const PaymentFailurePage: React.FC = () => {
    const { t } = useLocale();

    return (
        <div className="max-w-4xl mx-auto pt-32 pb-12 px-4 text-center animate-fade-in">
            <div>
                <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </div>
                <h1 className="text-4xl font-aboreto text-title mt-6">{t('failure.title')}</h1>
                <p className="text-lg text-subtitle/80 mt-4 max-w-md mx-auto">{t('failure.subtitle')}</p>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/checkout">
                    <Button variant="red" className="w-full sm:w-auto">
                        {t('failure.backToCheckout')}
                    </Button>
                </Link>
                <Link to="/contact">
                    <Button variant="black" className="w-full sm:w-auto">
                        {t('failure.contactSupport')}
                    </Button>
                </Link>
            </div>

            <div className="mt-12">
                <Link to="/" className="text-subtitle/60 hover:text-title underline transition-colors">
                    {t('backToCollection')}
                </Link>
            </div>
        </div>
    );
};

export default PaymentFailurePage;
