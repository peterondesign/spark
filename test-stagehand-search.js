/**
 * Test script for Stagehand search on GetYourGuide
 */

import { Stagehand } from "@browserbasehq/stagehand";
import StagehandConfig from "./stagehand.config.ts";

async function searchGetYourGuide(activity = "Couples Cooking Class", city = "Lisbon") {
  // Initialize Stagehand with the configuration
  const stagehand = new Stagehand({
    ...StagehandConfig,
    // Set to false to see the browser in action
    headless: false,
    // Use a lightweight model for faster responses
    modelName: "gpt-4o-mini",
  });

  try {
    // Initialize Stagehand - this creates a browser context
    await stagehand.init();
    console.log("Stagehand initialized");

    // Get the page object and navigate to GetYourGuide
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
            url: "string",
            imageUrl: "string?",
            price: "string?",
            rating: "number?",
          }
        ]
      }
    });

    console.log("Search Results:", JSON.stringify(results, null, 2));

    // Wait a bit to see the results
    await page.waitForTimeout(5000);
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
  await searchGetYourGuide();
})();