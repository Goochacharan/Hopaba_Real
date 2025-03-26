import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/MainLayout';
import { ArrowLeft } from 'lucide-react';
import { getRecommendationById } from '@/lib/mockData';
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
  text: 'Amazing teaching methods! My son has been learning flute here for 6 months and has shown incredible progress. Highly recommend for beginners.'
}, {
  id: '2',
  name: 'Raj Patel',
  date: '1 month ago',
  rating: 4,
  text: 'Very professional instruction. The teacher is patient and knowledgeable. Good for all age groups.'
}, {
  id: '3',
  name: 'Ananya Sharma',
  date: '2 months ago',
  rating: 5,
  text: 'Best flute classes in Bangalore! The instructor is very skilled and has a great way of teaching complex techniques in simple ways.'
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
    setTimeout(() => {
      const foundLocation = getRecommendationById(id);
      if (foundLocation) {
        setLocation(foundLocation);
      } else {
        toast({
          title: "Location not found",
          description: "We couldn't find the location you're looking for",
          variant: "destructive"
        });
        navigate('/');
      }
      setLoading(false);
    }, 500);
  }, [id, navigate, toast]);

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
