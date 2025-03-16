
import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import CategoryFilter from '@/components/CategoryFilter';
import LocationCard from '@/components/LocationCard';
import AnimatedLogo from '@/components/AnimatedLogo';
import Filters from '@/components/Filters';
import useRecommendations from '@/hooks/useRecommendations';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { FilterIcon } from 'lucide-react';

const Index = () => {
  const [initialLoad, setInitialLoad] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [distance, setDistance] = useState<number[]>([5]);
  const [minRating, setMinRating] = useState<number[]>([4]);
  const [priceRange, setPriceRange] = useState<number>(2);
  const [openNowOnly, setOpenNowOnly] = useState<boolean>(false);
  
  const { toast } = useToast();
  const {
    recommendations,
    loading,
    error,
    query,
    category,
    handleSearch,
    handleCategoryChange,
    filterRecommendations
  } = useRecommendations();

  // Apply filters to recommendations
  const filteredRecommendations = filterRecommendations(
    recommendations,
    {
      maxDistance: distance[0],
      minRating: minRating[0],
      priceLevel: priceRange,
      openNowOnly
    }
  );

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

  const toggleFilters = () => {
    setShowFilters(prev => !prev);
  };

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

        <div className="w-full flex flex-col md:flex-row gap-4 md:items-center justify-between mb-6">
          <CategoryFilter 
            selectedCategory={category} 
            onSelectCategory={handleCategoryChange}
            className="animate-fade-in"
          />
          
          <Button 
            onClick={toggleFilters}
            variant="outline" 
            size="sm"
            className="ml-auto flex items-center gap-2"
          >
            <FilterIcon size={16} />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>

        {showFilters && (
          <Filters
            distance={distance}
            setDistance={setDistance}
            minRating={minRating}
            setMinRating={setMinRating}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            openNowOnly={openNowOnly}
            setOpenNowOnly={setOpenNowOnly}
          />
        )}

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
          ) : filteredRecommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecommendations.map((recommendation, index) => (
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
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
