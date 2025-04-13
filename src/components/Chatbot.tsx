
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SendHorizontal, Loader2, MapPin, Star, Tag, CalendarClock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNavigate } from 'react-router-dom';

interface Message {
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  results?: BusinessResult[];
}

interface BusinessResult {
  id: string;
  name: string;
  category: string;
  description?: string;
  address?: string;
  area?: string;
  city?: string;
  rating?: number;
  similarity: number;
  tags?: string[];
}

interface ChatbotResponse {
  results: BusinessResult[];
  message?: string;
  error?: string;
}

const Chatbot: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      content: "Hello! I can help you find businesses in your area. Try asking something like 'Show me top rated restaurants in Nagarbhavi'",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    
    // Add user message to chat
    setMessages(prev => [...prev, {
      content: userMessage,
      sender: 'user',
      timestamp: new Date(),
    }]);
    
    setLoading(true);
    
    try {
      // Call our edge function
      const { data, error } = await supabase.functions.invoke('chatbot-data', {
        body: { query: userMessage }
      });
      
      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(`Error communicating with the server: ${error.message}`);
      }
      
      const response = data as ChatbotResponse;
      
      if (response.error) {
        console.error("Chatbot response error:", response.error);
        throw new Error(response.error);
      }
      
      // Add a processing message
      setMessages(prev => [...prev, {
        content: "Processing your query...",
        sender: 'bot',
        timestamp: new Date(),
      }]);

      // If we have results, redirect to search results page
      if (response.results && response.results.length > 0) {
        // Extract keywords from results for better search terms
        const keywords = response.results
          .flatMap((result) => [
            result.category,
            ...(result.tags || [])
          ])
          .filter(Boolean)
          .slice(0, 3)
          .join(' ');
          
        // Create an enhanced query with extracted keywords
        const enhancedQuery = keywords ? `${userMessage} ${keywords}`.trim() : userMessage;
        
        // Short delay to allow user to see the processing message
        setTimeout(() => {
          const searchParams = new URLSearchParams();
          searchParams.set('q', enhancedQuery);
          navigate(`/search?${searchParams.toString()}`);
        }, 1000);
      } else {
        // If no results, just inform the user
        setMessages(prev => [...prev, {
          content: "I couldn't find any businesses matching your query. Could you try with different terms or locations?",
          sender: 'bot',
          timestamp: new Date(),
        }]);
        setLoading(false);
      }
      
    } catch (error) {
      console.error("Error querying chatbot:", error);
      
      // Show error toast
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
      
      // Add error message to chat
      setMessages(prev => [...prev, {
        content: "I'm sorry, I encountered an error while processing your request. Please try again later.",
        sender: 'bot',
        timestamp: new Date(),
      }]);
      
      setLoading(false);
    }
  };

  // Render star rating
  const renderStars = (rating?: number) => {
    if (!rating) return "No ratings yet";
    
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    return (
      <div className="flex items-center">
        {[...Array(fullStars)].map((_, i) => (
          <Star key={`full-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        ))}
        {hasHalfStar && (
          <span className="relative">
            <Star className="h-4 w-4 text-muted" />
            <Star className="absolute left-0 top-0 h-4 w-4 overflow-hidden fill-yellow-400 text-yellow-400" style={{ clipPath: 'inset(0 50% 0 0)' }} />
          </span>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <Star key={`empty-${i}`} className="h-4 w-4 text-muted" />
        ))}
      </div>
    );
  };

  // Render business result card
  const renderBusinessCard = (business: BusinessResult) => {
    return (
      <Card key={business.id} className="mb-2 overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">{business.name}</CardTitle>
          <div className="flex justify-between items-center">
            <Badge variant="outline" className="bg-primary/10 text-primary">
              {business.category}
            </Badge>
            {renderStars(business.rating)}
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          {business.description && (
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {business.description}
            </p>
          )}
          
          <div className="flex items-center text-xs text-muted-foreground mb-1">
            <MapPin className="h-3 w-3 mr-1" />
            <span>
              {[business.area, business.city].filter(Boolean).join(", ")}
            </span>
          </div>
          
          {business.tags && business.tags.length > 0 && (
            <div className="flex items-center gap-1 mt-2 flex-wrap">
              <Tag className="h-3 w-3" />
              {business.tags.map((tag, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs px-1 py-0">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Card className="w-full max-w-md mx-auto h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
            🤖
          </span>
          <span>Business Finder</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto">
        <div className="space-y-4 pb-4">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start gap-2 max-w-[85%] ${message.sender === 'user' ? '' : 'flex-1'}`}>
                {message.sender === 'bot' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>🤖</AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`rounded-lg px-4 py-2 ${
                  message.sender === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                  }`}
                >
                  {message.content}
                </div>
                
                {message.sender === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>👤</AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      
      <CardFooter>
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            placeholder="Ask about businesses..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={loading || !input.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <SendHorizontal className="h-4 w-4" />}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default Chatbot;
