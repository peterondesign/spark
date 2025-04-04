"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageTitle from "../components/PageTitle";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";

interface NatureDateIdea {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
}

export default function NatureDateIdeas() {
  const [completedDates, setCompletedDates] = useState<string[]>([]);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [natureDateIdeas] = useState<NatureDateIdea[]>([
    {
      id: "nature-scavenger-hunt",
      title: "Nature Scavenger Hunt",
      category: "Outdoor",
      description: "Search for items in nature on a guided hunt.",
      image: "/bikeriding.webp"
    },
    {
      id: "nature-photography-workshop",
      title: "Nature Photography Workshop",
      category: "Outdoor",
      description: "Learn to take stunning nature photos.",
      image: "/romanticpaint.jpg"
    },
    {
      id: "forest-bathing",
      title: "Forest Bathing",
      category: "Outdoor",
      description: "Practice mindfulness while immersed in nature.",
      image: "/placeholder.jpg"
    },
    {
      id: "bird-watching-expedition",
      title: "Bird Watching Expedition",
      category: "Outdoor",
      description: "Spot and identify local bird species together.",
      image: "/placeholder.jpg"
    },
    {
      id: "botanical-garden-tour",
      title: "Botanical Garden Tour",
      category: "Outdoor",
      description: "Explore exotic plants and beautiful landscaping.",
      image: "/placeholder.jpg"
    },
    {
      id: "stargazing-picnic",
      title: "Stargazing Picnic",
      category: "Outdoor",
      description: "Enjoy the night sky with snacks and blankets.",
      image: "/placeholder.jpg"
    },
    {
      id: "hiking-adventure",
      title: "Hiking Adventure",
      category: "Outdoor",
      description: "Explore trails and enjoy scenic views together.",
      image: "/placeholder.jpg"
    },
    {
      id: "kayaking-date",
      title: "Kayaking Date",
      category: "Water Activity",
      description: "Paddle through calm waters and explore nature together.",
      image: "/placeholder.jpg"
    }
  ]);

  // Load completed dates from localStorage on mount
  useEffect(() => {
    try {
      const savedCompletions = localStorage.getItem('completedNatureDates');
      if (savedCompletions) {
        setCompletedDates(JSON.parse(savedCompletions));
      }
    } catch (error) {
      console.error('Error loading completed nature dates:', error);
    }
  }, []);

  // Save completed dates to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('completedNatureDates', JSON.stringify(completedDates));
    } catch (error) {
      console.error('Error saving completed nature dates:', error);
    }
  }, [completedDates]);

  const toggleComplete = (id: string) => {
    setCompletedDates(prev => {
      if (prev.includes(id)) {
        return prev.filter(dateId => dateId !== id);
      } else {
        triggerCelebration();
        return [...prev, id];
      }
    });
  };
  
  const resetProgress = () => {
    if (window.confirm("Are you sure you want to reset your progress? This will mark all dates as not completed.")) {
      setCompletedDates([]);
      localStorage.removeItem('completedNatureDates');
    }
  };
  
  const triggerCelebration = () => {
    setShowCelebration(true);
    
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
  };

  return (
    <div className="min-h-screen bg-white">
      <PageTitle title="Nature Date Ideas | Outdoor Dating Adventures" />
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-700 to-emerald-500 py-16 text-white relative">
        <div className="container mx-auto px-4 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Nature Date Ideas
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl max-w-3xl mx-auto"
          >
            Connect with your partner and the natural world. Mark dates as completed to track your adventures!
          </motion.p>
          
          {/* Progress indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 bg-white/20 p-4 rounded-lg inline-flex items-center"
          >
            <div className="text-left">
              <span className="block text-sm font-medium">Your Progress</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{completedDates.length}</span>
                <span className="text-sm">of</span>
                <span className="text-2xl font-bold">{natureDateIdeas.length}</span>
                <span className="text-sm">dates completed</span>
              </div>
            </div>
            <div className="ml-4 w-16 h-16 rounded-full border-4 border-white flex items-center justify-center">
              <div className="text-lg font-bold">
                {completedDates.length > 0 
                  ? Math.round((completedDates.length / natureDateIdeas.length) * 100) 
                  : 0}%
              </div>
            </div>
          </motion.div>

          {completedDates.length > 0 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              onClick={resetProgress}
              className="mt-4 bg-white/10 hover:bg-white/20 text-white text-sm py-2 px-4 rounded transition-colors"
            >
              Reset Progress
            </motion.button>
          )}
        </div>
      </section>
      
      {/* Date Ideas Grid */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {natureDateIdeas.map((dateIdea, index) => {
              const isCompleted = completedDates.includes(dateIdea.id);
              
              return (
                <motion.div
                  key={dateIdea.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className={cn(
                    "overflow-hidden h-full transition-all duration-300",
                    isCompleted ? "bg-gray-50" : "bg-white"
                  )}>
                    <div className="relative">
                      <div className={cn(
                        "relative h-48 bg-gray-200",
                        isCompleted ? "opacity-70" : ""
                      )}>
                        <Image
                          src={dateIdea.image}
                          alt={dateIdea.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      
                      {/* Large checkbox style indicator for completion status */}
                      <div 
                        className={cn(
                          "absolute top-3 right-3 w-10 h-10 rounded-full cursor-pointer transition-all duration-300", 
                          "flex items-center justify-center shadow-md border-2", 
                          isCompleted 
                            ? "bg-green-500 border-white text-white" 
                            : "bg-white border-gray-300 text-gray-300"
                        )}
                        onClick={() => toggleComplete(dateIdea.id)}
                        role="checkbox"
                        aria-checked={isCompleted}
                        tabIndex={0}
                      >
                        {isCompleted ? (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : null}
                      </div>

                      {isCompleted && (
                        <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                          <div className="bg-green-100 text-green-800 px-2.5 py-1.5 rounded-md font-bold text-sm transform rotate-[-15deg] shadow-lg border border-green-200">
                            COMPLETED
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <h3 className={cn(
                        "text-lg font-semibold mb-2 transition-all duration-300",
                        isCompleted ? "line-through text-gray-500" : "text-gray-800"
                      )}>
                        {dateIdea.title}
                      </h3>
                      
                      <p className={cn(
                        "text-sm text-gray-600 mb-4",
                        isCompleted ? "opacity-70" : ""
                      )}>
                        {dateIdea.description}
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <span className={cn(
                          "inline-block px-2 py-1 text-xs font-medium rounded",
                          isCompleted ? "bg-gray-200 text-gray-600" : "bg-green-100 text-green-800"
                        )}>
                          {dateIdea.category}
                        </span>
                        
                        <Button 
                          variant={isCompleted ? "outline" : "default"}
                          size="sm"
                          className={isCompleted ? "text-green-600 border-green-200" : "bg-green-600 hover:bg-green-700"}
                          onClick={() => toggleComplete(dateIdea.id)}
                        >
                          {isCompleted ? "Completed ✓" : "Mark Complete"}
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-8">Benefits of Outdoor Dates</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-green-50 rounded-lg p-6 border border-green-100">
              <h3 className="text-xl font-semibold text-green-800 mb-4">For Your Relationship</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Creates shared memories in unique settings</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Reduces digital distractions for authentic connection</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Creates opportunities for deeper conversations</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Encourages teamwork and cooperation</span>
                </li>
              </ul>
            </div>
            <div className="bg-green-50 rounded-lg p-6 border border-green-100">
              <h3 className="text-xl font-semibold text-green-800 mb-4">For Your Well-being</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Reduces stress and anxiety through nature exposure</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Increases physical activity and exercise</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Enhances mood through sun exposure and fresh air</span>
                </li>
                <li className="flex items-start">
                  <svg className="h-5 w-5 text-green-600 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Promotes mindfulness and being present</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-8">Tips for Perfect Outdoor Dates</h2>
          
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <ol className="space-y-4">
              <li className="flex items-start">
                <span className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0">1</span>
                <div>
                  <h3 className="font-semibold text-lg">Check the weather forecast</h3>
                  <p className="text-gray-600">Always have a backup plan in case of unexpected weather changes.</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0">2</span>
                <div>
                  <h3 className="font-semibold text-lg">Pack essentials</h3>
                  <p className="text-gray-600">Bring water, snacks, sunscreen, and appropriate clothing for your outdoor adventure.</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0">3</span>
                <div>
                  <h3 className="font-semibold text-lg">Research the location</h3>
                  <p className="text-gray-600">Know where facilities are located and understand any restrictions or permits needed.</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="bg-green-600 text-white w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0">4</span>
                <div>
                  <h3 className="font-semibold text-lg">Capture the memories</h3>
                  <p className="text-gray-600">Bring a camera to document your experiences, but also remember to stay present.</p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* Challenge CTA */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Take the Nature Date Challenge!</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Challenge yourselves to complete all our nature date ideas. Track your progress above and celebrate each new experience together!
          </p>
          <Button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
            className="bg-green-600 hover:bg-green-700"
            size="lg"
          >
            Start Tracking Your Adventures
          </Button>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}