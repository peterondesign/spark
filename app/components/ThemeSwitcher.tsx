"use client";

import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeSwitcherProps {
  className?: string;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ className = '' }) => {
  const { theme, toggleTheme, isLightTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative flex items-center justify-center
        w-12 h-6 rounded-full transition-all duration-300 ease-in-out
        ${isLightTheme 
          ? 'bg-gray-300 hover:bg-gray-400' 
          : 'bg-gray-600 hover:bg-gray-500'
        }
        focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2
        ${className}
      `}
      aria-label={`Switch to ${isLightTheme ? 'dark' : 'light'} theme`}
      title={`Switch to ${isLightTheme ? 'dark' : 'light'} theme`}
    >
      <div
        className={`
          absolute w-5 h-5 bg-white rounded-full shadow-md
          flex items-center justify-center
          transition-transform duration-300 ease-in-out
          ${isLightTheme ? 'translate-x-3' : '-translate-x-3'}
        `}
      >
        {isLightTheme ? (
          <Sun className="w-3 h-3 text-yellow-500" />
        ) : (
          <Moon className="w-3 h-3 text-blue-600" />
        )}
      </div>
    </button>
  );
};

export default ThemeSwitcher;
