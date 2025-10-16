/**
 * Simple CSV updater to map Supabase bucket images to date ideas
 * Based on the actual bucket contents shown in the screenshot
 */

import fs from 'fs';
import path from 'path';

// Your Supabase bucket base URL - UPDATE THIS WITH YOUR PROJECT ID
const SUPABASE_BUCKET_URL = 'https://your-project.supabase.co/storage/v1/object/public/date-images';

// Simple mapping based on the actual bucket files
const imageMapping = {
  'Acupuncture Session': 'acupuncture_session_relaxation_diverse_couple_400x300_17605137834.jpg',
  'Amusement Park': 'amusement_park_entertainment_diverse_couple_400x300_1760513796.jpg', 
  'Aquarium Date': 'aquarium_date_entertainment_general_interracial_couple_400x300_17.jpg',
  'Arcade Night': 'arcade_night_entertainment_diverse_couple_400x300_1760513819587.jpg',
  'Archery Lessons': 'archery_lessons_outdoor_white_couple_400x300_1760513832450.jpg',
  'Aromatherapy Massage': 'aromatherapy_massage_relaxation_diverse_couple_400x300_176051382.jpg',
  'Art Class': 'art_class_cultural_mixed_race_couple_400x300_1760513858570.jpg',
  'Art Exhibition': 'art_exhibition_cultural_interracial_couple_400x300_1760513870274.jpg',
  'Art Gallery Tour': 'art_gallery_tour_entertainment_mixed_race_couple_400x300_176051375.jpg',
  'Axe Throwing': 'axe_throwing_adventure_asian_couple_400x300_1760513896032.jpg',
  'Baking Class': 'baking_class_food_&_drink_interracial_couple_400x300_176051391055.jpg',
  'Baking Together': 'baking_together_food_&_drink_latino_couple_400x300_176051392404.jpg',
  'Ballet Performance': 'ballet_performance_entertainment_diverse_couple_400x300_17605139.jpg',
  'Beach Cinema': 'beach_cinema_entertainment_caucasian_couple_400x300_176051590612.jpg'
  // Add more mappings as needed...
};

// Function to create full Supabase URL
function getSupabaseImageUrl(filename) {
  return `${SUPABASE_BUCKET_URL}/${filename}`;
}

// Function to update CSV
function updateCSVImages(csvPath) {
  try {
    // Read the CSV file
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    const lines = csvContent.split('\\n');
    const header = lines[0];
    
    console.log('📝 Updating CSV with Supabase image URLs...\\n');
    
    // Process each data line
    const updatedLines = [header];
    let updateCount = 0;
    
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      const columns = lines[i].split(',');
      const title = columns[1]?.replace(/"/g, ''); // Remove quotes from title
      
      if (title && imageMapping[title]) {
        const imageUrl = getSupabaseImageUrl(imageMapping[title]);
        columns[6] = imageUrl; // Update image column (index 6)
        updateCount++;
        console.log(`✅ Updated "${title}" → ${imageMapping[title]}`);
      } else if (title) {
        console.log(`⚠️  No mapping found for "${title}"`);
      }
      
      updatedLines.push(columns.join(','));
    }
    
    // Write updated CSV
    const outputPath = csvPath.replace('.csv', '_updated.csv');
    fs.writeFileSync(outputPath, updatedLines.join('\\n'));
    
    console.log(`\\n🎉 Success! Updated ${updateCount} images`);
    console.log(`📁 Output saved to: ${outputPath}`);
    
    return outputPath;
    
  } catch (error) {
    console.error('❌ Error updating CSV:', error.message);
    return null;
  }
}

// Run the update
const csvPath = '/Users/peteriyitor/Downloads/date_ideas_rows (3).csv';
updateCSVImages(csvPath);