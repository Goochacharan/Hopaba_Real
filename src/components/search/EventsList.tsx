
import React from 'react';
import { Event } from '@/hooks/useRecommendations';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EventsListProps {
  events: Event[];
  onRSVP: (eventTitle: string) => void;
}

const EventsList: React.FC<EventsListProps> = ({ events, onRSVP }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {events.map(event => (
        <div key={event.id} className="bg-white rounded-xl shadow-sm border border-border overflow-hidden animate-fade-in">
          <div className="relative h-48">
            <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
          </div>
          
          <div className="p-5">
            <h3 className="text-xl font-medium mb-3">{event.title}</h3>
            
            <div className="flex flex-col gap-2 mb-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="w-4 h-4 mr-2" />
                {event.date}
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="w-4 h-4 mr-2" />
                {event.time}
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 mr-2" />
                {event.location}
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="w-4 h-4 mr-2" />
                {event.attendees} attending
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              {event.description}
            </p>
            
            <Button onClick={() => onRSVP(event.title)} className="w-full">
              RSVP to Event
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventsList;
