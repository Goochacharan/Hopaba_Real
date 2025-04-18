import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { usePaginatedQuery } from './usePaginatedQuery';

export const marketplaceListingSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  price: z.number(),
  category: z.string(),
  condition: z.string(),
  model_year: z.string().nullable(),
  location: z.string().nullable(),
  map_link: z.string().nullable(),
  seller_name: z.string(),
  seller_id: z.string().nullable(),
  seller_phone: z.string().nullable(),
  seller_whatsapp: z.string().nullable(),
  seller_instagram: z.string().nullable(),
  seller_rating: z.number().nullable(),
  review_count: z.number().nullable(),
  images: z.array(z.string()),
  damage_images: z.array(z.string()).nullable(),
  inspection_certificates: z.array(z.string()).nullable(),
  created_at: z.string(),
  approval_status: z.enum(['approved', 'pending', 'rejected']),
  is_negotiable: z.boolean().nullable(),
  search_rank: z.number().nullable(),
  seller_role: z.enum(['owner', 'dealer'], { 
    required_error: "Please select whether you are an owner or a dealer" 
  }),
  area: z.string().min(2, { message: "Area must be at least 2 characters" }),
  city: z.string().min(1, { message: "City is required" }),
  postal_code: z.string().regex(/^\d{6}$/, { message: "Postal code must be 6 digits" }),
});

export type MarketplaceListing = z.infer<typeof marketplaceListingSchema> & {
  id: string;
  created_at: string;
  approval_status: string;
  seller_id?: string;
  seller_name: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  images: string[];
  is_negotiable?: boolean;
  seller_role: 'owner' | 'dealer';
  area: string;
  city: string;
  postal_code: string;
};

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
  limit = 10,
  category,
  searchQuery = '',
  condition,
  minPrice,
  maxPrice,
  minRating,
  includeAllStatuses = false,
  sellerID
}: UseMarketplaceListingsProps = {}) => {
  const {
    page,
    setPage,
    isLoading,
    setIsLoading,
    error,
    setError,
    hasMore,
    setHasMore,
    handleError,
    pageSize
  } = usePaginatedQuery({ pageSize: limit });

  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const { toast } = useToast();

  const fetchListings = async (shouldReset = false) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);

    try {
      const startIndex = shouldReset ? 0 : (page - 1) * pageSize;

      if (searchQuery && searchQuery.trim() !== '') {
        const { data: enhancedResults, error: searchError } = await supabase.rpc(
          'search_enhanced_listings',
          { search_query: searchQuery }
        );

        if (searchError) throw searchError;

        let filteredData = enhancedResults || [];
        
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

        const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);
        
        setHasMore(startIndex + pageSize < filteredData.length);
        
        const typedData = paginatedData.map(item => ({
          ...item,
          approval_status: item.approval_status as 'approved' | 'pending' | 'rejected'
        })) as MarketplaceListing[];
        
        setListings(shouldReset ? typedData : [...listings, ...typedData]);
      } else {
        let query = supabase
          .from('marketplace_listings')
          .select('*', { count: 'exact' });

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

        const { data, error, count } = await query
          .range(startIndex, startIndex + pageSize - 1)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const typedData = data?.map(item => ({
          ...item,
          approval_status: item.approval_status as 'approved' | 'pending' | 'rejected'
        })) as MarketplaceListing[];

        setListings(shouldReset ? typedData : [...listings, ...typedData]);
        setHasMore(count ? startIndex + pageSize < count : false);
      }
    } catch (err: any) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setListings([]);
    fetchListings(true);
  }, [category, searchQuery, condition, minPrice, maxPrice, minRating, includeAllStatuses, sellerID]);

  const loadMore = () => {
    if (!isLoading && hasMore) {
      setPage(prev => prev + 1);
      fetchListings();
    }
  };

  return {
    listings,
    loading: isLoading,
    error,
    hasMore,
    loadMore,
    refetch: () => fetchListings(true)
  };
};

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
