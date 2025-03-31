
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
    
    const mockLocation = getRecommendationById(id);
    
    const isCornerHouseId = id === 'corner-house-01' || id.toLowerCase().includes('corner');
    
    if (mockLocation) {
      console.log("Found location in mock data:", mockLocation);
      setLocation(mockLocation);
      setLoading(false);
    } else if (isCornerHouseId) {
      const cornerHouse = mockRecommendations.find(rec => rec.name === 'Corner House');
      if (cornerHouse) {
        console.log("Using Corner House data:", cornerHouse);
        setLocation(cornerHouse);
        setLoading(false);
      } else {
        fetchLocationFromSupabase();
      }
    } else {
      fetchLocationFromSupabase();
    }
  }, [id, navigate, toast]);

  const fetchLocationFromSupabase = async () => {
    try {
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
      name: user ? user.user_metadata?.full_name || "Anonymous" : "Guest",
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

  // Only include user reviews, no mock data
  const allReviews = [...userReviews];
  const locationImages = location?.images && location.images.length > 0 ? location.images : [location?.image];
  const reviewCount = userReviews.length;

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
              reviewCount={reviewCount}
              images={locationImages}
              onImageClick={handleImageClick}
            />
            
            <LocationAbout
              name={location.name}
              description={location.description}
              tags={location.tags || []}
            />
            
            <ReviewsSection
              reviews={allReviews}
              totalReviewCount={reviewCount}
              locationRating={location.rating || 4.5}
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
