
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Minus } from 'lucide-react';

interface SellerDetails {
  seller_name: string;
  listing_limit: number;
}

const SellerListingLimits = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [sellerDetails, setSellerDetails] = useState<SellerDetails | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const searchSeller = async () => {
    if (!phoneNumber) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('sellers')
        .select('seller_name, listing_limit')
        .eq('seller_phone', phoneNumber)
        .single();

      if (error) throw error;
      
      setSellerDetails(data);
    } catch (err: any) {
      console.error('Error fetching seller:', err);
      toast({
        title: "Error",
        description: "Seller not found with this phone number.",
        variant: "destructive",
      });
      setSellerDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLimit = async (increment: boolean) => {
    if (!user || !phoneNumber) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('update_seller_listing_limit', {
        admin_user_id: user.id,
        target_seller_phone: phoneNumber,
        new_limit: increment ? 10 : 5
      });

      if (error) throw error;

      // Update local state to show new limit
      if (sellerDetails) {
        setSellerDetails({
          ...sellerDetails,
          listing_limit: increment ? 10 : 5
        });
      }

      toast({
        title: "Success",
        description: `Listing limit ${increment ? 'increased' : 'reset'} for seller.`,
      });
    } catch (err: any) {
      console.error('Error updating listing limit:', err);
      toast({
        title: "Error",
        description: "Failed to update listing limit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <h3 className="text-lg font-medium">Update Seller Listing Limit</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-2">
        <div className="flex items-center">
          <span className="mr-2 text-muted-foreground">+91</span>
          <Input
            type="text"
            placeholder="Enter seller phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="flex-1"
          />
        </div>
        <Button
          onClick={searchSeller}
          disabled={loading || !phoneNumber}
          variant="secondary"
          className="gap-1"
        >
          <Search className="h-4 w-4" /> Search
        </Button>
      </div>

      {sellerDetails && (
        <div className="space-y-4 p-4 border rounded-md bg-muted/50">
          <div className="space-y-2">
            <p className="text-sm font-medium">Seller Name: {sellerDetails.seller_name}</p>
            <p className="text-sm font-medium">Current Listing Limit: {sellerDetails.listing_limit}</p>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => handleUpdateLimit(true)}
              disabled={loading || sellerDetails.listing_limit >= 10}
              className="gap-1"
            >
              <Plus className="h-4 w-4" /> Increase to 10
            </Button>
            <Button
              onClick={() => handleUpdateLimit(false)}
              disabled={loading || sellerDetails.listing_limit === 5}
              variant="destructive"
              className="gap-1"
            >
              <Minus className="h-4 w-4" /> Reset to 5
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerListingLimits;
