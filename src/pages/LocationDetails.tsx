
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/MainLayout';
import { Phone, MessageSquare, MapPin, Clock, DollarSign, Languages, Award, Calendar, ExternalLink, ArrowLeft, HelpCircle } from 'lucide-react';
import { getRecommendationById } from '@/lib/mockData';

const LocationDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [location, setLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  
  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }
    
    // Simulate loading data
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
  
  const handleAskQuestion = (text?: string) => {
    const questionText = text || question;
    if (!questionText.trim()) return;
    
    toast({
      title: "Question Sent",
      description: "We've sent your question and will notify you when there's a response",
      duration: 3000,
    });
    
    setQuestion('');
  };
  
  // Predefined suggested questions
  const suggestedQuestions = [
    "What is their experience?",
    "What are their qualifications?",
    "Do they offer trial classes?",
    "What age groups do they teach?"
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
                
                <div className="grid grid-cols-2 gap-4">
                  <Button onClick={handleCall} className="bg-blue-600 hover:bg-blue-700">
                    <Phone className="mr-2 h-4 w-4" />
                    Call
                  </Button>
                  <Button onClick={handleChat} className="bg-blue-600 hover:bg-blue-700">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Chat
                  </Button>
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
          </div>
          
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden p-6">
              <h3 className="font-medium mb-4">Suggested Questions</h3>
              <div className="space-y-2">
                {suggestedQuestions.map((q, index) => (
                  <button
                    key={index}
                    onClick={() => handleAskQuestion(q)}
                    className="flex w-full items-center gap-2 text-sm text-left py-2 px-3 rounded-lg hover:bg-secondary/70 transition-colors"
                  >
                    <HelpCircle className="w-4 h-4 text-muted-foreground" />
                    <span>{q}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden p-6">
              <h3 className="font-medium mb-4">Ask a question</h3>
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
                    disabled={!question.trim()}
                  >
                    <ExternalLink className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default LocationDetails;
