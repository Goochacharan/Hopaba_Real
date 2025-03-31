
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export interface BusinessFormValues {
  name: string;
  category: string;
  description: string;
  area: string;
  city: string;
  address: string;
  contact_phone: string;
  whatsapp: string;
  contact_email?: string;
  website?: string;
  instagram?: string;
  price_range_min?: number;
  price_range_max?: number;
  price_unit?: string;
}

export interface Business {
  id?: string;
  name: string;
  category: string;
  description: string;
  area: string;
  city: string;
  address: string;
  contact_phone: string;
  whatsapp: string;
  contact_email?: string;
  website?: string;
  instagram?: string;
  price_range_min?: number;
  price_range_max?: number;
  price_unit?: string;
  approval_status?: string;
}

const businessSchema = z.object({
  name: z.string().min(2, { message: "Business name must be at least 2 characters." }),
  category: z.string().min(1, { message: "Please select a category." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  area: z.string().min(2, { message: "Area must be at least 2 characters." }),
  city: z.string().min(2, { message: "City must be at least 2 characters." }),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),
  contact_phone: z.string()
    .refine(phone => phone.startsWith('+91'), {
      message: "Phone number must start with +91."
    })
    .refine(phone => phone.slice(3).replace(/\D/g, '').length === 10, {
      message: "Please enter a 10-digit phone number (excluding +91)."
    }),
  whatsapp: z.string()
    .refine(phone => phone.startsWith('+91'), {
      message: "WhatsApp number must start with +91."
    })
    .refine(phone => phone.slice(3).replace(/\D/g, '').length === 10, {
      message: "Please enter a 10-digit WhatsApp number (excluding +91)."
    }),
  contact_email: z.string().email({ message: "Please enter a valid email address." }).optional().or(z.literal('')),
  website: z.string().url({ message: "Please enter a valid URL." }).optional().or(z.literal('')),
  instagram: z.string().optional().or(z.literal('')),
  price_range_min: z.number().optional(),
  price_range_max: z.number().optional(),
  price_unit: z.string().optional(),
});

interface BusinessFormProps {
  business?: Business;
  onSaved: () => void;
  onCancel: () => void;
}

const CATEGORIES = [
  "Food & Dining", "Shopping", "Education", "Health & Medical", 
  "Professional Services", "Beauty & Wellness", "Home Services", 
  "Entertainment", "Travel & Transport", "Arts & Crafts", "Other"
];

const PRICE_UNITS = [
  "per hour", "per day", "per session", "per month", "fixed price"
];

const BusinessFormSimple: React.FC<BusinessFormProps> = ({ business, onSaved, onCancel }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const form = useForm<BusinessFormValues>({
    resolver: zodResolver(businessSchema),
    defaultValues: {
      name: business?.name || "",
      category: business?.category || "",
      description: business?.description || "",
      area: business?.area || "",
      city: business?.city || "",
      address: business?.address || "",
      contact_phone: business?.contact_phone || "+91",
      whatsapp: business?.whatsapp || "+91",
      contact_email: business?.contact_email || "",
      website: business?.website || "",
      instagram: business?.instagram || "",
      price_range_min: business?.price_range_min,
      price_range_max: business?.price_range_max,
      price_unit: business?.price_unit || "per hour",
    },
  });

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'contact_phone' | 'whatsapp') => {
    let value = e.target.value;
    
    if (!value.startsWith('+91')) {
      value = '+91' + value.replace('+91', '');
    }
    
    const digits = value.slice(3).replace(/\D/g, '');
    const limitedDigits = digits.slice(0, 10);
    
    form.setValue(fieldName, '+91' + limitedDigits, { shouldValidate: true });
  };

  const handleSubmit = async (data: BusinessFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to list your business.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const priceRangeMin = data.price_range_min ? Number(data.price_range_min) : undefined;
      const priceRangeMax = data.price_range_max ? Number(data.price_range_max) : undefined;
      
      const businessData = {
        name: data.name,
        category: data.category,
        description: data.description,
        area: data.area,
        city: data.city,
        address: data.address,
        contact_phone: data.contact_phone,
        whatsapp: data.whatsapp,
        contact_email: data.contact_email || null,
        website: data.website || null,
        instagram: data.instagram || null,
        user_id: user.id,
        approval_status: 'pending',
        price_unit: data.price_unit || "per hour",
        price_range_min: priceRangeMin,
        price_range_max: priceRangeMax,
      };

      console.log("Submitting business data:", businessData);

      let result;
      
      if (business?.id) {
        console.log("Updating business with ID:", business.id);
        result = await supabase
          .from('service_providers')
          .update(businessData)
          .eq('id', business.id);

        if (result.error) {
          console.error("Supabase update error:", result.error);
          throw new Error(result.error.message);
        }

        toast({
          title: "Business Updated",
          description: "Your business listing has been updated and will be reviewed by an admin.",
        });
      } else {
        console.log("Creating new business");
        result = await supabase
          .from('service_providers')
          .insert([businessData]);

        if (result.error) {
          console.error("Supabase insert error:", result.error);
          throw new Error(result.error.message);
        }

        toast({
          title: "Business Added",
          description: "Your business has been listed and will be reviewed by an admin.",
        });
      }

      setShowSuccessDialog(true);
    } catch (error: any) {
      console.error('Error saving business:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save your business. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Your business name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category*</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                      <Textarea placeholder="Describe your business or service" className="min-h-[120px]" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Location Information</h3>
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your street address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter city" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="area"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Area/Neighborhood*</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter neighborhood or area" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              
              <FormField
                control={form.control}
                name="contact_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number*</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter phone number" 
                        value={field.value} 
                        onChange={(e) => {
                          field.onChange(e);
                          handlePhoneInput(e, 'contact_phone');
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp Number*</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter WhatsApp number" 
                        value={field.value}
                        onChange={(e) => {
                          field.onChange(e);
                          handlePhoneInput(e, 'whatsapp');
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email <span className="text-muted-foreground text-xs">(optional)</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Additional Information</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price_range_min"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Min Price (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="500"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="price_range_max"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Price (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="5000"
                          value={field.value || ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="price_unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Unit</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a price unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PRICE_UNITS.map(unit => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website <span className="text-xs text-muted-foreground">(optional)</span></FormLabel>
                    <FormControl>
                      <Input placeholder="Enter website URL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram <span className="text-xs text-muted-foreground">(optional)</span></FormLabel>
                    <FormControl>
                      <Input placeholder="@yourusername or full URL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : business?.id ? "Update Business" : "Submit Business"}
            </Button>
          </div>
        </form>
      </Form>
      
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Success!</AlertDialogTitle>
            <AlertDialogDescription>
              Your business/service has been successfully {business?.id ? "updated" : "added"}. It will now be available for others to discover after admin approval.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => {
              setShowSuccessDialog(false);
              onSaved();
            }}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default BusinessFormSimple;
