
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface RatingProgressBarsProps {
  criteriaRatings: {
    [criterionId: string]: number;
  };
  locationId: string;
}

const getStoredCriteriaRatings = (locationId: string) => {
  try {
    const storedReviews = localStorage.getItem(`reviews_${locationId}`);
    const reviews = storedReviews ? JSON.parse(storedReviews) : [];
    
    // Initialize an object to store total ratings and count for each criterion
    const criteriaAggregates: { [key: string]: { total: number; count: number } } = {};
    
    // Aggregate ratings for each criterion across all reviews
    reviews.forEach((review: any) => {
      if (review.criteriaRatings) {
        Object.entries(review.criteriaRatings).forEach(([criterionId, rating]) => {
          if (!criteriaAggregates[criterionId]) {
            criteriaAggregates[criterionId] = { total: 0, count: 0 };
          }
          criteriaAggregates[criterionId].total += Number(rating);
          criteriaAggregates[criterionId].count += 1;
        });
      }
    });
    
    // Calculate averages
    const averageRatings: { [key: string]: number } = {};
    Object.entries(criteriaAggregates).forEach(([criterionId, { total, count }]) => {
      averageRatings[criterionId] = count > 0 ? total / count : 0;
    });
    
    return averageRatings;
  } catch (error) {
    console.error('Error getting stored criteria ratings:', error);
    return {};
  }
};

// Define criterion names
const criterionNames: { [key: string]: string } = {
  taste: 'Taste',
  service: 'Service',
  ambiance: 'Ambiance',
  cleanliness: 'Cleanliness',
  'value-for-money': 'Value for Money',
  'food-quality': 'Food Quality',
  'waiting-time': 'Waiting Time',
  'staff-behavior': 'Staff Behavior'
};

const RatingProgressBars: React.FC<RatingProgressBarsProps> = ({ criteriaRatings, locationId }) => {
  const storedRatings = getStoredCriteriaRatings(locationId);
  const mergedRatings = { ...criteriaRatings, ...storedRatings };

  const getColorForRating = (rating: number) => {
    if (rating <= 1) return '#ea384c'; // Dark red for very bad
    if (rating <= 2) return '#ff6b6b'; // Light red
    if (rating <= 3) return '#222222'; // Dark gray for neutral
    if (rating <= 4) return '#90be6d'; // Light green
    return '#2d5a27'; // Dark green for excellent
  };

  return (
    <div className="w-full space-y-2 mt-2 mb-4">
      {Object.entries(mergedRatings).map(([criterionId, rating]) => {
        const normalizedRating = (rating / 5) * 100; // Convert 0-5 rating to percentage
        const color = getColorForRating(rating);
        const criterionName = criterionNames[criterionId] || criterionId;

        return (
          <div key={criterionId} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{criterionName}</span>
              <span className="text-muted-foreground font-medium">{rating.toFixed(1)}</span>
            </div>
            <Progress 
              value={normalizedRating} 
              className="h-2" 
              indicatorClassName={`bg-[${color}]`}
              style={{ '--progress-background': color } as any}
            />
          </div>
        );
      })}
    </div>
  );
};

export default RatingProgressBars;
