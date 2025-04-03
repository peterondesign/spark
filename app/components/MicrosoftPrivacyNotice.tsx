"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MicrosoftPrivacyNotice() {
  const [showNotice, setShowNotice] = useState(false);
  
  useEffect(() => {
    // Check if the user has already closed the notice
    const noticeClosedStatus = localStorage.getItem('microsoftPrivacyNoticeClosed');
    
    // If not closed before, show after a slight delay
    if (!noticeClosedStatus) {
      const timer = setTimeout(() => {
        setShowNotice(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  const closeNotice = () => {
    localStorage.setItem('microsoftPrivacyNoticeClosed', 'true');
    setShowNotice(false);
  };
  
  if (!showNotice) return null;
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-100 border-t border-gray-200 p-4 shadow-lg z-50">
      <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-700">
          We partner with Microsoft Clarity and Microsoft Advertising to capture how you use and interact with our website through behavioral metrics, 
          heatmaps, and session replay to improve and market our products/services. Website usage data is captured using first and third-party cookies 
          and other tracking technologies to determine the popularity of products/services and online activity. Additionally, we use this information for 
          site optimization, fraud/security purposes, and advertising. For more information about how Microsoft collects and uses your data, visit the&nbsp;
          <Link href="https://www.microsoft.com/privacy/privacystatement" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            Microsoft Privacy Statement
          </Link>
        </div>
        <button 
          onClick={closeNotice}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-md text-sm font-medium transition-colors"
        >
          Acknowledge
        </button>
      </div>
    </div>
  );
}