
import React from 'react';
import LocationCard from '@/components/LocationCard';
import { Recommendation } from '@/lib/mockData';

interface LocationsListProps {
  recommendations: Recommendation[];
}

const LocationsList: React.FC<LocationsListProps> = ({ recommendations }) => {
  console.log("LocationsList - Recommendations:", recommendations);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 search-results-grid">
      {recommendations.map((recommendation, index) => {
        // Log each recommendation to debug
        console.log(`Recommendation ${index}:`, {
          id: recommendation.id,
          name: recommendation.name,
          instagram: recommendation.instagram || '',
          availability_days: recommendation.availability_days || [],
          availability_start_time: recommendation.availability_start_time || '',
          availability_end_time: recommendation.availability_end_time || '',
        });
        
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
