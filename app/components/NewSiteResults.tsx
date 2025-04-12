import React from 'react';

interface NewSiteResult {
  title: string;
  description: string;
  url: string;
}

interface NewSiteResultsProps {
  results: NewSiteResult[];
}

const NewSiteResults: React.FC<NewSiteResultsProps> = ({ results }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {results.map((result, index) => (
        <div key={index} className="border rounded p-4 shadow">
          <h2 className="font-bold text-lg mb-2">{result.title}</h2>
          <p>{result.description}</p>
          <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
            Visit
          </a>
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full ml-2">
            NewSite
          </span>
        </div>
      ))}
    </div>
  );
};

export default NewSiteResults;