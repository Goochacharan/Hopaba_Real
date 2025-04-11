
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  price: number;
  is_negotiable: boolean;
  category: string;
  condition: string;
  location: string;
  map_link?: string;
  images: string[];
  damage_images?: string[];
  seller_id?: string;
  seller_name: string;
  seller_phone?: string;
  seller_whatsapp?: string;
  seller_instagram?: string;
  seller_rating?: number;
  review_count?: number;
  created_at: string;
  updated_at: string;
  approval_status: 'pending' | 'approved' | 'rejected';
}

export interface MarketplaceListingsParams {
  category?: string;
  searchQuery?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  includeAllStatuses?: boolean;
}

// Hook for getting a single marketplace listing by ID
export const useMarketplaceListing = (id: string) => {
  const [listing, setListing] = useState<MarketplaceListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!id) {
          setError("No listing ID provided");
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('marketplace_listings')
          .select('*, seller_reviews(count)')
          .eq('id', id)
          .eq('approval_status', 'approved')
          .single();

        if (error) {
          throw error;
        }

        if (!data) {
          setError("Listing not found");
          setLoading(false);
          return;
        }

        const formattedListing: MarketplaceListing = {
          ...data,
          review_count: data.seller_reviews?.[0]?.count || 0,
          images: data.images || [],
          damage_images: data.damage_images || [],
          is_negotiable: data.is_negotiable || false,
          approval_status: data.approval_status as 'pending' | 'approved' | 'rejected'
        };

        setListing(formattedListing);
      } catch (err: any) {
        console.error('Error fetching marketplace listing:', err);
        setError("Failed to fetch listing. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  return { listing, loading, error };
};

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
  
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let query = supabase
          .from('marketplace_listings')
          .select('*, seller_reviews(count)');

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
        
        // Format the listings
        const formattedListings = data?.map(item => ({
          ...item,
          review_count: item.seller_reviews?.[0]?.count || 0,
          images: item.images || [],
          damage_images: item.damage_images || [],
          is_negotiable: item.is_negotiable || false,
          approval_status: item.approval_status as 'pending' | 'approved' | 'rejected'
        })) as MarketplaceListing[];
        
        setListings(formattedListings || []);
      } catch (err: any) {
        console.error('Error fetching marketplace listings:', err);
        setError('Failed to fetch listings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchListings();
  }, [category, searchQuery, condition, minPrice, maxPrice, minRating, includeAllStatuses]);
  
  return { listings, loading, error };
};
