
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
        // Since the seller_listing_limits table might be new, we need to fetch
        // data in a way that handles tables that may not be in the TypeScript definitions yet
        const { data: limits, error: limitsError } = await supabase
          .from('seller_listing_limits')
          .select(`
            user_id,
            max_listings,
            marketplace_listings!inner(
              seller_name,
              seller_id
            )
          `)
          .gt('max_listings', 5) as any;

        if (limitsError) throw limitsError;

        if (!limits || !Array.isArray(limits)) {
          return [];
        }

        // Remove duplicates and format data
        const uniqueSellers = limits.reduce((acc: SellerLimit[], curr: any) => {
          const marketplace_listings = curr.marketplace_listings || [];
          if (!acc.find((item: any) => item.user_id === curr.user_id)) {
            acc.push({
              user_id: curr.user_id,
              max_listings: curr.max_listings,
              seller_name: marketplace_listings[0]?.seller_name || 'Unknown Seller'
            });
          }
          return acc;
        }, []);

        return uniqueSellers;
      } catch (err) {
        console.error('Error fetching seller limits:', err);
        throw err;
      }
    }
  });

  const updateLimit = async (userId: string, newLimit: number) => {
    try {
      // Using 'as any' to bypass TypeScript errors with tables not in the definition
      const { error } = await (supabase
        .from('seller_listing_limits')
        .upsert({ 
          user_id: userId, 
          max_listings: newLimit,
          updated_at: new Date().toISOString()
        }) as any);

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
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sellers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
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
