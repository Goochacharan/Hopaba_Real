
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

const LocationCardWrapper: React.FC<LocationCardWrapperProps> = ({
  recommendation,
  className,
  reviewCount,
  showDistanceUnderAddress,
  hideWishlistIcon
}) => {
  // Simply pass all props to the original LocationCard
  // The hideWishlistIcon prop will be handled inside LocationCard
  return (
    <LocationCard
      recommendation={recommendation}
      className={className}
      reviewCount={reviewCount}
      showDistanceUnderAddress={showDistanceUnderAddress}
      hideWishlistIcon={hideWishlistIcon}
    />
  );
};

export default LocationCardWrapper;
