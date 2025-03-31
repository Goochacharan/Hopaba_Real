
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
import { Store, FileText, PencilRuler, Medal, Tag } from 'lucide-react';
import { BusinessFormValues } from '../AddBusinessForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const categories = [
  "Accountant",
  "Actor/Actress",
  "Architect",
  "Artist",
  "Bartender",
  "Blacksmith",
  "Carpenter",
  "Chef/Cook",
  "Choreographer",
  "Dentist",
  "Doctor",
  "Electrician",
  "Fashion Designer",
  "Financial Analyst",
  "Graphic Designer",
  "Hair Stylist/Barber",
  "Hotel Manager",
  "Human Resources Manager",
  "Journalist",
  "Lawyer",
  "Marketing Manager",
  "Mechanic",
  "Model",
  "Musician",
  "Nurse",
  "Painter",
  "Pharmacist",
  "Photographer",
  "Physiotherapist",
  "Plumber",
  "Professor",
  "Researcher",
  "Salesperson",
  "Surgeon",
  "Tailor",
  "Teacher",
  "Tutor",
  "Veterinarian",
  "Waiter/Waitress",
  "Writer",
  "Yoga Instructor",
  "Fitness Trainer",
  "Restaurant",
  "Cafe",
  "Hotel",
  "Gym",
  "Salon",
  "Spa",
  "Other"
];

const BasicInfoSection = () => {
  const form = useFormContext<BusinessFormValues>();
  const [newTag, setNewTag] = useState('');
  
  // Get the tags field array from the form
  const tags = form.watch('tags') || [];
  
  const handleAddTag = () => {
    if (newTag && !tags.includes(newTag)) {
      const updatedTags = [...tags, newTag];
      form.setValue('tags', updatedTags);
      setNewTag('');
    }
  };
  
  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    form.setValue('tags', updatedTags);
  };

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
              <SelectContent className="max-h-[300px]">
                {categories.map((category) => (
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

      <FormField
        control={form.control}
        name="tags"
        render={() => (
          <FormItem className="md:col-span-2">
            <FormLabel className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Services/Items Offered (Tags)
            </FormLabel>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button 
                    type="button" 
                    onClick={() => handleRemoveTag(tag)}
                    className="rounded-full h-4 w-4 inline-flex items-center justify-center text-xs hover:bg-destructive/20"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add service or item (e.g. Hair Cut, Ice Cream)"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <Button 
                type="button" 
                onClick={handleAddTag}
                variant="outline"
              >
                Add
              </Button>
            </div>
            <FormDescription>
              Add at least 3 tags describing services or items you offer (e.g., Hair Cut, Ice Cream, Sandwich)
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default BasicInfoSection;
