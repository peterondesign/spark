
import sys
import time
from seleniumbase import Driver
from fake_useragent import UserAgent
import undetected_chromedriver as uc
from bs4 import BeautifulSoup
from readability import Document
import html2text

def get_page_content(url, output_path):
    try:
        # Setup undetected-chromedriver
        options = uc.ChromeOptions()
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-gpu')
        options.add_argument('--disable-extensions')
        
        # Use fake user agent
        ua = UserAgent()
        user_agent = ua.random
        options.add_argument(f'--user-agent={user_agent}')
        
        # Initialize the driver
        driver = uc.Chrome(options=options)
        
        # Navigate to the URL
        driver.get(url)
        
        # Wait for the page to load completely
        time.sleep(3)
        
        # Get the page source
        html = driver.page_source
        
        # Use readability to extract the main content
        doc = Document(html)
        content = doc.summary()
        
        # Save the HTML to the output file
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(html)
            
        # Close the driver
        driver.quit()
        
        return True, None
    except Exception as e:
        return False, str(e)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python selenium_scraper.py <url> <output_path>")
        sys.exit(1)
        
    url = sys.argv[1]
    output_path = sys.argv[2]
    
    success, error = get_page_content(url, output_path)
    
    if not success:
        print(f"Error: {error}", file=sys.stderr)
        sys.exit(1)
    
    print(f"Successfully saved HTML to {output_path}")
    sys.exit(0)
