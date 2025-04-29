
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useMarketplaceListingDebug = (listingId?: string) => {
  useEffect(() => {
    if (!listingId) return;
    
    // Log the current database state of the listing
    const fetchListing = async () => {
      console.log('Debug mode: Fetching current listing state for ID:', listingId);
      
      try {
        const { data, error } = await supabase
          .from('marketplace_listings')
          .select('*')
          .eq('id', listingId)
          .single();
          
        if (error) {
          console.error('Error fetching listing for debug:', error);
          return;
        }
        
        console.log('Current listing in database:', data);
        console.log('Ownership number in database:', data.ownership_number);
      } catch (err) {
        console.error('Debug fetch error:', err);
      }
    };
    
    fetchListing();
    
    // Also listen for any changes to this listing
    const channel = supabase
      .channel('listing-debug')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'marketplace_listings',
        filter: `id=eq.${listingId}`
      }, (payload) => {
        console.log('Listing updated in database:', payload.new);
        console.log('New ownership number:', payload.new.ownership_number);
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [listingId]);
  
  return {
    logFormState: (formData: any) => {
      console.log('Debug: Current form state before submission:', formData);
      console.log('Debug: Ownership number in form:', formData.ownership_number);
    }
  };
};
