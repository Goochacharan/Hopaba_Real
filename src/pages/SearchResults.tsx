
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
import SearchLocation from '@/components/search/SearchLocation';
import SearchControls from '@/components/search/SearchControls';
import ViewToggle from '@/components/search/ViewToggle';
import MapComponent from '@/pages/Map';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const searchQuery = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || 'all';
  
  const [selectedLocation, setSelectedLocation] = useState<string>("Bengaluru, Karnataka");
  const [userCoordinates, setUserCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [isMapView, setIsMapView] = useState(false);
  
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
    listings: marketplaceListings,
    loading: marketplaceLoading,
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
    availability_end_time: rec.availability_end_time || ''
  }));

  const filteredRecommendations = filterRecommendations(enhancedRecommendations, {
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

  useEffect(() => {
    if (!searchQuery) {
      navigate('/');
    }
  }, [searchQuery, navigate]);

  const handleRSVP = (eventTitle: string) => {
    toast({
      title: "RSVP Successful",
      description: `You've RSVP'd to ${eventTitle}. We'll send you a reminder closer to the date.`,
      duration: 3000
    });
  };

  return (
    <MainLayout>
      <div className="w-full animate-fade-in mx-0 px-[2px] search-results-container">
        <SearchLocation
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          setUserCoordinates={setUserCoordinates}
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

        <div className="flex flex-col items-center justify-center gap-4 py-4">
          <ViewToggle isMapView={isMapView} onToggle={setIsMapView} />
        </div>

        {isMapView ? (
          <MapComponent recommendations={rankedRecommendations} userCoordinates={userCoordinates} />
        ) : (
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
              error={error}
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
        )}
      </div>
    </MainLayout>
  );
};

export default SearchResults;
