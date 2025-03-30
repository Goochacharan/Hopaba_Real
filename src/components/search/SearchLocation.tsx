
import React from 'react';
import LocationSelector from '@/components/LocationSelector';
import { geocodeAddress } from '@/lib/locationUtils';

interface SearchLocationProps {
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  setUserCoordinates: (coordinates: { lat: number; lng: number } | null) => void;
}

const SearchLocation: React.FC<SearchLocationProps> = ({
  selectedLocation,
  setSelectedLocation,
  setUserCoordinates
}) => {
  const handleLocationChange = (location: string, coordinates?: { lat: number; lng: number }) => {
    console.log(`Location changed to: ${location}`, coordinates);
    setSelectedLocation(location);
    
    if (coordinates) {
      setUserCoordinates(coordinates);
    } else {
      geocodeAddress(location).then(coords => {
        if (coords) {
          setUserCoordinates(coords);
        }
      });
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
