
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import ReviewsList, { Review } from './ReviewsList';

interface ReviewsSectionProps {
  reviews: Review[];
  totalReviewCount: number;
  locationRating: number;
  locationId?: string;
  locationName?: string;
  onSubmitReview: (values: any) => void;
  currentUser?: any;
  hasUserReviewed?: boolean;
}

const ReviewsSection = ({ 
  reviews, 
  totalReviewCount, 
  locationRating, 
  locationId,
  locationName,
  onSubmitReview,
  currentUser,
  hasUserReviewed = false
}: ReviewsSectionProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden mb-6 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Reviews</h2>
        {hasUserReviewed && (
          <span className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
            You've already reviewed this location
          </span>
        )}
      </div>

      <ReviewsList 
        reviews={reviews} 
        totalReviews={totalReviewCount} 
        locationRating={locationRating} 
      />
    </div>
  );
};

export default ReviewsSection;
