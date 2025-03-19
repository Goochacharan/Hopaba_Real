
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { AlertCircle, Pencil, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import ConfirmDialog from './ConfirmDialog';

interface BusinessesListProps {
  userId?: string;
}

const BusinessesList: React.FC<BusinessesListProps> = ({ userId }) => {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [businessToDelete, setBusinessToDelete] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { toast } = useToast();

  const fetchBusinesses = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      setBusinesses(data || []);
    } catch (err: any) {
      console.error('Error fetching businesses:', err);
      setError(err.message || 'Failed to fetch your businesses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, [userId]);

  const handleDelete = (id: string) => {
    setBusinessToDelete(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!businessToDelete) return;
    
    try {
      const { error } = await supabase
        .from('service_providers')
        .delete()
        .eq('id', businessToDelete);

      if (error) throw error;
      
      setBusinesses(businesses.filter(b => b.id !== businessToDelete));
      toast({
        title: "Business deleted",
        description: "The business has been successfully removed",
      });
    } catch (err: any) {
      console.error('Error deleting business:', err);
      toast({
        title: "Delete failed",
        description: err.message || "Could not delete the business",
        variant: "destructive",
      });
    } finally {
      setBusinessToDelete(null);
      setConfirmOpen(false);
    }
  };

  const handleEdit = (business: any) => {
    // Implementation for editing would go here
    toast({
      title: "Edit not implemented",
      description: "Business editing functionality is coming soon",
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 w-1/3 bg-muted rounded"></div>
              <div className="h-4 w-1/2 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 w-full bg-muted rounded mb-2"></div>
              <div className="h-4 w-3/4 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium mb-2">You haven't added any businesses yet</h3>
        <p className="text-muted-foreground mb-4">
          Start managing your business listings to grow your customer base
        </p>
        <Button variant="default" onClick={() => window.location.href = "/add-business"}>
          Add Your First Business
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {businesses.map((business) => (
        <Card key={business.id}>
          <CardHeader>
            <CardTitle>{business.name}</CardTitle>
            <CardDescription>
              <Badge variant="outline">{business.category}</Badge>
              {business.city && (
                <span className="ml-2 text-muted-foreground">{business.city}</span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{business.description}</p>
            {business.tags && business.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {business.tags.map((tag: string, i: number) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleEdit(business)}
            >
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => handleDelete(business.id)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </CardFooter>
        </Card>
      ))}

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Business"
        description="Are you sure you want to delete this business? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default BusinessesList;
