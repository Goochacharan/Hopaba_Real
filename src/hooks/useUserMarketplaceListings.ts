
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

      // Process the data to ensure it matches our MarketplaceListing type
      const typedData: MarketplaceListing[] = data?.map((item: any) => ({
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
        images: item.images || [],
        damage_images: item.damage_images || [],
        is_negotiable: item.is_negotiable || false,
        approval_status: item.approval_status as 'pending' | 'approved' | 'rejected',
        review_count: 0 // Set a default value, could be fetched separately if needed
      })) || [];

      setListings(typedData);
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
