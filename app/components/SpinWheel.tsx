"use client";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import SaveButton from "./SaveButton";

interface DateIdea {
  id: number;
  title: string;
  category: string;
  rating: number;
  location: string;
  description: string;
  price: string;
  duration: string;
  slug: string;
  image: string;
}

interface SpinWheelProps {
  dateIdeas: DateIdea[];
  dateIdeaImages: Record<string, string>;
}

const SpinWheel: React.FC<SpinWheelProps> = ({ dateIdeas, dateIdeaImages }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedDateIdea, setSelectedDateIdea] = useState<DateIdea | null>(null);
  const [isResultLoading, setIsResultLoading] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);
  
  // Function to calculate text position on wheel
  const calculateTextPosition = (index: number, total: number) => {
    const angle = (index / total) * 360;
    const angleInRadians = (angle - 90) * (Math.PI / 180); // -90 to start at top
    const radius = 130; // Distance from center, adjust as needed
    
    return {
      x: Math.cos(angleInRadians) * radius,
      y: Math.sin(angleInRadians) * radius,
      angle: angle,
    };
  };

  // Function to spin the wheel
  const spinWheel = () => {
    if (isSpinning || dateIdeas.length === 0) return;
    
    setIsSpinning(true);
    setIsResultLoading(true);
    
    // Random rotation between 2000 and 5000 degrees (multiple spins)
    const spinDegrees = 2000 + Math.random() * 3000;
    const newRotation = rotation + spinDegrees;
    setRotation(newRotation);
    
    // Calculate which date idea is selected after spinning
    setTimeout(() => {
      const segmentSize = 360 / dateIdeas.length;
      const modRotation = newRotation % 360;
      // The wheel rotates clockwise, so we need to find the segment based on the opposite direction
      const selectedIndex = Math.floor((360 - modRotation) / segmentSize) % dateIdeas.length;
      
      // Add a slight delay before showing the result
      setTimeout(() => {
        setSelectedDateIdea(dateIdeas[selectedIndex]);
        setIsResultLoading(false);
        setIsSpinning(false);
      }, 500);
      
    }, 5000); // Match this with the CSS transition duration
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Spin the Wheel for a Random Date Idea</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          Let the wheel of fate decide your next date adventure! Click the button to spin and see what exciting date idea awaits you.
        </p>
      </div>
      
      {/* Side by side layout */}
      <div className="flex flex-col md:flex-row w-full justify-between items-center md:items-start gap-8">
        {/* Left column: Wheel and spin button */}
        <div className="w-full md:w-1/2 flex flex-col items-center">
          <div className="relative w-[300px] h-[300px] md:w-[350px] md:h-[350px] mb-8">
            {/* The pointer/indicator */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 w-8 h-12 z-10">
              <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[30px] border-t-red-600 mx-auto"></div>
            </div>
            
            {/* The wheel */}
            <div 
              ref={wheelRef}
              className="absolute inset-0 rounded-full shadow-lg transition-transform duration-5000 ease-out"
              style={{ 
                transform: `rotate(${rotation}deg)`,
                backgroundImage: dateIdeas.length > 0 ? 'conic-gradient(' + dateIdeas.map((_, index) => 
                  `${getColor(index)} ${(index / dateIdeas.length) * 100}%, ${getColor(index)} ${((index + 1) / dateIdeas.length) * 100}%`
                ).join(', ') + ')' : 'none',
                border: '4px solid white',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
              }}
            >
              {/* Text positioned on wheel with absolute positioning for accuracy */}
              {dateIdeas.map((idea, index) => {
                const position = calculateTextPosition(index, dateIdeas.length);
                return (
                  <div 
                    key={idea.id}
                    className="absolute"
                    style={{ 
                      left: '50%',
                      top: '50%',
                      transform: `translate(${position.x}px, ${position.y}px) rotate(${position.angle}deg)`,
                      transformOrigin: 'center',
                      textAlign: 'center',
                      width: '100px',
                    }}
                  >
                    <span 
                      className="inline-block text-white font-bold text-xs text-shadow-sm shadow-black"
                      style={{ 
                        textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)',
                        maxWidth: '100px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        padding: '2px 4px',
                        borderRadius: '3px',
                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      }}
                    >
                      {idea.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          <Button
            onClick={spinWheel}
            disabled={isSpinning}
            variant="default"
            size="lg"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-2.5 mt-4 shadow-lg"
          >
            {isSpinning ? "Spinning..." : "Spin the Wheel"}
          </Button>
        </div>
        
        {/* Right column: Result card */}
        <div className="w-full md:w-1/2 flex justify-center">
          {isResultLoading ? (
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 border border-gray-200 flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-4"></div>
              <p className="text-gray-500 font-medium">Revealing your date idea...</p>
            </div>
          ) : selectedDateIdea ? (
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={dateIdeaImages[selectedDateIdea.slug] || '/placeholder.jpg'}
                  alt={selectedDateIdea.title}
                  layout="fill"
                  objectFit="cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-2xl font-bold text-gray-800">{selectedDateIdea.title}</h3>
                  <SaveButton 
                    itemSlug={selectedDateIdea.slug}
                    item={selectedDateIdea}
                    onToggle={() => {}}
                  />
                </div>
                
                <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded mb-4">
                  {selectedDateIdea.category}
                </span>
                
                <p className="text-gray-600 mb-6 line-clamp-4">{selectedDateIdea.description}</p>
                
                <div className="flex items-center justify-between">
                  <Link href={`/date-idea/${selectedDateIdea.slug}`} passHref>
                    <Button variant="default" className="bg-blue-600 hover:bg-blue-700 text-white">
                      View Details
                    </Button>
                  </Link>
                  
                  <button 
                    onClick={spinWheel}
                    disabled={isSpinning}
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                    title="Spin Again"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                      <path d="M21 3v5h-5" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 border border-gray-200 flex flex-col items-center justify-center min-h-[400px]">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mb-4">
                <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                <path d="M21 3v5h-5" />
              </svg>
              <p className="text-gray-500 font-medium">Spin the wheel to get your date idea!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Function to get a color for a wheel segment
function getColor(index: number): string {
  const colors = [
    "#3498db", "#9b59b6", "#e74c3c", "#1abc9c", 
    "#f39c12", "#2ecc71", "#e84393", "#00cec9", 
    "#6c5ce7", "#fdcb6e", "#55efc4", "#d63031"
  ];
  
  return colors[index % colors.length];
}

export default SpinWheel;