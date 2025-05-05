
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/MainLayout';
import useRecommendations from '@/hooks/useRecommendations';
import { useMarketplaceListings } from '@/hooks/useMarketplaceListings';
import { useSearchFilters } from '@/hooks/useSearchFilters';
import { addDistanceToRecommendations, sortRecommendations, enhanceRecommendations } from '@/utils/searchUtils';
import SearchHeader from '@/components/search/SearchHeader';
import SearchTabs from '@/components/search/SearchTabs';
import SearchControls from '@/components/search/SearchControls';
import AreaSearchBar from '@/components/search/AreaSearchBar';
import CategoryScrollBar from '@/components/business/CategoryScrollBar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import AnimatedLogo from '@/components/AnimatedLogo';
import SearchBar from '@/components/SearchBar';

const exampleQueries = [
  {
    text: "Find me a cozy café nearby",
    icon: "☕",
    category: "cafes"
  },
  {
    text: "Looking for a Kannada-speaking actor",
    icon: "🎭",
    category: "entertainment"
  },
  {
    text: "Best electrician in Jayanagar",
    icon: "⚡",
    category: "services"
  },
  {
    text: "Where can I buy a pre-owned bike?",
    icon: "🏍️",
    category: "shopping"
  },
  {
    text: "Recommend a good Italian restaurant",
    icon: "🍕",
    category: "restaurants"
  },
  {
    text: "Find a flower shop in Koramangala",
    icon: "🌸",
    category: "shopping"
  },
  {
    text: "Best dance classes for kids",
    icon: "💃",
    category: "education"
  },
  {
    text: "Need a plumber for water leak",
    icon: "🔧",
    category: "services"
  }
];

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const searchQuery = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || 'all';
  const [isEnhancing, setIsEnhancing] = useState<string | null>(null);
  
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [userCoordinates, setUserCoordinates] = useState<{ lat: number, lng: number } | null>({
    lat: 12.9716,
    lng: 77.5946
  });
  
  const { filters, setters } = useSearchFilters();
  
  const {
    recommendations,
    events,
    loading: recommendationsLoading,
    error: recommendationsError,
    query,
    category,
    handleSearch,
    handleCategoryChange,
    filterRecommendations
  } = useRecommendations({
    initialQuery: searchQuery,
    initialCategory: categoryParam as any,
    loadDefaultResults: true
  });

  const {
    data: marketplaceListings,
    isLoading: marketplaceLoading,
    error: marketplaceError
  } = useMarketplaceListings({
    searchQuery: searchQuery,
    minRating: filters.minRating[0] > 3 ? filters.minRating[0] : undefined
  });

  const loading = recommendationsLoading || marketplaceLoading;
  const error = recommendationsError || marketplaceError;

  console.log("Original recommendations:", recommendations);

  const enhancedRecommendations = recommendations.map((rec, index) => ({
    ...rec,
    isHiddenGem: rec.isHiddenGem || index % 3 === 0,
    isMustVisit: rec.isMustVisit || index % 5 === 0,
    availability_days: rec.availability_days || [],
    hours: rec.hours || '',
    availability_start_time: rec.availability_start_time || '',
    availability_end_time: rec.availability_end_time || '',
    tags: rec.tags || []  // Ensure tags is never undefined
  }));

  const areaFilteredRecommendations = selectedArea 
    ? enhancedRecommendations.filter(rec => 
        rec.address && rec.address.toLowerCase().includes(selectedArea.toLowerCase()))
    : enhancedRecommendations;

  const filteredRecommendations = filterRecommendations(areaFilteredRecommendations, {
    maxDistance: filters.distance[0],
    minRating: filters.minRating[0],
    priceLevel: filters.priceRange,
    openNow: filters.openNowOnly,
    hiddenGem: filters.hiddenGemOnly,
    mustVisit: filters.mustVisitOnly,
    distanceUnit: 'km'
  });

  const recommendationsWithDistance = addDistanceToRecommendations(filteredRecommendations, userCoordinates);
  const fullyEnhancedRecommendations = enhanceRecommendations(recommendationsWithDistance);
  const rankedRecommendations = sortRecommendations(fullyEnhancedRecommendations, filters.sortBy);

  console.log("Final ranked recommendations:", rankedRecommendations);
  console.log("Selected area:", selectedArea);
  console.log("User coordinates:", userCoordinates);
  console.log("Current category for filtering:", category);
  
  // Debug matched tags
  const tagMatchedRecommendations = rankedRecommendations.filter(rec => rec.isTagMatch);
  if (tagMatchedRecommendations.length > 0) {
    console.log("Tag matched recommendations:", tagMatchedRecommendations.length);
    tagMatchedRecommendations.forEach(rec => {
      console.log(`Item "${rec.name}" matched tags:`, rec.tagMatches);
    });
  }

  const handleCategorySelect = (selectedCategory: string) => {
    console.log("Category selected:", selectedCategory);
    
    const normalizedCategory = selectedCategory === "All" ? "all" : selectedCategory;
    
    handleCategoryChange(normalizedCategory as any);

    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('category', normalizedCategory);
    navigate(`/search?${newSearchParams.toString()}`);
  };

  const performSearch = (query: string, category?: string) => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (query.trim()) {
      const searchParams = new URLSearchParams();
      searchParams.set('q', query);
      if (category && category !== 'all') {
        searchParams.set('category', category);
      }
      navigate(`/search?${searchParams.toString()}`);
    }
  };

  useEffect(() => {
    if (searchQuery && searchQuery !== query) {
      console.log("SearchResults - Processing search query:", searchQuery);
      handleSearch(searchQuery);
    }
  }, [searchQuery, query, handleSearch]);

  useEffect(() => {
    if (categoryParam !== 'all' && categoryParam !== category) {
      console.log("SearchResults - Setting category from URL:", categoryParam);
      handleCategoryChange(categoryParam as any);
    }
  }, [categoryParam, category, handleCategoryChange]);

  const handleAreaSelect = (area: string) => {
    setSelectedArea(area);
    console.log("Area selected:", area);
  };

  const handleLocationSelect = (coordinates: { lat: number, lng: number } | null) => {
    if (coordinates) {
      setUserCoordinates(coordinates);
      console.log("User coordinates set:", coordinates);
    }
  };
  
  // Show welcome view if no search query is present
  const showWelcomeView = !searchQuery;

  return (
    <MainLayout>
      <div className="w-full animate-fade-in mx-0 px-[2px] search-results-container">
        {showWelcomeView ? (
          <section className="flex flex-col items-center justify-center pt-0 pb-0 mx-[5px] px-0">
            <div className="text-center mb-1 animate-fade-in">
              <AnimatedLogo size="lg" className="mx-auto mb-1" />
              <h1 className="text-3xl sm:text-4xl font-medium tracking-tight">Hopaba</h1>
            </div>
            <div className="w-full max-w-2xl mx-auto mb-4">
              <SearchBar 
                onSearch={performSearch}
                placeholder="What are you looking for today?"
                className="mb-4"
              />

              <CategoryScrollBar
                selected={category}
                onSelect={handleCategorySelect}
                className="mb-4"
              />
              
              <ScrollArea className="h-[calc(100vh-280px)] w-full px-1 pb-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2 pr-4">
                  {exampleQueries.map((example, idx) => (
                    <Button 
                      key={idx} 
                      variant="outline" 
                      onClick={() => performSearch(example.text, example.category)} 
                      className="justify-start h-auto border-border/50 text-left px-[17px] py-1.5 rounded-md text-neutral-900 bg-pink-300 hover:bg-pink-200 overflow-hidden" 
                      disabled={isEnhancing === example.text}
                    >
                      <div className="mr-3 text-base">{example.icon}</div>
                      <span className="font-normal text-sm sm:text-base truncate">{example.text}</span>
                      {isEnhancing === example.text && <Sparkles className="h-4 w-4 ml-2 animate-pulse" />}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </section>
        ) : (
          <>
            <AreaSearchBar
              selectedArea={selectedArea}
              onAreaSelect={handleAreaSelect}
              onLocationSelect={handleLocationSelect}
            />

            <CategoryScrollBar
              selected={category}
              onSelect={handleCategorySelect}
              className="my-2"
            />
            
            <SearchControls
              distance={filters.distance}
              setDistance={setters.setDistance}
              minRating={filters.minRating}
              setMinRating={setters.setMinRating}
              priceRange={filters.priceRange}
              setPriceRange={setters.setPriceRange}
              openNowOnly={filters.openNowOnly}
              setOpenNowOnly={setters.setOpenNowOnly}
              hiddenGemOnly={filters.hiddenGemOnly}
              setHiddenGemOnly={setters.setHiddenGemOnly}
              mustVisitOnly={filters.mustVisitOnly}
              setMustVisitOnly={setters.setMustVisitOnly}
              sortBy={filters.sortBy}
              onSortChange={setters.setSortBy}
            />

            <div className="w-full">
              <SearchHeader 
                query={query}
                searchQuery={searchQuery}
                category={category}
                resultsCount={{
                  locations: rankedRecommendations.length,
                  events: 0,
                  marketplace: 0
                }}
                loading={loading}
                error={error ? String(error) : null}
                className="search-header"
              />
              
              {!loading && (
                <div className="search-tabs-container">
                  <SearchTabs 
                    recommendations={rankedRecommendations}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default SearchResults;
