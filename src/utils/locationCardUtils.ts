
import { formatDistance } from 'date-fns';

export const parseTimeString = (timeString: string): number => {
  try {
    if (!timeString) return 0;
    const cleanTimeString = timeString.trim().toUpperCase();
    if (cleanTimeString.includes("24") && cleanTimeString.includes("HOUR")) {
      return -1; // Special code for 24 hours
    }
    let timeMatch = cleanTimeString.match(/(\d+)(?::(\d+))?\s*(AM|PM)/i);
    if (!timeMatch) {
      timeMatch = cleanTimeString.match(/(\d{1,2})[:\.](\d{2})/);
      if (timeMatch) {
        const hours = parseInt(timeMatch[1], 10);
        const minutes = parseInt(timeMatch[2], 10);
        return hours * 60 + minutes;
      }
      timeMatch = cleanTimeString.match(/(\d+)/);
      if (timeMatch) {
        const hours = parseInt(timeMatch[1], 10);
        if (hours >= 1 && hours <= 12) {
          if (hours >= 7 && hours <= 11) {
            return hours * 60; // AM
          } else {
            return (hours + 12) * 60; // PM
          }
        }
        return hours * 60;
      }
      return 0;
    }
    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const period = timeMatch[3] ? timeMatch[3].toUpperCase() : 'AM';
    if (period === 'PM' && hours < 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    const totalMinutes = hours * 60 + minutes;
    return totalMinutes;
  } catch (e) {
    console.error("Error parsing time string:", timeString, e);
    return 0;
  }
};

export const calculateOpenStatus = (recommendation: any): boolean | undefined => {
  if (recommendation.openNow === true) return true;
  if (recommendation.openNow === false) return false;
  
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', {
    weekday: 'long'
  });
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  
  if (recommendation.availability_days && Array.isArray(recommendation.availability_days)) {
    const isAvailableToday = recommendation.availability_days.some(day => {
      const normalizedCurrentDay = currentDay.trim().toLowerCase();
      const normalizedDay = String(day).trim().toLowerCase();
      const dayMatch = normalizedCurrentDay.includes(normalizedDay) || 
                      normalizedDay.includes(normalizedCurrentDay) || 
                      normalizedCurrentDay.includes('sun') && normalizedDay.includes('sun') || 
                      normalizedCurrentDay.includes('mon') && normalizedDay.includes('mon') || 
                      normalizedCurrentDay.includes('tue') && normalizedDay.includes('tue') || 
                      normalizedCurrentDay.includes('wed') && normalizedDay.includes('wed') || 
                      normalizedCurrentDay.includes('thu') && normalizedDay.includes('thu') || 
                      normalizedCurrentDay.includes('fri') && normalizedDay.includes('fri') || 
                      normalizedCurrentDay.includes('sat') && normalizedDay.includes('sat');
      return dayMatch;
    });
    
    if (!isAvailableToday) {
      return false;
    }
    
    if (recommendation.availability_start_time && recommendation.availability_end_time) {
      const startTime = parseTimeString(recommendation.availability_start_time);
      const endTime = parseTimeString(recommendation.availability_end_time);
      if (endTime < startTime) {
        return currentTimeInMinutes >= startTime || currentTimeInMinutes <= endTime;
      }
      return currentTimeInMinutes >= startTime && currentTimeInMinutes <= endTime;
    }
    return true;
  }
  
  if (recommendation.hours) {
    const hoursMatch = recommendation.hours.match(/([\d:]+\s*[AP]M)\s*-\s*([\d:]+\s*[AP]M)/i);
    if (hoursMatch) {
      const startTime = parseTimeString(hoursMatch[1]);
      const endTime = parseTimeString(hoursMatch[2]);
      if (endTime < startTime) {
        return currentTimeInMinutes >= startTime || currentTimeInMinutes <= endTime;
      }
      return currentTimeInMinutes >= startTime && currentTimeInMinutes <= endTime;
    }
  }
  
  if (recommendation.availability) {
    const availStr = recommendation.availability.toLowerCase();
    if (availStr.includes("appointment")) return false;
    
    const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    const todayIndex = daysOfWeek.findIndex(day => currentDay.toLowerCase().includes(day));
    
    if (availStr.includes("weekdays") && todayIndex >= 0 && todayIndex < 5) return true;
    if (availStr.includes("weekends") && (todayIndex === 5 || todayIndex === 6)) return true;
    if (availStr.includes("all days")) return true;
    if (availStr.includes("monday to friday") && todayIndex >= 0 && todayIndex < 5) return true;
    if (daysOfWeek.some(day => availStr.includes(day) && currentDay.toLowerCase().includes(day))) {
      return true;
    }
  }
  
  return undefined;
};

