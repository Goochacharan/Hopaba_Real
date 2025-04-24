
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  model_year?: string;
  location: string;
  map_link?: string;
  seller_name: string;
  seller_id?: string;
  seller_phone?: string;
  seller_whatsapp?: string;
  seller_instagram?: string;
  seller_role: 'owner' | 'dealer'; // Ensuring this is a union type, not just string
  seller_rating?: number;
  review_count?: number;
  images?: string[];
  created_at: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  is_negotiable?: boolean;
  damage_images?: string[];
  inspection_certificates?: string[];
  shop_images?: string[];
  area: string;
  city: string;
  postal_code: string;
  updated_at: string;
}

interface MarketplaceListingsQueryOptions {
  category?: string;
  searchQuery?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  includeAllStatuses?: boolean;
}

export const useMarketplaceListings = (options: MarketplaceListingsQueryOptions = {}) => {
  const {
    category,
    searchQuery,
    condition,
    minPrice,
    maxPrice,
    minRating,
    includeAllStatuses = false
  } = options;

  return useQuery({
    queryKey: ['marketplaceListings', { category, searchQuery, condition, minPrice, maxPrice, minRating }],
    queryFn: async () => {
      let query = supabase
        .from('marketplace_listings')
        .select('*');

      if (!includeAllStatuses) {
        query = query.eq('approval_status', 'approved');
      }

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

      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      // Cast the result to ensure compliance with our interface
      return (data || []).map(item => ({
        ...item,
        // Ensure seller_role is either 'owner' or 'dealer'
        seller_role: (item.seller_role as string || 'owner') as 'owner' | 'dealer',
        // Ensure seller_rating is a number
        seller_rating: item.seller_rating || 0,
        // Make sure shop_images is an array
        shop_images: item.shop_images || [],
        // Add review_count if it doesn't exist
        review_count: item.review_count || 0
      })) as MarketplaceListing[];
    }
  });
};

export const useMarketplaceListing = (id: string) => {
  return useQuery({
    queryKey: ['marketplaceListing', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (!data) return null;

      // Cast the result to ensure compliance with our interface
      return {
        ...data,
        // Ensure seller_role is either 'owner' or 'dealer'
        seller_role: (data.seller_role as string || 'owner') as 'owner' | 'dealer',
        // Ensure seller_rating is a number
        seller_rating: data.seller_rating || 0,
        // Make sure shop_images is an array
        shop_images: data.shop_images || [],
        // Add review_count if it doesn't exist
        review_count: data.review_count || 0
      } as MarketplaceListing;
    },
    enabled: !!id
  });
};
