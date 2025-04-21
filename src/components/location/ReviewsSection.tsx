
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import ReviewForm, { ReviewFormValues } from './ReviewForm';
import ReviewsList, { Review } from './ReviewsList';

interface ReviewsSectionProps {
  reviews: Review[];
  totalReviewCount: number;
  locationRating: number;
  locationId?: string;
  locationName?: string;
  onSubmitReview: (values: ReviewFormValues) => void;
  currentUser?: any; // Add current user prop
  hasUserReviewed?: boolean; // Add flag to check if user has already reviewed
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
  const [reviewFormVisible, setReviewFormVisible] = useState(false);
  const navigate = useNavigate();

  const toggleReviewForm = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setReviewFormVisible(!reviewFormVisible);
  };

  const handleSubmitReview = (values: ReviewFormValues) => {
    onSubmitReview(values);
    setReviewFormVisible(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden mb-6 p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Reviews</h2>
        {!hasUserReviewed ? (
          <Button variant="outline" size="sm" onClick={toggleReviewForm} className="text-sm">
            {reviewFormVisible ? "Cancel" : "Write a review"}
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
            You've already reviewed this location
          </span>
        )}
      </div>

      {reviewFormVisible && !hasUserReviewed && (
        <ReviewForm 
          onSubmit={handleSubmitReview} 
          onCancel={toggleReviewForm} 
          locationName={locationName}
        />
      )}

      <ReviewsList 
        reviews={reviews} 
        totalReviews={totalReviewCount} 
        locationRating={locationRating} 
      />
    </div>
  );
};

export default ReviewsSection;
