
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

        // First fetch the marketplace listing
        const { data, error } = await supabase
          .from('marketplace_listings')
          .select('*')
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

        // Get review count for the seller if there's a seller_id
        let reviewCount = 0;
        if (data.seller_id) {
          const { data: reviewsData, error: reviewsError } = await supabase
            .from('seller_reviews')
            .select('count')
            .eq('seller_id', data.seller_id);

          if (!reviewsError && reviewsData && reviewsData.length > 0) {
            // Safely handle the count value - it could be a number or null
            const countValue = reviewsData[0]?.count;
            reviewCount = typeof countValue === 'number' ? countValue : 0;
          }
        }

        // Format the listing with proper type safety
        const formattedListing: MarketplaceListing = {
          id: data.id,
          title: data.title,
          description: data.description,
          price: data.price,
          category: data.category,
          condition: data.condition,
          location: data.location,
          seller_name: data.seller_name,
          created_at: data.created_at,
          updated_at: data.updated_at,
          images: data.images || [],
          damage_images: data.damage_images || [],
          is_negotiable: data.is_negotiable || false,
          approval_status: data.approval_status as 'pending' | 'approved' | 'rejected',
          seller_id: data.seller_id,
          seller_phone: data.seller_phone,
          seller_whatsapp: data.seller_whatsapp,
          seller_instagram: data.seller_instagram,
          seller_rating: data.seller_rating,
          map_link: data.map_link,
          review_count: reviewCount
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
  
  const fetchListings = async () => {
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

      // Get review counts for each seller with a separate query
      // This is more efficient than trying to join the tables
      const sellerIds = data
        .filter(item => item.seller_id)
        .map(item => item.seller_id);

      let reviewCounts: Record<string, number> = {};
      if (sellerIds.length > 0) {
        const uniqueSellerIds = [...new Set(sellerIds)];
        
        // For each seller, get their review count
        for (const sellerId of uniqueSellerIds) {
          if (sellerId) {
            const { data: reviewData } = await supabase
              .from('seller_reviews')
              .select('count')
              .eq('seller_id', sellerId);
              
            if (reviewData && reviewData.length > 0) {
              // Safely access the count value
              const countValue = reviewData[0]?.count;
              reviewCounts[sellerId] = typeof countValue === 'number' ? countValue : 0;
            }
          }
        }
      }
      
      // Process each listing to ensure it matches our expected type
      const formattedListings: MarketplaceListing[] = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price,
        category: item.category,
        condition: item.condition,
        location: item.location,
        seller_name: item.seller_name,
        seller_id: item.seller_id,
        seller_phone: item.seller_phone,
        seller_whatsapp: item.seller_whatsapp,
        seller_instagram: item.seller_instagram,
        seller_rating: item.seller_rating,
        map_link: item.map_link,
        created_at: item.created_at,
        updated_at: item.updated_at,
        review_count: item.seller_id ? (reviewCounts[item.seller_id] || 0) : 0,
        images: item.images || [],
        damage_images: item.damage_images || [],
        is_negotiable: item.is_negotiable || false,
        approval_status: item.approval_status as 'pending' | 'approved' | 'rejected'
      }));
      
      setListings(formattedListings);
    } catch (err: any) {
      console.error('Error fetching marketplace listings:', err);
      setError('Failed to fetch listings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchListings();
  }, [category, searchQuery, condition, minPrice, maxPrice, minRating, includeAllStatuses]);
  
  return { 
    listings, 
    loading, 
    error,
    refetch: fetchListings  
  };
};
