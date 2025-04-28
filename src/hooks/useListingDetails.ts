
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useMarketplaceListing } from '@/hooks/useMarketplaceListings';

export const useListingDetails = () => {
  const { id = '' } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const {
    data: listing,
    isLoading,
    error,
    refetch
  } = useMarketplaceListing(id);

  // Set up a listener to refetch the listing when updates happen
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refetch();
      }
    };

    const handleFocusRefetch = () => {
      refetch();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocusRefetch);
    
    // Ensure data is fresh
    refetch();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocusRefetch);
    };
  }, [refetch]);

  const refreshListingData = () => {
    queryClient.invalidateQueries({ queryKey: ['marketplaceListing', id] });
    refetch();
  };

  return {
    id,
    listing,
    isLoading,
    error,
    refreshListingData
  };
};
