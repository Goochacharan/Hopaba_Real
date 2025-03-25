
import React from 'react';
import LocationCard from '@/components/LocationCard';
import { Recommendation } from '@/lib/mockData';

interface LocationsListProps {
  recommendations: Recommendation[];
}

const LocationsList: React.FC<LocationsListProps> = ({ recommendations }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {recommendations.map((recommendation, index) => (
        <div 
          key={recommendation.id} 
          className="animate-fade-in" 
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <LocationCard 
            recommendation={recommendation}
            ranking={index < 10 ? index + 1 : undefined} 
            reviewCount={recommendation.reviewCount} 
            className="h-full search-result-card" 
            showDistanceUnderAddress={true}
          />
        </div>
      ))}
    </div>
  );
};

export default LocationsList;
