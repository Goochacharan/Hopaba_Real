import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/MainLayout';
import { ArrowLeft } from 'lucide-react';
import { getRecommendationById, mockRecommendations } from '@/lib/mockData';
import { supabase } from '@/integrations/supabase/client';
import ImageViewer from '@/components/ImageViewer';
import { Review } from '@/components/location/ReviewsList';
import { ReviewFormValues } from '@/components/location/ReviewForm';
import LocationHeader from '@/components/location/LocationHeader';
import LocationAbout from '@/components/location/LocationAbout';
import ReviewsSection from '@/components/location/ReviewsSection';

const TOTAL_REVIEW_COUNT = 153;

const initialReviews: Review[] = [{
  id: '1',
  name: 'Priya Singh',
  date: '2 weeks ago',
  rating: 5,
  text: 'Amazing desserts! Their Death by Chocolate is to die for. Must visit for ice cream lovers.'
}, {
  id: '2',
  name: 'Raj Patel',
  date: '1 month ago',
  rating: 4,
  text: 'Great ambiance and delicious ice cream. A bit crowded on weekends but worth the wait.'
}, {
  id: '3',
  name: 'Ananya Sharma',
  date: '2 months ago',
  rating: 5,
  text: 'Best ice cream place in Bangalore! The Hot Chocolate Fudge is my favorite. Always my go-to dessert spot.'
}];

const LocationDetails = () => {
  const { id } = useParams<{ id: string; }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [location, setLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
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

  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }
    setLoading(true);
    
    // First try to find in mock data
    const mockLocation = getRecommendationById(id);
    
    // Then try to find by name "Corner House" if id is not found
    const isCornerHouseId = id === 'corner-house-01' || id.toLowerCase().includes('corner');
    
    if (mockLocation) {
      console.log("Found location in mock data:", mockLocation);
      setLocation(mockLocation);
      setLoading(false);
    } else if (isCornerHouseId) {
      // If the ID suggests Corner House but not found in mock data, use the Corner House data
      const cornerHouse = mockRecommendations.find(rec => rec.name === 'Corner House');
      if (cornerHouse) {
        console.log("Using Corner House data:", cornerHouse);
        setLocation(cornerHouse);
        setLoading(false);
      } else {
        // If not found in mockRecommendations, try to fetch from Supabase
        fetchLocationFromSupabase();
      }
    } else {
      // Try to fetch from Supabase
      fetchLocationFromSupabase();
    }
  }, [id, navigate, toast]);

  const fetchLocationFromSupabase = async () => {
    try {
      // First check service_providers table
      const { data: serviceProvider, error: serviceError } = await supabase
        .from('service_providers')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (serviceProvider) {
        console.log("Found location in service_providers:", serviceProvider);
        setLocation(serviceProvider);
        setLoading(false);
        return;
      }

      // Then check recommendations table
      const { data: recommendation, error: recommendationError } = await supabase
        .from('recommendations')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (recommendation) {
        console.log("Found location in recommendations:", recommendation);
        setLocation(recommendation);
        setLoading(false);
        return;
      }

      // If both failed, check for Corner House by name
      const { data: cornerHouse, error: cornerHouseError } = await supabase
        .from('service_providers')
        .select('*')
        .ilike('name', '%Corner House%')
        .maybeSingle();

      if (cornerHouse) {
        console.log("Found Corner House in service_providers:", cornerHouse);
        setLocation(cornerHouse);
        setLoading(false);
        return;
      }

      // If not found in any table, show error
      toast({
        title: "Location not found",
        description: "We couldn't find the location you're looking for",
        variant: "destructive"
      });
      navigate('/');
    } catch (error) {
      console.error("Error fetching location:", error);
      toast({
        title: "Error",
        description: "There was an error loading the location details",
        variant: "destructive"
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setImageViewerOpen(true);
  };

  const handleSubmitReview = (values: ReviewFormValues) => {
    const reviewId = Math.random().toString(36).substring(2, 9);
    const currentDate = "Just now";
    const newReview: Review = {
      id: reviewId,
      name: "You",
      date: currentDate,
      rating: values.rating,
      text: values.reviewText,
      isMustVisit: values.isMustVisit,
      isHiddenGem: values.isHiddenGem
    };
    setUserReviews(prev => [newReview, ...prev]);
    toast({
      title: "Review submitted",
      description: "Thank you for sharing your experience!",
      duration: 3000
    });
  };

  const allReviews = [...userReviews, ...initialReviews];
  const locationImages = location?.images && location.images.length > 0 ? location.images : [location?.image];

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto py-4 px-4 max-w-none">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded w-2/3"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!location) return null;

  return (
    <MainLayout>
      <div className="container mx-auto py-4 max-w-none px-[7px]">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-4 pl-0 text-muted-foreground" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to results
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <LocationHeader
              name={location.name}
              rating={location.rating}
              reviewCount={TOTAL_REVIEW_COUNT}
              images={locationImages}
              onImageClick={handleImageClick}
            />
            
            <LocationAbout
              name={location.name}
              description={location.description}
              tags={location.tags}
            />
            
            <ReviewsSection
              reviews={allReviews}
              totalReviewCount={TOTAL_REVIEW_COUNT}
              locationRating={location.rating}
              locationId={location.id}
              locationName={location.name}
              onSubmitReview={handleSubmitReview}
            />
          </div>
          
          <div className="space-y-4">
            {/* Right sidebar content goes here if needed */}
          </div>
        </div>
        
        {locationImages.length > 0 && (
          <ImageViewer 
            images={locationImages} 
            initialIndex={selectedImageIndex} 
            open={imageViewerOpen} 
            onOpenChange={setImageViewerOpen} 
          />
        )}
      </div>
    </MainLayout>
  );
};

export default LocationDetails;
