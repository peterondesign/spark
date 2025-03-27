"use client";

import { useEffect } from "react";
import { PAGE_TITLES, META_DESCRIPTIONS, getPageTitle } from "../utils/titleUtils";
import { usePathname } from "next/navigation";

interface PageTitleProps {
  title?: string;
  customTitle?: string;
  description?: string;
  customDescription?: string;
}

const PageTitle: React.FC<PageTitleProps> = ({ 
  title, 
  customTitle, 
  description,
  customDescription 
}) => {
  const pathname = usePathname();

  const getDefaultTitle = (): string => {
    switch (pathname) {
      case "/":
        return PAGE_TITLES.HOME;
      case "/date-idea-generator":
        return PAGE_TITLES.GENERATOR;
      case "/favorites":
        return PAGE_TITLES.FAVORITES;
      case "/preferences":
        return PAGE_TITLES.PREFERENCES;
      case "/calendar":
        return PAGE_TITLES.CALENDAR;
      case "/date-ideas-near-me":
        return PAGE_TITLES.DATE_IDEAS_NEAR_ME;
      default:
        // For dynamic paths like date detail pages
        if (pathname?.includes("/date-idea/")) {
          return customTitle ? PAGE_TITLES.DATE_DETAIL(customTitle) : PAGE_TITLES.HOME;
        }
        // For /date-ideas-near-me/[location] paths
        if (pathname?.includes("/date-ideas-near-me/")) {
          const location = pathname.split('/').pop() || '';
          const formattedLocation = location.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ');
          return getPageTitle(`Date Ideas in ${formattedLocation} - Local Date Night Suggestions`);
        }
        return PAGE_TITLES.HOME;
    }
  };

  const getDefaultDescription = (): string => {
    switch (pathname) {
      case "/":
        return META_DESCRIPTIONS.HOME;
      case "/date-idea-generator":
        return META_DESCRIPTIONS.GENERATOR;
      case "/favorites":
        return META_DESCRIPTIONS.FAVORITES;
      case "/preferences":
        return META_DESCRIPTIONS.PREFERENCES;
      case "/calendar":
        return META_DESCRIPTIONS.CALENDAR;
      case "/date-ideas-near-me":
        return META_DESCRIPTIONS.DATE_IDEAS_NEAR_ME;
      default:
        // For dynamic paths like date detail pages
        if (pathname?.includes("/date-idea/") && customTitle) {
          return META_DESCRIPTIONS.DATE_DETAIL(customTitle);
        }
        // For /date-ideas-near-me/[location] paths
        if (pathname?.includes("/date-ideas-near-me/")) {
          const location = pathname.split('/').pop() || '';
          const formattedLocation = location.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ');
          return `Find the best date ideas in ${formattedLocation}. Discover local date night spots and activities for couples in this area.`;
        }
        return META_DESCRIPTIONS.HOME;
    }
  };

  // Use provided values if available, otherwise use defaults based on path
  const pageTitle = title || getDefaultTitle();
  const metaDescription = description || customDescription || getDefaultDescription();

  // Update document title imperatively since we're in a client component
  useEffect(() => {
    document.title = pageTitle;
    
    // Add meta description tag
    let metaDescElement = document.querySelector('meta[name="description"]');
    if (!metaDescElement) {
      metaDescElement = document.createElement('meta');
      metaDescElement.setAttribute('name', 'description');
      document.head.appendChild(metaDescElement);
    }
    metaDescElement.setAttribute('content', metaDescription);
  }, [pageTitle, metaDescription]);

  return null; // This component no longer renders any HTML
};

export default PageTitle;
