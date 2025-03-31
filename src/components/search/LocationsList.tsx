import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Clock, ChevronRight } from 'lucide-react';
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
  if (business.availability_days) {
    if (isValidAvailabilityDays(business.availability_days)) {
      return business.availability_days.join(', ');
    } else if (isValidAvailabilityDaysString(business.availability_days)) {
      return business.availability_days;
    }
  }
  
  return "Hours not specified";
};

// Update the interface to include recommendations
export interface LocationsListProps {
  recommendations: Recommendation[];
  showHeader?: boolean;
  isLoading?: boolean;
  emptyMessage?: string;
}

const LocationsList: React.FC<LocationsListProps> = ({ recommendations, showHeader = true, isLoading = false, emptyMessage = "No locations found." }) => {
  const navigate = useNavigate();
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} className="overflow-hidden animate-pulse">
            <div className="h-20 bg-gray-200"></div>
            <CardContent className="p-4 space-y-3">
              <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
              <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
              <div className="h-3 w-2/3 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      {recommendations.map((location) => {
        const hours = formatBusinessHours(location);
        const isOpen = isOpenNow(location);
        
        return (
          <Card 
            key={location.id} 
            className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(`/business/${location.id}`)}
          >
            <div className="flex">
              <div className="w-24 h-24 shrink-0 bg-gray-100 relative overflow-hidden">
                <img 
                  src={location.image_url || "https://images.unsplash.com/photo-1473093295043-cdd812d0e601"} 
                  alt={location.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1473093295043-cdd812d0e601";
                  }}
                />
                {location.category && (
                  <Badge className="absolute bottom-1 left-1 text-xs px-1 py-0">
                    {location.category}
                  </Badge>
                )}
              </div>
              
              <CardContent className="py-2 px-3 flex-1">
                <div className="flex justify-between">
                  <div className="space-y-1">
                    <h3 className="font-medium text-sm line-clamp-1">{location.name}</h3>
                    
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      <span className="line-clamp-1">{location.area}, {location.city}</span>
                    </div>
                    
                    {hours && (
                      <div className="flex items-center gap-1 text-xs">
                        <Clock className="h-3 w-3" />
                        <span className={cn(
                          "line-clamp-1",
                          isOpen ? "text-green-600" : "text-red-500"
                        )}>
                          {isOpen ? "Open Now" : "Closed"}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

export default LocationsList;
