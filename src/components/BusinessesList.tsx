import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { 
  Pencil, 
  Trash2, 
  DollarSign, 
  Clock, 
  MapPin, 
  Phone, 
  Instagram, 
  Car,
  Store,
  Fuel,
  Gauge
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { formatIndianRupees } from '@/components/ui/input';
import { BusinessFormValues } from './AddBusinessForm';

interface BusinessesListProps {
  onEdit: (business: BusinessFormValues & { id: string }) => void;
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
      const { data, error } = await supabase
        .from('service_providers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
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
    fetchBusinesses();
  }, [user, refresh]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('service_providers')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);
      
      if (error) {
        throw error;
      }
      
      setBusinesses(businesses.filter(business => business.id !== id));
      toast({
        title: 'Success',
        description: 'Listing deleted successfully',
      });
    } catch (error: any) {
      console.error('Error deleting business:', error);
      toast({
        title: 'Error',
        description: 'There was a problem deleting your listing.',
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
    return <div className="text-center py-8">Loading your listings...</div>;
  }

  if (businesses.length === 0) {
    return (
      <div className="text-center py-8 space-y-4">
        <p className="text-muted-foreground">You haven't added any listings yet.</p>
        <p>Use the form above to add your first listing!</p>
      </div>
    );
  }

  const shopGroups = businesses.reduce((groups, business) => {
    if (business.category === 'Cars' && business.shop_name) {
      if (!groups[business.shop_name]) {
        groups[business.shop_name] = [];
      }
      groups[business.shop_name].push(business);
    } else {
      if (!groups['Other']) {
        groups['Other'] = [];
      }
      groups['Other'].push(business);
    }
    return groups;
  }, {} as Record<string, any[]>);

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-medium">Your Listings</h3>
      
      {Object.entries(shopGroups).map(([shopName, shopBusinesses]) => (
        shopName !== 'Other' && (
          <div key={shopName} className="space-y-4">
            <div className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              <h4 className="text-lg font-medium">{shopName}</h4>
              <Badge variant="outline">{shopBusinesses.length} {shopBusinesses.length === 1 ? 'listing' : 'listings'}</Badge>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {shopBusinesses.map((business) => (
                <Card key={business.id} className="overflow-hidden">
                  <CardHeader className="bg-muted/30">
                    <CardTitle className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span>{business.name}</span>
                        {business.shop_name && (
                          <span className="text-sm text-muted-foreground">
                            at {business.shop_name}
                          </span>
                        )}
                      </div>
                      <span className="text-sm font-normal text-muted-foreground px-2 py-1 bg-muted rounded-md">
                        {business.category}
                      </span>
                    </CardTitle>
                    <CardDescription className="line-clamp-2">{business.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-3">
                    {business.category === 'Cars' && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="flex items-center gap-2">
                            <Car className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {business.vehicle_year} {business.vehicle_make} {business.vehicle_model}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Fuel className="h-4 w-4 text-muted-foreground" />
                            <span className="capitalize">{business.vehicle_fuel}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Gauge className="h-4 w-4 text-muted-foreground" />
                            <span>{business.vehicle_kms} km</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {business.price_range_min ? formatIndianRupees(business.price_range_min.toString()) : '₹0'}
                          </span>
                        </div>
                      </>
                    )}
                    
                    {business.category !== 'Cars' && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>
                            ${business.price_range_min} - ${business.price_range_max} {business.price_unit}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{business.availability}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span>{business.area}, {business.city}</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{business.area}, {business.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{business.contact_phone}</span>
                    </div>
                    {business.instagram && (
                      <div className="flex items-center gap-2">
                        <Instagram className="h-4 w-4 text-muted-foreground" />
                        <span>{business.instagram}</span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="border-t bg-muted/10 gap-2 justify-end">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onEdit(business)}
                      className="flex items-center gap-1"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => confirmDelete(business.id)}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        )
      ))}
      
      {shopGroups['Other'] && shopGroups['Other'].length > 0 && (
        <div className="grid grid-cols-1 gap-6">
          <h4 className="text-lg font-medium">Other Listings</h4>
          {shopGroups['Other'].map((business) => (
            <Card key={business.id} className="overflow-hidden">
              <CardHeader className="bg-muted/30">
                <CardTitle className="flex justify-between items-start">
                  <span>{business.name}</span>
                  <span className="text-sm font-normal text-muted-foreground px-2 py-1 bg-muted rounded-md">
                    {business.category}
                  </span>
                </CardTitle>
                <CardDescription className="line-clamp-2">{business.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>
                      ${business.price_range_min} - ${business.price_range_max} {business.price_unit}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{business.availability}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{business.area}, {business.city}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{business.contact_phone}</span>
                </div>
                {business.instagram && (
                  <div className="flex items-center gap-2">
                    <Instagram className="h-4 w-4 text-muted-foreground" />
                    <span>{business.instagram}</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t bg-muted/10 gap-2 justify-end">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => onEdit(business)}
                  className="flex items-center gap-1"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => confirmDelete(business.id)}
                  className="flex items-center gap-1"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your listing. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => businessToDelete && handleDelete(businessToDelete)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BusinessesList;
