
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CategoryFilter, { CategoryType } from '../CategoryFilter';
import { TagsInput } from "../ui/tags-input";

export interface Business {
  id: string;
  name: string;
  category: string;
  description: string;
  area: string;
  city: string;
  address: string;
  website?: string;
  approval_status: string;
  instagram?: string;
  map_link?: string;
  contact_phone?: string;
  whatsapp?: string;
  contact_email?: string;
  tags?: string[];
}

const businessSchema = z.object({
  name: z.string().min(2, {
    message: "Business name must be at least 2 characters.",
  }),
  category: z.string().min(1, {
    message: "Please select a category.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  area: z.string().min(2, {
    message: "Area must be at least 2 characters.",
  }),
  city: z.string().min(2, {
    message: "City must be at least 2 characters.",
  }),
  address: z.string().min(5, {
    message: "Address must be at least 5 characters.",
  }),
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
  contact_email: z.string().email({
    message: "Please enter a valid email address."
  }).optional(),
  website: z.string().url({
    message: "Please enter a valid URL."
  }).optional().or(z.literal('')),
  instagram: z.string().optional(),
  map_link: z.string().optional(),
  tags: z.array(z.string()).min(3, {
    message: "Please add at least 3 tags describing your services or items."
  }).optional(),
});

export type BusinessFormValues = z.infer<typeof businessSchema>;

interface BusinessFormSimpleProps {
  business?: Business;
  onSaved: () => void;
  onCancel?: () => void;
}

const BusinessFormSimple: React.FC<BusinessFormSimpleProps> = ({ business, onSaved, onCancel }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>(business?.category || 'all');

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
      map_link: business?.map_link || "",
      tags: business?.tags || [],
    },
  });

  const handleCategorySelect = (category: CategoryType) => {
    setSelectedCategory(category);
    if (category !== 'all' && category !== 'more') {
      form.setValue('category', category, { shouldValidate: true });
    }
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    let value = e.target.value;
    
    if (!value.startsWith('+91')) {
      value = '+91' + value.replace('+91', '');
    }
    
    const digits = value.slice(3).replace(/\D/g, '');
    const limitedDigits = digits.slice(0, 10);
    
    form.setValue(field as "contact_phone" | "whatsapp", '+91' + limitedDigits, { shouldValidate: true });
  };

  const onSubmit = async (data: BusinessFormValues) => {
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
        map_link: data.map_link || null,
        user_id: user.id,
        approval_status: 'pending',
        tags: data.tags || [],
      };

      let result;
      
      if (business?.id) {
        result = await supabase
          .from('service_providers')
          .update(businessData)
          .eq('id', business.id);
      } else {
        result = await supabase
          .from('service_providers')
          .insert([businessData]);
      }

      if (result.error) throw result.error;

      onSaved();
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6">
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
                <FormControl>
                  <div>
                    <CategoryFilter 
                      selectedCategory={selectedCategory as CategoryType} 
                      onSelectCategory={handleCategorySelect} 
                      allowAddCategories={true}
                      className="mb-2"
                    />
                    <div className="text-xs text-muted-foreground mt-1">
                      {selectedCategory !== 'all' && selectedCategory !== 'more' ? 
                        `Selected: ${selectedCategory}` : 
                        'Please select a specific category'}
                    </div>
                  </div>
                </FormControl>
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

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags* (minimum 3)</FormLabel>
                <FormDescription>
                  Keywords that describe your services or items
                </FormDescription>
                <FormControl>
                  <TagsInput
                    placeholder="Type and press enter"
                    tags={field.value || []}
                    setTags={(newTags) => form.setValue('tags', newTags)}
                  />
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
            name="map_link"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Google Maps Link</FormLabel>
                <FormControl>
                  <Input placeholder="Paste your Google Maps link here" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contact_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number*</FormLabel>
                <FormControl>
                  <Input
                    placeholder="+91 XXXXXXXXXX"
                    value={field.value}
                    onChange={(e) => {
                      field.onChange(e);
                      handlePhoneInput(e, "contact_phone");
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
                    placeholder="+91 XXXXXXXXXX"
                    value={field.value}
                    onChange={(e) => {
                      field.onChange(e);
                      handlePhoneInput(e, "whatsapp");
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
                <FormLabel>Email Address (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="your.email@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://yourwebsite.com" {...field} />
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
                <FormLabel>Instagram (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="@yourusername" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : business?.id ? "Update Business" : "Submit Business"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default BusinessFormSimple;
