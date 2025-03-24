/**
 * Utility functions for managing page titles and meta descriptions across the site
 */

// Base title for the site
const BASE_TITLE = "Sparkus";

/**
 * Generates a page title with the base title appended
 * @param pageTitle The specific page title
 * @returns Formatted title string
 */
export const getPageTitle = (pageTitle: string): string => {
  return `${pageTitle} | ${BASE_TITLE}`;
};

// Title constants for each page
export const PAGE_TITLES = {
  HOME: getPageTitle("Discover Date Ideas"),
  GENERATOR: getPageTitle("Date Idea Generator"),
  FAVORITES: getPageTitle("Your Saved Date Ideas"),
  PREFERENCES: getPageTitle("Date Preferences"),
  CALENDAR: getPageTitle("Date Calendar"),
  DATE_DETAIL: (title: string) => getPageTitle(`${title}`)
};

// Meta description constants for each page
export const META_DESCRIPTIONS = {
  HOME: "Discover unique date ideas to spark romance and create memorable experiences with your partner. Browse our curated collection for inspiration.",
  GENERATOR: "Create personalized date ideas based on your preferences, budget, and location. Our generator helps you plan the perfect date experience.",
  FAVORITES: "Access your saved date ideas in one place. Review, organize, and plan your favorite date experiences with ease.",
  PREFERENCES: "Customize your date preferences to get tailored date recommendations that match your interests, budget, and relationship stage.",
  CALENDAR: "Plan and schedule your date nights with our interactive calendar. Stay organized and never miss a special moment.",
  DATE_DETAIL: (title: string) => `Explore "${title}" - Get all the details including tips, location info, and what to expect for this perfect date idea.`
};
