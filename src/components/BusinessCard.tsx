
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin, Clock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Helper functions to safely process availability_days
const isValidAvailabilityDays = (days: any): days is string[] => {
  return Array.isArray(days) && days.length > 0;
};

const isValidAvailabilityDaysString = (days: any): days is string => {
  return typeof days === 'string' && days.trim().length > 0;
};

// Function to check if a business is open now based on availability_days
const isOpenNow = (business: any): boolean => {
  if (!business) {
    return false;
  }
  
  if (
    (Array.isArray(business.availability_days) && business.availability_days.length === 0) || 
    (typeof business.availability_days === 'string' && business.availability_days.trim() === '')
  ) {
    return false;
  }
  
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = new Date().getDay(); // 0 is Sunday, 1 is Monday, etc.
  const currentDayName = daysOfWeek[today];
  
  // Check if today is in the availability_days
  if (isValidAvailabilityDays(business.availability_days)) {
    const isOpen = business.availability_days.some((day: string) => 
      day.toLowerCase() === currentDayName
    );
    return isOpen;
  } else if (isValidAvailabilityDaysString(business.availability_days)) {
    const availabilityDaysArray = business.availability_days
      .split(',')
      .map((day: string) => day.trim().toLowerCase());
    
    const isOpen = availabilityDaysArray.includes(currentDayName);
    return isOpen;
  }
  
  return false;
};

// Format business hours
const formatBusinessHours = (business: any): string | null => {
  if (!business) {
    return null;
  }
  
  // Check for specific hours format first
  if (business.hours && typeof business.hours === 'string') {
    return business.hours;
  }
  
  // Check for start and end times
  if (business.availability_start_time && business.availability_end_time) {
    return `${business.availability_start_time} - ${business.availability_end_time}`;
  }
  
  // If no specific hours, check for availability_days
  const formatAvailabilityDays = (business: any): string | null => {
    if (!business) {
      return null;
    }
    
    if (isValidAvailabilityDays(business.availability_days)) {
      return business.availability_days.join(', ');
    } else if (isValidAvailabilityDaysString(business.availability_days)) {
      return business.availability_days;
    }
    
    return null;
  };
  
  // If we have availability_days, use that
  if (business.availability_days) {
    if (isValidAvailabilityDays(business.availability_days) && business.availability_days.length > 0) {
      const days = business.availability_days.join(', ');
      return days;
    } else if (isValidAvailabilityDaysString(business.availability_days)) {
      return business.availability_days;
    }
  }
  
  return "Hours not specified";
};

// Format price range
const formatPriceRange = (min?: number | null, max?: number | null, unit?: string | null): string => {
  if (!min && !max) return "Price not specified";
  
  if (min && max) {
    return `₹${min} - ₹${max} ${unit || ''}`;
  } else if (min) {
    return `From ₹${min} ${unit || ''}`;
  } else if (max) {
    return `Up to ₹${max} ${unit || ''}`;
  }
  
  return "Price not specified";
};

interface BusinessCardProps {
  business: any;
  onClick?: () => void;
  className?: string;
}

const BusinessCard: React.FC<BusinessCardProps> = ({ 
  business, 
  onClick,
  className = ''
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [displayImage, setDisplayImage] = useState(business.image_url || "https://images.unsplash.com/photo-1473093295043-cdd812d0e601");
  const navigate = useNavigate();
  
  const handleImageError = () => {
    setDisplayImage("https://images.unsplash.com/photo-1473093295043-cdd812d0e601");
    setImageLoaded(true);
  };
  
  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/business/${business.id}`);
    }
  };
  
  const priceRange = formatPriceRange(
    business.price_range_min, 
    business.price_range_max, 
    business.price_unit
  );
  
  const hours = formatBusinessHours(business);
  const isOpen = isOpenNow(business);
  
  return (
    <Card 
      className={cn(
        "hover:shadow-md transition-shadow overflow-hidden cursor-pointer",
        className
      )}
      onClick={handleCardClick}
    >
      <div className="relative">
        <div className="w-full h-40 bg-gray-200 relative overflow-hidden">
          <img
            src={displayImage}
            alt={business.name}
            className={cn(
              "w-full h-full object-cover transition-all duration-200",
              !imageLoaded && "opacity-0 blur-md",
              imageLoaded && "opacity-100"
            )}
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
          />
          
          {business.category && (
            <Badge className="absolute bottom-2 left-2 bg-primary/80 hover:bg-primary">
              {business.category}
            </Badge>
          )}
        </div>
      </div>
      
      <CardContent className="pt-3 pb-4">
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-base line-clamp-1">
              {business.name}
            </h3>
            
            {business.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium">{business.rating}</span>
              </div>
            )}
          </div>
          
          {business.area && business.city && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="line-clamp-1">{business.area}, {business.city}</span>
            </div>
          )}
          
          {hours && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3 w-3 flex-shrink-0" />
              <span className={cn(
                "line-clamp-1",
                isOpen ? "text-green-600" : "text-red-500"
              )}>
                {isOpen ? `Open Now (${hours})` : `Closed (${hours})`}
              </span>
            </div>
          )}
          
          {priceRange && priceRange !== "Price not specified" && (
            <div className="text-xs">
              <span className="font-medium">Price:</span> {priceRange}
            </div>
          )}
          
          <div className="flex justify-end items-center pt-1">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessCard;
