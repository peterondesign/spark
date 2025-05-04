"use client";

import { useState, useEffect } from "react";
import { HeartIcon, HeartOutlineIcon } from "./icons";
import { favoritesService } from "../services/favoritesService";
import { useToast } from "@/hooks/use-toast";

type SaveButtonProps = {
  itemSlug: string;
  item: any;
  onToggle?: (isSaved: boolean) => void;
  className?: string;
};

export default function SaveButton({ itemSlug, item, onToggle, className = "" }: SaveButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { toast } = useToast();
  
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
  const toggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAnimating(true);
    try {
      if (isSaved) {
        await favoritesService.removeFavorite(item.id);
        setIsSaved(false);
        toast({ title: `${item.title} removed` });
      } else {
        await favoritesService.saveFavorite(item);
        setIsSaved(true);
        toast({ title: `${item.title} added` });
      }
    } catch (error) {
      console.error(error);
      toast({ title: 'Unable to update favorites', variant: 'destructive' });
    }
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
