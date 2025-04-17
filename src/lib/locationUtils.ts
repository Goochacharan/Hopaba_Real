
/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @param unit 'K' for kilometers, 'M' for miles, 'N' for nautical miles
 * @returns Distance in specified unit
 */
export function calculateDistance(
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number, 
  unit: 'K' | 'M' | 'N' = 'K'
): number {
  if ((lat1 === lat2) && (lon1 === lon2)) {
    return 0;
  }
  
  const radlat1 = Math.PI * lat1 / 180;
  const radlat2 = Math.PI * lat2 / 180;
  const theta = lon1 - lon2;
  const radtheta = Math.PI * theta / 180;
  
  let dist = Math.sin(radlat1) * Math.sin(radlat2) + 
             Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  
  if (dist > 1) {
    dist = 1;
  }
  
  dist = Math.acos(dist);
  dist = dist * 180 / Math.PI;
  dist = dist * 60 * 1.1515; // Distance in miles
  
  if (unit === 'K') { 
    dist = dist * 1.609344; // Convert to kilometers
  } else if (unit === 'N') { 
    dist = dist * 0.8684; // Convert to nautical miles
  }
  
  return Math.round(dist * 10) / 10; // Round to 1 decimal place
}

/**
 * Geocode an address to get coordinates
 * @param address Address string to geocode
 * @returns Promise with lat/lng or null if geocoding failed
 */
export async function geocodeAddress(address: string): Promise<{lat: number, lng: number} | null> {
  try {
    // This is a placeholder. You would need to implement a real geocoding service.
    // For example, using Mapbox's geocoding API or Google Maps Geocoding API
    console.log('Geocoding address:', address);
    
    // For demo purposes, return some dummy coordinates based on the address string
    // In a real implementation, you would call an actual geocoding service
    if (address === 'Current Location') {
      return null; // Current location is handled separately via browser geolocation
    }
    
    if (address.toLowerCase().includes('bengaluru') || address.toLowerCase().includes('bangalore')) {
      return { lat: 12.9716, lng: 77.5946 };
    }
    
    // Fallback to dummy coordinates
    return { lat: 12.9716, lng: 77.5946 };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/**
 * Format distance for display
 * @param distance Distance value
 * @param unit Unit of distance ('km' or 'mi')
 * @returns Formatted distance string
 */
export function formatDistance(distance: number, unit: 'km' | 'mi' = 'km'): string {
  if (distance < 1) {
    return `${(distance * 1000).toFixed(0)} m`;
  }
  return `${distance.toFixed(1)} ${unit}`;
}
