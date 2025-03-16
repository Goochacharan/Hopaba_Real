
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import CategoryFilter from '@/components/CategoryFilter';
import LocationCard from '@/components/LocationCard';
import AnimatedLogo from '@/components/AnimatedLogo';
import useRecommendations from '@/hooks/useRecommendations';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const [initialLoad, setInitialLoad] = useState(true);
  const { toast } = useToast();
  const {
    recommendations,
    loading,
    error,
    query,
    category,
    handleSearch,
    handleCategoryChange
  } = useRecommendations({ initialQuery: '' });

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  useEffect(() => {
    // Simulating welcome message after initial render
    const timer = setTimeout(() => {
      toast({
        title: "Welcome to Locale",
        description: "Try searching for recommendations like 'suggest me a good unisex salon near me'",
        duration: 5000,
      });
      setInitialLoad(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <MainLayout>
      <section className="flex flex-col items-center justify-center py-8 md:py-14">
        <div className="text-center mb-8 animate-fade-in">
          <AnimatedLogo size="lg" className="mx-auto mb-6" />
          <h1 className="text-3xl sm:text-4xl font-medium tracking-tight mb-3">Find your next favorite local spot</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Natural language recommendations for the best businesses, services, and experiences near you.
          </p>
        </div>

        <CategoryFilter 
          selectedCategory={category} 
          onSelectCategory={handleCategoryChange}
          className="mb-8 animate-fade-in"
        />

        <div className="w-full">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className="bg-white/50 h-96 rounded-xl border border-border/50 animate-pulse"
                />
              ))}
            </div>
          ) : recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((recommendation, index) => (
                <div key={recommendation.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <LocationCard 
                    recommendation={recommendation}
                    className="h-full"
                  />
                </div>
              ))}
            </div>
          ) : initialLoad ? (
            <div className="text-center py-10">
              <p className="text-muted-foreground">
                Start by searching for recommendations...
              </p>
            </div>
          ) : (
            <div className="text-center py-10 animate-fade-in">
              <p className="text-lg font-medium mb-2">No results found</p>
              <p className="text-muted-foreground">
                Try adjusting your search or category filter
              </p>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
