
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Event } from '@/hooks/useRecommendations';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

import { BasicEventInfo } from '@/components/event-form/BasicEventInfo';
import { ContactInfo } from '@/components/event-form/ContactInfo';
import { EventDetails } from '@/components/event-form/EventDetails';
import { ImageUploadSection } from '@/components/event-form/ImageUploadSection';
import { FormActions } from '@/components/event-form/FormActions';
import { eventSchema, EventFormValues } from '@/components/event-form/types';

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
      // Extract primary image for the main image field
      const mainImage = data.images[0];
      
      // Prepare the event data
      const eventData = {
        title: data.title,
        date: data.date,
        time: data.time,
        location: data.location,
        description: data.description,
        image: mainImage,
        attendees: data.attendees || 0,
        price_per_person: data.pricePerPerson || 0, // Map from our interface property to database column
        phoneNumber: data.phoneNumber,
        whatsappNumber: data.whatsappNumber
      };
      
      // Insert or update in Supabase
      let result;
      
      if (eventData) {
        // Update existing event
        result = await supabase
          .from('events')
          .update(eventData)
          .eq('id', eventData.id);
      } else {
        // Create new event
        result = await supabase
          .from('events')
          .insert(eventData);
      }
      
      if (result.error) {
        throw result.error;
      }

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
          <BasicEventInfo form={form} />
          <ContactInfo form={form} handlePhoneInput={handlePhoneInput} />
          <EventDetails form={form} />
          <ImageUploadSection form={form} />
          <FormActions 
            loading={loading} 
            isEditing={!!eventData} 
            onCancel={onCancel} 
          />
        </form>
      </Form>
    </div>
  );
};

export default EventListingForm;
