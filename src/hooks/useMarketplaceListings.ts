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
