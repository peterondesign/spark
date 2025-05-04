import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { DateIdea } from '@/app/types/dateIdeas';
import DateIdeaCard from '@/components/DateIdeaCard';

interface CollapsibleFavoritesPanelProps {
  title: string;
  dateIdeas: DateIdea[];
  onSelectDate: (id: string) => void;
  favoriteType: 'my' | 'partner' | 'joint';
  children?: React.ReactNode;
}

const CollapsibleFavoritesPanel: React.FC<CollapsibleFavoritesPanelProps> = ({
  title,
  dateIdeas,
  onSelectDate,
  favoriteType,
  children
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="border border-gray-200 rounded-lg mb-4">
      <div 
        className="p-3 flex justify-between items-center bg-white rounded-t-lg cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={`panel-${title}`}
      >
        <h3 className="font-semibold text-lg">{title}</h3>
        <button 
          className="focus:outline-none"
          aria-label={isOpen ? "Collapse panel" : "Expand panel"}
        >
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>
      </div>
      <div 
        id={`panel-${title}`}
        className={`collapsible-panel ${isOpen ? 'max-h-96' : 'max-h-0'}`}
      >
        {children ? (
          <div className="p-3 bg-gray-50 rounded-b-lg">
            {children}
          </div>
        ) : (
          <div className="p-3 bg-gray-50 rounded-b-lg">
            {dateIdeas.length > 0 ? (
              dateIdeas.map(idea => (
                <DateIdeaCard 
                  key={idea.id} 
                  dateIdea={idea} 
                  onSelectDate={onSelectDate}
                  favoriteType={favoriteType}
                />
              ))
            ) : (
              <p className="text-center text-gray-500 py-4">No favorite date ideas yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollapsibleFavoritesPanel;