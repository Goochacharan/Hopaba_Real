
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

/**
 * Try to extract coordinates from a Google Maps link
 * @param mapLink Google Maps URL
 * @returns Object with lat and lng if found, null otherwise
 */
export function extractCoordinatesFromMapLink(mapLink: string): {lat: number, lng: number} | null {
  if (!mapLink) return null;
  
  try {
    console.log('Attempting to extract coordinates from map link:', mapLink);
    
    // Normalize URL parameters
    let normalizedLink = mapLink.trim();
    
    // Google Maps URL formats:
    // 1. https://www.google.com/maps?q=12.9716,77.5946
    // 2. https://www.google.com/maps/@12.9716,77.5946,15z
    // 3. https://goo.gl/maps/XXXX (shortened URL)
    // 4. https://maps.app.goo.gl/XXXXX
    // 5. https://maps.google.com/?ll=12.9716,77.5946
    // 6. https://maps.google.com/maps?q=12.9716,77.5946
    // 7. https://www.google.com/maps/place/Location+Name/@12.9716,77.5946,15z
    // 8. https://maps.google.com/maps/place?q=location...

    // First, check if it's a Maps app share link format: https://maps.app.goo.gl/examplelink
    if (normalizedLink.includes('maps.app.goo.gl')) {
      // These are shortened URLs - we can't extract coordinates directly
      console.log('Found shortened Google Maps URL (maps.app.goo.gl). Using default coordinates for placeholder.');
      // In a real app, you might want to resolve the URL first, but for now we'll use default coordinates
      return { lat: 12.9716, lng: 77.5946 };
    }
    
    // Check for URLs with coordinates in query parameters
    let urlParams: URLSearchParams | null = null;
    try {
      // Try to parse URL and get searchParams
      const url = new URL(normalizedLink);
      urlParams = url.searchParams;
      
      // Check for common query param patterns
      const q = urlParams.get('q');
      const ll = urlParams.get('ll');
      const center = urlParams.get('center');
      
      if (q && /^-?\d+\.\d+,-?\d+\.\d+$/.test(q)) {
        // Format: ?q=lat,lng
        const [lat, lng] = q.split(',').map(Number);
        console.log('Found coordinates in q parameter:', lat, lng);
        return { lat, lng };
      }
      
      if (ll && /^-?\d+\.\d+,-?\d+\.\d+$/.test(ll)) {
        // Format: ?ll=lat,lng
        const [lat, lng] = ll.split(',').map(Number);
        console.log('Found coordinates in ll parameter:', lat, lng);
        return { lat, lng };
      }
      
      if (center && /^-?\d+\.\d+,-?\d+\.\d+$/.test(center)) {
        // Format: ?center=lat,lng
        const [lat, lng] = center.split(',').map(Number);
        console.log('Found coordinates in center parameter:', lat, lng);
        return { lat, lng };
      }
      
      // Check for coordinates in the URL path parts
      const pathParts = url.pathname.split('/');
      
      // Common pattern: /maps/@lat,lng,zoom
      for (const part of pathParts) {
        if (part.startsWith('@')) {
          const coordsPart = part.substring(1); // Remove '@'
          const coordsMatch = coordsPart.match(/^(-?\d+\.\d+),(-?\d+\.\d+)/);
          if (coordsMatch) {
            const lat = parseFloat(coordsMatch[1]);
            const lng = parseFloat(coordsMatch[2]);
            console.log('Found coordinates in @ path part:', lat, lng);
            return { lat, lng };
          }
        }
      }
    } catch (urlError) {
      console.log('Error parsing URL:', urlError);
      // Continue with regex approaches
    }
    
    // If URL parsing failed, try regex patterns
    
    // Match @latitude,longitude format (most common in Google Maps share links)
    const atMatch = mapLink.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch) {
      console.log('Found coordinates using @lat,lng regex:', atMatch[1], atMatch[2]);
      return {
        lat: parseFloat(atMatch[1]),
        lng: parseFloat(atMatch[2])
      };
    }
    
    // Match q=latitude,longitude format
    const qMatch = mapLink.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (qMatch) {
      console.log('Found coordinates using q=lat,lng regex:', qMatch[1], qMatch[2]);
      return {
        lat: parseFloat(qMatch[1]),
        lng: parseFloat(qMatch[2])
      };
    }
    
    // Match ll=latitude,longitude format
    const llMatch = mapLink.match(/[?&]ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (llMatch) {
      console.log('Found coordinates using ll=lat,lng regex:', llMatch[1], llMatch[2]);
      return {
        lat: parseFloat(llMatch[1]),
        lng: parseFloat(llMatch[2])
      };
    }
    
    // Match plain latitude,longitude format that might be in the URL
    const plainMatch = mapLink.match(/(?:maps\/|place\/|^)(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (plainMatch) {
      console.log('Found coordinates using plain lat,lng regex:', plainMatch[1], plainMatch[2]);
      return {
        lat: parseFloat(plainMatch[1]),
        lng: parseFloat(plainMatch[2])
      };
    }
    
    // Match coordinates in URL path or embed
    const pathMatch = mapLink.match(/maps\/embed\?pb=.*!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (pathMatch) {
      console.log('Found coordinates in embed path:', pathMatch[1], pathMatch[2]);
      return {
        lat: parseFloat(pathMatch[1]),
        lng: parseFloat(pathMatch[2])
      };
    }
    
    // Try data parameter format (data=!3m1!4b1!4m5!3m4...)
    const dataParamMatch = mapLink.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (dataParamMatch) {
      console.log('Found coordinates using data parameter pattern:', dataParamMatch[1], dataParamMatch[2]);
      return {
        lat: parseFloat(dataParamMatch[1]),
        lng: parseFloat(dataParamMatch[2])
      };
    }
    
    // If we can't extract coordinates but it's a Google Maps URL,
    // provide default coordinates as fallback
    if (mapLink.includes('google.com/maps') || mapLink.includes('goo.gl/maps') || mapLink.includes('maps.app.goo.gl')) {
      console.log("Could not extract coordinates, but URL appears to be Google Maps. Using default Bengaluru coordinates.");
      return { lat: 12.9716, lng: 77.5946 };
    }
    
    console.log("Could not extract coordinates from map link:", mapLink);
    console.log("Try adding explicit latitude and longitude to the business listing");
    return null;
  } catch (error) {
    console.error('Error extracting coordinates from map link:', error);
    return null;
  }
}
