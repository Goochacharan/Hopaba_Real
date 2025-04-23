
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

const getRatingLabel = (rating: number): string => {
  if (rating <= 2) return 'Worst';
  if (rating <= 5) return 'Bad';
  if (rating <= 8) return 'Good';
  return 'Excellent';
};

const getOverallRatingColor = (ratingNum: number) => {
  if (ratingNum <= 30) return '#ea384c'; // dark red
  if (ratingNum <= 50) return '#F97316'; // orange
  if (ratingNum <= 70) return '#d9a404'; // dark yellow (custom, close to golden)
  if (ratingNum <= 85) return '#A6D5A4'; // light green
  return '#2d5a27'; // dark green
};

const RatingProgressBars: React.FC<RatingProgressBarsProps> = ({ criteriaRatings, locationId }) => {
  const storedRatings = getStoredCriteriaRatings(locationId);
  const mergedRatings = { ...criteriaRatings };

  // Use stored ratings if they exist to ensure persistence after refresh
  if (Object.keys(storedRatings).length > 0) {
    Object.keys(storedRatings).forEach(criterionId => {
      mergedRatings[criterionId] = storedRatings[criterionId];
    });
  }

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

  let allRatings: number[] = [];
  Object.values(mergedRatings).forEach(val => {
    if (!isNaN(Number(val))) allRatings.push(Number(val));
  });
  const averageRaw = allRatings.length
    ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length
    : 0;
  const overallRating100 = Math.round((averageRaw / 10) * 100);
  const overallColor = getOverallRatingColor(overallRating100);

  if (Object.keys(mergedRatings).length === 0) return null;

  // Calculate center position for the rating circle
  const getCenterPosition = () => {
    // Height of progress bars + gap between them
    const barHeight = 16; // h-4 is 16px
    const gapSize = 4; // reducing gap size from 8px to 4px
    const totalBars = Object.keys(mergedRatings).length;
    
    // If there's only one bar, center is at the middle of that bar
    if (totalBars === 1) return 8; // Half of barHeight
    
    // If multiple bars, position at the middle point between first and last bar
    const totalHeight = (barHeight * totalBars) + (gapSize * (totalBars - 1));
    return totalHeight / 2; // Center point for vertical alignment
  };

  return (
    <div className="w-full space-y-1 mt-2 mb-4 flex flex-col gap-1">
      <div className="flex relative">
        {/* Rating circle positioned absolutely to align with center of progress bars */}
        <div 
          className="absolute right-0"
          style={{
            top: `${getCenterPosition()}px`,
            transform: 'translateY(-50%)'
          }}
        >
          <div
            title="Overall rating"
            className="flex items-center justify-center border-4 font-bold"
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              color: overallColor,
              borderColor: overallColor,
              fontSize: 28,
              background: '#fff',
              boxShadow: '0 0 4px 0 rgba(0,0,0,0.03)'
            }}
          >
            {overallRating100}
          </div>
        </div>

        {/* Progress bars container */}
        <div className="w-full pr-[80px]">
          {Object.entries(mergedRatings).map(([criterionId, rating]) => {
            const normalizedRating = (rating / 10) * 100;
            const ratingColor = getOverallRatingColor(normalizedRating);
            const ratingLabel = getRatingLabel(rating);
            const displayName = criterionNames[criterionId] || criterionId;

            return (
              <div key={criterionId} className="flex items-center gap-1 mb-1 relative">
                <div className="w-20 text-sm text-muted-foreground text-left pr-1">
                  {displayName}
                </div>
                <div className="flex-1 relative">
                  <Progress
                    value={normalizedRating}
                    className="h-4"
                    style={{ '--progress-color': ratingColor } as React.CSSProperties}
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <span className="text-xs font-medium text-white text-shadow" style={{ textShadow: '0px 0px 2px rgba(0,0,0,0.7)' }}>
                      {ratingLabel}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RatingProgressBars;
