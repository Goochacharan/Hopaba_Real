
import React from 'react';
import LocationCard from '@/components/LocationCard';
import { Recommendation } from '@/lib/mockData';
import { Loader2 } from 'lucide-react';

interface LocationsListProps {
  recommendations: Recommendation[];
  loading?: boolean;
  error?: string | null;
}

const LocationsList: React.FC<LocationsListProps> = ({ 
  recommendations,
  loading = false,
  error = null
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-medium mb-2">No service providers found</h3>
        <p className="text-muted-foreground">
          There are currently no service providers matching your criteria.
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 gap-6">
      {recommendations.map((recommendation, index) => (
        <div 
          key={recommendation.id} 
          className="animate-fade-in" 
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <LocationCard 
            recommendation={{
              ...recommendation,
              address: recommendation.address || (recommendation.area && recommendation.city ? `${recommendation.area}, ${recommendation.city}` : recommendation.address || '')
            }}
            showDistanceUnderAddress={true}
            className="search-result-card h-full"
            reviewCount={recommendation.review_count || 0} // Pass the actual review count from the database or 0
          />
        </div>
      ))}
    </div>
  );
};

export default LocationsList;
