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
  const wheelRef = useRef<HTMLDivElement>(null);

  // Function to spin the wheel
  const spinWheel = () => {
    if (isSpinning || dateIdeas.length === 0) return;
    
    setIsSpinning(true);
    setSelectedDateIdea(null);
    
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
      setSelectedDateIdea(dateIdeas[selectedIndex]);
      setIsSpinning(false);
    }, 5000); // Match this with the CSS transition duration
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Spin the Wheel for a Random Date Idea</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">Let the wheel of fate decide your next date adventure! Click the button to spin and see what exciting date idea awaits you.</p>
        
        <Button
          onClick={spinWheel}
          disabled={isSpinning}
          variant="default"
          size="lg"
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-2.5"
        >
          {isSpinning ? "Spinning..." : "Spin the Wheel"}
        </Button>
      </div>
      
      <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] mb-8">
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
            ).join(', ') + ')' : 'none'
          }}
        >
          {dateIdeas.map((idea, index) => {
            const segmentSize = 360 / dateIdeas.length;
            const rotation = index * segmentSize;
            return (
              <div 
                key={idea.id}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center"
                style={{ 
                  transform: `rotate(${rotation}deg)`,
                  transformOrigin: 'center', 
                  height: "50%",
                  paddingTop: "5px"
                }}
              >
                <span className="inline-block text-white font-bold text-xs md:text-sm whitespace-nowrap transform rotate-90 md:translate-y-6 text-shadow-sm shadow-black" style={{ maxWidth: '70px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {idea.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      
      {selectedDateIdea && (
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 mt-8 border border-gray-200">
          <div className="relative h-48 mb-4 overflow-hidden rounded-md">
            <Image
              src={dateIdeaImages[selectedDateIdea.slug] || '/placeholder.jpg'}
              alt={selectedDateIdea.title}
              layout="fill"
              objectFit="cover"
              className="rounded-md"
            />
            <div className="absolute top-2 right-2">
              <SaveButton 
                itemSlug={selectedDateIdea.slug}
                item={selectedDateIdea}
                onToggle={() => {}}
              />
            </div>
          </div>
          
          <h3 className="text-2xl font-bold mb-2 text-gray-800">{selectedDateIdea.title}</h3>
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">{selectedDateIdea.category}</span>
            <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded">{selectedDateIdea.price}</span>
            <span className="bg-pink-100 text-pink-800 text-xs font-semibold px-2.5 py-0.5 rounded">{selectedDateIdea.duration}</span>
          </div>
          
          <p className="text-gray-600 mb-4">{selectedDateIdea.description}</p>
          
          <div className="flex justify-between">
            <Button 
              onClick={spinWheel} 
              variant="outline"
              disabled={isSpinning}
            >
              Spin Again
            </Button>
            
            <Link href={`/date-idea/${selectedDateIdea.slug}`} passHref>
              <Button variant="default" className="bg-blue-600 hover:bg-blue-700 text-white">
                View Details
              </Button>
            </Link>
          </div>
        </div>
      )}
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