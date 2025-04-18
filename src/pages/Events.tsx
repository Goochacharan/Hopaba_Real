import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import MainLayout from '@/components/MainLayout';
import EventCard from '@/components/EventCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import UserEventListings from '@/components/UserEventListings';
import { useAuth } from '@/hooks/useAuth';
import MapView from '@/components/business/MapView';
import { useLocation } from '@/contexts/LocationContext';
import LocationSelector from '@/components/LocationSelector';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import NoResultsMessage from '@/components/search/NoResultsMessage';
import { Clock } from 'lucide-react';
import { Event } from '@/hooks/useRecommendations';
import { extractCityFromText, calculateDistance } from '@/lib/locationUtils';
import PostalCodeSearch from '@/components/search/PostalCodeSearch';

interface EventFromSupabase {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  image: string;
  price_per_person?: number;
  attendees?: number;
  latitude?: string;
  longitude?: string;
}

const Events = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('upcoming');
  const { selectedLocation, userCoordinates } = useLocation();
  
  const { data: events = [], isLoading, error } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('approval_status', 'approved')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      return data as EventFromSupabase[];
    }
  });
  
  const filterEventsByLocation = (eventsList: EventFromSupabase[]) => {
    if (!selectedLocation || selectedLocation === "Bengaluru, Karnataka") {
      return eventsList;
    }

    return eventsList.filter(event => {
      if (selectedLocation === "Current Location" && userCoordinates) {
        if (event.latitude && event.longitude) {
          const eventCoordinates = {
            lat: parseFloat(event.latitude),
            lng: parseFloat(event.longitude)
          };
          
          const distance = calculateDistance(
            userCoordinates.lat,
            userCoordinates.lng,
            eventCoordinates.lat,
            eventCoordinates.lng
          );
          
          return distance <= 10;
        }
        
        return true;
      }
      
      const selectedCity = selectedLocation.split(',')[0].trim();
      
      if (event.location.includes(selectedCity)) {
        return true;
      }
      
      const eventCity = extractCityFromText(event.location);
      if (eventCity && selectedCity.includes(eventCity)) {
        return true;
      }
      
      if (selectedLocation.includes("Postal Code:")) {
        const postalCode = selectedLocation.match(/\d{6}/)?.[0];
        if (postalCode && event.location.includes(postalCode)) {
          return true;
        }
      }
      
      return false;
    });
  };
  
  const filteredEvents = filterEventsByLocation(events);
  
  const upcomingEvents = filteredEvents.filter(event => {
    const eventDate = new Date(event.date);
    const today = new Date();
    return eventDate >= today;
  });
  
  const pastEvents = filteredEvents.filter(event => {
    const eventDate = new Date(event.date);
    const today = new Date();
    return eventDate < today;
  });
  
  const createEventObject = (event: EventFromSupabase, isPast: boolean = false): Event => ({
    id: event.id,
    title: event.title,
    date: event.date,
    time: event.time,
    location: event.location,
    description: event.description,
    image: event.image,
    pricePerPerson: event.price_per_person || 0,
    attendees: event.attendees || 0,
    isPast: isPast,
    isHiddenGem: false,
    isMustVisit: false
  });

  const handleLocationChange = (location: string) => {
    console.log(`Location changed to: ${location}`);
  };
  
  return (
    <MainLayout>
      <div className="container px-4 pb-16 pt-4">
        <LocationSelector 
          selectedLocation={selectedLocation} 
          onLocationChange={handleLocationChange} 
        />

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="mb-8">
            <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
            <TabsTrigger value="past">Past Events</TabsTrigger>
            {user && <TabsTrigger value="my-events">My Events</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="upcoming">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="rounded-lg border overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertDescription>Failed to load events. Please try again later.</AlertDescription>
              </Alert>
            ) : upcomingEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingEvents.map(event => (
                  <EventCard
                    key={event.id}
                    event={createEventObject(event)}
                    onRSVP={(id) => console.log(`RSVP for event ${id}`)}
                  />
                ))}
              </div>
            ) : (
              <NoResultsMessage 
                type="events" 
                title="No Upcoming Events" 
                description="Check back later for upcoming events or create your own!" 
              />
            )}
          </TabsContent>
          
          <TabsContent value="past">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map(i => (
                  <div key={i} className="rounded-lg border overflow-hidden">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertDescription>Failed to load events. Please try again later.</AlertDescription>
              </Alert>
            ) : pastEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pastEvents.map(event => (
                  <EventCard
                    key={event.id}
                    event={createEventObject(event, true)}
                  />
                ))}
              </div>
            ) : (
              <NoResultsMessage 
                type="events" 
                title="No Past Events" 
                description="There are no past events to display." 
              />
            )}
          </TabsContent>
          
          <TabsContent value="my-events">
            {user ? (
              <UserEventListings />
            ) : (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>Please log in to manage your events.</AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Events;
