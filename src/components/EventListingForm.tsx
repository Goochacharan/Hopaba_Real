import React, { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card } from '@/components/ui/card';
import { Loader2, Save, X, Map } from 'lucide-react';
import { Calendar } from "@/components/ui/calendar"
import { CalendarIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from 'date-fns';
import { ImageUpload } from '@/components/ui/image-upload';
import { Separator } from '@/components/ui/separator';
import { extractCoordinatesFromMapLink } from '@/lib/locationUtils';

const eventFormSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  description: z.string().min(20, { message: "Description must be at least 20 characters" }),
  date: z.string().min(1, { message: "Date is required" }),
  time: z.string().min(1, { message: "Time is required" }),
  location: z.string().min(5, { message: "Location must be at least 5 characters" }),
  image: z.string().min(1, { message: "Image is required" }),
  map_link: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  postal_code: z.string().optional(),
  city: z.string().optional(),
  area: z.string().optional(),
  attendees: z.coerce.number().optional(),
  price_per_person: z.coerce.number().optional(),
});

type EventFormData = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  event?: any;
  onSaved: () => void;
  onCancel?: () => void;
}

export const EventListingForm = ({ event, onSaved, onCancel }: EventFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Date | undefined>(event ? new Date(event.date) : undefined);

  const defaultValues: Partial<EventFormData> = {
    title: event?.title || '',
    description: event?.description || '',
    date: event?.date || '',
    time: event?.time || '',
    location: event?.location || '',
    image: event?.image || '',
    map_link: event?.map_link || '',
    latitude: event?.latitude || '',
    longitude: event?.longitude || '',
    postal_code: event?.postal_code || '',
    city: event?.city || '',
    area: event?.area || '',
    attendees: event?.attendees || 0,
    price_per_person: event?.price_per_person || 0,
  };

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues,
    mode: "onBlur",
  });

  useEffect(() => {
    const mapLink = form.watch('map_link');
    if (mapLink) {
      const coords = extractCoordinatesFromMapLink(mapLink);
      if (coords) {
        form.setValue('latitude', coords.lat.toString());
        form.setValue('longitude', coords.lng.toString());
      }
    }
  }, [form.watch('map_link')]);

  const handleImageChange = useCallback((images: string[]) => {
    form.setValue('image', images[0], { shouldValidate: true });
  }, [form]);

  const handleSubmit = async (data: EventFormData) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to post events.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const eventPayload = {
        title: data.title,
        date: data.date,
        time: data.time,
        location: data.location,
        description: data.description,
        image: data.image,
        map_link: data.map_link || null,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        postal_code: data.postal_code || null,
        city: data.city || null,
        area: data.area || null,
        attendees: data.attendees || 0,
        price_per_person: data.price_per_person || 0,
        approval_status: 'pending',
        user_id: user.id
      };

      console.log("Submitting event with user_id:", user.id);

      if (event) {
        const { error } = await supabase
          .from('events')
          .update(eventPayload)
          .eq('id', event.id)
          .eq('user_id', user.id);

        if (error) throw error;
        
        toast({
          title: "Event Updated",
          description: "Your event has been updated and will be reviewed by an admin.",
        });
      } else {
        const { error } = await supabase
          .from('events')
          .insert(eventPayload);

        if (error) throw error;
        
        toast({
          title: "Event Created",
          description: "Your event has been created and will be reviewed by an admin.",
        });
      }

      onSaved();
    } catch (error: any) {
      console.error('Error saving event:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save event. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
                        placeholder="Describe your event, include details about the performers, activities, etc."
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
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location*</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Central Park, New York" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Bengaluru" {...field} />
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
                      <FormLabel>Area/Neighborhood</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Indiranagar" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="attendees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Attendees (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="1" placeholder="e.g. 1000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price_per_person"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Per Person (Optional)</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" step="100" placeholder="e.g. 100" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date*</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-[240px] pl-3 text-left font-normal",
                              !date && "text-muted-foreground"
                            )}
                          >
                            {date ? format(date, "PPP") : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={(newDate) => {
                            setDate(newDate);
                            if (newDate) {
                              field.onChange(format(newDate, "yyyy-MM-dd"));
                            }
                          }}
                          disabled={(date) =>
                            date < new Date()
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time*</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
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
                      <Input placeholder="Paste Google Maps link here" {...field} />
                    </FormControl>
                    <FormDescription>
                      Add a Google Maps link to help attendees find your event
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator className="my-2" />

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Map className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-medium">Geographic Coordinates</h3>
                </div>

                <FormDescription className="mt-0">
                  These coordinates help display your event accurately on the map. They'll be automatically filled if you provide a Google Maps link.
                </FormDescription>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="latitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Latitude</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 12.9716" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="longitude"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Longitude</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 77.5946" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="postal_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal/ZIP Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter postal code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image*</FormLabel>
                    <FormControl>
                      <ImageUpload
                        images={field.value ? [field.value] : []}
                        onImagesChange={handleImageChange}
                        maxImages={1}
                      />
                    </FormControl>
                    <FormDescription>
                      Upload an image for your event.
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
    </Card>
  );
};
