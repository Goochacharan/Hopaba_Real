
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { geocodeAddress } from '@/lib/locationUtils';
import { useLocation } from '@/contexts/LocationContext';

interface LocationSelectorProps {
  onLocationChange?: (location: string, coordinates?: { lat: number; lng: number }) => void;
}

// List of major Indian cities with their coordinates
const indianCities = [
  { name: "Mumbai, Maharashtra", lat: 19.0760, lng: 72.8777 },
  { name: "Delhi, Delhi", lat: 28.7041, lng: 77.1025 },
  { name: "Bengaluru, Karnataka", lat: 12.9716, lng: 77.5946 },
  { name: "Hyderabad, Telangana", lat: 17.3850, lng: 78.4867 },
  { name: "Chennai, Tamil Nadu", lat: 13.0827, lng: 80.2707 },
  { name: "Kolkata, West Bengal", lat: 22.5726, lng: 88.3639 },
  { name: "Pune, Maharashtra", lat: 18.5204, lng: 73.8567 },
  { name: "Ahmedabad, Gujarat", lat: 23.0225, lng: 72.5714 },
  { name: "Jaipur, Rajasthan", lat: 26.9124, lng: 75.7873 },
  { name: "Surat, Gujarat", lat: 21.1702, lng: 72.8311 },
  { name: "Lucknow, Uttar Pradesh", lat: 26.8467, lng: 80.9462 },
  { name: "Kanpur, Uttar Pradesh", lat: 26.4499, lng: 80.3319 },
  { name: "Nagpur, Maharashtra", lat: 21.1458, lng: 79.0882 },
  { name: "Indore, Madhya Pradesh", lat: 22.7196, lng: 75.8577 },
  { name: "Thane, Maharashtra", lat: 19.2183, lng: 72.9781 },
  { name: "Bhopal, Madhya Pradesh", lat: 23.2599, lng: 77.4126 },
  { name: "Visakhapatnam, Andhra Pradesh", lat: 17.6868, lng: 83.2185 },
  { name: "Patna, Bihar", lat: 25.5941, lng: 85.1376 },
  { name: "Vadodara, Gujarat", lat: 22.3072, lng: 73.1812 },
  { name: "Ghaziabad, Uttar Pradesh", lat: 28.6692, lng: 77.4538 }
];

// Regex pattern for Indian postal codes
const postalCodePattern = /^\d{6}$/;

