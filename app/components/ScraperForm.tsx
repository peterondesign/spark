import React, { useState, useEffect, useRef } from 'react';

interface ScraperFormProps {
  onScrape: (url: string) => Promise<void>;
  dateIdeaTitle?: string;
  userCity?: string;
}

const ScraperForm: React.FC<ScraperFormProps> = ({ onScrape, dateIdeaTitle = '', userCity = '' }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Set initial URL when component mounts or props change
  useEffect(() => {
    const formattedTitle = dateIdeaTitle.replace(/\s+/g, '+');
    const formattedCity = userCity.replace(/\s+/g, '+');
    const searchUrl = `https://getyourguide.com/s/?q=${formattedTitle}%2C+${formattedCity}&searchSource=3`;
    setUrl(searchUrl);
    
    // Automatically trigger scrape after a brief delay
    const timer = setTimeout(() => {
      if (buttonRef.current && searchUrl) {
        buttonRef.current.click();
      }
    }, 1);
    
    return () => clearTimeout(timer);
  }, [dateIdeaTitle, userCity]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onScrape(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="scraper-form">
      <div className="form-group" style={{ display: 'none' }}>
        <label htmlFor="url">Website URL:</label>
        <input
          type="url"
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          className="url-input"
        />
      </div>
      <button 
        ref={buttonRef}
        type="submit" 
        disabled={loading} 
        className="scrape-button"
        style={{ display: loading ? 'block' : 'none' }}
      >
        {loading ? 'Searching' : 'Scrape Website'}
      </button>
      {error && <p className="error-message">{error}</p>}
    </form>
  );
};

export default ScraperForm;