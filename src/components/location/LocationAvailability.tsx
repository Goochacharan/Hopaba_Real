
import React from 'react';
import { Calendar } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from '@/components/ui/dropdown-menu';

interface LocationAvailabilityProps {
  hasAvailabilityInfo: boolean;
  businessHours: string | null;
  daysDisplay: React.ReactNode;
  hoursDisplay: string;
}

const LocationAvailability: React.FC<LocationAvailabilityProps> = ({
  hasAvailabilityInfo,
  businessHours,
  daysDisplay,
  hoursDisplay
}) => {
  if (!hasAvailabilityInfo && !businessHours) {
    return null;
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger 
        onClick={e => e.stopPropagation()} 
        className="ml-2 inline-flex items-center text-xs font-medium transition-colors rounded text-slate-50 px-[12px] mx-[2px] bg-[#7f6891] py-px"
      >
        <Calendar className="h-3.5 w-3.5 mr-1" />
        <span className="text-sm px-0 mx-px">Hours</span>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" sideOffset={5} className="bg-white w-48 p-2 shadow-md rounded-md border z-50">
        {daysDisplay && (
          <div className="mb-1">
            <div className="text-xs font-medium text-muted-foreground mb-1">Days:</div>
            <div className="text-sm">{daysDisplay}</div>
          </div>
        )}
        
        {hoursDisplay && (
          <div>
            <div className="text-xs font-medium text-muted-foreground mb-1">Hours:</div>
            <div className="text-sm">{hoursDisplay}</div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LocationAvailability;
