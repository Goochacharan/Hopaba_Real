import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/MainLayout';
import { ArrowLeft, Star, Award, Gem } from 'lucide-react';
import { getRecommendationById } from '@/lib/mockData';
import { useIsMobile } from '@/hooks/use-mobile';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import ImageViewer from '@/components/ImageViewer';
import { supabase } from '@/integrations/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Toggle } from '@/components/ui/toggle';

interface Review {
  id: string;
  name: string;
  date: string;
  rating: number;
  text: string;
  isMustVisit?: boolean;
  isHiddenGem?: boolean;
}

const reviews: Review[] = [{
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

const TOTAL_REVIEW_COUNT = 153;

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  reviewText: z.string().min(3, "Review must be at least 3 characters").max(500, "Review cannot exceed 500 characters"),
  isMustVisit: z.boolean().default(false),
  isHiddenGem: z.boolean().default(false)
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

const LocationDetails = () => {
  const { id } = useParams<{ id: string; }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [location, setLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [reviewFormVisible, setReviewFormVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState<boolean[]>([]);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const isMobile = useIsMobile();
  const [user, setUser] = useState<any>(null);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      reviewText: "",
      isMustVisit: false,
      isHiddenGem: false
    }
  });

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
        const locationImages = foundLocation.images && foundLocation.images.length > 0 ? foundLocation.images : [foundLocation.image];
        setImageLoaded(Array(locationImages.length).fill(false));
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

  const handleImageLoad = (index: number) => {
    setImageLoaded(prev => {
      const newState = [...prev];
      newState[index] = true;
      return newState;
    });
  };

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setImageViewerOpen(true);
  };

  const toggleReviewForm = () => {
    setReviewFormVisible(!reviewFormVisible);
    if (reviewFormVisible) {
      form.reset();
      setSelectedRating(0);
    }
  };

  const handleRatingSelect = (rating: number) => {
    setSelectedRating(rating);
    form.setValue("rating", rating);
  };

  const onSubmitReview = (values: ReviewFormValues) => {
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
    form.reset();
    setSelectedRating(0);
    setReviewFormVisible(false);
  };

  const allReviews = [...userReviews, ...reviews];

  if (loading) {
    return <MainLayout>
        <div className="container mx-auto py-4 px-4 max-w-none">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded w-2/3"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </MainLayout>;
  }

  if (!location) return null;

  const locationImages = location.images && location.images.length > 0 ? location.images : [location.image];

  return <MainLayout>
      <div className="container mx-auto py-4 max-w-none px-[7px]">
        <Button variant="ghost" size="sm" className="mb-4 pl-0 text-muted-foreground" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to results
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden mb-6">
              <div className="w-full h-[400px] relative overflow-hidden">
                <Carousel className="w-full h-full">
                  <CarouselContent className="h-full">
                    {locationImages.map((img: string, index: number) => (
                      <CarouselItem key={index} className="h-full relative">
                        <div className={`absolute inset-0 bg-muted/30 ${imageLoaded[index] ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`} />
                        <img 
                          src={img} 
                          alt={`${location.name} - image ${index + 1}`} 
                          className={`w-full h-[400px] object-cover transition-all duration-500 ${imageLoaded[index] ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'} cursor-pointer`} 
                          onLoad={() => handleImageLoad(index)}
                          onClick={() => handleImageClick(index)}
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {locationImages.length > 1 && <>
                      <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white/90" />
                      <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white/90" />
                    </>}
                </Carousel>
              </div>
              
              <div className="p-6">
                <div className="mb-2">
                  <h1 className="text-xl font-bold">{location.name}</h1>
                </div>
                
                <div className="flex items-center mb-4">
                  <div className="flex items-center text-amber-500">
                    <span className="text-lg font-semibold mr-1 text-amber-700">{location.rating}</span>
                    <Star className="fill-amber-500 w-4 h-4" />
                  </div>
                  <span className="text-xs text-muted-foreground ml-1">
                    ({TOTAL_REVIEW_COUNT} reviews)
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden mb-6 p-6">
              <h2 className="text-xl font-semibold mb-4">About {location.name}</h2>
              <p className="text-muted-foreground">{location.description}</p>
              
              <div className="mt-4">
                {location.tags.map((tag: string, i: number) => (
                  <span key={i} className="inline-block bg-secondary text-xs px-2 py-1 rounded-full text-muted-foreground mr-2 mb-2">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          
            <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden mb-6 p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Reviews</h2>
                <Button variant="outline" size="sm" onClick={toggleReviewForm} className="text-sm">
                  {reviewFormVisible ? "Cancel" : "Write a review"}
                </Button>
              </div>

              {reviewFormVisible && <div className="mb-6 p-4 bg-secondary/30 rounded-lg">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmitReview)} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Your rating</Label>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(rating => <button key={rating} type="button" onClick={() => handleRatingSelect(rating)} className="focus:outline-none">
                              <Star className={`w-6 h-6 ${rating <= selectedRating ? "text-amber-500 fill-amber-500" : "text-gray-300"}`} />
                            </button>)}
                          {form.formState.errors.rating && <p className="text-destructive text-xs ml-2">Please select a rating</p>}
                        </div>
                      </div>

                      <FormField control={form.control} name="reviewText" render={({
                        field
                      }) => <FormItem>
                            <FormLabel>Your review</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Share your experience with this place..." className="min-h-[100px]" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>} />

                      <div className="flex flex-col sm:flex-row gap-4 mt-4">
                        <FormField
                          control={form.control}
                          name="isMustVisit"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <Toggle 
                                pressed={field.value} 
                                onPressedChange={field.onChange}
                                className={`w-full h-12 gap-2 ${field.value ? 'bg-green-100 text-green-800 border-green-200' : ''}`}
                              >
                                <Award className={`h-5 w-5 ${field.value ? 'text-green-700' : ''}`} />
                                <span className="font-medium">Must Visit</span>
                              </Toggle>
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="isHiddenGem"
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <Toggle 
                                pressed={field.value} 
                                onPressedChange={field.onChange}
                                className={`w-full h-12 gap-2 ${field.value ? 'bg-purple-100 text-purple-800 border-purple-200' : ''}`}
                              >
                                <Gem className={`h-5 w-5 ${field.value ? 'text-purple-700' : ''}`} />
                                <span className="font-medium">Hidden Gem</span>
                              </Toggle>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end">
                        <Button type="submit" className="w-full sm:w-auto">
                          Submit review
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>}

              <div className="flex items-center mb-4">
                <span className="font-medium">
                  {TOTAL_REVIEW_COUNT} reviews
                </span>
                <div className="flex items-center ml-3 text-amber-500">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} className={i < Math.floor(location.rating) ? "fill-amber-500" : ""} />)}
                </div>
              </div>
              <div className="space-y-4">
                {allReviews.map(review => <div key={review.id} className="border-b border-border/50 pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">{review.name}</div>
                        <div className="text-xs text-muted-foreground">{review.date}</div>
                      </div>
                      <div className="flex items-center text-amber-500">
                        {[...Array(5)].map((_, i) => <Star key={i} size={14} className={i < review.rating ? "fill-amber-500" : ""} />)}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.text}</p>
                    {(review.isMustVisit || review.isHiddenGem) && (
                      <div className="flex gap-2 mt-2">
                        {review.isMustVisit && (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 gap-1.5">
                            <Award className="h-3.5 w-3.5" />
                            Must Visit
                          </Badge>
                        )}
                        {review.isHiddenGem && (
                          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 gap-1.5">
                            <Gem className="h-3.5 w-3.5" />
                            Hidden Gem
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>)}
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Question and answer section removed */}
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
    </MainLayout>;
};

export default LocationDetails;
