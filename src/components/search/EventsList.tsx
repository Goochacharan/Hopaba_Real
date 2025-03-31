
import React from 'react';
import { Event } from '@/hooks/useRecommendations';
import EventCard from '@/components/EventCard';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface EventsListProps {
  events: Event[];
  loading?: boolean;
  error?: string | null;
  className?: string;
  hideWishlistIcon?: boolean;
}

const EventsList: React.FC<EventsListProps> = ({ 
  events, 
  loading = false,
  error = null,
  className,
  hideWishlistIcon
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-16">
        <h3 className="text-lg font-medium mb-2">No events found</h3>
        <p className="text-muted-foreground">
          There are currently no events matching your criteria.
        </p>
      </div>
    );
  }
  
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5", className)}>
      {events.map((event, index) => (
        <div 
          key={event.id} 
          className="animate-fade-in" 
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <EventCard 
            event={event} 
            className={cn(
              "h-full flex flex-col",
              "event-card" // This class will be used to identify event cards
            )}
            hideWishlistIcon={hideWishlistIcon}
          />
        </div>
      ))}
    </div>
  );
};

export default EventsList;
