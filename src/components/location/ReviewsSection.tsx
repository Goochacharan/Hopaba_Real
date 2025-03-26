
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import ReviewForm, { ReviewFormValues } from './ReviewForm';
import ReviewsList, { Review } from './ReviewsList';

interface ReviewsSectionProps {
  reviews: Review[];
  totalReviewCount: number;
  locationRating: number;
  onSubmitReview: (values: ReviewFormValues) => void;
}

const ReviewsSection = ({ reviews, totalReviewCount, locationRating, onSubmitReview }: ReviewsSectionProps) => {
  const [reviewFormVisible, setReviewFormVisible] = useState(false);

  const toggleReviewForm = () => {
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
        <Button variant="outline" size="sm" onClick={toggleReviewForm} className="text-sm">
          {reviewFormVisible ? "Cancel" : "Write a review"}
        </Button>
      </div>

      {reviewFormVisible && (
        <ReviewForm 
          onSubmit={handleSubmitReview} 
          onCancel={toggleReviewForm} 
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
