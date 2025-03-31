
/**
 * A collection of formatting utilities for the application
 */

/**
 * Format a phone number to include spaces for better readability
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // For numbers with the +91 prefix (India)
  if (phone.startsWith('+91')) {
    const digits = phone.substring(3);
    if (digits.length === 10) {
      return `+91 ${digits.substring(0, 5)} ${digits.substring(5)}`;
    }
  }
  
  return phone;
}

/**
 * Format availability days into a readable string
 */
export function formatAvailabilityDays(days: string[] | string | null | undefined): string {
  if (!days) return 'Not specified';
  
  if (typeof days === 'string') {
    return days;
  }
  
  if (Array.isArray(days) && days.length > 0) {
    return days.join(', ');
  }
  
  return 'Not specified';
}

/**
 * Format a price range for display
 */
export function formatPriceRange(min?: number, max?: number, unit?: string): string {
  if (!min && !max) return 'Price not specified';
  
  if (min && max) {
    return `₹${min} - ₹${max} ${unit || ''}`;
  }
  
  if (min) {
    return `₹${min}+ ${unit || ''}`;
  }
  
  if (max) {
    return `Up to ₹${max} ${unit || ''}`;
  }
  
  return 'Price not specified';
}

/**
 * Check if a business/service is open now based on availability days and hours
 */
export function isOpenNow(
  availabilityDays?: string[] | string | null, 
  availabilityStartTime?: string | null, 
  availabilityEndTime?: string | null
): boolean {
  // If no availability info, assume closed
  if (!availabilityDays || !availabilityStartTime || !availabilityEndTime) {
    return false;
  }
  
  const now = new Date();
  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
  
  // Check if today is in the availability days
  let isAvailableToday = false;
  
  if (typeof availabilityDays === 'string') {
    // Handle string format
    const lowercaseDays = availabilityDays.toLowerCase();
    isAvailableToday = 
      lowercaseDays.includes('all days') || 
      lowercaseDays.includes('everyday') ||
      lowercaseDays.includes(dayOfWeek.toLowerCase());
  } else if (Array.isArray(availabilityDays)) {
    // Handle array format
    isAvailableToday = availabilityDays.some(day => 
      day.toLowerCase() === dayOfWeek.toLowerCase() ||
      day.toLowerCase() === 'all days' ||
      day.toLowerCase() === 'everyday'
    );
  }
  
  if (!isAvailableToday) return false;
  
  // Parse time
  const timeNow = now.getHours() * 60 + now.getMinutes();
  
  // Parse start time
  let startMinutes = 0;
  if (availabilityStartTime) {
    const startMatch = availabilityStartTime.match(/(\d+):(\d+)\s*([AP]M)?/i);
    if (startMatch) {
      let hours = parseInt(startMatch[1]);
      const minutes = parseInt(startMatch[2] || '0');
      const period = startMatch[3] || '';
      
      if (period.toUpperCase() === 'PM' && hours < 12) hours += 12;
      if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;
      
      startMinutes = hours * 60 + minutes;
    }
  }
  
  // Parse end time
  let endMinutes = 24 * 60; // Default to end of day
  if (availabilityEndTime) {
    const endMatch = availabilityEndTime.match(/(\d+):(\d+)\s*([AP]M)?/i);
    if (endMatch) {
      let hours = parseInt(endMatch[1]);
      const minutes = parseInt(endMatch[2] || '0');
      const period = endMatch[3] || '';
      
      if (period.toUpperCase() === 'PM' && hours < 12) hours += 12;
      if (period.toUpperCase() === 'AM' && hours === 12) hours = 0;
      
      endMinutes = hours * 60 + minutes;
    }
  }
  
  // Check if current time is within operating hours
  return timeNow >= startMinutes && timeNow <= endMinutes;
}
