"use client";

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Calendar, Heart, MapPin, Star } from 'lucide-react';
import { useTheme } from 'next-themes';

gsap.registerPlugin(ScrollTrigger);

const FeaturesSection = () => {
  const { theme } = useTheme();
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial states
      gsap.set(titleRef.current, {
        opacity: 0,
        y: 50,
      });

      gsap.set(featuresRef.current?.children || [], {
        opacity: 0,
        y: 80,
        scale: 0.9,
      });

      // Create scroll-triggered animation
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 75%",
        onEnter: () => {
          const tl = gsap.timeline();
          
          tl.to(titleRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
          })
          .to(featuresRef.current?.children || [], {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "back.out(1.7)",
          }, "-=0.4");
        }
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const features = [
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Event Reminders",
      description: "Never miss out on exciting events with our smart reminder system",
      color: "from-blue-500 to-blue-600"
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Curated Ideas",
      description: "Hand-picked date ideas tailored to your preferences and location",
      color: "from-rose-500 to-pink-600"
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Location-Based",
      description: "Discover amazing activities happening right in your neighborhood",
      color: "from-green-500 to-emerald-600"
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Top Rated",
      description: "Only the best experiences recommended by real couples",
      color: "from-amber-500 to-orange-600"
    }
  ];

  return (
    <section 
      ref={sectionRef} 
      className={`py-20 ${theme === 'dark' ? 'bg-[#212121]' : 'bg-white'}`}
    >
      <div className="container mx-auto px-6">
        <h2 
          ref={titleRef}
          className={`text-4xl md:text-5xl font-bold font-heading text-center mb-16 ${
            theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}
        >
          Why Choose{" "}
          <span className="bg-gradient-to-r from-rose-400 to-purple-400 bg-clip-text text-transparent">
            Date Ideas
          </span>
        </h2>

        <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group text-center p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${
                theme === 'dark' 
                  ? 'bg-[#2a2a2a] hover:bg-[#333333] border border-gray-700' 
                  : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.color} text-white mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                {feature.icon}
              </div>
              
              <h3 className={`text-xl font-bold font-heading mb-4 group-hover:text-rose-400 transition-colors ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                {feature.title}
              </h3>
              
              <p className={`leading-relaxed ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
