
/**
 * Format availability days into a readable string
 */
export const formatAvailabilityDays = (days?: string[] | string): string => {
  if (!days || (Array.isArray(days) && days.length === 0)) {
    return 'Not specified';
  }
  
  let daysArray: string[] = [];
  
  if (Array.isArray(days)) {
    daysArray = days;
  } else if (typeof days === 'string') {
    daysArray = days.split(',').map(day => day.trim());
  }
  
  if (daysArray.length === 7) {
    return 'Every day';
  }
  
  if (daysArray.length === 5 && 
      daysArray.includes('Monday') && 
      daysArray.includes('Tuesday') && 
      daysArray.includes('Wednesday') && 
      daysArray.includes('Thursday') && 
      daysArray.includes('Friday')) {
    return 'Weekdays';
  }
  
  if (daysArray.length === 2 && 
      daysArray.includes('Saturday') && 
      daysArray.includes('Sunday')) {
    return 'Weekends';
  }
  
  return daysArray.join(', ');
};

/**
 * Check if a business is currently open based on its availability
 */
export const isOpenNow = (
  availabilityDays?: string[] | string,
  startTime?: string,
  endTime?: string
): boolean => {
  if (!availabilityDays || !startTime || !endTime) return false;

  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
  
  // Process availability days (it can be string or array)
  let days: string[] = [];
  if (Array.isArray(availabilityDays)) {
    days = availabilityDays;
  } else if (typeof availabilityDays === 'string') {
    days = availabilityDays.split(',').map(day => day.trim());
  }
  
  // Check if today is in the availability days
  if (!days.includes(currentDay)) return false;
  
  // Parse time ranges
  const formatTime = (timeStr: string): Date => {
    const [time, period] = timeStr.split(' ');
    const [hourStr, minuteStr] = time.split(':');
    let hour = parseInt(hourStr);
    const minute = parseInt(minuteStr);
    
    if (period === 'PM' && hour < 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    
    const date = new Date();
    date.setHours(hour, minute, 0, 0);
    return date;
  };
  
  const start = formatTime(startTime);
  const end = formatTime(endTime);
  
  // Return true if current time is between start and end
  return now >= start && now <= end;
};

/**
 * Format a price range to a readable string
 */
export const formatPriceRange = (min?: number, max?: number, unit?: string): string => {
  if (!min && !max) return 'Price not specified';
  
  if (min && max) {
    if (min === max) {
      return `₹${min}${unit ? ` ${unit}` : ''}`;
    }
    return `₹${min} - ₹${max}${unit ? ` ${unit}` : ''}`;
  }
  
  if (min) {
    return `From ₹${min}${unit ? ` ${unit}` : ''}`;
  }
  
  if (max) {
    return `Up to ₹${max}${unit ? ` ${unit}` : ''}`;
  }
  
  return 'Price not specified';
};
