
import React from 'react';

interface ProtectedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  onClick?: () => void;
  onLoad?: () => void;
}

const ProtectedImage: React.FC<ProtectedImageProps> = ({ 
  src, 
  alt, 
  className, 
  containerClassName, 
  onClick, 
  onLoad,
  ...props 
}) => {
  return (
    <div 
      className={`relative select-none ${containerClassName || 'w-full h-full'}`}
      onContextMenu={(e) => e.preventDefault()}
    >
      <img
        src={src}
        alt={alt}
        className={`${className} pointer-events-none`}
        draggable={false}
        onLoad={onLoad}
        {...props}
      />
      
      <div 
        className="absolute inset-0 z-10 bg-transparent"
        onClick={onClick}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
};

export default ProtectedImage;
