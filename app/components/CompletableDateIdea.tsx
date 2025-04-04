"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

interface DateIdea {
  id: string | number;
  title: string;
  category: string;
  description?: string;
  image: string;
}

interface CompletableDateIdeaProps {
  dateIdea: DateIdea;
  onComplete?: (id: string | number, completed: boolean) => void;
  className?: string;
}

export default function CompletableDateIdea({ dateIdea, onComplete, className }: CompletableDateIdeaProps) {
  const [completed, setCompleted] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  // Load completion state from localStorage on mount
  useEffect(() => {
    try {
      const savedCompletions = localStorage.getItem('completedDateIdeas');
      if (savedCompletions) {
        const completions = JSON.parse(savedCompletions);
        setCompleted(completions.includes(dateIdea.id));
      }
    } catch (error) {
      console.error('Error loading completed date ideas:', error);
    }
  }, [dateIdea.id]);

  // Save completion state to localStorage when changed
  useEffect(() => {
    try {
      const savedCompletions = localStorage.getItem('completedDateIdeas');
      const completions = savedCompletions ? JSON.parse(savedCompletions) : [];
      
      if (completed && !completions.includes(dateIdea.id)) {
        completions.push(dateIdea.id);
      } else if (!completed && completions.includes(dateIdea.id)) {
        const index = completions.indexOf(dateIdea.id);
        if (index > -1) {
          completions.splice(index, 1);
        }
      }
      
      localStorage.setItem('completedDateIdeas', JSON.stringify(completions));
    } catch (error) {
      console.error('Error saving completed date ideas:', error);
    }
  }, [completed, dateIdea.id]);

  // Trigger confetti effect when completed
  useEffect(() => {
    if (showCelebration) {
      const duration = 2000;
      const end = Date.now() + duration;

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
  }, [showCelebration]);

  const toggleComplete = () => {
    const newCompletedState = !completed;
    setCompleted(newCompletedState);
    
    if (newCompletedState) {
      // Show celebration effects when marking as complete
      setShowCelebration(true);
    }
    
    if (onComplete) {
      onComplete(dateIdea.id, newCompletedState);
    }
  };

  return (
    <Card 
      className={cn(
        "overflow-hidden transition-all duration-300",
        completed ? "bg-gray-50" : "bg-white",
        className
      )}
    >
      <div className="relative">
        <div className={cn(
          "relative h-48 bg-gray-200",
          completed ? "opacity-70" : ""
        )}>
          <Image
            src={dateIdea.image}
            alt={dateIdea.title}
            fill
            className="object-cover"
          />
        </div>
        
        {/* Completion Status Icon */}
        <div 
          className={cn(
            "absolute top-3 right-3 w-10 h-10 rounded-full cursor-pointer transition-all duration-300", 
            "flex items-center justify-center shadow-md border-2", 
            completed 
              ? "bg-green-500 border-white text-white" 
              : "bg-white border-gray-300 text-gray-300"
          )}
          onClick={toggleComplete}
          role="checkbox"
          aria-checked={completed}
          tabIndex={0}
        >
          {completed ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : null}
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <h3 
            className={cn(
              "font-semibold text-lg mb-2 transition-all duration-300",
              completed ? "line-through text-gray-500" : "text-gray-800"
            )}
          >
            {dateIdea.title}
          </h3>
        </div>
        
        {dateIdea.description && (
          <p className={cn(
            "text-sm text-gray-600",
            completed ? "opacity-70" : ""
          )}>
            {dateIdea.description}
          </p>
        )}
        
        <div className="flex justify-between items-center mt-4">
          <div 
            className={cn(
              "bg-gray-100 text-xs font-medium px-2.5 py-1 rounded",
              completed ? "bg-gray-200 text-gray-500" : "bg-blue-50 text-blue-700"
            )}
          >
            {dateIdea.category}
          </div>
          
          <div className="flex gap-2">
            <Link 
              href={`/date-idea/${dateIdea.id}`} 
              className="text-sm text-blue-600 hover:underline"
            >
              View Details
            </Link>
            
            <button
              onClick={toggleComplete}
              className={cn(
                "text-sm font-medium transition-colors",
                completed ? "text-green-600" : "text-gray-600"
              )}
            >
              {completed ? "Completed" : "Select This Date"}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}