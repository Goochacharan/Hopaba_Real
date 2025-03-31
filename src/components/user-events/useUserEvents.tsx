
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Event } from '@/hooks/useRecommendations';

export const useUserEvents = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<Event | null>(null);

  // Fetch user's events from Supabase
  useEffect(() => {
    const fetchUserEvents = async () => {
      if (!user) {
        setEvents([]);
        setLoading(false);
        return;
      }
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        const formattedEvents = data?.map((event) => ({
          ...event,
          pricePerPerson: event.price_per_person || 0
        })) || [];
        
        setEvents(formattedEvents);
      } catch (err) {
        console.error('Error fetching events:', err);
        toast({
          title: 'Error',
          description: 'Failed to load your events. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserEvents();
  }, [user, toast]);

  const handleDeleteConfirm = async () => {
    if (eventToDelete) {
      try {
        const { error } = await supabase
          .from('events')
          .delete()
          .eq('id', eventToDelete);
        
        if (error) throw error;
        
        setEvents(events.filter(event => event.id !== eventToDelete));
        toast({
          title: "Event deleted",
          description: "The event has been successfully removed."
        });
      } catch (err) {
        console.error('Error deleting event:', err);
        toast({
          title: "Error",
          description: "Failed to delete event. Please try again.",
          variant: "destructive"
        });
      } finally {
        setEventToDelete(null);
      }
    }
  };

  const handleEdit = (event: Event) => {
    setEventToEdit(event);
    setShowAddForm(true);
  };

  const handleEventSaved = () => {
    setShowAddForm(false);
    setEventToEdit(null);
    
    // Refresh the event list from the database
    if (user) {
      setLoading(true);
      supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (error) {
            toast({
              title: "Error",
              description: "Failed to refresh events. Please reload the page.",
              variant: "destructive"
            });
          } else if (data) {
            const formattedEvents = data.map((event) => ({
              ...event,
              pricePerPerson: event.price_per_person || 0
            }));
            setEvents(formattedEvents);
          }
          setLoading(false);
        });
    }
    
    toast({
      title: "Success",
      description: eventToEdit ? "Event updated successfully" : "Event created successfully"
    });
  };

  return {
    loading,
    events,
    eventToDelete,
    setEventToDelete,
    showAddForm,
    setShowAddForm,
    eventToEdit,
    setEventToEdit,
    handleDeleteConfirm,
    handleEdit,
    handleEventSaved
  };
};
