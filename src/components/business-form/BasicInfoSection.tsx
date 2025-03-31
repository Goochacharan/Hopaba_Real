
import React, { useState, useEffect } from 'react';
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
import { Briefcase, BarChart4, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BusinessFormValues } from '../AddBusinessForm';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const BasicInfoSection = () => {
  const form = useFormContext<BusinessFormValues>();
  const [newTag, setNewTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  
  const handleAddTag = () => {
    if (!newTag.trim() || tags.includes(newTag.trim())) return;
    
    const updatedTags = [...tags, newTag.trim()];
    setTags(updatedTags);
    form.setValue('tags', updatedTags, { shouldValidate: true });
    setNewTag('');
  };
  
  const handleRemoveTag = (tag: string) => {
    const updatedTags = tags.filter(t => t !== tag);
    setTags(updatedTags);
    form.setValue('tags', updatedTags, { shouldValidate: true });
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTag.trim()) {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  useEffect(() => {
    // Initialize tags when form values change
    const formTags = form.getValues('tags');
    if (formTags && Array.isArray(formTags) && formTags.length > 0) {
      setTags(formTags);
    }
  }, [form]);
  
  const categories = [
    { value: "Food", label: "Food" },
    { value: "Home Services", label: "Home Services" },
    { value: "Fitness", label: "Fitness" },
    { value: "Education", label: "Education" },
    { value: "Beauty", label: "Beauty" },
    { value: "Entertainment", label: "Entertainment" },
    { value: "Fashion", label: "Fashion" },
    { value: "Health", label: "Health" },
    { value: "Transport", label: "Transport" },
    { value: "Technology", label: "Technology" },
    { value: "Finance", label: "Finance" },
    { value: "Legal", label: "Legal" },
    { value: "Other", label: "Other" }
  ];
  
  const availabilityOptions = [
    { value: "24/7", label: "Available 24/7" },
    { value: "Weekdays", label: "Weekdays Only" },
    { value: "Weekends", label: "Weekends Only" },
    { value: "Evenings", label: "Evening Hours Only" },
    { value: "By Appointment", label: "By Appointment Only" },
    { value: "Custom", label: "Custom Schedule" }
  ];

  const priceUnitOptions = [
    { value: "per hour", label: "Per Hour" },
    { value: "per day", label: "Per Day" },
    { value: "per month", label: "Per Month" },
    { value: "per project", label: "Per Project" },
    { value: "per service", label: "Per Service" },
    { value: "per person", label: "Per Person" },
    { value: "one time", label: "One Time" }
  ];
  
  return (
    <>
      <div className="space-y-6 md:col-span-2">
        <h3 className="text-lg font-medium flex items-center gap-2 mt-4">
          <Briefcase className="h-5 w-5 text-primary" />
          Basic Information
        </h3>
      </div>
      
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>Business Name*</FormLabel>
            <FormControl>
              <Input placeholder="Enter your business name" {...field} />
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
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
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
                placeholder="Describe your business, services, and what makes you unique" 
                className="min-h-32" 
                {...field} 
              />
            </FormControl>
            <FormDescription>
              Include key details about your services, expertise, and what makes your business stand out
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="tags"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Popular Items/Services*
              </div>
            </FormLabel>
            <FormControl>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add key items or services (e.g., Haircut, Pasta, Tax Filing)"
                    value={newTag}
                    onChange={e => setNewTag(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleAddTag}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags && tags.map(tag => (
                    <Badge
                      key={tag} 
                      variant="secondary" 
                      className="flex items-center gap-1 py-1.5"
                    >
                      {tag}
                      <button 
                        type="button" 
                        className="ml-1 hover:text-destructive" 
                        onClick={() => handleRemoveTag(tag)}
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </FormControl>
            <FormDescription>
              Add at least 3 popular items or services that you offer
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="space-y-6 md:col-span-2">
        <h3 className="text-lg font-medium flex items-center gap-2 mt-4">
          <BarChart4 className="h-5 w-5 text-primary" />
          Pricing & Availability
        </h3>
      </div>
      
      <FormField
        control={form.control}
        name="price_range_min"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Minimum Price (₹)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="0" 
                min="0" 
                {...field} 
                onChange={(e) => {
                  const value = e.target.value === '' ? undefined : Number(e.target.value);
                  field.onChange(value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="price_range_max"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Maximum Price (₹)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="10000" 
                min="0" 
                {...field} 
                onChange={(e) => {
                  const value = e.target.value === '' ? undefined : Number(e.target.value);
                  field.onChange(value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="price_unit"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Price Unit</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || "per hour"}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a price unit" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {priceUnitOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="availability"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Availability</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || "By Appointment"}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {availabilityOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default BasicInfoSection;
