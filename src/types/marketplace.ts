
import { MarketplaceListing } from '@/hooks/useMarketplaceListings';

export interface MarketplaceListingWithDistance extends MarketplaceListing {
  distance?: number;
  seller_avatar?: string;
  postal_code?: string;
  approval_status?: 'approved' | 'pending' | 'rejected';
}
