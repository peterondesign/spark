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
  const [embedError, setEmbedError] = useState(false);
  const blockquoteRef = useRef<HTMLQuoteElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Extract video ID from URL for iframe fallback
  const getVideoId = (url: string) => {
    const match = url.match(/\/video\/(\d+)/);
    return match ? match[1] : '';
  };

  useEffect(() => {
    if (!scriptLoaded || embedReady || embedError) return;

    const processEmbed = () => {
      if (typeof window !== 'undefined' && blockquoteRef.current) {
        const win = window as any;
        
        // Check if TikTok embed script is available
        if (!win.tiktok) {
          console.log('TikTok object not available, trying iframe fallback');
          setUseIframeFallback(true);
          return;
        }
        
        // Try multiple TikTok embed methods
        const embedMethods = [
          () => {
            // Most reliable method - process all blockquotes
            const blockquotes = document.querySelectorAll('blockquote.tiktok-embed');
            if (blockquotes.length > 0 && win.tiktok?.embed?.process) {
              win.tiktok.embed.process();
              return true;
            }
            return false;
          },
          () => win.tiktok?.lib?.render?.(blockquoteRef.current),
          () => win.tiktok?.oembed?.process?.(),
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

        // Check if the blockquote has been transformed (indicates success)
        if (blockquoteRef.current && blockquoteRef.current.querySelector('iframe')) {
          console.log('TikTok iframe detected, embed successful');
          setEmbedReady(true);
          return;
        }

        console.log('All embed methods failed, TikTok object:', win.tiktok);
      }
    };

    // Try processing immediately
    processEmbed();

    // Set up fallback timeout (3 seconds - shorter timeout)
    timeoutRef.current = setTimeout(() => {
      if (!embedReady && !embedError) {
        console.log('TikTok embed timeout, switching to iframe fallback');
        setUseIframeFallback(true);
      }
    }, 3000);

    // Try processing every 1000ms for up to 3 seconds
    const interval = setInterval(() => {
      if (!embedReady && !embedError) {
        processEmbed();
      } else {
        clearInterval(interval);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [scriptLoaded, embedReady, embedError]);

  const handleScriptLoad = () => {
    console.log('TikTok embed script loaded');
    setScriptLoaded(true);
  };

  const handleScriptError = () => {
    console.log('TikTok script failed to load, using iframe fallback');
    setEmbedError(true);
    setUseIframeFallback(true);
  };

  // Iframe fallback method
  if (useIframeFallback) {
    const videoId = getVideoId(url);
    if (videoId) {
      return (
        <div className="tiktok-container">
          <iframe
            src={`https://www.tiktok.com/embed/v2/${videoId}?referrer=https%3A%2F%2Fdate-ideas.cc`}
            width="325"
            height="580"
            frameBorder="0"
            allow="encrypted-media;"
            sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
            style={{
              maxWidth: '605px',
              minWidth: '325px',
              margin: '0 auto',
              borderRadius: '8px'
            }}
          />
        </div>
      );
    } else {
      // If we can't extract video ID, show a link to TikTok
      return (
        <div className="tiktok-container" style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ 
            border: '2px dashed #ccc', 
            borderRadius: '8px', 
            padding: '40px 20px',
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            <p style={{ marginBottom: '16px', color: '#666' }}>
              Unable to embed TikTok video
            </p>
            <a 
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                backgroundColor: '#000',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '25px',
                textDecoration: 'none',
                fontWeight: 'bold'
              }}
            >
              Watch on TikTok
            </a>
          </div>
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
    </div>
  );
}
