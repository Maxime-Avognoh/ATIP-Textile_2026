
import React from 'react';
import BackToCollectionLink from '../components/BackToCollectionLink';
import { useLocale } from '../context/LocaleContext';
import { useAsset } from '../context/AssetContext';

const AboutPage: React.FC = () => {
  const { t } = useLocale();
  const { aboutUsImage } = useAsset();
  return (
    <div className="max-w-6xl mx-auto pt-32 pb-12 px-4 animate-fade-in">
      <div>
        <BackToCollectionLink />
      </div>
      <h1 className="text-4xl font-aboreto text-title text-center mb-12">{t('about.title')}</h1>
      <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-start">
        <div className="w-full aspect-[4/5] rounded-lg overflow-hidden shadow-2xl">
          <img src={aboutUsImage} alt="Artistic textile patterns" className="w-full h-full object-cover" />
        </div>
        <div className="text-lg text-subtitle/90 font-playfair leading-loose space-y-6 bg-black-button/20 p-8 rounded-lg shadow-xl">
          <p>{t('about.p1')}</p>
          <p>{t('about.p2')}</p>
          <p>{t('about.p3')}</p>
          <p>{t('about.p4')}</p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
