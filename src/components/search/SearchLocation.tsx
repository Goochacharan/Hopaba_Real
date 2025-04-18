
import React from 'react';
import LocationSelector from '@/components/LocationSelector';
import { useLocation } from '@/contexts/LocationContext';

const SearchLocation: React.FC = () => {
  const { selectedLocation, updateLocationWithCoordinates } = useLocation();

  const handleLocationChange = (location: string, coordinates?: { lat: number; lng: number }) => {
    console.log(`Location changed to: ${location}`, coordinates);
    updateLocationWithCoordinates(location, coordinates);
  };

  return (
    <div className="location-selector">
      <LocationSelector 
        selectedLocation={selectedLocation} 
        onLocationChange={handleLocationChange} 
      />
    </div>
  );
};

export default SearchLocation;
