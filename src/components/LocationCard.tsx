
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { MapPin, Star, Clock, SendIcon, Search, Phone, MessageSquare, HelpCircle, Calendar, ParkingCircle, Utensils } from 'lucide-react';
import { Recommendation } from '@/lib/mockData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface LocationCardProps {
  recommendation: Recommendation;
  className?: string;
}

interface FollowUpAnswer {
  question: string;
  answer: string;
  timestamp: string;
}

const LocationCard: React.FC<LocationCardProps> = ({ 
  recommendation, 
  className 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [followUpAnswers, setFollowUpAnswers] = useState<FollowUpAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFollowUpQuestion = (question?: string) => {
    const questionToAsk = question || followUpQuestion;
    if (!questionToAsk.trim()) return;
    
    setIsLoading(true);
    
    // Simulate API call for follow-up question answer
    setTimeout(() => {
      const answers = [
        `${recommendation.name} is known for their excellent customer service and unique approach to ${recommendation.category.toLowerCase()}.`,
        `According to recent reviews, their most popular offerings are their premium services and their friendly staff.`,
        `They're particularly busy on weekends, so it's recommended to book in advance if that's when you plan to visit.`,
        `They've been serving the community for over 5 years and have built a strong reputation for quality.`
      ];
      
      // Select a random answer
      const randomAnswer = answers[Math.floor(Math.random() * answers.length)];
      
      // Format current time
      const now = new Date();
      const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      // Add to answers history instead of replacing
      setFollowUpAnswers(prev => [
        ...prev, 
        { 
          question: questionToAsk, 
          answer: randomAnswer,
          timestamp: timeString
        }
      ]);
      
      setIsLoading(false);
      setFollowUpQuestion(''); // Clear the input after submission
      
      toast({
        title: "Response received",
        description: "We've got more information about this place for you",
        duration: 3000,
      });
    }, 1500);
  };

  const handleCall = () => {
    // Simulate phone functionality - would integrate with real phone API
    toast({
      title: "Calling",
      description: `Calling ${recommendation.name}...`,
      duration: 3000,
    });
  };

  const handleWhatsApp = () => {
    // Simulate WhatsApp integration - would open WhatsApp with predefined message
    toast({
      title: "Opening WhatsApp",
      description: `Messaging ${recommendation.name} via WhatsApp...`,
      duration: 3000,
    });
  };

  // Predefined follow-up questions with their icons
  const quickQuestions = [
    { text: "What services do they offer?", icon: <HelpCircle className="w-3 h-3" /> },
    { text: "Do they have reservations?", icon: <Calendar className="w-3 h-3" /> },
    { text: "Is parking available?", icon: <ParkingCircle className="w-3 h-3" /> },
    { text: "Popular items?", icon: <Utensils className="w-3 h-3" /> },
  ];

  return (
    <div 
      className={cn(
        "group bg-white rounded-xl border border-border/50 overflow-hidden transition-all-300",
        "hover:shadow-lg hover:border-primary/20 hover:scale-[1.01]",
        className
      )}
    >
      <div className="relative w-full h-48 overflow-hidden">
        <div className={cn(
          "absolute inset-0 bg-muted/30",
          imageLoaded ? "opacity-0" : "opacity-100"
        )} />
        <img
          src={recommendation.image}
          alt={recommendation.name}
          onLoad={() => setImageLoaded(true)}
          className={cn(
            "w-full h-full object-cover transition-all-500",
            imageLoaded ? "opacity-100 blur-0" : "opacity-0 blur-sm"
          )}
        />
        <div className="absolute top-3 left-3">
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-black/40 backdrop-blur-sm text-white">
            {recommendation.category}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-lg">{recommendation.name}</h3>
          <div className="flex items-center gap-1 text-amber-500">
            <Star className="fill-amber-500 w-4 h-4" />
            <span className="text-sm">{recommendation.rating}</span>
          </div>
        </div>

        <div className="flex items-center text-muted-foreground mb-3 text-sm">
          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
          <span className="truncate">{recommendation.address}</span>
        </div>

        {recommendation.openNow !== undefined && (
          <div className="flex items-center justify-between text-sm mb-3">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className={recommendation.openNow ? "text-emerald-600" : "text-rose-600"}>
                {recommendation.openNow ? "Open now" : "Closed"}
              </span>
              {recommendation.hours && (
                <span className="text-muted-foreground ml-1">
                  {recommendation.hours}
                </span>
              )}
            </div>
            <div className="text-muted-foreground">
              {recommendation.distance}
            </div>
          </div>
        )}

        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {recommendation.description}
        </p>

        <div className="flex gap-2 mt-auto">
          {recommendation.tags.map((tag, index) => (
            <span 
              key={index} 
              className="bg-secondary text-xs px-2 py-1 rounded-full text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Contact buttons */}
        <div className="flex gap-2 mt-4">
          <Button 
            onClick={handleCall} 
            variant="outline" 
            size="sm" 
            className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
          >
            <Phone className="mr-1 h-4 w-4" />
            Call
          </Button>
          <Button 
            onClick={handleWhatsApp} 
            variant="outline" 
            size="sm" 
            className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
          >
            <MessageSquare className="mr-1 h-4 w-4" />
            Message
          </Button>
        </div>
      </div>

      <div className="px-4 py-3 bg-secondary/50 border-t border-border/50">
        {/* Show all follow-up answers instead of just the latest one */}
        {followUpAnswers.length > 0 && (
          <div className="mb-4 space-y-3 max-h-80 overflow-y-auto">
            {followUpAnswers.map((item, index) => (
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
        
        {/* Quick question chips */}
        <div className="flex flex-wrap gap-2 mb-3">
          {quickQuestions.map((question, index) => (
            <button
              key={index}
              onClick={() => handleFollowUpQuestion(question.text)}
              className="flex items-center gap-1.5 bg-white border border-border/60 rounded-full px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
            >
              {question.icon}
              <span>{question.text}</span>
            </button>
          ))}
        </div>
        
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleFollowUpQuestion();
          }}
          className="flex items-center rounded-lg border border-border/50 bg-white/90 backdrop-blur-sm shadow-sm overflow-hidden transition-all hover:border-primary/20 hover:shadow"
        >
          <div className="flex-1 flex items-center pl-4">
            <Search className="h-4 w-4 text-muted-foreground mr-2 flex-shrink-0" />
            <input
              value={followUpQuestion}
              onChange={(e) => setFollowUpQuestion(e.target.value)}
              placeholder="Ask anything about this place..."
              className="flex-1 bg-transparent border-none outline-none text-sm py-3"
            />
          </div>
          <Button 
            type="submit"
            size="sm" 
            variant="ghost"
            disabled={isLoading || !followUpQuestion.trim()}
            className="h-full rounded-none px-4"
          >
            {isLoading ? (
              <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <SendIcon className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default LocationCard;
