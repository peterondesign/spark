import React from 'react';
import { ScrapedData } from '../types/interfaces';

interface ResultProps {
  data: ScrapedData;
}

const Results: React.FC<ResultProps> = ({ data }) => {
  if (!data) {
    return <div>No results found.</div>;
  }

  // Getting links 7-22 (index 6 to 21)
  const selectedLinks = data.links.slice(6, 22);

  return (
    <div className="my-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {selectedLinks.map((link, index) => (
          <div key={index} className="result-card bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1 hover:scale-[1.02]">
            {/* Image section */}
            <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
              {data.metadata.imageUrls && data.metadata.imageUrls.length > index + 6 ? (
                <img 
                  src={data.metadata.imageUrls[index + 6]} 
                  alt={`Image for link ${index + 7}`}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.jpg'; // Fallback image
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-200 dark:bg-gray-600">
                  <span className="text-gray-400 dark:text-gray-300">No image available</span>
                </div>
              )}
              <div className="absolute top-2 right-2 bg-white dark:bg-gray-700 rounded-full px-2 py-1 text-xs font-semibold">
                #{index + 7}
              </div>
            </div>
            
            {/* Content section */}
            <div className="p-4">
              <h3 className="text-lg font-semibold mb-2 line-clamp-2 text-gray-800 dark:text-gray-100">
                <a 
                  href={link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  {link.length > 60 ? `${link.substring(0, 60)}...` : link}
                </a>
              </h3>
              
              <div className="flex justify-end mt-3">
                <a 
                  href={link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                >
                  Visit Link →
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Results;