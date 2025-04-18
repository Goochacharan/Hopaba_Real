
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
 * Extracts city from location text
 * Used for filtering and display
 */
export const extractLocationCity = (location: string): string => {
  if (!location) return '';
  
  const parts = location.split(',');
  if (parts.length > 1) {
    return parts[1].trim();
  }
  
  return location.trim();
};
