"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, CalendarIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { DateIdea } from '../services/favoritesService';
import { getImageUrl } from '../utils/imageService';

interface FavoritesAccordionProps {
  title: string;
  items: DateIdea[];
  defaultOpen?: boolean;
  isLoading?: boolean;
  onDragStart?: (item: DateIdea) => void;
}

export default function FavoritesAccordion({ 
  title, 
  items, 
  defaultOpen = false, 
  isLoading = false,
  onDragStart 
}: FavoritesAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [itemsWithImages, setItemsWithImages] = useState<DateIdea[]>(items);
  const [draggingItem, setDraggingItem] = useState<string | null>(null);

  useEffect(() => {
    // Process images for each item
    const loadImages = async () => {
      const itemsWithLoadedImages = await Promise.all(
        items.map(async (item) => {
          try {
            const imageUrl = await getImageUrl(
              item.image, 
              `${item.title} ${item.category}`,
              400,
              300
            );
            return { ...item, image: imageUrl };
          } catch (error) {
            console.error(`Failed to load image for ${item.title}:`, error);
            return item; // Return original item if image loading fails
          }
        })
      );
      
      setItemsWithImages(itemsWithLoadedImages);
    };

    loadImages();
  }, [items]);

  const handleDragStart = (e: React.DragEvent, item: DateIdea) => {
    // Set the drag data with the date idea
    e.dataTransfer.setData("application/json", JSON.stringify(item));
    e.dataTransfer.effectAllowed = "copy";
    
    // Create a drag image
    const dragPreview = document.createElement('div');
    dragPreview.className = 'drag-preview';
    dragPreview.innerHTML = `<div style="padding: 8px; background: white; border: 2px dashed #ef4444; border-radius: 4px; width: 150px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <p style="margin: 0; font-weight: bold; font-size: 12px;">${item.title}</p>
      <p style="margin: 0; font-size: 11px; color: #666;">${item.category}</p>
      <p style="margin: 2px 0 0; font-size: 10px; color: #f43f5e;">Drop to schedule</p>
    </div>`;
    document.body.appendChild(dragPreview);
    e.dataTransfer.setDragImage(dragPreview, 75, 25);
    
    // Track which item is being dragged for visual feedback
    setDraggingItem(String(item.id));
    
    // If there's a parent drag handler, call it
    if (onDragStart) {
      onDragStart(item);
    }
    
    // Add a class to the body to indicate dragging
    document.body.classList.add('dragging-favorite');
    
    // Clean up the drag preview element after a short delay
    setTimeout(() => {
      document.body.removeChild(dragPreview);
    }, 100);
  };
  
  const handleDragEnd = () => {
    setDraggingItem(null);
    document.body.classList.remove('dragging-favorite');
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
      >
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDownIcon className="h-5 w-5 text-gray-500" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {isLoading ? (
                <p className="text-gray-500 text-center py-4">Loading favorites...</p>
              ) : itemsWithImages.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {itemsWithImages.map((item) => (
                    <div 
                      key={item.id}
                      className="relative group"
                    >
                      <div 
                        draggable
                        onDragStart={(e) => handleDragStart(e, item)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center space-x-4 p-3 rounded-lg 
                          ${draggingItem === String(item.id) ? 'bg-gray-100 border-gray-400' : 'hover:bg-gray-50'} 
                          transition-colors border border-dashed 
                          ${draggingItem === String(item.id) ? 'border-gray-400' : 'border-transparent hover:border-gray-300'} 
                          cursor-grab`}
                      >
                        <div className="relative h-16 w-16 flex-shrink-0">
                          <Image
                            src={item.image || "/placeholder-date.jpg"}
                            alt={item.title}
                            fill
                            className="object-cover rounded-md"
                            onError={(e) => {
                              // Fallback to placeholder if image fails to load
                              (e.target as HTMLImageElement).src = "/placeholder-date.jpg";
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity flex items-center justify-center">
                            <CalendarIcon className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.title}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {item.location}
                          </p>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-800">
                            {item.category}
                          </span>
                        </div>
                        <div className="text-gray-400 opacity-0 group-hover:opacity-100 hover:text-gray-600 cursor-grab">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="9" cy="12" r="1" />
                            <circle cx="9" cy="5" r="1" />
                            <circle cx="9" cy="19" r="1" />
                            <circle cx="15" cy="12" r="1" />
                            <circle cx="15" cy="5" r="1" />
                            <circle cx="15" cy="19" r="1" />
                          </svg>
                        </div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-2 -right-2 bg-gray-100 rounded-full p-1.5 shadow-sm text-xs font-medium">
                        Drag to calendar
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No favorites added yet
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}