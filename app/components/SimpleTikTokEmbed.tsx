'use client';

import { useEffect, useRef, useState } from 'react';

interface SimpleTikTokEmbedProps {
  url: string;
}

export default function SimpleTikTokEmbed({ url }: SimpleTikTokEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [embedLoaded, setEmbedLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  // Extract video ID from URL
  const getVideoId = (url: string) => {
    const match = url.match(/\/video\/(\d+)/);
    return match ? match[1] : '';
  };

  useEffect(() => {
    if (!containerRef.current) return;


    // Load TikTok embed script
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.tiktok.com/embed.js';
    
    script.onload = () => {
      console.log('TikTok script loaded');
      
      // Try to process the embed
      const tryEmbed = () => {
        const win = window as any;
        if (win.tiktok && win.tiktok.embed && win.tiktok.embed.process) {
          try {
            win.tiktok.embed.process();
            setEmbedLoaded(true);
          } catch (error) {
            console.error('TikTok embed error:', error);
            setShowFallback(true);
          }
        } else {
          // Retry without logging
          setTimeout(tryEmbed, 500);
        }
      };

      setTimeout(tryEmbed, 100);
    };

    script.onerror = () => {
      console.error('Failed to load TikTok script');
      setShowFallback(true);
    };

    document.head.appendChild(script);

    // Fallback timeout
    const timeout = setTimeout(() => {
      if (!embedLoaded) {
        setShowFallback(true);
      }
    }, 5000);

    return () => {
      clearTimeout(timeout);
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      // Remove script if it was added
      const existingScript = document.querySelector('script[src="https://www.tiktok.com/embed.js"]');
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, [url]);

  if (showFallback) {
    const videoId = getVideoId(url);
    
    return (
      <div ref={containerRef} className="tiktok-container">
        {videoId ? (
          <iframe
            src={`https://www.tiktok.com/embed/v2/${videoId}`}
            width="325"
            height="580"
            frameBorder="0"
            allow="encrypted-media; fullscreen;"
            sandbox="allow-scripts allow-same-origin allow-popups allow-presentation"
            style={{
              maxWidth: '605px',
              minWidth: '325px',
              margin: '0 auto',
              borderRadius: '8px',
              border: '1px solid #ddd'
            }}
            title="TikTok video"
          />
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            border: '2px dashed #ddd',
            borderRadius: '8px',
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            <div style={{ marginBottom: '20px', fontSize: '18px', color: '#666' }}>
              🎵 TikTok Video
            </div>
            <p style={{ marginBottom: '20px', color: '#888' }}>
              Click below to watch on TikTok
            </p>
            <a 
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                backgroundColor: '#000',
                color: '#fff',
                padding: '12px 30px',
                borderRadius: '25px',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              Watch on TikTok →
            </a>
          </div>
        )}
      </div>
    );
  }

  return <div ref={containerRef} className="tiktok-container" />;
}
