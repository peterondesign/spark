import fs from 'fs';
import path from 'path';

// Your actual Supabase bucket URL
const SUPABASE_PROJECT_ID = 'ljixbbwscwfdqygjmljq'; // Updated with actual project ID
const SUPABASE_BUCKET_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/date-images`;

// Direct mapping based on the bucket files
const imageMapping = {
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
  'beach cinema': 'beach_cinema_entertainment_caucasian_couple_400x300_176051590612.jpg'
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

// Parse CSV line properly handling quoted values with commas
function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current); // Add the last field
  return result;
}

// Build CSV line from array
function buildCsvLine(fields) {
  return fields.map(field => {
    // Quote fields that contain commas, quotes, or newlines
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`; // Escape quotes by doubling them
    }
    return field;
  }).join(',');
}

// Read and update CSV with proper CSV parsing
function updateCsvProperly() {
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
  
  let mappedCount = 0;
  
  // Process each line with proper CSV parsing
  const updatedLines = lines.map((line, index) => {
    if (index === 0) return line; // Keep header
    if (!line.trim()) return line; // Keep empty lines
    
    const fields = parseCsvLine(line);
    
    if (fields.length < 7) {
      console.log(`⚠️  Skipping line ${index} - not enough fields (${fields.length})`);
      return line;
    }
    
    const title = fields[1].replace(/"/g, '').trim(); // Title is field 1 (index 1)
    const currentImage = fields[6].replace(/"/g, '').trim(); // Image is field 6 (index 6)
    
    // Skip if already has a bucket URL
    if (currentImage.includes(SUPABASE_BUCKET_URL)) {
      return line;
    }
    
    const bucketImageUrl = findBestMatch(title);
    
    if (bucketImageUrl) {
      fields[6] = bucketImageUrl; // Replace image field
      mappedCount++;
      console.log(`✅ Mapped: "${title}" → bucket image`);
      return buildCsvLine(fields);
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
  console.log(`✅ Images mapped: ${mappedCount}`);
}

// Run the update
try {
  updateCsvProperly();
} catch (error) {
  console.error('Error updating CSV:', error);
}