
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
  const form = useFormContext();
  
  useEffect(() => {
    // Get the map link value from the form
    const mapLink = form.watch(mapLinkFieldName);
    
    if (mapLink) {
      // Try to extract coordinates
      const coords = extractCoordinatesFromMapLink(mapLink);
      
      // If coordinates were found, update the form fields
      if (coords) {
        form.setValue(latitudeFieldName, coords.lat.toString());
        form.setValue(longitudeFieldName, coords.lng.toString());
      }
    }
  }, [form.watch(mapLinkFieldName)]);
  
  return null;
}

export default useMapLinkCoordinates;
