
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import BusinessCard from './BusinessCard';
import DeleteConfirmDialog from './DeleteConfirmDialog';

interface BusinessesListProps {
  onEdit: (business: any) => void;
  refresh: boolean;
}

const BusinessesList = ({ onEdit, refresh }: BusinessesListProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [businesses, setBusinesses] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [businessToDelete, setBusinessToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const fetchBusinesses = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      console.log("Fetching businesses for user:", user.id);
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching businesses:', error);
        throw error;
      }
      
      console.log("Fetched businesses:", data);
      setBusinesses(data || []);
    } catch (error: any) {
      console.error('Error fetching businesses:', error);
      toast({
        title: 'Error',
        description: 'Unable to load your businesses. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBusinesses();
    }
  }, [user, refresh]);

  const handleDelete = async (id: string) => {
    try {
      console.log("Deleting business with ID:", id);
      const { error } = await supabase
        .from('service_providers')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);
      
      if (error) {
        console.error('Error deleting business:', error);
        throw error;
      }
      
      setBusinesses(businesses.filter(business => business.id !== id));
      toast({
        title: 'Success',
        description: 'Business listing deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting business:', error);
      toast({
        title: 'Error',
        description: 'There was a problem deleting your business listing.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
    }
  };

  const confirmDelete = (id: string) => {
    setBusinessToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  if (loading) {
    return <div className="text-center py-8">Loading your businesses...</div>;
  }

  if (businesses.length === 0) {
    return (
      <div className="text-center py-8 space-y-4">
        <p className="text-muted-foreground">You haven't added any businesses or services yet.</p>
        <p>Use the form above to add your first business or service!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-medium">Your Businesses and Services</h3>
      <div className="grid grid-cols-1 gap-6">
        {businesses.map((business) => (
          <BusinessCard 
            key={business.id}
            business={business}
            onEdit={onEdit}
            onDelete={confirmDelete}
          />
        ))}
      </div>

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={() => businessToDelete && handleDelete(businessToDelete)}
        title="Delete Business"
        description="This will permanently delete your business listing. This action cannot be undone."
      />
    </div>
  );
};

export default BusinessesList;
