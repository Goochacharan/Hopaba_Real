
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
} from '@/components/ui/select';
import { Briefcase, PenSquare, Tag, IndianRupee } from 'lucide-react';
import { BusinessFormValues } from '../AddBusinessForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Define the categories
const BUSINESS_CATEGORIES = [
  'Home Services',
  'Food & Beverages',
  'Beauty & Wellness',
  'Arts & Crafts',
  'Education',
  'Professional Services',
  'Tech Services',
  'Health & Fitness',
  'Event Planning',
  'Transportation',
  'Retail Shop',
  'Travel & Tourism',
  'Entertainment',
  'Children Services',
  'Tutoring',
  'Fashion',
  'Photography',
  'Pet Services',
  'Legal Services',
  'Financial Services',
  'Other'
];

const BasicInfoSection = () => {
  const form = useFormContext<BusinessFormValues>();
  const [tags, setTags] = React.useState<string[]>(form.getValues('tags') || []);
  const [tagInput, setTagInput] = React.useState('');

  React.useEffect(() => {
    // Set form tags whenever tags state changes
    form.setValue('tags', tags, { shouldValidate: true });
  }, [tags, form]);

  React.useEffect(() => {
    // Initialize tags when form values change
    const formTags = form.getValues('tags');
    if (formTags && formTags.length > 0) {
      setTags(formTags);
    }
  }, [form]);

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      const newTags = [...tags, tagInput.trim()];
      setTags(newTags);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <>
      <div className="space-y-6 md:col-span-2">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-primary" />
          Basic Information
        </h3>
        <p className="text-sm text-muted-foreground">
          Provide details about your business to help others find and understand your services.
        </p>
      </div>

      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>Business Name*</FormLabel>
            <FormControl>
              <Input 
                placeholder="Enter your business name" 
                {...field} 
              />
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
                {BUSINESS_CATEGORIES.map((category) => (
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
                placeholder="Describe your business, services, and what makes you unique" 
                className="min-h-32" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="price_range_min"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <div className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4" />
                Min Price
              </div>
            </FormLabel>
            <FormControl>
              <Input 
                type="number"
                min="0"
                placeholder="Min price (₹)" 
                {...field}
                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
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
            <FormLabel>
              <div className="flex items-center gap-2">
                <IndianRupee className="h-4 w-4" />
                Max Price
              </div>
            </FormLabel>
            <FormControl>
              <Input 
                type="number"
                min="0"
                placeholder="Max price (₹)" 
                {...field}
                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
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
            <Select
              value={field.value || "per hour"}
              onValueChange={field.onChange}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select price unit" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="per hour">per hour</SelectItem>
                <SelectItem value="per day">per day</SelectItem>
                <SelectItem value="per session">per session</SelectItem>
                <SelectItem value="per month">per month</SelectItem>
                <SelectItem value="fixed price">fixed price</SelectItem>
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
            <Select
              value={field.value || ""}
              onValueChange={field.onChange}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select availability" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="Weekdays only">Weekdays only</SelectItem>
                <SelectItem value="Weekends only">Weekends only</SelectItem>
                <SelectItem value="All days">All days</SelectItem>
                <SelectItem value="By appointment">By appointment</SelectItem>
                <SelectItem value="Evenings only">Evenings only</SelectItem>
                <SelectItem value="Mornings only">Mornings only</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="tags"
        render={() => (
          <FormItem className="md:col-span-2">
            <FormLabel>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Services/Products Tags
              </div>
            </FormLabel>
            <div className="flex items-center space-x-2">
              <FormControl>
                <Input 
                  placeholder="Add services or products (e.g., 'Home Cleaning', 'Pizza')" 
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1"
                />
              </FormControl>
              <Button 
                type="button" 
                onClick={addTag}
                variant="secondary"
                size="sm"
              >
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="outline"
                  className="flex items-center gap-1 px-2 py-1"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-xs rounded-full hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            {tags.length < 3 && (
              <p className="text-sm mt-1 text-amber-500">
                Please add at least 3 tags describing your services or items.
              </p>
            )}
            <FormMessage />
            <FormDescription>
              Add specific services, items, or keywords that describe what you offer. Add at least 3 tags.
            </FormDescription>
          </FormItem>
        )}
      />
    </>
  );
};

export default BasicInfoSection;
