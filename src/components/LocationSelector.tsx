
import React, { useState, useEffect } from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

interface LocationSelectorProps {
  selectedLocation: string;
  onLocationChange: (location: string) => void;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  selectedLocation,
  onLocationChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [locationInput, setLocationInput] = useState(selectedLocation);

  useEffect(() => {
    setLocationInput(selectedLocation);
  }, [selectedLocation]);

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      toast({
        title: "Finding your location",
        description: "Please wait while we access your location...",
        duration: 3000
      });
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // For this demo, we'll just use a placeholder string
          // In a real app, you might reverse geocode these coordinates
          const location = "Current Location";
          onLocationChange(location);
          setIsEditing(false);
          
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
      onLocationChange(locationInput);
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-border p-3 mb-4 animate-fade-in">
      {isEditing ? (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
          <Input 
            value={locationInput}
            onChange={(e) => setLocationInput(e.target.value)}
            placeholder="Enter location..."
            className="flex-1 h-9"
            autoFocus
          />
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={handleUseCurrentLocation}
            className="flex-shrink-0"
          >
            <Navigation className="h-4 w-4 mr-1" />
            Current
          </Button>
          <Button type="submit" size="sm" className="flex-shrink-0">Apply</Button>
        </form>
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
