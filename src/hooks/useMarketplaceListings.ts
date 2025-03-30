import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  images: string[];
  seller_name: string;
  seller_rating: number;
  seller_phone: string | null;
  seller_whatsapp: string | null;
  seller_instagram: string | null;
  seller_id: string; 
  location: string;
  map_link: string | null;
  created_at: string;
  updated_at: string;
  approval_status?: string;
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

    try {
      let query = supabase
        .from('marketplace_listings')
        .select('*');
      
      // Apply approval status filter
      if (!includeAllStatuses) {
        if (user) {
          // For logged-in users, show approved listings + their own pending listings
          query = query.or(`approval_status.eq.approved,seller_id.eq.${user.id}`);
        } else {
          // For visitors, only show approved listings
          query = query.eq('approval_status', 'approved');
        }
      }
      
      if (category && category !== 'all') {
        // First fetch all listings to check actual category values in the database
        const { data: allApprovedListings } = await supabase
          .from('marketplace_listings')
          .select('category');
        
        console.log('All approved listing categories:', [...new Set(allApprovedListings?.map(item => item.category) || [])]);
        
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
      }
      
      if (searchQuery && searchQuery.trim() !== '') {
        const searchTerms = searchQuery.trim().toLowerCase();
        
        query = query.or(`title.ilike.%${searchTerms}%,description.ilike.%${searchTerms}%,category.ilike.%${searchTerms}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      console.log(`Found ${data?.length || 0} marketplace listings for query "${searchQuery || ''}"`);
      console.log(`Listings: ${data?.map(l => `${l.title} (${l.category}) - ${l.approval_status}`).join(', ') || 'None'}`);
      
      if (category && category !== 'all') {
        console.log(`Category filter results: ${data?.length || 0} listings for "${category}"`);
        const categories = data?.map(item => item.category);
        console.log('Categories in results:', [...new Set(categories)]);
      }
      
      setListings((data || []) as MarketplaceListing[]);
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
