"use client";
import { useEffect } from 'react';

// List of common search engine bot user agents
const BOT_USER_AGENTS = [
  'googlebot',
  'bingbot',
  'yandexbot',
  'duckduckbot',
  'slurp',
  'baiduspider',
  'twitterbot',
  'facebookexternalhit',
  'linkedinbot',
  'embedly',
  'quora link preview',
  'showyoubot',
  'outbrain',
  'pinterest',
  'slackbot',
  'vkShare',
  'W3C_Validator',
  'applebot'
];

// Function to detect if the current user is a bot
const isBot = () => {
  if (typeof window === 'undefined' || !window.navigator || !window.navigator.userAgent) {
    return false;
  }
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  return BOT_USER_AGENTS.some(bot => userAgent.includes(bot.toLowerCase()));
};

export default function CronitorInitializer() {
  useEffect(() => {
    const initCronitor = async () => {
      try {
        // Only load Cronitor if not in development, not a bot, and in browser environment
        if (
          typeof window !== 'undefined' && 
          process.env.NODE_ENV !== 'development' && 
          !isBot()
        ) {
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
