
import React, { useState, useEffect, useRef } from 'react';
import { useAsset } from '../context/AssetContext';
import { useProducts } from '../context/ProductContext';
import { useLocale } from '../context/LocaleContext';
import Button from '../components/Button';
import { Product } from '../types';
import BackToCollectionLink from '../components/BackToCollectionLink';

const AssetUploader: React.FC<{ onUpload: (base64: string) => void, buttonText: string, accept: string }> = ({ onUpload, buttonText, accept }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onUpload(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept={accept}
            />
            <Button variant="black" onClick={handleClick}>{buttonText}</Button>
        </>
    );
};

interface EditableAssetProps {
    label: string;
    currentSrc: string;
    onSave: (newSrc: string) => void;
    assetType: 'image' | 'video';
    className?: string;
}

const EditableAsset: React.FC<EditableAssetProps> = ({ label, currentSrc, onSave, assetType, className }) => {
    const { t } = useLocale();
    const [pendingSrc, setPendingSrc] = useState<string | null>(null);

    const handleSave = () => {
        if (pendingSrc) {
            onSave(pendingSrc);
            setPendingSrc(null);
        }
    };

    const handleCancel = () => {
        setPendingSrc(null);
    };

    const buttonText = assetType === 'image' ? t('assetManager.changeButton') : t('assetManager.changeVideoButton');

    return (
        <div>
            <h3 className="text-xl font-aboreto text-title/90 mb-4">{label}</h3>
            {assetType === 'image' ? (
                <img src={pendingSrc || currentSrc} alt={`Current ${label}`} className={`object-cover bg-background/50 p-2 rounded-md mb-4 ${className || 'h-24 w-auto'}`}/>
            ) : (
                <video key={pendingSrc || currentSrc} controls muted className={`w-full h-auto rounded-md mb-4 ${className || 'max-h-48'}`}>
                   <source src={pendingSrc || currentSrc} />
                </video>
            )}
            <div className="flex items-center gap-4">
                <AssetUploader onUpload={setPendingSrc} buttonText={buttonText} accept={`${assetType}/*`} />
                {pendingSrc && (
                    <>
                        <Button variant="red" onClick={handleSave}>{t('assetManager.saveButton')}</Button>
                        <Button variant="black" onClick={handleCancel}>{t('assetManager.cancelButton')}</Button>
                    </>
                )}
            </div>
        </div>
    );
};

