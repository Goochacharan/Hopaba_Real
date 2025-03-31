
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Edit2, Eye, Loader2, Plus, Trash2, Calendar, Clock, MapPin, Users, IndianRupee } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Event } from '@/hooks/useRecommendations';
import { EventListingForm } from './EventListingForm';
import { supabase } from '@/integrations/supabase/client';

const UserEventListings: React.FC = () => {
  const navigate = useNavigate();
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
        // Fix: Using type assertion to avoid excessive type instantiation
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        const formattedEvents = data.map(event => ({
          ...event,
          pricePerPerson: event.price_per_person || 0
        }));
        
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

  // Format price to Indian Rupees
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

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
            const formattedEvents = data.map(event => ({
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

  if (showAddForm) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">
            {eventToEdit ? 'Edit Event' : 'Create New Event'}
          </h3>
          <Button variant="outline" size="sm" onClick={() => {
            setShowAddForm(false);
            setEventToEdit(null);
          }}>
            Back to Events
          </Button>
        </div>
        <EventListingForm 
          event={eventToEdit || undefined} 
          onSaved={handleEventSaved} 
          onCancel={() => {
            setShowAddForm(false);
            setEventToEdit(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium">Your Event Listings</h3>
          <p className="text-muted-foreground text-sm">
            {events.length} events listed
          </p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)} 
          className="flex items-center gap-1.5"
        >
          <Plus className="h-4 w-4" />
          Create Event
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <div className="w-full h-40 overflow-hidden">
                <img 
                  src={event.image} 
                  alt={event.title} 
                  className="w-full h-full object-cover transition-transform hover:scale-105"
                />
              </div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="line-clamp-1">{event.title}</CardTitle>
                  <Badge variant={event.pricePerPerson > 0 ? "outline" : "secondary"}>
                    {event.pricePerPerson > 0 ? formatPrice(event.pricePerPerson) : "Free"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2 space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                  {event.date}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                  {event.time}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                  {event.location}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                  {event.attendees} attending
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button variant="outline" size="sm" onClick={() => navigate(`/events`)}>
                  <Eye className="h-4 w-4 mr-1" /> View
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(event)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" onClick={() => setEventToDelete(event.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Event</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this event? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-muted/30 rounded-lg border border-border">
          <h3 className="text-lg font-medium mb-2">No events yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first event to reach more people in your community.
          </p>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="mr-2 h-4 w-4" /> Create Event
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserEventListings;
