"use client";

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Import all section components
import Header from './components/sections/Header';
import HeroSection from './components/sections/HeroSection';
import AllDateIdeasSection from './components/sections/AllDateIdeasSection';
import TikTokSection from './components/sections/TikTokSection';
import Footer from './components/sections/Footer';

// Import theme provider  
import { ThemeProvider } from '@/components/theme-provider';
import { useTheme } from 'next-themes';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const HomeContent = () => {
  const { theme } = useTheme();

  useEffect(() => {
    // Set up smooth scrolling
    gsap.config({
      force3D: true,
    });

    // Refresh ScrollTrigger on load
    ScrollTrigger.refresh();

    // Clean up on unmount
    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
    };
  }, []);

  return (
    <main className={`overflow-x-hidden min-h-screen ${theme === 'light' ? 'bg-white' : 'bg-[#212121]'}`}>
      <Header />
      <HeroSection />
      <AllDateIdeasSection />
      <TikTokSection />
      <Footer />
    </main>
  );
};

export default function Home() {
  return (
    <ThemeProvider>
      <HomeContent />
    </ThemeProvider>
  );
}