
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
  seller_rating?: number;
  review_count?: number;
  images: string[];
  damage_images?: string[];
  inspection_certificates?: string[];
  created_at: string;
  approval_status: 'approved' | 'pending' | 'rejected';
  is_negotiable?: boolean;
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

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
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

export default useMarketplaceListings;
