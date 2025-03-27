// Scripts to add London date ideas to Sanity
import { createClient } from '@sanity/client';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local file
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// Check if token exists and log first and last characters for debugging
const token = process.env.SANITY_API_TOKEN;
if (!token) {
  console.error('ERROR: SANITY_API_TOKEN is missing in your .env.local file');
  console.error('Make sure to create a token in your Sanity project and add it to your .env.local file:');
  console.error('SANITY_API_TOKEN=skQvCujH3G...');
  process.exit(1);
} else {
  // Log first 4 and last 4 characters of the token for debugging
  const firstChars = token.substring(0, 4);
  const lastChars = token.substring(token.length - 4);
  console.log(`Token found: ${firstChars}...${lastChars} (length: ${token.length})`);
  
  // Check if the token looks like a placeholder
  if (token.startsWith('your-') || token.includes('placeholder')) {
    console.warn('WARNING: Your token appears to be a placeholder value. You need a real Sanity API token.');
  }
}

// Create a Sanity client to use in this script
const client = createClient({
  projectId: 'dyrlcvtu',
  dataset: 'production',
  useCdn: false,
  apiVersion: '2023-05-03',
  token: token
});

console.log('Sanity client created with:');
console.log('- Project ID: dyrlcvtu');
console.log('- Dataset: production');
console.log('- API Version: 2023-05-03');
console.log('- Using token for authentication');

const londonDateIdeas = {
  _type: 'locationDateIdea',
  title: 'Date Ideas Near Me (London)',
  slug: {
    _type: 'slug',
    current: 'london'
  },
  location: 'London',
  locationSlug: {
    _type: 'slug',
    current: 'london'
  },
  publishedAt: new Date().toISOString(),
  excerpt: 'Discover the most romantic and fun date ideas in London, from classic outings to unique experiences that will make your time together unforgettable.',
  mainImage: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
  body: [
    {
      _type: 'block',
      _key: 'intro1',
      style: 'normal',
      children: [
        {
          _type: 'span',
          _key: 'intro1span',
          text: 'London, with its rich history, diverse culture, and endless entertainment options, offers the perfect backdrop for memorable dates. Whether you\'re looking for a romantic evening, an adventurous day out, or a unique experience to share, the city has something for every couple and every budget.'
        }
      ]
    },
    {
      _type: 'block',
      _key: 'intro2',
      style: 'normal',
      children: [
        {
          _type: 'span',
          _key: 'intro2span',
          text: 'In this guide, we\'ve curated the best date ideas across London, from classic spots to hidden gems. You\'ll find options perfect for first dates, special occasions, or just a spontaneous day out with your partner.'
        }
      ]
    }
  ],
  dateIdeas: [
    {
      name: 'Sky Garden',
      description: 'Enjoy panoramic views of London\'s skyline at this free public garden. Book in advance for a sunset visit, then have drinks at the bar for a romantic evening.',
      address: '20 Fenchurch St, London EC3M 8AF',
      price: 'Free entry (booking required), drinks £12-15',
      image: 'https://images.unsplash.com/photo-1543413080-c7166cfa6935?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80'
    },
    {
      name: 'Columbia Road Flower Market',
      description: 'Take a Sunday morning stroll through this vibrant flower market. Buy your date a bouquet and then explore the nearby vintage shops and cafes.',
      address: 'Columbia Rd, London E2 7RG',
      price: 'Free entry, bouquets from £5',
      image: 'https://images.unsplash.com/photo-1596534805030-23a493cf3810?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
    },
    {
      name: 'Canopy Market at King\'s Cross',
      description: 'Visit this weekend market featuring artisan food, drinks, and crafts. Perfect for a casual date, with plenty of options for lunch or snacks.'
    },
    {
      name: 'Little Venice Canal Boat Trip',
      description: 'Take a peaceful boat ride through London\'s picturesque canal system, starting from Little Venice and heading to Camden Lock. Perfect for a relaxing afternoon together.',
      address: 'Starts at Little Venice, London W9',
      price: '£12-15 per person',
      image: 'https://images.unsplash.com/photo-1627556592933-ffe5748777c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
    },
    {
      name: 'Tate Modern',
      description: 'Explore world-class modern art together at this iconic gallery, then take a stroll across the Millennium Bridge for views of St. Paul\'s Cathedral.',
      address: 'Bankside, London SE1 9TG',
      price: 'Free (special exhibitions extra)',
      image: 'https://images.unsplash.com/photo-1581902561040-d5c348388415?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80'
    },
    {
      name: 'Regent\'s Park Open Air Theatre',
      description: 'During summer months, catch an open-air performance in this magical setting. Pack a picnic and arrive early to enjoy the surroundings.',
      address: 'Inner Cir, London NW1 4NU',
      price: 'Tickets from £25',
      image: 'https://images.unsplash.com/photo-1507676385008-e7fb562d11f8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1169&q=80'
    }
    ]
  };

  // First check if the document already exists
  client.fetch('*[_type == "locationDateIdea" && slug.current == "london"][0]')
    .then(existingDoc => {
    if (existingDoc) {
      console.log('Document already exists with ID:', existingDoc._id);
      console.log('Updating existing document...');
      return client.patch(existingDoc._id)
      .set(londonDateIdeas)
      .commit();
    } else {
      console.log('Creating new document for London date ideas...');
      return client.create(londonDateIdeas);
    }
    })
    .then(result => {
    console.log('Successfully published London date ideas!');
    console.log('Document ID:', result._id);
    })
    .catch(error => {
    console.error('Error publishing London date ideas:');
    console.error(error);
    });