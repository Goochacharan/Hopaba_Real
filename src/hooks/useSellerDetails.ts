
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MarketplaceListing } from '@/hooks/useMarketplaceListings';

export interface SellerReview {
  id: string;
  rating: number;
  comment: string;
  reviewer_name: string;
  created_at: string;
}

export interface SellerDetails {
  id: string;
  name: string;
  rating: number;
  review_count: number;
  listings: MarketplaceListing[];
  reviews: SellerReview[];
}

export const useSellerDetails = (sellerId: string) => {
  const [sellerDetails, setSellerDetails] = useState<SellerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSellerDetails = async () => {
      setLoading(true);
      setError(null);

      if (!sellerId) {
        setError('Seller ID is required');
        setLoading(false);
        return;
      }

      try {
        // Fetch seller listings
        const { data: listingsData, error: listingsError } = await supabase
          .from('marketplace_listings')
          .select('*')
          .eq('seller_id', sellerId)
          .order('created_at', { ascending: false });

        if (listingsError) throw listingsError;

        // For now, we'll create a mock seller details object since we haven't created a reviews table yet
        // In a real implementation, you'd fetch this from a sellers or profiles table
        const listings = listingsData as MarketplaceListing[];
        
        // Take seller name from the first listing if we have any
        const sellerName = listings.length > 0 ? listings[0].seller_name : 'Unknown Seller';
        const sellerRating = listings.length > 0 ? listings[0].seller_rating || 4.5 : 4.5;
        
        // Mock reviews for now - in a real implementation, we'd fetch these from a reviews table
        const mockReviews: SellerReview[] = [
          {
            id: '1',
            rating: 5,
            comment: 'Great seller! Fast response and item as described.',
            reviewer_name: 'John Doe',
            created_at: new Date().toISOString()
          },
          {
            id: '2',
            rating: 4,
            comment: 'Good transaction overall. Would buy from them again.',
            reviewer_name: 'Jane Smith',
            created_at: new Date(Date.now() - 86400000).toISOString() // 1 day ago
          }
        ];

        setSellerDetails({
          id: sellerId,
          name: sellerName,
          rating: sellerRating,
          review_count: mockReviews.length,
          listings: listings,
          reviews: mockReviews
        });

      } catch (err: any) {
        console.error('Error fetching seller details:', err);
        setError('Failed to fetch seller details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchSellerDetails();
  }, [sellerId]);

  return { sellerDetails, loading, error };
};
