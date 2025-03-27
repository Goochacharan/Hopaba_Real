
import React from 'react';
import LocationCard from '@/components/LocationCard';
import { Recommendation } from '@/lib/mockData';

interface LocationsListProps {
  recommendations: Recommendation[];
}

const LocationsList: React.FC<LocationsListProps> = ({ recommendations }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 search-results-grid pb-12">
      {recommendations.map((recommendation, index) => {
        return (
          <div 
            key={recommendation.id} 
            className="animate-fade-in" 
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <LocationCard 
              recommendation={recommendation}
              showDistanceUnderAddress={true}
              className="search-result-card h-full"
            />
          </div>
        );
      })}
    </div>
  );
};

export default LocationsList;
