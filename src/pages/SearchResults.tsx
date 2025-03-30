import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/MainLayout';
import LocationSelector from '@/components/LocationSelector';
import FilterTabs from '@/components/FilterTabs';
import SortButton, { SortOption } from '@/components/SortButton';
import useRecommendations from '@/hooks/useRecommendations';
import { useMarketplaceListings } from '@/hooks/useMarketplaceListings';
import { calculateDistance, geocodeAddress } from '@/lib/locationUtils';

// Import components
import SearchHeader from '@/components/search/SearchHeader';
import SearchTabs from '@/components/search/SearchTabs';
import { MapPin, Map as MapIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const searchQuery = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || 'all';
  
  const [activeTab, setActiveTab] = useState('locations');
  const [distance, setDistance] = useState<number[]>([5]);
  const [minRating, setMinRating] = useState<number[]>([4]);
  const [priceRange, setPriceRange] = useState<number>(2);
  const [openNowOnly, setOpenNowOnly] = useState<boolean>(false);
  const [hiddenGemOnly, setHiddenGemOnly] = useState<boolean>(false);
  const [mustVisitOnly, setMustVisitOnly] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<string>("Bengaluru, Karnataka");
  const [userCoordinates, setUserCoordinates] = useState<{lat: number, lng: number} | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('rating');

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
    initialCategory: categoryParam as any
  });

  const {
    listings: marketplaceListings,
    loading: marketplaceLoading,
    error: marketplaceError
  } = useMarketplaceListings({
    searchQuery: searchQuery
  });

  const loading = recommendationsLoading || marketplaceLoading;
  const error = recommendationsError || marketplaceError;

  const enhancedRecommendations = recommendations.map((rec, index) => {
    return {
      ...rec,
      isHiddenGem: rec.isHiddenGem || index % 3 === 0,
      isMustVisit: rec.isMustVisit || index % 5 === 0
    };
  });

  const filteredRecommendations = filterRecommendations(enhancedRecommendations, {
    maxDistance: distance[0],
    minRating: minRating[0],
    priceLevel: priceRange,
    openNow: openNowOnly,
    hiddenGem: hiddenGemOnly,
    mustVisit: mustVisitOnly,
    distanceUnit: 'km'
  });

  const addDistanceToRecommendations = (recs) => {
    if (!userCoordinates) return recs;
    
    return recs.map(rec => {
      const latitude = parseFloat(rec.id) % 0.1 + 12.9716;
      const longitude = parseFloat(rec.id) % 0.1 + 77.5946;
      
      const distanceValue = calculateDistance(
        userCoordinates.lat,
        userCoordinates.lng,
        latitude,
        longitude,
        'K'
      );
      
      return {
        ...rec,
        calculatedDistance: distanceValue,
        distance: `${distanceValue.toFixed(1)} km away`
      };
    });
  };

  const sortRecommendations = (recommendations) => {
    return [...recommendations].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'distance':
          if (a.calculatedDistance !== undefined && b.calculatedDistance !== undefined) {
            return a.calculatedDistance - b.calculatedDistance;
          }
          const distanceA = parseFloat(a.distance?.split(' ')[0] || '0');
          const distanceB = parseFloat(b.distance?.split(' ')[0] || '0');
          return distanceA - distanceB;
        case 'reviewCount':
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        case 'newest':
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return dateB - dateA;
        default:
          return 0;
      }
    });
  };

  const enhanceRecommendations = (recommendations) => {
    return recommendations.map(rec => {
      console.log("SearchResults - Processing recommendation:", rec.id, {
        instagram: rec.instagram || '',
        availability_days: rec.availability_days || [],
        availability_start_time: rec.availability_start_time || '',
        availability_end_time: rec.availability_end_time || '',
        isHiddenGem: rec.isHiddenGem,
        isMustVisit: rec.isMustVisit
      });
      
      return {
        ...rec,
        hours: rec.hours || rec.availability,
        price_range_min: rec.price_range_min,
        price_range_max: rec.price_range_max,
        price_unit: rec.price_unit,
        availability: rec.availability,
        availability_days: rec.availability_days || [],
        availability_start_time: rec.availability_start_time || '',
        availability_end_time: rec.availability_end_time || '',
        instagram: rec.instagram || '',
        map_link: rec.map_link,
        isHiddenGem: rec.isHiddenGem,
        isMustVisit: rec.isMustVisit
      };
    });
  };

  const recommendationsWithDistance = addDistanceToRecommendations(filteredRecommendations);
  const enhancedRecommendationsWithDistance = enhanceRecommendations(recommendationsWithDistance);
  const rankedRecommendations = sortRecommendations(enhancedRecommendationsWithDistance);

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

  const handleLocationChange = (location: string, coordinates?: { lat: number; lng: number }) => {
    console.log(`Location changed to: ${location}`, coordinates);
    setSelectedLocation(location);
    
    if (coordinates) {
      setUserCoordinates(coordinates);
    } else {
      geocodeAddress(location).then(coords => {
        if (coords) {
          setUserCoordinates(coords);
        }
      });
    }
  };

  const handleRSVP = (eventTitle: string) => {
    toast({
      title: "RSVP Successful",
      description: `You've RSVP'd to ${eventTitle}. We'll send you a reminder closer to the date.`,
      duration: 3000
    });
  };

  const handleSortChange = (option: SortOption) => {
    setSortBy(option);
  };

  return (
    <MainLayout>
      <div className="w-full animate-fade-in mx-0 px-[2px] search-results-container">
        <div className="location-selector">
          <LocationSelector 
            selectedLocation={selectedLocation} 
            onLocationChange={handleLocationChange} 
          />
        </div>
        
        <div className="flex items-center justify-between mb-1 mt-0 filter-tabs-container">
          <FilterTabs 
            distance={distance} 
            setDistance={setDistance} 
            minRating={minRating} 
            setMinRating={setMinRating} 
            priceRange={priceRange} 
            setPriceRange={setPriceRange} 
            openNowOnly={openNowOnly} 
            setOpenNowOnly={setOpenNowOnly}
            hiddenGemOnly={hiddenGemOnly}
            setHiddenGemOnly={setHiddenGemOnly}
            mustVisitOnly={mustVisitOnly}
            setMustVisitOnly={setMustVisitOnly}
          />
          
          <div className="flex items-center gap-2">            
            <SortButton 
              currentSort={sortBy} 
              onSortChange={handleSortChange} 
            />
          </div>
        </div>

        <div className="w-full">
          <SearchHeader 
            query={query}
            searchQuery={searchQuery}
            category={category}
            resultsCount={{
              locations: rankedRecommendations.length,
              events: events.length,
              marketplace: marketplaceListings.length
            }}
            loading={loading}
            error={error}
            className="search-header"
          />
          
          {!loading && (
            <div className="search-tabs-container">
              <SearchTabs 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                recommendations={rankedRecommendations}
                events={events}
                marketplaceListings={marketplaceListings}
                handleRSVP={handleRSVP}
              />
            </div>
          )}
        </div>
        
        <div className="fixed left-4 bottom-24 z-[61]">
          <Button 
            variant="default" 
            size="icon" 
            onClick={() => navigate('/map')}
            className="rounded-full shadow-lg hover:shadow-xl"
            aria-label="Map View"
          >
            <MapIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default SearchResults;
