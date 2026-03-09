
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CartPage from './pages/CartPage';
import IntroPage from './pages/IntroPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import ShippingPolicyPage from './pages/ShippingPolicyPage';
import ReturnPolicyPage from './pages/ReturnPolicyPage';
import AssetManagerPage from './pages/AssetManagerPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import ArtAdvisorPage from './pages/ArtAdvisorPage';
import { CartProvider } from './context/CartContext';
import { LocaleProvider, useLocale } from './context/LocaleContext';
import { ProductProvider } from './context/ProductContext';
import { AssetProvider } from './context/AssetContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ScrollToTop from './components/ScrollToTop';
import ScrollToTopButton from './components/ScrollToTopButton';
import AddToCartToast from './components/AddToCartToast';

function AppContent() {
  const [introVisible, setIntroVisible] = useState(!sessionStorage.getItem('introSeen'));
  const { setLocale } = useLocale();
  const navigate = useNavigate();
  const location = useLocation();

  const handleEnterSite = (lang: string) => {
    setLocale(lang);
    sessionStorage.setItem('introSeen', 'true');
    setIntroVisible(false);
    navigate('/');
  };

  const handleShowIntro = () => {
    sessionStorage.removeItem('introSeen');
    setIntroVisible(true);
  };

  useEffect(() => {
    let scrollTimeout: number;
    const handleScroll = () => {
      document.body.classList.add('is-scrolling');
      window.clearTimeout(scrollTimeout);
      scrollTimeout = window.setTimeout(() => {
        document.body.classList.remove('is-scrolling');
      }, 1000);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.clearTimeout(scrollTimeout);
    };
  }, []);

  if (introVisible) {
    return <IntroPage onEnter={handleEnterSite} />;
  }

  return (
    <div className="min-h-screen flex flex-col font-playfair text-subtitle overflow-x-hidden">
      <Header onTitleClick={handleShowIntro} />
      <main className="flex-grow">
        {/* Utilisation de animate-fade-in pour un fondu simple sans mouvement */}
        <div key={location.pathname} className="animate-fade-in">
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/confirmation" element={<OrderConfirmationPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />
            <Route path="/shipping" element={<ShippingPolicyPage />} />
            <Route path="/returns" element={<ReturnPolicyPage />} />
            <Route path="/asset-manager" element={<AssetManagerPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/advisor" element={<ArtAdvisorPage />} />
          </Routes>
        </div>
      </main>
      <Footer />
      <ScrollToTopButton />
      <AddToCartToast />
    </div>
  );
}


function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <CartProvider>
        <LocaleProvider>
          <ThemeProvider>
            <AssetProvider>
              <ProductProvider>
                <AuthProvider>
                  <AppContent />
                </AuthProvider>
              </ProductProvider>
            </AssetProvider>
          </ThemeProvider>
        </LocaleProvider>
      </CartProvider>
    </HashRouter>
  );
}

export default App;
