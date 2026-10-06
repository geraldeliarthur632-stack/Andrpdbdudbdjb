import { useState, useEffect } from 'react';

export interface ScreenDimensions {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isTouchDevice: boolean;
  isLandscape: boolean;
  pixelRatio: number;
  safeHeight: number;
  textScale: 'standard' | 'large' | 'comfort';
}

const TEXT_SCALE_KEY = 'estudahud_text_scale_v1';

export function useScreenAdaptation() {
  const [textScale, setTextScale] = useState<'standard' | 'large' | 'comfort'>(() => {
    try {
      const saved = localStorage.getItem(TEXT_SCALE_KEY);
      if (saved === 'standard' || saved === 'large' || saved === 'comfort') {
        return saved;
      }
    } catch {}
    return 'standard';
  });

  const [screenInfo, setScreenInfo] = useState<ScreenDimensions>(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 400;
    const h = typeof window !== 'undefined' ? window.innerHeight : 800;
    const isTouch =
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0);

    return {
      width: w,
      height: h,
      isMobile: w < 640,
      isTablet: w >= 640 && w < 1024,
      isDesktop: w >= 1024,
      isTouchDevice: isTouch,
      isLandscape: w > h,
      pixelRatio: typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1,
      safeHeight: h,
      textScale: 'standard',
    };
  });

  useEffect(() => {
    const updateDimensions = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      // Set CSS variable for dynamic viewport height (prevent iOS address bar overlap)
      const vh = h * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
      document.documentElement.style.setProperty('--app-height', `${h}px`);

      setScreenInfo({
        width: w,
        height: h,
        isMobile: w < 640,
        isTablet: w >= 640 && w < 1024,
        isDesktop: w >= 1024,
        isTouchDevice: isTouch,
        isLandscape: w > h,
        pixelRatio: window.devicePixelRatio || 1,
        safeHeight: h,
        textScale,
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions, { passive: true });
    window.addEventListener('orientationchange', updateDimensions, { passive: true });

    return () => {
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('orientationchange', updateDimensions);
    };
  }, [textScale]);

  const changeTextScale = (scale: 'standard' | 'large' | 'comfort') => {
    setTextScale(scale);
    try {
      localStorage.setItem(TEXT_SCALE_KEY, scale);
    } catch {}
  };

  return {
    ...screenInfo,
    textScale,
    changeTextScale,
  };
}
