
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MarketplaceListingsParams, MarketplaceListing } from '@/types/marketplace';
import { formatListingData, getSellerReviewCounts } from '@/utils/marketplaceUtils';

// Hook for getting multiple marketplace listings with filters
export const useMarketplaceListings = (params: MarketplaceListingsParams = {}) => {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    category, 
    searchQuery,
    condition,
    minPrice,
    maxPrice,
    minRating,
    includeAllStatuses
  } = params;
  
  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase
        .from('marketplace_listings')
        .select('*');

      // Apply filters if provided
      if (category) {
        query = query.eq('category', category);
      }
      
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }
      
      if (condition) {
        query = query.eq('condition', condition);
      }
      
      if (minPrice !== undefined) {
        query = query.gte('price', minPrice);
      }
      
      if (maxPrice !== undefined) {
        query = query.lte('price', maxPrice);
      }
      
      if (minRating !== undefined) {
        query = query.gte('seller_rating', minRating);
      }
      
      // By default, only show approved listings unless includeAllStatuses is true
      if (!includeAllStatuses) {
        query = query.eq('approval_status', 'approved');
      }
      
      // Order by creation date, newest first
      query = query.order('created_at', { ascending: false });
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      if (!data) {
        setListings([]);
        return;
      }

      // Get all seller IDs from the listings
      const sellerIds = data
        .filter(item => item.seller_id)
        .map(item => item.seller_id as string);

      // Get review counts for sellers in one batch
      const reviewCounts = await getSellerReviewCounts(sellerIds);
      
      // Process each listing to ensure it matches our expected type
      const formattedListings: MarketplaceListing[] = data.map(item => {
        const reviewCount = item.seller_id ? (reviewCounts[item.seller_id] || 0) : 0;
        return formatListingData(item, reviewCount);
      });
      
      setListings(formattedListings);
    } catch (err: any) {
      console.error('Error fetching marketplace listings:', err);
      setError('Failed to fetch listings. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [category, searchQuery, condition, minPrice, maxPrice, minRating, includeAllStatuses]);
  
  useEffect(() => {
    fetchListings();
  }, [fetchListings]);
  
  return { 
    listings, 
    loading, 
    error,
    refetch: fetchListings  
  };
};
