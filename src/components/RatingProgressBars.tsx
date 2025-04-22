
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface RatingCriterion {
  name: string;
  rating: number;
}

interface RatingProgressBarsProps {
  ratings: RatingCriterion[];
}

const RatingProgressBars: React.FC<RatingProgressBarsProps> = ({ ratings }) => {
  const getColorForRating = (rating: number): string => {
    if (rating <= 3) return '#ea384c'; // Dark red for very bad
    if (rating <= 5) return '#333'; // Dark gray for bad
    if (rating <= 7) return '#999'; // Medium gray for okay
    if (rating <= 8.5) return '#F2FCE2'; // Soft green for good
    return '#0EA5E9'; // Bright green for excellent
  };

  return (
    <div className="space-y-2 py-2">
      {ratings.map((criterion) => (
        <div key={criterion.name} className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{criterion.name}</span>
            <span>{criterion.rating.toFixed(1)}/10</span>
          </div>
          <Progress 
            value={(criterion.rating / 10) * 100} 
            className="h-2"
            style={{
              backgroundColor: 'rgba(0,0,0,0.1)',
            }}
            indicatorStyle={{
              backgroundColor: getColorForRating(criterion.rating),
              transition: 'all 0.2s ease'
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default RatingProgressBars;
