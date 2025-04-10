// Fallback activities when the API fails
interface FallbackActivity {
  title: string;
  duration: string;
  rating: string;
  price: string;
  badges?: string[];
}

const categoryFallbacks: Record<string, FallbackActivity[]> = {
  'Food & Drink': [
    {
      title: 'Food Tour: Local Cuisine Experience',
      duration: '3 hours',
      rating: '4.8/5 (203 reviews)',
      price: 'From $65 per person',
      badges: ['Bestseller']
    },
    {
      title: 'Cooking Class with Market Visit',
      duration: '4 hours',
      rating: '4.9/5 (156 reviews)',
      price: 'From $85 per person',
      badges: ['Small group']
    },
    {
      title: 'Wine Tasting Tour',
      duration: '2.5 hours',
      rating: '4.7/5 (182 reviews)',
      price: 'From $45 per person',
      badges: ['Popular']
    }
  ],
  'Outdoor': [
    {
      title: 'Guided Hiking Tour',
      duration: '5 hours',
      rating: '4.8/5 (124 reviews)',
      price: 'From $55 per person',
      badges: ['Small group']
    },
    {
      title: 'Bike Tour: City Highlights',
      duration: '3 hours',
      rating: '4.7/5 (209 reviews)',
      price: 'From $40 per person',
      badges: ['Popular']
    },
    {
      title: 'Kayaking Adventure',
      duration: '2 hours',
      rating: '4.9/5 (98 reviews)',
      price: 'From $60 per person',
      badges: ['Adventure']
    }
  ],
  'Art': [
    {
      title: 'Guided Museum Tour',
      duration: '2 hours',
      rating: '4.8/5 (176 reviews)',
      price: 'From $35 per person',
      badges: ['Skip-the-line']
    },
    {
      title: 'Street Art Walking Tour',
      duration: '2.5 hours',
      rating: '4.9/5 (143 reviews)',
      price: 'From $30 per person',
      badges: ['Small group']
    },
    {
      title: 'Painting Workshop',
      duration: '3 hours',
      rating: '4.7/5 (87 reviews)',
      price: 'From $50 per person',
      badges: ['Materials included']
    }
  ]
};

// Provide fallback activities based on category or general ones
export function getFallbackActivities(category?: string): FallbackActivity[] {
  if (category && categoryFallbacks[category]) {
    return categoryFallbacks[category];
  }
  
  // General fallbacks
  return [
    {
      title: 'Guided City Tour',
      duration: '2 hours',
      rating: '4.8/5 (245 reviews)',
      price: 'From $30 per person',
      badges: ['Bestseller']
    },
    {
      title: 'Local Experience Tour',
      duration: '3 hours',
      rating: '4.7/5 (198 reviews)',
      price: 'From $45 per person',
      badges: ['Small group']
    },
    {
      title: 'Historical Walking Tour',
      duration: '2.5 hours',
      rating: '4.9/5 (176 reviews)',
      price: 'From $25 per person',
      badges: ['Popular']
    }
  ];
}
