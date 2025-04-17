
import React, { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { extractCoordinatesFromMapLink } from '@/lib/locationUtils';

/**
 * Helper component that extracts coordinates from a map link
 * and updates the form values accordingly.
 */
const MapLinkExtractor: React.FC = () => {
  const form = useFormContext();
  
  useEffect(() => {
    const mapLink = form.watch('map_link');
    
    if (mapLink) {
      const coords = extractCoordinatesFromMapLink(mapLink);
      if (coords) {
        form.setValue('latitude', coords.lat.toString());
        form.setValue('longitude', coords.lng.toString());
      }
    }
  }, [form.watch('map_link')]);
  
  // This component doesn't render anything
  return null;
};

export default MapLinkExtractor;
