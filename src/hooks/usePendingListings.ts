
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MarketplaceListing } from '@/hooks/useMarketplaceListings';
import { useAdmin } from '@/hooks/useAdmin';

export interface ServiceProvider {
  id: string;
  name: string;
  category: string;
  approval_status: string;
  created_at: string;
  description: string | null;
  area: string;
  city: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  approval_status: string;
  created_at: string;
  description: string;
}

export interface PendingListings {
  marketplace: MarketplaceListing[];
  services: ServiceProvider[];
  events: Event[];
}

export const usePendingListings = () => {
  const [pendingListings, setPendingListings] = useState<PendingListings>({
    marketplace: [],
    services: [],
    events: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAdmin } = useAdmin();
  const { toast } = useToast();

  const fetchPendingListings = async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch pending marketplace listings
      const { data: marketplaceData, error: marketplaceError } = await supabase
        .from('marketplace_listings')
        .select('*')
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false });

      if (marketplaceError) throw marketplaceError;

      // Fetch pending service providers
      const { data: servicesData, error: servicesError } = await supabase
        .from('service_providers')
        .select('id, name, category, approval_status, created_at, description, area, city')
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false });

      if (servicesError) throw servicesError;

      // Fetch pending events
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('id, title, date, location, approval_status, created_at, description')
        .eq('approval_status', 'pending')
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;

      setPendingListings({
        marketplace: marketplaceData || [],
        services: servicesData || [],
        events: eventsData || []
      });
    } catch (err: any) {
      console.error('Error fetching pending listings:', err);
      setError('Failed to fetch pending listings. Please try again later.');
      toast({
        title: "Error",
        description: "Failed to fetch pending listings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateApprovalStatus = async (
    listingType: 'marketplace' | 'services' | 'events',
    listingId: string,
    status: 'approved' | 'rejected'
  ) => {
    if (!isAdmin) {
      toast({
        title: "Error",
        description: "Only admins can update approval status.",
        variant: "destructive",
      });
      return;
    }

    try {
      let tableName = '';
      
      // Map listingType to the actual table name
      if (listingType === 'marketplace') {
        const { error } = await supabase
          .from('marketplace_listings')
          .update({ approval_status: status })
          .eq('id', listingId);
        
        if (error) throw error;
      } else if (listingType === 'services') {
        const { error } = await supabase
          .from('service_providers')
          .update({ approval_status: status })
          .eq('id', listingId);
        
        if (error) throw error;
      } else if (listingType === 'events') {
        const { error } = await supabase
          .from('events')
          .update({ approval_status: status })
          .eq('id', listingId);
        
        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Listing ${status === 'approved' ? 'approved' : 'rejected'} successfully.`
      });

      // Refresh the listings
      fetchPendingListings();
    } catch (err: any) {
      console.error(`Error updating ${listingType} approval status:`, err);
      toast({
        title: "Error",
        description: `Failed to update approval status. ${err.message}`,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchPendingListings();
    }
  }, [isAdmin]);

  return { 
    pendingListings, 
    loading, 
    error,
    updateApprovalStatus,
    refreshListings: fetchPendingListings
  };
};
