
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

      // Ensure the data conforms to the MarketplaceListing type
      const typedData = data?.map(item => ({
        ...item,
        approval_status: item.approval_status as 'approved' | 'pending' | 'rejected'
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

export default useUserMarketplaceListings;
