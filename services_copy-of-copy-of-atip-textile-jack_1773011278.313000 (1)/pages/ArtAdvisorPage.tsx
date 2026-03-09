
import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { useProducts } from '../context/ProductContext';
import { useLocale } from '../context/LocaleContext';
import ProductCard from '../components/ProductCard';
import Button from '../components/Button';
import BackToCollectionLink from '../components/BackToCollectionLink';
import { Product } from '../types';

const ArtAdvisorPage: React.FC = () => {
    const { t, locale } = useLocale();
    const { products } = useProducts();
    const [prompt, setPrompt] = useState('');
    const [suggestedProducts, setSuggestedProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const handleGetSuggestions = async () => {
        if (!prompt.trim()) return;

        setIsLoading(true);
        setError(null);
        setHasSearched(true);
        setSuggestedProducts([]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

            const productsForAI = products.map(p => ({
                id: p.id,
                name: p.name[locale],
                description: p.description[locale],
            }));

            const userPrompt = `
                User description: "${prompt}"
                
                Available products:
                ${JSON.stringify(productsForAI)}
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: userPrompt,
                config: {
                    systemInstruction: "You are an expert interior design assistant. Based on the user's description, you will recommend the most suitable art canvases from the provided list of available products. Your response should only contain the product IDs.",
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.STRING,
                            description: "The ID of a recommended product."
                        }
                    },
                },
            });
            
            const recommendedIds = JSON.parse(response.text || '[]');

            if (Array.isArray(recommendedIds) && recommendedIds.length > 0) {
                const suggestions = recommendedIds
                    .map(id => products.find(p => p.id === id))
                    .filter((p): p is Product => p !== undefined);
                setSuggestedProducts(suggestions);
            } else {
                setSuggestedProducts([]);
            }

        } catch (err) {
            console.error("Error calling Gemini API:", err);
            setError(t('artAdvisor.error'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto pt-32 pb-12 px-4 animate-fade-in">
            <div className="animate-fade-in">
                <BackToCollectionLink />
            </div>
            <div className="text-center mb-12">
                <h1 className="text-4xl font-aboreto text-title mb-2">{t('artAdvisor.title')}</h1>
                <p className="text-xl text-subtitle/90 font-playfair">{t('artAdvisor.subtitle')}</p>
            </div>

            <div className="max-w-3xl mx-auto bg-black-button/20 p-8 rounded-lg shadow-xl animate-fade-in">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={t('artAdvisor.placeholder')}
                    rows={5}
                    className="w-full bg-white dark:bg-black-button text-subtitle border border-subtitle/20 rounded-md shadow-sm p-4 focus:outline-none focus:ring-2 focus:ring-red-button text-lg"
                    aria-label={t('artAdvisor.placeholder')}
                />
                <div className="mt-6 flex justify-center">
                    <Button variant="red" onClick={handleGetSuggestions} disabled={isLoading || !prompt.trim()}>
                        {isLoading ? (
                            <span className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {t('artAdvisor.loading')}
                            </span>
                        ) : (
                            t('artAdvisor.button')
                        )}
                    </Button>
                </div>
            </div>

            {hasSearched && !isLoading && (
                <div className="mt-16 animate-fade-in">
                    {error ? (
                        <p className="text-center text-red-500 text-lg">{error}</p>
                    ) : suggestedProducts.length > 0 ? (
                        <>
                            <h2 className="text-3xl font-aboreto text-title text-center mb-12">{t('artAdvisor.resultsTitle')}</h2>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                {suggestedProducts.map((product, index) => (
                                    <ProductCard key={product.id} product={product} index={index} />
                                ))}
                            </div>
                        </>
                    ) : (
                        <p className="text-center text-subtitle/90 text-lg">{t('artAdvisor.noResults')}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ArtAdvisorPage;
