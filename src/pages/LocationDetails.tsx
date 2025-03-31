
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Phone, MessageCircle, Navigation2, Share2, MapPin, Clock, Star, IndianRupee } from 'lucide-react';
import { ReviewFormValues } from '@/components/location/ReviewForm';
import ReviewsSection from '@/components/location/ReviewsSection';
import { Review } from '@/components/location/ReviewsList';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

interface LocationDetails {
  id: string;
  name: string;
  description: string;
  category: string;
  area: string;
  city: string;
  address?: string;
  contact_phone?: string;
  availability?: string;
  price_range_min?: number;
  price_range_max?: number;
  price_unit?: string;
  rating?: number;
  instagram?: string;
  review_count?: number;
  images?: string[];
  tags?: string[];
}

const LocationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [location, setLocation] = useState<LocationDetails | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [userHasReviewed, setUserHasReviewed] = useState(false);

  useEffect(() => {
    const fetchLocationDetails = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // First try to fetch from service_providers
        let { data, error } = await supabase
          .from('service_providers')
          .select('*')
          .eq('id', id)
          .single();
        
        // If not found, try the recommendations table
        if (error || !data) {
          const { data: recData, error: recError } = await supabase
            .from('recommendations')
            .select('*')
            .eq('id', id)
            .single();
            
          if (recError) {
            console.error('Error fetching from recommendations:', recError);
            throw new Error('Location not found');
          }
          
          data = recData;
        }
        
        if (data) {
          console.log("Fetched location data:", data);
          
          setLocation({
            ...data,
            address: data.address || `${data.area}, ${data.city}`,
            rating: data.rating || 4.5,
            review_count: data.review_count || 0
          });
          
          // Fetch reviews for this location
          // For now we'll use mock data, in a real app you'd fetch from a reviews table
          setReviews([
            {
              id: '1',
              name: 'John Doe',
              date: '2 weeks ago',
              rating: 5,
              text: 'Amazing experience! The service was excellent and the staff was very friendly. Would definitely recommend!',
              isMustVisit: true
            },
            {
              id: '2',
              name: 'Jane Smith',
              date: '1 month ago',
              rating: 4,
              text: 'Great place! The ambiance was nice and the prices were reasonable. Looking forward to visiting again.',
              isHiddenGem: true
            }
          ]);
          
          // Check if current user has already reviewed
          if (user) {
            // Here you would check against real reviews in the database
            setUserHasReviewed(false);
          }
        }
      } catch (error) {
        console.error('Error fetching location details:', error);
        toast({
          title: 'Error',
          description: 'Failed to load location details',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchLocationDetails();
  }, [id, user, toast]);

  const handleCall = () => {
    if (location?.contact_phone) {
      window.open(`tel:${location.contact_phone}`);
      toast({
        title: 'Calling',
        description: `Calling ${location.name}...`
      });
    }
  };

  const handleWhatsApp = () => {
    if (location?.contact_phone) {
      const message = encodeURIComponent(`Hi, I'm interested in ${location.name}`);
      window.open(`https://wa.me/${location.contact_phone}?text=${message}`);
      toast({
        title: 'WhatsApp',
        description: `Opening WhatsApp chat with ${location.name}...`
      });
    }
  };

  const handleDirections = () => {
    if (location) {
      const address = encodeURIComponent(`${location.area}, ${location.city}`);
      window.open(`https://www.google.com/maps/search/?api=1&query=${address}`);
      toast({
        title: 'Directions',
        description: `Getting directions to ${location.name}...`
      });
    }
  };

  const handleShare = () => {
    if (navigator.share && location) {
      navigator.share({
        title: location.name,
        text: `Check out ${location.name}`,
        url: window.location.href
      }).catch(error => {
        console.error('Error sharing:', error);
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link Copied',
        description: 'Link copied to clipboard'
      });
    }
  };

  const handleSubmitReview = (values: ReviewFormValues) => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to leave a review',
        variant: 'destructive'
      });
      return;
    }
    
    if (userHasReviewed) {
      toast({
        title: 'Already Reviewed',
        description: 'You have already submitted a review for this location',
        variant: 'destructive'
      });
      return;
    }
    
    // In a real app, you would save this to the database
    const newReview: Review = {
      id: uuidv4(),
      name: user.user_metadata?.full_name || user.email || 'Anonymous',
      date: format(new Date(), 'PPP'),
      rating: values.rating,
      text: values.reviewText,
      isMustVisit: values.isMustVisit,
      isHiddenGem: values.isHiddenGem
    };
    
    setReviews([newReview, ...reviews]);
    setUserHasReviewed(true);
    
    toast({
      title: 'Review Submitted',
      description: 'Thank you for your feedback!'
    });
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6 px-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-40 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded-xl"></div>
            <div className="h-8 w-full bg-gray-200 rounded"></div>
            <div className="h-24 w-full bg-gray-200 rounded"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!location) {
    return (
      <MainLayout>
        <div className="container mx-auto py-6 px-4 text-center">
          <p className="text-xl">Location not found</p>
          <Button 
            variant="default" 
            className="mt-4"
            onClick={() => navigate('/')}
          >
            Go Home
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto py-6 px-4">
        <Button 
          variant="ghost" 
          className="mb-4 flex items-center gap-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          Back
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
              <div className="h-64 bg-muted w-full flex items-center justify-center">
                {location.images && location.images[0] ? (
                  <img 
                    src={location.images[0]} 
                    alt={location.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <MapPin size={48} className="text-muted-foreground" />
                )}
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-2xl font-bold">{location.name}</h1>
                    <div className="text-sm text-muted-foreground">{location.category}</div>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                    <span className="ml-1 font-medium">{location.rating?.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground ml-1">
                      ({location.review_count || 0})
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    {location.area}, {location.city}
                  </div>
                  {location.availability && (
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      {location.availability}
                    </div>
                  )}
                  {location.price_range_min && location.price_range_max && (
                    <div className="flex items-center text-muted-foreground">
                      <IndianRupee className="h-4 w-4 mr-2" />
                      ₹{location.price_range_min} - ₹{location.price_range_max} {location.price_unit}
                    </div>
                  )}
                </div>
                
                <p className="text-muted-foreground mb-6">{location.description}</p>
                
                <div className="grid grid-cols-4 gap-2">
                  <Button 
                    variant="default" 
                    className="w-full flex items-center justify-center gap-2"
                    onClick={handleCall}
                  >
                    <Phone size={18} />
                    Call
                  </Button>
                  <Button 
                    variant="default" 
                    className="w-full flex items-center justify-center gap-2"
                    onClick={handleWhatsApp}
                  >
                    <MessageCircle size={18} />
                    Chat
                  </Button>
                  <Button 
                    variant="default" 
                    className="w-full flex items-center justify-center gap-2"
                    onClick={handleDirections}
                  >
                    <Navigation2 size={18} />
                    Directions
                  </Button>
                  <Button 
                    variant="default" 
                    className="w-full flex items-center justify-center gap-2"
                    onClick={handleShare}
                  >
                    <Share2 size={18} />
                    Share
                  </Button>
                </div>
              </div>
            </div>
            
            <ReviewsSection 
              reviews={reviews}
              totalReviewCount={reviews.length}
              locationRating={location.rating || 4.5}
              onSubmitReview={handleSubmitReview}
            />
          </div>
          
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-border p-6">
              <h2 className="text-xl font-semibold mb-4">Location Information</h2>
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium">Address</h3>
                  <p className="text-muted-foreground">{location.area}, {location.city}</p>
                </div>
                {location.contact_phone && (
                  <div>
                    <h3 className="text-sm font-medium">Phone</h3>
                    <p className="text-muted-foreground">{location.contact_phone}</p>
                  </div>
                )}
                {location.availability && (
                  <div>
                    <h3 className="text-sm font-medium">Hours</h3>
                    <p className="text-muted-foreground">{location.availability}</p>
                  </div>
                )}
                {location.tags && location.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium">Tags</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {location.tags.map((tag, index) => (
                        <div key={index} className="bg-muted px-2 py-1 rounded text-xs">
                          {tag}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default LocationDetails;
