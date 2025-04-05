
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
import { Textarea } from '@/components/ui/textarea';
import { TagsInput } from '@/components/ui/tags-input';
import { ImageUpload } from '@/components/ui/image-upload';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BusinessFormValues } from '../AddBusinessForm';
import { Tag } from 'lucide-react';

interface BasicInfoSectionProps {
  maxImages?: number;
}

export default function BasicInfoSection({ maxImages = 10 }: BasicInfoSectionProps) {
  const { control, setValue, getValues } = useFormContext<BusinessFormValues>();
  
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Basic Information</h3>
      
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Business Name*</FormLabel>
            <FormControl>
              <Input placeholder="Your business name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
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
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="food">Food</SelectItem>
                <SelectItem value="home_services">Home Services</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description*</FormLabel>
            <FormControl>
              <Textarea placeholder="Describe your business or service" className="min-h-[120px]" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="tags"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <div className="flex items-center gap-1.5">
                <Tag className="h-4 w-4" /> 
                Tags* (at least 3)
              </div>
            </FormLabel>
            <FormControl>
              <TagsInput
                placeholder="Type and press enter to add tags"
                tags={field.value || []}
                setTags={(tags) => setValue('tags', tags)}
              />
            </FormControl>
            <FormDescription>
              Keywords that describe your services or products
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={control}
        name="images"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Business Photos</FormLabel>
            <FormControl>
              <ImageUpload
                images={field.value || []}
                onImagesChange={(images) => setValue('images', images, { shouldValidate: true })}
                maxImages={maxImages}
              />
            </FormControl>
            <FormDescription>
              Upload up to {maxImages} photos of your business or service
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
