"use client";

import { cn } from "@/lib/utils";

interface ImageSkeletonProps {
  className?: string;
  aspectRatio?: string;
  showContent?: boolean;
  style?: React.CSSProperties;
}

export const ImageSkeleton = ({ 
  className, 
  aspectRatio = "aspect-[4/3]", 
  showContent = true,
  style 
}: ImageSkeletonProps) => {
  return (
    <div 
      className={cn("group relative overflow-hidden rounded-2xl shadow-lg animate-pulse", className)}
      style={style}
    >
      {/* Image skeleton with shimmer effect */}
      <div className={cn(
        "bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 relative overflow-hidden",
        aspectRatio
      )}>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent animate-shimmer"></div>
        
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-gradient-to-br from-rose-100 to-orange-100 dark:from-rose-900/30 dark:to-orange-900/30"></div>
        </div>
      </div>
      
      {/* Content skeleton */}
      {showContent && (
        <div className="p-4 bg-white dark:bg-gray-800">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse"></div>
            <div className="flex items-center gap-2 mt-3">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-16 animate-pulse"></div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-20 animate-pulse"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const ImageSkeletonGrid = ({ 
  count = 8, 
  className 
}: { 
  count?: number; 
  className?: string; 
}) => {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <ImageSkeleton 
          key={`skeleton-${index}`} 
          className="transition-all duration-300"
          style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

export default ImageSkeleton;