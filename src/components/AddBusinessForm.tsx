
import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import BasicInfoSection from './business-form/BasicInfoSection';
import LocationSection from './business-form/LocationSection';
import ContactSection from './business-form/ContactSection';

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

// Extend the business schema to include all the fields from the detailed form sections
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
      // Remove the contact_number field from the data since it's not in the database schema
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
        website: data.website,
        instagram: data.instagram,
        map_link: data.map_link,
        user_id: user.id,
        approval_status: 'pending', // Always set approval_status to pending when creating or updating
        price_unit: data.price_unit || "per hour",
        price_range_min: data.price_range_min,
        price_range_max: data.price_range_max,
        availability: data.availability,
        languages: data.languages,
        experience: data.experience,
        tags: data.tags,
      };

      if (business?.id) {
        // Update existing business
        const { error } = await supabase
          .from('service_providers')
          .update(businessData)
          .eq('id', business.id);

        if (error) throw error;

        toast({
          title: "Business Updated",
          description: "Your business listing has been updated and will be reviewed by an admin.",
        });
      } else {
        // Create new business
        const { error } = await supabase
          .from('service_providers')
          .insert(businessData);

        if (error) throw error;

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
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Basic Information Section */}
            <BasicInfoSection />
            
            {/* Location Section */}
            <LocationSection />
            
            {/* Contact Section */}
            <ContactSection />
          </div>

          <div className="flex justify-end gap-4 mt-8">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </form>
        <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Business Listed!</AlertDialogTitle>
              <AlertDialogDescription>
                Your business listing has been submitted and is awaiting admin approval.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={onSaved}>
                OK
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Form>
    </FormProvider>
  );
}
