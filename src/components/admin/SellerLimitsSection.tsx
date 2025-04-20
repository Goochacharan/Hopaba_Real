
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

interface Seller {
  id: string;
  seller_id: string;
  seller_name: string;
  seller_phone?: string;
  seller_whatsapp?: string;
  seller_instagram?: string;
  listing_limit: number;
  seller_rating?: number;
}

const SellerLimitsSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const { data: sellers, isLoading, error, refetch } = useQuery({
    queryKey: ['sellers'],
    queryFn: async () => {
      try {
        const { data: sellersData, error: sellersError } = await supabase
          .from('sellers')
          .select('*')
          .order('seller_name');

        if (sellersError) throw sellersError;
        
        return sellersData as Seller[];
      } catch (err) {
        console.error('Error fetching sellers:', err);
        throw err;
      }
    }
  });

  const updateLimit = async (sellerId: string, newLimit: number) => {
    try {
      const { error } = await supabase
        .from('sellers')
        .update({ 
          listing_limit: newLimit,
          updated_at: new Date().toISOString()
        })
        .eq('seller_id', sellerId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Seller listing limit updated"
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
  
  const filteredSellers = sellers?.filter(seller => {
    const searchLower = searchQuery.toLowerCase();
    return seller.seller_name.toLowerCase().includes(searchLower) ||
           (seller.seller_phone && seller.seller_phone.includes(searchQuery)) ||
           (seller.seller_whatsapp && seller.seller_whatsapp.includes(searchQuery)) ||
           (seller.seller_instagram && seller.seller_instagram.toLowerCase().includes(searchLower));
  }) || [];

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Seller Management</h2>
        <p className="text-muted-foreground">Manage seller information and listing limits</p>
      </div>

      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search sellers by name or contact info"
          className="pl-8 w-full md:max-w-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading sellers</AlertTitle>
          <AlertDescription>
            There was a problem fetching seller information. Please try again later or contact support.
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
              <TableHead>Contact Information</TableHead>
              <TableHead>Current Limit</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSellers.map((seller) => (
              <TableRow key={seller.id}>
                <TableCell className="font-medium">
                  {seller.seller_name}
                </TableCell>
                <TableCell>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {seller.seller_phone && (
                      <div>📞 {seller.seller_phone}</div>
                    )}
                    {seller.seller_whatsapp && (
                      <div>WhatsApp: {seller.seller_whatsapp}</div>
                    )}
                    {seller.seller_instagram && (
                      <div>Instagram: @{seller.seller_instagram}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>{seller.listing_limit}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateLimit(seller.seller_id, seller.listing_limit - 1)}
                    >
                      -
                    </Button>
                    <span className="w-12 text-center">
                      {seller.listing_limit}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateLimit(seller.seller_id, seller.listing_limit + 1)}
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
