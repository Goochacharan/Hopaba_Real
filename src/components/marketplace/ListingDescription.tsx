
import React, { useState, useEffect } from 'react';
import { format, differenceInDays } from 'date-fns';
import { Instagram, Film, Sparkles, MapPin, Link2, Tag, Clock, Circle, CircleDot } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface ListingDescriptionProps {
  description: string;
  category: string;
  condition: string;
  location: string;
  createdAt: string;
  instagram?: string | null;
  mapLink?: string | null;
  showMetadata?: boolean;
  priceUnit?: string;
  experience?: string;
  tags?: string[];
  availability_days?: string[];
  availability_start_time?: string;
  availability_end_time?: string;
}

const ListingDescription: React.FC<ListingDescriptionProps> = ({
  description,
  category,
  condition,
  location,
  createdAt,
  instagram,
  mapLink,
  showMetadata = false,
  priceUnit,
  experience,
  tags,
  availability_days,
  availability_start_time,
  availability_end_time
}) => {
  const [currentOpenStatus, setCurrentOpenStatus] = useState<boolean | undefined>(undefined);
  const isVideoContent = instagram && (instagram.includes('youtube.com') || instagram.includes('vimeo.com') || instagram.includes('tiktok.com'));

  // Check if listing is less than 7 days old
  const isNew = differenceInDays(new Date(), new Date(createdAt)) < 7;
  
  // Add useEffect to update open status in real-time
  useEffect(() => {
    // Initial check when component mounts
    const status = isOpenNow();
    setCurrentOpenStatus(status);

    // Set up interval to check every minute
    const intervalId = setInterval(() => {
      const status = isOpenNow();
      setCurrentOpenStatus(status);
    }, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, [availability_days, availability_start_time, availability_end_time]);

  const isOpenNow = () => {
    if (hasAvailabilityInfo()) {
      const now = new Date();
      const currentDay = now.toLocaleDateString('en-US', {
        weekday: 'long'
      }).toLowerCase();
      const availableDays = availability_days?.map(day => day.toLowerCase()) || [];
      const isAvailableToday = availableDays.some(day => currentDay.includes(day) || day.includes(currentDay));
      if (!isAvailableToday) return false;
      if (availability_start_time && availability_end_time) {
        const startTime = parseTimeString(availability_start_time);
        const endTime = parseTimeString(availability_end_time);
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTimeInMinutes = currentHour * 60 + currentMinute;
        return currentTimeInMinutes >= startTime && currentTimeInMinutes <= endTime;
      }
      return true;
    }
    return undefined;
  };

  const parseTimeString = (timeString: string): number => {
    try {
      const [time, period] = timeString.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (period === 'PM' && hours < 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      return hours * 60 + minutes;
    } catch (e) {
      console.error("Error parsing time string:", timeString, e);
      return 0;
    }
  };

  const hasAvailabilityInfo = () => {
    return availability_days && Array.isArray(availability_days) && availability_days.length > 0;
  };

  const openStatus = currentOpenStatus !== undefined ? currentOpenStatus : isOpenNow();

  return (
    <div className="bg-white rounded-xl border p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-semibold mb-3">Description</h2>
        {isNew && (
          <div className="bg-[#33C3F0] text-white text-xs font-semibold px-2 py-0.5 rounded flex items-center gap-1 mb-3">
            <Sparkles className="h-2.5 w-2.5" />
            <span className="text-[10px]">New post</span>
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        <ScrollArea className="h-[350px] pr-3">
          <p className="whitespace-pre-line leading-relaxed text-base font-normal text-slate-900">
            {description}
          </p>
          
          {showMetadata && (
            <div className="mt-6 space-y-4 text-sm text-gray-700">
              {openStatus !== undefined && (
                <div className="flex items-center gap-2">
                  {openStatus === true ? 
                    <CircleDot className="h-4 w-4 text-emerald-600 fill-emerald-600" /> : 
                    <Circle className="h-4 w-4 text-rose-600 fill-rose-600" />
                  }
                  <span className={openStatus === true ? 
                    "text-emerald-600 font-medium" : 
                    "text-rose-600 font-medium"
                  }>
                    {openStatus === true ? "Open now" : "Closed"}
                  </span>
                </div>
              )}
              
              {priceUnit && (
                <p>
                  <span className="font-semibold">Pricing:</span> {priceUnit}
                </p>
              )}
              
              {experience && (
                <p>
                  <span className="font-semibold">Experience:</span> {experience} years
                </p>
              )}
              
              {tags && tags.length > 0 && (
                <div className="space-y-2">
                  <p className="font-semibold flex items-center gap-1">
                    <Tag className="h-3.5 w-3.5" />
                    Services/Items:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {mapLink && (
                <div className="flex items-center gap-2 mt-4">
                  <MapPin className="h-4 w-4 text-primary" />
                  <a 
                    href={mapLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    View on Google Maps
                  </a>
                </div>
              )}
              
              {instagram && (
                <div className="flex items-center gap-2 mt-2">
                  {isVideoContent ? (
                    <Film className="h-4 w-4 text-purple-500" />
                  ) : (
                    <Instagram className="h-4 w-4 text-pink-500" />
                  )}
                  <a 
                    href={instagram.startsWith('http') ? instagram : `https://instagram.com/${instagram.replace('@', '')}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {isVideoContent ? 'View Video Content' : 'Visit Instagram'}
                  </a>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};

export default ListingDescription;
