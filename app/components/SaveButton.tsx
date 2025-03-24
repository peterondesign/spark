"use client";

import { useState, useEffect } from "react";
import { HeartIcon, HeartOutlineIcon } from "./icons";

type SaveButtonProps = {
  itemSlug: string;
  item: any;
  onToggle?: (isSaved: boolean) => void;
  className?: string;
};

export default function SaveButton({ itemSlug, item, onToggle, className = "" }: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Check if this item is already saved
  useEffect(() => {
    const checkIfSaved = () => {
      try {
        const savedItems = localStorage.getItem("savedDateIdeas");
        if (savedItems) {
          const parsedItems = JSON.parse(savedItems);
          setIsSaved(parsedItems.some((savedItem: any) => savedItem.slug === itemSlug));
        }
      } catch (error) {
        console.error("Error checking saved status:", error);
      }
    };
    
    checkIfSaved();
  }, [itemSlug]);

  // Toggle saved status
  const toggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Start animation
    setIsAnimating(true);
    
    try {
      const savedItems = localStorage.getItem("savedDateIdeas");
      let updatedItems = [];
      
      if (savedItems) {
        updatedItems = JSON.parse(savedItems);
        
        if (isSaved) {
          // Remove the item
          updatedItems = updatedItems.filter((savedItem: any) => savedItem.slug !== itemSlug);
        } else {
          // Add the item
          updatedItems.push(item);
        }
      } else {
        // First item to save
        updatedItems = [item];
      }
      
      localStorage.setItem("savedDateIdeas", JSON.stringify(updatedItems));
      setIsSaved(!isSaved);
      
      if (onToggle) {
        onToggle(!isSaved);
      }
    } catch (error) {
      console.error("Error saving item:", error);
    }
    
    // Reset animation after a short delay
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  };

  return (
    <button 
      className={`bg-white p-3 rounded-full shadow-lg hover:bg-gray-100 transition-all ${className} ${
        isAnimating ? 'scale-110' : ''
      }`}
      onClick={toggleSave}
      aria-label={isSaved ? "Remove from favorites" : "Add to favorites"}
    >
      {isSaved ? (
        <HeartIcon className={`h-7 w-7 text-rose-500 ${isAnimating ? 'animate-pulse' : ''}`} />
      ) : (
        <HeartOutlineIcon className="h-7 w-7 text-gray-400 hover:text-rose-400" />
      )}
    </button>
  );
}
