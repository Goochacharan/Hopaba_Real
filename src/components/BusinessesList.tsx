
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { EmptyState } from './EmptyState';
import { useToast } from '@/hooks/use-toast';
import { Dialog } from '@/components/ui/dialog';
import ConfirmDialog from './ConfirmDialog';

interface Business {
  id: string;
  name: string;
  description: string;
  category: string;
  address: string;
  created_at: string;
  // Add other fields as needed
}

export default function BusinessesList() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [businessToDelete, setBusinessToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchBusinesses();
  }, []);

  async function fetchBusinesses() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      // Ensure data is an array before setting it
      if (Array.isArray(data)) {
        setBusinesses(data as Business[]);
      } else {
        console.error('Fetched data is not an array:', data);
        setBusinesses([]);
      }
    } catch (error) {
      console.error('Error fetching businesses:', error);
      toast({
        title: "Error fetching your listings",
        description: "There was a problem loading your business listings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteBusiness() {
    if (!businessToDelete) return;
    
    try {
      const { error } = await supabase
        .from('service_providers')
        .delete()
        .eq('id', businessToDelete);

      if (error) {
        throw error;
      }

      setBusinesses(businesses.filter(business => business.id !== businessToDelete));
      toast({
        title: "Business deleted",
        description: "Your business listing has been removed successfully.",
      });
    } catch (error) {
      console.error('Error deleting business:', error);
      toast({
        title: "Error deleting business",
        description: "There was a problem deleting your business listing.",
        variant: "destructive",
      });
    } finally {
      setBusinessToDelete(null);
      setOpenDeleteDialog(false);
    }
  }

  const confirmDelete = (id: string) => {
    setBusinessToDelete(id);
    setOpenDeleteDialog(true);
  };

  // These variables type check the data
  const businessesList = Array.isArray(businesses) ? businesses : [];
  const hasBusiness = businessesList.length > 0;

  return (
    <>
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Listings</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : hasBusiness ? (
            <div className="grid gap-4 md:grid-cols-2">
              {businessesList.map((business) => (
                <Card key={business.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{business.name}</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      {new Date(business.created_at).toLocaleDateString()}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                      {business.description || 'No description provided'}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground mb-4">
                      <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full mr-2">
                        {business.category}
                      </span>
                      {business.address}
                    </div>
                    <div className="flex justify-between">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => confirmDelete(business.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState 
              title="No businesses yet"
              description="You haven't created any business listings yet."
              action={{
                label: "Add Business",
                href: "/profile?add-business=true",
              }}
            />
          )}
        </TabsContent>
        
        <TabsContent value="active">
          <EmptyState 
            title="No active businesses"
            description="You don't have any active business listings."
            action={{
              label: "Add Business",
              href: "/profile?add-business=true",
            }}
          />
        </TabsContent>
        
        <TabsContent value="pending">
          <EmptyState 
            title="No pending businesses"
            description="You don't have any pending business listings."
            action={{
              label: "Add Business",
              href: "/profile?add-business=true",
            }}
          />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        title="Delete Business"
        description="Are you sure you want to delete this business? This action cannot be undone."
        onConfirm={handleDeleteBusiness}
        onCancel={() => setOpenDeleteDialog(false)}
      />
    </>
  );
}
