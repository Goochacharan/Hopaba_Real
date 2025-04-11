
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MarketplaceListing } from '@/types/marketplace';
import { formatListingData, getSellerReviewCount } from '@/utils/marketplaceUtils';

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
        const reviewCount = await getSellerReviewCount(data.seller_id);

        // Format the listing with proper type safety
        const formattedListing = formatListingData(data, reviewCount);

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
