import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/MainLayout';
import { Phone, MessageCircle, MapPin, Clock, DollarSign, Languages, Award, Calendar, ExternalLink, ArrowLeft, HelpCircle, Star, Navigation2, Share2 } from 'lucide-react';
import { getRecommendationById } from '@/lib/mockData';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';

const LocationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [location, setLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [questionAnswers, setQuestionAnswers] = useState<{ question: string; answer: string; timestamp: string }[]>([]);
  const [askingQuestion, setAskingQuestion] = useState(false);
  const isMobile = useIsMobile();
  
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
          variant: "destructive",
        });
        navigate('/');
      }
      setLoading(false);
    }, 500);
  }, [id, navigate, toast]);
  
  const handleCall = () => {
    toast({
      title: "Calling",
      description: `Calling ${location?.name}...`,
      duration: 3000,
    });
  };

  const handleChat = () => {
    toast({
      title: "Opening Chat",
      description: `Starting chat with ${location?.name}...`,
      duration: 3000,
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
      duration: 2000,
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: location.name,
        text: `Check out ${location.name}`,
        url: window.location.origin + `/location/${location.id}`,
      })
      .then(() => {
        toast({
          title: "Shared successfully",
          description: `You've shared ${location.name}`,
          duration: 2000,
        });
      })
      .catch((error) => {
        console.error('Error sharing:', error);
        toast({
          title: "Sharing failed",
          description: "Could not share this location",
          variant: "destructive",
          duration: 2000,
        });
      });
    } else {
      const shareUrl = window.location.origin + `/location/${location.id}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        toast({
          title: "Link copied",
          description: "The link has been copied to your clipboard",
          duration: 2000,
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
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
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
        duration: 3000,
      });
    }, 1000);
  };
  
  const suggestedQuestions = [
    "What services do they offer?",
    "What are their qualifications?",
    "Do they offer trial classes?",
    "What age groups do they teach?",
    "Do they have experience with beginners?",
    "What is the class duration?",
    "What is their teaching style?",
    "How much experience do they have?",
    "Do they teach online?",
    "What is their cancellation policy?"
  ];
  
  if (loading) {
    return (
      <MainLayout>
        <div className="container max-w-4xl mx-auto py-8">
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
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-4 pl-0 text-muted-foreground" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to results
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden mb-6">
              <div className="h-64 w-full overflow-hidden">
                <img src={location.image} alt={location.name} className="w-full h-full object-cover" />
              </div>
              
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h1 className="text-2xl font-bold">{location.name}</h1>
                  <div className="flex items-center bg-amber-50 text-amber-700 rounded-full px-3 py-1">
                    <span className="text-lg font-semibold mr-1">{location.rating}</span>
                    <span className="text-amber-500">★</span>
                  </div>
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
                    <Phone className="h-5 w-5 text-muted-foreground mr-3 mt-0.5 flex-shrink-0" />
                    <span>+91 76543 56565</span>
                  </div>
                  
                  <div className="flex items-start">
                    <DollarSign className="h-5 w-5 text-muted-foreground mr-3 mt-0.5 flex-shrink-0" />
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
                
                <div className="grid grid-cols-4 gap-3">
                  <button 
                    onClick={handleCall} 
                    className="flex-1 h-12 px-4 rounded-full border border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center justify-center"
                  >
                    <Phone className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={handleChat} 
                    className="flex-1 h-12 px-4 rounded-full border border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center justify-center"
                  >
                    <MessageCircle className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={handleDirections} 
                    className="flex-1 h-12 px-4 rounded-full border border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center justify-center"
                  >
                    <Navigation2 className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={handleShare} 
                    className="flex-1 h-12 px-4 rounded-full border border-emerald-200 bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100 transition-colors flex items-center justify-center"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden mb-6 p-6">
              <h2 className="text-xl font-semibold mb-4">About</h2>
              <p className="text-muted-foreground">{location.description}</p>
              
              <div className="mt-4">
                {location.tags.map((tag: string, i: number) => (
                  <span 
                    key={i} 
                    className="inline-block bg-secondary text-xs px-2 py-1 rounded-full text-muted-foreground mr-2 mb-2"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden mb-6 p-6">
              <h2 className="text-xl font-semibold mb-4">Reviews</h2>
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="border-b border-border/50 pb-4 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">{review.name}</div>
                        <div className="text-xs text-muted-foreground">{review.date}</div>
                      </div>
                      <div className="flex items-center text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className={i < review.rating ? "fill-amber-500" : ""} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden p-6">
              <h3 className="font-medium mb-4">Questions & Answers</h3>
              {questionAnswers.length > 0 && (
                <div className="mb-4 space-y-3 max-h-80 overflow-y-auto">
                  {questionAnswers.map((item, index) => (
                    <div key={index} className="p-4 bg-secondary/70 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-medium text-primary">{item.question}</p>
                        <span className="text-xs text-muted-foreground">{item.timestamp}</span>
                      </div>
                      <p className="text-sm">{item.answer}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden p-6">
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask a question about this place..."
                    className="w-full rounded-lg border border-border p-3 pr-10"
                  />
                  <button 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary"
                    onClick={() => handleAskQuestion()}
                    disabled={!question.trim() || askingQuestion}
                  >
                    {askingQuestion ? (
                      <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <ExternalLink className="h-5 w-5" />
                    )}
                  </button>
                </div>
                
                <ScrollArea className="w-full whitespace-nowrap pb-4">
                  <div className="flex gap-2 w-max">
                    {suggestedQuestions.map((q, index) => (
                      <button
                        key={index}
                        onClick={() => handleAskQuestion(q)}
                        className="flex items-center gap-2 text-sm py-2 px-4 rounded-full border border-border hover:bg-secondary/70 transition-colors whitespace-nowrap"
                      >
                        <HelpCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <span>{q}</span>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default LocationDetails;
