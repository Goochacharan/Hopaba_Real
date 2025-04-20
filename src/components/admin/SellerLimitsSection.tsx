
import React, { useState, useEffect } from 'react';
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
import { Search, Loader2, AlertCircle, Phone } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Seller {
  id: string;
  seller_id: string;
  seller_name: string;
  seller_phone?: string;
  seller_whatsapp?: string; // Keep in interface even though not displayed
  seller_instagram?: string; // Keep in interface even though not displayed
  listing_limit: number;
  seller_rating?: number;
}

const SellerLimitsSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [phoneSearchQuery, setPhoneSearchQuery] = useState('');
  const [filteredSellers, setFilteredSellers] = useState<Seller[]>([]);
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

  // Normalize phone number to remove all non-digit characters
  const normalizePhone = (phone: string | undefined): string => {
    if (!phone) return '';
    return phone.replace(/\D/g, '');
  };

  // Apply phone number search filter
  const applyPhoneFilter = () => {
    if (!sellers) return;
    
    // If empty search, show all sellers
    if (!phoneSearchQuery.trim() && !searchQuery.trim()) {
      setFilteredSellers(sellers);
      return;
    }
    
    // Apply text search and phone number search
    const filtered = sellers.filter(seller => {
      // Text search for seller name
      const nameMatch = !searchQuery.trim() || 
        seller.seller_name.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Phone number search
      let phoneMatch = true;
      if (phoneSearchQuery.trim()) {
        // Clean the query to have only digits
        const cleanQuery = phoneSearchQuery.replace(/\D/g, '');
        
        if (cleanQuery.length > 0) {
          const cleanSellerPhone = normalizePhone(seller.seller_phone);
          phoneMatch = cleanSellerPhone.includes(cleanQuery);
        }
      }
      
      // Both conditions must be met
      return nameMatch && phoneMatch;
    });
    
    setFilteredSellers(filtered);
    
    // Provide feedback on search results
    if (filtered.length === 0) {
      toast({
        title: "No matches found",
        description: "No sellers match your search criteria",
        duration: 3000
      });
    }
  };

  // Initialize filtered sellers when sellers data is loaded
  useEffect(() => {
    if (sellers) {
      setFilteredSellers(sellers);
    }
  }, [sellers]);

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Seller Management</h2>
        <p className="text-muted-foreground">Manage seller information and listing limits</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by seller name"
            className="pl-8 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="relative flex-1">
          <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by phone number"
            className="pl-8 w-full"
            value={phoneSearchQuery}
            onChange={(e) => setPhoneSearchQuery(e.target.value)}
          />
        </div>
        
        <Button onClick={applyPhoneFilter} className="md:w-auto w-full">
          Search
        </Button>
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
              <TableHead>Phone Number</TableHead>
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
                  {seller.seller_phone || 'No phone number'}
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
