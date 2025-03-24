
import React from 'react';
import { MarketplaceListing } from '@/hooks/useMarketplaceListings';
import MarketplaceListingCard from '@/components/MarketplaceListingCard';
import { cn } from '@/lib/utils';

interface MarketplaceItemsListProps {
  listings: MarketplaceListing[];
}

const MarketplaceItemsList: React.FC<MarketplaceItemsListProps> = ({ listings }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {listings.map((listing, index) => (
        <div 
          key={listing.id} 
          className="animate-fade-in h-full" 
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <MarketplaceListingCard 
            listing={{
              ...listing,
              location: listing.location || "Not specified"
            }} 
            className={cn(
              "h-full flex flex-col",
              // Add a class for compact spacing in search results page
              "search-result-card compact-card"
            )}
          />
        </div>
      ))}
    </div>
  );
};

export default MarketplaceItemsList;
