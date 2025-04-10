// Central location for interface definitions used throughout the application

// Main DateIdea interface for grid/list views
export interface DateIdea {
  id: number;
  title: string;
  category: string;
  location: string;
  description: string;
  slug: string;
  image: string;
  timeOfDay?: string;
  mood?: string;
  priceLevel?: number;
  tips?: string | null;
  longDescription?: string;
}

// Extended DateIdea interface for detail page
export interface DateIdeaDetail extends DateIdea {
  rating?: number;
  price?: string;
  duration?: string;
  bestForStage?: string;
  idealFor?: string;
  relatedDateIdeas?: string[];
  images?: string[];
}

// City item for location selection
export interface CityItem {
  name: string;
  countryCode: string;
  countryName: string;
  isPopular: boolean;
  id: string;
}

// Simple event interface for static data
export interface Event {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  url: string;
}