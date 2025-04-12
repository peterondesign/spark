"use client";

import { useState } from 'react';
import Results from '@/app/components/Results';

export default function ExampleResultsPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/scrape-example', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch results');
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Search Example.com</h1>
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter search query"
            className="border border-gray-300 rounded px-4 py-2 w-full"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Search
          </button>
        </div>
      </form>

      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {results && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((result: any, index: number) => (
            <div key={index} className="border rounded p-4 shadow">
              <h2 className="font-bold text-lg mb-2">{result.title}</h2>
              <p>{result.description}</p>
              <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                Visit
              </a>
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full ml-2">
                Example.com
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}