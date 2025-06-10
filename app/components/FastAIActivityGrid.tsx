"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Clock, MapPin, DollarSign, Bot, Sparkles, Heart, Star } from 'lucide-react';

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

interface FastAIActivityGridProps {
  activity: string;
  city: string;
  dateIdeaTitle: string;
}

// Skeleton loader for immediate display
const ActivitySkeleton = ({ index }: { index: number }) => (
  <div className="aspect-square relative rounded-lg overflow-hidden bg-muted animate-pulse">
    <div className="absolute inset-0 bg-gradient-to-br from-rose-100 to-orange-100 dark:from-rose-900/30 dark:to-orange-900/30" />
    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
      <div className="h-4 bg-white/20 rounded mb-2" />
      <div className="h-3 bg-white/15 rounded w-3/4" />
    </div>
    <div className="absolute top-2 right-2">
      <div className="w-6 h-6 bg-white/20 rounded-full" />
    </div>
    <div className="absolute top-2 left-2">
      <Bot className="w-4 h-4 text-white/40" />
    </div>
  </div>
);

// Fast activity card with hover effects
const ActivityCard = ({ activity, index }: { activity: Activity; index: number }) => (
  <Link
    href={activity.url}
    target="_blank"
    rel="noopener noreferrer"
    className="aspect-square relative rounded-lg overflow-hidden group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
  >
    <Image
      src={activity.image}
      alt={activity.title}
      fill
      className="object-cover transition-transform duration-500 group-hover:scale-110"
      priority={index < 4} // Prioritize first 4 images
    />
    
    {/* Gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
    
    {/* Content overlay */}
    <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
      <h3 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-rose-300 transition-colors">
        {activity.title}
      </h3>
      <div className="flex items-center gap-2 text-xs opacity-90">
        {activity.datetime && (
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{activity.datetime.split(',')[0]}</span>
          </div>
        )}
        {activity.price && (
          <div className="flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            <span>{activity.price.replace(' per person', '')}</span>
          </div>
        )}
      </div>
      {activity.location && (
        <div className="flex items-center gap-1 text-xs opacity-75 mt-1">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{activity.location}</span>
        </div>
      )}
    </div>
    
    {/* AI Badge */}
    <div className="absolute top-2 left-2 bg-rose-500/90 rounded-full p-1">
      <Bot className="w-3 h-3 text-white" />
    </div>
    
    {/* External link indicator */}
    <div className="absolute top-2 right-2 bg-black/30 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <ExternalLink className="w-3 h-3 text-white" />
    </div>
    
    {/* Confidence indicator */}
    <div className="absolute top-8 left-2">
      <div className="flex items-center gap-1">
        {[...Array(Math.ceil(activity.confidence * 5))].map((_, i) => (
          <Star key={i} className="w-2 h-2 text-yellow-400 fill-current" />
        ))}
      </div>
    </div>
  </Link>
);

export default function FastAIActivityGrid({ 
  activity, 
  city, 
  dateIdeaTitle 
}: FastAIActivityGridProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false); // Start as false, we show skeletons by default
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // Start the API call immediately with fast endpoint
        const response = await fetch('/api/fast-web-browsing-agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            activity: activity || dateIdeaTitle, 
            city: city || 'your city' 
          }),
        });

        if (!response.ok) throw new Error('Failed to fetch activities');

        const data = await response.json();
        
        if (data.activities && data.activities.length > 0) {
          // Show all results immediately for maximum speed
          setActivities(data.activities);
        }
        
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError('Failed to load activities');
      }
    };

    // Start fetching immediately when component mounts
    fetchActivities();
  }, [activity, city, dateIdeaTitle]);

  return (
    <div className="w-full">
      {/* Header with live indicator */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-500 rounded-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              Live Activities
              <Sparkles className="w-4 h-4 text-yellow-500" />
            </h2>
            <p className="text-sm text-muted-foreground">
              Real-time {activity} in {city}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Live Results
        </div>
      </div>

      {/* Activity Grid - 4x2 layout matching original design */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {/* Show skeletons initially, replace with activities as they load */}
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index}>
            {activities[index] ? (
              <ActivityCard activity={activities[index]} index={index} />
            ) : (
              <ActivitySkeleton index={index} />
            )}
          </div>
        ))}
      </div>

      {/* Status indicator */}
      <div className="text-center">
        {loading && activities.length === 0 && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Bot className="w-4 h-4 animate-pulse" />
            AI searching for live activities...
          </div>
        )}
        
        {activities.length > 0 && loading && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 animate-pulse text-yellow-500" />
            Loading more results...
          </div>
        )}
        
        {!loading && activities.length > 0 && (
          <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            Found {activities.length} live activities
          </div>
        )}
        
        {error && (
          <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
            {error} - Showing static images as fallback
          </div>
        )}
      </div>
    </div>
  );
}
