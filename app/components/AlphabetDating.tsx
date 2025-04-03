"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import SaveButton from "./SaveButton";
import { motion } from "framer-motion";

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

  // Load saved state from localStorage on component mount
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

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (Object.keys(revealedLetters).length > 0) {
      localStorage.setItem('alphabetDatingRevealed', JSON.stringify(revealedLetters));
    }
  }, [revealedLetters]);

  useEffect(() => {
    if (completedLetters.length > 0) {
      localStorage.setItem('alphabetDatingCompleted', JSON.stringify(completedLetters));
    }
  }, [completedLetters]);

  useEffect(() => {
    if (Object.keys(selectedDateIdeas).length > 0) {
      localStorage.setItem('alphabetDatingSelected', JSON.stringify(selectedDateIdeas));
    }
  }, [selectedDateIdeas]);

  const revealLetter = (letter: string) => {
    setRevealedLetters(prev => ({
      ...prev,
      [letter]: true
    }));

    // Show date ideas modal for this letter
    if (dateIdeas[letter] && dateIdeas[letter].length > 0) {
      setSelectedLetterIdeas({ letter, ideas: dateIdeas[letter] });
    }
  };

  const selectDateIdea = (letter: string, idea: DateIdea) => {
    setSelectedDateIdeas(prev => ({
      ...prev,
      [letter]: idea
    }));
    setSelectedLetterIdeas(null); // Close the modal
  };

  const markAsCompleted = (letter: string) => {
    if (!completedLetters.includes(letter)) {
      setCompletedLetters(prev => [...prev, letter]);
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
    
    // If no idea is selected yet, use the first one from the array
    if (dateIdeas[letter] && dateIdeas[letter].length > 0) {
      return dateIdeas[letter][0];
    }
    
    return undefined;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Alphabet Dating Challenge</h2>
        <p className="text-gray-600 mb-6">Reveal one letter at a time for your next date night adventure. Complete the alphabet for a year of amazing dates!</p>
        <div className="text-lg mb-6">
          <span className="font-bold">{Object.keys(revealedLetters).length}</span> of <span className="font-bold">26</span> letters revealed
          <span className="mx-2">•</span>
          <span className="font-bold">{completedLetters.length}</span> dates completed
        </div>
        <Button 
          onClick={resetAllCards} 
          variant="outline"
          size="sm"
          className="text-red-600 border-red-300 hover:bg-red-50"
        >
          Reset All Cards
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
                        className="object-cover"
                      />
                      {isCompleted && (
                        <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                          <div className="bg-green-100 text-green-800 px-2 py-1 rounded-md font-bold text-sm transform rotate-[-15deg] shadow-lg border border-green-200">
                            COMPLETED
                          </div>
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        {idea && idea.id > 0 && (
                          <SaveButton 
                            itemSlug={idea.slug}
                            item={idea}
                            onToggle={() => {}}
                          />
                        )}
                      </div>

                      {hasMultipleIdeas && !isCompleted && (
                        <button 
                          onClick={() => setSelectedLetterIdeas({ letter, ideas: dateIdeas[letter] })}
                          className="absolute bottom-2 right-2 bg-white/90 hover:bg-white text-amber-600 p-1 rounded-full shadow-md"
                          title="See more options"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold text-sm truncate">{idea?.title || `${letter} Date`}</h3>
                      <p className="text-xs text-gray-500 mb-2">{idea?.category || 'Coming Soon'}</p>
                      <div className="flex justify-between items-center">
                        <Link href={idea && idea.id > 0 ? `/date-idea/${idea.slug}` : '#'}>
                          <Button variant="link" size="sm" className="p-0 h-auto text-xs">
                            View Details
                          </Button>
                        </Link>
                        {!isCompleted ? (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-xs border-green-200 text-green-700 hover:bg-green-50"
                            onClick={() => markAsCompleted(letter)}
                          >
                            Mark Done
                          </Button>
                        ) : (
                          <span className="text-xs text-green-600 font-medium">✓ Completed</span>
                        )}
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
                    className="w-full h-full bg-gradient-to-br from-rose-500 to-amber-500 rounded-lg p-0.5 shadow-lg cursor-pointer"
                  >
                    <div className="bg-white rounded-md h-full flex flex-col items-center justify-center py-10">
                      <span className="text-4xl sm:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-rose-500 to-amber-500">
                        {letter}
                      </span>
                      <span className="mt-2 text-gray-500 text-xs">Click to reveal</span>
                      
                      {/* Scratch texture overlay */}
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

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 max-w-2xl">
        <h3 className="text-xl font-semibold mb-3 text-amber-800">About Alphabet Dating</h3>
        <p className="text-amber-700 mb-4">
          Alphabet dating is a fun way to keep date nights creative and exciting! The concept is simple - work through the alphabet, with each date being inspired by a different letter.
        </p>
        <p className="text-amber-700">
          Click each card to reveal a date idea starting with that letter. After you've gone on the date, mark it as completed to track your progress. Can you complete all 26 letters?
        </p>
      </div>

      {/* Date Ideas Selection Modal */}
      {selectedLetterIdeas && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-rose-500 to-amber-500 text-white">
              <h3 className="text-xl font-bold">Choose a Date Idea for Letter {selectedLetterIdeas.letter}</h3>
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
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                          <h4 className="text-white font-bold text-sm truncate">{idea.title}</h4>
                        </div>
                      </div>
                      <div className="p-3">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-0.5 rounded">{idea.category}</span>
                          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">{idea.price}</span>
                          <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded">{idea.duration}</span>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2 mb-2">{idea.description}</p>
                        <div className="flex justify-between items-center">
                          <Link href={`/date-idea/${idea.slug}`} onClick={(e) => e.stopPropagation()}>
                            <Button variant="link" size="sm" className="p-0 h-auto text-amber-600 hover:text-amber-800">
                              View Details
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className={`text-xs ${isSelected ? 'bg-amber-100 text-amber-700' : 'border-amber-200 text-amber-700 hover:bg-amber-50'}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              selectDateIdea(selectedLetterIdeas.letter, idea);
                            }}
                          >
                            {isSelected ? 'Selected' : 'Select This Date'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedLetterIdeas(null)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => {
                    if (selectedDateIdeas[selectedLetterIdeas.letter]) {
                      setSelectedLetterIdeas(null);
                    } else if (selectedLetterIdeas.ideas.length > 0) {
                      // Auto-select first idea if none selected
                      selectDateIdea(selectedLetterIdeas.letter, selectedLetterIdeas.ideas[0]);
                    }
                  }}
                  className="bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white"
                >
                  Confirm Selection
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