const ProductImageEditor: React.FC<{ product: Product }> = ({ product }) => {
    const { updateProductImages } = useProducts();
    const { locale, t } = useLocale();
    const [pendingImages, setPendingImages] = useState(product.images);
    const [imageUrl, setImageUrl] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setPendingImages(product.images);
    }, [product.images]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files);
            const newImagesPromises = filesArray.map((file: File) => {
                return new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(file);
                });
            });
            Promise.all(newImagesPromises).then(newImagesBase64 => {
                setPendingImages(prev => [...prev, ...newImagesBase64]);
            });
        }
    };
    
    const handleAddClick = () => fileInputRef.current?.click();

    const handleAddFromUrl = () => {
        if (imageUrl.trim()) {
            setPendingImages(prev => [...prev, imageUrl.trim()]);
            setImageUrl('');
        }
    };

    const removeImage = (indexToRemove: number) => {
        setPendingImages(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSaveChanges = () => {
        updateProductImages(product.id, pendingImages);
        alert('Changes saved!');
    };
    
    const handleCancel = () => {
        setPendingImages(product.images);
    };

    return (
        <div className="mt-4 pt-4 border-t border-subtitle/10">
            <h4 className="text-xl font-aboreto text-title/90 mb-4">{product.name[locale]}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
                {pendingImages.map((img, index) => (
                    <div key={index} className="relative group aspect-square">
                        <img src={img} alt={`Preview ${index + 1}`} loading="lazy" className="w-full h-full object-cover rounded-md shadow-lg" />
                        <button 
                            onClick={() => removeImage(index)} 
                            className="absolute -top-2 -right-2 bg-red-button text-white rounded-full h-7 w-7 flex items-center justify-center transition-all duration-200 hover:scale-110"
                            aria-label="Remove image"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                ))}
                 <label onClick={handleAddClick} className="flex items-center justify-center aspect-square border-2 border-dashed border-subtitle/50 rounded-md cursor-pointer hover:bg-black-button/20 transition-colors text-subtitle/50 hover:text-subtitle">
                    <div className="text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                        <span className="mt-2 block text-sm">{t('assetManager.addImage')}</span>
                    </div>
                    <input type="file" multiple ref={fileInputRef} accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
            </div>
            <div className="mt-4 flex items-stretch gap-2">
                <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder={t('assetManager.imageUrlPlaceholder')}
                    className="flex-grow bg-white dark:bg-black-button text-subtitle border border-subtitle/20 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-red-button focus:border-red-button text-sm"
                />
                <Button variant="black" onClick={handleAddFromUrl} className="py-2 px-4 text-sm font-semibold">
                    {t('assetManager.addImageFromUrl')}
                </Button>
            </div>
            <div className="flex justify-start gap-4 mt-6">
                <Button variant="red" onClick={handleSaveChanges} disabled={JSON.stringify(pendingImages) === JSON.stringify(product.images)}>{t('assetManager.saveButton')}</Button>
                <Button variant="black" onClick={handleCancel} disabled={JSON.stringify(pendingImages) === JSON.stringify(product.images)}>{t('assetManager.cancelButton')}</Button>
            </div>
        </div>
    );
};

const AssetManagerPage: React.FC = () => {
    const { t } = useLocale();
    const { 
        headerLogo, updateHeaderLogo, 
        introLogo, updateIntroLogo, 
        aboutUsImage, updateAboutUsImage, 
        introVideo, updateIntroVideo,
        collectionHeroPattern, updateCollectionHeroPattern
    } = useAsset();
    const { products } = useProducts();

    return (
        <div className="max-w-7xl mx-auto pt-32 pb-12 px-4 animate-fade-in">
            <div className="animate-fade-in">
              <BackToCollectionLink />
            </div>
            <h1 className="text-4xl font-aboreto text-title text-center mb-12">{t('assetManager.title')}</h1>

            <div className="space-y-12">
                {/* Global Assets Section */}
                <section className="bg-black-button/20 p-8 rounded-lg shadow-xl animate-fade-in">
                    <h2 className="text-3xl font-aboreto text-title mb-6">{t('assetManager.global.title')}</h2>
                    <div className="grid md:grid-cols-2 gap-x-8 gap-y-12 items-start">
                        <div className="space-y-8">
                            <EditableAsset label={t('assetManager.logos.header')} currentSrc={headerLogo} onSave={updateHeaderLogo} assetType="image" />
                            <EditableAsset label={t('assetManager.logos.intro')} currentSrc={introLogo} onSave={updateIntroLogo} assetType="image" />
                        </div>
                        <div className="space-y-8">
                            <EditableAsset label={t('assetManager.pages.about')} currentSrc={aboutUsImage} onSave={updateAboutUsImage} assetType="image" className="w-full aspect-[4/5]" />
                            <EditableAsset label={t('assetManager.pages.home')} currentSrc={collectionHeroPattern} onSave={updateCollectionHeroPattern} assetType="image" className="w-full h-32" />
                        </div>
                         <div className="md:col-span-2 space-y-8">
                           <EditableAsset label={t('assetManager.video.intro')} currentSrc={introVideo} onSave={updateIntroVideo} assetType="video" />
                         </div>
                    </div>
                </section>

                {/* Product Images Section */}
                <section className="bg-black-button/20 p-8 rounded-lg shadow-xl animate-fade-in">
                    <h2 className="text-3xl font-aboreto text-title mb-6">{t('assetManager.products.title')}</h2>
                    <div className="space-y-8">
                        {products.map(product => <ProductImageEditor key={product.id} product={product} />)}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default AssetManagerPage;
