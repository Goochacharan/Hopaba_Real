import React, { useState, useEffect } from 'react';
import { format, differenceInDays } from 'date-fns';
import { Instagram, Film, Sparkles, MapPin, Link2, Tag, Clock, Calendar } from 'lucide-react';
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
  const isNew = differenceInDays(new Date(), new Date(createdAt)) < 7;
  
  const formatDayRange = (days: string[]): string => {
    if (!days || days.length === 0) return '';
    
    const dayAbbreviations: Record<string, string> = {
      'monday': 'Mon',
      'tuesday': 'Tue',
      'wednesday': 'Wed',
      'thursday': 'Thu',
      'friday': 'Fri',
      'saturday': 'Sat',
      'sunday': 'Sun'
    };
    
    const dayOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const sortedDays = [...days].sort((a, b) => 
      dayOrder.indexOf(a.toLowerCase()) - dayOrder.indexOf(b.toLowerCase())
    );
    
    const ranges: string[] = [];
    let rangeStart: string | null = null;
    let rangeEnd: string | null = null;
    
    for (let i = 0; i <= sortedDays.length; i++) {
      const day = i < sortedDays.length ? sortedDays[i].toLowerCase() : null;
      const prevDay = i > 0 ? sortedDays[i - 1].toLowerCase() : null;
      const isDayAfterPrev = day && prevDay && 
        dayOrder.indexOf(day) === dayOrder.indexOf(prevDay) + 1;
      
      if (i === 0) {
        rangeStart = sortedDays[0];
        rangeEnd = sortedDays[0];
      } else if (isDayAfterPrev) {
        rangeEnd = sortedDays[i];
      } else if (rangeStart && rangeEnd) {
        if (rangeStart === rangeEnd) {
          ranges.push(dayAbbreviations[rangeStart.toLowerCase()] || rangeStart);
        } else {
          const startAbbr = dayAbbreviations[rangeStart.toLowerCase()] || rangeStart;
          const endAbbr = dayAbbreviations[rangeEnd.toLowerCase()] || rangeEnd;
          ranges.push(`${startAbbr}-${endAbbr}`);
        }
        
        if (day) {
          rangeStart = sortedDays[i];
          rangeEnd = sortedDays[i];
        } else {
          rangeStart = null;
          rangeEnd = null;
        }
      }
    }
    
    return ranges.join(', ');
  };
  
  const hasAvailabilityDays = availability_days && availability_days.length > 0;
  const displayAvailabilityDays = hasAvailabilityDays 
    ? formatDayRange(availability_days) 
    : null;

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
              {(displayAvailabilityDays || (category === "Corner House" && !displayAvailabilityDays)) && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="font-medium">
                    Working days: {displayAvailabilityDays || (category === "Corner House" ? "Mon-Sun" : "Not specified")}
                  </span>
                  {availability_start_time && availability_end_time && (
                    <span className="text-muted-foreground">
                      ({availability_start_time} - {availability_end_time})
                    </span>
                  )}
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
                  {instagram.includes('youtube.com') || instagram.includes('vimeo.com') || instagram.includes('tiktok.com') ? (
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
                    {instagram.includes('youtube.com') || instagram.includes('vimeo.com') || instagram.includes('tiktok.com') ? 'View Video Content' : 'Visit Instagram'}
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
