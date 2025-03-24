import React from 'react';

export type ViewMode = 'grid' | 'swipe' | 'feed';

interface ViewModeSelectorProps {
  activeMode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export default function ViewModeSelector({ activeMode, onChange }: ViewModeSelectorProps) {
  return (
    <div className="inline-flex bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onChange('grid')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          activeMode === 'grid' 
            ? 'bg-white shadow-sm text-gray-800' 
            : 'text-gray-600 hover:text-gray-800'
        }`}
      >
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          Grid
        </div>
      </button>
      <button
        onClick={() => onChange('swipe')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          activeMode === 'swipe' 
            ? 'bg-white shadow-sm text-gray-800' 
            : 'text-gray-600 hover:text-gray-800'
        }`}
      >
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Swipe
        </div>
      </button>
      <button
        onClick={() => onChange('feed')}
        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
          activeMode === 'feed' 
            ? 'bg-white shadow-sm text-gray-800' 
            : 'text-gray-600 hover:text-gray-800'
        }`}
      >
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          Feed
        </div>
      </button>
    </div>
  );
}
