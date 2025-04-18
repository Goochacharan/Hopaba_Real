import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SortOption } from '@/components/marketplace/MarketplaceSortButton';
import { useLocation } from '@/contexts/LocationContext';
import { extractCityFromText, extractLocationCity } from '@/lib/locationUtils';
import type { MarketplaceListing } from '@/hooks/useMarketplaceListings';
import { MarketplaceListingWithDistance } from '@/types/marketplace';

export const extractLocationCity = (location: string): string => {
  if (!location) return '';
  
  // Try to extract city from location string, assuming format like "Area, City"
  const parts = location.split(',');
  if (parts.length > 1) {
    return parts[1].trim();
  }
  
  // If no comma found, just return the entire string as the city
  return location.trim();
};

export const useMarketplaceFilters = (listings: MarketplaceListing[]) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedLocation, userCoordinates } = useLocation();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [yearRange, setYearRange] = useState<[number, number]>([2010, new Date().getFullYear()]);
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [conditionFilter, setConditionFilter] = useState<string>('all');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [distanceFilter, setDistanceFilter] = useState<number>(50);
  const [postalCodeFilter, setPostalCodeFilter] = useState<string>('');

  const isPriceFilterActive = priceRange[0] > 0 || priceRange[1] < 10000000;
  const isYearFilterActive = yearRange[0] > 2010 || yearRange[1] < new Date().getFullYear();
  const isRatingFilterActive = ratingFilter > 0;
  const isConditionFilterActive = conditionFilter !== 'all';
  const isSortFilterActive = sortOption !== 'newest';
  const isDistanceFilterActive = distanceFilter < 50;

  const handleLocationSearch = (location: string) => {
    console.log(`Location changed to: ${location}`);
    if (/^\d{6}$/.test(location)) {
      setPostalCodeFilter(location);
    } else {
      setPostalCodeFilter('');
      setSearchParams(params => {
        params.set('area', location);
        return params;
      });
    }
  };

  const filterListings = (listings: MarketplaceListing[]) => {
    return listings.filter(listing => {
      if (postalCodeFilter && listing.postal_code) {
        if (!listing.postal_code.startsWith(postalCodeFilter)) {
          return false;
        }
      }

      const searchArea = searchParams.get('area')?.toLowerCase();
      if (searchArea && !postalCodeFilter) {
        return (listing.area || '').toLowerCase().includes(searchArea);
      }

      if (selectedLocation === "Current Location") {
        if (listing.distance === undefined) return true;
        return listing.distance <= distanceFilter;
      }
      
      if (selectedLocation && selectedLocation !== "Bengaluru, Karnataka") {
        const selectedCity = selectedLocation.split(',')[0].trim();
        
        if (listing.location && listing.location.includes(selectedCity)) {
          return true;
        }
        
        const listingCity = extractLocationCity(listing);
        if (listingCity && selectedCity.includes(listingCity)) {
          return true;
        }
        
        if (selectedLocation.includes("Postal Code:")) {
          const postalCode = selectedLocation.match(/\d{6}/)?.[0];
          if (postalCode && listing.postal_code === postalCode) {
            return true;
          }
          return true;
        }
        return true;
      }
      
      const price = listing.price;
      if (price < priceRange[0] || price > priceRange[1]) return false;
      
      if (listing.model_year) {
        const modelYear = parseInt(listing.model_year, 10);
        if (!isNaN(modelYear) && (modelYear < yearRange[0] || modelYear > yearRange[1])) {
          return false;
        }
      }
      
      if (ratingFilter > 0 && listing.seller_rating < ratingFilter) return false;
      
      if (conditionFilter !== 'all' && listing.condition.toLowerCase() !== conditionFilter.toLowerCase()) return false;
      
      return true;
    });
  };

  const sortListings = (items: MarketplaceListing[]) => {
    return [...items].sort((a, b) => {
      switch (sortOption) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'price-low-high':
          return a.price - b.price;
        case 'price-high-low':
          return b.price - a.price;
        case 'top-rated':
          return b.seller_rating - a.seller_rating;
        case 'nearest':
          if (a.distance !== undefined && b.distance !== undefined) {
            return a.distance - b.distance;
          }
          if (a.distance !== undefined) return -1;
          if (b.distance !== undefined) return 1;
          return 0;
        default:
          return 0;
      }
    });
  };

  return {
    filters: {
      priceRange,
      yearRange,
      ratingFilter,
      conditionFilter,
      distanceFilter,
      postalCodeFilter,
      sortOption,
      currentPage,
      activeFilter
    },
    setters: {
      setPriceRange,
      setYearRange,
      setRatingFilter,
      setConditionFilter,
      setDistanceFilter,
      setSortOption,
      setCurrentPage,
      setActiveFilter,
      handleLocationSearch
    },
    states: {
      isPriceFilterActive,
      isYearFilterActive,
      isRatingFilterActive,
      isConditionFilterActive,
      isSortFilterActive,
      isDistanceFilterActive
    },
    filterListings,
    sortListings
  };
};
