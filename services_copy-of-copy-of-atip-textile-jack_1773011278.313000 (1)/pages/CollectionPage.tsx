import React, { useState } from 'react';
import { getLocalized } from '../types';
import ProductCard from '../components/ProductCard';
import ScrollReveal from '../components/ScrollReveal';
import { useLocale } from '../context/LocaleContext';
import { useProducts } from '../context/ProductContext';

type Filter = 'all' | 'framed' | 'unframed';

const FILTER_LABELS: Record<Filter, Record<string, string>> = {
  all:      { en: 'All', fr: 'Tous', es: 'Todos', it: 'Tutti', de: 'Alle', pt: 'Todos', nl: 'Alle' },
  framed:   { en: 'Framed', fr: 'Encadrés', es: 'Enmarcados', it: 'Incorniciati', de: 'Gerahmt', pt: 'Emoldurados', nl: 'Ingelijst' },
  unframed: { en: 'Unframed', fr: 'Sans cadre', es: 'Sin marco', it: 'Senza cornice', de: 'Ohne Rahmen', pt: 'Sem moldura', nl: 'Zonder lijst' },
};

const CollectionPage: React.FC = () => {
  const { locale } = useLocale();
  const { products } = useProducts();
  const [activeFilter, setActiveFilter] = useState<Filter>('all');

  const isFramed = (subtitle: { [key: string]: string }) =>
    !subtitle.en?.toLowerCase().includes('unframed');

  const filtered = products.filter(p => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'framed') return isFramed(p.subtitle);
    return !isFramed(p.subtitle);
  });

  const label = (key: Filter) => FILTER_LABELS[key][locale] ?? FILTER_LABELS[key].en;

  return (
    <div className="min-h-screen pt-32 pb-24 px-6 lg:px-16 container mx-auto">
      {/* En-tête */}
      <ScrollReveal className="mb-16 text-center">
        <span className="text-[10px] font-montserrat font-semibold tracking-[0.5em] text-red-button uppercase mb-4 block">
          ATIP Textile
        </span>
        <h1 className="text-3xl md:text-5xl font-aboreto text-title tracking-[0.1em] uppercase leading-tight mb-6">
          Collection
        </h1>
        <div className="w-16 h-px bg-red-button/40 mx-auto"></div>
      </ScrollReveal>

      {/* Filtres */}
      <ScrollReveal delay={100} className="flex justify-center gap-3 mb-16 flex-wrap">
        {(['all', 'framed', 'unframed'] as Filter[]).map(key => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className={`px-6 py-2.5 text-xs font-montserrat font-medium tracking-[0.3em] uppercase rounded-sm border transition-all duration-300 ${
              activeFilter === key
                ? 'bg-red-button text-white border-red-button'
                : 'bg-transparent text-subtitle border-subtitle/30 hover:border-red-button hover:text-red-button'
            }`}
          >
            {label(key)}
          </button>
        ))}
      </ScrollReveal>

      {/* Grille produits */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12 lg:gap-16">
        {filtered.map((product, index) => (
          <ScrollReveal key={product.id} delay={index * 100} className="flex flex-col gap-4">
            <div className="transition-transform duration-700 hover:-translate-y-4">
              <ProductCard product={product} index={index} />
            </div>
            {product.subtitle && (
              <div className="text-center">
                <p className="text-[10px] md:text-xs font-montserrat font-bold tracking-[0.3em] uppercase text-red-button/80">
                  {getLocalized(product.subtitle, locale)}
                </p>
              </div>
            )}
          </ScrollReveal>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-24 text-subtitle/50 font-playfair italic text-lg">
          —
        </div>
      )}
    </div>
  );
};

export default CollectionPage;
