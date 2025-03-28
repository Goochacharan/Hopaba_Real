
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import { useToast } from '@/hooks/use-toast';
import EventsList from '@/components/search/EventsList';
import LocationSelector from '@/components/LocationSelector';
import { Event } from '@/hooks/useRecommendations';
import { supabase } from '@/integrations/supabase/client';

const Events = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>("Bengaluru, Karnataka");
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user || null);
    };
    getCurrentUser();
    
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null);
    });
    
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Fetch approved events
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('approval_status', 'approved')
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        // Add default price per person if missing
        const eventsWithPrice = (data || []).map(event => ({
          ...event,
          pricePerPerson: event.pricePerPerson !== undefined ? event.pricePerPerson : 0
        }));
        
        setEvents(eventsWithPrice);
      } catch (err) {
        console.error('Error fetching events:', err);
        toast({
          title: 'Error',
          description: 'Failed to load events. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [toast]);

  // Filter events whenever search query changes
  useEffect(() => {
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      const filtered = events.filter(event => 
        event.title.toLowerCase().includes(lowercaseQuery) ||
        event.description.toLowerCase().includes(lowercaseQuery) ||
        event.location.toLowerCase().includes(lowercaseQuery)
      );
      setFilteredEvents(filtered);
    } else {
      setFilteredEvents(events);
    }
  }, [searchQuery, events]);

  const handleLocationChange = (location: string) => {
    console.log(`Location changed to: ${location}`);
    setSelectedLocation(location);
    // In a real application, you would fetch events for this location
  };

  return (
    <MainLayout>
      <section className="py-8 px-4 w-full pb-32">
        <div className="max-w-[1400px] mx-auto">
          <LocationSelector 
            selectedLocation={selectedLocation}
            onLocationChange={handleLocationChange}
          />
          <h1 className="text-3xl font-medium mb-6 mt-4">
            {searchQuery ? `Events matching "${searchQuery}"` : "Upcoming Events"}
          </h1>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading events...</p>
            </div>
          ) : filteredEvents.length > 0 ? (
            <EventsList events={filteredEvents} />
          ) : (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-2">No events found</h3>
              <p className="text-muted-foreground">
                {searchQuery 
                  ? `No events matching "${searchQuery}" were found. Try a different search term.`
                  : "There are no upcoming events at this time. Check back later!"}
              </p>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
};

export default Events;
