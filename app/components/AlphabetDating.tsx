"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

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

interface AlphabetDatingProps {
  dateIdeas: Record<string, DateIdea[]>;
  dateIdeaImages: Record<string, string>;
}

const AlphabetDating: React.FC<AlphabetDatingProps> = ({ dateIdeas, dateIdeaImages }) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const [revealedLetters, setRevealedLetters] = useState<Record<string, boolean>>({});
  const [completedLetters, setCompletedLetters] = useState<string[]>([]);
  const [selectedLetterIdeas, setSelectedLetterIdeas] = useState<{ letter: string; ideas: DateIdea[] } | null>(null);
  const [selectedDateIdeas, setSelectedDateIdeas] = useState<Record<string, DateIdea>>({});
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedRevealed = localStorage.getItem('alphabetDatingRevealed');
      if (savedRevealed) {
        setRevealedLetters(JSON.parse(savedRevealed));
      }
      
      const savedCompleted = localStorage.getItem('alphabetDatingCompleted');
      if (savedCompleted) {
        setCompletedLetters(JSON.parse(savedCompleted));
      }

      const savedSelectedDateIdeas = localStorage.getItem('alphabetDatingSelected');
      if (savedSelectedDateIdeas) {
        setSelectedDateIdeas(JSON.parse(savedSelectedDateIdeas));
      }
    } catch (error) {
      console.error('Error loading alphabet dating progress:', error);
    }
  }, []);

  const revealLetter = (letter: string) => {
    setRevealedLetters(prev => ({
      ...prev,
      [letter]: true
    }));

    if (dateIdeas[letter] && dateIdeas[letter].length > 0) {
      setSelectedLetterIdeas({ letter, ideas: dateIdeas[letter] });
    }
  };

  const selectDateIdea = (letter: string, idea: DateIdea) => {
    setSelectedDateIdeas(prev => ({
      ...prev,
      [letter]: idea
    }));
    setSelectedLetterIdeas(null);
  };

  const markAsCompleted = (letter: string) => {
    if (!completedLetters.includes(letter)) {
      setCompletedLetters(prev => [...prev, letter]);
      
      const duration = 2000;
      const end = Date.now() + duration;
      
      setShowCelebration(true);
      
      (function frame() {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
        });
        
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
      
      setTimeout(() => {
        setShowCelebration(false);
      }, duration);
    }
  };

  const resetAllCards = () => {
    if (window.confirm("Are you sure you want to reset all cards? This will clear your progress.")) {
      setRevealedLetters({});
      setCompletedLetters([]);
      setSelectedDateIdeas({});
      localStorage.removeItem('alphabetDatingRevealed');
      localStorage.removeItem('alphabetDatingCompleted');
      localStorage.removeItem('alphabetDatingSelected');
    }
  };

  const getSelectedIdeaForLetter = (letter: string): DateIdea | undefined => {
    if (selectedDateIdeas[letter]) {
      return selectedDateIdeas[letter];
    }
    
    if (dateIdeas[letter] && dateIdeas[letter].length > 0) {
      return dateIdeas[letter][0];
    }
    
    return undefined;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-4">A-Z Dating Challenge</h2>
        <p className="text-gray-600 mb-6">Reveal letter cards to find fun date ideas!</p>
        <div className="text-lg mb-6">
          <div className="flex justify-center gap-4">
            <div className="bg-blue-100 p-3 rounded-lg text-center min-w-[120px]">
              <div className="font-bold text-2xl text-blue-700">{Object.keys(revealedLetters).length}</div>
              <div className="text-xs text-blue-600">Revealed</div>
            </div>
            <div className="bg-green-100 p-3 rounded-lg text-center min-w-[120px]">
              <div className="font-bold text-2xl text-green-700">{completedLetters.length}</div>
              <div className="text-xs text-green-600">Completed</div>
            </div>
          </div>
        </div>
        <Button 
          onClick={resetAllCards} 
          variant="outline"
          size="sm"
          className="bg-red-100 text-red-600 hover:text-red-700 hover:bg-red-200 border-red-300"
        >
          Start Over
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 w-full max-w-4xl mb-12">
        {alphabet.map(letter => {
          const isRevealed = revealedLetters[letter] === true;
          const isCompleted = completedLetters.includes(letter);
          const idea = getSelectedIdeaForLetter(letter);
          const hasMultipleIdeas = dateIdeas[letter] && dateIdeas[letter].length > 1;
          
          return (
            <div key={letter} className="relative flex flex-col">
              {isRevealed ? (
                <motion.div
                  initial={{ rotateY: 180 }}
                  animate={{ rotateY: 0 }}
                  transition={{ duration: 0.5 }}
                  className="relative h-full"
                >
                  <div className="bg-white rounded-lg overflow-hidden shadow-md h-full">
                    <div className="relative h-32 min-h-32">
                      <Image
                        src={idea?.slug ? dateIdeaImages[idea.slug] : '/placeholder.jpg'}
                        alt={idea?.title || `Letter ${letter}`}
                        fill
                        className={cn(
                          "object-cover",
                          isCompleted ? "opacity-70" : ""
                        )}
                      />
                      
                      {/* Completion checkmark */}
                      <div 
                        className={cn(
                          "absolute top-2 right-2 w-10 h-10 rounded-full cursor-pointer transition-all duration-300", 
                          "flex items-center justify-center shadow-md border-2", 
                          isCompleted 
                            ? "bg-green-500 border-white text-white" 
                            : "bg-white/80 border-gray-300 text-gray-400 hover:bg-green-100 hover:border-green-300 hover:text-green-500"
                        )}
                        onClick={() => markAsCompleted(letter)}
                        role="checkbox"
                        aria-checked={isCompleted}
                        tabIndex={0}
                        title={isCompleted ? "Completed!" : "Mark as completed"}
                      >
                        {isCompleted ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>

                      {isCompleted && (
                        <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                          <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full font-bold text-sm transform rotate-[-15deg] shadow-lg border-2 border-green-300">
                            DONE!
                          </div>
                        </div>
                      )}

                      {/* Letter badge */}
                      <div className="absolute top-0 left-0 bg-gradient-to-r from-amber-500 to-pink-500 text-white w-8 h-8 flex items-center justify-center font-bold rounded-bl-lg rounded-tr-lg shadow-md">
                        {letter}
                      </div>
                      
                      {hasMultipleIdeas && !isCompleted && (
                        <button 
                          onClick={() => setSelectedLetterIdeas({ letter, ideas: dateIdeas[letter] })}
                          className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-blue-600 p-1.5 rounded-full shadow-md hover:shadow-lg transition-all"
                          title="See more options"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className={cn(
                        "font-bold text-center text-md mb-1",
                        isCompleted ? "line-through text-gray-500" : ""
                      )}>
                        {idea?.title || `${letter} Date`}
                      </h3>
                      
                      <div className="flex justify-center">
                        <Link href={idea && idea.id > 0 ? `/date-idea/${idea.slug}` : '#'}>
                          <Button 
                            variant="link" 
                            size="sm" 
                            className={cn(
                              "p-0 h-auto text-sm",
                              isCompleted ? "opacity-60" : ""
                            )}
                          >
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="h-full"
                >
                  <button 
                    onClick={() => revealLetter(letter)}
                    className="w-full h-full bg-gradient-to-br from-rose-500 to-amber-500 rounded-lg p-1 shadow-lg cursor-pointer"
                  >
                    <div className="bg-white rounded-lg h-full flex flex-col items-center justify-center py-10">
                      <span className="text-5xl sm:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-rose-500 to-amber-500">
                        {letter}
                      </span>
                      <span className="mt-2 text-gray-600 font-medium">Tap to reveal!</span>
                      
                      <div className="absolute inset-0 rounded-lg" 
                        style={{
                          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100%25\' height=\'100%25\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'smallGrid\' width=\'8\' height=\'8\' patternUnits=\'userSpaceOnUse\'%3E%3Cpath d=\'M 8 0 L 0 0 0 8\' fill=\'none\' stroke=\'rgba(0, 0, 0, 0.05)\' stroke-width=\'0.5\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100%25\' height=\'100%25\' fill=\'url(%23smallGrid)\'/%3E%3C/svg%3E")',
                          opacity: 0.8
                        }}
                      />
                    </div>
                  </button>
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      {selectedLetterIdeas && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-rose-500 to-amber-500 text-white">
              <h3 className="text-xl font-bold flex items-center">
                <span className="bg-white text-rose-500 w-10 h-10 rounded-full flex items-center justify-center mr-2 font-bold text-xl">
                  {selectedLetterIdeas.letter}
                </span>
                Choose a Date Idea
              </h3>
              <button 
                onClick={() => setSelectedLetterIdeas(null)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto p-4 flex-grow">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedLetterIdeas.ideas.map((idea) => {
                  const isSelected = 
                    selectedDateIdeas[selectedLetterIdeas.letter]?.id === idea.id;
                  
                  return (
                    <div 
                      key={idea.id}
                      className={`border rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
                        isSelected 
                          ? 'border-amber-500 shadow-md shadow-amber-200' 
                          : 'border-gray-200 hover:border-amber-300'
                      }`}
                      onClick={() => selectDateIdea(selectedLetterIdeas.letter, idea)}
                    >
                      <div className="relative h-44">
                        <Image
                          src={dateIdeaImages[idea.slug] || '/placeholder.jpg'}
                          alt={idea.title}
                          fill
                          className="object-cover"
                        />
                        {isSelected && (
                          <div className="absolute top-2 right-2 bg-amber-500 text-white p-1.5 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                          <h4 className="text-white font-bold text-lg truncate">{idea.title}</h4>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="mb-4 text-center">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className={`w-full ${isSelected ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800'}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              selectDateIdea(selectedLetterIdeas.letter, idea);
                            }}
                          >
                            {isSelected ? 'Selected ✓' : 'Choose This One!'}
                          </Button>
                        </div>
                        
                        <div className="flex justify-center">
                          <Link href={`/date-idea/${idea.slug}`} onClick={(e) => e.stopPropagation()}>
                            <Button variant="link" size="sm" className="p-0 h-auto text-blue-600 hover:text-blue-800">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-center">
                <Button 
                  onClick={() => {
                    if (selectedDateIdeas[selectedLetterIdeas.letter]) {
                      setSelectedLetterIdeas(null);
                    } else if (selectedLetterIdeas.ideas.length > 0) {
                      selectDateIdea(selectedLetterIdeas.letter, selectedLetterIdeas.ideas[0]);
                    }
                  }}
                  className="bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white px-8"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlphabetDating;