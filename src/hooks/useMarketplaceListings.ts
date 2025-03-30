import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
}

export const useMarketplaceListings = (options: UseMarketplaceListingsOptions = {}) => {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { category, searchQuery, condition, minPrice, maxPrice, minRating } = options;

  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('marketplace_listings')
        .select('*')
        .eq('approval_status', 'approved');
      
      if (category && category !== 'all') {
        query = query.eq('category', category);
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
      if (condition && condition !== 'all') {
        console.log(`Filtering by condition: "${condition}"`);
      }
      
      setListings((data || []) as MarketplaceListing[]);
    } catch (err) {
      console.error('Error fetching marketplace listings:', err);
      setError('Failed to fetch listings. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [category, searchQuery, condition, minPrice, maxPrice, minRating]);

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
