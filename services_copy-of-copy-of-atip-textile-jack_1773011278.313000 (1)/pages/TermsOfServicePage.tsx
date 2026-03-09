
import React from 'react';
import BackToCollectionLink from '../components/BackToCollectionLink';
import { useLocale } from '../context/LocaleContext';

const TermsOfServicePage: React.FC = () => {
  const { t } = useLocale();

  return (
    <div className="max-w-4xl mx-auto pt-32 pb-12 px-4 animate-fade-in">
      <div>
        <BackToCollectionLink />
      </div>
      <h1 className="text-4xl font-aboreto text-title text-center mb-12">{t('terms.title')}</h1>
      <div 
        className="text-lg text-subtitle/90 font-playfair leading-loose space-y-6 bg-black-button/20 p-8 rounded-lg shadow-xl"
        dangerouslySetInnerHTML={{ __html: t('terms.content') }}
      />
    </div>
  );
};

export default TermsOfServicePage;
