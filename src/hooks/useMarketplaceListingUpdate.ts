
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UpdateListingOptions {
  ownershipNumber?: string;
  // Add other fields that might be updateable in the future
}

export const useMarketplaceListingUpdate = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const updateListing = async (listingId: string, options: UpdateListingOptions) => {
    if (!listingId) {
      toast({
        title: "Update failed",
        description: "No listing ID provided",
        variant: "destructive",
        duration: 3000
      });
      return false;
    }

    setIsUpdating(true);
    try {
      const updateData: Record<string, any> = {};
      
      // Only include fields that are provided
      if (options.ownershipNumber !== undefined) {
        updateData.ownership_number = options.ownershipNumber;
      }
      
      // Don't proceed if there's nothing to update
      if (Object.keys(updateData).length === 0) {
        setIsUpdating(false);
        return false;
      }
      
      console.log('Updating listing with data:', updateData);
      
      const { error, data } = await supabase
        .from('marketplace_listings')
        .update(updateData)
        .eq('id', listingId)
        .select();
      
      if (error) {
        console.error('Error updating listing:', error);
        toast({
          title: "Update failed",
          description: error.message,
          variant: "destructive",
          duration: 3000
        });
        return false;
      }
      
      console.log('Update successful, response:', data);
      
      toast({
        title: "Listing updated",
        description: "Your changes have been saved",
        duration: 2000
      });
      return true;
    } catch (err) {
      console.error('Error in update function:', err);
      toast({
        title: "Update failed",
        description: "An unexpected error occurred",
        variant: "destructive",
        duration: 3000
      });
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateListing,
    isUpdating
  };
};
