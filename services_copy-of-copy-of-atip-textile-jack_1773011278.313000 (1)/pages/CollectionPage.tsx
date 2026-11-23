import React, { useState } from 'react';
import { Product, getLocalized } from '../types';
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

const SECTION_TITLES = {
  framed60: {
    en: '60×20 cm — Framed', fr: '60×20 cm — Encadré', es: '60×20 cm — Enmarcado',
    it: '60×20 cm — Incorniciato', de: '60×20 cm — Gerahmt', pt: '60×20 cm — Emoldurado', nl: '60×20 cm — Ingelijst',
  },
  framed20: {
    en: '20×20 cm — Framed', fr: '20×20 cm — Encadré', es: '20×20 cm — Enmarcado',
    it: '20×20 cm — Incorniciato', de: '20×20 cm — Gerahmt', pt: '20×20 cm — Emoldurado', nl: '20×20 cm — Ingelijst',
  },
  unframed60: {
    en: '60×20 cm — Unframed', fr: '60×20 cm — Sans cadre', es: '60×20 cm — Sin marco',
    it: '60×20 cm — Senza cornice', de: '60×20 cm — Ohne Rahmen', pt: '60×20 cm — Sem moldura', nl: '60×20 cm — Zonder lijst',
  },
};

const is60x20Framed   = (p: Product) => p.subtitle.en?.includes('60x20') && !p.subtitle.en?.toLowerCase().includes('unframed');
const is20x20Framed   = (p: Product) => p.subtitle.en?.includes('20x20');
const is60x20Unframed = (p: Product) => p.subtitle.en?.includes('60x20') && p.subtitle.en?.toLowerCase().includes('unframed');

const CollectionPage: React.FC = () => {
  const { locale } = useLocale();
  const { products } = useProducts();
  const [activeFilter, setActiveFilter] = useState<Filter>('all');

  const filterLabel = (key: Filter) => FILTER_LABELS[key][locale] ?? FILTER_LABELS[key].en;
  const sectionLabel = (key: keyof typeof SECTION_TITLES) => {
    const t = SECTION_TITLES[key];
    return (t as Record<string, string>)[locale] ?? t.en;
  };

  const SECTIONS: { key: keyof typeof SECTION_TITLES; match: (p: Product) => boolean; showOn: Filter[] }[] = [
    { key: 'framed60',   match: is60x20Framed,   showOn: ['all', 'framed']   },
    { key: 'framed20',   match: is20x20Framed,   showOn: ['all', 'framed']   },
    { key: 'unframed60', match: is60x20Unframed, showOn: ['all', 'unframed'] },
  ];

  const visibleSections = SECTIONS
    .filter(s => s.showOn.includes(activeFilter))
    .map(s => ({ ...s, items: products.filter(s.match) }))
    .filter(s => s.items.length > 0);

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
      </ScrollReveal>

      {/* Filtres */}
      <ScrollReveal delay={100} className="flex justify-center gap-2 md:gap-3 mb-16">
        {(['all', 'framed', 'unframed'] as Filter[]).map(key => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className={`whitespace-nowrap px-4 md:px-6 py-2.5 text-xs font-montserrat font-medium tracking-[0.2em] md:tracking-[0.3em] uppercase rounded-sm border transition-all duration-300 ${
              activeFilter === key
                ? 'bg-red-button text-white border-red-button'
                : 'bg-transparent text-subtitle border-subtitle/30 hover:border-red-button hover:text-red-button'
            }`}
          >
            {filterLabel(key)}
          </button>
        ))}
      </ScrollReveal>

      {/* Sections */}
      {visibleSections.map((section, si) => (
        <div key={section.key} className={si > 0 ? 'mt-20' : ''}>
          <ScrollReveal>
            <h2 className="text-[10px] font-montserrat font-semibold tracking-[0.4em] uppercase text-subtitle/50 mb-10 text-center border-b border-subtitle/10 pb-4">
              {sectionLabel(section.key)}
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-12 lg:gap-16">
            {section.items.map((product, index) => (
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
        </div>
      ))}

      {visibleSections.length === 0 && (
        <div className="text-center py-24 text-subtitle/50 font-playfair italic text-lg" />
      )}
    </div>
  );
};

export default CollectionPage;
