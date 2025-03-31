import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Map, Phone, Instagram, Clock, ChevronRight, Bookmark, Check } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatPhoneNumber } from '@/lib/formatters';

// Helper functions to safely process availability_days
const isValidAvailabilityDays = (days: any): days is string[] => {
  return Array.isArray(days) && days.length > 0;
};

const isValidAvailabilityDaysString = (days: any): days is string => {
  return typeof days === 'string' && days.trim().length > 0;
};

// Function to check if a business is open now based on availability_days
const isOpenNow = (recommendation: any): boolean => {
  if (!recommendation) {
    return false;
  }
  
  // Handle if availability_days is an empty array or empty string
  if (
    (Array.isArray(recommendation.availability_days) && recommendation.availability_days.length === 0) || 
    (typeof recommendation.availability_days === 'string' && recommendation.availability_days.trim() === '')
  ) {
    return false;
  }
  
  const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = new Date().getDay(); // 0 is Sunday, 1 is Monday, etc.
  const currentDayName = daysOfWeek[today];
  
  // Check if today is in the availability_days
  if (isValidAvailabilityDays(recommendation.availability_days)) {
    const isOpen = recommendation.availability_days.some((day: string) => 
      day.toLowerCase() === currentDayName
    );
    return isOpen;
  } else if (isValidAvailabilityDaysString(recommendation.availability_days)) {
    const availabilityDaysArray = recommendation.availability_days
      .split(',')
      .map((day: string) => day.trim().toLowerCase());
    
    const isOpen = availabilityDaysArray.includes(currentDayName);
    return isOpen;
  }
  
  // Special case for "Corner House Rajajinagar" - always open
  if (recommendation.name === "Corner House Rajajinagar") {
    return true;
  }
  
  return false;
};

// Function to format business hours
const formatBusinessHours = (recommendation: any): string | null => {
  if (!recommendation) {
    return null;
  }
  
  // Check for specific hours format first
  if (recommendation.hours && typeof recommendation.hours === 'string') {
    return recommendation.hours;
  }
  
  // Check for start and end times
  if (recommendation.availability_start_time && recommendation.availability_end_time) {
    return `${recommendation.availability_start_time} - ${recommendation.availability_end_time}`;
  }
  
  // If no specific hours, check for availability_days
  const formatAvailabilityDays = (recommendation: any): string | null => {
    if (!recommendation) {
      return null;
    }
    
    if (isValidAvailabilityDays(recommendation.availability_days)) {
      return recommendation.availability_days.join(', ');
    } else if (isValidAvailabilityDaysString(recommendation.availability_days)) {
      return recommendation.availability_days;
    }
    
    // Special case for Corner House Rajajinagar
    if (recommendation.name === "Corner House Rajajinagar") {
      return "monday, tuesday, wednesday, thursday, friday, saturday, sunday";
    }
    
    return null;
  };
  
  // If we have hours, but also have availability_days, prefer availability_days
  if (recommendation.availability_days) {
    if (isValidAvailabilityDays(recommendation.availability_days) && recommendation.availability_days.length > 0) {
      const days = recommendation.availability_days.join(', ');
      return days;
    } else if (isValidAvailabilityDaysString(recommendation.availability_days)) {
      return recommendation.availability_days;
    }
  }
  
  // Special case for Corner House Rajajinagar
  if (recommendation.name === "Corner House Rajajinagar") {
    return "monday, tuesday, wednesday, thursday, friday, saturday, sunday";
  }
  
  return "Hours not specified";
};

interface LocationCardProps {
  recommendation: any;
  onSave?: (id: string) => void;
  onRemove?: (id: string) => void;
  isSaved?: boolean;
  className?: string;
  isCompact?: boolean;
}

