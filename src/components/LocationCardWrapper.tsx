
import React from 'react';
import LocationCard from '@/components/LocationCard';
import { Recommendation } from '@/lib/mockData';

interface LocationCardWrapperProps {
  recommendation: Recommendation;
  className?: string;
  reviewCount?: number;
  showDistanceUnderAddress?: boolean;
  hideWishlistIcon?: boolean;
}

// We need to extend the original LocationCard props in a way that accommodates the hideWishlistIcon prop
interface ExtendedLocationCardProps {
  recommendation: Recommendation;
  className?: string;
  ranking?: number;
  reviewCount?: number;
  showDistanceUnderAddress?: boolean;
  hideWishlistIcon?: boolean; // Adding this to match our wrapper interface
}

const LocationCardWrapper: React.FC<LocationCardWrapperProps> = ({
  recommendation,
  className,
  reviewCount,
  showDistanceUnderAddress,
  hideWishlistIcon
}) => {
  // Make sure availability_days is always an array
  const enhancedRecommendation = {
    ...recommendation,
    // If availability_days is undefined or not an array, initialize it as an empty array
    availability_days: Array.isArray(recommendation.availability_days) 
      ? recommendation.availability_days 
      : recommendation.availability_days 
        ? [recommendation.availability_days].flat().filter(Boolean) 
        : []
  };
  
  // Cast LocationCard to accept our extended props
  const LocationCardWithHideWishlist = LocationCard as React.ComponentType<ExtendedLocationCardProps>;
  
  return (
    <LocationCardWithHideWishlist
      recommendation={enhancedRecommendation}
      className={className}
      reviewCount={reviewCount}
      showDistanceUnderAddress={showDistanceUnderAddress}
      hideWishlistIcon={hideWishlistIcon}
    />
  );
};

export default LocationCardWrapper;
