import { Experience } from './multi_scraper';

// Categories of date activities to generate mock data for
type DateCategory = 'romantic' | 'outdoor' | 'food' | 'adventure' | 'cultural' | 'nightlife';

// Collection of pre-defined experiences per source and category
const mockDatasets: Record<string, Record<DateCategory, Partial<Experience>[]>> = {
  'viator': {
    romantic: [
      { 
        title: 'Sunset Cruise with 3-Course Dinner',
        description: 'Enjoy a romantic sunset cruise with a 3-course dinner and live music.',
        price: 'From $89',
        rating: 4.8,
        reviewCount: 256
      },
      {
        title: 'Private Wine Tasting Tour',
        description: 'Taste premium wines with a private expert guide through scenic vineyards.',
        price: 'From $120',
        rating: 4.9,
        reviewCount: 189
      },
      {
        title: 'Hot Air Balloon Sunrise Experience',
        description: 'Float above the landscape as the sun rises with champagne breakfast.',
        price: 'From $275',
        rating: 4.7,
        reviewCount: 145
      }
    ],
    outdoor: [
      {
        title: 'Guided Nature Hike and Waterfall Discovery',
        description: 'Explore scenic trails and hidden waterfalls with an expert naturalist.',
        price: 'From $49',
        rating: 4.6,
        reviewCount: 212
      },
      {
        title: 'Kayaking Adventure Through Sea Caves',
        description: 'Paddle through remarkable sea caves and spot marine wildlife.',
        price: 'From $65',
        rating: 4.7,
        reviewCount: 178
      }
    ],
    food: [
      {
        title: 'Gourmet Food Walking Tour',
        description: 'Taste your way through the city with stops at award-winning restaurants.',
        price: 'From $78',
        rating: 4.9,
        reviewCount: 362
      },
      {
        title: 'Cooking Class with Market Visit',
        description: 'Shop for fresh ingredients at the local market then cook an authentic meal.',
        price: 'From $95',
        rating: 4.8,
        reviewCount: 124
      }
    ],
    adventure: [
      {
        title: 'Zipline Canopy Tour',
        description: 'Soar between platforms high above the forest floor on multiple ziplines.',
        price: 'From $89',
        rating: 4.7,
        reviewCount: 235
      },
      {
        title: 'White Water Rafting Adventure',
        description: 'Navigate thrilling rapids with expert guides on this adrenaline-pumping experience.',
        price: 'From $105',
        rating: 4.8,
        reviewCount: 183
      }
    ],
    cultural: [
      {
        title: 'Private Museum Tour with Art Historian',
        description: 'Discover hidden gems and famous masterpieces with your personal art expert.',
        price: 'From $65',
        rating: 4.9,
        reviewCount: 87
      },
      {
        title: 'Historical Walking Tour',
        description: 'Step back in time as you explore significant historical sites and hear fascinating stories.',
        price: 'From $32',
        rating: 4.7,
        reviewCount: 214
      }
    ],
    nightlife: [
      {
        title: 'Cocktail Making Class & Bar Hopping',
        description: 'Learn to craft signature cocktails then visit the city\'s best bars with a local guide.',
        price: 'From $75',
        rating: 4.8,
        reviewCount: 132
      },
      {
        title: 'Jazz Club Evening with Dinner',
        description: 'Enjoy soulful jazz performances while dining on a gourmet meal.',
        price: 'From $110',
        rating: 4.6,
        reviewCount: 95
      }
    ]
  },
  'airbnbexperiences': {
    romantic: [
      {
        title: 'Couples Pottery Workshop',
        description: 'Create matching ceramic pieces with your partner in this hands-on workshop.',
        price: '$85 per person',
        rating: 4.97,
        reviewCount: 64
      },
      {
        title: 'Rooftop Stargazing & Wine Tasting',
        description: 'Identify constellations with an astronomer while enjoying premium wines.',
        price: '$75 per person',
        rating: 4.92,
        reviewCount: 38
      }
    ],
    outdoor: [
      {
        title: 'Secret Waterfall Hike with Local',
        description: 'Discover hidden waterfalls and swimming holes only locals know about.',
        price: '$45 per person',
        rating: 4.98,
        reviewCount: 127
      },
      {
        title: 'Sunset Paddleboard Adventure',
        description: 'Paddle across calm waters as the sun sets with an experienced guide.',
        price: '$55 per person',
        rating: 4.95,
        reviewCount: 86
      }
    ],
    food: [
      {
        title: 'Secret Family Recipe Cooking Class',
        description: 'Learn generations-old recipes in a cozy home kitchen with a local chef.',
        price: '$69 per person',
        rating: 4.99,
        reviewCount: 215
      },
      {
        title: 'Underground Speakeasy Cocktail Tour',
        description: 'Visit hidden bars and learn about prohibition-era cocktails with tastings.',
        price: '$65 per person',
        rating: 4.91,
        reviewCount: 103
      }
    ],
    adventure: [
      {
        title: 'Urban Rock Climbing Experience',
        description: 'Scale outdoor rock faces with a professional climber in the heart of the city.',
        price: '$79 per person',
        rating: 4.94,
        reviewCount: 57
      },
      {
        title: 'Forest Canopy Zipline & Rappel',
        description: 'Zipline between trees and rappel down from platforms with stunning views.',
        price: '$95 per person',
        rating: 4.97,
        reviewCount: 124
      }
    ],
    cultural: [
      {
        title: 'Local Art Studio Tour & Workshop',
        description: 'Visit artist studios and create your own artwork with guidance from professionals.',
        price: '$58 per person',
        rating: 4.98,
        reviewCount: 73
      },
      {
        title: 'Hidden Neighborhood Food & History Walk',
        description: 'Explore off-the-beaten-path neighborhoods while sampling local delicacies.',
        price: '$49 per person',
        rating: 4.96,
        reviewCount: 187
      }
    ],
    nightlife: [
      {
        title: 'Underground Jazz & Craft Cocktails',
        description: 'Visit local jazz venues with a musician who knows all the best spots.',
        price: '$70 per person',
        rating: 4.95,
        reviewCount: 64
      },
      {
        title: 'Sunset Rooftop Bar Hopping',
        description: 'Experience the best rooftop bars with stunning views and signature cocktails.',
        price: '$85 per person',
        rating: 4.93,
        reviewCount: 119
      }
    ]
  },
  'eventbrite': {
    romantic: [
      {
        title: 'Couples Painting Night',
        description: 'Sep 15, 7:00 PM - Create matching paintings with your partner while enjoying wine.',
        price: 'From $40',
      },
      {
        title: 'Starlight Cinema: Classic Romance Films',
        description: 'Sep 22, 8:30 PM - Outdoor screening of classic romance movies under the stars.',
        price: 'From $15',
      }
    ],
    outdoor: [
      {
        title: 'Sunrise Yoga in the Park',
        description: 'Every Saturday, 6:30 AM - Start your day with energizing yoga in a beautiful setting.',
        price: 'From $10',
      },
      {
        title: 'Weekend Farmers Market & Craft Fair',
        description: 'Sundays, 9:00 AM - Shop for fresh produce and artisanal crafts with live music.',
        price: 'Free',
      }
    ],
    food: [
      {
        title: 'International Street Food Festival',
        description: 'Sep 16-17 - Sample dishes from around the world with cooking demonstrations.',
        price: 'From $25',
      },
      {
        title: 'Wine & Chocolate Pairing Workshop',
        description: 'Sep 29, 7:00 PM - Learn the art of pairing fine chocolates with complementary wines.',
        price: 'From $65',
      }
    ],
    adventure: [
      {
        title: 'Urban Scavenger Hunt Challenge',
        description: 'Sep 23, 11:00 AM - Solve clues and complete challenges across the city with your team.',
        price: 'From $30',
      },
      {
        title: 'Nighttime Kayaking with LED Lights',
        description: 'Sep 15, 8:00 PM - Paddle through waterways with illuminated kayaks for a unique perspective.',
        price: 'From $45',
      }
    ],
    cultural: [
      {
        title: 'Interactive Theater Experience',
        description: 'Multiple dates - Become part of the story in this immersive theatrical production.',
        price: 'From $35',
      },
      {
        title: 'World Music Concert Series',
        description: 'Every Friday - Experience diverse musical traditions from around the globe.',
        price: 'From $20',
      }
    ],
    nightlife: [
      {
        title: 'Rooftop Silent Disco Night',
        description: 'Sep 30, 9:00 PM - Dance to your choice of music channels with wireless headphones.',
        price: 'From $25',
      },
      {
        title: 'Craft Beer Tasting Festival',
        description: 'Sep 22, 6:00 PM - Sample dozens of craft beers from local and regional breweries.',
        price: 'From $45',
      }
    ]
  },
  'googlemaps': {
    romantic: [
      {
        title: 'The Rooftop Restaurant & Lounge',
        description: 'Upscale dining with panoramic city views and intimate atmosphere.',
        rating: 4.6,
        reviewCount: 842
      },
      {
        title: 'Lakeside Botanical Gardens',
        description: 'Scenic gardens with walking paths, fountains, and seasonal flower displays.',
        rating: 4.8,
        reviewCount: 1245
      }
    ],
    outdoor: [
      {
        title: 'Riverfront Park & Trail',
        description: 'Scenic walking and biking paths along the river with picnic areas and wildlife viewing.',
        rating: 4.7,
        reviewCount: 2103
      },
      {
        title: 'Summit Hiking Trails',
        description: 'Network of trails with varying difficulty and spectacular views from the summit.',
        rating: 4.9,
        reviewCount: 753
      }
    ],
    food: [
      {
        title: 'Downtown Food Hall',
        description: 'Collection of local food vendors offering diverse cuisines in one location.',
        rating: 4.5,
        reviewCount: 1876
      },
      {
        title: 'Farm-to-Table Bistro',
        description: 'Seasonal menu using ingredients sourced from local farms and producers.',
        rating: 4.7,
        reviewCount: 642
      }
    ],
    adventure: [
      {
        title: 'Adventure Outfitters & Tours',
        description: 'Guided adventure tours including rock climbing, rafting, and mountain biking.',
        rating: 4.8,
        reviewCount: 427
      },
      {
        title: 'Zip Line & Aerial Adventure Park',
        description: 'Multiple zip lines and obstacle courses among the treetops for all skill levels.',
        rating: 4.7,
        reviewCount: 892
      }
    ],
    cultural: [
      {
        title: 'Contemporary Art Museum',
        description: 'Rotating exhibitions of modern and contemporary art with interactive installations.',
        rating: 4.6,
        reviewCount: 1208
      },
      {
        title: 'Historic Downtown Theatre',
        description: 'Beautifully restored venue hosting plays, concerts, and film screenings.',
        rating: 4.8,
        reviewCount: 694
      }
    ],
    nightlife: [
      {
        title: 'Craft Cocktail Speakeasy',
        description: 'Hidden bar with expertly crafted cocktails and vintage atmosphere.',
        rating: 4.7,
        reviewCount: 528
      },
      {
        title: 'Live Music Venue & Bar',
        description: 'Popular spot for local and touring bands with full bar and dance floor.',
        rating: 4.5,
        reviewCount: 973
      }
    ]
  },
  'timeout': {
    romantic: [
      {
        title: 'Candlelit Classical Concert',
        description: 'Experience classical masterpieces by candlelight in a historic venue.',
      },
      {
        title: 'Gourmet Picnic in the Park',
        description: 'Curated picnic experience with gourmet food, wine, and stunning views.',
      }
    ],
    outdoor: [
      {
        title: 'Secret Garden Walking Tour',
        description: 'Discover hidden gardens and green spaces tucked away in the urban landscape.',
      },
      {
        title: 'Sunset Beach Yoga Gathering',
        description: 'Weekly yoga sessions on the beach as the sun sets over the horizon.',
      }
    ],
    food: [
      {
        title: 'Chef\'s Table Experience',
        description: 'Intimate dining experience with a front-row seat to the kitchen action.',
      },
      {
        title: 'Artisanal Chocolate Making Workshop',
        description: 'Learn to make gourmet truffles and bars with premium ingredients.',
      }
    ],
    adventure: [
      {
        title: 'Urban Exploration Photography Tour',
        description: 'Photograph hidden urban locations with guidance from a professional photographer.',
      },
      {
        title: 'Moonlight Kayak Adventure',
        description: 'Paddle under the stars with guides who reveal the history and ecology of the waterway.',
      }
    ],
    cultural: [
      {
        title: 'Immersive Art Installation',
        description: 'Walk-through art experience with interactive light, sound, and visual elements.',
      },
      {
        title: 'International Film Festival Screenings',
        description: 'Curated selection of independent and international films with director Q&As.',
      }
    ],
    nightlife: [
      {
        title: 'Underground Jazz Club',
        description: 'Intimate venue featuring top jazz musicians and classic cocktails.',
      },
      {
        title: 'Rooftop Cinema & Cocktail Bar',
        description: 'Watch cult classics and new releases under the stars with craft cocktails.',
      }
    ]
  },
  'meetup': {
    romantic: [
      {
        title: 'Singles Mixer: Wine & Art Night',
        description: 'Sep 18, 7:00 PM - Meet new people while creating art and enjoying fine wines.',
        price: 'Free',
      },
      {
        title: 'Couples Cooking Class Meetup',
        description: 'Sep 25, 6:30 PM - Learn to cook a gourmet meal together with other couples.',
        price: '$5',
      }
    ],
    outdoor: [
      {
        title: 'Weekend Hiking Group',
        description: 'Every Saturday, 9:00 AM - Join fellow outdoor enthusiasts for trails of all levels.',
        price: 'Free',
      },
      {
        title: 'Photography Walk: Urban Nature',
        description: 'Sep 24, 10:00 AM - Capture the intersection of nature and city with fellow photographers.',
        price: 'Free',
      }
    ],
    food: [
      {
        title: 'New Restaurants Exploration Group',
        description: 'Monthly meetups to try the newest restaurants in town as a group.',
        price: 'Free',
      },
      {
        title: 'Vegan Potluck in the Park',
        description: 'Sep 17, 12:00 PM - Share plant-based dishes and recipes with like-minded people.',
        price: 'Free',
      }
    ],
    adventure: [
      {
        title: 'Rock Climbing for Beginners',
        description: 'Sep 23, 2:00 PM - Learn the basics of rock climbing with experienced climbers.',
        price: '$10',
      },
      {
        title: 'Monthly Bicycle Adventure Ride',
        description: 'First Sunday - Group bicycle ride exploring different parts of the city and surroundings.',
        price: 'Free',
      }
    ],
    cultural: [
      {
        title: 'Book Club: Contemporary Fiction',
        description: 'Monthly discussions of new and notable fiction in a casual setting.',
        price: 'Free',
      },
      {
        title: 'Language Exchange Gathering',
        description: 'Weekly meetings to practice various languages through conversation.',
        price: 'Free',
      }
    ],
    nightlife: [
      {
        title: 'Board Game Night at Local Brewery',
        description: 'Every Thursday, 7:00 PM - Play various board games while enjoying craft beer.',
        price: 'Free',
      },
      {
        title: 'Social Dancing: Salsa & Bachata',
        description: 'Weekly dance socials with brief lessons for beginners before open dancing.',
        price: '$5',
      }
    ]
  },
  'luma': {
    romantic: [
      {
        title: 'Couples Astrology Night',
        description: 'Sep 21, 8:00 PM - Explore relationship compatibility through the stars.',
        price: '$15',
      },
      {
        title: 'Chocolate & Wine Pairing Workshop',
        description: 'Sep 28, 7:30 PM - Discover perfect pairings with a chocolate sommelier.',
        price: '$45',
      }
    ],
    outdoor: [
      {
        title: 'Sunset Beach Meditation Circle',
        description: 'Every Sunday, 6:30 PM - Group meditation as the sun sets over the water.',
        price: '$5',
      },
      {
        title: 'Urban Gardening Workshop',
        description: 'Sep 26, 11:00 AM - Learn how to grow plants in small urban spaces.',
        price: '$10',
      }
    ],
    food: [
      {
        title: 'Sourdough Bread Making Class',
        description: 'Sep 24, 1:00 PM - Learn the art of making perfect sourdough bread at home.',
        price: '$40',
      },
      {
        title: 'Farm-to-Table Community Dinner',
        description: 'Sep 30, 6:00 PM - Shared meal made with ingredients from local farms.',
        price: '$35',
      }
    ],
    adventure: [
      {
        title: 'Full Moon Night Hike',
        description: 'Oct 1, 8:00 PM - Guided night hike under the full moon with stargazing.',
        price: '$20',
      },
      {
        title: 'Urban Foraging Experience',
        description: 'Sep 25, 10:00 AM - Learn to identify edible plants growing throughout the city.',
        price: '$25',
      }
    ],
    cultural: [
      {
        title: 'Poetry Slam & Open Mic',
        description: 'Sep 29, 7:00 PM - Share your poetry or listen to local poets perform.',
        price: '$8',
      },
      {
        title: 'Traditional Craft Workshop Series',
        description: 'Weekly classes focusing on different traditional crafts and techniques.',
        price: '$30',
      }
    ],
    nightlife: [
      {
        title: 'Vinyl Listening Party',
        description: 'Sep 27, 8:00 PM - Bring your favorite records to share with other music lovers.',
        price: '$12',
      },
      {
        title: 'Mixology Master Class',
        description: 'Sep 22, 7:00 PM - Learn to craft signature cocktails with a professional bartender.',
        price: '$50',
      }
    ]
  }
};

