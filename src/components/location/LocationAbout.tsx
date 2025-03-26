
import React from 'react';

interface LocationAboutProps {
  name: string;
  description: string;
  tags: string[];
}

const LocationAbout = ({ name, description, tags }: LocationAboutProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden mb-6 p-6">
      <h2 className="text-xl font-semibold mb-4">About {name}</h2>
      <p className="text-muted-foreground">{description}</p>
      
      <div className="mt-4">
        {tags.map((tag, i) => (
          <span key={i} className="inline-block bg-secondary text-xs px-2 py-1 rounded-full text-muted-foreground mr-2 mb-2">
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
};

export default LocationAbout;
