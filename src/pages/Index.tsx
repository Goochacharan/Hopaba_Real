
import React, { useState } from 'react';
import MainLayout from '@/components/MainLayout';
import CategoryFilter from '@/components/CategoryFilter';
import LocationCard from '@/components/LocationCard';
import AnimatedLogo from '@/components/AnimatedLogo';
import FilterTabs from '@/components/FilterTabs';
import useRecommendations from '@/hooks/useRecommendations';

const Index = () => {
  const [distance, setDistance] = useState<number[]>([5]);
  const [minRating, setMinRating] = useState<number[]>([4]);
  const [priceRange, setPriceRange] = useState<number>(2);
  const [openNowOnly, setOpenNowOnly] = useState<boolean>(false);
  
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

  // Calculate rankings based on rating and generate consistent review counts
  const rankedRecommendations = [...filteredRecommendations].map(item => {
    // Generate a consistent review count based on the item's id and rating
    const reviewCount = parseInt(item.id) * 10 + Math.floor(item.rating * 15);
    
    // Generate multiple images if not already present
    const recommendation = { ...item, reviewCount };
    
    // Return item with reviewCount
    return recommendation;
  }).sort((a, b) => {
    // First sort by rating
    if (b.rating !== a.rating) {
      return b.rating - a.rating;
    }
    
    // If ratings are equal, sort by reviewer count
    return b.reviewCount - a.reviewCount;
  });

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

        <div className="w-full mb-4">
          <CategoryFilter 
            selectedCategory={category} 
            onSelectCategory={handleCategoryChange}
            className="animate-fade-in mb-4"
          />
          
          <FilterTabs
            distance={distance}
            setDistance={setDistance}
            minRating={minRating}
            setMinRating={setMinRating}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            openNowOnly={openNowOnly}
            setOpenNowOnly={setOpenNowOnly}
          />
        </div>

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
          ) : rankedRecommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rankedRecommendations.map((recommendation, index) => (
                <div key={recommendation.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                  <LocationCard 
                    recommendation={recommendation}
                    ranking={index < 10 ? index + 1 : undefined}
                    reviewCount={recommendation.reviewCount}
                    className="h-full"
                  />
                </div>
              ))}
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
