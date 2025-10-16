import { useState, useEffect, useCallback, useRef } from 'react';
import { getImageUrl, preloadImages } from '../utils/imageService';

interface DateIdea {
  id: string;
  title: string;
  category: string;
  image?: string;
  slug?: string;
}

interface UseLazyImagesOptions {
  batchSize?: number;
  threshold?: number;
}

export const useLazyImages = (
  dateIdeas: DateIdea[],
  options: UseLazyImagesOptions = {}
) => {
  const { batchSize = 8, threshold = 0.1 } = options;
  const [imageMap, setImageMap] = useState<Record<string, string>>({});
  const [loadedItems, setLoadedItems] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [backgroundLoading, setBackgroundLoading] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const queueRef = useRef<DateIdea[]>([]);
  const backgroundQueueRef = useRef<DateIdea[]>([]);
  const processingRef = useRef(false);
  const backgroundProcessingRef = useRef(false);

  // Diversity prompts for consistent image requests
  const diversityPrompts = [
    'White couple',
    'diverse couple', 
    'interracial couple',
    'multicultural couple',
    'Asian couple',
    'Black couple',
    'Latino couple',
    'Caucasian couple'
  ];

  const processBatch = useCallback(async (batch: DateIdea[], useCompressed: boolean = true) => {
    if (batch.length === 0) return;

    setIsLoading(true);
    console.log(`🔄 Loading batch of ${batch.length} images${useCompressed ? ' (compressed)' : ''}...`);

    try {
      const imagePromises = batch.map(async (idea) => {
        const key = idea.slug || idea.id;
        
        // Skip if already loaded
        if (loadedItems.has(key)) {
          return null;
        }

        const randomDiversityPrompt = diversityPrompts[Math.floor(Math.random() * diversityPrompts.length)];
        const keyword = `${idea.title} ${idea.category} ${randomDiversityPrompt}`;
        
        try {
          // Use compressed images for faster loading
          const imageUrl = await getImageUrl(idea.image, keyword, 400, 300, useCompressed);
          return { key, imageUrl };
        } catch (error) {
          console.error(`Failed to load image for ${idea.title}:`, error);
          
          // Try a simpler keyword without diversity prompt as fallback
          try {
            const simpleKeyword = `${idea.title} ${idea.category}`;
            const fallbackUrl = await getImageUrl(idea.image, simpleKeyword, 400, 300, useCompressed);
            return { key, imageUrl: fallbackUrl };
          } catch (fallbackError) {
            console.error(`Fallback also failed for ${idea.title}:`, fallbackError);
            // Use the original idea.image if available, otherwise placeholder
            const finalFallback = idea.image || '/placeholder.svg?height=300&width=400&text=' + encodeURIComponent(idea.title);
            return { key, imageUrl: finalFallback };
          }
        }
      });

      const results = await Promise.all(imagePromises);
      
      // Update state with new images
      const newImages: Record<string, string> = {};
      const newLoadedItems = new Set(loadedItems);

      results.forEach(result => {
        if (result) {
          newImages[result.key] = result.imageUrl;
          newLoadedItems.add(result.key);
        }
      });

      if (Object.keys(newImages).length > 0) {
        setImageMap(prev => ({ ...prev, ...newImages }));
        setLoadedItems(newLoadedItems);
        console.log(`✅ Loaded ${Object.keys(newImages).length} images`);
        
        // Preload the actual full-resolution images for immediate display
        preloadImages(Object.values(newImages));
      }
    } catch (error) {
      console.error('Batch loading error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [loadedItems, diversityPrompts]);

  // Enhanced queue manager - processes items in batches with compression for speed
  const processQueue = useCallback(async () => {
    if (processingRef.current || queueRef.current.length === 0) return;

    processingRef.current = true;
    
    while (queueRef.current.length > 0) {
      const batch = queueRef.current.splice(0, batchSize);
      await processBatch(batch, true); // Use compressed images for faster initial load
      
      // Reduced delay between batches for faster processing
      if (queueRef.current.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    processingRef.current = false;
    
    // After priority queue is done, start background loading
    processBackgroundQueue();
  }, [batchSize, processBatch]);

  // Enhanced background queue manager - processes items with lower priority and compression
  const processBackgroundQueue = useCallback(async () => {
    if (backgroundProcessingRef.current || backgroundQueueRef.current.length === 0) return;

    backgroundProcessingRef.current = true;
    setBackgroundLoading(true);
    
    console.log(`🔄 Starting background loading of ${backgroundQueueRef.current.length} images...`);
    
    while (backgroundQueueRef.current.length > 0) {
      const batch = backgroundQueueRef.current.splice(0, Math.max(1, Math.floor(batchSize / 2))); // Smaller batches for background
      await processBatch(batch, true); // Use compressed images for background loading
      
      // Shorter delay for background processing for faster completion
      if (backgroundQueueRef.current.length > 0) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    
    backgroundProcessingRef.current = false;
    setBackgroundLoading(false);
    console.log('✅ Background loading completed');
  }, [batchSize, processBatch]);

  // Add items to priority loading queue (for visible items)
  const queueForLoading = useCallback((items: DateIdea[]) => {
    const newItems = items.filter(item => {
      const key = item.slug || item.id;
      return !loadedItems.has(key);
    });

    if (newItems.length > 0) {
      queueRef.current.push(...newItems);
      processQueue();
    }
  }, [loadedItems, processQueue]);

  // Add items to background loading queue (for off-screen items)
  const queueForBackgroundLoading = useCallback((items: DateIdea[]) => {
    const newItems = items.filter(item => {
      const key = item.slug || item.id;
      return !loadedItems.has(key) && 
             !queueRef.current.some(qItem => (qItem.slug || qItem.id) === key) &&
             !backgroundQueueRef.current.some(bgItem => (bgItem.slug || bgItem.id) === key);
    });

    if (newItems.length > 0) {
      backgroundQueueRef.current.push(...newItems);
      // Only start background processing if priority queue is empty
      if (queueRef.current.length === 0 && !processingRef.current) {
        processBackgroundQueue();
      }
    }
  }, [loadedItems, processBackgroundQueue]);

  // Intersection observer callback
  const handleIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
    const visibleItems: DateIdea[] = [];
    
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const index = parseInt(entry.target.getAttribute('data-index') || '0');
        if (dateIdeas[index]) {
          visibleItems.push(dateIdeas[index]);
        }
      }
    });

    if (visibleItems.length > 0) {
      queueForLoading(visibleItems);
    }
  }, [dateIdeas, queueForLoading]);

  // Setup intersection observer
  useEffect(() => {
    observerRef.current = new IntersectionObserver(handleIntersection, {
      threshold,
      rootMargin: '200px' // Start loading 200px before item comes into view
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleIntersection, threshold]);

  // Observe function for components to use
  const observe = useCallback((element: Element | null, index: number) => {
    if (!element || !observerRef.current) return;
    
    element.setAttribute('data-index', index.toString());
    observerRef.current.observe(element);
    
    return () => {
      if (observerRef.current) {
        observerRef.current.unobserve(element);
      }
    };
  }, []);

  // Load initial batch immediately and queue rest for background loading
  useEffect(() => {
    if (dateIdeas.length > 0) {
      const initialBatch = dateIdeas.slice(0, batchSize);
      const remainingItems = dateIdeas.slice(batchSize);
      
      // Load initial batch with priority
      queueForLoading(initialBatch);
      
      // Queue remaining items for background loading after a delay
      if (remainingItems.length > 0) {
        setTimeout(() => {
          queueForBackgroundLoading(remainingItems);
        }, 1000); // Start background loading after 1 second
      }
    }
  }, [dateIdeas, batchSize, queueForLoading, queueForBackgroundLoading]);

  // Function to trigger immediate loading of new items (for Load More)
  const loadMoreImages = useCallback((newItems: DateIdea[]) => {
    // Prioritize the first few items from the new batch
    const priorityItems = newItems.slice(0, batchSize);
    const backgroundItems = newItems.slice(batchSize);
    
    queueForLoading(priorityItems);
    if (backgroundItems.length > 0) {
      queueForBackgroundLoading(backgroundItems);
    }
  }, [batchSize, queueForLoading, queueForBackgroundLoading]);

  // Immediately populate imageMap with cached URLs to prevent flashing
  useEffect(() => {
    const initializeFromCache = async () => {
      const newImageMap: Record<string, string> = {};
      const needsGeneration: DateIdea[] = [];
      
      dateIdeas.forEach(idea => {
        const key = idea.slug || idea.id;
        
        // First, check if idea already has a valid image URL
        if (idea.image && typeof idea.image === 'string' && idea.image.startsWith('http')) {
          newImageMap[key] = idea.image;
          return;
        }
        
        // Check if we have a cached URL for this item
        if (typeof window !== 'undefined') {
          const randomDiversityPrompt = diversityPrompts[Math.floor(Math.random() * diversityPrompts.length)];
          const keyword = `${idea.title} ${idea.category} ${randomDiversityPrompt}`;
          const cacheKey = `${keyword}_400_300`;
          
          try {
            const cached = localStorage.getItem(`img_${cacheKey}`);
            if (cached) {
              const parsedData = JSON.parse(cached);
              // Use cached URL if it's not expired (30 days)
              if (Date.now() - parsedData.timestamp < 30 * 24 * 60 * 60 * 1000) {
                newImageMap[key] = parsedData.url;
                return;
              }
            }
          } catch (error) {
            // Ignore cache errors
          }
        }
        
        // If no cache found, add to generation queue
        needsGeneration.push(idea);
      });
      
      // Update imageMap with immediately available URLs
      if (Object.keys(newImageMap).length > 0) {
        setImageMap(prev => ({ ...prev, ...newImageMap }));
      }
      
      // Generate URLs for items that need them (this is still instant with our new service)
      if (needsGeneration.length > 0) {
        queueForLoading(needsGeneration);
      }
    };
    
    if (dateIdeas.length > 0) {
      initializeFromCache();
    }
  }, [dateIdeas, diversityPrompts, queueForLoading]);

  return {
    imageMap,
    isLoading,
    backgroundLoading,
    observe,
    loadedCount: loadedItems.size,
    totalCount: dateIdeas.length,
    loadMoreImages
  };
};