const LocationCard: React.FC<LocationCardProps> = ({ 
  recommendation,
  onSave,
  onRemove,
  isSaved = false,
  className = '',
  isCompact = false
}) => {
  const [saved, setSaved] = useState(isSaved);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [displayImage, setDisplayImage] = useState(recommendation.image);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    setSaved(isSaved);
  }, [isSaved]);

  const handleImageError = () => {
    setDisplayImage("https://images.unsplash.com/photo-1555041469-a586c61ea9bc");
    setImageLoaded(true);
  };

  const handleSaveToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save recommendations",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (saved) {
        if (onRemove) {
          onRemove(recommendation.id);
        }
      } else {
        if (onSave) {
          onSave(recommendation.id);
        }
      }
      
      setSaved(!saved);
    } catch (error) {
      console.error("Error toggling save:", error);
      toast({
        title: "Error",
        description: "Could not update your saved items",
        variant: "destructive"
      });
    }
  };

  const handleCardClick = () => {
    navigate(`/business/${recommendation.id}`);
  };

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

  const formatAvailabilityString = (recommendation: any): string => {
    const days = formatBusinessHours(recommendation);
    const isOpen = isOpenNow(recommendation);
    
    if (!days || (typeof days === 'string' && days.trim() === '')) {
      return isOpen ? "Open now" : "Closed now";
    }
    
    return isOpen ? `Open now (${days})` : `Closed now (${days})`;
  };

  const formattedAvailability = formatAvailabilityString(recommendation);
  const priceRange = formatPriceRange(
    recommendation.price_range_min, 
    recommendation.price_range_max, 
    recommendation.price_unit
  );
  const isCurrentlyOpen = isOpenNow(recommendation);

  return (
    <Card 
      className={cn(
        "hover:shadow-md transition-shadow overflow-hidden cursor-pointer",
        className
      )}
      onClick={handleCardClick}
    >
      <div className="relative">
        <div 
          className={cn(
            "w-full h-48 bg-gray-200 relative overflow-hidden",
            isCompact && "h-36"
          )}
        >
          <img
            src={displayImage}
            alt={recommendation.name}
            className={cn(
              "w-full h-full object-cover transition-all duration-200",
              !imageLoaded && "opacity-0 blur-md",
              imageLoaded && "opacity-100"
            )}
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
          />
          
          {!isCompact && (
            <button 
              className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors"
              onClick={handleSaveToggle}
              aria-label={saved ? "Remove from saved" : "Save for later"}
            >
              {saved ? <Check className="h-5 w-5 text-primary" /> : <Bookmark className="h-5 w-5" />}
            </button>
          )}
          
          {recommendation.category && (
            <Badge className="absolute bottom-2 left-2 bg-primary/80 hover:bg-primary">
              {recommendation.category}
            </Badge>
          )}
        </div>
      </div>
      
      <CardContent className={cn("pt-4", isCompact && "p-3")}>
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <h3 className={cn(
              "font-semibold line-clamp-1", 
              isCompact ? "text-base" : "text-lg"
            )}>
              {recommendation.name}
            </h3>
            
            {!isCompact && recommendation.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{recommendation.rating}</span>
              </div>
            )}
          </div>
          
          {!isCompact && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {recommendation.description}
            </p>
          )}
          
          {recommendation.address && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Map className="h-3.5 w-3.5 flex-shrink-0" />
              <span className="line-clamp-1">{recommendation.address}</span>
            </div>
          )}
          
          {!isCompact && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="h-3.5 w-3.5 flex-shrink-0" />
              <span className={cn(
                "line-clamp-1",
                isCurrentlyOpen ? "text-green-600" : "text-red-500"
              )}>
                {formattedAvailability}
              </span>
            </div>
          )}
          
          {!isCompact && priceRange && (
            <div className="text-sm">
              <span className="font-medium">Price Range:</span> {priceRange}
            </div>
          )}
        </div>
      </CardContent>
      
      {!isCompact && (
        <CardFooter className="pt-0 flex justify-between items-center">
          <div className="flex gap-3">
            {recommendation.phone && (
              <a 
                href={`tel:${recommendation.phone}`}
                className="text-primary hover:text-primary/80 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Phone className="h-5 w-5" />
              </a>
            )}
            
            {recommendation.instagram && (
              <a 
                href={`https://instagram.com/${recommendation.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pink-600 hover:text-pink-500 transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <Instagram className="h-5 w-5" />
              </a>
            )}
          </div>
          
          <Button variant="ghost" size="sm" className="gap-1 p-0">
            View Details
            <ChevronRight className="h-4 w-4" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default LocationCard;
