import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
} from "@/components/ui/form";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import BasicInfoSection from './business-form/BasicInfoSection';
import LocationSection from './business-form/LocationSection';
import ContactSection from './business-form/ContactSection';
import SuccessDialog from './business-form/SuccessDialog';

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
  price_unit: z.string().optional(),
  price_range_min: z.number().optional(),
  price_range_max: z.number().optional(),
  availability: z.string().optional(),
  languages: z.array(z.string()).optional(),
  experience: z.string().optional(),
  tags: z.array(z.string())
    .min(3, {
      message: "Please add at least 3 tags describing your services or items."
    })
    .optional(),
});

export type BusinessFormValues = z.infer<typeof businessSchema>;

interface AddBusinessFormProps {
  business?: Business;
  onSaved: () => void;
  onCancel?: () => void;
}

export default function AddBusinessForm({ business, onSaved, onCancel }: AddBusinessFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const normalizedTags = business?.tags && Array.isArray(business.tags) 
    ? business.tags 
    : business?.tags ? [String(business.tags)] : [];

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
      tags: normalizedTags,
    },
    mode: "onSubmit",
  });

  console.log("Form initialized with:", form.getValues());

  const onSubmit = async (data: BusinessFormValues) => {
    console.log("Form submitted with data:", data);
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
      const tagsArray = Array.isArray(data.tags) ? data.tags : 
                       (data.tags ? [String(data.tags)] : []);
      
      const businessData = {
        name: data.name,
        category: data.category,
        description: data.description,
        area: data.area,
        city: data.city,
        address: data.address,
        contact_phone: data.contact_phone,
        whatsapp: data.whatsapp,
        contact_email: data.contact_email,
        website: data.website || null,
        instagram: data.instagram || null,
        map_link: data.map_link || null,
        user_id: user.id,
        approval_status: 'pending',
        price_unit: data.price_unit || "per hour",
        price_range_min: data.price_range_min || 0,
        price_range_max: data.price_range_max || 0,
        availability: data.availability || null,
        languages: data.languages || null,
        experience: data.experience || null,
        tags: tagsArray,
      };

      console.log("Submitting data to Supabase:", businessData);

      if (business?.id) {
        console.log("Updating existing business with ID:", business.id);
        const { data: updatedData, error } = await supabase
          .from('service_providers')
          .update(businessData)
          .eq('id', business.id)
          .select();

        if (error) {
          console.error("Supabase update error:", error);
          throw error;
        }

        console.log("Business successfully updated:", updatedData);
        toast({
          title: "Business Updated",
          description: "Your business listing has been updated and will be reviewed by an admin.",
        });
      } else {
        console.log("Creating new business");
        const { data: insertedData, error } = await supabase
          .from('service_providers')
          .insert(businessData)
          .select();

        if (error) {
          console.error("Supabase insert error:", error);
          throw error;
        }

        console.log("Business successfully added:", insertedData);
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
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <BasicInfoSection />
            <LocationSection />
            <ContactSection />
          </div>

          <div className="flex justify-end gap-4 mt-8">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : business?.id ? "Update Business" : "Add Business"}
            </Button>
          </div>
        </form>
        
        <SuccessDialog 
          open={showSuccessDialog} 
          onOpenChange={setShowSuccessDialog}
          onContinue={onSaved}
        />
      </Form>
    </FormProvider>
  );
}
