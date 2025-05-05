
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import MainLayout from '@/components/MainLayout';
import FilterTabs from '@/components/FilterTabs';
import SortButton, { SortOption } from '@/components/SortButton';
import { useSearchFilters } from '@/hooks/useSearchFilters';
import { useSearchEnhancement } from '@/hooks/useSearchEnhancement';
import { addDistanceToRecommendations, sortRecommendations, enhanceRecommendations } from '@/utils/searchUtils';
import { BusinessesList } from '@/components/BusinessesList';
import PostalCodeSearch from '@/components/search/PostalCodeSearch';
import { Loader2 } from 'lucide-react';

const Explore = () => {
  const [searchParams] = useSearchParams();
  const postalCodeParam = searchParams.get('postalCode') || '';
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [userCoordinates, setUserCoordinates] = useState<{ lat: number, lng: number } | null>({
    lat: 12.9716,
    lng: 77.5946
  });
  
  const { searchWithLocation, enhanceQuery, enhancing } = useSearchEnhancement();
  const { filters, setters } = useSearchFilters();
  
  const fetchBusinesses = async (postalCode: string = '') => {
    setLoading(true);
    try {
      let query = "businesses";
      if (postalCode) {
        query = `businesses in ${postalCode}`;
      }
      
      // Use enhanceQuery to make the search more effective
      const enhancedQuery = await enhanceQuery(query);
      console.log("Enhanced query:", enhancedQuery);
      
      // Use searchWithLocation to get location-specific results
      const { providers, userLocation } = await searchWithLocation(enhancedQuery);
      console.log("Explore page results:", providers?.length || 0, "providers found");
      
      if (userLocation) {
        setUserCoordinates(userLocation);
      }
      
      setBusinesses(providers || []);
    } catch (err) {
      console.error("Error fetching businesses:", err);
      setError("Failed to load businesses");
    } finally {
      setLoading(false);
    }
  };
  
  // Apply filters to the businesses
  const filterBusinesses = (businessList: any[]) => {
    let filtered = businessList;
    
    // Filter by minimum rating
    if (filters.minRating[0] > 0) {
      filtered = filtered.filter(business => 
        (business.rating || 0) >= filters.minRating[0]
      );
    }
    
    // Filter by price range (assume price_range_min is the benchmark)
    if (filters.priceRange < 50000) {
      filtered = filtered.filter(business => 
        !business.price_range_min || business.price_range_min <= filters.priceRange
      );
    }
    
    // Filter by open now
    if (filters.openNowOnly) {
      const now = new Date();
      const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][now.getDay()];
      
      filtered = filtered.filter(business => {
        // If business has availability_days, check if today is included
        if (business.availability_days && business.availability_days.length > 0) {
          return business.availability_days.includes(dayOfWeek);
        }
        return true; // Include if no availability info
      });
    }
    
    // Filter by hidden gem
    if (filters.hiddenGemOnly) {
      filtered = filtered.filter(business => business.isHiddenGem);
    }
    
    // Filter by must visit
    if (filters.mustVisitOnly) {
      filtered = filtered.filter(business => business.isMustVisit);
    }
    
    // Add distance information
    const withDistance = addDistanceToRecommendations(filtered, userCoordinates);
    
    // Enhance with additional properties
    const enhanced = enhanceRecommendations(withDistance);
    
    // Sort the results
    const sorted = sortRecommendations(enhanced, filters.sortBy);
    
    return sorted;
  };
  
  const handlePostalCodeSearch = (postalCode: string) => {
    console.log("Searching by postal code:", postalCode);
    fetchBusinesses(postalCode);
  };
  
  useEffect(() => {
    fetchBusinesses(postalCodeParam);
  }, [postalCodeParam]);
  
  const filteredBusinesses = filterBusinesses(businesses);
  
  return (
    <MainLayout>
      <div className="w-full max-w-5xl mx-auto p-4 pb-24">
        <h1 className="text-2xl font-bold mb-4">Explore Businesses</h1>
        
        {/* Postal Code Search */}
        <PostalCodeSearch 
          onSearch={handlePostalCodeSearch} 
          initialValue={postalCodeParam}
        />
        
        {/* Filters */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <FilterTabs 
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
            />
            
            <SortButton 
              currentSort={filters.sortBy} 
              onSortChange={setters.setSortBy}
            />
          </div>
        </div>
        
        {/* Results */}
        {loading || enhancing ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">
            <p>{error}</p>
          </div>
        ) : filteredBusinesses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No businesses found. Try adjusting your filters or search.</p>
          </div>
        ) : (
          <BusinessesList businesses={filteredBusinesses} />
        )}
      </div>
    </MainLayout>
  );
};

export default Explore;
