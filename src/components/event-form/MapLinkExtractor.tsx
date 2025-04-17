
import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { extractCoordinatesFromMapLink } from '@/lib/locationUtils';

/**
 * Helper component that extracts coordinates from a map link
 * and updates the form values accordingly.
 */
const MapLinkExtractor: React.FC = () => {
  const formContext = useFormContext();
  
  useEffect(() => {
    // Only proceed if form context exists
    if (!formContext) {
      console.warn('MapLinkExtractor: No form context found. Make sure to use this component within a FormProvider.');
      return;
    }
    
    const mapLink = formContext.watch('map_link');
    
    if (mapLink) {
      const coords = extractCoordinatesFromMapLink(mapLink);
      if (coords) {
        formContext.setValue('latitude', coords.lat.toString());
        formContext.setValue('longitude', coords.lng.toString());
      }
    }
  }, [formContext, formContext?.watch('map_link')]);
  
  // This component doesn't render anything
  return null;
};

export default MapLinkExtractor;
