
import React from 'react';
import { useLocation } from '@/contexts/LocationContext';

const LocationSelector: React.FC = () => {
  const { selectedLocation } = useLocation();

  return null; // Completely remove the location selector
};

export default LocationSelector;
