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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Store, FileText, PencilRuler, Medal } from 'lucide-react';
import { BusinessFormValues } from '../AddBusinessForm';

const BasicInfoSection = () => {
  const form = useFormContext<BusinessFormValues>();

  return (
    <>
      <div className="space-y-6 md:col-span-2">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Store className="h-5 w-5 text-primary" />
          Basic Information
        </h3>
        <p className="text-sm text-muted-foreground">
          Provide essential details about your business or service.
        </p>
      </div>

      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Business Name*</FormLabel>
            <FormControl>
              <Input placeholder="Enter business name" {...field} />
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
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Restaurant">Restaurant</SelectItem>
                <SelectItem value="Cafe">Cafe</SelectItem>
                <SelectItem value="Hotel">Hotel</SelectItem>
                <SelectItem value="Gym">Gym</SelectItem>
                <SelectItem value="Salon">Salon</SelectItem>
                <SelectItem value="Spa">Spa</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>Description*</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Enter business description"
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Briefly describe your business and what it offers.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default BasicInfoSection;
