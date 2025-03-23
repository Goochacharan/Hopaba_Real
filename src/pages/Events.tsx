
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import { useToast } from '@/hooks/use-toast';
import EventsList from '@/components/search/EventsList';
import { Event } from '@/hooks/useRecommendations';
import { supabase } from '@/integrations/supabase/client';

const sampleEvents: Event[] = [
  {
    id: '1',
    title: 'Summer Food Festival',
    date: 'July 15, 2023',
    time: '11:00 AM - 8:00 PM',
    location: 'Central Park, San Francisco',
    description: 'A culinary celebration featuring over 30 local restaurants, live cooking demonstrations, and music performances.',
    image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    attendees: 215
  },
  {
    id: '2',
    title: 'Weekend Art Exhibition',
    date: 'July 22-23, 2023',
    time: '10:00 AM - 6:00 PM',
    location: 'Modern Art Gallery, Indiranagar',
    description: 'Showcasing works from emerging local artists with interactive sessions and workshops throughout the weekend.',
    image: 'https://images.unsplash.com/photo-1591115765373-5207764f72e4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
    attendees: 98
  },
  {
    id: '3',
    title: 'Wellness & Yoga Retreat',
    date: 'August 5, 2023',
    time: '7:00 AM - 4:00 PM',
    location: 'Sunset Beach, Koramangala',
    description: 'A day-long retreat with yoga sessions, meditation workshops, and healthy living seminars led by certified instructors.',
    image: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1170&q=80',
    attendees: 42
  },
  {
    id: '4',
    title: 'Tech Startup Networking',
    date: 'August 12, 2023',
    time: '6:00 PM - 9:00 PM',
    location: 'Innovation Hub, Whitefield',
    description: 'Connect with founders, investors, and tech enthusiasts in a casual setting with keynote speakers and pitch opportunities.',
    image: 'https://images.unsplash.com/photo-1551818255-e6e10975bc17?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1728&q=80',
    attendees: 127
  }
];

const Events = () => {
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);

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

  const handleRSVP = (eventTitle: string) => {
    toast({
      title: "RSVP Successful",
      description: `You've RSVP'd to ${eventTitle}. We'll send you a reminder closer to the date.`,
      duration: 3000,
    });
  };

  return (
    <MainLayout>
      <section className="py-8 px-4 w-full pb-32">
        <div className="max-w-[1400px] mx-auto">
          <h1 className="text-3xl font-medium mb-6">Upcoming Events</h1>
          
          <EventsList events={sampleEvents} onRSVP={handleRSVP} />
        </div>
      </section>
    </MainLayout>
  );
};

export default Events;
