
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useMarketplaceListingUpdate } from './useMarketplaceListingUpdate';
import { useAuth } from './useAuth';

export const useOwnershipManagement = (listingId: string, sellerId: string, initialOwnership: string = "1st") => {
  const [isEditingOwnership, setIsEditingOwnership] = useState(false);
  const [tempOwnershipValue, setTempOwnershipValue] = useState(initialOwnership);
  const { user } = useAuth();
  const { updateListing, isUpdating } = useMarketplaceListingUpdate();
  const queryClient = useQueryClient();
  
  const isCurrentUserSeller = user && user.id === sellerId;

  const handleEditOwnership = () => {
    setIsEditingOwnership(true);
  };
  
  const handleSaveOwnership = async () => {
    const success = await updateListing(listingId, { ownershipNumber: tempOwnershipValue });
    if (success) {
      setIsEditingOwnership(false);
      queryClient.invalidateQueries({ queryKey: ['marketplaceListing', listingId] });
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
