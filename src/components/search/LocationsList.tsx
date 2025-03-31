
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Clock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatAvailabilityDays, isOpenNow } from '@/lib/formatters';

interface BusinessLocation {
  id: string;
  name: string;
  category?: string;
  address: string;
  area?: string;
  city?: string;
  image_url?: string;
  rating?: number;
  distance?: string;
  availability_days?: string[] | string;
  availability_start_time?: string;
  availability_end_time?: string;
  hours?: string;
}

// Update the interface to include recommendations
export interface LocationsListProps {
  recommendations: BusinessLocation[];
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
        const hours = location.hours || (location.availability_start_time && location.availability_end_time 
          ? `${location.availability_start_time} - ${location.availability_end_time}` 
          : null);
          
        const isOpen = isOpenNow(
          location.availability_days,
          location.availability_start_time,
          location.availability_end_time
        );
        
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
