
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { extractCoordinatesFromMapLink } from '@/lib/locationUtils';
import { useToast } from '@/hooks/use-toast';

/**
 * A hook that watches for changes to a map_link field and extracts coordinates
 * @param mapLinkFieldName The name of the form field containing the map link
 * @param latitudeFieldName The name of the form field to update with latitude
 * @param longitudeFieldName The name of the form field to update with longitude
 */
export function useMapLinkCoordinates(
  mapLinkFieldName: string = 'map_link',
  latitudeFieldName: string = 'latitude',
  longitudeFieldName: string = 'longitude'
) {
  // Get form context safely - will be undefined if used outside a FormProvider
  const formContext = useFormContext();
  const { toast } = useToast();
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null);
  
  useEffect(() => {
    // Only proceed if form context exists
    if (!formContext) {
      console.warn('useMapLinkCoordinates: No form context found. Make sure to use this hook within a FormProvider.');
      return;
    }

    // Get the map link value from the form
    const mapLink = formContext.watch(mapLinkFieldName);
    
    if (mapLink) {
      // Try to extract coordinates
      const coords = extractCoordinatesFromMapLink(mapLink);
      
      // If coordinates were found, update the form fields
      if (coords) {
        console.log('Extracted coordinates from map link:', coords);
        formContext.setValue(latitudeFieldName, coords.lat.toString(), { shouldValidate: true });
        formContext.setValue(longitudeFieldName, coords.lng.toString(), { shouldValidate: true });
        setCoordinates(coords);
        
        // Only show toast when coordinates change substantially
        const prevLat = formContext.getValues(latitudeFieldName);
        const prevLng = formContext.getValues(longitudeFieldName);
        
        if (!prevLat || !prevLng || 
            Math.abs(parseFloat(prevLat) - coords.lat) > 0.0001 || 
            Math.abs(parseFloat(prevLng) - coords.lng) > 0.0001) {
          toast({
            title: "Location coordinates extracted",
            description: `Your location will be shown on the map (${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)})`,
          });
        }
      }
    }
  }, [formContext, mapLinkFieldName, latitudeFieldName, longitudeFieldName, formContext?.watch(mapLinkFieldName), toast]);
  
  return {
    coordinates,
    // Helper function to get coordinates from any map link
    getCoordinatesFromLink: (mapLink: string) => extractCoordinatesFromMapLink(mapLink)
  };
}

export default useMapLinkCoordinates;
