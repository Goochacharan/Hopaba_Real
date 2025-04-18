
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { extractCoordinatesFromMapLink } from '@/lib/locationUtils';

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
        formContext.setValue(latitudeFieldName, coords.lat.toString());
        formContext.setValue(longitudeFieldName, coords.lng.toString());
      }
    }
  }, [formContext, mapLinkFieldName, latitudeFieldName, longitudeFieldName, formContext?.watch(mapLinkFieldName)]);
}

export default useMapLinkCoordinates;
