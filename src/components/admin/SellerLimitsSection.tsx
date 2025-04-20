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
import { Alert, AlertDescription } from '@/components/ui/alert';
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
        // First get all seller limits
        const { data: limits, error: limitsError } = await supabase
          .from('seller_listing_limits')
          .select('user_id, max_listings');

        if (limitsError) throw limitsError;

        if (!limits || !Array.isArray(limits)) {
          return [];
        }

        // Then get seller names from marketplace_listings
        const { data: sellers, error: sellersError } = await supabase
          .from('marketplace_listings')
          .select('seller_id, seller_name')
          .in('seller_id', limits.map(l => l.user_id));

        if (sellersError) throw sellersError;

        // Combine the data
        const sellerLimits: SellerLimit[] = limits.map(limit => {
          const seller = sellers?.find(s => s.seller_id === limit.user_id);
          return {
            user_id: limit.user_id,
            max_listings: limit.max_listings,
            seller_name: seller?.seller_name || 'Unknown Seller'
          };
        });

        return sellerLimits;
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

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load seller limits</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Seller Listing Limits</h2>
        <p className="text-muted-foreground">Manage maximum listings allowed per seller</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                      onClick={() => updateLimit(seller.user_id, seller.max_listings - 1)}
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
