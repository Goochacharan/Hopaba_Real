
import React, { useState, useEffect } from 'react';
import { Event } from '@/hooks/useRecommendations';
import { Calendar, Clock, MapPin, Users, Heart, Phone, MessageCircle, Navigation2, Share2, IndianRupee } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useWishlist } from '@/contexts/WishlistContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface EventsListProps {
  events: Event[];
}

const EventsList: React.FC<EventsListProps> = ({ events }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
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

  const handleCall = (e: React.MouseEvent, eventTitle: string) => {
    e.stopPropagation();
    toast({
      title: "Calling",
      description: `Calling organizer of ${eventTitle}...`,
      duration: 3000
    });
  };

  const handleWhatsApp = (e: React.MouseEvent, eventTitle: string) => {
    e.stopPropagation();
    const message = encodeURIComponent(`Hi, I'm interested in the event "${eventTitle}"`);
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, '_blank');
    toast({
      title: "Opening WhatsApp",
      description: `Messaging about ${eventTitle} via WhatsApp...`,
      duration: 3000
    });
  };

  const handleDirections = (e: React.MouseEvent, location: string) => {
    e.stopPropagation();
    const destination = encodeURIComponent(location);
    let mapsUrl;
    
    if (isMobile && /iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      mapsUrl = `maps://maps.apple.com/?q=${destination}`;
    } else {
      mapsUrl = `https://www.google.com/maps/search/?api=1&query=${destination}`;
    }
    
    window.open(mapsUrl, '_blank');
    toast({
      title: "Opening Directions",
      description: `Getting directions to the event location...`,
      duration: 2000
    });
  };

  const handleShare = (e: React.MouseEvent, eventTitle: string) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: eventTitle,
        text: `Check out this event: ${eventTitle}`,
        url: window.location.href
      }).then(() => {
        toast({
          title: "Shared successfully",
          description: `You've shared ${eventTitle}`,
          duration: 2000
        });
      }).catch(error => {
        console.error('Error sharing:', error);
        navigator.clipboard.writeText(window.location.href).then(() => {
          toast({
            title: "Link copied",
            description: "The link has been copied to your clipboard",
            duration: 2000
          });
        });
      });
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => {
        toast({
          title: "Link copied",
          description: "The link has been copied to your clipboard",
          duration: 2000
        });
      });
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent, event: Event) => {
    e.stopPropagation();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to add events to your wishlist",
        variant: "destructive"
      });
      navigate('/login');
      return;
    }
    
    const inWishlist = isInWishlist(event.id);
    
    if (inWishlist) {
      removeFromWishlist(event.id);
      toast({
        title: "Removed from wishlist",
        description: `${event.title} removed from your wishlist`,
        duration: 2000
      });
    } else {
      addToWishlist(event, 'event');
      toast({
        title: "Added to wishlist",
        description: `${event.title} added to your wishlist`,
        duration: 2000
      });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {events.map(event => {
        const inWishlist = isInWishlist(event.id);
        
        return (
          <div key={event.id} className="bg-white rounded-xl shadow-sm border border-border overflow-hidden animate-fade-in">
            <div className="relative h-64">
              <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
              
              <button 
                onClick={(e) => handleWishlistToggle(e, event)} 
                className={cn(
                  "absolute top-3 right-3 p-2 rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all z-10",
                  user ? inWishlist ? "text-rose-500" : "text-muted-foreground hover:text-rose-500" : "text-muted-foreground"
                )}
              >
                <Heart className={cn("w-5 h-5", inWishlist && "fill-rose-500")} />
              </button>
            </div>
            
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-medium">{event.title}</h3>
                {event.pricePerPerson !== undefined && (
                  <div className="flex items-center bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100">
                    <IndianRupee className="w-4 h-4 mr-1" />
                    <span className="font-medium">{formatPrice(event.pricePerPerson).replace('₹', '')}</span>
                    <span className="text-xs ml-1 text-emerald-600">/person</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-col gap-2 mb-4">
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
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                {event.description}
              </p>
              
              <div className="flex gap-2 mt-4">
                <button 
                  onClick={(e) => handleCall(e, event.title)} 
                  className="flex-1 h-10 rounded-full border border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center justify-center"
                >
                  <Phone className="h-5 w-5" />
                </button>
                <button 
                  onClick={(e) => handleWhatsApp(e, event.title)} 
                  className="flex-1 h-10 rounded-full border border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center justify-center"
                >
                  <MessageCircle className="h-5 w-5" />
                </button>
                <button 
                  onClick={(e) => handleDirections(e, event.location)} 
                  className="flex-1 h-10 rounded-full border border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center justify-center"
                >
                  <Navigation2 className="h-5 w-5" />
                </button>
                <button 
                  onClick={(e) => handleShare(e, event.title)} 
                  className="flex-1 h-10 rounded-full border border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center justify-center"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EventsList;

