
import React from 'react';
import { Clock, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface LocationAvailabilityProps {
  openStatus?: boolean;
  availabilityDays?: string[];
  startTime?: string;
  endTime?: string;
}

const LocationAvailability: React.FC<LocationAvailabilityProps> = ({
  openStatus,
  availabilityDays = [],
  startTime,
  endTime
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const hasAvailabilityInfo = availabilityDays.length > 0;

  const formatAvailabilityDays = () => {
    if (!hasAvailabilityInfo) return null;
    
    const days = availabilityDays.join(', ');
    
    if (startTime && endTime) {
      return (
        <div className="text-xs text-muted-foreground">
          <p className="font-medium mb-1">Available Days:</p>
          <p>{days}</p>
          <p className="mt-1">Time: {startTime} - {endTime}</p>
        </div>
      );
    }
    
    return (
      <div className="text-xs text-muted-foreground">
        <p className="font-medium mb-1">Available Days:</p>
        <p>{days}</p>
      </div>
    );
  };

  return (
    <div className="flex flex-col text-sm">
      <div className="flex items-center">
        <Clock className="w-4 h-4 mr-1 flex-shrink-0" />
        <span className={
          openStatus === true ? "text-emerald-600 font-medium" : 
          openStatus === false ? "text-rose-600 font-medium" : 
          "text-muted-foreground"
        }>
          {openStatus === true ? "Open now" : 
           openStatus === false ? "Closed" : 
           "Hours available"}
        </span>
      </div>
      
      {hasAvailabilityInfo && (
        <Collapsible 
          open={isOpen} 
          onOpenChange={setIsOpen}
          className="mt-1"
        >
          <CollapsibleTrigger 
            onClick={(e) => e.stopPropagation()}
            className="flex items-center text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            Available days
            <ChevronDown className={cn(
              "h-3 w-3 ml-1 transition-transform", 
              isOpen ? "transform rotate-180" : ""
            )} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-1 mb-2">
            {formatAvailabilityDays()}
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};

export default LocationAvailability;
