
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, Clock, MapPin, Users, IndianRupee, Phone, MessageCircle } from 'lucide-react';
import { Event } from '@/hooks/useRecommendations';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ImageUpload } from '@/components/ui/image-upload';

const eventSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  date: z.string().min(1, { message: "Date is required" }),
  time: z.string().min(1, { message: "Time is required" }),
  location: z.string().min(3, { message: "Location is required" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  images: z.array(z.string()).min(1, { message: "At least one image is required" }),
  phoneNumber: z.string()
    .regex(/^\+91\d{10}$/, { message: "Please enter a valid 10-digit phone number with +91 prefix" }),
  whatsappNumber: z.string()
    .regex(/^\+91\d{10}$/, { message: "Please enter a valid 10-digit WhatsApp number with +91 prefix" }),
  attendees: z.number().min(0, { message: "Number of attendees cannot be negative" }).optional(),
  pricePerPerson: z.number().min(0, { message: "Price cannot be negative" })
});

type EventFormValues = z.infer<typeof eventSchema>;

interface EventListingFormProps {
  eventData?: Event;
  onSaved: () => void;
  onCancel?: () => void;
}

const EventListingForm: React.FC<EventListingFormProps> = ({ 
  eventData, 
  onSaved, 
  onCancel 
}) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: eventData ? {
      ...eventData,
      images: eventData.image ? [eventData.image] : [],
      phoneNumber: eventData.phoneNumber || '+91',
      whatsappNumber: eventData.whatsappNumber || '+91',
      pricePerPerson: eventData.pricePerPerson || 0,
      attendees: eventData.attendees || 0
    } : {
      title: '',
      date: '',
      time: '',
      location: '',
      description: '',
      images: [],
      phoneNumber: '+91',
      whatsappNumber: '+91',
      attendees: 0,
      pricePerPerson: 0
    }
  });

  const onSubmit = async (data: EventFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to create or edit events",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Save event (this is a placeholder - you'd implement the actual saving logic)
      // In a real app, you would save to the database via Supabase
      console.log("Event data to save:", data);

      toast({
        title: "Success!",
        description: eventData ? "Event updated successfully" : "Event created successfully"
      });
      
      onSaved();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save event",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'phoneNumber' | 'whatsappNumber') => {
    let value = e.target.value;
    
    if (!value.startsWith('+91')) {
      value = '+91' + value.replace('+91', '');
    }
    
    // Extract digits after +91
    const digits = value.slice(3).replace(/\D/g, '');
    
    // Limit to 10 digits
    const limitedDigits = digits.slice(0, 10);
    
    // Set the value back with +91 prefix
    form.setValue(fieldName, '+91' + limitedDigits, {
      shouldValidate: true,
    });
  };

  return (
    <div className="space-y-6">
      {!user && (
        <Alert variant="destructive">
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You must be logged in to create or edit events.
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter event title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Date *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input placeholder="e.g., July 15, 2023" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Time *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input placeholder="e.g., 10:00 AM - 2:00 PM" className="pl-10" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input placeholder="Enter event location" className="pl-10" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input 
                          placeholder="+91xxxxxxxxxx" 
                          className="pl-10"
                          {...field}
                          onChange={(e) => handlePhoneInput(e, 'phoneNumber')}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>Enter your contact number with +91 prefix</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whatsappNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp Number *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MessageCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input 
                          placeholder="+91xxxxxxxxxx" 
                          className="pl-10"
                          {...field}
                          onChange={(e) => handlePhoneInput(e, 'whatsappNumber')}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>Enter your WhatsApp number with +91 prefix</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pricePerPerson"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Per Person (₹) *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input 
                          type="number" 
                          min="0"
                          placeholder="0" 
                          className="pl-10"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>Enter price in Rupees (0 for free events)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="attendees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Attendees</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input 
                          type="number" 
                          min="0"
                          placeholder="0" 
                          className="pl-10"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>Number of people already attending</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Images *</FormLabel>
                  <FormControl>
                    <ImageUpload 
                      images={field.value} 
                      onImagesChange={(images) => field.onChange(images)}
                      maxImages={5}
                    />
                  </FormControl>
                  <FormDescription>Upload up to 5 images for your event</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Description *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your event..." 
                      className="min-h-[120px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-3 justify-end">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : eventData ? "Update Event" : "Create Event"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default EventListingForm;
