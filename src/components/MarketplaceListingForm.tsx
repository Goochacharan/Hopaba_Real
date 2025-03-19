
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card } from '@/components/ui/card';
import { Loader2, Save, X } from 'lucide-react';
import { MarketplaceListing } from '@/hooks/useMarketplaceListings';

const marketplaceListingSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  description: z.string().min(20, { message: "Description must be at least 20 characters" }),
  price: z.coerce.number().min(1, { message: "Price must be greater than 0" }),
  category: z.string().min(1, { message: "Category is required" }),
  condition: z.string().min(1, { message: "Condition is required" }),
  location: z.string().min(1, { message: "Location is required" }),
  seller_phone: z.string().optional(),
  seller_whatsapp: z.string().optional(),
  seller_instagram: z.string().optional(),
  images: z.array(z.string()).optional(),
});

type MarketplaceListingFormData = z.infer<typeof marketplaceListingSchema>;

interface MarketplaceListingFormProps {
  listing?: MarketplaceListing;
  onSaved: () => void;
  onCancel?: () => void;
}

const MarketplaceListingForm: React.FC<MarketplaceListingFormProps> = ({ 
  listing, 
  onSaved,
  onCancel
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const defaultValues: Partial<MarketplaceListingFormData> = {
    title: listing?.title || '',
    description: listing?.description || '',
    price: listing?.price || 0,
    category: listing?.category || '',
    condition: listing?.condition || '',
    location: listing?.location || '',
    seller_phone: listing?.seller_phone || '',
    seller_whatsapp: listing?.seller_whatsapp || '',
    seller_instagram: listing?.seller_instagram || '',
    images: listing?.images || [],
  };

  const form = useForm<MarketplaceListingFormData>({
    resolver: zodResolver(marketplaceListingSchema),
    defaultValues,
    mode: "onBlur",
  });

  const onSubmit = async (data: MarketplaceListingFormData) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create or edit listings.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Ensure all required fields are present with their correct types
      const listingData = {
        title: data.title,
        description: data.description,
        price: data.price,
        category: data.category,
        condition: data.condition,
        location: data.location,
        seller_name: user.user_metadata?.full_name || "Anonymous Seller",
        seller_id: user.id,
        seller_phone: data.seller_phone || null,
        seller_whatsapp: data.seller_whatsapp || null,
        seller_instagram: data.seller_instagram || null,
        images: data.images || []
      };

      if (listing?.id) {
        // Update existing listing
        const { error } = await supabase
          .from('marketplace_listings')
          .update(listingData)
          .eq('id', listing.id)
          .eq('seller_id', user.id);

        if (error) throw error;
        
        toast({
          title: "Listing updated",
          description: "Your marketplace listing has been updated successfully.",
        });
      } else {
        // Create new listing
        const { error } = await supabase
          .from('marketplace_listings')
          .insert(listingData);

        if (error) throw error;
        
        toast({
          title: "Listing created",
          description: "Your marketplace listing has been created successfully.",
        });
      }

      onSaved();
    } catch (error: any) {
      console.error('Error saving marketplace listing:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title*</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. iPhone 13 Pro Max, 256GB" {...field} />
                    </FormControl>
                    <FormDescription>
                      A clear, concise title for your listing
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description*</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your item, include details like brand, model, age, etc." 
                        className="min-h-[120px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (₹)*</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location*</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Mumbai, Delhi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category*</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="all">All Categories</SelectItem>
                          <SelectItem value="cars">Cars</SelectItem>
                          <SelectItem value="bikes">Bikes</SelectItem>
                          <SelectItem value="mobiles">Mobiles</SelectItem>
                          <SelectItem value="electronics">Electronics</SelectItem>
                          <SelectItem value="furniture">Furniture</SelectItem>
                          <SelectItem value="home_appliances">Home Appliances</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition*</FormLabel>
                      <Select 
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="like new">Like New</SelectItem>
                          <SelectItem value="good">Good</SelectItem>
                          <SelectItem value="fair">Fair</SelectItem>
                          <SelectItem value="poor">Poor</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="seller_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. +91 98765 43210" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your contact number for buyers
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="seller_whatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. +91 98765 43210" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="seller_instagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Your Instagram handle" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> {listing ? 'Update Listing' : 'Create Listing'}
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
};

export default MarketplaceListingForm;
