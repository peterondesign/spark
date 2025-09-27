'use client';

import { useEffect, useState, useRef } from 'react';
import Script from 'next/script';

interface TikTokEmbedProps {
  url: string;
}

/**
 * Renders an embedded TikTok video using multiple fallback methods.
 */
export default function TikTokEmbed({ url }: TikTokEmbedProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [embedReady, setEmbedReady] = useState(false);
  const [useIframeFallback, setUseIframeFallback] = useState(false);
  const blockquoteRef = useRef<HTMLQuoteElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Extract video ID from URL for iframe fallback
  const getVideoId = (url: string) => {
    const match = url.match(/\/video\/(\d+)/);
    return match ? match[1] : '';
  };

  useEffect(() => {
    if (!scriptLoaded || embedReady) return;

    const processEmbed = () => {
      if (typeof window !== 'undefined' && blockquoteRef.current) {
        const win = window as any;
        
        // Try multiple TikTok embed methods
        const embedMethods = [
          () => win.tiktok?.lib?.render?.(blockquoteRef.current),
          () => win.tiktok?.embed?.process?.(),
          () => win.tiktok?.oembed?.process?.(),
          () => {
            // Alternative method: look for all blockquotes and process them
            const blockquotes = document.querySelectorAll('blockquote.tiktok-embed');
            blockquotes.forEach((bq) => {
              if (win.tiktok?.lib?.render) {
                win.tiktok.lib.render(bq);
              }
            });
          }
        ];

        for (const method of embedMethods) {
          try {
            const result = method();
            if (result !== undefined && result !== false) {
              console.log('TikTok embed processed successfully');
              setEmbedReady(true);
              return;
            }
          } catch (error) {
            console.log('Embed method failed, trying next...', error);
          }
        }

        console.log('All embed methods failed, TikTok object:', win.tiktok);
      }
    };

    // Try processing immediately
    processEmbed();

    // Set up fallback timeout (5 seconds)
    timeoutRef.current = setTimeout(() => {
      if (!embedReady) {
        console.log('TikTok embed timeout, switching to iframe fallback');
        setUseIframeFallback(true);
      }
    }, 5000);

    // Try processing every 500ms for up to 5 seconds
    const interval = setInterval(() => {
      if (!embedReady) {
        processEmbed();
      } else {
        clearInterval(interval);
      }
    }, 500);

    return () => {
      clearInterval(interval);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [scriptLoaded, embedReady]);

  const handleScriptLoad = () => {
    console.log('TikTok embed script loaded');
    setScriptLoaded(true);
  };

  const handleScriptError = () => {
    console.log('TikTok script failed to load, using iframe fallback');
    setUseIframeFallback(true);
  };

  // Iframe fallback method
  if (useIframeFallback) {
    const videoId = getVideoId(url);
    if (videoId) {
      return (
        <div className="tiktok-container">
          <iframe
            src={`https://www.tiktok.com/embed/v2/${videoId}`}
            width="325"
            height="580"
            frameBorder="0"
            allow="encrypted-media;"
            style={{
              maxWidth: '605px',
              minWidth: '325px',
              margin: '0 auto',
              borderRadius: '8px'
            }}
          />
        </div>
      );
    }
  }

  return (
    <div className="tiktok-container">
      <Script
        src="https://www.tiktok.com/embed.js"
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
        onError={handleScriptError}
      />
      
      <blockquote
        ref={blockquoteRef}
        className="tiktok-embed"
        cite={url}
        data-video-id={getVideoId(url)}
        style={{ maxWidth: '605px', minWidth: '325px', margin: '0 auto' }}
      >
        <section>
          <a 
            target="_blank" 
            title="@dateideascc" 
            href={url} 
            rel="noopener noreferrer"
          >
            Loading TikTok video... If this takes too long, 
            <span style={{ display: 'block', marginTop: '8px' }}>
              <strong>click here to view on TikTok</strong>
            </span>
          </a>
        </section>
      </blockquote>
    </div>
  );
}
