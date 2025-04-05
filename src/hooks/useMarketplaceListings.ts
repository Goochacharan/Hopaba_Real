
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { MarketplaceListing, MarketplaceListingsOptions } from '@/types/marketplace';
import { processNaturalLanguageQuery } from '@/utils/searchUtils';
import { filterListingsBySearchQuery } from '@/utils/marketplaceUtils';

/**
 * Hook for fetching and filtering marketplace listings
 */
export const useMarketplaceListings = (options: MarketplaceListingsOptions = {}) => {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { category, searchQuery, condition, minPrice, maxPrice, minRating, includeAllStatuses } = options;

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    console.log("Fetching marketplace listings with options:", options);

    try {
      let query = supabase
        .from('marketplace_listings')
        .select('*');
      
      // Apply approval status filter
      if (!includeAllStatuses) {
        if (user) {
          // For logged-in users, show approved listings + their own listings (any status)
          query = query.or(`approval_status.eq.approved,seller_id.eq.${user.id}`);
          console.log(`Filtering for approved listings OR seller_id=${user.id}`);
        } else {
          // For visitors, only show approved listings
          query = query.eq('approval_status', 'approved');
          console.log(`Filtering for only approved listings (user not logged in)`);
        }
      } else {
        console.log("Including all approval statuses");
      }
      
      // Apply additional filters
      if (category && category !== 'all') {
        // Make category filter case-insensitive
        query = query.ilike('category', `%${category}%`);
        console.log(`Filtering by category (case-insensitive): "${category}"`);
      }
      
      if (condition && condition !== 'all') {
        query = query.ilike('condition', condition);
      }
      
      if (minPrice !== undefined) {
        query = query.gte('price', minPrice);
      }
      
      if (maxPrice !== undefined) {
        query = query.lte('price', maxPrice);
      }
      
      if (minRating !== undefined && minRating > 0) {
        query = query.gte('seller_rating', minRating);
        console.log(`Filtering by minimum rating: ${minRating}`);
      }
      
      if (searchQuery && searchQuery.trim() !== '') {
        // Process natural language search query
        const processedSearchQuery = processNaturalLanguageQuery(searchQuery.trim().toLowerCase());
        
        console.log(`Processed search query: "${processedSearchQuery}"`);
        
        // Split the search query into individual words for more flexible matching
        const searchWords = processedSearchQuery.split(/\s+/).filter(word => word.length > 2);
        
        if (searchWords.length > 0) {
          // Create a complex OR condition for each word across multiple fields
          const orConditions = searchWords.map(word => {
            return `title.ilike.%${word}%,description.ilike.%${word}%,category.ilike.%${word}%,location.ilike.%${word}%,seller_name.ilike.%${word}%`;
          }).join(',');
          
          query = query.or(orConditions);
          console.log(`Advanced search with multiple words: [${searchWords.join(', ')}]`);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      console.log(`Found ${data?.length || 0} marketplace listings`);
      
      let filteredData = data as MarketplaceListing[] || [];
      
      // If there is a search query, apply advanced search filtering
      if (searchQuery && searchQuery.trim() !== '') {
        filteredData = filterListingsBySearchQuery(filteredData, searchQuery);
      }
      
      console.log("Marketplace listings fetched:", filteredData?.map(l => ({
        id: l.id,
        title: l.title,
        location: l.location,
        approval_status: l.approval_status,
        seller_id: l.seller_id,
        seller_name: l.seller_name,
        seller_rating: l.seller_rating,
        tags: l.tags,
        current_user_id: user?.id
      })));
      
      setListings(filteredData);
    } catch (err) {
      console.error('Error fetching marketplace listings:', err);
      setError('Failed to fetch listings. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [category, searchQuery, condition, minPrice, maxPrice, minRating, includeAllStatuses, user]);

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

/**
 * Hook for fetching a single marketplace listing by ID
 */
export const useMarketplaceListing = (id: string) => {
  const [listing, setListing] = useState<MarketplaceListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) {
        setError('No listing ID provided');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('marketplace_listings')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (!data) {
          setError('Listing not found');
        } else {
          setListing(data as MarketplaceListing);
        }
      } catch (err) {
        console.error('Error fetching marketplace listing:', err);
        setError('Failed to fetch listing details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  return { listing, loading, error };
};
