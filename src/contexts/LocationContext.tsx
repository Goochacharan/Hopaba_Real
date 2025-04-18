
import React, { createContext, useContext, useState, useEffect } from 'react';
import { geocodeAddress } from '@/lib/locationUtils';

export type Coordinates = {
  lat: number;
  lng: number;
} | null;

interface LocationContextType {
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  userCoordinates: Coordinates;
  setUserCoordinates: (coordinates: Coordinates) => void;
  isUsingCurrentLocation: boolean;
  setIsUsingCurrentLocation: (isUsing: boolean) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedLocation, setSelectedLocation] = useState<string>("Bengaluru, Karnataka");
  const [userCoordinates, setUserCoordinates] = useState<Coordinates>({
    lat: 12.9716,
    lng: 77.5946
  }); // Default to Bengaluru
  const [isUsingCurrentLocation, setIsUsingCurrentLocation] = useState<boolean>(false);

  // Try to get user's location on initial mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoordinates({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsUsingCurrentLocation(true);
          // Attempt to reverse geocode to get city name
          reverseGeocode(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Error accessing geolocation:", error);
        }
      );
    }
  }, []);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      // In a real app, you would use a geocoding service API
      // For now we'll use a simple approximation based on known coordinates
      if (lat > 12.5 && lat < 13.5 && lng > 77 && lng < 78) {
        setSelectedLocation("Bengaluru, Karnataka");
      } else if (lat > 18.5 && lat < 19.5 && lng > 72.5 && lng < 73.5) {
        setSelectedLocation("Mumbai, Maharashtra");
      } else if (lat > 28.5 && lat < 29.5 && lng > 77 && lng < 78) {
        setSelectedLocation("New Delhi, Delhi");
      } else {
        // Default fallback
        setSelectedLocation("Current Location");
      }
    } catch (error) {
      console.error("Failed to reverse geocode:", error);
    }
  };

  return (
    <LocationContext.Provider value={{
      selectedLocation,
      setSelectedLocation,
      userCoordinates,
      setUserCoordinates,
      isUsingCurrentLocation,
      setIsUsingCurrentLocation
    }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
