
import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { extractCoordinatesFromMapLink } from '@/lib/locationUtils';
import LocationPickerButton from './LocationPickerButton';

// List of Indian cities for dropdown
const INDIAN_CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", 
  "Kolkata", "Surat", "Pune", "Jaipur", "Lucknow", "Kanpur", 
  "Nagpur", "Indore", "Bhopal", "Visakhapatnam", "Patna", "Gwalior"
];

interface MarketplaceLocationSectionProps {
  formName: string;
}

const MarketplaceLocationSection = ({ formName }: MarketplaceLocationSectionProps) => {
  const form = useFormContext<any>();
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
  
  const handleMapLocationSelected = (location: { lat: number; lng: number; address?: string }) => {
    console.log("Location selected from map:", location);
    
    // Update coordinates
    setMapCoordinates({ lat: location.lat, lng: location.lng });
    
    // Generate a Google Maps link and update the form
    const mapLink = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
    form.setValue('map_link', mapLink, { shouldValidate: true });
    
    // If we have an address, update the location field if it's empty
    if (location.address) {
      const currentLocation = form.getValues('location');
      if (!currentLocation || currentLocation.trim() === '') {
        form.setValue('location', location.address, { shouldValidate: true });
      }
      
      // Try to extract area from the address if it contains commas
      if (location.address.includes(',')) {
        const addressParts = location.address.split(',');
        if (addressParts.length > 2) {
          // Use the second part as area (first part is usually the specific location)
          const possibleArea = addressParts[1].trim();
          const currentArea = form.getValues('area');
          if (!currentArea || currentArea.trim() === '') {
            form.setValue('area', possibleArea, { shouldValidate: true });
          }
        }
      }
    }
  };
  
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="area"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Area*</FormLabel>
              <FormControl>
                <Input placeholder="Enter your area" {...field} />
              </FormControl>
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
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {INDIAN_CITIES.map(city => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="postal_code"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Postal Code*</FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter 6-digit postal code" 
                {...field} 
                maxLength={6}
              />
            </FormControl>
            <FormDescription>
              Enter a valid 6-digit Indian postal code
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="map_link"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Location on Map</FormLabel>
            <div className="flex gap-2">
              <div className="flex-1">
                <FormControl>
                  <Input
                    placeholder="Paste your Google Maps link here"
                    value={field.value || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      field.onChange(value);
                      
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
                  address: form.getValues('location'),
                  mapLink: field.value
                }}
              />
            </div>
            <FormDescription>
              Select your exact location on the map to help buyers find your item easily
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default MarketplaceLocationSection;
