
import React from 'react';
import { Button } from '@/components/ui/button';
import { Event } from '@/hooks/useRecommendations';
import { cn } from '@/lib/utils';
import { Calendar, Clock, MapPin, User } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

interface EventCardProps {
  event: Event;
  className?: string;
  onRSVP?: (eventId: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, className, onRSVP }) => {
  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'MMMM d, yyyy');
    } catch (error) {
      // Fallback to original string if date parsing fails
      return dateString;
    }
  };

  return (
    <Card className={cn("overflow-hidden transition-all duration-200 h-full", className)}>
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={event.image || '/placeholder.svg'} 
          alt={event.title} 
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      
      <CardHeader className="px-4 py-3 border-b">
        <h3 className="text-lg font-semibold line-clamp-1">{event.title}</h3>
      </CardHeader>
      
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <span className="text-sm">{formatDate(event.date)}</span>
        </div>
        
        <div className="flex items-start gap-2">
          <Clock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <span className="text-sm">{event.time}</span>
        </div>
        
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <span className="text-sm line-clamp-1">{event.location}</span>
        </div>
        
        {event.attendees > 0 && (
          <div className="flex items-start gap-2">
            <User className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <span className="text-sm">{event.attendees} attending</span>
          </div>
        )}
        
        {event.pricePerPerson !== undefined && event.pricePerPerson > 0 && (
          <div className="mt-2 text-sm font-medium">
            ₹{event.pricePerPerson} per person
          </div>
        )}
        
        <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{event.description}</p>
      </CardContent>
      
      <CardFooter className="px-4 py-3 border-t">
        {onRSVP && (
          <Button 
            onClick={() => onRSVP(event.id)} 
            className="w-full"
            variant="outline"
          >
            RSVP Now
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default EventCard;
