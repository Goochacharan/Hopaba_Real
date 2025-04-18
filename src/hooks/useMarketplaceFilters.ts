import { useState, useMemo } from 'react';
import { MarketplaceListing } from './useMarketplaceListings';

const useMarketplaceFilters = (initialListings: MarketplaceListing[]) => {
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [conditionFilter, setConditionFilter] = useState<string | null>(null);
  const [minPriceFilter, setMinPriceFilter] = useState<number | null>(null);
  const [maxPriceFilter, setMaxPriceFilter] = useState<number | null>(null);
  const [cityFilter, setCityFilter] = useState<string | null>(null);
  const [postalCodeFilter, setPostalCodeFilter] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<string>('newest');
  const [sellerRoleFilter, setSellerRoleFilter] = useState<string | null>(null);

  const filteredListings = useMemo(() => {
    return initialListings.filter(listing => {
      // Category filter
      if (categoryFilter && listing.category !== categoryFilter) {
        return false;
      }

      // Condition filter
      if (conditionFilter && listing.condition !== conditionFilter) {
        return false;
      }

      // Price range filter
      if (minPriceFilter !== null && listing.price < minPriceFilter) {
        return false;
      }
      if (maxPriceFilter !== null && listing.price > maxPriceFilter) {
        return false;
      }

      // City filter
      if (cityFilter && listing.city !== cityFilter) {
        return false;
      }

      // Postal code filter
      if (postalCodeFilter && listing.postal_code !== postalCodeFilter) {
        return false;
      }

      // Seller role filter
      if (sellerRoleFilter && listing.seller_role !== sellerRoleFilter) {
        return false;
      }

      return true;
    });
  }, [
    initialListings,
    categoryFilter,
    conditionFilter,
    minPriceFilter,
    maxPriceFilter,
    cityFilter,
    postalCodeFilter,
    sellerRoleFilter
  ]);

  const sortedListings = useMemo(() => {
    const listings = [...filteredListings];

    switch (sortOption) {
      case 'price_low_high':
        return listings.sort((a, b) => a.price - b.price);
      case 'price_high_low':
        return listings.sort((a, b) => b.price - a.price);
      case 'newest':
        return listings.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case 'oldest':
        return listings.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      case 'distance':
        return listings.sort((a, b) => {
          const distA = a.distance ? parseFloat(a.distance) : Infinity;
          const distB = b.distance ? parseFloat(b.distance) : Infinity;
          return distA - distB;
        });
      default:
        return listings;
    }
  }, [filteredListings, sortOption]);

  const uniqueCategories = useMemo(() => {
    const categories = initialListings.map(listing => listing.category);
    return Array.from(new Set(categories)).sort();
  }, [initialListings]);

  const uniqueConditions = useMemo(() => {
    const conditions = initialListings.map(listing => listing.condition);
    return Array.from(new Set(conditions)).sort();
  }, [initialListings]);

  const uniqueCities = useMemo(() => {
    const cities = initialListings.map(listing => listing.city).filter(Boolean);
    return Array.from(new Set(cities)).sort();
  }, [initialListings]);

  const priceRange = useMemo(() => {
    if (initialListings.length === 0) return { min: 0, max: 0 };
    
    let min = Infinity;
    let max = -Infinity;
    
    initialListings.forEach(listing => {
      if (listing.price < min) min = listing.price;
      if (listing.price > max) max = listing.price;
    });
    
    return { min, max };
  }, [initialListings]);

  return {
    filteredListings: sortedListings,
    categoryFilter,
    setCategoryFilter,
    conditionFilter,
    setConditionFilter,
    minPriceFilter,
    setMinPriceFilter,
    maxPriceFilter,
    setMaxPriceFilter,
    cityFilter,
    setCityFilter,
    postalCodeFilter,
    setPostalCodeFilter,
    sortOption,
    setSortOption,
    sellerRoleFilter,
    setSellerRoleFilter,
    uniqueCategories,
    uniqueConditions,
    uniqueCities,
    priceRange
  };
};

export default useMarketplaceFilters;