const LocationSelector: React.FC<LocationSelectorProps> = ({
  onLocationChange
}) => {
  const { 
    selectedLocation, 
    setSelectedLocation, 
    userCoordinates, 
    setUserCoordinates,
    isUsingCurrentLocation,
    setIsUsingCurrentLocation
  } = useLocation();

  const [isEditing, setIsEditing] = useState(false);
  const [locationInput, setLocationInput] = useState(selectedLocation);
  const [filteredCities, setFilteredCities] = useState(indianCities);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocationInput(selectedLocation);
  }, [selectedLocation]);

  // Filter cities based on input
  useEffect(() => {
    if (locationInput.trim() === '') {
      setFilteredCities(indianCities);
    } else {
      const filtered = indianCities.filter(city => 
        city.name.toLowerCase().includes(locationInput.toLowerCase())
      );
      setFilteredCities(filtered);
    }
  }, [locationInput]);

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      toast({
        title: "Finding your location",
        description: "Please wait while we access your location...",
        duration: 3000
      });
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Get coordinates
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // For display purposes we'll use "Current Location" label
          const location = "Current Location";
          
          // Update context
          setUserCoordinates({ lat, lng });
          setSelectedLocation(location);
          setIsUsingCurrentLocation(true);
          setIsEditing(false);
          
          // Notify parent if callback exists
          if (onLocationChange) {
            onLocationChange(location, { lat, lng });
          }
          
          toast({
            title: "Location updated",
            description: "Using your current location",
            duration: 3000
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: "Location error",
            description: "Unable to access your location. Please check your browser permissions.",
            variant: "destructive",
            duration: 5000
          });
        }
      );
    } else {
      toast({
        title: "Not supported",
        description: "Geolocation is not supported by your browser",
        variant: "destructive",
        duration: 3000
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (locationInput.trim()) {
      handleLocationSelect(locationInput);
    }
  };

  const handleLocationSelect = (location: string) => {
    // Check if input is a postal code
    if (postalCodePattern.test(location)) {
      fetchLocationFromPostalCode(location);
      return;
    }

    // Check if it's one of our predefined cities
    const cityMatch = indianCities.find(city => 
      city.name.toLowerCase() === location.toLowerCase()
    );

    if (cityMatch) {
      setSelectedLocation(cityMatch.name);
      setUserCoordinates({ lat: cityMatch.lat, lng: cityMatch.lng });
      setIsUsingCurrentLocation(false);
      setIsEditing(false);

      if (onLocationChange) {
        onLocationChange(cityMatch.name, { lat: cityMatch.lat, lng: cityMatch.lng });
      }
    } else {
      // Try to geocode the location
      geocodeAddress(location).then(coords => {
        if (coords) {
          setSelectedLocation(location);
          setUserCoordinates(coords);
          setIsUsingCurrentLocation(false);
          
          if (onLocationChange) {
            onLocationChange(location, coords);
          }
        } else {
          toast({
            title: "Location not found",
            description: "We couldn't find that location. Please try another search.",
            variant: "destructive",
            duration: 3000
          });
        }
      });
    }
    
    setIsEditing(false);
    setIsOpen(false);
  };

  const fetchLocationFromPostalCode = async (postalCode: string) => {
    try {
      toast({
        title: "Searching",
        description: `Looking up location for PIN code ${postalCode}...`,
        duration: 2000
      });
      
      // In a real app, you would use a postal code API
      // For demo purposes, we'll just set a generic location
      const locationName = `Location with PIN ${postalCode}, India`;
      setSelectedLocation(locationName);
      
      // Since we don't have actual geocoding for PIN codes in this example,
      // we'll use central India coordinates as a placeholder
      setUserCoordinates({ lat: 21.1458, lng: 79.0882 });
      setIsUsingCurrentLocation(false);
      
      if (onLocationChange) {
        onLocationChange(locationName, { lat: 21.1458, lng: 79.0882 });
      }
      
      toast({
        title: "Location updated",
        description: `Using PIN code ${postalCode}`,
        duration: 2000
      });
    } catch (error) {
      console.error('Error fetching location from postal code:', error);
      toast({
        title: "Error",
        description: "We couldn't find that PIN code. Please try again.",
        variant: "destructive",
        duration: 3000
      });
    }
    
    setIsEditing(false);
    setIsOpen(false);
  };

  const clearLocationInput = () => {
    setLocationInput('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-border p-3 mb-4 animate-fade-in">
      {isEditing ? (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <div className="relative flex-1">
                <Input 
                  ref={inputRef}
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder="Enter city, area or PIN code..."
                  className="flex-1 h-9 pr-8"
                  autoFocus
                  onFocus={() => setIsOpen(true)}
                />
                {locationInput && (
                  <button
                    type="button"
                    onClick={clearLocationInput}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              {filteredCities.length > 0 && (
                <Command>
                  <CommandList>
                    <CommandGroup heading="Popular cities in India">
                      {filteredCities.slice(0, 5).map((city) => (
                        <CommandItem
                          key={city.name}
                          onSelect={() => handleLocationSelect(city.name)}
                          className="cursor-pointer"
                        >
                          <MapPin className="mr-2 h-4 w-4" />
                          {city.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              )}
            </PopoverContent>
          </Popover>
          <Button type="submit" size="sm" className="flex-shrink-0">Apply</Button>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={handleUseCurrentLocation}
            className="flex-shrink-0 p-2"
          >
            <Navigation className="h-4 w-4" />
          </Button>
        </form>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
            <span className="font-medium truncate">
              {isUsingCurrentLocation ? "📍 " : ""}{selectedLocation}
            </span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsEditing(true)}
          >
            Change Location
          </Button>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
