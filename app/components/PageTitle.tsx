"use client";

import Head from "next/head";
import { usePathname } from "next/navigation";
import { PAGE_TITLES, META_DESCRIPTIONS } from "../utils/titleUtils";

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
      default:
        // For dynamic paths like date detail pages
        if (pathname?.includes("/date-idea/")) {
          return customTitle || PAGE_TITLES.HOME;
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
      default:
        // For dynamic paths like date detail pages
        if (pathname?.includes("/date-idea/") && customTitle) {
          return META_DESCRIPTIONS.DATE_DETAIL(customTitle);
        }
        return META_DESCRIPTIONS.HOME;
    }
  };

  // Use provided values if available, otherwise use defaults based on path
  const pageTitle = title || getDefaultTitle();
  const metaDescription = description || customDescription || getDefaultDescription();

  return (
    <Head>
      <title>{pageTitle}</title>
      <meta name="description" content={metaDescription} />
      
      {/* Open Graph tags for social sharing */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content="website" />
      
      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={metaDescription} />
    </Head>
  );
};

export default PageTitle;
