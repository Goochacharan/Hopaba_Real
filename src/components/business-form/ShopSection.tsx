
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormDescription, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Phone, MessageCircle, Instagram, Globe, Mail } from 'lucide-react';
import { BusinessFormValues } from '../AddBusinessForm';

const ShopSection = () => {
  const form = useFormContext<BusinessFormValues>();

  return (
    <div className="bg-white rounded-lg border p-4 shadow-sm">
      <h3 className="text-lg font-medium mb-4">Shop Information</h3>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="shop_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shop Name*</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., Premium Auto Dealers"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                The name of your shop/dealership
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="shop_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shop Type*</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select shop type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="car_dealership">Car Dealership</SelectItem>
                  <SelectItem value="car_rental">Car Rental</SelectItem>
                  <SelectItem value="service_center">Service Center</SelectItem>
                  <SelectItem value="spare_parts">Spare Parts</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                The type of shop/business you operate
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Separator className="my-2" />
        
        <FormField
          control={form.control}
          name="established"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Year Established</FormLabel>
              <FormControl>
                <Input 
                  type="number"
                  placeholder="e.g., 2010"
                  {...field}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (!isNaN(value) && value > 1900 && value <= new Date().getFullYear()) {
                      field.onChange(value);
                    } else if (e.target.value === '') {
                      field.onChange('');
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="shop_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shop Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Tell us about your shop, specialization, etc."
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Separator className="my-3" />
        
        {/* Contact Information Section */}
        <div className="mb-2">
          <h4 className="text-md font-medium flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" />
            Contact Information
          </h4>
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
              <FormLabel>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </div>
              </FormLabel>
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
              <FormLabel>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Website
                </div>
              </FormLabel>
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
    </div>
  );
};

export default ShopSection;
