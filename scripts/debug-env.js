// Debug script to verify environment variables
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Check if SANITY_API_TOKEN is loaded
console.log('SANITY_API_TOKEN exists:', !!process.env.SANITY_API_TOKEN);
console.log('First few characters of token (if it exists):', 
  process.env.SANITY_API_TOKEN ? 
  `${process.env.SANITY_API_TOKEN.substring(0, 5)}...` : 
  'Not available');