/**
 * Test script for Stagehand GetYourGuide search
 */
import { searchGetYourGuideWithStagehand } from './services/stagehandService.js';

async function testGetYourGuideSearch() {
  const activity = "Cooking Class";
  const city = "Lisbon";
  
  console.log(`Testing GetYourGuide search for "${activity}" in ${city}`);
  
  try {
    const results = await searchGetYourGuideWithStagehand(activity, city);
    
    console.log(`Found ${results.length} results:`);
    console.log(JSON.stringify(results, null, 2));
    
    return results;
  } catch (error) {
    console.error("Error running test:", error);
    return [];
  }
}

// Run the test
testGetYourGuideSearch().then(() => console.log("Test completed!"));