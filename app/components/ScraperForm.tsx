import React, { useState } from 'react';

interface ScraperFormProps {
  onScrape: (url: string) => Promise<void>;
}

const ScraperForm: React.FC<ScraperFormProps> = ({ onScrape }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      <div className="form-group">
        <label htmlFor="url">Website URL:</label>
        <input
          type="url"
          id="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          required
          className="url-input"
        />
      </div>
      <button type="submit" disabled={loading} className="scrape-button">
        {loading ? 'Scraping...' : 'Scrape Website'}
      </button>
      {error && <p className="error-message">{error}</p>}
    </form>
  );
};

export default ScraperForm;