/**
 * Simple test script for Stagehand search on GetYourGuide
 * This version doesn't use TypeScript imports for easier execution
 */

import { Stagehand } from "@browserbasehq/stagehand";

// Define minimal configuration inline
const config = {
  timeout: 30000,
  headless: false, // Set to false to see the browser in action
  browser: {
    width: 1280,
    height: 800,
  },
};

async function searchGetYourGuide(activity = "Couples Cooking Class", city = "Lisbon") {
  // Initialize Stagehand with simple configuration
  const stagehand = new Stagehand({
    ...config,
    modelName: "gpt-4o-mini",
  });

  try {
    // Initialize Stagehand
    await stagehand.init();
    console.log("Stagehand initialized");

    // Get the page object and navigate to the website
    const page = stagehand.page;
    console.log("Navigating to GetYourGuide...");
    await page.goto("https://www.getyourguide.com");

    // Use act() to perform the search
    console.log(`Searching for "${activity}" in ${city}...`);
    await page.act(`search for ${activity} in ${city}`);

    // Wait for search results to load
    await page.waitForTimeout(3000);

    console.log("Current URL:", await page.url());

    // Extract search results
    console.log("Extracting search results...");
    const results = await page.extract({
      instruction: `Extract the first 5 activity results for ${activity} in ${city}`,
      schema: {
        experiences: [
          {
            title: "string",
            description: "string?",
            url: "string?",
            imageUrl: "string?",
            price: "string?",
          }
        ]
      }
    });

    console.log("Search Results:", JSON.stringify(results, null, 2));

    // Wait a bit to see the results
    await page.waitForTimeout(2000);
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    // Always close Stagehand when done
    await stagehand.close();
    console.log("Stagehand closed");
  }
}

// Run the function
(async () => {
  try {
    await searchGetYourGuide();
  } catch (error) {
    console.error("Main error:", error);
  }
})();