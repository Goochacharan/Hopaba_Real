
import React from 'react';
import { Badge } from '@/components/ui/badge';
import ListingMetadata from './ListingMetadata';
import { MarketplaceListing } from '@/hooks/useMarketplaceListings';

interface ListingDetailsHeaderProps {
  listing: MarketplaceListing;
}

const ListingDetailsHeader: React.FC<ListingDetailsHeaderProps> = ({ listing }) => {
  return (
    <div className="mb-3">
      <Badge className="mb-2">{listing.category}</Badge>
      <h1 className="text-2xl sm:text-3xl font-bold mb-0">{listing.title}</h1>
      <div className="flex flex-wrap items-center gap-2 mt-1">
        <ListingMetadata 
          location={listing.location} 
          createdAt={listing.created_at} 
          condition={listing.condition}
          modelYear={listing.model_year} 
        />
      </div>
    </div>
  );
};

export default ListingDetailsHeader;
