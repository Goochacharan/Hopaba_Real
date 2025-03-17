import React, { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import LocationCard from '@/components/LocationCard';
import FilterTabs from '@/components/FilterTabs';
import LocationSelector from '@/components/LocationSelector';
import useRecommendations from '@/hooks/useRecommendations';
import { useSearchParams, useNavigate } from 'react-router-dom';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchQuery = searchParams.get('q') || '';
  
  const [distance, setDistance] = useState<number[]>([5]);
  const [minRating, setMinRating] = useState<number[]>([4]);
  const [priceRange, setPriceRange] = useState<number>(2);
  const [openNowOnly, setOpenNowOnly] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<string>("Bengaluru, Karnataka");
  
  const {
    recommendations,
    loading,
    error,
    query,
    category,
    handleSearch,
    handleCategoryChange,
    filterRecommendations
  } = useRecommendations({ initialQuery: searchQuery });

  const filteredRecommendations = filterRecommendations(recommendations, {
    maxDistance: distance[0],
    minRating: minRating[0],
    priceLevel: priceRange,
    openNowOnly,
    distanceUnit: 'km'
  });

  const rankedRecommendations = [...filteredRecommendations].map(item => {
    const reviewCount = parseInt(item.id) * 10 + Math.floor(item.rating * 15);
    return {
      ...item,
      reviewCount
    };
  }).sort((a, b) => {
    if (b.rating !== a.rating) {
      return b.rating - a.rating;
    }
    return b.reviewCount - a.reviewCount;
  });

  useEffect(() => {
    if (searchQuery && searchQuery !== query) {
      handleSearch(searchQuery);
    }
  }, [searchQuery, query, handleSearch]);

  useEffect(() => {
    if (!searchQuery) {
      navigate('/');
    }
  }, [searchQuery, navigate]);

  const handleLocationChange = (location: string) => {
    console.log(`Location changed to: ${location}`);
    setSelectedLocation(location);
  };

  return (
    <MainLayout>
      <div className="w-full animate-fade-in">
        <LocationSelector 
          selectedLocation={selectedLocation}
          onLocationChange={handleLocationChange}
        />
        
        <div className="w-full mb-8">
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
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white/50 h-96 rounded-xl border border-border/50 animate-pulse" />
              ))}
            </div>
          ) : rankedRecommendations.length > 0 ? (
            <>
              {query && query !== searchQuery && (
                <div className="mb-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">AI-enhanced search:</span> {query}
                  </p>
                </div>
              )}
            
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rankedRecommendations.map((recommendation, index) => (
                  <div
                    key={recommendation.id}
                    className="animate-fade-in"
                    style={{
                      animationDelay: `${index * 100}ms`
                    }}
                  >
                    <LocationCard
                      recommendation={recommendation}
                      ranking={index < 10 ? index + 1 : undefined}
                      reviewCount={recommendation.reviewCount}
                      className="h-full"
                    />
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-10 animate-fade-in">
              <p className="text-lg font-medium mb-2">No results found</p>
              <p className="text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SearchResults;
