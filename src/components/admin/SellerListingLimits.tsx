
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Minus } from 'lucide-react';

const SellerListingLimits = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleUpdateLimit = async (increment: boolean) => {
    if (!user || !phoneNumber) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('update_seller_listing_limit', {
        admin_user_id: user.id,
        target_seller_phone: phoneNumber,
        new_limit: increment ? 10 : 5 // Increment to 10 or reset to default 5
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Listing limit ${increment ? 'increased' : 'decreased'} for seller.`,
      });
      
      setPhoneNumber(''); // Reset input after successful update
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
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-2">
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
          onClick={() => handleUpdateLimit(true)}
          disabled={loading || !phoneNumber}
          className="gap-1"
        >
          <Plus className="h-4 w-4" /> Increase
        </Button>
        <Button
          onClick={() => handleUpdateLimit(false)}
          disabled={loading || !phoneNumber}
          variant="destructive"
          className="gap-1"
        >
          <Minus className="h-4 w-4" /> Reset
        </Button>
      </div>
    </div>
  );
};

export default SellerListingLimits;
