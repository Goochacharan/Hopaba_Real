
import React from 'react';
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

const LocationSection = () => {
  const form = useFormContext<BusinessFormValues>();
  
  const handleLocationChange = (value: string, onChange: (value: string) => void) => {
    // Check if the input is a Google Maps URL
    if (value.includes('google.com/maps') || value.includes('goo.gl/maps')) {
      // Extract coordinates for validation
      const coordinates = extractCoordinatesFromMapLink(value);
      if (coordinates) {
        console.log("Successfully extracted coordinates:", coordinates);
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
                    } else {
                      console.log("Warning: Could not extract coordinates from the Google Maps link");
                    }
                  }
                }} 
              />
            </FormControl>
            <FormDescription>
              <div className="flex items-start gap-2 text-amber-600 text-xs mt-1">
                <AlertCircle className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                <span>
                  To ensure your location appears correctly on the map, please share your location from Google Maps using these steps: 
                  1. Open Google Maps and find your location 
                  2. Click on "Share" 
                  3. Copy the link and paste it here
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
