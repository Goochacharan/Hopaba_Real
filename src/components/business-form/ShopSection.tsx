
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
                <textarea 
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px]"
                  placeholder="Tell us about your shop, specialization, etc."
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default ShopSection;
