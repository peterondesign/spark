import fs from 'fs';
import path from 'path';

/**
 * SUPER SIMPLE CSV UPDATER
 * Maps your actual bucket images to CSV date ideas
 */

// Your actual Supabase bucket URL (update this!)
const SUPABASE_PROJECT_ID = 'ljixbbwscwfdqygjmljq'; // TODO: Update this!
const SUPABASE_BUCKET_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/date-images`;

// Direct mapping based on the bucket files you showed me - EXPANDED VERSION
const imageMapping = {
  // Exact matches
  'acupuncture session': 'acupuncture_session_relaxation_diverse_couple_400x300_17605137834.jpg',
  'amusement park': 'amusement_park_entertainment_diverse_couple_400x300_1760513796.jpg',
  'aquarium date': 'aquarium_date_entertainment_general_interracial_couple_400x300_17.jpg',
  'arcade night': 'arcade_night_entertainment_diverse_couple_400x300_1760513819587.jpg',
  'archery lessons': 'archery_lessons_outdoor_white_couple_400x300_1760513832450.jpg',
  'aromatherapy massage': 'aromatherapy_massage_relaxation_diverse_couple_400x300_176051382.jpg',
  'art class': 'art_class_cultural_mixed_race_couple_400x300_1760513858570.jpg',
  'art exhibition': 'art_exhibition_cultural_interracial_couple_400x300_1760513870274.jpg',
  'art gallery tour': 'art_gallery_tour_entertainment_mixed_race_couple_400x300_176051375.jpg',
  'axe throwing': 'axe_throwing_adventure_asian_couple_400x300_1760513896032.jpg',
  'baking class': 'baking_class_food_&_drink_interracial_couple_400x300_176051391055.jpg',
  'baking together': 'baking_together_food_&_drink_latino_couple_400x300_176051392404.jpg',
  'ballet performance': 'ballet_performance_entertainment_diverse_couple_400x300_17605139.jpg',
  'beach cinema': 'beach_cinema_entertainment_caucasian_couple_400x300_176051590612.jpg',
  
  // Beach-related activities (use beach_cinema image)
  'beach day': 'beach_cinema_entertainment_caucasian_couple_400x300_176051590612.jpg',
  'beach picnic at sunset': 'beach_cinema_entertainment_caucasian_couple_400x300_176051590612.jpg',
  'beach yoga': 'beach_cinema_entertainment_caucasian_couple_400x300_176051590612.jpg',
  'sunset cruise': 'beach_cinema_entertainment_caucasian_couple_400x300_176051590612.jpg',
  'boat ride': 'beach_cinema_entertainment_caucasian_couple_400x300_176051590612.jpg',
  'kayaking': 'beach_cinema_entertainment_caucasian_couple_400x300_176051590612.jpg',
  'sunset kayaking tour': 'beach_cinema_entertainment_caucasian_couple_400x300_176051590612.jpg',
  'stand-up paddleboarding': 'beach_cinema_entertainment_caucasian_couple_400x300_176051590612.jpg',
  'parasailing': 'beach_cinema_entertainment_caucasian_couple_400x300_176051590612.jpg',
  
  // Art-related activities (use art images)
  'painting': 'art_class_cultural_mixed_race_couple_400x300_1760513858570.jpg',
  'sip and paint': 'art_class_cultural_mixed_race_couple_400x300_1760513858570.jpg',
  'home wine and paint night': 'art_class_cultural_mixed_race_couple_400x300_1760513858570.jpg',
  'diy photo shoot': 'art_class_cultural_mixed_race_couple_400x300_1760513858570.jpg',
  'pottery class': 'art_class_cultural_mixed_race_couple_400x300_1760513858570.jpg',
  'calligraphy class': 'art_class_cultural_mixed_race_couple_400x300_1760513858570.jpg',
  'perfume making class': 'art_class_cultural_mixed_race_couple_400x300_1760513858570.jpg',
  'museum': 'art_exhibition_cultural_interracial_couple_400x300_1760513870274.jpg',
  'photo walk': 'art_exhibition_cultural_interracial_couple_400x300_1760513870274.jpg',
  'nature photography': 'art_exhibition_cultural_interracial_couple_400x300_1760513870274.jpg',
  
  // Entertainment/Performance activities (use ballet/arcade images)
  'broadway show': 'ballet_performance_entertainment_diverse_couple_400x300_17605139.jpg',
  'live theater show': 'ballet_performance_entertainment_diverse_couple_400x300_17605139.jpg',
  'theater performance': 'ballet_performance_entertainment_diverse_couple_400x300_17605139.jpg',
  'opera night': 'ballet_performance_entertainment_diverse_couple_400x300_17605139.jpg',
  'opera or orchestral performance': 'ballet_performance_entertainment_diverse_couple_400x300_17605139.jpg',
  'burlesque show': 'ballet_performance_entertainment_diverse_couple_400x300_17605139.jpg',
  'drag show': 'ballet_performance_entertainment_diverse_couple_400x300_17605139.jpg',
  'magic show': 'ballet_performance_entertainment_diverse_couple_400x300_17605139.jpg',
  'improv comedy show': 'ballet_performance_entertainment_diverse_couple_400x300_17605139.jpg',
  'comedy show': 'ballet_performance_entertainment_diverse_couple_400x300_17605139.jpg',
  'concert': 'ballet_performance_entertainment_diverse_couple_400x300_17605139.jpg',
  'jazz night': 'ballet_performance_entertainment_diverse_couple_400x300_17605139.jpg',
  'music festival': 'ballet_performance_entertainment_diverse_couple_400x300_17605139.jpg',
  'open mic': 'ballet_performance_entertainment_diverse_couple_400x300_17605139.jpg',
  'cultural festival': 'ballet_performance_entertainment_diverse_couple_400x300_17605139.jpg',
  'circus show': 'ballet_performance_entertainment_diverse_couple_400x300_17605139.jpg',
  'outdoor festival': 'ballet_performance_entertainment_diverse_couple_400x300_17605139.jpg',
  'local indie gig': 'ballet_performance_entertainment_diverse_couple_400x300_17605139.jpg',
  
  // Gaming/Fun activities (use arcade image)
  'board game night': 'arcade_night_entertainment_diverse_couple_400x300_1760513819587.jpg',
  'video game night': 'arcade_night_entertainment_diverse_couple_400x300_1760513819587.jpg',
  'karaoke night': 'arcade_night_entertainment_diverse_couple_400x300_1760513819587.jpg',
  'bowling': 'arcade_night_entertainment_diverse_couple_400x300_1760513819587.jpg',
  'laser tag': 'arcade_night_entertainment_diverse_couple_400x300_1760513819587.jpg',
  'escape room adventure': 'arcade_night_entertainment_diverse_couple_400x300_1760513819587.jpg',
  'trivia night': 'arcade_night_entertainment_diverse_couple_400x300_1760513819587.jpg',
  'pub quiz': 'arcade_night_entertainment_diverse_couple_400x300_1760513819587.jpg',
  'puzzle night': 'arcade_night_entertainment_diverse_couple_400x300_1760513819587.jpg',
  'jigsaw puzzle': 'arcade_night_entertainment_diverse_couple_400x300_1760513819587.jpg',
  'silent disco': 'arcade_night_entertainment_diverse_couple_400x300_1760513819587.jpg',
  'roller skating': 'arcade_night_entertainment_diverse_couple_400x300_1760513819587.jpg',
  'mario kart/go kart': 'arcade_night_entertainment_diverse_couple_400x300_1760513819587.jpg',
  'murder mystery dinner': 'arcade_night_entertainment_diverse_couple_400x300_1760513819587.jpg',
  'night picnic under the stars': 'arcade_night_entertainment_diverse_couple_400x300_1760513819587.jpg',
  
  // Park/Outdoor activities (use amusement park for outdoor fun)
  'park reading': 'amusement_park_entertainment_diverse_couple_400x300_1760513796.jpg',
  'picnic in the park': 'amusement_park_entertainment_diverse_couple_400x300_1760513796.jpg',
  'kite flying at a park': 'amusement_park_entertainment_diverse_couple_400x300_1760513796.jpg',
  'botanical garden tour': 'amusement_park_entertainment_diverse_couple_400x300_1760513796.jpg',
  'bike ride': 'amusement_park_entertainment_diverse_couple_400x300_1760513796.jpg',
  'hiking': 'amusement_park_entertainment_diverse_couple_400x300_1760513796.jpg',
  'bird watching': 'amusement_park_entertainment_diverse_couple_400x300_1760513796.jpg',
  'nature scavenger hunt': 'amusement_park_entertainment_diverse_couple_400x300_1760513796.jpg',
  'stargazing': 'amusement_park_entertainment_diverse_couple_400x300_1760513796.jpg',
  'farmers market': 'amusement_park_entertainment_diverse_couple_400x300_1760513796.jpg',
  'gardening together': 'amusement_park_entertainment_diverse_couple_400x300_1760513796.jpg',
  'garden party': 'amusement_park_entertainment_diverse_couple_400x300_1760513796.jpg',
  'sit down in a park': 'amusement_park_entertainment_diverse_couple_400x300_1760513796.jpg',
  'lie down in a park with a good book': 'amusement_park_entertainment_diverse_couple_400x300_1760513796.jpg',
  
  // Adventure/Active sports (use archery for active activities)
  'bungee jumping': 'archery_lessons_outdoor_white_couple_400x300_1760513832450.jpg',
  'skydiving': 'archery_lessons_outdoor_white_couple_400x300_1760513832450.jpg',
  'hot air balloon ride': 'archery_lessons_outdoor_white_couple_400x300_1760513832450.jpg',
  'cable cars': 'archery_lessons_outdoor_white_couple_400x300_1760513832450.jpg',
  'zipline adventure': 'archery_lessons_outdoor_white_couple_400x300_1760513832450.jpg',
  'indoor rock climbing': 'archery_lessons_outdoor_white_couple_400x300_1760513832450.jpg',
  'obstacle course race': 'archery_lessons_outdoor_white_couple_400x300_1760513832450.jpg',
  'martial arts': 'archery_lessons_outdoor_white_couple_400x300_1760513832450.jpg',
  'horseback riding': 'archery_lessons_outdoor_white_couple_400x300_1760513832450.jpg',
  'scuba diving lessons': 'archery_lessons_outdoor_white_couple_400x300_1760513832450.jpg',
  'jump yard': 'archery_lessons_outdoor_white_couple_400x300_1760513832450.jpg',
  'e-bike city tour': 'archery_lessons_outdoor_white_couple_400x300_1760513832450.jpg',
  'scooter ride': 'archery_lessons_outdoor_white_couple_400x300_1760513832450.jpg',
  'motorcycle ride': 'archery_lessons_outdoor_white_couple_400x300_1760513832450.jpg',
  'xtreme sports day': 'archery_lessons_outdoor_white_couple_400x300_1760513832450.jpg',
  
  // Relaxation/Wellness activities (use aromatherapy massage)
  'spa day': 'aromatherapy_massage_relaxation_diverse_couple_400x300_176051382.jpg',
  'couples massage': 'aromatherapy_massage_relaxation_diverse_couple_400x300_176051382.jpg',
  'diy spa day': 'aromatherapy_massage_relaxation_diverse_couple_400x300_176051382.jpg',
  'meditation session': 'aromatherapy_massage_relaxation_diverse_couple_400x300_176051382.jpg',
  'yoga class': 'aromatherapy_massage_relaxation_diverse_couple_400x300_176051382.jpg',
  'outdoor yoga': 'aromatherapy_massage_relaxation_diverse_couple_400x300_176051382.jpg',
  'yoga in the park': 'aromatherapy_massage_relaxation_diverse_couple_400x300_176051382.jpg',
  'yoga at home': 'aromatherapy_massage_relaxation_diverse_couple_400x300_176051382.jpg',
  'hot yoga': 'aromatherapy_massage_relaxation_diverse_couple_400x300_176051382.jpg',
  'puppy yoga': 'aromatherapy_massage_relaxation_diverse_couple_400x300_176051382.jpg',
  'pilates': 'aromatherapy_massage_relaxation_diverse_couple_400x300_176051382.jpg',
  'float therapy': 'aromatherapy_massage_relaxation_diverse_couple_400x300_176051382.jpg',
  'sound bath': 'aromatherapy_massage_relaxation_diverse_couple_400x300_176051382.jpg',
  'hot springs': 'aromatherapy_massage_relaxation_diverse_couple_400x300_176051382.jpg',
  
  // Food-related activities (use baking images)
  'cooking class': 'baking_class_food_&_drink_interracial_couple_400x300_176051391055.jpg',
  'cooking class at home': 'baking_together_food_&_drink_latino_couple_400x300_176051392404.jpg',
  'sushi making class': 'baking_class_food_&_drink_interracial_couple_400x300_176051391055.jpg',
  'diy pizza': 'baking_together_food_&_drink_latino_couple_400x300_176051392404.jpg',
  'breakfast in bed': 'baking_together_food_&_drink_latino_couple_400x300_176051392404.jpg',
  'candlelit dinner': 'baking_together_food_&_drink_latino_couple_400x300_176051392404.jpg',
  'hot pot dinner': 'baking_together_food_&_drink_latino_couple_400x300_176051392404.jpg',
  'champagne brunch': 'baking_together_food_&_drink_latino_couple_400x300_176051392404.jpg',
  'sunrise breakfast date': 'baking_together_food_&_drink_latino_couple_400x300_176051392404.jpg',
  'food tour': 'baking_class_food_&_drink_interracial_couple_400x300_176051391055.jpg',
  'food truck festival': 'baking_class_food_&_drink_interracial_couple_400x300_176051391055.jpg',
  'street food tasting tour': 'baking_class_food_&_drink_interracial_couple_400x300_176051391055.jpg',
  'tapas crawl': 'baking_class_food_&_drink_interracial_couple_400x300_176051391055.jpg',
  'wine tasting tour': 'baking_class_food_&_drink_interracial_couple_400x300_176051391055.jpg',
  'vineyard wine tour': 'baking_class_food_&_drink_interracial_couple_400x300_176051391055.jpg',
  'tea tasting': 'baking_class_food_&_drink_interracial_couple_400x300_176051391055.jpg',
  'sake tasting': 'baking_class_food_&_drink_interracial_couple_400x300_176051391055.jpg',
  'home tea tasting': 'baking_together_food_&_drink_latino_couple_400x300_176051392404.jpg',
  'cocktail making class': 'baking_class_food_&_drink_interracial_couple_400x300_176051391055.jpg',
  'cocktail making at home': 'baking_together_food_&_drink_latino_couple_400x300_176051392404.jpg',
  'home cocktail party': 'baking_together_food_&_drink_latino_couple_400x300_176051392404.jpg',
  'whiskey and cigar pairing': 'baking_class_food_&_drink_interracial_couple_400x300_176051391055.jpg',
  'ice cream crawl': 'baking_class_food_&_drink_interracial_couple_400x300_176051391055.jpg',
  'rooftop dinner and drinks': 'baking_together_food_&_drink_latino_couple_400x300_176051392404.jpg',
  'river drinks': 'baking_together_food_&_drink_latino_couple_400x300_176051392404.jpg',
  'lounge drinks': 'baking_together_food_&_drink_latino_couple_400x300_176051392404.jpg',
  
  // Learning/Cultural activities (use art class)
  'language class': 'art_class_cultural_mixed_race_couple_400x300_1760513858570.jpg',
  'language exchange': 'art_class_cultural_mixed_race_couple_400x300_1760513858570.jpg',
  'dance class': 'art_class_cultural_mixed_race_couple_400x300_1760513858570.jpg',
  'ukulele learning session': 'art_class_cultural_mixed_race_couple_400x300_1760513858570.jpg',
  'ice sculpting class': 'art_class_cultural_mixed_race_couple_400x300_1760513858570.jpg',
  
  // Educational/Indoor activities (use aquarium for learning)
  'planetarium': 'aquarium_date_entertainment_general_interracial_couple_400x300_17.jpg',
  'oceanarium': 'aquarium_date_entertainment_general_interracial_couple_400x300_17.jpg',
  'zoo': 'aquarium_date_entertainment_general_interracial_couple_400x300_17.jpg',
  'library date': 'aquarium_date_entertainment_general_interracial_couple_400x300_17.jpg',
  'book club for two': 'aquarium_date_entertainment_general_interracial_couple_400x300_17.jpg',
  'couples book club': 'aquarium_date_entertainment_general_interracial_couple_400x300_17.jpg',
  'historical walking tour': 'aquarium_date_entertainment_general_interracial_couple_400x300_17.jpg',
  'walking tour of hidden city gems': 'aquarium_date_entertainment_general_interracial_couple_400x300_17.jpg',
  'historical reenactment': 'aquarium_date_entertainment_general_interracial_couple_400x300_17.jpg',
  
  // Home activities (use baking together for cozy home activities)
  'diy movie theater': 'baking_together_food_&_drink_latino_couple_400x300_176051392404.jpg',
  'movie marathon': 'baking_together_food_&_drink_latino_couple_400x300_176051392404.jpg',
  'journaling together': 'baking_together_food_&_drink_latino_couple_400x300_176051392404.jpg',
  'love letter exchange': 'baking_together_food_&_drink_latino_couple_400x300_176051392404.jpg',
  'quiet morning reading and coffee': 'baking_together_food_&_drink_latino_couple_400x300_176051392404.jpg',
  'unplugged day': 'baking_together_food_&_drink_latino_couple_400x300_176051392404.jpg',
  
  // Travel/Adventure (use cable cars/adventure theme)
  'road trip': 'archery_lessons_outdoor_white_couple_400x300_1760513832450.jpg',
  'train ride to a nearby town': 'archery_lessons_outdoor_white_couple_400x300_1760513832450.jpg',
  'cruise ship': 'beach_cinema_entertainment_caucasian_couple_400x300_176051590612.jpg',
  'yacht day out': 'beach_cinema_entertainment_caucasian_couple_400x300_176051590612.jpg',
  'amphibious tour': 'beach_cinema_entertainment_caucasian_couple_400x300_176051590612.jpg',
  
  // Creative activities at home (use art class)
  'paint on a viewpoint': 'art_class_cultural_mixed_race_couple_400x300_1760513858570.jpg',
  
  // Miscellaneous activities
  'drive-in movie': 'arcade_night_entertainment_diverse_couple_400x300_1760513819587.jpg',
  'outdoor movie screening': 'arcade_night_entertainment_diverse_couple_400x300_1760513819587.jpg',
  'volunteer together': 'amusement_park_entertainment_diverse_couple_400x300_1760513796.jpg',
  'thrift shopping': 'amusement_park_entertainment_diverse_couple_400x300_1760513796.jpg',
  'vintage shopping date': 'amusement_park_entertainment_diverse_couple_400x300_1760513796.jpg',
  'flea market shopping': 'amusement_park_entertainment_diverse_couple_400x300_1760513796.jpg',
  'fishing trip': 'beach_cinema_entertainment_caucasian_couple_400x300_176051590612.jpg',
  'vr immersive experience': 'arcade_night_entertainment_diverse_couple_400x300_1760513819587.jpg',
  'poetry readings': 'art_exhibition_cultural_interracial_couple_400x300_1760513870274.jpg',
  'evening hike with a view': 'amusement_park_entertainment_diverse_couple_400x300_1760513796.jpg',
  'xylophone concert': 'ballet_performance_entertainment_diverse_couple_400x300_17605139.jpg',
  'snooker': 'arcade_night_entertainment_diverse_couple_400x300_1760513819587.jpg'
};

// Find the best match for a title
function findBestMatch(title) {
  const lowerTitle = title.toLowerCase();
  
  // Direct match
  if (imageMapping[lowerTitle]) {
    return `${SUPABASE_BUCKET_URL}/${imageMapping[lowerTitle]}`;
  }
  
  // Fuzzy match - check for partial matches
  for (const [key, filename] of Object.entries(imageMapping)) {
    if (lowerTitle.includes(key) || key.includes(lowerTitle.split(' ')[0])) {
      return `${SUPABASE_BUCKET_URL}/${filename}`;
    }
  }
  
  return null; // No match found
}

// Read and update CSV with proper CSV parsing
function updateCsv() {
  const csvPath = path.join(process.cwd(), 'app', 'data', 'date-ideas.csv');
  
  if (!fs.existsSync(csvPath)) {
    console.error('CSV file not found at:', csvPath);
    return;
  }
  
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n');
  
  if (lines.length === 0) {
    console.error('CSV file is empty');
    return;
  }
  
  // Process each line with proper CSV parsing
  const updatedLines = lines.map((line, index) => {
    if (index === 0) return line; // Keep header
    if (!line.trim()) return line; // Keep empty lines
    
    // Simple CSV parsing - find the title between the first and second comma
    const firstComma = line.indexOf(',');
    const secondComma = line.indexOf(',', firstComma + 1);
    
    if (firstComma === -1 || secondComma === -1) {
      console.log(`⚠️  Skipping malformed line ${index}: ${line.substring(0, 50)}...`);
      return line;
    }
    
    const title = line.substring(firstComma + 1, secondComma).replace(/"/g, '').trim();
    const bucketImageUrl = findBestMatch(title);
    
    if (bucketImageUrl) {
      // Find the image column (6th column) and replace it
      // The pattern is: id,title,category,location,description,slug,image,...
      const beforeImagePart = line.split(',').slice(0, 6).join(','); // Everything before image
      const afterImagePart = line.split(',').slice(7).join(','); // Everything after image
      
      const newLine = `${beforeImagePart},"${bucketImageUrl}",${afterImagePart}`;
      console.log(`✅ Mapped: "${title}" → bucket image`);
      return newLine;
    } else {
      console.log(`❌ No match for: "${title}"`);
      return line; // Keep original if no match
    }
  });
  
  // Write back to file
  const updatedContent = updatedLines.join('\n');
  fs.writeFileSync(csvPath, updatedContent, 'utf-8');
  
  console.log('\n🎉 CSV updated successfully!');
  console.log(`📊 Total lines processed: ${lines.length - 1}`);
  console.log(`✅ Images mapped: ${updatedLines.filter(line => line.includes(SUPABASE_BUCKET_URL)).length}`);
}

// Run the update
try {
  updateCsv();
} catch (error) {
  console.error('Error updating CSV:', error);
}