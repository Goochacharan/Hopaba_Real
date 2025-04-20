import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SellerLimit {
  user_id: string;
  max_listings: number;
  seller_name: string;
  seller_phone?: string;
  listing_id?: string;
  listing_title?: string;
  seller_listing_limit?: number;
}

const SellerLimitsSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const { data: sellers, isLoading, error, refetch } = useQuery({
    queryKey: ['seller-limits'],
    queryFn: async () => {
      try {
        // First fetch directly from seller_listing_limits
        const { data: limits, error: limitsError } = await supabase
          .from('seller_listing_limits')
          .select('*');

        if (limitsError) throw limitsError;
        
        // Then fetch marketplace listings to get individual limits
        const { data: listings, error: listingsError } = await supabase
          .from('marketplace_listings')
          .select('id, seller_id, title, seller_name, seller_phone, seller_listing_limit')
          .order('seller_name');
          
        if (listingsError) throw listingsError;

        // Create a map of seller IDs to seller details
        const sellerLimits: SellerLimit[] = [];
        
        // Add global limits
        limits?.forEach(limit => {
          const sellerListings = listings?.filter(l => l.seller_id === limit.user_id) || [];
          const firstListing = sellerListings[0];
          
          sellerLimits.push({
            user_id: limit.user_id,
            max_listings: limit.max_listings,
            seller_name: firstListing?.seller_name || `Seller (${limit.user_id.substring(0, 8)})`,
            seller_phone: firstListing?.seller_phone
          });
          
          // Add individual listing limits if different from default
          sellerListings.forEach(listing => {
            if (listing.seller_listing_limit && listing.seller_listing_limit !== 5) {
              sellerLimits.push({
                user_id: limit.user_id,
                max_listings: limit.max_listings,
                seller_name: listing.seller_name,
                seller_phone: listing.seller_phone,
                listing_id: listing.id,
                listing_title: listing.title,
                seller_listing_limit: listing.seller_listing_limit
              });
            }
          });
        });
        
        return sellerLimits;
      } catch (err) {
        console.error('Error fetching seller limits:', err);
        throw err;
      }
    }
  });

  const updateLimit = async (userId: string, newLimit: number, listingId?: string) => {
    try {
      if (listingId) {
        // Update individual listing limit
        const { error } = await supabase
          .from('marketplace_listings')
          .update({ 
            seller_listing_limit: newLimit,
            updated_at: new Date().toISOString()
          })
          .eq('id', listingId);

        if (error) throw error;
      } else {
        // Update global seller limit
        const { error } = await supabase
          .from('seller_listing_limits')
          .upsert({ 
            user_id: userId, 
            max_listings: newLimit,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: listingId ? "Individual listing limit updated" : "Global listing limit updated"
      });

      refetch();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
    }
  };
  
  // Filter sellers based on search query
  const filteredSellers = sellers?.filter(seller => {
    const searchLower = searchQuery.toLowerCase();
    return seller.seller_name.toLowerCase().includes(searchLower) ||
           (seller.seller_phone && seller.seller_phone.includes(searchQuery)) ||
           (seller.listing_title && seller.listing_title.toLowerCase().includes(searchLower));
  }) || [];

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Seller Listing Limits</h2>
        <p className="text-muted-foreground">Manage maximum listings allowed per seller</p>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by seller name or phone number (with +91 prefix)"
          className="pl-8 w-full md:max-w-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading seller limits</AlertTitle>
          <AlertDescription>
            There was a problem fetching seller limits. Please try again later or contact support.
            {error instanceof Error ? ` (${error.message})` : ''}
          </AlertDescription>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-2">
            Retry
          </Button>
        </Alert>
      ) : isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredSellers.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No sellers found</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Seller Name</TableHead>
              <TableHead>Listing</TableHead>
              <TableHead>Current Limit</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSellers.map((seller) => (
              <TableRow key={seller.listing_id || seller.user_id}>
                <TableCell className="font-medium">
                  {seller.seller_name}
                  {seller.seller_phone && (
                    <div className="text-sm text-muted-foreground">
                      {seller.seller_phone}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {seller.listing_title ? (
                    <span className="text-sm text-muted-foreground">
                      Individual limit for: {seller.listing_title}
                    </span>
                  ) : (
                    <span className="text-sm font-medium">
                      Global Limit
                    </span>
                  )}
                </TableCell>
                <TableCell>{seller.seller_listing_limit || seller.max_listings}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateLimit(
                        seller.user_id, 
                        (seller.seller_listing_limit || seller.max_listings) - 1,
                        seller.listing_id
                      )}
                    >
                      -
                    </Button>
                    <span className="w-12 text-center">
                      {seller.seller_listing_limit || seller.max_listings}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateLimit(
                        seller.user_id, 
                        (seller.seller_listing_limit || seller.max_listings) + 1,
                        seller.listing_id
                      )}
                    >
                      +
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default SellerLimitsSection;
