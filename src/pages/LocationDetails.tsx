
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

const getStoredReviews = (locationId: string): Review[] => {
  try {
    const storedReviews = localStorage.getItem(`reviews_${locationId}`);
    return storedReviews ? JSON.parse(storedReviews) : [];
  } catch (error) {
    console.error('Error getting stored reviews:', error);
    return [];
  }
};

const storeReviews = (locationId: string, reviews: Review[]) => {
  try {
    localStorage.setItem(`reviews_${locationId}`, JSON.stringify(reviews));
  } catch (error) {
    console.error('Error storing reviews:', error);
  }
};

const calculateAverageRating = (reviews: Review[]): number => {
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((total, review) => total + review.rating, 0);
  return sum / reviews.length;
};

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
  const [averageRating, setAverageRating] = useState<number>(0);

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
    
    // Load reviews from localStorage
    const savedReviews = getStoredReviews(id);
    setUserReviews(savedReviews);
    
    // Calculate average rating from user reviews
    if (savedReviews.length > 0) {
      const avgRating = calculateAverageRating(savedReviews);
      setAverageRating(avgRating);
    }
    
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
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to submit a review",
        variant: "destructive"
      });
      return;
    }

    // Check if this user has already submitted a review
    const existingUserReview = userReviews.find(
      review => review.userId === user.id
    );

    if (existingUserReview) {
      toast({
        title: "Review already submitted",
        description: "You have already submitted a review for this location.",
        variant: "destructive"
      });
      return;
    }

    const reviewId = Math.random().toString(36).substring(2, 9);
    const currentDate = "Just now";
    
    // Get user name from metadata or use email as fallback
    const userName = user.user_metadata?.full_name || user.email || user.id;
    
    const newReview: Review = {
      id: reviewId,
      name: userName,
      date: currentDate,
      rating: values.rating,
      text: values.reviewText,
      isMustVisit: values.isMustVisit,
      isHiddenGem: values.isHiddenGem,
      userId: user.id // Store the user ID to check for duplicate reviews
    };
    
    // Add the new review to the state
    const updatedReviews = [newReview, ...userReviews];
    setUserReviews(updatedReviews);
    
    // Calculate new average rating
    const newAverageRating = calculateAverageRating(updatedReviews);
    setAverageRating(newAverageRating);
    
    // Save to localStorage
    if (id) {
      storeReviews(id, updatedReviews);
    }
    
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
  
  // Use user ratings if available, otherwise fall back to location rating
  const displayRating = userReviews.length > 0 ? averageRating : (location?.rating || 4.5);

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
              rating={displayRating}
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
              locationRating={displayRating}
              locationId={location.id}
              locationName={location.name}
              onSubmitReview={handleSubmitReview}
              currentUser={user}
              hasUserReviewed={userReviews.some(review => review.userId === (user?.id || null))}
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
