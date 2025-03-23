
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage,
  FormDescription 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Phone, MessageCircle, Instagram, Film } from 'lucide-react';
import { BusinessFormValues } from '../AddBusinessForm';

const ContactSection = () => {
  const form = useFormContext<BusinessFormValues>();
  
  // Function to handle phone number input validation
  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Ensure the value starts with +91
    if (!value.startsWith('+91')) {
      value = '+91' + value.replace('+91', '');
    }
    
    // Remove all non-digit characters except the +91 prefix
    const digits = value.slice(3).replace(/\D/g, '');
    
    // Limit to 10 digits
    const limitedDigits = digits.slice(0, 10);
    
    // Set the value with +91 prefix and limited digits
    e.target.value = '+91' + limitedDigits;
    
    // Update the form value
    form.setValue('contact_phone', e.target.value, {
      shouldValidate: true,
    });
  };
  
  return (
    <>
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
              <Input 
                placeholder="Enter phone number" 
                {...field}
                defaultValue="+91"
                onInput={handlePhoneInput}
              />
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
                Instagram / Video Content
                <Film className="h-4 w-4 ml-1 text-purple-500" />
              </div>
            </FormLabel>
            <FormControl>
              <Input
                placeholder="@yourusername or full URL"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Add your Instagram username or video content URL
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default ContactSection;
