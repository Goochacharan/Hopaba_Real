
import React from 'react';
import { MarketplaceListing } from '@/hooks/useMarketplaceListings';
import MarketplaceListingCard from '@/components/MarketplaceListingCard';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import NoResultsMessage from './NoResultsMessage';

interface MarketplaceItemsListProps {
  listings: MarketplaceListing[];
  loading?: boolean;
  error?: string | null;
  category?: string;
}

const MarketplaceItemsList: React.FC<MarketplaceItemsListProps> = ({ 
  listings,
  loading = false,
  error = null,
  category
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  if (listings.length === 0) {
    return <NoResultsMessage type="marketplace" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-24">
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
              "search-result-card" // This class will be used to identify search result cards
            )}
          />
        </div>
      ))}
    </div>
  );
};

export default MarketplaceItemsList;
