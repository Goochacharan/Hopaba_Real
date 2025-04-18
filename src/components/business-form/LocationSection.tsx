
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
  
  // Function to try to geocode the address using Google Maps API
  const handleGeocodeAddress = async () => {
    const address = form.getValues('address');
    const city = form.getValues('city');
    const area = form.getValues('area');
    
    if (!address || !city) {
      toast({
        title: "Missing information",
        description: "Please enter at least address and city to look up coordinates",
        variant: "destructive",
      });
      return;
    }
    
    // Full address string
    const fullAddress = `${address}, ${area || ''}, ${city}`;
    
    setIsGeocodingAddress(true);
    toast({
      title: "Finding location...",
      description: "We're extracting coordinates from your address",
    });
    
    try {
      // Get Google Maps API key from edge function
      const { data, error } = await supabase.functions.invoke('get-google-maps-key');
      
      if (error || !data?.apiKey) {
        console.error('Error getting Google Maps API key:', error);
        toast({
          title: "Error",
          description: "Couldn't access mapping service. Please try again later or enter coordinates manually.",
          variant: "destructive",
        });
        setIsGeocodingAddress(false);
        return;
      }
      
      // Use the Geocoding API directly
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${data.apiKey}`
      );
      
      const geocodeData = await response.json();
      
      if (geocodeData.status === 'OK' && geocodeData.results && geocodeData.results.length > 0) {
        const location = geocodeData.results[0].geometry.location;
        
        form.setValue('latitude', location.lat.toString());
        form.setValue('longitude', location.lng.toString());
        
        toast({
          title: "Location found",
          description: `Coordinates found: (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})`,
        });
        
        // Generate a Google Maps link for the location and add it if map_link is empty
        if (!form.getValues('map_link')) {
          const googleMapsLink = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
          form.setValue('map_link', googleMapsLink);
          setMapLinkState('valid');
        }
      } else {
        toast({
          title: "Location not found",
          description: "Couldn't find coordinates for this address. Please check the address or enter coordinates manually.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error geocoding address:', error);
      toast({
        title: "Error",
        description: "Failed to geocode address. Please try again later or enter coordinates manually.",
        variant: "destructive",
      });
    } finally {
      setIsGeocodingAddress(false);
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
      
      <div className="md:col-span-2">
        <Button 
          type="button" 
          variant="outline" 
          className="flex items-center gap-2"
          onClick={handleGeocodeAddress}
          disabled={isGeocodingAddress}
        >
          {isGeocodingAddress ? (
            <>Finding coordinates...</>
          ) : (
            <>
              <MapIcon className="h-4 w-4" />
              Get Coordinates from Address
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground mt-1">
          Click to find your location coordinates based on the address you entered
        </p>
      </div>

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

      <div className="md:col-span-2 p-3 bg-slate-50 rounded-md border border-slate-200">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <MapIcon className="h-4 w-4" />
          <span>Coordinates (automatically extracted from Google Maps link or address)</span>
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
