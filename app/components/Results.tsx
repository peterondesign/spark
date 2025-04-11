import React from 'react';
import { ScrapedData } from '../types/interfaces';

interface ResultProps {
  data: ScrapedData;
}

const Results: React.FC<ResultProps> = ({ data }) => {
  if (!data) {
    return <div>No results found.</div>;
  }

  return (
    <div className="results-container">
      <h2>Scraping Results</h2>
      
      <div className="result-section">
        <h3>Title</h3>
        <p>{data.title}</p>
      </div>
      
      {data.description && (
        <div className="result-section">
          <h3>Description</h3>
          <p>{data.description}</p>
        </div>
      )}
      
      <div className="result-section">
        <h3>Content Preview</h3>
        <div className="content-preview">
          {data.content.length > 500 
            ? `${data.content.substring(0, 500)}...` 
            : data.content}
        </div>
        <details>
          <summary>Full Content</summary>
          <div className="full-content">
            {data.content.split('\n').map((paragraph: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | Iterable<React.ReactNode> | null | undefined, i: React.Key | null | undefined) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </details>
      </div>
      
      <div className="result-section">
        <h3>Links Found ({data.links.length})</h3>
        <details>
          <summary>Show Links</summary>
          <ul className="links-list">
            {data.links.slice(0, 50).map((link, index) => (
              <li key={index}>
                <a href={link} target="_blank" rel="noopener noreferrer">
                  {link.length > 60 ? `${link.substring(0, 60)}...` : link}
                </a>
              </li>
            ))}
            {data.links.length > 50 && <li>...and {data.links.length - 50} more links</li>}
          </ul>
        </details>
      </div>
      
      {data.metadata.imageUrls && data.metadata.imageUrls.length > 0 && (
        <div className="result-section">
          <h3>Images Found ({data.metadata.imageUrls.length})</h3>
          <div className="images-preview">
            {data.metadata.imageUrls.slice(0, 5).map((imgUrl, index) => (
              <div key={index} className="image-thumbnail">
                <img 
                  src={imgUrl} 
                  alt={`Thumbnail ${index + 1}`} 
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            ))}
            {data.metadata.imageUrls.length > 5 && (
              <p>...and {data.metadata.imageUrls.length - 5} more images</p>
            )}
          </div>
        </div>
      )}
      
      <div className="result-section">
        <h3>Metadata</h3>
        <p><strong>URL:</strong> <a href={data.metadata.url} target="_blank" rel="noopener noreferrer">{data.metadata.url}</a></p>
        <p><strong>Scraped At:</strong> {new Date(data.metadata.scrapedAt).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default Results;