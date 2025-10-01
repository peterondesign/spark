"use client";

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTheme } from 'next-themes';
import AuthenticationModal from '../AuthenticationModal';
import StripeModal from '../StripeModal';

gsap.registerPlugin(ScrollTrigger);

const HeroSection = () => {
  const { theme } = useTheme();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [email, setEmail] = useState('');
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const scrollArrowRef = useRef<HTMLDivElement>(null);

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

      gsap.set(scrollArrowRef.current, {
        opacity: 0,
        y: 30,
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
        }, "-=0.6")
        .to(scrollArrowRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
        }, "-=0.3");

      // Continuous bounce animation for the arrow
      gsap.to(scrollArrowRef.current, {
        y: 10,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
        delay: 2,
      });

    }, heroRef);

    return () => ctx.revert();
  }, []);

  const scrollToDateIdeas = () => {
    document.getElementById('all-date-ideas')?.scrollIntoView({ behavior: 'smooth' });
  };

  const openAuthModal = () => {
    setShowAuthModal(true);
  };

  const handleSubscribeClick = () => {
    setShowStripeModal(true);
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
              Find fun things to do in your city  
            </h1>

            <div ref={buttonsRef} className="flex flex-col gap-6">
              {/* See Date Ideas Button */}
              <button
                onClick={scrollToDateIdeas}
                className="bg-rose-500 text-white px-8 py-4 rounded-full font-bold text-xl hover:bg-rose-600 transition-all duration-300 shadow-lg hover:shadow-xl w-fit"
              >
                See Date Ideas
              </button>
              
              {/* Email Subscription */}
              <div className="flex flex-col sm:flex-row gap-4 max-w-md">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="youremail@example.com"
                  className={`flex-1 px-4 py-3 rounded-full border-2 text-lg ${theme === 'light'
                      ? 'border-gray-300 bg-white text-gray-900 placeholder-gray-500 focus:border-rose-500'
                      : 'border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:border-rose-500'
                    } focus:outline-none focus:ring-2 focus:ring-rose-500/20`}
                />
                <button
                  onClick={handleSubscribeClick}
                  className="bg-gray-800 text-white px-6 py-3 rounded-full font-bold text-lg hover:bg-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl whitespace-nowrap"
                >
                  Subscribe for reminders €8/month
                </button>
              </div>
            </div>

          </div>

          {/* Right column: Video */}
          <div ref={videoRef} className="relative">
            <div className={`relative rounded-2xl overflow-hidden shadow-2xl backdrop-blur-sm border ${theme === 'light'
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
              <div className={`absolute inset-0 ${theme === 'light'
                  ? 'bg-gradient-to-t from-gray-200/20 to-transparent'
                  : 'bg-gradient-to-t from-black/20 to-transparent'
                }`}></div>
            </div>
          </div>
        </div>

        {/* Scroll Arrow with Subtitle */}
        <div 
          ref={scrollArrowRef}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center cursor-pointer group"
          onClick={scrollToDateIdeas}
        >
          <p className={`text-sm font-medium mb-2 transition-colors duration-300 ${theme === 'light' 
              ? 'text-gray-600 group-hover:text-gray-800' 
              : 'text-gray-400 group-hover:text-gray-200'
            }`}>
            Scroll to see date ideas
          </p>
          <div className={`transition-colors duration-300 ${theme === 'light' 
              ? 'text-gray-500 group-hover:text-rose-600' 
              : 'text-gray-400 group-hover:text-rose-400'
            }`}>
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="mx-auto"
            >
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </div>
        </div>
      </div>

      <AuthenticationModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
      
      <StripeModal
        isOpen={showStripeModal}
        onClose={() => setShowStripeModal(false)}
        email={email}
      />
    </section>
  );
};

export default HeroSection;
