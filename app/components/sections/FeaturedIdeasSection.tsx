"use client";

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';
import { ChevronDown } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

gsap.registerPlugin(ScrollTrigger);

const FeaturedIdeasSection = () => {
  const { theme } = useTheme();
  const [selectedCity, setSelectedCity] = useState<string>("LISBON");
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const handleCityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(event.target.value);
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial states
      gsap.set(titleRef.current, {
        opacity: 0,
        y: 50,
      });

      gsap.set(cardsRef.current?.children || [], {
        opacity: 0,
        y: 100,
        scale: 0.8,
      });

      // Create scroll-triggered animation
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 80%",
        onEnter: () => {
          const tl = gsap.timeline();
          
          tl.to(titleRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
          })
          .to(cardsRef.current?.children || [], {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.2,
            ease: "back.out(1.7)",
          }, "-=0.4");
        }
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const featuredIdeas = [
    {
      id: 1,
      title: "Romantic Dinner",
      category: "Food & Dining",
      image: "/ideas.webp",
      description: "Discover intimate restaurants perfect for date nights"
    },
    {
      id: 2,
      title: "Adventure Sports",
      category: "Outdoor",
      image: "/ideas2.webp", 
      description: "Exciting activities to get your adrenaline pumping"
    },
    {
      id: 3,
      title: "Art Gallery",
      category: "Culture",
      image: "/ideas3.webp",
      description: "Explore beautiful art and culture together"
    },
    {
      id: 4,
      title: "Beach Day",
      category: "Outdoor",
      image: "/ideas4.webp",
      description: "Relax and enjoy the sun by the water"
    }
  ];

  return (
    <section 
      ref={sectionRef} 
      id="date-ideas" 
      className={`py-20 ${theme === 'dark' ? 'bg-[#2a2a2a]' : 'bg-gray-50'}`}
    >
      <div className="container mx-auto px-6">
        <h2 
          ref={titleRef}
          className={`text-4xl md:text-5xl font-bold font-heading text-left mb-16 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}
        >
          WHAT'S HAPPENING THIS WEEK IN{" "}
          <div className={`inline-flex items-center gap-2 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            <select 
              value={selectedCity}
              onChange={handleCityChange}
              className={`bg-transparent border-b-2 border-gray-400 focus:border-gray-600 outline-none text-4xl md:text-5xl font-bold cursor-pointer ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}
            >
              <option value="LISBON">LISBON</option>
              <option value="NEW YORK">NEW YORK</option>
              <option value="LONDON">LONDON</option>
              <option value="PARIS">PARIS</option>
              <option value="TOKYO">TOKYO</option>
            </select>
            <ChevronDown className="w-8 h-8 md:w-10 md:h-10" />
          </div>
        </h2>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredIdeas.map((idea) => (
            <div
              key={idea.id}
              className={`group rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 ${
                theme === 'dark' 
                  ? 'bg-[#333333] border border-gray-700' 
                  : 'bg-white border border-gray-200'
              }`}
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={idea.image}
                  alt={idea.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-rose-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {idea.category}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className={`text-xl font-bold font-heading mb-2 group-hover:text-rose-400 transition-colors ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {idea.title}
                </h3>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {idea.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="bg-rose-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-rose-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            View All Ideas
          </button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedIdeasSection;