export const formatDistance = (distanceText: string | undefined) => {
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

export const formatBusinessHours = (hours: string | undefined, recommendation: any) => {
  if (!hours) {
    if (recommendation.availability_days && recommendation.availability_days.length > 0) {
      const days = recommendation.availability_days.join(', ');
      const startTime = recommendation.availability_start_time || '';
      const endTime = recommendation.availability_end_time || '';
      if (startTime && endTime) {
        return `${days}: ${startTime} - ${endTime}`;
      }
      return days;
    }
    return null;
  }
  
  if (recommendation.availability_days && recommendation.availability_days.length > 0) {
    const days = recommendation.availability_days.join(', ');
    const startTime = recommendation.availability_start_time || '';
    const endTime = recommendation.availability_end_time || '';
    if (startTime && endTime) {
      return `${days}: ${startTime} - ${endTime}`;
    }
    return days;
  }
  
  return hours;
};

export const formatDayShort = (day: string): string => {
  const dayMap: Record<string, string> = {
    'monday': 'Mon',
    'tuesday': 'Tue',
    'wednesday': 'Wed',
    'thursday': 'Thu',
    'friday': 'Fri',
    'saturday': 'Sat',
    'sunday': 'Sun'
  };
  return dayMap[day.toLowerCase()] || day;
};

export const formatPrice = (recommendation: any) => {
  if (recommendation.price_range_min && recommendation.price_range_max && recommendation.price_unit) {
    return `${recommendation.price_range_min}-${recommendation.price_range_max}/${recommendation.price_unit.replace('per ', '')}`;
  } else if (recommendation.priceLevel) {
    return recommendation.priceLevel;
  } else if (recommendation.price_level) {
    return recommendation.price_level;
  }
  return '';
};

export const hasAvailabilityInfo = (recommendation: any) => {
  return recommendation.availability_days && 
         Array.isArray(recommendation.availability_days) && 
         recommendation.availability_days.length > 0;
};

export const hasInstagram = (recommendation: any) => {
  return recommendation.instagram && 
         typeof recommendation.instagram === 'string' && 
         recommendation.instagram.trim() !== '';
};

export const formatAvailabilityDays = (recommendation: any) => {
  if (!recommendation.availability_days || recommendation.availability_days.length === 0) {
    return null;
  }
  return recommendation.availability_days.map((day: string) => formatDayShort(day)).join(', ');
};

export const getAvailabilityHoursDisplay = (recommendation: any, businessHours: string): string => {
  if (recommendation.availability_start_time && recommendation.availability_end_time) {
    return `${recommendation.availability_start_time}-${recommendation.availability_end_time}`;
  }
  return businessHours || '';
};

export const getAvailabilityDaysDisplay = (recommendation: any): React.ReactNode => {
  if (!recommendation.availability_days || recommendation.availability_days.length === 0) {
    return null;
  }
  return recommendation.availability_days.map((day: string) => formatDayShort(day)).join(', ');
};

export const getMedalStyle = (rank: number) => {
  switch (rank) {
    case 1:
      return {
        medalClass: "bg-gradient-to-b from-yellow-300 to-yellow-500 border-yellow-300 text-yellow-900 shadow h-6 w-6 text-xs",
        ribbonColor: "bg-red-500"
      };
    case 2:
      return {
        medalClass: "bg-gradient-to-b from-gray-200 to-gray-400 border-gray-200 text-gray-800 shadow h-6 w-6 text-xs",
        ribbonColor: "bg-blue-500"
      };
    case 3:
      return {
        medalClass: "bg-gradient-to-b from-amber-300 to-amber-600 border-amber-300 text-amber-900 shadow h-6 w-6 text-xs",
        ribbonColor: "bg-green-500"
      };
    default:
      return {
        medalClass: "bg-gradient-to-b from-blue-400 to-blue-600 border-blue-300 text-white shadow h-6 w-6 text-xs",
        ribbonColor: "bg-blue-300"
      };
  }
};

