import fs from 'fs';

const csvPath = 'app/data/date-ideas.csv';

try {
  // Read the CSV file
  let content = fs.readFileSync(csvPath, 'utf8');
  
  console.log('🔧 Fixing specific CSV issues...');
  
  // Fix 1: Remove leading slash from image URLs
  content = content.replace(/,\/https:\/\/ljix/g, ',https://ljix');
  
  // Fix 2: Add missing longDescription and trending columns to rows that were truncated
  const lines = content.split('\n');
  const fixedLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) continue;
    
    // Skip header
    if (i === 0) {
      fixedLines.push(line);
      continue;
    }
    
    // Count actual commas (not in quoted strings)
    let commaCount = 0;
    let inQuotes = false;
    for (let j = 0; j < line.length; j++) {
      if (line[j] === '"') inQuotes = !inQuotes;
      if (line[j] === ',' && !inQuotes) commaCount++;
    }
    
    // Should have 12 commas for 13 fields
    if (commaCount < 12) {
      // Add missing longDescription and trending columns
      if (commaCount === 10) {
        // Missing longDescription and trending
        line += ',Try this activity for a unique and memorable experience together.,';
      } else if (commaCount === 11) {
        // Missing only trending
        line += ',';
      }
    }
    
    fixedLines.push(line);
  }
  
  // Write the fixed CSV back
  fs.writeFileSync(csvPath, fixedLines.join('\n') + '\n');
  
  console.log(`✅ Fixed CSV file with ${fixedLines.length} rows`);
  console.log('🎯 Removed leading slashes from image URLs');
  console.log('📏 Added missing columns where needed');

} catch (error) {
  console.error('❌ Error:', error.message);
}