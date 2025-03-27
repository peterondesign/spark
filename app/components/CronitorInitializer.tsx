"use client";
import { useEffect } from 'react';

export default function CronitorInitializer() {
  useEffect(() => {
    const initCronitor = async () => {
      try {
        if (typeof window !== 'undefined') {
          const Cronitor = (await import('@cronitorio/cronitor-rum')).default;
          Cronitor.load("c410217d0de023a4f93f18e5550cf62a", {
            debug: false,
            trackMode: 'history',
          });
        }
      } catch (error) {
        console.error('Error initializing Cronitor:', error);
      }
    };

    initCronitor();
  }, []);

  return null;
}
