
import React from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  showCount?: boolean;
  count?: number;
  size?: 'xsmall' | 'small' | 'medium' | 'large';
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  showCount = false,
  count = 0,
  size = 'medium'
}) => {
  // Map size to star dimensions
  const starSizeMap = {
    xsmall: {
      className: 'h-2.5 w-2.5',
      gap: 'gap-0.5'
    },
    small: {
      className: 'h-3 w-3',
      gap: 'gap-1'
    },
    medium: {
      className: 'h-4 w-4',
      gap: 'gap-1'
    },
    large: {
      className: 'h-5 w-5',
      gap: 'gap-1.5'
    }
  };
  
  const { className: starSize, gap } = starSizeMap[size];
  
  // Calculate full and partial stars
  const fullStars = Math.floor(rating);
  const partialStar = rating % 1;
  const emptyStars = 5 - fullStars - (partialStar > 0 ? 1 : 0);
  
  // Text size based on star size
  const textSizeMap = {
    xsmall: 'text-xs',
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };
  
  const ratingTextSize = textSizeMap[size];
  const countTextSize = {
    xsmall: 'text-[10px]',
    small: 'text-xs',
    medium: 'text-xs',
    large: 'text-sm'
  }[size];
  
  return (
    <div className="flex items-center">
      <div className={cn("flex items-center", gap)}>
        {[...Array(fullStars)].map((_, i) => (
          <Star 
            key={`full-${i}`} 
            className={cn(starSize, "fill-amber-400 text-amber-400")} 
          />
        ))}
        
        {partialStar > 0 && (
          <div className="relative">
            <Star className={cn(starSize, "text-gray-300")} />
            <div 
              className="absolute inset-0 overflow-hidden" 
              style={{ width: `${partialStar * 100}%` }}
            >
              <Star className={cn(starSize, "fill-amber-400 text-amber-400")} />
            </div>
          </div>
        )}
        
        {[...Array(emptyStars)].map((_, i) => (
          <Star 
            key={`empty-${i}`} 
            className={cn(starSize, "text-gray-300")} 
          />
        ))}
      </div>
      
      <span className={cn("ml-1.5 font-medium", ratingTextSize)}>
        {rating.toFixed(1)}
      </span>
      
      {showCount && (
        <span className={cn("ml-1 text-muted-foreground", countTextSize)}>
          ({count})
        </span>
      )}
    </div>
  );
};

export default StarRating;
