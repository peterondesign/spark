"use client";

import { useState, useEffect } from 'react';

// Type definition for date idea
type DateIdea = {
  id?: string;
  slug: string;
  title: string;
  category: string;
  rating: number;
  location: string;
  description: string;
  price: string;
  duration: string;
  image: string;
};

export function useSavedIdeas() {
  const [savedIdeas, setSavedIdeas] = useState<DateIdea[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved ideas from localStorage on initial render
  useEffect(() => {
    const loadSavedIdeas = () => {
      try {
        const saved = localStorage.getItem('savedDateIdeas');
        if (saved) {
          setSavedIdeas(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Error loading saved ideas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedIdeas();
  }, []);

  // Check if a date idea is saved
  const isIdeaSaved = (slug: string) => {
    return savedIdeas.some(idea => idea.slug === slug);
  };

  // Save a date idea
  const saveIdea = (idea: DateIdea) => {
    // Only add if not already saved
    if (!isIdeaSaved(idea.slug)) {
      const updatedIdeas = [...savedIdeas, idea];
      setSavedIdeas(updatedIdeas);
      localStorage.setItem('savedDateIdeas', JSON.stringify(updatedIdeas));
    }
  };

  // Remove a date idea from saved
  const removeIdea = (slug: string) => {
    const updatedIdeas = savedIdeas.filter(idea => idea.slug !== slug);
    setSavedIdeas(updatedIdeas);
    localStorage.setItem('savedDateIdeas', JSON.stringify(updatedIdeas));
  };

  // Toggle saved status
  const toggleSaveIdea = (idea: DateIdea) => {
    if (isIdeaSaved(idea.slug)) {
      removeIdea(idea.slug);
      return false;
    } else {
      saveIdea(idea);
      return true;
    }
  };

  // Clear all saved ideas
  const clearAllIdeas = () => {
    setSavedIdeas([]);
    localStorage.removeItem('savedDateIdeas');
  };

  return {
    savedIdeas,
    isLoading,
    isIdeaSaved,
    saveIdea,
    removeIdea,
    toggleSaveIdea,
    clearAllIdeas
  };
}
