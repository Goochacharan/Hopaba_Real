
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MapPin, Link2, AlertCircle } from 'lucide-react';
import { BusinessFormValues } from '../AddBusinessForm';
import { extractCoordinatesFromMapLink } from '@/lib/locationUtils';
import LocationPickerButton from '../map/LocationPickerButton';

const LocationSection = () => {
  const form = useFormContext<BusinessFormValues>();
  const [mapCoordinates, setMapCoordinates] = useState<{ lat?: number; lng?: number }>(() => {
    // Initialize from existing values if available
    const mapLink = form.getValues('map_link');
    if (mapLink) {
      const coords = extractCoordinatesFromMapLink(mapLink);
      if (coords) {
        return { lat: coords.lat, lng: coords.lng };
      }
    }
    return {};
  });
  
  const handleLocationChange = (value: string, onChange: (value: string) => void) => {
    // Check if the input is a Google Maps URL
    if (value.includes('google.com/maps') || value.includes('goo.gl/maps')) {
      // Extract coordinates for validation
      const coordinates = extractCoordinatesFromMapLink(value);
      if (coordinates) {
        console.log("Successfully extracted coordinates:", coordinates);
        setMapCoordinates({ lat: coordinates.lat, lng: coordinates.lng });
      } else {
        console.log("Could not extract coordinates from map link");
      }
      
      // Just store the URL directly - this preserves the exact link pasted by user
      onChange(value);
    } else {
      // For regular text, just use it directly
      onChange(value);
    }
  };
  
  const handleMapLocationSelected = (location: { lat: number; lng: number; address?: string }) => {
    console.log("Location selected from map:", location);
    
    // Update coordinates
    setMapCoordinates({ lat: location.lat, lng: location.lng });
    
    // Generate a Google Maps link and update the form
    const mapLink = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
    form.setValue('map_link', mapLink, { shouldValidate: true });
    
    // If we have an address, update the address field if it's empty
    if (location.address) {
      const currentAddress = form.getValues('address');
      if (!currentAddress || currentAddress.trim() === '') {
        form.setValue('address', location.address, { shouldValidate: true });
      }
    }
  };
  
  return (
    <>
      <div className="space-y-6 md:col-span-2">
        <h3 className="text-lg font-medium flex items-center gap-2 mt-4">
          <MapPin className="h-5 w-5 text-primary" />
          Location Information
        </h3>
      </div>

      <FormField
        control={form.control}
        name="address"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>Address*</FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter your street address" 
                value={field.value} 
                onChange={(e) => handleLocationChange(e.target.value, field.onChange)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="map_link"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                Google Maps Link
              </div>
            </FormLabel>
            <div className="flex gap-2">
              <div className="flex-1">
                <FormControl>
                  <Input 
                    placeholder="Paste your Google Maps link here" 
                    value={field.value || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value);
                      
                      // Validate the map link as user types/pastes
                      if (value && (value.includes('google.com/maps') || value.includes('goo.gl/maps'))) {
                        const coordinates = extractCoordinatesFromMapLink(value);
                        if (coordinates) {
                          console.log("Valid Google Maps link, extracted coordinates:", coordinates);
                          setMapCoordinates({ lat: coordinates.lat, lng: coordinates.lng });
                        } else {
                          console.log("Warning: Could not extract coordinates from the Google Maps link");
                        }
                      }
                    }} 
                  />
                </FormControl>
              </div>
              <LocationPickerButton 
                onLocationSelected={handleMapLocationSelected}
                initialLocation={{
                  lat: mapCoordinates.lat,
                  lng: mapCoordinates.lng,
                  address: form.getValues('address'),
                  mapLink: field.value
                }}
              />
            </div>
            <FormDescription>
              <div className="flex items-start gap-2 text-amber-600 text-xs mt-1">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                <span>
                  To ensure your location appears correctly on the map, you can either:
                  1. Paste a Google Maps link, or 
                  2. Click "Pick Location on Map" to select your exact location on the map
                </span>
              </div>
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="city"
        render={({ field }) => (
          <FormItem>
            <FormLabel>City*</FormLabel>
            <FormControl>
              <Input placeholder="Enter city" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="area"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Area/Neighborhood*</FormLabel>
            <FormControl>
              <Input placeholder="Enter neighborhood or area" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default LocationSection;
