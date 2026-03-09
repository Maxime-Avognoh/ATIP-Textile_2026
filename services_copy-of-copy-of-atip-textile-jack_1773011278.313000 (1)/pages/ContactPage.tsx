
import React from 'react';
import Button from '../components/Button';
import BackToCollectionLink from '../components/BackToCollectionLink';
import { useLocale } from '../context/LocaleContext';

const ContactPage: React.FC = () => {
  const { t } = useLocale();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(t('contact.form.success'));
  };

  return (
    <div className="max-w-4xl mx-auto pt-32 pb-12 px-4 animate-fade-in">
      <BackToCollectionLink />
      <h1 className="text-4xl font-aboreto text-title text-center mb-8">{t('contact.title')}</h1>
      <p className="text-xl text-center text-subtitle/80 mb-12">
        {t('contact.subtitle')}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="bg-black-button/20 p-8 rounded-lg shadow-xl">
          <h2 className="text-3xl font-aboreto text-title mb-6">{t('contact.form.title')}</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-subtitle/90">{t('contact.form.name')}</label>
              <input type="text" id="name" name="name" required className="mt-1 block w-full bg-white dark:bg-black-button text-subtitle border-subtitle/20 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-button focus:border-red-button" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-subtitle/90">{t('contact.form.email')}</label>
              <input type="email" id="email" name="email" required className="mt-1 block w-full bg-white dark:bg-black-button text-subtitle border-subtitle/20 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-button focus:border-red-button" />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-subtitle/90">{t('contact.form.message')}</label>
              <textarea id="message" name="message" rows={4} required className="mt-1 block w-full bg-white dark:bg-black-button text-subtitle border-subtitle/20 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-button focus:border-red-button"></textarea>
            </div>
            <div>
              <Button variant="red" type="submit" className="w-full">
                {t('contact.form.send')}
              </Button>
            </div>
          </form>
        </div>
        <div className="text-lg text-subtitle/90 font-playfair leading-loose">
           <h2 className="text-3xl font-aboreto text-title mb-6">{t('contact.info.title')}</h2>
           <div className="space-y-4">
             <p>
               <strong>{t('contact.info.email')}</strong><br />
               <a href="mailto:contact@atiptextile.com" className="hover:text-red-button transition-colors">contact@atiptextile.com</a>
             </p>
             <p>
               <strong>{t('contact.info.phone')}</strong><br />
               +1 (234) 567-890
             </p>
             <p>
               <strong>{t('contact.info.address')}</strong><br />
               123 Art Avenue,<br/>
               Creative City, 10101
             </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
