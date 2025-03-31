
import React from 'react';
import LocationCard from '@/components/LocationCard';
import { Recommendation } from '@/lib/mockData';
import { Loader2 } from 'lucide-react';

// Helper function to get stored reviews count and calculate average rating
const getStoredReviews = (locationId: string) => {
  try {
    const storedReviews = localStorage.getItem(`reviews_${locationId}`);
    const reviews = storedReviews ? JSON.parse(storedReviews) : [];
    const count = reviews.length;
    let avgRating = 0;
    
    if (count > 0) {
      const sum = reviews.reduce((total: number, review: any) => total + review.rating, 0);
      avgRating = sum / count;
    }
    
    return { count, avgRating };
  } catch (error) {
    console.error('Error getting stored reviews:', error);
    return { count: 0, avgRating: 0 };
  }
};

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
  
  // Prepare recommendations with proper type handling for availability_days
  const preparedRecommendations = recommendations.map(recommendation => {
    // Handle possible conversions needed for availability_days
    let availabilityDays = recommendation.availability_days;
    if (typeof availabilityDays === 'string' && availabilityDays) {
      try {
        // Try to parse it if it might be a JSON string
        if (availabilityDays.startsWith('[') && availabilityDays.endsWith(']')) {
          availabilityDays = JSON.parse(availabilityDays);
        }
      } catch (e) {
        console.error('Error parsing availability_days:', e);
      }
    }

    // Get user reviews from localStorage
    const { count: userReviewsCount, avgRating: userAvgRating } = getStoredReviews(recommendation.id);
    
    // Calculate the total review count
    const totalReviewCount = userReviewsCount + (recommendation.reviewCount || 0);
    
    // Use user rating if available, otherwise use default rating
    const displayRating = userReviewsCount > 0 ? userAvgRating : recommendation.rating;
    
    return {
      ...recommendation,
      rating: displayRating, // Override with user rating if available
      address: recommendation.address || (recommendation.area && recommendation.city ? `${recommendation.area}, ${recommendation.city}` : recommendation.address || ''),
      availability_days: availabilityDays
    };
  });
  
  return (
    <div className="grid grid-cols-1 gap-6">
      {preparedRecommendations.map((recommendation, index) => (
        <div 
          key={recommendation.id} 
          className="animate-fade-in" 
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <LocationCard 
            recommendation={recommendation}
            showDistanceUnderAddress={true}
            className="search-result-card h-full"
            reviewCount={recommendation.reviewCount || 0}
          />
        </div>
      ))}
    </div>
  );
};

export default LocationsList;
