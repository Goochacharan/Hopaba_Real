
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
                <span>Instagram</span>
                <span 
                  className="rounded-full border-2 border-transparent bg-white p-1 shadow-sm"
                  style={{ 
                    backgroundImage: 'linear-gradient(#fff, #fff), linear-gradient(to right, #fa7e1e, #d62976, #962fbf)',
                    backgroundOrigin: 'border-box',
                    backgroundClip: 'content-box, border-box' 
                  }}
                >
                  <Film className="h-4 w-4 text-[#962fbf]" />
                </span>
              </div>
            </FormLabel>
            <FormControl>
              <Input
                placeholder="@yourusername or full URL"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Add your Instagram username or full profile URL to showcase your video content
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default ContactSection;
