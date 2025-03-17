
import React from 'react';
import MainLayout from '@/components/MainLayout';
import AnimatedLogo from '@/components/AnimatedLogo';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const Index = () => {
  const navigate = useNavigate();

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

  const handleSearch = (query: string) => {
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };
  
  return (
    <MainLayout>
      <section className="flex flex-col items-center justify-center py-4 md:py-6">
        <div className="text-center mb-4 animate-fade-in">
          <AnimatedLogo size="lg" className="mx-auto mb-4" />
          <h1 className="text-3xl sm:text-4xl font-medium tracking-tight mb-2">Hopaba</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            What are you looking for today? A hidden gem café, a skilled plumber, or the best salon in town? Just ask me!
          </p>
        </div>

        <div className="w-full max-w-2xl mx-auto mb-4">
          <ScrollArea className="h-[300px] w-full px-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2 pr-4">
              {exampleQueries.map((example, idx) => (
                <Button 
                  key={idx} 
                  variant="outline" 
                  onClick={() => handleSearch(example.text)} 
                  className="justify-start h-auto border-border/50 text-left px-[17px] py-0 rounded-md text-neutral-900 bg-pink-300 hover:bg-pink-200"
                >
                  <div className="mr-3 text-xl">{example.icon}</div>
                  <span className="font-normal">{example.text}</span>
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
