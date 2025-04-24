
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface SellerListingCountProps {
  sellerId: string | null | undefined;
}

const SellerListingCount: React.FC<SellerListingCountProps> = ({ sellerId }) => {
  const [listingCount, setListingCount] = useState<number>(0);

  useEffect(() => {
    if (sellerId) {
      fetchListingCount(sellerId);
    }
  }, [sellerId]);

  const fetchListingCount = async (sellerIdValue: string) => {
    try {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select('id')
        .eq('seller_id', sellerIdValue)
        .eq('approval_status', 'approved');

      if (error) {
        console.error('Error fetching listing count:', error);
        return;
      }

      setListingCount(data?.length || 0);
    } catch (err) {
      console.error('Failed to fetch listing count:', err);
    }
  };

  if (!sellerId) return null;

  return (
    <Link
      to={`/seller/${sellerId}`}
      onClick={(e) => e.stopPropagation()}
      className="text-xs text-gray-700 hover:text-primary transition-colors"
    >
      {listingCount} Listings
    </Link>
  );
};

export default SellerListingCount;
