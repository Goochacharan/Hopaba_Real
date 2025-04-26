
import React, { useEffect, useState } from 'react';
import { MarketplaceListing } from '@/hooks/useMarketplaceListings';
import MarketplaceListingCard from '@/components/MarketplaceListingCard';
import { cn } from '@/lib/utils';
import { Loader2, Unlock, Lock } from 'lucide-react';
import NoResultsMessage from './NoResultsMessage';
import { useAuth } from '@/hooks/useAuth';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Clock } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

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
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  useEffect(() => {
    // Log more details for debugging
    console.log("MarketplaceItemsList - listings length:", listings?.length || 0);
    if (listings && listings.length > 0) {
      console.log("Sample listing data for debugging:");
      console.log("First listing postal code:", listings[0].postal_code);
      console.log("First listing damage images:", listings[0].damage_images);
      console.log("First listing certificates:", listings[0].inspection_certificates);
      console.log("First listing seller role:", listings[0].seller_role);
      console.log("First listing bill images:", listings[0].bill_images);
    }
  }, [listings]);

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

  // Filter listings to show approved ones or user's own listings regardless of approval status
  const visibleListings = listings.filter(listing => 
    listing.approval_status === 'approved' || 
    (user && listing.seller_id === user.id)
  );

  console.log(`After filtering, ${visibleListings.length} listings are visible`);
  
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
            {visibleListings.some(l => l.title.toLowerCase().includes('honda') && l.title.toLowerCase().includes('wrv')) && (
              <span className="block mt-1 font-medium">Your Honda WRV listing will appear after approval.</span>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {visibleListings.map((listing, index) => {
          console.log(`Rendering listing ${index}:`, listing.title, 
            `with postal_code:`, listing.postal_code,
            `with damage_images:`, listing.damage_images?.length || 0,
            `seller role:`, listing.seller_role,
            `with bill_images:`, listing.bill_images?.length || 0,
            `and certificates:`, listing.inspection_certificates?.length || 0);
            
          // Make sure all the necessary properties are present
          const enhancedListing = {
            ...listing,
            location: listing.location || "Not specified",
            damage_images: listing.damage_images || [],
            inspection_certificates: listing.inspection_certificates || [],
            bill_images: listing.bill_images || [],
            is_negotiable: listing.is_negotiable !== undefined ? listing.is_negotiable : false
          };
            
          return (
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
                listing={enhancedListing}
                className={cn(
                  "h-full flex flex-col",
                  "search-result-card", 
                  listing.approval_status === 'pending' ? "opacity-75" : ""
                )}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MarketplaceItemsList;
