import React from 'react';
import { ScrapedData } from '../types/interfaces';
import toast, { Toaster } from 'react-hot-toast';

// Utility function to copy text to clipboard
const copyToClipboard = (text: string, p0: string) => {
  navigator.clipboard.writeText(text).then(() => {
    toast.success("Copied to clipboard!", {
      duration: 2000,
      position: 'top-right'
    })
  }).catch((err) => {
    console.error('Failed to copy text to clipboard:', err);
  });
};

interface ResultProps {
  data: ScrapedData;
  isLoading?: boolean;
}

const Results: React.FC<ResultProps> = ({ data, isLoading = false }) => {
  if (isLoading) {
    return <SkeletonGrid />;
  }

  if (!data) {
    return <div>No results found.</div>;
  }

  // Getting links 7-22 (index 6 to 21)
  const selectedLinks = data.links.slice(6, 22);

  // Extract titles from links - use domain name or path segments
  const extractTitle = (url: string): string => {
    try {
      const urlObj = new URL(url);
      // Get the hostname without www. and the pathname
      const domain = urlObj.hostname.replace('www.', '');
      // Get the path segments and filter out empty ones
      const pathSegments = urlObj.pathname.split('/').filter(segment => segment);

      if (pathSegments.length > 0) {
        // Replace hyphens with spaces and capitalize first letter of each word
        return pathSegments[pathSegments.length - 1]
          .replace(/-/g, ' ')
          .replace(/\b\w/g, char => char.toUpperCase());
      }

      return domain;
    } catch {
      // If URL parsing fails, return a portion of the URL
      return url.substring(0, 30) + '...';
    }
  };

  // Process link to add partner ID for GetYourGuide links and remove ranking_uuid
  const processLink = (url: string): string => {
    try {
      if (url.includes('getyourguide.com')) {
        const urlObj = new URL(url);
        // Remove ranking_uuid if it exists
        urlObj.searchParams.delete('ranking_uuid');
        // Add partner_id and utm_medium
        urlObj.searchParams.set('partner_id', '5QQHAHP');
        urlObj.searchParams.set('utm_medium', 'online_publisher');
        // Ensure no double slashes in the URL
        const sanitizedUrl = urlObj.toString().replace(/([^:]\/)\/+/, '$1/');
        return sanitizedUrl;
      }
      return url;
    } catch {
      return url;
    }
  };

  return (
    <div className="my-8 px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {selectedLinks.map((link, index) => {
          // Process the link to add partner ID if necessary
          const processedLink = processLink(link);

          // For images after index 8, loop back to the beginning
          const imageIndex = index < 9 ? index + 6 : (index - 9) % 9 + 6;

          return (
            <div key={index} className="rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300">
              {/* Image section */}
              <div className="relative aspect-[4/3] overflow-hidden">
                {data.metadata.imageUrls && data.metadata.imageUrls.length > imageIndex ? (
                  <img
                    src={data.metadata.imageUrls[imageIndex]}
                    alt={`Image for ${extractTitle(link)}`}
                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.jpg';
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-100">
                    <span className="text-gray-400">No image available</span>
                  </div>
                )}
              </div>

              {/* Content section */}
              <div className="p-4 relative group">
                <div className="relative">
                  <h3 className="text-base font-medium text-gray-900 mb-1 line-clamp-1" title={extractTitle(link)}>
                    {extractTitle(link)}
                  </h3>
                  <Toaster />
                  <button
                    onClick={() => copyToClipboard(extractTitle(link), 'Title')}
                    className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Copy title"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 hover:text-pink-600" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                    </svg>
                  </button>
                </div>

                <div className="relative">
                  <p className="text-sm text-gray-500 mb-3 line-clamp-1" title={link}>
                    <a
                      href={processedLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      {link.length > 40 ? `${link.substring(0, 40)}...` : link}
                    </a>
                  </p>
                  <button
                    onClick={() => copyToClipboard(processedLink, 'Link')}
                    className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Copy link"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 hover:text-pink-600" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                      <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                    </svg>
                  </button>
                </div>

                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs font-medium text-gray-500">#{index + 7}</span>
                  <a
                    href={processedLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-pink-600 hover:text-pink-700"
                  >
                    View
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SkeletonGrid: React.FC = () => {
  return (
    <div className="my-8 px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 16 }).map((_, index) => (
          <div key={index} className="rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm animate-pulse">
            {/* Skeleton image */}
            <div className="relative aspect-[4/3] bg-gray-200"></div>

            {/* Skeleton content */}
            <div className="p-4">
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
              <div className="flex justify-between items-center mt-2">
                <div className="h-3 bg-gray-200 rounded w-8"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Results;