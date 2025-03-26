import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/MainLayout';
import { MessageCircle, MapPin, Clock, IndianRupee, Languages, Award, Calendar, ArrowLeft, Star, Navigation2, Share2, Phone, Sparkles } from 'lucide-react';
import { getRecommendationById } from '@/lib/mockData';
import { ScrollArea } from '@/components/ui/scroll-area';
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

interface Review {
  id: string;
  name: string;
  date: string;
  rating: number;
  text: string;
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
  reviewText: z.string().min(3, "Review must be at least 3 characters").max(500, "Review cannot exceed 500 characters")
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

const LocationDetails = () => {
  const { id } = useParams<{ id: string; }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [location, setLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [questionAnswers, setQuestionAnswers] = useState<{
    question: string;
    answer: string;
    timestamp: string;
  }[]>([]);
  const [askingQuestion, setAskingQuestion] = useState(false);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [selectedRating, setSelectedRating] = useState<number>(0);
  const [reviewFormVisible, setReviewFormVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState<boolean[]>([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const isMobile = useIsMobile();
  const [user, setUser] = useState<any>(null);
  const [hiddenGemCount, setHiddenGemCount] = useState<number>(15);
  const [mustVisitCount, setMustVisitCount] = useState<number>(22);
  const [userRatedAs, setUserRatedAs] = useState<string | null>(null);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      reviewText: ""
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
        
        setHiddenGemCount(Math.floor(Math.random() * 40) + 5);
        setMustVisitCount(Math.floor(Math.random() * 40) + 5);
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

  const handleCall = () => {
    toast({
      title: "Calling",
      description: `Calling ${location?.name}...`,
      duration: 3000
    });
  };

  const handleChat = () => {
    toast({
      title: "Opening Chat",
      description: `Starting chat with ${location?.name}...`,
      duration: 3000
    });
  };

  const handleDirections = () => {
    const destination = encodeURIComponent(location.address);
    let mapsUrl;
    if (isMobile && /iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      mapsUrl = `maps://maps.apple.com/?q=${destination}`;
    } else {
      mapsUrl = `https://www.google.com/maps/search/?api=1&query=${destination}`;
    }
    window.open(mapsUrl, '_blank');
    toast({
      title: "Opening Directions",
      description: `Getting directions to ${location?.name}...`,
      duration: 2000
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: location.name,
        text: `Check out ${location.name}`,
        url: window.location.origin + `/location/${location.id}`
      }).then(() => {
        toast({
          title: "Shared successfully",
          description: `You've shared ${location.name}`,
          duration: 2000
        });
      }).catch(error => {
        console.error('Error sharing:', error);
        toast({
          title: "Sharing failed",
          description: "Could not share this location",
          variant: "destructive"
        });
      });
    } else {
      const shareUrl = window.location.origin + `/location/${location.id}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast({
          title: "Link copied",
          description: "The link has been copied to your clipboard",
          duration: 2000
        });
      });
    }
  };

  const handleAskQuestion = (text?: string) => {
    const questionText = text || question;
    if (!questionText.trim()) return;
    setAskingQuestion(true);
    const answers = {
      "What services do they offer?": `${location?.name} offers specialized ${location?.category.toLowerCase()} instruction for all age groups, including beginners and advanced students.`,
      "What is their experience?": `${location?.name} has over 12 years of teaching experience and has trained numerous award-winning students.`,
      "What are their qualifications?": `${location?.name} holds advanced degrees in music and is certified by prestigious music academies.`,
      "Do they offer trial classes?": "Yes, they offer a free trial class for new students to assess their teaching style and methodology.",
      "What age groups do they teach?": "They teach students of all age groups, from 5 years old to adults, with specialized curriculum for each group.",
      "Do they have experience with beginners?": "They have extensive experience working with beginners and have developed special techniques to make learning enjoyable.",
      "What is the class duration?": "Classes typically last 45-60 minutes depending on the student's age and experience level.",
      "Do they provide instruments?": "Students are encouraged to bring their own instruments, but they do have a few instruments available for beginners."
    };
    let answer = answers[questionText as keyof typeof answers];
    if (!answer) {
      answer = `Thank you for your question about ${location?.name}. They would be happy to provide more information about "${questionText}" when you contact them directly.`;
    }
    const now = new Date();
    const timeString = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
    setTimeout(() => {
      setQuestionAnswers(prev => [...prev, {
        question: questionText,
        answer,
        timestamp: timeString
      }]);
      setQuestion('');
      setAskingQuestion(false);
      toast({
        title: "Question Answered",
        description: "We've received an answer to your question",
        duration: 3000
      });
    }, 1000);
  };

  const suggestedQuestions = ["What services do they offer?", "What are their qualifications?", "Do they offer trial classes?", "What age groups do they teach?", "Do they have experience with beginners?", "What is the class duration?", "What is their teaching style?", "How much experience do they have?", "Do they teach online?", "What is their cancellation policy?"];

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
      text: values.reviewText
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

  const handleRatePlace = (ratingType: 'hidden-gem' | 'must-visit') => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to rate this place",
        variant: "destructive"
      });
      return;
    }

    if (userRatedAs === ratingType) {
      if (ratingType === 'hidden-gem') {
        setHiddenGemCount(prev => Math.max(0, prev - 1));
      } else {
        setMustVisitCount(prev => Math.max(0, prev - 1));
      }
      setUserRatedAs(null);
      toast({
        title: "Rating removed",
        description: `Your "${ratingType === 'hidden-gem' ? 'Hidden Gem' : 'Must Visit'}" rating has been removed`,
        duration: 2000
      });
    } else {
      if (userRatedAs === 'hidden-gem' && ratingType === 'must-visit') {
        setHiddenGemCount(prev => Math.max(0, prev - 1));
        setMustVisitCount(prev => prev + 1);
      } else if (userRatedAs === 'must-visit' && ratingType === 'hidden-gem') {
        setMustVisitCount(prev => Math.max(0, prev - 1));
        setHiddenGemCount(prev => prev + 1);
      } else if (ratingType === 'hidden-gem') {
        setHiddenGemCount(prev => prev + 1);
      } else {
        setMustVisitCount(prev => prev + 1);
      }
      
      setUserRatedAs(ratingType);
      toast({
        title: "Place rated",
        description: `You've rated this as a "${ratingType === 'hidden-gem' ? 'Hidden Gem' : 'Must Visit'}" place`,
        duration: 2000
      });
    }
  };

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
              <div className="w-full h-72 relative overflow-hidden">
                <Carousel className="w-full h-full">
                  <CarouselContent className="h-full">
                    {locationImages.map((img: string, index: number) => (
                      <CarouselItem key={index} className="h-full relative">
                        <div className={`absolute inset-0 bg-muted/30 ${imageLoaded[index] ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`} />
                        <img 
                          src={img} 
                          alt={`${location.name} - image ${index + 1}`} 
                          className={`w-full h-72 object-cover transition-all duration-500 ${imageLoaded[index] ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'} cursor-pointer`} 
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
                    {TOTAL_REVIEW_COUNT} reviews
                  </span>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-muted-foreground mr-3 mt-0.5 flex-shrink-0" />
                    <span>{location.address}</span>
                  </div>
                  
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-muted-foreground mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className={location.openNow ? "text-emerald-600 font-medium" : "text-rose-600 font-medium"}>
                        {location.openNow ? "Open now" : "Closed"}
                      </span>
                      <p className="text-muted-foreground">3:00 PM - 7:00 PM (Mon-Fri), 10:00 AM - 5:00 PM (Sat-Sun)</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <IndianRupee className="h-5 w-5 text-muted-foreground mr-3 mt-0.5 flex-shrink-0" />
                    <span>₹800 - ₹1200 per month</span>
                  </div>
                  
                  <div className="flex items-start">
                    <Award className="h-5 w-5 text-muted-foreground mr-3 mt-0.5 flex-shrink-0" />
                    <span>Experience: 12+ years teaching children</span>
                  </div>
                  
                  <div className="flex items-start">
                    <Languages className="h-5 w-5 text-muted-foreground mr-3 mt-0.5 flex-shrink-0" />
                    <span>Languages: English, Hindi, Kannada</span>
                  </div>
                  
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-muted-foreground mr-3 mt-0.5 flex-shrink-0" />
                    <span>Availability: After-school hours and weekends</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-4 mb-6">
                  <Button 
                    onClick={() => handleRatePlace('hidden-gem')}
                    variant={userRatedAs === 'hidden-gem' ? "default" : "outline"}
                    className={`flex items-center ${userRatedAs === 'hidden-gem' ? 'bg-purple-500 hover:bg-purple-600' : 'border-purple-200 text-purple-700 hover:bg-purple-50'}`}
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Hidden Gem ({hiddenGemCount})
                  </Button>
                  
                  <Button 
                    onClick={() => handleRatePlace('must-visit')}
                    variant={userRatedAs === 'must-visit' ? "default" : "outline"}
                    className={`flex items-center ${userRatedAs === 'must-visit' ? 'bg-orange-500 hover:bg-orange-600' : 'border-orange-200 text-orange-700 hover:bg-orange-50'}`}
                  >
                    <Award className="h-4 w-4 mr-2" />
                    Must Visit ({mustVisitCount})
                  </Button>
                </div>
                
                <div className="grid grid-cols-4 gap-3">
                  <button onClick={handleCall} className="flex-1 h-12 px-4 rounded-full border border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center justify-center">
                    <Phone className="h-5 w-5" />
                  </button>
                  <button onClick={handleChat} className="flex-1 h-12 px-4 rounded-full border border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center justify-center">
                    <MessageCircle className="h-5 w-5" />
                  </button>
                  <button onClick={handleDirections} className="flex-1 h-12 px-4 rounded-full border border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center justify-center">
                    <Navigation2 className="h-5 w-5" />
                  </button>
                  <button onClick={handleShare} className="flex-1 h-12 px-4 rounded-full border border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center justify-center">
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            
              <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden mb-6 p-6">
                <h2 className="text-xl font-semibold">{location.name}</h2>
                <p className="text-muted-foreground">{location.description}</p>
                
                <div className="mt-4">
                  {location.tags.map((tag: string, i: number) => <span key={i} className="inline-block bg-secondary text-xs px-2 py-1 rounded-full text-muted-foreground mr-2 mb-2">
                      {tag}
                    </span>)}
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
                        
                        {/* Added place rating options to review form */}
                        <div className="space-y-2">
                          <Label>Rate this place as (optional)</Label>
                          <div className="flex items-center gap-3 mt-2">
                            <Button 
                              type="button"
                              onClick={() => handleRatePlace('hidden-gem')}
                              variant={userRatedAs === 'hidden-gem' ? "default" : "outline"}
                              size="sm"
                              className={`flex items-center ${userRatedAs === 'hidden-gem' ? 'bg-purple-500 hover:bg-purple-600' : 'border-purple-200 text-purple-700 hover:bg-purple-50'}`}
                            >
                              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                              Hidden Gem
                            </Button>
                            
                            <Button 
                              type="button"
                              onClick={() => handleRatePlace('must-visit')}
                              variant={userRatedAs === 'must-visit' ? "default" : "outline"}
                              size="sm"
                              className={`flex items-center ${userRatedAs === 'must-visit' ? 'bg-orange-500 hover:bg-orange-600' : 'border-orange-200 text-orange-700 hover:bg-orange-50'}`}
                            >
                              <Award className="h-3.5 w-3.5 mr-1.5" />
                              Must Visit
                            </Button>
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
                    </div>)}
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden mb-6 p-6">
              <div className="space-y-4">
                <div className="relative">
                  <Input type="text" value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ask a question about this place" className="w-full pr-12 bg-[#F6F6F7] text-sm" />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#F1F1F1] hover:bg-[#E8E8E9] rounded-full w-8 h-8 flex items-center justify-center transition-colors" onClick={() => handleAskQuestion()} disabled={!question.trim() || askingQuestion}>
                    {askingQuestion ? <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /> : <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8E9196" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m3 3 3 9-3 9 19-9Z" />
                        <path d="M6 12h16" />
                      </svg>}
                  </button>
                </div>
                
                <ScrollArea className="w-full" orientation="horizontal">
                  <div className="flex gap-2 pb-2 px-1">
                    {suggestedQuestions.map((q, index) => (
                      <button 
                        key={index} 
                        onClick={() => handleAskQuestion(q)} 
                        className="flex-shrink-0 items-center gap-2 text-sm py-2 px-4 rounded-full border border-border hover:bg-secondary/70 transition-colors whitespace-nowrap"
                      >
                        <span>{q}</span>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden p-6">
              <h3 className="font-medium mb-4">Questions & Answers</h3>
              {questionAnswers.length > 0 && <div className="mb-4 space-y-3 max-h-80 overflow-y-auto">
                  {questionAnswers.map((item, index) => <div key={index} className="p-4 bg-secondary/70 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-medium text-primary">{item.question}</p>
                        <span className="text-xs text-muted-foreground">{item.timestamp}</span>
                      </div>
                      <p className="text-sm">{item.answer}</p>
                    </div>)}
                </div>}
            </div>
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
