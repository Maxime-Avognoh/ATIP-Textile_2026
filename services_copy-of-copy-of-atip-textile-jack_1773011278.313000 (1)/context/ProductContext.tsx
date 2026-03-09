
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types';
import { PRODUCTS as INITIAL_PRODUCTS } from '../constants';

interface ProductContextType {
  products: Product[];
  updateProductImages: (productId: string, newImages: string[]) => void;
  getProductById: (productId: string) => Product | undefined;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const localData = localStorage.getItem('products');
      const storedProducts: Product[] = localData ? JSON.parse(localData) : INITIAL_PRODUCTS;
      
      // Merge INITIAL_PRODUCTS into storedProducts to ensure new fields like 'subtitle' are present
      return INITIAL_PRODUCTS.map(initialProduct => {
        const storedProduct = storedProducts.find(p => p.id === initialProduct.id);
        if (storedProduct) {
          return {
            ...initialProduct,
            ...storedProduct,
            // Prioritize initialProduct's name and subtitle if they were updated in constants.ts
            name: initialProduct.name,
            subtitle: initialProduct.subtitle,
            description: initialProduct.description,
            price: initialProduct.price,
            // Keep stored images as they might have been updated via AssetManager
            images: storedProduct.images || initialProduct.images
          };
        }
        return initialProduct;
      });
    } catch (error) {
      console.error("Could not parse products from localStorage", error);
      return INITIAL_PRODUCTS;
    }
  });

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  const updateProductImages = (productId: string, newImages: string[]) => {
    setProducts(prevProducts =>
      prevProducts.map(p =>
        p.id === productId ? { ...p, images: newImages } : p
      )
    );
  };
  
  const getProductById = (productId: string): Product | undefined => {
    return products.find(p => p.id === productId);
  };

  return (
    <ProductContext.Provider value={{ products, updateProductImages, getProductById }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
