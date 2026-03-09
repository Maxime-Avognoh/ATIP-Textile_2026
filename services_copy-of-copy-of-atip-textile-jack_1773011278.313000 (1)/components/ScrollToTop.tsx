
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Désactive temporairement le défilement fluide du navigateur pour un saut instantané
    const originalStyle = window.getComputedStyle(document.documentElement).scrollBehavior;
    document.documentElement.style.scrollBehavior = 'auto';
    
    window.scrollTo(0, 0);
    
    // On laisse en 'auto' pour garantir que les transitions de pages restent sans mouvement
    // Si on a besoin de 'smooth' ailleurs, on le gérera localement.
  }, [pathname]);

  return null;
};

export default ScrollToTop;
