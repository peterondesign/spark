import { useState, useEffect } from 'react';
import { getImage } from '../utils/imageService';

// Define the expected response type
type ImageResponse = string | {
  url: string;
  attribution: {
    name: string;
    username: string;
    portfolioUrl: string | null;
    profileUrl: string;
  };
};

export function useImageFetch(query: string, width?: number, height?: number) {
  const [imageData, setImageData] = useState({
    url: '/placeholder.svg',
    attribution: null as {
      name: string;
      username: string;
      portfolioUrl: string | null;
      profileUrl: string;
    } | null,
    isLoading: true,
    error: null as string | null
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchImage() {
      try {
        const result = await getImage(query, width, height) as ImageResponse;
        
        if (isMounted) {
          setImageData({
            url: typeof result === 'string' ? result : result.url,
            attribution: typeof result === 'string' ? null : result.attribution,
            isLoading: false,
            error: null
          });
        }
      } catch (error) {
        if (isMounted) {
          setImageData(prev => ({
            ...prev,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to load image'
          }));
        }
      }
    }

    fetchImage();

    return () => {
      isMounted = false;
    };
  }, [query, width, height]);

  return imageData;
}
