
import React, { useEffect, useState } from 'react';
import { Event } from '@/hooks/useRecommendations';
import EventCard from '@/components/EventCard';
import { cn } from '@/lib/utils';
import { Loader2, Tag } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { matchSearchTermsWithTags, improveSearchByTags } from '@/utils/searchUtils';

interface EventsListProps {
  events: Event[];
  loading?: boolean;
  error?: string | null;
  className?: string;
  searchQuery?: string; // Added searchQuery prop
}

const EventsList: React.FC<EventsListProps> = ({ 
  events, 
  loading = false,
  error = null,
  className,
  searchQuery = '' // Added default value
}) => {
  const [matchedTags, setMatchedTags] = useState<string[]>([]);

  // Find tag matches whenever searchQuery or events change
  useEffect(() => {
    if (searchQuery && events.length > 0) {
      // Let's assume Event type can have an optional tags field
      const eventsWithTags = events.map(event => ({
        ...event,
        tags: event.tags || [] // Ensure each event has a tags property even if it's empty
      }));
      const { tagMatches } = improveSearchByTags(eventsWithTags, searchQuery);
      setMatchedTags(tagMatches);
    } else {
      setMatchedTags([]);
    }
  }, [searchQuery, events]);

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
    <div className="space-y-4">
      {matchedTags.length > 0 && (
        <Alert variant="default" className="bg-blue-50 border-blue-200 mb-4">
          <Tag className="h-4 w-4 text-blue-600 mr-2" />
          <AlertDescription className="text-blue-800">
            Found matches for tags: {' '}
            {matchedTags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="mr-1 mb-1 bg-blue-100">
                {tag}
              </Badge>
            ))}
          </AlertDescription>
        </Alert>
      )}
      
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5", className)}>
        {events.map((event, index) => {
          // Check if this event has matching tags
          const hasMatchingTags = event.tags && 
            Array.isArray(event.tags) && 
            matchSearchTermsWithTags(searchQuery, event.tags);
            
          return (
            <div 
              key={event.id} 
              className={cn(
                "animate-fade-in", 
                hasMatchingTags ? "ring-2 ring-amber-300 rounded-lg" : ""
              )} 
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {hasMatchingTags && (
                <Badge variant="secondary" className="mb-2 ml-2 mt-2 bg-amber-100 text-amber-800 border-amber-300">
                  Tag Match
                </Badge>
              )}
              <EventCard 
                event={event} 
                className={cn(
                  "h-full flex flex-col",
                  "event-card" // This class will be used to identify event cards
                )}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventsList;
