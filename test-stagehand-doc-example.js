/**
 * Test script following exactly the documentation example
 */
import { Stagehand } from "@browserbasehq/stagehand";

// Minimal inline config based on your example
const StagehandConfig = {
  timeout: 30000,
  headless: false,
  browser: {
    width: 1280,
    height: 800,
  }
};

async function navigateToSite() {
  // Initialize Stagehand with the configuration from stagehand.config.ts
  const stagehand = new Stagehand({
    ...StagehandConfig,
    // We'll use LOCAL environment for this example
    env: "LOCAL",
    // Use the default model or specify one if you prefer
    modelName: "gpt-4o-mini",
  });

  try {
    // Initialize Stagehand - this creates a browser context
    await stagehand.init();
    console.log("Stagehand initialized");

    // Get the page object and navigate to the website
    const page = stagehand.page;
    console.log("Navigating to getyourguide.com...");
    await page.goto("https://getyourguide.com");

    // You can use act() to perform actions on the page based on natural language instructions
    // For example, you could do something like:
    console.log("Clicking on search input...");
    await page.act("click on the search input");
    
    console.log("Typing search query...");
    await page.act("search for cooking class in Lisbon");

    // Wait a bit to see the page
    await new Promise((resolve) => setTimeout(resolve, 5000));

    console.log("Current URL:", await page.url());
  } catch (error) {
    console.error("An error occurred:", error);
  } finally {
    // Always close Stagehand when done to clean up resources
    await stagehand.close();
    console.log("Stagehand closed");
  }
}

// Run the function
(async () => {
  try {
    await navigateToSite();
  } catch (error) {
    console.error("An error occurred:", error);
  }
})();