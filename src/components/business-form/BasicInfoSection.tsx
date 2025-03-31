
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Store, FileText, PencilRuler, Medal, Tag, IndianRupee } from 'lucide-react';
import { BusinessFormValues } from '../AddBusinessForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const categories = [
  "Accountant",
  "Actor/Actress",
  "Architect",
  "Artist",
  "Auto Repair",
  "Bartender",
  "Blacksmith",
  "Car Dealers",
  "Carpenter",
  "Chef/Cook",
  "Choreographer",
  "Computer Repair",
  "Consultant",
  "Contractor",
  "Dentist",
  "Doctor",
  "Dog Shop",
  "Electrician",
  "Event Planning",
  "Fashion Designer",
  "Financial Analyst",
  "Fitness Trainer",
  "Graphic Designer",
  "Hair Salon",
  "Hair Stylist/Barber",
  "Home Cleaning",
  "Hotel Manager",
  "Human Resources Manager",
  "HVAC Services",
  "Ice Cream Shop",
  "Interior Design",
  "IT Services",
  "Journalist",
  "Landscaping",
  "Laser Hair Removal",
  "Lawyer",
  "Legal Services",
  "Marketing Agency",
  "Marketing Manager",
  "Massage Therapy",
  "Mechanic",
  "Medical Spa",
  "Model",
  "Musician",
  "Nail Technician",
  "Nurse",
  "Painter",
  "Pharmacist",
  "Photographer",
  "Physiotherapist",
  "Pizza Shop",
  "Plumber",
  "Pool & Hot Tub Services",
  "Professor",
  "Researcher",
  "Restaurant",
  "Roofing",
  "Salesperson",
  "Salon",
  "Skin Care",
  "Spa",
  "Surgeon",
  "Tailor",
  "Teacher",
  "Towing",
  "Transmission Repair",
  "Travel Agent",
  "Tutor",
  "Vacation Rental",
  "Veterinarian",
  "Videographer",
  "Waiter/Waitress",
  "Wedding Chapel",
  "Weight Loss Center",
  "Windshield Installation & Repair",
  "Writer",
  "Yoga Instructor",
  "Other"
];

// Common price ranges in Rupees
const priceRanges = [
  { min: 100, max: 200 },
  { min: 200, max: 300 },
  { min: 300, max: 500 },
  { min: 500, max: 800 },
  { min: 800, max: 1000 },
  { min: 1000, max: 1500 },
  { min: 1500, max: 2000 },
  { min: 2000, max: 3000 },
  { min: 3000, max: 5000 },
  { min: 5000, max: 10000 },
  { min: 10000, max: 20000 },
  { min: 20000, max: 50000 },
];

const BasicInfoSection = () => {
  const form = useFormContext<BusinessFormValues>();
  const [newTag, setNewTag] = useState('');
  const [customPriceRange, setCustomPriceRange] = useState(false);
  
  // Get the tags field array from the form
  const tags = form.watch('tags') || [];
  const priceRangeMin = form.watch('price_range_min');
  const priceRangeMax = form.watch('price_range_max');
  
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

  const handlePriceRangeSelect = (value: string) => {
    if (value === 'custom') {
      setCustomPriceRange(true);
      return;
    }
    
    setCustomPriceRange(false);
    const [min, max] = value.split('-').map(Number);
    form.setValue('price_range_min', min);
    form.setValue('price_range_max', max);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const getCurrentPriceRangeValue = () => {
    if (customPriceRange) return 'custom';
    if (priceRangeMin === undefined || priceRangeMax === undefined) return '';
    
    // Check if it matches one of our predefined ranges
    const matchingRange = priceRanges.find(
      range => range.min === priceRangeMin && range.max === priceRangeMax
    );
    
    if (matchingRange) {
      return `${matchingRange.min}-${matchingRange.max}`;
    }
    
    // If no match, it's a custom range
    setCustomPriceRange(true);
    return 'custom';
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

      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
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

        <FormItem>
          <FormLabel className="flex items-center gap-2">
            <IndianRupee className="h-4 w-4" />
            Price Range
          </FormLabel>
          <Select
            onValueChange={handlePriceRangeSelect}
            value={getCurrentPriceRangeValue()}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select price range" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {priceRanges.map((range) => (
                <SelectItem key={`${range.min}-${range.max}`} value={`${range.min}-${range.max}`}>
                  {formatPrice(range.min)} ~ {formatPrice(range.max)}
                </SelectItem>
              ))}
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          <FormDescription>
            Your typical price range
          </FormDescription>
        </FormItem>

        {customPriceRange && (
          <>
            <FormField
              control={form.control}
              name="price_range_min"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Price (₹)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="Minimum price" 
                      min={0}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                      value={field.value || ''}
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
                      placeholder="Maximum price" 
                      min={0}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
      </div>

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
