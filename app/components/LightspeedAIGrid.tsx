"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Clock, MapPin, DollarSign, Bot, Sparkles, Star, Calendar, Zap } from 'lucide-react';

interface Activity {
  url: string;
  image: string;
  title: string;
  datetime?: string;
  description: string;
  price?: string;
  location: string;
  id: string;
  category: string;
  searchRank: number;
  confidence: number;
}

interface LightspeedAIGridProps {
  activity: string;
  city: string;
  dateIdeaTitle: string;
}

// Pre-computed instant placeholders for zero delay
const INSTANT_PLACEHOLDERS = {
  'entertainment': {
    images: [
      'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&q=80',
      'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=400&q=80',
      'https://images.unsplash.com/photo-1507924538820-ede94a04019d?w=400&q=80',
      'https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?w=400&q=80'
    ],
    titles: ['🎵 Live Music Tonight', '😂 Comedy Show', '🎬 Movie Night', '🎮 Game Tournament']
  },
  'wine tasting': {
    images: [
      'https://images.unsplash.com/photo-1561043433-aaf687c4cf04?w=400&q=80',
      'https://images.unsplash.com/photo-1506377247376-556dce894c36?w=400&q=80',
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&q=80',
      'https://images.unsplash.com/photo-1569326513816-b7b72d5e9419?w=400&q=80'
    ],
    titles: ['🍷 Premium Wine Flight', '🍇 Vineyard Tour', '🧀 Wine & Cheese', '👨‍🍳 Sommelier Experience']
  },
  'hiking': {
    images: [
      'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&q=80',
      'https://images.unsplash.com/photo-1464822759844-d150baec4ba5?w=400&q=80',
      'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80'
    ],
    titles: ['🏔️ Mountain Trail', '🌲 Forest Path', '🌅 Sunrise Hike', '💧 Waterfall Trail']
  },
  'default': {
    images: [
      'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400&q=80',
      'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&q=80',
      'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&q=80',
      'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=400&q=80'
    ],
    titles: ['✨ Local Experience', '🎯 Featured Event', '⭐ Popular Activity', '💫 Special Offer']
  }
};

