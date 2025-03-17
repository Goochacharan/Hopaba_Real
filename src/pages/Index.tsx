import React from 'react';
import MainLayout from '@/components/MainLayout';
import AnimatedLogo from '@/components/AnimatedLogo';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  // Only keeping the wedding photographers example
  const exampleQuery = {
    text: "Wedding photographers with good reviews",
    icon: "📸"
  };

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
            What are you looking for today? Just ask me!
          </p>
        </div>

        <div className="w-full max-w-2xl mx-auto mb-4">
          <div className="flex justify-center mb-2">
            <Button 
              variant="outline" 
              onClick={() => handleSearch(exampleQuery.text)} 
              className="justify-start h-auto border-border/50 text-left px-[17px] py-3 rounded-md text-neutral-900 bg-pink-300 hover:bg-pink-200 w-full max-w-md"
            >
              <Camera className="mr-3 h-5 w-5" />
              <span className="font-normal">{exampleQuery.text}</span>
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
