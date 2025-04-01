"use client";

import Script from 'next/script';
import { useEffect } from 'react';

// List of common search engine bot user agents
const BOT_USER_AGENTS = [
  'googlebot', 'bingbot', 'yandexbot', 'duckduckbot', 'slurp', 
  'baiduspider', 'twitterbot', 'facebookexternalhit', 'linkedinbot',
  'embedly', 'quora link preview', 'showyoubot', 'outbrain',
  'pinterest', 'slackbot', 'vkShare', 'W3C_Validator', 'applebot'
];

// Function to detect if the current user is a bot
const isBot = () => {
  if (typeof window === 'undefined' || !window.navigator || !window.navigator.userAgent) {
    return false;
  }
  
  const userAgent = window.navigator.userAgent.toLowerCase();
  return BOT_USER_AGENTS.some(bot => userAgent.includes(bot.toLowerCase()));
};

export default function CronitorScript() {
  // Don't render scripts for bots or in development mode
  if (
    typeof window !== 'undefined' && 
    (process.env.NODE_ENV === 'development' || isBot())
  ) {
    return null;
  }

  return (
    <>
      <Script
        id="cronitor-rum-script"
        src="https://rum.cronitor.io/script.js"
        strategy="afterInteractive"
      />
      <Script
        id="cronitor-config"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.cronitor = window.cronitor || function() { (window.cronitor.q = window.cronitor.q || []).push(arguments); };
            cronitor('config', { clientKey: 'c410217d0de023a4f93f18e5550cf62a' });
          `
        }}
      />
    </>
  );
}