"use client";

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import SimpleTikTokEmbed from '../SimpleTikTokEmbed';

gsap.registerPlugin(ScrollTrigger);

const TikTokSection = () => {
  const { theme } = useTheme();
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Set initial states
      gsap.set([titleRef.current, videoRef.current, contentRef.current], {
        opacity: 0,
        y: 80,
      });

      // Create scroll-triggered animation
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 70%",
        onEnter: () => {
          const tl = gsap.timeline();
          
          tl.to(titleRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
          })
          .to(videoRef.current, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power2.out",
          }, "-=0.4")
          .to(contentRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
          }, "-=0.6");
        }
      });

    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className={`py-20 ${theme === 'dark' ? 'bg-[#2a2a2a] text-white' : 'bg-gray-50 text-gray-900'}`}
    >
      <div className="container mx-auto px-6">
        <h2 
          ref={titleRef}
          className="text-4xl md:text-5xl font-bold font-heading text-center mb-16"
        >
          Follow Us on{" "}
          <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            TikTok
          </span>
        </h2>

        <div className="max-w-4xl mx-auto">
          {/* TikTok Video Embed */}
          <div ref={videoRef} className="flex justify-center mb-12">
            <div className="relative w-full max-w-2xl">
              <SimpleTikTokEmbed url="https://www.tiktok.com/@dateideascc/video/7512036229806886166" />
              
              {/* Decorative elements */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-pink-500 rounded-full opacity-60"></div>
              <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-purple-500 rounded-full opacity-40"></div>
              <div className="absolute top-1/2 -right-8 w-6 h-6 bg-yellow-400 rounded-full opacity-50"></div>
            </div>
          </div>          <div ref={contentRef} className="text-center">
            <p className={`text-xl mb-8 max-w-2xl mx-auto ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Watch real couples share their favorite date ideas and dating experiences on our TikTok!
            </p>
            
            <Link
              href="https://www.tiktok.com/@dateideascc"
              target="_blank"
              className="inline-flex items-center bg-black text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-800 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1"
            >
              <span>Follow on TikTok</span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-5 h-5 ml-3">
                <path fill="currentColor" d="M448,209.91a210.06,210.06,0,0,1-122.77-39.25V349.38A162.55,162.55,0,1,1,185,188.31V278.2a74.62,74.62,0,1,0,52.23,71.18V0l88,0a121.18,121.18,0,0,0,1.86,22.17h0A122.18,122.18,0,0,0,381,102.39a121.43,121.43,0,0,0,67,20.14Z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TikTokSection;
