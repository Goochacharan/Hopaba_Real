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
        const criterionIds = Object.keys(mergedRatings);
        
        if (criterionIds.length > 0) {
          const { data, error } = await supabase
            .from('review_criteria')
            .select('id, name')
            .in('id', criterionIds);
            
          if (error) throw error;
          
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

  const getRatingLabel = (rating: number): string => {
    if (rating <= 2) return 'Worst';
    if (rating <= 5) return 'Bad';
    if (rating <= 8) return 'Good';
    return 'Excellent';
  };

  const getColorForRating = (rating: number) => {
    if (rating <= 2) return '#ea384c'; // Dark red for worst
    if (rating <= 5) return '#ff6b6b'; // Light red for bad
    if (rating <= 8) return '#90be6d'; // Light green for good
    return '#2d5a27'; // Dark green for excellent
  };

  return (
    <div className="w-full space-y-3 mt-2 mb-4">
      {Object.entries(mergedRatings).map(([criterionId, rating]) => {
        const normalizedRating = (rating / 10) * 100;
        const color = getColorForRating(rating);
        const ratingLabel = getRatingLabel(rating);
        const displayName = criterionNames[criterionId] || criterionId;

        return (
          <div key={criterionId} className="flex items-center gap-4">
            <div className="w-32 text-sm text-muted-foreground text-left">
              {displayName}
            </div>
            <div className="flex-1">
              <div className="relative">
                <Progress 
                  value={normalizedRating} 
                  className="h-8" 
                  style={{ '--progress-color': color } as React.CSSProperties}
                />
                <div 
                  className="absolute inset-0 flex items-center px-3 text-sm font-medium text-white"
                  style={{ 
                    width: `${normalizedRating}%`,
                    minWidth: 'fit-content',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                  }}
                >
                  {ratingLabel}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RatingProgressBars;
