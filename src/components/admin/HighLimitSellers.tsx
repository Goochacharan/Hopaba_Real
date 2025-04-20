
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

const HighLimitSellers = () => {
  const { data: highLimitSellers, isLoading, error } = useQuery({
    queryKey: ['high-limit-sellers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('high_limit_sellers')
        .select('*');
      
      if (error) throw error;
      return data;
    }
  });

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error instanceof Error ? error.message : 'Failed to load high limit sellers'}
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">High Limit Sellers</h2>
        <p className="text-muted-foreground">Sellers with listing limits greater than 5</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Seller Names</TableHead>
            <TableHead>Contact Numbers</TableHead>
            <TableHead>Listing Limit</TableHead>
            <TableHead>Current Listings</TableHead>
            <TableHead>Last Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {highLimitSellers?.map((seller) => (
            <TableRow key={seller.user_id}>
              <TableCell>{seller.seller_names.join(', ')}</TableCell>
              <TableCell>{seller.seller_phones?.join(', ') || 'No contact number'}</TableCell>
              <TableCell>{seller.max_listings}</TableCell>
              <TableCell>{seller.current_listing_count}</TableCell>
              <TableCell>{new Date(seller.updated_at).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default HighLimitSellers;
