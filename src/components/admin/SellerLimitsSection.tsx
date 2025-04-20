
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
}

const SellerLimitsSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const { data: sellers, isLoading, error, refetch } = useQuery({
    queryKey: ['seller-limits'],
    queryFn: async () => {
      try {
        // Directly fetch from seller_listing_limits table without any joins
        const { data: limits, error: limitsError } = await supabase
          .from('seller_listing_limits')
          .select('*');

        if (limitsError) throw limitsError;

        if (!limits || !Array.isArray(limits)) {
          return [];
        }

        // Then fetch marketplace listings with seller information
        const { data: listings, error: listingsError } = await supabase
          .from('marketplace_listings')
          .select('seller_id, seller_name')
          .in('approval_status', ['approved', 'pending'])
          .order('seller_name');

        if (listingsError) throw listingsError;

        // Combine the data - with fallback names for sellers without listings
        const sellerLimits: SellerLimit[] = limits.map(limit => {
          const listing = listings?.find(l => l.seller_id === limit.user_id);
          return {
            user_id: limit.user_id,
            max_listings: limit.max_listings,
            seller_name: listing?.seller_name || `Seller (${limit.user_id.substring(0, 8)})`
          };
        });

        // Add any sellers from listings that don't have limits set
        const existingUserIds = new Set(limits.map(l => l.user_id));
        const uniqueSellers = new Map();
        
        listings?.forEach(listing => {
          if (listing.seller_id && !existingUserIds.has(listing.seller_id) && !uniqueSellers.has(listing.seller_id)) {
            uniqueSellers.set(listing.seller_id, {
              user_id: listing.seller_id,
              max_listings: 10, // Default value
              seller_name: listing.seller_name
            });
          }
        });
        
        return [...sellerLimits, ...Array.from(uniqueSellers.values())];
      } catch (err) {
        console.error('Error fetching seller limits:', err);
        throw err;
      }
    }
  });

  const updateLimit = async (userId: string, newLimit: number) => {
    try {
      const { error } = await supabase
        .from('seller_listing_limits')
        .upsert({ 
          user_id: userId, 
          max_listings: newLimit,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Listing limit updated successfully"
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

  const filteredSellers = sellers?.filter(seller =>
    seller.seller_name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Seller Listing Limits</h2>
        <p className="text-muted-foreground">Manage maximum listings allowed per seller</p>
      </div>

      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search sellers..."
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
              <TableHead>Current Limit</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSellers.map((seller) => (
              <TableRow key={seller.user_id}>
                <TableCell>{seller.seller_name}</TableCell>
                <TableCell>{seller.max_listings}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateLimit(seller.user_id, Math.max(1, seller.max_listings - 1))}
                    >
                      -
                    </Button>
                    <span className="w-12 text-center">{seller.max_listings}</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateLimit(seller.user_id, seller.max_listings + 1)}
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
