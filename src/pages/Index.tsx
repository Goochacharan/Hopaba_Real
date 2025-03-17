
import React, { useState } from 'react';
import MainLayout from '@/components/MainLayout';
import AnimatedLogo from '@/components/AnimatedLogo';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEnhancing, setIsEnhancing] = useState<string | null>(null);

  // Sample example queries
  const exampleQueries = [
    {
      text: "Find me a cozy café nearby",
      icon: "☕"
    }, {
      text: "Looking for a Kannada-speaking actor",
      icon: "🎭"
    }, {
      text: "Best electrician in Jayanagar",
      icon: "⚡"
    }, {
      text: "Where can I buy a pre-owned bike?",
      icon: "🏍️"
    }, {
      text: "Recommend a good Italian restaurant",
      icon: "🍕"
    }, {
      text: "Find a flower shop in Koramangala",
      icon: "🌸"
    }, {
      text: "Best dance classes for kids",
      icon: "💃"
    }, {
      text: "Need a plumber for water leak",
      icon: "🔧"
    }, {
      text: "Bookstores with rare collections",
      icon: "📚"
    }, {
      text: "Top rated hair salon near me",
      icon: "💇"
    }, {
      text: "Auto repair shops open on Sunday",
      icon: "🔧"
    }, {
      text: "Pet-friendly cafes in Indiranagar",
      icon: "🐶"
    }, {
      text: "Yoga classes for beginners",
      icon: "🧘"
    }, {
      text: "Wedding photographers with good reviews",
      icon: "📸"
    }, {
      text: "Where to buy organic vegetables",
      icon: "🥦"
    }, {
      text: "Best dentists that accept insurance",
      icon: "🦷"
    }, {
      text: "Computer repair services near me",
      icon: "💻"
    }, {
      text: "Piano teachers for adults",
      icon: "🎹"
    }, {
      text: "Tailors who can alter ethnic wear",
      icon: "👔"
    }, {
      text: "Schools with good sports programs",
      icon: "🏫"
    }
  ];

  const enhanceSearchQuery = async (rawQuery: string) => {
    if (!rawQuery.trim()) return rawQuery;
    
    setIsEnhancing(rawQuery);
    try {
      const { data, error } = await supabase.functions.invoke('enhance-search', {
        body: { query: rawQuery }
      });
      
      if (error) {
        console.error('Error enhancing search:', error);
        return rawQuery;
      }
      
      console.log('AI enhanced search:', data);
      
      if (data.enhanced && data.enhanced !== rawQuery) {
        toast({
          title: "Search enhanced with AI",
          description: `We improved your search to: "${data.enhanced}"`,
          duration: 5000
        });
        
        return data.enhanced;
      }
      
      return rawQuery;
    } catch (err) {
      console.error('Failed to enhance search:', err);
      return rawQuery;
    } finally {
      setIsEnhancing(null);
    }
  };

  const handleSearch = async (query: string) => {
    if (query.trim()) {
      // Enhance the search query with DeepSeek AI
      const enhancedQuery = await enhanceSearchQuery(query);
      navigate(`/search?q=${encodeURIComponent(enhancedQuery)}`);
    }
  };
  
  return (
    <MainLayout>
      <section className="flex flex-col items-center justify-center py-4 md:py-6">
        <div className="text-center mb-8 animate-fade-in">
          <AnimatedLogo size="lg" className="mx-auto mb-4" />
          <h1 className="text-3xl sm:text-4xl font-medium tracking-tight">Hopaba</h1>
        </div>

        <div className="w-full max-w-2xl mx-auto">
          <ScrollArea className="h-[360px] w-full px-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2 pr-4">
              {exampleQueries.map((example, idx) => (
                <Button 
                  key={idx} 
                  variant="outline" 
                  onClick={() => handleSearch(example.text)} 
                  className="justify-start h-auto border-border/50 text-left px-[17px] py-2 rounded-md text-neutral-900 bg-pink-300 hover:bg-pink-200 overflow-hidden"
                  disabled={isEnhancing === example.text}
                >
                  <div className="mr-3 text-base">{example.icon}</div>
                  <span className="font-normal text-sm sm:text-base truncate">{example.text}</span>
                  {isEnhancing === example.text && (
                    <Sparkles className="h-4 w-4 ml-2 animate-pulse" />
                  )}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
