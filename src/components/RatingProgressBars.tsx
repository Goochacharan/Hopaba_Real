
import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

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

const RatingProgressBars: React.FC<RatingProgressBarsProps> = ({ criteriaRatings, locationId }) => {
  const storedRatings = getStoredCriteriaRatings(locationId);
  const mergedRatings = { ...criteriaRatings, ...storedRatings };
  const [criterionNames, setCriterionNames] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCriterionNames = async () => {
      setLoading(true);
      try {
        // Get all criterion IDs from the ratings
        const criterionIds = Object.keys(mergedRatings);
        
        if (criterionIds.length > 0) {
          // Fetch criteria names from the database
          const { data, error } = await supabase
            .from('review_criteria')
            .select('id, name')
            .in('id', criterionIds);
            
          if (error) throw error;
          
          // Create a mapping of ID to name
          const namesMap: {[key: string]: string} = {};
          data?.forEach(criterion => {
            namesMap[criterion.id] = criterion.name;
          });
          
          setCriterionNames(namesMap);
        }
      } catch (err) {
        console.error('Error fetching criterion names:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCriterionNames();
  }, [mergedRatings]);

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
        
        // Get the criterion name from the mapping, or fall back to the ID
        const displayName = criterionNames[criterionId] || criterionId;

        return (
          <div key={criterionId} className="flex items-center gap-4">
            <div className="w-32 text-sm text-muted-foreground text-right">
              {displayName}
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
