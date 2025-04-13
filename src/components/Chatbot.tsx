
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SendHorizontal, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
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
      
      // Format the response for the chat
      let botMessage = "";
      
      if (response.results && response.results.length > 0) {
        botMessage = formatResults(userMessage, response.results);
      } else {
        botMessage = "I couldn't find any businesses matching your query. Could you try with different terms or locations?";
      }
      
      // Add bot response to chat
      setMessages(prev => [...prev, {
        content: botMessage,
        sender: 'bot',
        timestamp: new Date(),
      }]);
      
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
    } finally {
      setLoading(false);
    }
  };

  const formatResults = (query: string, results: BusinessResult[]): string => {
    // Simple formatting of results
    let message = `Here are some recommendations based on your query:\n\n`;
    
    results.forEach((result, index) => {
      const ratingStars = result.rating 
        ? "★".repeat(Math.round(result.rating)) + "☆".repeat(5 - Math.round(result.rating))
        : "No ratings yet";
        
      message += `${index + 1}. **${result.name}** (${ratingStars})\n`;
      message += `   Category: ${result.category}\n`;
      
      if (result.address || result.area || result.city) {
        let location = "";
        if (result.address) location += result.address;
        if (result.area) location += (location ? ", " : "") + result.area;
        if (result.city) location += (location ? ", " : "") + result.city;
        
        message += `   Location: ${location}\n`;
      }
      
      if (result.description) {
        const shortDescription = result.description.length > 100 
          ? result.description.substring(0, 100) + "..." 
          : result.description;
        message += `   Description: ${shortDescription}\n`;
      }
      
      message += "\n";
    });
    
    return message;
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
              <div className="flex items-start gap-2 max-w-[80%]">
                {message.sender === 'bot' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>🤖</AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={`rounded-lg px-4 py-2 whitespace-pre-wrap ${
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.content.split('\n').map((line, i) => {
                    // Check if line contains bold text (wrapped in **)
                    if (line.includes('**')) {
                      const parts = line.split('**');
                      return (
                        <React.Fragment key={i}>
                          {parts.map((part, j) => (
                            // Every odd index is bold text
                            j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                          ))}
                          {i < message.content.split('\n').length - 1 && <br />}
                        </React.Fragment>
                      );
                    } else {
                      // Regular line without formatting
                      return (
                        <React.Fragment key={i}>
                          {line}
                          {i < message.content.split('\n').length - 1 && <br />}
                        </React.Fragment>
                      );
                    }
                  })}
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
