
import React, { useState } from 'react';
import LocationCard from '@/components/LocationCard';
import { Recommendation } from '@/lib/mockData';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReviewsSection from '@/components/location/ReviewsSection';
import { Review } from '@/components/location/ReviewsList';
import { ReviewFormValues } from '@/components/location/ReviewForm';

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
  const { toast } = useToast();
  const [cornerHouseReviews, setCornerHouseReviews] = useState<Review[]>([]);
  
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

  const handleSubmitReview = (values: ReviewFormValues) => {
    const newReview: Review = {
      id: Date.now().toString(),
      name: "You",
      date: "Just now",
      rating: values.rating,
      text: values.reviewText,
      isMustVisit: values.isMustVisit,
      isHiddenGem: values.isHiddenGem
    };
    
    setCornerHouseReviews(prev => [newReview, ...prev]);
    
    toast({
      title: "Review submitted",
      description: "Thank you for sharing your experience!",
    });
  };
  
  const cornerHouseRating = cornerHouseReviews.length > 0 
    ? cornerHouseReviews.reduce((sum, review) => sum + review.rating, 0) / cornerHouseReviews.length 
    : 4.5; // default rating
  
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
          />
          
          {/* Show review section only for Corner House */}
          {recommendation.name.toLowerCase().includes('corner house') && (
            <div className="mt-4">
              <ReviewsSection
                reviews={cornerHouseReviews}
                totalReviewCount={cornerHouseReviews.length}
                locationRating={cornerHouseRating}
                locationId={recommendation.id}
                locationName={recommendation.name}
                onSubmitReview={handleSubmitReview}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default LocationsList;
