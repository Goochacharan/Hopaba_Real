import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  price: number;
  is_negotiable?: boolean;
  category: string;
  condition: string;
  location: string;
  seller_name: string;
  seller_id?: string;
  seller_rating: number;
  seller_phone: string | null;
  seller_whatsapp: string | null;
  seller_instagram: string | null;
  map_link?: string | null;
  created_at: string;
  images: string[];
  approval_status: 'pending' | 'approved' | 'rejected';
  review_count?: number;
}

interface UseMarketplaceListingsOptions {
  category?: string;
  searchQuery?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  includeAllStatuses?: boolean;
}

export const useMarketplaceListings = (options: UseMarketplaceListingsOptions = {}) => {
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
        const searchTerms = searchQuery.trim().toLowerCase();
        
        // Split the search query into individual words for more flexible matching
        const searchWords = searchTerms.split(/\s+/).filter(word => word.length > 0);
        
        if (searchWords.length > 0) {
          // Create a complex OR condition for each word across multiple fields
          const orConditions = searchWords.map(word => {
            return `title.ilike.%${word}%,description.ilike.%${word}%,category.ilike.%${word}%,location.ilike.%${word}%`;
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
      
      // If there are search words, do additional client-side filtering to improve word combination matching
      let filteredData = data || [];
      
      if (searchQuery && searchQuery.trim() !== '') {
        const searchWords = searchQuery.trim().toLowerCase().split(/\s+/).filter(word => word.length > 0);
        
        if (searchWords.length > 1) {
          // Calculate a relevance score for each listing based on how many search words it contains
          filteredData = filteredData.map(listing => {
            const listingText = `${listing.title} ${listing.description} ${listing.category} ${listing.location}`.toLowerCase();
            
            // Count how many of the search words appear in the listing
            const matchedWords = searchWords.filter(word => listingText.includes(word));
            const relevanceScore = matchedWords.length / searchWords.length;
            
            return {
              ...listing,
              relevanceScore
            };
          });
          
          // Filter out listings with low relevance (less than 50% of words matched)
          filteredData = filteredData.filter(listing => (listing as any).relevanceScore > 0.35);
          
          // Sort by relevance score (higher is better)
          filteredData.sort((a, b) => (b as any).relevanceScore - (a as any).relevanceScore);
        }
      }
      
      console.log("Marketplace listings fetched:", filteredData?.map(l => ({
        id: l.id,
        title: l.title,
        category: l.category,
        approval_status: l.approval_status,
        seller_id: l.seller_id,
        seller_rating: l.seller_rating,
        current_user_id: user?.id
      })));
      
      setListings(filteredData as MarketplaceListing[]);
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
