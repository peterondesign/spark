"use client";
import { useEffect } from 'react';

export default function CronitorInitializer() {
  useEffect(() => {
    const initCronitor = async () => {
      try {
        if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'development') {
          const CronitorModule = await import('@cronitorio/cronitor-rum');
          const Cronitor = CronitorModule?.default;

          if (Cronitor && typeof Cronitor.load === 'function') {
            Cronitor.load("c410217d0de023a4f93f18e5550cf62a", {
              debug: false,
              trackMode: 'history',
            });
          } else {
            console.warn('Cronitor module is not properly loaded.');
          }
        }
      } catch (error) {
        console.error('Error initializing Cronitor:', error);
      }
    };

    initCronitor();
  }, []);

  return null;
}
