
// Utility function to parse time string into minutes since midnight
export const parseTimeString = (timeString: string): number => {
  try {
    const [time, period] = timeString.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    return (hours * 60) + minutes;
  } catch (e) {
    console.error("Error parsing time string:", timeString, e);
    return 0;
  }
};

// Utility function to format distance text
export const formatDistance = (distanceText: string | undefined): string => {
  if (!distanceText) return '';
  
  const distanceMatch = distanceText.match(/(\d+(\.\d+)?)/);
  if (distanceMatch) {
    const distanceValue = parseFloat(distanceMatch[0]);
    return `${distanceValue.toFixed(1)} km away`;
  }
  
  let formattedDistance = distanceText.replace('miles', 'km');
  formattedDistance = formattedDistance.replace('away away', 'away');
  return formattedDistance;
};

// Utility function to check if business is open now
export const checkOpenStatus = (
  availabilityDays?: string[], 
  startTime?: string, 
  endTime?: string, 
  openNow?: boolean,
  hasHours?: boolean
): boolean | undefined => {
  if (openNow === true) return true;
  if (openNow === false) return false;
  
  // Check if the business is open based on availability days and time
  if (availabilityDays && availabilityDays.length > 0) {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    // Check if current day is in the availability days
    const lowerAvailableDays = availabilityDays.map(day => day.toLowerCase());
    const isAvailableToday = lowerAvailableDays.some(day => 
      currentDay.includes(day) || day.includes(currentDay)
    );
    
    if (!isAvailableToday) return false;
    
    // If available today, check if current time is within operating hours
    if (startTime && endTime) {
      const startMinutes = parseTimeString(startTime);
      const endMinutes = parseTimeString(endTime);
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      const currentTimeInMinutes = (currentHour * 60) + currentMinute;
      
      return currentTimeInMinutes >= startMinutes && currentTimeInMinutes <= endMinutes;
    }
    
    return true; // Available today but no specific hours
  }
  
  if (hasHours) {
    return true; // Default to open if hours are listed but not specific availability days
  }
  
  return undefined; // Status unknown
};
