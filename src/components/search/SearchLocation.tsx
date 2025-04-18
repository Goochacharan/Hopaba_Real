
import React from 'react';
import LocationSelector from '@/components/LocationSelector';
import { useLocation } from '@/contexts/LocationContext';

const SearchLocation: React.FC = () => {
  const { selectedLocation, setSelectedLocation, setUserCoordinates } = useLocation();

  const handleLocationChange = (location: string, coordinates?: { lat: number; lng: number }) => {
    console.log(`Location changed to: ${location}`, coordinates);
    setSelectedLocation(location);
    
    if (coordinates) {
      setUserCoordinates(coordinates);
    }
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
