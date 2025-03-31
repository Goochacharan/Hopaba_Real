
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
  
  // Process recommendations to ensure availability data is properly formatted
  const processedRecommendations = recommendations.map(recommendation => {
    // Ensure availability_days is always an array
    let availabilityDays = recommendation.availability_days || [];
    
    // If it's a string (comma-separated), convert to array
    if (typeof availabilityDays === 'string') {
      availabilityDays = availabilityDays.split(',').map(day => day.trim()).filter(Boolean);
    }
    
    // Make sure it's an array
    if (!Array.isArray(availabilityDays)) {
      availabilityDays = [availabilityDays].filter(Boolean);
    }
    
    return {
      ...recommendation,
      availability_days: availabilityDays,
      // Make sure these properties are defined
      availability_start_time: recommendation.availability_start_time || '',
      availability_end_time: recommendation.availability_end_time || ''
    };
  });
  
  return (
    <div className="grid grid-cols-1 gap-6">
      {processedRecommendations.map((recommendation, index) => {
        // Get user reviews from localStorage
        const { count: userReviewsCount, avgRating: userAvgRating } = getStoredReviews(recommendation.id);
        
        // Calculate the total review count
        const totalReviewCount = userReviewsCount + (recommendation.reviewCount || 0);
        
        // Use user rating if available, otherwise use default rating
        const displayRating = userReviewsCount > 0 ? userAvgRating : recommendation.rating;
        
        return (
          <div 
            key={recommendation.id} 
            className="animate-fade-in" 
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <LocationCard 
              recommendation={{
                ...recommendation,
                rating: displayRating, // Override with user rating if available
                address: recommendation.address || (recommendation.area && recommendation.city ? `${recommendation.area}, ${recommendation.city}` : recommendation.address || '')
              }}
              showDistanceUnderAddress={true}
              className="search-result-card h-full"
              reviewCount={totalReviewCount}
            />
          </div>
        );
      })}
    </div>
  );
};

export default LocationsList;
