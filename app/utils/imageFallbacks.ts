// Create a fallback mapping for missing images
export const imageFallbackMap = {
  // Rooftop-related images -> use "Outdoor Movie Screening" or similar outdoor dining
  'rooftop_dinner_and_drinks_food_drink': 'outdoor_movie_screening_entertainment',
  
  // Breakfast/morning images -> use "Quiet Morning Reading" or morning activities  
  'breakfast_in_bed_food_drink': 'quiet_morning_reading_and_coffee_cultural',
  
  // Sake/alcohol tasting -> use "Home Cocktail Party" or similar drink activities
  'sake_tasting_food_drink': 'home_cocktail_party_food_drink',
  
  // Sushi/cooking class -> use "DIY Pizza" or cooking activities
  'sushi_making_class_food_drink': 'diy_pizza_food_drink',
  
  // Additional fallbacks for other missing images
  'wine_tasting_food_drink': 'home_cocktail_party_food_drink',
  'cooking_class_food_drink': 'diy_pizza_food_drink',
  'rooftop_bar_nightlife': 'lounge_drinks_nightlife',
  'sunrise_breakfast_food_drink': 'quiet_morning_reading_and_coffee_cultural'
};

// Function to get fallback image key for missing images
export function getFallbackImageKey(baseKey: string): string {
  // Try exact match first
  if (imageFallbackMap[baseKey as keyof typeof imageFallbackMap]) {
    return imageFallbackMap[baseKey as keyof typeof imageFallbackMap];
  }
  
  // Try partial matches
  for (const [pattern, fallback] of Object.entries(imageFallbackMap)) {
    if (baseKey.includes(pattern.split('_')[0]) || pattern.includes(baseKey.split('_')[0])) {
      return fallback;
    }
  }
  
  // Default fallbacks based on category
  if (baseKey.includes('food_drink')) {
    return 'home_cocktail_party_food_drink';
  }
  if (baseKey.includes('outdoor')) {
    return 'stargazing_outdoor';
  }
  if (baseKey.includes('entertainment')) {
    return 'silent_disco_entertainment';
  }
  if (baseKey.includes('cultural')) {
    return 'library_date_cultural';
  }
  if (baseKey.includes('adventure')) {
    return 'cable_cars_adventure';
  }
  if (baseKey.includes('relaxation')) {
    return 'diy_spa_day_relaxation';
  }
  
  // Ultimate fallback
  return 'paint_on_a_viewpoint_outdoor';
}