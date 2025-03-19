
import React from 'react';
import { Link } from 'react-router-dom';
import { Star, StarHalf, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Recommendation } from '@/types/recommendation';
import { Badge } from '@/components/ui/badge';
import { useWishlist } from '@/contexts/WishlistContext';

interface LocationCardProps {
  recommendation: Recommendation;
  ranking?: number;
  reviewCount?: number;
  className?: string;
}

const LocationCard = ({ 
  recommendation, 
  ranking, 
  reviewCount,
  className
}: LocationCardProps) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(recommendation.id);
  
  // Ensure we have a valid ID for the location
  const locationId = recommendation.id || `rec-${Math.random().toString(36).substring(2, 9)}`;
  
  const renderRating = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
        ))}
        {hasHalfStar && (
          <StarHalf className="w-4 h-4 fill-amber-500 text-amber-500" />
        )}
        {[...Array(5 - fullStars - (hasHalfStar ? 1 : 0))].map((_, i) => (
          <Star key={i + fullStars + (hasHalfStar ? 1 : 0)} className="w-4 h-4 text-gray-300" />
        ))}
      </div>
    );
  };

  return (
    <Link 
      to={`/location/${locationId}`} 
      className={cn(
        "group block rounded-xl bg-white shadow-sm border border-border overflow-hidden transform transition-all duration-300 hover:shadow-md hover:-translate-y-1",
        className
      )}
    >
      <div className="relative w-full aspect-video bg-gray-100 overflow-hidden">
        {ranking && (
          <div className="absolute top-2 left-2 z-10 flex items-center justify-center w-8 h-8 bg-black/70 text-white text-sm font-medium rounded-full">
            {ranking}
          </div>
        )}
        
        <button 
          className={cn(
            "absolute top-2 right-2 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors",
            isWishlisted 
              ? "bg-red-500 text-white" 
              : "bg-black/30 text-white hover:bg-black/50"
          )}
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(recommendation);
          }}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill={isWishlisted ? "currentColor" : "none"} 
            stroke="currentColor" 
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
        
        <img 
          src={recommendation.image || '/placeholder.svg'} 
          alt={recommendation.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      </div>
      
      <div className="p-4">
        <div className="flex flex-col h-full">
          <h3 className="font-medium text-gray-900 text-lg mb-1 line-clamp-1">
            {recommendation.name}
          </h3>
          
          <div className="flex items-center mb-2">
            <div className="flex items-center mr-1">
              {renderRating(recommendation.rating)}
            </div>
            <span className="text-xs text-gray-500">
              {reviewCount || Math.floor(Math.random() * 100) + 50} reviews
            </span>
          </div>
          
          {recommendation.tags && recommendation.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1">
              {recommendation.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-secondary/50">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          {recommendation.address && (
            <div className="flex items-start text-sm text-gray-500 mt-auto">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" />
              <span className="line-clamp-2">{recommendation.address}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default LocationCard;
