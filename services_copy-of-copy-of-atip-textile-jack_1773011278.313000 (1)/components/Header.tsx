
import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLocale } from '../context/LocaleContext';
import { useAsset } from '../context/AssetContext';
import { useAuth } from '../context/AuthContext';
import ThemeToggleButton from './ThemeToggleButton';

interface HeaderProps {
  onTitleClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onTitleClick }) => {
  const { cartItems } = useCart();
  const { locale, setLocale, t } = useLocale();
  const { headerLogo } = useAsset();
  const { currentUser } = useAuth();
  const location = useLocation();
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  const langMenuRef = useRef<HTMLDivElement>(null);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' }
  ];

  const currentLanguage = languages.find(l => l.code === locale) || languages[0];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY;
      setScrolled(scrollPos > 20);
      
      if (location.pathname === '/') {
        const threshold = window.innerHeight * 0.7; 
        setIsVisible(scrollPos > threshold);
      } else {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname !== '/') {
      const timeout = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timeout);
    } else {
      const threshold = window.innerHeight * 0.7;
      setIsVisible(window.scrollY > threshold);
    }
  }, [location.pathname]);

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


  const navLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-aboreto tracking-widest text-subtitle/80 hover:text-title transition-colors relative after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:w-full after:h-[1px] after:bg-title after:scale-x-0 after:origin-left after:transition-transform duration-300 ${
      isActive ? 'text-title after:scale-x-100' : 'hover:after:scale-x-100'
    }`;
  
  const mobileNavLinkClasses = ({ isActive }: { isActive: boolean }) =>
    `block py-3 px-3 text-center rounded font-aboreto tracking-wider ${ isActive ? 'bg-black-button text-title' : 'text-subtitle hover:bg-black-button/50'}`;

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-in-out transform ${
        !isVisible ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
      } ${
        scrolled ? 'bg-background/85 backdrop-blur-md shadow-sm py-2' : 'bg-transparent py-4'
      }`}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              type="button"
              onClick={onTitleClick}
              className="flex items-center text-title transition-opacity hover:opacity-80"
              aria-label={t('nav.introAria')}
            >
              <img src={headerLogo} alt={t('nav.logoAlt')} className={`object-contain transition-all duration-300 ${scrolled ? 'h-10 w-auto' : 'h-12 w-auto md:h-16'}`} />
            </button>
          </div>
          
          <div className="hidden md:flex items-center space-x-10">
            <NavLink to="/" className={navLinkClasses}>{t('nav.home')}</NavLink>
            <NavLink to="/about" className={navLinkClasses}>{t('nav.about')}</NavLink>
            <NavLink to="/contact" className={navLinkClasses}>{t('nav.contact')}</NavLink>
          </div>

          <div className="flex items-center space-x-5">
             <div className="hidden md:relative md:inline-block text-left" ref={langMenuRef}>
                <button
                    type="button"
                    onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                    className="inline-flex justify-center items-center gap-1.5 rounded-md px-3 py-1 text-xs font-aboreto font-bold text-subtitle/80 hover:text-title focus:outline-none transition-colors border border-transparent hover:border-subtitle/20"
                    id="menu-button"
                    aria-expanded={isLangMenuOpen}
                    aria-haspopup="true"
                >
                    <span className="text-base leading-none">{currentLanguage.flag}</span>
                    <span>{currentLanguage.code.toUpperCase()}</span>
                    <svg className="h-3 w-3 opacity-60" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                </button>
                {isLangMenuOpen && (
                    <div
                        className="origin-top-right absolute right-0 mt-2 w-40 rounded-sm shadow-xl bg-background/95 backdrop-blur-sm ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="menu-button"
                    >
                        <div className="py-1" role="none">
                            {languages.map(lang => (
                                <button
                                    key={lang.code}
                                    onClick={() => {
                                        setLocale(lang.code);
                                        setIsLangMenuOpen(false);
                                    }}
                                    className={`w-full text-left flex items-center gap-3 px-4 py-3 text-sm font-aboreto ${locale === lang.code ? 'text-title font-bold bg-black-button/30' : 'text-subtitle/80'} hover:bg-black-button hover:text-title transition-colors`}
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
            
            <ThemeToggleButton />

            {/*<Link 
              to={currentUser ? "/profile" : "/login"} 
              className="text-subtitle/80 hover:text-title transition-colors p-1"
              title={currentUser ? t('nav.profile') : t('nav.login')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>*/}

            <Link to="/cart" className="relative text-subtitle/80 hover:text-title transition-colors group">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-button text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-sm">
                  {totalItems}
                </span>
              )}
            </Link>
             <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-subtitle/80 hover:text-title transition-colors p-1">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24" stroke="currentColor">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
         {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-2 pb-4 bg-background/95 backdrop-blur-md rounded-lg shadow-inner">
             <NavLink to="/" className={mobileNavLinkClasses} onClick={() => setIsMenuOpen(false)}>{t('nav.home')}</NavLink>
             <NavLink to="/about" className={mobileNavLinkClasses} onClick={() => setIsMenuOpen(false)}>{t('nav.about')}</NavLink>
             <NavLink to="/contact" className={mobileNavLinkClasses} onClick={() => setIsMenuOpen(false)}>{t('nav.contact')}</NavLink>
             <NavLink to={currentUser ? "/profile" : "/login"} className={mobileNavLinkClasses} onClick={() => setIsMenuOpen(false)}>{currentUser ? t('nav.profile') : t('nav.login')}</NavLink>
             <div className="border-t border-subtitle/10 pt-4 mt-2 space-y-4 px-4">
                <div className="flex justify-center space-x-2">
                    {languages.map(lang => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLocale(lang.code);
                            setIsMenuOpen(false);
                          }}
                          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold font-aboreto rounded-md transition-colors ${locale === lang.code ? 'bg-black-button text-title' : 'text-subtitle hover:bg-black-button/50'}`}
                        >
                            <span className="text-base leading-none">{lang.flag}</span>
                            <span>{lang.name}</span>
                        </button>
                    ))}
                </div>
             </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
