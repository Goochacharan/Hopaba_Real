
import React from 'react';
import { useLocation } from '@/contexts/LocationContext';

interface LocationSelectorProps {
  selectedLocation?: string;
  onLocationChange?: (location: string, coordinates?: { lat: number; lng: number }) => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  selectedLocation: propSelectedLocation,
  onLocationChange,
}) => {
  const { selectedLocation: contextSelectedLocation } = useLocation();

  // Use props if provided, otherwise fall back to context
  const locationToUse = propSelectedLocation !== undefined ? propSelectedLocation : contextSelectedLocation;

  // This component is intentionally empty as per the comment in the original code
  return null; // Completely remove the location selector
};

export default LocationSelector;
