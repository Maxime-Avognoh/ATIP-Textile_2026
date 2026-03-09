import React from 'react';
import ProductCard from '../components/ProductCard';
import { useLocale } from '../context/LocaleContext';
import { useProducts } from '../context/ProductContext';

const CollectionPage: React.FC = () => {
  const { t } = useLocale();
  const { products } = useProducts();

  return (
    <div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-aboreto text-title mb-2 animate-fade-in-down">{t('home.title')}</h1>
        <p className="text-xl text-subtitle/90 font-playfair animate-fade-in-up animation-delay-300">{t('home.subtitle')}</p>
      </div> 
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
    </div>
  );
};

export default CollectionPage;
