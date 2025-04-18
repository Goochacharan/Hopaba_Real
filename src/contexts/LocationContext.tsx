
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { geocodeAddress } from '@/lib/locationUtils';
import { toast } from '@/components/ui/use-toast';

interface LocationContextType {
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  userCoordinates: { lat: number; lng: number } | null;
  setUserCoordinates: (coordinates: { lat: number; lng: number } | null) => void;
  isLoadingLocation: boolean;
}

const defaultLocation = "Bengaluru, Karnataka";
const defaultCoordinates = { lat: 12.9716, lng: 77.5946 }; // Bengaluru coordinates

const LocationContext = createContext<LocationContextType>({
  selectedLocation: defaultLocation,
  setSelectedLocation: () => {},
  userCoordinates: defaultCoordinates,
  setUserCoordinates: () => {},
  isLoadingLocation: false
});

export const useLocation = () => useContext(LocationContext);

export const LocationProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [selectedLocation, setSelectedLocation] = useState<string>(defaultLocation);
  const [userCoordinates, setUserCoordinates] = useState<{ lat: number; lng: number } | null>(defaultCoordinates);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);

  // Initialize user location on mount
  useEffect(() => {
    const initUserLocation = async () => {
      setIsLoadingLocation(true);
      if (navigator.geolocation) {
        try {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const coords = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              setUserCoordinates(coords);
              
              // After getting coordinates, we could reverse geocode to get location name
              // This would require a service like Google Maps API or similar
              // For now, we'll just use "Current Location"
              setSelectedLocation("Current Location");
              
              setIsLoadingLocation(false);
            },
            (error) => {
              console.error('Geolocation error:', error);
              setIsLoadingLocation(false);
              // Fallback to default
              setUserCoordinates(defaultCoordinates);
            },
            { timeout: 10000 }
          );
        } catch (error) {
          console.error('Geolocation error:', error);
          setIsLoadingLocation(false);
          // Fallback to default
          setUserCoordinates(defaultCoordinates);
        }
      } else {
        setIsLoadingLocation(false);
        // Fallback to default
        setUserCoordinates(defaultCoordinates);
        toast({
          title: "Location services not available",
          description: "Your browser does not support geolocation services.",
          variant: "destructive",
        });
      }
    };

    initUserLocation();
  }, []);

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
    
    if (location === "Current Location") {
      // Already handled by geolocation API
      return;
    }
    
    // Geocode the address to get coordinates
    geocodeAddress(location).then(coords => {
      if (coords) {
        setUserCoordinates(coords);
      } else {
        console.error('Failed to geocode address:', location);
      }
    });
  };

  return (
    <LocationContext.Provider
      value={{
        selectedLocation,
        setSelectedLocation: handleLocationChange,
        userCoordinates,
        setUserCoordinates,
        isLoadingLocation
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export default LocationProvider;
