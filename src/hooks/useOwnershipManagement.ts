
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useMarketplaceListingUpdate } from './useMarketplaceListingUpdate';
import { useAuth } from './useAuth';

export const useOwnershipManagement = (listingId: string, sellerId: string, initialOwnership: string = "1st") => {
  const [isEditingOwnership, setIsEditingOwnership] = useState(false);
  const [tempOwnershipValue, setTempOwnershipValue] = useState(initialOwnership);
  const { user } = useAuth();
  const { updateListing, isUpdating } = useMarketplaceListingUpdate();
  const queryClient = useQueryClient();
  
  // Reset tempOwnershipValue when initialOwnership changes
  useEffect(() => {
    if (initialOwnership) {
      setTempOwnershipValue(initialOwnership);
    }
  }, [initialOwnership]);
  
  const isCurrentUserSeller = user && user.id === sellerId;

  const handleEditOwnership = () => {
    setIsEditingOwnership(true);
  };
  
  const handleSaveOwnership = async () => {
    console.log('Saving ownership:', tempOwnershipValue);
    
    const success = await updateListing(listingId, { ownershipNumber: tempOwnershipValue });
    
    if (success) {
      console.log('Update successful, setting editing to false');
      setIsEditingOwnership(false);
      
      // Force refetch the listing data to get the updated ownership value
      queryClient.invalidateQueries({ queryKey: ['marketplaceListing', listingId] });
      
      // Wait a moment and invalidate again to ensure we have fresh data
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['marketplaceListing', listingId] });
      }, 500);
    } else {
      console.log('Update failed');
    }
  };

  const handleCancelEdit = () => {
    setTempOwnershipValue(initialOwnership);
    setIsEditingOwnership(false);
  };

  return {
    isEditingOwnership,
    tempOwnershipValue,
    setTempOwnershipValue,
    isCurrentUserSeller,
    isUpdating,
    handleEditOwnership,
    handleSaveOwnership,
    handleCancelEdit
  };
};
