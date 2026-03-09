
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLocale } from '../context/LocaleContext';

const Footer: React.FC = () => {
  const { locale, setLocale, t } = useLocale();
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
  ];

  const currentLanguage = languages.find(l => l.code === locale) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [langMenuRef]);


  return (
    <footer className="bg-black-button/50 text-subtitle mt-16">
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left">
          {/* Col 1: Brand */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-2xl font-aboreto text-title tracking-widest">ATIP Textile</h3>
            <p className="mt-2 text-subtitle/70 text-sm max-w-xs">
              {t('home.subtitle')}
            </p>
          </div>
          
          {/* Col 2: Quick Links */}
          <div>
            <h4 className="font-semibold text-lg text-title/90 mb-4">{t('footer.quickLinks')}</h4>
            <nav className="flex flex-col space-y-2 text-subtitle/90">
              <Link to="/about" className="hover:text-title transition-colors">{t('nav.about')}</Link>
              <Link to="/contact" className="hover:text-title transition-colors">{t('nav.contact')}</Link>
            </nav>
          </div>

          {/* Col 3: Language */}
          <div className="flex flex-col items-center md:items-start">
             <h4 className="font-semibold text-lg text-title/90 mb-4">{t('footer.language')}</h4>
             <div className="relative inline-block text-left" ref={langMenuRef}>
                 <button
                    type="button"
                    onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                    className="inline-flex justify-center items-center w-full rounded-md px-4 py-2 text-sm font-medium text-subtitle/80 hover:text-title focus:outline-none transition-colors bg-background/50"
                    id="footer-lang-button"
                    aria-expanded="true"
                    aria-haspopup="true"
                >
                    <span>{currentLanguage.flag}</span>
                    <span className="mx-2">{currentLanguage.name}</span>
                    <svg className="-mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                 </button>
                 {isLangMenuOpen && (
                    <div
                        className="origin-bottom-left absolute bottom-full mb-2 w-48 rounded-md shadow-lg bg-background ring-1 ring-black ring-opacity-5 focus:outline-none"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="footer-lang-button"
                    >
                        <div className="py-1" role="none">
                            {languages.map(lang => (
                                <button
                                    key={lang.code}
                                    onClick={() => {
                                        setLocale(lang.code);
                                        setIsLangMenuOpen(false);
                                    }}
                                    className={`w-full text-left flex items-center gap-3 px-4 py-2 text-sm ${locale === lang.code ? 'text-title font-semibold' : 'text-subtitle/80'} hover:bg-black-button hover:text-title transition-colors`}
                                    role="menuitem"
                                >
                                    <span>{lang.flag}</span>
                                    <span>{lang.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                 )}
              </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-subtitle/20 flex flex-col-reverse sm:flex-row justify-between items-center gap-4 text-sm">
           <p className="text-subtitle/70 text-center sm:text-left">&copy; {new Date().getFullYear()} {t('footer.rights')}</p>
           <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-subtitle/80">
             <Link to="/privacy" className="hover:text-title transition-colors">{t('footer.privacy')}</Link>
             <Link to="/terms" className="hover:text-title transition-colors">{t('footer.terms')}</Link>
             <Link to="/shipping" className="hover:text-title transition-colors">{t('footer.shipping')}</Link>
             <Link to="/returns" className="hover:text-title transition-colors">{t('footer.returns')}</Link>
             <Link to="/asset-manager" className="hover:text-title transition-colors">{t('footer.manageAssets')}</Link>
           </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