// Map general categories to our defined categories
const categoryMap: Record<string, DateCategory> = {
  'romantic': 'romantic',
  'romantic activities': 'romantic',
  'couples': 'romantic',
  'couples experiences': 'romantic',
  'date night': 'romantic',
  'date ideas': 'romantic',
  
  'outdoor': 'outdoor',
  'outdoor activities': 'outdoor',
  'outdoor adventures': 'outdoor',
  'hiking': 'outdoor',
  'nature': 'outdoor',
  
  'food': 'food',
  'food tours': 'food',
  'dining': 'food',
  'cooking': 'food',
  'culinary': 'food',
  'restaurants': 'food',
  
  'adventure': 'adventure',
  'adventure activities': 'adventure',
  'fun': 'adventure',
  'fun activities': 'adventure',
  'fun date ideas': 'adventure',
  'unique experiences': 'adventure',
  
  'cultural': 'cultural',
  'cultural experiences': 'cultural',
  'art': 'cultural',
  'museum': 'cultural',
  'theater': 'cultural',
  'culture': 'cultural',
  
  'nightlife': 'nightlife',
  'bars': 'nightlife',
  'night': 'nightlife',
  'evening': 'nightlife',
  'clubs': 'nightlife',
  'music': 'nightlife'
};

/**
 * Generate mock experiences for a particular source and category
 */
