
import React, { useState } from 'react';
import MainLayout from '@/components/MainLayout';
import SearchBar from '@/components/SearchBar';
import { TrendingUp, Clock, MapPin } from 'lucide-react';
import CategoryFilter from '@/components/CategoryFilter';
import LocationCard from '@/components/LocationCard';
import AnimatedLogo from '@/components/AnimatedLogo';
import FilterTabs from '@/components/FilterTabs';
import useRecommendations from '@/hooks/useRecommendations';
import { Button } from '@/components/ui/button';

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

  // Sample example queries
  const exampleQueries = [
    { text: "Find me a cozy café nearby", icon: "☕" },
    { text: "Looking for a Kannada-speaking actor", icon: "🎭" },
    { text: "Best electrician in Jayanagar", icon: "⚡" },
    { text: "Where can I buy a pre-owned bike?", icon: "🏍️" }
  ];
  
  // Sample recent searches
  const recentSearches = [
    "Good salon for haircut",
    "Pizza delivery near me",
    "Plumber in Nagarbhavi"
  ];
  
  // Sample trending searches
  const trendingSearches = [
    "Hidden gem restaurants in Indiranagar",
    "Best veg restaurants open now",
    "Top-rated salons with offers"
  ];

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

  const showResults = query && query.length > 0;

  return (
    <MainLayout>
      <section className="flex flex-col items-center justify-center py-8 md:py-14">
        {!showResults && (
          <div className="text-center mb-12 animate-fade-in">
            <AnimatedLogo size="lg" className="mx-auto mb-6" />
            <h1 className="text-3xl sm:text-4xl font-medium tracking-tight mb-3">Hopaba</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              What are you looking for today? A hidden gem café, a skilled plumber, or the best salon in town? Just ask me!
            </p>
          </div>
        )}

        {!showResults && (
          <div className="w-full max-w-2xl mx-auto mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {exampleQueries.map((example, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  className="justify-start px-4 py-6 h-auto border-border/50 text-left hover:bg-secondary/50"
                  onClick={() => handleSearch(example.text)}
                >
                  <div className="mr-3 text-xl">{example.icon}</div>
                  <span className="font-normal">{example.text}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="w-full mb-8">
          {showResults && (
            <>
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
            </>
          )}
        </div>

        {!showResults && (
          <div className="w-full max-w-2xl mx-auto mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Recent searches</h3>
                </div>
                {recentSearches.map((search, idx) => (
                  <Button
                    key={idx}
                    variant="ghost"
                    className="w-full justify-start text-left text-muted-foreground hover:text-foreground"
                    onClick={() => handleSearch(search)}
                  >
                    <span className="line-clamp-1">{search}</span>
                  </Button>
                ))}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Trending nearby</h3>
                </div>
                {trendingSearches.map((search, idx) => (
                  <Button
                    key={idx}
                    variant="ghost"
                    className="w-full justify-start text-left text-muted-foreground hover:text-foreground"
                    onClick={() => handleSearch(search)}
                  >
                    <MapPin className="h-3 w-3 mr-2 text-muted-foreground" />
                    <span className="line-clamp-1">{search}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {showResults && (
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
        )}
      </section>
    </MainLayout>
  );
};

export default Index;
