
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
    
    const criteriaAggregates: { [key: string]: { total: number; count: number } } = {};
    
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
  hygiene: 'Hygiene',
  ambiance: 'Ambiance',
  service: 'Service',
  food: 'Food Quality',
  value: 'Value for Money',
  cleanliness: 'Cleanliness',
  location: 'Location',
  parking: 'Parking',
  taste: 'Taste',
  price: 'Price',
  quality: 'Quality',
  atmosphere: 'Atmosphere',
  friendliness: 'Friendliness',
  speed: 'Speed of Service',
  variety: 'Menu Variety',
  presentation: 'Presentation'
};

const RatingProgressBars: React.FC<RatingProgressBarsProps> = ({ criteriaRatings, locationId }) => {
  const storedRatings = getStoredCriteriaRatings(locationId);
  const mergedRatings = { ...criteriaRatings, ...storedRatings };

  const getColorForRating = (rating: number) => {
    if (rating <= 2) return '#ea384c'; // Dark red for very bad
    if (rating <= 4) return '#ff6b6b'; // Light red for bad
    if (rating <= 6) return '#ffba08'; // Yellow for okay
    if (rating <= 8) return '#90be6d'; // Light green for good
    return '#2d5a27'; // Dark green for excellent
  };

  return (
    <div className="w-full space-y-3 mt-2 mb-4">
      {Object.entries(mergedRatings).map(([criterionId, rating]) => {
        const normalizedRating = (rating / 10) * 100; // Convert 1-10 rating to percentage
        const color = getColorForRating(rating);
        
        // Extract the proper name from the criterionId
        // If it's a UUID, try to extract the actual criterion name
        let criterionName = criterionNames[criterionId.toLowerCase()] || criterionId;
        
        // If criterionId contains hyphens or underscores, it might be a concatenated name or UUID
        if (criterionId.includes('-') || criterionId.includes('_')) {
          // Try to extract a readable name from the criterionId
          const lastPart = criterionId.split('-').pop()?.split('_').pop();
          if (lastPart && criterionNames[lastPart.toLowerCase()]) {
            criterionName = criterionNames[lastPart.toLowerCase()];
          } else if (lastPart) {
            // Try to make it readable by capitalizing and replacing underscores/hyphens
            criterionName = lastPart
              .replace(/_/g, ' ')
              .replace(/-/g, ' ')
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
              .join(' ');
          }
        }

        return (
          <div key={criterionId} className="flex items-center gap-4">
            <div className="w-32 text-sm text-muted-foreground text-right">
              {criterionName}
            </div>
            <div className="flex-1 space-y-1">
              <Progress 
                value={normalizedRating} 
                className="h-2" 
                style={{ '--progress-color': color } as React.CSSProperties}
              />
              <div className="flex justify-end">
                <span className="text-xs text-muted-foreground">
                  {rating.toFixed(1)}/10
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RatingProgressBars;
