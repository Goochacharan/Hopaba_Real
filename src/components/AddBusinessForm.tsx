
import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';

import BasicInfoSection from './business-form/BasicInfoSection';
import LocationSection from './business-form/LocationSection';
import ContactSection from './business-form/ContactSection';
import SuccessDialog from './business-form/SuccessDialog';

const businessFormSchema = z.object({
  name: z.string().min(2, {
    message: "Business name must be at least 2 characters.",
  }),
  category: z.string().min(1, {
    message: "Please select a category.",
  }),
  price_range_min: z.coerce.number().min(0, {
    message: "Price must be a positive number.",
  }),
  price_range_max: z.coerce.number().min(0, {
    message: "Price must be a positive number.",
  }),
  price_unit: z.string().optional(),
  availability: z.string().min(2, {
    message: "Please specify availability (e.g., Mon-Fri 9AM-5PM)",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }).max(500, {
    message: "Description must not exceed 500 characters."
  }),
  experience: z.string().optional(),
  address: z.string().min(5, {
    message: "Please enter a valid address.",
  }),
  city: z.string().min(2, {
    message: "Please enter a city.",
  }),
  area: z.string().min(2, {
    message: "Please enter an area or neighborhood.",
  }),
  contact_phone: z.string().min(10, {
    message: "Please enter a valid phone number.",
  }),
  contact_email: z.string().email({
    message: "Please enter a valid email address.",
  }).optional(),
  website: z.string().url({
    message: "Please enter a valid URL.",
  }).optional(),
  instagram: z.string().optional(),
  whatsapp: z.string().optional(),
  tags: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
});

export type BusinessFormValues = z.infer<typeof businessFormSchema>;

const defaultValues: Partial<BusinessFormValues> = {
  price_unit: "per hour",
  experience: "",
  description: "",
  website: "",
  whatsapp: "",
  instagram: "",
  tags: [],
  languages: [],
};

interface AddBusinessFormProps {
  businessData?: BusinessFormValues & { id?: string };
  onSaved?: () => void;
}

const AddBusinessForm = ({ businessData, onSaved }: AddBusinessFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const isEditing = !!businessData?.id;

  const form = useForm<BusinessFormValues>({
    resolver: zodResolver(businessFormSchema),
    defaultValues: {
      name: businessData?.name || '',
      category: businessData?.category || '',
      description: businessData?.description || '',
      price_range_min: businessData?.price_range_min || 0,
      price_range_max: businessData?.price_range_max || 0,
      price_unit: businessData?.price_unit || 'per service',
      contact_phone: businessData?.contact_phone || '',
      contact_email: businessData?.contact_email || '',
      website: businessData?.website || '',
      address: businessData?.address || '',
      city: businessData?.city || '',
      area: businessData?.area || '',
      availability: businessData?.availability || '',
      experience: businessData?.experience || '',
      tags: businessData?.tags || [],
      languages: businessData?.languages || [],
      instagram: businessData?.instagram || '',
      whatsapp: businessData?.whatsapp || '',
    },
    mode: "onChange",
  });

  const onSubmit = async (data: BusinessFormValues) => {
    setIsSubmitting(true);
    
    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "You must be logged in to create or edit a service listing.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      if (isEditing) {
        // Update existing business
        const { error } = await supabase
          .from('service_providers')
          .update({
            name: data.name,
            category: data.category,
            price_range_min: data.price_range_min,
            price_range_max: data.price_range_max,
            price_unit: data.price_unit,
            availability: data.availability,
            description: data.description,
            experience: data.experience,
            address: data.address,
            city: data.city,
            area: data.area,
            contact_phone: data.contact_phone,
            contact_email: data.contact_email,
            website: data.website,
            instagram: data.instagram,
            updated_at: new Date().toISOString(),
          })
          .eq('id', businessData.id)
          .eq('user_id', user.id);

        if (error) {
          console.error("Error updating business:", error);
          toast({
            title: "Error",
            description: "There was an error updating your listing. Please try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: "Your business listing has been updated successfully!",
          });
          if (onSaved) onSaved();
        }
      } else {
        // Create new business
        const { error } = await supabase
          .from('service_providers')
          .insert({
            user_id: user.id,
            name: data.name,
            category: data.category,
            price_range_min: data.price_range_min,
            price_range_max: data.price_range_max,
            price_unit: data.price_unit,
            availability: data.availability,
            description: data.description,
            experience: data.experience,
            address: data.address,
            city: data.city,
            area: data.area,
            contact_phone: data.contact_phone,
            contact_email: data.contact_email,
            website: data.website,
            instagram: data.instagram,
          });

        if (error) {
          console.error("Error submitting form:", error);
          toast({
            title: "Error",
            description: "There was an error creating your listing. Please try again.",
            variant: "destructive",
          });
        } else {
          form.reset();
          setShowSuccessDialog(true);
          if (onSaved) onSaved();
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "There was an error with your submission. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <BasicInfoSection />
            <LocationSection />
            <ContactSection />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting 
              ? isEditing ? "Updating..." : "Submitting..." 
              : isEditing ? "Update Business/Service" : "Save Business/Service"
            }
          </Button>
        </form>
      </Form>

      <SuccessDialog 
        open={showSuccessDialog} 
        onOpenChange={setShowSuccessDialog} 
      />
    </>
  );
};

export default AddBusinessForm;
