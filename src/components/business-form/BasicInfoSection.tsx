
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
  SelectValue 
} from '@/components/ui/select';
import { 
  ListChecks, 
  Heading, 
  DollarSign, 
  Clock, 
  FileText, 
  Star,
  StoreIcon 
} from 'lucide-react';
import { BusinessFormValues } from '../AddBusinessForm';

const categoryOptions = [
  "Actress",
  "Animator",
  "Art Director",
  "Beauty & Wellness",
  "Child Care",
  "Cleaning Services",
  "Dance Class",
  "Dancer",
  "Director",
  "Electrical",
  "Event Planning",
  "Fashion Designer",
  "Filmmaker",
  "Financial Services",
  "Food Delivery",
  "Graphic Design",
  "Graphic Designer",
  "Gym",
  "Home Repairs",
  "Illustrator",
  "Interior Designer",
  "Karate Class",
  "Landscaping",
  "Legal Services",
  "Makeup Artist",
  "MMA Class",
  "Model",
  "Music Class",
  "Musician",
  "Painter",
  "Personal Training",
  "Pet Care",
  "Photographer",
  "Photography",
  "Plumbing",
  "Producer",
  "Sculptor",
  "Singer",
  "Technology Support",
  "Transportation",
  "Tutoring",
  "Voice Artist",
  "Writer/Author",
  "Other"
];

const BasicInfoSection = () => {
  const form = useFormContext<BusinessFormValues>();
  
  return (
    <>
      <div className="space-y-6 md:col-span-2">
        <h3 className="text-lg font-medium flex items-center gap-2">
          <StoreIcon className="h-5 w-5 text-primary" />
          Basic Information
        </h3>
      </div>

      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <div className="flex items-center gap-2">
                <Heading className="h-4 w-4" />
                Business/Service Name*
              </div>
            </FormLabel>
            <FormControl>
              <Input placeholder="Enter your business or service name" {...field} />
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
            <FormLabel>
              <div className="flex items-center gap-2">
                <ListChecks className="h-4 w-4" />
                Category*
              </div>
            </FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {categoryOptions.map((category) => (
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

      <div className="md:col-span-2 grid grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="price_range_min"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Min Price*
                </div>
              </FormLabel>
              <FormControl>
                <Input type="number" {...field} />
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
                  <DollarSign className="h-4 w-4" />
                  Max Price*
                </div>
              </FormLabel>
              <FormControl>
                <Input type="number" {...field} />
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
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select price unit" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="per hour">Per Hour</SelectItem>
                  <SelectItem value="per day">Per Day</SelectItem>
                  <SelectItem value="per service">Per Service</SelectItem>
                  <SelectItem value="per month">Per Month</SelectItem>
                  <SelectItem value="fixed price">Fixed Price</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="availability"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Availability*
              </div>
            </FormLabel>
            <FormControl>
              <Input placeholder="e.g., Mon-Fri 9AM-5PM" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="experience"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4" />
                Experience
              </div>
            </FormLabel>
            <FormControl>
              <Input placeholder="e.g., 5 years of experience" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Description*
              </div>
            </FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Describe your business or service..." 
                className="min-h-[120px]" 
                {...field} 
              />
            </FormControl>
            <FormDescription>
              Provide details about your business or service (10-500 characters).
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default BasicInfoSection;
