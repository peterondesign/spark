interface MockEvent {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  url: string;
  price?: string;
  rating?: number;
  reviewCount?: number;
}

const categories = {
  "Romantic": ["romantic", "couple", "date night"],
  "Outdoor": ["outdoor", "adventure", "nature"],
  "Food & Drink": ["food", "restaurant", "cooking"],
  "Cultural": ["museum", "art", "history"],
  "Active": ["sport", "fitness", "active"],
  "Creative": ["art", "craft", "creative"],
  "Relaxing": ["spa", "relax", "wellness"],
  "Entertainment": ["theater", "movie", "show"],
  "Night Out": ["nightlife", "bar", "club"],
  "Educational": ["learning", "class", "workshop"]
};

export function getCategoryKeywords(category: string): string[] {
  return categories[category as keyof typeof categories] || ["tourism", "activities", "sightseeing"];
}

export function generateMockEventsForCity(city: string, category: string): MockEvent[] {
  const keywords = getCategoryKeywords(category);
  const keyword = keywords[0]; // Just use the first keyword for simplicity
  
  const cityFormatted = city.toLowerCase().replace(/\s+/g, '-');
  
  return [
    {
      id: '1',
      title: `${category} Experience in ${city}`,
      description: `Enjoy this amazing ${keyword} activity in the heart of ${city}`,
      imageUrl: `https://source.unsplash.com/random/300x200/?${keyword},${city}`,
      url: `https://www.getyourguide.com/${cityFormatted}-l0/s?q=${keyword}`,
      price: '$' + (Math.floor(Math.random() * 50) + 30),
      rating: (Math.random() * 1 + 4).toFixed(1) as unknown as number,
      reviewCount: Math.floor(Math.random() * 200) + 50
    },
    {
      id: '2',
      title: `${city} ${keywords[1] || 'Adventure'} Tour`,
      description: 'Explore the hidden gems of this beautiful city',
      imageUrl: `https://source.unsplash.com/random/300x200/?${keywords[1] || 'adventure'},${cityFormatted}`,
      url: `https://www.getyourguide.com/${cityFormatted}-l0/s?q=${keywords[1] || 'adventure'}`,
      price: '$' + (Math.floor(Math.random() * 40) + 20),
      rating: (Math.random() * 1 + 4).toFixed(1) as unknown as number,
      reviewCount: Math.floor(Math.random() * 150) + 30
    },
    {
      id: '3',
      title: `Best ${keywords[2] || 'Activities'} in ${city}`,
      description: 'A comprehensive selection of the best experiences',
      imageUrl: `https://source.unsplash.com/random/300x200/?${keywords[2] || 'tourism'},${cityFormatted}`,
      url: `https://www.getyourguide.com/${cityFormatted}-l0/s?q=${keywords[2] || 'highlights'}`,
      price: '$' + (Math.floor(Math.random() * 30) + 25),
      rating: (Math.random() * 1 + 4).toFixed(1) as unknown as number,
      reviewCount: Math.floor(Math.random() * 180) + 40
    }
  ];
}
