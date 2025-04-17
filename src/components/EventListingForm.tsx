import React, { useState, useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card } from '@/components/ui/card';
import { Loader2, Save, X, CalendarClock, MapPin, Link2, ImagePlus } from 'lucide-react';
import { Event } from '@/hooks/useRecommendations';
import { ImageUpload } from '@/components/ui/image-upload';
import { Separator } from '@/components/ui/separator';

const eventListingSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  description: z.string().min(20, { message: "Description must be at least 20 characters" }),
  category: z.string().min(1, { message: "Category is required" }),
  location_name: z.string().min(2, { message: "Location name is required" }),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  event_date: z.string().min(1, { message: "Event date is required" }),
  start_time: z.string().min(1, { message: "Start time is required" }),
  end_time: z.string().min(1, { message: "End time is required" }),
  map_link: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  images: z.array(z.string()).optional(),
});

type EventListingFormData = z.infer<typeof eventListingSchema>;

interface EventListingFormProps {
  event?: Event;
  onSaved: () => void;
  onCancel?: () => void;
}

const EventListingForm: React.FC<EventListingFormProps> = ({ 
  event, 
  onSaved,
  onCancel
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const defaultValues: Partial<EventListingFormData> = {
    title: event?.title || '',
    description: event?.description || '',
    category: event?.category || '',
    location_name: event?.location_name || '',
    address: event?.address || '',
    event_date: event?.event_date || '',
    start_time: event?.start_time || '',
    end_time: event?.end_time || '',
    map_link: event?.map_link || '',
    latitude: event?.latitude || '',
    longitude: event?.longitude || '',
    images: event?.images || [],
  };

  const form = useForm<EventListingFormData>({
    resolver: zodResolver(eventListingSchema),
    defaultValues,
    mode: "onBlur",
  });

  const onSubmit = async (data: EventListingFormData) => {
    setIsSubmitting(true);

    try {
      const eventData = {
        title: data.title,
        description: data.description,
        category: data.category,
        location_name: data.location_name,
        address: data.address,
        event_date: data.event_date,
        start_time: data.start_time,
        end_time: data.end_time,
        map_link: data.map_link || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        images: data.images || [],
      };

      // Simulate saving the event
      console.log('Event data to save:', eventData);
      
      // After successful save
      onSaved();
    } catch (err) {
      console.error('Error saving event listing:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <FormProvider {...form}>
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
                        <Input placeholder="e.g. Summer Music Festival" {...field} />
                      </FormControl>
                      <FormDescription>
                        A clear, concise title for your event
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
                          placeholder="Describe your event, include details about performers, activities, etc." 
                          className="min-h-[120px]" 
                          {...field} 
                        />
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
                          <SelectItem value="music">Music</SelectItem>
                          <SelectItem value="sports">Sports</SelectItem>
                          <SelectItem value="arts">Arts & Culture</SelectItem>
                          <SelectItem value="food">Food & Drink</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location Name*</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Central Park" {...field} />
                      </FormControl>
                      <FormDescription>
                        The name of the event location
                      </FormDescription>
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
                        <Input placeholder="e.g. 123 Main St, New York" {...field} />
                      </FormControl>
                      <FormDescription>
                        The street address of the event
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="event_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <div className="flex items-center gap-2">
                          <CalendarClock className="h-4 w-4" />
                          Event Date*
                        </div>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        The date the event will take place
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time*</FormLabel>
                        <FormControl>
                          <Input 
                            type="time"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="end_time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time*</FormLabel>
                        <FormControl>
                          <Input 
                            type="time"
                            {...field}
                          />
                        </FormControl>
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
                        Add a Google Maps link for precise location and directions
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        <div className="flex items-center gap-2">
                          <ImagePlus className="h-4 w-4" />
                          Images (Optional)
                        </div>
                      </FormLabel>
                      <FormControl>
                        <ImageUpload 
                          images={field.value || []}
                          onImagesChange={(images) => form.setValue('images', images)}
                          maxImages={5}
                        />
                      </FormControl>
                      <FormDescription>
                        Upload up to 5 images of your event
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
                    <Save className="mr-2 h-4 w-4" /> {event ? 'Update Event' : 'Create Event'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </FormProvider>
    </Card>
  );
};

export default EventListingForm;
