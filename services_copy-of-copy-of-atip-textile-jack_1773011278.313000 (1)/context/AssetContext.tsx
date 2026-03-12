
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const DEFAULTS = {
    headerLogo: 'https://storage.googleapis.com/atip_storage/ATIP%20LOGO%20left%20long.png',
    introLogo: 'https://storage.googleapis.com/atip_storage/ATIP%20LOGO%20MINI%20YY_1.png',
    aboutUsImage: 'https://storage.googleapis.com/atip_storage/ATIP_textile_photo-2.jpg',
    introVideo: 'https://videos.pexels.com/video-files/856943/856943-hd_1920_1080_25fps.mp4',
    collectionHeroPattern: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e05?q=80&w=2555&auto=format&fit=crop', // Default textile pattern
};

interface AssetContextType {
  headerLogo: string;
  updateHeaderLogo: (newLogo: string) => void;
  introLogo: string;
  updateIntroLogo: (newLogo: string) => void;
  aboutUsImage: string;
  updateAboutUsImage: (newImage: string) => void;
  introVideo: string;
  updateIntroVideo: (newVideo: string) => void;
  collectionHeroPattern: string;
  updateCollectionHeroPattern: (newPattern: string) => void;
}

const AssetContext = createContext<AssetContextType | undefined>(undefined);

export const AssetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [headerLogo, setHeaderLogo] = useState<string>(DEFAULTS.headerLogo);
  const [introLogo, setIntroLogo] = useState<string>(DEFAULTS.introLogo);
  const [aboutUsImage, setAboutUsImage] = useState<string>(DEFAULTS.aboutUsImage);
  const [introVideo, setIntroVideo] = useState<string>(DEFAULTS.introVideo);
  const [collectionHeroPattern, setCollectionHeroPattern] = useState<string>(DEFAULTS.collectionHeroPattern);

  useEffect(() => {
    try {
      const savedHeaderLogo = localStorage.getItem('customHeaderLogo');
      if (savedHeaderLogo) setHeaderLogo(savedHeaderLogo);
      
      const savedIntroLogo = localStorage.getItem('customIntroLogo');
      if (savedIntroLogo) setIntroLogo(savedIntroLogo);
      
      const savedAboutUsImage = localStorage.getItem('customAboutUsImage');
      if (savedAboutUsImage) setAboutUsImage(savedAboutUsImage);

      const savedIntroVideo = localStorage.getItem('customIntroVideo');
      if (savedIntroVideo) setIntroVideo(savedIntroVideo);

      const savedHeroPattern = localStorage.getItem('customHeroPattern');
      if (savedHeroPattern) setCollectionHeroPattern(savedHeroPattern);

    } catch (error) {
        console.error("Could not read assets from localStorage", error);
    }
  }, []);

  const updateHeaderLogo = (newLogo: string) => {
    setHeaderLogo(newLogo);
    localStorage.setItem('customHeaderLogo', newLogo);
  };

  const updateIntroLogo = (newLogo: string) => {
    setIntroLogo(newLogo);
    localStorage.setItem('customIntroLogo', newLogo);
  };
  
  const updateAboutUsImage = (newImage: string) => {
    setAboutUsImage(newImage);
    localStorage.setItem('customAboutUsImage', newImage);
  };

  const updateIntroVideo = (newVideo: string) => {
    setIntroVideo(newVideo);
    localStorage.setItem('customIntroVideo', newVideo);
  };

  const updateCollectionHeroPattern = (newPattern: string) => {
    setCollectionHeroPattern(newPattern);
    localStorage.setItem('customHeroPattern', newPattern);
  }
  
  const value = { 
      headerLogo, 
      updateHeaderLogo,
      introLogo,
      updateIntroLogo,
      aboutUsImage,
      updateAboutUsImage,
      introVideo,
      updateIntroVideo,
      collectionHeroPattern,
      updateCollectionHeroPattern
  };

  return (
    <AssetContext.Provider value={value}>
      {children}
    </AssetContext.Provider>
  );
};

export const useAsset = () => {
  const context = useContext(AssetContext);
  if (context === undefined) {
    throw new Error('useAsset must be used within a AssetProvider');
  }
  return context;
};
