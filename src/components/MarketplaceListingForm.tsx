import React, { useState, useEffect } from 'react';
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
import { Loader2, Save, X, Instagram, Film, MapPin, Link2, Unlock, AlertTriangle, FileText, Map } from 'lucide-react';
import { MarketplaceListing } from '@/hooks/useMarketplaceListings';
import { ImageUpload } from '@/components/ui/image-upload';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { extractCoordinatesFromMapLink } from '@/lib/locationUtils';

const marketplaceListingSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  description: z.string().min(20, { message: "Description must be at least 20 characters" }),
  price: z.coerce.number().min(1, { message: "Price must be greater than 0" }),
  category: z.string().min(1, { message: "Category is required" }),
  condition: z.string().min(1, { message: "Condition is required" }),
  model_year: z.string().optional(),
  location: z.string().optional(),
  map_link: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  postal_code: z.string().optional(),
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
  is_negotiable: z.boolean().optional(),
  damage_images: z.array(z.string()).optional(),
  inspection_certificates: z.array(z.string()).optional(),
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
    model_year: listing?.model_year || '',
    location: listing?.location || '',
    map_link: listing?.map_link || '',
    latitude: listing?.latitude || '',
    longitude: listing?.longitude || '',
    postal_code: listing?.postal_code || '',
    seller_name: listing?.seller_name || user?.user_metadata?.full_name || '',
    seller_phone: listing?.seller_phone || '+91',
    seller_whatsapp: listing?.seller_whatsapp || '+91',
    seller_instagram: listing?.seller_instagram || '',
    images: listing?.images || [],
    is_negotiable: listing?.is_negotiable || false,
    damage_images: listing?.damage_images || [],
    inspection_certificates: listing?.inspection_certificates || [],
  };

  const form = useForm<MarketplaceListingFormData>({
    resolver: zodResolver(marketplaceListingSchema),
    defaultValues,
    mode: "onBlur",
  });

  useEffect(() => {
    const mapLink = form.watch('map_link');
    if (mapLink) {
      const coords = extractCoordinatesFromMapLink(mapLink);
      if (coords) {
        form.setValue('latitude', coords.lat.toString());
        form.setValue('longitude', coords.lng.toString());
      }
    }
  }, [form.watch('map_link')]);

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'seller_phone' | 'seller_whatsapp') => {
    let value = e.target.value;
    
    if (!value.startsWith('+91')) {
      value = '+91' + value.replace('+91', '');
    }
    
    const digits = value.slice(3).replace(/\D/g, '');
    
    const limitedDigits = digits.slice(0, 10);
    
    e.target.value = '+91' + limitedDigits;
    
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
      const categoryValue = data.category.toLowerCase().trim();
      console.log("Submitting listing with category:", categoryValue);

      const listingData = {
        title: data.title,
        description: data.description,
        price: data.price,
        category: categoryValue,
        condition: data.condition,
        model_year: data.model_year || null,
        location: data.location || "Not specified",
        map_link: data.map_link || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        postal_code: data.postal_code || null,
        seller_name: data.seller_name || "Anonymous Seller",
        seller_id: user.id,
        seller_phone: data.seller_phone || null,
        seller_whatsapp: data.seller_whatsapp || null,
        seller_instagram: data.seller_instagram || null,
        images: data.images,
        damage_images: data.damage_images || [],
        inspection_certificates: data.inspection_certificates || [],
        approval_status: 'pending',
        is_negotiable: data.is_negotiable || false
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
          description: "Your marketplace listing has been updated and will be reviewed by an admin.",
        });
      } else {
        const { error } = await supabase
          .from('marketplace_listings')
          .insert(listingData);

        if (error) throw error;
        
        toast({
          title: "Listing created",
          description: "Your marketplace listing has been created and will be reviewed by an admin.",
        });
      }

      onSaved();
    } catch (err) {
      console.error('Error saving marketplace listing:', err);
      toast({
        title: "Error",
        description: err.message || "Failed to save listing. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    for (let year = currentYear; year >= 1950; year--) {
      years.push(year.toString());
    }
    
    return years;
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
                  name="is_negotiable"
                  render={({ field }) => (
                    <FormItem className="flex flex-col mt-8">
                      <div className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox 
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="flex items-center space-x-2">
                          <Unlock className="h-4 w-4 text-green-500" />
                          <FormLabel className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Negotiable Price
                          </FormLabel>
                        </div>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Location (Optional)
                        </div>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g. Mumbai, Delhi" 
                          value={field.value}
                          onChange={(e) => form.setValue('location', e.target.value)}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the location or area where the item is available
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="model_year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model Year (Optional)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="not_applicable">Not Applicable</SelectItem>
                          {generateYearOptions().map(year => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="map_link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div className="flex items-center gap-2">
                        <Link2 className="h-4 w-4" />
                        Google Maps Link (Optional)
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Paste your Google Maps link here" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Add a Google Maps link for more precise directions
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <h4 className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Map className="h-4 w-4 text-muted-foreground" />
                  Geographic Coordinates
                </h4>
                <FormDescription className="mb-2">
                  These coordinates help display your listing accurately on the map. They'll be automatically filled if you provide a Google Maps link.
                </FormDescription>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 12.9716" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitude</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 77.5946" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="postal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postal/ZIP Code (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter postal code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                        defaultValue="+91"
                        onInput={(e) => handlePhoneInput(e as React.ChangeEvent<HTMLInputElement>, 'seller_phone')}
                        {...field}
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
                          defaultValue="+91"
                          onInput={(e) => handlePhoneInput(e as React.ChangeEvent<HTMLInputElement>, 'seller_whatsapp')}
                          {...field}
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
                    maxImages={10}
                  />
                </FormControl>
                <FormDescription>
                  Upload up to 10 images of your item. At least one image is required.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Separator className="my-6" />
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h3 className="font-medium text-lg">Damage & Scratch Images</h3>
            </div>
            <p className="text-muted-foreground">
              For transparency, upload clear images of any damage, scratches, or defects your item may have.
              This helps build trust with potential buyers.
            </p>
            
            <FormField
              control={form.control}
              name="damage_images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Damage/Scratch Images (Optional)</FormLabel>
                  <FormControl>
                    <ImageUpload 
                      images={field.value || []}
                      onImagesChange={(images) => form.setValue('damage_images', images)}
                      maxImages={10}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload up to 10 images showing any damage or scratches on your item.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Separator className="my-6" />
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              <h3 className="font-medium text-lg">Inspection Certificates</h3>
            </div>
            <p className="text-muted-foreground">
              Please upload third-party inspection reports or certificates if you have them.
              This helps establish the credibility of your listing.
            </p>
            
            <FormField
              control={form.control}
              name="inspection_certificates"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Inspection Reports (Optional)</FormLabel>
                  <FormControl>
                    <ImageUpload 
                      images={field.value || []}
                      onImagesChange={(images) => form.setValue('inspection_certificates', images)}
                      maxImages={5}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload up to 5 inspection certificates or reports (images or PDFs).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
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