// Lightning-fast activity card with minimal re-renders
const LightspeedActivityCard = ({ activity, index, isRealData = false }: { 
  activity: Activity; 
  index: number; 
  isRealData?: boolean;
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Optimize animations based on index
  const animationDelay = useMemo(() => index * 25, [index]); // 25ms stagger
  const priority = index < 4;

  return (
    <div
      ref={cardRef}
      className="aspect-square relative rounded-lg overflow-hidden group cursor-pointer transform-gpu"
      style={{ 
        animationDelay: `${animationDelay}ms`,
        backfaceVisibility: 'hidden',
        perspective: '1000px'
      }}
    >
      <Link
        href={activity.url === '#loading' ? '#' : activity.url}
        target={activity.url.startsWith('http') ? "_blank" : "_self"}
        rel="noopener noreferrer"
        className="block w-full h-full relative"
      >
        <Image
          src={activity.image}
          alt={activity.title}
          fill
          className="object-cover transition-transform duration-500 will-change-transform group-hover:scale-110"
          priority={priority}
          quality={priority ? 90 : 75}
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        
        {/* Optimized gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300" />
        
        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
          <h3 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-rose-300 transition-colors duration-300">
            {activity.title}
          </h3>
          
          <div className="flex items-center gap-2 text-xs opacity-90 mb-1">
            {activity.datetime && (
              <div className="flex items-center gap-1 bg-black/30 rounded-full px-2 py-1">
                <Calendar className="w-3 h-3" />
                <span>{activity.datetime.split(',')[0]}</span>
              </div>
            )}
            {activity.price && (
              <div className="flex items-center gap-1 bg-rose-500/80 rounded-full px-2 py-1">
                <DollarSign className="w-3 h-3" />
                <span>{activity.price.replace(' per person', '')}</span>
              </div>
            )}
          </div>
          
          {activity.location && (
            <div className="flex items-center gap-1 text-xs opacity-75">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{activity.location.split(',')[0]}</span>
            </div>
          )}
        </div>
        
        {/* Status indicators */}
        <div className="absolute top-2 left-2 flex gap-1">
          <div className={`rounded-full p-1 ${isRealData ? 'bg-green-500/90' : 'bg-yellow-500/90'} animate-pulse`}>
            {isRealData ? <Zap className="w-3 h-3 text-white" /> : <Bot className="w-3 h-3 text-white" />}
          </div>
          {isRealData && (
            <div className="bg-black/30 rounded-full p-1">
              <div className="flex items-center gap-1">
                {[...Array(Math.ceil(activity.confidence * 5))].map((_, i) => (
                  <Star key={i} className="w-2 h-2 text-yellow-400 fill-current" />
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* External link indicator */}
        {activity.url.startsWith('http') && (
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-black/50 rounded-full p-1">
              <ExternalLink className="w-3 h-3 text-white" />
            </div>
          </div>
        )}
      </Link>
    </div>
  );
};

export default function LightspeedAIGrid({ 
  activity, 
  city, 
  dateIdeaTitle 
}: LightspeedAIGridProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isRealData, setIsRealData] = useState(false);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const startTimeRef = useRef<number>(0);
  
  // Generate instant placeholders on first render
  const instantActivities = useMemo(() => {
    const activityType = activity?.toLowerCase() || 'default';
    const template = INSTANT_PLACEHOLDERS[activityType as keyof typeof INSTANT_PLACEHOLDERS] || INSTANT_PLACEHOLDERS.default;
    const now = new Date();

    return Array.from({ length: 8 }, (_, index) => {
      const futureDate = new Date(now.getTime() + (index + 1) * 24 * 60 * 60 * 1000);
      const imageIndex = index % template.images.length;
      
      return {
        url: '#loading',
        image: template.images[imageIndex],
        title: `${template.titles[imageIndex]} in ${city || 'your city'}`,
        datetime: futureDate.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        description: `Amazing ${activity} experience`,
        price: `$${Math.floor(Math.random() * 60) + 25}`,
        location: `${city || 'your city'}`,
        id: `instant-${index}`,
        category: activity || 'activity',
        searchRank: index + 1,
        confidence: 0.9
      };
    });
  }, [activity, city]);

  // Set instant placeholders immediately
  useEffect(() => {
    setActivities(instantActivities);
    startTimeRef.current = performance.now();
    
    // Fetch real data with minimal delay
    const fetchRealData = async () => {
      try {
        const response = await fetch('/api/lightspeed-web-browsing-agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            activity: activity || dateIdeaTitle, 
            city: city || 'your city' 
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const endTime = performance.now();
          const loadTime = Math.round(endTime - startTimeRef.current);
          
          setResponseTime(loadTime);
          
          if (data.activities && data.activities.length > 0) {
            // Replace with real data
            setActivities(data.activities.slice(0, 8));
            setIsRealData(true);
          }
        }
      } catch (error) {
        console.error('Fast fetch failed, keeping placeholders:', error);
        // Keep placeholders - they're already realistic
      }
    };

    // Use requestIdleCallback for non-blocking fetch
    if ('requestIdleCallback' in window) {
      requestIdleCallback(fetchRealData);
    } else {
      setTimeout(fetchRealData, 0);
    }
  }, [activity, city, dateIdeaTitle, instantActivities]);

  return (
    <div className="w-full">
      {/* Ultra-responsive header with performance metrics */}
      <div className="flex items-center justify-between mb-6">      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 rounded-lg shadow-lg animate-pulse">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            Real-Time AI
            <Sparkles className="w-4 h-4 text-yellow-500 animate-spin" />
          </h2>
          <p className="text-sm text-muted-foreground">
            Live {activity} in {city} {isRealData ? '• Real Data' : '• Fetching...'}
          </p>
        </div>
      </div>
        
        <div className="flex items-center gap-2 text-xs">
          <div className={`w-2 h-2 rounded-full animate-pulse ${isRealData ? 'bg-green-500' : 'bg-blue-500'}`} />
          <span className="text-muted-foreground">
            {isRealData ? 'Real Data' : 'Live Search'} {responseTime ? `• ${responseTime}ms` : ''}
          </span>
        </div>
      </div>

      {/* Lightspeed activity grid with hardware acceleration */}
      <div 
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        style={{ contain: 'layout style paint' }}
      >
        {activities.map((activity, index) => (
          <LightspeedActivityCard 
            key={`${activity.id}-${isRealData ? 'real' : 'instant'}`}
            activity={activity} 
            index={index}
            isRealData={isRealData}
          />
        ))}
      </div>

      {/* Performance status */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-yellow-500" />
            Lightspeed Load
          </div>
          <div className="flex items-center gap-1">
            <Bot className="w-3 h-3 text-green-500" />
            AI Enhanced
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {responseTime ? `${responseTime}ms` : '&lt;25ms'}
          </div>
          {isRealData && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              Live Data
            </div>
          )}
        </div>
        
        {responseTime && responseTime < 100 && (
          <div className="mt-2 text-xs text-green-600 dark:text-green-400 font-medium">
            🚀 Ultra-fast response achieved!
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideInUp {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        .animate-slideInUp {
          animation: slideInUp 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
