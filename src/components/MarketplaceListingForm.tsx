
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
import { ImageUpload } from '@/components/ui/image-upload';

const marketplaceListingSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  description: z.string().min(20, { message: "Description must be at least 20 characters" }),
  price: z.coerce.number().min(1, { message: "Price must be greater than 0" }),
  category: z.string().min(1, { message: "Category is required" }),
  condition: z.string().min(1, { message: "Condition is required" }),
  location: z.string().optional(), // Changed to optional
  seller_name: z.string().min(2, { message: "Seller name is required" }),
  seller_phone: z.string()
    .refine(phone => phone.startsWith('+91'), {
      message: "Phone number must start with +91."
    })
    .refine(phone => phone.slice(3).replace(/\D/g, '').length === 10, {
      message: "Please enter a 10-digit phone number (excluding +91)."
    })
    .optional(),
  seller_whatsapp: z.string()
    .refine(phone => !phone || phone.startsWith('+91'), {
      message: "WhatsApp number must start with +91."
    })
    .refine(phone => !phone || phone.slice(3).replace(/\D/g, '').length === 10, {
      message: "Please enter a 10-digit WhatsApp number (excluding +91)."
    })
    .optional(),
  seller_instagram: z.string().optional(),
  images: z.array(z.string()).min(1, { message: "Please upload at least one image" }),
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
    seller_name: listing?.seller_name || user?.user_metadata?.full_name || '',
    seller_phone: listing?.seller_phone || '+91',
    seller_whatsapp: listing?.seller_whatsapp || '+91',
    seller_instagram: listing?.seller_instagram || '',
    images: listing?.images || [],
  };

  const form = useForm<MarketplaceListingFormData>({
    resolver: zodResolver(marketplaceListingSchema),
    defaultValues,
    mode: "onBlur",
  });

  // Function to handle phone number input validation
  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'seller_phone' | 'seller_whatsapp') => {
    let value = e.target.value;
    
    // Ensure the value starts with +91
    if (!value.startsWith('+91')) {
      value = '+91' + value.replace('+91', '');
    }
    
    // Remove all non-digit characters except the +91 prefix
    const digits = value.slice(3).replace(/\D/g, '');
    
    // Limit to 10 digits
    const limitedDigits = digits.slice(0, 10);
    
    // Set the value with +91 prefix and limited digits
    e.target.value = '+91' + limitedDigits;
    
    // Update the form value
    form.setValue(fieldName, e.target.value, {
      shouldValidate: true,
    });
  };

  const handleLocationChange = (value: string, onChange: (value: string) => void) => {
    if (value.includes('google.com/maps') || value.includes('goo.gl/maps')) {
      onChange(value);
    } else {
      onChange(value);
    }
  };

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
      const listingData = {
        title: data.title,
        description: data.description,
        price: data.price,
        category: data.category,
        condition: data.condition,
        location: data.location || "Not specified", // Provide default value if not provided
        seller_name: data.seller_name || "Anonymous Seller",
        seller_id: user.id,
        seller_phone: data.seller_phone || null,
        seller_whatsapp: data.seller_whatsapp || null,
        seller_instagram: data.seller_instagram || null,
        images: data.images
      };

      if (listing?.id) {
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
                      <FormLabel>Location (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. Mumbai, Delhi or Google Maps link" 
                          value={field.value}
                          onChange={(e) => handleLocationChange(e.target.value, field.onChange)}
                        />
                      </FormControl>
                      <FormDescription>
                        You can paste a Google Maps link directly
                      </FormDescription>
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
                name="seller_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name (will be displayed with listing)" {...field} />
                    </FormControl>
                    <FormDescription>
                      This name will be visible to potential buyers
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="seller_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter phone number" 
                        value={field.value || "+91"}
                        onChange={(e) => {
                          field.onChange(e);
                          handlePhoneInput(e as React.ChangeEvent<HTMLInputElement>, 'seller_phone');
                        }}
                      />
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
                        <Input 
                          placeholder="Enter WhatsApp number" 
                          value={field.value || "+91"}
                          onChange={(e) => {
                            field.onChange(e);
                            handlePhoneInput(e as React.ChangeEvent<HTMLInputElement>, 'seller_whatsapp');
                          }}
                        />
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
                      <FormLabel>
                        <div className="flex items-center gap-2">
                          <Instagram className="h-4 w-4" />
                          Instagram / Video Content
                          <Film className="h-4 w-4 ml-1 text-purple-500" />
                        </div>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="@yourusername or full URL" 
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Add your Instagram username or video content URL
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          <FormField
            control={form.control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Images*</FormLabel>
                <FormControl>
                  <ImageUpload 
                    images={field.value}
                    onImagesChange={(images) => form.setValue('images', images, { shouldValidate: true })}
                    maxImages={5}
                  />
                </FormControl>
                <FormDescription>
                  Upload up to 5 images of your item. At least one image is required.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

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
