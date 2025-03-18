import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { 
  ListChecks, 
  Heading, 
  DollarSign, 
  Clock, 
  FileText, 
  Star, 
  MapPin, 
  Phone,
  MessageCircle,
  Image,
  Save,
  StoreIcon,
  Instagram
} from 'lucide-react';

export interface BusinessFormValues {
  name: string;
  category: string;
  description: string;
  price_range_min: number;
  price_range_max: number;
  price_unit: string;
  contact_phone: string;
  contact_email: string;
  website: string;
  address: string;
  city: string;
  area: string;
  availability: string;
  experience: string;
  tags: string[];
  languages: string[];
  instagram: string;
}

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
  whatsapp: z.string().optional(),
  website: z.string().url({
    message: "Please enter a valid URL.",
  }).optional(),
  instagram: z.string().optional(),
});

export type BusinessFormValues = z.infer<typeof businessFormSchema>;

const defaultValues: Partial<BusinessFormValues> = {
  price_unit: "per hour",
  experience: "",
  description: "",
  website: "",
  whatsapp: "",
  instagram: "",
};

const categoryOptions = [
  "Cleaning Services",
  "Home Repairs",
  "Plumbing",
  "Electrical",
  "Landscaping",
  "Tutoring",
  "Personal Training",
  "Child Care",
  "Pet Care",
  "Food Delivery",
  "Transportation",
  "Technology Support",
  "Beauty & Wellness",
  "Legal Services",
  "Financial Services",
  "Event Planning",
  "Photography",
  "Graphic Design",
  "Other"
];

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

  const form = useForm<z.infer<typeof businessFormSchema>>({
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
            <div className="space-y-6 md:col-span-2">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <StoreIcon className="h-5 w-5 text-primary" />
                Basic Information
              </h3>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <div className="flex items-center gap-2">
                      <Heading className="h-4 w-4" />
                      Business/Service Name*
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your business or service name" {...field} />
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
                  <FormLabel>
                    <div className="flex items-center gap-2">
                      <ListChecks className="h-4 w-4" />
                      Category*
                    </div>
                  </FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoryOptions.map((category) => (
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

            <div className="md:col-span-2 grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="price_range_min"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Min Price*
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
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
                    <FormLabel>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Max Price*
                      </div>
                    </FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price_unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Unit</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select price unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="per hour">Per Hour</SelectItem>
                        <SelectItem value="per day">Per Day</SelectItem>
                        <SelectItem value="per service">Per Service</SelectItem>
                        <SelectItem value="per month">Per Month</SelectItem>
                        <SelectItem value="fixed price">Fixed Price</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="availability"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Availability*
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Mon-Fri 9AM-5PM" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Experience
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 5 years of experience" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Description*
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your business or service..." 
                      className="min-h-[120px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Provide details about your business or service (10-500 characters).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-6 md:col-span-2">
              <h3 className="text-lg font-medium flex items-center gap-2 mt-4">
                <MapPin className="h-5 w-5 text-primary" />
                Location Information
              </h3>
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
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

            <div className="space-y-6 md:col-span-2">
              <h3 className="text-lg font-medium flex items-center gap-2 mt-4">
                <Phone className="h-5 w-5 text-primary" />
                Contact Information
              </h3>
            </div>

            <FormField
              control={form.control}
              name="contact_phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number*</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone number" {...field} />
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
                  <FormLabel>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      WhatsApp Number
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter WhatsApp number (if different)" {...field} />
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
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email address" {...field} />
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
                  <FormLabel>Website</FormLabel>
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
                  <FormLabel>
                    <div className="flex items-center gap-2">
                      <Instagram className="h-4 w-4" />
                      Instagram
                    </div>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="@yourusername or full URL"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Add your Instagram username or full profile URL
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
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

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Success!</AlertDialogTitle>
            <AlertDialogDescription>
              Your business/service has been successfully added. It will now be available for others to discover.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSuccessDialog(false)}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AddBusinessForm;
