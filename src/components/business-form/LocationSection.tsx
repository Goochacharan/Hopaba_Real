
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
import { MapPin, Link2 } from 'lucide-react';
import { BusinessFormValues } from '../AddBusinessForm';
import { useMapLinkCoordinates } from '@/hooks/useMapLinkCoordinates';

const LocationSection = () => {
  const form = useFormContext<BusinessFormValues>();
  
  // Use the custom hook to automatically extract coordinates from map_link
  useMapLinkCoordinates('map_link', 'latitude', 'longitude');
  
  const handleLocationChange = (value: string, onChange: (value: string) => void) => {
    // Check if the input is a Google Maps URL
    if (value.includes('google.com/maps') || value.includes('goo.gl/maps')) {
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
                {...field} 
              />
            </FormControl>
            <FormDescription>
              This link will be used for the directions button on your listing. 
              Coordinates will be automatically extracted from this link.
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

      <FormField
        control={form.control}
        name="postal_code"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Postal/ZIP Code</FormLabel>
            <FormControl>
              <Input placeholder="Enter postal code" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Hidden fields for latitude and longitude that will be auto-populated */}
      <FormField
        control={form.control}
        name="latitude"
        render={({ field }) => (
          <FormItem className="hidden">
            <FormControl>
              <Input {...field} />
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="longitude"
        render={({ field }) => (
          <FormItem className="hidden">
            <FormControl>
              <Input {...field} />
            </FormControl>
          </FormItem>
        )}
      />
    </>
  );
};

export default LocationSection;
