
import React, { useEffect, useState } from 'react';
import LocationCard from '@/components/LocationCard';
import { Recommendation } from '@/lib/mockData';
import { Loader2, Tag } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { matchSearchTermsWithTags, improveSearchByTags } from '@/utils/searchUtils';

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
  searchQuery?: string; // Added searchQuery prop
}

const LocationsList: React.FC<LocationsListProps> = ({ 
  recommendations,
  loading = false,
  error = null,
  searchQuery = '' // Added default value
}) => {
  const [matchedTags, setMatchedTags] = useState<string[]>([]);

  // Find tag matches whenever searchQuery or recommendations change
  useEffect(() => {
    if (searchQuery && recommendations.length > 0) {
      const { tagMatches } = improveSearchByTags(recommendations, searchQuery);
      setMatchedTags(tagMatches);
    } else {
      setMatchedTags([]);
    }
  }, [searchQuery, recommendations]);

  // Check if a location has tags that match the search query
  const hasMatchingTags = (recommendation: Recommendation): boolean => {
    return matchSearchTermsWithTags(searchQuery, recommendation.tags);
  };

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
  
  console.log("LocationsList - Rendering recommendations:", recommendations);
  
  return (
    <div className="space-y-6">
      {matchedTags.length > 0 && (
        <Alert variant="default" className="bg-blue-50 border-blue-200 mb-4">
          <Tag className="h-4 w-4 text-blue-600 mr-2" />
          <AlertDescription className="text-blue-800">
            Found matches for tags: {' '}
            {matchedTags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="mr-1 mb-1 bg-blue-100">
                {tag}
              </Badge>
            ))}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 gap-6">
        {recommendations.map((recommendation, index) => {
          console.log(`LocationsList - Processing recommendation ${index}:`, recommendation.id);
          console.log(`Availability days:`, recommendation.availability_days);
          console.log(`Hours:`, recommendation.hours);
          console.log(`Start time:`, recommendation.availability_start_time);
          console.log(`End time:`, recommendation.availability_end_time);
          
          // Safely ensure availability_days is an array
          const availabilityDays = Array.isArray(recommendation.availability_days)
            ? recommendation.availability_days
            : (recommendation.availability_days ? [recommendation.availability_days] : []);
            
          const availabilityDaysString = availabilityDays.map(day => String(day));
          
          // Get user reviews from localStorage
          const { count: userReviewsCount, avgRating: userAvgRating } = getStoredReviews(recommendation.id);
          
          // Calculate the total review count
          const totalReviewCount = userReviewsCount + (recommendation.reviewCount || 0);
          
          // Use user rating if available, otherwise use default rating
          const displayRating = userReviewsCount > 0 ? userAvgRating : recommendation.rating;
          
          return (
            <div 
              key={recommendation.id} 
              className={`animate-fade-in ${hasMatchingTags(recommendation) ? "ring-2 ring-amber-300 rounded-lg" : ""}`} 
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {hasMatchingTags(recommendation) && (
                <Badge variant="secondary" className="mb-2 ml-2 mt-2 bg-amber-100 text-amber-800 border-amber-300">
                  Tag Match
                </Badge>
              )}
              <LocationCard 
                recommendation={{
                  ...recommendation,
                  rating: displayRating, // Override with user rating if available
                  address: recommendation.address || (recommendation.area && recommendation.city ? `${recommendation.area}, ${recommendation.city}` : recommendation.address || ''),
                  availability_days: availabilityDaysString,
                  // Ensure hours data is properly passed
                  hours: recommendation.hours || '',
                  availability: recommendation.availability || '',
                  availability_start_time: recommendation.availability_start_time || undefined,
                  availability_end_time: recommendation.availability_end_time || undefined,
                  hideAvailabilityDropdown: true // Add this flag to hide the availability dropdown
                }}
                showDistanceUnderAddress={true}
                className="search-result-card h-full"
                reviewCount={totalReviewCount}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LocationsList;
