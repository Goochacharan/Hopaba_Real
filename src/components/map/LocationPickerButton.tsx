
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import MapLocationPicker from './MapLocationPicker';

interface LocationPickerButtonProps {
  onLocationSelected: (location: { lat: number; lng: number; address?: string }) => void;
  initialLocation?: { lat?: number; lng?: number; address?: string; mapLink?: string };
  variant?: "default" | "secondary" | "outline" | "destructive" | "ghost" | "link";
}

const LocationPickerButton: React.FC<LocationPickerButtonProps> = ({
  onLocationSelected,
  initialLocation,
  variant = "outline"
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  
  return (
    <>
      <Button
        type="button"
        variant={variant}
        onClick={() => setIsPickerOpen(true)}
        className="flex items-center gap-1.5"
      >
        <MapPin className="h-4 w-4" />
        <span>{initialLocation?.lat && initialLocation?.lng ? 'Change Location' : 'Pick Location on Map'}</span>
      </Button>
      
      <MapLocationPicker
        open={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onLocationSelected={onLocationSelected}
        initialLocation={initialLocation}
      />
    </>
  );
};

export default LocationPickerButton;
