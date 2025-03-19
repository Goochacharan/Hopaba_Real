
import React, { useState, useEffect } from 'react';
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
import ShopSection from './business-form/ShopSection';
import VehicleDetailsSection from './business-form/VehicleDetailsSection';
import SuccessDialog from './business-form/SuccessDialog';

const businessFormSchema = z.object({
  name: z.string().min(2, {
    message: "Business or vehicle name must be at least 2 characters.",
  }),
  category: z.string().min(1, {
    message: "Please select a category.",
  }),
  price_range_min: z.coerce.number().min(0, {
    message: "Price must be a positive number.",
  }),
  price_range_max: z.coerce.number().optional(),
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
  // Shop details
  shop_name: z.string().optional(),
  shop_type: z.string().optional(),
  established: z.union([z.number(), z.string()]).optional(),
  shop_description: z.string().optional(),
  // Vehicle details
  vehicle_make: z.string().optional(),
  vehicle_model: z.string().optional(),
  vehicle_year: z.union([z.number(), z.string()]).optional(),
  vehicle_color: z.string().optional(),
  vehicle_fuel: z.string().optional(),
  vehicle_transmission: z.string().optional(),
  vehicle_kms: z.union([z.number(), z.string()]).optional(),
}).refine((data) => {
  // If category is Cars, require shop name
  if (data.category === 'Cars' && !data.shop_name) {
    return false;
  }
  return true;
}, {
  message: "Shop name is required for vehicle listings",
  path: ["shop_name"],
}).refine((data) => {
  // If category is Cars, validate vehicle details
  if (data.category === 'Cars') {
    if (!data.vehicle_make || !data.vehicle_model || !data.vehicle_year || 
        !data.vehicle_fuel || !data.vehicle_transmission) {
      return false;
    }
  }
  return true;
}, {
  message: "All required vehicle details must be provided",
  path: ["vehicle_make"],
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
  shop_name: "",
  vehicle_make: "",
  vehicle_model: "",
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
      // Shop details
      shop_name: businessData?.shop_name || '',
      shop_type: businessData?.shop_type || '',
      established: businessData?.established || '',
      shop_description: businessData?.shop_description || '',
      // Vehicle details
      vehicle_make: businessData?.vehicle_make || '',
      vehicle_model: businessData?.vehicle_model || '',
      vehicle_year: businessData?.vehicle_year || '',
      vehicle_color: businessData?.vehicle_color || '',
      vehicle_fuel: businessData?.vehicle_fuel || '',
      vehicle_transmission: businessData?.vehicle_transmission || '',
      vehicle_kms: businessData?.vehicle_kms || '',
    },
    mode: "onChange",
  });

  const category = form.watch('category');
  const isCarsCategory = category === 'Cars';

  useEffect(() => {
    // If category is Cars, update price_unit to be fixed
    if (category === 'Cars') {
      form.setValue('price_unit', 'fixed');
      // Set price_range_max to equal price_range_min for car listings
      const priceMin = form.getValues('price_range_min');
      form.setValue('price_range_max', priceMin);
    }
  }, [category, form]);

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

      // Ensure price_range_max equals price_range_min for car listings
      if (data.category === 'Cars') {
        data.price_range_max = data.price_range_min;
        data.price_unit = 'fixed';
      }

      if (isEditing) {
        // Update existing business
        const { error } = await supabase
          .from('service_providers')
          .update({
            name: data.name,
            category: data.category,
            price_range_min: data.price_range_min,
            price_range_max: data.price_range_max || data.price_range_min,
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
            // Shop/vehicle details
            shop_name: data.shop_name,
            shop_type: data.shop_type,
            shop_description: data.shop_description,
            vehicle_make: data.vehicle_make,
            vehicle_model: data.vehicle_model,
            vehicle_year: data.vehicle_year,
            vehicle_color: data.vehicle_color,
            vehicle_fuel: data.vehicle_fuel,
            vehicle_transmission: data.vehicle_transmission,
            vehicle_kms: data.vehicle_kms,
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
            description: "Your listing has been updated successfully!",
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
            price_range_max: data.price_range_max || data.price_range_min,
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
            // Shop/vehicle details
            shop_name: data.shop_name,
            shop_type: data.shop_type, 
            shop_description: data.shop_description,
            vehicle_make: data.vehicle_make,
            vehicle_model: data.vehicle_model,
            vehicle_year: data.vehicle_year,
            vehicle_color: data.vehicle_color,
            vehicle_fuel: data.vehicle_fuel,
            vehicle_transmission: data.vehicle_transmission,
            vehicle_kms: data.vehicle_kms,
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
          <div className="grid grid-cols-1 gap-6">
            {isCarsCategory && <ShopSection />}
            {isCarsCategory && <VehicleDetailsSection />}
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
              : isEditing ? "Update Listing" : "Save Listing"
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
