
import React, { useRef } from 'react';
import ProtectedImage from './ProtectedImage';

interface ImageCarouselProps {
  images: string[];
  currentIndex: number;
  onIndexChange: (index: number) => void;
  objectFit?: 'cover' | 'contain';
  showDots?: boolean;
  showArrows?: boolean;
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images,
  currentIndex,
  onIndexChange,
  objectFit = 'cover',
  showDots = true,
  showArrows = true,
}) => {
  const touchStartRef = useRef<number | null>(null);
  const touchEndRef = useRef<number | null>(null);
  const minSwipeDistance = 50;

  const goToPrevious = () => {
    const isFirstImage = currentIndex === 0;
    const newIndex = isFirstImage ? images.length - 1 : currentIndex - 1;
    onIndexChange(newIndex);
  };

  const goToNext = () => {
    const isLastImage = currentIndex === images.length - 1;
    const newIndex = isLastImage ? 0 : currentIndex + 1;
    onIndexChange(newIndex);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchEndRef.current = null; // Reset touch end
    touchStartRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartRef.current || !touchEndRef.current) return;
    const distance = touchStartRef.current - touchEndRef.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }

    touchStartRef.current = null;
    touchEndRef.current = null;
  };

  if (!images || images.length === 0) {
    return <div>No images available.</div>;
  }

  return (
    <div
      className="relative w-full h-full rounded-lg overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((src, index) => (
          <ProtectedImage
            key={src}
            src={src}
            alt={`Slide ${index + 1}`}
            loading={index === 0 ? 'eager' : 'lazy'}
            containerClassName="w-full h-full flex-shrink-0 flex items-center justify-center"
            className={`w-full h-full ${objectFit === 'contain' ? 'object-contain' : 'object-cover'}`}
          />
        ))}
      </div>
      <button
        onClick={goToPrevious}
        className={`hidden lg:block absolute top-1/2 left-4 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 focus:outline-none z-20 transition-all duration-500 ${showArrows ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-label="Previous image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={goToNext}
        className={`hidden lg:block absolute top-1/2 right-4 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 focus:outline-none z-20 transition-all duration-500 ${showArrows ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-label="Next image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
      {showDots && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => onIndexChange(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                currentIndex === index ? 'bg-white' : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageCarousel;
