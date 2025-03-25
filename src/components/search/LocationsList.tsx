
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
            recommendation={{
              ...recommendation,
              // Make sure we have all the data from service_providers
              price_range_min: recommendation.price_range_min,
              price_range_max: recommendation.price_range_max,
              price_unit: recommendation.price_unit,
              availability: recommendation.availability,
              map_link: recommendation.map_link
            }} 
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
