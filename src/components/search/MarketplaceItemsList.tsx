
import React from 'react';
import { MarketplaceListing } from '@/hooks/useMarketplaceListings';
import MarketplaceListingCard from '@/components/MarketplaceListingCard';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import NoResultsMessage from './NoResultsMessage';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock } from 'lucide-react';

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
  const { user } = useAuth();

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

  // Filter listings to show approved ones or user's own listings
  const visibleListings = listings.filter(listing => 
    listing.approval_status === 'approved' || 
    (user && listing.seller_id === user.id)
  );

  if (visibleListings.length === 0) {
    return <NoResultsMessage type="marketplace" />;
  }

  return (
    <div className="space-y-4 pb-24">
      {visibleListings.some(l => l.approval_status === 'pending' && user && l.seller_id === user.id) && (
        <Alert variant="default" className="bg-yellow-50 border-yellow-200">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Some of your listings are pending admin approval and are only visible to you.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {visibleListings.map((listing, index) => (
          <div 
            key={listing.id} 
            className="animate-fade-in h-full relative" 
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {user && listing.seller_id === user.id && listing.approval_status === 'pending' && (
              <Badge variant="outline" className="absolute top-2 right-2 z-10 bg-yellow-100 text-yellow-800 border-yellow-300">
                Pending Approval
              </Badge>
            )}
            <MarketplaceListingCard 
              listing={{
                ...listing,
                location: listing.location || "Not specified"
              }} 
              className={cn(
                "h-full flex flex-col",
                "search-result-card", // This class will be used to identify search result cards
                listing.approval_status === 'pending' ? "opacity-75" : ""
              )}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketplaceItemsList;
