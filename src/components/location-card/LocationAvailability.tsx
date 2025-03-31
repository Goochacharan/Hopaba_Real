
import React, { useState } from 'react';
import { Clock, ChevronDown, Circle, CircleDot, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface LocationAvailabilityProps {
  openStatus?: boolean;
  businessHours?: string | null;
  availabilityDays?: string[] | null;
  availabilityStartTime?: string;
  availabilityEndTime?: string;
}

const LocationAvailability: React.FC<LocationAvailabilityProps> = ({
  openStatus,
  businessHours,
  availabilityDays,
  availabilityStartTime,
  availabilityEndTime
}) => {
  const [availabilityOpen, setAvailabilityOpen] = useState(false);
  
  const hasAvailabilityInfo = () => {
    return availabilityDays && Array.isArray(availabilityDays) && availabilityDays.length > 0;
  };
  
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
    const sortedDays = [...days].sort((a, b) => dayOrder.indexOf(a.toLowerCase()) - dayOrder.indexOf(b.toLowerCase()));
    const ranges: string[] = [];
    let rangeStart: string | null = null;
    let rangeEnd: string | null = null;
    for (let i = 0; i <= sortedDays.length; i++) {
      const day = i < sortedDays.length ? sortedDays[i].toLowerCase() : null;
      const prevDay = i > 0 ? sortedDays[i - 1].toLowerCase() : null;
      const isDayAfterPrev = day && prevDay && dayOrder.indexOf(day) === dayOrder.indexOf(prevDay) + 1;
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
          ranges.push(`${startAbbr}~${endAbbr}`);
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
  
  const formatDayShort = (day: string): string => {
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
  
  const formatAvailabilityDays = () => {
    if (!availabilityDays || availabilityDays.length === 0) {
      return null;
    }
    const formattedDays = formatDayRange(availabilityDays);
    if (availabilityStartTime && availabilityEndTime) {
      return (
        <div className="text-sm text-muted-foreground px-0">
          <p className="leading-none">{formattedDays}</p>
          <p className="leading-none mt-0">{availabilityStartTime} - {availabilityEndTime}</p>
        </div>
      );
    }
    return (
      <div className="text-sm text-muted-foreground px-0">
        <p className="leading-none">{formattedDays}</p>
      </div>
    );
  };
  
  const getAvailabilityDaysDisplay = (): React.ReactNode => {
    if (!availabilityDays || availabilityDays.length === 0) {
      return null;
    }
    
    return availabilityDays.map(day => formatDayShort(day)).join(', ');
  };
  
  const getAvailabilityHoursDisplay = (): string => {
    if (availabilityStartTime && availabilityEndTime) {
      return `${availabilityStartTime}-${availabilityEndTime}`;
    }
    return businessHours || '';
  };
  
  const renderAvailabilityInfo = () => {
    const daysDisplay = getAvailabilityDaysDisplay();
    const hoursDisplay = getAvailabilityHoursDisplay();

    if (!daysDisplay && !hoursDisplay) return null;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger className="ml-2 inline-flex items-center text-xs font-medium text-primary hover:text-primary/80 transition-colors rounded-md" onClick={(e) => e.stopPropagation()}>
          <Calendar className="h-3.5 w-3.5 mr-1" />
          <span className="underline">Hours</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={5} className="bg-white w-48 p-3 shadow-md rounded-md border z-50">
          {daysDisplay && (
            <div className="mb-2 border-b pb-2">
              <div className="text-xs font-medium text-muted-foreground mb-1">Available days:</div>
              <div className="text-sm font-medium">{daysDisplay}</div>
            </div>
          )}
          {hoursDisplay && (
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-1">Open hours:</div>
              <div className="text-sm font-medium">{hoursDisplay}</div>
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };
  
  const availabilityInfo = formatAvailabilityDays();
  
  if (!openStatus && !businessHours && !hasAvailabilityInfo()) return null;
  
  return (
    <div className="flex flex-col text-sm mb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {openStatus === true ? 
            <CircleDot className="w-4 h-4 mr-1 flex-shrink-0 text-emerald-600 fill-emerald-600" /> : 
            openStatus === false ? 
            <Circle className="w-4 h-4 mr-1 flex-shrink-0 text-rose-600 fill-rose-600" /> : 
            <Clock className="w-4 h-4 mr-1 flex-shrink-0" />
          }
          <span className={openStatus === true ? 
            "text-emerald-600 font-medium" : 
            openStatus === false ? 
            "text-rose-600 font-medium" : 
            "text-muted-foreground"
          }>
            {openStatus === true ? "Open now" : openStatus === false ? "Closed" : "Hours available"}
          </span>
        </div>
        
        {(hasAvailabilityInfo() || businessHours) && renderAvailabilityInfo()}
      </div>
      
      {hasAvailabilityInfo() && openStatus !== false && (
        <Collapsible open={availabilityOpen} onOpenChange={setAvailabilityOpen} className="mt-0.5">
          <CollapsibleTrigger onClick={e => e.stopPropagation()} className="flex items-center text-xs font-medium text-muted-foreground hover:text-primary transition-colors px-1 py-0.5 border border-transparent hover:border-border/30 rounded-md">
            Available days
            <ChevronDown className={cn("h-3 w-3 ml-1 transition-transform", availabilityOpen ? "transform rotate-180" : "")} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-0.5 mb-0.5 border-l border-muted pl-0.5">
            {availabilityInfo}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};

export default LocationAvailability;
