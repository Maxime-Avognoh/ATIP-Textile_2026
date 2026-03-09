import React, { useState } from 'react';
import { useLocale } from '../context/LocaleContext';

interface ShareButtonProps {
  productId: string;
  productName: string;
  className?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ productId, productName, className }) => {
  const [copied, setCopied] = useState(false);
  const { t } = useLocale();

  const handleShare = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const productPath = `#/product/${productId}`;
    const base = window.location.href.split('#')[0];
    const url = new URL(productPath, base).href;

    const shareData = {
        title: t('share.shareTextTitle', { productName }),
        text: t('share.shareTextBody', { productName }),
        url: url,
    };

    if (navigator.share) {
        try {
            await navigator.share(shareData);
        } catch (err) {
            console.log('Share was cancelled or failed.', err);
        }
    } else {
        navigator.clipboard.writeText(url).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(err => {
            console.error('Failed to copy URL: ', err);
            alert('Could not copy link to clipboard.');
        });
    }
  };


  return (
    <button
      onClick={handleShare}
      className={`relative flex items-center justify-center transition-all duration-200 ${className}`}
      aria-label={copied ? t('share.copied') : t('share.title')}
      title={copied ? t('share.copied') : t('share.title')}
    >
      <div className={`transition-transform duration-300 ${copied ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
          </svg>
      </div>
      <div className={`absolute transition-transform duration-300 ${copied ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
      </div>
    </button>
  );
};

export default ShareButton;
