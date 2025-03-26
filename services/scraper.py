#!/usr/bin/env python
"""
Web scraper that supports multiple methods to interact with websites,
including browser-use and Selenium.
"""
import argparse
import json
import os
import asyncio
import traceback
from browser_use import Agent, BrowserConfig
from langchain_openai import ChatOpenAI

# Import Selenium dependencies (only used when method=selenium)
try:
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    from selenium.webdriver.chrome.service import Service
    from selenium.webdriver.common.by import By
    from selenium.webdriver.support.ui import WebDriverWait
    from selenium.webdriver.support import expected_conditions as EC
    from selenium.common.exceptions import TimeoutException
    SELENIUM_AVAILABLE = True
except ImportError:
    SELENIUM_AVAILABLE = False

async def browse_with_browser_use(url: str, task: str = None) -> dict:
    """Use browser-use Agent to ethically interact with the website."""
    try:
        default_task = (
            "Browse the website ethically and collect publicly available information "
            "while fully respecting the site's terms of service and rate limits."
        )
        
        # Enhanced browser configuration to better handle Cloudflare protection
        browser_config = BrowserConfig(
            headless=False,  # Using headed mode helps with Cloudflare detection
            viewport={"width": 1280, "height": 800},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
            extra_headers={"Accept-Language": "en-US,en;q=0.9"},
            timeout=30000,  # 30 seconds
        )
        
        agent = Agent(
            task=task or default_task,
            llm=ChatOpenAI(model="gpt-4"),
            browser_config=browser_config,
            max_steps=10  # Explicitly set max_steps as an integer
        )
        
        result = await agent.run(url)
        return {
            "url": url,
            "content": result,
            "success": True
        }
    except Exception as e:
        return {
            "url": url,
            "error": str(e),
            "error_details": {
                "error_type": type(e).__name__,
                "error_message": str(e),
                "traceback": traceback.format_exc()
            },
            "success": False
        }

def browse_with_selenium(url: str) -> dict:
    """Use Selenium to interact with websites that might have Cloudflare protection."""
    if not SELENIUM_AVAILABLE:
        return {
            "url": url,
            "error": "Selenium is not installed. Run 'pip install selenium webdriver-manager'",
            "success": False
        }
    
    try:
        # Configure Chrome options
        options = Options()
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-blink-features=AutomationControlled")
        options.add_argument("--window-size=1280,800")
        options.add_argument("--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36")
        
        # Create a new Chrome browser instance
        driver = webdriver.Chrome(options=options)
        
        # Navigate to the URL
        driver.get(url)
        
        # Wait for the page to load (adjust timeout as needed)
        WebDriverWait(driver, 20).until(
            lambda d: d.execute_script("return document.readyState") == "complete"
        )
        
        # Check for Cloudflare challenges
        if "cloudflare" in driver.page_source.lower() and "challenge" in driver.page_source.lower():
            print("CAPTCHA DETECTED: Cloudflare challenge detected. Manual interaction may be required.", file=sys.stderr)
            # Wait longer for potential manual solving
            WebDriverWait(driver, 30).until(
                lambda d: "cloudflare" not in d.page_source.lower() or "challenge" not in d.page_source.lower()
            )
        
        # Extract the first four URLs from the page
        urls = []
        try:
            elements = driver.find_elements(By.XPATH, "//a[@href]")
            for element in elements[:4]:  # Limit to first 4 URLs
                href = element.get_attribute("href")
                if href and href.startswith(("http://", "https://")):
                    urls.append({
                        "url": href,
                        "text": element.text.strip() or "[No text]",
                    })
        except Exception as e:
            print(f"Error extracting URLs: {str(e)}", file=sys.stderr)
        
        # Extract content
        page_source = driver.page_source
        page_title = driver.title
        
        # Get all text content
        text_content = driver.execute_script(
            "return document.body.innerText"
        )
        
        driver.quit()
        
        return {
            "url": url,
            "title": page_title,
            "content": text_content,
            "extracted_urls": urls,
            "html": page_source,
            "success": True
        }
    except TimeoutException:
        return {
            "url": url,
            "error": "Timeout waiting for page to load. Cloudflare protection may be active.",
            "success": False
        }
    except Exception as e:
        return {
            "url": url,
            "error": str(e),
            "error_details": {
                "error_type": type(e).__name__,
                "error_message": str(e),
                "traceback": traceback.format_exc()
            },
            "success": False
        }
    finally:
        # Make sure to close the driver
        try:
            if 'driver' in locals() and driver:
                driver.quit()
        except:
            pass

def main():
    """Main function to handle CLI and run the browser agent."""
    parser = argparse.ArgumentParser(description="Web scraping with multiple methods")
    parser.add_argument("--url", required=True, help="URL to browse")
    parser.add_argument("--output", required=True, help="Output JSON file")
    parser.add_argument("--task", help="Custom task description (for browser-use method)")
    parser.add_argument("--method", default="browser-use", choices=["browser-use", "selenium"], 
                       help="Scraping method: browser-use (default) or selenium")
    
    args = parser.parse_args()
    
    # Select the appropriate method
    if args.method == "selenium":
        # This is synchronous
        result = browse_with_selenium(args.url)
    else:
        # This is asynchronous
        result = asyncio.run(browse_with_browser_use(args.url, args.task))
    
    # Make sure the output directory exists
    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    
    # Write the result to the output file
    with open(args.output, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

if __name__ == "__main__":
    import sys
    main()