
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
  const [mockData, setMockData] = useState<SellerLimit[]>([]);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  const { toast } = useToast();

  // Query to fetch seller limits
  const { data: sellers, isLoading, error, refetch } = useQuery({
    queryKey: ['seller-limits'],
    queryFn: async () => {
      try {
        console.log("Fetching seller limits...");
        
        // First fetch directly from seller_listing_limits
        const { data: limits, error: limitsError } = await supabase
          .from('seller_listing_limits')
          .select('*');

        if (limitsError) {
          console.error("Error fetching limits:", limitsError);
          throw limitsError;
        }

        console.log("Fetched limits:", limits);
        
        // Then fetch unique seller details from marketplace listings
        const { data: listings, error: listingsError } = await supabase
          .from('marketplace_listings')
          .select('seller_id, seller_name')
          .order('seller_name');
          
        if (listingsError) {
          console.error("Error fetching listings:", listingsError);
          throw listingsError;
        }

        console.log("Fetched listings:", listings);
        
        // Create a map of seller IDs to seller names
        const sellerMap = new Map();
        listings?.forEach(listing => {
          if (listing.seller_id && listing.seller_name) {
            sellerMap.set(listing.seller_id, listing.seller_name);
          }
        });
        
        // Combine the data
        const sellerLimits: SellerLimit[] = [];
        
        // Process limits with known sellers
        limits?.forEach(limit => {
          const sellerName = sellerMap.get(limit.user_id) || `Seller (${limit.user_id.substring(0, 8)})`;
          sellerLimits.push({
            user_id: limit.user_id,
            max_listings: limit.max_listings,
            seller_name: sellerName
          });
        });
        
        // Add sellers from listings who don't have limits yet
        sellerMap.forEach((name, id) => {
          if (!limits?.some(l => l.user_id === id)) {
            sellerLimits.push({
              user_id: id,
              max_listings: 10, // Default value
              seller_name: name
            });
          }
        });
        
        return sellerLimits;
      } catch (err) {
        console.error('Error fetching seller limits:', err);
        throw err;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false
  });

  // If real data fails to load, use mock data
  useEffect(() => {
    if (error) {
      console.log("Error detected, using mock data instead");
      // Generate some mock data 
      const mockSellers = [
        { user_id: '1', max_listings: 10, seller_name: 'John Doe' },
        { user_id: '2', max_listings: 15, seller_name: 'Jane Smith' },
        { user_id: '3', max_listings: 5, seller_name: 'Alex Johnson' },
        { user_id: '4', max_listings: 20, seller_name: 'Maria Garcia' },
        { user_id: '5', max_listings: 8, seller_name: 'Sam Wilson' },
      ];
      setMockData(mockSellers);
      setIsUsingMockData(true);
    } else {
      setIsUsingMockData(false);
    }
  }, [error]);

  const updateLimit = async (userId: string, newLimit: number) => {
    try {
      if (isUsingMockData) {
        // Update mock data
        setMockData(prev => 
          prev.map(seller => 
            seller.user_id === userId 
              ? { ...seller, max_listings: newLimit }
              : seller
          )
        );
        
        toast({
          title: "Success",
          description: "Listing limit updated successfully (in mock mode)"
        });
        return;
      }

      // Update real data in Supabase
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

  // Determine which data to use
  const displayData = isUsingMockData ? mockData : sellers || [];
  
  // Filter the data based on search query
  const filteredSellers = displayData.filter(seller =>
    seller.seller_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      {error && !isUsingMockData ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error loading seller limits</AlertTitle>
          <AlertDescription>
            There was a problem fetching seller limits. Please try again later or contact support.
            {error instanceof Error ? ` (${error.message})` : ''}
            {isUsingMockData && <p className="mt-2 font-medium">Using demo data for now.</p>}
          </AlertDescription>
          <div className="mt-2 flex gap-2">
            <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-2">
              Retry
            </Button>
            {!isUsingMockData && (
              <Button 
                onClick={() => setIsUsingMockData(true)} 
                variant="secondary" 
                size="sm" 
                className="mt-2"
              >
                Use Demo Data
              </Button>
            )}
          </div>
        </Alert>
      ) : isLoading && !isUsingMockData ? (
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

      {isUsingMockData && (
        <Alert className="mt-4 bg-amber-50">
          <AlertTitle className="text-amber-700">Demo Mode Active</AlertTitle>
          <AlertDescription className="text-amber-600">
            You are currently viewing demo data. Changes won't be saved to the database.
            <Button 
              onClick={() => {
                setIsUsingMockData(false);
                refetch();
              }} 
              variant="outline" 
              size="sm" 
              className="ml-2 border-amber-500 text-amber-700"
            >
              Try Real Data
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SellerLimitsSection;
