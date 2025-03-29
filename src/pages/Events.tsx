
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import { useToast } from '@/hooks/use-toast';
import EventsList from '@/components/search/EventsList';
import LocationSelector from '@/components/LocationSelector';
import { Event } from '@/hooks/useRecommendations';
import { supabase } from '@/integrations/supabase/client';

interface SupabaseEvent {
  approval_status: string;
  attendees: number | null;
  created_at: string;
  date: string;
  description: string;
  id: string;
  image: string;
  location: string;
  time: string;
  title: string;
  price_per_person?: number;
}

const Events = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>("Bengaluru, Karnataka");
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      setError(null);
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('approval_status', 'approved')
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        // Convert Supabase events to our Event type with price info
        const eventsWithPrice = (data || []).map((event: SupabaseEvent) => ({
          ...event,
          pricePerPerson: event.price_per_person || 0 // Map from database column to our interface property
        }));
        
        setEvents(eventsWithPrice);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
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
          
          <EventsList 
            events={filteredEvents} 
            loading={loading} 
            error={error}
            className="events-page" 
          />
        </div>
      </section>
    </MainLayout>
  );
};

export default Events;
