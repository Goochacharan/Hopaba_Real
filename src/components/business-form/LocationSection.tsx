
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
import { MapPin, Link2, MapIcon, Check } from 'lucide-react';
import { BusinessFormValues } from '../AddBusinessForm';
import { useMapLinkCoordinates } from '@/hooks/useMapLinkCoordinates';
import { extractCoordinatesFromMapLink } from '@/lib/locationUtils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const LocationSection = () => {
  const form = useFormContext<BusinessFormValues>();
  const { toast } = useToast();
  const [mapLinkState, setMapLinkState] = useState<'none' | 'checking' | 'valid' | 'invalid'>('none');
  const [isGeocodingAddress, setIsGeocodingAddress] = useState(false);
  
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
  
  const handleMapLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setValue('map_link', value);
    
    // Try to extract coordinates immediately for feedback
    if (value) {
      setMapLinkState('checking');
      setTimeout(() => {
        const coords = extractCoordinatesFromMapLink(value);
        if (coords) {
          form.setValue('latitude', coords.lat.toString());
          form.setValue('longitude', coords.lng.toString());
          setMapLinkState('valid');
          
          toast({
            title: "Coordinates extracted",
            description: `Latitude: ${coords.lat.toFixed(6)}, Longitude: ${coords.lng.toFixed(6)}`,
          });
        } else {
          setMapLinkState('invalid');
        }
      }, 300);
    } else {
      setMapLinkState('none');
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
        name="map_link"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                Google Maps Link
              </div>
            </FormLabel>
            <div className="relative">
              <FormControl>
                <Input 
                  placeholder="Paste your Google Maps link here" 
                  value={field.value} 
                  onChange={handleMapLinkChange}
                  className={mapLinkState === 'valid' ? 'pr-10 border-green-500' : 'pr-10'}
                />
              </FormControl>
              {mapLinkState === 'valid' && (
                <Check className="absolute right-3 top-3 h-4 w-4 text-green-500" />
              )}
            </div>
            <FormDescription className="flex justify-between items-center">
              <span>
                This link will be used for the directions button on your listing. 
                Coordinates will be automatically extracted from this link.
              </span>
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
            <FormLabel>Postal/ZIP Code*</FormLabel>
            <FormControl>
              <Input placeholder="Enter postal code (required)" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="md:col-span-2 p-3 bg-slate-50 rounded-md border border-slate-200">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <MapIcon className="h-4 w-4" />
          <span>Coordinates (automatically extracted from Google Maps link)</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="latitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitude</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-slate-100" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="longitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitude</FormLabel>
                <FormControl>
                  <Input {...field} className="bg-slate-100" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </>
  );
};

export default LocationSection;
