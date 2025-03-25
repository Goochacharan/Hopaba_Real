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
import { ImageUpload } from './ui/image-upload';

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
  availability_days: z.array(z.string()).min(1, {
    message: "Please select at least one day of availability."
  }),
  availability_start_time: z.string().min(1, {
    message: "Please select a start time."
  }),
  availability_end_time: z.string().min(1, {
    message: "Please select an end time."
  }),
  availability: z.string().optional(),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }).max(500, {
    message: "Description must not exceed 500 characters."
  }),
  experience: z.string().optional(),
  address: z.string().min(5, {
    message: "Please enter a valid address.",
  }),
  map_link: z.string().optional(),
  city: z.string().min(2, {
    message: "Please enter a city.",
  }),
  area: z.string().min(2, {
    message: "Please enter an area or neighborhood.",
  }),
  contact_phone: z.string()
    .refine(phone => phone.startsWith('+91'), {
      message: "Phone number must start with +91.",
    })
    .refine(phone => phone.replace(/\D/g, '').length === 12, {
      message: "Please enter a 10-digit phone number (excluding +91).",
    }),
  whatsapp: z.string()
    .refine(phone => phone.startsWith('+91'), {
      message: "WhatsApp number must start with +91.",
    })
    .refine(phone => phone.replace(/\D/g, '').length === 12, {
      message: "Please enter a 10-digit WhatsApp number (excluding +91).",
    }),
  contact_email: z.string().email({
    message: "Please enter a valid email address.",
  }).optional().or(z.literal('')),
  website: z.string().url({
    message: "Please enter a valid URL.",
  }).optional().or(z.literal('')),
  instagram: z.string().optional(),
  tags: z.array(z.string()).min(3, {
    message: "Please add at least 3 popular items or services you offer.",
  }),
  languages: z.array(z.string()).optional(),
  images: z.array(z.string()).min(1, {
    message: "Please upload at least one image.",
  }),
});

export type BusinessFormValues = z.infer<typeof businessFormSchema>;

const defaultValues: Partial<BusinessFormValues> = {
  price_unit: "per hour",
  experience: "",
  description: "",
  website: "",
  whatsapp: "+91",
  instagram: "",
  tags: [],
  languages: [],
  images: [],
  availability_days: [],
  availability_start_time: "9:00 AM",
  availability_end_time: "5:00 PM",
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

  const formatAvailability = (data: BusinessFormValues) => {
    const days = data.availability_days?.join(', ') || '';
    const startTime = data.availability_start_time || '';
    const endTime = data.availability_end_time || '';
    
    return `${days} ${startTime} - ${endTime}`.trim();
  };

  const parseAvailability = (availabilityString: string | undefined) => {
    if (!availabilityString) return { days: [], startTime: '9:00 AM', endTime: '5:00 PM' };

    const allDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const days = allDays.filter(day => 
      availabilityString.toLowerCase().includes(day.toLowerCase())
    );
    
    const timeMatch = availabilityString.match(/(\d+:\d+\s*[AP]M)\s*-\s*(\d+:\d+\s*[AP]M)/i);
    const startTime = timeMatch?.[1]?.trim() || '9:00 AM';
    const endTime = timeMatch?.[2]?.trim() || '5:00 PM';
    
    return { days, startTime, endTime };
  };

  const parsedAvailability = parseAvailability(businessData?.availability);

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
      map_link: businessData?.map_link || '',
      city: businessData?.city || '',
      area: businessData?.area || '',
      availability: businessData?.availability || '',
      availability_days: parsedAvailability.days,
      availability_start_time: parsedAvailability.startTime,
      availability_end_time: parsedAvailability.endTime,
      experience: businessData?.experience || '',
      tags: businessData?.tags || [],
      languages: businessData?.languages || [],
      instagram: businessData?.instagram || '',
      whatsapp: businessData?.whatsapp || '+91',
      images: businessData?.images || [],
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

      const formattedAvailability = formatAvailability(data);

      let distance = null;
      if (data.map_link) {
        distance = "Calculated based on map link";
      }

      if (isEditing) {
        const { error } = await supabase
          .from('service_providers')
          .update({
            name: data.name,
            category: data.category,
            price_range_min: data.price_range_min,
            price_range_max: data.price_range_max,
            price_unit: data.price_unit,
            availability: formattedAvailability,
            availability_days: data.availability_days,
            availability_start_time: data.availability_start_time,
            availability_end_time: data.availability_end_time,
            description: data.description,
            experience: data.experience,
            address: data.address,
            map_link: data.map_link,
            city: data.city,
            area: data.area,
            contact_phone: data.contact_phone,
            contact_email: data.contact_email,
            website: data.website,
            instagram: data.instagram,
            whatsapp: data.whatsapp,
            images: data.images,
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
        const { error } = await supabase
          .from('service_providers')
          .insert({
            user_id: user.id,
            name: data.name,
            category: data.category,
            price_range_min: data.price_range_min,
            price_range_max: data.price_range_max,
            price_unit: data.price_unit,
            availability: formattedAvailability,
            availability_days: data.availability_days,
            availability_start_time: data.availability_start_time,
            availability_end_time: data.availability_end_time,
            description: data.description,
            experience: data.experience,
            address: data.address,
            map_link: data.map_link,
            city: data.city,
            area: data.area,
            contact_phone: data.contact_phone,
            contact_email: data.contact_email,
            website: data.website,
            instagram: data.instagram,
            whatsapp: data.whatsapp,
            images: data.images,
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
            
            <div className="space-y-4 col-span-1 md:col-span-2">
              <h3 className="text-lg font-medium">Images</h3>
              <div className="bg-white p-4 rounded-md shadow-sm border">
                <ImageUpload 
                  images={form.watch('images')}
                  onImagesChange={(images) => form.setValue('images', images, { shouldValidate: true })}
                  maxImages={5}
                />
                {form.formState.errors.images && (
                  <p className="text-sm font-medium text-destructive mt-2">
                    {form.formState.errors.images.message}
                  </p>
                )}
              </div>
            </div>
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
