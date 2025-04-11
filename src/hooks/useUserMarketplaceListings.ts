
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MarketplaceListing } from '@/hooks/useMarketplaceListings';
import { useAuth } from '@/hooks/useAuth';

export const useUserMarketplaceListings = () => {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchUserListings = async () => {
    setLoading(true);
    setError(null);

    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Type assertion to help TypeScript understand the data structure
      type RawListingData = {
        [key: string]: any;
        damage_images?: string[];
        is_negotiable?: boolean;
        approval_status: string;
      };
      
      // Ensure the data matches our MarketplaceListing type
      const typedData = data?.map((item: RawListingData) => ({
        ...item,
        // Ensure approval_status is one of the expected values
        approval_status: (item.approval_status as 'pending' | 'approved' | 'rejected'),
        damage_images: item.damage_images || [],
        is_negotiable: item.is_negotiable || false
      })) as MarketplaceListing[];

      setListings(typedData || []);
    } catch (err: any) {
      console.error('Error fetching user marketplace listings:', err);
      setError('Failed to fetch your listings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const deleteListing = async (listingId: string) => {
    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .delete()
        .eq('id', listingId)
        .eq('seller_id', user?.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Listing deleted",
        description: "Your listing has been successfully deleted.",
      });

      // Refresh listings
      fetchUserListings();
    } catch (err: any) {
      console.error('Error deleting marketplace listing:', err);
      toast({
        title: "Error",
        description: "Failed to delete listing. Please try again.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchUserListings();
  }, [user]);

  return { 
    listings, 
    loading, 
    error, 
    refetch: fetchUserListings,
    deleteListing
  };
};
