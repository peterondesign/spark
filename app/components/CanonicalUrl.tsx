"use client";

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface CanonicalUrlProps {
  baseUrl: string;
}

export default function CanonicalUrl({ baseUrl }: CanonicalUrlProps) {
  const pathname = usePathname();
  
  useEffect(() => {
    // Get existing canonical link or create a new one
    let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    
    // Set the href to the full canonical URL
    canonicalLink.href = `${baseUrl}${pathname}`;
  }, [pathname, baseUrl]);

  // This component doesn't render anything visible
  return null;
}