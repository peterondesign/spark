import { useState } from 'react';
import useAIImage from '../hooks/useAIImage';

export default function ImageTestComponent() {
  const [keyword, setKeyword] = useState('romantic dinner');
  const { imageUrl, isLoading, error, regenerate } = useAIImage(keyword, 512, 512);

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">AI Image Generator Test</h2>
      
      <div className="mb-4">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Enter image keyword..."
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <div className="mb-4">
        <button
          onClick={regenerate}
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {isLoading ? 'Generating...' : 'Generate Image'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded flex items-center justify-center">
            <span className="text-gray-500">Generating AI image...</span>
          </div>
        )}
        <img
          src={imageUrl}
          alt={keyword}
          className="w-full h-64 object-cover rounded"
          style={{ opacity: isLoading ? 0.3 : 1 }}
        />
      </div>

      <p className="text-sm text-gray-600 mt-2">
        Keyword: "{keyword}"
      </p>
    </div>
  );
}