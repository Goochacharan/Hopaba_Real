
import React from 'react';
import LocationCard from '@/components/LocationCard';
import { Recommendation } from '@/lib/mockData';

interface LocationsListProps {
  recommendations: Recommendation[];
}

const LocationsList: React.FC<LocationsListProps> = ({ recommendations }) => {
  console.log("LocationsList - Recommendations:", recommendations);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {recommendations.map((recommendation, index) => {
        // Log each recommendation to debug
        console.log(`Recommendation ${index}:`, {
          id: recommendation.id,
          name: recommendation.name,
          instagram: recommendation.instagram || '',
          availability_days: recommendation.availability_days || [],
        });
        
        return (
          <div 
            key={recommendation.id} 
            className="animate-fade-in" 
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <LocationCard 
              recommendation={{
                ...recommendation,
                // Ensure the hours or availability is correctly passed
                hours: recommendation.hours || recommendation.availability,
                // Pass availability days and times if they exist
                availability_days: recommendation.availability_days || [],
                availability_start_time: recommendation.availability_start_time || '',
                availability_end_time: recommendation.availability_end_time || '',
                // Ensure instagram link is passed
                instagram: recommendation.instagram || ''
              }}
              ranking={index < 10 ? index + 1 : undefined} 
              reviewCount={recommendation.reviewCount} 
              className="h-full search-result-card" 
              showDistanceUnderAddress={true}
            />
          </div>
        );
      })}
    </div>
  );
};

export default LocationsList;