export function getMockExperiences(
  source: string, 
  city: string, 
  category: string = 'activities',
  count: number = 5
): Experience[] {
  // Map the requested category to our internal categories
  let matchedCategory: DateCategory = 'romantic'; // default
  
  const normalizedCategory = category.toLowerCase();
  for (const [key, value] of Object.entries(categoryMap)) {
    if (normalizedCategory.includes(key)) {
      matchedCategory = value;
      break;
    }
  }
  
  // Get the matched dataset or fall back to romantic
  const sourceData = mockDatasets[source] || mockDatasets['viator'];
  const categoryData = sourceData[matchedCategory] || sourceData['romantic'];
  
  // Generate the requested number of experiences
  return categoryData.slice(0, count).map((mockData, index) => {
    // Generate a city-specific image URL
    const cityForImage = city.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const imageNumber = (index % 5) + 1; // 1-5 images
    const imageUrl = `/mock-images/${source}/${matchedCategory}${imageNumber}.jpg`;
    
    // Add city and source to the mock URL
    const sourceUrl = getSourceUrl(source, city, category);
    
    // Create the final experience object
    return {
      id: `${source}-mock-${index}-${Date.now()}`,
      title: mockData.title || `${matchedCategory} Experience in ${city}`,
      description: mockData.description || `A great ${category} activity in ${city}`,
      imageUrl: mockData.imageUrl || imageUrl || '/placeholder.jpg',
      url: mockData.url || sourceUrl,
      price: mockData.price || 'Check website',
      rating: mockData.rating,
      reviewCount: mockData.reviewCount,
      source: getSourceDisplayName(source)
    };
  });
}

