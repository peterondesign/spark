import { useState, useEffect } from 'react';

interface LoadingSkeletonProps {
  city: string;
}

export const EventsLoadingSkeleton = ({ city }: LoadingSkeletonProps) => {
  const [loadingStage, setLoadingStage] = useState(0);
  const loadingMessages = [
    `🔍 Searching for events in ${city}...`,
    `🌐 Connecting to event databases...`,
    `📊 Analyzing available activities...`,
    `🗺️ Finding the best local experiences...`,
    `🎭 Collecting event details and ratings...`,
    `📝 Organizing results...`,
    `✨ Finalizing your personalized recommendations...`
  ];

  useEffect(() => {
    const intervalId = setInterval(() => {
      setLoadingStage(prev => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
    }, 3000);

    return () => clearInterval(intervalId);
  }, [loadingMessages.length]);

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center">
        <div className="w-full">
          <div className="h-7 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
      
      {/* Progress indicator */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${((loadingStage + 1) / loadingMessages.length) * 100}%` }}
          ></div>
        </div>
        <p className="mt-2 text-gray-600 italic">
          {loadingMessages[loadingStage]}
        </p>
      </div>

      {/* Skeleton cards */}
      {[...Array(3)].map((_, i) => (
        <div key={i} className="mb-6 p-4 border rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/3 h-40 bg-gray-200 rounded animate-pulse"></div>
            <div className="w-full md:w-2/3">
              <div className="h-7 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="flex justify-between items-center mt-4">
                <div className="h-6 w-1/4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-1/4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventsLoadingSkeleton;
