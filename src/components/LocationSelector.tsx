import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { geocodeAddress } from '@/lib/locationUtils';

interface LocationSelectorProps {
  selectedLocation: string;
  onLocationChange: (location: string, coordinates?: { lat: number; lng: number }) => void;
}

// List of major Indian cities for suggestions
const INDIAN_CITIES = [
  "Mumbai, Maharashtra",
  "Delhi, Delhi",
  "Bengaluru, Karnataka",
  "Hyderabad, Telangana",
  "Chennai, Tamil Nadu",
  "Kolkata, West Bengal",
  "Pune, Maharashtra",
  "Ahmedabad, Gujarat",
  "Jaipur, Rajasthan",
  "Lucknow, Uttar Pradesh",
  "Kanpur, Uttar Pradesh",
  "Nagpur, Maharashtra",
  "Indore, Madhya Pradesh",
  "Thane, Maharashtra",
  "Bhopal, Madhya Pradesh",
  "Visakhapatnam, Andhra Pradesh",
  "Pimpri-Chinchwad, Maharashtra",
  "Patna, Bihar",
  "Vadodara, Gujarat",
  "Ghaziabad, Uttar Pradesh",
  "Ludhiana, Punjab",
  "Coimbatore, Tamil Nadu",
  "Agra, Uttar Pradesh",
  "Madurai, Tamil Nadu",
  "Nashik, Maharashtra",
  "Faridabad, Haryana",
  "Meerut, Uttar Pradesh",
  "Rajkot, Gujarat",
  "Kalyan-Dombivli, Maharashtra",
  "Vasai-Virar, Maharashtra"
];

const formatPostalCode = (pin: string): string => {
  return `Postal Code: ${pin}, India`;
};

// Check if input is a 6 digit Indian PIN code
const isIndianPostalCode = (input: string): boolean => {
  return /^\d{6}$/.test(input);
};

const LocationSelector: React.FC<LocationSelectorProps> = ({
  selectedLocation,
  onLocationChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [locationInput, setLocationInput] = useState(selectedLocation);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [isGeolocationLoading, setIsGeolocationLoading] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setLocationInput(selectedLocation);
  }, [selectedLocation]);

  useEffect(() => {
    if (locationInput.trim()) {
      const filtered = INDIAN_CITIES.filter(city => 
        city.toLowerCase().includes(locationInput.toLowerCase())
      );
      setFilteredCities(filtered);
    } else {
      setFilteredCities([]);
    }
  }, [locationInput]);

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsGeolocationLoading(true);
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
          
          // Pass both the location name and coordinates
          onLocationChange(location, { lat, lng });
          setIsEditing(false);
          setIsPopoverOpen(false);
          setIsGeolocationLoading(false);
          
          toast({
            title: "Location updated",
            description: "Using your current location",
            duration: 3000
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsGeolocationLoading(false);
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

  const handleSelectLocation = async (location: string) => {
    if (isIndianPostalCode(location)) {
      location = formatPostalCode(location);
    }
    
    // Get coordinates for the selected location
    try {
      const coordinates = await geocodeAddress(location);
      console.log(`Selected location: ${location}, coordinates:`, coordinates);
      
      if (coordinates) {
        onLocationChange(location, coordinates);
      } else {
        onLocationChange(location);
      }
    } catch (error) {
      console.error("Error geocoding location:", error);
      onLocationChange(location);
    }
    
    setLocationInput(location);
    setIsEditing(false);
    setIsPopoverOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (locationInput.trim()) {
      // Check if it's a postal code
      if (isIndianPostalCode(locationInput.trim())) {
        const formattedLocation = formatPostalCode(locationInput.trim());
        
        // Get coordinates for postal code
        try {
          const coordinates = await geocodeAddress(formattedLocation);
          if (coordinates) {
            onLocationChange(formattedLocation, coordinates);
          } else {
            onLocationChange(formattedLocation);
          }
        } catch (error) {
          console.error("Error geocoding postal code:", error);
          onLocationChange(formattedLocation);
        }
      } else {
        // For regular locations, get coordinates
        try {
          const coordinates = await geocodeAddress(locationInput);
          if (coordinates) {
            onLocationChange(locationInput, coordinates);
          } else {
            onLocationChange(locationInput);
          }
        } catch (error) {
          console.error("Error geocoding location:", error);
          onLocationChange(locationInput);
        }
      }
      
      setIsEditing(false);
      setIsPopoverOpen(false);
    }
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
        <div className="relative">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <div className="relative flex-1">
                  <Input 
                    ref={inputRef}
                    value={locationInput}
                    onChange={(e) => {
                      setLocationInput(e.target.value);
                      if (!isPopoverOpen && e.target.value.trim()) {
                        setIsPopoverOpen(true);
                      }
                    }}
                    placeholder="Enter city, area or PIN code..."
                    className="flex-1 h-9 pr-8"
                    autoFocus
                    onFocus={() => {
                      if (locationInput.trim()) {
                        setIsPopoverOpen(true);
                      }
                    }}
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
              <PopoverContent className="p-0 w-[300px]" align="start">
                <Command>
                  <CommandInput placeholder="Search location..." value={locationInput} onValueChange={setLocationInput} />
                  <CommandList>
                    <CommandEmpty>No results found</CommandEmpty>
                    <CommandGroup heading="Suggestions">
                      {filteredCities.map((city) => (
                        <CommandItem 
                          key={city} 
                          value={city}
                          onSelect={handleSelectLocation}
                        >
                          <MapPin className="mr-2 h-4 w-4" />
                          {city}
                        </CommandItem>
                      ))}
                      {isIndianPostalCode(locationInput) && (
                        <CommandItem 
                          value={formatPostalCode(locationInput)}
                          onSelect={() => handleSelectLocation(locationInput)}
                        >
                          <MapPin className="mr-2 h-4 w-4" />
                          {formatPostalCode(locationInput)}
                        </CommandItem>
                      )}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Button type="submit" size="sm" className="flex-shrink-0">Apply</Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={handleUseCurrentLocation}
              className="flex-shrink-0 p-2"
              disabled={isGeolocationLoading}
            >
              {isGeolocationLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
            <span className="font-medium truncate">{selectedLocation}</span>
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
