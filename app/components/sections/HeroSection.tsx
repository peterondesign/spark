"use client";

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTheme } from '../../contexts/ThemeContext';

gsap.registerPlugin(ScrollTrigger);

const HeroSection = () => {
  const { theme } = useTheme();
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Initial state - elements start invisible and moved
      gsap.set([titleRef.current, subtitleRef.current, buttonsRef.current], {
        opacity: 0,
        y: 50,
      });
      
      gsap.set(videoRef.current, {
        opacity: 0,
        x: 100,
      });

      // Animation timeline
      const tl = gsap.timeline({
        delay: 0.5,
      });

      tl.to(titleRef.current, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power2.out",
      })
      .to(subtitleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
      }, "-=0.5")
      .to(buttonsRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power2.out",
      }, "-=0.4")
      .to(videoRef.current, {
        opacity: 1,
        x: 0,
        duration: 1,
        ease: "power2.out",
      }, "-=0.6");

    }, heroRef);

    return () => ctx.revert();
  }, []);

  const scrollToDateIdeas = () => {
    document.getElementById('date-ideas')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section ref={heroRef} className={`relative min-h-screen overflow-hidden ${theme === 'light' ? 'bg-white' : 'bg-[#212121]'}`}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-rose-500 rounded-full blur-xl"></div>
        <div className="absolute bottom-40 right-20 w-48 h-48 bg-purple-600 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-rose-400 rounded-full blur-lg"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[80vh]">
          {/* Left column: Content */}
          <div className={`space-y-8 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
            <h1 
              ref={titleRef}
              className={`text-5xl md:text-6xl lg:text-7xl font-bold leading-tight font-heading ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}
            >
              New and exciting things to do in your city
            </h1>
        

            <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={scrollToDateIdeas}
                className="bg-rose-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-rose-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 uppercase"
              >
                See Date Ideas
              </button>
              <button className={`border-2 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 uppercase ${
                theme === 'light' 
                  ? 'border-gray-400 text-gray-700 hover:bg-gray-100' 
                  : 'border-gray-500 text-white hover:bg-gray-800'
              }`}>
                Sign Up with Email/Text
              </button>
            </div>

            <p 
              ref={subtitleRef}
              className={`text-xl md:text-2xl max-w-lg ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}
            >
              We offer exclusive discounts, reminder emails and texts for only $8/month
            </p>
          </div>

          {/* Right column: Video */}
          <div ref={videoRef} className="relative">
            <div className={`relative rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm border ${
              theme === 'light' 
                ? 'bg-gray-100/20 border-gray-300/20' 
                : 'bg-black/20 border-white/20'
            }`}>
              <video
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-auto"
              >
                <source src="/SparkIntro.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className={`absolute inset-0 ${
                theme === 'light' 
                  ? 'bg-gradient-to-t from-gray-200/20 to-transparent' 
                  : 'bg-gradient-to-t from-black/20 to-transparent'
              }`}></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
