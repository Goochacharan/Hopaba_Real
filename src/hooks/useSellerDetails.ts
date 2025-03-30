
import { useState, useEffect, useCallback } from 'react';
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

  const fetchSellerDetails = useCallback(async () => {
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

      // Fetch reviews from the seller_reviews table
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('seller_reviews')
        .select('id, rating, comment, reviewer_name, created_at')
        .eq('seller_id', sellerId)
        .order('created_at', { ascending: false });

      // If there's an error fetching reviews, log it but continue
      if (reviewsError) {
        console.error('Error fetching reviews:', reviewsError);
        // Continue even if reviews fail to load
      }

      const listings = listingsData as MarketplaceListing[];
      
      // Take seller name from the first listing if we have any
      const sellerName = listings.length > 0 ? listings[0].seller_name : 'Unknown Seller';
      
      // Calculate seller rating from reviews if available
      let sellerRating = 0;
      const reviews = reviewsData || [];

      if (reviews.length > 0) {
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        sellerRating = totalRating / reviews.length;
      } else {
        // If no reviews, use the rating from the first listing or default to 0
        sellerRating = listings.length > 0 ? listings[0].seller_rating || 0 : 0;
      }

      setSellerDetails({
        id: sellerId,
        name: sellerName,
        rating: sellerRating,
        review_count: reviews.length,
        listings: listings,
        reviews: reviews as SellerReview[]
      });

    } catch (err: any) {
      console.error('Error fetching seller details:', err);
      setError('Failed to fetch seller details. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [sellerId]);

  // Function to refresh data that can be called by the component
  const refreshData = useCallback(() => {
    return fetchSellerDetails();
  }, [fetchSellerDetails]);

  useEffect(() => {
    fetchSellerDetails();
  }, [fetchSellerDetails]);

  return { sellerDetails, loading, error, refreshData };
};
