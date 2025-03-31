
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
            <FormLabel>Business/Service Name*</FormLabel>
            <FormControl>
              <Input placeholder="Enter business or service name" {...field} />
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
                <SelectItem value="Actor">Actor</SelectItem>
                <SelectItem value="Painter">Painter</SelectItem>
                <SelectItem value="Musician">Musician</SelectItem>
                <SelectItem value="Photographer">Photographer</SelectItem>
                <SelectItem value="Therapist">Therapist</SelectItem>
                <SelectItem value="Tutor">Tutor</SelectItem>
                <SelectItem value="Yoga Instructor">Yoga Instructor</SelectItem>
                <SelectItem value="Fitness Trainer">Fitness Trainer</SelectItem>
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
                className="resize-none min-h-32"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Briefly describe your business, service, or professional background.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="price_unit"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Pricing Unit</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value || "per hour"}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select pricing unit" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="per hour">Per Hour</SelectItem>
                <SelectItem value="per session">Per Session</SelectItem>
                <SelectItem value="per person">Per Person</SelectItem>
                <SelectItem value="per day">Per Day</SelectItem>
                <SelectItem value="per month">Per Month</SelectItem>
                <SelectItem value="fixed">Fixed Price</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              How you charge for your services
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="experience"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Experience</FormLabel>
            <FormControl>
              <Input placeholder="Years of experience" {...field} />
            </FormControl>
            <FormDescription>
              How many years of experience you have
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default BasicInfoSection;
