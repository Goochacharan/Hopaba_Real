
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  model_year?: string | null;
  location: string | null;
  map_link?: string | null;
  seller_name: string;
  seller_id?: string | null;
  seller_phone?: string | null;
  seller_whatsapp?: string | null;
  seller_instagram?: string | null;
  seller_avatar?: string | null;
  seller_rating?: number;
  review_count?: number;
  images: string[];
  damage_images?: string[];
  inspection_certificates?: string[];
  created_at: string;
  approval_status: 'approved' | 'pending' | 'rejected';
  is_negotiable?: boolean;
  search_rank?: number;
}

interface UseMarketplaceListingsProps {
  limit?: number;
  category?: string;
  searchQuery?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  includeAllStatuses?: boolean;
  sellerID?: string;
}

export const useMarketplaceListings = ({
  limit = 100,
  category,
  searchQuery = '',
  condition,
  minPrice,
  maxPrice,
  minRating,
  includeAllStatuses = false,
  sellerID
}: UseMarketplaceListingsProps = {}) => {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchListings = async () => {
    setLoading(true);
    setError(null);

    try {
      if (searchQuery && searchQuery.trim() !== '') {
        // Use the enhanced search function for complex queries
        const { data, error } = await supabase.rpc(
          'search_enhanced_listings', 
          { search_query: searchQuery }
        );

        if (error) {
          throw error;
        }

        console.log('Enhanced search results:', data);
        
        let filteredData = data || [];
        
        // Apply any additional filters (these filters are applied after the search)
        if (category) {
          filteredData = filteredData.filter(item => item.category === category);
        }
        
        if (condition) {
          filteredData = filteredData.filter(item => item.condition === condition);
        }
        
        if (minPrice !== undefined) {
          filteredData = filteredData.filter(item => item.price >= minPrice);
        }
        
        if (maxPrice !== undefined) {
          filteredData = filteredData.filter(item => item.price <= maxPrice);
        }
        
        if (minRating !== undefined && minRating > 0) {
          filteredData = filteredData.filter(item => 
            item.seller_rating !== null && item.seller_rating >= minRating
          );
        }
        
        if (sellerID) {
          filteredData = filteredData.filter(item => item.seller_id === sellerID);
        }

        // Format the data to match MarketplaceListing interface
        const typedData = filteredData.map(item => ({
          ...item,
          approval_status: item.approval_status as 'approved' | 'pending' | 'rejected'
        })) as MarketplaceListing[];
        
        setListings(typedData);
      } else {
        // Use the standard query approach for non-search or simple category filtering
        let query = supabase
          .from('marketplace_listings')
          .select('*')
          .limit(limit);

        if (!includeAllStatuses) {
          query = query.eq('approval_status', 'approved');
        }

        if (category) {
          query = query.eq('category', category);
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

        if (sellerID) {
          query = query.eq('seller_id', sellerID);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        // Ensure the data conforms to the MarketplaceListing type
        const typedData = data?.map(item => ({
          ...item,
          approval_status: item.approval_status as 'approved' | 'pending' | 'rejected'
        })) as MarketplaceListing[];
        
        setListings(typedData || []);
      }
    } catch (err: any) {
      console.error('Error fetching marketplace listings:', err);
      setError('Failed to fetch listings. Please try again later.');
      toast({
        title: "Error",
        description: "Failed to fetch marketplace listings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [category, searchQuery, condition, minPrice, maxPrice, minRating, includeAllStatuses, sellerID, limit]);

  return {
    listings,
    loading,
    error,
    refetch: fetchListings
  };
};

// Add the missing hook for fetching a single marketplace listing
export const useMarketplaceListing = (id: string) => {
  const [listing, setListing] = useState<MarketplaceListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchListing = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      // Ensure the data conforms to the MarketplaceListing type
      const typedListing = {
        ...data,
        approval_status: data.approval_status as 'approved' | 'pending' | 'rejected'
      } as MarketplaceListing;
      
      setListing(typedListing);
    } catch (err: any) {
      console.error('Error fetching marketplace listing:', err);
      setError('Failed to fetch listing. Please try again later.');
      toast({
        title: "Error",
        description: "Failed to fetch marketplace listing.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchListing();
    }
  }, [id]);

  return {
    listing,
    loading,
    error,
    refetch: fetchListing
  };
};

export default useMarketplaceListings;
