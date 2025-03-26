#!/usr/bin/env python3
import sys
import time
import json
import argparse
import requests
from bs4 import BeautifulSoup
import html2text

# Try to import selenium, but don't fail if it's not available
try:
    from selenium import webdriver
    from selenium.webdriver.chrome.options import Options
    from fake_useragent import UserAgent
    SELENIUM_AVAILABLE = True
except ImportError:
    print("Warning: Selenium not available, falling back to requests method", file=sys.stderr)
    SELENIUM_AVAILABLE = False

def scrape_with_selenium(url):
    """Scrape a website using Selenium (good for JavaScript-heavy sites)"""
    if not SELENIUM_AVAILABLE:
        print("Selenium is not available, falling back to requests method", file=sys.stderr)
        return scrape_with_requests(url)
    
    try:
        from selenium.webdriver.chrome.options import Options
        from fake_useragent import UserAgent
        
        options = Options()
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
        driver = webdriver.Chrome(options=options)
        
        try:
            # Navigate to the URL
            driver.get(url)
            
            # Wait for the page to load completely
            time.sleep(3)
            
            # Check for CAPTCHA (basic detection)
            page_source = driver.page_source.lower()
            if 'captcha' in page_source or 'robot' in page_source:
                print("CAPTCHA DETECTED", file=sys.stderr)
            
            # Get the page source
            html = driver.page_source
            
            # Parse with BeautifulSoup instead of readability
            soup = BeautifulSoup(html, 'html.parser')
            title = soup.title.string if soup.title else "No title found"
            
            # Extract the main content (simplified version)
            main_content = extract_main_content(soup)
            
            # Convert HTML to plain text
            h = html2text.HTML2Text()
            h.ignore_links = False
            text_content = h.handle(str(main_content))
            
            # Extract metadata
            metadata = {
                'title': title,
                'url': url,
                'content': text_content,
                'html': str(main_content)
            }
            
            return metadata
        except Exception as e:
            raise Exception(f"Selenium scraping error: {str(e)}")
        finally:
            driver.quit()
    except Exception as e:
        print(f"Error using Selenium: {str(e)}", file=sys.stderr)
        return scrape_with_requests(url)

def scrape_with_requests(url):
    """Scrape a website using simple requests (faster but won't render JavaScript)"""
    headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36'}
    
    try:
        # Try to import and use fake_useragent for better user-agent
        try:
            from fake_useragent import UserAgent
            ua = UserAgent()
            headers = {'User-Agent': ua.random}
        except ImportError:
            pass  # Use default headers
        
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        # Check if the response might contain a CAPTCHA
        if 'captcha' in response.text.lower() or 'robot' in response.text.lower():
            print("CAPTCHA DETECTED", file=sys.stderr)
        
        # Parse with BeautifulSoup instead of readability
        soup = BeautifulSoup(response.text, 'html.parser')
        title = soup.title.string if soup.title else "No title found"
        
        # Extract the main content (simplified version)
        main_content = extract_main_content(soup)
        
        # Convert HTML to plain text
        h = html2text.HTML2Text()
        h.ignore_links = False
        text_content = h.handle(str(main_content))
        
        # Extract metadata
        metadata = {
            'title': title,
            'url': url,
            'content': text_content,
            'html': str(main_content)
        }
        
        return metadata
    except Exception as e:
        raise Exception(f"Requests scraping error: {str(e)}")

def extract_main_content(soup):
    """Extract the main content from a BeautifulSoup object"""
    # Try to find common content containers
    main_content = soup.find('main') or soup.find(id='content') or soup.find(id='main') or soup.find(class_='content')
    
    # If we couldn't find main content, use the body
    if not main_content:
        # Try to remove common noise elements
        for element in soup.find_all(['header', 'footer', 'nav', 'aside']):
            element.decompose()
        
        # For GetYourGuide specifically, try to extract product cards
        product_cards = soup.find_all(class_=lambda c: c and ('product' in c.lower() or 'card' in c.lower() or 'item' in c.lower()))
        if product_cards:
            # Create a container for the cards
            container = soup.new_tag('div')
            container.attrs['class'] = 'extracted-products'
            for card in product_cards:
                container.append(card)
            return container
        
        main_content = soup.body
    
    return main_content or soup

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Web scraper script supporting multiple methods')
    parser.add_argument('--url', required=True, help='URL to scrape')
    parser.add_argument('--output', required=True, help='Output file path (JSON)')
    parser.add_argument('--method', default='requests', choices=['selenium', 'requests'], 
                        help='Scraping method to use (selenium or requests)')
    
    args = parser.parse_args()
    
    try:
        if args.method == 'selenium' and SELENIUM_AVAILABLE:
            result = scrape_with_selenium(args.url)
        else:
            result = scrape_with_requests(args.url)
        
        # Save the result to the output file
        with open(args.output, 'w', encoding='utf-8') as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        
        print(f"Successfully scraped content to {args.output}")
        sys.exit(0)
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)