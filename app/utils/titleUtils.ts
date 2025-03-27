/**
 * Utility functions for managing page titles and meta descriptions across the site
 */

// Base title for the site
const BASE_TITLE = "Spark";

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
  HOME: getPageTitle("Top Date Ideas & Date Night Inspiration"),
  GENERATOR: getPageTitle("Date Night Ideas Generator - Create Your Perfect Date"),
  FAVORITES: getPageTitle("Your Saved Date Ideas Collection"),
  PREFERENCES: getPageTitle("Personalize Your Date Ideas Experience"),
  CALENDAR: getPageTitle("Date Night Planning Calendar"),
  DATE_IDEAS_NEAR_ME: getPageTitle("Date Ideas Near Me - Local Date Night Suggestions"),
  DATE_DETAIL: (title: string) => getPageTitle(`${title} - Date Idea Inspiration`)
};

// Meta description constants for each page
export const META_DESCRIPTIONS = {
  HOME: "Discover unique date ideas to spark romance. Browse our curated collection of date night ideas to create memorable experiences with your partner.",
  GENERATOR: "Our date night ideas generator creates personalized date suggestions based on your interests, budget, and location for the perfect date experience.",
  FAVORITES: "View and manage your saved date ideas in one convenient place. Plan your next romantic date night from your personal collection of favorites.",
  PREFERENCES: "Set your relationship preferences to receive perfectly tailored date night ideas and date suggestions just for you and your partner.",
  CALENDAR: "Organize your date nights with our interactive planning calendar. Schedule romantic dates and share special moments with your significant other.",
  DATE_IDEAS_NEAR_ME: "Find the best date ideas near me. Discover local date night opportunities, romantic spots, and activities perfect for couples in your area.",
  DATE_DETAIL: (title: string) => `Explore "${title}" - Get all the details for this perfect date night idea, including tips, location info, and what to expect.`
};
