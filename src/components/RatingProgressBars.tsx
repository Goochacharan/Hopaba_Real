import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';

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
  if (ratingNum <= 85) return '#68cd77'; // light green
  return '#00ee24'; // bright green as requested for highest rating
};

const RatingProgressBars: React.FC<RatingProgressBarsProps> = ({ criteriaRatings, locationId }) => {
  const storedRatings = getStoredCriteriaRatings(locationId);
  const mergedRatings = { ...criteriaRatings };

  if (Object.keys(storedRatings).length > 0) {
    Object.keys(storedRatings).forEach(criterionId => {
      mergedRatings[criterionId] = storedRatings[criterionId];
    });
  }

  const [criterionNames, setCriterionNames] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<boolean>(false);

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
          
          if (error) {
            throw error;
          }
          
          const namesMap: {[key: string]: string} = {};
          data?.forEach(criterion => {
            namesMap[criterion.id] = criterion.name;
          });
          setCriterionNames(namesMap);
        }
      } catch (err) {
        console.error('Error fetching criterion names:', err);
        setFetchError(true);
        
        const fallbackNames: {[key: string]: string} = {};
        Object.keys(mergedRatings).forEach(id => {
          fallbackNames[id] = `Rating ${id.slice(0, 4)}`;
        });
        setCriterionNames(fallbackNames);
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

  const getCenterPosition = () => {
    const barHeight = 16;
    const gapSize = 1;
    const totalBars = Object.keys(mergedRatings).length;
    
    if (totalBars === 1) return 8;
    
    const totalHeight = (barHeight * totalBars) + (gapSize * (totalBars - 1));
    return totalHeight / 2;
  };

  const handleRateClick = () => {
    const reviewsSection = document.querySelector('.reviews-section');
    if (reviewsSection) {
      reviewsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full space-y-1 mt-2 mb-4 flex flex-col gap-1">
      <div className="flex relative">
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
              width: 70,
              height: 70,
              borderRadius: '50%',
              color: overallColor,
              borderColor: overallColor,
              fontSize: 32,
              background: '#fff',
              boxShadow: '0 0 4px 0 rgba(0,0,0,0.05)'
            }}
          >
            {overallRating100}
          </div>
        </div>

        <div className="w-full pr-[90px]">
          {Object.entries(mergedRatings).map(([criterionId, rating]) => {
            const normalizedRating = (rating / 10) * 100;
            const ratingColor = getOverallRatingColor(normalizedRating);
            const ratingLabel = getRatingLabel(rating);
            const displayName = criterionNames[criterionId] || "Loading...";

            return (
              <div key={criterionId} className="flex items-center gap-1 mb-1 relative">
                <div className="w-20 text-sm text-muted-foreground text-left pr-1 truncate">
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
      
      <div className="flex items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={handleRateClick}
          className="text-xs px-2 py-1 flex items-center"
        >
          <Star className="w-3 h-3 mr-1" />
          Rate this Place
        </Button>
      </div>
    </div>
  );
};

export default RatingProgressBars;
