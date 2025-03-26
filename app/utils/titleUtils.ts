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
  GENERATOR: getPageTitle("Create Your Perfect Date - Idea Generator"),
  FAVORITES: getPageTitle("Your Saved Date Collection"),
  PREFERENCES: getPageTitle("Personalize Your Date Experience"),
  CALENDAR: getPageTitle("Plan Your Date Nights - Calendar"),
  DATE_DETAIL: (title: string) => getPageTitle(`${title}`)
};

// Meta description constants for each page
export const META_DESCRIPTIONS = {
  HOME: "Discover unique date ideas to spark romance and create memorable experiences with your partner. Browse our curated collection for inspiration.",
  GENERATOR: "Our AI-powered date idea generator creates personalized date suggestions based on your interests, budget, and location for the perfect experience.",
  FAVORITES: "View and manage your saved date ideas in one convenient place. Plan your next romantic outing from your personal collection of favorites.",
  PREFERENCES: "Set your relationship preferences, interests, and budget to receive perfectly tailored date recommendations just for you and your partner.",
  CALENDAR: "Organize your romantic schedule with our interactive date planning calendar. Set reminders and share special moments with your significant other.",
  DATE_DETAIL: (title: string) => `Explore "${title}" - Get all the details including tips, location info, and what to expect for this perfect date idea.`
};
