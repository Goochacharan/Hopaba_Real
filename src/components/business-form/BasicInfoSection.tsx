
import React, { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tag, X, Plus, Store } from 'lucide-react';
import { BusinessFormValues } from '../AddBusinessForm';

const SERVICE_CATEGORIES = [
  "Education",
  "Healthcare",
  "Food & Dining",
  "Home Services",
  "Beauty & Wellness",
  "Professional Services",
  "Auto Services",
  "Technology",
  "Financial Services",
  "Entertainment",
  "Travel & Transport",
  "Fitness",
  "Real Estate",
  "Retail",
  "Other"
];

const BasicInfoSection = () => {
  const form = useFormContext<BusinessFormValues>();
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    if (tagInput.trim().length === 0) return;
    
    const currentTags = form.getValues('tags') || [];
    
    // Check if tag already exists
    if (!currentTags.includes(tagInput.trim())) {
      form.setValue('tags', [...currentTags, tagInput.trim()]);
    }
    
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags') || [];
    form.setValue(
      'tags',
      currentTags.filter(tag => tag !== tagToRemove)
    );
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <>
      <div className="space-y-6 md:col-span-2">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Store className="h-5 w-5 text-primary" />
          Basic Information
        </h3>
      </div>

      <FormField
        control={form.control}
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
        control={form.control}
        name="category"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Category*</FormLabel>
            <Select
              value={field.value}
              onValueChange={field.onChange}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {SERVICE_CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
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
                placeholder="Describe your business or service" 
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
        name="tags"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags*
              </div>
            </FormLabel>
            <FormDescription>
              Add at least 3 keywords that describe your services or items
            </FormDescription>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {(field.value || []).map(tag => (
                <div key={tag} className="bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center gap-1">
                  <span>{tag}</span>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="h-5 w-5 p-0 rounded-full"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {tag}</span>
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="flex mt-2">
              <Input
                placeholder="Add a tag"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagInputKeyDown}
                className="rounded-r-none"
              />
              <Button 
                type="button" 
                onClick={handleAddTag}
                className="rounded-l-none"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default BasicInfoSection;