/**
 * Get a properly formatted source URL for the mock data
 */
function getSourceUrl(source: string, city: string, category: string): string {
  const encodedCity = encodeURIComponent(city);
  const encodedCategory = encodeURIComponent(category);
  
  switch (source) {
    case 'viator':
      return `https://www.viator.com/search/${encodedCity}?q=${encodedCategory}`;
    case 'airbnbexperiences':
      return `https://www.airbnb.com/s/${encodedCity}/experiences?query=${encodedCategory}`;
    case 'eventbrite':
      return `https://www.eventbrite.com/d/${encodedCity}--events/?q=${encodedCategory}`;
    case 'googlemaps':
      return `https://www.google.com/maps/search/${encodedCategory}+${encodedCity}`;
    case 'timeout':
      return `https://www.timeout.com/${city.toLowerCase().replace(/\s+/g, '-')}/search?q=${encodedCategory}`;
    case 'meetup':
      return `https://www.meetup.com/find/?keywords=${encodedCategory}&location=${encodedCity}`;
    case 'luma':
      return `https://lu.ma/search?q=${encodedCategory}+${encodedCity}`;
    default:
      return `https://www.google.com/search?q=${encodedCategory}+in+${encodedCity}`;
  }
}

/**
 * Get a properly formatted display name for the source
 */
function getSourceDisplayName(source: string): string {
  switch (source) {
    case 'getyourguide':
      return 'GetYourGuide';
    case 'viator':
      return 'Viator';
    case 'airbnbexperiences':
      return 'Airbnb Experiences';
    case 'eventbrite':
      return 'Eventbrite';
    case 'googlemaps':
      return 'Google Maps';
    case 'timeout':
      return 'Time Out';
    case 'meetup':
      return 'Meetup';
    case 'luma':
      return 'Luma';
    default:
      return source.charAt(0).toUpperCase() + source.slice(1);
  }
}