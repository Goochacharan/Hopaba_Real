
/**
 * Extracts the city name from a location string
 * Assumes format: "Area, City" or similar
 */
export const extractCityFromText = (location: string): string => {
  if (!location) return '';
  
  const parts = location.split(',');
  if (parts.length > 1) {
    return parts[1].trim();
  }
  
  return location.trim();
};

/**
 * Extracts city from location text or object
 * Used for filtering and display
 */
export const extractLocationCity = (location: string | any): string => {
  if (!location) return '';
  
  // If location is a string, use extractCityFromText
  if (typeof location === 'string') {
    return extractCityFromText(location);
  }
  
  // If location is an object with a location property
  if (location.location && typeof location.location === 'string') {
    return extractCityFromText(location.location);
  }
  
  // Fall back to city property if it exists
  if (location.city) {
    return location.city;
  }
  
  return '';
};

/**
 * Extracts coordinates from Google Maps link
 */
export const extractCoordinatesFromMapLink = (mapLink: string): { lat: number, lng: number } | null => {
  if (!mapLink) return null;

  // Try to match the "?q=" format (common in shared links)
  let match = mapLink.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
  
  // If not found, try the "@" format (common in map URLs)
  if (!match) {
    match = mapLink.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  }
  
  if (match && match.length >= 3) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    
    if (!isNaN(lat) && !isNaN(lng)) {
      return { lat, lng };
    }
  }
  
  return null;
};

/**
 * Calculate distance between two points (haversine formula)
 * 
 * @param lat1 latitude of first point
 * @param lon1 longitude of first point
 * @param lat2 latitude of second point
 * @param lon2 longitude of second point
 * @param unit 'K' for kilometers, 'N' for nautical miles, 'M' for miles
 * @returns distance in the specified unit (default: kilometers)
 */
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  unit: 'K' | 'N' | 'M' = 'K'
): number => {
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  }

  const radlat1 = (Math.PI * lat1) / 180;
  const radlat2 = (Math.PI * lat2) / 180;
  const theta = lon1 - lon2;
  const radtheta = (Math.PI * theta) / 180;
  
  let dist =
    Math.sin(radlat1) * Math.sin(radlat2) +
    Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  
  if (dist > 1) {
    dist = 1;
  }
  
  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515; // Miles
  
  if (unit === 'K') {
    dist = dist * 1.609344; // Convert to kilometers
  } else if (unit === 'N') {
    dist = dist * 0.8684; // Convert to nautical miles
  }
  
  return dist;
};

/**
 * Geocode an address to get coordinates
 */
export const geocodeAddress = async (address: string): Promise<{lat: number, lng: number} | null> => {
  try {
    // This is a placeholder. In a real implementation, you'd use a geocoding API
    console.log(`Geocoding address: ${address}`);
    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};
