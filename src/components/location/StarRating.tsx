
import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  className?: string;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, className }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const totalStars = 5;
  
  return (
    <div className={`flex items-center ${className}`}>
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className="fill-amber-500 stroke-amber-500 w-3.5 h-3.5" />
      ))}
      
      {hasHalfStar && (
        <div className="relative w-3.5 h-3.5">
          <Star className="absolute stroke-amber-500 w-3.5 h-3.5" />
          <div className="absolute overflow-hidden w-[50%]">
            <Star className="fill-amber-500 stroke-amber-500 w-3.5 h-3.5" />
          </div>
        </div>
      )}
      
      {[...Array(totalStars - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
        <Star key={`empty-${i}`} className="stroke-amber-500 w-3.5 h-3.5" />
      ))}
    </div>
  );
};

export default StarRating;
