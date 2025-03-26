
import React from 'react';
import { Star, Award, Gem } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface Review {
  id: string;
  name: string;
  date: string;
  rating: number;
  text: string;
  isMustVisit?: boolean;
  isHiddenGem?: boolean;
}

interface ReviewsListProps {
  reviews: Review[];
  totalReviews: number;
  locationRating: number;
}

const ReviewsList = ({ reviews, totalReviews, locationRating }: ReviewsListProps) => {
  return (
    <div>
      <div className="flex items-center mb-4">
        <span className="font-medium">
          {totalReviews} reviews
        </span>
        <div className="flex items-center ml-3 text-amber-500">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={16} className={i < Math.floor(locationRating) ? "fill-amber-500" : ""} />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        {reviews.map(review => (
          <div key={review.id} className="border-b border-border/50 pb-4 last:border-0 last:pb-0">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-medium">{review.name}</div>
                <div className="text-xs text-muted-foreground">{review.date}</div>
              </div>
              <div className="flex items-center text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className={i < review.rating ? "fill-amber-500" : ""} />
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{review.text}</p>
            {(review.isMustVisit || review.isHiddenGem) && (
              <div className="flex gap-2 mt-2">
                {review.isMustVisit && (
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 gap-1.5">
                    <Award className="h-3.5 w-3.5" />
                    Must Visit
                  </Badge>
                )}
                {review.isHiddenGem && (
                  <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 gap-1.5">
                    <Gem className="h-3.5 w-3.5" />
                    Hidden Gem
                  </Badge>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsList;
