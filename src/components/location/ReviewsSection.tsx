
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
  locationCategory?: string;
  onSubmitReview: (values: ReviewFormValues) => void;
  currentUser?: any;
  hasUserReviewed?: boolean;
}

const ReviewsSection = ({
  reviews,
  totalReviewCount,
  locationRating,
  locationId,
  locationName,
  locationCategory,
  onSubmitReview,
  currentUser,
  hasUserReviewed = false
}: ReviewsSectionProps) => {
  const [reviewFormVisible, setReviewFormVisible] = useState(false);
  const [editReviewData, setEditReviewData] = useState<Review | null>(null);
  const navigate = useNavigate();

  // Get this user's review if present
  const userReview = currentUser
    ? reviews.find((r) => r.userId === currentUser.id)
    : null;

  const openReviewForm = (editMode: boolean = false) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setEditReviewData(editMode && userReview ? userReview : null);
    setReviewFormVisible(true);
  };

  const handleSubmitReview = (values: ReviewFormValues) => {
    onSubmitReview(values);
    setReviewFormVisible(false);
    setEditReviewData(null);
  };

  return (
    <div className="bg-white shadow-sm border border-border overflow-hidden mb-6 p-6 px-[30px] rounded-lg py-[11px]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Reviews</h2>
        {userReview ? (
          <Button variant="outline" size="sm" onClick={() => openReviewForm(true)} className="text-sm">
            Edit your review
          </Button>
        ) : (
          <Button variant="outline" size="sm" onClick={() => openReviewForm(false)} className="text-sm">
            {reviewFormVisible ? "Cancel" : "Write a review"}
          </Button>
        )}
      </div>

      {reviewFormVisible && (
        <ReviewForm
          onSubmit={handleSubmitReview}
          onCancel={() => { setReviewFormVisible(false); setEditReviewData(null); }}
          locationName={locationName}
          category={locationCategory}
          initialValues={editReviewData ? {
            rating: editReviewData.rating,
            isMustVisit: editReviewData.isMustVisit,
            isHiddenGem: editReviewData.isHiddenGem,
            criteriaRatings: editReviewData.criteriaRatings || {}
          } : undefined}
        />
      )}

      <ReviewsList reviews={reviews} totalReviews={totalReviewCount} locationRating={locationRating} />
    </div>
  );
};

export default ReviewsSection;

