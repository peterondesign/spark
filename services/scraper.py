from bs4 import BeautifulSoup
import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import json
import time
import sys
import argparse
import openai

class EventScraper:
    def __init__(self):
        try:
            chrome_options = Options()
            chrome_options.add_argument('--headless')
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--disable-dev-shm-usage')
            
            # Use webdriver_manager to handle ChromeDriver installation
            service = Service(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
            
        except Exception as e:
            print(json.dumps({
                "error": f"Chrome setup failed: {str(e)}. Please install Chrome browser.",
                "status": "error"
            }))
            sys.exit(1)

    def scrape_getyourguide(self, city, category):
        try:
            search_query = f"{category} {city}"
            url = f"https://www.getyourguide.com/s/?q={search_query}&searchSource=3"
            
            self.driver.get(url)
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "[data-testid='activity-card']"))
            )
            
            # Let the page load completely
            time.sleep(2)
            
            events = []
            cards = self.driver.find_elements(By.CSS_SELECTOR, "[data-testid='activity-card']")[:2]
            
            for card in cards:
                event = {
                    'id': str(hash(time.time())),
                    'title': card.find_element(By.CSS_SELECTOR, 'h3').text,
                    'description': card.find_element(By.CSS_SELECTOR, "[data-testid='activity-card-description']").text,
                    'imageUrl': card.find_element(By.TAG_NAME, 'img').get_attribute('src'),
                    'url': card.find_element(By.TAG_NAME, 'a').get_attribute('href'),
                    'price': card.find_element(By.CSS_SELECTOR, "[data-testid='activity-card-price']").text,
                }
                
                try:
                    rating = card.find_element(By.CSS_SELECTOR, "[data-testid='rating-number']").text
                    event['rating'] = float(rating)
                except:
                    pass
                
                try:
                    reviews = card.find_element(By.CSS_SELECTOR, "[data-testid='number-of-reviews']").text
                    event['reviewCount'] = int(''.join(filter(str.isdigit, reviews)))
                except:
                    pass
                
                events.append(event)
            
            return {'events': events, 'status': 'success'}
            
        except Exception as e:
            return {'error': str(e), 'status': 'error'}
        
        finally:
            self.driver.quit()

    def enhance_description(self, description):
        # Use OpenAI to enhance the description
        try:
            response = openai.Completion.create(
                engine="text-davinci-003",
                prompt=f"Enhance this event description for a date idea: {description}",
                max_tokens=100
            )
            return response.choices[0].text.strip()
        except:
            return description

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument('--city', required=True)
    parser.add_argument('--category', required=True)
    args = parser.parse_args()

    try:
        scraper = EventScraper()
        results = scraper.scrape_getyourguide(args.city, args.category)
        print(json.dumps(results))
    except Exception as e:
        print(json.dumps({
            "error": f"Scraping failed: {str(e)}",
            "status": "error"
        }))
        sys.exit(1)
