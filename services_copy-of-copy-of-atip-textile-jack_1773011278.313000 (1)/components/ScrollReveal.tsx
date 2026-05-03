import React, { useEffect, useRef, ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'left' | 'right';
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  delay = 0,
  direction = 'up',
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.style.transitionDelay = `${delay}ms`;
          el.classList.add('scroll-reveal-visible');
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  const dirClass =
    direction === 'left'
      ? 'scroll-reveal-left'
      : direction === 'right'
      ? 'scroll-reveal-right'
      : 'scroll-reveal-up';

  return (
    <div ref={ref} className={`scroll-reveal ${dirClass} ${className}`}>
      {children}
    </div>
  );
};

export default ScrollReveal;
